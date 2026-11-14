---
title: "README"
born: 2026-10-24
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: move-three-of
forward_vector: "I am move three's folder: eight Splice one-shots became a Live Drum Rack, as a preset and as a Set, and I say how, so the next kit is a recipe and one command."
---

# Move three — a Drum Rack from Splice one-shots

**Spoiler Kit**: eight one-shots found with the Splice connector (a tearout kick, a cracking snare, a layered clap, a deep tom, a bright crash, a tight closed hat, an open hat, an 808 in C), each on a pad of Live's Drum Rack, the two hats in one choke group, a four-bar dubstep pattern at 140 in the Set.

## The recipe and the command

`kit.json` names the kit, its tempo, each pad (`note`, `name`, `file`, optional `choke`) and an optional `pattern` of sixteenth-note rows per pad name (`x` hits). Then:

```bash
node forge-drum-rack.mjs build kit.json [--out-dir .] [--force]
node forge-drum-rack.mjs check "Spoiler Kit.als"
```

`build` writes `<name>.adg` (the rack as a Live preset, drag it onto a track) and `<name>.als` (a Set with the rack on one MIDI track, the pattern as a clip, a Limiter on Main, silent until played). `check` reads a Set back: pointee uniqueness, every pad's name, note and choke group, every sample on disk. The Session Writer's own `check` also passes on the Set; it names the device `DrumGroupDevice` without looking inside.

## Where every element came from

- **The rack and a pad preset**: Live 12's `Core Library/Defaults/Slicing/Default.adg`. The `.adg` is that file with its one `DrumBranchPreset` cloned per pad under `BranchPresets`, each given its `ZoneSettings` (receiving note, sending note 60, choke group) and a Simpler.
- **A pad's instrument**: Live 12's default `Simpler.adv`, with one zone from the Session Writer's `sample-part.xml` across the whole key range at root 60, loops off, the sample by relative and absolute path. Simpler rather than Drum Sampler because every factory kit read uses it and Live 11's Sets hold it; Drum Sampler is a one-line swap once a Live 12 Set with one has been read.
- **The in-Set rack**: the same `DrumGroupDevice` element from the `.adg` (its `Branches` is empty in a preset) filled with `DrumBranch` elements. The branch shell is from the first Spoiler Kit Set saved back by Live 12.4.6 (`Spoiler Kit V12 Project/`, kept at `../format-study/xml/Live12 DrumBranch shell.xml`), its Simpler removed and its mixer's preset reference blanked. The first build used a Live 11 shell; Live 12 loaded it and saved it back with three extra housekeeping fields, nothing more. A `DrumBranch` differs from a `DrumBranchPreset`: the name is a `Name` block (EffectiveName, UserName…), the device sits in `DeviceChain > MidiToAudioDeviceChain > Devices`, the mixer is a `MixerDevice` not a `MixerPreset`, and the pad notes are `BranchInfo`, not `ZoneSettings`.
- **Set, track, clip, Limiter**: the Session Writer's templates, with its XML craft (nesting-aware `element`, `renumber` from `NextPointeeId`) copied in so this stays one file.

## What this move taught (for the format study)

- **A pad's `ReceivingNote` is stored as 128 minus the MIDI note.** The first build wrote 36–46 and the pads came up around G#5–D5 while the clip sat in the C1 octave; Loudon heard it. The builder now inverts on write and `check` prints the MIDI note with the stored number beside it.

- A preset's `BranchPresets/DrumBranchPreset` becomes `Branches/DrumBranch` in a Set, with the field renames above. Live does that conversion on load; the writer does it on write.
- A cloned branch shell carries the saving user's `LastPresetRef` paths. Blank every `LastPresetRef` in anything cloned, device or mixer, or `check` will chase a stranger's desktop.
- `OverwriteProtectionNumber` 2819 (Live 11) inside a 12.4.6 Set: Live 12 did not mind; it loaded the Set and saved it back as its own.

## Velocity layers and accents (2026-11-14)

A pad may carry `layers` instead of `file`: `[{ "file", "uuid", "vel": [1, 80] }, { "file", "uuid", "vel": [81, 127] }]`. Such a pad is Live's default **Sampler** (`MultiSampler`, from `Core Library/Defaults/Instruments/Sampler.adv`) with one zone per layer, its `VelocityRange` set and crossfades off; a one-sample pad stays Simpler, because Simpler holds one sample. Both keep zones under `Player > MultiSampleMap > SampleParts`, so the zone shell is the same. Sampler's default `VolumeVelScale` is 0 (velocity does not change level) where Simpler's is 0.35; a layered pad is set to 0.35 so it matches its neighbours. Pattern steps now read `X` accent 127, `x` hit 100, `o` ghost 50; the old all-`x` recipes build as before. `check` prints each layered pad's ranges and flags a gap or overlap. `kit-layered.json` (**Spoiler Kit Layered**) is the first: a ghost snare and a soft closed hat under the originals, ghost notes in the snare and hat rows. `sketch-render.py` bounces a recipe's pattern roughly (no envelopes, no Live voicing) so the groove can be heard before a Live is free to open the Set.

## Known limits

- Pan is not set per pad (the mixer shell's default); level is, by the per-drum rule.
- The pattern is sixteenths only, 4/4.
- Pads are Simpler in Classic mode as the factory kits are; a Drum Sampler pad is the smaller, more idiomatic Live 12 choice and the next thing to prove.
