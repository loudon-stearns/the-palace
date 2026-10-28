---
title: "Generative Wavetable Libraries — tuning"
born: 2026-10-28
links:
  - target: "[[Generative Wavetable Libraries]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Generative Wavetable Libraries's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Generative Wavetable Libraries about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Generative Wavetable Libraries — tuning

What Generative Wavetable Libraries's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-28, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 19 — 2026-10-28

1. Measure a sweep, not just a held frame: a table can be clean frame by frame and still buzz in motion, because big jumps between neighbours repeat at the sweep's frame rate and land 4 to 15 Hz either side of every harmonic. *(offered by the steward, cycle 19)*
2. **Proposed for canon** · 2026-10-28 · [[Generative Wavetable Libraries]] · § What Requires Development, new bullet after 'Phase coherence across frames' · canon change owed *(proposed by the steward, cycle 19)*
   Why: the page names phase coherence as the open frame-to-frame problem, and this is the second one, found from Loudon's buzz note
   Path: `Projects/Generative Wavetable Libraries.md`
   > - **Smoothness along Position**: a table can be clean frame by frame and still buzz when swept, if neighbouring frames differ a lot. Each jump is a corner in the crossfade, repeated at the sweep's frame rate. A one-frame Gaussian blur across neighbours (on aligned frames) cut that buzz 10 to 18 dB on the family chains (2026-10-28, `loop-smoothing/`). Whether it becomes the packers' default waits on Loudon's ears.

- run · 2026-10-28 · cycle 19 · taught item 1, proposed item 2 for canon
