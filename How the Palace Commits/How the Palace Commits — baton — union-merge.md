---
title: "How the Palace Commits — baton — union-merge"
born: 2026-10-18
links:
  - target: "[[How the Palace Commits]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[How the Palace Commits]] — union-merge — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Decide with Loudon how a ledger whose items are edited in place should merge when a branch lands, then build the guard he chooses.

## Why this move matters

`.gitattributes` merges tuning ledgers and diaries by union (lines 4 and 8), on the rule that a ledger only grows ([[SCHEMA — Reference]] §6, "It merges by union", line 235). But tuning items are edited in place when they are paid: Closing Well's items 39, 42, 44 and 46 carry "Paid in …" in their own lines. A union merge keeps both versions of an edited line, and it never conflicts, so `palace-land`'s refusal (the trial merge in `_ops/stigmergy/app/scripts/palace-land.mjs`, near line 148) cannot fire on these files. Twice a careful session was the only guard, and both were fixed by hand: e87fe638 ("Landing as it stood would have left two items numbered 45, and git's union merge would have brought item 44 back in both its owed and its paid form") and b5e36856 ("The union merge had also joined the Wave 2 close's run line to this close's heading").

## Current state

- On 2026-10-18 no tracked tuning ledger on main had a duplicate item number; a read-only sweep checked all 16. Its full report was in scratch and is not kept.
- Two ways of paying an item already live side by side: Closing Well edits the item's own line; the Return appended a new item saying earlier ones are paid (`_ops/Return Ceremony/Return Ceremony — tuning.md`, item 12), and its scroll still lists those items as owed.
- Placement ledgers (`* — placements.jsonl`, `.gitattributes` line 12) are append-only JSONL lines and are not part of this move.

## Next move

Reproduce it first on a throwaway repo carrying this palace's `.gitattributes`: one branch appends an item, another edits an existing item in place, land both with `palace-land`, and read the ledger. Then bring Loudon the choice in plain words. The ways to weigh include a check after a landing that names a duplicate item number, an item present twice, or a joined line in any union-merged ledger the landing touched; paying an item with an appended line instead of an edit, which changes the ledger rule and so needs a Schema Ceremony; or a merge driver of the palace's own. None is chosen.

## Calibrations from this session

- Loudon asked for a baton here, not a weave flag (2026-10-18).
- Loudon, 2026-10-18, of three review rounds for a check that never raises above medium: "I think that is heavy", more than the stakes deserved.

## Load these files first

1. `.gitattributes`
2. [[SCHEMA — Reference]] §6, Ledgers
3. `_ops/stigmergy/app/scripts/palace-land.mjs`, and [[How the Palace Commits]] § The path
4. `git show e87fe638 b5e36856`
5. `Closing Well/Closing Well — tuning.md` items 39 to 47, and `_ops/Return Ceremony/Return Ceremony — tuning.md` item 12

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
