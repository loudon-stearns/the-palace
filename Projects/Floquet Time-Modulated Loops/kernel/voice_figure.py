"""The tracker's error budget, drawn: harmonicity of the locked scan against pitch error and pitch lag.
Run after voice.py:  /usr/local/bin/python3 kernel/voice_figure.py → kernel/voice_budget.png"""
import json, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from pathlib import Path
HERE = Path(__file__).resolve().parent
b = json.load(open(HERE / "voice_report.json"))["error_budget"]
fig, ax = plt.subplots(1, 2, figsize=(10, 3.8), sharey=True)
style = {"Theta, locked to 2 × pitch": ("#3a7ca5", "Theta at 2× — moves partials 2 harmonics"),
         "Knot Shadow, locked to 1/3 × pitch": ("#81a684", "Knot Shadow at 1/3 — moves 1, 2 or 3 down"),
         "Penrose, locked to 2 × pitch": ("#c8553d", "Penrose at 2× — moves 12 and 20")}
for k, (c, lab) in style.items():
    e = b[k]["pitch_off_by_pct"]; l = b[k]["pitch_late_by_ms"]
    ax[0].plot([float(x) for x in e], list(e.values()), "o-", color=c, label=lab)
    ax[1].plot([float(x) for x in l], list(l.values()), "o-", color=c, label=lab)
ax[0].set_xlabel("pitch given to the scan, % sharp"); ax[1].set_xlabel("pitch given to the scan, ms late")
ax[0].set_ylabel("share of energy on harmonics"); ax[0].set_ylim(0, 1)
for a in ax: a.grid(alpha=.3); a.spines[["top", "right"]].set_visible(False)
ax[0].axvspan(0, 1, color="#999", alpha=.12); ax[0].text(1.1, 0.3, "cycle 7 tracker's\nmedian error ≈ 0.9 %", fontsize=8)
ax[1].legend(fontsize=8, loc="lower left", frameon=False)
fig.suptitle("Daniel rebuilt with a known pitch: what a wrong or late pitch costs the locked scan", fontsize=10)
fig.tight_layout(); fig.savefig(HERE / "voice_budget.png", dpi=140)
