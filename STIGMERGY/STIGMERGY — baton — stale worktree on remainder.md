---
title: "STIGMERGY — baton — stale worktree on remainder"
born: 2026-10-25
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[STIGMERGY]] — stale worktree on remainder — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Clear the STIGMERGY card's dead coordinate: the handoff reader has to honour RETRACT, and SCHEMA has to say whether RETRACT covers a card that went stale rather than one posted in error.

## Why this move matters

The rich-face pieces card (`stigmergy-remainder-20261021T125648Z`) still sends its catcher to `close/2026-10-13-handoffs` at `/Users/loudonstearns/Documents/palace-close-2026-10-13`, a worktree that no longer exists. The board is append-only, so the line can't be edited, and nothing today retires a stale coordinate without closing the card's work.

## Current state

The first half of this move landed in `22c39e74` (branch `claude/stale-worktree-remainder-4a8a3b`, `a679331f`). `close-handoff.mjs` now carries a worktree to a remainder only while `worktreeLive()` in `handoff-model.mjs` says it lives, and resets a `receiving_surface` that names the dead folder. So the next partial close of any card drops a dead coordinate by itself. The STIGMERGY card itself is untouched, on Loudon's word of 2026-10-25: "Leave the STIGMERGY card's dead coordinate for later." The catching session's draft is in this bundle, copied verbatim on 2026-10-25: `STIGMERGY/STIGMERGY — sketch — clearing a dead coordinate.md` ([[STIGMERGY — sketch — clearing a dead coordinate]]). It recommends a RETRACT and a repost, with the fold taught to honour RETRACT, and names the canon question that comes first.

## Next move

Wait for Loudon. When he picks it up: read the draft, then [[SCHEMA — Reference]] §9 on `RETRACT` ("posted in error"). Bring him the SCHEMA question first, since a widened `RETRACT` is a wire change. Then teach `handoff-model.mjs`'s fold to honour it.

## Load these files first

`_ops/stigmergy/handoff-model.mjs` · `_ops/stigmergy/close-handoff.mjs` · [[SCHEMA — Reference]] §9 · [[STIGMERGY]] § Handoff Lifecycle

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
