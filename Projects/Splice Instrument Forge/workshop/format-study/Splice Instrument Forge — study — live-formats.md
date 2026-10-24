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

**`ReceivingNote` is stored inverted: stored value = 128 − MIDI note.** The Akustichord kit's kick stores 92 and sits on C1 (36); its closed hat stores 86, which is F#1 (42), the GM hat. The first Spoiler Kit wrote 42 and Loudon found the hat on D5 (86) on 2026-10-24, which is how the rule was caught; Live 12 saved that Set back with the same stored numbers, so the file is the truth and the display is 128 minus it. `SendingNote` is **not** inverted: every pad read stores 60 and plays its sample at root (C3). `ChokeGroup` is an integer; equal non-zero values choke each other. A kit for a pad grid wants MIDI 36–51 (C1 up), stored as 92 down to 77.

**To build a rack:** clone `Slicing/Default.adg`'s `GroupDevicePreset`, keep its `Device`, and write one `DrumBranchPreset` per pad into `BranchPresets`, each cloned from the one branch the Default carries, with `Id` running 0…n−1, `ReceivingNote` set, `ChokeGroup` set, `Name` set, and the pad's `OriginalSimpler` given one `MultiSamplePart`. The `MacroControls` and `MacroDisplayNames` on the device can stay as the shell has them.

**Inside a Set** (read first from a Set Live 11.3.43 saved, GoButton's `860_JULY26.als`, then from the Spoiler Kit Set saved back by Live 12.4.6 on 2026-10-24, `move-3-drum-rack/Spoiler Kit V12 Project/`), the rack is `DeviceChain > Devices > DrumGroupDevice`, and its pads are under the device's own `Branches` as `DrumBranch` elements, which differ from a `DrumBranchPreset`: the name is a `Name` block (`EffectiveName`, `UserName`, `Annotation`, `MemorizedFirstClipName`); the instrument sits in `DeviceChain > MidiToAudioDeviceChain > Devices`; the mixer is a `MixerDevice` (Speaker, Volume, Panorama, SendInfos, RoutingHelper) in place of `MixerPreset`; and the pad notes are `BranchInfo` (ReceivingNote, SendingNote, ChokeGroup) in place of `ZoneSettings`. Live does that conversion when it loads a `.adg`; a writer does it on write. Live 12's `DrumBranch` is the Live 11 one plus three housekeeping fields on its mixer (`BreakoutIsExpanded`, `MpePitchBendUsesTuning`, `ViewData`); the pad notes stay in `BranchInfo` in a Set and `ZoneSettings` in a preset, both inverted as above. The Live 12 shell is `xml/Live12 DrumBranch shell.xml` and the whole in-Set device `xml/Live12 DrumGroupDevice in a Set.xml`; the Live 11 shell stays beside them for the record.

## Session View — a Set that opens on scenes

Read and written in move four (2026-10-24), from Live 12.1's DefaultLiveSet (the writer's blank), a Set Loudon saved in Live 12.4.6 (`Impact Granular.als`) and GoButton's `ltc-generator.js`.

```
LiveSet
  Tracks
    AudioTrack Id
      Name (EffectiveName, UserName, Annotation, MemorizedFirstClipName) · Color · AutomationEnvelopes
      DeviceChain
        Mixer (On, Sends, Speaker, Pan, Volume, CrossFadeState…)   ← pointees
        MainSequencer
          ClipSlotList
            ClipSlot Id="i"                 ← one per scene, in scene order
              LomId
              ClipSlot > Value              ← empty, or ONE <AudioClip>/<MidiClip>
              HasStop · NeedRefreeze
          MonitoringEnum · Sample > ArrangerAutomation > Events   ← arrangement clips live here, not in slots
          *ModulationTarget ×8              ← pointees
        FreezeSequencer                     ← same shape, slots empty
        DeviceChain > Devices               ← the track's devices
  Scenes
    Scene Id="i" (FollowAction, Name, Color, Tempo, IsTempoEnabled, TimeSignatureId…)   ← flat list; row i = slot i
  SelectedDocumentViewInMainWindow         ← 0 Arrangement, 1 Session
```

An `AudioClip` is one element whether it sits in a slot or in `ArrangerAutomation/Events`; only the parent differs, and in a slot its `Time` attribute is 0. The fields that make a loop: `Loop` (`LoopOn` true, `LoopStart` 0, `LoopEnd`/`OutMarker`/`HiddenLoopEnd` = beats), `CurrentEnd` = beats, `IsWarped` true, `WarpMode` (0 Beats, 4 Complex, 6 Complex Pro as the shells show), and `WarpMarkers`: `(SecTime 0, BeatTime 0)` and `(SecTime = the file's seconds, BeatTime = its beats at its native tempo)`. Live stretches between the markers to the Set's tempo, so a 150 bpm loop with a marker at 32 beats plays as eight bars at 140. `WarpMarker` ids are not pointees. A clip's `PitchCoarse` is whole semitones and `PitchFine` cents, both plain values. A track's level is its `Mixer > Volume > Manual`, **linear amplitude** (1 = 0 dB, 1.995 = +6 dB, 0.000316 = −70 dB), so −4 dB is 0.631 and −12 dB is 0.251. **Locators** are `LiveSet > Locators > Locators > Locator Id` with `LomId`, `Time` (beats), `Name`, `Annotation`, `IsSongStart` (read from a Live 12.4.6 Set, `xml/Live12 Locator.xml`). An **arrangement clip** is the same `AudioClip` placed in `MainSequencer > Sample > ArrangerAutomation > Events` with `Time` and `CurrentStart` at its start in beats and `CurrentEnd` at its end; with `LoopOn` true it repeats its loop to fill that span. Blank `Envelopes`, `Onsets` and `SavedWarpMarkersForStretched` when cloning; set `MarkersGenerated` false and `IsSongTempoLeader` false.

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
| Session Set (`.als`) | an `AudioClip` in `MainSequencer/ClipSlotList/ClipSlot[i]/ClipSlot/Value`, one per scene it plays in | `Loop`, `IsWarped`, two `WarpMarkers`, `Scenes` with one `Scene` per row, view flag 1 |
| Drum Rack (`.adg`) | one `DrumBranchPreset` per pad under `GroupDevicePreset/BranchPresets`, its Simpler as above | `ZoneSettings/ReceivingNote` = 128 − MIDI note, `ChokeGroup`, `Name`, branch `Id` |

## Open

1. Confirm Simpler's `PlaybackMode` enum by saving one preset per mode.
2. Prove a `DrumCell` pad in a Set.
