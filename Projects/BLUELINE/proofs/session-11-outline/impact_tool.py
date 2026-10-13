#!/usr/bin/env python3
"""
BLUELINE — THE IMPACT TOOL.  (generalized from session-10 build_impact.py)

An opinionated instrument that turns ONE authored action into a manipulable comic aftermath frame.
You author only the ACTION (pivot · windup · contact · pose targets · camera); the tool DERIVES the
arc, every point's velocity (v = ω × r), the contact velocity, the wound, the debris, and the single-
sweep flow guide. It hands you a .blend with NAMED COLLECTIONS you can grab and hand-tune, plus a free
outline PNG (the fast inner loop), plus — on demand — the conditioning plates the cloud render needs.

DESIGN INVARIANT: the MOTION is real (accurate arc, real pose). The CONSEQUENCES are comic-amplified —
the `punch` dial scales debris spread/count/streak and CANNOT touch the motion. "Motion real,
consequences super." Loudon's locked look (2026-07-04): spray=arc, thinned, guide LEADS.

PARAMETER SURFACE
  --action   chop | side | rising        the authored swing (the only real input)
  --punch    0..1     the ONE energy dial → debris spread · count · streak (never the motion)
  --preset   grounded | heroic | super   presets for --punch (0.35 / 0.6 / 1.0)
  --spray    arc | out                   arc = debris trails the swing (default); out = splash outward
  --density  0..1     thin/dense on top of punch (declutter without losing punch character)
  --guide-w  0.14     single-sweep half-width. Wider is NOT louder on chop: the ribbon is hollow, and
                      above 0.14 its outer edge runs into the column and hides (out/guide/)
  --guide-weight 1.0  ink-weight multiplier on the GUIDE collection ALONE (1 = same ink as the scene)
  --guide-rails  1    1 = one swoosh; 2+ = echo rails nested beside it (each thinner, shorter)
  --rail-gap     0.05 clear gap (m) between rails
  --rail-side    in   in = echoes nest toward the pivot (hilt side); out = toward the tip
  --style    outline | greybox           outline = black-ink draft (default); greybox = shaded proxy
  --plates   0 | 1                        also emit depth / canny / OpenPose conditioning plates
  --plates-dir <render dir>               where the plates land: <ACTION>_depth.png, _canny.png,
                                          _openpose.png, _keypoints.json
  --save     out/impact.blend             the manipulable scene (named collections)
  --render   out/impact.png               the frame

PLATES — all three come from the SAME scene as the outline, never from a detector run on a render:
  depth     Camera Data view-Z → near=white/far=black, range fitted to the subject; the GUIDE is hidden
            (it is a comic mark, not a solid — depth would sculpt it into a physical band).
  canny     Freestyle edges at 1 px, white on black (the canny format) — GUIDE included, so the
            second pass sees the swoosh as an edge to keep.
  openpose  the 18 COCO keypoints read off the Rigify ORG-bones and projected through the camera,
            drawn with the controlnet_aux palette. Face points hide when the head faces away, so an
            over-the-shoulder frame never gets a face painted on the back of the head. Never DWPose
            on greybox. keypoints.json matches rig-openpose/draw_openpose.py, which can redraw it.

  /opt/homebrew/bin/blender -b -P impact_tool.py -- --action chop --render out/frame.png --save out/frame.blend
"""
import bpy, bmesh, sys, os, math, json
import numpy as np
from mathutils import Vector, Matrix, Euler

argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def arg(n, d): return argv[argv.index(n)+1] if n in argv else d
RIG     = arg("--rig", "../blender-handdrawn/followups/rig-openpose/figure_rig_studio.blend")
ACTION  = arg("--action", "chop")
PRESETS = {"grounded": 0.35, "heroic": 0.6, "super": 1.0}
PUNCH   = float(arg("--punch", str(PRESETS.get(arg("--preset", "heroic"), 0.6))))
SPRAY   = arg("--spray", "arc")                  # LOCKED default: arc (frame-5)
DENSITY = float(arg("--density", "0.45"))        # LOCKED default: thinned
GUIDE_W = float(arg("--guide-w", "0.14"))
GUIDE_WEIGHT = float(arg("--guide-weight", "1.0"))   # ink multiplier on the GUIDE alone (1 = no change)
GUIDE_RAILS  = max(1, int(arg("--guide-rails", "1")))
RAIL_GAP     = float(arg("--rail-gap", "0.05"))
RAIL_SIDE    = arg("--rail-side", "in")              # in = toward the pivot · out = toward the tip
STYLE   = arg("--style", "outline")
PLATES  = arg("--plates", "0") == "1"
THICK   = float(arg("--thick", "2.2"))
SAVE    = arg("--save", "")
RENDER  = arg("--render", "out/impact.png")
PLATES_DIR = arg("--plates-dir", os.path.dirname(RENDER) or ".")
SEED    = int(arg("--seed", "8"))
os.makedirs(os.path.dirname(RENDER) or ".", exist_ok=True)
rng = np.random.default_rng(SEED)

# ═══ THE ACTIONS — each is just a different {pivot, windup, contact}; the model DERIVES the rest ═══
COLUMN = Vector((1.30, 0.05, 1.05))
ACTIONS = {
  'chop':   dict(pivot=(0.12,0.00,1.40), d_wind=(-0.34, 0.00, 0.94), contact=(0.92,0.02,1.06),
                 hand=(0.62,0.00,1.00), torso=(24,0,0),  cam=(-1.15, 1.25,1.95)),
  'side':   dict(pivot=(0.10,0.00,1.16), d_wind=(-0.15,-0.96, 0.05), contact=(0.90,0.02,1.16),
                 hand=(0.60,-0.06,1.14), torso=(6,0,-26), cam=(-0.35,-2.05,1.55)),
  'rising': dict(pivot=(0.08,0.00,0.92), d_wind=(-0.30, 0.00,-0.90), contact=(0.90,0.02,1.32),
                 hand=(0.60,0.00,1.16), torso=(-4,0,0),  cam=(-1.05, 1.35,1.05)),
}
cfg = ACTIONS[ACTION]

# ── the swing model — a rotation about a pivot; author ω(t), derive everything ──
CONTACT = Vector(cfg['contact']); PIVOT = Vector(cfg['pivot'])
R_GRIP, R_TIP, T_IMPACT, ACCEL_K = 0.52, 1.42, 0.25, 2.5
d_wind = Vector(cfg['d_wind']).normalized()
d_imp  = (CONTACT - PIVOT).normalized()
ROT_AX = d_wind.cross(d_imp).normalized()
DTHETA = d_wind.angle(d_imp)
Rc = (CONTACT - PIVOT).length
def blade_dir(u): return (Matrix.Rotation(DTHETA*(u**ACCEL_K), 3, ROT_AX) @ d_wind)
def guide_dir(a): return (Matrix.Rotation(a, 3, ROT_AX) @ d_wind)   # angle-uniform: PATH not accel
def omega(u):     return DTHETA*ACCEL_K*(max(u,1e-6)**(ACCEL_K-1)) / T_IMPACT
def grip(u):      return PIVOT + blade_dir(u)*R_GRIP
def vel(r,u):     return (omega(u)*ROT_AX).cross(r - PIVOT)
V_CONTACT = vel(CONTACT, 1.0)
vc_dir, vc_mag = V_CONTACT.normalized(), V_CONTACT.length
print(f"[tool] {ACTION.upper()} Δθ={math.degrees(DTHETA):.0f}° |v_c|={vc_mag:.1f} m/s"
      f"  punch={PUNCH} spray={SPRAY} density={DENSITY}")

# ── the punch dial → the three consequence gains (structurally cannot touch motion) ──
GAIN_SPREAD = 0.6 + 2.0*PUNCH
GAIN_COUNT  = 0.6 + 2.6*PUNCH
GAIN_STREAK = 0.8 + 2.4*PUNCH
DT_STILL    = 0.018

# ── NAMED COLLECTIONS — the manipulable layers Loudon grabs and hand-tunes ──────
def coll(name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name); bpy.context.scene.collection.children.link(c)
    return c
COLLS = {}                                         # populated AFTER the rig file is opened (open wipes data)
def put(obj, name):                                # move an object into a named collection
    for c in obj.users_collection: c.objects.unlink(obj)
    COLLS[name].objects.link(obj)

def mat(name, rgb, rough=0.6, metal=0.0):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes=True
    b=m.node_tree.nodes.get("Principled BSDF")
    if b:
        b.inputs["Base Color"].default_value=(*rgb,1)
        if "Roughness" in b.inputs: b.inputs["Roughness"].default_value=rough
        if "Metallic" in b.inputs:  b.inputs["Metallic"].default_value=metal
    return m
def box(name,size,loc,mat_,rot=None):
    bm=bmesh.new(); c=bmesh.ops.create_cube(bm,size=1.0)["verts"]
    for v in c: v.co=Vector((v.co.x*size[0],v.co.y*size[1],v.co.z*size[2]))
    if rot is not None: bmesh.ops.rotate(bm,verts=c,cent=Vector((0,0,0)),matrix=rot)
    me=bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o=bpy.data.objects.new(name,me); bpy.context.scene.collection.objects.link(o); o.location=loc
    o.data.materials.append(mat_); return o

# ═══ BUILD ═══════════════════════════════════════════════════════════════════════
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(RIG))
scn = bpy.context.scene
COLLS.update({n: coll(n) for n in ("FIGURE","BLADE","TARGET","WOUND","DEBRIS","GUIDE")})

# 1 — pose the figure; hands IK-FOLLOW the derived grip (pose = consequence of the swing)
rig=bpy.data.objects.get("FigureRig"); body=bpy.data.objects.get("FigureBody")
GRIP = grip(1.0)
if rig:
    rig.rotation_euler=Euler((0,0,math.radians(90)),'XYZ'); bpy.context.view_layer.update()
    bpy.context.view_layer.objects.active=rig
    try: bpy.ops.object.mode_set(mode='POSE')
    except Exception as e: print("[tool] pose mode:",e)
    def place(bone, world):
        pb=rig.pose.bones.get(bone)
        if not pb: return
        Mw=Matrix.Translation(world) @ pb.matrix.to_3x3().to_4x4()
        pb.matrix=rig.matrix_world.inverted() @ Mw; bpy.context.view_layer.update()
    HT=Vector(cfg['hand'])
    place("hand_ik_r", HT+Vector((0,-0.05,0)));    place("hand_ik_l", HT+Vector((-0.03,0.06,0.02)))
    place("foot_ik_l", Vector((0.58,-0.18,0)));     place("foot_ik_r", Vector((-0.40,0.20,0)))
    lx,_,lz = cfg['torso']
    for b,f in (("torso",1.0),("chest",0.6)):
        pb=rig.pose.bones.get(b)
        if pb: pb.rotation_mode='XYZ'; pb.rotation_euler=Euler((math.radians(lx*f),0,math.radians(lz*f)),'XYZ')
    bpy.context.view_layer.update()
    try: GRIP=(rig.matrix_world @ rig.pose.bones['hand_ik_r'].matrix).translation.copy()
    except Exception as e: print("[tool] grip read:",e)
    try: bpy.ops.object.mode_set(mode='OBJECT')
    except Exception: pass
    put(rig,"FIGURE")
if body:
    body.data.materials.clear(); body.data.materials.append(mat("body",(0.34,0.35,0.38))); put(body,"FIGURE")

# 2 — the sword along the impact blade direction, from the actual hands
steel=mat("steel",(0.30,0.31,0.34),rough=0.25,metal=0.9)
bdir=(CONTACT-GRIP).normalized(); blen=(CONTACT-GRIP).length+0.05
Rq=Vector((1,0,0)).rotation_difference(bdir).to_matrix()
for o in (box("blade",(blen,0.05,0.012),GRIP+bdir*(blen*0.5),steel,rot=Rq),
          box("guard",(0.03,0.16,0.03),GRIP+bdir*0.03,steel,rot=Rq),
          box("grip",(0.13,0.03,0.03),GRIP-bdir*0.055,mat("grip_m",(0.05,0.04,0.03)),rot=Rq)):
    put(o,"BLADE")

# 3 — the wooden column WITH the wound the blade cut (boolean = real deformation)
wood=mat("wood",(0.28,0.17,0.08),rough=0.8)
bm=bmesh.new(); bmesh.ops.create_cone(bm,cap_ends=True,segments=48,radius1=0.16,radius2=0.16,depth=2.2)
me=bpy.data.meshes.new("col"); bm.to_mesh(me); bm.free()
col=bpy.data.objects.new("col",me); scn.collection.objects.link(col); col.location=COLUMN; col.data.materials.append(wood)
kerf=box("kerf",(blen+0.7,0.11,0.05), GRIP+bdir*((blen+0.7)*0.5), wood, rot=Rq)
bmod=col.modifiers.new("wound","BOOLEAN"); bmod.operation='DIFFERENCE'
try: bmod.solver='EXACT'
except Exception: pass
bmod.object=kerf; kerf.hide_render=True; kerf.hide_viewport=True
put(col,"TARGET"); put(kerf,"WOUND")

# 4 — DEBRIS (shards + wake) — direction from real v_contact; punch/spray shape the look
OUTN=(CONTACT-COLUMN).normalized(); tangent=ROT_AX; perp=vc_dir.cross(ROT_AX).normalized()
def burst_dir():
    if SPRAY=="arc": return (vc_dir + 0.20*OUTN + Vector((0,0,rng.uniform(-0.05,0.15)))).normalized()
    return (vc_dir + 1.5*OUTN + Vector((0,0,rng.uniform(-0.1,0.7)))).normalized()
NSH=max(6,int(40*GAIN_COUNT*DENSITY)); shbm=bmesh.new()
for i in range(NSH):
    cone=(burst_dir() + GAIN_SPREAD*(rng.normal(0,0.4)*tangent + rng.normal(0,0.4)*perp)).normalized()
    sp=vc_mag*rng.uniform(0.5,1.4)
    origin=CONTACT + bdir*rng.uniform(-0.14,0.05) + Vector(tuple(rng.normal(0,0.025,3)))
    pos=origin + cone*(sp*DT_STILL*GAIN_STREAK*rng.uniform(0.6,1.7)); s=rng.uniform(0.02,0.06)
    c=bmesh.ops.create_cube(shbm,size=1.0)["verts"]
    for v in c: v.co=Vector((v.co.x*s*rng.uniform(0.5,1.6),v.co.y*s*0.5,v.co.z*s*rng.uniform(0.5,1.6)))
    bmesh.ops.rotate(shbm,verts=c,cent=Vector((0,0,0)),matrix=Matrix.Rotation(rng.uniform(0,6.28),3,tuple(rng.normal(0,1,3))))
    bmesh.ops.translate(shbm,verts=c,vec=pos)
me=bpy.data.meshes.new("shards"); shbm.to_mesh(me); shbm.free()
sh=bpy.data.objects.new("shards",me); scn.collection.objects.link(sh); sh.data.materials.append(mat("shard",(0.30,0.18,0.08),rough=0.85)); put(sh,"DEBRIS")
dbm=bmesh.new(); NW=max(20,int(180*GAIN_COUNT*DENSITY))
for k in range(NW):
    u=rng.uniform(0.2,1.0); base=PIVOT+blade_dir(u)*rng.uniform(R_GRIP,R_TIP)
    age=(1.0-u)*T_IMPACT + DT_STILL; spread=(0.02+0.14*age)*GAIN_SPREAD
    kick=vel(base,u).normalized()*(vel(base,u).length*age*0.010*GAIN_STREAK)
    p=base+kick+Vector(tuple(rng.normal(0,spread,3)))
    c=bmesh.ops.create_icosphere(dbm,subdivisions=1,radius=0.012)["verts"]; bmesh.ops.translate(dbm,verts=c,vec=p)
me=bpy.data.meshes.new("wake"); dbm.to_mesh(me); dbm.free()
wk=bpy.data.objects.new("wake",me); scn.collection.objects.link(wk); wk.data.materials.append(mat("dust",(0.06,0.05,0.05),rough=1.0)); put(wk,"DEBRIS")

# 5 — the SINGLE-SWEEP GUIDE — one bold swoosh tracing the blade arc, gapped off the blade
#     Rail 0 is the swoosh. --guide-rails 2+ adds echo rails beside it: each is a ribbon on the SAME
#     angle grid, RAIL_SCALE× thinner and starting later along the arc (shorter trail), offset so a
#     clear RAIL_GAP separates it from its neighbour at every angle. Each rail traces a different
#     point along the blade — still the PATH, never the speed.
GU0,GU1,GR,GTAP = 0.10,0.90,1.0,1.2
RAIL_SCALE, RAIL_LAG = 0.55, 0.15                  # echo width ratio · echo start lag (fraction of Δθ)
N=40; angs=np.linspace(GU0*DTHETA, GU1*DTHETA, N)
def gw(t): return max(0.006, GUIDE_W*(t**GTAP))
ink=mat("ink",(0.02,0.02,0.03))
sgn = -1.0 if RAIL_SIDE=="in" else 1.0
prev_c=[GR*Rc]*N; prev_w=[gw(i/(N-1)) for i in range(N)]
for k in range(GUIDE_RAILS):
    a0=angs[0]+(RAIL_LAG*k)*DTHETA; a1=angs[-1]
    cen,wid=[],[]
    for i,a in enumerate(angs):
        t=(a-a0)/max(a1-a0,1e-6)
        if k==0: c,w_=GR*Rc,gw(i/(N-1))
        else:
            w_=max(0.004,(RAIL_SCALE**k)*GUIDE_W*(max(t,0.0)**GTAP))
            c=prev_c[i]+sgn*(prev_w[i]+RAIL_GAP+w_)
        cen.append(c); wid.append(w_)
    gbm=bmesh.new(); ri,ro=[],[]
    for i,a in enumerate(angs):
        if a<a0-1e-9: continue
        bd=guide_dir(a)
        ri.append(gbm.verts.new(PIVOT+bd*(cen[i]-wid[i]))); ro.append(gbm.verts.new(PIVOT+bd*(cen[i]+wid[i])))
    for i in range(len(ri)-1): gbm.faces.new((ri[i],ro[i],ro[i+1],ri[i+1]))
    geom=bmesh.ops.extrude_face_region(gbm,geom=gbm.faces[:])
    bmesh.ops.translate(gbm,verts=[g for g in geom["geom"] if isinstance(g,bmesh.types.BMVert)],vec=ROT_AX*0.02)
    nm="sweep" if k==0 else f"sweep_rail{k+1}"
    me=bpy.data.meshes.new(nm); gbm.to_mesh(me); gbm.free()
    sw=bpy.data.objects.new(nm,me); scn.collection.objects.link(sw); sw.data.materials.append(ink); put(sw,"GUIDE")
    prev_c,prev_w=cen,wid
print(f"[tool] guide: w={GUIDE_W} rails={GUIDE_RAILS}"+(f" ({RAIL_SIDE}, gap {RAIL_GAP})" if GUIDE_RAILS>1 else "")
      +f" weight×{GUIDE_WEIGHT}")

# 6 — camera reads the swing
cam=bpy.data.objects.get("Cam")
if cam:
    cam.location=Vector(cfg['cam']); look=(CONTACT+GRIP)/2+Vector((0,0,-0.05))
    cam.rotation_mode='XYZ'; cam.rotation_euler=(look-cam.location).to_track_quat('-Z','Y').to_euler()
    scn.camera=cam
    if cam.data: cam.data.lens=45

# 7 — SAVE the manipulable scene BEFORE the render override touches materials
if SAVE:
    os.makedirs(os.path.dirname(SAVE) or ".", exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(SAVE)); print(f"[tool] saved manipulable scene {SAVE}")

# 8 — RENDER: outline ink (default) or greybox proxy
def render_to(path):
    scn.render.image_settings.file_format='PNG'; scn.render.filepath=os.path.abspath(path)
    bpy.ops.render.render(write_still=True)
scn.render.resolution_x, scn.render.resolution_y = 1000, 1250
if STYLE=="outline":
    scn.render.engine='CYCLES'
    try: scn.cycles.samples=16; scn.cycles.device='CPU'
    except Exception: pass
    wd=scn.world or bpy.data.worlds.new("W"); scn.world=wd; wd.use_nodes=True
    bg=wd.node_tree.nodes.get("Background")
    if bg: bg.inputs[0].default_value=(1,1,1,1); bg.inputs[1].default_value=1.0
    white=bpy.data.materials.new("flatwhite"); white.use_nodes=True; nt=white.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    em=nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value=(1,1,1,1); em.inputs[1].default_value=1.0
    out=nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(em.outputs[0],out.inputs[0])
    for o in scn.objects:
        if o.type=='MESH': o.data.materials.clear(); o.data.materials.append(white)
    scn.render.use_freestyle=True; scn.render.line_thickness_mode='ABSOLUTE'; scn.render.line_thickness=THICK
    vl=scn.view_layers[0]; vl.use_freestyle=True; fs=vl.freestyle_settings
    lineset=fs.linesets[0] if fs.linesets else fs.linesets.new("ls")
    for flag in ("select_silhouette","select_border","select_crease","select_contour"):
        try: setattr(lineset,flag,True)
        except Exception: pass
    lineset.linestyle.color=(0,0,0); lineset.linestyle.thickness=THICK
    if abs(GUIDE_WEIGHT-1.0)>1e-6:
        # The GUIDE gets its own lineset: the scene's lineset skips the GUIDE collection, and a copy of
        # the scene's ink, scaled, draws the GUIDE alone. The rig's ink carries a Calligraphy thickness
        # modifier at full MIX influence, so it is the modifier's min/max (not --thick) that sets the
        # stroke weight — scale those too, or the guide would not change.
        lineset.select_by_collection=True; lineset.collection=COLLS["GUIDE"]; lineset.collection_negation='EXCLUSIVE'
        gls=fs.linesets.new("GuideInk")
        for at in ("select_by_visibility","visibility","select_by_edge_types","select_silhouette","select_border",
                   "select_crease","select_contour","select_external_contour","select_edge_mark"):
            try: setattr(gls,at,getattr(lineset,at))
            except Exception: pass
        gls.select_by_collection=True; gls.collection=COLLS["GUIDE"]; gls.collection_negation='INCLUSIVE'
        gst=lineset.linestyle.copy(); gst.name="GuideInk"; gst.thickness*=GUIDE_WEIGHT
        for m in gst.thickness_modifiers:
            for at in ("thickness_min","thickness_max","value_min","value_max"):
                if hasattr(m,at): setattr(m,at,getattr(m,at)*GUIDE_WEIGHT)
        gls.linestyle=gst
else:  # greybox proxy
    scn.render.engine='CYCLES'
    try: scn.cycles.samples=24; scn.cycles.device='CPU'
    except Exception: pass
render_to(RENDER)
print(f"[tool] {STYLE.upper()} frame -> {RENDER}")
print(f"[tool] collections: {', '.join(COLLS)}")

# 9 — CONDITIONING PLATES (--plates 1): depth · canny · geometric OpenPose, from this same scene
OP_BONES = {1:["ORG-neck_01","ORG-neck","ORG-spine_03"], 2:["ORG-upperarm_r"], 3:["ORG-lowerarm_r"], 4:["ORG-hand_r"],
            5:["ORG-upperarm_l"], 6:["ORG-lowerarm_l"], 7:["ORG-hand_l"], 8:["ORG-thigh_r"], 9:["ORG-calf_r"],
            10:["ORG-foot_r"], 11:["ORG-thigh_l"], 12:["ORG-calf_l"], 13:["ORG-foot_l"]}   # bone HEADs
OP_LIMBS = [[2,3],[2,6],[3,4],[4,5],[6,7],[7,8],[2,9],[9,10],[10,11],[2,12],[12,13],[13,14],
            [2,1],[1,15],[15,17],[1,16],[16,18]]                                       # controlnet_aux order
OP_COLORS = [[255,0,0],[255,85,0],[255,170,0],[255,255,0],[170,255,0],[85,255,0],[0,255,0],[0,255,85],
             [0,255,170],[0,255,255],[0,170,255],[0,85,255],[0,0,255],[85,0,255],[170,0,255],[255,0,255],
             [255,0,170],[255,0,85]]

def openpose_keypoints():
    """18 COCO keypoints from the posed rig, projected through the scene camera (x,y normalized, y down)."""
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update()
    dg=bpy.context.evaluated_depsgraph_get(); ae=rig.evaluated_get(dg); mw=ae.matrix_world
    def pick(c):
        for n in c:
            if n in ae.pose.bones: return ae.pose.bones[n]
    world=[None]*18
    for i,c in OP_BONES.items():
        pb=pick(c)
        if pb: world[i]=mw@pb.head
    hpb=pick(["ORG-head","head"]); neck=world[1]
    # the head's frame: its posed rotation applied to the rig's rest axes (MPFB faces −Y, subject-right −X)
    R=mw.to_3x3()@hpb.matrix.to_3x3()@hpb.bone.matrix_local.to_3x3().inverted()
    facing=(R@Vector((0,-1,0))).normalized(); up=(R@Vector((0,0,1))).normalized(); right=(R@Vector((-1,0,0))).normalized()
    head_c=neck+((mw@hpb.tail)-neck)*0.6; rr=0.11
    world[0]=head_c+facing*rr
    world[14]=head_c+facing*rr*0.85+right*0.045+up*0.04; world[15]=head_c+facing*rr*0.85-right*0.045+up*0.04
    world[16]=head_c+right*0.075; world[17]=head_c-right*0.075
    to_cam=(cam.matrix_world.translation-head_c).normalized()
    face_on=facing.dot(to_cam)>0.10                      # nose + eyes only when the face is turned to us
    seen={0:face_on,14:face_on,15:face_on,16:right.dot(to_cam)>-0.5,17:(-right).dot(to_cam)>-0.5}
    kps=[]
    for i,wp in enumerate(world):
        if wp is None: kps.append([0.0,0.0,0]); continue
        co=world_to_camera_view(scn,cam,wp)
        kps.append([round(co.x,5),round(1.0-co.y,5),1 if (co.z>0 and seen.get(i,True)) else 0])
    return kps

def draw_openpose(kps,W,H,path):
    """controlnet_aux draw_bodypose, in numpy: limbs = ellipses (stick 4) at 0.6× colour, joints = r4 discs."""
    cv=np.zeros((H,W,3),np.uint8)
    def fill(inside,x0,x1,y0,y1,col):
        x0,y0,x1,y1=max(0,x0),max(0,y0),min(W-1,x1),min(H-1,y1)
        if x0>x1 or y0>y1: return
        yy,xx=np.mgrid[y0:y1+1,x0:x1+1]; cv[y0:y1+1,x0:x1+1][inside(xx,yy)]=col
    for (i1,i2),col in zip(OP_LIMBS,OP_COLORS):
        k1,k2=kps[i1-1],kps[i2-1]
        if not (k1[2] and k2[2]): continue
        X=(k1[0]*W,k2[0]*W); Y=(k1[1]*H,k2[1]*H)
        cx,cy=int(sum(X)/2),int(sum(Y)/2); L=math.hypot(X[0]-X[1],Y[0]-Y[1])
        A=math.atan2(Y[0]-Y[1],X[0]-X[1]); a=max(int(L/2),1); b=4; ca,sa=math.cos(A),math.sin(A)
        fill(lambda xx,yy: (((xx-cx)*ca+(yy-cy)*sa)/a)**2+((-(xx-cx)*sa+(yy-cy)*ca)/b)**2<=1.0,
             cx-a-b,cx+a+b,cy-a-b,cy+a+b,[int(c*0.6) for c in col])
    for k,col in zip(kps,OP_COLORS):
        if not k[2]: continue
        x,y=int(k[0]*W),int(k[1]*H)
        fill(lambda xx,yy: (xx-x)**2+(yy-y)**2<=16, x-4,x+4,y-4,y+4, col)
    save_rgb(cv,path)

def save_rgb(arr,path):
    H_,W_=arr.shape[:2]; img=bpy.data.images.new(os.path.basename(path),W_,H_,alpha=False)
    px=np.concatenate([arr.astype(np.float32)/255.0,np.ones((H_,W_,1),np.float32)],axis=2)[::-1]
    img.pixels.foreach_set(px.ravel()); img.filepath_raw=os.path.abspath(path); img.file_format='PNG'; img.save()

def emission(name,rgb):
    m=bpy.data.materials.new(name); m.use_nodes=True; nt=m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    em=nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value=(*rgb,1); em.inputs[1].default_value=1.0
    o=nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(em.outputs[0],o.inputs[0]); return m,nt,em

def emit_plates():
    os.makedirs(PLATES_DIR,exist_ok=True); base=os.path.join(PLATES_DIR,ACTION)
    W,H=scn.render.resolution_x,scn.render.resolution_y
    vs=scn.view_settings
    try: vs.view_transform='Raw'                       # plate values must reach the PNG untouched
    except Exception: vs.view_transform='Standard'
    try: vs.look='None'
    except Exception: pass
    vs.exposure=0.0; vs.gamma=1.0
    scn.render.engine='CYCLES'
    try: scn.cycles.samples=8; scn.cycles.use_denoising=False
    except Exception: pass
    wd=scn.world or bpy.data.worlds.new("W"); scn.world=wd; wd.use_nodes=True
    bg=wd.node_tree.nodes.get("Background")
    if bg: bg.inputs[0].default_value=(0,0,0,1); bg.inputs[1].default_value=1.0
    meshes=[o for o in scn.objects if o.type=='MESH']
    guide=[o for o in COLLS["GUIDE"].objects]
    # — OpenPose: pure geometry, the rig's own bones —
    kps=openpose_keypoints(); draw_openpose(kps,W,H,base+"_openpose.png")
    # — depth: near = white, far = black; range fitted to the subject (figure · blade · target · debris) —
    dg=bpy.context.evaluated_depsgraph_get(); ci=cam.matrix_world.inverted(); zs=[]
    for cn in ("FIGURE","BLADE","TARGET","DEBRIS"):
        for o in COLLS[cn].objects:
            if o.type!='MESH' or o.hide_render: continue
            oe=o.evaluated_get(dg)
            zs+=[-(ci@(oe.matrix_world@Vector(c))).z for c in oe.bound_box]
    near,far=max(0.05,min(zs)*0.92),max(zs)*1.05
    dm,nt,em=emission("plate_depth",(1,1,1))
    cd=nt.nodes.new("ShaderNodeCameraData"); mr=nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value=near; mr.inputs["From Max"].default_value=far
    mr.inputs["To Min"].default_value=1.0; mr.inputs["To Max"].default_value=0.0; mr.clamp=True
    nt.links.new(cd.outputs["View Z Depth"],mr.inputs["Value"]); nt.links.new(mr.outputs["Result"],em.inputs[0])
    for o in meshes: o.data.materials.clear(); o.data.materials.append(dm)
    for o in guide: o.hide_render=True
    scn.render.use_freestyle=False
    render_to(base+"_depth.png")
    for o in guide: o.hide_render=False
    # — canny: the geometry's own edges, 1 px white on black (guide included) —
    black,_,_=emission("plate_black",(0,0,0))
    for o in meshes: o.data.materials.clear(); o.data.materials.append(black)
    scn.render.use_freestyle=True; scn.render.line_thickness_mode='ABSOLUTE'; scn.render.line_thickness=1.0
    vl=scn.view_layers[0]; vl.use_freestyle=True; fs=vl.freestyle_settings
    if not fs.linesets: fs.linesets.new("ls")
    edge=bpy.data.linestyles.new("CannyEdge"); edge.color=(1,1,1); edge.thickness=1.0; edge.use_chaining=True
    for ls in fs.linesets:
        for flag in ("select_silhouette","select_border","select_crease","select_contour"):
            try: setattr(ls,flag,True)
            except Exception: pass
        ls.linestyle=edge
    render_to(base+"_canny.png")
    json.dump({"res":[W,H],"keypoints":kps,"source":"armature-projected (Rigify ORG-bones), not a detector",
               "action":ACTION,"depth_range_m":[round(near,3),round(far,3)]},
              open(base+"_keypoints.json","w"),indent=1)
    print(f"[tool] PLATES -> {base}_{{depth,canny,openpose}}.png + _keypoints.json  "
          f"(depth {near:.2f}–{far:.2f} m, {sum(k[2] for k in kps)}/18 keypoints visible)")

if PLATES:
    if not (rig and cam): print("[tool] plates need FigureRig + Cam in the rig file — skipped")
    else: emit_plates()
