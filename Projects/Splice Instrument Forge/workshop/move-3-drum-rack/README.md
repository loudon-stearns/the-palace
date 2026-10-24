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
- **The in-Set rack**: the same `DrumGroupDevice` element from the `.adg` (its `Branches` is empty in a preset) filled with `DrumBranch` elements. **No Live 12 Set with a Drum Rack was on this Mac**, so the branch shell is from a Set Live 11.3.43 saved (GoButton's `860_JULY26.als`, kept at `../format-study/xml/Live11 DrumBranch shell.xml`), its Simpler removed and its mixer's stale preset reference blanked. A `DrumBranch` differs from a `DrumBranchPreset`: the name is a `Name` block (EffectiveName, UserName…), the device sits in `DeviceChain > MidiToAudioDeviceChain > Devices`, the mixer is a `MixerDevice` not a `MixerPreset`, and the pad notes are `BranchInfo`, not `ZoneSettings`.
- **Set, track, clip, Limiter**: the Session Writer's templates, with its XML craft (nesting-aware `element`, `renumber` from `NextPointeeId`) copied in so this stays one file.

## What this move taught (for the format study)

- A preset's `BranchPresets/DrumBranchPreset` becomes `Branches/DrumBranch` in a Set, with the field renames above. Live does that conversion on load; the writer does it on write.
- A cloned branch shell carries the saving user's `LastPresetRef` paths. Blank every `LastPresetRef` in anything cloned, device or mixer, or `check` will chase a stranger's desktop.
- `OverwriteProtectionNumber` 2819 (Live 11) inside a 12.4.6 Set: whether Live 12 minds is what opening this Set proves.

## Known limits

- One velocity layer per pad; no pad-level volume or pan set (the mixer shell's defaults).
- The pattern is sixteenths only, 4/4, fixed velocity 100.
- Pads are Simpler in Classic mode as the factory kits are; a Drum Sampler pad is the smaller, more idiomatic Live 12 choice and the next thing to prove.
