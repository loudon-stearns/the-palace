---
title: "Own shells — README"
born: 2026-10-26
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: workshop-of
forward_vector: "I am where the forge's own shells come from: every element a builder clones, taken from the files Ableton ships inside Live, with nobody's saved Set in between."
---

# Own shells

The forge used to clone its tracks, clips and drum pads from Sets that someone had saved, and each of those Sets carried its own history into every new Set. Now the shells come from the files Ableton ships inside Live 12 Suite 12.4.6, written by Ableton's own build (`Creator="Ableton Live 12.4d1"`).

| shell | taken from (inside `Live 12 Suite.app/Contents/App-Resources/`) | read by |
|---|---|---|
| `AudioTrack.xml` | `Core Library/Defaults/Creating Tracks/Audio Track/Default Audio Track.als` | stack builder |
| `MidiTrack.xml` | `Core Library/Defaults/Creating Tracks/MIDI Track/Default MIDI Track.als` | kit builder |
| `AudioClip.xml` | `Core Library/Ableton Folder Info/Sample Reference.als`, its first clip | stack builder |
| `MidiClip.xml` | `Core Library/Templates/Quick Start Beat.als`, its first clip, notes taken out | kit builder |
| `DrumBranch.xml` | `Core Library/Templates/Quick Start Beat.als`, its first pad: device, sends and sidechain output taken out | kit builder |

```bash
node harvest.mjs        # write shells/ and PROVENANCE.json from the Live app
node audit.mjs          # every value the old shells differed from Ableton's, shell by shell (audit.json)
node audit.mjs --own    # the same for the harvested shells: only the deliberate holes should show
```

Run both again after a Live update: `audit --own` then shows what Ableton changed.

## What the audit found in the old shells

- **Audio clip** (from Loudon's `Impact Granular.als`): a fade-out 0.44 beats long with a shaped curve, clip fades switched off (`Fade` false), `IsInKey` true. Every clip in the melodic techno Set carried all three, 100 clips of them, and so did the 21 in Flowers Stack. The +3.1 dB gain heard on 2026-10-24 came the same way.
- **MIDI track** (the Session Writer's `midi-track.xml`): −12 dB on the fader (already caught) and **armed for recording** (`IsArmed` true). Every kit track came in armed.
- **Audio track** (12.1 DefaultLiveSet): ten values that Live 12.4 writes and 12.1 didn't (`MpePitchBendUsesTuning`, `IsTuned`, a crossfader range). Live opened every Set built on it without complaint.
- **Drum pad** (from the Spoiler Kit Set Loudon saved back): small differences only. The pad was Live-written, but it came from his save, so it is replaced too.
- **The Set itself** (`blank-set.als`) matches Ableton's DefaultLiveSet value for value outside its tracks (the tracks are the shells above), so it stays.

## Proved 2026-10-26

- `proof/Flowers Stack.als`: the Flowers Stack recipe rebuilt on the new audio track and clip. `check` is clean (222 pointees, all unique, 42 clips at 0 dB), and it loaded in a second Live 12.4.6 at 10:11:51 with no warning.
- `proof/lofi-kit/Dusty Eighty-Five.als` and `.adg`: a new lo-fi kit at 85 (eight Splice one-shots, eight credits), built on the new MIDI track, MIDI clip and pad. `check` is clean (1837 pointees, all unique, macros bare, hats choked). It loaded at 10:19:19 with no warning.

## The Sampler path, moved 2026-10-26

`forge.mjs build` for an instrument still lets the Session Writer's `library` job lay the Sampler's zones, then `../forge/rehouse.mjs` lifts the Sampler and its clip off the writer's track and sets them on `shells/MidiTrack.xml`, carrying every clip slot list across. The first try carried only the main sequencer's list; Live called the Set corrupt ("Slot count mismatch"), because the freeze sequencer's list must hold one slot per scene as well. rehouse now refuses any list that doesn't. `Astromode Analog.als`, rebuilt that way with its three samples fetched again, loaded in Live 12.4.6 at 10:31:13 with no warning, unarmed, at −8 dB. Every Set the forge builds now stands on Ableton's own MIDI or audio track.
