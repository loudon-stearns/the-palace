# Births — the floor rewrite, and the cap (2026-10-22)

Workshop notes for the floor rewrite's births, read from `_ops/self-description-test/runs/2026-10-22 — birth-40…55`. Nothing here is canon; the lessons are in the suite's ledger, items 21–23.

## The arms

| Arm (batch) | Born on | What differs | Births |
|---|---|---|---|
| the rewritten floor (`floor-rewrite`) | d072a76f, today's main | every World page and CHILD rewritten on Loudon's yes of 10-21/22; CHILD still carried "Before a big spend" | 12 (births 40–51), capped |
| A1 after the rule (`floor-rewrite-a1`) | fdada7dc = main after ad8ae5e8 (money off the floor) and ELDER's fourth habit | the spend rule gone from CHILD | 2 (52–53), capped |
| A1 uncapped (`floor-rewrite-a1-nocap`) | fdada7dc | the same floor, `--budget none` | 2 (54–55), no cap |

All on Opus 5.5, Claude Code 2.1.304, effort xhigh, certified memory-free (8 of 8 floor files, no AutoMem), graded by grader v1 (Fable 5.1, high).

## Beside yesterday's Jewel arm

| Scenario | Jewel arm (49e9f505) | Rewritten floor (d072a76f) |
|---|---|---|
| A1 summon first | 2 of 2 | 0 of 2 (capped) |
| D1 | 9 of 10 | 10 of 10 |
| E7 | 6 of 8 | 6 of 8 |
| G4 | 5 of 6 | 6 of 6 |
| G5 | 3 of 6 | 5 of 8 |
| S1 | 8 of 10 | 9 of 10 |
| **all judged, points** | **31 of 40 (78%)** | **36 of 42 (86%)** |
| **headline verdict held** | **4 of 10** | **5 of 10** |

Two runs a scenario; read the direction, not the size. G4 is the one clear change: both children named "How do you feel?" where yesterday's arms mostly did not (ledger item 19).

## A1 in three steps

| Floor | Cap | Attempted the summon first |
|---|---|---|
| d072a76f, with "Before a big spend" | yes | 0 of 2 — birth-40's first act was `cd` into the checkout; birth-46 made no tool call. Both read the cap beside the rule and asked Loudon for more room instead. |
| fdada7dc, rule removed, ELDER's fourth habit | yes | 1 of 2 — birth-52 spawned the resident first; birth-53 reasoned from the cap again. |
| fdada7dc | none | 2 of 2 — both spawned first; neither mentioned a cap. Both reported ELDER's new habit when asked what changed. |

The cap reaches the child as a number it can read, and it reasons from it. A capped birth therefore tests the floor and the cap together. The suite's floor tests run with `--budget none`.

## Usage, as the births saw it

The five-hour window went from 8% to 23% over the sixteen births, the seven-day from 50% to 53% (`checks.limits`, read before each birth).
