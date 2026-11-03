---
title: "Flocking — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Flocking]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of Flocking's first rich face: every piece judged with a reason, every offer recomputed on more starts than the maker's four, so the remake knows exactly what to change and Loudon knows which findings stand."
---

# Flocking — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03. Judged from Flocking.md, the manifest, the two made pieces, the gathered pieces, and the maker's commit body (1ce788e5). **4 keep, 2 remake, 0 retire.**

## Checks run

- `node "Flocking/Flocking — rich — check.mjs"`: all hold. Both made pieces carry one math block; both differ from the Plot lens's shared model by **0** over 1200 frames at four weight sets. The D3, p5, Cobalt, Graphite and Strobe lenses carry the same constants (seed 7, N 80, 960 × 540, reach 50, speed 3, force 0.05), so "the three lenses' code" holds.
- `conform.mjs "Flocking"`: 9 pages, 0 errors, 0 warnings, browser pass at 760 and 1130 px. `fingerprint.mjs "Flocking"`: the three made sections in step.
- Face served and driven headless (Playwright, 1060 and 1430 px windows): 9 piece frames load, 6 proposal chips, no 4xx. Every step of both made pieces was walked; their readouts fill. The only console lines are p5's own accelerometer permission-policy messages from the two p5 lenses, one of them the gathered Strobe. The made pieces log nothing. Both are silent, so no sound waits on a click and there is nothing to hush. Every file they need is inline. Nothing licensed is copied.
- My own recompute: `scratchpad/flk/job.mjs`, run on the pieces' own math block with **12 starts** (seeds 7 to 47), plus a no-rules control, heading noise, a speed floor and longer settling.

## The pieces

### The Three Rules as Coordination Primitives — `Flocking — rich — three rules.html` — remake

1. **Test or decoration?** A test. Each of the section's three sentences could have failed, and some did.
2. **Faithful?** Not in one verdict. The cohesion verdict, "not in this model", ignores the piece's own control. At the bundle's 50 px reach, 12 starts at 60 s: all three rules leave 30–50 birds alone (mean 39); **no cohesion leaves 76–80 alone (mean 79), all 80 by four minutes.** Taking cohesion away doubles the birds alone, and that is the scatter the page names. What the maker really found is that the control is poor: with **no rules at all** the birds alone are 17–33 (mean 23), so the bundle's defaults spread birds thinner than no flocking does.
   At 25 px with no noise, no cohesion holds as one sheet, but nothing could disperse it there. Aligned birds with no noise keep their spacing for good. Reynolds says so: "With velocity matching, separations between boids remains approximately invariant" (Reynolds 1987, p. 28). Give the headings a twist (η 0.04, 25 px, 12 starts, three to six minutes) and the page's line holds: no cohesion gives 3–15 alone, 11–30 groups and a largest group of about 27; all three give 0–3 alone, 1–6 groups and a largest group of about 64. At η 0.02 the effect is the same but weaker: 0–3 alone and 1–10 groups, against 0–1 and 1–4.
   The "one even sheet that covers the field" doesn't cover it: its unwrapped extent is about 340–560 × 280–590 px of the 960 × 540 field.
3. **Walks up?** Yes. Each rule alone on twelve birds, then the three summed, then the test.

**The test as a design.** It has one control, all three rules at the same reach and seeds, and the cohesion verdict doesn't read against it. It has no floor control (no rules), so "alone" and the circling index have nothing to be read against. That matters for the circling index too: birds with no rules score 0.16–0.37 by chance, so "at most 0.12" means nearly still, not "not circling". And it has no perturbation, so in the noiseless case dispersal can't happen by construction. Of the three, that is the one gap that decides a verdict.

**Remake, exactly:**
- (a) Add a "no rules" row to the step 5 table, and an η switch (0 / 0.04).
- (b) Re-word the cohesion mark: holds against the control at 50 px (39 → 79 alone) and whenever the birds are jostled (η 0.04 at 25 px); not in a noiseless flock at 25 px, where aligned birds keep their spacing.
- (c) In the alignment mark, give the circling index's chance level, and say a floor on speed is what "mill" needs (below).
- (d) Fix "covers the field".
- (e) Update the caption to match.

### The Kuramoto Tie — `Flocking — rich — the threshold.html` — remake (wording only)

1. **Test or decoration?** A test. The noiseless search could have found a threshold. Every number comes back on 12 starts (below).
2. **Faithful?** One claim the page doesn't make, and it is inexact. Step 4 and the caption call the heading twist "the flock's version of Kuramoto's spread of natural speeds". A spread of natural speeds is fixed for each oscillator; this twist is fresh noise every frame. Kuramoto's own family has the right twin. Identical oscillators with noise of strength D also have a threshold, K_c = 2D (Sakaguchi 1988; Strogatz 2000). So the twist plays the part the spread plays; it is not the spread.
3. **Walks up?** Yes: a heading as a phase, then R and its floor, then coupling with no noise, then the test.

**Remake, exactly:** in step 4's heading and text, and in the caption, replace "the flock's spread of natural speeds" with something like "noise, which gives alignment something to overcome, as noise does for Kuramoto's identical oscillators (K_c = 2D)". Optional: say that density and reach act as one knob (below), and put "about" on the crossings.

### The Kuramoto Tie — `Projects/Murmuration/Murmuration — rich — the knee.html` (gathered) — keep

It tests "a non-equilibrium phase transition" with the transition's own marks. Its caption is honest: 30–240 birds, a continuous-looking knee, no memory established, order left to the literature.

It is also the same transition the threshold piece finds. Murmuration's flock is the same Reynolds-plus-noise arithmetic: reach 56, 60 birds on 920 × 520, noise ±η·π. Swept in η at alignment 1, the bundle's own model crosses R 0.5 at **η 0.066** (80 birds, 12 starts; 0.065 settled two minutes). On Murmuration's settings it crosses at 0.068, and the wobble peaks at η 0.07. Murmuration's knee puts φ halfway at 0.06–0.07. At η 0.04 the bundle's model gives R 0.81 at alignment 1; Murmuration's reference gives 0.822.

So the two faces agree. In this model "the Vicsek transition" is one critical line in the plane of noise and alignment. Murmuration crosses it along η at alignment 1; the threshold piece crosses it along alignment at fixed η. The line runs alignment 0.07–0.08 at η 0.01, 0.15 at 0.02, 0.39 at 0.04, and 1.0 at about 0.066.

Note: one sentence in the caption saying so would tie the two pieces together.

### Artifacts — gathered house-dress lenses — keep ×3

- **`flocking-d3-interactive-cobalt.html` — keep.** It is the artifact the bullet names, and rendering in today's dress tests the update-safe claim. The design stylesheet and tokens load in the piece frame with no 4xx. Note: "with no edit" is not quite true. 036f9a27 (2026-10-21) pinned its CDN tag, so say "with no edit to its dress". Its caption's "R cut at 0.35 and 0.75" is right (line 147).
- **`flocking-observable-plot-graphite.html` — keep.** Its caption's "how fast order arrives" is confirmed below.
- **`flocking-p5-expressive-strobe.html` — keep.** The hue-as-heading deviation is declared, as the text says. Its p5 logs the accelerometer policy messages, which is harmless.

## The offers

1. **Kuramoto Tie, claim-change — confirmed, with two refinements.**
   - **No noise.** Alignment 0.3 reached R 0.8 in 10–26 s in 12/12 starts, and 0.1 in 30–233 s in 12/12. At 0.05, 12/12 got there within 10 minutes, at 167–499 s. At 0.02, 0/12 got there in 10 minutes (R 0.04–0.29). The time grows so steeply that no finite run can tell "only a rate" from a threshold below 0.05; say "none down to 0.05".
   - **With noise, 12 starts, settled one minute, measured one** (maker's numbers in brackets).
     - η 0.01, 0.02, 0.04: crossings 0.083, 0.145, 0.393 (0.08, 0.16, 0.38).
     - 40, 80, 160 birds: 0.77, 0.39, 0.136 (0.81, 0.38, 0.14).
     - Reach 35, 50, 75 px: 0.66, 0.39, 0.125 (0.65, 0.38, 0.13).
     - Settling five minutes instead of one: 0.406 at η 0.04 (settled) and 0.070 at η 0.01 (not quite settled).
   - **First refinement: density and reach are one knob.** Equal neighbours in reach give equal crossings: 160 birds at 50 px give 0.136, 80 at 75 px give 0.125; 40 at 50 px give 0.77, 80 at 35 px give 0.66.
   - **Second refinement: re-word "the noise standing where Kuramoto's spread of natural frequencies stood".** Noise stands where Kuramoto's noise stands, and that also makes a threshold.
   - **Is the page wrong?** It is not wrong; it is incomplete. Vicsek's own framing (1995) is noise and density, with the radius as the unit of length. The page kept the density half and dropped the main axis.
2. **Kuramoto Tie, no-claim-edit — confirmed.** Over 200,000 deals, the mean R of 80 random headings is 0.0992, against √(π/4N) = 0.0991. The ~1/√N = 0.112 in the challenge brief is the root-mean-square, which I measured at 0.1117, not the mean. The piece's 0.099 and its formula are right.
3. **Shop's Interest, claim-change — confirmed.** 0.579 at 900 frames. 12/12 starts at alignment 0.3 pass 0.8 in 10–26 s; seed 7 reaches 0.917 at four minutes.
4. **Shop's Interest, no-claim-edit — confirmed, amend.** The lenses already label the middle band "milling / partial flow" (flocking-d3-interactive-control.html:220, cobalt :147); only the page's text says "milling". The offer becomes: make the text match the label, or say it reads bands of R.
5. **Three Rules, cohesion, claim-change — disputed.** The page's line holds on the bundle's model against its control: 39 → 79 alone at 50 px, and with noise at 25 px. Re-aim the offer at the model, not the sentence. The finding that stands: separation reaching the whole 50 px spreads the defaults' birds thinner than no rules at all (39 vs 23 alone). The model change (25 px) is the offer.
6. **Three Rules, alignment, claim-change — partly confirmed.** Coasting is confirmed: 0.068–0.076 px a frame at 50 px and 0.25–0.30 at 25 px, over 12 starts. But Reynolds' own default has no floor either: "A minimum speed can also be specified but defaults to zero" (Reynolds 1987, p. 27). With a floor of 1.5 the birds keep moving and wander with no direction (R 0.02–0.38, mean 0.2; the circling index 0.20, against 0.29 for birds with no rules). That is "mill" in the everyday sense, so the page's word holds once birds can't stop. The offer is the model's (a floor), not the page's.
7. **Three Rules, minimal set, claim-change — confirmed, sharpened.** With no noise, alignment alone gives R 0.996–1 at 60 s, and one group of 80 by four minutes, in 12/12. At η 0.04, alignment alone keeps the flow (R 0.84–0.94) but loses the body (3–11 alone, 10–25 groups, largest about 27, against about 64 with all three). That supports the offer's wording: "alignment is enough for flow; separation and cohesion make the body".

## The face as a whole

The face makes the page's idea felt rather than busy. Two made pieces put the page's two load-bearing claims, the three rules and the Kuramoto tie, to the bundle's own flock. Each walks up from one idea, and each found something real. The threshold piece and Murmuration's knee turn out to be two cuts through one critical line, so the gathered knee earns its place.

The weak spot is the one the page itself is about. "Take one rule away" was run in a world with nothing to jostle the birds, and its cohesion verdict was read without its control, so it reports the page wrong where the page holds. With a no-rules row and a noise switch, the piece would test the section rather than the model's defaults. Its best finding would then come out clean: the shared model's separation reach, not the page's sentence, is what scatters the flock.
