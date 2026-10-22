"""Particle Synthesis · 2026-10-22 · spectrograms of the GPU A/B (same 1024-particle fountain, two ways to hear it).
Reads the raw float renders the harness leaves in /tmp/ps6. Run with /usr/local/bin/python3 (needs matplotlib)."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.signal import spectrogram
SR = 48000
fig, axes = plt.subplots(2, 2, figsize=(13, 7.2), gridspec_kw={"width_ratios": [3, 1.2]}, facecolor="#0e1116")
for row, (name, title) in enumerate([("ice", "A · heard through the ice: every strike travels the plate, highs first"),
                                     ("mapped", "B · mapped grains: the same strikes, pitch chosen by distance")]):
    x = np.fromfile(f"/tmp/ps6/{name}.f32", dtype=np.float32).reshape(-1, 2)[:, 0].astype(float)
    for col, (t0, t1) in enumerate([(0, 16), (10.0, 10.6)]):
        ax = axes[row, col]
        seg = x[int(t0 * SR):int(t1 * SR)]
        nper = 2048 if col == 0 else 512
        f, t, S = spectrogram(seg, SR, nperseg=nper, noverlap=nper * 3 // 4)
        D = 10 * np.log10(S + 1e-20); D -= D.max()
        ax.pcolormesh(t + t0, f, D, vmin=-70, vmax=0, cmap="magma", shading="auto")
        ax.set_yscale("log"); ax.set_ylim(80, 16000)
        ax.set_facecolor("#0a0d11"); ax.tick_params(colors="#8b8f98", labelsize=8)
        for s in ax.spines.values(): s.set_color("#2a313b")
        ax.set_title(title if col == 0 else "zoom 10.0–10.6 s", color="#e6e1d6", fontsize=10, loc="left")
        if col == 0: ax.set_ylabel("Hz", color="#8b8f98")
        if row == 1: ax.set_xlabel("seconds · fountain walks 3 m → 18 m from the pickups", color="#8b8f98", fontsize=9)
fig.suptitle("1024 particles on the GPU · 22,666 strikes in 16 s · identical throws in A and B", color="#e6e1d6", fontsize=12, x=0.01, ha="left")
fig.tight_layout()
fig.savefig("2026-10-22-gpu-fountain-AB.png", dpi=110, facecolor=fig.get_facecolor())
print("ok")
