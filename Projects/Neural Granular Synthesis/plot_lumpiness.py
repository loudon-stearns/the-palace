"""Cycle 15 plate: the lumpiness knob — lock curves at two lives, and the
audition's synchrony over time (lumpiness.json, lumpiness-trace.json).
    /usr/local/bin/python3 plot_lumpiness.py"""
import json
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

BG, INK, DIM, TEAL = "#0b0b0d", "#e7e7ea", "#8a8a93", "#33e0c8"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32",
                     "text.color": INK, "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM,
                     "font.family": "monospace", "font.size": 9})
d = json.load(open("lumpiness.json")); tr = json.load(open("lumpiness-trace.json"))
cols = {0: "#6366f1", 0.25: "#9a7fd0", 0.5: "#d99a4e", 1: "#f2b134"}
fig, ax = plt.subplots(1, 3, figsize=(15, 4.4))
for a, p in zip(ax[:2], [0, 0.5]):
    for row in [r for r in d["rows"] if r["p"] == p]:
        a.plot(d["fractions"], row["r"], color=cols[row["L"]], lw=2, marker="o", ms=3,
               label=f"lumpiness {row['L']} · 30→70 % over {row['width_30_70']}")
    a.axvline(1.0, color=TEAL, ls="--", lw=1); a.set_ylim(0, 1)
    a.set_title(f"512 neurons · life {int(p*100)} %", color=INK, fontsize=10, loc="left")
    a.set_xlabel("tightness ÷ predicted edge"); a.legend(frameon=False, loc="upper left", fontsize=7.5)
ax[0].set_ylabel("core synchrony")
for t in tr:
    xs = [r[0] for r in t["trace"]]; ys = [r[2] for r in t["trace"]]
    ax[2].plot(xs, ys, color=cols[t["L"]], lw=1.6, label=f"lumpiness {t['L']}")
ax[2].axvline(4.0, color=TEAL, ls="--", lw=1)
ax[2].set_title("the audition · life 50 % · tightness 0.8× → 1.15× over 7 s", color=INK, fontsize=10, loc="left")
ax[2].set_xlabel("seconds (edge crossed at 4.0 s)"); ax[2].set_ylim(0, 1); ax[2].legend(frameon=False, fontsize=8)
fig.suptitle("LUMPINESS SETS HOW HARD THE LOCK HITS · and nudges the edge ~3 % early",
             color=INK, x=0.02, ha="left", fontsize=11)
fig.tight_layout(); fig.savefig("lumpiness.png", dpi=130); print("wrote lumpiness.png")
