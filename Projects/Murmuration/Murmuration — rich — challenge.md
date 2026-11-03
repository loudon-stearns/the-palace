---
title: "Murmuration — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Murmuration]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Murmuration's proposed rich face: every piece judged for test, fidelity and walk-up, every offer recomputed on the flock itself, so Loudon reads a face that has already been argued with."
---

# Murmuration — rich — challenge

Challenger, proposal round, 2026-11-03, on the maker's commit 8dd5eed8 in the worktree `enrich/murmuration`. Judged from the page, the pieces and the commit body; I did not make this face.

**Tally: 11 keep, 2 remake, 0 retire.**

## The checks I ran

- **The chain of twins.** `node "Murmuration — rich — check.mjs"`: all 13 checks pass. Both made pieces' flocks equal `engine/murmur_engine.js` with difference 0 over 1200 frames, and both mappings equal the engine's `mapBoids`. The engine in turn equals the instrument: `node engine/check_page_mapping.js` gives 0 for order, place, density mapping and density audio (the 0.637 lines are the startle's peak-alarm readout, not a difference). So piece = engine = `Murmuration.html`, and the numbers below are the instrument's.
- **conform** (`conform.mjs "Murmuration"`): 5 pages, 0 errors, 0 warnings, browser pass at 760 and 1130 px. The two gathered pages still owe their own head declarations (the manifest speaks for them), as the commit says.
- **fingerprint**: all six made sections in step (306f40bdfcca, 8606791e6471, f90d73d74512, 286d710874ec, d8e56f0ee429, e4c69197599b).
- **The face, headless Chromium**, scrolled whole so all five frames loaded: four proposal chips, nothing lost its place, no media playing without a click. Console: only p5's accelerometer permissions-policy notices from the gathered instrument (two errors, two warnings), as the commit says. Hush is the kit's (no piece answers it itself), and conform's play/hush pass found nothing.
- **Tracked**: `blind-X.wav`, `blind-Y.wav`, `page-as-built.wav` and the rest are in git. Nothing licensed; every sound is rendered from the engine.
- **My own re-runs**, scripts in the session scratchpad, each loading the pieces' own math blocks: the 240-bird up/down sweep on the maker's seeds, on new seeds (21–28), and with 60 s settling per step; 120 birds up/down in the instrument's fixed 920 × 520 field; the Cohesion sweep at η 0, 0.03 and 0.06; the slider share from `engine/eta_sweep.json`.

## The pieces

### The phase transition as the signature macro

**`Murmuration — rich — the knee.html` · remake (wording only, one round).**
1. *Test or decoration?* A test, and a good one. It refuses the easy proof ("any knob can be bent into a knee") and asks for three marks only a transition leaves: the wobble peaking at the knee, the knee sharpening as the flock grows at fixed crowding, and no memory up and down. Any of the three could have failed.
2. *Faithful?* It holds the page's contradiction instead of smoothing it ("snap" is the steep knee, not a jump). Two sentences in step 4's marks go past the evidence, and both come from `summarise()` in `check.mjs`, so the fix is there and a `--build`:
   - **The 240-bird memory is not robust.** On the maker's seeds I get exactly the maker's gap (0.124 at η 0.06, 4.02 se). On eight new seeds it is 0.088 (2.52 se, under the piece's own 3-se line). With 60 s to settle at each step instead of 20, the gap at η 0.06 is gone (−0.004, 0.06 se) and a smaller one sits at 0.07 (0.062, 2.45 se). And the 4-se gap is the largest of ten steps; the same run has a gap of the opposite sign at η 0.11 (−0.023, 2.56 se). So "the bigger flock remembers which side it came from, for twenty seconds at least" and "more than chance allows" should become: one set of starts showed a gap at 240 birds; other starts and longer settling did not; no memory is established at these sizes, and slow settling is the likelier reading.
   - **Grégoire and Chaté is cited as "disputed", which reads as refuted.** Their 2004 paper (PRL 92, 025702; arXiv cond-mat/0401208) says the transition in two dimensions "is always discontinuous", the minimal Vicsek model included, with or without cohesion, and that the continuous look comes from finite size. It was disputed, and the dispute is about exactly this flock's kind of noise: Aldana et al. (PRL 98, 095702, 2007) and Nagy, Daruka and Vicsek (Physica A 373, 445, 2007) found the turn continuous when the noise twists each heading by a random angle, as here (`Murmuration.html:242`), and discontinuous only when it is added as a random vector. Chaté, Ginelli, Grégoire and Raynaud (PRE 77, 046113, 2008) answered that the angular-noise turn is discontinuous too, once the flock is large enough. So "disputed" alone leaves the reader thinking it was refuted; the honest line is "disputed for this kind of noise, and answered", with a small flock looking continuous rather than being so.
3. *Walks up?* Yes. One bird against one rule, then sixty and their one number, then the sweep against a crossfade, then the test. The rail stays open.

**`transition.png` · keep.** Evidence, captioned honestly; "the first sixth" of the old linear slider matches the instrument's own comment (`Murmuration.html:464-466`).

**`page-as-built.wav` · keep.** The quiet witness of the whole face: the flock orders and the sound doesn't follow. It makes offer 3 heard, and its numbers match `engine/takes_analysis.json` (page/flock, 3.38–3.46 bits).

### The Architecture — one plane, three readings

**`Murmuration — rich — one plane.html` · keep, with a note.**
1. *Test?* Yes. The Cohesion sweep could have shown a smooth morph across the knob; it shows a flat cloud end and a gather at the top, against the text's sentence.
2. *Faithful?* It measures under the section's own mapping (height is pitch) and says so, says pitch spread is focus and not broadband-ness, and says the instrument's default is now order. My cross-check: the result does not depend on measuring at the knee. Up to cohesion 1.25 the flock spreads 277–280 px at η 0, 264–288 at η 0.03, 254–281 at η 0.06 (random: 305). Note: at η 0 and 0.03 the tightest setting is 2.5 (56 and 59 px), not 3 (86 and 112), so "one tone only near 3" holds at the default η; across η it is 2.5 to 3.
3. *Walks up?* Yes: the terrain alone, one bird, sixty birds, then the knob.

**`murmuration-3d.html` · keep.** All three readings playable from one engine; the caption is honest that no one has heard it in the face.
**`readings.png` · keep.** 2.02 against 2.67 bits matches `engine/distribution_analysis.json` (ordered: pcEntropy 2.02, grainsOrderMeanXY 2.67).
**`reading-distribution.wav` · keep.** Gives the pad's sentence a sound.
**`gesture.png` · keep.** 0.94 → 0.54, back in 4.17 s; 0.13 on the second strike; 5 birds on the third, all in `engine/gesture_analysis.json`. It is the closest thing on the page to a test of "an organic swell no envelope produces".
**`gesture-place.wav` · keep.** +3.3 and +5.6 dB over a 1.9 dB floor match the place strikes A and B.

### Murmuration (the intro)

**`3d-plate.png` · keep.** Shows "one plane" in a single glance; φ 0.17 and 0.70 match `three-d/3d-report.json` (0.165, 0.699).

### Status

**`Murmuration.html` · keep, with a note.** The instrument itself. "The knee at mid-slider" is true at the default 60 birds (η 0.06 at x 0.49). At 120 birds in the same field the drop is shallower and sits later, its middle near η 0.085, x ≈ 0.58, so the Boids slider moves the knee a little.

### Open Decisions

**`ceiling/ceiling-done.png` · keep.** Matches `ceiling/ceiling-headless-chrome.json` (mean 0.592 at 420, 1.009 and 858 underruns at 720). Note: the report itself reads 420 as "clean" (`cleanUpTo: 420`); the caption's "right on the line" is the stricter reading and is fine.

### Forward Vectors

**`Murmuration — rich — blind pair.html` · remake (one round).**
1. *Test?* It means to be the purest test on the page: put the wager to the reader's ear.
2. *Faithful?* The key, Loudon's answer and the steward's reading are all on record (below). But **the walk-up gives the answer away.** Step 1 plays take X as "one take". Step 2 is headed "the other take", says "The other take is the hard version of a hand-dialed cloud", and plays take Y. By step 4 the reader has been told Y is the copy, and Y is the copy (`engine/blind-key.json`: X FLOCK, Y AUTHORED). The `atob` around the key doesn't help when the prose says it. Fix: let step 1 play one take and step 2 the other with neither named as the copy ("one of these two is the flock"); move the account of how the copy is made to a step with no take attached to it, or shuffle which file plays as A and B on each visit and let the key name both. Step 1's "as φ climbs, listen for the cloud to gather toward one pitch" then reads as said of both, which it should be.
3. *Walks up?* The order is right (score, what a hand can copy, the switch, the question). Only the labelling breaks it.

Small: the board stamps Loudon's answer `2026-10-15T01:50:24Z` (`_ops/swarm/persistent/blackboard.jsonl:824`), which is the evening of 2026-10-14 in Eastern time. The scroll writes 2026-10-15; the piece follows the scroll. Either is defensible; keep it consistent.

## The offers

Seven offers. Below, a **fact** offer corrects something the page states that is not so; an **emphasis** offer corrects how strongly or where the page says something true.

1. **Snap and second-order** — numbers confirmed, the 240-bird memory not robust (above), the reading of Grégoire and Chaté half right. *Fact and emphasis.* "Snap" is emphasis: the knee is steep and continuous at 8 to 120 birds. "Second-order" is a fact claim, and the weight of the literature since 2008 says the order of this transition in two dimensions is first, with small flocks only looking continuous; for angular noise like this flock's, that was contested and is the later answer, not a unanimous one. The page can keep what the flock does at its sizes ("turns continuously, steeply, at the sizes the instrument plays") but should not name the transition's order. At the instrument's real 120 birds (fixed field, double density) I find no memory: largest gap 1.83 se.
2. **The slider remap, about 4× gentler** — confirmed. 90-to-10% drop: η 0.029 to 0.123; 9.3% of a linear knob, 35.7% of the squared slider, ratio 3.8; normalised on the slider's own range (floor at η 0.25) it is 35% against 9%. The remap changes the hand, not the flock; the knee's width in η is the same. *Emphasis, not fact.* The page's slider sentence is "the nonlinear snap … rather than the linear feel of a knob", and 36% against a crossfade's 80% is still plainly nonlinear, so nothing the page says about feel is contradicted. Worth adding for Loudon: 9% of a slider is a few pixels, so the remap is a playability gain as much as a softening, and the default sits at x 0.49, right in the middle of the knee.
3. **"Into a coherent tone"** — confirmed from `engine/takes_analysis.json`: first mapping 3.38–3.46 bits throughout (flock), order mapping 2.45 ordered and 2.50 re-cohered (flock alone; 2.67 and 2.49 as the mean of X and Y in the scroll's table). *Both kinds.* Under the mapping the Architecture section describes, the sentence is wrong as a fact: the sound doesn't follow the flock. Under the order mapping it is stronger than measured: 2.45 bits is about five or six equally loud pitch classes, a tightened cluster, not one tone (0 bits). The pad gets further, 2.02. "Toward a tone, under the order mapping" is the honest size.
4. **The headless numbers and the slider's range** — confirmed: φ 0.099, past 0.9 at 5.7 s, 0.964 at 60 s; 0.114 at η 0.80 (the floor √(π/240)); φ 0.128 at the slider's top, η 0.25. *No-claim edit, correctly labelled.*
5. **Cohesion's morph lives at the top of the knob** — confirmed, and robust across η (my sweep above): flat to 1.25, gathering from 1.5 to 1.75, tight at 2.5 to 3. The default 1.0 sits on the cloud end. *Fact:* the page says Cohesion morphs tone into cloud; over most of the knob it does not.
6. **The mapping described is the first build's** — confirmed: `Murmuration.html:463` sets `map:'order'`, `:155` lists order as selected and place as "(first build)". *Fact (out of date).* One more line the maker missed: Open Decisions' "Pitch vs timbre decoupling" (`Murmuration.md:81`) also says "the prototype maps height→pitch". Under the order mapping pitch comes from heading, not place, which is itself one answer to that decision. Worth folding into this offer.
7. **The blind verdict is in** — confirmed: `blackboard.jsonl:824`, a RESOURCE_GRANT to `murmuration-steward-003`, option CANT-TELL, "I can't hear a difference that matters. The bet needs a sharper test, or it's a story we tell about the picture." The scroll records it (`Murmuration — scroll.md:56`), the key is open (`engine/blind-key.json`), and the steward's reading is item 1 of `Murmuration — tuning.md:27`. *Fact (out of date):* the page's "waiting on the board" line is no longer true.

## The face as a whole

It makes the idea felt, and it is not busy. The two strong pieces do what the ceremony asks: the knee and the plane each put a sentence of the page to the page's own flock and let it answer, and both answers push back. The flock is a real transition, but a steep turn, not a snap. Cohesion gathers only at the top of the knob. The gathered renders sit beside the sentences they answer rather than piling up at the bottom, and `page-as-built.wav` may be the most honest single object on the face: listen to a flock crystallise and hear nothing change. What the face needs before Loudon hears it is two wording repairs. The knee claims a memory its own seeds don't keep. The blind pair tells you the answer before it asks the question, and on a page whose central wager is "the honest test is blind", that one matters most.

Sources: [Grégoire and Chaté 2004, arXiv cond-mat/0401208](https://arxiv.org/abs/cond-mat/0401208); [Aldana et al. 2007, arXiv cond-mat/0701733](https://arxiv.org/abs/cond-mat/0701733); [Chaté, Ginelli, Grégoire and Raynaud 2008, arXiv 0712.2062](https://arxiv.org/abs/0712.2062). Nagy, Daruka and Vicsek 2007 seen only as a reference entry, not read.
