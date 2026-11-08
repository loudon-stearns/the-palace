#!/usr/bin/env python3
"""Was G4's failed seam (cycle 39) the loop, or the yardstick?

seam_check scores a wrap as (level spread around the wrap) minus (the take's
own wobble, 90th percentile, measured away from any wrap from 1.0 s on).
The finishing pass never touches the loop, so the spread at a wrap can only
change by a constant gain. This prints both halves of the score, before and
after finishing, so the two can be told apart.

    PY=.venvs/gsl-probe/bin/python
    $PY seam_probe.py instruments/in_range/flute_looped instruments/finished/flute G4
"""
import sys, json
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_sfz import parse_sfz, note_name
from verify import load_wav
from loop_sustain import play_looped, HOLD

def halves(path, reg):
    y, sr = load_wav(str(path))
    out, wraps = play_looped(y, sr, reg, reg["pitch_keycenter"], HOLD)
    hop, win = int(0.005 * sr), int(0.02 * sr)
    c2 = np.concatenate(([0.0], np.cumsum(out * out)))
    idx = np.arange(0, len(out) - win, hop)
    env = 10 * np.log10((c2[idx + win] - c2[idx]) / win + 1e-12)
    span = int(0.1 * sr) // hop
    spread = lambda j: float(np.ptp(env[max(0, j - span):j + span]))
    far = [j for j in range(int(1.0 * sr) // hop, len(env) - span, span)
           if all(abs(j * hop - i) > 0.15 * sr for i in wraps)]
    pre_loop = [j for j in far if j * hop < reg["loop_start"]]
    at = [spread(i // hop) for i in wraps]
    return {"spread_at_wrap_max_db": round(max(at), 2),
            "spread_at_wrap_median_db": round(float(np.median(at)), 2),
            "own_wobble_p90_db": round(float(np.percentile([spread(j) for j in far], 90)), 2),
            "far_blocks": len(far), "far_blocks_before_loop": len(pre_loop),
            "loop_start_s": round(reg["loop_start"] / sr, 2), "loop_end_s": round(reg["loop_end"] / sr, 2)}

def direct(path, reg):
    """The seam itself: level of the 50 ms just before each wrap against the
    50 ms just after, and the same jump between neighbouring 50 ms windows
    inside the loop body (away from the wrap), as the loop's own yardstick."""
    y, sr = load_wav(str(path))
    out, wraps = play_looped(y, sr, reg, reg["pitch_keycenter"], HOLD)
    w = int(0.05 * sr)
    db = lambda x: 10 * np.log10(float(np.mean(x * x)) + 1e-12)
    jumps = [abs(db(out[i - w:i]) - db(out[i:i + w])) for i in wraps if i > w and i + w < len(out)]
    s, e = reg["loop_start"], reg["loop_end"] + 1
    body = y[s:e]
    inner = [abs(db(body[j - w:j]) - db(body[j:j + w])) for j in range(2 * w, len(body) - 2 * w, w // 2)]
    return round(max(jumps), 2), round(float(np.percentile(inner, 90)) if inner else 0.0, 2)


if __name__ == "__main__":
    src, fin, want = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3:]
    rs = {note_name(r["pitch_keycenter"]): r for r in parse_sfz(next(src.glob("*.sfz")))}
    rf = {note_name(r["pitch_keycenter"]): r for r in parse_sfz(next(fin.glob("*.sfz")))}
    res = {}
    for k in want or sorted(rf):
        a = halves(src / "samples" / rs[k]["sample"], rs[k])
        b = halves(fin / "samples" / rf[k]["sample"], rf[k])
        res[k] = {"looped": a, "finished": b,
                  "score_looped": round(a["spread_at_wrap_max_db"] - a["own_wobble_p90_db"], 2),
                  "score_finished": round(b["spread_at_wrap_max_db"] - b["own_wobble_p90_db"], 2)}
    print(json.dumps(res, indent=1))
