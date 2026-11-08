---
title: "Splice Instrument Forge — tuning"
born: 2026-10-26
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Splice Instrument Forge's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Splice Instrument Forge about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Splice Instrument Forge — tuning

What Splice Instrument Forge's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-26, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-10-26

1. The forge's WAVs live only on this Mac and can vanish. A recipe that keeps no Splice asset id can't be rebuilt, so every manifest and recipe now carries the id beside the file. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-10-26 · [[Splice Instrument Forge]] · § What it stands on, the bullet 'Live ships a shell for every target.' · canon change owed *(proposed by the steward, cycle 1)*
   Why: the entry should name where the forge's parts come from now; copying from saved Sets is what let three bugs and a hidden fade-out into every Set
   Path: `Projects/Splice Instrument Forge.md`
   > **Live ships a shell for every target.** Sampler, Simpler and Drum Sampler defaults, and factory Drum Racks, all as gzipped XML in the Core Library. It also ships a default audio and MIDI track, a sample library and a beat template, all written by Ableton's own build. The forge takes its tracks, clips and drum pads from these (`workshop/move-7-shells/`), never from a Set someone saved, and `audit.mjs` shows, value by value, where any part differs from Ableton's.

- run · 2026-10-26 · cycle 1 · taught item 1, proposed item 2 for canon

## From cycle 2 — 2026-10-26

3. Samples fetched inside a temporary working copy vanish when it is removed, because they're kept out of git; fetch and build in the main copy's bundle, and every Set will keep its samples. *(offered by the steward, cycle 2)*
- run · 2026-10-26 · cycle 2 · taught item 3

## From Loudon's word — 2026-10-29

4. **A presigned URL is a key.** A Splice download link carries the account's AWS access-key id in its query string (everything from `?X-Amz-` on), and whatever goes into a file in the bundle is committed and, at the next push, public. Twice a manifest kept those links: the three `ask-melodic-techno/manifest*.json` commits of 2026-10-24, and `move-2-sampler/manifest.json` and `move-7-shells/proof/lofi-kit/manifest.json` in cycles 1 and 2 of 2026-10-26. Each time the Sentry refused the push, and each time main had to be rewritten to take them out (2026-10-25, then 2026-10-29). So never write a presigned URL, or anything with an `X-Amz-` query string, into a file in the bundle. Record the sample's `uuid` and `file`, or the bare object URL with everything from `?` cut off. When `forge.mjs fetch` needs the live links, put that list outside the bundle, in `_ops/scratch/` (which git ignores), with `into` set to the bundle's samples folder as an absolute path. The links expire in about two minutes, so keeping them saves nothing. *(from Loudon, 2026-10-29: "use the same fix as before and place a note in the appropriate tuning ledger that will avoid this issue in the future.")*
