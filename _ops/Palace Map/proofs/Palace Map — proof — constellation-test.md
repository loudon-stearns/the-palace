---
title: "Palace Map — proof — constellation-test"
born: 2026-10-25
links:
  - target: "[[Palace Map]]"
    type: connects-to
    label: proof-of
forward_vector: "I am the evidence for which sky a woken page should carry: the counted one locates a page and bends its curiosity; the chosen one locates it and, on three pages so far, leaves it free. I exist so a page's waking is designed from what was measured, and I am done when more pages, woken more times, agree with me or overturn me."
---

# Constellation test — which sky a woken page should carry

**Date:** 2026-10-25 · **Map:** build of 2026-10-24, after the Weave's prune: 322 pages, 2,380 edges · **Files:** `2026-10-25-constellation-test/` — the scripts that reproduce every number (`constellation.py`, `foundations16.py`), the cards, both tasks, every run's answers and cited edges.

**Question.** Loudon asked whether the twenty most important pages could work "like a locator among the palace", and whether there is "any use supplying a simplified stripped down constellation to a page when it is spawned as an agent". Then he turned the question: "we are giving a page an understanding of the palace history and foundations more than 'what are the most connected'".

**Method.**
- **The counted sky:** the top 20 pages by inbound links, PageRank and betweenness, rank-summed (`constellation.py`). Sizes from 10 to 30 were swept.
- **The chosen sky:** sixteen foundations agreed with Loudon (`foundations16.py`), in four groups — where it came from, what every agent is born with, how it grows up, how it runs.
- **Cards:** for each sky, its pages, the threads among them, and the woken page's routes to its nearest few — about 1,200 tokens.
- **Woken pages:** Lao Tzu, Rank-N Lattice Analysis and Slime Mold Delay, each a Sonnet agent with only `palace-map.py near`. Round 1 (`task.md`): ring only, and ring plus the counted card. Round 2 (`task2.md`, with a fourth question): ring only, and ring plus the chosen card. Questions: where do you stand; a route to a page three hops off; one page beyond your ring you should know; which foundation you most embody and where you push against it.
- **Checks:** every cited edge against the build (`verify24.py`), every route (`route.py`), every quote against its file.

**Results.**

| | counted sky (20) | chosen sky (16) |
|---|---|---|
| pages one hop away | 269 of 322 | 180 of 322 (`foundations16-stats.txt`) |
| farthest page | 2 hops | 2 hops |
| threads among its pages | 79 | 43 |
| same pages across three builds | 18 of 20 | (chosen) |

| page | ring only | counted card | chosen card |
|---|---|---|---|
| **Lao Tzu** — leans on | Source Library, Making a Palace Citizen, Like Water · round 2: Making a Palace Citizen, Pages as Agents, JEWEL "only loosely" | Cooperation Yields Agency, FOUR PILLARS, Hilaritas Generator | Palace Philosophies, SCHEMA, FOUR PILLARS |
| page to know | Lateral Access · round 2: Pages as Agents | Cooperation Yields Agency | Lateral Access |
| **Rank-N** — leans on | DSP in Looping Dimensions, Kuramoto, FOUR PILLARS "no route" · round 2: FOUR PILLARS "did not verify", Kuramoto, Spinoza "did not trace" | FOUR PILLARS, Hyperdimensional Prism, Boundary-Crossing Instruments | FOUR PILLARS, Palace Philosophies, Cooperation Yields Agency |
| page to know | Kuramoto · round 2: Kuramoto | Hyperdimensional Prism | Kuramoto |
| **Slime Mold** — leans on | Spinoza Conatus, Kuramoto, FOUR PILLARS · round 2: Spinoza, Kuramoto, Biomechanical Synthesis | Kuramoto, Spinoza, Boundary-Crossing Instruments | Palace Philosophies, Cooperation Yields Agency, FOUR PILLARS |
| page to know | Donella Meadows · round 2: Cooperation Yields Agency | Cooperation Yields Agency | Cooperation Yields Agency |

Every cited edge was real: 59 citations in round 1 (counting the route files, which repeat some edges), 50 in round 2. Every route was valid, at three hops, the shortest. Every quote is in its file.

**What held.**
- Neither card shortened a route.
- Either card let a page name foundations and show the way to each; the ring alone gave local parents, or a foundation with no route. The gain was clearest for Lao Tzu and Rank-N.
- The counted card pulled every "page to know" onto itself. The chosen card did not: one of its three picks was on the card. The ring-only runs varied between rounds, so this is the softest of the findings.
- Every page in round 2 quoted the foundations from what it was born with. The chosen card adds where a page stands, not what the foundations say. The counted card was never asked this question.

**What it did not test.** More than three pages, or more than one run of each; pages woken for a real ceremony rather than a task; whether the sixteen are the right sixteen — that was drawn once, with Loudon.

**Let go.** The counted card as the card a page wakes with: declined, because it bends what a page looks for. A counted card without FOUR PILLARS: declined, untried and no longer needed.

**Side finds.**
- JEWEL has five inbound links (CHILD, Pages as Agents, Palace Map, Palace as Context Injection System, Symbiotic Skills) and ranks 42nd by PageRank; every agent carries it.
- [[SCHEMA]]'s sentence naming the `foundational` entries (Substrate Skill among them) has drifted from the frontmatter, where CHILD, ROSETTA, Meaning and the Link and SCHEMA — Reference also carry the stage.
