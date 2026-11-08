---
title: "Resonance and Damping — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Resonance and Damping]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Resonance and Damping's first rich face: each piece judged on whether it tests the text, stays faithful to it and walks up to its test, and each of the maker's four offers recomputed in closed form, apart from the pieces' engines."
---

# Resonance and Damping — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5. I judged from the page (`Resonance and Damping.md`), the manifest, the seven pieces it names, and the maker's commit body (4a1a477e), which was my only account of the run.

## Verdicts

**One number, three faces · `three rulers.html` · keep, with one wording fix.**
It tests the claim. It measures one swing three separate ways (a strike timed to −60 dB, a push at its own rate measured for height, and a push at every rate measured for the width of the peak), and turns each reading back into a Q. If the page's 2.2, its "Q times" or its f ÷ Q were wrong, the dots in step 4 would come apart. It is faithful. The one place it says more than the text is step 1's Try ("the shortcut is for a high Q"), and that is offer 1, labelled as measured. It walks up one face per step, with the side-by-side and the page's table last. The fix: "within 60 dB of its height" (the step 2 readout, line 119, and the canvas label, line 526) reads as "anywhere above −60 dB", which the swell reaches almost at once. What it measures is the point where the gap to full height has fallen 60 dB, which is 99.9% of the height (line 253). Say "within a thousandth of its full height". A smaller point: the caption's "0.25% at Q 10" matches the closed form (0.252%), but the piece's own engine reads 0.24% at 440 Hz and 0.29% at 1 kHz. That spread is grid error, not a contradiction.

**Pushing it · `who keeps time.html` · keep.**
Steps 3 and 4 test the section's three bullets on runs. Any of them could have failed: Q times at f (2.0000, 10.000, 50.000), 90.000°, 0.0000% returned, in/out balance 1.0000 at five rates, and the peak at √(1 − 1/2Q²) and gone below 0.707. I recomputed the energy handed back in closed form: 50.05% at 0.8 f and 91.96% at f ÷ 4, matching the caption's 50% and 92%. Steps 1 and 2 add a model of Galileo's ringer (tugs timed by the swing's phase) that the page does not draw. It stays faithful, because the page's own line is "Both are true", and the piece shows why Galileo's half was true. It walks up well: the ringer alone, then when he tugs (push times speed, which sets up bullet 3), then Young's push, then the test. A minor note: once the piece loads, its requestAnimationFrame loop (line 459) redraws every frame even with no run going. It costs nothing on a hidden tab, but it is idle work beside four other frames.

**Where the builds point · `loss per trip.html` · keep.**
Step 4 is a real test. A Karplus–Strong loop runs, every partial's loss per trip is read off the sound by Goertzel, and each is set against g·|H|. A mistake in the page's reading of the loop ("the gain and its filter bend that curve in different places") would show, and it holds: gain adds 0.04376 dB a trip at partials 1, 6 and 12 alike, and the filter from b 0.1 to 0.3 adds 0.0004 dB at partial 1 and 0.0626 dB at partial 12. The page's numbers hold: 0.04354 dB, 1,378 trips, 6.264 s. It is faithful, and its caption is honest that this is the page's loop, not a real string. It walks up: one partial, then gain alone, then the filter, then the curve. One honesty note: step 1's "ring time, read off the sound" (line 97) reads a sine built as g^trips, so it checks the reader, not the claim. That is fine for a concept step, but the label oversells it a little.

**Where the builds point · `body-links-sheet.png` (gathered) · keep, re-anchor.**
It is a record, not a test. Its caption matches the image: rigid keeps 100% and the board gets nothing, soft keeps 90% and the board gets 19.0%. But the sheet shows the energy split at the bridge, not "a bank of resonators, each a mode … with its own frequency and Q". Anchor it to "the energy the string loses at the bridge is exactly the energy the board gets", the sentence it actually pictures. The top edge of the image is clipped (the bow label), as it was in the Waveguide round.

**Damping is where the sound goes · `bridge-feeds-body.wav` (gathered) · keep.**
A second engine bears on the section's trade: as the bridge softens, the note gets louder and shorter. Every number in the caption matches `Projects/Waveguide Synthesizer/offline-v1.8/body-levels.json` (peaks −14.7 to −4.4 dBFS, rings 2.98 to 0.20 s). "To −40 dB" is right too: `body_render.mjs:22` measures 20 ms RMS down 40 dB. The caption names the model's gap plainly: the pickup hears the string, so a rigid bridge still sounds. The file is tracked, resolves (206) and plays (0:20).

**Building one · `sketch — q-step-by-step.html` (gathered) · keep.**
This is the page's own staged walk, which the text links in its own sentence. It has six steps, the sixth being "The proof", as the caption says. Conform is clean.

**Building one · `sketch — q-you-can-hear.html` (gathered) · keep.**
This is the page's own proof. I re-ran its check (ALL PASS): ring 0.02498 s against 0.025, width 87.5 against 88 Hz, lag 87.1° at Q 5, and 89.7° at Q 50, so "within 1 to 5%" is honest. Conform marks its empty `contract: {}` as "manifest; owed". That is not an error, but the manifest owes it a contract line.

## Checks run

- `conform.mjs "Resonance and Damping"`: 5 pages, introduced 5, errored 0. **Errors 0, warnings 0**, browser pass at 760 and 1130 px. The maker's three warnings are gone now that the pieces are tracked.
- `fingerprint.mjs`: all five sections made are **in step** (23b636834a32, ea710651c4b3, cb694da95737, 21ab3ad0dc60, 35974b9264f6).
- `Resonance and Damping — rich — check.mjs`: **ALL PASS**. That covers all three selfTests and, in headless Chromium from file://, no context before a click, one step at a time, sound on every step, silence on leaving, and a hidden tab stopping it.
- The face on a leased rich-server, in headless Chromium: **console clean**. Five frames reported their heights (1221, 1205, 1156, 1360, 830), the PNG decoded (1540 px wide), and the WAV resolved.
- **The hush fix, confirmed.** None of the three made pieces names the page's hush message (grep empty). In the face, for each made piece in turn, I clicked its first sound and saw 1 context running. I then played the browser's hide top-down through every frame: 0 contexts running within 1.5 s, and still 0 1.5 s after the page came back. The piece's own `visibilitychange` only stops its buffer, so the suspend came from the kit, which is the intended path.
- Closed-form recomputes (python, not the pieces' engines), below.

## Offers

**1 · Two numbers, "the fraction is 2π ÷ Q": confirmed.** The page puts "about" on the sixteenth, but "the fraction is 2π ÷ Q" stands flat. The exact energy lost per damped cycle is 1 − e^(−2π / (Q·√(1 − 1/4Q²))): 6.09% at Q 100, 46.69% at Q 10, 96.10% at Q 2. Per natural period, 1 − e^(−2π/Q), it is 6.09%, 46.65% and 95.68%. The maker's numbers are the per-damped-cycle ones, to the digit. 2π ÷ Q is the energy definition of Q, and it agrees with 1/(2ζ) only at high Q. "About 2π ÷ Q, for a high Q" is a fair no-claim edit.

**2 · One number, three faces, "closely once Q is above a few": confirmed.** In closed form the displacement's half-power band runs over f ÷ Q by 8.12% at Q 2, 3.08% at Q 3, 1.04% at Q 5 and 0.252% at Q 10. At Q 1 there is no lower edge: the response at DC (1) stays above half the peak's power (peak² = 4/3). One addition the piece doesn't give: the lower edge first appears at Q = √(1 + 1/√2) ≈ 1.31. The band-pass (velocity) width is exactly f ÷ Q, as the page says.

**3 · The swell builds in the ring time: numbers confirmed, framing disputed.** On the engine at 440 Hz the swell reaches 99.9% of its height short of the ring time by 7.4% at Q 2, 1.2% at Q 5, 0.5% at Q 10, 0.17% at Q 50 and 0.08% at Q 200. Its 49.73 ms against the 49.97 ms exact ring at Q 10 matches the maker's 49.7 against 50.0. But it is not a fourth face. A pushed resonator's start-up transient is its own free ring, which dies at the same rate, so the gap to full height closes exactly as the strike's ring falls. It is face three seen from the start of the note instead of the end. The 7% at Q 2 is that transient ringing at the damped rate and beating against the push. Worth a clause on the ring-time bullet ("and a push at its own rate takes the same time to build"), through the Deposit map since it adds a claim. Fix the "within 60 dB" wording first (see three rulers).

**4 · Pushing it, Galileo: the page is not wrong, and the maker's reading is a second true description, the sharper one.** "Struck, a thing rings at its own rate. Driven, it moves at yours" is true. It also stays true for the ringer if you read "yours" as the bell's own rate, borrowed. But it files Galileo's case badly. His ringer was not striking once. He was driving, every swing, so a reader who sorts by struck/driven puts the ringer under "driven" and then has to explain why the bell kept its own rate. The axis that actually separates Galileo from Young is the one the maker names: who keeps the time. The ringer takes it from the bell (feedback), and Young's push brings its own (an outside clock). The engine bears this out: tugs timed by the swing come at 0.9995 of its own rate at own rates 0.7, 1 and 1.5, while Young's push settles at its own rate to four decimals. Off-centre tugs pull the rate (0.9662 at 60° late, 0.9191 at 90°). From memory, not checked here: this is the pendulum clock's escapement, and Airy's result that an impulse given at the bottom of the swing leaves the period alone. Recommend adding the who-keeps-the-time sentence beside the struck/driven pair rather than replacing it, through the Deposit map.

## The face as a whole

It makes the page's idea felt rather than busy. Each made piece is a test that could have failed, and each walks to its test one concept at a time. The three that matter most for a learner, three rulers, who keeps time and loss per trip, each take one of the page's quiet claims and measure it, and two of them turned up something the text should hear: where 2π ÷ Q stops working, and who keeps the time. The gathered Waveguide files tie the page to an instrument actually being built, which is the page's own lean. The risk is weight. Five tall interactives (about 5,800 px of frames) sit on one page, two of them staged walks over the same mass-on-a-spring ground (three rulers and q-step-by-step both open on "strike it and it rings"). A reader taking the face top to bottom will strike this swing many times before reaching Building one. That is a matter of taste for Loudon to decide by ear, not a fault. Nothing here was heard: an agent can't judge the mix, and every made piece holds its level, so the heights live on the sheets.
