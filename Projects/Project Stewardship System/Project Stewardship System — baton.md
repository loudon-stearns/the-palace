---
title: "Project Stewardship System — baton"
born: 2026-10-13
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Project Stewardship System]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Project Stewardship System — how does a project leave stewardship?

## Move
Design a retirement rite with Loudon for projects that leave stewardship, then run it once.

## Why this move matters
It came up on the first Daily Page morning (2026-10-13), when the page dealt was the Frequency-Time Explorer and the verdict was to fold it into Frequency-Time Duality. The question was whether stewardship applied to the Explorer. It did not: the Explorer was never stewarded. `_ops/agents/permanent/` has no slug for it, so nothing needed retiring that day.

But it exposed a gap. The [[Project Stewardship System]] describes births and plan revisions and says nothing about retirement. Steward batons are never closed. A folded or composted project that had a steward would leave its scroll, runtime slug, open asks and plan standing with nothing to say they are done.

## The questions
How does a project leave stewardship?
- What becomes of its scroll?
- What becomes of its runtime slug?
- What becomes of its open asks?
- What becomes of its plan?

## Current state
Nothing designed and nothing decided. Facts only: no retirement text exists in the Stewardship System, the Explorer case did not exercise it, and no steward has yet retired.

## Next move
Design the rite with Loudon in the room, since the plan changes only with his yes, then run it once on a real case. Do not invent the rite alone.

## Calibrations
- This baton is a question carried forward, not a plan. Hold it open until Loudon wants it.
- Check whether any steward exists today that a fold or compost would touch; that is the first real case.

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
