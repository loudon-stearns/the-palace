#!/usr/bin/env python3
"""
scale_up.py — the AKWF scale-up run (GWL cycle 16, 2026-10-14)
==============================================================

Loudon's grant (2026-06-25, SCALE-UP): point the wavetable interview at a real
AKWF category folder of a hundred-plus cycles, let the "cluster first" branch
do visible work, and see where the captured-audio defaults break.

Source: AKWF_fmsynth — 122 single cycles, 600 samples each, from Loudon's own
library at ~/Library/CloudStorage/Dropbox/_Reference/AKWF/AKWF_fmsynth/.

What this script makes, all from the same 122 cycles:

  1. DEFAULT  — the interview's captured-audio default path, unchanged:
                pack the whole folder, order dull -> bright by spectral
                centroid. (What pack_wavetable.py does.)
  2. WALK     — the whole folder, ordered as a shortest timbral walk
                (nearest-neighbour + 2-opt over log-harmonic spectra), each
                frame circularly rotated to line up with the one before it.
  3. CLUSTERS — the "cluster first" branch: k-means over the same
                log-harmonic spectra, k picked by silhouette, one small
                table per family, each ordered as a walk and phase-aligned.

For every table: a Serum/CLM WAV (2048-sample frames, 32-bit float), an
Ableton WAV (1024-sample frames, 16-bit), and a 110 Hz audition sweep. The
metrics that show where the default breaks are written to metrics.json.

Run with a python that has numpy + scipy + matplotlib:
    /usr/local/bin/python3 scale_up.py [--src <folder>]
"""

from __future__ import annotations

import argparse
import json
import sys
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
BUNDLE = HERE.parent
sys.path.insert(0, str(BUNDLE / "akwf-import-pipeline"))
sys.path.insert(0, str(BUNDLE / "crystal-bravais"))

from pack_wavetable import read_mono_float, resample_cycle, spectral_centroid  # noqa: E402
from clm_writer import write_clm_wav, read_clm_wav  # noqa: E402

DEFAULT_SRC = Path.home() / "Library/CloudStorage/Dropbox/_Reference/AKWF/AKWF_fmsynth"
SR = 44100
CLM_N = 2048
ABL_N = 1024
N_HARM = 64          # harmonics used for the timbre fingerprint
RNG = np.random.default_rng(16)
FAR_STEP = 92.0      # 90th percentile of the walk's steps: above this a neighbour is a stranger


# ---------------------------------------------------------------- loading

def load(src: Path):
    paths = sorted(p for p in src.iterdir() if p.suffix.lower() == ".wav")
    stems, cycles = [], []
    for p in paths:
        c = resample_cycle(read_mono_float(p), CLM_N)
        c = c - c.mean()                       # strip DC: it is not timbre
        stems.append(p.stem.replace("AKWF_fmsynth_", "fm"))
        cycles.append(c)
    return stems, np.array(cycles)


# ---------------------------------------------------------------- features

def harmonic_mags(cycles):
    """|X[k]| for harmonics 1..N_HARM — one frame = one period, so bin k = harmonic k."""
    return np.abs(np.fft.rfft(cycles, axis=1))[:, 1:N_HARM + 1]


def timbre_features(cycles):
    """Loudness-independent log spectrum: what a frame *sounds like*, not how loud."""
    m = harmonic_mags(cycles)
    m = m / (np.linalg.norm(m, axis=1, keepdims=True) + 1e-12)
    return 20 * np.log10(m + 1e-3)            # floor at -60 dB


def pairwise(X):
    sq = (X ** 2).sum(1)
    return np.sqrt(np.maximum(sq[:, None] + sq[None, :] - 2 * X @ X.T, 0))


# ---------------------------------------------------------------- orderings

def walk_order(D, start):
    """Nearest-neighbour tour from `start`, then 2-opt on the open path."""
    n = len(D)
    order, seen = [start], {start}
    while len(order) < n:
        last = order[-1]
        nxt = min((j for j in range(n) if j not in seen), key=lambda j: D[last, j])
        order.append(nxt)
        seen.add(nxt)
    order = np.array(order)
    improved = True
    while improved:
        improved = False
        for i in range(1, n - 1):
            for j in range(i + 1, n):
                a, b = order[i - 1], order[i]
                c = order[j]
                d = order[j + 1] if j + 1 < n else None
                old = D[a, b] + (D[c, d] if d is not None else 0)
                new = D[a, c] + (D[b, d] if d is not None else 0)
                if new < old - 1e-9:
                    order[i:j + 1] = order[i:j + 1][::-1]
                    improved = True
    return order


def align_rotations(frames):
    """Rotate each frame (circularly) to best match the frame before it.

    A rotation of one period changes nothing you hear in a held note — it is
    the same waveform started at a different point — but it changes what the
    synth hears *between* two frames, where it crossfades them sample by
    sample. Misaligned neighbours cancel in the middle of the morph.
    """
    out = [frames[0]]
    for f in frames[1:]:
        prev = out[-1]
        xc = np.fft.irfft(np.fft.rfft(prev) * np.conj(np.fft.rfft(f)), n=len(f))
        out.append(np.roll(f, int(np.argmax(xc))))
    return np.array(out)


# ---------------------------------------------------------------- clustering

def kmeans(X, k, restarts=24, iters=100):
    best = (np.inf, None, None)
    for _ in range(restarts):
        cent = [X[RNG.integers(len(X))]]
        for _ in range(1, k):                  # k-means++ seeding
            d2 = np.min(((X[:, None] - np.array(cent)[None]) ** 2).sum(-1), 1)
            cent.append(X[RNG.choice(len(X), p=d2 / d2.sum())])
        cent = np.array(cent)
        for _ in range(iters):
            lab = np.argmin(((X[:, None] - cent[None]) ** 2).sum(-1), 1)
            new = np.array([X[lab == c].mean(0) if np.any(lab == c) else cent[c] for c in range(k)])
            if np.allclose(new, cent):
                break
            cent = new
        inertia = ((X - cent[lab]) ** 2).sum()
        if inertia < best[0]:
            best = (inertia, lab, cent)
    return best[1]


def silhouette(D, lab):
    s = []
    for i in range(len(D)):
        same = (lab == lab[i])
        if same.sum() <= 1:
            s.append(0.0)
            continue
        a = D[i, same].sum() / (same.sum() - 1)
        b = min(D[i, lab == c].mean() for c in set(lab) if c != lab[i])
        s.append((b - a) / max(a, b))
    return float(np.mean(s))


# ---------------------------------------------------------------- measures

def rms(x):
    return float(np.sqrt(np.mean(x ** 2)) + 1e-12)


def morph_dips_db(frames):
    """Level of the 50/50 crossfade vs the mean of its two neighbours, in dB.

    0 dB = the morph holds its level. Strongly negative = the two frames
    cancel halfway between them — you hear it as a hollow, thin dip in the
    sweep that neither frame has on its own.
    """
    out = []
    for a, b in zip(frames[:-1], frames[1:]):
        mid = 0.5 * (a + b)
        out.append(20 * np.log10(rms(mid) / (0.5 * (rms(a) + rms(b)))))
    return np.array(out)


def describe(frames):
    """Plain-word name for a family, from what its spectra measure."""
    m = harmonic_mags(frames).mean(0)
    p = m ** 2 / (m ** 2).sum()
    k = np.arange(1, N_HARM + 1)
    cent = float((p * k).sum())                          # in harmonics
    odd = float(p[0::2].sum())                           # harmonics 1,3,5…
    fund = float(p[0])
    if fund > 0.6:
        tone = "round"
    elif cent < 4:
        tone = "warm"
    elif cent < 9:
        tone = "bright"
    else:
        tone = "glassy"
    shape = "hollow" if odd > 0.8 else ("nasal" if odd < 0.35 else "full")
    return f"{tone}-{shape}", cent, odd, fund


# ---------------------------------------------------------------- writers

def to_ableton(frames2048):
    return np.array([resample_cycle(f, ABL_N) for f in frames2048])


def write_pcm16(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.round(x * 32767).astype("<i2").tobytes())


def sweep(table, f0=110.0, dur=16.0):
    """Held A2 while Position sweeps 0 -> 1; linear interp in phase and position."""
    n = int(dur * SR)
    nf, fs = table.shape
    idx = np.arange(n)
    sp = (f0 / SR * idx % 1.0) * fs
    s0 = np.floor(sp).astype(int) % fs
    s1 = (s0 + 1) % fs
    fr = sp - np.floor(sp)
    fp = idx / (n - 1) * (nf - 1)
    a0 = np.floor(fp).astype(int)
    a1 = np.minimum(a0 + 1, nf - 1)
    ff = fp - a0
    A = table[a0, s0] * (1 - fr) + table[a0, s1] * fr
    B = table[a1, s0] * (1 - fr) + table[a1, s1] * fr
    out = A * (1 - ff) + B * ff
    ramp = int(0.05 * SR)
    out[:ramp] *= np.linspace(0, 1, ramp)
    out[-ramp:] *= np.linspace(1, 0, ramp)
    return out / (np.max(np.abs(out)) + 1e-12) * 0.9


def emit(name, frames, outdir, dur):
    frames = frames / (np.max(np.abs(frames)) + 1e-12) * 0.99    # joint normalize
    outdir.mkdir(parents=True, exist_ok=True)
    clm = outdir / f"{name}.wav"
    write_clm_wav(frames.astype(np.float32), clm, sample_rate=SR)
    back, meta = read_clm_wav(clm)                                  # round-trip check
    assert np.allclose(np.asarray(back).reshape(-1), frames.astype(np.float32).reshape(-1), atol=1e-7) and meta.get("frame_size") == CLM_N, "CLM round trip failed"
    abl = to_ableton(frames)
    abl = abl / (np.max(np.abs(abl)) + 1e-12) * 0.99
    write_pcm16(outdir / f"{name}_ableton.wav", abl.reshape(-1))
    write_pcm16(outdir / f"{name}_audition_sweep.wav", sweep(abl, dur=dur))
    return [f"{name}.wav", f"{name}_ableton.wav", f"{name}_audition_sweep.wav"]


# ---------------------------------------------------------------- picture

def contact_sheet(frames, labels, names, order, path, title):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    pal = ["#c8553d", "#2d6a8f", "#d8a31a", "#5c8a3a", "#8e5ba8", "#3a9a9a", "#7a6a55", "#c97a9e"]
    n = len(order)
    cols = 16
    rows = int(np.ceil(n / cols))
    fig, axes = plt.subplots(rows, cols, figsize=(cols * 1.05, rows * 0.8 + 0.9))
    fig.patch.set_facecolor("#f6f1e7")
    for ax in axes.flat:
        ax.axis("off")
    for pos, i in enumerate(order):
        ax = axes.flat[pos]
        ax.plot(frames[i][::8], color=pal[labels[i] % len(pal)], lw=0.9)
        ax.set_ylim(-1.05, 1.05)
        ax.text(0.02, 0.98, str(pos), transform=ax.transAxes, fontsize=5, va="top", color="#555")
    handles = [plt.Line2D([], [], color=pal[c % len(pal)], lw=2, label=nm) for c, nm in enumerate(names)]
    fig.legend(handles=handles, loc="upper center", ncol=len(names), frameon=False, fontsize=8,
               bbox_to_anchor=(0.5, 1.0))
    fig.suptitle(title, y=0.955, fontsize=9, color="#333")
    fig.subplots_adjust(left=0.01, right=0.99, top=0.88, bottom=0.01, wspace=0.08, hspace=0.12)
    fig.savefig(path, dpi=130, facecolor=fig.get_facecolor())
    plt.close(fig)


# ---------------------------------------------------------------- main

def rank_corr(a, b):
    """Spearman rank correlation, numpy only."""
    ra, rb = np.argsort(np.argsort(a)), np.argsort(np.argsort(b))
    return float(np.corrcoef(ra, rb)[0, 1])


def table_stats(frames, D, order, cents=None):
    steps = np.array([D[a, b] for a, b in zip(order[:-1], order[1:])])
    dips = morph_dips_db(frames)
    extra = {}
    if cents is not None:
        # does turning Position up still mean "brighter"? 1.0 = always, 0 = no relation
        extra["brightness_follows_position"] = round(rank_corr(np.arange(len(order)), cents[order]), 2)
        extra["far_steps"] = int((steps > FAR_STEP).sum())
    return extra | {
        "frames": int(len(order)),
        "mean_step": round(float(steps.mean()), 1),
        "max_step": round(float(steps.max()), 1),
        "worst_dip_db": round(float(dips.min()), 1),
        "dips_below_-6db": int((dips < -6).sum()),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", type=Path, default=DEFAULT_SRC)
    args = ap.parse_args()

    stems, cyc = load(args.src)
    n = len(cyc)
    X = timbre_features(cyc)
    D = pairwise(X)
    cents = np.array([spectral_centroid(c, SR) for c in cyc])
    metrics = {"source": str(args.src), "n_cycles": n, "tables": {}}

    # 1. DEFAULT — centroid, as the interview defaults would do it
    o_def = np.argsort(cents, kind="stable")
    f_def = cyc[o_def]
    metrics["tables"]["default_centroid"] = table_stats(f_def, D, o_def, cents)
    files = emit("akwf_fmsynth_centroid", f_def, HERE / "tables", dur=24.0)

    # 2. WALK — shortest timbral path, rotation-aligned
    o_walk = walk_order(D, start=int(o_def[0]))
    f_walk = align_rotations(cyc[o_walk])
    metrics["tables"]["walk_aligned"] = table_stats(f_walk, D, o_walk, cents)
    metrics["tables"]["walk_unaligned"] = table_stats(cyc[o_walk], D, o_walk, cents)
    files += emit("akwf_fmsynth_walk", f_walk, HERE / "tables", dur=24.0)

    # 3. CLUSTERS — k by silhouette
    sil = {}
    labs = {}
    for k in range(3, 9):
        labs[k] = kmeans(X, k)
        sil[k] = silhouette(D, labs[k])
    k = max(sil, key=sil.get)
    lab = labs[k]
    # name families and sort them dark -> bright by mean centroid
    fam = []
    for c in range(k):
        idx = np.where(lab == c)[0]
        nm, hc, odd, fund = describe(cyc[idx])
        fam.append((float(cents[idx].mean()), c, idx, nm, hc, odd, fund))
    fam.sort()
    relabel = {c: r for r, (_, c, *_rest) in enumerate(fam)}
    lab2 = np.array([relabel[c] for c in lab])
    names, seen = [], {}
    cluster_rows = []
    chain = []
    for r, (mc, c, idx, nm, hc, odd, fund) in enumerate(fam):
        seen[nm] = seen.get(nm, 0) + 1
        label = nm if seen[nm] == 1 else f"{nm}-{seen[nm]}"
        names.append(f"{r + 1} {label} ({len(idx)})")
        sub = D[np.ix_(idx, idx)]
        start = int(np.argmin(cents[idx]))
        o_local = walk_order(sub, start) if len(idx) > 2 else np.arange(len(idx))
        order = idx[o_local]
        frames = align_rotations(cyc[order])
        tag = f"akwf_fmsynth_family{r + 1}_{label}"
        st = table_stats(frames, D, order)
        st.update({"name": label, "mean_centroid_hz": round(mc, 0),
                   "centroid_in_harmonics": round(hc, 2), "odd_share": round(odd, 2),
                   "fundamental_share": round(fund, 2),
                   "members": [stems[i] for i in order]})
        metrics["tables"][f"family{r + 1}"] = st
        files += emit(tag, frames, HERE / "tables" / "families", dur=max(6.0, len(idx) * 0.25))
        cluster_rows.append((r + 1, label, len(idx)))
        chain.append(order)
    # 4. FAMILY CHAIN — every family end to end, dark family first, each walked
    #    inside; the join between families enters at the member nearest the
    #    last frame of the family before. Coarse brightness, fine smoothness.
    o_chain = list(chain[0])
    for grp in chain[1:]:
        sub = D[np.ix_(grp, grp)]
        entry = int(np.argmin(D[o_chain[-1], grp]))
        o_chain += list(grp[walk_order(sub, entry)])
    o_chain = np.array(o_chain)
    f_chain = align_rotations(cyc[o_chain])
    metrics["tables"]["family_chain"] = table_stats(f_chain, D, o_chain, cents)
    files += emit("akwf_fmsynth_family_chain", f_chain, HERE / "tables", dur=24.0)

    metrics["silhouette_by_k"] = {str(kk): round(v, 3) for kk, v in sil.items()}
    metrics["k_chosen"] = k

    # where does the default break? the five worst centroid-order steps
    steps = [(D[a, b], stems[a], stems[b], cents[a], cents[b]) for a, b in zip(o_def[:-1], o_def[1:])]
    steps.sort(reverse=True)
    metrics["default_worst_steps"] = [
        {"from": s[1], "to": s[2], "distance": round(float(s[0]), 1),
         "centroid_change_hz": round(float(s[4] - s[3]), 1)} for s in steps[:5]]

    contact_sheet(cyc, lab2, names, o_def, HERE / "contact_sheet_centroid_order.png",
                  "AKWF_fmsynth · 122 cycles in the default dull→bright order · colour = family")
    contact_sheet(cyc, lab2, names, o_chain, HERE / "contact_sheet_family_chain.png",
                  "AKWF_fmsynth · families end to end, dark family first, each walked inside · colour = family")
    contact_sheet(cyc, lab2, names, o_walk, HERE / "contact_sheet_walk_order.png",
                  "AKWF_fmsynth · the same 122 cycles as a shortest timbral walk · colour = family")

    (HERE / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(json.dumps({k_: v for k_, v in metrics.items() if k_ != "tables"}, indent=2))
    for name, st in metrics["tables"].items():
        print(name, {k_: v for k_, v in st.items() if k_ != "members"})
    print("\n".join(files))


if __name__ == "__main__":
    main()
