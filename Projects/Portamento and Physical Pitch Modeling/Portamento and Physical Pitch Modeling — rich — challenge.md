---
title: "Portamento and Physical Pitch Modeling — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Portamento and Physical Pitch Modeling]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of the proposal-round rich face: a verdict and a reason for every piece, the checks run against it, and the six offers recomputed, so Loudon can approve section by section knowing what was tested and what was only gathered."
---

# Challenge — the rich face of Portamento and Physical Pitch Modeling

Challenger: claude-opus-5-5, 2026-11-03, against the maker's commit `725d109f`, judged from the page (`Projects/Portamento and Physical Pitch Modeling.md`), the manifest, every piece's source and the maker's commit body. Enrichment v2.8, proposal round.

**21 pieces: 21 keep, 0 remake, 0 retire.** Six keeps carry a note. Two notes are about a gap in the kit, not in the piece.

## The checks

- **The maker's check** (`… — rich — check.mjs`): all pass. It lifts each made piece's own `<script id="engine">` into Node. Closed form against RK4 on the page's equation: worst error 3e-12 Hz. Shares at ωₙ = 4, 8 and 30; first-swing size, time and side for ζ 0.1 to 0.9, gliding up and down; the bow-overshoot render.
- **My own recompute**, in Python, with nothing taken from the pieces: a separate bisection for the critical shares, and a semi-implicit Euler integration at dt = 1 µs for the peaks. Numbers are under § The offers. They agree with the check to the digits shown.
- **conform.mjs**: 10 pages, introduced 10, errored 0, **errors 0, warnings 13**: sandbox-blocked ×8 (quiz, paired exercises) and play-silent ×5 (reel, quiz, paired, mode-locking, loudness). Judged below.
- **fingerprint.mjs**: all seven sections with pieces are *in step*. The two sections without pieces (Cross-Domain Resonance, Suggested Explorations) have no stamp, which is right.
- **The face, headless Chromium**, served by `rich-server.mjs --root <worktree>` and scrolled so every frame loads: 21 figures, 21 *proposal* chips, none in *Lost its place*, no error boxes. Console clean, both on load and after clicking. Every frame reported its own height. Each of the 12 + 2 + 1 + 7 + 6 audio and image elements inside the frames loaded, with a duration or a size. The quiz and the paired exercises framed with `allow-same-origin` and drew their buttons from `manifest.json`.
- **Sound**: I clicked a start control on all seven sounding pieces. Both made pieces, the reel, mode-locking and loudness each posted `rich:play`. The quiz and the paired exercises played (their `Audio()` was running, at t ≈ 1.4 s) and posted **no** `rich:play`. With the reel playing, starting the quiz left the reel playing: two voices at once. The other way round works: starting the reel hushes the quiz. Hiding the page paused both.
- Sound starts only on a click in both made pieces: the `AudioContext` is created inside `ensureAudio()`, which only button handlers call. Neither piece copies any file. Both declare `piece:needs` empty, and every file a gathered piece loads is tracked and declared through its `contract`. Nothing licensed.
- Gathered captions checked against their sources:
  - three-glides: a coarse pitch track of the wav gives the order linear, overdamped, underdamped, with the third peaking near 459 Hz at 20 ms resolution, against the caption's "about 465". Fine.
  - ear set #10: ζ 0.3, ωₙ 12, 220 → 329.63 Hz, "overshooting from below" (`curated-ear-set/manifest.json`).
  - spectrogram #10: an STFT (`curated-ear-set/render.py:153`), as its caption says.
  - multi-mode: 27.6 → 105.49 and 27.6 → 6.98 cents, ζ 0.55 and K = 9 (`multi-mode/manifest.json`).
  - tool-10: has presets, as its caption says.

## The pieces

Each piece is held to three questions. **Test**: does it test the claim or decorate it? **Faithful**: is it true to what the text says? **Walks up**: does it open on one concept and reach the test last?

### Portamento and Physical Pitch Modeling (the opening)

- **`proofs/2026-05-04-three-glides.png`: keep.**
  - Test: illustrates the three characters the opening names.
  - Faithful: yes. It is the project's own proof, captioned accurately.
  - Walks up: not applicable to a single figure.
- **`proofs/2026-05-04-three-glides.wav`: keep.**
  - It makes the three characters heard, which the text can't do.
  - The caption's order (linear, overdamped, underdamped) is confirmed from the file's pitch track.

### The Physical Reality of Portamento

- **`curated-ear-set/audio/10-underdamped.wav`: keep.**
  - Test: nearly a test. It is the bundle's own singer model, and it overshoots from *below*, against the paragraph's "from above" (line 61).
  - Faithful: the caption says so plainly, says it is a model and not a singer, and doesn't smooth over the disagreement.

### The Second-Order Physical Model

- **`… — rich — critical glide walked up.html`: keep, with a note.**
  - Test: yes. It could have come out ~95% if the page were right, and it measures 59.4%.
  - Faithful: it quotes line 107 verbatim and shows the disagreement as a disagreement.
  - Walks up: yes, in four steps. A first-order glide alone, then inertia, then the one clock 1/ωₙ, then the test. Each step plays.
  - Note: the caption puts *"Three time constants to 95%"* in quotation marks, but the page never says that. It says "two settling times". Drop the quotation marks, or write "the first-order rule, 3τ to 95%", so no reader thinks it is the page's phrase. Where the page's sentence came from is the maker's guess, and the offer rightly says "likely".
- **`… — rich — overshoot walked up.html`: keep, with a note.**
  - Test: yes. Size and side are both measured from the integrated equation, up and down. The perceptual claim ("apparent for ζ < 0.5") is honestly left to the ear, and the threshold test is named for it.
  - Faithful: it quotes lines 119–123.
  - Walks up: yes. Landing exactly with the note held underneath, then a looser spring, then the size of the swing as a sweep, then the side as the test.
  - Note: step 4's *hear* line says the glide "settles into unison at the top of its swing". It only touches unison at the turning point. "Meets it in unison for an instant" is truer, and matches the step's own *say* line.
- **`curated-ear-set/single-session-reel.html`: keep.**
  - It is the forward vector's own test (named by ear in one sitting), gathered as a record.
  - The play-silent warning was conform's click missing a native `<audio controls>`. A click on the control posts `rich:play`.
- **`curated-ear-set/paired-exercises.html`: keep, with a note.**
  - It is the forward vector's "pairs", eight of them.
  - The sandbox-blocked warnings are conform's opaque load only. Live, the frame gets `allow-same-origin` and loads its manifest.
  - Note: the play-silent warning is **real** here. Sound plays through a detached `new Audio()` (line 320), and the kit doesn't announce it, so starting a pair doesn't hush another piece. Hush on hide and hush from another piece both work. The fix belongs in the kit: hear `HTMLMediaElement.play()` on an element never put in the page. Don't edit the gathered record.

### Wavelet Analysis for Pitch Trajectory Understanding

- **`curated-ear-set/spectrograms/10-underdamped.png`: keep.**
  - Shows ridge and ripple.
  - The caption says honestly that this is an STFT, not a CWT, and that the bundle has no wavelet render. That itself shows something the section takes for granted.
- **`curated-ear-set/quiz.html`: keep, with a note.**
  - It drills the section's "Pedagogical Use": hear it, name it, then see the spectrogram.
  - Note: the same as the paired exercises. A detached `new Audio()` (line 333) posts no `rich:play`. I confirmed the reel kept playing under it. It's a kit gap, and the record stays as it is.

### Coupled Modes and Real Instrument Complexity

- **`multi-mode/audio/01-ideal-harmonic-control.wav`: keep.** It is the control the two stiff-string clips need.
- **`multi-mode/audio/02-slide-up-the-neck.wav`: keep.**
  - Test: yes, it's what tests line 181. Its numbers (27.6 → 105.5 cents) are the study's own.
- **`multi-mode/audio/03-bend-into-tune.wav`: keep, with a note.**
  - Test: yes, it is the other half of that test.
  - Note: the caption calls the tension bend "the bell-to-harmonic glide the paragraph describes". The paragraph is about a length change (line 179), and a slide *down* the neck (the string getting longer) also compresses the partials. So the paragraph's sentence fits a length change too, in one direction. Name both: "a bend, or a slide down the neck".
- **`multi-mode/figures/coupling-ab-spectrogram.png`: keep.** It shows the Kuramoto paragraph's claim in the study's own render. The caption matches the manifest (ζ 0.55, K = 9).
- **`multi-mode/audio/04-fast-glide-uncoupled.wav` and `05-fast-glide-locked.wav`: keep.** An A/B pair that could have failed: if coupling did nothing, they would sound the same.
- **`multi-mode/mode-locking-listening.html`: keep.** The play-silent warning was a missed native control. Clicked, it posts `rich:play`.

### Artifacts and Interactive Exploration

- **`portamento-tool-10.html`: keep.** It works as evidence, not decoration. Set beside line 201, it shows the list doesn't describe the file. The caption is exact: silent, a PD controller, presets for overshoot.

### Open Questions

- **`zeta-over-time/zeta-over-time.html`: keep.** It is question 1, rendered as asked: C3 → G3, an exercise.
- **`threshold/overshoot-threshold.html`: keep.** Question 2 as a measurement: a staircase, then *alive or sour*. The caption is honest that nobody has taken it yet.
- **`multi-mode/loudness-listening.html`: keep.**
  - It is question 3's progress note made audible. Slipping partials 2, 3 and 6 by bow strength match `multi-mode/loudness-manifest.json` and the page.
  - The play-silent warning was a missed native control.
- **`model-fitter/fit_validation.png`: keep.** The caption says what the validation does and does not show: synthetic only.

## The thirteen conform warnings

Keep all thirteen, each with a note.

- **sandbox-blocked ×8 (quiz, paired).** These are conform's opaque-origin load, as the maker said. On the live face both frames get `allow-same-origin` and load `manifest.json` with a clean console.
- **play-silent ×3 (reel, mode-locking, loudness).** conform's click missed a native `<audio controls>`. A real click posts `rich:play`.
- **play-silent ×2 (quiz, paired).** These are **not** a missed click. The click found the start control and the sound played, but a detached `Audio()` isn't heard by the kit, so neither page takes the one voice. The maker's account ("the click did not find their start controls") is right for three of the five and wrong for these two.
  - None needs a remake: both are hushed on hide and by any other piece's start.
  - The kit gap is worth one line in `_ops/rich-face/README.md` § Making pieces, or a kit fix, because it will recur on every gathered page built the same way.

## The offers

All six are real. Four correct a fact. Two are a matter of emphasis.

1. **Critically damped, "2/ωₙ … ~95%" (line 107): fact, confirmed.**
   - It is the page's own sentence, verbatim: "Two settling times (1/ω_n each) = 2/ω_n total time to reach ~95% of target."
   - 1 − (1 + ωₙt)e^(−ωₙt) at ωₙt = 2 is 1 − 3e⁻² = **0.59399**. 95% comes at **4.7439/ωₙ**, 98% at 5.8339/ωₙ. On 220 → 330 Hz the pitch at 2/ωₙ is 285.3 Hz, **251.7 cents** under the note, and 29.1 cents under at the 95% point.
   - Calling 1/ωₙ a "settling time" is the language of a time constant, and the first-order rule gives 86.5% at 2τ and 95.0% at 3τ. The page's 95% matches 3τ, not 2. The offer's "likely where the sentence came from" is a reasonable guess, labelled as one.
2. **The sign of f_max (line 121): fact, confirmed.**
   - At t = π/ω_d, cos = −1 and sin = 0, so the peak is f_target − (f₀ − f_target)·e^(−πζ/√(1−ζ²)).
   - For 220 → 330 at ζ 0.3, share 0.37233: **370.96 Hz** (numeric peak 370.956 at t = 0.27444 s = π/ω_d). The page's form gives **289.04 Hz**.
   - The bundle's bow-overshoot is a different case, ζ 0.2, 196 → 330, ωₙ 6 (`multi-mode/locking-manifest.json`). The corrected form gives **400.57 Hz** against the render's **400.6**; the page's gives 259.43. Same verdict from an independent render.
   - "Maximum" is also only right going up.
3. **ζ = 0.3 overshoot "~36%" (line 123): emphasis, a rounding. Confirmed as a no-claim-edit.**
   - e^(−0.3π/√0.91) = **37.23%**. At ζ 0.7, **4.60%**, so "~5%" stands.
4. **"from above … arrive sharp" (line 61): fact, about the model's own logic. Confirmed.**
   - An underdamped landing from above swings below the note. 330 → 220 at ζ 0.3 reaches **179.04 Hz**, **356.6 cents flat**.
   - So "overshoot", "from above" and "sharp" cannot all hold on this model. The bundle's own singer render (#10) overshoots from below.
   - What real singers do is not settled by any of this. Both of the offer's suggested edits are consistent; which one is true is a question about voices, not about the equation.
5. **portamento-tool-01 … 10 (line 201): fact, a record check. Confirmed.**
   - The `<title>`s, in order:
     - 01–03: PID Portamento Visualizer, (Fixed), (Stable)
     - 04: PD (Stable)
     - 05: PD Debug Mode
     - 06: PD Ultra Stable, headed "Simple Portamento"
     - 07: Exponential Smoothing
     - 08: Exponential + PD
     - 09: Pure PD (Derivative on Measurement)
     - 10: PD FIXED, headed "Corrected"
   - In all ten, zero `AudioContext`, and none of wavelet, spectrogram, bell, Kuramoto, quiz, vocal tract or string bend.
   - `curated-ear-set/README.md:49–50` does call Tool-10 "Damping Regime Ear Training". The earliest commit on the files is `a46062ea` (2026-05-28, the bundle migration).
   - Small nit: 08 is an exponential + PD hybrid, so "PD (04–06, 08–10)" folds it in a little loosely.
6. **Bell to harmonic (line 181): emphasis, not a wrong fact.**
   - The study's numbers are as the offer says (27.6 → 105.49 cents sliding up, 27.6 → 6.98 by tension). The physics is right: at fixed tension B grows as the string shortens, and raising the tension lowers it.
   - But line 179 names a length change without a direction, and "a slider … *can* end nearly harmonic" is true of a slide **down** the neck. So the sentence is incomplete, not backward. The offer's "the paragraph's own example" reads in an *up* the text doesn't say.
   - Suggested text: "A slide down the neck, or a bend that raises the tension, can begin bell-like and end nearly harmonic as the modes compress; a slide up the neck does the opposite."

## The face as a whole

The face makes the page's idea felt rather than busy, and it is unusually honest about where it disagrees with the text. The two made walks are real tests. Each opens on one idea you can play and ends on a sentence of the page that a measurement could have upheld. Both times the measurement didn't uphold it: once on a number, once on a sign. The page's central claim, that pitch *is* the trajectory of a second-order system, comes out stronger for it, because the equation itself is what corrects the prose.

The gathered set does the forward vector's work without new building. The reel, the pairs, the quiz, the threshold staircase and the ζ-over-time exercise are the "listening exercises" the page asks for. Nobody has listened to them yet, and every caption says so.

The weight sits heavily on The Second-Order Physical Model (four pieces, two of them long) and on Coupled Modes (seven). The opening and The Physical Reality section have one or two quiet pieces each. That is fair to where the claims are, but a reader scrolling the face meets long stretches of correction. Loudon should hear the overshoot sweep and the cut-short leap before approving. Whether those are audible is the one thing no check here could settle.
