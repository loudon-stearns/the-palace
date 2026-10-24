---
title: "Blood Compressor — tuning"
born: 2026-10-24
links:
  - target: "[[Blood Compressor]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Blood Compressor's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Blood Compressor about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Blood Compressor — tuning

What Blood Compressor's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-24, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 10 — 2026-10-24

1. Measure the crest factor before trusting a compressor's attack story. A fixed control-path delay (here the 5 ms nerve) lets every transient through, so heavy compression can raise peak-to-average instead of lowering it. *(offered by the steward, cycle 10)*
2. **Proposed for canon** · 2026-10-24 · [[Blood Compressor]] · § Pedagogical Framing, the paragraph beginning 'When students set attack=0' · canon change owed *(proposed by the steward, cycle 10)*
   Why: The paragraph promises a lunge at attack zero that the design rules out. The October port measured what the fixed nerve delay really does.
   Path: `Projects/Blood Compressor.md`
   > Attack can't go to zero here: the body always has 5 ms of nerve conduction before the vessel can respond. So the front of every hit gets through before the reflex closes. On a drum loop, heavy compression *raises* the peak-to-average ratio (14.7 dB in bypass to 26.3 dB at the fastest attack, October 2026). This is a compressor that keeps the punch, and that is the lesson. At 5 ms the vessel clamps the body of the hit as soon as it can, and the beat goes flat behind its transients. At 200 ms the body notices before it acts, and the hit's weight gets through too. What students feel is not a compressor lunging but a body that cannot see the future.
3. **Proposed for canon** · 2026-10-24 · [[Blood Compressor]] · § What This Entry Is and Isn't, the 'Isn't' line · canon change owed *(proposed by the steward, cycle 10)*
   Why: The line still says Stage 1 → a Max prototype is next. The product path is now the VST, by Loudon's standing order of 2026-10-21.
   Path: `Projects/Blood Compressor.md`
   > **Isn't**: a finished plugin yet. The compressor lives in the browser vessel (stage2-vessel-prototype-v3.html), an RNBO codebox and two Max for Live devices (set aside as teaching tools). Since October 2026 it has also been in VST Template's shape in `plugin/`, checked sample for sample against its sketch, with a face whose centre screen shows the artery from inside. It becomes a VST3/AU when the template can build from a project's own folder.

- run · 2026-10-24 · cycle 10 · taught item 1, proposed items 2, 3 for canon

## From cycle 11 — 2026-10-24

4. A body control that only moves the detector is inaudible on music; move the set point the ear hears (threshold) and keep the detector change as texture. *(offered by the steward, cycle 11)*
5. **Proposed for canon** · 2026-10-24 · [[Blood Compressor]] · § DSP Architecture, the three bullets under 'The biological framing also suggests features' (Sympathetic activation knob, Heart rate variability, Vessel age) · canon change owed *(proposed by the steward, cycle 11)*
   Why: The bullet says sympathetic activation 'raises threshold' and 'compresses more aggressively', which contradict each other. The October plugin built all three, so the words should describe what was built and measured.
   Path: `Projects/Blood Compressor.md`
   > - **Sympathetic activation knob**: a stressed body. The systolic line drops (up to 12 dB), the reflex quickens (up to twice as fast, never under the 5 ms nerve floor) and the muscle lets go sooner (up to four times as fast). The vessel holds the beat harder and pumps with it.
   > - **Heart rate variability**: the set point breathes. A 0.25 Hz breath and the slower 0.1 Hz Mayer wave move the threshold up to ±3 dB and the detector time up to ±20 %, so the squeeze swells and ebbs across the bars.
   > - **Vessel age**: a stiffer wall. The ratio rises (up to double) and the knee loses most of its give (up to 80 %). Older walls give less and cinch harder.

- run · 2026-10-24 · cycle 11 · taught item 4, proposed item 5 for canon
