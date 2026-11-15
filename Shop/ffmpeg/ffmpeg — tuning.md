---
title: "ffmpeg — tuning"
born: 2026-11-08
links:
  - target: "[[ffmpeg]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the ffmpeg page's record of what joining and finishing streams has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real render taught."
ledger: tuning
standards:
  for: "what converting, joining and finishing audio and video taught the ffmpeg page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the tool itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a new command template"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# ffmpeg — tuning

What each job taught the ffmpeg page. Each item names what the job showed and what changed because of it, if anything did. Newest last. These are the page's dated gotchas, moved here on 2026-11-08 when its Gotchas became present-tense rules. The page's `last_tested` date, the Shop harness's smoke on 2026-06-16, is kept as the first run line; the community-wisdom patterns stay on the page until a job meets them.

## From the Kuramoto Round 1 teaching reel — 2026-05-26 — Study, 1280×720@30

1. **Homebrew's ffmpeg has no `drawtext`.** `brew install ffmpeg` builds with `--disable-libfreetype`, so any filtergraph using `drawtext=...` fails at once with `No such filter: 'drawtext'`. The reel's title card was made as a PNG in Matplotlib and looped into a still-clip (`-loop 1 -i title.png -t <seconds>`). Real drawtext needs a custom build: `ffmpeg --HEAD --with-...` from a custom tap, or the `homebrew-ffmpeg/ffmpeg/ffmpeg` tap with `--with-freetype`. Changed: title cards are a Matplotlib job, which leaves a versioned source artifact instead of a string buried in the ffmpeg command.
2. **The reel came out 62.5 s, not 49.5 s.** A filtergraph referenced one 13 s silent track `[3:a]` twice inside `concat=n=3:v=1:a=1`, once paired with the 10 s uncoupled clip and once with the 3 s title card; `concat` played it in full on each appearance, then appended the 36.5 s narration. `concat` does not trim audio to its paired video, and an `asplit` of one source into N copies has the same issue. Changed: one silent source per silent segment, each sized to its video (`-f lavfi -t 10 -i anullsrc=... -f lavfi -t 3 -i anullsrc=...`); the Maker's job spec sizes every audio input exactly.
3. **The first render's audio was a clean −16.15 LUFS / −0.94 dBTP, at 96 kHz**, against the house finished-mix standard of 48 kHz stereo. Two-pass `loudnorm` upsamples internally to 96/192 kHz and passes that rate to the encoder; it exposes no output sample rate, and a report that doesn't name the rate lets the drift through. Changed: `-ar 48000` (or the brief's rate) on the final encode, and the Self-Check treats sample rate as part of the spec.

## From the Shop's test harness — 2026-06-16

- run · 2026-06-16 · `Shop/Maker/run-tests.mjs` encode + decode smoke, probe · nothing new
- run · 2026-11-14 · card check, narration mux on a Manim render (ffmpeg 8.1), probe · nothing new

## From the test-scroll session — 2026-11-15 — the beats clip join, Study timed, and the newer encoders

4. **Study, timed: five to ten times faster than real time at 720p, slower than real time at 4K60.** *Owed a review: written by the shop-tests-motion session outside a ledger review.* ffmpeg 8.1 on the M1 Max, load average 88–100 throughout (upper bounds): on sync-arriving (720p30, 36.4 s) loudnorm pass 1 took 1.0 s, pass 2 to AAC 48 kHz 2.2 s, libx264 CRF 23 video alone 7.0 s, the whole Study job in one command 3.6 s (−16.0 LUFS, −1.0 dBTP); on Manim's 4K60 render (17 s) libx264 CRF 23 took 28.0 s, and down to 1080p30 6.0 s. The page's "roughly real-time" for Study fits 4K60 only. The beats clip's join (two-pass loudnorm on the whole joined track, video copied) took 0.6 s and 0.9 s. Proofs: `proofs/2026-11-15-study-timed/`, and `Shop/Manim CE/proofs/2026-11-15-beats-teaching-clip/join.sh`.
5. **Zoom-out, 2026-11-15: on Manim's thin lines, libx264 still gives the most quality per byte; Apple's hardware encoders are not deterministic.** *Owed a review: written by the shop-tests-motion session outside a ledger review.* Sources: this build's `-encoders` list (libsvtav1, h264/hevc/prores_videotoolbox, libx265 present; libfdk_aac absent) and `-filters` (libvmaf present; whisper absent), and the 8.0 (2025-08) and 8.1 "Hoare" (2026-03-16) release coverage; 8.1.2 is reported (2026-06-17) and not installed. Tried, on the beats clip at 1080p30: libx264 CRF 23 2.7 s, 542 KB, VMAF 96.7; libsvtav1 CRF 35 preset 8 3.3 s, 728 KB, VMAF 97.0; h264_videotoolbox q 60 1.7 s, 2,445 KB, VMAF 95.3; hevc_videotoolbox q 60 2.0 s, 1,828 KB, VMAF 94.3. Software encodes were byte-identical on a rerun; both hardware encodes were not. Sizes were not matched; the whisper filter needs a build with whisper.cpp and was not tried. Proof: `proofs/2026-11-15-new-encoders/`.
- run · 2026-11-15 · beats teaching clip join, Manim + Kokoro, study · taught item 4
- run · 2026-11-15 · Study tier timed on sync-arriving and a 4K60 render, probe · taught item 4
- run · 2026-11-15 · libx264 against SVT-AV1 and VideoToolbox, probe · taught item 5
