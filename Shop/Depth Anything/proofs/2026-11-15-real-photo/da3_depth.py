#!/usr/bin/env python3
"""
Depth Anything 3 — one image to a depth PNG in the same convention as depth_map.py
(8-bit, 0 = far, 255 = near, at the input's size), so V2 and DA3 can sit side by side.

  <da3 venv>/python -I da3_depth.py DA3_SRC IMAGE OUT.png [--model depth-anything/DA3-SMALL] [--res 504]

DA3_SRC is a clone of https://github.com/ByteDance-Seed/Depth-Anything-3 (its src/ goes on the
path). DA3 does not run from the ComfyUI venv: on 2026-11-15 it ran from a throwaway Python 3.12
venv in a scratch folder (torch 2.x, numpy<2, einops, omegaconf, addict, moviepy 1.0.3, evo, e3nn,
no xformers, no gsplat). DA3 returns depth (far = large); this script inverts it to match V2.
Written 2026-11-15 for the Depth Anything real-photo test. A maker with a better way does it
that way and leaves the comparison on the scroll.
"""
import argparse, json, sys, time
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("image"); ap.add_argument("out")
ap.add_argument("--model", default="depth-anything/DA3-SMALL")
ap.add_argument("--res", type=int, default=504)
a = ap.parse_args()
sys.path.insert(0, a.src.rstrip("/") + "/src")
import torch, cv2
from PIL import Image
from depth_anything_3.api import DepthAnything3

img = Image.open(a.image).convert("RGB"); W, H = img.size
dev = "mps" if torch.backends.mps.is_available() else "cpu"
t0 = time.time()
m = DepthAnything3.from_pretrained(a.model).to(device=torch.device(dev))
t1 = time.time()
p = m.inference([np.array(img)], process_res=a.res)
t2 = time.time()
d = p.depth[0].astype(np.float32)
inv = 1.0 / np.clip(d, 1e-6, None)
inv = cv2.resize(inv, (W, H), interpolation=cv2.INTER_CUBIC)
d8 = cv2.normalize(inv, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
cv2.imwrite(a.out, d8)
print(json.dumps({"model": a.model, "device": dev, "load_s": round(t1 - t0, 2), "infer_s": round(t2 - t1, 2),
                  "in": [W, H], "net_out": list(d.shape), "range": [int(d8.min()), int(d8.max())]}))
