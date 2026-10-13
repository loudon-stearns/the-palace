# The operators section — a drafted fix for [[Quantum Synthesizer]]

*Drafted by the Quantum Synthesizer steward, cycle 15 (2026-10-13), for an elder to land. Nothing here has been written to the entry. It is the third draft beside `one-equation-two-spacings — draft.md` and `hermite-paragraph — draft.md`; land all three together. It also asks for one small amendment to the Hermite draft (below), because this cycle's proof sharpened a sentence in it.*

## What the elder is asked to do

In `Quantum Synthesizer.md`, section *Quantum Operators as Musical Transforms*, **replace all three paragraphs** — from *"The creation operator $\hat{a}^\dagger$ raises the quantum system by one energy level"* through *"The measuring apparatus *is* the filter."* — with the three paragraphs below.

**Why.** The current text says a† "adds one overtone", a "removes one overtone", and measurement collapse is a resonant filter. `ladder.py` played every one of those moves through two listeners, and none of the three claims survives:

- a† on a single rung moves it up one rung. Five out of five, the result is one pitch, not one more pitch (|n⟩ at (n+½)·220 Hz → |n+1⟩ at (n+3/2)·220 Hz).
- a on a coherent state changes **nothing**. A coherent state is the eigenstate of a, so a|α⟩ = α|α⟩: fidelity 1.000000000000, and the waveforms differ by 1.5e-15 of their swing. Removing a quantum from the most sound-like state there is leaves the sound untouched.
- a† on a coherent state does change it, but not by one overtone. The overlap falls to α²/(α²+1) = 0.83, and the detector's chord re-voices: 4×220 Hz rises from −15.9 to −8.4 dB, 1×220 Hz drops from −5.3 to −8.8 dB, and the partial count goes from 11 to 13.
- Measuring the energy picks one rung, with Poisson odds (rung 4 most likely, 18%). What is left is a stationary state, and to the detector a stationary state is **silent** (wobble below 3e-16). Collapse doesn't resonate the sound. It stops it.

The deeper finding is the two listeners. The *clock*, Re ψ, hears the phase turning: each rung is one sine at (n+½)·220 Hz, so the ladder is the odd harmonics of 110 Hz, the clarinet's series, and the zero-point ½ is what makes them odd. But a global phase is not physical, so nothing in the world can hear the clock. The *detector*, |ψ|² at one place, hears what a measurement could register: only differences between rungs, so only whole multiples of 220 Hz. To that ear a single rung is silence, two rungs are one sine at their difference, and a swinging packet is a full harmonic chord.

---

## The three paragraphs

The creation operator $\hat{a}^\dagger$ moves a state up one rung, $\hat{a}^\dagger|n\rangle = \sqrt{n+1}\,|n+1\rangle$, and the annihilation operator $\hat{a}$ moves it down one. On a single rung that is a transposition, not an added overtone: one pitch becomes the next pitch up. Chords only exist in superpositions, and there the operators behave strangely. A coherent state, the quantum version of a swinging pendulum, is the eigenstate of $\hat{a}$: removing a quantum from it leaves it exactly as it was, so the sound does not change at all. Adding a quantum does change it, but by re-voicing the whole chord, not by adding a note.

What you hear depends on which ear you use, and the difference is the physics. An ear that could hear the phase turning would hear each rung as one sine at $E_n = \hbar\omega(n + \tfrac{1}{2})$: the odd harmonics of half the oscillator's frequency, the clarinet's series, with the zero-point ½ making them odd. No such ear exists, because only phase differences are physical. A real detector hears $|\psi|^2$, the chance of finding the particle at one place, and that hears only differences between rungs: whole multiples of $\omega$, the ordinary harmonic series. To a detector a single eigenstate is perfectly still. Two rungs beat at their difference; a packet swinging in the well is a full harmonic tone ([hear both ears, move by move](open:Projects/Quantum Synthesizer/proofs/ladder.mp4)).

So measurement collapse is not a resonant filter. A filter keeps a band of a moving signal and lets it ring. Measuring the energy keeps one rung, and one rung, to anything that can hear, does not move. Collapse doesn't tune the sound; it stops it. The nearer synthesis picture is the energy *spread*: the wider the spread of rungs a state holds, the more partials its motion has.

---

## Amendment to the Hermite draft

In `hermite-paragraph — draft.md`, the first new paragraph says *"Let φ₅ evolve and listen anywhere in the well, and you hear one sine wave."* That is the clock's hearing. To keep the two drafts consistent, end that sentence with the detector's: *"…and you hear one sine wave, if your ear could hear phase. To any real measurement it is perfectly still."*

## Frontmatter

No new links needed.

## Evidence in the bundle

- `ladder.py` — the script (numpy + matplotlib + ffmpeg)
- `ladder-checks.txt` — the seven checks, all PASS
- `ladder.wav`, `ladder.mp4` — seven moves, each played clock then detector, 42 s
- `ladder-poster.png` — every move, both ears, one still
