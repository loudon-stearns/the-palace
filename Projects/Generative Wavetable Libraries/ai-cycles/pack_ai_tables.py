#!/usr/bin/env python3
"""
pack_ai_tables.py — the wavetable interview on an audio AI's output (GWL cycle 18)
=================================================================================

Input: cycles.npz from extract_ai_cycles.py (one clean cycle per stable
MusicGen / Stable Audio note from the sister project's AI-source probe).

What is new against the two AKWF runs (cycles 16-17):
  * Duplicates. The probe re-graded some renders under several runs, so
    identical audio arrives under different names. Drop pairs closer than 1.
  * Too many. ~500 cycles is past Serum's 256 frames. Pick 256 by
    farthest-point sampling (each pick the cycle least like any already
    picked), so the cut drops near-twins, not whole regions.
  * Labels. Every AI cycle arrives with the instrument it was asked for.
    Compare those labels with the timbre families k-means finds, and build
    one table per asked-for instrument as well.

Reuses every function of ../akwf-scale-up-fmsynth/scale_up.py unchanged.

    /usr/local/bin/python3 pack_ai_tables.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "akwf-scale-up-fmsynth"))
import scale_up as su  # noqa: E402

MAX_FRAMES = 256
TILT = 0.5


def steps_of(D, order):
    return np.array([D[a, b] for a, b in zip(order[:-1], order[1:])])


def farthest_point(D, n, start):
    pick = [start]
    dmin = D[start].copy()
    while len(pick) < n:
        j = int(np.argmax(dmin))
        pick.append(j)
        dmin = np.minimum(dmin, D[j])
    return np.array(sorted(pick))


def tilted_walk(D, cents, idx, entry_from=None, median_off=1.0):
    n = len(cents)
    rank = np.argsort(np.argsort(cents)) / n
    Dt = D + TILT * median_off * np.abs(rank[:, None] - rank[None, :])
    idx = np.sort(idx)
    entry = int(np.argmin(cents[idx])) if entry_from is None else int(np.argmin(D[entry_from, idx]))
    if len(idx) <= 2:
        return idx
    return idx[su.walk_order(Dt[np.ix_(idx, idx)], entry)]


def rand_index_adjusted(a, b):
    from math import comb
    ua, ub = np.unique(a), np.unique(b)
    M = np.array([[np.sum((a == x) & (b == y)) for y in ub] for x in ua])
    s = sum(comb(int(v), 2) for v in M.ravel())
    sa = sum(comb(int(v), 2) for v in M.sum(1))
    sb = sum(comb(int(v), 2) for v in M.sum(0))
    tot = comb(len(a), 2)
    exp = sa * sb / tot
    return (s - exp) / (0.5 * (sa + sb) - exp), M, ua, ub


def main():
    z = np.load(HERE / "cycles.npz")
    F_all = z["frames"]
    R_all = json.loads(str(z["recs"]))
    X_all = su.timbre_features(F_all)
    D_all = su.pairwise(X_all)

    # 1. duplicates
    keep = []
    for i in range(len(F_all)):
        if all(D_all[i, j] >= 1.0 for j in keep):
            keep.append(i)
    keep = np.array(keep)
    n_dupes = len(F_all) - len(keep)
    F, R, D = F_all[keep], [R_all[i] for i in keep], D_all[np.ix_(keep, keep)]
    cents = np.array([su.spectral_centroid(c, su.SR) for c in F])
    inst = np.array([r["instrument"] for r in R])

    # 2. the cut to 256
    sel = farthest_point(D, min(MAX_FRAMES, len(F)), start=int(np.argmin(cents)))
    Fs, Rs, Ds, cs, ins = F[sel], [R[i] for i in sel], D[np.ix_(sel, sel)], cents[sel], inst[sel]
    Xs = su.timbre_features(Fs)
    n = len(Fs)
    off = Ds[np.triu_indices(n, 1)]
    stems = [r["stem"] for r in Rs]

    metrics = {"source": "Generative Sample Libraries / ai-source-probe (MusicGen melody + text, Stable Audio)",
               "cycles_extracted": int(len(F_all)), "exact_duplicates_dropped": int(n_dupes),
               "after_dedupe": int(len(F)), "frames_in_main_table": int(n),
               "picked_by_instrument": {k: int((ins == k).sum()) for k in sorted(set(ins))},
               "pair_distance": {"median": round(float(np.median(off)), 1),
                                 "p10": round(float(np.percentile(off, 10)), 1),
                                 "p90": round(float(np.percentile(off, 90)), 1)},
               "tables": {}}

    o_def = np.argsort(cs, kind="stable")
    o_walk = su.walk_order(Ds, start=int(o_def[0]))
    rel_far = float(np.percentile(steps_of(Ds, o_walk), 90))
    metrics["relative_far_step"] = round(rel_far, 1)

    def stats(frames, order):
        st = su.table_stats(frames, Ds, order, cs)
        st["far_steps_relative"] = int((steps_of(Ds, order) > rel_far).sum())
        return st

    out = HERE / "tables"
    files = []
    f_def = Fs[o_def]
    metrics["tables"]["centroid"] = stats(f_def, o_def)
    files += su.emit("ai_cycles_centroid", f_def, out, dur=24.0)
    f_walk = su.align_rotations(Fs[o_walk])
    metrics["tables"]["walk"] = stats(f_walk, o_walk)
    files += su.emit("ai_cycles_walk", f_walk, out, dur=24.0)

    # 3. families
    sil, labs = {}, {}
    for k in range(3, 9):
        labs[k] = su.kmeans(Xs, k)
        sil[k] = su.silhouette(Ds, labs[k])
    k = max(sil, key=sil.get)
    lab = labs[k]
    fam = sorted(((float(cs[lab == c].mean()), c) for c in range(k)))
    relabel = {c: r for r, (_, c) in enumerate(fam)}
    lab2 = np.array([relabel[c] for c in lab])
    names, chain, tilt = [], [], []
    med = float(np.median(off))
    for r in range(k):
        idx = np.where(lab2 == r)[0]
        nm, hc, odd, fund = su.describe(Fs[idx])
        mix = {kk: int((ins[idx] == kk).sum()) for kk in sorted(set(ins[idx]))}
        names.append(f"{r + 1} {nm} ({len(idx)})")
        o = idx[su.walk_order(Ds[np.ix_(idx, idx)], int(np.argmin(cs[idx])))] if len(idx) > 2 else idx
        chain.append(o)
        frames = su.align_rotations(Fs[o])
        st = su.table_stats(frames, Ds, o)
        st.update({"name": nm, "size": int(len(idx)), "centroid_in_harmonics": round(hc, 2),
                   "fundamental_share": round(fund, 2), "asked_for": mix})
        metrics["tables"][f"family{r + 1}"] = st
        files += su.emit(f"ai_cycles_family{r + 1}_{nm}", frames, out / "families", dur=max(6.0, len(idx) * 0.2))

    o_chain = list(chain[0])
    for grp in chain[1:]:
        entry = int(np.argmin(Ds[o_chain[-1], grp]))
        o_chain += list(grp[su.walk_order(Ds[np.ix_(grp, grp)], entry)]) if len(grp) > 2 else list(grp)
    o_chain = np.array(o_chain)
    f_chain = su.align_rotations(Fs[o_chain])
    metrics["tables"]["family_chain"] = stats(f_chain, o_chain)
    files += su.emit("ai_cycles_family_chain", f_chain, out, dur=24.0)

    o_tilt = []
    for grp in chain:
        o_tilt += list(tilted_walk(Ds, cs, grp, o_tilt[-1] if o_tilt else None, med))
    o_tilt = np.array(o_tilt)
    f_tilt = su.align_rotations(Fs[o_tilt])
    metrics["tables"]["family_chain_tilted"] = stats(f_tilt, o_tilt) | {"tilt": TILT}
    files += su.emit("ai_cycles_family_chain_tilted", f_tilt, out, dur=24.0)

    metrics["silhouette_by_k"] = {str(kk): round(v, 3) for kk, v in sil.items()}
    metrics["k_chosen"] = int(k)

    # 4. do the AI's labels match what the cycles sound like?
    ari, M, ua, ub = rand_index_adjusted(ins, lab2)
    metrics["labels_vs_families"] = {"adjusted_rand": round(float(ari), 3),
                                     "rows_instrument": [str(u) for u in ua],
                                     "cols_family": [names[int(u)] for u in ub],
                                     "counts": M.tolist()}

    # 5. one table per asked-for instrument (all deduped cycles, not just the 256)
    centsA = cents
    medA = float(np.median(D[np.triu_indices(len(F), 1)]))
    per = {}
    for name in sorted(set(inst)):
        idx = np.where(inst == name)[0]
        if len(idx) > MAX_FRAMES:
            idx = idx[farthest_point(D[np.ix_(idx, idx)], MAX_FRAMES, int(np.argmin(cents[idx])))]
        o = tilted_walk(D, centsA, idx, None, medA)
        frames = su.align_rotations(F[o])
        st = su.table_stats(frames, D, o)
        st["brightness_follows_position"] = round(su.rank_corr(np.arange(len(o)), cents[o]), 2)
        st["models"] = sorted({R[i]["model"] for i in idx})
        per[name] = st
        files += su.emit(f"ai_cycles_asked_{name}", frames, out / "by-instrument", dur=max(8.0, len(idx) * 0.1))
    metrics["by_instrument"] = per

    for o, fn, ttl in [(o_def, "centroid_order", "dull→bright"),
                       (o_chain, "family_chain", "families end to end, dark first, walked inside"),
                       (o_tilt, "family_chain_tilted", "family chain, tilted toward bright")]:
        su.contact_sheet(Fs, lab2, names, o, HERE / f"contact_sheet_{fn}.png",
                         f"audio-AI cycles · {n} of {len(F)} · {ttl} · colour = family")

    (HERE / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(json.dumps({k_: v for k_, v in metrics.items() if k_ not in ("tables", "by_instrument")}, indent=2))
    for nm_, s in metrics["tables"].items():
        print(nm_, s)
    for nm_, s in per.items():
        print("asked", nm_, s)


if __name__ == "__main__":
    main()
