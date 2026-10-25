---
title: "Project Stewardship System — Context"
born: 2026-10-16
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: context-of
forward_vector: "I hold what Project Stewardship System's text leaves out — how the system was first conceived, the hand-run pilot that tested it, the build as it stood in May, and where its decisions came from — so the text can say only what is true now, and the next worker can still learn why it is shaped this way."
---

# Project Stewardship System — Context

The history behind [[Project Stewardship System]]. The text says what the system is and where it stands; this file keeps how it got there. The sections below came out of the text on 2026-10-16, word for word, so they still speak in the present tense of the day they were written. Where they say "not built", "awaiting smoke-test" or "15 stewards", that was true then and is not now — the text holds the present.

## Where the page came from

This entry is the deposited form of a 2026-05-02 conversation that began as "design an automated project management system" and ended in a richer place: the system isn't entirely new, the alignment problem is harder than initially framed, and the agent's posture must vary by stage of the project it is tending.


### The original question

Loudon's seed framing (2026-05-02): a routinely-running Claude agent looks over the project folder, attempting to move all projects forward by repeatedly enchanting project entries and speaking through that entry through messages in the BBS. The project entry asks Loudon questions when necessary. Status reports, blocks, needs are all reported in the BBS. Loudon can either read through himself, or a supervisor agent can triage and ask questions one by one to move forward as easily as possible.

That framing had a Steward (the routine agent) and a Supervisor (the triage layer). The conversation reframed both onto existing palace infrastructure.

### The reframe: this is already mostly specced

After reading [[BBS Blackboard]], BBS Production Plan, and the agent-infrastructure spec (since retired; its cores now in [[Palace Orchestrator]]), the architecture map became clear. Most of what was being designed already existed in spec form:

| Concept in seed framing | Existing palace name |
|---|---|
| Steward (routine agent) | Permanent agent, long-duration background mode (Infrastructure Spec §3.5, §4.6) |
| Enchanting a project entry | Enchantment of a permanent agent whose `home` is the project page |
| BBS messages from project entries | The existing message schema (§2.2) on the persistent blackboard |
| Status / blocks / needs | Existing message types: `BROADCAST`, `FLAG`, `RESOURCE_REQUEST`, `HEALTH_NOTICE` |
| Supervisor triage | The Trickster role (Infrastructure Spec §0.4), with the inbox spec (§2.6) |
| Automated triage | Automated Trickster mode (§4.7), specifically named but unspecced |

What the conversation contributed was less a new architecture and more a *posture* — the recognition that the agent should behave differently per project stage.


The specs this table points at (the Palace Agent Infrastructure Spec, the BBS Production Plan, the Orchestrator Production Plans v0.1 and v0.2) were retired in July 2026 — the plans in `5a22dee7` (2026-07-04), the Infrastructure Spec in `0932b7b4` (2026-07-08). Their live cores are [[Palace Orchestrator]] and [[SCHEMA — Reference]] §9; git holds the rest.

### The conversation that deposited it

This entry was deposited 2026-05-02 from a single Cowork session that:

1. Started with Loudon's framing of an "automated project management system"
2. Reframed against the existing BBS architecture once that was read
3. Pivoted into Forward Vector tuning for [[Generative Sample Libraries]] using the [[Modes of Collaboration]] framework
4. Hand-ran a Build Session for [[Talking Keyboard]] (Phase 1 of GSL)
5. Hit a stage-mismatch bug (the Kokoro pronunciation issue) that surfaced the AI-polish trap
6. Synthesized the stage-as-alignment-confidence rule, deposited it into [[Substrate Skill]]
7. Deposited this entry as the meta-system home

The pattern of the conversation itself was the first concrete instance of the system: Loudon and Claude Cowork-side, advancing entries through stages, with the Trickster role played by Loudon directly. Future cycles of this conversation pattern can serve as Stage A pilots without committing to Stage B.


## The five-stage plan as first written

The plan as conceived in May 2026, with the Stage A pilot record in full. Stages B to E were later built; the text's stage table says where each stands now, and the scroll's Plan carries the path ahead.

Each stage closes a real gap. Order matters: each unblocks the next.

### Stage A — Hand-run a permanent agent on one project ✓ Done — 5 cycles (2026-05-03 → 2026-05-04)

Pick one project and write its manifest by hand per Infrastructure Spec §3.1. Run one cycle by hand — load context per the spawn discipline, generate a response per the stage-conditional posture above, append to history, append a spec-conformant message to the persistent blackboard. No orchestrator, no schedule, no automation. The output is an artifact + lessons that scope Stage B.

**Pilot run (2026-05-03):** [[Generative Sample Libraries]] (growing, Phase 1 shipped, Phase 2 well-specified) was the chosen project. Hand-run from a Cowork session, with Loudon serving as the human Trickster reading the inbox.

#### What was built

A permanent-agent directory at `_ops/agents/permanent/generative-sample-libraries/` containing the runtime artifacts (these stay in `_ops/` because they're operational state, not knowledge):

- `manifest.json` — spawn config per Infrastructure Spec §3.1, plus a `stewardship` block (stage at spawn, vector at spawn, posture source) and a `_pilot_metadata` block flagging hand-run provenance
- `state.json` — orchestrator working state, **pure runtime** after the SSOT cutover (2026-06-09): `iteration`, `last_active`, `last_read_cursor`, `health` (+ optional `_*_metadata`). It no longer carries a `stewardship` substate or `pending_requests`/`resolved_requests` arrays — stage/vector are read live from the entry frontmatter, decision state from the board, both surfaced in the bundle `[Entry] — scroll.md` (the `plan.md` read-model until 2026-09-23)
- `history.jsonl` — append-only event log: SPAWN → tool calls → reasoning → write_blackboard calls → CYCLE_COMPLETE, plus several post-cycle FIX events recording the corrections described below
- `pending-bbs-append.jsonl` — pre-fix forensic snapshot of the staged BBS messages

Two spec-conformant messages were appended to `_ops/swarm/persistent/blackboard.jsonl`:

1. `gsl-steward-001` — BROADCAST to GENERAL ("SPINNING UP" announcement per posting discipline §3.4)
2. `gsl-steward-002` — RESOURCE_REQUEST to TRICKSTER, `blocking: false`, asking the Trickster to pick a home for the Phase 2 Interview skill from three named options with named tradeoffs and a Steward recommendation

These are the **first two spec-conformant messages on the persistent board**. The 113 prior messages use the loose format documented as schema drift in the BBS Production Plan v0.1 closure notes (no `schema_version`, no `health` block, date-only `ts`).

#### What the pilot validated

- The Infrastructure Spec §3.1 manifest format implements as-is — no spec gaps surfaced at the manifest layer.
- The stage-conditional posture from [[Substrate Skill]] mapped cleanly onto a real-world directional decision; the Phase 2 Interview-skill-home choice is exactly a "routine directional decision, not sensory verification" → `blocking: false` to TRICKSTER.
- Growing-stage posture self-policed against re-litigation. The Steward's first impulse was to discuss Phase 2's hard gates again; the posture rule prevented that and pushed it toward the actual bottleneck.
- The recursive-within-entries rule is real and necessary. GSL is `growing` but the Phase 2 Interview skill is genuinely `seed` (no body, no concrete defaults). The Steward correctly held growing-stage posture at the project level while treating the Interview skill home as a seed-stage decision needing dialogue.
- The Trickster-as-Loudon model worked. No automation needed for this cycle. The RESOURCE_REQUEST is on the persistent board waiting for response.

#### What surfaced — 9 spec gaps and 4 content findings

**Spec gaps** that Stage B's runAgentCycle Production Plan should resolve, in priority order:

| # | Gap | Implication for Stage B |
|---|---|---|
| 9 | `request_id` location: spec ambiguous between top-level (§2.5 example) and inside payload (§2.2 schema). v0.1 inbox builder reads top-level; pilot followed §2.2 and silently broke the inbox loop. | **Highest priority.** Without this fix every hand-authored RESOURCE_REQUEST breaks pairing. Adopt §2.5's split (top-level for routing/pairing fields, payload for semantics); add schema-linter check at orchestrator. |
| 5 | Schema drift on persistent board: 113 loose-format messages, 2 spec-conformant (this pilot's). | Schema Normalization Phase needed: rewrite legacy lines, or stamp `schema_version: "0.legacy"` and skip in spec-strict reads. |
| 1 | Permanent agents have no clean `session_id` story (spec assumes session-scoped). | Decide: nullable `session_id` + new `cycle_id` field for permanent agents (cleaner), or per-cycle synthetic session_id (one less field). |
| 2 | `blackboard_session_path` awkwardly null for permanent agents. | Spec out: permanent agents read only the persistent board; field is ignored on this mode. |
| 6 | `last_read_cursor` semantics on first activation undefined. | Define: first activation reads full board, sets cursor to actual last-line ID — not pattern-match. |
| 3 | Health block provenance for hand-runs (spec says "always factual from API metadata"; hand-runs have neither). | Orchestrator-only writes to `health`; hand-runs flagged in `_pilot_metadata` so BBS readers don't treat estimated health as factual. |
| 4 | Path drift: Infrastructure Spec uses `/palace/`, reality uses `_ops/` per CLAUDE.md. | Update spec to `_ops/`, or document that `/palace/` prefix is illustrative. Pick one and write it down. |
| 7 | No `agent_id` uniqueness check across Stewards. | Add `_ops/agents/permanent/REGISTRY.json` and orchestrator-side spawn-time uniqueness check. |
| 8 | RESOURCE_REQUEST taxonomy doesn't cover directional decisions cleanly (spec examples are concrete external resources like web_search). | Either expand resource taxonomy, or introduce a new `DIRECTIVE_REQUEST` type for non-resource Trickster asks. |

**Content findings** — surfaced through four iterations on the same message during the pilot, each provoked by Loudon reading the inbox:

| # | Finding | Quote that surfaced it |
|---|---|---|
| 10 | The Steward's voice was wrong — coined compressions ("goal-defined", "gate-defined", "home-undefined") read as machine jargon, not human speech. | *"goal-defined and gate-defined I dont know what these mean and I can't follow this. Can this tone change to sound like I am talking like a human."* |
| 11 | The agent's identity was wrong — `GSL-STEWARD` invented a compound handle that violated Pages-as-Agents (the page IS the agent). | *"I will never remember what GSL-STEWARD is? I feel this should be simply coming from the page itself... Generative Sample Libraries."* |
| 12 | Concision + assume-text-only rendering — v0.1's TricksterInbox only renders `rationale`; structured `options[]` field is invisible. | *"This is a quick message... Get to the point. And simplify the message as well."* |
| 13 | Catch the user up before asking — permanent agents run over weeks; the next reader could be cold. | *"This response is expecting I remember some deep details about the project, it needs to be written as if I forgot much of what is going on in the project. Get me caught up, then ask for something."* |

All four content rules are now recorded in [[Substrate Skill]] § Stage as Alignment Confidence as a four-clause page-agent voice rule (plain first-person, brief, catch-the-user-up-first, content-lives-in-rationale) and in this entry's What's Decided as the Steward-specific framing.

The four content findings are the most operationally important learning of the pilot. Each rewrite revealed a deeper rule that future Stewards must default to. Stage B's system-prompt template (per Infrastructure Spec §3.2 `buildSystemPrompt(manifest)`) must bake all four in, otherwise permanent agents will silently regenerate the same problems on first message.

#### What Stage B now needs

A Stage B Production Plan, modeled on BBS Production Plan, should include in priority order:

1. **`request_id` location canonized** (Gap 9) — directly breaks the inbox; highest priority
2. **Schema normalization phase** (Gap 5) — handle the 113 legacy messages
3. **Permanent-agent manifest profile** (Gaps 1, 2, 6) — session_id, blackboard_session_path, cursor semantics
4. **Health-block authority enforcement** (Gap 3) — orchestrator-only writes
5. **Path conventions canonized** (Gap 4) — `_ops/` vs `/palace/`
6. **Agent-ID registry** (Gap 7) — uniqueness check on spawn
7. **Resource taxonomy** (Gap 8) — `RESOURCE_REQUEST` vs new `DIRECTIVE_REQUEST`
8. **System-prompt template for Stewards** (Findings 10–13) — bakes in voice, identity, concision, catch-up-then-ask. Without this, every new Steward repeats the four-iteration learning curve.
9. **`agent_id` defaults to home page title** (Finding 11) — orchestrator's spawn logic sets `agent_id = manifest.home` for permanent agents
10. **runAgentCycle implementation** — the §3.2 sketch is largely transcription, plus the gaps above

The Stage B Production Plan is itself a deposit-worthy artifact in the autonomous-build-contract pattern of BBS Production Plan.

#### What the pilot did not test

- **Multi-cycle continuity** — single SPAWN + cycle 1; history.jsonl resume unverified empirically.
- **Forward_vector change detection** — spec'd in §0.2/§3.2, not exercised.
- **Cross-cycle cursor utility** — set, never read.
- **Deposit-back-to-page** — Steward proposed a directional decision, not a page edit; the deposit ceremony is unexercised.

These are natural Stage B test cases.

**Update (2026-05-26):** subsequent hand-run cycles (the pilot reached cycle 5) covered most of this list. Multi-cycle continuity, cross-cycle cursor use, and forward_vector change detection all ran; the deposit-back path was validated when the steward wrote Phase 2 closure directly to the GSL page (`gsl-steward-006`). Two operational scars surfaced and were resolved: a BBS schema-strict reset between cycles 3–4 wiped the persistent board (purging the 113 legacy loose-format messages and stranding `gsl-steward-004`, cleanly superseded by `gsl-steward-005`); and a STIGMERGY v0.2 routing bug sent `session_id`-tagged responses to session boards instead of the persistent board (fixed in `TricksterInbox.jsx` + `ResponseModal.jsx`). The live pilot is parked at cycle 6, awaiting a Phase 3 source decision.

#### Recommended next move

Loudon responds to `gsl-steward-002` on the BBS — picks (a), (b), (c), or volunteers another location. Response can come via a future Cowork session (Steward reads it on next activation) or by direct hand-edit appending a `RESOURCE_GRANT` message to the persistent blackboard with `re: "gsl-steward-002"`. Then either: run another Stage A cycle (tests cross-activation continuity by drafting the Interview skill skeleton at the chosen home), or move to writing the Stage B Production Plan now.

### Stage B — Build `runAgentCycle` ✅ Build-complete (2026-05-04) — awaiting smoke-test + push

The orchestrator. This deserves its own production plan, modeled on BBS Production Plan (the autonomous build contract that produced STIGMERGY v0.1) — phased verify gates, stop-reports, vision-validator-equivalent for the spec layer. Likely Node, sibling to STIGMERGY at `_ops/stigmergy/orchestrator/`. Health score, git change detection, posting discipline enforcement, schema validation on every BBS write all live here. The thin-orchestrator sketch (from the since-retired agent-infrastructure spec; now canon in [[Palace Orchestrator]]) was detailed enough that this was largely transcription, not invention.

Schema drift on the existing persistent board (only 3 of 113 messages spec-conformant per BBS Production Plan v0.1 closure notes) gets normalized as part of this stage — either a one-time migration or a quarantine policy for legacy lines.

### Stage C — Schedule the orchestrator — specced, not built (see Orchestrator Production Plan v0.2)

A scheduled task invokes `runAgentCycle` once per project-Steward per interval. Start with one Steward, daily, on the project Stage A piloted. Tune from observation. Adding more Stewards is just adding directories — no schema or orchestrator change.

### Stage D — STIGMERGY v0.2: Trickster posting ✅ Shipped (2026-05-04)

The current STIGMERGY viewer is read-only. Triage requires writes — `POST /api/persistent`, click-to-respond on the Trickster Inbox. Without this, every Trickster response requires hand-editing `.jsonl` files. Already on the STIGMERGY roadmap as v0.2 per BBS Production Plan § What's Deferred.

### Stage E — Automated Trickster — not started; unspecced

Per Infrastructure Spec §12 forward vector, the rules engine is unspecced. This is the original "supervisor" piece: rule-based auto-grant of routine requests (read_palace), auto-deny of routine bans (web_search outside daily budget), escalation of novel cases to Loudon via push notification or batched daily digest. Needs its own design pass — a small Production Plan in the same shape as the BBS one.


## Status as of 2026-05-27 evening

The status block the text carried from May until 2026-10-16.

The body below describes the system as conceived; this block records where the build actually stands. The five-stage plan has moved well past where the rest of this page reads — the system has crossed from "test it" into "use it."

- **Stage A (hand-run pilot)** — done. Original pilot, [[Generative Sample Libraries]] (5 hand-run cycles 2026-05-03 → 2026-05-04), shipped Phase 2 and wrote back to its own page.
- **Stage B (Orchestrator v0.1)** — done, in production. 15 stewards run through it across multiple batches. The `cli.js` encoded-path bug (Cowork-discovered) is fixed; the skill at `_ops/orchestrator/` is the canonical invocation surface. 97/97 orchestrator tests + 297/297 STIGMERGY app tests green (counts grew this session).
- **Stage C (batch mode)** — thin path shipped (`batch-plan.js` + `batch.md`). `--ignore-debounce` flag added 2026-05-27 for interactive validation runs. **15-steward parallel dispatch + sequential post-processing demonstrated twice**, ~10 min wall time per batch (heaviest cycle dominates). The weekly scheduled task is still staged not created — that's the only remaining Stage C piece.
- **Stage D (STIGMERGY v0.2 Trickster posting)** — shipped, plus four named contract fixes this session: (1) lenient options-shape normalizer accepts both `{id,label}` and strings; (2) "every cycle ends with a TRICKSTER ask" steward rule; (3) top-level `options[]` accepted as fallback; (4) "emit, do not write" output discipline forbidding direct board/state writes. All five fixes are committed and validated under load.
- **Stage E (automated Trickster)** — **built (2026-05-29), shadow-default.** All six phases shipped and self-verified (`_ops/stigmergy/trickster-auto/`, 78 tests; build report at `_ops/stigmergy/trickster-auto/STAGE-E-COMPLETE.md`). A deterministic rules engine triages the TRICKSTER inbox: `auto-grant` / `auto-deny` / `escalate` (default escalate), with a ranked digest of escalations rendered on the STIGMERGY TRICKSTER tab (`DigestPanel`, +7 app tests, no regression). The audition/irreversible gate is hard-coded and cannot be overridden by the ruleset; after shadow review #1 it judges sensory-ness by the **recommended option's identity**, not by audio words in the prose. Q1 decided here (Loudon delegated): v0 auto-grants only non-blocking directional forks carrying the steward's own recommendation — the deterministic proxy for the strawman's "advances forward_vector + low cost," since the engine must not reason about prose. Live shadow split on the 16-pending board: **5 auto-grant / 11 escalate** (Loudon's first shadow review widened it from 3 grants to 5). **Loudon remains the human Trickster until he reviews the shadow match rate and flips `--live`.**

**Other infrastructure this session:** Infrastructure Spec gained §3.3.1 (dual-path health block). Path 1 keeps the original strict 6-field block for the day API-direct dispatch returns; Path 2 (current Claude-Code-resident) stamps a minimal `{score: "green", model, _orchestrator_metadata}` stub because the Agent tool doesn't return the `input_tokens` breakdown §3.3 originally assumed. Validator recognizes the dispatch_mode marker and relaxes the other field requirements. `health.js` shrinks from a token-averaging machine to a stub builder.

**15 stewards currently enchanted** (REGISTRY.json authoritative): Generative Sample Libraries (cycle 13), Generative Wavetable Libraries (cycle 6), Shepard Tone Synthesizer (cycle 3), 2D Torus Wavetable Synthesizer (cycle 2), Action Potential Oscillator (cycle 2), Blood Compressor (cycle 2), Crystal Synthesizer (cycle 2), Generative Preset Development (cycle 2), Inharmonic Wavetable Synthesis (cycle 2), Meadows and an Artist's Career (cycle 2), Portamento and Physical Pitch Modeling (cycle 2), Retrospective Delay (cycle 2), Semantic Delay (cycle 2), Semantic Webcam (cycle 2), Slime Mold Delay (cycle 2). Cycle 2 across most of these produced real deliverables (audible birefringence proof, Faust prototypes, p5.js sims, ear-training quizzes, daemon specs, sample libraries, etc.).

The live frontier is no longer technical — it's **operational bandwidth**. The system produces artifacts and asks faster than a single human Trickster can audition them; the 17-pending-decisions inbox is the new constraint. The next deferred build piece is the Drift and Consolidation steward beat — see [[Drift and Consolidation]]. (The operational-state handoff that carried this frontier was consumed and deleted 2026-06-16; git is its archive.)


## What's Decided, in full

These came out of the text on 2026-10-25, word for word, when it was trimmed to lead with the partnership; the text keeps each decision in one line and points here, and keeps the two rites whole in its § The rites it keeps. They speak in the present tense of that day, and their "above" and "below" are the text's. The posture table the text carried beside them is the last part of this section; its canonical home is [[Substrate Skill]] § Stage as Alignment Confidence.

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
- **A barren cycle is a failed cycle** (decided 2026-09-23). A cycle that posts nothing earns exactly one retry with a mandate that says so; a second barren cycle marks the steward **STALLED** (`state.health.stalled`, score red) and ends the run, and the scroll and the PROJECTS deck say "stalled" instead of "cycle 7, green." The flag clears the moment a cycle ships. Never a third try — the loop stalls loudly rather than silently. **A cycle the harness cut off is not barren** (decided 2026-09-25): when the worker was stopped by a usage limit, an expired token or an unsupported model before it posted, the cycle is recorded as *interrupted* — no barren count, no stall — and a usage limit stops the whole batch.
- **The plan is agreed with Loudon** (decided 2026-09-25, SCHEMA v1.25). The scroll's Plan changes only with his yes; a steward proposes revisions with the evidence it gained while building, may make off-plan work as proof of a different direction (flagged `off_plan`, labelled on the trail), and restates any move it refers to so Loudon is caught up, never leaning on a number.
- **Standing Orders bind the steward** (decided 2026-09-23). Loudon writes taste and direction once, in the scroll's orders zone, from STIGMERGY; every cycle prompt injects it above the board slice; it outranks the steward's lean and any older grant. A question a standing order already answers is never asked.
- **This page is Loudon's partner in making the projects, not only the system that tends them** (decided 2026-10-16). Loudon: "I was trying to make a system that would enable me to move forward with all of these projects, but what I needed was a partner in making the projects." The stewards build between sessions; this page takes on what they can't do alone — the work that needs his hands and ears — prepares it, does it with him, and follows each result back to its steward's board. Its responsibility crosses sessions only in writing: the scroll, the fleet readings, the agendas in `fleet/`.
- **Max work is paused, and Max blocks are deferred** (paused 2026-10-16, Loudon: "pause max work until we develop some max patching standards"; blocks deferred 2026-10-21). The stewards wrote 24 Max and Live files from memory of Max's file format, and nobody has opened them. No steward makes a new Max patcher, gen~ or RNBO codebox, or Max for Live device, or edits one, until Loudon lifts the pause. Ableton sets, racks and presets of Ableton's own devices go on. A Max move is carried meanwhile in proofs in other tools, with what the patch will need written down (`_ops/orchestrator/prompts/shared.md` § Max, Gen~ and RNBO). The standards would come out of Max blocks: Loudon and this page opening the existing files together, from the agenda in `fleet/max-blocks.md`. Those wait until he wants these instruments as teaching tools: "we can come back to max later if we want to make these teaching tools."
- **Nine stewards are on the VST production path** (decided 2026-10-21; Loudon: "All stuck behind max, move them to the VST production path … lets make them products now."): Shepard Tone Synthesizer, Slime Mold Delay, Neural Granular Synthesis, Action Potential Oscillator, 2D Torus Wavetable Synthesizer, Blood Compressor, Bayesian Granular Synthesizer, Crystal Synthesizer and Retrospective Delay. Each is to become a VST prototype on the [[VST Template]] that he can play in Live: the controls in the template's interface, and a "CRT" in the centre holding a visualizer drawn from that instrument's own metaphor. The order is in each scroll's Standing Orders (`ca454ba2`); the template's CRT and in-bundle builds are commissioned on its baton (`4385c8b3`).
- **A steward can tend a service, not only a project** (decided 2026-09-25). The [[Shopkeeper]] — a `maker` — is an ordinary steward: it shows under SERVICES on the PROJECTS deck, its manifest carries a one-line `role` that the cycle prompt prints so it works outward instead of treating its page as the thing to build, and the heartbeat applies its project-status check (active · complete · archived) only to projects, since a maker's `status` (alive · stub) means something else. One wake path, one commit path and one reach for every steward: its workshop, with every change to the house proposed through its ledger (2026-10-18, below).
- **A steward commits what it ships** (decided 2026-09-25). When a cycle ends, `process-cycle.js` commits the files its messages listed as made — text and images, at most 10 MB each, only inside the steward's own bundle, never a file carrying entry frontmatter, never a file `.gitignore` ignores (named in the commit body, so the rest still commits); the audio (WAV) and video stewards make are always ignored and stay on this Mac (Loudon, 2026-10-18) — with its machinery, scroll and the board, scoped to exactly those paths. The model never runs git; the deterministic step does. A shipped thing is a made thing, not a proposal awaiting review, and one left uncommitted is lost the day the tree is cleaned.
- **Page-agent identity is the page's own title — no invented compound handles** (decided 2026-05-03). A steward's `agent_id` and board `from` field are the page's own title (e.g. `Generative Sample Libraries`), not an invented compound like `GSL-STEWARD`. Per [[Pages as Agents]], the page IS the agent — the Steward is a *mode* the page operates in, captured in the manifest's `mode` and `stewardship` fields, not in its identity. Role-only agents (Coordinator, Trickster) keep role-name handles since they have no home page. Directory names stay kebab-case for the filesystem; only the visible identity is the page title.
- **A steward's tuning ledger holds what running taught; what a cycle leaves rough stays on the trail, and Now shows what keeps recurring** (decided 2026-10-16). One cycle leaves three records, each for a different reader: the board and `history.jsonl` say what happened, for the machinery; the scroll's trail what was made and what was left rough, for a reader; the tuning ledger, when the page keeps one, its run line and the lesson the steward offers (filed straight in, Loudon, 2026-10-15), for the next cycle. The scroll's Now lists the left-rough notes that recur, oldest first ("rough since cycle 22: nobody has heard it"), so an unpaid debt shows where Loudon already reads the project (`1921ee8b`, `scroll-file.js`). A steward grows its own ledger the first time a cycle offers a lesson; a left-rough note never grows one. A settled lesson reaches the page as a proposal for canon, like any change the steward wants there (2026-10-18, below). On 2026-10-18 three stewards grew their first ledgers, and recurring rough notes show on their Now.
- **No steward edits the house without Loudon's eyes; what it would change waits in its tuning ledger** (decided 2026-10-18). Loudon: "I don't like the editing of canon without my eyes, I made a mistake in approving this. I think this is a use of the ledger, what the steward wants to edit is place in a tuning ledger and used in the future, and eventually we go through the tuning ledgers to see what we actualy want to place in canon." And of the [[Shopkeeper]]: "I'd like the shopkeeper grant to follow a similar process, use the tuning ledger." A steward writes its workshop, the making files in its bundle, and lists them in its post as `page_edits`; the cycle commits them. It does not write its own entry (body and frontmatter alike), the page's other faces and memory (its Context, rich face, diary, batons and ledgers), any entry kept in its bundle, another page, a new entry, or canon. The rich face is settled: no steward makes its own. Loudon: "stewards don't make their rich face, keep it definitive." For each change it wants there, it posts a `proposed_edits` item (page, place, words, why). The cycle files each one as a numbered item in the steward's own tuning ledger, growing one if needed, owed until Loudon's review, and the scroll's trail shows it as proposed for canon. The steward's later cycles read every owed proposal right after the home entry, under *Your page, as you have proposed it*, and work as if it holds. A steward that knows better proposes again with `replaces`, and the older item reads `superseded by item N`. One that would break the next job may be marked `urgent`, which also puts an ask on the board. A yes marks the item `paid in <commit> on <date time>`, a no `declined on <date time>: <reason>`, and the steward reads that once on its next run, so a no teaches it. The Shopkeeper has no wider reach than any other steward. The scroll's Plan and Standing Orders stay Loudon's. The cycle works this way since `83d6f4e8`; how Loudon reviews the ledgers is decided below (2026-10-21).
- **A steward leaves when its page ends; it never decides the end** (decided 2026-10-21; Loudon: "Yes to both recommendations. Run the leaving rite on Talking Keyboard."). A page has ended when it is finished (`status: complete` or `archived`) or composting. A folded page composts once its fold has crossed, by [[The Daily Page]]'s rule, so a fold arrives as composting. A page set down to rest (`stage: dormant`, its Plan opening "Paused") keeps its steward: that is a pause, and the [[Revival Ceremony]] is its way back. The rite settles six things. Each open ask Loudon answers on the deck with DENY and one line ("left stewardship: <why>"), and the rite won't close while any stays open; there is no new wire type. Owed proposals go through the ledger review first. The Plan gets a closing paragraph Loudon agrees, saying what became of each open move: carried to the page it folded into, let go, or kept for a revival; it is logged on the trail like any plan change. The scroll stays in the bundle and gets its last trail entry ("<date> — Left stewardship: <why>"); if the page later composts, the scroll goes with it, and git keeps both. The runtime, `_ops/agents/permanent/<slug>/`, is taken off `REGISTRY.json` and deleted. Git is its archive, as it is a caught baton's, and the commit that removed it is where a revival reads the history back. That runtime is the steward's baton, updated in place while the move went on ([[Baton Ceremony]] § Where the Baton Lives), so this is the moment its "never deleted" exception ends. A page that has ended takes no new steward while it stays ended: `enchant.js` refuses it, and the deck shows the refusal in plain words. `node _ops/stigmergy/leave-stewardship.mjs "<page>"` reads what stands in the way and writes nothing; `--apply --why "<the end>" [--plan "<closing paragraph>"]` acts on Loudon's word (`_ops/stigmergy/orchestrator/src/leave.js`). The first run was [[Talking Keyboard]], on 2026-10-21 (`3f75f9d1`): the project is finished, and its steward, registered on 2026-10-13, never cycled. The run tested the finished status, the registry line, the runtime folder and the enchant refusal; it had no asks, Plan, scroll or proposals to settle.
- **The ledger review goes page by page: Loudon decides, an elder places, the ledger is settled after** (decided 2026-10-21). One card per page: `node _ops/stigmergy/list-proposals.mjs --page "<title>"` shows the section as the page reads now, then the proposed words, and why. Loudon says yes, adjust or no to each item. An elder (the [[Concierge]], for a child session) places the yeses in one edit commit per page, read cold by someone who didn't write it before it lands. Each yes is then paid with that commit, in a second small commit (`node _ops/stigmergy/settle-proposal.mjs "<steward>" <n> --paid <commit>`); the commit must exist and change the page the item names. Each no is declined with his one line (`--declined "<line>"`). A proposal that would mint a page (a new Specialist, "a new page") goes through the full [[Deposit Ceremony]] instead. This is the [[Deposit Ceremony]]'s one exception: the Deposit calls a change to what a page says a deposit, but here Loudon's yes to the exact words, read beside the section as it stands, does the gate's work, and the Deposit's step 8 still answers the steward by settling its ledger item. It is not a Harvest by name: a close reading in spirit, a map shown before any write, without the Harvest's record. For an urgent proposal, his answer to its ask on the deck decides what the review does. LAND-NOW is his yes to exactly the words the ask quotes, so the review lands it first without asking again, and it is paid when it lands, not when he clicked. DECLINE, or a deny, declines the item with his note; the review reads that answer from the board (`settle-proposal.mjs --from-board`), so the deck's live code doesn't change. REVIEW leaves it owed with the rest. The three calls he asked for are built: the PROJECTS deck puts a page with owed proposals under "needs you" and says "N proposed" (`47a0d2b4`); the Return prints `list-proposals.mjs --line` (`_ops/concierge/return-map.mjs`, `4cb3ebd8`); and the Weave's report names the pages with owed proposals (`list-proposals.mjs`) and settles none.

### The posture, as the text summarized it

The canonical posture lives in [[Substrate Skill]] § Stage as Alignment Confidence. In summary:

| Stage | Steward's job | Board posture |
|---|---|---|
| seed | Surface underspecified parts; propose vector and plan refinements *around an artifact* | Make a sketch or probe and discuss around it — still ships a (rough) made thing. A genuine fork goes to TRICKSTER, `blocking: true`. |
| sprout | Plan-level detail; named tradeoffs; flag default-traps | Build a small working prototype each cycle; proposals ride alongside it, never instead of it. |
| growing | Execute within established direction; checkpoint at sensory steps | Build Session pace; ship freely. `blocking: true` only before committing to a full sensory batch. |
| mature / fruiting | Ship the next proof; post completions | Full execution; ship the next concrete proof without a fork-question; `WEAVE` board completions. |
| dormant | Don't touch. Only the [[Spore Check Ceremony]], [[The Daily Page]], or a revival probe Loudon ordered touches it; only the [[Revival Ceremony]] wakes it | — |
| composting | Don't touch — composting protocol applies | — |

## Where the decisions came from

The text keeps each decision and its reason. The stories behind a few of them live here.

- **Every cycle ends with a shipped thing.** First decided on 2026-05-27 the other way round, as "every cycle ends with a TRICKSTER ask": each cycle posted at least one `RESOURCE_REQUEST`. Reading about fifteen cycles showed the rule manufactured questions and suppressed building — stewards behaving like "scared interns," asking permission instead of making. The Steward Boldness redesign inverted it on 2026-06-07 (`733ea0d4`).
- **One activation is a run.** Loudon set 10 as the first cap on 2026-09-23 and lowered it to 3 on 2026-10-13 (`e7c428b6`) after watching a nine-steward queue: ten cycles unseen is a long way down a poor path, and the scroll only checks a run if he reads it between runs. The heartbeat's own cap of two cycles came the next day (`52c00c0c`), after one unlimited batch ran 35 Opus cycles over eleven stewards in three and a half hours and then sat six and a half hours on a usage limit, none of it visible on the deck.
- **A barren cycle is a failed cycle.** Read from the history in September, every cycle run in August and September looked barren, and nothing had said so. Many weren't: the harness had cut them off — usage limits, an expired login, a CLI too old for the model — and each was scored as a steward that shipped nothing (found 2026-09-25, fixed in `4d33744c`).
- **The scroll replaced `plan.md`.** The `plan.md` read-model (2026-06-09) held decision state only and regenerated only on a cycle — the exact reason Loudon's 2026-08-26 answer on [[Generative Sample Libraries]] sat invisible for a month. On 2026-09-23 36 scrolls were backfilled and 20 plan files retired (`c666210b`).
- **A steward commits what it ships.** On 2026-10-15 one ignored artifact left a whole GSL cycle uncommitted, so the cycle commit now leaves out a file `.gitignore` ignores and names it in the commit body (`fb354c93`).
- **A steward is grown up for its own page and bundle.** It replaces the grow-up-on-a-grant draft of 2026-10-13, archived at `Archive/grow-up-on-a-grant — draft.md`. Loudon, 2026-10-15: "I think we will soon make the stewards grow up"; then, 2026-10-16: "Lets just have stewards always be grown up, we don't need to wait for a grant," and "start with a steward grown up for its own page and bundle." Withdrawn 2026-10-18 (below).
- **The Shopkeeper reaches the whole Shop.** On 2026-10-18 its third cycle found [[Shop/FLUX (Hugging Face)]] five months stale and could only draft the dated note in its bundle and wait on an ask (`shopkeeper-ask-2026-10-18-flux3`). The same day Loudon widened its reach to all of `Shop/`, new entries included, and kept every other steward fenced. Withdrawn the same day (below).
- **No steward edits the house without Loudon's eyes.** For two days a steward was grown up for its own page and bundle (`10751829`), and from the morning of 2026-10-18 the Shopkeeper for all of `Shop/` (`c4d7fb8e`). That morning five cycles changed three project entries on their own word, each shown only on its trail: Shepard Tone Synthesizer (`212c2005`, `99b71ea4`), Neural Granular Synthesis (`91addc1c`, `5597ac71`) and Slime Mold Delay (`521f4962`). The Shopkeeper's cycles that day wrote only in its bundle. The same day Loudon withdrew both grants: "I don't like the editing of canon without my eyes, I made a mistake in approving this. I think this is a use of the ledger, what the steward wants to edit is place in a tuning ledger and used in the future, and eventually we go through the tuning ledgers to see what we actualy want to place in canon," and "I'd like the shopkeeper grant to follow a similar process, use the tuning ledger." Of the five edits: "You can leave this morning's edits, not a big deal." The ledger keeps what the 2026-10-16 rule was for. The archived grant draft began with the Quantum Synthesizer's "revive to sprout?", granted twice and landed by no one. Now a wanted change is not lost on the board: it is filed, read back and built on, and only its landing waits for his eyes (`83d6f4e8`).
- **The left-rough list on Now.** From GSL's record: in 15 of the 17 left-rough notes from cycles 20 to 38, the cycle said nobody had heard the result, each time in its own trail section, where no later cycle counted it.

## Answered questions

- *Should Stewards be allowed to modify project entries directly, or only propose changes via the BBS?* The first lean was read-only-with-proposals, loosening as confidence grew. Answered 2026-10-16: a steward is grown up for its own page and bundle; another page stays a proposal. Answered again 2026-10-18, the other way: every change a steward wants in the house, its own page included, waits in its tuning ledger for Loudon's review.
