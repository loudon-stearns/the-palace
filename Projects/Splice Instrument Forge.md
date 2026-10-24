---
title: "Splice Instrument Forge"
type: project
pillars:
  - creation
  - tools
  - practice
born: 2026-10
stage: seed
status: active
energy: high
confidence: hypothesis
links:
  - target: "[[Generative Sample Libraries]]"
    type: deepens
    label: splice-as-source
  - target: "[[Ableton Session Writer]]"
    type: connects-to
    label: emits-through
  - target: "[[Generative Preset Development]]"
    type: connects-to
    label: earlier-live-xml-seam
  - target: "[[Audition Gate]]"
    type: exemplifies
    label: structure-proven-sound-heard
  - target: "[[Search Before You Build]]"
    type: exemplifies
    label: born-from-prior-art
  - target: "[[Loudon Live]]"
    type: enables
    label: ready-to-play-sets
  - target: "[[FOUR PILLARS]]"
    type: connects-to
    label: structured-by
forward_vector: "I become a thing Loudon can ask — a dubstep drum rack at 140 with a growl-bass Sampler and eight scenes — and the answer is a Live Set he opens and plays; on the way I learn how Live's presets and Sets are built, one cloned element at a time, and leave that map behind for every project that ends in sound."
---

# Splice Instrument Forge

A [[FOUR PILLARS]] project: **Ableton instruments, drum racks and Session View sets, built from Splice sounds on request.** Splice's catalog is reachable from inside a session now (search by description, tempo, loop or one-shot; stacks of compatible layers; downloads). Live's own file formats are gzipped XML the palace already knows how to clone. This project joins the two: ask for an instrument, get a Set.

It has two products, made together. The first is the devices: a Sampler instrument, a Drum Rack, a Session View Set, each proven by opening in Live. The second is the understanding: a working map of how Live's presets (`.adv`, `.adg`) and Sets (`.als`) are put together, documented element by element as each one is cloned. Build it to understand it, then build with it.

## What it stands on

- **[[Ableton Session Writer]]** already writes Live 12 Sets by cloning elements Live itself saved: a blank Set, Live's default Sampler with zones, MIDI clips, a Limiter. Its own known gaps name Drum Rack and Session View as unbuilt. This project fills those gaps and emits through the writer rather than forking it.
- **GoButton**, Loudon's show-control repository beside the palace, holds the discipline: gunzip, edit the XML as text, renumber every pointee id from `NextPointeeId` and write it back, empty cloned automation envelopes, escape names, never touch a Set Live has open. Its LTC generator carries the only Session View XML on this Mac: ClipSlot, Scene, FollowAction.
- **[[Generative Preset Development]]** cracked `.adv` one level down: read a gzipped preset, change one value, gzip back, load in Live.
- **The Ableton extensions SDK** can insert a Drum Rack, add chains, set pad notes and swap a Simpler's sample in a running Live, but has no Sampler class, no zone or parameter access and no save. It is a prototype path for Drum Racks and nothing more. Everything durable here is file writing.
- **Live ships a shell for every target.** Sampler, Simpler and Drum Sampler defaults, and factory Drum Racks, all as gzipped XML in the Core Library.

## The three makes

1. **A Sampler instrument from Splice one-shots.** Search, Loudon picks, download, map across the keyboard by detected pitch or filename, emit an `.adv` and a one-track Set.
2. **A Drum Rack from one-shots.** Clone a factory rack, one Drum Sampler per pad, choke groups for hats, emit an `.adg` and a Set.
3. **A Session View Set from loops and stacks.** A Splice stack becomes tracks, its layers become clip slots, scenes become arrangement variations. This is where the format study goes deepest, since no palace tool writes Session View yet.

Each make is proven as the writer proves: it opens in a second Live 12, the devices load, every sample is on disk, every id is unique. Whether it sounds right is Loudon's ear ([[Audition Gate]]).

## Where it sits

This is the Splice arm of [[Generative Sample Libraries]], whose source list already left a slot for web libraries with permission for downloads. Where that project draws audio from synthesis and AI models and renders open sampler formats, this one draws from Splice and renders Live's own. [[Generative Preset Development]] navigates a fixed synth's parameters; this project navigates a fixed sampler's zones and a Set's slots. The same move, content instead of configuration.

The scroll is the front door: [[Splice Instrument Forge — scroll]]. Format notes accumulate in the bundle's `workshop/`.
