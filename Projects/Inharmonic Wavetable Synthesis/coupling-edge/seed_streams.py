#!/usr/bin/env python3
"""The random draws behind the 2026-10-17 frustration sweeps, saved so the browser engine
can use the very same ones. ride.py, sweeppin.py and edgemap.py draw, from
numpy's default_rng(7): DET = 1 + uniform(-0.004, 0.004, N), then the voices' starting
phases uniform(0, 1, N). ride_warm.py draws each partial's starting phase (OFFS) from
default_rng(11). Both are prefix-consistent: N draws are the first N values of the stream.
Writes seed-streams.json (seed7: 256 values, seed11: 128 values, all uniform on [0, 1))."""
import json, numpy as np
u7 = np.random.default_rng(7).random(256); u11 = np.random.default_rng(11).random(128)
r = np.random.default_rng(7); N = 40
assert np.allclose(1 + r.uniform(-0.004, 0.004, N), 1 - 0.004 + 0.008*u7[:N]) and np.allclose(r.uniform(0, 1, N), u7[N:2*N])
json.dump({"seed7": [round(float(x), 12) for x in u7], "seed11": [round(float(x), 12) for x in u11]}, open("seed-streams.json", "w"))
print("wrote seed-streams.json")
