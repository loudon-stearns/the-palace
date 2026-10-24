---
title: "README"
born: 2026-10-24
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: move-four-of
forward_vector: "I am move four's folder: a Splice stack became a Session View Set with a scene per arrangement, and I say how, so the next stack is a recipe and one command."
---

# Move four — a Session View Set from a Splice stack

**Flowers Stack**: a five-layer stack Splice built from one prompt (dark dubstep at 140 in F minor: wobble bass, half-time drums, a second drum loop, a cavernous pad, a vocal atmosphere), one audio track per layer, eight scenes that choose which layers play (Intro, Build, Drop, Drop full, Bass only, Break, Drop 2, Outro), every clip warped to 140 and looping on its own bar count.

## The recipe and the command

`stack.json`: `name`, `tempo`, `layers` (`role`, `file`, native `bpm`), `scenes` (`name`, `play`: the roles that sound). Then:

```bash
node forge-session.mjs build stack.json [--out-dir .] [--force]
node forge-session.mjs check "Flowers Stack.als"
```

`check` draws the scene grid per track, counts clips and warped clips, and confirms every sample is on disk. The Session Writer's `check` passes too; it sees tracks and clip counts, not slots.

## Where every element came from

- **Set, scenes, Limiter**: the Session Writer's templates. The blank Set's first `Scene` is cloned per arrangement with a `Name` and the Set's `Tempo`.
- **Audio track**: an `AudioTrack` lifted from Live 12.1's DefaultLiveSet (`../format-study/xml/Live12 AudioTrack shell (from DefaultLiveSet).xml`). Its `Sends` are emptied because the blank's return tracks are dropped. Its `MainSequencer > ClipSlotList` holds one `ClipSlot` per scene; a clip goes in `ClipSlot > ClipSlot > Value`, the shape GoButton's LTC generator proved. The `FreezeSequencer` gets the same number of empty slots.
- **Audio clip**: an `AudioClip` from a Set Loudon saved in Live 12.4.6 (`../format-study/xml/Live12 arrangement AudioClip.xml`; the element is the same in a slot and in the arrangement, only the parent differs). Set per layer: `CurrentEnd`, `Loop` (on, 0 to the loop's beats), `Name`, `Color`, `IsWarped` true, `WarpMode` 4 (Complex), the `SampleRef`, and two `WarpMarkers`: (0 s, 0 beats) and (the file's length in seconds, its length in beats at its **native** tempo). That second marker is what makes a 150 bpm loop play at 140: Live stretches between the markers to the Set's tempo.
- **Beats from seconds**: `round(seconds × native bpm / 60)`; every Splice loop landed on a whole bar count (8, 16, 32 beats).

## What this move taught (for the format study)

- Session View needs nothing exotic: scenes are a flat `Scenes` list, slots are per track, and a clip in a slot is the arrangement clip element without a meaningful `Time`. The Set opens in Session view when `SelectedDocumentViewInMainWindow` is 1.
- The stack's layers carried two tempos (140 and 150) and Splice lists each; warp markers at native beat length are the whole of tempo matching.

## Known limits

- Keys are not matched: the stack came back with an E minor pad and a B major vocal against an F minor bass. Splice's stack said "harmonically coherent"; the ear will say. `PitchCoarse` on a clip is the one-line fix once a key rule exists.
- No clip gain or track volume set; all layers at unity.
- Scenes launch everything in them at once; no follow actions.
- The first scene is not auto-launched: the Set is silent until a scene is fired.
