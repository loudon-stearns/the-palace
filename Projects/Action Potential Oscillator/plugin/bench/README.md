# What the engine costs

Measured 2026-11-09 on Loudon's M1 Max, one core, `-O3` as the plugin builds. `bench.cpp` runs `algo::Algorithm::step()` the way the plugin does, one call per sample, a note held, best of five 3-second runs after a second of warm-up. Numbers are percent of one core in real time.

**As installed** (`src/Algorithm.h`, `bench-2026-11-09.tsv`):

| case | 1 | 8 | 16 | 32 | 64 |
|---|---|---|---|---|---|
| default, 44.1 kHz, A2, locked | 0.44 | 0.93 | 1.62 | 2.82 | 5.21 |
| scattered (no coupling, spread 0.3) | 0.46 | 0.98 | 1.63 | 2.86 | 5.45 |
| default, 48 kHz | 0.48 | 1.06 | 1.90 | 3.27 | 6.17 |
| default, 96 kHz | 1.00 | 2.15 | 3.60 | 6.31 | 11.49 |
| A5, 48 kHz, 0.3 ms spike | 0.33 | 0.45 | 0.74 | 1.16 | 2.08 |

About 17 ns per neuron per sample. Locked or scattered costs the same: the coupling is one shared number, not N×N.

**Where it goes.** The `pow (a, m)` in the charging branch is about 60% of it: swapping it for a cheap stand-in (timing only, wrong sound) took 64 neurons from 5.2% to 2.0%. That is also why a high note is cheaper: the neurons spend less of each cycle charging.

**The fix, proved but not installed** (`bench-2026-11-09-cached.tsv`). While a neuron charges, `a` and `m` don't change unless a knob or the glide moves them, so `pow` can be cached per neuron and recomputed only when its inputs change. `exact.cpp` renders 50 s through both engines (every crowd size, coupling swept, a second note gliding in) and the outputs are **bit-identical**. Cached, 64 neurons cost 2.0% at 44.1 kHz and 4.2% at 96 kHz, about 2.6× cheaper.

To land it: apply the change below to `src/Algorithm.h`, then run `./plugin.sh all` to rebuild, verify against the sketch and reinstall.

```cpp
// state:   std::array<double, kMax> ca {}, cm {}, cc {};
// branch:  if (a != ca[u] || m != cm[u]) { ca[u] = a; cm[u] = m; cc[u] = std::pow (a, m); }
//          const double c = cc[u];
```

**For the RNBO crowd of 512** (Neural Granular Synthesis): extrapolated, not measured — at 17 ns per neuron-sample this design would take about 40% of a core at 44.1 kHz, about 15% with the cache.

Not measured: the plugin inside Live (host overhead, the editor's drawing), and any Mac other than this one.
