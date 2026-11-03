"""
title: Remnants in Depth — rich — render plates
born: 2026-11-03
links: [[Remnants in Depth]] connects-to · rich-face workshop · [[BLUELINE]] re-runs · blender-handdrawn/scripts/blob_swarm.py
forward_vector: I re-render, headless, the plates two of the rich face's pieces test against. For "the trick":
  one BLUELINE ink mark made two ways, as a metaball fitted to the mark and as a card wearing blob_swarm.py's own
  billboard material, orbited from 0 to 90 degrees; and the same card at two depths under a sideways truck. For
  "the clean composite": BLUELINE's own street, camera, Freestyle line style, billboard material and two-layer
  compositor from blob_swarm.py, with one billboard over a building's edge and one behind a building, rendered
  with each fix on and off. I run blob_swarm.py's own functions unchanged and only add switches.

Run from the palace root, Blender 5.1.2:
  B=/Applications/Blender.app/Contents/MacOS/Blender; P="Remnants in Depth/Remnants in Depth — rich — render plates.py"
  $B -b --factory-startup -P "$P" -- orbit $OUT
  for j in ref L1_blend L1_dith L2_blend L2_dith L2_blend_raw L2_blend_repeat L2_blend_raw_repeat inkA quadA inkB quadB truthB; do $B -b --factory-startup -P "$P" -- comp $OUT $j; done
Writes PNGs under $OUT/orbit/ and $OUT/comp/. "Remnants in Depth — rich — make sheets.py" reads them.
Each comp job runs in a fresh Blender, as the Hand-Drawn 3D Look plates did (Freestyle can keep state between
renders in one session); this line style has no Spatial Noise, so it should not matter, but it costs nothing.
"""
import bpy, os, sys, json, math

ROOT = os.getcwd()
PROOF = os.path.join(ROOT, "Projects/BLUELINE/proofs/blender-handdrawn/scripts/blob_swarm.py")
MARK = os.path.join(ROOT, "Projects/BLUELINE/proofs/blender-handdrawn/followups/flowfield-spatter/synth/synth_001.png")
BALLS = os.path.join(ROOT, "Remnants in Depth/sheets/mark-balls.json")
args = sys.argv[sys.argv.index("--") + 1:]
MODE, OUT = args[0], args[1]
JOB = args[2] if len(args) > 2 else ""

# blob_swarm.py up to its build block: the scene, camera, billboard material, Freestyle setup and the two-layer
# compositor, unchanged. Its one assert names the extracted library, which the functions used here never read.
code = open(PROOF).read().split("# ---- build ----")[0]
code = code.replace('assert EXTRACT, "run blob_analyze.py first (no mattes in blob-library/)"', "pass")
G = {"__name__": "plates"}
exec(code, G)
sc = bpy.context.scene


def render(path):
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def emission_mat(name, rgb):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*rgb, 1)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return m


def set_blended(m):
    """The fix the page says not to use: the same billboard material, but BLENDED instead of DITHERED."""
    for attr, val in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND")):
        try: setattr(m, attr, val)
        except Exception: pass


def unthreshold(m, extension=None):
    """Undo blob_swarm's two edge guards, to find which one keeps BLENDED clean: feed the texture's raw alpha
    to the mix (no GREATER_THAN 0.45), and optionally let the texture repeat past its border."""
    nt = m.node_tree
    tex = next(n for n in nt.nodes if n.bl_idname == "ShaderNodeTexImage")
    mix = next(n for n in nt.nodes if n.bl_idname == "ShaderNodeMixShader")
    nt.links.new(tex.outputs["Alpha"], mix.inputs["Fac"])
    if extension: tex.extension = extension


def card(name, size, loc, mat, face_cam=None, rot=None):
    """A billboard as blob_swarm.add_blob makes one: a unit plane, the mark's material, COPY_ROTATION to the camera."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    p = bpy.context.active_object; p.name = name
    p.data.materials.append(mat)
    p.scale = (size, size, size)
    if face_cam is not None:
        con = p.constraints.new("COPY_ROTATION"); con.target = face_cam
    elif rot is not None:
        p.rotation_euler = rot
    return p


# ---------------------------------------------------------------- the trick: one mark, two ways, orbited
if MODE == "orbit":
    od = os.path.join(OUT, "orbit"); os.makedirs(od, exist_ok=True)
    W = 512; LENS = 50.0; D = 10.0; FRAME = D * 36.0 / LENS            # world width the frame spans at the mark
    sc.render.engine = G["eevee"]()
    try: sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    except Exception: pass
    try: sc.eevee.taa_render_samples = 32
    except Exception: pass
    sc.render.resolution_x = sc.render.resolution_y = W
    sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
    G["set_world"](1.0)

    # the metaball: one element per disc fitted to the mark (make sheets.py fit), centres on the mark's plane
    bl = json.load(open(BALLS)); iw, ih = bl["size"]
    MARKW = 3.0; s = MARKW / iw
    mb = bpy.data.metaballs.new("glob"); mb.resolution = 0.03; mb.render_resolution = 0.012; mb.threshold = 0.6
    for x, y, r in bl["balls"]:
        e = mb.elements.new(); e.co = ((x - iw / 2) * s, 0.0, -(y - ih / 2) * s); e.radius = r * s / 0.575
    glob = bpy.data.objects.new("glob", mb); sc.collection.objects.link(glob)
    ink = emission_mat("ink", (0, 0, 0))
    lit = bpy.data.materials.new("lit"); lit.use_nodes = True
    bsdf = lit.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.16, 0.16, 0.17, 1); bsdf.inputs["Roughness"].default_value = 0.45
    glob.data.materials.append(ink)
    sun_d = bpy.data.lights.new("sun", "SUN"); sun_d.energy = 4.0
    sun = bpy.data.objects.new("sun", sun_d); sc.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(50), math.radians(-35), math.radians(-30))
    sun.hide_render = True

    cd = bpy.data.cameras.new("Cam"); cd.lens = LENS
    cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam

    def orbit(th):
        t = math.radians(th)
        cam.location = (D * math.sin(t), -D * math.cos(t), 0.0)
        cam.rotation_euler = (math.radians(90), 0.0, t)
        bpy.context.view_layer.update()

    # 1. the glob from the front, on clear film: this image is the card's texture, so at 0 degrees they agree
    orbit(0); sc.render.film_transparent = True
    tex = os.path.join(od, "card_tex.png"); render(tex)
    sc.render.film_transparent = False
    glob.hide_render = True

    mat = G["blob_material"](tex, 0)                                   # blob_swarm.py's own billboard material
    face = card("card_face", FRAME, (0, 0, 0), mat, face_cam=cam)
    fixed = card("card_fixed", FRAME, (0, 0, 0), mat, rot=(math.radians(90), 0, 0))
    face.hide_render = fixed.hide_render = True

    angles = list(range(0, 91, 10))
    for th in angles:
        orbit(th)
        for name, show in (("card_face", face), ("card_fixed", fixed)):
            show.hide_render = False; render(os.path.join(od, f"{name}_{th:02d}.png")); show.hide_render = True
        glob.hide_render = False
        glob.data.materials[0] = ink; render(os.path.join(od, f"glob_ink_{th:02d}.png"))
        glob.data.materials[0] = lit; sun.hide_render = False
        render(os.path.join(od, f"glob_lit_{th:02d}.png"))
        sun.hide_render = True; glob.data.materials[0] = ink; glob.hide_render = True

    # 2. a place in depth: the same card at two depths, sized to look the same at rest, and one far line;
    #    the camera trucks sideways
    orbit(0)
    near_z, far_z, line_z = 5.0, 15.0, 30.0
    def at(z, xfrac):                                                  # world point at depth z, xfrac of frame from centre
        return (xfrac * z * 36.0 / LENS, -D + z, 0.0)
    cn = card("near", 0.5 * near_z * 36.0 / LENS, at(near_z, -0.22), mat, face_cam=cam)
    cf = card("far", 0.5 * far_z * 36.0 / LENS, at(far_z, 0.22), mat, face_cam=cam)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.0, -D + line_z, 0.0))
    ln = bpy.context.active_object; ln.scale = (0.006 * line_z, 0.05, 40.0); ln.data.materials.append(ink)
    TRUCK = [-0.5, -0.25, 0.0, 0.25, 0.5]
    for i, tx in enumerate(TRUCK):
        cam.location = (tx, -D, 0.0); cam.rotation_euler = (math.radians(90), 0, 0)
        render(os.path.join(od, f"truck_{i}.png"))
        for one, other in ((cn, cf), (cf, cn)):                        # each card alone, for its centroid
            other.hide_render = True; ln.hide_render = True
            render(os.path.join(od, f"truck_{i}_{one.name}.png"))
            other.hide_render = False; ln.hide_render = False
    json.dump(dict(width=W, lens=LENS, sensor=36.0, distance=D, mark_width=MARKW, frame_at_mark=FRAME,
                   angles=angles, truck=TRUCK, depths=dict(near=near_z, far=far_z, line=line_z),
                   balls=len(bl["balls"]), blender=bpy.app.version_string),
              open(os.path.join(od, "orbit.json"), "w"), indent=1)

# ---------------------------------------------------------------- the clean composite: the fixes on and off
if MODE == "comp":
    cdir = os.path.join(OUT, "comp"); os.makedirs(cdir, exist_ok=True)
    G["build_scene"]()
    cam = G["make_camera"]()
    cam.location = (0.0, -6.25, 1.65)                                  # blob_swarm's cam_at(0.5), mid-truck
    bpy.context.view_layer.update()
    from mathutils import Vector
    C = Vector(cam.location)
    # A: in front of the left building's near inner edge, a little under halfway along the camera's ray to it.
    # B: past the right building's near inner edge on the ray to it, so the building covers part of it.
    PA = Vector((-4.545, 10.81, 3.6)); PB = Vector((4.73, 11.225, 3.0))
    LA = C + 0.42 * (PA - C); LB = C + 1.3 * (PB - C)
    def side(L): return 0.17 * (L - C).length * 36.0 / 26.0          # a sixth of the frame's width at its depth
    tex = MARK
    two_layer = JOB.startswith("L2")
    blended = "blend" in JOB
    raw = "raw" in JOB                                                 # L2_blend_raw, L2_blend_repeat, L2_blend_raw_repeat: guards off
    G["configure_freestyle_scene_only"]()
    G["set_world"](1.0)
    G["common"]()
    sc.render.image_settings.color_mode = "RGB"

    if JOB in ("inkA", "quadA", "inkB", "quadB", "truthB"):
        sc.render.use_freestyle = False
        mat = G["blob_material"](tex, 0) if JOB.startswith(("ink", "truth")) else emission_mat("quad", (0, 0, 0))
        which = LA if JOB.endswith("A") else LB
        card("bb", side(which), tuple(which), mat, face_cam=cam)
        G["link"](bpy.context.active_object, G["blob_coll"])
        if JOB != "truthB":                                            # truthB keeps the buildings: plain z-buffer occlusion
            for o in list(G["scene_coll"].objects): o.hide_render = True
    elif JOB != "ref":
        for k, L in (("A", LA), ("B", LB)):
            mat = G["blob_material"](tex, k)
            if blended: set_blended(mat)
            if raw: unthreshold(mat, "REPEAT" if JOB.endswith("repeat") else None)
            elif JOB.endswith("repeat"): mat.node_tree.nodes["Image Texture"].extension = "REPEAT"
            card("bb" + k, side(L), tuple(L), mat, face_cam=cam)
            G["link"](bpy.context.active_object, G["blob_coll"])
        if two_layer:
            G["setup_two_layer_composite"]()
    render(os.path.join(cdir, JOB + ".png"))
    if JOB == "ref":
        json.dump(dict(res=list(G["RES"]), A=list(LA), B=list(LB), side_A=side(LA), side_B=side(LB),
                       camera=list(C), lens=26.0, mark=os.path.relpath(MARK, ROOT), blender=bpy.app.version_string),
                  open(os.path.join(cdir, "comp.json"), "w"), indent=1)
