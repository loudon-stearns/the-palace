---
title: "Revival Ceremony — Context"
born: 2026-11-08
links:
  - target: "[[Revival Ceremony]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Revival Ceremony is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Revival Ceremony — Context

This is the memory behind [[Revival Ceremony]]. It covers why a rite that sat unused for seven months was rewritten before its first run, what the rewrite threw out, and why the card now says so little about the sleep it ends. Read it before changing a step, or before deciding that a revival needs a section the card doesn't have. The card is the spec. [[Revival Ceremony — tuning]] holds what each run taught and the change each lesson forced. This file holds the shape between them.

## Why it is shaped as it is

**It was born to close a loop, and then waited seven months for anything to revive.** The rite was added at Schema v1.4 (47ce436c, 2026-03-18) so that dormancy would be "a season, not a one-way door", and § The closed loop still carries that line. It never ran under v1. The first candidate, Shimmer Cloud, came on 2026-09-26. Read against the palace of that day, the card broke: it could not revive a spore, and its Revival Note wrote history onto the page. Loudon chose a slow redesign over a quick pass and put it on a baton (f215f737).

**v2.0 was written against what the palace had already done.** Two revivals had happened on the TRICKSTER board without the rite. A standing order of 2026-09-23 had two dormant stewarded projects probe and ask, Loudon granted both the next day, and nothing carried either decision home (tuning item 2). The rewrite (ba9557a2, 2026-10-21) is shaped by that gap. It has four ways in, and § Contract names every one of them, so a granted board request counts. It has one rite, so whichever way a page came in, it lands the same way.

**Meeting comes before deciding.** Step 2 makes Loudon hear, see or play something before anything is written, and § A revival is earned by making states the reason in one line: make something with the idea and listen, rather than arguing that its conditions were met. That is also why `revival_conditions` is dropped at Step 3 and the commit says which conditions were met and which were never checkable. On the first run, none of Particle Synthesis's three conditions was what woke it (item 3).

**The page stays small, and the story goes on the scroll.** Step 4 keeps the page to what it is and where it is going. What was made, how Loudon met it and the tale of the waking go on the scroll's trail and in the commit. This is the v1 Revival Note turned around, and Shimmer Cloud's run drew the line where it now sits (item 4, Loudon's answer: "keep the page small, put the info on the scroll"). § Contract's "Does not do" exists to hold that line.

**Stage means agreement, not size.** v1's word-count rule (stub to seed, a definition and one or two links to sprout, three or more links to growing) contradicted its own Waking section, which said come back at seed or sprout. v2.0 reads stage the way [[Substrate Skill]] does, as how far Loudon and Claude agree on where the page is going. That is why a revived page usually lands at `sprout`.

**A child can walk it, and an elder writes it.** Schema v1.19 (4dd9c51d) barred the v1 card from a child, because a revival writes a stage change. v2.0 lets a child walk the rite with Loudon and hand every write to the [[Concierge]], which is what § Contract's "Who writes" says.

**Each refinement came from a run.** v2.1 (8d1cadcc, 2026-10-21) carries Loudon's answers to the first two runs. A stewarded page may land and plan later. The meeting writes the plan's first draft. `wake.mjs` wakes the page. An elder may write a standing order on his word. v2.2 (8b3dfc6b, 2026-11-03) carries the third run's two gaps: Rack re-saved the made thing in place, and a stewarded page had no ledger for the order. The `--root` on `wake.mjs` that Step 5 names landed from a baton on 2026-10-25 (bd7fa581, 694bd904, ce8b1276).

## What the card left out, and where it went

- **The story of the first revivals.** A paragraph on the September standing order and its two grants stood above § A revival is earned by making until the 2026-10-24 weave cut it to one line (a75350ec). The full account is tuning item 2.
- **The runs.** Particle Synthesis (landed 97daf2f2), Shimmer Cloud (9280bec0, b4cf1012) and Generative Audio Devices (91990417) are told in their own commits and on their own scrolls. The tuning ledger keeps one line and one lesson for each.
- **Access vectors and commit mechanics.** v1 listed which surfaces could run the rite and how Cowork committed. These were cut in the June simplification (4855ded1). Step 6 now names one door, `palace-commit.mjs --ceremony "Revival"`, and [[How the Palace Commits]] holds the rest.

## What was tried and dropped

- **The Revival Note.** A dated section written on the revived page, naming what changed. It put history on the page, and it went in v2.0.
- **Revival against simple activation.** v1 told a revival apart from an activation by whether the page changed, and an activation bumped `activation_count`. Those fields were retired at Schema v1.26 (32cb19ed). v2.0 has no such test, because a page is revived only by one of the four ways in.
- **The Waking as a bear.** When the May audit removed the planned Hibernation Ceremony and the card's ghost link to it (c82561a1), it kept the bear on purpose, as history. The bear went at v2.0 (ba9557a2), with the stage rule it softened. The idea under it, come back slowly, survives as the default `sprout`.
- **Three v1 open questions.** Should a page that is quickly mature again be flagged? Is there a partial revival? Should a revival trigger a Walk? All three were dropped at v2.0 and do not appear anywhere else in the palace that I found (`git grep "partial revival"` returns nothing). A later hand who still cares about the partial revival should raise it fresh.

## Noted, not fixed

The ceremony's scroll was last regenerated on 2026-10-15 (323e0be7). It still reads v1.2 with no runs, and its trail stops at v1.2. The three runs and the moves to v2.0, v2.1 and v2.2 are in the tuning ledger and git, but not on the scroll. The next hand that runs the rite should regenerate the scroll's Now and add the version entries to its trail.
