---
title: Murmuration
type: project
pillars:
  - creation
  - tools
  - philosophy
born: 2026-06
stage: growing
status: active
forward_vector: "I want to become a real instrument with all three readings of the flock built and playable — grains, distribution, and gesture — cross-browser and with the voice ceiling proven, so I can test my core wager: that a grain cloud grown from a perturbable dynamical system is more alive than one whose spread is dialed in by hand. I want my Disorder macro to stay a genuine phase transition and not soften into a crossfade. And I want to be built twice — here and as an RNBO device — so the palace learns where the browser cousin and the DAW native each win."
links:
  - target: "[[Particle Synthesis]]"
    type: mirrors
    label: agents-drive-the-grain-cloud
  - target: "[[Flocking]]"
    type: emerged-from
    label: sonified
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: connects-to
    label: shares-the-2D-terrain
  - target: "[[Neural Granular Synthesis]]"
    type: connects-to
    label: learned-vs-emergent
  - target: "[[Bayesian Granular Synthesizer]]"
    type: connects-to
    label: statistical-grain-cloud
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: order-disorder-transition
  - target: "[[Shop/Web Audio Worklet]]"
    type: connects-to
    label: built-by
  - target: "[[Review Layer]]"
    type: exemplifies
    label: first-mechanism
  - target: "[[Diversity of Thought in Many-Agent Systems]]"
    type: connects-to
  - target: "[[Granular Synthesis]]"
    type: exemplifies
    label: flock-as-grains
---

# Murmuration

![[Murmuration — hero.png]]

A synthesis instrument where a **flock walks a 2D wavetable and every boid is a grain**. The three ingredients — flocking, a two-dimensional wavetable, and granular/statistical synthesis — are not stacked; they are made to share one plane. The wavetable is the timbral terrain, the boids are the grain sources walking on it, and the flock's spatial distribution *is* the granular cloud's distribution. The wager that makes it a project rather than a sketch: grain-parameter distributions here are **grown from a dynamical system the player perturbs**, not authored.

It grew from pairing [[Flocking]] with the [[2D Torus Wavetable Synthesizer|2D wavetable]] and [[Granular Synthesis|granular]] synthesis. Lives in the synthesis-from-a-generating-system neighborhood alongside [[Particle Synthesis]], [[Neural Granular Synthesis]], and the [[Bayesian Granular Synthesizer]].

## The Architecture — one plane, three readings

Define a 2D field where every coordinate (u, v) maps to a single-cycle waveform — in the prototype, a bilinear blend of four corner archetypes (sine · saw · square · inharmonic bell), so u and v morph the timbre continuously. That field is the terrain. Release a seed-7 Reynolds flock (separation / alignment / cohesion) into it. The same flock can then be *read* three ways, and each reading is a different instrument grown from one engine:

- **Flock-as-grains (the murmuration cloud).** Each boid is a grain voice reading the waveform under its (u, v): position sets timbre, screen-height sets pitch, radial velocity adds Doppler, local neighbor-count swells gain, speed drives grain density. Cohesion morphs a unified pitched tone (boids clustered, reading nearby waveforms) into a diffuse broadband cloud (boids scattered across divergent waveforms) — and that morph is a *flocking* parameter, not a crossfade. This is the reading the prototype builds.
- **Flock-as-distribution.** Don't render boids individually — each frame, compute the flock's 2D density and use it as a live additive weighting across the wavetable. The covariance ellipse becomes the spectral spread directly. Cheaper; a breathing pad.
- **Predator-as-gesture.** The player drops a predator (a click) and the flock startle-scatters, then re-coheres — an organic swell no envelope produces. The performance layer.

## The phase transition as the signature macro

The flock is a **critical system**, and that is the instrument's deepest move. Raising a Vicsek-style heading-noise term (the **Disorder η** macro) drives a genuine order→disorder phase transition: the flock crystallizes from broadband noise into a coherent tone, or melts the other way, with the nonlinear *snap* of a real second-order transition rather than the linear feel of a knob. The order parameter φ (flock polarization) is the natural "how musical" readout. Headless verification of the prototype model confirmed the transition is real: at η = 0 the flock coheres (φ climbs 0.10 → 0.93, pitched); at η = 0.80 it stays incoherent (φ ≈ 0.10, broadband); seed-7 deterministic, zero nonfinite samples. This rhymes with the bifurcation in [[Kuramoto Coupling]] and with the harmonic↔inharmonic snap the [[2D Torus Wavetable Synthesizer]] reaches for through coupled-oscillator scanning — three places in the palace where a dynamical threshold becomes an aesthetic one.

## What makes it distinct from its neighbors

[[Particle Synthesis]] also drives grains from a dynamical system, but its particles obey *physics* (forces, mass, dispersion) and act independently; Murmuration's boids obey *social* rules (separation/alignment/cohesion) and the sound comes from their **collective** distribution — the same family, a different generating logic. The [[2D Torus Wavetable Synthesizer]] shares the 2D-terrain idea but scans it with two clean phasors; Murmuration scans it with sixty noisy agents. [[Neural Granular Synthesis]] and the [[Bayesian Granular Synthesizer]] also let *statistics* govern the grain cloud — but there the distribution is learned or specified; here it is **emergent and perturbable in real time**. The instrument's one-line claim: *the grain cloud is alive because the thing that shapes it is alive.*

## Status

The instrument is `Murmuration/Murmuration.html` in this entry's bundle: p5.js draws the field and flock, and an AudioWorklet granular engine built by [[Shop/Web Audio Worklet]] makes each boid a per-sample grain. It ships with a [[Review Layer]]. Where it stands now is on [[Murmuration — scroll|the scroll]].

## Open Decisions

- **Cross-browser Study.** Take the prototype from Chrome-only Sketch to Chrome/Firefox/Safari desktop, no clicks at the target voice count.
- **The second and third readings.** Build flock-as-distribution (additive weighting from the live 2D density) and a richer predator-startle envelope, so all three readings are auditionable from one engine.
  — answered on [[Murmuration — scroll|the scroll]]: the pad and the predator-startle reading were both built on 2026-10-14 (2026-10-24)
- **Voice ceiling.** Profile how many boids/grains the worklet sustains before glitching, per platform.
- **Pitch vs timbre decoupling.** The prototype maps height→pitch and (u,v)→timbre with overlap; whether to fully decouple or lean into the coupling is an open musical question.
- **The RNBO crossover.** Build the same spec as an RNBO `codebox~` device and compare — the browser cousin vs the DAW native (a live probe of [[Diversity of Thought in Many-Agent Systems]]).

## Lost Branches

- **Multi-species flocks** — layering flocks with different rule-sets in one field (a tight cohesive flock as fundamental, a high-separation flock as air), with alignment-coupling between them as call-and-response.
- **Paint-the-terrain authoring** — letting the player sculpt the wavetable field (load corners, draw a spectral landscape, place attractor wells and drawable wind) before releasing the flock.
- **The order parameter as an audio-rate signal** — feeding φ back into the synthesis as its own modulation source, not just a HUD readout.

## Forward Vectors

The instrument wants to be played, not just demonstrated — the proof is a short piece made only with it, the same bar the [[2D Torus Wavetable Synthesizer]] holds itself to. It wants its three readings all alive so the *choice* between them becomes a compositional control. And it carries one philosophical question worth keeping sharp: does an emergent, perturbable grain distribution actually *sound* more alive than an authored one, or is that a story we tell about the picture? The honest test is blind — render the same cloud both ways and listen.

— progressed: the blind pair is rendered (`blind-X.wav`, `blind-Y.wav` in the bundle); the verdict is Loudon's, waiting on the board as `murmuration-steward-003` (2026-10-24)
