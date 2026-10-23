---
title: "Palace Map — scroll"
born: 2026-10-22
links:
  - target: "[[Palace Map]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Palace Map's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# Palace Map — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Palace Map]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-22T13:17:41.445Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** — · **Stage:** growing · **Steward:** none — this page has no permanent steward yet
- **Plan:** agreed 2026-10-22 (today) · 4 made things since
- **Waiting on you:** nothing
- **Last shipped:** 2026-10-22 (today) — The open check is done: a fresh Concierge answered from the ring unprompted — the plan of 2026-10-22 is complete, nothing owed (`palace-map-ring-check-done-2026-10-22`)
- **Last commit touching this page:** 2026-10-22 `5c46da8b` — edit(Palace Map): the scroll's trail records Move 2 landed (ca616cac) and the plan complete; one check open

### Where this stands

Loudon, 2026-10-22: "…record the plan complete on the scroll." A fresh resident born with the new charter at 5c46da8b, with no word about the map in its prompt, took one gatherer address (collect the entries on Kuramoto Coupling and Endosymbiosis, and the bridges between them) and one oracle address (does the palace have a page on Resonance and Damping, and where would it live?). Both products cited `palace-map.py near` and `path` output, named the build they read (2026-09-26) and said what the map leaves out. The gatherer read the two homes' rings first and marked a body-only bridge, Palace Conatus, as not in the ring. The oracle found Resonance and Damping as a forward ghost from Differen…

### Open asks

_None — nothing is waiting on you._

### Decided

_Nothing decided on the board yet._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Agreed with Loudon on 2026-10-23**, in his words: "The words are approved as drafted, and the Plan is agreed as written. Have the Concierge place them, the proof files first, run the checks, and commit the deposit."

## Why

The map has a door now — `palace-map.py` and the ring the Concierge reads — but no keeper. On 2026-10-23 eight test runs showed what one needs ([[Palace Map — proof — map-agent-test]]): an LLM holding the whole edge list sees rhymes, routes and shapes that ring-by-ring reading misses, and gets the counts wrong; the script counts exactly and sees nothing it isn't asked. No run invented an edge when made to cite triples. The keeper is Sonnet with both hands: the whole map in context, the scripts to check, and nothing leaving unverified. Haiku cannot hold the map and still talk.

Three moves, in the order each one needs the last.

## Move 1 — The keeper's tools

The checker moves out of the test and into the house: `_ops/swarm/verify-triples.py` (grown from the proof's `verify.py`) takes any text, finds every `[Source | relation | Target]`, and reports which are real against the named build. `palace-map.py` gains three verbs the test asked for:

| verb | returns |
|---|---|
| `path "<A>" "<B>" --only <relation>[,<relation>]` | the shortest route that keeps to those relation types, or says none exists |
| `rhymes "<Entry>" [--n 10] [--hub-cutoff 40]` | unlinked pages sharing the most neighbours, hubs set aside |
| `connected "<A>" "<B>" …` | whether a set of pages holds together through edges inside it, and the relation types it crosses |

And `--json` works after the verb as well as before it.

Done when: each new verb answers the test's ground truth (the mirror route of four hops to Haptic Handwheel and none to Stoicism; the hybrid's rhymes; the test's constellations); `verify-triples.py` gives the proof's counts on every run file; `test-palace-map.py` holds all three.

## Move 2 — The keeper

A new [[Agent Toolbox]] profile with Read and Bash and nothing else. That is not read-only — a shell can write anything — so the keeper's charter, not its tool list, holds that it writes nothing. The profile is generated with `node _ops/agent-toolbox/generate.mjs`. A charter in `_ops/palace-map-keeper/charter.md`: Sonnet, spawned once and re-addressed; reads the newest edge list whole at boot; forms an intuition, then tests it with the scripts; answers with every edge as a triple, every count from a script, and a log of what it believed and what the test said; runs `verify-triples.py` on its own answer before handing it back. The page's declared job goes on [[Palace Map]] — what to ask it, what comes back — so the page is the organ and the charter is its shim ([[Skills Are Enchantable Pages]]).

Done when: the keeper, spawned fresh, answers the proof's two question sets with the facts exact and every cited edge real, and its invention answers carry the log.

## Move 3 — First runs

Four uses, each a real run, not a demo: a constellation for a Daily Page sit; a route for a Walk (the Walk's door, deferred by the plan of 2026-10-22); a dialectic cast for a Dialectic, drawn from the `contradicts` edges; rhymes for a Weave, posted as unjudged candidate flags only on Loudon's yes.

Done when: a Weave takes up a flag the keeper raised, and the map's tuning ledger opens with the runs' lines.

## Order and cost

Move 1 first: workshop code with tests, no house change. Move 2 needs its tools and changes [[Agent Toolbox]] and [[Palace Map]], so it comes to Loudon as words to read. Move 3 is the keeper at work; the test's Sonnet runs took 90–180K tokens each.

Not in this plan: minting the keeper as an organ of its own; a Haiku front door; carrying the citation rule past this page. Each waits on the first runs.

## Open

- Should the keeper load the JSON's fields per node (type, stage, use) beside the edge list, at about four times the size, or only the edge list?
- The builder maps a workshop draft as a phantom page. Skip files under `proofs/`, or files whose title already belongs to another page?
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="plan-2026-10-23" -->
### 2026-10-23 — Plan agreed: build the map's keeper — its tools, the keeper, its first runs
Loudon, 2026-10-23: "The words are approved as drafted, and the Plan is agreed as written. Have the Concierge place them, the proof files first, run the checks, and commit the deposit." Replaces the plan of 2026-10-22, recorded complete on this trail. Why it changed: the map-agent test ([[Palace Map — proof — map-agent-test]]) showed the map has a door but no keeper, and what a keeper needs. Placed by the Concierge with deposit D-2026-10-23-MAPAGENT.
<sub>`plan-2026-10-23` · plan agreed · Loudon, placed by the Concierge</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="palace-map-ring-check-done-2026-10-22" -->
### 2026-10-22 — The open check is done: a fresh Concierge answered from the ring unprompted — the plan of 2026-10-22 is complete, nothing owed
> checked · Move 2's done-when met · plan complete

Loudon, 2026-10-22: "…record the plan complete on the scroll." A fresh resident born with the new charter at 5c46da8b, with no word about the map in its prompt, took one gatherer address (collect the entries on Kuramoto Coupling and Endosymbiosis, and the bridges between them) and one oracle address (does the palace have a page on Resonance and Damping, and where would it live?). Both products cited `palace-map.py near` and `path` output, named the build they read (2026-09-26) and said what the map leaves out. The gatherer read the two homes' rings first and marked a body-only bridge, Palace Conatus, as not in the ring. The oracle found Resonance and Damping as a forward ghost from Differential Equations, through the ring and the To-Do. Concierge tuning item 3 is paid in place. With this, every move and the check of the plan agreed this morning are done.
<sub>`palace-map-ring-check-done-2026-10-22` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="palace-map-move2-landed-plan-complete-2026-10-22" -->
### 2026-10-22 — Move 2 landed: the Concierge is born with its ring (ca616cac) — the plan agreed this morning is complete
> shipped · Move 2 of 3 · the plan of 2026-10-22 complete · one check still open

Loudon, 2026-10-22: "The Move 2 lines are approved as drafted. Have the Concierge place them, fold in the README word, commit, and record the plan complete on the scroll." ca616cac places one habit in the Concierge: find the home entry, read its ring with `palace-map.py near`, then search, and cite the ring where it carried the answer. A bullet in the charter; gatherer step 1 split in two; the oracle reads the ring before the neighbors; the scout adds `quiet --n 10` and `ghosts --persistent` beside `return-map.mjs`; the curator begins at one hop; Deposit Ceremony Step 3 gains one sentence (v2.7, item 29); the Concierge entry and `_ops/concierge/README.md` each carry one line (Concierge ledger item 3). The README word is folded in. With this, all three moves of the plan have landed the day it was agreed: 5dceac6b (plan), a3ea9bca (Move 1, the query tool), 5346d7eb and fd3205ce (Move 3, the cadence), ca616cac (Move 2). **One check is open:** in a fresh session, one gatherer address and one oracle address cite a `near` output in their answer. It runs after this commit and is recorded here when done.

**Artifacts:**
- [companion.md — the charter's new bullet](_ops/concierge/prompts/companion.md)
- [gatherer.md — step 1 starts from the ring](_ops/concierge/prompts/gatherer.md)

_Next moves named:_ The open check: a gatherer and an oracle address in a fresh session citing a near output, recorded on this trail
<sub>`palace-map-move2-landed-plan-complete-2026-10-22` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="palace-map-move3-landed-2026-10-22" -->
### 2026-10-22 — Move 3 landed: the map is never older than the morning or the weave (5346d7eb, fd3205ce)
> shipped · Move 3 of the plan agreed 2026-10-22 · Move 2 remains

Loudon, 2026-10-22: "The Move 3 decisions and card edits are approved as drafted. Write the build-map.py shim and its test, then have the Concierge place the card edits and commit." Two commits. 5346d7eb: `_ops/swarm/build-map.py`, the stable door to the newest dated builder, keeping the last three builds in `_ops/maps/` (git holds the rest), and `test-build-map.py` (3 tests, passing). fd3205ce: the card edits, word for word from the approved draft — Map Build v2.6 (a build is not a run: § Cadence, postcondition, Steps 6 and 7, the Harvest-close vector struck; tuning item 9), Weave v1.9 (build-map.py at the open and after the writes, `palace-map.py diff` against the last weave's map opening Step 2 and closing the report; item 46), The Daily Page v0.6 (the morning builds the map, deals, then reads the page's ring with `near`; the sit's commit carries the map; item 54), the task SKILL and README listing four tools, the Coordinator template calling `palace-map.py list`. The live scheduled-task copy outside the palace is untouched. What remains of the plan is Move 2: the Concierge born with its ring.

**Artifacts:**
- [build-map.py — the stable door](_ops/swarm/build-map.py)
- [test-build-map.py — 3 tests](_ops/swarm/test-build-map.py)
- [Map Build Ceremony v2.6 — § Cadence](_ops/Map Build Ceremony.md)

_Next moves named:_ Move 2: the Concierge born with its ring
<sub>`palace-map-move3-landed-2026-10-22` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="palace-map-move1-landed-2026-10-22" -->
### 2026-10-22 — Move 1 landed: palace-map.py, one query tool that reads the map from where an agent stands (a3ea9bca)
> shipped · Move 1 of the plan agreed 2026-10-22 · Moves 2 and 3 wait on it

Loudon, 2026-10-22: "The plan is approved as written… then start Move 1, the query tool." Built and committed the same day as a3ea9bca. `_ops/swarm/palace-map.py` reads the newest dated map, names the map it read on every answer, opens no entry body, and prints edges one per line. Verbs: near, path, hubs, quiet, ghosts (--persistent), diff, list; --json. `_ops/swarm/test-palace-map.py` holds `near` to the builder's degree for every node, `path` to symmetry, `diff` of a map against itself to empty: 5 tests, passing. Every verb ran against the 09-26 map and a fresh 10-22 build made in the session scratchpad, not placed in _ops/maps. `extract-neighborhood.py` stays until Move 3 edits the Weave's Coordinator Synthesis Template, which still calls it.

**Artifacts:**
- [palace-map.py — the query tool](_ops/swarm/palace-map.py)
- [test-palace-map.py — 5 tests](_ops/swarm/test-palace-map.py)

_Next moves named:_ Move 2: the Concierge born with its ring · Move 3: the map never older than the morning
<sub>`palace-map-move1-landed-2026-10-22` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-22T01-49-54-04-00" -->
### 2026-10-22 — Plan agreed: a plan for the map's use: one query tool, the Concierge born with its ring, a map never older than the morning

Loudon, 2026-10-22: "The plan is approved as written. Have the Concierge place it as the Palace Map scroll's plan, then start Move 1, the query tool." The plan came from the workshop draft map-use-plan — DRAFT 2026-10-22.md, placed by the Concierge with its DRAFT header and the answered question (where the plan lives) dropped; the draft is deleted.
<sub>`plan-2026-10-22T01-49-54-04-00` · plan agreed · agreed 2026-10-22T01:49:54-04:00 · Loudon, placed by the Concierge</sub>
<!-- /scroll:entry -->

_Nothing made yet — the first shipped thing will open the trail._
<!-- scroll:making:end -->
