---
title: "Floquet Kernel — on a voice"
born: 2026-11-04
---

# Floquet Kernel — on a voice (2026-11-04, cycle 8)

[[Floquet Kernel — on real sounds|Last cycle]] the pitch-locked scan kept a plucked melody in tune but only sometimes held on speech, and I blamed the pitch tracker without testing that. This proof tests it. Rebuild with `/usr/local/bin/python3 kernel/voice.py` (about 20 seconds), then `kernel/voice_figure.py`. The numbers are in `kernel/voice_report.json`.

## A voice whose pitch is known

To tell the tracker's errors apart from the voice's, the pitch has to be known exactly. So each `say` phrase is rebuilt from a source and a filter. Its spectral envelope (LPC, order 48, every 10 ms) goes over a buzz whose pitch I set, and unvoiced stretches get noise. It's the same sentence spoken by a slightly robotic voice, and its pitch is exact because I chose it: `inputs/speech_daniel_known_pitch.wav`, `inputs/speech_flo_known_pitch.wav`.

## The measure was most of the problem

Cycle 7 scored harmonicity on 170 ms frames, and a voice glides within one of them, so a harmonic that is in tune gets smeared and counted as out of tune. The new measure warps time so that every pitch period is 128 samples long. A gliding harmonic then sits exactly on a whole harmonic number, and the score is the share of voiced energy under 4 kHz within ±0.1 of one.

On the known-pitch voice with the true pitch, Penrose locked at 2× scores **0.89** by the new measure and **0.17** by the old one. Most of last cycle's "slips on a voice" was the measure.

## What the tracker costs depends on how far the scan moves a partial

A rung n of a scan locked at r × pitch moves each partial n·r harmonics. A pitch error e then puts it n·r·e harmonics off, so **the tracker's budget is about 0.1 / (n·r)**. (Last cycle I said Knot Shadow triples the error. It doesn't: its rungs are 3, 6 and 9, so at 1/3 it moves partials only 1, 2 or 3 harmonics.)

| on Daniel, known pitch | true | 1 % sharp | 2 % sharp | 10 ms late | 40 ms late | cycle 7's tracker |
|---|---|---|---|---|---|---|
| Theta, 2× (moves 2) | 0.91 | 0.89 | 0.85 | 0.90 | 0.83 | 0.90 |
| Knot Shadow, 1/3 (moves 1–3) | 0.86 | 0.85 | 0.79 | 0.86 | 0.82 | 0.87 |
| Penrose, 2× (moves 12 and 20) | 0.89 | 0.05 | 0.01 | 0.61 | 0.28 | 0.56 |

The cycle-7 tracker (a small YIN every 10 ms, median of five, a 10 ms smoother) is off by a median 0.9 % on these voices, 4 to 10 % at the 95th percentile. That's well within budget for Theta and Knot Shadow, and far outside it for Penrose. The voice's pitch moves a median 0.85 octaves a second, 3.7 at the 95th percentile, which is why lag matters: Penrose loses a third of its harmonicity at 10 ms late.

So for the codebox: **Theta and Knot Shadow can follow a live voice through any ordinary tracker. Penrose locked to a voice needs about 0.25 % accuracy and under 5 ms of lag**, which no live tracker I know of gives. Penrose locked is for a synth voice, where the pitch is the note.

## Flo and Knot Shadow at 1/3: not the tracker

Knot Shadow at 1/3 moves every harmonic down one place. Its lowest band (187.5 Hz) is its strongest, and Flo's voice sits at 260 Hz, so most of what passes is her fundamental, and moving it down one harmonic sends it to 0 Hz. The output is 9.5 dB quieter, and what's left is mostly breath, so the harmonicity score falls to 0.37 with the true pitch. Daniel, at 115 Hz, has harmonics in that band to spare and scores 0.86. **Locked at 1/3, Knot Shadow wants a low voice.** At 2/3 it moves harmonics 2, 4 and 6 places, and Flo holds at 0.90.

## Big whole ratios

Loudon asked for large whole-number ratios as well as small percentages.

| locked at r × pitch | 1 | 2 | 3 | 4 | 6 | 8 |
|---|---|---|---|---|---|---|
| Theta, melody | 0.98 | 0.99 | 0.99 | 0.99 | 0.99 | 0.99 |
| Theta, Daniel known pitch | 0.91 | 0.91 | 0.91 | 0.91 | 0.91 | 0.91 |
| Penrose, melody | 0.97 | 0.97 | 0.98 | 0.97 | 0.97 | 0.97 |
| Penrose, Daniel known pitch | 0.89 | 0.89 | 0.88 | 0.79 | 0.76 | 0.74 |

Theta stays in tune at every whole ratio up to 8. Penrose holds on the melody, whose pitch steps, but on a gliding voice it starts to slip from 4× up, where it moves partials 24 to 80 harmonics. A 512-tap band (about 5 ms of delay) then lags the glide by more than the tolerance. The play page's ratio now reaches 8 and snaps to 4, 6 and 8 as well.

## Reels

- `voice/reel_5_tracker_error_budget.wav` (63 s): Daniel as `say` made him, the rebuilt Daniel, then Theta, Knot Shadow and Penrose each four ways: true pitch, sharp, late, and through the cycle-7 tracker. On Penrose, listen for the drop between 0 % and 0.5 % sharp.
- `voice/reel_6_big_whole_ratios.wav`: the melody through Theta locked at 1, 2, 3, 4, 6 and 8 × pitch, then the rebuilt Daniel at 1, 3 and 8.
- `voice_budget.png`: the budget table drawn as two curves.

## Left open

Nobody has heard these yet. The rebuilt voice is robotic by design, and a real recorded voice is still the missing input. I changed the play page's ratio range but didn't re-run it in headless Chrome this cycle. `bank_check.mjs` still matches the Python, with errors 112 to 125 dB below the signal.
