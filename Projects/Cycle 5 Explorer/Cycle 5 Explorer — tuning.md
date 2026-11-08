---
title: "Cycle 5 Explorer — tuning"
born: 2026-10-30
links:
  - target: "[[Cycle 5 Explorer]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Cycle 5 Explorer's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Cycle 5 Explorer about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Cycle 5 Explorer — tuning

What Cycle 5 Explorer's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-30, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-10-30

1. The page's sound can be checked without speakers. Swap window.AudioContext for an OfflineAudioContext in a Playwright init script, then call the page's own playScale and playChord. A legato scale needs a 'which note grew across this onset' test, because the last note is still ringing. *(offered by the steward, cycle 1)*
- run · 2026-10-30 · cycle 1 · taught item 1

## From cycle 2 — 2026-10-30

2. A teaching sheet can be rehearsed on the page by pressing its own keys in Playwright and building the sheet only from what the page showed back. Layout faults that the theory audit can't see, like grids hiding a column at projector widths, show up in the stills. *(offered by the steward, cycle 2)*
- run · 2026-10-30 · cycle 2 · taught item 2

## From cycle 3 — 2026-11-03

3. A grid inside an overflow-x box hides columns silently. Test it by comparing the scroll box's scrollWidth with its clientWidth across a width sweep, not by eye at one width. *(offered by the steward, cycle 3)*
- run · 2026-11-03 · cycle 3 · taught item 3

## From cycle 4 — 2026-11-03

4. CSS zoom doesn't show up in getComputedStyle's font size, so a legibility probe has to multiply by el.currentCSSZoom or it undercounts every zoomed label. *(offered by the steward, cycle 4)*
5. **Proposed for canon** · 2026-11-03 · [[Cycle 5 Explorer]] · § What is on the page, end of the paragraph that begins 'Five **guided moments** for class' · canon change owed *(proposed by the steward, cycle 4)*
   Why: The page now has a mode a teacher needs to know about, and the measurement says honestly what it does and doesn't fix.
   Path: `Projects/Cycle 5 Explorer.md`
   > A **room view** for the projector (press R, or open with `?room`): the wheel sized to the screen's height and whole beside the inspector on one screen, with the type around it one and a half to two times larger. It was measured from the back row on 2026-11-04, where the wheel, the tonic and mode and the chord symbol read and the grids read only from the middle of the room.

- run · 2026-11-03 · cycle 4 · taught item 4, proposed item 5 for canon

## From cycle 5 — 2026-11-03

6. Upright labels on a ring need depth of half the width times |sin θ| plus half the height times |cos θ|, so at 3 and 9 o'clock a stack along the radius runs out of room. Stacking a slot's labels as one block, which turns sideways there, fits them without shrinking the wheel. *(offered by the steward, cycle 5)*
- run · 2026-11-03 · cycle 5 · taught item 6
