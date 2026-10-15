---
title: "Retrospective Delay — the portal (session draft)"
project: "[[Retrospective Delay]]"
loudon-live-status: drafting
last-updated: 2026-10-15
---

# The portal — session draft

*The fifth and last move, and the second of the two deliberate migrations: Gen~ to RNBO. The séance leaves Max as a plugin, a web page and, maybe, a box of hardware. About 90 minutes, split roughly half framing, half making, because the shift in thinking needs room.*

Draft written by the steward from a working mirror ([portal_mirror.mjs](portal_mirror.mjs)), an unopened RNBO patch ([portal.maxpat](portal.maxpat)) and a browser page that runs the codebox's own text ([portal-web.html](portal-web.html)). Nothing here has been compiled by RNBO yet.

## What the participant leaves with

The séance as one RNBO codebox, about 70 lines, ready to export. The mirror says it is the face's gen~ codebox to the last bit: all five outlets, across the whole fifteen-measure performance, differ by at most 5.6e-17. And one idea they can carry to any port:

**A port asks what the old home was quietly giving you.** Max for Live gave the séance two things nobody wrote down: a running transport, and a sample rate the tape was sized for. Leaving Max means noticing both.

## Frame (25 min)

Open with the question the plan left for this move: *once it lives outside Max, is it still the same instrument?*

Then answer it in two halves, because the answer is yes and no.

**Yes — the arithmetic.** Play [portal-performance.wav](portal-performance.wav) after the face session's séance. They are the same file. The codebox isn't "like" the gen~ patch; sample for sample it is the gen~ patch.

**No — the world around it.** Three things gen~ got for free, which a plugin host or a hardware box doesn't promise:

1. **The bar line.** The gen~ version took its write position from `phasor~ 1n @lock 1`, locked to Live's transport. Ask the room what happens to that phasor when the transport stops. It stops. The write head sits on one slot and writes it forever, and the tape stops listening. In a plugin with no transport running, or on hardware that has none, that's the whole instrument gone. The fix is a small, real idea: **the ghost never needed the bar line, only the distance between the heads.** So the portal's write head counts its own samples, and the tempo comes in as a plain `bpm` knob.
2. **The sample rate.** gen~'s tape was `Data tape(192000)`: four seconds at 48 kHz. The sweep in the mirror finds what that costs elsewhere:

| rate | 120 BPM | 90 BPM | 60 BPM |
|---|---|---|---|
| 44.1 kHz | on time | on time | on time |
| 48 kHz | on time | on time | on time |
| 96 kHz, gen~ tape | on time | **1.000 s, should be 1.333 s** | **1.000 s, should be 2.000 s** |
| 96 kHz, portal tape | on time | on time | on time |

At 96 kHz, a slow measure doesn't fit, so the tape quietly shrinks and the ghost comes back early: a half note at 60 BPM lands as a quarter. Play [slow-tempo-gen-tape.wav](slow-tempo-gen-tape.wav) and [slow-tempo-portal.wav](slow-tempo-portal.wav) back to back. This was a real bug in the grammar and the face as written, and only leaving Max surfaced it. The portal's tape holds 384000 slots: a 4/4 measure down to 60 BPM at 96 kHz.

3. **A buffer~.** The H9000's RNBO target doesn't support `buffer~` yet. The portal's tape is a `FixedFloat64Array` inside the codebox, so it never needed one.

## Make (45 min)

Start from the face's gen~ codebox. Make an `rnbo~`, add `in~ 1`, a `codebox~`, `out~ 1` and `out~ 2`. Port [portal.codebox](portal.codebox) line by line, listening after each step:

1. **Grammar first** (10 min). `Param gain(0, min=0, max=1)` becomes `@param({ min: 0.0, max: 1.0 }) gain = 0.0;`. `History` becomes `@state`. `peek`/`poke` on a Data become plain indexing, `tape[w]`. `mix(a, b, t)` becomes `a + (b - a) * t`. `mstosamps(30)` becomes `30 * samplerate / 1000`. Every line has a twin; the room can pair them.
2. **Cut the phasor** (10 min). Delete `in2`. Add `@state w`, count it up once per sample, wrap at the measure. Compute the measure from `bpm` and `samplerate`. Then stop the transport and keep playing: it still listens.
3. **Grow the tape** (5 min). 192000 to 384000. Set Max to 96 kHz, 60 BPM, lag a half note, and clap on beat one. The ghost lands on beat three, not two.
4. **The face's three facts** (10 min). `out3`, `out4`, `out5` into `snapshot~ 33` and three `outport`s. A plugin host ignores them; the Max for Live device and the cat from the face session listen.
5. **Export** (10 min). The sidebar: VST3/AU into any host, Max for Live back into Live, Web Export for the browser. Open the plugin in a second DAW and ask the room again whether it's the same instrument.

Before the RNBO build, the room can play [portal-web.html](portal-web.html): the codebox's own text, run line for line in the browser by hand, not by RNBO's compiler. It's the same source honestly ported, so the question can be asked with ears before anyone exports anything.

## The H90, honestly

The plan names the Eventide H90 as a destination. As far as I can find, the H90 has no RNBO route: Eventide's RNBO support is on the H9000 rack processor (four RNBO algorithms per chain, no `buffer~` yet), and for the H90 Eventide has said only that it's considering it. Crystal Synthesizer's portal move ran into the same wall. So the session can't promise the pedal. What it can say: the codebox is shaped so that if the H90 opens up, or an H9000 is in the room, nothing in the DSP has to change.

## Reflect (10 min)

*What else is your patch quietly getting from its home? A transport, a sample rate, a buffer, a vector size, a host that never stops calling it?* And the plan's question, asked last: **it is the same instrument, and it isn't**: same arithmetic, different world. Which of those is the instrument?

## Left open

- Nothing has been compiled by RNBO. The seams most likely to need a fix are listed at the top of [portal.codebox](portal.codebox): a 384000-slot `FixedFloat64Array` (about 3 MB of state, far larger than any array RNBO has been asked for in the palace so far), and how `bpm` gets fed from each host's transport.
- The browser page isn't RNBO's web export. It runs the same text through the same hand transpiler as the mirror. I haven't played it in a browser by ear; I checked only that its scripts parse and that its transpiler runs the codebox.
- The gen~ codeboxes in the grammar and the face still carry the 96 kHz tape bug. The fix is one number, but it belongs to those moves' drafts, so I've left them alone.
