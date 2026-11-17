"""sing-back-check.py - the Python side of the sing-back.html check.

Writes sing-back-check.json: for three built-in vowels at two pitches, the harmonic
frequencies, Tract Mirror's source and as-sung tube levels at them (singalong.py's own
functions), and the first 4000 samples of render_sustained_vowel.  sing-back-check.mjs
holds the page's port against these numbers.

Run:  ~/.venvs/palace-vital/bin/python sing-back-check.py
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import singalong as S
import listen as L

out = {"cases": []}
vj = json.load(open(os.path.join(HERE, "..", "reference", "vowels.json")))
for v in ["a", "e", "i"]:
    area = np.array(vj["vowels"][v]["area_cm2"], float)
    for f0 in [110.0, 220.0]:
        hf = f0 * np.arange(1, int(S.FMAX / f0) + 1)
        hf = hf[hf < S.FMAX]
        y = L.mr.render_sustained_vowel(np.clip(area, S.fv.A_MIN, S.fv.A_MAX), f0=f0, dur=0.5, fs=S.FS)
        y = L.mr.normalize(y)
        out["cases"].append({"vowel": v, "f0": f0, "hf": hf.tolist(),
                             "tract_db": S.tract_response(area, hf).tolist(),
                             "source_db": S.source_db(f0, hf).tolist(),
                             "render_head": y[:4000].tolist(),
                             "formants": L.sung_formants(area).tolist()})
json.dump(out, open(os.path.join(HERE, "sing-back-check.json"), "w"))
print("wrote", len(out["cases"]), "cases")
