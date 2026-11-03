---
title: "Bessel Functions in Synthesis — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Bessel Functions in Synthesis]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of Bessel Functions in Synthesis's first rich face, the proposal round of 2026-11-03: each of its five pieces judged against the page's words with a reason, and each of the maker's six offers recomputed apart from the pieces, with SciPy and a plain synthesis, so Loudon can answer the offers knowing which numbers hold and which ruler they were measured with."
---

# Bessel Functions in Synthesis — rich — challenge

Read against the page as it stands in the worktree (`Projects/Bessel Functions in Synthesis.md`, unchanged by the maker) and the maker's commit af60e26a, the only account taken of how the face was made. Nothing in a piece or the page was changed. Recomputations ran in scratch with SciPy 1.17 and numpy, apart from the pieces' engines.

**Verdicts: 3 keep, 2 remake, 0 retire.**

## Pieces

### proofs/2026-05-04-bessel-fm-correlation.png (gathered, The FM-Bessel Isomorphism) — remake, caption only

1. **Test or decoration:** decoration. It draws Jₙ and the stems Jₙ predicts; nothing in it could come out otherwise.
2. **Faithful:** the figure is true to the maths, but the caption overstates what its lower panels are. It calls them "the spectra they predict" and flags only the J₅ stem at 0 Hz. At 1000 : 200 Hz (5 : 1) the sidebands below 0 Hz are simply off the axis, and they fold back. Synthesised and measured: at β 6 the 200 Hz partial is J₄ − J₆ = **0.112**, drawn as 0.358; the 400 Hz partial is **0.015**, drawn as 0.115; the 600 Hz partial is 0.299, drawn as 0.243. At β 4 the 200 Hz partial is 0.232, drawn as 0.281. This is the very point of the maker's second offer, and the gathered figure is its sharpest example.
3. **Walks up:** not a walk; a still figure.

Remake: one sentence added to the caption, e.g. "Each stem is one sideband's Jₙ, not the partial you hear: the sidebands below 0 Hz are off the axis and fold back, so at β 6 the 200 Hz partial is J₄ − J₆ = 0.11, not 0.36, and the 400 Hz one nearly vanishes." The PNG itself stays (FM Synthesis's staged patch also declares it).

### Bessel Functions in Synthesis — rich — carrier null.html (The FM-Bessel Isomorphism) — remake, one word

1. **Test or decoration:** a test. The measurement renders the engine and reads it by plain DFT on exact bins; nothing in it calls `besselJ`. Had the sidebands not been Jₙ, the outlines and the lines would part.
2. **Faithful:** yes, and it stops exactly where the text's "exact" stops: the 1 : 1 control shows the fold without claiming the text is wrong. One factual slip: step 4's teach line says "At β 0 you hear a plain **880 Hz** sine." The carrier is 1100 Hz throughout. A listener reads one number and hears another. (The checks file carries the same stale 880 in a comment, line 58.)
3. **Walks up:** yes: carrier alone, the first pair, the J₀–J₇ landscape, a window on the carrier, then 2.4048. One idea a step.

Remake: change 880 to 1100 in step 4's teach, and the comment in the checks. A note, not a condition: the caption's "241 dB down" is the floating-point floor, not a level (the maker's checks print −275 dB, my numpy synthesis −299 dB). "At the floating-point floor, below −240 dB" says what was found.

### proofs/2026-05-04-six-modes.png (gathered, Eigenfunction Principle) — keep

1. **Test or decoration:** decoration, and honest about it: it shows the shapes the section names.
2. **Faithful:** yes. The six zeros in the caption match A&S Table 9.5. The figure's own title, "the basis for FM-style inharmonic spectra", leans further than the page does; the caption doesn't repeat it.
3. **Walks up:** a still figure.

### Bessel Functions in Synthesis — rich — drum head.html (Eigenfunction Principle) — keep, with notes

1. **Test or decoration:** a test, but partly by construction. In a modal model the mode frequencies are fixed before any strike, so "the strike never moves them" cannot fail. What is measured, and could have come out otherwise, is the best strike's share: four membrane modes do sit within 20 cents of a whole number, (4,3) at 5.977, (10,1) at 6.019, (12,1) at 6.944 and (6,3) at 7.071, so a strike that favoured them would have raised the share. None does. My recomputation: best of the piece's 99 radii **8.54 % at r 0.98**; on a fine grid of 2000 radii, 8.58 % at the rim. The centre strike leaves only m = 0, by symmetry (Jₘ(0) = 0 for m > 0), at 1, 2.295, 3.598, 4.903. Confirmed.
2. **Faithful:** yes; the zeros are found, not typed, and match A&S to 4.4 × 10⁻⁵. Two rounding slips in what the reader sees: step 3's teach and the equation words give 3.8317 ⁄ 2.4048 as **1.594**; it is 1.5934, so 1.593 (the checks file has it right). Step 3's 2.918 is 2.9173, so 2.917.
3. **Walks up:** yes: a string, where you strike it, a drum head, the two together, strike anywhere.

The slips are worth fixing in the same round as the carrier null, but they don't change a claim. The hint's line on timpani air is honest scope.

### Bessel Functions in Synthesis — rich — order as a knob.html (Synthesis Applications) — keep, with a note

1. **Test or decoration:** a test. The peak table is found on the engine's values (which match SciPy to 6.9 × 10⁻¹⁰), and it disagrees with the text, which is what a test is for.
2. **Faithful:** yes. The page says "the peak of Jₙ occurs approximately at t=n"; the piece says "it leans", sets each peak against n, and leaves the change to the offer. My peaks (first zero of J′ₙ, SciPy): 1.8412, 3.0542, 4.2012, 5.3176, 6.4156, 7.5013, 8.5778, 9.6474. At x = n, Jₙ is 75.6 % down to 68.9 % of its peak. Both match the table.
3. **Walks up:** yes: J₀, J₀ against its shadow, J₁, the order as a knob, the test.

Note: step 5's teach says "Play the orders 0 to 8 in turn" and the button reads "orders 0 to 8 in turn", but `runOrders()` steps `n += 2`: it plays 0, 2, 4, 6, 8. Say so on the button, or play all nine.

## Checks run

- `node _ops/rich-face/conform.mjs "Bessel Functions in Synthesis"`: 3 pieces, introduced, **0 errors, 0 warnings**, browser pass at 760 and 1130 px. (The maker's three file-local warnings were for untracked files; they are tracked now.)
- `node _ops/rich-face/fingerprint.mjs "Bessel Functions in Synthesis"`: the three made sections **in step**.
- The maker's checks, `Bessel Functions in Synthesis — proof — rich face checks.mjs`: **34 passed, 0 failed.**
- Served with `rich-server.mjs --root <worktree> --detach`, opened `?entry=Bessel Functions in Synthesis` in headless Chromium, scrolled so all three pieces loaded, walked every step and pressed every control on each last step: **console clean**.
- With `AudioContext` counted by an init script: no context before the first click in any piece; each runs after a click; on a simulated hide each context goes to `suspended`. No piece names `rich:hush`, so the kit quiets them.
- Every file the face names is tracked in the bundle. Nothing licensed is copied.

## The numbers recomputed

**The carrier null.** At β = 2.404825557695773 the carrier synthesised at 11 : 1 (44 kHz, 4400 samples, exact bins) is −299 dB in numpy: the floor. Through the window (three RBJ band-passes, Q 40 each, at 1100 Hz, rendered at 48 kHz), the RMS drops **−54.59 dB** from β 0. The window passes 1100 Hz at 0 dB and holds 1000 and 1200 Hz at −53.3 and −51.0 dB. What it lets through at the null is not the carrier at all: summing every sideband's Jₙ(2.4048) times the window's gain at its frequency gives −54.594 dB, the measured figure to three decimals. So the −55 dB is the window's leakage floor, set by J₁(2.4048) = 0.519 either side of a hole. The null itself is total; the window decides how deep it can be heard. The piece's verdict says exactly that ("only what leaks from the sidebands either side").

**Why 11 : 1.** The page names no 8 : 1; I computed it anyway. At 8 : 1 the lower sideband n = 9 lands at −100 Hz and folds onto the −7 rung (100 Hz), n = 10 onto −6, and so on; n = 16 reaches the carrier. Measured against |Jₙ| on rungs −7 to +7: the "under 0.001 dB" claim would fail by β 2.0 (0.0018 dB), pass 0.1 dB by β 2.6, and pass **1 dB at β 5.15** (0.95 dB at 5, 1.55 dB at 6, all on the −7 rung, where J₉ is 10 % and then 16 % of J₇). At 11 : 1 the worst over β 0–6 is 4.2 × 10⁻⁴ dB. The choice is right, and needed for the claim the piece makes.

**The ladder.** Above the carrier, the engine matches SciPy to 4.5 × 10⁻¹¹ (the maker's checks). Below, J₁₄(5) = 2.8 × 10⁻⁶ folds onto 300 Hz, the 8th rung down (1100 − 1400 = −300). Confirmed.

**The 1 : 1 fold.** sin(ωt + β sin ωt) = Σ Jₙ(β) sin((1 + n)ωt). The sideband n = −(k+1) lands at −kω, and J₋₍ₖ₊₁₎ = (−1)ᵏ⁺¹ Jₖ₊₁ with sin(−kωt) = −sin(kωt), so harmonic k is **Jₖ₋₁ + (−1)ᵏ Jₖ₊₁**. Synthesis matches the formula to 2 × 10⁻¹⁵ at β 1, 2.4048 and 3.5. At the null, J₀ − J₂ = −0.4318 (−7.3 dB). Confirmed.

## Offers

1. **The 1 : 1 sawtooth sentence (claim-change): the direction holds, the number's ruler is disputed.** "Never within 15 dB of 1/k" is the worst single harmonic of ten, in dB, against the fundamental: best 15.1 dB at β 6.77, which I reproduce. That ruler punishes any one harmonic near a Bessel zero, and it is not the ruler the FM Synthesis face uses. That face's feedback piece measures RMS dB over harmonics 2–10, and gets 1.0 dB at feedback 7. On that same ruler, plain 1 : 1 FM comes no closer than **7.6 dB, at β 6.83**. Its ratios piece says 1 : 1 near index 3.5 is "within about 4 dB" over harmonics 2–6; I get 3.7 dB at β 3.54. At β 3.5 harmonics 2–6 sit within 7 dB of 1/k, and 7–10 fall away, −14 to −48 dB. So the two faces agree that the close sawtooth is feedback's, and both are right in their numbers, but their words pull apart: one says 1 : 1 never comes within 15 dB, the other within about 4. And the FM Synthesis text (FM Synthesis.md:60) says "at 1:1 … the sound sits near a sawtooth", the very sentence this offer would contradict here. Suggested: keep the fold sentence; state the gap on the shared ruler ("its harmonics 2 to 10 never come within 7.6 dB rms of a sawtooth's; feedback at 7 comes within 1"); and put the FM Synthesis line 60 question to Loudon beside it, so the two pages answer it once.
2. **Where the exactness lives (no-claim-edit): confirmed.** The gathered figure is a live example (above): at 5 : 1 and β 6, the 200 Hz partial is a third of the stem drawn.
3. **The peak near n + 0.81·n^⅓ (no-claim-edit): confirmed, and better filed as a claim-change.** The page does say "approximately at t=n". The standard asymptotic for the first maximum, the first zero of J′ₙ, is n + 0.8086·n^⅓ + 0.0725·n^−⅓ + … (A&S 9.5.16). The leading two terms leave a residual of 0.030 to 0.036 for n 1 to 8, which is the third term; the maker's "within 0.04" holds. The offer moves a number the page states, by 0.84 to 1.65, so it changes a claim, small as it is.
4. **Zero spacing settles to π (claim-change): confirmed.** J₀'s gaps are 3.1153, 3.1336, 3.1378, 3.1394, 3.1401: 0.84 %, 0.25 %, 0.12 %, 0.07 % under π. |J₀ − √(2/πx)·cos(x − π/4)| past x = 5 peaks at **0.0077, at x = 5.33**, and stays under it to x = 1000. The LFO line's "irregular oscillation rate (slowing as amplitude decays)" is an exaggeration, not an error: the gaps do grow every time, so the oscillation does slow, but by under 1 % after the first gap, while the amplitude falls as 1/√x. "Irregular" is the overreach; "slowing" is true and tiny. The offer says this; it is right to call it a claim-change.
5. **The same, in Bessel Functions as Direct Waveforms (claim-change): confirmed.** One caution for the wording: the first stretch, 0 to 2.405, is not a zero-to-zero gap at all (J₀ starts at its peak), so "uneven only at the start" is right, and the 2.405 is not a short half-cycle.
6. **Gongs, tam-tams and bells (claim-change, no piece tests it): confirmed, with one clause disputed.** The page does claim the Bessel-zero spacing for gongs and tam-tams: "The first few modes of a struck gong or tam-tam are not at simple integer ratios—they follow the Bessel zero spacing", followed by "This is why bells ring inharmonic". A clamped round plate's roots of Jₘ(λ)Iₘ₊₁(λ) + Iₘ(λ)Jₘ₊₁(λ) = 0 are 3.196, 4.611, 5.906, 6.306, 7.144. Frequency goes as λ², so **1 : 2.08 : 3.41 : 3.89 : 5.00**, against the membrane's 1 : 1.59 : 2.14 : 2.30. Recomputed and confirmed. The disputed clause is the last: that founders "do get near" a bell "that rings like a harmonic sine wave". A tuned bell's partials, hum, prime, tierce, quint, nominal at about 0.5 : 1 : 1.2 : 1.5 : 2, are chosen, not harmonic: the minor-third tierce is what makes it a bell. Say instead that the profile lets founders choose the ratios, which still answers the page's "the boundary conditions forbid it".

## The face as a whole

It makes the page's idea felt in the right places, and it is not busy. Three walks, each on a different face of Bessel: the function as a spectrum, as a shape in space, as a sound in time. Each walks up from one idea and ends on a claim it can measure. The strongest thing about it is that it finds the page's edges without smoothing them: the exactness that holds per sideband and breaks at the fold, a centre strike that keeps only the rings, the peak that comes after n. The weakest is the one it inherits, the gathered FM figure, which draws the fold-blind spectrum the carrier piece was built to correct. Fixing that caption puts the face's own finding on the page in two places. What no piece reaches is the page's widest reach, the HRTF and the geometry map, and the offers rightly don't pretend otherwise. Nothing here has been heard. Whether the null is audible through the window is the maker's open question, and mine.
