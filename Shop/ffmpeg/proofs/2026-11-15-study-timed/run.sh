#!/usr/bin/env bash
# ffmpeg's Study tier, timed for the first time, 2026-11-15 (ffmpeg 8.1, Homebrew, M1 Max, 10 cores).
# Two real inputs: the Kuramoto sync-arriving clip (720p30, 36.5 s, Kokoro narration) and Manim's first 4K60 render
# of the beats clip (2160p60, 17 s, silent; from Shop/Manim CE/proofs/2026-11-15-4k60).
# Each step is timed alone, as the page's Study tier names it:
#   loudnorm pass 1 (measure only)  ·  loudnorm pass 2 (apply, audio only)  ·  libx264 CRF 23 re-encode (video only)
#   ·  the whole Study job in one command (re-encode + AAC 192k + loudnorm pass 2 + -ar 48000)
# The load average is written beside every time: on this day other sessions were rendering, so times are upper bounds.
# Run from this folder: bash run.sh     A maker with a faster recipe should use it and leave the comparison here.
set -uo pipefail
cd "$(dirname "$0")"
ROOT=../../..
A="$ROOT/../Kuramoto Coupling/sync-arriving.mp4"
B="$ROOT/Manim CE/proofs/2026-11-15-4k60/beats-silent-2160p60.mp4"
now() { python3 -c 'import time;print(time.time())'; }
load() { sysctl -n vm.loadavg | awk '{print $2}'; }
: > times.tsv
step() { # label, cmd...
  local l=$1; shift; local ld; ld=$(load); local t0; t0=$(now); "$@" > "log-$l.txt" 2>&1; local rc=$?; local t1; t1=$(now)
  printf "%s\t%s\t%s\t%s\n" "$l" "$(python3 -c "print(round($t1-$t0,2))")" "$rc" "$ld" | tee -a times.tsv
}
json_of() { python3 -c 'import sys,re;print(re.findall(r"\{[^{}]*\}",open(sys.argv[1]).read())[-1])' "$1"; }
get() { python3 -c "import json,sys;print(json.loads(sys.argv[1])[sys.argv[2]])" "$1" "$2"; }

# --- A: sync-arriving, with sound
step A-loudnorm-pass1 ffmpeg -hide_banner -nostats -i "$A" -vn -af loudnorm=I=-16:TP=-1:LRA=11:print_format=json -f null -
M=$(json_of log-A-loudnorm-pass1.txt)
AF="loudnorm=I=-16:TP=-1:LRA=11:measured_I=$(get "$M" input_i):measured_TP=$(get "$M" input_tp):measured_LRA=$(get "$M" input_lra):measured_thresh=$(get "$M" input_thresh):offset=$(get "$M" target_offset):linear=true:print_format=json"
step A-loudnorm-pass2-audio ffmpeg -hide_banner -nostats -y -i "$A" -vn -af "$AF" -ar 48000 -c:a aac -b:a 192k A-audio.m4a
step A-x264-crf23-video ffmpeg -hide_banner -nostats -y -i "$A" -an -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p A-video.mp4
step A-study-whole ffmpeg -hide_banner -nostats -y -i "$A" -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -af "$AF" -ar 48000 -c:a aac -b:a 192k -movflags +faststart A-study.mp4
# --- B: Manim 4K60, video only
step B-x264-crf23-video ffmpeg -hide_banner -nostats -y -i "$B" -an -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p B-study.mp4
step B-x264-crf23-to-1080p30 ffmpeg -hide_banner -nostats -y -i "$B" -an -vf "fps=30,scale=1920:1080:flags=lanczos" -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p B-study-1080p30.mp4

python3 - "$A" "$B" <<'PY'
import json, subprocess, sys
dur = lambda f: float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
src = {"A": dur(sys.argv[1]), "B": dur(sys.argv[2])}
rows = [l.rstrip("\n").split("\t") for l in open("times.tsv")]
out = {"made": "2026-11-15", "ffmpeg": "8.1", "host": "M1 Max, 10 cores", "inputs": {"A": "Kuramoto Coupling/sync-arriving.mp4", "B": "Shop/Manim CE/proofs/2026-11-15-4k60/beats-silent-2160p60.mp4"},
       "input_sec": src, "steps": []}
for l, s, rc, ld in rows:
    s = float(s); out["steps"].append({"step": l, "sec": s, "rc": int(rc), "load_1min_at_start": float(ld), "x_realtime": round(src[l[0]] / s, 1) if s else None})
def loud(f):
    e = subprocess.run(["ffmpeg","-hide_banner","-nostats","-i",f,"-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr
    import re; return " ".join(re.findall(r"^\s+(?:I|Peak):\s+[-0-9.]+ \w+", e, re.M)).split()
out["A_study_loudness"] = " ".join(loud("A-study.mp4"))
out["sizes_bytes"] = {f: __import__("os").path.getsize(f) for f in ("A-study.mp4", "B-study.mp4", "B-study-1080p30.mp4")}
open("times.json","w").write(json.dumps(out, indent=2) + "\n"); print(json.dumps(out, indent=2))
PY
