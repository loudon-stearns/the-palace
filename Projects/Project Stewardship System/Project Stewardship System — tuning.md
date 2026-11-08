---
title: "Project Stewardship System — tuning"
born: 2026-10-21
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the record of what running the stewards has taught the machinery that assembles them: the cycle's prompt, its lanes and its order. A line for every change to that machinery, and a numbered item when a change, or a finding from outside, taught something the next change should carry. Each steward's own lessons stay in its page's ledger."
ledger: tuning
standards:
  for: "what running the stewards taught the steward machinery: the cycle prompt, the lanes and the heartbeat"
  run: "one change to how a steward is assembled or run (build-cycle-prompt.js, the steward prompts, the lanes, the heartbeat), made or proposed"
  line: "- run · <date> · <what changed> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before changing the steward machinery"
  writes: "the session that changes the machinery, in that change's commit; a finding from outside comes in as an item"
  merge: union
  kept: git
  trim: never
---

# Project Stewardship System — tuning

What running the stewards has taught the machinery that builds them. A run is one change to that machinery. Each steward's lessons about its own page stay in that page's ledger; this one holds what is true of every steward. Numbered items, grouped by date; newest last.

## From the floor review — 2026-10-21

1. **The steward cycle reads rules before it reads the page.** `_ops/orchestrator/prompts/steward.md:16-22` promises "Read it before you read anything as a rule"; `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js` then places `shared.md` (≈9.9k tokens) and the posture (≈3.3k) ahead of the home entry, so the page arrives about 28k tokens in. SCHEMA (≈3.9k) and ELDER (≈3.2k) are injected every cycle between the page and its state, scroll and board (`build-cycle-prompt.js:194-205`). A cycle's prompt runs 27–65k tokens (median 35k; the board alone up to 41k), re-paid each cycle. Every cycle is also born with the operator's MEMORY.md (cwd is the palace root), which the docs say `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` would drop (the reading's claim, not tested). Found in [[Palace as Context Injection System — sites]] (Reading · 2026-10-21); first held there, because this page kept no ledger until Loudon's yes of 2026-10-21 ("3. yes"). Evidence `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/sites-reading — steward and board.md:27-77`. **Owed, a question for the machinery and Loudon:** the page and where it stands first, and SCHEMA and ELDER at the moment a write is drafted?
2. **The interactive steward prompt says two things about the board.** `_ops/orchestrator/prompts/shared.md:299-301`: "You do NOT write to the board yourself". `build-cycle-prompt.js:346` (interactive): "Post to the board as the page yourself". The ELDER wrapper (`:203`) says no one is in the room; `:343` says Loudon is watching. Found in [[Palace as Context Injection System — sites]] (Reading · 2026-10-21); first held there, because this page kept no ledger until Loudon's yes of 2026-10-21 ("3. yes"). Evidence `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/sites-reading — steward and board.md:105-110`. **Answered by Loudon, 2026-11-07:** a steward he drives live posts to the board itself, one message at a time through the orchestrator's appender and its strict validator, and squares its books with finalize-live.js before it stops (4f376b90, Closing Well v1.15). The live closing carries his reason: "since it has my attention we can do anything!" (build-cycle-prompt.js:346). shared.md's output discipline now says it is for a headless cycle. Paid on 2026-11-07; the run line is below.

## 2026-10-25

- run · 2026-10-25 · the urgent ask offers PLACE-NOW for the rite's step, and an old LAND-NOW answer reads as PLACE-NOW (`cycle-commit.js`, `ledger-review.js`); `settle-proposal.mjs` pays only with a commit in the settled checkout's history · taught item 3

3. **One word stood for two yeses, and the pay check followed the wrong one.** The urgent ask offered LAND-NOW, git's word, for the rite's step of placing Loudon's yes in the page, so the button could read as a yes to main. Meanwhile `settle-proposal.mjs` checked only that the cited commit existed and changed the page. Worktrees share one object store, so a commit that was placed on a branch could pay a ledger on main whose tree lacked the words. Found in the examination of the entry's trim, on Loudon's To-Do item of 2026-10-25 ("give the rite's 'land' its own verb"). Acted on in the same change: the option is PLACE-NOW, old answers read as it, and a pay needs the commit in the settled checkout's history (`review-and-leave-cli.test.js`). A machinery name should say the rite's step, not git's.

## 2026-11-07

- run · 2026-11-07 · shared.md's output discipline says it is for a headless cycle and sends a live steward to the live closing; Loudon answered item 2 ("Yes, both") · paid item 2
