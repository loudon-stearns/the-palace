---
title: "Bayesian Granular Synthesizer — tuning"
born: 2026-10-22
links:
  - target: "[[Bayesian Granular Synthesizer]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Bayesian Granular Synthesizer's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Bayesian Granular Synthesizer about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Bayesian Granular Synthesizer — tuning

What Bayesian Granular Synthesizer's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-22, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 4 — 2026-10-22

1. One seeded 32-bit generator shared by the sketch, the C++ and the JavaScript makes even a random grain cloud match sample for sample in all three, so the template's exact gate works on a stochastic instrument. *(offered by the steward, cycle 4)*
2. **Proposed for canon** · 2026-10-22 · [[Bayesian Granular Synthesizer]] · frontmatter forward_vector · canon change owed *(proposed by the steward, cycle 4)*
   Why: Loudon's standing order of 2026-10-21 moves the instrument from an RNBO engine to a VST product; the vector still names RNBO.
   Path: `Projects/Bayesian Granular Synthesizer.md`
   > I want to become Belief Cloud, a VST instrument Loudon plays in Live, where the chord a player holds is a hypothesis the cloud slowly comes to believe — MIDI as Bayesian evidence sculpting a pitch posterior in real time, the prior a belief the player paints, and a helix on its screen where you watch the fog condense into the chord. I want to take a stage at Loudon Live.
3. **Proposed for canon** · 2026-10-22 · [[Bayesian Granular Synthesizer]] · § Artifact (replacing its paragraph) · canon change owed *(proposed by the steward, cycle 4)*
   Why: The section still says the code is waiting to be pulled from a chat; the instrument now exists in three checked forms.
   Path: `Projects/Bayesian Granular Synthesizer.md`
   > The V8 code from the 2026-05-08 chat was never recovered. The cloud was rebuilt from this spec in October 2026 (bundle: bayes_engine.js, belief-instrument.html). On Loudon's order of 2026-10-21 it is becoming a VST, Belief Cloud: its sketch, C++ port and screen visualizer, the belief helix, live in the bundle's plugin/ folder and match one another sample for sample. They are waiting for VST Template to build plugins inside a steward's bundle.

- run · 2026-10-22 · cycle 4 · taught item 1, proposed items 2, 3 for canon

## From cycle 5 — 2026-10-22

4. The template's editor page can be built from a steward's bundle by calling ui.py's page() with the parameter table from the JUCE-free stand-in, so the whole face can be seen, fit-tested and played before the template can build plugins here. *(offered by the steward, cycle 5)*
5. **Proposed for canon** · 2026-10-22 · `_ops/drafting-table/design-system/dt-controls.js` · knob() and fader(), the line that sets each control's first value (two places, both currently `apply(toNorm(o.value == null ? spec.def : (o.binding ? o.binding.get() : o.value), spec), false);`) · canon change owed *(proposed by the steward, cycle 5; urgent, asked as bgs-steward-013-urgent-1)*
   Why: When the editor builds a bound knob or fader without o.value, it shows the default instead of the parameter's value. The file's own comment says it reads get(). In Live, every saved project's editor would open showing default knob positions. Proven by Belief Cloud's face, where the patched copy follows the painted prior and the original does not.
   Path: `_ops/drafting-table/design-system/dt-controls.js`
   > apply(toNorm(o.binding ? o.binding.get() : (o.value == null ? spec.def : o.value), spec), false);

- run · 2026-10-22 · cycle 5 · taught item 4, proposed item 5 for canon
