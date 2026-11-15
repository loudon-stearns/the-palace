#!/usr/bin/env python3
"""
SAM on a thin object, old against new: the same image and the same point prompts through
several SAM checkpoints, one mask and one overlay each, and a measure of how much of the
thin object each mask holds.

  <comfy venv>/python sam_thin.py IMAGE OUTDIR --weights-dir DIR \
      --model sam_b.pt --model mobile_sam.pt --model sam2.1_b.pt \
      --prompt sword=560,658 --prompt figure+sword=384,461:560,658 \
      --line 470,606,662,720

--prompt NAME=x,y[:x,y...] gives positive points in pixels. --line x0,y0,x1,y1 is a rough
line along the thin object: for each column between x0 and x1 the script finds the darkest
pixel within 10 px of the line and takes that as the object's centreline, then reports, per
mask, the share of centreline pixels the mask holds ("thin_hit_pct"). That is a measure, not
an eye: only an eye says whether the cut follows the blade.
ultralytics fetches sam2.1_*.pt (ungated) into --weights-dir when it is missing; sam_b.pt and
mobile_sam.pt are read from where the 2026-06-25 session left them (pass that folder).
Runs on the CPU as ultralytics chooses on this Mac; no device is passed.
Written 2026-11-15 for the SAM thin-object test, from the 2026-11-14 card check's sam_cut.py.
A maker with a better way does it that way and leaves the comparison on the scroll.
"""
import argparse, json, os, shutil, time
import numpy as np, cv2
from ultralytics import SAM

ap = argparse.ArgumentParser()
ap.add_argument("image"); ap.add_argument("outdir")
ap.add_argument("--weights-dir", required=True)
ap.add_argument("--old-weights-dir", default="/Users/loudonstearns/Documents/The Palace/Projects/BLUELINE/proofs/blender-fire")
ap.add_argument("--model", action="append", required=True)
ap.add_argument("--prompt", action="append", required=True)
ap.add_argument("--line", required=True)
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
img = cv2.imread(a.image); H, W = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.int32)

# centreline of the thin object
x0, y0, x1, y1 = map(float, a.line.split(","))
centre = []
for x in range(int(x0), int(x1) + 1):
    yp = y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    lo, hi = int(yp) - 10, int(yp) + 10
    col = gray[lo:hi + 1, x]
    centre.append((x, lo + int(np.argmin(col))))
centre = np.array(centre)

prompts = []
for p in a.prompt:
    name, pts = p.split("=")
    prompts.append((name, [[int(float(v)) for v in q.split(",")] for q in pts.split(":")]))

res = {"image": os.path.basename(a.image), "size": [W, H], "centreline_px": len(centre), "runs": []}
for mname in a.model:
    wpath = os.path.join(a.old_weights_dir, mname)
    if not os.path.exists(wpath):
        wpath = os.path.join(a.weights_dir, mname)
    cwd = os.getcwd(); os.chdir(a.weights_dir)          # ultralytics downloads into the cwd
    t0 = time.time(); m = SAM(wpath if os.path.exists(wpath) else mname); tl = time.time() - t0
    os.chdir(cwd)
    for pname, pts in prompts:
        t0 = time.time()
        r = m(a.image, points=[pts], labels=[[1] * len(pts)], verbose=False)
        dt = time.time() - t0
        mk = np.zeros((H, W), np.uint8)
        if r[0].masks is not None:
            for d in r[0].masks.data:
                mk |= cv2.resize((d.cpu().numpy() * 255).astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST)
        tag = f"{os.path.splitext(mname)[0]}__{pname.replace('+', '-')}"
        cv2.imwrite(os.path.join(a.outdir, f"mask_{tag}.png"), mk)
        over = img.copy()
        sel = mk > 127
        over[sel] = (0.45 * over[sel] + 0.55 * np.array([0, 140, 255])).astype(np.uint8)
        for (px, py) in pts:
            cv2.circle(over, (px, py), 7, (26, 38, 200), -1); cv2.circle(over, (px, py), 7, (255, 255, 255), 1)
        cv2.imwrite(os.path.join(a.outdir, f"overlay_{tag}.png"), over)
        hit = float(np.mean([mk[y, x] > 127 for x, y in centre]))
        run = {"model": mname, "prompt": pname, "points": pts, "load_s": round(tl, 2), "infer_s": round(dt, 2),
               "masks_returned": 0 if r[0].masks is None else int(len(r[0].masks.data)),
               "coverage_pct": round(100 * float(sel.mean()), 2), "thin_hit_pct": round(100 * hit, 1)}
        res["runs"].append(run); print(json.dumps(run))
json.dump(res, open(os.path.join(a.outdir, "measured_runs.json"), "w"), indent=1)
