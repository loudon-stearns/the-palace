# Retrospective Delay — the plugin

One measure of tape, always listening. While you play, the tape takes it in; when you
stop, it holds (silence keeps), so the last measure keeps coming back. Summon decides
how much of that past you hear. A VST3 and AU made with VST Template's shared machinery
(`Projects/VST Template/machinery`), installed under Plug-Ins → Loudon Live.

The sound is the portal's séance (`../stage-5-portal/portal.codebox`), ported line for
line: `reference/sketch.py` is the numpy sketch, `src/Algorithm.h` the plugin.

## Knobs

| knob | what it does |
|---|---|
| **Summon** (hero) | how loud the ghost comes back; turning it down hides the past without erasing it. Default 0.6, so it makes sound the moment it goes in. |
| **Lag** | how far behind the planchette the read head trails: a quarter, half or whole measure. A change fades between two read heads over 30 ms. |
| **Tempo** | the measure's length (4/4). Set it to the song's tempo; the plugin does not read Live's clock yet. |
| **Listen above** | the level that counts as playing. Below it the tape holds. |
| **Dry** | off for a send. |

## The CRT: the séance table

`ui/visualizer.js`. The measure is the ring round a table; the planchette (write head)
carries a candle, orange while the tape listens, blue while it holds. What you play
stands on the ring as columns of light, amber when fresh, violet as it waits. Summon lifts
a ghost ring above the table, and ectoplasm rises to it from the read head. A cat at the
table's edge sleeps at zero and wakes as you turn it up. Drag up or down on the screen to
turn Summon.

`python3 ui/preview.py --shots` plays a 16-second performance through the sketch and writes
`proofs/seance-table.html` (the picture and the sound together, standalone) and stills.

## Checks (2026-11-03)

`./plugin.sh all`: four paths (summon, relag, overwrite, tempo) match the sketch sample for
sample to under 8e-8 of peak; the real processBlock keeps the sketch's loudness (the summon
path's gate is 2 dB, not 0.5, because Summon's 20 ms smoothing trails a ramp where it leaves
zero — see `reference/paths.py`); codesign, pluginval at strictness 5, auval and the host
check pass. `./plugin.sh editor` returned no picture on this Mac (the same as Semantic
Delay's), so `proofs/editor-900x600.png` is the mock page with the template's feed.

## What the next build needs

- **Live's clock.** The measure should be Live's bar, with the planchette on the downbeat.
  The machinery hands the Algorithm no tempo or playhead yet.
- A stereo tape per side is already there; one ear (the louder side) decides listen or hold.
