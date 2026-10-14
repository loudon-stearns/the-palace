#!/usr/bin/env python3
"""
Mode locking during a glide — multi-mode portamento, pass 2 (cycle 9, 2026-10-14).

Why a second pass. The September pass (render_multimode.py) coupled the modes
with K = 9 shared over 8 modes, about 1 rad/s per pair. The stiffness detuning
it had to beat was 15-280 rad/s for partials 3-8, so nothing could ever lock:
its "uncoupled" and "locked" fast glides have the same partial frequencies to
within 0.3 cents. The slide-versus-bend contrast in that pass is sound; the
coupling A/B was a null.

The physics this pass uses. A stiff string's own resonances are inharmonic:

    f_n = n * f1 * sqrt(1 + B n^2)

A plucked string rings at exactly those frequencies, so its partials drift off
the harmonic series. A bowed string (and a voice, and a reed) is a
self-sustained oscillator: its nonlinear excitation pulls every partial onto
an exact multiple of the fundamental, as long as the pull is stronger than the
detuning (Fletcher 1978, "Mode locking in nonlinearly excited inharmonic
musical oscillators"). That is two-oscillator Kuramoto, the Adler equation,
written for partial n's phase offset psi_n from n times the fundamental:

    d(psi_n)/dt = 2*pi*Delta_n(t) - 2*pi*K * sin(psi_n)
    Delta_n(t)  = n * f1(t) * (sqrt(1 + B(t) n^2) - 1)      (Hz)

Locked while |Delta_n| < K; past that the partial slips, beating at
sqrt(Delta_n^2 - K^2) Hz against where it "should" be.

A glide moves Delta_n, so a glide moves partials in and out of lock:
  - SLIDE (finger shortens the string, tension fixed): B grows as f1^2, so
    Delta_n grows as f1^3. Partials break loose from the top down.
  - BEND / PEG (length fixed, tension rises): B falls as 1/f1^2, so Delta_n
    falls as 1/f1. A loose partial is pulled back into lock.
  - UNDERDAMPED arrival: the overshoot carries Delta_n past K for a moment,
    so a partial slips during the overshoot and relocks as it settles.
    A critically damped arrival to the same note never crosses.

f1(t) is the home entry's second-order pitch model. Control rate 4410 Hz
(Euler is ample: the fastest term is ~2*pi*60 rad/s), psi interpolated to
audio rate, each partial's phase = n * phi1 + psi_n.

Outputs: multi-mode/audio/locking-*.wav, multi-mode/figures/mode-locking.png,
multi-mode/figures/overshoot-pair-spectrogram.png, multi-mode/locking-manifest.json
"""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile
from scipy.signal import spectrogram

HERE = Path(__file__).parent
AUDIO = HERE / "audio"; AUDIO.mkdir(exist_ok=True)
FIGS = HERE / "figures"; FIGS.mkdir(exist_ok=True)

SR = 44100
CR = 4410
DUR = 4.5
PREROLL = 0.5
N = 10
n_idx = np.arange(1, N + 1)
AMP = 1.0 / n_idx            # sawtooth-like spectrum, as a bowed string makes

# Loudon Live graphite skin
BG, ELEV, FG1, FG3, FG4, ACC = "#0a0a0f", "#12121a", "#e8e8f0", "#8a8aa0", "#4a4a5a", "#e8b84a"


def damped_trajectory(f0, ft, zeta, wn, t):
    d = f0 - ft
    if abs(zeta - 1.0) < 1e-4:
        return ft + d * (1.0 + wn * t) * np.exp(-wn * t)
    if zeta > 1.0:
        s = wn * np.sqrt(zeta * zeta - 1.0)
        r1, r2 = -zeta * wn + s, -zeta * wn - s
        b = d / (1.0 - r2 / r1)
        return ft + (d - b) * np.exp(r1 * t) + b * np.exp(r2 * t)
    wd = wn * np.sqrt(1.0 - zeta * zeta)
    return ft + d * np.exp(-zeta * wn * t) * (
        np.cos(wd * t) + zeta / np.sqrt(1.0 - zeta * zeta) * np.sin(wd * t))


@dataclass
class Case:
    idx: int
    name: str
    label: str
    geometry: str      # "slide" (B ∝ f1^2) | "bend" (B ∝ 1/f1^2)
    f0: float
    ft: float
    zeta: float
    wn: float
    B0: float          # inharmonicity coefficient at f0
    K: float           # locking range, Hz (0 = free / plucked)
    listen: str


CASES = [
    Case(1, "pluck-slide", "Plucked, slide up an octave", "slide", 196, 392, 1.0, 9.0,
         0.00025, 0.0,
         "Free string: every partial rides its own stiff-string frequency. The top drifts sharp and the tone turns glassy."),
    Case(2, "bow-slide", "Bowed, same slide", "slide", 196, 392, 1.0, 9.0,
         0.00025, 3.0,
         "Same string, bowed. It starts fused; as the string shortens, partials break out of lock from the top down and the tone starts to shimmer."),
    Case(3, "bow-peg", "Bowed, tension raised (peg turn)", "bend", 196, 392, 1.0, 9.0,
         0.0008, 3.0,
         "Same octave by tension. It starts with a loose, beating partial; the rising tension pulls it back into lock and the tone clears."),
    Case(4, "bow-overshoot", "Bowed, underdamped arrival", "slide", 196, 330, 0.2, 6.0,
         0.00025, 3.4,
         "Lands sharp and rings back. On the overshoot one partial slips out of lock (a brief flutter), then relocks as it settles."),
    Case(5, "bow-critical", "Bowed, critically damped arrival", "slide", 196, 330, 1.0, 6.0,
         0.00025, 3.4,
         "Same note, arriving without overshoot. The detuning never crosses the locking range, so the tone stays fused throughout."),
]


def b_of(c: Case, f1):
    return c.B0 * (f1 / c.f0) ** 2 if c.geometry == "slide" else c.B0 * (c.f0 / f1) ** 2


def run(c: Case):
    nc = int(round(CR * DUR)); npre = int(round(CR * PREROLL))
    f1 = np.concatenate([np.full(npre, float(c.f0)),
                         damped_trajectory(c.f0, c.ft, c.zeta, c.wn, np.arange(nc - npre) / CR)])
    B = b_of(c, f1)
    delta = n_idx[None, :] * f1[:, None] * (np.sqrt(1 + B[:, None] * n_idx[None, :] ** 2) - 1)

    psi = np.zeros(N)
    if c.K > 0:   # start from the locked fixed point where one exists
        r = delta[0] / c.K
        psi = np.where(np.abs(r) < 1, np.arcsin(np.clip(r, -1, 1)), 0.0)
    psis = np.empty((nc, N)); fdev = np.empty((nc, N))
    dt = 1.0 / CR
    for i in range(nc):
        dpsi = 2 * np.pi * delta[i] - 2 * np.pi * c.K * np.sin(psi)
        psi = psi + dpsi * dt
        psis[i] = psi
        fdev[i] = dpsi / (2 * np.pi)            # Hz away from n*f1, as heard

    locked = (np.abs(delta) < c.K) if c.K > 0 else np.zeros_like(delta, bool)
    slips = np.floor(np.abs(psis) / (2 * np.pi))     # whole cycles slipped so far

    na = int(round(SR * DUR))
    ta = np.arange(na) / SR; tc = np.arange(nc) / CR
    phi1 = 2 * np.pi * np.cumsum(np.interp(ta, tc, f1)) / SR
    out = np.zeros(na)
    for k in range(N):
        out += AMP[k] * np.sin((k + 1) * phi1 + np.interp(ta, tc, psis[:, k]))
    env = np.ones(na)
    a = int(0.02 * SR); env[:a] = np.linspace(0, 1, a)
    r_ = int(0.25 * SR); env[-r_:] = np.linspace(1, 0, r_) ** 2
    out *= env
    out = out / np.max(np.abs(out)) * 0.7

    cents = 1200 * np.log2((n_idx[None, :] * f1[:, None] + fdev) / (n_idx[None, :] * f1[:, None]))
    return dict(t=tc, f1=f1, delta=delta, cents=cents, locked=locked, slips=slips,
                audio=out.astype(np.float32))


def summarize(c, r):
    t = r["t"]
    lk = r["locked"].sum(axis=1)
    out = dict(
        locked_at_start=int(lk[0]), locked_at_end=int(lk[-1]),
        fewest_locked=int(lk.min()), fewest_locked_at_s=round(float(t[np.argmin(lk)]), 2),
        peak_f1_hz=round(float(r["f1"].max()), 1),
        cycles_slipped_per_partial=[int(s) for s in r["slips"][-1]],
        top_partial_cents_end=round(float(r["cents"][-1, -1]), 1),
    )
    if c.K > 0:
        unl = ~r["locked"]
        # partials that change state during the render
        ch = [k for k in range(N) if unl[:, k].any() and (~unl[:, k]).any()]
        out["partials_changing_state"] = [k + 1 for k in ch]
        for k in ch:
            sw = np.flatnonzero(np.diff(r["locked"][:, k].astype(int)))
            out[f"partial_{k+1}_lock_changes_s"] = [
                f"{'unlocks' if r['locked'][i, k] else 'locks'} {t[i+1]:.2f}" for i in sw]
    return out


def style(ax):
    ax.set_facecolor(ELEV)
    for s in ax.spines.values(): s.set_color(FG4)
    ax.tick_params(colors=FG3, labelsize=8)
    ax.xaxis.label.set_color(FG3); ax.yaxis.label.set_color(FG3)


def fig_main(results):
    cmap = plt.get_cmap("plasma")
    fig, axes = plt.subplots(2, len(CASES), figsize=(4.2 * len(CASES), 7.4), dpi=110,
                             gridspec_kw=dict(height_ratios=[3, 1.2]), facecolor=BG)
    for j, (c, r) in enumerate(results):
        ax = axes[0, j]; style(ax)
        for k in range(1, N):
            ax.plot(r["t"], np.clip(r["cents"][:, k], -5, 80), color=cmap(0.15 + 0.8 * k / N), lw=1.0,
                    label=f"{k+1}" if j == 0 and k in (1, 3, 5, 7, 9) else None)
        ax.axhline(0, color=FG3, lw=0.6, ls=":")
        ax.set_ylim(-5, 80)
        ax.set_title(f"{c.idx}. {c.label}", color=FG1, fontsize=9.5)
        if j == 0:
            ax.set_ylabel("partial n vs n × fundamental (cents)")
            ax.legend(title="partial", fontsize=7, title_fontsize=7, facecolor=ELEV,
                      edgecolor=FG4, labelcolor=FG1, loc="upper left").get_title().set_color(FG3)
        ax2 = ax.twinx(); ax2.plot(r["t"], r["f1"], color=ACC, lw=1.0, alpha=0.6)
        ax2.tick_params(colors=ACC, labelsize=7); ax2.set_ylim(150, 450)
        if j == len(results) - 1: ax2.set_ylabel("fundamental (Hz)", color=ACC, fontsize=8)
        for s in ax2.spines.values(): s.set_visible(False)

        ax = axes[1, j]; style(ax)
        ax.step(r["t"], r["locked"].sum(axis=1), color=ACC if c.K > 0 else FG4, lw=1.4, where="post")
        ax.set_ylim(-0.3, N + 0.3); ax.set_xlabel("time (s)")
        if c.K == 0:
            ax.text(0.5, 0.5, "free string: nothing locks", transform=ax.transAxes,
                    ha="center", va="center", color=FG3, fontsize=8)
        if j == 0: ax.set_ylabel("partials in lock")
    fig.suptitle("Mode locking during a glide: which partials hold onto the harmonic series",
                 color=FG1, fontsize=12)
    fig.tight_layout(rect=(0, 0, 1, 0.96))
    p = FIGS / "mode-locking.png"; fig.savefig(p, facecolor=BG); plt.close(fig)
    return p


def fig_pair(results):
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.2), dpi=110, facecolor=BG, sharey=True)
    for ax, (c, r) in zip(axes, results[3:5]):
        style(ax)
        f, t, S = spectrogram(r["audio"].astype(float), fs=SR, nperseg=4096, noverlap=3840)
        db = 10 * np.log10(S + 1e-12); db = np.clip(db, db.max() - 60, db.max())
        m = (f >= 800) & (f <= 1700)
        ax.pcolormesh(t, f[m], db[m], shading="auto", cmap="magma")
        ax.set_title(f"{c.idx}. {c.label} (partials 3–5)", color=FG1, fontsize=9.5)
        ax.set_xlabel("time (s)")
    axes[0].set_ylabel("frequency (Hz)")
    fig.tight_layout()
    p = FIGS / "overshoot-pair-spectrogram.png"; fig.savefig(p, facecolor=BG); plt.close(fig)
    return p


def main():
    results, manifest = [], []
    for c in CASES:
        r = run(c); results.append((c, r))
        wav = AUDIO / f"locking-{c.idx:02d}-{c.name}.wav"
        wavfile.write(str(wav), SR, np.int16(np.clip(r["audio"], -1, 1) * 32767))
        s = summarize(c, r)
        manifest.append(dict(**asdict(c), wav=str(wav.relative_to(HERE)), **s))
        print(c.idx, c.name, json.dumps(s))
    fig_main(results); fig_pair(results)
    (HERE / "locking-manifest.json").write_text(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
