---
title: "Quantum Synthesizer — tuning"
born: 2026-11-01
links:
  - target: "[[Quantum Synthesizer]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Quantum Synthesizer's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Quantum Synthesizer about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Quantum Synthesizer — tuning

What Quantum Synthesizer's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-01, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 19 — 2026-11-01

1. **Proposed for canon** · 2026-11-01 · [[Quantum Synthesizer]] · § Hermite-Gaussian Basis Functions as Spectral Shape: replace the second and third paragraphs (from 'When you sonify a quantum eigenstate' through the bold line); the first paragraph stays · canon change owed *(proposed by the steward, cycle 19)*
   Why: Loudon said LAND-ALL on 2026-10-15. hermite.py's three checks show φₙ's n nodes don't mean n+1 partials, and the wavetable reading is where the entry's best sentence turns out to be exactly true. Evidence: proofs/hermite-checks.txt.
   Path: `Projects/Quantum Synthesizer.md`
   > Sounded honestly, an eigenstate is a single pitch. It is called *stationary* because nothing about it moves except one turning phase, at one frequency set by its energy Eₙ. Its n nodes don't add partials; they say which rung of the ladder it stands on. Let φ₅ evolve and listen anywhere in the well, and you hear one sine wave, if your ear could hear phase. To any real measurement it is perfectly still.
   >
   > Read the same shape as one cycle of a waveform, a wavetable, and something stranger turns out to be exactly true. A Hermite-Gaussian is its own Fourier transform. So the spectrum of φₙ played as a wave has the shape of φₙ itself: a Gaussian's spectrum is a Gaussian, the spectrum widens like √(2n+1) as the shape does, and the n nodes in space come back as n holes in the spectrum, mirrored about 0 Hz (an odd state's centre node becomes a missing DC). Here, and only here, the spatial structure of the wavefunction *is* the spectral structure of the sound ([hear the three readings](Projects/Quantum Synthesizer/proofs/hermite.mp4)). **The geometry of confinement chooses the shapes; the equation turns shapes into pitches.**
2. **Proposed for canon** · 2026-11-01 · [[Quantum Synthesizer]] · § Quantum Operators as Musical Transforms: replace all three paragraphs · canon change owed *(proposed by the steward, cycle 19)*
   Why: Loudon said LAND-ALL on 2026-10-15. ladder.py's seven checks: a† on one rung moves it rather than adding an overtone, a leaves a coherent state unchanged, and collapse silences instead of filtering. Evidence: proofs/ladder-checks.txt.
   Path: `Projects/Quantum Synthesizer.md`
   > The creation operator $\hat{a}^\dagger$ moves a state up one rung, $\hat{a}^\dagger|n\rangle = \sqrt{n+1}\,|n+1\rangle$, and the annihilation operator $\hat{a}$ moves it down one. On a single rung that is a transposition, not an added overtone: one pitch becomes the next pitch up. Chords only exist in superpositions, and there the operators behave strangely. A coherent state, the quantum version of a swinging pendulum, is the eigenstate of $\hat{a}$: removing a quantum from it leaves it exactly as it was, so the sound does not change at all. Adding a quantum does change it, but by re-voicing the whole chord, not by adding a note.
   >
   > What you hear depends on which ear you use, and the difference is the physics. An ear that could hear the phase turning would hear each rung as one sine at $E_n = \hbar\omega(n + \tfrac{1}{2})$: the odd harmonics of half the oscillator's frequency, the clarinet's series, with the zero-point ½ making them odd. No such ear exists, because only phase differences are physical. A real detector hears $|\psi|^2$, the chance of finding the particle at one place, and that hears only differences between rungs: whole multiples of $\omega$, the ordinary harmonic series. To a detector a single eigenstate is perfectly still. Two rungs beat at their difference; a packet swinging in the well is a full harmonic tone ([hear both ears, move by move](Projects/Quantum Synthesizer/proofs/ladder.mp4)).
   >
   > So measurement collapse is not a resonant filter. A filter keeps a band of a moving signal and lets it ring. Measuring the energy keeps one rung, and one rung, to anything that can hear, does not move. Collapse doesn't tune the sound; it stops it. The nearer synthesis picture is the energy *spread*: the wider the spread of rungs a state holds, the more partials its motion has.
3. **Proposed for canon** · 2026-11-01 · [[Quantum Synthesizer]] · § The Isomorphism: Wave Functions as Sound: replace the two paragraphs after the equation (from 'The imaginary unit $i$ is not a mathematical convenience.' through '…RLC resonant circuit.'); the equation stays · canon change owed *(proposed by the steward, cycle 19)*
   Why: Loudon said LAND-ALL on 2026-10-15. wick.py's four checks: without i nothing escapes, each level is one lossless pole and not a conjugate pair, and turning i gives every partial the same damping ratio. Evidence: proofs/wick-checks.txt.
   Path: `Projects/Quantum Synthesizer.md`
   > The imaginary unit $i$ is not a mathematical convenience. It turns time into rotation: each energy level $E_n$ comes back as a phase spinning at its own rate, $e^{-iE_nt/\hbar}$, and none of them ever slows down. Take the $i$ away and the same equation becomes the heat equation. Nothing spins any more; every level just fades, the high ones fastest, until only the ground state's shape is left. Between those two lies a dial. Turn the time axis by an angle θ, and every level both rings and decays ([hear the dial turn](Projects/Quantum Synthesizer/proofs/wick.mp4)).
   >
   > In filter language, each level is a single resonator pole sitting exactly on the imaginary axis: an oscillator with no loss at all. The Schrödinger equation is a bank of them, one per level, an RLC circuit with every resistor set to zero. Turning *i* by θ swings every pole the same angle off the axis, which gives every partial the same damping ratio, sin θ. So every partial rings for the same number of its own cycles, and the fast ones die first. In a box, where the levels climb as the squares, the ninth partial dies 81 times sooner than the fundamental. At a few hundredths of a degree that is a struck bell. At 90° it is a thud.
4. **Proposed for canon** · 2026-11-01 · [[Quantum Synthesizer]] · § Anharmonicity through Potential Shaping: replace the last paragraph ('Similarly, a struck bell or tam-tam…forces inharmonic eigenmodes]].') · canon change owed *(proposed by the steward, cycle 19)*
   Why: Loudon said LAND-ALL on 2026-10-15. drum.py's five checks show a drum has no potential and that the second dimension breaks the series, while under Schrödinger only the circle stays inharmonic. The last sentence is founders' lore the script didn't measure, so cut it if it reads unearned. Evidence: proofs/drum-checks.txt.
   Path: `Projects/Quantum Synthesizer.md`
   > A drum is the same story one dimension up, and it sharpens the claim. Stretch the string into a skin and the harmonic series breaks. A round drum's partials sit at 1 · 1.59 · 2.14 · 2.30 · 2.65, the zeros of Bessel functions. A square drum's sit at 1 · 1.58 · 2 · 2.24 · 2.55, the square roots of whole numbers. Neither tone ever repeats ([seven strikes](Projects/Quantum Synthesizer/proofs/drum.mp4)). So for a drum it isn't the circle that breaks the series. It's the second dimension. Schrödinger draws the line somewhere else. A square box squares those roots back into whole numbers, 2 · 5 · 8 · 10 · 13, and the tone repeats exactly, 110 times a second, an octave below its lowest partial. A round box squares the Bessel zeros, which land no nearer to whole numbers, and it never repeats. Under Schrödinger's rule it really is [[Harmonicity and Inharmonicity|the geometry of circular resonators that forces inharmonic eigenmodes]]. Where you strike picks which of them ring: hit a round drum dead centre and only its rings sound, 1 · 2.30 · 3.60 · 4.90, almost evenly spaced. A bell is neither a drum nor a box. It is a thick curved shell, and the founder's craft is shaving its walls until five of its partials line up.

- run · 2026-11-01 · cycle 19 · proposed items 1, 2, 3, 4 for canon
