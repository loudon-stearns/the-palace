---
title: "Dissolutions — sequences — challenge"
born: 2026-11-07
links:
  - target: "[[Dissolutions]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Dissolutions' six learning sequences: each judged by an agent that did not make it, for whether it tests the proof's claim, stays true to its member and walks up, with one remake round and a second verdict, so Loudon reviews ways up that have already been argued with."
---

# Dissolutions — sequences — challenge

Enrichment's proposal round (steps 6–8, § Proposal and approval), adapted to the six learning sequences in `Dissolutions/proofs/2026-10-25-learning-sequences/`, on Loudon's word of 2026-11-07 that they close out "the same way the recent rich faces were", landing as proposal for him to review "over time" and without being rushed. Each sequence was judged on 2026-11-07 by its own challenger, an agent that made none of them, on branch `claude/dissolutions-sequences-905758` at `09349300`, against the member entry as it stands on main. The challenger's brief: `Dissolutions/proofs/2026-10-25-learning-sequences/challenge-brief.md`. Remake had one round, made by the maker or a fresh remaker, then a second verdict from the same challenger. No member text was written; what the sequences teach the text waits as offers in [[Dissolutions — baton]].

**First verdicts: 1 keep, 5 remake, 0 retire. After one remake round: 6 keep, 0 retire.** All six land as proposal.

Nobody can listen headless. Every verdict below rests on the code, the numbers and the screenshots; none on hearing.

## The table that travels — remake, then keep

### the-table-that-travels.html — remake

**Does it test or decorate?** It tests, in two steps that could fail. Step 3 is a null test: the table and a loop one cycle long, one flipped and added, cancel to "0, exactly", and its toggle (the loop one sample too long) shows the null failing. Step 5 sets the round-trip condition's prediction (gold marks) against the measured spectrum of the loop with its filter; at filter 0 it falls back to the grid and to step 3's null. The hunt line's identity and its knob, set up to be met.

**Is it faithful?** Mostly. `check-sequences.mjs` passed every check. Recomputed step 5 at 0.85 (a = −0.849, L = 338) with an own allpass, the condition solved from the unwrapped complex phase, and a 131072-sample Blackman DTFT at 0.01 Hz: peaks within 0.005 Hz of prediction for partials 1, 6, 12, 18, 24; partial 24 at 2982.2 Hz, 12.73% sharp, as the page says. The fractional-length edge is handled honestly in step 6. Four places contradicted the page's own claims: step 2's 3 s buffer held 330.275 trips, looped with no crossfade, so a jump every 3 s against "every trip the same as the last"; step 3's miss line said the two drift "in and out of step", but the 3.97 s beat is cut off by a 2.85 s buffer; step 3's Try said "one sample long" for "one sample too long"; step 1's legend said "three periods" over a fixed 27 ms.

**Does it walk up?** Yes, and it follows Loudon's outline, with the filter split into two rungs. One rung missing: step 5 brought in the filter and the round-trip condition at once, because step 2 never said a bare loop keeps only partials that fit whole turns into one trip, k × sr ÷ L.

**Why remake.** (1) Step 2's buffer a whole number of trips, with a check. (2) Step 2 states the whole-turns rule; eq `fₖ = k × sr ÷ L`. (3) Step 3's Try: "one sample too long". (4) Step 3's miss line rewritten. (5) Step 1's legend made true. Noted for Loudon, not required: the half-sample edge is first met on the proof; step 4 draws phase delay while the zap follows group delay (both say the highs arrive first).

### Second verdict — keep

The maker made all five changes; the new seam line passes (143880 samples = 330 trips, largest jump 0). "The missing rung is now there. Step 2 says the bare loop keeps the partials that fit whole turns into one trip, so step 5 adds only the filter's phase lag θ(f) to a condition the player has already met." Ready for Loudon at his pace, beside his own "will need work" notes. Unheard: the step 4 zap, the step 5 shimmer, whether step 2 now sounds seamless, the loudness balance, the 44.1 kHz path.

## The shadow that locks — remake, then keep

### the-shadow-that-locks.html — remake

**Does it test or decorate?** It tests. Step 3 sets the kicked PRC against the left eigenvector at kicks of 0.1, 0.03, 0.01, so it could fail if the PRC were not Floquet data. Step 6 runs the shadow beside the full pair, and on the gentle loop the shadow fails: the pair locks and the shadow says drift. The hunt line's identity and its limit-only isomorphism, each seen holding or breaking. Step 5 answers Loudon's question about the full pair.

**Is it faithful?** Yes to Phase Reduction on main. Re-ran by an own RK4, started exactly opposite, pitch from zero crossings: up 4.2, 10.8, 20.5, 45.9% at couplings 0.04, 0.1, 0.2, 0.5, against the page's 4.3, 10.8, 20.5, 45.8%. The spring explanation is right, more exactly than the page says: locked exactly opposite, the pair is one van der Pol with spring 1 + 2ε (+45.5% at 0.5). But step 5 did not say what it measured. Its curve came from one start, 120° apart. Started together with the page's +0.6% detuning, the page's own `runFull` gives: 0.1 and 0.2 still go opposite and climb; 0.25 locks at 24°, up 1.8%; 0.3, 7.6°, up 0.5%; 0.5, 1.3°, up 0.3%. Above about 0.25 the pair has a second lock with almost no pitch change. The toggle showed only the zero-detuning knife edge.

**Does it walk up?** Mostly: one oscillator, a kick, the same curve from the loop, the pair, the spring, the shadow, the proof. The tongue first appears in step 7, which says it is step 6's question swept over a grid.

**Why remake.** (1) The toggle starts the pair together and keeps the detuning, renamed "Start them together", with a hint naming the two locks. (2) The caption names the 120° start. (3) The zero-detuning selfTest replaced by the started-together one.

### Second verdict — keep

A remaker made all three changes and plotted the started-together branch as white rings. Re-run: 0.1 → −167.5°, up 10.77%; 0.3 → 7.6°, up 0.51%; 0.5 → 1.3°, up 0.31%; the toggled sound's pitch matches its readout. "Step 5 now tests its own explanation as well. If the spring is why the pitch climbs, then a slack spring should leave the pitch alone." The answer to Loudon's question is right, and it now says which start it measured. Unheard: whether the in-step pitch "staying home" against the opposite lock's climb is clear at 220 Hz.

## The circle's shadow — keep

### the-circles-shadow.html — keep

**Does it test or decorate?** It tests. Step 5 is a real null: the curve and the stack are built by separate code and subtracted, and the "plain powers" toggle shows the null failing loudly (x³ gives 0.75 of h1 and 0.25 of h3). Steps 6–7 test the knob: the Lⁿ rule, leakage only downward within parity, nothing above the top drawbar.

**Is it faithful?** Yes. Steps 1–5 stay inside the member's text; steps 6–7 go further than the text, but exactly where the hunt line's knob points, and step 6 says the identity needs the full sweep. 22 number checks and 10 page checks pass. Rechecked from the binomial power form: T₃ at reach 0.6 gives h1 −1.152 and h3 0.216; T₂ at 0.6 an offset of −0.640; T₇ at 0.9 gives h7 = 0.9⁷ with h8 at 2.5e-16; saw at 0.6 is −1.25 dB against the page's 1.2 dB; x³ gives 0.75 and 0.25. One small point: h1 at 0.6 is −1.152, so the low harmonic comes back inverted; the bars show magnitude only.

**Does it walk up?** Yes, in the right order: the shadow, the stack, a bent curve, Tₙ, the null, the reach alone, the reach on the drawbars. Step 1's circle is drawn as an ellipse, and step 8 says so.

**Why keep.** It answers Loudon's note directly, every number holds by a second route, and it ends honestly on the proof. **Overlap with main's Chebyshev is Fourier face: they now divide the ground cleanly.** The face's remade drive (946b4cf2) runs its drive from 1 to 1.30 and tests the WaveShaperNode past its ends; this sequence's reach runs 0.05 to 1, as the proof's does. They meet only at 1. One word is shared across both halves: "drive". A later round could add a one-line pointer across, once this lands. Unheard: whether step 7's swell sounds like a note opening and closing, and whether step 5's silence is silent through a speaker.

## One field, two hands — remake, then keep

### one-field-two-hands.html — remake

**Does it test or decorate?** It tests. Step 4 subtracts the two hands to a measured null, and a 5° nudge breaks it. Step 5 sets the lag's 30 Hz curve against two measured flat lines. Step 6 nulls the Volterra series against the field read, then shows the converse failing at 2τ, marking the edge of the isomorphism. Both hunt lines are met.

**Is it faithful?** The numbers hold: step 4's null 6.3e-13; at lag 24 the ring field swings 35.4 dB, terrain 37.8, ridges 8.3; lag 0 flat; the series matches the field to 2.8e-15. Re-run at 48 kHz, τ = 24, a 1 s DFT: the ring field reaches a true zero at 485 Hz, matching ¼|cos(π(f₁+f₂)τ)|, so 35.4 dB is only what a 10 Hz grid sees. A diagonal-only field swings 0.00 dB; the cross term u²v² alone, 8.65 dB. **Steps 3 and 5 teach offer A, not the member text on main**, whose line 66 says the Hammerstein diagonal "discards intermodulation". The sequence is right and the text is wrong, but the sequence contradicted its member without saying so, and never used the word "Hammerstein", which the member and the proof depend on. Smaller faults: step 1 said each column feeds one harmonic (columns are positions u; the harmonic index is the term m); step 2 said the figure "never closes" between the ratios shown (every rational ratio closes); step 3's legend called a solid line dashed.

**Does it walk up?** Yes, in a good order. One rung missing: the member's diagonal is in lag space, the sequence's in height space, and step 6 never said which dots made step 5's tone rise and fall, so the player met "Hammerstein" cold in the proof.

**Why remake.** (1) Step 1's harmonic sentence corrected. (2) Step 5 names the Hammerstein structure and the contradiction with the member page. (3) Step 6 names the diagonal dots (a static curve and its echo) and the off-diagonal ones (what made the tone rise and fall), with a check that the cross terms removed leave the line flat. (4) Step 2's "never closes" and step 3's legend corrected.

### Second verdict — keep

A remaker made all four changes; the maker also corrected the same "column m" slip in step 2's words line. New checks: diagonal-only fields flat at 0.00 dB (u² + v² + u³ + v³, terrain and ridges with cross terms removed; u⁴ and v⁴ cannot be built on the page's 4×4 field, and the substitution costs nothing, since the real evidence is the even-order and stripped fields); u²·v² alone 8.65 dB, deepest at 480 Hz; the ring field's only weight off the diagonal. "The sequence still teaches offer A rather than the text on main, but it now says so instead of quietly assuming it. Drop the 'That page says' clause if offer A lands." "The player now meets 'Hammerstein' before the proof, not in it." Unheard: the glide, the nudge, the ring modulation.

## The equation read backward — remake, then keep

### the-equation-read-backward.html — remake

**Does it test or decorate?** It tests. Step 4's round trip, the residual in and the voice back, nulls to a flat line you can listen to, and the nudged weights make the null speak. Step 5 runs the round trip at every order from 1 to 32. Step 2's formula for the miss is checked against the miss measured sample by sample.

**Is it faithful?** Yes to Linear Predictive Coding on main: the same equation, the source and filter split, a 25 ms window inside the entry's 20–30 ms. Recomputed by Gaussian elimination on the normal equations, not Levinson-Durbin, on the proof's own voice: best single weight 0.982, miss −14.40 dB; gains at orders 1, 2, 8, 16, 32 of 14.44, 23.16, 26.63, 28.21, 28.61 dB; round trip at most 2.8e-14; nudged −6.90 dB. All match the page. One fault, in the map to the proof: step 6 said the proof's *A buzz* "is step 1's click", but the proof's buzz follows the voice's gliding pitch (107–150 Hz) and loudness, which is step 5's "what the weights hold".

**Does it walk up?** Mostly: one mental model a step, the test last. Step 3 jumps from one hand-set weight to sixteen, a rung step 5 fills late but honestly (order 1 equals step 2's hand, 14.4 dB both). Step 5's caption said grey for a line drawn near-white.

**Why remake.** (1) Step 6's map corrected. (2) Step 1's hint: "the kind" of click the proof uses, there following the voice's pitch. (3) Step 5's residual drawn grey.

### Second verdict — keep

The maker changed exactly those three lines, confirmed by diff; no number or step logic was touched, so the independent recheck stands. "The one fault was a mis-mapping in the step that points to the proof, and it is fixed with nothing else disturbed." Unheard: whether the residual sounds like the buzz, whether order 2 has "barely a vowel", whether the vowels survive the nudge, whether the null is silent.

## The lattice read back — remake, then keep

### the-lattice-read-back.html — remake

**Does it test or decorate?** It tests. Step 3's leftover is silent on the harmonic tone and loud on the bell; step 4's rank flips between 1 and 2 as the bound moves while the sound stays the same; step 5's drawn-minus-re-counted difference is silent for every basis of determinant ±1 and breaks at determinant 2 (4 of 7 points have no whole-number place); then the proof's own analysis, given only the Diagonal sound, returns (g₁, g₁ + g₂).

**Is it faithful?** 23 number checks and 10 page checks passed. An own check agrees on 7 ÷ 5 (rank 1 first fits at 27, on 21.98 Hz) and on the basis change. **One number did not hold: the √2 bound of 157.** An exhaustive search, intersecting the range each peak allows, finds rank 1 first fits at **K = 65, on about 9.16 Hz**, at every tolerance from 0.3 to 0.5 Hz. The page got 157 because its `fitRank1`, the proof's own, tries only rulers that put one of the three lowest peaks exactly on a mark; the checker reused it and could not see this. The proof's box shows 157 too: a new fault in the proof, recorded, not fixed. **Against the member text on main, steps 4 and 5 teach offer B**: step 4 says rank depends on the bound where the page calls it "a property of the source"; step 5 says the analysis gets the lattice, not the hand, where the page has it return "its generating frequencies". Correct mathematics, faithful to the proof and the hunt ledger, but going past the member page without saying so. Step 5's picture drew every point hollow, though hollow meant "no whole-number place".

**Does it walk up?** Yes: one generator, two, a ruler, the bound, the basis, the proof, one idea a step.

**Why remake.** (1) Step 4: an exhaustive rank-1 search for the graph and the ruler; √2 becomes 65 on about 9.16 Hz. (2) Step 6: say why the proof's box shows 157. (3) Step 6: say the Rank-N page currently holds otherwise, and offer B is the change that would bring it in line. (4) Step 5: on-grid points filled.

### Second verdict — keep

A remaker made all four changes, keeping the proof's anchored search beside the exhaustive one with check lines for both: √2 at 65 on 9.1608 Hz (range 9.1549–9.1652, worst peak miss 0.352 Hz, rank 2 at 64), stable from 0.3 to 0.5 Hz; anchored 157 on 3.7935 Hz against exhaustive 65; 7 ÷ 5 at 27, drawn on 22.00 Hz (range 21.98–22.02). "The one wrong number is fixed. The gap with the member text is said out loud." Unheard: whether the pitch holds with ×1 off, whether the 3 ÷ 2 bell pulls together, whether the ruler at about 9 Hz sounds like ticks, whether the determinant-2 difference is clearly not silent.

## What this round leaves for the text, and for the proofs

Nothing was written to any member's text. What the sequences teach it waits as offers in [[Dissolutions — baton]]: offer A (Volterra Kernels and the Torus, the Hammerstein sentence), now set up out loud by one field, two hands; offer B (Rank-N Lattice Analysis, rank against a bound and the basis), now set up out loud by the lattice read back; offer E (the catalogue's test notes). New for the proof-page fault list: the lattice proof's √2 "up to 157" is an artefact of its anchored search; a ruler fits from K = 65.
