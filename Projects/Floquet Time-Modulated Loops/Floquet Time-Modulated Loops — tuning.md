---
title: "Floquet Time-Modulated Loops — tuning"
born: 2026-11-03
links:
  - target: "[[Floquet Time-Modulated Loops]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Floquet Time-Modulated Loops's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Floquet Time-Modulated Loops about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Floquet Time-Modulated Loops — tuning

What Floquet Time-Modulated Loops's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-03, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-11-03

1. Run a codebox's own text in Node against its reference before trusting its comments. Here the arithmetic matched to 1e-15 while the test list's threshold, Q, tongue width and default noise were all off, because the comments were written from the plan, not measured from the code. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Open Questions, the bullet 'Does the tanh saturation in Stage 1 distort the Strutt picture?', a new progressed line after the existing one · superseded by item 8 *(proposed by the steward, cycle 1)*
   Why: The open question asked whether a different saturation is the right sound; now there is a measured, audible answer to choose from.
   Path: `Projects/Floquet Time-Modulated Loops.md`
   >   — progressed (2026-11-03): heard three ways to stop the growth: the build's state clip with tanh, damping that grows with the ring's energy, and a stiffening spring. All three hold the pitch at exactly half the pump, because the tongue locks it. They differ in overtones: tanh's odd harmonics land on the Floquet ladder's own frequencies and hide it, while energy-dependent damping leaves the ladder as the linear theory makes it ([[Mathieu Resonator — offline check|the offline check]]).

- run · 2026-11-03 · cycle 1 · taught item 1, proposed item 2 for canon

## From cycle 2 — 2026-11-03

3. Name a render after measuring it, not before: I titled the 2× comb 'octave' from the theory, and it measured as odd harmonics at the same pitch, because the noise chose which pulses fill the slots. *(offered by the steward, cycle 2)*
4. **Proposed for canon** · 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Stages 2–5 — the development arc, ### Stage 2 — Floquet Comb, a new paragraph after the first · superseded by item 6 *(proposed by the steward, cycle 2)*
   Why: The Stage 2 sketch predicted tongues and comb peaks that shift, but not where the tongues are or how narrow. Now that is measured, and it changes the instrument's knob design and its cross-domain hook.
   Path: `Projects/Floquet Time-Modulated Loops.md`
   > First proof (2026-11-03, Python, [[Pumped Comb — first proof|the proof note]]): pumping only the loop gain of a dying Karplus-Strong string makes it grow only when the pump runs at a whole-number multiple of the loop rate. The tongues sit at n, not at the resonator's 2/n, and they are a few cents wide, wider for a darker loop filter. Inside a tongue the ring narrows into pulses riding the gain peak, which is active mode-locking, the laser's way of making short pulses: a closer cross-domain hook for this stage than plasma decay. At 2× and 3× the seed noise picks which pulse slots fill, so the same knobs can give different timbres.

- run · 2026-11-03 · cycle 2 · taught item 3, proposed item 4 for canon

## From cycle 3 — 2026-11-03

5. A tongue has two widths, and you have to measure both before setting a knob's range: the narrow range where a ring grows out of noise, and the wider range where a ring that's already loud keeps holding (here ±1.7 versus about ±8 cents). *(offered by the steward, cycle 3)*
6. **Proposed for canon** · 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Stages 2–5 — the development arc, ### Stage 2 — Floquet Comb, a new paragraph after the first · canon change owed *(proposed by the steward, cycle 3)*
   Why: Adds what the two-pump proof measured to the Stage 2 sketch, and corrects the tongue width to its two meanings.
   Path: `Projects/Floquet Time-Modulated Loops.md`
   > First proofs (2026-11-03, Python and the browser; [[Pumped Comb — first proof|the first note]], [[Pumped Comb — two pumps|the two-pump note]]): pumping only the loop gain of a dying Karplus-Strong string makes it grow only when the pump runs at a whole-number multiple of the loop rate. The tongues sit at n, not at the resonator's 2/n. A ring grows out of noise only within a few cents, though a ring that's already loud keeps holding to about ±8 cents without following the pump. Inside a tongue the ring narrows into pulses riding the gain peak. That is active mode-locking, the laser's way of making short pulses, and a closer cross-domain hook for this stage than plasma decay. Add a length pump and the two together make a sustained tone with partials between the harmonics, which neither makes alone. It survives deep length wobble only when the length rate is a whole number (or a half) times the loop rate, so the pulse meets the gain peak each pass. At stray rates the tone dies.

- run · 2026-11-03 · cycle 3 · taught item 5, proposed item 6 for canon

## From cycle 4 — 2026-11-03

7. Check whether an off-theory result is physics or the integrator by changing the step size: the gentle tongue's lean grew at 55 Hz and shrank at 880 Hz, so it is the Mathieu tongue's own second-order bend. *(offered by the steward, cycle 4)*
8. **Proposed for canon** · 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Open Questions, the bullet 'Does the tanh saturation in Stage 1 distort the Strutt picture?', a new progressed line after the existing one · canon change owed *(proposed by the steward, cycle 4)*
   Why: The question asked which saturation is the right sound; Loudon answered it, and the measured level law is the reason it teaches well.
   Path: `Projects/Floquet Time-Modulated Loops.md`
   >   — settled (2026-11-04): Loudon chose damping that grows with the ring's energy over the build's state clip and tanh. Heard three ways, all three held the pitch at half the pump, but tanh's odd harmonics land on the Floquet ladder and hide it. With the gentle damping, the ring settles at E = (q/2 − ζ)/g, so its level follows the pump depth (measured within 3 %), and the ladder stays as the linear theory makes it ([[Gentle Resonator — what the codebox needs|the measurements]]).

- run · 2026-11-03 · cycle 4 · taught item 7, proposed item 8 for canon

## From cycle 5 — 2026-11-03

9. Check a surface's power on its unmoved rung before using it as a filter: it says up front whether the filter keeps the input's pitch (Theta 38 %) or gives it all away once the scan is fast (Membrane 0 %). *(offered by the steward, cycle 5)*
10. **Proposed for canon** · 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Stages 2–5 — the development arc, ### Stage 3 — Floquet Kernel (wavetable as filter), a new paragraph after the first · canon change owed *(proposed by the steward, cycle 5)*
    Why: The Stage 3 sketch claims a surface's synthesis character returns as a filter character; the first proof measured how, and named the three kinds.
    Path: `Projects/Floquet Time-Modulated Loops.md`
    > First proof (2026-11-04, Python; [[Floquet Kernel — first proof|the note]]): read a surface's fast axis as 512 taps and scan its slow axis at f_mod, and a surface mode (m, n) becomes a passband at m × 93.75 Hz whose output is moved by n × f_mod. The surface's 2D spectrum is the filter's map, and a sine test matches it to 0.0001 dB. The surfaces turn out to be different kinds of filter: Theta keeps the input's pitch, Membrane has nothing on its unmoved rung and gives the pitch away once the scan is fast, and Penrose splits the input into five bands, each moved its own distance.

- run · 2026-11-03 · cycle 5 · taught item 9, proposed item 10 for canon
