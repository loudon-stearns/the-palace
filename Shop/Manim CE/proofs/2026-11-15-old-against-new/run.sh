#!/usr/bin/env bash
# Manim CE, old against new, 2026-11-15: the installed 0.20.1 (pipx, `manim`) against 0.22.1 (~/.venvs/manim-0.22,
# installed this day with its typst extra). Same machine, same source, one after the other.
#  1. the beats clip's scene (../2026-11-15-beats-teaching-clip/beats.py) at 1080p30, each version cold (empty media
#     folder) then warm; output compared by SHA-256 and by SSIM.
#  2. the clip's two equations as a still: MathTex (LaTeX, through tex-env.sh) against MathTypst (no TeX:
#     TeX is taken off PATH for the Typst render), each cold.
# Writes times.json and the stills. Run from this folder: bash run.sh
# 0.22.1's own changelog is the claim under test: a faster Cairo renderer (0.21.0) and Typst math (0.21.0).
set -uo pipefail
cd "$(dirname "$0")"
OLD=manim; NEW=$HOME/.venvs/manim-0.22/bin/manim; TEXENV=$(cd ../../../Maker && pwd)/tex-env.sh
CLIP=$(cd ../2026-11-15-beats-teaching-clip && pwd)
now() { python3 -c 'import time;print(time.time())'; }
declare -a ROWS=()
timed() {  # label, command...
  local label=$1; shift; local t0; t0=$(now); "$@" > "log-$label.txt" 2>&1; local rc=$?; local t1; t1=$(now)
  ROWS+=("$label $(python3 -c "print(round($t1-$t0,2))") $rc"); echo "$label rc=$rc $(python3 -c "print(round($t1-$t0,2))") s"
}
rm -rf media-old media-new media-still
for v in old new; do
  BIN=$OLD; [ $v = new ] && BIN=$NEW
  for pass in cold warm; do
    timed "beats-$v-$pass" bash -c "cd '$CLIP' && '$TEXENV' '$BIN' -qh --frame_rate 30 beats.py Beats --media_dir '$PWD/media-$v'"
  done
  cp "media-$v/videos/beats/1080p30/Beats.mp4" "beats-$v.mp4"
done
timed still-tex-cold   "$TEXENV" "$NEW" -qh -s typeset.py TexOnly   --media_dir media-still
timed still-typst-cold env PATH=/usr/bin:/bin "$NEW" -qh -s typeset.py TypstOnly --media_dir media-still
timed still-both       "$TEXENV" "$NEW" -qh -s typeset.py TypesetBoth --media_dir media-still
cp media-still/images/typeset/TypesetBoth*.png typeset-both.png
SSIM=$(ffmpeg -hide_banner -nostats -i beats-old.mp4 -i beats-new.mp4 -lavfi ssim -f null - 2>&1 | grep -o "All:[0-9.]*" | tail -1)
python3 - "$SSIM" "${ROWS[@]}" <<'EOF'
import json, sys, hashlib
rows = [r.split() for r in sys.argv[2:]]
sha = {v: hashlib.sha256(open(f"beats-{v}.mp4", "rb").read()).hexdigest()[:12] for v in ("old", "new")}
out = {"made": "2026-11-15", "old": "manim 0.20.1 (pipx, Python 3.13.2)", "new": "manim 0.22.1 (venv, Python 3.13, manim[typst])",
       "runs": {l: {"sec": float(s), "rc": int(rc)} for l, s, rc in rows}, "sha256_12": sha,
       "byte_identical": sha["old"] == sha["new"], "ssim_old_vs_new": sys.argv[1]}
open("times.json", "w").write(json.dumps(out, indent=2) + "\n"); print(json.dumps(out, indent=2))
EOF
