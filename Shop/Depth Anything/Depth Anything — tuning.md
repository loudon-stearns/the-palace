---
title: "Depth Anything — tuning"
born: 2026-11-08
links:
  - target: "[[Depth Anything]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Depth Anything page's record of what reading depth has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real image taught."
ledger: tuning
standards:
  for: "what reading depth with Depth Anything taught the Depth Anything page"
  run: "one job through the Job Contract — a depth map or a band split — or a probe of the model itself"
  line: "- run · <date> · <brief or probe>, <depth | bands | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a decomposition or a change to the checkpoint"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Depth Anything — tuning

What each job taught the Depth Anything page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The page's Gotchas were rules from the start, undated; this ledger was opened on 2026-11-08 so their history has a place. The three items are those founding gotchas, written into the page at its deposit on 2026-06-26 (`50ef378f`) from the BLUELINE shot 02 layer-decomposition session. The page does not say which of them that session hit and which were known going in. The run line is the date the page's `last_tested` kept.

## From the founding job — 2026-06-25 — BLUELINE shot 02, layer decomposition

1. **Objects at the same distance share a band** — the car at building depth came out in one band with the buildings. Depth orders the scene; it does not isolate every object. Changed: per-object separation goes to [[SAM]] (in a converted domain) or keypoints.
2. **Depth gives a surface, not the geometry hidden behind a foreground element.** Changed: texture behind the figure goes to [[LaMa]]; true occluded shape stays an open problem.
3. **Depth is smooth, so band boundaries are soft** and shimmer when animated unless treated. Changed: dilate or feather each band mask a few pixels before use (the Recipe carries it).
- run · 2026-06-25 · BLUELINE shot 02, depth + bands · taught items 1, 2, 3
