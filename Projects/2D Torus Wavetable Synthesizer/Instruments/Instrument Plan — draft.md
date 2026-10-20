---
title: "2D Torus Wavetable Synthesizer — Instrument Plan (draft)"
born: 2026-10-20
---

# The Torus Ensemble — a plan for instruments that could play the étude

Loudon, on the hero's-journey draft (2026-10-18): *"The example is great as it is. Let's go back to the origins of the project. Let's take what we have here and make a plan for an instrument, or collection of instruments, that could be used to create songs like this."*

So this page reads the étude backwards. Étude No. 2e is 4:27 of music made by one engine, `RNBO/torus_2d_hopf.codebox`, running eleven times on different surfaces. Nobody played it. It was written as knob moves in a script (`Etude/render_etude_2e.mjs`), about 600 lines of them. Every line of that script is something a player would have to do by hand. The question this plan answers is: which of those lines should become an instrument, so a person could make the next song by playing instead of programming?

## What the score had to do by hand

Read the script and the same few gestures come back again and again. Counted from the source, as places in the script (a loop counts once):

| gesture | what it is in the script | how often | who did it |
|---|---|---|---|
| **sing** | a note list turned into baseHz ramps, with a scoop into each note, a glide on tied notes, vibrato that arrives late, a swell or a fall at the end | 29 | hero, mentor, reed |
| **pitch arithmetic** | every voice needs its own formula to turn a note into baseHz: `hz/6` for the hero at the pole, `hz` for the reed on 1:1, `hz/2` for the mentor on 3:2, `3hz/8` for the hero on the pad | every note | all pitched voices |
| **grab and let go** | coupling stepped up (the voice snaps onto a ratio) or dropped (it drifts off and shimmers) | 25 | hero, mentor, reed, drone |
| **the slip** | height set a hair off a lock with `het` up, so the dead line beats slowly | 17 | hero, mentor, reed |
| **atlas click** | height jumps to a lock a:b with a short gain dip; the ~15 ms smoothing sweeps through the locks between, and that flicker is part of the sound | 5 loops, about a hundred clicks | trickster, stair, the torn reed |
| **the hands** | stir, shear and bend ramped by hand to make a voice growl, churn or wobble | 16 | guardian, shadow, drone |
| **the clock** | a tempo curve with stretched eighths (12/8, jembe feel) or 2+2+3 aksak, accelerating and sliding down | 2 | everything rhythmic |
| **drums from surfaces** | a kick from the 1D pole at 23 Hz, a bell and shaker from Chladni off every ratio, fully stirred | hundreds of hits, from 4 loops | the drums |

The biggest finding is the second row. **The locked pitch is `2·baseHz/(a+b)`, so the same knob setting means a different note on every lock.** The script hid this by giving each voice its own formula, chosen by hand for the lock it sat on. A player can't do that arithmetic in real time. Any instrument here has to take a note and solve for baseHz itself, on whatever lock the voice is on right now. Every other gesture is easy to put on a knob once that is true.

## The ensemble: five instruments

The cast of the étude splits cleanly into four sounding instruments and one that conducts.

### 1 · The Singer — the lead voice

*Plays: the hero, the mentor, the reed.*

One Hopf voice that you play from a keyboard. A note sets the pitch you hear, not the knob: the Singer solves baseHz for the current lock, so changing the lock changes the colour and keeps the note. Expression is built in rather than drawn: scoop, glide on legato, delayed vibrato and the end-of-note swell are the `sing` function's defaults, turned into four knobs. The sphere is the second hand: height and longitude on an XY pad or a mod wheel, so the voice climbs from the 1D pole (where it is the classic wavetable synth) up through the locks.

Two performance gestures get their own controls because the étude leaned on them hardest:
- **Grab / let go** — a momentary pedal or button. Let go and the coupling drops and the voice drifts off its ratio and shimmers (the refusal). Grab and it snaps back (the reward).
- **Slip** — a knob that sets how far off the lock the voice sits, in Hz of beating, so "far away and faint" (the call) is one gesture.

### 2 · The Atlas — clicking through locks as a rhythm

*Plays: the trickster, the stair, the torn reed in the ordeal.*

A grid of pads, one per lock, laid out like the voicing atlas: nineteen locks with a and b up to 5. Hitting a pad jumps the voice to that lock, with the gain dip and the flicker of the locks in between. It has two modes, and the étude showed that they're different instruments:
- **Same note, new face** (the trickster). The Atlas holds the pitch fixed and each pad changes only the colour. On Matérn Field this measured 439.5 Hz after every click.
- **The Farey scale** (the stair). Each pad plays its own pitch, `baseHz·2b/(a+b)`, a nineteen-note scale that is partly tonal and partly strange. The hero's motif A C E D is in it, with only the C off, by 15 cents.

A step sequencer sits on the grid, so a cycle of five locks can run against twelve eighths and the colours never line up with the bar. That was the trickster's whole trick in the tests chapter.

### 3 · The Threshold — the weird sounds

*Plays: the guardian, the shadow, the refusal's smear.*

A voice that lives off every ratio by design: its height sits near golden-ratio points, far from any lock, so it never settles into a pitch. Its knobs are the three hands, stir, shear and bend, on big macro controls, with a surface selector (Chladni for metal, Fisher Ridge for churn) and a low baseHz range. This is the instrument for the parts Loudon asked to have back: the non-tonal sound design, the growl at the door, the void.

### 4 · The Hands — drums grown from surfaces

*Plays: the kick, the bell, the shaker, the drone.*

A drum voice per lane, each one the same engine set up as a drum: the kick is the 1D pole at 20–30 Hz with a pitch drop, the bell and shaker are Chladni off every ratio, fully stirred, with short envelopes. The grooves Loudon liked live here as feels, not quantize settings: 12/8 with stretched eighths (0, 0.31, 0.645 of the beat), 7/8 aksak 2+2+3 with the long beat 1.4 short beats, plus a little humanising. It also has a drone lane, Membrane on 1:1, under everything.

### 5 · The Conductor — time and the whole room

*Plays: no sound. It moves everyone at once.*

Two things in the étude were done to every voice together, and no single instrument can own them:
- **The tempo curve.** Tempo that arrives (46 → 80 at the threshold), holds, and then slides down and doesn't come back (80 → 40 in the cave). Free time between grooves. The Conductor is a tempo lane you can draw or ride live, and every instrument's clock follows it.
- **Let go together / grab together.** The resurrection and the ending are every pitched voice letting go at once, being stirred, and then being grabbed back onto the same ratio. One button, sent to every Singer and Atlas.

The Conductor also records. Everything a player does becomes knob moves, the same format the étude script writes, so a played take can be rendered offline through the codebox exactly as the étude was. Played and programmed music end up in one format.

## The étude's cast, mapped

| character | surface | instrument | mode |
|---|---|---|---|
| the hero | Penrose | Singer | starts at the pole, climbs |
| the mentor | Knot Shadow, 3:2 | Singer | slip, then locked |
| the ally (the reed) | Knot Shadow, 1:1 | Singer | locked, grooves |
| the trickster | Matérn Field | Atlas | same note, new face |
| the stair | Stiff String | Atlas | Farey scale |
| the guardian | Chladni Ghost | Threshold | stir + shear |
| the shadow | Fisher Ridge | Threshold | stir + bend, low |
| kick, bell, shaker, drone | Sine Cycle Sweep, Chladni, Membrane | Hands | 12/8 and 7/8 feels |
| tempo, the let-go, the grab | — | Conductor | moves everyone |

Five instruments, one engine underneath all of them. That matters for the commercial question the page carries: it may be one device with five faces rather than five devices.

## Where it gets built

Max work is paused until there are patching standards. So the instruments are built in the **browser first**, on the engine that already runs there (`Hopf/hopf-control-surface.html`) and is checked against the codebox offline. A browser instrument is playable today with a MIDI keyboard through Web MIDI, and its recorded takes render through the real codebox text. The RNBO version follows once two things are true: the A/B patch (`RNBO/torus-ab.maxpat`) has shown that the codebox reads the surface the way `2d.wave~` does, and the patching standards exist. What each instrument will need in Max (its parameters, its signal flow, the note-to-baseHz solve) is written down as each one is built, so the port is quick.

## The order, proposed

1. **The Singer.** Note-to-baseHz solving on any lock, the four expression knobs, grab/let go and slip. It's first because it carries the melody and because the pitch solve underlies every other instrument. Done when the hero's opening and the mentor's canon can be played by hand from a keyboard and sound like the étude.
2. **The Atlas.** The lock grid in both modes, with the step sequencer. Done when the trickster's five-against-twelve and the stair's descent in the cave can be played.
3. **The Hands and the Conductor together.** The drum lanes with their feels, and the tempo lane they follow. Done when the tests chapter's groove runs with a sliding tempo.
4. **The Threshold.** The macro hands on off-ratio voices. Done when the threshold chapter's growl can be ridden live.
5. **The ensemble page.** All five on one screen, recording to knob moves. Done when a new short piece (a minute or two, not a copy of the étude) has been played on it and rendered through the codebox.
6. **The port.** RNBO versions, once the A/B passes and the Max standards exist.
7. **The decision.** Signature device or teaching test bed, made with the ensemble in hand.

## What this plan doesn't know yet

- Whether a player can actually make the étude's sounds live. The étude's slips and clicks were placed to the millisecond; played by hand they may land differently, maybe better.
- Nobody has heard the fifth draft, so the cast is chosen from the score, not from what Loudon thinks works.
- Web MIDI and AudioWorklet latency on this Mac haven't been measured.
- Whether the Atlas should be one instrument with two modes or two instruments. The trickster and the stair felt different in the score; the plan keeps them as one grid for now.
