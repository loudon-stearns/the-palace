#!/usr/bin/env python3
"""
threshold_and_tilt.py — two questions cycle 16 left open (GWL cycle 17)
=======================================================================

1. THRESHOLD. Cycle 16 proposed: "past about 30 cycles, the interview's
   default becomes the family chain." Is 30 right? Draw random subsets of
   each folder (8..120 cycles, 20 draws each) and count, for each size, how
   often the family chain has fewer big jumps than the dull->bright default,
   and what it costs in brightness-follows-Position.

2. TILT. Within a family the chain walks the shortest path and ignores
   brightness. Add a pull toward brightness order inside each family
   (cost = distance + lam * median_distance * |brightness-rank gap|) and see
   whether it buys brightness back without new jumps.

Big jump = a step longer than that folder's own 90th-percentile walk step
(the relative yardstick), so wild and tame folders are judged by their own
standard. Writes threshold_and_tilt.json.

    /usr/local/bin/python3 threshold_and_tilt.py
"""
import json
import sys
import warnings
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "akwf-scale-up-fmsynth"))
import scale_up as su  # noqa: E402
import scale_up_folder as sf  # noqa: E402

warnings.filterwarnings("ignore")


def families(X, D, ks=range(3, 9)):
    best = (-9, None)
    for k in ks:
        if k >= len(X):
            break
        lab = su.kmeans(X, k, restarts=8)
        s = su.silhouette(D, lab)
        if s > best[0]:
            best = (s, lab)
    return best[1]


def chain(D, cents, lab, lam=0.0):
    rank = np.argsort(np.argsort(cents)) / len(cents)
    medD = np.median(D[np.triu_indices(len(D), 1)])
    Dt = D + lam * medD * np.abs(rank[:, None] - rank[None, :])
    fams = sorted([np.where(lab == c)[0] for c in set(lab)], key=lambda g: cents[g].mean())
    g = fams[0]
    o = list(g[su.walk_order(Dt[np.ix_(g, g)], int(np.argmin(cents[g])))]) if len(g) > 1 else list(g)
    for g in fams[1:]:
        e = int(np.argmin(D[o[-1], g]))
        o += list(g[su.walk_order(Dt[np.ix_(g, g)], e)]) if len(g) > 1 else list(g)
    return np.array(o)


def score(D, cents, o, far):
    s = sf.steps_of(D, o)
    return int((s > far).sum()), su.rank_corr(np.arange(len(o)), cents[o])


def main():
    rng = np.random.default_rng(17)
    out = {"threshold": {}, "tilt": {}}
    for tag in ["fmsynth", "eorgan"]:
        stems, cyc, _ = sf.load(sf.AKWF / f"AKWF_{tag}", tag)
        X = su.timbre_features(cyc)
        Dall = su.pairwise(X)
        cents_all = np.array([su.spectral_centroid(c, su.SR) for c in cyc])
        o0 = su.walk_order(Dall, int(np.argmin(cents_all)))
        far = float(np.percentile(sf.steps_of(Dall, o0), 90))
        out["threshold"][tag] = {"relative_far_step": round(far, 1), "by_size": {}}
        for size in [8, 12, 16, 24, 32, 48, 64, 96]:
            if size > len(cyc):
                continue
            wins, dj, db = 0, [], []
            for _ in range(20):
                idx = rng.choice(len(cyc), size, replace=False)
                D = Dall[np.ix_(idx, idx)]
                c = cents_all[idx]
                lab = families(X[idx], D, ks=range(2, min(8, size // 3) + 1))
                jd, bd = score(D, c, np.argsort(c), far)
                jc, bc = score(D, c, chain(D, c, lab), far)
                wins += jc < jd
                dj.append(jd - jc)
                db.append(bd - bc)
            out["threshold"][tag]["by_size"][size] = {
                "chain_fewer_jumps_in_of_20": int(wins),
                "jumps_saved_mean": round(float(np.mean(dj)), 1),
                "brightness_given_up_mean": round(float(np.mean(db)), 2)}
            print(tag, size, out["threshold"][tag]["by_size"][size])
        lab = families(X, Dall)
        for lam in [0.0, 0.5, 1.0, 2.0]:
            j, b = score(Dall, cents_all, chain(Dall, cents_all, lab, lam), far)
            out["tilt"].setdefault(tag, {})[str(lam)] = {"big_jumps": j, "brightness_follows_position": round(b, 2)}
            print(tag, "tilt", lam, j, round(b, 2))
    (HERE / "threshold_and_tilt.json").write_text(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
