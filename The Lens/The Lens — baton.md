---
title: "The Lens — baton"
born: 2026-10-23
links:
  - target: "[[The Lens]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[The Lens]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
session_thread: "Daily Page, 2026-10-23, The Lens"
---

# Baton: The Lens

## Move
Teach STIGMERGY's `[L]ens` to be bold: each glass reads in its own register and from its own life, and the reading is named as the glass's own. Then prove it with real lensings, and give the page a face that shows it.

## Why this move matters
On the 2026-10-23 Daily Page, Loudon named all seven hand-written glasses in a blind game and still called it a miss: "They all had a very similar voice, they all sounded like 'Claude'." When the same glasses were set careful beside bold, he said: "the bold side is BY FAR better. This shows the power of the lens and is the direction we need to go." So far the bold voice exists only in two hand-written roughs. The live mandate has never been asked for it, and nothing shows yet that a woken glass can find it on its own. The woken page asked for evidence before the spark meter: ten lensings, with their scores checked by a bigger mind.

## Cold start
COLD START — this work has not begun; no prior state, no tried-and-rejected. The two roughs are the target, not a start on the code.

## Next move
Read the two proofs side by side with `lens-mandate.js`. Then draft the mandate change, part (a), and show it to Loudon before running anything. The pieces, in the order that usually serves:

- **(a) The mandate asks for the glass's voice.** `_ops/stigmergy/orchestrator/src/lens-mandate.js` (`buildLensMandate`; the self-check at `:100`) asks the glass for its own register and life. It keeps the reading labelled as the glass's own, and ends each reading with a distortion check like the rough's, naming what is the glass talking and what is fact. Settle at the same time where the procedure sits in `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js` (`:110-112`, under "# Loudon's note"). That slot shapes the glass's voice, and the question is open as [[The Lens — tuning]] item 1.
- **(b) Run a handful of real lensings, careful against bold**, through the live `[L]ens`. Hand the results cold to a bigger mind to break ([[Bring In a Bigger Mind]]). Each lensing leaves a run line in [[The Lens — tuning]].
- **(c) Answer the `learn` payoff question** ([[The Lens — tuning]] item 5): does the payoff enum gain `learn`, and what does a lensing report when learning is the payoff?
- **(d) Results flow back without retyping.** Whatever surface shows a lensing hands the user's answers back to the session. The second rough's path: opened in the browser pane, it keeps its answers on the page as `window.lensResults`, which the session checked it could read; he answered in chat that morning, so the path is proven to work, not yet used ([[The Daily Page — tuning]] item 71).
- **(e) Redo The Lens's hero and icon through the faces pipeline.** The render cost needs Loudon's yes, as in `5972837f`. Loudon, of the current hand holding a glass globe: it "is weird the hand is not anatomically correct and just creepy". The new face shows today's learning: a glass that colors what it touches, and no hand.
- **(f) Name what the bundle still lacks**: a Context ([[SCHEMA — Reference]] §8 `context`) and a rich face ([[Enrichment]]). Neither is made by this baton; say whether each is wanted.

## Calibrations from this session
- Bold over careful, "even at the loss of veracity": "the lens should represent THEIR truth not actual truth". The frame stays honest. The reading is named as the glass's, and nothing it says becomes the subject's text without a deliberate commit (the agency_profile's line).
- Loudon: "The challenge I have here is not knowing Simondon enough." A bold glass is a doorway to its own page. Learning about both pages is a payoff in its own right.
- Ohm's Law in equations, the Trickster in riddles, Simondon through his own work and life. The voice should differ dramatically, not subtly.
- An invented scene is allowed only when it is flagged as invented.

## Load these files first
1. `The Lens/proofs/2026-10-23-daily-page/careful-or-bold.html`, then `name-the-glass.html` in the same folder.
2. [[The Lens]], § The Fidelity Test and § The Downstream Loops, and [[The Lens — tuning]] items 1–7.
3. `_ops/stigmergy/orchestrator/src/lens-mandate.js` and its test, `lens-mandate.test.js`.
4. [[The Lens — scroll]], the trail for 2026-10-23.

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
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
