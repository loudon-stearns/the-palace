#!/usr/bin/env python3
"""
Animate the Background — the light piece for step 2, "Skip this and a moving background tears at the
figure's edge." BLUELINE shot 02, the project's own warp (ink_flames.py), run twice: once over a LaMa
plate (as the project built it) and once with the infill step skipped.

  _tools/ComfyUI/venv/bin/python make.py all          (from this folder, or with its path)
  stages: rebuild · lama · loops · check · measure · sources · render   (each reads what the one before wrote)

Inputs are copied from Projects/BLUELINE/proofs/blender-fire/ (and cloud-i2v/) into ./project/ at
palace commit 694ea27e; nothing in Projects/ is read or written. No randomness: the warp is
deterministic (seed 0 is recorded for the bench only).
"""
import os, re, sys, json, glob, subprocess
import numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ, WORK = os.path.join(HERE, "project"), os.path.join(HERE, "work")
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
PY = os.path.join(ROOT, "_tools", "ComfyUI", "venv", "bin", "python")
LAMA = os.path.join(ROOT, "Shop", "LaMa", "proofs", "2026-11-14-card-check", "lama_fill.py")
os.makedirs(WORK, exist_ok=True)
P = lambda *a: os.path.join(PROJ, *a)
W_ = lambda *a: os.path.join(WORK, *a)
im = lambda p, f=1: cv2.imread(p, f)


def save_json(name, d):
    with open(os.path.join(HERE, name), "w") as f:
        json.dump(d, f, indent=1)
    print("WROTE", name)


def lama_mask(hf):
    """The project's LaMa hole (lama_infill.py): feather > 100, dilated 11x11."""
    return cv2.dilate((hf > 100).astype(np.uint8) * 255, np.ones((11, 11), np.uint8)) > 0


# ---------------------------------------------------------------- 1 · rebuild the lost shot
def rebuild():
    """Shot 02 (new-story/out/02_hero-on-sedan-pointing.png) is gone. Two files hold it in parts:
    clean_plate.png is the shot outside the LaMa hole (LaMa pastes the input back there), and
    fire_composite_drawing.png is the shot with a Blender overlay drawn into the sky only.
    Rebuilt = plate outside the hole, the overlay drawing inside it. Then checked against the two
    references that hold the real man: the 64 frames of ink_flames.mp4 and 07_ink_warp_alive.png."""
    cp, fd = im(P("clean_plate.png")), im(P("fire_composite_drawing.png"))
    hf = im(P("hero_mask_feather.png"), 0)
    hole = lama_mask(hf)
    d = np.abs(cp.astype(int) - fd.astype(int)).max(2)
    out = ~hole
    overlay = (d > 8) & out
    ring = cv2.dilate(hole.astype(np.uint8), np.ones((25, 25), np.uint8)).astype(bool) & ~hole
    rb = cp.copy(); rb[hole] = fd[hole]
    cv2.imwrite(W_("shot_rebuilt.png"), rb)


def check():
    """The rebuild against the references; run after loops, so the plume mask is known."""
    cp, fd = im(P("clean_plate.png")), im(P("fire_composite_drawing.png"))
    hf = im(P("hero_mask_feather.png"), 0)
    hole = lama_mask(hf)
    d = np.abs(cp.astype(int) - fd.astype(int)).max(2)
    out = ~hole
    overlay = (d > 8) & out
    ring = cv2.dilate(hole.astype(np.uint8), np.ones((25, 25), np.uint8)).astype(bool) & ~hole
    rb = im(W_("shot_rebuilt.png"))

    # references at 560x818
    fdir = W_("ref_frames"); os.makedirs(fdir, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", P("ink_flames.mp4"), os.path.join(fdir, "f%02d.png")], check=True)
    fr = [im(f).astype(int) for f in sorted(glob.glob(os.path.join(fdir, "*.png")))]
    H, W = fr[0].shape[:2]
    rbs = cv2.resize(rb, (W, H), interpolation=cv2.INTER_AREA).astype(int)
    core = cv2.erode((hf == 255).astype(np.uint8), np.ones((3, 3), np.uint8))
    cs = cv2.erode(cv2.resize(core, (W, H), interpolation=cv2.INTER_NEAREST), np.ones((3, 3), np.uint8)).astype(bool)
    # static ground: outside the plume (sm < 0.01) and outside the hero, where every frame is the shot
    sm = np.load(W_("with_infill_plume.npy"))
    a7 = im(P("07_ink_warp_alive.png")).astype(int)
    err = lambda a, m: float(np.abs(a - rbs)[m].mean())
    man = [err(f, cs) for f in fr]
    r = {
        "pixels_outside_hole": int(out.sum()),
        "plate_equals_overlay_drawing_outside_hole": int((d[out] == 0).sum()),
        "differ_by_more_than_8": int(overlay.sum()),
        "overlay_extent_y": [int(np.where(overlay)[0].min()), int(np.where(overlay)[0].max())],
        "overlay_pixels_within_12px_of_hole": int((overlay & ring).sum()),
        "hero_mask_top_y": int(np.where(hf > 100)[0].min()),
        "man_core_px_at_560": int(cs.sum()),
        "man_core_mean_abs_err_vs_mp4_frames_0_255": [round(min(man), 2), round(max(man), 2)],
        "man_core_mean_abs_err_vs_07_still": round(err(a7, cs), 2),
        "control_rebuilt_shifted_2px_vs_mp4_frame0": round(float(np.abs(fr[0] - np.roll(rbs, 2, 1))[cs].mean()), 2),
        "control_plate_without_man_vs_mp4_frame0": round(float(np.abs(fr[0] - cv2.resize(cp, (W, H), interpolation=cv2.INTER_AREA).astype(int))[cs].mean()), 2),
    }
    if sm is not None:
        sms = cv2.resize(sm, (W, H)) < 0.01
        hs = cv2.resize((hf > 0).astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST) == 0
        still = cv2.erode((sms & hs).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        st = [err(f, still) for f in fr]
        r["still_ground_px_at_560"] = int(still.sum())
        r["still_ground_mean_abs_err_vs_mp4_frames"] = [round(min(st), 2), round(max(st), 2)]
    save_json("rebuild-check.json", r)


# ---------------------------------------------------------------- 2 · LaMa through the Shop
def lama():
    hf = im(P("hero_mask_feather.png"), 0)
    cv2.imwrite(W_("hole_mask.png"), ((hf > 100) * 255).astype(np.uint8))   # lama_fill dilates it 11x11, as the project did
    out = subprocess.run([PY, LAMA, W_("shot_rebuilt.png"), W_("hole_mask.png"), W_("plate_rerun.png"), "--dilate", "11"],
                         check=True, capture_output=True, text=True).stdout.strip()
    print(out)
    a, b = im(W_("plate_rerun.png")).astype(int), im(P("clean_plate.png")).astype(int)
    hole = lama_mask(hf)
    dd = np.abs(a - b).max(2)
    save_json("lama-check.json", {
        "shop_output": re.sub(r"load [0-9.]+s, fill [0-9.]+s, ", "", out),   # timings left out, so a rerun reproduces this file
        "hole_px": int(hole.sum()),
        "rerun_vs_disk_plate_outside_hole_max": int(dd[~hole].max()),
        "rerun_vs_disk_plate_inside_hole_mean_abs": round(float(np.abs(a - b)[hole].mean()), 2),
        "rerun_vs_disk_plate_inside_hole_px_differing_by_more_than_8": int((dd[hole] > 8).sum()),
        "rerun_vs_disk_plate_inside_hole_max": int(dd[hole].max()),
    })


# ---------------------------------------------------------------- 3 · the project's warp, twice (three)
def loops():
    for plate, name in [(W_("plate_rerun.png"), "with_infill"), ("none", "no_infill"), (P("clean_plate.png"), "with_disk_plate")]:
        subprocess.run([PY, os.path.join(HERE, "ink_flames_here.py"), plate, W_(name + ".npy")], check=True)


# ---------------------------------------------------------------- 4 · measure the tear
CROP = (284, 440, 320, 256)          # x, y, w, h in the 832x1216 frame: his head, shoulders and the plume's edge
GHOST_T = 80                          # a pixel "tears" if the two loops differ by more than this (0-255, max channel)


def measure():
    from PIL import Image
    A, B = np.load(W_("no_infill.npy")), np.load(W_("with_infill.npy"))
    C = np.load(W_("with_disk_plate.npy"))
    sm = np.load(W_("with_infill_plume.npy"))
    hf = im(P("hero_mask_feather.png"), 0)
    outside, plume = hf == 0, sm > 0.02
    D = np.abs(A.astype(int) - B.astype(int)).max(3)
    per = [int(((D[i] > GHOST_T) & outside & plume).sum()) for i in range(len(D))]
    k = int(np.argmax(per))
    ys, xs = np.where((D[k] > GHOST_T) & outside & plume)
    dist = cv2.distanceTransform(outside.astype(np.uint8), cv2.DIST_L2, 5)
    edge = (cv2.dilate((hf > 0).astype(np.uint8), np.ones((3, 3))) > 0) & outside
    ey = np.where(edge & (sm > 0.05))[0]
    static_ring = ((D > 40).all(0)) & outside
    # whole-loop check: this folder's loop over the disk plate against the project's own ink_flames.mp4
    fr = [im(f).astype(int) for f in sorted(glob.glob(W_("ref_frames", "*.png")))]
    r560 = lambda x: np.array(Image.fromarray(x[..., ::-1]).resize((560, 818), Image.LANCZOS))[..., ::-1].astype(int)
    e0 = [float(np.abs(r560(C[i]) - fr[i]).mean()) for i in range(64)]
    e8 = [float(np.abs(r560(C[i]) - fr[(i + 8) % 64]).mean()) for i in range(64)]
    x, y, w, h = CROP
    save_json("tear.json", {
        "frames": len(D), "ms_per_frame": 70, "threshold": GHOST_T,
        "tear_px_per_frame": per,
        "frames_over_100_px": int(sum(p > 100 for p in per)), "frames_over_200_px": int(sum(p > 200 for p in per)),
        "worst_frame": k, "worst_frame_px": per[k],
        "worst_bbox_xy": [int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())],
        "worst_reaches_px_beyond_his_edge": round(float(dist[ys, xs].max()), 1),
        "plume_touches_his_edge_y": [int(ey.min()), int(ey.max())],
        "plume_weight_on_his_edge_max": round(float(sm[edge].max()), 3),
        "static_ring_px_differ_every_frame": int(static_ring.sum()),
        "static_ring_note": "outside the plume the no-infill loop is the shot and the infill loop shows LaMa's fill in the hole's 5 px ring; not motion, not counted",
        "crop_xywh": list(CROP),
        "tear_px_inside_crop_all_frames": int((((D > GHOST_T) & outside & plume).any(0))[y:y + h, x:x + w].sum()),
        "tear_px_anywhere_all_frames": int((((D > GHOST_T) & outside & plume).any(0)).sum()),
        "loop_vs_project_mp4_same_frame_mean_abs": round(float(np.mean(e0)), 2),
        "loop_vs_project_mp4_8_frames_off_mean_abs": round(float(np.mean(e8)), 2),
        "disk_plate_loop_equals_rerun_plate_loop": bool(np.array_equal(B, C)),
    })


# ---------------------------------------------------------------- 4b · where the tear comes from, and the haze
HEAD = (300, 505, 170, 110)          # x, y, w, h: the part of LaMa's hole behind his head and hair


def sources():
    """The shot and the plate differ only inside LaMa's hole, which is two parts: his own pixels
    (feather > 100) and the 5 px ring the dilation adds around them. Put back from the shot only one
    part at a time, warp that hybrid plate with the same script, and count its tear as measure() does.
    Then the haze: what LaMa's fill behind his head is made of, and how much each loop darkens near his edge."""
    shot, plate = im(W_("shot_rebuilt.png")), im(W_("plate_rerun.png"))
    hf = im(P("hero_mask_feather.png"), 0)
    hole = lama_mask(hf)
    his, ring = hf > 100, hole & ~(hf > 100)
    for part, m in (("his", his), ("ring", ring)):
        hy = plate.copy(); hy[m] = shot[m]
        cv2.imwrite(W_(f"plate_{part}.png"), hy)
        subprocess.run([PY, os.path.join(HERE, "ink_flames_here.py"), W_(f"plate_{part}.png"), W_(f"only_{part}.npy")], check=True)
    A, B = np.load(W_("no_infill.npy")), np.load(W_("with_infill.npy"))
    sm = np.load(W_("with_infill_plume.npy"))
    outside, plume = hf == 0, sm > 0.02
    tear = lambda X: [(np.abs(X[i].astype(int) - B[i].astype(int)).max(2) > GHOST_T) & outside & plume for i in range(len(B))]
    T, Th, Tr = tear(A), tear(np.load(W_("only_his.npy"))), tear(np.load(W_("only_ring.npy")))
    n = lambda L: [int(t.sum()) for t in L]
    t, th, tr = n(T), n(Th), n(Tr)
    k = int(np.argmax(t))
    g = lambda a: a.astype(float).mean(2)
    x, y, w, h = HEAD
    head = np.zeros_like(hole); head[y:y + h, x:x + w] = True
    zone = hole & head
    near = (cv2.distanceTransform(outside.astype(np.uint8), cv2.DIST_L2, 5) <= 20) & outside & plume
    darkA = [int(((g(shot) - g(A[i]))[near] > GHOST_T).sum()) for i in range(len(A))]
    darkB = [int(((g(plate) - g(B[i]))[near] > GHOST_T).sum()) for i in range(len(B))]
    save_json("sources.json", {
        "method": "tear px = the two loops differ by more than threshold (max channel), outside his mask, inside the plume; each part's tear is its hybrid plate's loop against the infill loop",
        "threshold": GHOST_T,
        "peak_frame": k,
        "peak_frame_px": {"tear": t[k], "his_pixels_only": th[k], "ring_only": tr[k]},
        "peak_frame_share_his": round(th[k] / (th[k] + tr[k]), 3),
        "whole_loop_px": {"tear": sum(t), "his_pixels_only": sum(th), "ring_only": sum(tr)},
        "whole_loop_share_his": round(sum(th) / (sum(th) + sum(tr)), 3),
        "ring_only_px_per_frame_median": int(np.median(tr)),
        "his_pixels_only_per_frame": th, "ring_only_per_frame": tr,
        "haze": {
            "zone": "LaMa's hole within x 300-470, y 505-615 (behind his head and hair)",
            "zone_px": int(zone.sum()),
            "fill_mean_grey": round(float(g(plate)[zone].mean()), 1),
            "fill_pct_darker_than_70": round(100 * float((g(plate)[zone] < 70).mean()), 1),
            "shot_mean_grey": round(float(g(shot)[zone].mean()), 1),
            "shot_pct_darker_than_70": round(100 * float((g(shot)[zone] < 70).mean()), 1),
            "near_edge": "outside his mask, inside the plume, within 20 px of his edge; px darkened by more than threshold against the loop's own unwarped ground (the shot for the left loop, the plate for the right)",
            "infill_skipped_peak_px": max(darkA), "infill_skipped_peak_frame": int(np.argmax(darkA)),
            "infill_done_peak_px": max(darkB), "infill_done_peak_frame": int(np.argmax(darkB)),
        },
    })


# ---------------------------------------------------------------- 5 · render the piece
PAPER, INK, INK3, RULE, RED = "#f0eee5", "#1a1916", "#6a6862", "#b8b09a", "#c8261a"
WIDTH, HEIGHT = 1000, 380
SCALE = 1.2                                   # the crop is shown at 1.2x its pixels
TH_W = 172                                    # the thumbnail of the whole frame
GAP, TOP, LEFT = 14, 54, 10


def layout():
    x, y, w, h = CROP
    pw, ph = round(w * SCALE), round(h * SCALE)
    th_h = round(1216 * TH_W / 832)
    ax = LEFT + TH_W + GAP + 8
    bx = ax + pw + GAP
    return dict(pw=pw, ph=ph, th_h=th_h, tx=LEFT, ty=TOP, ax=ax, bx=bx, py=TOP)


def svg_overlay(L, t):
    x, y, w, h = CROP
    s = TH_W / 832
    bx0, bx1, by0, by1 = t["worst_bbox_xy"]
    # the ring: around where the tear shows, in panel coordinates, drawn the same on both panels
    cx = ((bx0 + bx1) / 2 - x) * SCALE; cy = ((by0 + by1) / 2 - y) * SCALE
    rx = (bx1 - bx0) / 2 * SCALE + 18; ry = (by1 - by0) / 2 * SCALE + 14
    lab = lambda X, Y, s_, size=19, fill=INK, wgt=600: f'<text x="{X}" y="{Y}" font-family="IBM Plex Mono" font-weight="{wgt}" font-size="{size}" fill="{fill}">{s_}</text>'
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">']
    parts.append(lab(L["tx"], 36, "shot 02", 15, INK3, 400))
    for col, sw in ((PAPER, 4), (INK, 1.5)):   # paper under ink, so the box holds on dark and light ground
        parts.append(f'<rect x="{L["tx"] + x * s:.1f}" y="{L["ty"] + y * s:.1f}" width="{w * s:.1f}" height="{h * s:.1f}" fill="none" stroke="{col}" stroke-width="{sw}"/>')
    parts.append(f'<rect x="{L["tx"] + .5}" y="{L["ty"] + .5}" width="{TH_W - 1}" height="{L["th_h"] - 1}" fill="none" stroke="{RULE}" stroke-width="1"/>')
    for X, title in [(L["ax"], "infill skipped"), (L["bx"], "infill done")]:
        parts.append(lab(X, 36, title))
        parts.append(f'<rect x="{X + .5}" y="{L["py"] + .5}" width="{L["pw"] - 1}" height="{L["ph"] - 1}" fill="none" stroke="{RULE}" stroke-width="1"/>')
        parts.append(f'<ellipse cx="{X + cx:.1f}" cy="{L["py"] + cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="none" stroke="{RED}" stroke-width="1.5" stroke-dasharray="5 4"/>')
    parts.append('</svg>')
    return "\n".join(parts)


def render():
    from PIL import Image
    t = json.load(open(os.path.join(HERE, "tear.json")))
    L = layout()
    with open(os.path.join(HERE, "overlay.svg"), "w") as f:
        f.write(svg_overlay(L, t))
    subprocess.run(["node", os.path.join(HERE, "rasterize.mjs"), os.path.join(HERE, "overlay.svg"), W_("overlay.png"), str(WIDTH), str(HEIGHT)], check=True)
    over = Image.open(W_("overlay.png")).convert("RGBA")
    A, B = np.load(W_("no_infill.npy")), np.load(W_("with_infill.npy"))
    shot = Image.open(W_("shot_rebuilt.png")).convert("RGB").resize((TH_W, L["th_h"]), Image.LANCZOS)
    x, y, w, h = CROP
    rgb = lambda a: Image.fromarray(a[..., ::-1])
    frames = []
    for i in range(len(A)):
        fr = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
        fr.paste(shot, (L["tx"], L["ty"]))
        fr.paste(rgb(A[i][y:y + h, x:x + w]).resize((L["pw"], L["ph"]), Image.LANCZOS), (L["ax"], L["py"]))
        fr.paste(rgb(B[i][y:y + h, x:x + w]).resize((L["pw"], L["ph"]), Image.LANCZOS), (L["bx"], L["py"]))
        fr = Image.alpha_composite(fr.convert("RGBA"), over).convert("RGB")
        frames.append(fr)
    out = os.path.join(HERE, "tear-at-the-edge.webp")
    frames[0].save(out, save_all=True, append_images=frames[1:], duration=70, loop=0, quality=82, method=6)
    frames[t["worst_frame"]].save(os.path.join(HERE, "tear-at-the-edge-still.png"))
    print("WROTE", out, len(frames), "frames,", os.path.getsize(out) // 1024, "KB; still = frame", t["worst_frame"])


if __name__ == "__main__":
    st = sys.argv[1] if len(sys.argv) > 1 else "all"
    steps = {"rebuild": rebuild, "lama": lama, "loops": loops, "check": check, "measure": measure, "sources": sources, "render": render}
    for k in (steps if st == "all" else [st]):
        steps[k]()
