---
title: "Review Layer — baton"
born: 2026-11-07
links:
  - target: "[[Review Layer]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Review Layer]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Review Layer

## Move

Fix the rich face's review dock. Make it say plainly that a note was sent, clear the notes once they are sent, refuse to send twice, and put each section's note box at the foot of its section instead of the top.

## Why this move matters

Loudon, 2026-11-07, at the Daily Page, after reviewing the Pheromone Trail face. Verbatim:

> "they landed twice because I clicked twice, I received no confirmation that the message was sent and all my notes stayed after sending, so a comment about how rich face sends review is in order, give clear confirmation, and remove comments. Also all review should be placed at the bottom of each section instead of top of each section. Consider the user we read a section and then review it, so it is natural for the review to be at the bottom of a section."

The proof is on the board: `human-eval-rich-face-Pheromone-Trail-round-1-1794064470012` and `…-1794064472815` hold the same notes, sent 2.8 seconds apart. A dock that doesn't confirm invites a second click. A note that stays in the box after sending looks unsent, and it gets sent again in the next round.

## Cold start

COLD START: no work has begun, and no fix has been tried. What follows is the code as it stands, from reading `_ops/rich-face/rich.js` at `fc7b232a`:

- **Send** (`rich.js:528-536`) shows "Sending…" and then a one-line message, `On the board — <id>…`, in `#dock-msg`. It never disables the button while the request is in flight, and nothing stops a second click.
- **The notes stay after sending.** Each section's note lives in `localStorage` under `richface:<Entry>:r<round>:<section key>` (`noteKey`, `rich.js:497`), with the whole-page note under `__overall` and approvals under `…:approve`. Nothing clears them after a send that worked. The section pins stay "◆ note" too.
- **The note box sits at the top of its section.** The pin goes in the section's `flags` and the box goes right after the section label, `label.after(box)` (`rich.js:443-462`), above the prose and the pieces.
- The page is served by `rich.html`, whose dock styles are at `:140-151`. The send goes to `POST /_api/review`: `rich-handler.mjs:286` when the face runs standalone, and `_ops/stigmergy/app/server/api/rich.js` inside STIGMERGY. One renderer serves every face, so a single fix reaches them all ([[Review Layer]] § Kinship with Enrichment).

## Next move

Work in a worktree of your own. In `rich.js`:
- Disable Send while the request is in flight.
- On success, show a confirmation he can't miss. Show it in the dock and, if the dock is collapsed, where he is reading.
- Clear the sent notes and approvals from `localStorage` and reset the pins. On failure, keep the notes.
- Move each section's note box, and the pin that opens it, to the end of the section, after its last row of pieces.

You might also guard on the server, refusing a body identical to one posted moments before, but that is optional; the client guard is what he asked for. Prove it in a headless browser: one click sends one message, the boxes empty, and a failed send keeps the notes. Do it before you land, through the palace committer by path. Show Loudon the dock before you call it done.

## Calibrations from this session

- His frame for where the box goes is the reader's order: you read a section, then you review it.
- He has asked that rich faces be more playful and bold (Enrichment's scroll, Standing Orders). The dock is part of the face, so let the confirmation have some life, but keep it clear first.

## Load these files first

1. `_ops/rich-face/rich.js` (`:443-462`, `:495-537`)
2. `_ops/rich-face/rich.html` (the dock markup and styles)
3. `_ops/rich-face/README.md`
4. [[Review Layer]] § How the answers come back, § Kinship with Enrichment
5. `_ops/stigmergy/app/server/api/rich.js` and `_ops/rich-face/rich-handler.mjs:286` (the review endpoint)

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
