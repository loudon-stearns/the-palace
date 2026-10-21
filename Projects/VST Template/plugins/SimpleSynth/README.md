---
title: README
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: plugin-of
forward_vector: "I am the front door of Simple Synth, the second plugin made from VST Template and its worked example of MIDI notes: one oscillator, one filter, one amplifier, envelopes and vibrato, and what it was checked against."
---

# Simple Synth

One oscillator, one filter, one amplifier, made from the template as its second test and its worked example of playing MIDI notes. Mono, last note priority: a new note retriggers the envelopes; let go of it while an older note is still held and the pitch returns to that note without a retrigger.

- **Oscillator:** Wave (saw, square, triangle, sine; saw and square are band-limited with polyBLEP), Tune in semitones, Pitch env (semitones the pitch jumps at each note) with Pitch decay, and a sine LFO for vibrato (Vibrato rate, Vibrato depth in cents).
- **Filter:** two-pole low-pass (a trapezoidal state-variable filter). Cutoff, Resonance, Filter env in octaves (negative closes it), Key track around middle C, and its own attack, decay, sustain and release.
- **Amplifier:** its own attack, decay, sustain and release, Velocity (how much softer a soft note plays), Level.

Attacks rise in a straight line; decays and releases fall exponentially, covering 99 % of the way in their time.

**Checked against the sketch** (`reference/paths.py`): a melody, a resonant filter sweep, the pitch envelope and vibrato with a held note under a newer one, each waveform in turn, and slow envelopes at full key tracking. Nothing in it is chaotic, so every path must match the sketch sample for sample.
