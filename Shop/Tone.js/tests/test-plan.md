---
title: test-plan
born: 2026-05-30
links:
  - { target: "[[Tone.js]]", type: connects-to, label: test-plan-for }
forward_vector: "I hold the test plan for Tone.js; I want every check here to be runnable and to record an honest last-run date."
---

# Tone.js — Test Plan

> Phase E rollout. Tone.js is the Shop's browser-deployable music-software Specialist — instruments, sequencers, effects with first-class musical time. Smoke is the same syntax-parse helper used by the data-viz triad; the *audio* side requires a human ear (browser playback) — that's the Specialist's standing seam between what code can verify and what the eye-or-ear settles.

Last run: **2026-11-14** — the card's starter (`Shop/Tone.js/proofs/2026-11-14-card-check/Tone.js — proof — starter.html`) passed web-smoke and `conform.mjs --browser` (sound only after a click, quiet on hush). The Shop harness smoked the canonical artifact on 2026-06-16. Earlier: **2026-05-30** — Smoke pass on the canonical Tone artifact (`Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html`). Audible-correctness check is human-only and was confirmed during the 2026-05-26 Kuramoto Round 1 (lock criterion at K_c = |f_B − f_A|/2 audibly held — drift / pulling-in / lock all distinguishable by ear).

## Smoke

```sh
node --experimental-vm-modules Shop/Maker/web-smoke.mjs "Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html"
```

- **Automated:** as above. Pass = no `SyntaxError`.
- **Last run (2026-05-30):** `smoke: 1 ok, 0 fail (1 inline script)`.

## Capability Probe

| Role                                       | Last run                                                  |
|---------------------------------------------|------------------------------------------------------------|
| Two-oscillator coupling / synthesis        | `Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html` (2026-05-26) — `Tone.Oscillator` × 2 driven by K slider, Analyser-based oscilloscope, OK |
| Musical sequencing                          | not yet exercised in palace work                          |
| Sample playback                             | not yet exercised                                          |

- **Last run (2026-05-30):** one of three exercised by Kuramoto Round 1; the others marked unverified.

## Style Probe

Tone.js renders to the Web Audio API, not pixels — *style* in the audio sense means loudness (target -16 LUFS for streams meant to publish) and timbral choices. The HTML UI around the audio is bound by the standard `palaceTokens()` discipline.

- **Manual:** the existing Kuramoto explorer's palette pre-dates the [[Loudon Live Design System]] (indigo/amber). When the next Tone artifact is built it should resolve via `palaceTokens()`. Same standing decision as the Phase F Kuramoto palette deviation.
- **Last run (2026-05-30):** Style for the canonical artifact is intentionally pre-system; future artifacts inherit the design-system discipline.

## Edge Probe

- **Click-required AudioContext.** Browsers (correctly) suspend the audio context until a user gesture. Tone artifacts must show a "Start audio" affordance and resume the context on click — silent failure otherwise. The Kuramoto explorer does this.
- **CDN drift.** Tone is loaded from `tone@15.0.4` via CDN. Pinned version → drift-safe; a bare `tone@latest` is the failure mode.

- **Last run (2026-05-30):** click-gesture path verified by use; CDN pinning verified in source.

## Speed Bench

Reference host: **mac** (Chrome stable). The Kuramoto two-oscillator explorer runs at audio-rate with the Analyser polling at ~60 Hz; no perceived lag.

## Determinism

Tone.js's audio output is *not* byte-deterministic — Web Audio's internal scheduling has run-to-run jitter, and sample-level output depends on the host's audio hardware. The right reproducibility artifact for a Tone job is the *source code* + the Tone version + a frozen `seed` for any algorithmic content. The audible behaviour reproduces; the bytes don't.

- **Reproducibility artifact:** Tone version (pinned `tone@15.0.4`), source `.html`, any algorithmic seed.
- **Last run (2026-05-30):** Determinism in the byte sense N/A by design. Audible behaviour reproduces by hand (load the file in two browsers, same lock-criterion text, same K_c, same audible drift→pulling-in→lock progression).

## Open tests — from the card, 2026-11-15

One line per item on the card's **Not yet shown to hold** line and per item the ledger still owes. How each would be tested is how it looked on 2026-11-15; a maker who sees a better test runs that one and leaves both on the scroll.

- **Transport sequencing.** A looping `Tone.Part` on the Transport, rendered in `Tone.Offline` and played on the live clock, with every trigger time checked against its bar position. Script-measurable; the feel of it needs Loudon's ear. **Proof made:** [2026-11-15-polysynth-transport](../proofs/2026-11-15-polysynth-transport/), all 16 triggers on their bar positions, offline and live. Waiting on his ear.
- **PolySynth.** Four-note chords and top notes from one `PolySynth`, checked by whether all four chord tones sound at once and whether each new chord's pitches rise where they should. Script-measurable; whether a repeated chord reads as a new strike is for the ear. **Proof made:** the same folder. All chord tones sound together, each 31 to 53 dB over its semitone neighbours. Restrikes of a chord still sounding rise only 2 to 4 dB.
- **Effect chain.** Delay, reverb and limiter after the PolySynth. Checked by the tail it leaves, the peak, and whether a Reverb works inside `Tone.Offline` (it does, when the callback awaits `reverb.ready`). The balance is for the ear. **Proof made:** the same folder. The tail is 46 dB over dry. The peak is -5 dBFS, so the limiter is in the chain but never acted; a louder patch would test it. Partly open.
- **Samples.** A `Tone.Sampler` or `Tone.Player` loading a few short files declared in `piece:files`, triggered by a Part. Check that it loads (`onload`), that its onsets land where the Part sends them, and the pitch of a repitched note. The `next` line adds looping to `Sampler` (#1310); worth trying there. Needs a small sample set and his ear for quality. **Open.**
- **A phone (iOS unlock).** Load a proof on his iPhone from the STIGMERGY scroll, then check: no sound before a touch, sound after one, and quiet when the screen locks. Only he can run it. **Open.**
- **Polyphony limits on a phone.** The same phrase with more voices stacked (8, 16, 32), listened to on the phone for dropouts. Voice stealing at `maxPolyphony` can be rendered offline on the desktop first. The phone part is his to run. **Open.**
- **A Piece tier.** Needs a real job, plus the phone test above. **Open.**
- **Ledger item 3 (a suspended context at load).** Re-measured 2026-11-15. Proof A made one context at load, `suspended`, as on 2026-11-14. Proof B made three, one per Tone build, all `suspended`; 15.5.72 still makes one at load. Script-measurable. **Owed a review**, not a test.
- **Ledger item 5 (the periodic-wave pitch bug in 15.0.4).** Render a `triangle8` voice at two sample rates, one after the other, and read the pitch. **Proof made:** [2026-11-15-version-switch](../proofs/2026-11-15-version-switch/), which measures it every run. Whether it is heard without being told is for his ear. The pin decision is owed a review.
