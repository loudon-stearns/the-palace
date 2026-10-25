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

Every brief reads this page, so what a brief needs lives here. Of about 50 KB, Selection Heuristics holds 8.0 KB, Recipes 7.0, House Standards 5.9, the Cascade 5.3, the Roster section 4.9 and the Host check 3.8. Heuristics is the largest on purpose. It is the house taste, codified, and the one thing no Specialist can hold for itself, because a route compares tools.

Not all the length runs the job. The page went from 13 KB to 34 KB in the three weeks that ended with the Shop build session (`Shop/Maker/SHOP-BUILD-SESSION-2026-05-30.md`, phases A–F), and much of what it kept from that run is dated history: the promotion log, the long Recipes, the Comparison Mode executions. They sit inline because the Maker has no tuning ledger, which is where [[SCHEMA — Reference]] §8 puts what running taught. The page's own Open Question — memory across sessions, or restart from the recipes? — is that gap seen from inside. [[ELDER]]'s line applies: length is a claim about importance, and history in an operating card claims more than it should.

## What belongs where

The Maker holds the routes, the floors and the order of a job. Everything else has an owner, and the page points rather than copies — "I inherit it, I don't own a second copy," it says of the [[Review Layer]] (Shop/Maker.md:151).

- **A tool's traps, tiers and parameters** go on the Specialist's page. A heuristic may carry a caveat that changes the route — d3-force is a relaxation solver — but not the fix.
- **Tokens, type and palette** belong to the three dresses: [[Drafting Table Design System]], [[Loudon Live Design System]], [[BBS Design System]]. The Maker owns only the mechanical floor.
- **Membership and status** live in each Specialist's frontmatter, rendered into [[The Shop]] § Roster by `Shop/Maker/build-roster.mjs`.
- **Which host runs what** lives in `Shop/Maker/host-capability.json` and its check script; the page's tables read it.
- **The full form of a whole-brief run** goes in the bundle (`coordination-demos/`, `comparisons/`) or the project that ran it. A Recipe here earns its place only when a whole brief taught routing or coordination.
- **A rule's story** stays with its entry: the RunPod outage behind the engineering floor is told in [[assume multi-agent]].

So a rule every brief must obey is a short paragraph in House Standards with a pointer to its owner, and a new route is a paragraph in Selection Heuristics with its evidence named.

## Tried and let go

- **A roster in the frontmatter.** The Maker once listed every Specialist as a `directs` link. The 2026-06-16 migration (`88aaa00e`) moved membership onto each Specialist. The HTML comment under the frontmatter still calls the generated roster Phase 2, to come; it came the same day (`d43c398d`).
- **A hand-kept roster.** Status lived in three places that disagreed until 2026-05-30, then in one hand list that drifted three Specialists stale and miscounted the alive, until the block was generated.
- **Midjourney.** Routed for aesthetic ceiling, given the cloud host class and a credit tally. Its comparison with ComfyUI never finished; the 2026-05-30 half-comparison declined to change a default on one vendor's evidence, and FLUX took the slot on 2026-06-01 (`e2773ac8`). The entry was deleted 2026-09-26 (`cebe2cd6`).
- **"Default to ComfyUI when in doubt — local-first,"** retired with that comparison once its cost premise was gone.
- **"Charts → Matplotlib or Plotly,"** split three ways after the [[Flocking]] shoot-out (`90710805`). Plotly and Graphviz are still named and still have no page.
- **The silent title card** "for breathing room," superseded by narration on every section when operator memory came into canon on 2026-07-03 (`83222581`).
- **One palace base.** Loudon Live was the base and BBS the only override until the three-dress rule reached this page in this weave (`e3f8020a`).
- **Links with no sentence behind them,** cut in this weave: `embodies` [[Hilaritas Generator]] and `follows` [[FOUR PILLARS]] (`ed04958f`), and the Maker's half of a doubled link to [[RunPod GPU Backend]] (`0dba352d`). ControlNet Workflow Mastery was unlinked as a ghost; the page still calls its harness pending.

## The split still deferred

On 2026-05-30 Loudon kept Selection Heuristics in the Maker rather than a House Taste page: 36 lines and 4,656 characters, "borderline-1-screen but not over," the split deferred until a major addition pushed it past one screen (`ac9b7ef6`). Today it runs 45 lines and about 8,000 characters (Shop/Maker.md:83–127), and it never routes to four Specialists the folder reader found — Depth Anything, Figure Rig, LoRA Trainer, OBS. Whether that crosses his line is his call. Meanwhile the other split the Open Questions anticipated, per-medium Designers, has its first case in [[Frame Designer]] (born 2026-06), and the Maker's page does not yet name it.

## Written ahead of the work

The body's Forward Vector still plans the first Kokoro round-trip, and the Test Suite reads "Last run: never" against a `tests/test-plan.md` marked TODO, while `run-tests.mjs` and `host-capability-check.test.js` exist beside it in the bundle. Both are the May plan, still standing after the work it planned was done.
