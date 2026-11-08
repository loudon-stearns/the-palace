# Exports: the packed tables, for the synths you use

The study page (`../../wavetable_scanner_study.html`) now has four export buttons under **Export the table**. Each one saves the table that's showing, whether you packed it or it's built in. This folder holds the same exports of two family chains, written by `../formats_check.cjs`. The page's downloads match them byte for byte in Chrome, Firefox and WebKit (`../formats_browser_check.json`).

| file | for | what it is |
|---|---|---|
| `akwf_fmsynth_family_chain_serum.wav` | Serum, Vital | CLM WAV, 122 × 2048, float. Laid out like Serum's factory `Basic Shapes.wav`; the writer rebuilds that file byte for byte. |
| `akwf_fmsynth_family_chain.wt` | Surge XT | `.wt`, 122 × 1024, float32 (flags 0). |
| `akwf_fmsynth_family_chain_ableton.wav` | Ableton Wavetable | plain WAV, 122 × 1024, 16-bit. |
| `akwf_eorgan_family_chain_*` | the same three | the organ chain, 154 frames. |

The 2048-sample frames come from the spectrum, so every harmonic in the 1024-sample frame is kept and nothing new is added. A table longer than a format holds (256 frames for Serum and Ableton, 512 for Surge) is thinned evenly, ends kept, and the page says how many it dropped.

## To try them (about five minutes)

1. **Serum or Vital:** drag `akwf_fmsynth_family_chain_serum.wav` onto oscillator A's display. It should show 122 frames, not 244. Hold C3 and sweep Wavetable Position from end to end, slowly and then fast.
2. **Surge XT:** in the oscillator's wavetable menu, choose *Load Wavetable File…* and pick `akwf_fmsynth_family_chain.wt`. Sweep Morph the same way.
3. **Ableton:** drag `akwf_fmsynth_family_chain_ableton.wav` onto Wavetable's oscillator display and sweep Position.

**What to listen for:** the three synths should sound like one table: dark FM bells at the start, brighter and rougher by the end. The fast sweep is where they differ, because each synth morphs between frames its own way. Nothing should be silent or half-length, or load with a warning. Surge in particular hasn't had a float `.wt` from us before; its own tables are 16-bit.

## Back in

Drop a Serum/Vital CLM WAV, a Surge `.wt` (float or 16-bit) or a plain 1024-frame WAV on the page and it loads as a table. Before this, a Serum file came in split in half, as 2 × 1024 per frame.
