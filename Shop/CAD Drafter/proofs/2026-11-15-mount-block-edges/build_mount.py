"""CAD Drafter test, 2026-11-15: the first prismatic part, and two edge cases.

    ~/.venvs/cad/bin/python "Shop/CAD Drafter/proofs/2026-11-15-mount-block-edges/build_mount.py"   (from the palace root)

It reuses the 2026-11-14 card check's sheet and numbers (drawing.py, handwheel_dims.py,
handwheel_parts.py) by path, so it tests the Drafter as it stands, not a copy of it.

1. HH-MNT-01, a mount block: a flat plate with a through-bore for the hollow shaft and
   four bench screw holes, every number DESIGN. The motor's base bolt pattern is MEASURE
   (not on the iFlight page), so the sheet carries it as a HOLD, the block gets no motor
   holes and no STL: the Drafter's own rule, tried on a part with holes and flats.
2. Zero and negative clearance: a fit-ladder ring at 0.00 and at -0.05 a side. Does
   anything in the build refuse? A guard here says what one would say.
3. An overflowing view: the block's top view at 3:1 on the A4 sheet. Does drawing.py
   notice? A bounding-box check here says where it runs over.

Writes out/ (SVG sheets, PNG previews through chrome-headless-shell from puppeteer's cache,
STEP), and measured.json beside this file. A maker who can draw this better another way
does so, and leaves the comparison on the scroll.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
CARD = HERE.parent / "2026-11-14-card-check"
sys.path.insert(0, str(CARD))

from build123d import Box, Cylinder, Pos, Align, GeomType, export_step, import_step  # noqa: E402
import handwheel_parts as hp                                                        # noqa: E402
from drawing import Sheet, View, fmt                                                # noqa: E402
from handwheel_dims import Dim, MOTOR, GM5208_READ                                  # noqa: E402

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "out"
STAMP = "2026-11-15T00:00:00"
BOTTOM = (Align.CENTER, Align.CENTER, Align.MIN)

# ── the mount block's numbers: all DESIGN, chosen for this test ──────────────
MOUNT = {
    "side": Dim(80.0, "DESIGN", "square plate, side"),
    "thick": Dim(8.0, "DESIGN", "plate thickness"),
    "bore": Dim(16.0, "DESIGN", "through-bore: the Ø15 hollow shaft + 0.5 a side"),
    "screw": Dim(4.5, "DESIGN", "bench screw clearance, M4"),
    "pitch": Dim(66.0, "DESIGN", "bench screw square, centre to centre"),
}
MOTOR_BASE = MOTOR["stator_bolts"]          # MEASURE: None


def mount_block():
    s, t = MOUNT["side"].value, MOUNT["thick"].value
    b = Box(s, s, t, align=BOTTOM) - Cylinder(MOUNT["bore"].value / 2, t, align=BOTTOM)
    h = MOUNT["pitch"].value / 2
    for x in (-h, h):
        for y in (-h, h):
            b -= Pos(x, y, 0) * Cylinder(MOUNT["screw"].value / 2, t, align=BOTTOM)
    return b


CHECKS = []


def expect(what, measured, spec):
    ok = abs(measured - spec) < 1e-6
    CHECKS.append(dict(what=what, measured=round(measured, 6), spec=spec, ok=ok))
    if not ok:
        raise SystemExit(f"{what} measures {measured}, the source says {spec}")


def circles(solid):
    return sorted((round(e.radius, 6), round(e.arc_center.X, 6), round(e.arc_center.Y, 6))
                  for e in solid.edges() if e.geom_type == GeomType.CIRCLE)


# ── the overflow check drawing.py does not have ──────────────────────────────
def overflow(sheet):
    """Every drawn shape's box and every label's estimated box, against the frame's inside
    and the title block. Text width is the monospace advance (0.6 em) times its length."""
    m, W, H = Sheet.M, Sheet.W, Sheet.H
    frame = (m, m, W - m, H - m)
    tb = (W - m - 130, m, W - m, m + 36)
    hits = []
    for layer, shapes in sheet.layers.items():
        if layer in ("paper", "frame"):
            continue
        for s in shapes:
            bb = s.bounding_box()
            box = (bb.min.X, bb.min.Y, bb.max.X, bb.max.Y)
            if box[0] < frame[0] - 0.01 or box[1] < frame[1] - 0.01 or box[2] > frame[2] + 0.01 or box[3] > frame[3] + 0.01:
                hits.append(dict(kind="shape", layer=layer, box=[round(v, 2) for v in box], why="outside the frame"))
            elif box[2] > tb[0] and box[3] > tb[1] and box[0] < tb[2] and box[1] < tb[3] and layer != "frame":
                hits.append(dict(kind="shape", layer=layer, box=[round(v, 2) for v in box], why="over the title block"))
    for t in sheet.texts:
        w = 0.6 * t["size"] * len(t["s"])
        x0 = t["x"] - (w / 2 if t["anchor"] == "middle" else w if t["anchor"] == "end" else 0)
        if abs(t["rot"]) < 1e-9 and (x0 < frame[0] or x0 + w > frame[2]):
            hits.append(dict(kind="text", text=t["s"][:40], x=[round(x0, 1), round(x0 + w, 1)], why="outside the frame"))
    return hits


SHELL = next(Path.home().glob(".cache/puppeteer/chrome-headless-shell/*/chrome-headless-shell-*/chrome-headless-shell"), None)


def preview(svg):
    """PNG through chrome-headless-shell (puppeteer's, not the desktop Chrome)."""
    if not SHELL:
        return None
    png = svg.with_suffix(".png")
    with tempfile.TemporaryDirectory() as prof:
        subprocess.run([str(SHELL), "--headless", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={prof}",
                        "--window-size=1123,794", "--force-device-scale-factor=1", f"--screenshot={png}",
                        svg.as_uri()], capture_output=True, timeout=90)
    return png.name if png.exists() else None


def sheet_for(block, scale, x0, y0, number, status):
    sh = Sheet()
    s, t = MOUNT["side"].value, MOUNT["thick"].value
    v = View(x0, y0, scale)
    sh.project(block, (0, 0, 500), (0, 1, 0), v)
    sh.centerline(v.p(-s / 2 - 4, 0), v.p(s / 2 + 4, 0))
    sh.centerline(v.p(0, -s / 2 - 4), v.p(0, s / 2 + 4))
    h = MOUNT["pitch"].value / 2
    sh.dim(v.p(-s / 2, s / 2), v.p(s / 2, s / 2), -8, f"{fmt(s)}")
    sh.dim(v.p(s / 2, -s / 2), v.p(s / 2, s / 2), 8, f"{fmt(s)}")
    sh.dim(v.p(-h, -s / 2), v.p(h, -s / 2), 8, f"{fmt(2 * h)}")
    sh.diameter(v.p(0, 0), MOUNT["bore"].value / 2 * scale, f"Ø{fmt(MOUNT['bore'].value)}")
    sh.diameter(v.p(h, h), MOUNT["screw"].value / 2 * scale, f"4× Ø{fmt(MOUNT['screw'].value)}", angle=45)
    sh.text(f"FROM ABOVE   {fmt(scale)}:1", x0 - s / 2 * scale, y0 + s / 2 * scale + 14, 3.0)
    return sh, v


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    rep = dict(build123d=__import__("build123d").__version__)
    # 1 ── the mount block
    t0 = time.time()
    blk = mount_block()
    c = circles(blk)
    bore = [r for r in c if r[1] == 0 and r[2] == 0]
    screws = [r for r in c if abs(abs(r[1]) - MOUNT["pitch"].value / 2) < 1e-6]
    expect("bore radius", bore[0][0], MOUNT["bore"].value / 2)
    expect("screw holes found (2 circles each)", len(screws), 8)
    expect("screw radius", screws[0][0], MOUNT["screw"].value / 2)
    bb = blk.bounding_box()
    expect("side", bb.max.X - bb.min.X, MOUNT["side"].value)
    expect("thickness", bb.max.Z - bb.min.Z, MOUNT["thick"].value)
    sh, v = sheet_for(blk, 1.0, 72, 125, "HH-MNT-01", "")
    sec = View(205, 150, 1.0)
    sh.section_xz(blk, sec)
    sh.dim(sec.p(MOUNT["side"].value / 2, 0), sec.p(MOUNT["side"].value / 2, MOUNT["thick"].value), 8,
           fmt(MOUNT["thick"].value))
    sh.text("SECTION ON THE AXIS   1:1", 165, 140, 3.0)
    y = sh.lines([
        "1  A flat plate under the GM5208-12. Every number here is DESIGN,",
        "   chosen for this test; change it in build_mount.py and it redraws.",
        "2  The bore passes the Ø15 hollow shaft (DATASHEET) with 0.5 a side.",
        ("3  HOLD: the motor's base bolt pattern is not on the iFlight page", "hold"),
        (f"   (read {GM5208_READ}). No motor holes, no STL, until it is measured.", "hold"),
        "4  The four Ø4.5 holes fix the plate to the bench; M4 clearance.",
    ], 17, 70, 2.5)
    sh.legend(17, 24)
    sh.title_block("HAPTIC HANDWHEEL · MOUNT BLOCK", "a flat plate: bore, four bench holes, motor holes on HOLD",
                   "HH-MNT-01", "1:1", "SKETCH · HOLD: base bolt pattern unmeasured", "build_mount.py MOUNT",
                   date="2026-11-15")
    svg = OUT / "hh-mnt-01-mount-block.svg"
    sh.write(str(svg))
    step = OUT / "hh-mnt-01-mount-block.step"
    export_step(blk, str(step), timestamp=STAMP)
    back = import_step(str(step)).volume
    expect("STEP volume read back", back, round(blk.volume, 6)) if abs(back - blk.volume) > 1e-6 else CHECKS.append(
        dict(what="STEP volume read back", measured=round(back, 3), spec=round(blk.volume, 3), ok=True))
    rep["mount_block"] = dict(seconds_model_sheet_step=round(time.time() - t0, 2), volume_mm3=round(blk.volume, 3),
                              mass_g_at_1_24=round(blk.volume * 1.24e-3, 1), stl_written=False,
                              stl_withheld_because="MOTOR stator_bolts is MEASURE (None)",
                              motor_base_pattern_known=MOTOR_BASE.known, overflow=overflow(sh))
    # 2 ── zero and negative clearance
    edge = {}
    for clear in (0.0, -0.05):
        t1 = time.time()
        try:
            ring = hp.ladder_ring(clear)
            r = sorted({round(e.radius, 6) for e in ring.edges() if e.geom_type == GeomType.CIRCLE})
            built = dict(built=True, bore_d=round(2 * r[0], 4), motor_od=MOTOR["od"].value, notches=round(clear / 0.1),
                         volume_mm3=round(ring.volume, 3))
        except Exception as e:                                   # noqa: BLE001
            built = dict(built=False, error=str(e)[:200])
        tol_lo = MOTOR["od"].tol[1]                                # the rotor may be +0.05 over Ø63
        built["guard_says"] = ("HOLD: interference, the bore is under the rotor's nominal OD" if clear < 0 else
                               f"HOLD: zero clearance; the rotor may be up to +{tol_lo} over nominal, so this can bind"
                               if clear <= tol_lo else "ok")
        built["refused_by_the_drafter"] = False if built.get("built") else True
        built["seconds"] = round(time.time() - t1, 2)
        edge[f"{clear:+.2f}"] = built
    rep["clearance_edges"] = edge
    # 3 ── the overflowing view
    t2 = time.time()
    big, _ = sheet_for(blk, 3.0, 150, 105, "HH-MNT-01", "")
    big.title_block("EDGE TEST · VIEW AT 3:1", "a view too big for A4, to see whether the Drafter notices",
                    "EDGE-OVF", "3:1", "SKETCH · HOLD: overflow test, not a drawing", "build_mount.py", date="2026-11-15")
    osvg = OUT / "edge-overflow-3to1.svg"
    big.write(str(osvg))                                          # drawing.py writes it without a word
    hits = overflow(big)
    rep["overflow_edge"] = dict(seconds=round(time.time() - t2, 2), drawing_py_raised=False,
                                hits=len(hits), shape_hits=sum(h["kind"] == "shape" for h in hits),
                                text_hits=sum(h["kind"] == "text" for h in hits), first=hits[:6])
    rep["overflow_edge"]["svg_size"] = svg_size(osvg)
    rep["mount_block"]["svg_size"] = svg_size(svg)
    rep["previews"] = [preview(svg), preview(osvg)]
    rep["checks"] = CHECKS
    return rep


def svg_size(p):
    """The sheet's own width and height: an A4 sheet says 297.0mm x 210.0mm. ExportSVG grows
    the canvas to whatever was drawn, so a view that runs over makes the sheet bigger."""
    import re
    head = Path(p).read_text()[:300]
    return re.search(r'width="([^"]+)" height="([^"]+)"', head).groups()


def digest(d):
    return {p.name: hashlib.sha256(p.read_bytes()).hexdigest()[:16] for p in sorted(d.glob("*")) if p.suffix in (".svg", ".step")}


if __name__ == "__main__":
    if len(sys.argv) > 1:                                         # a rerun into another folder
        build(); sys.exit(0)
    t = time.time()
    rep = build()
    rep["seconds_total"] = round(time.time() - t, 2)
    with tempfile.TemporaryDirectory() as tmp:
        t = time.time()
        subprocess.run([sys.executable, __file__, tmp], check=True, capture_output=True)
        rep["seconds_rerun"] = round(time.time() - t, 2)
        a, b = digest(OUT), digest(Path(tmp))
        rep["byte_identical_on_rerun"] = {k: a[k] == b.get(k) for k in a}
    rep["files"] = {p.name: p.stat().st_size for p in sorted(OUT.glob("*"))}
    (HERE / "measured.json").write_text(json.dumps(rep, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps({k: rep[k] for k in ("mount_block", "clearance_edges", "overflow_edge", "byte_identical_on_rerun",
                                         "seconds_total", "seconds_rerun", "previews")}, indent=1, ensure_ascii=False)[:4000])
    print(f"{sum(c['ok'] for c in CHECKS)}/{len(CHECKS)} checks")
