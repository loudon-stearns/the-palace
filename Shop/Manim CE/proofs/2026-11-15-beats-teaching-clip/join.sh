#!/usr/bin/env bash
# ffmpeg joins Manim's silent render and Kokoro's sentence into one clip at the house loudness, 2026-11-15.
# Seams it handles: the narration starts LEAD s in (adelay), is padded to the video's length (apad + -t),
# resampled 24 kHz -> 48 kHz, two-pass loudnorm to -16 LUFS / -1 dBTP on the whole joined track, rate pinned
# after loudnorm (the page's gotcha), video stream-copied. Each step is timed into join-report.json.
# Run from this folder: bash join.sh   (after narrate.py and the Manim render)
# A maker with a better join should use it and leave the comparison on the scroll.
set -euo pipefail
cd "$(dirname "$0")"
VIDEO=beats-silent-1080p30.mp4   # copied from media/videos/beats/1080p30/Beats.mp4 after the render
LEAD_MS=1200
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
PRE="adelay=${LEAD_MS}:all=1,apad,atrim=0:${DUR},aresample=48000"

t0=$(python3 -c 'import time;print(time.time())')
P1=$(ffmpeg -hide_banner -nostats -i narration-raw.wav -af "${PRE},loudnorm=I=-16:TP=-1:LRA=11:print_format=json" -f null - 2>&1 | python3 -c 'import sys,re;print(re.findall(r"\{[^{}]*\}",sys.stdin.read())[-1])')
t1=$(python3 -c 'import time;print(time.time())')
get() { python3 -c "import json,sys;print(json.loads(sys.argv[1])['$1'])" "$P1"; }
AF="${PRE},loudnorm=I=-16:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true:print_format=json"
P2=$(ffmpeg -hide_banner -nostats -y -i "$VIDEO" -i narration-raw.wav -map 0:v:0 -map 1:a:0 -c:v copy \
      -af "$AF" -ar 48000 -c:a aac -b:a 192k -t "$DUR" -movflags +faststart beats-teaching-clip.mp4 2>&1 \
      | python3 -c 'import sys,re;print(re.findall(r"\{[^{}]*\}",sys.stdin.read())[-1])')
t2=$(python3 -c 'import time;print(time.time())')
CHECK=$(ffmpeg -hide_banner -nostats -i beats-teaching-clip.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' ' | tr '\n' ' ')
python3 - "$P1" "$P2" "$t0" "$t1" "$t2" "$CHECK" <<'EOF'
import json, sys, subprocess
p1, p2 = json.loads(sys.argv[1]), json.loads(sys.argv[2]); t0, t1, t2 = map(float, sys.argv[3:6])
probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height,r_frame_rate,sample_rate,duration", "-of", "json", "beats-teaching-clip.mp4"], capture_output=True, text=True).stdout)
rep = {"made": "2026-11-15", "ffmpeg": "8.1", "pass1_sec": round(t1 - t0, 2), "pass2_and_mux_sec": round(t2 - t1, 2),
       "narration_raw_lufs": float(p1["input_i"]), "out_lufs_loudnorm": float(p2["output_i"]), "out_tp_dbtp": float(p2["output_tp"]),
       "ebur128_on_final_file": sys.argv[6].strip(), "streams": probe["streams"]}
rep["status"] = "ok" if abs(rep["out_lufs_loudnorm"] + 16) <= 0.5 and rep["out_tp_dbtp"] <= -0.9 else "spec_miss"
open("join-report.json", "w").write(json.dumps(rep, indent=2) + "\n"); print(json.dumps(rep, indent=2))
EOF
