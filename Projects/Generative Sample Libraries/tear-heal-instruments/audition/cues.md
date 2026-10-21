# Audition — what plays when

`audition.wav`, 1.9 minutes. Each patch plays its lowest and its highest key, soft, mid and hard, each held until about two seconds after it heals, then released. Played through the written SFZ (keycenter, tune, loop, release, velocity), so this is what a sampler will play.

Columns: the deepest the smoothed pitch fell below where it settles (cents), when it healed (stayed within 5 cents of its settled pitch), and how much the sustain still moves after that (cents, standard deviation; the sweeps' tear line is 7.9).

| starts at, s | instrument | key | layer | dip, c | healed at, s | sustain wobble, c |
|---|---|---|---|---|---|---|
|    0.0 | Heal | C1 | soft | 22 | 0.72 | 3.21 |
|    4.4 | Heal | C1 | mid | 52 | 1.19 | 3.21 |
|    9.0 | Heal | C1 | hard | 123 | 2.00 | 3.26 |
|   14.4 | Heal | C7 | soft | 42 | 0.14 | 0.29 |
|   18.8 | Heal | C7 | mid | 169 | 0.21 | 0.29 |
|   23.2 | Heal | C7 | hard | 328 | 0.28 | 0.29 |
|   29.0 | Snap | C3 | soft | 33 | 0.33 | 0.16 |
|   33.1 | Snap | C3 | mid | 108 | 0.50 | 0.16 |
|   37.2 | Snap | C3 | hard | 277 | 0.67 | 0.17 |
|   41.3 | Snap | C7 | soft | 36 | 0.08 | 0.19 |
|   45.4 | Snap | C7 | mid | 146 | 0.12 | 0.2 |
|   49.5 | Snap | C7 | hard | 302 | 0.17 | 0.2 |
|   55.0 | Bar to String | C2 | soft | 270 | 1.27 | 2.84 |
|   59.9 | Bar to String | C2 | mid | 273 | 1.93 | 2.47 |
|   65.4 | Bar to String | C2 | hard | 287 | 2.45 | 2.55 |
|   71.4 | Bar to String | C6 | soft | 318 | 0.26 | 0.14 |
|   76.0 | Bar to String | C6 | mid | 281 | 0.41 | 0.13 |
|   80.6 | Bar to String | C6 | hard | 315 | 0.54 | 0.14 |
|   86.6 | Heal with Voices | C1 | soft | 22 | 0.72 | 3.21 |
|   91.0 | Heal with Voices | C1 | mid | 52 | 1.19 | 3.21 |
|   95.6 | Heal with Voices | C1 | hard | 123 | 2.00 | 3.26 |
|  101.0 | Heal with Voices | C6 | soft | 36 | 0.18 | 0.27 |
|  105.4 | Heal with Voices | C6 | mid | 82 | 0.27 | 0.31 |
|  109.8 | Heal with Voices | C6 | hard | 237 | 0.38 | 0.3 |

`first-note.wav` is separate: the baton's own strike, rendered with gestures_warm.py's settings and nothing designed. Dip 97 c, healed at 0.90 s, sustain wobble 1.47 c.
