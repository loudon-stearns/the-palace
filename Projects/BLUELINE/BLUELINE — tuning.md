---
title: "BLUELINE — tuning"
born: 2026-11-05
links:
  - target: "[[BLUELINE]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am BLUELINE's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught BLUELINE about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# BLUELINE — tuning

What BLUELINE's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-05, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-11-05

1. Live 11 and 12 keep the clock in the same lanes but in differently shaped elements (MasterTrack vs a MainTrack with attributes; a NextLocatorMapping after the locators), so a Set reader should match on the lane, not the exact element shape, and be tried on Sets from both versions. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-11-05 · `Projects/BLUELINE/BLUELINE — Board Record Schema.md` · the `# === BIBLE ===` block (TEMPO / FPS / FRAMES_PER_BEAT) and the determinism rule under it, plus the BAR / BEAT / FRAME / SECTION comments in the BOARD extensions · canon change owed *(proposed by the steward, cycle 1)*
   Why: the schema still says 'choose FPS and TEMPO so frames per beat is a whole number', which the 2026-11-03/04 standing orders (any tempo, tempo changes included) retired; the reader now exists to back the new rule
   Path: `Projects/BLUELINE/BLUELINE — Board Record Schema.md`
   > Replace them with the text in Projects/BLUELINE/tempo-map/clock-section-draft.md. The BIBLE carries `CLOCK: song.als` (the Set is the clock: its tempo lane, meter lane and locators, tempo and meter changes included) and `FPS`, any rate. The sync rule: a board's BAR and BEAT on the Set's ruler become song beats through every meter change, then absolute seconds by summing the tempo segments before them (each ramp worked out exactly), then a frame by rounding that time once: FRAME = round(seconds × FPS), never added up beat by beat, so nothing drifts. A beat lands on the nearest frame, never more than half a frame from the music. FRAME and a blank SECTION are filled in by the Clock (tempo-map/tempo_map.py --record), never by hand.

- run · 2026-11-05 · cycle 1 · taught item 1, proposed item 2 for canon

## From cycle 2 — 2026-11-05

3. A board record's FRAME is the frame of absolute song time, but a cut that starts at an in-point has to round again from that in-point, because the in-point usually falls between frames and the audio is laid from it. Keep the record absolute and let the cutter re-round, never subtract the two rounded frames. *(offered by the steward, cycle 2)*
- run · 2026-11-05 · cycle 2 · taught item 3
