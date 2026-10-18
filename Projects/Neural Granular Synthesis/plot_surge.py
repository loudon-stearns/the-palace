# Cycle 16: plot meter-noise.json — core synchrony r(t) just under the lock (0.9×),
# even crowd, at three pacemaker shares; right panel: swing size vs share.
#   /usr/local/bin/python3 plot_surge.py
import json, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np
d = json.load(open("meter-noise.json"))
fig, ax = plt.subplots(1, 2, figsize=(12, 4.2), gridspec_kw={"width_ratios": [2.2, 1]})
cols = {0: "#4a6fa5", 0.2: "#c08a2e", 0.5: "#b23a48"}
for s in d["series"]:
    if s["L"] == 0 and s["f"] == 0.9:
        r = np.array(s["r_1k_first2s"]); ax[0].plot(np.arange(len(r)) / 1000, r, color=cols[s["p"]], lw=1.1, label=f"{int(s['p']*100)}% pacemakers")
ax[0].axhline(0.055, color="0.6", ls=":", lw=1); ax[0].text(1.98, 0.06, "chance level", ha="right", fontsize=8, color="0.45")
ax[0].set(xlabel="seconds", ylabel="core synchrony r", title="Even crowd held at 0.9× of its lock point", ylim=(0, 1)); ax[0].legend(frameon=False, fontsize=9)
for L, mk in [(0, "o-"), (1, "s--")]:
    rows = [r for r in d["rows"] if r["L"] == L and r["f"] == 0.9]
    ax[1].plot([r["p"] * 100 for r in rows], [r["sd_per_sample"] for r in rows], mk, color="#333" if L == 0 else "#999", label="even" if L == 0 else "lumpy")
ax[1].set(xlabel="pacemaker share %", ylabel="swing of r (std. dev.)", title="Pacemakers make it surge", ylim=(0, 0.2)); ax[1].legend(frameon=False, fontsize=9)
for a in ax: a.spines[["top", "right"]].set_visible(False)
plt.tight_layout(); plt.savefig("surge-before-lock.png", dpi=130)
