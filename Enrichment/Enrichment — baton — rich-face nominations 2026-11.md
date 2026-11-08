---
title: "Enrichment — baton — rich-face nominations 2026-11"
born: 2026-11-08
links:
  - target: "[[Enrichment]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Enrichment]] — rich-face nominations 2026-11 — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Enrich the five pages the November 2026 weave nominated for a rich face, one at a time: [[The Shop]] · [[Palace Enchantment]] · [[Closing Well]] · [[Cross-Domain Resonances]] · [[Quality Manifesto]]. Loudon, 2026-11-08, at the weave's close: "post for enrichment."

## Why this move matters

The weave's bundle audit ranks pages ready for Enrichment by weight: mature or fruiting, well pointed-at, wearing a face, with no manifest yet, and a body that names something that can only be shown, heard or played. These five led the ranking (scores 4–5; inbound 54, 25, 19, 18, 38). Each makes a claim text cannot carry alone: The Shop (a roster of Specialists you can hear and see at work), Palace Enchantment (a page waking as an agent and writing back), Closing Well (a close read cold beside the day it closes), Cross-Domain Resonances (the bridges as pairs to play), Quality Manifesto (the felt question, "how do you feel?", asked of a thing just made).

## Current state

No manifest (`— rich.json`) exists on any of the five. [[Enrichment]] is the ceremony; the forward vector is the brief; a piece must test the text rather than decorate it; the proposal round (`status: proposal`, Loudon's approval alone) is how new pieces arrive. The models are the faces that exist — Kuramoto Coupling, Language as a Tonal Medium, SUBSTRATE, STIGMERGY, and the 2026-11-03/04 proposal round's five. The weave's report, `_ops/swarm/sessions/weave-2026-11-08/Weave Report — 2026-11-08.md` § Rich-face nominations, names them; `bundle-audit.py` reprints the ranking.

## Next move

Say "enrich The Shop" (or whichever Loudon picks first) and run Enrichment; close this card with `--partial --remainder` naming the pages left, so each face is its own pickup. FOUR PILLARS, Hilaritas Generator and Cooperation Yields Agency scored as high and were held back on purpose, as in October: floor pages every agent reads at birth; a face there is Loudon's call, not this baton's.

## Calibrations from this session

Fewer, better: one piece that tests the page's central claim beats three that decorate it. Keep the plain `.md` plain. The Shop's face should show the Specialists' own work, not a picture of a shop; Closing Well's should put the cold read beside the warm one.

## Load these files first

`Enrichment.md` · `_ops/rich-face/README.md` · the nominated page and its bundle · `_ops/swarm/sessions/weave-2026-11-08/Weave Report — 2026-11-08.md` § Rich-face nominations · `python3 _ops/swarm/bundle-audit.py` (the ranking)

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
