"""Particle Synthesis · 2026-11-11 · the etude for two hands of ice, as a picture: the score, the meetings, the spectrogram.
Reads the raw float render and score the harness leaves in /tmp/ps8. Run with /usr/local/bin/python3 (needs matplotlib, scipy)."""
import json, numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.signal import spectrogram
SR = 48000
meta = json.load(open("/tmp/ps8/etude-meta.json"))
B = meta["B"]
per = np.array(meta["perBlock"])
tb = (np.arange(len(per)) + 1) * B / SR
T = 44
col = {"L": "#7fd3e6", "R": "#e9a75a", "B": "#c9a2f0"}
fig = plt.figure(figsize=(13, 8.2), facecolor="#0e1116")
gs = fig.add_gridspec(4, 1, height_ratios=[1.1, 0.6, 2.6, 1.6])
def style(ax):
    ax.set_facecolor("#0a0d11"); ax.tick_params(colors="#8b8f98", labelsize=8)
    for s in ax.spines.values(): s.set_color("#2a313b")
    ax.set_xlim(0, T)

ax = fig.add_subplot(gs[0]); style(ax)
rowy = {"R": 2, "B": 1, "L": 0}
for e in meta["score"]:
    y = rowy[e["zone"]] + 0.8 * e["x"] - 0.4
    d = max(e.get("dur", 0), 0.08)
    ax.add_patch(plt.Rectangle((e["t"], y - 0.06 * e.get("count", 1)), d, 0.12 * e.get("count", 1), color=col[e["zone"]]))
ax.set_ylim(-0.6, 2.6); ax.set_yticks([0, 1, 2]); ax.set_yticklabels(["left", "both", "right"], color="#8b8f98")
for t, name in meta["sections"]:
    ax.axvline(t, color="#2a313b", lw=0.8); ax.text(t + 0.15, 2.45, name, color="#e6e1d6", fontsize=8, va="top")
ax.set_title("the score: each note on its row, higher in the row = a harder throw; bar length = how long it was held, thickness = handful",
             color="#e6e1d6", fontsize=9.5, loc="left")

ax = fig.add_subplot(gs[1]); style(ax)
ax.bar(tb, per, width=B / SR, color="#ffd28a")
ax.set_ylabel("meetings", color="#8b8f98", fontsize=8)
ax2 = ax.twinx(); ap = np.array(meta["aimPath"]); ax2.plot(ap[:, 0], ap[:, 1], color="#7fd3e6", lw=1); ax2.set_yscale("log")
ax2.tick_params(colors="#7fd3e6", labelsize=7); ax2.set_ylabel("aim °", color="#7fd3e6", fontsize=8)
ax.set_title("meetings in the air (bars) and the aim's scatter (line)", color="#e6e1d6", fontsize=9.5, loc="left")

x = np.fromfile("/tmp/ps8/etude.f32", dtype=np.float32).reshape(-1, 2)[:, 0].astype(float)
ax = fig.add_subplot(gs[2]); style(ax)
f, t, S = spectrogram(x, SR, nperseg=2048, noverlap=1536)
D = 10 * np.log10(S + 1e-20); D -= D.max()
ax.pcolormesh(t, f, D, vmin=-75, vmax=0, cmap="magma", shading="auto")
ax.set_yscale("log"); ax.set_ylim(80, 20000); ax.set_ylabel("Hz", color="#8b8f98")
ax.set_title("left pickup: every landing is a chirp sweeping down; each clack is a thin vertical reaching 20 kHz", color="#e6e1d6", fontsize=9.5, loc="left")

z0, z1 = 15.0, 17.6
ax = fig.add_subplot(gs[3]); style(ax); ax.set_xlim(z0, z1)
seg = x[int(z0 * SR):int(z1 * SR)]
f, t, S = spectrogram(seg, SR, nperseg=256, noverlap=192)
D = 10 * np.log10(S + 1e-20); D -= D.max()
ax.pcolormesh(t + z0, f, D, vmin=-70, vmax=0, cmap="magma", shading="auto")
ax.set_yscale("log"); ax.set_ylim(80, 20000); ax.set_xlabel("seconds", color="#8b8f98", fontsize=9)
for e in meta["score"]:
    if z0 <= e["t"] <= z1: ax.axvline(e["t"], color=col[e["zone"]], lw=1, ls=":")
ax.set_title(f"zoom {z0}–{z1} s: the key goes down at the dotted line; the clack comes about half a second later, the landings after that",
             color="#e6e1d6", fontsize=9.5, loc="left")
fig.suptitle("Etude for two hands of ice · 1024 grain slots on the GPU · a written score, played through the instrument's own hands",
             color="#e6e1d6", fontsize=12, x=0.01, ha="left")
fig.tight_layout()
fig.savefig("2026-11-11-two-hands-etude.png", dpi=110, facecolor=fig.get_facecolor())
for (a, name), (b, _) in zip(meta["sections"], meta["sections"][1:] + [(T, "")]):
    m = (tb > a) & (tb <= b)
    seg = x[int(a * SR):int(b * SR)]
    print(f"{name:14s} meetings {int(per[m].sum()):4d}  rms {20*np.log10(np.sqrt((seg**2).mean())+1e-12):6.1f} dB(raw)")
