---
title: "SMPTE LTC"
type: project
status: active
pillars: [tools, creation, practice]
born: 2026-03
stage: growing
confidence: working
energy: medium
hook_quality: 7
beauty: 6
who_leads: loudon
links:
  - target: "[[SMPTE LTC — Context]]"
    type: spawned
    label: rationale-archive
  - target: "[[Progressive Staging]]"
    type: exemplifies
    label: the-teaching-ladder
  - target: "[[VST Template]]"
    type: connects-to
    label: plugin-path
  - target: "[[Rational Hearing]]"
    type: connects-to
    label: taught-from-in-class
  - target: "[[Frequency-Time Duality]]"
    type: connects-to
    label: two-tones-or-two-intervals
  - target: "[[Boundary-Crossing Instruments]]"
    type: connects-to
    label: reverse-boundary-crossing
  - target: "[[Modes of Collaboration]]"
    type: connects-to
    label: multi-device-sync
  - target: "[[DSP Frameworks]]"
    type: connects-to
    label: framework-choice
forward_vector: "I want to teach timecode all the way down — the eighty bits and their BCD, biphase mark and why only the time between flips counts, the sync word that tells a reader where, which way and how fast, drop-frame's skipped numbers, the frame every reader is late — until a student can make and read LTC in every form it takes, from a file to a gen~ device to a VST3 plugin and a standalone app, each held to the others sample for sample, and I want my rich face to be the room Loudon teaches it in, where a class can hear an encoder and a reader, slow them down, break them, and watch the bits fall out."
---

# SMPTE LTC

![[SMPTE LTC — hero.png]]

Time, written as sound. SMPTE linear timecode turns hours, minutes, seconds and frames into an audio signal that anything with a line input can follow — a lighting desk, a video server, a DAW, a second laptop. This page teaches it to the bottom: far enough that a student can make LTC and read it in any form, build the tool that does, and prove the tool right.

## The fine points

These are the facts students get wrong, and the ones a working tool cannot.

- **Eighty bits a frame,** sent across the frame they name: 1920 bits a second at 24 fps, 2000 at 25, 2400 at 30, 2397.6 at 29.97.
- **Biphase mark.** The signal flips at every bit boundary, and a 1 flips once more in the middle. The level carries nothing — only the time between flips does — so a cable that inverts the signal changes nothing. All zeros at 30 fps is a 1200 Hz square wave; all ones, 2400 Hz.
- **BCD, least significant bit first.** Each decimal digit of the time sits in its own few bits, with 32 user bits interleaved between them and a handful of flags: drop-frame, colour frame, and a polarity bit set so every frame holds an even number of zeros.
- **The sync word** is the frame's last sixteen bits, `0011 1111 1111 1101`. Twelve 1s in a row happen nowhere else, so a reader can find the frame. The word is not symmetrical, so read backward it tells the reader the tape is running in reverse. How far apart the sync words come tells the speed, if the reader knows the rate. A reader cannot tell rate and speed apart from the bit spacing alone: a 25 fps tape played 1.2× fast sounds exactly like 30. The frame numbers help, since a 25 fps count never reaches frame 25 at any speed, but 23.976 and a 24 fps tape slowed by a thousandth are the same signal, numbers and all. LTC reads in reverse and at varispeed; that is what the sync word is for.
- **Every reader is one frame late.** A frame's number belongs to its start, but the reader only has the number when the sync word closes the frame. A reader that shows the present adds one.
- **Drop-frame drops numbers, never pictures.** At 29.97 the count skips frame numbers 00 and 01 at the top of every minute except each tenth, 108 numbers an hour, so the count keeps up with the wall clock: `00:00:59;29` is followed by `00:01:00;02`, but `00:09:59;29` by `00:10:00;00`. Close, not exact: 108 skips an hour are a hair too many, so the count runs ahead of the wall by 86.4 ms, about 2.6 frames, a day. 23.976 has no drop-frame; it falls 3.6 seconds an hour behind the wall.
- **The number resolves a frame; the edges resolve a bit.** A chasing machine reads the time from the bits and its phase from the edges, to within a bit — about 0.4 ms at 30 fps. LTC is not sample-accurate by itself.
- **Level and edge.** The standard asks for a square wave with softened edges, a rise time of about 25 µs. Louder is not better: a few dB above what the receiver needs, never clipped, and nothing in its path that thinks it is music — no compressor, EQ, noise reduction or lossy codec. In a monitor mix it is a harsh buzz, and it bleeds into neighbouring channels.

## Every form

A student who has mastered LTC can make it and read it in each of these, and knows which one a job needs.

- **A file** — LTC rendered offline into a WAV, to play into a reader. Not to be confused with the timestamp a broadcast WAV keeps in its header, which is a sample count since midnight, not timecode at all.
- **Live audio** — an encoder that counts frames by itself, sample by sample, at the sound card's clock, and is steered from outside by *moving by* a number of frames, never *jumping to* one.
- **A reader** — timing the intervals between zero crossings, sorting them into short and long, shifting bits into a register until the sync word appears. The good reader measures the bit length as it goes, so one reader reads every rate and says which it hears, so long as the tape runs at its own speed.
- **Its cousins** — MIDI Time Code, the same time sent as quarter-frame messages, eight of them to carry one full time across two frames; VITC, timecode written into the picture, which still reads when the tape is paused and LTC goes silent; and jam sync, the regenerator that rebuilds a damaged signal and runs on through a dropout.

## The builds

The work already done, and the work this page leans toward.

- **The specification and its tests,** in JavaScript — the GoButton timecode device's `ltc.js` (`GoButton Local/v2/device/ltc.js`), which counts with drop-frame, builds the bits, encodes and decodes. Every other build is held to it.
- **The hostile gauntlet** (`hostile/`): twenty-six LTC files, each broken one way, with an answer key and a scorer any reader can take; a seeded script makes them, so they can be made again. It is the teaching room's challenge, made. GoButton's reader passes 22 of them and reads 300 wrong frames across the files and the sweeps, 119 of them through a single +12 dB EQ. The room's own backward reader reads a tape played backward, which GoButton's cannot, and still reads 102 wrong frames. It checks that every frame has an even count of 0s, and at 7 kHz that check let through 98 frames with even 0s, all of them wrong. The second free check, that every frame follows the one before, is the one that holds: with it the room's reader reads none wrong, and so does the careful reader, GoButton's with hysteresis, a gap rule and both checks.
- **A gen~ encoder and reader** in a Max for Live device, which ran in Live 12 on 2026-10-05 (`GoButton Local/v2/timecode/`).
- **Loudon's hand-tuned gen~ readers,** three short/long thresholds per frame rate, one device per rate — the before picture that makes the adaptive reader a lesson.
- **An LTC-to-MTC project** in Max (`Max 8/Max for Live Devices/LTC to MTC Project`), whose folder holds only two compiled externals, `smpte_decode4~` and `generate_mtc`, and no patch; whose externals they are is not yet traced.
- **Next: a VST3/AU plugin and a standalone app** that read and write LTC, starting from the [[VST Template]]. A plugin writing LTC from the host's playhead is the "move by, not to" lesson again, in a new host.

The method is GoButton's: **every algorithm exists twice, and the second copy is held to the first sample for sample.** The JavaScript is the specification; the codebox follows it line for line; the tests run both on the same input and compare. A plugin is a third copy under the same rule.

## The teaching room

The rich face is not built yet. It is to be a walk up to the proof ([[Progressive Staging]]), each step complete on its own and silent until a click, made through [[Enrichment]].

1. **Count** — a clock at six frame rates. Drop-frame shows itself as skipped numbers; 23.976 shows itself drifting from the wall.
2. **Bits** — the eighty-bit word for any time, its digits, flags and sync word laid out where a student can flip any bit.
3. **Wave** — the biphase signal drawn and heard. Flip a bit and the pitch changes; invert the wave and it still reads.
4. **Read** — a reader walked through one frame: crossings, intervals, short and long, the register filling, the lock, the frame it is late.
5. **Break it** — noise, clipping, EQ, slow edges, varispeed, reverse, the wrong frame rate. Watch what the reader survives.
6. **Build** — the same encoder in JavaScript, gen~ and C++ side by side, and the room's challenge: a reader that passes its hostile test files.

## Why it matters

In Loudon's live rig the show's timecode is what lighting, sound and projection chase; one audio cable carries the clock to every desk. In the classroom LTC is a rare thing: a standard small enough to hold whole and exacting enough to teach precision. It runs from abstract time — frames, counts, a convention about minutes — down to a waveform a student can see and hear, and back up through a reader they wrote.

It is [[Signal-Rate CV Architecture]]'s move taken to its limit: time itself as an audio signal, so anything that can hear can follow the clock. It touches [[Frequency-Time Duality]] honestly: biphase mark is two tones, one an octave above the other, and a reader can time the intervals or listen for the tones — the same signal, read in either domain. And it is a [[Boundary-Crossing Instruments|boundary-crossing instrument]] in reverse: engineering becoming music's infrastructure.

## The trickster in timecode

Timecode pretends to measure time and is in fact a counter. It counts frames, not seconds; drop-frame skips numbers to keep the counter honest with the clock; 23.976 lets it drift. It is a convention about time that has to be learned as a convention — and LTC makes that convention audible.

## Open questions

- **JUCE or RNBO for the plugin?** ([[DSP Frameworks]]) RNBO exports to VST3 and AU, but its codebox is a port of the gen~ one, not the same file; JUCE gives a reader with a UI and a standalone app from one codebase. Which teaches better, and which is the third copy the tests can hold?
- **A plugin when the host stops.** Some hosts suspend a plugin on a track with nothing to play once the transport stops. How does a plugin reader listen, and a plugin writer send Locate, when the host goes quiet?
- **Resampling.** The gauntlet's sweep at 30 fps answers most of this. GoButton's reader and the careful one read from 8 kHz up, 3.3 samples a bit; the room's two readers read at 11.025 kHz and not at 8. Below its floor a reader should go silent, and not every one does: at 7 kHz GoButton's reads 118 wrong frames and the room's unchecked one 98. 44.1 kHz's 18.375-sample bit costs nothing, and a card clock 8% slow costs no frames, though no reader can name the rate it hears. What is still open is a real sample-rate converter between encoder and reader: how its filter treats the edges.
- **Long runs at drop-frame.** The counting is exact over a whole day, every number back to its own frame, and the count ends the day 86.4 ms ahead of the wall. Has a 29.97 drop run been read against a hardware reader for over an hour?
- **What shows mastery?** The room's challenge is a reader that passes hostile files. Is that the right bar, or does mastery also mean the student's encoder fools a hardware reader?

---

*How the project began — the Ableton extension that wrote WAV files, the port toward Max, the GoButton device — and why the page is shaped as it is live in [[SMPTE LTC — Context]].*
