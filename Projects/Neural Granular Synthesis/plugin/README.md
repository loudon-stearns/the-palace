---
title: README
born: 2026-11-07
links:
  - target: "[[Neural Granular Synthesis]]"
    type: connects-to
    label: plugin-of
forward_vector: "I am the front door of Neural Granular, the crowd of neurons made playable in Live: what it does, what it was checked against, and what nobody has heard yet."
---

# Neural Granular

A VST3 and AU instrument made from [[VST Template]], in Neural Granular Synthesis's own bundle. A crowd of 32 to 256 phase neurons fires spikes at the note you play. How much the crowd agrees is the timbre: hiss when it is scattered, a tone when it locks.

- **Tightness** (hero): coupling per unit of spread. With no pacemakers the crowd locks at 1.0; with a share p of pacemakers, at 1/(1 − p).
- **Life** (hero): the pacemaker share. Pacemakers ignore the pull, move the lock point, and make the crowd surge just under it.
- **Spread**, **Lumpiness** (how evenly the crowd covers its spread: 0 locks like a switch, 1 arrives softly), **Crowd** (32 / 64 / 128 / 256, restarts the crowd).
- **Spike width**, **Glide**, **Attack**, **Release**; **Velocity**, **Even level** (holds loudness through the lock; off, the lock is also a swell), **Level**.

Mono, last note priority. The crowd keeps running between notes, silent, so a note lands on a crowd already in motion.

**The CRT: the crowd tunnel** (`ui/visualizer.js`). The raster plot rolled into a tube. The ring at the mouth is the crowd now, each neuron at its phase from the crowd's mean (top = agreement), followers green, pacemakers amber; old rings recede. A locked crowd draws one filament down the top of the tunnel. Drag on the glass: sideways is Tightness, up and down is Life.

**Checked** (2026-11-07): the engine matches `reference/sketch.py` to 5.5e-8 of peak on all four paths, full length. The real plugin keeps the sketch's loudness within 1.06 dB (the paths allow 1.5: the crowd near its lock is sensitive to when smoothed automation lands). Strict codesign, pluginval at strictness 5, auval, host check (all four moves heard). Cost on this Mac: 1.9 % of one core at 128 neurons, 3.7 % at 256 (`check/bench.cpp`).

**Not yet:** nobody has played it in Live or heard it. The real editor was not photographed; the pictures in `proofs/` are the mock page in Chrome, fed by a harness phrase.
