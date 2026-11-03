---
title: "Boundary-Crossing Instruments — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Boundary-Crossing Instruments]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of this page's first rich face: the delay dial kept, the compressor walk sent back once for two honest sentences, both offers rechecked against numbers I worked myself, and the first offer traced to where its mis-order really lives, so Loudon can approve or revise without redoing the sums."
---

# Challenge — Boundary-Crossing Instruments, rich face, proposal round

Challenger: claude-opus-5-5, 2026-11-03. Maker's commit `990cb3dd`. The `.md` is untouched by that commit (`git diff 990cb3dd~1 990cb3dd -- "Boundary-Crossing Instruments.md"` is empty).

## The verdicts

**One delay, six worlds** (gathered, `Projects/Frequency-Time Duality/proofs/2026-05-04-delay-time-axis-v2.html`, Origin) — **keep.**

1. *Test or decoration?* Half a test. The paragraph claims one dial, repeat rate, gives several perceptual worlds. Sweeping the delay from 5 s to 0.5 ms lets an ear check that, and it could fail: if the repeats never turned into a pitch, the claim would be wrong. What weakens it is that the proof writes the zone name under the slider as you drag, so it tells the ear what it should be hearing. The caption says so and points to Dissolutions' blind glide for the version that doesn't.
2. *Faithful?* Close, not exact. The proof has six zones, pitch, comb/flutter, flutter echo, slapback (80–150 ms), distinct echo (150–800 ms), rhythmic pulse (0.8–5 s). The page lists five: pitch, echo, slapback, rhythm, sub-rhythmic pulse. The proof stops at 5 s, so "sub-rhythmic pulse" is never on its dial. Frequency-Time Duality's own face already says of this same proof that "its six names and edges are its own, not the text's". This caption doesn't say that, and it should.
3. *Walks up?* One dial, one concept. Nothing to walk up to, and no proof met cold.

Note for the maker (taste, not a remake): add one clause to the caption that the six names are the sketch's, not the page's five, and that the page's last world lies past its 5 s end. The static text in the proof's header has workshop notes in it ("v2 redirect … per project doc"), and its pitch blurb says "below ~20ms" against a 10 ms edge. It is a gathered record, so those stand.

**One compressor, two knobs** (made, `Boundary-Crossing Instruments — rich — ratio and slope.html`, Origin) — **remake.**

1. *Test or decoration?* A test, and the right one. The section says the wall at infinite ratio is in the representation, not the phenomenon. Step 3 shows the wall in the number: a ratio knob spends 78% of its travel on 0.96 dB. Step 5 shows it in the walk: a linear ratio mix toward ∞ is already at ∞ after the slider's first step. Step 6 asks whether the phenomenon has a wall. Played blind, is 20:1 to ∞:1 a bigger step than 10:1 to 20:1? If the ear heard a cliff at ∞, the page would be wrong about the phenomenon. Few pieces this round can come out against their text the way this one could.
2. *Faithful?* The numbers are, and I reworked them below. Two sentences are not.
   - **The reveal names a ruler the answers don't support.** Its rule (`a[3] === a[2]` → "Your ear used the slope's ruler") only compares 20/∞ with 10/20. I ran the test headless and rated all five pairs "barely", the 4:1 / 4:1 check included. The reveal said "Your ear used the slope's ruler" and then, separately, that I had heard a difference in the same-same pair. Flat answers prove nothing. And two pairs both rated "the same" mean the reader heard neither step, which supports the page (no wall to hear) but is not "the slope's ruler".
   - **Step 3 says the ratio knob, "like most hardware", gets a notch at the end.** That claim is unverified, and well-known hardware goes against it. On the dbx 160X (and the 160A before it), the ratio control is continuously variable from 1:1 through ∞:1 to −1:1, the region dbx calls "Infinity+". That is a slope knob with ratio labels: −1:1 is slope −1, and the knob passes through ∞ as though nothing were there. It is the page's own claim, built in steel.
3. *Walks up?* Yes. Wire, threshold and ratio, the ratio knob's last stretch, the slope knob, the morph, and the test last. Each step has one thing to notice. The rail stays open, a step change stops the sound, and the AudioContext is only made on Play. Step 4 holds two ideas, the slope knob and decibel against linear axes, but the second is a "try". That's fine.

**The remake, exactly:**
- (a) Rewrite the reveal's verdict in `reveal()`. Name the slope's ruler only when three things hold: the check pair was "the same", 1:1 / 2:1 was rated above 20:1 / ∞:1, and 20:1 / ∞:1 sits within one step of 10:1 / 20:1. If 20/∞ and 10/20 were both "the same", say the reader heard neither step, so there was no wall at ∞ to hear. If the answers are flat or the check failed, say the answers don't pick a ruler and offer the reshuffle. Keep the table as it is.
- (b) In step 3's `say`, drop "like most hardware". Say this knob was given a notch, and add a line that some hardware took the other road: the dbx 160's ratio control runs through ∞:1 to negative ratios, a slope knob under ratio's labels. Or drop the hardware claim entirely.

Everything else stands: the check (20 PASS), the instant-attack detector, loudness matching, and the caption. One note on the caption: it gives the crest numbers "at 48 kHz", and that is honest. On a 44.1 kHz device the reveal shows 0.52 and 0.50 dB, which is what I got headless.

## Three-Layer Interface, and whether one piece is enough

Leaving Three-Layer Interface without a piece was right. Its claim is a design principle and a songline analogy. A three-panel view would only label the three layers. The made piece already is the three layers in practice: Hear (musical), ratio, threshold and knee (technical), and the curve with its equation written in symbols and in words (mathematical), all read off one curve. A piece that tested the section would have to ask whether the musical words ("gentle" to "limiting") land evenly on slope. That is a later round's question, and the blind test already leans toward it.

One made piece on a sketch face is enough to ship once the remake lands. The page's central claim is in Origin's second paragraph, and that is where the piece sits. The Deeper Principle generalises the same claim and has nothing of its own to test. Cross-Pillar Connections and Open Questions have nothing to play. Depth over coverage.

## Checks run

- `conform.mjs "Boundary-Crossing Instruments"`: 2 pages, both introduced, errors 0, warnings 0, browser pass at 760 and 1130 px clean. The gathered proof shows "nothing · flow (manifest; owed)". That is the empty `contract` the manifest speaks for it, not a fault.
- `fingerprint.mjs`: Origin `843a40e80fc5`, 2 pieces, in step.
- The piece's own check, `… — ratio and slope — check.mjs`: all PASS (20).
- `rich-server.mjs --root <worktree> --detach`, `?entry=Boundary-Crossing Instruments`, headless Chromium at 1300 px, scrolled through. Console clean, no page errors. **Both pieces reported their height through the kit:** the proof 777 px, the made piece 1517 px, `_heard` true on both, no "reported no height" note. Kuramoto Coupling's face, loaded the same way, had all five frames report. So the maker's "every face shows reported no height" is not these pieces and not the kit as served. It is whatever headless preview the round used. I'd call that a round-level finding about the preview tool (a piece origin it can't reach, or messages it never passes on), not something to fix in a piece. Unchecked: which preview the maker used.
- The piece opened on its own (`file://`), all six steps walked and the test run to the reveal. The worklet won't load from a `file://` Blob in headless Chromium ("Unable to load a worklet's module"). That only happens on `file://`: conform's browser pass loads it from the piece origin, and it's clean there. The meter text matched the check at every step.
- Hush on a hidden page: the kit's job (README § Making pieces), so the piece needs no handler of its own. I didn't run `check-hidden-hush.mjs`, which covers the whole kit. Sound starts only on a click. Every file is tracked in the maker's commit. Nothing licensed: the loop is made from seeded noise and sines.
- Not checked: anything heard. I can't hear the mix.

## Recomputed

I worked these from the hard-knee transfer y = T + (x − T) ÷ R in dB. That formula is the piece's own, not the page's: the `.md` writes no equation. The loudest hit is 24 dB over T, so it comes out 24 ÷ R over.

- **Ratio knob, linear taper 1 to 100, ∞ notch in the last 3%:** 20:1 sits at p = (19/99) × 0.97 = 0.186, so 20:1 to 100:1 is 0.970 − 0.186 = **0.784 of the travel**. It moves the hit 24/20 − 24/100 = **0.96 dB**, and the notch jumps **0.24 dB**. On a log taper, 20:1 sits at p = 0.97 × log 20 / log 100 = 0.631, so the same stretch is **0.339**. Confirmed, with one note. The 78% depends on the taper the maker chose, which the caption names. The real point is in step 4: R = 1 ÷ (1 − p) does reach ∞ at the end of the knob, and that taper *is* the slope knob.
- **Slope knob:** 24 dB × 1% = **0.24 dB per 1%**, constant. Confirmed.
- **Linear-axes slope at 4:1:** on linear amplitude axes, d(out)/d(in) = s × 10^((s − 1) × over / 20). At 6 dB over that is 0.25 × 10^(−0.225) = **0.149**, and at 24 dB over it is 0.25 × 10^(−0.9) = **0.031**. Confirmed. At the two ends the linear slope is also 1 (1:1) and 0 (∞:1), so the end-to-end continuity holds on either axis. Only on decibel axes is the slope one number between the ends.
- **Morph:** R(m) = 2 + m(∞ − 2) is ∞ for every m > 0. The 0.1% is just the slider's first step (step 0.001), and the code guards m = 0 against 0 × ∞ = NaN. Confirmed. Note that the ratio walk is a straight mix of ratios, and the piece writes that out in its equation, so it isn't a straw man in disguise. Toward 20:1 instead: the ratio walk's halfway is 11:1, which leaves the hit 2.18 dB over. The slope walk's halfway is 3.64:1, which leaves it 6.60 dB over, exactly halfway between the ends, 12.00 and 1.20. Confirmed.
- **The blind test as a test:** the design is sound. The order and the A/B sides are shuffled, the curve and the loop's waveform are hidden, the meter is blank, and loudness is matched by RMS from the same engine. The five pairs separate three rulers. Linear ratio distance is 1, 2, 10, ∞, 0. Log ratio is 1, 1, 1, ∞, 0. Slope is 0.50, 0.25, 0.05, 0.05, 0. Only slope calls 10/20 and 20/∞ equal, and that is the comparison the reveal turns on. The same-same pair is a fair check against a reader who hears differences that aren't there. 1/2 (3.31 dB crest change) is the positive control. The weakness is the inference, not the design: one rating per pair on a four-point scale, and a reveal that names a ruler from a single tie. That is remake (a).
- **Crest change tracks slope distance:** 3.31 > 2.18 > 0.54 ≈ 0.55 dB at 48 kHz (0.50 and 0.52 at 44.1 kHz). Confirmed in rank order, not in proportion: 6.6, 8.7 and 10.8 dB per unit of slope. That is partly built in, since the curve's output overshoot is 24·s by construction. Only the ear's answer can come out against the page, and that is why the reveal has to be honest.

## The offers

**Offer 1, Origin, no-claim-edit, order of worlds.** *Real in substance, wrong in where it sends you.* On the axis, slapback (the proof's 80–150 ms; Frequency-Time Duality's Echo Walk has slapback at 100 ms, below rhythmic echo at 200–500 ms) comes before distinct echo (150–800 ms). So "pitch, slapback, echo, rhythm, sub-rhythmic pulse" is the axis order. But this page's order is copied from Frequency-Time Duality's own continuum list (`Projects/Frequency-Time Duality.md`, the list under "traveling from high to low frequency / short to long delay"). That list says it runs short to long, and it puts Distinct echo before Slapback and gives slapback "~30–120ms", not the proof's 80–150. The text wins over the proof, so the offer shouldn't cite the proof's edges as its authority. And on this page "echo" might be read as flutter echo (30–80 ms), and on that reading the page's order holds. Recommend: take the offer, but carry it to Frequency-Time Duality's list as well, where the mis-order starts. If only this page is changed, the two pages will disagree. The 30–120 against 80–150 slapback edge is a second, separate question for that page.

**Offer 2, Origin, no-claim-edit, "in decibels".** *Confirmed.* 0.149 and 0.031 against 0.25, as worked above. It changes no claim. The page's 1.0-to-0.0 ends are true on either axis, and "in decibels" only says why the slope between them is one number. I agree it is a no-claim edit.

**A lead, not an offer.** The dbx 160X's "Infinity+" ratio control (1:1 → ∞:1 → −1:1, continuously variable) is hardware that made the slope reframing decades before the soft-knee work. It answers the page's first open question from outside the palace. If Loudon wants it on the page, it is a claim-change and goes through the Deposit map. I haven't added it to the manifest's offers. Sources: [dbx 160X manual (technicalaudio.com)](https://www.technicalaudio.com/pdf/dbx/dbx_160x.pdf), [dbx 160X/XT manual (manuals.plus)](https://manuals.plus/dbx/160x-compressor-and-limiter-manual).

## The face as a whole

It makes the page's idea felt, not just busy. With one dial from 2024 and one compressor from the soft-knee work, the face puts the page's two instances of the pattern side by side at the paragraphs that name them. The compressor walk does what the page only asserts: you drag a knob into a wall, then drag a different knob across the same ground and find no wall. Then the blind test asks your ear whether there was one, and you only find out what you were listening for afterwards. That is a hilaritas shape: a real thing to make, a tool that extends, a cross-domain moment, a question at the end. The remake is small and about honesty, not design. Once the reveal stops telling a reader with flat answers which ruler their ear used, the piece is the best argument the page has.
