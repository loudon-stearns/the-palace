"""Cycle 14 plate: the lock edge, four crowds — random (cycle 13) beside
evenly spread with the fixed pacemaker headcount (edge-headcount.json).
    /usr/local/bin/python3 plot_edge_headcount.py"""
import json
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

BG, INK, DIM, TEAL = "#0b0b0d", "#e7e7ea", "#8a8a93", "#33e0c8"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32",
                     "text.color": INK, "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM,
                     "font.family": "monospace", "font.size": 9})
old = json.load(open("edge-crowds.json")); new = json.load(open("edge-headcount.json"))
panels = [(old, old["crowds"][0]), (old, old["crowds"][1]), (new, new["crowds"][0]), (new, new["crowds"][1])]
cols = ["#f2b134", "#d99a4e", "#9a7fd0", "#6366f1"]
fig, ax = plt.subplots(1, 4, figsize=(16, 4.4), sharey=True)
for a, (src, cr) in zip(ax, panels):
    for row, c in zip(cr["rows"], cols):
        a.plot(src["fractions"], row["r"], color=c, lw=2, marker="o", ms=3, label=f"life {int(round(row['p']*100))} %")
    a.axvline(1.0, color=TEAL, ls="--", lw=1)
    a.set_title(cr["name"], color=INK, fontsize=10, loc="left"); a.set_xlabel("tightness ÷ predicted edge")
    a.set_ylim(0, 1)
ax[0].set_ylabel("core synchrony"); ax[0].legend(frameon=False, loc="upper left", fontsize=8)
fig.suptitle("THE SOFT LOCK IS LUMPINESS · spread the crowd evenly and the lock is a switch at any life",
             color=INK, x=0.02, ha="left", fontsize=11)
fig.tight_layout(); fig.savefig("edge-headcount.png", dpi=130); print("wrote edge-headcount.png")
