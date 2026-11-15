#!/usr/bin/env python3
"""
Finish the 2026-11-15 LaMa test: bring Moebius's 512x512 fills back to the input's size with the
outside of the hole pasted from the input (as lama_fill.py does), measure them the same way
lama_sweep.py measures LaMa, add them to measured.json, and lay out contact-sheet.png.

  <comfy venv>/python finish_and_sheet.py

Reads, in this folder: measured.json and plate_*.png / hole_*.png from lama_sweep.py, and
moebius_raw512_<hole>.png from run_moebius.sh.
"""
import json, os, sys
import numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from sheet import make

M = json.load(open(os.path.join(HERE, "measured.json")))
src = np.array(Image.open(os.path.join(HERE, "..", "..", "..", "Blender", "tests", "renders", "prompt_only_sdxl_seed7.png")).convert("RGB"))
H, W = src.shape[:2]
m0 = cv2.resize(cv2.imread(os.path.join(HERE, "..", "..", "..", "SAM", "proofs", "2026-11-14-card-check", "prompted", "mask.png"), 0),
                (W, H), interpolation=cv2.INTER_NEAREST) > 127
dil = lambda m, k: cv2.dilate(m.astype(np.uint8) * 255, np.ones((k, k), np.uint8)) > 127
far = ~dil(m0, 121)
fogrow = np.zeros_like(src, dtype=np.int32)
for y in range(H):
    row = src[y][far[y]]
    fogrow[y] = np.median(row, axis=0) if len(row) else src[y].mean(axis=0)
BAND = dil(m0, 97) & ~m0
BAND[int(0.55 * H):int(0.74 * H), int(0.58 * W):int(0.92 * W)] = False

moeb = []
for n in ("dilate21", "bighole"):
    hole = cv2.imread(os.path.join(HERE, f"hole_{n}.png"), 0) > 127
    raw = Image.open(os.path.join(HERE, f"moebius_raw512_{n}.png")).convert("RGB").resize((W, H), Image.LANCZOS)
    res = np.array(raw); res[~hole] = src[~hole]
    Image.fromarray(res).save(os.path.join(HERE, f"moebius_plate_{n}.png"))
    ring = dil(hole, 49) & ~dil(hole, 9)
    fog = cv2.medianBlur(res, 41).astype(np.int32)
    moeb.append({"name": f"moebius_{n}", "hole_pct": round(100 * float(hole.mean()), 1),
                 "fill_s_per_image_mps_512": "about 33 (two images, 92.6 s for the whole command incl. load)",
                 "outside_unchanged": bool((res[~hole] == src[~hole]).all()),
                 "ring_ghost_mad": round(float(np.abs(res.astype(np.int32) - fog)[ring].mean()), 2),
                 "fixed_band_vs_fog_mad": round(float(np.abs(res.astype(np.int32) - fogrow)[BAND].mean()), 2)})
M["moebius"] = {"what": "hustvl/Moebius ft_places2, 0.22B, ECCV 2026; run at 512x512 (the CLI squares the 768x1024 input), "
                        "20 DDIM steps, cfg 2.0, MPS, from a throwaway venv; resized back with the outside pasted from the input",
                "runs": moeb}
json.dump(M, open(os.path.join(HERE, "measured.json"), "w"), indent=1)
print(json.dumps(moeb, indent=1))

inp = os.path.join(HERE, "..", "..", "..", "Blender", "tests", "renders", "prompt_only_sdxl_seed7.png")
CROP = (180, 230, 620, 900)          # the figure's region, where a ghost or halo would be
crops = os.path.join(HERE, "crops"); os.makedirs(crops, exist_ok=True)
def crop(name):
    p = os.path.join(crops, name); Image.open(os.path.join(HERE, name)).crop(CROP).save(p); return p
r = {x["name"]: x for x in M["runs"]}
hole_over = src.copy(); hb = cv2.imread(os.path.join(HERE, "hole_bighole.png"), 0) > 127
hole_over[hb] = (0.4 * hole_over[hb] + 0.6 * np.array([200, 38, 26])).astype(np.uint8)
Image.fromarray(hole_over).save(os.path.join(HERE, "bighole_shown.png"))
Image.fromarray(src).crop(CROP).save(os.path.join(crops, "input.png"))
row1 = [("input (crop)", os.path.join(crops, "input.png"))]
for k in ("dilate09", "dilate21", "dilate41"):
    row1.append((f"LaMa, dilate {int(k[-2:])} px: band {r[k]['fixed_band_vs_fog_mad']}", crop(f"plate_{k}.png")))
row1.append((f"!Moebius, dilate 21: band {moeb[0]['fixed_band_vs_fog_mad']}", crop("moebius_plate_dilate21.png")))
row2 = [("the big hole (red), 57% of frame", os.path.join(HERE, "bighole_shown.png")),
        ("LaMa, big hole", os.path.join(HERE, "plate_bighole.png")),
        ("!Moebius, big hole", os.path.join(HERE, "moebius_plate_bighole.png"))]
print(make(os.path.join(HERE, "contact-sheet.png"),
           "LaMa - 2026-11-15 - dilate sweep on the fog figure (top, crop), one very large hole (bottom); red = Moebius",
           [row1, row2],
           note=f"band = mean colour distance from the fog, 0-48 px outside SAM's mask (input {M['input_fixed_band_vs_fog_mad']}; lower = less haze left). Nobody has seen this yet."))
