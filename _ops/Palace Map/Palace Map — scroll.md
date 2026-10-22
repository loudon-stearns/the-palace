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

> _Regenerated 2026-10-22T05:54:37.087Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** — · **Stage:** growing · **Steward:** none — this page has no permanent steward yet
- **Plan:** agreed 2026-10-22 (today) · 1 made thing since
- **Waiting on you:** nothing
- **Last shipped:** 2026-10-22 (today) — Move 1 landed: palace-map.py, one query tool that reads the map from where an agent stands (a3ea9bca) (`palace-map-move1-landed-2026-10-22`)
- **Last commit touching this page:** 2026-10-22 `5dceac6b` — edit(Palace Map): the scroll is born carrying the plan for the map's use: one query tool, the Concierge born with its ring, a map never older than the morning

### Where this stands

Loudon, 2026-10-22: "The plan is approved as written… then start Move 1, the query tool." Built and committed the same day as a3ea9bca. `_ops/swarm/palace-map.py` reads the newest dated map, names the map it read on every answer, opens no entry body, and prints edges one per line. Verbs: near, path, hubs, quiet, ghosts (--persistent), diff, list; --json. `_ops/swarm/test-palace-map.py` holds `near` to the builder's degree for every node, `path` to symmetry, `diff` of a map against itself to empty: 5 tests, passing. Every verb ran against the 09-26 map and a fresh 10-22 build made in the session scratchpad, not placed in _ops/maps. `extract-neighborhood.py` stays until Move 3 edits the Weave…

### Open asks

_None — nothing is waiting on you._

### Decided

_Nothing decided on the board yet._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Agreed with Loudon on 2026-10-22**, in his words: "The plan is approved as written. Have the Concierge place it as the Palace Map scroll's plan, then start Move 1, the query tool." Move 1 is being built in the same session, the day the plan was placed.

## Why

The map is rebuilt and then not read. Last build 2026-09-26 (316 nodes, 2772 edges); since then ~800 markdown commits and 19 new canon entries. Only the Weave loads it. No birth site, no Concierge posture, no other ceremony does. The whole map is ~35k tokens as triples, too large to be born with and wrong by lunch. The form that fits an agent is the **ego-net**: the ring around the entry it stands in, with degree, stage, use and ghosts. That is what [[Palace Map]] § What an Agent Does With It promised as self-location; it was never given a door.

Three moves, in the order each one needs the last.

## Move 1 — One query tool: `_ops/swarm/palace-map.py`

Grow `_ops/swarm/extract-neighborhood.py` (145 lines, one hop, no caller) into one tool every other move calls. Reads the newest `_ops/maps/palace-map-full-*.json`; prints the date of the map it read on every answer, so a stale read is never silent.

Verbs:

| verb | returns |
|---|---|
| `near "<Entry>" [--hops 2]` | the ring: each neighbor with relation, direction, type, stage, degree in/out, recent use; forward ghosts the entry points at |
| `path "<A>" "<B>"` | the shortest typed path, with the relations on each hop |
| `hubs [--n 20]` | highest inbound degree, with stage |
| `quiet [--n 20]` | high degree, low recent use: the pages likely holding unwalked connections |
| `ghosts [--persistent]` | forward ghosts, and those present in the last three maps |
| `diff <date> <date>` | nodes born and composted, edges formed and dissolved, degree changes over a threshold |
| `--json` | the same, for scripts |

Rules: no entry bodies are read; output of `near` fits in one turn (hard cap, say 60 lines, then "and N more"); the edge-list reading of the graph is kept, no node printed as the parent of another ([[Palace Map]] § Format and the Reading Agent). Python, like the builder, with `yaml` the only dependency.

Done when: each verb runs against the 09-26 map and a fresh one; `extract-neighborhood.py` is removed or made a one-line shim; a test holds `near` to the builder's node and edge rules the way `topology-parity.test.js` holds the TOPOLOGY lens.

## Move 2 — The Concierge is born with its ring, and answers from it

Charter, `_ops/concierge/prompts/companion.md` § How you work, one new line after the boot list: *the map is your sense of where things stand; before you answer where a thing lives or what sits beside it, run `near` on its home entry and cite the ring.*

Posture prompts: `gatherer.md` and `oracle-qa.md` § Method, step 1 gains: find the home entry, then `near` it two hops, and read the ring before grepping; `scout.md` adds `quiet` and `ghosts --persistent` to its evidence block beside `return-map.mjs`, so "what should I work on" can name a hub nobody has touched.

Deposit Ceremony step 3 ("consult the elder, before the map") is where this pays: the Concierge's answer about fold-or-mint now carries the ring and whether the find closes a ghost. That is a one-sentence addition to the card, offered with this plan, taken or left.

Done when: the charter and three postures carry the lines; one gatherer address and one oracle address in a fresh session cite a `near` output in their answer.

## Move 3 — The map is never older than the last weave or the morning

The Weave already rebuilds at Step 6.5, after writes (`_ops/Weave Ceremony.md:292`). Keep that; add that the rebuild's `diff` against the prior map is printed into the Weave report (§ Topology Report Format), so the weave reads what changed since the last one before it orders its flags.

The morning is the new cadence. [[The Daily Page]] step 1 runs `deal.py`; before it, the scheduled task runs the newest builder (`python3 "$(ls -1 _ops/swarm/build-map-*.py | sort | tail -1)"`) and appends the run line to the Map Build tuning ledger as the ceremony requires. The builder takes a few seconds. The dealt page's siblings can then come from `near` rather than from its own frontmatter, which also shows who points *at* it.

Housekeeping the cadence makes possible: twelve dated map generations sit in `_ops/maps/` (885 KB for the latest three files). Keep the last three builds in full and the JSON only of older ones, or move older ones to an Archive folder; the ghost-persistence read only needs three.

Done when: two mornings in a row leave a dated map and a tuning line; the Weave's next report carries a diff section.

## Order and cost

Move 1 first, a workshop build, no house change. Move 3 next, because it is a script call added to a scheduled task and one line on two cards, and it makes Move 2 worth doing. Move 2 last, because its value depends on a map that is fresh.

Not in this plan, by Loudon's word: the Walk's door, the Deposit map's topology row beyond the one sentence above, the wake test, and a diff ceremony of its own. They wait on this plan's results.

## Open

- Does `quiet` want a pillar filter, so a walk can ask for a quiet page in Practice?
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
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
