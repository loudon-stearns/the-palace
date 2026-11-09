# Action Potential — the plugin

A VST3/AU instrument made with [VST Template](../../VST%20Template/template/README.md): a crowd of Stage-4 neurons, every knob a mechanism of the membrane. The engine is `neuropulse.dsp` v0.4 (the Faust crowd of October 2026), with its pitch anchor and its measured frequency compensation, rewritten one sample at a time in `reference/sketch.py` and ported line for line into `src/Algorithm.h`.

In Live: Settings → Plug-Ins → Rescan, then Plug-Ins → Loudon Live → Action Potential.

## What you play

Mono, last note priority, with glide. The crowd keeps running between notes, silent, so a note lands on a crowd already in motion.

- **Coupling** (hero): how hard each spike kicks every charging neuron. Turn it up and the crowd pulls into one tone. At the default spread it locks at about 0.006; at spread 0.2, about 0.02.
- **Rate spread** (hero): how far apart the neurons' own rates are.
- **Crowd**: 1, 8, 16, 32 or 64 neurons. **1 is the single neuron**, the Stage-4 oscillator on its own.
- **Pitch anchor**: a locked crowd plays its fastest member's pitch; at 1 the spread is shifted so the lock lands on the note.
- **Leak spread, Threshold spread**: more ways for the neurons to differ.
- **Membrane**: Leak tau, the RC time constant, so the curve of the charge.
- **Spike**: Length, Na rise share (how much of the spike is the sodium rise), Peak.
- **Recovery**: Undershoot (afterhyperpolarization depth), Recovery damping (low rings: the refractory growl), Refractory (minimum time before the next charge, the ceiling on pitch).
- **Voice / Output**: Glide, Attack, Release, Velocity, Even level (holds loudness through the lock; off, the lock is also a swell), Level.

## The screen: the axon

The crowd drawn as one nerve fibre in 3D. Each ring is a neuron, slowest at the far end. Its girth is its voltage and its colour is the ion moving: amber charge, orange Na⁺ rise, blue K⁺ fall, violet recovery. Sodium sparks rush in as a ring fires and potassium sparks fly out. The neurons fire far too fast to draw, so the plugin sends where each sits in its cycle against the crowd (`c00..c31`), and the screen plays that back in slow motion, using the real waveform simulated from the knobs. Locked, the fibre breathes as one, with the fastest neurons a hair ahead. Scattered, it shimmers. At Crowd = 1 the rings are moments instead of neurons, and the fibre is the action potential itself. Drag on the glass: sideways is Coupling, up and down is Rate spread.

## What was checked (2026-11-09)

- Engine against sketch, sample for sample, all four paths at full length: worst 5.1e-8 of peak (tolerance 1e-6).
- The real plugin, with automation landing once per 64-sample block: loudness within 0.18 dB on three paths. On `swell-32` it is 1.53 dB, at the moment the crowd crosses the lock with even level off, so that path allows 2 dB (the reason is in `reference/paths.py`).
- Strict signature check on both installed bundles, pluginval at strictness 5, auval, and the host check: Coupling, Rate spread, Recovery damping and Spike length all change the sound.
- `ui.py fit`: the editor fits at 980×660, 1100×720 and 1800×1100.

## Not checked

- Nobody has played it or listened to it.
- The real editor window wasn't photographed (`plugin.sh editor` returned no picture from a headless session); the pictures in `proofs/` are the browser mock replaying a harness phrase through the real processor.
- CPU wasn't measured. Each neuron does one `pow` per charging sample; 64 neurons should be cheap, but no one has measured it.
