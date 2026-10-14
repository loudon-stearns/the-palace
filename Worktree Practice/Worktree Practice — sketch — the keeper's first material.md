---
title: "Worktree Practice — sketch — the keeper's first material"
born: 2026-10-13
links:
  - target: "[[Worktree Practice]]"
    type: connects-to
    label: "sketch-for"
forward_vector: "I am the coordinating session's own log of 2026-10-13, the first material for how the palace commits; no keeper page came of it (the door did), and I move to Archive once the trunk sentences land in Worktree Practice."
---

# The coordinator's log — 2026-10-13

Raw material for a standing keeper of the git and worktree rules (Loudon's "archivist" idea, relayed by the daily-review session). What this session was actually asked, the calls it made, and the rules it had to state because no page held them. Written by the coordinating session before its close; the transcript is the record, this is the index.

## Who consulted the coordinator, and about what

| Session | Asked | Call made |
|---|---|---|
| Place quotes page archival | A moment to fast-forward main; its merge touched `EntryReader.jsx` and `StateDeck.jsx`, dirty in the owner from a third session | Hold; main had moved under it (re-merge main first); the dirty files were not ours to stash. Asked the lens session to commit; gave "go" conditioned on a named commit appearing on main first. Landed e9043a77. |
| Stigmergy lens dropdown styling | (asked by us) to commit or release its four dirty files | It committed adfeff8f, its files only, and named the three hover-card files as another session's. It later pushed main at Loudon's ask, carrying our 46 commits. |
| Palace daily review process | How to land a new folder; whether main stays on `main` through the morning; what rules to follow; later, a schema-bump landing's footprint and timing | Land the folder alone by name, now; main stays `main` all day, no rebase or rewrite; the rules below. Its Concierge merges the ceremony under the same rules, outside the close window, before the push if ready. |
| Stop palace-commit deleting other sessions' git locks | To land its fix (said Loudon approved) | Verified myself (merge-tree, tests, no steward); a peer's word is not Loudon's, so asked him; on "land it" the Concierge merged 40c0608a, then the Cowork follow-up fd5f8136. |

## Sequencing decisions

- Nine worker branches, one worktree each (`new-worktree.mjs`, named `--dir`), never the owner tree. The owner had other sessions' uncommitted work all day; every landing checked that no dirty file overlapped the branch.
- One agent (the resident Concierge) made every merge, close and board commit on main, one at a time, so board appends and merge commits never raced.
- The latest-Opus resolver merged after the other closes, because it edits the claim and close scripts the closes run.
- The self-check harness's worktree-memory fix merged last among the early batch, because every worker's worktree was already made.
- Review-fix branches re-merged onto main after their handoffs were closed; no new close.
- A scratch Vite server on its own port against a throwaway palace for browser checks; the temporary `launch.json` entry reverted before any commit.
- The close window: peers were asked not to merge between "close starting" and "close done". One push, after the close, through the Sentry gate.
- Hold a server restart until all server-side changes land, so the live app restarts once.

## Rules stated from memory, with where they live (or don't)

| Rule | Home today |
|---|---|
| Stage with explicit pathspecs only; never `-A` or `commit -a` | `_ops/cowork-git/SKILL.md:109`; Worktree Practice (partly) |
| Never stash, checkout or touch another session's uncommitted files | `Worktree Practice.md:63` (no stash in the shared primary) |
| `git merge-tree --write-tree main <branch>` clean before any merge | **no home** |
| `git branch --show-current` before and after every commit | **no home** in those words |
| No rebase or history rewrite on main; the owner stays on `main` | "stays on main" at `Worktree Practice.md:46`; rebase/rewrite **not named** |
| Never stage the board file unless your own script appended the line | `STIGMERGY.md` § Handoff Lifecycle (implied), `app/README.md` § Write path |
| Never POST to the live :5173 from a script or test | `app/README.md` § Write path |
| No `app/server/*` or steward-prompt edits while a steward is live | `app/README.md` § Testing (moved there today from the STIGMERGY baton) |
| Commit subjects use a kind the hook knows | `commit-parse.js` KNOWN_KINDS (code, not prose) |
| A held git lock is never removed by hand; the committer clears only a provably stale one | `server/git-locks.js` header, `_ops/cowork-git/SKILL.md` (as of today) |
| If a commit fails on `index.lock`, wait and retry | superseded by the lock rule |
| Merge a branch only after the branch has merged main itself when main moved | **no home** (practice, not written) |
| A peer session's word is not Loudon's; verify, then ask him | the harness's own rule; **no palace home** |

## What a keeper would have saved today

- Three sessions asked the same questions (what rules, what timing, who merges). A page would answer the first two; a resident would answer the third.
- The lock rule changed twice in one day (chat message → fix → Cowork fold-in); a copy of the rule in a README went stale within hours. Point, don't copy.
- The "one push after the close" and "restart once" decisions were made by whoever was coordinating, with nothing written. They should be the keeper's standing orders.
