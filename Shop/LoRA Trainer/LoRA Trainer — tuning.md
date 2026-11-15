---
title: "LoRA Trainer — tuning"
born: 2026-11-15
links:
  - target: "[[LoRA Trainer]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the LoRA Trainer page's record of what running it has taught: a line for every run, and a numbered item when a run taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what training LoRAs taught the LoRA Trainer page"
  run: "one training run through the Job Contract, or a probe of a trainer, a base model or a host"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# LoRA Trainer — tuning

What each run taught the LoRA Trainer page. Newest last. Begun 2026-11-15 by the session giving every Specialist a scroll of test proofs; the page's earlier history stays on the page and in git.

## From the zoom-out — 2026-11-15 — no run

1. **What is new since the pin, and one route that needs no pod.** *Owed a review: written by the shop-tests-image session outside a ledger review; found by its research agent, not re-checked, nothing tried.* ai-toolkit (https://github.com/ostris/ai-toolkit) has no tagged releases; since June its main branch added FLUX 3 Image (2026-10-09/15), Qwen Image 2 Turbo, Iris-3B, MOSS Image, Bria Fibo 2.0, P-H3-Image and MiniMax H3 Image, the Automagic V4 optimizer, and lists macOS on Apple Silicon as experimental (`run_mac.zsh`, MPS fixes 2026-07 and 2026-10-23). kohya sd-scripts now tags releases, v0.12.0 (2026-09-24) to v0.12.3 (2026-10-26), with OFTv2/BOFT networks (https://github.com/kohya-ss/sd-scripts/releases). mflux v0.24.0 (2026-10-27, https://github.com/filipstrand/mflux) trains LoRAs natively on Apple Silicon with `mflux-train` for Z-Image, FLUX.2 4B/9B, Krea 2, Qwen Image 2.1 and others; FLUX 3 Klein is inference only there. Changed: nothing on the page; the test list on the scroll proposes a free Study on this Mac with mflux before any pod.
