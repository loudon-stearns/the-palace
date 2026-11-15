---
title: "Web Audio Worklet — scroll"
born: 2026-11-15
links:
  - target: "[[Web Audio Worklet]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Web Audio Worklet's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# Web Audio Worklet — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Web Audio Worklet]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:11:40.141Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 4 runs on 3 days, counted from the ledger's run lines
- **Last run:** 2026-11-15 — zoom-out, the block size: renderSizeHint 128 against 256, 512, 1024 in headless Chromium, and a page for the ear, probe · taught item 16
- **Owed in the ledger:** 5 — items 12, 13, 14, 15, 16; the next run's tail read picks them up first
- **Latest lesson:** item 16, from the test proofs — 2026-11-15 — the voice ceiling, and the block size (zoom-out) — [[Web Audio Worklet — tuning]]

### Runs

- 2026-11-15 — zoom-out, the block size: renderSizeHint 128 against 256, 512, 1024 in headless Chromium, and a page for the ear, probe · taught item 16
- 2026-11-15 — the voice ceiling: Murmuration's grain voice, 8 to 1024 voices offline in Chromium, Firefox and WebKit, and a page for the ear, probe · taught items 12–15
- 2026-11-14 — the card's starter: web-smoke, conform --browser, an OfflineAudioContext render (220 Hz, RMS 0.141, L = R), probe · nothing new
- 2026-05-31 — Wavetable Scanner, sketch · taught items 7–11

### Owed

- **12.** A Blob-URL worklet does not load from a page opened straight from disk in Chrome or Safari. From `file://`, `addModule(blobURL)` fails in headless Chromium 147 ("Unable to load …
- **13.** Murmuration's grain voice works out its pan gains per sample per voice (a `cos` and a `sin` each), though a voice's pan is constant within a block. Worked out once per voice, th…
- **14.** The engine's cost, measured offline (headless, Apple M1 Max, the Mac shared with other sessions): 1.4 to 1.9 ms of one core per voice per second of sound in Chromium 147 across …
- **15.** Inside the audio thread in Chromium 147 there is no `performance.now()`; a block's time can only be read with `Date.now()`, in whole milliseconds against a 2.7 ms block. Summed …
- **16.** Zoom-out, 2026-11-15 — two platform changes since the page was written. (a) `AudioContext.playbackStats` (renamed from `playoutStats`), Chrome's Intent to Ship named Chrome 146:…

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="run-6b51e81946" -->
### 2026-11-15 — zoom-out, the block size: renderSizeHint 128 against 256, 512, 1024 in headless Chromium, and a page for the ear, probe

taught item 16
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-af97a148c0" -->
### 2026-11-15 — the voice ceiling: Murmuration's grain voice, 8 to 1024 voices offline in Chromium, Firefox and WebKit, and a page for the ear, probe

taught items 12–15
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-test-list" -->
### 2026-11-15 — the open tests, written down

The card's "not yet shown to hold" line, one test each: how it would be run, whether it needs Loudon's ear or an app only he runs, and where it stands. Two have proofs made today and wait on his ear; Murmuration live, phones and the RNBO crossover are open; Firefox and Safari are run headless but not yet heard.

**Artifacts:**
- [the test plan](Shop/Web Audio Worklet/tests/test-plan.md)

<sub>test list, 2026-11-15 · written from the card and the ledger by the session giving every Specialist a scroll of test proofs</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-render-quantum" -->
### 2026-11-15 — The same grains in bigger blocks: 128, the old way, against Chrome's new renderSizeHint

Zoom-out. Since Web Audio began, `process()` has been handed 128 frames at a time. Chrome now lets a page ask for bigger blocks (`renderSizeHint`, an origin trial from Chrome 145, named to ship in Chrome 153). This page plays one seeded cloud of Murmuration's grains at 128, 256, 512 or 1024, switchable, and says whether your Chrome honours the hint.

Measured, in headless Chromium 147 with the feature switched on by a flag: every size asked was given, `process()` saw exactly that many frames, and the sound was the same sample for sample at every size. For this engine bigger blocks gave no steady saving offline (from 20% slower to 14% faster across two runs) and did not hold off dropouts live, which fits it: nearly all its cost is per voice per sample. Without the flag the hint is ignored and nothing breaks.

**Raise the voices until 128 crackles. Then, at that same count, switch to 512. Does the crackle stop?**

Nobody has heard this.

**Artifacts:**
- [the proof, playable](Shop/Web Audio Worklet/proofs/2026-11-15-render-quantum/render-quantum.html)
- [the page after a run at 512](Shop/Web Audio Worklet/proofs/2026-11-15-render-quantum/render-quantum.png)
- [what was measured](Shop/Web Audio Worklet/proofs/2026-11-15-render-quantum/measured.json)
- [the check that measured it](Shop/Web Audio Worklet/proofs/2026-11-15-render-quantum/check.mjs)

<sub>test proof, 2026-11-15 · headless Chromium 147 (playwright 1.59.1), with and without --enable-blink-features=WebAudioConfigurableRenderQuantum · web-smoke ok, conform --browser 0 errors 0 warnings · the Mac shared with other sessions while it ran</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-voice-ceiling" -->
### 2026-11-15 — How many of Murmuration's grains before it crackles?

The card's open line "the voice ceiling heard on real hardware". The page carries Murmuration's own grain voice, its inner loop copied unchanged, and adds voices on a click while it shows how much of each audio block the voices took and, in Chrome, how many dropouts there were.

Measured offline, headless, on this Mac: 1.4 to 1.9 ms of one core per voice per second of sound in Chromium across four runs, so a core runs out between 470 and 670 voices; Murmuration's 60 take 9 to 13%. WebKit came out a little cheaper, Firefox moved threefold between runs on a busy Mac and is unsettled. Live in headless Chromium with no speakers, dropouts stayed near zero to 512 voices and ran away at 1024. Two things found on the way: the pan is worked out per sample, and working it out once per voice gives the same samples 1.3 to 2 times faster; and a Blob-URL worklet will not load from a page opened from disk in Chrome or Safari, so both proofs fall back to a data: URL (ledger items 12 to 15).

**Add voices until you hear it crackle, stutter or drop out. At what voice count does it start?** The page's "it crackles here" button writes the count down beside the numbers.

Nobody has heard this.

**Artifacts:**
- [the proof, playable](Shop/Web Audio Worklet/proofs/2026-11-15-voice-ceiling/voice-ceiling.html)
- [the page after a mark at 144 voices](Shop/Web Audio Worklet/proofs/2026-11-15-voice-ceiling/voice-ceiling.png)
- [what was measured](Shop/Web Audio Worklet/proofs/2026-11-15-voice-ceiling/measured.json)
- [the check that measured it](Shop/Web Audio Worklet/proofs/2026-11-15-voice-ceiling/check.mjs)

<sub>test proof, 2026-11-15 · offline renders of 8 to 1024 voices, 2 s at 48 kHz, best of 3, in headless Chromium 147, Firefox 148 and WebKit 26.4 (playwright 1.59.1) · web-smoke ok, conform --browser 0 errors 0 warnings · the Mac shared with other sessions (load average 40 to 125)</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-06cefae331" -->
### 2026-11-14 — the card's starter: web-smoke, conform --browser, an OfflineAudioContext render (220 Hz, RMS 0.141, L = R), probe

nothing new
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-81c2d6efad" -->
### 2026-05-31 — Wavetable Scanner, sketch

taught items 7–11
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
