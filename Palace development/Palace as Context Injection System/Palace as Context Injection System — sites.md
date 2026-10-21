---
title: "Palace as Context Injection System — sites"
born: 2026-10-20
links:
  - target: "[[Palace as Context Injection System]]"
    type: connects-to
    label: sites-ledger-for
forward_vector: "I am the map of every place the palace builds a mind, re-read from the code each time, so the page I belong to argues from what the dispatchers actually load and in what order, not from what the pages say they load. My end-state is a reading where every site wakes its agent in the order the page asks for, and the owners got there through their own ledgers."
ledger: sites
standards:
  for: "where the palace builds a mind: every site that assembles an agent's context, what it loads and in what order, read from the code"
  run: "one re-check: a dated reading of every site, re-read from the code that day"
  line: "a dated reading section, '## Reading · <date> · <who read it>', with one table row per site; every row cites file:line"
  read: "the newest reading whole; older readings only to see what moved"
  writes: "append-only: a re-check adds a new reading at the end and never edits an old one. A finding about a site goes to the owning page's tuning ledger, for that page and Loudon to decide; this page never edits another page's dispatcher"
  merge: union
  kept: git
  trim: never
---

# Palace as Context Injection System — sites

Every place the palace assembles an agent's context, what it loads, and in what order. Each reading is one re-check, read from the code on its date, and stands alone. Rows cite `file:line` as the code stood that day; a later reading re-reads rather than trusting an older row.

The page uses these readings as evidence. It does not act on them. When a reading shows a site loading out of the page's order, the finding is filed as an item in the tuning ledger of the page that owns the site (the steward machinery, the board launcher, the songline, the weave, the Daily Page), and that page and Loudon decide. Nothing here edits another page's dispatcher.

## Reading · 2026-10-20 · the Concierge

Read from the assembly code on 2026-10-20 by the Concierge, read-only, for the Daily Page sit on this page. Each row is file-cited. Inferences that were not tested are marked. Rows that name a file with no line range get one at the next re-check.

"Birth", as actually loaded: CLAUDE.md's body, then its imports (the Seed Jewel and the five World files), then MEMORY.md (operator memory) last. Subagents get their agent-file text before all of it.

| Site | Who | Loads, in order | Grows? | Fit of Birth / World / You / Growth |
|---|---|---|---|---|
| Enchant launcher `_ops/stigmergy/app/server/api/launch.js:175-240` → `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js:103-144` | a woken page, live | Birth → "You are awake" → page in full → vector → agency profile → neighbor titles only → Loudon's note | child | Fits exactly; the names were modelled on it |
| Daily Page `_ops/daily-page/wake.mjs:73`; scheduled SKILL | prep session; woken page subagent | (a) Birth → the card; (b) agent file → Birth → woken-page prompt → morning questions last | children | (b) fits; (a)'s "You" is a ceremony card. Live SKILL differs from tracked copy |
| Steward cycle `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js:173-403` | permanent steward | Birth → steward.md → all 707 lines of shared.md → posture → role → home entry → proposals → SCHEMA → ELDER → state → scroll → ledger → history → board → mandate | every cycle | Strains badly: ~970 lines of rules before the page; You split in two with Growth in the middle |
| Board launch / baton catch `_ops/stigmergy/app/src/lib/launch-prompt.js:42,110-136` | session stepping into a steward | Birth → re-read CLAUDE, JEWEL → ELDER, SCHEMA → manifest, state, board | grows first | Growth before You |
| Companion `_ops/stigmergy/app/server/companion-prompt.js:269-300` | page chatting on deck | Birth → birth restated → entry → neighbors with their vectors | child | Fits; richer neighbors than the woken page; comment still says "Tier-0" |
| Concierge `_ops/concierge/prompts/companion.md:55-63` | resident elder | agent file → Birth → message → charter → ELDER → SCHEMA → operational tier | grows at boot | "You" is a role charter, not a page; Concierge.md not in its boot set |
| Closing Well `_ops/closing-well/dispatch.md` | moderator; executor | moderator: Birth → role → prompt → Closing Well + arc; executor: Birth → ELDER → SCHEMA → protocol → checklist | executor grows first | Moderator fits; executor's Growth before You (defensible: a writer) |
| Swarm Weave templates `_ops/swarm/Multi-Lens Worker Prompt Template.md:64-91` | weave workers | Birth → an older Jewel pasted inline again → cluster → neighborhood → tasks citing SCHEMA | no Growth step | You is a cluster; the second Birth is stale |
| Songline `_ops/orchestrator/prompts/songline.md:1-17` | page, one step of a walk | Birth → role/position → shared.md rules → trail | — | Rules before You; the trail is a new kind: inherited voices |
| Weave generator `_ops/stigmergy/app/server/weave-generate.js` | one-shot vector/label writer | Birth (inferred) → vector discipline → one entry | — | You is a task; World first may help |
| Self-description test `_ops/self-description-test/birth.mjs` | memoryless newborn | CLAUDE + World, no MEMORY | child | Tests Birth+World only; only site without memory |
| Main session / scheduled checker | Loudon's session; one-command checker | Birth → the turn | grows on "grow up" | You is the conversation; for the checker World is only cost |
| Shop specialists `Shop/Maker.md:55-72` | — | no dispatcher code found | — | nothing to name |

**Findings**

1. Two bands sit outside the four names and reach every in-repo agent: agent-file rules before Birth, and MEMORY.md (operator rules, ~10.8K chars) after the World and before any You.
2. "You" is a page only for the woken page, the Companion and the Daily Page subagent. Elsewhere it is a project bundle, a role charter, a cluster, a trail, or a task.
3. Three sites break the time order: steward cycle, board/baton launch, songline — rules ahead of the page. Fixing stewards is code (`build-cycle-prompt.js`), not a rename.
4. The World is leaned on most where Loudon is in the room (woken page, Daily Page, Companion, main session); executors, checker and weave workers barely use it.
5. Where World-before-You may be wrong (untested): person-pages in an Excellent Adventure or Dialectic (Palace Philosophies frames the figure first); pages that contradict the World's frame (The Drift, Hardens Around Values) wake after the frame they argue with.
6. The launcher already needs "Active surface" as a separate label for stewards (`launch.js:65`), so one word doesn't cover both.

**Not read:** Return, Revival, Dialectic, Enrichment and Lens dispatch; `regen-lane.js` and `actuator.js` prompts; oracle/scout postures; Weave fan-out; claude.ai and Cowork loading; the weave generator's runtime cwd.

**Where the findings go:** none filed yet. Posting each to its owner's tuning ledger is part of the work this page's baton commissions.

*Seeded on 2026-10-20 from the Daily Page rough `injection-sites.md`. Its paths were written short (`orchestrator/src/…`, `app/src/…`) and are given here from the palace root; each path was checked to exist on that day, but the cited line ranges were not re-read when the ledger was seeded.*

## Reading · 2026-10-21 · two Sonnet readers, checked by the session

Read from the assembly code at 635b9103 on 2026-10-21 by two Sonnet readers, read-only. The session re-checked the sharpest claims by hand and measured the floor with Claude Code's own `/context` count, for $0; the Concierge spot-checked the cited lines again when it placed this reading. The evidence is in this page's bundle: `proofs/2026-10-21-floor-review/sites-reading — steward and board.md`, `sites-reading — everything else.md` and `floor-measured.md`. Token figures are approximate: characters ÷ 3.8 in the readings, and `/context` for the floor.

**Birth, as loaded at 635b9103.** A subagent reads its agent file's one line first (`.claude/agents/palace-reader.md:8`) and the harness's notes. Then every agent reads CLAUDE.md's body (3.0k), the Seed Jewel (0.75k), the five World files (6.1k) and MEMORY.md (4.5k) last: 14.4k in all, frontmatter stripped, inside a reminder that says to follow it "exactly as written" (`floor-measured.md:11-25`). A session keeps the floor of its birth, and every subagent it spawns inherits that copy, not the disk (`floor-measured.md:47`). **Since then, on this page's branch and not landed:** CLAUDE.md's working sections moved, word for word, into CHILD.md, imported after the World (5de78ac2), and the Jewel took one sentence (v1.3, ebf1cff1). The probe then read CLAUDE.md 617 → JEWEL 745 → the World → CHILD.md 2.5k → MEMORY.md 1.8k. The rows below are read against 635b9103.

| Site | Who | Loads, in order | Grows? | Fit |
|---|---|---|---|---|
| Steward cycle `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js:113-403` (template `_ops/orchestrator/prompts/steward.md:1-268`, `shared.md` at `:35`), spawned by `_ops/stigmergy/app/server/steward-lane.js:70-78,502-512` | permanent steward, headless; 26 registered | Birth → its name and stage (0.4k) → `shared.md` (9.9k) → posture (3.3k) → home entry → proposals → SCHEMA (3.9k) → ELDER (3.2k) (`:194-205`) → state → scroll → ledger tail → history → board slice → mandate → output protocol. 27–65k tokens, median 35k, re-paid every cycle | every cycle | Strains: 13.1k of rules before the page, which arrives about 28k in; Growth sits between the page and its situation. `steward.md:16-22` promises the vector "before you read anything as a rule" |
| Interactive steward `_ops/stigmergy/app/server/api/launch.js:70-147` → `buildCyclePrompt({ mode: 'interactive' })` (`:113-120`) | a session stepping into a steward, Loudon watching | the steward cycle, with a live closing (1,190 chars) in place of the output protocol | grows | Strains as above, and contradicts itself: "You do NOT write to the board yourself" (`_ops/orchestrator/prompts/shared.md:299-301`) against "Post to the board as the page yourself" (`build-cycle-prompt.js:346`); no one in the room (`:203`) against "he is watching" (`:343`) |
| Baton catch `_ops/stigmergy/app/src/lib/launch-prompt.js:44-108`, launched by `_ops/stigmergy/app/server/launch.js:98-108` | a fresh Terminal session catching a baton | Birth → the catcher's role → "orient yourself" (`:42`): re-read CLAUDE and JEWEL, then grow, ELDER and SCHEMA, about 6.8k by tool calls → the baton → the pickup steps | grows first | Growth before You, against the floor's child rule. `:105` says the card "has been marked picked up" before the separate button does it (`_ops/stigmergy/app/src/components/queue/LaunchModal.jsx:165,169`). The first reading's row was the steward fallback (`:110-136`) |
| Enchant, a woken page `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js:103-148`, route `_ops/stigmergy/app/server/api/launch.js:175-250` | a page woken live | Birth → "# You are awake" (0.36k) → the page in full → vector → agency profile → neighbor titles → Loudon's note → "# Begin" | child | Fits: no rules before You. Line ranges have drifted from the first reading's |
| Lens `_ops/stigmergy/orchestrator/src/lens-mandate.js:62-83`, in the slot at `ephemeral-prompt.js:110-112`, chosen at `api/launch.js:194-212` | a glass page reading a subject page | the woken page, then the lens procedure and the subject page in full under "# Loudon's note for this session", then "# Begin" (`:146`) | child | You first, but the procedure reads as Loudon's words, and "# Begin" still points the glass at its own vector. `_ops/daily-page/wake.mjs:21-25` works around the same slot |
| Companion `_ops/stigmergy/app/server/companion-prompt.js:200-422` (template from `:269`), spawned by `_ops/stigmergy/app/server/companion-lane.js:49` | an entry chatting on the deck, one `claude -p` per turn | Birth → "You ARE the palace entry", the floor restated (`:274-277`) and the palace's vector, hard-coded (`_ops/stigmergy/app/src/lib/entry-grounding.js:27-28`) → the page → neighbors with their vectors → state → conversation → his message → task rules (1.9k, `:317-422`) | child | The best order among the live sites. The hard-coded vector can drift from the Jewel |
| Weave generators `_ops/stigmergy/app/server/weave-generate.js:53-71` (vector), `:226-250` (label), run at `:42-48` | a one-shot vector or label writer | Birth if the caller's cwd is in the repo (none is set) → a one-shot task | no | You is a task |
| Agent profiles `.claude/agents/palace-reader.md:8` (the same line in `palace-writer.md` and `palace-orchestrator.md`, generated by `_ops/agent-toolbox/generate.mjs`) | every palace-* subagent | the profile line (0.12k) → the harness's notes → Birth → the task | — | The first palace words a subagent reads; consistent with the floor |
| Skills `.claude/skills/concierge/SKILL.md:19-23,32-33`, `.claude/skills/palace-orchestrator/SKILL.md:32`, and the claude.ai-synced `the-substrate` and `loudons-four-pillars` (outside the palace) | every session sees about 0.8k of their descriptions | descriptions always; a body on invocation | palace-orchestrator grows before its organ | `the-substrate` sends a session to the main checkout by absolute path; `loudons-four-pillars` points at a folder that no longer exists; the concierge skill's always-on description doesn't carry the summon |
| Hooks: none in `.claude/settings.local.json` or `~/.claude/settings.json`; the palace's only hook is the births' own (`_ops/self-description-test/birth.mjs:109-110`) | — | nothing injected | — | No hook injects text |
| Concierge `_ops/concierge/prompts/companion.md:55-63`, postures `_ops/concierge/prompts/*.md` | the resident elder, palace-writer | profile → Birth → "You are the Concierge" (a pointer message) → charter (2.6k) → ELDER, SCHEMA, SUBSTRATE, ROSETTA, Substrate Skill, Palace Ceremonies, STIGMERGY (about 33k) | grows at boot | Role, then rules: the order the page asks for. `Concierge.md` is not in its boot set. Stale pointer at `companion.md:32` |
| Daily Page `_ops/daily-page/wake.mjs:35,92-114`, task `_ops/daily-page/scheduled-task/SKILL.md:10,14` | (a) the prep session; (b) the woken page, palace-reader | (a) Birth → the task → `_ops/The Daily Page.md` whole (6.7k) → the Concierge → ledger tail and diary → the deal → the page. (b) profile → Birth → the woken-page prompt → the morning's questions last (`wake.mjs:21-25`) | children | (b) fits best. The live task now matches its tracked copy (e4d611c6), so the first reading's "live SKILL differs" is resolved. `SKILL.md:10` lists the floor by hand |
| Closing Well `_ops/closing-well/dispatch.md:29,96-109,175-184,216-228` | moderator (palace-reader or general-purpose); executor (palace-writer) | moderator: Birth → role → `closing-well-agent.md` → `Closing Well.md` and the DESIGN draft → ledger tail → the arc. Executor: Birth → ELDER, SCHEMA → executor prompts → the signed checklist | executor grows first | The moderator fits; the executor's Growth before You is defensible for a writer. `dispatch.md:29` names one agent type, and several ran |
| Swarm Weave templates `_ops/swarm/Multi-Lens Worker Prompt Template.md:62-92` (inline Jewel `:64-65`), `_ops/swarm/Single-Doc Worker Prompt Template.md:30-32` | weave workers | role → an older inline Jewel → cluster → tasks → output schema | no | The 2026-09-24 weave didn't paste the inline Jewel (`_ops/swarm/sessions/weave-2026-09-24/RESUME.md:28`). `Projects/Swarm Weave.md:188` still names Explore workers, for whom it would be the only Jewel |
| Songline `_ops/orchestrator/prompts/songline.md:1-17` (`shared.md` at `:17`), dispatched per `_ops/orchestrator/runAgentCycle.md:7,33-34` | a page for one step of a walk, general-purpose | Birth (when the subagent loads it) → its name → `shared.md` (9.9k, written for stewards) → posture → the page last | — | About 15.9k of rules before the page's own text |
| Explore and Plan subagents (harness behaviour, counted in transcripts: `proofs/2026-10-21-floor-review/sites-reading — everything else.md:12`) | Explore workers; Plan | no floor at all: 0 of 107 Explore transcripts, June to October; 0 of 1 Plan | — | Born with nothing the palace writes |
| Self-description test `_ops/self-description-test/birth.mjs:24-41,109-110,138-150` | a memory-free newborn | CLAUDE, the Jewel and the World; no MEMORY, no MCP servers; a hook that refuses spawns and writes | child | The only site without memory. At 635b9103 it certified seven floor files; on this branch CHILD.md is the eighth (c280154d) |
| Main session (the harness) | Loudon's session | Birth → his turn | grows on "grow up" | You is the conversation |
| Return `_ops/Return Ceremony.md:63-65,81,85` | the Concierge in its scout posture (`_ops/concierge/prompts/scout.md:17-26`) | the warm resident → the scout posture → `return-map.mjs`'s output | the resident is grown | You is a role |
| Revival `_ops/Revival Ceremony.md:82` | the dormant page | the Daily Page's wake, unchanged (row above, b) | child | Fits |
| Dialectic: no template; method `Modes of Collaboration/Dialectic.md:46-58`; one hand-written dispatch read (`proofs/2026-10-21-floor-review/sites-reading — everything else.md:122`) | voices woken as themselves | You → world (its own page, `JEWEL.md` re-read, the other voice) → the room → the task → rules last | child | The page's own order; it re-reads a Jewel it already holds |
| Enrichment `Enrichment.md:74-83`, the Maker `Shop/Maker.md:55-72` | the session; the Shop, named in prose | no dispatcher code | — | Nothing to name |
| Local Gemma prompt `_ops/swarm/build-preloaded-prompt.py:30` | gemma4:26b | no Jewel, no CLAUDE; the main checkout's path hard-coded | — | Outside the floor entirely |

**Findings**

1. At 635b9103 the floor was 14.4k tokens. The Jewel, the one file that says who is in the room, was 5% of it; MEMORY.md was 31%, arriving last under a heading that says "read first, fires before all else"; and 2.3k of CLAUDE.md's procedure came before the Jewel (`floor-measured.md:13-40`). Move 1 on this branch answers the order; whether order changes a child is what the births are testing.
2. Bands outside the four names still reach every in-repo agent: the agent file before Birth, MEMORY.md after the World. Explore and Plan subagents get no floor at all.
3. The floor is a snapshot. A session and every child it spawns keep the floor of the session's birth; a landing reaches sessions born after it, and a steward on its next cycle.
4. Three sites put rules before the page: the steward cycle, the songline and the baton catch. One skill, palace-orchestrator, grows before it reads its organ.
5. No dispatched prompt says whether the floor's first act, the summon, applies to it, and most have no Agent tool. What they do is untested.
6. Copies drift: the swarm templates' Jewel, the Companion's hard-coded vector, the Daily Page task's list of floor files, and the public welcome ([[Jewel — Context]], the note of 2026-10-21).
7. Resolved since the first reading: the Daily Page's live task matches its tracked copy; "Tier" language survives only in the launcher's UI data (`_ops/stigmergy/app/server/api/launch.js:42-68,149-168`) and a code comment (`_ops/stigmergy/app/server/companion-prompt.js:9`), never in text a model reads; the deck's real steward launch is the full cycle prompt (the interactive steward row), not the fallback the first reading named.

**Not read:** where a main session's own system prompt sits relative to the floor (only subagent requests were measured); claude.ai loading; `_ops/quotes/mandate.mjs`; hooks inside the built-in plugins; the app server's environment; whether the heartbeat's launchd job is installed; the live Daily Page task's model, permission mode and Worktree tick; the sizes of the deal's brief, `return-map.mjs`'s output and a songline's user turn; why 63 of 130 general-purpose transcripts carry no floor attachment; whether the Concierge reads all of `SCHEMA — Reference.md` or only §9.

**Where the findings went.** The twelve drafts are in `proofs/2026-10-21-floor-review/site-findings — drafts for owners.md`. Each went to its owner as a finding and a question; no dispatcher was edited.

- Filed in the owner's tuning ledger:
  - the baton catch → `_ops/Baton Ceremony/Baton Ceremony — tuning.md:92`, item 14;
  - the swarm templates and Explore → `_ops/Weave Ceremony/Weave Ceremony — tuning.md:123`, item 44; with it, the Weave's own two lines that credit CLAUDE.md with the Jewel's "invitation" → `:124`, item 45;
  - the Daily Page task's list, with the words it would need if move 1 lands → `_ops/The Daily Page/The Daily Page — tuning.md:158`, item 53;
  - the claude.ai skills → `Palace development/Self-Describing Knowledge Module/Self-Describing Knowledge Module — tuning.md:54`, item 13;
  - Closing Well's dispatch doc → `Closing Well/Closing Well — tuning.md:284`, item 59.
- Held here, because the owner keeps no tuning ledger yet. Each waits for Loudon to name a home, or for that page's own ledger, which [[Palace Ceremonies — sketch — propagation plan]] proposes one page at a time on his yes:
  - **The steward machinery** ([[Project Stewardship System]], [[Palace Orchestrator]]). The steward cycle reads 13.1k of rules before its page, and SCHEMA and ELDER every cycle between the page and its state; every cycle also loads MEMORY.md, which the docs say `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` would drop (the reading's claim, not tested). *Question:* the page and where it stands first, and SCHEMA and ELDER at the moment a write is drafted? And the interactive steward's two contradictions (its row above). *Question:* which holds when Loudon launches a steward live?
  - **[[Palace Orchestrator]]**, the songline: about 15.9k of steward rules before its page. *Question:* does a one-step songline page need the steward's discipline at all?
  - **[[The Lens]]**: its procedure sits under "# Loudon's note for this session". *Question:* a slot of its own for a dispatcher's task, so nothing speaks as Loudon that he didn't write?
  - **[[Concierge]]**, with the rule's home in [[CHILD]]: no dispatched prompt says whether the summon applies (finding 5). *Question:* say in CHILD that the summon is the session's, and let a dispatched agent's task say what applies to it? Also three small stale pointers: `_ops/concierge/prompts/companion.md:32` credits CLAUDE.md with the Jewel's "invitation" line (`JEWEL.md:47`); `.claude/skills/concierge/SKILL.md:32-33` says agent teams are on in Loudon's terminal sessions, where `~/.claude/settings.json` sets the flag to "0"; and the skill's always-on description doesn't carry the summon at the open.
  - **[[STIGMERGY]]**: the Companion's hard-coded palace vector (`_ops/stigmergy/app/src/lib/entry-grounding.js:28`) will drift from the Jewel, and the launcher's `construction` data labels Tier 0–3 with ELDER and SCHEMA "on demand", which is wrong for stewards (`_ops/stigmergy/app/server/api/launch.js:42-68`; UI only, no model reads it). Folded in from the Concierge: the deck's write guard protects FOUR PILLARS but not the other four World files (`_ops/stigmergy/app/src/lib/entry-edit.js:105-119`), and two deck comments credit CLAUDE.md with Substrate Skill's recursive-search rule (`_ops/stigmergy/app/src/lib/wikilink.js:7`, `entries.js:3`; the rule is `_ops/Substrate Skill.md:218`).
