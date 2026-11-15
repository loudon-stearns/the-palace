---
title: "SAM — tuning"
born: 2026-11-08
links:
  - target: "[[SAM]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the SAM page's record of what segmenting has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's rules and its wall; I keep where each came from. Never prune what a real cut taught."
ledger: tuning
standards:
  for: "what segmenting with SAM taught the SAM page"
  run: "one job through the Job Contract — auto or prompted — or a probe of a new input domain"
  line: "- run · <date> · <image set>, <auto | prompted | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a job on a domain the page hasn't seen"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# SAM — tuning

What each job taught the SAM page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The page was born from one session, the layer-decomposition work of 2026-06-25, deposited the next day (`50ef378f`); its run line is the date the page's `last_tested` recorded. The page's § The wall states the session's finding in the present tense, and these two items are where it came from. The three rules under § Gotchas were written undated, as rules, when the page was born; they stay on the page, and this ledger does not claim which run showed each.

## From the layer-decomposition session — 2026-06-25 — BLUELINE shot 02 and three test scenes

1. **SAM never once isolated the car in BLUELINE shot 02.** A pen drawing is sparse outline strokes on the same paper as everything else, with no solid textured region to grab, so SAM snapped to the nearest tonal block and over-segmented into fragments. The figure came out better from a keypoint mask than from SAM. Changed: the page names line art as its wall.
2. **On the same compositions re-rendered to photoreal or flat-cel (SDXL/FLUX + canny ControlNet), SAM segmented sharply:** 30/26/22 distinct object regions on photoreal, 44/47/25 on flat-cel, across three test scenes. Changed: flat cel-shaded became the page's best input and its Recipe converts first; SAM's training domain became the intermediate domain the convert-first reframe in [[Animate the Background]]'s N-layer case converts to.

- run · 2026-06-25 · layer-decomposition session, BLUELINE shot 02 and three test scenes, probe · taught items 1, 2

## From the card check — 2026-11-14 — a figure in fog, prompted and auto

3. **On this Mac I run on the CPU, and auto mode is the slow one.** At 768×1024, a prompted ViT-B cut (`sam_b.pt`, one point) took 3.8 s and auto MobileSAM (`mobile_sam.pt`) took 28.5 s, ten masks; ultralytics chose the CPU, not MPS. The page had said seconds for MobileSAM and tens of seconds for ViT-B auto. Changed: the card's Speed line gives the measured times; the Job Contract's cost line waits for the review. Whether passing `device="mps"` is faster was not tried. Owed a review: written by the card-check session, outside a ledger review.
- run · 2026-11-14 · card check: Blender's prompt_only_sdxl_seed7 render, one point prompt and auto, probe · taught item 3

## From the thin-sword test — 2026-11-15 — the card's two models against SAM 2.1

4. **The card's ViT-B loses a thin blade; every size of SAM 2.1 holds it.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `proofs/2026-11-15-thin-sword/`, on the 2026-11-14 fog render (`Shop/Blender/tests/renders/prompt_only_sdxl_seed7.png`), with one point on the blade and with figure plus blade. The share of the blade's 193-pixel centreline inside the mask, found by script: ViT-B 1% and 0% (its masks spilled into the fog, 3.7% and 21.9% of the frame); MobileSAM 95% and 11%; SAM 2.1 tiny 99.5% and 99.5%, base+ 98% and 99.5%, large 97% and 99%. On the CPU through the installed ultralytics 8.4.78, 0.4 to 2.0 s a cut; SAM 2.1's weights download ungated (70 to 78 MB for tiny and base+). SAM 3 and 3.1 are gated with manual approval (`facebook/sam3`, https://docs.ultralytics.com/models/sam-3) and were not run; ungated mirrors were not used. A SAM-HQ try through transformers came out scattered, as did plain SAM by the same path, so it was discarded as a fault of the path. Changed: nothing on the page; whether SAM 2.1 replaces ViT-B is this item's review, after an eye on the edges.
- run · 2026-11-15 · thin sword, five models, two prompts, probe · taught item 4
