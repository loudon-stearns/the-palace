# Shepard Tone — the plugin

The endless staircase as a VST3/AU instrument for Live, built 2026-11-03 with [[VST Template]] (`new-plugin.py "Shepard Tone" Shpd --into …`). Code `Shpd`, Loudon Live. It holds what the four proofs settled, in one loop:

- **One glide on pitch, before the stack** (Theory § Stage 3). Ten voices a whole octave apart, C0 to C10, wrapping at the top.
- **The window on each voice**, a Gaussian in log-frequency (Theory § Stage 4): the **Window** knob is its centre, **Width** its spread in octaves.
- **Each voice's filter follows that voice**: cutoff = **Tone** × the voice's own frequency, sine or band-limited saw.
- **Climb** adds an endless drift in semitones per second: the Risset glissando, under one knob.
- **Break it**: **Drift** gives each voice its own glide time (Stage 3's failure). **Track the note** wires the cutoff from the played note folded into one octave (Stage 4's failure), so the brightness steps once an octave.

Play it: Live → Settings → Plug-Ins → Rescan, then Plug-Ins → Loudon Live → Shepard Tone. Play a chromatic scale upward and keep going; or hold one note and turn Climb.

## The screen

`ui/visualizer.js` draws Shepard's pitch helix as a staircase: ten turns of twelve treads, one tread per semitone. The voices are beads on it, as bright as they are loud. The amber lamp is the window. The camera breathes between the side view, where the stair is finite and the top bead drops to the floor at the wrap (a red seam), and the view from above, where every turn lies on one circle of twelve steps: Escher's Ascending and Descending, which is what the ear hears. Drag up or down on the glass to move the window; drag sideways to turn the stair.

## Files

- `reference/sketch.py`: the sketch the plugin is checked against. `reference/paths.py`: five test paths.
- `src/Algorithm.h`: the port, line for line.
- `ui/visualizer.js`: the screen's picture.
- `demo/`: the plugin's own renders of the five paths (WAVs stay on this Mac), a picture of the editor and its mock page with the feed replayed.
- `./plugin.sh all` rebuilds, verifies, installs, validates and host-checks.

## Checked 2026-11-03

All five paths: the engine matches the sketch to 3.8e-8 to 5.6e-8 of peak, and the real plugin keeps every quarter second's loudness within 0.054 dB. Signatures verified strict; pluginval at strictness 5 and auval pass; the host check hears Window, Climb, Wave and Tone move the sound. `./plugin.sh editor` couldn't photograph the installed editor from this session ("NO PICTURE"); the editor picture in `demo/` is the mock page in Chrome, the same engine and layout.
