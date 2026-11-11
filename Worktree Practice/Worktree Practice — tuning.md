---
title: "Worktree Practice — tuning"
born: 2026-11-11
links:
  - target: "[[Worktree Practice]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the record of what building in worktrees taught the practice, numbered, so the next elder who sends builders out reads the last fan-out's lessons before cutting a branch. Every fan-out leaves a line here; one that taught something also leaves a numbered item. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what building in worktrees taught Worktree Practice"
  run: "one fan-out, or one build made in a worktree of its own"
  line: "- run · <date> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the session that held the trunk, in the commit that records the run"
  merge: union
  kept: git
  trim: never
---

# Worktree Practice — tuning

What each fan-out or worktree build taught the practice. Each item names what the run showed and the change it forced on [[Worktree Practice]] or its tools, if any. Newest last. The fan-out of 2026-10-20/21 kept its own record before this ledger opened: `proofs/2026-10-21-fan-out/fan-out-ledger.md`.

## From the fan-out over open handoffs — 2026-11-10 and 11

Opened on Loudon's "Yes, open it" of 2026-11-11. Opus builders worked from open handoffs, each in a worktree of its own, with one session holding the trunk and landing on his yes. The Concierge drafted these four from the commits; the session checked them.

1. **A commit body is read later as a record, so its counts are exact.** Quote the count from the test set that was run, and name the command. `aae8c8ea` said six specs ran "161 passed together"; the next commit, `f64eb88e`, had to correct it to 189, with `queue-model.test.js` alone at 101. No spec change.

2. **A new test is proved by failing on the old code.** In the builder's own worktree, set the changed source aside (`git stash push -- <paths>`), run the new test file, see it fail, and bring the change back. The bodies carry the result: "6 pass (6 fail on the old code)" (`b71484c8`), "10 pass (9 of them fail on the old readers)" (`242f3da8`). Never in the main checkout ([[Worktree Practice]] § Gotchas). The stash step is the builder's account; only the fail-on-old results are in the commits. No spec change.

3. **A full run started while the next item's edit is in the tree counts that item too.** Rerun with it set aside before quoting a count. `31bd2926` quotes its after-count "with only this commit's change in the tree". No spec change.

4. **A failed `new-worktree.mjs` can leave a branch and no folder.** On 2026-11-10 a cut died partway on "Too many open files in system"; the branch was listed and the folder was gone. Run it again with the same `--name`: the script finds the branch and checks it out (`_ops/worktree/new-worktree.mjs:245-247`). `--base` is not read on that second run, so the branch stands where the failed run forked it. `--remove` refuses while the folder is missing. No spec change.

- run · 2026-11-10 · fan-out over open handoffs, builders on `fanout/*` branches · taught items 1–4
