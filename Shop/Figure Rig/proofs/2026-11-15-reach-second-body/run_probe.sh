#!/bin/sh
# Figure Rig, 2026-11-15: a new pose ("reach", one arm thrown up, a lunge) on a second body type
# (female, older, heavier) through the card-check script, copied here so its plates land here.
# Run from the palace root (main checkout, or a worktree whose main checkout holds _tools/ComfyUI).
# Written 2026-11-15. A maker who can do better another way does so, and leaves the comparison on the scroll.
set -e
HERE="Shop/Figure Rig/proofs/2026-11-15-reach-second-body"
MAIN="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
REACH='{"spine03":[6,0,0],"spine02":[4,0,0],
 "upperleg01.L":[-40,0,6],"lowerleg01.L":[55,0,0],"foot.L":[-14,0,0],
 "upperleg01.R":[22,0,-8],"lowerleg01.R":[18,0,0],"foot.R":[-8,0,0],
 "upperarm01.R":[0,0,-120],"lowerarm01.R":[-10,0,0],
 "upperarm01.L":[0,0,-30],"lowerarm01.L":[-40,0,0]}'
for spec in "1.0 0.5 0.5 reach_B_male" "0.0 0.875 0.85 reach_female_older_heavier"; do
  set -- $spec
  /usr/bin/time -p /opt/homebrew/bin/blender -b -P "$HERE/pose_rig_mpfb_v3.py" -- \
    --pose-json "$REACH" --gender "$1" --age "$2" --weight "$3" --label "$4" 2>&1 \
    | grep -E "===|visible|vertices|Error|real" || true
  /usr/bin/time -p "$MAIN/_tools/ComfyUI/venv/bin/python" \
    Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/draw_openpose.py \
    "$HERE/renders/mpfb-v3/pose_$4" 2>&1 | tail -3
done
