---
title: "Inharmonic Wavetable Synthesis — baton"
born: 2026-10-17
links:
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Inharmonic Wavetable Synthesis]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Inharmonic Wavetable Synthesis — oscillators and modulators at the coupling edge (cold start)

## Move
Explore oscillators and modulators that live at the coupling edge found on [[Harmonicity and Inharmonicity]] on 2026-10-17, starting from the pinned renders.

## Why this move matters
The Daily Page sweeps found an audible edge between a stretched tone that holds and one that tears (frozen → alive → edge → torn → released). Loudon: "there are beautiful oscillators and modulators possible with what we have explored, particularly the pinned ones". He also said instruments "should reside at the thresholds". With partial 1 pinned and coupling near zero, stretch becomes a string ↔ bar morph that keeps its pitch, and it lands on the bar's 1, 4, 9, 16 series. That is this project's Wavetable B territory, approached from the dynamics side.

## Cold start
COLD START: this work has not begun; there is no prior state, and nothing has been tried and rejected.

## Next move
Listen to `sweeppin-singer-alone.m4a` and `ride-string-bar-warm-alone.m4a`, then `ride-coupling-warm-alone.m4a`. Then propose to Loudon one playable prototype, an oscillator or a modulator, that holds stretch just under the edge and uses coupling or stretch as the gesture. Your measured stretch data (piano B per register, the bar's 1 : 4 : 9.9) could stand in for the stiff-string law. Whether this enters the project's Plan is Loudon's yes.

## Calibrations from this session
- A toy model: one tone whose partials hang off one phase, pulled by fixed harmonic voices. The edge values depend on the model's choices. Find the edge by ear, by bisecting.
- Coupling is the cleaner performance knob: at fixed stretch, raising K locks the tone and lowering it tears it.
- A plain numpy loop at audio rate, far from real time. A plugin path is commissioned separately on [[VST Template]].

## Load these files first
1. `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/field-guide.md`
2. [[Harmonicity and Inharmonicity — scroll]]: the pinned sweep and the rides
3. `sweeppin.py`, `ride.py`, `ride_warm.py` in that folder
4. This project's scroll: its Plan and Standing Orders

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
