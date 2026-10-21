---
title: "Dissolutions — hunt"
born: 2026-10-20
links:
  - target: "[[Dissolutions]]"
    type: connects-to
    label: hunt-for
forward_vector: "I am Dissolutions' hunt: one line for every candidate tested, saying whether it held as identity, isomorphism or analogy and what knob it unlocked, so the next proof starts from what the last one found and the analogies gather toward the Refusals question."
ledger: hunt
standards:
  for: "every candidate Dissolutions has tested, and whether it is identity, isomorphism or analogy"
  run: "one candidate tested, usually by one playable proof"
  line: "- <date> · <A> / <B> · identity | isomorphism | analogy · knob: <what it unlocks> | none · <where found>"
  read: "whole, before choosing the next candidate"
  writes: "in the commit that lands the candidate's test, or the one right after it; a line is added, never edited"
  merge: union
  kept: git
  trim: never
---

# Dissolutions — hunt

One line per candidate tested, oldest first. Each says what the test found it to be, identity, isomorphism or analogy, and what knob it handed a designer, then where the test lives. A page that makes two claims gets two lines, because the claims can test differently. A member that tests as an isomorphism is marked here as one; whether it stays in the catalogue is asked of Loudon, not assumed. Lines that test as analogy seed the Refusals question at the foot of [[Dissolutions]].

The verdicts are the maker's; a sit with Loudon may overturn any of them, and then the overturning is a new line. `Dissolutions/proofs/check-dissolutions-proofs.mjs` re-runs, headless, every number the 2026-10-20 proofs show. The first line is seeded: it was written on 2026-10-20 from the scroll's record of the 2026-10-18 sit, and no checker re-runs it.

- 2026-10-18 · envelope / waveform (Exponential Decay Curvature) · identity · knob: one curvature control, heard as duration when read slowly and as timbre when read fast, with the seam near 20 Hz playable between · Dissolutions/proofs/2026-10-18-one-curve-three-doorways/ (seeded 2026-10-20 from the scroll's record of the sit; the verdict is read from the proof, not re-run)
- 2026-10-20 · Chebyshev polynomials / Fourier cosine series · identity · knob: a spectrum set directly as a waveshaper's curve; below full reach the same curve becomes a drive-dependent timbre · Dissolutions/proofs/2026-10-20-the-circles-shadow/
- 2026-10-20 · wavetable oscillator / lossless waveguide loop · identity · knob: the loop filter's phase response, a stored dispersion curve that moves the partials off the harmonic grid to where the round-trip condition puts them · Dissolutions/proofs/2026-10-20-the-table-that-travels/
- 2026-10-20 · LPC analysis / LPC synthesis · identity · knob: the residual as a playable layer, and the order as where the voice is split between the model and the residual · Dissolutions/proofs/2026-10-20-the-equation-read-backward/
- 2026-10-20 · 2D torus synthesizer / input-read 2D waveshaper · identity · knob: the lag between the two coordinates, a non-diagonal read whose intermodulation depends on which tones go in, which no Hammerstein structure can give · Dissolutions/proofs/2026-10-20-one-field-two-hands/
- 2026-10-20 · torus field / Volterra kernel · isomorphism · knob: a translation, not a new control: any field read at (now, τ ago) has an exact kernel living only on the lags 0 and τ, and only kernels that sparse come back as a field · Dissolutions/proofs/2026-10-20-one-field-two-hands/
- 2026-10-20 · rank-N lattice analysis / torus lattice synthesis · identity · knob: rank as a measured coordinate and the fitted lattice as a playable surface, with the honest dial beside it: rank exists only once you bound how large the whole numbers may grow · Dissolutions/proofs/2026-10-20-the-lattice-read-back/
- 2026-10-20 · phase response curve / Floquet left eigenvector at multiplier 1 · identity · knob: the PRC as a designed object, set by the shape of the loop · Dissolutions/proofs/2026-10-20-the-shadow-that-locks/
- 2026-10-20 · Floquet Theory (coupled limit cycles) / Kuramoto Coupling · isomorphism · knob: the coupling function Γ, built from the PRC, so designing the loop designs how a pair locks; exact only as the coupling goes to zero, and how small is small enough depends on the loop · Dissolutions/proofs/2026-10-20-the-shadow-that-locks/
