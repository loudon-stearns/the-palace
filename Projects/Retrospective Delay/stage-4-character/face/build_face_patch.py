"""Write the Face as a Max patcher: the grammar's gen~ device with the cat on top.

    python3 build_face_patch.py   ->  face.maxpat

Same device as ../../stage-3-grammar/grammar.maxpat, two changes:
  * the gen~ runs face.genexpr, which is seance.genexpr plus three outlets
    (out3 the knob as heard, out4 what's on the tape, out5 whether it's holding);
  * those three are sampled 30 times a second (snapshot~ 33) and sent to a jsui
    running ../jsui/seance-cat.js, which sits in the device's face beside the knob.

The cat is driven by what the gen~ is doing, never by the dial directly.

UNVERIFIED: written without Max open. Same gen~ caveat as the grammar patch.
The jsui needs seance-cat.js and the three pose-*.png plates on Max's search
path: put face.maxpat's folder and ../jsui in Options > File Preferences, or,
once saved as a Max Audio Effect, add all four files to the device's project
and freeze it.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "stage-1" / "witness"))
sys.path.insert(0, str(ROOT / "stage-2-seance"))
sys.path.insert(0, str(ROOT / "stage-3-grammar"))
from build_witness_patch import Patch  # noqa: E402
from build_seance_patch import live_param  # noqa: E402
from build_grammar_patch import APPV  # noqa: E402

N_OUT = 5


def gen_patcher(code):
    def box(i, cls, rect, **kw):
        b = {"id": i, "maxclass": cls, "patching_rect": rect}
        b.update(kw)
        return {"box": b}
    boxes = [
        box("in1", "newobj", [20.0, 20.0, 40.0, 22.0], text="in 1", numinlets=0, numoutlets=1, outlettype=[""]),
        box("in2", "newobj", [200.0, 20.0, 40.0, 22.0], text="in 2", numinlets=0, numoutlets=1, outlettype=[""]),
        box("code", "codebox", [20.0, 60.0, 620.0, 760.0], code=code, fontface=0, fontname="<Monospaced>",
            fontsize=12.0, numinlets=2, numoutlets=N_OUT, outlettype=[""] * N_OUT),
    ]
    lines = [{"patchline": {"source": ["in1", 0], "destination": ["code", 0]}},
             {"patchline": {"source": ["in2", 0], "destination": ["code", 1]}}]
    for k in range(N_OUT):
        boxes.append(box(f"out{k + 1}", "newobj", [20.0 + 130 * k, 840.0, 45.0, 22.0], text=f"out {k + 1}",
                         numinlets=1, numoutlets=0))
        lines.append({"patchline": {"source": ["code", k], "destination": [f"out{k + 1}", 0]}})
    return {"fileversion": 1, "appversion": APPV, "classnamespace": "dsp.gen",
            "rect": [100.0, 100.0, 700.0, 900.0], "boxes": boxes, "lines": lines}


def build():
    code = (HERE / "face.genexpr").read_text()
    p = Patch()
    p.obj("title", "Retrospective Delay — the Face", 20, 10, 700, cls="comment", fontsize=16.0)
    p.obj("note", "The cat watches the instrument, not the knob: pose = gain as heard, ectoplasm = what's on "
          "the tape, candle = the tape is holding.", 20, 36, 900, cls="comment")

    p.obj("in", "plugin~", 20, 80)
    p.obj("clk", "phasor~ 1n @lock 1", 200, 80)

    p.obj("lb", "loadbang", 420, 80)
    p.obj("one", "1n", 420, 110, 40, cls="message")
    p.obj("tr", "translate notevalues ms @listen 1", 420, 140)
    p.obj("m2s", "mstosamps", 420, 175)
    p.obj("mmsg", "measure $1", 420, 205, 80, cls="message")
    p.wire("lb", 0, "one", 0); p.wire("one", 0, "tr", 0); p.wire("tr", 0, "m2s", 0); p.wire("m2s", 0, "mmsg", 0)

    p.obj("dial", "", 640, 80, 44, cls="live.dial", varname="gain", parameter_enable=1,
          presentation=1, presentation_rect=[12.0, 6.0, 44.0, 48.0],
          saved_attribute_attributes=live_param("gain", 0, 0.0, parameter_mmin=0.0, parameter_mmax=1.0,
                                                parameter_unitstyle=1))
    p.obj("gmsg", "gain $1", 640, 205, 60, cls="message")
    p.wire("dial", 0, "gmsg", 0)

    p.obj("tab", "", 760, 80, 120, cls="live.tab", varname="lag", parameter_enable=1,
          num_lines_patching=1, num_lines_presentation=1,
          presentation=1, presentation_rect=[12.0, 62.0, 110.0, 20.0],
          saved_attribute_attributes=live_param("lag", 2, 1, parameter_enum=["1/4", "1/2", "1/1"],
                                                parameter_mmax=2))
    p.obj("sel", "sel 0 1 2", 760, 110)
    p.wire("tab", 0, "sel", 0)
    for i, (oid, txt, x) in enumerate((("q", "lag 0.25", 760), ("h", "lag 0.5", 830), ("w", "lag 1.", 890))):
        p.obj(oid, txt, x, 140, 60, cls="message")
        p.wire("sel", i, oid, 0)

    p.obj("gen", "gen~", 20, 260, 560, numinlets=2, numoutlets=N_OUT, outlettype=["signal"] * N_OUT,
          patcher=gen_patcher(code))
    p.wire("in", 0, "gen", 0); p.wire("clk", 0, "gen", 1)
    for m in ("mmsg", "gmsg", "q", "h", "w"):
        p.wire(m, 0, "gen", 0)

    p.obj("out", "plugout~", 20, 340)
    p.wire("gen", 0, "out", 0); p.wire("gen", 0, "out", 1)

    # the face: three facts, sampled at 30 fps
    p.obj("s3", "snapshot~ 33", 280, 300)
    p.obj("s4", "snapshot~ 33", 400, 300)
    p.obj("s5", "snapshot~ 33", 520, 300)
    p.wire("gen", 2, "s3", 0); p.wire("gen", 3, "s4", 0); p.wire("gen", 4, "s5", 0)
    p.obj("pg", "prepend set_gain", 280, 335)
    p.obj("pp", "prepend presence", 400, 335)
    p.obj("ph", "prepend holding", 520, 335)
    p.wire("s3", 0, "pg", 0); p.wire("s4", 0, "pp", 0); p.wire("s5", 0, "ph", 0)
    p.obj("cat", "", 280, 380, 240, cls="jsui", filename="seance-cat.js", numinlets=1, numoutlets=1,
          outlettype=[""], presentation=1, presentation_rect=[132.0, 0.0, 169.0, 169.0])
    p.boxes[-1]["box"]["patching_rect"] = [280.0, 380.0, 240.0, 240.0]
    for m in ("pg", "pp", "ph"):
        p.wire(m, 0, "cat", 0)
    p.obj("cCat", "the cat never sees the dial: only what the gen~ reports", 20, 380, 240, cls="comment")

    out = HERE / "face.maxpat"
    p.dump(out, "Retrospective Delay — the Face")
    doc = json.loads(out.read_text())
    doc["patcher"]["openinpresentation"] = 1
    out.write_text(json.dumps(doc, indent=2))
    return out.name


if __name__ == "__main__":
    print("wrote", build())
