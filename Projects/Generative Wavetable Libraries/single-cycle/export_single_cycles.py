#!/usr/bin/env python3
"""
Single-cycle exporter: the formats move's hardware/sampler half.

Takes the palace's three synthesized tables (crystal lattices, Floquet modes,
Shepard centroid) and writes chosen frames as standalone single-cycle WAVs at
three lengths, each one:

  - band-limited when it is shortened (FFT truncation of a periodic cycle,
    so a 2048 -> 256 cut drops the harmonics a 256-sample cycle can't hold
    instead of folding them back),
  - DC-free, peak-normalised to -0.3 dBFS, rotated to start on the steepest
    upward zero crossing (no click on note-on),
  - 16-bit PCM, 44.1 kHz, mono,
  - carrying a `smpl` chunk: one forward loop over the whole cycle, and the
    MIDI root note + pitch fraction that the cycle length plays at, so a
    sampler that reads `smpl` loops and tunes it without being told.

Lengths: 2048 (Serum/Vital single-cycle drop, most software), 600 (the AKWF
convention, 73.5 Hz at 44.1 kHz), 256 (small-memory modules). Which hardware
accepts which is NOT verified here; see BUILD.md.

Run:  /usr/local/bin/python3 export_single_cycles.py
"""

from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "crystal-bravais"))
import clm_writer  # noqa: E402
import generate as crystal  # noqa: E402

SR = 44100
LENGTHS = [2048, 600, 256]
PEAK = 10 ** (-0.3 / 20)
OUT = HERE / "cycles"


# --- shaping -----------------------------------------------------------------

def resample_cycle(cycle: np.ndarray, n: int) -> np.ndarray:
    """Exact periodic resample by FFT; drops harmonics at or above n/2."""
    spec = np.fft.rfft(cycle)
    keep = n // 2  # bins 0..keep-1; Nyquist bin dropped on purpose
    spec = spec[:keep]
    spec[0] = 0.0  # DC out
    full = np.zeros(n // 2 + 1, dtype=complex)
    full[:keep] = spec
    return np.fft.irfft(full, n) * (n / len(cycle))


def crossing(c: np.ndarray, near: float | None = None) -> float:
    """Where an upward zero crossing sits, as a fraction of the cycle.

    Found by linear interpolation on a 16x band-limited upsample. With no
    `near`, the steepest rise; with `near`, the crossing closest to it (so a
    shortened cycle keeps the start its full-length source chose — several
    crossings can rise almost equally steeply, and rounding would otherwise
    pick a different one at each length).
    """
    n, up = len(c), 16
    fine = resample_up(c, n * up)
    fine = np.append(fine, fine[0])  # a crossing can sit on the wrap itself
    ups = np.where((fine[:-1] <= 0) & (fine[1:] > 0))[0]
    if len(ups) == 0:
        return 0.0
    xs = ((ups + fine[ups] / (fine[ups] - fine[ups + 1])) / (n * up)) % 1.0
    if near is None:
        return float(xs[np.argmax(fine[ups + 1] - fine[ups])])
    d = (xs - near + 0.5) % 1.0 - 0.5
    return float(xs[np.argmin(np.abs(d))])


def rotate(c: np.ndarray, x0: float) -> np.ndarray:
    """Shift the cycle so fraction x0 lands on sample 0 (exact, by phase)."""
    n = len(c)
    k = np.arange(n // 2 + 1)
    return np.fft.irfft(np.fft.rfft(c) * np.exp(2j * np.pi * k * x0), n)


def resample_up(c: np.ndarray, m: int) -> np.ndarray:
    spec = np.fft.rfft(c)
    full = np.zeros(m // 2 + 1, dtype=complex)
    full[:len(spec)] = spec
    return np.fft.irfft(full, m) * (m / len(c))


def shape(cycle: np.ndarray, n: int) -> np.ndarray:
    anchor = crossing(resample_cycle(cycle, len(cycle)))
    c = resample_cycle(cycle, n)
    c = rotate(c, crossing(c, near=anchor))
    c = c / np.max(np.abs(c)) * PEAK
    return c


# --- WAV with smpl -----------------------------------------------------------

def root_note(n: int) -> tuple[int, int, float]:
    """MIDI note + smpl pitch fraction for a cycle of n samples at SR."""
    f = SR / n
    midi = 69 + 12 * np.log2(f / 440.0)
    note = int(np.floor(midi))
    frac = midi - note  # 0..1 of a semitone above `note`
    return note, int(round(frac * 2 ** 32)) & 0xFFFFFFFF, f


def chunk(tag: bytes, body: bytes) -> bytes:
    out = tag + struct.pack("<I", len(body)) + body
    return out + (b"\x00" if len(body) % 2 else b"")


def write_single_cycle(c: np.ndarray, path: Path) -> dict:
    n = len(c)
    pcm = np.round(np.clip(c, -1, 1) * 32767).astype("<i2").tobytes()
    fmt = struct.pack("<HHIIHH", 1, 1, SR, SR * 2, 2, 16)
    note, frac, f = root_note(n)
    period_ns = int(round(1e9 / SR))
    smpl = struct.pack(
        "<IIIIIIIII",
        0, 0, period_ns, note, frac, 0, 0, 1, 0,
    ) + struct.pack("<IIIIII", 0, 0, 0, n - 1, 0, 0)  # loop: id, fwd, start, end(inclusive), frac, infinite
    body = b"WAVE" + chunk(b"fmt ", fmt) + chunk(b"smpl", smpl) + chunk(b"data", pcm)
    path.write_bytes(b"RIFF" + struct.pack("<I", len(body)) + body)
    return {"samples": n, "root_midi": note, "root_hz": round(f, 3),
            "cents_above_root": round(frac / 2 ** 32 * 100, 1)}


def read_single_cycle(path: Path) -> tuple[np.ndarray, dict]:
    b = path.read_bytes()
    assert b[:4] == b"RIFF" and b[8:12] == b"WAVE"
    i, out, meta = 12, None, {}
    while i < len(b):
        tag, size = b[i:i + 4], struct.unpack("<I", b[i + 4:i + 8])[0]
        body = b[i + 8:i + 8 + size]
        if tag == b"data":
            out = np.frombuffer(body, "<i2").astype(float) / 32767
        if tag == b"smpl":
            v = struct.unpack("<IIIIIIIII", body[:36])
            lp = struct.unpack("<IIIIII", body[36:60])
            meta = {"root": v[3], "loops": v[7], "loop_start": lp[2], "loop_end": lp[3]}
        i += 8 + size + (size % 2)
    return out, meta


# --- sources -----------------------------------------------------------------

def sources() -> list[tuple[str, str, np.ndarray]]:
    """(set, name, 2048-sample cycle) for every cycle to export."""
    picks = []
    keys = crystal.build_keyframes(samples_per_frame=2048)
    for (name, *_), k in zip(crystal.BRAVAIS_SYSTEMS, keys):
        picks.append(("crystal", name, k))
    for set_name, rel in [("floquet", "floquet-modes/floquet_modes.wav"),
                          ("shepard", "shepard-centroid/shepard_centroid.wav")]:
        frames, _ = clm_writer.read_clm_wav(ROOT / rel)
        idx = np.round(np.linspace(0, len(frames) - 1, 6)).astype(int)
        for j, fi in enumerate(idx):
            pos = fi / (len(frames) - 1)
            picks.append((set_name, f"pos{pos:.2f}".replace(".", "p"), frames[fi].astype(float)))
    return picks


# --- checks ------------------------------------------------------------------

def check(src: np.ndarray, path: Path, n: int) -> dict:
    """Read back; compare harmonic magnitudes below the cut to the source."""
    c, meta = read_single_cycle(path)
    assert len(c) == n, (path, len(c))
    assert meta["loop_start"] == 0 and meta["loop_end"] == n - 1 and meta["loops"] == 1
    a = np.abs(np.fft.rfft(src))[1:n // 2]
    b = np.abs(np.fft.rfft(c))[1:n // 2]
    a, b = a / a.max(), b / b.max()
    err_db = 20 * np.log10(np.max(np.abs(a - b)) + 1e-12)
    kept = np.sum(a[: n // 2 - 1] ** 2) / np.sum((np.abs(np.fft.rfft(src))[1:] / np.abs(np.fft.rfft(src))[1:].max()) ** 2)
    seam = abs(c[0] - c[-1]) / (np.max(np.abs(np.diff(c))) + 1e-12)
    dc = abs(c.mean())
    return {"harmonic_err_db": round(float(err_db), 1),
            "energy_kept_pct": round(float(kept) * 100, 2),
            "seam_vs_sharpest_step": round(float(seam), 2),
            "dc": round(float(dc), 5),
            "starts_at": round(float(c[0]), 4)}


# --- audition ----------------------------------------------------------------

def audition(cycles600: list[tuple[str, np.ndarray]], path: Path) -> list[dict]:
    """Each 600-sample cycle held 1.2 s at its root (73.5 Hz), as a sampler plays it."""
    hold, gap, fade = int(1.2 * SR), int(0.25 * SR), int(0.01 * SR)
    out, marks, t = [], [], 0.0
    env = np.ones(hold)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.linspace(1, 0, fade)
    for label, c in cycles600:
        tone = np.tile(c, hold // len(c) + 1)[:hold] * env * 0.7
        out += [tone, np.zeros(gap)]
        marks.append({"t": round(t, 2), "cycle": label})
        t += (hold + gap) / SR
    y = np.concatenate(out)
    pcm = np.round(y * 32767).astype("<i2").tobytes()
    fmt = struct.pack("<HHIIHH", 1, 1, SR, SR * 2, 2, 16)
    body = b"WAVE" + chunk(b"fmt ", fmt) + chunk(b"data", pcm)
    path.write_bytes(b"RIFF" + struct.pack("<I", len(body)) + body)
    return marks


def main():
    OUT.mkdir(exist_ok=True)
    report = {"lengths": {}, "files": []}
    for n in LENGTHS:
        note, _, f = root_note(n)
        report["lengths"][n] = {"root_hz": round(f, 3), "root_midi": note}
    by600 = []
    for set_name, name, src in sources():
        for n in LENGTHS:
            d = OUT / f"{n}"
            d.mkdir(exist_ok=True)
            c = shape(src, n)
            p = d / f"{set_name}_{name}_{n}.wav"
            info = write_single_cycle(c, p)
            info.update(check(src, p, n))
            info.update({"file": str(p.relative_to(HERE)), "set": set_name, "cycle": name})
            report["files"].append(info)
            if n == 600:
                by600.append((f"{set_name} {name}", c))
    report["audition"] = audition(by600, HERE / "single_cycles_600_audition.wav")
    (HERE / "export_report.json").write_text(json.dumps(report, indent=1))
    worst = {n: min((r for r in report["files"] if r["samples"] == n), key=lambda r: r["energy_kept_pct"])
             for n in LENGTHS}
    print(f"{len(report['files'])} files")
    for n, r in worst.items():
        errs = [x["harmonic_err_db"] for x in report["files"] if x["samples"] == n]
        print(f"  {n}: worst energy kept {r['energy_kept_pct']}% ({r['file']}), "
              f"max harmonic err {max(errs)} dB")


if __name__ == "__main__":
    main()
