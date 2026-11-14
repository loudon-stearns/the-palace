---
title: "Remotion — tuning"
born: 2026-11-08
links:
  - target: "[[Remotion]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Remotion page's record of what rendering video from React has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real render taught."
ledger: tuning
standards:
  for: "what rendering with Remotion taught the Remotion page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the toolchain itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Remotion — tuning

What each job taught the Remotion page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The two 2026-05-26 items are the page's founding gotchas, moved here on 2026-11-08 when the page's Gotchas became present-tense rules; the run line under them is the job the page's `last_tested` recorded. The 2026-05-30 smoke by existing-artifact check is on the page's Test Suite, not here.

## From the Kuramoto phenomena walk — 2026-05-26 — Study, 1280×720@30

1. **The install was lighter than the Specialist expected: 184 packages in about 7 s.** A minimal hand-rolled Remotion 4.0.380 project (package.json, tsconfig.json, src/{index,Root,PhenomenaWalk}.tsx, remotion.config.ts) installed in under 10 s on a warm npm cache, about 100 MB of node_modules, and renders booted in a second. The standing intuition that Remotion projects are heavy came from `create-video` scaffolds, which pull in ESLint, Tailwind and other defaults the brief didn't need. Changed: for Sketch and Study work in the Shop, hand-write the project files instead of scaffolding.
2. **`Sequence` with a local frame was the right pattern for a card-walk.** Each card animated against `frame - i * CARD_FRAMES` inside its own `Sequence`, so one `TitleCard` component ran its own intro spring, body fade-in and outro fade, with no per-card timeline arithmetic in the parent. It is Manim's per-`Scene` isolation at the React level. Changed: the parent composes; the child knows its own animation.

- run · 2026-05-26 · Kuramoto phenomena walk, study · taught items 1, 2

## From the card check — 2026-11-14 — the phenomena walk, re-rendered

3. **Renders are byte-identical within one Remotion version, and the caret let the version float.** *Owed a review: written by the shop-fix session outside a ledger review.* `npx remotion render PhenomenaWalk … --codec h264 --crf 20 --bundle-cache=false`, in a worktree with the main checkout's `node_modules` linked (no install), wrote 480 frames, 16.000 s at 1280×720@30, in 17.2 s and then 13.9 s; the two files hashed identical. The `node_modules` had been reinstalled on 2026-11-09 and carries Remotion 4.0.542, because `package.json` asks `^4.0.380`; the new files differ from the committed 2026-05-26 one (433 KB against 1.37 MB). The page's Study estimate of ~30 s per second of video was about thirty times the measured cost. Changed: `tool_version` names 4.0.542 and where it came from; the test plan says to pin exactly when a render must be reproduced (a gotcha for the page waits on this item's review); Study's time is the measured one; the test plan's Speed Bench drops a line no record supports.
- run · 2026-11-14 · Kuramoto phenomena walk re-render, study · taught item 3
