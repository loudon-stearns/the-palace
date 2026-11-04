---
title: "SMPTE LTC — rich — challenge — the teaching room"
born: 2026-11-04
links:
  - target: "[[SMPTE LTC]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of SMPTE LTC's first teaching-room piece, with its numbers re-run against GoButton's ltc.js and its edge cases pushed, so Loudon can see which parts held and fix the few that didn't before it lands."
---

# Challenge: SMPTE LTC's rich face, round 1 (2026-11-04)

I read the entry as it stands in the worktree (`Projects/SMPTE LTC.md`, mainly § The fine points), the manifest, the piece, the pinned `ltc.js` and the checks. I didn't make any of them. I ran conform and the checks, then loaded the piece's `<script id="engine">` on top of the pinned `ltc.js` in Node and probed the edges myself (script kept at the session scratchpad, `probe.mjs` / `probe2.mjs`).

**Verdict: 1 piece, remake.** It's a light remake. The design is right and the core claims hold. But in states a class will reach, the piece shows two wrong numbers and makes one wrong claim, and its caption promises a check that the checks don't make. These are five small fixes, none of them structural. Then it comes back for a second verdict.

## Runs

- **conform** (`node _ops/rich-face/conform.mjs "SMPTE LTC"`): 0 errors, 2 warnings. Both warnings are `file-local`, because the piece and `ltc.js` are untracked. That's expected for an uncommitted worktree and clears when they're committed. The browser pass at 760 and 1130 px ran clean.
- **checks** (`SMPTE LTC — rich — checks.mjs`): 51 passed, 0 failed. The pinned body matches sha256 `40efd97c…`, and GoButton's original is still the same file.

## What I verified independently

- **Drop-frame across boundaries.** I tried 00:00:59;29 → 00:01:00;02, 00:09:59;29 → 00:10:00;00, 00:59:59;29 → 01:00:00;00, 01:00:59;29 → 01:01:00;02, 00:19:59;29 → 00:20:00;00, and 23:59:59;29 → 00:00:00;00. All are right. Every frame of a drop-frame day round-trips through `toFrames`/`fromFrames`, and no skipped number ever appears. 108 numbers are skipped an hour, 1080 in ten hours.
- **Behind the wall.** Without rounding, 23.976 and 29.97 fall 3.5964 s behind in an hour. The piece shows 3.625 s and 3.600 s at the hour mark, because it rounds down to the frame, and it says so. A drop-frame day comes out at 2.589 frames, or 86.4 ms.
- **`setFrame` → `frameAt`** round-trips at all six rates, sampled across a whole day.
- **The sync search** over a whole day at all six rates. With user bits all 1, the longest run outside the sync word is 9, and 7 at 25 fps. With user bits 0 it's 4. That run starts at bit 79 and crosses into the next frame, so the search really does read across frame boundaries. The sync word turns up exactly once per frame. Chunked and whole give the same answer. A day at 30 fps takes 7.9 s in Node, so "about 20 s" in a browser is plausible.
- **Technically sound:** BCD LSB-first, the field widths (4/2/4/3/4/3/4/2), polarity at bit 27 and bit 59 at 25 fps, even zeros ⇔ an even count of flips, the sync word and its reverse, and "twelve 1s then 01 forward, then 00 in reverse".

## The three questions

1. **Test or decoration?** It's a test. Every step's number comes out of GoButton's own counting and framing code, and the last step actually runs the sync word's claim across a day of frames, where it could fail and doesn't. Step 4's flipped digits come back "not a time", and step 5's polarity bit answers each user-bit click. Both are live checks, not pictures.
2. **Faithful?** Mostly. It stays inside Count and Bits, as the manifest says, and it adds nothing the section doesn't hold. The exceptions are below.
3. **Walks up?** Yes. It goes count, then rates, then drop-frame, then bits, then flags, then the sync test. One idea per step. Step 3 has a control back to plain 29.97, the rail stays open, the piece is silent, and nothing runs until a click. One concept is borrowed early: step 5 explains polarity through biphase flips, which the next stop (Wave) is meant to teach.

## Must-fix

1. **A rate switched mid-search mislabels the result.** The test piece, lines 320–324: the rate chips stay live while a search runs. `runSearch` keeps the old rate (line 523), but `drawSync` decodes the "first at" frame and the hour/day text with the new `R()` (lines 513, 517), and the done line names `S.rate` (line 538). `renderControls` also re-renders the search buttons as enabled and drops the progress text, because `btn` and `st` now point at detached nodes. **Fix:** store `acc.rate = S.rate` and `acc.user` and render from those, or ignore the rate and user-bit chips (and disable them) while `S.searching`.
2. **A negative "behind" is shown as behind.** Line 412–415: the drop-frame count runs up to 1.9 frames *ahead* of the wall at some minute turns. The first one is 00:06:00;02, at −0.040 s. `late` tests `Math.abs(b)`, so the red label reads "−0.040 s behind the wall". You reach it in step 3 at × 60, and in step 2 (which opens at × 60) by choosing 29.97 drop. **Fix:** when `b < 0`, say "ahead of the wall". Add one teach sentence to step 3 as well (line 293). Within a minute, drop-frame falls up to about 2.7 frames behind (0.076 s, which shows in red at the step's own opening jump to 00:00:59;20), and the skip pulls it back. That is the mechanism, and right now it looks like a contradiction of "keeps up".
3. **"The worst case" isn't the worst case.** Lines 303 and 345. It sets the user bits to 1 but leaves the colour-frame flag and the binary-group flags at 0. With those at 1 as well, 29.97 drop reaches a run of **10** at 00:00:07;20 (bits 9–18: frame tens, the drop-frame flag, the colour-frame flag, user bits, seconds units 7). 25 fps (with bit 10 also set) reaches 10 too. It's still under 12, so the claim holds. **Fix:** either set bits 11, 43 and 58, and the binary-group flag at 27 or 59, to 1 in the worst-case search (a stronger test that still passes), or rename the button "every user bit 1".
4. **The caption promises a check the checks don't make.** In the manifest (line 42) the caption says the checks find "no run of 1s longer than 9 outside the sync word". `checks.mjs` lines 111–113 assert only `< 12`. 9 is true (and it's 7 at 25 fps), but it isn't held. **Fix:** assert `ones.longest <= 9`, or reword the caption to "fewer than twelve; the longest is 9".
5. **A wrapped day reads as a day behind.** Line 233 together with the "+ 1 hour" buttons (lines 328, 333). After 24 presses at 24, 25 or 30 fps, the count goes round midnight and the label reads "86,400.000 s behind the wall". At 29.97 drop it reads 86,399.9. At 23.976, a 25th press gives 86,489.9. **Fix:** compare against the wall modulo one day of frames (`Ltc.dayFrames(rate) / rate.fps` seconds), and add a note: "the count has gone round midnight".

## Nice-to-have

- **The bits-step rate switch doesn't keep the time named.** Line 323: going from 30 to 29.97 drop at 00:01:00:00 lands silently on 00:00:59;28 (two frames back), because 00:01:00;00 doesn't exist there. Land on the next real number, 00:01:00;02, and say why. That's drop-frame taught again.
- **The readout doesn't catch skipped drop-frame numbers.** Line 487: a flipped word that reads 00:01:00;00 at 29.97 drop passes as a time. Add the `tc.s === 0 && tc.f < 2 && tc.m % 10` test (the same rule as `ltc.js`'s `badTime`).
- **Bit labels at 25 fps.** Line 205: bit 10 is called "the drop-frame flag" at every rate. At 25 fps it's unused (EBU has no drop-frame). Line 208: bit 58 is labelled "reserved". As I remember it, SMPTE 12M-1 now calls bit 58 binary-group flag 1, but I haven't checked that against the standard. Check it before you change the label.
- **Step 2's wording** (line 289): "six standard rates … four count as fast as they say" counts 29.97 drop as a rate, though it is 29.97 counted another way. Say "five rates, and one of them counted two ways". The entry's own "six frame rates" has the same looseness.
- **The checks don't test the display logic.** Lines 116–122 hold a re-typed copy of `runSearch`'s chunk loop, so a change to the piece's loop at lines 520–541 wouldn't fail. Move the chunk accumulator into `<script id="engine">`, and add a check on the sign and threshold of `behind`. That check would have caught must-fix 2.
- **Line 443** hard-codes `S.step === 3` for digit-clickable cells. Use a step flag (`digits: true`) like `users`.
- **Step 5's biphase explanation** borrows the next stop. Mark it as a preview ("you'll see why at the wave"), or leave it. It's honest either way.

## Second verdict, after the remake (2026-11-04): **keep**

I re-ran everything on the remade files. **conform:** 0 errors, and the same 2 untracked-file warnings as before. **checks:** 57 passed, 0 failed. Then I probed the new engine block in Node myself (`probe3.mjs`).

- **Must-fix 1, done.** A result now carries `rateKey`, `span` and `ones`, and `drawSync` renders from those (line 535). Every chip and the user-bit toggles return early while `S.searching` (lines 328, 366–367), so nothing re-renders mid-search. The done line's `S.rate` (line 558) is now safe, because the rate can't change during a search.
- **Must-fix 2, done.** `behindWords` reads "ahead" when b < 0, and the value is shown as an absolute number (line 436). Step 3's teach text now names the drift. The new check samples at mid-frame and gets −1.40 to +2.30 frames. The running display keeps the wall continuous, so it reaches about −1.9 to +2.7 (from my first probe). "A little over two" and "a frame or so" still fit. This is a nice-to-have only: sample the check at frame edges if you want it to hold the extremes too.
- **Must-fix 3, done.** `freeFlags` is 11, 43, 58, plus whichever binary-group flag isn't the polarity bit. Bit 10 stays 0 at 25 fps, which is right for EBU, so 25 fps peaks at 9, not the 10 I had. 29.97 drop reaches 10. The polarity bit still keeps the zeros even with the flags set: I sampled all six rates and found 0 odd frames.
- **Must-fix 4, done.** The caption says ≤ 10, and the checks assert `<= 10`.
- **Must-fix 5, done.** `rounds` and `behind` agree across midnight. I checked 24, 25, 48, 49 and 100 h at all six rates: 0.000 at the integer rates, 3.6 s an hour at the fractional ones, and drop-frame 2 frames ahead per day, which matches `dayResidual`. The readout names the wrap.
- **Nice-to-haves.** All are in, and I verified them: the drop-frame landing (line 344), the skipped-number readout (line 507), the 25 fps and bit 58 labels, step 2's wording, and the `digits` flag. I tested `searchChunk` against the whole search at chunk sizes 1, 7, 997 and 40000, with flags on, at 29.97 drop. It matched the whole search exactly on `longest`, on `where` and on the sync count.

Nothing must-fix remains. It's ready to land as a proposal.
