---
title: "The Lens — baton"
born: 2026-11-04
links:
  - target: "[[The Lens]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[The Lens]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
session_thread: "Remainder of the-lens-handoff-2026-10-23, closed --partial on 483afc32; board card the-lens-remainder-20261104T050135Z"
---

# Baton: The Lens

## Move
Finish what the bold mandate left: carry its register move to enchanted pages, write § The Fidelity Test's paragraph on the woken glasses once Loudon rules on rich-face offer 3, and get his ruling on whether a glass for a living person may invent a scene.

## Why this move matters
Loudon's verdict on Woken Glasses was "a clear 'go for bold' direction", and the mandate now reads boldly (a145f1a4). But the page's own test section still describes only the hand-written games, the voice move has not reached the enchanted pages that "lack" it, and the mandate licenses every glass, living people included, to invent a scene. Each of the three waits on a decision, not on code.

## Current state
As of 483afc32 (the landing of lens/bold-mandate):
- **(f), carried.** The 2026-10-25 line from the Palace To-Do, in Loudon's call: "if the bold mandate holds, the same register move is the voice guidance enchanted pages lack, minus the veracity licence." The bold mandate held. Nothing has been carried to [[Palace Enchantment]] § Voice Rules When Addressing the Human (`Projects/Palace Enchantment.md:315`).
- **§ The Fidelity Test.** Untouched on purpose. It is stamped in `The Lens/The Lens — rich.json` (`made_against: ff646abd58ff`, three pieces, status `proposal`), so any edit marks "move the glass" and both 2026-10-23 games as lagging. Rich-face offer 3 (open) asks to change this same section's test sentence: "the change that counts is in what the glass brings, not the words it borrows." The mandate already says so (`_ops/stigmergy/orchestrator/src/lens-mandate.js:120`: "a borrower can pass it, so it is not enough alone").
- **The person-glass ruling.** [[The Lens — tuning]] item 13, owed, Loudon's ruling. The licence is at `lens-mandate.js:108-110`; canon forbids fabricated quotes ([[Making a Palace Citizen]]) and says nothing about invented scenes.

## Next move
Put the two rulings to Loudon together, plainly: rich-face offer 3 (yes / no / reworded), and item 13 (may a glass for a living person invent a scene, and ever put new words in their mouth as a quotation?). Then, on his answers, write the Fidelity Test paragraph and the offer-3 sentence in one edit and re-stamp the section (`node _ops/rich-face/fingerprint.mjs "The Lens" --stamp "The Fidelity Test (generalized)"`). (f) can go in parallel: draft the voice line for Palace Enchantment and show it before writing.

## Calibrations from this session
- Loudon, 2026-11-03: he played four of the five pairs and "MUCH preferred the bold"; "yes to the cost, no need to read the notes, the result is a clear 'go for bold' direction".
- The § Fidelity Test paragraph should carry his verdict, and the cost the fact-check found: every bold distortion check missed a small bend of its own ([[The Lens — tuning]] items 8, 9).
- He has not ruled on the person-page line. Do not take "go for bold" as that ruling.

## Load these files first
1. [[The Lens — tuning]], items 8–13.
2. [[The Lens]], § The Fidelity Test and § Shipped; then `The Lens/The Lens — rich.json`, the `offers` list (offer 3).
3. `The Lens/proofs/2026-11-03-bold-mandate/` (judge-blind.md, fact-check.md, code-review.md finding 5).
4. `_ops/stigmergy/orchestrator/src/lens-mandate.js:100-125`.
5. [[Palace Enchantment]] § Voice Rules When Addressing the Human.

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
