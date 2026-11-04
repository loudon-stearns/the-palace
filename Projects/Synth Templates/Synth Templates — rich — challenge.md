---
title: "Synth Templates — rich — challenge"
born: 2026-11-04
links:
  - target: "[[Synth Templates]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenge of Synth Templates' first rich face: three pieces vetted, the maker's numbers rerun on the project's own voice and on the site's own chain, and one remake named so the piece serves the page's words where they part from the card's."
---

# Synth Templates — rich — challenge

Challenger · claude-opus-5-5 · cloud batch 2 · 2026-11-04. Maker's commit `0cfa2999` on `enrich/synth-templates`. One section (the H1's, "Synth Templates"), so Loudon approves it all or nothing: the two gathered pieces and the made piece stand or fall together.

## What kind of claim this is

"The split is the lesson" is a teaching rule: which knobs a learner should call structural. The sentence beside it, "the essential settings are what make the sound that sound", is a claim about identity by ear: move an essential and it stops being a house bass. The page never says a meter will see the split. Its comparison is learner-against-reference, "by feature and by ear … not by null test". So a meter that misses the split is a finding about that meter, not about the page. The maker says the same thing in the caption and on step 4. Only step 5, the blind trials, puts the page's claim at risk, and it can come out against the card.

That goes differently for the two meters. **Meter B** is the comparison page's verdict. Its job is to grade the card's essentials, so when it calls a lost essential a match, that is a real defect in the project's tool (offer 4). **Meter A** measures how far a move takes the four sidecar numbers, judged against a region the maker built. It was never built to see the split, so its miss is expected and not a finding (see the remake).

## The pieces

### `workshop/cards/house-bass.svg` (gathered): **keep**

1. Test or decoration: decoration, and honest about it. It is the sheet the paragraph describes, drawn by `card-to-tikz.py`.
2. Faithful: yes. The caption says decay appears on both lists. The sheet source confirms it: the filter-envelope block reads **decay short** in ink and *decay short – medium* in amber (`workshop/cards/house-bass.tex:124`).
3. Walk up: not applicable to a figure.
Tracked in git.

### `workshop/renders/house-bass.png` (gathered): **keep**

1. Decoration, captioned honestly.
2. Faithful. The caption's sidecar numbers match `renders/features.json` (peak −3.65, RMS −16.33, centroid 147.0 Hz, rise 25 ms, tail 145 ms). The eight-note reading is right (offer 3).
3. Not applicable. Tracked; the WAV is not, as the caption says.

### `Synth Templates — rich — which knobs are which.html` (made): **remake**

1. **Test or decoration: test.** Step 5 can return "contradicts the card" on either arm. Step 4 is an audit of the project's meters, and a useful one.
2. **Faithful: not wholly.** The text wins, and here the page and the card part:
   - The page lists the taste settings as "cutoff, **resonance amount**, release length" (`Projects/Synth Templates.md`, the first bold paragraph). The card pins `filter1 resonance: moderate` as essential (`workshop/cards/house-bass.yaml`, essentials). The piece follows the card. It scores both resonance moves (moderate → none, moderate → high) in the essential arm, and puts one of them (moderate → none) in the blind trials as an essential trial. Nowhere does it say that the page calls this knob taste. The manifest and the piece never mention it.
   - Step 3's note gets the mechanism wrong. It says the bar gives the A/B little room because the 98.6 ms decay has barely reached its sustain before the 121 ms note lifts. But the sustain is the target the decay falls toward. In `voice.js` the decay is `setTargetAtTime(lo + (peak − lo)·s, …)` (`workshop/site/voice.js:82`), so at sustain full there is no decay at all, and the two settings part from the first millisecond. Measured on the bar: brightness 102.7 Hz untouched against 157.4 Hz for the A/B, +0.62 oct. The bar does not hide the A/B. What crowds it is a taste move: filter decay at medium (155.2 Hz) lands in the same place.
   - Whose numbers (tuning 12d). The piece calls both meters "the project's own". Meter A is not. The four features are the project's (`render-features.py` as `compare.js` ports them), but the lost/kept rule is the maker's construction: a leave-one-out span of the taste moves widened by grains. That rule fails a taste move by construction whenever the move alone sets an extreme. All four of meter A's taste-arm misses on the bar are lone extremes: fdecay brightness 155.2 (the maximum), subeq brightness 82.2 (the minimum), suboff rise 15 ms, arel tail 730 ms. So its 9 and 10 of 16 follow from its rule.
3. **Walk up: yes.** It opens on the untouched card, then moves one taste knob, then one essential, then runs the meter audit, and puts the ear test last. It builds the card's own situation before judging it. The bar is the card's written pattern: four off-beat eighths, each a sixteenth long, 121 ms. The settings are the card's YAML, checked equal by the check script.

**The remake, exactly:**
- (a) Name the page/card disagreement on resonance in steps 4 and 5. Take moderate → none out of the essential arm and score resonance on a line of its own: "the page says taste, the card says essential". To keep six and six, the essential arm takes filter sustain half or band-pass in its place. Leave the arms' 7/64 as it is.
- (b) Rewrite step 3's note. On the bar the A/B is plain against the untouched sound (102.7 → 157.4 Hz). What the bar blurs is the A/B against the far end of the decay's taste range. Held, the two part (100.2 against 157.6 Hz).
- (c) In the subtitle, step 4 and the caption, call meter A "the sidecar's four features, judged by a rule written here", not the project's meter. Say that a leave-one-out span fails a taste move that is the lone extreme on a feature. Let the headline finding be meter B's.
- (d) Minor, a keep-level note: wrap step 5's state in the script's scope. `T5` is a top-level `let`, so a console can read `T5.trials[T5.at].kind`. Loudon won't, but it costs one line.

**Leak and confound checks on step 5, done:**
- Every trial clip is 5 s, the card's bar plus one 0.8 s held note, so every trial has the same notes and the same length.
- Loudness is matched by one gain per clip to the untouched clip's RMS over the sounding region. Worst residual 0.020 dB; highest matched peak −0.72 dBFS; gains from −1.3 dB (subeq) to +3.8 dB (amp sustain to zero).
- The UI shows only "Trial n of 12", and the gains appear only after the last answer.
- The order is shuffled with the unseeded `Math.random`. The seeded stand-in is swapped in only while each clip is scheduled.
- A non-listener has no length, level or text cue to read.
- The two moves taught by name in steps 2 and 3 (cutoff to mid, filter sustain to full) are disclosed, and the score is also given without them, with no verdict on five.
- The rule is stated before trial 1. It names the count that reads the card's way (5 or 6 of 6 per arm) and the count that reads against it (0 or 1). Both arms are scored. Chance per arm is (6 + 1)/64 = 7/64, both arms 49/4096 = 1.2 %. Right for six trials per arm. An always-the-same answerer agrees on one arm and contradicts the other, as the piece says.
- One confound is a choice, not a leak: the essential moves are sized by the maker ("a value a player could set"), and amp attack goes fast → medium, skipping short (0.0154 → 0.575 s). Say why, or use short.

## Checks run

- `node "Projects/Synth Templates/Synth Templates — rich — check.mjs"`: all passed. Inlined `voice.js` and `compare.js` byte-equal the workshop's (sha256 `c855c2beb861`, `020c902aac4b`); the card and vocabulary are equal; the baked table reproduces; the repeat check holds on both clips. Agreement: bar A 9, B 8; held A 10, B 10 of 16. Noise is lost on meter B 4 of 8 seeds on the bar and 8 of 8 held. playDemo plays eight notes of 60 ms.
  - Two of its checks cannot fail. The chance check computes binomial constants. The loudness check is nearly an identity, because RMS scales linearly with gain and only the −50 dBFS trim could break it. The manifest's "within 0.02 dB" is the worst residual it printed; the check's tolerance is 0.1 dB.
- `conform.mjs "Synth Templates"`: 0 errors, 0 warnings (browser at 760 and 1130 px; the piece is pre-contract).
- `fingerprint.mjs`: Synth Templates `96e4f1f22933`, 3 pieces, in step (equals `made_against`).
- Live face (`rich-server.mjs --detach`, headless Chromium, `?entry=Synth Templates`): the console's only line was the server's Permissions-Policy 'bluetooth' warning. No page errors. Then `--stop`.
- No `rich:hush` comment and no detached `new Audio()`, so the kit hushes the piece. Sound starts on pointerdown, and the AudioContext is made on the first press. All three pieces are tracked; nothing licensed is copied.
- My own probe, the piece's engine run headless with every reading dumped, on the bar, held and trial clips. Then the comparison page's verdict run **in the site's own chain**: the site's `renderOurs` path, `playDemo` into an OfflineAudioContext of length_s + 2 s with the schedule's last note-off (`build-site.py:651–667`), and meter B ported line for line from `buildReport` (`build-site.py:680–695`, port checked equal for this card).

## Offers

1. **Decay on both lists: confirmed.** On the bar, filter decay to medium measures −17.37 dBFS, 155.2 Hz, rise 25 ms, tail 150 ms. Sustain to full measures −17.38, 157.4 Hz, 25 ms, 150 ms. Held, they part: 100.2 against 157.6 Hz. The strongest finding on the face.
2. **"The bar gives the A/B 22 ms": numbers confirmed, mechanism disputed.** 121.0 − 98.6 = 22.4 ms, and meter A clears the A/B on the bar by 0.4 % (157.4 against a region top of 155.2 + 1 % = 156.75; held, 157.6 against 125.1). But the A/B is not only "what happens after the filter's decay". At sustain full there is no decay, so the A/B shows across the whole note: +0.62 oct over the untouched bar. What the bar cannot separate is the A/B from offer 1's taste move. The held-note proposal for the reference render still stands, on offer 1's ground. Restate it so.
3. **readPattern plays eight notes: confirmed.** The site's playDemo schedules eight notes of 60 ms, an eighth apart. The unit regex tests `sixteenth|16th` before `eighth` (`build-site.py:231`), and "each a 16th long" sets staccato (`:240`). The README line "playDemo reads tempo, note and velocity but not pattern or length_s" is stale (`workshop/README.md:50`).
4. **The comparison page cannot be trusted as a measure of lost: confirmed, and stronger in its own chain.** On the piece's clips:
   - The untouched held note reads wave "triangle" and resonance "high".
   - Noise reads "triangle".
   - The filter-sustain reading calls the A/B a match: low/low on the bar, low/half held.
   - Amp-sustain crest sits on its thresholds: 12.4 dB on the bar against 12, 7.3 held against 8.

   One correction to the wording: on the piece's clips meter B as a whole does flag the A/B, for the wrong reasons (resonance moderate → high on the bar, amp sustain sustaining → between held). On the pattern the site itself renders (playDemo), meter B flags **nothing** for the card's A/B, so a learner who set filter sustain to full would be told every essential matches. In that chain, noise in place of the square is called a match on 2 of 8 seeds (lost on 6), amp sustain to zero and amp attack to medium both match, and agreement with the card is 8 of 16 (taste kept 3/7, essential lost 5/9).
5. **Square pinned, lineage a saw: confirmed, framing widened.** `Projects/Generative Audio Devices/pdl-renderer/house_bass.pdl:16` reads `OSC:SAW -> FILT:IN`, and the card's own lineage line says "saw". But the page's own first paragraph quotes the card as "House Bass: mono, square, percussive filter envelope", so the page's text names square too. If Loudon's ear keeps the saw, that quote changes along with the card. The question is for the page as well as the card.

**New, for Loudon (not in the manifest; the challenger changes only the challenge block):** the page calls resonance amount taste; the house-bass card pins resonance moderate as essential. One of the two is wrong for this card, or the page's list was meant generally. The piece's trials will speak to it once the remake scores resonance on its own line.

## The face as a whole

It makes the idea felt. It is a lot of machinery, but the machinery goes somewhere: you hear the card, move one knob of each kind, watch two meters fail to agree with the split, and end on the only judge the page names, an ear, with a rule written first and both arms scored. Its best find is real and small. On the card's own bar, a taste move and the card's A/B are the same sound to every number. That is a teaching problem for a catalog whose lesson is the split. The remake is mostly about faithfulness: the page's resonance word, step 3's wrong mechanism, and calling the maker's rule the project's meter. None of it needs a new piece.
