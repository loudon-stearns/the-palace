#!/usr/bin/env python3
"""Riding the edge: three short renders that move through the thresholds on purpose.
Same model as sweeppin.py (40 partials, back-pull scaled, far pulls faded), but B and K
follow designed paths instead of a one-way sweep. Each writes <name>.wav (tone + voices),
<name>-alone.wav (tone only), <name>.png.
  ride-breathe   : K = 6 Hz; B breathes (log-sine) across the edge, 4e-6 <-> 8e-5, 12 s period
  ride-coupling  : B held just past the edge (2.5e-5); K swings 2 -> 18 -> 2 Hz and back
  ride-string-bar: partial 1 pinned, K = 1 Hz (barely coupled); B glides 0.01 <-> 30, string <-> bar
"""
import numpy as np, sys, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from scipy.io import wavfile
import os
SR, F0, N = 44100, float(os.environ.get("F0", 110.0)), int(os.environ.get("N", 64))
KS = F0/110.0   # coupling scaled with pitch: same physics, slower clock
n = np.arange(1, N+1)
# warm source: many harmonics, upper ones rolled off steeply (about -12 dB per octave above the 4th),
# each partial starting at a random phase so the waveform is soft, not a buzzy spike
amp = 1.0/n*np.minimum(1, 4.0/n); OFFS = np.random.default_rng(11).uniform(0, 1, N)
BACK = 21.0/n.sum()
# stretch hits partial n as ~B n^3: scale every stretch path so it straddles this tone's edge
BS = (40.0/N)**3; EDGE = 1.8e-5*BS
def render(name, secs, Bf, Kf, pinned, title):
    rng = np.random.default_rng(7); DET = 1 + rng.uniform(-0.004, 0.004, N); w = n*F0*DET
    steps = int(secs*SR); dt = 1/SR; t = np.arange(steps)/SR; B = Bf(t)*(1.0 if pinned else BS); K = Kf(t)*KS
    p = np.zeros(N); ph = rng.uniform(0, 1, N); Fp = F0
    tone = np.zeros(steps); vox = np.zeros(steps); F = np.zeros(steps)
    for i in range(steps):
        r = n*np.sqrt((1 + B[i]*n*n)/((1 + B[i]) if pinned else 1.0))
        gate = np.clip((4000.0 - np.abs(r*Fp - w))/1000.0, 0, 1)
        s = np.sin(2*np.pi*(ph - p))*gate
        dth = F0 + BACK*K[i]*(r*s).sum()
        p += r*dth*dt; ph += (w - K[i]*s)*dt; Fp = dth
        g = amp*np.clip((19000.0 - r*dth)/3000.0, 0, 1)
        tone[i] = g @ np.sin(2*np.pi*(p + OFFS)); vox[i] = amp @ np.sin(2*np.pi*ph); F[i] = dth
    env = np.minimum(1, np.minimum(t/0.05, (secs-t)/0.5))
    def w16(fn, y):
        y = y*env; y = y/np.abs(y).max()*0.85; wavfile.write(fn, SR, (y*32767).astype(np.int16))
    name = name + os.environ.get("TAG", "-warm")
    w16(f"{name}.wav", 0.6*tone + 0.35*vox); w16(f"{name}-alone.wav", tone)
    hop = SR//100; Fd = F[:len(F)//hop*hop].reshape(-1, hop).mean(1); td = np.arange(len(Fd))/100
    fig, ax = plt.subplots(3, 1, figsize=(10, 6), sharex=True)
    ax[0].plot(td, Fd, lw=.6, color="#333"); ax[0].axhline(F0, color="#c55", ls="--", lw=.6); ax[0].set_ylabel("fundamental, Hz")
    ax[1].semilogy(t[::441], B[::441], color="#753"); ax[1].axhline(EDGE, color="#c55", ls=":", lw=.8)
    ax[1].set_ylabel("stretch B"); ax[2].plot(t[::441], K[::441], color="#357"); ax[2].set_ylabel("coupling K, Hz"); ax[2].set_xlabel("seconds")
    fig.suptitle(title, fontsize=10); fig.tight_layout(); fig.savefig(f"{name}.png", dpi=110); plt.close(fig)
    q = Fd[100:-100]; print(name, "fundamental range %.1f-%.1f Hz" % (q.min(), q.max()))
logsine = lambda lo, hi, per: (lambda t: np.exp(np.log(lo) + (np.log(hi)-np.log(lo))*(0.5 - 0.5*np.cos(2*np.pi*t/per))))
render("ride-breathe", 48, logsine(4e-6, 8e-5, 12.0), lambda t: 6.0 + 0*t, False,
       "Breathing across the edge: K = 6 Hz, stretch rises and falls through the threshold (dotted)")
render("ride-coupling", 40, lambda t: 2.5e-5 + 0*t, lambda t: 2 + 16*(0.5 - 0.5*np.cos(2*np.pi*t/20.0)), False,
       "Coupling as the knob: stretch held just past the edge, coupling swings 2 -> 18 -> 2 Hz")
render("ride-string-bar", 40, logsine(0.01, 30.0, 20.0), lambda t: 1.0 + 0*t, True,
       "String <-> bar: partial 1 pinned, barely coupled, stretch glides between string and bar")
