---
title: "Figure Rig — tuning"
born: 2026-11-14
links:
  - target: "[[Figure Rig]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Figure Rig page's record of what posing figures has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from."
ledger: tuning
standards:
  for: "what posing MPFB2 figures and drawing their plates taught the Figure Rig page"
  run: "one job: one or more figures posed and plated, a redraw, or a probe of the rig"
  line: "- run · <date> · <poses and bodies>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the rig"
  writes: "by hand, in the job's commit"
  merge: union
  kept: git
  trim: never
---

# Figure Rig — tuning

What each job taught the Figure Rig page. Opened on 2026-11-14 with the first run recorded here. The page's Gotchas came from BLUELINE's rig work of 2026-06-30 and 2026-07-01, before this ledger existed; their history is in that folder's commits, and no run lines are written back for it.

## From the card check — 2026-11-14 — pose B, one male figure, headless

1. **`pose_rig_mpfb_v3.py` documented gender backwards.** Its `--gender` comment said `0=male 1=female`, and its usage example labelled `--gender 0.0` as `B_male`. MPFB's `macro.json` says the low end is female and the high end male, and a `--gender 1.0` render came out male, as the page's gotcha says. Changed: the comment and the two usage lines in the script were corrected. The page's gender gotcha was already right; whether it should name the script's old mistake waits for the review. Owed a review: written by the card-check session, outside a ledger review.
- run · 2026-11-14 · card check: pose B, gender 1.0, ink + depth + OpenPose, sketch · taught item 1
