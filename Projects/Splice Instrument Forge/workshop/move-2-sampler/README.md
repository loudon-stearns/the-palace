---
title: "README"
born: 2026-10-24
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: move-two-of
forward_vector: "I am move two's folder: three Splice one-shots became a Live Sampler instrument and a Set, and I say how, so the next kit is three commands."
---

# Move two — a Sampler from Splice one-shots

**Astromode Analog**: three Soul Surplus one-shots (an analog synth single note in C, D and E, found with the Splice connector's `describe_a_sound`, fetched with `download_asset`) laid across the keyboard in Live's Sampler.

## The three commands

```bash
python3 -I detect-roots.py samples            # roots.json: f0, MIDI note, cents, channels, rate, frames per file
python3 -I build-sfz.py "Astromode Analog" --release 0.5     # an SFZ the Ableton Session Writer reads
node "<palace>/Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" library "Astromode Analog.sfz" --out "Astromode Analog.als" --tempo 90
python3 -I als-to-adv.py "Astromode Analog.als" "Astromode Analog.adv"    # the Sampler alone, as a Live preset
```

Then `live-set.mjs check "Astromode Analog.als"` and open the Set in a second Live 12 (`open -n -a "Ableton Live 12 Suite" …`).

## What each step does

- **detect-roots.py** takes the loudest half-second after the attack, autocorrelates it, takes the first strong peak (so an octave-down error can't win), refines by parabolic interpolation, and reports MIDI note and cents. It also reads the note the filename claims, so a mismatch is visible. The three came back C1, D1, E1 within 4 cents of their claims.
- **build-sfz.py** splits key ranges at the midpoints between roots and runs them to the ends of the keyboard, tunes each region by the detected cents, one velocity layer, a short attack and the release you give it. SFZ because the writer's `library` job already turns SFZ regions into Sampler zones and proves the Set opens; nothing in the writer changed.
- **als-to-adv.py** lifts the `MultiSampler` element out of the Set, drops its `Id` attribute, zeroes every pointee id (the format study found Live writes presets that way), wraps it in the header from Live's own `Sampler.adv`, and gzips. The preset references the same WAVs by absolute path.

## Known limits

- Splice's one-shot families are uneven: this one has three analog notes and a different timbre for the rest. A fuller multisample wants a search per note or a loop-free stack layer per pitch.
- Stereo 24-bit WAVs went straight in; the writer only proved mono 16-bit before today. Live's Sampler takes both, and `check` reads every file's frames.
- The `.adv` has not been loaded in Live by dragging it onto a track; the Set has (see the scroll). Loading the preset directly is the next proof.
