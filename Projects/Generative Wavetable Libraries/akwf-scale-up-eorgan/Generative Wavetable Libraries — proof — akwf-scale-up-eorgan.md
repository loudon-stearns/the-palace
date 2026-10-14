---
title: "Generative Wavetable Libraries — proof — akwf-scale-up-eorgan"
born: 2026-10-14
---

# Proof: the family chain on a second AKWF folder

**Question.** Cycle 16 found that on AKWF_fmsynth the family chain glides where the dull-to-bright default lurches, and proposed it as the interview's default past about 30 cycles. Does that hold on a folder of a different character, and is 30 the right line?

**Run.** AKWF_eorgan, 142 of 154 cycles (12 were online-only in Dropbox and refused to download). Same pipeline, reused function for function from `../akwf-scale-up-fmsynth/scale_up.py`.

## What the organs showed

| order | big jumps, fmsynth yardstick | big jumps, this folder's yardstick | brighter as Position rises |
|---|---|---|---|
| centroid (old default) | 12 | 76 | 1.00 |
| shortest walk | 3 | 14 | 0.38 |
| family chain | 2 | 16 | 0.74 |
| family chain, tilted 0.5 | 1 | 17 | 0.84 |

- **The chain holds.** By the organs' own standard the default jumps on 76 of 141 steps and the chain on 16. Three of the default's five worst steps join cycles whose brightness differs by under 9 Hz. It is the same failure as the FM folder: one brightness number cannot tell organ registrations apart.
- **My premise was wrong.** I expected near-identical organ cycles. They are not: the median distance between two organ cycles is 76, and no pair is closer than 1. Drawbar settings differ a lot in harmonic content. The second folder is tamer than FM but not tame.
- **Brightness gets weaker.** Silhouette picked only three families, so the first family holds 72 cycles walked with no regard for brightness. The chain's brightness score falls to 0.74, against 0.90 on FM.
- **A gentle tilt buys it back on organs, not on FM.** Pulling each family's walk toward brightness order (cost = distance + 0.5 × median distance × brightness-rank gap) gives 0.84 for one more jump on organs. On FM it changes nothing that matters. So the tilt is a dial for the interview to offer, not a default.

## The threshold

Random subsets, 20 draws per size, both folders (`threshold_and_tilt.json`):

| cycles | chain wins, fmsynth | chain wins, eorgan |
|---|---|---|
| 8 | 9/20 | 16/20 |
| 12 | 15/20 | 15/20 |
| 16 | 13/20 | 18/20 |
| 24 | 20/20 | 20/20 |
| 32+ | 20/20 | 20/20 |

From 24 cycles up, the chain has fewer jumps every single time in both folders. Below 16 it is close to a coin toss. **So the line is about two dozen, not 30.** The cost is that Position follows brightness less faithfully: about 0.17 lower on FM subsets and 0.3 to 0.45 lower on organ subsets. That gap is what the tilt is for.

## What this means for the interview skill (proposed, not written: the skill lives outside this folder and waits on Loudon's ears)

1. Past about 24 cycles, default to the family chain.
2. Before any audio, ask one more convention question: "Should turning Position up always mean brighter, or is smoothness worth more?" Yes → tilt 0.5. Smooth → no tilt.
3. Check that a captured-audio folder is fully downloaded before reading it. Dropbox online-only files fail with "Resource deadlock avoided", and the run should name what it skipped, not crash.
4. Note that the families shift a little between runs (k-means restarts); the size test, with fewer restarts, saw the FM chain at 17 jumps and 0.85 rather than 14 and 0.90. Pin the seed in any table that ships.

Unheard: every number here is measurement, not listening.
