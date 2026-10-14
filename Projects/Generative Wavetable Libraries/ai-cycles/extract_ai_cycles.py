#!/usr/bin/env python3
"""
extract_ai_cycles.py — single cycles out of audio-AI renders (GWL cycle 18, 2026-10-14)
=======================================================================================

The plan's next source after captured audio is an audio AI's output. The
sister project, Generative Sample Libraries, already rendered ~1600 notes
from MusicGen and Stable Audio in its AI-source probe and graded every one
for pitch (../../Generative Sample Libraries/ai-source-probe/results.*.jsonl).
This script reuses those renders and grades read-only; it writes nothing there.

AKWF cycles arrive as single cycles. AI renders arrive as six-second notes
with breath, bow noise, vibrato and reverb. So this source needs one step the
AKWF branch never did: pull one clean cycle out of a held note.

For each render the grader called stable (on target or retunable):
  1. Slide an 8-period window across the grader's steady region.
  2. In each window, resample every period to 2048 samples at the grader's
     measured pitch (fractional period, so no drift from rounding) and
     average them. Averaging keeps what repeats (the timbre) and cancels
     what doesn't (noise, bow scrape, reverb tail).
  3. Score the window by CLEANNESS = energy of the averaged cycle / average
     energy of the single periods. 1.0 = every period identical; noise and
     pitch wobble pull it down. Keep the cleanest window.
  4. Octave check: if only every 2nd (3rd ... 6th) harmonic sounds, the
     tracker read an octave (or a twelfth) low and the window holds several
     periods; fold it to one.
  5. UPPER FIDELITY: the same ratio over harmonics 2-32 only. The grader's
     pitch is a median over the whole note; a few cents off is nothing to the
     ear but smears the overtones out of an 8-period average. So the period
     is refined per note (+-30 cents) to keep the overtones.
  6. Gate: keep cycles with CLEANNESS >= GATE and UPPER FIDELITY >= FID_GATE.

    /usr/local/bin/python3 extract_ai_cycles.py [--gate 0.9]

Writes cycles.npz (frames + per-cycle record) and extract.json (census).
"""
from __future__ import annotations

import argparse
import glob
import json
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
PROBE = HERE.parent.parent / "Generative Sample Libraries" / "ai-source-probe"
N = 2048
K = 8                 # periods averaged per cycle
SKIP = ("mock", "crystal")   # test arms and the non-AI reference arm


def stable_renders():
    seen = {}
    for f in sorted(glob.glob(str(PROBE / "results.*.jsonl"))):
        if any(s in Path(f).name for s in SKIP):
            continue
        for line in open(f):
            r = json.loads(line)
            if r.get("grade") in ("on_target", "retunable") and (PROBE / r["wav"]).exists():
                seen[r["wav"]] = r          # later runs of the same file win; same audio
    return list(seen.values())


def periods(x, start, T):
    """K consecutive periods from `start`, each resampled to N points."""
    t = start + T * (np.arange(K)[:, None] + np.arange(N)[None, :] / N)
    return np.interp(t, np.arange(len(x)), x)


def upper_fidelity(P):
    """Harmonics 2-32: energy of the averaged cycle / average energy of single periods.

    The plain CLEANNESS score is dominated by the fundamental, so it cannot
    see upper harmonics being smeared away by a slightly wrong period. This
    one can: 1.0 = the overtones repeat exactly; low = they were averaged out.
    """
    H = np.fft.rfft(P, axis=1)[:, 2:33]
    coh = np.abs(H.mean(0)) ** 2
    inc = (np.abs(H) ** 2).mean(0)
    return float(coh.sum() / (inc.sum() + 1e-20))


def refine_period(x, start, T):
    """Search +-30 cents (1-cent steps) for the period that keeps the overtones."""
    best = (-1.0, T)
    for c in np.arange(-30, 31):
        Tc = T * 2 ** (c / 1200)
        P = periods(x, start, Tc)
        P = P - P.mean(axis=1, keepdims=True)
        f = upper_fidelity(P)
        if f > best[0]:
            best = (f, Tc)
    return best


def best_cycle(x, sr, hz, window):
    T = sr / hz
    a, b = int(window[0] * sr), int(window[1] * sr)
    b = min(b, len(x)) - int(T * K) - 2
    if b <= a:
        return None
    peak = np.max(np.abs(x)) + 1e-12
    best = None
    for s in np.arange(a, b, max(1, int(T * 2))):
        P = periods(x, s, T)
        P = P - P.mean(axis=1, keepdims=True)
        e_each = float((P ** 2).mean())
        if np.sqrt(e_each) < 0.05 * peak:          # too quiet: decay tail or a gap
            continue
        m = P.mean(0)
        clean = float((m ** 2).mean()) / (e_each + 1e-20)
        if best is None or clean > best[0]:
            best = (clean, m, s / sr, s)
    if best is None:
        return None
    clean0, m0, at, s0 = best
    fid0 = upper_fidelity(periods(x, s0, T) - periods(x, s0, T).mean(axis=1, keepdims=True))
    fid, Tr = refine_period(x, s0, T)
    P = periods(x, s0, Tr)
    P = P - P.mean(axis=1, keepdims=True)
    m = P.mean(0)
    clean = float((m ** 2).mean()) / (float((P ** 2).mean()) + 1e-20)
    cents = 1200 * np.log2(T / Tr)
    return clean, m, at, fid0, fid, float(cents)


def fold_octave(c):
    """If only every m-th harmonic sounds, the window holds m periods: fold to one.

    The grader's tracker can read an octave (m = 2) or a twelfth (m = 3) low.
    Then the 'cycle' holds m real periods and its spectrum has energy only at
    harmonics m, 2m, 3m... Played at the note, it would sound m times too high.
    Returns (cycle, m) with m = 1 when nothing was folded.
    """
    S = np.abs(np.fft.rfft(c))[1:97] ** 2
    h = np.arange(1, 97)
    for m in (6, 5, 4, 3, 2):
        if S[h % m != 0].sum() / (S.sum() + 1e-20) < 0.02:
            L = N // m
            seg = c[:L * m].reshape(m, L).mean(0)
            return np.interp(np.arange(N) / N * L, np.arange(L + 1), np.append(seg, seg[0])), m
    return c, 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gate", type=float, default=0.9)
    ap.add_argument("--fid-gate", type=float, default=0.5)
    args = ap.parse_args()

    recs, frames = [], []
    census = {"stable_renders": 0, "no_window": 0, "kept": 0, "rejected": 0, "folded": 0,
              "cleanness_all": []}
    for r in stable_renders():
        census["stable_renders"] += 1
        x, sr = sf.read(str(PROBE / r["wav"]), always_2d=True)
        x = x.mean(1)
        got = best_cycle(x, sr, r["measured_hz"], r.get("window_sec", [0.1, len(x) / sr - 0.3]))
        if got is None:
            census["no_window"] += 1
            continue
        clean, c, at, fid0, fid, dc = got
        census.setdefault("fidelity_before", []).append(fid0)
        census.setdefault("fidelity_after", []).append(fid)
        census.setdefault("period_shift_cents", []).append(abs(dc))
        census["cleanness_all"].append(round(clean, 3))
        if clean < args.gate or fid < args.fid_gate:
            census["rejected"] += 1
            continue
        c, folded = fold_octave(c - c.mean())
        census["folded"] += int(folded > 1)
        census.setdefault("folded_by", {}).setdefault(str(folded), 0)
        census["folded_by"][str(folded)] += 1
        census["kept"] += 1
        frames.append(c / (np.max(np.abs(c)) + 1e-12))
        recs.append({"wav": r["wav"], "arm": r["adapter"], "model": r["meta"].get("model"),
                     "instrument": r["instrument"], "asked": r["pitch"],
                     "measured_hz": r["measured_hz"], "grade": r["grade"],
                     "cleanness": round(clean, 3), "upper_fidelity": round(fid, 3),
                     "upper_fidelity_unrefined": round(fid0, 3), "period_shift_cents": round(dc, 1), "at_sec": round(at, 2), "folded_by": folded,
                     "stem": f'{r["adapter"]}_{Path(r["wav"]).stem}'})

    fb = np.array(census.pop("fidelity_before")); fa = np.array(census.pop("fidelity_after"))
    ps = np.array(census.pop("period_shift_cents"))
    qs = (0.1, 0.25, 0.5, 0.75, 0.9)
    census["upper_fidelity_at_grader_pitch"] = [round(float(np.quantile(fb, q)), 3) for q in qs]
    census["upper_fidelity_after_refine"] = [round(float(np.quantile(fa, q)), 3) for q in qs]
    census["period_shift_cents_abs"] = [round(float(np.quantile(ps, q)), 1) for q in qs]
    census["kept_at_fid_gate"] = {str(g): int((fa >= g).sum()) for g in (0.3, 0.5, 0.7, 0.8, 0.9)}
    census["fid_gate"] = args.fid_gate
    census["quantiles_are"] = list(qs)
    ca = np.array(census.pop("cleanness_all"))
    census["cleanness_quantiles"] = {q: round(float(np.quantile(ca, float(q))), 3)
                                     for q in ("0.1", "0.25", "0.5", "0.75", "0.9")}
    census["kept_at_gate"] = {str(g): int((ca >= g).sum()) for g in (0.8, 0.85, 0.9, 0.95, 0.97)}
    census["gate"] = args.gate
    by = {}
    for rc in recs:
        k = f'{rc["instrument"]}'
        by[k] = by.get(k, 0) + 1
    census["kept_by_instrument"] = by
    np.savez_compressed(HERE / "cycles.npz", frames=np.array(frames),
                        recs=np.array(json.dumps(recs)))
    (HERE / "extract.json").write_text(json.dumps(census, indent=2))
    print(json.dumps(census, indent=2))


if __name__ == "__main__":
    main()
