---
title: Wavetable Oscillator
type: concept
pillars:
  - tools
  - creation
born: 2026-10
stage: sprout
forward_vector: "I want to meet every reader who arrives asking about wavetables: say what the oscillator is in plain words, hold the harmonic limit to a few sentences that point at their proof, send each reader on to the entry that pushes past it, and get the loop identity heard, a stored cycle and a delay loop subtracting to silence."
links:
  - target: "[[DSP in Looping Dimensions]]"
    type: exemplifies
    label: one-loop-case
  - target: "[[Three Kinds of Warp]]"
    type: connects-to
    label: obstruction-theorem
  - target: "[[Dispersion Table]]"
    type: enables
    label: loop-is-the-cycle
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: the-lossy-loop
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: connects-to
    label: second-clock
  - target: "[[Wavetable Space as Torus]]"
    type: connects-to
    label: two-circles
  - target: "[[Floquet Time-Modulated Loops]]"
    type: connects-to
    label: second-clock-by-modulation
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: connects-to
    label: tables-as-control
  - target: "[[Generative Wavetable Libraries]]"
    type: connects-to
    label: fills-its-tables
  - target: "[[1D Wavetable Scanning]]"
    type: connects-to
    label: the-frame-axis
  - target: "[[Wavetable Synthesis — Deep Research & Higher-Dimensional Design]]"
    type: connects-to
    label: history-and-engineering
---

# Wavetable Oscillator

A wavetable oscillator stores one cycle of a waveform and reads it around and around. A phase counter, the oscillator's clock, steps forward many thousands of times a second, wraps when it reaches the end of the cycle, and the value it lands on is the output. The shape of the stored cycle sets the timbre. How fast the counter goes round sets the pitch.

Most instruments stack many cycles, called frames, into a table and add a Position control that blends between neighbouring frames. That was Wolfgang Palm's move at PPG in 1978: store many waveforms and move between them, so timbre stops being a property of the sound and becomes a place you can travel through.

## The same object as a loop

A delay line is a memory that plays back whatever went into it a fixed time ago. Feed its output straight back into its input, losing nothing, and whatever is in it comes round again unchanged, once per trip. That is a stored cycle being read around and around: the loop's contents are the cycle, and the time for one trip is the period. [[Dispersion Table]] rests on this identity.

The two differ in how they change pitch. The oscillator reads faster; the loop gets shorter. Sample for sample they match only when one trip is a whole number of samples. In between, the loop needs a small filter to land between samples. [[Waveguide Synthesizer]] starts from a loop that loses a little each trip, highs first, which is a plucked string.

## Why it can only be harmonic

Any one frequency in a sound is called a partial. One fixed cycle, read by one counter, repeats exactly, and a signal that repeats exactly contains only a lowest partial, the fundamental, and whole-number multiples of it, the harmonics. Reshaping the read does not change that. Bend it or distort it: as long as every trip still takes the same time, energy moves among the harmonics and nothing lands between them.

So one looped cycle cannot sound inharmonic. A bell's partials are not whole-number multiples of one fundamental. Loop one cycle of a bell and you hear the harmonics of the loop, not the bell.

The claim is narrow on purpose: one fixed cycle, one counter, nothing in the loop but delay. The proof is the 1D obstruction theorem in [[Three Kinds of Warp]]. The principle it is one case of, each loop adding one independent fundamental, is [[DSP in Looping Dimensions]]. The bell is from Part IV of [[Wavetable Synthesis — Deep Research & Higher-Dimensional Design|Deep Research]].

## Directions from here

Three of these push on that claim. The last stays inside it.

- **A second clock.** Read a surface with two counters instead of a line with one. The output frequencies are whole-number combinations of the two rates, and when the ratio of the rates is irrational the path never closes and those combinations no longer fall on one harmonic series. [[2D Torus Wavetable Synthesizer]] is the instrument. [[Wavetable Space as Torus]] is the geometry, and it starts by treating phase and frame position as two circles. [[Three Kinds of Warp]] sorts warps by what they keep and what they break, and two of its three kinds need the second clock. [[Floquet Time-Modulated Loops]] gets its second clock another way: one delay loop whose coefficient is modulated periodically. Two entries turn the idea around. [[Rank-N Lattice Analysis]] asks how many independent fundamentals a recorded sound needs, and [[Volterra Kernels and the Torus]] reads the same kind of surface with an input signal's own past instead of counters.
- **A filter in the loop.** A loop filter that delays some frequencies more than others moves the resonances off the whole-number grid. [[Dispersion Table]] stores such filters' phase curves the way a wavetable stores waveforms.
- **The table as control data.** [[Inharmonic Wavetable Synthesis]] does not play its tables as audio. One sets how loud each partial is, the other sets how far each partial sits from its harmonic position, and an additive engine makes the sound. [[The Curve Is the Material]] argues the second table should default to a small library of physical functions, not a drawn curve.
- **Staying inside one loop.** With Position still, the claim holds exactly. Sweep Position slowly and the same harmonics change in strength. Drive it fast, at a rate unrelated to the pitch, and Position has become the second clock above. Short of that, the work is in the tables and the sweep. [[Generative Wavetable Libraries]] is the pipeline for making tables. [[1D Wavetable Scanning]] holds what the first scanner build taught about blending and frame order, and [[Wavetable Scanner]] is that build.

## Building one

The engineering is in Part II of [[Wavetable Synthesis — Deep Research & Higher-Dimensional Design|Deep Research]]: the phase increment, band-limited copies of each cycle so high notes do not alias, and interpolation. For blending between frames the palace has a house rule, recorded in [[Quadratic Interpolation in DSP]]: linear is enough for a simple scanner, and the higher-dimensional designs start at cubic. Reading a fractional sample inside a frame has not been measured here yet.

## Origin

Minted 2026-10-06, after a survey of the palace's wavetable entries found the ground stated only inside longer pages, never on its own. [[Dispersion Table]] had asked for this page by name since June.

## Forward Vector

- **Hear the identity.** A cycle read from a table and the same cycle going round a delay loop, at a whole-sample period, subtracted. Silence is the proof. Until that exists the identity on this page is argued, not heard.
- **The FM question.** Frequency modulation has two rates, a carrier and a modulator. By the second-clock rule above, an irrational ratio between them leaves the harmonic series, which is what Deep Research says. [[Three Kinds of Warp]] calls FM "type-1 in disguise," its name for warps that keep the harmonic lattice. One of those lines needs its scope stated.

---

*"Fourier's Theorem … is not only one of the most beautiful results of modern analysis, but it may be said to furnish an indispensable instrument in the treatment of nearly every recondite question in modern physics."* — William Thomson and Peter Guthrie Tait, *Treatise on Natural Philosophy* (1867)
