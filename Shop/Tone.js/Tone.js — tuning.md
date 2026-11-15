---
title: "Tone.js — tuning"
born: 2026-11-08
links:
  - target: "[[Tone.js]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Tone.js page's record of what building browser instruments has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real build taught."
ledger: tuning
standards:
  for: "what building browser instruments taught the Tone.js page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the tool itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Tone.js — tuning

What each job taught the Tone.js page. Each item names what the job showed and what changed because of it, if anything did. Newest last. These are the page's dated gotchas, moved here on 2026-11-08 when its Gotchas became present-tense rules. The page's `last_tested` date, the Shop harness's smoke on 2026-06-16, is kept as the first run line; the community-wisdom patterns stay on the page until a job meets them.

## From the Kuramoto two-oscillator audio explorer — 2026-05-26 — Study, standalone HTML

1. **Tone's clock and the browser's `requestAnimationFrame` clock needed no reconciling for parameter writes.** The page's standing open question, how Tone's musical time meets p5 or UI draw time, had a simple answer: write with `param.setValueAtTime(value, Tone.now())`. `Tone.now()` is the audio context's wall-clock time, not bar-relative, and every Tone scheduler reads it. When the brief needs no musical timing, `Tone.Transport` never starts; the audio thread takes parameter changes as they arrive, and rAF's ~60 Hz is fine for live frequency and modulation updates on audio-rate oscillators. Reconciliation is needed only when both clocks schedule events. Changed: the open question was answered, and marked so on the page on 2026-10-24.
2. **UI-rate `setValueAtTime` was enough to hear Kuramoto locking on two audio-rate sines.** dθ/dt = ω + K sin(Δθ) was integrated on the UI thread at ~60 Hz and both oscillators' instantaneous frequencies pushed with `osc.frequency.setValueAtTime(fInst, Tone.now())`. At K=0 the listener heard beating at |Δf| Hz; past K_c = |Δf|/2 the beating slowed, then collapsed as the two locked to a shared frequency. Web Audio renders the automation at audio rate, coherent enough for carriers in the 100–500 Hz range. Changed: no per-sample phase drive in a custom `AudioWorkletNode` for this kind of coupling.

## From the Shop's test harness — 2026-06-16

- run · 2026-06-16 · `Shop/Maker/run-tests.mjs` web-smoke, probe · nothing new

## From the card check — 2026-11-14 — the card's starter, a probe

3. **Loading `tone@15.0.4` makes one `AudioContext` straight away, in `suspended` state, before any click.** Counted in headless Chromium by wrapping the `AudioContext` constructor on the starter (`proofs/2026-11-14-card-check/Tone.js — proof — starter.html`): one context, `suspended`, before the click; `await Tone.start()` in the click resumes it, and nothing sounds before then (conform's browser pass agrees). So a check that demands zero contexts before a click, as `Tone.js — proof — rich checks.mjs` does for the sixty-pushes piece (which does not load Tone), would fail every Tone piece; the right question is whether anything sounds before a click. Changed: nothing on the page yet; the review decides whether the community-wisdom line "the audio context starts suspended" becomes a met gotcha. Written by the session that fixed the card, not at a review; the page is unchanged by it until a review. Owed a review.

- run · 2026-11-14 · the card's starter: web-smoke, conform --browser, a Tone.Offline render (220 Hz, RMS 0.087), probe · taught item 3, owed a review

## From the test proofs — 2026-11-15 — two probes

4. **The Transport, a PolySynth and an effect chain worked together on the first try, and two things showed up.** Proof: `proofs/2026-11-15-polysynth-transport/`, a two-bar looping `Tone.Part` at 96 bpm into one `PolySynth` (`triangle8`, -14 dB a voice), then `FeedbackDelay` → `Reverb` → `Limiter(-1)`. In `Tone.Offline` all 16 triggers over two loops came at their bar positions to 0.0000 ms, and on the live clock the first loop's 8 did the same. That is the time Tone handed the callback, not a measure of what reached the speaker. A `Reverb` renders inside `Tone.Offline` when the callback is `async` and awaits `reverb.ready`. First thing that showed up: a chord struck again while it is still releasing (the same Am7 on the "and" of two) rises only 2.2 to 3.6 dB at its own pitches, against 7.2 dB or more for every event that brings new pitches. By the numbers a same-chord restrike on a `PolySynth` is weak; whether it reads as a strike is for the ear. Second: at four voices of -14 dB the peak was -5 dBFS, so the limiter never acted and is untested. Changed: nothing on the page; written by the session making the 2026-11-15 test proofs, not at a review. Owed a review.
5. **On the shelf's tone 15.0.4, and on npm's latest 15.1.22, an oscillator with a partial count plays at the wrong pitch when a second context runs at a different sample rate.** Rendered with `Tone.Offline` first at 44.1 kHz, then at 48 kHz, the phrase's A3 came out at 220 Hz and then at 239.5 Hz: 220 × 48000/44100, 1.47 semitones sharp. Measured for `triangle8` and `sawtooth4`. Plain `triangle` and `sine` are not affected, which is why the starter (plain `triangle`) never showed it. 15.5.72, on the `next` line, renders both in tune. It is Tone's fix #1528, merged 2026-10-22 (https://github.com/Tonejs/Tone.js/pull/1528): the waveform cache was keyed without the sample rate. `Tone.Offline` defaults to the live context's rate (`Offline.js`, 15.0.4), so it bites only a piece or a check that names another rate: an export at 44.1 kHz from a page whose live context runs at 48 kHz, or the other way round. Proof: `proofs/2026-11-15-version-switch/`, whose check fails the day the bug stops reproducing. Changed: nothing. The review decides between moving the pin (15.5.72 is a `next` build, not `latest`), a gotcha (render at the live context's rate, or avoid partial-count types when two rates meet), or both. Owed a review.
6. **Zoom-out, 2026-11-15: what changed in Tone since the page's 15.0.4 (published 2024-05-15).** Sources: the npm registry, read 2026-11-15 (https://registry.npmjs.org/tone): `latest` is 15.1.22 (2025-04-27; a 15.1.23 was published 2025-05-04 but never tagged latest), and `next` is 15.5.72 (2026-11-14). Tone's commit log from 15.1.22 to 15.5.72 (https://github.com/Tonejs/Tone.js/compare/d2d52ffa8803b35debd9f19f2da08ad1c3540de0...42e6eec421d35e4280b00317392dc3725e44bf8e) holds 208 commits; GitHub releases list nothing past 15.1.22. On the `next` line: Transport and Clock timing fixes (a double tick #1444; its regression, a skipped boundary tick that silenced a Loop on iOS, #1500/#1504; stop-then-start in one task orphaning synced sources, #1506; state events and ticks in time order, #1515; Part start/stop, #1496), Offline callbacks using the offline context (#1442), the periodic-wave cache (#1528, item 5), the position readout carry (#1540, 2026-11-14: 15.0.4 shows `0:2:4` where 15.5.72 shows `0:3:0`, measured), deferring the constant source until the context starts (#1340), Sampler looping (#1310), Player progress (#1364), `Transport.setTicksAtTime`/`setSecondsAtTime` (#1375), a reverse delay (#1395), `onContextRunning` (#1407), user-media constraints (#1330), and TypeScript strict. Tried, the same patch on all three: at one sample rate, with the reverb's noise seeded alike, the renders differ by -140 dB, and the Part fires at the same times. On the live clock through five stop/starts in one task and a start at +0.1, no version doubled or skipped a tick, so the timing fixes need conditions this run did not meet. 15.5.72 still makes one suspended context at load (item 3). Nothing tried for samples, the reverse delay or `onContextRunning`. Changed: nothing. Owed a review.

- run · 2026-11-15 · a two-bar phrase on the Transport through a PolySynth, delay, reverb and limiter (`proofs/2026-11-15-polysynth-transport/`): web-smoke, conform --browser clean, check.mjs 14 of 14, probe · taught item 4, owed a review
- run · 2026-11-15 · tone 15.0.4 against 15.1.22 and 15.5.72, one patch, switchable (`proofs/2026-11-15-version-switch/`): web-smoke, conform --browser 2 off-shelf errors expected, check.mjs 11 of 11, probe · taught items 5 and 6, owed a review
