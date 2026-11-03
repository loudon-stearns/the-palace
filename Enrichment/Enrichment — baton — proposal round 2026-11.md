---
title: "Enrichment — baton — proposal round 2026-11"
born: 2026-11-03
links:
  - target: "[[Enrichment]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Enrichment]] — the proposal round of 2026-11 — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Finish the proposal round: enrich the nine pages left on its board, then the two October nominations, each by the round's loop — one maker per page in its own worktree, a challenger who did not make it, remake once, land as proposal. Loudon, 2026-11-03: "I am interested in enriching as much of the palace as possible … keep the enrichments as pending or proposal until I approve them."

## Why this move matters

87 pages landed a rich face in one day, every made section a proposal, 405 findings for the text held as offers instead of written. The board was drawn from eight nominators scoring 314 entries; what is left is the tail of the ≥7 line and the two October pages the weave asked for by name.

## Current state

- **The board is done.** 96 pages carry a face from the round — 87 on day 1, nine on day 2 (Loudon, 2026-11-03: "pick up the baton and complete the high weight items there"). Every made section is a proposal and every one was challenged; nine of nine day-2 faces took a remake, none a retire. What remains is October's two, **Spinoza Conatus** and **Hyperdimensional Prism**, which have no nomination record yet; they waited because he asked for the high-weight items. Cross-Domain Resonances, the hub, was judged not worth a face; a next weave may disagree.
- **Workshop:** `Enrichment/proposal-round-2026-11/` holds `MAKER-BRIEF.md` and `CHALLENGER-BRIEF.md` as day 2 ran them (each with a §6 from tuning item 11), `ROUND-NOTES.md` with its Day 2 block, `line.txt`, `landed-day-2.txt` and `records/<slug>.json`. Copied from a scratchpad that is cleared within days: the originals are gone, don't look for them — the copies are the record.
- **Main is unpushed:** about 455 commits ahead of origin. Only Loudon pushes.
- **Waits on Loudon:** approvals — 317 sections at proposal on 96 pages, 441 open offers (`node _ops/rich-face/proposals.mjs`, `--json` for the counts); he approves from the dock's ◇ approve or in chat, and an agent writes it with `node _ops/rich-face/approve.mjs "<Entry>" "<Section>" --via dock|chat`. Thirteen offers point past their own page (`section: "→ Page"`); the one on The Aftermath Frame is for BLUELINE's scroll — a contact authored 22 cm off the wood, where the fix moves the tool toward fidelity against BLUELINE's baton line that physical fidelity is "still the WRONG direction" (`Projects/BLUELINE/BLUELINE — baton.md:65`): a tension for him, not resolved. Graphic Storytelling's sections stay unapproved until its own baton's revision lands. The seven merged, clean app worktrees under `.claude/worktrees/` (floor-modes-b1b14c, practical-goldberg-06549a, scoped-linters-941839, steward-review-b487e5, topologies-read-d1d05c, upbeat-bassi-f75afa, agent-a52635a33234ca54f) that the classifier would not let an agent remove. And one call: Crystal Sonification Reference is the first face on a bundle file, not an entry — the resolver and the face switch serve it; whether that is wanted is his.
- **Open tool fixes (an elder's, not Loudon's):** `rich.js:184` sends hush to frames still at about:blank; a detached `new Audio()` sends no `rich:play`; conform's opaque frame reports fetches the live face makes; "reported no height" on Kuramoto Coupling and Ohm's Law; the `###` grain (one `##` = one stamp, one approval); `proposals.mjs` could group "→" offers under the page they are for.
- **Ceremony:** v2.8; tuning items 11 and 12 hold what the two days taught; one run line per day.

## Next move

Write a nomination record for Spinoza Conatus and for Hyperdimensional Prism — the claim each face should test, in the shape of any file in `records/` — then run each through the loop from the workshop briefs: maker in its own worktree, a challenger who did not make it, remake once, land as proposal, remove the worktree. When both land, close the card plain and delete this baton. Disk is the ceiling: each worktree is 2.7 GB.

## Calibrations from this session

Fewer, better; the test is the last step. A blind test states its chance level and verdict rule before the first trial, scores both arms, and is checked for leaks and confounds. A refutation builds the page's situation first, and a measurement goes through the project's own chain. A test must be able to fail: the null that found Photonic Time Crystals' delay-line bug is the model. Read the page's active baton before making. Prefer the page's own `##` grain — one section is one stamp and one approval. Kit: no code comment naming `rich:hush`; no detached `new Audio()`; conform's opaque-frame fetch warnings are not the live face. Makers write their run line. Never the owner's folder; never raw git. From day 2: ask what kind of claim a sentence makes before a piece tests it; the page's surrounding text is a leak surface; measure what is played, through the project's own chain, and name whose numbers these are; an offer names the page it is for (`section: "→ Page"` when that is another page).

## Load these files first

`Enrichment.md` · `Enrichment/Enrichment — tuning.md` (items 1, 3, 5, 9, 10, 11) · `Enrichment/proposal-round-2026-11/MAKER-BRIEF.md` and `CHALLENGER-BRIEF.md` · `_ops/rich-face/README.md` · `Kuramoto Coupling/Kuramoto Coupling — rich.json` · the page and its bundle · its record

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
