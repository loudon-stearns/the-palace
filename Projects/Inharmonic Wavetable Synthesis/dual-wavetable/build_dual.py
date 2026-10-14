#!/usr/bin/env python3
"""Both walls at once: a real wavetable as Wavetable A, physics as Wavetable B.

Inharmonic Wavetable Synthesis, steward cycle 7 (2026-10-14).

Until now every audition used hand-typed amplitude profiles (saw / hollow /
vocal) for Wavetable A. The entry's claim is bigger: *any* wavetable becomes
an amplitude template once you FFT its frames. This script takes a real
table built today by the sibling project, Generative Wavetable Libraries
(the AKWF electric-organ family chain, 142 frames x 2048 samples), turns
each frame into 64 partial amplitudes, and plays it through the additive
engine against two Wavetable B trajectories on their own clock:

  piano-settling  string stiffness, B decays from attack to rest
  bell-dissolving Bessel J0 membrane positions relaxing to the flat line

Engine, per partial n (1-based), per sample:
    A_n  = |FFT(frame at tau_A)|[n]                  (Wavetable A)
    c_n  = cents of partial n in frame at tau_B       (Wavetable B)
    f_n  = n * f0 * 2^(Bdepth * c_n / 1200)
    out  = sum_n A_n * env_n * sin(2*pi * cumsum(f_n / fs))

Run with /usr/local/bin/python3 (needs numpy, scipy, matplotlib).
Writes: dual-data.json (for the playable page), four WAVs, cube-walls.png.
"""
import json, pathlib
import numpy as np
from scipy.io import wavfile
from scipy.special import jn_zeros

HERE = pathlib.Path(__file__).parent
PALACE = HERE.parents[2]
SRC = (PALACE / "Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/"
       "tables/akwf_eorgan_family_chain_tilted.wav")
WTB_JSON = HERE.parent / "faust-prototype/multi-frame-wtb/piano-settling.wtb.json"

FS = 48000
NP = 64
FRAME = 2048
n = np.arange(1, NP + 1, dtype=np.float64)


# ── Wavetable A: FFT every frame of a real table ────────────────────────────
def load_wta():
    sr, x = wavfile.read(SRC)
    x = x.astype(np.float64)
    nf = len(x) // FRAME
    frames = x[: nf * FRAME].reshape(nf, FRAME)
    mags = np.abs(np.fft.rfft(frames, axis=1))[:, 1 : NP + 1]   # bins 1..64
    mags /= mags.max()                                         # one norm per table
    return mags                                                # (142, 64)


# ── Wavetable B trajectories ────────────────────────────────────────────────
def wtb_piano(nfr=16):
    """Same B-coefficient schedule as the cycle-6 scanner, extended to 64."""
    bs = np.array(json.load(open(WTB_JSON))["b_coefficient_per_frame"])
    if len(bs) != nfr:
        bs = np.interp(np.linspace(0, 1, nfr), np.linspace(0, 1, len(bs)), bs)
    return 1200 * np.log2(np.sqrt(1 + bs[:, None] * n[None, :] ** 2)), bs


def wtb_bell(nfr=16):
    """Partial n sits on the n-th zero of J0 (a circular membrane), scaled so
    partial 1 stays put. Frames ease from full bell to the flat line."""
    z = jn_zeros(0, NP)
    ratio = z / z[0]
    bell = 1200 * np.log2(ratio / n)                   # cents off harmonic
    w = (1 - np.linspace(0, 1, nfr)) ** 1.6            # ease to flat
    return w[:, None] * bell[None, :]


def interp_frames(table, pos):
    """pos: array in [0,1] per sample -> (NP, T) values, linear between frames."""
    nfr = table.shape[0]
    fi = np.clip(pos, 0, 1) * (nfr - 1)
    lo = np.floor(fi).astype(int)
    hi = np.minimum(lo + 1, nfr - 1)
    a = (fi - lo)[None, :]
    return table[lo].T * (1 - a) + table[hi].T * a


# ── the engine ──────────────────────────────────────────────────────────────
def voice(f0, dur, wta, tauA, wtb, tauB, bdepth, env="hold"):
    t = np.arange(int(FS * dur)) / FS
    A = interp_frames(wta, tauA(t))                    # (NP, T)
    C = interp_frames(wtb, tauB(t))
    bd = bdepth(t)[None, :] if callable(bdepth) else bdepth
    f = n[:, None] * f0 * np.power(2.0, bd * C / 1200.0)
    A = np.where(f < FS * 0.45, A, 0.0)                # antialias guard
    ph = 2 * np.pi * np.cumsum(f / FS, axis=1)
    atk = np.clip(t / 0.006, 0, 1)
    if env == "strike":                                # upper partials die first
        tau = 2.6 / (1.0 + 0.07 * (n - 1))
        E = atk[None, :] * np.exp(-t[None, :] / tau[:, None])
    else:                                              # held, gentle release
        rel = np.clip((dur - t) / 0.4, 0, 1)
        E = (atk * rel)[None, :]
    return (A * E * np.sin(ph)).sum(axis=0)


def write(name, y, peak=0.89):
    y = y / (np.max(np.abs(y)) + 1e-12) * peak
    wavfile.write(HERE / name, FS, (y * 32767).astype(np.int16))
    print(f"wrote {name}  {len(y)/FS:.1f}s")


def const(v):
    return lambda t: np.full_like(t, v)


if __name__ == "__main__":
    wta = load_wta()
    piano, bs = wtb_piano()
    bell = wtb_bell()
    flat = np.zeros_like(piano)
    A2, E3, Cs4, A3 = 110.0, 164.81, 277.18, 220.0

    # 1 — amplitude wall alone: B depth 0, tau_A sweeps all 142 organ frames
    write("01-amplitude-wall-alone.wav",
          voice(A2, 10, wta, lambda t: t / 10, flat, const(0), 0.0))

    # 2 — same organ, struck, piano settling (tau_A parked at three spots)
    gap = np.zeros(int(FS * 0.25))
    parts = []
    for ta in (0.15, 0.55, 0.95):
        parts += [voice(A2, 2.6, wta, const(ta), piano,
                        lambda t: np.clip(t / 1.4, 0, 1) ** 0.6, 0.3, "strike"), gap]
    write("02-organ-struck-piano-settling.wav", np.concatenate(parts))

    # 3 — bell dissolving into harmony over 4 s, organ table drifting slowly
    write("03-organ-bell-dissolving.wav",
          voice(A2, 6, wta, lambda t: 0.3 + 0.1 * t / 6, bell,
                lambda t: np.clip((t - 0.6) / 4.0, 0, 1), 1.0))

    # 4 — two clocks: A chord, tau_A creeps across the table, tau_B and
    #     B depth on slow LFOs -> consonance, roughness, consonance
    D = 18
    tauA = lambda t: t / D
    tauB = lambda t: 0.5 - 0.5 * np.cos(2 * np.pi * 0.09 * t)
    bdep = lambda t: 0.5 - 0.5 * np.cos(2 * np.pi * 0.055 * t)
    y = sum(voice(f, D, wta, tauA, bell, tauB, bdep) for f in (A2, E3, Cs4))
    write("04-two-clocks-chord.wav", y)

    # data for the playable page: 48 frames of the organ wall
    pick = np.linspace(0, wta.shape[0] - 1, 48).round().astype(int)
    data = {
        "source": "Generative Wavetable Libraries / AKWF eorgan family chain (tilted), 142 frames",
        "n_partials": NP,
        "wta": np.round(wta[pick], 4).tolist(),
        "wtb": {"piano": np.round(piano, 2).tolist(),
                "bell": np.round(bell, 2).tolist()},
        "piano_B": bs.round(6).tolist(),
    }
    real = HERE.parent / "trajectory-library/piano-low-A1.wtb.json"   # cycle 8
    if real.exists():
        data["wtb"]["piano_real"] = json.load(open(real))["frames"]
    # cycle 9: the first shelf of the measured library. Modal objects are
    # rank-filed and carry a slot mask: slots above their last mode are silent.
    data["mask"] = {}
    for key, fname in (("piano_A4", "piano-A4"), ("piano_Fs6", "piano-Fs6"),
                       ("bell_real", "bell-brooklyn-C6"), ("vibes_real", "vibraphone-C4"),
                       ("marimba_real", "marimba-C3"), ("bowl_real", "singing-bowl-D4")):
        fp = HERE.parent / f"trajectory-library/{fname}.wtb.json"
        if fp.exists():
            d = json.load(open(fp))
            data["wtb"][key] = d["frames"]
            if "n_modes" in d:
                data["mask"][key] = [1 if k < d["n_modes"] else 0 for k in range(NP)]
    json.dump(data, open(HERE / "dual-data.json", "w"), separators=(",", ":"))

    # cube walls figure
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.family": ["Helvetica", "DejaVu Sans"], "text.color": "#e8e8f0",
                         "axes.labelcolor": "#c8c8d8", "xtick.color": "#8a8aa0",
                         "ytick.color": "#8a8aa0", "axes.edgecolor": "#4a4a5e"})
    fig, ax = plt.subplots(1, 3, figsize=(15, 4.8), facecolor="#0a0a0f",
                           gridspec_kw={"width_ratios": [1.25, 1, 1]})
    for a in ax:
        a.set_facecolor("#12121a")
    ax[0].imshow(20 * np.log10(wta.T + 1e-4), aspect="auto", origin="lower",
                 cmap="magma", vmin=-60, vmax=0, extent=[0, 1, 1, NP])
    ax[0].set_title("Wavetable A — the amplitude wall\n142 organ frames, FFT'd", fontsize=11)
    ax[0].set_xlabel("τ_A  (position in the organ table)"); ax[0].set_ylabel("partial n")
    ax[0].axvline(0.507, color="#e8b84a", lw=.7, ls=":"); ax[0].axvline(0.915, color="#e8b84a", lw=.7, ls=":")
    im = ax[1].imshow(bell.T, aspect="auto", origin="lower", cmap="cividis",
                      extent=[0, 1, 1, NP])
    ax[1].set_title("Wavetable B — the inharmonicity wall\nbell (zeros of J0) easing to flat", fontsize=11)
    ax[1].set_xlabel("τ_B"); fig.colorbar(im, ax=ax[1], label="cents off harmonic")
    t = np.linspace(0, D, 600)
    ax[2].plot(tauA(t), tauB(t), color="#e8b84a", lw=1.4)
    ax[2].scatter([0], [0], color="#e8b84a", s=18)
    ax[2].set_xlim(0, 1); ax[2].set_ylim(0, 1)
    ax[2].set_title("the floor of the cube\npath of the two-clocks chord (18 s)", fontsize=11)
    ax[2].set_xlabel("τ_A  (organ timbre)"); ax[2].set_ylabel("τ_B  (bell, then flat)")
    fig.tight_layout()
    fig.savefig(HERE / "cube-walls.png", dpi=130, facecolor=fig.get_facecolor())
    print("wrote cube-walls.png")
    print("organ frames:", wta.shape, " bell cents p2/p64:", bell[0, 1].round(1), bell[0, -1].round(1),
          " piano frame0 p64:", piano[0, -1].round(1))

    # splice the data into the playable page
    tpl = (HERE / "dual-wavetable-instrument.template.html").read_text()
    (HERE / "dual-wavetable-instrument.html").write_text(
        tpl.replace("/*DATA*/null", (HERE / "dual-data.json").read_text()))
    print("wrote dual-wavetable-instrument.html")
