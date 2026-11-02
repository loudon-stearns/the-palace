# Quantum Synthesizer — the Live device, as a build spec

A workshop draft, not an entry. Max work is paused until there are patching standards, so this is the patch written down instead of patched: what it needs, in what order, with every number already tested in Python. When the pause lifts, the build should be a port of `table_voice.py`, not a design session.

## What it is

One polyphonic modal voice: up to 96 decaying sine partials per note. The browser instrument (`proofs/instrument.html`) and this device make the same sound from the same data; `table-voice-checks.txt` shows the Python version of the device matching the browser to 3e-13 on 47 strikes.

## The data it reads

`partial-tables.json`, written by `partial_tables.py`. Three shapes, one row per mode:

| shape | rows | distinct pitches | what a row holds |
|---|---|---|---|
| line | 18 | 18 | `n`, `krel`, `slot` |
| square | 482 | 205 | `m`, `n`, `krel`, `slot` |
| disk | 230 | 230 | `m`, `n`, `krel`, `slot`, `radial` (257 samples of the mode's radial shape, already normalised) |

`krel` is the mode's wavenumber over the lowest one. `slot` groups rows that share a pitch under both equations, so their loudness adds into one oscillator. The disk's radial lookup is the only reason the device never needs a Bessel function; linear interpolation on 257 points costs at worst -54 dB on one partial.

In the patch: three `buffer~`s per shape (or one `data` per column), loaded once from the JSON by whatever the standards say is the right way to load data.

## Parameters

| name | range | default | what it does |
|---|---|---|---|
| equation | wave · Schrödinger | wave | pitch ratio = `krel` (wave) or `krel²` (Schrödinger) |
| shape | line · square · circle | square | which table |
| strike X, Y | 0–1, 0–1 (XY pad) | shape's default | where the mallet lands |
| pickup X, Y | 0–1, 0–1 | shape's default | where you listen; a second pad, or hidden behind a menu |
| angle of i (θ) | 0.001°–3°, log taper | 0.03° | ring or thud: pitch × cos θ, every partial's damping ratio = sin θ |
| mallet | 0.02–0.8 | 0.25 | felt softness: loudness × exp(−(krel·mallet)²/2) |
| budget | 16–128 | 96 | oscillators per voice |
| level | dB | 0 | after the fixed gain below |

For the line, the pad's X is the point and Y is ignored. For the circle, the pad maps to the disk: u = 2X−1, v = 2Y−1, r = √(u²+v²), angle = atan2(v, u), and r is held just inside 1 (at the rim every mode is silent).

## The signal flow

**Control rate — on a new strike point, shape, equation, mallet or note** (0.6 ms in Python for the square's 482 rows; well inside one control tick):

1. For every row: g = exp(−(krel·mallet)²/2); a = φ(strike)·φ(pickup), where φ is √2·sin(nπx) for the line, 2·sin(mπx)·sin(nπy) for the square, and R(r_s)·R(r_p)·cos(m(angle_s − angle_p)) for the disk.
2. ratio = krel or krel². Drop the row if f1·ratio·cos θ ≥ 0.45·sr.
3. Add g·a into its `slot`.
4. Keep the `budget` loudest slots. Drop any below 1e-5 of the loudest.
5. Gain = 1 / Σ|a| over what's kept. It bounds the peak, so nothing clips, and it can be set before the note sounds. Check 4 measures the presets landing within 5.6 dB of each other this way; the browser instead reads each strike's peak, which a live device can't do.

**Audio rate — per voice, per partial:** one complex rotation, the same recurrence the browser runs.
`re, im ← (re·c − im·s), (re·s + im·c)`, scaled by `d`, where `w = 2π·f1·ratio`, `c, s = cos, sin(w·cos θ / sr)`, `d = exp(−w·sin θ / sr)`. A note starts with re = a, im = 0, plus the 2 ms fade-in. Output Σ re × gain. Free the voice when the lowest partial is 80 dB down: ln(10⁴) / (2π·f1·sin θ) seconds.

At 96 partials that is about 6 multiplies per partial per sample: under 30 million a second per voice at 48 kHz.

## What the budget costs

From check 3, strike error against all partials, θ 0.03°:

| budget | worst preset |
|---|---|
| 32 | −21 dB (square drum) |
| 64 | −36 dB (square drum) |
| 96 | −54 dB |
| 128 | −67 dB |

The boxes and the line need under 60 and are exact at 64. Only the two drums use the top of the budget, so a CPU-tight build could run 64 for the boxes and 96 for the drums.

## What a Live port must keep, and what's still mine to choose

Physics, keep exactly: the tables, the two pitch rules, φ, the angle of i acting as cos θ on pitch and sin θ on every partial's damping.

My choices, open to his ear: the felt mallet's Gaussian, the 2 ms fade-in, the Σ|a| gain, the default strike and pickup points (drum.py's), the 96 budget.

## Not yet known

Nobody has played any of this by ear. The device itself is unbuilt and unverified until Loudon opens it in Max after the pause lifts. The loading of a 582 KB JSON into RNBO, and whether a 96 × polyphony loop fits a codebox's per-sample budget in Live, are questions only the build answers.
