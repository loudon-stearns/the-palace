---
title: "The Daily Page — baton — answers-back"
born: 2026-11-07
links:
  - target: "[[The Daily Page]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[The Daily Page]] — answers-back — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move
Find one answers-back path that always works for a page that asks Loudon something, so his answers reach the session whichever browser he opens it in.

## Why this move matters
Loudon, 2026-11-07, in his words: "I get confused, when I start from claude desktop and I open a page in chrome you don't seem to be able to read the page, but then when I open in the claude desktop browser you can, but that often constrains page width and chrome is much better. I don't think we have found the perfect way for a page to communicate back to you so I can be confident it always works, or maybe I am just confused, I would like a consistent solution."

The Daily Page owns the rule: its prep step 5 says a rough that asks him anything hands his answers back with no retyping ([[The Daily Page — tuning]] item 71).

## Current state
- **What worked:** the copy button. The Blind Sort copied his answers out as one block and he pasted them; nothing depended on the page keeping its state (tuning item 84).
- **What failed:** the browser pane dropped a rough's answers, likely by reloading its static snapshot (item 74). The Lens's Woken Glasses lost its answers path a different way: he played it in Chrome, and the session cannot read a Chrome tab without the browser extension, so `window.lensResults` never reached it ([[The Lens — tuning]] item 14).
- **Negative space:** a Chrome tab is unreadable to the session without the extension; the Claude desktop pane is readable but constrains page width. Neither is the answer alone.
- **Untested options the room named:** a published claude.ai Artifact with `db`, read back by ArtifactData; a local endpoint that writes his answers to a file in the page's bundle.

## Next move
Lay the options side by side for Loudon (the copy button, the Artifact with `db`, the local endpoint), each with what it costs and where it breaks. Prove the one he picks on a real rough in Chrome, then write it into prep step 5 on his yes.

## Calibrations from this session
- He asked for consistency, not a clever path: one way he can trust every time.
- Neither new option has been tried. Do not describe either as working until a rough has proved it.

## Load these files first
1. `_ops/The Daily Page.md`, § Before Loudon arrives, step 5.
2. [[The Daily Page — tuning]], items 71, 74, 84.
3. [[The Lens — tuning]], items 8 and 14.

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
