---
title: "Generative Audio Devices — tuning"
born: 2026-10-24
links:
  - target: "[[Generative Audio Devices]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Generative Audio Devices's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Generative Audio Devices about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Generative Audio Devices — tuning

What Generative Audio Devices's steward cycles taught the page, and the changes to the house its steward proposed. The Concierge opened this ledger on 2026-10-24, at the revival and on Loudon's word, to leave the steward its first one-shot order; the orchestrator writes every line after it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

- from Loudon · 2026-10-24 · "Yes, land the revival as drafted, with the small Plan edit.": propose a plan for Generative Audio Devices as a plan_revision ask for his yes, where the work is going and the moves ahead each named by what it does, opening with what he asked when he played the house bass in Rack (the computer keyboard and the MacBook speakers as every patch's defaults, and each modulator on the row under the module it modulates; the Standing Orders), since the revival lands without an agreed plan and Revival Ceremony v2.1 step 5 says a page that already has a steward lands then plans · paid in cycle 2

## From cycle 1 — 2026-10-26

1. Rack's saved .vcv files are compressed (unpack with `zstd -dc file | tar x` to read patch.json), and anything the emitter writes into a module's settings should be copied from a file Rack itself saved, never from memory of the format. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-10-26 · [[Generative Audio Devices]] · § Where it stands, the second paragraph (beginning 'Next, every emitted patch is quick to hear') · canon change owed *(proposed by the steward, cycle 1)*
   Why: the paragraph describes as missing what this cycle built; the 'Device defaults' bullet under What still does NOT exist should go with it
   Path: `Projects/Generative Audio Devices.md`
   > **Every emitted patch is quick to hear.** It opens on the computer keyboard and the MacBook speakers, and each modulator sits on the row under the module it modulates (the scroll's Standing Orders). The device settings are copied byte for byte from Rack's own re-save of the house bass and live in the vocabulary file (v2.5) as `default_data` on MIDI_CV and AUDIO_8. `verify_standing_orders.js` checks both orders on every PDL the project holds (141/141, 2026-10-26).

- run · 2026-10-26 · cycle 1 · taught item 1, proposed item 2 for canon

## From cycle 2 — 2026-10-26

3. Polyphony looked like a deep gap and turned out to be one number in the keyboard's saved settings, because Rack's modules take their voice count from what comes in. Read the target's source before calling an axis hard. *(offered by the steward, cycle 2)*
4. **Proposed for canon** · 2026-10-26 · [[Generative Audio Devices]] · § What still does NOT exist, the bullet beginning '**Polyphony**' · canon change owed *(proposed by the steward, cycle 2)*
   Why: the bullet calls polyphony unrepresented, and this cycle represented it in all three layers
   Path: `Projects/Generative Audio Devices.md`
   > - **Polyphony beyond the warm pad.** Chords exist as of 2026-10-26: PDL says `# voices: N`, an archetype may carry a default `voices` (warm_pad plays 6), and the vocabulary (v2.6) records that VCV keeps the count in MIDI_CV's `channels` and how every module carries voices, read from Rack's source. `verify_polyphony.js` checks it (20/20). Not yet heard in Rack, and no other archetype has a voice count yet.
5. **Proposed for canon** · 2026-10-26 · `Shop/VCV Patch Generator/VCV Patch Generator — spec — PDL generation prompt.md` · § PDL grammar, after the line '# archetype: name #seed=N' · canon change owed *(proposed by the steward, cycle 2)*
   Why: fresh agents can't ask for chords until the prompt names the token, which is the T6 lesson that 'obey the registry' alone wasn't enough
   Path: `Shop/VCV Patch Generator/VCV Patch Generator — spec — PDL generation prompt.md`
   > # voices: N                               // how many notes play at once (1–16); omit it and the archetype decides, usually one

- run · 2026-10-26 · cycle 2 · taught item 3, proposed items 4, 5 for canon

## From cycle 3 — 2026-11-04

6. The second target showed that knob resolution (regions, archetypes, seeds) lives inside the VCV emitter, so a new target has to borrow resolved numbers from it; the middle language is neutral for cables but not yet for knobs. *(offered by the steward, cycle 3)*
7. **Proposed for canon** · 2026-11-04 · [[Generative Audio Devices]] · § What still does NOT exist, the bullet beginning '**T10**' · superseded by item 9 *(proposed by the steward, cycle 3)*
   Why: the bullet says no second target exists, and this cycle built one
   Path: `Projects/Generative Audio Devices.md`
   > - **A plugin.** The second target exists as of 2026-11-04. The native target turns the same PDL into C++ and a Mac app that plays on the QWERTY keyboard and the MacBook speakers (`native/`; 83/83 with every PDL the project holds going through both targets). What's missing is a VST3 that Live can load, and Max, which waits for the patching standards. Knob resolution still lives inside the VCV emitter, and the native target borrows its numbers.

- run · 2026-11-04 · cycle 3 · taught item 6, proposed item 7 for canon

## From cycle 4 — 2026-11-04

8. A refactor proves itself by changing nothing: save every emitted file before you move code, and diff them all after, before you trust any harness. *(offered by the steward, cycle 4)*
9. **Proposed for canon** · 2026-11-04 · [[Generative Audio Devices]] · § What still does NOT exist, the bullet beginning '**T10**' · canon change owed *(proposed by the steward, cycle 4)*
   Why: the earlier words said the native target borrows its numbers from the VCV emitter, and this cycle ended that
   Path: `Projects/Generative Audio Devices.md`
   > - **A plugin.** The second target exists as of 2026-11-04. The native target turns the same PDL into C++ and a Mac app that plays on the QWERTY keyboard and the MacBook speakers (`native/`; 96/96, every PDL the project holds going through both targets, knob for knob). Both targets read their knobs and voice count from one resolver, `resolvePatch`, in PDL's own names. What's missing is a VST3 that Live can load, and Max, which waits for the patching standards. The knob vocabulary itself (names, ranges, regions) is still read from the VCV vocabulary file, because Rack's units are PDL's units today.

- run · 2026-11-04 · cycle 4 · taught item 8, proposed item 9 for canon
