---
title: "Semantic Webcam — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Semantic Webcam]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Semantic Webcam's first rich face, made in the 2026-11 proposal round: one verdict per piece with its reason, each offer recomputed, so the maker can act and Loudon can approve without redoing the work."
---

# Semantic Webcam — rich — challenge

Challenger · claude-opus-5-5 · 2026-11-03 · against the maker's commit b181588a, the page `Projects/Semantic Webcam.md`, the manifest and every piece it names. The maker's commit body was the only account I read.

**Verdicts: 4 keep, 1 remake, 0 retire.**

## The pieces

### The line of iterations — `03-character-multiply-cam.html` (gathered) · keep

- **Test or decoration?** Neither, quite: it is the thing the bullet names, live on your face. That is what a gathered card is for.
- **Faithful?** The caption says "brightness picks the glyph", which is what the source does (03:259–268). It does not repeat the page's "multiply".
- **Walks up?** It is a whole cam, not a walk; that is right for a gathered card, and the ramp piece is its walk.
- Camera grant is in `_ops/rich-face/grants.json` (line 20). Conform: 0 errors.

### How it works — `Semantic Webcam — rich — the ramp.html` (made) · keep, with a note

- **Test or decoration?** A test. Step 5's in-band half could have come out the other way: if 03 multiplied, the word band would follow the light (it does at +0.53 when the piece makes it multiply) instead of sitting at +0.03. That is the measurement behind offer 1.
- **Faithful?** Yes. Where the piece disagrees with the section (multiply, near-still), it says so in the frame and leaves the claim to an offer. The engine is 03's: I read its `draw` (ramp:316–326) against 03's draw loop (03:250–268) by hand — same alphas (0.80, 0.86, 0.94), same ▓ whitening, same tile mix, same letter at rgba(8,8,12,0.92), same skip below 0.07. Contrast 1.5 and gain 1.3 match (03:104), and the smoothing runs after the contrast as 03 does (03:180–184). checks.mjs holds the typeset function to 03's own on 480 of 480 rows.
- **Walks up?** Yes: a grid of greys, the ramp, words into runs, smoothing, then the test, last. The rail stays open.
- **The note — the squint test as a design.** The whole-frame half is a weak test. Its control, the same cells shuffled, only rules out a frame that ignores the light, and any frame whose tiers rise with the light passes it. I measured three more frames on the Hopper still (squint 1): the six tiers drawn as a plain staircase, **+0.98**; 03 with the word band drawn as one flat grey, **+0.78**; 03 with the word band left empty, **+0.69**. Against 03 as built, **+0.87**. So the +0.87 is the tier ramp, not the words. The words do better than a flat or empty band, and worse than a clean staircase. The piece's own verdict line already says "the tiers carry the picture", so nothing is overclaimed. The next round should add the staircase and flat-band rows to step 5's table, so the whole-frame number can tell you something. Smaller: step 4's title, "Smoothing holds the words still", states the claim the step then measures against (27% change at 03's default). A question would sit better, or "calms".
- Runs clean. No sound, and no camera; step 4's noise loop runs on animation frames, so it stops on a hidden tab.

### Lost branches — `Semantic Webcam — rich — legibility band.html` (made) · remake

- **Test or decoration?** A test: step 5 sets words picked by ink beside 03 as built and beside light alone, and could have shown words matching light.
- **Faithful?** Not in its headline numbers. Step 2 measures each capital in **03's ink box** (26 px type in a 24 × 32 box, 03:110–115), and the caption and step 5's verdict call that "0.11–0.23 **of a cell**". 03 never draws a letter in that box. It draws type 1.22 times the cell (03:229), and the ink table is never read (offer 1). As 03 draws, a capital covers **0.12–0.38** of a 9 px cell (0.14–0.35 at 15 px, 03's live cell). Read back off the drawn Hopper frame, letter cells sit at **0.15–0.34** (5th–95th percentile, median 0.24), and white tiles with a letter punched in at **0.69–0.87** (median 0.78), not 0.77–0.89. Step 3's `light(tile) = 1 − ink(c)` also leaves out the tile's amber-to-white tint (wmix 0.6–1, 03:251) and the letter's 0.92 alpha.
- **Walks up?** Yes: one letter, the alphabet, inside out, the curve, then the test.
- **What to remake, exactly.** Measure ink in the drawn cell (03's 1.22 type, clipped to the cell). Or keep the box and label every number "of 03's measuring box", and add the drawn band next to it. Read both bands off the drawn frame in steps 2–3, not from 1 − box ink. Then carry the new numbers into the caption, step 5's verdict, and offer 3. The shape of the answer holds and needs no change: two bands, a flat curve across the word band (bin range 0.061, means 0.16–0.22), and in-band tone that is faint (ink-picked +0.23 against built +0.03).

### Lost branches — `08-tonal-bench.html` (gathered) · keep

- A real test with a real control: a random-target walk that keeps everything but the light. The caption's numbers (+0.02 → +0.49, control +0.00; patch +0.04 → +0.17; 48 renders) match the scroll's own table for cycle 10. Placed beside the made piece, it answers what that piece leaves out: grammar kept. Contract: nothing; conform 0 errors.

### Forward Vectors — `07-anatomy-cam — proof frame.png` (gathered) · keep

- An illustration, not a test: it shows where "detect true eyes and fingers" went. That is fair for a gathered figure under a forward vector. The caption is honest that the features were placed by hand and nobody has sat in front of card 07.

## The checks I ran (in the worktree)

- `node "Projects/Semantic Webcam/Semantic Webcam — rich — checks.mjs"`: **26 of 26 pass.** Hopper: whole +0.874, shuffled −0.006, band built +0.034 (slope 0.030), band multiplied +0.526 (slope 0.175, whole +0.819), ink-picked +0.230, curve range 0.061, churn 62% / 27% / 6%, tiles 45% of light. Letters 0.111–0.233 (box). Waves: same pattern.
- `node _ops/rich-face/conform.mjs "Semantic Webcam"`: **4 pieces, 0 errors, 0 warnings** (browser pass at 760 and 1130 px). The maker's two untracked warnings are gone now that the pieces are committed.
- `node _ops/rich-face/fingerprint.mjs "Semantic Webcam"`: all four sections **in step**.
- Served with `rich-server.mjs --root <worktree> --detach` and opened `?entry=Semantic Webcam` in headless Chromium. **Console clean.** 4 iframes plus the PNG, 5 proposal chips, nothing in *Lost its place*, no unresolved file. Then `--stop`.
- My own measuring, on the pieces' engine in headless Chromium (script kept in the session scratchpad, not the bundle): drawn-cell coverage, the light read back per tier, the three extra squint frames, and churn with the reseed effect isolated and σ and smoothing swept.
- Read by hand: both pieces' `sw-engine` scripts hash the same (71f0fb0a…). 03's `ink()` (03:124) has no caller: `measureInk` fills the table in `buildInk` and nothing reads it in `render`.
- Nothing licensed is copied. The Hopper still is the U.S. Navy portrait (public domain), inlined. No piece names `rich:hush`.

## The offers

1. **How it works — "multiplies", "convolution" · confirmed.** In 03's draw loop (03:259–268), a cell's light picks a tier, and every word letter is drawn at one alpha, 0.94. The only product anywhere is the glyph's shape times a colour whose alpha steps with the tier (0.80, 0.86, 0.94). That is selection, not luminance × ink. The section's "the camera-luminance × character-ink multiply is **literally** a [[Convolution]]-flavored blend" is wrong, not a loose description, and "literally … -flavored" contradicts itself. The bullet under The line of iterations ("camera luminance × character ink; brightness picks the glyph") is loose and then correct in the same breath. The convolution point is right: a pointwise product is not a convolution; it is convolution's dual under the Fourier transform. My recompute matches the maker's: band +0.03 built against +0.53 multiplied, whole frame +0.87 against +0.82. Two places the offer should also name: the Cross-Domain Resonance bullet ("[[Convolution]] — two layers multiplied into one image") and the frontmatter link label `multiply-blend`. **A sibling offer for [[Language as a Tonal Medium]]:** its step 3 (Language as a Tonal Medium.md:46) carries the same "luminance × character-ink as a Convolution-flavored multiply". Its rich face landed 2026-10-13 with no status, so it stands approved, and it gathers card 03 with a caption that is right on selection. Its line "a region is … the right darkness" holds only at tier level (band r +0.03). That page wants its own offer, made there and not from here.
2. **How it works — "near-still" · split.**
   - **The reseed half: confirmed, and it does not depend on σ.** The seed includes the run's index along its row (03:209), so a run that splits, joins or appears changes the index of every run to its right. I counted changed letters whose own run kept its start and length. At smooth 0.7 that is 46% of all changes; 29% at smooth 0, 66% at 0.95. That half can be carried as it stands.
   - **The 27% half needs a real measurement.** The number moves with the assumed σ. At smooth 0.7, σ 0.005 / 0.01 / 0.02 / 0.03 gives 8% / 16% / 27% / 36% of letters changing per frame. At the low end, "near-still" is arguable.
   - **The model also misses something in 03.** 03 smooths once per animation frame, not once per camera frame: `sample()` runs on every requestAnimationFrame whether or not a new video frame has come (03:170–185, 276). On a 60 Hz display with a 30 fps camera, each camera frame is blended in twice, so the cell keeps 0.49 of its old value per camera frame, not 0.7. That gives 39% per camera frame at σ 0.02, and 53% at 120 Hz (0.24).
   - **What to do.** Card 08's bench holds only stills, so there is no frame sequence to measure from. The measurement wants a few seconds of webcam frames with someone sitting still (card 10's sitting is the natural moment): σ per cell after 03's downsample, and the display's frame rate. Until then, offer the wording that needs no σ ("smoothing calms the words; a run that splits reseeds the runs to its right") and hold the number.
3. **Lost branches — two bands · confirmed in shape, disputed in numbers.** Two bands, a flat curve, faint in-band tone: all three hold. But 0.11–0.23 and 0.77–0.89 are 03's ink box, not a drawn cell. Drawn and read back: letter cells 0.15–0.34, letter-punched tiles 0.69–0.87. The flat range 0.16–0.22 is right (bin means, a quarter of band cells empty gaps). The offer should carry drawn numbers once the remake measures them, and say they depend on the reader's monospace font (these came from headless Chromium on this Mac).
4. **Lost branches — link [[Language as a Tonal Medium]] · confirmed.** The entry exists, and the page's own frontmatter already has it as `spawned`.
5. **Forward Vectors — "of ten" · confirmed.** The bundle holds cards 01–10, and the deck links ten cards.

## The face as a whole

It makes the idea felt, not just busy, and mostly by being honest against its own page. You meet card 03 live where the iterations name it. Then the ramp takes it apart on a still, one stage at a time. Then the carried question gets its number: legibility really is a band, two of them, and inside the word band the light is ignored. The face's best find is that the page's central sentence, the multiply, describes a cam that was never built. The cam that was built is a selector, and it draws the picture with its tiers. The bench and the legibility piece then agree from two directions that words can hold tone only faintly. Two things keep it from full weight. The legibility piece states its bands in the wrong units. And the whole-frame squint looks like strong evidence while testing the ramp, not the words. Both are one-round fixes. Nobody has yet looked at any of these frames with a person's eyes, and the face says so.
