---
title: "Linear Predictive Coding — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Linear Predictive Coding]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Linear Predictive Coding's proposed rich face: every piece judged for test, fidelity and walk-up, every offer recomputed with an engine that is not the maker's, so Loudon reads a face that has already been argued with."
---

# Linear Predictive Coding — rich — challenge

Challenger · claude-opus-5-5 · 2026-11-03 · proposal round, Enrichment v2.8. Judged from the page, the manifest, the three pieces and the maker's commit body (4c573043), nothing else.

**Verdicts: 2 keep, 1 remake, 0 retire.**

## The pieces

### The autoregressive model and the residual — "how much is left over" (made) · keep

- **Test or decoration?** A test, mostly. The page's sentence "the better you can predict, the less you have to send" is close to guaranteed in its direction: more weights can only lower each frame's error. What isn't guaranteed is the size and the shape, and the piece measures both. A voice is 10 dB predictable from one sample, 19 dB at the usual 18 weights, and then the curve goes flat. Step 2 is a real test of Wold's split: noise gains 0.005 dB at every order, and a sine in noise stops just under the noise's own level.
- **Faithful?** Yes. The equation, the sign convention and Wold's wording all match the page. The bits note is honest that it counts what the leftover saves, not what the weights cost.
- **Walks up?** Yes. It opens on one sine and one weight. Then two weights, then predictable against unpredictable, then the voice. One step shows at a time, and changing step stops the sound.
- **Note (taste, not a remake).** Step 3 says "50.6 kbps you no longer send" but never names what it is out of: 256 kbps of 16-bit audio at 16 kHz. Said, the proportion shows that prediction alone saves about a fifth. The page's drop to "thousands of bits per second" comes from throwing the residual away, and that is the next section's story. One clause pointing ahead to the swap piece would join the two.

### The source-filter model and its mirror-twin — "junction to mirror" (gathered from Tract Mirror) · keep

- **Test or decoration?** A test, and it came out differently from the text. The walk runs Levinson-Durbin on a tube's own click and compares the reflection coefficients with the tube's area-ratio mismatches. They are equal only in the ideal tube.
- **Faithful?** It disagrees with the text. That disagreement is carried correctly as offer 1 and not smoothed into the caption.
- **Walks up?** Yes: one joint, then a straight tube, a vowel, a morph, and the mirror run backward last. Tract Mirror's own challenger judged the walk the same way, and its remake (d3ccc4f7, on main) added the "once one overall level is matched" wording this caption uses.
- **Runs clean?** Yes, apart from 2 conform warnings (`sandbox-blocked`). Its fetch of `reference/vowels.json` from the opaque frame is refused. The piece falls back to the copy it carries and says so on screen (junction to mirror.html:697–700). It stands as it does on Tract Mirror's own face.
- **The two faces agree.** Both captions and both offers give the same account (`Tract Mirror — rich.json` offers[0]; this manifest's offers[0] and caption):
  - the ideal takes a closed glottis and lossless walls, and holds there under 10⁻¹¹ on six vowels;
  - as shipped (+0.97, 0.996 a joint), the gaps are 0.25 on /a/ and 0.61 on /o/, and the tube that comes back is different but sounds the same once one level is matched;
  - either condition alone breaks it.

  This face leaves out the 12 and 16 dB level figures and the lip rung, which is fine for a borrowed piece. I did not recompute the tube numbers. Tract Mirror's challenger did, in Python.

### The residual is where the soul hides — "the residual swap" (made) · remake

- **Test or decoration?** A real test, and the best on the face. Step 3 could have come out the other way. A made vowel's leftover puts 99.5 % of its energy on the beat. The spoken sentence's puts 49.5 %. "The voice's life is in the leftover" is measured here, not just illustrated.
- **Walks up?** Yes, five steps: a vowel alone, then read it back, a voice's leftover, throw it away, buy some back. The step rail stays open.
- **Faithful?** Three wordings claim more than the page or the engine supports. All three are fixable in one round:
  1. **"then a real voice"** (the subtitle, `.lp-sub` above the rail). It is Kokoro af_heart, a neural speech model. The caption and the notes say so; this one phrase contradicts them. Say "then a spoken voice (Kokoro's, a model trained on human speech)", or simply "then a voice".
  2. **Step 5's test text, and the manifest caption's "without copying the leftover".** The step-5 text says the excitation "was chosen by how the voice it makes compares … not by how close it sits to the leftover". The piece's own engine sets the search target as "the voice's own residual through 1/A(z/γ)" (the `celpExcitation` comment, and the line that builds `tw`). So the codebook is chosen by how close it sits to the leftover *as the weighting filter hears it*. My recompute puts the excitation's correlation with the residual at 0.45 sample by sample, but 0.87 when both pass through 1/A(z/0.8), where the search compares them. Say it copies the leftover as the filter hears it (about 0.87), not sample by sample (0.43). The point about "life judged by ear" survives, and it becomes true.
  3. **Step 4's "That half, off the beat, is what the page calls the soul."** The page names breathiness, jitter and shimmer. Jitter and shimmer are timing and size changes *on* the beat, so energy off the beat is where breath shows, not the whole of what the page names. Say "that half, off the beat, is where the breath the page names lives", or soften it to "much of".
- **Also, one optional line.** The own-leftover identity is true by construction (below). The piece calls the 2 × 10⁻¹⁵ miss "rounding", which is honest. One clause would make it plain: "it can't fail — the leftover is defined as what the filter missed; this only shows the machine is wired right". The "voice minus that" button can stay.
- **Runs clean?** Yes. There is no audio context before a click, and every sound is a finished buffer played once. Hush and the time cap are left to the kit.

## The voice

Kokoro af_heart saying "The residual is where the soul hides.":
- **In the bundle and tracked.** The file is `Linear Predictive Coding — rich — the phrase.wav`, 16 kHz, 16-bit, 2.03 s, 65,114 bytes, far under 25 MB (`git ls-files` lists it). Both pieces carry it inline, byte-identical (checks.mjs check 2). The recipe `the phrase.py` sits beside it.
- **Licence.** Open weights under Apache-2.0. Nothing from Splice.

Is a synthesised voice an honest stand-in for the page's "soul"? Honest for the measurement, as long as it is labelled. Kokoro's vocoder learned its breath and wobble from human recordings. Its leftover sits between noise and buzz: on my own tracker, 17 % on the beat for white noise, 42 % for the residual, 99.7 % for a pulse train. LPC-10 throws exactly that middle ground away. But it is not "a real voice", and the face should say once, plainly, that the soul measured here was itself predicted by a model. That is the page's own open question: "what survives *their* prediction?" (Forward Vectors). Named, it turns the stand-in into a find, not a dodge.

The literal version of the claim would be Loudon himself saying the sentence, recorded in the bundle. That is his call and his voice, so it stays an offer to him, not a remake.

## Checks run

- **conform** (`node _ops/rich-face/conform.mjs "Linear Predictive Coding"`, worktree): 3 pieces introduced, errors 0, warnings 2. Both warnings are the gathered piece's `sandbox-blocked` fetch, with the fallback described above. The browser pass ran at 760 and 1130 px.
- **fingerprint**: all three sections *in step* (0d8dd9dbba20, 8cda9eb19c17, e94c093f3f89).
- **The maker's checks.mjs**: all 28 pass, re-run by me.
- **The live face.** Served on a leased port, opened headless at 1130 px, then the server stopped.
  - The head reads "3 sections made in a proposal round, not yet approved by Loudon · 4 offers for the text", with 3 proposal chips.
  - I walked every step of both made pieces and clicked all 22 play buttons. Console: no errors, no warnings.
- **My own recompute.** Independent Python with its own Levinson-Durbin, framing variants, pitch tracker, LPC-10 move and CELP search (numpy and scipy, a different codebook seed). The script lived in the session scratchpad; its output, in the bullets below, is the record.
  - **Prediction gain on the phrase, maker's framing (Hann 400, hop 160, 60 Hz lag window).** G(1) 10.13, G(4) 16.63, G(10) 18.11, G(18) 19.05, G(32) 19.49 dB. The last fourteen weights add 0.44 dB, and G(18) is 3.16 bits a sample. **Confirmed: 10.1 / 19.1 / +0.4.**
  - **Gain without the lag window.** Hann gives G(18) 19.39 with +0.59 dB after it; Hamming gives 19.26 with +0.55. The shape holds. The exact decimal depends on the conditioning, and the piece's 18 is the textbook rate-plus-two. For scale, one predictor for the whole phrase gives only 8.9 dB at order 1 and 9.8 dB at order 18. Most of the gain comes from refitting every 10 ms, which is the page's "locally stationary".
  - **Residual drives the filter back to the voice.** It returns the voice to 1.2 × 10⁻¹⁴ at 16 kHz and 4.7 × 10⁻¹⁵ at 8 kHz. It does the same, 2.7 × 10⁻¹³, with *random* reflection coefficients that have nothing to do with the voice. **True by construction**: the residual is defined as what the filter misses, and `synth` is `residual` solved the other way. checks.mjs runs it as a "check" (twice), which is fine as a wiring test. The piece shows it as a measured cell ("own leftover: largest miss") and calls it rounding. It never claims it as evidence, but it doesn't say it cannot fail either (see the remake note).
  - **Energy on the beat (8 kHz, order 10, 22.5 ms frames, my own tracker: 65 of 91 frames voiced, median f0 190 Hz).** Residual 42.2 %, pulse train 99.7 %, white-noise baseline 17.4 %. The maker's tracker, 51 voiced frames, gives 49.5 % and 98.2 %. **Confirmed in kind.** The residual figure moves by about 7 points with the tracker, and the pulse train's is near 100 % by construction, since its pulses are single samples.
  - **The LPC-10 move.** −3.2 dB segmental SNR at level +0.14 dB, against the maker's −2.8. Confirmed.
  - **The CELP move** (512 Gaussian vectors plus an adaptive codebook over lags 20–147, 60-sample subframes, weighting A(z)/A(z/0.8)): segmental SNR 8.7 dB, against the maker's 8.8. The excitation correlates with the residual at 0.45 (maker 0.43) and puts 23.9 % on the beat (maker 26.6 %). **Through 1/A(z/0.8), where the search compares them, the correlation is 0.87.**

## The offers

1. **Source-filter, claim-change: name the ideal-tube conditions.** Confirmed as consistent with Tract Mirror's landed face, in the same terms and numbers (see above). Not recomputed by me; Tract Mirror's challenger recomputed it.
2. **Soul, no-claim-edit: "the voice sounded like a buzzer", not "the residual".** Confirmed. The residual is the least buzz-like signal in the piece: 49.5 % on the beat (42.2 % on my tracker), against 98.2 % (99.7 %) for the pulse train and 17 % for white noise. As written, the page's sentence makes the residual the buzzer. The edit fixes the subject and changes no claim.
3. **Soul, claim-change: CELP excitations are "chosen by synthesis, not quantized residuals".** The numbers are confirmed: 8.7 dB against −3.2, correlation 0.45. **The reading is disputed.**
   - "Quantized residuals" is the common textbook shorthand. It is not wrong: CELP is vector quantization of the excitation, searched in closed loop.
   - In the maker's own coder, the target *is* the residual, passed through 1/A(z/γ). In that domain the chosen excitation matches it at 0.87. The 0.43 is measured where the coder never looks.
   - What the page's phrase leaves out is *how* it quantizes, not *what*. I recommend this as a no-claim-edit that keeps the word and adds the method: "a small codebook of excitations — quantized residuals, each chosen by synthesizing the voice it would make and keeping the closest". The thesis is sharpened either way.
4. **Soul, claim-change: LPC-10 is the 1984 standard, not the late 1970s.** Partly confirmed.
   - The formal dates are right: STANAG 4198, 13 Feb 1984; FED-STD-1015, 28 Nov 1984; FIPS 137 in 1988 ([Wikipedia, FIPS 137](https://en.wikipedia.org/wiki/FIPS_137); [Crypto Museum, LPC-10](https://cryptomuseum.com/ref/codec/lpc10)).
   - But LPC-10 at 2,400 bps was already the secure-voice coder in service in the late 1970s. It was in NSA's STU-I, produced 1977–79 ([Crypto Museum, STU-I](https://cryptomuseum.com/crypto/usa/stu1)), after real-time 2,400 bps LPC at Lincoln Lab in 1973.
   - The page says "standard", not "developed", so only the word "standard" is early. A fair fix keeps both facts: "the 2,400 bps secure-voice coder of the late 1970s, a federal standard by 1984". The maker's wording ("the standard of 1984, built through the 1970s") is also accurate.
   - It is closer to a dated correction than a change of what the page argues. Either kind will do.

Not offered by the maker, and worth Loudon's eye: the swap piece's step-4 note already says "the 1984 standard", so the face has taken offer 4's side before he has. It is accurate, and it is a small way the face and the text disagree today.

## The face as a whole

It makes the idea felt, not busy. Three pieces, one per section that has a claim worth testing, and the sections that are argument (the wide family, the Spinoza visit) are left alone. The best move is the swap piece's step 3. A made vowel's leftover is a clean buzz, and a voice's is not. Hold those two side by side and "the residual is where the soul hides" stops being a line and becomes something you can hear.

The face's weak spot is the same word the page leans on. Each time the pieces reach for "soul", they claim slightly more than they measured: "a real voice", "what the page calls the soul", "without copying the leftover". The remake asks the swap piece to say exactly what it measured. The page's thesis holds without the extra.
