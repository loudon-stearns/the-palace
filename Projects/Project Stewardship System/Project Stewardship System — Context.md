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


## Where the decisions came from

The text keeps each decision and its reason. The stories behind a few of them live here.

- **Every cycle ends with a shipped thing.** First decided on 2026-05-27 the other way round, as "every cycle ends with a TRICKSTER ask": each cycle posted at least one `RESOURCE_REQUEST`. Reading about fifteen cycles showed the rule manufactured questions and suppressed building — stewards behaving like "scared interns," asking permission instead of making. The Steward Boldness redesign inverted it on 2026-06-07 (`733ea0d4`).
- **One activation is a run.** Loudon set 10 as the first cap on 2026-09-23 and lowered it to 3 on 2026-10-13 (`e7c428b6`) after watching a nine-steward queue: ten cycles unseen is a long way down a poor path, and the scroll only checks a run if he reads it between runs. The heartbeat's own cap of two cycles came the next day (`52c00c0c`), after one unlimited batch ran 35 Opus cycles over eleven stewards in three and a half hours and then sat six and a half hours on a usage limit, none of it visible on the deck.
- **A barren cycle is a failed cycle.** Read from the history in September, every cycle run in August and September looked barren, and nothing had said so. Many weren't: the harness had cut them off — usage limits, an expired login, a CLI too old for the model — and each was scored as a steward that shipped nothing (found 2026-09-25, fixed in `4d33744c`).
- **The scroll replaced `plan.md`.** The `plan.md` read-model (2026-06-09) held decision state only and regenerated only on a cycle — the exact reason Loudon's 2026-08-26 answer on [[Generative Sample Libraries]] sat invisible for a month. On 2026-09-23 36 scrolls were backfilled and 20 plan files retired (`c666210b`).
- **A steward commits what it ships.** On 2026-10-15 one ignored artifact left a whole GSL cycle uncommitted, so the cycle commit now leaves out a file `.gitignore` ignores and names it in the commit body (`fb354c93`).
- **A steward is grown up for its own page and bundle.** It replaces the grow-up-on-a-grant draft of 2026-10-13, archived at `Archive/grow-up-on-a-grant — draft.md`. Loudon, 2026-10-15: "I think we will soon make the stewards grow up"; then, 2026-10-16: "Lets just have stewards always be grown up, we don't need to wait for a grant," and "start with a steward grown up for its own page and bundle."
- **The left-rough list on Now.** From GSL's record: in 15 of the 17 left-rough notes from cycles 20 to 38, the cycle said nobody had heard the result, each time in its own trail section, where no later cycle counted it.

## Answered questions

- *Should Stewards be allowed to modify project entries directly, or only propose changes via the BBS?* The first lean was read-only-with-proposals, loosening as confidence grew. Answered 2026-10-16: a steward is grown up for its own page and bundle; another page stays a proposal.
