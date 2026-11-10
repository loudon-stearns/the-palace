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
The four checks are built and landed (`71d0f092`). What is left: see the steward's note work in a live cycle, and carry Loudon's four rulings on how far the checks reach.

## Why this move matters
This page says the baton and the steward are one atom on one board. In practice they are still blind to each other. Loudon, 2026-11-07: "I was testing to see how we would handle a baton and steward working at the same time… I imagine this will happen more and more."

The case, BLUELINE, 2026-11-04 to 11-07. A session left BLUELINE's reset baton on 2026-11-04 (`7cc04682`); its item 1 was to put the board record on the Set's tempo map. On 2026-11-05 BLUELINE's steward built that tempo map in two cycles (`2980ecfb`, `5426e608`) and filed the record's clock edit as a proposal in `BLUELINE — tuning` item 2. Nothing told the baton's card. On 2026-11-07 a session said the project was "still waiting"; its freshness check covered only the files it was about to edit, not the project. The baton was then brought up to date by hand at the close (`b3ad6656`).

## Current state
All four checks landed on 2026-11-10 in merge `71d0f092`, on Loudon's "Yes, land all". They share one read-only module, `_ops/stigmergy/steward-watch.mjs`.
1. A steward cycle that ships posts one note against each open or claimed card on its page (`_ops/stigmergy/orchestrator/src/process-cycle.js`, step 6d; `payload.kind: "handoff_steward_cycle"`). Tested on fixture palaces only. It has not run in a live cycle.
2. `pickup-handoff.mjs` warns of an active steward and lists its commits since the baton was born, its notes on the card and its owed proposals. Proved by dry run on BLUELINE's open card. `close-handoff.mjs` addresses the close to the steward. `palace-land` posts nothing to a steward: the close carries that word.
3. `_ops/stigmergy/project-since.mjs "<entry>"` prints every commit on a project, its steward's included. Nothing makes a session run it; the sentence asking for it is in [[Baton Ceremony]] § Announcing the Baton on the Board.
4. The launch prompt (`_ops/stigmergy/app/src/lib/launch-prompt.js`) leaves the baton file and its pointer until the close.

Spec words landed with them: [[Baton Ceremony]] v1.7, [[Project Stewardship System]] § What's Decided and its Context, and this page's opening.

## Next move
1. Watch for check 1 in a live cycle. BLUELINE has an open card and an active steward, so its next cycle that ships should post a note against that card (`node _ops/stigmergy/pickup-handoff.mjs blueline-remainder-20261107T123342Z --dry-run` lists the notes). If no note appears, that is a bug to find in step 6d, not a reason to wait longer.
2. Land the claim change. Loudon ruled on the build's four questions on 2026-11-10 ("Yes, your lean"): a landing does not tell the steward, the close does; the claim is addressed to the steward as the close is; a note on every shipping cycle stays; and the `project-since.mjs` sentence stays in the Baton Ceremony alone until it is seen whether sessions run it. Only the second needed code. It is built and tested on branch `fanout/claim-to-steward` (`00d6b697`, worktree `/Users/loudonstearns/Documents/palace-fanout-claim-to-steward`) and waits on his yes to land, with one sentence for [[Baton Ceremony]] § Announcing the Baton on the Board saying the claim is addressed too.
3. Stale and left alone: this page's paragraphs on each baton still say the [[BBS Blackboard]] "is nowhere in this loop". Show Loudon the words before changing them.

## Calibrations from this session
- A steward writes only its workshop, its scroll and its tuning ledger; a change it wants in the house is a proposal, owed until Loudon's ledger review. A check must not have the steward close or edit a baton.
- One route per edit: when a baton item and a steward proposal are the same change, say so on both and settle it once.
- "Still waiting" is a status claim. Check git on the project before making it.
- "Since the baton was born" and "since the card was posted" are different windows. A remainder card is reposted at each partial close while the baton file lives on, so the pickup reaches back to the baton's `born:`.

## Load these files first
1. `Palace development/Two Batons, One Board.md` — the atom.
2. `_ops/Baton Ceremony.md` § Announcing the Baton on the Board, and [[STIGMERGY]] § Handoff Lifecycle.
3. `_ops/stigmergy/steward-watch.mjs`, then `_ops/stigmergy/orchestrator/src/process-cycle.js` step 6d and `orchestrator/tests/unit/handoff-steward-note.test.js`.
4. `_ops/stigmergy/pickup-handoff.mjs`, `close-handoff.mjs`, `project-since.mjs`.
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
