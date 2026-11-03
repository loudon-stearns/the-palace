---
title: "Rational Hearing — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Rational Hearing]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of Rational Hearing's first proposal round: three pieces kept with notes, the maker's offer confirmed in its numbers and disputed in its wording, and the live page's hush gap handed to its steward."
---

# Rational Hearing — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03, on the maker's commit `ac61e807` in the worktree `enrich/rational-hearing`. I read the page whole, the manifest, the made piece's source, its checks file, the two gathered pieces, the maker's commit body, and the steward's latest cycle (cycle 2, 2026-10-30: the projector draft ask `rational-hearing-steward-007` and the review ask `-002`, both open) and scroll.

## Checks run

- `conform.mjs "Rational Hearing"`: the made piece is clean (introduced, 0 errors, 0 warnings). The gathered `rational-hearing.html` has 3 errors: grant-missing for fonts.googleapis.com and fonts.gstatic.com, and hush-loud ("1 context still sounding 1.5 s after rich:hush at 760 px").
- `fingerprint.mjs`: both made sections in step (`c00b23328389`, `47336ff35513`).
- The maker's checks (`Rational Hearing — proof — rich face checks.mjs`): 46 passed, 0 failed.
- The face served and loaded in headless Chromium at 1300 px: no console messages and no page errors; both frames report height (1186, 2446); three `proposal` chips.
- A hush probe on the gathered page: sound on, one A/B column tapped, `rich:hush` posted. 0.5 s later the context was still `running` and the A/B's oscillators were still scheduled to stop 0.7 and 2.3 s later.
- An independent recompute (my own render and envelope, not the piece's engine), from the interval ratios and seven harmonics at 1/i. The numbers are below.

## The three questions, piece by piece

### The idea in one breath — `Rational Hearing — rich — the miss, blind.html` — keep

1. **Test or decoration?** It is a test. Steps 2 and 3 check the beat rule against an envelope measured from the sound itself. Step 5 is a blind staircase whose answer can land on either side of the piano's miss: "the miss hides" is one of its outcomes, so it could find against the section's "lets you hear it".
2. **Faithful?** Yes. The five misses match the page's table (−1.955, +1.955, +13.686, −15.641, +15.641 ¢). Step 1's "every second partial of G lands on every third partial of C" and the rule's "low note's p-th, high note's q-th" are both right. It tests five intervals and the page claims eleven; the source says why (only these five have partials that meet within seven harmonics) but the piece never tells the reader. There is also one honest gap to name. The page's own A/B plays both dyads from the same root, so the top note steps by the whole miss: 2.0 ¢ for P5 and P4, 3.9 for M2 and −7, 9.8–15.6 for the rest. The test's ±40 ¢ root rove takes that step away on purpose. So it measures whether the ratio itself sounds off, which is a stricter question than whether the page's A/B can be told apart. For the fifth the two questions almost coincide, because 2 ¢ is under most ears' pitch step. For the thirds they don't.
3. **Walks up?** Yes: 3:2 standing still, then a few cents off, then sines only, then the piano's five, then the test last. The step tabs let a reader jump ahead, but the piece opens on step 1.
- **Runs clean.** Its context does not exist before a click. The kit hushes it, since the piece doesn't speak `rich:hush` itself, and its `statechange` handler then stops the sources (line 334). It needs no untracked file and copies nothing licensed. Google Fonts are loaded undeclared, which conform allows.
- **Caption honest.** It is. "A single run can stray by a third" is a little light: the 80 % band for a listener at 1.46 ¢ runs 1.04–2.07 ¢, which is −29 / +42 %.
- **Notes for the maker, not a remake:**
  - In step 5, one sentence that the rove removes the top note's step, so this is the ratio heard, not the page's A/B.
  - In step 4, one line on why only five intervals.
  - "Up to 40 %" in place of "a third".
  - Minor: the output compressor (threshold −10 dB) sees peaks of about −8.4 dBFS at the top of the level rove, so it may shave a beating dyad's swells slightly. That cannot leak which dyad is whole, only shrink the cue a little.

### The page — `rational-hearing.html` — keep

1. **Test or decoration?** Neither, quite. The section describes this page, so laying it whole is the section itself.
2. **Faithful?** Yes. The ladder, the two bodies and the just-against-equal strip are as the text says. The caption's "Loudon heard it on 2026-10-29 and said the sound works" is on the scroll's Now.
3. **Walks up?** That doesn't apply to a gathered artifact.
- **Its three conform errors stand, and they are the steward's.** The two font grants are Loudon's call. The hush-loud is a real finding (see the offers below).

### The page — `back-row/backrow-temper-x5-strip.png` — keep

1. **Test or decoration?** A test. It measures the text's "Magnify ×5 for the back of the room" and finds ×5 just enough for the fifth's 2 ¢ gap: about 5 arcmin at 8 screen-heights, against roughly 1 arcmin at ×1. That could have come out short.
2. **Faithful?** It matches the steward's report: the prose says "4 to 5 arcmin", the table 5.3′. One inconsistency inside the report itself: its prose says 1.4 px at ×1 and its 720p table says 1.8 px. The caption follows the prose, and both hide under the 10 px bar. The caption says plainly that this is headless.
3. **Walks up?** It is one figure, a single read. The strip is tracked, and it reads at band width.

## The offers

**The maker's offer (The idea in one breath · claim-change): numbers confirmed, wording disputed.**

My recompute at C4 and seven harmonics, ET from the same root, closest pair of partials, just → tempered:

| | Hz, just → tempered | swells in a 1.35 s dyad |
|---|---|---|
| P5 | 0 → 0.89 | 1.20 |
| P4 | 0 → 1.18 | 1.60 |
| M3 | 0 → 10.38 | |
| −3 | 0 → 14.12 | |
| M6 | 0 → 11.87 | |
| −6 | 52.3 → 45.7 | |
| M2 | 32.7 → 32.0 | |
| −7 | 29.1 → 33.3 | |
| M7 | 32.7 → 29.4 | |
| −2 | 17.4 → 15.6 | |
| T.T. | 29.1 → 18.6 | |

The beat rule for 3:2 two cents wide gives |2·f_G − 3·f_C| = 0.9073 Hz, and the engine's envelope gives 0.905. With six cents off, the rich tone's envelope swings 10.75 % and plain sines 0.015 %. That is because pure sines at 3:2 share no partial. The beat lives between C's 3rd and G's 2nd, which only complex tones have. So the beat-rate half of the offer holds.

Two things the offer misses:

- **The page can also play from A3**, the A button, root 220 Hz. There everything scales by 0.84: P5 0.74 Hz, about one swell; −2 13.1 Hz and T.T. 15.6 Hz. So "15 Hz or more" holds only at C.
- **More important: the page's A/B keeps the root, so the top note steps by the miss** — 9.8 to 15.6 ¢ on −6, M7, −2, T.T., the thirds and M6, and 3.9 ¢ on M2 and −7. A step of 10–16 ¢ between two successive notes is well above most ears' pitch step in this register. So for those columns, "lets you hear it" holds through pitch, with no beat at all.

The suggested wording, "as beating where the two notes share a partial", would deny that route. A truer reading: "lets you hear it" is not wrong. It holds unevenly, and it is weakest exactly at the fifth and fourth, where a 2 ¢ step and one slow swell in 1.4 s is all there is. The fix the offer's last sentence names (a longer hold at the plan's A/B decision) is the better route than rewording. That decision is plan move 4 and waits on Loudon.

**New offer (→ rational-hearing.html · no-claim-edit): hush-loud, confirmed.** The page answers `rich:hush` itself (line 418), so the kit leaves it alone. Its answer, `setSound(false)`, only takes the master gain to 0 (line 409), and the context keeps running. An A/B in flight plays on to its end, because `playCompare` connects past the master, straight to the compressor (lines 659–661). That can be up to about 3 s of sound after the face asked for quiet, for example over the made piece once a reader starts it. Written into the manifest as an open offer for the steward, with a fix.

A side finding from the same code: the A/B's oscillators all start at sine phase 0, so the page's just dyad plays about 0.5 dB louder than its tempered one (recomputed 0.504 dB for the fifth). That is the level cue the maker found. In the piece, random phases alone take it to a mean of +0.007 dB (5–95 %: −0.51 to +0.50, just louder 52.5 % of 200), and the ±1 dB rove adds margin. So the piece closes the level cue. Once the level is gone, the root is roved and the order is random, every cue still left — slow swell, roughness, interval width — is the miss itself, not an artifact. The tone colour is the same in both dyads. The staircase's thresholds against simulated listeners prove only that the procedure finds a known 70.7 % point (median within 7 % at 0.44, 1.46 and 4.39 ¢). They say nothing about a human ear, and the caption says so.

## The face as a whole

The page's idea is that the interval is already inside one note and that the piano misses it. This face makes that felt rather than busy. The made piece turns the strip's drawn offset into a question your own ear answers, and step 3 (take the partials away and the beat goes) is the section's first sentence proved from the other side. The strip beside the magnifier pairs well with it: the eye needs the gap drawn five times over, and the piece asks what the ear needs. What it doesn't yet do is say where the eye and the ear part company: the page's A/B is easier than the blind test, because it leaves the pitch step in. That is one sentence for the maker. The larger question, how long the A/B should hold, is Loudon's at plan move 4. Nothing here has been heard by a person yet.
