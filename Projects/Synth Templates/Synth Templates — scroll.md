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
   - *Module glyphs* (Loudon, 2026-11-01: "we should make it a goal to add in drawings of the Envelopes, Filters, LFOs oscillators and more. Show in the block what is essential about the module, for instance the OSC could show the basic waveform, the filter could show that it is a low pass filter, and envelope shows what category the envelope is (based on my document, is the envelope percussive, sustaining etc...)"). Every block carries a glyph of what is essential about it, drawn by the generator from the card: an oscillator shows one cycle of its waveform (saw, square with its pulse width, triangle, sine, noise); a filter shows its response curve (low-pass, high-pass, band-pass, notch, comb) with the slope and a resonance bump when resonance is essential; an envelope shows its ADSR shape and names its category from [[Synthesis Notes (Loudon)]]: switch, sustaining, percussive (release = decay), piano (release 0), reverse, the funny one; an LFO shows its waveform with a rate word and sync mark; the amp shows level and pan; the mixer shows its input weights. Glyphs are drawn from card fields, never by hand, so they stay consistent across the catalog.
4. **A neutral reference voice and its render pipeline.** A fully controlled subtractive voice the project owns (SimpleSynth from [[VST Template]] is a candidate; a Python or Web Audio voice is the other), rendering every card to a WAV with a manifest, a feature sidecar (level, brightness, rise, tail, width) and a spectrogram, after the pattern of `Projects/Portamento and Physical Pitch Modeling/curated-ear-set/`.
5. **A comparison sheet.** The learner's render beside the reference: the two spectrograms, the two feature rows, the differences named in the card's own words, and a play button for each. Compared by feature and by ear ([[Audition Gate]]), never by null test.
6. **Prove three templates on three synths.** The house bass alone first, on Vital, Serum and Ableton Wavetable, heard by Loudon; then the next two cards, each climbing from the last. Staging per his 2026-10-25 ruling on the Dissolutions proofs: work up to the thing, never start at the end.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
- **Blocks show their essentials** (2026-11-01). Every block on a sheet carries a glyph of what is essential about its module, drawn by the generator from the card, never by hand: the oscillator its waveform, the filter its response, the envelope its shape and its category from [[Synthesis Notes (Loudon)]], the LFO its waveform and rate. The full list is under Plan move 3.
- **No angled lines** (2026-11-02). Loudon: "whenever you have an angled line, ask if it is needed, avoid angles unless necessary." As the generator holds it: every wire is orthogonal, horizontal and vertical runs only; an angle is allowed only where a straight run is impossible, and then it is asked about before it is drawn.
- **Modulators before what they modulate** (2026-11-02). Loudon: "make it a standard, when possible to have the modulators be in a column before what they modulate, that makes the cables clean and orderly. start The main audio modules one column to the right, this way when modulating the oscillators you can line up the modules the way I am describing." As the generator holds it: the audio row starts one column in, so column 0 is free for modulators of the oscillators; each modulator sits in the column before its first target when possible; a second modulator on the same target shifts right.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="synth-templates-2026-11-02-acid-fm-routes" -->
### 2026-11-02 — Cards four and five, Acid Bass and FM Electric Piano; cable routes simplified (Loudon)

Loudon: "ok, do two more, when possible reduce the number of turns in a cable, simplify the paths." `card-to-tikz.py` now routes a modulation wire in three segments (out, across to the gutter, up or down, in) whenever the gutter lies ahead and no block stands across the run, and falls back to the five-segment bus only to go around or back; an audio edge may name the jack it enters, and a jack so named is added to the block; an oscillator that only feeds another oscillator counts as a modulator and takes column 0 beside its target. Card four, `workshop/cards/acid-bass.yaml` (tier 2, mono legato, after the TB-303): saw with legato glide, 18 dB low-pass with high resonance, a percussive filter envelope on the cutoff with velocity on its amount as the accent, a percussive amp envelope; ten essentials, seven taste, A/B resonance to none and glide to always, a sixteenth pattern with slides and accents to render. Card five, `workshop/cards/fm-electric-piano.yaml` (tier 2, poly, after the DX7's E.PIANO 1): a sine modulator at 1:1 into the carrier's `fm` jack, a percussive MOD ENV on the modulator's level as the index envelope with velocity on its amount, a piano-category AMP ENV, a slow sine LFO on pan, chorus; ten essentials, seven taste, A/B modulator level zero and index decay zero toward an organ. Eight new sheet files; the nine earlier ones regenerated.

_Left rough:_ pan glyph still undrawn (the FM piano's tremolo lands on it); no audio yet; the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-modulators-before" -->
### 2026-11-02 — Modulators before what they modulate (Loudon)

Loudon made it a standard: modulators in the column before what they modulate, and the main audio modules starting one column to the right so an oscillator's modulator has a column to stand in. `card-to-tikz.py` now puts the source stack in column 1 and the chain from column 2; a modulator takes the column before its first target, a second on the same target shifting right; the docstring carries the standard and his date. On the 808 Kick the MOD ENV now stands in column 0 before OSC 1 and the AMP ENV in column 1 before the AMP. Nine sheet files regenerated; cards unchanged. The rule is the third Standing Order above.

_Left rough:_ pan glyph; no audio yet; the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-mixer-rows-lanes" -->
### 2026-11-02 — Mixer as rows; modulation wires in lanes (Loudon)

Loudon: "For the mixer, put the slider levels right below the input it relates to, so if we thought of the module as a series of rows, input 1, level 1, input 2, level 2, etc. When we have multiple modulation signals going to the same module input offset the lines so we never have cables exactly stacked up on each other for long lengths of a run." `card-to-tikz.py` now draws the mixer as rows, a jack row named for the source and a level row beneath it with the bar filled to the level word; the block grows with its inputs, its top stays level with the chain so the first input row is still the straight audio line, and the old side glyph of stacked bars is gone. Every modulation wire has a lane of its own: the k-th wire's drop, bus run and riser sit 0.11 cm × k apart, the layout reserves that depth under each bus, and cables meet only in the last short run into the jack. Nine sheet files regenerated; cards unchanged.

_Left rough:_ pan glyph still undrawn; no audio yet; the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-808-kick" -->
### 2026-11-02 — Third card, 808 Kick; amp fader and effect glyphs (Loudon)

Loudon: "In the amplifier add an image of a vertical mixer fader, and in the chorus, multiple sine waves out of phase with each other, Fix these as you proceed on to the next card." The amp now draws a vertical fader with its cap at the card's `level` word; the FX block draws one glyph per effect in its chain (chorus as three sines 60° apart, reverb as a decaying tail, delay as repeating impulses, saturation as a sine and its clipped copy, phaser or flanger as a ripple). The third card is `workshop/cards/808-kick.yaml`: mono, a retriggered sine straight into the amp, saturation, out, no mixer and no filter; a one-shot percussive MOD ENV drops the pitch about an octave and a one-shot percussive AMP ENV with release equal to decay shapes the hit; ten essentials, six taste ranges, an A/B (pitch envelope amount zero; amp decay short toward a 909). Its lineage is the `kick` archetype in [[Generative Audio Devices]]'s `archetypes.json`, whose constraint is the same: the pitch fall's decay matches the amp decay. Against the Standing Order *Blocks show their essentials*: the fader covers the amp's level, the mixer's bars cover its input weights; pan is not yet drawn. One gotcha found and kept in the README: YAML reads a bare `on` as a boolean.

_Left rough:_ pan glyph; no audio yet; the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-no-angles" -->
### 2026-11-02 — No angled lines

Loudon: "whenever you have an angled line, ask if it is needed, avoid angles unless necessary." The one angle on the sheets was a modulator wire dropping from its out jack to the block's centre line before heading down; it now leaves at the jack's own height. `card-to-tikz.py` says so in its docstring (every wire orthogonal, horizontal and vertical runs only), and the rule is a Standing Order above. Both sheets regenerated; cards unchanged.

_Left rough:_ the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-aligned-audio-line" -->
### 2026-11-02 — Visual revision on Loudon's read: aligned audio line, mixer inputs with levels, modulators one column left of their targets

Loudon: "lets work on the visual a little. The main audio path, oscillators mixer filter amplifier, put the main audio output at the same height in the module as the main audio input. so the audio path is an aligned line from mixer to filter to amplifier. the mixer should take multiple inputs and then have levels for each input. move the amp envelope to the right, below the filter, and the filter envelope under the mixer, this way the lines will not intersect and will be easier to follow." `card-to-tikz.py` now sets every output jack at its audio input's height, the OUT box with it, so mix, filter, amp, fx and out lie on one line; the mixer carries one labelled input jack per source ("osc 1 · full", "sub · half"), the level word read from the card, with a level-bar glyph; each modulator sits one column left of its first target, a second on the same target shifting right; blocks grew from 1.6 to 1.9 cm to hold the glyph under the out jack. Both sheets regenerated; the cards are unchanged.

_Left rough:_ no audio yet; the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-01-supersaw-glyphs" -->
### 2026-11-01 — Second card, Supersaw Pad; module glyphs drawn from schema 0.2 (Loudon: add the graphics as you make them)

Loudon: "Ok, lets make 1 more preset." and "as you make them, also add in the graphics to the modules when appropriate." The second card is `workshop/cards/supersaw-pad.yaml`: poly, two saws (one in seven-voice wide unison, one an octave down), mix, 12 dB low-pass, amp, chorus then reverb; a sustaining amp envelope; a slow triangle LFO on the cutoff as taste, the wheel on its depth; ten essentials with why, nine taste ranges, a listening A/B (unison 1 against 7, detune 0), a held Cm7 for the render. The card schema moved to `synth-template-card/0.2` with typed glyph fields, and House Bass was brought up to it (pulse width on the square, resonance on the filter, shape words and category on both envelopes: filter env percussive, amp env sustaining). `card-to-tikz.py` now draws a glyph in each block's upper right from those fields: waveform cycles, filter response with slope and resonance bump, ADSR polyline with its category as caption, LFO waveform with rate word, FX chain caption. Both sheets regenerated; the tracker's state lives in Loudon's browser and was not touched.

_Left rough:_ neither card is rendered to audio or verified on a synth; the Plan is still proposed.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-01-glyphs-goal" -->
### 2026-11-01 — Module glyphs made a goal (Loudon)

Loudon set a standing goal: each block should draw what is essential about its module, the oscillator its waveform, the filter that it is a low-pass, the envelope its category from his notes. Added as a sub-goal under Plan move 3 and as a Standing Order, with the glyph list per module kind; the envelope categories were checked against the notes (switch, sustaining, pluck/strike with release equal to decay, piano with release zero, reversed, the funny one). Nothing drawn yet; the generator does not read glyphs from the card.

_Left rough:_ the Plan is still proposed; this is an addition he asked for, not agreement to the six moves.
<!-- /scroll:entry -->
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
