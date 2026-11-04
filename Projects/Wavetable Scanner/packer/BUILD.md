# The browser packer — what's here and how to try it

`wavetable_scanner_study.html` (one folder up) is the Sketch page with `packer.js` built in. Drop a folder of single-cycle WAVs on the stage, or use **Choose folder…**. The page packs the cycles into a table of 1024-sample frames, sorts them dull to bright, and plays and draws the result. You don't need Python. The Sketch, `wavetable_scanner.html`, stays as it was.

## Try it (about two minutes)

1. Open `wavetable_scanner_study.html` in Chrome. It opens on a cello table that this same packer built from `AKWF_cello`.
2. Click **Engage**. Sweep **Position**. The HUD shows each frame's brightness in Hz, climbing as you go.
3. Click **Choose folder…** and pick `~/Desktop/AKWF/AKWF_fmsynth` (or drag the folder onto the stage). 122 cycles pack in about a tenth of a second.
4. Flip **Frame order** to *File order* and back. Same cycles. Listen for whether centroid order sweeps somewhere and file order wanders.
5. **Download packed .wav** saves a 32-bit float table. Drop it on Ableton Wavetable's oscillator display.

## What to listen for

- `sweep_fmsynth_packed_in_browser.wav`: 20 s at 110 Hz, Position 0 → 1, played with the page's own lookup. Does it get brighter the whole way? Where does it lurch? The Generative Wavetable Libraries run found 50 of 121 steps lurch in this order.
- `sweep_cello_packed_in_browser.wav`: 12 s through the 19 cello cycles. It's a calmer folder.

## What was checked

- `compare.py` packs six AKWF folders (fmsynth, eorgan, bw_saw, cello, bitreduced, 0001) with `pack_wavetable.py` and again with `packer.js`. Up to the 250th harmonic the frames agree to −59 dB or better, typically about −75 dB. Above that they differ. scipy's filter rolls off the top 50 or so harmonics of a 600-sample cycle, and the spectral resample keeps them flat. Because that top-end energy nudges centroids by up to 40 Hz, a few near-tied neighbours swap places (0 to 8 adjacent swaps per folder). `compare.json` has the numbers.
- `browser_check.mjs` drives the page in Chrome with a real file picker: 122 files, the HUD at both ends, the order toggle, the export. It saw no page errors. The download is bit-identical to `pack_folder.cjs` run in node. `browser_check.json` has the details.

## Why the page parses WAVs itself

`decodeAudioData` resamples a file to the AudioContext's rate. A 600-sample AKWF cycle decoded at 48 kHz comes back 653 samples long, so it's no longer one cycle. `packer.js` reads the RIFF chunks itself: PCM 8, 16, 24 and 32-bit, float 32 and 64, and extensible headers.

## Not yet

Nobody has heard these. The page hasn't been tried in Safari or Firefox. Folder drag-and-drop goes through `webkitGetAsEntry`, and only the picker path was driven in the check. Tables are capped at 256 frames, and a bigger folder is thinned evenly along the order. There's no family-chain order yet: Generative Wavetable Libraries found it beats centroid past about 24 cycles, and porting it is the obvious next step.
