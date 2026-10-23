# Map agent test — results (2026-10-23, map build 2026-10-23: 324 nodes, 2933 edges)

Five contestants, same ten questions (`questions.md`). Every cited edge checked mechanically by `verify.py` against the map JSON.

| | Haiku · script | Haiku · map in context | Sonnet · script | Sonnet · map in context | Concierge (Opus, resident) |
|---|---|---|---|---|---|
| Cited edges real | 31/32 (the miss is one it wrote reversed and corrected in the same line) | **63/63** | 27/27 | 39/39 | 31/31 |
| Invented pages | 0 | 0 | 0 | 0 | 0 |
| Facts (Q1–8) | 8/8 | 6/8 — hub counts and relation counts wrong | 8/8 | 6/8 — hub order and counts off | 8/8 |
| Philosophical path (Q9) | 3 hops, sound | 3 hops, via Trickster | 4 hops, embodied striving → joy → surface → hand | 3 hops via Dichotomy of Control (leaned on CLAUDE.md, said so) | 4 hops, **opens on a contradiction** (Spinoza ⟂ Merleau-Ponty) |
| Constellation (Q10) | **disconnected**; falsely said FOUR PILLARS joins it | connected, densest (9 inner edges) | connected | connected | connected; pillars read from frontmatter |
| Tokens / time | 97K / 60s | 179K / 120s (near Haiku's 200K ceiling) | 90K / 65s | 163K / 90s | 110K cumulative / 75s |

## What it says

1. **No configuration invented an edge or a page.** The rule "cite every edge as a triple" plus a checker is enough of a guard. Make the checker part of the agent, not the grader.
2. **Counting needs the script.** Both map-in-context runs got the arithmetic wrong (hubs, relation tallies) while every script run got it exact. An LLM reads a graph; it doesn't count one.
3. **Seeing the whole map helps the creative work.** The densest constellation came from Haiku holding all 2,933 edges. The script gives only rings, so the creative answers were thinner (Haiku · script's fell apart).
4. **Sonnet · script ≈ the Concierge** on this set, cheaper and with no resident to keep.
5. **Haiku can't hold the map and also talk.** At 179K it's full before the conversation starts. A map that lives in context wants Sonnet's window.

## Shape this points to

One agent, two hands: **the whole map in context to see**, **`palace-map.py` to count and route**, and **`verify.py` on every answer before it leaves**. Sonnet, parked and re-addressed. Haiku only for single-verb lookups through the script.

---

# Creative set (`creative.md`) — three Sonnet setups

| | Sonnet · map in context | Sonnet · script only | Sonnet · hybrid (map + scripts + verify) |
|---|---|---|---|
| Cited edges real | 38/38 | 49/49 | 46/46 |
| Rhyme pairs truly unlinked | 3/3 (4, 4, 3 shared nbrs) | 3/3 (10, 6, 6) | 3/3 (6, 5, 10) |
| Rejected "forced" pair | 0 shared nbrs — right | 8 shared, all hubs — the subtlest call | 0 shared nbrs — right |
| Mirror walk (truth: 4 hops; Stoicism none) | right | right | right — after its first guess (5 hops) was refuted |
| Constellation | connected, 4 types | connected, 5 types incl. a contradicts | connected, 4 types |
| Tokens / time | 160K / 81s | 101K / 138s (ran `near` on every node — rebuilt the map by hand) | 179K / 152s |

Rhyme candidates surfaced (Weave material, unjudged):
- Flocking ~ Granular Synthesis · Parametric Resonance ~ Action Potential Oscillator · Entry Conatus ~ Pheromone Trail
- Bessel Functions in Synthesis ~ Piano String Inharmonicity · Julia Cameron ~ Pauline Oliveros · Blocked, Not Prompted ~ Graphic Storytelling
- Chebyshev is Fourier ~ Volterra Kernels and the Torus · Enchanted Conversation Archive ~ Pheromone Trail · Haptic Handwheel ~ Boundary-Crossing Instruments

Hybrid's intuition log: 3 intuitions refuted (Songlines~Walk Ceremony 0 shared; Murmuration~Swarm Weave hub-only; mirror walk 5→4), 1 find came from the script not the eye (Chebyshev~Volterra), and it learned hubs swamp shared-neighbour counts and filtered them.
