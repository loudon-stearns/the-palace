---
title: "Retrospective Delay — Stage 1: The Witness"
project: "[[Retrospective Delay]]"
stage_index: 1
stage_label: "The Witness"
loudon-live-status: drafting
stage: seed
tier_vocabulary: { sketch: Sketch, study: Study, piece: Piece }
last-updated: 2026-10-15
links:
  - target: "[[Retrospective Delay]]"
    type: spawned
    label: stage-1-draft
  - target: "[[Retrospective Delay — spec — Loudon Live sessions]]"
    type: deepens
    label: fills-in-stage-1
  - target: "[[Progressive Staging]]"
    type: couples-with
    label: pedagogical-method
  - target: "[[Compressor Design]]"
    type: connects-to
    label: cross-domain-buffer
  - target: "[[Frequency-Time Duality]]"
    type: deepens
    label: time-as-spatial
  - target: "[[The Shop]]"
    type: connects-to
    label: mockup-imagery-spec
forward_vector: "I want to be the smallest complete Retrospective Delay — a working M4L Audio Effect that teaches the always-recording circular buffer as a witness and ends with one knob. No character animation, no Dub Lineage framing yet. The student leaves with something they can play, a mental model of buffer-as-witness that the later stages will extend, never replace — and the honest discovery that, so far, it is exactly an echo."
---

# Stage 1 — The Witness

*BUFFER-MECHANISM-FIRST. Vanilla Max/MSP wrapped as a Max for Live Audio Effect. ~75 minutes. Making / Framing ratio 70/30.*

> **Revised 2026-10-15.** The witness was built and modelled sample by sample ([witness_model.py](witness/witness_model.py)). As specified, its output is *identical* to a half-note echo with no feedback — zero difference at every sample. Loudon chose to keep it that way (KEEP-SPEC): the witness stays the pure always-recording buffer, the Reveal now says honestly that Echo can match it, and "silence keeps the past" moves to [the séance](../stage-2-seance/stage-2-the-seance.md). The anchor patch is [witness-A-as-specified.maxpat](witness/witness-A-as-specified.maxpat). The Make spec below carries the corrections the build found.

This is the **smallest possible Retrospective Delay**: a one-measure circular buffer that is **always recording**, with one gain knob that decides whether the past half a measure ago re-enters the present. No character animation (Stage 4 builds that). No Dub Lineage framing (Stage 2 onward opens that). No Gen~ migration yet (Stage 3 reveals it). The student leaves Stage 1 with a finished M4L Audio Effect and one clean mental model: **the buffer is the constant witness; the knob is your choice about whether to listen to it.**

## What This Stage Is and Isn't

**Is:** A complete, playable, useful M4L Audio Effect. A finished thing. A teaching moment about the circular buffer as a primitive. A device that does something the student has never had before — phrase-level temporal recall at a beat-aligned interval — and does it with one parameter.

**Isn't:** The full Retrospective Delay. There is no character animation. There is no séance framing (the gain knob exists, but it is the *gain knob*, not "the conduit to the ectoplasm"). There is no Gen~ port. There is no VST export. There is no crossfade anywhere, and none is needed: the read head never jumps, so the measure line is seamless. (The seam the April plan expected turns out to live somewhere else, and only appears once silence keeps the past. That's the séance.) The instrument is monaural in Stage 1; stereo widens later.

These omissions are intentional. Stage 1 isolates the **buffer-mechanism teaching moment** so the student feels what a circular buffer with a delayed read tap actually *is*, without that feeling being mixed with character-design feelings or cultural-framing feelings. Stage 2 layers performance gestures and the séance metaphor on top. Stage 3 reveals what was always happening at sample rate. Stage 4 gives the device a face. Stage 5 sets it free.

## Forward Vector For This Stage

I want a student who has built basic Max patches (`phasor~`, `buffer~`, a couple of objects between them) to leave a single 75-minute session with:

1. A working M4L Audio Effect on disk, loaded in Ableton, doing the right thing.
2. The mental model that a circular buffer is a witness — always recording, not gated by anything the student does.
3. The mental model that the read head is a fixed lag behind the write head — *the past played back in present time*.
4. The instinct that the gain knob is **not an effect strength control**; it is a *decision about whether the past is audible*.
5. The honest surprise: **so far this is exactly an echo.** The buffer's length never changes the sound, because the read head reaches a slot long before the write head comes back to overwrite it.
6. One concrete question they take into the séance: *what would it take for this to do something Echo can't?*

If they leave with even one of those mental models clean, Stage 1 worked.

## Session Arc — 75 minutes

| Block | Duration | Activity |
|-------|---------:|----------|
| Frame | 15 min | Setup the question; introduce the buffer-as-witness mental model |
| Make | 45 min | Build the patch in vanilla Max; wrap as M4L Audio Effect; save |
| Reveal | 10 min | Play into the device; hear the ghost; observe the always-recording behavior |
| Reflect | 5 min | One question; one hand-off thought toward Stage 2 |

### Frame (15 min)

Open with one question to the student: *what if your instrument was always listening, without being asked, and you could choose when to summon what it heard?* Let that sit briefly.

Introduce the **circular buffer** with no audio context first. Draw it on a whiteboard or screen as a closed loop of N cells. Say: at every audio sample, one cell is overwritten. The write head sweeps around the loop at a constant rate. After N samples, the head returns to where it started and begins overwriting the oldest material. **The buffer is always full, and always being rewritten.** The buffer is not a recording you start. It is a witness that does not stop.

Now add the audio interpretation. If the loop holds one measure of audio at the current tempo, then the buffer at any instant contains *exactly the last measure of everything that was played into it*. The "past" is not in storage. The past is in the witness, and it is being erased in real time as the present is played.

Introduce the **read head** — a second tap into the same buffer, sitting at a fixed offset behind the write head. If the write head is at position $w$ and the read head is at position $w - L$ (modulo buffer length), then the read head is playing back what was written $L$ samples ago. If $L$ equals a half-note in samples, the read head is the **past, half a note ago, played back at present time**.

Close the frame with the **always-recording rule** stated cleanly: *there is no arming, no record button, no gate. The buffer is the constant witness. The performer's only choice is whether to listen to what the witness heard.*

### Make (45 min)

The vanilla Max patch in plain prose, before any code. The audio enters through `plugin~`. One clock, `phasor~ 1n @lock 1`, ramps 0→1 once per measure, locked to Live's transport. Multiplied by the measure length in samples, it is the write position for a `poke~` into a `buffer~`. The **same** clock, minus 0.5 and wrapped (`-~ 0.5` → `wrap~`), is the read position for a `wave~` whose end point is the measure length, so it reads only the measure, not the whole buffer. The read head's output goes through a ramped **gain** from a single `live.dial` and is summed back with the dry input into `plugout~`. The built patch is [witness-A-as-specified.maxpat](witness/witness-A-as-specified.maxpat). Paste it into a Max Audio Effect.

#### Object-by-Object Patch Spec

```
[loadbang] → [1n( → [translate notevalues ms @listen 1] → [mstosamps]   measure length, follows tempo
                                         |                     |
[plugin~]                                |                     |
   |       [phasor~ 1n @lock 1] ─────────┼──── [*~ ] ←─────────┘   write position (samples)
   |            |                        |        |
   +──────────────────────────────────────────> [poke~ ret-witness 1]
   |            |                        |
   |       [-~ 0.5] → [wrap~] → [wave~ ret-witness] ← end point = measure ms
   |                                  |
   |     [live.dial gain] → [pack f 20] → [line~] → [*~] ← ghost
   |                                                   |
   +──────────────────────────────────────────────── [+~] → [plugout~] (both sides)

[buffer~ ret-witness 4000 1]   4 s: room for one 4/4 measure down to 60 BPM
```

- `plugin~` / `plugout~` — Live's audio in and out. Mono: the sum goes to both outputs.
- `buffer~ ret-witness 4000 1` — one channel, 4 seconds, sized once. The measure length decides how much of it is used.
- `phasor~ 1n @lock 1` — the measure clock, locked to Live's transport. No hand-computed rate.
- `translate notevalues ms @listen 1` → `mstosamps` — the measure length, updated when the tempo changes.
- `*~` — clock × measure length = write position in samples.
- `poke~ ret-witness 1` — writes the input at that position, every sample, always.
- `-~ 0.5` → `wrap~` — the read phase, half a measure behind, wrapped back into 0..1. **Signal objects, not `!- 0.5`:** `!-` is a control object, and 0.5 minus the phase would run the read head backwards into a reverse delay.
- `wave~ ret-witness` — reads the buffer from 0 to the measure length (its third inlet is the end point in ms), interpolating.
- `live.dial gain` → `pack f 20` → `line~` → `*~` — the one knob, ramped over 20 ms so a fast turn doesn't zipper. Range 0..1, starts at 0.
- `+~` — dry plus ghost.

#### Key Calculations

- **Buffer length in samples (one measure 4/4):**
  $N = f_s \cdot \dfrac{60}{\text{BPM}} \cdot 4 \quad \text{(samples)} = \text{sample-rate} \cdot \dfrac{60}{\text{tempo in BPM}} \cdot 4$

  At 48 kHz and 120 BPM, $N = 48000 \cdot 0.5 \cdot 4 = 96{,}000$ samples = 2.0 seconds.

- **Read-head lag in samples (half note default):**
  $L = \dfrac{N}{2} \quad \text{(samples)} = \dfrac{\text{buffer-length-samples}}{2}$

  At 48 kHz and 120 BPM, $L = 48{,}000$ samples = 1.0 second.

- **Measure rate (write phasor frequency):**
  $f_{\text{measure}} = \dfrac{\text{BPM}}{60 \cdot 4} \quad \text{(Hz)} = \dfrac{\text{tempo in BPM}}{60 \cdot \text{beats per measure}}$

  At 120 BPM in 4/4, $f_{\text{measure}} = 120 / 240 = 0.5$ Hz.

- **Read-head phasor offset (normalized 0..1):**
  $\phi_{\text{read}} = \phi_{\text{write}} - \dfrac{L}{N} \quad \pmod{1}$
  $\quad = \text{write-phase} - \text{lag-as-fraction-of-buffer} \quad (\text{modulo 1})$

Show both forms when the equations land — symbols and named-variable English side by side (palace rule: equations always show their worded form too).

Note the clock is shared: write and read come from one `phasor~`, so they can never drift apart. The April draft had two phasors offset by hand, which is two clocks that only agree if nothing glitches.

#### Stage 1 Defaults — What Is Fixed

| Parameter | Stage 1 default | Why fixed in Stage 1 | Where it becomes variable |
|-----------|-----------------|----------------------|---------------------------|
| Buffer length | One measure (4/4) | A measure is the smallest unit that gives a phrase recall; multi-measure choices muddy the witness mental model | Stage 2 — parameterize as quarter/half/whole-note multiples |
| Read-head lag | Half-note behind write head | Half-note is the most musically obvious lag; the student hears displacement clearly | Stage 2 — quarter / half / whole-note radio toggle |
| Channel count | Monaural (input duplicated at output) | Stereo widens the mechanism for no Stage-1 learning gain | Stage 2 or Stage 4 — depending on character-pose stereo cues |
| Crossfade | None, and nothing clicks | The read head never jumps, so the measure line is seamless. Have the student listen for a click at the barline and find none. | The séance: once silence keeps the past, a 5 ms crossfade on the listen/hold switch |
| Channel count exposed to UI | Just `gain` | One parameter is the whole instrument | Stage 2 adds lag selection; Stage 4 adds the character |

#### Save and Verify

Save the patch as `Retrospective Delay — Stage 1.amxd` in the student's M4L user library. In a fresh Ableton project, load the device on a track with a metronome and a dry MIDI instrument. Verify with three quick checks:

1. **Gain at 0 — no ghost.** Play a chord. Wait. Silence afterward. The witness is hearing, but the conduit is closed.
2. **Gain at 0.5, play one measure, then silence.** The measure plays back at half volume, exactly half a measure later than it was played, then stops.
3. **Gain at 1, sustain a chord for two measures, then stop.** The chord carries on for half a measure after you stop, then the ghost goes silent too. It plays once. It never re-echoes: nothing feeds the ghost back into the buffer. (The April draft promised re-echoes here; the model shows there are none.)

### Reveal (10 min)

Hand the student the device. Let them play. Let them feel the ghost come back as one block, half a measure late, all of it at once.

Then wait for someone to say *"this is just a delay."* If nobody does, say it yourself. Ask them to prove it: put Ableton's Echo on a second track, one tap at a half note (or 1/2 of the measure, in Echo's sync terms), feedback at zero, dry/wet to match. Route the same clip through both, flip the polarity of one, and sum. **Silence.** The two cancel exactly.

*(The model proves the null. In Live it should hold once Echo's filter, modulation, noise and wobble are all off, and both tracks are delay-compensated. Not yet tried in Live. Run it before the session so the reveal doesn't misfire.)*

| test (48 kHz, 120 BPM, read head half a measure behind) | result |
|---|---|
| witness output minus a half-note echo, every sample | 0, exactly |
| what the buffer's length changes about the sound | nothing |

This is the honest reveal, and it's a better one than the April draft's *"they will find they cannot."* They can. Why it's an echo is the lesson: the read head reaches each slot half a measure after it was written, and the write head doesn't come back to overwrite it for a whole measure. The buffer never runs out, so its length never shows. **A circular buffer with a fixed lag behind the write head *is* a delay line.** Every delay they've ever used is a witness like this one.

Then turn the letdown into the question. The witness is always listening, but half a measure after you stop, it has nothing more to say. Ask: *what would make this something Echo can't do?* Let them guess. Someone will get close to the answer the séance builds: **make silence keep the past.**

### Reflect (5 min)

One question, asked once: *"What did you expect this to do that it didn't — and what would you change so it does?"*

Then one forward-pointing thought: *"Next session this same buffer becomes an instrument. It will keep your last measure when you stop playing, which no echo can do, and one knob will decide whether you hear it. The witness stays underneath. We only change what it chooses to write down."*

## Cross-Domain Moment

The circular buffer is the same mechanism that runs inside the CPU's ring buffer, an audio driver's I/O buffer, and the compressor's envelope detector. The same primitive. **What changes across those contexts is not the mechanism — it is how much time it holds.**

| Context | Buffer length | What it does |
|---------|--------------:|--------------|
| Audio driver I/O ring | 256 samples (~5 ms) | Holds samples between hardware interrupt and software callback. Invisible. |
| Compressor envelope | ~500 samples (~11 ms) | Holds the recent past for RMS estimation. Heard as the compressor's *character*. |
| Stage 1 buffer | 96,000 samples (~2 s) | Holds the recent past for phrase recall. Heard as the *instrument itself*. |

This is the cross-domain moment for Stage 1: *the same mechanism becomes a different instrument at every time scale*. The teaching is light here — Stage 3 returns to it with full force when the student migrates to Gen~ and sees the compressor's buffer side by side with this one.

## Reflecting Surface

> *If it's always recording, why does it forget? What would it mean for a device to remember only when you stop?*

The second half of the question is the hand-off. The séance builds on the answer.

## Hilaritas Checklist

- [x] **Real thing to make** — a working M4L Audio Effect, loadable in Ableton, doing something the student hasn't had before.
- [x] **Tool that extends** — the circular buffer itself, understood well enough to prove it equals an echo; the primitive under every delay.
- [x] **Cross-domain moment** — the buffer-as-universal-primitive table; same mechanism, three time scales.
- [x] **Reflecting surface** — the null test is a mirror: the thing you built turns out to be the thing you already had, and the question of what would make it new hangs over the hand-off.

## Prerequisites

The student must be fluent in `phasor~`, `buffer~`, `poke~`, `wave~` (or `peek~`), and `plugin~`/`plugout~`. If the M4L Audio Effect device format is unfamiliar, give them this prerequisite prompt and have them spend ~15 minutes with another Claude before the session:

> *"Explain how Max for Live Audio Effects receive and output audio using plugin~ and plugout~. I'm comfortable with Max/MSP patching but new to the M4L device format. Walk me through the smallest possible M4L audio effect patch end-to-end."*

The session does not include this orientation in its 75 minutes.

## Materials

- This document — the Stage 1 framing, session arc, and reveal.
- `Projects/Retrospective Delay/stage-1/patch-spec.md` — the implementation spec (object list, connections, key calculations, defaults, the three verification checks). The Make block is built directly from it.
- `Projects/Retrospective Delay/stage-1/mockup-imagery-brief.md` — the Shop brief for the lesson's mockup interfaces and imagery (Maker's job: route through Specialists; this cycle SPECS the brief, does not dispatch).
- Anchor patch: [witness-A-as-specified.maxpat](witness/witness-A-as-specified.maxpat), written by the steward and **not yet opened in Max**. Save it as `Retrospective Delay — Stage 1.amxd` once it plays.
- The proof: [witness_model.py](witness/witness_model.py) renders [the input](witness/witness-input.wav) and [the witness](witness/witness-A-as-specified.wav) and runs the echo null test.

## Open Questions Surfaced By This Draft

1. **Where does the "always recording" idea live in the M4L UI surface?** The patch is always recording the moment it's loaded on the track. Should the device show this somehow — a faint indicator, a continuously-updating waveform of the last measure, anything? Or does showing it weaken the *witness* metaphor (the witness should not be visible; that's why it's a witness)? I lean toward *no indicator in Stage 1* — let the student feel the always-on nature through use, not through a UI affordance. But this is the kind of choice Stage 4 (the character) will revisit.
2. *(Settled by the build: `wave~`, with its end point set to the measure length.)* **Does the Stage 1 patch use `wave~` or `peek~`?** `wave~` interpolates; `peek~` does not. At one-measure buffer lengths, the difference is inaudible to most ears — but `peek~` is more transparent pedagogically (one sample, one lookup). I lean `wave~` with linear interpolation set explicitly, so the student sees the interpolation flag and understands what it does. This is small but worth surfacing.
3. **Should the prerequisite Max objects be reviewed in-session?** I scoped the prerequisites as homework. But 15 minutes of in-session `phasor~`/`buffer~` review would push the Make block from 45 min to 30 min, which is a tight build for new students. Loudon's call.
4. **Does Stage 1 land if the student has never written a beat-synchronous patch?** The measure-rate calculation assumes the student is comfortable with sample-rate-to-tempo conversion. If not, the Frame block needs to expand by ~5 min, which compresses the Make.

## Connection to Progressive Staging (PARALLEL-WEAVE)

Per the cycle-1 grant of `retrospective-delay-steward-004`, this stage does not drive edits to [[Progressive Staging]] and Progressive Staging does not drive this stage. We flag the relationship here for a future Weave to consider:

- The "additive complexity, never retroactive" principle is honored — Stage 2's gain-and-lag parameterization wraps Stage 1 cleanly; you can set the lag to fixed half-note and recover Stage 1 exactly.
- The "each stage teaches one concept" principle is honored — this stage teaches *always-recording circular buffer with one-knob gain*. Character animation, séance framing, Gen~ port are all explicitly deferred.
- The "implementation paradigm can shift at a stage boundary" principle hits at Stage 3 (Gen~). Stage 1 lives entirely in vanilla Max.

A future Weave may want to fold "stage isolates one mental-model module, not just one parameter" into Progressive Staging — Stage 1 isolates a mental model (witness, always-on, phrase-not-tap), not a parameter count.
