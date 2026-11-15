#!/usr/bin/env python3
"""
Measure and lay out the 2026-11-15 real-photo test: for each photo, V2 Small (the card's
model, via the card check's depth_map.py) against Depth Anything 3 Small and DA3 Mono Large
(via da3_depth.py in a throwaway venv). Writes measured.json and contact-sheet.png here.

  <comfy venv>/python measure_and_sheet.py        (from anywhere; paths are this folder's)

Measures, per photo: the depth PNG checks the card names (single channel, input size, spans
0-255), the V2 band thresholds and band coverage, and the Spearman rank agreement between V2
and each DA3 map (1.0 = same front-to-back order everywhere). Agreement is not correctness:
only an eye says which order is right.
"""
import json, os, sys
import numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from sheet import make


def ranks(a):
    f = a.ravel().astype(np.float64)
    return np.argsort(np.argsort(f, kind="stable"), kind="stable").astype(np.float64)


def spearman(a, b):
    ra, rb = ranks(a), ranks(b)
    return float(np.corrcoef(ra, rb)[0, 1])


def bands_rgb(dirp):
    b = {k: cv2.imread(os.path.join(dirp, f"band_{k}.png"), 0) > 127 for k in ("back", "mid", "front")}
    h, w = b["back"].shape
    out = np.full((h, w, 3), (229, 238, 240), np.uint8)       # BGR of ground #f0eee5
    out[b["back"]] = (154, 176, 184)                          # rule
    out[b["mid"]] = (98, 104, 106)                            # ink-3
    out[b["front"]] = (26, 38, 200)                           # red
    p = os.path.join(dirp, "bands.png"); cv2.imwrite(p, out); return p


timings = {  # copied from the run lines printed on 2026-11-15 (load_s, infer_s); first run of a process includes download/warm-up
    "v2_small": {"portmeirion": [3.2, 5.54], "hopper": [2.5, 0.98], "whole_command_s": [34.8, 18.0]},
    "da3_small": {"portmeirion": [25.8, 3.83], "hopper": [0.93, 0.86]},
    "da3mono_large": {"portmeirion": [118.95, 2.33], "hopper": [12.23, 2.32]},
}
res = {"date": "2026-11-15", "device": "mps", "timings_load_infer_s": timings, "photos": {}}
rows = []
for n, src in (("portmeirion", "JUCE examples/Assets/portmeirion.jpg (a real photograph; licence not checked)"),
               ("hopper", "matplotlib sample_data/grace_hopper.jpg (US Navy portrait, public domain)")):
    inp = os.path.join(HERE, f"input-{n}.jpg")
    im = cv2.imread(inp); H, W = im.shape[:2]
    v2 = cv2.imread(os.path.join(HERE, f"v2-{n}", "depth.png"), cv2.IMREAD_UNCHANGED)
    d = {"source": src, "size": [W, H]}
    d["v2_checks"] = {"single_channel": v2.ndim == 2, "input_size": list(v2.shape[::-1]) == [W, H],
                      "range": [int(v2.min()), int(v2.max())]}
    lo, hi = np.percentile(v2, [33, 66])
    d["v2_band_thresholds"] = [int(round(lo)), int(round(hi))]
    d["v2_band_coverage_pct"] = {k: round(100 * float((cv2.imread(os.path.join(HERE, f"v2-{n}", f"band_{k}.png"), 0) > 127).mean()), 1)
                                 for k in ("back", "mid", "front")}
    for m in ("da3-small", "da3mono-large"):
        x = cv2.imread(os.path.join(HERE, f"{m}-{n}.png"), 0)
        d[f"spearman_v2_vs_{m}"] = round(spearman(v2, x), 3)
    res["photos"][n] = d
    rows.append([(f"{n} - the photo", inp), ("V2 Small (card)", os.path.join(HERE, f"v2-{n}", "depth.png")),
                 ("DA3 Small", os.path.join(HERE, f"da3-small-{n}.png")),
                 ("DA3 Mono Large", os.path.join(HERE, f"da3mono-large-{n}.png")),
                 ("!V2 bands (red = front)", bands_rgb(os.path.join(HERE, f"v2-{n}")))])
json.dump(res, open(os.path.join(HERE, "measured.json"), "w"), indent=1)
size = make(os.path.join(HERE, "contact-sheet.png"),
            "Depth Anything - 2026-11-15 - two real photographs, V2 Small against Depth Anything 3",
            rows, note="white = near, black = far in every depth map. Nobody has seen this yet.")
print(json.dumps(res, indent=1)); print("sheet", size)
