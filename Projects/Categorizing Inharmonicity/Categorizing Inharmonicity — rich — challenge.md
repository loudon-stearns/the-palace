---
title: "Categorizing Inharmonicity — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Categorizing Inharmonicity]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of the first proposal round on Categorizing Inharmonicity's rich face: every piece judged with a reason, every offer recomputed outside the maker's engine, so the remake round and Loudon start from numbers rather than trust."
---

# Categorizing Inharmonicity — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03, proposal round. Judged from the page (`Projects/Categorizing Inharmonicity.md`, untouched since before 69beb645), the manifest, the two made pieces, the six gathered proofs, and the maker's commit body (69beb645) as its only account.

**Tally: 5 keep, 3 remake, 0 retire.** The three remakes are wording only: two captions and two sentences in one piece. No engine changes.

## The pieces

One section, "The Inharmonicity Space: Primary Dimensions", eight pieces.

### `proofs/2026-05-04-five-flavors.png` — keep
- Tests or decorates: a record, not a test. The caption is where the testing happens, and it states what was measured on the WAVs.
- Faithful: yes. The image matches the caption (harmonic plus four kinds, 220 Hz, sixteen partials, the first second). Its Bessel panel stops at 4.5 kHz, so partial 16 (4527 Hz) falls just off the top; that doesn't matter.
- Walks up: n/a for a figure.

### `Categorizing Inharmonicity — rich — threshold.html` — keep, with notes
- Tests or decorates: tests. The blind staircase could come out "the same across kinds" or "not the same", and so could "Bessel is more salient than stochastic". That is the Open Questions' threshold question, asked of the listener.
- Faithful: yes. It says its ruler is a choice and what that choice hides, and says the result is "for you". The Järveläinen, Välimäki and Karjalainen (2001) note is apt.
- Walks up: yes. It starts with the harmonic series and the ruler at zero, then raises one kind, then sets all six to the same mistuning, and only then runs the blind test.
- **The staircase, judged as a test.** The design is textbook: two intervals, two choices, 2-down 1-up (Levitt's 70.7% point), a ×2 step until the second reversal and ×√2 after, eight reversals, and the log-mean of the last six. Stochastic and chaotic get a fresh draw every round, which is right. The maker's simulated listener comes back at 4.46 against a true 4.39 ¢. Three limits. None of them is a remake, and the next round should hear all three:
  1. **The reference is never roved.** The harmonic tone is the same buffer at the same 220 Hz every round. Any difference wins: a stretched tone also sounds a little higher and brighter. So the threshold measures "distinct from this harmonic tone", which is literally what the question asks, but not "heard as inharmonic". Roving f₀ by a few percent per interval would force the answer to rest on the pattern.
  2. **It tests each kind against harmonic, never one kind against another.** "Kinds, not degrees", and offer 6, need a kind-against-kind test at equal mistuning (an ABX of stretched against the phase loop, say). Step 3 only lets you listen, sighted.
  3. The kind's symbol `m` (how far toward J₀) collides with the Bessel order m in J_m, which offer 4 uses. That is the same collision the maker flags for § 4's B.
- Placement note, taste: the question the piece asks lives under Open Questions, but the piece sits at the head of Primary Dimensions. Keep it as is. If a later round opens an Open Questions section on the face, this piece belongs there.
- I checked for myself that the phase kind's mistuning rises steadily with its number across 341 settings (worst downward step +0.0013 ¢, none down). So the bisection lands: 2, 5, 10, 30 and 60 ¢ fall at −a = 0.46, 0.57, 0.65, 0.755 and 0.81. The 60 ¢ ceiling is reachable in every kind, though stretched only just (65 ¢ at its top).

### `proofs/2026-05-04-01-harmonic.wav` — keep
A record, and the caption is true: my peaks are 220.0 to 3520.0 Hz, on their places.

### `proofs/2026-05-04-02-stretched.wav` — remake (caption, one number)
The record is good and the caption's B = 0.0008 is right (partial 16 measured at 3863.9 Hz). But "162 ¢ sharp" against 3520 Hz is **161.3 ¢** (1200·log₂(3863.7/3520)), or 160.6 ¢ against 16 × the measured 220.09 Hz. Write "161 ¢".

### `proofs/2026-05-04-03-bessel.wav` — keep
Measured independently: 220.0, 504.7, 791.3, 1078.7 … 4526.7 Hz, gaps about 286 to 287 Hz above the first. The caption's 505.0 is the interpolated peak, and the true J₀ ratio gives 504.97. The caption says "one family … a comb slid up" and "a real drumhead sounds many families". That is offer 5, said honestly.

### `proofs/2026-05-04-04-stochastic.wav` — keep
Partial 1 at about 229 Hz (229.5 by my bin pick, 229.1 interpolated). Deviations run up to −58 Hz (partial 5, 1041.7 against 1100), so "up to about 60 Hz" holds. Frozen across the first two seconds.

### `proofs/2026-05-04-05-chaotic.wav` — remake (caption, one clause)
The measurements hold. The partials are frozen (identical peaks at 0 s and 1 s: 249.7, 397.7, 676.3 … 3991.0 Hz) and nothing sits below 220 Hz, so there is no period-doubling. But "**By ear** it is a second stochastic proof" claims a hearing, and the commit says nothing was listened to. Write "By its spectrum it is a second stochastic proof".

### `Categorizing Inharmonicity — rich — phase loop.html` — remake (wording only)
- Tests or decorates: tests, and it comes out against part of the text, which is the best kind. Every spectrum is read off the rendered sound, and the phase condition predicts it to 0.08 ¢.
- Walks up: yes. A delay loop alone, then the all-passes outside the loop, then inside it, and only then the claim with a control.
- Faithful: not quite. The page's § 6 opens "A chain of all-pass filters **in a feedback path**", and its signature says "per round-trip". The piece's opening line ("§ 6 says a chain of all-pass filters changes no level, only phase, and still makes a tone inharmonic", line 80) drops the feedback path. Its step-4 verdict (line 425) says "Yes, with a condition the section doesn't state". The section does state the condition. It is the synthesis list ("Feed a harmonic tone through the cascade") that contradicts the section's own first sentence. The manifest's offer 1 has this right, and the piece should match it. Fix line 80 to name the feedback path. Fix line 425 to read along the lines of "Yes, and it takes the loop the section's first sentence names; passed through once, as the synthesis list says, …". The engine is unchanged.
- Note, not a remake: the straight-line control is the step-1 loop again (D 186 + 32 = 218 samples at the start setting). It shows linear phase is harmless, but it adds no evidence beyond step 1. A control with a fractional linear delay would be a stronger one.

## Checks run

- `node "Projects/Categorizing Inharmonicity/workshop/rich-face-checks.mjs"`: **all pass**. The engine and shared blocks are byte-identical in both pieces (I re-diffed them too).
- `node _ops/rich-face/conform.mjs "Categorizing Inharmonicity"`: 2 pages, introduced 2, **errors 0, warnings 0**, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Categorizing Inharmonicity"`: Primary Dimensions `363ca6a0285a`, 8 pieces, **in step**.
- Every file the manifest names is git-tracked (`git ls-files`). Nothing is licensed or copied in. The `.md` is unchanged by the maker's commit.
- `rich-server.mjs --root <worktree> --detach`, `?entry=Categorizing Inharmonicity`, headless Chromium (STIGMERGY's Playwright) at 1130 px. Results: 2 frames, 8 proposal chips, no unresolved-file boxes, the PNG placed. The threshold piece walked through all four steps, and at 10 ¢ its step 3 names stretched and the phase loop closest at 1.0 ¢. My script stalled clicking inside the phase-loop frame in the face, which was a fault in my script, not in the piece. So I walked that piece standalone in headless Chromium instead: all four steps ran, and step 4 reads chain gain 3.1 × 10⁻¹⁴ dB, outside 0.00 ¢, partials 4 · 8 · 16 at +3.96 · +15.2 · +48.8 ¢, 0.08 ¢ off prediction, control +0.07 ¢, fit B = 2.31 × 10⁻⁴ at 1.22 ¢ rms. Its verdict renders the "condition the section doesn't state" sentence judged below. **Console: clean** in the face and standalone.
- Sound: both pieces create their AudioContext only inside `soundOn()`, which is reached only from click handlers or from the answer timeout after a click. Neither answers `rich:hush`, so the kit hushes them when hidden.
- My own recomputation: Python, scipy, outside the maker's engine (scratchpad `challenge-ci/recompute.py`, `r2.py`).

## The offers

1. **Confirmed.** A first-order all-pass is linear and time-invariant. Its gain is 1 at every frequency (5.8 × 10⁻¹⁵ dB off), and it changes only phase, so a steady partial passed through it keeps its frequency. That holds by definition, and the measurement agrees: through eight stages at a = −0.6, the largest move is 0.00000 ¢ and energy out ÷ in is 1.00000. Inside the loop (D = 186, M = 8): the condition ω·D + M·φ(ω) = 2πk, solved independently, puts partial 16 at +48.68 ¢ off 16 × partial 1. The rendered loop measures +48.75 ¢, and the worst partial sits 0.080 ¢ off its prediction. The page's first sentence already says "in a feedback path", so this offer fixes the synthesis list against its own section.
2. **Confirmed.** α·f is plain delay. It retunes the loop and keeps it harmonic, and only what isn't proportional to f bends the spacing. (Footnote: a constant phase term would also bend it, as a frequency shift, but a first-order all-pass has φ(0) = 0, and the page's series has no constant.) Phase beyond linear at partial 16: −2.88 rad per trip. The stiff-string fit is **B = 2.30 × 10⁻⁴, 1.21 ¢ rms** on the predicted modes and **2.30 × 10⁻⁴, 1.22 ¢** on the measured ones. "A fixed cascade gives a fixed stretch" holds near the start setting. The offer itself says the fit departs at the extremes (24.9 ¢ rms at M = 4, a = −0.85). Van Duyne and Smith 1994 is the right citation.
3. **Confirmed, with the page's exact words.** § 4 reads "sharpened by an amount that is logarithmic in their frequency (or equivalently, proportional to the partial number)", with $f_n = n \cdot f_0 \cdot (1 + B \cdot \log(n))$. In cents the deviation is logarithmic in n, and so in frequency. That part stands. The "equivalently proportional" clause is wrong: the Hz deviation divided by n grows like ln n (0.0139, 0.0277, 0.0416, 0.0555 at n = 2, 4, 8, 16, b = 0.02) instead of staying constant. For small b the formula is within **0.65 ¢** (b = 0.01) and **2.57 ¢** (b = 0.02) of **f₀·n^(1+b)**, a constant stretch per octave of partials (23.84, 23.51, 23.20, 22.89 ¢). The page doesn't give its log's base. With log₁₀ the coefficient rescales by ln 10, and the shape is the same.
4. **Confirmed.** A clamped rim is ψ = 0 (Dirichlet), so the modes sit at zeros of J_m: J₀ gives 2.405, 5.520, 8.654, 11.792 and J₁ gives 3.832, 7.016, 10.173, 13.324, exactly the page's lists. ∂ψ/∂r = 0 is a free edge (Neumann), so the modes sit at zeros of J_m′. For m = 0, J₀′ = −J₁, which gives 3.832, 7.016 … So the page's J₁ list also happens to be the free-rim m = 0 family. Cymbals and tam-tams are plates, not membranes. Their bending equation is fourth order, frequency goes with k², and their modes mix J_m with I_m, so these zeros don't give their partials. The page's "Circular membranes (drums, cymbals, tam-tam)" needs the split.
5. **Confirmed.** Consecutive J₀ zeros differ by 3.1153, 3.1336, 3.1378, 3.1394, 3.1401 and tend to π. McMahon's j₀,ₛ ≈ π(s − ¼) gives 2.356, 5.498, 8.639, 11.781. J₁ and J₂ also tend to π, from above. One family scaled to 220 Hz sits +238.5 ¢ at partial 2, +435.5 ¢ at 16, and levels toward +462.7 ¢ (1200·log₂(π/2.405)). Mixing families m = 0 to 3 gives gaps from 0.17 to 1.47 (in units of x), uneven. One phrase in the section should survive the remake: "does not form simple ratios" stays true.
6. **Numbers confirmed. The reading is partly disputed.** At 10 ¢ on the piece's ruler, independently: stretched and phase are **0.96 ¢** apart, Bessel and log **2.38 ¢**, stretched and log 6.81, stretched and Bessel 8.71. At 25 ¢: 3.49, 5.86, 16.78, 21.51. These match the maker. **Is it the ruler or the pattern?** 90% of the ruler's weight sits on partials 1 to 4. So I matched the kinds on two other rulers:
   - **Stretched ≈ phase loop holds on every ruler.** Unweighted RMS at 10 ¢: 0.38 ¢ apart. Matched on the farthest partial: 0.87 ¢ at 20 ¢ and 3.64 at 50. It is a fact about the patterns. Both are dispersion; offer 2's fit says the same.
   - **Bessel ≈ log leans on the ruler.** The gap is 24% of the mistuning on the piece's ruler and 16% unweighted. Matched on the farthest partial it is 33% (6.51 ¢ at 20), against 49 to 51% for the cross pairs: closer, not alike. Their shapes differ in kind. Bessel levels off toward +463·m ¢, while log keeps climbing (at 10 ¢: Bessel 12.4, 18.3, 21.2, 22.6 ¢ against log 8.5, 17.0, 25.5, 33.9 ¢ at n = 2, 4, 8, 16).
   - **Neither is a fact about the ear.** Offer 6 says "Whether each gap is heard is the reader's test in the threshold piece's step 3", which overclaims. Step 3 is sighted listening, and the blind test (step 4) compares each kind with harmonic, never one kind with another. Suggested wording: "Stretched and the phase loop are one pattern on any ruler; Bessel and logarithmic are close on this one; whether any gap is heard is untested." The offer's other point stands: the list mixes mechanisms (stiffness, an all-pass loop, chaos, chance) with patterns.
7. **Confirmed.** The threshold question assumes a common magnitude. The palette's "0 = perfectly harmonic, 1 = maximum deviation" doesn't define one, and my ruler comparisons in offer 6 show the ruler changes the comparisons.
8. **Confirmed, and flagged for the round.** "Pallete" → "Palette". The fix renames the heading, so the section's key changes from "Synthesis Directions: Building an Inharmonicity Pallete" (`b10cce1bd8a2`) to "…Palette". Nothing on the face anchors there now. Any later round that makes pieces there must use the new key, and whoever carries the fix should check that no manifest or note names the old one. It is a `.md` edit, so it waits for Loudon like the rest.

## The face as a whole

It makes the page's idea felt, not just busy, and in one place it makes the page better than it was. The phase loop is the strongest piece here. It takes § 6's most romantic claim ("entirely phase-based") and finds it true, but only in a loop. It also finds that what the loop makes is § 1's stretch. That is a real find: two of the six "kinds" are one physics (dispersion) reached by two routes. The threshold piece is honest, careful work, and its blind staircase can answer the Open Question for one listener. But it can't yet answer the page's deeper claim, kinds not degrees, because it never pits two kinds against each other blind. The gathered May proofs are well used. Their captions are measured, not assumed, and they quietly catch the May chaotic render being a second stochastic one. Two small slips in captions and one misreading of the text in the phase piece are all that stand between this face and landing. Nothing here was listened to by maker or challenger.
