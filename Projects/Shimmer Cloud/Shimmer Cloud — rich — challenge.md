---
title: "Shimmer Cloud — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Shimmer Cloud]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of Shimmer Cloud's proposed rich face, piece by piece and offer by offer, with the numbers re-run on the bundle's own engines, so Loudon can take or leave each one knowing which parts held when someone else pushed on them."
---

# Challenge — Shimmer Cloud's rich face, proposal round 2026-11-03

Read against the page as it stands in the worktree (`Projects/Shimmer Cloud.md`), the manifest, every piece's source, the bundle README, the scroll, the steward's runtime and the board, with the maker's commit body (3a9b9cbd) as its only account. I didn't make any of this. Verdicts: **5 keep, 1 remake, 0 retire.**

## The steward

The steward's latest cycle is still cycle 2, 2026-10-22 (`_ops/agents/permanent/shimmer-cloud/state.json`, iteration 2; last board posts `shimmer-cloud-004`/`005`). Its next moves on the scroll's plan are the swell before the dry (move 3), then a live worklet with the lens count on a control (move 4). One ask is open, `shimmer-cloud-003` (how hard to push the prism).

The face builds neither. The how-many piece plays fixed takes of May's droplets, not lenses, and says the lens question belongs to the live cloud. The white-light piece renders 600 prisms in the browser, but only a click through a fixed transfer function, offline. Nothing on the face picks a strength or an interval, so `shimmer-cloud-003` is untouched.

The one place it leans on the steward is offer 1. Its rewording points the question at spread, and move 4 puts *count* on the control so Loudon can find the line by ear. If offer 1 is taken into the page before move 4 runs, the page and the plan would point at different dials. My suggestion: carry offer 1 into move 4's brief, not into the text yet. The live cloud should have spread (drift cents) on a control beside count, and count should go down to two or three. Below I found that count matters only down there. One more point for move 4: a lens cloud with no drift is a sum of fixed filters, so it can't swirl at all (the steward's README already says a pass "folds into one transfer function"). With pure lenses, count sets echo density and colour; only drift makes the cloud move.

## The pieces

### What It Is · `01_feedback_lens/wet.wav` (gathered) — **keep**

1. **Test or decoration?** Evidence rather than a test. It is the H3000 idea the paragraph names, as the bundle actually built it, and that is what a gathered piece is for.
2. **Faithful?** Yes. The caption's 69 / 21 / 7 % at +12 / +24 / +36 is the steward's tone test (`proofs/2026-10-22-interval/findings.json`, `may_octave_stack`), and the README quote is exact (`README.md`, "structurally a chorus/H3000 effect, not a prism").
3. **Walks up?** One take, no proof to walk to.

### What It Is · `rich-face/fifth.wav` (gathered, copied) — **keep**

1. Evidence for offer 4: where the generalization went.
2. Faithful to the scroll. One jump at the door, eight passes, 600 prisms, 100 % on +7, 2.17 s to −30 dB (`findings.json`, `fifth`). It is the steward's lean, not Loudon's pick, and the caption says so ("the scroll still waits on Loudon's ear"). The caption's "where the paragraph's generalization went instead" is a claim against the text, and it is carried as offer 4. Byte-identical to the steward's ignored take (`cmp` against the owner's `proofs/2026-10-22-interval/takes/fifth.wav`), and now tracked.
3. One take.

### What It Is · `proofs/2026-10-22-interval/interval.png` (gathered) — **keep**

I looked at the figure. The caption's left-to-right order matches its five panel titles, and the long loop's steady harmonic lines are there to see.

### Open Questions · `Shimmer Cloud — rich — how many.html` (made) — **remake**

1. **Test or decoration?** A test, and a well-made one. The ear is asked before the measurements open, and count could have moved the swirl and didn't. But the square can't find a count threshold that lies below its smallest count, and that is where one is. The swirl's rate and depth hold still from 2 copies to 2500, as the maker says. Its *kind* does not. I measured how much of the swirl's power sits in its strongest 1 % of frequencies (cloud.py, steady 200 Hz tone, 25 ¢, four seeds): 2 copies 0.95, 3 copies 0.67, 6 copies 0.34, then 12, 30 and 100 copies all 0.19, and 300 copies 0.16. Two or three copies beat in a few regular lines, which is the chorus of a pedal. By about a dozen the beating is a random swirl, and more copies change nothing. May's set starts at 30, past that line. So the square steers the ear toward spread by how it is built, and the "right column" verdict's "the question's number is a number of cents, not of copies" overreaches.
2. **Faithful?** It asks the page's question in the page's words, and its numbers are honest about what they measure. The question was asked about pitch-shifted copies, and the droplets are rate-resampled copies, so the swap is small. The piece says plainly that the lens version belongs to the live cloud.
3. **Walks up?** Yes: one voice, then count, then spread, then the square.

**Remake, one round:**
- Add a few-copies rung to step 2: 2, 3, 6 and 12 copies at 5 ¢, rendered with cloud.py and seed 42 the way `count and spread.py` already renders the corners. Its JSON already measures 2, 3 and 6.
- Give the square a third row, three copies, at 5 and 25 ¢, so a count line has a place to show.
- Show the swirl's regularity beside its rate and depth (the share of swirl power in its strongest lines, or the envelope's autocorrelation peak), measured by the same script.
- Rewrite the four ear verdicts so none says count doesn't matter. Count is a dial below about a dozen copies and stops being one above.
- Step 2 can carry Schroeder's own second sentence (below), which turns 300 against 2500 copies into a prediction the ear can check.

### Cross-Domain Parallels · `Shimmer Cloud — rich — white light.html` (made) — **keep**

1. **Test or decoration?** A test. A cloud of pitch copies could have fanned a click, and it doesn't. The prism cloud could have failed to, and it does.
2. **Faithful?** It quotes "disperses audio into a spectrum of pitch shifts" exactly, then contradicts it. The contradiction is carried as offers 2 and 3, so it is an offer, not a fault. The test is fair under the text's own mapping too. The text maps the prism's layout by wavelength onto a layout by pitch, and even laid out along pitch, each copy carries every frequency of the input, so nothing is separated. A sentence saying that in step 5 would close the one door a reader could leave open ("the test only checks timing"). That is a note, not a remake. The step-5 note "Its pitch copies were never struck with a click there" is true: `render_pushed.py` strips `cents` before its click test ("pitch jitter needs a phrase"), so `p1_droplets` in its findings is scatter alone.
3. **Walks up?** Yes: a click, a plain delay, one pitch copy, one prism, then a cloud of each.

Small note: `resample()` on the two-sample click clamps `j` to 0 and lets `fr` run past 1, so a downward shift extrapolates. At −1200 ¢ the click comes out as 1, 0.5, 0, −0.5, a short ramp, not a click. That doesn't touch any claim. The text still says "a click played faster is still a click", and the check holds at ±1200 ¢.

### Cross-Domain Parallels · `proofs/2026-10-22-pushed/pushed.png` (gathered) — **keep, with a note**

The caption matches the figure's panels and the steward's numbers (3 ms, 213 ms). The last sentence reads the highs-early fan as "one reading of the turbulence paragraph's 'dispersing faster'". But that paragraph's claim is that high-pitch-shift particles *decay* faster, and nothing in the figure is pitch-shifted. Say that the figure shows the lens can be turned so highs arrive first, and leave the paragraph's own claim as untested. A pointer for whoever returns to that paragraph: a lens with highs early is a whistler, lightning's descending sweep, where a cold plasma delays low frequencies most (Eckersley's law, delay ∝ 1/√f). That is a real physical dispersive medium at audio rate, and nearer to this lens than turbulence is.

## The offers

**Offer 1 (Open Questions, claim-change) — confirmed as measured, disputed as framed.**
- *Rate and depth.* Re-run with my own envelope (complex demodulation, 4th-order Butterworth, zero phase, rate as the centroid of the intensity |z|²'s spectrum) on cloud.py, three new seeds each:
  - count at 5 ¢: 30 copies 0.66 Hz, 300 copies 0.74 Hz, 2500 copies 0.66 Hz; depth 0.51–0.55
  - spread at 400 copies: 8 ¢ 1.02 Hz, 25 ¢ 3.37 Hz, 75 ¢ 9.32 Hz
  - predicted: 0.65, 1.04, 3.26 and 9.78 Hz
  - the square's other corners: 30 × 25 ¢ 3.27 Hz, 2500 × 25 ¢ 3.60 Hz

  So the rate is set by spread, not count, within about 10 % of f·ln2/1200·(2/√π)·σ. The 75 ¢ point needed a 45 Hz envelope filter; a 15 Hz one read 7.35 Hz, which was my filter's fault.
- *The derivation.* A copy c cents off beats against a copy at f·(2^(c/1200) − 1) ≈ f·c·ln2/1200 (0.058 % per cent). But May's takes are wet only (`cloud.py` returns the copies, no dry), so the swirl is copy against copy, not copy against the dry. Two draws from a Gaussian of spread σ differ on average by 2σ/√π = 1.128σ, and that is the 1.13. The centroid of |z|²'s spectrum, a Gaussian of width √2·σ_f, gives the same factor. If the dry were mixed in, copy-against-dry beats would bring in √(2/π) = 0.80 instead. Depth tends to √(4/π − 1) = 0.523, the Rayleigh value, as the maker says.
- *Onsets.* 30, 300 and 2500 copies over 300 ms give 100, 1,000 and 8,333 a second (N/0.3). Right, and it is the echo density of the cloud's impulse response, so Schroeder's measure is the right one.
- *Schroeder, checked at the source* (M. R. Schroeder, "Natural Sounding Artificial Reverberation," JAES 10(3), 1962, p. 219, text layer of the Rochester course copy): "we have found that approximately 1,000 echoes per second are required for a flutter-free reverberation. In fact, even for extremely short transient sounds, the ear cannot distinguish an echo density of 1,000 per second from any higher value." Confirmed. The second sentence is a prediction for this face: 300, 800 and 2500 copies should not differ in grain.
- *The question: reframed, not answered.* Count doesn't move the swirl's rate or depth, but it does change its kind up to about a dozen copies (above). So "how many copies before shimmer rather than chorus?" has a count answer, somewhere between 3 and 12, below anything May rendered, and a spread answer above it. The proposed rewording drops count, so it goes too far. Hold the wording until the remade square and move 4's live control have both been heard.
- *A name for what was measured.* A rate-resampled copy is exactly a Doppler shift from a reflector moving at constant speed (cloud.py's docstring: "a moving lens necessarily compresses or stretches what it re-projects"). A Gaussian spread of cents is a Gaussian spread of speeds. Light scattered off such a crowd flickers at a rate set by the speed spread, with Rayleigh amplitude whatever the number of scatterers, once there are more than a handful. That is dynamic light scattering, laser speckle. It is offer 1's whole measurement: rate ∝ σ, depth → 0.52, count-free above a dozen. This is my suggestion, from standard physics; it is not measured beyond offer 1's numbers.

**Offer 2 (Cross-Domain Parallels, claim-change) — confirmed; the rewrite drops the droplets.**
- *Re-run on the steward's own engine* (`render_pushed.py` `cloud()`, STRONG, a click):
  - the prism cloud lands highs after lows by 212.9 ms at seed 7, and by 236.6, 227.9, 240.3 and 226.5 ms at seeds 1–4 (amplitude jitter 0.3 changes each by under 2 ms)
  - the τ curve predicts about 225 ms for the mean strength of 375 ms (the check's 180.3 ms at D = 300, which is linear in D)
  - so the piece's +226 against the steward's +213 is seed spread, not a different lens
  - pitch copies at ±25 ¢ on the same engine, with cents kept: −0.0, +1.2 and −0.7 ms. The piece's +3.3 ms is the same nothing.
- *Confirmed in the lens code.* The piece's engine is the steward's lens (τ = D·u^p, u by octaves over 80 Hz–11 kHz, D uniform 150–600 ms, p = max(0.3, 1 + 0.3·N), 25 ms scatter, equal-power pan). The low cut is eased over 20–60 Hz where the steward cuts hard below 40 Hz.
- *Wrong, or a figure?* "Disperses audio into a spectrum of pitch shifts" is a fair figure for what the droplet cloud does: it spreads one sound across a band of pitch offsets. What is wrong is "disperses" in the prism's sense and "the metaphor is structural." A prism separates the components of what goes in. A pitch cloud moves whole copies and separates nothing, so a click comes out a click.
- *The rewrite.* The proposed rewording makes the paragraph about the lenses only, but Loudon chose droplets and dispersion together at the revival (scroll, 2026-10-21). Light has a structural twin for each half: the lens cloud is the prism, and the droplet cloud is light scattered off a moving cloud (Doppler broadening and speckle, above). Offer both to Loudon; don't write the droplets out.

**Offer 3 (Why It Matters, claim-change) — confirmed.** Same measurement. The same caution applies: "by pitch-shift depth" is what the droplets do to pitch, not how anything disperses.

**Offer 4 (What It Is, claim-change) — direction confirmed, history wrong.** The offer says the four steps "describe the grain model the bundle built first and moved past in May." No model in the bundle ever granularized:
- The feedback lens runs librosa's `pitch_shift` on the whole signal in a loop (`01_feedback_lens/lens.py:83`).
- The droplet cloud resamples whole-phrase copies (`02_droplet_cloud/cloud.py`, `_resample_linear` on `dry`).
- The dispersion cloud is all-pass lenses.

The four steps, 5–50 ms grains and all, are already in the text at the 2026-03-30 weave (`git show b54785f4`, line 36), before anything was built. Fix the offer's account: the steps are the March concept, which every May model already departed from. The rewrite it proposes (lenses, a few cents of drift, at most one interval at the door) is still where the bundle and the forward vector went. The how-many piece itself says it right: "the phrase copied many times."

**Offer 5 (What It Is, no-claim-edit) — confirmed.** "microdetunning" is on `Shimmer Cloud.md:51`.

## Checks run

- `conform.mjs "Shimmer Cloud"` in the worktree: 0 errors, 0 warnings, browser pass at 760 and 1130 px, both pieces introduced.
- `fingerprint.mjs "Shimmer Cloud"`: What It Is 19a32031f8b5, Open Questions 17799d7803d2, Cross-Domain Parallels 1e17a9219033, all in step.
- `check.mjs`: all pass. Its how-many half checks the page's numbers against the JSON and doesn't recompute them, so I recomputed (above).
- The corners re-rendered from cloud.py with seed 42 and its defaults: 01, 05, `30_droplets_25c.wav` and `2500_droplets_25c.wav` all match within 3.05e-5, which is 16-bit rounding. Seed 43 misses by about 1.0, so the files are seed 42 and not just the same recipe.
- `rich-face/fifth.wav`, `p1_droplets.wav` and `p1_dispersion.wav` are byte-identical to the steward's ignored takes in the owner. All five rich-face takes, the gathered wet.wav, the figures, dry.wav and May's variations 01–10 are tracked. Nothing licensed was copied.
- Headless Chromium on `rich-server --root <worktree>`:
  - Both frames load (765 and 1272 px).
  - The square's corner plays as a media element in the page, and the measurements stay hidden until an ear pick.
  - White light's step 5 table reads +3 / +226 ms for the click and −12 / +203 ms for the pluck.
  - Its AudioContext is created on the first click and goes from `running` to `suspended` on a simulated hide; the how-many audio pauses on hide.
  - Console clean. One `requestfailed` on `fifth.wav` was a preload aborted at page close; the file answers 200 at 543,428 bytes.
- Schroeder 1962, p. 219, read at the source.

## The face as a whole

It makes the page's idea felt, and it argues with it honestly. White light is the best piece here: a click through a pitch cloud and through a prism cloud is the shortest way to hear why the bundle left pitch shifts for lenses, and it walks there one concept at a time. How many is close. It asks the ear before it shows a number, which is the right order. But it was built only from May's takes, and May started at 30 copies, so it can't hear the one place where count is a dial. Fix that, and hold offer 1 until move 4's control has been in Loudon's hands. Both pieces have honest numbers and real tests, and they are not busy.
