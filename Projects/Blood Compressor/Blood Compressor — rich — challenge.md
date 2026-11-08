---
title: "Blood Compressor — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Blood Compressor]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of Blood Compressor's proposed rich face, piece by piece and offer by offer, with the numbers re-run on the plugin's own engine, so Loudon can take or leave each one knowing which parts held when someone else pushed on them."
---

# Challenge: Blood Compressor's rich face, proposal round 2026-11-03

I read this against the page as it stands in the worktree (`Projects/Blood Compressor.md`), the manifest, every piece's source, the steward's tuning ledger (`Blood Compressor — tuning.md`), and the maker's commit body (75a7b8d6). I didn't make any of this. Verdicts: **6 keep, 0 remake, 0 retire.** One thing the maker saw but didn't file belongs in the offers list, and I couldn't write it there myself: see § The bundle offer.

## The pieces

### Set attack to zero · `Blood Compressor — rich — attack floor.html` (made, Pedagogical Framing). **Keep**

1. **Test or decoration?** It's a test. Step 4 renders the sentence's claim ("set attack=0 and feel the compressor lunge … instant clamping") on the plugin's own engine and measures the kick's first 5 ms. If the build could lunge, take B would close in that window. It doesn't (+0.1 dB), so the test comes out against the text.
2. **Faithful?** Yes. It quotes the sentence whole, says plainly that take C is "not this compressor", and leaves "whether the floor sounds like a lunge" to the ear. One small blur: step 3 says the 5 ms knob floor is what "the DSP section says so too". But DSP item 3 ties "cannot be set to 0" to a nerve-conduction *delay*, not to an attack minimum. That is offer 3's own point, and the piece separates the two everywhere else (table columns "reflex" and "nerve", the equation). A note, not a fault.
3. **Walks up?** Yes. One kick alone, then notice-then-act at 200 ms, then the knob swept to its floor, then the test, answered before it's heard. One thing to notice per step. The step list stays open.
4. **Runs clean?** Yes. There is no AudioContext before the click. Play before answering refuses and asks for the answer. Changing step stops the sound. On a simulated hide the context went `suspended`. Every matched take peaks at or under −1 dBFS (worst −5.3). It needs nothing from its host and declares nothing. No samples are used: the loop is sine and seeded noise.
5. **Note for the maker (taste, not a remake).** Take C turns off two things at once, so it can't say which one stops the lunge. I split them on the engine: the nerve alone decides the first 5 ms, and the floor decides how hard it closes after (table under § Offers, offer 3). A fifth take, "floor off, nerve kept", would make the piece's best point audible. Also, step 2 already says "nothing happens for 5 ms", so the step-4 question about "the first 5 ms" mostly asks the reader to repeat step 2. Asking the sentence's own question ("does the floor clamp at once?") would put more weight on the guess.

### The stressed body · `Blood Compressor — rich — the stressed body.html` (made, DSP Architecture). **Keep**

1. **Test or decoration?** It's a test, and it came out against the text. The sympathetic bullet promises that a raised threshold plus a quicker release "compresses more aggressively". The piece takes each move alone (the line, then the muscle) and then both together. They squeeze less than rest at every rise from 0 to 12 dB.
2. **Faithful?** Yes. The as-written take moves only what the page names (threshold up, release down) and leaves the plugin's attack quickening out. The piece says outright that "the page names no amounts" and that ÷4 and 12 dB are the plugin's numbers. I checked the other reading of "aggressive": density, a lower peak-to-average ratio, rather than depth of squeeze. It doesn't rescue the sentence. On this compressor, squeezing *raises* the crest (dry loop 14.5 dB). As-written has the crest nearest dry (17.1), rest 20.0, as-built 24.6. So by either measure, the as-written body is the gentlest.
3. **Walks up?** Yes: rest, then the line alone, then the muscle alone, then the two combined against each other, answered before heard.
4. **Runs clean?** Same as the attack piece: no context before the click, suspended on hide, worst matched peak −8.4 dBFS.

### The vessel, across · `stage2-vessel-prototype-v3.html` (gathered, Interface Mythology). **Keep**

This is the cross-section the section describes, as the steward built it. Gathered, so it's a record, not a walk. On its own it mostly illustrates the section. The caption is what makes it read against the text: it names where the build departs. I checked those claims in the source. The sliders are `th ra kn at re` plus `ig mk`, so five of the page's six controls with no sidechain, plus input and makeup. The source is a 72 bpm lub-dub (line 79). There is no heart icon anywhere in the file. The caption is honest, and the section is about an interface, so showing the built interface is right.

### The plugin's face · `blood-compressor-face.html` (gathered, Interface Mythology). **Keep**

The caption says straight out that this is *not* the section's cross-section: you look down the artery from inside. That's a departure from the text, and the caption names it rather than hiding it. Its one console line, the `window.__JUCE__` placeholder warning, is expected outside a plugin host.

### The body take · `rich-face/blood-compressor-body-take.wav` (gathered, DSP Architecture). **Keep**

The caption's numbers match `plugin/out/body-take.json` row for row (−9.2/−13.3, −15.2/−23.4, −10.7/−15.5, −9.3/−14.7; swing 2.5 against 0.3). Its settings match `plugin/check/render_body.py` (lines 3–5, 46). The copy is byte-identical to the steward's render in the owner's bundle (sha1 b865dbf2…). Nobody has heard it, and the caption says so.

### The attack lesson · `rich-face/blood-compressor-attack-lesson.wav` (gathered, Pedagogical Framing). **Keep**

The copy is byte-identical to the steward's render (sha1 e970005c…). The caption's claim about `render_take.py` is true; see the bundle offer below. Nobody has heard it.

**On both takes:** together they put 7.6 MB into git history for good once landed (`_ops/rich-face/README.md` § Media a face plays: "Choose with care"). They are the plugin's real C++ renders of exactly what these two sections describe, so they earn a place. Still, nobody has heard either one. If Loudon wants to hear them before they become permanent, landing is the moment to ask.

## The bundle offer the maker saw and didn't file

The maker's commit body says `plugin/check/render_take.py`'s notes claim the floor clamps the kick's front, and that the check measures it doesn't. **That's real**, and it should be an offer with section `→ bundle`, not just a line in the commit body. The docstring disagrees with itself. Lines 7–8 say that at the 5 ms floor "the kick's front is clamped with the rest, and the beat goes flat". Lines 16–17 say "the 5 ms nerve delay means the front of every hit has passed before the vessel closes". The engine sides with lines 16–17: from rest the wall first moves at 5.17 ms, and in the loop it moves +0.12 dB in a kick's first 5 ms. The same offer should cover `plugin/README.md:97–100`. That passage, like tuning item 2, takes the crest rising (14.7 → 26.3 dB) as evidence that the front gets through. The crest rises with no nerve too (below), so the README's conclusion holds but its evidence doesn't. Suggested wording for the maker to add: *"→ bundle, no-claim-edit: render_take.py lines 7–8 say the floor clamps the kick's front; lines 16–17 and the engine say it passes (wall first moves 5.17 ms after the hit). Change 7–8 to 'the front passes, then the boom is clamped and the beat goes flat'. plugin/README.md 97–100: keep the conclusion, drop the crest as its evidence, since crest rises with no nerve as well."* I didn't write it into the manifest, because the brief lets a challenger change nothing but the verdicts.

## The checks I ran

- **`check.mjs`** (2 min 46 s): **all PASS**, 23 claims. Both pieces' `bc-core` engine is the plugin's, max difference 0 at four settings. I also diffed the two pieces' `bc-core` blocks against each other: identical.
- **My own recompute**, straight on `plugin/ui/blood_compressor.js`, not the pieces' copy. I loaded it as text and turned off the floor and the nerve by editing the text myself. The loop is the piece's `drums()`.
- **`conform.mjs "Blood Compressor"`**: 4 pages, errors 0, **warnings 0**, browser at 760 and 1130 px. The maker's four file-local warnings cleared on commit, as the maker said they would.
- **`fingerprint.mjs`**: Interface Mythology, DSP Architecture and Pedagogical Framing all **in step**.
- **The face, headless** (`rich-server.mjs --root <worktree>`): 4 frames; 6 proposal chips; the head reads "3 sections made in a proposal round, not yet approved by Loudon · 3 offers for the text"; both strips resolve, with no labelled boxes. **Console: one line**, the JUCE placeholder warning from the gathered face, and nothing else. I walked each made piece to step 4: no context before the click, play refused before the answer, the verdict rendered with the numbers below, context `running` after Play and `suspended` after a top-down hide.
- **The `.md`**: untouched by the maker's commit (the stat lists six files, none of them the entry).

## Offers

**Offer 1 (Pedagogical Framing, claim-change). Confirmed, with one addition.**

| on the plugin's engine, threshold −36, ratio 10, the loop | first 5 ms of a kick | by 10 ms | crest |
|---|---|---|---|
| as it arrives | — | — | 14.5 |
| attack asked 0 (= the floor, max difference 0; asking for 1 ms gives the same) | +0.12 | −8.38 | 25.3 |
| no floor, no nerve | −16.85 | −19.03 | 27.7 |
| 200 ms | +0.10 | −0.24 | 19.1 |

So "set attack=0 and feel it lunge" describes something the build can't do, and the crest can't serve as evidence. I looked at why. The loop's loudest input sample sits 0.5 ms into the kick at 2.4 s. With no floor and no nerve, the gain at that sample is already −18.9 dB. The output peak then moves to the kick's first sample, at the pre-closed −8.0 dB. The crest rises because the squeeze lowers the average, not because the front got through.

**The addition:** the rewrite should also drop "what the body would do without baroreceptors". Without baroreceptors the body doesn't clamp at once. It loses its buffering, so pressure swings wider: sinoaortic denervation leaves blood pressure *more* variable (PMC3737155; Scherrer et al., PMC329818, on how strongly the baroreflex buffers). Losing the baroreceptors is closer to bypass than to a hard clamp. I'm going on the search abstracts here and didn't read the papers whole, so treat this as a flag, not a finding. Tuning item 2's proposed words already leave the clause out.

**Offer 2 (DSP Architecture, claim-change). Sign confirmed. The page says "raises" (`Blood Compressor.md:81`) and means "compresses more aggressively".** The line alone squeezes less as it rises (−42: −17.5 … −30: −9.2 … −18: −2.6 dB average), and lowering it squeezes more (−6 dB: −13.3, −12 dB: −17.5). As written, it squeezes less than rest at every rise: +0 −6.6/−12.8, +12 −1.4/−5.3, against rest −9.2/−13.2. The plugin's knob, which drops the line 12 dB, gives −15.1/−23.3.

**The refinement:** "raises" may not be a slip. Under exercise and stress, the real baroreflex resets to operate around a *higher* pressure (PMC5559464, PMC5418217), while sympathetic vasoconstriction squeezes harder directly. So the bullet may hold two true things from the body that a compressor with one threshold can't hold at once. The plugin chose the squeeze, as the scroll says (`Blood Compressor — scroll.md:119`). Rather than just switching to "lowers", the rewrite could keep the contradiction: the body raises its set point, and the knob drops the line because it means *more squeeze*. Loudon's call.

**Offer 3 (DSP Architecture, no-claim-edit). Confirmed, and the engine shows the two floors do different jobs.** In the plugin source, `atk = Math.max(0.005, …)` (`plugin/ui/blood_compressor.js:48`) and `d = floor(sr·0.005 + 0.5)` = 221 samples (line 25) are two separate 5 ms floors. From rest, the wall first moves at **5.17 ms**. Each floor turned off on its own, attack 0:

| | first 5 ms | by 10 ms |
|---|---|---|
| both on (the plugin) | +0.12 | −8.38 |
| floor off, nerve on | +0.13 | −16.73 |
| nerve off, floor on | −8.50 | −14.69 |
| both off | −16.85 | −19.03 |

The nerve decides the first 5 ms, and the floor decides how hard the vessel closes after. This matters for the tuning ledger too (below). Since the change names two mechanisms where the page names one, it is close to a claim-change. Labelling it no-claim-edit is defensible, because the page's "~5 ms" and "cannot be set to 0" both stay true.

**Against the steward's tuning ledger:**

- **Offer 1 refines item 2.** The substance matches: no lunge, the front passes, the boom is clamped. Item 2's proposed words are close to the measurement ("at 5 ms the vessel clamps the body of the hit as soon as it can"). But offer 1 contradicts the evidence item 2 rests on, the crest rising 14.7 → 26.3. Item 2's numbers come from the plugin check's loop and the C++ render (`plugin/README.md:97–99`), not this loop. They disagree with the piece's 14.5/25.3 only because the loop differs. The inference from them is what fails.
- **Offer 2 duplicates item 5** on the sympathetic bullet, adds the measurement on the page's own wording, and names item 5 as the other route. It doesn't cover item 5's HRV and vessel-age bullets.
- **Offer 3 contradicts item 5's wording** in one phrase: "the reflex quickens (up to twice as fast, never under the 5 ms nerve floor)". The reflex's floor is the attack minimum, not the nerve. Item 5 merges the two floors that offer 3 separates. If item 5 is taken, change "nerve floor" to "5 ms floor".

**Seen, not offered (already on the trail):** DSP item 1's "RMS over a 50-sample window" isn't what the build runs. The engine uses an exponential detector with a 10 ms default (`plugin/ui/blood_compressor.js:40`). The steward proposed that change in cycle 7 (`Blood Compressor — scroll.md:343–346`), so it isn't this face's to carry.

## The face as a whole

It makes the page's idea felt, and it pushes back. Both made pieces run the plugin's own compressor, held to it sample for sample. Both walk up to a test the text could have passed, and both come out against the text. That is the face doing its proper job, not decoration. The gathered pieces put what the page imagines (a vessel, a face, a lesson) next to what got built, and the captions name where the two differ. What it can't do yet is let anyone hear the claim: no agent has heard a note of it, and nobody has listened to the two takes. Whether the floor "lunges" in the ear is still the open question, and the face puts it in front of Loudon rather than answering it for him.
