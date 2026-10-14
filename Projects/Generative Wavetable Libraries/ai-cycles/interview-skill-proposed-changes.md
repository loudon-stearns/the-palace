# Proposed changes to the wavetable interview skill

Drafted by the Generative Wavetable Libraries steward, cycle 18 (2026-10-14), for an elder to land in `_ops/wavetable-libraries/skills/interview/SKILL.md` once Loudon has listened. Evidence: three big-folder runs, AKWF_fmsynth (122), AKWF_eorgan (142) and audio-AI cycles (508 → 256), each in its own folder in this bundle with a BUILD.md and a proof.

This is not an entry. No `type:` on purpose.

## 1. Branch 1, "Captured audio": say how a cycle is cut, and add an AI-reuse path

Replace the captured-audio follow-up with:

> Captured audio: a folder of single-cycle WAVs (AKWF-style) or of held notes. For held notes, cut one cycle per note by averaging 8 periods at the measured pitch, refined ±30 cents per note; fold any window whose spectrum has only every m-th harmonic (the tracker read m× low); gate on cleanness ≥ 0.9 and overtone fidelity ≥ 0.5. Reference: `Projects/Generative Wavetable Libraries/ai-cycles/extract_ai_cycles.py`.

Add to the "AI audio sub-agent" follow-up:

> First ask whether graded renders already exist (e.g. the Generative Sample Libraries AI-source probe). Reuse beats re-rendering. If rendering fresh, prompt for wavetable material (static, sustained, bright), not for instrument notes; instrument prompts come back dark and near-sine once cut to one cycle.

## 2. Branch 2, the sweep semantic: answer it from the source

Add:

> For a folder of found cycles, measure before proposing an axis. "Dull to bright" is only honest when brightness actually varies (AKWF FM, organs). On dark sources (audio-AI cycles) the families separate by how much fundamental there is: "pure to reedy." Then ask one question before any audio: **should turning Position up always mean [the axis], or is smoothness worth more?** The answer sets the tilt (0 for smoothness; 0.5 helped organs and hurt the other two).

## 3. Branch 4, frame count: drop the cut-to-64 default

Replace "64 frames if ≤64 sources else cluster into 64 representative cycles" with:

> Keep every cycle up to 256 (Serum and Ableton read 256). Past 256, pick by farthest point (each pick the cycle least like any already picked) after dropping exact duplicates (timbre distance < 1).

## 4. Ordering default for found cycles

Add a branch or default:

> Past about 24 cycles, order by **family chain**: k-means families (k by silhouette, 3–8), darkest first, each walked smoothly inside. In random subsets from 24 cycles up it beat dull-to-bright in 20 of 20 draws on both AKWF folders. On all three sources it was about as smooth as the shortest walk. Offer per-family tables alongside. Below about 16 cycles, plain dull-to-bright is fine.

## 5. Branch 5, phase: neighbour alignment, not zero-phase reset, for found cycles

Replace the captured-audio note "Zero-phase reset because…" with:

> Rotate each frame to best match its neighbour (circular cross-correlation). Mandatory for cycles cut from notes: unaligned, audio-AI cycles dipped −20 dB mid-morph; aligned, −2.6 dB.

## 6. Housekeeping defaults

> Check the source folder is fully downloaded (12 Dropbox online-only files refused to read on eorgan). Pin the k-means seed and record it in BUILD.md (families shift a little between runs).

## 7. Graduation

The skill's graduation test is a fresh source driven end to end without restructuring the question tree. AKWF at scale and audio-AI cycles both went through. The tree held. These changes add defaults and follow-ups; no branch was removed or reordered. Once Loudon's ears agree, I'd call the graduation criterion met.
