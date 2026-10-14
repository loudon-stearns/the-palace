#!/usr/bin/env python3
"""
Loudness as timbre — multi-mode portamento, pass 3 (cycle 10, 2026-10-14).

Pass 2 (mode_locking.py) gave every bowed clip one fixed locking range K.
But K is not a property of the string; it is a property of how hard the
string is driven. In a self-sustained oscillator the pull that holds each
partial onto the harmonic series comes from the nonlinear excitation
(Fletcher 1978), and a harder bow is a stronger nonlinearity. So K should
follow the bow.

The modelling choice this pass makes (not taken from Fletcher, and flagged
as a choice): the locking range follows bow force g in [0, 1] as

    K(t) = K_pp * (K_ff / K_pp) ** g(t)          (Hz, geometric between pp and ff)

and the same K holds for every partial, as in pass 2, so the results stay
comparable. Detuning is unchanged:

    Delta_n = n * f1 * (sqrt(1 + B n^2) - 1)

A partial locks when the rising K climbs past its Delta_n. Because Delta_n
grows about as n^3, a crescendo pulls partials into lock one at a time,
from the bottom up: dynamics heard as timbre.

Two experiments:
  A. A held E4 under a crescendo. Clip 1: K follows the bow. Clip 2, the
     control: the identical loudness curve with K frozen at its pp value.
     Same level at every instant; only the locking differs.
  B. The underdamped arrival from pass 2 (G3 -> E4, zeta 0.2) at three bow
     strengths, level-matched. Which partial slips on the overshoot?

Outputs: multi-mode/audio/loudness-*.wav, multi-mode/figures/loudness-locking.png,
multi-mode/loudness-manifest.json
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile

from mode_locking import (damped_trajectory, style, SR, CR, N, n_idx, AMP,
                          BG, FG1, FG3, FG4, ACC)

HERE = Path(__file__).parent
AUDIO = HERE / "audio"; AUDIO.mkdir(exist_ok=True)
FIGS = HERE / "figures"; FIGS.mkdir(exist_ok=True)

DUR = 5.0
PREROLL = 0.5
B_AT_196 = 0.00025          # same string as pass 2 (slide geometry: B grows as f1^2)
K_PP, K_FF = 0.5, 30.0      # locking range at pianissimo / fortissimo, Hz
PP_DB = -24.0               # level at pianissimo relative to fortissimo


def b_slide(f1):
    return B_AT_196 * (f1 / 196.0) ** 2


def simulate(f1, K):
    """f1, K: control-rate arrays. Returns psis, fdev, delta, locked."""
    nc = len(f1)
    B = b_slide(f1)
    delta = n_idx[None, :] * f1[:, None] * (np.sqrt(1 + B[:, None] * n_idx[None, :] ** 2) - 1)
    r = delta[0] / K[0]
    psi = np.where(np.abs(r) < 1, np.arcsin(np.clip(r, -1, 1)), 0.0)
    psis = np.empty((nc, N)); fdev = np.empty((nc, N))
    dt = 1.0 / CR
    for i in range(nc):
        dpsi = 2 * np.pi * delta[i] - 2 * np.pi * K[i] * np.sin(psi)
        psi = psi + dpsi * dt
        psis[i] = psi; fdev[i] = dpsi / (2 * np.pi)
    locked = np.abs(delta) < K[:, None]
    return psis, fdev, delta, locked


def synth(f1, psis, gain_db):
    nc = len(f1); na = int(round(SR * nc / CR))
    ta = np.arange(na) / SR; tc = np.arange(nc) / CR
    phi1 = 2 * np.pi * np.cumsum(np.interp(ta, tc, f1)) / SR
    out = np.zeros(na)
    for k in range(N):
        out += AMP[k] * np.sin((k + 1) * phi1 + np.interp(ta, tc, psis[:, k]))
    out *= 10 ** (np.interp(ta, tc, gain_db) / 20)
    env = np.ones(na)
    a = int(0.03 * SR); env[:a] = np.linspace(0, 1, a)
    rr = int(0.25 * SR); env[-rr:] = np.linspace(1, 0, rr) ** 2
    return out * env


def lock_events(t, locked):
    ev = {}
    for k in range(N):
        sw = np.flatnonzero(np.diff(locked[:, k].astype(int)))
        if len(sw):
            ev[k + 1] = [f"{'locks' if locked[i + 1, k] else 'unlocks'} {t[i + 1]:.2f}" for i in sw]
    return ev


def main():
    nc = int(round(CR * DUR)); t = np.arange(nc) / CR
    manifest = dict(params=dict(B_at_196Hz=B_AT_196, K_pp_hz=K_PP, K_ff_hz=K_FF, pp_db=PP_DB,
                                partials=N, spectrum="1/n", note="K follows bow force geometrically; same K for every partial"),
                    clips=[])
    peak = 0.0
    renders = []

    # A. Held E4 under a crescendo: bow force ramps 0 -> 1 over 0.5..4.0 s (smoothstep)
    f_hold = np.full(nc, 329.63)
    x = np.clip((t - 0.5) / 3.5, 0, 1); g = x * x * (3 - 2 * x)
    gain = PP_DB * (1 - g)
    K_follow = K_PP * (K_FF / K_PP) ** g
    K_frozen = np.full(nc, K_PP)
    crescendo = {}
    for idx, name, label, K in [(1, "crescendo-bow", "Held E4, crescendo, locking follows the bow", K_follow),
                                (2, "crescendo-control", "Held E4, same crescendo, locking frozen at pp", K_frozen)]:
        psis, fdev, delta, locked = simulate(f_hold, K)
        audio = synth(f_hold, psis, gain)
        renders.append((idx, name, audio))
        crescendo[name] = dict(locked=locked, delta=delta, K=K)
        manifest["clips"].append(dict(
            idx=idx, name=name, label=label, level_matched=False,
            locked_at_start=int(locked[0].sum()), locked_at_end=int(locked[-1].sum()),
            lock_events_s=lock_events(t, locked),
            detuning_hz=[round(float(d), 2) for d in delta[0]]))

    # B. Underdamped arrival G3 -> E4 (zeta 0.2, wn 6) at three fixed bow strengths
    npre = int(round(CR * PREROLL))
    f_os = np.concatenate([np.full(npre, 196.0),
                           damped_trajectory(196.0, 329.63, 0.2, 6.0, np.arange(nc - npre) / CR)])
    overshoot = {}
    for idx, name, label, Kc in [(3, "overshoot-soft", "Underdamped arrival, soft bow", 1.0),
                                 (4, "overshoot-medium", "Underdamped arrival, medium bow (pass 2's K)", 3.4),
                                 (5, "overshoot-loud", "Underdamped arrival, loud bow", 30.0)]:
        K = np.full(nc, Kc)
        psis, fdev, delta, locked = simulate(f_os, K)
        audio = synth(f_os, psis, np.zeros(nc))
        renders.append((idx, name, audio))
        # a partial that slips on the overshoot: in lock on arrival, but out of lock at some point
        # during the ring (partials the slide itself unlocks for good are not counted)
        changing = [k + 1 for k in range(N) if locked[-1, k] and (~locked[npre:, k]).any()]
        overshoot[name] = dict(locked=locked, K=Kc, slipping=changing)
        manifest["clips"].append(dict(
            idx=idx, name=name, label=label, K_hz=Kc, level_matched=True,
            peak_f1_hz=round(float(f_os.max()), 1),
            locked_on_arrival=int(locked[-1].sum()),
            partials_slipping_on_overshoot=changing,
            slip_partial_level_db=[round(20 * np.log10(1 / n), 1) for n in changing],
            lock_events_s={k: v for k, v in lock_events(t, locked).items() if k in changing}))

    # write: crescendo pair share one normalisation (identical levels); overshoot trio level-matched
    cpk = max(np.max(np.abs(a)) for i, _, a in renders if i <= 2)
    for idx, name, audio in renders:
        a = audio / (cpk if idx <= 2 else np.max(np.abs(audio))) * 0.7
        p = AUDIO / f"loudness-{idx:02d}-{name}.wav"
        wavfile.write(str(p), SR, np.int16(np.clip(a, -1, 1) * 32767))
        manifest["clips"][idx - 1]["wav"] = str(p.relative_to(HERE))

    # figure
    cmap = plt.get_cmap("plasma")
    fig = plt.figure(figsize=(14, 8.2), dpi=110, facecolor=BG)
    gs = fig.add_gridspec(2, 3, height_ratios=[1.35, 1], hspace=0.38, wspace=0.28)

    ax = fig.add_subplot(gs[0, :2]); style(ax)
    d0 = crescendo["crescendo-bow"]["delta"][0]
    for k in range(N):
        ax.axhline(d0[k], color=cmap(0.15 + 0.8 * k / N), lw=0.9, ls="--", alpha=0.85)
        ax.text(DUR - 0.05, d0[k] * 1.07, f"partial {k+1}  {d0[k]:.3g} Hz", color=cmap(0.15 + 0.8 * k / N),
                fontsize=7, ha="right", va="bottom")
    ax.plot(t, K_follow, color=ACC, lw=2.2, label="locking range, follows the bow")
    ax.plot(t, K_frozen, color=FG3, lw=1.4, ls=":", label="locking range, frozen (control)")
    ax.set_yscale("log"); ax.set_ylim(0.08, 200); ax.set_xlim(0, DUR)
    ax.set_ylabel("Hz (log)"); ax.set_xlabel("time (s)")
    ax.set_title("Crescendo on a held E4: a partial locks when the rising gold line passes its dashed detuning",
                 color=FG1, fontsize=10)
    ax.legend(fontsize=8, facecolor=BG, edgecolor=FG4, labelcolor=FG1, loc="upper left")

    ax = fig.add_subplot(gs[0, 2]); style(ax)
    ax.step(t, crescendo["crescendo-bow"]["locked"].sum(1), color=ACC, lw=1.8, where="post", label="clip 1, follows the bow")
    ax.step(t, crescendo["crescendo-control"]["locked"].sum(1), color=FG3, lw=1.4, where="post", label="clip 2, control")
    ax2 = ax.twinx(); ax2.plot(t, gain, color=FG4, lw=1); ax2.set_ylim(-30, 3)
    ax2.tick_params(colors=FG4, labelsize=7); ax2.set_ylabel("level (dB)", color=FG4, fontsize=8)
    for s in ax2.spines.values(): s.set_visible(False)
    ax.set_ylim(-0.3, N + 0.3); ax.set_xlabel("time (s)"); ax.set_ylabel("partials in lock")
    ax.set_title("Same loudness curve, different fusion", color=FG1, fontsize=10)
    ax.legend(fontsize=7.5, facecolor=BG, edgecolor=FG4, labelcolor=FG1, loc="center left")

    for j, name in enumerate(["overshoot-soft", "overshoot-medium", "overshoot-loud"]):
        ax = fig.add_subplot(gs[1, j]); style(ax)
        o = overshoot[name]; lk = o["locked"]
        for k in o["slipping"]:
            ax.fill_between(t, 0, 1, where=~lk[:, k - 1], step="post", color=cmap(0.15 + 0.8 * (k - 1) / N),
                            alpha=0.35, transform=ax.get_xaxis_transform(), label=f"partial {k} out of lock")
        ax.step(t, lk.sum(1), color=ACC, lw=1.6, where="post")
        ax3 = ax.twinx(); ax3.plot(t, f_os, color=FG3, lw=0.8, alpha=0.7); ax3.set_ylim(150, 450)
        ax3.tick_params(colors=FG4, labelsize=7)
        for s in ax3.spines.values(): s.set_visible(False)
        ax.set_ylim(-0.3, N + 0.3); ax.set_xlabel("time (s)")
        if j == 0: ax.set_ylabel("partials in lock")
        ax.set_title(f"Overshoot, {name.split('-')[1]} bow (K {o['K']:g} Hz)", color=FG1, fontsize=10)
        if o["slipping"]:
            ax.legend(fontsize=7.5, facecolor=BG, edgecolor=FG4, labelcolor=FG1, loc="lower right")
    fig.suptitle("Loudness as timbre: the bow sets the locking range", color=FG1, fontsize=13)
    p = FIGS / "loudness-locking.png"; fig.savefig(p, facecolor=BG, bbox_inches="tight"); plt.close(fig)

    (HERE / "loudness-manifest.json").write_text(json.dumps(manifest, indent=2))
    print(json.dumps(manifest, indent=1))


if __name__ == "__main__":
    main()
