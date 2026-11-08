#!/usr/bin/env python3
"""Re-run seam_check (as fixed in cycle 40: the yardstick is the loop's own
wobble, and the seam's own level jump is reported) on built instruments, and
set its verdicts beside the ones their finishing.json / loopcheck.json recorded.
Reads only; writes seam_recheck.json beside this script.

    PY=.venvs/gsl-probe/bin/python
    $PY seam_recheck.py instruments/in_range/flute_looped instruments/finished/flute ...
"""
import sys, json
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_sfz import parse_sfz, note_name
from verify import load_wav
from loop_sustain import seam_check

acc = json.loads((HERE / "matrix.json").read_text())["acceptance"]
res = {}
for d in map(Path, sys.argv[1:]):
    rec = d / "finishing.json" if (d / "finishing.json").exists() else d / "loopcheck.json"
    old = {x.get("key") or note_name(x["pitch_keycenter"]): x
           for x in json.loads(rec.read_text())["samples_detail"]} if rec.exists() else {}
    rows = []
    for r in parse_sfz(next(d.glob("*.sfz"))):
        k = note_name(r["pitch_keycenter"])
        y, sr = load_wav(str(d / "samples" / r["sample"]))
        c = seam_check(y, sr, r, acc)
        o = old.get(k, {})
        rows.append({"key": k, "step_was_db": o.get("worst_level_step_db"), "ok_was": o.get("seam_ok"),
                     "step_now_db": c["worst_level_step_db"], "jump_excess_db": c["seam_jump_excess_db"],
                     "click_db": c["worst_click_db"], "hold": c["hold_grade"], "ok_now": c["seam_ok"]})
    res[str(d)] = {"keys": len(rows), "clean_was": sum(bool(x["ok_was"]) for x in rows),
                   "clean_now": sum(x["ok_now"] for x in rows),
                   "worst_step_now": max(rows, key=lambda x: x["step_now_db"]),
                   "worst_jump": max(rows, key=lambda x: x["jump_excess_db"]),
                   "rows": rows}
(HERE / "seam_recheck.json").write_text(json.dumps(res, indent=1) + "\n")
for d, v in res.items():
    print(f"{d}: clean {v['clean_was']}→{v['clean_now']}/{v['keys']}  worst step {v['worst_step_now']['key']} "
          f"{v['worst_step_now']['step_now_db']} dB  worst jump {v['worst_jump']['key']} {v['worst_jump']['jump_excess_db']} dB  "
          f"changed: {[x['key'] for x in v['rows'] if bool(x['ok_was']) != x['ok_now']]}")
