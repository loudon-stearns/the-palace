#!/usr/bin/env python3
"""A reference copy of the frozen ride.py loop, kept so the page's engine can be checked against it.

Copied from Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py (2026-10-17),
which stays untouched: same model, same seed-7 voicing, 40 partials at 110 Hz, 44.1 kHz. Audio and
plots are dropped; it records the tone's fundamental as 10 ms means (hop 441 samples), for the first
12 s of two rides:
  ride-coupling   : B held at 2.5e-5, K swings 2 -> 18 -> 2 Hz over 20 s (unpinned)
  ride-string-bar : partial 1 pinned, K = 1 Hz, B glides 0.01 <-> 30 on a log-sine, 20 s period
Writes ride-reference.json beside this file. check-coupling-edge.mjs runs the page's engine on the
same paths (its ride and breathe modulators) and compares the traces.
"""
import json, os, numpy as np
SR, F0, N = 44100, 110.0, 40
n = np.arange(1, N+1); BACK = 21.0/n.sum()
def trace(secs, Bf, Kf, pinned):
    rng = np.random.default_rng(7); DET = 1 + rng.uniform(-0.004, 0.004, N); w = n*F0*DET
    steps = int(secs*SR); dt = 1/SR; t = np.arange(steps)/SR; B = Bf(t); K = Kf(t)
    p = np.zeros(N); ph = rng.uniform(0, 1, N); Fp = F0; F = np.zeros(steps)
    for i in range(steps):
        r = n*np.sqrt((1 + B[i]*n*n)/((1 + B[i]) if pinned else 1.0))
        gate = np.clip((4000.0 - np.abs(r*Fp - w))/1000.0, 0, 1)
        s = np.sin(2*np.pi*(ph - p))*gate
        dth = F0 + BACK*K[i]*(r*s).sum()
        p += r*dth*dt; ph += (w - K[i]*s)*dt; Fp = dth; F[i] = dth
    hop = 441; return [round(float(x), 5) for x in F[:len(F)//hop*hop].reshape(-1, hop).mean(1)]
logsine = lambda lo, hi, per: (lambda t: np.exp(np.log(lo) + (np.log(hi)-np.log(lo))*(0.5 - 0.5*np.cos(2*np.pi*t/per))))
out = {"ride-coupling": trace(12, lambda t: 2.5e-5 + 0*t, lambda t: 2 + 16*(0.5 - 0.5*np.cos(2*np.pi*t/20.0)), False),
       "ride-string-bar": trace(12, logsine(0.01, 30.0, 20.0), lambda t: 1.0 + 0*t, True)}
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "ride-reference.json"), "w"))
print({k: (min(v), max(v)) for k, v in out.items()})
