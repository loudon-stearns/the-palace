---
title: "Worktree Practice — baton"
born: 2026-10-13
links:
  - target: "[[Worktree Practice]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Worktree Practice]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Worktree Practice — the keeper

## Move

Stand up a standing keeper of the git and worktree rules, as a trial. Write its two policies into [[Worktree Practice]] (shown to Loudon first), settle its name, mint its page through the [[Deposit Ceremony]], and build its resident in `_ops/` on the Concierge's pattern, with a tuning ledger of its own.

## Why this move matters

On 2026-10-13 one coordinating session ran nine worker branches and an open owner tree. Three other sessions asked it the same questions (what rules, what timing, who merges). It answered from memory and stated thirteen rules; the sketch lists them with where each lives, or doesn't. The lock rule changed twice in a day, and a copy of it in a README went stale within hours. A page answers the first two questions. A resident answers the third. The first material is [[Worktree Practice — sketch — the keeper's first material]].

Loudon: "I like your solution to the git rules, lets move forward… see how it goes."

## What Loudon agreed to

A thin agent: a page, plus a resident with three postures and a tuning ledger, running on two policies.

- **Policy 1.** The owner checkout takes no session's uncommitted edits to tracked code. Every session that changes code works in a worktree.
- **Policy 2.** `main` is written only by the keeper's serialized merges, through the existing committer.
- **Survey.** Every worktree, every dirty file, every unpushed commit, and who owns what.
- **Land.** The serialized merge, under the rules.
- **Push.** The Sentry gate first, then one line recording what left.

The name is unsettled. It is a trial; Loudon wants to see how it goes.

## Tried and rejected

- **Copying the rules into the keeper's page.** The page points at the rules and never copies them; a copy went stale within hours the day this was agreed.
- **Committing the unclaimed files blind.** See the first case below.

## Current state

*As of 2026-10-13.* There is no keeper page and no resident. [[Worktree Practice]] holds neither policy yet. Three rules the day's sessions all kept and that had no home (trial the merge with `git merge-tree --write-tree main <branch>`; no rebase or rewrite on `main`; `git branch --show-current` before and after every commit) are prepared for Loudon's read on branch `prepare/worktree-practice-trunk-rules`, not landed. If it has landed, they sit in Worktree Practice under "Rules at the trunk"; the keeper's page points there.

**The first case.** Three files sit in the owner tree and belong to no session that has claimed them. At about 13:50 on 2026-10-13:
- `_ops/stigmergy/app/src/components/state/EntryList.jsx` and `TopologyLens.jsx` are modified and uncommitted.
- `_ops/stigmergy/app/src/components/state/EntryHoverCard.jsx` is untracked.

The lens session committed its own four files as `adfeff8f` and named these three as another session's. Nothing here was committed or touched by the close.

## Next move

1. Write the two policies into Worktree Practice, and show Loudon the words before they land: a branch, a diff, his yes.
2. Settle the keeper's name with him.
3. Mint the page through the Deposit Ceremony, with his map and his read.
4. Build the resident in `_ops/`, on the Concierge's pattern (`_ops/concierge/prompts/companion.md`), with its three postures and its tuning ledger.
5. Run the first case through it: find an owner for the three files, or park them. Never commit them blind.

## Calibrations from this session

- **A trial, and thin:** a page, a resident, a ledger. Nothing heavier.
- **Point, don't copy.** If a rule has a home, the keeper's page names the home.

## Load these files first

1. [[Worktree Practice — sketch — the keeper's first material]]
2. `_ops/worktree/SKILL.md`
3. `_ops/stigmergy/app/server/git-locks.js`
4. `_ops/concierge/prompts/companion.md`

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
