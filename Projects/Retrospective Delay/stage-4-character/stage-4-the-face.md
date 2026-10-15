---
title: "Retrospective Delay — the face (session draft)"
project: "[[Retrospective Delay]]"
loudon-live-status: drafting
last-updated: 2026-10-15
---

# The face — session draft

*The fourth move of five. The séance from the grammar session, still one gen~ codebox inside a Max for Live audio effect, gets a face: the Gorey séance cat, drawn in JSUI. About 90 minutes, roughly 70% making and 30% framing.*

Draft written by the steward from a working model ([face/face_model.py](face/face_model.py)), a film of that model ([face/face-film.mp4](face/face-film.mp4)) and an unopened patch ([face/face.maxpat](face/face.maxpat)). Nothing here has been played in Max yet.

## What the participant leaves with

A device whose face tells the truth about it. And one idea they can carry to any interface they build:

**A face should show what the instrument is doing, not what the controls are set to.** The knob is already on the screen. Drawing it again as a cat is decoration. Drawing what the knob *can't* tell you is the job.

## Frame (15 min)

Open with the cat as it was first wired: one input, the knob. Turn the dial and the cat wakes, reaches, triumphs. It's charming, and it says nothing the dial didn't already say.

Then ask the room: *what can the séance be doing that the dial can't show?* Let them find the three answers, because each one comes from an earlier session:

1. **The knob you hear isn't the knob you set.** The gain is slewed over 20 ms so a fast turn can't zipper (the séance). The face should follow what reaches your ears.
2. **The tape can be full or empty, whatever the knob says.** Turning the knob down hides the past without erasing it (the séance). Knob up over an empty tape summons nothing.
3. **The tape is either listening or keeping.** Silence keeps the past; playing overwrites it (the séance, with its 5 ms crossfade).

Show [face-moments.png](face/face-moments.png). Bottom-left: the cat asleep, wisps still around it, the candle lit. Nobody is summoning, but the past is still there. Bottom-right: the cat with its arms up, no wisps at all. The knob is all the way up and the room is empty. Those two frames are the session.

## Make (60 min)

Start from the grammar patch. Everything new happens at the bottom of the codebox and to the right of the gen~.

1. **Three more outlets** (15 min). At the end of [face.genexpr](face/face.genexpr), add:
   - `out3 = gs;` — the knob as heard. It was already computed. Now it leaves the box.
   - `out4 = clamp(penv * pscale, 0, 1);` — an envelope on the *raw* ghost, before the knob. Fast attack, 1 second release, so the rests inside a phrase don't read as an empty tape.
   - `out5 = 1 - listen;` — the tape is holding.

   Point out that none of this touches the sound. The model checks it: the face version's output matches the grammar version's exactly, difference zero.

2. **Signal to control** (10 min). `snapshot~ 33` on each outlet: thirty readings a second, the same rate the cat redraws. `prepend set_gain`, `prepend presence`, `prepend holding` into the jsui. Talk about why it's snapshot~ and not a faster rate: the eye doesn't need it, and every message costs the scheduler.

3. **Pose from the knob as heard** (10 min). Open [seance-cat.js](jsui/seance-cat.js). The three plates crossfade on smoothstep curves across the gain. Turn the dial fast and watch the cat take 20 ms to follow. That's the slew, made visible.

4. **Ectoplasm from the tape** (15 min). The strands are drawn *after* the dark vignette, in pale bone, so they show even while the cat sleeps. Play a phrase with the knob down. The cat stays asleep, but the strands come up. Now raise the knob with nothing played since the device loaded: the cat reaches, and the room stays empty.

5. **The candle from the hold** (10 min). Play, and the candle goes out. Stop, and it lights. This is the 5 ms crossfade from the séance, shown at a speed you can see.

## Watch it together (10 min)

Play [face-film.mp4](face/face-film.mp4) with sound. It's the séance's fifteen-measure performance played through the model: play, stop, summon, re-lag, play over it, dismiss, summon again. Ask the room to call out each moment before the caption does. If they can, the face is working.

## Reflect (5 min)

The face made us say three things out loud that the knob was hiding. Ask: *what is the fourth?* (Candidates the room might find: which lag is playing; how much of the tape is the new phrase versus the old one; where the read head is in the measure.)

Then the bridge to the last move, the portal: an RNBO export has no JSUI. When the instrument leaves Max for a VST or the H90, what happens to its face?

## Open for Loudon before this runs

- **Nothing here has been opened in Max.** The jsui path for the plates inside a frozen device is the most likely thing to break.
- **The ectoplasm strands are plain vector curves over hand-inked plates.** They read clearly, but they don't match the Gorey line. The face works. Its style is still rough.
- **The empty room shows the candle lit.** When nothing has been played since the device loaded, the tape is "holding" silence. That's honest, and maybe a good question for the room, but it may read as a bug.
