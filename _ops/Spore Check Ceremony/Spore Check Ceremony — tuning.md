---
title: "Spore Check Ceremony — tuning"
born: 2026-09-25
links:
  - target: "[[Spore Check Ceremony]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Spore Check's record of what each run taught it, numbered, each lesson naming the spec change it forced, if any, so the ceremony's version has a reason you can read. Every run leaves a line here; a run that taught something also leaves a numbered item. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what each spore check taught the Spore Check"
  run: "one review of every spore"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Spore Check Ceremony — tuning

What each spore check taught the ceremony, and the lessons that reached it from elsewhere. Each item names what was shown and the spec change it forced, if any, or says **owed** when a change hasn't landed. Newest last. Hashes are commits to `_ops/Spore Check Ceremony.md` unless noted.

**v1.0 (2026-09-25)** is the card as it stood that day, plus the opening read. It marks where counting starts, not a ranking of what came before. The number moves when the procedure does — a step, a postcondition, a gate — never for prose. A spore check's record is its commit.

No run has changed the ceremony since it took its present form in the March consolidation (`46d904fe`); the edits since were paths and boilerplate.

## From the redesign with Loudon, before the first run — 2026-10-21

1. **Its list of sleepers was the wrong list, and it revived inline.** Selecting `stage: dormant` on 2026-10-21 found three pages, only one a spore; it missed JSUI, a spore at `sprout`, and it read no board, so it could not see that one of the three, Particle Synthesis, had a revival granted on 2026-09-24 that never landed. Its `revive` disposition revived the page itself, a second path beside the Revival Ceremony; its `hold` wrote nothing, so "held across N checks" could never be counted; and conditions like "when the framework reaches maturity" could not be checked by anyone. Forced: v1.3. Sleepers are dormant pages, spores at any stage and granted-but-unlanded revivals; revive hands each page to the Revival Ceremony; hold rewrites conditions that can't be checked; compost posts a `composting-confirmation` flag for the Weave; fold joins the dispositions, as on the Daily Page; the run line names each page and its disposition. Settled with Loudon in the revival-ceremony session.
