"""make_visualizer.py — writes ui/visualizer.js from ui/visualizer.template.js and the
sketch's own tables, so the screen redraws the line from the numbers the engine plays.
Rerun it after the trajectory library or the sketch's tables change.

    python3 ui/make_visualizer.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "reference"))
import sketch as S  # noqa: E402


def nums(a, places):
    out = []
    for x in a.ravel():
        r = round(float(x), places)
        s = f"{r:.{places}f}".rstrip("0").rstrip(".")
        out.append("0" if s in ("", "-0") else s)
    return "[" + ",".join(out) + "]"


data = (
    "const BL_DATA = {\n"
    f"  names: {json.dumps(['Piano A2', 'Piano A4', 'Piano C6', 'Bell', 'Vibraphone', 'Marimba', 'Singing bowl'])},\n"
    f"  cents: {nums(S.CENTS, 1)},\n"
    f"  own: {nums(S.OWN, 3)},\n"
    f"  mask: {nums(S.MASK, 0)},\n"
    f"  times: {nums(S.TIMES, 4)},\n"
    f"  organ: {nums(S.ORGAN, 4)},\n"
    "};\n"
)
src = (HERE / "visualizer.template.js").read_text()
out = src.replace("/*@DATA@*/", data)
(HERE / "visualizer.js").write_text(out)
print(f"ui/visualizer.js: {len(out) / 1024:.0f} KB")
