#!/usr/bin/env python3
"""level-match.py — copies of each synth's render of a card, set to the reference's loudness, for a fair A/B by ear.
Usage: ~/.venvs/palace-vital/bin/python level-match.py <reference.wav> <out folder> <name>=<render.wav> ...
Loudness is plain RMS over the whole file (every render is the same four notes on the same schedule), so a copy differs from its render
by one gain and nothing else; a copy whose peak would pass -1 dBFS is held there and says so. Writes <name>-matched.wav and levels.json."""
import sys, json, pathlib, shutil, numpy as np
from scipy.io import wavfile
rd = lambda f: (lambda sr, x: (sr, x.astype(float) / 32768 if x.dtype == np.int16 else x.astype(float)))(*wavfile.read(f))
db = lambda v: 20 * np.log10(max(v, 1e-12))
rms = lambda x: np.sqrt(((x if x.ndim == 1 else x.mean(1)) ** 2).mean())
ref, out = sys.argv[1], pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
sr0, r = rd(ref); target = rms(r); report = {"reference": ref, "reference_rms_db": round(db(target), 1), "renders": {}}
shutil.copyfile(ref, out / "reference.wav")                                   # the reference itself, bit for bit
for arg in sys.argv[3:]:
    name, f = arg.split("=", 1); sr, x = rd(f)
    g = target / rms(x); held = False
    if abs(x).max() * g > 10 ** (-1 / 20): g = 10 ** (-1 / 20) / abs(x).max(); held = True
    wavfile.write(out / f"{name}-matched.wav", sr, (x * g * 32767).astype(np.int16))
    report["renders"][name] = {"from": f, "rms_db": round(db(rms(x)), 1), "gain_db": round(db(g), 1), "held_at_-1dBFS": held}
    print(f"{name}: {db(rms(x)):.1f} dB RMS, raised {db(g):+.1f} dB{' (held at -1 dBFS)' if held else ''}")
(out / "levels.json").write_text(json.dumps(report, indent=1)); print("reference", f"{db(target):.1f} dB RMS ->", out)
