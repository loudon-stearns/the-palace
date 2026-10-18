---
title: "Dissolutions — baton"
born: 2026-10-18
links:
  - target: "[[Dissolutions]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Dissolutions]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Dissolutions

## Move
Build the six remaining playable proofs for the Dissolutions catalogue, one per member, each testing that member's identity claim and ending in a hunt-ledger line.

## Why this move matters
The page's own rule is that a dissolution is productive: it hands a designer new knobs. Until now no member has been tested against that rule, or against the line the page now draws between identity, isomorphism and analogy. A proof that tests the claim (not one that illustrates it) is how each member earns its place. One that will not come alive is a real question about whether the member stands.

## Cold start
COLD START — this work has not begun; no prior state, no tried-and-rejected. The first proof exists and is the model, not part of this commission: *One curve, three readers*, for Exponential Decay Curvature (partly Volterra Kernels and the Torus and Chebyshev is Fourier), at `Dissolutions/proofs/2026-10-18-one-curve-three-doorways/`.

## Next move
Read the Plan in `Dissolutions/Dissolutions — scroll.md`. It is the map and was agreed with Loudon. Pick one owed member and search its bundle and `Projects/*/proofs/` for prior art before building anything. Then make one proof, put it in its own dated folder under `Dissolutions/proofs/`, add a trail entry to the scroll, and write the first hunt-ledger line. Owed, in any order: Dispersion Table, Phase Reduction, Chebyshev is Fourier, Volterra Kernels and the Torus, Linear Predictive Coding, Rank-N Lattice Analysis. A partial close per proof is expected (`close-handoff.mjs --partial`).

## Calibrations from this session
- The test is felt, not only understood. The first rough was understood with the head and not felt. The second rough fixed that with the projection picture: the stored object in the centre, its reader below, the output to the right. That form may carry across most members.
- A dissolution in the math can leave a seam in perception (near 20 Hz, a curve read faster turns from loudness into sound). Say so where it applies; it is a knob, not a flaw.
- Phase Reduction is the likeliest member to test as an isomorphism rather than an identity. The page calls Kuramoto the "phase-reduced shadow" of Floquet, which is an approximation valid under weak coupling.
- The hunt ledger is born at the first real test, not before: `Dissolutions/Dissolutions — hunt.md`, with `ledger: hunt` and a `standards` block (SCHEMA — Reference §6, §8). One line per candidate: `- <date> · <A> / <B> · identity | isomorphism | analogy · knob: <what it unlocks> | none · <where found>`. Lines that test as analogy seed the Refusals question at the foot of the page.
- First hunt candidate beyond the members: [[Skills Are Enchantable Pages]] (`Palace development/Skills Are Enchantable Pages.md:88-90`). The Concierge's read: it passes ingredients 1 and 3, but its reframing makes ceremony, specialist, skill, steward and page "one pattern" across a trigger × executor grid. That is a family sharing one form, likely an isomorphism or a genus, not an identity. Test it before admitting it.
- A member that tests as an isomorphism is marked as one; whether it stays is asked of Loudon, not assumed.

## Load these files first
1. `Dissolutions/Dissolutions — scroll.md` (the Plan, and the first proof's trail entry)
2. `Dissolutions.md` (especially § Identity, isomorphism, analogy)
3. `Dissolutions/proofs/2026-10-18-one-curve-three-doorways/one-curve-three-doorways-2.html` (the model proof)
4. The member page for the proof you pick, and its bundle
5. `_ops/loudon-live/design-system/SKILL.md` before anything visual

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
