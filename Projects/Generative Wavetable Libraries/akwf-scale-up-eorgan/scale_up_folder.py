#!/usr/bin/env python3
"""
scale_up_folder.py — the AKWF scale-up, second folder (GWL cycle 17, 2026-10-14)
================================================================================

Cycle 16 ran the interview's captured-audio branch on AKWF_fmsynth (122 wild
FM cycles) and found the dull->bright default lurches, while a "family chain"
(k-means families, darkest first, each walked smoothly inside) glides and
still brightens. That was one folder of very *unlike* cycles.

This run asks whether the finding holds on the opposite kind of folder:
AKWF_eorgan, 154 electric-organ cycles that are mostly near-identical
drawbar settings. Same three orders, same measures, plus two that only
matter when cycles are similar:

  * far steps by the FIXED fmsynth yardstick (92) — comparable across folders
  * far steps by a RELATIVE yardstick (this folder's own 90th-percentile walk
    step) — "a jump by this folder's own standards"
  * duplicates — pairs of cycles closer than 1.0 (practically the same sound)

Reuses every function of ../akwf-scale-up-fmsynth/scale_up.py unchanged; only
the folder, the file prefix and the extra measures are new.

    /usr/local/bin/python3 scale_up_folder.py [--src <folder>] [--tag eorgan]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
BUNDLE = HERE.parent
sys.path.insert(0, str(BUNDLE / "akwf-scale-up-fmsynth"))

import scale_up as su  # noqa: E402

AKWF = Path.home() / "Library/CloudStorage/Dropbox/_Reference/AKWF"


def load(src: Path, tag: str):
    paths = sorted(p for p in src.iterdir() if p.suffix.lower() == ".wav")
    stems, cycles, skipped = [], [], []
    for p in paths:
        try:
            raw = su.read_mono_float(p)
        except OSError:            # Dropbox online-only file that would not download
            skipped.append(p.name)
            continue
        c = su.resample_cycle(raw, su.CLM_N)
        c = c - c.mean()
        stems.append(p.stem.replace(f"AKWF_{tag}_", tag[:2]))
        cycles.append(c)
    return stems, np.array(cycles), skipped


def steps_of(D, order):
    return np.array([D[a, b] for a, b in zip(order[:-1], order[1:])])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tag", default="eorgan")
    ap.add_argument("--src", type=Path, default=None)
    args = ap.parse_args()
    tag = args.tag
    src = args.src or AKWF / f"AKWF_{tag}"
    pre = f"akwf_{tag}"

    stems, cyc, skipped = load(src, tag)
    n = len(cyc)
    X = su.timbre_features(cyc)
    D = su.pairwise(X)
    cents = np.array([su.spectral_centroid(c, su.SR) for c in cyc])
    off = D[np.triu_indices(n, 1)]
    metrics = {"source": str(src), "n_cycles": n, "skipped_unreadable": skipped, "tables": {},
               "pair_distance": {"median": round(float(np.median(off)), 1),
                                 "p10": round(float(np.percentile(off, 10)), 1),
                                 "p90": round(float(np.percentile(off, 90)), 1)},
               "near_duplicate_pairs_lt_1": int((off < 1.0).sum()),
               "centroid_hz": {"min": round(float(cents.min()), 0),
                               "max": round(float(cents.max()), 0)}}

    o_def = np.argsort(cents, kind="stable")
    o_walk = su.walk_order(D, start=int(o_def[0]))
    rel_far = float(np.percentile(steps_of(D, o_walk), 90))
    metrics["relative_far_step"] = round(rel_far, 1)

    def stats(frames, order):
        st = su.table_stats(frames, D, order, cents)
        s = steps_of(D, order)
        st["far_steps_relative"] = int((s > rel_far).sum())
        return st

    files = []
    f_def = cyc[o_def]
    metrics["tables"]["default_centroid"] = stats(f_def, o_def)
    files += su.emit(f"{pre}_centroid", f_def, HERE / "tables", dur=24.0)

    f_walk = su.align_rotations(cyc[o_walk])
    metrics["tables"]["walk_aligned"] = stats(f_walk, o_walk)
    files += su.emit(f"{pre}_walk", f_walk, HERE / "tables", dur=24.0)

    sil, labs = {}, {}
    for k in range(3, 9):
        labs[k] = su.kmeans(X, k)
        sil[k] = su.silhouette(D, labs[k])
    k = max(sil, key=sil.get)
    lab = labs[k]
    fam = []
    for c in range(k):
        idx = np.where(lab == c)[0]
        nm, hc, odd, fund = su.describe(cyc[idx])
        fam.append((float(cents[idx].mean()), c, idx, nm, hc, odd, fund))
    fam.sort(key=lambda t: t[0])
    relabel = {t[1]: r for r, t in enumerate(fam)}
    lab2 = np.array([relabel[c] for c in lab])
    names, seen, chain = [], {}, []
    for r, (mc, c, idx, nm, hc, odd, fund) in enumerate(fam):
        seen[nm] = seen.get(nm, 0) + 1
        label = nm if seen[nm] == 1 else f"{nm}-{seen[nm]}"
        names.append(f"{r + 1} {label} ({len(idx)})")
        sub = D[np.ix_(idx, idx)]
        start = int(np.argmin(cents[idx]))
        o_local = su.walk_order(sub, start) if len(idx) > 2 else np.arange(len(idx))
        order = idx[o_local]
        frames = su.align_rotations(cyc[order])
        st = su.table_stats(frames, D, order)
        st.update({"name": label, "size": int(len(idx)), "mean_centroid_hz": round(mc, 0),
                   "centroid_in_harmonics": round(hc, 2), "odd_share": round(odd, 2),
                   "fundamental_share": round(fund, 2),
                   "members": [stems[i] for i in order]})
        metrics["tables"][f"family{r + 1}"] = st
        files += su.emit(f"{pre}_family{r + 1}_{label}", frames, HERE / "tables" / "families",
                         dur=max(6.0, len(idx) * 0.2))
        chain.append(order)

    o_chain = list(chain[0])
    for grp in chain[1:]:
        sub = D[np.ix_(grp, grp)]
        entry = int(np.argmin(D[o_chain[-1], grp]))
        o_chain += list(grp[su.walk_order(sub, entry)])
    o_chain = np.array(o_chain)
    f_chain = su.align_rotations(cyc[o_chain])
    metrics["tables"]["family_chain"] = stats(f_chain, o_chain)
    files += su.emit(f"{pre}_family_chain", f_chain, HERE / "tables", dur=24.0)

    # 5. TILTED CHAIN — same families, same seams, but inside each family the
    #    walk is pulled toward brightness order: cost = distance + TILT *
    #    median distance * |brightness-rank gap|. See threshold_and_tilt.py.
    TILT = 0.5
    rank = np.argsort(np.argsort(cents)) / n
    Dt = D + TILT * float(np.median(off)) * np.abs(rank[:, None] - rank[None, :])
    o_tilt = []
    for grp in chain:
        grp = np.sort(grp)
        entry = int(np.argmin(cents[grp])) if not o_tilt else int(np.argmin(D[o_tilt[-1], grp]))
        o_tilt += list(grp[su.walk_order(Dt[np.ix_(grp, grp)], entry)]) if len(grp) > 2 else list(grp)
    o_tilt = np.array(o_tilt)
    f_tilt = su.align_rotations(cyc[o_tilt])
    metrics["tables"]["family_chain_tilted"] = stats(f_tilt, o_tilt) | {"tilt": TILT}
    files += su.emit(f"{pre}_family_chain_tilted", f_tilt, HERE / "tables", dur=24.0)

    metrics["silhouette_by_k"] = {str(kk): round(v, 3) for kk, v in sil.items()}
    metrics["k_chosen"] = k

    st = [(D[a, b], stems[a], stems[b], cents[a], cents[b]) for a, b in zip(o_def[:-1], o_def[1:])]
    st.sort(reverse=True)
    metrics["default_worst_steps"] = [
        {"from": s[1], "to": s[2], "distance": round(float(s[0]), 1),
         "centroid_change_hz": round(float(s[4] - s[3]), 1)} for s in st[:5]]

    for o, fn, ttl in [(o_def, "centroid_order", "default dull→bright order"),
                       (o_chain, "family_chain", "families end to end, dark first, walked inside"),
                       (o_walk, "walk_order", "shortest timbral walk")]:
        su.contact_sheet(cyc, lab2, names, o, HERE / f"contact_sheet_{fn}.png",
                         f"AKWF_{tag} · {n} cycles · {ttl} · colour = family")

    (HERE / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(json.dumps({k_: v for k_, v in metrics.items() if k_ != "tables"}, indent=2))
    for name, s in metrics["tables"].items():
        print(name, {k_: v for k_, v in s.items() if k_ != "members"})
    print("\n".join(files))


if __name__ == "__main__":
    main()
