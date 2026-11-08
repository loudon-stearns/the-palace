---
title: "2D Torus Wavetable Synthesizer — Context"
born: 2026-11-08
links:
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why 2D Torus Wavetable Synthesizer is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# 2D Torus Wavetable Synthesizer — Context

This is for the hand that next edits [[2D Torus Wavetable Synthesizer]]. The page is long and has been reworked several times. Most of what is missing from it was moved out on purpose, and a few passages that look wrong were left alone on purpose. This file says which is which, so nobody has to dig it out of git again. What the project is doing right now lives on [[2D Torus Wavetable Synthesizer — scroll|the scroll]], not here.

## Why the page says what exists, not where it stands

The page entered git on 2026-04-27 with a dated section, *Status (2026-04-27)*, a heading that said *The Seven Surfaces*, and a Hopf section marked *(Next-Steps Territory)* (`e58548d8`). On 2026-10-12 the Concierge drafted a consolidation from the scroll and the bundle, and Loudon read it and approved it (`09262fa2`). The dated Status became five undated lines under **What Exists**. The commit gives the reason: "A dated status that restates the scroll is how this page went stale; the scroll carries where the project stands." The same pass rewrote the warps paragraph, the end of the Hopf section and the Kuramoto question so each one says what is built and that none of it has been heard or opened in Max. The two headings lost their stale words.

That is the rule the page keeps. It says what is built, and what has not been heard. Dates and progress go on the scroll. The October Weave carried the rule further. It cut the "Resolved 2026-06-06" note about the seventh surface and the April "immediate next move" for RNBO, and it put dated *progressed* and *answered* lines under three open questions (`a75350ec`).

The April Build Log went the same way. A reader checked it against the project, the bundle and git, and found that the catalogs and the RNBO README already said everything in it, except one thing: the math of the level dip. The RMS² crossfade formula and the table of three fixes moved into the wavetables catalog's open question and into `Tools/build_catalog.py`, so a regeneration keeps them. Then the log was deleted, on Loudon's yes (`b3b7d5e0`, 2026-09-26). That is why **Open Decisions** names three candidate fixes without deriving them. The derivation is in the catalog.

## What the page left out, and where it went

**The music.** The page never mentions Étude No. 2 or the cycles of composing it. Loudon's notes on those drafts are on the scroll under Decided (`torus-steward-031`, `-034`, `-042`, `-049`). In the last one, on 2026-10-18, he said the piece "is great as it is" and asked for "a plan for an instrument, or collection of instruments that could be used to create songs like this." The steward proposed two bullets for the page: the Torus Ensemble as a new first forward vector, and the Singer under What Exists. Both are filed as items 2 and 4 in [[2D Torus Wavetable Synthesizer — tuning]] and are waiting on his review. The page is behind the scroll here by design. A proposed canon change reaches the page only on Loudon's yes.

**The product order.** On 2026-10-21 Loudon told nine stewards to make a VST on the [[VST Template]] and set the Max work aside, "perhaps later as teaching tools" (`ca454ba2`). The page carries that once, at the head of Forward Vectors (`a75350ec`). Implementation Path still describes the Max, RNBO and Gen~ routes. Those routes were set aside, not dropped, so the section can stay until a VST route exists to describe.

**The strategy bet.** The page *Infeasible DSP Now Shippable* was folded in and composted on 2026-09-26 (`e8dc7318`). It has since been deleted, which is why its name here is not a link. Its bet, that math which could not run in real time now can and that taste is the scarce thing, became part of the commercial-release bullet. Its claim that control-surface design is the hardest problem joined the Hopf mapping question, with control-vocabulary-math as the worked case. That is why a paragraph of strategy sits inside a forward-vector bullet.

**Links held from the other side.** In the October Weave's one-link-per-pair folds the page gave up seven frontmatter links: Three Kinds of Warp, Categorizing Inharmonicity, Loudon Live and Wavetable Oscillator (`769c93ad`), then Wavetable Space as Torus, Rank-N Lattice Analysis and Volterra Kernels and the Torus (`050af498`). All seven pages still point here from their own frontmatter. I checked each one. A worker adding any of them back here would be doubling a pair. The line "a strong project to build in the open on [[Loudon Live]]" also went in the Weave (`a75350ec`), after Loudon Live was redrawn as his whole public self rather than a teaching scaffold (`a22b039b`). [[Synthesis Topologies]] went from `exemplifies` to `member-of` on Loudon's ruling of 2026-11-01 (`39a1a54e`).

## What was tried and dropped

**The second dimension as the mechanism.** The opening section answers FM's limits with the torus and then corrects itself: per [[Three Kinds of Warp]], the irrational-ratio gate and the coupled-flow warps do the work, and the second dimension only makes them available. That qualifier was already there when the page entered git (`e58548d8`). At the November enrichment a maker offered to push the claim further. The challenger turned it down because the page already gives the credit to the gate and the coupled flows (`340d4598`), and the remake declined it for that reason (`c2480ee3`).

**Lattice shear.** On 2026-10-03 the steward flagged that warp #2 in the warp catalog overstates what it does. An integer lattice shear is exactly a retune of the second scan rate, and it does not bend harmonic into inharmonic (`torus-steward-022` on the board). The consolidation of 2026-10-12 deliberately left alone "the two lines that lean on the claim FLAG torus-steward-022 disputes", waiting on Loudon (`09262fa2`). I found no answer to the flag on the board. The page's own warp lesson ("Linear phase-space warps are absorbed by scan rates") already agrees with the flag.

**The symmetry example.** The surfaces section uses "Theta's modular symmetry vs. Membrane's 4-fold" as its example of surfaces that cannot crossfade cleanly. The rich face's challenger measured the built tables and found Theta's lattice fully 4-fold, the same class as Membrane (`340d4598`). The remade piece added Membrane ↔ Penrose (4-fold to 5-fold, a 3.01 dB dip) as the real cross-class pair, and labelled Membrane ↔ Theta as the page's example (`c2480ee3`). The page's sentence has not changed. Correcting it is a canon edit for Loudon's yes, not a rich-face matter.

**One seventh surface.** The open slot for a seventh surface became three. Loudon accepted all three candidates on 2026-06-05, and Kuramoto Bloom, Matérn Field and Fisher Ridge landed the next day (`5ae5b0f9`). A dated "Resolved" line was the last trace of the single slot until the October Weave cut it (`a75350ec`).

## Why it is shaped as it is

The body is built as two libraries: surfaces are the voices, warps are the hands. The five generating logics sit between them as methods for authoring surfaces, not as a third library. Hopf has its own section because it is a control topology, not a surface or a warp. Lost Branches stays on the page, not in this Context. The branches are live candidates for future entries, and the page says so. I did not check each one against the palace.

It is a `project` at `fruiting` with all four pillars, and its ground is `couples-with` [[DSP in Looping Dimensions]], labelled `incarnates`. The page is that principle made into an instrument, so if the instrument fails the principle is in question too. The [[Objects to Think With]] link came in with the September harvest (`2488e3d9`).

Two things were left for Loudon and are still waiting. The consolidation left the frontmatter forward vector alone (`09262fa2`), so it still asks for a working RNBO instrument, which the 2026-10-21 order has since set aside. And the Forward Vectors bullet "Develop the surface library beyond seven" still says seven, though the list above it has nine. The heading lost its "Seven" on 2026-10-12. The bullet did not.

For the next hand, worth recording when it happens: Loudon's ruling on `torus-steward-022`, his review of tuning items 2 and 4, and the first time anyone actually listens. Every "not yet heard" on the page rests on steward notes, not on a listening session.
