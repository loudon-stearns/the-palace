---
title: Synthesis Topologies
type: concept
pillars:
  - creation
  - tools
  - philosophy
born: 2026-05
stage: growing
energy: high
links:
  - target: "[[Generative Audio Devices]]"
    type: connects-to
    label: topology-emergent-counterpart
  - target: "[[Registry Pattern]]"
    type: connects-to
    label: pdl-as-topology-constraint
  - target: "[[Lossy Compression with Intent Alignment]]"
    type: connects-to
    label: topology-as-prior
  - target: "[[The Curve Is the Material]]"
    type: connects-to
    label: sub-topology-question
  - target: "[[Three Kinds of Warp]]"
    type: connects-to
    label: preserve-or-change-topology
  - target: "[[Generative Preset Development]]"
    type: emerged-from
    label: grew-from-its-ghost
  - target: "[[Wavetable Oscillator]]"
    type: connects-to
    label: the-stored-loop
  - target: "[[Granular Synthesis]]"
    type: connects-to
    label: the-crowd-of-grains
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: the-loop-that-loses
  - target: "[[DSP in Looping Dimensions]]"
    type: connects-to
    label: the-loop-as-ancestor
  - target: "[[Generative Sample Libraries]]"
    type: connects-to
    label: flesh-for-a-fixed-skeleton
  - target: "[[Synth Templates]]"
    type: connects-to
    label: subtractive-taught
forward_vector: "I name the wiring diagrams the palace's instruments are built on, and offer one useful way to see them as a family: the loop, the crowd, the wiring. Next I want each project to know its family from its own side, and the next instrument found at a crossing nobody has built yet, like a crowd that drives a wiring."
---

# Synthesis Topologies

![[Synthesis Topologies — hero.png]]

A synthesis topology is an instrument's wiring diagram: which parts make sound, which parts shape it, and what is allowed to move what. The palace keeps building instruments, and under their surfaces they come from a handful of these diagrams. This page names the ones it builds, points each at the projects that use it, and places each on one axis: did the instrument's designer fix the wiring, or does the player draw it?

## The Distinction

**Topology-first** instruments come with the diagram drawn. Ableton's Wavetable always has two oscillators, a sub, two filters, three envelopes and two LFOs; the player turns knobs inside that shape ([[Generative Preset Development]]). **Topology-emergent** instruments start empty. A VCV Rack patch begins as a blank rack, and the cables are the instrument ([[Generative Audio Devices]]).

The test that locates an instrument on the axis is what a preset has to carry. If a list of knob values is enough, the topology came with the instrument. If the preset must carry the cables too, the topology belongs to the player. Most instruments sit between the poles: a fixed engine with one place where the player draws — a modulation matrix, a hand-drawn table, a distribution grown from a simulation.

## The Family

Seven topologies run through the palace's instrument projects. One useful way to think about them is through three simple shapes underneath, and seen through those the list reads as a family. Each heading below names a topology, then the shape it can be read as. **The loop**: store a cycle or a delay and go round it. **The crowd**: sum many small voices until the sum holds still. **The wiring**: a few simple parts whose routing makes the sound.

### Subtractive — the wiring, as ground

Start bright and take away. An oscillator rich in harmonics feeds a filter that removes some of them, then an amplifier that an envelope opens and closes. VCO into VCF into VCA is the first patch [[Generative Audio Devices]] got sounding — the house bass of 2026-04-20 — and its whole verified registry (VCO, VCF, ADSR, VCA, LFO, a sequencer, two mixers) is a subtractive kit. The fixed synths [[Generative Preset Development]] targets — Ableton Wavetable, Vital, Serum2 — swap the plain oscillator for a wavetable and keep the subtractive back half. The palace has no subtractive instrument of its own; [[Synth Templates]] teaches the ground instead, one card at a time, the house bass first. Subtractive is the ground its generators stand on, not a territory it explores.

### FM — the wiring, at audio rate

One oscillator moves another's frequency fast enough that the wobble becomes timbre. Past about 20 Hz a vibrato stops being heard as motion and turns into new partials either side of the note — the doorway in [[Frequency-Time Duality]]. The sidebands sit at the carrier plus and minus whole multiples of the modulator, weighted by Bessel functions ([[Bessel Functions in Synthesis]]). FM is the plainest case of routing deciding sound: the DX7's six operators wired in 32 algorithms are the same parts in different arrangements, and the arrangement is the timbre ([[Synthesis ↔ Emergence]]). Its topology is picked from a menu, not drawn: the player chooses one of the 32 and plays inside it.

Across the palace FM shows up as a target and as a foil. Dexed, the open DX7 clone, is on [[Generative Preset Development]]'s list, with the deepest machine-learning literature of any synth. [[2D Torus Wavetable Synthesizer]] began as a frustration with FM's comb, whose teeth are always tied to the carrier–modulator ratio. [[Floquet Time-Modulated Loops]] shows FM as one periodically-modulated system among many, the one whose modulation spectrum happens to be Bessel-shaped. The instrument itself — what a two-operator patch is, ratio and index as its two knobs, the algorithms — is on [[FM Synthesis]], with a staged patch built and not yet heard.

### Wavetable — the loop, stored

A stored cycle read round and round by a phase counter: the counter's speed sets the pitch, the cycle's shape sets the timbre, and a Position control travels between frames ([[Wavetable Oscillator]]). This is the palace's busiest family. [[Wavetable Scanner]] is the one-dimensional morph lab. [[Generative Wavetable Libraries]] makes the tables, and the fixed synths in [[Generative Preset Development]] play them. The family's limit is structural: one cycle read by one clock can only make the harmonic series, however it is warped ([[Three Kinds of Warp]]), and most of the palace's wavetable projects are ways past that wall. [[2D Torus Wavetable Synthesizer]] reads a surface with two clocks; when their ratio is irrational the path never closes and the partials leave the harmonic series. [[Murmuration]] sets a flock walking a two-dimensional table, every bird a grain.

### Additive and modal — the crowd, of partials

Build the sound one partial at a time, each with its own frequency, level and decay. [[Inharmonic Wavetable Synthesis]] feeds an additive engine from two tables, one for partial levels and one for partial frequencies; a flat line in the frequency table is the harmonic series, and every bend in it is a material. [[Crystal Synthesizer]] takes its partials and their damping from the vibrational modes of a crystal lattice, [[Quantum Synthesizer]] from the energy levels of a potential well. [[Shepard Tone Synthesizer]] stacks octave-spaced voices under a fixed loudness window, so the pitch climbs forever and never leaves the room. One way to see [[The Curve Is the Material]] is as this family's sub-topology: the partials are a function of partial number with a few parameters, and loading a different function loads different physics. Once each partial carries its own decay, additive becomes modal — a crowd of resonators, where the crowd meets the loop — and the ground under every mode is the damped resonator of [[Resonance and Damping]].

### Granular — the crowd, of grains

Cut sound into grains a few milliseconds to a tenth of a second long and play thousands; the grain is the atom and the cloud is the material ([[Granular Synthesis]]). The palace's granular projects all ask one question: if not a hand on a knob, what decides the cloud's shape? [[Neural Granular Synthesis]] answers a population of neurons, stable only in aggregate. [[Bayesian Granular Synthesizer]] answers the chord the player holds, read as evidence that slowly moves a belief about pitch. [[Particle Synthesis]] answers physics — each grain a particle with mass and drag. [[Murmuration]] answers a flock the player can disturb. [[Shimmer Cloud]] turns the same crowd into a reverb. Granular is where the palace comes closest to topology-emergent without cables: the engine is fixed, and the distribution is grown.

### Physical modelling — the loop, that loses

Model the medium, not the waveform. A string is a delay loop that loses a little on every trip, highs first; excite it and you hear a plucked string ([[Waveguide Synthesizer]]). [[Tract Mirror]] does the same for a voice: a tube of cylinder segments whose junctions are the reflection coefficients of an LPC filter, so the tubes on screen are the filter. [[Portamento and Physical Pitch Modeling]] treats the glide between two notes as a damped system settling — overdamped, critically damped, underdamped, each audibly different. [[Floquet Time-Modulated Loops]] lets a resonator's coefficient move in time, and the Mathieu Resonator, pumped periodically, grows sideband ladders no fixed loop can reach. [[Haptic Handwheel]] would put a physical model in the hand instead of the ear: the same spring Portamento hears, felt through a motor. Under all of them sits the second-order system — a mass, a spring, a loss — and that is the subject of [[Resonance and Damping]].

Physical models lean topology-first, because the medium fixes the wiring, and their knobs stay legible: length, tension, stiffness and loss are quantities a player already understands in the body.

### Sample playback — the content is the instrument

A key chooses a region, the region chooses a file, velocity chooses a layer. The palace's most finished instruments are samplers: [[Phoneme Choir]] and [[Talking Keyboard]], both fruiting, both grown from [[Generative Sample Libraries]]. [[Splice Instrument Forge]] builds Ableton racks from Splice sounds on request. The topology is the simplest in the family and the most completely fixed; everything that varies lives in the content.

One project stands just outside the seven. [[Action Potential Oscillator]] makes an oscillator out of a neuron's equation — charge to threshold, fire, reset, which is a sawtooth and the same maths as an analog ramp core. Its forward vector reaches for a population of coupled neurons where coupling becomes timbre: the crowd again, by way of [[Kuramoto Coupling]].

## What the Family Shares

Seen through the three shapes, most of the palace's live projects sit where two of them cross.

The loop holds wavetable and waveguide together. A cycle read from a table and the same cycle going round a delay loop match sample for sample when the period is a whole number of samples ([[Wavetable Oscillator]]). The torus is two loops at once; a Floquet loop is a loop whose coefficient breathes. [[DSP in Looping Dimensions]] is the principle under all of it. The crowd holds partials, grains, neurons and birds together: many small voices, and the sound is in the sum, not in any one of them. The wiring holds subtractive, FM and modular together: the parts are few and plain, and the routing does the work.

The crossings are where the finds are. [[Murmuration]] is a loop walked by a crowd. [[Inharmonic Wavetable Synthesis]] is a loop that drives a crowd. [[2D Torus Wavetable Synthesizer]] is two loops, and what carries it past FM's comb is what the second loop makes room for: clocks whose ratio never closes, and clocks that pace off each other ([[Three Kinds of Warp]]). Modal synthesis is a crowd of resonators, each one a small loop that loses.

## What Topology Buys, What It Costs

A fixed topology buys a legible space. Every preset is legal by construction; nothing can be wired wrong; a preset is small enough to share and name. It costs reach, and it moves the hard problem from syntax to taste: inside a fixed synth, "musically meaningful" is a small irregular island in a large ocean of numbers, and default values all wear the same blank face ([[Generative Preset Development]]).

A free topology buys reach — any signal flow at all. It costs legibility. A Eurorack patch is harder to load than a Vital preset, because it has to carry the cables and the knobs, and the cables can be right while the sound is dead. [[Generative Audio Devices]] met exactly that in its first Rack audition: structurally correct and audibly inert, every depth knob at zero, invisible to the test harness and obvious to the ear.

Physical models get some of both. Their topology is fixed, but their knobs are physical, so the space stays legible even when it is large.

## The In-Betweens

Each of these commits to a topology at one level and lets variation happen at another.

- **Fixed skeleton, variable flesh.** [[2D Torus Wavetable Synthesizer]] fixes the two-clock scan and lets the surface library vary; nine surfaces now, offered as seeds, not a closed set. [[Inharmonic Wavetable Synthesis]] fixes the additive engine, loads one table and lets the player draw the other.
- **Picked from a menu.** The DX7 fixes 32 wirings and lets the player choose one; the ratios, levels and envelopes are the flesh ([[FM Synthesis]]).
- **Fixed engine, grown distribution.** [[Murmuration]] and [[Bayesian Granular Synthesizer]] fix the grain engine and let a simulation decide the cloud.
- **Constrained drawing.** The player — or a model — draws the patch, but only from verified parts. That is PDL with a registry behind it ([[Registry Pattern]]): the [[VCV Patch Generator]] can wire anything the registry names, and nothing it doesn't.
- **Topology inside a fixed topology.** A Synth Profile in [[Generative Preset Development]] documents the routing choices a fixed synth still leaves open — filters in series or parallel, unison, effect order. The skeleton is fixed; a few joints still bend.
- **Roles without modules.** The archetypes in [[Generative Audio Devices]] name the roles a sound needs and the parameter cloud for each, and never inject a module. They describe a topology without building one.

## Why This Matters for Generative Synthesis

The generative projects split by which level they make. [[Generative Audio Devices]] makes the ground: the topology itself. [[Generative Preset Development]] makes points on a ground someone else drew. [[Generative Sample Libraries]] and [[Generative Wavetable Libraries]] make the flesh a fixed topology plays. Without a topology a preset means nothing; with one, the preset is a point and the topology is the ground.

One way to see it is as [[Lossy Compression with Intent Alignment]]: a preset is a heavily compressed sound, and the topology is the generative model that decompresses it — the shared prior that lets a short list of numbers regrow into a sound. The two generative halves meet where a synth profile becomes one more target for PDL: at that point, as [[Generative Preset Development]] puts it, the profile is the registry.

## Cross-Domain Resonance

The synthesis case is one instance of a wider pattern. In organizations, the same people under a different org chart make a different culture — the same move as the DX7's algorithms ([[Synthesis ↔ Emergence]]). Bourbaki built modern mathematics the same way: take a bare set, lay a structure on it — an algebra, an order, a topology — and the same elements become a different mathematics; the essay that says so is called "The Architecture of Mathematics" (1950). In Martin-Löf's type theory a type says how its members are built, so anything built is well-formed by construction, which is what a fixed topology is to a preset. And Christopher Alexander's *Notes on the Synthesis of Form* (1964) draws a design problem as a graph of requirements that pull on each other, then cuts the graph into parts that can be solved apart; his *A Pattern Language* draws a building from a vocabulary of named patterns, a registry for houses.

## Forward Vectors / Open Questions

- Where does [[Three Kinds of Warp]] fit — are warps topology-preserving or topology-changing?
- Is sample playback a topology at all, or the limit where topology vanishes into content?
- A few projects now name their family here from their own side. The rest this page names could too.
