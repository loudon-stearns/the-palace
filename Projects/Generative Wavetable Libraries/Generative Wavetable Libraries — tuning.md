---
title: "Generative Wavetable Libraries — tuning"
born: 2026-10-28
links:
  - target: "[[Generative Wavetable Libraries]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Generative Wavetable Libraries's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Generative Wavetable Libraries about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Generative Wavetable Libraries — tuning

What Generative Wavetable Libraries's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-10-28, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 19 — 2026-10-28

1. Measure a sweep, not just a held frame: a table can be clean frame by frame and still buzz in motion, because big jumps between neighbours repeat at the sweep's frame rate and land 4 to 15 Hz either side of every harmonic. *(offered by the steward, cycle 19)*
2. **Proposed for canon** · 2026-10-28 · [[Generative Wavetable Libraries]] · § What Requires Development, new bullet after 'Phase coherence across frames' · superseded by item 6 *(proposed by the steward, cycle 19)*
   Why: the page names phase coherence as the open frame-to-frame problem, and this is the second one, found from Loudon's buzz note
   Path: `Projects/Generative Wavetable Libraries.md`
   > - **Smoothness along Position**: a table can be clean frame by frame and still buzz when swept, if neighbouring frames differ a lot. Each jump is a corner in the crossfade, repeated at the sweep's frame rate. A one-frame Gaussian blur across neighbours (on aligned frames) cut that buzz 10 to 18 dB on the family chains (2026-10-28, `loop-smoothing/`). Whether it becomes the packers' default waits on Loudon's ears.

- run · 2026-10-28 · cycle 19 · taught item 1, proposed item 2 for canon

## From cycle 20 — 2026-10-28

3. When one cycle is exported at several lengths, choose its start point once on the full-length version and keep it at every length. Several zero crossings can rise almost equally steeply, so picking afresh at each length can rotate the same sound by up to half a cycle. *(offered by the steward, cycle 20)*
4. **Proposed for canon** · 2026-10-28 · [[Generative Wavetable Libraries]] · § Single-Cycle Waveforms, a new last sentence · canon change owed *(proposed by the steward, cycle 20)*
   Why: the page lists single cycles as a format family with nothing built, and now there is a tested writer for it
   Path: `Projects/Generative Wavetable Libraries.md`
   > An exporter exists: `single-cycle/export_single_cycles.py` writes any cycle at 2048, 600 and 256 samples. Each file is cut in the spectrum, starts on a zero crossing, and carries its loop and root note in the file. It has run on the crystal, Floquet and Shepard tables (2026-10-28). Nobody has heard these files or loaded them on hardware yet.

- run · 2026-10-28 · cycle 20 · taught item 3, proposed item 4 for canon

## From cycle 21 — 2026-11-15

5. Rotate frames into line before blurring them along Position: on an unaligned table (the centroid orders) the blur alone would cancel, and with alignment it fixed the worst table of all (AI centroid, −5.6 → −32.1 dB of buzz). *(offered by the steward, cycle 21)*
6. **Proposed for canon** · 2026-11-15 · [[Generative Wavetable Libraries]] · § What Requires Development, new bullet after 'Phase coherence across frames' · canon change owed *(proposed by the steward, cycle 21)*
   Why: Loudon decided the open question in item 2: the blur is now the default and every packed table carries it
   Path: `Projects/Generative Wavetable Libraries.md`
   > - **Smoothness along Position**: a table can be clean frame by frame and still buzz when swept, if neighbouring frames differ a lot. Each jump is a corner in the crossfade, repeated at the sweep's frame rate. Every packer now rotates frames into line and blurs each one into its neighbours, a Gaussian one frame wide (`pack_wavetable.py`, `SMOOTH_SIGMA = 1.0`). Loudon heard it and made it the default (2026-11-10), and all 30 packed tables were rebuilt with it, cutting the buzz 8 to 27 dB (2026-11-15, `loop-smoothing/`). The palace-synthesis tables are already smooth and stay as they were.

- run · 2026-11-15 · cycle 21 · taught item 5, proposed item 6 for canon
