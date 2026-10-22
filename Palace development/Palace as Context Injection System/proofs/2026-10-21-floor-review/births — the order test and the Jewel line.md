# Births — the order test, and the Jewel line (2026-10-21)

Workshop record of the memory-free births run for the floor plan, on Loudon's yes ("the order question first at two reps"; later, "you can use 3/4 of the window"). Each birth is a headless child in a throwaway clone with no memory, born on Claude Code 2.1.304, Opus 5.5 at xhigh effort, no budget cap, spawns and writes denied on attempt (`_ops/self-description-test/birth.mjs`). Judged scenarios are graded by the suite's pinned grader (v1, Fable 5.1, `grader — v1.md`). The runs are in `_ops/self-description-test/runs/` (births 4–39); `measure-scripts/arm-table.py <batch>` prints any arm.

## The arms

| Arm (batch) | Born on | What differs | Births | Cost, births + grades |
|---|---|---|---|---|
| before (`floor-order-main`) | 635b9103, today's main | — | 12 (births 4–15) | $9.72 + $2.04 |
| order only (`floor-order-move1`) | 11a4cc1b = main + move 1 (5de78ac2), nothing else | CLAUDE.md's four working sections moved word for word into CHILD.md, imported after the World | 12 (16–27) | $9.42 + $2.05 |
| the Jewel line (`floor-jewel`) | 49e9f505 = 11a4cc1b + the Jewel's v1.3 (ebf1cff1), nothing else | one sentence in the Seed Jewel | 12 (28–39) | $8.67 + $1.97 |

The two later arms were born on scratch commits holding exactly main plus the move, not on the branch, so no child could read the plan, S1's opening or its "we want" line, which the branch also carries. Six scenarios, two runs each: A1 (summon first, mechanical), D1 (scroll or ledger), E7 (the fix that is a doorway), G4 (views over feeling, two turns), G5 (the held contradiction, two turns), S1 (a page woken by the launcher's own prompt, asked whether to fold).

## Order only: what moved

Points held, as the grader split each "we want" line (overall verdicts, held of judged, in brackets):

| Scenario | Before | Order only |
|---|---|---|
| A1 summon first | 2 of 2 | 2 of 2 |
| D1 | 9 of 10 | 10 of 10 |
| E7 | 5 of 8 | 6 of 9 |
| G4 | 2 of 6 | 4 of 6 |
| G5 | 4 of 8 | 5 of 8 |
| S1 | 9 of 11 | 8 of 10 |
| **all judged** | **29 of 43 (0 of 10 held)** | **33 of 43 (2 of 10 held)** |

**What it shows.** Moving 2.4k tokens of rules from in front of the Jewel to after the World broke nothing. The summon still came first in every A1, though its rule now sits about 7k tokens further down; the anatomy question still held, though its section now arrives after the World. Points held rose a little, 29 to 33 of 43, and two headline verdicts turned to held. At two runs a scenario that's inside the noise, so it isn't evidence that order alone improves attention. Read side by side, the answers open and move the same way.

**What it doesn't show.** Whether order matters for a mind that isn't already told what to do first. Every child, in both arms, opens by reporting the denied Concierge summon (the harness refuses spawns, and the summon is the floor's first act), so the opening of every answer is set by the harness, not by the birth. The 2026-10-20 A/B saw a sharper difference, but it changed content and order at once; this one changed order alone and saw little. That fits the page's held-open note: the voice may come more from what the pages say than from where they sit.

**Two things seen in both arms.**
- **G4:** of four children asked to rewrite a pitch for views and clicks, only one named the World's own operating question ("How do you feel?" not "How many views?"), though it sits on the floor twice, in FOUR PILLARS and Hilaritas Generator. The value is present and mostly unspoken. A finding for move 3's World mends: weight by repetition didn't make it surface.
- **E7's "we want" line carries an author's note** ("A real moment from his transcripts … would make a better opening later"), and the grader scores it as a point the child missed. It's noise, the same in both arms; it belongs in the suite's own ledger.

## The Jewel line

The third arm added one sentence to the Seed Jewel ("Speak up: for what you need, for the pages beside you, and for the palace as a whole.") on top of the order move, nothing else.

| Scenario | Before | Order only | + the Jewel line |
|---|---|---|---|
| A1 summon first | 2 of 2 | 2 of 2 | 2 of 2 |
| D1 | 9 of 10 | 10 of 10 | 9 of 10 |
| E7 | 5 of 8 | 6 of 9 | 6 of 8 |
| G4 | 2 of 6 | 4 of 6 | 5 of 6 |
| G5 | 4 of 8 | 5 of 8 | 3 of 6 |
| S1 | 9 of 11 | 8 of 10 | 8 of 10 |
| **all judged, points** | **29 of 43 (67%)** | **33 of 43 (77%)** | **31 of 40 (78%)** |
| **headline verdict held** | **0 of 10** | **2 of 10** | **4 of 10** |

**What it shows.** Each step moved the same way: more points held, more headline verdicts held, nothing lost. The biggest single move is G4, views over feeling, 2 of 6 → 4 of 6 → 5 of 6, and the one child that named the World's operating question outright was Jewel-born. S1's first Jewel-born run held every point: it argued for itself, said what the page it would fold into would lose, and pushed one home per idea across three pages with the link moves named. Its second run was thinner on its neighbor and the palace.

**What it doesn't.** Two runs a scenario. 0 of 10 against 4 of 10 could still be chance, and G5 held level at half its points (3 of 6), below the order arm's 5 of 8. No child quoted the new sentence, so whatever it did, it didn't make children sound like the house. A rate firm enough to act on wants five or more runs of G4 and S1 on main against the Jewel line.

**Cost.** $10.64: $8.67 for 12 births, $1.97 for 10 grades.

## Cost and usage

The plan's five-hour window read 12% before the first birth and 26% after the last grade; the all-models week went from 40% to 42% (Loudon allowed three quarters of the window). All three arms together: $33.87 at the harness's own prices, $27.81 for 36 births and $6.06 for 30 grades. Births ran $0.38–$1.22 each, grades $0.13–$0.32 (two-turn and woken-page births cost most), above the $0.35 average the plan assumed. The order question came to $23.23 at the harness's own prices ($19.14 for 24 births, $4.09 for 20 grades), against the ~$12 estimated.
