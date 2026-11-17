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
3. **Proposed for canon** · 2026-11-05 · [[SMPTE LTC]] · § Open questions, the 'Resampling' bullet · paid in 11d48abd on 2026-11-08 09:49, on Loudon's "yes to all four", refitted to four readers *(proposed by the steward, cycle 1)*
   Why: The gauntlet's sample-rate sweep answers most of the question; what remains is narrower.
   Path: `Projects/SMPTE LTC.md`
   > - **Resampling.** At 30 fps both readers in the gauntlet read every frame from 8 kHz up, 3.3 samples a bit, and nothing below; 44.1 kHz's 18.375-sample bit costs nothing, and a card clock 8% off only reads as a different speed. What is still open is resampling *after* encoding: how a sample-rate converter's filter treats the edges.

- run · 2026-11-05 · cycle 1 · taught item 1, proposed items 2, 3 for canon

## From cycle 2 — 2026-11-05

4. Check every hostile file's length and rate against its answer key before believing what it defeats: lame silently halved the 32 kbps file's rate, and a wrong test file read for a cycle as a codec loss. *(offered by the steward, cycle 2)*
5. **Proposed for canon** · 2026-11-05 · [[SMPTE LTC]] · § The builds, a new bullet after 'The specification and its tests' · paid in 11d48abd on 2026-11-08 09:49, on Loudon's "yes to all four", the careful reader's three changes named *(proposed by the steward, cycle 2)*
   Why: The gauntlet now holds the room's own reader, and its finding (the even-zeros check is not enough, the order check is) is the most teachable thing the project has made; this updates the counts after the MP3 fix.
   Path: `Projects/SMPTE LTC.md`
   > - **The hostile gauntlet** (`hostile/`): twenty-six LTC files, each broken one way, with an answer key and a scorer any reader can take. It is the teaching room's challenge, made. GoButton's reader passes 22 of them and reads 300 wrong frames across the files and the sweeps, 119 of them through a single +12 dB EQ. The room's own reader reads a tape played backward, which GoButton's cannot, and still reads 102 wrong frames. It checks that every frame has an even count of 0s, and at 7 kHz that check let through 98 frames with even 0s, all of them wrong. Add the second free check, that every frame follows the one before, and both readers read none wrong. Of the two checks, the order check is the one that holds.

- run · 2026-11-05 · cycle 2 · taught item 4, proposed item 5 for canon

## From cycle 3 — 2026-11-17

6. Two free checks are not proof: of 119 frames misread through a boosted EQ, 4 had even 0s and followed the frame before by chance. So a reader should report how many checked frames have come in a row, and the device should decide how many it needs. *(offered by the steward, cycle 3)*
- run · 2026-11-17 · cycle 3 · taught item 6

## From cycle 4 — 2026-11-17

7. A run of 0s is a square wave at the 1s' half speed, so a reader learning the bit must wait until it has heard both short and long pulses, which the sync word guarantees every frame, or it locks at double the bit and never notices. *(offered by the steward, cycle 4)*
8. **Proposed for canon** · 2026-11-17 · [[SMPTE LTC]] · § The builds, the hostile gauntlet bullet, appended after its last sentence · canon change owed *(proposed by the steward, cycle 4)*
   Why: The stopwatch-versus-clock contrast is the deepest reading lesson the project has found, and the page's gauntlet bullet stops at four readers.
   Path: `Projects/SMPTE LTC.md`
   > A fifth reader times no crossing at all: the matched reader keeps a clock that ticks every half bit and adds up the signal over each one, the filter matched to the bit. It reads the file buried 6 dB under noise, which no other reader does, still reads more than half its frames at 1 dB, and reads no wrong frame anywhere. The resonant EQ still beats every reader.

- run · 2026-11-17 · cycle 4 · taught item 7, proposed item 8 for canon

## From cycle 5 — 2026-11-17

9. Timed the way a show uses them, the readers differ by one frame and the desks by ten, so teaching how LTC is used starts at the desk's settings (trust, running on alone, the late frame), not at the reader. *(offered by the steward, cycle 5)*
10. **Proposed for canon** · 2026-11-17 · [[SMPTE LTC]] · a new section, ## In a show, after § Every form · canon change owed *(proposed by the steward, cycle 5)*
    Why: The standing order asks the page to show LTC used, and the page has no section on what happens downstream of the cable; this one starts from Loudon's own rig and carries only what the chase room measured.
    Path: `Projects/SMPTE LTC.md`
    > ## In a show
    >
    > In Loudon's rig the clock comes from GoButton's TIMECODE track: a clip named with a time sends that time, and a clip named Pre-Roll right before it counts up into it. Every desk downstream asks three things of the signal, and its answers, not the reader, decide whether a cue lands. **How many good frames before it trusts the clock.** Every reader names nothing for two or three frames after the signal starts, and the desk waits for its own run on top, so a cue on a song's first frame with no Pre-Roll is late on every desk. **How long it runs on alone** when the clock goes quiet. Freewheel rides a dropout, and the same freewheel carries a desk through a real stop and fires a cue into a silent room. **Whether it adds the frame every reader is late.** Without it every cue is a frame late. A cut from one song's time straight into the next costs every desk its trust again. Timed through the hostile files, the readers differ by a frame; the desks' settings differ by ten.

- run · 2026-11-17 · cycle 5 · taught item 9, proposed item 10 for canon
