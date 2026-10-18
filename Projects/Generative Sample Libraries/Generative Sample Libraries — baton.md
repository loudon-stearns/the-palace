---
title: "Generative Sample Libraries — baton"
born: 2026-10-17
links:
  - target: "[[Generative Sample Libraries]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Generative Sample Libraries]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Generative Sample Libraries — instruments that tear, then heal (cold start)

## Move
Make a collection of sampled instruments from the frustration explorations on [[Harmonicity and Inharmonicity]], built around one envelope: **a dissonant, inharmonic, torn attack that falls into a locked, steady sustain.** Loudon, 2026-10-17: "make a collection of sampled instruments from these explorations, particularly ones what start unstable and become stable, a dissonant inharmonic attack falling into a steady sustain."

## Why this move matters
The evening's sweeps found an edge between a tone that holds and a tone that tears. Thrown past that edge and allowed to decay back under it, a tone tears and then relocks: a pitch drop and recovery, much like a drum's pitch envelope, but made by the physics, with no envelope drawn. That is an attack and a sustain coming out of one mechanism, which is what a sampled instrument wants. Loudon also said instruments built on this "should live at the thresholds."

## Where the sound already is
`Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/`, newest first on [[Harmonicity and Inharmonicity — scroll]]:
- `gestures*.m4a`, the **10–21 s strikes**: stretch B thrown to 3e-4, well past the edge (about 1.8e-5 at K = 6 Hz, 40 partials), decaying back to 2e-6 with τ ≈ 0.25 s. This is the envelope. `-warm` and `-bass` versions sit beside it.
- `ride-coupling*.m4a`: the other way to get it. Stretch is held just past the edge while coupling rises from low to high, so the tone goes from torn to locked.
- `field-guide.md`: the knobs and regions; read it first.
- Scripts: `ride.py`, `ride_warm.py` (warm source; `F0` and `N` come from the environment, and coupling scales with pitch), `gestures.py`, `gestures_warm.py`. Plain numpy at audio rate; one 34 s render takes a while, nowhere near real time.

## Sampling axes the steward will need (the choices are yours)
Pitch and register (including the bass, E1 with 96 partials, which tears and heals about 2.7× more slowly) · strike depth (how far past the edge B is thrown) · heal time τ · partial count (few partials snap, many fray) · pinned vs unpinned (pinned heals towards a bar, at 1, 4, 9, 16) · warm vs bright source · velocity mapped to strike depth is the obvious first guess, not a decision.

## Cold start
COLD START: this work has not begun; there is no prior state, and nothing has been tried and rejected. The only renders are the proofs above.

## Caveat
A toy model: one tone whose partials hang off one phase, pulled by fixed harmonic voices. The edge values depend on the model's choices (how back-pull is scaled, how far pulls fade). Find the edge by ear for each patch, by bisecting, as the field guide says, rather than copying its numbers.

## Not decided
Whether this enters the project's Plan. That is Loudon's yes.

## Next move
Listen to the strikes in `gestures-warm-alone.m4a` and `gestures-bass-alone.m4a` (10–21 s). Then render one tear-then-heal note from `gestures_warm.py` with a single strike, and judge by ear whether it carries as a sampled note before choosing the axes.

## Calibrations from this session
- Loudon's ear: the slightly stretched tone sounded more alive than the harmonic one.
- The warm source (`*-warm`) makes the effect much easier to hear than the bright early renders did.
- Audio in the proofs folder is AAC `.m4a`. The WAVs were not committed.

## Load these files first
1. `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/field-guide.md`
2. `gestures-warm-alone.m4a` and `gestures-bass-alone.m4a`, the strikes at 10–21 s
3. `ride_warm.py`, `gestures_warm.py`
4. This project's scroll Plan and Standing Orders

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
