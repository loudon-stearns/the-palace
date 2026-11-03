---
title: "Mathieu Equation — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Mathieu Equation]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of the Mathieu Equation's first rich face: each piece judged on whether it tests the text, stays faithful to it and walks up to its test, and every measured offer recomputed by a method that shares nothing with the pieces' engine."
---

# Mathieu Equation — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5. Judged from the page (`Mathieu Equation.md`), the manifest, the six pieces, and the maker's commit body (49b40301) as its only account.

## Verdicts

**What the equation says · `Mathieu Equation — rich — breathing spring.html` · remake (small).**
Tests: yes. If the mapping a = (2ω₀/Ω)² were wrong, the measured peaks would land somewhere other than Ω/ω₀ = 2, 1, 2/3, and the piece would show it. Faithful: yes, it uses the section's own ω₀, Ω and depth. Walks up: yes. A spring alone, then a slow breath that only wobbles the pitch, then a faster breath from a whisper, then the measurement.
The one fault is honesty at the last step. At the default depth ε = 0.10, the piece's own table puts the third peak at −1.89 /s, "friction wins". Yet the verdict box says "the engine grows fastest at Ω/ω₀ = … 0.665", and the caption says "growth peaks at … 0.665". At that depth nothing grows at 2ω₀/3. The curve has a local maximum there, but it sits below zero. The mapping test still passes, because the peak is where it should be.
Fix, in two places. In the verdict string (line 382), name which peaks grow after friction and which are only the least decay. For example: "at 0.665 the curve peaks but friction wins; raise ε to hear it grow". Say the same in the caption, or open the step at a depth where all three grow.

**The Strutt diagram · `05_strutt_diagram.png` (gathered) · keep.**
The text names this figure, so it is the section's own picture. It is a record, not a test. Its caption is honest, and I checked it against the render: the second tongue fades in only near q ≈ 0.75, the third barely shows, and the Kapitza strip is marked. The caption's reason (thinner than a grid cell: 0.045 and 0.00084 wide at q = 0.3) matches my Hill-matrix widths.

**The Strutt diagram · `20_strutt_sweep.wav` (gathered) · keep.**
It makes "an arbitrarily small … noise input grows" heard. I measured its RMS in quarter-second windows. The level is about −45 dB to 1.75 s, then −31 dB at 2.00 s, −21 dB at 2.25 s and −15 dB at 2.50 s. On the way out it reads −23 dB at 28.0 s and −34 dB at 28.25 s. On the script's ramp, that crossing is q ≈ 0.05. It is the damped threshold q ≈ γ, with the script's ζ = 0.025 giving γ = 2ζ = 0.05 in canonical time. The caption's "between 2 and 3 s, as q passes 0.05" and "fades back between 27 and 29 s" both hold, and naming the script's wrong 0.10 is the right call.

**The Strutt diagram · `Mathieu Equation — rich — strutt walk.html` · keep.**
Tests: yes, all three claims. The roots run back to n², the widening is measured, and "first strongest" is measured as width and growth. Its step 5 also shows what the section leaves out. Faithful: yes. Step 2 repeats "outside the tongues every solution stays bounded", which is true at a = 2.2, and step 5 qualifies it. The plane spans a = −1 to 10, so the left ground is in view. Walks up: yes, bare line → outside → inside → plane → measure.
A note, not a remake: the A&S line in the piece lists six values and leaves out a₀, though the caption and the checks include it.

**The Strutt diagram · `06_strutt_explorer.html` (gathered, contract {}) · keep.**
This is the project's own proof, kept as it was. The caption is honest on both points I checked. Playback divides by the peak (`(xs[idx] / pk) * 0.4`, line ~286). The "on the boundary" preset sets a = 1.30, q = 0.30 (line 321), where my Floquet growth is 0.0000 per period and the tongue's edge is a₁(0.3) = 1.28832.
One disclosure is off. The maker's "console clean" holds only until this frame loads. Once it is scrolled into view, the face's console carries two errors: the explorer's CORS-blocked fetch of its own page, and `ERR_FAILED`. These are the same two warnings that conform names and the commit stands behind.

**Open Questions · `Mathieu Equation — rich — two tongues.html` · keep.**
Tests: yes. It tests the sign of the multiplier (n = 1 versus n = 2) and the damping claim, and it puts a number on "at what depth do they become audible". Faithful: it answers the bullets without changing them, and it stays an answer to open questions. Walks up: yes, tongue 1 → tongue 2 → side by side → damping.
Its damping reading holds as a whole. At the default T₆₀ = 1.58 s, the damping in each tongue's own units runs 6.31e−3 : 1.26e−2 : 1.89e−2, which is 1 : 2 : 3, as the "counts as more damped in tongue n" line says.

## Checks run

- `node "Mathieu Equation/workshop/rich-face-checks.mjs"` (maker's): **all passed**, 15 s. Every number in the commit was reproduced on the engine. The one exception: γ = 0.02 tongue 3 reads 1.582 in the run, against 1.584 in the manifest offer.
- `node _ops/rich-face/conform.mjs "Mathieu Equation"`: 4 pages, all introduced, **errors 0, warnings 2**. Both warnings are `sandbox-blocked` on 06_strutt_explorer, its self-fetch. The three made pieces are clean.
- `node _ops/rich-face/fingerprint.mjs "Mathieu Equation"`: all three sections **in step** (6ea64db08b95, 3200421c1ea8, 7d3bcfcbecf9).
- Rich-server, leased (8854/8855), face at `?entry=Mathieu Equation`, headless Chromium, scrolled through. Nothing landed in "Lost its place" and no section says "earlier version". The 05 figure and the wav both load, and the kit heights read 723/866/1293/786. The console holds the two explorer CORS lines above and nothing else. Server stopped.
- Each made piece was walked to its last step headless (screenshots in my scratchpad). No piece makes an AudioContext before a click. Sound runs through a compressor, and a step change stops it.
- `node _ops/rich-face/check-hidden-hush.mjs`: **all PASS**. The pieces carry no hush handler of their own and rely on the kit, as the README intends.
- Independent recompute, sharing no code with the engine: a truncated Hill matrix (60 terms, the four tridiagonal families) cross-checked against `scipy.special.mathieu_a/b`, plus monodromy by `scipy.integrate.solve_ivp` (rtol 1e−12).
- No licensed or Splice material. All three gathered files are tracked, and the made pieces need no files.

## Offers

1. **Left of a₀ (Strutt) · confirmed.** Hill matrix: a₀(0.3) = −0.044566 and a₀(1) = −0.45513860, the A&S value to 8 decimals. Just left of it the system grows: at a = −0.05, q = 0.3 the growth is 0.237 per period, and at a = −0.46, q = 1 it is 0.271. Just right of it, at a = −0.04 and −0.45, the growth is 0. The Kapitza point a = −0.1, q = 0.6 is bounded, with multiplier |ρ| = 1, between a₀(0.6) = −0.1734 and b₁(0.6) = 0.3583. The page's "outside, all solutions stay bounded" is false for a < a₀(q).
2. **Widths ∝ qⁿ (Strutt) · confirmed.** At q = 0.3: 0.599158, 0.044559, 0.0008423. The leading terms are 2q, q²/2 and q³/32, which give 0.6, 0.045 and 0.000844. Doubling q from 0.15 to 0.3 multiplies the widths by 2.00, 3.98 and 8.02. Peak growth per period: 0.4691, 0.01758, 0.000221.
3. **Embed 05 (Strutt) · agree.** The text is talking about an image, so the placement rule keeps the image in the text.
4. **q = a·ε (What the equation says) · confirmed, exactly.** Substitute τ = Ωt/2 into ẍ + ω₀²(1 − 2ε cos Ωt)x = 0. It becomes x″ + (2ω₀/Ω)²(1 − 2ε cos 2τ)x = 0, so a = (2ω₀/Ω)² and q = aε. Numerically, the monodromy trace in physical time matches the canonical one to 8 decimals at Ω/ω₀ = 2.000, 1.045 and 0.682. Under this parametrisation the page's "a ∼ (2ω₀/Ω)²" is also exact, so the offer could turn ∼ into =.
5. **Open Questions · confirmed where it is the equation, engine-bound where it is audibility.** Damped thresholds at γ = 0.02, from my own integration: 0.0200, 0.4018 and 1.5820, with √(8γ) = 0.4000. The multiplier is negative in tongue 1 (ρ = −1.537 at a = 0.85, q = 0.3). The audibility depths depend on this engine's whisper (1e−5 noise) and on the −30 dB target, not on the equation alone. On the engine, tongue 1 at q = 0.01 reaches −30 dB in 0.90 s, and at q = 0.008 in 1.07 s. If the bullet carries these numbers, it should say what they were measured against.
6. **"Only at the resonant rate" (Philosophical Lens) · real, and taste.** Growth bands sit at Ω = 2ω₀, ω₀ and 2ω₀/3, confirmed by the breathing-spring peaks. The line quotes a Dialectic, so leaving it alone is fair. This one is for Loudon to choose.

**The 07 aside · confirmed. It is an offer for [[Floquet Time-Modulated Loops]], not something this page should drop quietly.** In `Projects/Floquet Time-Modulated Loops/static/07_tongue_anatomy.png`, the green "outside, bounded" point at a = 0.85, q = 0.3 sits inside tongue 1. The script's own boundary, a₋(0.3) = 1 − q − q²/8 + q³/64, gives 0.6892. The Hill matrix gives b₁(0.3) = 0.689166. The dot is drawn inside its own shaded tongue, and its inset grows to about 2×10⁵ in 30 periods (Floquet growth 0.430 per period, ρ = −1.537). A smaller second fault sits in the same figure. The "on boundary, marginal" inset uses a₊(0.3) − 0.001 = 1.28733, which is also inside the tongue (a₁ = 1.28832). That is why its trace climbs from 1.0 to about 1.5 over 30 periods instead of holding steady. The fix moves the outside point below 0.689, for example a = 0.6, and either sets the boundary sample exactly on a₁ or relabels it as slow growth.
**A further offer for the same project:** the `20_strutt_sweep.py` docstring places the crack "around q ≈ 0.10". The wav crosses at q ≈ 0.05, the damped threshold.

## The face as a whole

The face makes the page's idea felt, not just busy. All three made pieces share one engine, and they ask one question three ways: where does a whisper grow? The breathing rate becomes a. Then the tongues root at n². Then damping thins the higher tongues first. Each walk earns its measurement, and two of them find things the section does not say: the left ground and the qⁿ rate. The gathered pieces sit beside the walks honestly, their faults named in their captions rather than hidden. The face is heavy, though. "The Strutt diagram" carries a figure, a sound, and two band interactives about 2,150 px tall. The walk's plane step and the project's explorer do much the same job, back to back. That is a taste note, not a verdict. The one honesty slip is the breathing spring calling a negative peak "growth".
