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
