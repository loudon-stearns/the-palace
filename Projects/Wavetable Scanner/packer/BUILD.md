# The browser packer — what's here and how to try it

`wavetable_scanner_study.html` (one folder up) is the Sketch page with `packer.js` built in. Drop a folder of single-cycle WAVs on the stage, or use **Choose folder…**. The page packs the cycles into a table of 1024-sample frames, sorts them dull to bright, and plays and draws the result. You don't need Python. The Sketch, `wavetable_scanner.html`, stays as it was.

## Try it (about two minutes)

1. Open `wavetable_scanner_study.html` in Chrome. It opens on a cello table that this same packer built from `AKWF_cello`.
2. Click **Engage**. Sweep **Position**. The HUD shows each frame's brightness in Hz, climbing as you go.
3. Click **Choose folder…** and pick `~/Desktop/AKWF/AKWF_fmsynth` (or drag the folder onto the stage). 122 cycles pack in about a quarter of a second, in the **family chain** order by default. The HUD names the family you are in.
4. Flip **Frame order** between *Family chain*, *Centroid* and *File order*. Same cycles each time.
5. Try **Smooth along Position**: *Blur 1 frame* is the fix for the sweep buzz from Generative Wavetable Libraries. Sweep Position fast with it off, then on.
6. **Download packed .wav** saves a 32-bit float table. Drop it on Ableton Wavetable's oscillator display.

## Spectral morph (cycle 5, 2026-11-04)

Loudon on the blur: "I can't really hear it. A better, more refined smoothing between waveforms would be good." The blur works on the frames. What you hear *between* two frames is the playback crossfade, and that is where the trouble is: mixing two waveforms cancels any harmonic the two hold out of phase, so halfway through a morph some harmonics drop out that neither frame has lost. `morph_check.py` counts them. On the FM chain, 70 of 121 neighbouring pairs lose at least one harmonic by more than 6 dB at the halfway point, and the deepest hole is 30 dB.

`spectralMorph(frames, target, lock)` in `packer.js` fixes this in two steps:

- **Lock the phases.** A held note doesn't let you hear the phases of its harmonics, only their levels. So each frame takes the phases of the frame before it for every harmonic that frame already sounds. The levels, and so the held sound, stay the same. The drawing of the waveform changes, and it gets peakier (median crest +2.3 dB on the FM chain).
- **Fill the gaps in the spectrum.** Between each pair it adds in-between frames: each harmonic's power moves in a straight line and its phase turns the short way, up to 512 frames in all. Equal power means the level doesn't dip.

`packCycles(…, { morph: 'locked' })` does both. `'spectral'` fills the gaps without the lock. `morphTarget: 1` locks the phases and adds no frames.

| table | way | worst level dip | pairs with a hole | buzz |
|---|---|---|---|---|
| classics (5) | crossfade | −8.7 dB | 1 of 4 | −57.5 dB |
| | **locked spectral** | 0.0 dB | 0 | −59.3 dB |
| fmsynth chain (122) | crossfade | −2.2 dB | 70 of 121 | −26.2 dB |
| | spectral, no lock | 0.0 dB | 0 | −20.7 dB |
| | **locked spectral** | 0.0 dB | 0 | −27.1 dB |
| | lock only, 122 frames | −1.9 dB | 0 | −28.8 dB |
| | crossfade, blur 1 | −0.7 dB | 34 of 121 | −36.9 dB |
| | locked spectral, blur 1 | 0.0 dB | 0 | −35.7 dB |
| eorgan chain (154) | crossfade | −2.7 dB | 53 of 153 | −24.1 dB |
| | **locked spectral** | −0.2 dB | 0 | −24.7 dB |
| cello chain (19) | crossfade | −1.8 dB | 16 of 18 | −47.9 dB |
| | **locked spectral** | 0.0 dB | 0 | −46.1 dB |

What this shows: the two fixes treat different things. The locked morph takes out the holes and the level dips, so the sound between two frames is one tone and not two waves fighting. The buzz on a fast sweep comes from how far apart neighbouring frames are, and only the blur moves it. Filling the gaps without the lock turns each harmonic's phase, which is a small pitch wobble, and that makes the buzz 5 dB worse on the FM chain. That is why the lock comes first.

**Listen:** `morph/ab_classics.wav`, `ab_fmsynth.wav`, `ab_eorgan.wav`, `ab_cello.wav`. Each has the same sweep twice at 110 Hz, crossfade first, then a second of silence, then the locked spectral morph, matched in loudness. The classics file is the plainest: listen at the square → bell step, where the crossfade dips by almost 9 dB.

## Drag the cursor, and three browsers (cycle 3, 2026-11-04)

**The cursor plane was turned the wrong way.** In the Sketch it was rotated a quarter turn, so it ran lengthwise through the middle of the table and slid forward and back without ever marking where the scan was (look at `shot-fmsynth-chain-mid.png` from cycle 2: the dark sheet runs along the table). The Study page drops the rotation. The plane is now a cross-section at the scan position, with an outline so it reads against a dense table.

**You can drag it.** Point at the plane and the cursor turns to a hand; press and carry it along the table to set Position. Press anywhere else and the scene orbits as before. If the LFO sweep is running, grabbing the plane stops it. The press is caught on the stage before OrbitControls sees it. While you drag, the pointer is tracked on whichever surface along the frame axis faces the camera more (the floor, or a wall), so it follows from any angle. Touch goes through the same pointer events, but nobody has tried it on a phone.

`study_check.mjs` drives the page in Chrome 156, Firefox 148 and WebKit 26.4 (Safari's engine, through Playwright; not Safari.app itself). It engages audio, packs the 122 FM cycles, exports, drags the plane, orbits, and drags again from the new angle. It also walks a mocked folder drop: 250 files handed out 100 at a time, as Chrome does, plus a nested folder. `study_check.json` has the numbers.

| | Chrome | Firefox | WebKit |
|---|---|---|---|
| audio engages, worklet runs | yes, 44.1 kHz | yes | yes |
| pack 122 cycles | 264 ms | 241 ms | 250 ms |
| download equals the node packer, byte for byte | yes | yes | yes |
| drag to 0.8, then 0.35 | 0.800, 0.350 | 0.802, 0.355 | 0.801, 0.345 |
| orbit turns the camera, leaves Position alone | yes | yes | yes |
| drag again after orbiting, to 0.9 | 0.910 | 0.917 | 0.894 |
| folder walker finds all 254 entries | yes | yes | yes |
| page errors | none | none | none |

The drag lands within about 0.01 of where the pointer is, which is a frame or so on a 122-frame table.

## The family chain (cycle 2, 2026-11-04)

On 2026-10-14 Loudon picked the family chain as the order for Generative Wavetable Libraries, and asked about a buzz in it; on 2026-10-28 that project traced the buzz to big jumps between neighbouring frames and blurred it away. `packer.js` now does both, ported from `akwf-scale-up-fmsynth/scale_up.py` and `loop-smoothing/smooth_tables.py`:

- **Families.** Each cycle's fingerprint is the log of its harmonics 1 to 64, loudness taken out. k-means (k-means++ seeding, 24 restarts, seeded so a folder always packs the same way) for k = 3 to 8, k picked by silhouette. A folder under six cycles is one family.
- **The chain.** Families darkest first. Inside each, a nearest-neighbour walk from the darkest member, tidied by 2-opt. The next family starts at the member closest to where the last one ended.
- **Lined up.** Every frame is rotated to best match the one before, so the crossfade never cancels (in chain order, and whenever smoothing is on).
- **Smoothing.** A Gaussian along Position, sigma in frames, ends held, DC removed after. Off by default, because nobody has heard the GWL A/B yet.

`chain_check.py` packs three folders three ways through `packer.js` and scores them with GWL's own yardsticks (`chain_check.json`). Jumps are steps bigger than the folder's own 90th-percentile walk step. Buzz is energy 4 to 15 Hz off the harmonics in a 24 s sweep.

| folder | order | jumps | mean step | worst morph dip | brighter as Position rises | buzz |
|---|---|---|---|---|---|---|
| fmsynth (122) | centroid | 48 | 83.0 | −5.1 dB | 1.00 | −21.7 dB |
| | chain | 13 | 52.7 | −2.2 dB | 0.82 | −26.2 dB |
| | chain, blur 1 | 13 | 52.7 | −0.7 dB | 0.82 | −36.9 dB |
| eorgan (154) | centroid | 90 | 61.1 | −4.1 dB | 1.00 | −19.9 dB |
| | chain | 17 | 32.7 | −2.7 dB | 0.71 | −24.1 dB |
| | chain, blur 1 | 17 | 32.7 | −0.6 dB | 0.71 | −39.3 dB |
| cello (19) | centroid | 4 | 45.5 | −3.3 dB | 1.00 | −44.8 dB |
| | chain | 2 | 42.6 | −1.8 dB | 0.83 | −47.9 dB |
| | chain, blur 1 | 2 | 42.6 | −0.5 dB | 0.83 | −56.3 dB |

Against the Python: the organ folder splits into the same three families (round 79, warm 63, bright-nasal 12; the Python run read 142 of these 154 cycles and found 72/58/12, the same 12 bright-nasal). The FM chain scores about the same as the Python one (13 jumps against 14, mean step 52.7 against 53.5, worst dip −2.2 against −2.9 dB) but the browser picks k = 3 where Python picked k = 5. Both silhouettes sit near 0.21 to 0.23, so the folder has no sharp family boundary and the random seeding decides.

`browser_check.mjs` drove the page in Chrome: 122 FM files, the HUD at three positions naming the family, blur on, export, then centroid and file order. No page errors. The blurred download is bit-identical to `node pack_folder.cjs <folder> out.wav chain 1`.

**Listen:** `chain/fmsynth_ABC_centroid_chain_smoothed.wav` and `chain/eorgan_ABC_…`: three 20 s sweeps at 110 Hz with a second of silence between: centroid, family chain, family chain blurred. The first should stutter, the second glide with a seam or two, the third glide without the flutter. Then listen for the cost: does the third still travel as far?

## What to listen for (cycle 1)

- `sweep_fmsynth_packed_in_browser.wav`: 20 s at 110 Hz, Position 0 → 1, played with the page's own lookup. Does it get brighter the whole way? Where does it lurch? The Generative Wavetable Libraries run found 50 of 121 steps lurch in this order.
- `sweep_cello_packed_in_browser.wav`: 12 s through the 19 cello cycles. It's a calmer folder.

## What was checked

- `compare.py` packs six AKWF folders (fmsynth, eorgan, bw_saw, cello, bitreduced, 0001) with `pack_wavetable.py` and again with `packer.js`. Up to the 250th harmonic the frames agree to −59 dB or better, typically about −75 dB. Above that they differ. scipy's filter rolls off the top 50 or so harmonics of a 600-sample cycle, and the spectral resample keeps them flat. Because that top-end energy nudges centroids by up to 40 Hz, a few near-tied neighbours swap places (0 to 8 adjacent swaps per folder). `compare.json` has the numbers.
- `browser_check.mjs` drives the page in Chrome with a real file picker: 122 files, the HUD at both ends, the order toggle, the export. It saw no page errors. The download is bit-identical to `pack_folder.cjs` run in node. `browser_check.json` has the details.

## Why the page parses WAVs itself

`decodeAudioData` resamples a file to the AudioContext's rate. A 600-sample AKWF cycle decoded at 48 kHz comes back 653 samples long, so it's no longer one cycle. `packer.js` reads the RIFF chunks itself: PCM 8, 16, 24 and 32-bit, float 32 and 64, and extensible headers.

## Not yet

Nobody has heard these. Firefox and WebKit pass the drive, but Safari.app itself and a real Finder drag onto the stage haven't been tried; the walker was checked on a mocked drop. Phone touch is untried. Tables are capped at 256 frames, and a bigger folder is thinned evenly along the order. The tilted chain (each family's walk pulled toward dull-to-bright, GWL's pick for organs) isn't ported. The family chain hasn't been heard in this page either.

## Export formats (2026-11-04)

`formats.js` (inlined after `packer.js`) writes the table that's showing for Serum/Vital (CLM WAV, 2048-sample frames), Surge XT (`.wt`, float32) and Ableton (16-bit WAV, 1024-sample frames), and reads all three back in. `node formats_check.cjs` checks that the CLM writer rebuilds Serum's `Basic Shapes.wav` byte for byte, that every format round trips, and that Surge's factory tables read in. It also writes `exports/`. `node formats_browser_check.mjs` clicks the page's buttons in three browsers and compares the downloads. What to drag where: `exports/README.md`.
