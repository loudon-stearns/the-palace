---
title: "Three Kinds of Warp — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Three Kinds of Warp]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for the proposal round of Three Kinds of Warp's rich face: each piece judged with a reason, each offer recomputed where a script could settle it, so Loudon reads what holds before he decides what the page says."
---

# Three Kinds of Warp — rich — challenge

Challenger, 2026-11-03, against the maker's commit `5a334915` in the worktree `enrich/three-kinds-of-warp`. Judged from the page, the pieces' source and the commit body. Nothing was heard: an agent can't hear the mix.

## The pieces

### The 1D obstruction theorem

**`Three Kinds of Warp — rich — obstruction.html` — keep.**
1. *Test or decoration.* Half and half, and honest about it. In steps 1–4 the readout can't move. The piece bakes the warp into a new table, `composite()`, and then reads that table on an exact 256-sample lap, so it has to sit at zero. That is the proof's own mechanism, and the piece says so in its second equation: "the wrap comes first, so the warp can never see past the lap". A theorem can only be tested at its edges, and the piece does test both. Step 4 tests the scope: drawn warps that are not circle maps stay on the grid. Step 5 tests the hypothesis: a wobble whose cycle is not the lap leaves the grid, and a half-rate wobble lands exactly on the half-lines (the maker's check: 40.81 %, all of it on the half-lines).
2. *Faithful.* Yes. One note for the text, not for the piece. Step 3 lists "the warps the commercial synths offer" as bend, PD knee, sync, speed and fold. Serum's warp menu also has FM from B and AM from B, which take oscillator B as the modulator ([creativelive lesson](https://phoenix.creativelive.com/class/xfer-serum-synthesizer-sound-design-music-production-tomas-george/lessons/warp-menu), [MusicRadar](https://www.musicradar.com/how-to/how-to-get-more-out-of-xfer-records-serums-oscillators)). At a non-whole B : A ratio, FM from B breaks the period. So the page's "every commercial wavetable warp lives here" fails for exactly those menu items: they are type 2 inside a commercial warp menu. This is a new offer, below.
3. *Walks up.* Yes: one sine, then a table, then the named warps, then a drawn warp, then breaking the period. The step rail stays open.
Clean: conform 0/0, console clean. Sound starts only on a click and stops on a step change. It answers `rich:hush`.

**`/Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_penrose.png` — keep.** It is gathered, and it is the theorem inside the instrument. The caption's figure, "100 % of the energy on the knot's harmonics under every hand while locked", matches the steward's table (`2D Torus Wavetable Synthesizer — scroll.md`:818–824, entry torus-steward-019). The file is tracked and returns 206.

**`/Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_penrose.wav` — keep.** It is the sound of the figure above. The caption says plainly that nobody had listened to it (scroll:827, "I haven't listened to these").

### The typology

**`Three Kinds of Warp — rich — typology.html` — remake (one round, wording only).**
1. *Test or decoration.* It is a real test. Step 4 could have smeared and it didn't. I re-ran it with my own integrator (below): every line sits on the kept-speed lattice to 0.00015 Hz, where a random frequency misses that lattice by a median of 0.32–0.39 Hz.
2. *Faithful.* No, not yet. Step 4's text says "The lattice does not smear; its two generators move", and the caption says "the lines follow the amber". Both state offer 1 as fact. The page says type 3 "bends the lattice itself … onto curved manifolds". The piece disagrees with the text, which is an offer and not a reason to retire it. But unlike the piano piece, it never tells the reader that. **The fix:** step 4's text and the caption each gain one clause, "the page says the lattice bends; this step measures that it moves (the open offer on this section)". Also change step 2's "Every per-axis warp lives here" to "a per-axis warp at this ratio stays harmonic". By the page's own composition rule, type 1 ∘ type 2 = type 2, a per-axis warp at an irrational ratio belongs to step 3.
3. *Walks up.* Yes. One pace, then a whole-number ratio, then an irrational ratio with the sum and the surface set against each other, then coupling.
Clean: conform 0/0, console clean, plays on a click, answers hush.

### Where piano-style stretching lives

**`Three Kinds of Warp — rich — piano.html` — keep.**
1. *Test.* It reads the committed surface itself. Headless, the specnote reads "13_stiff_string.wav, as committed", not the fallback. It could have found lines off the harmonics, and it finds none.
2. *Faithful.* Its sub names the page's claim ("The section names … the Stiff String surface as type 2 at work"), and its caption points to the offer. That is the right way to disagree. One note on taste: step 3's "That is the theorem's type 1" borrows the offer's label. A surface row is not a warp. It is the theorem's base case, one 1D table. "Bound by the theorem, as any one-cycle table is" would be stricter.
3. *Walks up.* Yes: the stiff string alone, then one row, then the two side by side.
Clean: conform 0/0. Its one file is declared (`piece:files`) and tracked. Plucks only on a click.

### Cross-Domain Resonance

**`/Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/penrose_kuramoto_three_regimes.wav` — keep.** It is type 3 heard, under the Kuramoto bullet. The caption's "the same equations the typology walk runs" holds. The piece's header gives ψ = bφ₂ − aφ₁, the same as `Tools/kuramoto_scan.py`:15, and the steward says the codebox and the script share one Euler step per sample (scroll:837).

**`…/cycle-7/penrose_kuramoto_ramp.png` — keep.** K* = 0.80 Hz matches the steward (scroll:837, "locks at coupling 0.8 Hz with a 55.4 Hz fundamental") and the maker's 3 : 2 check (K* 0.800 Hz). 55.4 Hz is (110 + 167)/5, the piece's (f₁ + f₂)/(a + b). I did not check the 1.59 Hz ramp ceiling.

**`…/cycle-7/penrose_kuramoto_ramp.wav` — keep.** The caption says no one had listened to it.

## The checks I ran

- `node "Three Kinds of Warp/workshop/rich-checks.mjs"`: 24 PASS, 0 FAIL, every number as the commit states.
- `node _ops/rich-face/conform.mjs "Three Kinds of Warp"`: 3 pieces introduced, errors 0, warnings 0. The browser pass ran at 760 and 1130 px. The maker's three file-local warnings are gone now that the pieces are committed.
- `node _ops/rich-face/fingerprint.mjs "Three Kinds of Warp"`: all four sections in step.
- `node _ops/rich-face/untracked.mjs "Three Kinds of Warp"`: every file it names is tracked.
- Served the face with `rich-server.mjs --root <worktree>` and walked every piece to its last step in headless Chromium. Console: no errors or warnings. The only noise was three aborted media preloads, and each of those files returns 206 on its own. No missing-file boxes. Stopped the server afterwards.
- My own recomputes, numpy/scipy, kept in the session scratchpad (`challenge-tkw/offer1b.py`, `offer4_offer2.py`, `offer5.py`), not in the palace.

## The offers

1. **Type 3 moves the generators. Confirmed, and it holds more widely than the maker claimed.** My own setup: DOP853 integration (rtol 1e-11), a Blackman-Harris window over 2²⁰ samples, my own peak picker, ρ from the closed form. At 0.5, 0.9 and 0.98 K* (41, 98 and 203 lines below 400 Hz), the worst miss from m·ρ₁ + n·ρ₂ is 0.00015 Hz. Against the bare lattice, 97 of 98 and 195 of 203 lines miss. A coupling that is not Adler, with extra sin 2πφ₂ and cos 2πφ₁ terms, lands on its own measured-ρ lattice too, worst miss 0.00017 Hz. That is as it must be. A smooth autonomous flow on a two-torus cannot be chaotic, so below lock it is two-frequency quasi-periodic. So the offer holds for the page's general fᵢ, not only the project's Adler form. Two qualifications. The "square-root curve" is Adler's alone; other fᵢ move the generators along other curves. And the offer misses one consequence: § Why the typology matters sets "a constant-velocity scan … still lattice-bound" against type 3 as the way out, and at fixed coupling type 3 is lattice-bound too.
2. **Type 1 is narrower than the theorem. The finding is confirmed, but the suggested wording is disputed.** The finding follows from the proof itself: W∘g is just another 1D table. The 200 draws only illustrate it. The text already contradicts its own definition, because "sync-window kink" and "hand-drawn lookup" are not degree-1 circle maps. My numpy run puts the following at ≤ 3.4 × 10⁻¹⁶ off the grid: a mirror read, a sync at 3.4, a warp with a jump, a degree-2 bend, and 500 drawn warps spanning −3 to 3 laps. The suggested gloss, "the degree-1 circle maps are the continuous ones that keep the pitch", is wrong. A degree-0 continuous map keeps the pitch too: Serum's Mirror reads forward then back, measured on the grid. Better: "any function of the wrapped phase; the degree-1 maps are the ones that read the table once, in order, per cycle".
3. **(Not asked to recompute.) Partly right.** For oscillators with harmonics the offer is true. But the text says "two summed **sinusoids**". Two summed sines give two lines, and "beating" is the right word for them. The maker's check used three-harmonic oscillators, so the offer should narrow to "two summed harmonic-rich oscillators".
4. **Aliasing. The number is confirmed; the reading is sharpened.** At 880 Hz and 48 kHz, the phase step is 11/600, so the digital signal repeats every 600 samples, which is 11 laps. A rectangular window over whole periods gives the exact answer: **5.150 %** between the harmonics, matching the maker. At 110 Hz the exact figure is 0.0068 %. The maker's 0.013 % there is about half Hann-window leakage, since its sine floor is 0.0064 %. At 1000 Hz (48 samples per lap) the aliases fold onto the harmonics, 1.9 × 10⁻¹⁴ %. At 880 Hz they land on an 80 Hz grid, f₀/11. So aliasing doesn't escape the theorem. The sampled phase fails the theorem's period hypothesis, and that is all. The clause should say so: "a digital read whose sample rate is not a whole multiple of the pitch folds harmonics back between the slots, as error".
5. **Stiff String is not type 2. Confirmed.** `build_catalog.py`:212–235 is `stiff_string()`, and its own docstring says "keep every row single-cycle". I imported and ran the function itself rather than a re-port. It reproduces the committed file to 2.98 × 10⁻⁸. The worst row puts 6.3 × 10⁻¹⁶ of its energy outside the floor and ceiling harmonics of its 12 targets. The Y-constant share is 0.968, and |k_y| ≤ 8 holds 0.998. So even a Y read at audio rate would make only weak cross terms, close to the X harmonics. The surface's own page says to sweep Y slowly (`13 — Stiff String.md`, § Musical use). A label note: "type 1" is loose, since the surface isn't a warp. It is a family of one-cycle tables, bound by the theorem. A side find for the 2D Torus steward: that page's "f_n = round(…)" and "row 63" are stale against the code, which crossfades across 1024 rows.
6. **Type 3 approximates the piano as type 2 does.** I accept the reasoning: it follows from offer 1. The piano's partials generically span more than two rational directions, so no two-generator lattice holds them exactly. It is unmeasured, as the maker says.

**A new offer from the challenge (The 1D obstruction theorem, claim-change).** "Every commercial wavetable warp lives here" and "no commercial wavetable synth … can escape the harmonic series" fail for the cross-oscillator warps. Serum's FM from B and AM from B are in its warp menu, and at a non-whole ratio they break the period. Suggest: "every warp that reads one oscillator's own phase; the menu items that take a second oscillator as their source are type 2." This comes from public descriptions of Serum's menu. Nothing was measured in the palace.

## The face as a whole

The page's idea is felt, not just busy. Each section gets one walk, and each walk ends where the section's claim can fail. The gathered renders put the same fact in the instrument's own voice beside the made pieces. The best thing here is what the making found. Offers 1, 2, 4 and 5 are real, and they reach past wording: if type 3 at fixed coupling is still a two-generator lattice, the page's piano section and its "why it matters" section both overstate type 3 as the way off the lattice. That is the conversation Loudon should have with this page. The face's weakness is a sketch-tier one, and it is mostly settled by the remake above: in places the pieces speak the offers as if they were the page.
