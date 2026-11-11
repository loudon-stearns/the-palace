#!/usr/bin/env python3
"""render_entrain.py — grain entrainment, off against on, through the C++ engine (Algorithm.h).

The plan's move: let grains near a believed note line up in phase (each note keeps a clock at
its own pitch; a new grain's start phase is pulled toward it by Entrain × how near and how
believed), and judge by ear whether the locking adds to the condensation or muddies it.
Same seed, same grains, only their start phases differ.

  python3 check/render_entrain.py  →  proofs/entrain-off.wav, entrain-on.wav (Entrain 1),
      entrain-on-matched.wav (Entrain 1, turned down to the off take's loudness while held),
      entrain-sweep.wav (Entrain rises 0 → 1 while the chord is held),
      proofs/entrain-shimmer.png, proofs/entrain-levels.json

Shimmer is how much a chord tone's loudness wobbles while held (std / mean of its envelope);
the picture is middle C's envelope, off above, on (matched) below, 5–11 s.

The takes: 0–1 s flat prior · 1–11 s C E G held · 11–13 s let go. The sweep: C E G held
1–15 s, Entrain 0 until 4 s, rising to 1 at 12 s.
"""
import importlib.util
import json
import subprocess
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parents[1]
MACH = HERE.parents[1] / "VST Template" / "machinery"
load = lambda p, n: (lambda s: (s.loader.exec_module(m := importlib.util.module_from_spec(s)), m)[1])(importlib.util.spec_from_file_location(n, p))
verify = load(MACH / "tools" / "verify.py", "verify")
hush = load(HERE / "check" / "render_hush.py", "render_hush")   # near_share, write_png

SR = 44100
CHORD = [60, 64, 67]
HOLD = (5.0, 11.0)          # the stretch measured: the chord fully believed


def run(exe, table, work, name, secs, values, notes):
    t = np.arange(int(secs * SR)) / SR
    path = dict(name=name, secs=secs, values=values, notes=notes)
    return verify.run_harness(exe, "engine", verify.param_rows(table, path, t), SR, None, verify.note_events(path, SR), table, work)["out"]


def line_share(x, held, cents=6.0):
    """Share of power within ±cents of a held pitch: how much of the chord sits on the line itself."""
    return hush.near_share(x, held, cents)


def envelope(x, note, cents=30.0):
    """The amplitude of one chord tone over time: the band ±cents round it, its Hilbert envelope,
    smoothed over 20 ms. Random-phase grains beat against one another, so this wobbles; that
    wobble is the cloud's shimmer, and it is what entrainment trades away."""
    m = x.mean(axis=0)
    X = np.fft.rfft(m)
    f = np.fft.rfftfreq(len(m), 1 / SR)
    f0 = 440.0 * 2 ** ((note - 69) / 12)
    X[(f < f0 * 2 ** (-cents / 1200)) | (f > f0 * 2 ** (cents / 1200))] = 0
    y = np.fft.irfft(X, len(m))
    Y = np.fft.fft(y)
    h = np.zeros(len(y)); h[0] = 1; h[1:len(y) // 2] = 2
    k = int(0.02 * SR)
    return np.convolve(np.abs(np.fft.ifft(Y * h)), np.ones(k) / k, "valid")


def wobble(x, note):
    e = envelope(x, note)
    return float(e.std() / e.mean())


def strips(xs, note=60, w=1200, h=140):
    """Middle C's envelope over the held chord, one strip per take, on one scale: gold on dark."""
    es = [envelope(x, note) for x in xs]
    top = max(e.max() for e in es)
    rows = []
    for e in es:
        img = np.full((h, w, 3), 18, np.uint8)
        for c, seg in enumerate(np.array_split(e, w)):
            y = int((1 - 0.94 * seg.mean() / top) * (h - 1))
            img[y:, c] = (92, 72, 36)
            img[max(0, y - 1):y + 1, c] = (232, 184, 92)
        rows += [img, np.full((6, w, 3), 60, np.uint8)]
    return np.concatenate(rows[:-1], axis=0)


def main():
    exe = HERE / "check" / "engine_check"
    table = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
    out = HERE / "proofs"; out.mkdir(exist_ok=True)
    work = HERE / "out"; work.mkdir(exist_ok=True)
    notes = [(1, 10, n, 105) for n in CHORD]
    off = run(exe, table, work, "entrain-off", 13.0, dict(entrain=0.0), notes)
    on = run(exe, table, work, "entrain-on", 13.0, dict(entrain=1.0), notes)
    seg = lambda x: x[:, int(HOLD[0] * SR):int(HOLD[1] * SR)]
    rms = lambda x: float(20 * np.log10(np.sqrt((x ** 2).mean())))
    gain = rms(seg(off)) - rms(seg(on))
    matched = run(exe, table, work, "entrain-on-matched", 13.0, dict(entrain=1.0, level=-2.0 + gain), notes)
    sweep = run(exe, table, work, "entrain-sweep", 16.0, dict(entrain=lambda t: np.clip((t - 4.0) / 8.0, 0.0, 1.0)),
                [(1, 14, n, 105) for n in CHORD])
    for name, x in (("off", off), ("on", on), ("on-matched", matched), ("sweep", sweep)):
        verify.write_wav(out / f"entrain-{name}.wav", x, SR)
    rep = []
    for name, x in (("off", off), ("on", on), ("on-matched", matched)):
        s = seg(x)
        rep.append(dict(take=name, held_rms_db=round(rms(s), 1), held_peak_db=round(float(20 * np.log10(np.abs(s).max())), 1),
                        within_60_cents=round(hush.near_share(s, CHORD, 60.0), 3), within_6_cents=round(line_share(s, CHORD), 3),
                        shimmer_C_E_G=[round(wobble(s, n), 2) for n in CHORD]))
    # the sweep in quarters: louder and narrower as Entrain rises?
    for a, b, e in ((2, 4, "0"), (5, 7, "0.1-0.4"), (8, 10, "0.5-0.75"), (12, 14, "1")):
        s = sweep[:, int(a * SR):int(b * SR)]
        rep.append(dict(take=f"sweep {a}-{b} s, entrain {e}", held_rms_db=round(rms(s), 1), within_6_cents=round(line_share(s, CHORD), 3)))
    rep.append(dict(matched_gain_db=round(gain, 1)))
    (out / "entrain-levels.json").write_text(json.dumps(rep, indent=1))
    for row in rep: print(row)
    hush.write_png(out / "entrain-shimmer.png", strips([seg(off), seg(matched)]))


if __name__ == "__main__":
    main()
