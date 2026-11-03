---
title: "Retrospective Delay — tuning"
born: 2026-11-03
links:
  - target: "[[Retrospective Delay]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Retrospective Delay's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Retrospective Delay about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Retrospective Delay — tuning

What Retrospective Delay's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-03, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 25 — 2026-11-03

1. A VST Template host check moves one knob at a time from the defaults, so an effect whose main knob defaults to silent can't show any other knob working; give it an audible default. *(offered by the steward, cycle 25)*
2. **Proposed for canon** · 2026-11-03 · [[Retrospective Delay]] · § Open Questions, item 4 (Hardware target), after its 'progressed' line · canon change owed *(proposed by the steward, cycle 25)*
   Why: you adopted the hardware answer on 2026-10-18 and the page still lists it as open
   Path: `Projects/Retrospective Delay.md`
   >    — answered (2026-10-18): the portal aims at VST/AU, Max for Live and the browser, with hardware as a stretch goal (`retrospective-delay-steward-055`, adopted). The first of those landed on 2026-11-03 as a VST3 and AU made with [[VST Template]], in `plugin/`.
3. **Proposed for canon** · 2026-11-03 · [[Retrospective Delay]] · § Interface Design Philosophy, a new last paragraph · canon change owed *(proposed by the steward, cycle 25)*
   Why: the page still describes the face only as JSUI frames; the plugin now has a face of its own
   Path: `Projects/Retrospective Delay.md`
   > **The plugin's face is a séance table** (2026-11-03). On the CRT of the [[VST Template]] editor, the measure is the ring round a table and the write head is a candle-lit planchette, orange while the tape records and blue while it holds. What you play stands on the ring as columns of light, and Summon lifts a ghost ring above the table, with ectoplasm rising to it from the read head. The Gorey cat sits at the table's edge and wakes as Summon rises. Drag on the screen to summon.

- run · 2026-11-03 · cycle 25 · taught item 1, proposed items 2, 3 for canon

## From cycle 26 — 2026-11-03

4. When a knob is added up over time, as Speed is into where the read head sits, VST Template's quarter-second loudness test can't hold while the knob moves; check the plugin against the sketch at every sample, and check the two agree once the knob settles. *(offered by the steward, cycle 26)*
5. **Proposed for canon** · 2026-11-03 · `Projects/VST Template/machinery/src/PluginProcessor.cpp` · processBlock, before the sample loop · canon change owed *(proposed by the steward, cycle 26)*
   Why: my next move, syncing the plugin to Live's tempo and bar, can't be built from my own folder: the template code that every plugin is built on doesn't pass the plugin the tempo or bar position yet
   Path: `Projects/VST Template/machinery/src/PluginProcessor.cpp`
   > Read the host's play head once per block (getPlayHead()->getPosition()) and pass its tempo, its position in quarter notes at the block's first sample, its time signature and whether it is playing to an optional Algorithm::transport(bpm, ppq, num, den, playing) hook, called only when Algorithm.h declares one, so plugins that don't need it stay unchanged. Retrospective Delay would set its measure to Live's bar and put its write head at the bar's downbeat.

- run · 2026-11-03 · cycle 26 · taught item 4, proposed item 5 for canon
