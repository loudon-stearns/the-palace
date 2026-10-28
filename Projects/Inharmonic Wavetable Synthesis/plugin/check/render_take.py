#!/usr/local/bin/python3
"""render_take.py — Bent Line's first take, through the sketch (which the C++ engine
matches to 5e-8 of peak, so this is what the plugin plays). Writes
../bent-line-take.wav and out/take-levels.json.

  0-4 s    the bell on the organ, filed Rank: mode k wears the organ's k-th partial
  4-8 s    the same bell, filed Nearest: each mode wears the organ partial it is nearest
  8-14 s   Rank, the Bend knob drawn from 1 to 0: the bell flattens into a full harmonic series
  14-20 s  Nearest, Bend 1 to 0: the bell flattens onto the few harmonics it was nearest
  20-27 s  low piano chord on the organ, Bend 0 to 2: the flat line, the real string, twice the string
"""
import json, sys
from pathlib import Path
import numpy as np
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "reference"))
import sketch  # noqa: E402

SR = 44100
SEGS = [  # secs, values, notes (start, len, note, vel)
    (4.0, dict(material=3, filing=0, decay=6.0), [(0.0, 3.4, 57, 100)]),
    (4.0, dict(material=3, filing=1, decay=6.0), [(0.0, 3.4, 57, 100)]),
    (6.0, dict(material=3, filing=0, clock=1, bpos=0.0, decay=30.0, bend=lambda t: np.clip(1.0 - (t - 1.0) / 4.0, 0, 1)), [(0.0, 5.6, 57, 100)]),
    (6.0, dict(material=3, filing=1, clock=1, bpos=0.0, decay=30.0, bend=lambda t: np.clip(1.0 - (t - 1.0) / 4.0, 0, 1)), [(0.0, 5.6, 57, 100)]),
    (7.0, dict(material=0, filing=0, decay=8.0, bend=lambda t: np.clip(2.0 * (t - 0.5) / 5.5, 0, 2)), [(0.0, 6.4, 45, 100), (0.0, 6.4, 52, 90), (0.0, 6.4, 61, 80)]),
]
DEFAULTS = dict(material=3, filing=0, bend=1.0, clock=0, speed=1.0, bpos=0.0, wall=0, apos=0.55,
                decay=3.0, release=0.4, level=-12.0)

parts, levels = [], []
for secs, vals, notes in SEGS:
    T = int(secs * SR); t = np.arange(T) / SR
    v = {}
    for k, d in DEFAULTS.items():
        x = vals.get(k, d)
        v[k] = x(t).astype(float) if callable(x) else np.full(T, float(x))
    ev = []
    for s, ln, nt, vel in notes:
        ev += [(int(s * SR), True, nt, vel), (int((s + ln) * SR), False, nt, 0)]
    ev.sort(key=lambda e: (e[0], not e[1]))
    y = sketch.render(v, SR, notes=ev)["out"][0]
    parts.append(y)
    levels.append(dict(secs=secs, rms_db=round(20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-12), 1),
                       peak_db=round(20 * np.log10(np.max(np.abs(y)) + 1e-12), 1)))
y = np.concatenate(parts)
y = y / (np.max(np.abs(y)) + 1e-12) * 0.89
out = HERE.parents[1] / "bent-line-take.wav"
wavfile.write(out, SR, (y * 32767).astype(np.int16))
(HERE.parent / "out").mkdir(exist_ok=True)
json.dump(levels, open(HERE.parent / "out" / "take-levels.json", "w"), indent=1)
print("wrote", out, f"{len(y)/SR:.1f} s"); print(levels)
