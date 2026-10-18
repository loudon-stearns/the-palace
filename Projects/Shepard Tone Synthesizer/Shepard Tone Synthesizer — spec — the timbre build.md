---
title: Shepard Tone Synthesizer — spec — the timbre build
born: 2026-10-18
links:
  - target: "[[Shepard Tone Synthesizer]]"
    type: connects-to
    label: build-notes-for
---

# The timbre build — what the patch will need

Max work is paused until there are patching standards (Loudon, 2026-10-16). These are the notes that make the timbre layer quick to build once the pause is lifted. Nothing here has been patched. The logic was tested in Python (`proofs/stage4_timbre_proof.py`) and in the browser (`session-4-interactive.html`). The two agree on spectrum: the similarity of their short-time spectra is 1.0000 on clips A and D and 0.9975 at worst on E. The build sits on top of the glide build ([[Shepard Tone Synthesizer — spec — the glide build]]), which stays exactly as written.

## The two rules

1. **The tone filter follows the voice.** Each voice's cutoff is computed from that voice's own frequency, after the stack and after the wrap: `fc_k = ratio · f_k`, or `f_k + offset`. Never from the one pitch signal before the stack.
2. **The window sits on the voice.** The Shepard loudness `g_k = exp(−x_k² / 2σ²)` multiplies each voice by its fundamental's position, after that voice's filter. A filter on the summed audio is tone color only, never the illusion.

## Signal flow (per voice k, added to the glide build)

1. `x_k` and `f_k` from the glide build (one shared glide, whole-octave offsets, wrap).
2. **Oscillator.** A band-limited sawtooth at `f_k`. In gen~ a `phasor` into a band-limited saw, or a sum of a few harmonics. A naive saw aliases at the top of the stack, but those voices are under the window and silent, so the band-limiting matters most in the middle three octaves.
3. **Tone filter.** A 2-pole lowpass, cutoff `fc_k` per rule 1. Resonance is a free choice (it was zero in the proofs). Because `fc_k` moves with `f_k`, it jumps at the wrap. That is harmless, because the voice is about 100 dB down there. Don't smooth the cutoff with its own glide. A smoothed cutoff lags behind the wrap for a moment, and while it lags the arriving voice comes in with the wrong tone. It would be inaudible under the voice window, but it is the same mistake as a glide per voice.
4. **Window.** Multiply by `g_k`.
5. **Sum**, with level set by the analysis below.

## Parameters

| name | range | default | what it does |
|---|---|---|---|
| track | ratio · offset | ratio | what the cutoff follows. Both keep rule 1 |
| ratio | 1–24 | 4 | cutoff ÷ voice frequency. 4 → 92 % of energy on the note, 16 → 84 % |
| offset | 0–4000 Hz | 1000 | used when track = offset |
| resonance | 0–0.9 | 0 | untested in the proofs; listen before trusting it |
| teaching: track the note | on/off | off | **breaks rule 1 on purpose.** Cutoff from the played note folded into one octave. Brightness steps by about 0.2 octave once an octave |
| teaching: window on sum | on/off | off | **breaks rule 2 on purpose.** The wrap arrives at −30 dB (ratio 16, 11 voices), and voices under 20 Hz carry about 2 % and flutter |

## Measured, ratio 16 unless named (endless climb, 2 st/s, 32 harmonics)

| clip | what | on the note | fifth | brightness step | wrap arrives at | under 20 Hz |
|---|---|---|---|---|---|---|
| A | ratio 4, window on voice | 92 % | 7 % | 0.000 oct | −134 dB | 0 % |
| B | ratio 16, window on voice | 84 % | 9 % | 0.000 oct | −134 dB | 0 % |
| C | offset +1000 Hz | 91 % | 7 % | 0.000 oct | −133 dB | 0 % |
| D | tracks the note (ratio 4) | 90 % | 7 % | **0.195 oct** | −133 dB | 0 % |
| E | window on sum, 11 voices | 84 % | 9 % | 0.001 oct | **−30 dB** | **1.8 %** |
| F | window on sum, 15 voices | 84 % | 9 % | 0.000 oct | −64 dB | **1.9 %** |

## Checks the built patch should pass

- Endless climb at the defaults for a minute: the brightness should hold steady. Measured from the audio, it shouldn't step at the octave.
- Turn on "track the note": a brightness step once per octave, about 0.2 octave. If it doesn't appear, the teaching switch isn't wired from the pitch before the stack.
- Turn on "window on sum" at ratio 16: a low thump at each wrap and flutter underneath. Off again: both gone.
- Compare the defaults by spectrum against `proofs/2026-10-18-stage4-A-ratio4.wav`. Sample-for-sample nulls won't hold here (a real filter has phase, the proof's doesn't), so compare spectra, not waveforms.
