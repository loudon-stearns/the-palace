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

## 2026-11-14 — a factual repair of the Maker's own pages

3. **The page said things its own files disproved** (2026-11-14, a repair session, not a brief, so it leaves no run line: this ledger's run is one brief). A walk of the Maker's dispatch found contradictions; each was checked against the files and git before it changed. Selection Heuristics called raw Web Audio "considered and rejected" (written `e59ed830`, 2026-05-30, 14:47) while routing to [[Shop/Web Audio Worklet]], codified that evening (`e4e56804`) and given its page on 2026-05-31 (`a7f7af18`); it also sent custom browser DSP both to the Worklet and to RNBO's unproven web export. Now one route: the Worklet, which has run twice, with RNBO's web export named as the alternative for an instrument that must also ship to a DAW. Graphviz, Plotly and the HTML/React Artifact Smith are marked as having no Specialist yet. A closing paragraph names the fourteen Specialists the section does not route to and points at `node Shop/shop.mjs menu`. The Test Suite said "Last run: never"; it now gives the host check's tests (10 of 10, 2026-11-14) and `run-tests.mjs` (6 pass, 0 fail, 5 skipped, 21 not wired, of 32), and says the routing tests are unwritten. The stale "Phase 2" comment, a deprecated Midjourney example in Comparison Mode and the "8/8" test count were corrected. Found, not fixed (outside these pages): `run-tests.mjs` reads Lettering's quoted title with its quotes and skips it as unreachable. The Midjourney row in `host-capability.json` stays, because a test checks it. **Review owed** — Loudon's read of the new browser-audio route and the closing paragraph.

## 2026-11-15 — Loudon's ruling: the tree, with a zoom out, and the method

4. **The routing became a tree keyed by the part, with a zoom out** (2026-11-15, a ruling, not a brief, so no run line). Loudon, of the drafted tree: "I like your tree, I'd like to build in a \"zoom out\" though, the world is constantly improving, we should be doing searches for new updates and methods to consider as well. If a new method or update is out there, we should attempt to use it! This is how the shop can gain new tools." § Selection Heuristics is now the tree from [[The Shop — sketch — decision tree]], keyed by what a part is rather than by the deliverable, each line marked heard, seen, run or guess; the old routes' judgement is folded into its branches, and "always" is gone from them. The zoom out is a branch of its own: when to search, what is worth a try, how a try becomes a test proof, and how a tool that holds reaches the roster through the Shopkeeper and the [[Deposit Ceremony]]. Every Specialist now has a line, so the fourteen with no route are routed. A new § Testing and Improving a Specialist writes down the method Loudon agreed to the same day, and step 5 of § How I Work With You now leaves a delivery's lesson owed a review instead of writing the Specialist's Gotchas. The page carried no `version` before; it starts at **v1.1**, and v1.0 names the page as it stood on 2026-11-14. **Review owed** — Loudon's read of the marks behind each line, and of the picture branch, still a guess.
