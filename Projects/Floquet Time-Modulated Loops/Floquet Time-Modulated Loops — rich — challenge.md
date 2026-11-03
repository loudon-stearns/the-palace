---
title: "Floquet Time-Modulated Loops — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Floquet Time-Modulated Loops]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Floquet Time-Modulated Loops' first rich face: every piece judged on whether it tests The Theory, stays faithful to it and walks up to its test, and every measured offer recomputed by an integration that shares no code with the pieces."
---

# Floquet Time-Modulated Loops — rich — challenge

Challenger · claude-opus-5-5 · 2026-11-03 · proposal round. I judged the maker's commit c3e4ee29 from the page, the pieces and the commit body. I did not read the maker's notes beyond that.

**Count: 14 keep, 1 remake, 0 retire.** The face has one section, The Theory, with 15 pieces. Four were made and eleven were gathered.

## The checks I ran

- `conform.mjs`: 6 pages, **0 errors**, 5 warnings. Four are sandbox-blocked: the gathered 02 and 15 each fetch their own source for a source panel, and that fetch is caught. The fifth is play-silent on multipliers. Its first step has no sound, so conform's click finds no start control there. The maker's four file-local warnings are gone now that the pieces are committed.
- `fingerprint.mjs`: The Theory is `466050bbbafb`, 15 pieces, **in step**.
- The face served from the worktree and loaded in headless Chromium. **The console was clean.** It showed 15 proposal chips, nothing in *Lost its place*, and nothing flagged as made against an earlier version. The figures came in text order.
- I read every piece's source. Each one creates its AudioContext only inside a click handler (`ensureAudio`), and none has its own `visibilitychange` handler, so the kit's hidden-page hush covers them. Nothing licensed is copied. Every file each piece needs is tracked in the bundle.
- The maker's `proof — rich checks.mjs` passes 41 of 41. I re-ran it, but it reuses the pieces' engine, so my real checks are below.
- My own recomputation used scipy DOP853 monodromy (rtol 1e-12), Hill matrices, and harmonic balance for the sidebands. I also ran the build's own per-sample recurrence and measured the WAVs directly. The scripts sit in the session scratchpad and are not in the bundle.

## The pieces

| piece | tests or decorates | faithful | walks up | verdict |
|---|---|---|---|---|
| `interactives/02_mathieu_simulator.html` | The build's explorer, which the text describes (media-02). It illustrates more than it tests. | Yes. The caption says plainly that each play is scaled to its own peak. | Gathered, n/a | **keep** |
| `— rich — threshold.html` | **Tests.** The threshold could have come out at 4ζ, as the build's own notes say. It came out at 2ζ. | Yes. It holds the page's line that the minimum depth comes from the damping. | Push or pump, then the threshold under your hand, then the test | **keep** |
| `audio/04a_below_threshold.wav` | It tests its own label, and the caption says the label fails | Yes. Measured: q = 0.05 is on the threshold. My 50 ms windows run −48.4 to −24.7 dBFS; the caption's −27 comes from a longer window. | n/a | **keep** |
| `audio/04b_at_threshold.wav` | Same | Yes. Measured: −43.7 to −10 dBFS within 0.20 s, then steady at −10.0. | n/a | **keep** |
| `audio/04c_above_threshold.wav` | Same | Yes. Measured: full within 0.10 s, steady at −5.1 dBFS. | n/a | **keep** |
| `static/05_strutt_diagram.png` | Illustrates, and the caption says where its colour scale misleads | Yes. In the image, tongue 2 does show green below about q = 0.8. | n/a | **keep** |
| `— rich — strutt map.html` | **Tests.** At a computed edge, 0.03 outside stays hiss and 0.03 inside rings. My ODE puts the edges at 0.4732, 1.4642 and 3.8950, the same as the piece. | **One wrong sentence.** See below. | One ring, then one line, then the map, then the test | **remake** |
| `audio/20_strutt_sweep.wav` | Tests the build summary's crack at 0.10 and finds it at 0.05 | Yes. Measured: the crack is at 2.00 s (q = 0.050). Per-second levels are −45, −38.7, −16.7 … −15.1, −28.9, −44.6, as the caption gives them. | n/a | **keep** |
| `Experiments/mathieu_tongue.wav` | Tests what "capture range" means against what you can hear | Yes. My damped tongue runs from 392.04 to 407.96 Hz, which is 3.6 to 8.4 s into the sweep. The int16 file is digital silence until 7.25 s, peaks at 8.25 to 8.5 s, and is down to −75 dB by 12 s. | n/a | **keep** |
| `static/08_multipliers_vs_params.png` | The caption turns it into a test | Yes. Its green "stable" point is −0.84+0.55i, so \|ρ\| = 1.004, on the circle. | n/a | **keep** |
| `— rich — multipliers.html` | **Tests the unit-circle sentence and finds the case it misses** | Yes. It holds the page's three-case list against the page's own det M = 1 question rather than smoothing the conflict away. | One period as a map, then the multiplier pair, then the test | **keep** |
| `static/10_phase_space_strobe.png` | Illustrates, with a measured caption | Yes. I get ρ = −1.594 at (1.0, 0.3); the caption says −1.59. | n/a | **keep** |
| `static/12_sideband_ladder.png` | Illustrates; the piece after it tests | Yes | n/a | **keep** |
| `— rich — sideband ladder.html` | **Tests.** It checks the derivation open-loop, then inside a loop. | Yes, with a note on scope (below) | Ring mod, then shaping the modulator, then inside the loop | **keep** |
| `interactives/15_kapitza_pendulum.html` | The build's simulator, which the text names (media-15) | Yes. (a_pΩ)² > 2gL is the standard Kapitza condition. | n/a | **keep** |

**The strutt map remake, exactly.** The note under step 3 (`$('n3')`) is hard-coded. For every κ > 0 it says *"tongue 2 near q = 0.74, and tongue 3 only shows at the top right."* By my integration:

- At κ = 0.05, tongue 2 opens at **q ≈ 0.639** (√(8κ) = 0.632 to leading order) and tongue 3 at q ≈ 2.17.
- At κ = 0.15, tongue 1 opens at 0.152 and tongue 2 at **≈ 1.14**. Tongue 3 does not appear anywhere below q = 2.5, so "shows at the top right" is false at that setting.

The 0.74 looks like a reading of the 300-pixel map, where tongue 2's narrow tip is about a pixel wide, or of media-05's colour scale. The fix: compute the onsets per κ, the same way step 2 computes tongue 1's span, or print the measured values above. Nothing else in the piece needs to change.

Small notes that are keeps, not remakes:
- In multipliers, the comment in `scan()` says "(left side)" but the code bisects the right side. Only the comment is wrong.
- Multipliers step 2 plays with κ = 0.01 while it plots κ = 0. The piece's own note says so.

## The offers

1. **media-07 is wrong. Confirmed.**
   - By Hill matrix, tongue 1 at q = 0.3 runs from b₁ = 0.689166 to a₁ = 1.288324. The figure's "outside, bounded" point at a = 0.85 is inside it, with ρ = −1.5372 and −0.6505.
   - Integrated the figure's own way (symplectic Euler, 300 steps per period, 30 periods), that inset's peak is **2.96 × 10⁵**.
   - The "boundary" inset at a₊(0.3) − 0.001 = 1.28733 is inside too, with ρ = −1.0363. Its peak climbs to 1.53.
   - **Against the Mathieu Equation face (on main):** the two independent finds agree on every number that matters: 0.85 inside, b₁ = 0.689166, a₁ = 1.28832, ρ = −1.537, and the boundary trace climbing 1.0 → 1.5. They differ only on the outside inset's peak. Mathieu says "about 2×10⁵"; the maker says 3×10⁵, and I measured 2.96×10⁵. The suggested fixes differ but fit together: a ≈ 0.55 or 1.5 here, a = 0.6 there.
   - The Mathieu face also found media-20's crack at q ≈ 0.05, which agrees with offer 2.

2. **The media-04 labels and 4ζ. Confirmed.**
   - The build's recurrence is `v += −(a − 2q cos φ)x − 2ζω₀v`, which in Mathieu time is ẍ + 2ζẋ + (1 − 2q cos 2t)x. So κ = 2ζ, and the threshold is q = κ = 2ζ, not 4ζ.
   - The same 4ζ claim also sits in places the offer does not list. These should be fixed together:
     - `RNBO/mathieu_resonator.codebox` comments (lines 52–55 and 151)
     - `RNBO/README — Mathieu Resonator.md` Test 3 (line 69), plus Test 2's "below threshold" (line 63)
     - `python/mathieu_core.py`: the `audio_mathieu` docstring says "ζ ≈ 0.015 … threshold near q_depth ≈ 0.10". At that function's default of 0.015 the threshold would be 0.03.

3. **Testing protocol step 2 sits on the threshold. Confirmed.**
   - At a = 1, κ = 0.05, ODE monodromy and a Hill determinant (ρ = −1) both give **q_c = 0.050007**.
   - The build's own recurrence at 48 kHz, with noise and clip off, gives growth of −3.46 /s at q = 0.045, **−0.01 /s at q = 0.05**, and +3.45 /s at q = 0.055.
   - "Exactly 2ζ" holds to 1.4 × 10⁻⁴ relative.

4. **The unit-circle sentence holds only with damping. Confirmed.**
   - Undamped, along q = 0.3 for a from 0 to 6 (241 points): |det M − 1| ≤ 3.5 × 10⁻¹³. All 215 stable points have both |ρ| = 1 to within 1.8 × 10⁻¹³.
   - The edge is where the pair meets at −1, at a = 1.288324 (|tr| = 2 matches Hill's a₁).
   - With κ = 0.1:
     - The stable pair sits at |ρ| = 0.854636 = e^(−κπ/2).
     - **The split is at 1.29082 and the edge at 1.27105**, so walking inward the split comes first.
     - Between the two, at a = 1.28, ρ = −0.961 and −0.760: both real, both inside the circle.

5. **Inside a pumped loop the sideband envelope is c_n only to first order. Confirmed in numbers, with a note on scope.**
   - Harmonic balance on the piece's stated model (220 Hz resonator, ζ = 0.05, driven at 220 Hz, pumped at 80 Hz) gives a cosine pump at h = 0.3 putting **−27.2 dB** at 60 Hz, and a square pump **−22.5 dB** there.
   - At h = 0.05, first order misses by 0.01 dB for the cosine, 0.06 dB for the square and 0.21 dB for FM, inside the claimed 1.1 dB. At h = 0.3 the misses grow to 1.7 dB (square) and 3.6 dB (FM).
   - **The scope note:** the offer calls this "Stage 1's case". It is not. The piece's loop is driven from outside and pumped at 80 Hz, off every tongue. Stage 1 pumps at 2f, where the first lower sideband, f − 2f, lands on −f: the carrier itself. That fold is the parametric feedback. So at Stage 1's own ratio, "exactly the two-tone sideband signature of ring modulation" fails already at first order, which is a stronger point than the one the offer makes. Suggest rewording the offer to say this.

6. **Media left off. Partly checked.**
   - Confirmed: `13_generate.py` pumps at 80 Hz with noise as the excitation and no carrier, and `06_strutt_explorer.html` normalizes each click's playback.
   - Not checked: the rendering faults (the emoji on 03, the overprint on 01, the bands in 11 and 18).

## The section granularity — a finding for the round, not a verdict

The parser opens a section only at `##`; deeper headings stay inside (`_ops/rich-face/README.md` § The parser's rules). So The Theory's eight `###` subsections, about 200 lines, are one fingerprint holding all 15 pieces.

On the face, `near` does its job. Every piece sits beside the paragraph it serves, in the order of the idea, and nothing lost its place. It reads well.

The coarseness bites in two places. First, stamping: carrying home any of offers 1, 2, 4, 5 or 6 changes The Theory's prose, and that flags all 15 pieces as made against an earlier version. The re-tune then has to re-read a Kapitza pendulum because a sentence about multipliers changed. Second, approval: Loudon's note and his yes are per section, so he can only approve the threshold walk and the sideband ladder together, along with eleven gathered figures. The maker had no finer choice without changing the tool.

Two possible fixes, for whoever owns `_ops/rich-face/`:
- Key a `###` as a sub-section, for example `"The Theory › Sidebands — where the ladder comes from"`, for both stamping and approval.
- Or fingerprint the span from a piece's `near` anchor to the next heading, per piece.

## The face as a whole

It makes the page's idea felt rather than just busy. Each of the four walks stops on one of The Theory's hardest sentences, and three of the four found where that sentence needs a word more: the threshold belongs to the damping, the unit circle needs damping, and the ladder is first order. The gathered media came with measured captions instead of their old labels. That is the right use of a build whose labels had drifted from its files.

The section is dense: 15 figures, three of them WAVs beside one paragraph. But The Theory is the page's longest section, and the density follows the text rather than piling up at the end. The one weakness is how the section is stamped and approved, not how it reads.
