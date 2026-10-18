---
title: "How the Palace Commits — baton — retire-cowork"
born: 2026-10-18
links:
  - target: "[[How the Palace Commits]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[How the Palace Commits]] — retire-cowork — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Retire the Cowork commit pieces Loudon said yes to retiring on 2026-10-18, and bring the words that describe them in line.

## Why this move matters

Loudon does no palace work in Cowork and never commits by hand (2026-10-14; [[How the Palace Commits]], and [[Worktree Practice — spec — the door]] § Loudon's decisions). The machinery and advice built for Cowork's sandbox still stand, and some of the advice is now wrong: Surfaces and Capabilities still tells a session how to commit from Cowork, and Deposit step 7 still tells Cowork to post a commit hand-off. Code nothing should call can still be called.

## Current state

Loudon's yes, 2026-10-18: "retire the cowork pieces". Nothing is removed yet. The scope he said yes to:
- the Cowork committer, `_ops/cowork-git/` (`SKILL.md`, `commit.mjs`, `handoff.mjs`); `commit.mjs` passes through the door today via `commitSelected`;
- its lock-renaming code: the sweep that renames `.lock` files because the Cowork sandbox cannot unlink (`_ops/cowork-git/commit.mjs`), any path in `_ops/stigmergy/app/server/git-locks.js` that only Cowork needs, and `_ops/stigmergy/app/tests/integration/cowork-git-locks.test.js`;
- the commit hand-off queue: `handoff.mjs`, the `commit_handoff` board kind, and the Return's Cowork probe (`_ops/Return Ceremony.md`; Return tuning item 7);
- the Cowork git advice in `Surfaces and Capabilities.md` (§ Cowork, line 61, and the capability table's Cowork column where it speaks of committing);
- [[Substrate Skill]] § Committing from Cowork (`_ops/Substrate Skill.md`, about lines 200 to 202). The open weave flag `commons-the-palace-1792122357104` asks for this; resolve it in the landing commit with `--resolves commons-the-palace-1792122357104`;
- Deposit step 7's Cowork sentence (`_ops/Deposit Ceremony.md`: "From Cowork, canon doesn't commit. Post the plan as a `commit_handoff` …");
- other live mentions: `STIGMERGY.md`, `The Adjacent Affordance.md`, `_ops/self-description-test/birth.mjs`. Archives, old board lines and old session files are history and stay.

## Next move

In a worktree of its own, find every caller and mention first (`git grep -n -I -e cowork-git -e commit_handoff -e Cowork`) and confirm nothing live depends on them: the STIGMERGY server, `_ops/concierge/return-map.mjs`, any test. Then remove the code with its tests, rewrite the words, run the app and orchestrator suites, and land with `palace-land`. Show Loudon the rewritten sentences in plain words before landing, because Surfaces and Capabilities and the Substrate Skill are canon. When it lands, repoint Loudon's memory note `user_how_loudon_commits.md` and its MEMORY.md line to the landed change.

## Tried and rejected

- Placing it at the close: removing code needs a worktree and tests.

## Load these files first

1. [[How the Palace Commits]]
2. `_ops/cowork-git/`
3. `Surfaces and Capabilities.md` § Cowork; `_ops/Substrate Skill.md` § Committing from Cowork; `_ops/Deposit Ceremony.md` step 7
4. `_ops/stigmergy/app/server/git-locks.js`

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
