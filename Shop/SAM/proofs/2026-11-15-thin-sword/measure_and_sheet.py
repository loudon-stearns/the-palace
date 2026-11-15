#!/usr/bin/env python3
"""
Lay out and record the 2026-11-15 SAM thin-object test: reads out/measured_runs.json (written by
sam_thin.py) and writes measured.json and contact-sheet.png here. Top row: the sword-only prompt,
cropped close on the blade; bottom row: the input and the figure-and-sword prompt, full frame.

  <comfy venv>/python measure_and_sheet.py
"""
import json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from sheet import make

MODELS = [("sam_b", "ViT-B (card, 2023)"), ("mobile_sam", "MobileSAM (card auto)"), ("sam2.1_t", "SAM 2.1 tiny"),
          ("sam2.1_b", "SAM 2.1 base+"), ("sam2.1_l", "SAM 2.1 large")]
CROP = (400, 520, 720, 780)
d = json.load(open(os.path.join(HERE, "out", "measured_runs.json")))
clean = {  # load_s, infer_s from a second run on 2026-11-15 with nothing else on the CPU (weights cached); masks identical
    "sam_b.pt": {"sword": [0.41, 1.67], "figure-and-sword": [0.41, 1.76]},
    "mobile_sam.pt": {"sword": [0.17, 0.43], "figure-and-sword": [0.17, 0.38]},
    "sam2.1_t.pt": {"sword": [0.19, 0.55], "figure-and-sword": [0.19, 0.44]},
    "sam2.1_b.pt": {"sword": [0.36, 0.89], "figure-and-sword": [0.36, 0.86]},
    "sam2.1_l.pt": {"sword": [0.86, 1.98], "figure-and-sword": [0.86, 1.97]},
}
for r in d["runs"]:
    r["first_run_load_infer_s_incl_download_and_cpu_contention"] = [r.pop("load_s"), r.pop("infer_s")]
    r["clean_load_infer_s"] = clean[r["model"]][r["prompt"]]
d.update({"date": "2026-11-15", "device": "cpu (ultralytics' choice)", "ultralytics": "8.4.78",
          "input": "Shop/Blender/tests/renders/prompt_only_sdxl_seed7.png",
          "thin_hit_pct_means": "share of the blade's 193-px centreline (darkest pixel per column near the line 470,606-662,720) inside the mask",
          "sam3": "not run: facebook/sam3 and facebook/sam3.1 are gated (manual approval) on Hugging Face"})
json.dump(d, open(os.path.join(HERE, "measured.json"), "w"), indent=1)
hit = {(r["model"].split(".pt")[0], r["prompt"]): r["thin_hit_pct"] for r in d["runs"]}
os.makedirs(os.path.join(HERE, "out", "crops"), exist_ok=True)
row1 = []
for k, lab in MODELS:
    p = os.path.join(HERE, "out", "crops", f"{k}__sword.png")
    Image.open(os.path.join(HERE, "out", f"overlay_{k}__sword.png")).crop(CROP).save(p)
    row1.append((("!" if hit[(k, 'sword')] < 50 else "") + f"{lab}: blade {hit[(k, 'sword')]:.0f}%", p))
row2 = [("input (Blender, 2026-06-13)", os.path.join(HERE, "..", "..", "..", "Blender", "tests", "renders", "prompt_only_sdxl_seed7.png"))]
for k, lab in MODELS:
    row2.append((("!" if hit[(k, 'figure-and-sword')] < 50 else "") + f"{lab.split(' (')[0]}: {hit[(k, 'figure-and-sword')]:.0f}%",
                 os.path.join(HERE, "out", f"overlay_{k}__figure-and-sword.png")))
print(make(os.path.join(HERE, "contact-sheet.png"),
           "SAM - 2026-11-15 - a thin sword, one point on the blade (top, close crop) and figure + blade (bottom)",
           [row1, row2], note="orange = the mask; red dots = the point prompts; % = share of the blade's centreline inside the mask. Nobody has seen this yet."))
