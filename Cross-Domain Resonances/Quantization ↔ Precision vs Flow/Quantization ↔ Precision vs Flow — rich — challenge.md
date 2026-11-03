---
title: "Quantization ↔ Precision vs Flow — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Quantization ↔ Precision vs Flow]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of the proposal round's four pieces for Quantization ↔ Precision vs Flow: a verdict and a reason for each, the checks run and what they returned, and every offer recomputed, so the maker's remake and Loudon's approval start from what was verified."
---

# Quantization ↔ Precision vs Flow — challenge

Challenger, 2026-11-03, against the maker's commit `4a8ce55f`. Judged from the page (`Quantization ↔ Precision vs Flow.md`, unchanged from main), the manifest, the four pieces and the maker's commit body. Nothing heard; every claim about sound below is about timing, levels or code, not about how it sounds.

**Verdicts: 0 keep, 4 remake, 0 retire.** All four pieces walk up, and all four put a real question to the page. Each has one defect a reader will hit, and each can be fixed in one round.

## The pieces

### The Technical Side · mistake or feel — remake

- **Test or decoration?** Half and half. The last step, "fix the stumble and keep the lean with the knob alone", is an identity: t′ = g + (1 − s)(t − g) gives every note the same share, so no strength can do both. It can't come out otherwise, which makes it a felt demonstration of "Quantization assumes mistake … can't tell the difference" rather than a test. The part that could fail is step 3: whether the two planted 37 ms deviations read to the ear as a mistake and a choice. That is honest work and the right place for it.
- **Faithful?** Yes. 0.537 → 0.500 at 120 BPM, and 0.5185 at 50 %, recomputed. Two small slips: the inset says "the stumble · bar 1, beat 3" while the readout says beat 3 "and" (the kick is on step 10, the "and"), and the snare-fill readout says "into bar 1", which is true only because the two bars loop.
- **Walks up?** Yes: one note, then strength on it, then a groove, then the test.
- **Runs?** Console clean, no context before a click, the step change stops sound, hushes when hidden (driven headless: `suspended/false` after a hidden event). **One bug, reproduced:** `stopSound()` schedules `ctx.suspend()` 250 ms later without checking whether play has been pressed again. Press next (or stop) and then play within 250 ms, and the new loop is suspended, `onstatechange` halts it, and the button goes back to "play": silence. Headless, at 150 ms between next and play, steps 2 and 4 came back `suspended/false`; at 500 ms all four ran.
- **The remake:** in `stopSound`, keep the timer id and clear it in `play()`, or suspend only `if (!playing)` (as the resolution piece already does). Make the stumble's label say beat 3 "and" in both places. Optional, in the note: quantizers with a range (Logic's Q-Range, Cubase's non-quantize zone) do pick notes, by size; the plants are the same size, so size can't separate them either.

### Teaching the Resonance · the four tracks — remake

- **Test or decoration?** A test in shape: four mixes, shuffled, the picture hidden until both answers, the page's prediction (track 4 robotic) stated before the reveal. "Grooves most" has no prediction, which is faithful: the page says there is no universal right answer.
- **The flaw: the blind test can be decoded by a landmark.** The groove is the Technical Side's, planted stumble and all, and the reader may just have learned to listen for it. Per mix, recomputed on the piece's engine: the stumble is 37 ms at 0 %, 18.5 ms at 50 %, 0 at 100 % and in the student's mix; the student's mix and the full grid then differ only in the percussion (8.4 ms RMS against 0). A listener can work out which mix is which instead of judging groove. And the hats, which the hint says to listen to first, move least: 4.9 ms RMS as played, 2.4 at 50 %. The page's "focus on hi-hats (most obvious)" can't be heard here.
- **Faithful?** Mostly. Step 1 teaches the page's four tracks (0, 25, 75, 100 %), but the test plays 0, 50, 100 % and the student's mix, which is Teaching Notes' demonstration plus Common Student Discoveries, not Part 1. Not wrong, but the step text doesn't say so, and the verdict compares to "track 4".
- **Walks up?** Yes.
- **Runs?** Console clean. Same suspend race as above, reproduced.
- **The remake:** the race fix; play the test on a take without the planted stumble and lean (a fresh seed), with hats loose enough that the page's hi-hat advice holds, or change the hint; and either make the test's mixes the four tracks of step 1, or say in the test step that they are the demonstration's 0, 50 and 100 % plus the student's mix.

### Advanced Applications · swing and template — remake

- **Test or decoration?** A test: template against humanize at matched RMS, heard blind, can come out against the page. Matching the RMS is the right control for "is it the pattern or the amount?"
- **The flaw: it stages a contest the page doesn't hold, at a size the page never gives humanize.** The page's humanize adds "micro-deviations" and its paradox holds both: systematic deviation makes groove, *and* some randomness sounds right. At 20.9 ms RMS, humanize's offsets reach 68.1 ms over 1000 passes (more than half a 16th at 120 BPM; none reorder, nearest gap 28.7 ms). The template, recomputed, is mostly a swing: offbeats 27.9 ms late on average, onbeats 4.4, about S = 0.59, plus a late snare. So the test is swing against heavy jitter, and the verdict "The section's claim held for your ear" reads as humanize losing on its own terms, which the design doesn't show.
- **Faithful?** On swing, the piece frames the page's "66 %" row as a slip. It isn't, quite: in the Linn/MPC convention 50 % is straight and 66 % is the name for triplet swing, and on a 96-PPQN clock 66 % of a 48-tick 8th rounds to 32 ticks, exactly 2/3 (computed). The page's numbers are what that convention plays.
- **Walks up?** Yes: straight, swing, template, test.
- **Runs?** Console clean. Same suspend race, reproduced.
- **The remake:** the race fix; on the test step and in the verdict, say plainly that at this size humanize is far past a usual setting, so the test asks pattern against amount, not whether humanize works, and drop "the section's claim held" for a line about pattern; optionally add a second pairing at a small size (template against template plus a few ms of humanize), which would test the page's own paradox. On step 2, name 66 % as the Linn/MPC label for triplet swing.

### The Final Insight · to what resolution — remake

- **Test or decoration?** A test: the reader's two answers (fewest bits for a clean attack, fewest for the whole fade) can come out the wrong way round, and the verdict says so when they do.
- **Faithful?** Yes. 2^N levels, 24 bits = 16,777,216, the fade stopping at τ·ln(0.8/Δ) (8 bits: 2.35 s; 12 bits the fewest that reaches −60 dB): recomputed. The mid-rise grid is named in the note with its cost (common PCM goes silent where this one buzzes). Dither is an addition the page doesn't make (offer 5), and the piece says so through the hint rather than claiming it for the page.
- **Walks up?** Not at the end. Dither, a new idea, arrives on the test step itself, against [[Progressive Staging]]: each concept alone first, the proof last.
- **Runs?** Console clean; the stop checks `!playing` before suspending, so no race here. **One bug, reproduced:** the verdict ignores dither. With dither on at 8 bits, the readout says "the fade keeps falling, under hiss" and the verdict, in the same view, says "at your 8 it stops at 2.35 s, 40 dB down."
- **The remake:** keep dither off until both answers are in, then offer it as the after-word; or record dither with each answer and word the tail line from it. Either way the verdict and the readout must agree.

## Checks run

- `node "…/Quantization ↔ Precision vs Flow — rich — check.mjs"`: all PASS (the maker's engine checks, re-run).
- `node _ops/rich-face/conform.mjs "Quantization ↔ Precision vs Flow"`: 4 pages, introduced 4, pre-contract 0, errored 0, **errors 0, warnings 0**, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Quantization ↔ Precision vs Flow"`: all four sections in step.
- `git diff main -- "Cross-Domain Resonances/Quantization ↔ Precision vs Flow.md"`: empty; the text is untouched.
- Face served with `rich-server.mjs --root <worktree> --detach`, headless Chromium at 1300 px, every frame scrolled in: 4 frames, 4 proposal chips, **console clean**. Every step of every piece clicked and played: no audio context before the first click in any piece; a step change stops sound. A hidden event suspended a playing piece. Two bugs found, above (the suspend race in three pieces; the dither verdict).
- An independent recompute (my own script, not the pieces' engines) of every offer's numbers, below.

## The offers

1. **Velocity, confirmed with a footnote.** 73 on a grid of 16 rounds to 80 (7 away; 64 is 9). The page says "snaps to 64 or 80", naming both neighbours, so it doesn't claim 64; the loose part is "nine levels … disappear". Every velocity from 72 to 87 lands on 80 when a tie rounds up; 72 is exactly halfway, and round-half-to-even sends it to 64, so "73 to 87" is the safe range. The grid keeps 9 values only counting a cap at 127 (0, 16 … 112, 127). The Context names the same slip.
2. **Tempo, confirmed.** 0.537 s → 0.500 at 120 BPM, 0.600 at 100. The Context records the tempo lost in the 2026-05-28 fold.
3. **Swing, disputed in part.** The numbers hold: 66 % gives 0.165 / 0.415 s, 2/3 gives 0.1667 / 0.4167 (seconds at 120 BPM, where an 8th is 0.25 s). But "66 %" is the Linn/MPC convention's name for triplet swing, and on a 96-PPQN clock it is exactly 2/3. Add the units and "(triplet)"; leave the 66 %.
4. **Strength, confirmed, as a sharpening.** True by construction of linear strength: every deviation keeps 1 − s. The page doesn't claim otherwise; it never says partial strength discriminates. So the offer adds a point rather than correcting one. Keep its sentence to the knob; "quantizers can't tell" would need the range caveat (Q-Range and the like select by size, not intent). A claim-change, so it goes through the Deposit map.
5. **Dither, confirmed with my own implementation.** At 8 bits, 3.0 s: true 0.00194, dithered 0.00195 (the maker's 0.00188 differs only by the noise seed), undithered 0.00497, which is exactly 4/π × half a step, the fundamental of a ±half-step square. That held buzz belongs to the mid-rise grid; on a mid-tread grid, as in common PCM, the undithered tone is 0.00000 at 3.0 s, silence, and dither recovers 0.00194 there too. So the finding is real either way, but the offer should say the undithered tail is lost (as a buzz or as silence, by grid), not that it is "stuck at 0.00497". It doesn't contradict "to what resolution"; it qualifies "coarse quantization flattens reality": coarse plus noise keeps low-level detail, at the price of a noise floor. The link to the humanize paradox is fair. A claim-change, through the Deposit map.
6. **The sample matrix, disputed.** The comment was born under the 3-bit bit-depth example (`git show 46d904f`, the comment sits right after "Error: 0.066 (lost forever)"), so a "sample matrix" most likely means audio samples across resolutions, and "creative output" means sound to use. A CSV of timings in another section answers neither. The limit the offer names is real (a sandboxed frame without `allow-downloads` can't save a file), but that is a gap in the piece contract, not a reason to treat text as the answer. The comment should stay open; don't cut it.

## The face as a whole

It makes the page's idea felt. Each piece turns one of the page's slogans into something the ear has to decide: the knob that can't tell a stumble from a lean, the four tracks heard blind, pattern against amount, and the bits a fade needs that the attack doesn't. Together they make one argument. Resolution is a choice about what to keep, and the tool can't make that choice for you. The face does not just add busyness: every piece ends on a question with the reader's answer in it. What holds it back is small and fixable: a 250 ms race that silences three of the four, two blind tests that can be decoded or are tilted, and a verdict that contradicts its own readout. One round fixes all of it. The offers are mostly sound. Offer 3 should respect a real convention, offer 5 should drop a detail that belongs to its grid, and offer 6 should keep Loudon's comment open.

Sources for the two outside facts: the Linn/MPC swing convention, 50 % straight and 66 % triplet ([Attack Magazine, swing in DAWs](https://attackmagazine.com/technique/passing-notes/daw-drum-machine-swing/2), [Roger Linn on drum machine groove](https://brettworks.com/2013/07/23/roger-linn-on-drum-machine-groove-and-j-dillas-off-beat-sound/)); Logic's Q-Range quantizing by distance from the grid ([Logic Pro X manual, advanced quantization](https://www.manualsdir.com/manuals/547422/apple-logic-pro-x.html?page=336)). The 96-PPQN rounding is my arithmetic, not a manual's.
