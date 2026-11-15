#!/usr/bin/env bash
# Render the caption card with one audio path and measure it, 2026-11-15.
# Usage, from this folder: bash render.sh html5|media <out-dir>
# Times the render, then measures: where the sound starts (expected 0.5 s Sequence lead + 0.313 s Kokoro's own
# lead-in = 0.813 s, measured on the Manim clip), the audio stream (codec, rate, channels, loudness) and frames. Writes <out-dir>/measure.json.
# Needs node_modules linked to the phenomena walk's (main checkout); never npm install over the link.
set -euo pipefail
cd "$(dirname "$0")"
AUDIO=$1; OUT=$2; mkdir -p "$OUT"
t0=$(python3 -c 'import time;print(time.time())')
npx remotion render Caption "$OUT/caption-$AUDIO.mp4" --codec h264 --crf 20 --props="{\"audio\":\"$AUDIO\"}" > "$OUT/render-$AUDIO.log" 2>&1
t1=$(python3 -c 'import time;print(time.time())')
F="$OUT/caption-$AUDIO.mp4"
ONSET=$(ffmpeg -hide_banner -nostats -i "$F" -af silencedetect=n=-50dB:d=0.2 -f null - 2>&1 | grep -o "silence_end: [0-9.]*" | head -1 | awk '{print $2}')
LOUD=$(ffmpeg -hide_banner -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' ' | tr '\n' ' ')
python3 - "$F" "$AUDIO" "$t0" "$t1" "${ONSET:-none}" "$LOUD" "$OUT" <<'PY'
import json, sys, subprocess
f, audio, t0, t1, onset, loud, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6], sys.argv[7]
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels,duration", "-of", "json", f], capture_output=True, text=True).stdout)
rep = {"made": "2026-11-15", "remotion": "4.0.542", "audio_path": audio, "render_sec": round(t1 - t0, 1),
       "sound_starts_sec": None if onset == "none" else float(onset), "expected_start_sec": 0.813,
       "ebur128": loud.strip(), "streams": pr["streams"]}
if rep["sound_starts_sec"] is not None: rep["start_error_ms"] = round((rep["sound_starts_sec"] - 0.813) * 1000)
open(f"{out}/measure-{audio}.json", "w").write(json.dumps(rep, indent=2) + "\n"); print(json.dumps(rep, indent=2))
PY
