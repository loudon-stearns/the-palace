---
title: "Splice Instrument Forge — tuning"
born: 2026-10-26
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Splice Instrument Forge's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Splice Instrument Forge about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Splice Instrument Forge — tuning

What Splice Instrument Forge's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-26, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-10-26

1. The forge's WAVs live only on this Mac and can vanish. A recipe that keeps no Splice asset id can't be rebuilt, so every manifest and recipe now carries the id beside the file. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-10-26 · [[Splice Instrument Forge]] · § What it stands on, the bullet 'Live ships a shell for every target.' · canon change owed *(proposed by the steward, cycle 1)*
   Why: the entry should name where the forge's parts come from now; copying from saved Sets is what let three bugs and a hidden fade-out into every Set
   Path: `Projects/Splice Instrument Forge.md`
   > **Live ships a shell for every target.** Sampler, Simpler and Drum Sampler defaults, and factory Drum Racks, all as gzipped XML in the Core Library. It also ships a default audio and MIDI track, a sample library and a beat template, all written by Ableton's own build. The forge takes its tracks, clips and drum pads from these (`workshop/move-7-shells/`), never from a Set someone saved, and `audit.mjs` shows, value by value, where any part differs from Ableton's.

- run · 2026-10-26 · cycle 1 · taught item 1, proposed item 2 for canon
