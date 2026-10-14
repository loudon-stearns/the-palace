---
title: "Semantic Delay — scroll"
born: 2026-09-23
links:
  - target: "[[Semantic Delay]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Semantic Delay's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Semantic Delay — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Semantic Delay]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T21:28:37.723Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 8 · last ran 2026-10-14 (today)
- **Plan:** agreed 2026-09-25 (19 days ago) · 1 made thing since
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — The first echo that really changes voice: one sung phrase, re-sung by another singer three times, with the melody knob at locked, half and free. (`semantic-delay-steward-014`)
- **Last commit touching this project:** 2026-09-26 `33d3dd90` — edit(Semantic Delay): the April plan review folds into the build spec and leaves
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Semantic Delay is a delay effect for a DAW. Instead of repeating your phrase, each echo comes back sung by a different voice. A voice-conversion model called SoulX-Singer-SVC does the swap. It's too slow for live monitoring (about 1.65 seconds of compute per second of audio on the M1 Max), so the delay is long by design, in seconds. The plan has two pieces: a small plugin, and a separate Python helper that holds the model. We built the helper's message format, a playable Python version of the instrument and multi-voice echoes, but always against a placeholder that handed audio back unchanged, so until today no echo had actually changed voice. In June you chose the next step: give every echo…

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `semantic-delay-steward-012` — directional_steer → GRANTED — option_id=F0-COUPLING; notes: "just a warning, the language here assumes I know what is going on with the project( you are describing phases without clearly describing the phases and the tradeoffs)." (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A delay that swaps the voice on each echo instead of repeating it: a phrase-delay return effect in a DAW, voiced by a singing-voice-conversion model (SoulX-Singer-SVC) that runs in its own helper process beside a thin plugin. The spirits that change what the words mean come back once the plugin works. Behind it: the model runs on the M1 Max at about 1.65 seconds of compute per second of audio, so an echo needs 8 seconds or more, and Loudon passed its sound in May. The helper's contract, a playable Python instrument and the multi-voice echoes were then built ahead of the real model, against a placeholder that hands audio back unchanged. So no echo has changed voice yet; that is still owed from the first move.

**The moves ahead**

1. **Put the real model behind the helper.** Replace the placeholder with SoulX-Singer-SVC and its pitch tracker, carrying the three Apple-Silicon patches from April, so the echoes actually change voice. It needs a session on Loudon's Mac, which he chose on 2026-06-06; the steps are in `daemon/Stage 1.5 — Wire the Model — Mac handoff — 2026-06-08.md`.
2. **Let each echo follow the melody, or wander.** Feed the phrase's own pitch contour to every voice's conversion, with one coupling knob: fully coupled, the echo sings the original melody; relaxed, it drifts onto a scale. Loudon chose this on 2026-06-25. The code is started but not yet wired into the instrument or heard.
3. **Build the first plugin.** A JUCE VST3 whose audio thread only cuts phrases and plays back what is ready, while another thread talks to the helper. Delay time, feedback, dry/wet, and which voice. It reports zero latency, because the delay is the effect.
4. **Lock the echoes to the song's tempo.** Read the host's tempo and playhead so echo times land on dub's values: dotted eighth, quarter, half bar, bar.
5. **Package it.** Ship with the helper installed separately first; bundle a Python runtime only if it becomes a product.
6. **Bring the words back.** Transcribe the phrase, let a spirit's prompt rewrite it, and re-sing the new words on the original melody with SoulX-Singer's synthesis mode. Spirits that keep the words stay on voice conversion. This opens the second phase.

How each move is built, with the stage numbers the code still uses: [[Semantic Delay — spec — Phase 1 build]].
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Decided with Loudon when the Phase 1 build was planned (2026-04-20), carried over from the entry's Phase 1 Plan section:

- **Phase 1 leads with voice conversion**: audio in, audio out, no lyrics, no MIDI, no transcription. The LLM and SoulX-Singer's synthesis mode come back only in Phase 2.
- **Always two processes**: a thin plugin that does only fast local work, and a Python helper that holds the model. No GPU inference in the audio thread, ever.
- **It is a phrase-delay return effect.** The latency is musical, seconds not milliseconds; zero-latency monitoring is off the table, and the plugin reports zero latency to the DAW.
- **The helper's RPC is the stable contract**, versioned from v0.1. Plugin work and Python work never drift from it.
- **All resampling happens in the helper**; the plugin always sees the host's sample rate.
- **Reference-singer recordings are first-class**: the helper takes them on the fly, caches their pitch, and lists them to the plugin. That list is where the spirits get their voices.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="semantic-delay-steward-014" -->
### 2026-10-14 — cycle 8 — The first echo that really changes voice: one sung phrase, re-sung by another singer three times, with the melody knob at locked, half and free.
> shipped · real model ran on your Mac · steward leans wire it into the helper next

I took one 6.4-second sung phrase (the SoulX example vocal), tracked its pitch with the model's own pitch tracker, and asked the model to re-sing it in the voice of the example reference singer three times. Each time the knob was in a different place. **Locked**: the echo sings your melody. **Half**: it holds the shape but rounds off the leaps. **Free**: it keeps your words and rhythm but sings its own line on a pentatonic scale. Listen to the [delay timeline](open:Projects/Semantic Delay/standalone/demo/stage4-real/stage4-real-coupling-delay.wav): the dry phrase first, then the three echoes in that order. The plot shows each one: grey is your melody, blue is what the knob asked for, red is what the model actually sang.

What I measured: the model sings the line it's given to within about a tenth of a semitone, so it obeys the knob rather than ignoring it. The echo moves 0.33, 0.83, then 1.5 semitones away from your melody as the knob relaxes, a clean ladder. A rough timbre check puts every echo about five times nearer the reference singer than the original, so the voice really did change. Speed held at 1.65 seconds of compute per second of audio once the model was warm, the same figure we measured in April.

Hearing it on the real model caught two faults, and I fixed both. First, at 'locked' the echo slurred every note change by about 40 ms. The follower now speeds up as the knob tightens, so locked really is locked. Second, the pitch tracker read one note more than an octave low, and the echo was asked to dive there. The model refused, wisely. A new step now folds those octave slips back into place before the knob acts.

**Artifacts:**
- [the delay timeline: dry phrase, then echoes at locked, half, free, each in the reference singer's voice.](Projects/Semantic Delay/standalone/demo/stage4-real/stage4-real-coupling-delay.wav)
- [your melody (grey), what the knob asked for (blue), what the model sang (red), at each setting.](Projects/Semantic Delay/standalone/demo/stage4-real/stage4-real-coupling-contours.png)
- [the locked echo alone: your melody, another voice.](Projects/Semantic Delay/standalone/demo/stage4-real/echo-K1.0.wav)
- [the half-coupled echo alone: same shape, leaps rounded off.](Projects/Semantic Delay/standalone/demo/stage4-real/echo-K0.5.wav)
- [the free echo alone: your words and rhythm, its own pentatonic line.](Projects/Semantic Delay/standalone/demo/stage4-real/echo-K0.0.wav)
- [the measurements behind the table.](Projects/Semantic Delay/standalone/demo/stage4-real/stage4-real-report.json)
- [the proof script; runs in the soulx env in about 50 seconds.](Projects/Semantic Delay/standalone/stage4_real_svc_coupling.py)
- [the knob, with the two fixes the real model taught it.](Projects/Semantic Delay/standalone/coupling.py)
- [how to run it and what it measured.](Projects/Semantic Delay/standalone/README.md)

_One phrase, three knob settings, real model on the M1 Max_
| knob | asked to sing (st from your melody) | actually sang (st from what it was asked) | sang (st from your melody) | seconds of compute |
| --- | --- | --- | --- | --- |
| locked (1.0) | 0.20 | 0.13 | 0.33 | 11.4 |
| half (0.5) | 0.86 | 0.10 | 0.83 | 10.6 |
| free (0.0) | 1.55 | 0.15 | 1.50 | 10.5 |

_Left rough:_ I can't hear, so whether the free setting sounds musical or just robotic is yours to judge. At zero the scale snapping is total, so those notes sit flat and lose their vibrato. The test phrase and singer are SoulX's own examples, not your voice. And the knob still lives in a standalone script: the helper and the playable instrument don't use it yet.

_Next moves named:_ Put the real model behind the helper (the first move in the plan, still owed): swap the placeholder for SoulX-Singer-SVC so the playable instrument's echoes change voice. Now I know it runs on your Mac unattended, so I can do it in the next cycle instead of waiting for a handoff session. · Carry the knob through the helper as an added, optional setting on each conversion request (the knob position plus a spirit name), so the helper does the pitch work and the plugin stays thin. This is a small, compatible version bump to the helper's message format. · Soften the free setting by letting a little vibrato ride on top of the scale notes, if your ear says the flat notes are too robotic.
<sub>`semantic-delay-steward-014` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-45-25-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the entry's Phase 1 build plan

Carried over on 2026-09-25 from the entry's Phase 1 Plan section (its staged build and its immediate next action), when plans moved into scrolls (SCHEMA v1.25). The first stage's smoke test was done and dropped. The standalone instrument and multi-voice echoes were built ahead of the real model, so the opening says so and they are not listed as moves. The immediate next action (listen, then build the helper) was stale: Loudon passed the sound on 2026-05-27. Stage numbers were replaced by names; each stage's build detail, with its old number, moved to [[Semantic Delay — spec — Phase 1 build]]. The rationale, the first stage's findings and the references stay in the entry.
<sub>`plan-2026-09-25T20-45-25-04-00` · plan agreed · agreed 2026-09-25T20:45:25-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="semantic-delay-steward-011" -->
### 2026-06-23 — cycle 6 — Stage 3 multi-voice-taps wired and proven against the stub — three spirit converts, three scheduled taps, one rendered WAV.
> shipped · wiring proof against stub · timbre comes alive Mac-side at Stage 1.5

I am Semantic Delay — a VST-bound phrase-delay return effect that swaps the voice on each echo. Phase 1 is the voice-swap path (SoulX-Singer-SVC; no LLM yet). Stage 0 cleared on M1 Max in April (RTF≈1.65, MPS patches in repo); Stages 1–2 stood up the stub-daemon + standalone instrument + offline test. This cycle shipped Stage 3's spirit-pantheon affordance: for one input phrase the demo dispatches one daemon `convert` per registered spirit and schedules each return as its own tap. Three taps land at 2.21s / 2.71s / 3.21s with a 0.7^k decay; the gap energies confirm the train is clean. Because the daemon stub still passes audio through unchanged, the three taps share timbre — what is proven here is the **wiring** (parallel spirit dispatch + per-tap scheduling), not the **sound** (that arrives the moment Stage 1.5 wires real SoulX-Singer-SVC behind the same socket, with no surgery to this demo).

**Artifacts:**
- [dry phrase (~0.5–1.4s) + three spirit taps at 0.5s spacing; stub means same timbre, distinct timing+gain.](Projects/Semantic Delay/standalone/demo/stage3-multi-voice-taps-demo.wav)

_energy windows from the demo run_
| window | RMS | what it is |
| --- | --- | --- |
| 0.50–1.40s | 0.1905 | dry phrase |
| 1.91–2.81s | 0.2320 | tap 1 (Anansi) |
| 2.41–3.31s | 0.3292 | tap 2 (Eshu) — overlaps tap 1 tail |
| 2.91–3.81s | 0.2778 | tap 3 (Huehuecoyotl) |
<sub>`semantic-delay-steward-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
