---
title: "Matplotlib — tuning"
born: 2026-11-08
links:
  - target: "[[Matplotlib]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Matplotlib page's record of what plotting has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real render taught."
ledger: tuning
standards:
  for: "what plotting with Matplotlib taught the Matplotlib page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or one smoke through Shop/Maker/run-tests.mjs"
  line: "- run · <date> · <brief, tier | smoke test on host> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a motion job"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal; run-tests.mjs --write-back marks a passing smoke"
  merge: union
  kept: git
  trim: never
---

# Matplotlib — tuning

What each job taught the Matplotlib page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The three 2026-05-10 items are the page's founding gotchas, moved here on 2026-11-08 when the page's Gotchas became present-tense rules. That job carries no run line, as seeded history doesn't; the one run line is the 2026-06-16 harness smoke the page's `last_tested` recorded. The 2026-05-30 Smoke and Determinism pass is on the page's Test Suite and in the test plan, not here.

## From the Kuramoto two-phasor Sketch, standing in for Manim CE — 2026-05-10

1. **The first job was motion, not a static chart.** `manimpango` would not install in the Cowork Linux-arm64 sandbox, so Matplotlib rendered the two-phasor Sketch through `matplotlib.animation.FuncAnimation` and `FFMpegWriter`. Animation is off-Charter ("rare; usually route to Manim") but held at Sketch tier. The output had its own flatter character, no anti-aliased LaTeX and simpler strokes, and was kept as a Comparison-Mode piece rather than discarded. Changed: the page counts itself a real Manim fallback for motion when Manim can't host, with a known aesthetic gap; the Recipe holds the pattern.
2. **`FFMpegWriter` needed `ffmpeg` on PATH and `extra_args=["-pix_fmt","yuv420p"]`.** Without yuv420p the MP4 plays in some viewers and not others; yuv420p is what broad player and QuickTime compatibility asks for. Changed: always pass yuv420p for motion.
3. **`figsize` × `dpi` did not land on a standard resolution.** 10.6 in × 120 dpi gave 1272 px, not 1280, and yuv420p needs even width and height. The Sketch shipped at 1272×720, fine for a draft. Changed: for video, set `figsize = target_px / dpi` and confirm even pixel dimensions; Study and Piece motion target exact resolutions.

- run · 2026-06-16 · smoke test on mac · nothing new
