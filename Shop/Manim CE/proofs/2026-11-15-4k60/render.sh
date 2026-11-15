#!/usr/bin/env bash
# Manim CE's first 4K60 render, 2026-11-15: the beats teaching clip's own scene (../2026-11-15-beats-teaching-clip/beats.py)
# rendered at -qk (3840x2160, 60 fps), timed warm (its TeX already cached by the 1080p renders), with the same
# narration joined by the same ffmpeg recipe, so it can be watched beside the 1080p30 clip.
# Run from this folder: bash render.sh
set -euo pipefail
cd "$(dirname "$0")"
SRC=../2026-11-15-beats-teaching-clip
start=$(python3 -c 'import time;print(time.time())')
( cd "$SRC" && ../../../Maker/tex-env.sh manim -qk beats.py Beats --media_dir "$OLDPWD/media" ) > render.log 2>&1
end=$(python3 -c 'import time;print(time.time())')
python3 -c "print('render_sec', round($end-$start,1))" | tee render-time.txt
cp media/videos/beats/2160p60/Beats.mp4 beats-silent-2160p60.mp4
