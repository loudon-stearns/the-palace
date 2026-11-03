---
title: "Inharmonic Wavetable Synthesis — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of Inharmonic Wavetable Synthesis's first rich face, the proposal round of 2026-11-03: each of eighteen pieces judged against the page's words with a reason, and each of the maker's six offers recomputed from the bundle's measured strings and the pieces' own engines, so Loudon can answer the offers knowing which numbers hold, and where the maker and the steward are both right."
---

# Inharmonic Wavetable Synthesis — rich — challenge

Read against the page as it stands in the worktree (`Projects/Inharmonic Wavetable Synthesis.md`, byte-for-byte unchanged since the merge base 62559e1e) and the maker's commits 8dcec580 and 9c10e070, whose bodies are the only account taken of how the face was made. Nothing in a piece or the page was changed.

## Checks run

- `conform.mjs`: 5 pages, 4 introduced, 1 errored. The three made walks: 0 errors, 0 warnings. The coupling-edge study: 1 error (grant-missing: midi), 1 warning (sandbox-blocked: midi). The dual-wavetable study: 1 warning (play-silent). Same table as the maker's commit.
- `fingerprint.mjs`: all six made sections in step.
- The face served from the worktree and loaded headless (Playwright Chromium, 1400 px), every piece scrolled into view: 5 frames, 18 `proposal · 2026-11-03` chips, no missing-file boxes. The only console line on the whole face is the coupling study's MIDI permissions-policy block. Clicking each piece's own start control (`#go` on the three walks, `A2` on the dual study, `▸ start` on the coupling study) left a running AudioContext in every one. I did not count the postMessage warnings, as the task said.
- `check-hidden-hush.mjs`: all PASS. The walks have no visibility handler of their own and rely on the kit, which is the rule.
- The maker's three workshop checks re-run: bend 22 PASS, settle 15 PASS, bundle 9 PASS. Two of the bundle lines ("measured string: barely fans", "widest anywhere") are hard-wired `true`. They report a number and test nothing.
- Independent recomputation in Python from `trajectory-library/piano-low-A1`, `piano-A2`, `piano-A3`, `piano-A4` and `bell-brooklyn-C6.wtb.json`, and from scipy's J₀ zeros. The scripts are in my scratchpad, not the bundle. The numbers are below.
- Published B values: Hinrichsen, *Entropy-based Tuning of Musical Instruments* (arXiv 1203.5101), read in full text: "In a piano the value of B varies typically between 0.0002 for bass strings up to 0.4 for treble strings." Rauhala, Lehtonen and Välimäki (*Fast automatic inharmonicity estimation algorithm*) put piano bass tones at 10⁻⁴ to 10⁻³. That one I saw only as a search snippet, because the full text was behind a 403.

## Pieces

### The Architecture

**bend the line (made) — keep.**
1. It tests the page's claims. Step 2 rebuilds the table as a bank of sines to within 2 × 10⁻¹³ and step 4 sends every line home at D = 0, which tests "a flat horizontal line is the harmonic series". Step 5 tests "the shape of the deviation encodes the physics of a material" against measured strings and a measured bell, and it could have failed.
2. It is faithful. The bell result goes against the page's Bessel sentence and is held as an offer, not smoothed. Note: the bell's 1239 c is to a best bow clamped at B = 0, and the distances depend on rank filing. The bell is off J₀ under any filing, though: its modes run 1, 1.135, 1.451, 2.178, against J₀'s 1, 2.295, 3.598.
3. It walks up: table, flat-line bank, one bent partial, any curve, materials.

**proofs/2026-05-04-bending-spectra-v2.png (gathered) — keep.** The figure's own title reads "B sweeping 0 → 0.005 over 12 seconds", with four panels, and the peaks walk right of the grid. The caption is accurate.

**proofs/2026-05-04-bending-the-line-v2.wav (gathered) — keep.** The library measures 5.0 × 10⁻³ at F♯6 (scroll, steward-020 table), which matches the caption. Its sound is unchecked.

**rich-face/bent-line-take.wav (gathered, tracked) — keep.** The caption matches the scroll's own account: rank, then nearest, Bend to 0, then the piano chord to twice the string. "Nobody had listened" matches the scroll's "Nobody has played it in Live or listened to the take yet". It was synthesized, nothing licensed was copied, and its sound is unchecked.

### What This Sounds Like

**two ways to settle (made) — remake (words only).**
1. It tests the claim. Step 2 shows partial 32 at 71.1 c at 0.03 s and 71.0 c at 0.59 s, a bow that holds. That robust fact is what refutes "exactly as a piano note does", and the piece reaches it honestly.
2. Faithfulness is where the remake lies. Step 3's verdict reads "the early drop is the line's low partials settling, not the bent end going quiet". The caption says the drop "follows its lowest partials settling a few cents". Both state as fact what the maker's own offer calls unsettled: whether that motion is the string or the tracker's first frames. The step also ends its account at the first 0.1 s, though the same chart shows the second half of the story, where the steward is right (see offer 1).
3. It walks up: wall alone, own bend, pulled apart, recipe, side by side.

The remake, in one round:
- (a) In step 3 and in the caption, say the 0.03–0.09 s motion is partials 2 and 3 (+3.6 and −6.1 c falling within 2 c), and that it may be the string or the tracker's first frames.
- (b) Add one sentence to step 3. After the first 0.1 s the measured line holds (levels frozen: about 1.7–2.0 c from 0.09 s to 2.6 s) while the bend you hear keeps falling (1.83 → 1.34 c by 2.6 s), so the slow settling is the loudness, as the steward said.
- (c) Name what "the bend you hear" is weighted by. It is power, and at A2's strike partials 2 and 3 carry 70 % of it and partials 10 and up carry 3 %. As built, the measure mostly reads the lowest partials' places, not the stretched top.

A note, not part of the remake: the recipe is placed at 110 Hz, but the page names no pitch for its settling piano. The "8× higher" holds against an A2 string. A5 measures B = 2.3 × 10⁻³, where B = 0.002 is realistic. The bow relaxing to zero is wrong at any pitch.

**dual-wavetable/02-organ-struck-piano-settling.wav (gathered) — keep.** The scroll (steward-014) says B depth 0.3 and three strikes, which matches the caption. The caption honestly calls it "the page's settling gesture, not the measured string".

**dual-wavetable/03-organ-bell-dissolving.wav (gathered) — keep.** The scroll measures partial 2 at 252.5 Hz on a 110 Hz voice, which is 2.295×, the J₀ ratio, so the caption's "Bessel positions" is right. It is also right that this is not a measured bowl.

**dual-wavetable/04-two-clocks-chord.wav (gathered) — keep.** The caption matches the cube-walls floor panel, an 18 s path. Its sound is unchecked.

### What This Looks Like

**bent-line-editor.png (gathered) — keep.** The scroll's "The centre screen is off, so there's no glowing line" bears out the caption's "still dark". It shows what the section describes as built, and honestly says what is missing.

### The Cube Architecture

**dual-wavetable/cube-walls.png (gathered) — keep.** The caption matches the panels. The middle panel's own title says "bell (zeros of J0)", the steward's labelling, which offer 5 is about. The caption sensibly says "Bessel positions".

**dual-wavetable/dual-wavetable-instrument.html (gathered) — keep, with a note.** The conform play-silent is a checker miss. The first visible button in the study is the "◇" review pin. Clicking `A2` started a running AudioContext headless. Leave it as built and name the miss in the landing commit.

**the bundle of lines (made) — keep.**
1. It tests the claim. Step 5 lays the curve's slope beside the bundle's width partial by partial, and for the Bessel shape it comes out against the page's reason.
2. It is faithful with one condition, which the piece should state at step 5 if it is touched again. Width = δ·S(n) holds only because the piece's trajectories relax by uniform scaling, S·(1−τ). In general the width follows how fast each partial's place changes along τ_B, which is neither the slope nor the height. The page's own Cube paragraph describes the piano's trajectory as "a wave of flattening sweeping from high partials toward low", which is not uniform scaling. The measured-string bundle's widest gap (7.69 c) is tracker noise: A2's partial 15 jumps between 1 and 31 c across frames.
3. It walks up: one voice, detune, τ_B spread, a bundle, the test.

### At the Coupling Edge

**coupling-edge/coupling-edge-instrument.html (gathered) — keep, with a note.** The MIDI grant-missing stands correctly: a grant is Loudon's alone, and the caption says the study plays from the mouse in the face. That is true. With MIDI blocked, `▸ start` ran its context, and the only console line is the block itself. Name it in the landing commit as standing until Loudon grants or declines.

**coupling-edge/coupling-edge.png (gathered) — keep.** It plots the section's three findings.

### Physical Trajectory Library

**trajectory-library/keyboard-stiffness.png (gathered) — keep, with a note.** The caption's numbers match the JSONs: 4.67 × 10⁻⁵, 8.30 × 10⁻⁵ and 2.3 × 10⁻³. Octave ratios above A2 are 3.2×, 2.8× and 3.1×. The grey band is 10⁻³ to 2 × 10⁻³. The figure's right-panel title, "the bend holds; the bent partials go quiet", is steward-018's reason. Offer 1 disputes that reason and this record finds it half right. The caption could say the title is the steward's reading.

**trajectory-library/library-sheet.png (gathered) — keep.** The panels match the caption: the bell and vibraphone below the line, the marimba and bowl above, with attack and last frames nearly coincident.

**trajectory-library/01-real-piano-two-walls.wav (gathered) — keep.** Its sound is unchecked.

**trajectory-library/09-bell-choir-measured.wav (gathered) — keep.** It sets a measured bell beside the page's Bessel bell choir. Its sound is unchecked.

## Offers

**1. What This Sounds Like (claim-change), the settling piano: confirmed in its suggestion, disputed in its correction of steward-018. Both have half of it.**

What I recomputed from the A2 JSON (heard bend = Σa²|c|/Σa², which reproduces the stored values exactly; the JSON's note calls it amplitude-weighted, but it is power-weighted):
- Fitted B moves 8.3162 → 8.0472 × 10⁻⁵ (−3.2 %) and partial 32 moves 71.06 → 71.00 c. Confirmed.
- The heard bend falls 4.67 → 1.83 c by 0.09 s. Confirmed.
- Levels frozen at the strike give 4.67 → 2.00. The bow under the measured levels gives 1.30 → 1.20, and 0.49 by 2.6 s. Confirmed.
- Swapping only partials 2 and 3 to their 0.09 s values takes the strike frame from 4.67 to 2.21. The early drop is those two partials. Confirmed.

The time scale is where the maker goes wrong. Steward-018 is about A1 (55 Hz), and says the heard bend "halves because the upper partials go quiet".
- At A1 the heard bend goes 4.51 → 3.37 by 0.09 s, which is the line: levels frozen gives 3.24.
- After that it goes 2.66 at 3.8 s → 1.71 at 5.5 s. With levels frozen the line holds at 2.9–3.3 c the whole time, and the bow under the measured levels falls 3.41 → 1.81. That halving is the loudness, as the steward said.
- The maker's "at A1 the bow … holds at 3.3–3.6 cents to 2.6 s" is true, and stops just before the steward's effect.
- The same pattern holds at A2 (1.83 → 1.34 by 2.6 s with the line held), at A3 (levels frozen 13.24 → 3.48 by 0.09 s, then heard 3.4 → 0.9 by 3.8 s while the frozen line holds 2.5–3.8) and at A4.

So the maker is right about the first tenth of a second, and that part may be the tracker. The steward is right about the seconds after. The suggested wording, that a real string's bend holds while its loudness wall dims and that a bend relaxing to flat over 500 ms is a designed gesture, is confirmed and is what both agree on. Redraft the offer: drop "corrects the reason in steward-018" and say there are two settlings on two time scales, the early one unsettled.

**2. Physical Trajectory Library (claim-change), Piano (Bass) B: confirmed, with a source and a caveat.**
- The ratios recompute: 0.001/8.301 × 10⁻⁵ = 12.0 and 0.002/4.6713 × 10⁻⁵ = 42.8.
- Partial 20 at B = 0.002 is 508.8 c. At B = 8.3 × 10⁻⁵ it is 28.3 c, against a measured 29.2 c.
- No measured string settles: B moves −3.2 % at A2, +1.7 % at A1 and +5.6 % at A4. At A3 it moves +11.5 %, so "within a few percent" holds for every string but A3.
- Published bass values are about 2 × 10⁻⁴ (Hinrichsen) and 10⁻⁴ to 10⁻³ (Rauhala et al., snippet only). The page's 0.001–0.002 sits at or above the top of the published bass range, so "too stiff" holds.
- The 12–43× factor belongs to this one sampled concert grand, whose A1 and A2 sit 2–4× below even the published typical bass value. Carry the measured values with the instrument named, and the published range beside them.
- The cents in "at 110 Hz it puts partial 20 509 c sharp" do not depend on pitch. Only the comparison string fixes 110 Hz.

**3. Cube (claim-change), the Bessel shape and the reason for the fan: confirmed.**
- The J₀ ratios are 2.2954, 3.5985 and 4.9033. In cents off each harmonic: +238.5 at partial 2, +314.9 at 3 (a step of 76.4), a 3.3 c step at 11→12 and 0.44 c at 31→32, levelling toward 1200·log₂(π/2.4048) = 462.7 c.
- Bundle widths with three voices at δ = 0.08 (span 0.16) are 0.16 × 238.5 = 38.2 c at partial 2 and 0.16 × 449.1 = 71.9 c at partial 32. Confirmed.
- One refinement: "height, not slope" is exact only for uniform relaxation. Better wording is "how fast each partial's place changes along τ_B, which for a shape that relaxes as a whole is its height".

**4. Cube (claim-change), what τ_B spread adds over detune: confirmed, with a correction.**
- On a flat line a plain detune beats exactly as n: f_n·(2^(4/1200) − 1) = 0.254 Hz × n at 110 Hz.
- The piece's n^1.05 comes from its base voice sitting on a bow at B = 4 × 10⁻⁴, τ = 0.3. Say "as n", not n^1.05.
- τ_B spread on the bow: width ≈ δ·866·B·n² in cents, so the beating goes ≈ n³, which matches n^2.98. Partial 1's 0.028 c = 0.08 × 0.346 c. Confirmed.
- The measured-string figure (0.07 c at partial 32) is a reported number. Its check in the workshop is hard-wired PASS.

**5. The Architecture (claim-change), J₀ is a membrane, not a bell: confirmed for the model claim, disputed for the bell choir.**
- The zeros of J₀ give the axisymmetric modes of an ideal circular membrane clamped at its rim. That is true, and they are only the axisymmetric subset: the full membrane interleaves its m ≥ 1 modes, 1.594, 2.136 and so on.
- A bell is a shell (a church bell runs hum 0.5, prime 1, tierce 1.2, quint 1.5, nominal 2) and a cymbal is a plate. Neither is a J₀ zero series. The measured bell bears it out: 1, 1.135, 1.451, 2.178.
- The Architecture sentence ("gives bell and cymbal inharmonicity") is a model claim and is wrong as a model. The same conflation sits in the Cross-Domain line on Bessel Functions in Synthesis ("circular membranes — drum, bell, cymbal"), which the offer should name too.
- The alien bell choir's "sounds bell-like in character" is a perceptual metaphor. The page itself adds that it differs "from any real bell", and no agent can test it. Leave that sentence alone and correct only the model claims.

**6. The Architecture (no-claim-edit), B names two things: confirmed.** The depth scalar and the stiffness coefficient share the letter. For example, §What This Sounds Like has both "B ≈ 0.002" and "B=1.5". The plugin's "Bend" is the right name for the knob.

## The face as a whole

The page's idea is a line you can see and bend, and this face makes that felt rather than busy. Each walk starts at the flat line and adds one thing at a time. Each ends at a test the page could have failed, and two of them did: the settling piano and the Bessel fan. The gathered renders and figures sit by the sentences they answer, with captions that say what each render is and what it is not. Two things keep it from being better. The settling walk speaks with more certainty than its data, at the very point where it disagrees with the steward. And the "bend you hear" measure mostly reads partials 2 to 4, so the face's headline settling number is about the lowest partials, not the stretched top that makes a piano sound like a piano. After the words-only remake on the settling walk and the redraft of offer 1, the face is ready for Loudon's ears.
