"""comb_figure.py — comb_tongues.png from the saved measurements (no re-simulation)."""
import numpy as np, json, sys, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
sys.path.insert(0, "../python"); from mathieu_core import PALETTE as P
d = np.load("comb_tongues.npz"); fw = json.load(open("comb_filter_width.json")); tr = np.load("comb_patterns_trips.npy")
plt.rcParams.update({"figure.facecolor": P["bg"], "axes.facecolor": P["bg_card"], "axes.edgecolor": P["border"],
    "text.color": P["text"], "axes.labelcolor": P["text"], "xtick.color": P["text_dim"], "ytick.color": P["text_dim"], "font.size": 10})
fig = plt.figure(figsize=(13, 8.2)); gs = fig.add_gridspec(2, 3, height_ratios=[1.15, 1], hspace=0.42, wspace=0.28)
ax = fig.add_subplot(gs[0, :])
W = d["wide"]; ax.pcolormesh(d["wide_r"], d["epss"], (W > 0).T * 1.0, cmap=matplotlib.colors.ListedColormap([P["bg_card"], P["unstable"]]), shading="nearest")
ax.set_xlabel("pump rate ÷ loop rate"); ax.set_ylabel("pump depth ε")
ax.set_title("The pumped comb's tongues: where a ring grows from noise (orange). Loop gain 0.98, f₀ ≈ 220 Hz, Karplus-Strong filter", color=P["text_bright"], loc="left")
for m in (1, 2, 3): ax.annotate(f"{m}× — {m} pulse slot{'s' if m>1 else ''} per trip", (m, 0.24), xytext=(m + 0.06, 0.2), color=P["text_bright"], fontsize=9, arrowprops=dict(arrowstyle="-", color=P["text_dim"]))
ax.axhline(1 / 0.98 - 1, color=P["marginal"], lw=0.8, ls=":"); ax.text(0.42, 1 / 0.98 - 1 + 0.006, "ε = 1/g₀ − 1: the pump peak just reaches unity gain", color=P["marginal"], fontsize=8.5)
ax.text(1.12, 0.10, "between the integers: nothing grows, at any depth tried\n(the Mathieu resonator's tongues sit at 2/n and are ~10 % wide;\nthese sit at whole numbers and are hair-thin)", color=P["text_dim"], fontsize=9)
ax2 = fig.add_subplot(gs[1, 0]); eps = [0.05, 0.1, 0.2, 0.4]
cols = [P["stable"], P["multiplier"], P["mod"], P["carrier"] if "carrier" in P else P["unstable"], P["marginal"]]
for c, p in zip(cols, (1, 2, 4, 8, 16)):
    hw = [(fw[f"p{p}"][f"eps_{e}"][1] - fw[f"p{p}"][f"eps_{e}"][0]) / 2 * 1200 / np.log(2) for e in eps]
    ax2.plot(eps, hw, "o-", color=c, label=f"filter order {p}" + (" (K-S)" if p == 1 else ""))
ax2.set_xlabel("pump depth ε"); ax2.set_ylabel("lock half-width (cents)"); ax2.legend(fontsize=8, facecolor=P["bg_card"], edgecolor=P["border"])
ax2.set_title("A darker string locks over a wider range", color=P["text_bright"], fontsize=10, loc="left")
ax3 = fig.add_subplot(gs[1, 1:]); n = tr.shape[1]
for i, (s, c) in enumerate(zip((3, 4, 5), (P["multiplier"], P["unstable"], P["stable"]))):
    ax3.plot(np.arange(n) / 48000 * 1000, tr[i] / np.abs(tr[i]).max() + 2.4 * (2 - i), color=c, lw=0.9)
    ax3.text(0.05, 2.4 * (2 - i) + 0.75, f"noise seed {s}", color=c, fontsize=8.5)
ax3.set_yticks([]); ax3.set_xlabel("ms (the last two trips of the loop)")
ax3.set_title("Pumped at 3× the loop rate, same knobs: the noise decides which slots fill", color=P["text_bright"], fontsize=10, loc="left")
fig.savefig("comb_tongues.png", dpi=130, bbox_inches="tight"); print("ok")
