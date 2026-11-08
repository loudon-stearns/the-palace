---
title: "Inharmonic Wavetable Synthesis — Context"
born: 2026-11-08
links:
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Inharmonic Wavetable Synthesis is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Inharmonic Wavetable Synthesis — Context

This is the memory behind [[Inharmonic Wavetable Synthesis]]: where its made things went, which of its own claims the making has since measured and found off, and why a design document from one April session still stands as the entry. Read it before editing the page or planning the next build. The page is the considered truth, the [[Inharmonic Wavetable Synthesis — scroll|scroll]] is the live one, and this file holds the reasons that sit between them.

## What the page leaves out

**Everything that has been made.** The page describes an instrument; it does not record one. Six months of building live on the scroll and in the bundle, and the page points at them only where a finding changed what the instrument is.

- The Faust prototype in `faust-prototype/`, on Loudon's grant at the second steward cycle (2026-05-27, "Lets dig into faust!"), and the May bending proofs in `proofs/`. These are the page's Forward Path step 1, done. The page still lists it as a next step.
- The dual-wavetable study (cycle 7, 2026-10-14). It was the first build where Wavetable A came from a real table's FFT, an AKWF organ chain, which § Wavetable A claims and no earlier build had shown.
- The trajectory library (cycles 8 and 9, 2026-10-14): seven piano strings, a bell, a vibraphone, a marimba and a singing bowl, measured by `trajectory-library/track_partials.py`.
- The coupling-edge study (3639fc9b through 2d467835, 2026-10-20), answering a commission baton from that week's Daily Page (7a79eaa2, 2026-10-17). The page took a short section and a partial answer (9321d915, 3f9264bf). The measurements stayed on the scroll, and so did three notes for [[Harmonicity and Inharmonicity]]'s field guide, which wait on Loudon's yes.
- Bent Line, a VST3 and AU with seven materials and filing as a switch (cycle 10, 47c7f4f7, 2026-10-28). Every check passed. Nobody has played it in Live yet.
- The rich face's proposal round (8dcec580, d76eafb3, a1a7d20e, 2026-11-03): three walks, fifteen gathered pieces, one remake after the challenge.

**The plan.** The page's § Forward Path is the April guess. The path the project actually follows is the Plan on the scroll, agreed 2026-10-15 (`inharmonic-wavetable-synthesis-steward-015`). Read that one. A later hand may point § Forward Path at it, on Loudon's yes.

## What the making corrected that the page has not taken in

**The piano numbers.** Cycle 8 (2026-10-14) tracked a recorded low A and measured B = 4.67e-5, steady within ±2% from the strike to 3.8 s. The page gives Piano (Bass) as B ≈ 0.001–0.002, settling over about 200 ms, and its "settling piano" flattens the bend over 500 ms. The steward flagged it (`steward-018`) and left the wording to an elder. It has not landed. The 2026-11-03 challenge (d76eafb3) narrowed the flag: the gap is 12 to 43 times on this one sampled grand, published bass values run near 2e-4 (Hinrichsen, arXiv 1203.5101), and the first tenth of a second may be the string or may be the tracker. What survives is the shape of the finding. After the attack the bend holds still, and the settling you hear is the loudness wall dimming where the bend is largest. The page's own § The Cube Architecture predicted this when it called amplitude and bend "two projections of a single struck string". So the "settling piano" as written is a designed gesture, not a physical one. Whoever next edits § What This Sounds Like or § Physical Trajectory Library should land the flag with the challenge's caveats attached.

**The filing line.** Loudon answered BOTH to how a bell's modes are filed (`steward-021`, 2026-10-15), and it is now a switch on Bent Line. The '— progressed:' line under the recordings question still calls filing open. The fix is drafted as tuning item 2 (2026-10-28) and waits on his review.

## What was tried and dropped

- **The June hand-made trajectory.** The first settling piano started at B = 9e-4 and relaxed toward 7e-5. Measurement replaced it: the real string sat 19 times less stiff than the guess and did not relax (cycle 8).
- **Rank as the only filing.** The steward leaned Rank; Loudon asked for both. Nearest turned out to matter for pianos too, since a stiff string's upper partials climb past their own slots (tuning item 1).
- **The scanner-or-FFT fork.** A June question about which amplitude path to build first hung unanswered for four months. Cycle 7 built both, and the plan proposal called the question moot (steward-015).
- **The Live device as a Max patch.** The Plan's step 3 named an RNBO or Gen~ Max for Live device. Max was paused, so cycle 10 built the device on the [[VST Template]] instead. Nothing was decided here. Circumstance set the patch aside, and the plan revision that would say so (`steward-024`, posted 2026-10-28) is still waiting on Loudon.
- **Four frontmatter links.** These left at the 2026-10-24 weave's one-link-per-pair fold (769c93ad), because each pair is stated from the other side: [[The Curve Is the Material]], [[Wavetable Space as Torus]], [[DSP in Looping Dimensions]] and [[Wavetable Oscillator]]. None of them is lost. The Curve Is the Material is named in the body (96c1c26f, read and approved by Loudon 2026-10-12) as an editor refinement that stays open and not adopted. The plan's step 5 builds both editors and lets hands and ears choose.

## Why it is shaped as it is

**Born whole, from one session.** The page arrived in a single deposit (D-2026-04-21b, 221090d9, 2026-04-21), 314 lines in one commit, beside the page now called Wavetable Space as Torus (renamed in e58548d8, 2026-04-27) and The Curve Is the Material. It reads like a design spec with a market survey and a lesson plan because that is what the session produced, and that is most of its 35 KB. Edits since have been small and placed: a pointer, a partial answer, a short section, a member-of link to [[Synthesis Topologies]] (39a1a54e, 2026-11-01). The working rule has been that the page says what the instrument is, the scroll says what was made, and a finding enters the page as a short section or a '— progressed' line, never as a rewrite. That rule is also why the measured corrections above are still outside the page. Nobody has yet made the one deliberate edit they need.

**Two deliverables on one page.** The forward vector asks for a VST and a Four Pillars lesson at once, and the agency profile's practice line says they are "one project with two deliverable forms". That is why § Commercial Landscape Positioning and § Four Pillars Lesson Design sit side by side, and why the Plan alternates between them: the plugin at step 3, the lesson at step 4, the JUCE release at step 6.

**The flat line as identity.** § What This Looks Like and § The Glowing Line UI both say the pedagogy is structural, not instructional. The steward's next named move is to light Bent Line's screen with that line (scroll, 2026-10-28). The display is the instrument's front door and the lesson's first picture, so it is the part of the page most likely to change next.

**Still growing.** The stage stays `growing` with a working plugin because nobody has played it and the lesson is unbuilt. The scroll's check table ends on "played in Live: not yet". When Loudon plays it, the next hand should record what he hears and whether the stage moves, here or on the scroll.
