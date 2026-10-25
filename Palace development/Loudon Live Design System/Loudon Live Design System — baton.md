---
title: "Loudon Live Design System — baton"
born: 2026-10-14
links:
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Loudon Live Design System]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
session_thread: "The Daily Page, 2026-10-14 (Loudon Live dealt), a commissioning baton. Rewritten 2026-10-25 at the second partial close to carry only the last question (board: loudon-live-design-system-remainder-20261025T152759Z)."
---

# Baton: Loudon Live Design System

## Move

Ask Loudon whether Drafting Table's own "Never cyan" goes, now that Loud'n Live has retired it. Write nothing until he answers.

## Why this move matters

On 2026-10-25 the Loudon Live Design System retired "no cyan" (`3c817503`), and its Cyanotype look wears the [[Drafting Table Design System]]'s grammar on a cyan ground (`9a7f3d18`). Drafting Table itself still says "Never cyan" (`_ops/drafting-table/design-system/README.md:59`). The two dresses now disagree about one colour. That may be right, since Drafting Table dresses the work itself and not the public channel, but it is his call and he has not made it. Everything else this baton carried has landed: three looks (`3c817503`, `9a7f3d18`, `42dc4091`) and the text catch-up to the 2026-10-14 portrait (`863a34d1`).

## Next move

Put the question to him plainly, with both readings: keep "Never cyan" for the work itself (the dresses differ on purpose), or retire it there too. If he retires it, find every place Drafting Table restates the rule (its README, SKILL, tokens comments, the canon page) before editing, and land it through the Concierge.

## Load these files first

1. `_ops/drafting-table/design-system/README.md` (line 59) and `Palace development/Drafting Table Design System.md`.
2. `Palace development/Loudon Live Design System.md` § Looks, the Cyanotype paragraph.

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
