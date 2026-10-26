---
title: "Dissolutions — baton"
born: 2026-10-25
links:
  - target: "[[Dissolutions]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Dissolutions]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Dissolutions

## Move

For each of the six 2026-10-20 proofs, build a learning sequence that introduces each component concept on its own in a few short interactive steps, then combines them, and arrives at the existing proof as its last step; then put the sequences in front of Loudon one per turn and carry his yes or no on offers A, B and E.

The six are built, as roughs, on a branch that is not on main. What is left is the rework from his notes, the five he has not played, offers A, B and E, the scroll's trail entry, and landing the branch. Current state has the whole list.

## Why this move matters

Three sits on 2026-10-25 gave the same answer. On the table that travels he wrote (scroll, `sit-2026-10-25-the-table-that-travels`):

> "This is a good example, but needs scaffolded learning, just a few steps to undertsand each concept in isolation. Right now we are at the end proof of a complex topic, and we need to work our way up to this. Interactive explanation of the loop and the table individually, then the combionation with the difference, then finally explain the filter and bring that concept in. A little more staged learning and this is fantastic."

On the shadow that locks: "again like the first proof this needs staged learning, we are at the end of a complex concept, we need to build our way up to this with a few interactions so that this can really teach well."

Then, stopping the walk after three: "OK, we are going to have the same exact response for all of these. I'd like to send them all back to be worked on with the same note: these are the end of a proof, we need to work our way there with each of them. So lets make a handoff for developing a learning sequence for each of these that starts with simpler concepts and works the teaching up to the final proofs presented here."

A proof here tests an identity by letting you play it. If the player can't follow it, the test still hasn't reached the person it is for.

His outline for the table that travels is the model for the rest: **the table alone, the loop alone, the two combined through their difference, then the filter.**

Then he played the first sequence, the table that travels (2026-10-25, relayed by the session that dispatched this one): "Dissoulutions, I played it, sounds good, great progress, will need work, but not tonight". Those are his only words on the sequences so far; what "will need work" means in particular is for his notes to say, and the rework follows them. At the close he said: "Pause it: keep the handoff claimed and the branch unlanded tonight; the remainder rides the baton." He did not say whether the 2026-10-20 proofs may take small corrections, nor whether a scroll entry may be written tonight.

## Tried and rejected

- Showing the finished proof first. Three sits, same answer: each page is the end of a proof, met with no way up to it.

## Current state

**The sequences exist as roughs on a branch, not on main.** Branch `claude/dissolutions-sequences-905758`, four commits: a3f4df6c (the table that travels, five steps, and the checker), efda5834 (the other five), 26338d61 (an index page in the scroll's Plan order), 605e3798 (the pages hush when their tab is hidden and stay hushed on return). They sit in `Dissolutions/proofs/2026-10-25-learning-sequences/`: one `.html` per proof, `index.html`, and `check-sequences.mjs`, which was 170 PASS at the last run. Loudon played one, the table that travels, and said "sounds good, great progress, will need work, but not tonight" (above). The other five are not played.

**What is still owed, all of it, in order:**

1. The rework, from his notes.
2. The other five sequences in front of him, one per turn, the thing itself as the last thing in the turn.
3. Offers A, B and E, each after he has met the proof it rests on (A on one-field-two-hands, B on the-lattice-read-back, E from the hunt ledger).
4. The scroll's trail entry for the sequences. He has not said whether one may be written tonight; none was.
5. Landing the branch on main through `palace-land`, then the partial close citing a commit on main. Nothing is closed: the handoff `dissolutions-remainder-20261025T132839Z` stays claimed.

**The plan this was written against.** The newest `plan-` section on the scroll's trail is `plan-2026-10-25T16-19-22-04-00`, on main at 87596717: Plan step 1a is folded into step 1, so the proof and the sequence that reaches it read as one step with the proof last. That commit is on main and not on this branch; the branch's scroll still shows 1a until the two meet at the landing.

**Proof-page faults found while building, reported not fixed.** Whether the 2026-10-20 proofs may take small corrections is Loudon's open question. Fix nothing in them until he answers. No hunt verdict moves and no hunt-ledger line is written for any of these.

- `the-lattice-read-back`: its ledger says the analysis may return (g₁, g₂ − g₁), but on the Diagonal field it returns (g₁, g₁ + g₂). Offer B already says g₁ + g₂; flag the mismatch when B is shown. The Two rows field at √2 also returns the other basis. The "whole numbers up to" slider bounds rank 1 by K but caps the rank-2 search at min(K, 8).
- `the-shadow-that-locks`: at coupling 0.04 the proof's own `runFull` locks at −145.2°, where the scroll's sit note says 141°. At 0.5 it is bistable: started together with detuning, it stays in step (1.3°). Nothing on the page or scroll mentions this.
- `the-equation-read-backward`: the "loudness-matched" buzz-driven sound is 1.75 dB louder than the residual.
- `the-circles-shadow`: plays the steady offset for even drawbars below full reach; its harmonics pane never shows harmonic 0.
- `one-field-two-hands`: after "Line the hands up" the difference shown is about 3e-13, not machine epsilon.
- Three proofs' legends say "Middle · …" for a panel drawn top-left: the shadow, the equation, one-field.
- All six proofs load Google Fonts, which is a network request.

**The 2026-10-20 proofs, as landed.** The six proofs landed on main at 026fc835, under `Dissolutions/proofs/2026-10-20-*/`. The existing pages stay as they are, as the last step of each sequence.

| proof | played | what the sit left |
|---|---|---|
| `the-table-that-travels` | 2026-10-25 | his note and outline above; offer D placed |
| `the-shadow-that-locks` | 2026-10-25 | one missing step, named below; offer C placed |
| `the-circles-shadow` | 2026-10-25 | no notes; the general note covers it |
| `one-field-two-hands` | not yet | offer A rests on it |
| `the-equation-read-backward` | not yet | — |
| `the-lattice-read-back` | not yet | offer B rests on it |

**One missing step the shadow's sit found.** He asked why the pitch climbs as the coupling rises. The page never says. The coupling is a spring between the two oscillators, and the nearly opposite lock is the stiffer mode, so the pitch goes up. The session's answer, with its numbers and what it did not check, is on the scroll at `sit-2026-10-25-the-shadow-that-locks`. A step in that sequence should teach this before the proof asks you to hear it.

**Placed on his yes:** D at b3d43be7 (`Dispersion Table.md:63`), C at 786b4922 (`Phase Reduction.md:69`).

**Still open:** whether Phase Reduction stays in the catalogue as an identity, an isomorphism, or split in two. The bullet's "*is*" at `Dissolutions.md:67` is left for him.

**Not placed: A, B, E.** The offered words are carried whole below. Anchors were re-found on 2026-10-25, after the 2026-10-24 Weave moved them.

### E. Dissolutions: mark what the hunt found in the catalogue (lightest; the page asks for it). Rests on the hunt ledger.

`Dissolutions.md` § The catalogue (so far), bullets at :66–72 (Phase Reduction :67, Volterra :69, Rank-N :72). Add a short note to the three members whose test was not a clean identity:

- Volterra Kernels and the Torus: "*Tested 2026-10-20: synthesizer and effect, identity; field and kernel, isomorphism.*"
- Phase Reduction: "*Tested 2026-10-20: the PRC is Floquet data, identity; Kuramoto as the shadow, isomorphism, exact only as the coupling goes to zero.*" (Leave the bullet's "*is*" as it stands. The page holds that tension until Loudon says whether the member stays.)
- Rank-N Lattice Analysis: "*Tested 2026-10-20: identity for the lattice, up to a change of basis, with rank measured against a bound.*"

Under the catalogue, add: "Every member's test, and every candidate's, is a line in [[Dissolutions — hunt]]."

### A. Volterra Kernels and the Torus: a correction the proof forces. Rests on one-field-two-hands.

`Volterra Kernels and the Torus.md:66`. The current sentence says the Hammerstein structure "preserves harmonic generation but discards intermodulation". That is wrong: a static curve does make intermodulation. Replace it with:

> That slice is equivalent to a **Hammerstein structure** — a static nonlinearity followed by a filter — which makes intermodulation as well as harmonics, but sets each product's strength by the frequency it lands on, never by which tones made it. Off the diagonal the tones matter: two tones 30 Hz apart make a 30 Hz difference tone that swings by more than 30 dB as both slide up together, which no static curve followed by a filter can do.

The Forward Vector at :86 ("…what intermodulation structure it carries that a Hammerstein diagonal discards") reads true after this change and needs no edit.

### B. Rank-N Lattice Analysis: rank needs a bound, and generators come back only up to a basis. Rests on the-lattice-read-back.

B1, § Rank as a measured property, `Rank-N Lattice Analysis.md:48`. Replaces the sentence's ending from "and crucially". This drops the clause "rather than an assumption imposed on it", so tell Loudon it goes:

> and crucially, **the rank N itself is a measured quantity**, a property of the source together with one choice: how large the whole numbers may grow. With no bound, any finite set of peaks, measured to any finite precision, fits rank 1 on a small enough fundamental; the bound is what makes rank mean something.

B2, at the end of the paragraph at `Rank-N Lattice Analysis.md:64`. The Weave reworded that paragraph's end, which now reads "…the field is one thing, the reading mechanism is the genre."

> The analysis recovers the lattice, not the generators that drew it: (g₁, g₂) and (g₁, g₁ + g₂) generate the same set of frequencies, and the analysis may return either, or any whole-number change of basis with determinant ±1.

## Next move

The sequences are built, so the build is not the first move. Ask him for his notes on the table that travels' sequence and rework it first, because his reaction to the first one is the template for the other five. Then put the next sequence in front of him as the last thing in the turn, one per turn, and wait for his reaction before the next; after that the order is his. Offer A or B right after he has met the proof it rests on, with the fault from Current state shown beside it where it touches the offer. Ask him the two questions he left open: whether the 2026-10-20 proofs may take small corrections, and whether a scroll entry may be written. The Concierge places any yes. An overturned verdict becomes a new line in the hunt ledger. When the work lands, the partial close cites a commit on main.

## Receiving environment

*Cross-worktree.* The sequences live in worktree `/Users/loudonstearns/Documents/The Palace/.claude/worktrees/dissolutions-sequences-905758`, branch `claude/dissolutions-sequences-905758`, and are on no other branch. If the worktree is gone, the branch is still in git: `node _ops/worktree/new-worktree.mjs --name claude/dissolutions-sequences-905758` (the branch exists, so it is not re-forked). The claim on the board names this worktree. This baton is edited on that branch, so a catcher on main sees the earlier text until the branch lands: read it from the worktree.

## Calibrations from this session

- **The notes boxes keep nothing in the Claude browser pane.** It serves the file as a `data:` URL and refuses localStorage. This session read his notes from the live tab with JS before navigating away. Read the boxes before leaving a tab, or build the sequences so nothing depends on storage.
- **They start silent.** A static check on 2026-10-25 found all six build their AudioContext only inside `ensure()`, called only from Play, with `playing` false at start and nothing autoplaying. New sequence pages keep that, and the tab closes after.
- **The hunt verdicts stand.** None was overturned in these sits. His notes were about teaching, not about the verdicts.
- **A number a step shows gets a check.** `check-dissolutions-proofs.mjs` re-runs every number the six pages show (27 PASS on 2026-10-25). A new step that shows a number joins it.
- **Open the sequences in a real browser, not the Claude pane.** The pane serves local files as `data:` URLs, so the sequences' relative links (step to step, last step to the proof, the index) break there.
- **The sequences hush when their tab is hidden,** and stay hushed on return. A sound that stops when you switch tabs is the design, not a fault. `check-sequences.mjs` tests it.

## Load these files first

1. `Dissolutions.md`, the hub: the identity / isomorphism / analogy test and the catalogue.
2. `Dissolutions/Dissolutions — scroll.md`: the three 2026-10-25 sit sections at the top of the trail, then the Plan.
3. `Dissolutions/Dissolutions — hunt.md`: the nine ledger lines.
4. The six proof pages, and the model they were built to: `Dissolutions/proofs/2026-10-18-one-curve-three-doorways/`, which he has played. Search there before you build.
5. `Dissolutions/proofs/check-dissolutions-proofs.mjs`.
6. On the branch `claude/dissolutions-sequences-905758` only: `Dissolutions/proofs/2026-10-25-learning-sequences/` — the six sequences, `index.html`, and `check-sequences.mjs`. Run the checker in the worktree before changing anything.
7. The dress. The pages carry the LOUD'N LIVE mark and teach in public, so the governing manifest is [[Loudon Live Design System]] (`_ops/loudon-live/design-system/SKILL.md`). Confirm it against [[Drafting Table Design System]] § Which dress before you depart from it.
8. `The Palace Voice.md` § Where words land: the made thing is the last thing in the turn.
9. When an offer is shown, the member page it edits.

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
