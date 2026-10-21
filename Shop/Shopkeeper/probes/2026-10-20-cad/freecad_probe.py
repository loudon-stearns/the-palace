"""The second candidate: the same light cap in FreeCAD 1.1, headless.

    /Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd freecad_probe.py

Builds the cap with FreeCAD's Part module from the same handwheel_dims.py,
compares volume and axial inertia with the build123d model (out/check.json),
then asks TechDraw for a dimensioned page without the GUI. Writes
out/freecad_probe.json.
"""
import json
import os
import sys
import traceback

HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)

import FreeCAD
import Part
from handwheel_dims import CAP, MOTOR

out = {"freecad": ".".join(FreeCAD.Version()[:3]), "python": sys.version.split()[0]}
V = FreeCAD.Vector

od, ht = CAP["od"].value, CAP["height"].value
plate, wall = CAP["plate"].value, CAP["wall"].value
bore = MOTOR["od"].value + 2 * CAP["reg_clear"].value
reg_od = bore + 2 * CAP["reg_wall"].value
depth = CAP["reg_depth"].value
hollow = ht - plate

shell = Part.makeCylinder(od / 2, ht).cut(Part.makeCylinder(od / 2 - wall, hollow))
ring = Part.makeCylinder(reg_od / 2, depth, V(0, 0, hollow - depth)).cut(
    Part.makeCylinder(bore / 2, depth, V(0, 0, hollow - depth)))
fused = shell.fuse(ring).removeSplitter()
assert len(fused.Solids) == 1
cap = fused.Solids[0]
out["volume_mm3"] = cap.Volume
out["Jzz_density1"] = cap.MatrixOfInertia.A33

with open(os.path.join(HERE, "out", "check.json")) as f:
    b3d = json.load(f)["cap"]
rho = 1.24e-3
out["mass_g"] = cap.Volume * rho
out["vs_build123d"] = {
    "volume_cm3": [cap.Volume / 1000, b3d["volume_cm3"]],
    "J_kgm2": [cap.MatrixOfInertia.A33 * rho * 1e-9, b3d["J_kgm2"]],
}
cap.exportStep(os.path.join(HERE, "out", "freecad-cap.step"))

# ── can TechDraw make a dimensioned page with no GUI? ─────────────────────────
td = {}
try:
    import TechDraw
    doc = FreeCAD.newDocument("probe")
    feat = doc.addObject("Part::Feature", "Cap")
    feat.Shape = cap
    page = doc.addObject("TechDraw::DrawPage", "Page")
    tpl = doc.addObject("TechDraw::DrawSVGTemplate", "Template")
    tdir = os.path.join(FreeCAD.getResourceDir(), "Mod", "TechDraw", "Templates")
    a4 = [t for t in os.listdir(tdir) if t.startswith("A4_Landscape")] if os.path.isdir(tdir) else []
    td["templates_found"] = a4[:3]
    if a4:
        tpl.Template = os.path.join(tdir, sorted(a4)[0])
    page.Template = tpl
    view = doc.addObject("TechDraw::DrawViewPart", "Front")
    view.Source = [feat]
    view.Direction = V(0, -1, 0)
    view.Scale = 2.0
    page.addView(view)
    doc.recompute()
    td["view_edges"] = len(view.getVisibleEdges()) if hasattr(view, "getVisibleEdges") else "n/a"
    dim = TechDraw.makeExtentDim(view, [], 0) if hasattr(TechDraw, "makeExtentDim") else None
    doc.recompute()
    td["extent_dim"] = None if dim is None else {"type": dim.TypeId, "value": getattr(dim, "Measurement", None) or dim.getRawValue() if hasattr(dim, "getRawValue") else None}
    dxf = os.path.join(HERE, "out", "freecad-page.dxf")
    TechDraw.writeDXFPage(page, dxf)
    td["dxf_bytes"] = os.path.getsize(dxf) if os.path.exists(dxf) else 0
    with open(dxf) as f:
        txt = f.read()
    td["dxf_has_dimension_entity"] = "DIMENSION" in txt
    td["dxf_has_text_80"] = "80" in txt
    td["svg_page_export"] = "needs TechDrawGui (exportPageAsSvg), absent in freecadcmd"
    try:
        import TechDrawGui  # noqa: F401
        td["svg_page_export"] = "TechDrawGui importable"
    except Exception as e:
        td["svg_page_export_error"] = str(e)
except Exception:
    td["error"] = traceback.format_exc(limit=3)
out["techdraw_headless"] = td

with open(os.path.join(HERE, "out", "freecad_probe.json"), "w") as f:
    json.dump(out, f, indent=1, default=str)
print(json.dumps(out, indent=1, default=str))
