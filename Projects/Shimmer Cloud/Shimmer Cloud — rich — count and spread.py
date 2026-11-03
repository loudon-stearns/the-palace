"""
title: Shimmer Cloud — rich — count and spread
born: 2026-11-03
links: [[Shimmer Cloud]] (connects-to · rich-face-workshop) · serves "Shimmer Cloud — rich — how many.html"
forward_vector: I render the two corners of the count-and-spread square the May set never made, with May's own
  engine and seed, and I measure on that engine what the how-many piece says: count and spread move different dials.

Run with /usr/local/bin/python3 (the Homebrew python has no soundfile), from anywhere:
    /usr/local/bin/python3 -I "Projects/Shimmer Cloud/Shimmer Cloud — rich — count and spread.py"

1. Renders rich-face/{3,30,2500}_droplets_25c.wav and rich-face/{2,3,6,12}_droplets_5c.wav exactly as
   02_droplet_cloud/variations.py renders its takes (cloud.py, seed 42, its defaults: 300 ms scatter,
   full pan, 0.3 amp jitter; peak 0.85), so they sit beside 01_30_droplets.wav and 05_2500_droplets.wav
   as the other corners of one square and the few-copies rungs below May's 30. It first re-renders 01 and 05 and checks they match the
   tracked files, so the square is one engine.
2. Measures, on cloud.py with a steady 200 Hz tone in place of the phrase (the phrase's own pitch
   movement would hide it), how deep and how fast the crowd's level swirls at that pitch:
     depth = std / mean of the envelope at 200 Hz   (a crowd of random phases tends to 0.52)
     rate  = the envelope's mean modulation frequency, 0.05-40 Hz
     lines = the share of that level's swirl power in its strongest 1 % of frequencies: near 1 when a few
             copies beat in a few regular lines, falling toward a floor once the swirl is random
   and checks the rate against  f · ln2/1200 · (2/sqrt(pi)) · sigma,  the mean beat between two
   copies drawn sigma cents apart. Writes the table to rich-face/../Shimmer Cloud — rich — count and spread.json.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "02_droplet_cloud"))
from cloud import droplet_cloud  # noqa: E402

SR_TONE = 24000
F0 = 200.0  # the phrase's median pitch, measured by autocorrelation: 201.7 Hz (10-90%: 180-289 Hz)


def peak(c, target=0.85):
    return c * (target / np.max(np.abs(c)))


def render_square():
    dry, sr = sf.read(str(HERE / "02_droplet_cloud" / "dry.wav"))
    checks = {}
    for n, name in [(30, "01_30_droplets"), (2500, "05_2500_droplets")]:
        mine = peak(droplet_cloud(dry, sr, n_droplets=n))
        theirs, _ = sf.read(str(HERE / "02_droplet_cloud" / "variations" / f"{name}.wav"))
        err = float(np.max(np.abs(mine - theirs)))
        checks[name] = err
        assert err < 1e-4, f"{name} does not re-render: {err}"
    out = HERE / "rich-face"
    out.mkdir(exist_ok=True)
    for n in (3, 30, 2500):
        c = peak(droplet_cloud(dry, sr, n_droplets=n, pitch_spread_cents=25.0))
        sf.write(str(out / f"{n}_droplets_25c.wav"), c.astype(np.float32), sr)  # PCM_16, as variations.py
    for n in (2, 3, 6, 12):  # the few-copies rungs May's set starts above
        c = peak(droplet_cloud(dry, sr, n_droplets=n))
        sf.write(str(out / f"{n}_droplets_5c.wav"), c.astype(np.float32), sr)
    return checks


def swirl(y, f=F0, sr=SR_TONE):
    m = y.mean(axis=1)
    seg = m[int(1.0 * sr): int(11.6 * sr)]  # the steady middle, after the scatter
    z = seg * np.exp(-2j * np.pi * f * np.arange(len(seg)) / sr)
    k = int(0.02 * sr)
    e = np.abs(np.convolve(z, np.ones(k) / k, "same"))[k:-k]
    depth = e.std() / e.mean()
    E = np.abs(np.fft.rfft(e - e.mean())) ** 2
    fr = np.fft.rfftfreq(len(e), 1 / sr)
    sel = (fr > 0.05) & (fr < 40)
    Es = np.sort(E[sel])[::-1]
    lines = Es[: max(1, int(round(0.01 * len(Es))))].sum() / Es.sum()  # regularity: the swirl's power in its strongest 1 % of frequencies
    return float(depth), float((E[sel] * fr[sel]).sum() / E[sel].sum()), float(lines)


def predicted_rate(sigma, f=F0):
    return f * np.log(2) / 1200 * 2 * sigma / np.sqrt(np.pi)


def row(n, s_c, tone):
    d, r, l = zip(*[swirl(droplet_cloud(tone, SR_TONE, n_droplets=n, pitch_spread_cents=s_c, seed=s)) for s in range(4)])
    return {"copies": n, "cents": s_c, "depth": round(np.mean(d), 2), "rate_hz": round(np.mean(r), 2),
            "lines": round(np.mean(l), 2), "predicted_hz": round(predicted_rate(s_c), 2), "onsets_per_s": round(n / 0.3)}


def measure():
    t = np.arange(int(12.0 * SR_TONE)) / SR_TONE
    tone = np.sin(2 * np.pi * F0 * t)
    return {
        "count, at 5 cents": [row(n, 5, tone) for n in [2, 3, 6, 12, 30, 100, 300, 800, 2500]],
        "count, at 25 cents": [row(n, 25, tone) for n in [2, 3, 6, 12, 30, 100, 300]],
        "spread, at 400 copies": [row(400, s_c, tone) for s_c in [1, 3, 8, 25, 75]],
        "the square: 3, 30 or 2500 copies, 5 or 25 cents": [row(n, s_c, tone) for n in (3, 30, 2500) for s_c in (5, 25)],
    }


if __name__ == "__main__":
    report = {"re-render error vs tracked takes": render_square()}
    report.update(measure())
    (HERE / "Shimmer Cloud — rich — count and spread.json").write_text(json.dumps(report, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps(report, indent=1, ensure_ascii=False))
