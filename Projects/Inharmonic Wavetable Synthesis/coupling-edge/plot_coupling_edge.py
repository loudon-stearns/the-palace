#!/usr/bin/env python3
"""The coupling edge in three panels, from the tracked data this folder makes.
  python3 plot_coupling_edge.py     (reads edge-table.json, answers.json, figure-data.json; writes coupling-edge.png)

Left: where the edge sits, by partial count, at three couplings (the frozen map's two K = 6 cells marked).
Middle: the same breathing range with coupling that follows loudness: the edge dissolves.
Right: the pinned string-to-bar morph under fixed and nearest pairing: the pitch's wobble above, and below it how many
partials are locked to a voice. Both bars are steady; only with re-pairing do the bar's partials agree with the voices.
Colours: the palace graphite ground; ordered series on the amber ramp, the two pairings amber and blue
(validated with the dataviz skill's checker, dark mode, surface #12121a)."""
import json, os, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
here = os.path.dirname(os.path.abspath(__file__)); J = lambda f: json.load(open(os.path.join(here, f)))
E, A, F = J("edge-table.json"), J("answers.json"), J("figure-data.json")
SURF, INK, INK2, GRID = "#12121a", "#c8c8d8", "#8a8aa0", "#2a2a38"
RAMP, AMBER, BLUE = ["#7a6030", "#b5832a", "#f0d08a"], "#b5832a", "#4a8fff"
plt.rcParams.update({"font.size": 9, "text.color": INK, "axes.labelcolor": INK2, "xtick.color": INK2, "ytick.color": INK2,
                     "axes.edgecolor": GRID, "axes.facecolor": SURF, "figure.facecolor": SURF, "legend.frameon": False})
fig = plt.figure(figsize=(13.5, 5.2)); gs = fig.add_gridspec(2, 3, height_ratios=(1.25, 1), hspace=0.08)
ax = [fig.add_subplot(gs[:, 0]), fig.add_subplot(gs[:, 1]), fig.add_subplot(gs[0, 2])]; ax.append(fig.add_subplot(gs[1, 2], sharex=ax[2]))
for a in ax: a.grid(True, color=GRID, lw=0.6); a.set_axisbelow(True)

a = ax[0]; T = E["tables"]["warm|pinned|g0"]; N = E["N"]
for k, c in zip([1, 6, 25], RAMP):
    ys = [10 ** T[i][E["K"].index(k)] for i in range(len(N))]
    a.plot(N, ys, color=c, lw=2, marker="o", ms=5, label=f"coupling {k} Hz")
for n, lo, hi in [(6, 1.78e-3, 3.16e-3), (40, 1e-5, 1.78e-5)]:
    a.plot([n, n], [lo, hi], color=INK, lw=1.2); a.plot([n * 0.93, n * 1.07], [hi, hi], color=INK, lw=1.2); a.plot([n * 0.93, n * 1.07], [lo, lo], color=INK, lw=1.2)
a.text(26, 4e-3, "brackets: the frozen map's\ncells at 6 Hz", color=INK2, fontsize=7.5, va="center")
a.set(xscale="log", yscale="log", xlabel="partials", ylabel="stretch B at the edge", xlim=(5, 130))
a.set_xticks(N); a.set_xticklabels([str(n) for n in N]); a.minorticks_off()
a.set_title("Where the edge sits", loc="left", color=INK, fontsize=10); a.legend(loc="lower left", fontsize=8, labelcolor=INK2)

a = ax[1]; L = A["loudness"]; xs = [10 ** s for s in L["stretches"]]
for key, g, c in [("wobble_g0", "0", RAMP[0]), ("wobble_g025", "0.25", RAMP[1]), ("wobble_g1", "1", RAMP[2])]:
    a.plot(xs, L[key], color=c, lw=2, marker="o", ms=5, label=f"loudness counts, γ {g}")
a.axhline(0.5, color=INK2, lw=1, ls=(0, (4, 4))); a.text(1.3e-9, 0.56, "tears above 0.5 Hz", color=INK2, fontsize=7.5)
a.set(xscale="log", xlabel="stretch B", ylabel="wobble of the pitch, Hz", ylim=(0, None))
a.set_title("Quiet partials pull weakly: the edge dissolves", loc="left", color=INK, fontsize=10); a.legend(loc="upper left", fontsize=8, labelcolor=INK2)

a = ax[2]; M = F["morph"]; xs = [10 ** s for s in M["s"]]
a.plot(xs, [r["wobble"] for r in M["fixed"]], color=AMBER, lw=2, marker="o", ms=5, label="fixed: partial n with voice n")
a.plot(xs, [r["wobble"] for r in M["nearest"]], color=BLUE, lw=2, marker="s", ms=5, label="nearest voice")
a.axhline(0.5, color=INK2, lw=1, ls=(0, (4, 4)))
a.text(1.5e1, 1.2, "both bars steady", color=INK2, fontsize=7.5)
a.set(xscale="log", ylabel="wobble, Hz", ylim=(0, None)); plt.setp(a.get_xticklabels(), visible=False)
a.set_title("String to bar: re-pairing relocks the bar", loc="left", color=INK, fontsize=10); a.legend(loc="upper right", fontsize=8, labelcolor=INK2)
b = ax[3]
b.plot(xs, [r["locked"] for r in M["fixed"]], color=AMBER, lw=2, marker="o", ms=5)
b.plot(xs, [r["locked"] for r in M["nearest"]], color=BLUE, lw=2, marker="s", ms=5)
b.text(3e-2, 13, "nearest pairing: 6 of the bar's 6\ngrippable partials lock", color=INK2, fontsize=7.5)
b.set(xscale="log", xlabel="stretch B (pinned; string left, bar right)", ylabel="partials locked", ylim=(0, 30))
fig.suptitle("The coupling edge: 40 to 64 partials, 6 Hz coupling at A2 unless marked, the page's own engine", color=INK2, fontsize=9, x=0.01, ha="left")
fig.subplots_adjust(left=0.06, right=0.99, top=0.88, bottom=0.11, wspace=0.28); fig.savefig(os.path.join(here, "coupling-edge.png"), dpi=130)
print("wrote coupling-edge.png")
