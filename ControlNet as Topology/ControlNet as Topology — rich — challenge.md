---
title: "ControlNet as Topology — rich — challenge"
born: 2026-11-03
links:
  - target: "[[ControlNet as Topology]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of ControlNet as Topology's proposed rich face: every piece judged for test, fidelity and walk-up, every offer recomputed by a second route, and the line drawn between what the toy terrain shows about itself and what it shows about diffusion, so Loudon reads a face that has already been argued with."
---

# ControlNet as Topology — rich — challenge

Challenger, proposal round of Enrichment v2.8, 2026-11-03, on the maker's commit `7706c245` in the worktree `enrich/controlnet-as-topology`. Judged from the page (`ControlNet as Topology.md`), the manifest, the two made pieces and their sources, the four gathered renders and the GenAI Camera's record of them, with the maker's commit body as its only account. I did not make this face.

**Verdicts: 5 keep, 1 remake, 0 retire.**

## The question the brief put first: should a toy land at all?

Yes, as a proposal, with one scoping line per caption, not "in this toy" on every claim. The landscape is not a stand-in invented beside the page; it is the page's own math run exactly. The section says "the intuition becomes math" and writes it down: `E(x) = −log p(x)`, `score = −∇E`, the cooling as annealing (`ControlNet as Topology.md:51-61`). The piece takes a six-valley mixture, computes its score exactly at every fog level, and samples it the way a variance-exploding ancestral sampler does. A finding there is a finding about the page's picture, and where the picture is right about diffusion, about diffusion too.

The line to watch is where a finding depends on a choice the maker made that the page never did. There is one such place, and it is the low-denoise half of the denoise × weight test (below). That is where the caption and the offer have to say "in the page's picture, run in two dimensions", and where the proposed text sentence should wait for a real run. The rough-to-fine piece is not a toy in the same sense: real images, Stable Diffusion's real end points, an exact linear analysis. Its limits are linearity and pixels against latents, and its note says both (`rough to fine.html:114`).

## The sculptor's studio (a door in)

### ControlNet as Topology — rich — rough to fine.html — keep

**Test or decoration?** A test. The page says the rough-to-fine progression "is the noise schedule cooling, coarse structure first and fine texture last" (`ControlNet as Topology.md:39`). The piece runs that schedule over two real pictures and a control with no coarse shape. If the schedule alone ordered the carving, the control would climb too. It doesn't: nothing until 54%, everything by 55%. So the piece can come out against the page's causal reading, and does, a little.

**Faithful?** Yes. It confirms what the page says happens and adds why. One overreach, taste-sized: the verdict's headline "But the schedule is not what orders it" (`rough to fine.html:220`) is stronger than the finding. The schedule supplies the sweep; the picture's spectrum supplies the order; neither alone gives rough to fine. The same paragraph's last sentence says exactly that, so the headline could read "the schedule alone does not order it". The caption's last sentence carries the same lean ("the order is the picture's, not the schedule's"); "for a linear carver" once in the caption would also help.

**Walks up?** Yes. The raw block, one stroke with its best guess, the scales against the fog, then the test. One idea a step, the test last.

Clean: no sound, no files declared or needed, both images inlined as base64 crops.

## The same truth, made precise: the landscape

### ControlNet as Topology — rich — the landscape.html — remake

**Test or decoration?** Mostly tests, and good ones. Step 2 tests the sentence "until only the deepest basin remains" (`ControlNet as Topology.md:61`) and it fails. Step 5 tests the denoise × weight bullet (`:66`) and finds one half holds. Step 3, CFG, is meant as a test and in the browser it isn't one (fix 1).

**Faithful?** The numbers reproduce. The step 5 verdict leans one way on a case where the page's sentence actually holds (fix 2).

**Walks up?** Yes, well. One ball rolling down one valley with only the score shown, then fog, then CFG, then the canyon, then the test. Each step adds one thing.

**Remake, three fixes:**

1. **Step 3's count can't come out non-zero in the browser.** `tally(comps(), S.balls)` (`the landscape.html:297`) uses `comps('cfg')`, which is `BASE` alone (`:198`), so `valleyOf` never returns `canyon` and "where no valley was" reads `pct(undefined)` = 0.0% whatever the balls do. `checks.mjs:25` tallies against `[...BASE, ...far]`, so the number in the commit is real (0.0% at w 3, 7, 12; I got 0.0% too). The page shows the right number by construction, not by measurement. Fix: in the CFG step, tally against `BASE` plus `cnNow()[0]`, as checks.mjs does.
2. **Step 5's verdict calls the low-denoise half "not as the page says" in the case where it holds.** With the canyon beside the init (0.26 away), denoise 0.5 catches 50, 50, 53, 53, 62% at weight 3, 4, 6, 8, 12 (checks.mjs; reseeded at 200 balls: 40, 51, 57, 61, 62). That is the page's "competes evenly", and weight barely moves it. But the verdict's reach rule (`:317`) picks d 0.4 as the reach and reports only "at denoise 0.3 and below, nothing". Say the d 0.5 row when it's there. And name, in the verdict or the note (`:124`), that the far canyon's zero at d ≤ 0.5 rests on the canyon's flat floor: the canyon is a narrow well at weight 0.02 over a floor of spread 3 at weight 0.98 (`:157`), so its pull fades a few widths away. Take the floor out and the same canyon at denoise 0.5 catches 26% at weight 1 and 100% at weight 3 (my recheck, 200 balls a cell). The page never says what a canyon's pull does far from it; the piece chose.
3. **The caption states toy results as plain fact.** "Low denoise does not make the canyon compete evenly: it shortens its reach, and a canyon out of reach is never felt." One clause, once, in the caption: that this is the page's picture run in two dimensions, not a network. The piece's own `sub` and `note` already say it (`:77`, `:124`); the caption is what the face shows first.

Clean otherwise: no sound, nothing declared, seeded runs.

## Pose vs depth — canyons of different shape (2026-07-09)

The four gathered renders resolve and load (naturalWidth 1177, 1177, 1152, 1152 at `/rich/`), and all four are tracked in git (`git ls-files "GenAI Camera/renders"`). I looked at each.

### /GenAI Camera/renders/render_021.png — keep

The test that stands for the section's rule: same init, pose held at 0.9, depth swept. It could have come out the other way and didn't. The caption matches the image: hooded robe at pose only and 0.15, legs bare by 0.30, the mannequin's surface inked at 0.60 and 0.80. Note: the owning record reads this same sweep with a middle, not two ends: "~0.30–0.45 the sweet spot — real 3D body form *and* the costume still reads" (`GenAI Camera.md:171`). "By 0.30 the legs are bare" is true and reads as loss; one clause naming the record's sweet spot would carry the dial whole.

### /GenAI Camera/renders/render_022.png — keep

Same sweep, the barbarian. Caption accurate: fur, cloak and boots at pose only, thinning as depth rises, a loincloth at 0.60 and 0.80 (the record: "costume retreats to the periphery (cape / crown / loincloth)", `GenAI Camera.md:172-173`).

### /GenAI Camera/renders/render_010.png — keep

The section's original depth-side evidence. Caption matches the record, "figures depth-only @0.97" (`GenAI Camera/renders.json`, entry `n: 10`), and the image: two inked mannequins.

### /GenAI Camera/renders/render_011.png — keep

The pose side of the original pair, shown with the record's own caveat rather than hidden. Caption matches `renders.json` entry `n: 11`, caveat "Pre-fix thin pose (weak): clothing + stance came mostly from the img2img init at high denoise, not the pose", and the image: the arms are not out, which is the thin plate failing to hold the stance, and the hard edges are the composite mask. Keeping the weak evidence beside the strong, labelled, is the honest move.

None of the four tests anything by itself in the browser; they are records. Together, 021 and 022 are a test the section's rule passed.

## Checks run

- `node _ops/rich-face/conform.mjs "ControlNet as Topology"`: 2 pages, introduced 2, pre-contract 0, errored 0; errors 0, warnings 0; browser pass at 760 and 1130 px. Clean (the maker's 2 file-local warnings are gone now the pieces are tracked).
- `node _ops/rich-face/fingerprint.mjs "ControlNet as Topology"`: all three sections in step (4bbf2339bfb0, a2b3e7f42158, 6836494b8980).
- `node "ControlNet as Topology — rich — checks.mjs"`: every number in the commit, manifest and captions reproduced exactly.
- Face served with `rich-server.mjs --root <worktree> --detach`, loaded headless at 1300 px with STIGMERGY's Playwright, both frames driven: CFG step readout "where no valley was 0.0%"; fog step 18.0% portrait, 31.7% mountains (a 300-ball browser run); step 5 verdict as above; rough-to-fine verdict 4 / 9 / 25 / 85, all at 82%, control 54%. Six proposal chips. Console: nothing logged, no page errors. Server stopped.
- Recomputed by a second route (scratchpad, not committed): the landscape at other seeds and 200 balls a cell; the floorless canyon; the spectra in numpy from the piece's own base64 crops, unsmoothed rings.
- Sound: neither piece makes any, so hush and the time cap don't arise.

## The offers

**1. "Only the deepest basin remains" describes an optimiser (landscape) — confirmed.** checks.mjs: portrait (deepest, E −2.44) 17.3% for an 18% share; mountains (shallowest, E −0.53) 28.1% for 30%. Seeds 11, 12, 13: portrait 16.9, 18.4, 16.7%; mountains 28.6, 28.9, 29.3%. With an exact score the sampler returns the mixture, so this is the sampler working, not a surprise, and it holds for real diffusion for the same reason: annealed Langevin and ancestral samplers end at a small noise level at temperature one, so they sample p; simulated annealing taken to zero temperature is what finds the lowest point. The page's picture, "a ball roll[s] into the deepest valley… until only the deepest basin remains" (`:61`), is the optimiser's picture. The offer stands. One wording note: "not how deep it goes" overcorrects. A basin's share is its mass, depth and width together (the portrait is deepest because it is narrowest). "Not by depth alone" is the true version.

**2. Denoise × weight (landscape) — high half confirmed; low half confirmed for the toy, disputed as a sentence for the page.** The page's bullet names both knobs (`:66`), so the offer bears on its low-denoise clause, not on a sentence that forgets denoise. (The studio's "its weight is how rigid the wire is", `:45`, does leave denoise out; the offer could note it, scoped.) High half: d 1.0 caught 0 / 78 / 100% at weight 0.5 / 3 / 8; reseeded 0 / 79 / 100. Reproduces. Low half: the far canyon (0.63) caught 0% at every weight to 12 for d ≤ 0.5; reseeded d 0.5 at weight 12, 0%. The near-canyon 75% at d 0.7 against 45% at 1.0 (weight 2); reseeded 76 against 47. All reproduce. The dispute is scope. The far zero depends on the canyon's flat floor; floorless, d 0.5 catches 26% at weight 1 and 100% at weight 3. And the near case at d 0.5 splits about evenly, flat in weight, which is the page's own clause holding. So "one cut elsewhere is never felt" is a result about this terrain. It may well hold for a real network for a different reason: a trained denoiser at small σ removes noise of about that size and no more. But the place to find out is the GenAI Camera: an init and a depth plate from different poses, denoise 0.3 to 0.5, weight swept. Until then the offer should be scoped in its own words, and the proposed sentence held.

**3. The schedule's noise is white; the order comes from the spectrum (rough to fine) — confirmed.** checks.mjs: hero slope −2.66, render 003 −2.43, control 0.01; hero decided 4 / 9 / 25 / 85 at 10 / 25 / 50 / 75%, every scale at 82%; never falls across 101 strokes. My numpy on the same crops without the ±10% smoothing: −2.63 and −2.40; hero 4 / 9 / 25 / 87, render 5 / 11 / 31 / 106. The control's 54% → 55% is σ crossing 1 against a flat spectrum of unit power, and analytically σ = 1 at p = 0.542 on this Karras curve. That is close to definitional, a sound control rather than a discovery. The finding itself is standard: natural images have a red spectrum, so the low frequencies keep their signal-to-noise longest and are recovered first (what Dieleman calls diffusion as approximate spectral autoregression). The page describes ("it's the noise schedule cooling") and implies the schedule is the cause without naming the picture's part. The proposed wording keeps the page's sentence and adds the reason, so it reads as an addition more than a correction; `claim-change` is fair because it changes what the sentence says causes the order.

**4. The told example ran on the thin plate (Pose vs depth) — confirmed.** `GenAI Camera/renders.json`: entry `n: 11` carries the caveat quoted above; entry `n: 20` is the diagnosis ("thin plate (mine) -> arms drift down; thick plate (real controlnet_aux) -> arms match the skeleton"); entries `n: 21` and `n: 22` are the thick-plate sweeps, pose 0.9, denoise 0.9, depth 0.0 to 0.8. `GenAI Camera.md:152-161` records the fix and that "earlier 'pose frees clothing' results were partly the img2img init + high denoise". Cite 021 and 022. Add to the offer that the record's dial has a middle: `GenAI Camera.md:169-176` names depth ~0.30 + pose as the default, so "how tight a canyon you want" is a setting, not a choice between two conditioners.

## The face as a whole

It makes the page's idea felt, not just busy. Two working instruments, each walking from one concept to a test the page could fail. Both find the page right in what it pictures and loose in what it says causes it: the cooling samples rather than optimises, and rough to fine needs the picture as much as the schedule. The renders put the pose-versus-depth rule in front of the reader as a sweep, with the weaker first evidence kept and labelled. The risk is the one the brief named. A terrain this clean makes its own modelling choices feel like facts about ControlNet, and the face is most persuasive exactly where it is most toy, at low denoise. Fix the CFG count, give the near-canyon case its due, scope the caption, and the face says what it measured and no more.
