"""Build the Haptic Handwheel probe drawings and models.

    .venvs/cad/bin/python build.py        (from this folder; the venv is the worktree's own)

Writes out/: one SVG sheet and a PNG preview per part, STEP for every part,
and STL only for a part whose every mating dimension is known. Before any
dimension is labelled, the model is measured and compared with
handwheel_dims.py; a mismatch stops the build. out/check.json keeps the list.
"""
import json
import math
import os
import subprocess
import tempfile
import time

from build123d import GeomType, Pos, export_step, export_stl, import_step, Compound

import handwheel_parts as hp
from drawing import Sheet, View, fmt, tol_text
from handwheel_dims import CAP, LADDER, LADDER_CLEARS, MOTOR, PLA_DENSITY, GM5208_READ

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
CHECKS = []


# ── measuring the solid ───────────────────────────────────────────────────────
def radii(solid):
    return sorted({round(e.radius, 6) for e in solid.edges() if e.geom_type == GeomType.CIRCLE})


def levels(solid):
    return sorted({round(f.center().Z, 6) for f in solid.faces()
                   if f.geom_type == GeomType.PLANE and abs(abs(f.normal_at().Z) - 1) < 1e-9})


def expect(part, what, measured, spec):
    ok = abs(measured - spec) < 1e-6
    CHECKS.append(dict(part=part, what=what, measured=round(measured, 6), spec=spec, ok=ok))
    if not ok:
        raise SystemExit(f"{part}: {what} measures {measured}, the source says {spec}")
    return measured


def mass_props(solid):
    """Volume, mass and axial inertia at the assumed density (uniform, i.e. 100 % infill)."""
    rho = PLA_DENSITY.value * 1e-3                      # g/mm³
    vol = solid.volume                                  # mm³
    jzz = solid.matrix_of_inertia[2][2] * rho           # g·mm²
    m = vol * rho
    return dict(volume_cm3=vol / 1000, mass_g=m, J_kgm2=jzz * 1e-9,
                r_eff_mm=math.sqrt(2 * jzz / m))


def stl_volume(path):
    """Signed volume of a binary STL, summed over its triangles (divergence theorem)."""
    import numpy as np      # here, not at the top: see finish()
    with open(path, "rb") as f:
        f.seek(80)
        n = int(np.frombuffer(f.read(4), "<u4")[0])
        rec = np.frombuffer(f.read(50 * n), np.dtype([("n", "<f4", 3), ("v", "<f4", (3, 3)), ("a", "<u2")]))
    a, b, c = (rec["v"][:, i].astype(float) for i in range(3))
    return float(np.einsum("ij,ij->i", a, np.cross(b, c)).sum() / 6)


def readback(shape, step, stl=None):
    """Read the written files back: the STEP must hold the same solid, the STL
    the same volume to within its tessellation (0.5 %)."""
    v = shape.volume
    files = [(step, import_step(step).volume, 1e-9, "STEP volume")]
    if stl:
        files.append((stl, stl_volume(stl), 0.005, "STL volume within 0.5 %"))
    for path, got, rel, what in files:
        ok = abs(got - v) <= rel * v
        CHECKS.append(dict(part=os.path.basename(path), what=what, measured=round(got, 3),
                           spec=round(v, 3), ok=ok))
        if not ok:
            raise SystemExit(f"{path}: volume {got} read back, the model has {v}")


CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def finish(sheet, name):
    """Write the SVG, and a PNG preview through headless Chrome.

    ImageMagick's own SVG renderer drops <line> and <circle>, so it draws a
    sheet with no outlines; Chrome draws what a browser or Obsidian will.
    """
    svg = os.path.join(OUT, f"{name}.svg")
    sheet.write(svg)
    if os.path.exists(CHROME):
        png = os.path.join(OUT, name + ".png")
        if os.path.exists(png):
            os.remove(png)
        # Chrome writes the screenshot, then can linger on shutdown while other
        # headless browsers load the machine: wait for the file, then close it.
        with tempfile.TemporaryDirectory() as profile:
            proc = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                                     "--no-first-run", "--disable-component-update",
                                     "--disable-background-networking", f"--user-data-dir={profile}",
                                     "--window-size=1123,794", "--force-device-scale-factor=1.6",
                                     f"--screenshot={png}", "file://" + svg],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            size, deadline = -1, time.time() + 90
            while time.time() < deadline and proc.poll() is None:
                time.sleep(0.5)
                now = os.path.getsize(png) if os.path.exists(png) else -1
                if now > 0 and now == size:
                    break
                size = now
            proc.terminate()
            proc.wait(10)
        if not os.path.exists(png):
            print("no preview for", name)
    print("wrote", os.path.relpath(svg, HERE))


def section_label(sh, x, y, text, scale):
    sh.text(f"{text}   {scale}", x, y, 3.0)


# ── sheet 0: the motor as its datasheet gives it ─────────────────────────────
def motor_sheet():
    m = hp.motor()
    od, h = MOTOR["od"], MOTOR["height"]
    s_od, s_id = MOTOR["shaft_od"], MOTOR["shaft_id"]
    r = radii(m)
    expect("motor", "outer radius", r[-1], od.value / 2)
    expect("motor", "shaft outer radius", r[1], s_od.value / 2)
    expect("motor", "shaft inner radius", r[0], s_id.value / 2)
    z = levels(m)
    expect("motor", "height", z[-1] - z[0], h.value)

    sh = Sheet()
    v = View(100, 105, 2.0)                                     # side view, 2:1
    sh.project(m, (0, -500, 0), (0, 0, 1), v)
    sh.centerline(v.p(0, -4), v.p(0, h.value + 4))
    top = h.value
    sh.dim(v.p(-s_id.value / 2, top), v.p(s_id.value / 2, top), -8,
           f"Ø{fmt(s_id.value)}", "DATASHEET", s_id.tol)
    sh.dim(v.p(-s_od.value / 2, top), v.p(s_od.value / 2, top), -18,
           f"Ø{fmt(s_od.value)}", "DATASHEET", s_od.tol)
    sh.dim(v.p(-od.value / 2, top), v.p(od.value / 2, top), -28,
           f"Ø{fmt(od.value)}", "DATASHEET", od.tol)
    sh.dim(v.p(od.value / 2, 0), v.p(od.value / 2, top), 10,
           f"{fmt(h.value)}", "DATASHEET", h.tol)
    section_label(sh, 52, 88, "SIDE  (shaft hidden, drawn flush and through)", "2:1")

    w = View(243, 150, 1.0)                                     # from above, 1:1
    sh.project(m, (0, 0, 500), (0, 1, 0), w)
    sh.centerline(w.p(-38, 0), w.p(38, 0))
    sh.centerline(w.p(0, -38), w.p(0, 38))
    sh.text("FROM ABOVE   1:1", 214, 108, 3.0)
    sh.text("print at 100 % to set the motor on it", 214, 104, 2.2)

    y = sh.lines(["THE PAGE GIVES", f"mass {fmt(MOTOR['mass_g'].value)} g ±0.5 · runout ≤ {fmt(MOTOR['runout'].value)}",
                  f"read {GM5208_READ}, iFlight GM5208-12 page"], 17, 78, 2.5)
    rows = [("THE PAGE DOES NOT GIVE  (MEASURE)", "hold")]
    rows += [("· " + d.note, "hold") for d in MOTOR.values() if not d.known]
    y = sh.lines(rows, 17, y - 3, 2.5)
    sh.lines(["An envelope for fitting parts to, not the motor: where the rotor",
              "ends, the bolt holes and the shaft's ends are not drawn because",
              "nobody has measured them."], 17, y - 3, 2.5)
    sh.legend(17, 24)
    sh.title_block("GM5208-12 MOTOR · REFERENCE", "Haptic Handwheel · PARTS.md row 1 · from its datasheet",
                   "HH-MOT-00", "2:1 · 1:1", "REFERENCE · bolt patterns not given",
                   "handwheel_dims.py MOTOR")
    finish(sh, "HH-MOT-00 motor reference")
    step = os.path.join(OUT, "HH-MOT-00 motor envelope.step")
    export_step(m, step)
    readback(m, step)


# ── sheet 1: the light cap ───────────────────────────────────────────────────
def cap_sheet():
    c = hp.cap()
    od, ht, plate, wall = (CAP[k].value for k in ("od", "height", "plate", "wall"))
    bore = MOTOR["od"].value + 2 * CAP["reg_clear"].value
    reg_od = bore + 2 * CAP["reg_wall"].value
    depth = CAP["reg_depth"].value
    r = radii(c)
    expect("cap", "outer radius", r[3], od / 2)
    expect("cap", "skirt inner radius", r[2], od / 2 - wall)
    expect("cap", "register outer radius", r[1], reg_od / 2)
    expect("cap", "register bore radius", r[0], bore / 2)
    z = levels(c)
    expect("cap", "height", z[-1], ht)
    expect("cap", "plate underside", z[2], ht - plate)
    expect("cap", "register bottom", z[1], ht - plate - depth)
    mp = mass_props(c)

    sh = Sheet()
    v = View(95, 125, 2.0)                                      # section on the axis, 2:1
    sh.section_xz(c, v)
    sh.centerline(v.p(0, -3), v.p(0, ht + 3))
    sh.dim(v.p(-od / 2, ht), v.p(od / 2, ht), -10, f"Ø{fmt(od)}")
    zr = ht - plate - depth
    sh.dim(v.p(-bore / 2, zr), v.p(bore / 2, zr), 2 * zr + 8, f"Ø{fmt(bore)}")
    sh.dim(v.p(-reg_od / 2, zr), v.p(reg_od / 2, zr), 2 * zr + 17, f"Ø{fmt(reg_od)}")
    sh.dim(v.p(-(od / 2 - wall), 0), v.p(od / 2 - wall, 0), 26, f"Ø{fmt(od - 2 * wall)}")
    sh.dim(v.p(od / 2, 0), v.p(od / 2, ht), 13, fmt(ht))
    sh.marker(v.p(35, ht / 2), 17, "B")
    section_label(sh, 40, 86, "SECTION ON THE AXIS", "2:1")

    d = View(55, 108, 5.0)                                      # detail B, 5:1
    sh.section_xz(c, d, clip=(29.0, 41.0))
    sh.dim(d.p(od / 2 - wall, 0), d.p(od / 2, 0), 8, fmt(wall))
    sh.dim(d.p(bore / 2, zr), d.p(reg_od / 2, zr), 5 * zr + 8, fmt(CAP["reg_wall"].value),
           text_at="start")
    sh.dim(d.p(od / 2, ht - plate), d.p(od / 2, ht), 8, fmt(plate))
    sh.dim(d.p(bore / 2, zr), d.p(bore / 2, ht - plate), -7, fmt(depth))
    section_label(sh, 205, 88, "DETAIL B", "5:1")

    y = sh.lines([
        "1  Light cap for the GM5208-12. A probe stand-in: the look is",
        "   Loudon's call. Changing a number in handwheel_dims.py redraws it.",
        "2  Centres on the rotor's outside, Ø63 ±0.05 on the page (runout",
        "   ≤ 0.1): the bore is Ø63 + 2 × 0.2. The fit ladder, HH-LAD-01,",
        "   picks the real clearance.",
        ("3  HOLD: the bolt holes. The rotor-top pattern is not on the page.", "hold"),
        ("   No STL until someone measures it.", "hold"),
        "4  As the bench's disc, print it at 100 % infill and weigh it.",
    ], 17, 78, 2.5)
    sh.legend(17, 24)

    tx, ty = 157, 82
    sh.lines([
        "SOLID, PLA 1.24 g/cm³ (assumed: weigh it)",
        f"volume {mp['volume_cm3']:.2f} cm³   mass {mp['mass_g']:.1f} g",
        f"axial inertia J = {mp['J_kgm2']:.3e} kg·m²",
        f"½·m·r² at r 40 mm = {0.5 * mp['mass_g'] * 1e-3 * 0.04 ** 2:.3e}  (×{mp['J_kgm2'] / (0.5 * mp['mass_g'] * 1e-3 * 0.04 ** 2):.3f})",
        f"so bench_analyze --disc-radius {mp['r_eff_mm'] / 1000:.4f}",
    ], tx, ty, 2.5)
    sh.title_block("HAPTIC HANDWHEEL · LIGHT CAP", "PARTS.md row 7 · registers on the rotor OD",
                   "HH-CAP-01", "2:1 · 5:1", "SKETCH · HOLD: bolt pattern unmeasured",
                   "handwheel_dims.py CAP")
    finish(sh, "HH-CAP-01 light cap")
    step = os.path.join(OUT, "HH-CAP-01 light cap.step")
    export_step(c, step)
    readback(c, step)
    print("STL withheld for HH-CAP-01: the rotor bolt pattern is MEASURE")
    return mp


# ── sheet 2: the fit ladder ──────────────────────────────────────────────────
def ladder_sheet():
    rings = hp.ladder()
    h, wall = LADDER["height"].value, LADDER["wall"].value
    sh = Sheet()
    rows = []
    for i, (ring, c) in enumerate(zip(rings, LADDER_CLEARS)):
        bore = MOTOR["od"].value + 2 * c
        rr = radii(ring)
        expect(f"ring {i + 1}", "bore radius", rr[0], bore / 2)
        expect(f"ring {i + 1}", "outer radius", rr[-1], bore / 2 + wall)
        expect(f"ring {i + 1}", "height", levels(ring)[-1], h)
        w = View(62 + i * 86, 140, 1.0)
        sh.project(ring, (0, 0, 500), (0, 1, 0), w)
        sh.centerline(w.p(-38, 0), w.p(38, 0))
        sh.centerline(w.p(0, -38), w.p(0, 38))
        sh.diameter(w.p(0, 0), bore / 2, f"Ø{fmt(bore)}")
        sh.text(f"ring {i + 1}: {i + 1} notch{'es' if i else ''} · {fmt(c)} a side", w.x0 - 26, 96, 2.5)
        rows.append(f"{i + 1}  {i + 1} notch{'es' if i else '  '}  {fmt(c):<4}  Ø{fmt(bore):<6} Ø{fmt(bore + 2 * wall)}")
        ring_at = Pos(i * 75, 0, 0) * ring
        rings[i] = ring_at
    sh.text("FROM ABOVE   1:1     each ring is 4 tall, 2 wall; the notches are 1 deep", 17, 186, 3.0)
    y = sh.lines(["ring  notches  a side  bore     outside"] + rows, 17, 78, 2.5)
    sh.lines([
        "Push each ring onto the motor's rotor by hand. Keep the tightest",
        "that still slides on and does not rock; write its clearance into",
        "CAP reg_clear in handwheel_dims.py, and the cap redraws.",
        "The bore rests on Ø63 ±0.05 from the page; printers shrink holes,",
        "which is why this is three rings and not one number.",
    ], 17, y - 3, 2.5)
    sh.legend(17, 24)
    sh.title_block("HAPTIC HANDWHEEL · FIT LADDER", "three register rings: the calipers' question, asked of the printer",
                   "HH-LAD-01", "1:1", "SKETCH · printable", "handwheel_dims.py LADDER")
    finish(sh, "HH-LAD-01 fit ladder")
    both = Compound(rings)
    step, stl = (os.path.join(OUT, f"HH-LAD-01 fit ladder.{x}") for x in ("step", "stl"))
    export_step(both, step)
    export_stl(both, stl, tolerance=0.005, angular_tolerance=0.05)
    readback(both, step, stl)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    motor_sheet()
    mp = cap_sheet()
    ladder_sheet()
    with open(os.path.join(OUT, "check.json"), "w") as f:
        json.dump(dict(checks=CHECKS, cap=mp), f, indent=1)
    print(f"{sum(c['ok'] for c in CHECKS)}/{len(CHECKS)} checks: model = source, files = model")
