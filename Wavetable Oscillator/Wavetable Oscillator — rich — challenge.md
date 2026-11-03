---
title: "Wavetable Oscillator — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Wavetable Oscillator]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Wavetable Oscillator's first rich face: three keeps and one words-only remake, each with its reason, and all four offers recomputed by a second route, so the maker's next round and Loudon's approval start from what was checked rather than what was claimed."
---

# Wavetable Oscillator — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, which did not make this face. Judged against the page as it stands (`Wavetable Oscillator.md`, fingerprints in step), the manifest, all four pieces' source, the maker's check, and the maker's commit body (1ad2322b) as its only account.

## Checks run

- `node _ops/rich-face/conform.mjs "Wavetable Oscillator"`: 4 pieces, introduced 4, errors 0, warnings 0, browser pass at 760 and 1130 px. (The maker's 4 warnings were "not yet committed"; they are gone now.)
- `node _ops/rich-face/fingerprint.mjs "Wavetable Oscillator"`: The same object as a loop `7d9e0abc7e93`, Why it can only be harmonic `79e85c12dab8`, Directions from here `42322f9bdcb6`, Building one `a39aae7491ca`, all in step.
- `node "Wavetable Oscillator/Wavetable Oscillator — rich — check.mjs"`: all claims hold, at 44.1 and 48 kHz.
- Face served with `rich-server.mjs --detach` on this worktree, `?entry=Wavetable Oscillator` in headless Chromium at 1130 px, scrolled so all four frames load. In each: no AudioContext before the click; the four steps walked by Next; Play pressed (context running); then the page set hidden, and all four contexts went to `suspended`. Console clean, top page and all frames. Server stopped.
- Recomputed on my own in numpy/scipy, not through the pieces' engines: the two loop filters, by simulation and in closed form; the bell's fold test, with a one-to-one variant of the moving bend and with the bend tied to the pitch; the three readers' error, from the per-harmonic error formula averaged over the fractional offset; the Position prediction, and why the 3/2 row misses it. Scripts in the session scratchpad, not kept.
- Not checked: the mix by ear, or whether any error-alone sound is as described. No agent heard any piece.

## one cycle, two ways — § The same object as a loop — **keep**

1. **Test or decoration?** A test. Steps 1–3 can't fail, and say so: both the table and the loop copy the stored numbers, so the whole-period null is exact by construction. Step 4 could have failed. A filter that restored the null at P + d would have contradicted the page's "only when one trip is a whole number of samples", and none does.
2. **Faithful?** Yes. The page never says the filter restores the match. "Sample for sample they match only when one trip is a whole number of samples" already says it doesn't. The piece measures what the filter costs, and that is offer 1. One honest wrinkle: step 4's "table" is the exact series, "the best any table can do", not a stored table read between samples. A 100-sample table read by a straight line at T = 100.5 is itself −28.0 dB from the exact read (−79.2 dB at 2048 samples). But that floor is fixed, and the loop's error grows past it within the first trips (−21.6 dB at trip 1, −14.9 at trip 10), so the comparison stands. A clause saying so would be good (taste, not a remake): "a stored table read between samples has a floor of its own (§ Building one), but it doesn't grow".
3. **Walks up?** Yes, and to the letter: table alone, loop alone, their difference, then the filter. That is Loudon's outline quoted in [[Progressive Staging]] § Inside One Piece. d = 0 returns to step 3.

**Recomputed** (40-harmonic saw, T = 100.5, my own loop):
- **Linear step.** Trip 10, 100 and 1000: −14.9, −8.9 and −3.6 dB, matching the piece. At d = ½ the step is H(ω) = ½(1 + e^{−iω}), so |H| = cos(ω/2) and its phase delay is exactly ½ at every frequency. The pitch is therefore exact (0.000 ¢) and only the level falls. Harmonic 10 keeps cos(π·10/100.5) a trip, which is −0.4315 dB. Summing |g^m − 1|² over the saw predicts −15.2, −9.0 and −3.6 dB.
- **First-order allpass.** Coefficient −d/(2 + d), target delay 1.5. Its phase delay is 1.4994 at harmonic 1, 1.4441 at harmonic 10 and 1.0821 at harmonic 40, so the highs come round early. Harmonic 1 is +0.0105 ¢ off fs/T, and harmonic 10 is +0.9545 ¢ against harmonic 1. Predicted residue at trips 10, 100 and 1000: −11.4, −7.1 and −3.7 dB; simulated: −11.3, −7.1 and −3.7.
- **Rounding.** −8.592 ¢.

Why it never returns: the filter is inside the loop. A linear step is a lowpass applied once a trip, so harmonic k's level goes as |H(ωk)|^m. An allpass keeps every level, but its delay falls with frequency, so each harmonic goes round at its own rate and the phases walk apart linearly in m. Both residues head toward the energy of the harmonics lost or scattered, about −3.6 dB here.

**Against Synthesis Topologies' face** (landed this round, "one loop, two instruments"): they agree. Whole period: Synthesis Topologies gets −200 dB with a floating counter and 0 with an exact one; this piece's integer counter gives 0. At N + ½, Synthesis Topologies has −14.5 dB at 0.05 s and −3.2 dB at 3 s, on a 16-harmonic saw against a 2048-sample linear table. My loop, on the same 16-harmonic saw against the exact read: −14.9 and −2.9 dB. This face adds the allpass, which Synthesis Topologies' offer names only as the lossless alternative. Its levels hold, but it doesn't null either.

## a bell on the grid — § Why it can only be harmonic — **remake** (words only)

1. **Test or decoration?** Half. The bell row and the moving-bend row are tests. The loop and still-bend rows are bit-identical every trip **by construction**: with no wobble, `readCycle` computes each sample from n mod P alone, so no trip can differ. That is the theorem's own proof running, not an experiment. Three Kinds of Warp's obstruction piece says the same of its steps 1–4, and says it on screen. This piece's step 4 says "not a little but nothing" and doesn't say why.
2. **Faithful?** Yes, and the moving-bend row is a real finding (offer 2). It agrees with Three Kinds of Warp. That page's theorem asks φ(t + T) − φ(t) = 2π for every t, not just at the ends of a trip (`Three Kinds of Warp.md`:65). Its landed offer says any fixed function of the wrapped phase stays on the grid. A bend moving at 37.7 Hz is a function of n as well as of the wrapped phase, so it is outside the hypothesis and leaves the grid: a second clock. Tied to the pitch it doesn't leave. Moving at fs/P, the same bend gives −267 dB (on the grid). At fs/2P it folds cleanly on 2P (−270 dB). That is Three Kinds of Warp's own wobble step (one wobble a lap holds; one every two laps halves the grid; unrelated never repeats). The two faces agree. The paraphrase on this page, "as long as every trip still takes the same time", is the weaker condition.
3. **Walks up?** Yes: the bell; one cycle looped; the read bent; the fold test.

**Why remake.** Two things to fix in words, and one in the engine or the words:
- **(a) The sample rate.** The caption's "6 dB … at P = 137 (from 8 dB down at 60 samples to under 1 dB down at 600)" holds at 48 kHz only. The bell is built at the context's rate and the bend moves at 37.7 Hz, so headless at 44.1 kHz the same P = 137 reads −4.2 dB on screen (bell −0.2 dB). Add "at 48 kHz" to the caption and to offer 2's numbers, or have the found line say the rate, as "reading between samples" already does ("Measured at 48000 Hz").
- **(b) By construction.** In step 4's watch line or found text, say that the still rows are equal because the read depends on n mod P alone, so the test is the bell and the moving bend.
- **(c) The bend's peak.** The moving bend is 0.6·(1 + 0.9 sin), which peaks at 1.14. The engine's own comment says the read keeps one trip per period only while |b| < 1, so for moments the read runs backward. Every trip is still P samples, and the finding survives a one-to-one bend: peak 0.95 gives −9.5, −6.9, −4.5 and −1.1 dB at P = 60, 137, 240 and 600. Either keep the peak under 1 (b·(1 + 0.9 sin) with b ≤ 0.52) and re-run, or say in the step that the bend's peak passes 1.

Commit-body slip, not in the face: "bell −0.4 to −0.6 dB between". At P = 60 it is −0.0, which the check prints as `-0`.

**Recomputed** at 48 kHz, my own strike and read. Bell: −0.0, −0.6, −0.5 and −0.4 dB at P = 60, 137, 240 and 600. Loop and still bend: every trip identical (the arithmetic floor, about −313 dB). Moving bend: −8.0, −6.0, −3.5 and −0.8 dB. All match the check.

## position as a second clock — § Directions from here — **keep**

1. **Test or decoration?** A test of "drive it fast, at a rate unrelated to the pitch, and Position has become the second clock". The repeats-after column could fail, and comes out 1, 1, 2, never, never, never for still, the pitch, 2× the pitch, 3/2, 37.7 Hz and golden. The dB prediction is computed from the two stored frames, not from the sound, so it is independent. But it is close to an identity: when 2r/f0 isn't whole, folding over trips averages the moving part away and leaves the still part.
2. **Faithful?** Yes, with one attribution to fix (taste-sized, a keep). Step 4's watch line says the share "comes out where **the page's** reading predicts". The page predicts that the energy leaves the grid, not −7.02 dB. The number is the piece's own algebra, shown in its equation row: (d²/2)·mean((B − A)²) ÷ (mean((A + p₀(B − A))²) + (d²/2)·mean((B − A)²)). Say "where the blend's algebra predicts". The engine comment "what the page predicts" should change the same way. The slow-sweep row (0.25 Hz, −14.8 dB "between", lines 0.25 Hz from their harmonics) is held honestly as "the honest middle". That is the page's "Sweep Position slowly and the same harmonics change in strength" read as hearing, not as arithmetic.
3. **Walks up?** Yes: held, swept slowly, driven fast, then the test.

**Recomputed**, my own frames: prediction −7.02 dB (p₀ 0.5 ± 0.4) and −10.49 dB (0.3 ± 0.25). Measured over 1 s: 37.7 Hz −7.03, golden −7.02. Over 10 s, 37.7 Hz gives −7.021, so the 0.01 dB gap is the one-second window. The 3/2 row (−7.9 dB, not −7.02) misses the formula for a reason worth knowing. At 2r/f0 whole, the modulator's square, sin², repeats with the trip, so it weights (B − A)² unevenly instead of by ½. In the spectrum, that is the sidebands of harmonics k and k + 3 landing on the same line. The piece doesn't claim the prediction there. The rate figures are in Hz and the frames in samples, so the dB values are the same at 44.1 and 48 kHz (headless at 44.1: −7.0, −7.9).

## reading between samples — § Building one — **keep**

1. **Test or decoration?** A measurement the page says it lacks ("has not been measured here yet"). It could have come out any way, and it lays the readers side by side across table size and pitch. That is not decoration: it replaces a stated absence with numbers.
2. **Faithful?** Yes. The caption limits itself to error energy, not audibility or where in the spectrum the error falls. It keeps the page's distinction: frames are blended by the house rule; this is a read inside one frame. The table is band-limited per pitch, as the page's "band-limited copies" are. The found line names its rate ("Measured at 48000 Hz") and re-measures at the context's rate.
3. **Walks up?** Yes: the sample before, a straight line, a curve through four, then the test.

**Recomputed from the formula**, not by simulation: the per-harmonic error E_δ|r(θ, δ) − e^{iθδ}|², averaged over a uniform fractional offset δ, summed over the saw's 1/k harmonics. Here r is the reader's response and θ = 2πk/N. At 2048 samples and 220 Hz: −36.8, −67.1 and −96.2 dB. At 256 samples and 220 Hz: −19.2, −31.7 and −36.0 dB. At 2048 samples and 55 Hz: −30.9, −49.2 and −62.3 dB.
- Linear and cubic match the piece to 0.1 dB.
- The sample-before reader comes out 0.3–0.6 dB lower in the formula than in the time domain, because its errors at different harmonics share one δ and correlate. That is a property of the formula, not an error in the piece.
- The slopes: as θ → 0, the formula gives 6.02, 12.04 and 18.06 dB per halving. Error order 1 for zero-order, 2 for linear, 3 for Catmull-Rom, which reproduces quadratics. The piece's "about 6, 12 and 19" is measured between 256 and 2048 samples at 880 Hz, where harmonic 27 of a 256-sample table (θ = 0.66) is not yet asymptotic. 19 is honest for that measurement. The rule of thumb is 18.

## The offers

1. **The loop filter's cost** (The same object as a loop, claim-change). **Confirmed**, every number, by a second route and in closed form (above). It does not contradict the page. It adds what the filter costs, so "claim-change" is right, as an addition. Read it beside Synthesis Topologies' open offer on the same seam: a loop half a sample longer, read halfway by a straight line, is Karplus-Strong's average at ρ = 1. The two agree. Together: the linear step is the start of a plucked string, the allpass the start of a dispersion curve, and neither is the table.
2. **The read must hold still** (Why it can only be harmonic, claim-change). **Confirmed**, with the remake's two caveats: the numbers are at 48 kHz, and the bend's peak passes 1. A one-to-one bend gives the same finding, −9.5 to −1.1 dB. Stronger support than the offer gives itself: the page's paraphrase is weaker than the theorem it cites. Three Kinds of Warp's hypothesis, φ(t + T) − φ(t) = 2π for every t, is "read the same way every trip". So the suggested "and is read the same way" brings the sentence back to its own proof.
3. **"Not measured here yet" now measured** (Building one, claim-change). **Confirmed**, and checked against the closed-form error. Suggest the line add the slopes in their textbook form: about 6, 12 and 18 dB per doubling, error orders 1, 2 and 3.
4. **Forward Vector** (claim-change). **Confirmed.** `FM Synthesis.md`:64 answers the FM bullet in words ("the ratio is the scope: whole numbers keep the series, anything else leaves it"). The identity bullet is met once Loudon approves § The same object as a loop. One correction to the offer's wording: "−7.02 dB between the harmonics as predicted" should say predicted by what, namely the blend's algebra, d²/2 · mean((B − A)²) over the whole.

## The face as a whole

It makes the page's idea felt rather than busy. Four walks, one per claim, each opening on one thing alone and ending on the test. Three of the four tests could have come out the other way, and the bell's moving bend is the one that teaches the text something. The thread through all four is the page's own: one stored cycle stays harmonic for exactly as long as nothing else keeps time. A filter in the loop, a bend that moves, a Position driven at its own rate: each is a second clock, and each piece finds the line where it starts. The face's weak spots are small and all in words: a caption true at one sample rate, two places where "by construction" or "predicted by" should be said aloud. Nobody has listened yet, and the error-alone sounds in the last piece are where an ear will matter most.
