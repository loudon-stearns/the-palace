---
title: "Project Stewardship System — baton — ledger-review"
born: 2026-10-18
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Project Stewardship System]] — ledger-review — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Project Stewardship System — the ledger review

## Move
Design the ledger review with Loudon, then build it on the seam already in `ledger.js`: the way he goes through stewards' proposals and decides what lands in canon.

## Why this move matters
On 2026-10-18, at a close, Loudon withdrew the stewards' own-page rule (2026-10-16) and the Shopkeeper's grant over `Shop/` (made that morning): "I don't like the editing of canon without my eyes, I made a mistake in approving this. I think this is a use of the ledger, what the steward wants to edit is place in a tuning ledger and used in the future, and eventually we go through the tuning ledgers to see what we actualy want to place in canon." Then: "I'd like the shopkeeper grant to follow a similar process, use the tuning ledger." Then: "Lets move forward, with the work we can do right now, while we brainstorm on the review." The route landed (`83d6f4e8`). Stewards now file proposals, but nothing pays or declines them, and nothing shows him a count. Until the review exists they pile up unseen.

## What Loudon has said about the review
- **Triggers, his answer "all three":** pressure (a page with owed proposals shows under "needs you" on the PROJECTS deck), a mention at the Return, and the Weave's sweep.
- **Offered, not chosen** (he answered only "all three"): the review as a Harvest over the ledgers that routes to the Deposit, with the Concierge drafting one map per page; and urgent proposals reaching him at once as a Trickster ask.
- **The card:** agreed at the panel, then turned by the reversal into a proposal card *before* any edit. It shows the words before and after. A decline carries a one-line reason back to the steward. A new-Specialist card links its probe.
- **His question:** "Will Stewards know to look to the ledger for their own edits when the work again? They will be treating their own ledger items as page additions before they do their work." It is answered in the build: pending proposals show right after the home entry as "Your page, as you have proposed it", are read as already holding, stay out of the to-do list, the latest wins, and a decline shows once with its reason.
- **This morning's five steward page edits stay**, and they are not review items: "You can leave this morning's edits, not a big deal." (`212c2005`, `99b71ea4`, `91addc1c`, `5597ac71`, `521f4962`)

## Current state — the seam (`_ops/stigmergy/orchestrator/src/ledger.js`)
- **The stop.** A cycle commits only a steward's workshop files: bundle files that are not entries (no `type:`). It refuses the steward's own entry, its faces and memory, other entries, other pages and canon. Faces and memory means the Context, the rich face and its pieces, the diary, batons, and any `.md` whose frontmatter says `ledger:` (`faceOrMemory` in `vetPageEdits`, easy to narrow). `grown_up_for` is no longer read, and `shop-roster.js` no longer fires.
- **The route.** A steward posts `payload.proposed_edits: [{ page, place, words, why, replaces?, urgent? }]`. The cycle files each one as a numbered item in that steward's tuning ledger, growing the ledger if it has none. The item is tagged `canon change owed *(proposed by the steward, cycle N)*`, with Why, Path (or "none yet (a new page)"), and the words quoted, cut at 60 lines. The run line reads `proposed items N, M for canon`.
- **`listOwedProposals(palaceRoot)`** returns every steward's owed proposals, oldest first, as `{ steward, ledger, page, path, exists, place, why, words, date, n, by, urgent, ask, line }`. That is enough to group them by target page.
- **`payProposal(ledgerPath, n, commit)`** sets the status to `paid in <commit> on <YYYY-MM-DD HH:MM>`. **`declineProposal(ledgerPath, n, reason)`** sets it to `declined on <…>: <his one line>`. Both go through `settleProposals`, in place, keeping the tag. A settled item leaves parseOwed, the tail read, Now and `listOwedProposals`. The steward's next run reads it once, under "Since your last run, Loudon settled these".
- **Superseding:** `replaces: ["<item>"]` marks an older item `superseded by item N`.
- **Urgent:** `urgent: true` also posts a non-blocking Trickster RESOURCE_REQUEST (`<message id>-urgent-<k>`; options LAND-NOW · REVIEW · DECLINE). The deck's grant or deny does not settle the ledger item yet; whoever lands it pays it.
- **Not built — the review's part:**
  - who calls pay and decline;
  - the deck's "needs you" pressure and a count of owed proposals (the "N owed" badge in `app/server/projects.js` leaves proposals out);
  - the mention at the Return;
  - the Weave's sweep;
  - the Harvest producing one map per page;
  - a way to withdraw a proposal outright (only `replaces` exists).

  Edits a steward writes to disk anyway stay refused and uncommitted; nothing turns them into proposals.

  **Two fixes for later, on Loudon's word at the close (2026-10-18): "reading page edits and lint doc-drift should be fixed in the future."** `Projects/Project Stewardship System/fleet/fleet-reading.mjs:94` reads `page_edits` as the sign a steward changed its page; it now means workshop files only, so count `proposed_edits` too. `_ops/swarm/lint-doc-drift.py:318`'s comment says a steward cycle refreshes a generated block; no cycle edits a source now.
- **The canon that describes all this is drafted but unwritten.** It covers ELDER, Deposit v2.4 with tuning item 26, the stewardship page and its Context, the Shopkeeper's page, the Maker drift note, the Weave Context, SCHEMA — Reference §6 and Substrate Skill:181. It waits on Loudon's read in `canon-drafts-ledger-route.md`, outside the palace: `~/Library/Application Support/Claude/side-session-notes/local_ef89e62b-bb3f-4db0-ab7d-a32dc0c906e2/`. If it has neither landed nor been committed to a branch when you catch this, make that branch commit first: a docs worktree, committed, never merged, shown to Loudon.
- **The Shopkeeper's first proposal** will likely be the FLUX staleness note Loudon granted (LAND-NOTE, 2026-10-18 16:10Z), already drafted in `Shop/Shopkeeper/drafts/`. Its order (`3a00f6e1`) sends its changes to `proposed_edits`.

## Tried and rejected
- Stewards grown up for their own page, and the Shopkeeper for all of `Shop/`: withdrawn the same day.
- Restoring the Shopkeeper's old order: "I don't think the old order is appropriate; instead it should talk about the ledger and how it is used."
- A notice card after an edit: turned into a proposal card before it.
- This morning's five edits as the review's first batch: he left them.

## Next move
Sit with Loudon and settle the two offered pieces: the Harvest-to-Deposit framing, and whether granting an urgent ask settles its ledger item. Then build the smallest review that pays or declines one real proposal end to end, likely the Shopkeeper's first.

## Receiving environment
On main; there is no worktree. Build in your own worktree (`_ops/worktree/SKILL.md`). Land with `palace-land` only while `curl -s localhost:5173/api/stewards` shows `worker.running: false`.

## Calibrations from this session
- Loudon approves canon from plain descriptions. A description must name every rule its words write down (Closing Well tuning item 49).
- Canon waiting on his read waits as a branch commit, never in a scratch or notes file (Deposit tuning items 15 and 22; Closing Well item 48).

## Load these files first
- `_ops/stigmergy/orchestrator/src/ledger.js`
- `_ops/stigmergy/orchestrator/src/cycle-commit.js` (`vetPageEdits`, `faceOrMemory`)
- `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js` (the as-if section)
- `Projects/Project Stewardship System.md` § What's Decided
- `_ops/Harvest Ceremony.md`, `_ops/Deposit Ceremony.md`
- the canon-drafts file above, until it lands

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
