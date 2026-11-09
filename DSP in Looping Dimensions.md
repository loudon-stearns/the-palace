---
title: DSP in Looping Dimensions
type: concept
pillars:
  - tools
  - philosophy
  - practice
born: 2026-04
stage: growing
forward_vector: "I want to map the whole arena of DSP in looping dimensions: every oscillator, filter, effect and analysis that is a loop or a meeting of loops, what each meeting makes, and where it breaks. Then loops become a way to understand all of DSP, not one corner of it. I want every claim on me tested by something you can hear, and the open ones settled first: whether a twisted path can bend the lattice, and where loops that push back lock. And I want a student who cannot picture a fourth dimension to find they have already heard one."
links:
  - target: "[[Frequency-Time Duality]]"
    type: mirrors
    label: rhymes-with
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: locks-when-self-sustaining
  - target: "[[Wallpaper Groups]]"
    type: connects-to
    label: shares-symmetry
  - target: "[[Categorizing Inharmonicity]]"
    type: enables
    label: lattice-foundation
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: contrasts-with
    label: a-loop-per-partial
  - target: "[[Piano String Inharmonicity]]"
    type: contrasts-with
    label: eigen-not-lattice
  - target: "[[Three Kinds of Warp]]"
    type: connects-to
    label: the-type-3-question
  - target: "[[Harmonicity and Inharmonicity]]"
    type: connects-to
    label: snap-or-fray
  - target: "[[VST Template]]"
    type: connects-to
    label: instruments-to-build-from
  - target: "[[Generative Audio Devices]]"
    type: connects-to
    label: devices-it-could-generate
---
# DSP in Looping Dimensions

![[DSP in Looping Dimensions — hero.png]]

One loop makes a harmonic series. Everything on this page follows from asking what happens with more than one loop, and the answer turns on a single question: **where do the loops meet?** Read together through one table, they make new frequencies. Placed in a row, they make new times. Bend one and it stretches. Let them push on each other and they lock. The sound you get depends on which of these you build, and so does the geometry you are drawing in.

It began with kinds of inharmonicity. A piano string, a bell and an FM patch are all "inharmonic", but in different shapes, and FM's shape is not the piano's. It grew into a wider claim: a great deal of DSP is loops, and where they meet. Oscillators, filters, effects and analysis all have a place on this map, and the inharmonicities are one region of it.

## One loop

A loop is anything that comes back to where it started: a phasor reading a wavetable, a delay line fed back into itself, a string between two fixed ends. Whatever you put in it repeats once per trip, so its spectrum is one fundamental and its whole-number multiples.

f = k / T

(a frequency the loop can hold) = (any whole number) / (the time of one trip)

![[one-loop-harmonic-series.svg|A feedback comb drawn three ways: a delay with its output wired back to its input, the same loop as a heavy circle beside a wrapping phasor, and a magnitude response with equal peaks at every whole multiple of 1/T]]
*Every frequency one loop can hold is a whole number of cycles per trip, so one loop gives one fundamental and its whole-number multiples, and nothing else.*

A wavetable oscillator is a loop that has stopped travelling: a lossless delay line fed back on itself *is* a scanned table, sample for sample when its length is a whole number of samples ([[Dispersion Table]], [[Wavetable Oscillator]]). A comb filter, a Karplus-Strong pluck and a waveguide are the same loop with a filter and some loss in it. They all share the harmonic limit, and they all share it for the same reason.

## Where the loops meet

Give a sound two loops, with times T₁ and T₂ whose ratio is irrational. They can be read together, put in a row, or left to push on each other; and any one loop can be bent. Those four moves each leave their mark somewhere different.

![[where-the-loops-meet.svg|Four rows, each shown as a circuit, as loops and as a sound: two phasors into one table become a torus and a lattice of lines; two feedback combs in a row become two circles and a lattice of echoes in time; a loop with an allpass becomes nested rings and a stretched series; two self-sustaining loops joined by a spring lock with hysteresis, measured]]
*The wire that comes back is the circle: where the loops meet, not how many there are, decides whether the lattice lands in frequency, in time, in a stretch or in a lock.*

**1. Read them together through one table: a lattice in frequency.** Two phasors index one wavetable on a torus, and the output holds every whole-number mix of the two fundamentals.

f = m · f₁ + n · f₂

(a partial) = (any whole number) × (first loop's fundamental) + (any whole number) × (second loop's fundamental)

That is a rank-2 lattice of partials, and only a product makes it: one table read at two phases, a ring modulator, a nonlinearity. FM is one row of this lattice (the carrier plus or minus whole multiples of the modulator). A torus scan is the whole plane. Add loops and the lattice gains a dimension each time. This is the frame the page's principle is really true of, and it is the [[2D Torus Wavetable Synthesizer]]'s ground.

**2. Put them in a row: a lattice in time.** Two combs one after the other are linear. A linear system cannot invent a frequency it was not given, so the pair keeps each loop's own series in frequency and nothing between. The lattice is still there, but it moved: the echoes land at every j·T₁ + k·T₂. The face measured both: the comb pair's mixed points at the noise floor, its first thirty echoes on the time lattice within 0.02 ms. Multiply in time and you convolve spectra; multiply spectra and you convolve in time. The lattice lives in whichever domain the multiplication happens in. That is this page's rhyme with [[Frequency-Time Duality]], made exact.

**3. Bend a loop: a stretched series.** Put a filter in the loop whose phase depends on frequency, and the partials no longer land on whole multiples. They slide to wherever the round trip closes, which is dispersion, and it is how a stiff string sounds:

fₙ = n · f₀ · √(1 + B · n²)

(the nth partial) = (partial number) × (fundamental) × √(1 + (stiffness) × (partial number)²)

This is not a lattice, and no handful of loops multiplied together will make it. Stiffness is linear: it is a wave speed that depends on frequency, so the stretch is the medium's own resonance, not a product of clocks ([[Piano String Inharmonicity]]). An allpass inside a feedback loop does it, and storing the bends as a table lets one knob walk from pure to piano to bell ([[Dispersion Table]]). The allpass has to be in the loop. Outside it, a filter only moves phases, and a harmonic tone stays harmonic.

So there are two kinds of inharmonicity, and this page is where they part ([[Categorizing Inharmonicity]] catalogues both). **Lattice inharmonicity** comes from multiplying loops: FM, ring modulation, the torus scan. **Eigen-inharmonicity** comes from a medium's own resonances: stiff strings, membranes, dispersive loops. A loop per partial reaches it too, because a sum can place each line wherever it likes ([[Inharmonic Wavetable Synthesis]]). FM cannot make a piano: its knobs move a lattice, and a piano's partials are not one. [[Three Kinds of Warp]] reaches the same verdict another way: FM has no knob that touches the lattice's generators the way B would need. A lattice can come close: the palace's one measured piano from a scan lands all 24 partials within 5.5 cents, but every line is still a harmonic plus whole scan steps ([[Floquet Time-Modulated Loops]], the 2026-11-04 cycle-9 entry). Whether a twisted path on the torus can bend the lattice itself, rather than approximate the stretch, is open. The palace's own warp typology says a steady scan on any surface stays lattice-bound, and no twisted path has yet been built and heard.

![[two-kinds-of-inharmonicity.svg|Two rows compare FM and a stiff string as circuit, loop and sound; on one shared cents scale the FM partials scatter around zero with no trend, while the piano's partials rise smoothly from 0.35 to 266 cents]]
*FM moves points around a lattice and a stiff string bends one series, so the scattered dots can never line up into the piano's smooth curve.*

**4. Let them push back: locking.** Loops that ring down, like plucks and combs, slide when coupled. Their modes drift smoothly toward one series as you turn the knob, and halving the step about halves the change (the face's snap-or-slide piece). Loops that keep themselves going, like a bowed string, a feedback loop or an oscillator, behave differently. Near unison they pull together and then stop slipping all at once. At the golden ratio a pair jumps to a new mode, and it jumps back at a different place on the way down. Loudon heard it jump up at c ≈ 0.27 and down at c ≈ 0.20, and the measurement agrees: up at 0.28, down at 0.19. Above the jump both loops share one tone at 1077 Hz, near the 5th partial of one and the 8th of the other: they settle on 8 : 5, a Fibonacci ratio close to the golden one (the proof is in this page's bundle, `DSP in Looping Dimensions/proofs/2026-11-05-sustained/`). That gap is memory, and only a nonlinear system has it. The 2D Torus scan measured the same kind of snap between its own coupled phasors, though no gap was measured there: shimmer, then hiccups, then a lock at 0.80 Hz of coupling ([[2D Torus Wavetable Synthesizer]], cycle 7). And it has a limit: in a stretched tone, six partials lose their lock in a snap, but forty fray instead ([[Harmonicity and Inharmonicity — scroll|Harmonicity and Inharmonicity]]'s scroll). This is where [[Kuramoto Coupling]] lives in DSP: shimmer to lock as a real bifurcation, but only between loops that sustain themselves. Coupling settles a near ratio into an exact one; it does not invent a ratio.

## The arena

Most of DSP is a loop, or a meeting of loops: the ones that make sound, the ones that shape it, and the ones that read it back. Sorted by how their loops meet, they fall into the same few kinds.

![[the-arena-of-loops.svg|A map of five framed zones, read together, in a row, bent, one loop and push back, each with a heavy loop glyph; the nineteen DSP methods from the table sit inside as chips tagged make, shape, read or follow, and four grey chips straddle the borders]]
*Oscillators, effects and analysis are not three trades but one: sorted by how their loops meet, all nineteen fall into the same five kinds of meeting.*

| Role | Method | Its loops | Where they meet | What you get |
|---|---|---|---|---|
| make | Wavetable oscillator | 1 | — | a harmonic series |
| make | Step sequencer, LFO, looper | 1, slower than pitch | — | rhythm: the same loop below the range where it is heard as a note |
| make | Comb, Karplus-Strong, waveguide | 1, with loss | — | a harmonic series that decays |
| make | Negative-feedback comb, clarinet | 1, flipped | — | an odd half-series (Möbius) |
| make | Hard sync | 2 | one resets the other | the harmonic series of the master |
| make | FM, phase modulation, ring mod | 2 | a product | one row of the lattice |
| make | Torus wavetable, Tᴺ scan | N | one table | the full lattice |
| make | Symmetric surfaces | 2 | one table, with a symmetry | only the (m, n) its [[Wallpaper Groups\|wallpaper group]] allows |
| make | Additive, modal banks | many | a sum | any series, the piano exactly |
| make | Bowed string, feedback network | N, self-sustaining | nonlinear coupling | locking, mode jumps, hysteresis |
| shape | Waveshaping (Chebyshev) | 1, read through a curve | the diagonal | harmonics of a sine input ([[Chebyshev is Fourier]]) |
| shape | Allpass dispersion, stiff string | 1, bent | its own filter | a stretched series (piano) |
| shape | Chorus, flanger | 1 delay, its length moving | time | sidebands around each partial ([[Floquet Time-Modulated Loops]]) |
| shape | Combs in series, FDN reverb | N, linear | a row or a matrix | each series kept, echoes on a time lattice |
| shape | Volterra distortion, dynamic convolution | N | the input's own past | intermodulation shaped by a stored field ([[Volterra Kernels and the Torus]]) |
| read | Pitch detection, autocorrelation | 1, fitted | — | the period of one loop, read back from sound |
| read | Rank-N lattice analysis, modal analysis | N, fitted | — | the loops' generators, read back ([[Rank-N Lattice Analysis]]) |
| read | Linear prediction | 1, with a filter | — | the loop's filter, read back from a voice ([[Linear Predictive Coding]]) |
| follow | Phase-locked loop | 2, one self-sustaining | nonlinear coupling | an oscillator that locks to the input's pitch |

Reading the table down a column is the point. Most rows sort into the four meetings above, or into one loop alone; four straddle two. "What you get" says which of the page's sounds each one can reach, and which it cannot.

## What it does excellently

- **One control crosses the line between harmonic and inharmonic.** Set the ratio between two loops and you choose a spectrum. At a simple ratio the scan closes and the lattice folds onto one series; just off it, each partial slides away slowly. The rational ratios are gates you can hear.
- **Every partial knows its address.** A lattice partial is m·f₁ + n·f₂, so a sound made this way can be read back: count its generators and you have its rank ([[Rank-N Lattice Analysis]]). Synthesis and analysis are one stored field read in two directions.
- **The table is the timbre and the path is the note.** What you store decides the colour. How you travel through it decides pitch, motion and inharmonicity. These are separate controls, and most synthesis methods tangle them.
- **The lattice is a crystal's.** A T³ table is a triply periodic function, the same object as a crystal's structure, MRI's k-space or cosmology's density field. Scan one and you hear it.
- **One field, many machines.** Scan the same field with phasors and you have an oscillator. Index it with the input's own past and you have a distortion, a dynamic convolver, a ring modulator ([[Volterra Kernels and the Torus]]). The reader makes the genre.

![[ratio-sweep-gates.svg|Lattice partials m plus n times r drawn as straight lines across ratios from 1.30 to 1.75, converging at dashed gates at 4/3, 3/2, 8/5 and 5/3 and not at the golden ratio; above them, mini tori show closed knots at 3/2 and 5/3 and an open, filling path at the golden ratio]]
*Turning one ratio knob carries the sound across gates where the scan closes and its partials fold onto one series; at the golden ratio the scan never closes and nothing folds.*

## What is unique about more loops

"Dimension" means two things in synthesis. Here it means a loop scanned at audio rate. Elsewhere it means a control axis you crossfade by hand, as in the Prophet VS or a timbre cube ([[Wavetable Synthesis — Deep Research & Higher-Dimensional Design]]). This page is about the first.

A single loop has one thing to vary: its length. Two or more loops have a relationship, and the relationship is where the new sounds are. Rational or irrational, locked or drifting, read together or in a row, twisted or flat: none of these questions exists for one loop. And the space of relationships has topology. A path that winds p times one way and q times the other is a (p, q) torus knot, and the winding numbers do not change when the speed does. Whether that invariance is audible is an open listening test ([[Wavetable Space as Torus]] § Open Questions).

![[torus-knot-closed-and-open.svg|Two rows of circuit, loop and sound: at 2 to 3 the two-phasor table traces a trefoil knot on a torus and its spectrum lands on one harmonic series; at the golden ratio the path winds twelve times without closing and most lines fall between the harmonics]]
*Change only the ratio of two phasors and the path either closes into a knot you hear as one harmonic series, or never closes and spreads into a lattice.*

## Strange geometries

The torus, Tᴺ, is the flattest looping space: N independent circles. Other shapes loop differently, and each has a sound.

![[mobius-loop-odd-half-series.svg|A comb with inverted feedback drawn three ways: a delay wired back through a gain of minus a, a Möbius band whose traced path needs two laps to close, and a spectrum with peaks at 120, 360, 600 and 840 Hz falling between dashed lines at 240, 480 and 720 Hz]]
*A loop that turns its signal upside down each trip only comes home after two, so it sings the odd harmonics of half its own frequency.*

- **The Möbius loop.** A loop that flips its sign on every trip has to go round twice to come back. A comb with negative feedback does exactly this: a 240 Hz loop rings at 120, 360, 600 Hz, the odd harmonics of half its frequency (computed for this page). A clarinet's odd harmonics come from the same thing, a flip at one end of the bore and not the other, and so does the face's lossless mixer's odd half-series. The Möbius strip is already in every inverting feedback loop.
- **Quasicrystals.** Slice a periodic lattice in high dimension along an irrational angle and you get order without repetition. A torus scan at irrational rates *is* that slice in one dimension: a quasicrystal in time ([[Wavetable Space as Torus]] § Quasicrystals). Surfaces drawn from higher-dimensional sources reach toward the five-fold symmetry no periodic crystal can hold; the 2D Torus's Penrose table approximates it.
- **Higher-genus surfaces.** A surface with g handles has 2g independent cycles, and its natural vibrations are not clean exponentials. Their spacing is irregular but has statistics of its own. A table drawn on such a surface (the Bolza surface, genus 2) would sound its shape.
- **Hyperbolic surfaces.** Their vibrations are tied to number theory, and the lengths of their closed paths predict their spectra (Selberg's trace formula).
- **Lie groups and the Hopf fibration.** SU(2) is the 3-sphere, not T³. Scanning it means multiplying rotations rather than adding angles, and its natural basis is indexed by spin. The Hopf fibration lays the 3-sphere out as linked circles over a sphere, and every torus knot lives on one of its tori ([[Wavetable Space as Torus]] § The Hopf Fibration).

The Möbius loop and the quasicrystal slice are already in hand: every inverting comb and every irrational scan is one. Of the curved shapes beyond them, only the Hopf fibration has been built here, as the 2D Torus's control surface, and it has not yet been heard. Genus-2, hyperbolic and SU(2) tables are named, not entered.

## The limits

- **No noise, no clicks.** However many sustained loops you add, the spectrum is discrete in the spectral sense: single lines only, dense on the frequency line once two rates are irrational, but never a continuous spread. Broadband noise and true transients have energy spread continuously, and no finite set of loops reaches them. They need another layer.
- **Dense lattices take time to hear.** The lines get closer as loops are added, so you must listen longer to tell them apart. With six loops, a five-and-a-half-second window cannot part them all (the face's listen-longer piece). The limit holds in the mathematics; how long you listen decides when it shows.
- **Steady paths only make lattices.** A table scanned at constant rates makes lattices, on any surface. Piano-like stretching needs a bent loop or a loop per partial; a lattice only approximates it, and a solved piano surface fits one note: a semitone up, 4 % of its power goes astray ([[Floquet Time-Modulated Loops]]).
- **Linear loops make no new frequencies.** Combs, reverbs and plucks rearrange what they are given. If you want combination tones, something has to multiply.
- **The table runs out of room.** A table with r samples per axis holds about r/2 harmonics per loop, and its size grows as rᴺ. Three loops at 256 per side is 64 MB; six loops at 32 per side is 4 GB and still only 16 harmonics per loop.
- **Fast paths alias.** A diagonal path reads every axis at once, and lattice points above half the sample rate fold back. Band-limiting a scan on Tᴺ is harder than mip-mapping one table.
- **Control is the hardest problem.** A knob per dimension is not an instrument. Finding the few controls that make a high-dimensional space playable is open ([[Rank-N Lattice Analysis]] § Forward Vectors).

![[limits-memory-and-listening.svg|Two panels: table size on a log scale against loops one to six for 32 to 256 samples per axis, marking 64 MB at three loops and 4 GB at six; and the share of energy in the loudest tenth of bins against window length, where one and two loops climb to 100 percent, six loops creep from 40.7 to 51.2, and noise stays flat near a third]]
*More loops cost twice: the table grows as r to the N, and the lines crowd so close that five and a half seconds of listening cannot part six loops, though the mathematics never lets them become noise.*

## What a modern computer changes

- **Reading the table is cheap; storing it is not.** Multilinear reading costs 2ᴺ samples per output sample: 8 for three loops, 64 for six. A CPU does that for many voices. Memory and cache are what bind.
- **So store the lattice, not the table.** Keep only the partials you want, as m·f₁ + n·f₂ with an amplitude each, and sum them. Thousands of partials per voice should be within reach of SIMD or a GPU, though the palace has not measured it, and the dimension stops costing memory.
- **Or store a learned field.** A small neural network could stand in for a smooth function on Tᴺ and be sampled at any resolution: a compressed table that does not grow as rᴺ. It is an idea here, not yet a build.
- **Fit tables from sound.** Record a sound and fit its lattice, or find it has none; where one fits, play the fitted field back: the analyser and the synthesizer become one round trip ([[Rank-N Lattice Analysis]]).

## Open research

- **Can a path bend the lattice?** Build a twisted path on the torus, where each loop's speed depends on where the other is, and measure whether its partials leave the lattice or only find new generators. This settles whether paths can reach the piano or only bends can ([[Three Kinds of Warp]], the type-3 audit).
- **Hysteresis as a playing gesture.** Self-sustaining loop networks remember which way the knob came from. Map their jumps and their gaps, and design an instrument that uses memory on purpose.
- **Band-limited scanning on Tᴺ.** An anti-aliasing scheme for diagonal paths through a multidimensional table.
- **Non-diagonal Volterra processors.** Read a stored field along an input-driven path that is not the diagonal, and hear the intermodulation the usual distortion discards ([[Volterra Kernels and the Torus]]).
- **Time-modulated loops.** Loops whose length is itself periodic open sidebands in their own regular structure ([[Floquet Time-Modulated Loops]]).
- **Rank and the ear.** Does measured rank track how inharmonic a sound seems? Are the winding numbers audible?
- **Surfaces that are not tori.** Tables on genus-2, hyperbolic and SU(2) spaces, and what their spectra sound like.

## Hearing a dimension

This page is also a way to teach higher dimensions to people who cannot picture them. Nobody can see four dimensions; anyone can hear four loops. Each loop is an axis you can listen for. A simple ratio is a closed knot you can hear repeat. A dense lattice is a surface filled in, and a long listen is how you walk across it. Starting with sound, the geometry stops being a picture you have to imagine and becomes something you have already heard.

![[hearing-a-dimension.svg|Four columns, one to four loops: a circle, a torus filled by a golden-ratio path, a cube whose opposite faces are glued with a straight path wrapping through it, and a box reading no picture, only the sound; under each, a spectrum on the same axis with 4, 18, 56 and 134 lines]]
*Each added loop adds an axis to the lattice, so the spectrum keeps filling in after the pictures run out: four loops have no image, only a sound.*

## Forward Vectors

- **Higher-Dimensional Convolution** is the first child, and now it has a centre: the lattice lives in whichever domain the multiplication happens in.
- The twisted path is the test that decides whether more loops can reach the sounds this page was born for, or whether only a bend can.
- The self-sustaining loops of 2026-11-05 want a piece on the face beside snap or slide.

---

> *"God made the integers; all else is the work of man."* — Leopold Kronecker
> *(and the irony that his most famous theorem is about what the irrationals do that the integers cannot)*
