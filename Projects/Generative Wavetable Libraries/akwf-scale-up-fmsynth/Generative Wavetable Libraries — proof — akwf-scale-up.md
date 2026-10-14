---
title: "Generative Wavetable Libraries — proof — akwf-scale-up"
born: 2026-10-14
links:
  - target: "[[Generative Wavetable Libraries]]"
    type: connects-to
    label: proof-of
---

# AKWF scale-up — where the captured-audio defaults break

Loudon's grant on 2026-06-25 was SCALE-UP: take the wavetable interview off the six-cycle test pack, point it at a real AKWF category folder, and let the "cluster first" branch do visible work. This is that run, on `AKWF_fmsynth` (122 cycles) from Loudon's own library.

## The dialogue, as it would now run

> **Claude:** Where do the cycles come from?
> **User:** Captured audio, `AKWF_fmsynth`.
> **Claude:** That folder has 122 cycles, and they are not one sound. They fall into five loose families: 54 round, near-sine shapes; 36 bright, full ones; 10 nasal, even-harmonic ones; 10 hollow, odd-harmonic ones; 12 glassy ones. A plain dull-to-bright sort would lurch, because 50 of its 121 steps jump between strangers. I would chain the families from dark to bright and walk smoothly inside each one. Or I can give you one table per family. Serum, Ableton, or both?
> **User:** Both. Chain it, and give me the families too.

That is still two user turns. But the second turn now carries a real decision, and the run would have gone wrong without it.

## What the run showed

| table | big jumps (of 121) | average step | brighter as Position rises? | worst mid-morph dip |
|---|---:|---:|---:|---:|
| centroid (old default) | 50 | 83.7 | 1.00 | −4.4 dB |
| shortest walk | 13 | 50.9 | 0.36 | −2.2 dB |
| **family chain** | **14** | **53.5** | **0.90** | −2.9 dB |

*A big jump is a step larger than 92, the 90th percentile of the walk's steps. "Brighter as Position rises" is the rank correlation between frame position and spectral centroid.*

1. **The dull-to-bright default breaks at scale.** Centroid is one number, and on 122 FM cycles very different spectra land on the same value. Four of the five worst steps join cycles whose centroids differ by 1 to 32 Hz but whose spectra are far apart (fm0029 to fm0118 differs by 1.1 Hz). On six hand-picked cycles this never showed; at 122 it is the main thing you hear.
2. **Smoothness alone throws away the knob's meaning.** The shortest walk is the smoothest table, but brightness only loosely follows Position (0.36).
3. **The family chain keeps nearly all of both.** It is nearly as smooth as the walk and nearly as meaningful as centroid. This should become the captured-audio default whenever a folder holds more than about 30 cycles.
4. **Phase alignment is a cheap, real fix, but a small one.** Rotating each frame to line up with its neighbour halves the worst crossfade dip (−4.5 dB to −2.2 dB). No dip in any table falls below −6 dB, so phase was never the problem on this pack. Ordering was.
5. **One of the skill's defaults is wrong.** The skill says to cluster down to 64 representative cycles whenever a folder has more than 64. Serum and Ableton both read 256 frames, so 122 fits whole. Shrinking the folder would throw away cycles for no reason. Clustering should decide the *order* and offer *per-family tables*, not cut the count.

## What changes in the interview

The question about curating gets a measured default. If the folder holds more than about 30 cycles, the default becomes "chain the families" and the per-family tables come for free. Below that, the old dull-to-bright sort stands. The 64-frame reduction default comes out. Writing these changes into the skill text waits on Loudon's ears: the numbers say the family chain is smoother, but only listening can say it is better.
