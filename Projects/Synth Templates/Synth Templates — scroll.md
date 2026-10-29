---
title: "Synth Templates — scroll"
born: 2026-10-29
links:
  - target: "[[Synth Templates]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Synth Templates' scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# Synth Templates — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Synth Templates]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

_Not yet regenerated. The project was born 2026-10-29 and has not been looked at by the board._
<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**PROPOSED — awaiting Loudon's yes.** Drafted by the Concierge on 2026-10-29 from the session that minted the project; nothing below is agreed until he says so.

Where this is going: a catalog of template cards a learner can program on any softsynth in the toolkit and check against a reference, the house bass first and proven before any card follows.

1. **Fix the card vocabulary.** One sheet that says what a card holds: the essential settings, the taste settings, the words for ranges. The range words are the archetype registry's region names (`instant`, `snappy`, `short`, `long`; `closed`, `dark`, `open`, `bright`; `sub`, `low`, `mid`, `high`…) from `Projects/Generative Audio Devices/pdl-renderer/vcv_fundamental_registry.json`, reused, not reinvented, so the catalog and [[Generative Preset Development]]'s profiles stay one language.
2. **Choose the first batch.** From the catalog Loudon is picking now (`workshop/catalog.json` and the picker page beside it). The batch is small and ordered so each card adds one idea to the last.
3. **Signal-flow sheets, one per card.** TikZ under the [[Technical Diagram Standard]]'s primitives, rendered to SVG, on the Drafting Table paper ground; essential and taste marked in the provenance colours.
4. **A neutral reference voice and its render pipeline.** A fully controlled subtractive voice the project owns (SimpleSynth from [[VST Template]] is a candidate; a Python or Web Audio voice is the other), rendering every card to a WAV with a manifest, a feature sidecar (level, brightness, rise, tail, width) and a spectrogram, after the pattern of `Projects/Portamento and Physical Pitch Modeling/curated-ear-set/`.
5. **A comparison sheet.** The learner's render beside the reference: the two spectrograms, the two feature rows, the differences named in the card's own words, and a play button for each. Compared by feature and by ear ([[Audition Gate]]), never by null test.
6. **Prove three templates on three synths.** The house bass alone first, on Vital, Serum and Ableton Wavetable, heard by Loudon; then the next two cards, each climbing from the last. Staging per his 2026-10-25 ruling on the Dissolutions proofs: work up to the thing, never start at the end.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_None yet._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="synth-templates-2026-10-29-born" -->
### 2026-10-29 — Born

Loudon proposed a catalog of synth templates as teaching material and a common language across synthesizers, and decided it is a new project rather than a fold into [[Generative Preset Development]]. The Concierge gathered the prior art (the `house_bass.pdl` recipe and archetype registry in [[Generative Audio Devices]], the perceptual bands and Vital render path in Generative Preset Development, the curated ear set in [[Portamento and Physical Pitch Modeling]], the Technical Diagram Standard's signal-flow primitives) and laid these bones: the entry and this scroll. The workshop's catalog and picker page are the working session's, made beside this.

_Left rough:_ the plan is proposed, not agreed; the reference voice is not chosen; no card exists yet.
<!-- /scroll:entry -->
<!-- scroll:making:end -->
