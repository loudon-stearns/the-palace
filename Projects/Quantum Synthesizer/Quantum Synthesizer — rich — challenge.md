---
title: "Quantum Synthesizer — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Quantum Synthesizer]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of Quantum Synthesizer's proposal-round rich face: a verdict and a reason for every piece, the numbers recomputed apart from the maker's solver, and the one place the face's two-ears frame needs the page's own third rule beside it."
---

# Quantum Synthesizer — rich — challenge

Challenger · claude-opus-5-5 · proposal round 2026-11 · against the maker's commit 385616bf. Judged from the page (`Projects/Quantum Synthesizer.md`), the manifest, every piece, and the maker's commit body.

**12 keep · 1 remake · 0 retire.**

## The pieces

Three questions for each: does it test the claim or decorate it, is it faithful to the text, does it walk up.

### Quantum Synthesizer (the opening)

**proofs/schrodinger-AB-harmonic-then-anharmonic.wav — keep.** A test, though a modest one: a parabola, then a quartic, and only the well changes. A clean tone becomes a bell, so the opening claim (one equation, the well chooses the sound) is heard rather than asserted. It is faithful. The caption names the rule it plays, gaps counted up from the lowest level, and that matters for the offers below. Its walk is two steps, A then B. That is enough for a margin audio.

### The Isomorphism: Wave Functions as Sound

**proofs/wick.mp4 — keep.** A test, and one that disagrees with line 40 ("complex conjugate poles"). wick-checks.txt fits every partial's damping ratio to sin θ at 0.1°, 1°, 5° and 30°, and all pass. The caption says the proof finds one lossless pole per level, not a conjugate pair, and points to the steward's tuning item 3. That is honest disagreement and not unfaithful: the text wins, and the disagreement waits for Loudon. It walks the dial from 0° to 90°.

**Quantum Synthesizer — rich — two ears.html — remake.** It is a real test. The spectra come from an FFT of ψ computed in time, so they could have come out differently, and my independent recompute agrees with every number (below). It walks up properly: one rung alone, then the ladder, two rungs, a packet, and the test last. The step rail stays open, Back and Next work, changing step stops the sound, there is no sound before a click, and it hushes when hidden. But the two-ears frame is the bundle's, from the steward's ladder proof and tuning item 2. The page never makes it. The page's own oscillator proofs hear by a third rule: gaps counted up from the lowest level. `schrodinger_ab_synth.py` does this, `well-morph-explorer.html` line 62 says `fₙ = 196 Hz × (Eₙ − E₀)/(E₁ − E₀)`, and `pendulum.py:101` has `gaps = E[1:] - E[0]`. Under that rule the oscillator gives 1 · 2 · 3 · 4 and the hard-wall box gives 3 · 8 · 15 · 24. The piece shows only two rules, so a reader leaves thinking the page's harmonic-series sentence is simply wrong. Under the page's own rule it is right in substance and wrong only in its subject (see offer 1). **The fix, for one round:**
- (a) In step 5, add the third rule, "counted up from the lowest, as the page's own proofs do", either as two more table rows (oscillator, box) computed from `W.E` or as one line in `verdict()`. Give its numbers: oscillator 1 · 2 · 3 · 4 × 220 Hz, box 3 · 8 · 15 · 24 × 110 Hz. Then change "Under one rule they can't both stand" to say under any one of the three.
- (b) In the step-5 note, say the clock's pitches assume energy counted from the well's floor. Raise the floor and every clock pitch moves while the detector's don't. Raised by half a quantum, the oscillator's clock would read 1 · 2 · 3 · 4. That is what "a phase shared by the whole state is not physical" means, and the plain version should be on the page.
- (c) Add a check for the third rule to `Quantum Synthesizer — proof — two ears checks.mjs` and re-run it.

**proofs/hermite.mp4 — keep.** A test that disagrees with line 56. The caption's numbers match hermite-checks.txt: at least 99.95% of the energy in one peak (the worst is 99.959%, at n = 4), 12 to 20 partials on the comb, and 9 to 15 as a wavetable. It walks n = 0 to 5, each in readings A, B, C.

### Quantum Operators as Musical Transforms

**proofs/ladder.mp4 — keep.** A test that disagrees with line 62 ("adds one overtone"). Every number in the caption is in ladder-checks.txt: 110 → 330 → 550 Hz, fidelity 1.000000000000, and the detector going silent after a measurement. It walks move by move (ladder-checks.txt, the tour at the end). This is where the two ears come from, and the caption says so plainly.

### Anharmonicity through Potential Shaping

**proofs/well-morph-explorer.html — keep.** A test of line 76. The first strike lands on the harmonic series and the partials ride sharp as the quartic grows, with a cents table. It walks by its own slider, opening on the parabola. conform is clean.

**proofs/timbre-atlas.mp4 — keep, with a note.** It is closer to a survey than a test: five wells side by side on one ruler. It would come out differently only if an asymmetric or anharmonic well kept equal spacing, so it tests the section's claim weakly. The caption's "checked against the Morse well's exact levels" rests on `timbre_atlas.py`'s printed check, and no checks file is in the bundle. I did not re-run it.

**proofs/drum.mp4 — keep.** A test that disagrees with line 80. drum-checks.txt confirms 1 · 1.593 · 2.136 · 2.295 · 2.653, the square drum's ladder, and the repeat verdicts (the square box repeats 110 times a second, the round box never). The caption names the steward's tuning item 4. It walks through seven strikes.

### One equation, two spacings

**proofs/walls.mp4 — keep.** A test of line 84. Note: walls.py plays absolute levels (`walls.py:36`, the hard box's lowest level = A3). That is the clock's rule, and the only rule under which the hard-wall box sounds the squares (offer 3).

**proofs/stiffness.mp4 — keep.** A test of line 88. "One part in fifty million" is the page's own number, and the caption repeats it. I did not re-run it.

**proofs/pendulum-slider.html — keep.** A test you can play. pendulum-slider-checks.txt has the solver within 1.1 × 10⁻¹¹ of numpy, and ratios 1.00 · 1.97 · 2.89 · 3.78 at q = 32, as the page says. It opens at the bare ring and you deepen it by hand, so it walks. It plays gaps above the ground.

**proofs/round-trip.mp4 — keep.** A test of line 92. round-trip-checks.txt: worst miss 0.017 Hz, under the caption's 0.02, and a continuous seam.

### The Interactive Artifact

**proofs/instrument.html — keep, with a note.** It doesn't test this section, because the artifact the section remembers isn't in the bundle. The caption says exactly that and offers the steward's instrument as the nearest living version. It opens on every control at once, so it doesn't walk up. But it sits at the page's end, as the end of the page's whole walk, and instrument-checks.txt passes all five checks. conform's play-silent warning at 760 px is conform's click missing the start control. It played at 1130, per the maker. I did not check that by ear or by hand.

## Checks run, in the worktree

- `conform.mjs "Quantum Synthesizer"`: 4 pages, 0 errors, 1 warning (instrument.html, play-silent at 760 px). The two-ears piece is clean at both widths.
- `fingerprint.mjs`: every section with pieces is in step. Spinoza has no pieces.
- `untracked.mjs`: every file the face names is tracked.
- The maker's `two ears checks.mjs`, re-run: PASS, 6 checks. Its numbers match the commit.
- The rich face, served from the worktree on 8852/8853 and driven in headless Chromium: 13 figures, 13 proposal chips, nothing lost its place, console clean on load. After a click on the piece's play there were **two warnings at rich.js:184**: `Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('http://127.0.0.1:8853') does not match the recipient window's origin ('http://127.0.0.1:8852')`. At that moment two frames (pendulum-slider, instrument) were still `about:blank`: lazily loaded, below the fold, so they carry the page's own origin. `hushAll` → `tell` posts `rich:hush` to each with the piece origin as target, and Chrome logs a mismatch that `try/catch` can't catch. **This is the renderer's bug, not the piece's.** The fix belongs in rich.js: skip a frame that hasn't loaded. It goes in the round's report.
- Hush: I put the page and every frame into the hidden state top-down while the piece played. The play button returned to "play" (the context suspended, and `onstatechange` called `stopAll`). Sound starts only on a click: the `AudioContext` is made only inside `play()`.
- Step 5 driven headless: the table read no · yes · no · no, the same as the maker's.

## The offers, recomputed

My recompute (`ears.py`, scratchpad) shares no code with the piece. It uses analytic levels and shapes (Hermite functions; √(2/π) sin nx), a coherent state α = 2.2, a probe at x₀ = 1.0, the same box packet, 65,536 samples at 44.1 kHz, and a plain Blackman window.

| well · rule | partials (× 110 Hz) |
|---|---|
| oscillator · clock, Re ψ, levels from the floor | 1 · 3 · 5 · 7 · 9 · 11 |
| oscillator · detector, \|ψ\|², all gaps | 2 · 4 · 6 · 8 · 10 · 12 |
| oscillator · gaps counted up from the lowest | 2 · 4 · 6 · 8 · 10 (= 1 · 2 · 3 · 4 · 5 on 220) |
| box · clock | 1 · 4 · 9 · 16 · 25 · 36 · 49 |
| box · detector | 3 · 5 · 7 · 8 · 9 · 12 · 15 · 16 · 21 · 24 |
| box · gaps counted up from the lowest | 3 · 8 · 15 · 24 · 35 |

These hold at other probes and packets too (x₀ = 0.3 with α = 1.5, and x₀ = −1.7 with α = 3.0): the clock reads odd, the detector whole.

**Offer 1: confirmed, but narrower than it reads.** Read with the clock, from the floor, the levels are 1 : 3 : 5, not f₀, 2f₀, 3f₀. But the page never reads them that way for the oscillator. "Equally spaced in frequency", "the quantum of energy *is* a frequency", line 50, and every oscillator proof in the bundle (A/B, well-morph, pendulum) use the gaps. Under that rule the harmonic series is right. What line 48 gets wrong is its subject: "*These* [levels] are identical to the harmonic series" should be *their gaps*. Line 50 ("equally-spaced partials = harmonic tone color") holds under every reading, since 1 : 3 : 5 is still a harmonic, periodic tone, the odd harmonics. So the edit is a subject fix plus one clause, "read as pitches from the floor, they are the odd harmonics". The section's claim doesn't reverse.

**Offer 2: confirmed.** My ground state alone: |ψ₀(x₀, t)|² swings 1.1 × 10⁻¹⁵ of itself. The maker's figure is 4.7 × 10⁻¹⁵, and ladder-checks.txt has about 2 × 10⁻¹⁶. All of these are rounding. Offers 1 and 2 are **one finding**, and Loudon should see them together. Under the gap rule that makes line 48's harmonic-series sentence true, the ½ cancels from every gap and the ground state is no partial at all (well-morph's formula gives it 0 Hz). Under the clock rule that makes the no-silence sentence true, the levels are 1 : 3 : 5. Line 48 switches readings mid-paragraph, and under no single reading do both sentences stand. One caveat on the offer's wording: "the ½ is what makes the clock's series odd" is true only with energy counted from the well's floor.

**Offer 3: confirmed, and it reaches further than the maker said.** The box's squares need the clock. The gaps from the lowest are 3 · 8 · 15 · 24, and all gaps are 3 · 5 · 7 · 8 · 9 · 12. The section itself also uses both rules. Line 84's hard-wall squares are absolute levels (walls.py). Line 90's "fold back toward 1 · 2 · 3" counts gaps above the ground (`pendulum.py:101`), because the clock in a deep well would read toward 1 : 3 : 5. On a ring, and with free walls, the ground state's energy is zero, so the two rules agree there. That is why the round trip's seam meets exactly. Hard walls are the one place in the section where the rules part, and that is the sentence the offer names.

**Offer 4: confirmed by an independent recount** (`hermite_recount.py`, scratchpad, analytic shapes). Reading A gives one partial for every n. Reading B gives n + 1 lumps, but the partial count is the comb's: at n = 0, 6 / 12 / 22 partials (within 40 dB) on combs of 12 / 24 / 48, so it doubles when the comb doubles. That matches hermite-checks.txt's 12 to 20 on its 24-partial comb. Reading C gives 8 to 12 at L = 8 against hermite-checks.txt's 9 to 15 at its own L, so the window sets the count there too. "n + 1" survives only as lumps, or formants, in reading B. I did not re-run `hermite.py` itself, because it rewrites tracked media beside it.

**For the round's report, not a verdict.** The offers point at the steward's tuning item 1 (Hermite) but not at items 2, 3 and 4, though the ladder, wick and drum captions all name them. Either point at all four, so `proposals.mjs` shows Loudon every rewrite waiting, or at none.

## The face as a whole

The face makes the page's idea felt, not just busy. Twelve of the thirteen pieces are the steward's twenty cycles of proofs set beside the sentences they test, and most of them push back on those sentences with numbers you can hear. The face's real value is that the page's disagreements become audible in place: wick against "conjugate poles", hermite against "n + 1 partials", ladder against "adds one overtone", drum against "the circle". The one made piece is the sharpest thing on it. It turns a question nobody asks aloud ("which pitch do you mean, the level or the gap?") into a walk you can play. Its one gap is that it hears with two ears where the page hears with a third, and one round fixes that. What nobody has done is listen: no agent can hear the mix, and the instrument at the end still waits for Loudon's hands.
