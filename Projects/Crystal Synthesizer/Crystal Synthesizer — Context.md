---
title: "Crystal Synthesizer — Context"
born: 2026-11-08
links:
  - target: "[[Crystal Synthesizer]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Crystal Synthesizer is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Crystal Synthesizer — Context

This is for the next hand on [[Crystal Synthesizer]]. The page is mostly a theory written in February and March, and its most important edit was a doubt Loudon left inside it. Since then the project has become a plugin that plays in Live, and that news reached the page only as dated notes under its open questions. This file covers the doubt and what it changed, the curriculum plans in this bundle's `Archive/` and what is left of them, and the places where the page and the project now disagree. Where the project stands now is on [[Crystal Synthesizer — scroll|the scroll]].

## The doubt that shaped the taxonomy

The page is born `2026-02` and first appears in git on 2026-03-24, in an unrelated deposit, at stage `sprout` (`4169e6ad`). Its seven lattice systems then each carried a flat statement of how they sound: cubic "thick, bright, rich partials", triclinic "chaotic, bell-like".

On 2026-03-25 an HTML comment appeared in the Bravais section, written in the first person: "I don't believe these descriptions of how a crystal sounds, I think this is guessing based on spectral descriptions, I'd like to hear or read a source" (`46d904fe`). The Weave of 2026-04-07 answered it by rebuilding the taxonomy (`c2dd3616`). Each sound description became a **Hypothesis**, marked "To be tested", under a paragraph saying the descriptions come from spectral analogy, are "not empirically verified", and that the instrument "exists precisely to test them". The comment was removed once it had been answered. That is why the section reads as a list of predictions, and why the project's first standing order is "Hypothesis-testing throughout". A worker who writes a description as settled fact goes against the page's founding correction, unless a render or a source backs it.

The rebuilt section has started to get answers. `crystal-rings/` found that diamond is the only bell, and that labradorite, the triclinic case the page calls "chaotic, bell-like", rings as "a dull knock with a bright tick" if its estimated line width holds (the October Weave's note, `a75350ec`). The hypothesis lines themselves haven't been edited to match. A prediction that has been tested is still stated as untested, and changing that is the next real edit to the taxonomy.

The same commit as the comment, `46d904fe`, added the bare line under the Bravais heading: "Interface design: 3D accurate slowly rotating wireframe diagram…". It is a design note left in the body, not part of the taxonomy. It has been there ever since, and the plugin's dark centre screen is still waiting for that visualizer (the scroll, cycles 13 to 14).

Some mineral examples were corrected along the way. The April session pass moved quartz from the hexagonal entry to trigonal, where it belongs, and gave hexagonal emerald (beryl) instead (`76e60f39`). The same commit added the Mineral Palette pointer to [[Crystal Sonification Reference]] and cut the forward vector down to its single line.

## What was tried and dropped

**A Loudon Live curriculum in five sessions.** `Archive/Crystal Synthesizer — Staging.md` (born 2026-04-21, `76e60f39`) holds the April plan: five stages from a monophonic Gen~ partial bank to a full physical model, each stage a Loudon Live session of 75 to 90 minutes, framed 70% making and 30% framing, with an *Alignment Record* of decisions reached in dialogue with Loudon. The Curriculum Map put the project among its three entry points with no prerequisites, and listed four gaps it needed filling first: Gen~ foundations, RNBO fundamentals, modal synthesis, and export to hardware. The staging file was retired when plans moved into scrolls (`d4cb3fa1`, SCHEMA v1.25, 2026-09-25). Its session design became `Archive/Crystal Synthesizer — spec — Loudon Live sessions.md`, which was retired a day later when Loudon set down the session curriculum (`a22b039b`). The five moves survive as the scroll's Plan, now framed as moves rather than sessions.

**The Alignment Record still steers the steward.** The record's decisions were seeded into the scroll's Standing Orders on 2026-09-25, and since Standing Orders are Loudon's, the September rewrite left them alone (`a22b039b`, "Not done"). So the orders still say to build in Gen~ inside RNBO, to make each session 70% making and 30% framing, and that "the audience is autodidact polymaths". Two newer orders sit on top of them and contradict them: Max work paused on 2026-10-16 (`929de8c5`), and the VST order of 2026-10-21 (`ca454ba2`). Since 2026-10-14 [[Loudon Live]] has named electronic musicians as its audience (`016ec791`). The scroll does not say which orders still hold. Only Loudon can retire one.

**The fidelity question as its own entry.** The deposit of 2026-04-09 moved the page to `fruiting` and spawned two entries: [[The Metaphor Stretch]], the decision point where physics gives tendencies but not a playable instrument, and *What Claim Does Scientific Sonification Make?*, which named three paths and chose none (`3e8c896c`). The September Weave merged the second into the first and cut the link (`8972a53d`). The question of what this instrument claims about real crystals now lives on The Metaphor Stretch.

**H90 versus plugin.** On 2026-10-15 Loudon kept the H90 path instead of moving to the H9000 or a plugin (`crystal-synth-steward-029`, *keep*). Six days later the VST order made the plugin the next work anyway (`ca454ba2`). The plugin got built, and it is installed and played in Live (Open Questions, `a75350ec`). The steward's request to rewrite the Plan around it, `crystal-synth-steward-032` (2026-10-24), is waiting on Loudon. Until he answers, the Plan's five moves still begin with "Make a playable crystal in Max."

## What the page left out, and where it went

**The mineral data.** Partial-ratio tables, spectral character and generation prompts for the eight minerals are in [[Crystal Sonification Reference]], which lives in this bundle. The taxonomy names its examples, and the numbers are in the Reference.

**What was built.** Proofs, renders and the plugin are in the bundle: `dispersion-filter/`, `birefringence-proof/`, `crystal-rings/`, `triclinic-proof/`, `plugin/`, and the proofs menu Loudon asked for on 2026-06-25 ("make a really nice html menu of the proofs", `crystal-synth-steward-018`). The page reports them only as *progressed* notes under four open questions (`a75350ec`). *What the Instrument Would Be* still lists four options in the conditional, but the plugin is the modal option (a ringing bank whose decay comes from line widths) with dispersion added on the Fire knob. Saying so on the page waits on the same yes as the forward vectors.

**Links held from the other side.** [[Bessel Functions in Synthesis]] holds the pair, as `connects-to`, labelled `physics-constrains-spectrum` (`769c93ad`). [[Biomechanical Synthesis]] came in as `exemplifies`, labelled `instrument-two-built` (`050af498`). Seven of the page's links still have no label.

## Why it is shaped as it is

The page builds the instrument's case before the instrument: the physics, then the taxonomy, the optical-to-sonic bridge, the four architectures, and the paradigm argument. It is the case for an instrument whose spectrum "Nature makes", not one chosen by taste. `who_leads: loudon` and the scores `hook_quality: 9` and `beauty: 10` have been there since March (`4169e6ad`). The closing haiku came from an Enrichment of 2026-05-05 and was committed in the May cleanup (`a5ca537b`).

Its Forward Vectors still lead with "a prototype crystallographic oscillator bank in Gen~". The steward has proposed replacing that line with the VST (item 1 in [[Crystal Synthesizer — tuning]]), and the proposal waits on Loudon's review.

For the next hand, worth recording: Loudon's answers on `crystal-synth-steward-032` and on the April Standing Orders, the first time anyone listens to the plugin, and which hypotheses each render confirmed or overturned, written onto the hypothesis lines themselves.
