---
title: "Tract Mirror — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Tract Mirror]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Tract Mirror's proposed rich face: every piece judged for test, fidelity and walk-up, every offer recomputed, so Loudon reads a face that has already been argued with."
---

# Tract Mirror — rich — challenge

Challenger, proposal round, 2026-11-03, on the maker's commit 5f0dc415 in the worktree `enrich/tract-mirror`. Judged from the page, the pieces and the commit body; I did not make this face.

**Tally: 7 keep, 1 remake, 1 retire.**

## The pieces

### Section "Tract Mirror"

**`Tract Mirror — rich — junction to mirror.html` · remake (wording only, one round).**
1. *Test or decoration?* A test. Step 5 runs Levinson-Durbin on the tube's own click and compares the ladder it reads back to the area-ratio k. It could have come out the other way, and in the shipped model it does. That is the page's central claim ("the LPC lattice filter's reflection coefficients *are* the impedance mismatches") put to the question, and it found a condition the text lacks.
2. *Faithful?* The numbers are, and the piece holds the contradiction rather than smoothing it. Two sentences say more than the engine shows:
   - **"Same sound, sample for sample" hides a fitted gain.** `TM.sameSound` fits one gain before it measures the miss. In the ideal tube the gain is 1.000000; as shipped it is **0.2497 on /a/ and 0.1530 on /o/**, so the read-back tube is about 12 dB and 16 dB louder for the same click. The shape of the sound is identical to 10⁻¹³; its level is not. The step 5 text (html line 650), the `#r5same` cell label ("the two tubes' sounds differ by", line 208) and the manifest caption should say "the same sound once one overall level is matched" and print the gain. The A/B buttons are fine as they are: the level follower already evens them out, and a note can say so.
   - **"Depends on what you assume about the ends" leaves out the walls.** The wall loss alone breaks the identity as hard as the leaky glottis does (numbers under the offers: loss 0.996 alone gives /o/ a 0.628 gap). Line 650 should read "what you assume about the ends and the walls".
   - Optional: the lip rung's −0.738 is no accident. It is exactly 0.97 × 0.9 × 0.996⁴² (= 0.73775), the whole round trip's end and wall losses gathered into the last rung. One clause would turn a strange number into a reason.
3. *Walks up?* Yes, cleanly. Step 1 is one joint alone (k from two areas, pressure and power split, a click and its echo). Step 2 is a straight tube with only its ends reflecting. Step 3 is shape → k → formants, step 4 the morph, and the test is step 5. The rail stays open, Back and Next work, and changing step stops the sound.

Runs clean: no audio context before a click (0 in every frame), the context was suspended on a simulated hide, the console was empty, and the fetch of vowels.json loaded on the piece origin (the fallback note stayed hidden).

**`plugin/test-renders/harness_melody.wav` · keep.** Margin, beside "shipped as a VST3/AU plugin". It is evidence, not a test: the plugin's own C++ engine singing. The caption says plainly that it comes from the offline harness, not from Live, and that matches `plugin/src/RenderHarness.cpp:7,163` (default params, glide and vibrato on; the file is 48 kHz, 3.9 s). It makes "voice synthesizer" heard where the text only says it.

**`artifacts/the-mirror/index.html` · keep, with a note.** The build's full instrument, gathered with a contract. Met cold it opens on the end of the proof, but here it sits after the walk, and step 5 links to it, so the walk is its way up. It runs clean and makes no sound before a click. Note: at 1600 px, and anchored to the same paragraph as the 1150 px walk, it makes that paragraph the heaviest place on the face, and it still carries its first-version review panel (conform's review-layer warning). The caption is honest about the panel. Loudon may want it collapsed or set lower; that is taste.

**`renders/clips/clip_tube_morph.mp4` · retire.** It does less, at nearly the same anchor, than step 4 of the walk, which plays the same /a/→/i/→/u/ morph live, draws the k at every joint and tests that the k are recomputed from blended areas. Ten seconds of silhouette with F1/F2 on it is decoration next to that. Its caption's "the synth's own sound" is also loose: the clip comes from `renders/make_clips.py`, which builds on `kl_reference` (`make_clips.py:30`), the Python reference, not the plugin.

### Section "Architecture (decided 2026-06-09)"

**`reference/renders/tube_profiles.png` · keep, caption note.** It shows the single source of truth the section names: six 64-point curves. One precision: "these 64-point curves are the whole of what the optimizer chose" is a little off. The optimizer chose 19 cosine coefficients per vowel (`reference/fit_vowels.py:6,38`), clipped at 12 cm² (`fit_vowels.py:37`); the flat tops on /a/, /i/, /o/ and /u/ are that clip. A better line: "the optimizer chose a cosine series; these 64 points are what it draws, clipped at 12 cm²".

**`renders/clips/clip_glottal_source.mp4` · keep.** The text names "glottal pulse + aspiration noise excitation" in one phrase; this is the only piece that isolates the source with its spectrum (step 2's "buzz alone" is sound without a picture). The frame at 5 s matches the caption: one period, tension 0.62, breath 0.05, the tilt and the noise floor.

**`reference/renders/vowel_a.wav` and `plugin/test-renders/render_a.wav` · keep both.** As a pair they are a real ear test of the single-source claim: different code, rate and section count (44.1 kHz / 22 against 48 kHz / 24), the same tube. The captions check out: `make_renders.py:90,95` (110 Hz, vibrato 0.6 %); `RenderHarness.cpp:5,89-92` (vibrato and breath zeroed); `plugin/CMakeLists.txt:18-25` embeds `reference/vowels.json`. I re-checked the "both web artifacts carry them identical" clause: all six 64-point curves and all five constants are present in both `artifacts/the-mirror/index.html` and `plugin/gui/index.html`.

**`renders/ableton-proof.png` · keep.** It backs "Verified in Ableton Live 12". The caption is careful: it names the VST3 as what was loaded and the AU as what passed auval, which is exactly the build log. The image shows what the caption says: plugin mode, the puck at /i/, r_g +0.97, r_l −0.90.

## Checks run

- `node _ops/rich-face/conform.mjs "Tract Mirror"`, browser pass at 760 and 1130 px: **errors 0, warnings 3.** These are the-mirror's review-layer warning and the walk's two sandbox-blocked warnings (the opaque frame can't fetch vowels.json; the piece falls back to a copy its checks hold identical). The maker reported 4; the fourth (face file-local) is gone now that the commit tracks the piece.
- `node _ops/rich-face/fingerprint.mjs "Tract Mirror"`: both sections **in step** (d610b763fa4a, bed9ca62e72c).
- The maker's checks, `Tract Mirror — proof — junction to mirror checks.mjs`: **all PASS** (60 claims), including the engine's click against `KellyLochbaumTract` (3.9e-16 of peak).
- My own recompute, independent of the JS engine: Python through `reference/kl_reference.py`'s `tract_impulse_response` and `levinson_durbin`, order 44, 2¹⁹-sample impulse responses. Results under the offers.
- Rich face served on a leased rich-server and walked in headless Chromium through all five steps, both models, /a/ and /o/: **console empty**; three frames, no AudioContext before a click; the walk's context went `running` → `suspended` on a simulated hide. Server stopped.
- Every file the manifest names is git-tracked. Nothing licensed is copied.

## The offers

**1 · LPC recovers the tube exactly only in the ideal tube: confirmed, and sharpened.** Python recompute through kl_reference:

| model | /a/ | /e/ | /i/ | /o/ | /u/ | schwa | lip rung |
|---|---|---|---|---|---|---|---|
| ideal (glottis +1, no loss) | 7e-15 | 3e-15 | 5e-14 | 3.6e-12 | 2e-14 | 3e-31 | −0.9000 |
| shipped (+0.97, 0.996) | 0.254 | 0.124 | 0.117 | 0.612 | 0.158 | 7e-17 | −0.7377 |
| glottis 0.97 only | 0.282 | 0.089 | 0.076 | 0.401 | 0.042 | 2e-17 | −0.8730 |
| loss 0.996 only | 0.153 | 0.111 | 0.109 | 0.628 | 0.173 | 9e-17 | −0.7606 |

The maker's six shipped gaps reproduce to three decimals, and every odd rung is 0. Two things to add before it goes to Loudon:
- The condition is two conditions. Either one alone breaks the identity, and they don't simply add: the leak alone gives /a/ a bigger gap (0.282) than both together (0.254). The offer should name a closed glottis **and** lossless walls.
- "Makes the identical sound" holds only up to one overall gain (0.250 on /a/, 0.153 on /o/ as shipped). The lip rung is exactly rg·|rl|·L^(2(N−1)) = 0.97 × 0.9 × 0.996⁴² = 0.73775.

The bearing on the v2 analysis engine stands, and is if anything stronger: a singer's tract read back from their sound will draw both glottal leak and wall loss as shape.

**2 · "Verified in Ableton Live 12, VST3 + AU" says more than the log: confirmed, with one addition.** `Tract Mirror — build plan — JUCE VST.md:63` has the AU passing auval; `:68` has Live listing both formats, then "VST3 loaded onto a MIDI track". No line records the AU loaded in Live. Addition: `:82` (Phase 5) says "In-Live MIDI re-verification pending", and `Tract Mirror — scroll.md:47` says the MIDI controls and Word mode "have not been played inside Ableton". So the Live verification belongs to the Phase 4 build of 2026-06-10. The offer's wording might carry that date: "Verified in Ableton Live 12 on 2026-06-10 (VST3; the AU passes auval)".

**3 · `clip_scattering_junction.mp4` mislabels its arrows: confirmed.** `renders/make_clips.py:519-520` sets transmitted = (1+k)/2 and reflected = |k|. The frame at 4 s reads k −0.090, "transmitted 45%" and "reflected 9%", which sum to 54 %. The caption calls this energy. The right figures at that k: pressure 0.91 on and −0.09 back; power 0.992 on and 0.008 back. The maker's choice to leave it off the face is right.

## The face as a whole

It makes the idea felt, not just busy, and the reason is the walk. The page asserts an identity; the walk builds it up from one joint, plays it at every step, then runs it backward and shows honestly where it holds and where it doesn't. That finding is the face's best gift to the page. The Architecture margin is the build's own evidence set beside the claims it backs: the A/B pair for the single source, the Live screenshot for "verified", the source clip for the excitation. It earns its place. The one place it tips toward busy is the opening section's second paragraph: walk, full instrument and morph clip all stacked under it. Retiring the clip helps. Whether the 1600 px instrument stays open there is Loudon's call. Not verified by me either: nobody has heard any of it. An agent can't tell whether the step 5 A/B sounds the same to an ear.
