---
title: "Ohm's Law — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Ohm's Law]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for the first round of Ohm's Law's rich face: every piece judged with a reason, every offer recomputed, so the next maker and Loudon can act without asking."
---

# Ohm's Law — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, fresh to this face. Judged against the page (`Ohm's Law.md`), the two pieces, the check, the gathered jsx, and the maker's commit body (449923c9) as its only account. The page's rooms are analogies, and I held that line: "the analogy breaks here" is a finding for the page; "the page is wrong" would be a stronger claim, and nothing below makes it.

**Tally: 1 keep, 1 remake, 0 retire.**

## Lock one · does the third always answer? — keep

Serves § The Lock Mechanism Pattern (`Ohm's Law.md:88-94`).

1. **Test or decoration?** A test. The section says "lock one variable → adjust another → third changes automatically" (`:91`). The piece asks whether that holds on the explorer's own sliders, which stop at 0.1 and 10, and measures how much it doesn't: the live share. It could come out otherwise: lock at 1 and the whole slider is live; widen the ends and the dead stretch shrinks. What it tests is the interface pattern, not the law, which is the right target for a section about the interface. As a test design, "does the third always answer?" has a yes/no that any bounded slider answers "no" for any lock away from 1, so the yes/no alone would be thin. The piece doesn't stop there: it gives the share (1 − |log₁₀ L| ÷ 2), shades it on each free slider, and puts the jsx's silent failure beside it. That measure is where the test earns its place.
2. **Faithful?** Yes. The mapping matches the jsx (`val(p) = 10^(2p−1)` against `sliderToValue`, jsx:13-19), radio locks, four decimals. "One gives, the other takes away" is the page's own closing line (`:109`), correctly placed on the V-locked pair, and the piece says plainly that with R or I locked the two free sliders move together, which sharpens the quote rather than smoothing it.
3. **Walks up?** Yes: one log slider alone, R locked (together), V locked (mirror, with the linear contrast), the whole explorer, then the test.

Notes, not remakes: (a) the piece chooses one fix, stop the driver at the band's edge, without saying it is a choice. The jsx lets the answer run off its slider; a third design would clamp the answer and break the equation. Naming the three on the test step would hand the design decision to the reader. (b) The offer's opening, "two degrees of freedom on paper, fewer on sliders with ends", is loose: the degrees stay two; the room shrinks. "The same two, with less room" says it.

## Four rooms · does the same equation hold in each? — remake

Serves § Cross-Domain Understanding (`Ohm's Law.md:40-72`).

1. **Test or decoration?** A real test for water, light and labour-as-force. The three moves (push × 2, resistance × 2, two in series) are ratio tests, so they don't depend on the arbitrary unit pairing of each room. That is the right design. Sound and labour-as-power are coded as V ÷ R (`sound()`, `labour(…,'power')`): they pass by construction. That is honest physics (p = ρc·u for a plane wave; rate = P ÷ (W·h)), but nothing in the piece could fail them. The piece should say so.
2. **Faithful?** It tests a stronger claim than the page's arrows. The page's light sentences, "Brighter source → more photons. Opaque medium → fewer photons" (`:59`), hold in every reading; what breaks is the proportion the heading implies. The labour row's "Applied force" (`:69`) is what the piece tests, and correctly reports. One number is misstated (below).
3. **Walks up?** Yes: one room per step, each with its own law beside Ohm's, the test last.

**What to fix, exactly:**
- **The opacity-5 sentence.** The test's closing readout (`four rooms.html:379`), the check's label (`check.mjs:104`) and the light offer all say "two filters of opacity 5 in series pass/leave 20%". Two filters of opacity 5 pass 1/25 = **4%** of the source. What is 20% is the *ratio*: the second filter cuts what passes to a fifth (20% → 4%), where a second equal resistor halves it. Write: "a second filter of opacity 5 cuts the light to a fifth (20% of the source down to 4%), where a second equal resistor halves it."
- **Same sentence, depth half.** "Doubling a thin filter leaves 81.9% of the light" reads as 81.9% of the source; it is 81.9% of what the filter passed before (e^−0.4 ÷ e^−0.2 = e^−0.2). Add "of what it passed before".
- **The water readout near the switch.** The regime is chosen by the laminar Reynolds number (≥ 2300), then the Blasius flow is shown with its own, lower Re. Right at the switch (3 mm bore, ≈ 2.7 kPa) the flow drops 25% and the meter reads "Reynolds number 1732 · turbulent". Between laminar Re 2300 and Blasius Re ≈ 4000 neither law is exact. Label that band "transitional, neither law exact", or choose the regime from the Re actually shown. The test's fast start (Blasius Re 4754) is inside Blasius's range and stands.
- **One line in the test step:** "Sound and labour-as-power are Ohm's law by their own physics, so they pass by construction. Water, light and labour-as-force are the rooms that could fail."

Note, not a remake: the labour-as-force "× 1.000" comes from the model holding the worker at 50 W, with any extra force unused. A force-limited worker lifting from rest gives × 1.73 (lift time ∝ 1 ÷ √(F − W); F − W goes from 10 N to 30 N). Neither is × 2, so the finding stands; the exact number is the model's.

## Checks run

- `conform.mjs "Ohm's Law"`: 2 pieces introduced, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `fingerprint.mjs "Ohm's Law"`: Cross-Domain Understanding 41b6aaa0ea13 and The Lock Mechanism Pattern 14cf5dd23aa7, both in step.
- `Ohm's Law — rich — check.mjs`: all PASS, 36 claims.
- Rich face served from the worktree (rich-server, port 8854), driven headless in Chromium at 1130 px through all five steps of both pieces, the sweep, the survey and the test run. Console clean, no page errors. Proposal chips show on both figures. The sweep readout: "V stops at 0.4000 … the gathered explorer, asked for V = 0.1000, reads I = 0.0250 with its I thumb pinned at the left end". Server stopped.
- Neither piece makes sound, so hush and time cap don't apply. `piece:needs` is empty in both. Every file is tracked; nothing licensed.
- My own recomputation (Python, independent of the piece's code), below.

## Offers

1. **Light (claim-change): confirmed, with one number disputed.** Beer–Lambert: doubling τ multiplies the light by e^−τ₀: from τ 0.2 it leaves 81.9%, from τ 2 it leaves 13.5%. (For the record: from τ 0.1 it would be 90.5%, from τ 1 36.8%. The maker's starts of 0.2 and 2 are the ones that give 81.9 and 13.5.) τ·e^−τ ≤ 1/e, so 1 ÷ τ and e^−τ never meet. **Disputed:** "two of opacity 5 pass 20%" should read "pass 4%; the second cuts to a fifth". The suggested page wording ("each layer passes the same fraction, so layers multiply where resistors add") is right and keeps light as the near-miss, which suits an analogy page.
2. **Labour (claim-change): confirmed.** The page reads the push as applied force (`:69`). A steady lift takes exactly the weight; more force doesn't buy proportionally more boxes. Read as power, rate = P ÷ (W·h): 50 W, 10 N, 1 m gives 5 a second, which is Ohm exactly. The × 1.000 is model-dependent (see the note above); the finding isn't.
3. **Water (claim-change): confirmed, with one correction to the brief.** Bore 2.526 mm, 1 mL/s, Re 503, laminar. Fast start: bore 3.778 mm; Blasius gives 14.13 mL/s against Ohm's 40, with Re 4754 (a laminar flow would have Re 13,454, which is why it switches). Doubling the push gives × 1.486, which is **2^(4/7)**, the Blasius smooth-pipe exponent, **not √2**. √2 (1.414) is fully rough turbulence, where the friction factor is constant. "About 3.4 times the pressure" is 2^1.75 = 3.364. The maker's numbers are right.
4. **Lock narrowing (claim-change): confirmed.** On a log slider of two decades, the third's range is the slider's range shifted by log₁₀ L. The overlap is 2 − |log₁₀ L| decades of 2, so the live share is 1 − |log₁₀ L| ÷ 2: 100, 84.9, 69.9, 50, 69.9, 50% at L = 1, 2, 4, 10, 0.25, 0.1. R at 4 leaves V from 0.4 to 10 (and I from 0.1 to 2.5). Wording note as above: same two degrees, less room.
5. **Interactive Learning Tool (no-claim-edit): both jsx faults confirmed from source.** With R locked at 4, `handleVoltageChange` (jsx:41-53) sets `currentSlider = valueToSlider(0.1 ÷ 4)` = −30.1 on a 0–100 range input; the readout prints `current.toFixed(4)` from state (jsx:95, :167) → "0.0250", while the browser pins the thumb at 0. The equation is arithmetically true (0.1 = 0.025 × 4); the fault is a value the slider can't show. The note (jsx:248-249): 0.25 → 0.1 is ÷2.5 and 4 → 10 is ×2.5, not ÷2/×2, and those last steps are 0.398 of a decade where the others are 0.301, so they are not equal slider moves either, against the note's own third line. Pointing the `<!-- Link to the html -->` (`:76`) at the playable walk is sound.

## The face as a whole

It makes the page's idea felt, not busy. The lock walk turns "two degrees of freedom" from a sentence into a hand sensation, together or mirrored, and then shows the edge of that freedom honestly. The four rooms do what a cross-domain page most needs: they put each analogy to its own physics and show where it holds and where it parts, without sneering at the analogy. Water holds slow, light holds for the source, labour holds once the push is power. That is a better lesson in structural isomorphism than a table of matches would be, and it serves the page's forward vector directly. The risk is that the four-rooms test reads as a scorecard against the page. One more sentence would turn it into the lesson: the arrows on the page hold in every room; the proportion is what each room has to earn.
