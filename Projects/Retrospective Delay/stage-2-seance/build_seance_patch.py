"""Write the Seance as a vanilla Max patcher, ready to paste into a Max Audio Effect.

    python3 build_seance_patch.py   ->  seance.maxpat

The seance is the witness (version B, "silence keeps") made performable:
  * gain knob, ramped by line~, on the READ side — down hides the past, it doesn't erase it;
  * lag choice (live.tab: 1/4, 1/2, 1/1 of a measure) switched by two read heads that
    crossfade over 30 ms — set the idle head, then fade to it (no click, no pitch glide);
  * the seam crossfade: slide~ 480 480 on the listen/hold gate. The seam is not at the
    measure line (the read head never jumps there); it is where the witness stopped
    listening, and smoothing the gate crossfades exactly that spot.

The whole-note lag is sent as 0.999, not 1.0: at exactly 1.0 the read head sits on the
write head, and vanilla Max doesn't promise whether poke~ or wave~ runs first inside a
signal vector, so you might hear "now" instead of "one measure ago". Gen~ (the third
move) makes that order explicit — a good thing to point at when you get there.

Mirrors seance_model.py, which renders what this patch should sound like.
UNVERIFIED: written without Max open. Max recomputes inlet/outlet counts on load.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "stage-1" / "witness"))
from build_witness_patch import Patch  # noqa: E402


def live_param(longname, ptype, initial, **more):
    v = {"parameter_longname": longname, "parameter_shortname": longname, "parameter_type": ptype,
         "parameter_initial_enable": 1, "parameter_initial": [initial]}
    v.update(more)
    return {"valueof": v}


def build():
    p = Patch()
    p.obj("title", "Retrospective Delay — the Seance", 20, 10, 700, cls="comment", fontsize=16.0)
    p.obj("note", "Paste into a Max Audio Effect in Live, start the transport. Play, stop, and turn the knob: "
          "silence is the gesture that summons.", 20, 36, 900, cls="comment")

    p.obj("buf", "buffer~ ret-seance 4000 1", 900, 80)

    # measure length, following tempo
    p.obj("lb", "loadbang", 420, 80)
    p.obj("one", "1n", 420, 110, 40, cls="message")
    p.obj("tr", "translate notevalues ms @listen 1", 420, 140)
    p.obj("m2s", "mstosamps", 420, 175)
    p.wire("lb", 0, "one", 0); p.wire("one", 0, "tr", 0); p.wire("tr", 0, "m2s", 0)

    p.obj("in", "plugin~", 20, 80)
    p.obj("clk", "phasor~ 1n @lock 1", 200, 80)
    p.obj("widx", "*~ 96000.", 200, 215)
    p.wire("clk", 0, "widx", 0); p.wire("m2s", 0, "widx", 1)

    # listen or hold: the witness from the first move, version B, with a smoothed gate
    p.obj("abs", "abs~", 20, 120)
    p.obj("env", "slide~ 1 4800", 20, 150)
    p.obj("gate", ">~ 0.003", 20, 180)
    p.obj("seam", "slide~ 480 480", 20, 210)
    p.wire("in", 0, "abs", 0); p.wire("abs", 0, "env", 0); p.wire("env", 0, "gate", 0)
    p.wire("gate", 0, "seam", 0)
    p.obj("cSeam", "the seam crossfade: ~10 ms between listening and holding. The seam lives where you stopped playing, "
          "not at the measure line.", 200, 140, 200, cls="comment")
    p.obj("old", "index~ ret-seance", 200, 250)
    p.wire("widx", 0, "old", 0)
    p.obj("diff", "-~", 20, 250)
    p.wire("in", 0, "diff", 0); p.wire("old", 0, "diff", 1)
    p.obj("gated", "*~", 20, 280)
    p.wire("diff", 0, "gated", 0); p.wire("seam", 0, "gated", 1)
    p.obj("wsum", "+~", 20, 305, 40)
    p.wire("gated", 0, "wsum", 0); p.wire("old", 0, "wsum", 1)
    p.obj("poke", "poke~ ret-seance 1", 20, 340)
    p.wire("wsum", 0, "poke", 0); p.wire("widx", 0, "poke", 1)

    # lag choice -> fraction of a measure
    p.obj("tab", "", 640, 80, 120, cls="live.tab", varname="lag", parameter_enable=1,
          num_lines_patching=1, num_lines_presentation=1,
          presentation=1, presentation_rect=[70.0, 12.0, 110.0, 20.0],
          saved_attribute_attributes=live_param("lag", 2, 1, parameter_enum=["1/4", "1/2", "1/1"],
                                                parameter_mmax=2))
    p.obj("sel", "sel 0 1 2", 640, 110)
    p.obj("q", "0.25", 640, 140, 40, cls="message")
    p.obj("h", "0.5", 690, 140, 40, cls="message")
    p.obj("w", "0.999", 740, 140, 50, cls="message")
    p.wire("tab", 0, "sel", 0)
    p.wire("sel", 0, "q", 0); p.wire("sel", 1, "h", 0); p.wire("sel", 2, "w", 0)

    # two heads: set the idle one, then crossfade to it
    p.obj("tbfb", "t b f b", 640, 175)
    for m in ("q", "h", "w"):
        p.wire(m, 0, "tbfb", 0)
    p.obj("ctr", "counter 0 1", 760, 205)
    p.wire("tbfb", 2, "ctr", 0)
    p.obj("tii", "t i i", 760, 235)
    p.wire("ctr", 0, "tii", 0)
    p.obj("plus1", "+ 1", 800, 265, 40)
    p.wire("tii", 1, "plus1", 0)
    p.obj("route", "gate 2", 700, 295)
    p.wire("plus1", 0, "route", 0)
    p.wire("tbfb", 1, "route", 1)
    p.obj("held", "i", 640, 265, 40)
    p.wire("tii", 0, "held", 1)
    p.wire("tbfb", 0, "held", 0)
    p.obj("xpk", "pack f 30", 640, 330)
    p.obj("xramp", "line~", 640, 360)
    p.wire("held", 0, "xpk", 0); p.wire("xpk", 0, "xramp", 0)
    p.obj("cHeads", "two read heads: the idle one jumps to the new lag, then a 30 ms fade hands over to it",
          820, 330, 260, cls="comment")

    # head A and head B
    for k, x0, outlet in (("A", 420, 0), ("B", 530, 1)):
        p.obj(f"lag{k}", "-~ 0.5", x0, 400)
        p.obj(f"wrap{k}", "wrap~", x0, 430)
        p.obj(f"wave{k}", "wave~ ret-seance", x0, 460)
        p.wire("clk", 0, f"lag{k}", 0); p.wire(f"lag{k}", 0, f"wrap{k}", 0); p.wire(f"wrap{k}", 0, f"wave{k}", 0)
        p.wire("tr", 0, f"wave{k}", 2)
        p.wire("route", outlet, f"lag{k}", 1)
    p.obj("inv", "!-~ 1", 640, 400)
    p.wire("xramp", 0, "inv", 0)
    p.obj("vA", "*~", 420, 495, 40)
    p.obj("vB", "*~", 530, 495, 40)
    p.wire("waveA", 0, "vA", 0); p.wire("inv", 0, "vA", 1)
    p.wire("waveB", 0, "vB", 0); p.wire("xramp", 0, "vB", 1)
    p.obj("heads", "+~", 420, 525, 40)
    p.wire("vA", 0, "heads", 0); p.wire("vB", 0, "heads", 1)

    # the conduit: on the read side, so turning it down hides the past without erasing it
    p.obj("dial", "", 900, 400, 44, cls="live.dial", varname="gain", parameter_enable=1,
          presentation=1, presentation_rect=[12.0, 6.0, 44.0, 48.0],
          saved_attribute_attributes=live_param("gain", 0, 0.0, parameter_mmin=0.0, parameter_mmax=1.0,
                                                parameter_unitstyle=1))
    p.obj("pk", "pack f 20", 900, 460)
    p.obj("ramp", "line~", 900, 490)
    p.wire("dial", 0, "pk", 0); p.wire("pk", 0, "ramp", 0)
    p.obj("vca", "*~", 420, 560, 40)
    p.wire("heads", 0, "vca", 0); p.wire("ramp", 0, "vca", 1)

    p.obj("mix", "+~", 20, 600, 40)
    p.wire("in", 0, "mix", 0); p.wire("vca", 0, "mix", 1)
    p.obj("out", "plugout~", 20, 640)
    p.wire("mix", 0, "out", 0); p.wire("mix", 0, "out", 1)

    out = HERE / "seance.maxpat"
    p.dump(out, "Retrospective Delay — the Seance")
    doc = json.loads(out.read_text())
    doc["patcher"]["openinpresentation"] = 1
    doc["patcher"]["rect"] = [60.0, 80.0, 1120.0, 700.0]
    out.write_text(json.dumps(doc, indent=2))
    return out.name


if __name__ == "__main__":
    print("wrote", build())
