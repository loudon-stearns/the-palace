---
title: "2D Torus Wavetable Synthesizer — rich — challenge"
born: 2026-11-03
links:
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of the torus's first rich face, piece by piece and offer by offer, with every number recomputed by a hand that did not make it, so Loudon can take the face and its offers knowing which held."
---

# Challenge — the proposal round, 2026-11-03

By the challenger (claude-opus-5-5), against the maker's commit c80455c7. I judged from the page, the pieces and the commit body. Nineteen pieces: **18 keep, 1 remake, 0 retire.**

## What I ran

- `node "Rich face checks/check-pieces.mjs"`: 34 ok, 0 fail, in 2.2 s. The maker's numbers come back the same.
- `python3 "Rich face checks/mid-morph-direct.py"`: the same five pairs, the same figures.
- My own scripts, not the maker's, run in the scratchpad (not in the palace):
  - a numpy bilinear scanner on the **catalog's 1024² WAVs**, not the maker's 99.5% lattice rebuild;
  - the mid-morph height-map level, worked out again for six pairs;
  - the point-group symmetry of each table's lattice magnitudes |c_mn|, taken from the full FFT (this test doesn't care where the table starts);
  - the row RMS of `00_test_diagnostic.wav`, and the same dips worked out on ideal sine, saw and square shapes.
- `Tools/surface_overlap.py`, the steward's tool, for comparison.
- `conform.mjs`: 0 errors, 6 warnings (below). `fingerprint.mjs`: all seven sections in step. `untracked.mjs`: every file is tracked. Every gathered file is under 25 MB. Nothing from Splice is copied.
- The face on a rich-server, in headless Chromium:
  - four frames, each `allow-scripts allow-same-origin`;
  - no missing boxes, and no console errors or warnings;
  - each made piece walked through all five steps and played. All three loaded their data.
- Each made piece opened alone on the piece origin:
  - no AudioContext before the click; `running` after it;
  - `suspended` after the page went hidden, so the kit's hush holds.

## The pieces

### Architecture

**`image1_t2_product_of_circles.png` — keep.**
- It decorates rather than tests: it pictures T² = S¹ × S¹, which the section states.
- It is gathered and true to its caption: the waterfall on the left, the rectangle on the right, the edges glued into the donut.

**`… — rich — the ratio gate.html` — keep.**
- *Test?* Weakly. Partials at m·f₁ + n·f₂ can't jump while the scan is linear, so the drag step can't fail on a correct engine. What it does settle is the page's own split: the Architecture bullets read as a binary line, while the Philosophy pillar calls the boundary "a continuous geometric parameter, not a categorical line". The period readout jumps everywhere and the lines slide. That is a real adjudication.
- *Faithful?* Yes. It quotes the page.
- *Walks up?* Yes, five steps: one circle (f₂ = 0), two circles, the lattice, an irrational ratio, then the test.
- Note for the caption and offer 3: the beats come at multiples of |q·f₁ − p·f₂|. The equations panel says "multiples"; the proposed page sentence drops the word.

**`audition/penrose_ratio_sweep.wav` — keep.** Evidence that sits beside the section. 15.0 s by its byte count, which matches six ratios at 2.5 s each.

### The Surfaces — Design Language

**`… — rich — surfaces and morphs.html` — remake.**
- It is a real test: it came out against the text, and it walks up cleanly.
- The problem is that the cross-class pair it leans on is not cross-class in the built tables. I measured lattice-magnitude symmetry on the full tables (correlation of |c_mn| with its m↔n swap, m flip and 90° rotation):
  - Membrane, Chladni and Theta: 1.000 / 1.000 / 1.000. The built Theta table is fully 4-fold, as a theta function on a square torus would be.
  - Penrose: 0.000 / 1.000 / 0.000.
  - Knot Shadow: 0.000 / 0.000 / 0.233.
  - Stiff String: 0.010 / 1.000 / 0.010.
- So "Membrane ↔ Theta, 4-fold ↔ modular" compares two pairs that share a lattice point group, and that comparison can't test the claim.
- **Fix, in one round:**
  1. Add a quick pair, Membrane ↔ Penrose: really cross-class, overlap 0, −3.01 dB height-map against Membrane ↔ Chladni's −3.14.
  2. Show each surface's measured lattice symmetry beside "as the page names it".
  3. Rest the caption's evidence on Membrane ↔ Penrose, and say Theta's table is 4-fold.
- The conclusion survives the fix, so this is a remake, not a retire.

**`Auditions/cycle-7/theta_matern_morph_spatial.wav` and `…_spectral.wav` — keep.**
- The captions hold. Measured in 16 slices, the height-map render sits about 3.5 dB below the straight-line target near a third of the way across. The spectral render sits about 1.1 dB below.
- Note: the gap in these renders (about 2.4 dB) is much milder than the piece's unit-energy 6.5 against 0.2 dB. The two ends are not level-matched (−11.8 and −6.7 dBFS). A reader who hears both after reading the piece should be told that.

### The Five Generating Logics

**`penrose_kuramoto_three_regimes.wav` — keep.** Evidence for the third logic's "snap, not a fade". It traces to scroll.md:835–837.

**`penrose_kuramoto_ramp.png` — keep.**
- This one tests: lock order and harmonicity jump together at K* = 0.80 Hz.
- The plot says the coupling ran 0 to 1.59 Hz, and the caption says 1.6. That's fine.

### Warps

**`hands_tour_penrose.wav` / `.png` and `warp_bank_tour_knot_shadow.wav` — keep.**
- Every timing in the captions traces to the scroll: the knot opens at 21 s, rotation runs 10–15 s, and 22.5° falls on the dead line (scroll.md:770, 783, 802, 807).
- The spectrogram tests the warp catalog's lesson: on a closed orbit the hands reweight partials, they don't retune them.

### Hopf Fibration as Control Surface

**`hopf_tour_penrose.wav` — keep.** It traces to scroll.md:866–870, the snap at 13.5 s included.

**`Hopf/hopf-control-surface.html` — keep, with a caption fix.**
- The manifest's storage contract gives it `allow-same-origin` in the live face. Its notes, saved locally under `torus-hopf-notes-v1`, do keep there, under the kit's prefix.
- They keep nothing only on the public site, where storage lives in memory.
- Say "its notes keep on this Mac's live face only".

### Open Decisions

**`… — rich — the RMS dip.html` — keep, with a note.**
- *Test?* Yes. It could have found sine → saw deepest, and it didn't.
- *Walks up?* Yes: the two ends, the crossfade, the inner product, the fix, the table.
- *Faithful?* Nearly. Step 5 says "the page says the worst dip is sine → rising saw at about 10 dB", but the page measures *at the midpoint*. At the midpoint, sine → saw (−9.24 dB) is still deeper than saw → square (−8.73). The piece's own table shows both columns, which is honest.
- Have step 5 say "at the midpoint" and point at that column, and let the caption say the two measures disagree.

**`_rms_diagnostic.png`, `00_test_diagnostic.wav`, `00_test_diagnostic_constant_rms.wav` — keep.** All three are true to their captions. 21.8 s and 46.9 Hz check out, and the constant-RMS rows sit within 0.000 dB of target.

### Forward Vectors

**`etude_two_e_heros_journey.m4a` / `.png` — keep.** Loudon's quote is real: scroll.md:60, and Instruments/Instrument Plan — draft.md:8.

## Conform's two sandbox-blocked fetches — keep, with a note

They are the checker's own frame, not the face.
- `conform.mjs:732–735` frames every piece `sandbox="allow-scripts"`, which is opaque. Its comment says the frame moves to the piece origin once that lands. The census README (STIGMERGY/proofs/2026-10-20-conform-census/README.md:67) expects these warnings to go when it does.
- On the live face, `rich.js:291` and `contract.mjs:215` give any piece that declares a file `allow-same-origin`. I watched both lattice fetches succeed with a clean console.
- This run also raised `play-silent` on the same two pieces at 760 px. It follows from the blocked load, as conform itself says.

Two things the maker didn't say:
1. **The RMS dip piece fetches its WAV the same way.** Conform only missed it because the fetch waits for step 5 (`the RMS dip.html:368`).
2. **The public read view frames every piece opaque** (`rich.js:175–176`), so there all three fetches are cross-origin. They work only if the host sends CORS. The read view deploys to GitHub Pages (`.github/workflows/read-view.yml`), which I believe sends `Access-Control-Allow-Origin: *`. **I have not checked that.** Open the three pieces on the first public build.

## The offers

1. **Confirmed.** "A whole-number multiple" is what f = (mp + nq)·f₂/q shows.
2. **Confirmed.** With φ = ω·t, ω is angular.
3. **The numbers hold; the text is not wrong.**
   - On the catalog's own Membrane table, with my scanner at 112 : 110: 331.993 and 333.996 Hz. Weaker lines sit at 327.99 and 338.00 Hz (−19 and −18 dB), so the spacings run 4, 2, 4 Hz: multiples of |f₁ − f₂|.
   - On the catalog's Penrose table from 1.49 to 1.51: 45 lines, worst 0.010 Hz. The swapped convention misses by 605 Hz, so the axis reading is right.
   - The bullets are exact mathematics, though. This is an addition that squares Architecture with the Philosophy pillar, not a correction. File it as an addition.
   - The proposed sentence needs "at multiples of" and Hz units (offer 2).
4. **The number holds by construction; the claim-change is disputed.**
   - The page already gives the load-bearing work to "the irrational-ratio gate *and the coupled-flow warps*". [[Three Kinds of Warp]] (lines 95–101) says the same: the gate lets a surface place partials *near* stretched positions, and type 3 makes B continuous.
   - The Stiff String surface rounds its partials to whole numbers, round(n·√(1 + B·n²)), per `Wavetables/13 — Stiff String.md`. So it is harmonic at any rational ratio and does not supply the stretch.
   - At most this is a no-claim-edit: "the gate's own knob moves each partial by m·δ; the stretch's shape comes from where the surface puts its ripples, or from the B warp".
5. **The numbers hold. By level the page's rule is wrong, but not through the page's own example.**
   - Recomputed, the height-map mid-morph is exactly 10·log₁₀((1 + ρ)/2), where ρ is the two tables' correlation:

     | pair | ρ | mid-morph |
     |---|---|---|
     | Membrane ↔ Chladni | −0.030 | −3.14 dB |
     | Membrane ↔ Theta | 0.000 | −3.01 dB |
     | Membrane ↔ Penrose | 0.000 | −3.01 dB |
     | Chladni ↔ Penrose | 0.000 | −3.01 dB |
     | Theta ↔ Matérn | −0.549 | −6.47 dB |
     | Matérn ↔ Fisher | −0.234 | −4.17 dB |

   - So overlap together with phase agreement sets the dip, and point group can't.
   - But Theta's table is 4-fold, so Membrane ↔ Theta is not cross-class. The proof rests on Membrane ↔ Penrose.
   - Whether "crossfade cleanly" meant level, or the symmetry of the surface in between, is Loudon's call.
   - "The steward's cycle-7 finding" needs care. scroll.md:837 gave −7.5 / −5.4 dB. The current `Tools/surface_overlap.py` gives −6.98 / −0.26, and mid-morph-direct gives −6.47 / −0.24. The maker's note about rfft2 counting the m = 0 column twice accounts for the 0.5 dB, not for the old −5.4. Cite the current figures.
6. **Confirmed, and stronger than stated.**
   - Membrane ↔ Chladni: 3.14 → 2.87 dB.
   - Theta ↔ Matérn: 6.47 → 0.24 dB.
   - Matérn's lattice is nearly 4-fold too (0.93 / 0.89 / 0.83), so the pair where the spectral law earns its FFT is not cross-symmetry either.
7. **The numbers hold; the text is not wrong by its own measure.**
   - My row RMS: sine → saw −9.58 dB at 55% (−9.24 at the midpoint); saw → square −11.73 dB at 36% (−8.73 at the midpoint, −14.47 below the louder end).
   - Ideal shapes give the same: −9.58 at 55.1%, and −11.74 at 36.6%.
   - The page says "at the midpoint", and there sine → saw is the deepest.
   - By correlation, saw → square is the more negative pair (−0.866 against −0.780), so "worst negatively-correlated case" can be argued either way.
   - Reword the offer to keep both measures: "~9 dB at the midpoint for sine → saw; the deepest trough is saw → square, 11.7 dB at 36%".
8. **Confirmed in principle.** The Fourier series is linear, and mid-morph-direct's spectral law blends magnitudes. I did not open `Tools/morph_surfaces.py`.

## The face as a whole

- It makes the page's idea felt, not just busy. Each made piece starts with one circle or two plain waveforms and ends by putting a sentence of the page on trial.
- Two of the three trials came back with real news: symmetry doesn't set the morph's dip, and the RMS trough isn't where the page points.
- The gathered renders give the ear something to check the screens against, though nobody has heard any of it yet.
- The weak joints are both in how a page phrase was carried into a measurement:
  - "4-fold ↔ modular" was taken at its word when the tables say otherwise;
  - "at the midpoint" slid into "deepest anywhere".
- Fix those two and the offers it sends home will be sharper than the ones it found.
