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
