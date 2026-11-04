---
title: "Floquet Time-Modulated Loops — scroll"
born: 2026-09-23
links:
  - target: "[[Floquet Time-Modulated Loops]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Floquet Time-Modulated Loops's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Floquet Time-Modulated Loops — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Floquet Time-Modulated Loops]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-04T02:15:12.337Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 8 · last ran 2026-11-04 (today)
- **Plan:** agreed 2026-09-26 (39 days ago) · 11 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-04 (today) — The surface filters have four proofs. Shall I start the fourth instrument next, working backward from a target sound? (`floquet-steward-019`)
- **Last commit touching this project:** 2026-11-03 `2e29ffe8` — steward(Floquet Time-Modulated Loops): cycle 7 — SPINNING UP. HOME: [Floquet Time-Modulated Loops](obsidian://open?vault…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 8 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-03 — cycle 8 · taught item 15, proposed item 16 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 3 — items 6, 8, 16; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 16, from cycle 8 — 2026-11-03 — [[Floquet Time-Modulated Loops — tuning]]

### Where this stands

Floquet Time-Modulated Loops argues that the 'nothing changes over time' assumption under almost every audio loop is a choice, and it has five instruments on its plan. The first, a pumped resonator, is built and waits on Max, which is paused. The second, a string with its loudness and length pumped, has its browser proofs. The third is where the work is: it plays a wavetable surface from the 2D Torus library as a filter that changes over time, with one axis read as the filter and the other scanned. Last cycle the scan was tied to the input's pitch, which kept a plucked melody in tune but only sometimes held on speech. This cycle rebuilt the speech with a pitch known exactly and found why. M…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 1:** Its script parses, and the browser filter still matches the Python. _(in 3 notes, the latest cycle 8)_
- **rough since cycle 2:** Nobody has heard it yet: not the play page, and not the reels. _(in 7 notes, the latest cycle 8)_

### Open asks

- `floquet-steward-019` — directional_decision · posted 2026-11-04 · options: MOVE-ON · STAY-VOICE · STAY-SURFACES

### Answered, not yet consumed

_None._

### Decided

- `floquet-steward-014` — directional_decision → GRANTED — option_id=SOUNDS-RIGHT; notes: "I wonder about trying options where the scan rate is kept relative to the pitch, in ratios to it both big integer ratios, and small percentages of it. I like the idea of having hann, I am curious to know more about what that is. IS this a filter that can go over any sound? If so we need to have a more varied collection of input sounds, like spoken words!" (2026-11-04)
- `floquet-steward-003` — directional_decision → GRANTED — option_id=GENTLE (2026-11-04)

### Runs

- 2026-11-03 — cycle 8 · taught item 15, proposed item 16 for canon
- 2026-11-03 — cycle 7 · taught item 13, proposed item 14 for canon
- 2026-11-03 — cycle 6 · taught item 11, proposed item 12 for canon
- 2026-11-03 — cycle 5 · taught item 9, proposed item 10 for canon
- 2026-11-03 — cycle 4 · taught item 7, proposed item 8 for canon
- 2026-11-03 — cycle 3 · taught item 5, proposed item 6 for canon
- 2026-11-03 — cycle 2 · taught item 3, proposed item 4 for canon
- 2026-11-03 — cycle 1 · taught item 1, proposed item 2 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **6.** 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Stages 2–5 — the development arc, ### Stage 2 — Floquet Comb, a new paragraph after the first — Adds what the two-pump proof measured to the Stage 2 sketch, and corrects the tongue width to its two meanings.
- **8.** 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Open Questions, the bullet 'Does the tanh saturation in Stage 1 distort the Strutt picture?', a new progressed line after the existing one — The question asked which saturation is the right sound; Loudon answered it, and the measured level law is the reason it teaches well.
- **16.** 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Stages 2–5 — the development arc, ### Stage 3 — Floquet Kernel (wavetable as filter), a new paragraph after the first — Item 14 left the voice case open; the known-pitch test shows when the locked scan can follow a live voice and when it can't, and that sets the codebox's pitch input.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A five-stage arc of instruments, any of them buildable in public on [[Loudon Live]], showing that the "nothing changes over time" assumption under almost every audio loop is a choice. Let a loop's coefficient breathe periodically and you get parametric resonance, sideband ladders, frequency bandgaps, and at the far end a small audio time crystal. Behind it: the first instrument, a resonator that cracks into ringing when its tuning is pumped (the [[Mathieu Equation]] in `codebox~`), is taught in depth in the entry, and its twenty media pieces, the `codebox~` source and a Python reference were built and checked in Python on 2026-04-30 ([[BUILD_SUMMARY|the build summary]]). Nothing past that first instrument has been built.

**The moves ahead**

1. **Finish the resonator and teach it.** Run the `codebox~` in Max against its Python reference (the A/B harness is in `RNBO/README — Mathieu Resonator.md`), and rule on the two calls the build made on its own: a little damping so there is a threshold to cross, and a soft clip on the state so it never overflows ([[NOTES|the build notes]]). Then walk the media and choose the cross-domain hook for the first instrument.
2. **Pump a comb.** A Karplus-Strong delay loop whose loop gain and loop length are each modulated at their own rate. Inside the right regions the comb's peaks shift and multiply, and a spectrum analyzer running beside the audio carries the lesson.
3. **Turn the wavetable surfaces into filters.** Each surface in the [[2D Torus Wavetable Synthesizer — catalog — wavetables|2D Wavetable Catalog]] becomes a time-varying filter, one axis read as delay and the other scanned at audio rate, so a surface's synthesis character comes back as a filter character. The filtering sibling of the [[2D Torus Wavetable Synthesizer]].
4. **Work backward from the sound you want.** Pick a target spectrum from [[Categorizing Inharmonicity]], solve offline in Python for the modulation that produces it, and play that modulation from a wavetable. This is the hard inverse problem; how much of it is tractable is still an open question.
5. **Build a small time crystal.** Slow the modulation down into rhythm and couple it to audio-rate sound, so locking and unlocking are heard at once as rhythm and as timbre. The Hopf control surface from the torus project carries over.

What each later instrument is, with its cross-domain hook and build environment, is sketched in [[Floquet Time-Modulated Loops#Stages 2–5 — the development arc|the entry]].
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="floquet-steward-019" -->
### 2026-11-04 — cycle 8 — The surface filters have four proofs. Shall I start the fourth instrument next, working backward from a target sound?
> still working · third instrument proven in Python and the browser · steward leans MOVE-ON

Quick catch-up: this project has five instruments. The third plays a wavetable surface as a filter that changes over time. It now has four proofs: the filter itself, a cheap version that runs as a bank of band-passes and frequency shifts, real inputs with a scan tied to the pitch, and today's test showing which surfaces can follow a live voice. What's left there is either hearing it or waiting on Max. The next instrument on the plan works backward: pick a target spectrum, such as piano-stretched partials, and solve for the pump that makes a loop ring with it. That move is the hardest and least certain on the plan. Staying would mean recording a real voice, or rendering more surfaces as filters. I lean on moving on, and I keep working either way.

**Artifacts:**
- [Today's result: what a wrong or late pitch costs each surface.](Projects/Floquet Time-Modulated Loops/kernel/voice_budget.png)
- [reel_4_drums.wav](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_4_drums.wav)
- [reel_3_pitch_locked_speech.wav](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_3_pitch_locked_speech.wav)
- [reel_2_pitch_locked_melody.wav](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_2_pitch_locked_melody.wav)
- [reel_1_knot_shadow_speech.wav](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_1_knot_shadow_speech.wav)
- [drum_loop.wav](Projects/Floquet Time-Modulated Loops/kernel/inputs/drum_loop.wav)
- [pluck_melody.wav](Projects/Floquet Time-Modulated Loops/kernel/inputs/pluck_melody.wav)
- [speech_flo.wav](Projects/Floquet Time-Modulated Loops/kernel/inputs/speech_flo.wav)
- [speech_daniel.wav](Projects/Floquet Time-Modulated Loops/kernel/inputs/speech_daniel.wav)
<sub>`floquet-steward-019` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-018" -->
### 2026-11-04 — cycle 8 — I tested whether the pitch tracker breaks the pitch-locked scan on a voice. Mostly it was my measure, and only Penrose needs a near-perfect tracker.
> shipped · third instrument's fourth proof · steward leans move on to working backward from a target sound

I wanted to know why the pitch-locked scan seemed to slip on a voice, and last cycle I blamed the pitch tracker without testing it. To test it, I rebuilt Daniel's and Flo's phrases by laying each voice's spectral envelope over a buzz whose pitch I set. The sentence and the formants are the same, but now the pitch is known exactly ([the note](obsidian://open?vault=The%20Palace&file=Projects/Floquet%20Time-Modulated%20Loops/kernel/Floquet%20Kernel%20%E2%80%94%20on%20a%20voice.md)).

Three things came out. First, my old score blurred a gliding pitch across 170 ms frames. Scored in time warped to follow the pitch, Penrose locked at 2× reads 0.89 on the voice where the old score said 0.17. Second, a pitch error is multiplied by how many harmonics the scan moves a partial, so each surface has its own budget. Theta (2 harmonics) and Knot Shadow at 1/3 (1 to 3) lose only a few points at 1 % off or 20 ms late, and the plain tracker from last cycle is fine for them. Penrose (12 and 20 harmonics) drops from 0.89 to 0.50 at half a percent off and to 0.05 at 1 %, and loses a third at 10 ms late. Locked Penrose is for a synth voice, where the note gives the pitch. Third, Flo's low score on Knot Shadow at 1/3 isn't an error. That setting moves every harmonic down one place, and her fundamental, the main thing the filter passes, lands at 0 Hz. It wants a low voice.

You asked for large whole-number ratios. Theta stays in tune at 1 through 8× on both the melody and the voice. Penrose holds on the melody but starts to slip on a gliding voice from 4× up. The play page's ratio slider now runs to 8 and snaps to 4, 6 and 8.

To hear it: [the error-budget reel](open:Projects/Floquet Time-Modulated Loops/kernel/voice/reel_5_tracker_error_budget.wav). From 44.8 s it plays Penrose with the true pitch, then 0.5 % sharp, then 10 ms late.

**Artifacts:**
- [What a wrong or late pitch costs each surface: Theta and Knot Shadow barely notice, and Penrose falls off a cliff.](Projects/Floquet Time-Modulated Loops/kernel/voice_budget.png)
- [63 s: Daniel as say made him, rebuilt, then three surfaces with true, sharp, late and tracked pitch.](Projects/Floquet Time-Modulated Loops/kernel/voice/reel_5_tracker_error_budget.wav)
- [The melody through Theta locked at 1, 2, 3, 4, 6 and 8 × pitch, then the rebuilt Daniel at 1, 3 and 8.](Projects/Floquet Time-Modulated Loops/kernel/voice/reel_6_big_whole_ratios.wav)
- [Daniel rebuilt over a buzz with a known pitch.](Projects/Floquet Time-Modulated Loops/kernel/inputs/speech_daniel_known_pitch.wav)
- [Flo rebuilt over a buzz with a known pitch.](Projects/Floquet Time-Modulated Loops/kernel/inputs/speech_flo_known_pitch.wav)
- [The workshop note: method, tables, the Flo case, big ratios, what the codebox needs.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — on a voice.md)
- [The proof: known-pitch resynthesis, the pitch-warped measure, the error budget, the reels.](Projects/Floquet Time-Modulated Loops/kernel/voice.py)
- [Draws the error-budget chart.](Projects/Floquet Time-Modulated Loops/kernel/voice_figure.py)
- [Every number in this post.](Projects/Floquet Time-Modulated Loops/kernel/voice_report.json)
- [The play page; the ratio now reaches 8 and snaps to 4, 6 and 8.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — play.html)
- [Last cycle's note, with a correction line at the top.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — on real sounds.md)

_Daniel rebuilt with a known pitch: share of voiced energy on harmonics, locked scan_
| surface, lock | true pitch | 1 % sharp | 2 % sharp | 10 ms late | 40 ms late | last cycle's tracker |
| --- | --- | --- | --- | --- | --- | --- |
| Theta, 2× (moves 2) | 0.91 | 0.89 | 0.85 | 0.90 | 0.83 | 0.90 |
| Knot Shadow, 1/3 (moves 1–3) | 0.86 | 0.85 | 0.79 | 0.86 | 0.82 | 0.87 |
| Penrose, 2× (moves 12 and 20) | 0.89 | 0.05 | 0.01 | 0.61 | 0.28 | 0.56 |

_Changed in the workshop:_ Floquet Kernel — on a voice — New workshop note for the third instrument's fourth proof: the tracker test.
_Changed in the workshop:_ Floquet Kernel — on real sounds — Added a correction line: its voice numbers came from a smearing measure, and the 'tripled' claim was wrong.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Stages 2–5 — the development arc, ### Stage 3 — Floquet Kernel (wavetable as filter), a new paragraph after the first) — Item 14 left the voice case open; the known-pitch test shows when the locked scan can follow a live voice and when it can't, and that sets the codebox's pitch input.; owed in the tuning ledger until Loudon's review; it replaces item 14

_Left rough:_ Nobody has heard it yet: not the play page, and not the reels. Only Loudon can do that part. The rebuilt voice is robotic by design, a real recorded voice is still missing, and I couldn't re-run the play page in headless Chrome. Its script parses, and the browser filter still matches the Python.

_Next moves named:_ Begin the fourth instrument: pick one target spectrum from Categorizing Inharmonicity (piano-stretched partials first) and solve offline in Python for the pump that makes the gentle resonator or the pumped string ring with it. · For the codebox, when the Max pause lifts: the pitch-locked scan needs a pitch input, and a tracker within 1 % and 20 ms is enough for Theta and Knot Shadow. Penrose locked takes its pitch from the note, not a tracker. · If a real recorded voice turns up, run voice.py's measures over it unchanged.
<sub>`floquet-steward-018` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-b3a0737c7c" -->
### 2026-11-03 — cycle 8

taught item 15, proposed item 16 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-016" -->
### 2026-11-04 — cycle 7 — The surface filters now run over a voice, a plucked melody and drums, and the scan can follow the pitch. Locked, the output stays in tune.
> shipped · four listening reels and a play page with speech · steward leans locked scan as the default mode

Yes, it is an effect: any sound goes in. I made an input set (two spoken phrases from macOS voices, a plucked melody whose every pitch is known, a drum loop) and four listening reels, each starting dry.

The scan that follows the pitch is the find. Set the scan to r × the input's pitch. A partial a mode moves n steps comes out at (h + n·r) × the pitch, so whenever n·r is a whole number every moved partial lands back on a harmonic. The result stays in tune while the voice moves: the filter changes the timbre and follows the singer. On the melody the theory holds cleanly: Theta locked to 2× the pitch keeps 0.95 of its energy on harmonics, against 0.53 for a fixed scan at the same average rate. Knot Shadow locked to 2/3 keeps 0.95, and fixed at 15.6 Hz it keeps 0.02. On the voice it holds only partly, because the pitch is tracked beforehand by a small tracker, and Knot Shadow triples any tracking error.

Knot Shadow on a voice is not a clean pitch shifter. That reading held for sines on its three band centres only. Each band moves everything inside it by the same hertz, so a voice goes partly shifted and partly ring-modulated, and muffled, since the bands all sit under 650 Hz. Locking the scan to the pitch is what makes it musical.

Small percentages: at 3 % of the pitch, Theta shimmers close to each harmonic and the shimmer speeds up as the pitch rises. Penrose turns into a cloud, because its modes move 6 and 10 steps.

Hann, in plain words: the filter is 512 taps, about 11 ms of impulse response. Plain, it starts and stops like a sound cut with scissors, and each band leaks into its neighbours (first leak only 13 dB down). Hann lays a smooth raised-cosine hump over the taps so it fades in and out: the leak drops to 31 dB down, and each band gets about twice as wide. Rounder, less ringing bands. It costs the bank nothing new.

The play page now has the spoken phrase (with its tracked pitch) and the melody as sources, and a 'scan follows the pitch' switch with a ratio from 1 % to 4 that snaps to 1/3, 1/2, 2/3, 1, 4/3, 2, 3. Its DSP still matches the Python to 112–125 dB, and it played all sources in headless Chrome with no errors. Full write-up: [Floquet Kernel — on real sounds](obsidian://open?vault=The%20Palace&file=Projects/Floquet%20Time-Modulated%20Loops/kernel/Floquet%20Kernel%20%E2%80%94%20on%20real%20sounds.md).

The four reels are only worth something once you hear them, and I can't hear them for you. Reel 2, the melody, is the quickest: dry, then Theta locked, then Theta fixed at the same rate, and the in-tune-versus-drifting difference should be obvious inside thirty seconds.

**Artifacts:**
- [Start here: plucked melody dry, then Theta and Penrose with the scan locked to the pitch vs fixed. Locked stays in tune.](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_2_pitch_locked_melody.wav)
- [Knot Shadow on two voices: frozen, fixed scans aimed down a fourth and up a third, then locked to 1/3 and 2/3 of the pitch.](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_1_knot_shadow_speech.wav)
- [The same locked-vs-fixed set as the melody reel, on the spoken phrase.](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_3_pitch_locked_speech.wav)
- [A drum loop through Theta at 2 Hz, Penrose at 6.25 and 60 Hz, Knot Shadow at 15.6 Hz. Unmeasured.](Projects/Floquet Time-Modulated Loops/kernel/phrase/reel_4_drums.wav)
- [The play page, now with the spoken phrase, the melody, and a scan that follows the pitch.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — play.html)
- [The write-up: what the locked scan does, what Knot Shadow does to a voice, what Hann is.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — on real sounds.md)
- [Builds the inputs, tracks the voice's pitch, renders the reels, measures harmonicity.](Projects/Floquet Time-Modulated Loops/kernel/phrase.py)
- [Every number, and what plays at which second of each reel.](Projects/Floquet Time-Modulated Loops/kernel/phrase_report.json)
- [Input: spoken phrase, Daniel voice.](Projects/Floquet Time-Modulated Loops/kernel/inputs/speech_daniel.wav)
- [Input: spoken phrase, Flo voice.](Projects/Floquet Time-Modulated Loops/kernel/inputs/speech_flo.wav)
- [Input: plucked melody, known pitches.](Projects/Floquet Time-Modulated Loops/kernel/inputs/pluck_melody.wav)
- [Input: two-bar drum loop.](Projects/Floquet Time-Modulated Loops/kernel/inputs/drum_loop.wav)

_Harmonicity: share of energy on harmonics of the input's pitch (dry melody 0.84, dry voice 0.44)_
| surface, scan | melody | voice (Daniel) |
| --- | --- | --- |
| Theta, locked to 2 × pitch | 0.95 | 0.61 |
| Theta, fixed at the same average rate | 0.53 | 0.52 |
| Penrose, locked to 2 × pitch | 0.94 | 0.23 |
| Penrose, fixed | 0.75 | 0.18 |
| Knot Shadow, locked to 2/3 × pitch | 0.95 | 0.41 |
| Knot Shadow, locked to 1/3 × pitch | 0.89 | 0.62 |
| Knot Shadow, fixed at 15.6 Hz | 0.02 | 0.07 |

_Changed in the workshop:_ Floquet Kernel — on real sounds — New workshop note for the third instrument's third proof: real inputs and the pitch-locked scan.
_Changed in the workshop:_ Floquet Kernel — play.html — Added the spoken phrase and melody sources, the scan-follows-pitch switch, and a plain note on Hann.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Stages 2–5 — the development arc, ### Stage 3 — Floquet Kernel (wavetable as filter), a new paragraph after the first) — Item 12 called Knot Shadow a pitch shifter; on a voice that holds only with the scan locked to the pitch, and the locked scan is the finding that makes the filter playable.; owed in the tuning ledger until Loudon's review; it replaces item 12

_Left rough:_ Nobody has heard it yet: not the play page, and not the four reels. The voices are synthetic, and the pitch tracker is too rough to play live through.

_Next moves named:_ Make the locked scan the page's default and test it on a sung or real recorded voice, with a better pitch tracker, since Knot Shadow triples the tracker's error. · Give the two expensive surfaces (Stiff String, Chladni Ghost) a cheap form, or settle that they run as the full filter. · For the codebox when the Max pause lifts: one more input, the pitch (the note, or a smoothed sigmund~/fzero~), driving the scan phasor as r × pitch.
<sub>`floquet-steward-016` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-ec7f7f2bc3" -->
### 2026-11-03 — cycle 7

taught item 13, proposed item 14 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-014" -->
### 2026-11-04 — cycle 6 — Four cycles of filters and strings, and nobody has listened. Will you play the surface-as-filter page for two minutes?
> still working · page plays, checked against Python · steward leans listen to Penrose and Knot Shadow

This project shows that letting a loop's settings breathe over time opens up sounds a steady loop can't make. I'm on the third of five instruments: a wavetable surface played as a filter that changes over time. Over four cycles I've measured every step of it, but nobody has heard any of it, and only you can. The page lets you hear it in one click. Pick Penrose or Knot Shadow, start the scan near 1 Hz and sweep it up. Flip Hann on and off. If it sounds right, I'll render Knot Shadow as a pitch shifter on a real phrase next. If Hann sounds better, I'll make it the default. If neither grabs you, tell me what's missing. I keep working either way.

**Artifacts:**
- [the surface-as-filter, playable: nine surfaces, scan rate, modes kept, Hann on or off.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — play.html)
- [kernel_map.png](Projects/Floquet Time-Modulated Loops/kernel/kernel_map.png)
- [kernel_d_penrose_noise_glide.wav](Projects/Floquet Time-Modulated Loops/kernel/kernel_d_penrose_noise_glide.wav)
- [kernel_c_membrane_saw_glide.wav](Projects/Floquet Time-Modulated Loops/kernel/kernel_c_membrane_saw_glide.wav)
- [kernel_b_theta_saw_glide.wav](Projects/Floquet Time-Modulated Loops/kernel/kernel_b_theta_saw_glide.wav)
- [kernel_a_penrose_saw_glide.wav](Projects/Floquet Time-Modulated Loops/kernel/kernel_a_penrose_saw_glide.wav)
<sub>`floquet-steward-014` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-013" -->
### 2026-11-04 — cycle 6 — I rebuilt the surface-as-filter from a few modes, so it's cheap enough to play live. You can play it in the browser now.
> shipped · five of nine surfaces exact at a fraction of the cost · steward leans listen next

A surface repeats along both of its axes, so its filter splits exactly into one term per mode. Each term is a band-pass at m × 93.75 Hz followed by a frequency shift of n × the scan rate. Keep the strong modes and you have the same filter at a fraction of the cost. I measured it on all nine named surfaces, not just three. Knot Shadow needs 4 modes, Penrose 5 (its five star directions), and Theta and Membrane 32. All of them come out within 70 to 110 dB of the full 512-tap filter, so they are exact. Stiff String and Chladni Ghost spread over hundreds of modes and stay about 20 dB off even at 64. Those two need the full filter. One surprise: Knot Shadow is a pitch shifter. All of its energy lies on one diagonal, so each band moves in proportion to its own frequency. Sines on its band centres, scanned at 6.25 Hz, came out at 0.90 times their pitch, as predicted. It's the old sliding-delay pitch shifter, reached from a surface. Turning on a Hann window along the taps changes the sound a lot, not just a little, so the page has a switch for your ear. The page's sound code matches the Python version to more than 110 dB in three test cases. It opened in headless Chrome with no errors and its spectrum filled with sound.

**Artifacts:**
- [play it: any of nine surfaces, saw or noise, scan rate, modes kept, Hann on or off, with a mode map and a live spectrum.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — play.html)
- [the note: the idea, the nine-surface table, the Knot Shadow pitch shift, the codebox recipe.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — mode bank.md)
- [the proof: modes, the bank, and how closely it matches the full filter.](Projects/Floquet Time-Modulated Loops/kernel/mode_bank.py)
- [every number in the table, plus each surface's strongest eight modes.](Projects/Floquet Time-Modulated Loops/kernel/mode_bank_report.json)
- [the top 64 modes of each of the nine surfaces: the codebox's coefficients.](Projects/Floquet Time-Modulated Loops/kernel/mode_bank_modes.json)
- [Python's output for three cases, which the page's code is checked against.](Projects/Floquet Time-Modulated Loops/kernel/mode_bank_ref.json)
- [runs the page's own sound code against the Python version (110 to 125 dB below the signal).](Projects/Floquet Time-Modulated Loops/kernel/bank_check.mjs)

_How closely the bank matches the full 512-tap filter (dB of signal over error) · saw 110 Hz, scan 0.25 → 80 Hz_
| surface | modes for 99 % | 8 modes | 32 modes | 64 modes |
| --- | --- | --- | --- | --- |
| Knot Shadow | 4 | 85.6 | 85.6 | 85.6 |
| Penrose | 5 | 69.9 | 69.9 | 69.9 |
| Theta | 7 | 21.1 | 107.7 | 110.9 |
| Fisher Ridge | 7 | 16.9 | 42.4 | 57.6 |
| Matérn | 9 | 18.1 | 31.1 | 38.7 |
| Membrane | 22 | 10.3 | 98.4 | 98.4 |
| Kuramoto Bloom | 26 | 6.7 | 28.4 | 83.8 |
| Chladni Ghost | 85 | 10.8 | 16.2 | 20.0 |
| Stiff String | 158 | 18.0 | 23.8 | 24.2 |

_Changed in the workshop:_ Floquet Kernel — mode bank — New workshop note for the third instrument's second proof: the mode bank.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Stages 2–5 — the development arc, ### Stage 3 — Floquet Kernel (wavetable as filter), a new paragraph after the first) — The Stage 3 sketch claims a surface's synthesis character returns as a filter character. Two proofs now say how, and how to run it cheaply.; owed in the tuning ledger until Loudon's review; it replaces item 10

_Left rough:_ Nobody has heard it yet: not the play page, and not the four glide renders from last cycle. Only Loudon can do that. Stiff String and Chladni Ghost have no cheap form yet, and the Knot Shadow pitch shift is measured on sines only.

_Next moves named:_ Render Knot Shadow as a pitch shifter on a real phrase (a sung line, a drum loop) so the pitch-shift reading can be heard, not just measured. · Find a cheap form for Stiff String and Chladni Ghost: fewer taps, or keep the strongest modes and use the full filter only for the rest. · When the Max pause lifts: the codebox is one 512-sample delay line, one complex one-pole per band, and one phasor per mode; the coefficients are in mode_bank_modes.json.
<sub>`floquet-steward-013` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-3a9e0deb7b" -->
### 2026-11-03 — cycle 6

taught item 11, proposed item 12 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-011" -->
### 2026-11-04 — cycle 5 — I turned three wavetable surfaces into filters that change over time. Each surface's 2D spectrum turns out to be its filter's map, measured exactly.
> shipped · third instrument's first proof, in Python · steward leans build its play page next

The filter: y[n] = Σ_k h(k, φ[n]) · x[n−k]. The 512 taps come from the surface's fast axis, and φ scans its slow axis at f_mod. A surface pattern at fast-axis step m and slow-axis step n becomes a passband at m × 93.75 Hz, and the scan moves that band's output by n × f_mod. So the surface's 2D spectrum is the filter's map; the figure puts them side by side.

With a 440 Hz sine in and a 31 Hz scan, every predicted line (±440 + n × 31) comes out at its predicted level, to better than 0.0001 dB, and 1e-8 or less of the power lands anywhere else.

The three surfaces are three kinds of filter. Penrose splits the input into five bands (281, 844 and 1031 Hz) and moves them by 0, ±6 and ±10 times the scan rate. Even at a 0.25 Hz scan it detunes into a chorus. Theta keeps the pitch: 38 % of its power is on the unmoved rung. Membrane has exactly none there, so scanned fast it gives the pitch away entirely: 98 % of the output is shifted.

Each render glides the scan rate from 0.25 to 80 Hz over 14 s. It starts as a filter you hear move and ends as a ladder of shifted copies, the crossing from ordinary to time-varying in one gesture.

I also opened the gentle resonator and two-pump play pages in headless Chrome and pressed play. No exceptions or console errors, both canvases paint, and the start button changes to its playing state (screenshot check: verify/browser_open_check.mjs). Whether sound reaches a speaker is not something I can check.

**Artifacts:**
- [each surface, its 2D spectrum, and its filter's map. The bright points line up.](Projects/Floquet Time-Modulated Loops/kernel/kernel_map.png)
- [a 110 Hz saw through Penrose, scan gliding 0.25 → 80 Hz: chorus, then five shifted bands.](Projects/Floquet Time-Modulated Loops/kernel/kernel_a_penrose_saw_glide.wav)
- [the same saw through Theta: a soft moving filter that keeps its pitch, then gentle sidebands.](Projects/Floquet Time-Modulated Loops/kernel/kernel_b_theta_saw_glide.wav)
- [the same saw through Membrane: a moving filter, then the pitch handed away entirely.](Projects/Floquet Time-Modulated Loops/kernel/kernel_c_membrane_saw_glide.wav)
- [white noise through Penrose: the five bands, then their shifts.](Projects/Floquet Time-Modulated Loops/kernel/kernel_d_penrose_noise_glide.wav)
- [the note: what was measured, and what the Max build will need.](Projects/Floquet Time-Modulated Loops/kernel/Floquet Kernel — first proof.md)
- [the engine, the exact prediction, the sine check, the renders.](Projects/Floquet Time-Modulated Loops/kernel/floquet_kernel.py)
- [draws kernel_map.png.](Projects/Floquet Time-Modulated Loops/kernel/kernel_figure.py)
- [reads a 2D Torus surface WAV as a 1024 × 1024 grid.](Projects/Floquet Time-Modulated Loops/kernel/surface_io.py)
- [every number above.](Projects/Floquet Time-Modulated Loops/kernel/kernel_report.json)
- [opens a play page in headless Chrome, presses play, reports errors and a screenshot.](Projects/Floquet Time-Modulated Loops/verify/browser_open_check.mjs)

_Three surfaces as filters · 512 taps · 440 Hz sine, 31 Hz scan · and the 110 Hz saw glide_
| surface | power on the unmoved rung | lines within 60 dB | worst error | saw off its harmonics, slow → fast scan |
| --- | --- | --- | --- | --- |
| Penrose | 20 % | 5 | < 0.0001 dB | 82 % → 93 % |
| Theta | 38 % | 7 | < 0.0001 dB | 3 % → 50 % |
| Membrane | 0 % | 8 | < 0.0001 dB | 0.8 % → 98 % |

_Changed in the workshop:_ Floquet Kernel — first proof — New workshop note for the third instrument's first proof.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Stages 2–5 — the development arc, ### Stage 3 — Floquet Kernel (wavetable as filter), a new paragraph after the first) — The Stage 3 sketch claims a surface's synthesis character returns as a filter character; the first proof measured how, and named the three kinds.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has heard it yet. That includes the four kernel glides, and the play pages now run in Chrome but haven't reached anyone's ears. The taps aren't windowed, so each band leaks at −13 dB, and only three of the nine named surfaces were run.

_Next moves named:_ Build the kernel's play page: pick a surface, drag the scan rate, and watch the live spectrum beside the map. · Run the other six named surfaces, and try a Hann window along the taps to hear leaky versus clean bands. · For Max, when the pause lifts: a 512-tap row read is about 49 M multiply-adds a second, so test 128–256 taps, or a bank of band-passes each followed by a frequency shifter (five for Penrose).
<sub>`floquet-steward-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-686866d634" -->
### 2026-11-03 — cycle 5

taught item 9, proposed item 10 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-009" -->
### 2026-11-04 — cycle 4 — Off plan — I built the resonator your way. Its damping grows with its energy, so its loudness follows the pump, and inside the tongue its pitch follows the pump too.
> shipped · gentle resonator built and measured · steward leans back to the pumped comb

_Off plan. Offered as proof of a different direction; the plan stands unless Loudon agrees to change it._

One line changes. Each sample, the ring's energy raises the damping, and nothing is clipped. What it does, measured:

- **The level follows the pump.** On the tongue's centre line it settles at the law below, within 3% from q 0.06 to 1.
- **The crack is still there.** The floor is at −45 dBFS and the ring cracks at q ≈ 0.075 on a 12 s sweep, then climbs to −12 dBFS. That's 34 dB of contrast.
- **The pitch belongs to the pump.** Hold q at 0.3 and glide the pump rate. The ring's pitch follows half the pump to 0.1 Hz, from 190 up to 247 Hz, while the resonator stays tuned to 220.
- **It keeps itself alive.** Cut the noise mid-ring and it holds at −13.4 dB.
- **The ladder is clean.** The 660 Hz rung sits at −35, −26 and −21 dB under the fundamental at q 0.15, 0.4 and 0.8, with no clip overtones on top of it.

One surprise: the tongue leans. Off centre, past q ≈ 0.3, it's louder toward low pump rates and quieter toward high ones than the simple law says. It leans more at 55 Hz than at 220, so it's the Mathieu tongue's own bend, not the integrator.

The play page puts the map in your hand. Click to move, and a meter shows the measured level next to the law's, and the pitch next to half the pump.

**Artifacts:**
- [the gentle resonator, live: click the map, hear the crack, watch the pitch follow the pump.](Projects/Floquet Time-Modulated Loops/gentle/Gentle Resonator — play.html)
- [measured loudness over pump ratio × depth (the tongue, heard as level), and the centred law.](Projects/Floquet Time-Modulated Loops/gentle/gentle_map.png)
- [q 0 → 0.6 over 12 s: silence, the crack, then the level climbing with the pump.](Projects/Floquet Time-Modulated Loops/gentle/gentle_a_crack_and_climb.wav)
- [q 0.3, pump rate glides 1.6 → 2.4: the pitch rides the pump while the level swells and fades.](Projects/Floquet Time-Modulated Loops/gentle/gentle_b_tongue_walk.wav)
- [q 0.15, 0.4, 0.8 held: three levels, one pitch.](Projects/Floquet Time-Modulated Loops/gentle/gentle_c_three_depths.wav)
- [noise cut at 2 s; the ring keeps itself alive.](Projects/Floquet Time-Modulated Loops/gentle/gentle_d_noise_cut.wav)
- [the reference: the tick, the measurements and the renders.](Projects/Floquet Time-Modulated Loops/gentle/gentle_resonator.mjs)
- [draws the map.](Projects/Floquet Time-Modulated Loops/gentle/gentle_figure.py)
- [every number above.](Projects/Floquet Time-Modulated Loops/gentle/gentle_report.json)
- [the measured map grid.](Projects/Floquet Time-Modulated Loops/gentle/gentle_map.json)
- [what was measured, and the codebox changes for when Max reopens.](Projects/Floquet Time-Modulated Loops/gentle/Gentle Resonator — what the codebox needs.md)

_centred level law · measured vs predicted ring energy_
| q | measured E | law E |
| --- | --- | --- |
| 0.06 | 0.012 | 0.011 |
| 0.1 | 0.052 | 0.053 |
| 0.3 | 0.262 | 0.263 |
| 0.5 | 0.469 | 0.474 |
| 1.0 | 0.972 | 1.000 |

_Changed in the workshop:_ Gentle Resonator — what the codebox needs — New workshop note: the gentle resonator's measurements and the codebox changes it will need.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Open Questions, the bullet 'Does the tanh saturation in Stage 1 distort the Strutt picture?', a new progressed line after the existing one) — The question asked which saturation is the right sound; Loudon answered it, and the measured level law is the reason it teaches well.; owed in the tuning ledger until Loudon's review; it replaces item 2

_Left rough:_ Nobody has heard it yet, and the play page hasn't been opened in a browser; I only checked its script parses.

_Next moves named:_ Back to pumping a comb (a plucked-string loop whose loudness and length breathe at their own rates): give the string the same gentle saturation, so its level follows the pump too, and see whether its pulses stay clean. · When Max reopens: rewrite the codebox's tick to the gentle line and fix its comments, per the note. The arithmetic is specified in gentle_resonator.mjs.
<sub>`floquet-steward-009` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-f2969e60a8" -->
### 2026-11-03 — cycle 4

taught item 7, proposed item 8 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-007" -->
### 2026-11-03 — cycle 3 — I put both pumps on the string: the loudness pump keeps it ringing, the length pump adds partials between its harmonics, and a live spectrum shows it.
> shipped · both pumps measured, spectrum view built · steward leans length-rate knob with whole-number detents

The playground [Pumped Comb — two pumps](obsidian://open?vault=The%20Palace&file=Projects/Floquet%20Time-Modulated%20Loops/comb/Pumped%20Comb%20%E2%80%94%20two%20pumps.html) has six presets, both pumps, a spectrogram, and a last-second spectrum. The string's harmonics are ruled in amber over it, and the length pump's new partials in cyan. Its engine matches the Python comb to 1.5e-8. What I measured: the loudness pump at the string's own rate keeps a buzz going. A length wobble on top of it adds partials between the harmonics, and that sustained tone with in-between partials is something neither pump makes alone. At 1.5× and ±16 samples, 11.6 % of the power sits between harmonics while the level holds. The tone keeps going only when the length wobble repeats every one or two passes. At whole-number rates (and at 0.5× and 1.5×) it never broke, out to ±32 samples. At stray rates the pulse riding the loudness peak drifts out of it and the string dies: 2.1213× at ±6, 1.2× at ±8, √2× at ±24. One correction to last cycle: the ±1.7-cent tongue was how fast a ring grows from noise. Once the string is ringing hard, it holds a tone out to ±8 cents of detune, but it doesn't follow the pump; it stays within about a cent of its own pitch.

**Artifacts:**
- [the playground: six presets, both pumps, a spectrogram and the last second's spectrum with harmonics and ladder ruled over them.](Projects/Floquet Time-Modulated Loops/comb/Pumped Comb — two pumps.html)
- [8 s: the buzz held by the loudness pump while a 1.5× length wobble rises to ±16 samples; halfway partials come in and the tone stays.](Projects/Floquet Time-Modulated Loops/comb/comb_f_held_halfway_length.wav)
- [8 s: the same with the wobble at a stray 2.1213×; the tone smears and drops back to noise near ±5 samples.](Projects/Floquet Time-Modulated Loops/comb/comb_g_held_stray_length.wav)
- [the workshop note: what was measured, the open ends, and what the Max build will need.](Projects/Floquet Time-Modulated Loops/comb/Pumped Comb — two pumps.md)
- [pulls the engine out of the page, checks it against Python, re-measures every claim, writes the WAVs.](Projects/Floquet Time-Modulated Loops/comb/comb_two_pumps_check.mjs)
- [one second of the Python comb with both pumps, the reference the check compares against.](Projects/Floquet Time-Modulated Loops/comb/comb_two_pumps_ref.py)
- [the measured numbers.](Projects/Floquet Time-Modulated Loops/comb/comb_two_pumps.json)

_Loudness pump at 1×, ε 0.1, holding the buzz; length pump depth at which the tone dies (6 s runs, one seed)_
| length rate × f₀ | tone dies at, samples |
| --- | --- |
| 0.5 | never, to ±32 |
| 1 | never, to ±32 |
| 1.5 | never, to ±32 |
| 2 | never, to ±32 |
| 3 | never, to ±32 |
| 2.5 | ±32 |
| π/2 ≈ 1.571 | ±32 |
| √2 ≈ 1.414 | ±24 |
| 1.25 · 1.333 · 1.7 | ±12 |
| 1.2 | ±8 |
| 2.1213 | ±6 |

_Changed in the workshop:_ Pumped Comb — two pumps — New workshop note: the two-pump measurements, the renders, and what the Max build needs.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Stages 2–5 — the development arc, ### Stage 2 — Floquet Comb, a new paragraph after the first) — Adds what the two-pump proof measured to the Stage 2 sketch, and corrects the tongue width to its two meanings.; owed in the tuning ledger until Loudon's review; it replaces item 4

_Left rough:_ Nobody has heard it yet; every number is one seed; why stray length rates break in the order they do, and why a detuned pump still holds an unlocked tone, are measured but not explained.

_Next moves named:_ Listen through four seeds at the preset settings to see whether the in-between partials and the break depths hold, and render a short seed comparison. · Pump the length at a whole-number rate and the loudness at 2× or 3×, to see whether the length wobble picks which pulse slots fill instead of the noise doing it. · When the Max pause lifts: the signal flow and knob ranges are written in the workshop note, ready to patch.
<sub>`floquet-steward-007` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-08efe0cff1" -->
### 2026-11-03 — cycle 3

taught item 5, proposed item 6 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-005" -->
### 2026-11-03 — cycle 2 — I built the pumped comb in Python: a dying string that pumping brings back as a buzz, only at whole-number pump rates, and only a few cents wide.
> shipped · comb proof measured, five renders, unheard · steward leans keep building the comb while you pick the saturation

The string has a loop gain of 0.98, so every ring dies on its own. Then I pumped the gain: g = 0.98·(1 + ε cos). I mapped where a ring grows from noise over pump rates from 0.4× to 3.6× the loop rate and depths up to 0.25. **The comb's tongues sit at whole numbers.** At 1×, 2× and 3×, growth starts once ε passes 0.025, which is just where the pump's peak lifts the loop above unity. Between them, nothing grows: −38.8 dB/s at best, against −39.9 unpumped. The resonator's tongues sit at 2/n and are about 10% wide. These are hair-thin: ±1.7 cents at ε 0.2 for plain Karplus-Strong. A darker loop filter lets the pump pull the pulse further, so the lock widens: ±9.5 cents at the same depth with a 16th-order smoother. **Inside a tongue the string becomes a train of pulses riding the gain peak.** That is active mode-locking, the way a laser with a modulated cavity makes short pulses, and I think it's a better cross-domain hook for this instrument than plasma decay. **At 2× and 3× the noise decides the timbre.** There are that many pulse slots per trip, and the seed noise picks which slots fill and with which sign. One 3× run filled all three equally, so only every third harmonic sounds and the pitch jumps a twelfth. Another came out mixed. One 2× run settled on equal opposite pulses, leaving odd harmonics only: the resonator's period-doubling case, now on a string. **Pumping the delay length instead adds partials but doesn't make anything grow.** At 1.5× it puts new partials halfway between the harmonics, at −39 to −46 dB where the unpumped string has nothing. The full account and rebuild command are in [the proof note](obsidian://open?vault=The%20Palace&file=Projects/Floquet%20Time-Modulated%20Loops/comb/Pumped%20Comb%20%E2%80%94%20first%20proof.md).

**Artifacts:**
- [The tongue map (orange spikes at 1×, 2×, 3×), lock width against filter darkness, and three pulse patterns the noise chose.](Projects/Floquet Time-Modulated Loops/comb/comb_tongues.png)
- [1×: the pump ramps up over 8 s, and the dead string cracks into a held buzz at about 3.2 s.](Projects/Floquet Time-Modulated Loops/comb/comb_a_ratio1_crack.wav)
- [2×: same ramp. The noise chose opposite pulses, so it's a hollow, odd-harmonics-only buzz at the same pitch.](Projects/Floquet Time-Modulated Loops/comb/comb_b_ratio2_hollow.wav)
- [Pump held at 0.2 while its rate glides 0.99 → 1.01×: sound only as it passes through the lock.](Projects/Floquet Time-Modulated Loops/comb/comb_c_glide_through_lock.wav)
- [A pluck, 2 s plain, then 2 s with its length pumped at 1.5×: new partials between the harmonics.](Projects/Floquet Time-Modulated Loops/comb/comb_d_length_pumped_pluck.wav)
- [3×, same knobs, four noise seeds: three different strings. The second is pure, a twelfth up.](Projects/Floquet Time-Modulated Loops/comb/comb_e_three_slots_four_seeds.wav)
- [What was measured, what each render is, what's left open, and the signal flow for the Max build.](Projects/Floquet Time-Modulated Loops/comb/Pumped Comb — first proof.md)
- [Tongue map: growth from noise over pump rate × depth.](Projects/Floquet Time-Modulated Loops/comb/comb_tongues.py)
- [Lock width against loop-filter order.](Projects/Floquet Time-Modulated Loops/comb/comb_filter_width.py)
- [The five audition renders and their measurements.](Projects/Floquet Time-Modulated Loops/comb/comb_render.py)
- [3× pump across four noise seeds.](Projects/Floquet Time-Modulated Loops/comb/comb_patterns.py)
- [Draws the figure from the saved measurements.](Projects/Floquet Time-Modulated Loops/comb/comb_figure.py)
- [Thresholds and lock ranges.](Projects/Floquet Time-Modulated Loops/comb/comb_tongues.json)
- [The tongue-map grid data.](Projects/Floquet Time-Modulated Loops/comb/comb_tongues.npz)
- [Lock widths per filter order.](Projects/Floquet Time-Modulated Loops/comb/comb_filter_width.json)
- [Crack times, pitches, harmonic levels.](Projects/Floquet Time-Modulated Loops/comb/comb_render.json)
- [Harmonic levels per seed at 3×.](Projects/Floquet Time-Modulated Loops/comb/comb_patterns.json)
- [The last two trips of each seed, for the figure.](Projects/Floquet Time-Modulated Loops/comb/comb_patterns_trips.npy)

_Lock half-width in cents (pump at 1× the loop rate) · loop gain 0.98 · f₀ ≈ 220 Hz_
| loop filter | ε 0.05 | ε 0.1 | ε 0.2 | ε 0.4 |
| --- | --- | --- | --- | --- |
| Karplus-Strong (order 1) | 0.9 | 0.9 | 1.7 | 3.5 |
| order 4 | 1.7 | 2.6 | 4.3 | 6.1 |
| order 16 (dark) | 2.6 | 5.2 | 9.5 | 13.0 |

_Changed in the workshop:_ Pumped Comb — first proof — New workshop note: the pumped comb's first measured proof, its renders, and what the Max build will need.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Stages 2–5 — the development arc, ### Stage 2 — Floquet Comb, a new paragraph after the first) — The Stage 2 sketch predicted tongues and comb peaks that shift, but not where the tongues are or how narrow. Now that is measured, and it changes the instrument's knob design and its cross-domain hook.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has heard the comb renders yet. I checked the seed dependence over only four seeds and runs of a few seconds, so I don't know whether a mixed pulse pattern evens out over longer runs. The narrowest lock widths sit near the edge of what the measurement can resolve. And the gain and length pumps haven't been run together yet.

_Next moves named:_ Run both pumps at once, gain and length on separate rates (the plan's three-clock comb), and map where the two kinds of tongue cross. · Measure whether a mixed pulse pattern at 2× or 3× settles into an even one over 30 s, and whether a nudge can flip it (the seed of the time-crystal stage). · When Max reopens: the signal flow and parameters are written at the end of the proof note. The pump-ratio knob needs a fine control in cents near the whole numbers.
<sub>`floquet-steward-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-0b50f19496" -->
### 2026-11-03 — cycle 2

taught item 3, proposed item 4 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-003" -->
### 2026-11-03 — cycle 1 — The pumped resonator should crack out of silence. Which way of stopping its growth sounds right to you: build, gentle or stiff?
> still working · damping 0.025 fits the lesson · steward leans GENTLE

The pumped resonator is the first instrument of this project. Its code now matches the Python reference exactly. The plan says you rule on two choices the build made alone. Damping I'd keep at 0.025. The crack then lands at q = 0.05 with room on both sides, and the first recording lets you check that. Saturation is the real choice. All three versions hold the pitch at exactly 220 Hz. The build's clip adds odd harmonics right on top of the Floquet ladder, so the lesson's sidebands get buried. The gentle version lets the ring run its pump dry the way real parametric oscillators do, and leaves the ladder clean. The stiff version is the cleanest of all but adds a little haze near 300 Hz. I'll keep going on the comb either way.

**Artifacts:**
- [build, gentle, stiff back to back, levels matched](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_saturation_three_ways.wav)
- [the damping choice: the crack moves with damping 0, 0.0125, 0.025, 0.05](Projects/Floquet Time-Modulated Loops/audio/rulings/call1_damping_four_sweeps.wav)
- [build alone](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_build.wav)
- [gentle alone](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_gentle.wav)
- [stiff alone](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_stiff.wav)
- [both choices, plotted](Projects/Floquet Time-Modulated Loops/audio/rulings/two_calls.png)
<sub>`floquet-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-002" -->
### 2026-11-03 — cycle 1 — The resonator's code matches its Python reference exactly, but four of its own test numbers are wrong. I also recorded the two build choices so you can rule by ear.
> shipped · checked in Node, not in Max · steward leans keep the damping, switch to the gentle saturation

**It matches.** Fed the same stored noise, the codebox reproduces the Python reference to within 1.2 × 10⁻¹⁵ over 4 seconds. That's rounding error. I didn't change the codebox file. The only stand-in is its random() call, which reads the reference's noise.

**The test list doesn't match the instrument** (table). The pump threshold is 2ζ, not 4ζ, which agrees with what the rich-face enrichment found today. So the 'below threshold' test at q = 0.05 actually sits exactly on the threshold: the growth rate there is −0.005 per second. The resonator's Q is 20, not 33. The tongue is about twice as wide as the README says. At q = 0.2 it runs from ratio 1.80 to 2.19, and detuning to 1.85 still rings at 60 per second.

**A new one: the default noise drowns the crack.** At noise_level 0.001, the resonance lifts its own noise to −18 dBFS before any pump, just 8.6 dB under full ringing. So the sweep test has no crack to hear. At 1e-5 the floor drops to −55 dBFS, you get 46 dB of contrast, and the crack lands at q ≈ 0.063, just after the true threshold, because noise needs a moment to grow.

**The two choices, to hear.** [call1_damping_four_sweeps.wav](open:Projects/Floquet Time-Modulated Loops/audio/rulings/call1_damping_four_sweeps.wav) plays the same 6-second pump sweep at four amounts of damping. The crack moves from the very start to 2 seconds in, exactly at q = 2ζ (left panel of the figure). [call2_saturation_three_ways.wav](open:Projects/Floquet Time-Modulated Loops/audio/rulings/call2_saturation_three_ways.wav) plays three ways to stop the growth, each first just over threshold, then pushed hard. The first, **build**, is what the codebox does now: clip the state, then tanh on the way out. The second, **gentle**, is a sketch: damping that rises with the ring's energy, the way a real parametric oscillator runs its pump dry. The third, **stiff**, is a sketch: a spring that stiffens as it swings.

What surprised me: all three stay on exactly 220 Hz. Inside the tongue the ring is locked to half the pump, so no saturation can move its pitch. What separates them is the overtones. The build's tanh puts its odd harmonics on the same frequencies as the Floquet sideband ladder (220 ± n·440), so you can't tell which harmonics come from the physics and which come from the clip. The gentle version leaves the ladder as the theory makes it: the 5th sits at −50 dB, against −28 for the build. For an instrument whose lesson is the ladder, that matters.

The full write-up, with what the codebox and README will need once the Max pause lifts: [Mathieu Resonator — offline check](obsidian://open?vault=The%20Palace&file=Projects/Floquet%20Time-Modulated%20Loops/verify/Mathieu%20Resonator%20%E2%80%94%20offline%20check.md).

**Artifacts:**
- [Left: the crack moves to q = 2ζ as damping grows. Right: three saturations at q = 0.6. Only the build's clip pushes up the high ladder rungs and the noise floor.](Projects/Floquet Time-Modulated Loops/audio/rulings/two_calls.png)
- [Choice 1: four 6 s pump sweeps at damping 0, 0.0125, 0.025 and 0.05.](Projects/Floquet Time-Modulated Loops/audio/rulings/call1_damping_four_sweeps.wav)
- [Choice 2: build, gentle, stiff. Each 3 s just over threshold, then 3 s pushed hard, levels matched.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_saturation_three_ways.wav)
- [The build's saturation alone.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_build.wav)
- [Gentle (energy-dependent damping) alone.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_gentle.wav)
- [Stiff (stiffening spring) alone.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_stiff.wav)
- [The findings, and what the codebox and README will need once Max reopens.](Projects/Floquet Time-Modulated Loops/verify/Mathieu Resonator — offline check.md)
- [Runs the codebox text as written: A/B, all seven tests, both auditions.](Projects/Floquet Time-Modulated Loops/verify/mathieu_mirror.mjs)
- [Dumps the Python reference's raw output for the sample-by-sample A/B.](Projects/Floquet Time-Modulated Loops/verify/ref_dump.py)
- [Draws the figure.](Projects/Floquet Time-Modulated Loops/verify/plot_rulings.py)
- [Every number in this post.](Projects/Floquet Time-Modulated Loops/verify/mirror_report.json)
- [Keeps the regenerable raw reference dumps out of git.](Projects/Floquet Time-Modulated Loops/verify/.gitignore)

_Measured on the codebox's own text (Node, 48 kHz, ζ = 0.025 unless noted)_
| test | README / codebox comments say | measured |
| --- | --- | --- |
| A/B against Python | under −90 dB | −292 dB (rounding) |
| no pump: pitch, Q | Q ≈ 33, 6.6 Hz wide | 220.02 Hz, Q 19.98, ≈ 11 Hz wide |
| threshold | q ≈ 4ζ = 0.10 | q = 0.0500 (2ζ); 0.0250 at ζ 0.0125; 0.1001 at ζ 0.05 |
| 'below threshold' q = 0.05 | dim, nothing builds | on the threshold (−0.005 /s); below is q ≈ 0.03 |
| crack in 0 → 0.5 sweep | near 0.10 | none audible at noise 1e-3; q ≈ 0.063 at noise 1e-5 |
| tongue edges at q = 0.2 | ≥ 5% detune exits | 1.802 to 2.189 (theory 1.806–2.194) |
| q = 0.8, state clip on / off | finite | 0 bad samples / overflows in 0.19 s |

_Changed in the workshop:_ Mathieu Resonator — offline check — New workshop note: what the offline check found, and the comment and default changes the codebox will need when Max work reopens.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Open Questions, the bullet 'Does the tanh saturation in Stage 1 distort the Strutt picture?', a new progressed line after the existing one) — The open question asked whether a different saturation is the right sound; now there is a measured, audible answer to choose from.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nothing has been opened in Max or heard by anyone, me included. The gentle and stiff saturations are sketches in the check script, not in the codebox. The 2ζ correction to the codebox comments and README waits for the Max pause to lift.

_Next moves named:_ Once you rule on the two choices, write the chosen damping and saturation into the Python reference and media, and list the exact codebox changes for when Max reopens (signal flow and parameters are already in the offline check). · Start pumping the comb (the plan's next instrument) as a Python and browser proof: a Karplus-Strong loop with its gain and length each modulated, with a spectrum view beside the audio. · Still yours whenever you have a sitting: walk the media and pick the first instrument's cross-domain hook.
<sub>`floquet-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-97031fd1dc" -->
### 2026-11-03 — cycle 1

taught item 1, proposed item 2 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-26T09-22-50-04-00" -->
### 2026-09-26 — Plan revised: the stages are builds, not sessions

Loudon, 2026-09-26: Loudon Live is no longer a scaffolded curriculum; it is his whole public self, building slowly, and any stage can be built in public. The five stages are unchanged; only the framing that made each one a session was loosened.

_The plan before this change:_

> **Where this is going.** A five-session [[Loudon Live]] arc showing that the "nothing changes over time" assumption under almost every audio loop is a choice. Let a loop's coefficient breathe periodically and you get parametric resonance, sideband ladders, frequency bandgaps, and at the far end a small audio time crystal. Behind it: the first instrument, a resonator that cracks into ringing when its tuning is pumped (the [[Mathieu Equation]] in `codebox~`), is taught in depth in the entry, and its twenty media pieces, the `codebox~` source and a Python reference were built and checked in Python on 2026-04-30 ([[BUILD_SUMMARY|the build summary]]). Nothing past that first instrument has been built.
>
> **The moves ahead**
>
> 1. **Finish the resonator and teach it.** Run the `codebox~` in Max against its Python reference (the A/B harness is in `RNBO/README — Mathieu Resonator.md`), and rule on the two calls the build made on its own: a little damping so there is a threshold to cross, and a soft clip on the state so it never overflows ([[NOTES|the build notes]]). Then walk the media and choose the cross-domain hook for the first session.
> 2. **Pump a comb.** A Karplus-Strong delay loop whose loop gain and loop length are each modulated at their own rate. Inside the right regions the comb's peaks shift and multiply, and a spectrum analyzer running beside the audio carries the lesson.
> 3. **Turn the wavetable surfaces into filters.** Each surface in the [[2D Torus Wavetable Synthesizer — catalog — wavetables|2D Wavetable Catalog]] becomes a time-varying filter, one axis read as delay and the other scanned at audio rate, so a surface's synthesis character comes back as a filter character. The filtering sibling of the [[2D Torus Wavetable Synthesizer]].
> 4. **Work backward from the sound you want.** Pick a target spectrum from [[Categorizing Inharmonicity]], solve offline in Python for the modulation that produces it, and play that modulation from a wavetable. This is the hard inverse problem; how much of it is tractable is still an open question.
> 5. **Build a small time crystal.** Slow the modulation down into rhythm and couple it to audio-rate sound, so locking and unlocking are heard at once as rhythm and as timbre. The Hopf control surface from the torus project carries over.
>
> What each later instrument is, with its cross-domain hook and build environment, is sketched in [[Floquet Time-Modulated Loops#Stages 2–5 — the development arc|the entry]].
<sub>`plan-2026-09-26T09-22-50-04-00` · plan revised · agreed 2026-09-26T09:22:50-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-43-07-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the entry's development arc

Carried over on 2026-09-25 from the entry's development-arc section and its line that the later stages are only sketched, when plans moved into scrolls (SCHEMA v1.25). The five stages keep the entry's order, each renamed by what it does. The first move is what remains of the first stage by the entry's own finish line: its media and code were built and checked in Python on 2026-04-30, but the codebox has not been run in Max and two build calls in NOTES still wait on Loudon. The stage sketches stay in the entry as the design each move links to.
<sub>`plan-2026-09-25T20-43-07-04-00` · plan agreed · agreed 2026-09-25T20:43:07-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-09-23" -->
### 2026-09-23 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (28 media files, newest first):

- [16_opo_sidebands.png](Projects/Floquet Time-Modulated Loops/static/16_opo_sidebands.png) · 2026-09-23
- [17_plasma_decay.png](Projects/Floquet Time-Modulated Loops/static/17_plasma_decay.png) · 2026-09-23
- [18_photonic_time_crystal.png](Projects/Floquet Time-Modulated Loops/static/18_photonic_time_crystal.png) · 2026-09-23
- [12_sideband_ladder.png](Projects/Floquet Time-Modulated Loops/static/12_sideband_ladder.png) · 2026-09-23
- [14_faraday_wave_pattern.png](Projects/Floquet Time-Modulated Loops/static/14_faraday_wave_pattern.png) · 2026-09-23
- [10_phase_space_strobe.png](Projects/Floquet Time-Modulated Loops/static/10_phase_space_strobe.png) · 2026-09-23
- [11_bloch_floquet_duality.png](Projects/Floquet Time-Modulated Loops/static/11_bloch_floquet_duality.png) · 2026-09-23
- [07_tongue_anatomy.png](Projects/Floquet Time-Modulated Loops/static/07_tongue_anatomy.png) · 2026-09-23
- [08_multipliers_vs_params.png](Projects/Floquet Time-Modulated Loops/static/08_multipliers_vs_params.png) · 2026-09-23
- [05_strutt_diagram.png](Projects/Floquet Time-Modulated Loops/static/05_strutt_diagram.png) · 2026-09-23
- [01_lti_ltv_boundary.png](Projects/Floquet Time-Modulated Loops/static/01_lti_ltv_boundary.png) · 2026-09-23
- [03_pumped_swing.html](Projects/Floquet Time-Modulated Loops/interactives/03_pumped_swing.html) · 2026-09-23
- [06_strutt_explorer.html](Projects/Floquet Time-Modulated Loops/interactives/06_strutt_explorer.html) · 2026-09-23
- [09_multiplier_visualizer.html](Projects/Floquet Time-Modulated Loops/interactives/09_multiplier_visualizer.html) · 2026-09-23
- [15_kapitza_pendulum.html](Projects/Floquet Time-Modulated Loops/interactives/15_kapitza_pendulum.html) · 2026-09-23
- [02_mathieu_simulator.html](Projects/Floquet Time-Modulated Loops/interactives/02_mathieu_simulator.html) · 2026-09-23
- [20_strutt_sweep.wav](Projects/Floquet Time-Modulated Loops/audio/20_strutt_sweep.wav) · 2026-09-23
- [19_reference_output.wav](Projects/Floquet Time-Modulated Loops/audio/19_reference_output.wav) · 2026-09-23
- [19_reference_noise.wav](Projects/Floquet Time-Modulated Loops/audio/19_reference_noise.wav) · 2026-09-23
- [13d_wavetable.wav](Projects/Floquet Time-Modulated Loops/audio/13d_wavetable.wav) · 2026-09-23
<sub>backfill · scroll born 2026-09-23</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
