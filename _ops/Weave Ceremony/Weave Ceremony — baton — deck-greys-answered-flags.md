---
title: "Weave Ceremony — baton — deck-greys-answered-flags"
born: 2026-11-04
links:
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: "baton-for"
  - target: "[[queue-model.js]]"
    type: connects-to
    label: "targets"
forward_vector: "I carry the in-progress move on [[Weave Ceremony]] — deck-greys-answered-flags — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

`buildQueue` in `_ops/stigmergy/app/src/lib/queue-model.js` keeps an answered entry flag in the list when a `Palace-Resolves` trailer exists, so it greys instead of vanishing, and honours `RETRACT`.

## Why this move matters

Weave Ceremony tuning item 59, verbatim:

> **The deck greyed fewer flags than the linter counted because `buildQueue` drops an entry flag once a RESOURCE_GRANT or RESOURCE_DENY answers it** (`_ops/stigmergy/app/src/lib/queue-model.js:58-63`, `:182`), so an answered flag with a trailer is never greyed, only gone. Replayed 2026-10-24: 171 board flags, 164 deck items, 7 dropped — the gap. The linter's substring match was tightened to the deck's exact-token rule the same night and changed no count. Pays Loudon's one-shot order of 2026-10-18. Fix owed to the app: keep an answered entry flag in the list when a `Palace-Resolves` trailer exists, so it greys; and honour RETRACT in `buildQueue`.

Carried out of the ledger on 2026-11-03 in the ledger review of the ceremonies' own ledgers (Loudon: "Yes to all three"), because it is a change to the app, not to the Weave's spec.

## Tried and rejected

Nothing yet. The 2026-10-24 night tightened the linter's match to the deck's exact-token rule (`_ops/swarm/lint-weave-flags.py`) and found the count unchanged: the gap is in `buildQueue`, not the linter.

## Current state

- `queue-model.js:56-63` builds `responded` from every `RESOURCE_GRANT` / `RESOURCE_DENY` that carries `re`; `:182` keeps a `weave_flag` only when it is a propagate flag or `!responded.has(m.id)`. An answered entry flag is therefore dropped before `reconcileQueue` can grey it on a `Palace-Resolves: <id>` trailer (`:472-494`).
- `RETRACT` does not appear in `queue-model.js` at all (`grep -n RETRACT` finds nothing); a retracted card is never folded away.
- Unit tests beside the model: `_ops/stigmergy/app/tests/unit/queue-model.test.js` (also `queue-item.test.js`, `queue-propagate-flag.test.js`, `queue-panel-handoff-chip.test.js`, `queue-human-eval.test.js`).

## Next move

This is code work: make a worktree of its own first — `node _ops/worktree/new-worktree.mjs --name deck-greys-answered-flags --profile stigmergy` — and work there, never in the main checkout. Then, in `buildQueue`: (1) keep an answered entry flag in the list when a commit with `Palace-Resolves: <flag id>` exists, so `reconcileQueue` greys it rather than the flag vanishing; (2) fold a `RETRACT` whose `re` names a card so the card leaves the list with the retraction's reason. Replay the 2026-10-24 board (171 flags) and show the deck's count meets the linter's. Add the cases to `queue-model.test.js`; `npx vitest run tests/unit/queue-model.test.js` from `_ops/stigmergy/app`. Land with `palace-land`; close the claim with `close-handoff.mjs <id> --commit <hash>`.

## Calibrations from this session

- Don't edit STIGMERGY files in the Vite graph while a lane runs (operator memory: the graph blinds the deck).
- The model's dedup is by the answered message's id; keep that, add to it.

## Load these files first

- `_ops/stigmergy/app/src/lib/queue-model.js` (`:56-63`, `:182`, `:472-494`)
- `_ops/stigmergy/app/tests/unit/queue-model.test.js`
- `_ops/Weave Ceremony/Weave Ceremony — tuning.md` item 59
- `_ops/swarm/lint-weave-flags.py`
- `SCHEMA — Reference.md` §9 (`RETRACT`)

## On pickup` heading down is appended verbatim to the baton; this note is not. Edit here,
     nowhere else — a second copy is how this drifted before (2026-07-07 → 2026-08-26). -->

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
