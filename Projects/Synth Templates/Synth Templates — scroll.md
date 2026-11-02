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
2. **Walk the whole catalog in tier order.** Loudon's word, 2026-10-29: "I want to do them all, in your order of tiers." All 292 templates in `workshop/catalog.json`, 19 families, walked tier by tier (157 in tier 1, 110 in tier 2, 25 in tier 3) and tracked in `workshop/picker.html`, the Completeness Tracker, which holds four states per template (todo, drafted, rendered, verified) and a coverage panel per concept. Every concept in his synthesis notes ([[Synthesis Notes (Loudon)]]) maps to at least one template: 93 concepts, each named in the catalog's concept map.
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
<!-- scroll:entry id="synth-templates-2026-11-01-no-ghosts" -->
### 2026-11-01 — No ghosted blocks: the diagram holds only what the preset needs

Loudon: "do not put the unused blocks ghosted, as we move through this catalog our patches will have a wide variety of different amounts of modulators and oscillators and filters and effects, It is better to kept the diagram holding only what is necessary for each preset." `card-to-tikz.py` now draws only the blocks a card uses. The slot order stays fixed (sources; mix, filter 1, filter 2, amp, fx, out; lfo 1, filter env, mod env, amp env, lfo 2; key, vel, wheel, aftertouch) and the grid packs around what is present: sources centred on the audio row, the chain in consecutive columns, modulators beneath ordered by their first target's column, performance inputs along the bottom; bus heights and paper size follow the content. House Bass regenerated: seven blocks, two performance inputs, no grey (`7c0a2023`).

_Left rough:_ the Plan is still proposed. `7c0a2023`'s message says the README and this entry changed with it; they did not, and landed in the commit after it.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-01-inputs-left" -->
### 2026-11-01 — Diagram grammar revised on Loudon's read: inputs left, every jack labelled

Loudon, on the first sheet: "I find it odd that the modulation inputs are on the right side of the objects, I wonder if we can put all inputs on the left side of the blocks, and label all inputs." And: "are there any standard signal flow principles you can find online." `card-to-tikz.py` now gives every block labelled input jacks on its left edge and an output on the right; modulators sit one column left of their targets and their wires run on a bus below the audio row; audio solid, CV dashed, gate dotted. The card gained four explicit key routes (pitch to both oscillators, gate to both envelopes) so the gates draw. The outside conventions this follows, with their sources, are in `workshop/README.md` § Conventions adopted. The sheet and preview are regenerated.

_Left rough:_ one claimed source (ISA S5.4's "horizontal format") could not be verified and was left out. The Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-01-house-bass-card" -->
### 2026-11-01 — First card and generator; House Bass drafted

Loudon: "Prototype House Bass." The first card exists, `workshop/cards/house-bass.yaml` (schema `synth-template-card/0.1`), and the smallest generator that draws its sheet from it, `workshop/card-to-tikz.py`: a fixed layout grammar under the Technical Diagram Standard, essentials in ink, taste in amber, unused slots ghosted. The sheet is `cards/house-bass.tex` and `.svg`, with `house-bass-preview-1.png` as the quick look; the render recipe is in `workshop/README.md`. Mappings to real synths are still empty. Made in the workshop; committed and landed on his word.

_Left rough:_ the card's status is drafted, not rendered or verified; no reference audio yet; the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-01-notes-source" -->
### 2026-11-01 — Loudon's notes become a source of their own

Loudon: "Yes, source entry." His synthesis notes left the workshop and became [[Synthesis Notes (Loudon)]], a `source` entry at the palace root with the PDF and its extracted text in its bundle. This entry now carries `emerged-from` that source (concepts-covered); `workshop/build-catalog.py`'s concept-map comment points at the new path; `workshop/README.md` says what is source of truth and what is generated. The year is still his to supply; the source marks it ASSUMED.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-10-29-workshop" -->
### 2026-10-29 — The workshop: the whole catalog and its tracker

Loudon chose no first batch: all of them, in tier order. He also supplied his own synthesis notes, a 29-page PDF, and asked that every concept in them be covered by one or more templates. The workshop holds the result, committed on his word to land:

- `workshop/build-catalog.py` — the source of truth: 292 templates in 19 families, and a 93-concept map from his notes to the templates that cover each.
- `workshop/catalog.json` — generated from it.
- `workshop/build-picker.py` and `workshop/picker.html` — the Completeness Tracker: a tier-ordered walk, four states per template (todo / drafted / rendered / verified), a coverage panel per concept.
- `workshop/notes/Synthesis_notes_from_Loudon.pdf` and `workshop/notes/synthesis-notes.txt` — his notes and their extracted text; the source for the Filter Routings, Envelope Shapes, Voices/Tuning/Retrigger, LFO Behaviours, Delay-Family Effects and Performance Controls families.

Counts checked against `catalog.json` by the Concierge before this entry was written: 292 templates, tiers 157 / 110 / 25, 93 concepts, every concept's template ids resolving.

_Left rough:_ the Plan is still proposed; the PDF's home (workshop file or a source entry of its own) is an open offer to Loudon.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-10-29-born" -->
### 2026-10-29 — Born

Loudon proposed a catalog of synth templates as teaching material and a common language across synthesizers, and decided it is a new project rather than a fold into [[Generative Preset Development]]. The Concierge gathered the prior art (the `house_bass.pdl` recipe and archetype registry in [[Generative Audio Devices]], the perceptual bands and Vital render path in Generative Preset Development, the curated ear set in [[Portamento and Physical Pitch Modeling]], the Technical Diagram Standard's signal-flow primitives) and laid these bones: the entry and this scroll. The workshop's catalog and picker page are the working session's, made beside this.

_Left rough:_ the plan is proposed, not agreed; the reference voice is not chosen; no card exists yet.
<!-- /scroll:entry -->
<!-- scroll:making:end -->
