---
title: "Portamento and Physical Pitch Modeling — Context"
born: 2026-11-08
links:
  - target: "[[Portamento and Physical Pitch Modeling]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Portamento and Physical Pitch Modeling is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Portamento and Physical Pitch Modeling — Context

This is for the next hand to work on [[Portamento and Physical Pitch Modeling]]. Most of the page is one piece of writing from a single conversation, and it has been changed very little since. The project's later work went into the bundle and onto the scroll and reached the page only as short notes. This file explains that layering, records the directions the steward was offered and passed over, and lists what is still waiting at the door. Where the project stands now is on [[Portamento and Physical Pitch Modeling — scroll|the scroll]].

## Why the page reads as one piece

The page is born `2026-01`. The ten teaching tools came out of a conversation on 2026-01-06 about wavelets and portamento, as the Artifacts section says. The page first shows up in git on 2026-03-24 inside an unrelated deposit, at the repository root, at stage `growing` (`4169e6ad`). Its outline then was the outline it has now: the physics, the second-order model and its three regimes, wavelets, coupled modes, artifacts, open questions, cross-domain resonance and suggested explorations. It moved into `Projects/` in the 2026-03-30 Weave (`b54785f4`) and was promoted to `mature` in the Weave of 2026-04-07 (`c2dd3616`).

Since then the frontmatter has had more attention than the body. The Kuramoto link became `couples-with` in the swarm audit of 2026-03-31 (`e1d3a66f`). The forward vector was written in the Weave of 2026-04-07 (`1c964395`). The October folds labelled and retyped the rest (`17e99b33`, `050af498`). The body has had two edits. A path changed when the old `Artifacts/` folder became the bundle (`74543f34`, 2026-05-28), and the October Weave rewrote the artifact list and added *progressed* notes (`a75350ec`). The physics, the formulas and the cross-domain sections are the January writing, and nothing in git shows them being checked since. A worker who changes a formula is the first to read it critically on the record.

The frontmatter's `hook_quality: 8`, `beauty: 8` and `who_leads: shared` have been there since the March deposit (`4169e6ad`). They are SCHEMA fields (`SCHEMA — Reference.md:97-99`), and nobody has changed them since.

## What the page left out, and where it went

**The ten tools, described one by one, and wrongly.** Until October the Artifacts section gave each of the ten tools a paragraph: the regime comparison, the wavelet spectrogram, string length to frequency, vocal glide with formants, the bell mode analyzer, the guitar bend, the five-mode Kuramoto string, the overshoot calculator, the ridge extractor and the ear-training quiz. The October Weave folded that into one line (`a75350ec`); the fuller descriptions are in git at that commit. Neither matched the files. The ten are silent visualizers of one glide steered by a controller, titled in the order they were fought for: PID, then PD, then exponential smoothing. On 2026-11-09 the page's list was corrected to say so (`1ecd9350`). The old descriptions may have come from a plan for the tools rather than the tools as built; that is a guess, not checked.

**What the steward made since.** The steward's cycles built the twelve-glide ear set, a single-session reel of six clips (`portamento-steward-014`, 2026-06-23), the multi-mode study of a bowed string, the model-fitter, an overshoot threshold test, and in cycle 13 a set of seven glides whose damping changes partway through (`portamento-steward-028`). The page lists the first four: the reel inside the ear set's line, then multi-mode and the model-fitter. The threshold test and the damping-over-time glides came in on Loudon's review of 2026-11-09, as the steward's items 1, 3 and 4 in [[Portamento and Physical Pitch Modeling — tuning]]. Item 3 answers Open Question 1 with a finding: damping acts only while the pitch is moving, so ζ(t) is a gesture of the glide, not of the note.

**The cycles' answers to two open questions.** The October Weave put dated *progressed* notes from cycles 10 and 11 (2026-10-14) under questions 2 and 3, and a note on `model-fitter/` under question 6 (`a75350ec`). This is how the page takes in later work. The question stays, and a short line underneath says how far it has got. Each note ends on what hasn't happened yet, usually that nobody has listened.

## What was tried and dropped

**Two directions passed over.** In June the steward offered three next directions (`portamento-steward-015`, 2026-06-23). The first was REAL-RECORDINGS: point the model-fitter at a real vocal slide, cello portamento or bell, because the model "is currently unfalsified". The second was PROGRESSIVE-CURRICULUM: wrap the reel, the paired exercises and the quiz into one sequenced Loudon Live session page. The third was MULTI-MODE: extend the model to coupled modes. The steward leaned toward real recordings. Loudon chose MULTI-MODE on 2026-08-26. The other two were never picked up. The model-fitter is still checked only against the twelve synthetic glides, as Open Question 6's note says. That is the page's most important unfinished test, and it is the direction he passed over, not one he refused.

**The Loudon Live session.** The curriculum option assumed a Loudon Live built on sessions. On 2026-09-26 Loudon Live was redrawn as his whole public self, not a session curriculum (`a22b039b`). So that framing of the option is gone, whatever happens to the teaching aim.

**A haptic ζ(t).** Open Question 1 carries a proposal from [[Haptic Handwheel]]: a struck spring that a finger can damp while it rings. It is marked "a proposal, not built". Cycle 13's glides answered the question in sound without any hardware, so the proposal is still open as an instrument, not as the way to answer the question.

## Why it is shaped as it is

**Theory before tools.** The page is written as a lesson. It goes from the physical claim (the pitch *is* the glide) to the equation, then the three regimes, then how to see them (wavelets), then how real instruments complicate things (coupled modes), and only then to what you can play. The forward vector says what the shape is for: a teaching instrument where a student can tell the regimes apart by ear after one session, which "needs its exercises". The ear set and the reel are those exercises. They live in the bundle, and the page points at them.

**Why the page turned on 2026-11-09.** A blind listening test (the bundle's proofs, 2026-11-04) named the three regimes 8 of 9 as written, but overdamped against critical, matched in time, came out at chance (3 of 6, one listener). So the vector now says two characters and a speed, with critical damping as a design point. Carl Seashore's measured glides (*Psychology of Music*, 1938, pp. 262, 270–272) replaced the claim that singers landing from above arrive sharp, and gave the Plan its direction: a glide timed to the vibrato, and a controller in place of a passive spring.

**Five cross-domain sections, five links.** Each *Connection to* section matches one frontmatter link, with its type and label. Those five links were all there in March (`4169e6ad`), and the October folds only gave them types and labels (`17e99b33`, `050af498`). A section added without a link, or a link added without a section, breaks that pattern.

**Type and stage.** It is a `project` at `mature` since April, with three pillars. It has no Practice pillar, even though the forward vector is about practice: ear training in a single session. Adding the pillar is a small change. The next hand could offer it to Loudon.

For the next hand, things worth recording: Loudon's review of tuning items 1, 3 and 4, the first real recording run through the model-fitter, and the first time anyone actually listens. The scroll has said "Nobody has listened yet" since cycle 9. Cycle 12's note puts it plainly: ten minutes with either page "would tell me more than another render."
