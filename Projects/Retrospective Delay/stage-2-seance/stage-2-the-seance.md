---
title: "Retrospective Delay — the séance (session draft)"
project: "[[Retrospective Delay]]"
loudon-live-status: drafting
last-updated: 2026-10-15
---

# The séance — session draft

*The second move of five. Vanilla Max, still a Max for Live audio effect. About 75 minutes, mostly making. Built on the witness from the first session, the pure always-recording buffer, and this is where silence starts keeping the past.*

Draft written by the steward from a working model ([seance_model.py](seance_model.py)) and an unopened patch ([seance.maxpat](seance.maxpat)). Nothing here has been played in Max yet.

## What the participant leaves with

The witness from the first session, made into something you can perform. Last time ended on an honest letdown: the witness is a half-note echo, and Echo can match it sample for sample. This session gives it the one thing Echo can't do. **When you stop playing, the last measure stays.** Add one knob that summons or hides it, a three-way choice of how far back the ghost sits, and no clicks. The idea they didn't expect: **silence is the gesture.** You stop playing, and the instrument starts.

## Frame (10 min)

Pick up the hand-off from the witness: *the witness forgets everything a measure after you stop. What would it take for silence to keep the past instead?* Then the séance, said plainly once and not leaned on: you are the medium, the buffer holds the ghost, the knob is the door.

Point at one design decision before building: **the knob sits on the way out of the buffer, not the way in.** Turning it down hides the past; it does not erase it. (The April plan put the gain on the write side, where turning the knob down would slowly erase the ghost. That's a different instrument, maybe worth its own session.)

## Make (45–50 min)

Start from the witness patch ([witness-A-as-specified.maxpat](../stage-1/witness/witness-A-as-specified.maxpat)). Four additions, in this order, listening after each one.

**1. Silence keeps.** The tape still writes on every sample, but now it chooses what to write: the input while you're playing, and what it already holds while you're not. `abs~` → `slide~ 1 4800` (an envelope with a 100 ms release) → `>~ 0.003` gives a 0-or-1 "is anyone playing?". The write becomes `old + listen × (in − old)`: `index~` reads the slot about to be overwritten, then `-~`, `*~`, `+~` into `poke~`. Wire the gate straight in first. Play, stop, and listen to the held loop. **It ticks once a pass.**

**2. The crossfade in, a few milliseconds.** The tick isn't at the measure line. The read head never jumps there; the buffer is one continuous ribbon of time. Have everyone listen for it at the barline first: **nothing.** The tick is **where you stopped playing.** When the witness switches from listening to holding, the newest thing it heard ends up right next to the oldest. Come back in mid-measure and the same thing happens the other way: new sound spliced hard onto old. One object fixes both edges: `rampsmooth~ 240 240` after the gate. That's a straight 5 ms ramp each way between listening and holding. Five milliseconds is enough. In the model 1 ms already removed the tick, and the rest is margin for low notes on real instruments.

| what the ghost does | biggest jump between samples |
|---|---|
| a held chord, untouched (the reference) | 0.013 |
| frozen loop, hard switch where you stopped | 0.178 — audible click |
| frozen loop, 5 ms crossfade | 0.011 |
| coming back in mid-measure, hard switch | 0.237 — audible click |
| coming back in, 5 ms crossfade | 0.033 — the pluck's own attack (0.033) |

Listen in pairs: [seam-hard.wav](seam-hard.wav) against [seam-smoothed.wav](seam-smoothed.wav), then [comein-hard.wav](comein-hard.wav) against [comein-crossfaded.wav](comein-crossfaded.wav).

**3. The knob gets a ramp.** `live.dial` → `pack f 20` → `line~` → `*~` on the ghost. Twenty milliseconds, so a fast turn doesn't zipper. Now that silence keeps, the read-side placement matters: turn the ghost away for a measure, bring it back, and it's still there.

**4. The lag becomes a choice.** A `live.tab` with 1/4, 1/2, 1/1. `sel 0 1 2` → messages `0.25`, `0.5`, `0.999`. Ask the room why the whole note isn't `1.0`. (At exactly 1.0 the read head sits on the write head, and vanilla Max doesn't promise which runs first inside a signal vector. Park that. Gen~ answers it in the next session.)

Then switch it without a click. One read head jumping to a new spot is a splice. Two read heads fix it: the idle one jumps, then a 30 ms fade hands over to it. `t b f b` → `counter 0 1` → `gate 2` routes the new lag to the idle head's `-~`; `line~` fades between them, `!-~ 1` gives the other side.

| re-lagging a held ghost | biggest jump between samples |
|---|---|
| one head | 0.084 — click |
| two heads, 30 ms fade | 0.008 |

## Performance (15 min)

Loudon plays first; the reference recording is [seance-performance.wav](seance-performance.wav):

1. Play a phrase with the knob down. Nothing but you.
2. Stop. Raise the knob over a measure. The phrase comes back and stays.
3. Switch to quarter-note lag in the silence. The loop slides, no click.
4. Play a new phrase over the ghost. It overwrites the past as it goes, and comes in without a click.
5. Stop. Let the new ghost loop, then turn it away.
6. A measure of real silence. Then raise the knob again: **the ghost was still there.**

Then everyone plays.

## Reflect (5 min)

*When was the ghost helpful, and when did it fight you? What changed in your playing once you knew stopping would bring it back?* And once, out loud: *now try this in Echo.* This time they can't. Echo has no way to know you stopped.

Hand-off to the grammar session: *the whole note had to be 0.999. Why couldn't Max just tell us which object runs first?*

## Left open

- The gate's 100 ms release writes about half a second of near-silence into the held measure after a hard stop. You hear it as a gap in the loop. A shorter release cuts note tails; this wants an ear on a real instrument.
- The threshold (0.003) has only met synthetic plucks and chords.
- `rampsmooth~ 240 240` counts samples, so it is 5 ms at 48 kHz and 5.4 ms at 44.1 kHz. That's close enough here; the gen~ version says 5 ms outright.
- A click the player makes (a hard mute mid-note) is written into the tape and loops with it. The crossfade smooths the switch, not the source.
