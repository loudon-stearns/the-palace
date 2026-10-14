"""Write the Witness as two vanilla Max patchers, ready to paste into a Max Audio Effect.

    python3 build_witness_patch.py
      -> witness-A-as-specified.maxpat   (the stage-1 patch spec, corrected)
      -> witness-B-silence-keeps.maxpat  (A + a write that keeps the past through silence)

Corrections against the two older Stage 1 docs:
  * the measure clock is `phasor~ 1n @lock 1` (locked to Live's transport), not
    a hand-computed rate and not plugsync~ (whose outlet numbering the April doc guessed);
  * the read offset is `-~ 0.5` then `wrap~` at signal rate. The April doc's
    `!- 0.5` computes 0.5 - phase: the read head would run BACKWARDS (a reverse
    delay), and `!-` is a control object, not a signal one;
  * the measure length comes from `translate notevalues ms @listen 1`, so the
    write index and wave~'s end point follow tempo changes.

UNVERIFIED: written without Max open. Max recomputes inlet/outlet counts on load.
"""
import json
from pathlib import Path

HERE = Path(__file__).parent


class Patch:
    def __init__(self):
        self.boxes, self.lines = [], []

    def obj(self, oid, text, x, y, w=None, cls="newobj", **extra):
        box = {"id": oid, "maxclass": cls, "patching_rect": [x, y, w or max(60, 7 * len(text) + 16), 22.0]}
        if cls in ("newobj", "message", "comment"):
            box["text"] = text
        box.update(extra)
        self.boxes.append({"box": box})
        return oid

    def wire(self, src, so, dst, di):
        self.lines.append({"patchline": {"source": [src, so], "destination": [dst, di]}})

    def dump(self, path, title):
        doc = {"patcher": {
            "fileversion": 1,
            "appversion": {"major": 9, "minor": 0, "revision": 0, "architecture": "x64", "modernui": 1},
            "classnamespace": "box", "rect": [60.0, 80.0, 1040.0, 640.0],
            "openinpresentation": 0, "default_fontname": "Arial", "default_fontsize": 12.0,
            "gridsize": [15.0, 15.0], "boxes": self.boxes, "lines": self.lines,
            "description": title,
        }}
        path.write_text(json.dumps(doc, indent=2))


def build(silence_keeps):
    p = Patch()
    title = ("Retrospective Delay — the Witness (B: silence keeps the past)" if silence_keeps
             else "Retrospective Delay — the Witness (A: as specified)")
    p.obj("title", title, 20, 10, 700, cls="comment", fontsize=16.0)
    p.obj("note", "Paste into a Max Audio Effect in Live, start the transport, play. Gain knob = the conduit.",
          20, 36, 700, cls="comment")

    # the witness: one buffer, sized for a 4/4 measure down to 60 BPM
    p.obj("buf", "buffer~ ret-witness 4000 1", 760, 80)

    # measure length, following tempo
    p.obj("lb", "loadbang", 420, 80)
    p.obj("one", "1n", 420, 110, 40, cls="message")
    p.obj("tr", "translate notevalues ms @listen 1", 420, 140)
    p.obj("m2s", "mstosamps", 420, 175)
    p.wire("lb", 0, "one", 0); p.wire("one", 0, "tr", 0); p.wire("tr", 0, "m2s", 0)

    # audio in, measure clock
    p.obj("in", "plugin~", 20, 80)
    p.obj("clk", "phasor~ 1n @lock 1", 200, 80)

    # write head
    p.obj("widx", "*~ 96000.", 200, 215)
    p.wire("clk", 0, "widx", 0); p.wire("m2s", 0, "widx", 1)
    p.obj("poke", "poke~ ret-witness 1", 20, 330)
    p.wire("widx", 0, "poke", 1)

    if silence_keeps:
        # gate: is anyone playing? fast attack, ~100 ms release (48 kHz)
        p.obj("abs", "abs~", 20, 120)
        p.obj("env", "slide~ 1 4800", 20, 150)
        p.obj("gate", ">~ 0.003", 20, 180)
        p.wire("in", 0, "abs", 0); p.wire("abs", 0, "env", 0); p.wire("env", 0, "gate", 0)
        # what the witness already holds at the write position
        p.obj("old", "index~ ret-witness", 200, 250)
        p.wire("widx", 0, "old", 0)
        # write = old + gate * (in - old)
        p.obj("diff", "-~", 20, 250)
        p.wire("in", 0, "diff", 0); p.wire("old", 0, "diff", 1)
        p.obj("gated", "*~", 20, 280)
        p.wire("diff", 0, "gated", 0); p.wire("gate", 0, "gated", 1)
        p.obj("wsum", "+~", 20, 305, 40)
        p.wire("gated", 0, "wsum", 0); p.wire("old", 0, "wsum", 1)
        p.wire("wsum", 0, "poke", 0)
        p.obj("cB", "In silence the witness writes down what it already holds: the last measure stays and keeps coming back.",
              200, 290, 560, cls="comment")
    else:
        p.wire("in", 0, "poke", 0)

    # read head: half a measure behind, wrapped, played through wave~ (start 0, end = measure ms)
    p.obj("lag", "-~ 0.5", 600, 215)
    p.obj("wrap", "wrap~", 600, 245)
    p.obj("wave", "wave~ ret-witness", 600, 330)
    p.wire("clk", 0, "lag", 0); p.wire("lag", 0, "wrap", 0); p.wire("wrap", 0, "wave", 0)
    p.wire("tr", 0, "wave", 2)

    # the conduit
    p.obj("dial", "", 820, 300, 44, cls="live.dial", varname="gain", parameter_enable=1,
          saved_attribute_attributes={"valueof": {
              "parameter_longname": "gain", "parameter_shortname": "gain", "parameter_type": 0,
              "parameter_mmin": 0.0, "parameter_mmax": 1.0, "parameter_initial_enable": 1,
              "parameter_initial": [0.0], "parameter_unitstyle": 1}})
    p.obj("pk", "pack f 20", 820, 370)
    p.obj("ramp", "line~", 820, 400)
    p.wire("dial", 0, "pk", 0); p.wire("pk", 0, "ramp", 0)
    p.obj("vca", "*~", 600, 430, 40)
    p.wire("wave", 0, "vca", 0); p.wire("ramp", 0, "vca", 1)

    # dry + ghost, mono to both sides
    p.obj("mix", "+~", 20, 480, 40)
    p.wire("in", 0, "mix", 0); p.wire("vca", 0, "mix", 1)
    p.obj("out", "plugout~", 20, 530)
    p.wire("mix", 0, "out", 0); p.wire("mix", 0, "out", 1)

    name = "witness-B-silence-keeps.maxpat" if silence_keeps else "witness-A-as-specified.maxpat"
    p.dump(HERE / name, title)
    return name


if __name__ == "__main__":
    for keeps in (False, True):
        print("wrote", build(keeps))
