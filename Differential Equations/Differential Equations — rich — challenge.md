---
title: "Differential Equations — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Differential Equations]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Differential Equations' first rich face: each piece judged on whether it tests the text, stays faithful to it and walks up to its test, every number the maker measured recomputed apart from the pieces' engines, and the mix measured from the buffers, since nobody has heard it."
---

# Differential Equations — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5. I judged from the page (`Differential Equations.md`), the manifest, the three pieces it names, and the maker's commit body (32913fb4), which was my only account of the run. I recomputed every number in my own Python, from closed forms and from the update rules written out again, not from the pieces' engines. Nobody has listened to this face. I couldn't either, so I captured every buffer the buttons play and measured them.

## Verdicts

**The Taxonomy · `three regimes.html` · remake, one round, three small fixes.**
It tests the text, though less where it says it does. The three regime claims (ζ below 1 overshoots, ζ = 1 is the fastest return with none, ζ above 1 is slower) hold by the equation's own algebra. Overshoot is e^(−πζ/√(1−ζ²)), which is above zero for every ζ below 1, so the engine can only confirm them. The piece's verdict has a branch for failing (line 383), but that branch would catch a broken engine, not a wrong page. Where it really tests is in what it finds the text getting wrong or leaving open. "Damped at rate ζ" can't be right, since ζ has no unit, and a struck swing rings at ωₙ√(1 − ζ²), not ωₙ. And a 2% bump buys speed. Either finding could have come out the other way. It is faithful: everything beyond the text is labelled as the section leaving it open, and both findings are offers. It walks up well. Step 1 is the first-order rule alone, as a field you can seed. Step 2 adds weight. Step 3 turns ζ on three jobs. Step 4 is the test.

The fixes:
1. **The pluck's own fade-in swallows it** (line 322: `fade(..., sr, 5)` ramps the first 5 ms). A strike starts from zero, so it needs no fade-in. But at 220 Hz most of a damped strike is over inside 5 ms. The fade keeps 25% of the strike's energy at the slider's default ζ (0.17), and 6% at ζ 0.5 and at ζ 1. In my capture the pluck peaks at −19.6 dBFS at the default ζ and −25 dBFS at ζ 1, against −7.6 for the filter at the same ζ. So step 3's "at 1 all three stop clean" is heard as two sounds and a faint tick. Fade only the tail of the strike (step 2's ring, line 314, loses just 9% and can stay).
2. **Say what the test can and can't do, before the table** (line 135). Say that the three regime claims follow from the equation, and that the engine shows them rather than discovering them. Then put the two measurements that could have gone either way, pitch and fade, and the 2% trade, first. Move the 2% band and the "overshoot above zero" rule from the closing note (line 143) up into the step's opening. That way the rule is stated before the trial.
3. **Name the cliff at 0.78** (verdict, line 385). The best 2% settle sits at ζ = 0.7798, a hair above where the overshoot fills the band exactly (0.7797). Just below that, settling jumps: ζ 0.775 settles after 5.35/ωₙ and 0.77 after 5.47/ωₙ, barely faster than critical's 5.83. The step-4 curve already shows the jump. One clause in the verdict saying so is enough.

A smaller point, not a fix: step 3's "below 1 all three ring" (line 118) is true on paper, but at ζ 0.9 the overshoot is 0.15% and nothing rings that an ear could catch.

**The Taxonomy · `who keeps time.html` (gathered from Resonance and Damping) · keep.**
Its last two steps measure this section's resonance paragraph on runs of the same driven equation. They are the paragraph's test, and they already passed a challenge on their home page. The ratios match: at resonance the swing is 1/(2ζ) = Q times the steady push, and the displacement peak sits at √(1 − 2ζ²) = 0.935 at Q 2 and is gone at ζ above 1/√2. Galileo's ringer opens the walk, which is the home page's argument rather than this one. A gathered record keeps its own walk, and its caption says so. One dependency: it is a proposal on its own page too. If Loudon retires it there, this face shows a box in its place.

**Open Tensions · `one step at a time.html` · remake, one round, five fixes.**
It answers the open question with measurements that could have come out otherwise, and every one of them checks. It is the stronger idea of the two pieces. It walks up cleanly: Euler on a fade, Euler on a ring, six rules on one ring, then the bar at the real sample rate. But it teaches two things that are wrong, and its verdict is fixed in advance:
1. **Euler's fade arrives early, not late** (line 89: "below one step per τ it arrives late"). Each step keeps 1 − h/τ of the gap, which is less than the true e^(−h/τ), as the piece's own equation (line 92) says. So the stepped level always runs ahead of the curve: at h = 0.5τ it stands at 75% after one τ, where the curve stands at 63%. Past one τ it overshoots. Say "arrives early, and past one step per τ it overshoots".
2. **1,257 steps a cycle stops the ring growing; it doesn't hold 2 s** (line 114, line 375, and the caption's "holds a 2 s ring only above 1,257 steps a cycle"). Euler's ring lasts about 3,700 s at 1,258 steps a cycle, 5.4 s at 2,000, 2.9 s at 4,096 and 2.2 s at 12,572. Relabel it as "stops growing above 1,257 steps a cycle", and give the count it needs to come near 2 s (about ten times that).
3. **"The same difference equation every digital resonator runs"** (line 124) says too much. The exact step is the modal, impulse-invariant resonator. The common biquad comes from the bilinear transform, which is the trapezoid, as the maker's own offer 3 says. Say "the one a modal resonator runs".
4. **The soft ceiling bends the exact bell** (line 407: `0.6·tanh(0.45·v)` on every rule). The exact bar sums to 2.36 at its strike, where tanh takes 2.6 dB off. The bend leaves an error of −19 dB, relative to the bell, over the first 50 ms, and −23 dB over the first half second. So the "exact" you hear isn't clean, which weakens a step whose point is that the exact step leaves nothing to hear. Keep the ceiling for the runaways and make it linear below the exact bell's peak, for example a soft knee that starts at about 0.8.
5. **The verdict's bold sentence is hard-coded** (line 445). At 96 kHz on a 220 Hz bar it still reads "So it matters", while RK4 is then 0.0 ¢ and 698 ms against 700, and semi-implicit Euler is +2.8 ¢. Before the trial, state what "matters" means (say, a partial off by more than 5 cents, or its ring off by more than 10%), then let the sentence name which rules pass at the rate and bar chosen. While there: RK4 is −4.03 ¢ at 5,871 Hz, so "within 4 cents" should be "about 4 cents".

## Checks run

- `conform.mjs "Differential Equations"`: 3 pages, introduced 3, errored 0. Errors 0, warnings 0. The browser pass ran at 760 and 1130 px.
- `fingerprint.mjs "Differential Equations"`: The Taxonomy d242a9da3086 and Open Tensions d2ff12a3ad75, both in step.
- I served the face on a leased rich-server (port 8850, now stopped) and loaded `?entry=Differential Equations` headless. Console clean. Three frames, three proposal chips, nothing lost, no unresolved box. Hush works: I started step 2's strike in three regimes, hid the page, and the context went from running to suspended.
- No AudioContext exists before a click in either piece (`soundOn` is called only from click handlers). The sounds run at most 3.5 s, inside the kit's minute cap. Neither piece needs files, storage or a network beyond the fonts, and nothing licensed is copied.
- The maker's `check.mjs`: ALL PASS.
- My own recompute, apart from the engines (scratchpad `challenge-de/regimes.py` and `steps.py`):
  - **Regimes, from the closed-form step response:**
    - ζ 1 settles within 2% after **5.8339/ωₙ**.
    - The best 2% settle is at **ζ 0.7798: 3.6032/ωₙ, 38.24% sooner, overshoot 1.9975%**.
    - At ζ 0.78 it overshoots 1.9924% and settles after 3.6046/ωₙ.
    - ζ 0.9 overshoots 0.1524%. ζ 1.5 settles after 10.6547/ωₙ, ζ 3 after 22.9751/ωₙ.
    - Damped pitch at ζ 0.3: **209.8666 Hz, −81.64 ¢**, fading at 414.69 /s (gone, −60 dB, in 16.7 ms).
    - Below ζ 0.05 the pitch gap is under 2.17 ¢.
  - **The bar, 440 Hz at 48 kHz.** I wrote each rule from its update equations and fit a damped sine to the simulated sound (curve_fit, seeded from an FFT peak and a Hilbert slope):
    - forward Euler passes 3× at 15.23 ms on the fundamental and 0.15 ms on the top partial
    - backward Euler rings the fundamental **84.47 ms**
    - semi-implicit Euler: **+45.31 ¢** at 5,871.36 Hz (8.18 samples a cycle)
    - trapezoid: **−80.21 ¢**, ringing 803 ms
    - RK4: −4.03 ¢, ringing **94.02 ms** against 700
    - exact: 0.0000 ¢ and 700.00 ms (the maker's 0.0001 ¢ is the zero-crossing reader's floor, not the rule's)
    - Euler on a 10 ms fade at 48 kHz misses by 0.0368% of the way.
- **Levels**, every buffer captured headless, peak and loudest-400-ms RMS after the 0.9 output gain:
  - Three regimes: −8 to −10 dBFS peak, about −15 to −19 RMS, except the pluck's fade-in drop above.
  - One step at a time: the exact and good rules −7.4 to −11 dBFS peak, −18 to −19 RMS. The runaways peak −5.5 to −8 dBFS, louder but well short of full scale, as its note says. Backward Euler is quiet (−15 to −20 dBFS peak) because it dies, which is right.
  - The two pieces sit within about 2 dB of each other. Apart from the two fixes above, nothing argues for a level change.

## Offers

1. **No-claim-edit, ζ is not a rate: confirmed.** 209.87 Hz and −81.6 ¢ at ζ 0.3; it fades at ζωₙ. The page's own source quote already says it: "oscillates at damped frequency (the pitch you hear)" (`Differential Equations.md:155`). So the fix brings the bullet at :91 and the grain bullet at :93 into line with the quote. That keeps the pitch part a no-claim-edit, not a new claim.
2. **Claim-change, ζ 0.78 beats critical within a 2% band: confirmed, with a caveat for the suggested sentence.** 3.60 against 5.83/ωₙ, 38% sooner, 1.99% overshoot. But "ζ ≈ 0.78" hides a cliff: ζ 0.775 settles after 5.35/ωₙ. And the best ζ moves with the band: within 5% it is ζ 0.69 (2.86 against 4.74), within 1% ζ 0.83 (4.19 against 6.64). Suggested wording: "allow the swing to pass its target by a little, up to the band you call arrived, and a ζ just high enough to keep that pass inside the band arrives sooner: for a 2% band, ζ 0.78 settles after 3.6/ωₙ against critical's 5.8/ωₙ."
3. **Claim-change, the discrete-vs-continuous answer: numbers confirmed, scope disputed.** Every 48 kHz figure matches. But "for a linear equation an exact step exists and leaves nothing to hear" holds for a free ring (struck, nothing driving it), not for a driven filter. That is the page's own "audio filter's response to input" (`Differential Equations.md:59`). The exact step treats the input as held between samples. For the page's equation as an 8 kHz, Q 5 resonator at 48 kHz, that gives −0.40 dB at the peak against the analog response, −2.5 dB at 16 kHz and −6.0 dB at 20 kHz. Scope the suggested sentence: "for a linear equation left to ring, an exact step exists …; driven, it is exact only for an input held between samples."
4. **Claim-change, the Kuramoto bullet: confirmed.** The linear driven swing (Q 20) settles at the push's rate at 0.7, 0.97, 1.0, 1.03 and 1.5 of its own rate, 0.70000 to 1.50000, in my own integration. A Kuramoto oscillator under a clock (dφ/dt = Δ − K sin φ, K = 1) locks at detunings 0.3, 0.9 and 1.0, and drifts at 1.1 (slipping 0.458 rad/s, theory 0.458) and 2.0 (1.732). Locking only near the natural rate is the phase oscillator's behaviour, not the linear equation's. The palace agrees in two places. Resonance and Damping's landed text: "Struck, a thing rings at its own rate. Driven, it moves at yours, and its own rate only decides how much" (`Resonance and Damping.md:88`). Kuramoto Coupling: oscillators "with different natural frequencies" lock only "when coupling strength exceeds a critical threshold" (`Kuramoto Coupling.md:66`), and a weak anchor can't pull followers 3 Hz away (`:172`). The Kuramoto page never uses the word "self-sustained", so if the suggested sentence keeps it, it brings that word in from outside the palace. "Phase oscillators, each keeping its own rate until pulled" says the same thing in the Kuramoto page's own terms. The page's open question on the second-order (swing-equation) Kuramoto (`:182`) is the place where the two would meet.

## The face as a whole

It makes the page's idea felt, not just busy. The Taxonomy section's real claim is that one equation, turned by one number, is a pluck, a filter and an envelope at once, and step 3 of three regimes lets you hear that with one slider. That is the hub's isomorphism played, not illustrated. One step at a time takes the page's most honest line, an open question, and gives it an answer you can hear partial by partial, with the surprise that the rule matters more than the rate. Both pieces found something real for the text: ζ used as a rate, and the exact step. Each of the two remakes is a short list of lines, and none of them touches what the pieces measure. What each fixes is what you hear and how the verdict is framed. That matters doubly here, because nobody has heard this face yet.
