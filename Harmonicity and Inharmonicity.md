---
title: "Harmonicity and Inharmonicity"
type: concept
pillars: [creation, tools, philosophy]
born: 2026-03
stage: growing
confidence: working
energy: high
hook_quality: 8
beauty: 8
who_leads: shared
links:
  - target: "[[Boundary-Crossing Instruments]]"
    type: connects-to
  - target: "[[Action Potential Oscillator]]"
    type: connects-to
  - target: "[[Frequency-Time Duality]]"
    type: connects-to
  - target: "[[Categorizing Inharmonicity]]"
    type: spawned
  - target: "[[Piano String Inharmonicity]]"
    type: emerged-from
    label: b-coefficient-anchor
  - target: "[[Compressor Design]]"
    type: connects-to
  - target: "[[Portamento and Physical Pitch Modeling]]"
    type: connects-to
    label: mode-locking-built-there
forward_vector: "I find where coupling holds, shimmers and tears as a tone's partials stretch away from whole numbers, and I hand that edge to instrument designers as the place an instrument should live."
---

# Harmonicity and Inharmonicity

![[Harmonicity and Inharmonicity — hero.png]]

The relationship between harmonic and inharmonic spectra — how partials relate to a fundamental, what happens when those relationships are exact integer ratios versus stretched, compressed, or irrational, and the deep consequences of this distinction for perception, coupling, and instrument design.

## Origin

This concept has been explored across many conversations — from piano string physics and Bessel function eigenmodes to the neurological synthesizer project — but was first given its own palace entry during the Kuramoto coupling lesson series (March 2026), where the question "what happens when you couple to inharmonic partials?" produced a key insight about frustrated coupling.

## The Frustrated Coupling Insight

All partials of a single oscillator are **not independent sine waves**. They are rigidly enslaved to one degree of freedom: the fundamental's phase θ. The nth partial (whether harmonic or inharmonic) sits at rₙ·θ, where rₙ is that partial's ratio to the fundamental. One variable controls everything.

**With harmonic partials** (integer ratios: 2, 3, 4...), coupling forces from external oscillators locking to different partials are **commensurate** — they agree about where the fundamental should be. Every locking event reinforces every other. This is why harmonic timbres sound stable: the internal structure is self-consistent.

**With inharmonic partials** (non-integer ratios: 2.03, 2.97, 5.1...), coupling forces are **incommensurate**. External oscillators locked to different inharmonic partials pull the fundamental in contradictory directions. This creates **frustration** in the physics sense: not all constraints can be simultaneously satisfied. But frustration is a strain before it is a failure. Mildly stretched, the tone doesn't fight: it settles a touch flat, holds its pitch, and its colour shimmers. It tears only past an edge.

## The Asymmetry

Inharmonic oscillators as **high-inertia masters**: works beautifully. External oscillators each lock to whichever actual partial is nearest. The master doesn't care about contradictory back-forces because its inertia overwhelms them. This produces a just-intoned-to-the-inharmonic-spectrum chord — musically interesting and physically stable.

Inharmonic oscillators as **low-inertia participants**: problematic. The contradictory forces create a tug-of-war on the fundamental. Depending on coupling strengths: chaotic wandering, dominant-coupling-wins-and-others-break, or oscillation between attracting positions. Aurally unstable.

This one-phase picture fits **self-sustained** tones (bowed strings, voices, reeds), whose partials really are held together by one driven motion; it is mode locking in Fletcher's sense (1978), already built in [[Portamento and Physical Pitch Modeling]] (`multi-mode/mode_locking.py`). A plucked string or a struck bell rings its modes freely and is not bound this way.

## What the Sweeps Showed

Tested on the Daily Page, 2026-10-17, in a toy model: one tone, its partials pulled by outside voices tuned to the plain harmonic series. Trust the shapes; the numbers depend on the model.

- **A path with five places.** As stretch rises the tone goes frozen → alive → edge → torn → released. Alive, just under the edge, is where the music is.
- **The top partials set the edge.** Stretch bites the nth partial roughly as B·n³, so a tall spectrum tears long before a short one: 40 partials tore over a hundred times sooner than six.
- **The light tone bargains by sagging**, drifting flat while it holds on. **Few voices snap; many fray.**
- **Two exits:** stubbornness (a heavy tone holds even at bell-wide stretch) and difference (stretched far enough, the partials are out of reach and the tone goes free).
- **Pinned stretch runs string → bar** and lands periodic again, at 1, 4, 9, 16. Whether a spectrum repeats and whether its partials agree with their neighbours are separate questions.

Hear it and learn to find the edge yourself: [[Harmonicity and Inharmonicity — scroll]], starting from its field guide.

## Where This Appears

Where inharmonic spectra come from (stiff strings, Bessel modes, scatter, all-pass phase accumulation and the rest) is mapped in [[Categorizing Inharmonicity]]; the all-pass reverb as an inharmonic resonator is its §6.

## Open Questions

- Can frustrated coupling be musically useful as an effect? Yes, at the edge: breathing across it, striking past it and stepping through it all play (see the scroll).
- Where does coupling break? Partly answered: the top partials set the edge, roughly as B·n³, and more coupling pushes it out. The values are the model's, not yet any real instrument's.
- How does the harmonic/inharmonic distinction map to consonance/dissonance perception? Is perceived consonance literally the absence of coupling frustration?
- The [[Boundary-Crossing Instruments]] insight about rhythm/pitch and delay/filtering boundaries — does the harmonic/inharmonic boundary belong in that family?
- If the voices were free to re-pair with whichever partial is nearest during a dive, would the tear heal sooner, or wander between partners?
- What does an instrument that dwells at the edge look like: a stretch held just under the threshold, with coupling as the expressive control?

---

*"Harmony is the absence of frustration between coupled forces."*
