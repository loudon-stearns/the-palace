---
title: "Neural Granular Synthesis — tuning"
born: 2026-10-18
links:
  - target: "[[Neural Granular Synthesis]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Neural Granular Synthesis's record of what its steward's cycles taught it: a line for every cycle, and a numbered item when a cycle taught something the next one should carry."
ledger: tuning
standards:
  for: "what each steward cycle taught Neural Granular Synthesis about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer"
  merge: union
  kept: git
  trim: never
---

# Neural Granular Synthesis — tuning

What Neural Granular Synthesis's steward cycles taught the page. The orchestrator grew this ledger on 2026-10-18, when a cycle first offered a lesson, and writes every line in it. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 15 — 2026-10-18

1. Wrapping noise back into range keeps a crowd's overall spread fixed while changing only how evenly it's covered. That's how to separate 'where the lock is' from 'how hard it hits' in this engine. *(offered by the steward, cycle 15)*
- run · 2026-10-18 · cycle 15 · taught item 1

## From cycle 16 — 2026-10-18

2. The crowd's synchrony moves no faster than a few hertz below the lock, so a 10 ms snapshot meter is safe; jitter in its trace is the crowd surging, not the meter aliasing. *(offered by the steward, cycle 16)*
- run · 2026-10-18 · cycle 16 · taught item 2

## From cycle 17 — 2026-11-07

3. Streaming two histograms of where the followers and the pacemakers sit around the crowd's mean phase is enough for the screen to draw every neuron, so a plugin's picture of a population needs no per-neuron state on the probe feed. *(offered by the steward, cycle 17)*
4. **Proposed for canon** · 2026-11-07 · [[Neural Granular Synthesis]] · § Staged Development, after the Phase 3 paragraph · canon change owed *(proposed by the steward, cycle 17)*
   Why: The entry still describes the population stage as a future Faust build; it now exists as a plugin, in a different tool.
   Path: `Projects/Neural Granular Synthesis.md`
   > **Where it stands (November 2026)**: Phase 3 is playable as **Neural Granular**, a VST3/AU instrument made from [[VST Template]] (`plugin/` in this bundle). A crowd of 32 to 256 phase neurons with Kuramoto coupling, played by MIDI. Tightness and Life are the two big knobs, and its screen draws the raster plot as a tunnel the crowd falls down. Its engine matches the numpy sketch sample for sample, and it costs under 4 % of one core at 256 neurons. It was built in C++ through the template, not in Faust.

- run · 2026-11-07 · cycle 17 · taught item 3, proposed item 4 for canon
