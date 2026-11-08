---
title: "Working Backward — first proof"
born: 2026-11-04
---

# Working Backward — first proof (2026-11-04, cycle 9)

The fourth instrument on the plan works backward: pick the spectrum you want, solve for the modulation that makes it, and play that modulation from a wavetable. The plan called this the hardest and least certain move. This proof found that, built on the third instrument, the first case isn't a search at all. Rebuild with `/usr/local/bin/python3 inverse/inverse.py` (about 7 seconds), then `inverse/inverse_figure.py`. The numbers are in `inverse/inverse_report.json`.

## Why it is a lookup

The surface filters showed that a scanned surface's 2D spectrum is its map: a surface mode at tap-band m and row-rung n passes the band at m × 93.75 Hz and moves what it passes by n × the scan rate. Read backward:

1. For each partial you want, pick the input harmonic that will feed it (the nearest, each used once).
2. Its tap-band m is the band that holds that harmonic.
3. Its rung n is the move it needs, divided by the scan rate, rounded.
4. Its gain and phase undo the band's own response.

Add those modes up and you have the surface, a 256-row by 512-tap wavetable (`surfaces/piano_G3_hann.npy`). Run it as the third instrument with the scan locked at the pitch ÷ 32, over a plain sawtooth.

## What it measured

Over a sawtooth at G3, the output partials land exactly where the design put them: every one of the 24, in every case, within the measure's resolution. The only tuning error is the rounding in step 3.

| target, G3 | partials | biggest rung | worst rounding | stray power, no window | stray power, Hann |
|---|---|---|---|---|---|
| harmonic (a check) | 24 | 0 | 0 | 0.06 % | 0.00 % |
| piano, B = 0.0004 | 24 | 15 | 5.5 cents | 1.15 % | 0.10 % |
| glockenspiel bar | 6 | 13 | 4.5 cents | 4.0 % | 0.42 % |

At a pitch whose harmonics sit exactly on the band centres (187.5 Hz), stray power is zero with or without a window.

**The rounding is the instrument's own nature.** Every line lands on the lattice of harmonics plus whole steps of the scan rate, so the output is exactly periodic at the scan rate. An "inharmonic" piano made this way is really a harmonic sound on a very low fundamental, the pitch ÷ 32. A finer scan rounds less and repeats more slowly:

| scan locked at | the sound repeats every | biggest rung | worst rounding | typical rounding |
|---|---|---|---|---|
| pitch ÷ 16 | 0.08 s | 7 | 8.6 cents | 3.2 cents |
| pitch ÷ 32 | 0.16 s | 15 | 5.5 cents | 1.9 cents |
| pitch ÷ 64 | 0.33 s | 30 | 3.1 cents | 1.1 cents |
| pitch ÷ 128 | 0.65 s | 59 | 1.4 cents | 0.6 cents |

The worst errors sit on partials 3 to 5, where the stretch is smaller than half a scan step and rounds to nothing.

**The rungs wrap.** Once a partial's stretch passes half a harmonic, the nearest harmonic changes, so partial 14 is fed from harmonic 15 moved down 15 rungs, and harmonics 14, 21 and 26 go unused. Picking the nearest harmonic folds every move into a range of half a harmonic each way. A crystal does the same thing when it folds momentum into its first Brillouin zone, so this is the Bloch twin turning up again, now in the design step.

## Hann, since you asked

A Hann window is a fade-in and fade-out across the filter's 512 taps, shaped like one hump of a cosine. Without it, each band has steep edges in time, and steep edges leak: a band tuned to one harmonic also lets a little of the others through, with side lobes only 13 dB down. The fade trades a band twice as wide for side lobes 31 dB down that keep falling. In the mode bank it costs nothing new, because a Hann band is just three neighbouring plain bands added together.

Here it is the difference between clean and smeared. On G3 the stray lines fall from 1.15 % of the power to 0.10 % on the piano, and from 4 % to 0.4 % on the bar. The right panel of `inverse_figure.png` shows the grey thicket between the partials that the window clears. To hear it, compare `renders/G3_piano.wav` with `renders/G3_piano_rect_window.wav`.

## One surface, how many notes

The tap-bands are fixed in hertz, so a surface solved for G3 is for G3. Move the note and the partials stay in tune, because the scan is locked to the pitch and every move scales with it, but the harmonics drift off their bands and the stray power grows: 0.1 % at G3, 1.3 % a quarter-tone away, 4 % a semitone away, 9 % a whole tone away. So one solved surface covers about a semitone (I measured upward only), the way a sampled piano keeps one sample per few keys.

The way past that is to read the tap axis in pitch periods instead of samples, so the bands follow the note. That is a delay loop whose length is the pitch, which is the second instrument's string coming back. It is the next proof.

## Reel

`renders/reel_7_working_backward.wav` (about 17 s): G3 through three solved surfaces (harmonic as the check, piano-stretched, glockenspiel bar), three seconds each, then the piano surface played at G3, a quarter-tone up and a whole tone up, to hear where it starts to break.

## Left open

Nobody has heard these yet. The target amplitudes simply copy the sawtooth; a real piano's partial levels and decay aren't modelled. Leakage from neighbouring harmonics is measured, not cancelled, and a small least-squares step could remove it. No browser version yet.
