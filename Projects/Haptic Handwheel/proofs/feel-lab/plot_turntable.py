# Draws turntable_hold.png from turntable_results.json (render_turntable.mjs calls it).
import json, os
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
here = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(here, "turntable_results.json")))
plt.rcParams.update({"font.family": "monospace", "text.color": "#e8e6df", "axes.labelcolor": "#8a8a96",
                     "xtick.color": "#8a8a96", "ytick.color": "#8a8a96"})
fig, ax = plt.subplots(figsize=(10.4, 4.7), dpi=110, facecolor="#0a0a0f")
ax.set_facecolor("#0a0a0f")
for a, b in [(3, 4), (6.5, 7.5)]: ax.axvspan(a, b, color="#16161d")
cols = ["#8a8a96", "#c8261a", "#5a8fb8", "#e8b84a"]
for (label, tr), c in zip(d["traces"].items(), cols):
    ax.plot([k * 0.01 for k in range(len(tr))], [p * 100 for p in tr], color=c, lw=1.6, label=label)
ax.set_ylim(-5, 300); ax.set_xlim(0, 10); ax.axhline(100, color="#3a3a46", lw=0.8)
ax.set_xlabel("seconds"); ax.set_ylabel("% of 33 1/3 rpm")
for s in ax.spines.values(): s.set_color("#23232c")
ax.text(3.5, 285, "finger drags", ha="center", color="#8a8a96", fontsize=9)
ax.text(7.0, 285, "hand scratches", ha="center", color="#8a8a96", fontsize=9)
fig.suptitle("Turntable: platter speed · pretend motor, brake cancelled", x=0.02, ha="left", color="#e8e6df")
ax.legend(loc="upper right", bbox_to_anchor=(1, 0.88), facecolor="#0a0a0f", edgecolor="#23232c", labelcolor="#c9c6bd", fontsize=9)
fig.tight_layout()
fig.savefig(os.path.join(here, "turntable_hold.png"), facecolor="#0a0a0f")
