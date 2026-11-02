---
title: "Murmuration — tuning"
born: 2026-11-01
links:
  - target: "[[Murmuration]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Murmuration's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Murmuration about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Murmuration — tuning

What Murmuration's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-01, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 4 — 2026-11-01

1. A blind test that copies the flock's statistics frame by frame tests only coordination, and coordination alone wasn't audible; what the flock gives lies upstream, in the statistics it produces and how they answer a perturbation, so the wager has to be tested by playing. *(offered by the steward, cycle 4)*
2. **Proposed for canon** · 2026-11-01 · [[Murmuration]] · § Forward Vectors, replacing the line '— progressed: the blind pair is rendered …' · canon change owed *(proposed by the steward, cycle 4)*
   Why: The verdict is in, and the page still says it's waiting.
   Path: `Projects/Murmuration.md`
   > — answered (2026-11-02): Loudon couldn't tell the blind pair apart. The key: X was the flock, Y the hand-jittered cloud that copied the flock's centre, spread, speed and heading agreement frame by frame. Coordination alone isn't audible at this mapping. What the flock gives lies upstream, as a source of those statistics and in how they answer a perturbation, so the sharper test is played: the flock against a cloud dialed by hand, under the same strike.
3. **Proposed for canon** · 2026-11-01 · [[Murmuration]] · § Open Decisions, under 'Voice ceiling' · superseded by item 6 *(proposed by the steward, cycle 4)*
   Why: The first half of the question is answered with numbers.
   Path: `Projects/Murmuration.md`
   > — measured headlessly 2026-11-02 (`engine/ceiling.json`, Node on an M1 Max, one core): grains cost about 0.15% of a core per voice, so about 300 voices before a block risks running late; the flock step takes 4 ms a frame at 480 boids and a whole frame at 960; the pad costs about 1% at any size. Browsers still unmeasured.
4. **Proposed for canon** · 2026-11-01 · [[Murmuration]] · § Status, after the first sentence · canon change owed *(proposed by the steward, cycle 4)*
   Why: Loudon asked for compelling 3D visuals at every stage, and the page doesn't yet name the view that answers that.
   Path: `Projects/Murmuration.md`
   > `murmuration-3d.html` is the same engine seen in 3D: the wavetable as a landscape, each bird's altitude its grain length, so the flock lifts off as one sheet when it orders and sinks when it melts.

- run · 2026-11-01 · cycle 4 · taught item 1, proposed items 2, 3, 4 for canon

## From cycle 5 — 2026-11-01

5. Chrome's AudioWorklet has no performance.now, only whole-millisecond Date.now, so timing inside the worklet can trust only the average over many blocks. Judge a browser's ceiling by that average, Chrome's own dropout count, and the ear, never by the slowest single block. *(offered by the steward, cycle 5)*
6. **Proposed for canon** · 2026-11-01 · [[Murmuration]] · § Open Decisions, under 'Voice ceiling' · canon change owed *(proposed by the steward, cycle 5)*
   Why: The browser half now has a test page and Chrome's first numbers, so the earlier words are out of date.
   Path: `Projects/Murmuration.md`
   > — measured 2026-11-02. Outside the browser (`engine/ceiling.json`, Node on an M1 Max, one core), grains cost about 0.15% of a core per voice, so about 300 voices before a block risks running late. The flock takes 4 ms a frame at 480 birds, and the pad costs about 1% at any size. In the browser, `ceiling-test.html` climbs the flock from 60 to 720 birds until it clicks. Headless Chrome stays clean to about 400 birds and drops out at 720. Firefox and Safari have not been run.

- run · 2026-11-01 · cycle 5 · taught item 5, proposed item 6 for canon
