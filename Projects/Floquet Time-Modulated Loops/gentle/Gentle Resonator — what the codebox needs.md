---
title: "Gentle Resonator — what was measured, and what the codebox needs"
born: 2026-11-04
---

# Gentle Resonator — what was measured, and what the codebox needs

Loudon chose **GENTLE** on 2026-11-04: the resonator stops growing because its damping rises with the ring's energy, not because its state is clipped. Max is paused, so this is carried in Node and the browser. `RNBO/mathieu_resonator.codebox` is untouched. Rebuild everything with `node gentle/gentle_resonator.mjs && /usr/local/bin/python3 gentle/gentle_figure.py`. Numbers: `gentle/gentle_report.json`.

## The one new line

```
E      = x*x + (v/omega_0)^2                      // the ring's energy
zeta_e = min(damping_zeta + sat_g*E, 0.45/omega_0) // the cap keeps the damping term from flipping sign
v      = v + (-(a - 2*q*cos(phi))*x - 2*zeta_e*omega_0*v + noise)
x      = x + v
out    = gain * x
```

No state clip, no `tanh`. `sat_g` = 0.475 puts a full pump (q 1, centred) at amplitude 1.

## What it does, measured

- **The level follows the pump.** It settles where the extra damping uses up what the pump puts in: E = (q/2 − ζ)/g on the tongue's centre line. Measured from q 0.06 to 1, it agrees within 3 %.
- **The crack is still there.** With a q sweep from 0 to 0.6 over 12 s and noise 1e-5, the floor sits at −45 dBFS and the ring cracks open at q ≈ 0.075, then climbs to −12 dBFS: 34 dB of contrast. The threshold is still 2ζ = 0.05. On a sweep the crack is heard a little later, because growth just past threshold is slow.
- **Inside the tongue the pitch belongs to the pump.** Hold q at 0.3 and glide the pump rate from 1.6 to 2.4 times the resonator frequency. The ring's pitch follows half the pump, to 0.1 Hz, from 190 Hz up to 247 Hz, while the resonator itself stays tuned to 220. Its loudness swells and fades across the tongue. Past the edges it falls back to filtered noise.
- **It keeps itself alive.** Cut the noise mid-ring at q 0.4 and the level holds at −13.4 dB for the next four seconds. The pump is the source.
- **The ladder is clean.** The 660 Hz rung sits at −35 / −26 / −21 dB under the fundamental at q 0.15 / 0.4 / 0.8, and the 1100 Hz rung at −74 / −57 / −47 dB. No clipping overtones sit on top of it.
- **The tongue leans.** Off the centre line the first-order law misses past q ≈ 0.3. The real tongue is louder toward low pump ratios and quieter toward high ones; at q 0.5, ratio 2.475, the law says 0.11 and the resonator gives 0.02. The lean grows when the step is smaller (55 Hz leans more than 220, and 880 less), so it is the Mathieu tongue's own second-order bend, not the integrator. At high notes the symplectic step partly straightens it, so the tongue's shape depends a little on pitch.
- **Safe.** q 1 at ratios 2 and 1.5, at 20, 220 and 4000 Hz, with the loudest noise: not one non-finite sample in 5 s each.

## When the Max pause lifts — the codebox needs

1. Replace the state soft-clip and the output `tanh` with the gentle tick above, and add `@param sat_g` (0.1 – 2, default 0.475).
2. Default `noise_level` to 1e-5, and scale the noise by (ω₀/ω₀@220)² so the floor doesn't jump with pitch. At 20 Hz with unscaled noise 0.01, the noise alone peaks at 5.
3. The comment fixes the offline check already listed: threshold 2ζ (not 4ζ), Q ≈ 20, Test 2 at q 0.03, Test 5 detuning to 1.80 / 1.75.
4. Add the walk test: at q 0.3 the pitch must track half the pump across ratios 1.73 to 2.24.
5. The A/B reference becomes `gentle/gentle_resonator.mjs`. `RNBO/mathieu_reference.py` describes the old saturation.

## Files

- `gentle_a_crack_and_climb.wav`: q 0 → 0.6 over 12 s. The crack, then the level rising with the pump.
- `gentle_b_tongue_walk.wav`: q 0.3, the pump ratio glides from 1.6 to 2.4 over 14 s. The pitch follows the pump.
- `gentle_c_three_depths.wav`: q 0.15, 0.4 and 0.8, held 4 s each.
- `gentle_d_noise_cut.wav`: a ring at q 0.4, with the noise cut at 2 s.
- `gentle_map.png`: the measured loudness over pump ratio × depth, with the first-order edges, and the centred level law.
- `Gentle Resonator — play.html`: the resonator, live in the browser. Click the map to move, watch the measured level against the law, and see the pitch follow the pump.
