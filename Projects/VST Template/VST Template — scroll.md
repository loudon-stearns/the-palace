---
title: "VST Template — scroll"
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am VST Template's scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# VST Template — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[VST Template]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A reusable plugin template at `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next numpy sketch becomes a plugin with one file to fill in and one command to run. The build, the JUCE wrapper, the harness, the host check and `verify.py` live once in a shared `machinery/` folder, so a plugin folder holds only what it fills in, and a fix to the machinery reaches every plugin. Two plugins come first. **Frustration** is the frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`, with B and K automatable. **Simple Synth**, one oscillator, one filter and one amplifier with envelopes and a vibrato LFO, is the template's worked example of playing MIDI notes. It is built on JUCE 8 + CMake, cloned from [[Tract Mirror]].

**The moves ahead**

1. **Build the template and its example.** Tract Mirror's JUCE scaffold, cut down to a template: the algorithm in one `Algorithm.h` that knows no JUCE, a console render harness, and `new-plugin.py`.
2. **Make the Frustration plugin and check it against `ride.py`.** Port the per-sample body into the template, render `ride.py`'s three paths (breathe, coupling, string–bar) through the harness, and compare. Away from the edge it must match sample for sample. At the edge the check is behavioural: the fundamental's range and wobble, not the waveform.
3. **Make Simple Synth and check it against its sketch.** One oscillator, one filter and one amplifier, with envelopes and a vibrato LFO, played from MIDI notes. Nothing in it is chaotic, so every path must match its sketch sample for sample.
4. **Validate, install, and prove they load.** pluginval and auval for both plugins, install to the user plug-in folders, then load them in a host and in Live 12.
5. **Write the afternoon recipe.** How the next sketch gets from numpy to an installed plugin in one afternoon.

**The five defaults Loudon accepted** (from the framework comparison, `Projects/VST Template/proofs/2026-10-20-framework-choice/README.md`):

- **Port path.** Claude ports the per-sample body by hand into `Algorithm.h`: a `State` struct, a `Params` table and a `process()`. The numpy sketch stays the reference, and the sketch's random constants are exported so both start identically.
- **Parameters.** B on a log taper from about 1e-7 to 30, K linear from 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40, 64 or 96) and pinning are set-and-forget.
- **Real-time cost.** Mono first. Polyphony is measured before it is promised.
- **The check.** As in the second move.
- **Where it lives.** `Projects/VST Template/template/` and `new-plugin.py`, with the plugins beside the template.

Agreed by Loudon on 2026-10-20, in the VST Template session. Simple Synth was added on his word the same evening.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="proof-2026-10-21-seal" -->
### 2026-10-21 — A broken seal: Live 12 refused Frustration after every other check had passed
> JUCE could break its own code signature. Live's scanner checks the seal; pluginval, auval and the host check do not. The machinery now re-seals every bundle and gates on a strict check.

- **The symptom.** Live's `PluginScanner.txt` at 23:50:08 on 2026-10-20: "Failed to load plugin: a sealed resource is missing or invalid", then "VST3: not a plugin". Frustration never reached Live, and a Set naming it opened with "The VST3 plug-in could not be found".
- **The cause.** JUCE signs each bundle ad hoc during the build and can then write the VST3's `Contents/Resources/moduleinfo.json`, so the signature no longer covers the bundle. Both AU components were sealed for resources they don't have. Simple Synth's VST3 happened to come out whole.
- **Why the other checks passed.** pluginval, auval and the host check load a bundle's code without checking its seal strictly. Live's scanner does check it.
- **The check.** `codesign --verify --deep --strict` on the bundle shows all three faults.
- **The fix** (`machinery/plugin.sh`). `build` re-seals each bundle ad hoc after JUCE has finished writing into it. `install` refuses a bundle that fails the strict check, and `validate` opens with that check before pluginval and auval. After the fix all four installed bundles pass, Live's scanner logged "found: Frustration" and "found: Simple Synth" at 00:03, and `validate` passes for both. The gotcha is in the recipe, `template/README.md`.

**Artifacts:**
- [README.md — the seal proof, and the Live 12 load that was not done](Projects/VST Template/proofs/2026-10-21-seal/README.md)
- [PluginScanner-excerpt.txt — Live's scanner log, before and after the re-seal](Projects/VST Template/proofs/2026-10-21-seal/PluginScanner-excerpt.txt)
- [codesign.txt — the strict check on all four bundles, before and after](Projects/VST Template/proofs/2026-10-21-seal/codesign.txt)
- [Frustration-validate.txt](Projects/VST Template/proofs/2026-10-21-seal/Frustration-validate.txt)
- [SimpleSynth-validate.txt](Projects/VST Template/proofs/2026-10-21-seal/SimpleSynth-validate.txt)

_Left rough:_ the Live 12 load is still not done: Live's browser index never listed the two plugins, even after a full rescan in a fresh second instance; the long-running instance, with an unsaved Set, was not restarted; its audio device is set to No Device, so no sound could have been checked; the plan's "load them in Live 12" stays open.
<sub>`proof-2026-10-21-seal` · written by hand · the fix landed in `321f157c`, the proof in `a9f65ac2`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-20T23-48-02-04-00" -->
### 2026-10-20 — Plan revised: a second plugin, Simple Synth

Mid-build, Loudon asked for a second plugin: "Try to make another in addition to the frustration plugin, something simple and obvious, like a one oscillator, one filter, one amplifier synth with envelopes for oscillator, filter and an lfo for vibrato". The plan gains Simple Synth as the template's worked example of MIDI notes, with a move of its own (the third), and the validation move now covers both plugins. It also records that the template grew a shared `machinery/` folder (`d180e0fa`), so a plugin folder holds only what it fills in.

_The plan before this change:_

> **Where this is going.** A reusable plugin template at `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next numpy sketch becomes a plugin with one file to fill in and one command to run. The first plugin made from it is **Frustration**, the frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`, with B and K automatable. It is built on JUCE 8 + CMake, cloned from [[Tract Mirror]].
>
> **The moves ahead**
>
> 1. **Build the template and its example.** Tract Mirror's JUCE scaffold, cut down to a template: the algorithm in one `Algorithm.h` that knows no JUCE, a console render harness, and `new-plugin.py`.
> 2. **Make the Frustration plugin and check it against `ride.py`.** Port the per-sample body into the template, render `ride.py`'s three paths (breathe, coupling, string–bar) through the harness, and compare. Away from the edge it must match sample for sample. At the edge the check is behavioural: the fundamental's range and wobble, not the waveform.
> 3. **Validate, install, and prove it loads.** pluginval and auval, install to the user plug-in folders, then load it in a host and in Live 12.
> 4. **Write the afternoon recipe.** How the next sketch gets from numpy to an installed plugin in one afternoon.
>
> **The five defaults Loudon accepted** (from the framework comparison, `Projects/VST Template/proofs/2026-10-20-framework-choice/README.md`):
>
> - **Port path.** Claude ports the per-sample body by hand into `Algorithm.h`: a `State` struct, a `Params` table and a `process()`. The numpy sketch stays the reference, and the sketch's random constants are exported so both start identically.
> - **Parameters.** B on a log taper from about 1e-7 to 30, K linear from 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40, 64 or 96) and pinning are set-and-forget.
> - **Real-time cost.** Mono first. Polyphony is measured before it is promised.
> - **The check.** As in the second move.
> - **Where it lives.** `Projects/VST Template/template/` and `new-plugin.py`, with the first plugin beside the template.
>
> Agreed by Loudon on 2026-10-20, in the VST Template session.
<sub>`plan-2026-10-20T23-48-02-04-00` · plan revised · agreed 2026-10-20T23:48:02-04:00 · written by the Concierge on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-20-first-plugins" -->
### 2026-10-20 — Both plugins through every check, and how the tolerances were set
> Frustration and Simple Synth, made from the template: checked against their sketches, validated, installed, and loaded through a host.

Both plugins were taken all the way: built, checked against their numpy sketches, validated, installed to `~/Library/Audio/Plug-Ins`, and loaded through JUCE's own hosting code. Everything in the proof folder was produced by the commands its README names.

- **Against the sketch.** Frustration's engine matches to 3.8e-8 to 5.8e-8 of peak wherever the tone holds. Past the edge it stays in the same regime: within 0.23 to 1.33 Hz on half-second windows, against a 2 Hz gate. Simple Synth matches to 3.0e-8 to 4.1e-8 of peak on all five paths. Through the real plugin, loudness per quarter second stays within 0.14 dB of the sketch for Frustration and 0.66 dB for Simple Synth (its resonant sweep, allowed 1.5).
- **Validation.** pluginval at strictness 5: SUCCESS, 19 test groups, for both. auval: AU VALIDATION SUCCEEDED for both. The host check loads the installed VST3 and AU, renders the defaults twice and gets the same sound, then moves each named knob alone and hears it change against a control render from the same start.
- **What calibration taught** (`calibration.txt`). The behaviour gate past the edge cannot see a few-percent error: a port with coupling 5 % off fell inside the scatter between two correct ports, so that gate says only "same regime". The exact stretch can: coupling 0.5 % off shows at 0.15 of peak within two seconds. A drift that looked like chaos was precision in the sketch's unwrapped phases; the sketch now wraps, and both paths are exact end to end. And a real fault surfaced: Simple Synth at resonance 0.85 peaked at +1.4 dBFS, in the sketch too, and a tanh soft clip on its output fixed it.

**Artifacts:**
- [README.md — the proof, what passed and how the tolerances were set](Projects/VST Template/proofs/2026-10-20-first-plugins/README.md)
- [calibration.txt — the runs behind the tolerances](Projects/VST Template/proofs/2026-10-20-first-plugins/calibration.txt)
- [Frustration-verify.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-verify.txt)
- [Frustration-validate.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-validate.txt)
- [Frustration-hostcheck.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-hostcheck.txt)
- [SimpleSynth-verify.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-verify.txt)
- [SimpleSynth-validate.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-validate.txt)
- [SimpleSynth-hostcheck.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-hostcheck.txt)
- [chaos_floor.py](Projects/VST Template/proofs/2026-10-20-first-plugins/chaos_floor.py)
- [exact_catches.py](Projects/VST Template/proofs/2026-10-20-first-plugins/exact_catches.py)
- [wrap_test.py](Projects/VST Template/proofs/2026-10-20-first-plugins/wrap_test.py)

_Left rough:_ neither plugin has been loaded in Live 12 yet (two instances of Live were running on Loudon's Mac, so it was left alone until he says); polyphony is not built or measured, and both plugins are mono; Frustration has no limiter and can pass full scale with Voices at full and Level above -6 dB.
<sub>`proof-2026-10-20-first-plugins` · written by hand · the proof landed in `bdf08d3a`, the host check's control render in `7ce661de`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plugin-2026-10-20-frustration" -->
### 2026-10-20 — Frustration: ride.py's frustration model as a plugin, with Stretch (B) and Coupling (K) automatable
> The commission's test case, and the first plugin made from the template.

One stretched tone of 40, 64 or 96 partials is pulled toward the plain harmonic series by as many outside voices, and near the edge it tears and heals. It drones as soon as it loads; Pitch sets the note. The knobs are Stretch (B, a log taper from 1e-7 to 30), Coupling (K, 0 to 20 Hz), Inertia, Pitch, Voices, Level, Partials, Pin partial 1, and Source (bright is `ride.py`, warm is `ride_warm.py`). It was checked against `ride.py`'s three renders, `ride_warm.py`'s breathe at 64 partials, and a walk through the extra knobs. One instance costs about 2.5 % of one M1 Max core at 40 partials and 6.6 % at 96.

**Artifacts:**
- [README.md — the knobs, what to try, what it was checked against](Projects/VST Template/plugins/Frustration/README.md)
- [Algorithm.h — the port](Projects/VST Template/plugins/Frustration/src/Algorithm.h)
- [sketch.py — the numpy reference](Projects/VST Template/plugins/Frustration/reference/sketch.py)
- [paths.py — the paths it must pass](Projects/VST Template/plugins/Frustration/reference/paths.py)
- [the breathe path, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-ride-breathe-plugin.m4a)
- [the coupling path, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-ride-coupling-plugin.m4a)
- [the string–bar path, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-ride-string-bar-plugin.m4a)

_Left rough:_ there is no limiter, so with Voices at full and Level above -6 dB it can pass full scale; it is mono; it has not been loaded in Live 12 yet.
<sub>`plugin-2026-10-20-frustration` · written by hand · landed in `d53bca00`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plugin-2026-10-20-simple-synth" -->
### 2026-10-20 — Simple Synth: one oscillator, one filter, one amplifier, the template's worked example of MIDI notes
> Asked for mid-build: a second plugin beside Frustration, simple and obvious.

Mono, with last-note priority: a new note retriggers the envelopes, and letting go of it while an older note is still held returns the pitch to that note without a retrigger. The oscillator has four waves (saw and square band-limited with polyBLEP), a pitch envelope, and a sine LFO for vibrato. The filter is a two-pole state-variable low-pass with its own envelope and key tracking; the amplifier has its own envelope and velocity. A tanh soft clip on the output keeps a resonant patch under full scale. Nothing in it is chaotic, so every path (a melody, a resonant sweep, the pitch envelope and vibrato under a held note, each waveform, slow envelopes) must match the sketch sample for sample, and does, to 3.0e-8 to 4.1e-8 of peak.

**Artifacts:**
- [README.md — what it holds and what it was checked against](Projects/VST Template/plugins/SimpleSynth/README.md)
- [Algorithm.h — the port](Projects/VST Template/plugins/SimpleSynth/src/Algorithm.h)
- [sketch.py — the numpy reference](Projects/VST Template/plugins/SimpleSynth/reference/sketch.py)
- [paths.py — the paths it must pass](Projects/VST Template/plugins/SimpleSynth/reference/paths.py)
- [a melody, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-melody-plugin.m4a)
- [the resonant filter sweep, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-filter-sweep-plugin.m4a)
- [the pitch envelope and vibrato with a held note, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-pitch-vibrato-legato-plugin.m4a)

_Left rough:_ it is mono, with no polyphony; it has not been loaded in Live 12 yet.
<sub>`plugin-2026-10-20-simple-synth` · written by hand · landed in `cafe611c`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="template-2026-10-20" -->
### 2026-10-20 — The template: one Algorithm.h and a numpy sketch become a JUCE 8 VST3/AU, on machinery every plugin shares
> The plan's first move: Tract Mirror's JUCE build, cut down to what a new algorithm needs.

`new-plugin.py "Name" Code` makes `plugins/<Name>/` from `template/`, carrying only the files a plugin fills in: the numpy sketch, `src/Algorithm.h` (the parameter table, then `prepare`, `reset` and `step`, ported line for line), the paths to render through both, and `plugin.json`. Everything else lives once in `machinery/`: the CMake build, the JUCE wrapper, the console harness, the host check and `verify.py`, so a fix there reaches every plugin. MIDI notes reach the algorithm's `noteOn` and `noteOff` on the exact sample. `./plugin.sh all` builds, checks against the sketch, installs, validates and runs the host check, and stops at the first failure. The example in `template/` is a sine, Hello Sine. The recipe in `template/README.md` is written for the next afternoon, with what each check can see and the gotchas met building it.

**Artifacts:**
- [README.md — the afternoon recipe](Projects/VST Template/template/README.md)
- [new-plugin.py — copies the template into a new plugin](Projects/VST Template/new-plugin.py)
- [Algorithm.h — the example sine, to replace](Projects/VST Template/template/src/Algorithm.h)
- [plugin.cmake — the shared build](Projects/VST Template/machinery/plugin.cmake)
- [plugin.sh — build, verify, install, validate, hostcheck](Projects/VST Template/machinery/plugin.sh)
- [PluginProcessor.cpp — the JUCE wrapper](Projects/VST Template/machinery/src/PluginProcessor.cpp)
- [Harness.cpp — the console render harness](Projects/VST Template/machinery/src/Harness.cpp)
- [HostCheck.cpp — the host check](Projects/VST Template/machinery/src/HostCheck.cpp)
- [verify.py — the check against the sketch](Projects/VST Template/machinery/tools/verify.py)

_Left rough:_ polyphony is not built: the wrapper hands every note to one algorithm; no effect has been made from it yet (all three `plugin.json` files are instruments); nothing made from it has been loaded in Live 12 yet.
<sub>`template-2026-10-20` · written by hand · landed in `ad7aa657`, the shared machinery and MIDI notes in `d180e0fa`</sub>
<!-- /scroll:entry -->


<!-- scroll:entry id="plan-2026-10-20T22-53-01-04-00" -->
### 2026-10-20 — Plan agreed: JUCE 8 + CMake, cloned from Tract Mirror

Loudon read the framework comparison and said: "Go with JUCE 8 + CMake cloned from Tract Mirror, and your defaults for the other five decisions." That settles the framework, which the baton left to him, and the five defaults the comparison proposed: the port path, the parameters, the real-time cost, the check, and where it lives. The four moves follow the baton's next move: the template first, then the frustration model as its first test.
<sub>`plan-2026-10-20T22-53-01-04-00` · plan agreed · agreed 2026-10-20T22:53:01-04:00 · written by the Concierge on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-20-framework-choice" -->
### 2026-10-20 — How a numpy sketch becomes a plugin: eight routes compared, and the kernel ported and timed
> Before any template code: the routes from a numpy sketch to a plugin Loudon can automate in Live 12, checked against this Mac, with two measurements behind the choice.

Eight routes were compared for Loudon's real use: JUCE 8 + CMake, RNBO codebox, gen~ Plugin Export, Faust, iPlug2, Rust with nih-plug, Cmajor, and Python inside the plugin. To ground the comparison, the per-sample body of `ride.py` was ported to about thirty lines of plain C++ (`kern.cpp`), timed, and checked against a numpy reference (`ref.py`).

- **Cost.** One voice at 44.1 kHz on the M1 Max uses 2.5 % of one core at N = 40, 4.1 % at N = 64 and 6.6 % at N = 96. The numpy loop takes about 80 % of a core at any N.
- **Parity**, over 3 s at N = 40, K = 6 Hz. Under the edge (B = 4e-6) the port matches to 4.9e-8 of peak; well past it (B = 8e-5), to between 2e-7 and 3.4e-7. Just past the edge (B = 2.5e-5), two correct ports part company: the unwrapped phases drift past 1e-3 of peak at 2.1 s. So the check at the edge has to be behavioural.
- **The recommendation** was JUCE 8 + CMake cloned from Tract Mirror, the only route on this Mac that a Claude session can walk from sketch to installed, validated plugin with no export dialog. Loudon chose it; see the plan above.

**Artifacts:**
- [README.md — the comparison, the recommendation and the five defaults](Projects/VST Template/proofs/2026-10-20-framework-choice/README.md)
- [kern.cpp — ride.py's per-sample body in C++](Projects/VST Template/proofs/2026-10-20-framework-choice/kern.cpp)
- [ref.py — the numpy reference](Projects/VST Template/proofs/2026-10-20-framework-choice/ref.py)
- [cmp.py — the parity comparison](Projects/VST Template/proofs/2026-10-20-framework-choice/cmp.py)
- [results.txt — the timing and parity numbers](Projects/VST Template/proofs/2026-10-20-framework-choice/results.txt)
- [run.sh — re-runs both checks](Projects/VST Template/proofs/2026-10-20-framework-choice/run.sh)

_Left rough:_ the cost of polyphony is not measured yet (eight voices at N = 96 is estimated at about half a core with this naive kernel), and the RNBO route waits until the Max patching standards exist.
<sub>`proof-2026-10-20-framework-choice` · written by hand · the proof landed in `b5d84c83`</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
