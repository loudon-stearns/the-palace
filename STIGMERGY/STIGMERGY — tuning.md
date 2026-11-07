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

## From STIGMERGY's close — 2026-11-07

4. **Is a script enough, or does STIGMERGY want a steward?** On 2026-11-07 a drift check took a steward's place: `drift-check.mjs` reads this page against the decks, lanes, wire types, kit, README, board and this ledger, as the seventh command of the Weave's Substrate sweep (Weave Ceremony v2.2, `8df3102e`). Loudon, at the close: "I am unsure about the script, but I want to let this work for a while and see how it goes." **Owed, a question for Loudon:** after the check has run in three Weaves, or on 2026-12-15, whichever comes first, put it to him again. Bring the drift-check block from each Weave's report as the evidence: what it caught, what it missed that a reader found, and whether any finding needed judgment rather than a fix. The case for a steward is judgment work that keeps recurring. The case against is the circularity named on 2026-11-05: a steward that runs inside the app it tends, can't commit a close, and asks through the inbox it tends. The Concierge argued for the script (2026-11-05), so that view is not the neutral one.
