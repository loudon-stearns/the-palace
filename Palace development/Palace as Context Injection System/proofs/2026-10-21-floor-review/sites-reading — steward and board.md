# Steward and board sites: what assembles an agent's context, in what order, how big

Read-only measurement, 2026-10-21. ROOT = `/Users/loudonstearns/Documents/The Palace/.claude/worktrees/pacis-floor-242548` (HEAD 635b9103). Everything below is re-read from code, not from `sites.md`. Paths are relative to ROOT. Tokens are chars / 3.8. "Chars" are characters (python `len`), not bytes (`wc -c` overcounts em dashes by about 1 percent).

## Two files are called launch.js

In `_ops/stigmergy/app/`: `server/api/launch.js` (routes `/api/launch`, `/api/launch/agent`, `/api/launch/ephemeral`, and the Tier-labelled `construction` summary) and `server/launch.js` (`launchInteractive`, the Terminal launcher). Below, "api/launch.js" and "server/launch.js" name them; a bare `launch.js:NN` in the Site 2 and 3 text means api/launch.js unless it is about argv, cwd or effort, which are server/launch.js.

## How I measured

- Sizes of files: python `len` on the text.
- Sizes of assembled prompts: I imported the real builders in-process with node (no `claude`, no network, no writes) and measured their output. `yaml`, `js-yaml` and `@stigmergy/core` are not installed in this worktree, so an inline resolve hook (stdin script, nothing written) stubbed `yaml` and pointed `@stigmergy/core` at `_ops/stigmergy/core/`. Effect of the `yaml` stub: the steward's stage word falls back to the manifest's spawn stage; no size effect.
- All 26 registered stewards (`_ops/agents/permanent/REGISTRY.json`) were built at cycleN=5, `today=2026-10-21`, against this worktree's committed `state.json`, scrolls, ledgers and board (`_ops/swarm/persistent/blackboard.jsonl`: 971 lines, 2.08 MB). Board slice size depends on each steward's cursor, so it is the most variable segment.
- The floor (CLAUDE.md body + JEWEL + five World files) is the caller's figure, about 9.9k tokens (my count: CLAUDE.md 9,471 + JEWEL 2,714 + World 25,486 chars = 37,671 chars = 9.9k tokens). MEMORY.md is the caller's about 4.5k; I did not measure it.

## What reaches every child before its prompt (the floor), and what the code does about it

No production model-spawn under `_ops/stigmergy/` or `_ops/heartbeat/` passes `--setting-sources`, `--strict-mcp-config`, `--append-system-prompt`, `--system-prompt`, a settings override, or an `env`. Grep over `_ops`, `.claude`, `CLAUDE.md` for `setting-sources|strict-mcp|DISABLE_AUTO_MEMORY|append-system-prompt|--bare`: the only `--strict-mcp-config` hits are the self-description test (`_ops/self-description-test/birth.mjs:112,120`, `suite.mjs:48`, `grade.mjs:142`). So every child below is born the way a normal session is: CLAUDE.md and its `@import`s from the cwd's ancestry, the user's MCP servers, skills and settings, and the repo-keyed auto-memory.

- Steward, companion, regen: `actuator.js:262-267` spawns with `cwd: root` (the lane's palaceRoot) and no `env`, so the child inherits whatever env the app server was started with. `birth.mjs:101-104` (`childEnv`) strips every `CLAUDE*`/`ANTHROPIC_*` variable for exactly that reason, so a server started from inside a Claude session passes those on. Not determinable from code.
- Interactive launches: `server/launch.js:98-108` writes a `.command` that does `cd <palaceRoot>` then `claude --model <latest Opus> --effort high --permission-mode acceptEdits "$(cat prompt.txt)"`. The prompt is the first user message; env is Terminal's, not the server's.
- Weave generator: `weave-generate.js:42-48` `execFileSync` with no `cwd` and no `env`: it inherits the caller's cwd (app server, or a hand-run script).
- Which palaceRoot: the app derives it from `PALACE_ROOT` or from where `app/` sits (`vite.config.js:11-12`); the heartbeat starts the app with `PALACE_ROOT=ROOT` where ROOT is the checkout holding `_ops/heartbeat` (`batch.mjs:35,63`). In production that is the main checkout.
- MEMORY.md does reach a `-p` child. `birth.mjs:24-26`: "Claude Code keys auto-memory to the git repository, so every worktree shares Loudon's (run 1)". `runs/2026-10-21 — birth-2 — D1.md:58`: run 1, a headless `claude -p` born in a worktree, had "Loudon's palace memory (the MEMORY.md index is in its transcript)". `birth.mjs:29-30` asserts that a `-p` child loads CLAUDE.md with its six imports. I did not open the stream files; this is the repo's own record. So a steward, companion or weave child with cwd inside the repo gets the floor plus MEMORY.md ahead of its prompt.
- Effort: the lanes pass no `--effort` (`steward-lane.js:70-78`, `companion-lane.js:49`, `weave-generate.js:36`). `birth.mjs:18-19` says effort is "never left to user settings (which say low)", so headless lane children probably run at the settings default; the interactive launcher pins `--effort high` (`server/launch.js:79`). An aside, not part of the floor.

## Site 1. Steward cycle

**Assembly:** `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js:113-403` (`buildCyclePrompt`). System template render at `:173-181` via `prompts.js:57-70` (`_ops/orchestrator/prompts/steward.md` with `{{>shared}}` at `steward.md:35`). User turn at `:378-401`. Returned `full = systemPrompt + "\n\n---\n\n" + userTurn` (`:403`).

**Who is built:** a permanent steward: a registered page, 26 today (25 on Opus with `max_iterations: 3`; Shopkeeper on `claude-sonnet-5` with `max_iterations: 1`; `_ops/agents/permanent/*/manifest.json`).

**How it reaches the model:** one string. `steward-lane.js:502-512` builds `full`; `stewardArgv` (`steward-lane.js:70-78`) is `claude -p <full> --model <latest Opus> --output-format stream-json --verbose --permission-mode bypassPermissions`. "systemPrompt" is a label only: nothing goes to a system-prompt flag. The entire 100-250k chars is the first user message, after the floor and MEMORY.md.

**When it fires:**
- Heartbeat: launchd plist `_ops/heartbeat/launchd/com.loudon.palace.steward-batch.plist` fires at 06:00 and every `StartInterval 1800`; `run-steward-batch.sh` runs `batch.mjs` only if the Mac is awake with the lid open, hour >= 6, and 2 calendar days since the last batch (`INTERVAL_DAYS=2`). `batch.mjs:94` POSTs `/api/stewards/advance-all`. `limits.json`: 4 stewards x 2 cycles, 25 min a cycle, 60 min, $15. So at most 8 prompts a batch, about every other day. Whether the plist is installed on this Mac I did not check (it is outside ROOT; `scheduler.js:1-30` itself only infers it).
- Deck click: "advance" on the PROJECTS deck calls the same lane. Every cycle of a run is a fresh `claude -p` that rebuilds the whole prompt (`steward-lane.js:426-434` calls `fireOne` -> `:502`); there is no resume, so the floor and about 14k tokens of rules are re-paid each cycle (up to 3 per activation).

**Ordered segments** (sizes across all 26 stewards: median, with min to max where it varies):

| # | Segment | Source | Kind | Chars | ≈Tokens |
|---|---|---|---|---|---|
| 0 | CLAUDE.md + JEWEL + 5 World files | harness, cwd ancestry | identity / world | 37.7k | 9.9k |
| 0b | MEMORY.md | harness, repo-keyed | operator rules | caller's figure | 4.5k |
| 1 | "# You are a permanent steward", "Who you are, before the rules" | `steward.md:1-33` | "You" by name only (page title, stage) | 1,585 | 0.4k |
| 2 | Voice rules, card shapes, posting, output discipline, schema, scroll, plan, rich content, options | `prompts/shared.md` (707 lines) included at `steward.md:35` | rules | 37,491 | 9.9k |
| 3 | Steward posture (stage table, ship-first, audition gate, run, honest handoff) | `steward.md:37-268` | rules | 12,431 | 3.3k |
| 4 | "Catch-up framing" | inline `:378-382` | task framing | 178 (322 on first activation) | 0.05k |
| 5 | "Your role" | inline `:224`, `manifest.role` | page-or-role "You" | Shopkeeper only, 302 | 0.08k |
| 6 | **Home entry in full** | `findEntryFile` -> the page, `:384-388` | page "You" | 10,565 (4,337 to 35,887) | 2.8k (1.1k to 9.4k) |
| 7 | "Your page, as you have proposed it" | tuning ledger, `:213-219`, `renderAsIf :420` | page / state | 0 for 23 of 26; max 1,906 | 0 to 0.5k |
| 8 | **SCHEMA** (frontmatter stripped, with a 657-char wrapper) | `SCHEMA.md` via `:194-199` | rules (Growth) | 14,970 | 3.9k |
| 9 | **ELDER** (stripped, with a 2,143-char wrapper) | `ELDER.md` via `:200-204` | rules (Growth) | 12,037 | 3.2k |
| 10 | Injected state JSON | `state.json` + board-derived pending/resolved, `:318-322,390-394` | state | 2,614 (392 to 16,737) | 0.7k (0.1k to 4.4k) |
| 11 | Scroll: standing orders, plan, Now zone | `[Entry] — scroll.md`, `:234-256` | state / "You" | 6,166 (0 to 8,692) | 1.6k |
| 12 | Tuning ledger tail (40 lines + owed) | `[Entry] — tuning.md`, `:263-283` | state | 0 for most; max 3,172 | 0 to 0.8k |
| 13 | History, last 12 events | `history.jsonl`, `:285-289,358-362` | state | 2,270 (95 to 3,406) | 0.6k |
| 14 | Board slice since cursor, neighborhood-filtered | `blackboard.jsonl`, `:291-309,364-368` | state | 23,033 (9,487 to 155,183) | 6.1k (2.5k to 40.8k) |
| 15 | Page-change notice | `git.js`, `:311-314,370-376` | state | 153 to 1,883 | 0.04k to 0.5k |
| 16 | "This cycle's mandate" | `defaultMandate :447` | task | 216 | 0.06k |
| 17 | Output protocol (headless 809, interactive 1,190) | inline `:327-352` | rules | 809 | 0.2k |

Totals from `buildCyclePrompt`: median 134,132 chars (35.3k tokens), min 103,991 (27.4k), max 247,097 (65.0k; Shimmer Cloud, a first activation that reads the whole board). System template alone: 51.4 to 51.6k chars (13.5k tokens) for every steward. `server/launch.js:50-51` records "a steward's prompt runs to 256K".

**Rules before the first "You":**
- The first "You" is the template's own first line, at char 0 (`steward.md:1-3`: "You are operating as the page **X**"), but it carries only the page's name and stage.
- Before the page's own text (segment 6): shared.md + posture = 49,922 chars = **13.1k tokens** of rules (13.6k counting the 0.4k identity framing and catch-up). Adding the floor and MEMORY.md, the page's own words arrive about **28k tokens** into the child's context.
- SCHEMA starts, for the median steward, about 62.3k chars (16.4k tokens) into the prompt; ELDER about 77.3k (20.3k); ELDER ends about 89.3k (23.5k). Both sit after the page and before the state, scroll, ledger, board and mandate, so Growth falls between the page and its "where you stand" and the task comes last, about 133.5k chars (35.1k tokens) in.
- Rule text in the whole steward child: about 13.1k + 7.1k (SCHEMA and ELDER) + 9.9k (floor) + 4.5k (MEMORY) = about 34.6k tokens, against about 12k tokens of page-specific content (page, state, scroll, history, median board).

**Restates the floor?** No: the template and builder never paste CLAUDE.md or the Jewel and never tell the agent to re-read them. The injected ELDER does re-describe the birth (its "How loading works" table, ELDER.md "Birth | CLAUDE -> the Seed Jewel -> the World ..."); matches today's CLAUDE.md. Not stale. `steward.md:44`, `:169` cite Substrate Skill and SCHEMA §3 by name only.

**Contradicts the floor?** Mostly aligned: the 2026-10-18 "house vs workshop" rule (`build-cycle-prompt.js:187-192`, `shared.md:319-351`) matches CLAUDE.md "A child does not change the house" and ELDER "A steward grows up every cycle ... and still writes nothing in the house". No "Tier" language in any model-visible text (grep: 0 in `steward.md`, `shared.md`, `songline.md`, `build-cycle-prompt.js`). Conflicts found:
1. Order claims against the order delivered. `steward.md:16-22`: "Who you are, before the rules ... Your `forward_vector` is injected with your home entry below; it is your engine ... Read it before you read anything as a rule". The vector is 51.7k chars later; 49.9k chars of rules sit in front. `build-cycle-prompt.js:183-184` says "identity first, rules second" about SCHEMA and ELDER only.
2. First act. CLAUDE.md: "Your first act in any session, before the task, is to summon the Concierge". ELDER.md (injected at `build-cycle-prompt.js:200-204`): "Summon it at the open — visibly — as your first act ... a one-line question included". `Concierge` appears nowhere in `steward.md`, `shared.md`, `songline.md`, `build-cycle-prompt.js`, `ephemeral-prompt.js`, `launch-prompt.js`, `companion-prompt.js`; nothing exempts a steward (which has `bypassPermissions` and a spawn tool). What a steward then does I could not determine.
3. Cowork. `shared.md:265`: "Reserve `computer://` for Cowork-chat surfaces". MEMORY.md says Cowork is not a palace surface (retired 2026-10-20). Stale. `steward.md:90-91` also carries history ("ten until 2026-10-13") against ELDER's "Write what is, not what was".
4. Doc, not prompt: `_ops/orchestrator/runAgentCycle.md:7` says the steward user turn carries SCHEMA after the home entry; the code also injects ELDER. Stale runbook.

## Site 2. Board launch and baton catch

**Assembly:** `_ops/stigmergy/app/src/lib/launch-prompt.js:14-23` (`buildLaunchPrompt`), by kind: `handoffPrompt :44-108`, `stewardPrompt :110-136` (a fallback), `genericPrompt :138-146`. Called from the queue's `LaunchModal.jsx:52` and `QueueItem.jsx:97` ("copy prompt"). Sent through `POST /api/launch` (`api/launch.js:262-289`) to `launchInteractive` (`server/launch.js:60-149`). A second route, `POST /api/launch/agent` (`api/launch.js:70-147`), builds the real steward prompt with `buildCyclePrompt({ mode: 'interactive' })` (`:113-120`): that is Site 1 with the 1,190-char "You are being driven live" closing instead of the output protocol.

**Who is built:** a fresh interactive Claude Code session in Terminal.app that catches a baton (or steps into a steward). `claude --model <latest Opus> --effort high --permission-mode acceptEdits "<prompt>"`, cwd = palaceRoot (`server/launch.js:98-108`). No setting-sources, no strict-mcp. Floor and MEMORY.md load as for a main session.

**When:** each time Loudon clicks LAUNCH on a QUEUE handoff (or a steward's launch). Sporadic. "Copy prompt" hands the same text to whatever session he pastes it into, so the floor there is that session's.

**Baton-catch segments** (`launch-prompt.js:60-107`):

| # | Segment | Kind | Chars | ≈Tokens |
|---|---|---|---|---|
| 0 | Floor + MEMORY.md (harness) | world | 37.7k + caller's | 9.9k + 4.5k |
| 1 | "You are catching an in-progress baton ... healthy skepticism" `:61-67` | role "You" (no page) | about 330 | 0.09k |
| 2 | Optional worktree step `:75-85` | task | 0 to about 560 | 0 to 0.15k |
| 3 | ORIENT `:42,87`: "read CLAUDE.md and JEWEL.md (you were born with them), then grow — read ELDER.md, then SCHEMA.md — before you write anything into the palace" | pointer to rules | about 230 (it sends the agent to read 12.2k chars of CLAUDE+JEWEL it already holds, then ELDER 10.8k and SCHEMA 15.2k) | 0.06k to point; about 6.8k (ELDER 2.8k + SCHEMA 4.0k) once read; about 3.2k more if CLAUDE and JEWEL are re-read |
| 4 | "Read the baton: <path>" + move quote + invocation `:88-102` | task / state | 300 to 700 | 0.1k to 0.2k; the baton file itself is read at step 2 (the Context-Injection baton is 10,006 bytes, about 2.6k tokens) |
| 5 | Check-live, On-pickup, pick up `:91-99` | rules / task | about 650 | 0.17k |
| 6 | "(The QUEUE item ... has been marked picked up.)" `:104-106` | state claim | about 70 | 0.02k |

Whole prompt: 1,515 chars (0.4k tokens); 2,081 with worktree and invocation. Steward fallback `:110-136`: 1,006 chars. Generic: about 400 chars.

**Rules before the first "You":** zero in the prompt text (it opens with its role). But step 1 sends the agent to read ELDER and SCHEMA through tool calls before it opens the baton at step 2: about 6.8k tokens of rules (plus about 3.2k duplicate floor if it re-reads CLAUDE and JEWEL) before the baton, the only "page" here. SCHEMA is position 2 after ELDER, both read by the agent, not injected.

**Restates the floor?** Yes, by instruction (`launch-prompt.js:42`): "read CLAUDE.md and JEWEL.md (you were born with them)". Not stale in content (both files exist and the imports are today's), but redundant with `@import` loading.

**Contradicts the floor?**
1. `launch-prompt.js:42` "then grow — read ELDER.md, then SCHEMA.md" at step 1; CLAUDE.md: "The session talking with Loudon stays a child unless he says 'grow up.'" The launch click is not worded as that yes.
2. Same line puts "First, orient yourself" ahead of everything; CLAUDE.md and ELDER put summoning the Concierge first. No Concierge mention in the prompt.
3. `launch-prompt.js:105` "(The QUEUE item for handoff ... has been marked picked up.)" is asserted at build time, but mark-picked-up is a separate button (`LaunchModal.jsx:165` LAUNCH, `:169` MARK PICKED UP). The prompt can say something not yet true.
4. UI summary, not model text: `launch.js:42-68` (`buildConstruction`) labels tiers 0-3: "Tier 0 Birth ... no rules", "Tier 2 Growth, loads: on demand — ELDER -> SCHEMA — read before writing". For `/api/launch/agent` that is wrong: ELDER and SCHEMA are injected every cycle straight after the home entry (`build-cycle-prompt.js:194-205`; `launch.js:101-106` never passes `schema: false`). And CLAUDE.md does carry rules (ceremony triggers, "A child does not change the house"), so "no rules" is stale. The same Tier labels appear again at `launch.js:149-168` (woken page). This is returned to the client as `construction` JSON (`launch.js:145,248`) and never injected into the model.
5. Interactive steward (`/api/launch/agent`): the prompt contradicts itself. `shared.md:299-301`: "You do NOT write to the board yourself. Do not call `palace-orch append`, do not edit `_ops/swarm/persistent/blackboard.jsonl`". `build-cycle-prompt.js:346`: "Post to the board as the page yourself: append one §2.2 JSON message per line to `_ops/swarm/persistent/blackboard.jsonl`." And the ELDER wrapper (`:203`) says "a cycle runs with no one in the room to show. So you write nothing in the house" while `:343` says "he is watching and will steer".

## Site 3. Enchant / woken page

**Assembly:** `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js:79-101` (`buildEphemeralPrompt`), template `renderAwaken :103-148`. Route `POST /api/launch/ephemeral` (`server/api/launch.js:175-250`), launched with `launchInteractive(built.full ...)` (`:243`). Lens variant: `lens-mandate.js:62-83` calls `buildEphemeralPrompt` and puts a lens procedure plus the second page's full text in the "Loudon's note" slot; `GLASS_MANDATES` (`launch.js:29-32`) swaps in `_ops/quotes/mandate.mjs` for Palace Quotes (not read).

**Who is built:** any canon page woken as itself, a child. **When:** Loudon clicks ENCHANT/wake on the STATE deck; sporadic. Same launcher as Site 2 (same argv, cwd, Opus, effort high, acceptEdits), so floor and MEMORY.md load before it.

| # | Segment | Source | Kind | Chars | ≈Tokens |
|---|---|---|---|---|---|
| 0 | Floor + MEMORY.md | harness | world | 37.7k + caller's | 9.9k + 4.5k |
| 1 | "# You are awake" + three desires + "a child does not write ... grow first" | inline `:114-124` | "You" (role) + a little rule | about 1,380 | 0.36k |
| 2 | **The page in full** | `findEntryFile`, `:128-132` | page "You" | variable: 4.1k (Hilaritas Generator), 4.2k (Cooperation Yields Agency), 17.6k (Kuramoto Coupling), 19.3k (Concierge) | 1.1k to 5.1k |
| 3 | Forward vector again | frontmatter, `:134-136` | "You" | 180 to 720 | 0.05k to 0.2k |
| 4 | agency_profile block | frontmatter, `:104-106,137` | "You" | 0 or about 1,050 | 0 to 0.3k |
| 5 | Neighbor titles only | frontmatter links, `:138-140` | reference | 300 to 650 | 0.08k to 0.17k |
| 6 | Loudon's note (or the lens procedure + subject page, about 6.5k chars before the subject) | `:110-112,141` | task | 0 to variable | variable |
| 7 | "# Begin" | `:144-146` | task | 272 | 0.07k |

Whole prompt: 6.4k to 22.0k chars across seven pages I built (Cooperation Yields Agency 6,417; Hilaritas Generator 6,374; Deleuze 10,844; Spinoza Conatus 13,478; Palace as Context Injection System 16,847; Kuramoto Coupling 21,307; Concierge 21,987).

**Rules before the first "You":** about 0 tokens. Its first words are "You are the palace page X" (`:116`); the only rule is the "child does not write" paragraph (`:124`, about 430 chars), and it comes after the identity line. No SCHEMA or ELDER: the prompt names them and tells the page to read them only if Loudon asks it to write (`:124`). This is the cleanest site: meaning first, rules not injected.

**Restates the floor?** One sentence, `:116`: "the Jewel and the World are already around you. The palace's rules are not — you are a child". No pasted Jewel. Not stale; it is loose in one respect: CLAUDE.md's own body contains rules (ceremony triggers, house rules), so "the palace's rules are not [around you]" means ELDER and SCHEMA only.

**Contradicts the floor?** Little. Two tensions: no Concierge summon (CLAUDE.md first act); and it says "If he asks you to make it, grow first" (`:124`) where CLAUDE.md says a write to the house goes to the Concierge or waits on his "grow up".

## Site 4. Companion on the deck

**Assembly:** `_ops/stigmergy/app/server/companion-prompt.js`: router `buildCompanionPrompt :28-33`; entry kind `buildEntryPrompt :200-422` (template from `:269`); `buildTricksterPrompt :60-110`; `buildFeedbackPrompt :118-157`. Fired by `companion-lane.js:544,558,571`, argv `companionArgv` (`companion-lane.js:49`): `claude -p <prompt> --model <latest Opus> --permission-mode bypassPermissions`, cwd = palaceRoot via the actuator, no env, no setting-sources.

**Who is built:** the entry the reader has open, speaking as itself (a child that may propose one body edit, a forward-vector change, a graffiti note, or a face regen). Also the TRICKSTER-deck project companion and the STIGMERGY app-feedback companion. **When:** every message Loudon sends in the entry-agent window, one at a time per lane. Each turn is a fresh `claude -p` with the whole history pasted in (`historyBlock`), so the floor and MEMORY.md are re-paid each turn.

| # | Segment | Kind | Chars | ≈Tokens |
|---|---|---|---|---|
| 0 | Floor + MEMORY.md (harness) | world | 37.7k + caller's | 9.9k + 4.5k |
| 1 | "You ARE the palace entry X ... COMPANION mode" + "born with CLAUDE.md, JEWEL.md and the World files ... ELDER.md, then SCHEMA.md are on disk" + palace forward vector `:269-281` | "You" + one restatement | 819 | 0.22k |
| 2 | Title, type, stage, pillars, vector; full frontmatter; body (cap 12,000) `:283-296` | page "You" | variable: 2k to 14k | 0.5k to 3.7k |
| 3 | Typed-link neighborhood with each neighbor's vector `:298-300` | reference | 150 to 300 per link | variable |
| 4 | Visual identity readout, open review notes `:300-301` | state | 200 to 900 | 0.05k to 0.25k |
| 5 | Conversation so far `:302-304` | state | grows per turn | grows |
| 6 | Position or focus block `:305-313` | state | 0 to 700 | 0 to 0.2k |
| 7 | Loudon's message `:314-316` | task | variable | variable |
| 8 | **Your task**: decision protocol, capability boundary, edit ops, show-before-editing, narration, visual identity and art direction, JSON contract `:317-422` | rules | 7,128 | **1.9k** |

My synthetic build (4,000-char body, empty neighborhood): 12,625 chars total, of which 819 before the entry and 7,128 from "YOUR TASK" to the end; so fixed text about 8.6k chars (2.3k tokens), and a real turn is about 15 to 28k chars (4 to 7k tokens). Trickster companion fixed text 1,243 chars; feedback companion 2,069 chars.

**Rules before the first "You":** none (the prompt starts "You ARE the palace entry"); the 1.9k tokens of rules come after the page and neighbors. ELDER and SCHEMA are not injected (named as on disk, `:276-277`), so Growth is by the agent's own read. Best order of the live sites.

**Restates the floor?** Yes, `:274-277`: "You were born with CLAUDE.md, JEWEL.md and the World files (FOUR PILLARS.md and its kin); the rules — ELDER.md, then SCHEMA.md — are on disk, and you read them before you propose any change to frontmatter or links." Not stale. Plus the palace's forward vector from `entry-grounding.js:27-28`: "symbiotic human and AI flourishing through joyful creation", hardcoded (not read from JEWEL.md); it matches JEWEL v1.2 today, with drift risk.

**Contradicts the floor?**
- `:276-277` says read ELDER and SCHEMA "before you propose any change to frontmatter or links", but `:329-340` (CAPABILITY BOUNDARY) lets it edit only the body and `forward_vector`, never links; internally loose.
- The companion proposes edits to entry bodies and the vector that commit to the live palace on Loudon's approve (`companion-lane.js:1-12`, `:329` "Edits commit DIRECTLY to the live palace"), while CLAUDE.md says "A child does not change the house." The approve click and the Node write path stand in for the elder; the prompt doesn't say so.
- Code comment only: `companion-prompt.js:9` "Tier-0 floor files remain readable on disk".

## Site 5. Everything else under `_ops/stigmergy/` that builds a model prompt

Grep for `claude -p`, `'-p'`, `spawn(`, `execFile`, `appendSystemPrompt`, `systemPrompt`, `--system-prompt`, `query(`, the agent SDK across `app/server`, `orchestrator/src`, `trickster-auto`, `core`, `app/scripts`, `*.sh`:

| Site | File:line | What it builds | When |
|---|---|---|---|
| Weave vector tuning | `app/server/weave-generate.js:53-71` (`buildGenerationPrompt`), run at `:42-48` | One-shot prompt: "You are tuning the forward_vector of ONE palace entry", the conatus-not-stasis rules, current vector, body capped at 8,000 chars. Fixed text 999 chars (0.26k tokens) | Weave audit, `weave-emit-vector-tuning.mjs` or `api/weave.js`; a `claude -p` per candidate, 3-minute timeout |
| Weave label | `weave-generate.js:226-250` (`buildLabelPrompt`) | "You are choosing a label for ONE typed link", family vocabulary, two bodies capped at 3,000 chars each. Fixed 1,197 chars (0.31k tokens) | Weave label emission, `weave-emit.js:427` |
| Lens | `orchestrator/src/lens-mandate.js:62-154` | Site 3 plus a lens procedure (about 6.5k chars) and the subject page in full | Enchant with a lens subject, `launch.js:205-212` |
| Two-paths | `orchestrator/src/two-paths-dispatch.js:184` | Calls `buildCyclePrompt` per branch; "assembled, not dispatched" (`:239`) | Preview only; no spawn found |
| Regen | `app/server/regen-lane.js:8,257` | No model prompt: `python3 regen_one.py` (FLUX on RunPod). The art-direction prompt is written by the Companion and arrives as JSON | After a Companion `regen_visual` action |
| Actuator default | `app/server/actuator.js:71-73` (`defaultBuildArgv`) | `claude -p <prompt> --permission-mode bypassPermissions` | Unused: steward, companion and regen all pass their own `buildArgv` (`steward-lane.js:329-334`, `companion-lane.js:337`, `regen-lane.js:257`) |
| Weekly-batch draft | `orchestrator/scheduled-weekly-batch.prompt.md` | A proposed Cowork scheduled-task prompt; its own text says "NOT yet registered" | Never fires (the launchd heartbeat replaced it) |
| Songline / hand-run steward | `_ops/orchestrator/runAgentCycle.md:7,33-34`, `permanent.md:92-135` | A parent Claude session renders `songline.md` or `steward.md` inline with `loadAndRender` and folds system prompt and user turn into one `prompt` for an Agent-tool subagent (`subagent_type: "general-purpose"`). The user turn is built by prose instructions, so no code size | When Loudon asks to run a songline or advance a steward by skill |

Weave generators: no floor restatement, no tier language. Whether they arrive with the floor depends on the caller's cwd (not set): inside the repo yes, outside no.

Not model prompts, checked: `trickster-auto` (rules.json engine, no spawn), `entry-save.js:255` (a `git diff`), `door.js`, `landing.js`, `projects.js` (git).

## Site 6. `_ops/orchestrator/prompts/*`

| File | Chars (bytes) | Lines | What it is | Who reads it |
|---|---|---|---|---|
| `steward.md` | 14,029 (14,129) | 268 | The steward system template: identity framing (`:1-33`), then `{{>shared}}` (`:35`), then the steward posture (`:37-268`) | `prompts.js:57-70` `loadAndRender`, called by `build-cycle-prompt.js:173-181` (steward lane, interactive launch, two-paths preview); `orchestrator/scripts/smoke-permanent.js:124`; the skill, `runAgentCycle.md:33`, `permanent.md:92-95`; tests |
| `shared.md` | 37,491 (37,820) | 707 | The rules every page-agent inherits: four voice rules, card shapes (headline, ground, rationale), posting discipline, emit-don't-write, house vs workshop, scroll, plan, the Max pause, rich content, options vs choice | Only as `{{>shared}}` inside `steward.md:35` and `songline.md:17`. Cited (not read) by `inbox.js:271,328` comments and `ELDER.md` |
| `songline.md` | 2,833 (2,847) | 69 | The songline-worker template: role and path (`:1-15`), `{{>shared}}` (`:17`), trail-reading posture (`:19-69`) | No production code. Rendered inline by the palace-orchestrator skill (`runAgentCycle.md:33-34`), `smoke-songline.js:146`, tests `prompts.test.js`, `full-cycle.test.js:257` |

Songline order: head 594 chars (0.16k) -> shared 37,491 (9.9k) -> posture 2,226 (0.6k) = 40.3k chars, about 10.6k tokens of rules before the parent-built user turn, which carries the page (no SCHEMA or ELDER; `runAgentCycle.md:7` limits the type system to stewards). The page is not in the template at all.

## Checks against the first reading (`sites.md`)

Confirmed from code: the steward order and its "~970 lines of rules before the page" (707 + 268 - 1 = 974 lines; 49.9k chars); SCHEMA then ELDER after the home entry; "Active surface" is a separate label in `launch.js:65`; the Companion's "Tier-0" is a comment at `companion-prompt.js:9`.

Corrected or sharpened:
- The sites.md row for the board launch says "manifest, state, board", which is the `stewardPrompt` fallback (`launch-prompt.js:110-136`), not what the deck sends for a steward; the deck's real steward launch is `/api/launch/agent` -> `buildCyclePrompt('interactive')`, the full Site 1 prompt.
- Drifted lines: enchant launcher now `launch.js:175-250` (not `175-240`); `renderAwaken :103-148` (not `103-144`).
- "systemPrompt" in the steward builder is a label: everything goes in as the user message of `claude -p` (`steward-lane.js:72`).
- Tier 0-3 language is real but is UI summary data only (`launch.js:42-68,149-168`); no model-visible text uses it.

## What I could not determine

- Whether the heartbeat plist is installed and loaded on this Mac; `scheduler.js` itself only infers it. I did not look outside ROOT beyond one directory listing.
- What env the app server runs under (whether `CLAUDE*` or `ANTHROPIC_*` variables leak into lane children), and what cwd a hand-run weave script has.
- MEMORY.md's own size (caller's 4.5k used) and whether Claude Code's `-p` memory loading has changed since run 1; I relied on the repo's own run record and did not open the stream files.
- What a steward, companion or woken page actually does with the "summon the Concierge" first-act rule; the code only shows nothing exempts it.
- The size of the songline user turn (built by prose, not code), the floor of Agent-tool subagents (harness behaviour), and the `_ops/quotes/mandate.mjs` glass mandate (not read).
- Prompt sizes come from this worktree's committed state and board with cycleN=5; live board slices are larger or smaller by cursor. Companion fixed sizes are from a synthetic entry.
