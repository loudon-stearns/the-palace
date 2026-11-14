---
title: README
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: plugin-of
forward_vector: "I am the front door of Frustration, the first plugin made from VST Template: ride.py's frustration model with Stretch and Coupling automatable, what each knob does, what to try, and what it was checked against."
---

# Frustration

The frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/` as an instrument you can automate. One stretched tone of 40, 64 or 96 partials is pulled toward the plain harmonic series by as many outside voices. Near the edge it tears and heals. Play it from a keyboard (Play = keys, the default): the note sets the pitch, an amplitude envelope shapes each note, a gesture envelope carries the point on the pad toward the edge while you hold and back when you let go, and an orbit loops it around where it rests. The pad draws the point's trail. Play = drone is the original: it sounds as it loads, Pitch sets the note, and the gesture is still.

| Knob | Range | What it does (from that folder's `field-guide.md`) |
|---|---|---|
| **Stretch** (B) | 1e-7 to 30, log | Bends the partials away from whole-number ratios (n·√(1+B·n²)). Turn it up and you travel frozen → alive → edge → torn → released. At 40 partials and 6 Hz coupling the edge is near 1.8e-5. |
| **Coupling** (K) | 0 to 20 Hz | How hard each voice pulls its partial. More coupling moves the edge to a larger stretch. Held just past the edge, coupling is the cleanest performance knob. |
| **Inertia** | 0.1 to 100, log | How stubborn the tone is. 1 is `ride.py`. Higher lets the tone sit deep in stretch without tearing; lower makes it more expressive near the edge. |
| **Pitch** | 20 to 880 Hz | The tone and the voices' tuning. Coupling is not scaled with pitch, so a low note behaves like the same map on a slower clock only if you lower K with it. |
| **Voices** | 0 to 1 | How much of the outside voices you hear. 0 is the `-alone` renders. |
| **Level** | -60 to +6 dB | Output level. |
| **Partials** | 40 / 64 / 96 | Fewer partials snap cleanly at the edge; more fray. The edge comes sooner with more partials (stretch bites as about B·n³). Changing it restarts the tone. |
| **Pin partial 1** | off / on | Holds partial 1 at ratio 1, so a large stretch lands on a bar (1, 4, 9, 16 …) instead of flying off. With low coupling, Stretch becomes a string ↔ bar morph. |
| **Source** | bright / warm | Bright is `ride.py` (amplitude n^-0.7). Warm is `ride_warm.py` (rolled off above the 4th, random phases), and the edge is easier to hear on it. |
| **Play** | drone / keys | Keys: MIDI, mono, last note first; a note from silence starts the tone over, as at load. Drone: `ride.py`, sounding at Pitch. |
| **Velocity** | 0 to 1 | How much a soft note is quieter (keys). |
| **Amp attack, decay, sustain, release** | | Each note's loudness (keys). Simple Synth's envelope. |
| **Gesture in / out** | 0.01 to 20 s, log | How long the point takes to travel out while a note is held, and to come home after it is let go (keys). |
| **Gesture B** | -2 to +2 decades | How far the gesture carries Stretch: +0.5 takes 1e-5 to 3.2e-5, past the edge. |
| **Gesture K** | -10 to +10 Hz | How far it carries Coupling. Negative loosens the pull, which also crosses the edge. |
| **Orbit rate** | 0.01 to 8 Hz, log | How fast the point loops around where it rests (both modes). |
| **Orbit B / Orbit K** | 0 to 2 decades / 0 to 10 Hz | The loop's width in Stretch (sine) and height in Coupling (cosine). Both at 0 is the still point. |

Things to try, from the field guide: hold Stretch just under the edge and ride Coupling. Breathe Stretch across the edge with a slow LFO on a log scale (10–20 s period). Strike it: throw Stretch far past the edge and let it fall back in about a quarter second.

**Checked against the sketch** (`reference/paths.py`): `ride.py`'s three renders, `ride_warm.py`'s breathe at 64 partials, a walk through the extra knobs, and two played from keys: one under the edge (every sample matches) and one the gesture carries into the tear. Away from the edge the plugin matches the sketch to about 5e-8 of peak. Where a path crosses the edge it is checked on the fundamental's mean and spread, because two correct implementations part there within a couple of seconds.

**Cost:** one instance uses about 2.5 % of one M1 Max core at 40 partials and 6.6 % at 96.

**Level:** there is no limiter, so the model stays the model. With Voices at full and Level above -6 dB it can pass full scale.
