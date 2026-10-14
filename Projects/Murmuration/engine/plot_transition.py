"""transition.png — top: the flock's order φ against Disorder η (steady state, 8 seeds),
with the old linear slider and the new squared one marked; bottom: the 40-second take —
the flock's φ, and how focused the sound's pitch is under the first-build mapping versus
the order mapping (the order curve is the mean of blind X and Y, so it stays blind).
    /usr/local/bin/python3 plot_transition.py"""
import json, numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
BG, INK, DIM, AMBER, INDIGO, TEAL = "#0b0b0d", "#e7e7ea", "#8a8a93", "#f2b134", "#6366f1", "#33e0c8"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32", "text.color": INK,
                     "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM, "font.family": "monospace", "font.size": 9})
sw = json.load(open("eta_sweep.json")); an = json.load(open("takes_analysis.json"))
tr = json.load(open("wager_trace-order.json"))
fig, (a1, a2) = plt.subplots(2, 1, figsize=(10, 8.2), gridspec_kw={"height_ratios": [1, 1.1]})
e = np.array([r["eta"] for r in sw["fresh"]]); p = np.array([r["phi"] for r in sw["fresh"]]); fl = np.array([r["fluct"] for r in sw["fresh"]])
a1.fill_between(e, p - fl, p + fl, color=TEAL, alpha=.15, lw=0)
a1.plot(e, p, color=TEAL, lw=2, label="φ, settled from a fresh flock (8 seeds)")
a1.plot([r["eta"] for r in sw["up"]], [r["phi"] for r in sw["up"]], color=AMBER, lw=1, ls="--", label="η raised slowly from order")
a1.plot([r["eta"] for r in sw["down"]], [r["phi"] for r in sw["down"]], color=INDIGO, lw=1, ls=":", label="η lowered slowly from chaos")
a1.axvspan(0, 0.15, color=AMBER, alpha=.06)
a1.axvline(0.06, color=INK, lw=.8, alpha=.6); a1.text(0.065, 0.97, "page default η 0.06 —\nright on the knee", color=INK, fontsize=8, va="top")
a1.text(0.42, 0.42, "old slider: η 0–1 linear → the whole transition\nlives in the first ~15% of the travel (shaded)\n\nnew slider: η = 0.25·x² → knee at mid-slider", color=DIM, fontsize=8.5)
a1.set_xlim(0, 1); a1.set_ylim(0, 1.02); a1.set_xlabel("Disorder η (heading noise per frame, × π)"); a1.set_ylabel("order φ (polarization)")
a1.set_title("The transition is real — and it lives in a sliver of the slider", color=INK, loc="left", fontsize=11)
a1.legend(loc="upper right", frameon=False, fontsize=8)
t = np.array([r["t"] for r in tr]); a2.plot(t, [r["phi"] for r in tr], color=TEAL, lw=1.6, label="flock order φ (left axis)")
a2.plot(t, [r["x"] for r in tr], color=DIM, lw=.8, ls="--", label="Disorder slider position x")
a2.set_ylim(0, 1.02); a2.set_ylabel("φ  ·  slider x"); a2.set_xlabel("seconds")
b = a2.twinx(); b.set_ylabel("pitch-class entropy, bits (lower = more focused)", color=DIM)
keep = lambda a: a[(a[:, 0] > 0.6) & (a[:, 0] < 38.8)]
pg = keep(np.array(an["page/flock"]["trace"])); ox = keep(np.array(an["order/flock"]["trace"])); oa = keep(np.array(an["order/authored"]["trace"]))
k = 7; sm = lambda y: np.convolve(y, np.ones(k) / k, mode="same")
keep = lambda a: a[(a[:, 0] > 0.6) & (a[:, 0] < 38.8)]
b.plot(pg[k:-k, 0], sm(pg[:, 1])[k:-k], color=INDIGO, lw=1.4, label="sound, first-build mapping")
b.plot(ox[k:-k, 0], sm((ox[:, 1] + oa[:, 1]) / 2)[k:-k], color=AMBER, lw=1.6, label="sound, order mapping (mean of X and Y)")
b.set_ylim(1.9, 3.6); b.tick_params(colors=DIM)
for x0, lab in [(2.5, "melted"), (9.5, "crystallise"), (17, "ordered"), (21, "predator"), (31.5, "melt")]: a2.text(x0, 1.0, lab, color=DIM, fontsize=8, va="top")
a2.axvline(21, color=INK, lw=.6, alpha=.4)
h1, l1 = a2.get_legend_handles_labels(); h2, l2 = b.get_legend_handles_labels(); a2.legend(h1 + h2, l1 + l2, loc="lower center", frameon=False, fontsize=8, ncol=2)
a2.set_title("…and under the first mapping it never reaches the sound", color=INK, loc="left", fontsize=11)
fig.tight_layout(); fig.savefig("../transition.png", dpi=130, facecolor=BG)
