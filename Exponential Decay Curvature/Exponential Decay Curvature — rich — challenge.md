---
title: "Exponential Decay Curvature — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Exponential Decay Curvature]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Exponential Decay Curvature's first rich face: every piece judged with a reason, every offer recomputed from the page's own closed form, so the maker's one round of remake knows exactly what to fix and Loudon knows which offers hold and with what condition."
---

# Exponential Decay Curvature — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, who did not make the face. Judged against the page in the worktree, the manifest, the four made pieces, one gathered card, `… rich — check.mjs`, and the maker's commit body (23e685e4) as its only account.

## The checks I ran

- `node _ops/rich-face/conform.mjs "Exponential Decay Curvature"`: 4 pieces, introduced 4, errored 0, **errors 0, warnings 0**; the browser pass ran at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Exponential Decay Curvature"`: all four made sections **in step** (80496629c464, fe31e9eceaa7, 1e222a8d5bca, 7b523de68f45).
- `node "… rich — check.mjs"`: **40 PASS, 0 FAIL**, the same as the maker's commit says.
- Served the face from the worktree (`rich-server.mjs --detach`, port 8860), loaded `?entry=Exponential Decay Curvature` in headless Chromium, scrolled it whole, then walked every step of every piece. Four frames, five proposal chips, hero, figure and card all load (natural widths 1280, 469, 654), no HTTP response at 400 or above, **console clean**. Server stopped.
- Each piece makes its `AudioContext` inside the Play or key handler (straight line :275, timbre :296, RC :282, heard rise :212), so sound starts only on a click. Each declares `piece:needs` empty; none loads a file; no Splice material. A hidden page is hushed by the kit, which these pieces leave to it.
- The gathered card `Projects/Synth Templates/workshop/cards/envelope-curves.svg` **is tracked** (`git ls-files` in the worktree; it came in at 17e9e298) and is byte-identical to the copy in the owner's folder (`cmp`). The untracked file beside it in the owner's folder is `envelope-curves.pdf`, which the face does not name. The caption's A/B cue is word for word the card's `listening.ab` line.
- My own recomputes, independent of the pieces' code paths except where I ran the piece engine on purpose: numpy float32 and float64 for the floors, the falling form and the rising form f(t, c) = (1 − e^(−c·t)) ÷ (1 − e^(−c)) both; a periodic FFT for the levels and the alias (1760 ÷ 48000 = 11 ÷ 300, so 300 samples hold 11 cycles exactly, and no window is needed); the straight line piece's own core for the smoother timings and the slow sweep.

## The pieces

### The straight line, reached by a limit — remake

1. **Test or decoration?** A test. It could have found that the closed form is fine near zero, and in part it did: 64-bit passing through zero is clean. What fails is the knob at rest. The page's sentence came out sharper than it was written, which is what a test is for.
2. **Faithful?** To the page, yes. To its own engine, not in one sentence. Step 4's try text says "In 64-bit the grit is shorter and the silence the same." The engine says otherwise. With the piece's 20 ms one-pole smoother parked from 2 on 0, the grit runs 0.216 to 0.360 s in 32-bit (5733 samples off) and 0.615 to 0.762 s in 64-bit (5723 samples off). That is the same length, 0.144 s and 0.147 s, only later. The check's own counts show the same thing.
3. **Walks up?** Yes: the family, the limit with top and bottom shrinking together, the arithmetic floor by itself, then the test.

**The remake:** replace that sentence with "In 64-bit the grit comes later, at about 0.6 s instead of 0.2 s, and lasts about as long; then the same silence." Nothing else.

### Curvature is timbre — keep

1. **Test or decoration?** A test. The four oscillators are measured from the engine's own output, and the measurement could have shown PolyBLEP or oversampling clearing the alias. It found that PolyBLEP alone leaves a lot at large curvature (−9.5 dB at 1760 Hz, c = 60). The sign step tests something the text takes for granted.
2. **Faithful?** Yes. Where it goes past the text (the sign changes only the phases; PolyBLEP is needed at every curvature), it says so, and the maker sent those as offers rather than putting them in the piece's mouth as the page's. It says plainly that the oversampled version runs PolyBLEP + PolyBLAMP inside it.
3. **Walks up?** Yes: the phasor alone, the phasor through the curve, the sign, the alias.

**Note, not a remake:** the try text's "PolyBLAMP takes some of that back" holds at 1760 Hz, where it tells you to start. At 3520 Hz and c = 60 the check's own table has PolyBLAMP doing nothing (−1.4 → −1.0 dB), because the stage's time constant is then shorter than a sample. One clause would warn a reader who pushes the pitch: "…until the pitch is high enough that the bend is shorter than a sample."

### A capacitor, a comparator, and the curve — keep

1. **Test or decoration?** Half and half, honestly. The member identity c = −ln(1 − L) is algebra: V(xT) ÷ L = (1 − e^(−c·x)) ÷ (1 − e^(−c)) exactly, and an exact one-pole simulation will always match it (3.8e−10). The test can't fail the way a measurement can. But it shows what the section takes for granted and never names: which member a Moog stage is, and that the member depends on where the comparator sits. That earns it its place. Step 2's noise is labelled as a model.
2. **Faithful?** Yes. Its decay runs from the peak, s + (1 − s)e^(−t/τ), and so it disagrees with the text's s + e^(−t/RC). The text is the one in error, and the maker sent it as offer 5 rather than bending the piece.
3. **Walks up?** Yes: one capacitor, the comparator, three stages, the member.

### Is the jump the corner? — keep

1. **Test or decoration?** A test, and the right kind. Only a listener can settle the figure's candidate, and the blind trial leaves the verdict to the listener. The order is shuffled and the curves hidden until reveal (`deal()`, :259–262).
2. **Faithful?** Yes. Its landmarks are the text's (0.0316 to 0.5012 T and 0.0107 to 0.2318 T), and it keeps the text's own hedge: "one candidate".
3. **Walks up?** Yes: one rise, the same rise in decibels, the Moog rise beside it, the trial.

**Note, not a remake:** the rounded rise isn't only rounded. It reaches full at 1.15 T rather than T, and at T it sits 0.33 dB short. The caption's equation says so; step 4's text doesn't. Add "…and lands at full a little after the stated time" so a listener who hears it as longer knows why.

### Envelope Curves card (gathered) — keep

It sits beside the sentence that names the template, is tracked, and is the same bytes as the owner's copy. Its A/B cue ("the attack sounds slower and the release ends with a step") is the page's argument heard on a real voice. It illustrates rather than tests, but it is a gathered record that the paragraph points to by name, so it belongs there.

## The offers

**1 · The straight line (claim-change): the floors are confirmed, the slow-sweep click is disputed.**
- My numbers, both forms agreeing. 32-bit: worst error 1.5e−3 at c = 3e−5 and 5.0e−4 at 1e−4, so the curve is off by more than 0.001 below about 3e−5. It is 0 ÷ 0 at every point below 2.98e−8 (= 2^−25) and still finite at 3.1e−8.
- 64-bit: 8.5e−4 at 1e−13 and 2.6e−3 at 3e−14, so the floor is about 3e−14 to 1e−13. 0 ÷ 0 starts below about 5.6e−17 (2^−54). At 1e−16 the result is still finite, but off by 0.56. "About 10^−16" is fair.
- Parked on 0, the one-pole 20 ms smoother gives 0 ÷ 0 from 0.360 s (32-bit) and 0.762 s (64-bit), reproduced. Those times belong to that smoother. A linear-ramp smoother lands exactly on 0 at 20 ms, and an unsmoothed knob lands there at once; either way it is 0 ÷ 0 from then on. So the core finding, 0 ÷ 0 for as long as the knob rests, holds for any smoother. The times don't.
- The "dropout, then a click" is the piece's handling, since it sends a 0 ÷ 0 as silence. In real DSP a NaN runs on into the filters and can silence the voice until it is reset. The proposed sentence should say 0 ÷ 0, not dropout.
- **Disputed:** "a slow sweep (±1 at 0.05 Hz) reached an error of 0.18 at a crossing". I ran the piece's own engine for 200 s, 20 crossings, and got a worst of 0.009 per crossing (median 0.007, 150 samples off in all). An error of 0.18 needs a sample within about 2e−7 of zero, at the wrong phase. That happens on a few percent of crossings at most. So drop "a slow pass through zero in 32-bit can click" from the proposed wording, or soften it to "can roughen a few samples".
- The page's sentence is unconditioned, not wrong. At zero it is exact, and the Taylor fix holds (the check counts 0 bad samples). "Near zero" is far narrower than it reads in 64-bit and much wider in 32-bit.

**2 · Audio-rate (claim-change): confirmed.**
- f(t, −c) = 1 − f(1 − t, c) holds to 4.4e−16 for both forms.
- Over n = 1–32 at c = 0.5, 3, 12, 40 and 60, the FFT levels for +c and −c agree to 5.8e−15 dB and match 1 ÷ √(c² + (2πn)²) to 4e−7 relative. The phases differ, by a lot: at c = 12, harmonics 1–3 move by −125°, −87° and −65°. Levels depend on |c| only. The phases do not.
- This holds for the steady periodic wave only. As an envelope the sign is the whole difference, and at low pitch a time reversal can be heard; the offer says so and calls it untested.
- The page's "timbre is set by curvature" is unconditioned, not wrong. The proposed wording ("harmonic levels are set by the size of the curvature; its sign … moves only the phases") is accurate.

**3 · Audio-rate (claim-change): the numbers are confirmed, the proposed sentence overreaches.**
- The periodic FFT reproduces the alias table to 0.1 dB at 1760 Hz. At c = 0, 20 and 60:
  - naive: −13.3, −7.1, −1.7
  - PolyBLEP: −28.9, −20.5, −9.5
  - +PolyBLAMP: −28.9, −22.8, −18.2
  - 4×: −64.5, −58.4, −53.4

  c = −60 gives identical figures. The slope corner at the reset measures −3.000, −20.000 and −59.9998, so it is −c.
- Every member does jump by exactly 1 at the reset.
- **That does not contradict the page's audio-rate claims.** The jump is the waveform itself; the c = 0 member is a sawtooth. "Click-free given the Taylor branch" is about modulating c, which stays true.
- It does show that "large |curvature| … aliases, so PolyBLEP or oversampling applies" is unconditioned. Aliasing is there at every curvature (−13.3 dB naive at c = 0). PolyBLEP is needed at every curvature, and what large |c| adds is what PolyBLEP leaves.
- But "which PolyBLAMP or oversampling takes it" claims too much:
  - PolyBLAMP leaves −18.2 dB at c = 60.
  - Oversampling alone, with no PolyBLEP inside it, gives −14.3 dB at c = 60, and at c = 0 it gives −26.8, worse than base-rate PolyBLEP.
  - 4× with PolyBLEP alone inside gives −36.7.
  - The −53.4 needs both correctors inside and depends on the filter: a brickwall instead of the 128-tap Blackman gives −61.3.
- What grows with |c| is not only the slope corner. The k-th derivative jumps by (−c)^k, which is why a two-point PolyBLAMP gives out once c·f0 ÷ sr nears 1 (c = 60 at 3520 Hz: −1.4 → −1.0 dB).
- Suggested wording: "…which PolyBLEP leaves; PolyBLAMP takes part of it, and oversampling with both inside takes most."

**4 · Cross-Domain Resonance (claim-change): confirmed.** It follows from 2. At c = 60, harmonic 9 is 2.7 dB under harmonic 1, where a sawtooth's is 19.1 dB under, so large |c| either way is brighter than the sawtooth at 0.

**5 · Moog contour (no-claim-edit): confirmed.** s + e^(−t/RC) starts at s + 1. From a peak of 1 the decay is s + (1 − s)e^(−t/RC), and the piece follows that.

**6 · Moog contour (claim-change): confirmed.**
- c = −ln(1 − L) = T ÷ τ is exact algebra, not just a fit. 95 % gives 2.9957, L = 0.1 gives 0.1054, and the straight line comes only as L → 0.
- The page sentence is not wrong ("the one member an RC stage never makes" still holds); the offer adds the member's name.
- One condition worth keeping in the wording: an uncut decay is the c = 3 member over [0, T] only when rescaled to where it stands at T, as the check does. Running on toward its target, it is not cut there.

**7 · Artifact (no-claim-edit): confirmed as stated.** I can't verify the 2026-05-28 artifact's whereabouts, only that the face carries a stand-in.

## The face as a whole

It makes the page's idea felt rather than busy. Four pieces, each walking up four steps, each test placed at the sentence it tests. Three of the four tests came back with something the text didn't know: the closed form fails at rest, not in passing; the sign of curvature moves only phases; PolyBLEP is a sawtooth's tool, needed at every curvature. That is item 3 of the tuning ledger doing its work. The heard-rise trial is the best-judged piece: it doesn't claim to have found the jump, it gives Loudon's ear a way to find it. The RC piece is the closest to illustration, since its identity can't fail, but it names the member the section leaves unnamed. The face's weak spots are small and numeric: one try-text sentence that its own engine contradicts, and two offers whose proposed words promise more than the numbers (a slow-sweep click that comes up a few percent of the time, and oversampling that "takes" an alias only with both correctors inside it). Nothing here should be retired.
