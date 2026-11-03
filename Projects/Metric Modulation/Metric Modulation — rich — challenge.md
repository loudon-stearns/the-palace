---
title: "Metric Modulation — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Metric Modulation]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of Metric Modulation's first rich face: a verdict and a reason for every piece, the arithmetic redone by a second hand, and the three tests in the reader's body judged as tests."
---

# Metric Modulation — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03, proposal round. Judged from the page, the three pieces, the gathered proof, `check.mjs`, and the maker's commit body (a34343af) as its only account. The `.md` and the pieces are untouched.

**Count: 1 keep, 3 remake, 0 retire.**

## The pieces

### the same hits, a new beat (What Metric Modulation Is) — remake

- **Test or decoration.** Steps 1 to 4 walk up cleanly: one pulse, one figure, the pivot with the bell's lane never moving, then the four relationships heard as two doors (80 and 180). Step 4 is a real finding, played. Step 5 is meant as the test, and it is the problem. It scores the pivot (A) against a four-bar glide (B) by how soon the taps are back within 50 ms of the kick, and it says: "If the opening is right for you, your taps are back on the beat sooner after A than after B." A glide never moves the beat more than about 15 ms from one beat to the next (0.505 s to 0.739 s over 16 beats), so a tapping hand is never thrown out of the 50 ms window, and the scorer starts counting at the ramp's first beat. I ran a standard two-process tapper (phase and period correction, 12 ms motor noise; `mm-tapper.mjs` in my scratch, not committed) through both scores, 200 runs at each of three settings. B landed at tap 1 in 196, 197 and 198 of 200 runs. A never did, with medians of tap 13, 6 and 5. A was sooner in 3, 0 and 0 runs of 200. So the outcome is all but fixed by the metric, not by the page's claim.
- **Faithful.** The page never says a pivot re-syncs faster than a glide. It says metric modulation is "not a continuous glide", which is a definition, and its own Step 2 offers the linear ramp "for a smooth feel". The prediction is the piece's, not the text's. B also has no bell, so A and B differ in two things at once.
- **Walks up.** Yes, through step 4.
- **Remake, exactly.** Score A against A′: the same jump at 6 s with the bell silent through the 120 section. Then the only difference is whether the dotted-quarter grid ran through the change, which is the opening's claim, "the grid doesn't stop; it reinterprets". Keep B as a third listen if wanted, but don't score it against A. Or score it, and say first that a glide is expected to keep taps nearer because it never jumps. Drop the sentence that predicts A beats B. Add the A′ claims to `check.mjs`.

### there and back (The 3/4 Symmetry) — remake

- **Test or decoration.** Steps 1 and 2 walk up well: the drop on four triplet eighths, then the return on the old 120 beat as a dotted eighth, the pair swapped. Step 3's "20 of 20" holds by construction. The drop is 8 beats of 0.5 s then 12 of ⅔ s; the return is 12 then 8. Reversed, they match because the counts were chosen to match. It's a fair picture of ¾ × 4⁄3 = 1, but it is not a test, and it shouldn't read like one. Step 4 is the test: does the return "arrive", and does that grow with the stay at 90? It could come out either way, which is good. But it is not blind. The hint tells the reader the expected answer ("If the page is right for you, *arrived* grows with the stay") before they answer, and the reader picks the stay themselves. The 2 s stay is confounded too. `trip(3)` sets the return's bell to `min(stay, 4 s)`, so it starts at the drop itself and the bell never stops; that stay also returns mid-bar.
- **Faithful.** The bar-line claim goes past what the arithmetic shows (offer 4, below). Step 3 says "a pivot can only happen on one of those meetings", and the readout says "the drop can leave from any bar; the return waits for every third, or leaves mid-bar." That holds only when both grids are counted from one origin, that is, when the return has to land back in phase with the original 120. The piece's own `trip()` counts the return figure back from the pivot. Counted that way, a dotted-eighth figure that starts on beat 2 of a 90 bar pivots on the next bar line after a one-bar stay. The new 120 is then 1/6 s out of phase with the old 120's ghost, which nobody is still playing.
- **Walks up.** Yes.
- **Remake, exactly.** (a) Say the condition in step 3, the readout and the caption: "if the return is to land back on the old 120's bar lines". Or cut the bar-line asymmetry. Note too that it depends on the meter: in 3/4 at 90, every bar line meets. (b) Step 4: play the three stays in a shuffled order with the stay hidden, show it only after the answer, and move the "if the page is right" line below the tally. (c) Name the 2 s stay's confound in its readout: its return bell starts at the drop.

### pivot via bell · v2 · 2026-05-04 (gathered proof, Implementing) — keep

- A record, so it's judged as one. Tracked, and served at 206 on the face (0:16). I re-measured it by onset detection: the 880 Hz bell has 19 onsets from 0.737 s to 14.234 s, every gap 0.749 to 0.754 s. The low band has kicks 0.5 s apart to 5.48 s, then 5.98, 7.48, 8.98, 10.48, 11.98, 13.49, every 1.5 s, on every second bell. The caption's numbers hold. Loudon's quote is real (`Projects/Project Stewardship System/Archive/2026-05-04 Proof Showcase v2.html:192`, the Metric Modulation v2 card). One note for the maker, not a remake: that showcase described v2 as "4 bars at 120 … pivot bar drops the kick … 4 bars at 80". The take has 3 bars at 120 and no dropped bar. The caption reports what the take does, which is right.

### the anchor, blind (Implementing, Step 3) — remake

- **Test or decoration.** It's a test in intent, and the walk up is clean: the kick on the dotted quarter in a kickless 120 groove, the change with it, the change without it, the slider for late entry. The blind step hides only the order. The two 120 sections sound different from the first bar (a kick rolling across the bar against a kick on every beat). The reader has just heard both in steps 2 and 3 and been told which is which and what the page expects. So the six picks measure a stated preference that already knows the hypothesis. The readout then compares that to guessing ("1⁄64"), as if it were the reader hearing a hidden difference. As a sign test of consistent preference the arithmetic is fine (6 of 6 is 1⁄64, 5 or more is 7⁄64). The word *blind* is what overclaims.
- **Faithful.** Step 3 of the page says to "ensure that a rhythmic figure in the old tempo aligns with a rhythmic figure in the new tempo". The piece tests whether the figure is present before the change, not whether it aligns after.
- **Walks up.** Yes.
- **Remake, exactly.** Make the pairs identical before the change. Both get the anchored 120 section, kick on the dotted quarter. After the change, one 80 groove continues the kick's grid, as `anchored()` does now. The other comes in offset, say by 0.25 s (the slider's eighth), so the kick is no longer its beat. Then nothing gives the answer away until the change, and the pick tests the page's word "aligns". If the maker would rather keep the present pairs, the smaller fix is to call the step *by ear*, not *blind*, and say the order is the only thing hidden.

## The checks

- `node "Projects/Metric Modulation/Metric Modulation — rich — check.mjs"`: 45 pass, 0 fail. Several checks are tautologies: `3 % 4 !== 0`, the 20-of-20 mirror, and "a perfect hand lands at tap 1" for both A and B. None checks that the step 5 test can come out for A.
- `node _ops/rich-face/conform.mjs "Metric Modulation"`: 3 pieces introduced, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Metric Modulation"`: the three made sections are in step (2deece93ca1d, 39d58922e724, f01d325943a5).
- Served with `rich-server.mjs --root <worktree> --detach`, loaded `?entry=Metric Modulation` in headless Chromium, scrolled through, and clicked every step on all three pieces. Console: 0 lines, no page errors. Three piece frames loaded. Four `proposal · 2026-11-03` chips. The wav was served at 206. Server stopped.
- Sound starts only on a click: `actx` is made only in `ensureAudio()`, called from play-button handlers. There is no `visibilitychange` handler of a piece's own, and the kit hushes any running context. Nothing licensed: every voice is synthesised (falling-sine kick, noise hat and rim, two-sine bell).
- Not verified: any listening. Whether the bell or kick balance lets the pivot be heard. Real-hardware tap latency.

## The offers

1. **Confirmed.** A dotted quarter becoming the new quarter: 60 ÷ (1.5 × 0.5) = 80. The triplet quarter (⅔ of a beat, the page's "the triplet (2/3 of a beat)") becoming the new pulse: 60 ÷ (⅔ × 0.5) = 180. The old quarter becoming the new triplet quarter: new quarter 0.5 ÷ ⅔ = 0.75 s, so 80. The page's "Equivalently" line states the triplet becomes the new pulse and writes 120 × 2/3 = 80. The arithmetic is the other reading's, so the gloss is backward, as the maker says. The equation "quarter = triplet quarter" itself is fine read the usual way, old value = new value. (A triplet *eighth* is ⅓ of a beat, not ⅔; the page means the triplet quarter.)
2. **Confirmed.** Reading "X → Y" as "the old X becomes the new Y", new = 120 × len(Y) ⁄ len(X): q→♩. 180, ♩.→q 80, q→triplet q 80, triplet q→q 180. Two tempo changes, each named from both ends.
3. **Confirmed.** Four triplet eighths = 4 × ⅙ = ⅔ s, the new quarter at 90. ¾ × ⅔ = 0.5 s, so the old quarter is the new dotted eighth. The grids meet every 2 s, 4 beats of 120 = 3 of 90.
4. **Arithmetic confirmed, consequence disputed.** From one origin, 4/4 bar lines in 24 s: at 120 (every 2 s) 12 of 12 are meetings. At 90 (every 2.667 s) a bar line meets when 8k⁄3 is a multiple of 2, so k must be a multiple of 3: 3 of 9, every third bar, because a 4-beat bar is not a multiple of the 3-beat meeting cycle. But "a return on a bar line has to wait three bars" holds only if the return must land in phase with the original 120 grid. A figure counted back from any 90 bar line, starting on beat 2 of the bar before, pivots on it. The asymmetry is real as meter fit (the 3:4 cycle fills a 4/4 bar at 120 but only ¾ of one at 90), and it would flip in 3/4. Suggested rewording: "a return that lands back on the old 120's bar lines can leave only every third bar, or mid-bar".
5. **Confirmed.** Elliott Carter, two t's.
6. **Confirmed, and the open half closes.** Ableton's current Live manual, Live Keyboard Shortcuts §42.11 and §42.12: Quantize is Cmd+U (Ctrl+U), and Quantize Settings is Cmd+Shift+U. §42.7: A toggles Automation Mode. Live has no tempo marker. A tempo change is a breakpoint on the Master track's Song Tempo automation (manual §26.9.1, Automating the Tempo), and Live 12 adds scene tempos in Session View. "Tempo marker" is Logic's, Pro Tools' or Cubase's word. So Step 2's items 2 and 4 both name the wrong thing. Cmd+U, by the way, is the very operation [[Quantization ↔ Precision vs Flow]] is about.
7. **Confirmed, with a caveat on what the number measures.** A linear-in-beats ramp from 120 to 80 over 16 beats: t(b) = 24 ln(120 ⁄ T(b)), span 24 ln 1.5 = 9.731 s, first beat 0.5053 s, last 0.7385 s. Thirteen 0.75 s anchor hits. The worst distance to the nearest ramping beat is 266.7 ms, at the hit 5.25 s in, which falls at beat 9.43. Over 8 bars it is 308.7 ms. The caveat: that models an anchor held at a fixed 0.75 s in clock time, near the ceiling of half a ramping beat, so it says "fully out of phase". In Live, a dotted quarter placed in the arrangement follows the ramp: it lasts 1.5 ramping beats, about 0.76 s at the start and 1.11 s at the end. It never leaves the grid; it stops being one length in clock time, so there is no fixed figure to carry. The conclusion holds either way: the ramp is a glide, and the anchor belongs to the snap.

## The neighbour

[[Quantization ↔ Precision vs Flow]]'s landed face (four pieces, challenged and remade on main, 9c9342b7) shares no claim about grids that this face contradicts. Its grid is a fixed snapping resolution at 120 BPM (0.537 s → 0.500 s). Its 66 % swing is ⅔ of an eighth, the same triplet arithmetic this page uses. The two faces meet at Cmd+U: the shortcut this page names for tempo automation is that page's whole subject.

## The face as a whole

It makes the page's idea felt. The best moment is step 3 of the first piece: the bell's lane doesn't move while everything around it changes. That is "the grid doesn't stop; it reinterprets" put where a reader can see and hear it, and the walk up to it is patient. The maker also found real things in the text: the backward gloss, the four names for two changes, the missing tempo marker, and the ramp that contradicts the opening. Each is carried as an offer, not smuggled into a piece. Where the face is weak is the three tests. Each one tilts its own scale. The tap test's metric settles it before the reader taps. The return test tells the reader the answer before asking. The blind test is blind only to the order. All three are fixable in one round, and fixed, they would be the page's claims meeting a reader's body honestly, which is the point of this face.
