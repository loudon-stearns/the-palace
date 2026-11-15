#!/usr/bin/env python3
"""
bring_your_own.py — a recording someone brings becomes a wavetable (GWL cycle 22, 2026-11-15)
===========================================================================================

The plan's last missing source: cycles a user brings. AKWF arrives as single
cycles and the AI notes arrived graded, one steady note each. A recording
someone brings is neither: a sung phrase, a bass line, a spoken vowel run,
with pitch that moves, gaps, breaths and attacks. So this does three things
the other sources never needed:

  1. Track the pitch itself (YIN, 10 ms hop), so no grader is required.
  2. At every voiced moment, average 4 periods at that moment's pitch into one
     2048-sample cycle, and keep it only if the periods agree (CLEANNESS,
     UPPER FIDELITY — the same two gates as ../ai-cycles, reused from there).
  3. Pack the kept cycles in the order they happened. Position means *time
     through the recording*: sweep it and the table replays how the sound's
     colour changed, at any pitch you play. A second table orders the same
     cycles as the smoothest walk, for when the recording's own order jumps.

Every table goes through the shared emit(), so the one-frame blur that is the
default since 2026-11-10 applies here too.

    /usr/local/bin/python3 bring_your_own.py <audio> [<audio> ...] [--name N]

Reads anything afconvert can (wav, aiff, m4a, mp3). Writes, per recording,
tables/<name>/ (CLM, Ableton, audition sweep for each order), a picture and
report.json. Writes nothing beside the source.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

HERE = Path(__file__).resolve().parent
BUNDLE = HERE.parent
sys.path.insert(0, str(BUNDLE / "akwf-scale-up-fmsynth"))
sys.path.insert(0, str(BUNDLE / "ai-cycles"))
sys.path.insert(0, str(BUNDLE / "loop-smoothing"))
import scale_up as su                    # noqa: E402  emit, measures
import extract_ai_cycles as ex           # noqa: E402  periods, fidelity, octave fold
from smooth_tables import offnote_db     # noqa: E402

ex.K = 4                 # periods averaged per cycle: short, because pitch moves here
SR = 44100
HOP = SR // 100          # 10 ms
WIN = 2048
FMIN, FMAX = 30.0, 900.0     # E1 is 41 Hz; a 50 Hz floor missed a whole bass recording
YIN_TH = 0.15            # YIN aperiodicity at or below this = voiced
GATE, FID_GATE = 0.85, 0.5
MAX_FRAMES = 256


# ---------------------------------------------------------------- reading

def load(path: Path) -> np.ndarray:
    """Any audio afconvert reads, as mono float at 44.1 kHz."""
    try:
        x, sr = sf.read(str(path), always_2d=True)
    except Exception:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td) / "x.wav"
            subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEF32", str(path), str(tmp)], check=True)
            x, sr = sf.read(str(tmp), always_2d=True)
    x = x.mean(1)
    if sr != SR:
        g = np.gcd(int(sr), SR)
        x = resample_poly(x, SR // g, int(sr) // g)
    return x - x.mean()


# ---------------------------------------------------------------- pitch

def yin(x: np.ndarray):
    """Per-hop (time s, f0 Hz, aperiodicity). Cumulative-mean-normalised difference."""
    tmin, tmax = int(SR / FMAX), int(SR / FMIN)
    out = []
    for s in range(0, len(x) - WIN - tmax, HOP):
        a = x[s:s + WIN + tmax]
        # d(tau) = sum (x_t - x_{t+tau})^2 over a WIN window, via FFT correlation
        A = np.fft.rfft(a, 2 * len(a))
        r = np.fft.irfft(A * np.conj(np.fft.rfft(a[:WIN], 2 * len(a))))[:tmax + 1]
        e0 = np.sum(a[:WIN] ** 2)
        cs = np.concatenate([[0], np.cumsum(a ** 2)])
        e_tau = cs[np.arange(tmax + 1) + WIN] - cs[np.arange(tmax + 1)]
        d = e0 + e_tau - 2 * r
        d[0] = 0
        cm = d[1:] * np.arange(1, tmax + 1) / (np.cumsum(d[1:]) + 1e-20)
        cm = np.concatenate([[1.0], cm])
        cand = np.where(cm[tmin:] < YIN_TH)[0]
        if len(cand):
            t = cand[0] + tmin
            while t + 1 <= tmax and cm[t + 1] < cm[t]:
                t += 1
        else:
            t = int(np.argmin(cm[tmin:]) + tmin)
        if 1 <= t < tmax:                          # parabolic refine
            y0, y1, y2 = cm[t - 1], cm[t], cm[t + 1]
            den = y0 - 2 * y1 + y2
            tf = t + (0.5 * (y0 - y2) / den if abs(den) > 1e-12 else 0)
        else:
            tf = float(t)
        out.append((s / SR, SR / tf, float(cm[t])))
    return np.array(out)


# ---------------------------------------------------------------- cycles

def cycles_over_time(x: np.ndarray, track: np.ndarray):
    peak = np.max(np.abs(x)) + 1e-12
    rows, frames = [], []
    census = {"hops": len(track), "voiced": 0, "quiet": 0, "rejected": 0, "kept": 0, "folded": 0}
    for t, hz, ap in track:
        if ap > YIN_TH:
            continue
        census["voiced"] += 1
        T = SR / hz
        s = int(t * SR + WIN / 2 - T * ex.K / 2)    # centre the periods in the analysis window
        if s < 0 or s + T * ex.K + 2 >= len(x):
            continue
        P = ex.periods(x, s, T)
        P = P - P.mean(axis=1, keepdims=True)
        if np.sqrt((P ** 2).mean()) < 0.03 * peak:
            census["quiet"] += 1
            continue
        fid, Tr = ex.refine_period(x, s, T)
        P = ex.periods(x, s, Tr)
        P = P - P.mean(axis=1, keepdims=True)
        m = P.mean(0)
        clean = float((m ** 2).mean()) / (float((P ** 2).mean()) + 1e-20)
        if clean < GATE or fid < FID_GATE:
            census["rejected"] += 1
            continue
        c, folded = ex.fold_octave(m - m.mean())
        census["folded"] += int(folded > 1)
        census["kept"] += 1
        frames.append(c / (np.max(np.abs(c)) + 1e-12))
        rows.append({"t": round(float(t + WIN / 2 / SR), 3), "hz": round(float(SR / Tr * folded), 2),
                     "clean": round(clean, 3), "fid": round(float(fid), 3), "folded_by": folded})
    return np.array(frames), rows, census


def pick_even(n_kept: int, n: int) -> np.ndarray:
    """n indices spread evenly along the kept cycles (they are already in time order)."""
    if n_kept <= n:
        return np.arange(n_kept)
    return np.unique(np.round(np.linspace(0, n_kept - 1, n)).astype(int))


def measure(frames):
    feats = su.timbre_features(frames)
    steps = np.linalg.norm(np.diff(feats, axis=0), axis=1)
    return {"frames": len(frames),
            "median_step": round(float(np.median(steps)), 1),
            "big_jumps": int((steps > su.FAR_STEP).sum()),
            "worst_morph_dip_db": round(float(su.morph_dips_db(su.align_rotations(frames)).min()), 1),
            "buzz_db_unsmoothed": round(float(offnote_db(su.to_ableton(su.align_rotations(frames)))), 1)}


def picture(x, track, rows, frames, path, title):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(3, 1, figsize=(11, 8), gridspec_kw={"height_ratios": [1, 1.2, 2]})
    tt = np.arange(len(x)) / SR
    ax[0].plot(tt, x, lw=0.4, color="#444")
    ax[0].set_title(title, loc="left")
    ax[0].set_ylabel("recording")
    v = track[:, 2] <= YIN_TH
    ax[1].scatter(track[v, 0] + WIN / 2 / SR, track[v, 1], s=2, color="#bbb", label="voiced")
    if rows:
        ax[1].scatter([r["t"] for r in rows], [r["hz"] for r in rows], s=4, color="#1f5fa8", label="kept as a cycle")
    ax[1].set_yscale("log")
    ax[1].set_ylabel("pitch, Hz")
    ax[1].set_xlim(0, tt[-1])
    ax[1].legend(loc="upper right", fontsize=8)
    if len(frames):
        img = 20 * np.log10(np.abs(np.fft.rfft(frames, axis=1))[:, 1:49] + 1e-4)
        ax[2].imshow(img.T, aspect="auto", origin="lower", cmap="magma", vmin=img.max() - 60,
                     extent=[0, len(frames), 0.5, 48.5])
        ax[2].set_xlabel("Position (frame), in the order the recording played them")
        ax[2].set_ylabel("harmonic")
    fig.tight_layout()
    fig.savefig(path, dpi=110)
    plt.close(fig)


def run(path: Path, name: str):
    x = load(path)
    track = yin(x)
    frames_all, rows_all, census = cycles_over_time(x, track)
    out = HERE / "tables" / name
    out.mkdir(parents=True, exist_ok=True)
    report = {"source": str(path), "seconds": round(len(x) / SR, 2), "census": census}
    if len(frames_all) < 2:
        report["verdict"] = "too few steady moments for a table"
        (out / "report.json").write_text(json.dumps(report, indent=2))
        return report
    keep = pick_even(len(frames_all), MAX_FRAMES)
    frames = frames_all[keep]
    rows = [rows_all[i] for i in keep]
    dur = 24.0 if len(frames) > 64 else 16.0
    files = su.emit(f"{name}_time", frames, out, dur)
    D = su.pairwise(su.timbre_features(frames))
    walk = su.walk_order(D, 0)
    files += su.emit(f"{name}_walk", frames[walk], out, dur)
    report["frames"] = len(frames)
    report["covers_seconds"] = [rows[0]["t"], rows[-1]["t"]]
    report["pitch_hz_quantiles"] = [round(float(np.quantile([r["hz"] for r in rows], q)), 1) for q in (0.1, 0.5, 0.9)]
    report["orders"] = {"time": measure(frames), "walk": measure(frames[walk])}
    for o, fr in (("time", frames), ("walk", frames[walk])):
        sm = su.smooth_along_position(fr)
        report["orders"][o]["buzz_db_as_written"] = round(float(offnote_db(su.to_ableton(sm))), 1)
    report["files"] = files
    report["kept_cycles"] = rows
    picture(x, track, rows, frames, out / f"{name}.png", f"{name}: {len(frames)} cycles from {report['seconds']} s")
    (out / "report.json").write_text(json.dumps(report, indent=2))
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", nargs="+", type=Path)
    ap.add_argument("--name", action="append", help="one per audio file; default the file's stem")
    a = ap.parse_args()
    names = a.name or [p.stem.replace(" ", "_") for p in a.audio]
    for p, n in zip(a.audio, names):
        r = run(p, n)
        o = r.get("orders", {})
        print(n, r["census"], r.get("frames"), {k: (v["big_jumps"], v["buzz_db_as_written"]) for k, v in o.items()})


if __name__ == "__main__":
    main()
