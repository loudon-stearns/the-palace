#!/usr/bin/env python3
"""The trajectory library, first shelf: the piano across the keyboard + four modal objects.

Inharmonic Wavetable Synthesis, steward cycle 9 (2026-10-14).

  1. Track six more Grand Piano notes (Core Library, 'f' layer) with
     track_partials.py -> piano-<note>.wtb.json.  Ableton names its samples an
     octave low (its A3 is 440 Hz); files here use scientific pitch (A4 = 440).
  2. Load the four modal trajectories written by track_modes.py.
  3. Render:
     05-organ-wears-the-keyboard.wav  one organ note (A2, 110 Hz) struck seven
          times, wearing the measured bend of a string from each register,
          bass to treble -- same timbre, same pitch, seven stiffnesses
     06-library-rebuilt.wav           bell, vibraphone, marimba, bowl, each
          rebuilt from its own two measured walls (a check on the tracker)
     07-library-on-the-organ.wav      the organ (A3, 220 Hz) struck wearing each
          modal trajectory, rank-filed, slots above the last mode silenced
     08-vibraphone-two-filings.wav    the organ wearing the vibraphone filed two
          ways: rank (k-th mode in slot k) then nearest-harmonic
     09-bell-choir-measured.wav       A major on the organ wearing the measured
          bell -- the entry's 'alien bell choir', from a real bell this time
     keyboard-stiffness.png, library-sheet.png
Run with /usr/local/bin/python3.
"""
import json, pathlib, re, sys
import numpy as np
from scipy.io import wavfile

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "dual-wavetable"))
sys.path.insert(0, str(HERE))
import build_dual as bd                                   # noqa: E402
import track_partials as tp                               # noqa: E402

FS, NP = bd.FS, bd.NP
n = np.arange(1, NP + 1)
GP = pathlib.Path("/Applications/Ableton Live 12 Suite.app/Contents/App-Resources/"
                  "Core Library/Samples/Multisamples/Grand Piano")
# Ableton sample name -> scientific name
KEYS = [("A0", "A1"), ("A1", "A2"), ("A2", "A3"), ("A3", "A4"), ("A4", "A5"),
        ("C5", "C6"), ("F#5", "F#6"), ("D6", "D7")]
MODAL = ["bell-brooklyn-C6", "vibraphone-C4", "marimba-C3", "singing-bowl-D4"]


def hz_ableton(note):
    pcs = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    m = re.match(r'([A-G]#?)\s*(-?\d)', note)
    return 440 * 2 ** (((int(m.group(2)) + 2) * 12 + pcs[m.group(1)] - 69) / 12)


def write(name, y, peak=0.89):
    y = y / (np.max(np.abs(y)) + 1e-12) * peak
    wavfile.write(HERE / name, FS, (y * 32767).astype(np.int16))
    print(f"wrote {name}  {len(y)/FS:.1f}s")


def const(v):
    return lambda t: np.full_like(t, v)


def clock_of(times):
    return lambda t: np.interp(t, times, np.linspace(0, 1, len(times)))


def masked(wta, mask_row):
    return wta * mask_row[None, :]


if __name__ == "__main__":
    # ── 1. the piano across the keyboard ───────────────────────────────────
    piano = {}
    for abl, sci in KEYS:
        r = tp.track(str(GP / f"GrandPiano {abl} f.aif"), f"piano-{sci.replace('#', 's')}",
                     hz_ableton(abl), quiet=True)
        r["sci"] = sci
        piano[sci] = r
        if sci == "A1":
            continue                                     # cycle 8's file stays as it was
        if np.isnan(r["B_frame"]).all():
            print(f"{sci}: only {r['n_max']} partials below Nyquist; global fit only, no trajectory file")
            continue
        tp.save(r, f"GrandPiano {abl} f.aif (Ableton Live 12 Core Library, Grand Piano multisample; "
                   f"Ableton calls it {abl}; read in place, not copied)")
    print("\n note   f0 fit    B (global)   B per frame (min..max)   measured partials   heard bend first->last")
    for sci, r in piano.items():
        Bf = r["B_frame"]; eb = tp.effective_bend(r)
        rng = f"{np.nanmin(Bf):.2e}..{np.nanmax(Bf):.2e}" if not np.isnan(Bf).all() else "   (too few)   "
        print(f" {sci:4s} {r['f0']:8.2f}   {r['B']:.3e}   {rng}   {r['alive'][0].sum():3d} of {r['n_max']:2d}"
              f"   {eb[0]:5.1f} -> {eb[-1]:5.1f} c")

    wta = bd.load_wta()
    gap = np.zeros(int(FS * 0.3))

    # ── 05 the organ wears the keyboard ────────────────────────────────────
    order = ["A1", "A2", "A3", "A4", "A5", "C6", "F#6"]
    parts = []
    for sci in order:
        r = piano[sci]
        tab = r["cents"]                                 # unmeasured slots carry the fit
        parts += [bd.voice(110.0, 2.4, wta, const(0.55), tab, clock_of(r["times"]), 1.0, "strike"), gap]
    write("05-organ-wears-the-keyboard.wav", np.concatenate(parts))

    # ── modal trajectories ─────────────────────────────────────────────────
    lib = {k: json.load(open(HERE / f"{k}.wtb.json")) for k in MODAL}
    for d in lib.values():
        d["_cents"] = np.array(d["frames"]); d["_amp"] = np.array(d["wta_measured"])
        d["_times"] = np.array(d["frame_times_s"])
        d["_slotmask"] = (n <= d["n_modes"]).astype(float)

    # 06 rebuilt from their own walls
    lens = {"bell-brooklyn-C6": 3.4, "vibraphone-C4": 4.4, "marimba-C3": 1.8, "singing-bowl-D4": 8.0}
    parts = []
    for k, d in lib.items():
        A = d["_amp"] / d["_amp"].max()
        parts += [bd.voice(d["f1_hz"], lens[k], A, clock_of(d["_times"]), d["_cents"],
                           clock_of(d["_times"]), 1.0), gap]
    write("06-library-rebuilt.wav", np.concatenate(parts))

    # 07 the organ wears each, rank-filed, silenced above the last mode
    parts = []
    for k, d in lib.items():
        parts += [bd.voice(220.0, 2.8, masked(wta, d["_slotmask"]), const(0.55), d["_cents"],
                           clock_of(d["_times"]), 1.0, "strike"), gap]
    write("07-library-on-the-organ.wav", np.concatenate(parts))

    # 08 the vibraphone filed two ways
    v = lib["vibraphone-C4"]
    ratios, near = np.array(v["mode_ratios"]), np.array(v["nearest_harmonic_slot"])
    lv0 = v["_amp"][0, :v["n_modes"]]
    nh = np.zeros((len(v["_times"]), NP)); nh_mask = np.zeros(NP)
    for m in np.argsort(lv0):                            # louder modes win a shared slot
        s = near[m] - 1
        nh[:, s] = v["_cents"][:, m] + 1200 * np.log2((m + 1) / near[m])
        nh_mask[s] = 1.0
    parts = [bd.voice(220.0, 3.2, masked(wta, v["_slotmask"]), const(0.55), v["_cents"],
                      clock_of(v["_times"]), 1.0, "strike"), gap,
             bd.voice(220.0, 3.2, masked(wta, nh_mask), const(0.55), nh,
                      clock_of(v["_times"]), 1.0, "strike")]
    write("08-vibraphone-two-filings.wav", np.concatenate(parts))
    print("vibraphone nearest-harmonic slots used:", sorted(set(near.tolist())),
          " bend there (cents):", np.round(nh[0][nh_mask > 0], 1))

    # 09 the measured bell choir
    b = lib["bell-brooklyn-C6"]
    D = 9.0
    chord = sum(bd.voice(f, D, masked(wta, b["_slotmask"]), lambda t: 0.3 + 0.4 * t / D, b["_cents"],
                         const(0.3), 1.0) for f in (220.0, 277.18, 329.63))
    write("09-bell-choir-measured.wav", chord)

    # ── figures ────────────────────────────────────────────────────────────
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.family": ["Helvetica", "DejaVu Sans"], "text.color": "#e8e8f0",
                         "axes.labelcolor": "#c8c8d8", "xtick.color": "#8a8aa0",
                         "ytick.color": "#8a8aa0", "axes.edgecolor": "#4a4a5e"})
    BG, PANEL, GOLD, DIM = "#0a0a0f", "#12121a", "#e8b84a", "#6a6a80"
    leg = dict(fontsize=8, facecolor=PANEL, edgecolor="#4a4a5e")

    fig, ax = plt.subplots(1, 3, figsize=(17, 5.2), facecolor=BG)
    for a in ax:
        a.set_facecolor(PANEL)
    f0s = np.array([piano[s]["f0"] for s in piano]); Bs = np.array([piano[s]["B"] for s in piano])
    lo = [np.nanmin(piano[s]["B_frame"]) if not np.isnan(piano[s]["B_frame"]).all() else np.nan for s in piano]
    hi = [np.nanmax(piano[s]["B_frame"]) if not np.isnan(piano[s]["B_frame"]).all() else np.nan for s in piano]
    ax[0].loglog(f0s, Bs, "o-", color=GOLD, ms=6, label="measured B (whole note)")
    ax[0].vlines(f0s, lo, hi, color="#7ad0ff", lw=3, label="spread of B across 16 frames")
    for s, f, B in zip(piano, f0s, Bs):
        ax[0].annotate(s, (f, B), textcoords="offset points", xytext=(6, -12), fontsize=8, color="#c8c8d8")
    ax[0].axhspan(1e-3, 2e-3, color=DIM, alpha=.25, label="entry's guess for 'Piano (Bass)'")
    slope = np.polyfit(np.log2(f0s[1:7]), np.log2(Bs[1:7]), 1)[0]
    ax[0].set_xlabel("fundamental (Hz)"); ax[0].set_ylabel("B (string stiffness)")
    ax[0].set_title(f"Stiffness across the keyboard\nB grows ~{2**slope:.1f}x per octave above A2", fontsize=11)
    ax[0].legend(**leg, loc="upper left")

    cmap = plt.get_cmap("plasma")
    ax[1].axhline(0, color="#e8e8f0", lw=2.2, label="the flat line")
    for i, s in enumerate(order):
        r = piano[s]
        m = r["n_max"]
        ax[1].plot(n[:m], r["fit_cents"][:m], color=cmap(i / len(order)), lw=1.6, label=f"{s} ({r['f0']:.0f} Hz)")
        ax[1].plot(n[m - 1:], r["fit_cents"][m - 1:], color=cmap(i / len(order)), lw=.8, ls=":")
    ax[1].set_ylim(-20, 1200); ax[1].set_xlabel("partial n"); ax[1].set_ylabel("cents off harmonic")
    ax[1].set_title("Each string's bend, as Wavetable B\nsolid = measured range, dotted = the fit carried on (what 05 plays)", fontsize=11)
    ax[1].legend(**leg, loc="upper left", ncol=2)

    for i, s in enumerate(order):
        r = piano[s]
        ax[2].plot(r["times"], tp.effective_bend(r), "o-", ms=3, color=cmap(i / len(order)), label=s)
    ax[2].set_xscale("log"); ax[2].set_xlabel("seconds after the strike")
    ax[2].set_ylabel("bend as heard (cents, level-weighted)")
    ax[2].set_title("Where the settling lives, every register\nthe bend holds; the bent partials go quiet", fontsize=11)
    ax[2].legend(**leg, ncol=2)
    fig.tight_layout()
    fig.savefig(HERE / "keyboard-stiffness.png", dpi=130, facecolor=BG)
    print("wrote keyboard-stiffness.png")

    fig, ax = plt.subplots(2, 2, figsize=(15, 9), facecolor=BG)
    for a, (k, d) in zip(ax.flat, lib.items()):
        a.set_facecolor(PANEL)
        K = d["n_modes"]; kk = np.arange(1, K + 1)
        a.axhline(0, color="#e8e8f0", lw=2.2)
        lvl = d["_amp"][0, :K]
        a.vlines(kk, 0, d["_cents"][0, :K], color=GOLD, alpha=.35, lw=1)
        a.scatter(kk, d["_cents"][0, :K], s=20 + 160 * np.sqrt(lvl / lvl.max()), color=GOLD, zorder=3,
                  label="attack frame (dot size = loudness)")
        a.scatter(kk, d["_cents"][-1, :K], s=10, color="#7ad0ff", zorder=4, label="last frame")
        for j in range(K):
            if lvl[j] > 0.08 * lvl.max() or j == 0:
                a.annotate(f"×{d['mode_ratios'][j]:.2f}", (kk[j], d["_cents"][0, j]), textcoords="offset points",
                           xytext=(5, 6), fontsize=7.5, color="#c8c8d8")
        a.set_xlabel("slot k (k-th mode, counted up from the lowest)"); a.set_ylabel("cents off k × f1")
        a.set_title(f"{k}   ·   f1 = {d['f1_hz']:.1f} Hz   ·   {K} modes", fontsize=11)
        a.legend(**leg, loc="best")
    fig.suptitle("The library's first modal shelf, rank-filed: the k-th mode lives in slot k", color="#e8e8f0", fontsize=13)
    fig.tight_layout()
    fig.savefig(HERE / "library-sheet.png", dpi=120, facecolor=BG)
    print("wrote library-sheet.png")
