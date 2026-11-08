#!/usr/bin/env python3
"""Every key of a finished instrument, scored two ways: seam_check's score
(wrap spread less the whole take's wobble) and the direct seam jump (the 50 ms
either side of each wrap) against the loop body's own 50 ms jumps.

    $PY seam_table.py instruments/finished/flute instruments/finished/flute_r1 ...
"""
import sys, json
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_sfz import parse_sfz, note_name
from seam_probe import halves, direct

rows = {}
for d in map(Path, sys.argv[1:]):
    fin = json.loads((d / "finishing.json").read_text())
    by = {x["key"]: x for x in fin["samples_detail"]}
    out = []
    for r in parse_sfz(next(d.glob("*.sfz"))):
        k = note_name(r["pitch_keycenter"])
        h = halves(d / "samples" / r["sample"], r)
        jump, own = direct(d / "samples" / r["sample"], r)
        out.append({"key": k, "old_score_db": by[k]["worst_level_step_db"], "old_ok": by[k]["seam_ok"],
                    "wobble_yardstick_db": h["own_wobble_p90_db"],
                    "wobble_blocks_before_loop": h["far_blocks_before_loop"],
                    "seam_jump_db": jump, "loop_own_jump_p90_db": own,
                    "seam_excess_db": round(jump - own, 2)})
    rows[str(d)] = out
print(json.dumps(rows, indent=1))
