# MusicGen Violin — the first finished AI-sourced instrument

A bowed violin from G3 to C7 (42 keys, 24 samples), every note played by
MusicGen from a hummed guide tone, kept only if pitch detection heard the
note it was filed under. Loads two ways:

- **DecentSampler (free plugin):** drag `MusicGen Violin.dslibrary` onto the plugin.
- **sforzando / sfizz / Surge XT / Bitwig:** open `MusicGen Violin.sfz` (keep `samples/` beside it).

## What to play

1. A slow scale from C4 up two octaves. Listen for one player, not a relay
   of strangers: no key should jump louder or quieter than its neighbours.
2. Hold any key for ten seconds. It should keep bowing (the loop) without a
   tick or a pump at the turn, and without swelling much after it starts.
3. The same note soft, then hard. Soft should be quieter *and* darker in the
   SFZ; in DecentSampler, quieter only.

## What changed from the last build (`instruments/in_range/violin_looped`)

| | last build | finished |
|---|---|---|
| loop level, quietest to loudest key | 21.3 dB apart | matched |
| the tune in `phrase.wav`, biggest jump between neighbouring notes | 14.4 dB | 3.1 dB |
| worst swell from a note's quiet start into its loop | 8.6 dB | 4.3 dB |
| seams clean on a 12 s hold | 24/24 | 24/24 (worst click +3.0 dB, limit +6) |
| keys on pitch, SFZ and DecentSampler | 42/42 | 42/42, worst 2.4 cents |
| velocity | volume only | softer = quieter and darker (SFZ) |

## Ear files

- `phrase_before.wav` / `phrase.wav` — the same scale and tune, last build then finished.
- `held.wav` — low, middle and high key held 7 s, last build then finished.
- `velocity.wav` — one key bowed at velocity 30, 60, 90, 127.

## Not verified

Nobody has opened it in a sampler yet; the numbers come from playing the
files through a Python model of the SFZ. The velocity filter is my model of
`fil_veltrack`, not sforzando's. C4's take loops a quiet stretch and was
lifted 19 dB to match, so it may carry more bow noise than its neighbours.
Rebuild: `finish_instrument.py` then `to_decentsampler.py` (see DESIGN.md).
