#!/usr/bin/env python3
"""The living zone: one slow sweep of stretch, B from 0 up past the break.
Same model as frustration.py, but each partial keeps its own phase p_n with
dp_n/dt = r_n(t) * dtheta/dt, so B can move smoothly without phase jumps.
Writes: sweep-with-voices.wav, sweep-singer-alone.wav (same singer, voices muted),
sweep.png, sweep-report.json."""
import numpy as np, json, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from scipy.io import wavfile
SR, CR, F0, N, K, SECS = 44100, 4410, 110.0, 6, 6.0, 48.0
BMAX = 0.003
rng = np.random.default_rng(7); DET = 1 + rng.uniform(-0.004, 0.004, N)
n = np.arange(1, N+1); amp = 1/n
steps = int(SECS*CR); dt = 1/CR; t = np.arange(steps)/CR
B = BMAX * (t/SECS)**2                      # slow at the bottom, where the life is
p = n * 0.0; ph = rng.uniform(0, 1, N); w = n*F0*DET
P = np.empty((steps, N)); PH = np.empty((steps, N)); F = np.empty(steps); R6 = np.empty(steps)
for i in range(steps):
    r = n*np.sqrt(1 + B[i]*n**2)
    s = np.sin(2*np.pi*(ph - p))
    dth = F0 + K*(r*s).sum()
    p += r*dth*dt; ph += (w - K*s)*dt
    P[i] = p; PH[i] = ph; F[i] = dth; R6[i] = r[-1]
ta = np.arange(int(SECS*SR))/SR
env = np.minimum(1, np.minimum(ta/0.05, (SECS-ta)/0.5))
singer = sum(amp[k]*np.sin(2*np.pi*np.interp(ta, t, P[:, k])) for k in range(N))
voices = sum(amp[k]*np.sin(2*np.pi*np.interp(ta, t, PH[:, k])) for k in range(N))
def w16(name, y):
    y = y*env; y = y/np.abs(y).max()*0.85; wavfile.write(name, SR, (y*32767).astype(np.int16))
w16("sweep-with-voices.wav", 0.6*singer + 0.35*voices)
w16("sweep-singer-alone.wav", singer)
# where does it let go? rolling wobble of the fundamental over 0.5 s
win = int(0.5*CR); k = np.ones(win)/win
m = np.convolve(F, k, "same"); sd = np.sqrt(np.maximum(np.convolve(F**2, k, "same") - m**2, 0))
sd[:win] = 0; sd[-win:] = 0
brk = int(np.argmax(sd > 0.5))
gap6 = (R6 - 6)*m                            # how far partial 6 sits from its voice's harmonic, Hz
rep = dict(K_hz=K, B_max=BMAX, seconds=SECS,
           break_time_s=round(brk/CR, 2), break_B=round(float(B[brk]), 6),
           break_fundamental_hz=round(float(m[brk]), 2),
           break_partial6_gap_hz=round(float(gap6[brk]), 2),
           marks=[dict(t=s_, B=round(float(B[int(s_*CR)]), 6), fund=round(float(m[int(s_*CR)]), 2),
                       wobble=round(float(sd[int(s_*CR)]), 2), gap6=round(float(gap6[int(s_*CR)]), 2))
                  for s_ in (5, 10, 15, 20, 25, 30, 35, 40, 45)])
json.dump(rep, open("sweep-report.json", "w"), indent=1); print(json.dumps(rep, indent=1))
fig, ax = plt.subplots(3, 1, figsize=(10, 7.5), sharex=True)
fs = np.convolve(F, np.ones(220)/220, "same"); fs[:220] = np.nan; fs[-220:] = np.nan
ax[0].plot(t, fs, lw=.8, color="#333"); ax[0].axhline(110, color="#c55", ls="--", lw=.6)
ax[0].set_ylabel("fundamental, Hz"); ax[0].set_ylim(95, 115)
ax[1].plot(t, gap6, color="#357"); ax[1].axhline(K, color="#c55", ls="--", lw=.6)
ax[1].text(1, K+0.5, f"coupling strength K = {K:g} Hz", fontsize=8, color="#c55")
ax[1].set_ylabel("partial 6 gap, Hz"); ax[1].set_ylim(0, 25)
ax[2].plot(t, B, color="#753"); ax[2].set_ylabel("stretch B"); ax[2].set_xlabel("seconds")
for a in ax: a.axvline(brk/CR, color="#c55", lw=.8)
ax[0].axvspan(0, 6, color="#ccd", alpha=.4); ax[0].text(.5, 112.5, "frozen", fontsize=9)
ax[0].text(brk/CR + .5, 112.5, "torn", fontsize=9)
ax[0].text((6 + brk/CR)/2 - 2, 112.5, "alive?", fontsize=9)
fig.suptitle("One slow sweep of stretch: where does the tone let go?", fontsize=10)
fig.tight_layout(); fig.savefig("sweep.png", dpi=110)
