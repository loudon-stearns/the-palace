---
title: "Palace Ceremonies — baton"
born: 2026-09-26
links:
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: "baton-for"
  - target: "[[Palace Ceremonies — sketch — propagation plan]]"
    type: connects-to
    label: "follows"
  - target: "[[SCHEMA — Context]]"
    type: connects-to
    label: "decided-in"
  - target: "[[The Scroll]]"
    type: connects-to
    label: "shared-machinery"
  - target: "[[Revival Ceremony — baton]]"
    type: connects-to
    label: "sibling-question"
forward_vector: "I carry the in-progress move on [[Palace Ceremonies]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Palace Ceremonies

## Move
Grow the first ledgers on pages that aren't ceremonies, one at a time on Loudon's yes: the two pilots first, then the proposals. The waves are laid out in [[Palace Ceremonies — sketch — propagation plan]] (Wave 3).

*Provenance: posed 2026-09-26, widened 2026-09-27, answered by Loudon 2026-10-14/15. The canon half landed 2026-10-15 as the v1.28 Schema Ceremony (`ec1a3b11`) and the Daily Page split (`d598db29`); the code followed the same day (Wave 2: `8899b03c`, `b12b1f13`, `323e0be7`, and the canon notes that waited on it, `1641291f`). This baton carries the rest. What was decided, and why, is now canon: [[SCHEMA — Context]] § v1.28. Earlier versions of this baton, with the survey's questions, the two days' disagreements and the Wave 2 file list, are in git.*

## Why this move matters
Canon says a ledger is a family any page may keep, and a ceremony is a page carrying `trigger:` ([[SCHEMA]] §1; [[SCHEMA — Reference]] §6, §8), and since Wave 2 the code agrees. A page with a tuning ledger and no `trigger:` lists under PAGES on the PROJECTS deck as itself, keeps a Plan and its standing orders on its scroll, and takes a one-shot order into its ledger as owed (`_ops/stigmergy/app/server/projects.js`; `orchestrator/src/scroll-file.js`, `ledger.js`). A stewarded page with a ledger gets a run line every cycle and can offer a lesson (`process-cycle.js`; `_ops/orchestrator/prompts/shared.md`). So a ledger can now be grown on any page safely; none has been yet.

## Current state
- **Canon: landed.** Ledgers state their standards in frontmatter (`ledger`, `standards`); all fifteen existing ledgers and the two diaries carry them. Fourteen ceremonies carry `trigger:` (Closing Well's on the practice page; the trigger table names the card). Brian Eno's and John Cage's records are now `— diary.md`. The Daily Page's ledger is split: tuning tracked, diary private.
- **Code: landed** (Wave 2). A ceremony is found by `trigger:` everywhere: the deck, the canon guard, the commit hook, `lint-doc-drift` W2. One materializer and one Now for every page, from what it has (the board when it is stewarded or a project, the runs from a tuning ledger, the last encounter from a diary). A Plan on every scroll; standing orders on the scroll, one-shot orders owed in the ledger. Run lines come from steward cycles (`process-cycle.js`), the face maker (`regen-lane.js`) and the Shop's smoke tests (`Shop/Maker/run-tests.mjs`, which no longer writes `last_tested`); the baton executor writes a qualifier and the `targets` link. The thirteen tracked ceremony scrolls were re-made.
- **New ledgers: the two pilots landed 2026-10-16.** The Hero and Avatar Maker's (`e36d8efd`: 25 items seeded, one present-tense Gotchas list on the page, `last_tested` off) and Generative Sample Libraries' (ten lessons seeded from `DESIGN.md`). Neither has had its first run line yet. The proposals and their traps are the plan's Wave 3b; lessons held only in operator memory are 3c.
- **Stewards and ledgers, decided 2026-10-16 and simplified the same day** (recorded on [[Project Stewardship System]] § What's Decided). A Fable review found the first version over-built: debt tags by who pays, a threshold of three borrowed from an unrelated finding, and escalation asks that wouldn't make Loudon listen. Loudon chose the simpler design: what a cycle leaves rough stays on the scroll's trail, and Now lists the rough notes that recur, oldest first. The ledger keeps run lines and lessons. Whether a steward grows its own ledger, and folding settled lessons back, are held open.

## Next move
0. ~~**The steward-ledger code**~~ Landed 2026-10-16 (`1921ee8b`): Now lists recurring left-rough notes, oldest first; the first design is backed out. Check it on GSL's next cycle (39).
1. **Wave 3a, the pilots**: the Hero and Avatar Maker's tuning ledger (seeded from its two lists and the 2026-09-26 faces lessons, which are in this baton's git history at `fe3a8216`), then GSL's (from the lesson sections of `ai-source-probe/DESIGN.md`). Each page's first face or cycle after its ledger lands should leave a run line by itself; check that it did. Both 2026-10-15 answers below first bite here: the Maker's `last_tested` comes off its frontmatter in the commit that lands its ledger, and GSL's first ledgered cycle files its steward's lesson straight into the ledger.
2. **Wave 3b and 3c**, one ledger at a time, each on Loudon's yes; the test for each: would a worker who ignored the line today be wrong? If so it stays on the page.

## Still open (from 2026-10-14)
- how many recurrences earn a change to what a page wants ([[The Remembering Page]]: a clean same-direction drift by the third, one pair, one topic);
- what one run is when three or more pages meet;
- whether a diary settles between molts, for a page lived often that never changes;
- whether the Schema Ceremony, which has no page and no trigger words in CLAUDE.md, should learn from its runs.

## Calibrations
- Loudon (10-14): "Write it loosely so pages can innovate, don't over-specify and allow pages to even use them outside of spec so that we have examples to grow with."
- Loudon (10-14): "All ledgers, regardless of what they are used for, should state in the file the standards and practices for that ledger."
- Loudon (09-26): "We must not get myopic around the shop and adding a specific carve out for it."
- Loudon (10-15): "May a steward's offered lesson go straight into its page's ledger,, yes." The cycle files it as a numbered item tagged "*(offered by the steward, cycle N)*" (`recordRun` in `ledger.js`), with no elder's read first. For this case it settles the tension with CLAUDE.md § A page and its folder (a child writes no memory).
- Loudon (10-15), on `last_tested` and `last_gotcha`, which nothing writes since Wave 2: "retire page by page." Each comes off a page when that page grows a tuning ledger, whose run lines say when it last ran. Not a sweep: until then the values stay as they are, frozen.
- Loudon (10-16), after the review: "drop the debt tags, threshold and escalation, and instead have Now list recurring left-rough notes oldest first."
- A woken page is a child: its diary is written by the coordinator, in its own words, never by the page unwatched; never backfilled from a transcript.
- The Daily Page's diary is private by Loudon's word; nothing of him goes in a tracked file.

## Load these files first
1. [[SCHEMA — Context]] § v1.28, and [[SCHEMA — Reference]] §6 and §8.
2. [[Palace Ceremonies — sketch — propagation plan]], Wave 3.
3. [[Palace Ceremonies — sketch — runs survey]], § A2 (where each candidate's runs and lessons live today). Its § The code, once describes the code before Wave 2.
4. The header comments of `_ops/stigmergy/orchestrator/src/ledger.js` (how a new ledger is read), `scroll-file.js` and `_ops/stigmergy/app/server/projects.js`.

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
