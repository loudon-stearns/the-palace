---
title: "Adopt the Craft, Author the Seam — baton"
born: 2026-10-22
links:
  - target: "[[Adopt the Craft, Author the Seam]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Adopt the Craft, Author the Seam]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Adopt the Craft, Author the Seam

## Move
Carry the Daily Page's *Hand the Groove* roughs on through [[Enrichment]], into the rich face that already exists, and bring its two lagging sections back in step with the tuned page.

## Why this move matters
The page now says what the morning's rough found. On Loudon's "(yes)" of 2026-11-11 it carries two senses of seam: the swap, where a reader with taste gives way to a reader with defaults, and the edge of the norm, where the author works (`f7754cd3`). The groove test is where the two meet, and it is the page's first evidence outside BLUELINE. The face has not caught up with the words.

## Current state
As of 2026-11-17, board card `adopt-the-craft-author-the-seam-remainder-20261117T114809Z`:
- **Landed.** The new section § The edge of the norm; the lead reworded to taste and defaults; a paragraph naming both senses; [[Simondon]] named beside "One vocabulary, three jobs"; [[Blocked, Not Prompted]] `exemplifies` this page with its sentence; the forward vector asks to be tried in a third craft. The third-swap question stays open on the page.
- **The rich face exists.** Three pieces at proposal: "match it by ear", "where it stops being a groove", "which one is the drummer". Two sections now lag the text: "One vocabulary, three jobs" and "The generalization" (`node _ops/rich-face/fingerprint.mjs "Adopt the Craft, Author the Seam"`). `— rich — challenge.md` quotes the old lead, "requires exactness", as the page's words.
- **The roughs are the material.** `proofs/2026-10-19-hand-the-groove-to-a-machine/`, rough one and rough two, with `outside-read.md`.
- **Not checked.** Nobody played the roughs for the tune. "The groove limps, then comes loose" rests on the scroll's trail entry. "[[Comic and Cinema — Two Ways of Seeing]] already uses the word this way" is a reading of that page, whose line 38 still credits the join to this page's old sense.

## Next move
1. Read the scroll's Now and its trail, then play rough two.
2. Enrich. Ask Enrichment's one question of the roughs: what can only be heard or played here? The limping and coming-loose ranges and the hidden-groove game are where the norm and its breaking point can be played, and § The edge of the norm is now the strongest candidate for the face's centre. Each new proof goes in its own dated folder under `proofs/`, with a trail entry on the scroll.
3. Bring the two lagging sections back in step: read each piece against the new text, then re-stamp or remake.
4. Offer, words first: one sentence on [[Comic and Cinema — Two Ways of Seeing]] line 38, pointing its seam at § The edge of the norm.

## Calibrations
- "Seam" carries two senses here on purpose. The page says "second sense", not "second seam", because seam 1 and seam 2 already name BLUELINE's two swaps.
- The taste-and-defaults wording came from the outside read (§ Where it would teach badly). Loudon approved it with the tune on 2026-11-17.
- Do not fold into [[Search Before You Build]]: one is a practice, this one is a concept.
- BLUELINE's `proofs/seam-a-roundtrip/` already tests seam 1. Don't rebuild the depth-slider piece.
- Write HTML with Bash heredocs or `cp`, never the Write tool: Write opens the file in the browser pane ([[The Daily Page — tuning]] items 19 and 27).

## Load these files first
1. `Adopt the Craft, Author the Seam/Adopt the Craft, Author the Seam — scroll.md`
2. `Adopt the Craft, Author the Seam.md`
3. `Adopt the Craft, Author the Seam/Adopt the Craft, Author the Seam — rich.json` and `— rich — challenge.md`
4. `Adopt the Craft, Author the Seam/proofs/2026-10-19-hand-the-groove-to-a-machine/hand-the-groove-to-a-machine-2.html` and `outside-read.md`
5. `Enrichment.md`, and the design manifest before anything visual

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
