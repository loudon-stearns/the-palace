# Wavetable Scanner — test plan

What to check on `wavetable_scanner_study.html`, and which checks a script already runs. The scripts live in `packer/`; each writes a JSON beside itself.

## Run by script

| check | script | last result |
|---|---|---|
| browser packer matches `pack_wavetable.py` below the 250th harmonic | `compare.py` | −59 dB or better, six folders (2026-11-03) |
| family chain scores like the Python one | `chain_check.py` | FM 13 jumps against 14; organ splits into the same three families (2026-11-04) |
| page packs, exports, toggles order in Chrome | `browser_check.mjs` | no errors; export bit-identical to node (2026-11-04) |
| Chrome, Firefox, WebKit: audio, pack, export, drag the cursor plane, orbit, folder walker | `study_check.mjs` | all pass (2026-11-04) |

Rebuild the page with `python3 packer/build_page.py` before running these; it regenerates the demo table and fails loudly if a patch to the Sketch no longer matches.

## By hand — only a person can do these

1. **Listen.** Engage, sweep Position on the cello demo. Then pack `AKWF_fmsynth` and play the three orders. Does the family chain glide where centroid stutters? Does the blur take the flutter out without dulling the trip?
2. **Drag.** Grab the glowing plane and drag it slowly, then fast. Does the sound follow your hand without zipper noise?
3. **Finder drop.** Drag a folder from Finder onto the stage (not the picker).
4. **Safari.app.** Open the page in Safari itself and repeat 1 and 2.
5. **Phone.** Open it on a phone: does Engage unlock audio, does one finger drag the plane, do two fingers orbit?
6. **Ableton.** Drop the downloaded table on Wavetable's oscillator. Same order, same sound?
