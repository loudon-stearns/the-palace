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

## From the mount block and two edge cases — 2026-11-15

2. **The mount block draws and checks; zero clearance and an overflowing view pass without a word, and a small hole hides under its own label.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `proofs/2026-11-15-mount-block-edges/`: HH-MNT-01, an 80×80×8 plate with a Ø16 bore and four Ø4.5 holes on a 66 square, built with `~/.venvs/cad` (build123d 0.13.0) and the 2026-11-14 `drawing.py`; 6/6 checks, STEP read back to 49083 mm³, SVG and STEP byte-identical on rerun. The motor's bolt pattern is a measurement nobody has taken, so the sheet carries a red HOLD and no STL is written. A ring at 0.00 clearance and at −0.05 both built with no complaint; only a guard added for the test said HOLD. A view at 3:1 was written with 21 shapes outside the frame and the sheet grown to 297×264 mm, again with no complaint. On the sheet, the "4× Ø4.5" label's paper knockout covers one hole. Zoom out: build123d 0.13.0 is still the newest (PyPI 2026-09-21); build123d-drafting-helpers 0.15.5 (2026-09-22, https://github.com/pzfreo/build123d-drafting-helpers) found all five holes in 0.05 s but called the square a Ø93.34 bolt circle, and draws its text as glyph outlines. Changed: nothing on the page; the guards and a leader for small features are the next build.
- run · 2026-11-15 · HH-MNT-01 mount block, zero-clearance and 3:1 overflow edges, drafting-helpers tried, probe · taught item 2
