"""
Blender, 2026-11-15: a first offline Cycles render of the keystone's blocking scene, timed, beside
the EEVEE clay pass it was blocked with.

  /opt/homebrew/bin/blender -b "Shop/Blender/tests/blocking/dramatic-lunge.blend" \
      -P "Shop/Blender/proofs/2026-11-15-cycles-piece/cycles_piece.py" -- [--samples 32] [--devices cpu,gpu]

Run from the palace root. It opens the saved .blend, puts the clay material back on the body,
and renders (1) EEVEE clay, (2) Cycles on the CPU, (3) Cycles on the GPU (Metal), each at the
blend's own 832x1216 camera, into renders/ beside this script. It never saves the .blend.
Timings go to measured.json. Written 2026-11-15. A maker who can do better another way does so,
and leaves the comparison on the scroll.
"""
import bpy, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "renders"); os.makedirs(OUT, exist_ok=True)
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SAMPLES = int(argv[argv.index("--samples") + 1]) if "--samples" in argv else 32
DEVICES = (argv[argv.index("--devices") + 1] if "--devices" in argv else "cpu,gpu").split(",")

scene = bpy.context.scene
body = bpy.data.objects["Body"]
m = bpy.data.materials.new("clay_cycles"); m.use_nodes = True
b = m.node_tree.nodes.get("Principled BSDF")
b.inputs["Base Color"].default_value = (0.64, 0.64, 0.66, 1); b.inputs["Roughness"].default_value = 0.5
body.data.materials.clear(); body.data.materials.append(m)
scene.render.image_settings.file_format = "PNG"

res = {"date": "2026-11-15", "blender": bpy.app.version_string, "blend": bpy.data.filepath and os.path.basename(bpy.data.filepath),
       "resolution": [scene.render.resolution_x, scene.render.resolution_y], "samples": SAMPLES, "renders": []}


def render(name, **info):
    scene.render.filepath = os.path.join(OUT, name)
    t0 = time.time(); bpy.ops.render.render(write_still=True); dt = round(time.time() - t0, 2)
    res["renders"].append(dict(out="renders/" + name, seconds=dt, **info)); print("RENDERED", name, dt, flush=True)


for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
    try:
        scene.render.engine = eng; break
    except TypeError:
        pass
render("eevee-clay.png", engine=scene.render.engine)

scene.render.engine = "CYCLES"
cy = scene.cycles
cy.samples = SAMPLES; cy.use_adaptive_sampling = True; cy.use_denoising = True
try:
    cy.denoiser = "OPENIMAGEDENOISE"
except TypeError:
    pass
scene.cycles.seed = 0

prefs = bpy.context.preferences.addons["cycles"].preferences
if "cpu" in DEVICES:
    cy.device = "CPU"
    render(f"cycles-cpu-{SAMPLES}spp.png", engine="CYCLES", device="CPU")
if "gpu" in DEVICES:
    try:
        prefs.compute_device_type = "METAL"; prefs.get_devices()
        names = []
        for d in prefs.devices:
            d.use = d.type == "METAL"
            if d.use: names.append(d.name)
        if names:
            cy.device = "GPU"
            render(f"cycles-gpu-{SAMPLES}spp.png", engine="CYCLES", device="GPU (Metal)", gpu=names)
        else:
            res["gpu_skipped"] = "no Metal device listed"
    except Exception as e:
        res["gpu_skipped"] = str(e)[:200]

json.dump(res, open(os.path.join(HERE, "measured.json"), "w"), indent=2)
print(json.dumps(res, indent=2))
