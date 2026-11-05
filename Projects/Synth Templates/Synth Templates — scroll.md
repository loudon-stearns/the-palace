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

> _Regenerated 2026-11-05T16:05:25.658Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 2 · last ran 2026-11-05 (today)
- **Plan:** agreed (no dated change on the trail yet)
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-05 (today) — The house bass is now a real Vital preset, played in Vital beside our reference: the pluck matches as mapped, and the release needed about twice as long. (`synth-templates-steward-006`)
- **Last commit touching this project:** 2026-11-05 `a1bad80f` — steward(Synth Templates): cycle 1 — SPINNING UP. HOME: [Synth Templates](obsidian://open?vault=The%20Palace…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-05 — cycle 2 · taught item 2
- **Owed in the ledger:** nothing
- **Latest lesson:** item 2, from cycle 2 — 2026-11-05 — [[Synth Templates — tuning]]

### Where this stands

Synth Templates is a catalog of starting presets that teach synthesis, built as a website where each card plays on the project's own neutral voice. The last step on the plan is to prove the house bass on three real synths (Vital, Serum and Ableton Wavetable) and have you hear it. Last cycle wrote down where each house-bass setting lives on those three synths, all from memory. This cycle turned the Vital column into a real preset file, played it in Vital on this Mac, and measured it against the reference. It's the first time the card has been tried on a real synth, and only by numbers so far. Nobody has heard it.

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since 2026-11-02:** Vital's is now measured, but nobody has heard it. _(in 4 notes, the latest cycle 2)_
- **rough since 2026-11-03:** I drew the square and sine myself rather than picking Vital's Basic Shapes frames, so the 'by eye' row is still untested. _(in 2 notes, the latest cycle 2)_
- **rough since 2026-11-03:** the eleven wordless cards wait on their voice fixes; _(in 2 notes, the latest 2026-11-03)_
- **rough since cycle 1:** None of the three mappings has been tried by ear on a real synth. _(in 2 notes, the latest cycle 2)_
- **rough since cycle 1:** Wavetable's mono switch, sub and filter circuit are still from the manual. _(in 2 notes, the latest cycle 2)_

### Open asks

- `synth-templates-steward-003` — directional_decision · posted 2026-11-05 · options: WAVETABLE-FIRST · VITAL-FIRST · SERUM-FIRST

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-11-05 — cycle 2 · taught item 2
- 2026-11-05 — cycle 1 · taught item 1

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Agreed 2026-11-02.** Loudon: "The plan seems good" and "Yes, both." Drafted by the Concierge on 2026-10-29, redrawn around the site on 2026-11-02 after his words made the website the project's face; agreed as it stands below.

Where this is going: a website generated from the cards, a catalog to choose from and a card page per template that plays at its defaults on the site's own voice, every card provable on a real softsynth against that voice, the house bass first.

1. **Earn the vocabulary by ear.** `workshop/vocabulary.yaml` is where every range word the cards use becomes a number for the reference voice; draft 0.1 is set by reasoning. Loudon sits with the site, plays each word's rung on its own voice, and moves the numbers until the words are true; the ASSUMED mark comes off per table. The sitting happens on the site's Vocabulary page (`#/vocabulary`): one tab per table, a slider and a hear button per word, a ladder per table, and an export that hands the heard numbers back (added 2026-11-02 on his "Yes, both"). The words stay the archetype registry's regions (`instant`, `snappy`, `short`, `long`; `closed`, `dark`, `open`, `bright`; `sub`, `low`, `mid`, `high`…) from `Projects/Generative Audio Devices/pdl-renderer/vcv_fundamental_registry.json`, shared with [[Generative Preset Development]]'s profiles.
2. **Walk the whole catalog in tier order.** Loudon's word, 2026-10-29: "I want to do them all, in your order of tiers." All 292 templates in `workshop/catalog.json`, 19 families, walked tier by tier (157 in tier 1, 110 in tier 2, 25 in tier 3) and tracked in `workshop/picker.html`, the Completeness Tracker, which holds four states per template (todo, drafted, rendered, verified) and a coverage panel per concept. Every concept in his synthesis notes ([[Synthesis Notes (Loudon)]]) maps to at least one template: 93 concepts, each named in the catalog's concept map.
3. **The site: catalog, card page, playable default, all generated from the cards.** `build-site.py` makes one page from the cards, the vocabulary and the sheets: a catalog to choose from, a card page per template with its signal-flow sheet (drawn by `card-to-tikz.py` under the [[Technical Diagram Standard]], with the module glyphs below and the Standing Orders), its essentials and taste with their why in full names, its listening cue and A/B, and a Play the default that sounds the card on the site's own neutral voice, from the keyboard or MIDI. A card is done when it plays on the site.
   - *Module glyphs* (Loudon, 2026-11-01: "we should make it a goal to add in drawings of the Envelopes, Filters, LFOs oscillators and more. Show in the block what is essential about the module, for instance the OSC could show the basic waveform, the filter could show that it is a low pass filter, and envelope shows what category the envelope is (based on my document, is the envelope percussive, sustaining etc...)"). Every block carries a glyph of what is essential about it, drawn by the generator from the card: an oscillator shows one cycle of its waveform (saw, square with its pulse width, triangle, sine, noise); a filter shows its response curve (low-pass, high-pass, band-pass, notch, comb) with the slope and a resonance bump when resonance is essential; an envelope shows its ADSR shape and names its category from [[Synthesis Notes (Loudon)]]: switch, sustaining, percussive (release = decay), piano (release 0), reverse, the funny one; an LFO shows its waveform with a rate word and sync mark; the amp shows level and pan; the mixer shows its input weights. Glyphs are drawn from card fields, never by hand, so they stay consistent across the catalog.
4. **Reference renders from the site's voice.** The same voice, offline, writes each card's WAV with a manifest, a feature sidecar (level, brightness, rise, tail, width) and a spectrogram, after the pattern of `Projects/Portamento and Physical Pitch Modeling/curated-ear-set/`, so the thing a learner hears in the browser and the thing they compare against are one voice.
5. **The comparison page.** On the site: the learner's own render beside the reference, the two spectrograms, the two feature rows, the differences named in the card's own words, a play button for each. Compared by feature and by ear ([[Audition Gate]]), never by null test.
6. **Prove three templates on three synths.** The house bass alone first, on Vital, Serum and Ableton Wavetable, heard by Loudon; then the next two cards, each climbing from the last. Staging per his 2026-10-25 ruling on the Dissolutions proofs: work up to the thing, never start at the end.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
- **Blocks show their essentials** (2026-11-01). Every block on a sheet carries a glyph of what is essential about its module, drawn by the generator from the card, never by hand: the oscillator its waveform, the filter its response, the envelope its shape and its category from [[Synthesis Notes (Loudon)]], the LFO its waveform and rate. The full list is under Plan move 3.
- **No angled lines** (2026-11-02). Loudon: "whenever you have an angled line, ask if it is needed, avoid angles unless necessary." As the generator holds it: every wire is orthogonal, horizontal and vertical runs only; an angle is allowed only where a straight run is impossible, and then it is asked about before it is drawn.
- **Modulators before what they modulate** (2026-11-02). Loudon: "make it a standard, when possible to have the modulators be in a column before what they modulate, that makes the cables clean and orderly. start The main audio modules one column to the right, this way when modulating the oscillators you can line up the modules the way I am describing." As the generator holds it: the audio row starts one column in, so column 0 is free for modulators of the oscillators; each modulator sits in the column before its first target when possible; a second modulator on the same target shifts right.
- **A sound starts on the press and ends on the lift** (2026-11-02). Loudon: "can you change the button action so the note starts when I push the button, like a piano note would?" Every control on the site that makes a sound fires on mousedown or touchstart, not on the click's release; the click that follows is swallowed; a keyboard-driven click, which has no press, still sounds. Where the sound has a release, the lift of the button is the note off: the release phase begins when the finger comes up, and a percussive shape that ends itself ignores the lift (his words below, the same day).
- **The Moog curve is the envelope standard** (2026-11-02). Loudon: "in our default standard Lets go with matching a classic MOOG amp envelope curve. Do some research, establish what that curve is, and confirm that we have been using a curve that is close to that for our tests. And if not, lets make it our standard and reset and use it for our tests, and we want 2 tests, the MOOG curve, and linear." As the voice holds it: every envelope stage is an exponential approach to its target, after the Minimoog contour generator's RC shape; a stage's time is its 95 % point (tau = T ÷ 3); a linear curve is kept as the second test; every time word is defined under its curve and sat on each separately.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="synth-templates-steward-006" -->
### 2026-11-05 — cycle 2 — The house bass is now a real Vital preset, played in Vital beside our reference: the pluck matches as mapped, and the release needed about twice as long.
> shipped · first real-synth proof, measured, not yet heard · steward leans you load it in Vital

on-vital.py writes the card's Vital rows as a .vital file. It uses a drawn square for Oscillator 1 and a drawn sine an octave down at half level for Oscillator 2, into Filter 1 (Analog, 24 dB low pass, 300 Hz, resonance 40 %), with Envelope 2 plucking the cutoff 3.5 octaves, and mono. It plays the file in Vital on the same four offbeat eighths the reference plays (after the rhythm fix in my last post) and draws the two sounds' brightness and loudness over time, one line over the other. Then it tries other settings. First the pluck: 8 decay times × 7 depths, 56 renders, scored on brightness. The mapped row (100 ms, 3.5 octaves) already sits at the bottom: 0.384 octaves off, against a best of 0.378. That's too small a gain to move the row. Then the release, scored on loudness: at our 100 ms, Vital's notes die about twice as fast as the reference's. Nearer 180 ms they fall together (loudness shape off by 4.2 dB, down from 11). The reason is in the curves. A Vital stage reaches zero at its time. Ours, the Moog standard, reaches 95 % at its time and keeps ringing. So on Vital a release word needs about 1.8× our number. I've written 180 ms into the card's two Vital envelope rows, with that reason, and the side-by-side sheet now shows it. One difference I didn't chase: Vital comes out about 7 dB quieter at the same velocity, which is level, not shape.

**Artifacts:**
- [reference (black) and Vital (red), brightness above and loudness below, four offbeat notes: the pluck lines overlap, and the tails meet once the release is 180 ms](Projects/Synth Templates/workshop/proofs/2026-11-05-on-vital/house-bass-compare.png)
- [the house bass as a Vital preset; drop it into Vital and play C2](Projects/Synth Templates/workshop/proofs/2026-11-05-on-vital/house-bass.vital)
- [what Vital played, on the reference's schedule (on this Mac, not in git)](Projects/Synth Templates/workshop/proofs/2026-11-05-on-vital/house-bass-vital.wav)
- [both sweeps, every point, and the features side by side](Projects/Synth Templates/workshop/proofs/2026-11-05-on-vital/house-bass-compare.json)
- [builds the preset from the card's Vital rows, renders it in the hosted Vital, compares it, and fits it with --fit](Projects/Synth Templates/workshop/on-vital.py)
- [the card: both Vital envelope rows now say 180 ms release, and why](Projects/Synth Templates/workshop/cards/house-bass.yaml)
- [the three-synth sheet, regenerated with the measured Vital release](Projects/Synth Templates/workshop/proofs/2026-11-05-on-your-synth/house-bass-on-three-synths.html)
- [how to run on-vital.py, what it found, and the load-blip trap](Projects/Synth Templates/workshop/README.md)

_Vital release against the reference's loudness shape (pluck held at the mapped 100 ms, 3.5 octaves)_
| Vital release | loudness shape off by (dB RMS) |
| --- | --- |
| 99 ms (our number) | 11.0 |
| 120 ms | 8.9 |
| 150 ms | 6.2 |
| 180 ms | 4.2 (best) |
| 220 ms | 4.7 |
| 270 ms | 8.0 |
| 330 ms | 11.4 |

_Changed in the workshop:_ README — documents on-vital.py, its two sweeps, the release finding, and the load-blip trap

_Left rough:_ None of the three mappings has been tried by ear on a real synth. Vital's is now measured, but nobody has heard it. I drew the square and sine myself rather than picking Vital's Basic Shapes frames, so the 'by eye' row is still untested. The brightness fit can't get closer than 0.38 octaves because the centroid jitters at the bass's low fundamental. Wavetable's mono switch, sub and filter circuit are still from the manual.

_Next moves named:_ Load house-bass.vital in Vital, play C2 offbeats beside the card's Play the default, and say whether it is that sound. That's the first of the three proofs, and only you can do it. · Meanwhile, without your ears: write the Ableton Wavetable column as a real .adv preset with Generative Preset Development's wavetable writer. Then check the release there, because Wavetable's envelope curve won't be the Moog one either. · Read the ten patterns that name no grid, so every reference matches its words.
<sub>`synth-templates-steward-006` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="synth-templates-steward-005" -->
### 2026-11-05 — cycle 2 — The reference house bass played the wrong rhythm: eight short notes, not four offbeat eighths. Fixed, with 13 cards re-rendered.
> shipped · 13 reference renders corrected · steward leans keep the fix

The card asks for 'offbeat eighths, one bar: rest C2 rest C2 rest C2 rest C2, each a 16th long'. The voice picks the rhythm grid from the first note-length word it finds. It found the '16th' in 'a 16th long', so it played a sixteenth grid: eight notes of 60 ms each, not four offbeat eighths of a sixteenth each. Eleven other cards say 'eighths, each a 16th long' (marimba, pluck, kalimba, pizzicato, music box, steel drum, toy piano, chord stab and others) and had the same fault. The self-oscillating filter card had it with 'quarter notes, each released after a 16th'. Now the voice ignores the length phrases when it picks the grid, but only when another grid word is left, so cards that name no grid ('one hit on beat 1, a 16th long') play as they did before. The fix is in build-site.py, which writes the voice, so the site and the offline renders change together. I re-rendered just those cards and merged them back into the full set. The sanity pass's too-long-or-too-short flags dropped from 35 to 32, and the other flags didn't change. The house bass reference now starts its first note at 0.29 s, on the 'and' of beat one, where the card puts it.

**Artifacts:**
- [the voice's rhythm reader, which now ignores 'a 16th long' when it picks the grid](Projects/Synth Templates/workshop/build-site.py)
- [the voice, regenerated](Projects/Synth Templates/workshop/site/voice.js)
- [the site, rebuilt](Projects/Synth Templates/workshop/site/index.html)
- [the house bass reference spectrogram: four offbeat notes now](Projects/Synth Templates/workshop/renders/house-bass.png)
- [the corrected house bass reference (on this Mac, not in git)](Projects/Synth Templates/workshop/renders/house-bass.wav)
- [the render manifest, with the 13 re-rendered entries merged in](Projects/Synth Templates/workshop/renders/manifest.json)
- [features for all 292 cards; 13 changed](Projects/Synth Templates/workshop/renders/features.json)
- [the sanity pass after the fix: 32 length flags, down from 35](Projects/Synth Templates/workshop/renders/SANITY-2026-11-05.md)
- [pluck, re-rendered](Projects/Synth Templates/workshop/renders/pluck.png)
- [marimba, re-rendered](Projects/Synth Templates/workshop/renders/marimba.png)
- [kalimba, re-rendered](Projects/Synth Templates/workshop/renders/kalimba.png)
- [pizzicato, re-rendered](Projects/Synth Templates/workshop/renders/pizzicato.png)
- [music box, re-rendered](Projects/Synth Templates/workshop/renders/music-box.png)
- [steel drum, re-rendered](Projects/Synth Templates/workshop/renders/steel-drum.png)
- [toy piano, re-rendered](Projects/Synth Templates/workshop/renders/toy-piano.png)
- [chord stab, re-rendered](Projects/Synth Templates/workshop/renders/chord-stab.png)
- [CC decay on percussive, re-rendered](Projects/Synth Templates/workshop/renders/cc-decay-on-percussive.png)
- [envelope follower delay, re-rendered](Projects/Synth Templates/workshop/renders/envelope-follower-delay.png)
- [NES triangle bass, re-rendered](Projects/Synth Templates/workshop/renders/triangle-bass-nes.png)
- [wavetable chip, re-rendered](Projects/Synth Templates/workshop/renders/wavetable-chip.png)

_Changed in the workshop:_ README — records the rhythm-grid fix and how the 13 re-renders were merged, so the next worker knows the set was partly re-rendered

_Left rough:_ Ten cards that name no grid ('four strikes, one per beat, each a sixteenth long', 'one hit on beat 1, a 16th long') still play a sixteenth grid that doesn't match their words. Their patterns need a reader of their own. Nobody has listened to the 13 re-renders.

_Next moves named:_ Read the ten no-grid patterns properly ('one per beat', 'on beat 1', 'beats 1, 2 and 3') so their references match their words. · Measure the house bass on Vital against the corrected reference (the next post).
<sub>`synth-templates-steward-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-de87b425a3" -->
### 2026-11-05 — cycle 2

taught item 2
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="synth-templates-steward-002" -->
### 2026-11-05 — cycle 1 — The house bass card now shows where each setting lives on Vital, Serum and Ableton Wavetable, and what to set it to, with how sure I am of each row.
> shipped · 11 settings × 3 synths · not yet checked on any synth · steward leans Wavetable first

**What's new.** The house bass card (`cards/house-bass.yaml`) now has a `mappings` section with one list per synth. Each row names the control in that synth's own words, says what to set it to in its own units, and marks how sure I am. *Exact* is a number or switch you set as written. *Start here, finish by ear* is a starting point you finish by listening. *By eye* means picking a frame or shape on the synth's display. *From the manual* means I haven't seen it on this Mac. The card page shows this as **On your synth**, one tab per synth, between Listening and Compare yours, so a learner goes straight from programming it to comparing it. `on-your-synth.py` writes the same rows as one standalone sheet with the three synths side by side ([the sheet](open:Projects/Synth Templates/workshop/proofs/2026-11-05-on-your-synth/house-bass-on-three-synths.html)).

**Where the numbers come from.** They come from the vocabulary file, and the time words are the ones you set by ear. 'Dark' cutoff is 300 Hz on all three synths. 'Generous' envelope amount is 3.5 octaves, so the pluck peaks near 3.4 kHz. Times are 0 ms, 100 ms, 0 % and 100 ms for the pluck, and 15 ms, 575 ms, 70 % and 100 ms for the amp. Each synth times and curves its envelope stages its own way, so every time is a starting point to match by ear, not a millisecond to copy. Resonance is the weakest row. The project's 'moderate' is a filter Q of 4, and no synth shows Q, so the row describes the sound you're after ('a clear vowel, short of a whistle') and gives a starting point.

**The Rack fix.** Generative Audio Devices found that the Rack parts list had the mixer's audio and control inputs swapped. I re-made `pdl/house-bass.vcv`. The square now goes into mixer input 1 and the sub into input 2, where before they went into the control inputs (jacks 5 and 6). It has 12 cables, no warnings and nothing skipped. It's the only Rack file this project has made.

**Artifacts:**
- [the side-by-side sheet: every house-bass setting on Vital, Serum and Ableton Wavetable](Projects/Synth Templates/workshop/proofs/2026-11-05-on-your-synth/house-bass-on-three-synths.png)
- [the same sheet, live, generated from the card](Projects/Synth Templates/workshop/proofs/2026-11-05-on-your-synth/house-bass-on-three-synths.html)
- [the new On your synth section on the card page, Vital tab open](Projects/Synth Templates/workshop/proofs/2026-11-05-on-your-synth/house-bass-on-vital.png)
- [the card, with its mappings section filled in for three synths](Projects/Synth Templates/workshop/cards/house-bass.yaml)
- [writes any card's mappings as a standalone side-by-side sheet](Projects/Synth Templates/workshop/on-your-synth.py)
- [the card page's On your synth section, one tab per synth](Projects/Synth Templates/workshop/build-site.py)
- [the site, rebuilt](Projects/Synth Templates/workshop/site/index.html)
- [the house bass Rack patch, re-made after the mixer fix: both oscillators now go into the mixer's audio inputs](Projects/Synth Templates/workshop/pdl/house-bass.vcv)
- [the workshop's front door, now describing mappings and on-your-synth.py](Projects/Synth Templates/workshop/README.md)

_How sure each row is, house bass_
| synth | exact | start here, finish by ear | by eye | from the manual |
| --- | --- | --- | --- | --- |
| Vital 1.5 | 4 | 5 | 2 | 0 |
| Serum | 4 | 5 | 1 | 0 |
| Ableton Wavetable | 1 | 5 | 1 | 3 |

_Changed in the workshop:_ README — documents the card's mappings section and on-your-synth.py so the next worker can map the next card

_Left rough:_ None of the three mappings has been tried on a real synth, so the control names and the 'Basic Shapes' frame for the square are from memory. Wavetable's mono switch, sub and filter circuit are marked as read from the manual. The velocity-to-envelope-amount taste route isn't mapped on any synth. The re-made Rack patch hasn't been played in Rack.

_Next moves named:_ Program the house bass from the Wavetable tab in Live, record the pattern, and drop it into Compare yours on the card page. That's the first of the three proofs, and only you can hear it. · Meanwhile, without your ears: write the house bass as an actual Ableton Wavetable preset using Generative Preset Development's preset writer. That would make the Wavetable column a file you load instead of a list you follow. · Once the house bass holds on one synth, map the next two cards the same way. Each one adds a single idea.
<sub>`synth-templates-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-07419c459c" -->
### 2026-11-05 — cycle 1

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="synth-templates-2026-11-03-finish-well" -->
### 2026-11-03 — The finish-well pass: renders normalised, the stale cause rewritten, two cards reworded, the wordless eleven listed

Loudon: "don't get sidetracked completely, make sure we are finishing our current work well, but know this is an eventual goal. use sub agents to preserve your context." So, before the next thing: `render-refs.mjs` normalises a render on write past −1 dBFS (28 scaled, the largest brass-pad at −6.17 dB, `normalised_db` per render in the manifest); `render-features.py` no longer flags a scaled render for its peak alone, and its stale "playDemo holds a chord 3.5 beats" cause is rewritten to quote the pattern the cue reader could not fully read; two cards now say their filter 2 cutoff and resonance in real words instead of "same as filter1" (serial-extreme-48-db, serial-notch-vs-band-pass-tug; re-validated, re-rendered); `workshop/_swarm/WORDLESS-2026-11-03.md` lists the eleven cards whose word is right while the voice reads the wrong table, with the voice fix each needs. Sanity flags 74 → 56: clipping 28 → 10, vocab 13 → 11, length 35 and silent 7 unchanged.

_Left rough:_ the eleven wordless cards wait on their voice fixes; the seven silent cards on the routing decision.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-comparison-page" -->
### 2026-11-03 — Plan move 5: the comparison page (Loudon: "Yes, comparison page")

Asked whether to build the comparison page on the site first, as the plugin's proving ground, Loudon: "Yes, comparison page." `build-site.py` now also writes `site/compare.js`: an analyser with the same features as `render-features.py`, matched to the Python numbers on house-bass and supersaw-pad to within rounding, an FFT and a log-frequency spectrogram on canvas. Every card page gets Compare yours under Listening: Render ours renders the default pattern offline in the browser with the same voice (OfflineAudioContext, compressor on, then the live context handed back so the keys still work), measures it, draws its spectrogram and plays it; Yours takes a WAV by choose or drop, or records the input for `length_s` + 2 s after a 3-2-1 count; both trimmed at −50 dBFS; the report grades only the essentials, in the card's words, card / ours / yours / verdict, the verdict naming the block and parameter to move; peak, RMS and crest differences in dB as measurements, not grades; then the one question, "How does it sound to you beside ours?", with a notes box saved per card in the browser. Compared by feature and by ear, never by null test ([[Audition Gate]]). Checked in the browser: on House Bass with an acid-bass render dropped in as "yours", it read saw against square, high against moderate resonance, a slower filter attack, and matched the amp attack; the live context came back and the page played after. The record path is not yet tried with a real input.

_Left rough, the eventual goal in his words:_ "a custom VST that is designed to TEACH synthesis through these presets and challenges students to re-create the patch in their own plugins and compare the output to ours … an audio effect that receives the output of another VST and assess how well they re-created the preset." This page is its proving ground; the plugin is the same comparator with a MIDI output and an audio input. Not on the plan yet, by his own word not to get sidetracked.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-voice-fixes" -->
### 2026-11-03 — The two voice fixes: the pattern honoured, chords scaled (Loudon: "Yes, fix both")

Asked whether to fix the voice to honour each card's render pattern and scale chords by voice count, Loudon: "Yes, fix both." `build-site.py` (and so `site/voice.js` and the page) gains `readPattern(c)`, which reads a card's render spec as prose cues, the note unit (sixteenths, eighths, quarters, half, whole), bars, "held N bars / beats / seconds", twice, the last held or left to ring, arpeggio up and down, tied or slide, staccato, rests, four on the floor, with `length_s` bounding the whole (a hold with no stated length fills `length_s` less the release tail; a sequence with no stated bars fills as many as fit), and `playDemo` plays a held chord, a held note, hits, an arpeggiated line or a mono line from that reading; and `polyGain()`, which scales a chord's voices by 1/√n, set while scheduling a chord and from the held count in live playing, applied to the amp level at note on. Checked in the browser: oberheim-pad holds two bars inside its 7 s, rimshot fills its 2 s, minimoog-lead runs 3.75 of 4 s. All 292 re-rendered; the sanity pass fell from 213 flagged to 74: length 157 → 35, clipping 84 → 28, silent 7 and vocab 13 unchanged. What remains under length is prose the cue reader cannot parse ("one bar: a half note, then three eighths with a rest", "three notes a bar each") and long effect tails; under clipping, two full-level sources summing a few dB over 0 dBFS, which the page's compressor holds and the offline render bypasses.

_Left rough:_ `render-features.py`'s "likely cause" text still says "playDemo holds a chord 3.5 beats" on the length rows; stale now, to tidy next pass. The seven silent and thirteen wordless cards stand.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-cards-to-pdl" -->
### 2026-11-03 — A cross-project find: every card emits PDL, and the house bass reaches VCV Rack

Under the same "move forward where possible": `workshop/card-to-pdl.py` turns a card into [[Generative Audio Devices]]' Patch Description Language, card words through the vocabulary's numbers onto Fundamental knob curves, and `pdl/<id>.pdl` exists for all 292. `pdl/COVERAGE.md` counts what mapped: blocks 88 %, audio edges 82 %, modulation routes 83 %; 68 cards map completely; what cannot map is the effects chains, unison and detune, noise, more than one cable per jack, and the envelope-amount and LFO-depth jacks the Fundamental registry does not have. `pdl/emit-vcv.cjs` runs the renderer's own `emitVcvJson` from Node with no browser, Generative Audio Devices itself untouched, and `pdl/house-bass.vcv` is a valid patch, nine modules and twelve cables, not yet opened in Rack. It differs from the hand-written `house_bass.pdl` by the octave transposition, the added sub and mixer, and knob values from the vocabulary rather than by ear. The entry now carries `connects-to` [[Generative Audio Devices]] (cards-emit-pdl) beside its `emerged-from`; the GAD scroll has a short line.

_Left rough:_ no patch opened in Rack yet; the unmappable list is the registry's shape, not the cards'.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-reference-renders" -->
### 2026-11-03 — Plan move 4 begun: reference renders from the site's own voice, offline

Under Loudon's "move forward where possible." `build-site.py` now writes the voice out as `site/voice.js`, loaded by the page with a script tag and imported by Node; it is wrapped in one scope after a first cut collided with the page's VOCAB, caught in the browser. `workshop/render-refs.mjs` renders every card's default pattern through node-web-audio-api's OfflineAudioContext into `renders/<id>.wav` (48 kHz, 16-bit stereo, 223 MB, ignored by git), and `render-features.py` writes `renders/features.json` (peak, RMS, crest, centroid, rise, tail, width, duration), a spectrogram PNG per card (292, committed) and `renders/SANITY-2026-11-03.md`. `renders/manifest.json` names two node-web-audio-api bugs worked around: its DynamicsCompressor runs away on fast onsets, so the offline master compressor is bypassed and peaks run up to about 6 dB hotter than the page; and setTargetAtTime after cancelAndHoldAtTime explodes, so the offline release holds a closed-form value. The sanity pass flags 213 of 292: 157 for length (the voice ignores `render.pattern` and `render.length_s`, playing a chord 3.5 beats, a note as four hits, a mono line as sixteenths), 84 for clipping (polyphonic sums are not scaled by note count; banjo peaks +12.6 dBFS raw), 13 for vocabulary words with no number (amount "a fifth", cutoff "keytracked", fm_index "off", pitch_amount "little"), 7 silent (feedback-fm, self-oscillating-filter-as-oscillator, and five two-filter cards whose series chain closes: parallel-flexible-notch-with-horns, parallel-twin-peaks, serial-bring-out-the-noise, formant-vowels, vocal-formant-lead).

_Left rough, for Loudon:_ the two voice fixes the sanity pass points at, honouring `render.pattern` and `render.length_s`, and scaling chords by voice count, are not done; they change what the site plays, so they wait on his word. The thirteen missing vocabulary words and the seven silent cards are on the same list.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-heard-rise" -->
### 2026-11-03 — The heard rise goes to the palace: D-2026-11-03-HEARDRISE

What the 2026-11-02 matched sitting felt like is now canon in [[Exponential Decay Curvature]] § How the ear takes the rise, with a figure of both curves in decibels (merge `66803aa6`). Loudon's sentence on the two rates: "Like even though it is 'linear' the rise is not linear; it feels like almost two different rates, like it is going up and that at some threshold it jumps to a faster rise. Where when I listen to the Moog one the rise feels like it is a 'straight' line." The entry states the sitting's numbers from `workshop/vocabulary.yaml` draft 0.5 and notes the Moog `time` table has since moved under the 2026-11-03 decay sitting.

_Left rough:_ the bass-versus-treble question (equal-loudness contours), declined as untested; two Weave flags (Blood Compressor, Logarithmic Interface Scaling) drafted, not posted, awaiting Loudon's read.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-without-me" -->
### 2026-11-03 — Three small moves without him: the tracker's floor, negative routes labelled, the warnings written down

Loudon: "what can you do without me … move forward where possible." Three things that needed no ruling. The Completeness Tracker (`workshop/build-picker.py`, `picker.html`) now reads each card's `status` from the cards at build time as a floor, so every card shows at least drafted on any machine, and the browser can still raise one to rendered or verified. `card-to-tikz.py` labels a modulation route with `polarity: negative` (or `inverted`) as "− amount" on the sheet, which closes the "nothing draws polarity" gap from the swarm's list; `parallel-flexible-notch-with-horns.yaml` had `invert: true` and was normalised to `polarity: negative`; six cards re-rendered (keytracked-decay, inverted-filter-envelope, parallel-flexible-notch-with-horns and velocity-attack-negative changed in sheet and preview; steel-drum and trumpet only in their preview PNGs, their sheets unchanged). The twenty validator warnings on main are written down in `workshop/_swarm/WARNINGS-2026-11-03.txt`, each deliberate per its family agent. `build-site.py` and `site/` untouched; another agent is at work there.

_Left rough:_ the rest of the swarm's gap list and the three questions for him stand.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-swarm-landed" -->
### 2026-11-03 — "Merge it": the swarm's drafts landed on main

Loudon: "Merge it." The branch `swarm/synth-templates-cards` (`17e9e298`) landed on main as merge `036dd538`. The lander refused once, because the two tracked scripts had been moved aside and read as deleted; they were restored to their last committed content and the landing then carried the branch's versions over them. The landed tree was checked file for file against the set-aside originals, the `site/sheets` symlink points at `../cards`, nothing under the project is left unsaved, and the worktree and branch are torn down. On main the validator reads 292 ok, 20 warn, 0 FAIL.

_Left rough:_ the gap list and the three questions from the entry below still stand; none of the 287 drafts has been heard.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-swarm-drafts" -->
### 2026-11-03 — Every catalog id has a card: the swarm's drafts (Loudon: "proceed")

Loudon asked whether a swarm of subagents should draft the bulk of the presets now, while his credits are high, and said "proceed." The working session wrote the gate first, `workshop/validate-card.py` (schema, vocabulary words, slot grammar, catalog agreement, stray keys from unquoted commas, and `--render` through the sheet pipeline), then a brief and one catalog slice per family in `workshop/_swarm/`, and ran nineteen family agents at once. Every one of the 292 catalog ids now has a card in `workshop/cards/`, 287 of them new, all `status: drafted`, each with its sheet and preview; the validator passes 292 of 292 with no FAIL (twenty warnings), checked again by the Concierge before this commit. Ten cards had the unquoted-comma bug and were quoted. The site no longer inlines sheets; `site/sheets` links to the cards and the card page loads each as an image; the site is 292 cards and 1.2 MB, and juno-pad and snare were opened in the browser with their sheets and sound. This lands on the branch `swarm/synth-templates-cards`, not on main, for Loudon's review.

_Left rough, the gaps the agents reported, consolidated and not acted on:_ no parallel filter routing or per-source envelope and filter (drums, formants, a layered sub); only one modulation envelope per card; no route polarity drawn (`polarity: negative` is accepted as a row key and nothing draws it); no pitch-amount word under a fifth or over two octaves; no tempo-synced rate words; `time` tops at 5 s and `rate` at 12 Hz; no CC or bend performance input (the wheel stands in); no taste rows on performance inputs; no semitone offset, noise colour, wavetable, granular, phase distortion, ring modulation, arpeggiator or sequencer in the slots; no word tables for delay time, feedback or effect mix; no cutoff word under 300 Hz. _Questions for Loudon:_ the hoover's pitch sweep, up or the catalog's "down"; the sync edge's direction, `[osc1, osc2, sync]` in sync-lead against `[osc2, osc1, sync]` elsewhere; several catalog `mono` cards drafted as `mono legato` (acid-sequence, tb-303-line). And all 287 are drafted, not heard: none has passed the [[Audition Gate]].
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-03-moog-decay-heard" -->
### 2026-11-03 — The Moog time table heard as decay; release taken as the same (Loudon)

Loudon sat the Moog `time` table as decay on the site and exported it. Three rungs moved up from the attack sitting: instant 0.001 → 0.00488 s, short 0.0499 → 0.0986, medium 0.336 → 0.575; fast, slow, long, very slow and very long stayed where the attack sitting put them. He did not sit release; his words: "I feel that decay and release are the same." The table keeps one number per word, so these numbers now stand for each word on every stage, attack included, which means the attack rungs he sat yesterday at the fast end are now a little longer than he heard them. `workshop/vocabulary.yaml` is draft 0.6, the table's comment carrying both dates and his quote; the linear table is unchanged; site rebuilt.

_Left rough:_ the question the 2026-11-02 entry raised is now answered in the direction it feared: a short decay wants more time than a short attack, and with one number per word the decay sitting wins. Whether the words split by stage (`time_attack`, `time_decay`) or the attack learns to live with the decay's numbers is Loudon's call; the linear table has only its attack sitting and no decay.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-linear-matched" -->
### 2026-11-02 — Second sitting: the linear table matched by ear to the Moog table (Loudon)

Loudon exported again. His words: "So I now made linear sound perceptually the same," and, asked to what, "to moog." `workshop/vocabulary.yaml` is draft 0.5. The Moog `time` table, re-sat as attack in the same export: instant 0.001 s, fast 0.0154, short 0.0499, medium 0.336, slow 1.41, long 3.16, very slow 4.18, very long 5; gated not moved. The linear `time_linear` table, sat as attack to sound the same word for word as the Moog table: instant 0.00112, fast 0.01, short 0.0661, medium 0.35, slow 0.9, long 1.6, very slow 2.5, very long 4.4; gated not moved. Worth keeping: at the long end the linear number sits well under the Moog number for the same perceived attack (long 1.6 against 3.16), because the Moog curve spends its last stretch creeping toward full while the ear has already heard the note arrive; at the fast end the two nearly meet. That gap is the first measured difference between the two curves the Standing Order set up as tests. Site rebuilt.

_Left rough:_ decay and release are still unsat on both curves; every other table is still ASSUMED.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-moog-attack-heard" -->
### 2026-11-02 — The Moog time table heard, as attack (Loudon)

Loudon sat the Moog-curve `time` table on the site and exported it; his word for the sitting: "for attack." `workshop/vocabulary.yaml` is draft 0.4: `time`, on the Moog curve, the standard, is HEARD as attack 2026-11-02 with instant 0.001 s, fast 0.00531, short 0.0236, medium 0.127, slow 0.717, long 1.23, very slow 2.28; very long 3.5 and gated 0.05 not moved. `time_linear` keeps his earlier linear-attack sitting unchanged. Both tables now carry a heard attack column and the two differ word for word, the Moog numbers shorter at the fast end and longer at the slow end, which is the comparison the two tests were set up to show. Site rebuilt with the numbers.

_Left rough:_ the decay and release roles of the time words are not yet sat on either curve; every other table is still ASSUMED.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-moog-deposit" -->
### 2026-11-02 — The envelope-curve findings deposited (Loudon)

What this project learned about the Moog contour, the ease-in naming clash and curve shape as a confound on heard time was folded into [[Exponential Decay Curvature]] on Loudon's word ("Id like to fold into Exponential decay curvature"): D-2026-11-02-MOOGCURVE, landed on main as `f5e8769e`, with a reciprocal link back to this project. The earlier entry's left-rough line, that the DH-ADSR manual could not be reached and is not cited, is settled: it was reached today, its sentences verified by three readers from the PDF's text, and the deposit cites it.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-moog-curve" -->
### 2026-11-02 — The Moog curve: research, a mismatch found, the standard set, the time table reset (Loudon)

Loudon: "yes write curves, but I also want to set what our default is. And in our default standard Lets go with matching a classic MOOG amp envelope curve. Do some research, establish what that curve is, and confirm that we have been using a curve that is close to that for our tests. And if not, lets make it our standard and reset and use it for our tests, and we want 2 tests, the MOOG curve, and linear. From those two we will see what envelope times/words are for both." The research, from the web and cited in `workshop/README.md` § Site: the Minimoog Model D contour generator is a comparator-switched RC envelope, every stage an exponential approach; AJH Synth's Dual Contour guide, a replica "with identical all transistor EG circuitry", names "the very fast exponential slope" as what makes the Model D punch; Richard Atkinson's 2014 W3C post gives the comparator mechanism with the Minimoog among its examples. The mismatch: the site's voice had a linear attack and decay with an exponential release, so the attack and decay did not match the standard, and the time numbers Loudon sat were sat on a linear attack. The change: `build-site.py`'s amplitude envelopes now follow the Moog curve, `setTargetAtTime` per stage with tau = T ÷ 3 so a stage's time is its 95 % point (filter-frequency ramps unchanged, exponential in Hz); the vocabulary page has two time tabs, `time · moog` and `time · linear`, each with the attack, decay and release modes, the demos drawing the matching curve. `workshop/vocabulary.yaml` is draft 0.3: an ENVELOPE CURVES section in the header; the `time` table is the Moog table, reset to the draft numbers and marked ASSUMED; a new `time_linear` table holds his heard numbers unchanged (instant 0.00167 … very slow 2.3), HEARD as attack 2026-11-02 with the note that the voice was linear when he sat them, so his work keeps its truth under the curve it was heard on. The browser's stored numbers moved to a v2 key with a migration carrying old time numbers into time_linear. Measured by the working session: a 3 s Moog attack reaches about 0.64 of full at about 1 s and flattens toward the top; the linear one rises straight. The rule is the fifth Standing Order above.

_Left rough:_ the Moog time table is unheard; the DH-ADSR manual's own sentence on the attack shape, quoted in the working session, could not be reached by the Concierge and is not cited; a practical minimum attack of about 1 ms is reported but unverified and left out.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-time-heard" -->
### 2026-11-02 — First heard table: time, as attack (Loudon)

Loudon: "I set the parameters for envelope attack time, please record those numbers." His Export vocabulary.yaml arrived and `workshop/vocabulary.yaml` is draft 0.2. The time table carries his numbers, sat by ear on the site as attack times: instant 0.00167 s, fast 0.0108, short 0.037, medium 0.11, slow 0.256, long 0.974, very slow 2.3; very long 3.5 and gated 0.05 were not moved. The table is marked HEARD as attack 2026-11-02; every other table is still ASSUMED, and the header now says what the two marks mean. His export also exposed a bug: the level table's `off` key was read by YAML as the boolean false (it came back as `false: 0`), so the word never resolved; it is now quoted. The site carries the heard numbers (its rebuild rode into `97f49fc8`, the mode-button commit, a few minutes before this one).

_Left rough:_ the same time words serve decay and release, and they were sat as attacks only. "short" at 37 ms is a quick attack but may be too short for a short decay, so the decay and release roles want their own sitting, and the table may split if they disagree. The first entry in the HEARD column is also the first [[Audition Gate]] pass on the vocabulary.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-mode-buttons" -->
### 2026-11-02 — The time-mode buttons wired (Loudon)

Loudon: "'as attack' 'as decay' 'as release' buttons don't seem to work." Cause: the edit meant to wire them had replaced a line that an earlier edit had already replaced, so the three buttons were drawn with no listener. `build-site.py` gains the one line that binds them (stop, set the mode, re-render); site rebuilt. He also wrote: "I set the parameters for envelope attack time, please record those numbers." Those numbers are in his browser; the Export vocabulary.yaml button is the way back, and the paste is awaited.

_Left rough:_ his attack-time numbers are not yet in `vocabulary.yaml`; the time table stays ASSUMED until the paste lands.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-silent-sliders" -->
### 2026-11-02 — Sliders are silent (Loudon)

Loudon: "This is working FAR better, next tweak, don't play the sound automatically when I adjust a parameter." `build-site.py` drops the slider's change handler that played the rung; a slider only moves the number, and nothing sounds until a hear button is pressed. Site rebuilt.

_Left rough:_ nothing.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-hear-as-keys" -->
### 2026-11-02 — Hear buttons as keys: the attack on the press, the release on the lift (Loudon)

Loudon: "I am using the 'hear' buttons and they all seem different volumes, or perhaps the note lengths on the long versions aren't long enough to hear the entire envelope. Perhaps we should setup the button to function like a midi note, when I press it the attack phase starts and when I release it the release phase starts." The volume difference was real and had this cause: a long attack never reached full level inside the old fixed hold, so that rung played quieter. `build-site.py` rebuilds the rung demos as press-and-hold voices: `hearOn(table, word)` starts the note and returns a handle whose `off()` lifts the key; every hear button, now "hold to hear", is bound as a key (mousedown/touchstart on, mouseup/mouseleave/touchend off, lit while held); a percussive shape with zero sustain ends itself and ignores the lift; the ladder still runs scripted, one second past each attack; Stop reaches held and released demos alike. Held, every rung reaches the same peak. Measured by the working session: attack/long held 3 s rises .01 → .08 and holds, release/long fades about 1.6 s after letting go, every word in every table plays on and off, the button lights and darkens with the finger, Stop silences a held note. Site rebuilt. The Standing Order "A sound starts on the press" gains its other half, "and ends on the lift".

_Left rough:_ the tables are still ASSUMED until he marks them heard.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-time-modes" -->
### 2026-11-02 — Time demo in three modes; two demo bugs that made the lengths inconsistent (Loudon)

Loudon, sitting with the time table: "I am working on the time one, and I am confused, are we only assessing attack time here? Or also release time and decay time? when I hit 'Hear' the note lengths seem to be inconsistent and I find it confusing." Three causes. The demo applied the word to attack and release at once and held the note for a length that grew with the word, so every rung had a different shape and length; the time table now has three modes chosen above the rows, as attack, as decay, as release, each holding one note length fixed and changing only that stage, and the table says so. A demo's cleanup disconnected the shared node list 300 ms after it fired, cutting off whatever demo had started since, so every hear after a Stop went silent at about 300 ms; each demo's nodes are now captured when scheduled. After that capture, Stop could not reach a running demo; an active-demo list now holds every sounding demo until it ends and Stop stops them all. Measured by the working session on the master bus: each mode isolates its stage (attack/long rises over about 2 s, instant is flat; decay/instant is a 2 ms click, decay/long falls over about 1.6 s; release/long fades over about 1.6 s after the 0.8 s hold), and Stop silences a running demo at once. Site rebuilt.

_Left rough:_ the time table is still ASSUMED until he marks it heard.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-press" -->
### 2026-11-02 — A sound starts on the press (Loudon)

Loudon: "This may seem small, but can you change the button action so the note starts when I push the button, like a piano note would?" `build-site.py` gains `onPress(el, fn)`: a sounding button fires on mousedown or touchstart and swallows the click that follows, so the sound begins on the press like a piano key; applied to Play the default, every hear button on the vocabulary page and Play the ladder (the keys already worked this way); keyboard-driven clicks still work. Site rebuilt. The rule is the fourth Standing Order above.

_Left rough:_ nothing.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-vocabulary-page" -->
### 2026-11-02 — The vocabulary page: move 1 has its instrument (Loudon: Yes, both)

The second half of Loudon's "Yes, both." The site gained a Vocabulary page at `#/vocabulary`, linked from the catalog toolbar: twelve tabs, one per table in `workshop/vocabulary.yaml` (time, level, cutoff, resonance, amount, pitch amount, detune, rate, glide, drive, fm index, reverb); each says what it controls and how its demo exposes the word, then one row per word with a slider, the value in units and a hear button. The demo isolates the one word on a plain saw, low-pass, amp patch (a kick-shaped sine for pitch amount, a seven-saw stack for detune, 1:1 FM for the index, C2 sliding to G2 for glide). Play the ladder runs a table in order; a moved slider plays at once and is held in the browser, and the card voices use it, so every card sounds with his tuned numbers; a checkbox marks a table heard; Export vocabulary.yaml copies the whole file with each table HEARD or ASSUMED for him to paste back; Reset this table undoes. Tested by the working session: all twelve tables, every word plays with signal, a slider edit changes the value, the export and the stored copy. Site rebuilt. **Plan change, logged here:** move 1 gained one sentence naming this page as where the sitting happens; the aim and the rest of the move are as agreed.

_Left rough:_ every table is still ASSUMED until he sits.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-plan-agreed" -->
### 2026-11-02 — The plan agreed, redrawn around the site (Loudon)

Loudon: "The plan seems good" and, asked to agree the revised plan and strike PROPOSED and to build the vocabulary page, "Yes, both." The Plan above is now agreed, in the revision drafted on 2026-11-02 after his words made the website the project's face. What changed and why: move 1 keeps its aim, the vocabulary, and gains its artifact, `workshop/vocabulary.yaml`, earned by ear against the site's own voice rather than on paper; move 2 is unchanged; moves 3 and 4 of the proposed plan, the sheets and the reference voice, became one move, the site, generated from the cards, with the module-glyph sub-goal carried under it, because the sheet and the voice now reach a learner through one page; the render pipeline is now move 4, drawing its WAVs from the site's voice so what is heard and what is compared against are one voice; move 5, the comparison sheet, is a page on the site, which commits the site to taking a learner's own render in, a rider named to him and not refused; move 6 is unchanged. The PROPOSED line is struck.

_Left rough:_ nothing on the plan; the vocabulary page is being built in the workshop as this is written.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-full-names-sheet" -->
### 2026-11-02 — Full names on the sheet (Loudon)

Loudon, asked whether the sheet's block titles should match the tables: "Full names on sheet." `card-to-tikz.py` now titles every block in full, OSCILLATOR 1, SUB OSCILLATOR, NOISE OSCILLATOR, MIXER, FILTER 1, AMPLIFIER, EFFECTS, FILTER ENVELOPE, AMPLITUDE ENVELOPE, LFO 1, KEYBOARD, VELOCITY, MOD WHEEL, AFTERTOUCH, and names the modulation envelope for its role, PITCH ENVELOPE on the kick, INDEX ENVELOPE on the electric piano; the mixer's jack labels are full too. Blocks widened from 2.4 to 3.0 cm and the column pitch from 3.8 to 4.4 cm to carry the words, the title face one step smaller, glyphs and mixer bars moved right to fit. Fifteen sheet files regenerated and the site rebuilt; cards unchanged. The open question in the entry before this is answered.

_Left rough:_ the Plan is still proposed; the revision drafted on 2026-11-02 waits on him.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-midi-reviews-release" -->
### 2026-11-02 — Site revised on Loudon's read: MIDI, reviews, full parameter names, the release click found twice

Loudon: "no note names on the keyboard, it should respond to MIDI, I need the ability to review the pages so we can fine tune each. In the bottom of the pages, don't shorten names of modulators: 'Amplitude envelope', 'filter envelope' this will help the student internalize the parameter names. Same goes for envelope stages: Decay time, and Sustain level instead of decay and sustain, so that we are very aware of what we are changing. One more thing, in the sub bass, when I release a note there is a click, are you calculating release properly?" `build-site.py`: keys without names; Web MIDI in, with a status line; a Review box per card saved in the browser and an Export reviews button on the catalog; every block and parameter named in full in the tables. The click had two causes. The release was a linear ramp restarted from the parameter's read value, which can step; it is now cancelAndHold and setTargetAtTime with a time constant of release ÷ 3, the oscillators stopping after two release lengths, and House Bass measured falling smoothly from .26 to 0 over about 150 ms, largest step .06. And the card itself put the sub two octaves under the played note, 16 Hz at C2, where a 120 ms fade is under two cycles and lands as a thump; `house-bass.yaml` now has Oscillator 1 at the played pitch and the sub one octave down (the lineage line to `house_bass.pdl`, which used −12, is unchanged), sheet regenerated. Site regenerated.

_Left rough:_ **a question for Loudon:** the sheet's block titles are still short (FILTER ENV, AMP ENV, MIX) while the tables now say Filter envelope, Amplitude envelope, Mixer; should the sheet carry the full names too? The Plan is still proposed; the revision drafted on 2026-11-02 waits on him.
<!-- /scroll:entry -->
<!-- scroll:entry id="synth-templates-2026-11-02-site" -->
### 2026-11-02 — The site: catalog → card → playable default (Loudon); vocabulary draft 0.1 begun

Loudon: "I'd like to make this as a fully useable interactive website, we have a catalog we can choose from, pick one preset from the catalog and we see the card/page, it is playable in default settings." A prototype exists: `workshop/build-site.py` writes `workshop/site/index.html`, one file on Drafting Table paper, a catalog view of all 292 rows with the five carded ones badged, and a card page per card with Play the default, a two-octave keyboard, the sheet inline, the essentials and taste with their why, cue, A/B, concepts, lineage and render spec. The reference voice is vanilla Web Audio reading the card's graph (sources, mixer levels, biquad filter stages by slope, envelopes, FM through the jack-named edge, LFO, fx chain, glide, one-shot drums). `workshop/vocabulary.yaml`, draft 0.1, is where every range word becomes a number for that voice; its header says ASSUMED, numbers by reasoning, not yet by ear, so Plan move 1 has its artifact but is not done. Tested in the browser: every card page renders, Play runs on every card and makes signal (master RMS: kick .33, acid .16, piano .77, house .30, pad .40); the piano is hot because `fm_index: half` is 3. A `synth-templates` launch entry serves `site/` on 8230.

_Left rough:_ the vocabulary is unheard; the FM index word is too strong; the Plan is still proposed, and a revision has been drafted for Loudon that makes the site the project's face.
<!-- /scroll:entry -->
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
