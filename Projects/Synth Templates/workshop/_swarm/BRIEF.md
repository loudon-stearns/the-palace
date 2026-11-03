# Brief: draft the cards of one family

You are drafting synth template cards for the Synth Templates project. One family, every template in it that has no card yet. Your output is YAML files in `cards/`, each one passing `validate-card.py --render` with no ERROR. Nothing else: do not edit any other file in the workshop, do not touch git.

Working directory: `/Users/loudonstearns/Documents/The Palace/Projects/Synth Templates/workshop`. All paths below are relative to it.

## Read first, in this order

1. `cards/house-bass.yaml`, `cards/supersaw-pad.yaml`, `cards/808-kick.yaml`, `cards/acid-bass.yaml`, `cards/fm-electric-piano.yaml`: the five finished cards. They are the style. Match their shape, their density, and the register of their `why` strings and listening text: plain words, concrete, no hype.
2. `validate-card.py`: read the rules it enforces; they are the schema. The tables at the top list every slot, kind, wave, filter type, jack and which vocabulary table each parameter's words come from.
3. `vocabulary.yaml`: the only words a card may use for times, levels, cutoff, resonance, amounts, detune, rates, glide, drive, FM index, reverb. A card never holds a number for these. (Oscillator `octave`, `unison`, `pw`, `ratio`, filter `slope` and render fields are numbers.)
4. Your family's slice, `_swarm/<family>.md`: the catalog line for each card (id, name, tier, mode, classics, essentials, what it teaches, the concepts it must list). The card's `id`, `name`, `family`, `tier` must equal the catalog's; `concepts` must include every concept the slice lists, and may add others from `catalog.json` `concepts[].name` when the card really teaches them.
5. `../../../Synthesis Notes (Loudon)/Synthesis Notes (Loudon) — source — notes-text.txt`: Loudon's synthesis notes. When a card teaches a concept, read the notes' passage on it and let the card's essentials and `why` say what the notes say. Quote nothing; absorb it.

## The grammar of a card

- `graph.blocks` uses the fixed slot ids only: sources `osc1 osc2 sub noise`, chain `mix filter1 filter2 amp fx`, modulators `lfo1 fenv menv aenv lfo2`. Performance inputs `key vel wheel at` are not blocks; they appear only as `from` in modulation. Only the blocks the sound needs; no ghosts.
- `graph.audio` runs left to right in slot order and ends at `out` once. Two or more sources into the chain need `mix`. An oscillator that modulates another oscillator feeds it by audio edge with a jack: `[osc2, osc1, fm]` or `[osc2, osc1, sync]`.
- `graph.modulation`: every envelope and LFO drawn must route somewhere. `fenv` targets a filter, `aenv` targets `amp.level`, `menv` carries a `role` (pitch, index, pw, pan, …) and targets what the role says. Every envelope gets `key → <env>.gate`. Every card has `aenv`; a drum gets `one_shot: true`. Every pitched card routes `key → osc.pitch` for each oscillator.
- Envelope `shape` is four words, `{a, d, s, r}`, from the `time` and `level` tables (`r` may be `same as decay`), with a `category` from Loudon's notes: `percussive`, `sustaining`, `piano`, `swell`, `gate`, `plucked`, `struck`, `bowed`, `reverse`, `organ`, `pad`, `string`.
- `essentials`: the settings that make this sound this sound, each with a `why` wherever the reason is not obvious. Change one and it is a different template. Include `mode` (`{block: mode, param: voices, value: poly}`) when it matters.
- `taste`: what the player moves, as `range: "low – high"` (an en dash) and a `default` that is a word from the right table. Three to eight rows.
- `listening.cue`: what to listen for, one to three sentences. `listening.ab`: one change that breaks it and putting it back, so a student hears the essential by its absence.
- `render`: tempo, note (one, or a list for a chord), velocity (one or a list), pattern as a sentence, `length_s`.
- `lineage` is optional; `mappings: {}`.
- YAML gotcha: quote `on`, `off`, `yes`, `no` when they are words (`value: "on"`).

## What the voice can play

The site's reference voice reads the card. It plays: saw, square, pulse, triangle, sine, noise; unison with detune; octave; FM by an audio edge into `fm` (sync is approximated as FM); lowpass, highpass, bandpass, notch (comb is drawn only) with slope 12/18/24/48 and resonance; `fenv → filter.cutoff` with `amount` in octaves and `vel → fenv.amount` as accent; `aenv → amp.level`; `menv → osc.pitch` with a `pitch_amount` word; `menv → osc2.level` as an FM index envelope; LFO to filter cutoff, amp level, amp pan, osc pitch with a `depth` taste row; fx chain chorus, reverb, delay/echo, saturation/drive/distortion; mono, poly, mono legato with glide. Anything beyond that (ring mod, sample and hold, filter FM, pan envelopes, arpeggiation, sequencing) still goes on the card, since the card is the truth and the diagram draws it; the validator warns, it does not fail. Say in a `note:` on the block what the voice cannot yet do.

## Working method

For each card in your slice, in tier order:

1. Write `cards/<id>.yaml`.
2. Run `python3 validate-card.py --render cards/<id>.yaml`. Fix every ERROR. Read the warnings and fix the ones that are mistakes.
3. Look at `cards/<id>-preview-1.png` once. If a block's settings text collides or a wire crosses a block, simplify the card (fewer taste rows on that block, or reorder); do not edit the generator.

Rendering runs pdflatex in `cards/`; other agents are rendering other families beside you, which is fine because filenames differ. Never delete or rename a file you did not create.

When every card passes, run the validator over all your cards at once and paste its output at the end of your report. Report: the list of ids written, any card where you were unsure of the right essentials and why, and any gap in the grammar or vocabulary you had to work around (a word that did not exist, a routing the slots could not express). Keep the report under 400 words.
