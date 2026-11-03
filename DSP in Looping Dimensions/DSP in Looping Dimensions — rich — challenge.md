---
title: "DSP in Looping Dimensions — rich — challenge"
born: 2026-11-03
links:
  - target: "[[DSP in Looping Dimensions]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of DSP in Looping Dimensions' first rich face, piece by piece and offer by offer, with the transfer functions worked out and the numbers recomputed by a hand that did not make them, so Loudon can see which of the six offers stand against his page's central idea and which need a smaller word."
---

# Challenge — the proposal round, 2026-11-03

By the challenger (claude-opus-5-5), against the maker's commit 3c154fdb. I judged from the page, the pieces and the commit body. Six pieces: **4 keep, 2 remake, 0 retire.** Both remakes are words, not engines: a caption clause and a mislabelled threshold.

## What I ran

- `node "DSP in Looping Dimensions — rich — checks.mjs"`: every number in the commit body came back the same, in 3.9 s.
- My own scripts, in the scratchpad, not the palace (numpy, scipy):
  - the comb pair's response straight from the formula, in a row and side by side, read at the 58 mixed points, the axes and 4,000 random frequencies, with no noise and no bin-picking;
  - the nearest m·220 + n·220φ to 300 Hz by brute force;
  - the six-loop tone's lines from the Bessel expansion (scipy's `jv`, nothing pruned above 10⁻⁹), counted against three thresholds;
  - the poles of the two coupled Karplus-Strong loops, both mixers, at 999 settings of c (8 kHz, delays 36 and 58 samples, the two-point average and ρ = 0.996 kept), looking for any two that meet.
- `conform.mjs "DSP in Looping Dimensions"`: 5 pages, introduced 5, **0 errors, 3 warnings**, all three on the gathered ratio gate (its `lattices.json` fetch blocked in conform's opaque frame ×2, play-silent ×1 following from it). The three made pieces and the lattice read back: 0 and 0. The maker reported 6 warnings; 3 of those were file-local on pieces his commit has since tracked.
- `fingerprint.mjs`: all three sections in step (fa59acbcf41f, bfac25dbdeca, 2d3720aebd7e).
- The face served from the worktree, opened in headless Chromium at 1200 px, scrolled until all five frames loaded, each made piece driven to its last step: **console clean** (no message of any kind), all three verdicts rendered with the commit body's numbers, proposal chips shown.
- Tracked: the three made pieces, the ratio gate and its `lattices.json`, the lattice read back, the Penrose plot. Nothing from Splice. No piece makes a sound before a click. None carries its own `visibilitychange`; the kit hushes a hidden page (`_ops/rich-face/README.md:289`).

## The pieces

### Principle — the ratio gate (gathered from the 2D Torus face) · keep

Not re-judged, per the brief. The caption quotes its finding as its maker's and challenger's, says "not re-measured here", and the source manifest's challenge kept it. Honest.

### Principle — the lattice read back (gathered from Dissolutions) · keep

A test: hand it audio and it reads the rank back, so it could disagree with the paragraph. The caption's "with whole numbers allowed to grow without limit, any finite set of peaks is rank 1" is the proof's own sentence, nearly word for word. The storage note is honest.

### Frames — two combs · keep, with a note

1. **Tests.** The last step could have found the mixed points standing up through the combs; it finds them at the floor.
2. **Faithful, with one gap.** The page says two *coupled* combs; the piece puts them in a row. In a row is one coupling, and the weakest. The linear argument below covers every way of joining them, and the snap-or-slide piece tests the cross-coupled case, but this piece should say so in a line, so a reader does not think the cascade was the only reading tried. The maker's own offer already names coupling.
3. **Walks up.** One comb, two, the scan, the test, the formula shown beside the feedback version the ear hears.

### Frames — snap or slide · remake (caption only)

1. **Tests.** A jump would show as a change that stays the same size when the notch is halved. It halves.
2. **Faithful in the piece, not quite in the caption.** The piece's own formulas and verdict say the lossless mixer lands on the *odd* harmonics of f_S ⁄ 2 (42.0 Hz), because the rotation flips a sign on the way round. The caption, and offer 4, say "both land on the series of one loop as long as both, f₁·f₂ ⁄ (f₁ + f₂): 84 Hz". The crossfeed lands on 84.03 Hz's series; the lossless mixer lands between its lines, at (k + ½)·84.03 Hz. I worked out the lossless characteristic equation by hand from M = [cos, sin; −sin, cos]: det(I − M·D) = 1 − cos θ·(z₁ + z₂) + z₁z₂, which gives the piece's cos(πf(T₁ + T₂)) = cos(cπ⁄2)·cos(πf(T₂ − T₁)), and at c = 1 it gives cos(πf(T₁ + T₂)) = 0. **Do this:** change the caption's last sentence to "The crossfeed lands on the series of one loop as long as both, f₁·f₂ ⁄ (f₁ + f₂): 84 Hz for 220 and 136; the lossless mixer, which flips a sign on the way round, on its odd half-series." Make the same change in offer 4's "Both land on…". Also: the caption's "×0.50, then ×0.25" is exact for the distance reading; the spectral-change reading runs ×0.42–0.51, then ×0.19–0.26. Still a slide; say "about".
3. **Walks up.** One loop, two apart, the knob, plucks while it turns, the whole knob.

### Frames — where a snap does live (gathered plot) · keep

It sets the right contrast. Its numbers match the 2D Torus manifest's caption and challenge (K* = 0.80 Hz, ratio 1.518 pulled to 3 ⁄ 2) and the steward's codebox note (`RNBO/torus_2d_kuramoto.codebox:30`).

### Honest Limit — listen longer · remake (one label)

1. **Tests.** If a lattice could pass for noise, the six-loop curve would sit on the grey line. It doesn't: 40.7 % against noise's 34.5–36.2 % from the shortest window, 51.2 % at 5.5 s. A finite listen can't prove the limit for every N, but it could have failed for these six loops, and it didn't.
2. **One label is wrong.** "136,862 lines within 60 dB of the loudest" counts lines above an *absolute* amplitude of 10⁻³ (`checks.mjs`, the `> 1e-3` test). The loudest line in the band is 0.0638, so that threshold sits **36 dB** below it, not 60. Within 60 dB of the loudest there are about **4.10 million** lines; within 40 dB, about 334,000. The bin count, 21,299, holds. The conclusion only gets stronger. **Do this:** either make the threshold relative (10⁻³ × the loudest line) and write the new count, or keep 136,862 and say "within 36 dB of the loudest". It appears in the piece's note, its six-loop verdict sentence, offer 6 and the `checks.mjs` label.
3. **Walks up.** One loop, loops added, noise beside them, the test. The noise-share figure, (1 + ln 10) ⁄ 10 ≈ 0.33, checks out for exponentially distributed bin power.

## The offers

**1 — Principle, "plus every integer combination". Confirmed.** Cascade of two combs: H(f) = H₁(f)·H₂(f), with H₁ = 1 ⁄ (1 − a·e^(−i2πfT₁)) and H₂ = 1 ⁄ (1 − b·e^(−i2πfT₂)). Side by side: H = H₁ + H₂, whose denominator is the same product. Either way the poles are where a factor's denominator vanishes, f = k ⁄ T₁ or l ⁄ T₂: the axes only. A product of two periodic spectra is evaluated at the *same* f, so it cannot put a line at m⁄T₁ + n⁄T₂. Sums of frequencies need frequency-domain convolution, which is multiplication in time: a table read at two phases, a ring modulator, a nonlinearity. An LTI system cannot make a frequency its input lacks. My analytic numbers, power against the band's median (60–1500 Hz): in a row, axes +26.5 dB, the 58 mixed points −1.6, random −0.4; side by side, +23.0, −1.0, −0.2. The maker's +24.6 / +0.6 / +1.6 differ only by his ±1.5 Hz strongest-bin reading on noise, which leans everything up. The principle's bullet is true of Frame 1, where the loops are read through one table, and false of the linear frames.

**2 — Principle, "phase-locks" → "the scan closes". Confirmed.** A fixed rational ratio folds m·f₁ + n·f₂ onto one series by arithmetic; nothing in a fixed-ratio scan has a phase that could lock.

**3 — Frame 2, "exactly the same spectral signature". Confirmed, with one correction to the proposed sentence.** The page's Frame 2 plainly makes this claim, and it is a linear claim: "kernel design", "circular convolution wearing a feedback costume", and the very next paragraph flags breaking LTI as future territory. The maker did not read a nonlinear meaning out of a linear sentence; the page meant linear, and linear can't do it. The time-domain find is real and is the page's own Frequency-Time Duality rhyme: a cascade multiplies spectra, so it convolves impulse responses, and convolving two echo trains makes echoes at every j·T₁ + k·T₂; a scan multiplies in time, so it convolves line spectra, and makes lines at every m·f₁ + n·f₂. The lattice lives in whichever domain the convolution happens in. **But** the lattice in time holds in a row and cross-coupled (echoes arrive at every path length through the loops), not side by side: H₁ + H₂ gives h = Σ aʲ δ(t − jT₁) + Σ bᵏ δ(t − kT₂), the two axes in time as well. The proposed sentence should say "in a row or cross-coupled". The page's other sentence ("spectral support on an N-dimensional lattice") is loose rather than wrong: a damped comb's spectrum covers every frequency.

**4 — Frame 3, "a bifurcation, not a smooth morph". Confirmed, wording fix as above.** The page claims it for *passive* loops: "a quasi-periodic plucked-string algorithm", Karplus-Strong with cross-mixing. Its modes are roots of det(I − M(c)·D(z)) = 0, a polynomial whose coefficients are smooth in c; the roots are continuous in c, so they cannot jump. A linear system can still have a square-root corner where two modes meet (an exceptional point, a "linear lock"), and the crossfeed is a lossy mixer where one might be. I looked: across 999 settings of c, neither mixer brings any two poles closer than they already are at c → 0 (1.8 × 10⁻³ in z, two near-coincident harmonics of the uncoupled loops). No corner, no jump, and no threshold: the crossfeed reaches the sum loop's series at c = 1, the lossless mixer its odd half-series at c = 1. All 12 runs re-ran the same. A Kuramoto snap needs oscillators that sustain themselves; the bowed-loop case is still untested, as the maker says.

**5 — Honest Limit, "discrete". Numbers confirmed; the claim-change overstates.** Brute force over |m|, |n| ≤ K: 4.0325 Hz at K = 20, 0.6504 Hz at 100, 0.0328 Hz at 1000. The set m·f₁ + n·f₂ is dense, so "lattice" in the strict sense (a discrete subgroup) is the wrong word. But "discrete spectrum" is also the standard name for a pure-point spectrum, countable lines however dense, and the page uses it that way itself two sections down: quasicrystals have a "discrete Fourier spectrum (so it's not noise)". Read that way, "discrete" is right. The offer's "discrete, no" should become a gloss, not a reversal: keep "discrete" and add "made of single lines, though dense on the frequency line once two rates are irrational". The page's own "rank-N Z-module" is already the exact name.

**6 — Honest Limit, listening time. Confirmed in substance; one number mislabelled.** The concentration figures re-ran exactly. The line count is "within 36 dB", not 60 (see listen longer). Within 60 dB it is about 4.10 million against 21,299 bins, so the proposed sentence stands, stronger.

## The face as a whole

It makes the page's idea felt by putting it under load. All three made pieces end on a measurement that could have gone the page's way, and two of them didn't. That is uncomfortable for a page whose principle is that each loop adds a fundamental "plus every integer combination". But what survives is sharper than what was there. The integer combinations come from reading loops together through one table, a product. Filters and feedback leave each loop its own series in frequency and lay the lattice out in time. And the duality the page already wants to articulate, with [[Frequency-Time Duality]], is exactly the hinge. The face is not busy. Three made pieces, three gathered, each answering one sentence. The two remakes are wording, and in both the corrected statement holds more firmly than the one that was there.
