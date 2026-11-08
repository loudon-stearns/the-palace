---
title: "Auditory Illusions — baton — rich face"
born: 2026-11-08
links:
  - target: "[[Auditory Illusions]]"
    type: connects-to
    label: "baton-for"
  - target: "[[Auditory Illusions — rich.json]]"
    type: connects-to
    label: "targets"
forward_vector: "I carry the in-progress move on [[Auditory Illusions]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Auditory Illusions

## Move

Build the page's rich face through [[Enrichment]]. For each illusion, the sound you can play goes beside the sentence that explains it and beside a picture of its visual twin. Start with the pairs the palace can make first, not all twenty-seven.

## Why this move matters

The page explains how hearing builds its world, but prose can't make a reader hear their own ear make something up. Enrichment's proposal round already said this about the Shepard tone: prose cannot make a reader fail to hear a seam. The page's forward vector asks to become "a page you hear, not only read". The side-by-side table is a set of claims about mechanism and shape. A piece played beside its twin tests each claim, and is the only way the page's grades get checked by ear.

## Cold start

COLD START — this work has not begun; no prior state, no tried-and-rejected.

What exists to gather, not remake:
- The Shepard tone: the still drone and the free seam (`Projects/Shepard Tone Synthesizer/Shepard Tone Synthesizer — rich — *.html`, at proposal status), the four `session-N-interactive.html` pages, and twelve drones in `Projects/Generative Sample Libraries/shepard-instrument/`.
- Masking: *under the kick* in `Cross-Domain Resonances/Sidechain ↔ Conversation/`, at proposal status.
- Rhythm into pitch: *the flip*, `Projects/Frequency-Time Duality/proofs/2026-10-13-the-flip-three-axes.html`.

What wants making, cheapest first, each a few lines of Web Audio:
- **Beats beside moiré.** Two sines and two gratings, one slider for the difference.
- **Huggins pitch beside a random-dot stereogram.** The page's tightest pair. Noise in each ear, a melody only on headphones, and the eye's version beside it.
- **The continuity illusion beside the picket fence.** A tone, a gap, a noise burst; a cat, a gap, a fence.
- **Binaural beats.** Headphones; one honest line on entrainment.
- **The missing fundamental.** Remove the low harmonic and keep the pitch.

## Next move

Run Enrichment on Auditory Illusions ("enrich Auditory Illusions"). Read the page and its Context live, and gather the existing pieces before making anything. Propose the first three new pairs to Loudon before building them.

## Calibrations from this session

- Loudon chose "Auditory Illusions" over his working name "Sonic Hallucinations". The word *hallucination* stays in the body on purpose.
- The visual twins are graded mechanism or shape, and two readers regraded three of them down. A piece must not make a shape pair feel like a mechanism pair.
- The Echo Walk sketch is mono and can't play the Haas zone. A stereo piece is wanted if the precedence effect gets one.
- Nobody has listened to any of this yet. Every claim on the page about how something sounds rests on sources, not on an ear.

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
