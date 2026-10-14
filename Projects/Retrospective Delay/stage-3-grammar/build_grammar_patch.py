"""Write the Grammar as a Max patcher: the séance's controls around one gen~ object.

    python3 build_grammar_patch.py   ->  grammar.maxpat

Everything that was forty vanilla objects in ../stage-2-seance/seance.maxpat now
lives in seance.genexpr, embedded here in a gen~ codebox. What stays outside is
only what has to: the audio in and out, Live's transport (phasor~ 1n @lock 1),
the measure length (translate -> mstosamps), and the two controls, which now
send Param messages (gain, lag, measure) instead of driving signal chains.

The whole note is sent as exactly 1. — gen~ runs its lines in order, so the
read before the write hears one measure ago. See grammar_model.py, order test.

UNVERIFIED: written without Max open. The gen~ sub-patcher format (codebox +
in/out boxes inside a dsp.gen patcher) is written from memory of saved files;
if it doesn't load, make a gen~, double-click, add a codebox, paste
seance.genexpr, and wire in 1, in 2 -> codebox -> out 1, out 2.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "stage-1" / "witness"))
sys.path.insert(0, str(HERE.parent / "stage-2-seance"))
from build_witness_patch import Patch  # noqa: E402
from build_seance_patch import live_param  # noqa: E402

APPV = {"major": 9, "minor": 0, "revision": 0, "architecture": "x64", "modernui": 1}


def gen_patcher(code):
    def box(i, cls, rect, **kw):
        b = {"id": i, "maxclass": cls, "patching_rect": rect}
        b.update(kw)
        return {"box": b}
    boxes = [
        box("in1", "newobj", [20.0, 20.0, 40.0, 22.0], text="in 1", numinlets=0, numoutlets=1, outlettype=[""]),
        box("in2", "newobj", [200.0, 20.0, 40.0, 22.0], text="in 2", numinlets=0, numoutlets=1, outlettype=[""]),
        box("code", "codebox", [20.0, 60.0, 620.0, 640.0], code=code, fontface=0, fontname="<Monospaced>",
            fontsize=12.0, numinlets=2, numoutlets=2, outlettype=["", ""]),
        box("out1", "newobj", [20.0, 720.0, 45.0, 22.0], text="out 1", numinlets=1, numoutlets=0),
        box("out2", "newobj", [200.0, 720.0, 45.0, 22.0], text="out 2", numinlets=1, numoutlets=0),
    ]
    line = lambda s, so, d, di: {"patchline": {"source": [s, so], "destination": [d, di]}}
    lines = [line("in1", 0, "code", 0), line("in2", 0, "code", 1),
             line("code", 0, "out1", 0), line("code", 1, "out2", 0)]
    return {"fileversion": 1, "appversion": APPV, "classnamespace": "dsp.gen",
            "rect": [100.0, 100.0, 700.0, 780.0], "boxes": boxes, "lines": lines}


def build():
    code = (HERE / "seance.genexpr").read_text()
    p = Patch()
    p.obj("title", "Retrospective Delay — the Grammar (gen~)", 20, 10, 700, cls="comment", fontsize=16.0)
    p.obj("note", "The séance, rewritten as one sample's worth of thought. Double-click gen~ to read it. "
          "The whole note is exactly 1 now.", 20, 36, 900, cls="comment")

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
          presentation=1, presentation_rect=[70.0, 12.0, 110.0, 20.0],
          saved_attribute_attributes=live_param("lag", 2, 1, parameter_enum=["1/4", "1/2", "1/1"],
                                                parameter_mmax=2))
    p.obj("sel", "sel 0 1 2", 760, 110)
    p.wire("tab", 0, "sel", 0)
    for i, (oid, txt, x) in enumerate((("q", "lag 0.25", 760), ("h", "lag 0.5", 830), ("w", "lag 1.", 890))):
        p.obj(oid, txt, x, 140, 60, cls="message")
        p.wire("sel", i, oid, 0)

    p.obj("gen", "gen~", 20, 260, 420, numinlets=2, numoutlets=2, outlettype=["signal", "signal"],
          patcher=gen_patcher(code))
    p.wire("in", 0, "gen", 0); p.wire("clk", 0, "gen", 1)
    for m in ("mmsg", "gmsg", "q", "h", "w"):
        p.wire(m, 0, "gen", 0)
    p.obj("cGen", "inside: read the tape first, then write it. That order is the whole lesson.",
          20, 290, 420, cls="comment")

    p.obj("out", "plugout~", 20, 340)
    p.wire("gen", 0, "out", 0); p.wire("gen", 0, "out", 1)

    out = HERE / "grammar.maxpat"
    p.dump(out, "Retrospective Delay — the Grammar")
    doc = json.loads(out.read_text())
    doc["patcher"]["openinpresentation"] = 1
    out.write_text(json.dumps(doc, indent=2))
    return out.name


if __name__ == "__main__":
    print("wrote", build())
