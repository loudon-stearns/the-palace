# Vital — workshop

The second synth on the plan, after Ableton Wavetable. What makes Vital different
here is not that its presets are plain JSON. It's that **Vital can be rendered
without anyone opening it**, so every preset this project makes or reads can be
measured before Loudon listens. Wavetable can only be heard by Loudon in Live.

## Run it

One-time setup, outside the palace (a venv doesn't belong in git):

```
python3 -m venv ~/.venvs/palace-vital
~/.venvs/palace-vital/bin/pip install pedalboard numpy mido scipy
```

Then, from this folder:

| script | what it does |
|---|---|
| `vital_host.py` | hosts `/Library/Audio/Plug-Ins/VST3/Vital.vst3` through pedalboard; `load(plugin, preset)` puts any `.vital` in as plugin state and checks it read back; `render(plugin, notes, hold, tail)` plays it |
| `vital_render.py <preset.vital> … [--out dir] [--chord]` | WAV plus a sidecar of measured features (level, brightness, how much brightness moves, rise, width, tail) |
| `vital_corpus.py` | mines all 520 presets in `~/Music/Vital` → `profile-draft/vital_corpus_stats_v0.1.json` (usage bands, modulation census) |
| `vital_measure.py` | renders one-knob ladders on the init patch and measures them → `profile-draft/vital_measured_v0.1.json`, `renders/ladder-*.wav` |
| `vital_loadcheck.py` | loads every preset on the Mac and confirms each one took |
| `generate_vital.py <recipe> --render` | Track A: a recipe in feel-words → presets, rendered and measured against init |
| `reshape_vital.py <preset> "<direction>"` | Track C: darker / brighter / menacing / breathe / strip; renders before and after and says whether each move kept its promise |
| `run_reshape_test.py` | the modification test: four pads × directions → `reshaped/reshape-test.json` |

## Format notes

- `.vital` = JSON: `author, comments, macro1..4, preset_style, synth_version, settings`.
  `settings` holds ~775 scalars plus `wavetables`, `lfos`, `modulations` (`[{source, destination}]`;
  depth lives in scalar `modulation_N_amount`), and `sample`.
- Units the knob numbers hide: `filter_*_cutoff` is in semitones on the MIDI note scale
  (60 = middle C, 261.6 Hz; Hz = 440·2^((st−69)/12)). Envelope times are quartic:
  seconds = raw⁴ (raw 0.1495, the default attack, is 0.5 ms).
- Most corpus files say `synth_version 1.0.x` and lack six keys 1.5.5 has; `load()`
  lays a preset over Vital's own init state, so the missing keys get init values.

## Gotchas

- **`Vital --headless --render` crashes** (segfault in `renderAudioToFile`, Vital 1.5.5).
  That's why we host the plugin instead.
- **The state wrapper has two length fields and an outer one.** Plugin state is
  `b"VC2!"` + little-endian XML length + XML holding the component as JUCE base64; inside,
  a `VstW` header and an fxb `CcnK/FBCh` chunk (size at byte 20, chunk size at 172, JSON
  from 176, `JUCEPrivateData` trailer). Leave the outer `VC2!` length stale and every preset
  longer than the init state is cut short and silently refused. It masqueraded as several
  other bugs first. Fixed in `vital_host._write`.

- **Osc 2 and 3 skip Filter 1 by default.** Vital's init sends them to Filter 2, which is off,
  so they pass unfiltered and a "dark" cutoff never reaches them (Pressure measured 4 kHz bright
  until this was found). `generate_vital.py` now routes every oscillator that's on through Filter 1
  when only Filter 1 is on, unless the recipe sets `osc_N_destination` itself.

## The prompt test

`recipes/light-through-deep-water.json` holds three takes on "a pad that sounds like light through
deep water" (Caustics, Pressure, Shafts). `generate_vital.py <recipe> --render` writes the presets,
renders a held chord of each beside Vital's init, and writes `prompt-test.json` with the feature
distances. First run 2026-11-13: every take is 5.6 to 7.0 from init and 1.8 to 5.3 from each other.

## The reshape test

Each move carries a promise a render can check (darker: brightness down a third of an octave;
menacing: more energy under 150 Hz and peaks shaved; breathe: more movement while held and a
first 150 ms 3 dB softer; strip: width down a third). First run 2026-11-14: 7 of 10 kept.
What the broken ones taught, and the fixes already in:

- **"On" is not "heard."** Pad Of Exile ships distortion on with its mix at 0. The move now raises the mix.
- **A cutoff knob at the floor can still be bright.** Stringpad 1's knob sits at 13 Hz and an LFO and a
  macro open it. "Darker" now turns down what pushes the knob; brightness fell 2459 → 567 Hz.
- **A filter that isn't a low-pass** (Sparkly pad's model 6) gets an EQ high shelf at the sound's own
  measured brightness, not a fixed 1.5 kHz, which did nothing to a pad already at 490 Hz.
- **Two rulers were wrong and were replaced**: spectral flatness for "rough" (a darker filter removes hiss,
  so it fell on a sound driven harder) → crest; 10–90 % rise for "slower onset" (reverb and unison build
  for seconds, so it lands late either way) → level of the first 150 ms.

Still broken: **menacing** on a pad that already uses all three oscillators has no room for a sub, so
distortion only brightens it (energy under 150 Hz fell). **breathe** from a punchy attack lands only in
'soft', about 0.1 s, not enough to soften the onset.

## Not yet

- Nobody has listened to any of it. The measurements say what changed, not what it sounds like.
- `load()` checks the scalar settings read back; it does not check wavetables or the matrix
  did, beyond the sound changing.
- A describer (Track B) for Vital. The reshaper's change log reads band words already; the
  Wavetable describer (`../ableton-wavetable/describe_preset.py`) is the model to follow.
