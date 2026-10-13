"""Two plates for cycle 12: the gesture's meters over time (crowd-gesture.json)
and how the lock edge softens as pacemakers are added (edge-softening.json).
    /usr/local/bin/python3 plot_crowd_gesture.py"""
import json
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

BG, INK, DIM, AMBER, INDIGO, TEAL = "#0b0b0d", "#e7e7ea", "#8a8a93", "#f2b134", "#6366f1", "#33e0c8"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32",
                     "text.color": INK, "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM,
                     "font.family": "monospace", "font.size": 9})

g = json.load(open("crowd-gesture.json")); tr = g["trace"]
t = [r["t"] for r in tr]
fig, ax = plt.subplots(3, 1, figsize=(11, 6.4), sharex=True, gridspec_kw={"height_ratios": [1, 1, 1]})
ax[0].plot(t, [r["T"] for r in tr], color=AMBER, lw=1.6, label="tightness")
ax[0].plot(t, [1 / (1 - r["p"]) for r in tr], color=TEAL, lw=1, ls="--", label="edge = 1/(1 − life)")
a2 = ax[0].twinx(); a2.plot(t, [r["p"] * 100 for r in tr], color=INDIGO, lw=1.6); a2.set_ylabel("life %", color=INDIGO)
a2.tick_params(colors=INDIGO); ax[0].set_ylabel("tightness"); ax[0].legend(loc="center left", frameon=False, fontsize=8)
ax[1].plot(t, [r["r"] for r in tr], color=AMBER, lw=1.2); ax[1].set_ylabel("core synchrony"); ax[1].set_ylim(0, 1.02)
ax[2].plot(t, [r["wob"] if r["r"] > 0.35 else None for r in tr], color=INK, lw=1.2); ax[2].set_ylabel("pitch wobble ¢")
ax[2].set_xlabel("seconds")
seen = None
for r in tr:
    lab = r["label"]
    if "→" not in lab and lab != seen:
        seen = lab; ax[0].annotate(lab, (r["t"], 5.9), color=DIM, fontsize=8, va="top")
        for a in ax: a.axvline(r["t"], color="#2a2a32", lw=0.8)
ax[0].set_ylim(0, 6.2)
fig.suptitle("THE CROWD · ONE TAKE ACROSS THE PAD · crowd-gesture.wav", color=INK, x=0.02, ha="left", fontsize=11)
fig.tight_layout(); fig.savefig("crowd-gesture.png", dpi=130); plt.close(fig)

e = json.load(open("edge-softening.json"))
fig, ax = plt.subplots(figsize=(8, 4.6))
cols = [AMBER, "#d99a4e", "#9a7fd0", INDIGO]
for row, c in zip(e["rows"], cols):
    ax.plot(e["fractions"], row["r"], color=c, lw=2, marker="o", ms=3, label=f"life {int(row['p']*100)} %")
ax.axvline(1.0, color=TEAL, ls="--", lw=1); ax.annotate("predicted edge", (1.01, 0.08), color=TEAL, fontsize=8)
ax.set_xlabel("tightness ÷ predicted edge   (edge = 1 / (1 − life))"); ax.set_ylabel("core synchrony (128 neurons, 3 crowds)")
ax.set_ylim(0, 1); ax.legend(frameon=False, loc="upper left")
ax.set_title("THE EDGE STAYS PUT BUT SOFTENS · a switch with no pacemakers, a crossfade at two-thirds",
             color=INK, fontsize=10, loc="left")
fig.tight_layout(); fig.savefig("edge-softening.png", dpi=130)
print("wrote crowd-gesture.png, edge-softening.png")
