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

> _Regenerated 2026-10-14T21:34:37.586Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 9 · last ran 2026-10-14 (today)
- **Plan:** agreed 2026-09-25 (19 days ago) · 3 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — Four versions of one echo, slowest to fastest — which is fast enough and still sounds good? (`semantic-delay-steward-017`)
- **Last commit touching this project:** 2026-10-14 `fd898922` — steward(Semantic Delay): cycle 8 — SPINNING UP. HOME: [Semantic Delay](obsidian://open?vault=The%20Palace&…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Semantic Delay is a delay effect where each echo comes back sung by a different voice instead of repeating you. It has two parts: a small plugin, and a separate Python helper that holds the voice-conversion model (SoulX-Singer-SVC), because the model is far too heavy to run inside a DAW's audio thread. Until now the helper held a placeholder that handed audio back unchanged. Last cycle the real model sang in a standalone script. This cycle I finished the first move of the plan, putting the real model behind the helper. Now the playable Python instrument sends each phrase over its socket and gets back the same phrase in the reference singer's voice. The plugin will use that exact path later.…

### Open asks

- `semantic-delay-steward-017` — speed vs quality of each echo · posted 2026-10-14 · options: FULL-32 · FULL-16 · 5S-16 · 3S-16

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
<!-- scroll:entry id="semantic-delay-steward-017" -->
### 2026-10-14 — cycle 9 — Four versions of one echo, slowest to fastest — which is fast enough and still sounds good?
> still working · real model in the helper · steward leans 5S-16

Catch-up: Semantic Delay is the delay whose echoes come back sung by another voice. Today the real model went into the helper program, and the playable instrument's echoes really change voice. The catch: at today's settings each echo costs about 2.2 seconds of compute per second sung. Live, an 8-second phrase would need about an 18-second delay. Two cheap fixes help: a shorter reference-singer clip, and fewer refinement passes in the model (16 instead of 32). Here is one 4.5-second phrase at four settings, measured on the M1 Max. Full settings are 2.2 (an 8 s phrase needs a 17.5 s delay). A 16-pass version with the full clip is 1.2 (9.5 s). A 5-second clip with 16 passes is 1.0 (8.1 s). A 3-second clip with 16 passes is 0.9 (7.1 s). I lean toward the 5-second clip with 16 passes, because it brings back the 8-second delay we planned around. I can't hear whether halving the passes blurs the voice, so your ear decides. I keep building either way.

**Artifacts:**
- [FULL-32: today's settings.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/bench-prompt10.7s-steps32.wav)
- [FULL-16.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/bench-prompt10.7s-steps16.wav)
- [5S-16, my lean.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/bench-prompt5s-steps16.wav)
- [3S-16, fastest.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/bench-prompt3s-steps16.wav)
- [5 s clip at 32 passes (1.7 s per second), for comparison.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/bench-prompt5s-steps32.wav)
- [3 s clip at 32 passes (1.5 s per second), for comparison.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/bench-prompt3s-steps32.wav)
- [the speed numbers behind these four.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/stage15-latency-bench.json)
- [the bench script, using the helper's own model code.](Projects/Semantic Delay/standalone/stage15_latency_bench.py)
- [stage4-real-coupling-contours.png](Projects/Semantic Delay/standalone/demo/stage4-real/stage4-real-coupling-contours.png)
- [stage4-real-coupling-delay.wav](Projects/Semantic Delay/standalone/demo/stage4-real/stage4-real-coupling-delay.wav)
- [echo-K0.0.wav](Projects/Semantic Delay/standalone/demo/stage4-real/echo-K0.0.wav)
- [echo-K0.5.wav](Projects/Semantic Delay/standalone/demo/stage4-real/echo-K0.5.wav)
- [echo-K1.0.wav](Projects/Semantic Delay/standalone/demo/stage4-real/echo-K1.0.wav)
<sub>`semantic-delay-steward-017` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="semantic-delay-steward-016" -->
### 2026-10-14 — cycle 9 — The helper now holds the real model, and the playable instrument's echoes come back in another singer's voice over the socket.
> shipped · first move of the plan done · live delay needs to be longer than planned · steward leans faster settings, your ear decides

What I built: a new `soulx_backend.py` holds the model and its pitch tracker. You start the helper with `--backend soulx`. The old placeholder is still the default, so the existing tests run anywhere. The helper now does the whole job the placeholder only pretended to do. It resamples whatever rate the host sends, tracks the phrase's pitch, re-sings it in the chosen singer's voice, and returns it at the host's rate. Registering a singer now saves a real 24 kHz recording with its pitch beside it, and that singer is still listed after a restart. All three Apple-Silicon fixes from April are carried over: one in the helper, one checked in SoulX's code when the helper starts, and one an environment setting. The proof runs the real instrument offline at 44.1 kHz: two sung phrases, an 8-second delay, and one singer registered over the socket. The [delay timeline](open:Projects/Semantic Delay/standalone/demo/stage15-real-daemon/stage15-real-daemon-delay.wav) plays you twice, then two echoes in the other singer's voice, as the [timeline picture](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/stage15-real-daemon-timeline.png) shows. On a rough timbre measure, each echo sits about three times nearer the reference singer than the source does. One thing matters for live play. Over the socket a conversion costs about 2 to 2.3 seconds of compute per second of sung audio, not April's 1.65. The model re-reads the whole 10.7-second reference clip on every echo. So at these settings an 8-second phrase needs about an 18-second delay to land on time. I measured the cheap fixes too; they're in the card on the Trickster board.

**Artifacts:**
- [the instrument through the real helper: two dry phrases, then each one 8 s later in the reference singer's voice.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/stage15-real-daemon-delay.wav)
- [where each dry phrase and each echo sits, with the speed each echo cost.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/stage15-real-daemon-timeline.png)
- [echo 1 alone, as the helper returned it.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/echo-1.wav)
- [echo 2 alone.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/echo-2.wav)
- [the 44.1 kHz input: two phrases of the SoulX example vocal with a gap.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/input-two-phrases-44k.wav)
- [the measurements: load time, device, registration, restart check, speed and timbre per echo.](Projects/Semantic Delay/standalone/demo/stage15-real-daemon/stage15-real-daemon-report.json)
- [the real model behind the helper, with the April Apple-Silicon fixes.](Projects/Semantic Delay/daemon/soulx_backend.py)
- [the helper: --backend soulx, real singer registration and restart, real device reported.](Projects/Semantic Delay/daemon/semantic_delay_daemon.py)
- [how to start the real helper and what changed.](Projects/Semantic Delay/daemon/README.md)
- [the June handoff, marked done.](Projects/Semantic Delay/daemon/Stage 1.5 — Wire the Model — Mac handoff — 2026-06-08.md)
- [the instrument now waits as long as the real model needs, instead of a fixed 5 s.](Projects/Semantic Delay/standalone/instrument.py)
- [the proof script; about 90 s in the soulx env.](Projects/Semantic Delay/standalone/stage15_real_daemon.py)

_Two phrases through the real helper · M1 Max · 8 s delay_
| echo | phrase length | compute per second of audio | pitch shift the model chose | timbre gap to source | timbre gap to singer |
| --- | --- | --- | --- | --- | --- |
| 1 | 6.7 s | 1.99 | +2 st | 97.6 | 34.3 |
| 2 | 4.8 s | 2.27 | 0 st | 91.3 | 41.0 |

_Left rough:_ I can't hear, so nobody has listened to these echoes yet. The echoes come back quieter than the dry voice. The test is offline: live, an echo that finishes late would be clipped at the front, and the instrument doesn't guard against that yet. The singer and the phrases are still SoulX's examples, not your voice, and the melody knob from last cycle isn't in the helper yet.

_Next moves named:_ Pick the speed and quality setting by ear (the card on the Trickster board), then make it the helper's default so an 8-second delay holds for full phrases. · Carry last cycle's melody knob through the helper as an optional setting on each conversion, so the instrument can follow the melody or let it wander. That is the second move in the plan, and it needs a small, compatible update to the helper's message format. · Make the instrument handle a late echo cleanly (skip to the next repeat instead of clipping its start) before anything plays live.
<sub>`semantic-delay-steward-016` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

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
