---
title: "Frustration from keys — proof, 2026-11-14"
born: 2026-11-14
---

# Frustration from keys

The plan's move after both plugins proved themselves in Live: give Frustration MIDI and modulation that move through its Stretch–Coupling space, because Loudon, playing it on 2026-11-03, "was dying for midi control and LFO's envelopes to move through the 2D space." This proof takes all four parts of that move in one cycle. It has not been played in Live yet.

## What changed

- **Notes set the fundamental** (`plugins/Frustration/src/Algorithm.h`, `reference/sketch.py`). A new **Play** menu, drone or keys. Keys is the default: mono, last note first, Simple Synth's note handling. A note that arrives from silence starts the tone over, as at load, so every phrase starts the same way. Drone is the original, untouched.
- **Two envelopes.** The amplitude envelope (attack, decay, sustain, release, and velocity) is Simple Synth's. The **gesture** envelope rises over *Gesture in* while a note is held and falls over *Gesture out* after it is let go. It carries the point from where Stretch and Coupling rest by *Gesture B* decades of Stretch and *Gesture K* Hz of Coupling. The default, +0.5 decades, takes 1e-5 to 3.2e-5, across the edge (about 1.8e-5 at 40 partials and 6 Hz).
- **The orbit is an LFO in two dimensions.** A sine times *Orbit B* decades on Stretch and a cosine times *Orbit K* Hz on Coupling: a loop around the resting point, which tears and heals as it crosses the line. It runs in both modes, so a drone can orbit too.
- **The path is drawn on the pad** (`machinery/ui/editor.html`). The plugin now sends the moving point as probes named `B` and `K`. Any pad whose two parameters have probes of the same names draws a 2.5 s trail fading behind the live point, over the knob's dot where it rests. It lives in the machinery, so the next plugin with a pad gets it for one line in `kProbes`.
- **The loom follows the sound** (`ui/visualizer.js`). It reads B, K and f0 from the probes, not the knobs. It measures the wobble on the fundamental less the note's pitch, so a new note isn't mistaken for a tear.
- **The window** grew to 1120 × 700 (min 1000 × 640). Seven panels fit in two rows at both sizes (`ui.py fit`).
- **Two machinery fixes found on the way.** The mock's feed rounded probes to six decimal places, which crushed Stretch (1e-5) to a few steps. It now keeps six figures. And headless Chrome photographs a page as it loads, whatever `--timeout` says (0.7 s, measured), so no timer runs. That is why the loom's wobble trace has always looked cut short in these photographs. A fed mock now starts 3.6 s into its phrase and delivers that history at once. Each tick also hands over every frame that real time says is due, and old pads' listeners are dropped at a rebuild.

## What was checked

- `verify.py`, every path from a fresh sketch render: **all gates pass**. The five old paths now pin Play = drone and the orbit at zero, and still match `ride.py` to about 5e-8 of peak where the tone holds. Two new paths are played from keys. **keys-under** (8 s, four notes, both envelopes and the orbit moving, held under the edge) matches the sketch sample for sample over all 8 s, to 5e-8 of peak. **keys-tear** (the default patch on A2, a 5 s note, a gap, a second note from silence) is exact for its first second, and after that its fundamental keeps the sketch's mean and spread, within 0.26 and 0.68 Hz against a 2 Hz gate. In the sketch its wobble climbs from about 0.7 Hz at rest to 3 Hz as the gesture carries the point past the edge, then falls back on release.
- Built, installed, signatures checked, `auval` passed, and the host check passed. The host check's list now moves Play, Gesture B, Amp attack and Orbit rate in place of Pitch, which a keyboard overrides in keys mode. The first run caught that as "NO CHANGE", correctly.
- Simple Synth's mock still draws its stone under the changed shared editor. Its installed build was not rebuilt.

## The pictures and the sound

- `editor-1120x700.png`, `editor-1000x640.png`: the mock in Chrome, 3.6 s into the feed's phrase, inside a held G. The loom says TEARING. `pad-trail.png` is the pad, close: the trail runs from the resting point across the dashed edge.
- `phrase.wav` (20 s, 48 kHz, the real processor on its default patch, made by `phrase.py`): four short notes, a 5 s A2 the gesture carries into the tear and lets settle, three quick notes, then a held low A under the orbit alone. `phrase-route.json` holds B, K, amplitude and wobble every 50 ms.

## Not checked

- **Nobody has heard it, or played it in Live.** I can't listen. Whether the gesture's slide into the tear sounds like a gesture is for Loudon's ears.
- `./plugin.sh editor` still reports "NO PICTURE" for both plugins. Screen capture can't reach a display from this session (as on 2026-10-28), so the pictures are the page in Chrome, not the plugin's WebView.
- **The trail is small on the pad.** The pad spans eight and a half decades of Stretch, and the musical motion lives in about one. A zoomed pad, or a pad that follows the rest point, is a choice for Loudon.
- CPU wasn't re-measured. Per sample the new work is one `pow`, one `sin` and one `cos` beside the 40–96-partial loop.
- Dragging a mouse across the loom, Loudon's open question, isn't touched.
