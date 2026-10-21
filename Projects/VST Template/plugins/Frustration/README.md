# Frustration

The frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/` as an instrument you can automate. One stretched tone of 40, 64 or 96 partials is pulled toward the plain harmonic series by as many outside voices. Near the edge it tears and heals. It drones as soon as it loads; MIDI notes are ignored, and Pitch sets the note.

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

Things to try, from the field guide: hold Stretch just under the edge and ride Coupling. Breathe Stretch across the edge with a slow LFO on a log scale (10–20 s period). Strike it: throw Stretch far past the edge and let it fall back in about a quarter second.

**Checked against the sketch** (`reference/paths.py`): `ride.py`'s three renders, `ride_warm.py`'s breathe at 64 partials, and a walk through the extra knobs. Away from the edge the plugin matches the sketch to about 5e-8 of peak. Where a path crosses the edge it is checked on the fundamental's mean and spread, because two correct implementations part there within a couple of seconds.

**Cost:** one instance uses about 2.5 % of one M1 Max core at 40 partials and 6.6 % at 96.

**Level:** there is no limiter, so the model stays the model. With Voices at full and Level above -6 dB it can pass full scale.
