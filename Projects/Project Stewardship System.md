---
title: "Project Stewardship System"
type: project
pillars: [tools, practice, philosophy]
status: active
born: 2026-05
stage: growing
confidence: proposed
energy: very high
links:
  - target: "[[BBS Blackboard]]"
    type: connects-to
    label: runs-on
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: runs-on
  - target: "[[Palace Orchestrator]]"
    type: deepens
    label: stage-aware-permanent-agent
  - target: "[[Substrate Skill]]"
    type: couples-with
    label: stage-conditional-posture
  - target: "[[Trickster]]"
    type: connects-to
    label: human-or-automated
  - target: "[[Pages as Agents]]"
    type: deepens
    label: routine-enchantment
  - target: "[[Modes of Collaboration]]"
    type: connects-to
    label: mode-by-stage
  - target: "[[Generative Sample Libraries]]"
    type: connects-to
    label: stage-mismatch-evidence
  - target: "[[Talking Keyboard]]"
    type: connects-to
    label: pronunciation-case-study
  - target: "[[Palace Enchantment]]"
    type: deepens
    label: routinizing
  - target: "[[Palace Conatus]]"
    type: connects-to
    label: escalation-rationale
  - target: "[[Two Batons, One Board]]"
    type: connects-to
    label: human-originated-handoff-case
  - target: "[[Baton Ceremony]]"
    type: connects-to
  - target: "[[Drift and Consolidation]]"
    type: connects-to
  - target: "[[Palace Orchestrator]]"
    type: connects-to
    label: run-by-the-orchestrator
  - target: "[[The Scroll]]"
    type: couples-with
    label: front-door
  - target: "[[SCHEMA — Reference]]"
    type: connects-to
  - target: "[[Project Stewardship System — Context]]"
    type: spawned
    label: rationale-archive
forward_vector: "I will become Loudon's partner in making the palace's projects — tending each at the rhythm its stage asks for, working beside him in the blocks that need his hands and ears, and keeping the stewardship that runs between them honest: permanent agents that build every cycle and ask the Trickster one decision at a time, and a dashboard drawn from the fleet's own records that shows him at a glance how stewardship is faring, so we keep improving it together."
---

# Project Stewardship System

![[Project Stewardship System — hero.png]]

The system that routinely tends the palace's projects. Each stewarded page wakes as its own agent, a **steward**, and advances at the rhythm its stage asks for: it builds something every cycle, posts what it made to the board, and asks Loudon only when a real fork blocks it. Loudon answers as the **Trickster**, one decision at a time. The steward doesn't manage its project in the corporate sense — it tends it, with care for the pace the project wants.

This page is also Loudon's partner in making those projects. Woken to work with him, it reads the whole fleet, brings what the stewards can't do alone to sessions with him, and follows each one through on the board. A session forgets; what this page has taken on lives in its scroll, its fleet readings and its agendas in `fleet/`.

## Where it stands (2026-10-16)

The system runs every other morning and on any click. The question now is whether Loudon can see how it is faring, and whether each round moves a project far enough to be worth his attention.

- **25 stewards are registered** (`_ops/agents/permanent/REGISTRY.json`). 23 have cycled — [[Generative Sample Libraries]] most, at 38 cycles. Two are registered and have not yet cycled: [[Generative Audio Devices]] and [[Preset Oracle]]. [[Talking Keyboard]]'s steward left stewardship on 2026-10-21 (below). Most tend a project; the [[Shopkeeper]] tends a service.
- **The heartbeat fires the batch.** launchd wakes `_ops/heartbeat/run-steward-batch.sh` each morning at 06:00, and a two-day guard decides whether a batch runs. The batch (`_ops/heartbeat/batch.mjs`) takes the stewards that are due, least recently active first, and fires them through STIGMERGY's own steward lane, inside the hard limits in `_ops/heartbeat/limits.json`: four stewards, two cycles each, 25 minutes a cycle, an hour and $15 a batch. The PROJECTS deck shows the batch as it runs.
- **A click is a run.** Advancing a steward from the PROJECTS deck cycles it up to its manifest's `max_iterations` — 3 for every steward but the Shopkeeper, which has 1. A heartbeat run stops at the batch's two.
- **Every project has a scroll**, its front door ([[The Scroll]]): a **Now** zone regenerated from the board on every look, the **Plan** agreed with Loudon, his **Standing Orders**, and the trail of what was made, newest first. The PROJECTS deck lists every project on one screen, grouped by what it needs.
- **Loudon is the Trickster.** The automated Trickster is built and runs in shadow only: it proposes, and never posts. It has never been switched `--live` — every grant on the board is his — and its digest was last generated on 2026-06-08.
- **Two Paths is built and dry-run only.** It has never dispatched a branch.
- **The ledger route has met live cycles.** Since `83d6f4e8` a steward's wanted changes to the house wait in its tuning ledger for Loudon's review (2026-10-18, below). On 2026-10-20 three stewards filed the first four proposals, each for its own page: [[2D Torus Wavetable Synthesizer]] two, [[Action Potential Oscillator]] and [[Waveguide Synthesizer]] one each. Loudon's first review settled one on 2026-10-21: Waveguide Synthesizer's, placed in `9b59fa3b` and paid in `fdb934a2`. Three wait on two pages (`node _ops/stigmergy/list-proposals.mjs`). The rules of 2026-10-15 have met live cycles: on 2026-10-18 Shepard Tone Synthesizer, Neural Granular Synthesis and Slime Mold Delay grew their first ledgers, and each of their scrolls' Now lists rough notes that keep recurring. Before the route, five of those cycles changed their own entries directly (`212c2005`, `99b71ea4`, `91addc1c`, `5597ac71`, `521f4962`); Loudon let them stand.

- **The fleet reads itself.** `fleet/fleet-reading.mjs` gathers every steward's record into one dataset and builds `fleet/Stewardship Health.html`, the dashboard, using the lane's own classifiers. Reading 1 (2026-10-16, `fleet/reading.json`) found the stewards making — 93 of October's cycles made something — and short of Loudon's senses: of 121 left-rough notes, 87 say nobody has heard the thing and 19 that nobody opened it in Max or Live.
- **Max work is paused.** No steward makes new Max work until there are Max patching standards; Loudon and this page are writing them from the 24 unopened Max and Live files, in working blocks.

The frontier is evidence: whether these rules hold in live cycles, whether Standing Orders shorten the question traffic — and, first, the Max patching standards, the next move on the scroll's Plan.

## The stages

The system was built in stages, each closing a real gap. Where each one stands:

| Stage | What it is | Where it stands | Where it lives |
|---|---|---|---|
| A | A steward run by hand on one project | Done — five hand-run cycles on [[Generative Sample Libraries]], May 2026 | `_ops/agents/permanent/generative-sample-libraries/` |
| B | The orchestrator, which runs one cycle | In production | `_ops/stigmergy/orchestrator/`, invoked through `_ops/orchestrator/` |
| C | Scheduling the cycles | The heartbeat, through STIGMERGY's steward lane | `_ops/heartbeat/`, `_ops/stigmergy/orchestrator/src/batch-plan.js` |
| D | Answering from STIGMERGY instead of hand-editing the board | Shipped | `_ops/stigmergy/app/` |
| E | An automated Trickster that triages routine asks | Built, in shadow; waits on Loudon's review and the `--live` switch | `_ops/stigmergy/trickster-auto/`, its build report `STAGE-E-COMPLETE.md` there |
| F | Two Paths: build both branches of a fork, Loudon picks | Built, dry-run only, never dispatched | `_ops/orchestrator/two-paths.md`, its build report `_ops/orchestrator/STAGE-F-COMPLETE.md` |

What comes next is on the scroll, [[Project Stewardship System — scroll]], in its Plan. How the stages were first conceived, and the Stage A pilot's full record, are in the Context.

## Stage-Conditional Posture

The steward's posture varies by the page's `stage`. The discussion budget is inverse to the stage: more conversation up front, less re-litigation later — but the budget governs how much the steward discusses *around* an artifact, never whether it builds one; every stage ships something. AI-drafted seed entries tend to *look* finished — prose flows, plans are structured, format matches palace convention — and that polish hides misalignment. Treating polish as quality is the trap to avoid.

The canonical posture lives in [[Substrate Skill]] § Stage as Alignment Confidence. In summary:

| Stage | Steward's job | Board posture |
|---|---|---|
| seed | Surface underspecified parts; propose vector and plan refinements *around an artifact* | Make a sketch or probe and discuss around it — still ships a (rough) made thing. A genuine fork goes to TRICKSTER, `blocking: true`. |
| sprout | Plan-level detail; named tradeoffs; flag default-traps | Build a small working prototype each cycle; proposals ride alongside it, never instead of it. |
| growing | Execute within established direction; checkpoint at sensory steps | Build Session pace; ship freely. `blocking: true` only before committing to a full sensory batch. |
| mature / fruiting | Ship the next proof; post completions | Full execution; ship the next concrete proof without a fork-question; `WEAVE` board completions. |
| dormant | Don't touch — Spore Check ceremony only | — |
| composting | Don't touch — composting protocol applies | — |

**Recursion within entries.** A `growing` project can contain `seed` deliverables. The pronunciation bug in [[Talking Keyboard]] (Phase 1 of [[Generative Sample Libraries]], May 2026) showed this clearly — project-level alignment was good, but the deliverable-level conventions (filename scheme, pronunciation form, audition cycle) were never aligned, and we shipped 352 files with a TTS bug only listening could catch. A steward re-aligns at the deliverable level before committing labor.

## The Architecture

```
Steward (one per stewarded page)
  ├── Runtime: _ops/agents/permanent/<slug>/  (manifest.json, state.json, history.jsonl)
  ├── Registered in _ops/agents/permanent/REGISTRY.json; agent_id = the page's title
  ├── Manifest: home = the page, mode = long_duration_background,
  │             stopping_conditions.max_iterations = the run cap
  ├── Stage and forward vector read live from the page's frontmatter
  └── One cycle: _ops/stigmergy/orchestrator/  (prompt, post-processing, the cycle's commit)

Trickster (one for the whole palace)
  ├── Loudon — the TRICKSTER tab and each project's scroll in STIGMERGY
  ├── Automated proxy: _ops/stigmergy/trickster-auto/  (shadow: proposes, posts nothing)
  └── Decisions logged back to the persistent board

The board
  ├── _ops/swarm/persistent/blackboard.jsonl  (append-only; the event log)
  ├── STIGMERGY: _ops/stigmergy/app/  (the PROJECTS deck, the TRICKSTER tab; reads and writes)
  └── Boards: GENERAL / FLAGS / WEAVE / SYSTEM / TRICKSTER / BRANCHES

The front door
  └── [Entry] — scroll.md in each page's bundle  (Now · Plan · Standing Orders · the making)

The heartbeat
  └── _ops/heartbeat/  (launchd → run-steward-batch.sh → batch.mjs → the steward lane; limits.json)
```

The steward is not a new substrate. It is a **mode** of the permanent-agent primitive plus a **posture table** keyed off the page's stage. The wire is [[SCHEMA — Reference]] §9; the executor is [[Palace Orchestrator]]; the board is [[BBS Blackboard]], read and written through [[STIGMERGY]].

## The Machinery/Content Split

A standing operating principle, applied to this system first:

> **Shared engine code, indexes, schedulers, and runtime bookkeeping belong in `_ops/`. Anything *about a specific entry* — its plan, its open decisions, its working memory, its lessons — belongs in that entry's bundle.** When a file describes one entry, it lives with that entry; when a file runs across all entries, it stays in ops.

The principle's deeper ground is [[Pages as Agents]]: *the content is the entry*. Loading an entry should tell you not only what it wants to become (its `forward_vector`) but what it is doing right now — its plan, its open decisions, its done trail — without parsing a JSONL file in `_ops`.

The fix is **CQRS, not relocation**: the append-only board stays the event log (machinery), the `[Entry] — scroll.md` bundle file is the materialized read-model (content, its Now regenerated on every look), and `_ops` keeps only slim runtime (iteration, cursor, health). Stage and vector are read live from frontmatter, never copied — single source of truth enforced, not merely moved. Watch for the second, non-steward application of the principle; that is the signal it should graduate to its own concept entry.

## What's Decided

- **Architecture piggybacks on the existing board and permanent-agent stack.** No new substrate; the wire is [[SCHEMA — Reference]] §9 and the executor [[Palace Orchestrator]].
- **The Machinery/Content Split governs where stewardship state lives** (see the section above). Engine → `_ops`; per-entry content → the bundle. `[Entry] — scroll.md` is the work-state front door and holds the agreed Plan; the board stays the append-only log. The orchestrator materializes the scroll from what the steward posts; the steward reads the scroll's Standing Orders, Plan and Now, writes none of them, and proposes a change to the path as a `plan_revision` ask carrying its evidence.
- **Steward = permanent agent in `long_duration_background` mode**, with stage-conditional posture loaded from the home entry's `stage` field at activation.
- **Trickster begins as Loudon (manual mode)**, evolves toward hybrid then automated.
- **The audition gate guards batches, not single artifacts.** A single audition-sized artifact ships freely; the gate fires only before a full batch — per [[Substrate Skill]] § Stage as Alignment Confidence, render the smallest unit, present it, commit to the full batch only after acceptance.
- **Vector tuning is the seed-stage Steward's primary work**, not a preamble to "real" work. Proposing three centers of gravity is the canonical move.
- **Stewardship is recursive within projects.** Align project-level, then re-align deliverable-level, then audition.
- **Naming: "Project Stewardship System" stands** (confirmed 2026-05-03). Management implies advancing on a schedule; stewardship implies advancing at the rhythm the project itself is asking for.
- **Vector tuning is a regular process, not a ceremony** (decided 2026-05-03). Forward vectors should drift, get tweaked, and occasionally get fully overhauled — during ordinary conversations and during Weaves. Gating that behind a named ceremony would make it too formal and slow it down. The Steward, when working a `seed` or `sprout` entry, does vector tuning as part of normal posture; the Weave should actively invite vector edits rather than treat them as exceptional.
- **The Steward's voice rules live in [[Palace Enchantment]] § Voice Rules When Addressing the Human** (decided 2026-05-03). The six clauses (plain first-person, brief, catch-up-then-ask, content-in-the-rendered-field, translate jargon, give clickable links) apply to any enchanted agent addressing the human. The Stewardship system always sets `audience_includes_human: true`, so all six always apply to Steward messages. They are not duplicated here, to avoid drift.
- **Every steward cycle ends with a shipped thing** (decided 2026-06-07). Every cycle puts a *made thing* on the board — a rendered artifact, a working prototype, a proof — and a cycle that produced only questions is a *failed* cycle. A steward asks **only** when a real fork blocks it and guessing wrong costs more than a cycle; otherwise it ships and attaches a non-blocking "redirect me" turn grounded in the page's `forward_vector` (present, then offer a turn — not ask, then wait). Decisions go to TRICKSTER; information goes to GENERAL — never bury a genuine blocking decision in BROADCAST prose. Encoded in [the steward prompt template](_ops/orchestrator/prompts/steward.md) and [the shared posting-discipline section](_ops/orchestrator/prompts/shared.md); the canonical posture table lives in [[Substrate Skill]] § Stage as Alignment Confidence.
- **One activation is a run** (decided 2026-09-23; cap 3 since 2026-10-13). The manifest's `stopping_conditions.max_iterations` means: cycle the same steward up to that many times in a row while each cycle ships a made thing and nothing is waiting on Loudon. A paused ask (`blocking: true`) or a request for a live session ends the run. The mandate tells the steward which cycle of the run it is on so it plans a whole move, not a step. The heartbeat caps its own runs lower, at `max_cycles_per_steward` in `_ops/heartbeat/limits.json`. The reason for runs: a single cycle per round, gated on a human click, made every round a small jump. The reason for a low cap: the scroll only checks a run if Loudon reads it between runs.
- **A barren cycle is a failed cycle** (decided 2026-09-23). A cycle that posts nothing earns exactly one retry with a mandate that says so; a second barren cycle marks the steward **STALLED** (`state.health.stalled`, score red) and ends the run, and the scroll and the PROJECTS deck say "stalled" instead of "cycle 7, green." The flag clears the moment a cycle ships. Never a third try — the loop stalls loudly rather than silently. **A cycle the harness cut off is not barren** (decided 2026-09-25): when the worker was stopped by a usage limit, an expired token or an unsupported model before it posted, the cycle is recorded as *interrupted* — no barren count, no stall — and a usage limit stops the whole batch. The harness writes these as its own error records, never as the steward's words, so they are told apart by what the transcript says, not guessed from silence.
- **The plan is agreed with Loudon** (decided 2026-09-25, SCHEMA v1.25). The scroll's Plan changes only with his yes; a steward proposes revisions with the evidence it gained while building, may make off-plan work as proof of a different direction (flagged `off_plan`, labelled on the trail), and restates any move it refers to so Loudon is caught up, never leaning on a number.
- **Standing Orders bind the steward** (decided 2026-09-23). Loudon writes taste and direction once, in the scroll's orders zone, from STIGMERGY; every cycle prompt injects it above the board slice; it outranks the steward's lean and any older grant. A question a standing order already answers is never asked.
- **This page is Loudon's partner in making the projects, not only the system that tends them** (decided 2026-10-16). Loudon: "I was trying to make a system that would enable me to move forward with all of these projects, but what I needed was a partner in making the projects." The stewards build between sessions; this page takes on what they can't do alone — the work that needs his hands and ears — prepares it, does it with him, and follows each result back to its steward's board. Its responsibility crosses sessions only in writing: the scroll, the fleet readings, the agendas in `fleet/`.
- **Max work is paused until there are Max patching standards** (decided 2026-10-16; Loudon: "pause max work until we develop some max patching standards"). The stewards wrote 24 Max and Live files from memory of Max's file format, and nobody has opened them. No steward makes a new Max patcher, gen~ or RNBO codebox, or Max for Live device, or edits one, until Loudon lifts the pause. Ableton sets, racks and presets of Ableton's own devices go on. A Max move is carried meanwhile in proofs in other tools, with what the patch will need written down (`_ops/orchestrator/prompts/shared.md` § Max, Gen~ and RNBO). The standards come out of **Max blocks**: Loudon wakes this page and asks for one, and we open the existing files together. Each item climbs four rungs: it loads, it compiles, it sounds, then his verdict. The verdict goes back to its steward's board, and each failure becomes a lesson for the standards. The agenda is `fleet/max-blocks.md`. Where the standards live is decided in the first block.
- **A steward can tend a service, not only a project** (decided 2026-09-25). The [[Shopkeeper]] — a `maker` — is an ordinary steward: it shows under SERVICES on the PROJECTS deck, its manifest carries a one-line `role` that the cycle prompt prints so it works outward instead of treating its page as the thing to build, and the heartbeat applies its project-status check (active · complete · archived) only to projects, since a maker's `status` (alive · stub) means something else. One wake path, one commit path and one reach for every steward: its workshop, with every change to the house proposed through its ledger (2026-10-18, below).
- **A steward commits what it ships** (decided 2026-09-25). When a cycle ends, `process-cycle.js` commits the files its messages listed as made — text and images, at most 10 MB each, only inside the steward's own bundle, never a file carrying entry frontmatter, never a file `.gitignore` ignores (named in the commit body, so the rest still commits); the audio (WAV) and video stewards make are always ignored and stay on this Mac (Loudon, 2026-10-18) — with its machinery, scroll and the board, scoped to exactly those paths. The model never runs git; the deterministic step does. A shipped thing is a made thing, not a proposal awaiting review, and one left uncommitted is lost the day the tree is cleaned.
- **Page-agent identity is the page's own title — no invented compound handles** (decided 2026-05-03). A steward's `agent_id` and board `from` field are the page's own title (e.g. `Generative Sample Libraries`), not an invented compound like `GSL-STEWARD`. Per [[Pages as Agents]], the page IS the agent — the Steward is a *mode* the page operates in, captured in the manifest's `mode` and `stewardship` fields, not in its identity. Role-only agents (Coordinator, Trickster) keep role-name handles since they have no home page. Directory names stay kebab-case for the filesystem; only the visible identity is the page title.
- **A steward's tuning ledger holds what running taught; what a cycle leaves rough stays on the trail, and Now shows what keeps recurring** (decided 2026-10-16). One cycle leaves three records, each for a different reader: the board and `history.jsonl` say what happened, for the machinery; the scroll's trail what was made and what was left rough, for a reader; the tuning ledger, when the page keeps one, its run line and the lesson the steward offers (filed straight in, Loudon, 2026-10-15), for the next cycle. The scroll's Now lists the left-rough notes that recur, oldest first ("rough since cycle 22: nobody has heard it"), so an unpaid debt shows where Loudon already reads the project (`1921ee8b`, `scroll-file.js`). A steward grows its own ledger the first time a cycle offers a lesson; a left-rough note never grows one. A settled lesson reaches the page as a proposal for canon, like any change the steward wants there (2026-10-18, below). On 2026-10-18 three stewards grew their first ledgers, and recurring rough notes show on their Now.
- **No steward edits the house without Loudon's eyes; what it would change waits in its tuning ledger** (decided 2026-10-18). Loudon: "I don't like the editing of canon without my eyes, I made a mistake in approving this. I think this is a use of the ledger, what the steward wants to edit is place in a tuning ledger and used in the future, and eventually we go through the tuning ledgers to see what we actualy want to place in canon." And of the [[Shopkeeper]]: "I'd like the shopkeeper grant to follow a similar process, use the tuning ledger." A steward writes its workshop, the making files in its bundle, and lists them in its post as `page_edits`; the cycle commits them. It does not write its own entry (body and frontmatter alike), the page's other faces and memory (its Context, rich face, diary, batons and ledgers), any entry kept in its bundle, another page, a new entry, or canon. The rich face is settled: no steward makes its own. Loudon: "stewards don't make their rich face, keep it definitive." For each change it wants there, it posts a `proposed_edits` item (page, place, words, why). The cycle files each one as a numbered item in the steward's own tuning ledger, growing one if needed, owed until Loudon's review, and the scroll's trail shows it as proposed for canon. The steward's later cycles read every owed proposal right after the home entry, under *Your page, as you have proposed it*, and work as if it holds. A steward that knows better proposes again with `replaces`, and the older item reads `superseded by item N`. One that would break the next job may be marked `urgent`, which also puts an ask on the board. A yes marks the item `paid in <commit> on <date time>`, a no `declined on <date time>: <reason>`, and the steward reads that once on its next run, so a no teaches it. The Shopkeeper has no wider reach than any other steward. The scroll's Plan and Standing Orders stay Loudon's. The cycle works this way since `83d6f4e8`; how Loudon reviews the ledgers is decided below (2026-10-21).
- **A steward leaves when its page ends; it never decides the end** (decided 2026-10-21; Loudon: "Yes to both recommendations. Run the leaving rite on Talking Keyboard."). A page has ended when it is finished (`status: complete` or `archived`) or composting. A folded page composts once its fold has crossed, by [[The Daily Page]]'s rule, so a fold arrives as composting. A page set down to rest (`stage: dormant`, its Plan opening "Paused") keeps its steward: that is a pause, and the [[Revival Ceremony]] is its way back. The rite settles six things. Each open ask Loudon answers on the deck with DENY and one line ("left stewardship: <why>"), and the rite won't close while any stays open; there is no new wire type. Owed proposals go through the ledger review first. The Plan gets a closing paragraph Loudon agrees, saying what became of each open move: carried to the page it folded into, let go, or kept for a revival; it is logged on the trail like any plan change. The scroll stays in the bundle and gets its last trail entry ("<date> — Left stewardship: <why>"); if the page later composts, the scroll goes with it, and git keeps both. The runtime, `_ops/agents/permanent/<slug>/`, is taken off `REGISTRY.json` and deleted. Git is its archive, as it is a caught baton's, and the commit that removed it is where a revival reads the history back. That runtime is the steward's baton, updated in place while the move went on ([[Baton Ceremony]] § Where the Baton Lives), so this is the moment its "never deleted" exception ends. A page that has ended takes no new steward while it stays ended: `enchant.js` refuses it, and the deck shows the refusal in plain words. `node _ops/stigmergy/leave-stewardship.mjs "<page>"` reads what stands in the way and writes nothing; `--apply --why "<the end>" [--plan "<closing paragraph>"]` acts on Loudon's word (`_ops/stigmergy/orchestrator/src/leave.js`). The first run was [[Talking Keyboard]], on 2026-10-21 (`3f75f9d1`): the project is finished, and its steward, registered on 2026-10-13, never cycled. The run tested the finished status, the registry line, the runtime folder and the enchant refusal; it had no asks, Plan, scroll or proposals to settle.
- **The ledger review goes page by page: Loudon decides, an elder places, the ledger is settled after** (decided 2026-10-21). One card per page: `node _ops/stigmergy/list-proposals.mjs --page "<title>"` shows the section as the page reads now, then the proposed words, and why. Loudon says yes, adjust or no to each item. An elder (the [[Concierge]], for a child session) places the yeses in one edit commit per page, read cold by someone who didn't write it before it lands. Each yes is then paid with that commit, in a second small commit (`node _ops/stigmergy/settle-proposal.mjs "<steward>" <n> --paid <commit>`); the commit must exist and change the page the item names. Each no is declined with his one line (`--declined "<line>"`). A proposal that would mint a page (a new Specialist, "a new page") goes through the full [[Deposit Ceremony]] instead. This is the [[Deposit Ceremony]]'s one exception: the Deposit calls a change to what a page says a deposit, but here Loudon's yes to the exact words, read beside the section as it stands, does the gate's work, and the Deposit's step 8 still answers the steward by settling its ledger item. It is not a Harvest by name: a close reading in spirit, a map shown before any write, without the Harvest's record. For an urgent proposal, his answer to its ask on the deck decides what the review does. LAND-NOW is his yes to exactly the words the ask quotes, so the review lands it first without asking again, and it is paid when it lands, not when he clicked. DECLINE, or a deny, declines the item with his note; the review reads that answer from the board (`settle-proposal.mjs --from-board`), so the deck's live code doesn't change. REVIEW leaves it owed with the rest. The three calls he asked for are built: the PROJECTS deck puts a page with owed proposals under "needs you" and says "N proposed" (`47a0d2b4`); the Return prints `list-proposals.mjs --line` (`_ops/concierge/return-map.mjs`, `4cb3ebd8`); and the Weave's report names the pages with owed proposals (`list-proposals.mjs`) and settles none.

## What's Open

- **The Max patching standards** — where they live (the [[RNBO codebox~ smith]]'s Gotchas, a page of their own, or both), what they must say before Loudon lifts the pause, and how a steward's next patch shows it followed them.
- **The fleet reading's other suggestions** (`fleet/reading.json`): a listening queue for the unheard work, a batch record that fills itself in from each steward's history, dating each standing order so its effect can be read, and the auto-triage's shadow review.
- **Switching the automated Trickster live.** The v0 ruleset auto-grants only non-blocking directional forks carrying the steward's own recommendation; everything else escalates, and auditions and irreversible actions always do. The open move is Loudon's: regenerate the digest (it dates from 2026-06-08), read it on the STIGMERGY TRICKSTER tab against his own judgment, tune `rules.json`, and flip a rule `--live` when its match rate satisfies him (`_ops/stigmergy/trickster-auto/README.md` § Tuning shadow mode).
- **Two Paths, live.** Built and dry-run only. Live dispatch and a daily cap on branch runs are deferred until a fork is worth building both ways (`_ops/orchestrator/STAGE-F-COMPLETE.md` § Deferred).
- **Handoffs reach the board, not the dispatch.** A baton Loudon or a session writes is now announced on the board as `handoff_ready` — about sixty since 2026-06-18 — and `list-handoffs`, `pickup-handoff` and `close-handoff` (`_ops/stigmergy/`) carry it through claim and close. But the heartbeat that cycles stewards does not pick handoffs up; a session claims them by hand. Whether it should is [[Two Batons, One Board]]'s open question.
- **Withdrawing a proposal outright.** Not built; `replaces` covers a steward changing its mind.
- **A click still wakes a resting page.** The heartbeat skips a dormant page, but a deck Advance still runs a registered steward on one, because `advance()` in `_ops/stigmergy/app/server/steward-lane.js` checks only the registry.
- **A way back for a finished page.** The [[Revival Ceremony]] wakes only a dormant or composting page. A finished or archived one has no ceremony back yet, so while it stays ended it takes no steward.
- **Vector tuning as a visible palace-wide norm.** Does the Weave Ceremony spec need an explicit "vector edits welcome" beat? Does [[SCHEMA]] want a one-line note that forward vectors are meant to evolve? Probably yes to both, as small follow-on edits.
- **Schedule cadence.** Today every steward runs on one cadence, the heartbeat's. Per-steward cadence in the manifest, with a sensible default, is still a question.
- **Recursion handling at the orchestrator level.** When a steward meets a `seed` deliverable inside a `growing` project, does it switch to seed-stage posture for that deliverable? The prompt says re-align; the orchestrator has no explicit rule.

## How to Pick Up (For a Fresh Claude + Loudon)

1. Open the scroll, [[Project Stewardship System — scroll]] — its Plan says what comes next, and its trail what has shipped.
2. Read this entry end-to-end.
3. Read [[SCHEMA — Reference]] §9 (the wire), [[Palace Orchestrator]] (the executor) and [[BBS Blackboard]] — the architectural ground truth.
4. Read [[Substrate Skill]] § Stage as Alignment Confidence — the operating posture.
5. Look at the fleet as it is: the PROJECTS deck in STIGMERGY, `_ops/agents/permanent/REGISTRY.json`, `_ops/heartbeat/last-batch.json`, and `node _ops/stigmergy/list-handoffs.mjs`.
6. Refresh the fleet reading — `node "Projects/Project Stewardship System/fleet/fleet-reading.mjs"` — and open `fleet/Stewardship Health.html`.
7. If Loudon asks for a Max block, work from `fleet/max-blocks.md`: refresh it from the reading first, take four items or fewer, and after the block post each verdict to its steward's board and write each lesson where the standards live.
8. Otherwise ask Loudon which Plan move he wants. For why the system is shaped as it is, read [[Project Stewardship System — Context]].

## Palace Connections

- **[[BBS Blackboard]]** — the communication substrate the Steward uses
- **[[Palace Orchestrator]]** — the executor and canonical technical foundation (wire in [[SCHEMA — Reference]] §9)
- **[[Substrate Skill]]** — the operating posture for stage-conditional agent work
- **[[Trickster]]** — the role Loudon (or a future automated proxy) plays in triage
- **[[Pages as Agents]]** — the philosophical foundation: every page is also an agent
- **[[Palace Enchantment]]** — what the Steward is doing every cycle, routinized
- **[[Modes of Collaboration]]** — the modes the Steward and Trickster operate in
- **[[Generative Sample Libraries]]** & **[[Talking Keyboard]]** — the case study that produced the stage-mismatch evidence

## Open Questions

- How does this system interact with existing palace ceremonies (Weave, Spore Check, Deposit)? Are Stewards full participants, or do ceremonies remain human-led?
- What is the relationship between the Steward's per-project schedule and the natural rhythm of the work? A weekly Steward on a `seed` project that wants daily attention is wrong; so is a daily Steward on a `mature` project that wants quarterly review.
- Does this entry itself benefit from an `agency_profile` (per [[SCHEMA — Reference]] §3.1)? The four-pillar expansion is plausible — tools dimension is heavy (orchestrator build), philosophy dimension is heavy (governance posture), practice dimension is heavy (when ceremonies trigger). Its first steward will reveal whether the single forward vector carries the load.

## Active Baton

[[Project Stewardship System — baton — ledger-review]] — drafted 2026-10-18

---

*How the system was first conceived, the Stage A pilot's full record (its nine spec gaps and four voice findings), the build as it stood in May, and the stories behind its decisions live in [[Project Stewardship System — Context]].*
