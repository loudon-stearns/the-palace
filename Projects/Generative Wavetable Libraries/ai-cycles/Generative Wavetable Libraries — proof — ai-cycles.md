---
title: "Generative Wavetable Libraries — proof — ai-cycles"
born: 2026-10-14
---

# Proof: the interview on an audio AI's output

**Question.** The plan's next move widens the sources: after palace synthesis and captured audio (AKWF), an audio AI's output. Can the wavetable interview take AI-rendered notes end to end, and do the two AKWF findings (family chain past about 24 cycles; a "brighter or smoother?" question) still hold?

**Run.** I reused, read only, the 599 steady notes the Generative Sample Libraries AI-source probe had already rendered (MusicGen melody and text, Stable Audio) and graded for pitch. `extract_ai_cycles.py` pulls one cycle per note. `pack_ai_tables.py` reuses the AKWF scale-up functions unchanged.

## What this source needed that AKWF didn't

| step | why | what it did here |
|---|---|---|
| cut one cycle from a held note | AI gives 6 s notes with breath and reverb, not cycles | 8 periods averaged at the measured pitch; 578 of 599 pass |
| refine the period per note | a few cents off would smear the overtones out of the average | median shift 1 cent; overtones kept (median fidelity 0.99) |
| fold multi-period windows | the grader's tracker read 78 notes an octave to 2+ octaves low | 64 ×2, 10 ×3, 3 ×4, 1 ×5 folded to one period |
| drop exact duplicates | the probe re-graded some renders under several run names | 70 dropped → 508 |
| cut to 256 | Serum's limit | farthest-point pick: least-like-what's-picked first |
| **always align phase** | cut cycles start anywhere; AKWF cycles start at zero | unaligned default dips −20 dB; aligned, −2.6 dB |

## The four orders (256 cycles)

| order | big jumps, this source's yardstick (of 255) | big jumps, FM yardstick | brighter as Position rises | worst mid-morph dip |
|---|---|---|---|---|
| centroid (old default, raw phase) | 210 | 6 | 1.00 | −19.8 dB |
| shortest walk | 26 | 0 | 0.17 | −2.5 dB |
| family chain | 24 | 0 | 0.34 | −2.5 dB |
| family chain, tilted 0.5 | 33 | 0 | 0.21 | −2.5 dB |

## What it says

1. **The chain holds a third time on smoothness.** Third source, third time the family chain is about as smooth as the shortest walk and far smoother than dull-to-bright.
2. **But here "brighter" is the wrong axis.** The AI's cycles are dark: median 90% of the energy in the fundamental. Brightness barely varies, so no order keeps "turn it up, it gets brighter" without lurching. The tilt that helped organs makes this worse. What the families *do* separate is how much fundamental there is: pure 84% → round 66% → reedy 27%. So the chain's honest sweep semantic is "pure to reedy." The interview's sweep question has to be answered from the source, not assumed.
3. **The AI's labels don't predict the sound.** Asked-for instrument against found family: adjusted Rand 0.10, close to no relation. Marimba and flute collapse to near-sines once the attack and breath are gone. Violin (and some choir) carries the overtones. Per-instrument tables are offered, but sound-based families are the better default grouping.
4. **Phase alignment is mandatory for cut cycles.** It was a nicety on AKWF (−4.4 → −2.2 dB). Here it is the difference between −20 dB holes and none.

## Proposed interview changes

Drafted as `interview-skill-proposed-changes.md` in this folder, for an elder to land once Loudon has listened.

## Left rough

Nobody has heard any of it, and the CLM files pass a read-back check but haven't been loaded in Serum. Stable Audio gave only 9 steady notes, so this is really a MusicGen run. The source was rendered for sample libraries, not for wavetables. Prompting an AI for wavetable material (bright, static, sustained) would likely give richer cycles. That is the next probe. Families are soft (silhouette 0.20).
