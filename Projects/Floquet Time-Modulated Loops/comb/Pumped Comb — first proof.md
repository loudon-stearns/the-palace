# Pumped Comb — first proof (2026-11-03)

The plan's second instrument, carried in Python while Max work is paused. A Karplus-Strong loop (delay + two-point average) with loop gain 0.98, so every ring dies on its own, and the gain pumped: g(t) = 0.98 · (1 + ε cos 2π f_pump t). The question is the resonator's question: where does a ring grow out of noise?

Rebuild: `python3 comb_tongues.py && python3 comb_filter_width.py && python3 comb_render.py && python3 comb_patterns.py && python3 comb_figure.py`. Numbers in the `.json` files beside this note.

## What it measured

- **Tongues only at whole-number ratios.** Pump at 1×, 2× or 3× the loop rate (f₀ ≈ 219.7 Hz) and a ring grows once ε passes 0.025 (the pump's peak has to lift the loop above unity: 1/0.98 − 1 = 0.0204, plus the filter's loss). Everywhere between, from ratio 0.4 to 3.6 at every depth up to 0.25, nothing grows: the best off-integer rate is −38.8 dB/s against −39.9 unpumped. The resonator's tongues sit at 2/n; the comb's sit at n.
- **They are hair-thin.** At ε 0.2 the Karplus-Strong loop locks only within ±0.1 % (≈ 1.7 cents). A darker loop filter widens it: a 16th-order smoother gives ±0.55 % (≈ 9.5 cents) at the same depth, and 13 cents at ε 0.4. The filter is what lets the pulse be pulled; a pure delay can't be pulled at all.
- **Inside the tongue the loop builds pulses.** The gain peak is a window that opens once per pump cycle; whatever circulates through it grows and the rest dies, so the ring narrows into a pulse riding the gain peak. That is active mode-locking, the way a laser with a modulated cavity makes short pulses.
- **At 2× and 3× the noise picks the timbre.** There are m slots per trip, and which fill, with which sign, is decided by the noise that seeded them. At 3×, seed 4 filled all three equally (only multiples of 3 f₀ sound, −80 dB elsewhere: the pitch jumps a twelfth); seed 3 filled them with mixed signs and sizes (all harmonics, h1 loudest). At 2×, one seed gave equal opposite pulses: odd harmonics only, evens at −84 dB, which is the ρ = −1 period-doubling case from the resonator, on a string.
- **Length pumping makes the ladder without growth.** Pumping the delay length ±0.6 samples at 1.5 f₀ puts partials halfway between the string's harmonics (0.5, 1.5, 2.5, 3.5 f₀ at −39 to −46 dB, from below −116 unpumped).

## The renders

- `comb_a_ratio1_crack.wav` — 1×, ε 0 → 0.10 over 8 s. Floor −78 dB, cracks at ≈ 3.2 s (ε ≈ 0.039) into a held buzz at 219.7 Hz.
- `comb_b_ratio2_hollow.wav` — 2×, same ramp. This seed settled on equal opposite pulses: odd harmonics only, a hollow, clarinet-like buzz at the same pitch.
- `comb_c_glide_through_lock.wav` — ε 0.2 held, pump glides 0.99 → 1.01 × f₀. Sound from ratio ≈ 0.994 to 1.007: wider than the lasting lock, because the ring builds while the pump slides past and then takes half a second to die.
- `comb_d_length_pumped_pluck.wav` — a pluck, 2 s plain then 2 s with its length pumped.
- `comb_e_three_slots_four_seeds.wav` — 3×, ε 0.1, four seeds, 2.5 s each. Same knobs, different strings.

## Left open

Seed dependence was checked over four seeds and 2.5–6 s runs; whether a mixed pattern drifts to an even one over longer times is not measured. Lock edges at ±0.1 % sit near the measurement's resolution (a slip of 0.1 % takes 4.5 s; the run measures 3.4 s), so the K-S widths may be slightly generous. Nothing here was heard by a person yet.

## For the Max build, when the pause lifts

Signal flow: noise (1e-4) + tanh( g · ½(y[n−L] + y[n−L−1]) ) → delay L. g = g₀(1 + ε cos φ), φ advancing at ratio · f₀ where f₀ = sr / (L + ½). Parameters: g₀ (0.98), ε (0–0.4), ratio (0.5–4, with a fine-detune in cents — the tongues are a few cents wide, so the knob needs a cents scale near the integers), length-pump depth (samples) and rate, loop-filter order. A spectrum view beside it is the lesson.
