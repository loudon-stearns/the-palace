#!/bin/sh
# Builds side-by-side.png from run_probe.sh's plates. Run from the palace root.
D="Shop/Figure Rig/proofs/2026-11-15-reach-second-body"; R="$D/renders/mpfb-v3"
MAIN="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
"$MAIN/_tools/ComfyUI/venv/bin/python" "$D/sheet.py" --out "$D/side-by-side.png" --cols 3 --cell-w 380 \
  --title "Figure Rig - a new pose (reach) on two bodies, 2026-11-15" \
  --note "pose_rig_mpfb_v3.py headless, Blender 5.1.2 + MPFB2 2.0.17, --pose-json reach (right arm thrown up: upperarm01.R local Z -120, left knee forward). Top: gender 1.0, age 0.5, weight 0.5. Bottom: gender 0.0, age 0.875, weight 0.85. Ink, depth and OpenPose plates from one camera; 18/18 keypoints in view on both." \
  --cell "$R/pose_reach_B_male/ink_plate.png" "male, default build: ink + depth 10.8 s" \
  --cell "$R/pose_reach_B_male/depth_plate.png" "depth" \
  --cell "$R/pose_reach_B_male/openpose.png" "OpenPose 2.5 s" \
  --cell "$R/pose_reach_female_older_heavier/ink_plate.png" "female, older, heavier: 10.2 s" \
  --cell "$R/pose_reach_female_older_heavier/depth_plate.png" "depth" \
  --cell "$R/pose_reach_female_older_heavier/openpose.png" "OpenPose 2.5 s"
