#!/usr/bin/env python3
"""
make_poly_patch.py — the polyphonic crystal as a Max patch and a Max for Live
instrument, both from crystal-voice.codebox.

Inside rnbo~ (same in both files):

  [param crystal 0 @min 0 @max 8] -> [sig~ 0]    --+
  [param attack 80 ...]           -> [sig~ 80]   --+-> [p @polyphony 8 @title voice] -> [*~ 0.3] -> [*~ 0.5] -> [out~ 1] [out~ 2]
  [param decay / release / rolloff] -> [sig~]    --+                                                 ^
  [param level 0.5 ...] ------------------------------------------------------------------------------+ (right inlet)

  inside the voice (8 copies, RNBO's MIDI voice allocation):
  [notein] -> [mtof] -> [sig~] -> codebox in1 ; velocity -> [/ 127.] -> [sig~] -> in2
  [in~ 1..5] -> codebox in3..in7 ; codebox out1 -> [out~ 1] ; out2 -> [edge~] -> [voice] (mute)

The controls sit OUTSIDE the voices, so the export has one knob per control
with a plain name ("crystal", not "poly/voice/crystal").

  crystal-poly.maxpat              open in Max 9: kslider/MIDI keyboard -> rnbo~ MIDI inlet,
                                   a nine-crystal menu, five number boxes, ezdac~.
  Crystal Synthesizer 0.1.amxd     Max for Live INSTRUMENT ('iiii' header, read off Live 12's
                                   own Max Instrument.amxd): midiin -> rnbo~ -> plugout~,
                                   a live.menu for the crystal and five live.dials.

Box formats from ../playable-crystal/make_patch.py, Blood Compressor's make_patch.py, and
the RNBO Synth Building Blocks example sbb.additive.maxpat (kslider -> pack -> midiformat
-> rnbo~ right inlet; notein has 4 outlets in RNBO). UNVERIFIED until opened in Max.
"""
import json, struct, pathlib

here = pathlib.Path(__file__).parent
CODE = (here / "crystal-voice.codebox").read_text()
APPV = {"major": 9, "minor": 0, "revision": 0, "architecture": "x64", "modernui": 1}
CRYSTALS = ["Diamond", "Fluorite", "Tetragonal (hyp.)", "Emerald", "Ruby", "Amethyst", "Topaz",
            "Monoclinic (hyp.)", "Labradorite"]
# name, default, min, max, unit, live unitstyle (1 float, 2 ms, 3 Hz?, use 1/2)
VOICE_PARAMS = [("crystal", 0.0, 0.0, 8.0, ""), ("attack", 80.0, 1.0, 500.0, "ms"),
                ("decay", 5.5, 0.1, 20.0, "s"), ("release", 0.4, 0.01, 10.0, "s"),
                ("rolloff", 0.7, 0.3, 1.0, "")]
LEVEL = ("level", 0.5, 0.0, 1.0, "")
MIX = 0.3


def box(id_, x, y, w, text=None, h=22.0, **kw):
    b = {"id": id_, "patching_rect": [float(x), float(y), float(w), h], "fontsize": 12.0}
    if text is not None:
        b.update(maxclass="newobj", text=text)
    b.update(kw)
    return {"box": b}


def rbox(id_, x, y, w, text, nin, nout, otypes, cls=None, **kw):
    return box(id_, x, y, w, text, numinlets=nin, numoutlets=nout, outlettype=otypes,
               rnbo_classname=cls or text.split(" ")[0], **kw)


def comment(id_, x, y, w, text, **kw):
    return {"box": {"id": id_, "maxclass": "comment", "patching_rect": [float(x), float(y), float(w), 20.0],
                    "text": text, **kw}}


def line(src, so, dst, di):
    return {"patchline": {"source": [src, so], "destination": [dst, di]}}


def voice_patcher():
    b, l = [], []
    b.append(rbox("ni", 20, 20, 60, "notein", 2, 4, ["", "", "", ""]))
    b.append(rbox("mtof", 20, 55, 45, "mtof", 2, 1, [""]))
    b.append(rbox("vn", 120, 55, 50, "/ 127.", 2, 1, [""]))
    b.append(rbox("sp", 20, 90, 40, "sig~", 2, 1, ["signal"]))
    b.append(rbox("sv", 120, 90, 40, "sig~", 2, 1, ["signal"]))
    l += [line("ni", 0, "mtof", 0), line("ni", 1, "vn", 0), line("mtof", 0, "sp", 0), line("vn", 0, "sv", 0),
          line("sp", 0, "cb", 0), line("sv", 0, "cb", 1)]
    for i, (name, *_r) in enumerate(VOICE_PARAMS):
        b.append(rbox(f"vin-{i}", 220 + 90 * i, 90, 45, f"in~ {i+1}", 0, 1, ["signal"], cls="in~",
                      rnbo_extra_attributes={"comment": name, "meta": ""}))
        l.append(line(f"vin-{i}", 0, "cb", 2 + i))
    b.append({"box": {"id": "cb", "maxclass": "codebox~", "code": CODE.replace("\n", "\r\n"),
                      "fontname": "<Monospaced>", "fontsize": 12.0, "numinlets": 7, "numoutlets": 2,
                      "outlettype": ["signal", "signal"], "patching_rect": [20.0, 130.0, 720.0, 520.0],
                      "rnbo_classname": "codebox~"}})
    b.append(rbox("vout", 20, 670, 45, "out~ 1", 1, 0, [], cls="out~",
                  rnbo_extra_attributes={"comment": "voice", "meta": ""}))
    b.append(rbox("edge", 380, 670, 50, "edge~", 1, 2, ["bang", "bang"]))
    b.append(rbox("voice", 380, 705, 50, "voice", 2, 4, ["", "", "", ""]))
    b.append(comment("vc", 440, 670, 300, "out2 = 1 when the voice has gone silent -> mute it"))
    l += [line("cb", 0, "vout", 0), line("cb", 1, "edge", 0), line("edge", 0, "voice", 1)]
    return {"fileversion": 1, "appversion": APPV, "classnamespace": "rnbo",
            "rect": [140.0, 140.0, 800.0, 760.0], "default_fontname": "Lato", "gridsize": [15.0, 15.0],
            "title": "voice", "boxes": b, "lines": l}


def rnbo_patcher():
    b, l = [], []
    for i, (name, val, lo, hi, _u) in enumerate(VOICE_PARAMS):
        x = 20 + 150 * i
        b.append(rbox(f"pm-{i}", x, 20, 140, f"param {name} {val} @min {lo} @max {hi}", 2, 2, ["", ""], cls="param"))
        b.append(rbox(f"sg-{i}", x, 55, 60, f"sig~ {val}", 2, 1, ["signal"], cls="sig~"))
        l += [line(f"pm-{i}", 0, f"sg-{i}", 0), line(f"sg-{i}", 0, "poly", i)]
    b.append({"box": {"id": "poly", "maxclass": "newobj", "text": "p @polyphony 8 @title voice",
                      "numinlets": 5, "numoutlets": 1, "outlettype": ["signal"],
                      "patching_rect": [20.0, 100.0, 700.0, 22.0], "rnbo_classname": "p",
                      "rnbo_extra_attributes": {"polyphony": 8.0, "voicecontrol": "simple",
                                                "exposevoiceparams": 0, "receivemode": "local", "args": []},
                      "patcher": voice_patcher()}})
    b.append(rbox("mix", 20, 140, 60, f"*~ {MIX}", 2, 1, ["signal"], cls="*~"))
    name, val, lo, hi, _u = LEVEL
    b.append(rbox("pl", 200, 140, 160, f"param {name} {val} @min {lo} @max {hi}", 2, 2, ["", ""], cls="param"))
    b.append(rbox("lv", 20, 175, 60, f"*~ {val}", 2, 1, ["signal"], cls="*~"))
    b.append(rbox("o1", 20, 215, 45, "out~ 1", 1, 0, [], cls="out~", rnbo_extra_attributes={"comment": "left", "meta": ""}))
    b.append(rbox("o2", 120, 215, 45, "out~ 2", 1, 0, [], cls="out~", rnbo_extra_attributes={"comment": "right", "meta": ""}))
    l += [line("poly", 0, "mix", 0), line("mix", 0, "lv", 0), line("pl", 0, "lv", 1),
          line("lv", 0, "o1", 0), line("lv", 0, "o2", 0)]
    return {"fileversion": 1, "appversion": APPV, "classnamespace": "rnbo",
            "rect": [100.0, 100.0, 820.0, 300.0], "default_fontname": "Lato", "gridsize": [15.0, 15.0],
            "title": "crystal-poly", "boxes": b, "lines": l}


def rnbo_box(x, y, w):
    return {"box": {"id": "rnbo", "maxclass": "newobj", "text": "rnbo~ @title crystal-poly",
                    "numinlets": 2, "numoutlets": 3, "outlettype": ["signal", "signal", "list"],
                    "inletInfo": {"IOInfo": [{"type": "midi", "index": -1, "tag": "", "comment": ""}]},
                    "patching_rect": [float(x), float(y), float(w), 22.0], "rnboattrcache": {},
                    "rnboversion": "1.4.0", "autosave": 1,
                    "saved_object_attributes": {"optimization": "O1", "parameter_enable": 0},
                    "varname": "crystal-poly", "patcher": rnbo_patcher()}}


def patcher(boxes, lines, rect, extra=None):
    p = {"fileversion": 1, "appversion": APPV, "classnamespace": "box", "rect": rect,
         "default_fontname": "Arial", "default_fontsize": 12.0, "gridsize": [15.0, 15.0],
         "boxes": boxes, "lines": lines}
    p.update(extra or {})
    return {"patcher": p}


# ---- crystal-poly.maxpat ----------------------------------------------------
ob, ol = [], []
ob.append(comment("t", 20, 10, 900, "Crystal Synthesizer, polyphonic: eight voices, one crystal knob. Turn on the dac, pick a crystal, play chords.", fontsize=16.0))
ob.append(comment("s", 20, 36, 900, "Try the same chord on Ruby, then Labradorite: the tight lattices fight in chords, the wide one doesn't."))
ob.append({"box": {"id": "kb", "maxclass": "kslider", "numinlets": 2, "numoutlets": 2, "outlettype": ["int", "int"],
                   "parameter_enable": 0, "patching_rect": [20.0, 70.0, 336.0, 53.0]}})
ob.append(box("mk", 20, 135, 120, "makenote 100 1500", numinlets=3, numoutlets=2, outlettype=["float", "float"]))
ob.append(box("pk", 20, 165, 60, "pack 0 0", numinlets=2, numoutlets=1, outlettype=[""]))
ob.append(box("mf", 20, 195, 80, "midiformat", numinlets=7, numoutlets=2, outlettype=["int", ""]))
ob.append(box("mi", 200, 195, 50, "midiin", numinlets=1, numoutlets=1, outlettype=["int"]))
ol += [line("kb", 0, "mk", 0), line("kb", 1, "mk", 1), line("mk", 0, "pk", 0), line("mk", 1, "pk", 1),
       line("pk", 0, "mf", 0), line("mf", 0, "rnbo", 1), line("mi", 0, "rnbo", 1)]
items = []
for k, c in enumerate(CRYSTALS):
    if k:
        items.append(",")
    items += f"{k} {c}".split(" ")
ob.append(comment("ml", 400, 70, 200, "crystal"))
ob.append(box("mlm", 400, 92, 70, "loadmess 0", numinlets=1, numoutlets=1, outlettype=[""]))
ob.append({"box": {"id": "menu", "maxclass": "umenu", "items": items, "numinlets": 1, "numoutlets": 3,
                   "outlettype": ["int", "", ""], "parameter_enable": 0, "patching_rect": [400.0, 120.0, 200.0, 22.0]}})
ob.append(box("mpp", 400, 150, 100, "prepend crystal", numinlets=1, numoutlets=1, outlettype=[""]))
ol += [line("mlm", 0, "menu", 0), line("menu", 0, "mpp", 0), line("mpp", 0, "rnbo", 0)]
for i, (name, val, lo, hi, unit) in enumerate(VOICE_PARAMS[1:] + [LEVEL]):
    x = 620 + 100 * i
    ob.append(comment(f"lb-{i}", x, 70, 98, f"{name} {unit}".strip()))
    ob.append(box(f"lm-{i}", x, 92, 80, f"loadmess {val}", numinlets=1, numoutlets=1, outlettype=[""]))
    ob.append({"box": {"id": f"fl-{i}", "maxclass": "flonum", "format": 6, "minimum": lo, "maximum": hi,
                       "numinlets": 1, "numoutlets": 2, "outlettype": ["", "bang"], "parameter_enable": 0,
                       "patching_rect": [float(x), 120.0, 70.0, 22.0]}})
    ob.append(box(f"pp-{i}", x, 150, 95, f"prepend {name}", numinlets=1, numoutlets=1, outlettype=[""]))
    ol += [line(f"lm-{i}", 0, f"fl-{i}", 0), line(f"fl-{i}", 0, f"pp-{i}", 0), line(f"pp-{i}", 0, "rnbo", 0)]
ob.append(rnbo_box(20, 250, 1080))
ob.append({"box": {"id": "dac", "maxclass": "ezdac~", "numinlets": 2, "numoutlets": 0,
                   "patching_rect": [20.0, 300.0, 45.0, 45.0]}})
ol += [line("rnbo", 0, "dac", 0), line("rnbo", 1, "dac", 1)]
(here / "crystal-poly.maxpat").write_text(json.dumps(patcher(ob, ol, [60.0, 80.0, 1140.0, 380.0]), indent=1))

# ---- Crystal Synthesizer 0.1.amxd (instrument) -----------------------------
db, dl = [], []
db.append(box("mi", 20, 20, 50, "midiin", numinlets=1, numoutlets=1, outlettype=["int"]))
dl.append(line("mi", 0, "rnbo", 1))
db.append({"box": {"id": "menu", "maxclass": "live.menu", "numinlets": 1, "numoutlets": 3,
                   "outlettype": ["", "", "float"], "parameter_enable": 1,
                   "patching_rect": [100.0, 20.0, 120.0, 15.0], "presentation": 1,
                   "presentation_rect": [8.0, 8.0, 120.0, 15.0], "varname": "crystal",
                   "saved_attribute_attributes": {"valueof": {
                       "parameter_enum": CRYSTALS, "parameter_longname": "CS crystal",
                       "parameter_shortname": "crystal", "parameter_type": 2, "parameter_mmax": 8,
                       "parameter_initial": [0], "parameter_initial_enable": 1}}}})
db.append(box("mpp", 100, 60, 100, "prepend crystal", numinlets=1, numoutlets=1, outlettype=[""]))
dl += [line("menu", 0, "mpp", 0), line("mpp", 0, "rnbo", 0)]
for i, (name, val, lo, hi, unit) in enumerate(VOICE_PARAMS[1:] + [LEVEL]):
    x = 240 + 80 * i
    db.append({"box": {"id": f"dial-{i}", "maxclass": "live.dial", "numinlets": 1, "numoutlets": 2,
                       "outlettype": ["", "float"], "parameter_enable": 1,
                       "patching_rect": [float(x), 20.0, 44.0, 48.0], "presentation": 1,
                       "presentation_rect": [float(8 + 52 * i), 32.0, 44.0, 48.0], "varname": name,
                       "saved_attribute_attributes": {"valueof": {
                           "parameter_longname": f"CS {name}", "parameter_shortname": name,
                           "parameter_type": 0, "parameter_mmin": lo, "parameter_mmax": hi,
                           "parameter_initial": [val], "parameter_initial_enable": 1,
                           "parameter_unitstyle": 2 if unit == "ms" else 1}}}})
    db.append(box(f"pp-{i}", x, 80, 75, f"prepend {name}", numinlets=1, numoutlets=1, outlettype=[""]))
    dl += [line(f"dial-{i}", 0, f"pp-{i}", 0), line(f"pp-{i}", 0, "rnbo", 0)]
db.append(rnbo_box(20, 140, 700))
db.append(box("pout", 20, 200, 70, "plugout~", numinlets=2, numoutlets=2, outlettype=["signal", "signal"]))
dl += [line("rnbo", 0, "pout", 0), line("rnbo", 1, "pout", 1)]
dev = patcher(db, dl, [100.0, 100.0, 760.0, 300.0],
              {"openinpresentation": 1, "devicewidth": 280.0,
               "description": "Crystal Synthesizer 0.1: eight voices whose partials are a crystal's phonon modes."})
js = json.dumps(dev, indent=2).encode() + b"\x00"
hdr = b"ampf" + struct.pack("<I", 4) + b"iiii" + b"meta" + struct.pack("<I", 4) + struct.pack("<I", 0) + b"ptch" + struct.pack("<I", len(js))
(here / "Crystal Synthesizer 0.1.amxd").write_bytes(hdr + js)
print("wrote crystal-poly.maxpat and Crystal Synthesizer 0.1.amxd")
