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

## From the test-scroll session — 2026-11-15 — first sound, and the two audio paths

4. **Remotion carries sound in a `Sequence` to within half a frame, at 1080p.** *Owed a review: written by the shop-tests-motion session outside a ledger review.* A hand-written project (`proofs/2026-11-15-first-sound/`, node_modules linked from the phenomena walk, no install) laid Kokoro's mono 48 kHz read in a `<Sequence from={15}>` under a 1920×1080, 30 fps caption card lit by Kokoro's word timings. The sound starts at 0.825 s against 0.813 planned, 12 ms late. Output AAC 48 kHz stereo, untouched loudness (−25.5 LUFS): normalizing stays ffmpeg's. Render 20.8 s for 9.8 s at load near 50. The bare `Audio` import from `remotion` is now a deprecated alias of `Html5Audio`.
5. **Zoom-out, 2026-11-15: `@remotion/media`'s `Audio` plays a mono file 3 dB louder than `Html5Audio`, and is otherwise the same.** *Owed a review: written by the shop-tests-motion session outside a ledger review.* Sources: the installed 4.0.542 packages (`remotion`'s `Audio` marked deprecated; `@remotion/media` exports `Audio` and `Video`; `@remotion/web-renderer` present) and Remotion's GitHub release notes (v4.0.356–v4.0.391 moved audio work into `@remotion/media`); npm's latest is 4.0.543, one patch on. Tried: the same composition with each, by a prop. `@remotion/media` came out −22.5 LUFS against −25.5; decoded and compared, a gain of 1.415 (√2) at zero lag, residual −41 dB after matching. The old path spreads mono to stereo at equal power, the new copies it at full level. Both start 12 ms late. Not tried: `@remotion/web-renderer`. Proof: `proofs/2026-11-15-media-audio/`.
- run · 2026-11-15 · caption card with Kokoro's sentence, Html5Audio, study · taught item 4
- run · 2026-11-15 · the same card through @remotion/media's Audio, probe · taught item 5
