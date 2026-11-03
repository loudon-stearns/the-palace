---
title: "Wavetable Space as Torus — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Wavetable Space as Torus]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for this page's first rich face, made in the 2026-11 proposal round: a verdict and a reason for every piece, every number recomputed, and each offer judged on whether the page sentence is wrong or the piece has turned a structural claim into a perceptual one."
---

# Wavetable Space as Torus — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03, against the maker's commit 422d2ef8 on `enrich/wavetable-space-as-torus`. The commit body is the maker's only account; I judged from the page, the manifest and the pieces.

**Count: 5 keep, 1 remake, 0 retire.**

## What I ran

- `node _ops/rich-face/conform.mjs "Wavetable Space as Torus"`: 4 pages, introduced 4, **errors 0, warnings 0**, browser pass at 760 and 1130 px. (The maker's three file-local warnings were the untracked pieces; the commit cleared them.)
- `node _ops/rich-face/fingerprint.mjs "Wavetable Space as Torus"`: all five pieced sections **in step**.
- `node "Wavetable Space as Torus/workshop/rich-checks.mjs"`: **all PASS**, on each piece's own engine and rebuilt worklet.
- My own recompute, written apart from the pieces' engines (numpy, FFT, separate search grid). The script sat in the session scratchpad and is not kept; every figure it gave is in this record. The numbers are below, offer by offer.
- The face served from the worktree (`rich-server.mjs --root <worktree> --detach`), headless Chromium at 1130 px: 6 proposal chips, four frames at their manifest heights, nothing lost its place, no drift marks, **console clean**. I walked each made piece to its last step: no `AudioContext` before a click in any of the three, and the last-step readouts match the captions (53.0 %; 3.6 / 10.9 / 28.1 %; 0.0000 %, 207 · 311 · 466 Hz; 17.2 %). Server stopped.
- Not run: `check-hidden-hush.mjs`. The pieces have no hush code of their own and need none, since the kit hushes them (README § Making pieces). Nothing was heard: an agent can't hear the mix.
- Gathered files are all tracked: `audition/penrose_ratio_sweep.wav`, `Hopf/hopf-control-surface.html`, `Auditions/cycle-7/penrose_kuramoto_three_regimes.wav`. Nothing licensed is copied.

## The pieces

### The T² Structure

**`which knot.html` — remake.**
1. *Test or decoration?* A test. Step 4 could have come out the other way: if the knot type set the sound, the flat-table pair would differ and the swapped pair wouldn't.
2. *Faithful?* The second half is clean: on a flat table the trefoil (2, 3) and the cinquefoil (2, 5) give identical loops, 0.0000 % moved, and so does the unknot (2, 1). I get the same. The first half is confounded. The loop rate is held at 110 Hz, so (3, 2) reads the waveform cycle at 330 Hz where (2, 3) reads it at 220. The piece's own control shows what that costs: on the **flat** table, where θ is never heard, the same swap moves **92.3 %**. So most of the 53.0 % is the cycle read a fifth higher, which has nothing to do with the knot. When I hold the phase rate at 220 Hz instead and compare spectra in hertz, the swap moves **36.8 %** on the varied table and **0.0 %** on the flat one. The claim "same knot, different sound" survives, but the number the piece shows is the wrong one.
3. *Walks up?* Yes: one circle, a (2, 3) loop, other closures, then the test.

*Remake, one round:* in step 4, play and compare the (3, 2) case with the **phase rate held at 220 Hz** (loop at 73.3 Hz) and measure energy in hertz rather than in loop harmonics; or keep the loop held and put the flat-table swap (92.3 %) beside the varied one, saying what it shows. Then quote the frames' own share, 36.8 %, in the verdict line, the caption and the T² offer. The hint "every path you compare repeats at the same pitch" needs the same correction.

**`penrose_ratio_sweep.wav` (gathered) — keep.** Evidence beside the two bullets, already vetted on the 2D Torus face (15.0 s, six ratios at 2.5 s). The caption is honest that "four closed paths, then two that never close" describes the paths, and it points to the ratio gate for the hearing. A note, not a fix: the six differ by ratio, not by closing, and that is the ratio gate's own finding.

### Monodromy and the Fiber Bundle

**`one twist or many.html` — keep.** It tests the section's own sentence, *Wavetable Space as Torus.md:105*, against the section's own formula. If B were one shift of φ, the search would find a twist (the sanity check finds β = 0.3 exactly when one exists), and it doesn't. It is faithful about its loop: the intro says it takes the B sentence's loop, one fundamental period, not the bundle's θ loop. It walks up: plain loop, one twist, B, then the search. Every number recomputed (below).

### The Hopf Fibration

**`hopf-control-surface.html` (gathered) — keep, with a note.** It decorates rather than tests: nothing in it could show *Wavetable Space as Torus.md:113*'s "exactly this Clifford torus" wrong. The caption earns the keep, because it says plainly that tying latitude to ratio is the instrument's choice, not a fact of the fibration. It is a built instrument the section is about, gathered as built under its own contract (storage).

### Cross-Domain Resonances

**`penrose_kuramoto_three_regimes.wav` (gathered) — keep.** It is the Kuramoto subsection, heard: shimmer, hiccups, lock. The caption's 110 Hz, 1.518 and 3 ⁄ 2 match the 2D Torus scroll (`2D Torus Wavetable Synthesizer — scroll.md:837`: 4 Hz shimmer, locking at 0.8 Hz coupling with a 55.4 Hz fundamental). It also says it is unheard by Loudon.

### Open Questions

**`one winding three speeds.html` — keep.** It runs the page's own experiment, *Wavetable Space as Torus.md:158*, then the version that can fail. Its reading of "different overall rates" as every rate scaled together is the only one that keeps the (2, 3, 1) winding, and the piece says so. It walks up in five steps with the test last. Its step-5 hint concedes the structural point plainly: Berry's phase is the same for any speed along a path, and a table read is the path heard in time. That keeps it faithful while it tests the perceptual reading. Numbers recomputed (below).

## The offers

**1. T² claim-change ("the knot type is not heard"): the finding is real, but it is aimed at the wrong sentence and its number is confounded.**
- Recomputed: (2, 3) against (3, 2) on the varied table, **52.99 %** (the piece's 53.0 % holds as arithmetic); trefoil against cinquefoil on the flat table, **0.00 %**. But see the remake above: the same swap moves 92.3 % on the flat table, and only 36.8 % once the phase rate is held. 36.8 % is the number for the knot.
- The sentence it targets, *:82* ("a torus knot synthesis path with all the topological structure that implies"), is a **structural** claim about the path, and it is true. It doesn't say the knot is heard. The piece turns it into a perceptual claim. The page sentences that really do say the knot is heard are *:90*, "the discrete jumps in knot class at rational-ratio configurations are the timbral 'phase transitions' of modulation", and Deleuze in the Lens, *:169*, "the (p,q,r) link class … is the difference that makes the sound *be* what it is". Re-aim the offer at *:90*. Deleuze is a visiting voice, and the entry is free to keep him.
- The reason underneath is cleaner than the piece's: (p, q) → (q, p) is a homeomorphism of T², so it keeps every topological fact and moves the table. Timbre belongs to the function on the torus, which topology doesn't preserve.
- **Against the 2D Torus face:** the proposed wording, "whose winding pair (p, q), read through the table, sets the sound", is in mild tension with that face's ratio-gate finding (its manifest's Architecture claim-change). There, 3 ⁄ 2 and 1.5005, which is (3001, 2000) as a pair, sound the same, and the partials slide by m·δ with no jump. What is heard is the **two scan rates** read through the table, a continuous quantity, not the integer pair. Proposed instead: "…the two scan rates, read through the table, set the sound; neither the knot type nor whether the path closes is heard as such." The two faces don't contradict each other on what a closed knot sounds like: both say the knot class isn't what you hear. Both, though, cut against *:90*'s "discrete jumps", and that sentence is where offer 1 should land.

**2. Monodromy claim-change (B is one angle per partial, T^N): confirmed. The page sentence is wrong, not just reframed.**
- Recomputed: partial 16 ÷ partial 1 = **3,973.2×** at B = 0.0005, against a twist's 16×. π·B·n³ is **3.10 %** over at n = 16 (0.79 % at n = 8). Closest twist: **3.64 % / 10.88 % / 28.13 %** mismatch after 1 / 10 / 100 laps (β = 0.0681 / 0.1749 / 0.4624), each searched afresh. All match the piece.
- This is a mathematical claim refuted by the page's own formula: *:105* gives an excess cubic in n, and no single shift of φ can give that, since a shift moves partial n by n·β. "Exactly this role" fails. "B is a holonomy parameter" survives, on T^N, as *:129*'s T^k already implies. One wording fix: the single twist "only retunes the fundamental" should read "only retunes the tone": every partial scales together, a pitch shift.

**3. Monodromy no-claim-edit (θ loop against the fundamental period): real, but not quite no-claim.** *:98* takes the trip around θ, and *:105* measures B over a lap of φ. Naming the loop is a small edit in words, but it makes visible that the bundle's base loop and B's holonomy loop are different loops, and that is offer 2's point. Carry it with offer 2, not apart from it.

**4. Cross-Domain claim-change (Berry: winding class doesn't fix timbre): confirmed, with an amendment.**
- Recomputed: uneven speed ε = 0.2 on the same path, **17.18 %**; a bend of 0.05 laps, **5.98 %**; winding (2, 3, 1) in both.
- Split the sentence at *:141*. "Different speeds": structurally **true** for the holonomy (a line integral is unchanged by any reparametrization, uneven included, and the piece's hint says so). It is false only for per-cycle timbre, and that is the page's own word ("spectral transformation") and its own move in Open Questions. "Same winding class": **wrong even as physics**. Berry's phase depends on the curvature the loop encloses, not its winding class. Only a flat connection, the Aharonov–Bohm case the page cites, gives a winding-only phase. The page conflates the two.
- The proposed rewrite drops the true half. Keep it: "the accumulated phase is unchanged by any change of speed along one path; Berry's depends on the curvature enclosed, and only Aharonov–Bohm's on the winding alone; per-cycle timbre is the path heard in time, so the winding class does not fix it."

**5. Open Questions claim-change (the experiment can't fail as worded): confirmed and sharpened.**
- Recomputed from sample-by-sample renders at 48 kHz: (2, 3, 1) across 64 / 96 / 144 Hz, **0.00000 %** worst moved, brightness **207 / 311 / 466 Hz**. The control the experiment lacks: (2, 5, 1) and plain (1, 0, 0) also give **0.00000 %**. Any closed path passes, so passing says nothing about the winding.
- Strictly, it *can* fail, but only perceptually: timbre heard at three pitches a fifth or more apart may not seem the same, as the brightness in hertz rises. That failure would be psychoacoustics, not topology. Either outcome is silent on the winding class. The replacement experiment, one rate with a different speed profile or a bent path, can fail, and does (17.2 %, 6.0 %).

## The face as a whole

It makes the idea felt, and it is not busy. Three made pieces, three gathered, each beside the sentence it serves. Each made piece walks up from one circle and ends where the page's own text sets a test. The face's real gift is the distinction the page blurs: a torus is a structure, and a sound is a function read along a path on it. Topology fixes the first and not the second. The pieces show that by ear, and two of them make the page's mathematics answer to its own formulas. Where the face overreaches is in turning the page's structural sentences into perceptual ones, at *:82* and in the speed half of *:141*. The text should keep those, and give up the sentences that really do claim hearing, *:90*, *:141*'s winding half and *:158*. One fix before it lands: the which-knot swap has to hold the pitch of the read, or its 53 % is mostly a fifth.
