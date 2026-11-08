---
title: "Web Audio Worklet — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Web Audio Worklet]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Web Audio Worklet's proposed rich face: each gotcha the pieces put to the ear checked against a browser and a recount of my own, so Loudon reads a face that has already been argued with."
---

# Web Audio Worklet — rich — challenge

Challenger, proposal round, 2026-11-03, on the maker's commit a5abee89 in the worktree `enrich/web-audio-worklet`. I judged from the page, the pieces and the commit body. I did not make this face.

**Tally: 4 keep, 1 remake, 0 retire.**

## The checks I ran

- **The maker's check** (`Web Audio Worklet — rich — check.mjs`): all pass, in 5 s. But one of its numbers comes from a flaw in its own harness, not from the piece (see the splice, below).
- **conform** (`conform.mjs "Web Audio Worklet"`): 4 pages, 0 errors, 1 warning. The warning is `Murmuration.html` (pre-contract, gathered by link): it uses localStorage without declaring `piece:needs storage`. Keep with a note. The page's text links it, and declaring it is Murmuration's job, not this face's. The commit's "2 after this commit" is now 1, because the two file-local warnings went once the pieces were tracked.
- **fingerprint**: Gotchas 50f7ea440e2c, Resource Footprint c38cc55e5ee4, Recipes 512c21ab55c9, all in step.
- **The face, headless Chromium 147, 1280 × 900**, every frame scrolled in. Console clean. No AudioContext in any of the three frames before a click. With the page hidden, the sounding context went to `suspended`. Live on the splice's step 4 (16 grains, sine): 269 and 265 jumps a second (267 expected), and the top end **36.7 dB** higher mid-grain. Two places, step 3: "1 channel / processorerror fired: silent until rebuilt". Step 4: idiom, low voice lost; guard, high voice lost; fold, both reach you.
- **My own stereo worklet**, written fresh (300 and 450 Hz at 0.25), rendered offline in Chromium 147.0.7727.15. Asked and both written: L 0.25 / R 0.25, each in its own ear. Asked with only the left written: right ear 0. Written but not asked: `chans` 1, `processorerror` arrives as an **ErrorEvent** with message **"Uncaught TypeError: Cannot set properties of undefined (setting '0')"**, and both ears are 0 for the whole render. Idiom: 450 Hz only, 0.25 in both ears. Guard: 300 Hz only, in both ears. Fold: 0.125 of each in both ears. **Recovery:** the errored node stays silent. A new node built in the same context at 0.50 s plays both voices at 0.25. You rebuild the node, not the context.
- **My own grain loop**, written fresh with a different RNG. Largest step at the zero 6.52e-7, against the bound sin²(π/3840) = 6.69e-7. One grain mid-grain: top end rises 35.7 dB. Clouds of 60 ms grains at ±12 cents: sine 37.0 / 37.1 / 37.1 dB at 4 / 16 / 32 grains; bright 16.1 / 16.4 / 15.9.
- **The maker's harness, re-run on the piece's own worklet with the tail filled**: sine 37.1 / 37.6 / 37.2 dB; bright 16.3 / 16.2 / 16.0.
- **Murmuration's check** (`Murmuration — rich — check.mjs`): all pass. φ 0.099, past 0.9 at 5.7 s, 0.964 after 60 s; 0.114 at η 0.80.
- **Records:** `Murmuration.html:463` has `map:'order'`. `:467` has `etaOfX = x => 0.25*x*x`. The `cMap` select offers order, place (first build) and density (second reading). `:156` has Predator, startle wave. `:337`/`:366` hold the guarded idiom. Order became the default in a6a23f8a, 2026-10-14. `ceiling/ceiling-headless-chrome.json` matches the ceiling caption: 24 / 59 / 66 / 101 %, 858 underruns. All three gathered files are tracked, and nothing licensed is copied.

## The pieces

### Gotchas · two places — keep

1. **Test.** Yes, and it found something. The page says the idiom `out[1] || out[0]` "handles the mono-host case". Steps 2 and 3 could have come out otherwise, and step 4 did. On a one-channel node the idiom stops the throw but keeps only one voice.
2. **Faithful.** Where it differs from the text ("a thrown channel-count mismatch" is really a TypeError that silences both ears), it says so in its own words and carries the difference as offer 2. It does not rewrite the gotcha. That is the right handling.
3. **Walks up.** Yes. It opens on stereo done right, then each half of the mistake on its own, then the idiom as the test.

Runs clean, starts on a click, quiets when hidden. The caption is honest, and it says no ear has heard it. A small note: the meter's "here or absent" threshold is −60 dB on an analyser bin. That fits these test tones. Nobody should read it as a general detector.

### Gotchas · the splice — remake

1. **Test.** Yes. Steps 2 and 3 measure the step every jump puts in the sound. Step 4 asks whether a cloud hides it, and the answer could have been yes.
2. **Faithful.** The piece holds the gotcha. Its live readout is right: 36.7 dB in the face. **The caption is not.** The caption's "26.6 to 30.2 dB at 4 to 32 grains of a sine", and the check that produced it, come from a bug in the check's `run()`. With `warm = 1.5` s the warm-up is 562.5 blocks, which rounds to 563, so the last 128 samples of `out` are never written. The cut from sound to zero at the end adds top end to the jump-at-the-zero runs: −51.1 / −54.1 / −53.5 dB where the true figure is −61.6. With the tail filled, the rise is **37.1 / 37.6 / 37.2 dB**, flat across density. The bright numbers barely move (16.3 / 16.2 / 16.0). The one-grain 35.1 dB is fine, because `warm = 1` is a whole number of blocks.
3. **Walks up.** Yes. One grain, then the scatter at the zero, then the jump slid along the grain, then the cloud.

**Remake, exactly:**
- In `check.mjs` `run()`, make the record fill `out`: run until `k === out.length`, or round warm to whole blocks.
- Re-run the check, then correct the caption and offer 3 to about 37 dB at 4, 16 and 32 sine grains (bright about 16).
- In the caption, replace "the average step follows the window exactly". Measured, mean ÷ w(a) runs 0.362 to 0.378. Say "follows the window, within 4%", or "the same jumps, scaled by the window".
- Step 2's "the largest step reads under a millionth" holds at the 80 ms preset. It grows as 1/length², to about 1.1e-5 at 20 ms. Either say "at 80 ms" or leave the slider off that step.

Why the step tracks the window: the sound is y = w(g)·x(p). A jump changes x by Δx at a moment when the window is w(a), so the break in y is w(a)·Δx. Δx doesn't depend on a, so the step scales with the window's height. At the zero, the first sample after the wrap has w = sin²(π·g) with g < 1/3840. Times the level 0.5 and |Δx| ≤ 2, that bounds the step at 6.69e-7. The 6.6e-7 the maker measured is that bound nearly reached.

### Resource Footprint · ceiling/ceiling-done.png (gathered) — keep

This is the measurement the sentence "comfortable headroom on desktop" asks for. Every number in the caption matches `ceiling-headless-chrome.json`, and the caption names headless Chrome on this Mac, with Firefox and Safari unmeasured. Murmuration's challenger kept it too.

### Recipes · the knee (gathered from Murmuration's face) — keep

It tests the Recipe's phase-transition claim on the Recipe's own flock, and its walk-up was already judged on Murmuration's face. This is the landed version, after that face's remake (fbd391ae, "no memory claimed"). The caption's numbers re-run today: 0.099, 5.7 s, 0.964, 0.114. They agree with Murmuration's face word for word.

### Recipes · transition.png (gathered) — keep, with a note

The caption is honest about the top panel ("first sixth", against the image's "~15%" and `Murmuration.html:464-466`). It says nothing about the bottom panel: the pitch focus under the first mapping against the order mapping. That panel is the evidence for offer 5, so name it in one clause. It is a choice of wording, not a fault.

## The offers

1. **Idiom keeps one side — confirmed.** Independent render: idiom 450 Hz only, guard 300 Hz only, fold 0.125 each.
2. **TypeError, both ears — confirmed.** ErrorEvent, "Uncaught TypeError: Cannot set properties of undefined (setting '0')", silent for the whole render. A rebuilt node plays in the same context. Suggest "until the node is rebuilt" over "until the page builds a new node", since the context survives.
3. **A dense cloud doesn't mask it — confirmed in direction, disputed in numbers and wording.** The numbers are 37.1 / 37.6 / 37.2 dB, not 26.6 / 30.2 / 29.1. They are flat because of how the cloud is levelled: n grains at level 0.5/√n make constant signal power, and n/T jumps a second at a step² of order 0.25/n make constant click power, so the ratio can't depend on n. That much follows from the numbers: **crowding the cloud doesn't dilute the click.** "Mask" does not follow. The meter is a ratio of top-end energy, not a model of hearing. A sine cloud has no top end of its own to cover anything, and the bright table already cuts the margin from 37 dB to 16. What covers the click is the source's spectrum, not the density, and whether it covers it is the listener's call. Suggest: "crowding the cloud doesn't dilute it; only a source with its own top end can cover it, and how much is the ear's call."
4. **Recipe numbers — confirmed.** 0.099 → past 0.9 at 5.7 s, 0.964 at 60 s. At η 0.80, φ averages 0.114 = √(π/240), the mean length of the average of sixty random unit headings. 1/√60 = 0.129 is the root-mean-square, not the mean. Since φ is averaged, 0.114 is the right floor. Both this face and Murmuration's say 0.114.
5. **Mapping out of date — confirmed** as a record check. Order has been the default since a6a23f8a (2026-10-14) at `:463`. `:467` gives η = 0.25·x², so the slider tops out at η 0.25 and 0.80 lies past it. The entropy figures (3.38–3.46 bits; five or six pitch classes) are carried faithfully from Murmuration's offers 3 and 6.
6. **Forward Vector progressed — confirmed.** The density reading is the `cMap` option "density — the flock as a breathing pad". The startle wave is `:156`. The ceiling is the json above. Cross-browser and the RNBO crossover remain.

## The face as a whole

It makes the Shop page's gotchas felt, not just shown. Each one stops being a sentence to trust and becomes something you can break on purpose and watch break. Both made pieces found something the text lacks: the idiom's lost voice, and the fact that density never dilutes a mid-grain click. That is the face earning its place on a specialist page. It is not busy. Two made pieces sit on the one section that is all claims, and three gathered ones sit beside the Recipe and the footprint they answer. Its one real flaw is a harness bug that understated the strongest finding by 7.4 to 10.5 dB. Fixing that makes the face's claim cleaner, not weaker. Nobody has heard it yet, and where the click becomes audible is still the ear's question.
