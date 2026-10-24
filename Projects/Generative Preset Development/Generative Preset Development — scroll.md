---
title: "Generative Preset Development — scroll"
born: 2026-09-23
links:
  - target: "[[Generative Preset Development]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Generative Preset Development's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Generative Preset Development — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Generative Preset Development]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-24T15:44:56.083Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 9 · last ran 2026-10-24 (today)
- **Plan:** agreed 2026-09-25 (29 days ago) · 4 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (10 days ago) — The analyzer now writes sentences. Nine Wavetable presets are described in a synthesist's words, with the old parameter dump folded under each one for comparison. (`preset-steward-018`)
- **Last commit touching this project:** 2026-10-14 `e0cbca6c` — steward(Generative Preset Development): cycle 8 — SPINNING UP. HOME: [Generative Preset Development](obsidian://open?vaul…
- **Signal:** ⚠ the last cycle posted nothing (one barren cycle — the lane will retry before calling it stalled)
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Generative Preset Development teaches an AI to make, describe and reshape presets for synths with a fixed layout, starting with Ableton Wavetable. Here's what's settled. The preset format is cracked. You confirmed in June that a modified preset loads in Live and sounds as intended. Making presets from a prompt and reshaping them both work, so far on feel-words borrowed from Ableton's factory presets. The step on the plan is still one sitting in Live where your ears set those feel-words, and the kit for it is ready. This cycle did the bonus check that goes with the prompt-to-preset step: describing a known factory preset the way a skilled synthesist would. The analyzer used to print a parame…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 6:** Nothing here has been loaded in Live or heard, so 'distinct' is only a measurement on paper. _(in 2 notes, the latest cycle 7)_

### Open asks

- `preset-steward-014` — directional_decision · posted 2026-10-14 · options: SOLO · TOGETHER · NOT-YET

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** Presets for synthesizers whose architecture is fixed (Ableton Wavetable, Vital, Serum2 and others), made from a plain musical prompt, read back in a synthesist's words, and reshaped on request. Each synth gets a Synth Profile: its preset format, every parameter with named regions of what it sounds like, and its modulation map, which is to a fixed synth what the module vocabulary is to [[Generative Audio Devices]]. Each synth is its own deliverable. On 2026-05-27 Loudon put Ableton Wavetable ahead of Vital, since it is installed and pairs with the wavetable libraries, so Wavetable came first. Its format is cracked and a structural profile is on disk. The write path works: on 2026-06-05 Loudon confirmed that a factory Aqueous Pad with its cutoff pulled down loads in Live and sounds darker. An analyzer now describes a preset in plain synth language, leaving a marker wherever a feel-word hasn't yet been earned by ear.

**The moves ahead**

1. **Label Wavetable by ear.** One sitting in Live to fill the 23 blanks in `ableton-wavetable/profile-draft/perceptual-bands-worksheet.md`: where a cutoff turns from dark to open, where an attack stops being punchy, and so on. Loudon chose this next step on 2026-06-09, and the worksheet carries the recipe for the audition patch. It gives the profile its feel-words, so the analyzer's markers clear and generation stops sounding neutral.
2. **Make Wavetable presets from a prompt, and reshape them.** Generation runs prompt to archetype to seeded parameter values to a loadable preset; modification takes an existing preset and a direction like "darker and more menacing." It passes when "a pad that sounds like light through deep water" yields three presets audibly distinct from each other and from the factory defaults, each recognizably that pad. A bonus is the analyzer describing a known factory preset the way a skilled synthesist would.
3. **Do the same for Vital.** Its presets are plain JSON and the synth is open source, so this profile is the easiest to build. Same three tracks, same prompt test.
4. **Take on Serum2.** Audit the community `serum-preset-packager` tooling, build the profile from a preset collection, and map the modulation system, which Serum2 widened well beyond the original with chaos generators, more LFO types and new morphing modes.
5. **Add Surge XT and Dexed.** Surge XT's Python bindings let its profile be built by asking the synth itself. Dexed brings FM, which needs its own vocabulary (operator ratios, feedback, the algorithm as the architecture) and has the richest research to build on.
6. **Build the Profile Generalizer.** Once three or more profiles exist, draft a new one semi-automatically from a preset collection and the synth, with a person labelling the feel-words by ear, and settle the profile into a shareable format.
7. **Meet Generative Audio Devices.** Make a synth profile a target the patch language can emit to, beside the VCV vocabulary, so one description plays out on many synths. Not before both projects have proven their own pipelines, which for this one means through Surge XT and Dexed.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="preset-steward-018" -->
### 2026-10-14 — cycle 8 — The analyzer now writes sentences. Nine Wavetable presets are described in a synthesist's words, with the old parameter dump folded under each one for comparison.
> shipped · nothing heard in Live yet · steward leans: read Aqueous Pad's card first

Here's how [describe_preset.py](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Preset%20Development/ableton-wavetable/describe_preset.py) works. It reads the preset into plain facts and then writes about them. Aqueous Pad comes out as: 'A slow-swelling pad built on Rust and Ruby (Modern), through a warm† filter, whose life is LFO 2 folding Osc 1.' Then: two tables warped and folded in Modern mode and panned apart, a split pair of warm† low-passes with singing† resonance, a 634 ms swell that settles to 53% over 15 seconds, and, under Motion, the four routings that carry the sound. The other 28 are summed up in one clause. That ranking is the main writing decision. Huston Singletary's pad has 56 live routings. The writer ranks them by depth, weighted by how much the destination changes the sound: wave position, fold and cutoff count fully, pan less, an LFO modulating another LFO less again. It also drops anything identical to what the blank init patch already carries, so the sentence names what makes this preset different. The dagger (†) marks a feel-word borrowed from factory usage. When your ear sitting lands, the daggers disappear with no code change.

Two things got settled from the presets themselves along the way. First, the oscillator effect-mode setting, which the profile still listed as unmapped: 0 is none, 1 is FM, 2 is Classic (pulse width and sync), 3 is Modern (warp and fold). Each oscillator's live modulation targets name its mode's two controls, and all 16 oscillators that have such targets agree, with no contradictions ([evidence](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Preset%20Development/ableton-wavetable/profile-draft/osc_effect_mode_evidence.json)). Second, the hidden modulation slot 9, which the earlier survey guessed was 'random per note', looks like a performance controller instead. The init patch routes it to wave position at 100% yet plays a steady tone, and 11 factory routings put it at exactly 100% on an LFO's depth, which is the classic 'controller fades the vibrato in' move. The writer now calls it 'an unnamed controller (slot 9)' and lists it under Playing. The slot decoder in your ear kit will name it.

One click: the [descriptions page](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Preset%20Development/ableton-wavetable/descriptions/preset-descriptions.html) has six factory presets and the three 'light through deep water' pads. The text file covers all 17 presets on disk.

**Artifacts:**
- [nine presets described in sentences, each with the old parameter dump folded underneath.](Projects/Generative Preset Development/ableton-wavetable/descriptions/preset-descriptions.html)
- [all 17 presets on disk (14 factory, 3 generated), described as plain text.](Projects/Generative Preset Development/ableton-wavetable/descriptions/all-descriptions.txt)
- [the prose writer: facts to verdict, source, filter, shape, motion, playing.](Projects/Generative Preset Development/ableton-wavetable/describe_preset.py)
- [rebuilds the page and the text file; rerun after the ear sitting to see the daggers drop.](Projects/Generative Preset Development/ableton-wavetable/build_descriptions_page.py)
- [effect-mode setting read from the presets themselves (16 of 16 agree), plus the slot 9 evidence.](Projects/Generative Preset Development/ableton-wavetable/profile-draft/osc_effect_mode_evidence.json)

_Each factory preset's verdict sentence († = feel-word borrowed from factory usage)_
| preset | the verdict |
| --- | --- |
| Aqueous Pad | slow-swelling pad on Rust and Ruby (Modern), warm† filter; its life is LFO 2 folding Osc 1 |
| Abdominal Bass | sustained bass on Logue Saw and Basic Shapes (FM/Modern), warm† filter; LFO 1 opening the filter |
| Bunker Kick | percussive kick on Basic Shapes and Swept Noise, closed† filter; Env 3 bending Osc 1's pitch |
| Arpeggiate Me | pluck on Voice Harmonics and Amber, bright† filter; Env 3 sweeping Osc 1's wave position |
| A Brief History of Chime | struck-then-held chime on Spectral 3 (FM), bright† filter; Env 3 driving Osc 1's FM |
| A Wobble Modwheel | sustained rhythmic patch on VOSM and Bitten Filter (Modern), dark† filter; LFO 1 folding Osc 2 |

_Left rough:_ None of these descriptions has been checked against the sound in Live, so 'whose life is...' is ranked by depth and weighting, not by ear. I hand-tuned the weights and the envelope categories ('struck-then-held', 'plucked, ringing') on these 14 presets. Which hidden slot is Env 2 versus Env 3, the names of the synced LFO divisions, and slot 9's real identity all still wait on the slot decoder.

_Next moves named:_ Loudon: open the descriptions page and read Aqueous Pad's card. Does it sound like how you'd describe that pad to a student? Anything a synthesist would say that it misses? · Me, next run: feed the writer's output back into reshaping, so a direction like 'darker' can quote the sentence it changed ('the warm† filter becomes dark†'). · Once the ear sitting lands: run apply_bands.py, then build_descriptions_page.py, and watch the daggers go.
<sub>`preset-steward-018` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="preset-steward-016" -->
### 2026-10-14 — cycle 7 — Off plan — Three Wavetable pads from one prompt, 'light through deep water', plus a reshaper that made Aqueous Pad darker and more menacing, and breathing.
> shipped · not yet loaded in Live · steward leans: hear LTDW 1–3 first

_Off plan — builds the step after the ear sitting first: making presets from a prompt and reshaping them runs now on borrowed feel-words and picks up your ear's words with no code change. Offered as proof of a different direction; the plan stands unless Loudon agrees to change it._

How it works: the model reads the prompt and writes a short recipe in the profile's own words, like cutoff 'warm', attack 'swell', LFO 'drifting', plus which wavetables to use and which few routings carry the motion ([the recipe](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Preset%20Development/ableton-wavetable/recipes/light-through-deep-water.json)). generate_preset.py starts from the blank init Wavetable, not a factory sound. It fills in the knobs the recipe leaves out by sampling between the 25th and 75th percentile of Ableton's 31 factory pads, picks a value inside each named band (on a log scale for Hz and seconds), and writes the .adv along with a sidecar that says what it chose and why. Then it reads the file back and checks the values.

The three readings of the prompt:
- **LTDW 1 Caustics** is a slow wavetable morph. Crystal Shifter at a warm 906 Hz, with a drifting LFO moving the wave position and a second LFO at a different rate nudging the filter, so the two never lock. Position-spread unison smears it, like ripples of light on a pool floor.
- **LTDW 2 Shaft** is a single oscillator under a swept filter. Voice Harmonics sits dark at 232 Hz with a singing resonance, and a 3.5-second envelope opens the filter, like finding a shaft of light by looking up.
- **LTDW 3 Refraction** is a detuned pair. Amber, plus Sines 3 an octave up, panned apart, with six-voice shimmer unison and smooth-random drift on the pan, like white light splitting into colours.

Run back through the analyzer, all three describe themselves in the words they were asked for ([readback](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Preset%20Development/ableton-wavetable/generated/light-through-deep-water/analyzer-readback.txt)). That closes the loop from prompt to recipe to preset to description.

Reshaping (reshape_preset.py) moves a preset by bands, not by numbers. 'Darker' means the cutoff drops one band from wherever it sits, so the word covers the same distance in feel on any preset. Filter 2 follows by the same ratio, so the designer's offset between the two filters survives. 'Darker and more menacing' on Aqueous Pad: cutoff warm 714 Hz to dark 289 Hz, Filter 2 follows to 558 Hz, resonance singing to screaming, +6 dB drive, more sub, a little wider unison. 'Breathe': the attack is already a swell, so it stays put; LFO 1 goes from imperceptible to drifting (0.38 Hz) and gently drives the amp and filter. I also stripped and darkened Refraction to show the reshaper works on generated presets as well as factory ones.

One finding for your sitting: by factory usage, the 'soft' attack band only runs from 1.5 to 40 ms, because factory presets are mostly clicks and plucks. A pad that asks for 'soft' would come out nearly percussive, so all three recipes had to ask for 'swell'. Rungs C04 to C08 of the attack ladder are where your ear will move that fence furthest.

**Artifacts:**
- [slow wavetable morph: ripples of light.](Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water/LTDW 1 Caustics.adv)
- [dark filter opened by a 3.5 s envelope: the shaft found by looking up.](Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water/LTDW 2 Shaft.adv)
- [detuned pair an octave apart, panned and drifting: light splitting.](Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water/LTDW 3 Refraction.adv)
- [what Caustics chose, knob by knob, and why.](Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water/LTDW 1 Caustics.json)
- [what Shaft chose, knob by knob, and why.](Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water/LTDW 2 Shaft.json)
- [what Refraction chose, knob by knob, and why.](Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water/LTDW 3 Refraction.json)
- [the analyzer describing all three: the round trip.](Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water/analyzer-readback.txt)
- [factory Aqueous Pad, darker and more menacing.](Projects/Generative Preset Development/ableton-wavetable/reshaped/Aqueous Pad - darker + menacing.adv)
- [the change note: each move, before and after, in band words.](Projects/Generative Preset Development/ableton-wavetable/reshaped/Aqueous Pad - darker + menacing.json)
- [factory Aqueous Pad, pushed toward something that breathes.](Projects/Generative Preset Development/ableton-wavetable/reshaped/Aqueous Pad - breathe.adv)
- [the breathe change note.](Projects/Generative Preset Development/ableton-wavetable/reshaped/Aqueous Pad - breathe.json)
- [the reshaper on a generated preset: stripped to one oscillator, one band darker.](Projects/Generative Preset Development/ableton-wavetable/reshaped/LTDW 3 Refraction - strip + darker.adv)
- [its change note.](Projects/Generative Preset Development/ableton-wavetable/reshaped/LTDW 3 Refraction - strip + darker.json)
- [the prompt read into three recipes in feel-words; the seam between language and numbers.](Projects/Generative Preset Development/ableton-wavetable/recipes/light-through-deep-water.json)
- [recipe to .adv: archetype sampling, band words to values, routings, read-back check.](Projects/Generative Preset Development/ableton-wavetable/generate_preset.py)
- [preset plus direction to .adv: darker, brighter, menacing, breathe, strip.](Projects/Generative Preset Development/ableton-wavetable/reshape_preset.py)

_Distinct on paper: distance over 10 normalized knobs (0 = identical) and the share of modulation routings not shared_
| pair | knob distance | routing difference | wavetables |
| --- | --- | --- | --- |
| Caustics vs Shaft | 0.39 | 0.57 | different |
| Caustics vs Refraction | 0.29 | 0.57 | different |
| Shaft vs Refraction | 0.53 | 0.57 | different |
| each vs init Wavetable | 0.91–1.11 | 0.62 | different |
| each vs factory Aqueous Pad | 0.52–0.67 | 0.93 | different |

_Left rough:_ Nothing here has been loaded in Live or heard, so 'distinct' is only a measurement on paper. Choosing wavetables by name (SpriteName) is new to the write path and only uses names found in factory presets. Which modulation slot is which envelope is still a guess (I hedged by giving Env 2 and Env 3 the same shape in Shaft). The reshaper's direction words are keyword-matched for now. And the 78 ladder presets from earlier today are committed only inside the kit's zip, not as loose files.

_Next moves named:_ Loudon: drop LTDW 1–3 on a track and hold a chord. Do they read as one pad heard three ways, and is any of them 'light through deep water'? Reveal the folder: [generated](open:Projects/Generative Preset Development/ableton-wavetable/generated/light-through-deep-water?reveal) · Me, next cycle: the plan's bonus check, describing a known factory preset the way a skilled synthesist would, by teaching the analyzer to write prose instead of a parameter list · Once the ear sitting lands: run apply_bands.py, regenerate the same three recipes unchanged, and compare before and after
<sub>`preset-steward-016` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="preset-steward-014" -->
### 2026-10-14 — cycle 6 — The Wavetable ear-sitting kit is ready. Sit with it solo using the ear sheet, or open a session and do it together?
> still working · kit built, not yet loaded in Live · steward leans SOLO

Quick catch-up: this project teaches an AI to make and describe Wavetable presets, and its words for how a setting sounds are still borrowed from Ableton's factory presets instead of your ears. The plan's next step is one sitting in Live to fix that, and you chose that step back in June. I've now built it: 78 presets in eight ladders plus a decoder, and an [ear sheet](open:Projects/Generative Preset Development/ableton-wavetable/audition-kit/ear-sheet.html) where you just pick the rung where each sound changes character. It writes the answers for you. Solo is maybe 30 to 40 minutes of arrowing through hot-swap and needs nothing from me in the room. Together, I could rebuild a ladder on the spot when a rung is too coarse or the LFO routing turns out wrong. That's slower to schedule but catches surprises live. I'm keeping work going either way.

**Artifacts:**
- [the ear sheet for the sitting.](Projects/Generative Preset Development/ableton-wavetable/audition-kit/ear-sheet.html)
- [the full kit as one file.](Projects/Generative Preset Development/ableton-wavetable/wavetable-audition-kit.zip)
- [Generative Preset Development — icon.png](Projects/Generative Preset Development/Generative Preset Development — icon.png)
- [Generative Preset Development — hero.png](Projects/Generative Preset Development/Generative Preset Development — hero.png)
<sub>`preset-steward-014` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="preset-steward-013" -->
### 2026-10-14 — cycle 6 — I built the sitting itself: 78 Wavetable presets in eight ladders, a slot-decoder preset, and an ear sheet that turns your picks into the profile.
> shipped · ear-pass kit ready, not yet loaded in Live · steward leans sit solo with the sheet

The kit lives in [audition-kit](open:Projects/Generative Preset Development/ableton-wavetable/audition-kit?reveal) and is also zipped as one file. There are eight ladders: A cutoff (12 rungs, 40 Hz to 20 kHz), B resonance (10), C amp attack (13, 0 ms to 10 s), D attack curve (6), E release (11), F free LFO rate (12, 0.05 to 30 Hz), G tempo-synced LFO rate (7), and H LFO fade-in (6). Each rung is the factory init Wavetable with Osc 1 alone on a bright wave, so a rung changes only the one setting it tests. Each preset's name shows in the device title, e.g. 'A05 cutoff 549 Hz'. Rungs marked 'corpus split' sit where Ableton's 270 factory presets divide into fifths. Those are the provisional fences the analyzer uses today, so the sitting is moving fences, not building them from nothing. How to sit: load the first rung, press hot-swap, hold a note, and arrow down. Then pick in the [ear sheet](open:Projects/Generative Preset Development/ableton-wavetable/audition-kit/ear-sheet.html) the rung where each band begins. It builds the answers file as you go. Then `python3 apply_bands.py` writes the ear's split points into profile v0.2 and re-runs the analyzer, which now says 'split set by ear' wherever your ear replaced a factory guess. I tested that path end to end on a throwaway copy with made-up answers. The Z00 decoder routes all 13 hidden modulation slots to Filter 1 Freq at 1%, 2% ... 13%. One look at the Matrix, MIDI and MPE tabs tells us which slot is which source, which the corpus census could only guess. The sheet has boxes for that too. Two things I found while building. First, the init Wavetable ships three controller routings onto the oscillator (slot 9 to wave position at 100%), and I zeroed them in the kit. Since the default patch plays a steady tone, slot 9 can't be per-note Random as the census guessed. It's more likely Press or Aftertouch, and the decoder will settle it. Second, the factory LFO-rate bands are the weakest of the five: 157 of the 270 presets have LFO 1 tempo-synced, so their free Hz rate is ignored but still counted, and 54 sit on the untouched 1 Hz default. So the F ladder matters most. I also fixed the analyzer to stop putting a feel-word on the free rate of a synced LFO, and let it read real .adv files directly.

**Artifacts:**
- [the ear sheet: pick the rung where each band begins; it writes the answers file.](Projects/Generative Preset Development/ableton-wavetable/audition-kit/ear-sheet.html)
- [the whole kit (78 ladder presets + decoder + sheet + manifest) as one file.](Projects/Generative Preset Development/ableton-wavetable/wavetable-audition-kit.zip)
- [the slot decoder: each of 13 mod slots on Filter 1 Freq at its own percentage.](Projects/Generative Preset Development/ableton-wavetable/audition-kit/Z decoder/Z00 slot decoder.adv)
- [rung code to value map that apply_bands.py reads.](Projects/Generative Preset Development/ableton-wavetable/audition-kit/kit_manifest.json)
- [rebuilds the kit; --lfo-slots re-aims the LFO ladders after the decoder reading.](Projects/Generative Preset Development/ableton-wavetable/build_audition_kit.py)
- [after the sitting: answers to ear splits, profile v0.2, analyzer re-run.](Projects/Generative Preset Development/ableton-wavetable/apply_bands.py)
- [the sheet's template; the build injects the manifest.](Projects/Generative Preset Development/ableton-wavetable/ear_sheet_template.html)
- [now prefers ear splits over factory-usage splits when they exist.](Projects/Generative Preset Development/ableton-wavetable/corpus_bands.py)
- [reads .adv directly; no longer bands the ignored Hz rate of a synced LFO.](Projects/Generative Preset Development/ableton-wavetable/analyze_preset.py)
- [labels each feel-word as set by ear or by factory usage.](Projects/Generative Preset Development/ableton-wavetable/analyze_preset_v2.py)

_The ladders · rungs marked * are factory-usage fences_
| ladder | what it tests | rungs | bands you mark |
| --- | --- | --- | --- |
| A | filter cutoff | A01–A12 (A03*, A05*, A07*, A09*) | dark · warm · open · bright |
| B | resonance at 700 Hz | B01–B10 | coloured · singing · screaming · self-osc edge |
| C | amp attack | C01–C13 | punchy · natural · soft · swell |
| D | attack curve at 1.5 s | D01–D06 | linear · convex |
| E | amp release | E01–E11 | short · natural · long · tail |
| F | free LFO rate (tremolo) | F01–F12 | drifting · subtle · obvious · fast |
| G | synced LFO rate | G01–G07 | groove · slow (+ write the note value shown) |
| H | LFO fade-in | H01–H06 | fade-in · slow-bloom |
| Z | slot decoder | Z00 | read the % each source shows |

_Left rough:_ None of the 78 presets has been loaded in Live yet. They are built the same way as the Aqueous Pad preset you confirmed, and all 78 parse as valid XML, but whether 'last frame of Basic Shapes' is really a saw is a guess. The F, G and H ladders route the LFOs through slots 2 and 3; if F01–F12 don't wobble, read Z00 and rebuild with --lfo-slots. I dropped a no-input self-oscillation rung, the old v0.1 worksheet still shows the wrong ranges (cutoff as 0–1 rather than Hz), and Env 2/3 and Filter 2 will inherit the measured instance's bands without being heard separately.

_Next moves named:_ Loudon: one sitting with the kit and the ear sheet; drop the answers into audition-kit/ear_answers.json or paste them as a reply. · Me, next: run apply_bands.py, then describe a known factory preset in ear-grounded words. That is the plan's bonus check before moving on to making presets from a prompt. · Meanwhile, without your ears: stub the reshaping track (take a preset plus a direction like 'darker') against the factory-usage bands, so it's ready the moment real bands land.
<sub>`preset-steward-013` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-42-54-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the entry's multi-stage plan

Carried over on 2026-09-25 from the Multi-Stage Plan in [[Generative Preset Development]], when plans moved into scrolls (SCHEMA v1.25). The reconnaissance is done for Wavetable, so it was dropped as a move. Wavetable now comes before Vital, as Loudon chose on the board on 2026-05-27 (grant on preset-steward-002), and the Wavetable work is split into the ear pass he chose on 2026-06-09 (grant on preset-steward-010) and the generation that follows it. Stage numbers were replaced by names; the two Python starter snippets were dropped; the convergence diagram stays in the entry as rationale.
<sub>`plan-2026-09-25T20-42-54-04-00` · plan agreed · agreed 2026-09-25T20:42:54-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="preset-steward-011" -->
### 2026-06-23 — cycle 5 — Shipped a perceptual-bands worksheet that turns the pending ear-pass into fill-in-the-blanks for the 23 flagged Wavetable settings.
> still working · preset-steward-010 still gates Stage 1B · this is prep so the eventual sitting is one cup of coffee, not an afternoon

Project recap: Generative Preset Development builds Synth Profiles (parameter vocab + perceptual regions + modulation map + format I/O) so an LLM can author/analyze/modify presets for a fixed-architecture synth from abstract prompts. We are in Stage 1B (Ableton Wavetable). The profile JSON is built; the analyzer (Track B) and writer (Track A) exist. Cycle 4 flagged 23 settings whose perceptual bands are unknown — cutoffs, resonances, envelope attack times/curves, LFO rates — and asked Loudon (preset-steward-010) which method to use to label them. That request is still open.

This cycle I did not re-ask. I shipped the worksheet that makes the answer cheap regardless of the path he picks: a single markdown file laying out every flagged parameter with empty named bands and a one-paragraph audition-patch recipe so any sitting collapses to clicking through, listening, and writing in three to four split-points per row. The 23-count is verified against the cycle-4 flag list.

Deliverable: `ableton-wavetable/profile-draft/perceptual-bands-worksheet.md`. Once filled, the splits drop straight into `wavetable_profile_v0.1.json`'s `perceptual_regions` fields and the Track B analyzer's `[PERCEPTUAL BAND PENDING]` markers should clear.

No new ask — preset-steward-010 is the live fork; this just lowers its cost.

**Artifacts:**
- [the worksheet — fill the blanks in one Live sitting](Projects/Generative Preset Development/ableton-wavetable/profile-draft/perceptual-bands-worksheet.md)
<sub>`preset-steward-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
