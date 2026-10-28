# Single cycles — the palace tables, one cycle at a time

Cycle 20, 2026-10-28. The plan's formats move asks for single-cycle exports for hardware and Eurorack, beside the Serum and Ableton tables that are done. This folder is that exporter, run on the three tables the palace synthesized itself: the seven crystal lattices, the Floquet modes, and the Shepard centroid.

Rebuild: `/usr/local/bin/python3 export_single_cycles.py` (under a second), then `/usr/local/bin/python3 figure.py`. Every number below is in `export_report.json`.

## What is in `cycles/`

19 cycles, each at three lengths: 57 files, 304 KB.

- **Crystal:** the seven lattice keyframes, cubic to triclinic, synthesized fresh at 2048 from `crystal-bravais/generate.py` (not pulled from the table, so they are the pure lattices, not blends).
- **Floquet and Shepard:** six evenly spaced frames from each 64-frame table, named by Position (`pos0p00` is Position 0, `pos1p00` the far end).

| folder | length | plays at, as a sampler's root | for |
|---|---|---|---|
| `cycles/2048/` | 2048 samples | 21.5 Hz (MIDI 16, +77 cents) | Serum and Vital's single-cycle drop, most software |
| `cycles/600/` | 600 samples | 73.5 Hz (MIDI 38, D2 +2 cents) | the AKWF convention; samplers and hardware that take short loops |
| `cycles/256/` | 256 samples | 172 Hz (MIDI 52, +77 cents) | small-memory modules |

Every file is 16-bit, 44.1 kHz, mono, and:

- **band-limited** when it is shortened: the cut is made in the spectrum, so a 256-sample cycle keeps the 127 harmonics it can hold and drops the rest, instead of folding them back as noise;
- **free of DC**, peaked at −0.3 dBFS;
- **started on a zero crossing**, the steepest upward one, chosen on the full-length cycle and kept at every length, so the three lengths of one cycle line up (they drift at most 1.3 % of a cycle, from the band-limiting itself);
- **carrying a `smpl` chunk**: one forward loop over the whole cycle, and the root note and cents that its length plays at. A sampler that reads the chunk loops and tunes it without being told.

## What the checks say

- Read back, every file has the right length, the loop from 0 to the last sample, and starts within 0.0001 of zero.
- Below each length's cut, harmonic magnitudes match the source to −94 dB or better.
- The loop seam (last sample back to first) is never bigger than the cycle's own sharpest step inside.
- **What 256 costs:** the crystal and Floquet cycles keep 99.9 % of their energy or more. The bright end of the Shepard table does not: Position 0.60 keeps 96 %, 0.79 keeps 75 %, 1.00 keeps 52 %. Those cycles live in harmonics above 127, which a 256-sample cycle cannot hold at any pitch. Use the 600 or 2048 versions of them. At 600 every cycle keeps 99.96 % or more.

## Open these, in this order

1. `single_cycles_contact_sheet.png`: all 19 cycles, the 2048 version in gold over the 256 in blue. Where the blue departs from the gold is what the short length gave up; you can see it only in the bright Shepard frames.
2. `single_cycles_600_audition.wav`: every 600-sample cycle held 1.2 seconds at its root, D2, looped the way a sampler loops it. Crystal from 0 s (cubic to triclinic), Floquet from 10.2 s, Shepard from 18.9 s. **Listen for** clicks at each note start (there should be none) and a steady tone with no flutter (one cycle looped can't buzz the way a sweep did). Then listen for whether the crystal lattices still read as a family growing brighter and rougher, and whether any cycle is too thin to be worth having alone.
3. **In Serum or Vital:** drag any file from `cycles/2048/` onto an oscillator. Each one loads as a one-frame table.
4. **In Ableton's Simpler or Sampler:** drag a file from `cycles/600/`. Turn on loop if it is off, and play D2: it should sound at D2 and sustain.

## Not verified

No one has listened. No piece of hardware has loaded any of these files, so the "for" column in the table above is a convention, not a tested fact. I have not checked which samplers read the `smpl` chunk; the root note and loop are in it, and Python's `wave` module and macOS's `afinfo` open every file. The 2048 root sits at 21.5 Hz, which is right for the length but low for a sampler's keyboard; a sampler will need transposing up.

## For the Max pause

Nothing here is Max work. If a Max for Live loader is wanted later, it needs: a folder path in, a list of the files and their `smpl` root notes, and a `buffer~` per cycle read with `loop 1`. The tested logic is `crossing()` and `shape()` in `export_single_cycles.py`.
