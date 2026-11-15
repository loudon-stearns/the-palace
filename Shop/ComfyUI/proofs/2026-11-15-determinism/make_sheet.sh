#!/bin/sh
# Builds side-by-side.png from determinism.py's renders. Run from the palace root with the ComfyUI venv python.
D="Shop/ComfyUI/proofs/2026-11-15-determinism"
MAIN="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
"$MAIN/_tools/ComfyUI/venv/bin/python" "$D/sheet.py" --out "$D/side-by-side.png" --cols 3 --cell-w 520 \
  --title "ComfyUI - same seed, same workflow, MPS, 2026-11-15" \
  --note "SDXL fireflies workflow, 768x512, 20 steps, seed 7, ComfyUI 0.22.0. A and B: two renders each from a freshly loaded model (node cache cleared between) - sha256 identical, and identical to the first render of 2026-11-14. C: seed 7 again after a seed-8 render on the still-loaded model (the 2026-11-14 pattern) - differs from A, but is byte-identical to the 2026-11-14 rerun. --deterministic changed nothing. Difference images are |A-x| on paper, red = different, gain shown." \
  --cell "$D/renders/mps-run1.png" "A  fresh model, render 1  sha 5d27a1ce" \
  --cell "$D/renders/mps-run3.png" "B  fresh model, render 3  sha 5d27a1ce" \
  --cell "$D/renders/mps_warm-run2.png" "C  warm model, after seed 8  sha 42a3c0c6" \
  --diff "$D/renders/mps-run1.png" "$D/renders/mps-run3.png" 64 "|A-B| x64: 0 px differ, max 0" \
  --diff "$D/renders/mps-run1.png" "$D/renders/mps_det-run1.png" 64 "|A - --deterministic| x64: 0 px differ" \
  --diff "$D/renders/mps-run1.png" "$D/renders/mps_warm-run2.png" 8 "!|A-C| x8: 75.6% px differ, max 63, mean 0.68"
