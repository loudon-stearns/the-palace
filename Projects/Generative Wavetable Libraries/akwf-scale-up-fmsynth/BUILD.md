# AKWF scale-up — AKWF_fmsynth, 122 cycles

The interview's captured-audio branch, run on a real AKWF category for the first time (cycle 16, 2026-10-14). Source: Loudon's own copy at `~/Library/CloudStorage/Dropbox/_Reference/AKWF/AKWF_fmsynth/` (122 single cycles, 600 samples, 16-bit). Rebuild with `/usr/local/bin/python3 scale_up.py` — the only python here with scipy and matplotlib.

## Open these, in this order

All four tables hold the same 122 cycles. Only the order of the frames differs.

| file | what Position means |
|---|---|
| `tables/akwf_fmsynth_centroid.wav` | the old default: dull to bright, nothing else considered |
| `tables/akwf_fmsynth_family_chain.wav` | **my pick**: five families end to end, darkest family first, each one walked smoothly inside |
| `tables/akwf_fmsynth_walk.wav` | the smoothest path through all 122; brightness wanders |
| `tables/families/*.wav` | one small table per family (54, 36, 10, 10, 12 frames) |

- **Serum / Vital / Surge XT:** drag the plain `.wav` (no `_ableton`) onto oscillator A. 2048-sample frames with the CLM chunk, so the frame count shows up on its own.
- **Ableton Wavetable:** drag the `_ableton.wav` onto the oscillator display. 1024-sample frames, 16-bit.
- **No synth handy:** the `_audition_sweep.wav` beside each table is a held A2 (110 Hz) while Position sweeps from 0 to 1. The full tables take 24 s.

## What to test and listen for

1. **Centroid, then the family chain, on a slow LFO or a hand sweep of Position.** The centroid table should *lurch*: neighbours with nearly the same brightness but nothing else in common sit side by side, so the timbre jumps on 50 of its 121 steps. The family chain should *glide* within each family, with four audible seams where one family hands off to the next. Does the chain still feel like "turning it up gets brighter"? It measures 0.9 on that, against 1.0 for centroid and 0.36 for the walk.
2. **The walk.** It is the smoothest of the three (13 big jumps), but brightness goes up and down as you sweep. Is that musical wandering or just aimless?
3. **The families as instruments.** Does each small table read as one kind of sound? `family4_bright-hollow` (odd harmonics, clarinet-ish) and `family3_warm-nasal` (even harmonics) are the cleanest.
4. **Serum check:** does each CLM file load as the right number of frames (122, or 54/36/10/10/12) with no octave error? These are the first CLM files written from captured audio rather than palace synthesis.

## Conventions (agreed by the standing order, defaults otherwise)

- 2048-sample frames, 32-bit float, CLM chunk (Serum/Vital/Surge). 1024-sample frames, 16-bit (Ableton). 44.1 kHz header.
- DC removed from every cycle. One normalisation across the whole table, so loudness stays relative between frames.
- Phase: each frame is rotated by whole samples to line up with the frame before it. A held note sounds the same; the morph between neighbours is fuller. The worst mid-morph dip goes from −4.5 dB to −2.2 dB on the walk.
- Timbre distance: the log spectrum of harmonics 1–64, loudness removed, Euclidean. Families: k-means, k from 3 to 8, chosen by silhouette (k = 5, silhouette 0.23, so the families are soft, not crisp).
- All numbers in `metrics.json`. Pictures: `contact_sheet_centroid_order.png`, `contact_sheet_family_chain.png`, `contact_sheet_walk_order.png`.
