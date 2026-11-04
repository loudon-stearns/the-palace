---
title: "Floquet Kernel — first proof"
born: 2026-11-04
---

# Floquet Kernel — first proof (2026-11-04, cycle 5)

The plan's third instrument turns the wavetable surfaces into filters: each surface in the [[2D Torus Wavetable Synthesizer — catalog — wavetables|2D Wavetable Catalog]] becomes a filter that changes over time, one axis read as delay and the other scanned at audio rate. Max is paused, so this first proof is carried in Python. Rebuild: `/usr/local/bin/python3 kernel/floquet_kernel.py && /usr/local/bin/python3 kernel/kernel_figure.py`. Numbers: `kernel/kernel_report.json`.

## The instrument

```
y[n] = Σ_k  h(k, φ[n]) · x[n−k]        φ advances at f_mod, linear between rows
h(k, row) = S[row, 2k] / 512            512 taps from the surface's fast axis
```

The fast axis of the surface (the one an oscillator scans for its waveform) becomes the filter's 512 taps. The slow axis (the morph axis) is scanned by a phasor at `f_mod`. Every output sample uses the taps of the row the phasor is on. With `f_mod` at 0 it is an ordinary filter. Scanned, it is a Floquet system.

## What it measured

- **The surface's 2D spectrum is the filter's map.** A surface mode at fast-axis m, slow-axis n becomes a passband at m × 93.75 Hz (48000 / 512) whose output is moved by n × `f_mod`. `kernel_map.png` puts the two side by side for three surfaces; the bright points line up.
- **The prediction is exact.** A 440 Hz sine in, scanned at 31 Hz: every line the theory names (±440 + n × 31) comes out at its predicted level, to better than 0.0001 dB, and the power off those lines is 1e-8 or less. Penrose gives 5 lines within 60 dB, Theta 7, Membrane 8.
- **Penrose is five filters with five shifts.** Its five star directions become passbands at 281, 844 and 1031 Hz. The 1031 Hz band passes unmoved. The 844 Hz band is moved by ±6 × `f_mod`, the 281 Hz band by ±10 × `f_mod`. A 440 Hz sine sits between bands and comes out mostly as 130 and 750 Hz (440 ± 10 × 31). Even scanned at 0.25 Hz its output is detuned by 1.5 to 2.5 Hz, so the slow end of the glide already sounds like a chorus, not a sweeping filter: 82 % of the saw's power is off the harmonics in the first second.
- **Theta keeps the pitch.** Its modes sit near the origin, so it is a low, soft filter whose rungs are only ±1 and ±2. 38 % of its power is on the unmoved rung. On the saw glide, 3 % is off the harmonics at the slow end and 50 % at 80 Hz.
- **Membrane gives the pitch away entirely.** None of its power is on the unmoved rung (exactly 0), because every slice along its slow axis averages to zero. Scanned slowly it is a moving filter (0.8 % off the harmonics); scanned at 80 Hz, 98 % of what comes out is shifted. Nothing comes out at the input's own pitch.

So the three surfaces are three kinds of filter: one that keeps the pitch (Theta), one that always gives it away once it moves fast (Membrane), and one that splits the input into five bands and moves each its own distance (Penrose).

## The renders

All four glide the scan rate from 0.25 Hz to 80 Hz over 14 s, exponentially. The slow start is a filter you hear move; the end is a Floquet ladder. It is the crossing from ordinary filter to time-varying filter in one gesture. Peak −1 dBFS, mono, 48 kHz, float.

- `kernel_a_penrose_saw_glide.wav` — a 110 Hz saw through Penrose.
- `kernel_b_theta_saw_glide.wav` — the same saw through Theta.
- `kernel_c_membrane_saw_glide.wav` — the same saw through Membrane.
- `kernel_d_penrose_noise_glide.wav` — white noise through Penrose: the five bands, then their shifts.

## Left open

Nobody has heard these. The taps are not windowed, so each passband has sinc sidelobes at −13 dB; the bands are leaky, which may be part of the sound or may want a Hann window along the fast axis (narrower leakage, wider bands). Only three of the nine named surfaces were run. 512 taps fixes the band spacing at 93.75 Hz; a tap-count knob would tune where the bands fall.

## For the Max build, when the pause lifts

Same architecture as `torus_2d_lookup.codebox`: a `buffer` holding the surface, a phasor for the slow axis, and a 512-tap inner loop reading one row (two rows, with the linear blend). 512 multiply-adds per sample per row read; at 48 kHz that is about 49 M per second, heavy for codebox. Two cheaper routes to test first: drop to 128 or 256 taps (bands every 375 or 187.5 Hz), or precompute each surface's few strong modes and run them as a bank of band-passes, each followed by a frequency shifter at n × `f_mod`. For Penrose that is five bands, which matches the map exactly.
