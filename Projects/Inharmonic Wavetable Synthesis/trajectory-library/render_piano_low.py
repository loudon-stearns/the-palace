#!/usr/bin/env python3
"""Play the first measured trajectory: a real low piano A (55 Hz).

Inharmonic Wavetable Synthesis, steward cycle 8 (2026-10-14).
Reads piano-low-A1.wtb.json (written by track_partials.py) and renders:

  01  the piano rebuilt from its own two walls (measured levels + measured bend)
  02  the same, bend switched off (B depth 0) -- the A/B for "does the bend matter?"
  03  the organ wall struck three times: flat line / the real piano bend /
      the June hand-made 'settling' schedule (B depth 0.3, as in cycle 7)
  04  an A major chord on the organ wall wearing the real piano bend, B depth
      rising 0 -> 3 over 14 s: the real string, then pushed past any real string
  piano-low-A1-trajectory.png  what was measured

Reuses the cycle-7 engine in ../dual-wavetable/build_dual.py.
Run with /usr/local/bin/python3.
"""
import json, pathlib, sys
import numpy as np
from scipy.io import wavfile

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "dual-wavetable"))
import build_dual as bd                                   # noqa: E402

FS, NP = bd.FS, bd.NP
d = json.load(open(HERE / "piano-low-A1.wtb.json"))
F0 = d["f0_fit_hz"]
times = np.array(d["frame_times_s"])
WTB_REAL = np.array(d["frames"])                          # (16, 64) cents
WTA_REAL = np.array(d["wta_measured"])                    # (16, 64) linear level
WTA_REAL = WTA_REAL / WTA_REAL.max()


def write(name, y, peak=0.89):
    y = y / (np.max(np.abs(y)) + 1e-12) * peak
    wavfile.write(HERE / name, FS, (y * 32767).astype(np.int16))
    print(f"wrote {name}  {len(y)/FS:.1f}s")


def real_clock(t):
    """seconds -> position in the 16 log-spaced measured frames."""
    return np.interp(t, times, np.linspace(0, 1, len(times)))


def const(v):
    return lambda t: np.full_like(t, v)


if __name__ == "__main__":
    DUR = 7.5
    # 01 / 02 -- the real piano from its own two walls, bend on and off
    rebuilt = bd.voice(F0, DUR, WTA_REAL, real_clock, WTB_REAL, real_clock, 1.0)
    flat = bd.voice(F0, DUR, WTA_REAL, real_clock, WTB_REAL, real_clock, 0.0)
    write("01-real-piano-two-walls.wav", rebuilt)
    write("02-real-piano-two-walls-bend-off.wav", flat)

    # 03 -- organ wall, struck: flat / real bend / June schedule
    wta = bd.load_wta()
    june, _ = bd.wtb_piano()
    zero = np.zeros_like(WTB_REAL)
    A2 = 110.0
    settle = lambda t: np.clip(t / 1.4, 0, 1) ** 0.6
    gap = np.zeros(int(FS * 0.35))
    parts = []
    for table, depth, clock in ((zero, 0.0, settle), (WTB_REAL, 1.0, real_clock),
                                (june, 0.3, settle)):
        parts += [bd.voice(A2, 3.0, wta, const(0.55), table, clock, depth, "strike"), gap]
    write("03-organ-flat-real-june.wav", np.concatenate(parts))

    # 04 -- chord, real bend, depth pushed from 0 to 3
    D = 14
    chord = sum(bd.voice(f, D, wta, lambda t: 0.2 + 0.5 * t / D, WTB_REAL,
                         const(0.5), lambda t: 3.0 * np.clip(t / D, 0, 1))
                for f in (110.0, 164.81, 277.18))
    write("04-chord-real-bend-pushed.wav", chord)

    # ── figure ──────────────────────────────────────────────────────────────
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.family": ["Helvetica", "DejaVu Sans"], "text.color": "#e8e8f0",
                         "axes.labelcolor": "#c8c8d8", "xtick.color": "#8a8aa0",
                         "ytick.color": "#8a8aa0", "axes.edgecolor": "#4a4a5e"})
    fig, ax = plt.subplots(1, 3, figsize=(16, 5), facecolor="#0a0a0f")
    for a in ax:
        a.set_facecolor("#12121a")
    n = np.arange(1, NP + 1)
    alive = np.array(d["alive_mask"]).astype(bool)
    cmap = plt.get_cmap("plasma")
    ax[0].axhline(0, color="#e8e8f0", lw=2.2, label="the flat line (pure harmony)")
    ax[0].plot(n, june[0], color="#6a6a80", lw=1.2, ls="--", label="June guess, attack frame (×1)")
    for i in range(len(times)):
        ax[0].scatter(n[alive[i]], WTB_REAL[i][alive[i]], s=7, color=cmap(i / 15), alpha=.8)
    ax[0].plot(n, d["fit_curve_cents"], color="#e8b84a", lw=1.6,
               label=f"fit: B = {d['B_fit']:.2e}")
    ax[0].set_ylim(-10, 420); ax[0].set_xlabel("partial n"); ax[0].set_ylabel("cents off harmonic")
    ax[0].set_title("Wavetable B, measured — low piano A (55 Hz)\n16 frames, 0.03 s to 8 s, colored by time", fontsize=11)
    ax[0].legend(fontsize=8, facecolor="#12121a", edgecolor="#4a4a5e", loc="upper left")

    Bf = np.array([np.nan if b is None else b for b in d["b_coefficient_per_frame"]])
    jb = json.load(open(bd.WTB_JSON))["b_coefficient_per_frame"]
    ax[1].semilogy(times, Bf, "o-", color="#e8b84a", ms=4, label="measured B, frame by frame")
    ax[1].semilogy(np.geomspace(0.03, 8, len(jb)), jb, "--", color="#6a6a80", label="June hand-made schedule")
    ax[1].set_xscale("log"); ax[1].set_xlabel("seconds after the strike")
    ax[1].set_ylabel("B (string stiffness)")
    ax[1].set_title("Does the bend settle?\nmeasured: no — B holds within ±2% for 4 s", fontsize=11)
    ax[1].legend(fontsize=8, facecolor="#12121a", edgecolor="#4a4a5e")

    db = 20 * np.log10(WTA_REAL.T + 1e-4)
    ax[2].imshow(db, aspect="auto", origin="lower", cmap="magma", vmin=-60, vmax=0,
                 extent=[0, 15, 1, NP])
    ax[2].set_xticks(range(0, 16, 3))
    ax[2].set_xticklabels([f"{times[i]:.2g}s" for i in range(0, 16, 3)])
    ax[2].set_xlabel("frame (log time)"); ax[2].set_ylabel("partial n")
    tw = ax[2].twinx()
    tw.plot(np.arange(16), d["effective_bend_cents_per_frame"], color="#7ad0ff", lw=1.8)
    tw.set_ylabel("bend as heard (cents, level-weighted)", color="#7ad0ff")
    tw.tick_params(colors="#7ad0ff")
    ax[2].set_title("Wavetable A, measured — where the settling lives\nupper partials go dark; the heard bend halves", fontsize=11)
    fig.tight_layout()
    fig.savefig(HERE / "piano-low-A1-trajectory.png", dpi=130, facecolor=fig.get_facecolor())
    print("wrote piano-low-A1-trajectory.png")
