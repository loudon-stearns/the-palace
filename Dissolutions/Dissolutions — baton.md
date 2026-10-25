---
title: "Dissolutions — baton"
born: 2026-10-22
links:
  - target: "[[Dissolutions]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Dissolutions]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Dissolutions

## Move

Put the six playable proofs in front of Loudon one at a time, each opened as a page that plays on a click and left as the last thing in the turn, then carry his yes or no on the five entry-text offers beside them.

## Why this move matters

The six proofs were made, re-run headless (`Dissolutions/proofs/check-dissolutions-proofs.mjs`, 27 PASS per the offers note below) and landed on his yes of 2026-10-20 at 026fc835. He has not seen or heard one. They reached him as the READY TO LAND report and the scroll's paragraphs, and every one of their scroll entries still says "seen in the browser; not yet played through in a sit" (`Dissolutions/Dissolutions — scroll.md`). A proof here tests an identity claim by letting you play it, so until he plays it the test has not reached the person it is for. The hunt ledger's verdicts are "the maker's; a sit with Loudon may overturn any of them" (`Dissolutions/Dissolutions — hunt.md`), and whether Phase Reduction stays in the catalogue as an isomorphism is a question the ledger and the scroll both hold for him. Neither can be answered from text.

## Tried and rejected

- Words about them. Twenty-five landings of the 2026-10-20/21 fan-out reached Loudon as reports and summaries; the closing panel found he had not seen these. Another, better paragraph about the sound would repeat the miss. A paragraph about a sound is not the sound.

## Current state

Landed on main at 026fc835, in `Dissolutions/proofs/`. Each page builds an AudioContext (checked: one per file). Each member's page and proof, matched from the scroll's trail and the hunt ledger:

| member | proof page (under `Dissolutions/proofs/`) | what it tests |
|---|---|---|
| Dispersion Table | `2026-10-20-the-table-that-travels/the-table-that-travels.html` | wavetable and lossless loop: identity, with the loop's filter slot where dispersion goes |
| Phase Reduction | `2026-10-20-the-shadow-that-locks/the-shadow-that-locks.html` | PRC is Floquet data (identity); Kuramoto as the shadow (asymptotic isomorphism) |
| Chebyshev is Fourier | `2026-10-20-the-circles-shadow/the-circles-shadow.html` | drawbars built two ways null to rounding error; drive pulled down becomes timbre |
| Volterra Kernels and the Torus | `2026-10-20-one-field-two-hands/one-field-two-hands.html` | synth and effect are one field (identity); field and kernel an isomorphism |
| Linear Predictive Coding | `2026-10-20-the-equation-read-backward/the-equation-read-backward.html` | one equation solved twice; the voice returns to rounding error at every order |
| Rank-N Lattice Analysis | `2026-10-20-the-lattice-read-back/the-lattice-read-back.html` | analysis returns the lattice, not the generators; rank needs a bound |

An earlier pair from the 2026-10-18 sit, `2026-10-18-one-curve-three-doorways/`, he has already played; it is not part of this move.

The five offers below are **not placed**. Re-checked at the close against the live text: the old Hammerstein, rank, and Kuramoto sentences and the Dispersion Table line are still as the note found them, and the catalogue carries no "Tested 2026-10-20" marks. The note's line numbers (`Volterra Kernels and the Torus.md:62`, and the others) were taken on 2026-10-20; the Volterra one still matches. Re-find the others by the quoted sentence.

## Next move

Show him the first proof: one or two plain sentences on what to listen for, then the page itself as the last thing in the turn (opened, or revealed in Finder, or sent as a file). One proof a turn; wait for his reaction before the next. The order is his; the table above follows the scroll's Plan order. Offers A through D each rest on one proof (A on one-field-two-hands, B on the-lattice-read-back, C on the-shadow-that-locks, D on the-table-that-travels; E on the hunt ledger), so the natural moment to offer a piece of entry text is right after he has met its proof. Nothing is placed without his yes; the Concierge places any he gives. If he overturns a verdict, the overturning is a new line in the hunt ledger (the ledger says so itself).

## Calibrations from this session

- Loudon, 2026-10-22, at the fan-out close: "dissolutions, I didn't see them, they need to come back." The same panel produced the rule now in `The Palace Voice.md` § Where words land (d5158edd): the made thing itself is the last thing in the turn, not a paragraph about it.
- Every proof makes sound. Open each so it starts silent and sounds only on his click, and close the tab after. Whether these six start silent was not checked at the close; check before you open one for him.
- The verdicts in the hunt ledger are the maker's, not his. A proof that will not come alive is a question about whether the member stands (Plan step 4), carried to a sit, not hidden.

## The five offers, copied from the session's note

The note lives outside git (the Dissolutions session's side-session notes folder) and leaves with the app, so its content is carried here whole. Source file: `dissolutions-offers-for-loudon.md`, written 2026-10-20.


From the Dissolutions session (branch `claude/dissolutions-proofs-b3a7ae`). Drafted by the session, final wording by its Concierge, checked against the live text. None is placed. Each rests on a proof in `Dissolutions/proofs/2026-10-20-*/` and a claim re-run by `Dissolutions/proofs/check-dissolutions-proofs.mjs` (27 PASS). These are edits to show Loudon first, not deposits. The Concierge places any he says yes to.

### E. Dissolutions: mark what the hunt found in the catalogue (lightest; the page asks for it)

`Dissolutions.md` § The catalogue (so far). Add a short note to the three members whose test was not a clean identity:

- Volterra Kernels and the Torus: "*Tested 2026-10-20: synthesizer and effect, identity; field and kernel, isomorphism.*"
- Phase Reduction: "*Tested 2026-10-20: the PRC is Floquet data, identity; Kuramoto as the shadow, isomorphism, exact only as the coupling goes to zero.*" (Leave the bullet's "*is*" as it stands. The page holds that tension until Loudon says whether the member stays.)
- Rank-N Lattice Analysis: "*Tested 2026-10-20: identity for the lattice, up to a change of basis, with rank measured against a bound.*"

Under the catalogue, add: "Every member's test, and every candidate's, is a line in [[Dissolutions — hunt]]."

### A. Volterra Kernels and the Torus: a correction the proof forces

`Volterra Kernels and the Torus.md:62`. The current sentence says the Hammerstein structure "preserves harmonic generation but discards intermodulation". That is wrong: a static curve does make intermodulation. Replace it with:

> That slice is equivalent to a **Hammerstein structure** — a static nonlinearity followed by a filter — which makes intermodulation as well as harmonics, but sets each product's strength by the frequency it lands on, never by which tones made it. Off the diagonal the tones matter: two tones 30 Hz apart make a 30 Hz difference tone that swings by more than 30 dB as both slide up together, which no static curve followed by a filter can do.

Line 82 reads true after this change and needs no edit.

### B. Rank-N Lattice Analysis: rank needs a bound, and generators come back only up to a basis

B1, § Rank as a measured property:

> and crucially, **the rank N itself is a measured quantity**, a property of the source together with one choice: how large the whole numbers may grow. With no bound, any finite set of peaks, measured to any finite precision, fits rank 1 on a small enough fundamental; the bound is what makes rank mean something.

B2, at the end of the paragraph that ends "…the reading mechanism is the genre)." (`Rank-N Lattice Analysis.md:65`):

> The analysis recovers the lattice, not the generators that drew it: (g₁, g₂) and (g₁, g₁ + g₂) generate the same set of frequencies, and the analysis may return either, or any whole-number change of basis with determinant ±1.

### C. Phase Reduction: the limit depends on the loop

Add at the end of the paragraph that holds "That is the Kuramoto model." and "Kuramoto is not a separate postulate…" (`Phase Reduction.md:70`):

> It holds only as the coupling goes to zero, and how weak is weak enough depends on the loop. On a van der Pol loop at μ = 1 the shadow's locking range matches the full pair's, cell for cell on the proof's detuning grid, up to a coupling of 0.1; by 0.4 the two have parted. On a nearly round loop (μ = 0.3) the part of the averaged pull that draws the pair together nearly vanishes, and the shadow misses locking even at 0.05.

### D. Dispersion Table: the identity's strict edge (optional)

After "A delay line fed back on itself with unity gain is mathematically identical to scanning a stored cycle." (`Dispersion Table.md:68`):

> Exactly so when the loop's length is a whole number of samples. A fractional length makes the loop read between samples on every trip, and that reading is already a filter in the loop: the slot a fractional length forces open is the slot the dispersion curve goes in.

Don't widen it to say a table doesn't compound its own interpolation error: that is plausible, but nothing checked it.

## Load these files first

1. `Dissolutions.md`, the hub: the identity / isomorphism / analogy test and the catalogue.
2. `Dissolutions/Dissolutions — scroll.md`: the Plan and the six proof entries on the trail.
3. `Dissolutions/Dissolutions — hunt.md`: the nine ledger lines and what each says it unlocked.
4. The six proof pages above, in the order he takes them.
5. `Dissolutions/proofs/check-dissolutions-proofs.mjs`: re-runs every number the six pages show, headless.
6. `The Palace Voice.md` § Where words land: the rule for how a made thing reaches him.
7. When an offer is shown: the member page it edits (`Volterra Kernels and the Torus.md`, `Rank-N Lattice Analysis.md`, `Phase Reduction.md`, `Dispersion Table.md`).

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
