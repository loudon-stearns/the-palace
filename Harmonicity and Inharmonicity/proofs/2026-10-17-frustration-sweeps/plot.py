import numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
import frustration as fz
fz.rng = np.random.default_rng(7); fz.DETUNE = 1 + fz.rng.uniform(-0.004, 0.004, fz.N)
scenes = [("harmonic (B=0)", 0.0, 1), ("piano-ish (B=0.0004)", 0.0004, 1),
          ("strong (B=0.004)", 0.004, 1), ("bell-wide (B=0.02)", 0.02, 1), ("bell-wide, heavy master", 0.02, 60)]
fig, ax = plt.subplots(len(scenes), 1, figsize=(9, 9), sharex=True)
for a, (name, B, I) in zip(ax, scenes):
    _, f, _ = fz.scene(B, I)
    t = np.arange(len(f)) / fz.CR
    k = 220; fs = np.convolve(f, np.ones(k)/k, mode="same")   # 50 ms smoothing
    a.plot(t, fs, lw=1, color="#333"); a.axhline(110, color="#c55", lw=.6, ls="--")
    a.set_ylim(80, 125); a.set_ylabel("Hz"); a.set_title(name, fontsize=9, loc="left")
ax[-1].set_xlabel("seconds")
fig.suptitle("The participant's fundamental, pulled by six outside players (50 ms average)", fontsize=10)
fig.tight_layout(); fig.savefig("frustration-fundamental.png", dpi=110)
