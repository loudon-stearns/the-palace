"""Figure for the Stage 4 first proof. Run after inverse.py."""
import json, sys, numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from pathlib import Path
from scipy.io import wavfile
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from inverse import design, piano, HANN, RECT, surface, saw, run, FS
fig, ax = plt.subplots(1, 3, figsize=(16, 4.6))
k = np.arange(1, 25)
for ratio, col in ((32, "#c0392b"), (128, "#2e86c1")):
    md, fm = design(piano(), 196.0, HANN, ratio)
    ax[0].plot(k, [1200 * np.log2(d["lands"] / (i * 196.0)) for i, d in zip(k, md)], "o", color=col, ms=5,
               label=f"landed, scan = pitch/{ratio}")
ax[0].plot(k, [1200 * np.log2(np.sqrt(1 + 4e-4 * i * i)) for i in k], "k-", lw=1, label="piano target (B = 0.0004)")
ax[0].set(xlabel="partial", ylabel="cents above the harmonic", title="Working backward: stretched partials, G3")
ax[0].legend(fontsize=8)
S = np.load(HERE / "surfaces" / "piano_G3_hann.npy")
ax[1].imshow(S, aspect="auto", cmap="RdBu_r", vmin=-np.abs(S).max(), vmax=np.abs(S).max())
ax[1].set(xlabel="tap (the filter, 512 taps)", ylabel="row (scanned at pitch/32)", title="The solved surface — a wavetable")
md, fm = design(piano(), 196.0, HANN)
x = saw(196.0, 4 * FS)
for win, lab, col in ((RECT, "no window", "#999"), (HANN, "Hann window", "#2e86c1")):
    md, fm = design(piano(), 196.0, win)
    y = run(surface(md, win), x, fm)[-2 * FS:]
    P = np.abs(np.fft.rfft(y * np.hanning(len(y)), 8 * len(y))); f = np.fft.rfftfreq(8 * len(y), 1 / FS)
    sel = (f > 1300) & (f < 2300)
    ax[2].plot(f[sel], 20 * np.log10(P[sel] / P.max() + 1e-12), color=col, lw=0.8, label=lab)
ax[2].set(xlabel="Hz", ylabel="dB", ylim=(-120, 0), title="Why Hann: stray lines between the partials")
ax[2].legend(fontsize=8)
plt.tight_layout(); plt.savefig(HERE / "inverse_figure.png", dpi=110)
