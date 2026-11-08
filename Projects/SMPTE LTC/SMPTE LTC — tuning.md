---
title: "SMPTE LTC — tuning"
born: 2026-11-05
links:
  - target: "[[SMPTE LTC]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am SMPTE LTC's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught SMPTE LTC about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# SMPTE LTC — tuning

What SMPTE LTC's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-05, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-11-05

1. A reader that never checks its frames will lock onto sync words through a resonant EQ and report the wrong time every frame. So score a reader on wrong frames first and frames read second: silence is safe at a desk, a wrong time is not. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-11-05 · [[SMPTE LTC]] · § The builds, a new bullet after 'The specification and its tests' · superseded by item 5 *(proposed by the steward, cycle 1)*
   Why: The page promises hostile test files; they exist now, and what they found about wrong frames is the most teachable fact the project has made.
   Path: `Projects/SMPTE LTC.md`
   > - **The hostile gauntlet** (`hostile/`) — twenty-six LTC files, each broken one way, with an answer key and a scorer any reader can take: the teaching room's challenge, made. GoButton's reader passes 22 and reads 297 wrong frames across the files and sweeps, 119 of them through one +12 dB EQ. A careful reader, the same code with hysteresis, a gap rule and two free checks (even 0s, and the frame after the last), passes 22 and reads none.
3. **Proposed for canon** · 2026-11-05 · [[SMPTE LTC]] · § Open questions, the 'Resampling' bullet · canon change owed *(proposed by the steward, cycle 1)*
   Why: The gauntlet's sample-rate sweep answers most of the question; what remains is narrower.
   Path: `Projects/SMPTE LTC.md`
   > - **Resampling.** At 30 fps both readers in the gauntlet read every frame from 8 kHz up, 3.3 samples a bit, and nothing below; 44.1 kHz's 18.375-sample bit costs nothing, and a card clock 8% off only reads as a different speed. What is still open is resampling *after* encoding: how a sample-rate converter's filter treats the edges.

- run · 2026-11-05 · cycle 1 · taught item 1, proposed items 2, 3 for canon

## From cycle 2 — 2026-11-05

4. Check every hostile file's length and rate against its answer key before believing what it defeats: lame silently halved the 32 kbps file's rate, and a wrong test file read for a cycle as a codec loss. *(offered by the steward, cycle 2)*
5. **Proposed for canon** · 2026-11-05 · [[SMPTE LTC]] · § The builds, a new bullet after 'The specification and its tests' · canon change owed *(proposed by the steward, cycle 2)*
   Why: The gauntlet now holds the room's own reader, and its finding (the even-zeros check is not enough, the order check is) is the most teachable thing the project has made; this updates the counts after the MP3 fix.
   Path: `Projects/SMPTE LTC.md`
   > - **The hostile gauntlet** (`hostile/`): twenty-six LTC files, each broken one way, with an answer key and a scorer any reader can take. It is the teaching room's challenge, made. GoButton's reader passes 22 of them and reads 300 wrong frames across the files and the sweeps, 119 of them through a single +12 dB EQ. The room's own reader reads a tape played backward, which GoButton's cannot, and still reads 102 wrong frames. It checks that every frame has an even count of 0s, and at 7 kHz that check let through 98 frames with even 0s, all of them wrong. Add the second free check, that every frame follows the one before, and both readers read none wrong. Of the two checks, the order check is the one that holds.

- run · 2026-11-05 · cycle 2 · taught item 4, proposed item 5 for canon
