#!/usr/bin/env python3
"""
LaMa — fill a masked hole and write the clean plate.

  <comfy venv>/python lama_fill.py IMAGE MASK OUT.png [--dilate 9]

MASK: white = remove and fill (a SAM mask.png, a keypoint mask or a depth silhouette).
It is dilated by --dilate px (default 9, the Recipe's 5-10 px) so no halo of the old
foreground survives. Pixels outside the dilated mask are pasted back from the input,
so they are unchanged by construction, and the script checks it. Uses
simple-lama-inpainting's big-lama weights (cached in ~/.cache/torch/hub/checkpoints/).

Written 2026-11-14 for the LaMa card check.
"""
import argparse, time
import numpy as np, cv2
from PIL import Image
from simple_lama_inpainting import SimpleLama

ap = argparse.ArgumentParser()
ap.add_argument("image"); ap.add_argument("mask"); ap.add_argument("out")
ap.add_argument("--dilate", type=int, default=9)
a = ap.parse_args()
img = Image.open(a.image).convert("RGB")
m = cv2.imread(a.mask, 0)
m = cv2.resize(m, img.size, interpolation=cv2.INTER_NEAREST)
k = max(1, a.dilate)
m = cv2.dilate((m > 127).astype(np.uint8) * 255, np.ones((k, k), np.uint8))
t0 = time.time()
lama = SimpleLama()
t1 = time.time()
res = lama(img, Image.fromarray(m))
t2 = time.time()
res = np.array(res)[: img.size[1], : img.size[0]]          # LaMa pads to /8; crop back
src = np.array(img)
keep = m < 128
res[keep] = src[keep]
Image.fromarray(res).save(a.out)
print(f"LaMa: hole {100*float((m>127).mean()):.1f}% of frame, load {t1-t0:.1f}s, fill {t2-t1:.1f}s, "
      f"outside-mask unchanged: {bool((res[keep]==src[keep]).all())}, size {res.shape[1]}x{res.shape[0]}")
