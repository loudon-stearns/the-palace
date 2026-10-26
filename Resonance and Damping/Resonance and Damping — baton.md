---
title: "Resonance and Damping — baton"
born: 2026-10-25
links:
  - target: "[[Resonance and Damping]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Resonance and Damping]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Resonance and Damping

## Move

Finish the way up to Q you can hear: make step 5's last frames land and the move from step 5 into the proof (`q-you-can-hear`) smooth, so the five steps read as one whole teaching tool before Loudon reads the page as a deposit. The plan this was written against: the five steps plus the proof, as they stand in `Resonance and Damping — sketch — q-step-by-step.html`.

## Why this move matters

Loudon's word on 2026-10-25, after the last round: the steps work, and there is still more to be done to make this a perfect teaching tool. The ending is where a learner either arrives at the proof or is dropped at a link. Until the steps are right he will not read the page as a deposit, and the Differential Equations pickup (below) waits on that read.

## Tried and rejected

- A Blob-URL AudioWorklet fails silently when the page opens from `file://` (Chrome refuses it). Both sketches fall back to the same resonator on a ScriptProcessor. The built-in browser pane has no AudioWorklet at all, so it cannot reproduce the worklet path.
- `221d3f78` was marked verified and the checker then failed once on it; `f2da4637` fixed the checker (it now reads red strictly). Do not call a step done off one green run.
- The Practice pillar was not forced onto the page. It stays absent unless Loudon wants it.
- The energy-flow history (Young 1823, Helmholtz 1863) is kept to one line on purpose.

## Current state

Landed on main in `11ffc891` (2026-10-25), as it stood, on Loudon's word, and set to `stage: sprout` (`a5aa0b55`); the Concierge read it cold. Loudon has not yet read the words as a deposit, so `Palace-Verify` on the page stays outstanding until he does.

Owed on the steps, in the order the move reaches them:

1. Step 5's last frames and the move into the proof. Step 5 still sets the push as a multiple of the weight's own rate (`pushHzFrom` is used on steps 3 and 4; the comment in the file says step 5 "still sets the push as a multiple of its own rate"). Tie it to its own rate the way 3 and 4 are.
2. Step 4's empty lower half.
3. The closing question on the last step. The close marks it Loudon's to choose; the page's Forward Vector calls it Claude's to hand to him. Settle which with him before writing one.
4. Heard through real speakers, and a learner taking the steps by hand. Neither has happened.

Side note, not this baton's to fix: the Mathieu Resonator's README and codebox disagree. `Projects/Floquet Time-Modulated Loops/RNBO/README — Mathieu Resonator.md:57` and `mathieu_resonator.codebox:141-142` say ζ = 0.025 gives Q ≈ 33 at 220 Hz; with the codebox's own damping term Q = 1/(2ζ) = 20 (bandwidth 11 Hz). Measure before anyone fixes it; only Loudon or the owner decides which number to change. Also posted to the WEAVE board.

**The Differential Equations pickup is carried here.** Handoff `differential-equations-handoff-2026-10-25` is claimed and stays claimed; nothing at the close closed it. Its job ("write Resonance and Damping") is done only when the page is canon. When Loudon has read the page and it lands on the owner's `main`, do these on the owner's `main`, not on this branch, in this order:

- Edit `Differential Equations.md` through the Concierge. Line 92, now `- **Resonant filter:** The filter resonates at its natural frequency. Q (quality factor) controls damping.` becomes `- **Resonant filter:** The filter resonates at its natural frequency. Q (quality factor) is the damping turned upside down, Q = 1/(2ζ): see [[Resonance and Damping]].`
- Line 124, now `**The resonance phenomenon:** If the driving frequency matches the natural frequency ω_n, the system resonates with maximum amplitude. This happens regardless of damping (though damping controls how sharp the peak is).` becomes `**The resonance phenomenon:** If the driving frequency matches the natural frequency ω_n, the system swings Q times as far as the same push held steady, a quarter cycle behind the push. Damping sets how tall and how sharp the peak is, and with heavy damping (ζ above about 0.7) the peak in displacement flattens away. See [[Resonance and Damping]].` This one is a correction, not only a pointer: "regardless of damping" overstates, because the displacement peak slides below ω_n as damping grows and disappears at ζ ≥ 1/√2. Line 141 stays as written; the ghost resolves by itself.
- Remove `## Active Baton` (`Differential Equations.md:169-171`) and delete `Differential Equations/Differential Equations — baton.md`.
- Then `node _ops/stigmergy/close-handoff.mjs differential-equations-handoff-2026-10-25 --commit <landed hash>`.
- The Concierge's cold read of the page and the map entry are also owed. If the page never becomes canon, do not apply these lines.

## Next move

Run `pickup-handoff.mjs` and read the since-baton commits, then open the steps from `file://` and work the owed list above, starting with the last frames and the move to the proof. Run the two `check.mjs` files after each change (`Resonance and Damping/Resonance and Damping — sketch — q-step-by-step — check.mjs` and the `q-you-can-hear` one) and do not call a step done off a single run. Show Loudon the made thing, not a description of it, and ask the one question: how does it feel?

## Receiving environment

On main. The branch it was built on is merged and its worktree is gone; work from a fresh worktree off main (`node _ops/worktree/new-worktree.mjs --name <new branch> --profile docs`). The step checker loads Playwright through `_ops/stigmergy/app/package.json`, so a fresh worktree may need that app's `node_modules` linked (take `new-worktree.mjs --dry-run`'s link list).

## Calibrations from this session

- The first sound is never automatic: both pieces stay silent until Pluck or Play, and stop when the tab is hidden, with no auto-resume.
- One weight across the page, the weight beside its own trace on one fixed scale and rest line, joined by a dotted line. Those came from Loudon's notes; keep them when you change a step.
- Honesty holds and taste yields: what a check showed stays reported as shown.
- `6e319b57` carries a `deposit(...)` subject and `Palace-Kind: deposit`, but it was made by a child session with no resident Concierge and sits on a feature branch. Treat it as a draft, not canon; re-landing it through the Concierge, with Loudon's read first, is the Differential Equations pickup's gate.
- Adjacent card, not this baton's work: the proposed task "Bring Progressive Staging back to the foreground" (task_2060337c) would restore the `project-stage-builder` skill. It is not restored anywhere; it was only read from git at `a22b039b^:project-stage-builder.skill`. That scratchpad copy is temporary.

## Load these files first

1. `Resonance and Damping/Resonance and Damping — sketch — q-step-by-step.html` (the steps; its math block is pure and self-tested)
2. `Resonance and Damping/Resonance and Damping — sketch — q-step-by-step — check.mjs`
3. `Resonance and Damping.md` (the page, § Building one and § Forward Vector)
4. `Differential Equations.md` lines 92, 124, 141, 169-171, and [[Deposit Ceremony]] for when it is time to land
5. [[Progressive Staging]] (the method the steps are staged after)

[[Baton Ceremony — on-pickup]] — pasted verbatim below.

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
