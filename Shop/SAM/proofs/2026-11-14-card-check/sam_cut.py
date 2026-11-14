#!/usr/bin/env python3
"""
SAM — cut one object (prompted) or every object (auto) out of an image, as binary masks.

  <comfy venv>/python sam_cut.py IMAGE OUTDIR --point 0.5,0.45        # prompted: one mask, x,y as fractions
  <comfy venv>/python sam_cut.py IMAGE OUTDIR --box 0.2,0.25,0.9,0.9  # prompted by a box, fractions
  <comfy venv>/python sam_cut.py IMAGE OUTDIR --auto                  # every object, MobileSAM

Writes OUTDIR/mask.png (prompted; white = the object) or OUTDIR/mask_NN.png (auto), plus
overlay.png to look at. Weights: sam_b.pt (prompted) and mobile_sam.pt (auto), from --weights
(default: the folder the 2026-06-25 session left them in, in the main checkout; ultralytics
downloads a missing one into the working directory). On this Mac ultralytics runs on the CPU;
no device is passed.
Convert line art to photoreal or flat cel before it comes here (Shop/SAM.md, § The wall).

Written 2026-11-14 for the SAM card check.
"""
import argparse, os, time
import numpy as np, cv2
from ultralytics import SAM

WEIGHTS = "/Users/loudonstearns/Documents/The Palace/Projects/BLUELINE/proofs/blender-fire"

ap = argparse.ArgumentParser()
ap.add_argument("image"); ap.add_argument("outdir")
g = ap.add_mutually_exclusive_group(required=True)
g.add_argument("--point"); g.add_argument("--box"); g.add_argument("--auto", action="store_true")
ap.add_argument("--weights", default=WEIGHTS)
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
img = cv2.imread(a.image); H, W = img.shape[:2]
t0 = time.time()
if a.auto:
    m = SAM(os.path.join(a.weights, "mobile_sam.pt"))
    r = m(a.image, verbose=False)
else:
    m = SAM(os.path.join(a.weights, "sam_b.pt"))
    if a.point:
        x, y = map(float, a.point.split(","))
        r = m(a.image, points=[[int(x * W), int(y * H)]], labels=[1], verbose=False)
    else:
        x0, y0, x1, y1 = map(float, a.box.split(","))
        r = m(a.image, bboxes=[[int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)]], verbose=False)
dt = time.time() - t0
masks = [] if r[0].masks is None else [cv2.resize((mk.cpu().numpy() * 255).astype(np.uint8), (W, H),
                                                  interpolation=cv2.INTER_NEAREST) for mk in r[0].masks.data]
over = img.copy()
rng = np.random.default_rng(0)
for i, mk in enumerate(masks):
    name = "mask.png" if not a.auto else f"mask_{i:02d}.png"
    cv2.imwrite(os.path.join(a.outdir, name), mk)
    col = rng.integers(60, 255, 3) if a.auto else np.array([0, 140, 255])
    over[mk > 127] = (0.5 * over[mk > 127] + 0.5 * col).astype(np.uint8)
cv2.imwrite(os.path.join(a.outdir, "overlay.png"), over)
cover = [round(100 * float((mk > 127).mean()), 1) for mk in masks]
print(f"SAM {'auto' if a.auto else 'prompted'}: {len(masks)} mask(s), {dt:.1f}s, coverage % {cover[:12]}")
