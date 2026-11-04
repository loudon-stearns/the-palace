---
title: "Agnes Martin — rich — challenge"
born: 2026-11-04
links:
  - target: "[[Agnes Martin]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenge of Agnes Martin's first rich face: one piece, one remake, and the reason the open half has to lose its references before it can stand for 'vanishes into noise'."
---

# Agnes Martin — rich — challenge

Challenger · opus · cloud batch 4, 2026-11-04, against maker commit `2c3aa001`, Enrichment v2.8, proposal round.

## The piece: the grid holds still — **remake**

**Does it test the claim, or decorate it?** It tests it. The walk ends on a blind test that could come out against the page, and against a guesser it gives the page a verdict 2.90% of the time. But the open half is not the page's situation. The page says that with the grid taken away, "the difference vanishes into noise". The piece takes away the even spacing, the shared left edge and the vertical rules, then keeps three references and adds no noise:

- **The frame.** In 87.3% of scatter fields (2,000 layouts) a line sits within 30 px of the canvas's ruled top or bottom border. In the grid half the nearest line is 46 px from it. The open half often holds a true straight edge closer to a line than anything in the grid half does.
- **The neighbours.** Scatter gaps go down to 22 px (mean 35.8 px); grid gaps are 32 px. Step 3 tells the reader to look in the gaps between neighbours, and the open half sometimes gives a closer neighbour than the grid does.
- **The raster and the chord.** Every line stays horizontal on the pixel rows, and its drift is pinned at both ends, so each line carries its own straight chord. An ideal observer that reads each line's 8-bit pixels against its own fitted straight line, with no knowledge of the grid, calls 60 of 60 fields drifting at 0.25 px in both halves, at dpr 1 and dpr 2 (straight lines read 0.0000 px). The information needs no grid. Whether a human eye uses it is the reader's question, but nothing in the open half is noise: scattering positions does not mask a deviation in shape.

So a "no clear difference" here does not answer "vanishes into noise". It answers a narrower question: do even spacing, a shared edge and cross-rules help, when the frame, the horizontal and the raster stay? The result text tilts against the page anyway ("The page claims more than that").

**Is it faithful?** Mostly. Nothing of hers is reproduced: ten generic horizontal lines with vertical rules on a pale ground is no particular work, and nothing is quoted beyond the page. The drift model (a smoothed random walk, σ 24 px, pinned, a slow bow rather than a tremor) is a disclosed model, not her hand. But a pinned bow is the kind of deviation a line's own chord shows best, and that makes the open half easier than the page's "noise". This is part of the confound above, not a separate fault.

**Does it walk up?** Yes. One line beside a true one, then the rule in symbols and words, then ten in the grid, then the grid taken away by a slider, then the test, last. The rail stays open. No sound.

**Leaks: none found.** Straight and drifting lines carry equal ink per column (1.2400 vs 1.2400 at dpr 1) and an equal darkest pixel (0.62). The 8-bit total-ink gap is 0.285% per field and 0.290% per line, recomputed through the maker's check; it is not a usable cue. Line ends are pinned, so nothing gives the answer away at the ends. During the test the meter is hidden and nothing is marked until the end. Zoom magnifies both halves equally and is recorded. The page's paragraph primes the grid half, but scoring counts right answers against a fair coin, so a reader who leans "drifting" in the grid half still scores Binomial(32, ½) there. The column-to-column variation in a drifting line's pixels is the drift itself as a screen can show it, not a separate cue.

**Remake, exactly:**
1. Lay out the scatter so no line comes nearer the canvas border than 46 px and no two neighbours are nearer than 32 px. The alternative is to match the gap distribution in both halves and say how.
2. In step 4 and in the result, say plainly that the open half keeps the frame, the horizontal and the pixel rows and adds no noise. That way it tests the grid's spacing, edge and rules, not "vanishes into noise". If the maker wants the noise reading tested, one option is a small random tilt or bow per line applied identically in both halves, so the halves stay matched. That is optional.
3. Under "no clear difference", drop "The page claims more than that". Say instead what the rule cannot see: a reader the grid helps by one doubling gets "holds" only 22–31% of the time.
4. Notes, not grounds for the remake. "About three times in four" for a two-doubling reader depends on the model: my cumulative-normal reader gets 63–69% (holds plus holds-strong), against the maker's 75% Weibull reader, so "roughly two in three to three in four" is the honest wording. In `verdict()` the internal names `floor` and `ceiling` are swapped relative to what they mean (floor = both at 30 or more, "too easy"); the shown text is right.

## Checks run

- `check.mjs` (the maker's): all pass, and its numbers reproduce. Drift is identical across halves; readback is within 0.52% / 0.44% / 0.31% at dpr 1 / 1.25 / 2; straight lines read 0.00000 px; the halves differ by at most 0.014 px; 8-bit ink differs by 0.285% / 0.290%; guessers through score() get 2.98% against 2.90% exact. A no-help reader gets holds at most 5.9%, a one-doubling reader 24.1%, a two-doubling reader 75.3% / 75.4%.
- `challenge-check.mjs` (mine, kept as workshop): the exact binomial by my own Pascal sums gives P(a half reaches 21/32) = 5.509%, P(holds) = 2.900%, P(reversed) = 2.900%, either 5.801%, and one amplitude seen by a guesser 9/256 = 3.516%. So the rule is two-sided by design, and the page's arm alone is 2.90% as claimed. A second reader model (cumulative normal) gives: no help, holds 3.6–6.5%; one doubling, holds 22–31%; two doublings, holds 63–69%. The ideal observer and the layout counts are above.
- `conform.mjs "Agnes Martin"`: errors 0, warnings 0, browser at 760 and 1130 px, introduced.
- `fingerprint.mjs`: How her mind moves `3d7273fb2bcc`, in step.
- Face served on the standalone server and loaded headless, scrolled until the piece's frame loaded. Console: only the server's Permissions-Policy 'bluetooth' warning. No sound in the piece, so there is no hush or click-to-start to check.
- Not verified: any human threshold. No agent can see.

## The offer

**How her mind moves · no-claim-edit — confirmed in part; split it.**
- The attribution half is real and correctly labelled. The intro frames the grid idea as "her account of it", while this paragraph states "take it away and the difference vanishes into noise" in the palace's own voice. Keeping it as hers, or naming it a perceptual claim a reader can test, changes no claim. It stays a no-claim-edit in this section.
- The clause defining "take the grid away" (remove the spacing, the shared edge and the cross-rules, with the lines unchanged) is not a no-claim-edit. It gives the page an operational meaning the page does not state. My numbers show that meaning keeps the frame, the raster and each line's own chord, and adds no noise, so it is not plainly what "vanishes into noise" says. Relabel it as a separate **claim-change**, marked disputed, or drop it until the remade piece shows what removal has to remove.

## The face as a whole

It is one careful piece, and it makes the page's idea felt in steps 1 to 4: watching a drift you cannot see in one line show up in the gaps of a held grid is the paragraph in your hand. The test is honest about chance, scores both halves, and has no leak I could find. Its fault is quieter. The half meant to show the drift dissolving keeps a straight frame, horizontal pixel rows and each line's own chord, so it cannot stand for "noise", and its result text leans against the page when the test cannot reach the page's claim. Fix the layout and the wording, and the test asks a clean, narrower question: does the grid's order help? The page can then be checked against that answer.
