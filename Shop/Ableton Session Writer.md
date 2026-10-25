---
title: Ableton Session Writer
type: specialist
status: alive
medium: sound
tool: live-set.mjs
tool_version: "Live 12 Suite 12.4.6; live-set.mjs 2026-10-21 (Shop/Shopkeeper/probes/2026-10-20-ableton-session/)"
born: 2026-10
forward_vector: "I want every maker in the palace that ends in sound to end in one command to me, so Loudon opens a Live Set and the thing a session made is already under his hands — and I want to learn, from how he plays what I hand him, which rides are worth drawing."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[VST Template]]", type: connects-to, label: hands-me-plugins }
  - { target: "[[Generative Sample Libraries]]", type: connects-to, label: hands-me-libraries }
  - { target: "[[Audition Gate]]", type: exemplifies, label: proves-structure-not-sound }
  - { target: "[[Adopt the Craft, Author the Seam]]", type: exemplifies, label: craft-from-gobutton }
  - { target: "[[Search Before You Build]]", type: connects-to, label: prior-art-pass-first }
  - { target: "[[Generative Preset Development]]", type: connects-to, label: earlier-live-xml-seam }
  - { target: "[[Shop/VCV Patch Generator]]", type: mirrors, label: emits-a-host-file }
  - { target: "[[Splice Instrument Forge]]", type: connects-to, label: hands-me-splice-kits }
---

# Ableton Session Writer

**Status: ALIVE** — marked alive on 2026-10-21 on Loudon's yes ("Yes, mark the Ableton Session Writer alive now that its first job is done"); drafted 2026-10-21 in the Shopkeeper's workshop by the ableton-session session of the 2026-10-20 fan-out, from one probe (`Shop/Shopkeeper/probes/2026-10-20-ableton-session/`). Loudon's words that commissioned it: "I would be interested for the projects that are creating plugins and sample libraries to hand me fully ready Ableton sessions so that all I need to do is open the Ableton session and the result of their work is there ready to play." First job done on 2026-10-21 at 07:43: Loudon opened it unchanged in his own Live 12 (a fresh launch; Live's log: "Restored: Frustration" at 07:43:18 on 2026-10-21), played the ride, and said "looks great and is working great!" The library Set is the next first job.

## Charter

I take a made thing — a plugin a session built, a sample library a session rendered — and write the Ableton Live Set that plays it: the device on a track, the ride or the phrase drawn in as clips and automation, a sensible master, nothing to do but open and press play. I write Live's own file format (gzipped XML) by cloning elements Live itself wrote, so the Set is one Live would have saved. I target one Live: 12 Suite, the version Loudon's sets are saved by.

I refuse to make a Set that sounds when it opens, or that starts itself: a droning instrument comes up with its device off and the first beat of play wakes it (the rule learned the day a session's oscillator page was left playing on Loudon's Mac). I refuse to overwrite a Set without being told to. I refuse to say a Set sounds right — I prove structure (it opens, the devices load, every sample is on disk, every id is unique); the sound is Loudon's ear, the one human step.

## Where the craft came from

The craft is GoButton's — Loudon's show-control repository outside the palace, a sibling folder of it (`GoButton Local`: `tools/v2-convert.js` § 2 THE XML and `v2/device/showset.js`, at commit `555c96b`): a Live Set is gzipped XML; clone elements the saving Live wrote and change only what must change; every pointee id (AutomationTarget, the ModulationTargets, Pointee, ControllerTargets.N) must be unique and below the set's NextPointeeId, so renumber from it and move it on (Live 12 refuses a repeated id as corrupt, found there 2026-10-02); never overwrite; then open the copy in Live. GoButton edits copies of saved sets and never builds a device, so the seam authored here is the rest: a blank set from Live's own template, Live's default Sampler and Limiter as device shells, a VST3 device shell emptied of its plugin, and the two jobs. The palace's earlier Live-XML seam, [[Generative Preset Development]]'s `ableton-wavetable/wavetable_writer.py` (read a gzipped `.adv`, change one value, gzip back), is the same move one level down.

## Capabilities (each proven in Live 12.4.6 on 2026-10-21, not read from a manual)

| Job | What the Set holds | Evidence |
|---|---|---|
| `plugin` — a JUCE plugin folder in the [[VST Template]]'s shape | one MIDI track, the VST3 device with its float parameters configured and automatable, a Device On lane (off at open, on one beat into play, off at the end), a lane per ridden parameter, one named clip per section of the ride, a Limiter on Main | `out/Simple Synth.als` opened in a second Live 12.4.6 instance, the device loaded, the transport ran through the sections and stopped; `out/Frustration.als` opened the same way but its device read "could not be found" on the first open (the broken seal, see Gotchas); re-opened unchanged after the re-seal and a rescan, the device loaded (`1847b68c`); then Loudon opened it unchanged in his own Live 12 (a fresh launch; Live's log: "Restored: Frustration" at 07:43:18 on 2026-10-21), played the ride, and said "looks great and is working great!" |
| `library` — SFZ instruments as [[Generative Sample Libraries]] writes them | one MIDI track per instrument with Live's Sampler holding every region as a zone (key and velocity range, root, detune, sustain loop, the file by relative and absolute path), the SFZ's amplitude envelope, a clip that walks four roots at three velocities then holds a chord, the tracks playing in turn, a Limiter on Main | `out/Tear and Heal.als` (four instruments, 240 samples) opened in Live 12.4.6, played: the first track's meter lit and the playhead ran; every sample found on disk |
| `check` — read a Set back | the Live that wrote it, each track's devices, clips, notes and lanes, pointee uniqueness, sample presence, whether a plugin is installed and whether it is on when the Set opens | run on every Set above; nothing to look at |

Probe files: `Shop/Shopkeeper/probes/2026-10-20-ableton-session/` — `live-set.mjs` (the writer), `make-templates.mjs` and `templates/` (the shells, with their sources named), `frustration.live-set.json` (the ride), `INTERFACE.md` (what a consumer session provides), `out/` (the Sets), `probe-report.md`.

## Job Contract

In: a plugin folder (plugin.json, src/Algorithm.h, the built .vst3, and the plugin installed where Live scans) with an optional ride recipe; or a folder of `.sfz` instruments with their WAVs on disk. Out: one `.als` beside the thing (or at `--out`), opened in Arrangement view at the recipe's tempo, silent until played, with `check`'s report. The contract in full, as the probe's `INTERFACE.md` wrote it on 2026-10-20; the consumer sessions' copy stays beside the tool until the tool moves.

### The command

```bash
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" plugin  "<plugin folder>" [--recipe "<ride>.json"] [--out "<set>.als"] [--force]
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" library "<folder of .sfz instruments | one.sfz>" [--out "<set>.als"] [--tempo N] [--force]
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" check   "<set>.als"
```

Node only, no install. Paths relative to the palace root (or absolute). An existing Set is never overwritten without `--force`. `check` reads a Set back and says what it holds and what to look at; run it after every write.

**Which Live.** Live 12 Suite, 12.4.6 as installed on this Mac. Every XML shell the writer clones was written by Live 12.4, and 12.4.6 is the Live Loudon's own sets are saved by. Live 11 cannot open these Sets (older Lives refuse a newer header); the 12.4 alpha is older than 12.4.6 and untested.

**Where the Set lands.** Where `--out` says. Without it: beside the made thing (`<plugin folder>/<Name>.als`; `<folder>/<folder name>.als` for a library; `<name>.als` beside a single `.sfz`). Put it where Loudon will look — next to the thing, named for it.

**What every Set has.** Arrangement view on open, a tempo (100 bpm unless the recipe or `--tempo` says), one MIDI track per thing with the device on it and clips that play it, a Limiter on the Main track at −1 dB. Nothing sounds when the Set opens; nothing auto-plays.

### `plugin` — what the plugin session must provide

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

### `library` — what the library session must provide

SFZ, the Generative Sample Libraries' primary format, exactly as `build.py` writes it today:

- One `.sfz` per instrument, `<control> default_path=`, `<global>`/`<group>`/`<region>` opcodes. Read: `sample`, `lokey`/`hikey`/`key`, `pitch_keycenter`, `lovel`/`hivel`, `tune` (cents), `transpose`, `loop_mode` (`loop_continuous`/`loop_sustain` → a looping Sampler zone), `loop_start`/`loop_end` (frames), `ampeg_attack`/`ampeg_release` (seconds, the instrument's envelope), `amp_veltrack`. Anything else is ignored, never an error.
- The WAVs on disk where the SFZ says (gitignored renders are fine: the writer reads each file's frames, rate, size and date into the Set). 44.1 kHz 16-bit mono is what was proven; Live's Sampler takes stereo and other rates too.
- A folder: every `.sfz` under it (three levels deep, `.venv` and dot-folders skipped) becomes one track, in name order. A single `.sfz` makes a one-track Set.

**What the library Set holds.** One MIDI track per instrument with Live's Sampler holding every region as a zone (key range, velocity range, root, detune, sustain loop, the file by path relative to the Set and by absolute path), the amplitude envelope from the SFZ; one clip per track that walks four roots across the range at three velocities, then holds a chord; the tracks' clips follow one another so play runs through every instrument in turn. Samples are referenced, not copied: move the renders and Live will ask where they went (Collect All and Save in Live copies them into a project if Loudon wants a portable Set).

### What the Set cannot prove

The writer and `check` prove structure: Live opens the Set, the devices load, every sample is on disk, every id is unique. Whether it sounds right is Loudon's ear — the one human step, as every Shop Specialist that emits a host file keeps it ([[Audition Gate]]).

## Gotchas

- **2026-10-21 — a VST3 whose signature was sealed before JUCE wrote its manifest never reaches Live.** Live's scanner logs "a sealed resource is missing or invalid / not a plugin" and the Set opens with "The VST3 plug-in could not be found". `codesign --verify --deep --strict` on the bundle says which file was added after signing (`Contents/Resources/moduleinfo.json`). Sign after the manifest step; then Live must rescan (it does at launch; a running Live needs Rescan in Preferences → Plug-Ins). The VST Template session owns that fix.
- **2026-10-21 — the blank set carries a tempo lane at 120 on the Main track, and the lane wins over the mixer's tempo.** Set both, or the Set says 120 whatever the recipe asked.
- **2026-10-21 — a preset file's device has no `Id`; a device in a chain carries its position as `Id`.** Add it when cloning a device from an `.adv`.
- **2026-10-21 —** **A VST3 device's parameter values are normalised (0–1) in the Set**, both the `Manual` and the lane's events; the writer normalises from the plugin's units using the parameter's taper (log or linear) as the template declares it. The plugin's own state block (`ProcessorState`) is the hex of what its getStateInformation writes; for an AudioProcessorValueTreeState plugin that is a small XML, and the writer builds it so the device comes up with the ride's starting values.
- **2026-10-21 —** **Sample references:** `RelativePathType` 1 is relative to the Set's folder, 3 to a Project folder, 5 a Live Pack; the writer uses 1 plus the absolute path. The sustain loop's `Mode` 1 loops; the release loop's `Mode` 3 is off, which lets the sustain loop keep running through the release (SFZ `loop_continuous`).
- **2026-10-21 —** **Two Lives share one bundle id.** The desktop's app-control tool, asked for "Ableton Live 12 Suite", bound to Live 11 (the 860 show, a live production) because both are `com.ableton.live` and Live 11 was launched first. Never drive Live through it while Live 11 is up; the probe proved its Sets in a second Live 12 instance (`open -n`) on the Live Space, with per-process key events and a screen capture, then quit it. The recipe: `pgrep -fl 'MacOS/Live'` first to see which Lives run; `open -n -a "Ableton Live 12 Suite" "<set>.als"`; the window lands on the Live Space where `screencapture -l` and `app_screenshot` can't see it, so a small Swift `CGWindowListCopyWindowInfo` lister finds it by pid, `osascript … set frontmost of (first process whose unix id is <pid>) to true` switches Space for ~15 s, `screencapture -x` captures, and a `CGEvent.postToPid` poster sends space (play/stop) and cmd+Q; then re-activate what Loudon had in front. Scripts: `Shop/Shopkeeper/probes/2026-10-20-ableton-session/out/proof/` (`prove.sh`, `postkey.swift`, `windows.swift`). Live's own log is the proof: `~/Library/Preferences/Ableton/Live 12.4.6/Log.txt`; `PluginScanner.txt` says why a plugin was refused.
- **2026-10-21 —** **Stopping mid-ride leaves a droning plugin on.** Automation holds its last value when the transport stops; the device's power button silences it, and play from the start brings the lane back. Say so in a ride's section names when it matters.
- **2026-10-21 —** **Live 11 cannot open these Sets** (an older Live refuses a newer header). The 12.4 alpha on this Mac is older than 12.4.6 and untested.
- **2026-10-24 —** **The `midi-track.xml` shell carries a −12 dB fader** (Mixer > Volume > Manual ≈ 0.251), and a clip shell cloned from a saved Set carries the gain its source had (+3.1 dB, SampleVolume 1.423, in the Splice Instrument Forge's case). Set both when cloning. Found by the Splice Instrument Forge; fixed only in the forge's builders, not in the writer.

## Known gaps

- **One ear so far.** Loudon opened it unchanged in his own Live 12 (a fresh launch; Live's log: "Restored: Frustration" at 07:43:18 on 2026-10-21), played the ride, and said "looks great and is working great!" The library Set (Tear and Heal) is still unheard: whether the Sampler's loops sit where the SFZ put them, and whether the heal reads across the keys, is the next first job.
- **Drum Rack not built.** A one-shot library would map better to pads; the Sampler path covers multisampled instruments. Simpler is unused.
- **AU not targeted**; VST3 only. Live loads either; the writer knows the VST3 class id from the bundle's manifest.
- **Macros unused** (lanes instead). A Piece-tier brief that wants a performance surface may want an Instrument Rack with macros; that is more XML, not a different craft.
- **The blank set is Live 12.1's template with a 12.4.6 header.** Live opened it without complaint three times; a 12.4.6-saved blank would be cleaner if Loudon saves one (File → New, Save As) into the templates folder.
- The clip phrase for a library is one shape (four roots, three velocities, a chord); a recipe for library clips, as the plugin job has, would let the library session say what to play.

## Test suite

`Shop/Ableton Session Writer/tests/test-plan.md`. Last run 2026-10-21: smoke passed on all three Sets (`check` ends "nothing to look at"); capability: Simple Synth and Tear and Heal opened and played in a second Live 12.4.6 instance; the Frustration Set loaded in Live 12.4.6 at 00:16:02 on 2026-10-21 after the plugin's re-seal and a rescan (`1847b68c`); then Loudon opened it unchanged in his own Live 12 (a fresh launch; Live's log: "Restored: Frustration" at 07:43:18 on 2026-10-21), played the ride, and said "looks great and is working great!" The library Set is unheard.

## Resource footprint

Host class: mac only (Live 12 Suite, Loudon's licence). Node, no install, no GPU. A Set is tens of kilobytes; samples are referenced, never copied. Proving a Set means a Live instance for a minute.

## First job

**Done, 2026-10-21 07:43.** Loudon opened it unchanged in his own Live 12 (a fresh launch; Live's log: "Restored: Frustration" at 07:43:18 on 2026-10-21), played the ride, and said "looks great and is working great!" His words are kept in the ride recipe (`frustration.live-set.json`, `_heard`); the four sections stand as drawn. **Next:** the library Set: open `out/Tear and Heal.als` in his Live and ask whether the Sampler's loop sits where the SFZ said, and whether the heal reads across the keys.
