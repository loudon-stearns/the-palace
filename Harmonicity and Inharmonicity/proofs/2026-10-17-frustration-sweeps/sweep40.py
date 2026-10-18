#!/usr/bin/env python3
"""The living zone, high resolution: 40 partials, 40 outside voices.
Stretch hits partial n roughly as B*n^3, so the top of a 40-partial tone feels
it ~300x sooner than partial 6 did. The sweep is therefore exponential: B doubles
at a steady rate (equal time per doubling), after a 4 s harmonic hold.
Integrated at audio rate (partial 40 runs at several kHz). Each partial keeps its
own phase: dp_n/dt = r_n(t) * dtheta/dt.
Writes sweep40-singer-alone.wav, sweep40-with-voices.wav, sweep40.png, sweep40-report.json."""
import numpy as np, json, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from scipy.io import wavfile
SR, F0, N, K, SECS, HOLD = 44100, 110.0, 40, 6.0, 60.0, 4.0
B_LO, B_HI = 1e-7, 2e-4
rng = np.random.default_rng(7); DET = 1 + rng.uniform(-0.004, 0.004, N)
n = np.arange(1, N+1); amp = n**-0.7            # brighter than 1/n so the top is audible
steps = int(SECS*SR); dt = 1/SR; t = np.arange(steps)/SR
x = np.clip((t-HOLD)/(SECS-HOLD), 0, 1)
B = np.where(t < HOLD, 0.0, B_LO*(B_HI/B_LO)**x)
w = n*F0*DET
# Back-pull on the tone scaled so its strongest possible tug matches the 6-partial run
# (sum of n over 6 partials = 21). Unscaled, 40 voices throw even a harmonic tone around.
BACK = 21.0/n.sum()
p = np.zeros(N); ph = rng.uniform(0, 1, N)
singer = np.zeros(steps); voices = np.zeros(steps); F = np.empty(steps); TOP = np.empty(steps)
for i in range(steps):
    r = n*np.sqrt(1 + B[i]*n*n)
    s = np.sin(2*np.pi*(ph - p))
    dth = F0 + BACK*K*(r*s).sum()
    p += r*dth*dt; ph += (w - K*s)*dt
    singer[i] = amp @ np.sin(2*np.pi*p); voices[i] = amp @ np.sin(2*np.pi*ph)
    F[i] = dth; TOP[i] = r[-1]*dth
env = np.minimum(1, np.minimum(t/0.05, (SECS-t)/0.5))
def w16(name, y):
    y = y*env; y = y/np.abs(y).max()*0.85; wavfile.write(name, SR, (y*32767).astype(np.int16))
w16("sweep40-singer-alone.wav", singer); w16("sweep40-with-voices.wav", 0.6*singer + 0.35*voices)
# smoothed fundamental and its wobble (0.5 s windows), at 100 Hz for the plot
hop = SR//100; Fd = F[:len(F)//hop*hop].reshape(-1, hop).mean(1); td = np.arange(len(Fd))/100
win = 50; k = np.ones(win)/win
m = np.convolve(Fd, k, "same"); sd = np.sqrt(np.maximum(np.convolve(Fd**2, k, "same") - m**2, 0))
sd[:win] = 0; sd[-win:] = 0
brk = int(np.argmax(sd > 0.5)); tb = td[brk]
def shape(tsec):   # same-shape score: 50 ms of the singer vs whole periods ~0.25 s later
    i = int(tsec*SR); f = m[int(tsec*100)]; per = SR/f; kk = round(0.25*f); j = i + int(round(kk*per))
    a = singer[i:i+2205]; b = singer[j:j+2205]; return float(np.dot(a, b)/np.sqrt(np.dot(a, a)*np.dot(b, b)))
marks = []
for s_ in (2, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56):
    ii = int(s_*SR); marks.append(dict(t=s_, B=float(f"{B[ii]:.3g}"), fund=round(float(m[s_*100]), 2),
        wobble=round(float(sd[s_*100]), 2), top_partial_hz=round(float(TOP[ii])), shape=round(shape(s_), 3)))
rep = dict(N=N, K_hz=K, seconds=SECS, B_range=[B_LO, B_HI], break_time_s=round(float(tb), 2),
           break_B=float(f"{B[int(tb*SR)]:.3g}"), marks=marks)
json.dump(rep, open("sweep40-report.json", "w"), indent=1); print(json.dumps(rep, indent=1))
fig, ax = plt.subplots(3, 1, figsize=(10, 8), sharex=True)
ax[0].plot(td, Fd, lw=.6, color="#333"); ax[0].axhline(110, color="#c55", ls="--", lw=.6)
ax[0].set_ylabel("fundamental, Hz"); ax[0].set_ylim(60, 125)
sh_t = np.arange(1, SECS-1, 0.5); ax[1].plot(sh_t, [shape(s) for s in sh_t], color="#357")
ax[1].set_ylabel("same-shape score\n(1 = frozen)"); ax[1].set_ylim(-0.2, 1.05)
ax[2].semilogy(t[::441], np.maximum(B[::441], 1e-8), color="#753"); ax[2].set_ylabel("stretch B (log)")
ax[2].set_xlabel("seconds")
for a in ax: a.axvline(tb, color="#c55", lw=.8)
ax[0].text(.5, 120, "frozen", fontsize=9); ax[0].text(tb+.5, 120, "torn", fontsize=9)
ax[0].text((HOLD+tb)/2-2, 120, "alive", fontsize=9)
fig.suptitle("40 partials, 40 voices: frozen → alive → torn", fontsize=10)
fig.tight_layout(); fig.savefig("sweep40.png", dpi=110)
