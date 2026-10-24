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
5. **One ask, one Set.** A single command or chat request that takes a description, runs the Splice search and the builds, and hands back a Set beside its samples. Done when Loudon asks for a kit in his words and opens what comes back.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
- **Splice credits are generous; be liberal.** They exist to stop gross abuse. Download what the work needs without asking. Ask only before spending more than 200 credits in one go. (Loudon, 2026-10-24.)
- **Prove structure, hear sound.** A Set is done when it opens and `check` is clean. Whether it sounds right is Loudon's ear; never say a Set sounds right.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="forge-2026-10-24-move-4-session" -->
### 2026-10-24 — Move four: a Session View Set from a Splice stack

**Flowers Stack**: Splice's `prompt_to_stack` built a five-layer dubstep stack from one sentence (bass, two drum loops, a pad, a vocal atmosphere; five credits), and `forge-session.mjs build stack.json` wrote a Set with one audio track per layer and eight named scenes, each slot holding the layers that play in it, every clip warped to 140 with markers at its native beat length (two layers were 150 bpm). `check` draws the scene grid: 21 clips, all warped, every sample on disk, 222 pointees unique. Opened in a second Live 12.4.6 at 19:27:03 in Session view, no warning; left open for Loudon to fire scenes. The audio-track and audio-clip shells are Live 12-written (the default Set; a Set Loudon saved). Keys are not matched yet: the stack mixes F minor, E minor and B major. The format study gained the Session View section; `workshop/move-4-session/README.md` has the recipe.
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
