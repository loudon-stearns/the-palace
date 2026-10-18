#!/usr/bin/env python3
"""Gestures at the edge: the same 40-partial tone, K = 6 Hz (edge near B = 1.8e-5),
played three ways in one 34 s file:
   0-10 s  quick modulation : stretch wobbles 3 times a second across the edge (6e-6 <-> 6e-5)
  10-21 s  percussive       : every 1.25 s a strike throws the stretch to 3e-4 (torn), then it decays
                              (tau 0.25 s) back to 2e-6 and the tone relocks
  21-34 s  sequenced        : an 8-step stretch pattern, 0.375 s a step, crossing frozen / alive / edge / torn
Writes gestures.wav, gestures-alone.wav, gestures.png (via ride.render)."""
import numpy as np, importlib.util, sys
spec = importlib.util.spec_from_file_location("ride_mod", "ride.py")
src = open("ride.py").read().split("logsine = ")[0]          # take render() without re-running the rides
ns = {}; exec(compile(src, "ride.py", "exec"), ns); render = ns["render"]
def Bpath(t):
    B = np.empty_like(t)
    a = t < 10
    B[a] = np.exp(np.log(6e-6) + np.log(10)*(0.5 - 0.5*np.cos(2*np.pi*3.0*t[a])))
    b = (t >= 10) & (t < 21); tb = (t[b] - 10) % 1.25
    B[b] = 2e-6 + 3e-4*np.exp(-tb/0.25)
    c = t >= 21; seq = np.array([1e-6, 1e-5, 1.5e-5, 2.5e-5, 1e-6, 6e-5, 1.2e-5, 2e-4])
    B[c] = seq[(((t[c] - 21)/0.375).astype(int)) % 8]
    return B
render("gestures", 34, Bpath, lambda t: 6.0 + 0*t, False,
       "Gestures at the edge: quick modulation (0-10 s), strikes (10-21 s), a step sequence (21-34 s)")
