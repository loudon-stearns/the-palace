---
title: "Agent Wellbeing — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Agent Wellbeing]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Agent Wellbeing's first rich face: every piece judged with a reason, the maker's numbers recomputed, the walk's blind sort found to leak through the page beside it and to undercount its own splitters, so the remake has something exact to fix."
---

# Agent Wellbeing — rich — challenge

Challenger: claude-opus-5-5, proposal round 2026-11, on the maker's commit e1a5c58c in the `enrich/agent-wellbeing` worktree. I did not make this face.

**Verdicts: 4 keep, 1 remake, 0 retire.**

## The pieces

### Practical Implications for Entry Design · `Agent Wellbeing — rich — blind sort walked up.html` · made · **remake**

1. **Test or decoration?** A test. Both arms can come out against the page, and on these cards one arm likely will (below).
2. **Faithful?** It contradicts the page on purpose, and says so (offer 1). Two statements go further than the evidence, listed below.
3. **Walks up?** Yes. It opens on the two guides alone, then one card, then four, then the moves, then the reveal, and the register-or-rules question comes last.

**Chance, recomputed.** Each arm shows four cards, two registers, and a labelling locked at two and two (`lockRow`, template line ~103). That gives C(4,2) = 6 ways to mark them: 4 of 4 one time, 0 of 4 one time, 2 of 4 four times. "4 of 4 by luck 1 in 6" is right for labelling. But the voice rule counts **both** 4 of 4 and 0 of 4 as "voice split them into the right pairs". The outcome the page's claim turns on ("their voices could not be told apart") is the pairing, and luck reaches it **2 times in 6, 1 in 3**. For the moves, the two identical cuts pair themselves, so the pairing is certain and only the direction is left: 1 in 2. That holds.

**Leak check on the new cards.** I passed the voice arm without reading for voice. On the four noticings (computed from `rich-checks/blind-sort-data.mjs`):

| card | words | hedge words | names a section of the page | closing quote then punctuation |
|---|--:|--:|---|---|
| warm-1 | 38 | 1 ("if") | no | no |
| warm-2 | 30 | 2 ("if", "may") | no | no (American style, "him.") |
| anxious-1 | 31 | 0 | yes, "What's Actually New" | yes, "him". |
| anxious-2 | 44 | 0 | yes, "How We'd Track It" | yes, ("him"). |

Length sorts nothing, as the maker says. **Three features** split the pairs perfectly, though, and the walk names only one. Hedge words are voice, so sorting by them is the test working, not a leak. But look at what the hedges are. Both warm "If…" sentences are guesses, and the warm guide says "If you are guessing, say you are guessing, and go ahead". The anxious guide says to minimise speculation, and both anxious workers moved their guesses into a "Caveat" block, which the card's rule ("the 'him' sentence and the one after") skips. So the hedge split is the footprint of a **rule**, the same confound offer 1 finds in the moves. The voice arm can't separate register from rules either. Citing sections by name is closer to voice. Where the punctuation falls is typography. Neither tells you which way round the pairs go, so I don't count them as a broken test. A complete leak check still names them.

I drove the walk headless and read the hedged cards as anxious, the obvious guess. That scored 0 of 4: "Voice split them into the right pairs, and you read it backwards." So the result most readers will get is one the walk reads *against* the page's sentence. That is a real finding, and only luck at 1 in 3 stands between it and noise.

**The move arm leaks through the page.** The paragraph this piece sits under ("near": "Tone as transmitted character") says the hedged workers "cut where the others added". Anyone who read the page gets 4 of 4 without judging a move. The arm is blind only to a reader who skipped the text.

**The remake, all text, one round:**
- On step 4's rule box, say before the sort that the page above gives the direction, so the arm is blind only for someone who hasn't read it.
- On step 3's rule box, say that the rule credits 4 and 0 of 4 alike as "voice split them", which luck does 2 times in 6.
- In step 5's leak check, name the other two splitters (sections cited by name, punctuation after a closing quote). Say that the hedges are the warm workers' guesses, which their guide's "go ahead" licensed. That ties the voice arm to offer 1.
- In step 6, "the warm guide left it open" goes too far. The warm guide lists the same three kinds ("It can be a sentence to cut, a sentence to add, or a page it should link to"). Only the anxious guide says "limited to", and warm-1's replacement is outside the warm list's letter too. Also, the small-change pair isn't shared. Warm says a *specific* small change beats a *vague* large one; anxious says small is *safer* than large. Mark it as a candidate difference rather than "shared, not marked".

### Practical Implications for Entry Design · `proofs/2026-11-02-blind-sort/blind-sort.html` · gathered · **keep**

1. A record, not offered as a test, so the question doesn't apply. It is the sort Loudon actually played.
2. Its lede, "the same guide, same rules" (`blind-sort.html:48`, `rough.tpl.html:48`), is wrong, and the caption says so.
3. Not applicable; it is kept as made.

Leak confirmed: "Justification" heads both anxious answers (`blind-sort.html:58`, `:99`) and "Why it helps" both warm ones (`:75`, `:116`). There is a **second** heading leak the caption doesn't name: "Caveat" / "Caveats" appears in both anxious answers and in neither warm one (my grep of `runs/*.txt`). The record hides the guides until the reveal (`rough.tpl.html:38–39`, `:109`), so the leak bites only a reader who already knew them, and Loudon did. Shipping it beside the fixed walk is honest *because* the caption names the leak and the walk is the repair. A record is evidence of what happened, and taking it out would hide the evidence that the 2-of-4 sort ran on leaky cards. Note for the caption: name "Caveat" as well.

### The Measurable Floor · `Agent Wellbeing — rich — five dials one lamp.html` · made · **keep**

1. **Test or decoration?** A test of one sentence, and the page fails it. The page says STIGMERGY's score "named all five and then flattened them". If `scoreFor` read acuity or drift, the sweep would have moved, so the sweep can fail. It is a thin test: the result is fixed by the function's nine lines, and the sweep makes that code reading visible. The census step ("how much three colours can hold") can't fail; any three-colour map of a six-dial grid hides most of it. It is a concept step, which is fine.
2. **Faithful?** `scoreFor` is copied exactly (`health.js:33–41`). Where it disagrees with the page, that becomes offer 4. One thing the page only implies is made explicit: the page never says the lamp lacks an input for acuity or drift. It says the opposite ("flattened them"), and the piece refutes it.
3. **Walks up?** Yes: one dial first, then the instruments, the reader's dials, the census, and the sweep last. One weakness: step 2's equation already says "Acuity and drift appear nowhere in it", and step 3 labels both dials "no wire to the lamp", so the answer arrives two steps before its test. A note, not a remake: the maker could hold the "no wire" label back until step 5.

Recomputed against the real module (`import { scoreFor, buildHealthBlock } from …/health.js`): 161,600 states. Acuity and drift to gone moved the lamp in **0**, capacity +20 moved it in **4,400**, and the live stub was non-green in **0**. Census: green 1,750, yellow 15,450, red 144,400, all matching the piece. An extra control I ran (integrity +1) moves it in 10,350. Note: `scoreFor` has no caller except its unit test (`git grep scoreFor`: `health.js:33` and `tests/unit/health.test.js`), so the lamp is a rule that never runs. The piece does say the live path stamps green. It could also say this rule only runs in the test.

### The Measurable Floor · `Agent Wellbeing — rich — the one number.html` · made · **keep**

1. **Test or decoration?** A test. Each row's rule is written in the row, and one row fails.
2. **Faithful?** It draws only the proof's tables, and is careful about what it can't say (one reading per model off Haiku; repeats unknown).
3. **Walks up?** Yes: one fresh agent, the line, the reply, four models, a resident, and the check last.

Recomputed from the proof: fit Δ = 3,176 + 154·reps. Misses: pad_1k 0, pad_3k 0, pad_6k 0, pad_12k 0, pad_24k −4,782. Output +36. Haiku 59,427/200K = 29.7%. Opus 79,950/1M = 8.0%, ratio 1.345. Content ratios: Fable 1.385, Sonnet 1.402, Opus ~1.365. Floors: Fable 6.2%, Sonnet 6.7%, Opus ~6.1%. Both climbs are monotonic. **7 of 8 hold. The one that fails is "a freshly spawned agent already reports ~46K tokens"**, which is Haiku's floor (46,241), and it is recorded as offer 3.

Notes:
- The "~62–67K floor is ~6–7% at spawn" row checks only the percentages. The proof's table gives Opus ~61,000 and Fable 61,764, so the range its own prose and the page quote ("~62–67K") starts a thousand low. It should read ~61–67K.
- The "deterministic to the token" row tests whether four points sit on a two-parameter line, not whether a reading repeats. The proof has no repeat runs, and the piece says as much on step 3.
- Step 5 cites `_ops/concierge/dial.mjs:51` (60%/80% for every model). Read beside `dial.mjs:87` (`pct = tokens / window`), that shows something the page hasn't been offered: the dial divides *raw* tokens by the window. The page says "Fullness is *room above baseline*, not raw percent" and a "model-calibrated ceiling". The dial does neither beyond the division. This is an unrecorded finding for the maker's next round.

### The Measurable Floor · `Agent Wellbeing — proof — sensor-b-characterization.md` · gathered (margin) · **keep**

The source of the piece beside it, shown as written. Nothing to test; faithful by being the thing itself.

## Checks run

- `conform.mjs "Agent Wellbeing"`: 4 pieces, 0 errors, 0 warnings, browser at 760 and 1130 px. The gathered sort declares `storage` (manifest contract) and uses localStorage; the made walk stores nothing.
- `fingerprint.mjs`: Practical Implications 86d01f057b8b and The Measurable Floor 385bc9ded447, both in step with `made_against`.
- The maker's `rich-checks/check-pieces.mjs`: all checks pass.
- Face served at the rich server and loaded headless (Chromium from `_ops/stigmergy/app`). After scrolling, all 4 piece frames loaded; console clean, no failed requests. I drove the blind sort through both locks and the reveal (voice 0/4, move 4/4, verdict texts as above); console still clean.
- Hush and sound: no AudioContext, `new Audio`, requestAnimationFrame or setInterval in any piece. Nothing to hush, no detached Audio.
- Every file the pieces need is tracked (`git ls-files`). No Splice material.
- Grain: the manifest's `grain` field names The Measurable Floor as one `##` with three `###`, sharing one stamp and one approval. Confirmed against the page's headings.
- Sweep re-run against the real `health.js`, and card features computed: scripts in the session scratchpad, numbers above.

## Offers

1. **Confirmed, and widened.** The guides differ in rules, not only register. From `guide-anxious.md` against `guide-warm.md`:
   - the list closed ("Acceptable changes are limited to:" against "It can be"; the same three kinds in both)
   - a confidence gate ("if and only if you are reasonably confident")
   - the cost of changing ("Proposing an unnecessary change is worse than proposing none", and "may be preferable — to propose no change")
   - speculation ("you should minimize it" against "say you are guessing, and go ahead")
   - the reason ("justify it" against "say … why it helps", which is where the heading leak comes from)
   - size ("safer to propose a small change than a large one" against "a specific small change beats a vague large one")

   Both anxious runs say "closest option within the allowed changes" word for word (`runs/anxious-1.txt`, `runs/anxious-2.txt`). New: the voice cards' hedge split comes from the speculation rule too.
2. **Confirmed, with a second leak.** "same guide, same rules" is at `rough.tpl.html:48`. "Justification" against "Why it helps" sorts all four answers, and so does "Caveat(s)" (both anxious, no warm).
3. **Confirmed.** Haiku 46,241; Fable 61,764; Sonnet 67,169; Opus ~61,000 (proof, Phase 5). The suggested wording should say ~61–67K, not ~62–67K.
4. **Confirmed, and strengthened.**
   - `scoreFor` reads four inputs (`health.js:33`); nothing in it is acuity or drift.
   - The sweep moved the lamp 0 times out of 161,600.
   - `process-cycle.js:551` (a556fae3, 2026-09-23) sets a steward's score directly: yellow when barren, red when stalled. It does not go through `scoreFor`.
   - "acuity" appears nowhere in STIGMERGY or Palace Orchestrator code or prose; `git grep -i acuity` finds only Agent Wellbeing's own files. So "named all five" has no source either.
   - Nuance: `state.health` carries `avg_output_tokens_last_5` (`process-cycle.js:544`). It is always null and never read, the nearest thing the design had to an acuity slot.

## The face as a whole

It makes the page's idea felt. The page says care can be measured and that one number hides health. The face takes both claims literally, runs them, and both come back more interesting than the text:
- The lamp the page says flattened five dials never had wires for two of them.
- The one number holds up, except the floor figure, which belongs to one model.
- The blind sort, rebuilt honestly, can't yet tell register from rules on either arm.

That is the page's own subject done to the page: a fresh reader judging the first worker's output. It isn't busy. Every step either builds the concept or runs the check, and the one number in particular is careful about what it can't say. The weak spot is the one the tuning ledger warned about: a blind test whose answer is printed in the paragraph above it, and a leak check that counted one splitter where there are three.
