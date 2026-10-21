---
title: README
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: proof-for
forward_vector: "I hold the proof that VST Template's first two plugins, Frustration and Simple Synth, pass every check (verify, pluginval, auval and the host check), how the tolerances were set, and six renders of the real plugins, until a load in Live 12 completes it."
---

# The first two plugins from the template, and how their checks were set

Two plugins were made from the template on 2026-10-20 and taken all the way: built, checked against their numpy sketches, validated, installed to `~/Library/Audio/Plug-Ins`, and loaded through a host interface. Everything here was produced by the commands named; nothing was hand-edited.

**Frustration** (`plugins/Frustration`), the commission's test case: `ride.py`'s frustration model with Stretch (B) and Coupling (K) automatable, plus inertia, pitch, voices, level, partials, pinning and source.

**Simple Synth** (`plugins/SimpleSynth`), asked for on the evening of 2026-10-20: one oscillator, one filter, one amplifier, envelopes on the filter and the amplifier, a pitch envelope on the oscillator, and a vibrato LFO. It is the template's worked example of playing MIDI notes.

## What passed

| | Frustration | Simple Synth |
|---|---|---|
| Engine against the sketch, sample for sample | 3.8e-8 to 5.8e-8 of peak wherever the tone holds; string–bar and the knobs walk over their whole 40 s and 6 s | 3.0e-8 to 4.1e-8 of peak on all five paths, whole length |
| Past the edge (regime check, 2 Hz in 0.5 s windows) | breathe, coupling, warm-64: within 0.23 to 1.33 Hz | — (nothing chaotic) |
| Real plugin: loudness per quarter second | within 0.06 to 0.14 dB | within 0.0003 to 0.66 dB (the resonant sweep is the 0.66, allowed 1.5) |
| pluginval, strictness 5 | SUCCESS (19 test groups) | SUCCESS (19 test groups) |
| auval | AU VALIDATION SUCCEEDED | AU VALIDATION SUCCEEDED |
| Host check, installed VST3 and AU | defaults render identically twice; B, K, inertia, pitch, voices and source each change the sound | the same; cutoff, wave, resonance and vibrato depth each change it |

Records: `*-verify.txt`, `*-validate.txt`, `*-hostcheck.txt`. Renders of the real plugin, made by the verify step: `Frustration-ride-breathe-plugin.m4a`, `-ride-coupling-`, `-ride-string-bar-`, and `SimpleSynth-melody-plugin.m4a`, `-filter-sweep-`, `-pitch-vibrato-legato-`.

## How the tolerances were set (`calibration.txt`)

- **The behaviour gate can't see a few-percent error at the edge.** Past the edge, a correct port and the sketch differ in half-second fundamental statistics by up to 1.4 Hz. A port with coupling 2 or 5 % off, stretch 5 % off or inertia 10 % off differed by the same amount. So that gate, at 2 Hz, says only "same regime".
- **The exact stretch can.** Coupling 0.5 % off shows up at 0.15 of peak within two seconds, against a tolerance of 1e-6. Every term of the model gets exercised by a path that is still exact.
- **A drift that looked like chaos was precision.** String–bar drifted to 3e-6 of peak after 20 s, and the knobs walk parted at 4.85 s. Both came from the sketch's unwrapped phases, whose top partials race at about 176 kHz. The C++ matched a wrapped copy of the sketch to 5e-8. The sketch now wraps, and both paths are exact end to end.
- **A real design fault surfaced.** Simple Synth at resonance 0.85 peaked at +1.4 dBFS, in the sketch too. A tanh soft clip on its output fixed it, and the gate now passes at -1.7 dBFS.

## Left rough

- **Not yet loaded in Live 12.** Two instances of Live were running on Loudon's Mac, so it was left alone until he says. The host check is JUCE's own hosting code, and pluginval and auval load the plugins too, but Live's own scan is unconfirmed.
- **Polyphony is not built or measured.** Both plugins are mono. Frustration costs 2.5 % of a core at 40 partials and 6.6 % at 96, so eight voices at 96 partials would be about half a core before any optimisation.
- **Frustration has no limiter.** With Voices at full and Level above -6 dB it can pass full scale (the knobs walk peaked at -0.4 dBFS).
