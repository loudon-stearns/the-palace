# One equation, two spacings — a draft section for [[Quantum Synthesizer]]

*Drafted by the Quantum Synthesizer steward, cycle 13 (2026-10-13), for an elder to land. Loudon granted REVIVE-TO-SPROUT on `quantum-synth-025`, saying the elder moves the stage and the steward keeps building, starting with this section. Nothing here has been written to the entry.*

## What the elder is asked to do

1. **Insert** the section below into `Quantum Synthesizer.md`, directly after `## Anharmonicity through Potential Shaping` and before `## Spinoza's Monism in Practice`.
2. **Replace** the piano paragraph in that Anharmonicity section (it starts *"A piano string under tension is a nonlinear oscillator"*) with one sentence: *"A piano string is the clearest case, and it turns out not to be about nonlinearity at all — see One equation, two spacings, below."* Loudon approved replacing that paragraph on 2026-09-24 (`quantum-synth-008`, APPLY), and it was never landed. The new section carries what that September draft said, with stronger evidence, so it supersedes the September draft.
3. **Soften** the bolded line in *Hermite-Gaussian Basis Functions as Spectral Shape*, **"The geometry of confinement determines the harmonic content."**, to: **"The geometry of confinement chooses the shapes; the equation turns shapes into pitches."** The walls proof showed that the original line is half true.
4. **Move `stage: dormant` → `sprout`.** Loudon has granted this three times (`quantum-synth-006` on 2026-09-24; `-016` and `-025` on 2026-10-13).

No new frontmatter links are needed. [[Piano String Inharmonicity]] and [[Harmonicity and Inharmonicity]] are already named in the body, and the second is already a `deepens` link.

---

## The section

## One equation, two spacings

A plucked string sounds 1 · 2 · 3 · 4: the harmonic series. Schrödinger's particle in a box, with the same walls and the same sine shapes, sounds 1 · 4 · 9 · 16, the squares. The walls choose the shapes. The equation turns those shapes into pitches. The wave equation makes pitch grow with the number of wiggles; Schrödinger's makes it grow with the square. [Six strikes on one box](open:Projects/Quantum Synthesizer/proofs/walls.mp4) change only the walls and keep the equation fixed. Free walls, a ring and soft walls each move the loudness or bend the ladder, but the spacing stays the squares.

There are two roads between those two ladders, and each turns a different knob.

**Change the equation.** Make a string stiffer. Bending adds a fourth-derivative term, and the partials climb, fₙ = n · f₀ · √((1 + B·n²)/(1 + B)), from 1 · 2 · 3 at B = 0 to exactly 1 · 4 · 9 as B grows without limit. A string with nothing but stiffness is a pinned bar, and a pinned bar *is* Schrödinger's box: apply the free Schrödinger equation twice and you get the bar equation. Schrödinger is the square root of a vibrating bar. Integrated separately from the same pluck, box and bar agree to one part in fifty million ([the stiffness road](open:Projects/Quantum Synthesizer/proofs/stiffness.mp4)). A piano sits at the far string end of this road, B ≈ 0.0001–0.001. Its stretched upper partials are this arithmetic showing up faintly, and they come from a linear stiffness term, not from the string turning nonlinear when struck hard ([[Piano String Inharmonicity]]).

**Change the well.** Keep Schrödinger and put a bump on the ring. As it deepens, the squares fold back down toward 1 · 2 · 3, because a small swing in any well is a harmonic oscillator. They never land exactly: in the deepest well the ladder reads 1 · 1.97 · 2.89 · 3.78, because a bigger swing is a slower one. That sag is the quantum pendulum's own colour ([eight strikes](open:Projects/Quantum Synthesizer/proofs/pendulum.mp4); [play it with a slider](Projects/Quantum Synthesizer/proofs/pendulum-slider.html)).

[The round trip](open:Projects/Quantum Synthesizer/proofs/round-trip.mp4) plays both roads as one held tone. It goes up through the equation and back down through the well, and the two roads meet exactly at the squares. So it is more precise to say *one substance, two knobs* than *the geometry of confinement determines the harmonic content*. The equation sets how shape becomes pitch. The well sets which pitches that rule allows. A synthesist can turn either knob, and the ear hears both as timbre.

---

*Evidence, all in `Projects/Quantum Synthesizer/proofs/`: `walls.py` (worst level error 0.002 of a step), `stiffness.py` (box vs. bar 9.5e-9 against 0.52), `pendulum.py` + `pendulum-checks.txt` (five checks), `round_trip.py` + `round-trip-checks.txt` (five checks, PASS). None of the audio has been heard by a person yet. Every check is numerical.*
