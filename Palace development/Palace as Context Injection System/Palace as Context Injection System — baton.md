---
title: "Palace as Context Injection System — baton"
born: 2026-10-20
links:
  - target: "[[Palace as Context Injection System]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Palace as Context Injection System]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Palace as Context Injection System

## Move
Palace as Context Injection System, after the floor measurement's code landed (bc9b4fe3): the page's prose keeps only dated results and points at floor/floor.json and Who wakes here (words drafted, waiting for Loudon's read); the map-injection test; optionally a firmer rate for G4 and S1; the births owed on his yes (D1, E7, G4, G5, S1, and every scenario on Claude Code 2.1.308). After landing: the propagate flag whose text is in this baton, on Loudon's yes; the memory files and the MEMORY.md index line pointed at CHILD.md; the live Daily Page task updated to the new floor; a Sentry sweep before the next push. The World mends are struck below as overtaken on 2026-10-22; confirm with Loudon and drop them.

## Why this move matters
The page's forward vector names two levers on who wakes: how much context a value gets, and when it arrives. A value that comes early frames everything read after it. The floor is the first thing every agent reads, so this page's numbers about it have to stay true. Loudon widened the work on purpose: "make sure that we are not over-refining the tiers for a single purpose, consider all the ways and circumstances where we 'inject context'... like stewardship."

## Current state
- **The floor measurement's code landed** in bc9b4fe3 (branch `claude/floor-measure-29da46`: 9cf9e74d, 1765e18e), on Loudon's yes of 2026-10-25, read cold by the Concierge.
  - `_ops/self-description-test/floor.mjs` runs the $0 `claude -p /context` probe and writes `floor/floor.json` in this page's bundle. It adds a line to `floor/history.jsonl` when the numbers move, and refuses to write if the probe ever costs.
  - `due.mjs` says "floor measurement owed" when a floor file changes after the last measurement.
  - `proofs/2026-10-21-floor-review/who-wakes-here.html` reads `floor/floor.json` as a declared piece file.
  - `node --test _ops/self-description-test/tests/*.test.mjs` passes 27/27.
- **The first measurement:** 2026-10-25 at 4852b2a5, 9,756 tokens (the palace's files 8,845, MEMORY.md 911), 658 before the Jewel. The page's prose still says 11.8k.
- Not verified by the session: the graphic framed by the rich face's piece origin (the page has no rich face); a `/context` table that changes shape; MEMORY.md changes and a new Claude Code don't make the measurement owed.
- **The World mends** (the old part 2) were overtaken on 2026-10-22, when the five World pages were rewritten on his yes: 9131c5bf, b3e1fb41, 7dbc858c, 0bfe76dc, ad8ae5e8, fdada7dc. The drafts file `world-mends — drafts for Loudon.md` is history. Confirm with Loudon and drop the line.

## Next move
(1) **The page's prose**, on Loudon's read. The floor-measure session drafted § The Birth, Measured: drop the date from the heading, add a third row and a pointer.

> The floor as it stands is measured, not typed. `node _ops/self-description-test/floor.mjs` reads Claude Code's own `/context` count for $0. It writes `floor/floor.json` in this page's bundle, which `proofs/2026-10-21-floor-review/who-wakes-here.html` draws from, and adds a dated line to `floor/history.jsonl` whenever the numbers move. A change to any floor file leaves `due.mjs` saying "floor measurement owed" until it is run again.
>
> | | Before the Jewel | The whole floor | In order |
> |---|---|---|---|
> | until 2026-10-21 | 3.0k tokens, 2.3k of it procedure | 14.4k | CLAUDE (with its rules) → Jewel → World → memory 4.5k |
> | from 2026-10-21 | 0.6k | 11.8k | CLAUDE (the birth) → Jewel → World → CHILD 2.5k → memory 1.8k |
> | 2026-10-25, after the World rewrites | 0.7k | 9.8k | CLAUDE → Jewel 0.8k → World 5.4k → CHILD 2.0k → memory 0.9k |

The scroll's Plan would then mark part 1's code done, leaving the page line; that edit needs his yes too.

(2) ~~**The World mends.**~~ Overtaken 2026-10-22; see Current state.

(3) **The map-injection test** (the first baton's part e), still unrun. Wake a page with its local [[Palace Map]] against titles only. Measured 2026-10-20: about 5,750 page greps against about 290 map touches in two weeks of transcripts, mostly maintenance, and no site injects the map. Say the count of births and get a yes before running it.

(4) **Optional: a firmer rate.** Five or more runs each of G4 and S1, born on main against main plus the Jewel line, if Loudon wants the direction confirmed before the World mends.

(5) **After the landing:**
- Post the propagate flag for the moved sections, shown to Loudon first. Decision: CLAUDE.md's four working sections now live in CHILD.md, imported after the World; cite them as [[CHILD]] § …, and the trigger table as CHILD.md's. Home: [[CHILD]]. Rhythm: sweep. Pattern: `CLAUDE(\.md|\]\])? § (A page and its folder|Growing up|Ceremony Triggers|The Palace Voice)|CLAUDE(\.md|\]\])?('s)? (ceremony-trigger |ceremony |trigger |always-loaded trigger )?(table|row|word)`. Paths: `*.md`, `*.js`, `*.mjs` and `*.py`, leaving out session folders, archives, ledgers, diaries, Contexts, batons, scrolls, proofs, runs, sketches, `SCHEMA/SCHEMA — Context.md`, `Closing Well/Closing Well — production plan.md` and `_ops/swarm/test-doc-drift-*.py`. Source: the landing commit. Run from `_ops/` with `python3 -m commons propagate … --dry-run` first.
- Repoint the operator memory that still names CLAUDE.md for what moved: the MEMORY.md line "Spend: measured costs" and the memory files that cite CLAUDE.md's sections (find them with `command grep -l "CLAUDE.md" <the auto-memory folder>/*.md`). Memory sits outside the palace and its commits.
- Loudon updates the live Daily Page task to match `_ops/The Daily Page/The Daily Page — tuning.md` item 53.
- A Sentry sweep before the next push: the 36 child transcripts are now tracked.

(6) **Births owed on fdada7dc or later:** D1, E7, G4, G5 and S1. `due.mjs --session --since 1326e83e` exits owed on all six scenarios; A1 was last born at fdada7dc, the current floor, and the other five at d072a76f, before ad8ae5e8 and fdada7dc changed CHILD and ELDER. Born with `node _ops/self-description-test/birth.mjs --scenario <id> --ref HEAD --budget none` (tuning ledger item 23). Say the count and get his yes first; a close never runs them. The suite is also owed every scenario on Claude Code 2.1.308.

## Offered, not placed (from the floor-measure session)
- **A Closing Well line.** In `_ops/closing-well/prompts/closing-well-agent-map.md`, the due paragraph under-describes exit 2. One sentence to add: "Exit 2 can also mean the session changed a floor file and the floor hasn't been measured since: that one is free (`node _ops/self-description-test/floor.mjs`, then commit what it writes), so name it in the hand-on beside the births."
- `scenarios.mjs` BORN_WITH lists Hilaritas before Modes, but the files load Modes first. Only set membership is used, so it's harmless, but the comment implies an order.
- `proofs/2026-10-21-floor-review/context-probe.mjs` imports from the gone `pacis-floor-242548` worktree. `floor.mjs` replaces it.

## Calibrations from this session
- Draft, then show. A rename drafted mid-sit across six pages was held the moment the scope widened. Showing it first caught an over-fit before it landed.
- The A/B method that worked: headless `claude -p` children in clean folders with `--tools ""`, plus a blind judge given no palace and no tools (`ab-test/run.sh`). Ten children and a judge ran on his yes; say the count and get a yes before fanning out again.
- `gen.py` rebuilds the reader from two birth folders, `before/` and `now/`, that are not in the proofs folder. Rebuild them from git (CLAUDE.md, JEWEL.md and the World files at the two commits) before running it.
- Keep test prompts free of anything about Loudon's day or life. A tracked proof was scrubbed of one this morning.
- Score children on whether they speak up, not on whether they sound like the house.
- Births for a branch's change are born on main plus that change and nothing else. This branch also held S1's opening, its "we want" line and the plan, so a child born on it could have read its own answer key; the later arms were born on scratch commits (11a4cc1b, 49e9f505).
- Two runs a scenario can't separate a nudge from noise. Read the arms by their totals, and ask for five or more runs before calling a rate.

## Load these files first
1. `Palace development/Palace as Context Injection System/Palace as Context Injection System — scroll.md` (the Plan)
2. `Palace development/Palace as Context Injection System.md` § The Birth, Measured
3. `Palace development/Palace as Context Injection System/floor/floor.json` and `_ops/self-description-test/floor.mjs`
4. `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/who-wakes-here.html`
5. `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/births — the order test and the Jewel line.md`
6. `CHILD.md`, `JEWEL.md`, and `ELDER.md` § How loading works

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted, commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. Steward batons are the exception — updated in place, never deleted or closed, until their page ends and the steward leaves stewardship.
