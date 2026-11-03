---
title: "FM Synthesis — rich — challenge"
born: 2026-11-03
links:
  - target: "[[FM Synthesis]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of FM Synthesis's first rich face, the proposal round of 2026-11-03: each piece judged against the page's words with a reason, and each of the maker's eight offers recomputed from Bessel sidebands and from the pieces' own engines, so Loudon can answer the offers knowing which numbers hold."
---

# FM Synthesis — rich — challenge

Read against the page as it stands in the worktree (`FM Synthesis.md`, unchanged by the maker) and the maker's commit 1607c7f9, which is the only account taken of how it was made. Nothing in a piece or the page was changed.

## Pieces

### FM Synthesis — rich — staged patch.html (gathered, under the opening section) — keep

1. **Test or decoration:** a test. It is the page's own instrument, seven steps, and its checks re-run every step's claim (32/32 here).
2. **Faithful:** yes, with one tension the page holds itself. The page's Forward Vector says the patch "wants Loudon's ears before it becomes part of the rich face". It stands in the face only because the whole round is a proposal, and the caption says so. If the round lands before Loudon has played it, this piece should come out of the manifest, not stay in by default.
3. **Walks up:** yes, one operator to the full DX7.

Its two declared files (the design-system CSS and Bessel's correlation proof) are tracked. It covers ground the four made walks also cover; see the last section.

### FM Synthesis — rich — index.html (What the ear hears as the index rises) — keep

1. **Test:** yes. The last step's verdict reads "shimmer" or "opening" from the engine, so it would have said "opening" if the text were wrong.
2. **Faithful:** it disagrees with the text in one place and says so in its caption (the 1:1 lower sideband at 0 Hz). That is an offer, not a fault, and it is correct (offer 1 below). Its added line, that at 1:1 the loud partials reach about harmonic index + 2, follows from the fold-back and is true.
3. **Walks up:** sine, first pair, index-plus-one, sweep. One idea a step, the test last.

### FM Synthesis — rich — ratios.html (Ratios) — keep, with a note

1. **Test:** yes. The last step lets you set any ratio and reads it as two whole numbers, a shared fundamental and a repeat time, so the scope line can fail in front of you.
2. **Faithful:** the caption's "the line the ear draws is a threshold, not whole numbers against the rest" is a claim the page doesn't make. The caption flags it, and says the family edges (a bottom number of 4, 20 Hz, 50 Hz) are the piece's own rule, not yet checked by ear. That is honest. The piece itself reads 1:1.1 correctly (its readout lists harmonics 1, 10, 12, 21, 23, 32). The offer drawn from it does not; see offer 4.
3. **Walks up:** 1:1, 1:2, 1:3.5, 1:1.414, 1:1.003, then any ratio.

### FM Synthesis — rich — feedback.html (Feedback) — keep

1. **Test:** yes. Two meters run on the engine, and the last step sweeps 0 to 10. The order sine, lean, saw, fray, noise could have come out otherwise.
2. **Faithful:** yes. The two-sample average is something the section takes for granted, shown as such ([[Latent Error]]), not a contradiction. The scaling β = π·2^(fb−7) is Dexed's, as the header cites.
3. **Walks up:** sine, lean, 7 against a true sawtooth, past the edge, the average, the test.

The maker left one thing unverified: the meters run at 48 kHz while playback runs at the device's rate. I checked that, and the behaviour the piece teaches holds at 44.1 and 49.096 kHz (numbers below).

### FM Synthesis — rich — algorithms 1, 5 and 32.svg (Six operators, 32 algorithms) — keep

1. **Test or decoration:** this one illustrates. It is the drawing the page's Forward Vector asks for, and a signal-flow diagram the text describes in words. That is reason enough.
2. **Faithful:** yes. Rendered and read: algorithm 1 is 2→1 beside 6→5→4→3, algorithm 5 is three pairs, algorithm 32 is six carriers, and the loop is on 6 in all three. This matches the routing rows and the DX7's panel.
3. **Walks up:** not applicable.

A note on taste: in the key, the loop's glyph is a plain arrow, the same as a modulation wire. The drawing itself shows the loop clearly as a bent return.

### FM Synthesis — rich — algorithms.html (Six operators, 32 algorithms) — keep, with a caption note

1. **Test:** yes, and it caught the text overreaching. The last step lets the pair's index run to 20, with whole-number ratios and without.
2. **Faithful:** it shows honestly where the text's "than a pair can" fails. One caption sentence blurs a number: "a pair pushed to index 14 fills the same grid the stack fills at index 2". The stack at index 2 has 17 of the 22 harmonics under 5 kHz, not 22. Better: "a pair catches the stack's 17 at about index 9, and by 14 fills all 22 harmonics under 5 kHz, which the stack fills by about index 2.4."
3. **Walks up:** pair, stack, algorithm 1, algorithm 5 (layering adds partials and doesn't multiply them), algorithm 32, then stack against pair. The middle steps set up the contrast the test turns on.

## Checks run, and what they returned

- `node _ops/rich-face/conform.mjs "FM Synthesis"`: 5 pages, introduced 5, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "FM Synthesis"`: all five made sections in step (912ba057ff96, 9e443676dfc6, 8dff192fb05b, a0b2d9a4d603, 681131dac5af).
- The maker's `FM Synthesis — proof — rich face checks.mjs`: 65 passed, 0 failed. `FM Synthesis — proof — staged patch checks.mjs`: 32 passed, 0 failed.
- Rich server on the worktree, `?entry=FM Synthesis`, headless Chromium: six figures, five iframes at their reported heights, the SVG loaded (543 px natural width), console empty, no "Lost its place", no drift flags.
- Hush, done by hand in the face: no audio context running before any click. Each made piece started on a click to play. When the page was hidden every context suspended and the button went back to "play", and nothing restarted when the page came back. No errors or warnings.
- Recomputed independently in Python (scipy Bessel functions, numpy FFT, my own loop implementation). The scripts are in the session scratchpad, not the palace.

## The offers, recomputed

1. **Index, 0 Hz lower partner (claim-change): confirmed, and the text is wrong for the case it names.** At 1:1, k = −1 lands at 0 Hz with amplitude −J₁(I), and sin(0) is nothing. In cosine phase it would be a DC offset, which the ear can't hear either. At index 0.3 the heard spectrum is 220 Hz at 0.966 (J₀ − J₂, after the fold) and 440 Hz at 0.149, a gap of −16.25 dB by Bessel and by FFT of the signal alike. The paragraph opens "Hold the ratio at 1:1", so "one either side of the carrier" describes something the ear doesn't get. The index-plus-one rule holds: at a 0.01 step from 0.25 to 8 the worst gap was 0.92 pairs (the maker's 0.25 step found 0.75), always under one pair. Index 4 gives 5 pairs.
2. **Index, brightness centre falls (claim-change): numbers confirmed exactly, but the label is too strong.** Power-weighted centroid of the heard spectrum: 483.4 → 416.8 Hz from index 2 to 3, and 924.7 → 807.5 Hz from 5.5 to 6.5 (Bessel and FFT agree). The falling runs are index 1.93–3.14 and 5.31–6.49. The text isn't wrong: "it doesn't simply get brighter" already holds. This adds weight to it. It is an addition, not a correction.
3. **Ratios, 1.414 = 707:500 (no-claim-edit): confirmed.** It repeats every 500 carrier cycles, 500/220 = 2.27 s. Read literally the text is wrong ("not a ratio of whole numbers, 1:1.414"), but it plainly means √2, and writing 1:√2 fixes it. Not checked here, from DX7 documentation: the DX7's fixed ratios are coarse × (1 + fine/100), so every ratio on the instrument is a ratio of whole numbers. That supports offer 4 more than the maker says.
4. **Ratios, the scope line is a threshold (claim-change): disputed in its example, sound in its point.** 1:1.1 is 10:11 with a 22 Hz fundamental, as offered. But at index 2 that fundamental is not "far down its own series". The 22 Hz partial itself is one of the two loudest (J₁(2) = 0.577, equal to the 462 Hz partial at harmonic 21). The loud set is harmonics 1, 10, 12, 21, 23 and 32, and the piece's own readout says exactly that. The point survives in a different form: the fundamental is present and loud, but at 22 Hz it is barely heard as a pitch. The text's "whole numbers keep the series" is mathematically true (10:11 repeats and has only harmonics of 22 Hz), so the text is less precise about the ear, not wrong. Fix the example before this goes home. 1:3.5 (110 Hz), 1:1.25 (55 Hz) and 1:1.01 (beating at 4.4 Hz) all check.
5. **Feedback, the two-sample average holds 7 clean (claim-change): confirmed in substance. The digits are soft past the edge.** My own implementation of the same equation, at 48 kHz on 200 Hz, gave:
   - with the average, at 7: 1.02 dB from a sawtooth over harmonics 2–10 and 100.0 % periodic, an exact match;
   - one-sample loop at 7: 78.5 % periodic (match) and 9.2 dB from a sawtooth (the maker reports 8.3);
   - 7.3: 100 %; 7.35: 96.7 % (the maker reports 97 %); 7.4: 17.6 % (the maker reports 25 %).

   Past the edge the loop is chaotic, so these digits move between implementations. Write "about 8–9 dB" and "a fifth to a quarter". The finding is robust where it matters. With the average, 7 is periodic at 44.1 kHz and 49.096 kHz (the DX7's own rate) and from 100 to 1600 Hz. The one-sample loop at 7 frays at every rate and pitch tried (56–86 % periodic, 6.8–9.5 dB). The edge sits at 7.30–7.40 from 100 to 1600 Hz, and between 7.3 and 7.35 at 44.1 kHz. The text holds as written. This adds a reason; it changes no claim.
6. **Feedback, algorithms 4 and 6 (no-claim-edit): confirmed.** In the staged patch's table (Dexed's rows), algorithm 4's operator 4 and algorithm 6's operator 5 carry the feedback-out bit (0x94). Operators are computed 6 first, so that later write is what feeds back into operator 6. This matches the DX7 panel diagrams. "Back into its own input" is wrong for 2 of the 32, a small fix.
7. **Six operators, stack against pair (claim-change): confirmed exactly.** Counting harmonics over one exact period within 60 dB below 5 kHz: the pair at index 2 has 7 and the stack at 2, 2 has 17, the same as the piece's peak-count method. The gap holds at other floors: 6 against 13 at 40 dB, 6 against 15 at 50 dB, 8 against 21 at 80 dB. Off whole numbers (1.414, 1.732) the stack has 154, and the pair tops out at 32, which is every line one comb can place under 5 kHz. With whole numbers the pair reaches 17 at index 9.3 and 22 at 13.3. The text's "than a pair can" overreaches at whole-number ratios: less precise, not wrong in spirit. The offered rewording is fair.
8. **Six operators, embed the SVG (no-claim-edit): confirmed as to fact.** Algorithm 32's row (0xc4) carries both feedback bits on operator 6, so it is six sines only at feedback 0. Whether the drawing goes into the text is Loudon's call under his placement rule.

## The face as a whole

The face makes the page's idea felt. Each made walk ends on a claim that could fail. Three of the four found something: the 0 Hz partner, the stack's "can", the 1.414 repeat. The feedback walk turned up a mechanism the text never names, and it holds across the rates I tried. That is the ceremony working as meant.

The risk is weight, not busyness. Five interactives, roughly 4,900 px of walks, and the gathered staged patch at the top already covers ratio, index, feedback and algorithms in its own seven steps. A reader meets the same instrument twice. Once Loudon has played the staged patch, the question to put to him is whether it opens the face as the overview, or moves to the scroll as the record and lets the four walks carry the sections.

Nobody has listened to any of it. An agent can't hear the mix, and the ratio piece's family edges are still a rule, not an ear.
