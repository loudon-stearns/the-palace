---
title: "Maker — tuning"
born: 2026-11-07
links:
  - target: "[[Maker]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the record of what routing briefs has taught the Maker: where a brief went, and what the routing missed. A line for every brief, and a numbered item when one taught something."
ledger: tuning
standards:
  for: "what routing briefs taught the Maker: where a brief went, and what the routing missed"
  run: "one brief the Maker decodes and routes, from intake to delivery"
  line: "- run · <date> · <brief> → <Specialists> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a brief"
  writes: "the session that ran the brief (an Enrichment, a steward, a Daily Page making), in its commit"
  merge: union
  kept: git
  trim: never
---

# Maker — tuning

What routing briefs has taught the [[Maker]]. A run is one brief, decoded and routed from intake to delivery. Numbered items, grouped by date; newest last. The page keeps the present-tense rules; this keeps what a brief taught and where the lesson went.

## From the page's Gotchas — seeded 2026-11-07

1. **No host-capability check before dispatch** (2026-05-10). In Round 1, the Kuramoto Sketch arc, Cowork's Linux arm64 sandbox could not host Manim: `manimpango` had no aarch64 wheel and needed sudo for `libpangocairo-dev`. The brief was decoded and the Specialist chosen, and the dispatch failed only at install time — wasted intake. **Paid in § Host Capability Check** (implemented 2026-05-30: `Shop/Maker/host-capability.json`, `host-capability-check.js`).
2. **A fallback under host failure can be worth keeping** (2026-05-10). The sandbox forced a Matplotlib fallback for the two-phasors-uncoupled Sketch. It came out substantively different from the canonical Manim render — typography, stroke weight, resolution — and Loudon kept both as a Comparison-Mode artifact. **Paid in § Host Capability Check**: the resolution rule keeps both renders and lets the brief's author choose.
