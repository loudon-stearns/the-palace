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

> _Regenerated 2026-11-05T16:14:43.591Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 1 · last ran 2026-11-05 (today)
- **Plan:** agreed 2026-09-25 (41 days ago) · 2 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-05 (today) — My vowels sing up to 14% flat of their targets. Should I refit them, and if so, audition before touching the plugin? (`tract-mirror-steward-003`)
- **Last commit touching this project:** 2026-11-03 `a027a3f7` — edit(Loudon Live Design System): the browser's furniture fan-out, batch 3 of 5: Projects, Q to Z (94 pages)
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-05 — cycle 1 · taught item 1
- **Owed in the ledger:** nothing
- **Latest lesson:** item 1, from cycle 1 — 2026-11-05 — [[Tract Mirror — tuning]]

### Where this stands

Tract Mirror is the palace's first native plugin, a one-voice singing synth for Ableton. The 3D tubes on its screen are the filter itself: each step in width between two cylinders is one reflection coefficient of an LPC lattice. The first build is done. The Python reference, the C++ plugin, the WebView screen, validation, a verified load in Live 12 on 2026-06-10, MIDI controls, loudness matching and Word mode all shipped in June. The plan has two steps left. The first is playing the newest controls inside Live, which waits on you at the machine. The second is learning to speak by listening, so that you sing into it and it sings back with your tract shape. That step had no design until now.…

### Open asks

- `tract-mirror-steward-003` — directional_decision · posted 2026-11-05 · options: AUDITION-REFIT · KEEP-AS-IS · REFIT-NOW

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

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
