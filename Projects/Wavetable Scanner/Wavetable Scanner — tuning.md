---
title: "Wavetable Scanner — tuning"
born: 2026-11-03
links:
  - target: "[[Wavetable Scanner]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Wavetable Scanner's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Wavetable Scanner about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Wavetable Scanner — tuning

What Wavetable Scanner's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-03, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-11-03

1. Never feed a single cycle through decodeAudioData: it resamples to the AudioContext rate, so a 600-sample cycle at 48 kHz comes back 653 samples long and stops being one cycle. Parse the RIFF chunks directly. *(offered by the steward, cycle 1)*
2. **Proposed for canon** · 2026-11-03 · [[Wavetable Scanner]] · § Tiers, a new subsection after 'Sketch round 2 — Drone default fix' · superseded by item 5 *(proposed by the steward, cycle 1)*
   Why: the Study tier names 'port the resampler to JS' as its reach, and it now exists
   Path: `Projects/Wavetable Scanner.md`
   > #### Study round 1 — the packer moves into the page (2026-11-03)
   >
   > `wavetable_scanner_study.html` packs a folder of single-cycle WAVs in the browser (`packer/packer.js`): its own WAV reader, a spectral resample to 1024 samples in place of the tile-three FIR, the same magnitude-weighted centroid, a stable dull-to-bright sort or the folder's own order, and normalising together to 0.99. Against `pack_wavetable.py` on six AKWF folders, frames agree to −59 dB or better below the 250th harmonic. Above that, scipy's filter rolls off and the spectral resample doesn't, so a few near-tied neighbours swap. Chrome only, not yet heard.
3. **Proposed for canon** · 2026-11-03 · `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md` · a new gotcha at the end · canon change owed *(proposed by the steward, cycle 1)*
   Why: a trap the next browser wavetable tool would fall into silently; it belongs beside the other build gotchas
   Path: `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md`
   > **decodeAudioData resamples single cycles out of shape (2026-11-03).** It converts a file to the AudioContext's rate, so a 600-sample AKWF cycle decoded at 48 kHz comes back about 653 samples long and is no longer one period. For cycles and tables, read the RIFF chunks yourself (`packer/packer.js` parseWav).

- run · 2026-11-03 · cycle 1 · taught item 1, proposed items 2, 3 for canon

## From cycle 2 — 2026-11-03

4. Silhouette picks the family count by a hair on loose folders (AKWF_fmsynth scores 0.21 to 0.23 for k = 3 to 5), so a port that chooses a different k from the Python isn't wrong; compare the chains by their jumps and dips, not by how many families they have. *(offered by the steward, cycle 2)*
5. **Proposed for canon** · 2026-11-03 · [[Wavetable Scanner]] · § Tiers, a new subsection after 'Sketch round 2 — Drone default fix' · canon change owed *(proposed by the steward, cycle 2)*
   Why: the Study tier's reach, porting the packer to JS, now exists, and it packs in the order Loudon chose
   Path: `Projects/Wavetable Scanner.md`
   > #### Study round 1 — the packer moves into the page (2026-11-03 to 11-04)
   >
   > `wavetable_scanner_study.html` packs a folder of single-cycle WAVs in the browser (`packer/packer.js`): its own WAV reader, a spectral resample to 1024 samples, the magnitude-weighted centroid, and normalising together to 0.99. Three orders: the **family chain** by default (the order chosen for [[Generative Wavetable Libraries]] on 2026-10-14: k-means families over the loudness-free log spectrum, darkest first, each walked smoothly, frames rotated into line), dull to bright, or the folder's own order. An optional one-frame Gaussian along Position takes the sweep buzz down 11 to 15 dB. Centroid packs match `pack_wavetable.py` to −59 dB or better below the 250th harmonic. The chain matches the Python's scores (FM: 13 big jumps against 14), and the organ folder splits into the same three families. Chrome only, not yet heard.

- run · 2026-11-03 · cycle 2 · taught item 4, proposed item 5 for canon

## From cycle 3 — 2026-11-03

6. Look at a screenshot before trusting 3D geometry code: the Sketch's cursor plane passed every headless check while turned a quarter turn the wrong way, and only the picture showed it. *(offered by the steward, cycle 3)*
7. **Proposed for canon** · 2026-11-03 · `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md` · a new gotcha at the end, after the decodeAudioData one · canon change owed *(proposed by the steward, cycle 3)*
   Why: a silent visual bug that headless checks miss; the next Three.js scanner would copy it
   Path: `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md`
   > **The cursor plane was turned the wrong way (2026-11-04).** The Sketch rotated its `PlaneGeometry` a quarter turn about Y, which lays it along the frame axis instead of across it. It slid with Position but ran lengthwise through the table and never marked the scan. Every headless check passed; a screenshot caught it. A cross-section at z needs no rotation: PlaneGeometry already spans X and Y.

- run · 2026-11-03 · cycle 3 · taught item 6, proposed item 7 for canon

## From cycle 4 — 2026-11-03

8. Write the DSP as one plain class with a per-sample render and stringify it into the AudioWorklet: the same code then runs in Node for proofs and ports straight to the VST Template's Algorithm.h. *(offered by the steward, cycle 4)*
9. **Proposed for canon** · 2026-11-03 · [[Wavetable Scanner]] · § Tiers, a new subsection after 'Study round 1 — the packer moves into the page' · canon change owed *(proposed by the steward, cycle 4)*
   Why: Loudon's 2026-11-04 note put a MIDI synth ahead of the exports; the entry should record that it exists and how it is built
   Path: `Projects/Wavetable Scanner.md`
   > #### Study round 2 — the synth (2026-11-04)
   >
   > `wavetable_synth.html` plays the scanner's tables as an instrument: Web MIDI from any input, the computer keys, or the page's keys. It has eight voices with up to seven unison copies each, a 12 dB lowpass, two envelopes on the Synth Templates Moog curve, an LFO, and the mod wheel on Position. Every frame is band-limited per octave, which takes aliasing at C7 from −15 to −57 dB. The engine (`synth/wt-synth.js`) is one plain class that both the AudioWorklet and Node run, shaped for the [[VST Template]]'s `Algorithm.h`. It passes in Chrome, Firefox and WebKit; no real keyboard has played it yet.

- run · 2026-11-03 · cycle 4 · taught item 8, proposed item 9 for canon
