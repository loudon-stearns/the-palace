---
title: "Bayesian Granular Synthesizer — scroll"
born: 2026-09-23
links:
  - target: "[[Bayesian Granular Synthesizer]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Bayesian Granular Synthesizer's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Bayesian Granular Synthesizer — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Bayesian Granular Synthesizer]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T11:29:13.515Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 3 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 2 open asks
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — Should the painted belief hum by itself before any note is held — not at all, gently, or fully? (`bgs-steward-008`)
- **Last commit touching this project:** 2026-10-14 `fa400cf9` — steward(Bayesian Granular Synthesizer): cycle 2 — SPINNING UP. HOME: [Bayesian Granular Synthesizer](obsidian://open?vaul…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Bayesian Granular Synthesizer is a grain cloud where the notes you hold are evidence. With nothing held, grains draw their pitch from a prior belief and come out short and clicky. Held notes sharpen into ±5-cent bumps, and grains near them grow long and pure, so the cloud condenses into the chord. Earlier today I rebuilt it as a playable page, then as RNBO code with a ready-wired Max patch that matches the page sample for sample. This cycle takes the next step on the proposed plan, the prior you paint. You now paint it one bar per semitone in Max, and a new knob lets the painted peaks lengthen grains themselves, so a composed resting cloud can sound tonal before you touch a key. Three rende…

### Open asks

- `bgs-steward-003` — proposed plan revision: a first plan for the believing cloud · posted 2026-10-14 · options: adopt · keep
- `bgs-steward-008` — should the painted prior hum on its own · posted 2026-10-14 · options: A · B · C

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="bgs-steward-008" -->
### 2026-10-14 — cycle 3 — Should the painted belief hum by itself before any note is held — not at all, gently, or fully?
> still working · three 31-second takes rendered · steward leans B

The Bayesian grain cloud treats held notes as evidence, so a held chord condenses scattered clicks into tone. Its resting belief, the prior, is now something you paint one bar per semitone, in the page and in the Max patch. The open question from the plan: should the painted peaks also grow long grains, so the cloud sounds tonal before you play? Same seed, same D-dorian belief, three ways. prior-tone-A.wav has the hum off and stays all clicks until you play. prior-tone-B.wav hums gently on the strongest bars (23% long grains), and when you hold an E major chord against it, D and A keep humming underneath, which is audible tension. prior-tone-C.wav has the most hum (52% long), but some tones drift up to 25 cents off the note. prior-tone-ab.png shows all three. I lean B: it hums without going sour. I'll keep building toward grain entrainment either way.

**Artifacts:**
- [A · tone off](Projects/Bayesian Granular Synthesizer/prior-tone-A.wav)
- [B · tone on, curve 1](Projects/Bayesian Granular Synthesizer/prior-tone-B.wav)
- [C · tone on, curve 0.5](Projects/Bayesian Granular Synthesizer/prior-tone-C.wav)
- [The three grain maps side by side](Projects/Bayesian Granular Synthesizer/prior-tone-ab.png)
<sub>`bgs-steward-008` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="bgs-steward-007" -->
### 2026-10-14 — cycle 3 — The painted prior is now a real control in the page, the codebox and the Max patch, and it can hum on its own, heard three ways.
> shipped · codebox matches the page to 2e-7 · steward leans B

WHAT I MADE. Two new knobs in all three places (bayes_engine.js, the board page, belief-cloud.codebox): priorTone (0 to 1) and toneCurve. A grain that lands where the painted prior is sure now grows long in proportion to how sure it is. tone = ((prior − mean) / (max − mean))^toneCurve. A flat prior has no peaks, so it stays all clicks, and priorTone 0 is the instrument exactly as before. The original 42-second mirror still matches at 2.35e−7.

THE PAINTER. paint-in.codebox is a third small codebox. The Max patch gets a 64-bar multislider (A1 to C7) → listfunnel → [inport paint] → unpack → paint-in, which rewrites the 630-bin prior table around the semitone that moved. Each bar is a 20-cent hill. Slot 630 of the table is a paint counter, and when it changes the grain codebox~ re-reads the prior. No parameter flip is needed, and a chord-like burst of 64 slider values all lands (the same trap the note table solved last cycle). The patch paints a composed D-dorian belief half a second after load, and it has priorTone and toneCurve knobs. The page and the codebox paint with the same rule, and the painted tables match exactly (diff 0).

THE A/B/C. Same seed, same painted belief, 31 seconds: belief alone → hold D3 + A3, which agree with it → let go → hold E G# B, which argues with it → let go. A: tone off. B: tone on, curve 1. C: tone on, curve 0.5 (a wider tonal zone). All three were run through the RNBO codeboxes and checked against the page engine, and they agree to under 2e−7.

WHAT IT SHOWED. While the belief rests alone, A is pure clicks (median 4 cycles, 0% of grains long). B hums on D3 and A3 with scattered tones on the weaker hills (median 14 cycles, 23% long). C hums on the whole chord (median 32, 52% long), but some long grains sit up to ~25 cents off the note. The surprise is in the argue section. In B and C, the prior keeps humming D and A underneath the held E major, so belief and evidence are audibly in tension. In A, the prior can't be heard there at all.

PASSED OVER. A squared curve (my first version): it was too timid, with only 9% long grains, and only the single strongest hill rang. A per-hill normalization that ignores bar height: it would throw away the painted 'how sure', which is the point of painting.

**Artifacts:**
- [Grain maps for A, B and C: every third grain, sized and lit by length; the painted belief as a teal strip.](Projects/Bayesian Granular Synthesizer/prior-tone-ab.png)
- [A · tone off: the painted belief only steers where the clicks land.](Projects/Bayesian Granular Synthesizer/prior-tone-A.wav)
- [B · tone on, curve 1: the resting cloud hums D and A, and argues with E major.](Projects/Bayesian Granular Synthesizer/prior-tone-B.wav)
- [C · tone on, curve 0.5: more hum, some long grains up to ~25 cents off the note.](Projects/Bayesian Granular Synthesizer/prior-tone-C.wav)
- [The playable page, now with 'Prior's own tone' and 'Tone zone' sliders beside the painter.](Projects/Bayesian Granular Synthesizer/belief-instrument.html)
- [Page template with the two new sliders.](Projects/Bayesian Granular Synthesizer/belief-instrument.template.html)
- [Engine: priorTone, toneCurve, and the shared painter rule paintedPrior().](Projects/Bayesian Granular Synthesizer/bayes_engine.js)
- [Draws the A/B/C grain maps.](Projects/Bayesian Granular Synthesizer/plot_prior_tone.py)
- [Event codebox: semitone + weight → 20-cent hills in the shared prior table, plus a paint counter.](Projects/Bayesian Granular Synthesizer/RNBO/paint-in.codebox)
- [Grain codebox~ with priorTone, toneCurve and the paint-counter re-read.](Projects/Bayesian Granular Synthesizer/RNBO/belief-cloud.codebox)
- [Max patch: now with the 64-bar prior painter, the composed belief preset and the two tone knobs. Unopened.](Projects/Bayesian Granular Synthesizer/RNBO/belief-cloud.maxpat)
- [Builds the patch, including the painter and the inport/unpack/paint-in chain inside the rnbo~.](Projects/Bayesian Granular Synthesizer/RNBO/build_patch.mjs)
- [Renders A/B/C through both the page engine and the transpiled codeboxes and compares them.](Projects/Bayesian Granular Synthesizer/RNBO/prior_tone_ab.mjs)
- [Per-section grain-length numbers and the codebox-vs-page match for each take.](Projects/Bayesian Granular Synthesizer/RNBO/prior_tone_report.json)
- [Grain log behind the maps.](Projects/Bayesian Granular Synthesizer/RNBO/prior_tone_grains.json)
- [Mirror, now importable, with the 631-slot prior table.](Projects/Bayesian Granular Synthesizer/RNBO/codebox_mirror.mjs)
- [The original 42-second match, re-run after the change: still 2.35e-7.](Projects/Bayesian Granular Synthesizer/RNBO/codebox_mirror_report.json)

_Left rough:_ Nothing has been in Max yet. On top of last cycle's three open seams there are two new ones: whether RNBO's [unpack] exists under that name inside rnbo~, and whether a Max multislider list reaches [inport paint] as 'paint k v'. The page's own painter draws 630 bins freehand rather than 64 semitone bars, so the page and the patch paint differently even though they read the prior the same way.

_Next moves named:_ Make whichever of A/B/C you pick the default priorTone and toneCurve in the codebox, page and patch. · Grains that entrain, the plan's next step: weakly couple the onset phases of grains near a held note, Kuramoto-style, and render with/without to hear whether locking deepens the condensation or muddies it. · When you have ten minutes in Max: open RNBO/belief-cloud.maxpat, click priorShape 2, turn priorTone up, and read me any compiler error. Each is a one-line fix and a gotcha for the RNBO codebox smith.
<sub>`bgs-steward-007` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="bgs-steward-005" -->
### 2026-10-14 — cycle 2 — The believing cloud now exists as RNBO code and a ready-wired Max patch, and it matches the board instrument sample for sample.
> shipped · RNBO port mirrored to −139 dB, not yet opened in Max · steward leans painted-prior next

WHAT I MADE. belief-cloud.codebox is the whole cloud in one codebox~. It has Poisson grain onsets, a 640-voice pool, up to 16 held notes as evidence, the prior (flat, A-minor-pentatonic hills, or a painted 630-bin table), and the same length and equal-energy rules as the page. Its 15 knobs (doubt, time to conviction, letting go, grain rate, longest grain…) become automatable parameters. out3 reports how focused the belief is, from 0 to about 0.92.

THE ONE REAL DESIGN CALL: notes come in through a table, not through parameters. A chord arrives as three note-ons in the same instant, and a parameter only keeps its last value before the next sample, so C E G sent as parameters would arrive as just G. So notes-in.codebox stamps each press into a 128-slot table called `held`. The grain codebox~ reads it every 64 samples and admits new notes in the order they were played. That order matters because it decides which grains go to which note.

THE PROOF. codebox_mirror.mjs runs both codebox files' own text as JavaScript, the way the Neural Granular Synthesis crowd was checked. It drives them through the chord-belief take: flat prior, then C E G, then A minor, release, the painted prior, and low A + E. It compares them with bayes_engine.js sample by sample. They agree to 2.4e−7, the float32 floor, which puts the difference 139 dB under the signal. As a control I changed the random seed by one, and the outputs split apart at sample 2, so the match isn't trivially true. The board engine was handed the codebox's random generator first (Park–Miller in place of 32-bit integer tricks codebox may not have). codebox-take.wav is the codebox's own 42-second output. It is the same instrument as chord-belief.wav but a different roll of the dice, so the grains differ and the shape doesn't.

THE PATCH. belief-cloud.maxpat is built by build_patch.mjs in the box format the Action Potential Oscillator patch copied from the RNBO 1.4 help files. It has a polyphonic keyboard and midiin into the rnbo~, three prior buttons, five knobs, a quiet dac and a belief-focus meter. To demo it: open it, turn on the dac, click C E G on the keyboard and keep holding. The clicks should condense into the chord in two or three seconds, and the meter should climb toward 0.92.

PASSED OVER. 128 per-pitch gate parameters would avoid the table, but they would also clutter the device with 128 automation lanes. Sending a chord as parameters would lose all but one note of every chord. I passed over both.

**Artifacts:**
- [The codebox's own 42-second take: flat prior → C E G → A minor → release → painted prior → low A + E.](Projects/Bayesian Granular Synthesizer/RNBO/codebox-take.wav)
- [Open in Max: keyboard, midiin, prior buttons, knobs, belief meter, the rnbo~ already wired. Unopened.](Projects/Bayesian Granular Synthesizer/RNBO/belief-cloud.maxpat)
- [The grain cloud as codebox~, with its wiring and the three unverified seams written at the top.](Projects/Bayesian Granular Synthesizer/RNBO/belief-cloud.codebox)
- [Event codebox that turns MIDI into the press-stamped `held` table.](Projects/Bayesian Granular Synthesizer/RNBO/notes-in.codebox)
- [Runs both codeboxes as JavaScript against bayes_engine.js and writes the take.](Projects/Bayesian Granular Synthesizer/RNBO/codebox_mirror.mjs)
- [The match numbers and a belief-focus trace through the take.](Projects/Bayesian Granular Synthesizer/RNBO/codebox_mirror_report.json)
- [Builds the Max patch from the two codebox files.](Projects/Bayesian Granular Synthesizer/RNBO/build_patch.mjs)

_codebox vs board engine, 42-second chord-belief take at 48 kHz (codebox_mirror_report.json)_
| check | result |
| --- | --- |
| largest sample difference | 2.4e−7 (float32 floor) |
| difference vs signal, L / R | −139.0 / −139.1 dB |
| first sample off by more than 1e−5 | none |
| control: seed changed by one | splits at sample 2, 2.7 dB |
| belief focus: nothing held / C E G settled / after release / low A+E | 0.00 / 0.92 / 0.04 / 0.89 |
| most voices at once | 146 |
| codebox cost as JavaScript in node | 0.025× realtime |

_Left rough:_ I can't open Max, so none of this has compiled. Three lines are the likely fixes, and all are written at the top of the codebox: how codebox names a shared buffer and reads it (no palace codebox has compiled a buffer read yet), whether poke takes index-then-value, and samplerate() versus samplerate. The mirror checks the arithmetic and the note ordering, not RNBO.

_Next moves named:_ When you have ten minutes in Max: open RNBO/belief-cloud.maxpat, hold C E G, and tell me what the compiler says. Any error is a one-line fix I'll log as a gotcha for the RNBO codebox smith. · Meanwhile, the painted prior as a real control: a drawable 630-bin table in the patch and an A/B render of letting the prior's own peaks lengthen grains, so a composed resting cloud can sound tonal before any note is held.
<sub>`bgs-steward-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="bgs-steward-003" -->
### 2026-10-14 — cycle 1 — Adopt a five-step path from today's rebuilt cloud to an RNBO instrument on the Loudon Live stage?
> still working · engine rebuilt and playable · steward leans adopt

Quick catch-up: this is the grain cloud where held notes are evidence. The pitch belief sharpens around the chord, and grains near a believed note grow long and pure. In May you tuned it by ear and called V7 and V8 good, but that code stayed in the chat. Today I rebuilt it from the entry's spec as one engine. It runs a playable page with a prior you paint and a 42-second take ([listen](open:Projects/Bayesian Granular Synthesizer/chord-belief.wav)). It holds a steady level from clicks to tone, and a settled chord puts about 80% of its energy on the held notes. No plan is agreed yet, so here is one. The order follows your forward vector: the RNBO engine first, then the paintable prior as a real control, then the optional grain entrainment, then the stage. Adopt makes it the plan. Keep leaves me building toward the forward vector without a written plan. Either way I'm still working and start on RNBO next.

**Artifacts:**
- [Today's 42-second take, the evidence for step one.](Projects/Bayesian Granular Synthesizer/chord-belief.wav)
- [The playable cloud with the paintable prior.](Projects/Bayesian Granular Synthesizer/belief-instrument.html)
<sub>`bgs-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="bgs-steward-002" -->
### 2026-10-14 — cycle 1 — The believing cloud is back, rebuilt from the spec. You can play it in the board, paint its prior, and hear a 42-second take of a chord coming to be believed.
> shipped · engine rebuilt, playable, measured · steward leans carry it into RNBO next

WHAT I MADE. bayes_engine.js holds the whole instrument in one class. The render, render_chord_belief.js, and the page, belief-instrument.html (built by build_instrument.js), run that same code, so what you play is what I measured. It follows the entry's spec: one Hann cycle in and out, 4 to 128 sustain cycles, amplitude ∝ √(f/cycles), and Poisson onsets at 160 grains/s. Each grain picks its pitch by first choosing the prior or a held note in proportion to their weight, then drawing inside that choice. Grain length rises with closeness to the nearest note, and that closeness only counts in proportion to how strongly the note is believed. That gate is the entry's fix for the click at chord-press. A re-pressed note keeps the conviction it had built up, so the common tones of a chord change stay sharp while a new note has to earn its place.

THE TAKE. chord-belief.wav runs 0–4 s with the flat prior and nothing held. C E G is held from 4–14 s. At 14 s G lets go and A arrives, making A minor (14–22 s). Everything releases from 22–28 s. From 28–34 s the prior is painted into A-minor-pentatonic hills with nothing held, and from 34–42 s low A and E are held over that prior. chord-belief.png shows the belief over time: the bumps pinch to a thread, G blurs out while C and E stay sharp, and the prior's hills appear once it is painted.

WHAT I MEASURED. The level stays between 0.138 and 0.182 RMS across the whole take (about 2.4 dB) from all clicks to all tone, so the equal-energy rule holds. No grains were dropped and at most 146 voices sounded at once. The table shows how much energy sits within 15 cents of the held notes.

THE PAGE. Start the cloud, then hold keys (A W S E D… on the computer keyboard, click the strip, or use MIDI with sustain on CC64). Drag on the picture to raise or lower the prior. The sliders cover doubt, time to conviction, letting go, conviction floor, grain rate and longest grain. I checked the page's layout in headless Chrome. I could not hear the page's audio, but the code that makes the sound is identical to what produced the WAV.

PASSED OVER. I passed over fitting this to remembered V8 settings, because there is nothing to fit to. Every constant is the spec's or my guess, so your ear against your memory of V8 is the real test.

**Artifacts:**
- [Playable: hold notes, paint the prior, and watch the belief and grains move.](Projects/Bayesian Granular Synthesizer/belief-instrument.html)
- [42 s in one take: flat prior → C E G → A minor → release → painted prior → low A + E.](Projects/Bayesian Granular Synthesizer/chord-belief.wav)
- [The belief over pitch through the take, plus the prior share and mean grain length.](Projects/Bayesian Granular Synthesizer/chord-belief.png)
- [The engine, one class shared by the page and the render.](Projects/Bayesian Granular Synthesizer/bayes_engine.js)
- [Page source. The engine gets inlined into it.](Projects/Bayesian Granular Synthesizer/belief-instrument.template.html)
- [Builds the self-contained page from the template and engine.](Projects/Bayesian Granular Synthesizer/build_instrument.js)
- [Renders the take and its meters.](Projects/Bayesian Granular Synthesizer/render_chord_belief.js)
- [Meters every 50 ms: notes, widths, prior share, grain length, voices.](Projects/Bayesian Granular Synthesizer/chord-belief.json)
- [Draws the belief picture and measures energy on the notes.](Projects/Bayesian Granular Synthesizer/plot_chord_belief.py)
- [The energy-on-the-notes numbers in the table.](Projects/Bayesian Granular Synthesizer/note-energy.json)

_Share of audio energy within ±15 cents of the held notes (fundamentals), from note-energy.json_
| moment | energy on the notes |
| --- | --- |
| flat prior, nothing held (vs C E G) | 1.5% |
| C E G, first second | 10.3% |
| C E G, settled | 78.9% |
| A minor, settled | 83.7% |
| painted prior, nothing held (vs A E) | 0.9% |
| low A + E, settled | 73.9% |

_Left rough:_ Every constant is the spec's or my guess, not V8's, and nobody has listened yet. A painted prior shapes where the clicks land but not how long they last, so with nothing held it still sounds like clicks; whether the prior's own peaks should lengthen grains is a design question I left open.

_Next moves named:_ Carry the engine into an RNBO codebox: Poisson onsets, a voice pool, up to 16 notes as evidence, the prior in a buffer. Check it against bayes_engine.js sample for sample, the way the Neural Granular Synthesis crowd was checked. · Try letting the painted prior's own peaks lengthen grains, so a composed resting cloud can be tonal before any note is held, and make an A/B against this take.
<sub>`bgs-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

_Nothing made yet — the first shipped thing will open the trail._
<!-- scroll:making:end -->
