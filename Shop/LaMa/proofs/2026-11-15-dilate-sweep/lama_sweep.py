#!/usr/bin/env python3
"""
LaMa dilate sweep and one very large hole, on the 2026-11-14 card check's input.

  <comfy venv>/python lama_sweep.py IMAGE MASK OUTDIR [--dilate 9 21 41] [--big 0.15,0.12,0.85,0.92]

For each --dilate value: SAM's figure mask dilated by that many px (a square kernel, as
lama_fill.py does), filled by LaMa, every pixel outside the dilated mask pasted back.
Then one very large hole: the box --big (fractions x0,y0,x1,y1) unioned with the mask
dilated by the largest value, filled the same way.

Measures, per fill: the hole as a share of the frame; load and fill time; that pixels outside
the hole are unchanged; and a "ghost" number: in a ring 4-24 px outside the hole, the mean
absolute difference between the plate and a fog estimate (the plate median-blurred 41 px).
The ring is pasted back from the input, so the ring number says how much figure-coloured
haze is left just outside the hole; lower means less ghost left beside the fill. Because that
ring moves out as the hole grows, a second number holds the region fixed: in the band 0-48 px
outside SAM's original mask (the sword's box left out), the mean absolute difference between
the plate and a fog model (per row, the median colour of pixels far from the figure); the
input's own value is reported as the baseline. Both are proxies: only an eye judges whether a
ghost shows.
Written 2026-11-15 for the LaMa test, from the 2026-11-14 card check's lama_fill.py.
A maker with a better way does it that way and leaves the comparison on the scroll.
"""
import argparse, json, os, time
import numpy as np, cv2
from PIL import Image
from simple_lama_inpainting import SimpleLama

ap = argparse.ArgumentParser()
ap.add_argument("image"); ap.add_argument("mask"); ap.add_argument("outdir")
ap.add_argument("--dilate", type=int, nargs="+", default=[9, 21, 41])
ap.add_argument("--big", default="0.15,0.12,0.85,0.92")
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
img = Image.open(a.image).convert("RGB"); W, H = img.size
src = np.array(img)
m0 = cv2.resize(cv2.imread(a.mask, 0), (W, H), interpolation=cv2.INTER_NEAREST) > 127
t0 = time.time(); lama = SimpleLama(); load = time.time() - t0


def dil(mask, k):
    return cv2.dilate(mask.astype(np.uint8) * 255, np.ones((max(1, k), max(1, k)), np.uint8)) > 127


far = ~dil(m0, 121)
fogrow = np.zeros_like(src, dtype=np.int32)
for y in range(H):
    row = src[y][far[y]]
    fogrow[y] = np.median(row, axis=0) if len(row) else src[y].mean(axis=0)
BAND = dil(m0, 97) & ~m0
SWORD = (0.58, 0.55, 0.92, 0.74)                  # fractions x0,y0,x1,y1: the blade, outside the mask
BAND[int(SWORD[1] * H):int(SWORD[3] * H), int(SWORD[0] * W):int(SWORD[2] * W)] = False


def fill(hole, name):
    t0 = time.time()
    res = np.array(lama(img, Image.fromarray(hole.astype(np.uint8) * 255)))[:H, :W].copy()
    dt = time.time() - t0
    keep = ~hole
    res[keep] = src[keep]
    Image.fromarray(res).save(os.path.join(a.outdir, f"plate_{name}.png"))
    cv2.imwrite(os.path.join(a.outdir, f"hole_{name}.png"), hole.astype(np.uint8) * 255)
    ring = dil(hole, 49) & ~dil(hole, 9)
    fog = cv2.medianBlur(res, 41).astype(np.int32)
    ghost = float(np.abs(res.astype(np.int32) - fog)[ring].mean())
    # the same band for every fill: 0-48 px outside SAM's original mask, sword box left out,
    # against a fog model (per row, the median of pixels far from the figure)
    band_ghost = float(np.abs(res.astype(np.int32) - fogrow)[BAND].mean())
    r = {"name": name, "hole_pct": round(100 * float(hole.mean()), 1), "fill_s": round(dt, 2),
         "outside_unchanged": bool((res[keep] == src[keep]).all()), "ring_ghost_mad": round(ghost, 2),
         "fixed_band_vs_fog_mad": round(band_ghost, 2)}
    print(json.dumps(r)); return r


runs = [fill(dil(m0, k), f"dilate{k:02d}") for k in a.dilate]
x0, y0, x1, y1 = map(float, a.big.split(","))
big = dil(m0, max(a.dilate)).copy()
big[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)] = True
runs.append(fill(big, "bighole"))
json.dump({"date": "2026-11-15", "device": "cpu", "image": a.image, "mask": a.mask, "size": [W, H],
           "load_s": round(load, 2),
           "input_fixed_band_vs_fog_mad": round(float(np.abs(src.astype(np.int32) - fogrow)[BAND].mean()), 2),
           "runs": runs}, open(os.path.join(a.outdir, "measured.json"), "w"), indent=1)
