# Wavetable Scanner — the plugin

The browser synth (`../wavetable_synth.html`) as a VST3 and AU, made from the [[VST Template]] with `new-plugin.py "Wavetable Scanner" Wtsc --into "Projects/Wavetable Scanner/plugin"`. Its window has the scanner's 3D landscape in the middle. The table's frames are laid back into the screen as ridges, and an amber line marks the frame that's playing. Drag up and down on the picture to move Position. The drag moves the knob itself, so it records as automation and can be undone.

## What's in it

- `src/Algorithm.h`: `synth/wt-synth.js` ported line for line. It has eight voices (or mono and legato with glide), 1–7 unison copies, the 12 dB lowpass, two envelopes on the Synth Templates curve, two LFOs and transpose. At load it runs the page's spectral morph (`alignRotations` + `spectralMorph` from `packer/packer.js`, then the page's loudness match) and the per-octave band-limiting (`buildMips`). The work happens once and every instance shares it.
- `src/Tables.h`: the raw frames of three tables, written by `tools/make_tables.py` from the same sources `synth/build_synth.py` bakes into the page. They are the Sketch's five classics, the 19-cycle cello and the 122-cycle FM family chain. The FM chain is rounded to int16 on the way in, as it is in the page.
- `ui/visualizer.src.js` → `ui/visualizer.js` (the tables baked in at 128 points a frame): the landscape. Position comes from the plugin's probe, so the amber line follows the LFO and the mod envelope as well as the knob.
- `reference/sketch.py` + `ref_render.cjs`: the reference is the browser synth's own engine, run in Node, rather than a numpy copy of it. The JS engine sets its slow values every 16 samples, so the reference renders in 16-sample blocks and `Algorithm.h` keeps a 16-sample counter. `paths.py` puts every note and every move on those marks.

## What the checks say (2026-11-04)

| path | engine against the browser engine | plugin loudness against it |
|---|---|---|
| fm-sweep: FM chain, three notes, Position swept by hand | 0 (bit for bit) | within 0.40 dB (the 20 ms smoothing on Position) |
| cello-envelopes: four-note chord, the mod envelope scanning, filter envelope | 0 | 0.0003 dB |
| classics-lfo: triangle LFO on Position, LFO 2 on the cutoff, 7 unison copies | 3.6e-8 of peak | 0.00003 dB |
| legato-glide-high: legato, glide, transpose −12, then C8 | 0 | ~0 |
| voice-steal: nine notes into eight voices | 0 | ~0 |

pluginval passes at strictness 5, auval passes, the strict codesign check passes, and the host check loads both the VST3 and the AU and hears the moves in `plugin.json`. The editor fits at its minimum (1120 × 780), its default (1280 × 820) and its maximum (`ui.py fit`). `shot-editor.png` and `editor-mock.html` are the template's mock: the same editor page, fed by a harness render, photographed in Chrome. `./plugin.sh editor` couldn't take the real window's photo from a headless run, because macOS screen capture said no.

To rebuild: `python3 tools/make_tables.py`, then `./plugin.sh all`.

## Not here yet

- **The mod wheel, pitch bend and sustain.** The template's wrapper sends notes only, so CC1 doesn't reach Position. In Live, MIDI-map the wheel to Position for now. A `cc()` hook in the shared machinery (`machinery/src/PluginProcessor.cpp` `handleMidi`) would fix this for every plugin. That's the VST Template's own code, so I've offered it there rather than editing it.
- **Loading your own table.** The three tables are built in. Loading a packed WAV from disk, or a folder packed the way the page packs it, is the next move. The morph is already in C++, so the work left is a file chooser and a hand-off off the audio thread.
- **Memory.** All three tables are morphed and band-limited up front: 1,251 frames × 10 octaves, about 51 MB, built once (about a second) at the first prepare.
- **Ears and Live.** The plugin is installed in `~/Library/Audio/Plug-Ins`, but nobody has opened it in Live or heard it.
