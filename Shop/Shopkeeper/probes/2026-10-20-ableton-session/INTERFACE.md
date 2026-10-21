# live-set.mjs — the interface for the sessions that make things

A made thing in, an Ableton Live Set out: Loudon opens it and presses play. Written 2026-10-20 in the Shopkeeper's workshop; it becomes the Ableton Session Writer's job contract when that Specialist is minted (`Shop/Shopkeeper/drafts/Ableton Session Writer — draft.md`).

## The command

```bash
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" plugin  "<plugin folder>" [--recipe "<ride>.json"] [--out "<set>.als"] [--force]
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" library "<folder of .sfz instruments | one.sfz>" [--out "<set>.als"] [--tempo N] [--force]
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" check   "<set>.als"
```

Node only, no install. Paths relative to the palace root (or absolute). An existing Set is never overwritten without `--force`. `check` reads a Set back and says what it holds and what to look at; run it after every write.

**Which Live.** Live 12 Suite, 12.4.6 as installed on this Mac. Every XML shell the writer clones was written by Live 12.4, and 12.4.6 is the Live Loudon's own sets are saved by. Live 11 cannot open these Sets (older Lives refuse a newer header); the 12.4 alpha is older than 12.4.6 and untested.

**Where the Set lands.** Where `--out` says. Without it: beside the made thing (`<plugin folder>/<Name>.als`; `<folder>/<folder name>.als` for a library; `<name>.als` beside a single `.sfz`). Put it where Loudon will look — next to the thing, named for it.

**What every Set has.** Arrangement view on open, a tempo (100 bpm unless the recipe or `--tempo` says), one MIDI track per thing with the device on it and clips that play it, a Limiter on the Main track at −1 dB. Nothing sounds when the Set opens; nothing auto-plays.

## `plugin` — what the plugin session must provide

A folder in the VST Template's shape (that is what the writer reads; the next plugin from the template is one command):

- `plugin.json` with `name`, `target`, `manufacturer_code`, `plugin_code`, `kind`.
- `src/Algorithm.h` with the `kParams[]` table (`{ "id", "Name", "unit", min, max, default, Taper::X, … }`): the writer reads the float parameters (Linear and Log) from it, names them on the device, and knows how to normalise a value.
- The built VST3 at `build/<target>_artefacts/Release/VST3/<Name>.vst3` (its `moduleinfo.json` carries the class id; without a build the writer derives the id from the codes with JUCE's formula, which only holds for `JUCE_VST3_CAN_REPLACE_VST2=0`).
- **The plugin installed** in `~/Library/Audio/Plug-Ins/VST3/` (`./plugin.sh install`) before Loudon opens the Set, and a Live that has scanned it (Live scans at launch; a running Live needs Rescan in Preferences → Plug-Ins). The writer warns when it is not there.
- Optionally a **ride**: `live-set.json` beside `plugin.json`, or `--recipe`. Without one the Set sweeps the first two parameters once each and rests at the defaults — it plays, but says nothing about the instrument. Write the ride; it is the part that makes the Set worth opening. Format (the Frustration one is `frustration.live-set.json` beside the writer):

```json
{
  "tempo": 100,
  "configure": ["B", "K", "level"],
  "silentOnOpen": true,
  "set": { "pinned": 1 },
  "sections": [
    { "name": "Hold",   "bars": 8, "B": 1.2e-5, "K": 6 },
    { "name": "Ride",   "bars": 8, "B": 2.2e-5, "K": [2, 18, 2] },
    { "name": "Strike", "bars": 8, "B": { "repeat": 4, "points": [[0, 1e-5], [0, 3e-4], [0.4, 1e-5]] } }
  ]
}
```

`configure` names the parameters shown on the device in Live (automatable there); `sections` are played in order, each so many bars; a parameter in a section is a number (held), a list (evenly spaced breakpoints across the section, straight lines between — on a Log parameter that is a sweep that sounds even), or `{repeat, points}` (a pattern of `[beat, value]` pairs repeated that many times across the section; two points at the same beat make a jump). Values are in the plugin's units. `set` gives starting values for parameters that are not ridden; the plugin's state on load carries every parameter's starting value, so the device comes up as the ride begins. `silentOnOpen` (default true) keeps the device off until one beat into play and off again at the end — a droning instrument otherwise sounds the moment Live loads it.

**What the plugin Set holds.** One MIDI track named for the plugin: the VST3 device with the configured parameters, automation lanes for Device On and every ridden parameter, one arrangement clip per section named for it (with a single held note, in case the plugin listens). Mapping is by automation lane, not macro: a lane is kept by Live exactly as written and reads at a glance; a macro would mean a rack, more XML, and nothing the lane does not give.

**Something to know.** A droning plugin stays on if Loudon stops the transport mid-ride: automation holds its last value when stopped. The device's power button silences it; play again from the start and the lane takes over. The Set says so in its first clip's name only if the ride does — say it in the ride's section names if it matters.

## `library` — what the library session must provide

SFZ, the Generative Sample Libraries' primary format, exactly as `build.py` writes it today:

- One `.sfz` per instrument, `<control> default_path=`, `<global>`/`<group>`/`<region>` opcodes. Read: `sample`, `lokey`/`hikey`/`key`, `pitch_keycenter`, `lovel`/`hivel`, `tune` (cents), `transpose`, `loop_mode` (`loop_continuous`/`loop_sustain` → a looping Sampler zone), `loop_start`/`loop_end` (frames), `ampeg_attack`/`ampeg_release` (seconds, the instrument's envelope), `amp_veltrack`. Anything else is ignored, never an error.
- The WAVs on disk where the SFZ says (gitignored renders are fine: the writer reads each file's frames, rate, size and date into the Set). 44.1 kHz 16-bit mono is what was proven; Live's Sampler takes stereo and other rates too.
- A folder: every `.sfz` under it (three levels deep, `.venv` and dot-folders skipped) becomes one track, in name order. A single `.sfz` makes a one-track Set.

**What the library Set holds.** One MIDI track per instrument with Live's Sampler holding every region as a zone (key range, velocity range, root, detune, sustain loop, the file by path relative to the Set and by absolute path), the amplitude envelope from the SFZ; one clip per track that walks four roots across the range at three velocities, then holds a chord; the tracks' clips follow one another so play runs through every instrument in turn. Samples are referenced, not copied: move the renders and Live will ask where they went (Collect All and Save in Live copies them into a project if Loudon wants a portable Set).

## What the Set cannot prove

The writer and `check` prove structure: Live opens the Set, the devices load, every sample is on disk, every id is unique. Whether it sounds right is Loudon's ear — the one human step, as every Shop Specialist that emits a host file keeps it ([[Audition Gate]]).
