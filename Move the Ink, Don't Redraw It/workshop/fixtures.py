#!/usr/bin/env python3
"""
Fixtures for rich-checks.mjs: what BLUELINE's own bench code says, for the piece engines to
be checked against. Run from the palace root with `python3 -I`; prints one JSON object.

  field   : fields.smoke(1216, 832) x the smoke plate's mask and anchor (plates/smoke.json:
            auto:top:0.7, feather 24, anchor base), sampled at whole full-size pixels
  warp    : warp.warp_image on a small random image and field (scipy map_coordinates,
            order 1, mode reflect), for the JS warp to match
  plate   : the piece's own inlined JPEG, decoded to grey 0..1, as a flat list
  blur    : scipy gaussian_filter at sigma 0.8 and 7 on a small random image
  npr     : stylize.npr_ink on a small random grey and tooth
  presets : each bench field at its default push, times its plate's mask and anchor, over the
            60 frames of a loop: the tightest det J of the source map x - d(x), the pixels and
            frames where it goes below zero, and the factor on the push at which it first would
"""
import sys, os, json, re, base64, io
import numpy as np

ROOT = os.getcwd()
LIB = os.path.join(ROOT, "Projects/BLUELINE/proofs/track-VI-elemental-motion/lib")
sys.path.insert(0, LIB)
import fields as F
import warp as Wp
import stylize as St
from scipy.ndimage import gaussian_filter
from PIL import Image

H, W = 1216, 832
out = {}

f = F.smoke(H, W)
m = Wp.build_mask("auto:top:0.7", H, W, feather=24)
c = m * Wp.base_anchor_weight(m)
rng = np.random.default_rng(11)
pts = [(int(rng.integers(0, W)), int(rng.integers(0, H))) for _ in range(400)]
samples = []
for t in (0.0, 0.3, 0.75):
    dx, dy = f(t)
    for X, Y in pts:
        samples.append([X, Y, t, float(dx[Y, X]), float(dy[Y, X]), float(c[Y, X])])
out["field"] = samples

r = np.random.default_rng(5)
img = r.random((30, 40, 1)).astype(np.float32)
fdx = (r.random((30, 40)).astype(np.float32) - 0.5) * 9
fdy = (r.random((30, 40)).astype(np.float32) - 0.5) * 9
res = Wp.warp_image(img, fdx, fdy)
out["warp"] = {"w": 40, "h": 30, "img": img[..., 0].ravel().tolist(), "dx": fdx.ravel().tolist(),
               "dy": fdy.ravel().tolist(), "out": res[..., 0].ravel().tolist()}

piece = os.path.join(ROOT, "Move the Ink, Don't Redraw It",
                     "Move the Ink, Don't Redraw It — rich — move it or redraw it.html")
b64 = re.search(r"data:image/jpeg;base64,([A-Za-z0-9+/=]+)", open(piece).read()).group(1)
g = np.asarray(Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB"), np.float32).sum(2) / 765.0
out["plate"] = {"w": g.shape[1], "h": g.shape[0], "g": [round(float(v), 5) for v in g.ravel()]}
r2 = np.random.default_rng(9)
bimg = r2.random((64, 80)).astype(np.float32)
out["blur"] = {"w": 80, "h": 64, "img": bimg.ravel().tolist(),
               "s08": gaussian_filter(bimg, 0.8).ravel().tolist(), "s7": gaussian_filter(bimg, 7.0).ravel().tolist()}
ngray = r2.random((20, 20)).astype(np.float32); ntooth = r2.random((20, 20)).astype(np.float32)
out["npr"] = {"gray": ngray.ravel().tolist(), "tooth": ntooth.ravel().tolist(),
              "out": St.npr_ink(ngray, ntooth)[..., 0].ravel().tolist()}

PLATES = {"sky": ("auto:top:0.55", None), "dust": ("auto:bottom:0.6", None), "water": ("auto:bottom:0.5", None),
          "smoke": ("auto:top:0.7", "base"), "flame": ("auto:mid", "base")}   # plates/<name>.json
def measure(name, mask, anchor, amp=1.0):
    fld = F.PRESETS[name](H, W)
    mk = Wp.build_mask(mask, H, W, feather=24)
    cf = mk * (Wp.base_anchor_weight(mk) if anchor == "base" else 1.0) * amp
    tight, neg_px, neg_frames, fold = 9.0, 0, 0, 1e9
    fold_px, fold_frames = 0, 0
    for i in range(60):
        dx, dy = fld(i / 60)
        dx = dx * cf; dy = dy * cf
        a = np.gradient(dx, axis=1); b = np.gradient(dx, axis=0); c2 = np.gradient(dy, axis=1); d = np.gradient(dy, axis=0)
        det = (1 - a) * (1 - d) - b * c2
        tight = min(tight, float(det.min()))
        n = int((det < 0).sum()); neg_px = max(neg_px, n); neg_frames += 1 if n else 0
        # det(s) = 1 - s(a+d) + s^2(ad - bc) as the push s grows from 0: the smallest s > 0 where it reaches zero
        qa, qb = a * d - b * c2, -(a + d)
        with np.errstate(divide="ignore", invalid="ignore"):
            disc = qb * qb - 4 * qa
            r1 = np.where(np.abs(qa) > 1e-12, (-qb - np.sqrt(np.maximum(disc, 0))) / (2 * qa), -1 / qb)
            r2 = np.where(np.abs(qa) > 1e-12, (-qb + np.sqrt(np.maximum(disc, 0))) / (2 * qa), -1 / qb)
            ok = disc >= 0
            cand = np.where(ok & (r1 > 0), r1, np.inf)
            cand = np.minimum(cand, np.where(ok & (r2 > 0), r2, np.inf))
        fold = min(fold, float(np.nanmin(cand)))
        # folded at this push: det reached zero somewhere on the way up from no push
        # (below zero now, or below and back above: folded on both axes)
        nf = int((cand <= 1.0).sum()); fold_px = max(fold_px, nf); fold_frames += 1 if nf else 0
    return {"tightest": tight, "neg_px": neg_px, "neg_frames": neg_frames, "fold_factor": fold,
            "folded_px": fold_px, "folded_frames": fold_frames, "pixels": H * W, "amp": amp, "mask": mask}

pres = {name: measure(name, mask, anchor) for name, (mask, anchor) in PLATES.items()}
# the loops as the bench rendered them, where experiments.html records how:
#   water_v1 "60f @24 · amp 1.3" (line 112); flame_v1 "full mask · base anchor" (line 127)
pres["water_rendered"] = measure("water", "auto:bottom:0.5", None, 1.3)
pres["flame_rendered"] = measure("flame", "full", "base", 1.0)
out["presets"] = pres
json.dump(out, sys.stdout)
