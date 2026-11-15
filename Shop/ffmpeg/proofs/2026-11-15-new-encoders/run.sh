#!/usr/bin/env bash
# ffmpeg, old against new, 2026-11-15: the page's Study encoder (libx264 CRF 23, software) against what this
# Homebrew 8.1 build also carries: SVT-AV1 (libsvtav1, software, AV1) and Apple's hardware encoders
# (h264_videotoolbox, hevc_videotoolbox). One input: Manim's beats teaching clip, 1080p30, 17 s, silent
# (Shop/Manim CE/proofs/2026-11-15-beats-teaching-clip/beats-silent-1080p30.mp4), thin lines on a dark ground,
# the house's hardest case for an encoder.
# Measured: time, size, VMAF and SSIM against the Manim render itself, and byte-identity on a second run.
# Settings chosen so the files land near one another in size; the eye should judge the thin lines, not the meter.
# Run from this folder: bash run.sh      A maker who finds better settings should use them and leave them here.
set -uo pipefail
cd "$(dirname "$0")"
SRC="../../../Manim CE/proofs/2026-11-15-beats-teaching-clip/beats-silent-1080p30.mp4"
now() { python3 -c 'import time;print(time.time())'; }
load() { sysctl -n vm.loadavg | awk '{print $2}'; }
: > times.tsv
enc() { # name, ffmpeg video args...
  local n=$1; shift; local ld; ld=$(load)
  local t0; t0=$(now); ffmpeg -hide_banner -nostats -y -i "$SRC" -an "$@" -pix_fmt yuv420p "$n.mp4" > "log-$n.txt" 2>&1; local rc=$?; local t1; t1=$(now)
  ffmpeg -hide_banner -nostats -y -i "$SRC" -an "$@" -pix_fmt yuv420p "$n-rerun.mp4" > /dev/null 2>&1
  local same=no; cmp -s "$n.mp4" "$n-rerun.mp4" && same=yes; rm -f "$n-rerun.mp4"
  local vmaf; vmaf=$(ffmpeg -hide_banner -nostats -i "$n.mp4" -i "$SRC" -lavfi libvmaf -f null - 2>&1 | grep -o "VMAF score: [0-9.]*" | awk '{print $3}')
  local ssim; ssim=$(ffmpeg -hide_banner -nostats -i "$n.mp4" -i "$SRC" -lavfi ssim -f null - 2>&1 | grep -o "All:[0-9.]*" | tail -1 | cut -d: -f2)
  printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" "$n" "$(python3 -c "print(round($t1-$t0,2))")" "$rc" "$(stat -f %z "$n.mp4")" "$vmaf" "$ssim" "$same" "$ld" | tee -a times.tsv
}
enc x264-crf23       -c:v libx264 -crf 23 -preset medium
enc svtav1-crf35     -c:v libsvtav1 -crf 35 -preset 8
enc h264-vt-q60      -c:v h264_videotoolbox -q:v 60
enc hevc-vt-q60      -c:v hevc_videotoolbox -q:v 60 -tag:v hvc1
python3 - <<'PY'
import json
keys = ["encoder", "sec", "rc", "bytes", "vmaf", "ssim", "byte_identical_rerun", "load_1min_at_start"]
rows = [dict(zip(keys, l.rstrip("\n").split("\t"))) for l in open("times.tsv")]
for r in rows:
    r["sec"] = float(r["sec"]); r["bytes"] = int(r["bytes"]); r["kbps"] = round(r["bytes"] * 8 / 17 / 1000)
    r["vmaf"] = float(r["vmaf"] or "nan"); r["ssim"] = float(r["ssim"] or "nan"); r["x_realtime"] = round(17 / r["sec"], 1)
out = {"made": "2026-11-15", "ffmpeg": "8.1 (Homebrew)", "host": "M1 Max, 10 cores", "source": "beats-silent-1080p30.mp4 (Manim 0.20.1, 17 s)", "encoders": rows}
open("measures.json", "w").write(json.dumps(out, indent=2) + "\n"); print(json.dumps(out, indent=2))
PY
