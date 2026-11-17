---
title: "The Lens — baton"
born: 2026-11-04
links:
  - target: "[[The Lens]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[The Lens]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
session_thread: "Remainder of the-lens-remainder-20261104T050135Z, closed --partial on 011905d8; board card the-lens-remainder-20261117T114808Z"
---

# Baton: The Lens

## Move
Find out whether a woken glass obeys the attribution rule it has now been given. Both steps cost money and wait for Loudon's yes.

## Why this move matters
Loudon's two rulings are on the page and in the mandate (`011905d8`): rich-face offer 3 is taken, and a glass may invent a scene or give a real person words they never said, only with attribution, marked where the invented line stands. The words are written. No glass has been run under them, so nobody knows yet whether a woken glass marks its inventions or only says so in the check at the end.

## Current state
As of 2026-11-17:
- **Landed.** § The Fidelity Test carries offer 3's test sentence and the paragraph on the woken glasses; § Shipped carries the attribution rule; `_ops/stigmergy/orchestrator/src/lens-mandate.js` tells a woken glass the same, with a test (18 of 18 with the ephemeral-prompt tests); [[Palace Enchantment]] § Voice Rules gained "Plain is not generic". The Fidelity Test section is re-stamped, offer 3 is marked taken, and [[The Lens — tuning]] item 13 holds the ruling in Loudon's words (`acf0b6e2`).
- **Not run.** No lensing under the new line. A reading and its check can travel apart (code-review finding 2), which is why the rule asks for the mark beside the line.
- **Self-check owed.** `node _ops/self-description-test/due.mjs` exited 2 at the 2026-11-07 close. Scenario S1 is at risk through `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js`; the run is `node _ops/self-description-test/birth.mjs --scenario S1 --ref HEAD`. A1, D1, E7, G4, G5 and the floor are owed too, for changes by other sessions; they are not this baton's to pay.
- **A review note waits.** Loudon's Woken Glasses answers of 2026-11-07 are open on this page (`node _ops/loudon-eval/read-answers.mjs --page "The Lens" --open`). Read them before the run.
- **Rich face.** Offers 1 and 2 are still open. "many eyes" and "the glass on a page" hang on the top section as proposals.

## Next move
1. Ask Loudon for a yes on one paid lensing: a glass for a real person, bold, over a page of his choosing. Read the result for one thing: is each invented line marked where it stands, and named again in the check?
2. On the same yes or a second one, run the S1 birth.
3. Offer, words first: [[Palace Enchantment]] now names The Lens in a rule and has no typed link to it. `connects-to`, label `register-without-licence`, from Palace Enchantment's side.

## Calibrations
- Loudon's "yes with attribution" (2026-11-11) was read as: mark the invention where it stands, for the living and the dead alike. He approved the words that say so on 2026-11-17. If a run shows the mark beside the line is too heavy, that is his to loosen, not the catcher's.
- [[Making a Palace Citizen]] was left alone on purpose. Its rule governs a person's own page; a glass's reading is never the record.

## Load these files first
1. [[The Lens — tuning]], items 8–13.
2. [[The Lens]], § The Fidelity Test and § Shipped.
3. `_ops/stigmergy/orchestrator/src/lens-mandate.js:100-125`.
4. `The Lens/proofs/2026-11-03-bold-mandate/` (fact-check.md, code-review.md).

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
