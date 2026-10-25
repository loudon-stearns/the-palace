---
title: "Splice Instrument Forge — scroll"
born: 2026-10-24
links:
  - target: "[[Splice Instrument Forge]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Splice Instrument Forge's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Splice Instrument Forge — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Splice Instrument Forge]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

_Not yet rendered. The project was born 2026-10-24 and has no steward; this zone fills when the project is first looked at from the PROJECTS deck._
<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** Ask for an Ableton instrument built from Splice sounds and get a Live Set that opens and plays. Three device kinds, in order of how much of Live's format they need: a Sampler instrument, a Drum Rack, a Session View Set. Every file is cloned from one Live 12 saved and proven by opening in a second Live, as the [[Ableton Session Writer]] does; every element cloned gets written down, so the project's second product is a map of Live's preset and Set XML. Agreed with Loudon on 2026-10-24, when he opened the project.

**The moves ahead**

1. **Open the format study.** Decompress Live's default Sampler, Drum Sampler and Simpler presets and one factory Drum Rack; write down the element tree of each in `workshop/`, and the pointee rules GoButton learned. Done when a reader can name, from the notes alone, what must change to swap a sample into each.
2. **Sampler from one-shots.** Search Splice for a described one-shot set, download the picks, detect root pitch, lay zones across the keyboard, emit an `.adv` and a one-track Set through the writer's `library` path or a sibling of it. Done when the Set opens in Live 12 and every zone's sample is on disk.
3. **Drum Rack from one-shots.** Clone a factory rack; one Drum Sampler per pad from a Splice drum search; hats share a choke group; emit `.adg` and a Set. Done the same way, plus the writer's `check` reads the pads back.
4. **Session View Set from a stack.** Turn a Splice stack into tracks, its layers into clip slots, and make eight scenes that vary which layers play. The Session View XML comes from GoButton's LTC generator and is documented as it is cloned. Done when the Set opens in Session View, the scenes launch, and `check` reads the slots.
5. **One ask, one Set.** A single command or chat request that takes a description, runs the Splice search and the builds, and hands back a Set beside its samples. Done when Loudon asks for a kit in his words and opens what comes back. *Made 2026-10-24: `workshop/forge/`; the first ask was his melodic techno track.*
6. **Key and level.** Every keyed layer transposed to one key by the shortest road, relative major and minor treated as one; every track's fader set by its ground (the standing order). Added on Loudon's yes of 2026-10-24 after the first ask came back in five keys at unity. Done when a stack's layers sit in one key and three grounds without a hand on a fader.
7. **Own shells.** The forge builds its own clean Live 12 shells, thin at first and built up fresh, so no inherited cruft (the named macros, the clip gain, the −12 dB fader) comes along; this replaces cloning from Loudon's saved Sets. Added on Loudon's yes of 2026-10-24.
8. **Taste and nuance.** In Loudon's words: "the sessions that were made, they were of questionable musical utility, we will need to build in more taste and nuance as we move forward… there is much skill and subtlety in musical creation that we can't get simply from looking at metadata and searches, but our approaches are starting to work well, and we have a solid foundation to build on." No first step is named yet; it is not invented here. Added on Loudon's yes of 2026-10-24.
9. **Owed proofs.** Simpler's `PlaybackMode` enum; dragging the lifted `.adv` onto a track; velocity layers in the kit builder; a DrumCell pad inside a Set. Added on Loudon's yes of 2026-10-24.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
- **Splice credits are generous; be liberal.** They exist to stop gross abuse. Download what the work needs without asking. Ask only before spending more than 200 credits in one go. (Loudon, 2026-10-24.)
- **Find before you bend.** The library is huge: the first move is to find layers that already share the Set's tempo and key, and only sparingly change either. When a change is unavoidable, drums stretch in Beats mode; anything else that is stretched or transposed goes in Complex mode. Never move a vocal. (Loudon, 2026-10-24.)
- **Session and arrangement both.** A stack Set holds its scenes as Session slots and, the same clips laid along the Arrangement as sections, a locator naming each. (Loudon, 2026-10-24.)
- **Clip gain is 0 dB.** Every clip the forge writes comes in at unity; level lives on the track fader and, in a rack, on the pad. (Loudon, 2026-10-24, after the cloned clip shell brought +3.1 dB in and distorted.)
- **Level by grounds.** Splice sounds come in loud; start every Set from three grounds, 4 dB apart. Foreground −4 dB: drums and bass. Middleground −8 dB: vocals and leads. Background −12 dB: percussion, pads, strings. A rough starting point for a mix, not the mix. (Loudon, 2026-10-24.)
- **Drums inside a rack.** kick 0 dB as the reference; 808 and sub −2; snare −2; clap −4; tom −4; rim, snap, stick −6; shaker, perc, conga −6; closed and open hats −8; fx −8; ride, crash, cymbal −10; anything unnamed −4. The rack's track then sits in the foreground at −4. A pad's own `db` in the recipe overrides. (Proposed by the forge and adopted by Loudon, 2026-10-24: "very close to what I would propose".)
- **No dead controls.** A rack carries no named macros and no Macro Variations until the forge maps them to something. (Loudon, 2026-10-24, on seeing the Slicing default's Hold/Play/Looped Slices in a kit.)
- **Prove structure, hear sound.** A Set is done when it opens and `check` is clean. Whether it sounds right is Loudon's ear; never say a Set sounds right.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="forge-2026-10-24-plan-moves-7-9" -->
### 2026-10-24 — Plan: moves seven to nine

The plan gained three moves on Loudon's yes, after he heard the Sets: own shells (clean Live 12 shells built fresh, replacing clones of his saved Sets), taste and nuance (he judges the Sets musically thin and the foundation solid; no first step named yet), and owed proofs (four open format questions). Why: the three bugs of the day (macros, clip gain, the −12 dB fader) all came in on cloned shells, and the ear says the next gap is musical, not structural.
<!-- scroll:entry id="forge-2026-10-24-bare-macros" -->
### 2026-10-24 — Bare macros

The kit's rack showed eight named macros (Sample Start, Sample Length, Loop, Pitch…) and five Macro Variations (Hold, Play, Looped Slices, Percussive, Swell) that did nothing: they came with the Slicing default rack the builder clones, and our pads are plain Simplers with no mappings. The builder now blanks the names, values, annotations and snapshots on the rack device in both the `.adg` and the Set and hides the macro panel; `check` refuses a rack that still carries any. Standing order: no dead controls until the forge maps them. Spoiler Kit rebuilt and reopened.
<!-- scroll:entry id="forge-2026-10-24-levels-everywhere" -->
### 2026-10-24 — Clip gain to zero; grounds and an arrangement for kits and Samplers; per-drum levels proposed

Loudon heard distortion: every clip came in at +3.1 dB because the clip shell cloned from his saved Set carried a sample gain of 1.423. Every clip is now written at 1.0 and `check` refuses a Set with any clip above 0 dB. On his yes, kits and Samplers get the grounds and an arrangement too: `forge/finish.mjs` sets any track's fader by ground or dB and writes locators, the forge runs it after the Session Writer's Sampler job (middleground, a "phrase" locator), and the rack builder sets its track to the foreground and a locator at the pattern. It turned out the MIDI track shell had carried −12 dB on every kit and Sampler track until now. Per-drum levels inside a rack are proposed above in the standing orders and applied on each pad's branch mixer in both the `.adg` and the Set; `check` prints them. All three Sets rebuilt and opened in Live 12.
<!-- scroll:entry id="forge-2026-10-24-takes" -->
### 2026-10-24 — Take lanes: two alternates for every track

Loudon asked for alternate takes on every track so he can assemble his own variations from options. The Arrangement's take lanes carry them: a stack recipe's layer may list `alternates` (file, bpm, key), and each becomes a named lane on that track with the alternate's clip laid across the same sections as the main lane, warped and keyed by the same rules; `check` counts lanes and their clips and finds their samples. The shape came from a Set Loudon saved with every track's clips as takes of one track, after the only fixture on disk had two lanes. The melodic techno Set now carries twelve alternates, two per track, all found at 124 (or 125 and 123) in A or unkeyed, none transposed; twelve credits. His first cut of this Set is `All in takes Project/`.
<!-- scroll:entry id="forge-2026-10-24-find-before-bend" -->
### 2026-10-24 — Find before you bend; the arrangement too

Loudon heard the transposed Set and set the rule: with a library this size, find layers that already share the tempo and key and bend sparingly; drums that must stretch go in Beats mode, anything else bent goes in Complex; never move a vocal. The session builder now picks warp mode that way, counts bends of more than 1 bpm or any transposition, and says so; `ASK.md` tells a session to re-search every off-key or off-tempo layer with the key in the query and the tempo as the filter before building. The melodic techno Set was re-sourced that way: a 124 drum groove, a lead and a pad in A from one Zenhiser pack, a C major string pad at 124 (relative, no move), an acid line in A at 125 (one of ten in that key), the vocal kept. Nothing transposed; two 1 bpm warps. Six more credits. The first version stays as `stack-v1-bent.json`. Then, on his word mid-build, every stack Set also lays its scenes along the Arrangement as eight-bar sections (a scene may name its `bars`) with a locator at each; `check` lists the locators and counts slots against arranged clips.
<!-- scroll:entry id="forge-2026-10-24-move-6-key-level" -->
### 2026-10-24 — Move six: key and level

Added to the plan on Loudon's word after the melodic techno Set came back in five keys with every fader at unity. The session builder now reads each layer's key as Splice listed it, picks the stack's key (the recipe's, else the bass's), and writes `PitchCoarse` on every clip for the shortest transposition, with a relative pair (C major against A minor) counted as already in key. Each track's mixer `Volume` is set by its ground: foreground −4, middleground −8, background −12 dB, by role words, or by `ground`/`db` in the recipe. `check` now prints the transpose and the level per track. The melodic techno Set was rebuilt in A minor, the vocal's key: acid −3, lead +2, pad −4, strings 0 (relative), drums untouched; levels −4/−4/−8/−12/−8/−12. Loaded in a second Live 12, left open for his ear.
<!-- scroll:entry id="forge-2026-10-24-move-5-ask" -->
### 2026-10-24 — Move five: one ask, one Set

`workshop/forge/forge.mjs` is the one command: `fetch` a manifest of Splice download links before they expire, `build` any recipe (kit, instrument, stack) by routing to the move that made it, `check` a Set whatever its kind, `open` it in a second Live 12. `workshop/forge/ASK.md` is what a session follows from Loudon's sentence to that command. The entry gained a **How to ask** section and moved to sprout.

**Loudon's first ask**, in his words: "I would like a melodic techno track with a female vocal and acid bass feature with a cinematic breakdown." Splice's `prompt_to_stack` gave five layers (a female vocal hook, a 303 acid loop, a melodic techno groove, a lead, a pad); `update_stack` added a cinematic strings layer for the breakdown (six credits). Eight scenes: Intro, Acid in, Vocal, Full, Cinematic breakdown (strings, pad, vocal), Acid feature, Drop, Outro. `check`: 25 clips, all warped to 124, 254 pointees unique. Loaded in a second Live 12.4.6 at 19:33, no warning; left open for his ear. Keys are honest and uneven (A minor vocal, C minor acid, G lead, C# pad, C major strings): Splice's "compatible" is looser than a key, and matching keys is the forge's next real problem. The whole ask, from his sentence to the open Set, took one session turn.
<!-- scroll:entry id="forge-2026-10-24-move-4-session" -->
### 2026-10-24 — Move four: a Session View Set from a Splice stack

**Flowers Stack**: Splice's `prompt_to_stack` built a five-layer dubstep stack from one sentence (bass, two drum loops, a pad, a vocal atmosphere; five credits), and `forge-session.mjs build stack.json` wrote a Set with one audio track per layer and eight named scenes, each slot holding the layers that play in it, every clip warped to 140 with markers at its native beat length (two layers were 150 bpm). `check` draws the scene grid: 21 clips, all warped, every sample on disk, 222 pointees unique. Opened in a second Live 12.4.6 at 19:27:03 in Session view, no warning; left open for Loudon to fire scenes. The audio-track and audio-clip shells are Live 12-written (the default Set; a Set Loudon saved). Keys are not matched yet: the stack mixes F minor, E minor and B major. The format study gained the Session View section; `workshop/move-4-session/README.md` has the recipe.

**Heard:** Loudon on the Flowers Stack Set, 2026-10-24: "worked!"
<!-- scroll:entry id="forge-2026-10-24-move-3-fix" -->
### 2026-10-24 — Move three, corrected: the pad notes were upside down

Loudon played the Spoiler Kit Set and found the closed hat on D5 while the clip sat in the C1 octave. A Drum Rack pad's `ReceivingNote` is stored as 128 minus the MIDI note (the factory kick stores 92 and sits on C1); the builder had written the MIDI note itself. He saved the Set back from Live 12, which gave the forge its first Live 12-written `DrumBranch` (the Live 11 shell differed by three housekeeping fields) and confirmed the stored numbers. The builder now inverts on write, `check` shows the MIDI note with the stored number beside it, and the rebuilt `.adg` and Set put the kick on C1 and the hats on F#1 and A#1. The format study carries the rule.

**Heard:** Loudon on the rebuilt Spoiler Kit, 2026-10-24: "works well".
<!-- scroll:entry id="forge-2026-10-24-move-3-drum-rack" -->
### 2026-10-24 — Move three: a Drum Rack from Splice one-shots

**Spoiler Kit**: eight one-shots from eight Splice searches (tearout kick, cracking snare, layered clap, deep tom, bright crash, tight closed hat, open hat, an 808 in C; eight credits), on pads 36–42 and 46 with the hats in choke group 1, a four-bar pattern at 140. `forge-drum-rack.mjs build kit.json` writes both `Spoiler Kit.adg` (Live 12's Slicing Default rack with one `DrumBranchPreset` per pad) and `Spoiler Kit.als` (the rack as a `DrumGroupDevice` with `DrumBranch` pads on one track). Its `check`: 1837 pointees, all unique, every pad's sample on disk; the Session Writer's `check` passes too. Opened in a second Live 12.4.6 at 19:15:44 ("Loaded document was created by Ableton Live 12.4.6 … done", no warning); left open for Loudon's ear. The in-Set branch shell came from a Live 11 Set, the one risk taken, and Live 12 took it. The format study gained the DrumBranch shape; `workshop/move-3-drum-rack/README.md` has the recipe.

**Heard:** Loudon on move two's Astromode Analog, 2026-10-24: "works greaty!"
<!-- scroll:entry id="forge-2026-10-24-move-2-sampler" -->
### 2026-10-24 — Move two: a Sampler from Splice one-shots

**Astromode Analog**: three Soul Surplus analog-synth single notes (C, D, E) found and fetched through the Splice connector (three credits), roots detected by autocorrelation as C1, D1, E1 within 4 cents of the filenames' claims, laid across the whole keyboard with the ranges split between roots, and written as a Set through the [[Ableton Session Writer]]'s `library` job with no change to the writer. `check`: 357 pointees, all unique, 3 samples on disk, nothing to look at. Opened in a second Live 12.4.6 at 19:07:38 (Live's log: "Loaded document was created by Ableton Live 12.4.6 … Loading command-line document: done", no warning); that Live is left open for Loudon's ear. The Sampler alone was lifted into `Astromode Analog.adv` with every pointee id zeroed as the format study found Live writes presets; loading that preset directly is unproven. Files, scripts and the recipe: `workshop/move-2-sampler/`.
<!-- scroll:entry id="forge-2026-10-24-format-study" -->
### 2026-10-24 — Move one: the format study

Live 12's Sampler, Simpler, Drum Sampler and Drum Rack shells decompressed and mapped in `workshop/format-study/` (the study is `Splice Instrument Forge — study — live-formats.md`; outlines and XML beside it). What it settled: a preset file carries every pointee id as 0 and no `NextPointeeId`, so renumbering begins only when a device enters a Set; a rack's pads live under `GroupDevicePreset/BranchPresets`, not under the device's empty `Branches`; a pad is `ZoneSettings` (ReceivingNote, SendingNote 60, ChokeGroup) around a Simpler or a Drum Sampler; Drum Sampler holds its one sample as a `SampleRef` in `UserSample/Value`. Two things stay open: Simpler's `PlaybackMode` enum, and how a rack sits inside a Set. Move two needs nothing the writer doesn't already have.
<!-- scroll:entry id="forge-2026-10-24-born" -->
### 2026-10-24 — Born

Prior art gathered before a line was written: the [[Ableton Session Writer]] and its probe templates, GoButton's `tools/v2-convert.js` and the LTC generator's Session View XML, the extensions SDK's limits, and Live 12's own preset shells. The read is summarised in `workshop/README.md`. Splice's connector was exercised once: a search for dubstep bass loops in F at 140 came back with BPM, key, tags, pack and asset ids.
<!-- scroll:making:end -->
