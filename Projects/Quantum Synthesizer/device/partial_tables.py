#!/usr/bin/env python3
"""Export the instrument's mode tables as plain data a Live device can read.

The browser instrument (proofs/instrument.html) builds every strike from three
things: the modes of a shape, the rule that turns a mode into a pitch, and the
strike and pickup points. Only the first needs special functions. This script
writes it once, as numbers, so the device never has to compute a Bessel function:

  line    one row per mode n:        k/k1 = n,           phi(x)   = sqrt2 sin(n pi x)
  square  one row per mode (m, n):   k/k1 = |(m,n)|/sqrt2, phi(x,y) = 2 sin(m pi x) sin(n pi y)
  disk    one row per mode (m, n):   k/k1 = j_mn/j_01,   phi(r,a) = R_mn(r) cos(m a) (+ its sin twin)
          R_mn sampled on RADIAL_N points of r in [0, 1], already unit-normalised

Every row carries `slot`: rows with the same slot have exactly the same pitch
under BOTH equations (the square's (m,n)/(n,m) twins and its other
coincidences), so the device sums their amplitudes into one oscillator.

Writes partial-tables.json beside this script.
Run with /usr/local/bin/python3 (numpy + scipy).
"""
import json, os
import numpy as np
from scipy import special

HERE = os.path.dirname(os.path.abspath(__file__))
KREL_MAX = 18          # same cut as instrument.html
RADIAL_N = 257


def slots(krel):
    order, out, keys = np.argsort(krel, kind="stable"), [0] * len(krel), []
    for i in order:
        if keys and abs(krel[i] - keys[-1]) < 1e-9 * krel[i]: out[i] = len(keys) - 1
        else: keys.append(krel[i]); out[i] = len(keys) - 1
    return out


def line():
    rows = [{"n": n, "krel": float(n)} for n in range(1, KREL_MAX + 1)]
    for r, s in zip(rows, slots([r["krel"] for r in rows])): r["slot"] = s
    return {"k1": float(np.pi), "rows": rows}


def square():
    rows = []
    for m in range(1, 40):
        for n in range(1, 40):
            kr = np.hypot(m, n) / np.sqrt(2)
            if kr <= KREL_MAX: rows.append({"m": m, "n": n, "krel": float(kr)})
    rows.sort(key=lambda r: (r["krel"], r["m"]))
    for r, s in zip(rows, slots([r["krel"] for r in rows])): r["slot"] = s
    return {"k1": float(np.pi * np.sqrt(2)), "rows": rows}


def disk():
    j01 = special.jn_zeros(0, 1)[0]
    rgrid = np.linspace(0, 1, RADIAL_N)
    rows = []
    for m in range(0, 60):
        for i, j in enumerate(special.jn_zeros(m, 30)):
            if j / j01 > KREL_MAX: break
            norm2 = (np.pi if m == 0 else np.pi / 2) * special.jv(m + 1, j) ** 2
            R = special.jv(m, j * rgrid) / np.sqrt(norm2)
            rows.append({"m": m, "n": i + 1, "krel": float(j / j01),
                         "radial": [round(float(v), 7) for v in R]})
    rows.sort(key=lambda r: (r["krel"], r["m"]))
    for r, s in zip(rows, slots([r["krel"] for r in rows])): r["slot"] = s
    return {"k1": float(j01), "radial_n": RADIAL_N, "rows": rows}


if __name__ == "__main__":
    T = {"version": 1, "krel_max": KREL_MAX,
         "note": "pitch ratio: wave = krel, Schrodinger = krel**2. See device-spec.md.",
         "line": line(), "square": square(), "disk": disk()}
    path = os.path.join(HERE, "partial-tables.json")
    json.dump(T, open(path, "w"), separators=(",", ":"))
    for s in ("line", "square", "disk"):
        rows = T[s]["rows"]
        print(f"{s:7s} {len(rows):4d} modes · {max(r['slot'] for r in rows) + 1:4d} distinct pitches")
    print(f"wrote {path} ({os.path.getsize(path) / 1024:.0f} KB)")
