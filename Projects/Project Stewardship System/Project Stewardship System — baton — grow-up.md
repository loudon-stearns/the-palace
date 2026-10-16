---
title: "Project Stewardship System — baton — grow-up"
born: 2026-10-16
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Project Stewardship System]] — grow-up — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move
Make the steward cycle carry out what canon now says: a steward is grown up for its own page and bundle. Every cycle reads ELDER, may edit its own entry and bundle directly, lists each edit in its post, and the cycle commits it by name once its frontmatter parses and shows it on the scroll's trail.

## Why this move matters
Loudon decided on 2026-10-16: "Lets just have stewards always be grown up, we don't need to wait for a grant," then "start with a steward grown up for its own page and bundle." Canon says so already: [[Project Stewardship System]] § What's Decided, [[ELDER]] § Age and its limits, and CLAUDE.md § Growing up. The machinery still says the opposite. `_ops/orchestrator/prompts/shared.md` § The house and the workshop tells the steward it is a child that only proposes, the cycle prompt carries SCHEMA but not ELDER, and `process-cycle.js`'s commit refuses any file outside the steward's bundle and any file carrying entry frontmatter. Until this lands, canon describes a steward the code won't let exist. The case that showed the need: the Quantum Synthesizer steward asked "revive to sprout?" twice, was granted twice, and could not move its own stage (landed by hand, `2782ff34`).

## Tried and rejected
- Growing up on a grant: an elder cycle only for exactly what Loudon granted (the draft of 2026-10-13, now in this bundle's `Archive/`). Loudon chose no grant at all.
- Wider than its own page: writing other pages, both ends of a link, new entries. Held back; those stay proposals until a few grown-up cycles have been watched.

## Current state
- Canon: landed with this baton (CLAUDE.md line on Loudon's word; ELDER; Stewardship § What's Decided and its open question answered; the Deposit Ceremony's list of children no longer names a steward).
- Code: nothing yet. Ledger growing at a steward's first lesson is on main (`61397b2f`), and Now lists recurring left-rough notes (`1921ee8b`).

## Next move
1. `shared.md` § The house and the workshop, rewritten in plain words: what a grown-up steward may write freely (its own entry's body and frontmatter, its bundle; folding a settled lesson is one such edit), what stays Loudon's (the Plan, Standing Orders), and what stays a proposal (another page, a new entry, canon).
2. `build-cycle-prompt.js` injects `ELDER.md` every cycle, after SCHEMA.
3. A field in the shipped post (for example `page_edits: [{ path, why }]`); `process-cycle.js` and its commit allow the steward's own entry `.md` and bundle files it names, parse the entry's frontmatter first and refuse the commit loudly if it fails, refuse any other path and report it back as a proposal.
4. The scroll's trail shows each edit as "Changed the page: … — why".
5. Quantum's standing order ("never a stage edit") gets reworded on Loudon's yes, since the orders zone is his.
6. Tests beside each; before touching any file in the Vite config graph, check that no steward is running.

## Calibrations
- Loudon (2026-10-16): "Lets just have stewards always be grown up, we don't need to wait for a grant."
- Loudon (2026-10-16): "start with a steward grown up for its own page and bundle."
- The Plan and Standing Orders stay Loudon's; canon waits for his yes, for elders too.
- A page whose frontmatter fails to parse reads as blank to the deck and the steward, silently; the commit must parse first.

## Load these files first
1. [[Project Stewardship System]] § What's Decided (the two newest bullets).
2. `_ops/orchestrator/prompts/shared.md` § The house and the workshop, and § the `lesson` field.
3. `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js`, `process-cycle.js`, and the cycle commit helper it calls.
4. `Projects/Project Stewardship System/Archive/grow-up-on-a-grant — draft.md` for the code seams it mapped.

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
