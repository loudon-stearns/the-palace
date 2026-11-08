---
title: "Two Batons, One Board — baton"
born: 2026-11-07
links:
  - target: "[[Two Batons, One Board]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Two Batons, One Board]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Two Batons, One Board — when a baton and a steward work the same project

## Move
Build four checks so a baton and a steward working one project at the same time each see what the other did: a steward cycle that advances an active baton's item posts against that baton's card; `pickup-handoff.mjs` warns when the project has an active steward and lists its cycles since the baton was born, and the close and the landing post to the steward; a status claim like "still waiting" re-checks git on the project first; and the launch prompt stops telling the catcher to delete the baton at pickup.

## Why this move matters
This page says the baton and the steward are one atom on one board. In practice they are still blind to each other. Loudon, 2026-11-07: "I was testing to see how we would handle a baton and steward working at the same time… I imagine this will happen more and more."

The case, BLUELINE, 2026-11-04 to 11-07. A session left BLUELINE's reset baton on 2026-11-04 (`7cc04682`); its item 1 was to put the board record on the Set's tempo map. On 2026-11-05 BLUELINE's steward built that tempo map in two cycles (`2980ecfb`, `5426e608`) and filed the record's clock edit as a proposal in `BLUELINE — tuning` item 2. Nothing told the baton's card. On 2026-11-07 a session said the project was "still waiting"; its freshness check covered only the files it was about to edit, not the project. The baton was then brought up to date by hand at the close (`b3ad6656`).

## Current state
Nothing built. Where each check would sit:
1. `_ops/stigmergy/orchestrator/src/process-cycle.js` commits a steward cycle and posts its lines; it reads no handoff cards. Spec home: [[Project Stewardship System]].
2. `_ops/stigmergy/pickup-handoff.mjs` prints every commit that touched the entry since the baton posted, then claims; it does not ask whether a steward is active (`_ops/agents/permanent/<slug>/`). `close-handoff.mjs` and `palace-land` post nothing to a steward.
3. No check exists. The claim was made in a session's own words.
4. `_ops/stigmergy/app/src/lib/launch-prompt.js:102` reads "mark it caught, then delete the baton file — git is its archive." The On-pickup checklist (step 8) deletes at the close, not the catch. Implicated in Closing Well — tuning item 69. Loudon chose to add this check, 2026-11-07.

## Next move
Start with check 2, the smallest, and prove it on BLUELINE's open card, which has an active steward. Then 1, then 4, then 3. Code and spec changes to [[Baton Ceremony]] and [[Project Stewardship System]] go on a worktree of your own (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`), landed on Loudon's yes.

## Calibrations from this session
- A steward writes only its workshop, its scroll and its tuning ledger; a change it wants in the house is a proposal, owed until Loudon's ledger review. A check must not have the steward close or edit a baton.
- One route per edit: when a baton item and a steward proposal are the same change, say so on both and settle it once.
- "Still waiting" is a status claim. Check git on the project before making it.

## Load these files first
1. `Palace development/Two Batons, One Board.md` — the atom.
2. `_ops/Baton Ceremony.md` § Announcing the Baton on the Board, and [[STIGMERGY]] § Handoff Lifecycle.
3. `Projects/Project Stewardship System.md`, then `_ops/stigmergy/orchestrator/src/process-cycle.js`.
4. `_ops/stigmergy/pickup-handoff.mjs`, `close-handoff.mjs`, `handoff-model.mjs`, and `app/src/lib/launch-prompt.js`.
5. The case: `Projects/BLUELINE/BLUELINE — baton.md`, `BLUELINE — tuning.md`, and `git log --since=2026-11-04 -- Projects/BLUELINE`.

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
