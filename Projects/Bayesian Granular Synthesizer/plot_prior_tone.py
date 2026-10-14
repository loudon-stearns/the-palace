"""Grain maps for the prior-tone A/B/C: every third grain as a dot, pitch over time,
colour and size by grain length (4 cycles = a dim click, 128 = a bright tone).
The painted belief is drawn as a strip on the left.
    /usr/local/bin/python3 plot_prior_tone.py   (after node RNBO/prior_tone_ab.mjs)"""
import json
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

BG, INK, DIM = "#0b0b0d", "#e7e7ea", "#8a8a93"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32",
                     "text.color": INK, "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM,
                     "font.family": "monospace", "font.size": 9})
g = json.load(open("RNBO/prior_tone_grains.json")); rep = json.load(open("RNBO/prior_tone_report.json"))
titles = {"A": "A · prior tone off — the resting belief is heard only as where the clicks land",
          "B": "B · prior tone on — grains on a painted peak grow long in proportion to its height",
          "C": "C · prior tone on, wider zone — more hum, but long grains up to ~25 cents off the note"}
names = {38: "D2", 50: "D3", 57: "A3", 60: "C4", 62: "D4", 64: "E4", 67: "G4", 69: "A4", 52: "E3", 56: "G#3", 59: "B3"}
fig, ax = plt.subplots(3, 1, figsize=(11, 9), sharex=True)
for a, k in zip(ax, ["A", "B", "C"]):
    d = np.array(g["takes"][k]); t, m, c = d[:, 0], d[:, 1], d[:, 2]
    lc = np.log2(c) - 2  # 0..5
    sel = (m > 34) & (m < 76)
    a.scatter(t[sel], m[sel], s=1 + lc[sel] ** 2 * 1.4, c=lc[sel], cmap="inferno", vmin=-0.5, vmax=5, linewidths=0, alpha=0.8)
    for mm, w in rep["belief"].items():
        a.plot([-0.9, -0.9 + 0.8 * w], [int(mm)] * 2, color="#33e0c8", lw=2.2, solid_capstyle="butt")
    for t0, lab in g["labels"]:
        a.axvline(t0, color="#2a2a32", lw=0.8)
    r = rep["takes"][k]["resting"]
    a.set_title(f'{titles[k]}   (resting: median {r["median_cycles"]} cycles, {round(100 * r["long_share"])}% long)', loc="left", fontsize=9, color=INK)
    a.set_yticks(list(names)); a.set_yticklabels(list(names.values()), fontsize=7); a.set_ylim(35, 74); a.set_xlim(-1, g["dur"])
for t0, lab in g["labels"]:
    ax[0].text(t0 + 0.2, 73.3, lab, color=INK, fontsize=7.5, va="top", bbox=dict(facecolor=BG, edgecolor="none", alpha=0.75, pad=1.5))
ax[2].set_xlabel("seconds  (teal strip at left: the painted belief, one bar per semitone)")
fig.tight_layout(); fig.savefig("prior-tone-ab.png", dpi=120)
print("wrote prior-tone-ab.png")
