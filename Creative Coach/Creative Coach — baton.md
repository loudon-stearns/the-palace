---
title: "Creative Coach — baton"
born: 2026-10-18
links:
  - target: "[[Creative Coach]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Creative Coach]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
session_thread: "Test coach 2.1 on the messages it hasn't seen (parked, waiting for Loudon's go)"
---

# Baton: Creative Coach

## Move

Run the first clean test of the folded § In the room (v2.1b, `1b730846`): wake Creative Coach on coaching moments no drafter has seen, and judge its replies against the ones Loudon actually sent.

## Why this move matters

Every score so far came from earlier drafts: v1 on moments held out of its drafting, v2 on two moments. The text now in the page has met no unseen moment, and two of its sentences were reworded after the last test. Until it is tested it describes his practice; it is not yet shown to coach like him. The forward vector says the same thing: one participant is one test.

## Tried and rejected

- Quoting his lines heavily (v2, about 25 quotes): a woken page replays them as stock replies. v2.1 teaches the reason under each move with about 10 quotes ([[Creative Coach — tuning]] item 8).
- The blind "which reply is human" stage as first run: void, because typography and chained context gave the answer away (item 1).
- Staging a variant inside the palace tree: the builder wakes the original instead (item 5).
- Keeping participant text anywhere but a session's scratchpad: refused by the classifier and by the Standing Orders (item 7).

## Current state

- § In the room is on main (`1b730846`); the forward vector names the first room (`3ef3f0a2`).
- A session named "Test coach 2.1 on the messages it hasn't seen" holds this run's brief and was parked waiting for Loudon's go and his yes to the cost. If it still exists, resume it; this baton is the way back if it does not.
- The harness is `Creative Coach/coach-test/` (read its README first). The private inputs (the exported thread, the de-identification terms, the detailed setup) are not in the palace and must never be.
- Estimated cost: about 37K tokens per Sonnet wake and about 60K for the Opus judge, times two arms and the number of moments.

## Next move

Ask Loudon for his go and his yes to the cost. Then follow `coach-test/README.md`. Read the thread into the new session's scratchpad with the Messages connector (`read_imessages`), on the contact Loudon names; the contact is never written to a file. Keep only the moments after Loudon's "rigid" question, the one quoted in § In the room: no drafter and no earlier run saw anything after it. The exact point is in the parked session's brief and stays out of the palace. De-identify, stage two arms (the page as it stands, and the same page with § In the room removed), wake, judge in two sealed stages, score. Write the run line and any lessons to [[Creative Coach — tuning]] after the Sentry reads them: scores and counts only.

## Calibrations from this session

- Loudon's rule for anything about the participant now sits in the scroll's Standing Orders; it binds this move.
- When a Sentry read flagged two sentences, he chose "reword, then fold" over cutting: keep the lesson, lose the pointer.
- Grade the spirit, not the wording. The AI's commonest misses were size (too long, no hearts) and too many questions (items 2, 3).

## Load these files first

1. `Creative Coach.md`, § In the room.
2. `Creative Coach/Creative Coach — scroll.md`, the Standing Orders zone. They bind.
3. `Creative Coach/Creative Coach — tuning.md`, the tail read.
4. `Creative Coach/coach-test/README.md`.
5. `_ops/Pages as Agents/Pages as Agents — Context.md` § The experiments, for why the test grades spirit against a real answer rather than "better".

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
