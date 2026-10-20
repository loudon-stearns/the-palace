---
title: "Action Potential Oscillator — tuning"
born: 2026-10-20
links:
  - target: "[[Action Potential Oscillator]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Action Potential Oscillator's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Action Potential Oscillator about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Action Potential Oscillator — tuning

What Action Potential Oscillator's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-20, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 9 — 2026-10-20

1. Tune the crowd by tuning its fastest member, and compensate each neuron's frequency from what was measured (samples since it fired, the voltage it actually starts from), never from planned phase lengths; whole-sample spikes and a ringing recovery quietly break the prediction. *(offered by the steward, cycle 9)*
2. **Proposed for canon** · 2026-10-20 · [[Action Potential Oscillator]] · § Implementation Status, end of the 'Key implementation decisions' list · canon change owed *(proposed by the steward, cycle 9)*
   Why: The entry records the single neuron's tuning decisions but not the crowd's, and 'the lock lands on the note' is the fact a player needs first.
   Path: `Projects/Action Potential Oscillator.md`
   > - **Pitch anchor (Faust crowd, October 2026)**: a locked crowd plays its fastest member's pitch, so the rate spread is shifted until that member sits on the `freq` input. A wide spread then locks on the dialed note (110.09 Hz at every spread tested) instead of up to four semitones sharp. The scattered crowd sits flat and climbs onto the note as it locks. Frequency compensation in the crowd is now measured, not predicted: each neuron counts the samples since it fired and charges from the voltage it actually starts at. That leaves only the whole-sample period error (1.4 cents at 110 Hz).

- run · 2026-10-20 · cycle 9 · taught item 1, proposed item 2 for canon
