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
