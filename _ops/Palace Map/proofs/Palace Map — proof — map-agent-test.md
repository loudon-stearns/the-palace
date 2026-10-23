---
title: "Palace Map — proof — map-agent-test"
born: 2026-10-23
links:
  - target: "[[Palace Map]]"
    type: connects-to
    label: proof-of
forward_vector: "I am the evidence for how an agent should hold the map — whole to see with, the script to count with, every edge cited and checked. I exist so the map's keeper is built from what was measured, not from a guess, and I am done when that keeper runs and its first runs either agree with me or overturn me."
---

# Map agent test — how an agent should hold the map

**Date:** 2026-10-23 · **Map:** build of 2026-10-23, 324 pages, 2,933 edges · **Files:** `2026-10-23-map-agent-test/` — each run's cited edges, the hybrid's answers and intuition log, and the coordinator's grading (`grading.md`, `RESULTS.md`). The other runs' full prose answers were graded in the session and not kept.

**Question.** Loudon asked whether "the map" could be a small, quick agent that knows the map and little else, and then how far an LLM holding the map could go beyond answers into finding. Could a cheap model answer correctly? Does it help to hold the whole map, or only to call the script? Does anyone invent edges?

**Method.** Two sets of questions. Ten of fact (`questions.md`): a ring, a shortest path, the top hubs, a page that does not exist ("Conatus"), relation counts, who contradicts Stoicism, an invented page ("Harmonic Lattice Garden"), a section returned word for word, a philosophical path, a constellation. Five of invention (`creative.md`): unlinked rhymes, a route on `mirrors` edges only (four hops to Haptic Handwheel; none at all to Stoicism), a dialectic cast, a teaching walk, a constellation on attention. Every agent cited each edge as `[Source | relation | Target]`. `verify.py` checked every triple against the map; `grade_creative.py` checked that rhymes were truly unlinked and constellations connected. Ground truth came from `palace-map.py` and Python over the JSON.

**Results — facts.**

| | Haiku · script | Haiku · whole map | Sonnet · script | Sonnet · whole map | Concierge (Opus) |
|---|---|---|---|---|---|
| Cited edges real | 31/32 (one reversed, corrected in the same line) | 63/63 | 27/27 | 39/39 | 31/31 |
| Facts right (Q1–8) | 8/8 | 6/8, counts wrong | 8/8 | 6/8, counts off | 8/8 |
| Constellation | two pieces; claimed a hub joined them | connected, 9 inner edges | connected | connected | connected |
| Tokens | 97K | 179K | 90K | 163K | 110K (cumulative: a resident that had already answered once) |

**Results — invention (Sonnet).**

| | Whole map | Script only | Hybrid: whole map + scripts + checker |
|---|---|---|---|
| Cited edges real | 38/38 | 49/49 | 46/46 |
| Rhymes truly unlinked | 3/3 | 3/3 | 3/3 |
| Mirror route | right | right | right, after its first guess was refuted |
| Tokens | 160K | 101K (ran `near` on all 324 pages) | 179K |

**What held.**
- No run invented a page or an edge. Required citation plus a checker is the guard.
- Both runs holding the whole map got the counts wrong; every run using the script counted exactly.
- Holding the whole map made the richest finds. The hybrid's log showed what the eye got wrong: three intuitions refuted, one find that came from the script alone, and the lesson that hubs swamp shared-neighbour counts.
- Haiku cannot hold the map and still talk.

**What it did not test.** Whether the rhymes are real connections — that is Loudon's judgment, and they go to the Weave as unjudged candidates. Whether answers stay right as the map ages through a day. Anything about entry bodies beyond one quoted section.

**Rhymes surfaced** (no edge either way, no mention in either entry body; shared neighbours counted with hubs included):
Haptic Handwheel ~ Boundary-Crossing Instruments (10 shared neighbours) · Bessel Functions in Synthesis ~ Piano String Inharmonicity (10) · Julia Cameron ~ Pauline Oliveros (6) · Chebyshev is Fourier ~ Volterra Kernels and the Torus (6) · Blocked, Not Prompted ~ Graphic Storytelling (6) · Enchanted Conversation Archive ~ Pheromone Trail (5) · Flocking ~ Granular Synthesis (4) · Parametric Resonance ~ Action Potential Oscillator (4) · Entry Conatus ~ Pheromone Trail (3).

**Side find.** A workshop draft, `Palace as Context Injection System/proofs/2026-10-21-floor-review/page-rewrite — preview, the whole page as it would read.md`, carries that page's full frontmatter, so the builder maps it as a node of its own, named for the file, with that page's edges, two `contradicts` among them.
