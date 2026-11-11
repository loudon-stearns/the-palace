#!/usr/bin/env python3
"""render_hush.py — the far hush, before and after, through the C++ engine (Algorithm.h).

Loudon, 2026-11-10, on the prior-tone renders: "I find that there are these distant slow
random blips far from the beautiful note intended, we need to de-emphasize those."
Far hush turns a grain down by how far it lands from every believed note, times how sure
the cloud is. Same seed, same grains, two settings:

  python3 check/render_hush.py  →  proofs/hush-off.wav (0 dB), proofs/hush-on.wav (18 dB),
                                    proofs/hush-before-after.png, proofs/hush-levels.json

0–1 s flat prior, nothing held · 1–8 s C E G believed · 8–9 s let go
9–11 s painted D-dorian prior humming (prior tone 0.6), nothing held
11–18 s E major held against it (the prior-tone B case) · 18–20 s let go
"""
import importlib.util
import json
import subprocess
from pathlib import Path

import struct
import zlib

import numpy as np
# The picture, proofs/hush-before-after.png: top is the hush off, bottom at 18 dB, 80 Hz to
# 4 kHz on a log scale, 0-20 s; one colour scale for both, the loudest 60 dB.

HERE = Path(__file__).resolve().parents[1]
MACH = HERE.parents[1] / "VST Template" / "machinery"
spec = importlib.util.spec_from_file_location("verify", MACH / "tools" / "verify.py")
verify = importlib.util.module_from_spec(spec); spec.loader.exec_module(verify)

SR = 44100
DORIAN = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]   # C D E F G A B, centred on D by the register hill
PCS = ["pc_c", "pc_cs", "pc_d", "pc_ds", "pc_e", "pc_f", "pc_fs", "pc_g", "pc_gs", "pc_a", "pc_as", "pc_b"]
painted = lambda t: t >= 9.0
NOTES = [(1, 7, 60, 105), (1, 7, 64, 105), (1, 7, 67, 105),
         (11, 7, 64, 105), (11, 7, 68, 100), (11, 7, 71, 100)]
HOLDS = [("C E G believed", 4.0, 8.0, [60, 64, 67]), ("E major against the D-dorian hum", 14.0, 18.0, [64, 68, 71])]


def values(hush):
    v = dict(far_hush=hush, doubt=0.35,
             prior_shape=lambda t: np.where(painted(t), 1.0, 0.0), prior_tone=lambda t: np.where(painted(t), 0.6, 0.0),
             register=lambda t: np.where(painted(t), 62.0, 64.0), register_width=lambda t: np.where(painted(t), 1.5, 8.0))
    for k, pid in enumerate(PCS):
        v[pid] = (lambda x: (lambda t: np.where(painted(t), float(x), 1.0)))(DORIAN[k])
    return v


def near_share(x, held, cents=60.0):
    """Share of a segment's power within ±cents of a held note's pitch (grains are sines, so
    a grain's power sits at its own pitch). The rest is the far scatter."""
    m = x.mean(axis=0)
    n = 1 << 15
    hop = n // 2
    win = np.hanning(n)
    f = np.fft.rfftfreq(n, 1 / SR)
    pw = np.zeros(len(f))
    for a in range(0, len(m) - n, hop):
        pw += np.abs(np.fft.rfft(m[a:a + n] * win)) ** 2
    near = np.zeros(len(f), bool)
    for note in held:
        f0 = 440.0 * 2 ** ((note - 69) / 12)
        near |= (f > f0 * 2 ** (-cents / 1200)) & (f < f0 * 2 ** (cents / 1200))
    return float(pw[near].sum() / pw.sum())


def spectro(x, w=1200, h=300, lo=80.0, hi=4000.0):
    """A log-frequency spectrogram in dB, low pitches at the bottom (no matplotlib on this Mac)."""
    m = x.mean(axis=0)
    n, hop = 4096, max(1, (len(m) - 4096) // w)
    win = np.hanning(n)
    f = np.fft.rfftfreq(n, 1 / SR)
    rows = np.geomspace(hi, lo, h)
    idx = np.clip(np.searchsorted(f, rows), 0, len(f) - 1)
    img = np.zeros((h, w))
    for c in range(w):
        a = c * hop
        img[:, c] = 20 * np.log10(np.abs(np.fft.rfft(m[a:a + n] * win))[idx] + 1e-9)
    return img


def colour(img, top, span=60.0):
    """dB to a dark-to-gold ramp, the top `span` dB below `top` (shared by both pictures)."""
    v = np.clip((img - (top - span)) / span, 0, 1) ** 1.6
    rgb = np.stack([np.clip(v * 1.5, 0, 1), np.clip(v * 1.3 - 0.25, 0, 1), np.clip(v * 2.0 - 1.2, 0, 1)], -1)
    return (rgb * 255).astype(np.uint8)


def write_png(path, rgb):
    h, w, _ = rgb.shape
    raw = b"".join(b"\x00" + rgb[y].tobytes() for y in range(h))
    chunk = lambda tag, data: struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    Path(path).write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
                          + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def main():
    exe = HERE / "check" / "engine_check"
    table = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
    out = HERE / "proofs"; out.mkdir(exist_ok=True)
    work = HERE / "out"; work.mkdir(exist_ok=True)
    t = np.arange(int(20.0 * SR)) / SR
    renders, rep = {}, []
    for name, hush in (("off", 0.0), ("on", 18.0)):
        path = dict(name=f"hush-{name}", secs=20.0, values=values(hush), notes=NOTES)
        rows = verify.param_rows(table, path, t)
        r = verify.run_harness(exe, "engine", rows, SR, None, verify.note_events(path, SR), table, work)
        verify.write_wav(out / f"hush-{name}.wav", r["out"], SR)
        renders[name] = r["out"]
        for label, a, b, held in HOLDS:
            x = r["out"][:, int(a * SR):int(b * SR)]
            rep.append(dict(hush_db=hush, moment=label, near_share=round(near_share(x, held), 3),
                            rms_db=round(float(20 * np.log10(np.sqrt((x ** 2).mean()))), 1)))
    # the far scatter's level, before against after
    for label, *_ in HOLDS:
        off = next(r for r in rep if r["moment"] == label and r["hush_db"] == 0.0)
        on = next(r for r in rep if r["moment"] == label and r["hush_db"] == 18.0)
        far_off = 10 ** (off["rms_db"] / 10) * (1 - off["near_share"])
        far_on = 10 ** (on["rms_db"] / 10) * (1 - on["near_share"])
        near_off = 10 ** (off["rms_db"] / 10) * off["near_share"]
        near_on = 10 ** (on["rms_db"] / 10) * on["near_share"]
        rep.append(dict(moment=label, far_scatter_change_db=round(10 * np.log10(far_on / far_off), 1),
                        near_change_db=round(10 * np.log10(near_on / near_off), 1)))
    (out / "hush-levels.json").write_text(json.dumps(rep, indent=1))
    for row in rep: print(row)

    off, on = spectro(renders["off"]), spectro(renders["on"])
    top = max(off.max(), on.max())
    rows_img = [colour(off, top), np.full((6, 1200, 3), 60, np.uint8), colour(on, top)]
    write_png(out / "hush-before-after.png", np.concatenate(rows_img, axis=0))

if __name__ == "__main__":
    main()
