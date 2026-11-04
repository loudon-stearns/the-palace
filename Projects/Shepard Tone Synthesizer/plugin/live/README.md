# The play-through

The plan's first move is Loudon's hands and ears on Shepard Tone. This folder makes that one click.

**Open `Shepard Tone play-through.als` in Live 12 and press play.** The plugin must be installed and scanned (it is: `./plugin.sh install`, then Live → Settings → Plug-Ins → Rescan if Live was already open). Nothing sounds until play; the device turns itself on one beat in. Six sections, 65 bars at 100 bpm, about 2½ minutes, each clip named for what to listen for:

1. **Twelve keys, round and round.** C to B four times, no glide. The keys fall back to C three times; the ear keeps climbing. Shepard's 1964 tones.
2. **Hold one note, turn Climb up then down.** The endless glissando, both ways.
3. **Break it, the first way.** A scale up the keys with the glide on and Drift rising: the octaves stop agreeing, up to 80 cents, and the stack beats.
4. **Break it, the second way.** Track the note on: the brightness drops once an octave.
5. **Mend it.** Track the note off: the steps smooth away.
6. **Move the window.** The same climb, lit low, then high, then low.

Every knob that moves is on an automation lane, so you can grab it and the lane lets go. Stop mid-ride and the plugin holds its last values; play from the start and the lanes take over.

`play-through-preview.wav` is the same ride through the plugin's own processBlock (the harness), for hearing it before Live opens; `play-through-ride.png` draws the keys played, the loudness and the brightness over it. Measured on that render: loudness steady to 0.26 dB through the twelve keys' three fall-backs; 0 cents between the audible octaves everywhere but the Drift section (79.5); brightness steps of up to 0.54 octave with Track the note on, 0.04 off.

**Drift does nothing to Climb.** Climb is added after the glide in `src/Algorithm.h`, so a held note on Climb never drifts; the break shows only on a climb played on the keys. That is why section 3 plays a scale.

Remake both: `python3 live/play-through.py` (`--set`, `--preview` for one). The Set is written by the Shopkeeper's `live-set.mjs`; the script hands it a copy of the parameter table with Wave and Track the note called linear 0–1 so they can be ridden, and rewrites the two scale sections' notes afterwards.
