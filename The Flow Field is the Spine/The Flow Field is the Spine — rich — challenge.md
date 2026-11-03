---
title: "The Flow Field is the Spine — rich — challenge"
born: 2026-11-03
links:
  - target: "[[The Flow Field is the Spine]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for this page's proposed rich face: a verdict and a reason for every piece, the numbers I recomputed from both sessions' own files, and which offers hold, so Loudon can approve, revise or drop them knowing what was checked."
---

# The Flow Field is the Spine — rich — challenge

Challenger, 2026-11-03, against the maker's commit d0b25c0d. I judged from the page, the pieces, both sessions' `field.py` and `flow-field.json`, the legs' code, and the maker's commit body. I recomputed every number below in Python of my own, not with the pieces' engine, unless I say otherwise.

## Pieces

**one field, three legs** (made, The bet): **remake**, two one-line text fixes.
1. *Test or decoration:* a test. It rebuilds Session 3's field (to 5e-6), hangs the three legs off it, then locks their numbers together and looks for one that serves all three. If the legs' numbers had sat close together, the readout would have said so. The test is weak, and the piece says why itself: the three ticks are arbitrary clocks (a streak step, a video frame, a 60 fps frame). Still, it is honest about it.
2. *Faithful:* mostly. It frames the strong claim the way the page does ("the untouched field is enough: no per-leg number at all") and ends where the page ends: strong claim falsified, likely-true claim holds. Two errors in its words:
   - Step 6's equation note says the numbers are "in widths of the frame." They are in frame heights (domain units, with y in [0,1]). In frame widths they would be 0.0038, 0.0246 and 0.0022. The ratios are the same either way. The same slip is in `S3_CHOSEN`'s comment ("domain widths"), in checks.mjs's printout, and in offer 1.
   - The verdict says the steers leg's "whirls land mirrored top to bottom." The hue picture is an exact top-to-bottom mirror. The motion it encodes is not: `steers_motion.py` mirrors the rows but keeps the upright sign of vy, so each vortex comes out as a saddle. At the four vortex centres the field's curl is ±0.34 to ±0.39; the steers motion's curl there is 0.004 or less. Say: "the picture lands mirrored, and the motion it carries loses its whirls: each vortex becomes a saddle."
   - A smaller one, not needing a fix: the drawn leg steps along the unit direction, so its 0.006 is not "per unit of field speed." Step 4's equation shows this correctly.
3. *Walks up:* yes. One arrow, one vortex, the whole field, one leg, three legs, then the test, last.

**Session 3 contact sheet** (gathered, The bet): **keep**. It is the evidence the page cites, it is tracked, and the caption's correction checks out (0.0021 against 0.105). A note: "its whirls sit mirrored" is true of the hue panel. In the warped-noise frames the vortices act as saddles. The caption could say that if the piece above is fixed.

**Session 4 contact sheet** (gathered, Session 4): **keep**. Cited evidence, tracked. Its pointer ("they run straight at the body") is hard to see at face scale, because the source panel's streamlines are dim. It is true of the field, though: the wall flux below says so.

**around a body** (made, Session 4): **remake**, one line.
1. *Test or decoration:* a strong test. The toggle "as Session 4 wrote it" against "kept on faces" rebuilds Session 4's own flow-field.json and measures where the air meets the body. It could have come out tangent, and it doesn't.
2. *Faithful:* one error. Step 3 says "The page calls this the honest limit: the wake is authored, not shed." The page says the opposite: "shed a counter-rotating wake." It is Session 4's report (§ Honest limits) that calls the wake placed by hand. Fix: "Session 4's report names this its honest limit: placed by hand, not shed. The page says 'shed'." The step-6 verdict is careful: it ends on "the coupling can be a stage in the field's author alone, as the page says, once the solve keeps its own assumption." That holds the page's larger claim rather than knocking it down. Good.
3. *Walks up:* yes. Wind and a stone, the solve, the wake, the figure, the legs, then the test, last.

The dust numbers (17.4% of the dust inside the body as written, 0.03% on faces) come from the maker's own arrows-only leg. Its settings (step k, 0.3% respawn, 1,500 steps) are the maker's, not Session 4's. They reproduce, but they belong to that constructed leg. The wall flux is the robust measure.

**M3.7 filmstrip** (gathered, render-noise retired): **keep**, with one caption edit. 0.858 against 0.809 is right (m3.7-verdict.json, adjacent embed_cos_mean 0.8578 against 0.8089). "The warped row wanders sooner, at s3" is not supported: both rows break at s3. Drift from s0 at s3 is 0.707 for seed-lock and 0.704 for warped, and by eye seed-lock's figure also changes at s3. Drop "sooner."

## Checks run

- `conform.mjs "The Flow Field is the Spine"`: 2 pieces introduced, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `fingerprint.mjs`: all three stamped sections are in step (737d7224ba46, f06a73f27ded, a003fbc939a5).
- The maker's checks.mjs: all pass.
- I served the face (rich-server on 8850/8851) and drove it in headless Chromium at 1130 px. The face framed both pieces. I walked each piece through all six steps and flipped the step-6 toggles. Console clean, no page errors. Both pieces are silent.
- All three gathered files are tracked in git. Nothing licensed is copied.

## Offers

**1 (The bet, claim-change): numbers confirmed, claim-change disputed.**
- *Numbers:* drawn 0.00600 (STEP, drawn_speedlines.py), steers 0.03877 (18/mag_max px on a 380 px panel, steers_motion.py), sim 0.00352 (0.22 × 0.016, particles.html). The spread is ×11.01; covering all three takes ×3.32 either way; at most 2 of 3 fit within ×2.
- *Unit:* all three are in frame heights, not "frame widths."
- *What the page claims:* the strong claim is that one untouched field serves all three legs with no per-leg transfer. The page already says that claim is falsified, and that "the per-leg work is a scalar." "One field, with each leg's own scalar" is the page's likely-true claim, and the page says it holds.
- *So:* offer 1 agrees with the page and adds a number. It changes no claim. The ×11 measures arbitrary per-leg clocks, so "the scalar is not slack" overreads it, and it sits uneasily beside the page's "the residual cost is small." At most a small edit that shows the number.

**2 (Why it's a spine, claim-change): finding confirmed, and it is about Session 3's code.**
- *The mismatch:* `steers_motion.py` zooms the array without flipping rows. `field.py` stores y-up (the preview's streamplot is y-up), and `drawn_speedlines.py` flips with (1−y)·H.
- *Numbers:* the render matches the rows-from-top reading at 0.0021 mean difference and the upright field at 0.1049. The arrows differ by 18.2° speed-weighted (19.9° unweighted).
- *Sharper than offered:* the motion the leg carries is not a mirrored whirl. Each vortex becomes a saddle (see the piece above).
- *Where it lands:* the page's spike paragraph already names "a seeding/format choice" as part of the per-leg transfer, so that sentence is not wrong. The field stayed untouched, as the page says. What the finding hits is the cited contact sheet and Session 3's report line ("the vortices sit in the same places"). On the page it earns a caveat on "automatically" in § Why it's a spine. It does not earn a claim change.
- *Stakes:* the noise-warp half of this leg was retired at M3.7, which lowers them.
- *Verdict:* auditing the session through the page; a note, not a claim change.

**3 (Session 4, claim-change): confirmed. Here the page sentence is wrong.**
- *Reproduced:* I ran field.py's own code (scipy spsolve) on the JSON mask. It reproduces flow-field.json to 5.0e-6, mag_max 22.4252.
- *Into the body* (+ = into, × the wind):

  | | windward | lee | above | below | mean into |
  |---|---|---|---|---|---|
  | as written | +4.241 | −9.675 | −2.653 | −3.752 | 2.487 |
  | zeroed only | 0.935 | −0.893 | | | 0.318 |

- *Divergence* by central differences rises from 0.0075 to 0.1072. field.py prints these two numbers itself (line 193).
- *My own face-centred (MAC) solve, same matrix:* 0.054 windward, −0.057 lee, fastest 4.970, face divergence 1e-13.
- *Discretisation:* field.py is collocated. Divergence and gradient use 2-cell central differences (lines 143–157, 189–190); the Laplacian is the compact 5-point stencil (168–181). The mask is applied three ways:
  - velocity is zeroed in the body before the solve (140–141) and after it (189–190);
  - the matrix is Neumann at the body, made by dropping solid neighbours (177–178);
  - p is left at 0 inside the body (186) and fed to the gradient anyway.
- *The cause, split:*
  - I extended p into the body so it agrees with the matrix's Neumann rule, kept central differences, and got 0.70 windward, −0.69 lee, fastest 4.80, divergence 0.0063. So the p = 0 gradient is what drives air into the body and makes the 22× spikes.
  - The collocated layout alone, even fixed, is still not tangent (0.70×, against 0.94× for zeroing alone). Keeping the solve on faces is what gets to 0.05×.
- *Wake:* placed by hand (field.py 113–121), and Session 4's report says so.
- *Page sentences:*
  - "bends the field tangent to it" is wrong as a report of what was built.
  - "shed a counter-rotating wake" is wrong.
  - "adds a stage to the field author, not to each leg" is half true. Each leg reads the mask (flowlib.in_body, dust_sim.is_solid), though the mask ships inside flow-field.json.
  - "the spine's shared-source claim survives the obstacle" holds.
- *Verdict:* the page inherited Session 4's report, so this is a finding about the page as well as the code.
- *Recipe:* I read `Projects/BLUELINE/flow-field-spine.md` § Obstacle (lines 39–51). It carries the same tangent and "sheds" wording, so the maker's "likely" is confirmed.

## The face as a whole

The face makes the page's idea felt. It is not just busy. Both walks start small and earn their tests. In the first, the field you drag bends all three legs at once with their numbers held still, and that is the spine in your hand. The second is the more valuable piece. Flipping one switch turns Session 4's careful-looking picture into air pouring through a body, and the next switch shows the same matrix parting it. The page's larger bet survives both walks: one source, thin per-leg work, and the coupling living in the field's author once the solve keeps its own assumption. What needs saying, with numbers, is that two proofs were not what their reports said. Session 3's steers leg drew its field upside down and lost its whirls. Session 4's solve drove air into the body. Offer 3 is the one that changes the page. Offer 2 earns a caveat. Offer 1 is a number for a claim the page already gives up. The fixes are three lines of text across two made pieces and one caption; none of the engines needs touching.
