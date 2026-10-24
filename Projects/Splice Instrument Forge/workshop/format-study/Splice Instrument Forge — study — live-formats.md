---
title: "Splice Instrument Forge — study — live-formats"
born: 2026-10-24
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: format-study-of
  - target: "[[Ableton Session Writer]]"
    type: connects-to
    label: extends-its-templates
forward_vector: "I am the forge's map of Live 12's preset files — Sampler, Simpler, Drum Sampler and Drum Rack — read from the shells Live ships, so a worker can name what must change to put a Splice sample into each before writing a line of the writer."
---

# Live 12 preset formats — the forge's study

Move one of the plan. Read from Live 12 Suite 12.4.6's own files on 2026-10-24: `Core Library/Defaults/Instruments/{Sampler,Simpler,Drum Sampler}.adv`, `Core Library/Defaults/Slicing/Default.adg`, and `Core Library/Racks/Drum Racks/Sampled/Akustichord Kit.adg`. Decompressed copies and depth-limited outlines sit beside this file in `xml/` and `outline — *.txt`; `outline.py` made them. Everything below is read from those files, not from a manual. Where a thing is unverified it says so.

## The common shell

Every file is gzip around UTF-8 XML. Root:

```xml
<Ableton MajorVersion="5" MinorVersion="12.0_12402" SchemaChangeCount="1" Creator="Ableton Live 12.4d1" Revision="…">
```

A `.adv` holds one device element directly under the root. A `.adg` holds a `GroupDevicePreset`. Every device, whatever its kind, opens with the same twenty-odd housekeeping children: `LomId`, `LomIdView`, `IsExpanded`, `On` (a bool parameter), `ModulationSourceCount`, `ParametersListWrapper`, `Pointee`, `LastPresetRef`, `LockedScripts`, `IsFolded`, `ShouldShowPresetName`, `UserName`, `Annotation`, `SourceContext`, `MpePitchBendUsesTuning`, `ViewData`, `OverwriteProtectionNumber`. The instrument's own parameters follow.

A **parameter** is one shape everywhere: `<X><LomId/><Manual Value="…"/><MidiControllerRange><Min/><Max/></MidiControllerRange><AutomationTarget Id="…"><LockEnvelope/></AutomationTarget><ModulationTarget Id="…">…</ModulationTarget></X>`. Bools swap `MidiControllerRange` for `MidiCCOnOffThresholds` and have no `ModulationTarget`. `Manual` is the value to change.

**Pointee ids in a preset file are all zero.** Every `AutomationTarget`, `ModulationTarget` and `Pointee` in all five files carries `Id="0"`; there is no `NextPointeeId`. Live assigns ids when it loads a preset. So a preset can be written with zeros, and the renumbering discipline applies the moment a device is placed in a Set, where the writer's `renumber` already does it from the Set's `NextPointeeId` (GoButton's rule; the writer's `live-set.mjs:76`).

## Sampler — `MultiSampler`

Default file: 34 KB, 81 automation targets, `SampleParts` empty. Tree, to the parts that matter:

```
MultiSampler
  Player
    MultiSampleMap
      SampleParts            ← zones go here, one MultiSamplePart each
      LoadInRam, LayerCrossfade, RoundRobin…
    LoopModulators (SampleStart, SampleLength, LoopOn, LoopLength, LoopFade)
    Reverse, Snap, SampleSelector, SubOsc, InterpolationMode
  Pitch · Filter · Shaper · VolumeAndPan (the amp Envelope) · AuxEnv · Lfo · AuxLfos.0/1
  KeyDst · VelDst · RelVelDst · MidiCtrl.0–5 · Globals · ViewSettings
```

**To put a sample in:** append a `MultiSamplePart` under `SampleParts`. The writer already does this from its `sample-part.xml` shell (`live-set.mjs:235-273`): set `Name`, `KeyRange`, `VelocityRange` (Min/Max/CrossfadeMin/CrossfadeMax), `RootKey`, `Detune`, `SampleStart`/`SampleEnd` (frames), `SustainLoop` (`Mode` 1 loops, 0 off), `ReleaseLoop` (`Mode` 3 off), and the `SampleRef`. Parts are numbered `Id="0"…` in order. The amp envelope is the first `Envelope` under `VolumeAndPan`; `AttackTime`/`ReleaseTime` are its parameters.

Nothing new is needed for move two. A one-shot Sampler is the writer's `library` path with zones made from pitch detection instead of SFZ.

## Simpler — `OriginalSimpler`

Default file: 45 KB, 109 targets. Same `Player > MultiSampleMap > SampleParts` as Sampler, plus:

- `Globals > PlaybackMode` and `SimplerSlicing > PlaybackMode`, both `0` in every shell read. The mode enum (Classic, One-Shot, Slice) is **not yet confirmed by value**; every factory kit pad read is `0`, hats included, so the kits play Classic. To confirm the enum, save one Simpler in each mode from Live and diff.
- `SimplerSlicing` and per-part slice fields (`SlicingThreshold`, `SlicingBeatGrid`, `SlicePoints`, `ManualSlicePoints`…), which stay as the shell has them for one-shots.
- A `MultiSamplePart` carries attributes `InitUpdateAreSlicesFromOnsetsEditableAfterRead="false" HasImportedSlicePoints="true" NeedsAnalysisData="true"`; keep them.

**To put a sample in:** exactly the Sampler move, one part, `KeyRange` 0–127, `RootKey` 60.

## Drum Sampler — `DrumCell`

Default file: 15 KB, 40 targets. Live 12's lightweight pad instrument. No `Player`/`SampleParts`: the sample sits in **`UserSample > Value`**, empty in the default. Its parameters are flat and named: `Voice_Gain`, `Voice_Transpose`, `Voice_Detune`, `Voice_VelocityToVolume`, `Voice_Filter_*`, `Voice_Envelope_Attack/Hold/Decay/Mode`, `Voice_PlaybackStart/Length`, `Volume`, `Pan`, and an `Effect_*` block (pitch envelope, sub, noise, loop, stretch, punch, 8-bit, FM, ring mod).

**With a sample loaded** (read from `Racks/Drum Racks/Acoustic/Ahlimba Kit.adg`, whose pads are `DrumCell`s), `UserSample > Value` holds one `<SampleRef Id="0">` of exactly the shape shown under *The sample reference* below, with `SamplesToAutoWarp` 1 where the Simpler pads carry 0. No key range, root or loop: a Drum Sampler is one sample, start to end, shaped by `Voice_PlaybackStart/Length` and the envelope. So a rack may use either pad instrument; Drum Sampler is the smaller file (15 KB against 45 KB per pad) and the one Live 12 offers by default.

## Drum Rack — `.adg`

```
GroupDevicePreset
  OverwriteProtectionNumber
  Device
    DrumGroupDevice Id="0"
      (housekeeping) · Branches (EMPTY in the file) · IsBranchesListVisible…
      MacroControls.0–15 (parameters) · MacroDisplayNames · MacroDefaults · MacroAnnotations
      …
  PresetRef > FilePresetRef
  BranchPresets                 ← the pads live HERE, not under Device/Branches
    DrumBranchPreset Id="0".."15"
      Name · IsSoloed
      DevicePresets
        AbletonDevicePreset Id="0"
          Device > OriginalSimpler   (the pad's instrument; could be any device)
          PresetRef > AbletonDefaultPresetRef
      MixerPreset > AbletonDevicePreset > Device > AudioBranchMixerDevice
      BranchSelectorRange (Min/Max 0)
      SessionViewBranchWidth · DocumentColorIndex · AutoColored · AutoColorScheme
      SourceContext > BranchSourceContext (BrowserContentPath = the browser query the pad came from)
      ZoneSettings
        ReceivingNote   ← the pad: MIDI note that triggers it
        SendingNote     ← note sent to the device, 60 in every pad read
        ChokeGroup      ← 0 none; the two hats in Akustichord share 1
  ReturnBranchPresets
```

The 16-pad Akustichord kit's receiving notes run 77–92, one per pad, in the rack's own order; a kit for a pad grid wants 36–51 (C1 up), which is the writer's choice, not a format rule. `SendingNote` 60 means every pad plays its Simpler at C3, so the sample sounds at its root. `ChokeGroup` is an integer; equal non-zero values choke each other.

**To build a rack:** clone `Slicing/Default.adg`'s `GroupDevicePreset`, keep its `Device`, and write one `DrumBranchPreset` per pad into `BranchPresets`, each cloned from the one branch the Default carries, with `Id` running 0…n−1, `ReceivingNote` set, `ChokeGroup` set, `Name` set, and the pad's `OriginalSimpler` given one `MultiSamplePart`. The `MacroControls` and `MacroDisplayNames` on the device can stay as the shell has them.

**Inside a Set** (read from a Set Live 11.3.43 saved, GoButton's `860_JULY26.als`; no Live 12 Set with a rack was on this Mac), the rack is `DeviceChain > Devices > DrumGroupDevice`, and its pads are under the device's own `Branches` as `DrumBranch` elements, which differ from a `DrumBranchPreset`: the name is a `Name` block (`EffectiveName`, `UserName`, `Annotation`, `MemorizedFirstClipName`); the instrument sits in `DeviceChain > MidiToAudioDeviceChain > Devices`; the mixer is a `MixerDevice` (Speaker, Volume, Panorama, SendInfos, RoutingHelper) in place of `MixerPreset`; and the pad notes are `BranchInfo` (ReceivingNote, SendingNote, ChokeGroup) in place of `ZoneSettings`. Live does that conversion when it loads a `.adg`; a writer does it on write. Move three wrote a Set that way (Live 12 device shell, Live 11 branch shell, Live 12 Simpler pads) and Live 12.4.6 loaded it without a warning on 2026-10-24. The shell is kept at `xml/Live11 DrumBranch shell.xml`; a Live 12-saved one should replace it when a Set with a rack is saved from Live 12.

## The sample reference, as a factory pad carries it

```xml
<SampleRef>
  <FileRef>
    <RelativePathType Value="5" />                       ← 5 = Live Pack; the writer uses 1 (relative to the Set) + absolute Path
    <RelativePath Value="Samples/One Shots/Drums/Kick/Kick Beats.aif" />
    <Path Value="/Volumes/data/tmp/trunk/Core Library/Samples/One Shots/Drums" />   ← note: a folder, and Ableton's build machine's
    <Type Value="2" />
    <LivePackName Value="Core Library" />
    <LivePackId Value="www.ableton.com/0" />
    <OriginalFileSize Value="144384" />
    <OriginalCrc Value="40414" />
    <SourceHint Value="" />
  </FileRef>
  <LastModDate Value="1778574293" />
  <SourceContext />
  <SampleUsageHint Value="0" />
  <DefaultDuration Value="24055" />                       ← frames
  <DefaultSampleRate Value="44100" />
  <SamplesToAutoWarp Value="0" />
</SampleRef>
```

For a Splice download: `RelativePathType` 1, `RelativePath` from the Set's folder, `Path` the absolute file, `LivePackName`/`LivePackId` empty, `OriginalFileSize` the byte size, `OriginalCrc` 0 (the writer's proven value), `DefaultDuration` the frame count, `DefaultSampleRate` the file's rate, and `SampleEnd` on the part = frames − 1. Splice delivers WAV; the factory pads are AIFF, and the Sampler accepts both.

## What must change to swap a sample — the one-line answers

| Device | Where the sample goes | Also set |
|---|---|---|
| Sampler (`MultiSampler`) | a `MultiSamplePart` under `Player/MultiSampleMap/SampleParts` | key/vel ranges, `RootKey`, `SampleEnd`, loops |
| Simpler (`OriginalSimpler`) | same part, one of them, full key range | `Globals/PlaybackMode` once the enum is confirmed |
| Drum Sampler (`DrumCell`) | a `SampleRef Id="0"` inside `UserSample/Value` | `Voice_PlaybackStart/Length`, `Volume` if wanted |
| Drum Rack (`.adg`) | one `DrumBranchPreset` per pad under `GroupDevicePreset/BranchPresets`, its Simpler as above | `ZoneSettings/ReceivingNote`, `ChokeGroup`, `Name`, branch `Id` |

## Open

1. Confirm Simpler's `PlaybackMode` enum by saving one preset per mode.
2. Replace the Live 11 `DrumBranch` shell with one from a Live 12-saved Set (save the Spoiler Kit Set from Live 12 and lift it).
3. Prove a `DrumCell` pad in a Set.
