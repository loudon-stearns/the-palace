---
title: "Floquet Kernel — mode bank"
born: 2026-11-04
---

# Floquet Kernel — mode bank (2026-11-04, cycle 6)

The [[Floquet Kernel — first proof|first proof]] ran a surface as a 512-tap filter whose taps change with the scan. That costs 1024 multiply-adds a sample, which is too heavy for the codebox. This proof rebuilds the same filter from the surface's own modes, and runs it in the browser. Rebuild: `/usr/local/bin/python3 kernel/mode_bank.py`, and check the page with `node kernel/bank_check.mjs`. Numbers are in `kernel/mode_bank_report.json`, the coefficients in `kernel/mode_bank_modes.json`.

## The idea

A surface repeats along both axes, so its kernel is exactly a 2D Fourier series, and the filter splits into one term per mode:

```
y[t]   = Σ  C[n,m] · e^{2πi n φ[t]} · S_m[t]
S_m[t] = e^{2πi m/L} · S_m[t−1] + x[t] − x[t−L]       (a sliding DFT bin)
```

Each mode is a band-pass at m × 93.75 Hz (one complex multiply a sample, all sharing one 512-sample delay line), followed by a frequency shift of n × the scan rate. The bank is exact for the modes it keeps; the only error is the modes it drops. A Hann window on the taps adds nothing new: a windowed bin is 0.5·S_m − 0.25·S_(m−1) − 0.25·S_(m+1).

## What it measured (saw at 110 Hz, the scan gliding from 0.25 to 80 Hz)

How closely the bank matches the full 512-tap filter, in dB of signal over error:

| surface | modes for 99 % | 4 | 8 | 16 | 32 | 64 |
|---|---|---|---|---|---|---|
| Knot Shadow | 4 | 85.6 | 85.6 | 85.6 | 85.6 | 85.6 |
| Penrose | 5 | 14.2 | 69.9 | 69.9 | 69.9 | 69.9 |
| Theta | 7 | 17.7 | 21.1 | 57.4 | 107.7 | 110.9 |
| Fisher Ridge | 7 | 8.0 | 16.9 | 27.0 | 42.4 | 57.6 |
| Matérn | 9 | 11.9 | 18.1 | 26.8 | 31.1 | 38.7 |
| Membrane | 22 | 5.6 | 10.3 | 17.5 | 98.4 | 98.4 |
| Kuramoto Bloom | 26 | 3.0 | 6.7 | 12.0 | 28.4 | 83.8 |
| Chladni Ghost | 85 | 10.3 | 10.8 | 13.6 | 16.2 | 20.0 |
| Stiff String | 158 | 14.1 | 18.0 | 21.6 | 23.8 | 24.2 |

The ceiling near 70 to 110 dB is the full filter's straight-line blend between rows, which the bank doesn't copy. It is inaudible.

- **Five of the nine are cheap and exact.** Knot Shadow needs 4 modes, Penrose 5 (its five star directions), Theta and Membrane 32. A mode costs about ten multiplies, so 32 modes are about a third of the full filter's cost, and Penrose is under a tenth.
- **Two are expensive.** Stiff String and Chladni Ghost spread their energy over hundreds of modes; at 64 modes they still miss by about 20 dB. Run them as the full filter, or at fewer taps.
- **Knot Shadow is a pitch shifter.** All of its energy sits on one diagonal (bands 187.5, 375 and 562.5 Hz, moved −3, −6 and −9 scan steps), so each band moves in proportion to its own frequency. A sine on any of the three band centres, scanned at 6.25 Hz, comes out at 0.90 times its pitch (measured 0.901, 0.901 and 0.900; predicted 1 − 3 × 6.25 / 187.5 = 0.90). Between band centres it is only approximate (300 Hz came out at 0.937). It is the old delay-line pitch shifter, a delay that slides and wraps, arrived at from a surface. The surface's knot is a pulse travelling along the delay as the scan moves.
- **Hann changes the sound a lot.** With 32 modes, the windowed output differs from the plain one by −2 to −7 dB on the tidy surfaces, which is a different sound, not a polish. Whether it is the better one is for the ear; the page has the switch.

## The page

`Floquet Kernel — play.html`: pick a surface, a saw or noise, the pitch, the scan rate (frozen to 80 Hz), how many modes to keep, and Hann on or off. A map shows the modes kept (across: the band; up and down: how far it moves what it passes). Below it is the live spectrum. Its DSP is the same function `bank_check.mjs` runs against `mode_bank.py`: three cases, errors 112 to 125 dB below the signal. It opened in headless Chrome with no errors and drew sound into the spectrum.

## For the codebox, when the Max pause lifts

The cheap route is now measured: one 512-sample delay line, one complex one-pole per needed bin (`re, im` state, a fixed rotation), and per mode one phasor at n × `f_mod` and one complex multiply. Coefficients come from `mode_bank_modes.json`, per surface. The sliding bin has its pole exactly on the unit circle. In 64-bit that drifts by about 1e-16 a sample, which is harmless. In 32-bit, give it a radius like 0.999999 and scale x[t−L] by r^L.

## Left open

Nobody has heard the page or the four glides. The two expensive surfaces have no cheap form yet. The pitch-shift reading of Knot Shadow is measured on sines only, not heard on music.
