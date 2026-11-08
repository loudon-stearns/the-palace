# Bent Line — the plugin

Inharmonic Wavetable Synthesis as a VST3 and AU, built on [VST Template](../../VST%20Template/template/README.md)'s shared machinery. Code `Bent`, maker Loudon Live. Born 2026-10-28 (steward cycle 10).

## What it plays

Sixty-four partials a voice, eight voices. Partial n sits at `n · f0 · 2^(Bend · c_n / 1200)`, where `c_n` is **Wavetable B**: the measured bend, in cents per slot, of one of seven real materials from `../trajectory-library/` (three Grand Piano strings, a bell, a vibraphone, a marimba, a singing bowl). How loud each partial is comes from **Wavetable A**: either the organ wall (48 FFT'd frames of the AKWF electric-organ chain, from `../dual-wavetable/dual-data.json`) or the material's own measured levels ("Own").

- **Filing** (Loudon's BOTH, 2026-10-15). *Rank* puts a bell's k-th mode in slot k. *Nearest* puts it in the harmonic slot nearest its real pitch, louder mode winning a shared slot. On the organ wall this decides which organ partial each mode wears, and what Bend 0 flattens to: Rank flattens the bell into a full harmonic series, Nearest flattens it onto the few harmonics it was nearest.
- **Bend clock.** *Note* walks Wavetable B's frames on the recording's own clock from each note-on (Speed scales it). *Manual* parks it at B position.
- **Decay** sets partial 1's decay time; upper partials die faster (`τ_n = Decay / (1 + 0.07 (n − 1))`).

Every 32 samples each voice recomputes its partials' increments, level targets (ramped over the next 32) and decays.

## The checks (2026-10-28)

`./plugin.sh all` passes: the C++ engine matches the sketch to 3–6 × 10⁻⁸ of peak on all five paths; the real processor keeps the sketch's loudness within 0.38 dB in every quarter second; strict codesign, pluginval at strictness 5, `auval -v aumu Bent Loud`, and the host check (every listed move changes the sound). `ui.py fit` passes at 920×540, 1000×600, 1600×1000.

## Things learned building it

- The organ wall's frames are lumpy. With only a few slots sounding (the bowl filed Nearest uses seven), the plugin's 20 ms knob smoothing on A position reads as 0.7 dB in a quarter second against the unsmoothed sketch. That is real, not a port error, so the A sweep is tested on the piano path, where 64 slots average it out.
- The host check splits its `hostcheck` moves on spaces, so a menu label with a space can't be reached from `plugin.json`. Hence "Own", not "Its own".

## Open

- Nobody has played it in Live yet.
- The CRT is off. The editor's own identity marker should be the glowing line: partial number across, bend from the flat line up and down, brightness as level. `ui/visualizer.js` is the next build.
- It is quiet at the defaults (about −35 dBFS RMS on one note at Level −12).
- Wavetable C (per-partial pan) is not in it; the output is mono.
