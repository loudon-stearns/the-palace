"""Particle Synthesis · 2026-10-22 · spectrograms of the GPU meet / pass-through pair, with meetings per moment.
Reads the raw float renders the harness leaves in /tmp/ps7. Run with /usr/local/bin/python3 (needs matplotlib, scipy)."""
import json, numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.signal import spectrogram
SR, B = 48000, 4096
per = np.array(json.load(open("/tmp/ps7/meet-perblock.json")))
tb = (np.arange(len(per)) + 1) * B / SR
aim = np.exp(np.log(6) + (np.log(0.15) - np.log(6)) * np.arange(len(per)) / (len(per) - 1))
fig = plt.figure(figsize=(13, 8.4), facecolor="#0e1116")
gs = fig.add_gridspec(3, 2, height_ratios=[0.7, 2, 2], width_ratios=[3, 1.2])
def style(ax):
    ax.set_facecolor("#0a0d11"); ax.tick_params(colors="#8b8f98", labelsize=8)
    for s in ax.spines.values(): s.set_color("#2a313b")
ax = fig.add_subplot(gs[0, 0]); style(ax)
ax.bar(tb, per / (B / SR), width=B / SR, color="#e9a75a")
ax.set_xlim(0, 16); ax.set_ylabel("meetings/s", color="#8b8f98", fontsize=8)
ax2 = ax.twinx(); ax2.plot(tb, aim, color="#7fd3e6", lw=1); ax2.set_yscale("log"); ax2.tick_params(colors="#7fd3e6", labelsize=8)
ax2.set_ylabel("aim scatter °", color="#7fd3e6", fontsize=8)
ax.set_title("meetings in the air per second (bars) as the aim tightens (line)", color="#e6e1d6", fontsize=10, loc="left")
z0 = 13.0
for row, (name, title) in enumerate([("meet", "A · grains meet: every clack is a thin bright vertical among the slanted landings"),
                                     ("pass", "B · pass through: the same 1544 throws, collisions off")]):
    x = np.fromfile(f"/tmp/ps7/{name}.f32", dtype=np.float32).reshape(-1, 2)[:, 0].astype(float)
    for col, (t0, t1) in enumerate([(0, 16), (z0, z0 + 0.5)]):
        ax = fig.add_subplot(gs[row + 1, col]); style(ax)
        seg = x[int(t0 * SR):int(t1 * SR)]
        nper = 2048 if col == 0 else 256
        f, t, S = spectrogram(seg, SR, nperseg=nper, noverlap=nper * 3 // 4)
        D = 10 * np.log10(S + 1e-20); D -= D.max()
        ax.pcolormesh(t + t0, f, D, vmin=-70, vmax=0, cmap="magma", shading="auto")
        ax.set_yscale("log"); ax.set_ylim(80, 20000)
        ax.set_title(title if col == 0 else f"zoom {z0:.1f}–{z0 + 0.5:.1f} s", color="#e6e1d6", fontsize=10, loc="left")
        if col == 0: ax.set_ylabel("Hz", color="#8b8f98")
        if row == 1: ax.set_xlabel("seconds · aim tightening 6° → 0.15°", color="#8b8f98", fontsize=9)
fig.suptitle("1024 ice grains on the GPU, two fountains aimed at each other · same throws in A and B", color="#e6e1d6", fontsize=12, x=0.01, ha="left")
fig.tight_layout()
fig.savefig("2026-10-22-gpu-grains-meet-AB.png", dpi=110, facecolor=fig.get_facecolor())
h = len(per) // 2
print("meetings first half", per[:h].sum(), "second half", per[h:].sum(), "max/s", (per / (B / SR)).max())
