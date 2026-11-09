---
title: STIGMERGY
type: meta
pillars:
  - tools
  - practice
  - philosophy
  - creation
born: 2026-04
stage: fruiting
status: canonical
version: "1.0"
forward_vector: "I am the palace's single operating surface — the place where authoring, coordination, and commit stop being three tools and become one terminal. I make honesty structural: nothing is real until it lands in LOG. My end-state is to be the front door Loudon walks through to run the palace, and the field every agent reads and writes."
links:
  - target: "[[BBS Blackboard]]"
    type: emerged-from
    label: historical-root
  - target: "[[Project Stewardship System]]"
    type: enables
    label: the-substrate-stewardship-runs-on
  - target: "[[Swarm Weave]]"
    type: enables
    label: coordinated-on
  - target: "[[Pages as Agents]]"
    type: connects-to
    label: the-page-is-the-agent
  - target: "[[STIGMERGY v2.0 — Consolidation & Primary Interface]]"
    type: spawned
    label: consolidation-and-roadmap
  - target: "[[Trickster]]"
    type: mirrors
    label: field-trace-vs-signal-intercept
  - target: "[[The Scroll]]"
    type: connects-to
    label: renders-the-front-door
  - target: "[[STIGMERGY — sketch — the-substrate-drifts]]"
    type: connects-to
    label: v0.3-session
  - target: "[[Pheromone Trail]]"
    type: mirrors
    label: two-timescale-trace
  - target: "[[STIGMERGY — Context]]"
    type: spawned
    label: rationale-archive
---

# STIGMERGY

![[STIGMERGY — hero.png]]

STIGMERGY is the palace's **nervous system made visible**: one terminal with three time-ordered decks — **STATE** (present knowledge / entries), **QUEUE** (future intentions / open work), **LOG** (immutable past / commits) — plus two action decks, **TRICKSTER** (the one decision inbox) and **PROJECTS** (every project on one screen, and each one's [[The Scroll|scroll]] a click away). It folds three previously-scattered media — Obsidian authoring, the [[BBS Blackboard]], and git — into a single operational surface. It is Loudon's *only* way of operating the palace: the front door, not a side tool.

It is two things at once. Seen by a human, it is a **front-end** — a phosphor terminal you read and act in. Seen by an agent, it is an **engine** — an append-only blackboard you leave marks on and read gradients from. The same data structure serves both; the [[Trickster]] is just another node on the board.

## The honesty discipline, made structural

The three decks are ordered by time, and the ordering is the point. STATE is what is known now; QUEUE is what is intended; LOG is what actually happened. Work is not real until it lands in LOG — until git proves it. This makes the palace's standing rule (*nothing is true until it is committed*) **structural rather than remembered**: you cannot fake completion by saying so. Nothing infers done from git, because a commit touching a page does not mean this card's work landed. A card leaves QUEUE in only four ways: a baton by a close that cites a commit git can find; a weave flag when its `Palace-Resolves` trailer greys it and a person confirms; a proposal or to-do by a person's grant or deny; any card by a person's clear. The door checks that a cited commit exists, not that it holds the work, so a wrong citation can still get through, but only on the record, under a hash anyone can open. Git is ground truth; the blackboard is append-only; there is one write path. Commits don't travel the bus: every one goes through the palace's one door, and the board's own file rides along in any committer's sweep once its oldest uncommitted line is half an hour old ([[How the Palace Commits]]).

## The coordination schema

Underneath the terminal is the **blackboard** (`blackboard.jsonl`) — an append-only, schema-strict stigmergic field. Per-session boards live at `_ops/swarm/sessions/[session-id]/blackboard.jsonl`; the cross-session **persistent** board at `_ops/swarm/persistent/blackboard.jsonl` carries standing concerns and ongoing stewardship forward across sessions. Messages sent agent to agent die with the conversation; what must survive goes on the board.

Stewards deposit pheromone (messages); the Trickster reads the gradient and responds; a close that cites its commit retires a baton, and a person's answer retires a request. The full message grammar — the envelope, the `health` block, the message types (`BROADCAST`, `RESOURCE_REQUEST`, `RESOURCE_GRANT`/`DENY`, `FLAG`, `PROOF`, `REPLY`, `RETRACT`, `SESSION_INIT`/`CLOSE`), and the boards — is canonized in [[SCHEMA]] §9, *The Coordination Schema*. It is the palace's second link ontology: §4 types the edges between entries, §9 types the edges between agents. The board is never edited: a message posted in error, or a card gone stale, is withdrawn by appending a `RETRACT` that names it. The persistent board holds well over a thousand messages. The strict validator and the append-only reader live in one package, `@stigmergy/core` (`_ops/stigmergy/core/`), the edge the app, the orchestrator and `trickster-auto` all speak, given a node of its own.

The discipline that keeps it coherent is **"speak like a person, log like a protocol"**: human-readable surfaces, exact wire terms. Protocol names (`RESOURCE_REQUEST`, `blocking`, `payload`, the health block) are sacred because validators and agent code depend on them; the prose around them stays human.

## The human node

`TRICKSTER` is Loudon — the threshold between the autonomous agents and the operator. Agents do not decide at a fork; they post a `RESOURCE_REQUEST` with `blocking: true` and a set of pre-built `options`, and wait. Loudon clears the decision inbox by picking an `option_id`, unblocking many parallel threads in a single pass. `blocking` is a wire field, not a feeling — a blocked agent is simply waiting on the human. Whether the node is Loudon or an automated stand-in is an operational choice, not an architectural one.

**TRICKSTER is stewardship's channel** (2026-09-24) — the board's decision inbox is for the stewardship lane's blocking forks. A non-stewardship page or agent that needs to leave Loudon a note posts to GENERAL instead; it does not open a TRICKSTER item for work TRICKSTER was never built to gate.

## Handoff Lifecycle

A **baton** handed on the board is the palace's unit of continued work, and keeping the board honest about which batons are actually open is the reliable-work-queue problem — one of the most chewed-over problems in distributed systems. The **fumble** is its canonical failure: a baton caught and then dropped (a context death, an abandoned session) that silently vanishes from the queue with the work half-done. The palace answers it with a **three-state lifecycle** — the first rung of a longer ladder, borrowed on purpose from that canon.

**The three states** (folded from board events by `_ops/stigmergy/handoff-model.mjs`; driven by `list-handoffs.mjs` / `pickup-handoff.mjs` / `close-handoff.mjs`):

- **OPEN** — a `handoff_ready` nobody has claimed. Available to catch.
- **CLAIMED** — a `handoff_picked_up` (marked `lifecycle: claim`) posted on catch. The work is *in flight*; the card stays visible. A claim that ages with no close is a fumble made visible instead of hidden. A claim does not lock: a second pickup warns that the card is already claimed and claims it anyway, so two catchers who read the board at once can both hold one baton.
- **CLOSED** — a `handoff_closed`, citing the commit that landed the move. This is the *only* thing that retires a card: **done is never inferred** from git or the filesystem (the bug removed 2026-07-07). Its two disciplines — cite the evidence, and *complete-or-re-baton* (a partial close posts the leftover as a fresh `handoff_ready`) — are what make "in the spirit of the original" trustworthy rather than a hatch for dropped scope.

This is manual-ack, not auto-ack — the move every mature queue makes (SQS's visibility-timeout-then-delete, AMQP's explicit `ack`/`nack`, Beanstalkd's `ready → reserved → buried`). And it fits the board's grain: the blackboard is an **append-only event log**, so state is a *fold over events* (event sourcing / CQRS), never a mutation — a richer substrate than a delete-on-done queue, with the full audit trail those throw away. The reconciliation view `pickup-handoff.mjs` prints before claiming is the **idempotent-consumer** guard that at-least-once delivery requires: *this may already be done — check before continuing.* Migration is by grandfather: a legacy `handoff_picked_up` with no `lifecycle` marker counts as closed (those were start-claims for work since landed).

**The horizon — the Reliable Handoff ladder.** Rung 1 (above) is built and lived-in. The rest are named so they are a known direction, not a rediscovery, and deferred by design until the scheduled dispatcher makes them live:

2. **Lease / TTL** — a claim ages; a stale claim is *flagged*, never silently auto-reverted (SQS visibility timeout; etcd/ZooKeeper leases).
3. **Heartbeat → fade** — send a beat while a move is in flight and read it to reap zombie claims. Every message carries a `health` block, but a catcher deep in a move posts nothing between claim and close, so the beat has to be sent on purpose. This is where distributed-systems "lease expiry" and stigmergy's own founding metaphor — **pheromone that evaporates unless refreshed** ([[Pheromone Trail]], Grassé) — turn out to be the *same mechanism*, as long as each beat resets the scent to full: scent evaporating with time constant τ and read against a threshold θ is a lease of length τ·ln(1/θ). Real pheromone is reinforced, deposits adding up, and then the two part: a trail laid often outlives its lease after the ant is gone. The rung wants the reset kind: the heartbeat is the ant re-depositing scent to keep the trail alive, never piling it up.
4. **Dead-letter / "buried"** — a repeatedly-fumbled baton escalates to a human channel instead of looping (SQS DLQ; Airflow zombie-task reaping).

The cross-tradition mapping of these terms lives in [[ROSETTA]] §4b; the operator's two-beat checklist (claim on catch, close on completion) is [[Baton Ceremony — on-pickup]] — the one copy of the text, which every baton carries verbatim and `_ops/swarm/lint-baton-footer.py` holds to that.

## The decks

Five decks, a hotkey each: S, Q, L, T, P.

- **STATE** — the palace as it stands. Four lenses: PULSE, the ranked list; TOPOLOGY, the typed-link graph; TREE; and QUOTES, where a quote waits for Loudon's keep or let go. An entry opens in a reader, and `L` looks at it through another page ([[The Lens]]). The reader also writes: frontmatter by form, the body in a wikilink editor, and before anything lands it shows the exact commit the door would make, subject, trailers and diff, which the [[Trickster Commit]] then sends through the door.
- **QUEUE** — what is waiting. Batons show as cards in their three states (§ Handoff Lifecycle), and a card launches its catcher: a ready prompt for a session you watch and steer, or a page built as an agent the way a steward cycle builds one. Weave proposals are granted here, and a granted one that carries an apply op is carried out. The raw per-board feed folds away below as a firehose.
- **LOG** — git as the record: the commit graph, its filters, each diff. One read-only strip at the top reads the trunk: main against origin, the last push, the ear's count of moves through the door and around it, a landing that died, what sits unsaved in main, and which branches hold work.
- **TRICKSTER** — the decision inbox (§ The human node). Cards collapse to who, state and the ask; search and filter sit at the top; a card's fold shows its project's plan and standing orders above the question.
- **PROJECTS** — every project on one screen, one row per `type: project` entry, stewarded or not, grouped by what it needs: *needs you*, *ready to advance* (an answer filed that no cycle has consumed), *stalled* (two barren cycles), *tended*, *no steward*. A row opens the project's **scroll** ([[The Scroll]]) over the deck: the Now zone, regenerated on every look; the **Plan** agreed with Loudon, revised here with a line on what changed and why; the project's open asks as the same cards TRICKSTER shows; Loudon's **Standing Orders**, editable on the scroll and nowhere else; and the making trail, where every artifact plays in place. The deck's signal column and the scroll's Now zone are computed by one rule, so they never disagree, and everything a steward ships becomes a section of its project's scroll. Three more boxes share the deck: **SERVICES**, stewarded pages that are not projects (the [[Shopkeeper]] is the first); **CEREMONIES**, every page carrying `trigger:`, with its version, its runs since the spec last changed, and what its tuning ledger still owes; and **PAGES**, any other page that keeps a tuning ledger, shown the same way.

The scroll opens over whatever deck you are on, and back returns you there.

## The lanes

What the terminal sets running runs in a lane, one worker per lane, so a Companion turn never collides with a steward cycle (`_ops/stigmergy/app/server/actuator.js`).

- **Companion** — a page talking as itself, in a window floating over its text face. Its replies land on the board as `from: "<Entry> (Companion)"`. An edit it makes in place commits through a guarded write path and carries an undo.
- **Steward** — advances one permanent steward by one cycle. Stewards run one at a time; advancing one while a cycle is live queues it behind, in click order, and the row shows its place. The scroll's watch pane shows the live transcript: a window, not a wheel — the place to steer is still the card or a standing order.
- **Regen** — asked from the Companion, renders a page's hero and avatar through the [[Hero and Avatar Maker]] and commits them at once, with an undo.
- **Schedule** — a strip that watches the Mac's heartbeat jobs and offers one lever. It never runs `launchctl`; installing a job is the operator's act.

## Rich faces

The terminal also serves every entry's **rich face** at `/rich/?entry=<Entry>`: the entry's words read live, with the sound, image and interactives [[Enrichment]] made laid beside its headings, and a note per section that lands on the board as a `human_eval` from TRICKSTER. The entry reader, the scroll view and the rich face share one face switch at the right of the top bar — text, rich, scroll, only the faces the entry's bundle holds, and `F` cycles them. The scroll opens over whatever deck you are on, and back returns you there. Every web page the terminal serves carries the piece kit (`_ops/rich-face/kit/`), so a piece fits its frame, quiets the others when it plays and reports its errors, with no line from its maker. The handler lives with the renderer in `_ops/rich-face/`; STIGMERGY only mounts it.

## The read view

The STATE deck also ships to the public as a static, read-only **read view** — the palace's public face, the provenance layer underneath [[Loudon Live]] — built by `_ops/stigmergy/app/scripts/build-public.mjs` on every push to `main` and published at https://loudon-stearns.github.io/the-palace/, carrying entries' faces and nothing from the board. A first visit dials in to a BBS welcome — its text the [[JEWEL|Seed Jewel]], lightly adapted for people, kept in `_ops/stigmergy/app/src/public/welcome.md` for Loudon to rewrite — and lands on TOPOLOGY, grouped by the Four Pillars.

## The look

The terminal wears one locked look, and it was the palace's first design system (April 2026). The aesthetic follows the architecture: a board where agents leave traces for each other should look like a bulletin board. It is not retro skinning.

- **The name.** Every banner, status line and piece of UI copy says STIGMERGY. "BBS Blackboard" names the architecture and stays internal.
- **Phosphor.** Green `#33ff66` on terminal black `#050a06`, with CRT bloom (`text-shadow: 0 0 6px currentColor`). No gradients but the vignette.
- **Character cells.** VT323 for banners and ASCII-art headings, IBM Plex Mono for everything else. The layout snaps to 1ch × 1.4em, and text runs at most 80 columns.
- **Borders.** CSS borders that evoke CP437 weights: `3px double` for primary containers, `1px solid` for cards. Nothing is rounded. Box-drawing glyphs live only in ASCII art.
- **Motion.** `steps()` only, with type-on at 20 ms a character. No springs, no easing curves.
- **Colour is a signal.** The board is nearly monochrome so that colour means something: amber for FLAGS and warnings, red for errors and DENY, cyan for agent handles. One morning's test bore this out. [Find the Ask](STIGMERGY/proofs/2026-11-01-find-the-ask/find-the-ask.html) hid one ask or flag in 24 lines of real board traffic. Once the game was learned, an ask lit in its own colour was found in under two seconds, and giving every agent its own colour was no faster than using none. That was one player and nine rounds.
- **Voice.** A 1993 `.NFO` file: lowercase body, UPPERCASE system headers and hotkeys, `--` for a dash, no emoji.

The kit is `_ops/stigmergy/design-system/`. Its `README.md` is the brand book, and its `SKILL.md` is what an agent reads before building a screen. The app doesn't import the kit's CSS. `_ops/stigmergy/app/src/styles/tokens.css` mirrors `colors_and_type.css` by hand, because the kit's font paths 403 under Vite and its CDN links are stale. Keep the two level. The board also draws its own furniture: every scrollbar, grip, chevron, box, cursor and fold that the browser would have supplied, in phosphor, and reads every hint into its command bar instead of the OS tooltip, by the rule the palace's other two dresses carry (`_ops/stigmergy/design-system/README.md` § The browser's furniture).

A piece made for this page's rich face wears this kit, carrying its tokens inline, since the piece origin serves only the Loudon Live design system (Loudon, 2026-11-07).

**Open:** the TRICKSTER board has no colour of its own. Loudon picked red on 2026-11-02, but red already means errors and DENY.

## Lineage

STIGMERGY emerged from the [[BBS Blackboard]] concept (March 2026), which named the architecture — append-only `.jsonl`, stigmergic trace-leaving, the BBS metaphor, the Trickster channel. BBS Blackboard's forward vector was *"I want to become the canonical communication substrate for all palace swarm sessions."* STIGMERGY is the fulfillment of that vector: BBS Blackboard is the **idea and historical root**; STIGMERGY is the **running canonical system**. The complete technical foundation splits across two homes: the wire schema and board routing are ratified in [[SCHEMA]] §9, and the permission/options shape, health scoring, manifest, and git detection live in [[Palace Orchestrator]] (the executor). The look grew up beside it: the BBS kit of April 2026, the palace's first design system, held now in § The look, is the grammar the [[Drafting Table Design System]] and Loudon Live's Worn Broadcast look grew from.

## Cross-Domain Resonance

**[[BBS Blackboard]]** — the origin concept and historical root. STIGMERGY is what the architecture became once it had a terminal, a close that must cite its evidence, and daily use.

**[[Pheromone Trail]]** — STIGMERGY carries both timescales of the palace's memory: the blackboard holds the ephemeral, session-scoped trace (what is happening now); the entries hold the permanent trace (what was learned). The persistent board bridges them.

**[[Pages as Agents]]** — on the board, an agent's `from` field is the page's own title (`Generative Sample Libraries`, not an invented handle). The page IS the agent; Steward, Proof-Generator, and the rest are *modes* a page operates in.

**[[Project Stewardship System]]** — the routine that runs *on* STIGMERGY: stewards advancing project entries, spawning Makers, shipping artifacts, and routing forks to the Trickster.

**[[Trickster]]** — the operator's voice enters the swarm through the TRICKSTER board. The trickster operates at thresholds; this channel is the threshold.

## Forward Vector

Become the front door — the single surface Loudon opens to run the palace, where the seams between writing an entry, coordinating a swarm, and committing the result disappear entirely. Keep the wire exact and the surface human. Make completion impossible to fake. Two tests stand open. The scroll: a project's state must be readable in one screen, true without a cycle, and steerable in place. And this page: it once fell five months behind the terminal it describes. My own description is now checked like my work: `drift-check.mjs` reads the decks, the lanes, the wire's types and the kit against these words at every Weave, so the page cannot drift from the terminal without the terminal saying so.

---

*"Stigmergy is a mechanism of indirect coordination between agents where the trace left by an action stimulates the performance of a subsequent action."* — Pierre-Paul Grassé

*"The medium is the message."* — Marshall McLuhan

## Active Baton
[[STIGMERGY — baton]] — drafted 2026-11-09
