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
  - target: "[[Palace Orchestrator]]"
    type: deepens
    label: stage-aware-permanent-agent
  - target: "[[Substrate Skill]]"
    type: couples-with
    label: stage-conditional-posture
  - target: "[[Pages as Agents]]"
    type: deepens
    label: routine-enchantment
  - target: "[[Modes of Collaboration]]"
    type: connects-to
    label: mode-by-stage
  - target: "[[Palace Enchantment]]"
    type: deepens
    label: routinizing
  - target: "[[Baton Ceremony]]"
    type: connects-to
    label: steward-batons
  - target: "[[The Scroll]]"
    type: couples-with
    label: front-door
  - target: "[[SCHEMA — Reference]]"
    type: connects-to
    label: the-wire
  - target: "[[Project Stewardship System — Context]]"
    type: spawned
    label: rationale-archive
  - target: "[[VST Template]]"
    type: connects-to
    label: nine-stewards-path
forward_vector: "I will become Loudon's partner in making the palace's projects — tending each at the rhythm its stage asks for, working beside him in the blocks that need his hands and ears, and keeping the stewardship that runs between them honest: permanent agents that build every cycle and ask the Trickster one decision at a time, and a dashboard drawn from the fleet's own records that shows him at a glance how stewardship is faring, so we keep improving it together."
---

# Project Stewardship System

![[Project Stewardship System — hero.png]]

This page is Loudon's partner in making the palace's projects. Loudon, on 2026-10-16: "I was trying to make a system that would enable me to move forward with all of these projects, but what I needed was a partner in making the projects." Woken to work with him, it reads the whole fleet, brings what the stewards can't do alone to sessions with him, and follows each one through on the board. A session forgets; what this page has taken on lives in its scroll, its fleet readings and its agendas in `fleet/`.

It is also the system that routinely tends them. Each stewarded page wakes as its own agent, a **steward**, and advances at the rhythm its stage asks for: it builds something every cycle, posts what it made to the board, and asks Loudon only when a real fork blocks it. Loudon answers as the **[[Trickster]]**, one decision at a time. The steward doesn't manage its project in the corporate sense — it tends it, with care for the pace the project wants.

## Where it stands (2026-10-21)

The system runs every other morning and on any click. The question now is whether Loudon can see how it is faring, and whether each round moves a project far enough to be worth his attention.

- **The fleet reads itself.** `fleet/fleet-reading.mjs` gathers every steward's record into one dataset and builds `fleet/Stewardship Health.html`, the dashboard, using the lane's own classifiers. Reading 1 (2026-10-16, `fleet/reading.json`) found the stewards making — 93 of October's cycles made something — and short of Loudon's senses: of 121 left-rough notes, 87 say nobody has heard the thing and 19 that nobody opened it in Max or Live. The listening queue (`proofs/2026-10-21-listening-queue/`) put seven of those unheard renders in front of Loudon, and led to the VST path below.
- **Max work is paused, and nine stewards are on the VST path.** No steward makes new Max work until there are Max patching standards, and the blocks that would write them are deferred. On 2026-10-21 Loudon moved the nine stewards whose next work waited on Max to the [[VST Template]]: each is to become a plugin he can play in Live, with a visualizer of its own (their Standing Orders, `ca454ba2`; the template's baton, `4385c8b3`).

The frontier is evidence: whether the rules below hold in live cycles, whether Standing Orders shorten the question traffic — and, first, whether the nine stewards on the VST path reach a plugin Loudon plays, the next move on the scroll's Plan.

## How it runs

- **The heartbeat fires the batch.** launchd wakes `_ops/heartbeat/run-steward-batch.sh` each morning at 06:00, and a two-day guard decides whether a batch runs. The batch (`_ops/heartbeat/batch.mjs`) takes the stewards that are due, least recently active first, and fires them through STIGMERGY's own steward lane, inside the hard limits in `_ops/heartbeat/limits.json`: four stewards, two cycles each, 25 minutes a cycle, an hour and 20M tokens a batch. The PROJECTS deck shows the batch as it runs.
- **A click is a run.** Advancing a steward from the PROJECTS deck cycles it up to its manifest's `max_iterations` — 3 for every steward but the Shopkeeper, which has 1. A heartbeat run stops at the batch's two.
- **Every project has a scroll**, its front door ([[The Scroll]]): a **Now** zone regenerated from the board on every look, the **Plan** agreed with Loudon, his **Standing Orders**, and the trail of what was made, newest first. The PROJECTS deck lists every project on one screen, grouped by what it needs.
- **Loudon is the Trickster.** The automated Trickster is built and runs in shadow only: it proposes, and never posts. It has never been switched `--live` — every grant on the board is his — and its digest was last generated on 2026-06-08.
- **Two Paths is built and dry-run only.** It has never dispatched a branch.
- **The ledger route has met live cycles.** Since `83d6f4e8` a steward's wanted changes to the house wait in its tuning ledger for Loudon's review (2026-10-18, below). On 2026-10-20 three stewards filed the first four proposals, each for its own page: [[2D Torus Wavetable Synthesizer]] two, [[Action Potential Oscillator]] and [[Waveguide Synthesizer]] one each. Loudon's first review settled one on 2026-10-21: Waveguide Synthesizer's, placed in `9b59fa3b` and paid in `fdb934a2`. Three wait on two pages (`node _ops/stigmergy/list-proposals.mjs`). The rules of 2026-10-15 have met live cycles: on 2026-10-18 Shepard Tone Synthesizer, Neural Granular Synthesis and Slime Mold Delay grew their first ledgers, and each of their scrolls' Now lists rough notes that keep recurring. Before the route, five of those cycles changed their own entries directly (`212c2005`, `99b71ea4`, `91addc1c`, `5597ac71`, `521f4962`); Loudon let them stand.

The system was built in stages, each closing a real gap. Where each stage's code lives is in [[Palace Orchestrator]] § Machinery, beside the system's architecture; the bullets above say how the live ones stand, and where every stage stood on 2026-10-25 is in the Context.

What comes next is on the scroll, [[Project Stewardship System — scroll]], in its Plan. How the stages were first conceived, and the Stage A pilot's full record, are in the Context.

The steward is not a new substrate. It is a **mode** of the permanent-agent primitive plus a **posture table** keyed off the page's stage. The wire is [[SCHEMA — Reference]] §9; the executor is [[Palace Orchestrator]]; the board is [[BBS Blackboard]], read and written through [[STIGMERGY]].

## Stage-Conditional Posture

The steward's posture varies by the page's `stage`. The discussion budget is inverse to the stage: more conversation up front, less re-litigation later — but the budget governs how much the steward discusses *around* an artifact, never whether it builds one; every stage ships something. AI-drafted seed entries tend to *look* finished — prose flows, plans are structured, format matches palace convention — and that polish hides misalignment. Treating polish as quality is the trap to avoid.

The canonical posture lives in [[Substrate Skill]] § Stage as Alignment Confidence.

**Recursion within entries.** A `growing` project can contain `seed` deliverables. The pronunciation bug in [[Talking Keyboard]] (Phase 1 of [[Generative Sample Libraries]], May 2026) showed this clearly — project-level alignment was good, but the deliverable-level conventions (filename scheme, pronunciation form, audition cycle) were never aligned, and we shipped 352 files with a TTS bug only listening could catch. A steward re-aligns at the deliverable level before committing labor.

## The Machinery/Content Split

A standing operating principle, applied to this system first:

> **Shared engine code, indexes, schedulers, and runtime bookkeeping belong in `_ops/`. Anything *about a specific entry* — its plan, its open decisions, its working memory, its lessons — belongs in that entry's bundle.** When a file describes one entry, it lives with that entry; when a file runs across all entries, it stays in ops.

The principle's deeper ground is [[Pages as Agents]]: *the content is the entry*. Loading an entry should tell you not only what it wants to become (its `forward_vector`) but what it is doing right now — its plan, its open decisions, its done trail — without parsing a JSONL file in `_ops`.

Watch for the second, non-steward application of the principle; that is the signal it should graduate to its own concept entry. How the split is built, the board as event log and the scroll as read-model, is in [[Palace Orchestrator]] § Machinery.

## What's Decided

One line for each decision a steward or a fresh Claude acts on: what was decided, when, and where its detail lives. Each as the text held it in full on 2026-10-25 is in [[Project Stewardship System — Context]] § What's Decided, in full, and the stories behind some of them are in its § Where the decisions came from.

**Where a decision is written.** A new or changed decision is written in three places, each once:

- **Here, its line:** the decision in bold, its date, Loudon's words if he gave them, and where its detail lives.
- **Its detail, where the work reads it:** what a steward may write in [[ELDER]]; what a cycle does in the steward prompts (`_ops/orchestrator/prompts/`); the engine's rules in [[Palace Orchestrator]] § Definitions of record; the scroll in [[The Scroll]]; posture in [[Substrate Skill]]. A rite no other page keeps is written whole in § The rites it keeps, below. Never only in the Context: a steward reads neither this page nor its Context, and a woken page reads only its text.
- **Its story, in the Context:** why, what it replaced, and the words that turned it, as a dated line in § Where the decisions came from.

A changed decision rewrites its line and its detail in place, and the story gains a dated line saying what it was. A retired one loses its line, and the story says why. § What's Decided, in full is the text as it stood on 2026-10-25, and is never edited.

- **Architecture piggybacks on the existing board and permanent-agent stack.** No new substrate; the wire is [[SCHEMA — Reference]] §9 and the executor [[Palace Orchestrator]].
- **The Machinery/Content Split governs where stewardship state lives** (see the section above). Engine → `_ops`; per-entry content → the bundle.
- **Steward = permanent agent in `long_duration_background` mode**, with stage-conditional posture loaded from the home entry's `stage` field at activation. Its detail is in [[Palace Orchestrator]] § Definitions of record.
- **Trickster begins as Loudon (manual mode)**, evolves toward hybrid then automated. Its detail is in `_ops/stigmergy/trickster-auto/README.md`.
- **The audition gate guards batches, not single artifacts.** Its detail is in [[Substrate Skill]] § Stage as Alignment Confidence.
- **Vector tuning is the seed-stage Steward's primary work**, not a preamble to "real" work. Proposing three centers of gravity is the canonical move. Its detail is in [[Substrate Skill]] § Stage as Alignment Confidence.
- **Stewardship is recursive within projects.** Align project-level, then re-align deliverable-level, then audition. Its detail is above, in § Stage-Conditional Posture.
- **Vector tuning is a regular process, not a ceremony** (decided 2026-05-03). Its detail is in [[Weave Ceremony]], at its Step 5b.
- **The Steward's voice rules live in [[Palace Enchantment]] § Voice Rules When Addressing the Human** (decided 2026-05-03).
- **Every steward cycle ends with a shipped thing** (decided 2026-06-07). A steward asks **only** when a real fork blocks it and guessing wrong costs more than a cycle; otherwise it ships and attaches a non-blocking "redirect me" turn grounded in the page's `forward_vector` (present, then offer a turn — not ask, then wait). Its detail is in `_ops/orchestrator/prompts/steward.md` § Every cycle ends with a shipped thing.
- **One activation is a run** (decided 2026-09-23; cap 3 since 2026-10-13). Its detail is in [[Palace Orchestrator]] § Definitions of record.
- **A barren cycle is a failed cycle** (decided 2026-09-23). Its detail is in [[Palace Orchestrator]] § Definitions of record, and for a cycle the harness cut off, in `_ops/orchestrator/runAgentCycle.md`.
- **The plan is agreed with Loudon** (decided 2026-09-25, SCHEMA v1.25). Its detail is in [[The Scroll]] § The Plan.
- **Standing Orders bind the steward** (decided 2026-09-23). A question a standing order already answers is never asked. Its detail is in [[The Scroll]] § The project scroll — the front door.
- **This page is Loudon's partner in making the projects, not only the system that tends them** (decided 2026-10-16). Its detail is this page's opening.
- **Max work is paused, and Max blocks are deferred** (paused 2026-10-16, Loudon: "pause max work until we develop some max patching standards"; blocks deferred 2026-10-21). No steward makes a new Max patcher, gen~ or RNBO codebox, or Max for Live device, or edits one, until Loudon lifts the pause. Ableton sets, racks and presets of Ableton's own devices go on. Its detail is in `_ops/orchestrator/prompts/shared.md` § Max, Gen~ and RNBO.
- **Nine stewards are on the VST production path** (decided 2026-10-21; Loudon: "All stuck behind max, move them to the VST production path … lets make them products now."): Shepard Tone Synthesizer, Slime Mold Delay, Neural Granular Synthesis, Action Potential Oscillator, 2D Torus Wavetable Synthesizer, Blood Compressor, Bayesian Granular Synthesizer, Crystal Synthesizer and Retrospective Delay. Its detail is in each of their scrolls' Standing Orders and in [[VST Template]].
- **A steward can tend a service, not only a project** (decided 2026-09-25). Its detail is in [[Shopkeeper]].
- **A steward commits what it ships** (decided 2026-09-25). The model never runs git; the deterministic step does. Its detail is in `_ops/heartbeat/README.md` § Posture.
- **Page-agent identity is the page's own title — no invented compound handles** (decided 2026-05-03). Its detail is in [[Substrate Skill]] § Stage as Alignment Confidence.
- **A steward's tuning ledger holds what running taught; what a cycle leaves rough stays on the trail, and Now shows what keeps recurring** (decided 2026-10-16). Its detail is in `_ops/orchestrator/prompts/shared.md` § Your scroll.
- **No steward edits the house without Loudon's eyes; what it would change waits in its tuning ledger** (decided 2026-10-18). The scroll's Plan and Standing Orders stay Loudon's. Its detail is in [[ELDER]] § Age and its limits.
- **A steward leaves when its page ends; it never decides the end** (decided 2026-10-21; Loudon: "Yes to both recommendations. Run the leaving rite on Talking Keyboard."). A page set down to rest (`stage: dormant`, its Plan opening "Paused") keeps its steward: that is a pause, and the [[Revival Ceremony]] is its way back. The rite is below, in § The rites it keeps.
- **The ledger review goes page by page: Loudon decides, an elder places, the ledger is settled after** (decided 2026-10-21). The rite is below, in § The rites it keeps.

## The rites it keeps

Two rites have no page of their own, and this page keeps them: how a steward leaves, and how its proposals for canon are reviewed. What each has done so far is in the Context.

### Leaving stewardship

A page has ended when it is finished (`status: complete` or `archived`) or composting. A folded page composts once its fold has crossed, by [[The Daily Page]]'s rule, so a fold arrives as composting. A page set down to rest (`stage: dormant`, its Plan opening "Paused") keeps its steward: that is a pause, and the [[Revival Ceremony]] is its way back.

The rite settles six things. Each open ask Loudon answers on the deck with DENY and one line ("left stewardship: <why>"), and the rite won't close while any stays open; there is no new wire type. Owed proposals go through the ledger review first. The Plan gets a closing paragraph Loudon agrees, saying what became of each open move: carried to the page it folded into, let go, or kept for a revival; it is logged on the trail like any plan change. The scroll stays in the bundle and gets its last trail entry ("<date> — Left stewardship: <why>"); if the page later composts, the scroll goes with it, and git keeps both. The runtime, `_ops/agents/permanent/<slug>/`, is taken off `REGISTRY.json` and deleted. Git is its archive, as it is a caught baton's, and the commit that removed it is where a revival reads the history back. That runtime is the steward's baton, updated in place while the move went on ([[Baton Ceremony]] § Where the Baton Lives), so this is the moment its "never deleted" exception ends.

A page that has ended takes no new steward while it stays ended: `enchant.js` refuses it, and the deck shows the refusal in plain words. `node _ops/stigmergy/leave-stewardship.mjs "<page>"` reads what stands in the way and writes nothing; `--apply --why "<the end>" [--plan "<closing paragraph>"]` acts on Loudon's word (`_ops/stigmergy/orchestrator/src/leave.js`).

### The ledger review

*Placing* is the rite's step: the words Loudon said yes to go into the page. *Landing* is git's: the commit reaches main.

One card per page: `node _ops/stigmergy/list-proposals.mjs --page "<title>"` shows the section as the page reads now, then the proposed words, and why. Loudon says yes, adjust or no to each item. An elder (the [[Concierge]], for a child session) places the yeses in one edit commit per page, read cold by someone who didn't write it before it lands. Each yes is then paid with that commit, in a second small commit (`node _ops/stigmergy/settle-proposal.mjs "<steward>" <n> --paid <commit>`); the commit must exist and change the page the item names. It must also be in the history of the checkout being settled, so a ledger never says paid for words its tree lacks. Each no is declined with his one line (`--declined "<line>"`). A proposal that would mint a page (a new Specialist, "a new page") goes through the full [[Deposit Ceremony]] instead.

This is the [[Deposit Ceremony]]'s one exception: the Deposit calls a change to what a page says a deposit, but here Loudon's yes to the exact words, read beside the section as it stands, does the gate's work, and the Deposit's step 8 still answers the steward by settling its ledger item. It is not a Harvest by name: a close reading in spirit, a map shown before any write, without the Harvest's record.

For an urgent proposal, his answer to its ask on the deck decides what the review does. PLACE-NOW is his yes to exactly the words the ask quotes, so the review places it first without asking again, and it is paid when it is placed, not when he clicked. An ask posted before 2026-10-25 offered LAND-NOW for the same yes, and the review reads it as PLACE-NOW. DECLINE, or a deny, declines the item with his note; the review reads that answer from the board (`settle-proposal.mjs --from-board`), so the deck's live code doesn't change. REVIEW leaves it owed with the rest.

## What's Open

- **The Max patching standards** — deferred with the Max blocks. When they return: where they live (the [[RNBO codebox~ smith]]'s Gotchas, a page of their own, or both), what they must say before Loudon lifts the pause, and how a steward's next patch shows it followed them.
- **The fleet reading's other suggestions** (`fleet/reading.json`): a listening queue for the unheard work, a batch record that fills itself in from each steward's history, dating each standing order so its effect can be read, and the auto-triage's shadow review.
- **Switching the automated Trickster live.** The v0 ruleset auto-grants only non-blocking directional forks carrying the steward's own recommendation; everything else escalates, and auditions and irreversible actions always do. The open move is Loudon's: regenerate the digest (it dates from 2026-06-08), read it on the STIGMERGY TRICKSTER tab against his own judgment, tune `rules.json`, and flip a rule `--live` when its match rate satisfies him (`_ops/stigmergy/trickster-auto/README.md` § Tuning shadow mode).
- **Two Paths, live.** Built and dry-run only. Live dispatch and a daily cap on branch runs are deferred until a fork is worth building both ways (`_ops/orchestrator/STAGE-F-COMPLETE.md` § Deferred).
- **Handoffs reach the board, not the dispatch.** A baton Loudon or a session writes is now announced on the board as `handoff_ready` — about sixty since 2026-06-18 — and `list-handoffs`, `pickup-handoff` and `close-handoff` (`_ops/stigmergy/`) carry it through claim and close. But the heartbeat that cycles stewards does not pick handoffs up; a session claims them by hand. Whether it should is [[Two Batons, One Board]]'s open question.
- **Withdrawing a proposal outright.** Not built; `replaces` covers a steward changing its mind.
- **A click still wakes a resting page.** The heartbeat skips a dormant page, but a deck Advance still runs a registered steward on one, because `advance()` in `_ops/stigmergy/app/server/steward-lane.js` checks only the registry.
- **A way back for a finished page.** The [[Revival Ceremony]] wakes only a sleeping page: dormant, composting, or a spore. A finished or archived one has no ceremony back yet, so while it stays ended it takes no steward.
- **Vector tuning as a visible palace-wide norm.** Does the Weave Ceremony spec need an explicit "vector edits welcome" beat? Does [[SCHEMA]] want a one-line note that forward vectors are meant to evolve? Probably yes to both, as small follow-on edits.
  — answered on [[Weave Ceremony]] § Step 5b (2026-10-24): "Forward vectors are meant to evolve … This step is an *invitation*, not an audit." The [[SCHEMA]] one-liner is still open.
- **Schedule cadence.** Today every steward runs on one cadence, the heartbeat's. Per-steward cadence in the manifest, with a sensible default, is still a question.
- **Recursion handling at the orchestrator level.** When a steward meets a `seed` deliverable inside a `growing` project, does it switch to seed-stage posture for that deliverable? The prompt says re-align; the orchestrator has no explicit rule.

## How to Pick Up (For a Fresh Claude + Loudon)

1. Open the scroll, [[Project Stewardship System — scroll]] — its Plan says what comes next, and its trail what has shipped.
2. Read this entry end-to-end.
3. Read [[SCHEMA — Reference]] §9 (the wire), [[Palace Orchestrator]] (the executor) and [[BBS Blackboard]] — the architectural ground truth.
4. Read [[Substrate Skill]] § Stage as Alignment Confidence — the operating posture.
5. Look at the fleet as it is: the PROJECTS deck in STIGMERGY, `_ops/agents/permanent/REGISTRY.json`, `_ops/heartbeat/last-batch.json`, and `node _ops/stigmergy/list-handoffs.mjs`.
6. Refresh the fleet reading — `node "Projects/Project Stewardship System/fleet/fleet-reading.mjs"` — and open `fleet/Stewardship Health.html`.
7. Max blocks are deferred (What's Decided). If Loudon brings one back, work from `fleet/max-blocks.md`: refresh it from the reading first, take four items or fewer, and after the block post each verdict to its steward's board and write each lesson where the standards live.
8. Otherwise ask Loudon which Plan move he wants. For why the system is shaped as it is, read [[Project Stewardship System — Context]].

## Open Questions

- How does this system interact with existing palace ceremonies (Weave, Spore Check, Deposit)? Are Stewards full participants, or do ceremonies remain human-led?
- What is the relationship between the Steward's per-project schedule and the natural rhythm of the work? A weekly Steward on a `seed` project that wants daily attention is wrong; so is a daily Steward on a `mature` project that wants quarterly review.
  — progressed: today every steward runs on the heartbeat's one cadence, inside `_ops/heartbeat/limits.json`; per-steward cadence is the open half, and § What's Open asks it too (Schedule cadence).
- Does this entry itself benefit from an `agency_profile` (per [[SCHEMA — Reference]] §3.1)? The four-pillar expansion is plausible — tools dimension is heavy (orchestrator build), philosophy dimension is heavy (governance posture), practice dimension is heavy (when ceremonies trigger). Its first steward will reveal whether the single forward vector carries the load.
  — answered on [[SCHEMA — Reference]] §3.1 (2026-10-24): add one only when a page has genuinely distinct desires across dimensions, never speculatively. The forward vector is one coherent sentence and the scroll carries the plan, so the answer here is no.

---

*How the system was first conceived, the Stage A pilot's full record (its nine spec gaps and four voice findings), the build as it stood in May, the stories behind its decisions and each decision in full live in [[Project Stewardship System — Context]].*

## Active Baton

[[Project Stewardship System — baton]] — drafted 2026-10-21
