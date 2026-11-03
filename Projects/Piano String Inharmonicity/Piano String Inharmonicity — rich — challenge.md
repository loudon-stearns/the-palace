---
title: "Piano String Inharmonicity — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Piano String Inharmonicity]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Piano String Inharmonicity's first rich face: each piece judged on whether it tests the text, stays faithful to it and walks up to its test, and every offer recomputed by a separate script that shares nothing with the pieces' engine."
---

# Piano String Inharmonicity — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5. I judged from the page (`Piano String Inharmonicity.md`), the manifest, the six pieces and their source, and the maker's commit body (40de2ea3) as its only account.

## Verdicts

**The Physics · stretch.html: keep.**
1. *Test or decoration?* A test. Step 4 sets the exact formula against the section's B·n³·f₀/2 and reads the slope between doublings. The slope could have come out at 3, and it doesn't once B·n² grows: the piece found a condition the text leaves out.
2. *Faithful?* Yes. The text's own example is computed live (183.69 Hz against the text's 184). The piece does say something the page doesn't: that the cube holds "while B·n² is small, not just while B is small". That is offer 2, not a contradiction of the text. The B slider in step 4 reaches 0.004, past the text's 0.001, which matches the May proof's header.
3. *Walks up?* Yes. One partial alone, then the row of twelve against its ghosts, then beats against one ghost, then the cube.
Note (taste, not remake): the step-4 button, "hear partials 2, 4 and 8 against their ghosts" (stretch.html:135, :421), promises "the eightfold jumps" (:132). At B = 0.001 the three beat at 0.88, 7.0 and 55 per second. The third is roughness, not beats you can count, and the piece's own step 3 calls that "too fast to count". Partials 1, 2 and 4, or a default B of 0.0004, would make all three countable.

**The Physics · proofs/2026-05-04-B-slider.html (gathered): keep.** It plays the formula with free controls and doesn't claim to test anything. The caption is honest about the difference between the proof's B range (0.0001–0.004) and the text's (0.0001–0.001), and says neither is sourced. Its AudioContext is made only inside `ensure()` on a press (line 88).

**The Physics · proofs/2026-05-04-real-piano-and-bending-curve.png (gathered): keep.** It is a reference figure, and the caption says plainly that its origin is unrecorded and the curve is drawn. I checked its cent labels on the formula at B = 0.0008: partials 4, 8 and 12 sit +11.0, +43.2 and +94.4 ¢ above n·f₀, which matches the caption's +11, +43 and +94.

**String Bending and Timbre Change · bend or fret.html: keep.**
1. *Test or decoration?* A test. The section's claim, that a bent note sounds different from an unbent one at the same pitch, has to pick which unbent note. The piece measures both candidates and the answer differs: against the fret the claim holds, against the peg it doesn't.
2. *Faithful?* Yes. It uses the text's own f₀ → √k·f₀ and B → B/k, and the text's own coefficient formula for B. The peg-turned row is the bent row by construction (`s4p` plays the same `raiseBy(...).bend` as `s4b`, bend or fret.html:395). That is honest, because the claim is that the two are physically identical, and in this model they are: tension changes and length doesn't.
3. *Walks up?* Yes. Rest, then bend alone, then fret alone, then the two at the same pitch.
Note (not remake): the bend starts from the open 648 mm string, but the teaching text says "push the string across the fret" (:97). A real whole-tone bend usually starts from a fretted note. The ratio doesn't change: bending from fret m and fretting at m+2 still differ by r⁴. One sentence saying the ratio holds from any starting fret would close that gap.

**Why This Is Linear Time-Invariant · click through the string.html: remake.**
1. *Test or decoration?* Steps 1–3 walk up cleanly: one ring, then forty, with dispersion seen as a click smearing into a chirp (a good find), then convolution. Step 4 is presented as a test that could fail, and it can't. The teaching text says the resonator bank is "a different computation from the formula for h(t). If the section is right, that string and the convolution with h(t) give the same output" (:127). But the bank's two-pole coefficients are built from the same mode list `M` that builds h(t) (`bankRun`, :213–216). Each resonator's impulse response is A·rᵏ·sin(θk + φ) by design, so the bank equals convolution with h(t) for any list of modes, whatever their frequencies. The −228 dB agreement checks the arithmetic, not the physics. The scale, sum and shift checks are also linear by construction at drive = 0. "Twice as loud" comes out bit-exact because ×2 is exact in floating point. If stiff strings were in fact nonlinear, every row would still say "holds". The verdict line (:390), "so the section's h(t) is the whole of this string", claims more than the computation shows.
2. *Faithful?* Its caption and verdict overstate what it showed, as above. The drive half is fine and honestly called "a sketch of tension modulation".
3. *Walks up?* Yes.
**What to do (one round), either:** (a) replace the bank in step 4 with a string built from its wave equation, a finite-difference stiff string (y_tt = c²·y_xx − κ²·y_xxxx, with damping and pinned ends; around 100 points at 48 kHz for 2.6 s is cheap in JS). Measure its partials against the formula, which would be a second, independent test of The Physics. Then run the four checks on it, with Kirchhoff–Carrier tension modulation (tension rising with the mean squared slope) as the drive. That would test the section's actual sentence, "the wave equation for a stiff string has frequency-dependent phase velocity, but this is still LTI." Or (b) keep the bank and say what it is. The resonators are built from h(t)'s own terms, so their agreement checks the arithmetic, and what step 4 shows is that dispersion (B) and amplitude dependence (drive) are separate dials: one moves the partials, the other breaks linearity. Retitle the verdict to match and drop "the whole of this string". (a) is the stronger piece. (b) is the honest minimum.

**Interactive Teaching Demonstration · string-bending-inharmonicity.html (gathered): keep.** It is the demo this section describes, as it is. The caption says there's no limiter and to start quiet: sixteen sines at −6 dB stepping down by 1.5 dB go straight to the destination (around line 251). Its AudioContext is made only inside the play toggle.

## Checks run

- `node "Projects/Piano String Inharmonicity/workshop/rich-face-checks.mjs"`: all passed. I read its verdict lines, and they match the numbers below.
- `node _ops/rich-face/conform.mjs "Piano String Inharmonicity"`: 5 pages, introduced 5, errors 0, warnings 0, browser at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Piano String Inharmonicity"`: four sections stamped, all in step (ed9dfdb40526, 8d9458e32671, 5dbd77f824b3, e7f1f60cdcbd).
- `rich-server.mjs --detach`, then `?entry=Piano String Inharmonicity` in headless Chromium, scrolled to load every frame: 5 frames loaded, zero console lines of any kind, no page errors, no AudioContext made in any piece before a click, 7 "proposal" marks on the face. Server stopped.
- The three made pieces' `engine` and `shared` script blocks hash identically (md5), as the commit says.
- Not tested: hush when the frame is hidden (left to the kit, as the maker says), and the mix.
- `git ls-files`: every piece and gathered file the manifest names is tracked under the bundle. Nothing licensed is copied.

## Offers

Recomputed in a separate Python script (scratchpad `challenge-psi/recompute.py`) from f_n = n·f₀·√(1 + B·n²) and B = π³·E·d⁴/(64·T·L²). It shares no code with the pieces.

1. **f₀ is the stiffness-free fundamental (no-claim-edit): confirmed.** f₁ = f₀·√(1 + B) sits +0.865 ¢ above f₀ at B = 0.001 and +1.730 ¢ at B = 0.002. The maker's 0.87 and 1.73 are right.
2. **The cube holds while B·n² is small (claim-change): confirmed.** The slopes between doublings at f₀ = 220, B = 0.001, from n = 2→4 up to 32→64, are 2.996, 2.983, 2.938, 2.808 and 2.573. B·n³·f₀/2 at n = 12 is 190.08 Hz against an exact 183.69, 3.48% high. At n = 32 it is 3604.5 against 2975.6, 21.1% high. The text's 184 Hz is right. The algebra agrees: the local exponent is 1 + x/(s(s−1)) with x = B·n², s = √(1+x), which is 3 at x → 0 and 2 as x → ∞.
3. **Bend vs fret, ratio r⁴ (claim-change): confirmed, and the exponent is right.** B ∝ 1/(T·L²) and f ∝ √T/L. A bend by ratio r multiplies T by r², so B → B/r². A fret shortens L by r, so B → B·r². The ratio is r⁴ = 2^(4·200/1200) = 1.5874 for a whole tone. On the exact formula, with the G string tuned so its heard first partial is 196 Hz: T = 74.23 N, B = 1.0826×10⁻⁴; bend B = 8.593×10⁻⁵; fret B = 1.3640×10⁻⁴; ratio 1.58739. Both land on a first partial of 220.00256 Hz. Partials 5, 10 and 16 sit +1.78, 7.33 and 18.76 ¢ above n·f₁ when bent, and +2.83, 11.61 and 29.59 ¢ when fretted. The peg-tuned string has the bent string's B exactly, since both change only T. The maker's "tension against length, not bent against unbent" stands.
4. **"Dispersion Usually Means Non-Linear" (claim-change): confirmed in substance, but "conflates" is too strong.** The subsection's narrow point is true. In some media the dispersion relation itself depends on amplitude (Stokes waves on deep water, the Kerr effect in optics), those systems are not LTI, and stiff-string dispersion is not of that kind. What is off is the framing. The heading's "usually", plus the section's opening "Despite being called 'dispersion'…" (`Piano String Inharmonicity.md:104`, `:118`), makes linear dispersion sound like the exception, when linear dispersion relations are the ordinary case: a glass prism, group-velocity dispersion in a fibre, bending waves in a beam, a spring reverb. "Shock waves" is also a weak example. Shock steepening is nonlinearity working against dissipation or dispersion, not dispersion that depends on amplitude. A smaller point: "purely geometric" (`:120`) is loose too, because the dispersion comes from bending stiffness, the fourth-order term carrying E and d⁴. The maker's proposed retitle ("Dispersion Is Not Nonlinearity") is right. **The evidence it cites is not.** The offer leans on the click piece's −228 dB and its four checks, and per the remake above those hold by construction. The offer stands on textbook physics, not on the piece.

**The −228 dB question.** I re-ran the piece's own `lti()` at B = 0, 0.0008 and 0.002 with no drive: conv −230.6, −228.1 and −230.8 dB; sum −261.7, −261.6 and −260.9 dB; scale and shift bit-identical. With drive 0.0005 at B = 0.0008: −24.3, −24.3 and −27.9 dB, shift exact. At B = 0 with drive: −20.0, −19.9 and −22.0 dB. The maker's numbers reproduce. −228 dB (about 4×10⁻¹²) is **not** below double-precision noise. Double-precision ε is 2.2×10⁻¹⁶, or −313 dB, so −228 dB is roughly 85 dB above it. That is about what 2.6 s of two-pole recursion (125 k samples, forty modes) accumulates as rounding. Two different arithmetic paths really do agree to rounding: a separate time-domain direct sum over 0.3 s gives bank vs direct −231.9 dB and FFT vs direct −247.4 dB. So it is not literally one computation run twice. It is one *system* written two ways: the bank is h(t) rebuilt as filters. The number shows the code is right, and that is all it can show.

## The face as a whole

The face makes the page's idea felt. Two of the three walks do what Enrichment asks: each starts from one concept and ends on a measurement that could have gone against the text, and each came back with something the page lacks. The stretch walk found the B·n² condition, and the bend walk found that the claim needs a fret to stand against. The beats step is a good hinge: it turns a number of hertz into something you count. The click walk has the best single image on the face, the click smearing into a chirp as B rises, which shows dispersion in time. Then it ends on a test it can't fail, and that is the face's one weak joint. It is not busy. Six pieces across four sections, three of them gathered as they were with honest captions, and one engine shared byte for byte. Fix step 4 of the click walk, ideally with a real stiff string, and the LTI section gets a test of the sentence it actually stakes.
