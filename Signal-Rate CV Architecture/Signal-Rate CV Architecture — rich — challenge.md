---
title: "Signal-Rate CV Architecture — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Signal-Rate CV Architecture]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of this page's proposed rich face, piece by piece and offer by offer, with every number re-run on engines built fresh, so Loudon can take or leave each one knowing which parts held when someone else pushed on them."
---

# Challenge — Signal-Rate CV Architecture's rich face, proposal round 2026-11-03

Challenger: claude-opus-5-5, who did not make this face. Judged from the page, the pieces and the maker's commit body (`0c88157d`), nothing else of the maker's.

## The pieces

### the leak on a jack — Three Converging Arguments — **keep**

1. **Test or decoration?** A test. Step 5 feeds one LFO to two membranes, one reading τ every sample and one holding it per 128-sample block, and measures what they don't share. If per-sample math mattered at every rate, the curve would sit high everywhere. It doesn't, and that finding is offer 1.
2. **Faithful?** It plays the section's own example (an LFO on the leak τ) and the modular argument (step 4, past 20 Hz). Where it disagrees with the text (a slow sweep sounds the same at block rate; the pitch bends) it says so as a measurement and the disagreement sits in the offers, not in the text. Step 5 switches to the tracking drive and says so ("From here on the drive tracks the charge"). I checked that the choice doesn't decide the result: under the engines' own from-rest drive the two membranes' pitch stays within one sample (4 cents) of each other up to a 0.5 Hz LFO.
3. **Walks up?** Yes: one ramp, τ by hand, τ on an LFO, the LFO into audio rate, then the test. Each step has a way back. Note, not a remake: step 3 carries two ideas, the jack and the drive's pitch bend (with a toggle). The bend could be its own step between 3 and 4, or live on the Action Potential Oscillator's face, so step 3 is only "the knob becomes a jack". Taste; it stands as is.

Runs clean: no audio context before a click, suspended when the tab is hidden, never names `rich:hush`, needs nothing outside its file.

### neuropulse-codebox-phrase.wav (gathered) — Practical Consequences in Gen~ / RNBO — **keep**

1. **Test or decoration?** Decoration, honestly labelled. It shows the architecture as built: the crowd codebox with every control an `in~` (`rnbo/neuropulse-crowd.codebox:12-24`) and coupling breathing on an LFO patched into its inlet. Nothing in it could come out differently if the text were wrong. It is the section's only built instance, it costs nothing (tracked, not copied), and gathering is step 1 of the ceremony.
2. **Faithful?** The caption matches the steward's own account (`Action Potential Oscillator — scroll.md:208`) and says it was never heard in Max. Note: its LFO is 0.2 Hz, the slow case that offer 1 shows needs no per-sample math. It witnesses the jack, not the rate. The caption doesn't claim the rate, so it holds.
3. **Walks up?** Not applicable; it is a single sound.

The headless load logged one `net::ERR_ABORTED` on this file. The server returns it whole (200, 2 304 044 bytes, `audio/wav`); this is Chromium dropping a media preload, not a missing file.

### the zero guard — Practical Consequences in Gen~ / RNBO — **remake**

1. **Test or decoration?** A test, and a good one. It runs the dev plan's stage 2 as written (`neural_oscillator_dev_plan.md:169-189`) and asks whether the guard's floor still sings. The section's rule could have passed outright, and half of it doesn't.
2. **Faithful?** Mostly, with one misattribution that matters. Step 4's verdict, and offer 3, blame the guard's floor for two failures, and only one of them belongs to the floor:
   - **Silence** is the floor's. When the period runs past about 35 time constants, the charge closes on threshold to within the last bit of a double, and rounding decides whether it ever fires. This happens with any drive aimed to land exactly on threshold from rest, and I found it in the palace's other two engines too (below).
   - **Sharpness** is the plan's drive, at every τ, not just at the floor. The drive uses the continuous decay e^(−P/τ) while the leak is the discrete 1 − 1/τ, so the plan's code plays sharp by a factor of about 1 + 1/(2τ): 17 cents at τ = 1 ms, whatever the note. Swap in the discrete-exact drive, (1 − c)/(1 − c^P), and the same code plays in tune at 110 Hz from τ = 0.29 ms, not 3.3. The only thing left failing at the floor is the silence.

   Remake, one round: in step 4's verdict, keep the silent limit as the guard's finding (τ ≳ P/35 samples, so the floor depends on the note). Name the sharp limit as the plan's drive, and give the "in tune from" figures as "with the plan's drive", or drop them. Give the edges from a fine scan, not the map grid: at 48 kHz, 3.34 / 1.93 / 1.05 ms at 110 / 220 / 440 Hz, where the map gives 3.95 / 2.30 / 1.12. The step-4 equation text already separates the two limits correctly; the verdict paragraph just needs to follow it.
3. **Walks up?** Yes: where τ goes, the cable pulled, the guard, the map. One idea per step, and each step can be played.

Runs clean, as above. At the headless device rate (44.1 kHz) it measures live and reports 44.1 figures (silent to about 247 Hz on its grid, up to 259 cents sharp). That is honest, but these are further from the offer's 48 kHz numbers than "move a little" suggests.

## Checks run

- `conform.mjs "Signal-Rate CV Architecture"`: 2 pieces introduced, **0 errors, 0 warnings**, browser pass at 760 and 1130 px.
- `fingerprint.mjs`: both made sections **in step** (02250de168c3, e94d869ef6bc).
- `Signal-Rate CV Architecture — rich — checks.mjs`: all pass, 48 kHz.
- The `.md` is byte-for-byte what it was before the maker's commit.
- rich-server on the worktree, headless Chromium: three `proposal · 2026-11-03` chips, both pieces walk all their steps, no context before a click, `running` after play, `suspended` after the tab is hidden. The console is **clean** apart from the benign media abort above.
- Fresh engines in Node: the two membranes, three drives, and the plan's stage 2 line for line. The **real neuropulse.dsp** built with Faust 2.88 here, through its own `faust-render/arch.cpp`, in single (Faust's default) and double precision. The **crowd codebox** run as written through a shim like its own `rnbo/codebox-harness.mjs`.

## The offers

**1 · slow LFO sounds the same at block rate — confirmed; it sharpens the page, it doesn't refute it.** Rebuilt fresh at 110 Hz, τ 1–15 ms log, 48 kHz: −66.7 / −63.5 / −54.9 / −41.0 / −29.0 / −17.6 dB at 0.1 / 0.25 / 0.5 / 2 / 8 / 30 Hz, the maker's figures to the tenth. A 300 Hz LFO folds to |300 − 375| = 75 Hz. At the block rate the held τ is a constant √15 = 3.873 ms. At 44.1 kHz every figure is within 1 dB. Under the engines' own from-rest drive the waveform difference stops meaning anything (the two drift in phase), but their pitch tracks stay within one sample up to 0.5 Hz, so the finding stands under that drive too.

Judgement: the pedagogical paragraph sets per-sample against "a UI abstraction", not against block rate. What the slow example earns is the **jack**: a gen~ `param` can't take an LFO at all without a conversion, which is the boundary the modular argument names. What it doesn't earn is the **rate**. So the page isn't wrong that signal rate matters. It is loose about where it matters: from tens of Hz up, which is the modular argument's ground. The proposed sentence is right, with one wording fix: past half the block rate a block input doesn't fail to follow, it follows the wrong motion. Suggest "…and past half the block rate it reads the wrong motion, and at the block rate none at all."

**2 · τ moving inside a cycle bends the pitch — confirmed. The numbers are about the engines; the lesson is about the page.** Re-run: 4.0 / 11.9 / 31.7 / 138.6 / 559.6 cents at 0.1 / 0.25 / 0.5 / 2 / 8 Hz with the discrete from-rest drive. The plan's own exp() drive gives 7.9 / 7.9 / 35.9 / 139.2 / 550.9, and the tracking drive holds at 437 samples throughout.

Why it bends: the leak integrator's state heads for V∞ = I·τ. The from-rest drive picks I so that V∞ = 1/(1 − c^P), and that target moves with τ. The state V keeps no record of τ, so the place in the cycle it implies, n = ln(1 − V/V∞)/ln c, jumps whenever τ moves. A rising τ puts the charge ahead (sharp) and a falling τ behind (flat), by an amount that grows with dτ/dt. So the bend grows linearly with LFO rate. A first-order integral of ∂n/∂τ·dτ over one cycle predicts 34 / 137 / 546 cents at 0.5 / 2 / 8 Hz, against 32 / 139 / 560 measured. Below 0.5 Hz the swing is under about four samples and whole-sample firing dominates, so the "12 cents at 0.25 Hz" is 3 samples at a 1-sample (4-cent) resolution: real, but at the measuring floor.

The tracking drive reaches 1 from wherever V actually is, in the samples actually left. It is the same equation with the state put back in.

The offer names neuropulse.dsp v0.4 among the engines that bend. Read closely, it does use a from-start drive: `charge_drive` latches v0 and takes the whole charge budget m (neuropulse.dsp:75-78), not the live V. Built and run, it bends **less**: 4 / 12 / 60 / 236 cents at 0.25 / 0.5 / 2 / 8 Hz, the same in single and double precision, because its charge is only part of the period. The crowd codebox's drive (line 92) is from rest, like stage 2.

Where it belongs: the numbers and the fix are the Action Potential Oscillator's, as the offer itself says. For this page I'd offer the architectural lesson rather than a pitch clause. Reading an inlet every sample isn't enough; any quantity worked out as if the input held still (here the drive) has to be worked out again for an input that moves. That lesson belongs on the page that argues for signal rate.

**3 · the 0.1 ms floor is silent, then sharp — confirmed on the plan's line; half of it is the guard's.** Run fresh, doubles. At 48 kHz the floor is 4.80 samples. It is silent up to **282.8 Hz** on a fine scan (the map's 277 is a grid point; the estimate e^(−P/τ) < half an ulp gives about 272 Hz). It plays **186–194 cents sharp** above, against 198 predicted from −τ·ln(1 − 1/τ). At 44.1 kHz it is silent to 267 Hz and 206–218 cents sharp. Unguarded, τ = 0 gives NaN on the first sample, and a negative τ doesn't NaN. All as the maker says.

The silent half is the guard's finding and stands. The sharp half is the plan's drive, as set out under the zero guard above: it should go to the Action Potential Oscillator as a bug in the plan's stage 2, since `neural_oscillator_dev_plan.md:217` expects the drive to "compensate exactly" and at τ = 1 ms it is 17 cents out. The proposed sentence ("the floor set where the math still holds… depends on the note") is supported by the silent half alone; keep it.

**The maker's open question: does the silent floor appear in neuropulse.dsp and the crowd codebox? Yes, in both.** Neither is sharp at the floor, because both use pow().

- **neuropulse.dsp v0.4**, built here; crowd with spread 0, K 0; τ = 0.1 ms, which is also the τ knob's own minimum (neuropulse.dsp:157).
  - In double precision it is silent at every note up to about 294 Hz and plays from 311.
  - In **single precision**, Faust's default and how `faust-render/render_sweep.py` builds it, it is silent at every note through 440 Hz. At 110 Hz it stays silent up to τ = 0.5 ms and plays from 0.75. In double it is silent up to 0.25 ms and plays from 0.3.
  - With the default spreads the crowd isn't silent, but a share of it misfires: each neuron averages 22 Hz (double) or 39 Hz (single) at 110 Hz.
- **Crowd codebox**, doubles, `in~ 4` = 0 so τ floors at 0.1 ms.
  - With spread 0 it is silent up to about 156 Hz and plays from 196 Hz. At 110 Hz it is silent up to τ = 0.15 ms and plays from 0.2.
  - With the default spread it runs at 49.5 Hz per neuron at 110 Hz.
  - The band is narrower than stage 2's because the spike and refractory time come out of the charge.

These belong to the Action Potential Oscillator, most of all the single-precision one, since a reader turning the knob to its lowest silences the instrument.

## The face as a whole

It makes the page's idea felt, and it pushes back. Both walks take the section's own claim and run it until it gives. The leak on a jack shows that what a slow LFO buys is the jack, not the rate, and that the rate starts paying from tens of Hz. The zero guard shows that keeping a value off zero is not the same as keeping it where the math works. Neither is busy: each step has one thing to hear, and the measurements are run on the same engine that sounds. The two side findings reach past the page into the Action Potential Oscillator's engines (the drive that bends, the drive that runs sharp, the floor that goes silent in all three). That is where they should be carried. On this page the shared lesson is the architectural one: signal rate means writing the math for an input that moves, not just reading it every sample.
