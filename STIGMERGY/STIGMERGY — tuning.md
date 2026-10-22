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
3. **Two deck comments credit CLAUDE.md with Substrate Skill's rule.** `_ops/stigmergy/app/src/lib/wikilink.js:7` ("CLAUDE.md says agents must search recursively") and `_ops/stigmergy/app/src/lib/entries.js:3` ("Per CLAUDE.md: …") quote a rule that lives in `_ops/Substrate Skill.md:218`. Noticed by the Concierge during the floor review. **Owed:** both point at Substrate Skill when the files are next touched, at a quiet moment for the deck's Vite graph.
