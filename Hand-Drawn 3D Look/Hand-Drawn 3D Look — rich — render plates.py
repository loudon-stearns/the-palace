"""
title: Hand-Drawn 3D Look — rich — render plates
born: 2026-11-03
links: [[Hand-Drawn 3D Look]] connects-to · rich-face workshop · [[BLUELINE]] re-runs · blender-handdrawn/scripts
forward_vector: I re-render, headless, the Blender plates two of the rich face's pieces test against: the city
  scene's line style with four knobs turned one at a time (sixteen corners; two of them are the catalogue's
  tentative #1 and confident #9), and the smoke plume with its boil on, off, again, held still, and one frame
  alone. I run BLUELINE's own scripts (cat_stills_lines.py, 03_motion.py) unchanged and only add switches.
  Every job runs in a fresh Blender, because Freestyle's Spatial Noise keeps state from one render to the
  next inside one Blender session (the finding the motion piece is about).

Run from the palace root, Blender 5.1.2, one job per Blender:
  B=/Applications/Blender.app/Contents/MacOS/Blender; P="Hand-Drawn 3D Look/Hand-Drawn 3D Look — rich — render plates.py"
  for j in plain c0n0s0p0 c0n0s0p1 ... c1n1s1p1; do $B -b --factory-startup -P "$P" -- line $OUT $j; done
  for j in on on2 off single5 single5_sn0 seq_sn0 twos1 twos2 twos3 twos4 twos5 ones; do $B -b --factory-startup -P "$P" -- boil $OUT $j; done
Writes RGBA PNGs under $OUT/lines/ and $OUT/boil/<job>/. "Hand-Drawn 3D Look — rich — make sheets.py" reads them.
"""
import bpy, os, sys

ROOT = os.getcwd()
PROOF = os.path.join(ROOT, "Projects/BLUELINE/proofs/blender-handdrawn/scripts")
args = sys.argv[sys.argv.index("--") + 1:]
MODE, OUT, JOB = args[0], args[1], args[2]


def load(script, marker, out_line):
    code = open(os.path.join(PROOF, script)).read().split(marker)[0]
    code = code.replace(out_line[0], out_line[1])
    g = {"__name__": "plates"}
    exec(code, g)
    return g


if MODE == "line":
    src = 'OUT = "/Users/loudonstearns/Documents/The Palace/Projects/BLUELINE/proofs/blender-handdrawn/catalog/lines"'
    folder = os.path.join(OUT, "lines")
    g = load("cat_stills_lines.py", "for name, params in VARIANTS:", (src, "OUT = %r" % folder))
    # the four knobs. c = chaining, n = noise, s = smoothing, p = pen. 0 is the tentative side, 1 the confident.
    CHAIN = {"0": dict(chaining="SKETCHY", rounds=3), "1": dict(chaining="PLAIN")}
    NOISE = {"0": dict(sp_amp=4.5, pn_amp=2.5), "1": dict(sp_amp=1.4)}
    SMOOTH = {"0": dict(), "1": dict(bezier_err=3.0)}
    PEN = {"0": dict(base=2.6, crease=130, calli=dict(min=0.6, max=4.5, orient=45)),
           "1": dict(base=3.2, crease=132, calli=dict(min=1.0, max=9, orient=38))}
    if JOB == "plain":                                  # catalogue #2: one line, nothing more
        params = dict(chaining="PLAIN", base=2.4, crease=130)
    else:
        c, n, s, p = JOB[1], JOB[3], JOB[5], JOB[7]
        params = {}
        for d in (CHAIN[c], NOISE[n], SMOOTH[s], PEN[p]):
            params.update(d)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = g["eevee"]()
    g["build_city"]()
    g["line_style"](**params)
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    sc.render.resolution_x, sc.render.resolution_y = g["RES"]
    sc.eevee.taa_render_samples = 24
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = os.path.join(folder, f"{JOB}.png")
    bpy.ops.render.render(write_still=True)
    print("  wrote", JOB, params)

elif MODE == "boil":
    src = 'OUT = "/Users/loudonstearns/Documents/The Palace/Projects/BLUELINE/proofs/blender-handdrawn/motion"'
    g = load("03_motion.py", "# ----------------------------------------------------------------- run",
             (src, "OUT = %r" % os.path.join(OUT, "boil")))
    add_boil = g["add_boil"]
    held = {}
    boil = JOB in ("on", "on2", "single5", "single5_sn0", "seq_sn0")
    g["add_boil"] = add_boil if boil else (lambda st: held.__setitem__("st", st))
    g["wipe"](); g["scene_smoke"]()
    sc = bpy.context.scene
    sc.render.engine = g["eevee_engine"]()
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    sc.render.resolution_x, sc.render.resolution_y = g["RES"]
    sc.eevee.taa_render_samples = 16
    sc.render.image_settings.file_format = "PNG"
    folder = os.path.join(OUT, "boil", JOB); os.makedirs(folder, exist_ok=True)
    if JOB.endswith("sn0"):                             # the fix: Spatial Noise off, Perlin boil kept
        for ls in bpy.data.linestyles:
            for gm in ls.geometry_modifiers:
                if gm.type == "SPATIAL_NOISE":
                    gm.amplitude = 0.0
    if JOB in ("on", "on2", "off", "seq_sn0"):          # the clip as the proof renders it, frames 1..12
        sc.frame_start = 1; sc.frame_end = 6 if JOB == "seq_sn0" else 12
        sc.render.filepath = os.path.join(folder, "frame_")
        bpy.ops.render.render(animation=True)
    elif JOB.startswith("single5"):                     # frame 5, alone, in a fresh Blender
        sc.frame_start = 5; sc.frame_end = 5
        sc.render.filepath = os.path.join(folder, "frame_")
        bpy.ops.render.render(animation=True)
    elif JOB.startswith("twos"):                        # the plume held at frame 1, the Perlin seed set by hand
        seed = int(JOB[4:])
        sc.frame_set(1)
        for gm in held["st"].geometry_modifiers:
            if gm.type == "PERLIN_NOISE_1D":
                gm.seed = seed
        sc.render.filepath = os.path.join(folder, "still.png")
        bpy.ops.render.render(write_still=True)
    elif JOB == "ones":                                 # the plume held at frame 1, nothing changed, rendered 5 times
        sc.frame_set(1)
        for i in range(1, 6):
            sc.render.filepath = os.path.join(folder, f"render_{i}.png")
            bpy.ops.render.render(write_still=True)
    print("  rendered", JOB, "boil handlers", len(bpy.app.handlers.frame_change_pre))
