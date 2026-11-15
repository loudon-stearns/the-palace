# A recording someone brings becomes a wavetable

Cycle 22, 2026-11-15. The last source the plan still needed after palace synthesis, AKWF and the AI notes: cycles a user brings. Those other sources arrive as single cycles or as graded steady notes. A recording someone brings arrives as a phrase, with moving pitch, gaps, breaths and attacks. `bring_your_own.py` takes any audio file and makes a table out of it, with no grader and no folder of cycles.

    /usr/local/bin/python3 bring_your_own.py <audio> [<audio> ...] [--name N]

Reads wav, aiff, m4a, mp3 (anything `afconvert` reads). Writes `tables/<name>/` and nothing beside the source. About 20 s per 30 s of audio.

## What it does

1. **Tracks the pitch itself.** YIN, every 10 ms, 30 to 900 Hz. (The floor was 50 Hz until the bass test: its E1 is 41 Hz, and it found nothing at all.)
2. **Pulls one cycle from every steady moment.** Four periods at that moment's pitch, each resampled to 2048 points, averaged. It is kept only if the periods agree. The two gates and the octave fold are reused from `../ai-cycles/extract_ai_cycles.py`, so a cycle passes here on the same terms as there.
3. **Packs in the order it happened.** Position means time through the recording. Sweep it and the table replays how the sound's colour changed, at whatever note you play. Past 256 kept cycles, it keeps 256 spread evenly in time.
4. **Writes a second order, the smoothest walk** through the same cycles, for recordings whose own order jumps.

Both go through the shared `emit()`, so both carry the one-frame blur that has been the default since 10 November.

## Three recordings, none of them a person's

I had no recording of Loudon's to hand, so these test the machinery, not a real performance.

| recording | what it is | kept / voiced moments | frames | big jumps, time / walk | buzz as written, time / walk (dB) |
|---|---|---|---|---|---|
| `samantha_vowels` | macOS voice Samantha saying "Aaah. Eeee. Oooo." slowly, 2.4 s (made with `say`, in `brought/`) | 140 / 150 | 140 | 0 / 0 | −51.3 / −49.2 |
| `torus_singer` | the 2D Torus singer demo, 27.8 s: eight held synth settings, 73 to 294 Hz | 1938 / 2228 | 256 | 8 / 5 | −37.9 / −39.3 |
| `bass_gestures` | the Harmonicity page's bass with gestures, E1, 34 s | 3389 / 3392 | 256 | 0 / 0 | −64.0 / −46.6 |

For comparison, the smoothed AKWF and AI tables sit at −35 to −41 dB of buzz.

**Time order is the default.** On the two recordings that change gradually, their own order was smoother than any walk: by 17 dB on the bass, 2 dB on the vowels. The walk only helps where the recording jumps between unrelated sounds, and on the Torus singer it buys 1.4 dB. A recording already knows its best order.

**One thing the picture shows that a listener should know.** Every cycle is stretched to one length whatever pitch it was sung at. A vowel's formants sit at fixed Hz, so when the pitch falls they move up in harmonic number. Samantha's "ee" glides upward in the picture because her pitch falls from 200 to 110 Hz while she says it. Played back at one note, the table carries that glide as a change of colour. That is the sound of the recording, not a fault, but it means a vowel table played far from the pitch it was sung at will not sound like the same vowel.

## Open these

Each recording has the same six files in `tables/<name>/`:

- **Serum / Vital / Surge XT:** drag `<name>_time.wav` onto oscillator A (2048-sample frames, CLM chunk). `<name>_walk.wav` is the other order.
- **Ableton Wavetable:** drag `<name>_time_ableton.wav` onto the oscillator display.
- **No synth:** `<name>_time_audition_sweep.wav` is a held A2 while Position sweeps 0 to 1 (24 s).
- `<name>.png` shows the recording, the pitch track with every kept moment, and the table's harmonics frame by frame. `report.json` has every number above.

Start with `tables/samantha_vowels/samantha_vowels_time_audition_sweep.wav`.

## What to listen for

1. **The vowels.** Does the sweep pass through ah, ee and oo, recognisably, at A2? It is an octave and a half below where Samantha spoke, so the vowels may come out darker than hers.
2. **The joins.** Between the vowels the recording had silence. The table has none, so ah meets ee directly. Is the join a glide or a lurch?
3. **The Torus singer.** Eight held settings. Time order steps between them, the walk regroups them. Which reads as an instrument?
4. **The bass.** Its gestures are subtle (pitch bends of a few hertz, a brightness that dips and recovers). With pitch taken out, is there any motion left to hear?

## Not yet

- No real performance has been through it: no person's voice, no acoustic instrument, no room.
- Noisy or polyphonic recordings will fail the agreement gate, and there is no fallback for them yet. A chord or a drum loop gives few or no cycles.
- The interview skill does not ask for this source yet. Its first question, where the cycles come from, would gain the branch "a recording you have".
