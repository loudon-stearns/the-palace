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

## From the reach-pose test — 2026-11-15 — a new pose on two bodies

2. **On `upperarm01.R` a negative Z raises the arm; age and weight near their ends move the body little.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `proofs/2026-11-15-reach-second-body/`: a "reach" pose (right arm thrown up, left knee forward) on the default male and on a female at age 0.875 and weight 0.85, each 10 to 11 s of plates and 2.5 s of OpenPose, 18 of 18 keypoints in view. Following POSE_A's pattern, Z +120 swung the arm forward and across the body; a three-way sign probe showed Z −120 raises it (`arm_sign_probe/`). Whether POSE_A's own arms rise was not checked. The two silhouettes look nearly the same to the agent that made them. The D2 redraw (about 25 min) was not run. Zoom out: MPFB 2.0.18 (2026-10-10, asymmetry targets) is out, 2.0.17 is installed; 2.0.16 (2026-06-13) added an expressions workflow that could feed the unbuilt face keypoints (https://static.makehumancommunity.org/mpfb/releases/release_2016.html). Not tried. Changed: nothing on the page.
- run · 2026-11-15 · reach pose on two bodies, probe · taught item 2
