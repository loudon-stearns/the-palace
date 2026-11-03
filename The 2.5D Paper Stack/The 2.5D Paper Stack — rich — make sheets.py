#!/usr/bin/env python3
"""
title: The 2.5D Paper Stack — rich — make sheets
born: 2026-11-03
links: [[The 2.5D Paper Stack]] connects-to · workshop for its rich face · [[BLUELINE]] gathers-from · track VI's sky plate and its own cutter
forward_vector: I cut BLUELINE track VI's sky plate into the sheets the rich face's pieces play with, using
  track VI's own content-aware cutter, and I write down where the ridge's ink actually ends, so the pieces
  can test a cut against the drawing rather than against themselves. I change only when the plate or the
  cutter does.

Run from the palace root:
  python3 "The 2.5D Paper Stack/The 2.5D Paper Stack — rich — make sheets.py"

Writes into "The 2.5D Paper Stack/sheets/":
  ridge-density.png  the ridge as track VI's cutter finds it (lib/layers.solid_silhouette, dilate=0):
                     the 0.5 contour of local dark density, before the cutter's own 2 px dilation
  ridge-ink.png      the ridge's ink: the density mass plus the dark fringe (L < 0.45) within 6 px
                     outside it and connected to it, minus the figure above its feet. Its edge is where
                     the ridge's black actually meets the paper; the pieces call it the ink's edge.
  figure-ink.png     the walker on the ridge: dark pixels (L < 0.55) in a box around him, connected to
                     his head, holes filled, 1 px grown. Below his feet the cut runs 6 rows into the ridge's black, as wide as he stands.
  sky-behind.png     the back sheet: the plate with the ridge (grown 8 px) and the figure (grown 4 px)
                     filled from their surroundings by normalized convolution, coarse to fine. It is
                     a fill, not a sheet: a piece takes the plate wherever its cut leaves the plate
                     on the back sheet, and this file only inside the cut. Only a few pixels of it
                     ever show beside the ridge; the rest is the ridge's underside.
  sheets.json        the parameters, and the reference numbers the piece's own engine must reproduce
"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy.ndimage import (distance_transform_edt as edt, label, binary_fill_holes,
                           binary_dilation, gaussian_filter)
from scipy.special import erfc

ROOT = os.getcwd()
TV = os.path.join(ROOT, "Projects/BLUELINE/proofs/track-VI-elemental-motion")
OUT = os.path.join(ROOT, "The 2.5D Paper Stack", "sheets")
sys.path.insert(0, os.path.join(TV, "lib"))
import layers as LZ  # track VI's own cutter

P = LZ.load_rgb(os.path.join(TV, "plates", "sky.png"))
L = LZ.lum(P)
H, W = L.shape

# 1. track VI's cut, before its dilation
M = LZ.solid_silhouette(P, dark=0.45, touch="bottom", dilate=0) > 0.5

def sdf_of(mask):
    """signed distance in px, pixel centre to the nearest pixel of the other side; negative inside"""
    return np.where(mask, -edt(mask), edt(~mask)).astype(np.float32)

sdfM = sdf_of(M)

# 2. the figure
FB = (348, 432, 416, 540)            # x0, y0, x1, y1
FEET = 528                           # below this row the figure stands inside the ridge's black
box = np.zeros_like(M); box[FB[1]:FB[3], FB[0]:FB[2]] = True
dark = (L < 0.55) & box
lab, n = label(dark)
head = lab[452, 378]
assert head > 0, "the figure's head is not dark at (378, 452)"
fig = lab == head
# below his feet the dark runs on into the ridge: keep only a few rows under the legs, so the
# cut between him and the ridge runs through the ridge's black, as wide as he stands
legs = np.where(fig[FEET - 2])[0]
low = np.zeros_like(fig); low[FEET:FEET + 6, legs.min() - 2:legs.max() + 3] = True
fig = fig & ((np.arange(H)[:, None] < FEET) | low)
fig = binary_fill_holes(fig)
fig = binary_dilation(fig, iterations=1)

# 3. the ridge's ink: the density mass plus the dark fringe just outside it, connected to it,
#    minus the figure above his feet (the density cutter swallowed most of him, and some sky with him)
fringe = (sdfM > 0) & (sdfM <= 6) & (L < 0.45)
lab, n = label(M | fringe)
keep = np.unique(lab[M]); keep = keep[keep > 0]
T = np.isin(lab, keep)
above = np.zeros_like(T); above[FB[1]:FEET, FB[0]:FB[2]] = True
T = T & ~(above & (fig | (L >= 0.45)))   # keep the ridge's own dark ink in the box; drop the figure and the swallowed sky
lab, n = label(T)
sizes = np.bincount(lab.ravel()); sizes[0] = 0
T = lab == sizes.argmax()            # one sheet: the largest piece
T = binary_fill_holes(T)

# 4. the back sheet: fill the holes from their surroundings
hole = binary_dilation(T, iterations=8) | binary_dilation(fig, iterations=4)
known = (~hole).astype(np.float32)
sky = P.copy()
fill = np.zeros_like(P)
filled = np.zeros((H, W), bool)
for s in [400, 200, 96, 48, 24, 12, 6, 3]:     # coarse to fine: each finer pass overwrites where it has support
    w = gaussian_filter(known, s)
    ok = w > 0.08
    for c in range(3):
        est = gaussian_filter(P[..., c] * known, s) / np.maximum(w, 1e-6)
        fill[..., c] = np.where(ok, est, fill[..., c])
    filled |= ok
for c in range(3):
    fill[..., c] = gaussian_filter(fill[..., c], 2)
sky[hole] = fill[hole]

def save_mask(m, name):
    Image.fromarray((m.astype(np.uint8) * 255), "L").save(os.path.join(OUT, name), optimize=True)

os.makedirs(OUT, exist_ok=True)
save_mask(M, "ridge-density.png")
save_mask(T, "ridge-ink.png")
save_mask(fig, "figure-ink.png")
Image.fromarray((np.clip(sky, 0, 1) * 255 + 0.5).astype(np.uint8), "RGB").save(os.path.join(OUT, "sky-behind.png"), optimize=True)

# 5. reference numbers, computed here independently of the piece's engine (scipy EDT, erfc)
#    Everything below is on luminance read back from the saved 8-bit files, as the piece reads them.
L8 = np.asarray(Image.open(os.path.join(TV, "plates", "sky.png")).convert("RGB"), np.float32).mean(2) / 255.0
S8 = np.asarray(Image.open(os.path.join(OUT, "sky-behind.png")).convert("RGB"), np.float32).mean(2) / 255.0
sdf = sdf_of(T)
e = np.where(sdf > 0, sdf - 0.5, sdf + 0.5)           # pixel centre to the edge line
zone = np.abs(sdf) <= 40
zone[FB[1] - 40:FB[3] + 10, FB[0] - 40:FB[2] + 40] = False   # leave the figure out of the edge count
B = 4
zone[:B, :] = zone[-B:, :] = False; zone[:, :B] = zone[:, -B:] = False
# the ridge meets the image's own border at the bottom and sides: that edge is the paper's, not the ink's
nearborder = np.zeros_like(zone); nearborder[:44, :] = nearborder[-44:, :] = True; nearborder[:, :44] = nearborder[:, -44:] = True
zone &= ~nearborder
inner = T & (sdf >= -1.0) & zone                      # boundary pixels on the ink side
Lb = int(inner.sum())

def cityblock_dilate(m, k):
    st = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)
    return binary_dilation(m, structure=st, iterations=k) if k else m

def gauss_small(a, s):
    return np.clip(gaussian_filter(a, s, mode="nearest", truncate=3.75), 0, 1)

cuts = [
    ("edge", "hard, at the ink's edge", (sdf < 0).astype(np.float32)),
    ("in2", "hard, 2 px inside the ink", (sdf < -2).astype(np.float32)),
    ("in4", "hard, 4 px inside the ink", (sdf < -4).astype(np.float32)),
    ("out2", "hard, 2 px outside the ink", (sdf <= 2).astype(np.float32)),
    ("out4", "hard, 4 px outside the ink", (sdf <= 4).astype(np.float32)),
    ("f2", "feather 2 px, centred on the edge", (0.5 * erfc(e / (2 * np.sqrt(2)))).astype(np.float32)),
    ("f6", "feather 6 px, centred on the edge", (0.5 * erfc(e / (6 * np.sqrt(2)))).astype(np.float32)),
    ("f12", "feather 12 px, centred on the edge", (0.5 * erfc(e / (12 * np.sqrt(2)))).astype(np.float32)),
    ("o6", "feather 6 px, pushed outside the ink", np.where(e <= 0, 1.0, erfc(np.maximum(e, 0) / (6 * np.sqrt(2)))).astype(np.float32)),
    ("density", "track VI's density contour, undilated", M.astype(np.float32)),
    ("trackvi", "track VI's own cut: density contour, 2 px dilation, 0.8 px soften", gauss_small(cityblock_dilate(M, 2).astype(np.float32), 0.8)),
]
ref = {}
for key, name, a in cuts:
    back = np.where(a >= 0.5, S8, L8)
    C0 = a * L8 + (1 - a) * back
    d = np.abs(C0 - L8)[zone]
    ref[key] = {
        "name": name,
        "carried": float((a * (sdf > 0))[zone].sum() / Lb),
        "left": float(((1 - a) * (sdf < 0))[zone].sum() / Lb),
        "rest_mean": float(255 * d.mean()),
        "rest_visible": float(100 * (d > 16 / 255).mean()),
    }

prof = {}
for s in [-3, -2, -1, 1, 2, 3]:
    band = zone & (np.round(sdf) == s) if s > 0 else zone & (np.round(sdf) == s)
    prof[str(s)] = float(L8[band].mean())

meta = {
    "title": "The 2.5D Paper Stack — rich — sheets",
    "born": "2026-11-03",
    "links": [{"target": "[[The 2.5D Paper Stack]]", "type": "connects-to", "label": "sheets-for-its-rich-face"},
              {"target": "[[BLUELINE]]", "type": "emerged-from", "label": "track-VI-sky-plate"}],
    "forward_vector": "I am BLUELINE track VI's sky plate cut into sheets with track VI's own cutter, and the record of where the ridge's ink actually ends, so the rich face's pieces test a cut against the drawing. I change only when the plate or the cutter does.",
    "made_by": "The 2.5D Paper Stack — rich — make sheets.py",
    "plate": "/Projects/BLUELINE/proofs/track-VI-elemental-motion/plates/sky.png",
    "size": [W, H],
    "figure_box": list(FB), "figure_feet_row": FEET,
    "mouth": [381, 458],
    "ridge_cover": float(T.mean()), "density_cover": float(M.mean()),
    "edge_zone": "pixels within 40 px of the ridge-ink edge, leaving out the figure's box (+40 px) and 44 px at the image border",
    "boundary_px": Lb,
    "luminance_across_the_ink_edge": prof,
    "reference": ref,
}
json.dump(meta, open(os.path.join(OUT, "sheets.json"), "w"), indent=1)
print(json.dumps({k: {kk: round(vv, 3) for kk, vv in v.items() if kk != "name"} for k, v in ref.items()}, indent=0))
print("boundary px", Lb, "profile", {k: round(v, 3) for k, v in prof.items()})
