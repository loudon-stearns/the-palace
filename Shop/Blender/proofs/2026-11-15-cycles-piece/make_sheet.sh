#!/bin/sh
# Builds side-by-side.png from cycles_piece.py's renders. Run from the palace root.
D="Shop/Blender/proofs/2026-11-15-cycles-piece"
MAIN="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
"$MAIN/_tools/ComfyUI/venv/bin/python" "$D/sheet.py" --out "$D/side-by-side.png" --cols 4 --cell-w 380 \
  --title "Blender - first offline Cycles render of the blocking scene, 2026-11-15" \
  --note "dramatic-lunge.blend as saved, clay material on the metaball body, 832x1216, Blender 5.1.2 headless, M1 Max. Cycles: 32 samples, adaptive, OpenImageDenoise. GPU time: 96.8 s the first time (most likely Metal kernel compile, inferred), 1.9 s the second." \
  --cell "$D/renders/eevee-clay.png" "EEVEE clay (the blocking pass) 0.6 s" \
  --cell "$D/renders/cycles-cpu-32spp.png" "Cycles CPU 32 spp 3.0 s" \
  --cell "$D/renders/cycles-gpu-32spp.png" "Cycles GPU Metal 32 spp 1.9 s" \
  --diff "$D/renders/cycles-cpu-32spp.png" "$D/renders/cycles-gpu-32spp.png" 8 "|CPU-GPU| x8: 0.05% px differ, max 20"
