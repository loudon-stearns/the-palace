---
title: "Waveguide Synthesizer — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Waveguide Synthesizer's proposal-round rich face: every piece judged with a reason, the maker's numbers recomputed from scratch, and the offers confirmed or disputed, so Loudon can approve section by section knowing what was checked."
---

# Waveguide Synthesizer — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, a different agent from the maker. Judged against the page as it stands (`Projects/Waveguide Synthesizer.md`, byte-identical to the merge base `ba4bce9a`), the manifest, every piece, and the maker's commit `a4c35df5` as its only account.

**Verdicts: 7 keep, 2 remake, 0 retire.** Both remakes are caption fixes in the manifest. No piece file needs to change.

## The pieces

### Why This Project Exists

**two travelling waves.html: keep.**
- *Test or decoration?* Test, twice. The strobe step (3) tests "the viewer is watching the synthesis happen". It finds the qualifier the page lacks: at pitch, the true state drawn every frame cannot show travel. The last step tests what "you pluck where you click" implies, and it would fail if the engine's pluck were wrong.
- *Faithful?* Yes. It draws real delay-line state in both views, and it says so. The panel names what is measured, "the wave at the bridge". One note for the text: |sin(kπp)|/k² is the rule for displacement. A body driven by the force at the bridge would hear |sin(kπp)|/k. The piece listens to displacement and says so, so it stays honest.
- *Walks up?* Yes. Two waves, then the ends, then too fast to see, then where you pluck, then the test.
- *The play-silent warning:* **keep, with a note.** Steps 1 and 2 are silent by design ("Hear: Nothing yet. This step is for the eye."), so conform's first click finds no sound. From step 3 a pluck posts `rich:play`, which I saw arrive in headless Chromium. One tension, held and not ruled on: [[Progressive Staging]] asks of each step "one thing to hear", and these two steps have nothing to hear. The concepts are visual at one sample a frame. If Loudon wants an ear in step 2, a cheap one exists: one fixed end and one free end sound an octave down with odd harmonics only.
- Placement, taste only: the pluck-position test serves the DSP section's Excitation paragraph as much as this one.

### The DSP: Digital Waveguide

**karplus-strong walked up.html: keep.** The best test on the face. It could have agreed with the page, and it doesn't. It walks up: a loop that only remembers, then the average, then each harmonic's decay, then the test. It is faithful: step 1 shows where the page's formula does hold, the bare loop, and the test step names both formulas. The page's "one-pole lowpass" against the piece's two-point average is named as an offer, not hidden.

**offline-v1/spacetime-strike-stiffness-0-vs-1.png: keep.** A record from the engine itself, beside the paragraph it gives evidence for: the sign flip at each end at stiffness 0, and the dispersion fan at stiffness 1. The caption matches the scroll's cycle 8.

**offline-v1.10/ladder-sheet.png: remake (caption only).** The caption says "Every bar was checked against the sound's own peaks, within 0.26 cents." The steward's own words (scroll, cycle 17) are "every bar loud enough to measure". `offline-v1.10/ladder-vs-sound.json` shows why that matters. For G3 at stiffness 1.0 it checked 6 bars, and overtone 16, whose +1195 the caption quotes, is not one of them. The ladder says +1194.7 and the sound says +1187.8. The fix: put back "every bar loud enough to measure", or quote overtone 16 as the ladder's number, with the sound at about +1188. Every other number checks: +1.6, +35.2, +245.2, +1194.7 (ladder) for overtone 16, and +476.0 for overtone 8 at 1.0.

**offline-v1.10/stiffness-tour.wav: keep.** It lets you hear the dispersion claim, from the same engine the ladder measures. The caption matches `stiffness-tour.json`. The first four notes are 2.25 s apart, not 2, which is close enough.

**offline-v1.8/bridge-feeds-body.wav: keep.** Numbers confirmed in `offline-v1.8/body-levels.json`: a rigid bridge rings 2.98 s, and a bridge at 0.90 rings 0.2 s. The caption says outright that the board is a modal plate, not a branching waveguide. That is the right qualifier beside the page's "branching waveguides (a body resonator)".

### The Interface: 3D Waveguide, Visible

**study-v1.13-the-hair-holds-at-half/index.html: remake (caption only).** The caption ends: "it loads Three.js from unpkg, which is not on the rich face's library shelf." That is false. Both of its scripts are on the shelf, with matching SRI hashes, and have been since `fca09879` (2026-10-21):
- `https://unpkg.com/three@0.128.0/build/three.min.js`
- `https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js`

contract.mjs takes its script origins from the shelf, so unpkg is in the piece CSP. Framed at `/rich/`, the study loaded and drew with a clean console; the only messages were WebGL "GPU stall due to ReadPixels" performance warnings. **There is no public-face problem to name.** The fix: replace the clause with "both pinned on the shelf". As a gathered record, with the instructions to play it and an honest account of how it was built, it is otherwise a keep.

### Forward Vector

**rich-face/lesson-run.mp4: keep.** The only way a reader without the study sees the seven-stop lesson the section names. It is tracked, copied under `rich-face/` the way the README asks, and 4.4 MB. Note: it runs 116.4 s by its metadata, against the caption's "about 112 s", which came from the scroll.

**offline-v1.12/lesson-sheet.png: keep.** Every stop on one sheet, beside the phrase it serves. Note: "after the hand" is the scroll's shorthand. "each stop after a hand has done it" reads plainer.

## The offers

1. **DSP pitch formula (claim-change): confirmed, with one cite to fix.** Derived: H(z) = ½(1 + z⁻¹) = e^(−jω/2)·cos(ω/2). Its phase is linear, so its delay is exactly half a sample at every frequency (checked numerically at ω = 0.01 to 2). One trip round the loop is therefore N + ½ samples, and f = fs/(N + ½). Analytically, fs/N reads 1200·log₂((N+½)/N) high: 42.749 cents at N = 20, 8.635 at N = 100, and 2.163 at N = 400. I wrote my own Karplus-Strong in numpy and measured it: 0.016, 0.0002 and 0.0000 cents from fs/(N+½), and the bare loop at 0.0000 cents from fs/N. The maker's figures (8.6, 42.8, 2.2) hold. **Disputed:** "The project's own cycle 8 found the same in Study v1 (+12.1 cents at 330 Hz)." Cycle 8 found two causes: the loop rounded down to a whole even number of samples, and the filter delay ignored. The +12.1 cents is sharp. An ignored filter delay alone makes the pitch flat, so the rounding dominated that number. Cite cycle 8 as naming the same hidden delay, not the same finding.
2. **"one-pole lowpass" naming (no-claim-edit): confirmed.** Karplus-Strong's filter is the two-point average, a one-zero lowpass. The project's sketch runs the average and then a one-pole (`sketch-karplus-strong/index.html`, the line `// average + LP + feedback` and `this.lp = a * this.lp + (1 - a) * avg`).
3. **Bow and body already built (claim-change): confirmed by reading.** The bow is scroll cycle 11 (v1.4). The body is cycle 15 (v1.8), "twelve resonant modes" fed from the bridge (study v1.13, the comment near its line 183): a modal soundboard, not a branching waveguide. There is no tube and no branching anywhere in v1.13.
4. **The strobe, and part of the loop off the string (claim-change): confirmed.** It is real, not a strawman. The page says "you see the wave propagate along the string, reflect" (line 52), "See the wave travel, reflect at the bridge/nut, and decay" (line 85), and "the screen only needs ~60 Hz" (line 78). It never says that at pitch the travel is visible only through a strobe or a slowed replay. At 60 frames a second: 200 Hz is 3.33 periods a frame, and 196 Hz is 3.27. The scroll's 3.7 at 196 Hz in cycle 8 looks like an arithmetic slip there, not here. "Up to about 70 samples" inside the allpass filters at full stiffness is cycle 8's own sentence.
5. **Built in raw r128, no R3F, no Tone.js (claim-change): confirmed by reading.** v1.13 loads three@0.128.0 and OrbitControls from unpkg (its lines 176–177). It has no React and no Tone. Its worklet is loaded from a Blob URL and talks by `port.postMessage`, with no SharedArrayBuffer, and its controls are plain HTML sliders.

## Checks run

- `node "Projects/Waveguide Synthesizer/Waveguide Synthesizer — rich — check.mjs"`: all claims hold (pitch at fs 44.1 and 48 kHz, N 20 to 400; decay at N 50, 100, 200; sign flips; pluck positions ½, ⅓, ¼, ⅕, 0.9, 0.37).
- An independent recompute in Python (numpy, float64), not using the pieces' engines: the averager's phase delay, the pitch, the per-trip decay (k = 1, 4, 8 at N = 100: −18.65, −49.14, −147.72 dB/s predicted and −18.65, −49.14, −147.73 measured), and the pluck harmonics. The missing harmonics come out near −335 dB in float64. The piece's "at least 170 dB down" is the float32 floor of its render buffer, so it is honest as a bound; the harmonics are exactly zero. The worst of the rest is 0.057 to 0.064 dB, matching the maker.
- `conform.mjs "Waveguide Synthesizer"`: 3 pages, all introduced, **0 errors**, 1 warning (play-silent on two travelling waves, judged above).
- `fingerprint.mjs "Waveguide Synthesizer"`: all four sections in step.
- `rich-server.mjs --detach`, then the face in headless Chromium at 1300 px. Three pieces framed `allow-scripts` on the piece origin, 9 proposal chips, no missing-file boxes. **Console clean** apart from the study's WebGL performance warnings. I drove travelling waves to step 3, plucked, and switched to the strobe ("drawn once every 240 samples, one later each time"). Step 5 at ⅓ read "3, 6, 9, 12, 15 … −173 dB … within 0.06 dB". Karplus-Strong's test at N = 20 read −42.77 cents from fs/N and −0.02 from fs/(N+½). `rich:play` arrived on each pluck, and `rich:hush` on each step change. Server stopped.
- All seven gathered files are tracked in git. The `.md` is unchanged.
- Not verified: anything by ear; behaviour at a real 60 Hz display (headless read "2.1 trips since the last picture" at its own frame rate); the public build.

## The face as a whole

It makes the page's idea felt, and in two places it does better than that: it corrects the page. The two made walks are real tests that start from nothing. Each could have confirmed the text, and each found where the text is loose: a half sample in the pitch, and a strobe the page never mentions. The gathered pieces are the project's own evidence, put where the text makes the claims they bear on, and their captions mostly say what was measured and what wasn't. The face is busy in one place: Forward Vector carries a two-minute video and a contact sheet of the same lesson. Both earn their keep, since neither the study nor the lesson can run for a public reader without them. The two remakes are small, and both are the same kind of slip: a caption saying a little more than the record does.
