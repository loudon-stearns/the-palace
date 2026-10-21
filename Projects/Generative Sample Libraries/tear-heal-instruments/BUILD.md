# BUILD — tear-and-heal instruments

The conventions this build renders under (the interview skill's Rule 1). **Proposed 2026-10-20, waiting on Loudon's yes.** The audition was rendered under them ahead of that yes, because renaming costs nothing and re-rendering costs about twenty seconds; if a name changes, `build.py` changes and everything is remade.

| | |
|---|---|
| Source | Palace synthesis: the frustration model from Harmonicity and Inharmonicity's 2026-10-17 sweeps (`source/ride_warm.py`, run by `engine.py`) |
| Instruments | Heal, Snap, Bar to String, Heal with Voices (`patches.py`) |
| Sample points | every 3 semitones, roots on C, D#, F# and A |
| Velocity layers | 3, and velocity is strike depth: soft 1–42, mid 43–85, hard 86–127 |
| Takes | one per layer. The model is deterministic; a different seed would give a genuinely different tear, so round-robin is possible later, not made now |
| Loop | a sustain loop after the heal, `loop_continuous`, crossfade baked into the WAV, points also in each WAV's `smpl` chunk |
| Formats | SFZ, and DecentSampler (`.dspreset`, plus the `.dslibrary` zip). No SF2 yet |
| Audio | 44.1 kHz, 16-bit, mono (the source's own) |
| Level | every loop body at −18 dBFS RMS; velocity scales level by `amp_veltrack=60` / `ampVelTrack="0.6"` |
| Tuning | `pitch_keycenter` is the key rendered; `tune` is the cents that bring where the strike settled back to that key |

**One filename:** `heal_D#3_hard.wav` (`<instrument>_<note>_<layer>.wav`, sharps not flats)

**One folder:** `Projects/Generative Sample Libraries/tear-heal-instruments/instruments/heal/samples/` (the audition renders into `audition/` the same way)

**One region:**

```
<region> sample=heal_D#3_hard.wav lokey=50 hikey=52 pitch_keycenter=51 tune=… loop_start=… loop_end=…
```

The interview skill's default folder, `_ops/sample-libraries/<project>/`, is not used. The Crystal and Shepard-tone instruments moved their builds into the project's bundle, and this follows them.
