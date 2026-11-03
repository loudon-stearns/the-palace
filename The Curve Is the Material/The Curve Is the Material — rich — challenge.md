---
title: "The Curve Is the Material — rich — challenge"
born: 2026-11-03
links:
  - target: "[[The Curve Is the Material]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of The Curve Is the Material's first rich face: its one piece judged on whether it tests the text, stays faithful and walks up, and its four offers recomputed by a script that shares nothing with the piece's engine."
---

# The Curve Is the Material — rich — challenge

Challenger · claude-opus-5-5 · proposal round 2026-11 · against the maker's commit `28b63c0c`, the page at section stamp `1805b3eeb033`. I judged from the page, the manifest, the one piece and the maker's commit body, nothing else.

## Is one section enough to ship?

Yes, as a Sketch. The page leans philosophical, and most of its claims are about what a design *should* be. The Morphing Quality Distinction is the one section that makes a claim a piece can measure, and the piece measures it. The maker gathered nothing, and that holds up: the commit says the nominated stiff-string files are a harmonic surface and an undocumented static tone, and neither tests a morph. What the face lacks is a lean toward the page's forward vector, the function picker. That belongs to a later round, along with a small piece that turns wire dimensions into B along a keyboard, which would make offers 3 and 4 something you can play rather than just read.

## The piece: two morphs.html — remake (one line)

1. **Test or decoration?** Test. Step 5 measures every point of both morphs against the nearest real string, with B and f₀ both free. If the text were wrong and the blend stayed a string, it would read zero. It doesn't: at t = 0.5, partial 1 reads B = 0.00200 and partial 24 reads 0.00186. The number morph reads 1.8 × 10⁻⁶ ¢, which is rounding. The test could have failed, and it found the size of something the text only names.
2. **Faithful?** Mostly. The text's first paragraph is about *arbitrary* curve blending, and it hedges ("may correspond to no coherent physical model"). The piece tests the friendliest case, two curves that are both strings, which are the pair the second paragraph names. The caption says this ("between the section's own pair"). Step 2's *scatter it* covers arbitrary curves without measuring them. Blending in cents is the right model: Wavetable B frames hold cents (`Projects/Inharmonic Wavetable Synthesis.md:87`) and use standard wavetable interpolation (`:274`). One sentence is wrong, though. Step 5's verdict box (piece line 405) says *"The size is set by the two ends and the partial count, not by the blending"*. The green line just above it shows the same two ends, morphed by the number, at 0 ¢. So the blending is what makes the departure, and the ends set how big it gets. **The fix:** replace that clause with *"Its size is set by how far apart the two ends are and how many partials there are:"*. No number changes. The step-5 preset name "guitar to piano bass" keeps the text's label. Offer 3 disputes that label, but the text wins, so it stays until the offer is taken.
3. **Does it walk up?** Yes. Five steps, one idea each: the flat line and one B; reading B back (the ruler); the number morph; the curve blend, with a toggle back to step 3 at the same t; then the test. Each step after the first has a *back* line tying it to the step before. It opens on step 1. Tuning item 9 is met.

**Runs clean:** no AudioContext before a click (`SND.ctx` false on load, headless). Sound comes only from buttons. A step change stops the sound. The kit handles hush on hide. The piece needs no files, declares only `flow`, and copies nothing licensed. The kit sizes it from 1109 to 1507 px across the steps. The caption is honest.

## Checks run

- `conform.mjs "The Curve Is the Material"`, re-run after the maker's commit: 1 page, introduced 1, **errors 0, warnings 0**, browser pass at 760 and 1130 px. The warning in the maker's body is gone.
- `fingerprint.mjs`: The Morphing Quality Distinction `1805b3eeb033` · 1 piece · **in step**. `git diff 28b63c0c~1 -- "The Curve Is the Material.md"` is empty, so the `.md` is untouched.
- The maker's `workshop/rich-face-checks.mjs`: all pass.
- `rich-server.mjs --detach` in the worktree, the face loaded headless at `?entry=The Curve Is the Material`: **console clean**, one `proposal · 2026-11-03` chip, the head reads 0 carried, 0 gathered, 1 made. Hyper-stiff preset verdict: 149 ¢ at t = 0.50. Server stopped.
- Independent recompute (a throwaway numpy/scipy script, sharing no code with the piece): minimax fit over log B on a 4001-point grid with bounded refinement, the f₀ offset solved exactly as a midrange, t scanned at 401 points.

## Offers

**1. The blend's distance is small for the section's pair. Confirmed exactly; corrects an emphasis.** My recompute, worst partial against the nearest string (share of the stretch it carries):

| ends | N | worst ¢ | at t | share |
|---|---|---|---|---|
| 0.001 → 0.003 | 16 | 1.560 | 0.50 | 0.45 % |
| 0.001 → 0.003 | 24 | 4.026 | 0.50 | 0.64 % |
| 0.001 → 0.003 | 64 | 12.255 | 0.50 | 0.67 % |
| 0.0002 → 0.004 | 24 | 15.653 | 0.50 | 2.77 % |
| 0.0002 → 0.004 | 64 | 65.323 | 0.50 | 4.37 % |
| 0.001 → 0.1 | 24 | 149.34 | 0.49 | 7.72 % |
| 0.001 → 0.1 | 64 | 212.3 | 0.50 | 6.45 % |

The "doesn't stay a string" idea isn't wrong. The blend is never one string, and the text only says "may". What's missing is a size. The offer should add two limits: the bound holds only when both frames are strings (for freely drawn frames, which is the first paragraph's case, there is no bound), and whether a few cents is audible wasn't checked. My memory is that a mistuned high partial needs well over 4 ¢ to be heard, but I haven't verified that.

**2. Function-type blending is the same weighted sum. It stands as an offer; it corrects emphasis and logic, not a fact.** The text's own words, "the weighted sum of two real physical models", describe a point-by-point blend, so the first and third paragraphs do conflict. But the offer overreaches the same way the piece's line 405 does. "What decides whether a blend stays near a physical model is its two ends, not the blending" should read: *that it strays at all comes from blending; how far depends on the ends*. Two points would make it stronger. First, a string-to-Bessel blend has an extra arbitrariness: membrane modes carry two indices (m, k), so "partial n" depends on how they are sorted before blending. Second, the distinction the text wants is real only for a path through one unified family, and Open Questions bullet 2 already asks for that "string-to-bell morph function". The offer could point there. It wasn't measured, and it says so.

**3. B ranges. Corrects a fact; partly confirmed, citation disputed.** I recomputed the treble wire: B = π³·E·d⁴/(64·T·L²) with E = 200 GPa, d = 0.775 mm, L = 51 mm, T = 700 N gives **B = 0.0192**. Its f₀ is 4263 Hz, close to C8, at 1.48 GPa of stress. So "B > 0.01: no real material" fails by calculation. The source is another matter. 10.1051/aacus/2021002 is Dalmont, *Piano bass strings with reduced inharmonicity: theory and experiments* (Acta Acustica 5, 9, 2021), a paper about **bass** strings. Its full text sits behind a bot check I didn't try to get around. What I could read (the DOAJ abstract, and the theory section as quoted in search) says the lowest strings have B near 10⁻⁴ on a large grand and up to 10⁻³ on an upright. That supports "0.004 is too high for a bass string". I could not confirm that it gives 10⁻² at the top, so the offer should cite the calculation for the treble, not Dalmont. And "B is lowest in the wound bass" is wrong as stated. Dalmont's paper exists because bass B in short pianos is high. B bottoms out mid-keyboard and rises at both ends, far more steeply in the treble. The palace's own sources disagree three ways: `Projects/Piano String Inharmonicity.md:61` says 0.0001–0.001, the May proof (`proofs/2026-05-04-B-slider.html:37`) says 0.0001 bass to 0.004 treble, and this page says 0.004 bass. I didn't check "B ≈ 0.0002 light guitar string".

**4. B = 0.1 is a real wire. Confirmed; corrects a fact.** I recomputed with E = 200 GPa, d = 1.5 mm, L = 10 cm, T = 500 N: **B = 0.0981**, f₀ = 949 Hz (ρ = 7850), stress 283 MPa, which is far inside music wire's strength. The bar limit holds. The ratio of n·√(1+B·n²) to n²·√B is 1.08 at n = 8, 1.02 at n = 16 and 1.009 at n = 24, so the partials go as n², the bar pinned at both ends. Two caveats, neither of which saves "nothing physical". The formula assumes hinged ends; clamping mostly moves f₀, which the fit absorbs. And at partial 24 the wavelength is 5.6 diameters, so shear and rotary inertia start to pull the top partials a little flat. The object is real; the formula is its first-order model.

**Fact or emphasis:** offers 3 and 4 correct facts (3's direction is right, but its citation and its "lowest in the bass" need fixing before it goes home). Offers 1 and 2 correct emphasis. 1 is measured; 2 is reasoning that needs the one-line sharpening above.

## The face as a whole

It makes the section's idea felt rather than just busy. You hear one number bend twenty-four partials, then you get a ruler for what "a string" means, then the two morphs side by side, and then a number. That number turns a vague warning ("may correspond to no coherent physical model") into a measured trade-off, which is what the page's own Analytic Efficiency section needs: how closely spaced Wavetable B frames have to be before a scanned blend stops sounding like a string. The face is thin, one piece on a page of seven sections, but it isn't hollow. It's honest about what it couldn't hear. Its single wrong sentence is a one-line fix, and the same slip should be fixed in offer 2.
