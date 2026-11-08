---
title: "Dispersion Table — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Dispersion Table]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenge of Dispersion Table's first rich face: every piece judged with a reason, every offer recomputed, so Loudon reads verdicts he can check rather than a stamp."
---

# Dispersion Table — rich — challenge

Challenger for the proposal round, 2026-11-03, on the maker's commit `af630129`. I did not make this face. I judged it from the page, the four made pieces, the two gathered ones, and the maker's commit body. Six pieces: **6 keep, 0 remake, 0 retire.** The notes under the keeps are worth acting on, but nothing in any piece is false or fails to walk up. Two of the five offers want rewording before they go home.

## The pieces

**the table and the loop** — **keep.**
- Test or decoration: a test. Step 3's difference is zero only if the identity holds, and the P + 1 button shows it can fail. Step 4 shows a fractional length puts a filter in the slot either way: a straight line takes level, an allpass takes timing.
- Faithful: yes, to "exactly so when the loop's length is a whole number of samples" and to "that reading is already a filter in the loop."
- Walks up: yes. The steps are Loudon's own outline from 2026-10-25: table alone, loop alone, their difference, then the filter.
- Note on the sign. "At a high pitch its upper harmonics go flat" is true of this piece's split, a whole delay of P plus an allpass of delay ½ (coefficient +⅓). The Wavetable Oscillator's piece splits the same 100.5 samples as 99 plus an allpass of delay 1.5 (coefficient −0.2). That split bends them sharp. Through this engine I get the Oscillator's +0.955 ¢ at harmonic 10 exactly, and at 1760 Hz the top harmonic comes out +28.6 to +30.5 ¢, not −22 to −23. So both faces are right, but a reader holding both will see opposite signs. One clause in the caption would square them: "(an allpass of half a sample; the Oscillator's split, 99 + 1.5, bends them sharp instead)".
- Small nit: the caption says "within 0.005 cents". The worst case in the check is 0.0051 ¢ (straight line, 1760 Hz, 44.1 kHz).

**the table that travels** (gathered, Dissolutions proof) — **keep.** It is the proof the walk above climbs to, and it sits right after the walk, which is the shape [[Progressive Staging]] asks for: an existing proof stays as it is, and the last step links to it. The file is tracked. Its storage contract is declared in the manifest, and conform reads it clean.

**where the partials land** — **keep.**
- Test or decoration: a test. Step 4 renders three loops and measures their partials against the crossings of 2πfτ + θ(f) = 2πk. If the condition were wrong, the rings would leave the ticks.
- It also tests something the section only implies: θ must be nonlinear, not just frequency-dependent, to take partials off the grid. A straight lag (the average) moves the series by fs/(N+½) and leaves it harmonic.
- Faithful: yes. It draws θ as a lag, which is how the page's equation uses it (offer 1).
- Walks up: yes. Bare loop, then a straight lag, then a bent lag, then the measurement.
- At the default (N 200, bend 0.6), partial 12 sits +39 ¢, so the caption's "tens of cents" holds.

**two knobs, one loop** — **keep.**
- Test or decoration: a test. Step 4 asks whether sweeping one knob moves the other's quantity, and it answers in numbers that could have been zero.
- Faithful: its opening paraphrases the page correctly. Magnitude governs brightness and decay; phase governs where the partials land.
- Walks up: yes. Magnitude alone, phase alone, the square, then the test.
- Note: the one-pole's pitch move is measured with the bare delay held. Any real instrument would retune L and take that away. What survives retuning is the 2.7–3.2 ¢ bend at 440 Hz. The offer already says "which no retune removes", and the caption could say it too.

**the warp knob** — **keep.**
- Test or decoration: a test. The radius sweep sorts into bands by rules stated on the step, and the first-order contrast shows the result depends on the recipe.
- Faithful, mostly. Step 4 calls the irregular band "the page's bell end". The page's words are "bell/gong (strong inharmonic spread)". What the knob reaches at its top is a different shape, not a wider spread. At 110 Hz, 24 partials, the widest departure at 0.97 is −141 to −124 ¢. At the top of the piano band (0.90) it is +106 to +101 ¢.
- Suggested change: in step 4, "the page's bell end" → "where the page puts its bell", plus one line saying the spread is about what the piano band's top already had. The hear line and the caption are already honest that no one has heard it.
- Walks up: yes. One allpass alone, then eight, then the string, then the sweep.

**stiffness tour** (gathered, Waveguide Synthesizer v1.10) — **keep.**
- It is a witness, not a test, but it carries weight in this section: the stretch-only recipe, heard in a built instrument, against the second-order recipe the page names.
- The caption checks out. It matches `offline-v1.10/stiffness-tour.json` (G3 at 0, 0.4, 0.7, 1.0, then C3 to C5 at 0.7). The "about 800 times" is at line 161 of `study-v1.10-the-overtones-run-sharp/index.html`.
- "It never turns irregular" holds for what the tour plays: `ladder-vs-sound.json` is monotone at every take the tour uses. At C5, stiffness 0 (not in the tour), the ladder does bend back (+1.0, +1.3, +1.0, −5.7 ¢). The loop's own lowpass is not straight-phase, so "never" is about the takes, not the engine.
- The file is tracked. It is the palace's own render, nothing licensed.

## Checks run

- `node _ops/rich-face/conform.mjs "Dispersion Table"`: 5 pages · introduced 5 · errors 0 · warnings 0 · browser at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Dispersion Table"`: the four made sections are in step (093841747501, e4ee339d977b, 17fbb2806dc5, ffa0800eaeda). `Dispersion Table.md` is unchanged in the worktree.
- `node "Dispersion Table/Dispersion Table — rich — check.mjs"`: ALL PASS. That covers the engine at 44.1 and 48 kHz, and each page headless: no AudioContext before a click, one step at a time, leaving a step silences it, verdicts read as their numbers, no page errors.
- The face in `rich-server --root <worktree>`, headless at 1130 px: 5 frames, 6 proposal chips, nothing in Lost its place, no drift notice, no missing-file box, console empty. I played piece 1 and then signalled hidden in every frame: its AudioContext went from running to suspended, so the kit hushes it.
- I checked the engine's filters by hand. The first- and second-order allpass lags match their transfer functions. The Thiran coefficient a = (1 − D)/(1 + D) is right. The time-domain sections in `runLoop` are the allpasses the lag functions describe.
- Independent recompute in numpy (my own unwrapped phase, root-find and B fit; not the engine): B across pitch and the band edges below match the engine to the printed digits.
- Not checked: nothing was heard. I have no view on the mix, on whether the piano band sounds like a piano, or on whether the irregular end sounds like a bell.

## Agreement with the three landed faces

- **The null.** It agrees with Synthesis Topologies and the Wavetable Oscillator: table minus loop is 0, exactly, at a whole-sample length (three shapes, 110/440/1760 Hz, 3 s, both rates), and it is live at P + 1.
- **The half-sample average.** It agrees with Synthesis Topologies: a straight-line read halfway is Karplus-Strong's average. It also agrees with Waveguide Synthesizer: with the average in, the pitch is fs/(N+½), checked to 0.01 ¢ at N 150/200/400. Harmonic 10 at 110 Hz losing 2.5–2.9 dB/s checks by hand: |cos(ω/2)| per trip times trips per second gives 2.93 dB/s at 44.1 kHz and 2.48 at 48 kHz.
- **What an allpass does.** Both faces say it keeps level and detunes. They differ only in the sign, and that is the split, as under piece 1:

| split of 100.5 samples | coefficient | harmonic 10 vs 10 × harmonic 1 |
|---|---|---|
| 100 + ½ (this face) | +⅓ | −0.21 ¢ |
| 99 + 1.5 (the Oscillator's) | −0.2 | +0.955 ¢ (the Oscillator's own number) |

  A positive coefficient's group delay rises with frequency, so the harmonics go flat. A negative one falls, so they go sharp. The Oscillator's "the loop never returns to silence" is not contradicted here: this face never plays the half-sample difference against the exact read long enough to claim either way.

## The offers

1. **θ is the phase lag** (no-claim-edit) — **confirmed.** The page writes the bare delay's phase as +2πfτ, a lag. So θ has to be a lag too, which is minus the usual phase response.

2. **Which filter the fractional slot holds** (claim-change) — **confirmed, with one addition.** I reproduce every number:

| pitch | top harmonic, cents off the table's grid |
|---|---|
| 110 Hz | −0.019 (44.1 kHz) / −0.015 (48 kHz) |
| 440 Hz | −1.397 / −1.056 |
| 1760 Hz | −23.10 (harmonic 11) / −22.10 (harmonic 12) |

   The suggested page wording, "bends the tuning", is neutral and right. But the offer's own numbers say "flat", and they belong to the ½-sample split. They should name it, since the Oscillator's offer, on the same slot, reports sharp.

3. **The axes are apart in the filter, not quite in the sound** (claim-change) — **confirmed on the numbers. Disputed on where it applies.**
   - Pitch move with the bare delay held: 1.59 / 6.90 ¢ (44.1 kHz) and 1.46 / 6.26 ¢ (48 kHz) at 110 / 440 Hz. By hand, the one-pole matched at partial 8 has p = 0.283 at full darkness. That adds p/(1−p) = 0.395 samples of delay at DC, which is −6.80 ¢ at 440 Hz. The fundamental's phase delay is a little more than DC's, which is the rest.
   - Bend at 440 Hz: 2.69–3.24 ¢.
   - Partial 4 at 440 Hz, darkness 0.6, warp 0 → 0.9: 38.2 → 90.4 dB/s (44.1 kHz) and 32.4 → 73.1 (48 kHz). I took the 44.1 kHz case apart. The partial moves 1764 → 2099 Hz (+301 ¢), so its loss per trip grows 1.40× (−0.087 → −0.121 dB). Its trip shortens from 100 to 59 samples, so it makes 1.70× the trips a second. 1.40 × 1.70 = 2.37, which is the change. Both of the offer's reasons are real, and the trip rate is the larger.
   - Why: a one-pole is minimum-phase, so its phase is tied to its magnitude and cannot be straight. Only a straight-phase magnitude filter, like the three taps, leaves the partials alone.
   - What the page actually claims. It never says the axes are independent. It says what each **governs**. In § The identity it rests on, the magnitude response "governs brightness and decay" and the phase response governs where the partials land. In § From one curve to a table, the position axis selects "brightness, decay rate".
   - So the qualifier belongs on those two "governs decay" lines. Decay per second is loss per trip times trips per second, and the trips are the phase axis's.
   - It does **not** belong on Cross-Domain's "Together they span the complex frequency response of the loop filter: magnitude on one axis, phase on the other". That sentence is about the filter, where the offer itself says they are apart, and it is true as written. The offer should drop that extension and name the identity-section sentence instead.

4. **One stored curve stretches high notes far more than low** (claim-change) — **confirmed.** My numpy fit gives the same B to the printed digits. At radius 0.8, from 55 to 440 Hz: 1.67e-5, 1.32e-4, 9.94e-4, 8.72e-3. That is 7.9, 7.5 and 8.8 per octave, 521× over three octaves. At radius 0.5 it is 443×.
   - The exponent is 3 (2.93 to 3.01 fitted), not 2. The derivation: below the sections' features the stored lag is θ(ω) ≈ τ₀ω + cω³. On a trip of N samples, partial k shifts by a fraction of about −c(2πk)²/N³. So B ∝ 1/N³ ∝ f₀³, which is 8 per octave and 512 over three octaves.
   - Two of the three powers come from the partials of a higher note sitting higher on the same curve (ω² in the cubic term). The third comes from the fixed lag being shared over a shorter trip.
   - The Waveguide study's "A5 about 800 times more than E2" (3.42 octaves) is exponent 2.83, the same law bending as high partials leave the cubic range.

5. **Pure, piano, irregular; the bell needs second-order sections** (claim-change) — **confirmed, but "the claim held" is too strong.**
   - The bands reproduce at 110 Hz: pure to 0.21/0.24, piano to 0.90 (B 2.0e-6 to 2.4e-4), irregular 0.91–0.97, at 44.1/48 kHz. They move with pitch, by offer 4, so "at 110 Hz" must stay in the sentence.
   - What held is the order: a stretched string, then a shape that is not one. The page's "strong inharmonic spread" did not show. The widest departure at 0.97 (about 141 ¢) is close to the piano band's top at 0.90 (106 ¢).
   - Why first-order sections only stretch. Every stable allpass has a monotone phase. What matters is the group delay. A first-order section's group delay (1−a²)/(1+2a cos ω+a²) is monotone in ω: falling for a < 0 (the stiff recipe, a = −r), rising for a > 0. A sum of identical sections is monotone too. Phase delay is the running average of group delay, so it is monotone as well, and the partials' departures grow in one direction only: a stretch (or a squeeze), never irregular. I confirmed monotone at 0.5, 0.7, 0.9 and 0.96.
   - A second-order section has a group-delay peak at its pole angle. Log-spaced peaks put bumps in the curve, and the bumps are what make low partials go flat while high ones go sharp.
   - "Identical" is load-bearing. A mix of first-order sections with both signs of a could make a non-monotone curve. The offer says "identical" and should keep it.

## The face as a whole

The face makes the page's idea felt, and it is not busy. Each piece answers a different question, in the order the page asks them:
- is the table a loop?
- where do partials land?
- are the two axes two?
- does one knob walk from pure to bell?

Each one walks up from one idea to a measurement that could have failed. The first follows Loudon's own outline for the proof it ends on. Its best work is what it found by testing. The magnitude axis reaches pitch unless its filter's phase is straight. The phase axis reaches decay. One stored curve is not one inharmonicity across the keyboard. Each of those is a real thing the page's forward vector, "a first-class control axis", will have to design around.

What the face cannot do yet is let anyone hear the bell. The irregular band is a shape, measured, and the page's bell is a sound. Until someone listens, the claim at the end of Cross-Domain Resonance stands tested in order but not in kind.
