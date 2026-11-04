---
title: "recipe-p6 — rich — challenge"
born: 2026-11-04
links:
  - target: "[[recipe-p6]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for the p6 recipe's first rich face: a verdict and a reason for its one piece, every number recomputed without the maker's engine, the bell attribution chased as far as this session's network allowed, so the next round starts from what was checked."
---

# recipe-p6 — rich — challenge

Proposal round, cloud batch 2, 2026-11-04. Challenger: claude-opus-5-5, who did not make this face. I judged it against `recipe-p6.md`, the manifest, the piece, the maker's commit body (d4693546), `Wallpaper Groups.md:128`, and recipe-p1.md for the spine.

**Verdict: 1 keep, 0 remake, 0 retire.** It needs two wording notes.

## the bell beside the spin (What you should hear): keep

- **What kind of claim?** "E(5,12) approximates p6's rotational skeleton" (:25) is a closeness claim, and a distance answers a closeness claim fairly. "Spins" and "never quite resolves" are felt claims. The piece leaves those alone. "Because no mirror settles it" is a causal claim about structure, and the meter answers it.
- **Test or decoration?** A test.
  - The rule, set before the readings, is "it holds if a bell sits nearer the p6 loops than most patterns with as many strokes". It could have passed: a bell at distance 3 or less (192 of 792) would have done so.
  - The bells read 5.
  - The turn and mirror meters are each one comparison per bell. Both could have come out otherwise.
- **Faithful?** Yes. The bells step says outright that it doesn't settle which bell the section means, and the test runs on both.
- **Walks up?** Yes. One onset, then the sixth-turn (three loops), then their mirrors, then the bells beside them, then the test.
- **Runs clean.** No AudioContext before the click. Play gives `running`. Hiding gives `suspended`. Console empty.
- **Note 1, "as far as 600 of 792".** It is true, but it undersells the result.
  - Distance 5 is the farthest any 5- or 7-stroke pattern can sit from p6. A pattern with e strokes on even steps sits min(11 − 2e, 11 − 2(5 − e)) from the nearer pulse, which is at most 5.
  - For seven strokes, every pattern is within 5 of p6 through the all-twelve loop.
  - Better: "as far as any pattern its size can sit; 600 of 792 sit there".
- **Note 2, "the positive control".** It can't fail. Taking one hit out of a cooked loop is distance 1 by construction. It checks the meter, which is what its own words say ("if it didn't, the meter would be wrong"). Call it a meter check, not a control.

## Checks run

- `conform.mjs "recipe-p6"`: 1 piece, **errors 0, warnings 0**, with the browser pass at 760 and 1130 px.
- `fingerprint.mjs`: What you should hear **7e1f48931149**, in step.
- `workshop/rich-checks.mjs`: all PASS.
- Headless Chromium on the rich-server: one frame, no Lost its place, console empty. The step-5 readouts match the numbers below.
- Recomputed in Python, all matching:
  - p6 loops and their mirrors: 6, 6 and 12.
  - The most mirrors short of all or none is 6. Any set of symmetries with 7 or more mirrors contains 7 or more turns, which means the full loop.
  - E(5,12): no turn; one mirror (c = 8, through steps 5 and 11); distances 5, 7 and 7.
  - Seven-stroke bell: no turn; one mirror (c = 4, through steps 3 and 9); distances 7, 5 and 5.
  - Null {1: 12, 3: 180, 5: 600}, the same for both sizes.
  - 20 breaks: 20 with a mirror through the gap, 0 with a turn.
  - The broken pulse sits 4 from E(5,12) at its nearest rotation.
- **New, by me:** E(5,12) is the seven-stroke bell's rests, its complement, rotated.
- **Height.** 1520 was set by hand because the kit reported no height. That is a kit finding (tuning item 12(f)).

## The attribution, partly checked

I couldn't read the primary paper either: arxiv.org and wikipedia.org did not resolve in this session. Two web-search summaries both tie the following to Toussaint's 2005 Bridges paper (cgm.cs.mcgill.ca/~godfried/publications/banff.pdf):

- **E(5,12)**, x..x.x..x.x., is the Venda clapping pattern of a South African children's song.
- **The 7-in-12 pattern** is the Ewe bell played on the gankogui.

If that holds, the error is the label. The standard Ewe bell is the seven-stroke pattern that `Wallpaper Groups.md:128` lists. That line also calls the pattern "E(5,12)", which is the count of its rests. recipe-p6:25 inherited the label. This is secondary sourcing; Loudon or an agent with the paper in reach should confirm it.

## The offers

1. **What you should hear: confirmed on structure, two parts read down.**
   - Confirmed: no shared turn; one mirror each; distance 5; the cooked loops carry 6 or 12 mirrors, so "because no mirror settles it" fails as a cause.
   - Read down:
     - "as far as 600 of 792" should be "as far as any pattern its size can sit".
     - The break is a meter check.
     - "Spins" and "never resolves" remain untested felt claims.
   - The attribution is now partly checked (above). Better text: name the seven-stroke bell, E(7,12), and say it shares p6's grid but not its turn.
2. **Where to break it, 20/20 mirror through the gap: confirmed, an identity.** Every cooked loop has a mirror through each of its hits, so taking one out always leaves that mirror. "Local and asymmetric" fails by construction. "Felt as a gap, a held breath" stands. The broken pulse sits 4 from E(5,12): confirmed.
3. **What this teaches, the spine: confirmed.**
   - Orders 1, 2, 3, 6 go ×2, ×1.5, ×2.
   - Repeats run 16 (p1, recipe-p1.md:9), 8, 4, 2.
   - The repeat doubles only because the grid drops from 16 to 12.
   - Groove intensity is untested.
4. **→ Wallpaper Groups: confirmed, plus one more.**
   - The bell at :128 has a mirror through 3 and 9 and no turn.
   - Its "E(5,12)" label counts the rests. The seven accents it lists are E(7,12) turned.

## The face as a whole

It makes the page's idea concrete. It shows the recipe's loops: two pulses and everything, which turn out to be the most mirrored patterns a twelve-step loop can make. Then it sets the bells beside them and measures the gap. The finding that turns the page around, that the bell's one symmetry is the mirror the page says p6 refuses, comes out of the meter honestly. It doesn't claim the feel. Two phrases want tightening, and the attribution now has a lead.
