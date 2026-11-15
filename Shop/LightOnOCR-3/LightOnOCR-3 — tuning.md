---
title: "LightOnOCR-3 — tuning"
born: 2026-11-15
links:
  - target: "[[LightOnOCR-3]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the LightOnOCR-3 page's record of what running it has taught: a line for every run, and a numbered item when a run taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what reading pages with LightOnOCR taught the LightOnOCR-3 page"
  run: "one page or batch read through the Job Contract, or a probe of a model, a backend or a host"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# LightOnOCR-3 — tuning

What each run taught the LightOnOCR-3 page. Newest last. Begun 2026-11-15 by the session giving every Specialist a scroll of test proofs; the page's earlier history stays on the page and in git.

## From the local Mac probe — 2026-11-15 — one synthetic page, two backends

1. **The 0.8B model runs on this Mac with no pod, and mlx-vlm is the usable backend.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `lightonai/LightOnOCR-3-0.8B` (Apache-2.0, not gated) in a throwaway venv, transcribe mode, greedy: a 1240×1754 page drawn with PIL (title, three-line paragraph, 4×3 ruled table) read with character error 0.0 over 293 characters and all 12 table cells, the table as HTML, on both backends. mlx-vlm 0.7.12: load 23 s, 230 tokens in 16.9 s. transformers 5.23 on MPS: 481 s for the same tokens, about 2 s a token. One clean page, one cold run each, M1 Max 32 GB; grounding mode not tried. Changed: nothing on the page; the card's Run line still names a pod, and whether the Mac becomes the Sketch route is this item's review (`proofs/2026-11-15-local-mac/`).
2. **What is new, 2026-11-15** (not tried unless said). The family is 0.8B, 1B and 4B, cards last updated 2026-10-09, nothing newer than the pin (https://huggingface.co/lightonai/LightOnOCR-3-0.8B); a free Space `lightonai/LightOnOCR-3-Demo`; MLX ports of the 1B (mlx-community, 2026-10-17) and 0.8B (community, 2026-11-01 and 11-14) and GGUFs (2026-11-11); Yale's handwriting and archive LoRAs `yale-cultural-heritage/LightOnOCR-3-{0.8B,4B}-cultural-heritage-eng` (2026-11-03), which meet the card's untested handwriting. Rivals with Mac routes: PaddleOCR-VL-1.6 (0.96B, Apache, 2026-05-27, mlx 4-bit, a free CPU Space; top of OmniDocBench v1.6 by https://blog.roboflow.com/best-open-source-ocr-models/, a third party), Unlimited-OCR-2 (baidu, 3.3B, MIT, 2026-10-27), MiniCPM-OCR-1.0 (1.3B, Apache, 2026-10-21), Xiaomi-OCR-0, GLM-OCR, DeepSeek-OCR-2. Found by the session's research agent; not re-checked. Changed: nothing; the test list on the scroll carries them.
- run · 2026-11-15 · local Mac probe, one synthetic page, mlx-vlm and transformers, probe · taught items 1, 2
