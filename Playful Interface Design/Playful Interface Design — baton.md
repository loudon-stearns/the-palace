---
title: "Playful Interface Design — baton"
born: 2026-11-10
links:
  - target: "[[Playful Interface Design]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Playful Interface Design]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Playful Interface Design

## Move

Rewrite [[Playful Interface Design]] so it takes up the metaphorical writing of the palace's rich faces and proofs, and settle with Loudon whether its opening widens past instruments.

## Why this move matters

Loudon, at the close of 2026-11-09, verbatim: "We are learning together how to make more interesting beautiful compelling interactions throughout the palace, we grabbed ants, but what we learned can be applied everywhere, that is why I am excited about the modifications we are making to the palace design standards and modifications to playful interface design! Id now like playful interface design to adopt the metaphorical writing that is throughout the palace rich faces and proofs, and finding that our desigingin has been constrained is great, because now we un-constrain and become more unusual and surprising and creative in our approaches."

The page opens on instruments: "An interface should REACT to the music, and to the hand", and its vector says "an instrument is always understood *as* something". Its sixth example, The colony, landed that day (`307aaef7`) and says of itself "and not an instrument". So the page already holds one kind its opening does not cover. His sentence leans toward "everywhere"; it does not settle the opening's words.

The same day the design standards loosened: Drafting Table lost three rules (`874052f8`) and was named a standard to push against (`a8fd2e54`), and the close posted a propagate flag to the WEAVE board carrying his "celebrating stretching design standards with playful metaphorical meaning and purpose" to every strict design rule. This page is where that loosening gets its reasons: its own lesson under The oracle is "break a standard when the break carries meaning."

## Cold start

COLD START: this work has not begun; no prior state, no tried-and-rejected. The only change so far is The colony example.

## Next move

Work in a worktree of your own. Read the page, then the faces and proofs he is pointing at, starting with the two ants roughs, and say back to him in a sentence what "the metaphorical writing" is before you draft; if you cannot, ask him. Put the opening to him as a plain question: does the core principle widen to any interaction the palace makes (a rich face, a proof, a picture of data), or stay with instruments and let the examples carry the rest? The page is `who_leads: loudon`, and a rewrite changes what it claims, so it goes through the [[Deposit Ceremony]]'s map, shown to him before it is written. Once the text lands, the rich face's section will lag and goes round again through [[Enrichment]].

## Calibrations from this session

- He is glad the constraint was found: "now we un-constrain and become more unusual and surprising and creative in our approaches."
- A tension to hold, not settle: the page's first move is "Make it legible before it is lovely", and [[Pheromone Trail — baton]] carries his wish for a plain caption before any cleverness. Un-constraining is not a licence for a face nobody can read.
- [[Enrichment]]'s scroll holds his standing order of 2026-11-09 on data visualization, with the two roughs as its reference.

## Load these files first

1. `Playful Interface Design.md`
2. `Palace development/Pheromone Trail/proofs/2026-11-09-ants-on-topology/ants-relief.html` and `ants-on-topology.html`
3. `Palace development/Drafting Table Design System.md` § Which dress
4. `Enrichment/Enrichment — scroll.md` § Standing Orders
5. `Playful Interface Design/Playful Interface Design — rich.json` and its piece

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
