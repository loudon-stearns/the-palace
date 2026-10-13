---
title: "Frequency-Time Duality — baton"
born: 2026-10-13
links:
  - target: "[[Frequency-Time Duality]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Frequency-Time Duality]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Frequency-Time Duality — fold the Explorer in

## Move
Run a [[Deposit Ceremony]] that carries the [[Frequency-Time Explorer]]'s five-movement walk and its three doorways into [[Frequency-Time Duality]] as the design of Duality's rich face. Then compost the Explorer.

## Why this move matters
The first Daily Page morning (2026-10-13) dealt the Explorer. The verdict was a fold: Duality consumes the Explorer. The Explorer was never stewarded and has no build; its whole substance is the walk and the doorways, and Duality is the page that already holds the idea. Loudon's rule for the practice: the Daily Page decides on the fly; proper palace machinery does the lifting. So the deposit is its own rite, in its own session, not done at the sit.

## Seed of the Enrichment
**`Projects/Frequency-Time Duality/proofs/2026-10-13-the-flip-three-axes.html`** is the rough Loudon played that morning, kept and indexed on Duality's page beside the two 2026-05-04 sketches. One log axis from 0.5 Hz to 2 kHz, three modes: a click train; a sine through a wobbled delay; two drum voices with the 24-second ride. Each axis carries a bottom-and-top zone mark. Start the rich face from it.

## Enrichment brief: three findings
- The polyrhythm-to-interval axis was missing from the Explorer. Polyrhythms below the threshold become intervals above it, and the Explorer's walk had no axis for that.
- The threshold is a zone, not a line, and its top edge sits below the page's 40 Hz.
- Drum onset and length decide the fused timbre. Tune by ear.

## Loudon's Reaktor ride
Drum sounds in a polyrhythm, sped up until the polyrhythm becomes a buzz, then a clear interval, with the voices toggled so the interval is obvious, then slowed back down. The proof's third mode is built on this.

## Three sentences that ride this deposit
Loudon said to keep them in the Duality deposit. They are not written anywhere yet:
1. The Reaktor lesson (the ride above, said as a lesson).
2. "Daily cognition" as a domain the 20 Hz boundary reaches.
3. "What is the rhythm of a perfect fifth?"

## Current state
- Nothing is in canon. The only house touches so far are the proof file, one index line on Duality's page at the proofs callout, and the Active Baton pointer.
- The proof was copied unchanged from `_ops/daily-page/roughs/Frequency-Time Explorer/the-flip.html`. The rough's own copy is gitignored and was only meant to last the morning.

## Next move
1. Deposit: fold the walk, the three doorways and the three findings into Duality as the design of its rich face (Enrichment), seeded by the proof.
2. Add the standalone-app line to Duality's forward vector: a project spawns again only if the face earns it; teach from the face in STIGMERGY as it grows.
3. Then compost the Explorer: `stage: composting`, with a Spore Check note. It carries a ghost, `[[Haas Effect]]`, and a BBS link; those go with it.

## Calibrations
- Loudon read and approved the fold verdict in the panel. He has not yet read the deposit's words, so the deposit needs his read and his map before it lands.
- The weave debt for the Haas ghost and the BBS link is the compost's, not a separate flag.

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
