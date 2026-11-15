---
title: "Lettering — tuning"
born: 2026-11-14
links:
  - target: "[[Lettering]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Lettering page's record of what rendering words has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from."
ledger: tuning
standards:
  for: "what rendering words as imagery taught the Lettering page"
  run: "one job: one or more voices rendered at one tier, or a probe of the pipeline"
  line: "- run · <date> · <voices>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pipeline"
  writes: "by hand, in the job's commit"
  merge: union
  kept: git
  trim: never
---

# Lettering — tuning

What each job taught the Lettering page. Opened on 2026-11-14 with the first run recorded here. The page's Gotchas came from BLUELINE's text-layer work of 2026-06-24 to 2026-07-01, before this ledger existed; their history is in that bench's commits, and no run lines are written back for it.

## From the card check — 2026-11-14 — "NO", Study tier

- run · 2026-11-14 · card check: shout-no ("NO"), skeleton, one seed, study · nothing new

## From the long-text test — 2026-11-15 — "DON'T LET GO", the house route against Z-Image-Turbo

1. **A model that spells free-hand wrote the phrase in a few seconds; the house route wrote it, and a misspelled ghost line with it.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `proofs/2026-11-15-long-text/`, seed 1111, the BLUELINE style suffix. The house route (Bangers skeleton, canny-locked SDXL, Study tier, 36 steps) took 262 s on a fresh server and kept the letters, but drew them black on a grey smudged slab and added a small misspelled script line. Z-Image-Turbo (6B, Apache-2.0, 8 steps, https://docs.comfy.org/tutorials/image/z-image/z-image-turbo) through its free Space `Tongyi-MAI/Z-Image-Turbo`, no token sent, wrote all three words right in rough white brush on black, with no skeleton, in 11.7 s. Qwen-Image's Space, and a second Z-Image call with an eight-word sentence, were refused: the anonymous GPU quota was spent. One phrase is not a pattern. Locally Z-Image needs roughly 20 GB of weights (an estimate) and a ComfyUI newer than 0.22. Side effect: the skeleton upload left `_tools/ComfyUI/input/probe-dontletgo.png` in the main checkout, and ComfyUI's `output/` holds copies of the day's renders. Changed: nothing on the page; whether Lettering's route changes is Loudon's call after he sees the pair.
- run · 2026-11-15 · long text, "DON'T LET GO", skeleton SDXL against Z-Image-Turbo, study · taught item 1
