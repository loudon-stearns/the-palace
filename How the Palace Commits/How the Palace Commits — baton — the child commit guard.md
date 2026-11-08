---
title: "How the Palace Commits — baton — the child commit guard"
born: 2026-11-08
links:
  - target: "[[How the Palace Commits]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[How the Palace Commits]] — the child commit guard — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: How the Palace Commits — the child commit guard

## Move
An elder builds a guard that stops a child session's write to main and hands it the words to ask Loudon to grow it up, and brings him a proposed CHILD line that says so, each before it lands.

## Why this move matters
On 2026-11-04 a child session (2770a569) made seven code changes to the TRICKSTER deck in Loudon's main checkout, where no elder had opened a workshop (`CLAUDE.md:44`), and committed each one to main itself straight after his "commit it". He never said "grow up". It never warned him and never asked to grow up (`CHILD.md:43`). Loudon kept the changes and said what should have happened: "I should have been warned and asked to grow up."

Why nothing stopped it:
- CHILD's house list names entries, frontmatter, links and canon; it names neither code nor main, and the room read it narrowly.
- The harness's general "commit when the user asks" was louder at action time, and CHILD never says "commit it" is not "grow up".
- How the Palace Commits is not in a child's birth set.
- Nothing fires at commit time. `.claude/settings.local.json` has no `hooks` key and there is no `.claude/settings.json`; the git commit-msg hook only annotates; the ear logs each such commit as `via=around` but is read only at a close.
- The Concierge saw the work in progress and was never asked.

This is a cousin of Closing Well — tuning item 46 (the birth text allowing a reading the spec didn't mean). The record is Closing Well — tuning item 81.

## Cold start
COLD START — this work has not begun; no prior state, no tried-and-rejected. The close that wrote this baton built and wrote neither the guard nor the CHILD line.

**Payload**
- **(a) The guard: a PreToolUse hook on Bash.** A command that writes to main (raw `git commit`, `add` or `merge` in the main checkout, or `palace-commit` / `palace-land`) from a session that has not grown up is stopped, and the child is given these words: "This writes to main, and I'm a child. Grow me up, or should the Concierge commit it?" Growing up is recorded when the session reads `ELDER.md`, by a PostToolUse marker keyed by session id. **Prove in the build:** the Concierge reading ELDER at its own boot must not mark the parent session as grown up, and the Concierge's own `palace-commit` must still pass.
- **(b) A proposed CHILD line, for Loudon's yes and not decided:** "A commit to main, code included, is a house write; 'commit it' is not 'grow up'." The wording is only a proposal.

Bring each to Loudon before it lands.

**Negative space**
- The seven TRICKSTER deck changes stay. Loudon: "I like the changes, so we leave them."
- Do not widen the guard to entries or other paths without asking him.
- CHILD.md is a World file every agent is born with, so any line there is canon and waits on his yes. No edit to CHILD.md, CLAUDE.md or a settings or hook file happens until he has seen it.
- The guard catches commits. It would not catch a child making code in the main checkout and leaving it uncommitted, which is the other half of the workshop rule. That is left out of this baton's scope on purpose; widening it is for Loudon to ask.

## Next move
Read the load list, then check the hook reading first: `.claude/settings.local.json` shows no `hooks` key rather than `hooks {}`; same substance, but confirm it still holds. Draft the hook and its marker, show Loudon the guard's words and what it will stop, and only on his yes wire it. Bring the CHILD line to him as text, separately. When the CHILD line lands, CHILD's tier-2 self-description scenarios fall owed again (`node _ops/self-description-test/due.mjs`); that elder's close carries them. Never a birth at the close.

## Receiving environment
Claude Code on the Mac, an elder session: this room after Loudon says "grow up", or the resident Concierge. The baton lives on main, on the page that owns the commit door, not on CHILD: an Active Baton section on a World file would reach every newborn.

## Calibrations from this session
- Loudon's words on substance are his; the CHILD wording is not yet.
- Honesty holds and taste yields: the line is his to word.
- Rows of the close that are still unanswered (the finished-group clause on the STIGMERGY PROJECTS line, the speed note, the opening, Preset Oracle's steward, the push) are not this baton's to settle.

## Load these files first
1. `How the Palace Commits.md` § Rules at the trunk
2. `CHILD.md:41-45`
3. `CLAUDE.md:44`
4. `_ops/stigmergy/app/server/door.js`
5. `.git/hooks/commit-msg`
6. `.git/palace-ear.jsonl` (`via=around` rows)
7. `Closing Well/Closing Well — tuning.md`, item 81 (this close's record) and item 46

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
