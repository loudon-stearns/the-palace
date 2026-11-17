---
title: "Tract Mirror — scroll"
born: 2026-09-23
links:
  - target: "[[Tract Mirror]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Tract Mirror's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Tract Mirror — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Tract Mirror]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-17T11:55:07.095Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 2 · last ran 2026-11-17 (today)
- **Plan:** agreed 2026-09-25 (52 days ago) · 4 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-17 (today) — The refit vowels now sing within about 1% of their targets. After you listen, should they go into the plugin? (`tract-mirror-steward-006`)
- **Last commit touching this project:** 2026-11-11 `f4b8708c` — edit(Objects to Think With): eighteen projects declare exemplifies → Objects to Think With (label object-to-think-with) from their own side, first in their links as the four already do, each with one body sentence naming the object and the idea it carries, grounded in the 2026-10-25 recount; on Loudon's ruling of 2026-11-11 that the links go in now, not at December's Weave
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 2 days, counted from the ledger's run lines
- **Last run:** 2026-11-17 — cycle 2 · taught item 2
- **Owed in the ledger:** nothing
- **Latest lesson:** item 2, from cycle 2 — 2026-11-17 — [[Tract Mirror — tuning]]

### Where this stands

Tract Mirror is the palace's first native plugin, a one-voice singing synth for Ableton. The 3D tubes on its screen are the filter itself. Each step in width between two cylinders is one reflection coefficient of an LPC lattice. The first build shipped in June. On 2026-11-05 I found that the six vowels sing flat, up to 14% low on the first formant. They were fitted with the small filter at the lips switched off, but every sound the instrument actually makes has it on. You chose to hear a refit, made in Python, before anything touches the plugin. This cycle made that refit and the before-and-after recordings.

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 1:** Nobody has heard the refit yet, me included: it's tuned to the numbers, not to an ear. _(in 2 notes, the latest cycle 2)_
- **rough since cycle 1:** Wiring it in also means recomputing the plugin's vowel loudness matching, which was built from the old shapes. _(in 2 notes, the latest cycle 2)_

### Open asks

- `tract-mirror-steward-006` — directional_decision · posted 2026-11-17 · options: WIRE-IN · KEEP-AS-IS · ADJUST

### Answered, not yet consumed

_None._

### Decided

- `tract-mirror-steward-003` — directional_decision → GRANTED — option_id=AUDITION-REFIT (2026-11-10)

### Runs

- 2026-11-17 — cycle 2 · taught item 2
- 2026-11-05 — cycle 1 · taught item 1

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** The palace's first native plugin: a monophonic voice synthesizer inside Ableton whose 3D drawing of the vocal tract's tubes is the filter itself, not a picture of it. The whole first build is behind it: the Python reference, the C++ engine, the WebView interface, validation, a verified load in Live 12 on 2026-06-10, then MIDI performance controls, loudness matching across vowels, and Word mode, all recorded in [[Tract Mirror — build plan — JUCE VST]]. What it wants next is to learn to speak by listening.

**The moves ahead**

1. **Play the last two additions in Live.** The MIDI controls (velocity, and two CCs on the vowel pad) and Word mode passed their offline checks but have not been played inside Ableton. The build plan notes the MIDI check waits on Loudon at the machine.
2. **Learn to speak by listening.** A record-and-analyze engine: sing into it and it replays your own tract shapes. The entry names it as the next version; it has no design yet.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Decided by Loudon on 2026-06-09, carried over from the build plan's locked decisions (approved as orders 2026-09-25):

- **JUCE 8 with a WebView interface**, three.js drawing the 3D tract.
- **Ableton Live 12 is the target DAW**: VST3 and AU, macOS arm64.
- **The first voice source is built-in vowel morph tables** (a, e, i, o, u, schwa) on an XY pad; the analysis engine waits for the next version.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="tract-mirror-steward-006" -->
### 2026-11-17 — cycle 2 — The refit vowels now sing within about 1% of their targets. After you listen, should they go into the plugin?
> still working · refit rendered, plugin untouched · steward leans WIRE-IN

Tract Mirror is the singing-tube plugin. Its six vowels sang up to 14% flat, because they were fitted with the lip filter off and the filter is always on in what you hear. You asked to hear a refit before anything touched the plugin. It's ready. In audition-six-vowels-old-then-new.wav each vowel plays as it is now, then refit. /e/ and /u/ change most. The tubes barely moved: mostly the lips opened a little (tubes-old-new.png). Wiring it in means replacing the vowel file, recomputing loudness, rebuilding and rerunning the checks: about one cycle, and easy to undo with git. I'm going on with the listening design meanwhile, so answer whenever it suits you.

**Artifacts:**
- [each vowel now, then refit.](Projects/Tract Mirror/refit/audition-six-vowels-old-then-new.wav)
- [a-e-i-o-u glide, now, then refit.](Projects/Tract Mirror/refit/audition-morph-old-then-new.wav)
- [the tubes now and refit.](Projects/Tract Mirror/refit/tubes-old-new.png)
- [tubes-heard.png](Projects/Tract Mirror/listening/tubes-heard.png)
- [replay-other-voices.wav](Projects/Tract Mirror/listening/replay-other-voices.wav)
- [replay-reference-vowels.wav](Projects/Tract Mirror/listening/replay-reference-vowels.wav)
- [Samantha_u.wav](Projects/Tract Mirror/listening/voices/Samantha_u.wav)
- [Samantha_i.wav](Projects/Tract Mirror/listening/voices/Samantha_i.wav)
- [Samantha_a.wav](Projects/Tract Mirror/listening/voices/Samantha_a.wav)
- [Daniel_u.wav](Projects/Tract Mirror/listening/voices/Daniel_u.wav)
- [Daniel_i.wav](Projects/Tract Mirror/listening/voices/Daniel_i.wav)
- [Daniel_a.wav](Projects/Tract Mirror/listening/voices/Daniel_a.wav)
<sub>`tract-mirror-steward-006` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-005" -->
### 2026-11-17 — cycle 2 — All six vowels refit to sing on their targets with the lip filter on: worst error goes from 14% flat to 1.2%. Python only, ready for your ears.
> shipped · plugin untouched · steward leans WIRE-IN after you listen

**What I did.** I refit each vowel's 64-point tube so that its formants, measured with the lip filter on (the exact model of what the speaker plays), meet the same Peterson–Barney targets as before. Each fit starts from the current tube and is pulled back toward it. Three formants don't decide a tube, so the current shape stands in for 'what this mouth looks like'. Each vowel moves a little and doesn't become a different mouth. It passes at both 44.1k and 48k.

**What changed in the tubes.** Mostly the lips. They open a little on /e i u/ and schwa (/e/ from 1.7 to 2.8 cm²). That is the physical answer: the lip filter lowers F1, and opening the lips raises it again. Measured as a difference in overall shape, each tube moved only 0.6–1.0 dB.

**Checked twice.** The fit gates on the eigenvalue model. As a separate check, I took the spectral peaks of each refit tube's rendered impulse response with the lip filter on. They land within 1–2% of the model (check-ir.json).

**Listen.** audition-six-vowels-old-then-new.wav plays each vowel now, then refit, at 110 Hz. You'll hear /e/ and /u/ change most. audition-morph-old-then-new.wav glides a-e-i-o-u twice, now and then refit.

**Passed over:** refitting from the old mouth sketches with no pull toward the current tubes. It also hits the targets, but the listening probe showed it can find a very different tube for the same vowel (11.9 dB apart for /e/), and the 3D screen would change shape under you.

**Artifacts:**
- [each vowel now, then refit, at 110 Hz: a, e, i, o, u, schwa.](Projects/Tract Mirror/refit/audition-six-vowels-old-then-new.wav)
- [a-e-i-o-u glide, now, then refit.](Projects/Tract Mirror/refit/audition-morph-old-then-new.wav)
- [the six tubes now (grey) and refit (orange): mostly the lips open.](Projects/Tract Mirror/refit/tubes-old-new.png)
- [the refit: as-sung formants, pulled back toward the current tube, gated at 44.1k and 48k.](Projects/Tract Mirror/refit/refit.py)
- [the refit tubes, same shape as reference/vowels.json. Not wired in.](Projects/Tract Mirror/refit/vowels-refit.json)
- [formants before and after, gate, how far each shape moved.](Projects/Tract Mirror/refit/refit-results.json)
- [separate check from the rendered impulse response's spectral peaks.](Projects/Tract Mirror/refit/check_ir.py)
- [that check's numbers: within 1–2% of the model.](Projects/Tract Mirror/refit/check-ir.json)

_Error on the lowest three formants as sung (lip filter on), against Peterson–Barney targets, %_
| vowel | now F1 / F2 / F3 | refit F1 / F2 / F3 | shape moved (dB) |
| --- | --- | --- | --- |
| a | −3.0 / −6.7 / −4.1 | +0.3 / −1.2 / −0.7 | 1.02 |
| e | −13.6 / −1.9 / −2.8 | −0.7 / −0.1 / −0.1 | 1.01 |
| i | −8.0 / −1.6 / −3.2 | −0.4 / −0.2 / −0.2 | 0.83 |
| o | −2.0 / −2.3 / −0.8 | −0.3 / −0.1 / +0.2 | 0.61 |
| u | −11.9 / −3.1 / −1.3 | −0.8 / 0.0 / +0.1 | 0.83 |
| schwa | −6.2 / −5.5 / −4.5 | −0.3 / −0.3 / −0.3 | 0.85 |

_Left rough:_ Nobody has heard the refit yet, me included: it's tuned to the numbers, not to an ear. Wiring it in also means recomputing the plugin's vowel loudness matching, which was built from the old shapes.

_Next moves named:_ If you say wire it in: copy vowels-refit.json over reference/vowels.json, redo the plugin's vowel-loudness table, rebuild, and rerun the render, loudness, MIDI and Word checks. · Meanwhile, the next part of the plan, learning to speak by listening: a first design for sing-in, sing-back, built on what the listening probe found.
<sub>`tract-mirror-steward-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-94f25dd1a9" -->
### 2026-11-17 — cycle 2

taught item 2
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-003" -->
### 2026-11-05 — cycle 1 — My vowels sing up to 14% flat of their targets. Should I refit them, and if so, audition before touching the plugin?
> still working · flat vowels found by listening, not fixed · steward leans AUDITION-REFIT

Tract Mirror is the singing plugin you loaded in Live in June. This cycle I started on the plan's last step, learning to speak by listening, and the first listening probe found that my six vowels sing below the formant targets they were fitted to. /e/'s first formant is 458 Hz where its target is 530, and schwa's is 469 where its target is 501. The cause is a small filter on the lip reflection. It's on whenever I sing, and it was off when the vowels were fitted and checked. The fix is a refit scored on the as-sung model. But it changes the voice you heard in Live, and you might like that darker voice. My lean: I render the current vowels against refitted ones in Python only and let your ears decide. Other paths: keep the sound as it is and only correct the docs, or refit and rebuild the plugin straight away. The tubes I heard are in [the listening picture](open:Projects/Tract Mirror/listening/tubes-heard.png). I keep working on the ear either way.

**Artifacts:**
- [What the listener heard; the as-sung vs on-paper numbers are in the shipped post's table.](Projects/Tract Mirror/listening/tubes-heard.png)
<sub>`tract-mirror-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-002" -->
### 2026-11-05 — cycle 1 — I listened for the first time. I can hear a vowel, fit a tube to it, and sing it back, and listening showed my own vowels sing 2–14% flat.
> shipped · first listening probe, on the plan's 'learn to speak by listening' step · steward leans audition a refit

**What the probe does.** It listens two ways. (1) *The mirror read backwards*: LPC on the audio gives a ladder of reflection coefficients, and my whole thesis says those *are* tube junctions. So each one becomes an area ratio, with no optimizer. (2) *Fit what you hear*: take the three formants an ordinary phonetics ear hears, then let the fitter that made my vowels find a tube that sings them. It isn't told which vowel it's hearing. It tries every mouth shape it knows as a starting point and keeps the closest fit. I fed it my own six vowels (truth known) and six vowels from two macOS voices I didn't make, Daniel and Samantha (truth unknown).

**The find: I sing my vowels flat.** My vowels were fitted, and every gate since then (including the June '0.00% formant error') was measured, with a small filter on the lip reflection switched off. The audio path has it on, in the Python renders and in the plugin (`radiationLowpass = 0.75` in TractEngine). That filter lowers every formant. /e/ sings with F1 at 458 Hz against its 530 target, and schwa at 469 against 501. I built an exact as-sung model (the same state matrix plus one state for that filter). It agrees with the rendered impulse response to within a few Hz. So the gates checked a tube the speaker never plays.

**What works.** Fitting to what was heard, scored on the as-sung model, matched all twelve vowels to within 1% on F1–F3, Daniel's and Samantha's included. The replay WAVs are each heard vowel followed by my tube singing it back.

**What doesn't yet.** (a) The ear: ordinary LPC formant picking hears F1 3–18% low on my 110 Hz vowels. That error goes straight into the replay, so the ear is the next thing to fix. (b) The mirror read backwards is lovely on a clean echo of the tube (schwa comes back almost exactly, 1.5 dB off in shape). On sung audio it loses F1 to the losses at the tube's ends, and on Samantha's shorter tract it fails outright. It works as a starting guess, not a replacement for fitting. (c) The same formants come from different tubes. My fitted /e/ is a narrow pipe, while the true /e/ is wide in the middle, yet both sing the same three formants. Three numbers don't pin down a mouth. To get *your* shape back and not just *a* shape that sounds like you, the listener will need a sense of what real mouths look like.

**Passed over:** importing a ready-made formant tracker. I wanted the ear built from the same Levinson recursion the instrument is made of, so its failures are mine to see.

**Artifacts:**
- [Start here: twelve tubes heard. White is the tube that sang it, amber the tube I fitted to what I heard, teal and rose the mirror read backwards. The bottom row is Daniel and Samantha.](Projects/Tract Mirror/listening/tubes-heard.png)
- [Daniel's and Samantha's a, i and u, each followed by my tube singing it back (34 s; stays on this Mac).](Projects/Tract Mirror/listening/replay-other-voices.wav)
- [My six vowels, three times each: the true tube, the fitted tube, the mirror's tube (16 s; stays on this Mac).](Projects/Tract Mirror/listening/replay-reference-vowels.wav)
- [The probe: as-sung formant model, LPC ear, fit-what-you-hear, mirror read backwards, replays and the picture.](Projects/Tract Mirror/listening/listen.py)
- [Every measurement: formants on paper, as sung, heard, refitted; shape distances; both voices.](Projects/Tract Mirror/listening/listen-results.json)
- [Every recovered 64-point area function, for the next cycle to build on.](Projects/Tract Mirror/listening/heard-areas.npz)
- [What the probe found, in five lines, and how to run it.](Projects/Tract Mirror/listening/README.md)
- [Input: macOS Daniel, 'ahh'.](Projects/Tract Mirror/listening/voices/Daniel_a.wav)
- [Input: macOS Daniel, 'eee'.](Projects/Tract Mirror/listening/voices/Daniel_i.wav)
- [Input: macOS Daniel, 'ooo'.](Projects/Tract Mirror/listening/voices/Daniel_u.wav)
- [Input: macOS Samantha, 'ahh'.](Projects/Tract Mirror/listening/voices/Samantha_a.wav)
- [Input: macOS Samantha, 'eee'.](Projects/Tract Mirror/listening/voices/Samantha_i.wav)
- [Input: macOS Samantha, 'ooo'.](Projects/Tract Mirror/listening/voices/Samantha_u.wav)

_My own six vowels: the target on paper, what the speaker actually sings, what the listener heard, and what the fitted tube sings back (F1 / F2 / F3, Hz)_
| vowel | on paper (filter off) | as sung (filter on) | heard by LPC | fitted tube sings | fitted shape vs true (dB) |
| --- | --- | --- | --- | --- | --- |
| a | 730 / 1090 / 2441 | 708 / 1017 / 2341 | 686 / 972 / 2367 | 686 / 972 / 2365 | 4.0 |
| e | 530 / 1840 / 2481 | 458 / 1806 / 2410 | 404 / 1809 / 2416 | 404 / 1809 / 2416 | 11.9 |
| i | 270 / 2290 / 3010 | 248 / 2254 / 2913 | 215 / 2253 / 2905 | 215 / 2253 / 2905 | 3.6 |
| o | 569 / 836 / 2392 | 558 / 821 / 2390 | 516 / 790 / 2407 | 516 / 791 / 2406 | 6.4 |
| u | 300 / 870 / 2241 | 264 / 843 / 2211 | 216 / 840 / 2207 | 216 / 841 / 2204 | 8.1 |
| schwa | 501 / 1503 / 2506 | 469 / 1418 / 2388 | 419 / 1412 / 2394 | 419 / 1412 / 2394 | 1.6 |

_Left rough:_ I can't hear, so whether the replays sound like the voices they followed is unchecked by ear. The listener has heard only text-to-speech so far, never a human voice. Its ear hears F1 3–18% low. And I haven't touched the plugin or vowels.json: the flat vowels are found, not fixed.

_Next moves named:_ Render an audition of my six vowels as they sing now against a refit scored on the as-sung model (Python only, plugin untouched), so your ears decide whether the fix is worth changing the plugin's sound. The card on the TRICKSTER board asks which way you want it. · Fix the ear: average the formant estimate across the vibrato and try closed-phase analysis, so F1 stops reading low. · Then a human voice: one sustained vowel of yours, recorded at the machine, is the real test of 'sing into it and it sings back'.
<sub>`tract-mirror-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-07419c459c" -->
### 2026-11-05 — cycle 1

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-55-14-04-00" -->
### 2026-09-25 — Plan agreed: the first build is done; what's next

Loudon asked for a plan on 2026-09-25. The JUCE build plan is finished — every phase checked, loaded in Live 12 on 2026-06-10 (8fe43255) — and now serves as the build log, so it stays as it is. The plan takes what the build log leaves open (the MIDI controls and Word mode, never played in Live) and the next version the entry names (the record-and-analyze engine). The build's locked decisions of 2026-06-09 became Standing Orders.
<sub>`plan-2026-09-25T20-55-14-04-00` · plan agreed · agreed 2026-09-25T20:55:14-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-09-23" -->
### 2026-09-23 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (40 media files, newest first):

- [the-mirror.png](Projects/Tract Mirror/renders/the-mirror.png) · 2026-09-23
- [gui-prototype.png](Projects/Tract Mirror/renders/gui-prototype.png) · 2026-09-23
- [clip_tube_morph.mp4](Projects/Tract Mirror/renders/clips/clip_tube_morph.mp4) · 2026-09-23
- [clip_scattering_junction.mp4](Projects/Tract Mirror/renders/clips/clip_scattering_junction.mp4) · 2026-09-23
- [clip_glottal_source.mp4](Projects/Tract Mirror/renders/clips/clip_glottal_source.mp4) · 2026-09-23
- [ableton-proof.png](Projects/Tract Mirror/renders/ableton-proof.png) · 2026-09-23
- [vowel_schwa.wav](Projects/Tract Mirror/reference/renders/vowel_schwa.wav) · 2026-09-23
- [vowel_u.wav](Projects/Tract Mirror/reference/renders/vowel_u.wav) · 2026-09-23
- [vowel_e.wav](Projects/Tract Mirror/reference/renders/vowel_e.wav) · 2026-09-23
- [vowel_i.wav](Projects/Tract Mirror/reference/renders/vowel_i.wav) · 2026-09-23
- [vowel_o.wav](Projects/Tract Mirror/reference/renders/vowel_o.wav) · 2026-09-23
- [spectrogram_schwa.png](Projects/Tract Mirror/reference/renders/spectrogram_schwa.png) · 2026-09-23
- [spectrogram_u.png](Projects/Tract Mirror/reference/renders/spectrogram_u.png) · 2026-09-23
- [tube_profiles.png](Projects/Tract Mirror/reference/renders/tube_profiles.png) · 2026-09-23
- [vowel_a.wav](Projects/Tract Mirror/reference/renders/vowel_a.wav) · 2026-09-23
- [morph_a_i_u.wav](Projects/Tract Mirror/reference/renders/morph_a_i_u.wav) · 2026-09-23
- [spectrogram_a.png](Projects/Tract Mirror/reference/renders/spectrogram_a.png) · 2026-09-23
- [spectrogram_e.png](Projects/Tract Mirror/reference/renders/spectrogram_e.png) · 2026-09-23
- [spectrogram_i.png](Projects/Tract Mirror/reference/renders/spectrogram_i.png) · 2026-09-23
- [spectrogram_o.png](Projects/Tract Mirror/reference/renders/spectrogram_o.png) · 2026-09-23
<sub>backfill · scroll born 2026-09-23</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
