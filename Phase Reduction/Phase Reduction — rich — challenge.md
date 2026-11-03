---
title: "Phase Reduction — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Phase Reduction]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Phase Reduction's first rich face: each piece judged on whether it tests the text, stays faithful to it and walks up to its test, and every measured claim and offer recomputed by a method that shares no code with the pieces."
---

# Phase Reduction — rich — challenge

Proposal round 2026-11, challenger · claude-opus-5-5. Judged from the page (`Phase Reduction.md`, unchanged), the manifest, the four pieces and the maker's commit body (548aabfe). Every number below marked "recomputed" comes from my own scripts (Python, scipy DOP853 at rtol 1e-12 to 1e-13, or a batched numpy RK4), written without reading the pieces' engines into them.

## The checks

- `conform.mjs "Phase Reduction"`: 4 pages, introduced 4, errors 0, warnings 0, browser pass at 760 and 1130 px. (The maker's three file-local warnings are gone; the pieces are tracked.)
- `fingerprint.mjs "Phase Reduction"`: The three steps of the bridge `0d712b5f3ceb`, 3 pieces, in step; Cross-Domain Resonance `861b404d5483`, 1 piece, in step.
- The maker's `Phase Reduction — rich — check.mjs`, re-run: ALL PASS, 97 lines. It covers every engine's selfTest, no AudioContext before a click, one step showing, sound on the first button, silence on leaving a step, hidden tab stops the sound and showing it again does not restart it, no page errors.
- The face in `rich-server --root <worktree>` at `?entry=Phase Reduction`, headless Chromium, 12 s: four `proposal ·` chips, four frames, nothing in *Lost its place*, no drift notice, console empty (no messages, no page errors, no failed requests).
- Nothing licensed: no Splice material; all sound is synthesised in the page. Every file the face needs is tracked (the three pieces, the manifest, and the gathered proof).

## The pieces

### The kick that stays — **keep**

1. **Test or decoration?** A test. The page says the PRC "is derived from the left eigenvector of the monodromy at multiplier 1". The piece computes that eigenvector with no kicking, then kicks the loop at 16 phases and measures. If the PRC were something else, the gap would not close as the kick shrinks. It closes, about tenfold for each tenfold smaller kick.
2. **Faithful?** Yes. The equations on the page are right: Z·M = Z, normalised so Z·F = 2π/T, and λ_across = exp(∮ μ(1 − x²) dt). The caption marks the stereo-lead reading as unchecked, which is honest.
3. **Walks up?** Yes. It goes one kick (across dies, along stays), then the curve built by hand, then the loop's shape setting the curve, then the test. Each step is playable and has one thing to hear.

**Recomputed, by the adjoint method.** I integrated Z′ = −Jᵀ Z backward along the van der Pol cycle, 30 to 40 periods, renormalising each pass. I scaled the result so Z·F = ω; Z·F held constant along the loop to 5e-13. I then measured the kicked curve with my own crossing events, 8 trips, at the same 16 phases. The largest gap, as a share of the curve's height, for kicks of 0.1, 0.01 and 0.001:

| loop | recomputed (adjoint) | the piece (monodromy eigenvector) |
|---|---|---|
| μ 0.3 | 3.384% · 0.331% · 0.0331% | 3.388% · 0.331% · 0.033% |
| μ 1 | 4.529% · 0.440% · 0.0439% | 4.531% · 0.440% · 0.044% |
| μ 3 | 5.238% · 0.499% · 0.0497% | 5.242% · 0.499% · 0.050% |

So the adjoint PRC, the piece's eigenvector and the kicked curve agree, and the gap is first order in the kick. The maker's 0.033–0.050% at a kick of 0.001 is confirmed. The Liouville multipliers also agree: 1.4865e-1 at μ 0.3 and 8.5970e-4 at μ 1, against the piece's 1.487e-1 and 8.597e-4.

### The shadow beside the pair — **keep**

1. **Test or decoration?** A test, and the sharpest on the face. It measures the full pair's locking edge by bisection and sets it against the shadow's edge. "Holds only as coupling goes to zero" could have failed here.
2. **Faithful?** Yes. The page's three numbers hold (below). One note for the maker, not a remake. The caption's 1.34× at ε 0.4 is the page's two-sided mean. The selfTest prints the fast side only (1.310×). Both are honest, but a reader comparing check output to caption will see two numbers. Saying "both sides, averaged" in the caption would close that.
3. **Walks up?** Yes. It goes phase as time, then two phases sliding, then the pull built from the PRC, then pair and shadow side by side, then the test.

**Recomputed.** The shadow's edge comes from my adjoint PRC: Γ(ψ) = ⟨Z_y(t)·(x(t+ψ/ω) − x(t))⟩, edge = ε·max[Γ(ψ) − Γ(−ψ)]/ω. The pair's edge comes from a batched scan of detunings, refined three times, with the same run lengths (40/ε trips, 300 to 2000). Lock is judged by the unwrapped angle difference over the last 40% of the run. Pair ÷ shadow:

| | ε 0.02 | ε 0.05 | ε 0.1 | ε 0.4 |
|---|---|---|---|---|
| μ 1, fast side | 1.004× | 1.017× | 1.058× | 1.311× |
| μ 1, slow side | | | 1.056× | 1.369× |
| μ 1, both sides averaged | | | 1.057× | **1.340×** |
| μ 0.3, fast side | 1.260× | 1.808× | | |
| μ 0.3, slow side | | 1.821× | | |

Doubling the run length moved nothing that matters: μ 1 ε 0.4 stayed 1.311×, and μ 0.3 ε 0.05 went to 1.799×. The drawing ÷ speeding share came out at 0.036 (μ 0.3) and 0.091 (μ 1), against the piece's 0.037 and 0.091. The page's three numbers are confirmed: the ranges match within 6% up to ε 0.1, have parted by 0.4, and at μ 0.3 the shadow misses by 1.8× at ε 0.05. My μ 0.3 figure at ε 0.02, 1.26×, agrees with the maker's 1.24×. It also means the shadow already misses there, so the page's "even at 0.05" understates. That is no error.

The step-4 Try line ("ε 0.4 and δ 9%: the pair still locks, the shadow says it drifts") holds: the shadow's edge is 0.081 and the pair's 0.106 to 0.110.

### The shadow that locks (gathered, Dissolutions proof) — **keep**

1. **Test or decoration?** A test in its own right. It draws the PRC two ways and fills a tongue cell by cell. On this page it is also the end that both walks climb to, which is what [[Progressive Staging]] asks: the existing proof stays as it is and the walk's last step points to it.
2. **Faithful?** Yes, and the caption is honest about its limit. I read its grid in the source: `GD = 21, GE = 11` over detuning −0.1 to 0.1 and coupling 0 to 0.5. That puts detunings 0.01 apart and couplings 0.05 apart, with 60-trip runs. At μ 0.3 and ε 0.05 the shadow's edge (0.0037) and the pair's (0.0067) both fall before the first point off centre, so the tongue cannot show the miss. The caption says so.
3. **Walks up?** It is a gathered record and carries a `contract` block. It is not held to the walk rule; the made walks carry that duty for it.

### Two clocks on one beam — **keep**

1. **Test or decoration?** A test, and one that found something. It builds the shadow from one clock's Floquet PRC and the push the beam carries, Γ = ⟨Z·p⟩, and checks it against the full clocks from four starts. It then splits the page's sentence by holding one factor and moving the other.
2. **Faithful?** It reproduces what the page says (antiphase on a damped beam) and shows where the page's next sentence is incomplete. Per the brief, that disagreement is an offer, and the maker filed it as one rather than bending the piece. The caption says plainly that this is a smooth-escapement model, not Huygens's clocks, and that the time scale is chosen for listening. The "about 140°" gap is labelled as one the page does not name.
3. **Walks up?** Yes. It goes one clock settling, then two on a stone wall sliding, then two on a damped beam settling, then the test.

**Recomputed.** I re-ran the same model equations independently (scipy DOP853, rtol 1e-10, max step 0.01 s, 240 s runs, the same four starts). The shadow uses my own adjoint PRC of one clock and a beam push found by integrating the beam to periodic steady state in time, where the piece used harmonics. Escapement held at e 8:

- **Damped beam (c 20, k 0):** shadow 180.0°; clocks −180, 180, −180, −180. That is antiphase; the maker reported 180°.
- **Free board (c 0.5, k 0):** shadow 0.0°; clocks 0, 0, 0, 0. That is in phase; the maker reported 0°.
- **Springy shelf (c 0.5, k = 4ω²):** shadow +140.0°, −140.0° and 0°; clocks 0.0, 141.8, 141.8, −141.8. The maker reported ±140° and 0°, with the same 1.8° offset between shadow and clocks.

Free board held, escapement softened to 0.6: shadow 180.0°, matching the maker. The clocks settle at 0.0°, −180, −180, −180, which also matches: the first start holds in phase, and the shadow misses it. With the escapement back at e 8 on the free board the shadow is at 0°, matching.

Step 3 (damped beam, 0.3% mistuned, started 0.2 rad apart): the clocks lock at −167.3° and the shadow sits at −168.6°. The beam's sway over the last ten seconds is 10.2% of the first ten's. The settled swing is 0.1002 rad. All match the caption.

## The offers

**1 · Cross-Domain Resonance, claim-change — confirmed: the sentence is incomplete, not wrong.** In the model the gap is set by Γ = ⟨Z·p⟩, and both factors move it. With the escapement fixed, the beam alone takes the gap through 180°, 0° and ±140°. With the board fixed, the escapement alone takes the shadow's gap from 0° to 180°. So the PRC is one of two setters, not idle, and "the PRC … is what sets the locked phase difference" over-credits it.

The history agrees in direction. Oliveira and Melo (Sci. Rep. 5, 11548, 2015) put the coupling in sound pulses through the shared support, each clock sending a perturbation to the other at one point of its cycle. Antiphase is where those perturbations cancel, so their account needs both the coupling medium and where in the cycle the perturbation lands. Bennett, Schatz, Rockwood and Wiesenfeld (Proc. R. Soc. A 458, 563, 2002) tie the outcome to the beam's mass, and so to the coupling strength. Goldsztein, Nadeau and Strogatz (Chaos 31, 023109, 2021) give explicit parameter regimes where in-phase, antiphase or both are stable. Pantaleone's metronomes on a freely rolling board lock in phase, and antiphase appears only when the platform is damped. That is the piece's free board and damped beam exactly.

I read the 2002 and 2015 papers through secondary accounts (press releases, the 2021 review), not their full text. The maker's suggested wording is sound. My one note: keep "on Huygens's beam" as the condition for antiphase, since the model shows it is the beam's damping, not the clocks, that chose it.

**2 · The three steps of the bridge, claim-change — confirmed.** The phase-reduced coupling function is H(ψ) = ⟨Z(θ)·p(θ, θ+ψ)⟩. The PRC is one factor; the form of the push is the other. For one fixed way of coupling (x-difference into y, the proof's), the PRC alone decides, and the van der Pol walks agree with the page. Under a beam, the clocks piece shows otherwise. The suggested wording is correct but reads heavily. A lighter version Loudon might prefer: "is set by the PRC together with the form of the coupling, and for a given coupling, by the limit cycle's Floquet structure."

**3 · The three steps of the bridge, no-claim-edit — confirmed.** The proof's grid is 0.01 in detuning (source: `GD = 21` over −0.1 to 0.1; 0.05 in coupling, `GE = 11` over 0 to 0.5). The μ 0.3 edges at ε 0.05 are 0.0037 (shadow) and 0.0067 (pair); recomputed, 0.00369 and 0.00664 to 0.00672. Both fall short of the first grid point off centre, so the gathered tongue cannot show the miss.

The page's μ 1 "cell for cell" is true as written: at ε 0.1 the grid point 0.02 sits just inside both edges (0.0202 and 0.0213). So this is a sharpening, not a correction, and correctly filed as no-claim-edit. "Within 6% of the full pair's measured range" matches the recompute (5.8% at ε 0.1, both sides).

## The face as a whole

It makes the idea felt rather than busy. The page's claim is that a derivation, not an analogy, joins Floquet to Kuramoto. Each made piece takes one link of that derivation and lets it fail if it would:

- the kick shows the PRC is the Floquet eigenvector, exactly, in the limit;
- the shadow shows Kuramoto is the pair's shadow only as coupling goes to zero, measured as how wide each locks;
- the clocks show what the shadow's coupling is made of, and in doing so find the page's one sentence that over-reaches.

Three walks of four or five steps, plus a 1700 px proof, is a lot of face for one section. But each walk opens on a single idea, and the proof is gathered, not duplicated. The face's strongest thing is that its two claim-changes came out of pieces built to test, not from reading. What it cannot yet claim is that it was heard: nobody has listened to the stereo leads or the tick-tock flam, and that is the part Loudon must judge.
