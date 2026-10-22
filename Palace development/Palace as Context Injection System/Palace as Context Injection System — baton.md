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
Finish the floor work Loudon agreed on 2026-10-21: build the floor measurement so this page's numbers keep themselves true, place the World mends on his read of their draft, run the map-injection test, and carry the chores that follow the landing, so a page woken here speaks up for its own needs, its neighbors' and the palace's.

## Why this move matters
The page's new forward vector (tuned 2026-10-20) says two levers shape who wakes: how much context a value gets, and when it arrives. A value that comes early frames everything read after it. The five World files ride in every birth, right after the Seed Jewel, and Loudon: "These are of great importance but have not been reviewed and tuned for this purpose." They were written mostly for human learners. And he widened the work on purpose: "make sure that we are not over-refining the tiers for a single purpose, consider all the ways and circumstances where we 'inject context'... like stewardship." A fix tuned to the woken page alone would be an over-fit; the steward cycle, the board launch and the songline build minds too, and they load in a different order.

## Cold start
State at the end of 2026-10-21. Most of the agreed plan is made, on branch `claude/pacis-floor-242548`, which the supervisor lands:
- CLAUDE.md's working sections live in [[CHILD]], imported after the World (5de78ac2), and the Jewel carries its v1.3 sentence (ebf1cff1).
- The 36 memory-free births across three arms are graded and recorded (d3e6e4c7; the record is `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/births — the order test and the Jewel line.md`). Order alone lost nothing and gained a little, not beyond chance; the Jewel's sentence pointed the same way, still thin.
- Every site finding is with its owner, seven of them in five tuning ledgers minted on his yes (8c22741a, 1d7f4af3), and the sites ledger has its second reading.
- The no-ceremony decision is recorded in [[ELDER]] and [[SCHEMA — Context]], and the Daily Page's line on foundational pages now agrees with SCHEMA — Reference §5 (eceef192).
- This page is rebuilt around time and timing, on his read of the preview (326472f4). The tier numbers retired on this page only; no other page was renamed.
- Operator memory is cut to one-line hooks (outside the palace).
- The scroll's Plan holds the agreed plan and what is open.

Not begun: the floor measurement, which Loudon made the next move ("land it first, and place making this script the plan in the page's scroll"); the World mends, which wait for his read; and the map-injection test.

## Next move
Five parts. (1) can start now; (2) waits on Loudon; (3) and (4) can run any time, each on a yes for its count; (5) follows the landing.

(1) **The floor measurement.** Nothing keeps this page's numbers current, so they drift as soon as the World pages change. Four parts:
- **The script.** It runs the same $0 `claude -p /context` probe (`Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/context-probe.mjs` is the start) and writes one floor data file: each floor file's tokens in the order they load, the total, the commit, the Claude Code version and the date.
- **The graphic.** `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/who-wakes-here.html` reads that file, declared as a piece file, instead of numbers typed into its script.
- **The page.** Its prose keeps only dated results, and points at the data file and the graphic for the floor as it stands.
- **The due checker.** `_ops/self-description-test/due.mjs` already notices any change to a floor file; it also lists "floor measurement owed", so a close asks for it the same way it asks about births.

Its limit: the size of each agent's own prompt stays in the sites ledger's dated re-readings, unless that is scripted later by loading each builder.

(2) **The World mends, placed on Loudon's read** of `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/world-mends — drafts for Loudon.md`. They include making CLAUDE.md's "That is the whole of what you are born with" true. Show each before writing; every World edit goes through the Concierge.

(3) **The map-injection test** (the first baton's part e), still unrun. Wake a page with its local [[Palace Map]] against titles only. Measured 2026-10-20: about 5,750 page greps against about 290 map touches in two weeks of transcripts, mostly maintenance, and no site injects the map. Say the count of births and get a yes before running it.

(4) **Optional: a firmer rate.** Five or more runs each of G4 and S1, born on main against main plus the Jewel line, if Loudon wants the direction confirmed before the World mends.

(5) **After the landing:**
- Post the propagate flag for the moved sections, shown to Loudon first. Decision: CLAUDE.md's four working sections now live in CHILD.md, imported after the World; cite them as [[CHILD]] § …, and the trigger table as CHILD.md's. Home: [[CHILD]]. Rhythm: sweep. Pattern: `CLAUDE(\.md|\]\])? § (A page and its folder|Growing up|Ceremony Triggers|The Palace Voice)|CLAUDE(\.md|\]\])?('s)? (ceremony-trigger |ceremony |trigger |always-loaded trigger )?(table|row|word)`. Paths: `*.md`, `*.js`, `*.mjs` and `*.py`, leaving out session folders, archives, ledgers, diaries, Contexts, batons, scrolls, proofs, runs, sketches, `SCHEMA/SCHEMA — Context.md`, `Closing Well/Closing Well — production plan.md` and `_ops/swarm/test-doc-drift-*.py`. Source: the landing commit. Run from `_ops/` with `python3 -m commons propagate … --dry-run` first.
- Repoint the operator memory that still names CLAUDE.md for what moved: the MEMORY.md line "Spend: measured costs" and the memory files that cite CLAUDE.md's sections (find them with `command grep -l "CLAUDE.md" <the auto-memory folder>/*.md`). Memory sits outside the palace and its commits.
- Loudon updates the live Daily Page task to match `_ops/The Daily Page/The Daily Page — tuning.md` item 53.
- A Sentry sweep before the next push: the 36 child transcripts are now tracked.

## Calibrations from this session
- Draft, then show. A rename drafted mid-sit across six pages was held the moment the scope widened. Showing it first caught an over-fit before it landed.
- The A/B method that worked: headless `claude -p` children in clean folders with `--tools ""`, plus a blind judge given no palace and no tools (`ab-test/run.sh`). Ten children and a judge ran on his yes; say the count and get a yes before fanning out again.
- `gen.py` rebuilds the reader from two birth folders, `before/` and `now/`, that are not in the proofs folder. Rebuild them from git (CLAUDE.md, JEWEL.md and the World files at the two commits) before running it.
- Keep test prompts free of anything about Loudon's day or life. A tracked proof was scrubbed of one this morning.
- Score children on whether they speak up, not on whether they sound like the house.
- Births for a branch's change are born on main plus that change and nothing else. This branch also held S1's opening, its "we want" line and the plan, so a child born on it could have read its own answer key; the later arms were born on scratch commits (11a4cc1b, 49e9f505).
- Two runs a scenario can't separate a nudge from noise. Read the arms by their totals, and ask for five or more runs before calling a rate.

## Load these files first
1. `Palace development/Palace as Context Injection System/Palace as Context Injection System — scroll.md` (the Plan, and today's trail)
2. `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/world-mends — drafts for Loudon.md`
3. `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/births — the order test and the Jewel line.md`
4. `Palace development/Palace as Context Injection System.md` (rebuilt: § Two Levers, § The Moments of a Life, § The Birth, Measured)
5. `Palace development/Palace as Context Injection System/Palace as Context Injection System — sites.md` (the 2026-10-21 reading)
6. `CHILD.md`, `JEWEL.md`, and `ELDER.md` § How loading works
7. `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/context-probe.mjs` (the $0 probe the script starts from)
8. `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/who-wakes-here.html` (the graphic that will read the data file)
9. `_ops/self-description-test/due.mjs` (where "floor measurement owed" goes)

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted (authored on a surface that couldn't commit — e.g. Cowork), commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it (the [[Surfaces and Capabilities]] catalog can be stale) — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
