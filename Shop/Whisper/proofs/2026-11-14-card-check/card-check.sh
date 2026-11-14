#!/bin/sh
# Card check, 2026-11-14: Kokoro's af_bella card-check render, read back by Whisper base, twice, and the two JSONs compared.
# Run from the palace's main checkout. Result: transcript.json; the two runs were byte-identical; 5.1 s and 5.0 s for 13.5 s of audio.
IN="Shop/Kokoro/proofs/2026-11-14-card-check/af_bella — study.m4a"; D="Shop/Whisper/proofs/2026-11-14-card-check"
for r in a b; do mkdir -p "$D/$r"; time whisper "$IN" --model base --language en --word_timestamps True --output_format json --output_dir "$D/$r" --fp16 False; done
cmp "$D/a/af_bella — study.json" "$D/b/af_bella — study.json" && echo identical
