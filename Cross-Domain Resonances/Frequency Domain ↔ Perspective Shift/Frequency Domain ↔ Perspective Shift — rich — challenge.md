---
title: "Frequency Domain ↔ Perspective Shift — rich — challenge"
born: 2026-11-04
links:
  - target: "[[Frequency Domain ↔ Perspective Shift]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of this page's first rich face: one kick walked up to a fair blind test, sent back once so its waveform numbers say whose kick they were measured on, with all three offers recomputed and the first one demoted, so Loudon can approve or revise without redoing the sums."
---

# Challenge — Frequency Domain ↔ Perspective Shift, rich face, proposal round

Challenger: claude-opus-5-5, cloud batch 2, 2026-11-04. Maker's commit `c5b04a1d`. The `.md` is untouched by it (`git diff c5b04a1d~1 c5b04a1d -- "Cross-Domain Resonances/Frequency Domain ↔ Perspective Shift.md"` is empty). One made section, Teaching Notes: one `##` with three `###`, so one stamp and one all-or-nothing approval (tuning 11d). One piece in it.

## The verdict

**One kick, two views** (made, `Frequency Domain ↔ Perspective Shift — rich — one kick, two views.html`, Teaching Notes) — **remake**, small.

1. *Test or decoration?* A test. The section's demonstration makes four claims: the waveform can't give the fundamental, the spectrum gives it plainly, the spectrum can't give the onset, the waveform gives it plainly. The last step puts each one to a reader, blind, six trials an arm, and any of the four could come out against the notes. The two "can't" arms are where it matters, and they come out differently. That difference is the piece's finding, and it is real.
2. *Faithful?* Mostly. It keeps the page's 60 Hz and time 0 as one choice in five, drawn uniformly, so the page's own numbers can't answer the trials. It does not change a number. Two sentences claim more than was measured:
   - **Whose kick.** The caption says "counting the cycles in the tail reads the fundamental to 0.04 Hz". The results say the same "every time". That holds for this piece's kick, a noiseless sine whose glide is over by 150 ms. I ran the piece's own zero-crossing procedure (`readF0Wave`) on variants of the same kick. A 2% noise floor (decaying, τ 300 ms): 5 of 25, worst miss 300 Hz, because the crossings chatter. The spectrum peak on the same noisy kicks: 25 of 25. An 808-style glide (τ 80 ms): 5 of 25, worst 6.0 Hz. A second harmonic at 1.2: 5 of 25. Drive (tanh ×4) and a second harmonic at 0.6: 25 of 25. So "the period is in the samples" is true of this kick. A recorded kick in a DAW, the page's demonstration, is a different case.
   - **"As the notes say" on a "can't" arm.** On those arms the results table writes "as the notes say" at 2 or fewer of 6. A guesser lands there 90.1% of the time, and so does a reader who didn't look. A low score is consistent with the notes, not evidence for them. Only a pass can move the verdict on those arms.
3. *Walks up?* Yes. Step 1 is the kick alone, one view, one concept. Then come the time view (when), the frequency view (which, and why it doesn't move), what the analyzer dropped (the phase), the spectrogram and its price, and the test last. Nothing opens on the end of a proof.

**What to change, exactly (one round):**
- Caption and results paragraph: scope the 0.04 Hz claim to this kick. Something like: "on this kick, whose tail is a clean sine. With a 2% noise floor the same count reads 5 of 25, while the spectrum peak still reads 25 of 25." Drop "every time".
- Results table, the two "can't" arms: replace "· as the notes say" at ≤2 with "· consistent with the notes (a guess looks the same)". Keep "against the notes" at ≥4.
- Results paragraph: tell the reader that at this zoom the cycles are drawn, 9.6 to 13.5 px apart at 760 px. A reader on the drawn pixel columns (`lane`'s min/max, count the maxima 100–350 ms after the onset) reads 25 of 25, worst 0.49 Hz, at 400, 674 and 1000 px. That goes in the reveal, after the trials, not in the rule. In the rule it would be a hint.

A note, taste only: step 4's try text says the two playbacks "have the same energy", which is true (Parseval, ratio −1.4 × 10⁻¹² dB) and is all it claims. They are not the same loudness. The magnitude-only burst peaks 11.1 dB higher, and its loudest 10 ms is 6.8 dB louder (50 ms: 2.1 dB; 100 ms: 0.7 dB; 400 ms: 0.0 dB). One clause would keep a listener from reading "same energy" as "same loudness". The maker's commit body says "loudness (matched in energy by Parseval)". The piece itself doesn't. The caption's "0.04 Hz" and the offer's "0.032 Hz" agree (a bound and a measurement).

## The blind test, checked for leaks

- **Spectrum → onset.** No leak. The five onsets draw the same picture to 2.71 × 10⁻⁹ dB. The clip is always one second and the gate always 500 ms. No axis on the spectrum shows time. The spectrogram is never shown in a trial, and every trial draws a fresh kick, so what earlier steps showed doesn't carry over. I can't pass this arm without the thing under test, and neither can anything else.
- **Waveform → fundamental.** No leak beyond the cycles themselves, which *are* the thing under test. All five fundamentals peak at 0.900, and the envelope, click and gate are identical. The screenshot of a trial at 760 px shows the cycles plainly countable from 0 to about 450 ms. So this arm can come out against the notes for a careful reader. That is the point of the remake note above, not a leak.
- **The page's text.** "60 Hz" and "time 0" are each one choice in five, drawn by `pick` (`Math.floor(Math.random() * list.length)`). Answering them every time scores as guessing.
- **Arms matched, chance right.** All four arms have six trials and five choices, and truth is drawn uniformly, so chance is 1 in 5 per trial whatever a guesser's strategy. I recomputed the binomials: P(≥4 of 6) = 1.696%, P(≤2) = 90.11%, P(3) = 8.19%, and a guesser passes at least one of four arms 6.61% of the time. All are stated in the rule before trial 1, all four arms are scored, and the verdict rule is one-sided per arm.

## The checks I ran

- The page's check, `… — rich — check.mjs`: **26 passed, 0 failed**. It returned waveform → fundamental 25/25, worst 0.032 Hz; spectrum peak 0.66–0.91 Hz high; onset 0.012 ms; gap 2.71e-9 dB; 60 vs 65 Hz 23.1 dB; cut at 450 ms 51.8 dB at 60 Hz (52.6 worst); onset procedure 5/25 whole, 25/25 cut; rebuild 7.6e-13; magnitude-only 2.3e-13; windows 4.69 ms/37.28 Hz, 18.75 ms/0.247 Hz, 84.38 ms/0.741 Hz; headless Chromium made no AudioContext before a click, ended 24 trials in the table, console clean.
- `conform.mjs`: the piece is introduced, declares nothing, flow. **0 errors, 0 warnings** at 760 and 1130 px. The maker's one file-local warning (untracked) is gone, because the piece is now tracked.
- `fingerprint.mjs`: Teaching Notes `fef02ecc0fc5`, one piece, in step.
- The rich server, `?entry=Frequency Domain ↔ Perspective Shift`, headless Chromium at 1130 px: one piece frame, the proposal chip shown, nothing in Lost its place. The iframe sized to 1223 px with no "reported no height". The console had one line, the server's Permissions-Policy 'bluetooth' header warning, and nothing from the piece.
- Sound and hush, in the face: no AudioContext until Play. After Play the context was `running`, and after the page was hidden it was `suspended`. The piece has no `rich:hush` comment and no detached `new Audio()`. Changing step calls `stop()`. Not heard: no agent can listen, so the kick's sound and the two rebuild playbacks are unverified by ear.
- Materials: everything inline, synthesized, nothing licensed, no CDN, no fonts fetched.
- Sibling: Frequency-Time Duality's face walks the delay-time axis, the modulation rate and Karplus–Strong. Nothing here remakes any of it.

## The offers

1. **Teaching Notes · claim-change → demoted to no-claim-edit.** The numbers reproduce: 25 of 25 within 0.032 Hz, and 1/60 s is 16.7 ms. But first ask what kind of claim the sentence is (tuning 12a). "Ask: what's the fundamental? Answer: can't tell from waveform" describes a classroom moment. A student looks at a DAW waveform of a kick, at the zoom a DAW draws, and can't name the pitch. That is a claim about a reader at a glance. No reader has run the arm, so it isn't refuted. The 25 of 25 is on the maker's own clean-sine kick family (tuning 12d). The same procedure reads 5 of 25 on the same kick with a 2% noise floor, or with an 80 ms glide. A recorded kick's tail is rarely that clean. The proposed wording ("Not at a glance. Zoom into the tail and count: one cycle every 16.7 ms is 60 Hz.") is a good teaching move and its arithmetic is right. Whether the demonstration should teach cycle-counting is Loudon's taste, not a correction of a false sentence.
2. **Teaching Notes · no-claim-edit → finding confirmed, wording disputed in part.** I got the same numbers: 2.71 × 10⁻⁹ dB across onsets, 5 of 25 whole-clip, 51.8 dB and 25 of 25 cut at 450 ms. The null is the shift theorem computed in floating point. While the whole kick sits in the clip it cannot fail, and only a bug would have shown a gap. The cut control is the one that could fail, and it parts the onsets by 51.8 dB, so the measure and the procedure are not blind. The wording is the problem. A DAW analyzer is a short running FFT, not one spectrum of the whole clip. Watched while the clip plays, it carries the when in when the picture moves. I took a 125 ms (4096-sample) frame, the size a DAW analyzer uses, and its loudest frame lands at 31, 125, 219, 313 and 438 ms for onsets 0 to 400 ms. It tracks every one, and the piece's own step 5 shows the same. So "the when is in the phase it leaves out" is true of one frozen spectrum of the whole clip and not of "the analyzer". Suggested instead: "Can't tell from one spectrum of the whole clip. It draws each frequency's size; the when is in the phase it leaves out."
3. **The Technical Side · no-claim-edit → confirmed, as a clarification.** "No information is lost" is true of the transform. The 7.6 × 10⁻¹³ (and the 2.3 × 10⁻¹³ magnitude-only identity) are FFT round trips that can't fail (tuning 12c). They show the code is right. They are not evidence for the page's claim, which is a theorem. The edge is real: the analyzer's picture keeps only the size. The page's own verbs already draw that line, "shows" in Teaching Notes against "contain" in The Structural Identity. So the edit makes explicit what the page already distinguishes. It is optional, and the row "Both views contain same information" is right as written if "view" means the complex spectrum.

## The face as a whole

This face makes the page's idea felt rather than busy. One kick is drawn twice from the same samples, and moving the onset leaves the spectrum perfectly still while the waveform slides. You see the demonstration's point before anyone says it. Step 4 earns its place: rebuild from the magnitude alone and every onset collapses to one pulse at zero. That shows where the when went, and it squares the Teaching Notes with The Technical Side better than either sentence does alone. The test is honest and leak-free, and its two "can't" arms split as they should. One is strict by theorem. The other is countable on this kick at this zoom, a real finding about the demonstration. The remake asks only that the piece say whose kick that finding was measured on, and that a low score on a "can't" arm not be labelled support.
