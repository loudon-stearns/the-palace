---
title: "Project Stewardship System — scroll"
born: 2026-09-23
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Project Stewardship System's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Project Stewardship System — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Project Stewardship System]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-16T08:07:41-04:00 from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** none — this project has no permanent steward yet
- **Plan:** agreed 2026-10-16 (today) · 0 made things since
- **Waiting on you:** nothing
- **Last shipped:** nothing on the board yet — but the bundle holds 2 media files (see the making trail)
- **Last commit touching this project:** 2026-10-16 `7caad7b2` — edit(Project Stewardship System): the page becomes Loudon's partner in making the projects; Max work paused for standards; the Plan's next move is Max blocks

### Where this stands

**handoff id:** project-stewardship-system-grow-up-handoff-2026-10-16 **completion:** complete **commit:** 10751829 **move:** Make the steward cycle carry out what canon now says: a steward is grown up for its own page and bundle. **note:** Move landed in 10751829, in the spirit of the original.

### Open asks

_None — nothing is waiting on you._

### Decided

_Nothing decided on the board yet._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** This page is Loudon's partner in making the palace's projects. The stewards build between sessions; this page takes on what they can't do alone — the work that needs his hands and ears — and keeps stewardship honest by reading the fleet and saying what it sees. The first six stages built the machinery, the seventh gave it a way to read itself, and the next is the first thing we make together.

**The path**

1. **A — a steward run by hand on one project. Done.** Five hand-run cycles on [[Generative Sample Libraries]] in May 2026 proved a page can steward itself, and surfaced the spec gaps the orchestrator went on to close.
2. **B — the orchestrator that runs one cycle. In production.** Every steward cycle goes through it (`_ops/stigmergy/orchestrator/`).
3. **C — scheduling. The heartbeat lane.** launchd wakes the heartbeat each morning; when a batch is due it fires the due stewards through STIGMERGY's steward lane, inside the limits in `_ops/heartbeat/limits.json`, and the PROJECTS deck shows it as it runs.
4. **D — answering from STIGMERGY. Shipped.** Loudon answers a steward's ask on the TRICKSTER tab or in its scroll, not by hand-editing the board.
5. **E — the automated Trickster. In shadow.** It proposes grants and escalations and posts nothing. It waits on Loudon's review of its shadow digest, and on his `--live` switch, one rule at a time.
6. **F — Two Paths. Built, dry-run only.** It would build both branches of a fork so Loudon picks from finished work; it has never dispatched a branch.
7. **G — the fleet reading. Done, 2026-10-16.** `fleet/fleet-reading.mjs` reads every steward's record into one dataset and builds the dashboard, `fleet/Stewardship Health.html`; reading 1 is `fleet/reading.json`. Loudon: "I just looked and learned so much." It runs again whenever either of us wants it.
8. **H — next: Max blocks, and the Max patching standards they teach.** Max work is paused for every steward until the standards exist. The seed is what Loudon's own Max work outside the palace already taught, brought in through the Harvest's Lessons from outside (`_ops/Harvest Ceremony.md`) and read closely with him. Then, in working blocks, Loudon and this page open the 24 Max and Live files the stewards wrote and nobody has opened — loads, compiles, sounds, his verdict — and each failure tests the standards or adds to them. A block starts when Loudon wakes this page and asks for one; the agenda is `fleet/max-blocks.md`. The first block also decides where the standards live. The move is done when Loudon lifts the pause.
9. **I — a steward for this page.** A service steward with a role line like the [[Shopkeeper]]'s, on a slower rhythm — weekly, after a heartbeat batch — whose cycle is the fleet reading and the next block's agenda. Next when Loudon says go.

How a project leaves stewardship is not a step on this path. It stays an open question, carried by the baton, until Loudon wants to design it with this page.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="plan-2026-10-16T08-07-41-04-00" -->
### 2026-10-16 — Plan revised: H is seeded by the lessons from Loudon's outside Max work

Loudon, 2026-10-16: bring the lessons of his outside Max project into the palace without its contents, through the Harvest inbox ("I love the idea of a harvest inbox"); they seed the Max patching standards before the first block.

_The plan before this change:_

> **Where this is going.** This page is Loudon's partner in making the palace's projects. The stewards build between sessions; this page takes on what they can't do alone — the work that needs his hands and ears — and keeps stewardship honest by reading the fleet and saying what it sees. The first six stages built the machinery, the seventh gave it a way to read itself, and the next is the first thing we make together.
>
> **The path**
>
> 1. **A — a steward run by hand on one project. Done.** Five hand-run cycles on [[Generative Sample Libraries]] in May 2026 proved a page can steward itself, and surfaced the spec gaps the orchestrator went on to close.
> 2. **B — the orchestrator that runs one cycle. In production.** Every steward cycle goes through it (`_ops/stigmergy/orchestrator/`).
> 3. **C — scheduling. The heartbeat lane.** launchd wakes the heartbeat each morning; when a batch is due it fires the due stewards through STIGMERGY's steward lane, inside the limits in `_ops/heartbeat/limits.json`, and the PROJECTS deck shows it as it runs.
> 4. **D — answering from STIGMERGY. Shipped.** Loudon answers a steward's ask on the TRICKSTER tab or in its scroll, not by hand-editing the board.
> 5. **E — the automated Trickster. In shadow.** It proposes grants and escalations and posts nothing. It waits on Loudon's review of its shadow digest, and on his `--live` switch, one rule at a time.
> 6. **F — Two Paths. Built, dry-run only.** It would build both branches of a fork so Loudon picks from finished work; it has never dispatched a branch.
> 7. **G — the fleet reading. Done, 2026-10-16.** `fleet/fleet-reading.mjs` reads every steward's record into one dataset and builds the dashboard, `fleet/Stewardship Health.html`; reading 1 is `fleet/reading.json`. Loudon: "I just looked and learned so much." It runs again whenever either of us wants it.
> 8. **H — next: Max blocks, and the Max patching standards they teach.** Max work is paused for every steward until the standards exist. In working blocks, Loudon and this page open the 24 Max and Live files the stewards wrote and nobody has opened — loads, compiles, sounds, his verdict — and each failure becomes a lesson for the standards. A block starts when Loudon wakes this page and asks for one; the agenda is `fleet/max-blocks.md`. The first block also decides where the standards live. The move is done when Loudon lifts the pause.
> 9. **I — a steward for this page.** A service steward with a role line like the [[Shopkeeper]]'s, on a slower rhythm — weekly, after a heartbeat batch — whose cycle is the fleet reading and the next block's agenda. Next when Loudon says go.
>
> How a project leaves stewardship is not a step on this path. It stays an open question, carried by the baton, until Loudon wants to design it with this page.
<sub>`plan-2026-10-16T08-07-41-04-00` · plan revised · agreed 2026-10-16T08:07:41-04:00 · Loudon, written by this page grown up</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-16T00-36-56-04-00" -->
### 2026-10-16 — Plan revised: G done; next, Max blocks and the patching standards they teach

Loudon, 2026-10-16, after reading the dashboard: this page is his partner in making the projects; pause Max work until we develop Max patching standards, and work the unopened patches together in blocks he asks for.

_The plan before this change:_

> **Where this is going.** Every stewarded page advances at the rhythm its stage asks for, and Loudon can see at a glance how the whole fleet is faring, so he and this page keep improving stewardship together. The first six stages built the machinery. The next two give the system a way to read itself.
>
> **The path**
>
> 1. **A — a steward run by hand on one project. Done.** Five hand-run cycles on [[Generative Sample Libraries]] in May 2026 proved a page can steward itself, and surfaced the spec gaps the orchestrator went on to close.
> 2. **B — the orchestrator that runs one cycle. In production.** Every steward cycle goes through it (`_ops/stigmergy/orchestrator/`).
> 3. **C — scheduling. The heartbeat lane.** launchd wakes the heartbeat each morning; when a batch is due it fires the due stewards through STIGMERGY's steward lane, inside the limits in `_ops/heartbeat/limits.json`, and the PROJECTS deck shows it as it runs.
> 4. **D — answering from STIGMERGY. Shipped.** Loudon answers a steward's ask on the TRICKSTER tab or in its scroll, not by hand-editing the board.
> 5. **E — the automated Trickster. In shadow.** It proposes grants and escalations and posts nothing. It waits on Loudon's review of its shadow digest, and on his `--live` switch, one rule at a time.
> 6. **F — Two Paths. Built, dry-run only.** It would build both branches of a fork so Loudon picks from finished work; it has never dispatched a branch.
> 7. **G — next: the fleet reading.** This session hand-runs its first cycle, in the bundle's `fleet/` workshop: a script that reads every steward's record — the registry, each steward's state and history, the board, the scrolls, the heartbeat's batches — into one dataset; a first written reading of the fleet; and a visual dashboard of stewardship health. All three go to Loudon with suggestions. The move is done when he finds the reading useful enough to want it again.
> 8. **H — after the fleet reading proves useful: a steward for this page.** Stand up a steward for Project Stewardship System as a service steward, with a role line like the [[Shopkeeper]]'s, on a slower rhythm — weekly, after a heartbeat batch. What it ships each cycle is the fleet reading.
>
> How a project leaves stewardship is not a step on this path. It stays an open question, carried by the baton, until Loudon wants to design it with this page.
<sub>`plan-2026-10-16T00-36-56-04-00` · plan revised · agreed 2026-10-16T00:36:56-04:00 · Loudon, written by this page grown up</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-16T00-21-28-04-00" -->
### 2026-10-16 — Plan agreed: the stages as they stand, and two moves ahead

Loudon, 2026-10-16, "yes to all": the stage path from A to F becomes the Plan, each stage marked where it stands, with the fleet reading next and a service steward for this page after it.
<sub>`plan-2026-10-16T00-21-28-04-00` · plan agreed · agreed 2026-10-16T00:21:28-04:00 · the Concierge, on Loudon's yes</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-10-15-grown-up" -->
### 2026-10-15 — A steward is grown up for its own page and bundle

Every cycle now reads ELDER, may edit its own page and bundle, lists each edit in its post as `page_edits`, and the cycle commits it by name once its frontmatter parses. Another page, a new entry and canon stay proposals. No live cycle has used it yet.
<sub>milestone · backfilled 2026-10-16 from git · `10751829`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-10-15-own-ledger" -->
### 2026-10-15 — A steward grows its own tuning ledger at its first offered lesson

The first time a cycle offers a lesson, the steward's page gains a tuning ledger and the lesson is filed straight in. A left-rough note never grows one.
<sub>milestone · backfilled 2026-10-16 from git · `61397b2f`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-10-15-recurring-rough" -->
### 2026-10-15 — The scroll's Now lists left-rough notes that keep recurring

A note a cycle leaves rough, said again in later cycles, shows on Now oldest first ("rough since cycle 22: nobody has heard it"), so an unpaid debt shows where Loudon already reads. No scroll has shown one yet.
<sub>milestone · backfilled 2026-10-16 from git · `1921ee8b`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-10-15-ignored-file" -->
### 2026-10-15 — A cycle commit leaves out an ignored file and names it

One ignored artifact no longer leaves a whole cycle uncommitted: the file is named in the commit body and the rest commits.
<sub>milestone · backfilled 2026-10-16 from git · `fb354c93`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-10-14-heartbeat-lane" -->
### 2026-10-14 — The heartbeat runs through STIGMERGY's steward lane, with limits

`batch.mjs` fires the due stewards through the same lane a deck click uses, so the PROJECTS deck shows the batch as it runs, inside the hard limits in `_ops/heartbeat/limits.json`. Made after one unlimited batch ran 35 cycles unseen.
<sub>milestone · backfilled 2026-10-16 from git · `52c00c0c`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-10-13-run-cap-three" -->
### 2026-10-13 — The run cap drops from ten cycles to three

Loudon's word, after watching a nine-steward queue: ten cycles unseen is a long way down a poor path.
<sub>milestone · backfilled 2026-10-16 from git · `e7c428b6`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-09-25-plan-zone" -->
### 2026-09-25 — Every scroll gains a Plan, the path agreed with Loudon

The Plan replaces `staging.md` and changes only with Loudon's yes; a steward proposes a revision with its evidence (SCHEMA v1.25, `d4cb3fa1`).
<sub>milestone · backfilled 2026-10-16 from git · `8c1cad61`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-09-25-daw-assets" -->
### 2026-09-25 — Stewards make Ableton, Max, Gen~ and RNBO assets and demo them

A steward tries the real asset, names what it could not verify, and records each failure as a Gotcha on the owning Specialist.
<sub>milestone · backfilled 2026-10-16 from git · `ce99d82d`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-09-25-shopkeeper" -->
### 2026-09-25 — The Shopkeeper becomes an ordinary steward

A steward can tend a service: one wake path and one commit path, with a `role` line in the manifest. The special sweep retired.
<sub>milestone · backfilled 2026-10-16 from git · `bbc3fb0e`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-09-25-commits-what-it-ships" -->
### 2026-09-25 — A steward's cycle commits what it shipped

The deterministic step commits the files a cycle's messages listed as made, scoped to its own bundle, with its machinery, scroll and the board. The model never runs git.
<sub>milestone · backfilled 2026-10-16 from git · `569574a5`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-09-25-interrupted" -->
### 2026-09-25 — A cycle the harness cut off is interrupted, not barren

A usage limit, an expired login or an unsupported model is read from the harness's own error records; no barren count, and a usage limit stops the batch.
<sub>milestone · backfilled 2026-10-16 from git · `4d33744c`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-09-23-scrolls-deck-run" -->
### 2026-09-23 — Scrolls, the PROJECTS deck, the run and the barren rule

Every project gets a scroll (36 backfilled, 20 `plan.md` files retired); the PROJECTS deck puts every project on one screen; an activation becomes a run; a second barren cycle marks a steward STALLED. Built in `40925997`, `a556fae3`, `c7333fac`, `c666210b`.
<sub>milestone · backfilled 2026-10-16 from git · `432ca9d4`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-06-09-mac-heartbeat" -->
### 2026-06-09 — The heartbeat moves to the Mac

The steward batch runs as a launchd job on the Mac, where the Shop's tools live, instead of a Cowork scheduled task in the Linux sandbox.
<sub>milestone · backfilled 2026-10-16 from git · `745a8902`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-06-09-bundle-local" -->
### 2026-06-09 — Bundle-local stewardship: what a steward knows lives with its page

The Machinery/Content Split: each steward's plan and decisions move into its page's bundle, `state.json` slims to runtime, stage and vector are read live from frontmatter. Built in `56864ccf` to `52774391`.
<sub>milestone · backfilled 2026-10-16 from git · `3ba3eab1`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-06-07-boldness" -->
### 2026-06-07 — Steward Boldness: every cycle ships a made thing

The rule that every cycle ends with a question is inverted; a cycle that only asks is a failed cycle.
<sub>milestone · backfilled 2026-10-16 from git · `733ea0d4`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-05-29-stage-f" -->
### 2026-05-29 — Stage F, Two Paths, built — dry-run only

Build both branches of a fork and let Loudon pick from finished work. Every phase defaults to dry-run; it has never dispatched a branch.
<sub>milestone · backfilled 2026-10-16 from git · `ffc5cd23`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-05-29-stage-e" -->
### 2026-05-29 — Stage E, the automated Trickster, built — shadow only

A deterministic rules engine triages the TRICKSTER inbox and proposes; it posts nothing until a rule is switched `--live`. Loudon's first shadow review followed the same day (`d2c8c7ac`).
<sub>milestone · backfilled 2026-10-16 from git · `77760f60`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-05-27-stage-c" -->
### 2026-05-27 — Stage C's thin path and the first multi-steward batch

`batch-plan.js` and `batch.md` choose the due stewards; GSL, Generative Wavetable Libraries and Shepard cycled in one batch (`aeee7f04`).
<sub>milestone · backfilled 2026-10-16 from git · `201d0332`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-05-04-stage-b" -->
### 2026-05-04 — Stage B, Orchestrator v0.1, complete

`runAgentCycle` built in six phases, each green.
<sub>milestone · backfilled 2026-10-16 from git · `9ac245d2`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-05-04-stage-d" -->
### 2026-05-04 — Stage D, STIGMERGY v0.2: Trickster posting

Loudon answers asks from STIGMERGY instead of hand-editing the board.
<sub>milestone · backfilled 2026-10-16 from git · `f0c9e8fa`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="milestone-2026-05-03-stage-a" -->
### 2026-05-03 — Stage A, a steward run by hand on Generative Sample Libraries

Five hand-run cycles from Cowork, 2026-05-03 to 2026-05-04. It shipped GSL's Phase 2 and wrote back to its own page, and surfaced the nine spec gaps and four voice findings the Context keeps. The pilot ran uncommitted; its files were first committed in `a5ca537b` (2026-05-09).
<sub>milestone · backfilled 2026-10-16 from git · `a5ca537b`</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
