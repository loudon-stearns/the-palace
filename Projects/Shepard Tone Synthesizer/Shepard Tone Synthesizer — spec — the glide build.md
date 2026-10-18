---
title: Shepard Tone Synthesizer — spec — the glide build
born: 2026-10-18
links:
  - target: "[[Shepard Tone Synthesizer]]"
    type: connects-to
    label: build-notes-for
---

# The glide build — what the patch will need

Max work is paused until there are patching standards (Loudon, 2026-10-16). These are the notes that make the glide quick to build once it is lifted. Nothing here has been patched. The logic was tested in Python (`proofs/stage3_glide_proof.py`) and in the browser (`session-3-interactive.html`), and the two agree sample for sample (correlation 0.9999999992 on the lockstep phrase).

## The one rule

**Smooth the pitch once, before the stack. Never smooth each oscillator.** There is one glide, on pitch in semitones (or octaves), and every voice adds a whole number of octaves to that one path. Then every neighbouring pair stays exactly 2 : 1 at every sample. That is the whole reason the illusion survives the glide.

## Signal flow

1. **Target in.** A MIDI note or a pitch class becomes a target pitch `T` in semitones. For an endless glide, `T` ramps at `rate` semitones per second.
2. **One glide.** A one-pole on `T`: `p = a·p + (1−a)·T`, with `a = exp(−1 / (glide_s · sr))`. In gen~ this is a `history` and a `mix`, or `slide` with equal up and down times. It must run at signal rate.
3. **The stack.** For voices `k = −5 … +5`: `x_k = p/12 + k` (octaves from C4).
4. **The free seam.** Wrap each `x_k` into `[−5.5, +5.5)` with `wrap`. The wrap moves a voice by exactly 11 octaves, where its loudness is about 3·10⁻⁷, so it can't be heard.
5. **The window.** Loudness `g_k = exp(−x_k² / (2σ²))`, σ = 1 octave.
6. **Oscillators.** Frequency `f_k = 261.63 · 2^x_k`. Clamp below Nyquist. `cycle~`, or a `phasor` into `sin`.
7. **Sum.** `Σ g_k · sin_k`, times about 0.2 for headroom.

## Parameters

| name | range | default | what it does |
|---|---|---|---|
| glide | 0–1500 ms | 450 ms | time constant of the one shared glide |
| rate | 0.25–12 st/s | 2 | speed of the endless climb (sign = direction) |
| sigma | 0.6–1.5 oct | 1.0 | width of the bright window |
| voices | 7–11 | 11 | size of the stack (wrap span = voices) |
| drift | 0–0.8 | 0 | **teaching control only.** Gives voice k its own glide time `glide·(1 + drift·k/5)`. This breaks the rule on purpose |

## Two ways the build can go wrong, both measured

- **A glide per oscillator** (`slide` or `line~` after the octave stack, each with its own time). At ±15 % the audible octaves disagree by up to 32 cents, and at ±40 % by 93. On an endless climb the error never heals, because each voice trails the moving target by `rate × its own glide time`. At 2 st/s with ±30 % drift the audible voices stay about 16 cents apart for as long as the climb lasts.
- **A fixed-rate ramp in Hz** on each oscillator (a slew limiter on frequency). Low voices arrive almost at once and high voices crawl, so the audible octaves disagree by hundreds of cents on every move: up to 1006 cents in the rendered phrase.

A shared glide run on Hz instead of pitch keeps the octaves exact (0.0 cents). A linear filter applied to inputs in proportion keeps their ratios, so only the shape of the glide changes. That means the glide curve is a free choice, but sharing one glide is not.

## Checks the built patch should pass

- Put the lockstep phrase (C E G C′ E′ G′ C″, 0.8 s a note, 450 ms glide) through the patch and compare it to `proofs/2026-10-18-stage3-A-lockstep.wav`. It should null to near silence when phase-aligned.
- With drift at 0.4, the octave disagreement should read about 93 cents at its worst, as in clip C.
- Run endless up for a minute and check for clicks at the wraps. There should be none, since the wrap sits under the floor of the window.
