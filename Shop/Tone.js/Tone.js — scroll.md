---
title: "Tone.js — scroll"
born: 2026-11-15
links:
  - target: "[[Tone.js]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Tone.js's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# Tone.js — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Tone.js]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:11:39.586Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 4 runs on 3 days, counted from the ledger's run lines
- **Last run:** 2026-11-15 — tone 15.0.4 against 15.1.22 and 15.5.72, one patch, switchable (`proofs/2026-11-15-version-switch/`): web-smoke, conform --browser 2 off-shelf errors expected, check.mjs 11 of 11, probe · taught items 5 and 6, owed a review
- **Owed in the ledger:** 4 — items 3, 4, 5, 6; the next run's tail read picks them up first
- **Latest lesson:** item 6, from the test proofs — 2026-11-15 — two probes — [[Tone.js — tuning]]

### Runs

- 2026-11-15 — tone 15.0.4 against 15.1.22 and 15.5.72, one patch, switchable (`proofs/2026-11-15-version-switch/`): web-smoke, conform --browser 2 off-shelf errors expected, check.mjs 11 of 11, probe · taught items 5 and 6, owed a review
- 2026-11-15 — a two-bar phrase on the Transport through a PolySynth, delay, reverb and limiter (`proofs/2026-11-15-polysynth-transport/`): web-smoke, conform --browser clean, check.mjs 14 of 14, probe · taught item 4, owed a review
- 2026-11-14 — the card's starter: web-smoke, conform --browser, a Tone.Offline render (220 Hz, RMS 0.087), probe · taught item 3, owed a review
- 2026-06-16 — `Shop/Maker/run-tests.mjs` web-smoke, probe · nothing new

### Owed

- **3.** Loading `tone@15.0.4` makes one `AudioContext` straight away, in `suspended` state, before any click. Counted in headless Chromium by wrapping the `AudioContext` constructor on …
- **4.** The Transport, a PolySynth and an effect chain worked together on the first try, and two things showed up. Proof: `proofs/2026-11-15-polysynth-transport/`, a two-bar looping `To…
- **5.** On the shelf's tone 15.0.4, and on npm's latest 15.1.22, an oscillator with a partial count plays at the wrong pitch when a second context runs at a different sample rate. Rende…
- **6.** Zoom-out, 2026-11-15: what changed in Tone since the page's 15.0.4 (published 2024-05-15). Sources: the npm registry, read 2026-11-15 (https://registry.npmjs.org/tone): `latest`…

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
<!-- scroll:entry id="run-487280e7a7" -->
### 2026-11-15 — tone 15.0.4 against 15.1.22 and 15.5.72, one patch, switchable (`proofs/2026-11-15-version-switch/`): web-smoke, conform --browser 2 off-shelf errors expected, check.mjs 11 of 11, probe

taught items 5 and 6, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-0f9d6fb096" -->
### 2026-11-15 — a two-bar phrase on the Transport through a PolySynth, delay, reverb and limiter (`proofs/2026-11-15-polysynth-transport/`): web-smoke, conform --browser clean, check.mjs 14 of 14, probe

taught item 4, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-test-list" -->
### 2026-11-15 — The open tests, written down

Every item on the card's "Not yet shown to hold" line, and every item the ledger still owes, now has one line in the test plan. Each line says how it would be tested, whether it needs Loudon's ear, his phone or only a script, and where it stands. Transport sequencing and PolySynth have a proof as of today. The effect chain is partly proven: the limiter never acted. Samples, the phone and a Piece are open; the phone tests are his to run.

**Artifacts:**
- [the test plan, open tests at the end](Shop/Tone.js/tests/test-plan.md)

<sub>written 2026-11-15 by the session making Tone.js's test proofs · from the card and the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-version-switch" -->
### 2026-11-15 — Three versions of Tone, one patch: the shelf's version goes out of tune at a second sample rate

The zoom-out. The shelf pins tone 15.0.4 (May 2024). npm's latest is 15.1.22, and the `next` line reached 15.5.72 yesterday, with 208 commits since 15.1.22, most of them timing fixes. This page loads all three and plays the same patch, the phrase from the Transport proof below. Each version renders it twice, first at 44.1 kHz and then at 48 kHz, as a page that both plays live and exports would.

What was measured: at one sample rate the three versions make the same sound (they differ by -140 dB) and fire every note at the same time. The second render is where they part. In 15.0.4 and 15.1.22 the A3 that should be 220 Hz plays at 239.5 Hz, 1.47 semitones sharp. In 15.5.72 it is 220 Hz. It is a cache bug Tone fixed on 2026-10-22 (#1528), and it hits voices with a partial count, like the `triangle8` here, not plain `triangle` or `sine`. The position readout fix also shows: 15.0.4 can display `0:2:4` where 15.5.72 shows `0:3:0`. On the live clock, through repeated stop/starts, no version doubled or skipped a tick, so the other timing fixes did not show here. Moving the pin is a review's call, not this page's.

**Play 15.0.4's first render, then its second. Without the numbers, would you have heard that the second one is out of tune?**

Nobody has heard this.

**Artifacts:**
- [the three versions, switchable, playable](Shop/Tone.js/proofs/2026-11-15-version-switch/version-switch.html)
- [15.0.4, first render, 44.1 kHz](Shop/Tone.js/proofs/2026-11-15-version-switch/tone-15-0-4-first-44k.m4a)
- [15.0.4, second render, 48 kHz (sharp)](Shop/Tone.js/proofs/2026-11-15-version-switch/tone-15-0-4-second-48k.m4a)
- [15.5.72, first render, 44.1 kHz](Shop/Tone.js/proofs/2026-11-15-version-switch/tone-15-5-72-first-44k.m4a)
- [15.5.72, second render, 48 kHz](Shop/Tone.js/proofs/2026-11-15-version-switch/tone-15-5-72-second-48k.m4a)
- [the page after the check played both](Shop/Tone.js/proofs/2026-11-15-version-switch/version-switch.png)
- [what was measured](Shop/Tone.js/proofs/2026-11-15-version-switch/measured.json)
- [the check](Shop/Tone.js/proofs/2026-11-15-version-switch/check.mjs)

<sub>test proof, 2026-11-15 · tone 15.0.4, 15.1.22 and 15.5.72 from jsdelivr, Tone.Offline in headless Chromium · check.mjs 11 of 11; conform --browser flags the two new versions as off the shelf, expected · ledger items 5 and 6, owed a review</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-polysynth-transport" -->
### 2026-11-15 — A phrase on the Transport, through a PolySynth and an effect chain

The card said no job had used Transport sequencing, a PolySynth or an effect chain. This is all three at once: two bars at 96 bpm, looping on the Transport. Four chords and two top notes come from one PolySynth, through a dotted-eighth delay, a reverb and a limiter. A button takes the effects out so the chords can be heard dry.

What was measured, rendered with `Tone.Offline`: all 16 notes over two loops were scheduled exactly on their bar positions, and so was the first live loop. Every chord or note that brings new pitches rises 7 dB or more where it should, and nothing rises anywhere else. All four tones of a chord sound together. The effects leave a tail 46 dB above the dry one. Two things to know. The peak is -5 dBFS, so the limiter never acted. And the quick repeat of each chord on the "and" of beat two, struck while the first is still releasing, rises only 2 to 4 dB.

**Does every chord sound like a new strike, in time and without a click, including the quick repeat on the "and" of beat two?**

Nobody has heard this.

**Artifacts:**
- [the phrase, playable, effects on or off](Shop/Tone.js/proofs/2026-11-15-polysynth-transport/polysynth-transport.html)
- [the phrase rendered, two loops and the tail](Shop/Tone.js/proofs/2026-11-15-polysynth-transport/phrase.m4a)
- [what was measured](Shop/Tone.js/proofs/2026-11-15-polysynth-transport/measured.json)
- [the check](Shop/Tone.js/proofs/2026-11-15-polysynth-transport/check.mjs)

<sub>test proof, 2026-11-15 · tone 15.0.4 from the shelf, Tone.Offline and the live clock in headless Chromium · web-smoke ok, conform --browser 0 errors 0 warnings, check.mjs 14 of 14 · ledger item 4, owed a review</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-f2856e4c17" -->
### 2026-11-14 — the card's starter: web-smoke, conform --browser, a Tone.Offline render (220 Hz, RMS 0.087), probe

taught item 3, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-fe67fda3ab" -->
### 2026-06-16 — `Shop/Maker/run-tests.mjs` web-smoke, probe

nothing new
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
