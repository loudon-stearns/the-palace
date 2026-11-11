---
title: "STIGMERGY — tuning"
born: 2026-10-21
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the record of what running the deck has taught STIGMERGY: its launchers, its companions, its guards and its board. A line for every change to the deck or its lanes, and a numbered item when one, or a finding from outside, taught something the next change should carry. The app's README keeps the rule; I keep where it came from."
ledger: tuning
standards:
  for: "what running the deck taught STIGMERGY: its launchers, companions, guards and board"
  run: "one change to the deck or its lanes, made or proposed"
  line: "- run · <date> · <what changed> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before changing the deck"
  writes: "the session that changes the app, in that change's commit; a finding from outside comes in as an item"
  merge: union
  kept: git
  trim: never
---

# STIGMERGY — tuning

What running the deck has taught STIGMERGY. A run is one change to the deck or its lanes. The app's README keeps its gotchas as rules; their history may come here. Numbered items, grouped by date; newest last.

## From the floor review — 2026-10-21

1. **A copy of the palace's vector lives in the deck's code.** `_ops/stigmergy/app/src/lib/entry-grounding.js:28` hard-codes the palace's forward vector for the Companion; it will drift from the Jewel. And the launcher's "construction" data (`_ops/stigmergy/app/server/api/launch.js:42-68`) shows Tier 0–3 labels with ELDER and SCHEMA "on demand", which is wrong for stewards (they get both every cycle). UI data only; no model reads it. Found in [[Palace as Context Injection System — sites]] (Reading · 2026-10-21); first held there, because this page kept no ledger until Loudon's yes of 2026-10-21 ("3. yes"). Evidence `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/sites-reading — steward and board.md:109,159`. **Owed, a question for the deck and Loudon:** read the vector from the Jewel, and retire the tier labels?
2. **The deck's write guard protects one World file of five.** `DENIED_CANON_PATHS` (`_ops/stigmergy/app/src/lib/entry-edit.js:105-119`) keeps the careful path from writing CLAUDE, CHILD, JEWEL and ELDER, and FOUR PILLARS, but not Palace Philosophies, Cooperation Yields Agency, Hilaritas Generator or Modes of Collaboration, which every agent is born with too. Noticed by the Concierge during the floor review. **Owed, a question for the deck and Loudon:** add the other four?
3. **Two deck comments credit CLAUDE.md with Substrate Skill's rule.** `_ops/stigmergy/app/src/lib/wikilink.js:7` ("CLAUDE.md says agents must search recursively") and `_ops/stigmergy/app/src/lib/entries.js:3` ("Per CLAUDE.md: …") quote a rule that lives in `_ops/Substrate Skill.md:218`. Noticed by the Concierge during the floor review. **Owed:** both point at Substrate Skill when the files are next touched, at a quiet moment for the deck's Vite graph. **Paid 2026-11-07.**

## Back-filled from git, 2026-11-07

The ledger was born on 2026-10-21 and no change to the deck wrote its line. These are the deck's and lanes' changes since, written from `git log` by STIGMERGY on Loudon's word of 2026-11-07, not by the sessions that made them; what each taught was not recorded, so none claims "nothing new". Changes whose home is elsewhere (the Weave, the Schema Ceremony, the door, the piece origin) are left to their own ledgers.

- run · 2026-10-21 · the PROJECTS deck puts a page whose steward has proposals for canon under needs you, and says how many (`47a0d2b4`) · not recorded
- run · 2026-10-21 · the LOG deck's trunk strip: main against origin, the last push, the ear's door and around counts, a landing that died, unsaved in main … (`bb7f635a`) · not recorded
- run · 2026-10-21 · the README says pieces run on the piece origin, a fill piece is sized from the column, and the standalone preview runs its own piece origin (`cddf5eee`) · not recorded
- run · 2026-10-21 · the deck's careful path may read CHILD.md but not write it, like CLAUDE.md beside it (`1c7d9147`) · not recorded
- run · 2026-10-23 · every page has a rich face, and it opens as its own page (`f67b19dd`) · not recorded
- run · 2026-10-24 · tokens replace dollars on the heartbeat and the steward lane; a limit stop reads as a state, not a warning; the steward button says add … (`85733cf2`) · not recorded
- run · 2026-10-25 · the PROJECTS deck's ready rows skip dormant and composting pages, by the heartbeat's own SKIP_STAGES (`4aeabfb1`) · not recorded
- run · 2026-10-25 · advance all skips dormant and composting stewards by the heartbeat's SKIP_STAGES, so it matches the deck's ready count (`af8914c7`) · not recorded
- run · 2026-10-29 · a cycle names the workshop files it leaves uncommitted, and a .md with no type: gets no Palace-Entry (`337b1b02`) · not recorded
- run · 2026-11-03 · the PROJECTS deck is one grid: the header and every row share its columns, so they line up; the steward column fits cyc N beside its … (`adceacaf`) · not recorded
- run · 2026-11-03 · the PROJECTS deck's health tags stand in one column: cyc N gets a fixed right-aligned width (`24946a68`) · not recorded
- run · 2026-11-03 · a scroll's advance takes a cycle count (1 to 5, starting at the manifest's cap) and shows cycle k/N of the run and why a run ended; … (`655c33a3`) · not recorded
- run · 2026-11-03 · the PROJECTS row's confirm step carries the cycle count too: every stewarded row opens at its manifest's cap and sets 1 to 5 before confirm (`26068533`) · not recorded
- run · 2026-11-03 · the PROJECTS deck drops its GREEN/YELLOW/RED tags: 'cycle N' carries the steward's health in its colour (`c0581ffd`) · not recorded
- run · 2026-11-03 · the PROJECTS poll stops walking the whole palace: entry lookups come from one index, project facts are kept until a page changes, and … (`46094310`) · not recorded
- run · 2026-11-03 · STIGMERGY's [L]ens reads boldly: the glass speaks in its own register and life, labelled as its own, and ends each reading with a … (`a145f1a4`) · not recorded
- run · 2026-11-03 · the board draws its own furniture: every scrollbar, grip, chevron, box, cursor and fold in phosphor (`427bc61e`) · not recorded
- run · 2026-11-03 · the board's hint line: every title= read into the command bar, the OS tooltip never shown (`fcba824a`) · not recorded
- run · 2026-11-04 · the app README says how to recover a cycle a dead or wedged server never posted: reap it from its transcript with process-cycle.js, then … (`3a7c07d4`) · not recorded
- run · 2026-11-04 · the Trickster deck can collapse to who · state · the ask (`3870b35d`) · not recorded
- run · 2026-11-04 · search and filter at the top of the Trickster deck (`4278e4ee`) · not recorded
- run · 2026-11-04 · GET /api/file serves a .pdf as application/pdf, so the deck's PDF frame draws it in place instead of Chrome saving a "file (N)" to … (`1cfcb022`) · not recorded
- run · 2026-11-04 · Trickster enters collapsed, open sits left, Back returns to the card (`b82f46b4`) · not recorded
- run · 2026-11-04 · Back to the Trickster deck keeps the open card where it sat (`f9228120`) · not recorded
- run · 2026-11-04 · a Trickster card's more fold shows the project's plan and standing orders (`0096ea30`) · not recorded
- run · 2026-11-04 · a Trickster card's proposed plan renders as the scroll's Plan does (`61a00ba8`) · not recorded
- run · 2026-11-04 · a finished project says so, and offers no steward (`66ec2f06`) · not recorded
- run · 2026-11-07 · the handoff readers honour RETRACT (handoff-model.mjs, queue-model.js); `--dur-type-banner` brought level with the kit; the README's v0.2 sections and directory map relaid; the two comments of item 3 repointed · nothing new
- run · 2026-11-07 · a REVIEW NOTE that did not come from the rich face's dock (Loudon's answers to a rough, through the answers server) reads as a note on the page, sent from the rough it names, not "on the rich face of"; each rough's answers stand under its task; the companion's rich-face block takes only the dock's notes (queue-model.js, review-notes.js) · nothing new

## From STIGMERGY's close — 2026-11-07

4. **Is a script enough, or does STIGMERGY want a steward?** On 2026-11-07 a drift check took a steward's place: `drift-check.mjs` reads this page against the decks, lanes, wire types, kit, README, board and this ledger, as the seventh command of the Weave's Substrate sweep (Weave Ceremony v2.2, `8df3102e`). Loudon, at the close: "I am unsure about the script, but I want to let this work for a while and see how it goes." **Owed, a question for Loudon:** after the check has run in three Weaves, or on 2026-12-15, whichever comes first, put it to him again. Bring the drift-check block from each Weave's report as the evidence: what it caught, what it missed that a reader found, and whether any finding needed judgment rather than a fix. The case for a steward is judgment work that keeps recurring. The case against is the circularity named on 2026-11-05: a steward that runs inside the app it tends, can't commit a close, and asks through the inbox it tends. The Concierge argued for the script (2026-11-05), so that view is not the neutral one.

## From the fan-out builds — 2026-11-10, filed 2026-11-11

Six merges landed on 2026-11-10, each built in a worktree of its own from an open handoff: `045b460a`, `71d0f092`, `106f80e2`, `41885193`, `4b9f1b8f`, `5e12ba3b`. None wrote its line here. These items were filed by the Concierge from the commits and the code, not by the sessions that built them, on Loudon's "Yes, send them" of 2026-11-11 as the session relayed it.

5. **One helper says which answers still answer, and a new reader imports it.** `_ops/stigmergy/live-answers.mjs` (`4b9f1b8f`, `5e12ba3b`) folds `RESOURCE_GRANT` and `RESOURCE_DENY` for every reader. Its rules: an ask is keyed by `request_id`, else `id` (`askKey`, `:73`); the last live answer in board order is its answer, and scroll-view's `decisionFor` alone takes the first (`app/src/lib/scroll-view.js:204`); a retracted answer answers nothing; a `RETRACT` is never itself retracted (`retractedIds`, `:47`). Before it, eleven files folded answers by hand. A reader of grants or denies does not fold its own. A Python reader cannot import it, and mirrors the rule under a comment naming the file (`:13-14`).
6. **Where hand folds drift, check the key as well as the tie.** The eleven had drifted on the key: the Return map keyed an ask by its message id (`2663cf5d`), the deck's request cards and the steward cycle by `request_id` alone (`31bd2926`, `242f3da8`), and `inbox.js` read both names. One ask answered by the other name read as waiting in one place and settled in another. On the tie only scroll-view stood apart, taking the first answer where every other reader that picks one takes the last (`live-answers.mjs:26-31`).
7. **A line filter in front of a shared fold opts out of every rule that rides on a line type it drops.** `app/src/lib/review-notes.js` (`WANTED`, `:18`) and `_ops/loudon-eval/read-answers.mjs` (`REVIEW_LINES`, `:78`) handed `buildQueue` only the `human_eval`, grant and deny lines, so the fold never saw a `RETRACT` and read a retracted answer as given. Both now let `RETRACT` through (`e9a7c93c`, landed in `4b9f1b8f`). When the fold learns a new line type, every filter in front of it is checked too.
8. **The app's live-board test fails on every branch, and the mend is on the board.** `app/tests/unit/validator.test.js:522` holds every line of the persistent board to the strict validator. Board line 1366, `shopkeeper-spinup-2026-11-04-c15`, carries a health block with no `health.context_pct`, no `health.tokens_this_call` and no stub marker, so the validator asks for both (`core/schema/validator.js:155`, `:185`). Commit bodies have named it as the one known failure since `c3021b9b` (2026-11-07); no ledger, baton or Shopkeeper page had it. No branch can fix it. The test excuses a line that a valid `RETRACT` names (`:494-497`). **Owed:** a `RETRACT` naming the line, and a repost in spec if the line should stand.
9. **A plain line in a commit body can close a weave flag, with no trailer.** `parseFlagLines` (`app/src/lib/commit-parse.js:140-150`) reads any body line that begins, after an optional bullet, with `Declined flag <id>` or `Carried flag <id>`, capitalised or not. `weaveFlagClose` (`app/src/lib/queue-model.js:626`, gathered there in `045b460a`) greys the entry flag whose id, or `msg-<id>`, is exactly that token, and never a propagate flag. A Carried line closes nothing: it puts its note on a propagate card (`:649`). The deck does not read the words mid-line. The Weave's gate does: `_ops/swarm/lint-weave-flags.py:134` searches the whole line, so "declined flag <id>" inside a sentence closes that flag for the linter and not for the deck. The same holds for its Carried search (`:199`), and history has one case: `df2e3c14` (2026-10-24) wrote its Carried line after a literal `\n`, mid-line, so the linter could read it and the deck could not; that flag closed by trailer the same day (`769c93ad`). The four other mid-line matches quote the form and name no flag. A body that writes about a flag keeps those words off its id unless it means the mark.
10. **The persistent board has a blank line.** Line 314 of `_ops/swarm/persistent/blackboard.jsonl` is empty. `readJsonl` skips blanks (`core/blackboard/jsonl.js:50`); a reader that splits the file by hand drops the empties before `JSON.parse`, or it throws there.
