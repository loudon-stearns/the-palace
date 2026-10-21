# What the crowd codebox needs once Max work reopens

Max work is paused (Loudon, 2026-10-16), so `neuropulse-crowd.codebox` (v0.1.1) is untouched and **no longer matches** `neuropulse.dsp` (v0.4.0). Its last sample-for-sample match was with v0.2.1. Two changes are needed to match again. Both were tested in Faust on 2026-10-20 (`pitch-anchor/`).

## 1. Pitch anchor: a new signal inlet, `in9`, from 0 to 1, default 1

A locked crowd plays its fastest member's own pitch. Shift the whole spread so that member sits on the frequency inlet:

```
f_base = freq / (1 + anchor * spread * top_jitter)
```

`top_jitter` is the largest of the per-neuron rate offsets `jitter(i)` over the crowd. It is a constant for a given crowd size, so compute it once in the init block, never per sample. Then use `f_base` wherever the codebox now uses `freq` for each neuron's rate. Anchor 0 is the old behaviour: the scattered cloud is centred on the note, and the lock goes sharp (+309 cents at 20% spread). Anchor 1 makes the lock land on the note, and the scattered cloud sits flat (−280 cents at 20%).

## 2. Measured frequency compensation: two more state arrays per neuron

- `el[i]`: samples since this neuron fired. Set it to 0 on the sample it fires, and add 1 on every other sample.
- `v0[i]`: the voltage at the moment the recovery hands over to the charge (phase 3 → 0).

Replace the fixed `drive0` with a drive recomputed every sample during the charge:

```
m     = max(1, period - (el - t) - 0.5)     // t = samples spent in this charge so far
c     = pow(leak_coeff, m)
drive = (thr - v0 * c) / (leak_tau * (1 - c)) + K * coupling
```

This brings every single neuron to within one sample of its period: 1.4 cents at 110 Hz, about 4.5 cents at 330 Hz. The old version was 9 to 23 cents off depending on pitch. Coupling is untouched, because the drive never looks at when the neighbours fired. The `pow` runs per sample per neuron, as in the Faust code. If 32 of them per sample are too much on the H90, recompute only when `freq` moves or at the start of each charge. That costs pitch-CV response inside one period.

## Check after porting

Run `codebox-harness.mjs` against a Faust `-double` build of v0.4.0 with the same 30 s coupling sweep, as `check_codebox.py` does. The audio should match to about 1e-7 and the synchrony output should be identical.
