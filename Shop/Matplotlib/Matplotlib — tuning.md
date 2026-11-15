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

## From the card check — 2026-11-14 — a Bode plot in the new house style

4. **The house style is built, and two quiet traps sat in its way.** *Owed a review: written by the shop-fix session outside a ledger review.* The design system's Shop table asks for an rcParams recipe from the active skin, written at the next invocation; this was it. `palace_mplstyle.py` writes `palace.mplstyle` from `colors_and_type.css` (ground, text, frame, the categorical cycle, JetBrains Mono, after the Plot wrapper), and a two-panel Bode plot of a biquad low-pass wore it. First trap: Matplotlib could not find JetBrains Mono, Manrope or Cormorant Garamond though all three sit in `~/Library/Fonts`; its font-list cache predated them, and lookup falls back to DejaVu silently. Rebuilding the cache found all three. Second: the SVG differed between identical runs until `svg.hashsalt` was set; the PNG was identical from the start. Changed: the style sets the salt, the page names the style under § Recipes (the two traps wait here for review before they become Gotchas), the card's Wears line says what it wears, and the Forward Vector no longer names the Bode plot as an unrun first job.
- run · 2026-11-14 · Bode plot in palace.mplstyle, sketch · taught item 4

## From the Kuramoto multi-panel test — 2026-11-15 — a publication figure at 300 dpi, Graphite and paper

5. **A four-panel figure with real math holds at 300 dpi on both grounds, and Matplotlib 3.11 falls back to DejaVu silently on a stale font cache.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `proofs/2026-11-15-kuramoto-multipanel/`: r against K for 2000 Lorentzian-quantile oscillators beside r = √(1 − Kc/K), within 0.0007 of theory above 1.5 Kc, and phase snapshots at three couplings; 2160×1260 PNGs and SVGs with 34 of 34 text elements in JetBrains Mono, every label inside the frame, byte-identical on rerun; 0.6 to 1.0 s a figure after 12 to 20 s of simulation. A paper-ground style (`palace-paper.mplstyle`, generated from `skin-drafting`) was made beside it. Matplotlib 3.11.0 (release notes 2026-06-11, https://matplotlib.org/stable/release/prev_whats_new/whats_new_3.11.0; 3.11.2 on PyPI 2026-09-11) overhauls text and fonts; tried in a scratch venv, it first drew in DejaVu because `~/.matplotlib/fontlist-v3.11.0.json` predated the house fonts (item 4's trap again), and with a fresh `MPLCONFIGDIR` it took the static JetBrains Mono where 3.10 takes the variable one; its files differ from 3.10.9's in about 8% of pixels. Changed: nothing on the page; the stale 3.11 cache was not deleted.
- run · 2026-11-15 · Kuramoto multi-panel at 300 dpi, Graphite and paper, 3.10.9 against 3.11.2, probe · taught item 5
