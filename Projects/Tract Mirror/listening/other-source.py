"""other-source.py - Tract Mirror's six tubes sung by a throat that isn't its own pulse.

Writes other-source.json (1.2 s per vowel at 147 Hz; Rosenberg tension 0.85, open quotient
0.45, breath 0.08) for other-source-check.mjs.
Run:  ~/.venvs/palace-vital/bin/python other-source.py
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import listen as L
vj = json.load(open(os.path.join(HERE, "..", "reference", "vowels.json")))
out = {}
for v in vj["vowels"]:
    a = np.array(vj["vowels"][v]["area_cm2"], float)
    y = L.mr.normalize(L.mr.render_sustained_vowel(a, f0=147.0, dur=1.2, fs=44100,
                                                   tension=0.85, open_quotient=0.45, breath=0.08))
    out[v] = np.round(y, 6).tolist()
json.dump(out, open(os.path.join(HERE, "other-source.json"), "w"))
