# Slime Mold Delay — the plugin

A delay whose routing is grown, not designed. A VST3 and AU made with VST Template's
shared machinery (`Projects/VST Template/machinery`), installed under Plug-Ins → Loudon Live.

The dish: a round agar, a listener (the red spot) near the middle, and five oat flakes.
Each flake is a band of your sound — 120 Hz, 300 Hz, 750 Hz, 1.9 kHz, 4.7 kHz — so the
music decides which food is sounding. The mold starts as a mesh over the whole agar; after
six seconds its flow law carves the mesh down to the roads that carry what is playing, and
tips go out for food the roads don't reach. Every tube is a delay line both ways: its length
over the streaming speed is the echo time, its thickness how much passes. Where tubes meet,
the sound is summed, softly saturated and sent on. So each band reaches you along roads the
mold grew for it, and the roads change as the music moves.

The law is the flow dish's 'compete' law (`../slime-mold-flow-dish.html`, cycle 11).
`reference/sketch.py` is the numpy sketch; `src/Algorithm.h` is the plugin, ported line for line.

## Knobs

| knob | what it does |
|---|---|
| **Feed** (hero) | eating to starving. High, the colony keeps its roads and grows tips; low, it thins hard. |
| **Flow speed** (hero) | how fast the cytoplasm streams, in dishes a second. Faster means shorter echoes, higher-pitched combs. |
| **Clock** | how fast the dish thinks, 0 (frozen topology) to 4×. |
| **Budget** | how much total road the dish can afford. |
| **Dish** | Five flakes, Ring, or Scatter (flakes placed by the dish's own random draw). |
| **Cover again** | lays a fresh mesh over the carved roads, and the carving starts over. |
| **Regen** | how much sound recirculates through the network. |
| **Dry / Wet** | the mix. Dry to 0 for a send. |

## The CRT: the petri dish

`ui/visualizer.js`. The dish seen at a tilt. Every yellow filament is a tube, so a delay
line, standing up off the agar as thick as it is in the flow law. Beads stream along each
tube at the plugin's Flow speed, so a bead crosses a tube in exactly its echo time: you
are watching the sound move through the network. Flakes swell as their band plays. Pale
threads are the tips. A dead tube leaves a brown slime trail for a while, as a real
plasmodium does. Drag up or down on the screen to feed or starve.

The plugin streams 38 probes: five band levels, three tips, tube count and road used,
and four tube slots per group, cycling through all 288 slots about four times a second.

## Checks (`./plugin.sh all`, 2026-11-07)

- verify: four paths (moves, starve, ring, scatter), engine = sketch to under 1e-7 of peak
  sample for sample; plugin loudness within 0.31 dB of the sketch every quarter second.
- validate: codesign, pluginval at strictness 5 including auval.
- hostcheck: the installed VST3 loads like a DAW loads it and each knob changes the sound.
- editor: the real editor's photo came back with no picture (as for the other template
  plugins on this Mac); `proofs/editor-960x620.png` is the template's preview page.

`python3 ui/preview.py --shots` renders `proofs/dish-performance.html`: thirty seconds
through the plugin's own processor, picture and sound together.

`python3 bank.py` renders a small bank of dishes from recordings already in the palace (a drum
loop, a speaking voice, a piano) through the plugin's own processor: `bank/<name>.wav`,
`bank/roads.png` (the roads each one grew, at 3, 7, 11 and 16 seconds, read back from the
probes) and `bank/report.json`. This is the offline renderer now; `../headless/` holds the
older ones, which run the law from before cycle 11.

## Gotchas

- Everything the dish decides depends only on the band levels and the knobs, never on the
  network's own sound. That is what keeps sketch and plugin growing the same dish.
- The probes carry four tube slots per 128 samples, so a fresh mesh takes a quarter second
  to draw in full on the CRT.
