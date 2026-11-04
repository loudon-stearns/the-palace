# Wavetable Scanner — the plugin

The browser synth (`../wavetable_synth.html`) as a VST3 and AU, made from the [[VST Template]] with `new-plugin.py "Wavetable Scanner" Wtsc --into "Projects/Wavetable Scanner/plugin"`. Its window has the scanner's 3D landscape in the middle. The table's frames are laid back into the screen as ridges, and an amber line marks the frame that's playing. Drag up and down on the picture to move Position. The drag moves the knob itself, so it records as automation and can be undone.

## What's in it

- `src/Algorithm.h`: `synth/wt-synth.js` ported line for line. It has eight voices (or mono and legato with glide), 1–7 unison copies, the 12 dB lowpass, two envelopes on the Synth Templates curve, two LFOs and transpose. At load it runs the page's spectral morph (`alignRotations` + `spectralMorph` from `packer/packer.js`, then the page's loudness match) and the per-octave band-limiting (`buildMips`). The work happens once and every instance shares it.
- `src/Tables.h`: the raw frames of three tables, written by `tools/make_tables.py` from the same sources `synth/build_synth.py` bakes into the page. They are the Sketch's five classics, the 19-cycle cello and the 122-cycle FM family chain. The FM chain is rounded to int16 on the way in, as it is in the page.
- `ui/visualizer.src.js` → `ui/visualizer.js` (the tables baked in at 128 points a frame): the landscape. Position comes from the plugin's probe, so the amber line follows the LFO and the mod envelope as well as the knob.
- `reference/sketch.py` + `ref_render.cjs`: the reference is the browser synth's own engine, run in Node, rather than a numpy copy of it. The JS engine sets its slow values every 16 samples, so the reference renders in 16-sample blocks and `Algorithm.h` keeps a 16-sample counter. `paths.py` puts every note and every move on those marks.

## Your own tables: the folder slots

The Table menu ends in **folder 1** to **folder 8**. The plugin reads them from

    ~/Music/Wavetable Scanner/Tables

It takes the first eight `.wav` and `.wt` files by name, so a number at the front of a file's name picks its slot. It reads what the study page's export buttons save: a Serum / Vital CLM WAV (its frames are any size, and are resampled to 1024 in the spectrum), a Surge `.wt` (float or 16-bit) and a plain WAV of 1024-sample frames (the Ableton and Float buttons). Files of other sizes, single cycles and anything that isn't a table are skipped. A table over 512 frames is thinned evenly, ends kept. Each file goes through the same morph and band-limiting as the built-in tables, once, and every instance shares it until the file changes (`src/UserTables.h`).

The folder is read when the host prepares the plugin. In Live that is when the track's device is switched on, or the sample rate or buffer changes, so **after adding a file, switch the device off and on**. An empty slot plays the fm chain, and the picture says so. A filled slot is drawn as level ground with the scan moving across it (`shot-picture-folder-filled.png`), because the picture can't see the file yet: the editor has no way to hand it frames.

The folder was seeded on 2026-11-04 with two of the study page's exports: `1 eorgan family chain.wt` and `2 fmsynth family chain (serum).wav`.

`tools/folder_check.py` builds a folder of six files and points the plugin at it with `$WTSC_TABLES`:

| file | played against | engine | the real processBlock |
|---|---|---|---|
| the built-in fm chain's frames, as a float WAV | the built-in fm chain | bit for bit | bit for bit |
| the built-in cello's frames, as a float Surge `.wt` | the built-in cello | bit for bit | bit for bit |
| the study page's Serum export (CLM, 2048-sample frames) | its Surge export | −141 dB peak | −141 dB peak |
| the study page's Ableton export (16-bit) | its Surge export | RMS −64 dB, peak −52 dB | the same |
| one 600-sample cycle (not a table) | — | skipped; the slot is empty and plays the fm chain | the same |

16-bit rounding can tip the phase lock on a quiet harmonic, which is where the 16-bit file's one −52 dB tenth of a second comes from. The five reference passages, pluginval at strictness 5, auval and the host check all pass again with the folder slots in.

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
- **A file chooser, and the picture of your table.** Your tables load from a folder (above), not a chooser, and the slot's state saves as a slot number, not a file name: rename the folder's files and a saved set plays a different table. Both need a hook in the template's editor and state code, which is the VST Template's own.
- **Memory.** All three tables are morphed and band-limited up front: 1,251 frames × 10 octaves, about 51 MB, built once (about a second) at the first prepare.
- **Ears and Live.** The folder slots haven't been tried in Live either. The plugin is installed in `~/Library/Audio/Plug-Ins`, but nobody has opened it in Live or heard it.
