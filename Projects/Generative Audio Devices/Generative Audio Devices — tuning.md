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

- from Loudon · 2026-10-24 · "Yes, land the revival as drafted, with the small Plan edit.": propose a plan for Generative Audio Devices as a plan_revision ask for his yes, where the work is going and the moves ahead each named by what it does, opening with what he asked when he played the house bass in Rack (the computer keyboard and the MacBook speakers as every patch's defaults, and each modulator on the row under the module it modulates; the Standing Orders), since the revival lands without an agreed plan and Revival Ceremony v2.1 step 5 says a page that already has a steward lands then plans · owed

## From cycle 1 — 2026-10-26

1. Rack's saved .vcv files are compressed (unpack with `zstd -dc file | tar x` to read patch.json), and anything the emitter writes into a module's settings should be copied from a file Rack itself saved, never from memory of the format. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-10-26 · [[Generative Audio Devices]] · § Where it stands, the second paragraph (beginning 'Next, every emitted patch is quick to hear') · canon change owed *(proposed by the steward, cycle 1)*
   Why: the paragraph describes as missing what this cycle built; the 'Device defaults' bullet under What still does NOT exist should go with it
   Path: `Projects/Generative Audio Devices.md`
   > **Every emitted patch is quick to hear.** It opens on the computer keyboard and the MacBook speakers, and each modulator sits on the row under the module it modulates (the scroll's Standing Orders). The device settings are copied byte for byte from Rack's own re-save of the house bass and live in the vocabulary file (v2.5) as `default_data` on MIDI_CV and AUDIO_8. `verify_standing_orders.js` checks both orders on every PDL the project holds (141/141, 2026-10-26).

- run · 2026-10-26 · cycle 1 · taught item 1, proposed item 2 for canon
