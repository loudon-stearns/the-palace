---
title: "Self-Model Update Ceremony — tuning"
born: 2026-09-25
links:
  - target: "[[Self-Model Update Ceremony]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Self-Model Update's record of what each run taught it, numbered, each lesson naming the spec change it forced, if any, so the ceremony's version has a reason you can read. Every run leaves a line here; a run that taught something also leaves a numbered item. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what each update taught the Self-Model Update"
  run: "one revision of SUBSTRATE"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Self-Model Update Ceremony — tuning

What each update taught the ceremony, and the lessons that reached it from elsewhere. Each item names what was shown and the spec change it forced, if any, or says **owed** when a change hasn't landed. Newest last. Hashes are commits to `_ops/Self-Model Update Ceremony.md` unless noted.

**v1.0 (2026-09-25)** is the card as it stood that day, plus the opening read. It marks where counting starts, not a ranking of what came before. The number moves when the procedure does — a step, a postcondition, a gate — never for prose. An update's record is its commit.

**v2.0 (2026-10-22)** moves the contract from facts to interpretation. SUBSTRATE becomes an anatomy, the census goes to the Palace Map, and the run is checked against `SUBSTRATE — anatomy.json`. Item 1 is the reason.

## From the anatomy review — 2026-10-22

1. **The ceremony never ran under its ledger, and its contract only asked for numbers.** Two real refreshes happened before this ledger was born: 2026-06-16 (`8ed55c98`, under the ceremony's subject) and 2026-08-25 (`02e1c7e6`, committed as `edit(self-model)`, which the scroll cannot see). After them came 1,470 commits and Schema v1.18–v1.29 with no run, while Schema Ceremonies patched SUBSTRATE a line at a time as a mirror. The postconditions named entry counts, hubs and open questions, and Step 3 said not to rewrite the architecture. So organs born between July and October (the Concierge, the scroll, the stewards, the Commons, the door, the Daily Page) never reached the page, and the counts went stale the day after each run. The [[Palace Map]] had meanwhile become the palace's proprioception, and [[ROSETTA]] and [[Substrate Skill]] had taken over its structure. Forced: v2.0. The postconditions become anatomy whole, anatomy readable by a fresh agent, weights from the map, reading current, commit under `palace-commit --ceremony`. Step 2 reads the map's diff and git's births, Step 3 is the anatomy check, and the census moves out to [[SUBSTRATE — Context]]. Drafted on branch `draft/substrate-anatomy` (`d6eea7dc`, `5b2ee5ce`); paid in `d6eea7dc` and `5b2ee5ce`, landed on Loudon's yes of 2026-10-22.
