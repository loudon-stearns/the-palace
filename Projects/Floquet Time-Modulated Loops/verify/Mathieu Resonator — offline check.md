# Mathieu Resonator — offline check (2026-11-03)

What `node verify/mathieu_mirror.mjs` found when it ran `RNBO/mathieu_resonator.codebox`'s own text in Node, with no Max and no edit to the file. Rebuild everything with `python3 verify/ref_dump.py && node verify/mathieu_mirror.mjs && python3 verify/plot_rulings.py`. Numbers: `verify/mirror_report.json`.

## The codebox matches the reference

Test 7 (the A/B): fed the reference's stored noise, the codebox reproduces `mathieu_reference.py` to 1.2 × 10⁻¹⁵ over 4 s — 292 dB under the peak, which is rounding. Its pre-normalise peak is 0.4682, the number the build notes recorded. This proves the arithmetic, not that RNBO compiles it.

## What the checklist says, and what the codebox does

| test | the README and codebox comments say | measured on the codebox |
|---|---|---|
| 1 · no pump | Q ≈ 33, 3 dB bandwidth ≈ 6.6 Hz | rings at 220.02 Hz, Q = 19.98 (1/2ζ), so bandwidth ≈ 11 Hz |
| threshold | q ≈ 4ζ = 0.10 | q = 2ζ = 0.0500 (also 0.0250 at ζ 0.0125, 0.1001 at ζ 0.05) |
| 2 · "below threshold" q = 0.05 | dim ring, nothing builds | on the threshold: growth −0.005 /s. Below is q ≈ 0.03 (−13.8 /s) |
| 3 · sweep 0 → 0.5 | crack near 0.10 | at the default noise there is no crack to hear: the floor is −14.5 dBFS against a −8.2 ringing top. At noise 1e-5 the crack is at q ≈ 0.063 (floor −47 dBFS) |
| 4 · spectrum q = 0.3 | fundamental + ladder | 220 Hz 0 dB, 660 −19.8, 1100 −37.3; even harmonics under −46 |
| 5 · detune at q = 0.2 | ≥ 5 % detune exits the tongue | the tongue runs from ratio 1.802 to 2.189 (first-order theory 1.806–2.194). At 1.85 it still grows at 60 /s; it exits only past ~10 % |
| 6 · q = 0.8 | finite, saturated | 0 non-finite samples, −7.6 dBFS. Without the state clip, float32 overflows in 0.19 s |

## The default noise is too loud for the lesson

At `noise_level` 0.001 the resonator's own gain lifts the noise to −18 dBFS with no pump at all, only 8.6 dB under the full ring. "Silence below threshold" needs about 1e-5 (floor −55 dBFS, 46 dB of contrast). 1e-4 gives 26 dB.

## The two calls, as heard

- `audio/rulings/call1_damping_four_sweeps.wav` — four 6 s sweeps of q 0 → 0.3 at ζ 0, 0.0125, 0.025, 0.05, noise 1e-5. The crack lands at 0, 0.5, 1 and 2 s into each.
- `audio/rulings/call2_saturation_three_ways.wav` — three ways to stop the growth, each 3 s at q 0.15 then 3 s at q 0.6, level-matched on the first half. **build** (the codebox): clip the state at ±8, output tanh. **gentle** (sketch): damping grows with the ring's energy, the way a real parametric oscillator runs its pump dry. **stiff** (sketch): the spring stiffens with amplitude. All three sit exactly on 220 Hz: inside the tongue the ring is locked to half the pump, so no saturation can move its pitch.
- At q 0.6, 3rd / 5th harmonic: build −15.5 / −28.3 dB, gentle −23.1 / −50.3, stiff −24.3 / −65.9. The tanh's odd harmonics land on the same frequencies as the Floquet ladder (220 ± n·440), so in the build you cannot hear which is which. Gentle leaves the ladder as the linear theory makes it.

## When the Max pause lifts

The codebox and README are Max work and stay untouched until then. What they will need, all comments and defaults, no change to the arithmetic: threshold 2ζ (0.05) everywhere it says 4ζ (0.10); Q ≈ 20 / bandwidth ≈ 11 Hz in Test 1; Test 2 at q 0.03; Test 3's crack near 0.05–0.06 with `noise_level` ≈ 1e-5 for the test; Test 5 detuning to 1.80 and 1.75; and whichever saturation Loudon picks.
