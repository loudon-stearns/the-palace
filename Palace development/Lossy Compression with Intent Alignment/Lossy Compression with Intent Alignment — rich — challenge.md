---
title: "Lossy Compression with Intent Alignment — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Lossy Compression with Intent Alignment]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of this page's first rich face, made in the 2026-11 proposal round: three pieces vetted with reasons (two keep, one remake), four offers recomputed, and the checks that would have failed if the pieces were wrong."
---

# Challenge — Lossy Compression with Intent Alignment, rich face, round 1

Challenger: claude-opus-5-5, 2026-11-03, on the maker's commit `26bbdbde` in the worktree `enrich/lossy-compression-with-intent-alignment`. I did not make this face. I re-ran every number I could reach with my own scripts (kept in the session scratchpad, not the bundle), using the pieces' own cores where the claim is about the engine, and independent code where the claim is about something outside it: the loudness, the palace's links and the paper.

## The pieces

### same bits, two decoders — keep

1. **Test or decoration?** A test. Eight blind R/X/Y trials of the two decodings of one bitstream against the original. If your ear sides with the meter, 7 or 8 of 8 for the average, the piece says the claim failed for you. The check's null can fail too: a draw spread 1.5 times too wide reads 3.26, outside the 1.9–2.1 band.
2. **Faithful?** Yes, to the 2019 framework's narrow sense of perception, and the caption and offer 1 say that this is narrower than the page's sense. The "level gap" axis is labelled as a stand-in that reads levels only, which is honest. One slip: step 3 credits the 2× bound to "Blau and Michaeli (2018)". The bound is Theorem 2 of the 2019 ICML paper, which is also the year the page gives.
3. **Walks up?** Yes. It goes one sample at fewer bits, then the budget, then the decoder's choice, then three axes, then the blind test, which comes last. Each step adds one idea.

What I checked:
- **Same bits.** `render()` and every blind trial call `decode()` twice on one `encode()` object (`trialNow` uses `base.bs`). Decoding leaves the stream unchanged. Re-quantised against the sent cells, 32,398 of 32,398 coded coefficients from each decoder fall in their own cell.
- **32 kbps counted honestly.** Counted from the stream itself: 25 levels × 5 bits, plus 2 range bits for each band given bits, plus each coefficient's bits. That gives 96,162 bits over 3.008 s = 31.969 kbps, exactly the budget of 341 bits a frame. No side information is uncounted, and the allocation is rebuilt from the levels (the check confirms it frame by frame).
- **The 2× ratio.** Draw error over average error on the cymbal: 2.008, 2.006, 2.001, 2.004, 2.003, 2.004, 1.995, 2.003, 2.012 and 2.004 at 16–128 kbps. Over 24 fresh draws at 32 kbps it ranged 1.987–2.020. Confirmed.
- **Loudness.** Measured with my own BS.1770 K-weighting, designed from the analog prototypes rather than copied from the piece. Ungated: original −20.053, average as heard −20.053, draw −20.054, a fresh draw −20.053 LUFS. Gated: −20.318, −20.325, −20.318, −20.319. The match holds within 0.01 LU. The average is turned up 5.8 dB and the draw −0.1 dB. Peaks at the destination stay at or below 0.60 after the 0.8 master.
- **Leaks.** Same length (144,384 samples), same loop, started together and switched by gain. The blind step shows nothing: the canvas reads "hidden until the eighth answer", there is no meter, and the DOM carries no labels. Level is matched. What is left between the two is the variable itself. The spectral centroid is 7.8 kHz for the average against 13.0 kHz for the original and 13.1 kHz for the draw, and the average's empty bands come and go (frame-to-frame level jitter of 6.4 dB in 9.5–12 kHz, against 4.9 dB in the original). A listener can tell the two apart by that, and that difference is the thing under test. The held tone appears only in step 4, never in the test. I found no non-audio route to a consistent answer.
- **Rule and arms.** Stated before the first trial: chance 1/2, and 7 or 8 of 8 for a named decoder = 9/256 ≈ 1 in 28.4. Both arms are counted and either can yield a verdict. Note: since either side can yield a verdict, guessing produces *some* verdict 18/256 ≈ 1 in 14 of the time. Each named verdict is 1 in 28, as stated. The caption's "7 or 8 of 8 for one decoder" would read better as "for a named decoder", which is the piece's own wording.
- **Meter as heard.** In every trial the average stays ahead on signal-to-error (0.00 dB against −1.71 to −1.77 dB across trials), as the result table says.
- **Sound.** No AudioContext exists before Play is clicked. After Play the context runs; after a simulated hide (visibilityState set in every frame, as `check-hidden-hush.mjs` does) it is suspended and the button reads Play. There is no detached `Audio()`. The sounds are synthetic: square waves, seeded noise and sines.

Notes to carry, none of which is a remake: change "(2018)" to "(2019)" in step 3's eq2 words, and put "named" in the caption.

### same bits, two pictures — keep

1. **Test or decoration?** A test, in a second sense. It runs eight blind pairs (four textures at 0.5 and 1 bpp) under the same rule, and the eye can side with the meter.
2. **Faithful?** Yes. Ratios run 1.77–2.14 and the average has the higher PSNR in all 12 renders (check.mjs, re-run). The caption's "about 3 dB less PSNR" holds (2.47–3.30 dB).
3. **Walks up?** Adequately, in three steps: budget and the average, then the draw, then the blind test last. Step 1 packs the DCT, the bands, the levels and the allocation together, leaning on the sound piece beside it for the slow walk. That is acceptable for a companion piece, and a note, not a remake.

What I checked:
- **Numbers.** Every MSE and PSNR is worked out live from the Float64 arrays the pictures are painted from, clamped as shown. Nothing reads canvas pixels, so nothing needs baking and the sandboxed public frame computes them the same way. Served headless, step 2 read "the average 22.13 dB, the draw 19.23 dB, ratio 1.95", the same as check.mjs.
- **Leaks.** The pairs share a global mean within 0.2 grey and block means within 2.7 grey (clamping). X and Y carry identical captions. The difference is contrast: for sand and sky at 0.5 bpp the standard deviation is 30.3 in the original, 22.9 in the average and 30.1 in the draw. That is the variable.
- **Rule and arms.** Stated first, both arms scored, and the result table filled after eight picks.

### the type and the label — remake

1. **Test or decoration?** A test. Sixteen real links, eight with the type alone and eight with type and label, four of the source's real targets each. The label arm can fail to clear guessing.
2. **Faithful?** Mostly. Step 3 argues against the page's word "soft". That is an offer for Loudon (offer 3), not unfaithfulness, and the piece says so plainly. But one of the piece's own claims is false, and one statistic misleads (below).
3. **Walks up?** Yes. One link typed, then the same link labelled, then what distillation calls soft, then the test last.

What I checked:
- **Counts.** My own Python parser (PyYAML on `git ls-files`, 307 entries, no duplicate basenames) gives N 2,087, labelled 1,795, distinct labels 1,600, used once 1,517, under more than one type 28, spawned 107, spawned · midwifed 2. Mean bits over labelled links: type 2.513, type and label 10.700. All of these match the piece exactly. The counting commit `3bd902d3` is HEAD's parent.
- **Links named.** The opening link (this page → `spawned` · `midwifed` → Resonant Link Labels) is in the frontmatter, and so are the back-link (`emerged-from` · `applied-by`) and Crystal Synthesizer → `spawned` · `midwifed` → The Metaphor Stretch. All 48 pool links are real, all 144 decoys are pages the source really links to, no decoy repeats or equals its target, and no source links its target twice.
- **Chance.** At p = 1/4, P(≥5 of 8) = (1512 + 252 + 24 + 1)/65536 = 1789/65536 = 0.0273, about 1 in 36.6. Confirmed. The rule is stated first and both arms are scored.
- **The leak.** The rule promises "no label can pass by spelling its target", but the filter compares five-letter stems, and **"drawn-not-damped" → Resonance and Damping** shares "damp" (damped/damping, which split at the fifth letter). A reader picks it from the four by spelling alone. That item lands in the label arm in about 1 round in 6, and in those rounds a guesser's chance of clearing 5 of 8 rises from 1 in 37 to about 1 in 14. A four-letter stem catches it and nothing else among the 48. One decoy goes the other way, "refuses-the-threshold" against the decoy The Fortress and the Threshold. That item misleads a speller rather than helping one, so it is not a leak, but the record should name it.
- **The statistic that misleads.** Step 3 says "28 of 1,600 labels sit under more than one type … how rarely a palace label is one". But 1,517 of those labels are used once and so cannot sit under two types. Of the 83 labels used more than once, 28 (34 %) do sit under more than one type. That does not prove a palace label is a soft label in the distillation sense, but "rarely" is an artifact of single use.

**Remake, exactly:**
- (a) Close the leak. Widen the stem test to four letters, or drop "drawn-not-damped" from the pool (leaving 47). Re-run check.mjs with its stem check at the same width, and update the RULE's "214 of 1,690" count.
- (b) In step 3's say and meter, and in the caption, give 28 against the 83 reused labels as well as against 1,600, and drop "how rarely" or qualify it.

Nothing else needs to change.

## Checks run

- `conform.mjs` (browser at 760 and 1130 px): 3 introduced, 0 errors, 0 warnings.
- `fingerprint.mjs`: both made sections are in step (`32601e5bd418`, `3a5fe3f6302e`).
- `check.mjs` (the maker's): all PASS, re-run in 18 s.
- Served face (`rich-server --root <worktree>`, headless Chromium at 1300–1400 px, then `--stop`): console clean on every load, three proposal chips, the head counts 2 sections proposed and 4 offers.
- Each piece driven headless: every step's meter read, all three blind rounds completed, and both arms' counts shown each time. Console clean.
- **The maker's "reported no height", reproduced.** Fast scroll from DOM ready: clean 3 of 3. Slow scroll: clean. Load with no scroll at all: none of the three frames reports a height, and two show the note. The same no-scroll load on Kuramoto Coupling (two notes, five frames unheard) and on Ohm's Law (one note) does the same. This is the kit's: `piece.js` reports through `requestAnimationFrame`, which an offscreen frame does not run, and `rich.js:317` posts the note 3 s after load. These pieces are not the cause.
- **Paper (web, kept apart from palace claims).** Blau and Michaeli, "Rethinking Lossy Compression: The Rate-Distortion-Perception Tradeoff", ICML 2019, PMLR 97:675–685, http://proceedings.mlr.press/v97/blau19a/blau19a.pdf (arXiv https://arxiv.org/abs/1901.07821). It defines the perceptual quality index as "d(p_X, p_X̂) … some divergence between distributions", with Definition 1 constraining it. Theorem 2: "When using the squared-error distortion … R(D, 0) ≤ R(½D, ∞)", that is, "perfect perceptual quality without increasing the rate, by sacrificing no more than a 2-fold increase in the mean squared-error".

## The offers

1. **Perception, the page's against the framework's (claim-change). Confirmed, and it is a claim-change, not a terminology note.** The section presents its three axes as the 2019 reframing's and defines Perception as how well the compressed version "functions for its intended receiver". The paper's perception is a divergence between the distribution of decodings and the distribution of real signals. It names no receiver or purpose, and its own footnote calls the word "somewhat inappropriate" for a non-perceived source. The page's next sentences ("A generative entry has high perception") rest on the receiver sense, so the misattribution carries weight. Naming both, as the maker suggests, is right.
2. **The price, in bits or error (claim-change). Confirmed, with a correction to how it should be worded.** The ratio is 2.00 (1.995–2.012 across rates, 1.987–2.020 across fresh draws). By direct renders, the draw's SNR at 67 kbps is 1.237 dB against the average's 1.243 at 32: 67 kbps, 2.09× the bits (the piece's 66.7 is interpolated). But Theorem 2 is an upper bound. Perfect perception costs *at most* twice the error at the same rate. The posterior draw attains the bound and is not the cheapest decoder that reaches it. And 2.09× the bits belongs to this coder on this cymbal at about 1 dB SNR, not to theory. So the text should say that the price is paid in bits or in error, up to twice the error at the same bits, keep "deliberate work" as the palace's reading, and leave 67 kbps in the piece.
3. **"Soft" is the wrong word (claim-change). The counts are confirmed; the core claim is confirmed; one piece of evidence is disputed.** A distillation soft label is a distribution over the hard label's own classes, and a palace label is a new, finer name. That holds by definition. The numbers match exactly (1,600 / 1,517 / 28; 2.51 → 10.70 bits). But "28 of 1,600" understates spread: it is 28 of the 83 reused labels. And 10.70 bits measures specificity, which any unique ID would score too. The maker words it as specificity, which is right; the text should not read it as signal.
4. **"The typed links … are soft labels" (no-claim-edit). Confirmed.** The paragraph calls the typed links soft and then calls a type, `enables`, hard. It means the labels. If offer 3 is taken, this wording changes with it.

## The face as a whole

It makes the idea felt rather than busy. The strongest thing on it is that both sound and picture put the reader's own senses against an error meter that is provably right about error, using one bitstream decoded two ways. The decoders' only difference is what they write where the bits ran out, so the tradeoff is heard, not narrated. The engines are honest down to the bit count, the 2× is the theorem's own number, measured, and the nulls can fail. The label piece is the more original move: it turns the page's claim about soft labels onto the palace's own links and finds the word doesn't fit. It needs the one leak closed and its one statistic set against the right base before it is as trustworthy as the two beside it. The memory, deposit and cross-domain sections rightly have nothing.
