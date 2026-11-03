---
title: "Floquet Time-Modulated Loops — scroll"
born: 2026-09-23
links:
  - target: "[[Floquet Time-Modulated Loops]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Floquet Time-Modulated Loops's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Floquet Time-Modulated Loops — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Floquet Time-Modulated Loops]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-03T23:34:08.128Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 1 · last ran 2026-11-03 (today)
- **Plan:** agreed 2026-09-26 (38 days ago) · 2 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-03 (today) — The pumped resonator should crack out of silence. Which way of stopping its growth sounds right to you: build, gentle or stiff? (`floquet-steward-003`)
- **Last commit touching this project:** 2026-11-03 `3a6c437a` — edit(Loudon Live Design System): the browser's furniture fan-out, batch 2 of 5: Projects, D to P (98 pages)
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-03 — cycle 1 · taught item 1, proposed item 2 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 1 — item 2; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 2, from cycle 1 — 2026-11-03 — [[Floquet Time-Modulated Loops — tuning]]

### Where this stands

Floquet Time-Modulated Loops shows that the 'nothing changes over time' assumption under almost every audio loop is a choice. The first instrument is a resonator whose tuning gets pumped at twice its pitch. Push hard enough and it cracks out of silence into ringing. That is the Mathieu equation, written as an RNBO codebox. The codebox, a Python reference and twenty teaching pieces were built in April. Nobody ever checked the codebox against the reference, and the build made two choices on its own that you haven't ruled on. One is a little damping, so there's a threshold to cross. The other is a clip on the internal state, so it never blows up. The first step of the plan is to finish both. M…

### Open asks

- `floquet-steward-003` — directional_decision · posted 2026-11-03 · options: GENTLE · BUILD · STIFF · DAMPING-OTHER

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-11-03 — cycle 1 · taught item 1, proposed item 2 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **2.** 2026-11-03 · [[Floquet Time-Modulated Loops]] · § Open Questions, the bullet 'Does the tanh saturation in Stage 1 distort the Strutt picture?', a new progressed line after the existing one — The open question asked whether a different saturation is the right sound; now there is a measured, audible answer to choose from.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A five-stage arc of instruments, any of them buildable in public on [[Loudon Live]], showing that the "nothing changes over time" assumption under almost every audio loop is a choice. Let a loop's coefficient breathe periodically and you get parametric resonance, sideband ladders, frequency bandgaps, and at the far end a small audio time crystal. Behind it: the first instrument, a resonator that cracks into ringing when its tuning is pumped (the [[Mathieu Equation]] in `codebox~`), is taught in depth in the entry, and its twenty media pieces, the `codebox~` source and a Python reference were built and checked in Python on 2026-04-30 ([[BUILD_SUMMARY|the build summary]]). Nothing past that first instrument has been built.

**The moves ahead**

1. **Finish the resonator and teach it.** Run the `codebox~` in Max against its Python reference (the A/B harness is in `RNBO/README — Mathieu Resonator.md`), and rule on the two calls the build made on its own: a little damping so there is a threshold to cross, and a soft clip on the state so it never overflows ([[NOTES|the build notes]]). Then walk the media and choose the cross-domain hook for the first instrument.
2. **Pump a comb.** A Karplus-Strong delay loop whose loop gain and loop length are each modulated at their own rate. Inside the right regions the comb's peaks shift and multiply, and a spectrum analyzer running beside the audio carries the lesson.
3. **Turn the wavetable surfaces into filters.** Each surface in the [[2D Torus Wavetable Synthesizer — catalog — wavetables|2D Wavetable Catalog]] becomes a time-varying filter, one axis read as delay and the other scanned at audio rate, so a surface's synthesis character comes back as a filter character. The filtering sibling of the [[2D Torus Wavetable Synthesizer]].
4. **Work backward from the sound you want.** Pick a target spectrum from [[Categorizing Inharmonicity]], solve offline in Python for the modulation that produces it, and play that modulation from a wavetable. This is the hard inverse problem; how much of it is tractable is still an open question.
5. **Build a small time crystal.** Slow the modulation down into rhythm and couple it to audio-rate sound, so locking and unlocking are heard at once as rhythm and as timbre. The Hopf control surface from the torus project carries over.

What each later instrument is, with its cross-domain hook and build environment, is sketched in [[Floquet Time-Modulated Loops#Stages 2–5 — the development arc|the entry]].
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="floquet-steward-003" -->
### 2026-11-03 — cycle 1 — The pumped resonator should crack out of silence. Which way of stopping its growth sounds right to you: build, gentle or stiff?
> still working · damping 0.025 fits the lesson · steward leans GENTLE

The pumped resonator is the first instrument of this project. Its code now matches the Python reference exactly. The plan says you rule on two choices the build made alone. Damping I'd keep at 0.025. The crack then lands at q = 0.05 with room on both sides, and the first recording lets you check that. Saturation is the real choice. All three versions hold the pitch at exactly 220 Hz. The build's clip adds odd harmonics right on top of the Floquet ladder, so the lesson's sidebands get buried. The gentle version lets the ring run its pump dry the way real parametric oscillators do, and leaves the ladder clean. The stiff version is the cleanest of all but adds a little haze near 300 Hz. I'll keep going on the comb either way.

**Artifacts:**
- [build, gentle, stiff back to back, levels matched](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_saturation_three_ways.wav)
- [the damping choice: the crack moves with damping 0, 0.0125, 0.025, 0.05](Projects/Floquet Time-Modulated Loops/audio/rulings/call1_damping_four_sweeps.wav)
- [build alone](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_build.wav)
- [gentle alone](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_gentle.wav)
- [stiff alone](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_stiff.wav)
- [both choices, plotted](Projects/Floquet Time-Modulated Loops/audio/rulings/two_calls.png)
<sub>`floquet-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="floquet-steward-002" -->
### 2026-11-03 — cycle 1 — The resonator's code matches its Python reference exactly, but four of its own test numbers are wrong. I also recorded the two build choices so you can rule by ear.
> shipped · checked in Node, not in Max · steward leans keep the damping, switch to the gentle saturation

**It matches.** Fed the same stored noise, the codebox reproduces the Python reference to within 1.2 × 10⁻¹⁵ over 4 seconds. That's rounding error. I didn't change the codebox file. The only stand-in is its random() call, which reads the reference's noise.

**The test list doesn't match the instrument** (table). The pump threshold is 2ζ, not 4ζ, which agrees with what the rich-face enrichment found today. So the 'below threshold' test at q = 0.05 actually sits exactly on the threshold: the growth rate there is −0.005 per second. The resonator's Q is 20, not 33. The tongue is about twice as wide as the README says. At q = 0.2 it runs from ratio 1.80 to 2.19, and detuning to 1.85 still rings at 60 per second.

**A new one: the default noise drowns the crack.** At noise_level 0.001, the resonance lifts its own noise to −18 dBFS before any pump, just 8.6 dB under full ringing. So the sweep test has no crack to hear. At 1e-5 the floor drops to −55 dBFS, you get 46 dB of contrast, and the crack lands at q ≈ 0.063, just after the true threshold, because noise needs a moment to grow.

**The two choices, to hear.** [call1_damping_four_sweeps.wav](open:Projects/Floquet Time-Modulated Loops/audio/rulings/call1_damping_four_sweeps.wav) plays the same 6-second pump sweep at four amounts of damping. The crack moves from the very start to 2 seconds in, exactly at q = 2ζ (left panel of the figure). [call2_saturation_three_ways.wav](open:Projects/Floquet Time-Modulated Loops/audio/rulings/call2_saturation_three_ways.wav) plays three ways to stop the growth, each first just over threshold, then pushed hard. The first, **build**, is what the codebox does now: clip the state, then tanh on the way out. The second, **gentle**, is a sketch: damping that rises with the ring's energy, the way a real parametric oscillator runs its pump dry. The third, **stiff**, is a sketch: a spring that stiffens as it swings.

What surprised me: all three stay on exactly 220 Hz. Inside the tongue the ring is locked to half the pump, so no saturation can move its pitch. What separates them is the overtones. The build's tanh puts its odd harmonics on the same frequencies as the Floquet sideband ladder (220 ± n·440), so you can't tell which harmonics come from the physics and which come from the clip. The gentle version leaves the ladder as the theory makes it: the 5th sits at −50 dB, against −28 for the build. For an instrument whose lesson is the ladder, that matters.

The full write-up, with what the codebox and README will need once the Max pause lifts: [Mathieu Resonator — offline check](obsidian://open?vault=The%20Palace&file=Projects/Floquet%20Time-Modulated%20Loops/verify/Mathieu%20Resonator%20%E2%80%94%20offline%20check.md).

**Artifacts:**
- [Left: the crack moves to q = 2ζ as damping grows. Right: three saturations at q = 0.6. Only the build's clip pushes up the high ladder rungs and the noise floor.](Projects/Floquet Time-Modulated Loops/audio/rulings/two_calls.png)
- [Choice 1: four 6 s pump sweeps at damping 0, 0.0125, 0.025 and 0.05.](Projects/Floquet Time-Modulated Loops/audio/rulings/call1_damping_four_sweeps.wav)
- [Choice 2: build, gentle, stiff. Each 3 s just over threshold, then 3 s pushed hard, levels matched.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_saturation_three_ways.wav)
- [The build's saturation alone.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_build.wav)
- [Gentle (energy-dependent damping) alone.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_gentle.wav)
- [Stiff (stiffening spring) alone.](Projects/Floquet Time-Modulated Loops/audio/rulings/call2_stiff.wav)
- [The findings, and what the codebox and README will need once Max reopens.](Projects/Floquet Time-Modulated Loops/verify/Mathieu Resonator — offline check.md)
- [Runs the codebox text as written: A/B, all seven tests, both auditions.](Projects/Floquet Time-Modulated Loops/verify/mathieu_mirror.mjs)
- [Dumps the Python reference's raw output for the sample-by-sample A/B.](Projects/Floquet Time-Modulated Loops/verify/ref_dump.py)
- [Draws the figure.](Projects/Floquet Time-Modulated Loops/verify/plot_rulings.py)
- [Every number in this post.](Projects/Floquet Time-Modulated Loops/verify/mirror_report.json)
- [Keeps the regenerable raw reference dumps out of git.](Projects/Floquet Time-Modulated Loops/verify/.gitignore)

_Measured on the codebox's own text (Node, 48 kHz, ζ = 0.025 unless noted)_
| test | README / codebox comments say | measured |
| --- | --- | --- |
| A/B against Python | under −90 dB | −292 dB (rounding) |
| no pump: pitch, Q | Q ≈ 33, 6.6 Hz wide | 220.02 Hz, Q 19.98, ≈ 11 Hz wide |
| threshold | q ≈ 4ζ = 0.10 | q = 0.0500 (2ζ); 0.0250 at ζ 0.0125; 0.1001 at ζ 0.05 |
| 'below threshold' q = 0.05 | dim, nothing builds | on the threshold (−0.005 /s); below is q ≈ 0.03 |
| crack in 0 → 0.5 sweep | near 0.10 | none audible at noise 1e-3; q ≈ 0.063 at noise 1e-5 |
| tongue edges at q = 0.2 | ≥ 5% detune exits | 1.802 to 2.189 (theory 1.806–2.194) |
| q = 0.8, state clip on / off | finite | 0 bad samples / overflows in 0.19 s |

_Changed in the workshop:_ Mathieu Resonator — offline check — New workshop note: what the offline check found, and the comment and default changes the codebox will need when Max work reopens.
_Proposed for canon:_ Floquet Time-Modulated Loops (§ Open Questions, the bullet 'Does the tanh saturation in Stage 1 distort the Strutt picture?', a new progressed line after the existing one) — The open question asked whether a different saturation is the right sound; now there is a measured, audible answer to choose from.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nothing has been opened in Max or heard by anyone, me included. The gentle and stiff saturations are sketches in the check script, not in the codebox. The 2ζ correction to the codebox comments and README waits for the Max pause to lift.

_Next moves named:_ Once you rule on the two choices, write the chosen damping and saturation into the Python reference and media, and list the exact codebox changes for when Max reopens (signal flow and parameters are already in the offline check). · Start pumping the comb (the plan's next instrument) as a Python and browser proof: a Karplus-Strong loop with its gain and length each modulated, with a spectrum view beside the audio. · Still yours whenever you have a sitting: walk the media and pick the first instrument's cross-domain hook.
<sub>`floquet-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-97031fd1dc" -->
### 2026-11-03 — cycle 1

taught item 1, proposed item 2 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-26T09-22-50-04-00" -->
### 2026-09-26 — Plan revised: the stages are builds, not sessions

Loudon, 2026-09-26: Loudon Live is no longer a scaffolded curriculum; it is his whole public self, building slowly, and any stage can be built in public. The five stages are unchanged; only the framing that made each one a session was loosened.

_The plan before this change:_

> **Where this is going.** A five-session [[Loudon Live]] arc showing that the "nothing changes over time" assumption under almost every audio loop is a choice. Let a loop's coefficient breathe periodically and you get parametric resonance, sideband ladders, frequency bandgaps, and at the far end a small audio time crystal. Behind it: the first instrument, a resonator that cracks into ringing when its tuning is pumped (the [[Mathieu Equation]] in `codebox~`), is taught in depth in the entry, and its twenty media pieces, the `codebox~` source and a Python reference were built and checked in Python on 2026-04-30 ([[BUILD_SUMMARY|the build summary]]). Nothing past that first instrument has been built.
>
> **The moves ahead**
>
> 1. **Finish the resonator and teach it.** Run the `codebox~` in Max against its Python reference (the A/B harness is in `RNBO/README — Mathieu Resonator.md`), and rule on the two calls the build made on its own: a little damping so there is a threshold to cross, and a soft clip on the state so it never overflows ([[NOTES|the build notes]]). Then walk the media and choose the cross-domain hook for the first session.
> 2. **Pump a comb.** A Karplus-Strong delay loop whose loop gain and loop length are each modulated at their own rate. Inside the right regions the comb's peaks shift and multiply, and a spectrum analyzer running beside the audio carries the lesson.
> 3. **Turn the wavetable surfaces into filters.** Each surface in the [[2D Torus Wavetable Synthesizer — catalog — wavetables|2D Wavetable Catalog]] becomes a time-varying filter, one axis read as delay and the other scanned at audio rate, so a surface's synthesis character comes back as a filter character. The filtering sibling of the [[2D Torus Wavetable Synthesizer]].
> 4. **Work backward from the sound you want.** Pick a target spectrum from [[Categorizing Inharmonicity]], solve offline in Python for the modulation that produces it, and play that modulation from a wavetable. This is the hard inverse problem; how much of it is tractable is still an open question.
> 5. **Build a small time crystal.** Slow the modulation down into rhythm and couple it to audio-rate sound, so locking and unlocking are heard at once as rhythm and as timbre. The Hopf control surface from the torus project carries over.
>
> What each later instrument is, with its cross-domain hook and build environment, is sketched in [[Floquet Time-Modulated Loops#Stages 2–5 — the development arc|the entry]].
<sub>`plan-2026-09-26T09-22-50-04-00` · plan revised · agreed 2026-09-26T09:22:50-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-43-07-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the entry's development arc

Carried over on 2026-09-25 from the entry's development-arc section and its line that the later stages are only sketched, when plans moved into scrolls (SCHEMA v1.25). The five stages keep the entry's order, each renamed by what it does. The first move is what remains of the first stage by the entry's own finish line: its media and code were built and checked in Python on 2026-04-30, but the codebox has not been run in Max and two build calls in NOTES still wait on Loudon. The stage sketches stay in the entry as the design each move links to.
<sub>`plan-2026-09-25T20-43-07-04-00` · plan agreed · agreed 2026-09-25T20:43:07-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-09-23" -->
### 2026-09-23 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (28 media files, newest first):

- [16_opo_sidebands.png](Projects/Floquet Time-Modulated Loops/static/16_opo_sidebands.png) · 2026-09-23
- [17_plasma_decay.png](Projects/Floquet Time-Modulated Loops/static/17_plasma_decay.png) · 2026-09-23
- [18_photonic_time_crystal.png](Projects/Floquet Time-Modulated Loops/static/18_photonic_time_crystal.png) · 2026-09-23
- [12_sideband_ladder.png](Projects/Floquet Time-Modulated Loops/static/12_sideband_ladder.png) · 2026-09-23
- [14_faraday_wave_pattern.png](Projects/Floquet Time-Modulated Loops/static/14_faraday_wave_pattern.png) · 2026-09-23
- [10_phase_space_strobe.png](Projects/Floquet Time-Modulated Loops/static/10_phase_space_strobe.png) · 2026-09-23
- [11_bloch_floquet_duality.png](Projects/Floquet Time-Modulated Loops/static/11_bloch_floquet_duality.png) · 2026-09-23
- [07_tongue_anatomy.png](Projects/Floquet Time-Modulated Loops/static/07_tongue_anatomy.png) · 2026-09-23
- [08_multipliers_vs_params.png](Projects/Floquet Time-Modulated Loops/static/08_multipliers_vs_params.png) · 2026-09-23
- [05_strutt_diagram.png](Projects/Floquet Time-Modulated Loops/static/05_strutt_diagram.png) · 2026-09-23
- [01_lti_ltv_boundary.png](Projects/Floquet Time-Modulated Loops/static/01_lti_ltv_boundary.png) · 2026-09-23
- [03_pumped_swing.html](Projects/Floquet Time-Modulated Loops/interactives/03_pumped_swing.html) · 2026-09-23
- [06_strutt_explorer.html](Projects/Floquet Time-Modulated Loops/interactives/06_strutt_explorer.html) · 2026-09-23
- [09_multiplier_visualizer.html](Projects/Floquet Time-Modulated Loops/interactives/09_multiplier_visualizer.html) · 2026-09-23
- [15_kapitza_pendulum.html](Projects/Floquet Time-Modulated Loops/interactives/15_kapitza_pendulum.html) · 2026-09-23
- [02_mathieu_simulator.html](Projects/Floquet Time-Modulated Loops/interactives/02_mathieu_simulator.html) · 2026-09-23
- [20_strutt_sweep.wav](Projects/Floquet Time-Modulated Loops/audio/20_strutt_sweep.wav) · 2026-09-23
- [19_reference_output.wav](Projects/Floquet Time-Modulated Loops/audio/19_reference_output.wav) · 2026-09-23
- [19_reference_noise.wav](Projects/Floquet Time-Modulated Loops/audio/19_reference_noise.wav) · 2026-09-23
- [13d_wavetable.wav](Projects/Floquet Time-Modulated Loops/audio/13d_wavetable.wav) · 2026-09-23
<sub>backfill · scroll born 2026-09-23</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
