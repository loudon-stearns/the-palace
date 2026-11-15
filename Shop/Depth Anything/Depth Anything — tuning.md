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

## From the card check — 2026-11-14 — two of Blender's 2026-06-13 renders

4. **On a figure against a flat, fogged backdrop, the 33rd and 66th percentiles landed on the same value (22), and the middle band came out empty.** Most of that frame is one far depth, so the percentile split cannot make three bands; on the blocked fill, a scene with spread depth, the same split gave 63 / 83 and three bands. Changed: `depth_map.py` still splits by percentile and prints the thresholds, so a collapse shows. Proposed for the Recipe at the review: on a frame that is mostly one depth, take thresholds from the histogram's valleys. Owed a review: written by the card-check session, outside a ledger review.
- run · 2026-11-14 · card check: Blender's prompt_only_sdxl_seed7 and blocked_sdxl_fill renders, depth + bands · taught item 4

## From the real-photo test — 2026-11-15 — two photographs, V2-Small against Depth Anything 3

5. **On real photographs V2's bands hold, and Depth Anything 3 runs on this Mac.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `proofs/2026-11-15-real-photo/`: two photographs found on this Mac, a village scene (640×480, from JUCE's examples, licence not checked) and the US Navy portrait of Grace Hopper (512×600, public domain, from matplotlib's sample data). V2-Small passed the card's checks and its three bands each took about a third of the frame (thresholds 23/75 and 93/203), so the percentile bands did not collapse as they did on the fog render (item 4). Depth Anything 3 (ByteDance Seed, released 2025-11-14, https://github.com/ByteDance-Seed/Depth-Anything-3; Small, Base, Mono-Large and Metric-Large Apache-2.0) ran on MPS from a throwaway venv after about five minutes of setup (a source clone without xformers or gsplat, `KMP_DUPLICATE_LIB_OK=TRUE`): Small 0.9 to 3.8 s, Mono-Large 2.3 s after a 119 s first load. V2's front-to-back order agreed with DA3 Mono-Large at Spearman 0.97 and 0.89, with DA3 Small at 0.72 and 0.79. Which is right is an eye's call. Nothing newer than DA3 that clearly beats it turned up. Changed: nothing on the page.
- run · 2026-11-15 · two real photographs, V2-Small against DA3 Small and Mono-Large, probe · taught item 5
