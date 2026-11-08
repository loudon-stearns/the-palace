---
title: "Granular Synthesis — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Granular Synthesis]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of this page's proposed rich face, piece by piece and offer by offer, with the numbers re-run on the pieces' own engines and two of them re-derived from scratch, so Loudon can tell which findings say the page is wrong and which say only that the sketched design behaves differently from its description."
---

# Challenge — Granular Synthesis's rich face, proposal round 2026-11-03

Challenger: claude-opus-5-5, who did not make the face. Judged from the page (`Granular Synthesis.md`, unchanged in the worktree), the manifest, the six pieces it names, and the maker's commit body (95e7585e) as its only account.

**Tally: 4 keep, 2 remake, 0 retire.** Both remakes come from the same cause. The engines count a grain as caught when its mean frequency over the second half of its life is within 0.6 Hz of a partial. A grain that is locked, but that the neighbouring partials wobble, fails that test. So the caught shares at 60–300 ms (capture) and at the strong pull (three regimes) come out low. The fix is one round's work. Everything else in the walks holds up.

## What I ran

- `checks.mjs`, on a copy of the bundle in the scratchpad so the tracked `checks.json` stays as committed: **all 25 pass**, every number the maker quotes reproduced to the digit (random-onset miss 0.66–0.88 dB, spread 0.75–1.29, regular 46.07–57.09; density ×100 +20.43 to +20.82 dB; catchments 30.3 / 10.6 Hz; pile 0.012 / 0.031; sweep 0.026 / 0.066 / 0.148 / 0.257 / 0.414 / 0.511; wells 49.3% / 100%, 57.0% / 87.1%; pile r 0.782 / 0.795 / 0.832 / 0.919 / 0.960; random clouds 0/6, 0/6, 4/6).
- `conform.mjs "Granular Synthesis"`: 4 pages, introduced 4, **errors 0, warnings 0**, browser at 760 and 1130 px.
- `fingerprint.mjs "Granular Synthesis"`: all five made sections **in step** (Origin has no pieces).
- The face, served with `rich-server.mjs --root <worktree> --detach`, then walked headless in Chromium through playwright. Four piece frames, 6 proposal chips, no unresolved-file boxes. Every step of all three made pieces was walked and play clicked. No `AudioContext` before the first click. All three contexts were `suspended` after the page went hidden. **Console clean**, no page errors. Server stopped.
- Gathered files: both Particle Synthesis wavs and the Neural crowd-size ladder are tracked. The wav captions' numbers (13 meetings, 119 of 360) match their source, as Particle Synthesis's own challenge already traced (`Particle Synthesis — rich — challenge.md:76`). Nothing licensed is copied.
- Independent work (scripts in the scratchpad, not kept):
  - onset counts for the density test;
  - the offer-4 identity, checked numerically;
  - Monte Carlo of π/4;
  - a lone-partial Adler integrator in numpy, run at the capture piece's settings;
  - the three-regimes engine run one grain at a time at K_A 40 and 80;
  - both engines' `stats()` re-read at tolerances of 0.6, 1, 2, 3 and 5 Hz.

## The pieces

### § Granular Synthesis — `atom and material.html` — **keep**

1. **Test or decoration?** A test. The random-onset half is Campbell's theorem, so it can only fail through a bug. What makes it a test is the pairing: random onsets land on one grain's prediction, and the same grains on a clock miss it, against a prediction with no free knob. That pairing is a real reading of "collective statistical behavior produces emergent timbres" (`Granular Synthesis.md:31`), and it could have come out the other way.
2. **Faithful?** Yes on the numbers. The last sentence of the verdict box overreaches, and so does offer 1 (below): "the atom sets the color … at one pitch or many" and "what a random cloud adds is texture, not timbre". With pitches spread, the measured color is one grain's spectrum averaged over the population's pitch distribution. That distribution is a collective statistic, so for a spread cloud the page's sentence is closer to right than the verdict. And "not timbre" counts timbre as nothing but the long-term spectrum. The piece's own step 3 shows density changing gappiness and fusion while that spectrum stays put. Advised, not required: scope the verdict to "identical, independent grains", and say "spectrum" where it says "color".
3. **Walks up?** Cleanly: one grain, its window, a cloud, the test. Each step plays on its own.

Note: the "46–57 dB" regular-onset miss is an rms of dB ratios, dominated by the comb's deep troughs. It is not the comb's lines sitting that far off. The equation under step 4 says how miss is computed, so the caption is honest. A reader may still take it as a level.

### § The Granular-Additive Attractor Hybrid — `capture.html` — **remake**

1. **Test or decoration?** A test. Step 4's "pile follows the filter" could fail and doesn't: 0.012 and 0.031 off the rule at 330 and 880 Hz (`:45`).
2. **Faithful?** The pile test is. The grain-length sweep blames its own yardstick's shortfall on the physics. I integrated Adler's equation for a lone partial at the piece's own settings (pull 30 Hz, detuning uniform over ±55 Hz, life ±25%, caught = mean frequency over the second half within 0.6 Hz). The share caught is 0.027 / 0.128 / 0.469 / 0.555 / 0.552 / 0.547 at 15 / 30 / 60 / 120 / 300 / 1000 ms. The lock-time estimate agrees. The lock relaxes with τ = 1/(2π√(P² − Δ²)), which is 5.3 ms at the centre. Allowing about 3.5 τ before half-life gives about 0 at 15–30 ms, 0.43 at 60, 0.52 at 120 and 0.545 from 300 on. So for a lone partial the fall is over by 60 ms.

   The engine's 0.148 at 60 ms, 0.257 at 120 and 0.414 at 300 come from the other ten partials, 110 Hz apart at full pull. They swing a locked grain's phase back and forth, and the mean frequency over a short window misses 0.6 Hz. Re-read at 2 Hz, the engine gives 0.094 / 0.203 / 0.361 / 0.480 / 0.515 / 0.513. The verdict line "catching takes time … and a short grain dies first" is true below about 60 ms. At 60–300 ms the grains are caught, and the yardstick can't see it.
3. **Walks up?** Yes: one grain and one partial, two wells, the whole hybrid under a filter you drag, then the test.

**The remake, exactly:**
- Measure caught in the sweep by phase, not by mean frequency within 0.6 Hz. Count a grain as caught if its phase against the partial does not slip a turn over the second half of its life. Failing that, show the 2 Hz row beside the 0.6 Hz row and name the yardstick.
- Add the lone-partial row (above) as the ceiling the sweep is read against.
- Rewrite the verdict box and the caption's "60 ms 0.15, 300 ms 0.41" from the new numbers.
- Update offer 2 to match.
- Worth one sentence: below about 30 ms a Hann grain's own width, 2/T (67–133 Hz), is wider than the 60 Hz catchment. A pile of short grains couldn't be heard even if it formed. That is step 1's uncertainty trade from the first piece, turning up in the hybrid.

Small: step 1's "within 6%" is "within 0.3 Hz or 6%". At pull 5, Δ 5.5, the beat is 2.44 Hz against 2.29 Hz, 6.6% off, and it passes on the 0.3 Hz floor.

### § Three Coupling Regimes — `three regimes.html` — **remake**

1. **Test or decoration?** A test, and the best on the face. Step 6 sets three bends against six unplaced clouds with a straight-line control, and the result could have gone either way (`:62`). Step 3 measures the pile's coherence against a prediction (`:60`).
2. **Faithful?** Steps 3–6 are. Step 2's caught meter has capture's yardstick problem, and it carries offer 5's "many still find none".
   - At K_A 40 Hz the meter matches the lone-partial rule: 49.3% measured, 49.8% from the rule.
   - At K_A 80 Hz it reads 57.0%. At a 1 Hz yardstick it reads 72.3%, at 2 Hz 78.5%, and the lone-partial rule says 92.4%.
   - Run one grain at a time with a 4 s life, every birth from 385 to 485 Hz ends exactly on 440. With a 400 ms life, the same grain born on 440 reads 439.68, 438.80, 440.59 …: locked, and wobbled by the 80 Hz pull of the loud partials 220 Hz away.
   - The nearest-partial share is the robust number: 87.1% at 0.6 Hz and 87.9% at 2 Hz, against 79.5% from the lone rule.
3. **Walks up?** Yes, one pull at a time across six steps. Step 5 places the strays by hand before step 6 lets the cloud place them.

**The remake, exactly:**
- Use the same caught-by-phase measure as capture, which is the same `stats()` in a shared engine.
- Re-read step 2's meters and the caption's "57% caught".
- Bring offer 5's "many grains find none" down to what holds: with the wells apart, about half the grains sit between wells and are never caught; at the strong pull nearly all are caught.
- "Overlapping" in the caption is loose. The piece itself defines it as "the loud ones reach past 55 Hz", the midpoint to the quiet neighbour. By the lone rule the catchments themselves don't overlap: 440's runs from 360 to 520 Hz and 330's from 310 to 350. Say "reach past the midpoint".

Nothing to change in steps 3–6.

### § Particle Synthesis Angle — `2026-09-23-grains-05-crossing-collide.wav` — **keep**

It makes the "Collision and merging" bullet (`:76`) heard, against a control at the same gain. Its numbers match the source. Margin audio, so no walk is owed.

### § Particle Synthesis Angle — `2026-09-23-grains-04-crossing-pass-through.wav` — **keep**

The control that turns the pair into an A/B. Note for the caption: the B is collisions off, not the bullet's "conventional: crossfade grain parameters". So "not by a crossfade" claims a little more than the pair shows. Say "the meeting is the rule's, not the launches'".

### § Open Questions — `Neural Granular Synthesis — rich — crowd-size ladder.html` — **keep**

Gathered, tracked and conform-clean. The caption says plainly that it is not the attractor hybrid. One word to watch: "a dense cloud that locks does lose its motion into a pulse" uses Neural's lock, where the firings fall into step. That is not this page's lock, where a grain's carrier phase locks to a partial and the onsets stay random. Write "a crowd whose firings lock". In the hybrid, the capture walk finds the onsets untouched by the catch.

## The offers

1. **Opening sentence, claim-change. Numbers confirmed; the reading disputed in part.** The level step: 10·log10(100) = 20 dB. The extra 0.4–0.8 dB is sampling, not physics: at seed 7 the 20-a-second cloud drew 107 grains against 120 expected (−0.50 dB). The comb at the clock rate is standard. But the suggested "the color itself is the grain's" is true only for identical, independent grains. With spread pitches the color is the population's pitch distribution acting through the grain, which is the page's "collective statistical behavior". And Campbell's theorem does not hold for the coupled clouds the rest of this page is about. Better as an addition than a replacement: "for independent grains at random onsets, the spectrum is one grain's averaged over the cloud's pitches, raised by the density; timing statistics are what add new lines". Also, Neural Granular Synthesis's open offer proposes that grains "fuse into color, texture and intentional timbre". If both offers are taken, "color" would mean two things on two pages. Pick one word. The two offers agree on substance: the crowd adds steadiness, not pitch.
2. **Grain length, claim-change. Direction confirmed; numbers disputed.** Short grains aren't caught below about 60 ms: lone Adler gives 0.027 at 15 ms and 0.128 at 30. The suggested sentence, "catching takes about 1/(A_k·K) and several times that", matches the derivation: 1/(2π·30 Hz) = 5.3 ms, about 3.5 of those before half-life. The 60 / 120 / 300 ms shares quoted are the yardstick's, not the catch's. The lone partial reaches 0.469 / 0.555 / 0.552, and the engine 0.361 / 0.480 / 0.515 at 2 Hz. Re-quote after the remake.
3. **K's unit, no-claim-edit. Confirmed.** In `dθ/dt = ω + Σ A_k K sin(…)` (`:49`), θ is in radians and t in seconds, so K is in rad/s. Locking needs |ω − ω_k| < A_k·K, which is |f − f_k| < A_k·K/2π Hz (Adler). Step 1's 15 settings bear it out, within 0.3 Hz or 6%.
4. **Cost, claim-change. Confirmed.** Σ_k A_k sin(Θ_k − θ_i) = Im(X·e^(−iθ_i)), with X = Σ_k A_k e^(iΘ_k). Checked numerically, the largest error over 1000 random cases was 9×10⁻¹⁶. So the attractor sum costs N_grains + N_partials per sample (`:54`). A sharpening the offer could add: the same mean-field trick makes all-to-all grain-to-grain coupling cost N_grains too, as the engine's own Z shows. So "no grain-to-grain interactions" is not what makes the hybrid cheap.
5. **Nearest partial, claim-change. Half confirmed.** "Usually the nearest, sometimes a louder one further off" is confirmed: 13% at K_A 80, robust to the yardstick, and 20% by the lone rule. Grains between wells are confirmed at K_A 40: 49% caught, matching the rule's 50%. "57% caught" at K_A 80 is the yardstick's; it is 79% at 2 Hz and 92% by the lone rule. On the engine's well definition: there is no well object. Each grain feels the whole complex sum of partials, and a "well" is partial k's catchment, A_k·K/2π Hz. The page's sentence (`:58`) is an idealization the page's own equation breaks once a loud catchment reaches past the midpoint. That is the design as sketched doing what its equation says, not the page being wrong about the equation.
6. **Phase-locked piles, claim-change. Confirmed, and here the page is wrong by its own equation.** A caught grain sits where sin φ = Δ/P. Grains born evenly across the catchment have Δ uniform on (−P, P), so sin φ is uniform on (−1, 1), and r = E[cos φ] = E[√(1 − u²)] = π/4 (Monte Carlo 0.7852). The 24-grain pile, born within 42 Hz of a 30 Hz pull, catches 73% (the rule says 71%) at r 0.782. So attractor-only piles are already phase-locked clusters (`:60`). The grain-to-grain coupling's real work, in level: caught × r goes from 0.73 × 0.782 = 0.57 to 0.99 × 0.960 = 0.95, about +4.4 dB on the pile's coherent sum. That bears out the page's "reinforced partial". It also undercuts "tight chorus … built-in micromotion" for attractor-only piles (`:58`). Locked grains don't beat with one another; the motion comes from births, deaths and the uncaught. The maker may want to carry that in the same offer.
7. **Soft clip, claim-change. Confirmed, and the page needs "asymmetric" plus a hedge, not a reversal.** "Harmonic locking appears" holds for a soft clip: placed strays lock 3:1. "Or any nonlinearity" is wrong for even ratios as a matter of symmetry, not of this sketch: an odd function of a sine makes only odd harmonics. "Self-organizes into a harmonic series" is this sketch's behaviour, and the sketch puts the bend on the summed cloud. There, the soft clip grew nothing in 6 clouds, and the lopsided bend grew 19 grains at 2× and 3× across 4 of 6 clouds, out of 384 grains (3 of 6 in Chromium). That is the start of a series, not a series. Another placement, such as each grain clipped on its own, or longer runs, might do more, so the wording should say "can begin to", as the suggested text nearly does.

## The neighbours

Neural Granular Synthesis's face (landed, 88a60039) and Bayesian Granular Synthesizer's (landed after d6a8f295) don't contradict this one. They agree:
- Neural's "what the crowd adds is steadiness, not pitch" is offer 1's finding on another engine.
- Bayesian's "a 4-cycle grain spreads about ±151 cents, so the sharpening is mostly inaudible" is the same uncertainty trade I'm asking capture to name.
- Bayesian's Poisson gaps and its "Gaussian only where many grains overlap" sit with this face's random-onset cloud.

Two words need care if the offers go home: "color" (offer 1, above) and "lock" (the ladder's caption, above).

## The face as a whole

It makes the idea felt, not busy. Each walk starts from one sine you can hear and ends on a sentence of the page put to a measurement. Together they turn an architecture sketched in prose into something you can play and argue with. The best of it is the third walk. It doesn't just illustrate the boldest sentence on the page, the cloud that tunes itself. It finds that the symmetric bend the page names can't do it and an asymmetric one can begin to. The fault is narrow and shared: one yardstick, too fine for a locked grain that is wobbling, read as physics in two places. Fix that and the face's findings stand on their own numbers. Nobody has heard it; the mix, the levels and whether the clouds sound good are unchecked.
