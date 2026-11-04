---
title: "SMPTE LTC — rich — challenge"
born: 2026-11-04
links:
  - target: "[[SMPTE LTC]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of SMPTE LTC's proposed rich face, piece by piece and offer by offer, with the numbers re-run by a second route, so Loudon can take or leave each one knowing which parts held when someone else pushed on them."
---

# Challenge — SMPTE LTC's rich face, proposal round 2026-11, cloud batch 4

Read against `Projects/SMPTE LTC.md` as it stands in the worktree, the manifest, all three pieces' source, `SMPTE LTC — rich — check.mjs`, and the maker's commit body (c2468b25). I didn't make any of this. Verdicts: **2 keep, 1 remake, 0 retire.**

## The pieces

### Technical Architecture · `SMPTE LTC — rich — encoder.html` (made) — **keep**

1. **Test or decoration?** A test. The last step hands a reader `read(y, sr)` (the samples and the sample rate, nothing else: no rate, no polarity, no cell phase) fifty frames through a 10 Hz high-pass with noise 30 dB down. If the page's "self-clocking" claim were wrong, that reader would come back empty. It reads 50/50 at 24, 25 and 29.97 fps and with the polarity flipped. It guesses 1918.8, 1999.9 and 2396.0 bit/s from the gaps. The check script also confirms that the rendered audio flips at every cell boundary and mid-cell on exactly the 1s (0 faults at all three rates). The NRZ control (0/50) is weak: a biphase reader fails on NRZ almost by construction. It does show the claim the page makes, though, that the clock lives in the flips. That's a note, not a remake.
2. **Faithful?** Yes. The bit rates are the page's own: 80 × fps gives 1920, 2000 and 2397.6024. I checked the bit map (`FIELDS`, `encode`) against SMPTE 12M from my own memory, which is a second recollection and not the standard. It agrees field for field:
   - frame units 0–3, frame tens 8–9, drop-frame flag 10, colour-frame flag 11
   - seconds 16–19 and 24–26, minutes 32–35 and 40–42, hours 48–51 and 56–57
   - user bits in the eight nibbles at 4, 12, 20, 28, 36, 44, 52 and 60
   - sync word 64–79 = 0011 1111 1111 1101, sent in that order
   - the polarity bit at 27, or 59 at 25 fps, set so the word holds an even count. With 80 bits, an even count of 1s means an even count of 0s, which is what the standard asks for.

   I found no discrepancy. Two small things a reader with the standard might raise: the render's edges are 40 µs, where 12M asks 25 ± 5 µs, and bits 43 and 58 are left at 0. Neither changes a result.
3. **Walks up?** Yes: one cell, then eighty bits, then the waveform, then the test, which comes last.

### Technical Architecture · `SMPTE LTC — rich — drop-frame.html` (made) — **keep**

1. **Test or decoration?** A test. It labels every frame of a day by the rule, turns each label back into a frame, and checks it against the forbidden set. If the rule were the sentence read as "every minute", it would fail by 0.40 s at one hour, against a one-frame (33.4 ms) bar. The rule is stated before the walk.
2. **Faithful?** Yes. It names the sentence's missing half ("the half of the rule the sentence leaves out") and doesn't call the page wrong. My own counter (`challenge-check.mjs`, no shared code) walked 2,589,408 frames. That is 30 × 86,400 = 2,592,000 labels, less 2 × 54 × 24 = 2,592 skipped. The ten-minute mark sits +0.600 ms, the hour +3.600 ms, and the hour-1 swing runs −60.0 to +63.5 ms. All match.

   **Note:** step 4 says "86.4 ms a day", the caption "2.59 frames", and the offer "86.3 ms". Both day numbers are right, but they are measured at different marks:
   - at the label's 24:00:00;00 the clock reads 86,399.9136 s, so the label is 86.4 ms ahead (2.589 frames);
   - at wall-clock 24 h the label is 86.3 ms ahead.

   Pick one, name the mark, and use it everywhere. The sign is settled: the label runs ahead.
3. **Walks up?** Yes, in five silent steps: count, fall behind, over-correct, the exception, then the day.

### Open Questions · `SMPTE LTC — rich — backward.html` (made) — **remake**

1. **Test or decoration?** A real test of the page's guess. I rebuilt the page's own situation: render a 1× tape, **reverse the sample buffer** (the decoder untouched), then high-pass it and add noise after the reversal. The reader read 50/50 at 24, 25 and 29.97 fps, 0 wrong, direction right every time. So the refutation stands. The control holds too: the forward-only reader read 0 on every backward row, and a palindromic sync word breaks the check, per the maker. The test can fail.
2. **Faithful?** Its central finding is faithful. Its speed edge is not. Speeds are rendered by time-scaling the tape: each sample is the tape averaged over the stretch under the head, which is an ideal anti-alias filter. That isn't the chain a tape machine or a DAW shuttle uses; they resample a buffer. Through a 1× buffer resampled by linear interpolation:
   - 50/50 at every speed from ±0.1× to ±6×
   - −8×: 24/50; −10×: 0/50; +8× and +10×: 50/50
   - −12×: 50/50; +12× and ±16×: 0

   So the shortcut changes the edge, not the yes. The panel's rule says that if ±12× passed, "the reader would be reading something other than the audio". That's false. At 12× a half cell is exactly one sample (2 kHz × 12 = 24 kHz, Nyquist at 48 kHz). That makes decoding marginal, not impossible, and one of my buffers read every frame there. The "fails, as it must" tag repeats the error.
3. **Walks up?** Yes: hear it, the sync word both ways, speeds by ear, then the test.

"Can you hear LTC?" is handled honestly. The step plays only on a click, with the AudioContext made on that click and the default level −24 dBFS. It shows the spectrum of the buffer actually playing and claims nothing about hearing. My own FFT gives 88.8% of power in 500 Hz–3 kHz at 25 fps, against the maker's 88.7% (90.1% at 24 fps, 85.7% at 29.97 fps). One sentence, "a filter that removed it would remove that band of the mix", is spectral and true, and leans only lightly on the page's "should it be filtered?".

**The remake, exactly:**
1. Recast the ±12×/±16× rows from "must fail" to "the expected limit, near Nyquist". Count them as neither a pass nor a fail, and delete "would be reading something other than the audio" and "as it must".
2. Add the page's own case as a row: a 1× render with its sample buffer reversed, which reads 50/50.
3. Say in the rule that speeds are time-scaled (ideal anti-alias). State that through a plain resampler the clean edge here was ±6×, not ±8×.

That's one round of work.

## Checks run

- `conform.mjs "SMPTE LTC"`: 3 pieces, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `fingerprint.mjs`: Technical Architecture 9fd3f82b1fef and Open Questions 8268c2be33d2, both in step.
- Face served with rich-server and loaded headless in Chromium. I scrolled through it and clicked each piece's last step and run. All three verdicts read "Pass" or "Backward reads". The console showed only the server's Permissions-Policy 'bluetooth' warning, three times, and no piece errors. All pieces are fully inline: no CDN, no external fetch.
- The maker's `check.mjs`: all PASS, and every number in the commit body reproduced.
- My `SMPTE LTC — rich — challenge-check.mjs`: the reversed buffer, the resampled speeds, an independent drop-frame walker, and the band share by my own FFT. Numbers are above.
- Not checked: whether a hidden page hushes, which I didn't drive. Nobody, me included, heard any of this sound. There are no blind listening trials on this face, so there was no leak to probe.

## The offers

1. **Open Questions · claim-change: reverse playback is "yes".** **Confirmed**, with an amendment. Kind and home are right. My reversed-buffer read was 50/50 at three rates, 0 wrong, direction right. Amend the wording: drop "as it must" and the hard ±8× / ±12× edge. Say instead "read at every speed tried from 0.1× to 6× either way through a plain resampler (to 8× with ideal time-scaling); the limit is the sample rate and how the audio is resampled, not the code." Keep "no hardware reader tested."
2. **Technical Architecture · no-claim-edit: name the tenth-minute exception.** **Confirmed**, kind right. The numbers:
   - 403.6 ms ahead per wall-clock hour for every-minute skipping (404.0 per labelled hour)
   - 3.60 ms per hour for the real rule
   - a swing of −60.0 to +63.5 ms between marks

   The page's sentence is incomplete, not literally wrong: "at minute boundaries" never says *every* minute. Lead with "the sentence leaves out the exception". The 403.6 ms figure can stay as what the exception buys, not as a misreading charged to the page.
3. **Open Questions · no-claim-edit: the long-run arithmetic answered.** The numbers are confirmed, but **relabel it claim-change**. It adds a measured answer the page doesn't hold, which is a new claim, not a restated definition. Fix the number to match the piece: "86.4 ms (2.59 frames) ahead when the label reaches 24:00:00;00" (86.3 ms is the figure at wall-clock 24 h). Keep "whether the Max patch counts this way is untested."
4. **What SMPTE LTC Is · no-claim-edit: "peak detection".** **Confirmed as a wording edit**, kind right, but I dispute the framing. It isn't a contradiction. On LTC's flat-topped square, the peaks of the raw signal carry no timing. A reader that peak-detects the *differentiated* signal is detecting transitions. So "peak detection" is a loose word for the same reader, not a second reader. Present it as "loose", not "disagrees". Drop the polarity-flip sentence as evidence: a derivative-|peak| reader is just as indifferent to polarity, so it can't tell the two apart.

## The face as a whole

It makes the idea felt. Time becomes eighty flips, and a reader that knows nothing pulls the clock back out of them. A counter skips names to stay honest, and the face shows exactly how much honesty that buys. It is a test-heavy face, not a busy one: every piece ends on something that could have come out the other way, and one of them overturns the page's own guess. That refutation survived my rebuild of the page's situation. What needs tightening is the edge of the backward table, where a rendering convenience is presented as a law. The yes is solid. The "must fail" is not.
