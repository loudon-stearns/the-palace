# Audio-AI cycles: 256 single cycles from MusicGen and Stable Audio

Cycle 18, 2026-10-14. The plan's next source after captured audio is an audio AI's output. The sister project, Generative Sample Libraries, already rendered about 1600 notes from MusicGen and Stable Audio and graded each one for pitch. I reused those renders (read only; nothing in that folder was touched), pulled one clean cycle out of every steady note, and packed the result the same way as the two AKWF runs.

Rebuild: `/usr/local/bin/python3 extract_ai_cycles.py` (about 2 minutes), then `/usr/local/bin/python3 pack_ai_tables.py` (about 7 s).

## The source, in numbers

- 599 notes the grader called steady → 578 clean cycles → 508 after dropping 70 exact duplicates (the probe re-graded some renders under several runs).
- 78 notes had been tracked an octave, a twelfth, two octaves or more low (64 / 10 / 3 / 1). The extractor folds those back to one period, or they would sound high in the synth.
- 508 is past Serum's 256 frames. The main tables hold 256, picked so each pick is the cycle least like any already picked. The cut drops near-twins, not whole regions.
- Almost all MusicGen. Stable Audio gave only 9 steady notes.

## Open these, in this order

All four main tables hold the same 256 cycles. Only the order differs.

| file | what Position means |
|---|---|
| `tables/ai_cycles_family_chain.wav` | **my pick**: three families end to end, each walked smoothly inside. Pure (near-sine) → round → reedy (weak fundamental). |
| `tables/ai_cycles_centroid.wav` | the old default, dull to bright, frames left at the phase the AI gave them |
| `tables/ai_cycles_walk.wav` | the smoothest path through all 256 |
| `tables/ai_cycles_family_chain_tilted.wav` | the chain pulled toward dull-to-bright. Doesn't help on this source. |
| `tables/families/*.wav` | one table per family: `family1_round-hollow` = pure (104), `family2_round-full` = round (77), `family3_warm-nasal` = reedy (75). The file names come from the AKWF namer. |
| `tables/by-instrument/ai_cycles_asked_<x>.wav` | one table per instrument the AI was *asked* for: bass, choir, flute, marimba, marimba_hit, piano, violin |

- **Serum / Vital / Surge XT:** drag the plain `.wav` (no `_ableton`) onto oscillator A. 2048-sample frames with the CLM chunk.
- **Ableton Wavetable:** drag the `_ableton.wav` onto the oscillator display. 1024-sample frames, 16-bit.
- **No synth handy:** each `_audition_sweep.wav` is a held A2 while Position sweeps 0 to 1 (24 s for the main tables).

## What to test and listen for

1. **Centroid, then the family chain.** The centroid sweep should flutter and hollow out. 45 of its 255 crossfades dip below −6 dB, down to −20 dB. That is phase, not order: the same order with the frames lined up dips at most −2.6 dB. The chain should glide the whole way, with no dip worse than −2.5 dB.
2. **What the chain's Position means.** On AKWF it meant roughly "brighter." Here it means "purer to reedier": the first family is 84% fundamental, the last 27%. Does that read as a usable knob?
3. **The violin table** (`by-instrument/ai_cycles_asked_violin.wav`, 170 frames). This is the AI's richest material. Is it a playable string-ish table, or mush?
4. **Marimba and flute.** These collapse to near-sines once the attack and breath are gone. Listen for whether the table moves at all.
5. **Serum check:** each CLM file should load with the frame count in its name or table above (256 for the main ones), with no octave error. The fold step exists because 78 cycles would otherwise be off by an octave or more.

## Conventions

Same as `../akwf-scale-up-fmsynth/BUILD.md`, plus the extraction: 8 periods averaged at the grader's pitch, refined ±30 cents per note to keep the overtones; cleanness ≥ 0.9 and overtone fidelity ≥ 0.5 to pass. DC removed, one normalisation per table, frames rotated to line up with their neighbour, families by k-means with k chosen by silhouette (k = 3, silhouette 0.20: soft).
