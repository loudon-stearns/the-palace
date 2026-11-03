---
title: "Generative Wavetable Libraries — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Generative Wavetable Libraries]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Generative Wavetable Libraries' proposed rich face: every piece judged for test, fidelity and walk-up, every number rebuilt through the project's own chain, so Loudon reads a face that has already been argued with."
---

# Generative Wavetable Libraries — rich — challenge

Challenger, proposal round of Enrichment, 2026-11-03, on the maker's commit `09e5d516` in the worktree `enrich/generative-wavetable-libraries`. Judged from the page, the manifest, the three made pieces and two gathered files, `crystal-bravais/` (generator and BUILD.md), and the shipped wavs in the owner's bundle (ignored by git, read only). I did not make this face.

**Verdicts: 3 keep, 2 remake, 0 retire.**

## Plan

### the crystal knob — remake

1. **Test or decoration?** Steps 1–3 walk the recipe honestly. Step 4 is billed as the test, and its "held" column can't fail. A band-limited reader playing any stored cycle at a fixed pitch is exactly periodic, so the share off the harmonics is the meter's floor whatever the cycle holds. I rebuilt it from `crystal_bravais.wav` itself (frames 0, 21, 42, 63 are cubic, tetragonal, orthorhombic, triclinic exactly), with my own meter (3 s Blackman, ±2 Hz): every stored frame reads −137.8 dB, and so does a cycle of white noise. The maker's −109 dB is the same floor on its meter: cubic, with no detune at all, reads −112.5. `check.py:95` says "the test can fail". It can't. The "asked" side recomputes: triclinic −3.6 dB on my meter against the maker's −4.6 dB, so about a quarter to a third of the sound sits off the harmonics, depending on the tolerance.
2. **Faithful?** It refutes a stronger claim than the page makes. The page (lines 131, 134) says "phonon partial spectrum" and "traversal through crystallographic symmetry space"; it never says the cycle rings inharmonically. That is the generator's comment (`crystal-bravais/generate.py:58–60`), and the generator's own docstring already concedes the detune survives only as "the small edge discontinuity" at the buffer edge (`generate.py:89–95`). "Traversal through symmetry space" holds as the generator builds it: the systems are ordered by falling point-group symmetry (`generate.py:64–66`). What is wrong with "phonon" is settled by `BUILD.md:33` ("not a physically rigorous lattice/phonon model"). No measurement is needed for that.
3. **Walks up?** Yes: one cycle, then seven systems, then the knob, then the question.
4. **Overlap.** The identity in step 4 is already on two landed faces: [[Wavetable Oscillator]]'s "a bell on the grid" and [[Inharmonic Wavetable Synthesis]]'s "bend the flat line".

**Remake, exactly:** (a) In step 4, say the held column is the identity, not a measurement: any stored cycle scores the floor. Point to Wavetable Oscillator for the proof rather than re-running it as a test. (b) Make the step's test the crystal-specific thing that could come out either way: does the detune reach the stored cycle at all? Compare the stored cycle with detune against the same recipe at detune 0. The engine already has `seamFacts().change` (−16.2 dB of triclinic) and the seam ratio (12.3× at orthorhombic). Offer them as a level-matched listening pair, with its rule stated first. (c) Fix `check.py:95`'s claim. The rest of the engine is right: it rebuilds `crystal_bravais.wav` to 3e-8, the seam ratios agree in Python, and the 95 % nearest-frame claim checks (frame 10 is 10/63·6 = 0.952 hexagonal).

### brighter all the way — keep

1. **Test.** Yes, on the audio. For the frames, monotonic brightness is guaranteed: a Gaussian bell sliding over fixed partials can only push a weighted mean one way. The piece says so itself ("holds for a reason, not by luck"). The audition, though, can fail, and the plain reader does fail at A5 and A6, so the count is a real test. The shuffled control proves the counter can see falls (34 of 63 frames, 277 of 507 windows; reproduced).
2. **Faithful.** Yes, to "One note brightens monotonically" (line 149). The rule (one fall refutes) is stated before the count, and the lead sets it up at the open (piece line 81).
3. **Walks up.** One frame, then the bell slid, then the sweep, then the count.

My recount from `rich-face/shepard_centroid_audition_sweep.wav` (16-bit, 44.1 kHz, 12.000 s) found 0 falls with every window of 46 ms or more:

| window · hop · weighting | steps | falls |
|---|---|---|
| 2048 · 512 · amplitude | 1019 | 0 |
| 2048 · 512 · power | 1019 | 0 |
| 4096 · 401 · amplitude | 1296 | 0 |
| 8192 · 2048 · amplitude, Blackman | 251 | 0 |
| 16384 · 4096 · power, Blackman | 123 | 0 |

At 1024 samples, 23 ms (2.5 periods of A2), the meter's own ripple gives 387 falls (worst −0.03 octave). So the window belongs to the rule, and the piece does name it (93 ms windows, 23 ms apart). The fold-back holds: 256 × 110 = 28,160 Hz lands at 44,100 − 28,160 = 15,940 Hz, found at 15,940.0 Hz. It carries −9.6 dB of the sound from 10.5 to 11.5 s and −8.4 dB from 11.0 to 11.9 s. The A5 and A6 plain-reader falls (69 and 177, worst −0.0009 and −0.0019 octave) and band-limited 0 on every note reproduced through the project's `naive_sweep` and `bandlimit`.

**Note:** none. The piece is sound.

### rich-face/shepard_centroid_audition_sweep.wav (gathered) — keep, caption note

The file is tracked and is the steward's render (the engine matches it to one 16-bit step). **Caption note:** "a faint 15.94 kHz tone" understates a tone that carries a tenth of the sound's energy (−9.6 dB), and the piece itself gives that number. Better: "a 15.94 kHz tone, about a tenth of the sound's energy, high enough that many listeners won't hear it". "Which Serum and Ableton would drop" is expected behaviour, not checked; say so.

## Capability Assessment

### line up or not — remake

1. **Test.** Yes. The blind test can come out either way, and the turned control pair is there to show the setup works.
2. **Faithful.** Not on one number. The caption, step 4 ("Turned, the sweep sags up to 6.1 dB between systems"), the step-4 table's "worst sag" column and the blind test's prediction all quote `morph_dips_db`. That meter measures the raw 50/50 sum of two keyframes, and the crystal table never plays that blend, because `interpolate_table` re-normalizes every frame to full peak (`generate.py:145–147, 161`) for exactly this reason. Through the project's own chain, on the maker's seed-22 turns:
   - The turned table's halfway blends sit at −0.42, −0.99, −0.13, −0.71, +0.88 and +2.14 dB against their ends. The worst is −1.0 dB, not −6.1.
   - Over the same 40 draws, the worst played blend runs −1.65 to +0.04 dB (the raw meter gives −3.2 to −7.8).
   - Frame by frame, the turned table's level runs −2.1 to +2.9 dB against shipped, and the swept audio differs by up to 3.4 dB per 46 ms when matched over the whole sweep.

   So turning the cycles gives this table a level wobble of about ±3 dB and a buzz, not a 6 dB sag. The 6.1 dB is what a reader would do crossfading seven stored frames directly, which is the general warning, not this table. The buzz is measured on the interpolated table and stands: −39.1 against −58.3 dB, +19.2 dB.
3. **Walks up.** Yes: two frames, then one turned, then carry, then three sweeps, then the blind test.

**The blind test is clean.** The chance level and the rule come before the first trial. Pass at 10 of 12 or better: the chance of that by guessing is 79/4096 = 0.0193, which I recomputed (9 of 12 would be 0.073). Both arms are scored apart. Lengths are equal to the sample: 264,600 = 264,600 at 44.1 kHz and 288,000 at 48 kHz.

Level matching every 46 ms leaves 0.02 dB (carried) and 0.08 dB (turned) on its own grid. On a grid shifted half a hop it leaves 0.08 and 0.30 dB. The maker's ≤ 0.23 dB was measured on the favourable grid, but every figure is still under any loudness cue. No click separates the arms: both have the same 50 ms fades, and turning a cycle is circular, so it adds no seam. The peaks differ (−13.0 against −10.8 dBFS on turned), which is crest factor, not loudness.

The per-window matching does flatten the turned arm's ±3 dB level wobble. That leaves the 19 dB of buzz to tell it by, which is fair for a control.

I ran 12 trials in headless Chromium, answering "A" every time: 9 of 12, which the score by arm exposed (9 of 9 when X was A, 0 of 3 when it was B), and the verdict was "Not shown". **Note:** the coin toss isn't balanced. Six A and six B, shuffled, would hold an always-A answerer to exactly 6.

**Remake, exactly:** replace "sags up to 6.1 dB" in the caption, step 4's found text, the "worst sag" column and the blind test's prediction. Either use the played figures (worst halfway blend −1.0 dB, −1.65 over 40 draws; level ±3 dB against shipped), or keep the raw meter labelled as "the raw 50/50 blend of two keyframes, which a reader crossfading the seven systems directly would play; this table re-normalizes every frame". Steps 1–2 already show that raw crossfade honestly, and the mechanism is credited to [[1D Wavetable Scanning]] and [[2D Torus Wavetable Synthesizer]]. Nothing else needs to change.

### loop-smoothing/smoothing.png (gathered) — keep

The file is tracked. The caption says plainly that this is a second sweep problem not yet in the text, measured by the steward and waiting in the steward's tuning ledger (`Generative Wavetable Libraries — tuning.md:31`). It is an honest neighbour to the section, not a claim made for it.

## Offers

1. **Plan, "phonon partial spectrum" — confirmed, with its evidence disputed.** The page does overclaim, and the suggested rewording is right. But the case rests on `BUILD.md:33` and `generate.py:19–23`. The −4.6 / −109 dB measurement doesn't carry it: −109 is the meter's floor, which any stored cycle reaches, white noise included. The claim that measurement refutes ("rings inharmonically") is the generator's comment at `generate.py:58–60`, not the page's, and `generate.py:89–95` already admits the detune survives only as an edge discontinuity. Keep "traversal through symmetry space": the knob does order the systems by falling point-group symmetry.
2. **Open Questions, zero-phase or carry — confirmed.** On the raw meter, the sag is −0.34 (carried) against −0.08 dB (zero-phase). The buzz is −57.2 against −58.3 dB, through the project's `offnote_db`. Played, carrying changes per-frame level by up to 2.8 dB frame by frame (my count) and 2.45–2.57 dB per 46 ms window of the sweep, so "up to 2.5 dB" holds. The fundamental's carried phase stays 0. The offer's "−6.1 dB sag" for turned cycles has the same caveat as offer 3. Its conclusion holds on the buzz alone: alignment of start points is the policy that matters (+19.2 dB turned against +1.1 dB carried).
3. **Capability Assessment, the phase warning's numbers — disputed in part.** The buzz, +19.2 dB, is confirmed through the chain. The sag, "up to 6.1 dB, −3.2 to −7.8 over 40 draws", recomputes on the raw meter but is not what the crystal table plays. As built, the worst halfway blend is −1.0 dB (−1.65 to +0.04 over the 40 draws), and level wobbles ±3 dB against shipped. If the bullet gains numbers, they should be either the buzz alone, or the sag stated as "between stored frames crossfaded raw", since that is where arbitrary cycles would meet it.

## Checks run

- `conform.mjs`: 3 introduced, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `fingerprint.mjs`: Capability Assessment `862013a48934` and Plan `e64e0d9341cd`, both in step with `made_against`. Grain confirmed: the page opens at `##` only. Plan (page lines 123–150) holds Phase 1 and Phase 2 as `###`, and Capability Assessment (lines 106–119) holds What Requires Development.
- `check.py`, run against the owner's wavs: 39 ok, 0 failed. Its line 95 is a null that cannot fail (above).
- The face served with `rich-server.mjs`, in headless Chromium:
  - The console was clean.
  - No AudioContext existed before a click; one context per piece was running after clicking play.
  - After the page was hidden, all three were suspended and their play buttons reset.
  - The blind test ran 12 trials end to end.
- My own scripts (scratchpad):
  - the binomial;
  - off-harmonic share from the shipped crystal frames;
  - the audition recount at six windowings;
  - the fold-back;
  - played level and halfway blends for the three phase policies over 40 draws;
  - the ABX residual on offset grids, through the piece's engine in Node.
- Splice: nothing licensed copied. The only audio is the steward's own render.

## The face as a whole

It makes the page's ideas felt, not just busy. Each piece takes one sentence of the page and puts it where it could break: the knob, "monotonically", the phase warning. Two of them find something. The crystal knob shows the "phonon" knob is a sweep of partial count, roll-off and odd weight. Line up or not shows that carrying phase barely matters on this table and that start-point alignment is what does. Brighter all the way is the cleanest: a claim, a rule, a count, and a control that has to fail. The weak spots come from one habit, a number taken from a meter that doesn't sit where the listener sits. The −109 dB is a floor any cycle reaches. The 6.1 dB is a blend the table never plays, because its own generator re-normalizes every frame. Fix those two and the face is honest all the way through. Nobody has listened yet, and the blind test is ready for Loudon.
