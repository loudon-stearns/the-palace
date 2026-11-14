"""run_reshape_test.py — the modification test: real presets x directions, each rendered
before and after and checked against its promise. Writes reshaped/reshape-test.json.

    ~/.venvs/palace-vital/bin/python run_reshape_test.py
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import pedalboard, vital_host as vh, reshape_vital as rv
V = os.path.expanduser("~/Music/Vital")
CASES = [
    (V + "/Navi Retlav Studio/Presets/Pack 2/Pad Of Exile.vital", "darker"),
    (V + "/Navi Retlav Studio/Presets/Pack 2/Pad Of Exile.vital", "menacing"),
    (V + "/Navi Retlav Studio/Presets/Pack 2/Pad Of Exile.vital", "darker and more menacing"),
    (V + "/inktome/Presets/Sparkly pad.vital", "darker"),
    (V + "/inktome/Presets/Sparkly pad.vital", "breathe"),
    (V + "/Billain/Presets/Pack 1/Stringpad 1.vital", "darker"),
    (V + "/Billain/Presets/Pack 1/Stringpad 1.vital", "strip"),
    (HERE + "/generated/light-through-deep-water/Caustics.vital", "brighter"),
    (HERE + "/generated/light-through-deep-water/Pressure.vital", "breathe"),
]
p = pedalboard.load_plugin(vh.VST)
rows = []
for path, d in CASES:
    fn, side = rv.reshape(p, path, d, os.path.join(HERE, "reshaped"))
    b, a = side["before"], side["after"]
    for m, k in side["promises"].items():
        rows.append({"preset": os.path.basename(path)[:-6], "direction": d, "move": m, "promise": k["promise"],
                     "kept": k["kept"], "before": b, "after": a, "changes": side["changes"]})
        print("%-14s %-26s %-9s %-6s  bright %5.0f->%5.0f  low %.3f->%.3f  crest %.1f->%.1f  motion %.3f->%.3f"
              "  swing %.1f->%.1f  rise %.2f->%.2f  width %.2f->%.2f" % (
            os.path.basename(path)[:-6][:14], d, m, "KEPT" if k["kept"] else "BROKEN", b["centroid_hz"], a["centroid_hz"],
            b["low_share"], a["low_share"], b["crest_db"], a["crest_db"], b["motion"], a["motion"],
            b["level_swing_db"], a["level_swing_db"], b["rise_s"], a["rise_s"], b["width"], a["width"]))
json.dump(rows, open(os.path.join(HERE, "reshaped", "reshape-test.json"), "w"), indent=1)
print("kept %d of %d" % (sum(r["kept"] for r in rows), len(rows)))
