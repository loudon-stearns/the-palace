#!/usr/bin/env bash
# ffmpeg card check, 2026-11-14: the mux template on a real silent render.
# Run from this folder:  bash card-check.sh
set -euo pipefail
silent="../../../Manim CE/proofs/2026-11-14-card-check/card-check-480p15.mp4"
# a 3.5 s 220 Hz tone stands in for narration (48 kHz, the house rate)
ffmpeg -v error -y -f lavfi -i "sine=frequency=220:duration=3.5:sample_rate=48000" -c:a pcm_s16le tone.wav
# the mux template: copy the video, encode the audio, stop at the shorter stream
ffmpeg -v error -y -i "$silent" -i tone.wav -c:v copy -c:a aac -shortest muxed.mp4
ffprobe -v error -show_entries stream=codec_name,sample_rate,duration -show_entries format=duration -of compact muxed.mp4
