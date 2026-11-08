---
title: "Harmonicity and Inharmonicity — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Harmonicity and Inharmonicity]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Harmonicity and Inharmonicity's first rich face: each piece judged for whether it tests its section, stays true to it and walks up to it, and each of the maker's four offers recomputed on the proofs' own model, so the next round and Loudon start from numbers and not from the maker's word."
---

# Harmonicity and Inharmonicity — rich — challenge

Proposal round of Enrichment v2.7 (v2.8 being written), 2026-11-03. Judged from the page (`Harmonicity and Inharmonicity.md`), the manifest, the two made pieces and their check, the ten gathered proofs and their scripts, with the maker's commit `cfc3628f` as its only account.

## Is the model the page's?

Yes. The core in both pieces (`<script id="frust-core">`, byte-equal in the two) is `edgemap.py`'s `run()` ported line for line: one phase θ, partial n at rₙθ with rₙ = n·√(1 + B·n²); each voice pulled toward its partial by −K·sin 2π(φₙ − pₙ); the tone pulled by back·K·Σ rₙ·sin, back = 21⁄Σn; far pulls faded past 3–4 kHz (`edgemap.py:12-22`). That is the frustrated-coupling picture of the section at `Harmonicity and Inharmonicity.md:39-45`, voices pulled toward the harmonics against a stretched series, not a stand-in. The voices' detune table in the core is numpy `default_rng(7).uniform(−0.004, 0.004, 40)` to nine places; I regenerated it and it matches, and the first six of the 40-draw are the 6-draw, so the six-partial runs agree too. Two choices are the proofs', not the page's: the back-pull scaling and the far-pull fade. The page already says the numbers depend on the model (`:55`).

## The pieces

### The Frustrated Coupling Insight

**`Harmonicity and Inharmonicity — rich — frustration.html` — keep.**
1. *Test or decoration:* a test. Step 3's push could have shown the six voices pulling different ways; it shows all six pull down together (check: tug changes −0.04 to −1.56 Hz, all negative). Step 4's sag could have been a fight; the tone settles 0.54 Hz flat and holds, matching scene 2 of the five scenes (109.538 vs `frustration-report.json` 109.54). Step 5 asks the ear for the edge blind, then reveals it.
2. *Faithful:* yes. It says what `:41-45` says, one phase, commensurate pulls that agree, incommensurate ones that frustrate, a strain before a failure, an edge past which it tears. Step 3's line that even the whole-number tone is a little frustrated when its voices are a hair off goes beyond the page, but it is true on the model (bars up to 8.99 Hz each way, sum 0.08) and it is offer 3's point made audible.
3. *Walks up:* yes. Tone alone (one phase, six partials, nothing changes), one voice (holds within 12 Hz, slips past), six on the harmonics, a little stretch, then the blind test. Each step adds one thing; the step rail stays open.
Runs clean, no AudioContext before Play, one context once played, stops on step change. The reveal's edges (1.72–1.75e-3 on the harmonics, 2.13–2.17e-3 with the sweeps' voices) agree with my independent run: 1.68–1.78e-3 and 2.11–2.24e-3 on a 1⁄40-decade grid.

### The Asymmetry

**`proofs/…/frustration-five-scenes.m4a` — keep.** Evidence, not a test, and the right evidence: scene 5, the heavy master holding within 0.8 Hz at bell-wide stretch while the light tone was dragged 18 Hz flat, is `:47-49` heard. Every number in the caption matches the scroll's five-scenes entry. It says honestly that there is no tone-alone take.

**`proofs/…/frustration-fundamental.png` — keep.** The pulse through the five scenes, beside "Aurally unstable". The caption says only what the plot shows.

### What the Sweeps Showed

**`proofs/…/sweep4x-singer-alone.m4a` — keep.** The five places in one take, tone alone first as the field guide asks. The edge at 13.5 s, B ≈ 1.7e-5, matches `sweep4x-report.json` (13.48 s, 1.72e-5); the rest matches the scroll.

**`Harmonicity and Inharmonicity — rich — six against forty.html` — remake.**
1. *Test or decoration:* a real test, and one that partly came out differently from the text. It measures where 6, 10, 16, 25 and 40 partials first tear by the map's own rule and sets the result against n³. Driven headless in the face, the measure gives 75× and p ≈ 2.29 with the voices on the harmonics, the same as its CHECKED block.
2. *Faithful:* mostly. Where it disagrees with the text, on the cube and on 75× against "over a hundred", it says so as what this model gives, and offers 1 and 2 carry it to Loudon. That is an offer, not a fault. **But one sentence is false on the model:** step 2's try-text says the thin 6 Hz line marks where "every partial above it would need more than one voice's reach". The sister piece's step 2 shows a lone voice's reach is 12 Hz. The proofs found the six-partial tone held to a 24 Hz mismatch (scroll, slow 6-partial sweep note). And in this piece's own next step, at B = 1e-5, 18 partials have a bite over 6 Hz but only 8 voices have let go; at 5.6e-6 it is 14 against 3. The tone sags to meet them.
3. *Walks up:* yes. The bite on six partials alone, the same on forty, the peel, snap against fray, then guess and measure. A good walk.
**Remake, exactly:** in step 2's `tryText` (line 323), drop the reach claim. Either take the 6 Hz line out, or label it "the coupling, for scale: the next step shows voices holding well past it". In step 3's `tryText` (line 329), "up to 17 Hz at partial 40" is the bound, not what partial 40 sits at (12.2 Hz; the largest is 16.6 Hz at partial 38). Say "up to about 17 Hz near the top". Then, if you like, add that the voices that never hold are the ones more than about 5 Hz from their partial (see offer 4 below). Nothing else needs to change. Optionally, "about half" in step 3 is generous: at the edge it is 16 of 40.

**`proofs/…/edgemap.png` — keep.** The map the sweeps were read against. Its K = 6 first tears (3e-3, 1.8e-5) are read correctly from `edgemap.json`. "Their check reproduces the K = 6 Hz rows" is a little strong: held cells agree within 0.044 Hz, and forty's first tear lands one cell later (0.47 against 0.53 Hz, a borderline cell). A note, not a remake.

**`proofs/…/sweep-singer-alone.m4a` — keep.** Six partials, the bargain then the snap: 110 to 107.3 Hz, snap at 40.75 s, B ≈ 0.0022. All match `sweep-report.json` (40.75 s, 0.002163, 107.33 Hz).

**`proofs/…/sweep40-singer-alone.m4a` — keep.** Forty partials, the fray: edge about 42 s at B ≈ 1.7e-5, matching `sweep40-report.json` (41.72 s, 1.67e-5). Set beside the six-partial sweep at "Few voices snap", the pair is the sentence.

**`proofs/…/sweeppin-singer-alone.m4a` — keep.** Pinned stretch, string to bar and periodic again, beside `:61`. The partial ratios 2.73, 5.44, 9.2, 14.0 to 4, 9, 16, 25 match the scroll.

### Open Questions

**`proofs/…/ride-breathe-warm-alone.m4a` — keep.** Breathing across the edge, the first of the three plays `:71` names. Its timings match the scroll's warm entry.

**`proofs/…/gestures-warm-alone.m4a` — keep.** Striking past and stepping through, the other two. Its timings and τ match the gestures entry.

**`proofs/…/ride-coupling-warm-alone.m4a` — keep.** "More coupling pushes it out" (`:72`), heard: coupling alone decides lock or tear at a fixed stretch.

All ten gathered files are tracked (`git ls-files`); nothing is copied, nothing licensed. The made pieces synthesise their own sound.

## The checks

- `conform.mjs "Harmonicity and Inharmonicity"`: 2 pages, introduced 2, errored 0, **errors 0, warnings 0** (the maker's two file-local warnings are gone now that the pieces are committed). Browser pass at 760 and 1130 px.
- `fingerprint.mjs`: all four sections **in step** (af19f88107c8, 4735c28ea322, 78d63f21718a, 1a636f436e46).
- The `.md` is untouched by `cfc3628f`.
- The maker's `… rich — check.mjs`: **25 PASS, 0 FAIL**, 44 s.
- `check-hidden-hush.mjs`: all PASS. This is the kit's own check; the pieces add no hush logic of their own and need none.
- The face on `rich-server` (headless Chromium, 1130 and 760 px): two band iframes, 12 figures with the *proposal · 2026-11-03* chip, nothing lost, no "earlier version" flag, **console clean** at both widths. The frustration walk was driven step by step: 0 AudioContexts before any click, 1 after Play, and every step plays. Six against forty was driven through all five steps, with a guess, then *Measure it*, which printed 75×, p ≈ 2.29, and the table 1.7e-3 / 4.8e-4 / 1.6e-4 / 5.8e-5 / 2.3e-5.
- My own recompute, independent of the maker's JS: `edgemap.py`'s `run()` in Python, numpy's own starting phases, K = 6, held 4 s, torn past 0.5 Hz, with B on a 1⁄40-decade grid around each edge, at 22050 and 11025 Hz. Scripts in the scratchpad (`challenge-hi/edges.py`), not kept.
- Not checked: anything heard.

## The offers

**1. The edge falls as N^2.3–2.5, not the cube — confirmed.** `edgemap.json` alone cannot settle it. It holds only N = 6 and 40, and its quarter-decade grid bounds the six-to-forty ratio only between 100 and 316 (six held at 1.78e-3 and tore at 3.16e-3; forty held at 1e-5 and tore at 1.78e-5). So I ran the model for five N. A least-squares slope of log edge on log N:

| voices | 6 | 10 | 16 | 25 | 40 | slope | 6 ÷ 40 |
|---|---|---|---|---|---|---|---|
| a hair off (the sweeps') | 2.18e-3 | 5.46e-4 | 1.54e-4 | 6.13e-5 | 1.73e-5 | **2.52** | 126× |
| on the harmonics | 1.73e-3 | 4.87e-4 | 1.63e-4 | 5.79e-5 | 2.44e-5 | **2.26** | 71× |

The maker got 2.49 and 2.29 by bisection at 11025 Hz. The two agree within the grids. **The number holds. The page sentence is right about the bite and loose about the edge.** "Stretch bites the nth partial roughly as B·n³" (`:58`) is exact for small B. It is the "so" that leans on the cube, and Open Questions' "the top partials set the edge, roughly as B·n³" (`:72`) states it. The exponent is the model's, set by the back-pull scaling, the fade and the 0.5 Hz rule, and the page already says the numbers depend on the model. A light claim-change is warranted: keep the bite at B·n³, and say the edge falls more slowly than the cube. Offer 4's peel is why, and the piece's reveal already says so.

**2. "Over a hundred times sooner" holds a hair off, 75× on the harmonics — confirmed, within the grids.** A hair off, I get 126× at both rates; the sweeps' own reports give 2.163e-3 ÷ 1.67e-5 = **130×** (`sweep-report.json`, `sweep40-report.json`). On the harmonics I get **71×**, the maker 75×; each end of my grid is good to about ±6%. **The page sentence is not wrong:** it reports what the sweeps did, and the sweeps used detuned voices. The model is narrower than the sentence sounds. If offer 3 lands ("tuned near … a hair off"), the sentence is accurate as it stands. I would fold the 75× in as a parenthesis, or into the scroll, rather than carry it as a separate claim-change.

**3. Voices up to 0.4% off in every proof — confirmed.** Every script draws `DET = 1 + default_rng(7).uniform(−0.004, 0.004, N)`: `edgemap.py:13`, `frustration.py:21`, `sweep.py:11`, `sweep40.py:13`, `sweep120.py:13`, `sweep4x.py:13`, `sweeppin.py:13`, `ride.py:15`, `ride_warm.py:23`, and both `gestures*.py` load `ride.py`. The largest is 0.397%. **The page sentence is wrong on the letter** (`:55`, "tuned to the plain harmonic series"). "Tuned near … each a hair off" is right. The scroll's own frame has the same slip (`… — scroll.md:42`), while its five-scenes entry says "near" (`:251`). It is no-claim-edit for the shapes, but offer 2 shows the detune moves a number the page states. So land offers 3 and 2 together.

**4. The peel, and a third that never hold — confirmed, with one correction to the reason.** On the harmonics, my Python run gives voices gone **3, 8, 14 of 40** at B = 5.6e-6, 1e-5, 1.8e-5, strictly from the top down (partials 38–40, 33–40, 27–40); the maker gave 2, 8, 14. At the edge itself (wobble crossing 0.5 Hz near B ≈ 2.3e-5), **16 of 40** have gone; by 3.2e-5, 18. So "about half" is generous: it is closer to two in five. Past the edge the count is chaotic (one run at 3.2e-5 gave 35). A hair off, **15 of 40** never hold at B = 1e-7 (the maker had 14), all of them partials 17 and up. The count stands. The reason given, "0.4% of partial 40 is up to 17 Hz, past a 6 Hz pull", is the right idea stated too simply. Only partials 33, 38 and 40 sit more than 12 Hz off. Measured from the tone's sagged pitch (109.92 Hz), every voice that slips sits 4.5–14.5 Hz from its partial, and every one that holds sits within 4.8 Hz. In the tall tone a voice's reach shrinks to about 5 Hz, against 12 for a lone voice. **The model is narrower than the page here, not the page wrong.** The page's "frozen" place (`:57`) was never claimed for every voice. Offered as an addition, the scroll is the better home: the entry should stay short.

**The nominator's misreading — confirmed.** The nomination (scratchpad `nominate/out-01.json`) asked for "six against forty against 120 partials". `sweep120.py:11` sets `N = 40, SECS = 120.0`: a two-minute run of forty partials. The maker built nothing on the misreading and gathered none of sweep120. The commit body does not record the finding; it is recorded here.

## The face as a whole

It makes the page's idea felt. The two walks are one argument in two halves. The first gives you the frustration in your ear on six partials: one phase, pulls that agree, pulls that don't, a strain you can push and hear come back, an edge you go and find blind. The second carries it up the ladder and asks how much sooner. The proofs then sit beside the sentences they are evidence for, tone alone first, as the field guide says. It is not busy: twelve figures over four sections, the two bands where the claims are, the rest in the margin. Its best work is honest disagreement. It measured the page's own sentence and found the cube too steep and the hundred dependent on a detune nobody had named. It said so as numbers on the model, and left the text to Loudon. The one remake is a single sentence that brings back the guess the proofs had already retired.
