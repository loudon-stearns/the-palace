---
title: "Frequency-Time Duality"
type: concept
pillars: [creation, tools, philosophy, practice]
born: 2024-06
stage: growing
forward_vector: "I want to become the explanation of how time-scales themselves are perceptually graduated — the principle that one continuous axis (the rate at which something repeats) crosses *perceptual* thresholds, not physical ones. The first and most foundational of these crossings is rate-becoming-pitch around 20 Hz: below it polyrhythms, above it intervals. From this single gear-shift the rest of the modulation family — delay, vibrato, FM, rhythm — emerges as named regions on the same axis. I am the prototype of every threshold-crossing that follows, and my rich face is the walk you can play, taught from in class as it grows; a fuller standalone tool spawns from it only once the face has earned it."
links:
  - target: "[[Boundary-Crossing Instruments]]"
    type: enables
  - target: "[[Hyperdimensional Prism]]"
    type: mirrors
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
  - target: "[[Action Potential Oscillator]]"
    type: connects-to
  - target: "[[The Fortress and the Threshold]]"
    type: mirrors
  - target: "[[DSP in Looping Dimensions]]"
    type: mirrors
    label: rhymes-with
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: doorway
  - target: "[[Wavetable Oscillator]]"
    type: connects-to
    label: doorway
  - target: "[[Bessel Functions in Synthesis]]"
    type: connects-to
    label: doorway
  - target: "[[Loudon Live]]"
    type: connects-to
    label: introductory-tool
---

# Frequency-Time Duality

![[Frequency-Time Duality — hero.png]]

Frequency and delay time are mathematical reciprocals: f = 1/T. This is not merely a conversion formula — it means that a single continuous parameter (repeat rate) produces the full spectrum of perceptual experience depending on where you are on the axis.

The continuum, traveling from high to low frequency / short to long delay:

- **Pitch perception** — repeat rates above ~20 Hz fuse into tone
- **Flutter echo** — discrete repetitions that begin to lose pitch definition
- **Distinct echo** — clearly separate repetitions, spatial/depth perception
- **Slapback** — single tight echo (~30–120ms), rockabilly and tape aesthetics
- **Rhythmic pulse** — repetitions experienced as meter, groove, subdivision
- **Sub-rhythmic pulse** — tempo reference, structural time

The same physical phenomenon — a signal repeating at a given rate — is perceived as fundamentally different things. The categories are not discrete; they are zones on a single continuous axis. Moving through them is moving through perceptual worlds on one dial.

This is what makes it a [[Boundary-Crossing Instruments]] concept before there was a name for it: the boundary between rhythm and pitch, between time and frequency, crossed by a single continuous gesture. **Polyrhythms below the threshold become intervals above it.** The threshold itself is *perceptual*, not physical — the same waveform produces different worlds depending on which side of ~20 Hz it sits. This is the first and most foundational threshold-crossing in the toolkit; many others are built from it.

> 🎓 *The demo that makes this a body-experience.* See [[proofs/2026-05-05-vibrato-becomes-melody|the moment vibrato becomes melody]] — a 5-minute lesson script that walks a learner from 5 Hz vibrato down to 0.5 Hz alternating melody, the crossing of the ~20 Hz boundary in real time. The script ends on a thesis: *the whole right side of the synthesizer is the left side, with a different clock.*

> 🎚 *The rough Loudon played, 2026-10-13.* [[proofs/2026-10-13-the-flip-three-axes.html|The flip, three axes]] — one log axis from 0.5 Hz to 2 kHz, three modes (click train, sine through a wobbled delay, two drum voices), with the threshold marked as a zone on each axis. It is the seed of this page's rich face, kept beside the two 2026-05-04 sketches.

## The Flip

Speed up a click train. At 60, 120, 240 beats a minute it is a rhythm you could tap. Somewhere around 1200, twenty clicks a second, the clicks stop arriving one at a time and fuse into a low buzz; push further and the buzz is a pitch. The signal hasn't changed, and neither has the speaker. The ear has changed how it reads them. A click train was a harmonic series all along: the tone you hear is the click rate and its whole-number multiples.

The crossing is a zone, not a line. Asked on 2026-10-13 to mark the one rate where rhythm became pitch, Loudon pushed back on the question itself: "we are requiring a listener to mark an exact point inside a zone that we have identified as a 'zone' there is a rudeness here, I am asked something impossible." He asked to mark the bottom and the top instead, and said in the same breath that "the top of the zone should be lower in almost all cases" than the rough had drawn it, at 40 Hz. Where one listener's zone sits, and whether it sits in the same place on every axis, is still open.

## Polyrhythms Become Intervals

Two drums, one striking three times while the other strikes twice, sped up together. First a polyrhythm you can count, then a groove too fast to count, then a buzz, then two pitches a perfect fifth apart. Slow them down and the fifth comes apart into three against two again. So the question Loudon asks, "what is the rhythm of a perfect 5th?", has an answer: three against two, for a pure fifth; the tempered fifth on a keyboard is a hair narrower. Every ratio does it: two against one is the octave, four against three the fourth, five against four the major third.

He teaches it with a Reaktor patch of his own, and said a page that never made the connection between polyrhythm and interval would be a big miss. The patch "plays drum sounds in polyrhythm then slowly speeds it up so you hear the polyrhythm become a buzz then a clear interval where it sits and we turn on and off the individual sounds so the interval is obvious then it dramatically slows back down to a polyrhythm."

Past the threshold, the drums' own sound shapes what they fuse into: "the sound of the drums and the exact start point of the sample has a huge impact on the timbre of the sound that is made." Tuning them is still ahead: "we will need to fine tune that in the future."

## The Echo Walk

Put one short sound into a delay and drag the delay time from long to short. Each stop is a different effect with its own name in the studio:

- **2 s**: a distinct echo, a second event.
- **500 ms, then 200 ms**: rhythmic echo, from dub to fast.
- **100 ms**: slapback, Sun Records and rockabilly.
- **50 ms**: a tight slapback, thickening the sound.
- **About 30 ms and below, for speech**: the Haas zone. When the echo comes from another speaker, you hear one sound, placed where the first arrival came from. A sharp click needs the delay much shorter before it fuses.
- **15 ms**: for speech, still one sound; when the echo shares its speaker, a light comb starts to colour it.
- **5 ms**: comb filtering, heard as tone colour.
- **1 ms**: a filter, an EQ.

The same delay block is every one of these. Only the time changed.

## The Bridge

The same delay, a different input. Feed it white noise, turn the feedback up, and the delay sings: a pitch whose period is the delay time. A 5 ms delay rings at 200 Hz, a 1 ms delay at 1000 Hz. Drag the time and the pitch follows.

`f = 1000 ÷ T`

(pitch, in Hz) = 1000 ÷ (delay time, in milliseconds)

Now tap in one short burst of noise instead of a stream. Put a gentle low-pass in the loop, so the burst loses a little brightness each pass, and you hear a plucked string: Karplus–Strong, the simplest physical model in audio. It was one mechanism the whole time. How long the loop is decides echo or pitch; what you feed it decides drone or pluck.

## The Recursion

The duality is recursive across dimensions: the same ~20 Hz perceptual threshold appears wherever a periodic phenomenon is placed on the time axis, regardless of which dimension that phenomenon occupies.

- **Signal axis.** Cross 20 Hz on the rate of repeated events: rhythm becomes pitch.
- **Modulation axis.** Cross 20 Hz on the rate of parameter modulation: wobble becomes timbre. A flanger whose LFO rate climbs past 20 Hz becomes FM synthesis. Chorus → vibrato → FM operator. Walked slowly on a 10 ms delay with the dry sound mixed back in, the wobble is a flanger's sweep at 0.1 Hz (± 5 ms) and a chorus at 1 Hz (± 2 ms). Put a plain sine through the delay alone and the same climb is easier to follow: a slow drift of pitch, a vibrato around 5 Hz, a wobble losing its identity near 15 Hz, and past 20 Hz sidebands, new partials either side of the note; from about 100 Hz up it is FM, bell tones. Same threshold, applied one level up.
- **Doppler interpretation.** Modulating delay time = changing path length = relative velocity. The flanger is Doppler shift you can hear because the comb teeth slide; the FM tone is Doppler from a source moving so fast its motion is itself audible.
- **Implication.** Every dimension you can put on the frequency-time axis carries the same perceptual zones. The duality is not a single fact about delay-and-pitch — it is a structural feature of how the auditory system parses periodicity at every level of nesting.

This is why the walk keeps meeting the threshold: on the rate of the signal (The Flip), on a polyrhythm, and here, on the rate of a modulation. Whether the zones sit in the same place is one of the open questions below. That they all exist is what makes the duality more than a conversion table.

## Three Doorways

Walk the whole axis and three fields open, each through something the walk already put in your hands.

- **Waveguides and physical modelling.** The Bridge made a string out of a delay line and a low-pass. Tune that filter and the string has a material; branch a resonator off it and it has a body. Flute, drum and bowed cello are next. See [[Waveguide Synthesizer]].
- **FM synthesis.** The sidebands that appear when the modulation crosses the threshold are a two-operator FM patch. The DX7 had six operators wired in 32 algorithms, each a different routing of carriers and modulators. That's the territory. See [[Bessel Functions in Synthesis]] for the maths of the sidebands.
- **Wavetables.** Close the delay line into a loop. A loop N samples long, read one sample per tick at sample rate fs, sounds at fs ÷ N, the same reciprocal that ran through the whole walk. A wavetable oscillator keeps the loop and changes how fast it reads it. See [[Wavetable Oscillator]], and past it [[DSP in Looping Dimensions]], where the loop goes up a dimension.

`f = fs ÷ N`

(pitch) = (sample rate) ÷ (loop length, in samples)

## Origin

Examined June 2024 through a MIDI frequency table mapping the full spectrum to delay times at 120 BPM, rhythmic subdivisions, perceptual categories, and stereo/modulated delay effects. The table was an early artifact of this principle — a cartography of the continuum.

In April 2026 the idea was designed a second time, as the Frequency-Time Explorer: a standalone web app that would walk this axis in five movements and end at three doorways. It was never built. On 2026-10-13 Loudon played a rough of it, three axes on one scale, and heard what it was: "What we are designing here, to me, feels like the 'rich face' of the frequency time duality." On 2026-10-21 the walk and the doorways folded into this page, where they now set the order of its sections, and the Explorer was set to compost.

## Cross-Pillar Connections

**Creation**: Every delay, chorus, flanger, and granular synthesizer is a frequency-time duality machine. Understanding the continuum gives a composer conscious access to all of it.

**Tools**: The table format is itself a tool — a reference instrument. The walk above is the playable one. This page's rich face is being laid, a piece beside each stop, and Loudon means to teach from it in class, in STIGMERGY, as it grows.

**Philosophy**: The duality maps directly onto [[Hyperdimensional Prism]] — what appear to be separate phenomena (pitch, echo, rhythm) are projections of a single higher-dimensional reality (periodic repetition). Change the rate; change the world you inhabit.

**Practice**: A lesson Loudon already teaches, made walkable. A class moves along the axis together, and each listener marks the bottom and the top of their own zone.

## Open Questions

- The transition is a zone, not a point (The Flip). How wide is it, how far does it move from one listener to the next, and does it sit in the same place on the signal, the modulation and the polyrhythm axes? The Recursion says every dimension carries the same zones; the 40 Hz top Loudon heard as too high says to measure it, not assume it.
- The table used 120 BPM as reference. How does the perceptual map shift at very slow or very fast tempos?
- Does the recursion observation imply the duality wants its own concept entry for **the 20 Hz threshold itself** as a perceptual constant? It currently lives scattered across body text in this entry and in Microsound.
- Lets bring Curtis Roads into this conversation, the best analysis of time scales in music I have found was in Curtis Roads book, microsound.
- Loudon puts daily cognition beside music and sound design as a place this boundary reaches: "how it impacts so much of what we do with music and sound design and daily cognition." What does the crossing look like there, where a run of separate moments stops being a sequence and is lived as one?

---

*Why the page walks and what it left out: [[Frequency-Time Duality — Context]]. The design of its rich face: [[Frequency-Time Duality — spec — rich face]].*

## Active Baton

[[Frequency-Time Duality — baton]] — re-batoned 2026-10-21 to the remainder after the deposit (`41f41dbd`): the first rich face, Enrichment's run; card `frequency-time-duality-remainder-20261021T135522Z`
