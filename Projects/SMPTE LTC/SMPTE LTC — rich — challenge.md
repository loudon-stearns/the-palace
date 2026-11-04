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

---

## Second challenge, after the 2026-11-04 rewrite

*2026-11-04 · challenger · claude-opus-5-5 · I made none of these pieces.* Read against `Projects/SMPTE LTC.md` as rewritten (ca1101ef), with the encoder now anchored in **Every form** at "The good reader measures the bit length as it goes", and the backward reader in **The fine points** at "The sync word". The teaching room is not judged here. Verdicts: **0 keep, 2 remake, 0 retire.** Both engines hold; both pieces still argue with, or count for, a page that is gone, and each leaves its new anchor's sharpest claim untested.

### Checks run

- `check.mjs`: all PASS, every number in the captions reproduced.
- `conform.mjs "SMPTE LTC"`: 3 pieces, 0 piece errors, 0 warnings, browser pass at 760 and 1130 px. The one error is the known `ref-missing` on the retired drop-frame piece's kept verdict line.
- `fingerprint.mjs`: The fine points 9e11caf7739c, Every form 732162fd789c, both in step.
- `challenge-check.mjs`: still runs clean (reversed buffer, resampler edge, band share 88.8% at 25 fps).
- My own route (scratchpad, not kept), pulling the pieces' `ltc-core` and the bundle's GoButton `ltc.js` into Node:
  - **The pieces' core agrees with the page's specification.** Over every frame of a day — 2,073,600 at 24, 2,160,000 at 25, 2,589,408 at 29.97 drop — the core's `encode` and `ltc.js`'s `frameBits` give the same eighty bits, 0 words differing, and the core's drop-frame labels match `fromFrames`, 0 differing.
  - **The encoder's rate guess does not name the rate.** The number the piece prints is the reader's last smoothed cell length. Run through `ltc.js`'s own `nameRate` (0.05%): 24 fps reads 23.985 fps and is named **23.976**; 29.97 reads 29.950 and is named nothing. Timing sync word to sync word instead gives 23.9760, 24.0000, 25.0000, 29.9700, 29.9700 and 30.0000 and names all six right, drop flag included. The piece's reader, given the three rates it lacks (23.976, 29.97 non-drop, 30), reads 50/50 at each.
  - **The sync word's spacing tells the speed exactly.** On the backward piece's time-scaled tape, speed from sync-to-sync came out 8.0000, 4.0000, 2.0000, 1.0000, 0.5000 and 0.1000 backward and 0.1000, 0.5000, 2.0000 and 6.0000 forward. The piece never shows it.
  - **Rate and speed are one measurement.** A 25 fps tape played 1.2× fast is named **30** by `ltc.js`'s decoder (30.0022 fps); 24 fps slowed by 1000/1001 is named 23.976; 29.97 sped by 1001/1000 is named nothing. A reader can name the rate only if it assumes 1×, and the speed only if it knows the rate. Frame numbers that never pass 24 hint 25 rather than 30; nothing tells a 0.1% pull from the fractional rate.

### Every form · `SMPTE LTC — rich — encoder.html` — **remake**

1. **Test or decoration?** Half a test of its new anchor. "One reader reads every rate" is run, at three of the six rates the room counts. "And says which it hears" is not: the piece prints a bit-rate guess beside "(sent …)" and never names a rate, and the guess it prints would name 24 as 23.976 by the specification's own rule. The caption cites 1918.8, 1999.9 and 2396.0 bit/s as if they were the answer.
2. **Faithful to the current text?** Engine yes (above). Words no: three places still count the page's rates as three, where the page now names four bit rates and the room six frame rates.
3. **Walks up?** Yes: one cell, eighty bits, the waveform, then the reader told nothing, last.

**Must fix:**
- `encoder.html:337–385` (`read`) and `:618` (the table) — measure the rate from the sync words' spacing (mean of `frames[i].t − frames[i−1].t`), not the last `P`, and name it by `ltc.js`'s rule (`nameRate`: within 0.05%, drop flag from bit 10). A row passes only if the name is right.
- `encoder.html:184–188` (`RATES`, shared core: change both pieces) and `:613` — add 23.976, 29.97 non-drop and 30, so "every rate" is the page's every rate.
- `encoder.html:636` — "the three rates the page names come out of the encoder exactly" → "the page's four bit rates, 1920, 2000, 2400 and 2397.6, come out of the encoder exactly".
- `encoder.html:581` — "the page says 1920, 2000 and 2397.6" → "the page says 1920 at 24, 2000 at 25, 2400 at 30, 2397.6 at 29.97".
- `encoder.html:6` (forward_vector, "the page's three rates") and `:623` (verdict, "at all three rates") — follow the rate change.
- `SMPTE LTC — rich.json:133` (caption) — replace "guessed the bit rate from the gaps alone (1918.8, 1999.9, 2396.0 bit/s)" and "three of the page's four rates" with the rates as named.

### The fine points · `SMPTE LTC — rich — backward.html` — **remake** (second verdict, after the 90591477 remake)

The 90591477 remake did what the first challenge asked: the reversed-buffer rows are in, speeds are named as time-scaled, the resampler is printed beside them, ±12×/±16× are the limit and not judged. That part holds.

1. **Test or decoration?** A real test of "LTC reads in reverse and at varispeed" and "read backward it tells the reader the tape is running in reverse". The forward-only control can fail. But the anchor's third claim, "its length tells the speed", is untested, though the reader already has what it needs. Step 1 (the spectrum) answered "can you hear LTC?", which is no longer asked. Its honest home now is the **Level and edge** bullet: a harsh buzz in a monitor mix, nothing musical in its path.
2. **Faithful to the current text?** No. The whole frame argues with a page that is gone: the eyebrow, the lead, the rule, the step texts and the verdict quote a guess the page now states the other way.
3. **Walks up?** Yes, once step 1 leans toward what follows: the sound at 1×, the sync word both ways, speeds by ear, then the test.

**Must fix:**
- `backward.html:122` (lead) — replace "The page asks whether you can hear LTC, and guesses it probably cannot be read backward or at fractional speeds" with the current claim: "The page says the sync word is not symmetrical, so read backward it tells the reader the tape runs in reverse, and its length tells the speed."
- `backward.html:120` (eyebrow "two open questions") → "the sync word"; `:16` (`<title>`) → "read backward and at speed".
- `backward.html:158` — "First, the page’s own case:" → "First, a recording reversed:"; `:159` — "The page’s guess is borne out if …" → "The page's claim fails if …"; `:561` (comment) and `:618` ("First the page’s own case") the same.
- `backward.html:602` (verdict) — delete "That is the page’s own case, and its guess, “probably not, the biphase code assumes forward continuous time”, does not hold for this reader." In its place: "That is the page's 'LTC reads in reverse', run."
- `backward.html:609` (step 1) — drop "“Can you hear LTC?” is a question about ears". Lean it on Level and edge: about 89% of the power sits in 500 Hz–3 kHz, where music does, which is why it buzzes in a monitor mix and why no EQ, compressor or codec belongs in its path. Keep "no agent heard this".
- `backward.html:582/595` (the table) — add a "speed read" column: the frame rate measured from the sync words' spacing ÷ 25, passing within 0.1%. That is "its length tells the speed", run.
- `backward.html:6` (forward_vector) — "answers two of the page's open questions" goes. "Nine speeds each way" is ten (`:470`).
- `SMPTE LTC — rich.json:82` (caption) — rewrite away from "Can you hear it … a question for your ears" and "The page's own case first".

### Nice to have (both)

- **Hold the core to `ltc.js` in `check.mjs`.** The page says every other build is held to the specification, and I ran it: 0 differing words over a day at three rates. With that check in place, `encoder.html:177`'s footer can say "agrees with GoButton's ltc.js over every frame of a day" instead of "unchecked against the standard here".
- `check.mjs:5–6, 38, 67, 95, 109, 138` still name "Technical Architecture", "Open Questions" and "the page's three bit rates", and `pageRates` is hard-coded; add 30 → 2400.
- **Show the confound.** One row in the encoder's test, 25 fps played 1.2× fast, named 30, would make "says which it hears" honest about what it assumes. Below I offer it to the text.
- `backward.html:579` — "20 speeds two ways" → "twenty speeds, ten each way".
- The encoder caption's "edges are 40 µs" is the width of the averaging box; 10–90% that is about 32 µs, against the page's "about 25 µs". Say which one is meant.
- Both pieces are prior art for the room's Read and Break it stops (varispeed, reverse, wrong rate). When the room reaches them, port them onto `ltc.js`, and ask then whether these two still earn a place of their own.

### An offer for the text (for the carrier, not a piece fix)

- **Every form + The fine points · claim-change.** "One reader reads every rate and says which it hears" and "its length tells the speed" are one measurement read two ways. A reader names the rate only if it assumes 1×, and the speed only if it knows the rate. Evidence: `ltc.js`'s decoder names a 25 fps tape at 1.2× as "30", and 24 fps slowed by 1000/1001 as "23.976". A frame count that never passes 24 hints 25 rather than 30; nothing separates a 0.1% pull from the fractional rate. Carried to Loudon as a claim-change, through the Deposit map.

### Second verdict, on the remake (uncommitted, on top of 5763e862)

*2026-11-04 · challenger · claude-opus-5-5.* I read the diff against every must-fix above and re-ran everything. Verdicts: **2 keep, 0 remake, 0 retire.**

**Checks.** `check.mjs` passes everything at six rates. `conform` shows 0 piece errors, 0 warnings, and only the known drop-frame `ref-missing`. The two cores are identical, 16,075 characters each.

My own route:
- **Bits.** Against `ltc.js`, the core gives the same bits at all six rates: 0 words differ, sampling every 7th frame of a day.
- **Rate naming.** The new `read()` names the rate right on fresh noise seeds and start times:
  - 30 across midnight (23:59:58 on);
  - 29.97 drop with every user bit set;
  - 29.97 non-drop with mixed user bits;
  - a six-frame 23.976 run;
  - 23.976, 29.97 non-drop and 30 at 44.1 kHz.

  50/50 everywhere, 0 wrong.
- **The assumption.** A 25 fps tape at 1.2× is named "30" (30.0001 fps). That is exactly what the rule text now says it assumes.

**encoder.html: keep.** Every must-fix is met:
- the rate comes from the sync-word spacing, by `ltc.js`'s 0.05% rule, and a row passes only if the name is right;
- six rates, plus flip and control;
- the stale "three rates" text is gone at `:6`, `:581`, `:623` and `:636`;
- the caption is updated, and so is the 32 µs edge.

One leftover, not blocking: `:571` still says "bit 27 at 24 and 29.97" and "checked … at all three rates". The check now covers six, so write "bit 27 at every other rate" and "at all six rates".

**backward.html: keep.** Every must-fix is met:
- the frame now rests on the page's current claim;
- step 1 is tied to the monitor-mix buzz;
- the "page's own case" and "probably not" lines are gone;
- six reversed rows;
- a speed-read column, judged to 0.1% (8.0001 down to 0.1000 either way);
- "ten speeds each way";
- the caption is updated.

**Still open (nice to have):**
- Both cores' `:186`/`:194` comments and the encoder footer at `:177` still say "unchecked against the standard". The core is now checked against `ltc.js`, so they could say so, once `check.mjs` asserts it.
- Moving both pieces onto `ltc.js` waits for the room's Read stop.
