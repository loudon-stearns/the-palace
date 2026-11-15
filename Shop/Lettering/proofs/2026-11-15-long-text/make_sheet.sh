#!/bin/sh
# Builds side-by-side.png from letter_phrase.py's outputs. Run from the palace root.
D="Shop/Lettering/proofs/2026-11-15-long-text"
MAIN="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
"$MAIN/_tools/ComfyUI/venv/bin/python" "$D/sheet.py" --out "$D/side-by-side.png" --cols 3 --cell-w 520 \
  --title "Lettering - \"DON'T LET GO\", old route against new, 2026-11-15" \
  --note "Same words, same prompt (BLUELINE style suffix), seed 1111. Old: the house route, Bangers skeleton canny-locked into SDXL, Study tier, 1216x832, 36 steps, local MPS, 262 s. New: Z-Image-Turbo free-hand (no skeleton), 1248x832, 8 steps, on its free Hugging Face Space, 11.7 s including the queue. Qwen-Image was tried and refused: the anonymous GPU quota was spent." \
  --cell "$D/skel/probe-dontletgo.png" "skeleton: Bangers, auto-wrapped (CPU, instant)" \
  --cell "$D/out/probe-dontletgo_skeleton_s1111.png" "OLD  SDXL + canny-locked skeleton, local, 262 s" \
  --cell "$D/out/probe-dontletgo_zimage_s1111.png" "!NEW  Z-Image-Turbo, free-hand, HF Space, 11.7 s"
