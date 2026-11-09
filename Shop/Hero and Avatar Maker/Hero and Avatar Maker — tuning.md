---
title: "Hero and Avatar Maker — tuning"
born: 2026-10-16
links:
  - target: "[[Hero and Avatar Maker]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Hero and Avatar Maker's record of what making faces has taught it: a line for every run, and a numbered item when a run taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real batch taught."
ledger: tuning
standards:
  for: "what making faces taught the Hero and Avatar Maker"
  run: "one face request through the companion door, or one batch through make_faces.py"
  line: "- run · <date> · <entry or batch>, <hero | avatar | hero + avatar> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a batch or a hard redo"
  writes: "the regen lane, in the face's commit; a batch is marked by hand in the batch's commit"
  merge: union
  kept: git
  trim: never
---

# Hero and Avatar Maker — tuning

What each run taught the Maker. Each item names what the run showed and what changed because of it, if anything did. Newest last. The runs before this ledger are in git, in the face commits since 2026-06-23. These items are seeded from the page's two lists and from the 2026-09-26 batch lessons, which waited on the Palace Ceremonies baton for a ledger to hold them.

## From the first faces — 2026-06-23 to 06-25

1. **Kuramoto's near-black hero vanished under the backdrop veil.** Changed: brighten dark heroes about 20%.
2. **FLUX hands failed on the Retrospective Delay séance.** Changed: compose around hands; the cat became the medium.
3. **An unwatched batch is the expensive mistake.** Changed: one frame before the batch.
4. **The fixed hero was veiled with the top chrome.** Changed: STIGMERGY's nav and status sit on a higher layer.

## From the hub and ceremony batch — 2026-06-24

5. **FLUX lettered the engraving, manuscript and diagram idioms with gibberish; "no text" wasn't enough.** Changed: the hard anti-text clause.
6. **Loudon's Toolkit's "signal-chain ecology" diagram became a generic island-city.** Changed: one dominant metaphor for structural entries.
7. **Fine engravings vanished at 24–48px.** Changed: bold-silhouette icons even when the hero is delicate.

## From the 2026-09-24 batch

8. **Printmaking idioms drew fake corner signatures in about a quarter of the batch.** Changed: the clause names signatures, monograms and printmaker's marks.
9. **A fifth came back glossy, and a style guard at the end of a prompt didn't hold.** Changed: the photographic-drift guard, and naming the medium first.
10. **A vision pass flagged 47 of 102, and a re-run did nothing because `generate` skips existing renders.** Changed: review by eye, and move rejects aside first.
11. **A mark in a bottom corner moved on a re-render rather than going.** Changed: trim a thin bottom strip instead.

## From the 2026-09-26 batches

12. **Two figures close in a warm room read as a couple.** Changed: ages, a pointing gesture, seen from behind.
13. **Naming a shape after an everyday object draws the object, and a shadow "shaped like" something comes back as the thing.**
14. **FLUX couldn't draw a bowtie inlay as hero or icon.** Changed: composite it.
15. **A print inside a framed panel couldn't be strip-trimmed.** Changed: patch the flat margin.
16. **FLUX turned an arrow into its growth sign, and once into a letter N.** It cuts every hole round, and a front-view shape sorter reads as a traffic light.
17. **`_renders/` nearly went with a removed worktree.** Changed: carry it out first.
18. **The endpoint's GPU list ran dry late at night.** The client's 15-minute wait covered it.
19. **The tool returned a 409 when it submitted too soon, and agents didn't share GPU parking.** Fixed in `43f53bae`.
20. **One-sided place, and seeds that weren't recorded.** Fixed in `5d3c0d60`.
21. **JEWEL, ROSETTA, Meaning and the Link and AI Partnership Philosophy had their faces filed under their titles, not their filenames.** Changed: both tools place by filename; `face-audit.py` still checks the title.

## From the 2026-10-14 batch

22. **Ukiyo-e brought calligraphy and a red seal to a gate.** Changed: another idiom.
23. **A clock got numerals despite "a completely blank face", and a synth panel lettered itself twice.** Changed: both went on the text-bearing list.
24. **"Candlestick telephone" came back as a candle beside a phone.** Changed: name objects by shape and parts.
25. **"Plain blank pages" on an open manual failed once and held once.** Not reliable.

## From The Lens's face — 2026-11-03

26. **FLUX could not draw "bars that change inside a ring" as an icon in three tries.** One came back as a printmaker's signature on a ring that read as a life buoy, despite the anti-text clause (item 8 again); one drew bars that never crossed the rim; one read as the letters "lp". Changed: cut the icon from the hero's own central object, a square around it scaled to 1024, so hero and icon are one family (fb1c62bf).

## From STIGMERGY's face — 2026-11-07

27. **Faces could not render from about 2026-11-05 until the v2 move, and the log said they could.** Three STIGMERGY hero runs logged `workersMax=1` and sat `IN_QUEUE` 900 s with `/health` all zeros: v1's endpoint `PATCH` answered 2xx and changed nothing. `set_workers` now reads the scale back and raises (`063f39bb`; RunPod runbook § Incidents). If a render queues with `/health` at all zeros, read `workers.max` back before blaming stock: no stock reads `throttled`, a cold pull `initializing`.
28. **FLUX does not know "1-bit ordered-dither halftone" as a medium.** Asked for one in phosphor green, it rendered a glossy particle galaxy, the CGI look the art direction forbids. Re-rolled as "linocut print, hand-carved, bright phosphor green ink on black paper … two colours only, no glow" it came back on brief. For a terminal or phosphor page, name a print medium FLUX knows and the two colours; leave the dither to the word "print".
- run · 2026-11-07 · STIGMERGY, hero + avatar (hero re-rolled once, icon's corner signature trimmed) · taught items 27, 28
- run · 2026-11-08 · the November weave's 8-face batch (FM Synthesis, Cycle 5 Explorer, Rational Hearing, Synth Templates, Resonance and Damping, Auditory Illusions, The Gallery, Synthesis Notes (Loudon)), hero + avatar (25 renders; three shapes FLUX would not draw were built by hand, per items 14 and 26; spend figure owed from /v2/billing/serverless) · nothing new
