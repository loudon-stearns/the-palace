---
title: "Concierge — tuning"
born: 2026-10-21
links:
  - target: "[[Concierge]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the record of what serving has taught the Concierge: its boot, its postures, the summon, and the drafts it placed. A line for every session it served, and a numbered item when one taught something the next summon should carry. What a close taught it stays in Closing Well's ledger."
ledger: tuning
standards:
  for: "what serving taught the Concierge: its boot, its postures, the summon, the drafts it placed"
  run: "one session served: the summon, its addresses, and the close it moderated, if any"
  line: "- run · <date> · <the session or its close> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at boot"
  writes: "the working Claude or the Concierge, in the session's last commit; a lesson from a close stays in Closing Well's ledger and may be copied here with a pointer, never moved"
  merge: union
  kept: git
  trim: never
---

# Concierge — tuning

What serving has taught the Concierge. A run is one session served. Lessons a close taught it stay in [[Closing Well — tuning]], whose own rule is never to prune what a real close taught; this ledger may copy one in, with a pointer. Numbered items, grouped by date; newest last.

## From the floor review — 2026-10-21

1. **No dispatched prompt says whether the summon applies.** The floor's "Your first act in any session … is to summon the Concierge" ([[CHILD]] § Growing up) reaches every agent: stewards, woken pages, the Companion, baton launches, the Concierge itself. None of their prompts says whether it applies, and most have no Agent tool. What they do is untested. Found in [[Palace as Context Injection System — sites]] (Reading · 2026-10-21); first held there, because this page kept no ledger until Loudon's yes of 2026-10-21 ("3. yes"). Evidence `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/sites-reading — steward and board.md:75`. **Owed, a question for the Concierge and Loudon (the rule's home is CHILD):** say in CHILD that the summon is the session's, and let a dispatched agent's task say what applies to it?
2. **Three small stale pointers in the Concierge's own files.** `_ops/concierge/prompts/companion.md:32`: "forward-ghosts that CLAUDE.md calls invitations"; CLAUDE.md has no such phrase (the Jewel says "A missing connection is an invitation", `JEWEL.md:47`). `.claude/skills/concierge/SKILL.md:32-33`: agent teams "on in Loudon's terminal sessions"; `~/.claude/settings.json` sets the flag to "0". The skill's always-loaded description frames the Concierge as something addressed on request; the summon-at-the-open rule is only in its body. Found in [[Palace as Context Injection System — sites]] (Reading · 2026-10-21); first held there, because this page kept no ledger until Loudon's yes of 2026-10-21 ("3. yes"). Evidence `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/sites-reading — everything else.md:47,72`. **Owed:** each points at what is true when the file is next touched.

## From the map-use plan — 2026-10-22

3. **The Concierge booted with 33k of rules and no sense of the palace's shape.** It answered "where does this live, what sits beside it" by grepping, while the [[Palace Map]] held every entry's ring. Loudon, 2026-10-22: "The Move 2 lines are approved as drafted. Have the Concierge place them, fold in the README word, commit, and record the plan complete on the scroll." Forced: one habit, find the home entry, read its ring, then search — a bullet in the charter (`_ops/concierge/prompts/companion.md` § How you work), a step in each posture (gatherer step 1, oracle step 1, scout beside `return-map.mjs` with `quiet` and `ghosts --persistent`, curator step 1 at one hop), a sentence on [[Deposit Ceremony]] Step 3 (v2.7), a line in § The mechanism here and in `_ops/concierge/README.md`. The limit is said in each: the map is frontmatter only and as old as its build, so the ring narrows a search and never ends one. Owed: a gatherer and an oracle address in a fresh session citing a `near` output, recorded on the Palace Map scroll's trail when run. Move 2 of the plan on the [[Palace Map]] scroll.
