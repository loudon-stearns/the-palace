"""
Write neuropulse-crowd.maxpat by hand (no py2max): a Max patch holding an
rnbo~ whose inner patcher is [in~ 1..8] -> [codebox~] -> [out~ 1] [out~ 2],
with the codebox source embedded from neuropulse-crowd.codebox.

Outside the rnbo~: each inlet gets [loadmess default] -> [flonum] -> [sig~],
so every control is a signal jack you can replace with an LFO. out1 goes
through [*~ 0.4] to [ezdac~]; out2 (synchrony) goes to [number~] + [meter~].
A [cycle~ 0.2] -> [scale~ -1. 1. 0. 0.02] is parked beside the K inlet,
unwired, as the "breathing" LFO from the phrase demo.

Box formats copied from the RNBO 1.4 help patchers in Max.app. Max fills in
rnboinfo / IO metadata on load. UNVERIFIED until someone opens it in Max.
"""
import json, pathlib

here = pathlib.Path(__file__).parent
code = (here / "neuropulse-crowd.codebox").read_text()

INLETS = [("frequency Hz", 110.0), ("coupling K", 0.0), ("spread", 0.05),
          ("leak tau ms", 5.0), ("spike ms", 1.0), ("hyperpolarization", -0.2),
          ("recovery damping", 0.3), ("refractory ms", 1.5)]

def box(id_, x, y, w, text=None, **kw):
    b = {"id": id_, "patching_rect": [x, y, w, 22.0], "fontsize": 12.0}
    if text is not None:
        b.update(maxclass="newobj", text=text)
    b.update(kw)
    return {"box": b}

def line(src, so, dst, di):
    return {"patchline": {"source": [src, so], "destination": [dst, di]}}

# ---- inner rnbo patcher ----------------------------------------------------
ib, il = [], []
for i, (name, _) in enumerate(INLETS):
    ib.append(box(f"in-{i+1}", 20 + 90 * i, 20, 48, f"in~ {i+1}", numinlets=0, numoutlets=1,
                  outlettype=["signal"], rnbo_classname="in~",
                  rnbo_extra_attributes={"comment": name, "meta": ""}))
    il.append(line(f"in-{i+1}", 0, "cb", i))
ib.append({"box": {"id": "cb", "maxclass": "codebox~", "code": code.replace("\n", "\r\n"),
                   "fontname": "<Monospaced>", "fontsize": 12.0,
                   "numinlets": 8, "numoutlets": 2, "outlettype": ["signal", "signal"],
                   "patching_rect": [20.0, 70.0, 700.0, 500.0], "rnbo_classname": "codebox~"}})
ib.append(box("out-1", 20, 600, 45, "out~ 1", numinlets=1, numoutlets=0, rnbo_classname="out~",
              rnbo_extra_attributes={"comment": "crowd voice", "meta": ""}))
ib.append(box("out-2", 380, 600, 45, "out~ 2", numinlets=1, numoutlets=0, rnbo_classname="out~",
              rnbo_extra_attributes={"comment": "synchrony 0..1", "meta": ""}))
il += [line("cb", 0, "out-1", 0), line("cb", 1, "out-2", 0)]

inner = {"fileversion": 1, "appversion": {"major": 9, "minor": 0, "revision": 0,
         "architecture": "x64", "modernui": 1}, "classnamespace": "rnbo",
         "rect": [100.0, 100.0, 800.0, 680.0], "default_fontname": "Lato",
         "gridsize": [15.0, 15.0], "title": "neuropulse-crowd", "boxes": ib, "lines": il}

# ---- outer Max patcher -----------------------------------------------------
ob, ol = [], []
ob.append({"box": {"id": "title", "maxclass": "comment", "fontsize": 18.0,
                   "patching_rect": [20.0, 10.0, 700.0, 27.0],
                   "text": "NeuroPulse crowd: 32 coupled neurons. Raise K past ~0.005 and listen for the lock."}})
for i, (name, val) in enumerate(INLETS):
    x = 20 + 110 * i
    ob.append({"box": {"id": f"lbl-{i}", "maxclass": "comment", "patching_rect": [x, 45.0, 105.0, 20.0],
                       "text": name}})
    ob.append(box(f"lm-{i}", x, 70, 90, f"loadmess {val}", numinlets=1, numoutlets=1, outlettype=[""]))
    ob.append({"box": {"id": f"fl-{i}", "maxclass": "flonum", "format": 6, "numinlets": 1,
                       "numoutlets": 2, "outlettype": ["", "bang"], "parameter_enable": 0,
                       "patching_rect": [x, 100.0, 70.0, 22.0]}})
    ob.append(box(f"sig-{i}", x, 135, 45, "sig~", numinlets=1, numoutlets=1, outlettype=["signal"]))
    ol += [line(f"lm-{i}", 0, f"fl-{i}", 0), line(f"fl-{i}", 0, f"sig-{i}", 0),
           line(f"sig-{i}", 0, "rnbo", i)]
ob.append({"box": {"id": "rnbo", "maxclass": "newobj", "text": "rnbo~ @title neuropulse-crowd",
                   "numinlets": 8, "numoutlets": 3, "outlettype": ["signal", "signal", "list"],
                   "patching_rect": [20.0, 200.0, 860.0, 22.0], "rnboattrcache": {},
                   "rnboversion": "1.4.0", "autosave": 1,
                   "saved_object_attributes": {"optimization": "O1", "parameter_enable": 1},
                   "varname": "neuropulse-crowd", "patcher": inner}})
ob.append(box("gain", 20, 250, 60, "*~ 0.4", numinlets=2, numoutlets=1, outlettype=["signal"]))
ob.append({"box": {"id": "dac", "maxclass": "ezdac~", "numinlets": 2, "numoutlets": 0,
                   "patching_rect": [20.0, 290.0, 45.0, 45.0]}})
ob.append({"box": {"id": "num", "maxclass": "number~", "mode": 2, "numinlets": 2, "numoutlets": 2,
                   "outlettype": ["signal", "float"], "sig": 0.0,
                   "patching_rect": [160.0, 250.0, 70.0, 22.0]}})
ob.append({"box": {"id": "meter", "maxclass": "meter~", "numinlets": 1, "numoutlets": 1,
                   "outlettype": ["float"], "patching_rect": [240.0, 250.0, 120.0, 13.0]}})
ob.append({"box": {"id": "synclbl", "maxclass": "comment", "patching_rect": [160.0, 275.0, 260.0, 20.0],
                   "text": "synchrony out: share of the crowd spiking now"}})
ob.append(box("lfo", 400, 250, 80, "cycle~ 0.2", numinlets=2, numoutlets=1, outlettype=["signal"]))
ob.append(box("lfoscale", 400, 280, 150, "scale~ -1. 1. 0. 0.02", numinlets=6, numoutlets=1,
              outlettype=["signal"]))
ob.append({"box": {"id": "lfolbl", "maxclass": "comment", "patching_rect": [400.0, 305.0, 330.0, 34.0],
                   "linecount": 2, "text": "breathing K: unplug the K sig~ and wire this into rnbo~ inlet 2"}})
ol += [line("rnbo", 0, "gain", 0), line("gain", 0, "dac", 0), line("gain", 0, "dac", 1),
       line("rnbo", 1, "num", 0), line("rnbo", 1, "meter", 0), line("lfo", 0, "lfoscale", 0)]

patch = {"patcher": {"fileversion": 1, "appversion": {"major": 9, "minor": 0, "revision": 0,
         "architecture": "x64", "modernui": 1}, "classnamespace": "box",
         "rect": [60.0, 80.0, 920.0, 380.0], "default_fontname": "Lato",
         "gridsize": [15.0, 15.0], "boxes": ob, "lines": ol}}
(here / "neuropulse-crowd.maxpat").write_text(json.dumps(patch, indent=1))
print("wrote neuropulse-crowd.maxpat")
