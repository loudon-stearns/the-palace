# title: The Aftermath Frame — rich — tool check
# born: 2026-11-03
# links: [[The Aftermath Frame]] (connects-to · rich-face-workshop) · feeds the numbers baked into the two made pieces listed in [[The Aftermath Frame — rich.json]]
# forward_vector: I run BLUELINE's impact tool's own code inside Blender, not a port of it, so the face's two claims about the tool can be re-checked:
#   (1) the punch dial cannot reach the motion (and a copy with the gain wired into the swing's speed does reach it: the null);
#   (2) where the drawn sword ends, and where the model's blade first meets the column, in the tool's own scene.
# Run, from anywhere (about twenty seconds):
#   blender -b --factory-startup -P "The Aftermath Frame — rich — tool check.py" -- Projects/BLUELINE/proofs/session-11-outline/impact_tool.py
# It prints one JSON line, prefixed JSON. The pieces bake its 2026-11-03 output (Blender 5.1.2): a public face can't run Blender.
import sys, os, math, json, io, contextlib
TOOL = os.path.abspath(sys.argv[sys.argv.index("--")+1])
src = open(TOOL).read()

def run(head, action, punch=None):
    ns = {"__name__": "tool"}
    os.chdir(os.path.dirname(TOOL))
    sys.argv = ["blender", "--", "--action", action] + (["--punch", str(punch)] if punch is not None else [])
    with contextlib.redirect_stdout(io.StringIO()): exec(compile(head, TOOL, "exec"), ns)
    return ns

# (1) the motion against the dial: the tool's header, through the punch -> gains lines
motion_head = src[:src.index("# ── NAMED COLLECTIONS")]
leaky_head = motion_head.replace("V_CONTACT = vel(CONTACT, 1.0)", "T_IMPACT = T_IMPACT / (0.8 + 2.4*PUNCH)\nV_CONTACT = vel(CONTACT, 1.0)")
assert leaky_head != motion_head, "the null's one-line leak no longer applies; read the tool again"
motion = []
for leak, head in ((False, motion_head), (True, leaky_head)):
    for action in ("chop", "side", "rising"):
        for punch in (0.0, 1.0, 3.9):
            ns = run(head, action, punch); v = ns["V_CONTACT"]
            motion.append(dict(action=action, punch=punch, leak=leak, dtheta_deg=math.degrees(ns["DTHETA"]), omega=ns["omega"](1.0),
                tip=ns["omega"](1.0)*ns["R_TIP"], vc=[v.x, v.y, v.z], gains=[ns["GAIN_SPREAD"], ns["GAIN_COUNT"], ns["GAIN_STREAK"]],
                nsh=max(6, int(40*ns["GAIN_COUNT"]*ns["DENSITY"])), nw=max(20, int(180*ns["GAIN_COUNT"]*ns["DENSITY"]))))

# (2) the scene: figure posed, sword drawn from the hand, column and kerf built (everything before the debris)
scene_head = src[:src.index("# 4 — DEBRIS")]
scene = []
for action in ("chop", "side", "rising"):
    ns = run(scene_head, action)
    C, COL, G, bdir, blen = ns["CONTACT"], ns["COLUMN"], ns["GRIP"], ns["bdir"], ns["blen"]
    def surf(p): return math.hypot(p.x-COL.x, p.y-COL.y) - 0.16
    def inside(p): return surf(p) < 0 and -0.05 < p.z < 2.15
    first = None
    for i in range(20001):
        u = i/20000; d = ns["blade_dir"](u)
        for j in range(401):
            r = ns["R_GRIP"] + (ns["R_TIP"]-ns["R_GRIP"])*j/400
            if inside(ns["PIVOT"] + d*r): first = dict(u=u, r=r, ms=u*ns["T_IMPACT"]*1000, turned=math.degrees(ns["DTHETA"]*u**ns["ACCEL_K"])); break
        if first: break
    end = G + bdir*blen
    scene.append(dict(action=action, rig=ns.get("rig") is not None, grip=list(G), sword_len=blen, sword_end_gap=surf(end), contact_gap=surf(C),
                      sword_vs_model_deg=math.degrees(bdir.angle(ns["d_imp"])), kerf_len=blen+0.7, first_in_wood=first))
print("JSON" + json.dumps(dict(motion=motion, scene=scene)))
