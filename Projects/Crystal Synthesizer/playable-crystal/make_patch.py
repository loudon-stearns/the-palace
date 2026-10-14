#!/usr/bin/env python3
"""
make_patch.py — write crystal-bank.maxpat: the playable crystal as a Max patch.

  [kslider] -> [makenote 100 600] --+
  [notein] -------------------------+-> pitch -> [mtof] -> [sig~] -> rnbo~ in 1
                                    +-> velocity -> [/ 127.] -> [sig~] -> rnbo~ in 2
  [umenu: nine crystals] -> [prepend crystal] -> rnbo~ (left inlet, param message)
  attack / decay / release / rolloff / level: [loadmess] -> [flonum] -> [prepend name] -> rnbo~
  rnbo~ out 1, 2 -> [ezdac~]

Inside rnbo~: [in~ 1] [in~ 2] -> [codebox~ crystal-bank.codebox] -> [out~ 1] [out~ 2].

Box formats adopted from Projects/Blood Compressor/rnbo/make_patch.py and
Projects/Action Potential Oscillator/rnbo/make_maxpat.py (themselves read off
the RNBO 1.4 help patchers). UNVERIFIED until someone opens it in Max.
"""
import json, pathlib

here = pathlib.Path(__file__).parent
code = (here / "crystal-bank.codebox").read_text()
APPV = {"major": 9, "minor": 0, "revision": 0, "architecture": "x64", "modernui": 1}

CRYSTALS = ["0 Diamond - cubic", "1 Fluorite - cubic", "2 Tetragonal - hypothesis",
            "3 Emerald - hexagonal", "4 Ruby - trigonal", "5 Amethyst - trigonal",
            "6 Topaz - orthorhombic", "7 Monoclinic - hypothesis", "8 Labradorite - triclinic"]
PARAMS = [("attack", 80.0, 1.0, 500.0, "ms"), ("decay", 5.5, 0.1, 20.0, "s"),
          ("release", 0.4, 0.01, 10.0, "s"), ("rolloff", 0.7, 0.3, 1.0, "mode to mode"),
          ("level", 0.5, 0.0, 1.0, "")]


def box(id_, x, y, w, text=None, **kw):
    b = {"id": id_, "patching_rect": [float(x), float(y), float(w), 22.0], "fontsize": 12.0}
    if text is not None:
        b.update(maxclass="newobj", text=text)
    b.update(kw)
    return {"box": b}


def comment(id_, x, y, w, text, **kw):
    b = {"id": id_, "maxclass": "comment", "patching_rect": [float(x), float(y), float(w), 20.0],
         "text": text}
    b.update(kw)
    return {"box": b}


def line(src, so, dst, di):
    return {"patchline": {"source": [src, so], "destination": [dst, di]}}


# ---- inside the rnbo~ -------------------------------------------------------
ib, il = [], []
for i, name in enumerate(["pitch Hz", "velocity 0..1 (0 = key up)"]):
    ib.append(box(f"in-{i+1}", 20 + 360 * i, 20, 48, f"in~ {i+1}", numinlets=0, numoutlets=1,
                  outlettype=["signal"], rnbo_classname="in~",
                  rnbo_extra_attributes={"comment": name, "meta": ""}))
    il.append(line(f"in-{i+1}", 0, "cb", i))
ib.append({"box": {"id": "cb", "maxclass": "codebox~", "code": code.replace("\n", "\r\n"),
                   "fontname": "<Monospaced>", "fontsize": 12.0, "numinlets": 2, "numoutlets": 2,
                   "outlettype": ["signal", "signal"], "patching_rect": [20.0, 60.0, 720.0, 560.0],
                   "rnbo_classname": "codebox~"}})
for j, name in enumerate(["left", "right"]):
    ib.append(box(f"out-{j+1}", 20 + 360 * j, 650, 45, f"out~ {j+1}", numinlets=1, numoutlets=0,
                  rnbo_classname="out~", rnbo_extra_attributes={"comment": name, "meta": ""}))
    il.append(line("cb", j, f"out-{j+1}", 0))
inner = {"fileversion": 1, "appversion": APPV, "classnamespace": "rnbo",
         "rect": [100.0, 100.0, 800.0, 720.0], "default_fontname": "Lato",
         "gridsize": [15.0, 15.0], "title": "crystal-bank", "boxes": ib, "lines": il}

# ---- the Max patch ----------------------------------------------------------
ob, ol = [], []
ob.append(comment("title", 20, 10, 900,
                  "Crystal Synthesizer: the playable crystal. Turn on the dac, pick a crystal, play the keys.",
                  fontsize=16.0))
ob.append(comment("sub", 20, 36, 900,
                  "Nine slots, falling symmetry. Default knobs = the proofs' strike exactly. Turn the menu while a note rings."))

ob.append({"box": {"id": "kb", "maxclass": "kslider", "numinlets": 2, "numoutlets": 2,
                   "outlettype": ["int", "int"], "parameter_enable": 0,
                   "patching_rect": [20.0, 70.0, 336.0, 53.0]}})
ob.append(box("mk", 20, 135, 110, "makenote 100 600", numinlets=3, numoutlets=2, outlettype=["float", "float"]))
ob.append(box("ni", 200, 135, 50, "notein", numinlets=1, numoutlets=3, outlettype=["int", "int", "int"]))
ob.append(box("mtof", 20, 175, 45, "mtof", numinlets=1, numoutlets=1, outlettype=[""]))
ob.append(box("vnorm", 120, 175, 50, "/ 127.", numinlets=2, numoutlets=1, outlettype=["float"]))
ob.append(box("sigp", 20, 205, 40, "sig~", numinlets=1, numoutlets=1, outlettype=["signal"]))
ob.append(box("sigv", 120, 205, 40, "sig~", numinlets=1, numoutlets=1, outlettype=["signal"]))
ol += [line("kb", 0, "mk", 0), line("kb", 1, "mk", 1),
       line("mk", 0, "mtof", 0), line("mk", 1, "vnorm", 0),
       line("ni", 0, "mtof", 0), line("ni", 1, "vnorm", 0),
       line("mtof", 0, "sigp", 0), line("vnorm", 0, "sigv", 0),
       line("sigp", 0, "rnbo", 0), line("sigv", 0, "rnbo", 1)]

items = []
for k, c in enumerate(CRYSTALS):
    if k:
        items.append(",")
    items += c.split(" ")
ob.append(comment("menu-l", 400, 70, 200, "crystal"))
ob.append(box("menu-lm", 400, 92, 70, "loadmess 0", numinlets=1, numoutlets=1, outlettype=[""]))
ob.append({"box": {"id": "menu", "maxclass": "umenu", "items": items, "numinlets": 1, "numoutlets": 3,
                   "outlettype": ["int", "", ""], "parameter_enable": 0,
                   "patching_rect": [400.0, 120.0, 200.0, 22.0]}})
ob.append(box("menu-pp", 400, 150, 100, "prepend crystal", numinlets=1, numoutlets=1, outlettype=[""]))
ol += [line("menu-lm", 0, "menu", 0), line("menu", 0, "menu-pp", 0), line("menu-pp", 0, "rnbo", 0)]

for i, (name, val, lo, hi, unit) in enumerate(PARAMS):
    x = 620 + 100 * i
    ob.append(comment(f"lbl-{i}", x, 70, 98, f"{name} {unit}".strip()))
    ob.append(box(f"lm-{i}", x, 92, 80, f"loadmess {val}", numinlets=1, numoutlets=1, outlettype=[""]))
    ob.append({"box": {"id": f"fl-{i}", "maxclass": "flonum", "format": 6, "minimum": lo, "maximum": hi,
                       "numinlets": 1, "numoutlets": 2, "outlettype": ["", "bang"], "parameter_enable": 0,
                       "patching_rect": [float(x), 120.0, 70.0, 22.0]}})
    ob.append(box(f"pp-{i}", x, 150, 95, f"prepend {name}", numinlets=1, numoutlets=1, outlettype=[""]))
    ol += [line(f"lm-{i}", 0, f"fl-{i}", 0), line(f"fl-{i}", 0, f"pp-{i}", 0), line(f"pp-{i}", 0, "rnbo", 0)]

ob.append({"box": {"id": "rnbo", "maxclass": "newobj", "text": "rnbo~ @title crystal-bank",
                   "numinlets": 2, "numoutlets": 3, "outlettype": ["signal", "signal", "list"],
                   "patching_rect": [20.0, 250.0, 1080.0, 22.0], "rnboattrcache": {},
                   "rnboversion": "1.4.0", "autosave": 1,
                   "saved_object_attributes": {"optimization": "O1", "parameter_enable": 0},
                   "varname": "crystal-bank", "patcher": inner}})
ob.append({"box": {"id": "dac", "maxclass": "ezdac~", "numinlets": 2, "numoutlets": 0,
                   "patching_rect": [20.0, 300.0, 45.0, 45.0]}})
ob.append(comment("listen", 90, 300, 820,
                  "Listen for: Ruby's slow 4 Hz beating (the 1.10/1.14 doublet) - Fluorite's lone high mode after a gap - "
                  "Labradorite's four octaves that never settle into a chord. Hold one key and step the menu: same strike, new lattice."))
ol += [line("rnbo", 0, "dac", 0), line("rnbo", 1, "dac", 1)]

patch = {"patcher": {"fileversion": 1, "appversion": APPV, "classnamespace": "box",
                     "rect": [60.0, 80.0, 1140.0, 380.0], "default_fontname": "Arial",
                     "default_fontsize": 12.0, "gridsize": [15.0, 15.0], "boxes": ob, "lines": ol}}
(here / "crystal-bank.maxpat").write_text(json.dumps(patch, indent=1))
print("wrote crystal-bank.maxpat")
