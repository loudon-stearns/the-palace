---
title: "Latent Error — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Latent Error]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Latent Error's proposed rich face: both pieces judged for test, fidelity and walk-up, every number re-run by a second route, and the page's own question turned on the pieces too — what does each one take for granted?"
---

# Latent Error — rich — challenge

Challenger, proposal round of Enrichment (v2.7 with the proposal-round settings), 2026-11-03, on the maker's commit `2dad8102` in the worktree `enrich/latent-error`. I judged from the page (`Latent Error.md`), the manifest, the two pieces and their sources, with the maker's commit body as my only account of the run. I did not make this face.

This is the page Enrichment step 2 cites for "show what the section takes for granted", so I held both pieces to that rule as well. Each one asks it of the page. I asked it of each piece.

**Verdicts: 1 keep, 1 remake, 0 retire.**

## Control Theory Translation: The Integral Term

### the room that settles short — remake

**The plant, confirmed from the core.** The room is first order: `10·dT/dt = −(T − 5) + 30·H − D`. That is a time constant of 10 minutes and a gain of 30 °C per unit of heater share, with 5 °C outside and the window taking 5 °C's worth from minute 60 (`the room that settles short.html:127`, `:145`). The lagged room adds a 2-minute radiator and a 1-minute thermometer (`:144`, `:147`). The controller sees only the thermometer, and the heater is clamped to 0..1, with conditional integration as anti-windup (`:139–141`).

**What I recomputed, by a second route.** I wrote my own RK4 integrator in Python at dt 0.002 (the piece uses Euler at 0.001), plus Routh by hand:

- With P alone and no lag, the rest error is e = 20/(1 + 30·Kp): 2.857 at Kp 0.2 (17.143 °C), 0.132 at Kp 5 (19.868). There is no overshoot. The closed loop is first order, so it can't overshoot. **Confirmed.**
- With lag, the characteristic equation is (10s+1)(2s+1)(s+1) + 30Kp = 20s³ + 32s² + 13s + 1 + 30Kp. The Routh edge is Kp = 0.660, and the swing period there is 7.79 min. **Confirmed.**
- With lag, P alone at Kp 0.7 never settles. It swings 18.240 to 19.912, and the mean of the last hour is 19.045 against P's rest point of 19.09. **Confirmed.**
- PI with lag at Kp 0.2 has its Routh edge at Ki = 0.0629. At Ki 0.07 it swings 18.280 to 21.542. At Ki 0.02 it settles on 20.000 with a 0.361 overshoot. **Confirmed.**
- Without lag, PI at Kp 0.2, Ki 0.1 overshoots by 0.533. With lag, Kp 0.4 and Ki 0.04, the overshoot is 1.17 at Kd 0, 0.00 at Kd 0.5 and 1.97 at Kd 2 (the piece's own core). **Confirmed.**

Every number the piece prints is right.

**Where the reading goes wrong.** The piece picks Kp 0.7 to stand for "P alone with lag", and Kp 0.7 sits just past the edge. The page says "high P gain". Push P higher in the same lagged room and the swing crosses the target (piece's core, last hour, window open):

| P alone, with lag | swing | mean | P's rest point | crossings of 20 |
|---|---|---|---|---|
| Kp 0.70 | 18.24 – 19.91 | 19.07 | 19.09 | 0 |
| Kp 0.75 | 18.20 – 20.03 | 19.10 | 19.13 | — |
| Kp 1 | 18.11 – 20.35 | 19.18 | 19.35 | 15 |
| Kp 2 | 18.23 – 20.67 | 19.37 | 19.67 | 15 |
| Kp 5 | 18.35 – 20.83 | 19.50 | 19.87 | 14 |
| on/off (my RK4) | 18.44 – 20.92 | 19.57 | — | — |

At Kp 2, which is a row in the piece's own table, the room does what the page's sentence says. "Always have steady-state error": its mean sits 0.63 below 20. "Oscillate around the target, never settling": it crosses 20 fifteen times in the last hour and never calms. The piece marks that row *half* because `fits()` (`:204–209`) asks for a centre within 0.1 °C of 20. The sentence's own first clause says the error stays, so the page never claimed a swing centred on the target. The test is scoring a reading the page doesn't hold. Three of the piece's lines are wrong for every lagged P-alone run from about Kp 0.75 up:

- step 6, `say` (`:248`): "The second half describes none of the P-alone runs."
- step 6, `eq2` (`:250`): "with P alone it swings around the offset, not the target". At Kp 2 the swing straddles the target, and its mean (19.37) is not P's offset either (19.67): the clamp sets it.
- the caption: "past Kp ≈ 0.66 it swings forever, but around the offset line, below the target". That holds only near the edge.

**What the piece missed, and the page's real error.** The sentence after it, "A system with I term will converge", is where the page goes wrong, and the piece's own core shows it. With lag at Kp 2, adding Ki 0.02 still swings 18.30 to 20.73. Adding Ki 0.05 swings 18.35 to 20.80. Adding Kd 1 settles it, at 19.67 with P alone and at 19.94 with Ki 0.02 as well. So I does not cure the oscillation that high P and lag make. D does, or less gain does, and that is what the page's own D paragraph says. The page credits I with D's work.

**Is the page wrong, or simplifying on purpose?** It is a textbook simplification, and the piece is right to test it. "P alone creates oscillation" is the thermostat intuition: true for a real, lagged room at high gain, false for a room with no lag. What it takes for granted is the lag, and step 3 of the piece shows that well. "High P, no I: steady-state error, oscillating around the target, never settling" is close to right for a lagged room at high gain. Its two clauses describe the mean and the swing, and both hold at Kp 1–5. What is plainly wrong is the remedy: "with I it converges". That holds only when the gain is low enough for the loop to settle anyway, and it fails past Ki 0.063 even then.

**The three questions.** (1) It is a test. It could have come out for the page, and on the high-gain rows it partly does, though the piece doesn't say so. (2) It is not yet faithful. Its scoring rule and three of its lines claim the page's second clause fits no P-alone run, and that is false in its own room. (3) It walks up well: the room alone, then P, then lag, then I, then D, and the test comes last. Each step opens on its own example, and the step rail stays open.

**Remake, one round, exactly:**

1. Change `fits()` so a run fits when its mean is off the target, its swing straddles 20, and it never settles. Don't ask for a centre on 20; the sentence's first clause rules that out.
2. Add two lagged rows to `LE.RUNS`: Kp 2 with Ki 0.02 (I added, still swings) and Kp 2 with Ki 0.02 and Kd 1 (settles). The test then shows the sentence describes high P with lag, and that I doesn't cure it.
3. Rewrite step 3's `say` and `tryText`, step 6's `say` and `eq2`, and the caption to match. Lag is what the P paragraph takes for granted. Near the edge the swing sits below the target; at high gain it crosses it, centred below it. The claim the room refutes is "with I it converges".
4. Update `check.mjs` to match: the expected `words` line (`check.mjs:96`) and the printed-numbers list.

The walk, the sound and the plant all stay.

**Clean.** Sound starts only on *Hear it*, stops itself at 24 s, and the hush is left to the kit (no `rich:hush` or `visibilitychange` handler, per check.mjs). It needs nothing of its host. Nothing licensed is in it.

## Latent Error

### holes that line up — keep, with notes

**The model, derived from the core** (`holes that line up.html`, the `le-cheese-core` script). Each hazard has a height y on a ring. Each slice has a hole of width p at a random place. With probability β a shared condition is in play: every slice it reaches takes the *same* hole position, so they line up exactly. Otherwise each slice's hole is independent. A redesigned slice ("free") always draws its own hole. So:

P(through) = [β·p + (1 − β)·p^m] · p^f, where m slices are reached and f are redesigned.

This is the beta-factor model of common-cause failure from reliability engineering. The piece uses it without naming it.

**Recomputed by hand,** with p 0.15 and β 0.25:

- three slices: 0.0375 + 0.75 × 0.003375 = **4.003%**, against 0.3375% if independent (×11.86). n_eff = ln 0.04003 ÷ ln 0.15 = **1.696**.
- add a fourth slice: 0.0375 + 0.75 × 0.000506 = **3.788%**.
- redesign one slice: (0.0375 + 0.75 × 0.0225) × 0.15 = **0.816%**, with n_eff 2.535.
- β 0: three slices 0.3375%, add a slice 0.0506%, redesign 0.3375%. **The extra slice wins, and the redesign changes nothing.**
- the floor: β·p = 3.75%.

check.mjs matches the count against the sum in 72 cases, the worst gap 3.24 standard errors at 200,000 hazards each. **All confirmed.**

**The three questions.** (1) It is a test. Set β to 0 and the page's advice to redesign loses to adding a layer, so the result can come out against the text, and the piece says when. (2) It is faithful. It doesn't repeat the ejection-lever story ("eject" appears nowhere in either piece), and step 3's "two identical-looking levers" fits the true history too. (3) It walks up cleanly: one slice, then the independent stack, then the shared condition, and the test comes last.

**What it takes for granted** (notes, not a remake):

- The shared condition is all-or-nothing, a perfect alignment. In a real system it lines the holes up partway.
- The redesign is free, keeps the same hole size, and frees the slice completely. That is the redesign's best case. A redesigned slice with its own smaller β would be the honest next step.
- All the holes are the same size.

A later round could name the beta-factor model and offer a partial redesign. None of this is unfaithful, and a sketch may hold it.

**Clean.** It makes no sound and needs nothing of its host.

## Checks run, and what they returned

- `node "Latent Error/Latent Error — rich — check.mjs"`: all PASS (23 room, 8 cheese).
- `node _ops/rich-face/conform.mjs "Latent Error"`: 2 pages, introduced 2, errored 0, **errors 0, warnings 0**, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Latent Error"`: both made sections are **in step** (a9d568aa9168, c0e347760814).
- The face, served from the worktree (`rich-server.mjs --detach`, port 8860) and driven headless in Chromium: two *proposal · 2026-11-03* chips, both pieces walked to their last step. **Console clean**, with no errors or warnings. Server stopped.
- Independent RK4 re-run of the room in Python, plus Routh by hand; probes of the piece's own core at Kp 0.70 to 5 with lag, Kp 2 with I and with D. All in this record.
- Not run: the hidden-tab hush and the time-cap scripts (`check-hidden-hush.mjs`, `check-time-cap.mjs`), because neither piece has its own handler and both leave these to the kit. Not heard: the beating tones.

## Offers

1. **Control Theory Translation: disputed in its reading, confirmed in every number.** Every figure is right: 20/(1+30Kp), the edge at 0.66, 18.24–19.91 at Kp 0.7, the Ki bound of 0.063, 18.28–21.54. But the finding as framed ("the sentence fits only a run with I") rests on Kp 0.7, just past the edge. At the page's "high P gain" (Kp 1–5 with lag) the sentence fits: mean 0.5–0.8 below 20, swing across 20, never settling. The real claim-change is the next sentence: **"A system with I term will converge" is false where the oscillation comes from high gain and lag.** At Kp 2, Ki 0.02 still swings 18.30–20.73, and Kd 1 settles it. Suggested reframe for Loudon: keep "P alone leaves an offset", say that P's oscillation needs lag (a real room has it), and say that I removes the offset but not that oscillation. Damping it is D's job, as the page's own D paragraph says, and too much I makes an oscillation of its own. The maker's suggested P-paragraph wording ("can swing without end, still centred short of the target") is true of the mean and can stand. The suggested rewording of the second paragraph should add that I doesn't calm a high-gain swing.
2. **Latent Error, shared cause: confirmed.** 4.00%, n_eff 1.70, 3.79%, 0.82%, and at β 0 the slice wins. All recomputed by hand above. On n_eff as a first measure for Open Question 1: it is a fair *form* for an answer, but not yet a measure taken before failure. It needs P, the through-rate, which is the failure rate the question wants to predict, and it assumes equal holes. The version you can take before the accident reads β from near-misses: how often two layers miss on the same occasion, against p² if they were independent. Those partial failures show up long before a hazard goes all the way through. I'd offer n_eff with that line added.
3. **Latent Error, the lever example: confirmed.** Wikipedia's Chapanis article: after "a series of runway crashes of the Boeing B-17", Chapanis found "the controls for flaps and landing gear were confused", and proposed a wheel-shaped knob for the gear and a triangle for the flaps (https://en.wikipedia.org/wiki/Alphonse_Chapanis). Secondary accounts agree: identical toggles side by side, shape coding as the fix (https://en.wikipedia.org/wiki/Shape_coding; https://uxdesign.cc/pilot-error-and-the-shape-of-things-to-come-2128d6c6bcb1). I found no documented case of an ejection lever confused with a gear lever, only unsourced forum talk about an F-16 seat-adjust lever. On the date: Chapanis's PhD is 1943 and accounts put the B-17 work at 1942–43, so the offer's "in the 1940s" is the safe wording. Don't write "1943" without the primary Aero Medical Laboratory report.

## The face as a whole

It makes the page's idea felt, not busy. The face does to the page what the page asks you to do to a failure: look through the visible claim to what it assumed. The cheese piece does that cleanly, and its β-0 reversal is the honest edge a test should have. The room is the richer piece and the better built. It walks up beautifully, and its numbers survive a second integrator. But it fell into the page's own trap. It tested the page at the one gain where the page looks most wrong, and it scored the sentence against a reading the sentence rules out. Turned up to the gain the page actually names, the room agrees with the sentence. What it refutes is the next one, the comfortable promise that memory makes it converge. That is a sharper finding than the one it offers, and a better fit for a page that calls latent-error thinking "the I term". If I is not a cure-all, neither is root-cause thinking: accumulated memory pushed too hard overshoots. One round fixes it.
