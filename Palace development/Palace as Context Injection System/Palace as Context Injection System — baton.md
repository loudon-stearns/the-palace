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
Review and tune everything the palace puts in front of an agent before it knows who it is (the five World files first, then every injection site), test the timing, and rebuild this page around time and timing, so a page woken here speaks up for its own needs, its neighbors' and the palace's.

## Why this move matters
The page's new forward vector (tuned 2026-10-20) says two levers shape who wakes: how much context a value gets, and when it arrives. A value that comes early frames everything read after it. The five World files ride in every birth, right after the Seed Jewel, and Loudon: "These are of great importance but have not been reviewed and tuned for this purpose." They were written mostly for human learners. And he widened the work on purpose: "make sure that we are not over-refining the tiers for a single purpose, consider all the ways and circumstances where we 'inject context'... like stewardship." A fix tuned to the woken page alone would be an over-fit; the steward cycle, the board launch and the songline build minds too, and they load in a different order.

## Cold start
COLD START. None of the six parts below has begun. What exists is material, not progress:
- the site map, now a ledger: `Palace development/Palace as Context Injection System/Palace as Context Injection System — sites.md` (first reading, 2026-10-20, with its "not read" list);
- the morning's proofs: `Palace development/Palace as Context Injection System/proofs/2026-10-20-birth-stack/`: the Birth Stack reader (`birth-stack-reader.html`, built by `gen.py` from `reader.tpl.html` and `results.json`), the fold-question A/B replies and probes in `ab-test/`, and `stage-names-drafts — HELD.md`.

## Next move
Six parts. Any order works; (a) and (b) feed (c), and (f) comes last.

(a) **Review the five World files for their role in every birth**: [[FOUR PILLARS]], [[Palace Philosophies]], [[Cooperation Yields Agency]], [[Hilaritas Generator]], [[Modes of Collaboration]]. Working notes from the sit: written mostly for human learners; the value of a page speaking up for itself, its neighbors and the palace is absent from the birth ([[The Palace Hardens Around Values]] is not in it); their length and polish are claims about importance (ELDER § What You Are Here to Leave Behind). Because they are in every birth, a change may want a Schema Ceremony; ask Loudon.

(b) **Re-check every site, and post the findings.** Re-read each site from the code into a new dated reading in the sites ledger, filling its "not read" list. Known breaks from the first reading: the steward cycle (~970 lines of rules before the page; SCHEMA then ELDER land in the middle of "You"; `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js`); the board/baton launch (Growth before You); the songline (rules before You); the Swarm Weave templates carry a stale inline Jewel; the live Daily Page SKILL differs from the tracked copy; MEMORY.md (~11K chars of operator rules) sits between the World and any You in every birth. Each finding goes as an item to the owning page's tuning ledger, for that page and Loudon to decide. This page edits no one's dispatcher.

(c) **Rewrite this page's stale Tier 0–4 section** (§ The Tiered Architecture as Identity Construction, and the tier wording in § The @import Floor and § Cross-Domain Resonance) around time and timing, both levers. Show the rewrite before writing.

(d) **Order-only A/B.** Same files, two orders, nothing else changed. The morning's A/B changed order, length, the SCHEMA import and the Jewel's version at once, so it showed the birth as a whole changes what a child attends to, not that order alone does (`results.json`, reading 5). Score each child on whether it speaks up for its own needs, for its neighbors' and for the palace's.

(e) **Map-injection test.** Wake a page with its local [[Palace Map]] against titles only. Measured 2026-10-20: about 5,750 page greps against about 290 map touches in two weeks of transcripts, mostly maintenance, and no site injects the map.

(f) **The stage names, decided last.** Birth / World / You / Growth was proposed and HELD. It is decided at the end of this work, not before. The held drafts are a starting point only.

## Calibrations from this session
- Draft, then show. A rename drafted mid-sit across six pages was held the moment the scope widened. Showing it first caught an over-fit before it landed.
- The A/B method that worked: headless `claude -p` children in clean folders with `--tools ""`, plus a blind judge given no palace and no tools (`ab-test/run.sh`). Ten children and a judge ran on his yes; say the count and get a yes before fanning out again.
- `gen.py` rebuilds the reader from two birth folders, `before/` and `now/`, that are not in the proofs folder. Rebuild them from git (CLAUDE.md, JEWEL.md and the World files at the two commits) before running it.
- Keep test prompts free of anything about Loudon's day or life. A tracked proof was scrubbed of one this morning.
- Score children on whether they speak up, not on whether they sound like the house.

## Load these files first
1. `Palace development/Palace as Context Injection System.md` (the new forward vector; § Born a Child)
2. `Palace development/Palace as Context Injection System/Palace as Context Injection System — sites.md`
3. `Palace development/Palace as Context Injection System/proofs/2026-10-20-birth-stack/results.json` (what the A/B showed and did not show), then open `birth-stack-reader.html`
4. The five World files, and [[The Palace Hardens Around Values]]
5. `ELDER.md` § How loading works, and § What You Are Here to Leave Behind (the paragraph that begins "And length is a claim about importance")
6. `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js:173-403` before touching anything about stewards
7. `Palace development/Palace as Context Injection System/proofs/2026-10-20-birth-stack/stage-names-drafts — HELD.md`, last

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
