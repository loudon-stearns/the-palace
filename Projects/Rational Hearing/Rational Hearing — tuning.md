---
title: "Rational Hearing — tuning"
born: 2026-10-30
links:
  - target: "[[Rational Hearing]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Rational Hearing's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Rational Hearing about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Rational Hearing — tuning

What Rational Hearing's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-30, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-10-30

1. Browser zoom does not enlarge an SVG that is sized to fit its column: the layout reflows and the drawing shrinks to match, so projector legibility for the ladder has to be designed into the page. Measure it with getScreenCTM × font-size, not with zoom. *(offered by the steward, cycle 1)*
- run · 2026-10-30 · cycle 1 · taught item 1

## From cycle 2 — 2026-10-30

2. The ladder's chips and bracket offsets are computed in JavaScript when it is built, so a projector size has to rebuild the ladder when Projector mode toggles. CSS font-size alone overflows the chips. *(offered by the steward, cycle 2)*
- run · 2026-10-30 · cycle 2 · taught item 2

## From cycle 3 — 2026-11-15

3. Sound sent through a video call passes the call's codec and noise suppression, so an online teaching page should send its state, not its audio: a link that rebuilds the moment on each student's machine, with one tap to start the sound. *(offered by the steward, cycle 3)*
4. **Proposed for canon** · 2026-11-15 · [[Rational Hearing]] · frontmatter forward_vector · canon change owed *(proposed by the steward, cycle 3)*
   Why: Loudon, 2026-11-10: 'adjust the forward vector, don't plan for this to be in a classroom, instead focus on online teaching, this is a web interaction I use in online classes.'
   Path: `Projects/Rational Hearing.md`
   > forward_vector: "I am page one of an online lesson, the web interaction Loudon shares on screen while he talks in an online class, and I want to be played, not read: tap a partial and hear it, tap an edge of my ladder and hear the ratio the handout only drew, and send that same sound to every student's own speakers with one link. I want to read clearly in a shared screen and arrive true on the far side of a call, and I want my later pages, the seventh harmonic, the tritone's several faces, the cents lecture, to grow from me only once Loudon has taught from me online and said what landed."
5. **Proposed for canon** · 2026-11-15 · [[Rational Hearing]] · opening paragraph, the sentences beginning 'It is a lecture backdrop' · canon change owed *(proposed by the steward, cycle 3)*
   Why: The page's own description still says projector and printed copies. Loudon corrected that, and the student link is how the page now reaches its students.
   Path: `Projects/Rational Hearing.md`
   > It is a web interaction Loudon teaches from in online classes: he shares it on screen and talks, and a **Link for students** button sends any moment, an interval on the ladder or a just-against-equal comparison, to the class chat, so each student hears it on their own speakers rather than through the call. It gives him anchors to point at and sound, not paragraphs to read. A print face with a note margin is kept for students who want paper.

- run · 2026-11-15 · cycle 3 · taught item 3, proposed items 4, 5 for canon
