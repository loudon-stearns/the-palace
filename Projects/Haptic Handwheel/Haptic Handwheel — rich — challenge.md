---
title: "Haptic Handwheel — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Haptic Handwheel]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Haptic Handwheel's proposal-round rich face: a verdict and a reason for every piece, the checks run, and the two offers recomputed, holding the line between what the steward's engine says and what the page gets wrong."
---

# Haptic Handwheel — rich — challenge

Challenger, 2026-11-03, on the maker's commit 95980316 in `enrich/haptic-handwheel`. I judged from the page, the manifest, the three made pieces, the six gathered ones, and the maker's commit body. Nothing here touches hardware. Every motor number is the steward's assumption (`proofs/feel-lab/feel_engine.js`, marked ASSUMED), so each finding below is about what the engine says, not about the knob.

## Verdicts

**the struck spring** (What the hand should feel): **keep**, with two notes.
1. *Test or decoration?* A test. The claim, "a spring wobbles at one rate all the way down, and a pendulum quickens as it settles", is true of the two equations, so the ideal knob can only confirm it. What the piece adds is the condition under which a listener could tell them apart: a hard strike, on a motor with friction. That condition is offer 2, and it came out of the piece.
2. *Faithful?* Yes. The engine is the steward's text letter for letter (checks.mjs, three times over). Two wordings are off. The caption's "the spring holds 5.89 → 5.81 Hz" doesn't say the last two half swings were set aside; the step-4 readout does. And both the piece and offer 2 say sticking friction "catches the knob and slows it" at the end. It doesn't slow it. Dry friction moves the point the spring rings about by τC/k = 0.003/0.085 = 0.035 rad toward the side it came from. Each half swing is still exactly half a period, π/ω₀. The meter times crossings of θ = 0, and those land later as the swing shrinks toward that offset. Recomputed from that alone, the last three half swings should run 5.83, 5.75 and 5.37 Hz; the engine gives 5.81, 5.72 and 5.32. With friction switched off, the spring holds 5.89 Hz to its last swing. So the spring's one rate is truer than the piece says. The dip is the ruler's, not the spring's.
3. *Walks up?* Yes. A spring alone, a pendulum alone, then damping (friction, a finger, the brake guesses), then the test.

Fix in a later round: say "last two half swings set aside" in the caption, and reword the end dip as the meter reading zero crossings around a rest point that friction has moved.

**a stiff spring down a wire** (Two kinds of force): **keep**, with one note.
1. A real test. The map is drawn cell by cell by the engine, and the closed form is laid over it. It could have disagreed, and it doesn't: 310/310, 323/323 and 321/321 cells away from the edge agree, and 24 of 24 verdict cells match the steward's `feel_lab_results.json`.
2. Faithful to the steward. It runs his stability test unchanged, including his choice of a knob with no dry friction (`tauC: 0`, the same as `render_feel_lab.mjs` `grows()`). The step-5 honest box says so ("it uses the ideal knob (no dry friction)"). The step-5 verdict line doesn't: "the softest feel on the page doesn't cross a cable on its own" should read "on a knob with no friction" (see offer 1). The device-10k edge is 25% off the closed form, 2.50 against 2.00 N·m/rad, and the check widens its tolerance to 30% for that lane. That is disclosed, and no verdict cell depends on it.
3. Walks up: one spring on the motor, a wire, a hand, damping kept local, then the map.

**two parts or one** (Feedback folded into the control): **remake**.
1. *Test or decoration?* A demonstration of the engine's detent, presented as a test of the Simondon claim. The headline column, "landed within 10 ¢", can't come out against the claim. A frets well with the 0.006 N·m ridge push lands any let-go within ±50 cents on the note. The steward's feel map already measured that setting (`feel_map_results.json` landing, cancelled+kick: max 2.29 ¢), and the 80-of-80 at a 1.8 ¢ worst case reproduces it. A plain knob whose pitch snaps to the nearest note on let-go would score 9 of 9 with no motor, no sensing and no push. So the in-tune count measures correction, not where the news lives. The verdict line "The one part carried the news" claims more than the count can carry. The only part of the test that bears on the claim is whether the player found the right note without the light, by watching the knob hold at each notch. The piece records that only as "the wrong note" in a message.
2. *Faithful?* The caption and the honest box are careful ("tests where the news lives, not whether a hand feels it"). The verdict sentence is not.
3. *Walks up?* Yes. Plain knob, light, motor, test.

The remake, in one round: (a) add a fourth way, the plain knob that snaps to the nearest note on let-go (no motor), as the control; (b) score every way on two columns, right note (counted) and cents off, and say plainly that the motor's and the snap's cents are the detent's and the quantizer's doing; (c) drive the verdict from the right-note column. For the motor that is "did you count the notches without the light", and only that column tests "the news comes back through the part already in the hand". Then rewrite "The one part carried the news" to match. Keep the honest box.

**Gathered: frets_landing.wav, lock.wav, follow_melody.wav, turntable_hold.wav**: **keep**, with a placement note. They're the steward's renders. I checked the captions against his numbers. Lock click phases: 0.501, 0.987, 0.482, 0.012, 0.257 … then 0.021, 0.012, 0.006, 0.002, 0.999, as captioned. Frets: max 2.39 ¢ on the last pass, "within 2.4 cents", as captioned. All four have `near: "a spring wobbles at one rate all the way down"`, so in the face they stack at the struck-spring bullet. Each illustrates a different bullet (pitch you can lean on, the lock, haptic filtering, the turntable). Re-anchor each to its own bullet if the renderer anchors in list items. As gathered evidence they illustrate, which is their job.

**Gathered: proofs/feel-lab/feel-lab.html**: **keep**. It is the steward's lab, framed whole, and the caption is honest about its notes box.

**Gathered: proofs/feel-lab/stability.svg**: **keep**. The steward's sweep, and the caption's "within about 10%" is his (device-10k at 11%).

## Checks run

- `checks.mjs`: all 36 pass. The engine block in each piece equals `feel_engine.js` byte for byte. No piece names `rich:hush`, and none makes an AudioContext outside its click handler.
- `conform.mjs "Haptic Handwheel"`: 4 pages, introduced 4, errors 0, warnings 0, browser at 760 and 1130 px.
- `fingerprint.mjs`: the three sections in step (8f7b5dd1cb00, 075fcbba73d8, dd98c0052b18).
- The face served by `rich-server.mjs`, scrolled whole in headless Chromium: all four frames loaded, console empty. The "reported no height" notes on two pieces are present but hidden (display none).
- Each made piece opened alone and walked through every step, every control clicked and the wheel dragged: console clean, no audio context before a click. Hushing when hidden is the kit's; the pieces leave it to the kit.
- My own runs on the steward's engine, in the scratchpad: the pendulum against the exact elliptic period, the spring with and without friction, the clamp, and the soft spring over a wire with the engine's own friction on.

## The struck spring, recomputed

The spring: J = 3×10⁻⁵ + ½·0.040·0.040² = 6.2×10⁻⁵ kg·m², f₀ = (1/2π)√(0.085/6.2×10⁻⁵) = 5.893 Hz. The engine measures 5.891. The 1×10⁻⁴ motor loss is ζ = 0.022, which lowers the rate by 0.02%, too little to see. The drop to 5.81 Hz is the zero-crossing effect above, and nothing else.

The pendulum: f/f₀ = π / (2·K(sin²(θ/2))), about 1 − θ²/16 for small θ. The engine matches it at every measured half swing, once you read the swing's real amplitude and not the pull. On the pretend motor, friction and loss take 0.43 rad in the first half swing, so the first measured swing from a 2.3 rad pull is at 1.87 rad. There the theory gives 4.62 Hz and the engine 4.61. On the ideal knob the first swing is at 2.01 rad: theory 4.42, engine 4.42. So the quickening a strike can show is roughly A₁²/16 (exactly f₀/f(A₁) − 1), where A₁ is the first measured swing. Friction then stops the knob near 0.28 rad, and the zero-crossing shift drags the last kept rates down about 1%.
- From 2.3 rad, A₁ = 1.87: +27.6% available, +25.4% measured.
- From 1 rad, A₁ = 0.85: +4.7% available, +3.1% measured.
- From 0.5 rad, A₁ is about 0.35: under 1% available, eaten by the shift, so +0.0% measured.

The clamp: 0.2 N·m ÷ 0.085 N·m/rad = 2.353 rad. Past that the spring's push stops growing, so the top of a bigger swing runs slow. Struck from 3 rad (the steward's renders), the first half swings run 5.68, 5.80 and 5.88 Hz at 2.77, 2.57 and 2.40 rad, then 5.89. The pendulum's push never passes 0.085 N·m, so the clamp never touches it. Capping the pull at 2.3 rad is right, and it's disclosed. One consequence for the page, not an offer: on this motor a spring struck past about 135° also starts slow. The hardest strikes blur the spring and the pendulum in their first swing.

## Offers

**Offer 2** (What the hand should feel, no-claim-edit): **confirmed**, with one correction. The numbers reproduce, and they follow from the pendulum's amplitude law as shown above. Correct its last sentence: the spring's rate doesn't slow at the end. The meter's zero crossings drift because dry friction moves the rest point by 0.035 rad. The suggested wording, "a pendulum, struck hard, quickens as it settles", is good.

**Offer 1** (Two kinds of force, claim-change): **confirmed in the engine's numbers, disputed in force**. Three things.

1. *The form and the numbers.* K·(T/2 + d) < b is the sampled-wall passivity bound (Colgate and Schenkel: b > KT/2 for a virtual spring). The zero-order hold costs T/2 of lateness, and transport delay d adds to it, because a spring pushing τ late is, for ωτ ≪ 1, a spring plus a negative damper Kτ. It doesn't depend on mass, which is the steward's finding (3). Over USB the edge is 1×10⁻⁴ / 4.5 ms = 0.0222 N·m/rad; on the audio line it is 1×10⁻⁴ / 5.35 ms = 0.0187. The growth reproduces from σ = (Kτ − b) / 2J, measured over the 0.8 of the window between the first and last fifths: about ×6.9 over USB (the piece gets ×6.74) and ×28 on the audio line (×25.8). For the pitch-wheel return, ωτ = 22 rad/s × 4.5 ms = 0.1, so the small-delay form holds. 24 of 24 verdict cells agree with the steward's table.
2. *Whose words.* The offer refines the page with the steward's own finding, not a new one. His scroll, cycle 1, finding (1), says it nearly verbatim: "Over USB to Max, the stiffest feel that stays calm with no hand on the knob is 0.022 N·m/rad, which is softer than a pitch-wheel return spring." His table marks the 0.03 row "only while held" on both wire lanes. The 0.002 rescue (edge 0.48 over USB) is his too, and so is cycle 2's back-EMF brake (USB edge 0.5 to 1.7 with the brake on). The piece makes it visible. The offer carries his words home to the page, and it should credit them that way.
3. *The line between the engine and the page.* That test knob has no dry friction (`tauC: 0`, the steward's choice and the piece's). With the engine's own assumed 3 mN·m friction switched on, smooth or sticking, the 0.03 spring over USB with no hand settles from every pull I tried: 0.05, 0.5, 1 and 2 rad. The struck-law spring on the audio line settles too. So on the engine's own pretend motor, the page's "Soft feels can cross a cable" holds over USB without anything added. The friction is the damping on the device. Read that way, the offer's wording, "if the damping stays on the device", is the right shape. Its claim that it holds "only with damping on the device or a hand on the knob" is true only of a frictionless knob.

   There is a sharper case the offer misses. The engine's actual pitch-wheel return, the `centre` feel (k 0.03 plus its 0.01 N·m push toward centre), buzzes as an audio line even with friction on. Released hands off, it settles into a ±0.10 rad wobble at about 7.5 Hz. From a 2 rad pull it winds up to ±11.3 rad, nearly two turns, against the torque clamp. Over USB and on the 1 kHz device loop it settles. With the motor's own brake at its low guess (0.00223) it settles on every lane. So on the steward's engine, the soft feel that most needs the damping kept local is the one with the small push, and the lane is the audio line. Suggested evidence for the offer: "on a frictionless test knob, 0.03 grows ×6.74 over USB; with the motor's friction it settles; the pitch-wheel return as built (with its centring push) buzzes on an audio line unless the brake is left on." The wording stays the same.

## The face as a whole

It makes the page's idea felt more than it makes it busy. The two physics walks do what a screen can do for a knob that doesn't exist: they put the steward's engine under the page's two physics sentences and find where each one bends, a hard strike for the pendulum and kept damping for the cable. Both pieces say what they can't test. The weak point is the Simondon walk. It is the one section about why a single part is better, not about how the physics behaves, and its test scores the detent's correction as if it were the player's reading of the knob. Remade with a snap-to-note control and a right-note column, it would say honestly what a screen can show and leave the rest to the touch gate the page already names. The four gathered sounds stacked at the struck-spring bullet should go back to their own bullets.
