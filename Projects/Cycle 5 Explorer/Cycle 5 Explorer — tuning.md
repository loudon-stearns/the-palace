---
title: "Cycle 5 Explorer — tuning"
born: 2026-10-30
links:
  - target: "[[Cycle 5 Explorer]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Cycle 5 Explorer's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Cycle 5 Explorer about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Cycle 5 Explorer — tuning

What Cycle 5 Explorer's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-30, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-10-30

1. The page's sound can be checked without speakers. Swap window.AudioContext for an OfflineAudioContext in a Playwright init script, then call the page's own playScale and playChord. A legato scale needs a 'which note grew across this onset' test, because the last note is still ringing. *(offered by the steward, cycle 1)*
- run · 2026-10-30 · cycle 1 · taught item 1
