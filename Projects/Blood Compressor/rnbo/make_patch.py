"""
Write the Blood Compressor's Max files by hand from the two codebox files:

  blood-compressor-test.maxpat   open in Max. The heartbeat (its own rnbo~) feeds
                                 both sides of the compressor (rnbo~), every control
                                 is a number box, and the vessel drawing
                                 (v8ui blood-vessel.js) shows pressure, squeeze and
                                 the baroreceptors live. Drag its amber line to set
                                 the threshold. The sound goes to the dac.
  Blood Compressor 0.2.amxd      a Max for Live audio effect, stereo-linked:
                                 plugin~ L R -> the same rnbo~ -> plugout~ L R, one
                                 live.dial per control, and the vessel beside them.

v0.2 (2026-10-14): stereo link in the codebox, the vessel drawn in the device.

Box formats follow Action Potential Oscillator/rnbo/make_maxpat.py (RNBO 1.4 help
patchers). The .amxd header ('ampf', type 'aaaa' = audio effect, 'meta', 'ptch'
+ length + JSON) is read off BLUELINE's Live-saved devices. Max fills in rnbo~'s
cached metadata on load. UNVERIFIED until someone opens them.
"""
import json, struct, pathlib

here = pathlib.Path(__file__).parent
COMP = (here / "blood-compressor.codebox").read_text()
BEAT = (here / "heartbeat.codebox").read_text()

# name, default, min, max, unit (live.dial unitstyle: 4 dB, 2 ms, 1 float, 9 ratio? use 1)
PARAMS = [("threshold", -20.0, -60.0, 0.0, "dB", 4), ("ratio", 4.0, 1.0, 20.0, ": 1", 1),
          ("knee", 6.0, 0.0, 24.0, "dB", 4), ("attack", 60.0, 5.0, 500.0, "ms", 2),
          ("release", 300.0, 5.0, 3000.0, "ms", 2), ("makeup", 0.0, 0.0, 24.0, "dB", 4),
          ("rmsTime", 10.0, 1.0, 100.0, "ms", 2), ("bypass", 0.0, 0.0, 1.0, "", 1)]
BODY = {"threshold": "systolic line", "ratio": "wall stiffness", "knee": "wall yield",
        "attack": "reflex delay", "release": "muscle relaxing", "makeup": "makeup",
        "rmsTime": "detector", "bypass": "bypass"}
OUTS = [("blood out L", "audio"), ("blood out R", "audio"), ("pressure dB", "detector"),
        ("squeeze dB", "gain change"), ("baroreceptors", "1 while over")]
N_AUDIO = 2  # outs before the meters
VW, VH = 380.0, 160.0  # the vessel drawing

def box(id_, x, y, w, text=None, h=22.0, **kw):
    b = {"id": id_, "patching_rect": [float(x), float(y), float(w), h], "fontsize": 12.0}
    if text is not None:
        b.update(maxclass="newobj", text=text)
    b.update(kw)
    return {"box": b}

def line(src, so, dst, di):
    return {"patchline": {"source": [src, so], "destination": [dst, di]}}

def comment(id_, x, y, w, text, **kw):
    return {"box": {"id": id_, "maxclass": "comment", "patching_rect": [float(x), float(y), float(w), 20.0], "text": text, **kw}}

APPV = {"major": 9, "minor": 0, "revision": 0, "architecture": "x64", "modernui": 1}

def rnbo_inner(title, code, n_in, outs):
    ib, il = [], []
    for i in range(n_in):
        ib.append(box(f"in-{i+1}", 20, 20, 48, f"in~ {i+1}", numinlets=0, numoutlets=1, outlettype=["signal"],
                      rnbo_classname="in~", rnbo_extra_attributes={"comment": "blood in", "meta": ""}))
        il.append(line(f"in-{i+1}", 0, "cb", i))
    ib.append({"box": {"id": "cb", "maxclass": "codebox~", "code": code.replace("\n", "\r\n"),
                       "fontname": "<Monospaced>", "fontsize": 12.0, "numinlets": max(1, n_in),
                       "numoutlets": len(outs), "outlettype": ["signal"] * len(outs),
                       "patching_rect": [20.0, 60.0, 720.0, 560.0], "rnbo_classname": "codebox~"}})
    for j, (name, _) in enumerate(outs):
        ib.append(box(f"out-{j+1}", 20 + 180 * j, 650, 45, f"out~ {j+1}", numinlets=1, numoutlets=0,
                      rnbo_classname="out~", rnbo_extra_attributes={"comment": name, "meta": ""}))
        il.append(line("cb", j, f"out-{j+1}", 0))
    return {"fileversion": 1, "appversion": APPV, "classnamespace": "rnbo",
            "rect": [100.0, 100.0, 800.0, 720.0], "default_fontname": "Lato",
            "gridsize": [15.0, 15.0], "title": title, "boxes": ib, "lines": il}

def rnbo_box(id_, x, y, w, title, inner, n_sig_out, n_in=1):
    return {"box": {"id": id_, "maxclass": "newobj", "text": f"rnbo~ @title {title}",
                    "numinlets": max(1, n_in), "numoutlets": n_sig_out + 1,
                    "outlettype": ["signal"] * n_sig_out + ["list"],
                    "patching_rect": [float(x), float(y), float(w), 22.0], "rnboattrcache": {},
                    "rnboversion": "1.4.0", "autosave": 1,
                    "saved_object_attributes": {"optimization": "O1", "parameter_enable": 0},
                    "varname": title, "patcher": inner}}

def patcher(boxes, lines, rect, extra=None):
    p = {"fileversion": 1, "appversion": APPV, "classnamespace": "box", "rect": rect,
         "default_fontname": "Arial", "default_fontsize": 12.0, "gridsize": [15.0, 15.0],
         "boxes": boxes, "lines": lines}
    if extra: p.update(extra)
    return {"patcher": p}

comp_inner = lambda: rnbo_inner("blood-compressor", COMP, 2, OUTS)

def vessel(id_, x, y, pres=None):
    b = {"id": id_, "maxclass": "v8ui", "filename": "blood-vessel.js", "parameter_enable": 0,
         "numinlets": 1, "numoutlets": 1, "outlettype": [""],
         "patching_rect": [float(x), float(y), VW, VH]}
    if pres: b.update(presentation=1, presentation_rect=[float(pres[0]), float(pres[1]), VW, VH])
    return {"box": b}

def meter_feed(boxes, lines, x, y, comp_id, dest_id):
    """metro -> t b b b -> three snapshot~ of the meter outlets -> pack -> 'meters p s b'.
    One bang reads all three at the same instant, so each frame is coherent."""
    boxes.append(box("m-on", x, y, 70, "loadmess 1", numinlets=1, numoutlets=1, outlettype=[""]))
    boxes.append(box("m-metro", x, y + 30, 70, "metro 33", numinlets=2, numoutlets=1, outlettype=["bang"]))
    boxes.append(box("m-t", x, y + 60, 70, "t b b b", numinlets=1, numoutlets=3, outlettype=["bang", "bang", "bang"]))
    lines += [line("m-on", 0, "m-metro", 0), line("m-metro", 0, "m-t", 0)]
    for k in range(3):
        sid = f"m-snap-{k}"
        boxes.append(box(sid, x + 90 * k, y + 90, 80, "snapshot~", numinlets=2, numoutlets=1, outlettype=["float"]))
        lines += [line(comp_id, N_AUDIO + k, sid, 0), line("m-t", k, sid, 0), line(sid, 0, "m-pack", k)]
    boxes.append(box("m-pack", x, y + 120, 100, "pack 0. 0. 0.", numinlets=3, numoutlets=1, outlettype=[""]))
    boxes.append(box("m-pre", x, y + 150, 100, "prepend meters", numinlets=1, numoutlets=1, outlettype=[""]))
    lines += [line("m-pack", 0, "m-pre", 0), line("m-pre", 0, dest_id, 0)]

# ---- the test patch ---------------------------------------------------------
ob, ol = [], []
ob.append(comment("title", 20, 10, 900, "Blood Compressor 0.2: the heartbeat through the vessel. Turn on the dac, then drag the amber systolic line down and watch the vessel narrow.", fontsize=16.0))
ob.append(rnbo_box("beat", 20, 50, 200, "heartbeat", rnbo_inner("heartbeat", BEAT, 0, [("heartbeat", "")]), 1))
ob.append(comment("beat-l", 230, 50, 400, "test source: lub-dub at 72 bpm, peaks near -7 dB, hum near -36 dB, sent to both sides"))
for i, (name, val, lo, hi, unit, _) in enumerate(PARAMS):
    x = 20 + 115 * i
    ob.append(comment(f"lbl-{i}", x, 95, 112, f"{name} ({BODY[name]})"))
    ob.append(box(f"lm-{i}", x, 120, 90, f"loadmess {val}", numinlets=1, numoutlets=1, outlettype=[""]))
    ob.append({"box": {"id": f"fl-{i}", "maxclass": "flonum", "format": 6, "minimum": lo, "maximum": hi,
                       "numinlets": 1, "numoutlets": 2, "outlettype": ["", "bang"], "parameter_enable": 0,
                       "patching_rect": [float(x), 150.0, 70.0, 22.0]}})
    ob.append(box(f"pp-{i}", x, 180, 100, f"prepend {name}", numinlets=1, numoutlets=1, outlettype=[""]))
    ol += [line(f"lm-{i}", 0, f"fl-{i}", 0), line(f"fl-{i}", 0, f"pp-{i}", 0), line(f"pp-{i}", 0, "comp", 0),
           line(f"pp-{i}", 0, "vessel", 0)]
ol += [line("beat", 0, "comp", 0), line("beat", 0, "comp", 1)]
ob.append(rnbo_box("comp", 20, 230, 900, "blood-compressor", comp_inner(), 5, n_in=2))
ob.append(box("gain", 20, 280, 60, "*~ 0.5", numinlets=2, numoutlets=1, outlettype=["signal"]))
ob.append(box("gainR", 90, 280, 60, "*~ 0.5", numinlets=2, numoutlets=1, outlettype=["signal"]))
ob.append({"box": {"id": "dac", "maxclass": "ezdac~", "numinlets": 2, "numoutlets": 0, "patching_rect": [20.0, 320.0, 45.0, 45.0]}})
ol += [line("comp", 0, "gain", 0), line("comp", 1, "gainR", 0), line("gain", 0, "dac", 0), line("gainR", 0, "dac", 1)]
meter_feed(ob, ol, 180, 280, "comp", "vessel")
ob.append(vessel("vessel", 500, 280))
ob.append(comment("vessel-l", 500, 445, 380, "the vessel: drag the amber line to set the threshold (it drives the threshold box above)"))
ol.append(line("vessel", 0, "fl-0", 0))
(here / "blood-compressor-test.maxpat").write_text(json.dumps(patcher(ob, ol, [80.0, 80.0, 960.0, 520.0]), indent=2))

# ---- the Max for Live audio effect -----------------------------------------
db, dl = [], []
db.append(box("pin", 20, 20, 60, "plugin~", numinlets=1, numoutlets=2, outlettype=["signal", "signal"]))
dl += [line("pin", 0, "comp", 0), line("pin", 1, "comp", 1)]
for i, (name, val, lo, hi, unit, style) in enumerate(PARAMS):
    x = 120 + 80 * i
    dial = {"id": f"dial-{i}", "maxclass": "live.dial", "numinlets": 1, "numoutlets": 2,
            "outlettype": ["", "float"], "parameter_enable": 1,
            "patching_rect": [float(x), 20.0, 44.0, 48.0], "presentation": 1,
            "presentation_rect": [float(6 + 54 * (i % 4)), float(4 + 54 * (i // 4)), 44.0, 48.0], "varname": name,
            "saved_attribute_attributes": {"valueof": {
                "parameter_longname": f"BC {name}", "parameter_shortname": name[:8],
                "parameter_type": 2 if name == "bypass" else 0,
                "parameter_mmin": lo, "parameter_mmax": hi,
                "parameter_initial": [val], "parameter_initial_enable": 1,
                "parameter_unitstyle": 4 if name == "bypass" else style}}}
    if name == "bypass":
        dial["saved_attribute_attributes"]["valueof"]["parameter_enum"] = ["off", "on"]
    db.append({"box": dial})
    db.append(box(f"pp-{i}", x, 80, 75, f"prepend {name}", numinlets=1, numoutlets=1, outlettype=[""]))
    dl += [line(f"dial-{i}", 0, f"pp-{i}", 0), line(f"pp-{i}", 0, "comp", 0), line(f"pp-{i}", 0, "vessel", 0)]
db.append(rnbo_box("comp", 20, 140, 700, "blood-compressor", comp_inner(), 5, n_in=2))
db.append(box("pout", 20, 260, 70, "plugout~", numinlets=2, numoutlets=2, outlettype=["signal", "signal"]))
dl += [line("comp", 0, "pout", 0), line("comp", 1, "pout", 1)]
meter_feed(db, dl, 200, 200, "comp", "vessel")
db.append(vessel("vessel", 500, 200, pres=(228, 4)))
dl.append(line("vessel", 0, "dial-0", 0))
dev = patcher(db, dl, [100.0, 100.0, 960.0, 460.0],
              {"openinpresentation": 1, "devicewidth": 616.0,
               "description": "Blood Compressor 0.2: a stereo-linked compressor dressed as the body, with the vessel drawn live."})
js = json.dumps(dev, indent=2).encode() + b"\x00"
hdr = b"ampf" + struct.pack("<I", 4) + b"aaaa" + b"meta" + struct.pack("<I", 4) + struct.pack("<I", 1) + b"ptch" + struct.pack("<I", len(js))
(here / "Blood Compressor 0.2.amxd").write_bytes(hdr + js)
print("wrote blood-compressor-test.maxpat and Blood Compressor 0.2.amxd")
