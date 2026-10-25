---
title: "README"
born: 2026-10-24
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: workshop-of
forward_vector: "I am the forge's workshop front door — where the format study, the scripts and the proofs live, and the first thing a worker reads before cloning an element of Live's XML."
---

# Splice Instrument Forge — workshop

The making files. Nothing here is canon; the entry and the scroll are.

## What the prior art taught (read 2026-10-24)

**Live's files.** `.als`, `.adv` and `.adg` are gzip (magic `1f 8b`) around XML. Root `<Ableton MajorVersion="5" MinorVersion="12.0_…" Creator="Ableton Live 12.x">`. Times are in beats. Edit as text; gzip back. Live saves over the file it opened, so never edit a Set Live has open.

**Pointee ids** (GoButton `tools/v2-convert.js:213-223, 303-314`). Every `AutomationTarget`, `*ModulationTarget`, `Pointee` and `ControllerTargets.N` id must be unique in the set. New ones start at the set's `NextPointeeId`; write the advanced value back. Live 12 refuses a repeat as "corrupt (non-unique Pointee IDs)". Track ids are max+1 across Midi, Audio, Group and Return tracks. `LomId` 0 lets Live assign one. Cloning renumbers targets but not `<AutomationEnvelopes>`, whose `PointeeId` still points at the template: empty them, and a clip's `<Envelopes>`, before editing.

**Clone, don't author.** Every element comes from a file the target Live saved. Change only names, ids, values and references. Escape names for XML. A device in a chain carries its position as `Id`; a preset file's device has none, so add it.

**Sample references.** `SampleRef > FileRef` holds `RelativePathType`, `RelativePath`, `Path`, `Type=2`, `LivePackName`, `LivePackId`, `OriginalFileSize`, `OriginalCrc`, `SourceHint`, then `LastModDate`, `DefaultDuration` (samples), `DefaultSampleRate`. `RelativePathType` 1 is relative to the Set's folder, 3 to a Project folder, 5 a Live Pack. The writer uses 1 plus the absolute path. Sustain loop `Mode` 1 loops; release loop `Mode` 3 is off.

**Session View.** The first Session View XML found was GoButton's (later Sets turned up with session clips, take lanes in GoButton's Clock Test.als, and Loudon's own Live 12 saves; the format study cites them): GoButton's `v2/timecode/reference/generator/ltc-generator.js:325-629`: `ClipSlotList/ClipSlot` holding a clip, empty slots, `MainTrack`, `<Scenes><Scene Id="0">` with `FollowAction`, `ScenesListWrapper`. The writer's `midi-track.xml` keeps one `ClipSlot` and repeats it per scene.

**Shells to clone.** `<Live 12 Suite.app>/Contents/App-Resources/Core Library/Defaults/Instruments/{Sampler,Simpler,Drum Sampler}.adv`; factory Drum Racks under `Core Library/Racks/Drum Racks/` and Slicing defaults under `Core Library/Defaults/Slicing/*.adg`. The Session Writer's templates (`Shop/Shopkeeper/probes/2026-10-20-ableton-session/templates/`) already hold `blank-set.als`, `Sampler.adv`, `Limiter.adv`, `midi-track.xml`, `midi-clip.xml`, `sample-part.xml`.

**Proving.** Two Lives share one bundle id; open a Set in a second Live 12 with `open -n`, never through the desktop control tool while Live 11 is up. Live's log is the proof: `~/Library/Preferences/Ableton/Live 12.4.6/Log.txt`. The writer's `check` reads a Set back.

**The extensions SDK** (beta, NDA) exposes tracks, clip slots, devices, rack chains with `receivingNote`, and Simpler `replaceSample`. No Sampler class, no parameters, no save. Prototype-only.

**Splice connector.** Search returns BPM, key (bare letter, no mode), duration, tags, pack, Splice link and asset UUID; filters are tempo range and loop vs one-shot; genre and key ride in the query text and are post-filtered. Stacks hold up to 8 layers. A download spends one credit the first time; see the scroll's Standing Orders.
