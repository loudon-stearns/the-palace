---
title: "README - The Palace Guide — baton"
born: 2026-11-09
links:
  - target: "[[README - The Palace Guide]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry a commission for the Palace Guide across a boundary: test the door on a stranger that is not Claude. I wait to be caught by the next Claude and am deleted once the move is picked up."
session_thread: "Daily Page, 2026-11-09 — the Guide rewritten as a door (1992eb9a); root README.md generated (b2b4e4c8). The first version of this baton (8005b120) also carried the newcomer's map; on Loudon's word that moved to [[STIGMERGY — baton]]."
---

# Baton: README - The Palace Guide

## Move

Run the cold-reader test on the root `README.md`. Give an AI that is not Claude only the README, ask it to make a small deposit, and watch where it goes.

## Why this move matters

The Guide is now the door for GitHub visitors and for any AI. Loudon, 2026-11-09: "I agree". So far it has only been read by its author. The test is whether a stranger model, with nothing but the door, reaches `CLAUDE.md`, stays a child, and does not commit with `git add .`.

The newcomer's map is no longer this page's work. Loudon, 2026-11-09: "I think the newcomer map can be concidered as part of the public site, maybe we have an "orientation" option on the public site for the very first time someone shows up at the door". It moved to [[STIGMERGY — baton]].

## Cold start

COLD START — this work has not begun; there is no prior state and nothing tried and rejected.

## Next move

Use the local Gemma in [[Gemma 4 — Local Coordination Guide]]. Give it `README.md` alone and a small deposit to make. Record three things: whether it reached `CLAUDE.md`, whether it stayed a child (offered rather than wrote), and how it would have committed. Put what it did on the Guide's scroll. If it went wrong, the door's words are what to fix, on Loudon's yes.

The stray older bundle `The Palace Guide/` is gone: nothing pointed at it, and Loudon said on 2026-11-11 to delete an unused bundle, since it lives in git (`099e3d82`). The test itself waits on one thing: Ollama is installed on this Mac and holds no model, so Gemma has to be pulled first, about 9.6 GB for `gemma4:latest`, and a download is Loudon's yes.

## Receiving environment

The work is on branch `claude/awesome-lovelace-4fc7d8`, in worktree `.claude/worktrees/dazzling-noyce-acd879`, until the morning's close lands it on main. After that, catch it from main. The test needs Gemma running locally on this Mac.

## Calibrations from this session

- His rule for the Guide: a door holds nothing another page owns.
- `README.md` is generated (`node _ops/readme/build-readme.mjs`; `--check` reports when it is stale). Never edit it by hand.

## Load these files first

1. `README.md` and `README - The Palace Guide.md`
2. [[Gemma 4 — Local Coordination Guide]]
3. The Guide's scroll and Context (§ The 2026-11-09 rewrite)

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
