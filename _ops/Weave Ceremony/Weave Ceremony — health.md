---
title: "Weave Ceremony — health"
born: 2026-10-24
links:
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: health-for
forward_vector: "I am the Weave's health ledger: one row per weave, the same numbers every time, so the palace can see whether it is growing more nuanced or only more connected. Appended by weave-health.py at each weave's open and close; never pruned."
ledger: health
standards:
  for: "the palace's health, measured the same way at every weave"
  run: "one weave (a row at the open, a row at the close)"
  line: "| <date> | <map> | ... | <label> |"
  read: "the last four rows, against each other"
  writes: "weave-health.py --append, in the commit that records the weave"
  merge: union
  kept: git
  trim: never
---

# Weave Ceremony — health

One row per weave, the open and the close of each, measured by `_ops/swarm/weave-health.py` from the newest map and the four health scans (`lint-link-pairs.py`, `unsaid-links.py`, `bundle-audit.py`, `face-audit.py`) and the flag board. Read the last four rows against each other: the palace is healthier when the labelled share, the Contexts and the rich faces rise while the multi-link pairs, the unsaid links and the owed Contexts fall — not when the edge count does.

| date | map | nodes | edges | labelled % | bare connects-to | multi-link pairs (dup/weaker) | unsaid links (bare) | hubs: untyped ≥ decile / typed < median | no vector | quiet (deg≥15, unused 90d) | Context | scroll | tuning | rich | faces missing | Context owed | flags open (propagate) | label |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-24 | 2026-10-24 | 324 | 2940 | 67 | 558 | 410 (219/151) | 1028 (354) | 25 / 0 (decile 19, median 5) | 20 | 13 | 20 | 60 | 36 | 3 | 8 | 56 | 38 (13) | open · v1.9 map, before any write |
| 2026-10-24 | 2026-10-24 | 322 | 2380 | 85 | 46 | 2 (1/0) | 750 (143) | 12 / 0 (decile 16, median 4) | 20 | 6 | 26 | 61 | 36 | 3 | 0 | 38 | 3 (1) | close · v2.0 · after the writers (commit to follow) |
