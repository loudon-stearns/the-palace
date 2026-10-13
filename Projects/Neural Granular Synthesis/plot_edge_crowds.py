"""Cycle 13 plate: the lock edge for three crowds (edge-crowds.json).
    /usr/local/bin/python3 plot_edge_crowds.py"""
import json
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

BG, INK, DIM, TEAL = "#0b0b0d", "#e7e7ea", "#8a8a93", "#33e0c8"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32",
                     "text.color": INK, "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM,
                     "font.family": "monospace", "font.size": 9})
e = json.load(open("edge-crowds.json"))
cols = ["#f2b134", "#d99a4e", "#9a7fd0", "#6366f1"]
fig, ax = plt.subplots(1, 3, figsize=(13, 4.4), sharey=True)
for a, cr in zip(ax, e["crowds"]):
    for row, c in zip(cr["rows"], cols):
        a.plot(e["fractions"], row["r"], color=c, lw=2, marker="o", ms=3, label=f"life {int(row['p']*100)} %")
    a.axvline(1.0, color=TEAL, ls="--", lw=1)
    a.set_title(cr["name"], color=INK, fontsize=10, loc="left"); a.set_xlabel("tightness ÷ predicted edge")
    a.set_ylim(0, 1)
ax[0].set_ylabel("core synchrony"); ax[0].legend(frameon=False, loc="upper left", fontsize=8)
fig.suptitle("HALF THE SOFTENING WAS THE SMALL CROWD · at 512 neurons a narrower softening survives just under the edge",
             color=INK, x=0.02, ha="left", fontsize=11)
fig.tight_layout(); fig.savefig("edge-crowds.png", dpi=130); print("wrote edge-crowds.png")
