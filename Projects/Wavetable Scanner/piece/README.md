# Wavetable Scanner — the Piece tier, first pass (2026-11-04)

The finishing stage asks for a rendered demo scan, a CPU and draw budget for each table, and Loudon Live chrome. This folder has the first two. The chrome hasn't been started.

## The demo: `tour.wav`

46 seconds, 44.1 kHz, set to −1 dBFS. Four tables, 11.5 s each, and in every section the mod wheel scans the whole table, front to back over five seconds and back again. `tour-spectrogram.png` shows it. The FM chain's section is the clearest: a peak of brightness in the middle, where the wheel turns round.

| starts | table | what plays |
|---|---|---|
| 0:00 | the five classics, sine to bell | four chords, five unison copies |
| 0:11.5 | the 19 cello cycles | two low triads, the filter envelope opening |
| 0:23 | the AKWF organ folder, family chain | short organ chords, two copies |
| 0:34.5 | the 122-cycle AKWF FM family chain | one five-note chord held, seven copies, spread wide |

The engine is `synth/wt-synth.js`, the class the browser synth runs, and each table is prepared the way the synth page prepares it: phases lined up, the in-between frames built from the spectrum, loudness matched, band-limited per octave. Each section ends in a 50 ms fade, and the release tails are down at least 40 dB before it. Rebuild with `node render_tour.cjs`, then `python3 spectrogram.py`.

## What it costs

Measured on Loudon's M1 Max on 2026-11-04.

**The plugin** (`plugin_budget.py`, `plugin_budget.json`). The template's harness drives the real `processBlock` in 128-sample blocks at 48 kHz, with eight notes held and Position swept, for 10 s. The best of three runs, with the harness's start-up taken off:

| table | 8 notes × 1 copy | × 3 | × 7 | start-up |
|---|---|---|---|---|
| classics | 2.4 % of a core | 2.7 % | 3.5 % | 0.42 s |
| cello | 2.4 % | 2.8 % | 3.4 % | 0.43 s |
| fm chain | 2.3 % | 2.8 % | 3.5 % | 0.43 s |

The table makes no difference: every table is read the same way, two frames and one octave at a time. Most of the 2.4 % is the harness pushing all 28 parameters into the plugin every block, which a host doesn't do, so these are a ceiling. Going from one copy to seven adds about 1.1 % of a core. The start-up is the morph and band-limiting of all three tables, done once and shared by every instance.

**The browser engine** (`render_tour.cjs`, `tour_budget.json`). The same work in JavaScript, in Node:

| table | frames in → playing | morph | band-limit | memory | 8 × 7 copies |
|---|---|---|---|---|---|
| classics | 5 → 261 | 26 ms | 58 ms | 10.2 MB | 8.6 % of a core |
| cello | 19 → 505 | 33 ms | 101 ms | 19.7 MB | 8.3 % |
| organ chain | 154 → 460 | 53 ms | 90 ms | 18.0 MB | 8.6 % |
| fm chain | 122 → 485 | 61 ms | 98 ms | 18.9 MB | 8.6 % |

**The 3D view** (`draw_budget.mjs`, `draw_budget.json`). This is the study page in Chrome 156 on the M1 Max's GPU, the canvas at 2100 × 1040 (pixel ratio 2), with 120 renders each finished with a one-pixel read:

| table | draw calls | line points | ms per render, median · 95th |
|---|---|---|---|
| a 2-frame table | 6 | 3,082 | 1.4 · 2.4 |
| the classics, 5 frames | 9 | 6,154 | 1.3 · 4.6 |
| the cello, 19 frames | 23 | 20,490 | 2.7 · 4.9 |
| the FM folder packed in the page, 122 frames | 126 | 125,962 | 1.9 – 3.4 · 3.3 – 6.3 |
| 256 frames, the most the page shows | 260 | 263,178 | 2.5 · 5.0 |

Each frame is one line, a draw call apiece, plus the cursor plane and the playing frame. Even at 256 frames a render takes a third of a 60 Hz frame. The readback that makes the timing honest also stalls the pipeline, so the medians cluster at 1–3 ms whatever the table. The test is whether the view stays under 16.7 ms, and every table does. Two runs of the 122-frame row gave 1.9 and 3.4 ms, so read the small differences as noise.

## Not measured

- The plugin's own window. Its landscape is drawn at 128 points a frame, a lighter load than this page's 1024, but nobody has timed it in a host.
- Any machine but this one, and any phone.
- Safari.app, and Firefox and WebKit for the draw times.
- A single table file that holds more than 256 frames comes into the study page cut to its first 256, not thinned evenly as the exports and the plugin do it. (`/tmp/wtsc_512.wav`, the 512-frame probe the last row uses, isn't kept.)
