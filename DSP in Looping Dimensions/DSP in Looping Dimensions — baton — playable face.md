---
title: "DSP in Looping Dimensions — baton — playable face"
born: 2026-11-09
links:
  - target: "[[DSP in Looping Dimensions]]"
    type: connects-to
    label: "baton-for"
  - target: "[[DSP in Looping Dimensions — rich.json]]"
    type: connects-to
    label: "targets"
forward_vector: "I carry the in-progress move on [[DSP in Looping Dimensions]] — playable face — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: DSP in Looping Dimensions — playable face

## Move

Make DSP in Looping Dimensions' rich face playable under the rewritten page. Re-home the face's six pieces under the new headings. Finish the two remakes the challenge left. Add five new pieces, one for each figure that promises one. Every piece lets the reader turn the knob, not only read the result. This is the first move of the page's Plan, which runs: a playable face first, then a set of VST instruments, one per kind of meeting, then their progress on the scroll (newest `plan-` section: `plan-2026-11-09T11-24-09-05-00` on [[DSP in Looping Dimensions — scroll]]). Loudon, 2026-11-09: "make all of these rich face examples playable".

## Why this move matters

The page was folded on 2026-11-09 (D-2026-11-09-DSPLOOP, `d659e922`). Its claims now turn on where loops meet and on two kinds of inharmonicity. Nine figures carry them in the body, but a figure only shows a result. The face is where each claim gets heard and turned, and it is also the browser rehearsal for the VST instruments in the Plan's next move. Until the sections are re-keyed, the face's six pieces sit in *Lost its place*: all three of its old headings are gone.

## Current state

- Manifest: `DSP in Looping Dimensions/DSP in Looping Dimensions — rich.json`. Three sections, all `status: proposal`, keyed to the old headings: "The Principle in Plain Language" (the ratio gate and the lattice read back, both gathered), "Three Operational Frames" (two combs, snap or slide, and the Penrose Kuramoto ramp, gathered) and "The Honest Limit" (listen longer). All six offers are `taken` under the deposit; none is open.
- Where each piece belongs now: the ratio gate and the lattice read back go to § Where the loops meet or § What it does excellently; two combs, snap or slide and the Penrose ramp go to § Where the loops meet; listen longer goes to § The limits.
- The two remakes the challenge left (`DSP in Looping Dimensions — rich — challenge.md`):
  - snap or slide's caption. The lossless mixer lands on the odd half-series of the sum loop, not on its series. And "×0.50, then ×0.25" becomes "about".
  - listen longer's label. "136,862 lines within 60 dB" is really within 36 dB. Change it in the piece's note, its six-loop verdict, and the `checks.mjs` label.
- The five new pieces, each under the heading whose figure promises it:
  - **Push back**, under § Where the loops meet, item 4. Start from `DSP in Looping Dimensions/proofs/2026-11-05-sustained/push-back.html`. It already plays: ScriptProcessor, because the browser pane has no AudioWorklet. Measured: up 0.28 / down 0.19, and locked at 1077 Hz on 8 : 5. Its `<link>` to Google Fonts (line 23) must go; the design floors bar CDN links.
  - **The ratio sweep**, under § What it does excellently (`figures/ratio-sweep-gates.svg`).
  - **Closed and open**, under § What is unique about more loops (`figures/torus-knot-closed-and-open.svg`).
  - **The Möbius loop**, under § Strange geometries (`figures/mobius-loop-odd-half-series.svg`).
  - **Hearing a dimension**, under § Hearing a dimension (`figures/hearing-a-dimension.svg`).
- The figures' `.py` and `.dat` files hold the numbers each piece should reproduce.

## Next move

Say "enrich DSP in Looping Dimensions" and run [[Enrichment]] in its own worktree. Re-key the three sections to the new headings and re-stamp them (`fingerprint.mjs --stamp`). Make the two remakes. Build the five new pieces in the Drafting Table dress. Run the challenge round. Leave every section at `status: proposal` for Loudon's approval.

## Calibrations from this session

- Playable means a knob the reader turns: a coupling, a ratio, a sign flip, a number of loops. A slider through precomputed results is not enough.
- Every piece should be able to fail. Snap or slide and listen longer earned their keep because they could have gone against the page, and two of the face's measurements did.
- The page's numbers are measured. Pieces reproduce them, and when a piece disagrees, the text wins until the Deposit's map says otherwise.
- A piece that makes sound must be heard working in the browser pane before it is shown (The Daily Page — tuning item 107).

## Load these files first

1. `DSP in Looping Dimensions.md`
2. `DSP in Looping Dimensions/DSP in Looping Dimensions — rich.json` and `… — rich — challenge.md`
3. `Enrichment.md` § Proposal and approval, and `_ops/rich-face/README.md`
4. `_ops/drafting-table/design-system/SKILL.md`
5. `DSP in Looping Dimensions/proofs/2026-11-05-sustained/` and `DSP in Looping Dimensions/figures/`
6. `DSP in Looping Dimensions/DSP in Looping Dimensions — Context.md`

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
