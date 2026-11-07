---
title: "The Daily Page — baton — dealer-ghosts"
born: 2026-11-04
links:
  - target: "[[The Daily Page]]"
    type: connects-to
    label: "baton-for"
  - target: "[[deal.py]]"
    type: connects-to
    label: "targets"
forward_vector: "I carry the in-progress move on [[The Daily Page]] — dealer-ghosts — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

`_ops/daily-page/deal.py` resolves bundle pages and path-qualified links, so real links stop reporting as forward ghosts.

## Why this move matters

The Daily Page tuning items 59, 63 and 89, verbatim:

> 59. **The dealer reports real links as forward ghosts.** `deal.py` listed [[BLUELINE — Text Layer]] and [[Shop/Lettering]] as ghosts; both exist (`Projects/BLUELINE/BLUELINE — Text Layer.md`, `Shop/Lettering.md`). Its resolver seems to miss subfolders and path-qualified links. **Carried to handoff the-daily-page-dealer-ghosts-handoff-2026-11-03 on 2026-11-03.**

> 63. **Item 59 seen again, and earlier.** The 10-19 outside read called `[[Shop/Blender]]` a forward ghost and offered its repair as an owed edit. `Shop/Blender.md` exists, added on 2026-06-13. The dealer's entry map is keyed by title, so it holds `Blender` but not `Shop/Blender`, and its brief would print the link as a ghost. That is the likely source; the prep's transcript was not read to confirm it. The Concierge checked this with `entry-use.py`'s `_entries` and caught the false ghost before the baton. Forced nothing new beyond item 59's `deal.py` change, carried to that handoff; until it lands, a ghost the dealer reports is checked against the tree before anyone calls it owed.

> 89. **Item 59 seen again.** The dealer listed BLUELINE's own bundle pages and `Shop/Blender` as forward ghosts; all exist. Carried to that handoff.

Carried out of the ledger on 2026-11-03 in the ledger review of the ceremonies' own ledgers (Loudon: "Yes to all"), because it is a change to the dealer's code, not to the practice's spec.

## Tried and rejected

Nothing yet. Item 63 checked the false ghost by hand against `entry-use.py`'s `_entries` and confirmed the key is the title; no fix has been tried.

## Current state

- The dealer's entry map comes from `_ops/swarm/entry-use.py`'s `_entries` node rule, imported in `load_entries` (`deal.py:99-108`): one key per `.md` whose frontmatter carries a canonical `type:`, keyed by the file's stem (`entry-use.py:75-87`).
- So it misses bundle pages like [[BLUELINE — Text Layer]] (a page without a canonical `type:` is not a node) and path-qualified links like [[Shop/Lettering]] (the key is `Lettering`; the link text is `Shop/Lettering`).
- No tests exist for `deal.py`'s ghost report. The fix carries a check against the known cases: [[BLUELINE — Text Layer]], [[Shop/Lettering]], [[Shop/Blender]], and BLUELINE's own bundle pages.
- `build-map.py` and the Palace Map read the same node rule; the dealer's resolver should widen for wikilink resolution without changing what counts as a map node.

## Next move

Worktree first: `node _ops/worktree/new-worktree.mjs --name dealer-ghosts --profile docs`, and work there, never in the main checkout. Then, in `deal.py`, resolve a `[[link]]` the way Obsidian does: strip a path prefix to its last segment and match by stem against every `.md` in the tree, not only the map's nodes, before calling it a ghost. Add the check against the known cases beside it. Land through the palace committer by path, and close this handoff with `node _ops/stigmergy/close-handoff.mjs the-daily-page-dealer-ghosts-handoff-2026-11-03 --commit <hash>`.

## Calibrations from this session

- A ghost the dealer reports is checked against the tree before anyone calls it owed (item 63).
- The map's node rule stays what it is; only the dealer's link resolution widens.

## Load these files first

- `_ops/daily-page/deal.py` (`:99-108`, and wherever it prints ghosts)
- `_ops/swarm/entry-use.py` (`:75-87`)
- `_ops/The Daily Page/The Daily Page — tuning.md` items 59, 63, 89
- `_ops/daily-page/README.md`

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
