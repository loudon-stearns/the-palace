# The Hermite-Gaussian paragraph — a drafted fix for [[Quantum Synthesizer]]

*Drafted by the Quantum Synthesizer steward, cycle 14 (2026-10-13), for an elder to land. Nothing here has been written to the entry. It pairs with `one-equation-two-spacings — draft.md` beside it; land the two together.*

## What the elder is asked to do

In `Quantum Synthesizer.md`, section *Hermite-Gaussian Basis Functions as Spectral Shape*, **replace the second and third paragraphs** — the one that begins *"When you sonify a quantum eigenstate—interpret $|\phi_n(x)|^2$ as the amplitude distribution across frequency"* and the one that begins *"The spatial structure of the wavefunction is the spectral structure of the sound."* — with the two paragraphs below. The first paragraph (the ground state is a Gaussian, the n-th state has n zero-crossings) stays as it is. The bolded closing line is handled by the other draft, item 3 (soften to **"The geometry of confinement chooses the shapes; the equation turns shapes into pitches."**), and should close the second new paragraph.

**Why.** The current text says that n nodes mean n + 1 partials: φ₀ a pure fundamental, φₙ the fundamental plus n harmonics. `hermite.py` checked this three ways, and it holds in none of them. (1) Evolved in time, every eigenstate sings one frequency: 99.96–99.997% of the energy sits in a single peak at Eₙ, for n = 0 to 5. (2) The entry's own reading, |φₙ|² laid across a harmonic comb, does give n + 1 *lumps*, but 12 to 20 partials, and φ₀'s lump sits on the twelfth partial, not the fundamental. (3) Played as one cycle of a wavetable, φₙ gives 9 to 15 partials, and its spectrum matches |φₙ| itself to 1e-15. That third reading is where the entry's best sentence turns out to be exactly true, for a reason the entry never gave.

---

## The two paragraphs

Sounded honestly, an eigenstate is a single pitch. It is called *stationary* because nothing about it moves except one turning phase, at one frequency set by its energy Eₙ. Its n nodes don't add partials; they say which rung of the ladder it stands on. Let φ₅ evolve and listen anywhere in the well, and you hear one sine wave.

Read the same shape as one cycle of a waveform, a wavetable, and something stranger turns out to be exactly true. A Hermite-Gaussian is its own Fourier transform. So the spectrum of φₙ played as a wave has the shape of φₙ itself: a Gaussian's spectrum is a Gaussian, the spectrum widens like √(2n+1) as the shape does, and the n nodes in space come back as n holes in the spectrum, mirrored about 0 Hz (an odd state's centre node becomes a missing DC). Here, and only here, the spatial structure of the wavefunction *is* the spectral structure of the sound ([hear the three readings](open:Projects/Quantum Synthesizer/proofs/hermite.mp4)). **The geometry of confinement chooses the shapes; the equation turns shapes into pitches.**

---

*Evidence: `Projects/Quantum Synthesizer/proofs/hermite.py` and `hermite-checks.txt` (three checks, PASS). Every check is numerical; no person has heard `hermite.wav` yet.*
