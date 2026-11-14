#!/usr/bin/env python3
"""
Depth Anything V2 (Small) — one image to a depth PNG, and optionally FRONT / MID / BACK band masks.

  <comfy venv>/python depth_map.py IMAGE OUTDIR [--bands] [--long-edge 1024] [--feather 5]

Writes OUTDIR/depth.png (8-bit, 0 = far, 255 = near, at the input's size) and with --bands
band_front.png, band_mid.png, band_back.png (33rd / 66th percentile thresholds, each dilated
--feather px, as the Recipe says). Runs on MPS when it is there. The model,
depth-anything/Depth-Anything-V2-Small-hf, is pulled once into the Hugging Face cache.

Written 2026-11-14 for the Depth Anything card check; the shot-specific ancestor is
Projects/BLUELINE/proofs/blender-fire/depth_test.py.
"""
import argparse, os, time
import numpy as np, cv2, torch
from PIL import Image
from transformers import pipeline

ap = argparse.ArgumentParser()
ap.add_argument("image"); ap.add_argument("outdir")
ap.add_argument("--bands", action="store_true")
ap.add_argument("--long-edge", type=int, default=1024)
ap.add_argument("--feather", type=int, default=5)
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
img = Image.open(a.image).convert("RGB"); W, H = img.size
s = a.long_edge / max(W, H)
small = img.resize((round(W * s), round(H * s)), Image.LANCZOS) if s < 1 else img
dev = "mps" if torch.backends.mps.is_available() else "cpu"
t0 = time.time()
pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device=dev)
t1 = time.time()
d = pipe(small)["predicted_depth"].squeeze().detach().cpu().numpy().astype(np.float32)
t2 = time.time()
d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
d8 = cv2.normalize(d, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)   # inverse depth: high = near
cv2.imwrite(os.path.join(a.outdir, "depth.png"), d8)
msg = f"Depth Anything on {dev}: load {t1-t0:.1f}s, infer {t2-t1:.2f}s, {W}x{H}, range {d8.min()}-{d8.max()}"
if a.bands:
    lo, hi = np.percentile(d8, [33, 66])
    k = np.ones((a.feather, a.feather), np.uint8)
    for name, band in (("back", d8 <= lo), ("mid", (d8 > lo) & (d8 <= hi)), ("front", d8 > hi)):
        cv2.imwrite(os.path.join(a.outdir, f"band_{name}.png"), cv2.dilate(band.astype(np.uint8) * 255, k))
    msg += f", bands at {lo:.0f}/{hi:.0f}"
print(msg)
