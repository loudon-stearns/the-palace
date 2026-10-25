---
title: "SCHEMA — baton — retype to the two new types"
born: 2026-10-25
links:
  - target: "[[SCHEMA]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[SCHEMA]] — retype to the two new types — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Retype the labelled `connects-to` links that the two link types ratified on 2026-10-25 now name: the `directed-by` labels become `made-by` (29 links, the People and film pages pointing at their directors), and the `alternative-to` and `-vs-` labels become `contrasts-with` (18 links). The list, with source, label and target, is `_ops/swarm/sessions/weave-2026-10-24/link-retypes-for-new-types.json`. Loudon, 2026-10-25: "Approve the two new labels and a handoff to change the referenced links."

## Why this move matters

Weave v2.0's label harvest (Step 3f) read the labels as the palace's own proposal for its next link types; these two clusters were large and coherent enough, and the Schema Ceremony of 2026-10-25 (v1.30) added them. Until the links move, the types exist and nothing uses them.

## Current state

SCHEMA §4 lists `contrasts-with` (symmetric: set against or standing in for one another, short of a productive contradiction) and `made-by` (directed A→B: A, a work or a person, to the one who made or directed it; the source points back at its ground, like `member-of`). The linters and `palace_lib` know both. No link carries either yet.

## Next move

For each row: read the pair's pages once (the label was given by a reader this weave, the skeptic passed most, but a retype is a type claim); apply `retype` with `_ops/swarm/sessions/weave-2026-10-24/apply.py` or by hand, keeping the label where it still adds a register (`directed-by` becomes redundant under `made-by`; a `-vs-` label usually still says what is contrasted). Then `python3 _ops/swarm/lint-link-directions.py` and `lint-link-pairs.py` clean, `build-map.py`, and `label-harvest.py` to see what the next clusters are. One commit through the committer.

## Calibrations from this session

One link per pair holds; do not add beside. A `contrasts-with` is weaker than `contradicts` (Blake's contraries, both true) — if a pair is a productive contradiction, say so and use `contradicts`. `made-by` points from the made thing to its maker; never the reverse.

## Load these files first

`SCHEMA.md` §4 · `SCHEMA/SCHEMA — Context.md` § the v1.30 paragraph · `Palace development/Resonant Link Labels.md` · the JSON list above

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
