---
title: "Palace Map — baton"
born: 2026-10-23
links:
  - target: "[[Palace Map]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Palace Map]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Palace Map

## Move
Build the map's keeper, starting with its tools: the triple checker and three new verbs in `palace-map.py`. That is the first of three moves in the Plan agreed 2026-10-23 on this page's scroll (trail entry `plan-2026-10-23`); the keeper itself and its first runs follow.

## Why this move matters
The test showed an LLM holding the whole map makes the best finds and the worst counts. The keeper is only trustworthy if counting and checking are in scripts it cannot skip, so the tools come before the agent.

## Tried and rejected
- **Haiku as the keeper:** at 179K tokens with the map loaded it has no room to talk. Haiku with the script is fine for one-verb lookups only.
- **Script only, no map in context:** counts exactly, but the creative answers were thinner and one constellation fell apart. The best script-only run rebuilt the map by calling `near` 324 times.
- **Map only, no script:** never invented an edge, but the counts were wrong and nothing told it so.
- **Raw shared-neighbour counts for rhymes:** swamped by hubs (FOUR PILLARS, Kuramoto Coupling, Hilaritas Generator). The hybrid set aside pages with 40+ neighbours before ranking. The script-only run rejected Manim CE ~ Stable Audio Open: 8 shared neighbours, mostly Shop and toolbox pages, so not a rhyme.

## Current state
- Proof and raw files: `_ops/Palace Map/proofs/` (front page `Palace Map — proof — map-agent-test.md`; files in `2026-10-23-map-agent-test/`). `verify.py` and `grade_creative.py` there are the seeds of Move 1; the hybrid's `hybrid/chk.py` and `chk2.py` are its own typed-path and shared-neighbour scripts.
- Ground truth to test against: mirrors-only Kuramoto Coupling → Haptic Handwheel is 4 hops; mirrors-only Kuramoto Coupling → Stoicism has no route (Stoicism has no `mirrors` edges).
- `palace-map.py` errors if `--json` comes after the verb.

## Next move
Write `_ops/swarm/verify-triples.py` from the proof's `verify.py` (taking the build as an argument, defaulting to the newest), then add `path --only`, `rhymes` and `connected` to `palace-map.py` with tests in `test-palace-map.py`. Run each against the ground truth above.

## Calibrations from this session
- Loudon wants the keeper creative first: "how can the power of an LLM with a map in context go beyond simple answers and into creative explorations?" Its value is constellations, typed paths, walks and rhymes, not lookups.
- He asked for the hybrid himself: "sonnet with entire map, and also using scripts, so it confirms its intuitions with scripts." The intuition log is part of every creative answer, not an extra.
- Every edge is cited as a triple and checked. Counts never come from a read.
- The rhymes are unjudged. They reach the Weave only as candidate flags on his yes.

## Load these files first
1. `_ops/Palace Map/Palace Map — scroll.md` — the Plan
2. `_ops/Palace Map/proofs/Palace Map — proof — map-agent-test.md`
3. `_ops/swarm/palace-map.py` and `_ops/swarm/test-palace-map.py`
4. `_ops/Palace Map/proofs/2026-10-23-map-agent-test/verify.py`, `grade_creative.py`, `hybrid/chk.py`, `hybrid/chk2.py`

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
