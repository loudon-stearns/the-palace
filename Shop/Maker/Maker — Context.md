---
title: "Maker — Context"
born: 2026-10-24
links:
  - target: "[[Maker]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why the Maker is long and ordered as it is — what each part owns, what it hands to the Specialists, the design systems and its own bundle, and what it tried and let go — so the next worker puts a rule in the right place instead of making the page longer."
---

# Maker — Context

Why [[Maker]] is shaped as it is. [[The Shop — Context]] holds the pattern's side; this holds the foreman's.

## The skeleton came first

The Maker was born with The Shop on 2026-05-09 (`06b5dac1`) at 13 KB, and its section order then is its order now: Charter and Voice, how a job runs, intake, routing, standards, tiers, comparison, resources, then the record — roster, recipes, tests, gotchas — and the closers. The order follows a brief through the foreman's hands: decode it, route it, resolve what it must obey, pick a tier, check the host, dispatch, report. Two sections were added where the work forced them, each at its place on that path. The Articulated Cascade came on 2026-05-28 with the [[Loudon Live Design System]] (`023dd3fd`). The Host Capability Check came on 2026-05-30 (`06ab0f42`), out of the 2026-05-10 gotcha in which Manim died at install time on a sandbox after the brief was already decoded.

It speaks in the first person, with a Charter and a Voice, because the foreman is also a citizen of the Shop: a `maker`-type page that declares itself `member-of [[The Shop]]` as its foreman.

## Why it may be long, and where the length sits

Every brief reads this page, so what a brief needs lives here. Of about 49 KB on 2026-11-14, Selection Heuristics holds 9.1 KB, Recipes 7.0, House Standards 5.9, the Cascade 5.5, the Host check 4.1 and the Roster section 2.2. Heuristics is the largest on purpose. It is the house taste, codified, and the one thing no Specialist can hold for itself, because a route compares tools.

Not all the length runs the job. The page went from 13 KB to 34 KB in the three weeks that ended with the Shop build session (`Shop/Maker/SHOP-BUILD-SESSION-2026-05-30.md`, phases A–F), and much of what it kept from that run is dated history: the promotion log, the long Recipes, the Comparison Mode executions. They sit inline because for its first six months the Maker had no tuning ledger, which is where [[SCHEMA — Reference]] §8 puts what running taught. [[Maker — tuning]] was seeded on 2026-11-07 from the page's Gotchas; the Recipes and the Comparison Mode executions were not moved into it. The page's own Open Question — memory across sessions, or restart from the recipes? — was that gap seen from inside, and now names the ledger as its answer. [[ELDER]]'s line applies: length is a claim about importance, and history in an operating card claims more than it should.

## What belongs where

The Maker holds the routes, the floors and the order of a job. Everything else has an owner, and the page points rather than copies — "I inherit it, I don't own a second copy," it says of the [[Review Layer]] (Shop/Maker.md:156).

- **A tool's traps, tiers and parameters** go on the Specialist's page. A heuristic may carry a caveat that changes the route — d3-force is a relaxation solver — but not the fix.
- **Tokens, type and palette** belong to the three dresses: [[Drafting Table Design System]], [[Loudon Live Design System]], [[STIGMERGY#The look|STIGMERGY's look]]. The Maker owns only the mechanical floor.
- **Membership and status** live in each Specialist's frontmatter, rendered into [[The Shop]] § Roster by `Shop/Maker/build-roster.mjs`.
- **Which host runs what** lives in `Shop/Maker/host-capability.json` and its check script; the page's tables read it.
- **The full form of a whole-brief run** goes in the bundle (`coordination-demos/`, `comparisons/`) or the project that ran it. A Recipe here earns its place only when a whole brief taught routing or coordination.
- **A rule's story** stays with its entry: the RunPod outage behind the engineering floor is told in [[assume multi-agent]].

So a rule every brief must obey is a short paragraph in House Standards with a pointer to its owner, and a new route is a paragraph in Selection Heuristics with its evidence named.

## Tried and let go

- **A roster in the frontmatter.** The Maker once listed every Specialist as a `directs` link. The 2026-06-16 migration (`88aaa00e`) moved membership onto each Specialist. The generated roster, that migration's Phase 2, came the same day (`d43c398d`); the HTML comment under the frontmatter, which called it still to come, was corrected on 2026-11-14.
- **A hand-kept roster.** Status lived in three places that disagreed until 2026-05-30, then in one hand list that drifted three Specialists stale and miscounted the alive, until the block was generated.
- **Midjourney.** Routed for aesthetic ceiling, given the cloud host class and a credit tally. Its comparison with ComfyUI never finished; the 2026-05-30 half-comparison declined to change a default on one vendor's evidence, and FLUX took the slot on 2026-06-01 (`e2773ac8`). The entry was deleted 2026-09-26 (`cebe2cd6`).
- **"Default to ComfyUI when in doubt — local-first,"** retired with that comparison once its cost premise was gone.
- **"Charts → Matplotlib or Plotly,"** split three ways after the [[Flocking]] shoot-out (`90710805`). Plotly and Graphviz are still named and still have no page; since 2026-11-14 the routes say so.
- **The silent title card** "for breathing room," superseded by narration on every section when operator memory came into canon on 2026-07-03 (`83222581`).
- **One palace base.** Loudon Live was the base and BBS the only override until the three-dress rule reached this page in this weave (`e3f8020a`).
- **Links with no sentence behind them,** cut in this weave: `embodies` [[Hilaritas Generator]] and `follows` [[FOUR PILLARS]] (`ed04958f`), and the Maker's half of a doubled link to [[RunPod GPU Backend]] (`0dba352d`). ControlNet Workflow Mastery was unlinked as a ghost; the page still calls its harness pending.

## The split still deferred

On 2026-05-30 Loudon kept Selection Heuristics in the Maker rather than a House Taste page: 36 lines and 4,656 characters, "borderline-1-screen but not over," the split deferred until a major addition pushed it past one screen (`ac9b7ef6`). By 2026-11-14 it ran 49 lines and about 9,100 characters and routed to none of fourteen Specialists. Meanwhile the other split the Open Questions anticipated, per-medium Designers, has its first case in [[Frame Designer]] (born 2026-06), and the Maker's page does not yet name it.

## Why the routing is a tree

On 2026-11-15 Loudon adopted the decision tree drafted the day before ([[The Shop — sketch — decision tree]]) and asked for a zoom out in it. The routes had been keyed by the deliverable — "narration → Kokoro", "math content → Manim" — and a made thing is rarely one tool's work, so the tree asks per part what kind of thing it is. The question came out of the Oliveros room comparison and BLUELINE's table of stages ("choose each tool for what it does best, then collect and edit together"). Each line is marked with what stands behind it, because a route nobody has heard reads with the same authority as one Loudon judged unless it says otherwise. "Always" went out of the routes with it: Loudon asked twice that the Shop's pages not hold back a more able model, so a line says what was seen to work, dated. The zoom out sits in the tree, not only in the [[Shopkeeper]]'s sweep, because the bench is where a maker notices the tool is not enough. The tree is longer than the routes were; it now names every Specialist, which is the work the closing paragraph of fourteen names had pointed at. Whether its length crosses the line he drew in May is still his call.

## Written ahead of the work

The body's Forward Vector still plans "the first Comparison Mode test," a FLUX–ComfyUI header, though Comparison Mode first ran in full on 2026-05-29 ([[Flocking]]) and the FLUX–ComfyUI comparison closed on 2026-06-01 (`e2773ac8`). It is the May plan, still standing after the work it planned was done; what replaces it is Loudon's to say.

The Test Suite read "Last run: never" until 2026-11-14, while the host check's tests and `run-tests.mjs` ran beside it in the bundle. It now says what runs and when, and that the Maker's own routing tests are named but unwritten: `Shop/Maker/tests/test-plan.md` does not exist.
