---
title: "ASK"
born: 2026-10-24
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: the-one-ask
forward_vector: "I am what a session follows when Loudon asks the forge for something in his own words: from his sentence to a Set he opens, with the Splice connector doing the finding and forge.mjs doing the making."
---

# From a sentence to a Set

Loudon says what he wants ("a lo-fi kit at 85", "an analog bass Sampler", "a dark dubstep session at 140 in F minor"). The session does the rest. The Splice connector lives in the session, so the finding is yours; the making is one command.

## 1. Hear the kind

| He says… | kind | what gets made |
|---|---|---|
| kit, drum rack, drums, pads | `kit` | a Drum Rack `.adg` and a Set with a pattern |
| instrument, Sampler, multisample, a playable X | `instrument` | a Sampler `.adv` and a Set with a phrase |
| session, scenes, stack, a groove to jam over, a track | `stack` | a Session View Set, one track per layer, scenes |

Unsure? A kit. It is the most forgiving and the most asked for.

## 2. Find the sounds (the connector)

- **kit**: one `describe_a_sound` per pad, `type: oneshot`, genre in the query ("lo-fi kick one shot dusty"). Eight pads is a kit: kick, snare, clap or rim, closed hat, open hat, perc, crash or ride, a sub or 808. Pick by tags and duration; the ear is Loudon's.
- **instrument**: `describe_a_sound` for single notes of one family, `type: oneshot`, and favour results whose names end in a note (`_C.wav`, `_F#.wav`): one family, several pitches. Three notes make a thin instrument; search per note if the family is thin.
- **stack**: `prompt_to_stack` with the sentence itself plus a BPM and `bpm_min`/`bpm_max` around it. It returns layers with roles, native BPM and keys. To build around a loop he picked, `create_stack` with its asset UUID instead.

Credits: spend freely; ask only before more than 200 at once (his standing order on the scroll).

## 3. Fetch before the links die

Make the folder (`workshop/<something>/`), call `download_asset` for every pick, then **at once** write `manifest.json` and run fetch. Presigned URLs last about two minutes.

```json
{ "into": "samples", "samples": [ { "file": "<File Name from the download result>", "url": "<Download URL>" } ] }
```

```bash
node forge/forge.mjs fetch "<folder>/manifest.json"
```

A FAILED line means an expired URL: call `download_asset` again for that one (a repeat download is free) and re-run fetch.

## 4. Write the recipe

- **kit** — `kit.json` as `move-3-drum-rack/kit.json`: `kind: "kit"`, `name`, `tempo`, `pads` (`note`, `name`, `file`, `choke` for hats), `pattern` rows of sixteenths. Pads from 36 up (C1); hats share a choke group.
- **instrument** — `recipe.json`: `{ "kind": "instrument", "name", "tempo", "release": 0.5, "samples": "samples" }`. Roots are detected; nothing else to say.
- **stack** — `stack.json` as `move-4-session/stack.json`: `kind: "stack"`, `name`, `tempo`, `layers` (`role`, `file`, native `bpm` as Splice listed it), `scenes` (`name`, `play`). Eight scenes that add and remove layers read well: intro, build, drop, full, a breakdown, a second drop, outro.

## 5. Make, check, open

```bash
node forge/forge.mjs build "<folder>/<recipe>.json"
node forge/forge.mjs check "<folder>/<Name>.als"
node forge/forge.mjs open  "<folder>/<Name>.als"
```

`check` must end "nothing to look at". `open` starts a second Live 12 so Loudon's own Live is never touched. Then read Live's log for "Loading command-line document: done" without a warning, and hand the Set to Loudon with the Set's name and where it is. The sound is his call; never say it sounds right.

## 6. Leave the trail

A line on the scroll's trail: what he asked, what was found, credits spent, what `check` said, when Live loaded it, and later what he said. Prior art before anything new: the format study in `../format-study/`.
