---
title: "Bayesian Granular Synthesizer — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Bayesian Granular Synthesizer]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Bayesian Granular Synthesizer's first rich face: every piece judged for whether it tests its section, stays true to it and walks up to it, the four offers recomputed on the engine with my own code, so the next round and Loudon start from numbers and reasons, not from the maker's say-so."
---

# Bayesian Granular Synthesizer — rich — challenge

Proposal round of Enrichment v2.8, 2026-11-03. Judged from the page (`Projects/Bayesian Granular Synthesizer.md`), the manifest, every piece and its source, with the maker's commit `54454b34` as its only account. Challenger: claude-opus-5-5.

## Is the engine the page's model?

Yes, and the page says so itself. The Artifact section (`Bayesian Granular Synthesizer.md:87`) names `bayes_engine.js` as the reconstruction from this entry's spec that runs the render and the playable page. Line by line against the spec:

- uniform prior over A1–C7 (engine `prior.fill(1)`); a Gaussian bump per held note in log-frequency; weight and width moving by exponential time constants, fast attack and slow release; posterior as "the sum of prior and evidence bumps, normalized" (`.md:48`, engine `posterior()` at `bayes_engine.js:103`); width to a 5-cent floor; length 4 to 128 cycles by closeness times the evidence gate; 1-cycle Hann fades either side of N cycles; onsets Poisson (`bayes_engine.js:186`).
- One small departure, disclosed by the grain-spec piece: amplitude is √(f ⁄ (N + 1)), not √(f ⁄ N) (`bayes_engine.js:150`). The fades' true weight is 0.75 of a cycle, so a 4-cycle grain sits 0.2 dB under a 128-cycle one. The piece names this and folds it into its numbers.
- The choices the spec leaves open (doubt 0.25, τ 80 ms / 1.4 s / 1.6 s / 0.7 s, "near" 35 cents, 160 grains/s) are the engine's. They set some numbers below. The LLN mean depends on doubt and on the prior's middle, for example. The pieces print them, so a reader can see what they rest on.

All three made pieces carry the engine as `<script id="bgs-engine">`, and the maker's checks confirm it is the `ENGINE` block byte for byte. The lab adds only switches: a forced length, a flat amplitude and a grain log. I read the `Variant.spawn()` override against the engine's own, and it matches except for the amplitude switch and the log line. The live sound in piece 1 builds its worklet from that same script tag.

A note for Loudon, not an offer: the page's "posterior" is a **mixture**. It is the prior plus the bumps, renormalized, not prior × likelihood. Under Bayes' rule a flat prior times a Gaussian likelihood is just the Gaussian, and the doubt would vanish. Summing is what keeps the clicks alive, and it is also why the average pitch is pulled toward the range's middle in offer 1. The engine is faithful to the page's own definition. Whether "posterior" is the right word for it is a question about the page, not this face.

## The pieces

### Bayesian Granular Synthesizer (opening)

**chord-belief.png — keep.** Gathered. It is the engine's posterior every 50 ms through `render_chord_belief.js`. I checked the caption's sequence against that script's `EVENTS` (C E G at 4 s, G off and A on at 14 s, release at 22 s, the painted pentatonic prior at 28 s, low A and E at 34 s), and it matches. It illustrates rather than tests, which suits the opening paragraph. The caption is honest that V8 was never recovered.

**chord-belief.wav — keep.** The same take, heard. Tracked, made by the palace, nothing licensed.

### The mechanism

**Bayesian Granular Synthesizer — rich — prior to belief.html — keep.**
- *Test or decoration?* A test. Step 5 renders the same seed three ways (coupled, every grain 4 cycles, every grain 128) and measures how much of the sound lands within 25 cents of C E G. If the coupling did nothing, coupled and all-short would agree. They don't: 85.7% against 13.6%. The verdict line is computed and can say "The claim does not hold as rendered."
- *Faithful?* Yes. Every number on the steps (one grain in five from the prior at doubt 0.25, 4.6 s to come within a cent of the floor, ±151 and ±5.8 cents of a grain's own spread) re-runs, and none adds a claim the section doesn't make. Its sharpest teaching, that a short grain can't carry a precise pitch, is held back as offer 4 and not written into the text.
- *Walks up?* Yes. The prior alone; one note and doubt, with lengths held short on purpose; weight and width over time; length follows belief, with a switch back to step 3; then the test. The rail is open, sound starts only on a click (0 AudioContexts before the first click, headless), and changing step stops it.
- *A note, not a condition.* The test has teeth in the all-short arm. The all-long arm puts the same share of the sound on the chord (85.6%), so what separates it from coupled is "the doubt's grains ring 128 cycles", and that is true by construction: the median length is whatever the switch set. Off-chord energy is about the same in both (about 14%), because equal energy makes a doubt grain weigh the same short or long. The difference is that all-long concentrates that 14% on wrong pitches and coupled smears it into clicks. A spectral-flatness or peak count on the off-chord band would turn "ring as wrong notes" from definition into measurement. That is a taste call for a later round.

**belief-instrument.html — keep, with a note.** The steward's playable page from 2026-10-14, unchanged. It is the mechanism to play, not a test. It declares midi honestly (manifest contract). With no line for it in `_ops/rich-face/grants.json`, conform names `grant-missing`, and the browser logs one permissions-policy line. The page's `requestMIDIAccess().catch(() => {})` (`belief-instrument.html:329–334`) falls back to the computer keys with no script error. A remake can't cure this: the page is gathered and unchanged, and the cure is a grant line only Loudon can say yes to. Keep, with the grant waiting on his word.

**belief-helix-states.png — keep.** Gathered. The same belief drawn the plugin's way, a helix with one turn per octave. It illustrates, and the caption matches the scroll's account of the four moments.

### The grain spec

**Bayesian Granular Synthesizer — rich — equal energy.html — keep.**
- *Test or decoration?* A test. Step 3 holds A2 E4 C5 over the prior, renders the same seed with the rule and with one amplitude, level-matched while nothing is held, and asks whether each note's share of the energy follows its share of the grains. It could have failed.
- *Faithful?* Yes, and more careful than the text. It discloses the N + 1 count and says it measures energy, not loudness: to the ear the rule leaves a bass note a little under its share.
- *Walks up?* Yes. One grain on a power-against-duration plot, where the rule is a diagonal; the two extremes, A2 × 128 against C6 × 4 (×258, +24.1 dB with one amplitude; +0.2 dB with the rule); then the whole cloud.
- *What I found beside it, for the maker and Loudon.* The rule has two halves, and they do different jobs. With amplitude ∝ √f alone, A2 drops to its fair share (31.2%), but the cloud still jumps +14.1 dB when the chord comes in. With amplitude ∝ √(1 ⁄ (N + 1)) alone, the jump goes (+0.5 dB), but A2 still takes 58.0% of the energy. Seeds 31337 and 2024 tell the same story. So the page's "kills low-frequency rumble" is the √f half; the 13.7 dB the piece reports is the length half. A line in step 3 saying which half does which would sharpen the piece. It is a note, not a remake.

### The statistics underneath, tied to e

**Bayesian Granular Synthesizer — rich — one e, many grains.html — keep.**
- *Test or decoration?* Step 4 is a test. It measures the kurtosis of the output's sample values (the soft clip bypassed) where many grains overlap and where few do, and it could have come out near 3 for both. Steps 1–3 are the walk: gaps against λe^(−λt), the same e in the gaps and the envelopes, the LLN histogram.
- *Faithful?* Yes, and it is the piece that found three of the four offers. It doesn't change the page's words. It shows what each statistical name points at in the cloud and leaves the rewording to the offers. Step 2 is careful to say one e is a probability and the other a decay.
- *Walks up?* Yes. Four steps, an open rail, rendering only when the test step is reached, sound only on a click.
- *A note.* Step 1's default seed (12345) gives D = 0.0225 against a 5% line of 0.0237. That passes, but it is the closest of the six seeds I tried (0.0089 to 0.0225). The piece already says a fair test crosses the line one time in twenty.

### Forward Vectors

**belief-cloud-face.html — keep, with a note.** Gathered: the plugin face with the painted prior. Same midi situation as belief-instrument (grant-missing, one console policy line, plus a `window.__JUCE__` placeholder warning that is the template's own and harmless in a browser), and the same answer: Loudon's yes, not a remake. It serves the forward vector it sits under.

**rich-face/belief-cloud-take.wav — keep.** The C++ engine's own take, copied from the owner's ignored render and now tracked. Plugin output, not Splice. The caption's "within 1.1 dB" matches `plugin/out/take-levels.json` (RMS −19.8 to −20.9 dB across six moments).

**prior-tone-ab.png, prior-tone-A.wav, prior-tone-B.wav, prior-tone-C.wav — keep, each.** Gathered. A real A/B on the forward vector's open question (should a painted prior hum?). The captions' numbers (23% long, 52% long, up to 25 cents off) are the scroll's own (`Bayesian Granular Synthesizer — scroll.md:234, 254`).

## The offers, recomputed

I wrote my own harness against `bayes_engine.js` itself (`require`d, not the pieces' lab), with my own subclass, FFT and estimators, and ran it across seeds as well as the maker's.

**1 · LLN (claim-change) — confirmed. The page's sentence is wrong, not just unconditioned.** Posterior mean for C3 E4 G4 at full belief: 60.038 analytically, 60.051 from 200,000 of the engine's own draws. The maker has 60.04 and 60.05: C4, which nobody holds. Even one held note doesn't pull the average onto itself. C4 alone gives 60.90 predicted and 60.94 drawn, pulled sharp by the doubt toward the prior's middle, 64.5. C4 E4 G4 gives 63.73, between E♭ and E. So "the cloud's average pitch converges on the held chord" (`.md:65`) is false for any chord and any doubt above zero. The LLN is the right theorem aimed at the wrong quantity. What converges on the belief is each semitone's share of the grains. Over three seeds my distance fell from 0.09–0.38 at 10 grains to 0.010 at 100,000. The maker reaches 0.004 with an exact (Φ) prediction, where mine is the grid-sampled posterior, which carries a small bias of its own. The maker's suggested rewording is right.

**2 · The exponential (no-claim-edit) — confirmed. The parenthetical is a mislabel; the next sentence already has it right.** KS distance of onset gaps against e^(−160t) over 20 s: seed 12345 gives D 0.0225 against a line of 0.0237 (3,288 gaps), matching the maker exactly. Five more seeds give 0.0089 to 0.0204, all under. The release envelope matches e^(−t ⁄ 1.4 s) to 1.2e-14. It is deterministic, a decay, with nothing random in it. The page files the time constants under "the exponential distribution" (`.md:65`), but its own next sentence speaks of the exponential "in *both* the grain-density statistics and the evidence envelopes", which is the right split. "No-claim-edit" is the right kind: the fix brings the parenthetical in line with the sentence after it. The maker also notes, in the checks file, that at 400 grains/s over 60 s the whole-sample onsets begin to show (D 0.0111 against 0.0087). That is true, outside the page's range, and the piece is honest about it.

**3 · CLT (claim-change) — confirmed. The sentence is unconditioned, not wrong.** Kurtosis of the summed output, soft clip bypassed: C E G believed 2.95 (about 56 at once), nothing held 4.49 (about 4.5), C E G all short 3.65 (about 3.4). Seeds 777 and 4242 give 2.89 and 3.00 believed, 4.32 and 4.54 nothing held, and 3.79 and 3.70 all short. With the engine's own tanh at volume 0.8 left in, the numbers barely move (2.86 and 4.29). "Tend Gaussian" (`.md:65`) is what the CLT says in the limit, and the clicky cloud is far from that limit. The condition belongs in the sentence. I would call this offer an added condition rather than a change of claim, but the kind is the maker's call and Loudon's.

**4 · Coupling makes the sharpening audible (claim-change, an addition) — confirmed.** I used a single 4-second Hann periodogram, a different estimator from the maker's Welch. Seed 12345: grains within 25 cents 92.4% in all three takes; sound there coupled 86.6%, all short 14.4%, all long 85.9% (maker: 85.7, 13.6, 85.6). Seed 999: 91.7% of grains; 83.8%, 12.8%, 84.0%. The grain-width arithmetic holds too. A 4-cycle grain plus fades spreads about ±151 cents at half power at C4, and a 128-cycle grain about ±5.8, which meets the 5-cent floor of the belief. The page doesn't say this, so it is an addition, not a correction. It is also the face's best find: the length coupling is not decoration on the Bayesian idea, it is what lets the belief be heard at all.

**The equal-energy numbers (a piece's claims, not an offer) — confirmed exactly** with my own Welch on seed 12345: rule A2 29.7%, chord jump +0.7 dB; one amplitude A2 61.7%, +13.7 dB. Other seeds put the one-amplitude A2 share at 63.7% and 67.8%, and the jump at 13.6 and 14.3 dB. The rule-side shares move by ±5 points with seed (E4 at 23.9% against a 30.3% grain share on seed 31337 under a single periodogram), so "within 6 points" is about at its edge. The headline doesn't move. The split between the rule's two halves is above.

## The checks I ran

- `node "Projects/Bayesian Granular Synthesizer/Bayesian Granular Synthesizer — proof — rich checks.mjs"`: **36 pass, 0 fail**. Every printed number matches the commit body.
- `node _ops/rich-face/conform.mjs "Bayesian Granular Synthesizer"`: 5 pages, introduced 3, errored 2. **Errors 2**, both `grant-missing` (midi) on the gathered belief-instrument.html and belief-cloud-face.html; **warnings 2**, both `sandbox-blocked` (the MIDI policy line). The three made pieces: 0 errors, 0 warnings.
- `node _ops/rich-face/fingerprint.mjs "Bayesian Granular Synthesizer"`: all five made-against sections **in step** (e43422562f37, 5dd0328a0462, ade8e8ccf581, 7981652a3bf5, b7e4569a81de).
- Rich server on the worktree, headless Chromium at 1130 px: every figure resolved, 13 `proposal · 2026-11-03` chips. Each made piece reached its test through its rail, rendered, and printed the numbers above. A play click started sound, Back stopped it, and no AudioContext existed before a click. **Console clean except** the two MIDI permission-policy lines and the template's `__JUCE__` placeholder warning. Server stopped.
- Tracking: every file the manifest names is tracked. None is ignored, and none is licensed material.
- My harness: `recompute.js` and `halves.js` in the session scratchpad, against `bayes_engine.js`, seeds 12345, 999, 777, 4242, 31337, 2024 and 1–5.
- Not verified: anything heard. I can't hear whether the coupled take sounds like condensation, or the balance of the A/Bs.

## The face as a whole

It makes the page's idea felt, and more than that, it makes it argued. The text says a chord is a hypothesis the cloud comes to believe. The face shows that the belief alone is nearly silent. 92% of the grains can sit on the chord while 86% of the sound is somewhere else, and only the page's own design move, length following belief, lets the cloud say what it believes. That is a cross-domain find in the palace's sense: time-frequency uncertainty deciding whether a Bayesian sharpening is audible. The three made pieces walk up honestly, test what they claim, and disclose their engine and its one departure. The statistics piece does what the section only gestures at: it points each statistical name at something countable, and it finds where two of them are aimed wrong. The gathered material is a lot, thirteen pieces in all, but every gathered item is the steward's own record of this instrument, with captions drawn from its scroll. The face is busy in the Forward Vectors section, not in the sections that teach. Nothing should be retired, and nothing needs a remake round. The notes above are for whoever builds the next round.
