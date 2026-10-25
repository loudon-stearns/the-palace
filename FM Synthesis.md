---
title: FM Synthesis
type: concept
pillars:
  - creation
  - tools
born: 2026-10
stage: growing
forward_vector: "I want to put a two-operator patch in a reader's hands and let the ear lead: a carrier and a modulator, the index rising until a sine turns to brass, a ratio nudged off a whole number until the brass turns to a bell, a feedback loop pushed until the tone falls into noise. Then I want to show them that the DX7's 32 algorithms were only wirings of that one pair, and that the sound of a decade came out of envelopes drawn by hand on a keyboard nobody could program."
links:
  - target: "[[Frequency-Time Duality]]"
    type: emerged-from
    label: second-doorway
  - target: "[[Bessel Functions in Synthesis]]"
    type: connects-to
    label: holds-the-maths
  - target: "[[Synthesis Topologies]]"
    type: member-of
    label: thirty-two-fixed-wirings
  - target: "[[Resonance and Damping]]"
    type: contrasts-with
    label: drawn-not-damped
  - target: "[[Synthesis ↔ Emergence]]"
    type: exemplifies
    label: two-sines-make-a-bell
  - target: "[[Wavetable Oscillator]]"
    type: connects-to
    label: scope-of-the-fm-question
---

# FM Synthesis

Speed a vibrato up and, somewhere past 20 Hz, it stops being a wobble in the pitch and becomes a change in the tone. That is the threshold [[Frequency-Time Duality]] walks, and the new partials that appear on the far side of it are a two-operator FM patch. John Chowning heard it happen at Stanford in the autumn of 1967, two sine oscillators on a mainframe, a vibrato pushed faster and deeper than any singer's. This page is that instrument: what its parts are, what its knobs do to the ear, and how Yamaha turned it into the sound of the 1980s. The maths of the sidebands, and why their loudness rises and falls the way it does, is in [[Bessel Functions in Synthesis]].

## Carrier and modulator

FM is built from **operators**. An operator is a sine oscillator with its own volume and its own envelope, nothing more.

Wire two of them together. The **carrier** is the one you hear: its output goes to the speaker. The **modulator** is the one you don't hear: its output goes into the carrier and pushes its pitch up and down, as fast as the modulator runs. At a few hertz that push is vibrato. At audio rate it is timbre.

Two knobs come out of that pairing, and almost everything on this page is one of them.

- **Ratio**: how fast the modulator runs compared with the carrier. It decides *where* the new partials go.
- **Index**: how hard the modulator pushes. It decides *how many* of them are loud.

## What the ear hears as the index rises

Hold the ratio at 1:1 and raise the index from zero.

At zero you hear the carrier alone, a sine. Turn it up a little and the tone warms, as if someone breathed on it: the first pair of new partials has appeared, one either side of the carrier, spaced by the modulator's frequency. Keep going and it turns reedy, then brassy, then buzzy, then glaring. As a rough rule, about index-plus-one pairs of partials are loud enough to count, so an index of 4 spreads the sound across five pairs.

It doesn't simply get brighter. Each partial swells and dips in its own rhythm as the index climbs, so a slow sweep shimmers rather than opens. That wobble is the Bessel shape, and its sheet is in [[Bessel Functions in Synthesis]].

The instrument move is to give the index an envelope. Jean-Claude Risset had found that a trumpet gets brighter as it gets louder; tie the index to the loudness and two sines play brass. Let the index fall faster than the loudness and you get the opposite gesture, a bright strike that mellows towards a sine: an electric piano, a marimba, a bell. In FM the envelope on the modulator *is* the timbre over time.

## Ratios

The ratio sorts every FM sound into two families.

When the ratio is two whole numbers, the patch repeats exactly, and a sound that repeats has only harmonics. At 1:1 every harmonic is there, and the sound sits near a sawtooth. At 1:2 only the odd harmonics come through, and it goes hollow, like a clarinet or a square wave. The pitch you hear is the highest frequency that carrier and modulator are both whole-number multiples of, so a ratio of 1:3.5 sounds an octave below the carrier.

When the ratio is not a ratio of whole numbers, 1:1.414 say, the patch never repeats, and the partials fall between the harmonics. That is bells, gongs, struck metal. A ratio a hair away from a whole number, 1:1.003, sits in between: harmonic to the ear, but the partials drift against each other and the tone beats slowly, like a chorus.

This answers the question [[Wavetable Oscillator]] leaves open. [[Three Kinds of Warp]] calls FM "type-1 in disguise", a warp that keeps the harmonic series, and Deep Research says an irrational ratio leaves it. Both are right, and the ratio is the scope: whole numbers keep the series, anything else leaves it. [[Harmonicity and Inharmonicity]] is the wider ground.

## Feedback

Route an operator's output back into its own input and it modulates itself. The DX7 gave each algorithm exactly one such loop, set from 0 to 7.

A little feedback leans the sine towards a sawtooth, and at 7, the DX7's top, it is close to one: every harmonic, from one oscillator, with no partner. Push a loop further than Yamaha let it go and the tone frays, then tips into noise. One operator in a loop is the smallest case of what [[Synthesis ↔ Emergence]] calls circular causation: the output is the input, and the result is something neither the sine nor the loop contained.

## Six operators, 32 algorithms

Yamaha licensed Chowning's FM from Stanford in the 1970s and, in 1983, released the DX7. It had six operators, and you could not patch them. You chose one of 32 **algorithms**, each a fixed wiring diagram printed on the panel.

An algorithm says three things: which operators are carriers (the bottom row, the ones you hear), which modulate which (the stacks above them), and where the one feedback loop sits. Algorithm 1 is a two-operator pair beside a four-operator stack. Algorithm 32 is six carriers side by side with no modulation at all, an additive organ of six sines. Between them are three pairs layered into one sound, so one pair can be the body and another the strike, and single modulators driving several carriers at once.

A stack is where it gets dense. A modulator that is itself modulated is already a rich tone, and pushing a carrier with a rich tone gives far more partials than a pair can.

So the DX7 is a fixed skeleton chosen from a menu: 32 wirings, with the ratios, levels and envelopes as the flesh. That is one of the in-betweens [[Synthesis Topologies]] is collecting, a topology picked, not built. Anyone who wants one now can open Dexed, a free DX7 clone that reads the original sound files, which is also where [[Generative Preset Development]] points.

## Why the 80s sounded like this

Several things at once, and the instrument explains each.

- **It was exact.** Digital oscillators don't drift, so attacks were glassy and clean and sixteen voices stayed in tune with each other, where an analog polysynth of the time drifted.
- **Brightness lived in envelopes, and velocity drove them.** Strike a key harder and the modulators pushed harder, so the sound got brighter as well as louder. A keyboard player's touch came through a digital box for the first time.
- **There was no filter.** Subtractive synths start bright and filter the brightness away. FM starts with a sine and draws the brightness in with the index. A struck bar loses its high partials first because they are damped harder, which is the physics [[Resonance and Damping]] holds. FM has no resonance to damp. It draws that decay by hand, on the modulator's envelope, and the drawing is exact in a way a physical object never is. You can hear the difference: FM bells are cleaner than bells.
- **Nobody could program it.** Around 150 settings per sound, one data slider, a row of membrane buttons and a two-line display. Most players used the factory sounds and bought cartridges, so a handful of patches, E.PIANO 1 and TUB BELLS among them, turned up on record after record. The decade shares a few presets the way an earlier one shared a few guitar amps.
- **It was good at struck things and brass.** Electric piano, bells, marimba, glassy bass, brass stabs: everything whose brightness falls as it decays, or rises as it gets louder. Warm pads and strings it did less well, and that gap is part of why the end of the decade layered FM with samples.

## Origin

Minted 2026-10-25, from the second of [[Frequency-Time Duality]]'s three doorways, which pointed at the territory and at [[Bessel Functions in Synthesis]] for the maths but had no page for the instrument. Written from the doorway inward: the doorway's own claim first, then the two knobs, then the algorithms. Carried off the Palace To-Do at its retirement, on Loudon's call of the same day.

## Forward Vector

- **Hear the patch.** A two-operator rough sits in this page's workshop: ratio, index, feedback, and a strike that lets the index fall faster than the volume. It wants Loudon's ears before it becomes part of the rich face.
- **Draw the algorithms.** Three of the 32, numbers 1, 5 and 32, as technical diagrams beside the section that describes them ([[Technical Diagram Standard]]).
- **Phase or frequency.** The DX7 actually pushes the carrier's phase, not its frequency. To the ear the two give the same family of sounds; whether the page owes the distinction more than this line is open.
- **Where the threshold sits.** The Duality asks whether its 20 Hz zones fall in the same place on every axis. FM is where to measure it on the modulation axis: at what modulator rate does a listener stop hearing vibrato and start hearing tone?

---

*"I was searching for sounds that had some internal dynamism."* — John Chowning, in Yamaha's *Discovering Digital FM*
