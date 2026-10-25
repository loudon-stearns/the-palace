---
title: "Palace To-Do — baton"
born: 2026-10-25
links:
  - target: "[[Palace To-Do]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Palace To-Do]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Retire the Palace To-Do in favour of handoffs: turn each of its 25 open items into its own baton announced on the board, or release it with the reason, and let the page go. Loudon, 2026-10-25: "Create a handoff for the to-do's and to retire 'to-do' entirely in favor of handoffs."

## Why this move matters

The To-Do was the palace's toss-bucket; the board's handoffs are its unit of continued work, with a lifecycle (open → claimed → closed) and a mover. A list with no mover grows (33 open against its own cap of a dozen on 2026-10-24); a baton either gets caught or visibly fumbles. The Weave's Step 6 now walks the open handoffs, not a list.

## Current state

`_ops/Palace To-Do.md` is `stage: composting` since the 2026-10-24 weave, with 25 open items under four headings; the 2026-10-24 walk's dispositions (KEEP with priority, ASK-LOUDON ×4) are in `_ops/swarm/sessions/weave-2026-10-24/`'s To-Do report (the walker's list) and the released items sit in `_ops/Palace To-Do/Palace To-Do — Archive.md` under "Released by the 2026-10-24 weave". Live pages that still point readers at the To-Do: README - The Palace Guide, ROSETTA, Deposit Ceremony, Baton Ceremony, Return Ceremony, BBS Design System, Loudon Live, Palace Enchantment, Haptic Handwheel, Loudon's Toolkit — context — assessment, Frequency-Time Duality — baton (the propagate flag of 2026-10-25 names them).

## Next move

1. For each open item, in the order the walk ranked them: write a baton in the owning entry's bundle (the item names its page; an item with no page becomes a baton on the ceremony or tool it is about) with a one-sentence move, and announce it (`_ops/closing-well/baton-executor.mjs --write --post`). An item that is really a question for Loudon becomes a `RESOURCE_REQUEST` on the TRICKSTER board, not a baton. An item nobody would catch is released into the Archive with the reason.
2. When the card holds no open item, delete `_ops/Palace To-Do.md` (its Archive stays as history in the bundle) and carry the propagate flag: every live pointer to the To-Do now points at `list-handoffs` and the Baton Ceremony.
3. Close this card citing the commit.

## Calibrations from this session

A baton carries a move, not a wish: if an item cannot be stated as one sentence a catcher could act on, it is a question or a release. Do not post 25 batons in one sitting without Loudon seeing the list — show him the batch, as a deposit would.

## Load these files first

`_ops/Palace To-Do.md` · `_ops/Palace To-Do/Palace To-Do — Archive.md` · `_ops/Baton Ceremony.md` § Where the Baton Lives and § Announcing · `STIGMERGY.md` § Handoff Lifecycle · `_ops/closing-well/baton-executor.mjs` (header)

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
