# Crowd size, on the plugin's own engine

Does a bigger crowd make a better sound? Measured 2026-11-07 (cycle 18) on a copy of the
plugin's engine widened to 1024 neurons. `make_engine.py` makes the copy, and its crowds
of 32 to 256 are byte for byte the shipped plugin's (checked with `cmp` against a build of
`../../src/Algorithm.h`). The plugin itself is unchanged.

- `run.cpp`: hold C3 on one crowd and dump audio and agreement.
- `measure.py`: the sweep table, `crowd-size-engine.json`. Life 0.2 and 0.5, tightness
  0.6 to 1.6 of the lock line 1/(1 − life), crowds 32 to 1024, Even level off, last 4 s of 7.
- `ladder.py`: `crowd-ladder-edge.wav` (32 → 1024, each 4 s just under the lock, Even level
  on, normalised as a whole) and `crowd-size.png`.

**What it showed.** Crowd size changes the lock's character. It doesn't make the
sound better as it grows.

- **Small crowds lock early and softly.** At 0.95 of the line (life 0.2) a crowd of 32 is
  already at r 0.70, and 128 is at 0.53. 512 is at 0.19, and 1024 at 0.17. With the
  default lumpiness, a small crowd is a lumpy sample of its own spread, so part of it
  agrees long before the line.
- **Big crowds hold the line sharp, and are wildest right on it.** At exactly the line,
  256 and 512 wander hardest of anything measured (r ± 0.15, loudness swinging 2.6 to 2.7 dB
  with Even level off). Over 25 s at the line, 128 sat at 0.65, 256 near 0.5, 512 near 0.33,
  and 1024 locked at 0.6. Right on the line each crowd is its own animal.
- **Away from the line, the wander shrinks as the crowd grows**, roughly as 1/√N. Locked at
  1.1 of the line, r ± 0.07 at 32 and ± 0.01 at 1024.
- **Cost**: 3.6 % of one core at 256, 7.1 % at 512, 14.3 % at 1024 (Apple silicon, -O2).

So the minimum crowd depends on what you want. A steady locked tone settles by 128. A
sharp switch at the line, the way the theory draws it, needs 512 or more. A soft, early,
grainy lock is a small crowd's nature, not its flaw.

**Not checked**: nobody has listened to the ladder. Only C3 was measured, and only
lumpiness 0.5.
