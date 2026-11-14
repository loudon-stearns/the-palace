---
title: "CAD Drafter — tuning"
born: 2026-11-14
links:
  - target: "[[CAD Drafter]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the CAD Drafter page's record of what drawing parts has taught it: a line for every build, and a numbered item when one taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real build taught."
ledger: tuning
standards:
  for: "what drawing parts with build123d taught the CAD Drafter page"
  run: "one build through the Job Contract — a Sketch, Study or Piece — or a probe of the venv or the build itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pinned build123d"
  writes: "by hand, in the build's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# CAD Drafter — tuning

What each build taught the CAD Drafter page. Each item names what the build showed and what changed because of it, if anything did. Newest last. Started on 2026-11-14 with the first build after the 2026-10-20 probe. The page's seven 2026-10-20 gotchas are still dated on the page; their history is the probe report, `Shop/Shopkeeper/probes/2026-10-20-cad/probe-report.md`, and they have not been moved here.

## From the card check — 2026-11-14 — the Haptic Handwheel probe, rebuilt

1. **The venv lived in a worktree that is gone; outside every checkout, it rebuilt in a second and the build held to the byte.** *Owed a review: written by the shop-fix session outside a ledger review.* The page, the test plan and the card all ran `../../../../.venvs/cad/bin/python` from the probe folder, a venv at a worktree's root. No `cad` venv existed anywhere on the Mac: the worktree that made it on 2026-10-20 had been removed, and the venv with it. uv's cache still held `build123d` 0.13.0, so `uv venv --python 3.12 ~/.venvs/cad` and `uv pip install --offline … build123d==0.13.0` made it again in under a second, 581 MB. A copy of the probe's four sources in `Shop/CAD Drafter/proofs/2026-11-14-card-check/` built in 10–14 s, printed `24/24 checks: model = source, files = model`, and wrote three SVG sheets, three STEP files, the ladder's STL and `check.json`, every one byte-identical to the 2026-10-20 files. Changed: the venv lives at `~/.venvs/cad`, and the page's Resource Footprint, the test plan and the card's Run line say so. The host manifest's note that the venv is "made per worktree" is not this page's to change.
- run · 2026-11-14 · Haptic Handwheel probe rebuild, probe · taught item 1
