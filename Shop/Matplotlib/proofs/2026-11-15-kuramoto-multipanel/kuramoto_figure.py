"""Matplotlib test, 2026-11-15: a multi-panel publication figure with real math, at 300 dpi,
in the house style on two grounds (Graphite, the card's; Paper, the Drafting skin).

The math. Kuramoto oscillators, d(theta_i)/dt = omega_i + K r sin(psi - theta_i), with
natural frequencies drawn from a Lorentzian of half-width gamma. Kuramoto's result for
infinite N: r = 0 below K_c = 2 gamma, and r = sqrt(1 - K_c / K) above it. The figure
sets a finite-N simulation (N = 2000) beside that curve, and shows the phases on the
unit circle at three couplings.

Deterministic on purpose: the frequencies are the Lorentzian's quantiles (no random
draw), the initial phases a golden-angle spiral, a fixed-step RK2.

Run from the palace root:
    python3 "Shop/Matplotlib/proofs/2026-11-15-kuramoto-multipanel/kuramoto_figure.py" [graphite|paper|both] [--out DIR]
Prints one JSON line: simulation seconds, plot seconds, and the files written.
A maker who can draw this better another way does so, and leaves the comparison on the scroll.
"""
import json
import sys
import time
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
SHOP = HERE.parents[1]
STYLES = {"graphite": SHOP / "palace.mplstyle", "paper": HERE / "palace-paper.mplstyle"}

GAMMA, N, DT, T_RUN, T_AVG = 0.5, 2000, 0.02, 80.0, 30.0
KC = 2 * GAMMA
K_SWEEP = np.round(np.linspace(0.2, 3.0, 29), 3)
K_SNAP = (0.6, 1.3, 2.6)               # below, just above, well above K_c


def simulate(ks):
    """Mean-field Kuramoto for every K at once; returns time-averaged r and final phases."""
    i = np.arange(1, N + 1)
    omega = GAMMA * np.tan(np.pi * (i - 0.5) / N - np.pi / 2)        # Lorentzian quantiles
    theta = np.tile((i * 2.399963229728653) % (2 * np.pi), (len(ks), 1))  # golden angle
    K = np.asarray(ks)[:, None]

    def f(th):
        z = np.exp(1j * th).mean(axis=1, keepdims=True)
        r, psi = np.abs(z), np.angle(z)
        return omega + K * r * np.sin(psi - th)

    steps, avg_from = int(T_RUN / DT), int((T_RUN - T_AVG) / DT)
    racc = np.zeros(len(ks))
    for s in range(steps):
        k1 = f(theta)
        theta = theta + DT * f(theta + 0.5 * DT * k1)                 # midpoint RK2
        if s >= avg_from:
            racc += np.abs(np.exp(1j * theta).mean(axis=1))
    return racc / (steps - avg_from), np.mod(theta, 2 * np.pi), omega


def analytic(k):
    return np.where(k > KC, np.sqrt(np.clip(1 - KC / k, 0, None)), 0.0)


def draw(style, r_sim, snaps, omega, out):
    plt.style.use("default")
    plt.style.use(style)
    cyc = plt.rcParams["axes.prop_cycle"].by_key()["color"]
    fig = plt.figure(figsize=(7.2, 4.2), dpi=300, layout="constrained")
    gs = fig.add_gridspec(2, 3, height_ratios=[1.35, 1])
    ax = fig.add_subplot(gs[0, :])
    kk = np.linspace(0.2, 3.0, 600)
    ax.plot(kk, analytic(kk), color=cyc[0], label="theory, N → ∞:  r = √(1 − K_c/K)")
    ax.plot(K_SWEEP, r_sim, "o", ms=3.2, color=cyc[2], label=f"simulation, N = {N}")
    ax.axvline(KC, color=plt.rcParams["axes.edgecolor"], lw=0.8, ls="--")
    ax.annotate("K_c = 2γ", (KC, 0.9), xytext=(6, 0), textcoords="offset points", va="center")
    ax.set_xlabel("Coupling strength K")
    ax.set_ylabel("Order parameter r")
    ax.set_ylim(-0.02, 1.0); ax.set_xlim(0.2, 3.0)
    ax.set_title(f"(a)  Kuramoto synchrony, Lorentzian frequencies, γ = {GAMMA}", loc="left")
    ax.legend(loc="lower right")
    norm = plt.Normalize(-3 * GAMMA, 3 * GAMMA)
    for j, (k, th) in enumerate(zip(K_SNAP, snaps)):
        a = fig.add_subplot(gs[1, j], projection="polar")
        sel = slice(None, None, 4)                                  # 500 of the 2000, so the SVG stays small
        a.scatter(th[sel], np.ones(N)[sel], s=2.4, c=np.clip(omega, -3 * GAMMA, 3 * GAMMA)[sel], cmap="coolwarm",
                  norm=norm, linewidths=0, alpha=0.8)
        z = np.exp(1j * th).mean()
        a.annotate("", xy=(np.angle(z), np.abs(z)), xytext=(0, 0),
                   arrowprops=dict(arrowstyle="-|>", color=cyc[0], lw=1.2))
        a.set_ylim(0, 1.15); a.set_yticks([]); a.set_xticks(np.arange(0, 2 * np.pi, np.pi / 2))
        a.set_xticklabels(["0", "π/2", "π", "3π/2"], fontsize=7)
        a.set_title(f"({'bcd'[j]})  K = {k},  r = {abs(z):.2f}", fontsize=8, loc="center")
    # a figure note as supxlabel, so constrained layout makes room for it (a bare fig.text
    # sat on top of panel (d)'s 3π/2 label in the first run)
    fig.supxlabel("(b)-(d): every 4th of the 2000 phases, coloured by natural frequency; arrow = mean field r·e^(iψ)",
                  fontsize=6.5, color=plt.rcParams["axes.labelcolor"], x=0.995, ha="right")
    written = []
    for ext in ("png", "svg"):
        p = out / f"{out_name(style)}.{ext}"
        fig.savefig(p, metadata={"Software": None} if ext == "png" else {"Date": None})
        written.append(p.name)
    fig.canvas.draw()
    fb = fig.bbox; tb = fig.get_tightbbox(fig.canvas.get_renderer()).transformed(fig.dpi_scale_trans)
    inside = tb.x0 >= fb.x0 - 1 and tb.y0 >= fb.y0 - 1 and tb.x1 <= fb.x1 + 1 and tb.y1 <= fb.y1 + 1
    plt.close(fig)
    return written, bool(inside)


def out_name(style):
    return "kuramoto-graphite" if Path(style).name == "palace.mplstyle" else "kuramoto-paper"


if __name__ == "__main__":
    args = sys.argv[1:]
    out = HERE
    if "--out" in args:
        i = args.index("--out"); out = Path(args[i + 1]); del args[i:i + 2]
    which = args[0] if args else "both"
    t = time.time()
    r_sim, theta, omega = simulate(np.concatenate([K_SWEEP, K_SNAP]))
    t_sim = time.time() - t
    snaps = theta[len(K_SWEEP):]
    r_sweep = r_sim[: len(K_SWEEP)]
    rep = dict(matplotlib=matplotlib.__version__, numpy=np.__version__, sim_seconds=round(t_sim, 2), plots={})
    for name in (["graphite", "paper"] if which == "both" else [which]):
        t = time.time()
        files, inside = draw(STYLES[name], r_sweep, snaps, omega, out)
        rep["plots"][name] = dict(seconds=round(time.time() - t, 2), files=files, everything_inside_figure=inside)
    above = K_SWEEP >= 1.5 * KC
    rep["max_abs_err_vs_theory_K_ge_1.5Kc"] = round(float(np.max(np.abs(r_sweep[above] - analytic(K_SWEEP[above])))), 4)
    rep["mean_r_below_0.8Kc"] = round(float(np.mean(r_sweep[K_SWEEP <= 0.8 * KC])), 4)
    rep["r_sim"] = dict(zip(map(str, K_SWEEP.tolist()), np.round(r_sweep, 4).tolist()))
    print(json.dumps(rep))
