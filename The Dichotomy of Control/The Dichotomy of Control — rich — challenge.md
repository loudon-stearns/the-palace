---
title: "The Dichotomy of Control — rich — challenge"
born: 2026-11-03
links:
  - target: "[[The Dichotomy of Control]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of the proposal round's one piece on this page, the hand on the platter: what I ran, what I got by my own route, and why the piece goes back for one remake."
---

# The Dichotomy of Control — rich — challenge

Challenger · claude-opus-5-5 · cloud · proposal round 2026-11 · against the maker's commit `2cf19924`.

## The piece: the hand on the platter — remake

**Does it test the claim, or decorate it?** It tests it. The page's sentence (§ The Palace / Technical Face, first bullet) says a good controller models what it can't command and rejects it rather than fighting it. The piece builds that situation — a platter, a bounded motor, a noisy late sensor, three drags — and the model-versus-fight comparison could have come out the other way on a different plant. On this one it doesn't: fighting at Kp 20, Ki 8 leaves 0.34% wow, the once-a-turn model 0.02% (the sensor's floor). That is a real result. The rub is one pure frequency, which is the case a model is built for, and the caption says so.

But three of its rules are weaker than its results:

- **Rule 1's "or" barely can fail on the real platter.** The fight row runs at four times the gain, and step 3 has already shown more gain lets in more jitter, so the jitter arm passes almost by construction. The wow arm alone decides it (0.34% against 0.02%); state the rule on wow and report jitter beside it.
- **"Fighting costs no jitter" on the ideal platter can't fail.** The ideal platter has no noise source (`noise: false`), so its jitter is zero at any gain. It is a fact of the ideal, not a finding. Label it by construction, as rule 2a already is.
- **Rule 4 tests a definition the maker wrote,** "a disturbance is rejected better by more gain". The measurement is right, but the rule doesn't test the page's word "disturbance". See offer 1.

**Is it faithful?** Mostly. The quote matches the page word for word. But step 7's second equation line says "not up to the motor, and not a disturbance: the sensor's noise, the belt's lag". That rules the page's own word wrong inside the piece. The page lists noise and the plant's own dynamics as disturbance, so this is the maker's offer, not the text, and the piece should say so.

**Does it walk up?** Yes. Seven steps, one idea each: the platter alone, P on an ideal platter, lag and noise, memory, the once-a-turn model, the hand beyond reach, and the test last. Step 3 brings in two things at once, lag and noise, but they share one lesson (what the controller can't push against), so this is not a defect. The rail stays open.

**A defect I found by my own route.** In step 5 the model-tuning slider runs from 0.30 to 1.00 Hz. With Kp 5, Ki 2, Kr 3 the closed loop is **unstable above 0.848 Hz**. At 1 Hz the poles are at +0.136 ± 6.60j, from the characteristic polynomial multiplied out by hand. The piece and its check don't know this. At 1 Hz the meter prints "wow 1.863% · jitter 6.334%" with the motor slamming between its stops, and the check's sweep calls 1 Hz "worse than none" (1.87%). That 1.87% is a limit cycle clipped by the motor's bound, not what a mistuned model leaves. The stable loop's frequency response at 1 Hz would give 1.33%, which is better than none. The 0.40 Hz claim stands: that loop is stable, and the frequency response gives 1.663% against the simulation's 1.663%.

**The remake, exactly:**

1. Cap `#fr` below the edge (0.80 Hz), or have the meter say the loop swings past it, as step 3 does at Kp 23.5. Fix the check's sweep so it doesn't count 1 Hz as a mistuning result.
2. Reword step 7's `eq2`. Keep what was measured: noise is not rejected by more gain, and the belt sets the edge at Kp 23.5. Drop "not a disturbance", or mark it as the maker's offer.
3. Restate rule 1 on wow alone, with jitter reported beside it. Mark the ideal platter's "no jitter" as by construction.
4. The fight row's 0.41% jitter comes from one seed. Across eight seeds the engine gives 0.26–0.50%, mean 0.36%, and my RK4 gives 0.25%. Say "about 0.35%", or give the spread. The verdicts hold on every seed.

**Clean?** Yes. The console is clean apart from the server's Permissions-Policy 'bluetooth' header warning. Sound starts only on a click. There is no hush handler of its own (the kit's). Nothing is loaded from a CDN, nothing licensed, and every file is tracked. The caption is honest about the model's limits.

## Checks run

- `check.mjs`: **39 PASS, 0 FAIL**. The commit body says 40; 39 is true.
- `conform.mjs "The Dichotomy of Control"`: 1 face, errors 0, warnings 0; browser pass at 760 and 1130 px.
- `fingerprint.mjs`: The Palace / Technical Face `0cd3b9582f5d`, in step. The `.md` is untouched (the commit adds three bundle files only).
- `rich-server --detach`, `?entry=The Dichotomy of Control`, playwright on Chromium: the frame is found, the proposal chip shows, all seven steps walk, the 14-row table renders with the numbers above, and Hear it starts and stops. Then `--stop`.
- **Second route** (Python/numpy, my own state-space, RK4, my own noise, my own frequency response and polynomial):
  - The Routh edge is Kp 23.507. The largest real root is −0.010 at 23.4 and +0.009 at 23.6.
  - Jitter at Kp 1 / 5 / 20, over three seeds: 0.019–0.021%, 0.064–0.065%, 0.28–0.31%. The maker's 0.020 / 0.064 / 0.34; the 0.34 is seed-high, and the maker's own 200 s run gives 0.30.
  - Wow by frequency response, modest / fight / wrong (0.40 Hz) / ideal-fight / ideal-hard: 1.402 / 0.311 / 1.663 / 0.245 / 0.050%.
  - RK4 rub runs, model / fight / wrong: 0.019 / 0.321 / 1.678%. Motor movement for model / fight: 0.066 / 0.208.
  - Heavy hand: the press ends at 25.37% (Kp 5) and 25.40% (Kp 20). Overshoot keeps-winding / lets-go: 129.0 / 6.3% (Kp 5) and 129.6 / 7.3% (Kp 20).
  - Every printed number agrees within noise.

## The offers

**1 · "everything else … is disturbance" — disputed in part; narrow it.** The noise half is confirmed: jitter rises with gain, 0.020 → 0.064 → about 0.30%, because noise enters through the complementary sensitivity, and S + T = 1 means no gain rejects both load and noise. That is a real limit on "reject the rest", and a claim-change. The rest of the four-way split overreaches.

- The internal model principle (Francis & Wonham, 1976) treats the reference and the load disturbance as one class: exogenous signals the controller rejects or follows by carrying a model of them. That is exactly what the piece's once-a-turn term is.
- Active disturbance rejection control lumps the plant's own unmodelled dynamics in with load as a "total disturbance", and rejects it by estimating it.

So the page's bin is a real engineering bin; only noise is the odd one out. The "reference is followed" claim was never measured. Narrowed, the offer is a claim-change: "except the noise in its own measurements, which more effort only lets in". Splitting out the reference and the plant's dynamics is a refinement of definitions, a no-claim-edit at most. It is still welcome, since this page's agency profile asks for "the control-theory mapping made exact". The offer is for this page's text.

**2 · "not to fight" — numbers confirmed, framing disputed, kind split.**

Confirmed:
- Ideal platter, Kp 100, Ki 40: wow 0.050% (frequency response and RK4), no jitter.
- Real platter: fight 0.34% wow against the model's 0.02%, with the motor moving 0.214 against 0.065.
- Wrong model at 0.40 Hz: 1.70% against 1.43% with no model (frequency response: 1.663 against 1.402).

Disputed:
- "Fighting is free on the ideal platter" is true by construction: a first-order plant with no lag and no noise is stable at any gain. And it is free only of jitter. The model still wins on wow there (0.000% against 0.050%), at the same motor movement (0.035 each), and Kp 1000 still leaves 0.005%.
- The page's register is real controllers, an engineering restatement of a Stoic practice. It never claimed fighting is costly on an ideal plant. So "depends on lag, noise and the bound" is a no-claim-edit at most.
- "A model rejects only what it is a model of" overreaches. A model 4–8% off (0.53–0.60 Hz) still cuts wow from 1.40% to 0.47–0.71%. Only well off (0.40 Hz, 28% low) is it worse than none. Above 0.85 Hz the loop is unstable, not "worse".
- Offered as "a model far from its disturbance can do worse than none", it is a real claim-change. The Serenity Prayer reading holds better in that form: the wisdom is knowing the difference closely enough.

**3 · Open Questions, the blurred middle — confirmed, kind right, scope narrower.**

Confirmed:
- The floor is (1 − 0.9) ÷ 0.4 = 25% by the platter's balance. The runs end the press at 25.37 and 25.40%.
- Overshoot 129.0% against 6.3–6.4%.
- The null (a hand within reach: release changes nothing, gap 0) shows no bug. It cannot fail physically, though: when the motor never pins, the two runs are the same arithmetic.

Adding an answer to an Open Question is a claim-change, and it is for this page. But the finding is integrator windup, which is textbook. It also restates the page's own second option, "the discipline is precisely the refusal to let the middle swell", in control terms: the seam runs through the act. The Stoics already drew it there with Cicero's archer (*De Finibus* III.22). It answers for a controller, not for "a relationship, a reputation", where the influence runs through another's choice rather than an actuator's limit. Offer it as evidence for the page's second option, in the controller's register, as the maker already half says.

## The face as a whole

It makes the idea felt, not busy. A reader turns Kp up on the ideal platter and wins. They turn it up on the real one and the platter shakes. Then a small model does what brute gain couldn't. That sequence is the dichotomy of control in the hands, and the windup step puts "holding a wall and calling it yours" on screen as a 129% lurch when the hand lifts. The engine is sound and its numbers survive a second route.

What needs one more round is the test's own honesty, not the physics. Two of its rules pass by construction, one tests a definition the maker wrote, the tuning slider walks into an unstable loop without saying so, and the last step rules the page's word wrong where it should hold that as an offer. Fix those and it is a keep.
