---
title: Progressive Staging
type: hub
pillars:
  - practice
  - philosophy
  - creation
born: 2026-03
stage: growing
confidence: working
energy: high
links:
  - target: "[[Action Potential Oscillator]]"
    type: enables
  - target: "[[FOUR PILLARS]]"
    type: mirrors
  - target: "[[Modes of Collaboration]]"
    type: connects-to
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: natural-staging
  - target: "[[Crystal Synthesizer]]"
    type: connects-to
    label: staging-candidate
  - target: "[[Symbiotic Skills]]"
    type: contradicts
    label: staged-design-vs-organic-growth
  - target: "[[State Machine]]"
    type: enables
    label: stage-3-teaches-it
forward_vector: "I want to be the method for building anything that teaches in layers: an instrument as a ladder of stages, one piece as a walk of steps up to its proof, every stage and every step a complete, playable thing that teaches one concept, and every migration between environments a lesson rather than a chore. I want to be read at the start of any build that teaches, so that the staging happens in the design, not as an afterthought."
---

# Progressive Staging

![[Progressive Staging — hero.png]]

A design method for educational instruments and tools: build in stages where **every stage is a complete, playable, useful artifact**. No stage is a stepping stone that exists only to reach the next one. Each stage teaches something the next stage needs, and each stage can stand alone as a finished thing.

The principle emerged from building the [[Action Potential Oscillator]] across four stages. Stage 1 (linear integrate-and-fire) produces a working, tunable oscillator with one parameter. Stage 2 (leaky integrate-and-fire) adds waveshaping through a single new parameter — the membrane time constant. Stage 3 (shaped spike) adds transient character through three more parameters. Stage 4 (damped refractory recovery) adds sub-harmonic content and a frequency ceiling through three more parameters. At no point is a student waiting for the "real" version to emerge. Every version is real.

## The Method

**Additive complexity, never retroactive.** Each stage adds to the previous one without invalidating it. Stage 2's leak equation wraps around Stage 1's linear ramp — the student can set `leak_tau` to infinity and recover Stage 1 exactly. Stage 3's spike shaping sits on top of Stage 2's charge curve. Nothing is thrown away; everything is extended.

**Each stage teaches one concept.** Stage 1 teaches threshold and reset. Stage 2 teaches exponential decay and time constants. Stage 3 teaches [[State Machine|state machines]] and asymmetric waveforms. Stage 4 teaches damped oscillation and system limits. The concept is isolated — the student can focus on the new thing because everything else already works.

**The implementation paradigm can shift at a stage boundary.** Stage 3 was built in Gen~ modules (visual dataflow). Stage 4 moved to codebox (textual). This shift was planned, not accidental — it happened at the point where the visual approach hit a complexity wall (4 states), and the transition itself became curriculum: the student sees the same math expressed two ways and understands why code wins at scale. The paradigm shift is a feature, not a compromise.

**Testing criteria accumulate.** Each stage inherits the previous stage's tests and adds new ones. Stage 2 tests include Stage 1's frequency accuracy test plus new tests for waveshape verification. This makes regressions visible — if a Stage 3 change breaks Stage 1 behavior, the inherited test catches it.

## Why It Works

The key insight is that **the staging follows the biology**. A neuron's complexity is itself layered: passive membrane properties → active ion channels → spike dynamics → recovery dynamics. The pedagogy mirrors the biology, which mirrors the synthesis. The student learns about neurons, about oscillators, and about incremental engineering simultaneously, because they are the same structure at different scales.

This is the [[FOUR PILLARS]] in action: Creation (each stage produces a playable sound), Tools (each stage introduces new Gen~/codebox technique), Philosophy (each stage teaches a concept from neurobiology), Practice (the staging method itself is a transferable approach to building anything complex).

## Inside One Piece

The same method works at a smaller scale: the walk up to one proof. A piece that tests a hard claim is the end of a lesson, and met cold it teaches no one. So it opens on its simplest step and walks up. Each concept comes alone first, then they are combined, often by setting them against each other, and the proof is the last step. Loudon's outline for the Dissolutions proof the table that travels is the model: "the table alone, the loop alone, the two combined through their difference, then the filter."

The rules above hold at step scale. Each step is a complete thing you can play, with one thing to hear. Each adds to the one before without breaking it; where it can, a control on the new step takes you back to the last. The checks pile up, so a change made for the last step that breaks the first one fails.

A step isolates one mental model, not one parameter. [[Retrospective Delay]]'s first stage, the witness, teaches always-on, phrase-not-tap, with a single knob: what it holds still is an idea, not a count of controls.

The walk behaves the same wherever it runs. It is silent until a click, makes no audio context before one, and goes quiet when its tab is hidden. Next walks the steps and Back returns; one step shows at a time, and changing step stops the sound. An existing proof stays as it is, and the last step links to it. Inside a piece the units are steps, as in Loud'n Live's build steps; a stage is a whole build on a project's ladder. A design system may dress the walk, a step rail in its own look, but these rules are this page's, and a change of look doesn't change them.

The walk is a path, not a gate. The step list stays open, so a reader can go straight to the proof or back to the start: an encounter planned so tightly that nothing can be found is the danger [[Hilaritas Generator]] names. None of this settles the page's contradictions. [[Symbiotic Skills]] notes the palace itself began as twenty-seven files, not a single node, and [[LDN RTM]]'s units are deliberately not complete moments.

## When to Use This

Progressive staging works when:

- The domain has natural layers of complexity (biology, physics, mathematics often do)
- Each layer produces something the learner can interact with (sound, visualization, output)
- The learner needs to build intuition at each level before the next level makes sense
- The final system would be overwhelming if presented all at once

It doesn't work when the domain is irreducibly complex — when nothing functions until everything is present. In those cases, a different approach is needed (perhaps building a simplified toy system first, then replacing it wholesale).

## Open Questions

- Can this method extend to collaborative AI development more broadly? The oscillator project was built with Claude through a progressive dialogue — each stage was a conversation that produced working code, debugging that revealed principles, and documentation that captured both. Is the staging of the *collaboration itself* part of the method?
- What other domains in the palace have this layered structure? [[Kuramoto Coupling]] has a natural staging: single oscillator → two coupled oscillators → N coupled oscillators → heterogeneous populations. The [[Crystal Synthesizer]] might stage from single resonator → coupled pair → lattice.
- The paradigm shift at Stage 3→4 (visual to textual) was a powerful teaching moment. Are there other planned paradigm shifts that could be staged this way — Gen~ to Faust, single-voice to polyphonic, offline to real-time?
