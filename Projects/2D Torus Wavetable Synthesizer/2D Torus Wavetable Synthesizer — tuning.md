---
title: "2D Torus Wavetable Synthesizer — tuning"
born: 2026-10-20
links:
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am 2D Torus Wavetable Synthesizer's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught 2D Torus Wavetable Synthesizer about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# 2D Torus Wavetable Synthesizer — tuning

What 2D Torus Wavetable Synthesizer's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-20, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 22 — 2026-10-20

1. A score written as knob moves is a spec for an instrument. Each hand-drawn helper in the script (sing, click, the per-voice pitch formulas) names a control a player would need, and the per-voice pitch formula names the one solve every voice must do for itself. *(offered by the steward, cycle 22)*
2. **Proposed for canon** · 2026-10-20 · [[2D Torus Wavetable Synthesizer]] · § Forward Vectors, new first bullet · canon change owed *(proposed by the steward, cycle 22)*
   Why: Loudon asked (2026-10-18) to turn the étude into a plan for instruments; the page's forward vectors don't yet name that direction.
   Path: `Projects/2D Torus Wavetable Synthesizer.md`
   > - **The Torus Ensemble** — five instruments on one engine, read back out of Étude No. 2: the Singer (melody, with the pitch solved on any lock), the Atlas (lock pads, same note with a new face, or the Farey scale), the Threshold (off-ratio voices with the hands as macros), the Hands (drums grown from surfaces, 12/8 and aksak feels) and the Conductor (tempo curve, let go together, takes recorded as knob moves). Built in the browser first; the plan is in `Instruments/Instrument Plan — draft.md`.

- run · 2026-10-20 · cycle 22 · taught item 1, proposed item 2 for canon

## From cycle 23 — 2026-10-20

3. The pitch on a lock is not the scan's period but the lowest strong partial the surface puts on it (k = |m·b + n·a|), and computing that from the surface's coefficients recovers every hand-tuned pitch formula in the étude. *(offered by the steward, cycle 23)*
4. **Proposed for canon** · 2026-10-20 · [[2D Torus Wavetable Synthesizer]] · § What Exists, new bullet after 'A Hopf control surface and a Kuramoto scan mode' · canon change owed *(proposed by the steward, cycle 23)*
   Why: The page's inventory doesn't yet name the first built instrument or the heard-partial solve it rests on.
   Path: `Projects/2D Torus Wavetable Synthesizer.md`
   > - **The Singer**, the first instrument of the Torus Ensemble: `Instruments/singer.html`, a Hopf voice played from a keyboard. It reads the surface's coefficients to find the partial the ear hears on each lock, so a note keeps its pitch when the lock changes. Built and checked offline; not yet played by hand.

- run · 2026-10-20 · cycle 23 · taught item 3, proposed item 4 for canon
