---
title: "Parametric Resonance — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Parametric Resonance]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for this page's first rich face, made in the 2026-11 proposal round: a verdict and a reason for every piece, the swing re-derived from its own Lagrangian to settle who has the timing right, and every offer recomputed."
---

# Parametric Resonance — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03, against the maker's commit 2155231d on `enrich/parametric-resonance`. I read the page, the manifest, the three pieces and the checks script whole, ran every check below, and built my own swing and my own threshold solver rather than trusting the pieces' engines.

## The swing: who is right

**The maker is right, and the page's rule is backwards for a real swing.**

The page (Parametric Resonance.md, § The pumped swing) says to modulate L "at the right phase (squat at the bottom of the arc, stand at the peaks)", and explains it as "climbing against gravity at the peaks where centrifugal force is weak, sitting back at the bottom where centrifugal force is strong". § Where the phase lives repeats the rule, and § What makes the energy says the child's net work "is positive".

I built my own variable-length pendulum from the Lagrangian T = ½m(l̇² + l²θ̇²), V = −mgl cos θ, which gives θ̈ = −(2 l̇ θ̇ + g sin θ)/l, with the 2l̇θ̇ term kept. The child follows the swing's own phase α = atan2(−θ̇/ω₀, θ), l = L₀(1 + δ sin(2α + φ)), and since l̇ depends on α̇, which depends on θ̈, I solved for α̇ exactly (it is linear in α̇) instead of differencing l, as the piece does. RK4 at 0.1 ms, the same L₀ = 2 m, δ = 0.06, 12° start, air term bθ̇ with b = 0.01, 30 kg. The toy is θ̈ = −(g/l) sin θ.

| rule | real swing, mine | piece | g/L model, mine | piece |
|---|---|---|---|---|
| page: squat through the bottom, stand at the peaks | × 0.7428 | × 0.743 | × 1.0839 | × 1.084 |
| reverse: stand through the bottom, squat at the peaks | × 1.3159 | × 1.316 | × 0.8970 | × 0.897 |
| holding still | × 0.9859 | × 0.986 | × 0.9859 | — |

The ratio of log-gains, real over toy and net of the air, is −2.986 (the piece says −2.99). Three more checks that do not touch any timing rule:

- **Closed form.** Change the length instantly. A sudden change at the bottom keeps angular momentum, so θ̇ scales by (L₁/L₂)²; a change at a peak, where θ̇ = 0, does nothing. For small angles a real swing goes × (L_short/L_long)³ = 0.697 a swing under the page's rule and × 1.434 under the reverse. In the g/L model θ̇ carries straight through a change at the bottom, so the page's rule goes × L_long/L_short = 1.128 and the reverse × 0.887. The log ratio is −3.00 exactly, the maker's ε_eff = −3δ.
- **A fixed clock.** Drive l(t) = L₀(1 + δ sin(2ω₀t + p)), four pump phases, and let the growing mode take over. In the real swing the child is standing up fastest near the bottom (|θ|/amplitude at the moment of fastest rise ≈ 0.06–0.08). In the g/L model it is near the peaks (≈ 0.92–0.94).
- **The other reading of the words.** Read as postures rather than motions ("be squatted at the bottom, be standing at the peaks"), the rule pumps nothing in either model: × 0.985–0.987, the same as holding still. So the page's rule only means anything as the timing of the motion, and read that way it is backwards.

The textbook rule is the reverse, and the reverse is what builds: raise your centre of mass as you pass through the bottom, lower it at the ends.

**What the page's g/L model gets wrong.** It treats the length as setting only the pitch, ω₀² = g/L. That drops the 2l̇θ̇ term, which is angular momentum. When a child shortens the rope while moving fast, they speed up the way a skater does pulling in their arms, and that effect is biggest at the bottom. In the toy, squatting at the bottom keeps θ̇ while L grows, so the kinetic energy ½mL²θ̇² rises with nobody doing the work. That is energy from nowhere, and it is exactly the "gain" the page's rule gets in that model. Written for arc length u = Lθ, the real swing is still a Mathieu oscillator, ü + ((g − L̈)/L)u = 0, which I re-derived: u = Lθ, so ü = L̈θ + 2L̇θ̇ + Lθ̈ = (L̈ − g)θ. Its stiffness is (g − L̈)/L, though, not g/L. With L = L₀(1 + δ cos 2ω₀t), L̈ = −4gδ cos 2ω₀t, so the stiffness goes as 1 + 3δ cos, where g/L goes as 1 − δ cos. It is three times as strong and the other way round. The page is right that pumping a swing is parametric; it is wrong about which parameter.

The page's energy paragraph contradicts itself by its own logic. Climbing where the rope pulls least costs little work, and sinking where it pulls most gives a lot back, so the net work is negative. That is offer 2.

## The thresholds: 4ζ and 2ζ are the same number

The page writes the pumped oscillator as ẍ + ω₀²(1 + ε cos Ωt)x = 0, with no damping term. Both audio pieces add 2ζω₀ẋ and keep the page's ε. Under that convention the first-order threshold at Ω = 2ω₀ is ε_c = 4ζ: growth goes as ω₀(ε/4 − ζ). The Floquet and Mathieu makers use stiffness ω₀²(1 − 2q cos Ωt), so ε = 2q and q_c = 2ζ. That is the same threshold, and the Mathieu bundle's own record agrees: "q ≈ 0.05 = γ = 2ζ" (Mathieu Equation/Mathieu Equation — rich.json:71, :168). Each piece's number matches the page's own equation.

"Exact" is a slight overclaim. My own bisection on the RK4 monodromy, 4000 steps per pump period, finds:

| ζ | ε_c measured | 4ζ | ratio |
|---|---|---|---|
| 0.0015 | 0.0060000 | 0.0060000 | 1.000000 |
| 0.006 | 0.0240002 | 0.0240000 | 1.000008 |
| 0.03 | 0.1200236 | 0.1200000 | 1.000197 |
| 0.1 | 0.4008740 | 0.4000000 | 1.002185 |

4ζ is the first-order threshold. It is good to about one part in 10⁵ at the piece's dampings, which is why the piece's check prints 0.006000 and 0.024000. The piece's own equation words say "first-order form", so the piece is honest; the caption's "exactly 4ζ" is not quite.

## The pieces

### The pumped swing — **remake**

1. **Test or decoration?** A test, and the sharpest on the face. Step 4 could have come out the other way, and against the page it did. I reproduced every gain to four figures with an independent integrator (above).
2. **Faithful?** The piece disagrees with the text on purpose, and says so: steps 3 and 4 hold the page's rule in the page's model and in a real swing, and the disagreement is carried as offers 1 and 2. That is an offer for Loudon, not grounds to retire. Calling θ̈ = −(g/L) sin θ "the page's model" is fair. The page never writes it, but ω₀ = √(g/L) plus "changes one of the swing's parameters" plus the ε-equation is that model.
3. **Walks up?** Yes: the swing alone, then once versus twice a swing, then the toy, then the real swing. Step 2 uses the timing that works and says so, so the test is still saved for step 4.

**What must change.** The readouts lie once the swing reaches its 65° cap. The piece then lets the child stop pumping ("high enough: hold still"), but the text keeps describing a child who is pumping. In headless Chromium at the default 3× speed, step 4 (reverse) read, about 8 s after the click: "The reverse on a real swing: **× 0.997** a swing. The child stands against the hardest pull … +11.7 J of work that swing, and the swing gained **−4.4 J**; the air took the difference". At 10 s it read × 0.982, +0.0 J, −14.8 J. Step 2 (twice per swing) flips the same way: at 8 s it reads × 0.997 under "the height grows exponentially". Under the page's rule the work reading shrinks to "−0.0 J that swing" as the swing dies. The test's headline number turns wrong within about seven seconds of ordinary watching. The fix is one round. Once the cap engages, freeze the gain and work readouts at the last pumped swing and say "high enough: the child holds still now". For the dying swing, freeze the work readout at the third swing, the one the checks and offers quote, or stop once the swing is under about 1°. Nothing in the physics changes.

### The threshold heard — **remake** (caption only)

1. **Test or decoration?** A test. The fade rates are measured from the worklet's own output against the Floquet multipliers (−17.95 vs −18.01 dB/s; −8.95 vs −9.00 at ε = 0.003), and heavy damping visibly moves the threshold. Step 4 makes the page's first Open Question measurable.
2. **Faithful?** Yes to the page's equation, with damping added and ε kept. The caption overstates two things. First, "says nothing until 3.1 s" is one noise draw: across 24 noise seeds of the piece's own worklet the pumped sweep is first heard at 2.67–4.46 s (median 3.57), and my browser run read 3.90 s. Second, "the multipliers cross 1 at exactly 4ζ" is first-order, though true to five figures here. The held-depth check's "heard at 1.11 s" is the earliest of the 24 draws (median 1.76, max 2.70); my browser run read 2.22 s. The piece prints live numbers, so the piece itself is honest. The caption is not.
3. **Walks up?** Yes: one ring, a pump too weak to win, across the threshold, then driven against pumped.

**What must change.** Only the manifest caption. Write "says nothing until about 3–4 s (2.7–4.5 s across noise draws)" and "cross 1 at 4ζ, to five figures at these dampings". The piece's code needs no change.

### With the ring, against it — **keep**

1. **Test or decoration?** A test of the section's second bullet and its "phase-blind" paragraph. The strobe makes the Floquet eigenvectors visible as lines, and six starting phases all end on the growing one, within 0.08°. Struck exactly on the decaying line, the ring falls at −72.0 dB/s, matching the Floquet rate of ω₀(ε/4 + ζ) = 8.29 Np/s, against −18.0 with no pump. Then noise turns it, as the page says.
2. **Faithful?** Yes. It tests the bullets as written and never asserts the swing rule the section's first paragraph repeats. The "wrong rate" step's claims also hold: at 1 × 220 Hz both lines fade (−17.66, −18.36 dB/s), and 1.5 × falls in no tongue (n = 4/3).
3. **Walks up?** Yes: strobe alone, then the pump at 2×, then the wrong rate, then the test.

Note, not a remake: the caption's "turns at 0.76 s, full at 2.37 s" is one draw. Across 24 seeds it turns at 0.68–1.04 s (median 0.80) and is full at 2.12–3.00 s (median 2.47); my browser run read 0.85 s and 2.57 s. A range in the caption would be more honest at no cost.

## The checks

- `node "Parametric Resonance/Parametric Resonance — proof — checks.mjs"`: **26 of 26 pass** (I counted the `ok` lines), so the maker's correction from 25 is right. It runs in 2.2 s.
- `conform.mjs "Parametric Resonance"`: errors 0, warnings 0, browser pass at 760 and 1130 px; all three pieces are pre-contract.
- `fingerprint.mjs`: all three sections are in step (5a089fa2e33c, c85912d19692, c36480f77952).
- Rich face served at 127.0.0.1:8860 and walked in headless Chromium with an AudioContext counter injected into every frame. The console was clean. No piece made an AudioContext before a click (0/0/0). Three `proposal · 2026-11-03` chips showed. A simulated hide (visibilityState hidden, then visibilitychange fired top-down) took the phase piece's running context to `suspended`. All pieces and the checks file are tracked in 2155231d. Nothing licensed is copied.
- My scripts (swing, threshold bisection, noise-seed spreads, browser walk) were in the session scratchpad and will not last. Everything they found is written into this record.

## The offers

1. **The pumped swing · claim-change: confirmed**, independently, with the numbers above. The proposed wording, "stand up as you pass through the bottom, squat as you reach the peaks", is the textbook rule. The page's rule only builds in a model that drops angular momentum.
2. **What makes the energy · claim-change: confirmed.** My energy balance over the third swing, child's work = ΔE + air: page rule ΔE −0.97 J, air 0.05 J, work **−0.92 J** (the piece integrates tension and gets −0.91 J). Reverse: ΔE +45.53 J, air 2.44 J, work **+47.96 J** (piece +47.98 J, +45.5 J).
3. **Driving vs. pumping · no-claim-edit: confirmed, but the kind is arguable.** The undamped equation does contradict the threshold sentences after it. Adding 2ζω₀ẋ and naming ε_c ≈ 4ζ puts a formula on the page that it does not now state, which reads more like a small claim-change than a no-claim edit. Either way, write it as "≈ 4ζ (first order)", and if the page ever cites the Mathieu page's q, give the bridge: ε = 2q, so q_c = 2ζ.
4. **Where the phase lives · claim-change: confirmed, with one correction.** A pumper who follows the swing with the wrong timing brakes it for good (× 0.743 a swing). Against a fixed clock, "only delays" undersells it: the wrong phase really does brake, at −72.0 dB/s, four times the unpumped fade, before noise turns it. Across 24 noise draws it turns at 0.68–1.04 s and is full at 2.12–3.00 s; one draw is 0.76 s and 2.37 s. A truer sentence: "against a fixed clock it brakes for a while, then builds".
5. **Open Questions · claim-change: confirmed in shape, the numbers disputed as single values.** The pumped sweep crosses ε_c at 1.50 s by construction (ε ramps to 16ζ over 6 s). The driven ring being "audible from 0.01 s" follows from the chosen force: its off-resonance response, F/(1 − 0.8²) ≈ −50 dB, is above the −60 dB line from the start, so that number is honest but set by F. "Silent until 3.12 s" is one noise draw. Across 24 it is 2.67–4.46 s, median 3.57 s, and every draw lags the crossing by at least 1.17 s. That lag is the real finding, and it holds; the offer should quote the range.

## The face as a whole

The face makes the page's idea felt, and in one place it does more: it catches the page out on its opening example. The swing piece is the reason to have built the face. It walks a reader from a swing they know to the moment the page's own model and a real swing disagree, and it shows the child's work changing sign with the gain. The two sound pieces turn "threshold" from a word into a lag you can wait through. The silence comes after the crossing, not at it, and that is the page's "crack" with a clock on it. Nothing here is decoration. What it needs is honesty about chance and about stopping. The swing's readouts have to stop when the child does, and the captions should give ranges where the noise floor decides the number.
