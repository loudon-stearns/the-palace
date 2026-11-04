---
title: "Floquet Kernel — on real sounds"
born: 2026-11-04
---

# Floquet Kernel — on real sounds (2026-11-04, cycle 7)

Loudon heard about the [[Floquet Kernel — mode bank|mode bank]] and said three things: render Knot Shadow as a pitch shifter on a real phrase; try a scan rate kept relative to the pitch, both whole-number ratios and small percentages; and since this is a filter that can go over any sound, feed it more kinds of sound, spoken words among them. This proof does all three. Rebuild: `/usr/local/bin/python3 kernel/phrase.py` (about ten seconds). Numbers are in `kernel/phrase_report.json`.

## Yes, it goes over any sound

The surface filter is an effect: anything in, filtered and moved out. The inputs now live in `kernel/inputs/`: two spoken phrases (macOS `say`, voices Daniel and Flo), a plucked melody (Karplus-Strong, so the pitch of every note is known exactly), and a two-bar drum loop. Four listening reels, each starting with the dry sound, are in `kernel/phrase/`; `phrase_report.json` lists what plays at which second.

## The scan that follows the pitch

Scan at a rate tied to the input's pitch, f_mod = r × f0. A partial at h × f0 that a mode moves n steps comes out at (h + n·r) × f0. When n·r is a whole number, every moved partial lands back on a harmonic. The output stays in tune, at the same pitch, while the voice glides: the filter changes the timbre and follows the singer. A fixed scan of the same average rate can't do that, because the steps are hertz, not harmonics.

Measured as harmonicity, the share of a sound's energy lying on harmonics of its pitch (dry melody 0.84, dry voice 0.44):

| surface, scan | melody | voice |
|---|---|---|
| Theta, locked to 2 × pitch | 0.95 | 0.61 |
| Theta, fixed at the same average rate | 0.53 | 0.52 |
| Penrose, locked to 2 × pitch | 0.94 | 0.23 |
| Penrose, fixed | 0.75 | 0.18 |
| Knot Shadow, locked to 2/3 × pitch | 0.95 | 0.41 (Daniel), 0.74 (Flo) |
| Knot Shadow, locked to 1/3 × pitch | 0.89 | 0.62 (Daniel), 0.32 (Flo) |
| Knot Shadow, fixed at 15.6 Hz | 0.02 | 0.07 |

- **On the melody the theory holds cleanly.** Locked, every surface stays harmonic. Fixed at the same average rate, the output drifts off the harmonics.
- **On the voice the pitch tracker is the weak link.** Knot Shadow moves its partials by 3 × r × f0, so any error in the tracked pitch is tripled, and the voice's pitch is guessed beforehand by a small YIN tracker, smoothed over about 10 ms. Some cases still land (Theta, Knot Shadow at 1/3 on Daniel and 2/3 on Flo); some don't. A better tracker, or a sung input, is the next step.
- **Small percentages.** At 3 % of the pitch the rungs sit close to each harmonic, so Theta stays near the harmonics (0.92) and shimmers, and the shimmer gets faster as the pitch rises. Penrose's modes move 6 and 10 steps, so even 3 % pushes them 18 to 30 % off: harmonicity 0.16, a cloud. Locked and fixed score alike here, because the difference is in the shimmer's speed, not in where the energy lands.

## Knot Shadow on a voice is not a clean pitch shifter

Cycle 6 found that Knot Shadow moves a sine sitting on one of its three band centres (187.5, 375, 562.5 Hz) by a fixed ratio. A voice is not a sine on a band centre. Each band moves everything inside it by the same number of hertz, so the harmonics inside a band stop being harmonics. With a fixed scan aimed at "down a fourth", the output keeps 0.33 (Daniel) and 0.57 (Flo) of its energy on the aimed pitch's harmonics, and almost none on the original pitch. You get part of the shift and a lot of ring-modulator roughness. Two more things are true of it as a voice effect: it passes only three narrow bands under 650 Hz, so the voice is muffled before it is moved; and locking the scan to the pitch is what makes it musical: whole harmonic steps, so the result stays in tune.

## What Hann is

The surface's fast axis gives the filter 512 taps, a 10.7 ms impulse response. Played as is, the response starts and stops abruptly, like a sound cut with scissors. Hann is a smooth hump, a raised cosine, laid over the 512 taps so the response fades in and out. A hard cut makes each band-pass leak into its neighbours (the first leak is only 13 dB down). With Hann the first leak is 31 dB down, and each band gets about twice as wide. So Hann gives softer, rounder, less ringing bands; plain gives tighter bands with more bleed between them. In the bank it costs nothing new: a windowed band is half its own bin minus a quarter of each neighbour.

## The play page

`Floquet Kernel — play.html` now has the spoken phrase (Daniel, with its tracked pitch) and the plucked melody as sources, and a switch that makes the scan follow the pitch, with a ratio from 1 % to 4 that snaps to 1/3, 1/2, 2/3, 1, 4/3, 2 and 3. `bank_check.mjs` still matches the Python (errors 112 to 125 dB below the signal). In headless Chrome it played speech, melody and saw with no errors.

## For the codebox, when the Max pause lifts

The locked scan needs one more input: the pitch. For a synth voice it is the note. For live sound it is a pitch tracker (`sigmund~`, `fzero~`, or RNBO's own), smoothed, and the tracker's accuracy matters three times over on Knot Shadow. Then f_mod = r × pitch, driving the same phasor.

## Left open

Nobody has heard the reels or the page yet. The speech is synthetic (`say`), not a real voice. The tracker is a 60-line YIN, good enough to show the effect, not to play live through. The drum reel has no measurements; there's no pitch to measure against.
