---
title: "Worktree Practice — baton"
born: 2026-10-13
links:
  - target: "[[Worktree Practice]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Worktree Practice]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Worktree Practice — the rest of the door

## Move

Finish the door now that its tools are in: read what the ear heard after a day, sit with Loudon over what waits uncommitted in his folder, build the read-only strip, and take the week's measure.

## Why this move matters

On 2026-10-13 main moved 118 times in the owner checkout. 96 were direct commits, 46 of them stewards; a keeper that lands branches would have governed 22. On a throwaway copy, git's own locks left the shared index wrong in 9 of 17 races, and one lock held around every write left it right in 16 of 16. Every fix the palace ever put into code held, and every rule kept only in prose came back. So order went into the committer every writer already calls, and the history half went to Closing Well, the Return and the Weave, where Loudon is in the room. The tools are built; what is left is to learn from a week of them.

## What Loudon agreed to

On 2026-10-14, in his words or by his yes:
- The direction: no new agent for now, Policy 2 retired, the door plus the rites, built in the lighter order. "lets try it out."
- The history half goes to the rites.
- The survey may read other sessions' transcripts to name who left a file.
- A landing that dies halfway: "handle it." The next lock-holder finishes it quietly when every file it changed sits at the old or the new version, writes one line saying so, and leaves alone and names any file at neither.
- Steward commits ride along when he pushes: "stewards can ride along."
- The words for the trunk and the rites: "yes to the words, land them after the tools."
- Cowork is out of the design; he does no palace work there. He never commits by hand; his one hand path is the Trickster Commit in STIGMERGY, which already goes through the door.
- GitHub now refuses a force push or a deletion of main: Loudon turned on the ruleset "The palace Saftey" on 2026-10-14, with no bypass, and it was checked through GitHub's API. A rewrite he orders himself means switching it off, pushing, and switching it back on. Nothing is pushed without his word: `palace-push` prints the exact command with the full tip.

## Tried and rejected

- A standing keeper agent, the move this baton first carried: it would govern 22 of 118 moves of main, and a worktree-isolated agent is refused git in the owner, so it could not reach a keeper that lives there.
- Concierges messaging each other to take turns: they meet at the lock instead. A message between an auto-mode and a bypass-mode session is held and dropped after five minutes, and dies with its conversation.
- Landing by moving main's pointer alone, then catching the owner's files up one by one: a red team showed today's committer deleting landed work when run against a folder one landing behind. Deferred until the ear's week shows isolated landing is needed.
- A hand-written heal that compared and wrote files itself: an independent review found it misread git's own in-between states (a file unlinked and not yet rewritten, a mode-only change, a case-only rename, a file turned folder) and blocked the server. Git now does the judging and the writing.

## Current state

*As of 2026-10-18, all on main.*
- The door and the ear, at 48c923ad: one kernel lock every committer holds from its first `git add` to its commit; the ear writes every move of a branch to `.git/palace-ear.jsonl`, marked `door` or `around`.
- `palace-land` and the heal, at 96248960 (`_ops/stigmergy/app/scripts/palace-land.mjs`, `server/landing.js`). Thirty-two landing tests, and 32 kill-and-heal rounds of a 941-file landing on a full clone of the palace, 14 of them inside git's checkout, all healed.
- A heal now writes every file whole, the file in flight first, so a heal killed partway never leaves a file missing, at 008ad0df (the review's last verdict; 32 more double-kill rounds on the clone, all clean).
- `palace-push` and `trunk-state`, at 34771c74. Nothing has been pushed with `palace-push` yet; main was 258 ahead of origin on 2026-10-16, the oldest unsent two days old.
- The words, at 0957bb0e: the five trunk sentences (since 2026-10-15 in [[How the Palace Commits]] § Rules at the trunk, an entry another session deposited), the Concierge charter's sentence, Deposit's pointer, Closing Well 1.7, Return 1.2 (and a `trunk` probe in `return-map.mjs`), Weave 1.4.
- No steward cycle has run since 2026-10-15: the heartbeat fires at 06:00, when the Mac was asleep on battery with the lid closed, inside a few-second dark wake; on 10-16 and 10-17 its every-other-morning guard also skipped, because it counts whole days and the 10-15 run had started at 06:07. The ignored-file fix in cycle-commit.js has not had its first real use yet.
- The ear's first reading, 2026-10-16 03:53 UTC, after about 30 hours: 84 moves of main, all 84 through the door, none around it (49 palace-commit, 23 palace-land, 12 the server's own commits). No landing has died, so the heal has not been needed. Brought to Loudon the same night: the number says no fence for now.

Not built: the read-only strip on the LOG deck.

## Next move

*The board card for this move names a worktree, `close/2026-10-13-handoffs`, carried over from the first card when it was re-batoned. It is stale: this move has no worktree, and none should be recreated for it.*

The ear's first reading is done (Current state): nothing went around the door. Read it again at the week's measure. Then, in order:

- **The sitting**: with Loudon, over what sits uncommitted in his folder (135 paths on 2026-10-14; `trunk-state` names who wrote what it can), hover-card files first; then the read-only strip on the LOG deck, drawn from `trunk-state.mjs --json`.
- **The first branch with care**: `claude/inspiring-mahavira-3c2fee` stops tracking the regen lane's runtime files, which are dirty in the owner checkout, so `palace-land` will refuse it by name. Settle those files with Loudon first.
- **The next Weave**: set its date; the last ran on 2026-09-24. Its step 2.5 now runs `trunk-state`.
- **The measure**, after a week (around 2026-10-21): the fence, the live-preview trade, whether isolated sessions need landing by pointer, and whether a Lander or an Archivist page has earned its place.

## Calibrations from this session

- Lighter first. Build the catch-up and isolated landing only on evidence.
- Every rule lives once, beside the code that enforces it; cards point to it.
- Prove a mechanism on this Mac before building on it; stress it on a full clone; land in a gap between steward cycles (check `curl localhost:5173/api/stewards` for `worker.running`).
- An independent review earns its cost: the landing's found 29 real defects, none refuted. When a review finds many edge cases in hand-rolled code, lean on the tool's own machinery instead of patching each one.
- A test that fails can be the test's fault: a zsh array counted from 1, a symlink target, a fixed sleep that lost a race under load, and a kill-round probe file named like a file the palace already tracks.

## Load these files first

1. [[Worktree Practice — spec — the door]], the plan in this bundle (its page with the diagram: https://claude.ai/artifact/GezVoiegoGJA3ztJtHvUr6)
2. [[How the Palace Commits]] § Rules at the trunk
3. `_ops/stigmergy/app/scripts/trunk-state.mjs`, `palace-land.mjs` and `palace-push.mjs`
4. The research and design behind the plan, on this Mac only: `~/.claude/projects/-Users-loudonstearns-Documents-The-Palace/8307b946-f7b8-4493-b58e-44aac2ef06af/keeper-plan/`

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
