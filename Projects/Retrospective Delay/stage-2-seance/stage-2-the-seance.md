---
title: "Retrospective Delay — the séance (session draft)"
project: "[[Retrospective Delay]]"
loudon-live-status: drafting
last-updated: 2026-10-14
---

# The séance — session draft

*The second move of five. Vanilla Max, still a Max for Live audio effect. About 75 minutes, mostly making. Built on the witness, version B — the one where silence keeps the past.*

Draft written by the steward from a working model ([seance_model.py](seance_model.py)) and an unopened patch ([seance.maxpat](seance.maxpat)). Nothing here has been played in Max yet.

## What the participant leaves with

The witness from the first session, made into something you can perform. One knob that summons or hides the last measure. A three-way choice of how far back the ghost sits. No clicks. And one idea they didn't expect: **silence is the gesture.** You stop playing, and the instrument starts.

## Frame (10 min)

One question: *what does an instrument sound like when the most expressive thing you can do is nothing?* Then the séance, said plainly once and not leaned on: you are the medium, the buffer holds the ghost, the knob is the door.

Point at one design decision before building: **the knob sits on the way out of the buffer, not the way in.** Turning it down hides the past; it does not erase it. The witness keeps listening while you aren't. (The April plan put the gain on the write side. On the write side, turning the knob down would slowly erase the ghost. That's a different instrument, maybe worth its own session, but it breaks the witness idea.)

## Make (45–50 min)

Start from the witness B patch. Three additions, in this order.

**1. The knob gets a ramp.** `live.dial` → `pack f 20` → `line~` → `*~`. Twenty milliseconds, so a fast turn doesn't zipper.

**2. The lag becomes a choice.** A `live.tab` with 1/4, 1/2, 1/1. `sel 0 1 2` → messages `0.25`, `0.5`, `0.999`. Ask the room why the whole note isn't `1.0`. (At exactly 1.0 the read head sits on the write head, and vanilla Max doesn't promise which runs first inside a signal vector. Park that — Gen~ answers it in the next session.)

Then switch it without a click. One read head jumping to a new spot is a splice. Two read heads fix it: the idle one jumps, then a 30 ms fade hands over to it. `t b f b` → `counter 0 1` → `gate 2` routes the new lag to the idle head's `-~`; `line~` fades between them, `!-~ 1` gives the other side.

**3. The seam.** The April plan says to crossfade the loop boundary. Have everyone listen for the click at the measure line first. **There isn't one.** The read head never jumps there; the buffer is one continuous ribbon of time.

The seam is somewhere else: **where you stopped playing.** When the witness switches from listening to holding, the newest thing it heard ends up right next to the oldest. That's the click. And the fix is one object: `slide~ 480 480` after the gate, so the switch takes about 10 ms. Smoothing the gate *is* the crossfade.

| what the ghost does | biggest jump between samples |
|---|---|
| a held chord, untouched (the reference) | 0.013 |
| frozen loop, gate switched hard | 0.178 — audible click |
| frozen loop, gate smoothed ~10 ms | 0.011 |
| re-lagged with one head | 0.084 — click |
| re-lagged with two heads, 30 ms fade | 0.008 |

## Performance (15 min)

Loudon plays first; the reference recording is [seance-performance.wav](seance-performance.wav):

1. Play a phrase with the knob down. Nothing but you.
2. Stop. Raise the knob over a measure. The phrase comes back and stays.
3. Switch to quarter-note lag in the silence. The loop slides, no click.
4. Play a new phrase over the ghost. It overwrites the past as it goes.
5. Stop. Let the new ghost loop, then turn it away.
6. A measure of real silence. Then raise the knob again: **the ghost was still there.**

Then everyone plays.

## Reflect (5 min)

*When was the ghost helpful, and when did it fight you? What changed in your playing once you knew stopping would bring it back?*

Hand-off to the grammar session: *the whole note had to be 0.999. Why couldn't Max just tell us which object runs first?*

## Left open

- The gate's 100 ms release writes about half a second of near-silence into the held measure after a hard stop. You hear it as a gap in the loop. A shorter release cuts note tails; this wants an ear on a real instrument.
- The threshold (0.003) has only met synthetic plucks and chords.
