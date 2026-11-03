---
title: "Quadratic Interpolation in DSP — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Quadratic Interpolation in DSP]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of the proposal round on Quadratic Interpolation in DSP's rich face: every piece judged with a reason, every offer recomputed, so Loudon can approve or send back section by section."
---

# Challenge — Quadratic Interpolation in DSP, rich face, round 1

Challenger: claude-opus-5-5, 2026-11-03. Judged from the page, the pieces and the maker's commit body (5cf876d2) alone. Verdicts: **3 keep, 1 remake, 0 retire.**

## The pieces

### What It Is · the joints — keep

1. **Test or decoration?** A test. The page says the quadratic has "continuous first derivative … never has a sharp corner." For one parabola that is true and the piece shows it (step 2). For the chain a reader actually uses, it is false, and the piece could have shown otherwise had the page been right. I derived the jump by hand and in sympy: the span arriving at sample n is built on (yₙ₋₂, yₙ₋₁, yₙ) and ends with slope ½yₙ₋₂ − 2yₙ₋₁ + 3⁄2·yₙ; the span leaving starts with ½(yₙ₊₁ − yₙ₋₁). The difference is ½yₙ₋₂ − 3⁄2·yₙ₋₁ + 3⁄2·yₙ − ½yₙ₊₁ = −½(yₙ₊₁ − 3yₙ + 3yₙ₋₁ − yₙ₋₂), exactly the piece's equation. Values meet (C⁰); slopes don't.
2. **Faithful?** Yes. It uses the page's formula with the page's own x convention, and the chained Bézier is built from the page's own B(t), labelled honestly as a chain.
3. **Walks up?** Yes: three points and one parabola → the tangent inside it → a chain → the slope at every joint. One small thing: the jump equation appears at step 3, a step before the test. Taste; leave it or move it.

Note: "misses the samples by up to 7% of the wave's height" means 7.3% of the peak amplitude (3.7% of peak-to-peak). Say "of its peak."

### Three Audio Applications · the table read — remake

1. **Test or decoration?** A test, and a careful one: two measures (stray frequencies vs. distance from the true sine), one worklet that plays the same core it measures.
2. **Faithful?** Two problems, both fixable in a round.
   - **The cost is counted on one form of the Hermite.** The piece counts cubic Hermite at 9 multiplies and 10 adds. The common Catmull-Rom form (`c=(y₁−y₋₁)·½; v=y₀−y₁; w=c+v; a=w+v+(y₂−y₀)·½; b=w+a; ((a·x−b)·x+c)·x+y₀`) is the same curve — I checked 10,000 random cases, max difference 1.3e-15 — at 5 multiplies and 10 adds. Against the quadratic's 4 and 5, that is one multiply more and twice the adds, not "about half the arithmetic." The sweet-spot test is half about cost, so this changes the verdict's weight. Fix: count the Hermite on its cheap form in `WT.ops` (or show both forms), and re-word the caption ("for about half the arithmetic"), the verdict ("for about twice the arithmetic") and the matching line in the § 2 offer.
   - **The headline disputes something the page already grants.** The page says quadratic is "much closer to the original waveform" than linear, and cubic is "even closer. But more CPU." So "a sweet spot for what it adds, not for how close it lands" reads as a correction where the page agrees. The page's claim is cost against quality. Fix: lead with "On a sine, the sweet spot holds for what the reader adds; the closeness the page grants cubic is 9 to 12 dB, and most of it is the quadratic's lopsided three points shifting the tone in time." The time shift is the real new finding; let it carry the line.
3. **Walks up?** Yes: nearest → linear → quadratic → Hermite, each alone at 16 numbers and 440 Hz, then the glide and the tables.

Every number reproduces: I re-rendered all three readers in numpy with my own least-squares fit.

| | 8 | 16 | 32 | 64 |
|---|---|---|---|---|
| spurs, linear / quad / Hermite (dB) | 32.1 / 40.4 / 43.8 | 44.6 / 58.5 / 62.8 | 56.8 / 76.6 / 81.1 | 68.9 / 94.7 / 99.2 |
| distance, linear / quad / Hermite (dB) | 25.1 / 33.3 / 42.1 | 37.1 / 51.2 / 62.1 | 49.1 / 69.2 / 80.9 | 61.1 / 87.2 / 99.2 |
| quad tone shift | −1.060° | −0.141° | −0.018° | −0.002° |

Linear at 2048 numbers: 129.1 dB, as the verdict says. Linear and Hermite shift 0°.

### Three Audio Applications · the peak between bins — keep

1. **Test or decoration?** A test of the formula as written, and it fails the page. The page's correction, (Δf/2)(m[k−1] − m[k+1]) / (2m[k] − m[k−1] − m[k+1]), is exactly minus the standard parabolic peak p = ½(α − γ)/(α − 2β + γ). At a peak α − 2β + γ < 0, so the standard form moves toward the taller neighbour; the page's moves away by the same amount.
2. **Faithful?** Yes. `PK.page` is the page's expression, in bins.
3. **Walks up?** Yes: a sine on a bin → between bins, with beats counting the tallest bar's miss → the parabola and its peak → the page's formula. The beats are a good way to hear it: the miss in Hz is the beat rate.

### The Organic Imprecision Argument · Portamento's overshoot threshold (gathered) — keep

1. **Test or decoration?** A test for the listener: Loudon's suggestion is that overshoot reads as alive, and a listener can answer "sour" at every level. It does not put the page's quadratic ramp in the pair, and the caption says so plainly.
2. **Faithful?** Yes. The caption claims no result: "nobody has taken it yet."
3. **Walks up?** Two steps: can you hear it, then alive or sour. Enough for a gathered piece.

`contract {}` holds: grep finds no storage, no fetch, no outside host. It is tracked in git.

## Checks run

- `conform.mjs`: 4 pages, introduced 4, **errors 0, warnings 0**; browser pass at 760 and 1130 px.
- `fingerprint.mjs`: all three made sections **in step** (7ae2a16fa1ee, 55e39d37a98e, 8ce484f12b6d).
- The maker's `check.mjs`: all PASS.
- rich-server + headless Chromium (playwright from STIGMERGY's install): 5 frames, 4 proposal chips, **console clean**. I stepped every piece to its test. No AudioContext existed in the table read or the peak piece before Play was clicked; after Play both ran. After a simulated hidden page, both contexts were **suspended**. The joints piece makes no sound. Server stopped.
- Independent recomputation (numpy and sympy, scripts in the session scratchpad): the jump derivation; the joint numbers; Hermite's C¹ (symbolic jump 0); the Bézier chain's C¹ and its misses (0.0732 / 0.0190 / 0.0048 of peak at 8/16/32); the FFT peak numbers; the precision sweep at five starting phases; the table-read table above; the cheap Hermite form.
- Not verified: any listening. I did not hear the beats, the glide or the overshoot test.

## The offers

1. **What It Is, slope continuity — confirmed.** Derivation above. Largest jump ÷ steepest step: quad 29.3 / 7.6 / 1.9%, linear 82.8 / 39.8 / 19.7% at 8/16/32. Hermite and the chained Bézier: 0. Only change: "7% of the wave's height" → "7% of its peak."
2. **§ 3, sign of the peak formula — confirmed.** 438.28 Hz true (37.40 bins at 11.72 Hz a bin), tallest bar 433.59, vertex 435.81, page 431.38. Page = −vertex exactly. The page's worst miss across a bin: 0.983 / 0.990 / 1.000 / 1.000 bin (rect-lin, rect-dB, Hann-lin, Hann-dB). It is never closer than the tallest bar, which misses by 0.500 at worst. Both suggested fixes are correct.
3. **§ 3, window and scale decide the precision — confirmed.** Vertex worst miss 0.234 / 0.167 / 0.053 / 0.016 bin, the same on a 401-point sweep. Across five starting phases: rect-lin 0.231–0.238, rect-dB 0.163–0.173, Hann 0.053 and 0.016 at every phase. "About a fiftieth of a bin" (Hann on dB) and "a quarter bin" (none on magnitudes) are fair.
4. **§ 2, sweet spot — numbers confirmed, framing disputed in part.** Hermite is 3.4–4.6 dB ahead of quad on stray frequencies (3.4 / 4.3 / 4.5 / 4.5 from my rounded table; the maker's unrounded figures are 3.4 / 4.2 / 4.5 / 4.6). It is 8.7–12.0 dB closer by distance, and the quad shifts the tone −0.14° at 16. As a reading of the page, though: the page's sweet spot is a cost-against-quality claim, and the page already says cubic is closer. So the distance gap measures the page's own concession; it doesn't refute it. And "about half the arithmetic" holds only on the 9-multiply Hermite. On the 5-multiply form, the honest phrase is "one multiply fewer and half the adds." Take the offer with that clause rewritten; keep the time-shift sentence, which is new.
5. **Open Questions 1 and 3 — confirmed.** Quad is 8.3 / 13.9 / 19.8 / 25.8 dB below linear and 3–5 dB above Hermite. Linear at 2048 is 129.1 dB down. The time shift is a fair one-line answer to Q3. The scope holds: a sine table, not a rich one.

## The face as a whole

The face makes the page's idea felt, and it is not busy. Three pieces, each opening on one concept and ending on a test, and two of the tests catch the text out on things a reader would carry into code: the corner at every joint, and a peak formula that points the wrong way. The peak piece is the strongest — the beats turn a sign error into something you can hear slow down or speed up. The table read is the most thorough, and the only one that needs another round, for the cost it counts and for arguing with a point the page concedes. The soft knee and the Bézier section still have no piece, and the manifest's forward vector says so.
