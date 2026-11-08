---
title: "Objects to Think With — baton"
born: 2026-10-25
links:
  - target: "[[Objects to Think With]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Objects to Think With]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Add `exemplifies` → [[Objects to Think With]] (label `object-to-think-with`) from the instance side on the eighteen qualifying projects, each with the sentence in its own body that says it — for a Weave, not a deposit. Smaller, beside it: at `Objects to Think With.md:33–34`, replace the unverified list with Papert & Harel's own words (1991) and name *cultural presence* beside body-syntonic.

## Why this move matters

On 2026-10-26 Loudon placed the page's loose-bar forward vector and its Forward Vectors bullet, and ruled the rest: "leave the eighteen exemplifies links to a Weave." The page now says eighteen further projects qualify and do not yet declare it; until they do, the claim lives on one side only. Its own `:33–34` also quotes a list the recount could not find in Papert, and drops the third of his three terms.

## Current state

- The recount is in the bundle: `Objects to Think With — sketch — papert-recount.md` (landed 86d6714c), with all 51 verdicts, their quotes and reasons. It is the list for this move.
- The count at `:43` (twenty-two of fifty-one, b14566a4), the forward vector at `:26` and the Forward Vectors bullet at `:86–87` are placed on the loose bar.
- Four already declare `exemplifies`: [[Blood Compressor]], [[Compressor Design]], [[2D Torus Wavetable Synthesizer]], [[Action Potential Oscillator]].

## Next move

1. **The eighteen**, each in the project's own frontmatter `links:`, in the shape the four use, with a body sentence that names the object and the idea it carries:
   ```yaml
     - target: "[[Objects to Think With]]"
       type: exemplifies
       label: object-to-think-with
   ```
   Strict qualifies (10): [[Haptic Handwheel]] · [[Portamento and Physical Pitch Modeling]] · [[Floquet Time-Modulated Loops]] · [[Waveguide Synthesizer]] · [[Tract Mirror]] · [[Murmuration]] · [[Frequency-Time Duality]] · [[Shepard Tone Synthesizer]] · [[Retrospective Delay]] · [[Semantic Webcam]]. Loose-bar additions (8): [[Quantum Synthesizer]] · [[Inharmonic Wavetable Synthesis]] · [[Neural Granular Synthesis]] · [[Piano String Inharmonicity]] · [[Crystal Synthesizer]] · [[Particle Synthesis]] · [[Slime Mold Delay]] · [[Bayesian Granular Synthesizer]].
2. **`:33–34`**: Papert & Harel, "Situating Constructionism" (1991) — *"constructing a public entity, whether it's a sand castle on the beach or a theory of the universe"* — in place of the unverified list, and *cultural presence* named beside body-syntonic (recount, item at its line 104). Show Loudon the words first.

## Calibrations

- Link from the instance side, never from this page (SCHEMA §4, directionality).
- Each link carries its sentence; a bare link added in bulk is what the page's own bullet warns against.

## Load these files first

`Objects to Think With.md` · `Objects to Think With/Objects to Think With — sketch — papert-recount.md`

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
