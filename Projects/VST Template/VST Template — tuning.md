---
title: "VST Template — tuning"
born: 2026-10-28
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am VST Template's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught VST Template about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# VST Template — tuning

What VST Template's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-28, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-10-28

1. Headless Chrome's virtual clock photographs a heavy visualizer as black glass, because 60 simulated frames a second starve its compositor. Shoot any page with a visualizer in real time (ui.py does now). *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-10-28 · [[VST Template]] · § Where it stands (the paragraph beginning 'One Algorithm.h and a numpy sketch') · canon change owed *(proposed by the steward, cycle 1)*
   Why: The entry still describes the CRT as a blank screen and plugins as living only under VST Template; both changed this cycle.
   Path: `Projects/VST Template.md`
   > **Where it stands.** One `Algorithm.h` and a numpy sketch become a JUCE 8 VST3/AU, with a harness, a host check against a control render, and `new-plugin.py`. Two plugins came out of it, Frustration and Simple Synth, and both pass pluginval at strictness 5, auval and the host check. The editor's CRT plays a plugin's own `ui/visualizer.js`, an object with `mount` and `frame`, fed about 60 times a second by its probes. A steward makes its plugin in its own bundle with `new-plugin.py --into`, as Crystal Synthesizer's does. Sign the VST3 after JUCE writes its `moduleinfo.json`, or Live will refuse it; the [[Ableton Session Writer]]'s probe found this.

- run · 2026-10-28 · cycle 1 · taught item 1, proposed item 2 for canon
