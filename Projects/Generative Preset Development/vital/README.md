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

## Not yet

- Nobody has listened to any of it. The measurements say what changed, not what it sounds like.
- `load()` checks the scalar settings read back; it does not check wavetables or the matrix
  did, beyond the sound changing.
- The generator and the prompt test come next.
