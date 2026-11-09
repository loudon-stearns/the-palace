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

Loudon reviews each of the six learning sequences at his own pace. Nothing is owed by an agent until he sends notes. A note is the next round's brief for the sequence it came from, and his approval, one sequence at a time, takes that sequence's proposal chip off.

## Why this move matters

Three sits on 2026-10-25 gave the same answer: each 2026-10-20 proof is the end of a complex topic, met with no way up to it. Stopping the walk after three, he said: "these are the end of a proof, we need to work our way there with each of them. So lets make a handoff for developing a learning sequence for each of these that starts with simpler concepts and works the teaching up to the final proofs presented here." His outline for the table that travels is the model: **the table alone, the loop alone, the two combined through their difference, then the filter.**

The six sequences are built, challenged and marked proposal. On 2026-11-07 he set the pace (quoted exactly): "We had a large number of rich face interactions created recently and they were posted as "to be reviewed" I'd like us to follow a simliar procedure here, so that we can close this out, but I can come back to these over time, this is much for me to go through and I don't want to be rushed."

So the move waits on him. A proof here tests an identity by letting you play it; if the player can't follow it, the test hasn't reached the person it is for, and only he can say whether it has.

## Tried and rejected

- Showing the finished proof first. Three sits, same answer: each page is the end of a proof, met with no way up to it.
- Walking him through the sequences one per turn. That was this baton's earlier next move; his word of 2026-11-07 replaced it. He comes back to them over time, and nobody prompts him.

## Current state

**The sequences.** `Dissolutions/proofs/2026-10-25-learning-sequences/`: one `.html` per proof, `index.html` in the scroll's Plan order, `check-sequences.mjs` (189 PASS on 2026-11-07, on the branch and on the combined tree with main), `prove-send.mjs`, and `challenge-brief.md`. Every sequence and the index carry the chip "proposal · 2026-11-07 · not yet approved by Loudon".

**How they were vetted.** [[Dissolutions — sequences — challenge]] holds the round, Enrichment's proposal steps adapted: six challengers who made none of them; first verdicts 1 keep, 5 remake; one remake round; second verdicts 6 keep, 0 retire. Nobody has heard any of it. Every verdict rests on code, numbers and screenshots, and each section of that file ends with what is still unheard.

**How his notes come back.** Each sequence's last step has **Send to STIGMERGY**: it posts his notes as a `human_eval` on page Dissolutions, with the task set to the sequence's slug (`the-table-that-travels`, `the-shadow-that-locks`, `the-circles-shadow`, `one-field-two-hands`, `the-equation-read-backward`, `the-lattice-read-back`), through `_ops/loudon-eval/answers.js`. Copy all notes is the fallback when the page is opened as a file or the server is down. Proved against a stub board, 54 PASS (09349300). He opens them through the answers server (`node _ops/loudon-eval/eval-server.mjs`, with STIGMERGY running): `http://127.0.0.1:8211/Dissolutions/proofs/2026-10-25-learning-sequences/index.html`. Read what he sent with `node _ops/loudon-eval/read-answers.mjs --page "Dissolutions" --open`, the QUEUE's REVIEW NOTE cards, or a pickup.

**Approval** is per sequence and his alone, by a note or his word in chat. Until then each stays proposal. On approval the chip comes off that sequence.

**His earlier notes still stand.** On the table that travels (played 2026-10-25): "sounds good, great progress, will need work, but not tonight". What "will need work" means is for his notes to say. On the shadow that locks, he asked why the pitch climbs as the coupling rises; the sequence's step 5, the spring, now answers it, and says which start it measured.

**The claim.** This branch lands on main; then the claimed card `dissolutions-remainder-20261025T132839Z` is closed partial, and its remainder card points at this baton. Its id is not known as this is written: run `node _ops/stigmergy/list-handoffs.mjs`.

**The plan this was written against.** The newest `plan-` section on the scroll's trail is `plan-2026-10-25T16-19-22-04-00` (87596717): Plan step 1 holds the proof and the sequence that reaches it as one step, with the proof last. The scroll's newest entry is `sit-2026-11-07-one-curve-three-readers` (a09d592d), his play of the 2026-10-18 proof. Its "label every axis" note is open as a possible standing rule; it is not part of this move.

**Placed on his yes:** D at b3d43be7 (`Dispersion Table.md:63`), C at 786b4922 (`Phase Reduction.md:69`).

**Still open:** whether Phase Reduction stays in the catalogue as an identity, an isomorphism, or split in two. The bullet's "*is*" at `Dissolutions.md:67` is left for him.

**Proof-page faults found while building, reported not fixed.** Whether the 2026-10-20 proofs, as records, may take small corrections is Loudon's open question. Fix nothing in them until he answers. No hunt verdict moves and no hunt-ledger line is written for any of these.

- `the-lattice-read-back`: its ledger says the analysis may return (g₁, g₂ − g₁), but on the Diagonal field it returns (g₁, g₁ + g₂). Offer B already says g₁ + g₂; flag the mismatch when B is shown. The Two rows field at √2 also returns the other basis. The "whole numbers up to" slider bounds rank 1 by K but caps the rank-2 search at min(K, 8).
- `the-lattice-read-back`, new 2026-11-07: at √2 its box says harmonic numbers "up to 157" would make the peaks rank 1, on a 3.79 Hz fundamental. That comes from its anchored rank-1 search, which only tries rulers that put one of the lowest peaks exactly on a mark. An exhaustive search fits rank 1 from K = 65, on about 9.16 Hz. The lattice sequence shows both: step 4 the exhaustive search, step 6 why the proof says 157.
- `the-shadow-that-locks`: at coupling 0.04 the proof's own `runFull` locks at −145.2°, where the scroll's sit note says 141°. At 0.5 it is bistable: started together with detuning, it stays in step (1.3°). The proof page and the scroll don't mention it; the sequence's step 5 now does.
- `the-equation-read-backward`: the "loudness-matched" buzz-driven sound is 1.75 dB louder than the residual.
- `the-circles-shadow`: plays the steady offset for even drawbars below full reach; its harmonics pane never shows harmonic 0.
- `one-field-two-hands`: after "Line the hands up" the difference shown is about 3e-13, not machine epsilon.
- Three proofs' legends say "Middle · …" for a panel drawn top-left: the shadow, the equation, one-field.
- All six proofs load Google Fonts, which is a network request.
- Three proofs (the table that travels, one field two hands, the lattice read back), new 2026-11-08: their `loopify` blends the tail onto the start with an equal-power fade, which swells about 3 dB at the seam when the two pieces are the same wave in phase, once a loop. Loudon heard it in the shadow that locks' sequence, step 1 ("a jolt in the audio it doesn't seem to come right with any visual shift"). The six sequences were fixed in 568a587a (the fade scales by how alike the pieces are); the proofs keep theirs.

**Not placed: A, B, E.** They stay offers, each shown right after he has met the proof it rests on. A and B are now set up out loud by the sequences: one field, two hands (steps 5–6) teaches A and says the Volterra page holds otherwise; the lattice read back (steps 4–6) teaches B and says the Rank-N page holds otherwise. Anchors were re-found on 2026-10-25, after the 2026-10-24 Weave moved them; re-check them before showing. The offered words are carried whole below.

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

**Still owed after his review:** the scroll's trail entry for the sequences, and Plan wording if he approves them. Neither is written. Neither waits on an agent before he has reviewed.

## Next move

Nothing, until he sends notes. When a session opens on Dissolutions, read them first (`read-answers.mjs --page "Dissolutions" --open`). For each sequence a note names, that note is the brief for its next round: rework the sequence to it, run `check-sequences.mjs` (a new step that shows a number joins the checks), keep the chip on, and leave it for him again. Its REVIEW NOTE card stays open until someone grants or denies it ([[Review Layer]] § Kinship with Enrichment), so settle it when the round is done. When he approves a sequence, by note or in chat, take its chip off. When he has met one field, two hands or the lattice read back, show offer A or B in the same turn, with the fault from Current state beside it where it touches the offer. The Concierge places any yes. An overturned verdict becomes a new line in the hunt ledger.

## Receiving environment

*Cross-worktree until the branch lands.* This baton is written on branch `claude/dissolutions-sequences-905758` (worktree `/Users/loudonstearns/Documents/The Palace/.claude/worktrees/dissolutions-sequences-905758`), and is read on main once the branch lands. If `Dissolutions/proofs/2026-10-25-learning-sequences/` is not on main, the branch has not landed: read this baton from the worktree, or recreate it with `node _ops/worktree/new-worktree.mjs --name claude/dissolutions-sequences-905758` (the branch exists, so it is not re-forked). Send needs `_ops/loudon-eval/answers.js`, which is on main and arrives on the branch only when it lands; until then the pages fall back to Copy.

## Calibrations from this session

- **The notes boxes keep nothing in the Claude browser pane.** It serves the file as a `data:` URL and refuses localStorage. This session read his notes from the live tab with JS before navigating away. Read the boxes before leaving a tab, or build the sequences so nothing depends on storage. Send to STIGMERGY is that second way now; the pane still keeps nothing.
- **They start silent.** A static check on 2026-10-25 found all six build their AudioContext only inside `ensure()`, called only from Play, with `playing` false at start and nothing autoplaying. New sequence pages keep that, and the tab closes after.
- **The hunt verdicts stand.** None was overturned in these sits. His notes were about teaching, not about the verdicts.
- **A number a step shows gets a check.** `check-dissolutions-proofs.mjs` re-runs every number the six pages show (27 PASS on 2026-10-25). A new step that shows a number joins it.
- **Open the sequences in a real browser, not the Claude pane.** The pane serves local files as `data:` URLs, so the sequences' relative links (step to step, last step to the proof, the index) break there.
- **The sequences hush when their tab is hidden,** and stay hushed on return. A sound that stops when you switch tabs is the design, not a fault. `check-sequences.mjs` tests it.
- **A checker that reuses the page's own search can't catch that search.** The lattice's 157 passed every check until a challenger searched exhaustively by its own route. A second route is what found it.
- **His answers become public when the palace is pushed.** The board is tracked in a public repository; he accepted that on 2026-11-07 (`_ops/loudon-eval/README.md`).
- **He approves the six sequences one at a time** (Loudon, 2026-11-08: "One at a time"), naming each in the section's note or in chat. The face holds all six in one section, "The catalogue (so far)", and `approve.mjs` approves a whole section, so the section stays at proposal until the last of the six has his yes; each yes is written here as it comes.

## Load these files first

1. `Dissolutions.md`, the hub: the identity / isomorphism / analogy test and the catalogue.
2. His open notes: `node _ops/loudon-eval/read-answers.mjs --page "Dissolutions" --open`.
3. [[Dissolutions — sequences — challenge]]: what each challenger found, what was remade, and what is still unheard, per sequence.
4. `Dissolutions/proofs/2026-10-25-learning-sequences/`: the six sequences, `index.html`, `check-sequences.mjs`. Run the checker before changing anything.
5. `Dissolutions/Dissolutions — scroll.md`: the 2026-10-25 sit sections on the trail, then the Plan.
6. `Dissolutions/Dissolutions — hunt.md`: the nine ledger lines.
7. The six proof pages under `Dissolutions/proofs/2026-10-20-*/`, and `Dissolutions/proofs/check-dissolutions-proofs.mjs`.
8. `_ops/loudon-eval/README.md`: the answers server and how a note comes back. The rule lives in [[Review Layer]] § How the answers come back.
9. The dress. The pages carry the LOUD'N LIVE mark and teach in public, so the governing manifest is [[Loudon Live Design System]] (`_ops/loudon-live/design-system/SKILL.md`). Confirm it against [[Drafting Table Design System]] § Which dress before you depart from it.
10. When an offer is shown, the member page it edits.

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
