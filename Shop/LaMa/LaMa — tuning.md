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
