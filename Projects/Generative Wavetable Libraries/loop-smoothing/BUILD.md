# Smoothing the buzz out of the family chain

Cycle 19, 2026-10-28. On 2026-10-14 Loudon picked the family chain as the default order and added: "I did find a persistent buzz present that felt incorrect to me, can we work on smoothing the loop points?" This folder answers that.

Rebuild: `/usr/local/bin/python3 smooth_tables.py <any 2048-sample CLM table>…` (about 2 s a table, `--sigma` sets the width), then `/usr/local/bin/python3 figure.py`. `buzz_probe.py` holds the measurements.

## What the buzz turned out to be

Not the loop seam. I checked three things:

1. **The sources' loop points are clean.** In all 122 FM and 154 organ AKWF cycles, the step where the end meets the start is never more than twice the cycle's own sharpest step inside. (The Desktop copy of AKWF was read, because the Dropbox copy is online-only now.)
2. **A held frame is clean.** One frame played still at A2 puts −71 dB off its harmonics in the median frame and −42 dB in the worst (an organ frame), even with the naive player. Folding back above Nyquist only shows up from A5 up, and only in a player that doesn't band-limit. Serum and Ableton's Wavetable do band-limit.
3. **The sweep is where it lives.** In the audition sweeps, energy 4 to 15 Hz either side of every harmonic sits at −26 dB (FM), −25 dB (organ) and −17 dB (AI cycles). That band is the rate the sweep steps through frames, 5 to 11 a second. Window by window it follows how different neighbouring frames are (correlation 0.87 on FM, 0.80 on AI). Each frame boundary is a corner in the crossfade, and a big jump repeated five times a second is a steady flutter-buzz riding on the note. The family chain made the jumps smaller than the old order, but some are still large.

## The fix

Blur each frame gently into its neighbours along Position: a Gaussian one frame wide (sigma 1), on frames already rotated into line, so the blend never cancels. Rounding the corners alone with a cubic curve barely helps (3 dB or less), because the corners aren't the problem: the size of each jump is.

| table | buzz as shipped | smoothed (sigma 1) | how much of each frame changed | worst morph dip |
|---|---|---|---|---|
| FM chain | −26.1 dB | −36.6 dB | −12 dB (about 6 %) | −2.9 → −0.7 dB |
| organ chain | −25.4 dB | −38.9 dB | −14 dB (about 4 %) | −2.7 → −0.7 dB |
| AI chain | −16.9 dB | −34.9 dB | −17 dB (about 2 %) | −2.5 → −0.8 dB |

The full dial (sigma 0 to 2) is in `smoothing.json` and the left of `smoothing.png`. Sigma 1.5 buys another 5 to 8 dB for a little more blur.

## Open these, in this order

1. `tables/akwf_fmsynth_family_chain_AB_shipped_then_smooth.wav`: the FM chain sweep as shipped, one second of silence, then smoothed. **Listen for** the fine, fast flutter riding on the note in the first half, and whether it is gone in the second. Then listen for what it cost: do the timbres still move as far, or does the sweep sound washed?
2. The same A/B for the organ (`akwf_eorgan_…`) and the AI cycles (`ai_cycles_…`). The AI one had the most buzz and should change the most.
3. **Serum / Vital / Surge XT:** drag `tables/<name>_smooth.wav` onto oscillator A (2048-sample frames with the CLM chunk, same frame counts as before: 122, 142, 256). Sweep Position by hand, slowly and then fast. The buzz grows with sweep speed, so a fast turn is the hard test.
4. **Ableton Wavetable:** drag `tables/<name>_smooth_ableton.wav` onto the oscillator display.

## Not verified

Nobody has listened. "Buzz" here is the measured band 4 to 15 Hz off the harmonics in a 24 s sweep. It is my reading of Loudon's word, and it scales with sweep speed. "Changed" is a spectral measure of loudness-free harmonic magnitudes, not a listening test. Only the three family chains are smoothed. The centroid, walk, tilted and per-family tables are not.

---

## Cycle 21, 2026-11-15: the blur is the default, every table rebuilt

Loudon heard the A/B and answered **KEEP-SIGMA-1** (2026-11-10): "the buzz is gone and nothing went washed. Make a one-frame blur the default and rebuild every table."

**Where the default lives.** `smooth_along_position()` and `SMOOTH_SIGMA = 1.0` are in `akwf-import-pipeline/pack_wavetable.py`, the lowest module, so the interview's default packer and every scale-up packer share one copy. It rotates frames into line, then blurs. `scale_up.emit()` smooths every table it writes. Every packer takes `--sigma` (`0` = off): `pack_wavetable.py`, `scale_up.py`, `scale_up_folder.py`, `pack_ai_tables.py`. `smooth_tables.py` passes `sigma=0` to `emit`, because its frames are already blurred.

**Proof the change only does what it says.** Before touching anything, every table was copied aside. With `--sigma 0`, all 87 table files came back within one least-significant bit of 16-bit (worst sample difference 3 × 10⁻⁵). That's the same tables, so the switch changes nothing else.

**What the rebuild did** (`rebuild_report.py`, `rebuild_report.json`, `rebuild_report.png`). There are 30 tables across the FM, organ and AI sets: the centroid, walk, family chain, tilted chain, every family table and every by-instrument table. The buzz fell in every one, by 8 to 27 dB. Each frame changed by 8 to 24 dB below its own level. The worst mid-morph dip is now −1.0 dB or better everywhere.

The biggest change is **the AI centroid table**: −5.6 → −32.1 dB buzz, and its worst dip went from −19.8 to −0.7 dB. The centroid tables were never rotated into line, and the default now does that before the blur. Without it the blur would cancel. The AI cycles' neighbours were the most misaligned.

**Not rebuilt, on purpose:** crystal, Floquet and Shepard. They are synthesized as smooth interpolations, and their buzz is −59 to −72 dB, 20 to 40 dB below the smoothed AKWF tables. Blurring would change them by −46 to −78 dB, which you couldn't hear. They are the files Loudon heard and accepted, and the single-cycle exporter reads Floquet and Shepard from them. So they stay byte for byte.

**The organ set is still the same 142 cycles.** The 12 that Dropbox wouldn't download in October download now. Leaving them out kept this rebuild to one change. `scale_up_folder.py` without `--src` would now take all 154 and re-cluster.

### Open this

`tables/ai_cycles_centroid_AB_before_then_default.wav` is the AI cycles in plain dull-to-bright order: 24 s as packed before, a second of silence, then 24 s as rebuilt. **Listen for** the first half's rough, fluttering grain and its hollow dips, and whether the second half glides. This one was never A/B'd. The three family chains are what you already heard, and they're now the default files in each set's `tables/` folder.
