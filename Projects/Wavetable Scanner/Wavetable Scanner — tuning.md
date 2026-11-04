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
9. **Proposed for canon** · 2026-11-03 · [[Wavetable Scanner]] · § Tiers, a new subsection after 'Study round 1 — the packer moves into the page' · superseded by item 11 *(proposed by the steward, cycle 4)*
   Why: Loudon's 2026-11-04 note put a MIDI synth ahead of the exports; the entry should record that it exists and how it is built
   Path: `Projects/Wavetable Scanner.md`
   > #### Study round 2 — the synth (2026-11-04)
   >
   > `wavetable_synth.html` plays the scanner's tables as an instrument: Web MIDI from any input, the computer keys, or the page's keys. It has eight voices with up to seven unison copies each, a 12 dB lowpass, two envelopes on the Synth Templates Moog curve, an LFO, and the mod wheel on Position. Every frame is band-limited per octave, which takes aliasing at C7 from −15 to −57 dB. The engine (`synth/wt-synth.js`) is one plain class that both the AudioWorklet and Node run, shaped for the [[VST Template]]'s `Algorithm.h`. It passes in Chrome, Firefox and WebKit; no real keyboard has played it yet.

- run · 2026-11-03 · cycle 4 · taught item 8, proposed item 9 for canon

## From cycle 5 — 2026-11-03

10. A crossfade between wavetable frames cancels any harmonic the two hold out of phase, and blurring the frames doesn't fix it; line up the phases first, then fill the gaps from the spectrum. Filling the gaps without lining up the phases turns each harmonic's phase, and that small pitch wobble makes a fast sweep buzz more. *(offered by the steward, cycle 5)*
11. **Proposed for canon** · 2026-11-03 · [[Wavetable Scanner]] · § Tiers, a new subsection after 'Study round 1 — the packer moves into the page' · canon change owed *(proposed by the steward, cycle 5)*
    Why: item 9 plus the spectral morph, which is now how the synth moves between frames
    Path: `Projects/Wavetable Scanner.md`
    > #### Study round 2 — the synth (2026-11-04)
    >
    > `wavetable_synth.html` plays the scanner's tables as an instrument: Web MIDI from any input, the computer keys, or the page's keys. It has eight voices with up to seven unison copies each, a 12 dB lowpass, two envelopes on the Synth Templates Moog curve, an LFO, and the mod wheel on Position. Every frame is band-limited per octave, which takes aliasing at C7 from −15 to −57 dB. The engine (`synth/wt-synth.js`) is one plain class that both the AudioWorklet and Node run, shaped for the [[VST Template]]'s `Algorithm.h`. Its default morph lines up every frame's phases and builds the in-between frames from the spectrum (`spectralMorph` in `packer/packer.js`), so no harmonic cancels halfway between two frames; a plain crossfade loses one in 70 of the FM chain's 121 steps. It passes in Chrome, Firefox and WebKit; no real keyboard has played it yet.
12. **Proposed for canon** · 2026-11-03 · `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md` · a new gotcha at the end, after the cursor-plane one · canon change owed *(proposed by the steward, cycle 5)*
    Why: the next wavetable tool would ship a plain crossfade, and no level meter catches this
    Path: `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md`
    > **A crossfade between frames hollows out harmonics (2026-11-04).** Mixing two waveforms cancels any harmonic they hold out of phase, so halfway through a morph a harmonic can drop out that neither frame has lost (70 of 121 steps on the FM chain, by up to 30 dB). Blurring the frames doesn't fix it. Line up the phases, then fill the gaps from the spectrum (`spectralMorph`). Don't fill them without lining up the phases first: turning each harmonic's phase is a pitch wobble, and the sweep buzzes 5 dB more.

- run · 2026-11-03 · cycle 5 · taught item 10, proposed items 11, 12 for canon

## From cycle 6 — 2026-11-03

13. When this synth's patch comes from a card, convert each of the card's words through Synth Templates' own vocabulary.yaml at build time, never a copy of its numbers: their vocabulary is sat by ear and still moving, and a copy would quietly drift from their site. *(offered by the steward, cycle 6)*
14. **Proposed for canon** · 2026-11-03 · [[Wavetable Scanner]] · frontmatter links, after the Generative Wavetable Libraries link · canon change owed *(proposed by the steward, cycle 6)*
    Why: four Synth Templates cards now play on this synth from their own words; the link is real and in use
    Path: `Projects/Wavetable Scanner.md`
    >   - target: "[[Synth Templates]]"
    >     type: connects-to
    >     label: plays-its-cards
15. **Proposed for canon** · 2026-11-03 · [[Synth Templates]] · § Neighbours, at the end of the paragraph · canon change owed *(proposed by the steward, cycle 6)*
    Why: the catalog should know where its wavetable cards actually sound, and the missing table: field is the one gap the bridge exposed
    Path: `Projects/Synth Templates.md`
    > [[Wavetable Scanner]]'s synth plays the wavetable cards this voice can't: Wavetable Scan Lead, Wavetable Position Sweep, Wavetable Chip and Evolving Pad load a real table there, with every word read through this vocabulary (`Projects/Wavetable Scanner/synth/build_cards.py`). A `table:` field on a card would let the card name its own table instead of the synth choosing one.

- run · 2026-11-03 · cycle 6 · taught item 13, proposed items 14, 15 for canon
