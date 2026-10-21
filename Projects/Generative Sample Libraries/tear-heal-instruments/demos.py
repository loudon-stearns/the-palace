#!/usr/bin/env python3
"""Listening files, played through the written instruments (sampler.play reads
the SFZ and the WAVs on disk), and a figure of what each strike's pitch did.

audition/  first-note.wav   the baton's own next move: one strike with
                            gestures_warm.py's settings, nothing designed
           audition.wav     every patch, lowest then highest key, soft / mid /
                            hard, each held until well after it heals
           traces.png       partial 1 in cents over time for every note heard
           cues.md          what plays when, and what to listen for
instruments/<patch>/
           walk.wav         every sample root, low to high, at mid velocity
           velocity.wav     the middle key struck at velocity 30, 64, 100, 127
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

import engine
import sampler
from patches import LAYERS, PATCHES, key_hz, note_name

SR = engine.SR
HERE = Path(__file__).resolve().parent


def first_note(out: Path) -> dict:
    """gestures_warm.py's strike, once: F0 110 Hz, 64 partials (ride_warm's
    defaults), B = (2e-6 + 3e-4 exp(-t/0.25)) * BS, K = 6 Hz, tone alone, and
    ride_warm's own 50 ms fade-in, 0.5 s fade-out and 0.85 peak."""
    F0, N, secs = 110.0, 64, 5.0
    BS = (40.0 / N) ** 3
    t = np.arange(int(secs * SR)) / SR
    B = (2e-6 + 3e-4 * np.exp(-t / 0.25)) * BS
    tone, _, F = engine.simulate(F0, N, B, np.full(len(t), 6.0))
    env = np.minimum(1, np.minimum(t / 0.05, (secs - t) / 0.5))
    y = tone * env
    sampler.write_wav(out, y / np.abs(y).max() * 0.85)
    return {"file": out.name, **engine.shape(F, B, False, F0, 1.0, 1.5), "_trace": engine.track(F, B, False, F0)}


def hold_for(row: dict) -> float:
    return max(3.0, row["heal_s"] + 2.0)


def audition(res: dict) -> None:
    root: Path = res["root"]
    rows = res["rows"]
    gap, between = 0.6, 1.4
    parts, cues, t = [], [], 0.0
    fn = first_note(root / "first-note.wav")
    for name in [n for n in PATCHES if n in res["summary"]]:
        p = PATCHES[name]
        folder = root / name
        glob, regions = sampler.parse_sfz(folder / f"{p.title}.sfz")
        cache = {}
        mine = [r for r in rows if r["patch"] == name]
        for key in sorted({r["midi"] for r in mine}):
            for lname, lovel, hivel in LAYERS:
                r = next(x for x in mine if x["midi"] == key and x["layer"] == lname)
                hold = hold_for(r)
                y, _ = sampler.play(folder, glob, regions, key, (lovel + hivel) // 2, hold, cache)
                cues.append(f"| {t:6.1f} | {p.title} | {note_name(key)} | {lname} | "
                            f"{r['dip_cents']:.0f} | {r['heal_s']:.2f} | {r['sustain_wobble_cents']} |")
                parts += [y, np.zeros(int(gap * SR))]
                t += len(y) / SR + gap
        parts.append(np.zeros(int(between * SR)))
        t += between
    y = np.concatenate(parts)
    peak = float(np.abs(y).max())
    sampler.write_wav(root / "audition.wav", y * min(1.0, 0.89 / peak))
    traces(root, rows, fn)
    head = ["# Audition — what plays when", "",
            f"`audition.wav`, {t / 60:.1f} minutes. Each patch plays its lowest and its highest key, "
            "soft, mid and hard, each held until about two seconds after it heals, then released. "
            "Played through the written SFZ (keycenter, tune, loop, release, velocity), so this is "
            "what a sampler will play.", "",
            "Columns: the deepest the smoothed pitch fell below where it settles (cents), when it "
            "healed (stayed within 5 cents of its settled pitch), and how much the sustain still "
            "moves after that (cents, standard deviation; the sweeps' tear line is 7.9).", "",
            "| starts at, s | instrument | key | layer | dip, c | healed at, s | sustain wobble, c |",
            "|---|---|---|---|---|---|---|"]
    (root / "cues.md").write_text("\n".join(head + cues) + "\n\n"
                                  f"`first-note.wav` is separate: the baton's own strike, rendered with "
                                  f"gestures_warm.py's settings and nothing designed. Dip {fn['dip_cents']:.0f} c, "
                                  f"healed at {fn['heal_s']:.2f} s, sustain wobble {fn['sustain_wobble_cents']} c.\n")


def traces(root: Path, rows: list[dict], fn: dict) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    names = [n for n in PATCHES if any(r["patch"] == n for r in rows)]
    names = [n for n in names if not PATCHES[n].renders_from]      # voices shares heal's strikes
    keys = {n: sorted({r["midi"] for r in rows if r["patch"] == n}) for n in names}
    cols = max(len(k) for k in keys.values())
    fig, ax = plt.subplots(len(names) + 1, cols, figsize=(11, 2.3 * (len(names) + 1)), squeeze=False)
    colours = {"soft": "#8a8fa3", "mid": "#c08a2a", "hard": "#b8402f"}
    tt, cc = fn["_trace"]
    a = ax[0, 0]
    a.plot(tt, cc, lw=0.7, color="#333")
    a.set_title("first-note.wav: gestures_warm.py's strike, A2", fontsize=9, loc="left")
    a.set_ylabel("cents")
    for j in range(1, cols):
        ax[0, j].axis("off")
    for i, n in enumerate(names, start=1):
        for j, key in enumerate(keys[n]):
            a = ax[i, j]
            for lname, *_ in LAYERS:
                r = next(x for x in rows if x["patch"] == n and x["midi"] == key and x["layer"] == lname)
                t, c = r["_trace"]
                a.plot(t, c, lw=0.6, color=colours[lname], label=f"{lname}: heals {r['heal_s']:.1f} s")
                a.axvline(r["heal_s"], color=colours[lname], lw=0.5, ls=":")
            a.set_ylim(-320, 60)
            last = max(x["heal_s"] for x in rows if x["patch"] == n and x["midi"] == key)
            a.set_xlim(0, max(1.0, 2.5 * last))
            parts = next(x for x in rows if x["patch"] == n and x["midi"] == key)["partials"]
            a.set_title(f"{PATCHES[n].title}, {note_name(key)} ({parts} partials)", fontsize=9, loc="left")
            a.legend(fontsize=7, loc="lower right", frameon=False)
            if j == 0:
                a.set_ylabel("cents")
    for a in ax[-1]:
        a.set_xlabel("seconds")
    fig.suptitle("Partial 1 of every audition strike, in cents against its key: the tear, then the heal (dotted)",
                 fontsize=10)
    fig.tight_layout()
    fig.savefig(root / "traces.png", dpi=110)
    plt.close(fig)


def collection(res: dict) -> None:
    root: Path = res["root"]
    for name in res["summary"]:
        p = PATCHES[name]
        folder = root / name
        glob, regions = sampler.parse_sfz(folder / f"{p.title}.sfz")
        cache = {}
        roots = sorted({r["pitch_keycenter"] for r in regions})
        step, hold = 1.6, 1.4
        n = int((step * len(roots) + 4.0) * SR)
        walk = np.zeros(n)
        for i, k in enumerate(roots):
            y, _ = sampler.play(folder, glob, regions, k, 64, hold, cache)
            a = int(i * step * SR)
            walk[a:a + len(y)] += y[:n - a]
        sampler.write_wav(folder / "walk.wav", walk * min(1.0, 0.89 / np.abs(walk).max()))
        mid = roots[len(roots) // 2]
        parts = []
        for v in (30, 64, 100, 127):
            y, _ = sampler.play(folder, glob, regions, mid, v, 4.0, cache)
            parts += [y, np.zeros(int(0.5 * SR))]
        vel = np.concatenate(parts)
        sampler.write_wav(folder / "velocity.wav", vel * min(1.0, 0.89 / np.abs(vel).max()))


def make(which: str, res: dict) -> None:
    (audition if which == "audition" else collection)(res)
