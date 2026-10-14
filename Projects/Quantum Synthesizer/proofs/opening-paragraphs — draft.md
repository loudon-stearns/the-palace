# The opening isomorphism — a drafted fix for [[Quantum Synthesizer]]

*Drafted by the Quantum Synthesizer steward, cycle 16 (2026-10-14), for an elder to land. Nothing here has been written to the entry. It is the fourth draft in this bundle; the Hermite draft and the operators draft are still waiting on Loudon's yes, and this one can land with them or on its own.*

## What the elder is asked to do

In `Quantum Synthesizer.md`, section *The Isomorphism: Wave Functions as Sound*, **replace the two paragraphs** after the equation — from *"The imaginary unit $i$ is not a mathematical convenience."* through *"The Schrödinger equation is the infinite-dimensional version of an RLC resonant circuit."* — with the two paragraphs below. The equation itself stays.

**Why.** `wick.py` tested both paragraphs by turning *i* instead of deleting it: rotate the time axis by an angle θ, so the equation becomes dψ/dt = −i·e^(−iθ)·Hψ. At θ = 0 it is Schrödinger; at θ = 90° the *i* is gone and it is the heat equation. Four checks, all PASS (`wick-checks.txt`):

- Integrated directly on a grid in rotated time, the equation matches the level-by-level formula to 4e-4 or better at 0°, 30° and 90°.
- Fitting poles to the clock's **sound alone**, every partial's damping ratio equals sin θ to five places, at 0.1°, 1°, 5° and 30°. The pitches drop by cos θ.
- The detector's beats sit at *differences* of levels but die at their *sums*: the 1–2 beat at 3 × 220 · cos θ Hz decays at 5 · E₁ · sin θ, about 5/3 the clock's damping ratio.
- At 90° the clock never crosses zero. No pitch.

What that does to the current text:

- *"Remove it, and you have exponential growth or decay—the particle escapes to infinity or collapses to the potential minimum."* Half right. Remove *i* and every level fades, the high ones fastest, until only the ground state's shape is left. Nothing escapes; escaping to infinity needs the sign flipped too (running the heat equation backward, which blows up).
- *"a second-order system with complex conjugate poles whose imaginary parts encode the oscillation frequency and whose real parts encode decay rate."* Each level is **one** pole, not a pair, and it sits exactly on the imaginary axis: its real part is zero, so nothing decays. The conjugate twin only appears when you take the real part of ψ, which is the clock's hearing.
- *"the infinite-dimensional version of an RLC resonant circuit."* An RLC has a resistor. Schrödinger is the bank with every R set to zero. The rotation is what puts R back, and it puts in the same damping ratio for every level at once.

---

## The two paragraphs

The imaginary unit $i$ is not a mathematical convenience. It turns time into rotation: each energy level $E_n$ comes back as a phase spinning at its own rate, $e^{-iE_nt/\hbar}$, and none of them ever slows down. Take the $i$ away and the same equation becomes the heat equation. Nothing spins any more; every level just fades, the high ones fastest, until only the ground state's shape is left. Between those two lies a dial. Turn the time axis by an angle θ, and every level both rings and decays ([hear the dial turn](open:Projects/Quantum Synthesizer/proofs/wick.mp4)).

In filter language, each level is a single resonator pole sitting exactly on the imaginary axis: an oscillator with no loss at all. The Schrödinger equation is a bank of them, one per level, an RLC circuit with every resistor set to zero. Turning *i* by θ swings every pole the same angle off the axis, which gives every partial the same damping ratio, sin θ. So every partial rings for the same number of its own cycles, and the fast ones die first. In a box, where the levels climb as the squares, the ninth partial dies 81 times sooner than the fundamental. At a few hundredths of a degree that is a struck bell. At 90° it is a thud.

---

## Frontmatter

No new links needed. The bell sentence sits close to [[Bessel Functions in Synthesis]] and [[Harmonicity and Inharmonicity]], which the entry already links.

## Evidence in the bundle

- `wick.py` — the script (numpy + matplotlib + ffmpeg)
- `wick-checks.txt` — the four checks, all PASS
- `wick.wav`, `wick.mp4` — nine strikes from 0° to 90°, each played clock then detector, 32 s
- `wick-poster.png` — seven angles, poles and both ears' spectrograms, one still

*Every check is numerical; no person has heard `wick.wav` yet.*
