---
title: "LaMa — tuning"
born: 2026-11-08
links:
  - target: "[[LaMa]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the LaMa page's record of what filling holes has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real plate taught."
ledger: tuning
standards:
  for: "what inpainting with LaMa taught the LaMa page"
  run: "one job through the Job Contract — an image and a mask in, a clean plate out — or a probe of the model itself"
  line: "- run · <date> · <brief or probe>, <plate | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a decomposition or a change to the weights"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# LaMa — tuning

What each job taught the LaMa page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The page's Gotchas were rules from the start, undated; this ledger was opened on 2026-11-08 so their history has a place. The three items are those founding gotchas, written into the page at its deposit on 2026-06-26 (`50ef378f`) from the BLUELINE shot 02 layer-decomposition session. The page does not say which of them that session hit and which were known going in. The run line is the date the page's `last_tested` kept.

## From the founding job — 2026-06-25 — BLUELINE shot 02, removing the figure

1. **LaMa paints plausible texture, not the actual occluded shape.** If the real car door was behind the figure, it paints a believable surface, not necessarily that door. Changed: nothing on the page; exact occluded-shape completion stays the open problem.
2. **Mask quality decides the plate.** A mask that leaks past the object's edge leaves a halo of the original foreground; one too tight leaves a fringe to fill. Changed: dilate the mask a few pixels past the silhouette (~5–10 px in the Recipe) before handing it over, whether it came from [[SAM]], keypoints or the depth silhouette.
3. **Very large holes drift:** the bigger the missing region against the frame, the more LaMa guesses. Changed: best on holes that are a minority of the frame, with context on most sides.
- run · 2026-06-25 · BLUELINE shot 02, plate · taught items 1, 2, 3

## From the card check — 2026-11-14 — a figure filled out of a fog scene

- run · 2026-11-14 · card check: Blender's prompt_only_sdxl_seed7 render with SAM's figure mask, dilated 9 px, plate · nothing new

## From the dilate sweep — 2026-11-15 — the fog figure at three dilations, one very large hole, and Moebius

4. **A wider dilation lifts the haze, up to a point; a very large hole drifts; Moebius runs here and invents.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `proofs/2026-11-15-dilate-sweep/`, the 2026-11-14 fog render and SAM's mask. Every pixel outside the hole was unchanged in every run. A proxy for the ghost (mean colour distance from a per-row fog model, 0 to 48 px outside SAM's mask; the untouched input scores 3.04): dilate 9, 1.67; 21, 1.41; 41, 1.41; fills of 5.3 to 8.7 s on the CPU. A box hole of 56.8% of the frame came back a grey smear (28.0), bearing out item 3. The proxy is blind to invented content. One agent's look, not Loudon's: a soft figure-shaped smudge stays inside the fill at every dilation. Moebius (hustvl, ECCV 2026, weights 2026-06-18, code Apache-2.0, weights MIT, 0.22B, https://github.com/hustvl/Moebius) ran on MPS in about 33 s after four minutes of setup, with its teacher import commented out (it needs triton), at 512×512 only; it scored 1.28 at dilate 21 but painted a dark object into the hole, and invented a building in the big one. Changed: nothing on the page; dilate 21 over 9 is a proposal for the Run line, at this item's review.
- run · 2026-11-15 · dilate sweep 9/21/41, a 57% hole, Moebius against LaMa, probe · taught item 4
- run · 2026-11-17 · the second light enrichment round (1 job: tear-at-the-edge; `Enrichment/light-round-2026-11-2/pieces/Animate the Background/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: tear-at-the-edge; `Enrichment/light-round-2026-11-2/pieces/Animate the Background/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: tear-at-the-edge; `Enrichment/light-round-2026-11-2/pieces/Animate the Background/`), sketch · nothing new · by the bench
- note · 2026-11-17 · the three run lines above for tear-at-the-edge are one job run three times; its WebP kept one hash across all three. LaMa was rerun through `Shop/LaMa/proofs/2026-11-14-card-check/lama_fill.py` with BLUELINE's mask and returned the project's plate pixel for pixel, by the maker's check. The piece is placed as a proposal in Animate the Background's rich face. · by the Concierge
