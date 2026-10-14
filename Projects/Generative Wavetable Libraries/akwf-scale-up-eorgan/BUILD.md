# AKWF scale-up, second folder: AKWF_eorgan, 142 organ cycles

Cycle 17, 2026-10-14. Cycle 16 ran the wavetable interview on AKWF_fmsynth (122 wild FM cycles) and found that the family chain beats the old dull-to-bright default. This run asks whether that holds on a very different folder, the electric organs. Source: `~/Library/CloudStorage/Dropbox/_Reference/AKWF/AKWF_eorgan/`. 142 of its 154 cycles: 12 are online-only in Dropbox and would not download (listed in `metrics.json`). Rebuild with `/usr/local/bin/python3 scale_up_folder.py` (any AKWF folder: `--tag cello`), and `/usr/local/bin/python3 threshold_and_tilt.py` for the size and tilt tests.

## Open these, in this order

All tables hold the same 142 cycles. Only the order of the frames differs.

| file | what Position means |
|---|---|
| `tables/akwf_eorgan_centroid.wav` | the old default: dull to bright, nothing else considered |
| `tables/akwf_eorgan_family_chain.wav` | three families end to end (72 round, 58 warm, 12 bright-nasal), each walked smoothly inside |
| `tables/akwf_eorgan_family_chain_tilted.wav` | **my pick for organs**: the same chain, but each family's walk is pulled gently toward dull-to-bright |
| `tables/akwf_eorgan_walk.wav` | the smoothest path through all 142; brightness wanders |
| `tables/families/*.wav` | one small table per family |

- **Serum / Vital / Surge XT:** drag the plain `.wav` (no `_ableton`) onto oscillator A. 2048-sample frames with the CLM chunk.
- **Ableton Wavetable:** drag the `_ableton.wav` onto the oscillator display. 1024-sample frames, 16-bit.
- **No synth handy:** each `_audition_sweep.wav` is a held A2 while Position sweeps 0 to 1 over 24 s.

## What to test and listen for

1. **Centroid, then the family chain.** The centroid table should stutter: by this folder's own standard it jumps on 76 of 141 steps. The chain should glide, with two seams (round to warm near 50%, warm to bright-nasal near 92%).
2. **Chain, then tilted chain.** Does the tilted one feel more like "turn it up, it gets brighter"? It measures 0.84 against 0.74, for one extra jump. On the FM folder the same tilt did nothing useful, so this is a per-folder dial, not a new default.
3. **The last 12 frames (bright-nasal).** Thin, buzzy, percussion-drawbar sounds. Do they belong at the top of the table, or are they a separate instrument?
4. **Serum check:** each CLM file should load as 142 frames (72/58/12 for the families) with no octave error.

## Conventions

Same as `../akwf-scale-up-fmsynth/BUILD.md`: DC removed, one normalisation per table, frames rotated to line up with their neighbour, timbre distance from the loudness-free log spectrum of harmonics 1 to 64, families by k-means with k chosen by silhouette (here k = 3, silhouette 0.25).
