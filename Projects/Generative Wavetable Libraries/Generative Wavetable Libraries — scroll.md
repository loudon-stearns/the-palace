---
title: "Generative Wavetable Libraries — scroll"
born: 2026-09-23
links:
  - target: "[[Generative Wavetable Libraries]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Generative Wavetable Libraries's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Generative Wavetable Libraries — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Generative Wavetable Libraries]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T12:43:42.519Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 18 · last ran 2026-10-14 (today)
- **Plan:** agreed 2026-09-25 (18 days ago) · 4 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — I turned 508 notes from music AIs into wavetables. The family chain glides a third time, but here Position means pure to reedy, not dull to bright. (`gwl-steward-047`)
- **Last commit touching this project:** 2026-10-14 `7487a7d5` — steward(Generative Wavetable Libraries): cycle 17 — SPINNING UP — cycle 17
- **Signal:** steady
- **Drift:** 9 cycles since the entry was last consolidated (cycle 9) — the entry body may lag; this scroll does not.

### Where this stands

This project turns a conversation into a wavetable for Serum, Vital, Ableton and Surge. Behind it are the crystal-lattice sweep and the Shepard dark-to-bright, both of which you heard work, plus a Floquet table. Earlier today I ran the chat interview on two big folders of AKWF cycles (122 FM, 142 organ). Both times a 'family chain' glided where the old dull-to-bright order lurched. Which order becomes the default is still your open question. This cycle starts the next part of the plan, widening the sources, with an audio AI's output. I didn't render anything new. The sister project, Generative Sample Libraries, had already rendered about 1600 MusicGen and Stable Audio notes and graded each…

### Open asks

- `gwl-steward-043` — directional_decision · posted 2026-10-14 · options: FAMILY-CHAIN · KEEP-CENTROID · WALK · FAMILIES-ONLY

### Answered, not yet consumed

_None._

### Decided

- `gwl-steward-040` — directional_decision → GRANTED — option_id=SCALE-UP (2026-06-25)
- `gwl-steward-037` — directional_decision → GRANTED — option_id=AKWF-IMPORT (2026-06-23)
- `gwl-steward-034` — directional_decision → GRANTED — option_id=FLOQUET (2026-06-23)
- `gwl-steward-031` — directional_decision → GRANTED — option_id=INTERVIEW-PIPELINE (2026-06-23)
- `gwl-steward-029` — sensory_verification → GRANTED — (no option_id); notes: "they all work very well, propose a major build" (2026-06-23)
- `gwl-steward-027` — directional_decision → GRANTED — option_id=VERIFY-IN-SYNTH; notes: "make it really easy to open the files in serum and ableton, open the folder and tell me exactly what you need tested and what I should be listening for
 " (2026-06-23)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A conversation that ends in a wavetable. Claude runs the interview, takes the cycles from anywhere (palace synthesis, captured audio, an audio AI), and writes a table that Serum, Vital, Ableton, Surge XT and hardware can load. Behind it: a table that sweeps the seven crystal lattice systems and one that opens a Shepard tone from dark to bright, both heard by Loudon in Serum and Ableton ("they all work very well," 2026-06-23), with the Serum writer matching a factory file byte for byte; and a third table built from the Floquet modes. The original plan went sources, then formats, then merging with the sample libraries. On 2026-06-23 Loudon put the chat interview first, as the next major build, and that is where the work is now.

**The moves ahead**

1. **Make the interview carry a real run.** The wavetable interview is drafted as a skill (`_ops/wavetable-libraries/skills/interview/SKILL.md`), a sibling to the sample-library one, with the same two rules: agree the conventions before any audio, and audition the smallest table before the batch. A six-cycle test on the AKWF single-cycle library went through in two turns. Next, as Loudon picked on 2026-06-25: run it on an AKWF pack of a hundred or more cycles, where sorting similar cycles has to do visible work and the defaults may break. The skill graduates once a source newer than the skill has gone through it end to end.
2. **Widen the sources.** Palace synthesis has given three tables and the AKWF packer covers captured audio. Still to come: an audio AI's output, and cycles a user brings.
3. **Finish the formats.** A writer for Surge XT's `.wt` binary format, which is documented in the Surge repository, and single-cycle exports for hardware and Eurorack. Serum and Ableton are done.
4. **Meet Generative Sample Libraries.** One conversation makes both a sample library and a wavetable from the same source synthesis, and the two projects share one interview layer.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Loudon's direction from the board, approved as orders on 2026-09-25:

- **Run in parallel with the [[2D Torus Wavetable Synthesizer]]**, with no shared boundary: this project's tables are its own artifacts, not an export layer for the Torus work (his `proceed_parallel` grant, 2026-05-27).
- **Make every file easy to open in Serum and Ableton, and say exactly what to test and what to listen for** (his note of 2026-06-23).
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="gwl-steward-047" -->
### 2026-10-14 — cycle 18 — I turned 508 notes from music AIs into wavetables. The family chain glides a third time, but here Position means pure to reedy, not dull to bright.
> shipped · 256-frame AI tables + per-family + per-instrument, Serum + Ableton · steward leans FAMILY-CHAIN

Cutting cycles from AI notes needed steps AKWF never did. For each of the 599 notes the grader called steady, I averaged 8 periods at the measured pitch and refined it per note. That kept the overtones: median fidelity 0.99, and the refinement moved pitch only 1 cent. 578 notes passed. The grader had tracked 78 notes too low: an octave (64), a twelfth (10), two octaves (3), even more (1). Those 'cycles' held several real periods and would sound high in a synth, so the extractor folds them back to one. 70 were exact duplicates (the probe re-graded some renders under several run names), which leaves 508. That's past Serum's 256 frames, so the main tables keep 256, each pick the cycle least like any already picked. Results: the old dull-to-bright order jumps on 210 of 255 steps by this source's own yardstick, the family chain on 24, the shortest walk on 26. Two things differ from AKWF. First, phase is mandatory. Cut cycles start anywhere, so the unaligned default dips to −20 dB mid-morph; with the same order lined up it dips only −2.6 dB. Second, brightness is the wrong axis. The AI's cycles are dark (median 90% of energy in the fundamental), so no order keeps 'turn it up, it gets brighter' (chain 0.34). The tilt that helped organs makes it worse (0.21). What the three families do separate is how much fundamental there is: pure (84%) to round (66%) to reedy (27%). That's the chain's honest sweep. The AI's instrument labels barely predict the sound (adjusted Rand 0.10). Marimba and flute collapse to near-sines once the attack and breath are gone, and violin carries the overtones. I also drafted the interview-skill changes from all three runs (cut-a-cycle steps, an AI-reuse path, answer the sweep question from the source, drop cut-to-64, family chain past about 24, always align phase). They're a file in my folder for an elder to land after you listen. BUILD.md says which file to drag where and what to listen for.

**Artifacts:**
- [start here: which file to drag into Serum or Ableton, and the five things to listen for.](Projects/Generative Wavetable Libraries/ai-cycles/BUILD.md)
- [the run written up: what AI notes needed, the four orders, what it says.](Projects/Generative Wavetable Libraries/ai-cycles/Generative Wavetable Libraries — proof — ai-cycles.md)
- [drafted interview-skill changes from all three big runs, for an elder to land after your ears.](Projects/Generative Wavetable Libraries/ai-cycles/interview-skill-proposed-changes.md)
- [family chain, 24 s sweep at A2: pure to reedy, the one I'd keep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_family_chain_audition_sweep.wav)
- [old dull-to-bright default, raw phase: listen for the flutter and hollow dips.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_centroid_audition_sweep.wav)
- [shortest walk: about as smooth as the chain, but no direction.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_walk_audition_sweep.wav)
- [chain tilted toward bright: doesn't help on this source.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_family_chain_tilted_audition_sweep.wav)
- [the 170 'violin' cycles on their own: the AI's richest material.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_violin_audition_sweep.wav)
- [all 256 cycles in chain order, coloured by family: sines first, then reedy.](Projects/Generative Wavetable Libraries/ai-cycles/contact_sheet_family_chain.png)
- [the same cycles in dull-to-bright order: the families scatter.](Projects/Generative Wavetable Libraries/ai-cycles/contact_sheet_centroid_order.png)
- [the tilted chain order.](Projects/Generative Wavetable Libraries/ai-cycles/contact_sheet_family_chain_tilted.png)
- [family chain, Serum/Vital/Surge (CLM, 256 × 2048).](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_family_chain.wav)
- [family chain, Ableton Wavetable (256 × 1024).](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_family_chain_ableton.wav)
- [old default, CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_centroid.wav)
- [old default, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_centroid_ableton.wav)
- [shortest walk, CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_walk.wav)
- [shortest walk, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_walk_ableton.wav)
- [tilted chain, CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_family_chain_tilted.wav)
- [tilted chain, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/ai_cycles_family_chain_tilted_ableton.wav)
- [family 1, pure (104 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family1_round-hollow.wav)
- [family 1, pure, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family1_round-hollow_ableton.wav)
- [family 1, pure, sweep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family1_round-hollow_audition_sweep.wav)
- [family 2, round (77 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family2_round-full.wav)
- [family 2, round, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family2_round-full_ableton.wav)
- [family 2, round, sweep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family2_round-full_audition_sweep.wav)
- [family 3, reedy (75 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family3_warm-nasal.wav)
- [family 3, reedy, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family3_warm-nasal_ableton.wav)
- [family 3, reedy, sweep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/families/ai_cycles_family3_warm-nasal_audition_sweep.wav)
- [asked-for violin (170 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_violin.wav)
- [asked-for violin, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_violin_ableton.wav)
- [asked-for choir (56 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_choir.wav)
- [asked-for choir, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_choir_ableton.wav)
- [asked-for choir, sweep: the one instrument where brightness tracks Position (0.79).](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_choir_audition_sweep.wav)
- [asked-for bass (40 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_bass.wav)
- [asked-for bass, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_bass_ableton.wav)
- [asked-for bass, sweep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_bass_audition_sweep.wav)
- [asked-for flute (93 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_flute.wav)
- [asked-for flute, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_flute_ableton.wav)
- [asked-for flute, sweep: near-sines, listen for whether it moves at all.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_flute_audition_sweep.wav)
- [asked-for marimba (56 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_marimba.wav)
- [asked-for marimba, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_marimba_ableton.wav)
- [asked-for marimba, sweep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_marimba_audition_sweep.wav)
- [asked-for struck marimba (56 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_marimba_hit.wav)
- [asked-for struck marimba, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_marimba_hit_ableton.wav)
- [asked-for struck marimba, sweep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_marimba_hit_audition_sweep.wav)
- [asked-for piano (37 frames), CLM.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_piano.wav)
- [asked-for piano, Ableton.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_piano_ableton.wav)
- [asked-for piano, sweep.](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_piano_audition_sweep.wav)
- [asked-for violin, sweep (also listed above).](Projects/Generative Wavetable Libraries/ai-cycles/tables/by-instrument/ai_cycles_asked_violin_audition_sweep.wav)
- [cuts one clean cycle from each graded AI note; about 2 min with /usr/local/bin/python3.](Projects/Generative Wavetable Libraries/ai-cycles/extract_ai_cycles.py)
- [dedupe, cut to 256, four orders, families, per-instrument tables; about 7 s.](Projects/Generative Wavetable Libraries/ai-cycles/pack_ai_tables.py)
- [extraction census: pass rates, folds, fidelity before and after refining.](Projects/Generative Wavetable Libraries/ai-cycles/extract.json)
- [every table number, labels-against-families counts, the aligned-default check.](Projects/Generative Wavetable Libraries/ai-cycles/metrics.json)

_Audio-AI cycles · 256 of 508 · same frames, four orders_
| order | big jumps (this source's yardstick, of 255) | big jumps (FM yardstick) | brighter as Position rises | worst mid-morph dip |
| --- | --- | --- | --- | --- |
| centroid (old default, raw phase) | 210 | 6 | 1.00 | −19.8 dB (−2.6 aligned) |
| shortest walk | 26 | 0 | 0.17 | −2.5 dB |
| family chain (pure → round → reedy) | 24 | 0 | 0.34 | −2.5 dB |
| family chain, tilted | 33 | 0 | 0.21 | −2.5 dB |

_Left rough:_ No one has heard any of it, and the CLM files pass a read-back check but haven't been loaded in Serum. Stable Audio gave only 9 steady notes, so this is really a MusicGen run. These notes were rendered for sample libraries, not wavetables, which likely explains why they're so dark. The intermediate cycles.npz (9 MB) isn't listed; the extractor rebuilds it in 2 minutes.

_Next moves named:_ Prompt an audio AI for wavetable material directly (static, sustained, bright, e.g. 'held synth tone, rich harmonics'), using the sister project's adapters. Then test whether that beats the near-sine cycles cut from instrument prompts. · Once you've listened (your open question on the big-folder order still stands), hand interview-skill-proposed-changes.md to an elder to land. With AKWF at scale and audio-AI cycles both through the interview, the tree held, which meets the skill's graduation test.
<sub>`gwl-steward-047` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-045" -->
### 2026-10-14 — cycle 17 — The family chain holds on a second folder: 142 organ cycles glide where dull-to-bright stutters. And the cut-over point is about 24 cycles, not 30.
> shipped · 15 organ tables + sweeps, Serum + Ableton · steward leans FAMILY-CHAIN, tilt as an interview question

Organs, by this folder's own standard for a big jump: the dull-to-bright default jumps on 76 of 141 steps, the family chain on 16, the shortest walk on 14. Three of the default's five worst steps join cycles whose brightness differs by under 9 Hz, the same failure as FM: one brightness number cannot tell organ registrations apart. My guess that organ cycles would be near-identical was wrong. No two are closer than 1, and the median gap is 76. The organs are tamer than the FM cycles, but not tame. The catch is that only three families formed (72 round, 58 warm, 12 bright-nasal). The big first family is walked without regard to brightness, so 'turn it up, it gets brighter' drops to 0.74, against 0.90 on FM. A tilt pulls each family's walk toward dull-to-bright. On organs it brings brightness back to 0.84 for one extra jump. On FM it does nothing useful, so it's a dial, not a default. Threshold test, using random subsets of both folders, 20 draws per size: from 24 cycles up, the chain has fewer jumps in 20 of 20 draws in both folders; below 16 it's close to a coin toss. What I'd change in the interview: default to the chain past about 24 cycles, and add one question before any audio: 'should turning Position up always mean brighter, or is smoothness worth more?' Also check that a folder is fully downloaded first. I didn't edit the skill, because it lives outside my folder and should wait on your ears. BUILD.md says exactly which file to drag where and what to listen for.

**Artifacts:**
- [start here: which file to drag into Serum or Ableton, and what to listen for.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/BUILD.md)
- [the run written up: organ numbers, the threshold test, the tilt, proposed interview changes.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/Generative Wavetable Libraries — proof — akwf-scale-up-eorgan.md)
- [tilted chain, 24 s sweep at A2: the one I'd keep for organs.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_family_chain_tilted_audition_sweep.wav)
- [plain family chain, 24 s sweep: glides, two seams, brightness looser.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_family_chain_audition_sweep.wav)
- [old default, 24 s sweep: listen for the stutter.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_centroid_audition_sweep.wav)
- [shortest walk, 24 s sweep: smoothest, brightness wanders.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_walk_audition_sweep.wav)
- [all 142 organ cycles in chain order, coloured by family.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/contact_sheet_family_chain.png)
- [the same cycles in dull-to-bright order: the colours scatter.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/contact_sheet_centroid_order.png)
- [the shortest-walk order.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/contact_sheet_walk_order.png)
- [tilted chain, Serum/Vital/Surge (CLM, 142 × 2048).](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_family_chain_tilted.wav)
- [tilted chain, Ableton (142 × 1024).](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_family_chain_tilted_ableton.wav)
- [family chain, CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_family_chain.wav)
- [family chain, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_family_chain_ableton.wav)
- [old default, CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_centroid.wav)
- [old default, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_centroid_ableton.wav)
- [shortest walk, CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_walk.wav)
- [shortest walk, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/akwf_eorgan_walk_ableton.wav)
- [family 1, round (72 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family1_round-full.wav)
- [family 1, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family1_round-full_ableton.wav)
- [family 1 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family1_round-full_audition_sweep.wav)
- [family 2, warm (58 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family2_warm-full.wav)
- [family 2, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family2_warm-full_ableton.wav)
- [family 2 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family2_warm-full_audition_sweep.wav)
- [family 3, bright-nasal percussion drawbars (12 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family3_bright-nasal.wav)
- [family 3, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family3_bright-nasal_ableton.wav)
- [family 3 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/tables/families/akwf_eorgan_family3_bright-nasal_audition_sweep.wav)
- [every organ number, plus each family's members in table order and the 12 skipped files.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/metrics.json)
- [the subset-size test and the tilt sweep, both folders.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/threshold_and_tilt.json)
- [the scale-up made folder-agnostic (--tag cello etc.); reuses the FM script's functions.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/scale_up_folder.py)
- [the threshold and tilt experiments; ~10 s with /usr/local/bin/python3.](Projects/Generative Wavetable Libraries/akwf-scale-up-eorgan/threshold_and_tilt.py)

_AKWF_eorgan · 142 cycles · same frames, four orders_
| order | big jumps (this folder's yardstick, of 141) | big jumps (FM yardstick) | brighter as Position rises | worst mid-morph dip |
| --- | --- | --- | --- | --- |
| centroid (old default) | 76 | 12 | 1.00 | −4.1 dB |
| shortest walk | 14 | 3 | 0.38 | −2.7 dB |
| family chain | 16 | 2 | 0.74 | −2.7 dB |
| family chain, tilted | 17 | 1 | 0.84 | −2.7 dB |

_Left rough:_ No one has heard any of it, and the CLM files pass a read-back check but haven't been loaded in Serum. 12 of the 154 organ cycles are online-only in Dropbox and wouldn't download, so the run skipped them. The families also shift a little between runs: with fewer restarts the FM chain came out at 17 jumps and 0.85, not 14 and 0.90.

_Next moves named:_ Once you've listened (your open question from earlier today), draft the interview-skill change: family chain past about 24 cycles, a 'brighter or smoother?' convention question that sets the tilt, a downloaded-folder check, a pinned seed. Hand it to an elder to land. · Then call the interview's big-folder test done and start on the next part of the plan, widening the sources: a folder of cycles from an audio AI, put through the same interview.
<sub>`gwl-steward-045` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-043" -->
### 2026-10-14 — cycle 16 — Three orders of the same 122 FM cycles. Should the family chain become the interview's default for big folders?
> still working · three 24 s sweeps ready · steward leans FAMILY-CHAIN

Catch-up: this project turns a chat into a wavetable for Serum and Ableton. In June you asked me to try the interview on a real AKWF folder of 100+ cycles. I ran it on AKWF_fmsynth (122 cycles). The old default sorts dull to bright, and it jumps between unlike cycles on 50 of its 121 steps. The shortest smooth path fixes the jumps but loses the 'turn it up, it gets brighter' meaning. The family chain groups the cycles into five families, darkest first, and walks smoothly inside each one. It keeps most of both: 14 jumps, 0.9 brightness. Those are numbers, not ears, so the three sweeps below are the test. Pick one and I write that into the interview as the default for folders over about 30 cycles. Either way I keep working; next is a folder of near-identical organ cycles.

**Artifacts:**
- [family chain: glides within each family, four seams, brightens overall.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_family_chain_audition_sweep.wav)
- [old default: brightens steadily, lurches often.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_centroid_audition_sweep.wav)
- [shortest walk: smoothest, brightness wanders.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_walk_audition_sweep.wav)
- [to try them in Serum or Ableton instead: which file to drag where.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/BUILD.md)
<sub>`gwl-steward-043` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-042" -->
### 2026-10-14 — cycle 16 — I ran the interview on all 122 AKWF FM cycles. The dull-to-bright default lurches, so I built a family chain that glides and still brightens.
> shipped · 9 tables, Serum + Ableton, each with a sweep to listen to · steward leans FAMILY-CHAIN

Same 122 cycles in every table; only the order of the frames changes. CENTROID, the old default (dull to bright by one brightness number): 50 big jumps, brightness follows Position perfectly (1.0). Four of its five worst steps join cycles whose brightness differs by 1 to 32 Hz but whose spectra are far apart. One number can't tell 122 FM spectra apart. WALK, the shortest smooth path through all 122: 13 big jumps, but brightness only loosely follows Position (0.36), so the knob loses its meaning. FAMILY CHAIN: k-means picked five soft families (54 round, 36 bright, 10 nasal, 10 hollow, 12 glassy). They are chained darkest first, and each family is walked smoothly inside. Result: 14 big jumps and 0.90 brightness, nearly as smooth as the walk and nearly as meaningful as centroid. Each family also comes out as its own small table. Phase: rotating each frame to line up with its neighbour halves the worst mid-morph dip (−4.5 to −2.2 dB). No table dips below −6 dB, though, so ordering was the real problem, not phase. Two changes for the interview: past about 30 cycles, the default becomes 'chain the families', and the skill's 'cut to 64 cycles' default should go, since Serum and Ableton read 256 frames. BUILD.md says exactly what to open and what to listen for.

**Artifacts:**
- [start here: which file to drag where, and what to listen for.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/BUILD.md)
- [the run written up: the dialogue, the numbers, what the interview should change.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/Generative Wavetable Libraries — proof — akwf-scale-up.md)
- [all 122 cycles in family-chain order, coloured by family.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/contact_sheet_family_chain.png)
- [the same cycles in the old dull-to-bright order: the colours scatter.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/contact_sheet_centroid_order.png)
- [the shortest-walk order.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/contact_sheet_walk_order.png)
- [every number, plus each family's members in table order.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/metrics.json)
- [the build script; reruns in about 3 s with /usr/local/bin/python3.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/scale_up.py)
- [family chain, 24 s sweep at A2: the one I'd keep.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_family_chain_audition_sweep.wav)
- [old default, 24 s sweep at A2: listen for the lurches.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_centroid_audition_sweep.wav)
- [shortest walk, 24 s sweep at A2: smooth, but brightness wanders.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_walk_audition_sweep.wav)
- [family chain, Serum/Vital/Surge (CLM, 122 × 2048).](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_family_chain.wav)
- [family chain, Ableton Wavetable (122 × 1024).](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_family_chain_ableton.wav)
- [old default, Serum/Vital/Surge (CLM).](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_centroid.wav)
- [old default, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_centroid_ableton.wav)
- [shortest walk, Serum/Vital/Surge (CLM).](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_walk.wav)
- [shortest walk, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/akwf_fmsynth_walk_ableton.wav)
- [family 1, round (54 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family1_round-full.wav)
- [family 1, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family1_round-full_ableton.wav)
- [family 1 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family1_round-full_audition_sweep.wav)
- [family 2, bright (36 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family2_bright-full.wav)
- [family 2, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family2_bright-full_ableton.wav)
- [family 2 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family2_bright-full_audition_sweep.wav)
- [family 3, nasal, even harmonics (10 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family3_warm-nasal.wav)
- [family 3, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family3_warm-nasal_ableton.wav)
- [family 3 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family3_warm-nasal_audition_sweep.wav)
- [family 4, hollow, odd harmonics, clarinet-ish (10 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family4_bright-hollow.wav)
- [family 4, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family4_bright-hollow_ableton.wav)
- [family 4 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family4_bright-hollow_audition_sweep.wav)
- [family 5, glassy (12 frames), CLM.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family5_glassy-full.wav)
- [family 5, Ableton.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family5_glassy-full_ableton.wav)
- [family 5 sweep.](Projects/Generative Wavetable Libraries/akwf-scale-up-fmsynth/tables/families/akwf_fmsynth_family5_glassy-full_audition_sweep.wav)

_AKWF_fmsynth · 122 cycles · same frames, three orders_
| table | big jumps (of 121) | average step | brighter as Position rises | worst mid-morph dip |
| --- | --- | --- | --- | --- |
| centroid (old default) | 50 | 83.7 | 1.00 | −4.4 dB |
| shortest walk | 13 | 50.9 | 0.36 | −2.2 dB |
| family chain | 14 | 53.5 | 0.90 | −2.9 dB |

_Left rough:_ Only the numbers say the family chain is better; no one has heard it. The CLM files pass a read-back check but haven't been loaded in Serum. The families are soft (silhouette 0.23), and family 1's 'round' label fits only its first half. The skill text is unchanged because it lives outside my folder and should wait on your ears.

_Next moves named:_ Run the same pipeline on a second, very different AKWF folder (AKWF_eorgan, 154 near-identical organ cycles) to test whether the 30-cycle threshold and the family chain still hold when the cycles are similar instead of wild. · Once you've listened, draft the interview-skill change (family chain as the default past about 30 cycles; drop the cut-to-64 default) and hand it to an elder to land.
<sub>`gwl-steward-042` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-47-19-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the entry's development plan

Carried over on 2026-09-25 from the Development Plan in [[Generative Wavetable Libraries]], when plans moved into scrolls (SCHEMA v1.25). The crystal lattice table and the Shepard brightness table are done and stay in the entry; the Serum and Ableton formats are done and were dropped. The chat interview was not in the entry's plan: it is written in first because Loudon chose it as the next major build on 2026-06-23 (grant on gwl-steward-031) and chose its next step on 2026-06-25 (grant on gwl-steward-040). Phase numbers were replaced by names.
<sub>`plan-2026-09-25T20-47-19-04-00` · plan agreed · agreed 2026-09-25T20:47:19-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-039" -->
### 2026-06-23 — cycle 14 — AKWF fit-test shipped — branch 1.b carries an end-to-end run in two user turns

Catch-up: this project is the chat-driven wavetable generator (sister to Generative Sample Libraries). Phase 1 (Crystal Bravais) and the first Phase 2 proof (Shepard CENTROID-FREQ) have both shipped; the AKWF Import Pipeline is the captured-audio source path, recovered into the bundle on 2026-05-30. This cycle is the fit-test you green-lit: drive an AKWF pack through the interview's question tree and see whether branch 1.b (captured-audio source) can carry a real run on its defaults.

What shipped: a proposed canonical [question tree](open:Projects/Generative Wavetable Libraries/akwf-import-pipeline/fit-test-2026-06-23/FIT-TEST.md) — Q1 source archetype → if 1.b, Q2 curate? / Q3 Position meaning? / Q4 target synth? — with the captured-audio defaults nailed down (2.a · 3.a · 4.a). A two-turn user dialogue exercising those defaults, plus the rendered output: [akwf_fit_test_6frame_ableton.wav](open:Projects/Generative Wavetable Libraries/akwf-import-pipeline/fit-test-2026-06-23/akwf_fit_test_6frame_ableton.wav), 6 frames × 1024 samples, Ableton-ready. The tree, default-walked, lands on the same artifact the packer already proves — that's the fit-test passing.

Findings: branch 1.b is short by design — three implicit defaults compress to two user turns, and they're honest (centroid-ordering is the right Position meaning on AKWF-shaped libraries because centroid and flatness collapse). Override surface (Serum target, clustering first, hand-pick) is reachable at every branch but never demanded. The longer game is Q0 — Claude inferring the archetype from the sound description and routing into 1.a/1.b/1.c silently.

**Artifacts:**
- [the question tree + dialogue transcript + frame-order table.](Projects/Generative Wavetable Libraries/akwf-import-pipeline/fit-test-2026-06-23/FIT-TEST.md)
- [6-frame Ableton wavetable, dull→bright by centroid — open in Ableton's Wavetable oscillator.](Projects/Generative Wavetable Libraries/akwf-import-pipeline/fit-test-2026-06-23/akwf_fit_test_6frame_ableton.wav)
<sub>`gwl-steward-039` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-036" -->
### 2026-06-23 — cycle 13 — Floquet Modes — Interview graduating-run record shipped

Cycle 13 ships the **graduating-run record** that closes the FLOQUET grant. The wavetable-Interview SKILL.md emitted in cycle 12 has now been driven against a real source: Floquet Modes walked through all six branches of the question tree (source · sweep spine · format · frame count · phase policy · audition pitch), every answer slotting cleanly with no restructuring. The record names the spine as *pure sine → dense Bessel sideband comb* and shows why that one sentence earned its rank as the rule-1 sweep semantic — without it the Floquet build would be a Bessel curiosity, not an instrument.

The fit is retroactive — the bundle predated the skill — so the skill's status moves from *first emission* to *first graduating run completed*, but promotion to `/skills/wavetable-library-interview/` still wants one fresh, non-retroactive run.

[INTERVIEW.md](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Wavetable%20Libraries/floquet-modes/INTERVIEW.md) · [SKILL.md](obsidian://open?vault=The%20Palace&file=_ops/wavetable-libraries/skills/interview/SKILL.md)

**Artifacts:**
- [the graduating-run record — six branches walked retroactively.](Projects/Generative Wavetable Libraries/floquet-modes/INTERVIEW.md)
- [the wavetable-Interview skill, status now *first graduating run completed*.](_ops/wavetable-libraries/skills/interview/SKILL.md)
- [the audition sweep the Interview's rule-2 gate would have asked for (8s @ 110Hz, Position 0→1).](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes_audition_sweep.wav)
<sub>`gwl-steward-036` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-033" -->
### 2026-06-23 — cycle 12 — The Interview front door for wavetables now exists — a sibling to the sample-library Interview, shaped for frame-sweep questions.
> shipped · project-local skill · six-branch question tree · two gates inherited from the sister project

Quick catch-up: Generative Wavetable Libraries is the chat-driven wavetable generator (Serum/CLM, Ableton, Surge XT, single-cycle). Phase 1 (Crystal Bravais — 7 Bravais lattices swept) and Phase 2's first proof (Shepard CENTROID-FREQ — spectral centroid sweep) both shipped and Loudon accepted them. The forward vector calls for Claude to *conduct* the wavetable interview; cycle 11 asked which way to push next; this cycle's grant said INTERVIEW-PIPELINE — build the chat-driven layer.

What shipped this cycle: a project-local Interview SKILL paralleling the sister GSL one. Six question branches (source · sweep semantic · target format · frame count · phase policy · interpolation policy), two hard gates (convention agreement before any audio, audition of the smallest representative artifact before the full batch), defaults grounded in the two patterns already accepted (Crystal Bravais @64 frames + Shepard CENTROID-FREQ @256 frames), CLM/Ableton/Surge/single-cycle target spec, BUILD.md convention, the Talking Keyboard 352-file lesson named as tuition.

It is intentionally a draft — promotion to /skills/wavetable-library-interview/ waits for one fresh end-to-end run through it on a source that didn't exist before the skill (Floquet modes, captured audio, or an AI sub-agent). Crystal Bravais and Shepard CENTROID-FREQ do not count retroactively; that is the discipline the sister project earned.

The file: [_ops/wavetable-libraries/skills/interview/SKILL.md](obsidian://open?vault=The%20Palace&file=_ops/wavetable-libraries/skills/interview/SKILL.md).

**Artifacts:**
- [wavetable-library-interview SKILL — six branches, two gates, draft until one fresh end-to-end run promotes it.](_ops/wavetable-libraries/skills/interview/SKILL.md)
<sub>`gwl-steward-033` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-029" -->
### 2026-06-23 — cycle 10 — Two wavetables, two synths, four loads. Do Crystal Bravais and Shepard CENTROID-FREQ read correctly in Serum and Ableton?
> paused on your ears · Finder open · per-file links + steps below · no lean — your verdict picks the next direction

Quick catch-up: this project is the chat-driven wavetable generator. Phase 1 (Crystal Bravais — sweep through the 7 Bravais crystal lattice systems) and Phase 2's first proof (Shepard CENTROID-FREQ — sweep moves spectral centroid from dark to bright on one note) both shipped and were accepted on measurement, but never auditioned in their target synths. Until you hear them in Serum and Ableton, I cannot tell whether the CLM chunk writer is actually valid or whether the Ableton 1024-sample framing reads as intentional motion. The next direction (build the interview pipeline, do AKWF-scale generation, refactor the forge) all assume the renders are sound, so I am sitting on my hands until your ears confirm. Each file below has an [open] link (reveals in Finder · double-click into the synth) and the exact load steps + what to listen for. Report back per-file PASS / OFF (and how it is off) / FAIL.

**Artifacts:**
- [Crystal Bravais — Serum/CLM (2048-sample frames, 256 frames, CLM chunk).](Projects/Generative Wavetable Libraries/crystal-bravais/crystal_bravais.wav)
- [Crystal Bravais — Ableton (1024-sample frames concatenated).](Projects/Generative Wavetable Libraries/crystal-bravais/crystal_bravais_ableton.wav)
- [Shepard CENTROID-FREQ — Serum/CLM (2048-sample frames).](Projects/Generative Wavetable Libraries/shepard-centroid/shepard_centroid.wav)
- [Shepard CENTROID-FREQ — Ableton (1024-sample frames).](Projects/Generative Wavetable Libraries/shepard-centroid/shepard_centroid_ableton.wav)
- [Shepard CENTROID-FREQ — bench audition (pre-rendered linear sweep, single sustained note).](Projects/Generative Wavetable Libraries/shepard-centroid/shepard_centroid_audition_sweep.wav)
- [floquet_modes_audition_sweep.wav](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes_audition_sweep.wav)
- [floquet_modes.wav](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes.wav)
- [floquet_modes_ableton.wav](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes_ableton.wav)

_Load + listen — four tests_
| Test | File | Synth | Load steps | What to listen for |
| --- | --- | --- | --- | --- |
| 1 · Crystal in Serum | crystal_bravais.wav | Serum 2 | New patch · drag the WAV onto Osc A's wavetable display. Set Warp = OFF, Unison = 1, hold middle C. Slowly turn the Wavetable Position knob (WT POS) from 0 to 100%. | Seven distinct timbral regions as you sweep — should feel like traveling through related-but-different lattices. Position 0 = simplest (cubic, few partials, almost square-ish). Position 100% = most complex (triclinic, dense partial bed). No clicks/pops/zipper noise between frames (zero-phase reset is in). |
| 2 · Crystal in Ableton | crystal_bravais_ableton.wav | Ableton Wavetable | New Wavetable device · drag the WAV onto Oscillator 1's visualizer (the round table). Effects bypassed, Sub off, Filter off. Hold C3. Slowly automate or knob the Position parameter 0 → 100%. | Same 7-step journey as Serum. Compared to Serum's render this is the half-resolution (1024-sample) version — should sound similar in character. If Ableton refuses the file or reads it as a single sample (no frames), that is a FAIL on the 1024-sample framing. |
| 3 · Shepard in Serum | shepard_centroid.wav | Serum 2 | New patch · drag onto Osc A. Warp OFF, Unison 1, hold a sustained note (try A3 or C4). Sweep WT POS from 0 → 100% over ~4 seconds. | ONE sustained note that monotonically brightens — not a crossfade between two sounds, not octave jumps. Pitch stays put, only spectral centroid climbs. At 0 the cloud feels dark/woody; at 100% it feels glassy/airy. If you hear pitch change or a discrete swap, the sweep is broken. |
| 4 · Shepard in Ableton | shepard_centroid_ableton.wav | Ableton Wavetable | Same as test 2 but with this file. Hold a sustained note. Automate Position 0 → 100%. | Same monotonic brightening on one note. The 1024-sample version of the same sweep — should be character-equivalent to Serum's. Watch for whether Ableton's interpolation between frames sounds smooth or stepped. |
<sub>`gwl-steward-029` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-027" -->
### 2026-06-23 — Three wavetables now generate and byte-verify, but none has ever been opened in a real synth. Which is the next big step?
> still working · 3 sources shipped · I lean VERIFY-IN-SYNTH (only you can do it)

Catch-up: Generative Wavetable Libraries turns palace synthesis into deployable wavetables. Three source archetypes now exist and ship clean files — algorithmic (Crystal Bravais), palace-reuse (Shepard), and the brand-new Floquet sideband one above. The export writers (Serum/CLM, Ableton, Surge .wt) are all verified byte-for-byte against a factory fixture. The honest gap: I'm a text agent, so 'verified' has always meant byte-level — not one of these has actually been loaded and swept in a real synth. Four ways forward, different costs: VERIFY-IN-SYNTH (you open all three in Serum/Ableton/Surge and confirm they sweep right — ~15 min, only you have the DAWs+ears, de-risks everything downstream); INTERVIEW-PIPELINE (build the chat-driven generator the vector names — my labor + one alignment chat); AKWF-FULL-SCALE (scale the import path to the full library — needs the library on disk + a grouping call); FORGE-REFACTOR (unify the 3 generators behind one core — pure cleanup, my labor only). I lean VERIFY-IN-SYNTH: everything else assumes the files truly load, and that's the one thing I can't check myself. The project keeps moving headless whichever you pick or if you ignore this.

**Artifacts:**
- [what shipped this cycle: the Floquet Modes audition sweep.](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes_audition_sweep.wav)
<sub>`gwl-steward-027` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gwl-steward-026" -->
### 2026-06-23 — enrichment card

SHIPPED — Floquet Modes wavetable, the second algorithmic source (NEW-SOURCE grant, gwl-steward-024). Quick catch-up: this project generates custom wavetables for Serum/Ableton/Surge from palace synthesis. Crystal Bravais (lattice symmetry) and Shepard (centroid cloud) already shipped + accepted. This one sweeps the modulation depth of a time-periodic / parametric (Floquet) oscillator: Position 0 is a bare sine, Position 1 is a dense Bessel sideband comb — one note blooms from sine to buzz, punctuated by authentic FM 'carrier nulls' where the fundamental briefly hollows out (its distinct signature vs the other two). Rendered in Ableton + Serum/CLM from one run; the Serum file's chunk layout matches the factory fixture byte-for-byte. The first artifact below is the listenable 8-second sweep — Position scanned 0->1 at A2.

**Artifacts:**
- [the listenable proof — 8s @ 110 Hz, Position swept 0->1. Hear the bloom + the carrier-null hollows around the thirds of the sweep.](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes_audition_sweep.wav)
- [floquet_modes.wav — Serum/CLM (also Vital, Surge XT, Pigments, Phase Plant, Falcon). 64 frames x 2048.](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes.wav)
- [floquet_modes_ableton.wav — Ableton Wavetable fallback. 64 frames x 1024.](Projects/Generative Wavetable Libraries/floquet-modes/floquet_modes_ableton.wav)
<sub>`gwl-steward-026` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
