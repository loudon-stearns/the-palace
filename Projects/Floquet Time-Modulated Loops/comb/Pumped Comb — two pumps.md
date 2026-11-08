# Pumped Comb — two pumps (2026-11-03, cycle 3)

The plan's second instrument asks for a string whose loop gain and loop length are each pumped at their own rate, with a spectrum view beside the audio carrying the lesson. Max is paused, so this is carried in the browser: `Pumped Comb — two pumps.html` is the playground (six presets, both pumps, a spectrogram and a last-second spectrum with the string's harmonics and the length pump's ladder ruled over them). Its engine mirrors `comb_render.py` `run()` and matches it to 1.5e-8 on a second with both pumps on.

Rebuild the checks: `python3 comb_two_pumps_ref.py && node comb_two_pumps_check.mjs` → `comb_two_pumps.json`, and the two WAVs below.

## What it measured

- **The held ring survives length pumping at whole-number rates.** Loudness pump at 1×, ε 0.1, holding the buzz at about −13 dB. Wobble the length at 0.5, 1, 1.5, 2 or 3 × f₀ and the ring never broke, out to ±32 samples (±15 % of the loop). 2.5× broke only at ±32. When the wobble repeats every one or two passes, the pulse meets the loudness peak at the same moment each time.
- **At a stray rate it breaks.** 1.2× broke at ±8, 1.25 / 1.333 / 1.7 at ±12, √2 at ±24, π/2 at ±32, 2.1213 at ±6. I found no simple rule among these; nearness to a half-integer helps some (π/2, √2) and not others (2.1213 is near 2 and died first). On the preset's rising ramp the 2.1213 ring dies at ±5.25 samples.
- **Together the two pumps make what neither makes alone:** a sustained tone with partials between the harmonics. At 1.5×, ±16 samples, 11.6 % of the power sits between harmonics while the level holds at −14 dB. The length pump alone makes that ladder only on a dying pluck; the loudness pump alone keeps every partial on a harmonic.
- **The saturated loop holds wider than the small-signal tongue.** At ε 0.2 the loudness pump detuned by ±4 cents still holds a tone at full level, ±8 cents at −16 dB, ±12 at −31, ±16 at −45. But the held tone does not follow the pump: at +8 cents it sounds 1.3 cents above f₀, not 8. So the "lock" the last proof measured (±1.7 cents, how fast the ring grows from noise) and the range where a held tone survives are two different widths.

## The renders

- `comb_f_held_halfway_length.wav` — 8 s. Loudness pump 1× ε 0.1 holding the buzz; length pump at 1.5× rising from 0 to ±16 samples. The halfway partials rise in and the tone stays.
- `comb_g_held_stray_length.wav` — 8 s. Same, length pump at 2.1213× rising to ±12. The tone smears and drops back to noise around ±5 samples.

## Left open

One seed for every number here. Nobody has heard these yet. Why stray rates break in the order they do is not explained. The unlocked held tone at 4–8 cents detune is measured, not understood.

## For the Max build, when the pause lifts

Same signal flow as the first proof, plus the length pump: d[n] = L + D sin φ_L, φ_L advancing at r_L · f₀, read with linear interpolation, and the delay buffer sized for L + D + 4. Knob design: offer the length-rate knob with detents at whole and half numbers (that is where the held tone survives deep wobble) and a free mode for the stray rates that break it. The loudness-rate fine knob wants a cents scale reaching about ±20.
