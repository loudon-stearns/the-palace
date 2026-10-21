---
title: "Generative Sample Libraries — scroll"
born: 2026-09-23
links:
  - target: "[[Generative Sample Libraries]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Generative Sample Libraries's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Generative Sample Libraries — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Generative Sample Libraries]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-15T12:12:31.726Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 38 · last ran 2026-10-15 (today)
- **Plan:** agreed 2026-09-25 (19 days ago) · 7 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-15 (today) — Name a key and the violin gets new takes for it. First round on A#3, C4 and C5: only those three keys changed, all on pitch. (`gsl-steward-079`)
- **Last commit touching this project:** 2026-10-14 `5df11efb` — steward(heartbeat): machinery + project scrolls
- **Signal:** steady
- **Drift:** 21 cycles since the entry was last consolidated (cycle 17) — the entry body may lag; this scroll does not.

### Where this stands

Generative Sample Libraries turns a conversation into a playable sampled instrument. Crystal and Shepard-tone shipped in the summer. The current step of the plan is your June idea: an audio AI (MusicGen, guided by a hummed tone) plays each note, pitch detection checks it, and the takes that pass become an instrument. The step is done when one AI instrument sounds right to you and the interview can run the loop of listening, flagging and re-rendering. The violin was finished earlier today and is waiting for your ears. This cycle built the other half: name the keys that sound wrong, and the model renders them again rather than the old takes being patched. I ran it once on the three weakest ke…

### Open asks

- `gsl-steward-077` — directional_decision · posted 2026-10-15 · options: GOOD-ENOUGH · REDO-KEYS · TIMBRE-OFF

### Answered, not yet consumed

_None._

### Decided

- `gsl-steward-070` — directional_decision → GRANTED — option_id=VIOLIN (2026-10-14)
- `gsl-steward-057` — directional_decision → GRANTED — option_id=RING (2026-09-24)
- `gsl-steward-047` — directional_decision → GRANTED — (no option_id); notes: "Musicgen is ok, the violin has an odd attack, but the sustain portion is violin like, the marimba sounds like a marimba with a bunch of audio delays, like there are lots of differen attacks instead of a single attack. Stable audio is horrible." (2026-09-24)
- `gsl-steward-040` — directional_decision → GRANTED — option_id=BOTH-PARALLEL (2026-08-26)
- `gsl-steward-037` — directional_decision → GRANTED — (no option_id); notes: "try to use an audio generating LLM to create a wide range of sounds from a range of instruments, specify the pitch they should play and  test the result against librosa pitch detect. " (2026-06-25)
- `gsl-steward-034` — directional_decision → GRANTED — option_id=SOURCE-THREE (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A conversation that ends in a playable sampled instrument. Claude runs the interview (source, range, velocity layers, format), draws audio from wherever it can, and writes a library any open sampler loads. Behind it: [[Talking Keyboard]] proved the whole loop in May 2026; the interview became a reusable skill with two rules that can't be skipped (agree the conventions before rendering, and audition before the full batch); and palace synthesis became the first real source, with a Crystal instrument and a Shepard-tone instrument built and approved by Loudon. The plan listed a folder of recordings as the first outside source, but in June Loudon pointed the work at audio AI instead: ask a model to play a named pitch, then check it with pitch detection. That is where the work is now.

**The moves ahead**

1. **Make an audio AI model a source.** MusicGen, given a guide tone at the target pitch, renders each note; every take is filed under the pitch it actually played, and the steadiest takes become the instrument. Stable Audio is out, on Loudon's ear. Violin, flute and marimba now play in tune on every key by measurement, but the latest builds haven't been heard. The move is done when one AI-sourced instrument sounds right to Loudon and the critique-and-regenerate loop runs inside the interview.
2. **Graduate the interview skill.** Move it out of the project so it loads on every sample-library task. Loudon said yes on 2026-06-06, and the steward's proposal is in `interview-skill-promotion-proposal.md`. Two calls wait on him: whether it lands in `.claude/skills/`, where auto-loading already works, or in a new top-level `/skills/`, and whether the project copy stays as a pointer. It goes through a deposit and can happen at any time.
3. **Point the folder source at real recordings.** The adapter that reads a folder of WAVs, detects each file's pitch and maps it to the keyboard was scaffolded in June (`_ops/sample-libraries/local-wav-folder/`) and has never been run on a real folder.
4. **Draw from web libraries.** Download Creative Commons packs, such as freesound.org's, with Loudon's explicit permission, then treat them as a local folder.
5. **Write every open format.** DecentSampler presets (XML zipped with the WAVs, which is how participants load an instrument in a free plugin), SF2 through ConvertWithMoss, loop points written into each WAV's `smpl` chunk, a check for clicks at loop seams, and crossfaded loops for tones that don't loop cleanly. Kontakt stays out, since authoring it needs a paid licence.
6. **Meet Generative Audio Devices.** Acknowledged, not yet planned: [[Generative Audio Devices]] builds the instrument shells, this project fills them, and one day a single act of generation makes both. Not before every format above is real.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Never start a render you can't finish and post inside one cycle. Chunk long sweeps (the 300-take range sweep is a 40-minute job): run one chunk, post what it showed, say what's left. A cycle that ends waiting on a background job ships nothing and is counted barren.

- **Stable Audio is out as a source.** Loudon, 2026-09-24, after hearing the head-to-head: "Stable audio is horrible." (approved as an order 2026-09-25)
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="tear-heal-2026-10-20-collection" -->
### 2026-10-20 — Off plan — The tear-and-heal collection: four instruments, 240 samples, every key struck past its own edge and healed
> shipped · 240 of 240 on pitch, every loop seam clean with room to spare · the audition was answered, the collection is unheard

_Off plan — your commission of 2026-10-17 (the baton), rendered on your answer to the audition: "Good. The names in BUILD.md are fine." Whether it joins the plan is your yes. The plan's current step, an audio AI as a source, stands._

**What shipped.** The four instruments from the audition, now across the keyboard: a sample every three semitones, three velocity layers, and velocity as strike depth. **Heal** plays A0 to D#7, **Snap** A2 to D#7, **Bar to String** A1 to D#6, and **Heal with Voices** A0 to D#6. Every sample key had its own edge bisected before it was struck, and every sample settles on pitch once its tune is applied (worst 1.4 cents).

**Hear it in place.** Each instrument has a [walk.wav](open:Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/walk.wav) that strikes every sample key from low to high at mid velocity, so you hear the tear slow down as the register drops. Each also has a [velocity.wav](open:Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/velocity.wav) that strikes the middle key at velocity 30, 64, 100 and 127. To play an instrument, drag its `.dslibrary` onto DecentSampler.

**One change since the audition.** The first full render passed with one loop seam a hair under the pump limit (1.49 dB against 1.5). The build now prefers seams with room to spare and falls back to the plain limit only when none has room. The collection was rendered again: the worst level step is now 0.98 dB and the worst click 4.1 dB, against limits of 1.5 and 6. The audition files stay exactly as you answered them.

**Artifacts:**
- [Heal: every sample key, low to high. Start here.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/walk.wav)
- [Heal: the middle key at velocity 30, 64, 100, 127.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/velocity.wav)
- [Heal: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/Heal.dslibrary)
- [Heal for sforzando, sfizz, Surge XT, Bitwig.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/Heal.sfz)
- [Snap: every sample key, low to high.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/snap/walk.wav)
- [Snap: the middle key at four velocities.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/snap/velocity.wav)
- [Snap: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/snap/Snap.dslibrary)
- [Snap for sforzando and the rest.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/snap/Snap.sfz)
- [Bar to String: every sample key, low to high.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/bar/walk.wav)
- [Bar to String: the middle key at four velocities.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/bar/velocity.wav)
- [Bar to String: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/bar/Bar to String.dslibrary)
- [Bar to String for sforzando and the rest.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/bar/Bar to String.sfz)
- [Heal with Voices: every sample key, low to high.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/voices/walk.wav)
- [Heal with Voices: the middle key at four velocities.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/voices/velocity.wav)
- [Heal with Voices: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/voices/Heal with Voices.dslibrary)
- [Heal with Voices for sforzando and the rest.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/voices/Heal with Voices.sfz)
- [what to play, what to listen for, and what is not verified.](Projects/Generative Sample Libraries/tear-heal-instruments/README.md)
- [the names it renders under, now agreed.](Projects/Generative Sample Libraries/tear-heal-instruments/BUILD.md)
- [Heal's numbers per sample: edge, strike, dip, heal, loop, tune.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/notes.json)
- [Heal's checks from disk: pitch, seams, the two maps.](Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/check.json)
- [every key's edge, as bisected.](Projects/Generative Sample Libraries/tear-heal-instruments/edges.json)
- [the recipe, with the seam preference.](Projects/Generative Sample Libraries/tear-heal-instruments/build.py)

_The collection · three layers per sample key; the hard strike's range across each instrument's keys_
| instrument | plays | samples | hard strike dips (cents) | hard strike heals in (s) | sustain wobble (cents) |
| --- | --- | --- | --- | --- | --- |
| Heal | A0–D#7 | 75 | 123–328 | 0.28–2.0 | 0.3–3.9 |
| Snap | A2–D#7 | 51 | 277–463 | 0.17–0.67 | 0.2 |
| Bar to String | A1–D#6 | 51 | 159–315 | 0.54–2.4 | 0.1–3.2 |
| Heal with Voices | A0–D#6 | 63 | 123–290 | 0.38–2.0 | 0.3–3.9 |

_Left rough:_ No one has heard the 240 samples, and neither format has been loaded in a sampler; both were only read back as files. The WAVs, the demos and the four `.dslibrary` zips (11 to 15 MB each) live only on the Mac, in the worktree where they were rendered. Once this lands, the links above play in the main checkout only after `build.py all` runs there (about four minutes, in a venv; the README's Rebuild section). A note still starts at full level: the tear is the whole attack.

_Next moves named:_ Play them, and name any key or layer that sounds wrong. Round-robin takes from other seeds, SF2 through ConvertWithMoss, and the coupling route the audition set aside are all still open. Whether this joins the plan is your call.
<sub>`tear-heal-2026-10-20-collection` · made by a child session on the baton `generative-sample-libraries-handoff-2026-10-17` · off plan</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tear-heal-2026-10-20-audition" -->
### 2026-10-20 — Off plan — Instruments that tear, then heal: an audition of four, every key placed against its own edge
> audition · 24 samples, all on pitch, every loop seam clean · unheard · the full collection waits on your ear

_Off plan — your commission of 2026-10-17 (the baton): sampled instruments from the frustration sweeps, a torn attack that heals into a steady sustain. Not a move on the plan; whether it joins the plan is your yes. The plan's current step, an audio AI as a source, stands._

**What a note is.** Nothing in its envelope is drawn. A strike throws the tone's stretch past the edge where its partials can no longer hold against the voices pulling them. The pitch sags and wobbles, the stretch decays back under the edge, and the tone relocks. Velocity is how far past the edge the strike goes: soft 2×, mid 6×, hard 20×. Harder tears deeper and heals later. Heal at C1 dips 22, 52 and 123 cents and heals at 0.7, 1.2 and 2.0 s.

**Every key at its own edge.** The baton said to find the edge for each patch, not copy the field guide's numbers. The build bisects it on every sample key and rests the sustain at a third of it: alive, never on it. The register works as a clock, because coupling follows pitch: the same strike heals in 2 s at C1 and in a quarter of a second at C7, where the tear is a chirp.

**Four instruments.** **Heal** is the warm source, up to 96 partials. **Snap** has eight bright partials, so it snaps instead of fraying and its sustain is dead still. **Bar to String** pins partial 1: it starts clean as a bar, breaks partway through, and heals into a string. **Heal with Voices** is Heal's own strikes with the outside voices mixed in, so the tear is heard as beating against an ensemble.

**Hear it in place.** Start with [first-note.wav](open:Projects/Generative Sample Libraries/tear-heal-instruments/audition/first-note.wav): the baton's own strike with gestures_warm.py's settings and nothing designed. Then [audition.wav](open:Projects/Generative Sample Libraries/tear-heal-instruments/audition/audition.wav), about 2 minutes, with [cues.md](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/tear-heal-instruments/audition/cues.md) saying what plays when. To play it, drag any `.dslibrary` below onto DecentSampler.

**How this asks for your ear.** The sample-library interview has two gates: agree the names before rendering, and hear a small test before the full batch. [BUILD.md](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/tear-heal-instruments/BUILD.md) shows the names. This audition is the small test. On your "good", one command renders the collection: 240 samples across the four instruments, in about five minutes.

**Artifacts:**
- [the baton's own strike, nothing designed: start here.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/first-note.wav)
- [every instrument's lowest and highest key, soft, mid and hard, each held past its heal.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/audition.wav)
- [what plays when in the audition, and how deep each note tore and when it healed.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/cues.md)
- [partial 1 of every strike: the tear, then the heal.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/traces.png)
- [Heal: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/heal/Heal.dslibrary)
- [Snap: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/snap/Snap.dslibrary)
- [Bar to String: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/bar/Bar to String.dslibrary)
- [Heal with Voices: drag onto DecentSampler.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/voices/Heal with Voices.dslibrary)
- [what to listen for, and what is not verified.](Projects/Generative Sample Libraries/tear-heal-instruments/README.md)
- [the names it renders under, waiting on your yes.](Projects/Generative Sample Libraries/tear-heal-instruments/BUILD.md)
- [the recipe: build.py audition, build.py all.](Projects/Generative Sample Libraries/tear-heal-instruments/build.py)
- [the four instruments and the reason behind each choice.](Projects/Generative Sample Libraries/tear-heal-instruments/patches.py)
- [the model, ported and matched to the sweeps' own loop to 2e-9.](Projects/Generative Sample Libraries/tear-heal-instruments/engine.py)
- [every key's edge, as bisected.](Projects/Generative Sample Libraries/tear-heal-instruments/edges.json)
- [Heal's numbers per sample.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/heal/notes.json)
- [Heal's checks from disk: pitch, seams, the two maps.](Projects/Generative Sample Libraries/tear-heal-instruments/audition/heal/check.json)

_Audition · each instrument's lowest and highest key, three layers each_
| instrument | keys | dip, soft / mid / hard (cents) | healed by, soft / mid / hard (s) | sustain wobble (cents) |
| --- | --- | --- | --- | --- |
| Heal | C1 | 22 / 52 / 123 | 0.7 / 1.2 / 2.0 | 3.2 |
| Heal | C7 | 42 / 169 / 328 | 0.14 / 0.21 / 0.28 | 0.3 |
| Snap | C3 | 33 / 108 / 277 | 0.33 / 0.50 / 0.67 | 0.2 |
| Snap | C7 | 36 / 146 / 302 | 0.08 / 0.12 / 0.17 | 0.2 |
| Bar to String | C2 | 270 / 273 / 287 | 1.3 / 1.9 / 2.4 | 2.5–2.8 |
| Bar to String | C6 | 318 / 281 / 315 | 0.26 / 0.41 / 0.54 | 0.1 |
| Heal with Voices | C1, C6 | Heal's own strikes | | |

_Left rough:_ No one has heard it, and neither format has been loaded in a sampler; both were only read back as files. There is no loudness accent: a note starts at full level and the tear is the whole attack. The WAVs and `.dslibrary` zips live only on the Mac, in the worktree where they were rendered (`.gitignore`, 2026-10-18). Any checkout can remake them with `build.py audition` in about 20 seconds. The other route the baton named, a tone held past its edge while coupling rises until it locks, was tried and set aside: a 10-cent shiver that never fully stills (3–5 cents left), against a strike's 36 cents settling to 2.

_Next moves named:_ If you say "good", `build.py all` renders the collection and it ships here. If you say "fix this", name what and it gets re-auditioned first. And whether this joins the plan as a move of its own is your call.
<sub>`tear-heal-2026-10-20-audition` · made by a child session on the baton `generative-sample-libraries-handoff-2026-10-17` · off plan</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-079" -->
### 2026-10-15 — cycle 38 — Name a key and the violin gets new takes for it. First round on A#3, C4 and C5: only those three keys changed, all on pitch.
> shipped · redo loop works · both builds unheard · steward leans GOOD-ENOUGH on the open violin ask

**Why re-render instead of fix.** The finishing pass can only change a take's level. A take MusicGen played thin or breathy stays that way at any level, so the only real fix for a bad key is a better take.

**What it does** ([redo_keys.py](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/ai-source-probe/redo_keys.py)). For each key you name, it renders six fresh takes on seeds never used before and grades them. It throws out the take that held the key, and fresh takes may only fill the keys you named, so nothing else moves. Then it reruns the same chain as the shipped build (pitch check, bow attacks, loops, one level, velocity, DecentSampler) and plays each named key old then new. A redo file keeps each round's rejections, so a second round doesn't undo the first.

**Round one.** I picked the three keys the measurements liked least. A#3 swelled 4.3 dB into its loop. C4's take sat so quiet it needed an 18.8 dB lift. C5 needed a 12.6 dB cut. Eighteen renders took about four minutes. Exactly those three keys changed, and the other 39 play the same samples as before. All 42 keys are on pitch in SFZ and DecentSampler, and all 24 seams are clean on a 12-second hold.

**Hear it in place.** [ab.wav](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/ab.wav) holds each key 4 s, the shipped build first and then the redo. For the whole instrument, play the shipped [phrase.wav](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase.wav) and then the redo's [phrase.wav](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/phrase.wav). The tune is in C, so C4 and C5 come round often. To play it, drag [MusicGen Violin.dslibrary](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/MusicGen Violin.dslibrary) onto DecentSampler.

**How this answers your open violin ask.** If you name keys, they go straight into this loop as the next round. I also drafted where the loop would sit in the interview skill: [interview-redo-step-proposal.md](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/interview-redo-step-proposal.md). It needs an elder to land it.

**Artifacts:**
- [A#3, C4, C5 held 4 s each: shipped build, then the redo. Start here.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/ab.wav)
- [the redo playing the same scale and tune as the shipped violin's phrase.wav.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/phrase.wav)
- [the shipped violin's scale and tune, for back-to-back listening.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase.wav)
- [the redone violin: drag onto DecentSampler.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/MusicGen Violin.dslibrary)
- [the redone violin for sforzando, sfizz, Surge XT, Bitwig.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/MusicGen Violin.sfz)
- [the DecentSampler preset on its own.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/MusicGen Violin.dspreset)
- [what to play and listen for, and what isn't verified.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/README.md)
- [where each flagged key's new sample came from, and every fresh take's grade.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/redo.json)
- [the finishing pass's numbers per key for the redo build.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/finishing.json)
- [low, middle and high key held 7 s, looped then finished (redo build).](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/held.wav)
- [one key bowed soft to hard (redo build).](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/velocity.wav)
- [the loop: re-ask the model for flagged keys, rebuild, A/B.](Projects/Generative Sample Libraries/ai-source-probe/redo_keys.py)
- [gains --redo: reject the old takes, and fresh takes fill only flagged keys.](Projects/Generative Sample Libraries/ai-source-probe/build_sfz.py)
- [gains --first-seed so a redo never redraws an old seed.](Projects/Generative Sample Libraries/ai-source-probe/probe.py)
- [the probe notes, now with the redo loop and round one's numbers.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)
- [the redo file: rejections and fresh runs, carried round to round.](Projects/Generative Sample Libraries/ai-source-probe/instruments/redo/violin.json)
- [what the rebuild chose and passed over.](Projects/Generative Sample Libraries/ai-source-probe/instruments/redo/r1/violin/picks.json)
- [DecentSampler read-back for both builds: 42/42 each.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/decentsampler.check.json)
- [the full run log.](Projects/Generative Sample Libraries/ai-source-probe/redo.violin_r1.log)
- [proposed interview step: a flagged key is re-asked, not patched (draft, for an elder).](Projects/Generative Sample Libraries/interview-redo-step-proposal.md)
- [fresh A#3 renders.](Projects/Generative Sample Libraries/ai-source-probe/renders.violin_r1_As3.jsonl)
- [fresh A#3 grades.](Projects/Generative Sample Libraries/ai-source-probe/results.violin_r1_As3.jsonl)
- [fresh C4 renders.](Projects/Generative Sample Libraries/ai-source-probe/renders.violin_r1_C4.jsonl)
- [fresh C4 grades.](Projects/Generative Sample Libraries/ai-source-probe/results.violin_r1_C4.jsonl)
- [fresh C5 renders.](Projects/Generative Sample Libraries/ai-source-probe/renders.violin_r1_C5.jsonl)
- [fresh C5 grades.](Projects/Generative Sample Libraries/ai-source-probe/results.violin_r1_C5.jsonl)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_A#3.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_A#4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_A#5.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_A3.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_A4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_B3.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_B4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_C#4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_C#5.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_C4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_C5.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_C6.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_D#4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_D4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_E4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_E5.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_F#4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_F#5.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_F4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_F5.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_G#4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_G3.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_G4.wav)
- [redo-build sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin_r1/samples/violin_G5.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_As3/violin_A#3_s10.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_As3/violin_A#3_s11.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_As3/violin_A#3_s6.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_As3/violin_A#3_s7.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_As3/violin_A#3_s8.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_As3/violin_A#3_s9.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C4/violin_C4_s10.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C4/violin_C4_s11.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C4/violin_C4_s6.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C4/violin_C4_s7.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C4/violin_C4_s8.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C4/violin_C4_s9.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C5/violin_C5_s10.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C5/violin_C5_s11.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C5/violin_C5_s6.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C5/violin_C5_s7.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C5/violin_C5_s8.wav)
- [fresh take](Projects/Generative Sample Libraries/ai-source-probe/samples/violin_r1_C5/violin_C5_s9.wav)

_Violin, redo round 1 · three keys re-asked, six fresh takes each_
| key | fresh takes on the key | new sample | lift or cut the finishing pass needed | swell into the loop |
| --- | --- | --- | --- | --- |
| A#3 | 4 of 6 on pitch | fresh take | +0.6 dB → +0.1 dB | 4.3 dB → 2.0 dB |
| C4 | 0 clean (3 an octave up, 2 at −30 c, 1 unpitched) | an older take that had lost to the first pick | +18.8 dB → +8.8 dB | none either way |
| C5 | 3 of 6 on pitch | fresh, from the C4 request (it landed an octave up and was steadiest) | +9.7 dB → +4.5 dB | 2.3 dB → 2.4 dB |
| other 39 keys | — | unchanged | — | — |

_Left rough:_ No one has heard either build, so whether the redo sounds more like one player is unverified. The new C4 is an older take, not a fresh one, and it sits 10 cents sharp (inside the 20-cent limit, but now the worst key; the shipped build's worst was 2.4 c). The intermediate shaped and looped folders under instruments/redo/r1 aren't listed for commit; redo_keys.py rebuilds them in about a minute.

_Next moves named:_ When you answer the open violin ask: if you name keys, run them as round two with `redo_keys.py violin <keys> --tag r2`, starting from the build you prefer. If you say it's good enough, the AI-source step of the plan is done. · Have an elder land the interview step (interview-redo-step-proposal.md) so the loop is part of the interview itself, not only a script. · Finish the flute the same way (one level, velocity, redo-ready). It's looped and on pitch but hasn't had the finishing pass.
<sub>`gsl-steward-079` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-077" -->
### 2026-10-15 — cycle 37 — Does the finished MusicGen Violin sound like one player? If not, which keys give it away?
> still working · violin finished, unheard · steward leans GOOD-ENOUGH

Catch-up: the plan's current step is making an audio AI a real source. MusicGen plays each note, pitch detection checks it, and the takes that pass become the instrument. You picked the violin to finish first. It now sits at one level across its 42 keys, holds without ticks, and answers velocity. The step is done when one AI instrument sounds right to you. phrase_before.wav and phrase.wav are the same tune before and after, about 40 seconds each. I'm still working while you listen. Next I build the re-render loop into the interview, so a key you flag gets re-rendered rather than patched. If you name keys, they're the first test of it.

**Artifacts:**
- [finished: the scale and the tune.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase.wav)
- [last build, the same scale and tune, for comparison.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase_before.wav)
- [three keys held 7 s, before then after.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/held.wav)
- [held.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/held.wav)
- [held.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/held.wav)
- [range__flute_C#7_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_C#7_s1.wav)
- [flute_names57_bo3__flute_C5_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_C5_s2.wav)
- [range__flute_A#6_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_A#6_s1.wav)
- [flute_names56_bo3__flute_G#4_s3.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_G#4_s3.wav)
- [range__flute_G6_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_G6_s2.wav)
- [flute_names57_bo3__flute_F#4_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_F#4_s1.wav)
- [flute_names56_bo3__flute_F5_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_F5_s1.wav)
- [range__flute_E7_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_E7_s2.wav)
- [flute_names56_bo3__flute_D4_s3.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_D4_s3.wav)
- [range__flute_C#6_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_C#6_s1.wav)
<sub>`gsl-steward-077` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-076" -->
### 2026-10-15 — cycle 37 — The MusicGen Violin is finished. Every key now sits at one level, a held note barely swells, and soft playing is darker. It ships as SFZ and DecentSampler.
> shipped · 42 keys G3–C7, on pitch, seams clean · unheard · steward leans LISTEN-THEN-INTERVIEW

**What I did** ([finish_instrument.py](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/ai-source-probe/finish_instrument.py)). I measured each sample's looping stretch and scaled every WAV so all the loops sit at one level. Before the loop, quiet stretches are lifted toward it and the model's loud first stroke is pulled down. The loop itself and the 100 ms before it are untouched, so the seams that passed last cycle are the same audio, only scaled. The samples are renamed for the key they sound (violin_G3.wav), and the SFZ now gets quieter and darker as you play softer.

**Hear it in place.** [phrase_before.wav](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase_before.wav) then [phrase.wav](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase.wav) are the same scale and eight-bar tune, last build then finished. In the first one, C4 drops out like someone else picked up the bow. [held.wav](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/held.wav) holds low, middle and high keys for 7 s, before then after. [velocity.wav](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/velocity.wav) is one key bowed soft to hard.

**To play it:** drag [MusicGen Violin.dslibrary](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/MusicGen Violin.dslibrary) onto the free DecentSampler plugin. The [README](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/ai-source-probe/instruments/finished/violin/README.md) says what to play and what to listen for.

This also commits the range-trimming and loop-carrying code from the last two cycles, which had been built but never committed.

**Artifacts:**
- [the finished violin: a two-octave scale and an eight-bar tune. Listen for one player.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase.wav)
- [the same scale and tune on last build: hear the keys jump in level.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/phrase_before.wav)
- [low, middle, high key held 7 s, last build then finished.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/held.wav)
- [one key bowed at velocity 30, 60, 90, 127: softer is quieter and darker.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/velocity.wav)
- [drag onto the free DecentSampler plugin.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/MusicGen Violin.dslibrary)
- [for sforzando, sfizz, Surge XT, Bitwig.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/MusicGen Violin.sfz)
- [the DecentSampler preset on its own.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/MusicGen Violin.dspreset)
- [what to open, what to play, what to listen for, what is not verified.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/README.md)
- [every number, per key: level change, lift, swell before and after, seam check.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/finishing.json)
- [DecentSampler read-back: 42/42 keys on pitch.](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/decentsampler.check.json)
- [the finishing pass: one level, tamed swell, velocity, names.](Projects/Generative Sample Libraries/ai-source-probe/finish_instrument.py)
- [the probe design notes, now with the finishing pass.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)
- [instrument-range trimming from the in-range build, not committed before.](Projects/Generative Sample Libraries/ai-source-probe/build_sfz.py)
- [loop points carried into the preset, not committed before.](Projects/Generative Sample Libraries/ai-source-probe/to_decentsampler.py)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_A#3.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_A#4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_A#5.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_A3.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_A4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_B3.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_B4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_C#4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_C#5.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_C4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_C5.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_C6.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_D#4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_D4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_E4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_E5.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_F#4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_F#5.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_F4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_F5.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_G#4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_G3.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_G4.wav)
- [finished sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/finished/violin/samples/violin_G5.wav)
- [last build (the finishing pass reads it)](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/held.wav)
- [last build (the finishing pass reads it)](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/loopcheck.json)
- [last build (the finishing pass reads it)](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_looped.dslibrary)
- [last build (the finishing pass reads it)](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_looped.dspreset)
- [last build (the finishing pass reads it)](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_looped.sfz)
- [last build (the finishing pass reads it)](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/shaping.json)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/range__violin_A#4_s2.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/range__violin_C#5_s1.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_A#3_s4.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_A#4_s3.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_C#4_s5.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_E4_s4.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_E4_s5.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_G3_s5.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_G5_s4.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_G5_s5.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_B3_s1.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_B4_s2.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_D5_s3.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_F4_s3.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_F5_s1.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_G#3_s1.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_A3_s1.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_A4_s2.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_C5_s1.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_C5_s2.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_C5_s3.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_D#4_s3.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_F#4_s1.wav)
- [last build sample, source of the finished one](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_F#4_s2.wav)

_MusicGen Violin · last build (looped) vs finished_
| check | last build | finished |
| --- | --- | --- |
| loop level, quietest to loudest key | 21.3 dB apart | matched |
| the tune: biggest jump between neighbouring notes | 14.4 dB | 3.1 dB |
| the tune: note-to-note level spread (std) | 3.4 dB | 1.1 dB |
| worst swell from a note's start into its loop | 8.6 dB | 4.3 dB |
| seams clean on a 12 s hold | 24 / 24 | 24 / 24 (worst click +3.0 dB, limit +6) |
| keys on pitch, SFZ and DecentSampler | 42 / 42 | 42 / 42, worst 2.4 cents |
| velocity | volume only | softer = quieter and darker (SFZ) |

_Left rough:_ Nobody has heard it in a sampler; the numbers come from a Python model of SFZ playback, and the velocity filter is my model of sforzando's, not sforzando itself. DecentSampler gets volume-by-velocity only. C4's take loops a quiet stretch and was lifted 19 dB to match, so it may carry more bow noise than its neighbours. A#3 still swells 4.3 dB because its loop starts too early to lift. The flute and marimba haven't had this pass.

_Next moves named:_ Your ears on phrase.wav, or the .dslibrary in DecentSampler. If it sounds like one player, the plan's AI-source step has its first finished instrument. · The other half of that step: put the critique-and-regenerate loop inside the interview, so a weak key (like C4) is re-rendered on request instead of patched by gain. · Run the same finishing pass on the flute.
<sub>`gsl-steward-076` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-074" -->
### 2026-10-13 — cycle 36 — The AI violin and flute now loop while a key is held, instead of stopping when the 3–5 second take runs out.
> shipped · 45/45 loops pass seam + 12 s pitch check · unheard · steward leans ear-check held.wav

The MusicGen takes are 3 to 5 seconds long, so a held key went silent around the 4-second mark. The new script loop_sustain.py builds a violin_looped and a flute_looped instrument beside the ones you have. For each sample it searches for a loop a whole number of wave cycles long, past the bow-on and short of the tail, scoring each candidate on how alike the waveform and the level are where the loop joins. It may only loop audio where the pitch tracker hears the take's own note. A 60 ms crossfade is baked into the WAV, and the same loop points go three places: the SFZ (loop_sustain), a smpl chunk inside each WAV (what hardware samplers and most importers read), and the rebuilt DecentSampler preset and library.

Then I held every sample's own key for 12 s through a loop-aware player and checked for clicks at each loop point, level pumping, and pitch across the whole hold. The best few candidate loops are tried in order until one passes all three. The first pass needed three fixes. A plain crossfade dipped 2–5 dB wherever the two blended stretches were partly out of phase, which pumps, so I switched to a level-preserving crossfade. A 'loop only flat-level stretches' rule found almost nothing, because these takes swell like played phrases. And without the pitch gate, the best-matching loop sat on breath (violin C5) or on a stretch with an added octave-low tone (violin A#5). The DecentSampler presets still match the SFZs key for key.

**Artifacts:**
- [violin: low, middle, high key held 7 s, first as shipped (it stops), then looped](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/held.wav)
- [flute: the same before/after](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/held.wav)
- [violin, looped, for the free DecentSampler plugin](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_looped.dslibrary)
- [flute, looped, for the free DecentSampler plugin](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/range+flute_names56_bo3+flute_names57_bo3_flute_looped.dslibrary)
- [violin DecentSampler preset with loopStart/loopEnd](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_looped.dspreset)
- [flute DecentSampler preset with loopStart/loopEnd](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/range+flute_names56_bo3+flute_names57_bo3_flute_looped.dspreset)
- [violin SFZ, loop_sustain](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_looped.sfz)
- [flute SFZ, loop_sustain](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/range+flute_names56_bo3+flute_names57_bo3_flute_looped.sfz)
- [per-sample loop points and seam measurements, violin](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/loopcheck.json)
- [per-sample loop points and seam measurements, flute](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/loopcheck.json)
- [violin attack-shaping record, carried over](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/shaping.json)
- [flute attack-shaping record, carried over](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/shaping.json)
- [DecentSampler parity check on the looped presets](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/decentsampler.looped.check.json)
- [the loop finder, crossfade, smpl writer and seam check](Projects/Generative Sample Libraries/ai-source-probe/loop_sustain.py)
- [now carries loop points into the preset and reads them back](Projects/Generative Sample Libraries/ai-source-probe/to_decentsampler.py)
- [parse_sfz now reads loop_start/loop_end](Projects/Generative Sample Libraries/ai-source-probe/build_sfz.py)
- [new section: Sustain loops (cycle 36)](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_B4_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_D4_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_D5_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_F5_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_F5_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_G#3_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names56_bo3__flute_G#4_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_A3_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_C4_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_C4_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_C5_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_D#4_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/flute_names57_bo3__flute_F#4_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_A#6_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_C#5_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_C#6_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_C#7_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_E4_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_E7_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_G5_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_looped/samples/range__flute_G6_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/range__violin_A#4_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/range__violin_C#5_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_A#3_s4.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_A#4_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_C#4_s5.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_E4_s4.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_E4_s5.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_G3_s5.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_G5_s4.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_bo5__violin_G5_s5.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_B3_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_B4_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_D5_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_F4_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_F5_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names56_bo3__violin_G#3_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_A3_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_A4_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_C5_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_C5_s2.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_C5_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_D#4_s3.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_F#4_s1.wav)
- [looped sample](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_looped/samples/violin_names57_bo3__violin_F#4_s2.wav)

_Sustain loops, every sample's key held 12 s_
| instrument | samples | no click / no pump | on pitch across 12 s | worst click | worst extra wobble | loop length | DecentSampler keys on pitch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| violin | 24 | 24 | 24 | +3.0 dB (limit +6) | 0.4 dB (limit 1.5) | 0.35–1.52 s | 42/42 |
| flute | 21 | 21 | 21 | +4.8 dB (limit +6) | 0.6 dB (limit 1.5) | 0.35–1.60 s | 38/38 |

_Left rough:_ Unheard, by me or by you. The loop often sits in a louder part of the take than its opening, so a held note swells into it (up to about 6 dB on violin). sforzando and DecentSampler haven't loaded the loop points yet; I wrote and read them back myself. The flute's C#5 take has its second harmonic 13 dB above its fundamental, so pitch detection can call it an octave high depending on the window.

_Next moves named:_ Even out the swell into the loop: match the opening's level to the loop's with a slow gain ramp before the loop start, then re-run the same seam check. · Continue writing every open format: SF2 through ConvertWithMoss from the looped SFZs, then check that the smpl loop points survive the conversion.
<sub>`gsl-steward-074` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-072" -->
### 2026-10-13 — cycle 35 — Violin, flute and marimba now each ship as a DecentSampler instrument, with the same keys and every key in tune.
> shipped · your ear call on the three instruments still open · steward leans keep building formats

I wrote to_decentsampler.py, the palace's first DecentSampler writer (I found no earlier one). It reads a built SFZ and writes two files beside it: a .dspreset, which is the XML mapping with Attack, Release and Volume knobs in the Graphite house colours, and a .dslibrary, which zips that preset together with its samples. The script then reads the preset back off disk and plays every key through its mapping with the same pitch check the SFZ builds use. So the claim is about the files as written, not what the writer meant to write.

Two things had to be translated, and the preset says so in its own comments. First, SFZ gives fine-tuning in cents and DecentSampler wants semitones, so the value is divided by 100. Second, SFZ's one-shot mode, where a note plays to the end even after you lift the key, has no DecentSampler equivalent. The marimba gets a 6-second release instead, so each strike rings out after the key comes up.

One trap, now closed. My first check ran in a Python without librosa, and the check quietly fell back to a cruder pitch tracker that often gets notes an octave wrong. It reported the flute as 34/38 keys in tune and an older flute build as 42/59, though both had passed in full. In the project's own Python setup the numbers match exactly, and the script now refuses to grade without librosa.

**Artifacts:**
- [the converter: SFZ in, DecentSampler preset and zip out, then a key-by-key check of the result](Projects/Generative Sample Libraries/ai-source-probe/to_decentsampler.py)
- [violin, drop into DecentSampler](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_shaped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_shaped.dslibrary)
- [violin preset, readable XML](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_shaped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_shaped.dspreset)
- [flute, drop into DecentSampler](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_shaped/range+flute_names56_bo3+flute_names57_bo3_flute_shaped.dslibrary)
- [flute preset, readable XML](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_shaped/range+flute_names56_bo3+flute_names57_bo3_flute_shaped.dspreset)
- [marimba, drop into DecentSampler](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/marimba_hit_rung/marimba_hit_ab+marimba_hit_bo3+marimba_hit_mid_bo5_marimba_hit_rung.dslibrary)
- [marimba preset, with the 6-second release standing in for one-shot](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/marimba_hit_rung/marimba_hit_ab+marimba_hit_bo3+marimba_hit_mid_bo5_marimba_hit_rung.dspreset)
- [the check behind the table](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/decentsampler.check.json)

_Each DecentSampler instrument, read back from disk and played on every key_
| instrument | same keys as SFZ | keys in tune | worst cents | zip size |
| --- | --- | --- | --- | --- |
| violin (bowed on) | yes | 42 / 42 | 2.4 | 6.8 MB |
| flute (bowed on) | yes | 38 / 38 | 4.3 | 6.3 MB |
| marimba (rung out) | yes | 37 / 37 | 1.5 | 2.1 MB |

_Left rough:_ Nobody has opened these in DecentSampler, so plugin loading, knob layout and the marimba's 6-second release are all unverified until you drag a .dslibrary in. To try it, open the violin zip ([open:Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_shaped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_shaped.dslibrary?reveal]) and play a few keys.

_Next moves named:_ When you answer the ear question on the three instruments, carry the winner forward and put it through the critique-and-regenerate loop inside the interview · Next format: write loop points into each WAV's smpl chunk and check loop seams for clicks, so the bowed violin and flute can sustain past their sample length · Then SF2, converted from the SFZ with ConvertWithMoss
<sub>`gsl-steward-072` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-070" -->
### 2026-10-13 — cycle 34 — Three AI-sourced instruments, one tune each. Which one sounds most like a single player?
> still working · all keys in tune · steward leans your ear on the violin first

Catch-up: this project's current move is making an audio AI a real source. MusicGen plays each note, pitch detection files every take under the note it actually played, and the steadiest takes become the instrument. The move counts as done when one of these sounds right to you. Measurement can't get it there for you. This cycle I trimmed the violin, flute and marimba to their real ranges, and gave each one a 40-second scale-and-tune that crosses 9 to 14 different samples. Pick the one that holds together best, or tell me where a note jumps out. If you name a note, I'll re-render just that one. I'm still working either way. Next I'm packaging these as DecentSampler presets, which doesn't need your answer.

**Artifacts:**
- [Violin tune.](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_shaped/phrase.wav)
- [Flute tune.](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_shaped/phrase.wav)
- [Marimba tune.](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/marimba_hit_rung/phrase.wav)
- [ab.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/ab.wav)
- [audition.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/audition.wav)
- [range__flute_C#7_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/range__flute_C#7_s1.wav)
- [flute_names57_bo3__flute_C5_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/flute_names57_bo3__flute_C5_s2.wav)
- [range__flute_A#6_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/range__flute_A#6_s1.wav)
- [flute_names56_bo3__flute_G#4_s3.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/flute_names56_bo3__flute_G#4_s3.wav)
- [range__flute_G6_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/range__flute_G6_s2.wav)
- [flute_names57_bo3__flute_F#4_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/flute_names57_bo3__flute_F#4_s1.wav)
- [flute_names56_bo3__flute_F5_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/flute_names56_bo3__flute_F5_s1.wav)
- [range__flute_E7_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/range__flute_E7_s2.wav)
- [flute_names56_bo3__flute_D4_s3.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/flute_names56_bo3__flute_D4_s3.wav)
- [range__flute_C#6_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/samples/range__flute_C#6_s1.wav)
<sub>`gsl-steward-070` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-069" -->
### 2026-10-13 — cycle 34 — Violin, flute and marimba now stop where the real instruments stop, and each plays a 40-second tune so you can hear whether it sounds like one player.
> shipped · all keys in tune by measurement · not heard yet · steward leans your ear on the violin tune first

Trimmed to the real instrument. The builder now takes the real instrument's range. A take that sounds outside that range is dropped, however steady it is: MusicGen will happily play a 'violin' at E2, and a violin can't. No sample stretches past the edge, either. Violin G3 up: 24 samples over 42 keys, all in tune, worst 2.4 cents. Flute C4 up: 21 samples over 38 keys, worst 4.3 cents. Marimba A2–A5, rung out the way you picked: 15 samples over 37 keys, worst 1.5 cents.

A tune instead of a staircase. Until now each audition was a rising line, one key after another. That proves every key sounds, but not that neighbouring samples sound alike. phrase.py plays a slow two-octave scale and then an eight-bar legato tune with leaps in it, through the same bow attack and release the SFZ uses. The tune crosses 9 to 14 different samples per instrument, so a take that sounds like a different player should stand out in the first phrase. Notes are in DESIGN.md under 'Trimmed to the real instrument'.

**Artifacts:**
- [Violin, G3 up: scale, then the tune. 14 of its 24 samples heard.](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_shaped/phrase.wav)
- [Flute, C4 up: scale from C5, then the tune. 9 of 21 samples heard.](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_shaped/phrase.wav)
- [Marimba, A2–A5, rung out: scale from C3, then the tune. 9 of 15 samples heard.](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/marimba_hit_rung/phrase.wav)
- [The in-range violin SFZ (bow attack).](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/violin_shaped/range+violin_bo5+violin_names56_bo3+violin_names57_bo3_violin_shaped.sfz)
- [The in-range flute SFZ (bow attack).](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/flute_shaped/range+flute_names56_bo3+flute_names57_bo3_flute_shaped.sfz)
- [The in-range marimba SFZ (rung out).](Projects/Generative Sample Libraries/ai-source-probe/instruments/in_range/marimba_hit_rung/marimba_hit_ab+marimba_hit_bo3+marimba_hit_mid_bo5_marimba_hit_rung.sfz)
- [New: plays a scale and a tune through a built instrument.](Projects/Generative Sample Libraries/ai-source-probe/phrase.py)
- [Builder, now with --range for the real instrument's range.](Projects/Generative Sample Libraries/ai-source-probe/build_sfz.py)
- [Design notes; new section for this cycle.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)

_Before and after trimming to the real range · every key checked by pitch detection_
| instrument | before | in range | in tune | worst |
| --- | --- | --- | --- | --- |
| violin | 25 samples · 57 keys E2–C7 | 24 samples · 42 keys G3–C7 | 42/42 | 2.4 c |
| flute | 26 samples · 59 keys D#2–C#7 | 21 samples · 38 keys C4–C#7 | 38/38 | 4.3 c |
| marimba (rung) | 15 samples · 40 keys | 15 samples · 37 keys A2–A5 | 37/37 | 1.5 c |

_Left rough:_ I haven't heard the tunes. Measurement says every key is in tune, but whether the samples blend is an ear question. The flute still uses the violin's bow attack. The keys above each instrument's highest steady take stay silent (violin above C7, flute above C#7, marimba above A5). The 131 sample WAVs behind the SFZs (71 MB) aren't in the artifact list, so they won't be committed. They can all be rebuilt with one command from the graded runs, and that command is in DESIGN.md.

_Next moves named:_ Package the in-range instruments as DecentSampler presets (the XML plus the WAVs, zipped), so you or a participant can load them in the free plugin without sforzando · Give the flute its own breath-style attack instead of the violin's bow, and A/B it against the current one · Once one of the three sounds right to you, write the critique-and-regenerate step into the interview: you name a bad zone, and it re-renders just that note
<sub>`gsl-steward-069` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-45-32-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the entry's development plan

Carried over on 2026-09-25 from the Development Plan in [[Generative Sample Libraries]], when plans moved into scrolls (SCHEMA v1.25). The two finished phases (the Talking Keyboard loop and the interview skill) and the onset-trim pipeline step stay in the entry as what is behind the plan. Of the multi-source phase, palace synthesis is done and dropped; audio AI comes first because Loudon pointed the work there on 2026-06-25 (grant on gsl-steward-037), ahead of the folder source the plan had listed first. The interview skill's graduation, which Loudon granted on 2026-06-06 (grant on gsl-steward-031) and which was never carried out, is written in as its own move. Phase numbers were replaced by names.
<sub>`plan-2026-09-25T20-45-32-04-00` · plan agreed · agreed 2026-09-25T20:45:32-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-067" -->
### 2026-09-24 — cycle 33 — The fix works on a second instrument. The flute now has 26 real samples instead of 11, and all 59 keys play in tune.
> shipped · flute rendered, graded, built · not heard yet · steward leans trim the tails next

What I did. The flute started from the range sweep alone: two takes on every third semitone, so again only E, G, A# and C#. I let fill-names.sh start from that sweep when there's no best-of-5 run, then asked for the eight missing note names, G#3 to F#5, three takes each. That's 48 takes, about 8 minutes.

What came back. 16 takes played the note in the octave I asked for. 22 played the right note in another octave (14 an octave up, 6 an octave down, 1 two down), and 10 wobbled. The octave misses count, because each one is filed under the key it actually plays.

The flute, bowed on the same way as the violin: 26 real samples instead of 11. 59 keys, all 59 in tune, worst 4.7 cents. From A#3 to C#6, every key is at most one semitone from its own recording. Before, one sample covered up to five keys. The flute takes also start cleaner than the violin's. The deepest bow cut is 0.42 s, against 1.6 s on the violin.

Why I didn't render the violin's low end, as I'd planned last cycle. E2–F3 is below a violin's lowest string, G3. The flute's low tail is below a real flute's range too, which starts at C4. Rendering real samples there would mean asking MusicGen for notes the instrument can't play. The honest fix is to trim those tails, not fill them. The notes are in DESIGN.md under 'The fix carries to the flute'.

**Artifacts:**
- [The 26-sample flute, bowed on: a rising line across its range.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/audition.wav)
- [Each flute sample before and after the soft attack.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/flute_shaped/ab.wav)
- [The 11-sample flute from the range sweep alone, for comparison.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_range/flute_shaped/audition.wav)

_Flute, filed by the note it played and bowed on · every key checked by pitch detection_
|  | real samples | keys | in tune | worst | widest zone, A#3–C#6 |
| --- | --- | --- | --- | --- | --- |
| range sweep only | 11 | 58 (E2–C#7) | 58/58 | 6.0 c | 5 keys |
| + missing names | 26 | 59 (D#2–C#7) | 59/59 | 4.7 c | 2 keys |

_Left rough:_ I haven't heard it. Pitch detection passed, but whether 26 different MusicGen takes sound like one flute is a question for your ears. And I used the violin's bow attack on the flute, which may not be the right attack for a breathy instrument. The octave tails at each end still stretch one sample about 12 keys. Nothing is committed.

_Next moves named:_ Trim each instrument to the range the real instrument plays (violin from G3, flute from C4), so the sampler stops stretching into notes the real instrument can't reach · Run fill-names.sh on the marimba's top (F4 up) and on piano, bass and choir, which still have only four note names each · Once one instrument sounds right to you, package it as a DecentSampler preset so anyone can load it
<sub>`gsl-steward-067` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-065" -->
### 2026-09-24 — cycle 32 — The violin now has 25 real samples (was 11), and every semitone from A3 to C5 has its own sample instead of a stretched neighbor.
> shipped · rendered, graded and built this cycle · not heard yet · steward leans your ear on it next

What I made. A small script, fill-names.sh, renders the note names a pool is missing and rebuilds the instrument from everything. For the violin it asked for G#3 to F#5 on the eight missing names, 3 takes each: 48 takes, about 8 minutes.

What came back. 45 of the 48 takes held a steady pitch. Only 14 were in the octave I asked for: 12 came back an octave up, 15 an octave down, and 4 were close enough to retune. None of that is waste now. Each take is filed under the key it actually plays.

The violin, bowed on as before: 25 real samples instead of 11. It covers 57 keys (E2 to C7), all 57 in tune, worst 7.5 cents. From A3 to C5 every key plays its own recording, so nothing there is pitch-stretched and the tone should stay even as you play up the scale. The edges haven't changed. Below F3, one take still stretches down 13 keys, and the top also stretches one take.

The notes are in DESIGN.md under 'Filling the missing note names'.

**Artifacts:**
- [The 25-sample violin, bowed on: a rising line across its range.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/violin_shaped/audition.wav)
- [Each violin sample before and after the bow attack.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played_names/violin_shaped/ab.wav)
- [Last cycle's 11-sample violin, for comparison.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played/violin_shaped/audition.wav)

_Violin, filed by the note it played and bowed on_
|  | real samples | keys | in tune | worst |
| --- | --- | --- | --- | --- |
| cycle 31 | 11 | 55 (E2–A#6) | 55/55 | 7.5 c |
| cycle 32 | 25 | 57 (E2–C7) | 57/57 | 7.5 c |

_Left rough:_ Nobody has heard it yet, me included; the tuning check passed, but whether the new samples sound alike is an ear question. Some takes opened quietly, so the bow cut goes deep (one C5 take starts 1.6 s in). The low end, E2 to F3, is still one sample stretched down 13 keys.

_Next moves named:_ Render the violin's low end (asked around E3 to F4, since takes often land an octave down) so E2–F3 stops leaning on one stretched sample · Run fill-names.sh on the flute, which sits at 16 keys from two takes per note, to see if the fix carries to a second instrument
<sub>`gsl-steward-065` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-063" -->
### 2026-09-24 — cycle 31 — I filed every take under the note it actually played. The marimba now has 15 real samples (was 10) and the violin 11 (was 8), and every key plays in tune.
> shipped · no new renders · not heard yet · steward leans fill the violin's missing notes next

What I built. The builder can now file every steady take under the key it sounds at, and pool several runs into one instrument. For each key it keeps the steadiest take, whatever note that take was asked for. Before a pick is final it gets played back at its own key, and if it fails, the next take at that key gets a turn.

Marimba: 15 real samples instead of 10, F#3 to A4, rung out as you chose. 40 keys, all 40 in tune, worst 1.5 cents. Some new samples came from takes that missed their octave: the F#3 was asked for F#5, the A3 for A5, the G4 for G5.

Violin, with the new bow attack: 11 real samples instead of 8. 55 keys instead of 35, all in tune, worst 7.5 cents.

Two things I learned. First, refiling moves a take to a different octave, never to a different note name. Both violin runs asked for every third semitone from the same start, so every violin take is an E, G, A# or C#. No amount of refiling fills the other eight note names; only new renders can. The marimba doesn't have this problem because its middle was rendered on every semitone. Second, a marimba roll can read an octave above its own single strike. The first E4 take sounded E4 as a roll and E3 once cut to one hit, so two keys played an octave low. The ringing step used to accept an octave-off strike because tuning would fix it, but tuning only fixes up to 60 cents. It now refuses those, and found another E4 take whose single hit really is E4.

The other four instruments gain almost nothing from refiling (piano 8 keys to 8, flute 15 to 16, bass 9 to 10, choir 8 to 9), because the range sweep has only two takes per note. Refiling pays off where there are many takes per note. Write-up is in DESIGN.md under 'Filed by the note it played'.

**Artifacts:**
- [Marimba, filed by played note and rung out: a rising line from F#2 to A5, 15 real samples.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played/marimba_hit_rung/audition.wav)
- [Each of the 15 marimba notes three ways: the roll as MusicGen played it, one hit, and the hit rung out.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played/marimba_hit_rung/ab.wav)
- [Last cycle's 10-sample marimba, for comparison.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_mid_bo5/marimba_hit_rung/audition.wav)
- [Violin, filed by played note, bowed on by the sampler: a rising line from E2 to A#6, 11 real samples.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played/violin_shaped/audition.wav)
- [Each violin sample before and after the bow attack.](Projects/Generative Sample Libraries/ai-source-probe/instruments/by_played/violin_shaped/ab.wav)
- [The earlier 8-sample violin, for comparison.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5_shaped/audition.wav)

_Filed by the note asked for vs the note played · every key checked by pitch detection_
| instrument | real samples | keys covered | keys in tune | worst |
| --- | --- | --- | --- | --- |
| marimba, before | 10 (F#3–D#4) | 34 | 34/34 | 8.7 c |
| marimba, now | 15 (F#3–A4) | 40 | 40/40 | 1.5 c |
| violin, before | 8 | 35 (D3–C6) | 35/35 | 4.0 c |
| violin, now | 11 (E3–A#5) | 55 (E2–A#6) | 55/55 | 7.5 c |

_Left rough:_ I haven't listened to either one. The violin's new edges, E2–D#3 and B5–A#6, are each a single sample stretched up to an octave, which may sound thin. Three low violin keys (A2, C#3, F#3) had steady takes that failed when played back, so they were left out. The octave rule also applies to older builds, but I haven't rebuilt them. Nothing is committed.

_Next moves named:_ Render the violin's eight missing note names inside its home band (G3–E5), three takes each, in one short batch run in the background, then refile and rebuild. That should give a real sample on nearly every semitone. · For the marimba, render the note names still missing above D#4 (F4, G4 area) so the top of its band doesn't stretch from neighbours. · Draw each instrument's edge between real samples and sampler stretching, so you can hear where it is in sforzando.
<sub>`gsl-steward-063` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-061" -->
### 2026-09-23 — cycle 30 — I mapped where MusicGen really plays six instruments. It gets the note name right about half the time, but almost never the octave.
> shipped · 300 takes graded · steward leans FILE-BY-WHAT-IT-PLAYED

I asked for piano, violin, marimba, flute, bass and choir from C1 to about E7, every third semitone, two takes each: 300 takes, all graded by pitch detection. The picture is the same for every instrument. MusicGen takes the note name from the guide tone and puts it in its own comfortable register, roughly A2 to C5. Ask for C6 and you get a C, but around C4. 165 of the 300 takes (55%) played the right note steady. Only 37 (12%) played it in the octave we asked for. Each instrument's playable band, where it plays the octave we asked for, is barely an octave wide, always in the middle. Even 'bass' never goes below about G2. What this means: I should stop filing each sample under the note I asked for and file it under the note it actually played. The takes that come back an octave off are good samples of a different key. That turns the 12% into 55%. It also tells us the whole keyboard can't come from MusicGen alone: the top and bottom octaves will need the sampler to stretch notes from the middle, or a different source.

**Artifacts:**
- [Asked against played, one panel per instrument. Solid line means it played what we asked; the dotted diagonals are the octave-off takes.](Projects/Generative Sample Libraries/ai-source-probe/range.png)
- [Each instrument's playable band and its home register, in numbers.](Projects/Generative Sample Libraries/ai-source-probe/range.json)

_MusicGen-melody + sine guide · asked C1–E7 every 3 semitones · 2 takes per note_
| instrument | right note (any octave) | right octave | plays the asked octave | where it lands |
| --- | --- | --- | --- | --- |
| piano | 23/50 | 5/50 | G3–A#3 | G2–E4 |
| violin | 29/50 | 5/50 | A#4–C#5 | A2–C#5 |
| marimba | 29/50 | 7/50 | E3–C#4 | A2–G4 |
| flute | 29/50 | 7/50 | G3–E4 | A2–C#6 |
| bass | 26/50 | 8/50 | G3–E4 | G2–G4 |
| choir | 29/50 | 5/50 | E3–C#4 | E2–E4 |

_Left rough:_ I haven't listened to any of these 300 takes. The grades are pitch detection only, so a take can be steady and in tune and still not sound like a bass or a choir. The grid is every third semitone, so band edges could be off by up to two semitones. Last cycle died because I ran the 50-minute sweep in the foreground. This time it runs detached and survives if the cycle ends.

_Next moves named:_ Refile every right-note take under the key it actually played, and rebuild the marimba and violin pools that way. Then see how many more keys get a real sample. · For each instrument, draw where real samples end and sampler stretching begins, so you can hear the edge in sforzando. · Probe whether the prompt can move the home register ('low', 'deep', 'upright bass', a lower guide tone) before accepting the stretch.
<sub>`gsl-steward-061` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-059" -->
### 2026-09-23 — cycle 28 — The marimba's middle octave now has a real sample on every semitone, F#3 to D#4, rung out the way you picked. All 34 keys play in tune.
> shipped · marimba middle filled with RING · no ear-check yet · steward leans range map next

What I did. A new one-command script, fill-middle.sh, renders every semitone from F#3 to D#4 with the one-hit prompt, five takes each. Then it grades the takes, builds the instrument, and ring-shapes it. Of 50 takes, 28 played the right note, 5 were a little off but fixable, and 17 wobbled in pitch. Every semitone still had at least one good take.

One fix on the way. The ring tool picked, for each note, the take whose hit rang longest. For A#3 that was a 2.18 s hit that slid in pitch, so one key came out of tune (33 of 34). Now it only keeps a hit that holds its note, and then prefers the longest. A#3 took a steadier take, and every key is in tune: 34 of 34, worst 8.65 cents.

What's in the middle now. Five of the ten hits already rang 1.2 s or longer on their own, so I left them alone: G3, A3, C4, C#4 and D4. Four got their ring modeled: F#3, G#3, B3 and D#4. A#3's ring model didn't fit well enough, so it keeps just the hit, cut at 1.07 s. Every note peaks at the same level, and the hits sit within about 6 dB of each other.

**Artifacts:**
- [The filled marimba: a rising line from F#2 to D#5, every sample's own note included.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_mid_bo5/marimba_hit_rung/audition.wav)
- [Each of the ten notes twice: first the roll as MusicGen played it, then the single hit rung out.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_mid_bo5/marimba_hit_rung/ab.wav)
- [Last cycle's four-sample version of the same line, for comparison.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_bo3/marimba_hit_rung/audition.wav)

_Marimba middle, ten real samples (was four)_
| note | how it ends | length |
| --- | --- | --- |
| F#3 | ring modeled | 3.56 s |
| G3 | its own ring | 1.81 s |
| G#3 | ring modeled | 4.12 s |
| A3 | its own ring | 2.13 s |
| A#3 | plain cut (model too loose) | 1.07 s |
| B3 | ring modeled | 3.45 s |
| C4 | its own ring | 1.81 s |
| C#4 | its own ring | 1.28 s |
| D4 | its own ring | 2.50 s |
| D#4 | ring modeled | 3.72 s |

_Left rough:_ I haven't heard it. A#3 is the one note that stops short (1.07 s) next to neighbours that ring 2 to 4 s, and you may hear that. Below F#3 and above D#4 are still stretched from the two edge samples, up to a full octave. Nothing is committed.

_Next moves named:_ Map each instrument's real range: the octaves MusicGen will actually play for violin, flute, bass, piano and choir, so we only ask for notes inside that range and stretch the rest honestly · Re-render A#3 with more takes, to find a hit that rings long enough to model
<sub>`gsl-steward-059` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-057" -->
### 2026-09-23 — cycle 26 — Marimba: one clean hit that stops short, or that hit left to ring out on its own harmonics? And does the violin's new attack work?
> still working · both built, both in tune on every key · steward leans RING

Catch-up: you said the violin's attack was odd and the marimba sounded like many attacks. I measured it. MusicGen starts the violin mid-note and plays the marimba as a roll, and the guide tone can't stop either. So I fix it after the render. The violin now enters its steady sustain and the sampler bows it on. The marimba keeps one hit. What I can't settle without your ears: most hits only get about 0.3 s before the model hits again. STRIKE keeps just that, which is honest but short. RING keeps the hit and lets its own harmonics decay, so the mallet is AI and the ring is modeled. I lean RING because a marimba bar rings. Play ab.wav: each note goes roll, then cut, then ring. I keep going on the range map either way.

**Artifacts:**
- [Each marimba note three ways: roll, strike, ring.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_bo3/marimba_hit_rung/ab.wav)
- [RING, rising line.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_bo3/marimba_hit_rung/audition.wav)
- [STRIKE, rising line.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_bo3/marimba_hit_shaped/audition.wav)
- [Violin before and after the new attack.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5_shaped/ab.wav)
- [audition.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5/audition.wav)
- [audition.wav](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin/audition.wav)
- [violin_G6_s5.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_G6_s5.wav)
- [violin_G6_s4.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_G6_s4.wav)
- [violin_G6_s3.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_G6_s3.wav)
- [violin_G6_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_G6_s2.wav)
- [violin_G6_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_G6_s1.wav)
- [violin_E6_s5.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_E6_s5.wav)
- [violin_E6_s4.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_E6_s4.wav)
- [violin_E6_s3.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_E6_s3.wav)
- [violin_E6_s2.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_E6_s2.wav)
- [violin_E6_s1.wav](Projects/Generative Sample Libraries/ai-source-probe/samples/ceil_mgm_cfg6/violin_E6_s1.wav)
<sub>`gsl-steward-057` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-056" -->
### 2026-09-23 — cycle 26 — I fixed the violin's odd attack and the marimba's many attacks. Same cause for both: MusicGen hands back a slice of a performance, not one note.
> shipped · violin 35/35 keys, marimba 34/34 in tune · Stable Audio dropped · steward leans RING for the marimba

What I measured. The violin: each render begins 5 to 18 dB into the note, so no bow ever touches the string and the sample opens on a cut. That's the odd attack. The marimba: it's playing a roll. On the old prompt the middle take had 17 strikes in 5 seconds, and not one of 17 takes struck just once. A marimbist holds a note by rolling, and my prompt said 'sustained' twice.

Why fixing the render won't work. MusicGen hears the guide tone as one pitch per frame and nothing else. Loudness is thrown away before the model sees it. So a guide can't say 'hit once, then fade'; it can only say 'this pitch, all the time', and for a marimba that means a roll. I tried a one-hit prompt too (no roll, no tremolo): it brought the median down from 17 strikes to 11, with 1 clean single strike in 39 takes. It helped, but it's no fix.

So the fix comes after the render, in a new tool, shape_attacks.py:
• bow (violin): skip into the steady sustain you liked, and let the sampler draw the bow on. The attack is 140 ms when played soft and 40 ms when played hard.
• strike (marimba): find every hit, keep the one that rings longest before the next hit lands, and cut there. One mallet, one note.
• ring (marimba): the same hit, then its own harmonics, measured just before the next hit, each left to die away, the lowest slowest. The mallet is AI and the ring is modeled. I only do this when the kept hit is short. A hit that already rang 1.2 s or longer keeps its own tail.
After shaping I re-measure every sample and retune it, because a single hit can sit 20 to 30 cents off the take's average pitch.

A second finding came with the marimba grid: whatever octave I ask for, MusicGen plays marimba around F#3 to D#4. Low notes come back an octave up and high notes one or two octaves down. So 13 notes asked gave 4 real samples, stretched across F#2 to D#5. That's the same kind of wall as the violin's top octave, and it's the case for mapping each instrument's real range next.

**Artifacts:**
- [Grey is what MusicGen rendered; colour is what each sample keeps. Violin, marimba strike, marimba ring.](Projects/Generative Sample Libraries/ai-source-probe/attack-shaping.png)
- [Violin: each sample as rendered, then with the new bowed attack.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5_shaped/ab.wav)
- [Violin, reshaped: a rising line D3 to C6.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5_shaped/audition.wav)
- [Marimba: the roll as rendered, then one hit cut, then one hit rung out. Three versions per note.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_bo3/marimba_hit_rung/ab.wav)
- [Marimba, strike version: a rising line F#2 to D#5.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_bo3/marimba_hit_shaped/audition.wav)
- [Marimba, ring version: the same line.](Projects/Generative Sample Libraries/ai-source-probe/instruments/marimba_hit_bo3/marimba_hit_rung/audition.wav)

_Before and after — measured on the Mac, cycle 26_
|  | as MusicGen rendered it | after shape_attacks.py | keys in tune |
| --- | --- | --- | --- |
| violin (capped D3–C6) | starts 5–18 dB into the note, no attack | enters the steady sustain; sampler bows it on, 40–140 ms | 35/35, worst 4.0 c |
| marimba, strike | a roll: middle take 11 strikes (17 on the old prompt) | one hit per sample, 0.6–2.1 s | 34/34, worst 2.6 c |
| marimba, ring | same | one hit, rung out on its own harmonics (2 of 4 samples; 2 rang long enough alone) | 34/34, worst 8.7 c |

_Left rough:_ I haven't heard any of this. The violin's bow-on is a straight fade, not a real bow bite. The rung F#3 glides about 25 cents from its hit into its ring. The D#4 marimba cut may still hold a faint second hit near its end. The marimba is only 4 real samples stretched up to 12 semitones. Nothing is committed.

_Next moves named:_ Map each instrument's real range: per instrument, the octaves MusicGen will actually play, so we ask only there and stretch honestly · Fill the marimba's middle with more takes inside F#3–D#4 once you pick strike or ring
<sub>`gsl-steward-056` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-054" -->
### 2026-09-24 — cycle 25 — Should the violin's top reach G6 by stretching one sample, or stop at C6?
> still working · both built, both in tune by measurement · steward leans CAP5

**Artifacts:**
- [capped, D3–C6](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5/audition.wav)
- [full range, G2–G6](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin/audition.wav)
<sub>`gsl-steward-054` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-053" -->
### 2026-09-24 — cycle 25 — I tried three ways to get MusicGen's violin above G5 in the right octave. None worked, so I built two honest violins for your ear.
> shipped · 60 renders on the Mac, verifier bias fixed · steward leans map each instrument's real range next

Three fixes, 20 takes each, on the violin's top four notes (A#5, C#6, E6, G6): a guide tone with overtones, a prompt that says 'in its very highest register', and guidance 6 instead of 3. Right-octave takes: 0 of 60. Why the overtone guide can never work: MusicGen boils its guide down to one pitch class per moment and drops the octave. A sine and a sine-plus-overtones share the same loudest note, so they become the same input. The overtone renders came out byte-identical to the baseline. So the guide shape isn't a lever, and neither are wording or guidance: G5 is the model's own ceiling for violin. The fix I did land is in the checker. Its pitch search stopped exactly two octaves under the target, which is where many high takes actually play. Steady, fully voiced notes were being thrown out as 'stuck at the edge'. I widened the search by an octave and regraded: steady takes went 43 → 54 of 65, every one of the 13 notes now has one, and the violin's label moves from 'texture only' to 'retunable'. The recovered takes all land two octaves down, where lower samples already play, so the instrument itself didn't change. Then I built the same eight samples two ways, both in tune on every key by measurement.

**Artifacts:**
- [full-range violin, G2–G6: listen to the last seven notes, which are G5 stretched up to an octave.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin/audition.wav)
- [capped violin, D3–C6: no sample stretched more than 5 semitones, and the top is silent instead of thin.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5/audition.wav)
- [the full-range instrument (49 keys).](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin/violin_bo5_violin.sfz)
- [the capped instrument (35 keys).](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin_cap5/violin_bo5_violin_cap5.sfz)
- [the test as one command; ceiling_table.py prints the grid.](Projects/Generative Sample Libraries/ai-source-probe/ceiling.sh)
- [the write-up, under 'The top-octave ceiling'.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)

_Violin top octave · right octave / steady / takes (after the checker fix)_
| arm | A#5 | C#6 | E6 | G6 | right octave |
| --- | --- | --- | --- | --- | --- |
| baseline (sine, guidance 3) | 0/5/5 | 0/5/5 | 0/5/5 | 0/3/5 | 0 |
| overtone guide | 0/5/5 | 0/5/5 | 0/5/5 | 0/3/5 | 0 (identical bytes) |
| 'highest register' prompt | 0/4/5 | 0/5/5 | 0/5/5 | 0/3/5 | 0 |
| guidance 6 | 0/4/5 | 0/5/5 | 0/5/5 | 0/3/5 | 0 |

_Left rough:_ Nobody has listened. 'In tune' for both violins is a measurement, not an ear. The wider search made one take wander that used to pass (E5 s1). Code from cycles 22–25 is still uncommitted in the bundle. The second build also overwrote build.json with only the capped violin's report.

_Next moves named:_ Map each instrument's real range: for each of the six, find the highest and lowest notes MusicGen will play in the right octave, so a build knows where to stop instead of stretching blind. That also gives the Interview skill an honest range to offer. · Once your ear answers gsl-steward-047, build the full six-instrument set within those ranges. · If you want violin above G5, try a different source for the top octave; this model won't go there.
<sub>`gsl-steward-053` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-051" -->
### 2026-09-24 — cycle 24 — A best-of-five violin: five takes per note, keep the steadiest. 12 of 13 notes held, and all 49 mapped keys play in tune.
> shipped · 65 renders on the Mac, one violin built · steward leans testing a richer guide for the top octave next

What I built. The probe can now aim at one instrument and a dense grid of notes, take N passes at each note, and name the run so it never overwrites the head-to-head files. `best-of.sh violin 55:91:3 5` does the whole thing: render, grade, build. The instrument builder also gained a trim step. It plays every key and shrinks each sample's zone to the keys that stay in tune. A sample that fails at its own pitch gets dropped instead of shipped.

What the violin did. 43 of 65 takes held a steady pitch at about 9 seconds each, and 12 of 13 notes had at least one. From G3 to G5, the best takes are right-octave or one-up, and the builder maps each by the pitch it actually plays. The builder kept 8 samples, and all 49 mapped keys play on target: the worst is 4 cents off, and trim had nothing to cut.

The limit. From A#5 up, every steady take came back an octave low. So the top octave (F#5 to G6) is the G5 sample stretched up as far as 12 semitones. That's in tune by measurement and probably thin to the ear. The guide tells the model the note but not the octave, and above G5 the model picks the octave it knows. Run on the earlier pooled builds, trim found one real gap in the piano (D#4 to A4) and one bad sample each in flute and bass.

**Artifacts:**
- [best-of-five violin, a rising line G2 to G6; listen for the top octave, which is one stretched G5.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin/audition.wav)
- [the instrument: 8 samples, 49 keys, every key checked.](Projects/Generative Sample Libraries/ai-source-probe/instruments/violin_bo5/violin/violin_bo5_violin.sfz)
- [the one command: instrument, note grid, number of takes.](Projects/Generative Sample Libraries/ai-source-probe/best-of.sh)
- [the write-up, under 'Best of five, one instrument'.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)

_Violin, best of five, by asked-for note_
| asked | steady takes (of 5) | landed |
| --- | --- | --- |
| G3 · A#3 · C#4 · E4 | 4 · 4 · 4 · 5 | right octave or one up |
| G4 | 1 | on target |
| A#4 · C#5 · E5 | 5 · 4 · 4 | mostly right octave |
| G5 | 2 | one on target, one an octave down |
| A#5 · C#6 · E6 | 5 · 4 · 1 | all an octave down, folded away |
| G6 | 0 | nothing held still |

_Left rough:_ No one has listened yet, and every number here is measured, not heard. The stretched top octave is the part I trust least. The builder still labels this violin TEXTURE ONLY because its 75% rule counts every take; the new header line (12 of 13 notes steady) is the number to read. The code from cycles 22–24 is still uncommitted.

_Next moves named:_ Test a richer guide for the top octave: the sine plus its second harmonic, on A#5–G6 only, five takes each, and see whether any land in the right octave. · If that doesn't help, cap the stretch at about 5 semitones so the top goes silent instead of thin, and say so in the header. · Hold the full six-instrument set until your ear answers gsl-steward-047.
<sub>`gsl-steward-051` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-049" -->
### 2026-09-23 — cycle 23 — How you name the pitch doesn't matter to MusicGen. Extra takes do: keep the best of ten and 23 of 24 notes come out steady and in tune.
> shipped · prompt test run on the Mac, 192 renders · steward leans a keep-the-best-of-five mode next

I kept the matrix from last run (6 instruments × 4 notes × 2 seeds) and the hummed guide, and changed only the prompt wording. The result: on every wording, every render that held a steady pitch played the note we asked for. The guide does all the pitch work. How often a render holds steady ranges from 20 to 28 of 48 across wordings, and seed luck alone could scatter it that much. No wording fixes the octave either: 7–9 of 48 land in the right octave whatever the prompt says. That's fine, because the builder already maps each sample by the pitch it actually plays. So the current wording stays. The useful discovery is in the takes. Pool all ten takes per note (five wordings × two seeds) and 23 of 24 notes have at least one steady, correct take. The only miss is a high choir G. About half of all takes hold still, which suggests a simple rule: render five, keep the steadiest. I rebuilt the six instruments from the best of ten. Keys playing on target, before → after: violin 20/32 → 35/35, marimba 23/33 → 35/40, bass 18/32 → 36/40. Flute plays more keys (33 → 43 of 52), but a smaller share of them are on pitch. Choir dropped (36/45 → 27/40). Piano barely moved (23/45); the model rarely holds a piano note still.

**Artifacts:**
- [all five wordings side by side, every render playable.](Projects/Generative Sample Libraries/ai-source-probe/compare.prompt-shape.html)
- [best-of-ten violin, a rising line: 35 of 35 keys on pitch.](Projects/Generative Sample Libraries/ai-source-probe/instruments/mgm_pool/violin/audition.wav)
- [best-of-ten marimba: 35 of 40 keys on pitch.](Projects/Generative Sample Libraries/ai-source-probe/instruments/mgm_pool/marimba/audition.wav)
- [best-of-ten bass, up from 18 to 36 keys on pitch.](Projects/Generative Sample Libraries/ai-source-probe/instruments/mgm_pool/bass/audition.wav)
- [the write-up, under 'Prompt shape'.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)

_Prompt wording · MusicGen-melody + hummed guide · 48 renders each_
| wording | held steady | right note | right octave | instruments passing |
| --- | --- | --- | --- | --- |
| note C4 (pitch 261.63 Hz) — current | 28 | 28 of 28 | 8 | violin, marimba |
| note C4 | 23 | 23 of 23 | 9 | — |
| a 261.63 Hz tone | 20 | 20 of 20 | 7 | violin |
| middle C | 23 | 23 of 23 | 9 | — |
| no pitch words | 27 | 27 of 27 | 9 | bass |

_Left rough:_ Two seeds per cell can't separate the wordings statistically, so 'wording doesn't matter' means no difference big enough to see, not a proven zero. No one has listened to the pooled auditions yet, and the timbre is the real unknown. The builder still labels the pool TEXTURE ONLY because it applies the 75% rule across all 80 takes; ignore that label for pooled builds. Nothing is committed: this cycle's code sits uncommitted next to cycle 22's.

_Next moves named:_ Add a keep-the-best-of-N mode to the probe (render N takes per note, keep the steadiest) so a best-of-five build is one command. · Build one denser instrument (violin, every third semitone, best of five) as a single audition, and hold the full set until your ear signs off on timbre.
<sub>`gsl-steward-049` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-047" -->
### 2026-09-23 — cycle 22 — The numbers pick MusicGen-melody. Do its violin and marimba sound like a violin and a marimba to you?
> still working · head-to-head done, 17 instruments built · steward leans MUSICGEN-MELODY

Catch-up: source three asks an audio AI model for a specific note and checks whether it played it. Tonight the head-to-head you picked in August ran for real on the Mac. With a hummed guide, MusicGen played the right note on every render it held steady (28 of 28, mostly in the wrong octave, which the sampler fixes). Stable Audio mostly made texture. With words alone, MusicGen held notes but picked its own. So I'm carrying MusicGen-melody forward. The grader can say a note is in tune; it can't say it sounds like a violin. That's your ear. I'll keep working either way: next I'm tightening the sample picks, then the prompt-wording test. The one thing waiting on you is the full-size MusicGen instrument, which I won't build until you've heard these.

**Artifacts:**
- [MusicGen-melody violin, rising line.](Projects/Generative Sample Libraries/ai-source-probe/instruments/musicgen_melody/violin/audition.wav)
- [MusicGen-melody marimba, rising line.](Projects/Generative Sample Libraries/ai-source-probe/instruments/musicgen_melody/marimba/audition.wav)
- [Stable Audio marimba, for contrast.](Projects/Generative Sample Libraries/ai-source-probe/instruments/stable_audio/marimba/audition.wav)
- [compare.dry-run.html](Projects/Generative Sample Libraries/ai-source-probe/compare.dry-run.html)
<sub>`gsl-steward-047` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-046" -->
### 2026-09-23 — cycle 22 — The head-to-head ran for real: a melody guide makes MusicGen play the note you ask for, every time it holds still, in the wrong octave.
> shipped · 192 renders graded, 17 instruments built · steward leans MUSICGEN-MELODY

I woke on the Mac, so I ran the one command instead of polishing it. The first run broke in four places no dry run could have found. I fixed each one and reran the full matrix.

1. The MusicGen venv recipe was missing torchaudio. Added.
2. The big one: MusicGen-melody was ignoring every prompt and every melody guide. Newer transformers hands generation an empty cache on step one, and the model drops its conditioning whenever a cache exists. "Solo violin" and "heavy metal drums" came back byte-identical. What first looked like a broken GPU was this bug. I patched it in the adapter (`_keep_conditioning`), and it now runs at about 10 s a note on the M1's GPU.
3. The grader counted a pitch tracker stuck at the bottom of its search range (exactly two octaves down, zero wobble) as a steady note. Two octaves down is the same note name, so it would have flattered MusicGen-melody by 10 cells. Readings within 15¢ of the range edge now grade as texture. All 48 mock test cells keep their old grades.
4. The instrument builder crashed when its audition line crossed a gap in the keyboard. Gap keys are now silent.

I also added a tripwire. If every render in an arm has nearly the same spectrum, the grader says the arm is broken rather than blaming the model. It would have flagged bug 2 on the first pass.

The prediction written before any render held: the melody guide carries the note, not the octave. The table is below; the full per-cell page is compare.html.

**Artifacts:**
- [the head-to-head page: every cell, every grade, a player per render.](Projects/Generative Sample Libraries/ai-source-probe/compare.html)
- [MusicGen-melody violin, built from its graded run: a rising line across the keyboard.](Projects/Generative Sample Libraries/ai-source-probe/instruments/musicgen_melody/violin/audition.wav)
- [MusicGen-melody marimba, the other melody-arm instrument that passes.](Projects/Generative Sample Libraries/ai-source-probe/instruments/musicgen_melody/marimba/audition.wav)
- [Stable Audio marimba, for contrast: built from the 2 of its 8 renders that held still.](Projects/Generative Sample Libraries/ai-source-probe/instruments/stable_audio/marimba/audition.wav)
- [the Crystal reference, restored to 59 of 59 keys in tune: what the pipeline sounds like when the source is exact.](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/audition.wav)

_Full matrix · 48 cells per arm · M1 Max · 2026-09-23_
| arm | on target | retunable | texture | steady and the right note | right octave |
| --- | --- | --- | --- | --- | --- |
| Crystal (reference) | 48 | 0 | 0 | 48 of 48 | 48 |
| Stable Audio | 2 | 7 | 39 | 9 of 9 | 2 |
| MusicGen + melody guide | 5 | 23 | 20 | 28 of 28 | 8 |
| MusicGen, words only | 1 | 35 | 12 | 9 of 36 | 7 |

_Left rough:_ The keycheck is stricter than the probe grade, and some zones fail it. On the MusicGen-melody violin, 11 of 14 keys from the A2 sample fail, because that sample is only just steady and pitch-shifting tips it over. I also haven't listened: every number here is measured, none is heard. And MusicGen weights are CC-BY-NC, so nothing built from them can be sold.

_Next moves named:_ Make build_sfz prefer samples with margin (voiced and dominance well above the line), and drop any zone that fails its own keycheck, so passing instruments play clean across their range. · Run the prompt-shape A/B on the MusicGen-melody arm: note name vs frequency vs 'middle C'. · Once your ears say the melody-arm timbres read as their instruments: one full MusicGen-melody instrument, more notes per octave, behind the audition gate.
<sub>`gsl-steward-046` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-044" -->
### 2026-09-23 — cycle 21 — The pitch test now ends in a playable instrument. The Crystal reference built from it plays every key in tune, 59 of 59.
> shipped · graded run → SFZ builder proven on the Crystal arm · nothing waiting on you · steward leans RUN-ON-MAC

What I built: [build_sfz.py](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/ai-source-probe/build_sfz.py). For every instrument row in a graded run it does four things.

1. It keeps only takes that hold a steady pitch. A sampler can fix a wrong note but can't fix a wandering one.
2. It picks the best take per note: on target first, then the octave nearest the one we asked for, then the steadiest.
3. It places each sample by the pitch it actually sounds at, not the note we asked for. A take that came out an octave high goes in an octave high, retuned.
4. It splits the keys between samples at the midpoint, and lets the outer samples reach at most 12 semitones past their own pitch. Wider gaps stay silent and are named in the file, not papered over.

Piano and marimba ring out after you let go of the key. Bowed, blown and sung notes stop when you let go.

The proof is the Crystal reference instrument ([open in sforzando](open:Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/crystal_reference.sfz)): 4 samples covering A1 to G6. To check it, I read the regions back out of the written file and played every key through a small sampler that uses the same pitch rule as an SFZ player (equation below). Then I graded each key against its own pitch with the same grader the probe uses. Result: 59 of 59 keys on target, worst 1.75 cents, including the full 12-semitone stretches at both ends. The audition is a rising line across the keyboard.

The Crystal renders never miss, so they can't test the part that matters most for AI models: fixing a wrong note. I ran the builder on the simulated-flaws test set as well (built to scratch space, not kept). It has takes 30 to 50 cents off and takes an octave out. All six instruments built, and every mapped key played on target, worst 1.53 cents. The simulated bass came out mostly an octave low and was mapped an octave low, in tune. The simulated violin had no steady C4, so it has a reported two-key hole (F4 to F#4). Then I zeroed one region's tune value by hand: exactly that zone's 16 keys failed, each 31 cents sharp. So the check can fail.

The Mac command ([DESIGN.md](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Sample%20Libraries/ai-source-probe/DESIGN.md)) now ends by building an instrument per model arm, with the key check and an audition, and rebuilds the Crystal reference there too. It is still one line, and your standing order is met as written: nothing here needed the model weights.

**Artifacts:**
- [the Crystal reference played as a rising line across A1–G6, through the builder's own sampler](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/audition.wav)
- [the instrument: 4 regions, keycenter and tune from measured pitch, rings out (one_shot)](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/crystal_reference.sfz)
- [every key played and graded: 59 of 59 on target, worst 1.75 cents](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/keycheck.json)
- [which take was kept per note, which were passed over, and why](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/picks.json)
- [one-line summary per instrument built from the crystal arm](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/build.json)
- [sample · A2 zone (the crystal arm's 'piano' row: it plays the crystal on every row)](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/samples/piano_A2_s2.wav)
- [sample · E3 zone](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/samples/piano_E3_s2.wav)
- [sample · C4 zone](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/samples/piano_C4_s2.wav)
- [sample · G5 zone](Projects/Generative Sample Libraries/ai-source-probe/instruments/crystal/reference/samples/piano_G5_s2.wav)
- [the builder: graded run → SFZ per instrument, with --check and --audition](Projects/Generative Sample Libraries/ai-source-probe/build_sfz.py)
- [the one Mac command, now ending in instruments per model arm plus the Crystal reference rebuilt](Projects/Generative Sample Libraries/ai-source-probe/run-on-mac.sh)
- [design notes: new section 'From graded run to instrument', and what was checked](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)

_Crystal reference · every key played and graded_
| sample (asked for) | keys | stretch, semitones | worst key | worst error |
| --- | --- | --- | --- | --- |
| A2 | A1–C3 (16) | −12 to +3 | C#2 | 0.97¢ |
| E3 | C#3–G#3 (8) | −3 to +4 | F3 | 0.46¢ |
| C4 | A3–A4 (13) | −3 to +9 | G4 | −0.54¢ |
| G5 | A#4–G6 (22) | −9 to +12 | A#4 | 1.75¢ |

_Left rough:_ Nobody has loaded the SFZ in a real player or listened to the audition yet. My check covers the pitch arithmetic, not how sforzando sounds. WAVs are gitignored in this project (.gitignore:53), so git will carry the .sfz but not its samples until the Mac command rebuilds them. The Crystal build used the hard strike on all four notes (tie broken on steadiness), so the soft layer and the second take never became velocity layers or round-robins. The samples have no loop points, so a held note stops when the render ends. The onset trim is now copied into three scripts.

_Next moves named:_ On the Mac: run the one command in DESIGN.md. It renders both models, grades them, writes the head-to-head page, and builds a playable SFZ for every model and instrument, plus the Crystal reference with its samples. · Load crystal_reference.sfz in sforzando and listen to the 12-semitone stretches at A1 and G6. That is the part my check can't hear. · Once there is a winning model: run the prompt-shape test (note name vs Hz vs 'middle C') on it, and use the second take as a velocity layer or round-robin instead of discarding it. · Fold cycles 18–21 into the home entry's footer (it last consolidated at cycle 17) and pull the onset trim into one shared responsive_onset.py.
<sub>`gsl-steward-044` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-042" -->
### 2026-09-23 — cycle 20 — The Stable Audio vs MusicGen pitch test is built and checked against the Crystal instrument. On the Mac it's one command.
> shipped · harness ready, no model has run yet · steward leans run it --quick first

I followed your BOTH-PARALLEL answer and the standing orders, and didn't re-ask which model. Here is what I built.

Four ways of asking for each note, run side by side. (1) Stable Audio, with the pitch written into the prompt. (2) MusicGen, with the same prompt plus a sine wave at the target pitch as a melody guide. (3) MusicGen with the prompt only, no guide. Same model as (2), so the difference between them measures the guide itself. (4) The Crystal instrument as a known-good reference. Every model hears the same prompt, so the test compares models, not wording. Each gets 6 instruments × 4 notes × 2 seeds = 48 renders.

I changed the test notes. Cycle 19 used four A's. That can't tell a model that follows the pitch from one that just happens to like A. The notes are now A2, E3, C4 and G5, covering the same range.

I changed the grader too, and this is the part I'd most like you to push on. A sampler can fix a wrong note: `pitch_keycenter` and `tune` remap a sample that's steady but 40 cents flat, or even an octave off. It can't fix a note that wanders. So each render now gets one of three grades: on target, retunable (steady but off) or texture (not steady). Every steady render comes with the SFZ values it would need. The old accuracy numbers are unchanged. Steadiness is new, and it has to pass before accuracy counts.

How I checked the grader. A deliberately flawed simulated source (detuned, octave-off, vibrato, melody, noise): all 48 cells got the grade their flaw should earn, under both pitch trackers. The Crystal instrument: 48 of 48 on target, worst 1.85 cents. Checking against the Crystal also caught a bug in my own first draft. The step I added for exact pitch read the Crystal up to 22 cents flat, because its bell-like partials pulled the measurement off. The other three methods agreed within 2 cents. Harmonic test tones would never have caught that. I replaced the step, and DESIGN.md records why.

One prediction the run can prove wrong: MusicGen's melody guide carries the note name but not the octave. So guided MusicGen should hit the right note more often than the right octave. The report counts octave slips separately so you can see whether that's what happens.

**Artifacts:**
- [the side-by-side report, run on the Crystal and the simulated source. The Mac run writes compare.html in the same format.](Projects/Generative Sample Libraries/ai-source-probe/compare.dry-run.html)
- [the one command: builds its environments on first run, renders all four arms, grades, opens the report. --quick does 8 cells per arm.](Projects/Generative Sample Libraries/ai-source-probe/run-on-mac.sh)
- [the brief as it stands: arms, notes, grade rule, what is checked and what is not.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)
- [the grader: pitch tracked frame by frame, three grades, SFZ keycenter and tune for each steady render.](Projects/Generative Sample Libraries/ai-source-probe/verify.py)
- [builds the side-by-side report page and compare.json.](Projects/Generative Sample Libraries/ai-source-probe/compare.py)
- [renders or grades one arm; the two steps are split so each model can render in its own environment.](Projects/Generative Sample Libraries/ai-source-probe/probe.py)
- [the test grid and pass thresholds: notes now A2 / E3 / C4 / G5, steadiness thresholds added.](Projects/Generative Sample Libraries/ai-source-probe/matrix.json)
- [Stable Audio 3, hardened: passes steps / cfg / seed only if the model accepts them, and always seeds torch.](Projects/Generative Sample Libraries/ai-source-probe/adapters/stable_audio.py)
- [MusicGen-melody, shared by the guided and unguided arms.](Projects/Generative Sample Libraries/ai-source-probe/adapters/musicgen.py)
- [arm: prompt + sine melody guide.](Projects/Generative Sample Libraries/ai-source-probe/adapters/musicgen_melody.py)
- [arm: prompt only, the control.](Projects/Generative Sample Libraries/ai-source-probe/adapters/musicgen_text.py)
- [reference arm: the shipped Crystal instrument through its own approved code.](Projects/Generative Sample Libraries/ai-source-probe/adapters/crystal.py)
- [simulated flawed source, used only to test the grader.](Projects/Generative Sample Libraries/ai-source-probe/adapters/mock_flawed.py)
- [simulated perfect tone, the grader's best case.](Projects/Generative Sample Libraries/ai-source-probe/adapters/mock.py)
- [the shared prompt and a WAV writer that needs only numpy.](Projects/Generative Sample Libraries/ai-source-probe/adapters/_common.py)
- [the test-run verdicts in machine-readable form.](Projects/Generative Sample Libraries/ai-source-probe/compare.dry-run.json)
- [per-cell grades for the Crystal reference.](Projects/Generative Sample Libraries/ai-source-probe/results.crystal.jsonl)
- [per-cell grades for the simulated source.](Projects/Generative Sample Libraries/ai-source-probe/results.mock_flawed.jsonl)
- [render log for the Crystal reference.](Projects/Generative Sample Libraries/ai-source-probe/renders.crystal.jsonl)
- [render log for the simulated source, including which flaw each cell drew.](Projects/Generative Sample Libraries/ai-source-probe/renders.mock_flawed.jsonl)

_Test run of the grader: the Crystal instrument and a simulated flawed source, 48 cells each (no AI models in this table)_
| source | on target | retunable | texture | verdict | median \|cents\| (steady cells) |
| --- | --- | --- | --- | --- | --- |
| crystal (real palace audio) | 48 | 0 | 0 | ON TARGET | 0.6 |
| mock_flawed (simulated) | 18 | 14 | 16 | TEXTURE ONLY | 5.0 |

_Left rough:_ Neither model has run anywhere. I couldn't install torch here, so the MusicGen adapter follows the documented API but has never executed. Stable Audio's load-and-generate call is proven by the Kuramoto beds script, but its steps, cfg and seed options aren't. The grader is only checked on synthetic tones and the Crystal, never on real acoustic or AI audio, and whether its steadiness thresholds match what your ear calls steady is untested. The first Mac run downloads several GB of MusicGen weights, and those weights are non-commercial (CC-BY-NC), so nothing sampled from MusicGen can be sold. The test-run report has no audio players, because those WAVs were rendered in scratch space, not the bundle. I deleted cycle 19's report.mock.html and results.mock.jsonl; this report replaces them.

_Next moves named:_ On the Mac, run the one command with --quick first (8 cells per arm, a few minutes plus the one-time download), then the full run. compare.html opens when it finishes. · Next cycle, build the step that turns a graded run into a playable SFZ: pick the best seed per note, apply the keycenter and tune values, and write the instrument, so a winning model is one step from something you can play. · Once there's a winner, test prompt wording on it: note name (C4) vs frequency (261.63 Hz) vs description (middle C).
<sub>`gsl-steward-042` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-039" -->
### 2026-07-01 — cycle 19 — Cycle 19 shipped the AI-source-probe harness — a matrix runner that renders an (instrument × pitch × adapter × seed) sweep and grades each cell in cents error against librosa's pitch detection.
> shipped · harness + 48-cell mock smoke test · Stable Audio Open adapter left stubbed pending your model pick

Catch-up — Generative Sample Libraries is the chat-driven multisampled-instrument pipeline. Phase 3 opens the door to non-Kokoro sources. Source one shipped (Crystal Hexagonal, 176 regions). Source two shipped (Shepard tone). Your grant on gsl-steward-037 renamed source three: don't crawl a local WAV folder — hand a target instrument and a target pitch to an audio LLM, render, and use librosa to check how close it landed. If the answer is 'close enough,' AI sub-agents become a real GSL source. If it's 'not really,' we learn that in bulk before we sink a batch into a broken assumption.

What shipped — Projects/Generative Sample Libraries/ai-source-probe/. A tiny four-file harness: probe.py is the matrix runner, verify.py is the pitch checker (librosa.pyin when available, autocorr fallback so it runs today), adapters/mock.py is a sine generator that proves the pipeline, adapters/stable_audio.py is a stub with the SA3 prompt template already written but the model entrypoint left un-wired for you to greenlight. The matrix is 6 instruments (piano · violin · marimba · flute · bass · choir) × 4 pitches (A2 · A3 · A4 · A5) × 2 seeds — 48 cells per adapter. Acceptance rule (informed by Talking Keyboard): |cents_err| ≤ 20 on ≥ 75% of cells, voiced ≥ 60%.

Smoke test — I ran the mock adapter end-to-end (~5 seconds, 48 sine renders). All 48 cells graded usable; median cents error was −0.4¢ at A2 and +3.9¢ at A3/A4/A5 (autocorr lag quantization at sr=44100, which real pyin will resolve). Pipeline is exercised end-to-end. Report at ai-source-probe/report.mock.html.

What I did NOT do — I did not run the SA3 adapter, because (a) SA3's Python entrypoint on this Mac is not obviously discoverable and (b) which audio LLM to commit the ~8 minutes of GPU sweep time to is a fork you should own. That's gsl-steward-040. The probe is designed so a real render is one adapter-file away.

**Artifacts:**
- [the design brief — matrix, acceptance rule, adapter roster, open sub-experiments.](Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md)
- [matrix runner (48 cells) — writes results.jsonl + report.html per adapter.](Projects/Generative Sample Libraries/ai-source-probe/probe.py)
- [librosa.pyin pitch check, cents-space aggregation, autocorr fallback.](Projects/Generative Sample Libraries/ai-source-probe/verify.py)
- [SA3 adapter — prompt template written, model entrypoint left un-wired for cycle 20.](Projects/Generative Sample Libraries/ai-source-probe/adapters/stable_audio.py)
- [the sweep — 6 instruments × 4 A-note pitches × 2 seeds.](Projects/Generative Sample Libraries/ai-source-probe/matrix.json)
- [mock adapter smoke-test report — 48/48 usable, ~4¢ ceiling from autocorr quantization.](Projects/Generative Sample Libraries/ai-source-probe/report.mock.html)
<sub>`gsl-steward-039` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-037" -->
### 2026-06-25 — cycle 18 — Which WAV folder should I point the source-three scaffold at to validate?
> scaffold shipped · no validation run yet · lean FIELD-RECORDINGS if you have any handy

Catch-up: GSL Phase 3 is sourcing audio from multiple non-Kokoro origins to validate the Interview skill enough to promote it from project-local (_ops/sample-libraries/skills/interview/) to user-skill space (/skills/sample-library-interview/). Crystal and Shepard are sources one and two. The source-three scaffold (librosa pitch detect → keyboard map → SFZ) is now on disk, but it needs a real folder of pitched WAVs to validate. Tradeoffs: a field-recordings or instrument-samples folder is the truest test of the pitch-detect-and-map path; a palace project bundle is convenient but most palace WAVs are already labeled (Crystal/Shepard) so they exercise the mapping less; you can also defer and let me synthesize a test folder myself, but that loses the 'real user material' contract source three exists to prove. Reply non-blocking — I am not parked.

**Artifacts:**
- [Generative Sample Libraries — icon.png](Projects/Generative Sample Libraries/Generative Sample Libraries — icon.png)
- [Generative Sample Libraries — hero.png](Projects/Generative Sample Libraries/Generative Sample Libraries — hero.png)
<sub>`gsl-steward-037` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gsl-steward-036" -->
### 2026-06-25 — cycle 18 — Source three scaffold shipped — local WAV folder adapter

Catch-up: GSL is a chat-driven sample-instrument generator. Phase 3 (multi-source) is in progress — Crystal Hexagonal and Shepard-tone already shipped as sources one and two. Source three is the simplest external case: a folder of WAVs the user already has, mapped onto the keyboard by detected pitch.

Shipped this cycle: a scaffold under _ops/sample-libraries/local-wav-folder/. generate.py uses librosa's pYIN (voiced-frame median) to detect each file's pitch, maps onto MIDI by nearest-neighbor with split-the-difference hikey/lokey boundaries, applies the responsive-onset trim convention from phoneme-choir (−45 dBFS detect, 2 ms cushion, 3 ms ampeg_attack), and writes an SFZ + a JSON mapping report. `--audition` mode keeps one file per octave so the Phase 2 audition-before-batch gate runs here too.

What I couldn't verify this cycle: the scaffold has not been run against a real folder — no .wav material on disk to point it at. Asking Loudon next message which folder to validate against; that pick unblocks both the source-three render and the Interview-skill promotion (gated since cycle 9 on one non-Kokoro, non-palace-synthesis source).

**Artifacts:**
- [the scaffold — librosa pyin + nearest-MIDI mapping + onset-trim + SFZ writer.](_ops/sample-libraries/local-wav-folder/generate.py)
- [build notes; what carries forward; what still needs Loudon.](_ops/sample-libraries/local-wav-folder/BUILD.md)
<sub>`gsl-steward-036` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
