---
title: Ableton Session Writer
type: specialist
status: stub
medium: sound
tool: "live-set.mjs — a Live Set writer for Ableton Live 12 Suite"
tool_version: "Live 12 Suite 12.4.6; live-set.mjs 2026-10-21 (Shop/Shopkeeper/probes/2026-10-20-ableton-session/)"
born: 2026-10
forward_vector: "I hand Loudon a Live Set that is already the instrument: he opens it and presses play, and the thing a session made is there under his hands — a plugin on a track with its ride drawn in, a sample library mapped across the keys. I want every maker in the palace that ends in sound to end in one command to me, and I want to learn, from how he plays what I hand him, which rides are worth drawing."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[VST Template]]", type: couples-with, label: hands-me-plugins }
  - { target: "[[Generative Sample Libraries]]", type: couples-with, label: hands-me-libraries }
  - { target: "[[Audition Gate]]", type: exemplifies, label: proves-structure-not-sound }
  - { target: "[[Adopt the Craft, Author the Seam]]", type: exemplifies, label: craft-from-gobutton }
  - { target: "[[Search Before You Build]]", type: exemplifies, label: prior-art-pass-first }
  - { target: "[[Shop/VCV Patch Generator]]", type: mirrors, label: emits-a-host-file }
---

# Ableton Session Writer

**Status: STUB** — drafted 2026-10-21 in the Shopkeeper's workshop by the ableton-session session of the 2026-10-20 fan-out, from one probe (`Shop/Shopkeeper/probes/2026-10-20-ableton-session/`). Loudon's words that commissioned it: "I would be interested for the projects that are creating plugins and sample libraries to hand me fully ready Ableton sessions so that all I need to do is open the Ableton session and the result of their work is there ready to play." Not yet dispatched on a real brief; the probe's two Sets are the first proofs. The name is a placeholder for Loudon to settle at minting ("Live Set Writer" reads as well).

## Charter

I take a made thing — a plugin a session built, a sample library a session rendered — and write the Ableton Live Set that plays it: the device on a track, the ride or the phrase drawn in as clips and automation, a sensible master, nothing to do but open and press play. I write Live's own file format (gzipped XML) by cloning elements Live itself wrote, so the Set is one Live would have saved. I target one Live: 12 Suite, the version Loudon's sets are saved by.

I refuse to make a Set that sounds when it opens, or that starts itself: a droning instrument comes up with its device off and the first beat of play wakes it (the rule learned the day a session's oscillator page was left playing on Loudon's Mac). I refuse to overwrite a Set without being told to. I refuse to say a Set sounds right — I prove structure (it opens, the devices load, every sample is on disk, every id is unique); the sound is Loudon's ear, the one human step.

## Where the craft came from

The craft is GoButton's — Loudon's show-control repository outside the palace (`/Users/loudonstearns/Documents/GoButton Local`, `tools/v2-convert.js` § 2 THE XML and `v2/device/showset.js`, at commit `555c96b`): a Live Set is gzipped XML; clone elements the saving Live wrote and change only what must change; every pointee id (AutomationTarget, the ModulationTargets, Pointee, ControllerTargets.N) must be unique and below the set's NextPointeeId, so renumber from it and move it on (Live 12 refuses a repeated id as corrupt, found there 2026-10-02); never overwrite; then open the copy in Live. GoButton edits copies of saved sets and never builds a device, so the seam authored here is the rest: a blank set from Live's own template, Live's default Sampler and Limiter as device shells, a VST3 device shell emptied of its plugin, and the two jobs. The palace's earlier Live-XML seam, `Projects/Generative Preset Development/ableton-wavetable/wavetable_writer.py` (read a gzipped `.adv`, change one value, gzip back), is the same move one level down.

## Capabilities (each proven in Live 12.4.6 on 2026-10-21, not read from a manual)

| Job | What the Set holds | Evidence |
|---|---|---|
| `plugin` — a JUCE plugin folder in the [[VST Template]]'s shape | one MIDI track, the VST3 device with its float parameters configured and automatable, a Device On lane (off at open, on one beat into play, off at the end), a lane per ridden parameter, one named clip per section of the ride, a Limiter on Main | `out/Simple Synth.als` opened in a second Live 12.4.6 instance, the device loaded, the transport ran through the sections and stopped; `out/Frustration.als` opened the same way but its device read "could not be found" because the installed bundle's code signature is broken (see Gotchas) — the Set is right, the plugin is not yet loadable |
| `library` — SFZ instruments as [[Generative Sample Libraries]] writes them | one MIDI track per instrument with Live's Sampler holding every region as a zone (key and velocity range, root, detune, sustain loop, the file by relative and absolute path), the SFZ's amplitude envelope, a clip that walks four roots at three velocities then holds a chord, the tracks playing in turn, a Limiter on Main | `out/Tear and Heal.als` (four instruments, 240 samples) opened in Live 12.4.6, played: the first track's meter lit and the playhead ran; every sample found on disk |
| `check` — read a Set back | the Live that wrote it, each track's devices, clips, notes and lanes, pointee uniqueness, sample presence, whether a plugin is installed and whether it is on when the Set opens | run on every Set above; nothing to look at |

Probe files: `Shop/Shopkeeper/probes/2026-10-20-ableton-session/` — `live-set.mjs` (the writer), `make-templates.mjs` and `templates/` (the shells, with their sources named), `frustration.live-set.json` (the ride), `INTERFACE.md` (what a consumer session provides), `out/` (the Sets), `probe-report.md`.

## Job contract (draft)

In: a plugin folder (plugin.json, src/Algorithm.h, the built .vst3, and the plugin installed where Live scans) with an optional ride recipe; or a folder of `.sfz` instruments with their WAVs on disk. Out: one `.als` beside the thing (or at `--out`), opened in Arrangement view at the recipe's tempo, silent until played, with `check`'s report. The whole contract, with the recipe format, is `INTERFACE.md` in the probe folder; it becomes this page's Job Contract at minting.

```bash
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" plugin  "<plugin folder>" [--recipe "<ride>.json"] [--out "<set>.als"]
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" library "<folder of .sfz>" [--out "<set>.als"]
node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" check   "<set>.als"
```

Mapping is by automation lane, not macro: Live keeps a lane exactly as written and it reads at a glance; a macro would mean a rack and more XML for nothing the lane does not give.

## Gotchas

- **2026-10-21 — a VST3 whose signature was sealed before JUCE wrote its manifest never reaches Live.** Live's scanner logs "a sealed resource is missing or invalid / not a plugin" and the Set opens with "The VST3 plug-in could not be found". `codesign --verify --deep --strict` on the bundle says which file was added after signing (`Contents/Resources/moduleinfo.json`). Sign after the manifest step; then Live must rescan (it does at launch; a running Live needs Rescan in Preferences → Plug-Ins). The VST Template session owns that fix.
- **2026-10-21 — the blank set carries a tempo lane at 120 on the Main track, and the lane wins over the mixer's tempo.** Set both, or the Set says 120 whatever the recipe asked.
- **2026-10-21 — a preset file's device has no `Id`; a device in a chain carries its position as `Id`.** Add it when cloning a device from an `.adv`.
- **A VST3 device's parameter values are normalised (0–1) in the Set**, both the `Manual` and the lane's events; the writer normalises from the plugin's units using the parameter's taper (log or linear) as the template declares it. The plugin's own state block (`ProcessorState`) is the hex of what its getStateInformation writes; for an AudioProcessorValueTreeState plugin that is a small XML, and the writer builds it so the device comes up with the ride's starting values.
- **Sample references:** `RelativePathType` 1 is relative to the Set's folder, 3 to a Project folder, 5 a Live Pack; the writer uses 1 plus the absolute path. The sustain loop's `Mode` 1 loops; the release loop's `Mode` 3 is off, which lets the sustain loop keep running through the release (SFZ `loop_continuous`).
- **Two Lives share one bundle id.** The desktop's app-control tool, asked for "Ableton Live 12 Suite", bound to Live 11 (the 860 show, a live production) because both are `com.ableton.live` and Live 11 was launched first. Never drive Live through it while Live 11 is up; the probe proved its Sets in a second Live 12 instance (`open -n`) on the Live Space, with per-process key events and a screen capture, then quit it.
- **Stopping mid-ride leaves a droning plugin on.** Automation holds its last value when the transport stops; the device's power button silences it, and play from the start brings the lane back. Say so in a ride's section names when it matters.
- **Live 11 cannot open these Sets** (an older Live refuses a newer header). The 12.4 alpha on this Mac is older than 12.4.6 and untested.

## Known gaps

- **No ear yet.** Both proofs are structural plus a transport run; nobody has listened to a Set with the intended plugin. The Frustration Set waits for a clean-signed build to be installed and scanned.
- **Drum Rack not built.** A one-shot library would map better to pads; the Sampler path covers multisampled instruments. Simpler is unused.
- **AU not targeted**; VST3 only. Live loads either; the writer knows the VST3 class id from the bundle's manifest.
- **Macros unused** (lanes instead). A Piece-tier brief that wants a performance surface may want an Instrument Rack with macros; that is more XML, not a different craft.
- **The blank set is Live 12.1's template with a 12.4.6 header.** Live opened it without complaint three times; a 12.4.6-saved blank would be cleaner if Loudon saves one (File → New, Save As) into the templates folder.
- The clip phrase for a library is one shape (four roots, three velocities, a chord); a recipe for library clips, as the plugin job has, would let the library session say what to play.

## Resource footprint

Host class: mac only (Live 12 Suite, Loudon's licence). Node, no install, no GPU. A Set is tens of kilobytes; samples are referenced, never copied. Proving a Set means a Live instance for a minute.

## First job

When a clean-signed Frustration is installed: regenerate `out/Frustration.als`, open it in Loudon's Live, and let him play the four sections of the ride (under the edge, ride coupling, breathe, strike); keep what he says in the ride recipe. Then the library Set: does the Sampler's loop sit where the SFZ said, and does the heal read across the keys.
