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
The keeper's first runs: four uses, each a real run, not a demo — a constellation for a Daily Page sit; a route for a Walk (the Walk's door); a dialectic cast for a Dialectic, drawn from the `contradicts` edges; rhymes for a Weave, posted as unjudged candidate flags only on Loudon's yes. That is the third of three moves in the Plan agreed 2026-10-23 on this page's scroll (trail entry `plan-2026-10-23`); the tools and the keeper came first and landed. Done when a Weave takes up a flag the keeper raised, and the map's tuning ledger opens with the runs' lines.

## Why this move matters
The test showed an LLM holding the whole map makes the best finds and the worst counts. The keeper is only trustworthy if counting and checking are in scripts it cannot skip, so the tools come before the agent.

## Tried and rejected
- **Haiku as the keeper:** at 179K tokens with the map loaded it has no room to talk. Haiku with the script is fine for one-verb lookups only.
- **Script only, no map in context:** counts exactly, but the creative answers were thinner and one constellation fell apart. The best script-only run rebuilt the map by calling `near` 324 times.
- **Map only, no script:** never invented an edge, but the counts were wrong and nothing told it so.
- **Raw shared-neighbour counts for rhymes:** swamped by hubs (FOUR PILLARS, Kuramoto Coupling, Hilaritas Generator). The hybrid set aside pages with 40+ neighbours before ranking. The script-only run rejected Manim CE ~ Stable Audio Open: 8 shared neighbours, mostly Shop and toolbox pages, so not a rhyme.

## Current state
- **Move 1 landed, 2026-11-03, `1c6da6a0`.** `_ops/swarm/verify-triples.py` checks every `[Source | relation | Target]` in a text against a build (exit 1 on a fake). `palace-map.py` gained `path --only <t1,t2>`, `rhymes "<Entry>" [--n] [--hub-cutoff 40] [--min-common 3]` and `connected <A> <B> …`; `--json` and `--map` work before or after the verb. `test-palace-map.py`'s KeeperTools class holds the ground truth below against the 2026-10-23 build taken from git (`4ad369c2`); 13 tests pass.
- Proof and raw files: `_ops/Palace Map/proofs/` (front page `Palace Map — proof — map-agent-test.md`; files in `2026-10-23-map-agent-test/`). The hybrid's `hybrid/chk.py` and `chk2.py` are the typed-path and shared-neighbour rules the verbs now carry.
- Ground truth, pinned to the 2026-10-23 build: mirrors-only Kuramoto Coupling → Haptic Handwheel is 4 hops; mirrors-only Kuramoto Coupling → Stoicism has no route (Stoicism has no `mirrors` edges). On today's build the mirrors route is 5 hops, since the 10-24 Weave re-cut the graph.
- **Move 2 landed, 2026-11-03.** The `palace-map-keeper` profile in [[Agent Toolbox]] (Read and Bash; generated into `.claude/agents/palace-map-keeper.md`), the charter at `_ops/palace-map-keeper/charter.md`, the spawn recipe in `_ops/palace-map-keeper/README.md`, and [[Palace Map]] § Seeing and Counting saying what the keeper is. Open on the scroll's Plan: where a lesson from the first runs goes (a ledger beside the charter, or the Map Build's); whether a woken page carries the keeper's constellation as its sky.
- **Move 2's done-when met, 2026-11-03.** The keeper, spawned fresh by the recipe on the 2026-11-03 build, answered both question sets: 63/63 edges real (its own check caught two reversed triples first), all ten facts exact by script, the constellations connected, the rhymes truly unlinked, a log per creative move, nothing written; 120,679 tokens. Record: `_ops/Palace Map/proofs/2026-11-03-keeper-first-run/` and the proof front page. The commit that placed it is the one carrying this line.
- **Open questions from the run:** (1) closed 2026-11-03 — `palace-map.py types` counts every relation type, node-to-node apart from to-a-ghost, held by a test to the builder's counts; (2) pillars are not in the map, so a pillar spread is the keeper's judgment, said as such.

- **Move 3's first use, 2026-11-03.** The keeper, re-addressed, drew a constellation for the Daily Page sit on [[Quantization ↔ Precision vs Flow]], "The Grid and the Flock": seven pages, 13 inner edges across four types, 10/10 triples real, one rhyme (Synthesis ↔ Emergence, `couples-with` as a candidate only, for the Weave on Loudon's yes). Record: `_ops/Palace Map/proofs/2026-11-03-keeper-first-run/sit.md` and `RESULTS.md` § First use. The map's tuning ledger opened with its line: `_ops/Palace Map/Palace Map — tuning.md`. Move 3's done-when is half met — the ledger is open; a Weave has yet to take up a flag the keeper raised.
- **The rhyme is flagged, 2026-11-03.** On Loudon's word ("Yes, flag it"), the keeper's rhyme went to the WEAVE board as a `weave_flag` by `python3 -m commons weave-flag`, id `commons-the-palace-1793711823205`: source Quantization ↔ Precision vs Flow, target Synthesis ↔ Emergence, proposed `couples-with`, unjudged. The next Weave's Step 1c reads it; when it takes it up or declines it, Move 3's done-when is met. The keeper's prose for the sit is in the proof folder as `sit-reading.md`.
- **Three parked items picked up, 2026-11-03** (Loudon, 2026-11-03: "pick them up"): the stray proofs node (Map Build v2.7, `proofs` excluded in the builder, the TOPOLOGY lens and `entry-use.py`); the `types` verb; the dealer's siblings from the ring (The Daily Page v1.3). Still parked: `palace-commit` sweeping `_ops/maps/` on a morning with no sit; the lone `_ops/maps/palace-map-full-2026-04-01.txt`, outside the builds the pruner keeps; the keeper has no postures (the Plan's Move 3 says the first runs decide).
- **Seven tier-2 self-check births are owed, 2026-11-03** (A1, A2, D1, E7, G4, G5, S1), a debt the close saw and did not cause: `due.mjs --since 9735cb52` names the floor files changed since 10-22 by other sessions (CHILD, CLAUDE, Cooperation Yields Agency, ELDER, FOUR PILLARS, Hilaritas Generator, JEWEL, Modes of Collaboration, Palace Philosophies, SCHEMA) and the Claude Code move 2.1.304 to 2.1.309; this session touched none of them. `node _ops/self-description-test/birth.mjs --scenario <id> --ref HEAD`, tier 2 runs the suite. Run on Loudon's word, never at a close. Open from the panel, unanswered: did the keeper's sky change the sit?

## Next move
The next of Move 3's four uses, on Loudon's word: a route on one relation for a Walk's door. Spawn or re-address the keeper by the README's recipe, relay its return as returned (every edge a triple, the log, the `verify-triples.py` line, the build read), let the walk take the door it names, and leave the run's line in the Palace Map's tuning ledger. The cast for a Dialectic and the rhymes for a Weave follow; the rhymes reach the Weave only as unjudged flags on his yes.

## Calibrations from this session
- Loudon wants the keeper creative first: "how can the power of an LLM with a map in context go beyond simple answers and into creative explorations?" Its value is constellations, typed paths, walks and rhymes, not lookups.
- He asked for the hybrid himself: "sonnet with entire map, and also using scripts, so it confirms its intuitions with scripts." The intuition log is part of every creative answer, not an extra.
- Every edge is cited as a triple and checked. Counts never come from a read.
- The rhymes are unjudged. They reach the Weave only as candidate flags on his yes.

## Load these files first
1. `_ops/Palace Map/Palace Map — scroll.md` — the Plan
2. `_ops/Palace Map/proofs/Palace Map — proof — map-agent-test.md`
3. `_ops/palace-map-keeper/charter.md` and `_ops/palace-map-keeper/README.md` — the keeper and how to spawn it
4. `_ops/swarm/palace-map.py`, `_ops/swarm/verify-triples.py` and `_ops/swarm/test-palace-map.py`

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
