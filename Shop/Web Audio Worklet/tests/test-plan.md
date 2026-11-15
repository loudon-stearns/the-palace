---
title: test-plan
born: 2026-11-15
links:
  - { target: "[[Web Audio Worklet]]", type: connects-to, label: test-plan-for }
forward_vector: "I hold the test plan for Web Audio Worklet; I want every check here to be runnable, to record an honest last-run date, and to say plainly which tests only Loudon's ear can close. A maker who can test better another way does so and leaves the comparison on the scroll."
---

# Web Audio Worklet — Test Plan

> The DSP is the artifact, so most of a worklet piece can be measured without ears: pull the processor out of ``const WORKLET = `…`;`` and run it in Node with a stubbed `AudioWorkletProcessor`, or render it in headless Chromium, Firefox and WebKit through an `OfflineAudioContext`. What no script settles is clicks, timbre and the crackle at the voice ceiling on a real machine. Those wait for Loudon's ear.

Last run: **2026-11-15** — two proofs, `proofs/2026-11-15-voice-ceiling/` and `proofs/2026-11-15-render-quantum/`, each with web-smoke, `conform.mjs --browser` and its own `check.mjs`. Before that, 2026-11-14, the card's starter (`proofs/2026-11-14-card-check/`).

## Smoke

```sh
node --experimental-vm-modules Shop/Maker/web-smoke.mjs "<piece.html>"
node _ops/rich-face/conform.mjs "<piece.html>" --browser
```

Pass: no `SyntaxError`; conform 0 errors, sound only after a click, quiet on hush. Last run 2026-11-15 on both proofs: 1 ok each, conform 0 errors 0 warnings at 760 and 1130 px.

## Capability Probe

| Role | Last run |
|---|---|
| Granular wavetable engine (Murmuration's grain voice) | 2026-11-15, `proofs/2026-11-15-voice-ceiling/` — rendered offline in three engines, 8 to 1024 voices |
| Bigger render blocks (`renderSizeHint`) | 2026-11-15, `proofs/2026-11-15-render-quantum/` — headless Chromium 147 with a Blink flag |
| Single sine, Blob URL, compressor | 2026-11-14, the card's starter |

## Determinism

With the grain scatter on a seeded generator, the engine renders the same samples twice in Node and the same samples in Node as in headless Chromium (largest difference 0, 2026-11-15). Across block sizes 128 to 1024 the output is identical sample for sample. Murmuration itself scatters with `Math.random`, so its renders are not repeatable until it is seeded.

## Speed Bench

Reference host: the Mac (Apple M1 Max, 10 cores). The voice-ceiling check times offline renders per voice count; its `measured.json` records the load average, because on 2026-11-15 the Mac was shared with other sessions (load average 40 to 125) and Firefox's timings moved threefold between runs.

## Open tests — from the card, 2026-11-15

From the card's **Not yet shown to hold** line (`Shop/Web Audio Worklet.md`, the card) and the ledger (`Web Audio Worklet — tuning.md`, nothing was owed before today).

- **The voice ceiling heard on real hardware.** Add Murmuration's grain voices on a click while the page shows audio-thread load and Chrome's dropout count; Loudon says the count where it crackles. Needs Loudon's ear. Status: proof made, waiting on his ear — [proofs/2026-11-15-voice-ceiling](../proofs/2026-11-15-voice-ceiling/voice-ceiling.html). Offline, one core runs out between 470 and 670 voices in Chromium; Murmuration plays 60.
- **No one has heard Murmuration live in a browser.** Open `Projects/Murmuration/Murmuration.html` served (STIGMERGY or a local server, not from disk: see ledger item 12), press Engage, walk its own smoke list (flock audible, Disorder melts tone to cloud, a predator click scatters then re-coheres). Needs Loudon's ear. Status: open. Today's voice-ceiling proof plays the same grain voice, not the flock.
- **Firefox.** Engine rendered offline in headless Firefox 148 and both proofs start sound from a click there (2026-11-15). Heard in Firefox: needs Loudon's ear and a Firefox on his Mac. Status: open for the ear; headless half done in [proofs/2026-11-15-voice-ceiling](../proofs/2026-11-15-voice-ceiling/).
- **Safari.** Engine rendered offline in headless WebKit 26.4 and both proofs start from a click there. Found: a Blob-URL worklet is refused from `file://` in WebKit and Chromium (ledger item 12). Heard in Safari: needs Loudon's ear. Status: open for the ear; headless half done.
- **Phones.** Mobile Safari and Android Chrome: unlock on touch, the ceiling on a phone. Needs a phone in Loudon's hand. Status: open.
- **The RNBO crossover.** One instrument spec built here and in the RNBO codebox~ smith, compared. Needs Max, an app only Loudon runs. Status: open, written here, not run.
- **Bigger render blocks (zoom-out).** `renderSizeHint` 128 against 256, 512, 1024 on the same seeded cloud. Script half done in headless Chromium with a flag; whether 512 holds off the crackle where 128 crackles needs Loudon's ear on a Chrome that has shipped it. Status: proof made, waiting on his ear — [proofs/2026-11-15-render-quantum](../proofs/2026-11-15-render-quantum/render-quantum.html).
