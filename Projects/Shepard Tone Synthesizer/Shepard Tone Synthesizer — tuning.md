---
title: "Shepard Tone Synthesizer — tuning"
born: 2026-10-18
links:
  - target: "[[Shepard Tone Synthesizer]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Shepard Tone Synthesizer's record of what its steward's cycles taught it: a line for every cycle, and a numbered item when a cycle taught something the next one should carry."
ledger: tuning
standards:
  for: "what each steward cycle taught Shepard Tone Synthesizer about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer"
  merge: union
  kept: git
  trim: never
---

# Shepard Tone Synthesizer — tuning

What Shepard Tone Synthesizer's steward cycles taught the page. The orchestrator grew this ledger on 2026-10-18, when a cycle first offered a lesson, and writes every line in it. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 10 — 2026-10-18

1. Measure fusion while the stack is moving, not only when it arrives: a lag on a continuous climb is permanent, so per-voice timing differences turn into a fixed mistuning of rate × Δτ, not just a smear between notes. *(offered by the steward, cycle 10)*
- run · 2026-10-18 · cycle 10 · taught item 1

## From cycle 11 — 2026-10-18

2. Every equivalence proven with sine voices needs checking again once voices carry overtones: a filter on the sum and a window on each voice were the same for sines and very different for sawtooths. *(offered by the steward, cycle 11)*
- run · 2026-10-18 · cycle 11 · taught item 2

## From cycle 12 — 2026-11-03

3. Stage 4's 'track the note' failure has to take the cutoff from the played note folded into one octave, one value for every voice. Computing it from each voice's own wrapped octave gives back exactly the voice's pitch and breaks nothing. *(offered by the steward, cycle 12)*
4. **Proposed for canon** · 2026-11-03 · [[Shepard Tone Synthesizer]] · § The Synthesizer Architecture, a new last paragraph after the Global Shepard Filter measurement note · canon change owed *(proposed by the steward, cycle 12)*
   Why: The page's forward vector asks to become a staged teaching instrument, and now there is one to play. The architecture section should say where it lives and what it holds.
   Path: `Projects/Shepard Tone Synthesizer.md`
   > **The plugin (2026-11-03).** All four stages now play in Live as one instrument, Shepard Tone (VST3 and AU, built with [[VST Template]], in the bundle's `plugin/`). It runs one glide on pitch before the stack, ten voices from C0 to C10, the window on each voice, and each voice's filter following that voice. A Climb knob turns it into the endless glissando. Two switches break it on purpose, the way Stages 3 and 4 found it breaks: Drift gives each octave its own glide time, and Track the note takes the cutoff from the played note. Its screen draws Shepard's helix as a staircase and tilts between the side view, which is finite and shows the wrap, and the view from above, which is Escher's endless circle and the one the ear hears.

- run · 2026-11-03 · cycle 12 · taught item 3, proposed item 4 for canon
