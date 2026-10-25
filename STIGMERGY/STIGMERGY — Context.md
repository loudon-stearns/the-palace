---
title: "STIGMERGY — Context"
born: 2026-10-24
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why STIGMERGY's page is shaped as it is — what it hands to its neighbours and its archive, what the deck tried and let go, and why the page reads as a stack of dated layers — so the next edit can tell the page's claims from its history."
---

# STIGMERGY — Context

Why [[STIGMERGY]] is shaped as it is. What each change to the deck taught is in [[STIGMERGY — tuning]]. The move in flight is in the baton and its spec. The lesson about tools that assume a still board is in [[STIGMERGY — sketch — the-substrate-drifts]]. This file holds none of those. It holds the reasons behind the page's shape.

## A page named for a philosophy, written about a machine

[[Palace Philosophies]] lists STIGMERGY among the palace's living philosophies: coordination by trace, the ant's way. A child that follows that link expects the philosophy and lands on a terminal with five decks. The page keeps the philosophy to three places: the Grassé epigraph, the mirror to [[Pheromone Trail]], and one rung of the handoff ladder, where the heartbeat turns out to be the ant laying fresh scent. The idea is treated more fully elsewhere. [[Pheromone Trail]] has the ant colony, where no single ant knows the map. [[BBS Blackboard]] § The BBS as Stigmergy has the architecture, and since its vector was fulfilled its job is to keep "the architecture and philosophy I named". Hold both readings. Running the philosophy is how the palace shows it believes it. Still, a reader who came for the ant gets the plumbing first.

The page also describes, where most pages specify. It entered git on 2026-06-07 in the Schema Ceremony that "ratifies and names an already-running system rather than inventing vocabulary" (`09e84b60`), two months after its `born: 2026-04`. It was written to name a thing already in daily use. That is why its verbs are present-tense reports and not designs.

## What it left out, and where that lives

The page is a hub that hands its depth elsewhere:

- **The wire.** The envelope, the message types, the boards: [[SCHEMA]] §9. The page names the types and stops.
- **The executor.** Permissions and options, health scoring, the manifest, git detection: [[Palace Orchestrator]].
- **The look.** [[BBS Design System]]. Its link was folded on 2026-10-24 (`0dba352d`), the same day as the link to SCHEMA. Both are still named in the body.
- **The words in other traditions.** [[ROSETTA]] §4b. The catcher's checklist is [[Baton Ceremony — on-pickup]], kept as one copy and linted.
- **The thesis behind "you cannot fake completion".** The time-deck argument, the commit specification and the reconciliation engine are in [[STIGMERGY v1.0 — Palace Front-End]], now in the Archive. Its Revision 3 says it "remains the canonical statement" of all three. The page's strongest sentence rests on a file in `Archive/`.
- **The Companion.** The entry-agent window (discussion, honest in-place edits, graffiti, undo) was planned (the [[STIGMERGY Entry-Agent Window — Integration Plan v0.1]] in the Archive). Its Maker-dispatch tier was parked by choice, with revival conditions. The page never names it, and whether the branch merged is not recorded.
- **What it is not.** v1.0's own list: no Obsidian parity, no auto-pickup scheduler, a single operator on localhost.

## What was tried and dropped

- **A curses terminal.** The first host was Python `curses` (`Archive/stigmergy_intro.py`). That path was put aside for a browser that keeps the character-cell look ([[BBS Blackboard]] § BBS Design System).
- **Boards as the navigation.** v1.0 turned the six boards into lanes under three time decks. The build then re-promoted TRICKSTER and STEWARDS and stacked the old board viewer under the new inbox, so the same decisions showed up in three places. A v1.0 phrase, "Cormorant-register prominence", leaked Loudon Live's serif into a monospace terminal. The v2.0 consolidation of 2026-06-16 healed both ([[STIGMERGY v2.0 — Consolidation & Primary Interface]] § The assessment).
- **The STEWARDS roster.** The PROJECTS deck replaced it on 2026-09-23 (`4c4e721b`). In the same edit "primary" became "only" way of operating the palace.
- **Inferred done.** The board once retired a handoff when git or the filesystem seemed to show the work finished. Since 2026-07-07 (`4e8a65df`), only an explicit close retires it.
- **The infrastructure spec.** The technical foundation lived in Palace Agent Infrastructure Spec until it was retired on 2026-07-08 (`0932b7b4`). Its contents were split between SCHEMA §9 and the Orchestrator.
- **Commits on the bus.** Infrastructure agents once coordinated commits over the board. Since 2026-10-14 every commit goes through one door ([[How the Palace Commits]]). The page says so as of `c5e4d8e9`.
- **TRICKSTER for any note.** Narrowed to stewardship's blocking forks on 2026-09-24 (`400f5cbe`).
- **Enrichment's card queue.** Retired for the rich face the same day (`d7ab5219`).

The lease, heartbeat and dead-letter rungs were not dropped. They are deferred by design, written down so the next rung is a known direction, not a rediscovery.

## Why it is shaped so

**Two readers, one structure.** The opening says the board is a front-end to Loudon and an engine to an agent. Every section after it is written so both can use it: protocol names exact, prose human.

**The honesty discipline comes before the schema** because the order of the decks is the argument. The wire can be handed off. The reason the decks are ordered by time cannot.

**The handoff section is the longest, and the only one that argues from outside the palace.** SQS, AMQP and Beanstalkd are there because the fumble was already solved elsewhere, and the page borrows on purpose and says so.

**It grew in layers.** Each dated heading was added when its feature landed: 2026-06, then three for 2026-09. The result is a page that tells its own history. "Current state (2026-06)" now holds an October fact. The v2.0 paragraph tells the story of a drift that has since been healed. The frontmatter still says `version: "1.0"`, as it did at birth, and nothing says whether that tracks the page or the app. [[ELDER]]'s "write what is, not what was" pulls the other way. If the page is ever relaid in the present tense, the story can come here. That choice is Loudon's.

**It carries its move in flight.** Since 2026-07-05 (`73c3cc99`) an Active Baton section has sat in the body, rewritten at each catch. Those lines are among the most edited in its log. A reader always sees what the deck is in the middle of. The cost is that the page's top half changes faster than its claims do.

[[Palace Philosophies — Context]] reads STIGMERGY's version history through [[Simondon]] as a technical object becoming more itself. Three tools becoming one surface, as the forward vector puts it, is that concretization. Each item dropped above was a part that did one job and got folded into a part that does several.
