---
title: "Progressive Staging — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Progressive Staging]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenge of Progressive Staging's first rich face: each piece judged by the rule the page itself sets, the leak finding recomputed from scratch, so Loudon reads verdicts he can check rather than a stamp."
---

# Progressive Staging — rich — challenge

Challenger for the proposal round, 2026-11-03, on the maker's commit `927e6c65`. I did not make this face. I judged it from the page, the dev plan it leans on, the two pieces, the maker's check file and commit body, and my own recomputation in Python, written separately from the maker's JS. Two pieces: **2 keep, 0 remake, 0 retire.** The one offer is real. It wants two small corrections before it goes home, and it can be made stronger.

This page sets the rule every face this round was built by, so I judged by that rule first.

## The pieces

### the leak at its stop (made · The Method) — **keep**

**Does it walk up?** Yes, and cleanly. Step 1 is Stage 1 alone, one thing: threshold and reset. Step 2 is Stage 2 alone, one thing: the time constant, on a slider that stops short of infinity. Step 3 sets the two against each other with the leak at its stop. Step 4 is the test, last. Each step names its one thing on the page (`data-one`), and the rail stays open. It is the page's own rule from Inside One Piece (`Progressive Staging.md:63`, `:69`) applied to the page's own claim in The Method.

**Test or decoration?** A test, and it does what a test is for: it comes out against the text. The page says to set `leak_tau` to infinity and "recover Stage 1 exactly" (`Progressive Staging.md:47`). Then it says Stage 2 inherits Stage 1's frequency test (`:53`). The piece runs the second rule on the first, and the inherited test fails. If the text were right, step 4 would read "pass" with the plan's own reset.

**Faithful?** Yes. I checked the port line by line against `Projects/Action Potential Oscillator/neural_oscillator_dev_plan.md`:
- Stage 1: `v + f/fs`, then wrap by subtracting the threshold (plan `:79`).
- Stage 2: the guard `max(tau_ms, 0.1)` (`:171`), the coefficient `1 − 1/τ`, the drive line (`:180`), the accumulator, and the hard reset to 0 (`:194`), which the plan makes on purpose (`:197`).
- Output: unipolar state, so the `*2 − 1` comes at render, as in the plan.

The one departure is the one the piece states. At τ = ∞ it uses the limit (coefficient 1, drive 1/P), because the plan's drive line gives `1 / (∞ · (1 − e⁰)) = 1/(∞·0) = NaN`. I confirmed the NaN. The piece also applies Stage 1's ±0.1 Hz tolerance (`:108`) to Stage 2, whose own frequency test gives no tolerance (`:217`). That is the honest reading of "inherits Stage 1's test" (`Progressive Staging.md:53`), and the piece says it is doing it. Where the piece disagrees with the text, the disagreement went to the manifest as an offer, which is the right place.

**Runs clean?** Conform: 0 errors, 0 warnings. Console clean in the face and alone. No AudioContext before a click. Changing step stops the sound. In the served face I hid the page while the piece was playing: its context went from running to suspended, so the kit's hush holds. Every file it needs is inline. It copies nothing licensed.

**Caption honest?** Yes, except one word. It says "the two give the same samples at every note, exactly". That holds bitwise at the five notes the piece plays, not at every note (see below). The step 4 verdict on the page itself says "at all five notes", which is right. Changing the caption's "every note" to "all five notes" would make the two match. That is a precision note, not a remake.

### the table and the loop (gathered · Inside One Piece) — **keep**

**Walks up and honours the section's rules?** Yes, with the one exception the maker named. The steps go: the table alone, the loop alone, their difference, then the test at half a sample. That is Loudon's outline (`Progressive Staging.md:63`) walked step for step. My headless run and its own check (`Dispersion Table — rich — check.mjs`, ALL PASS, 177 lines) both show:
- silent until a click, and no audio context before one;
- one step shown at a time, and changing step stops the sound;
- Next and Back walk the steps, and the rail jumps straight to the test;
- step 3 lets you hear the table alone and the loop alone again;
- the checks pile up, including a sound check on step 1;
- quiet when hidden, which is the kit's job (`_ops/rich-face/README.md` § A hidden page says nothing).

The exception: its last step says "The proof below, from Dissolutions" but has no link. In Dispersion Table's own face the proof does sit right after the walk, so the rule is met there. In this face nothing sits below it, and the caption says so plainly. Gathered pieces are not edited, so the fix belongs to Dispersion Table's piece: one link in step 4.

**Test or decoration?** On its own, a witness more than a test. The section calls this outline "the model", and here is the model built. It earns its place because the maker held it to the section's rules in `Progressive Staging — rich — checks.mjs`, and that check could fail: it caught the missing link. Dispersion Table's challenger already vetted its numbers. I ran the check again and it still passes.

**Faithful?** The caption's per-step summary matches the piece's own step text, and step 3 does let you make the loop one sample longer to watch the test fail.

## Checks run

- `node _ops/rich-face/conform.mjs "Progressive Staging"`: 2 pieces introduced, errors 0, warnings 0. The browser pass ran at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Progressive Staging"`: The Method `4ece20e8ee64` and Inside One Piece `9405608f6612`, both in step.
- `node "Progressive Staging/Progressive Staging — rich — checks.mjs"`: ALL PASS.
- `node "Dispersion Table/Dispersion Table — rich — check.mjs"`: ALL PASS.
- The face served from the worktree at `?entry=Progressive Staging` in headless Chromium:
  - no console errors or warnings;
  - two frames, two `proposal · 2026-11-03` chips;
  - the made piece, started in the face and then the page hidden: running → suspended.
- Independent Python recomputation (scratchpad `ps-challenge/recompute.py`, `ulp.py`, `tausweep.py`), described below.

## The finding, recomputed

**Why it goes flat.** P = fs/f is the period in samples, and it is rarely a whole number. With the leak at its stop, Stage 2 adds 1/P per sample, the same step as Stage 1's f/fs. The first sample at or above the threshold is sample ⌈P⌉.

Stage 1 wraps: it keeps the spill, (⌈P⌉ − P)/P, so the next cycle starts that far up. The spills carry the fractional part forward, and the cycles average to P exactly.

Stage 2 resets to 0 and throws the spill away, so every cycle is exactly ⌈P⌉ samples. That gives f₂ = fs/⌈P⌉, and the error is −1200·log₂(⌈P⌉/P) cents. Measured, every cycle in two seconds was ⌈P⌉ long, and the measured pitch matched fs/⌈P⌉ to four decimals at all ten note-and-rate pairs:

| | 110 | 220 | 440 | 880 | 1760 |
|---|---|---|---|---|---|
| 44.1 kHz, ⌈P⌉ | 401 | 201 | 101 | 51 | 26 |
| 44.1 kHz, cents | −0.39 (passes ±0.1 Hz: 109.975) | −4.70 | −13.30 | −30.35 | **−63.97** |
| 48 kHz, ⌈P⌉ | 437 | 219 | 110 | 55 | 28 |
| 48 kHz, cents | −2.52 | −6.48 | **−14.37** | −14.37 | −45.56 |

The inherited test fails at 5 of 5 notes at 48 kHz and 4 of 5 at 44.1 kHz. Stage 1 passes at all ten. The first sample where the two differ is the first reset, sample ⌈P⌉ − 1 counting from 0; before it they are identical. Give Stage 2 Stage 1's wrap and the largest sample difference is 0 at all ten pairs. **Confirmed.**

**Is "recover Stage 1 exactly" wrong?** It is true of the equation and false of the plan's Stage 2 as written.

The leak line `v·(1 − 1/τ) + d` does become Stage 1's accumulator as τ grows without end. The plan's Stage 2, though, changes two things at once: it adds the leak, and it swaps the wrap for a hard reset. The page names only the first. The second is a retroactive change by the page's own first rule (`Progressive Staging.md:47`): the plan's Stage 1 calls the wrap "critical for tuning stability" (plan `:81`), and Stage 2 throws it out.

One more fact sits behind the word "exactly": infinity is not a setting. The plan's line gives NaN there, so the honest move is the limit, which is what the maker's wording proposes.

## The offer

**The Method, claim-change. Confirmed, with two corrections and one way to make it stronger.**

1. "14 cents at 440 Hz" is the 48 kHz figure. At 44.1 kHz it is 13.30 cents. Say "13 to 14 cents at 440 Hz", or name the rate.
2. "Stage 1 back exactly", and "sample for sample" for the climb, holds bitwise only where the float 1/(fs/f) equals f/fs. I tried every MIDI note from 21 to 108 at both rates, 176 pairs. In 47 of them the two drives differ by one unit in the last place. The samples then differ by up to 5.3 × 10⁻¹² (worst: MIDI 50 at 48 kHz), and no reset moves in two seconds. The wording is exact in the algebra and exact to rounding in floating point. It is fine to keep the claim as it stands, but the five-note table is not proof that it holds at every note.
3. Stronger: the flatness is not only at the stop. The hard reset makes every period a whole number of samples at every τ. At 440 Hz the plan's Stage 2 measures:
   - 44.1 kHz: 441.000 at τ = 1, 2 and 5 ms; 436.634 from 10 ms to 10⁶ ms.
   - 48 kHz: 444.444 at 1 ms; 440.367 at 2 to 10 ms; 436.364 from 25 ms on.

   It never lands within 0.1 Hz at any τ tried. The stop is just the end where the error is largest and easiest to see.

## For Action Potential Oscillator (→ [[Action Potential Oscillator]])

Neither note is for this face. Both are real.

- **The four-stages walk's "sample for sample" (`Action Potential Oscillator — rich — four stages.html:352`). True of its own engine, not evidence for the plan.** Its engine is neuropulse.dsp v0.4's neuron (`:110`). With τ = ∞, Stage 2 takes the very same non-leaky branch as Stage 1 (`leaky = stage >= 2 && isFinite(P.tau_ms)`, `:123`). Both stages reset to 0 (`:142`), and the drive is `(thr − v0)/m` with m = period − 0.5. So its Stage 1 is not the plan's wrapping Stage 1. The claim is not wrong where it stands. At most it wants half a line saying its Stage 1 resets to zero, as neuropulse's does. That is an offer to that face, low priority.
- **The plan's Stage 2 misses 440 Hz at its own default, 5 ms: 441.000 Hz at 44.1 kHz (100 samples a period, +3.93 cents) and 440.367 at 48 kHz (109 samples, +1.44 cents). Confirmed.** It is sharp here because the discrete leak, (1 − 1/τ)ⁿ, decays slower than e^(−n/τ), the curve the drive line was computed from. So the voltage runs ahead of the continuous curve and crosses the threshold before sample P. Then the hard reset rounds the period to a whole sample. The plan's own test (plan `:217`, "the drive calculation should compensate exactly") fails against Stage 1's ±0.1 Hz, and the τ sweep above shows it failing at every τ. This is a real offer for the dev plan: either Stage 2 keeps the spill, or its test states the tolerance it can actually meet.

## The face as a whole

It makes the page's idea felt, not busy. The made piece does what this page asks of every piece in the round: it opens on a sawtooth and one sentence about a threshold, and four steps later the page's own fourth rule catches its own first rule. That is the method demonstrating itself, regression test and all, and it is the strongest case this page could have for why tests should pile up. The gathered walk is the quieter half: the model the section quotes, shown working, with the one rule it bends named rather than hidden. Two pieces is lean for a hub, but each one earns its place, and the leak piece found something true about a plan four stages deep. What is missing is a piece for "The implementation paradigm can shift at a stage boundary" or "Why It Works". That is for a later round, not a fault in this one.
