---
title: README
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: recipe-for
forward_vector: "I am VST Template's afternoon recipe: how a per-sample numpy sketch becomes a VST3 and AU checked against the sketch it came from, what each check can see, and the gotchas met building it, kept true as the template and its machinery change."
---

# VST Template — from a numpy sketch to a plugin in an afternoon

A per-sample algorithm sketched in numpy becomes a VST3 and AU you can automate in Live, checked against the sketch it came from. JUCE 8 + CMake, cut down from [Tract Mirror](../../Tract%20Mirror/Tract%20Mirror%20—%20build%20plan%20—%20JUCE%20VST.md)'s build.

```
Projects/VST Template/
  new-plugin.py   makes plugins/<Name>/ from template/
  template/       the files a plugin fills in (this folder), with a sine as the example
  machinery/      shared by every plugin: the build, the JUCE wrapper, the harness,
                  the host check, verify.py. A fix here reaches every plugin.
  plugins/        Frustration (the frustration model) and Simple Synth, made from the template
```

## The recipe

1. **Sketch in numpy, one sample at a time.** A loop over samples with the state in plain variables, in the order the C++ will run it. Vectorise across partials or voices if you like (`ride.py` does), but not across time.
2. **Make the plugin folder.** `python3 new-plugin.py "Tape Smear" Tsmr` (add `--kind effect` for an effect). The code is four characters, a capital then three lower case, unique among Loudon Live plugins.
3. **Fill in four files** in `plugins/<Name>/`:
   - `reference/sketch.py`: the sketch, in the shape `render(v, sr, inputs, notes)` described at its top. If it draws random numbers (detunings, starting phases), return them from `constants()`, so the plugin starts from the same draw.
   - `src/Algorithm.h`: the parameter table, then `prepare`, `reset` and `step`, ported line for line from the sketch. Add `noteOn` and `noteOff` to play notes.
   - `reference/paths.py`: parameter moves (and notes) to render through both, and what each must pass.
   - `plugin.json`: under `"hostcheck"`, a few `id=value` moves the host check should hear.
4. **Build:** `./plugin.sh build`. The first build of a plugin takes five to eight minutes, because JUCE compiles once for each of the three targets. Builds after a change to `Algorithm.h` take well under a minute.
5. **Check it against the sketch:** `./plugin.sh verify`. Use `--quick 2` while porting: it cuts every path to two seconds. The sketch's renders are cached until `sketch.py` or `paths.py` changes, so a C++ fix re-checks in seconds. Listen to `out/<path>-plugin.wav`.
6. **Install, validate, host check:** `./plugin.sh install`, then `validate` (pluginval at strictness 5, then auval), then `hostcheck`. `./plugin.sh all` runs build, verify, install, validate and hostcheck in order and stops at the first failure.
7. **In Live:** Settings → Plug-Ins → Rescan, then find it under Plug-Ins → Loudon Live. Every knob in the table is an automation lane.

## Porting so the two match

- **Same operations, same order.** `a*b*c` is `(a*b)*c` on both sides. A numpy `.sum()` adds in a different order than a C++ loop does. The difference is a rounding error, harmless unless the model is chaotic.
- **Scalar code in the sketch uses `math`, not numpy.** `math.exp`, `math.sin` and `math.tan` call the same system library the C++ does, so they agree to the last bit.
- **Wrap phases on both sides** (`p -= floor (p)`). A plugin runs for hours, and an unwrapped phase loses precision. The sketch should wrap too. In Frustration's string–bar path the top partials race at about 176 kHz, and the unwrapped sketch drifted 1.4e-6 of peak from its own wrapped self within 21 s. The C++ was the more exact of the two.
- **Size state for the largest case.** `std::array<double, 96>` with an active count, never a vector resized in `step()`. A choice that changes the state's size (Frustration's partial count) restarts the state, so make it a non-automatable `Choice`.
- **Chaos breaks sample parity, and that is not a bug.** Where a model amplifies rounding (Frustration at the edge), two correct implementations part after a second or two. Find the parting point with a first run, set `exact_until` just short of it, and gate the rest on behaviour (a probe's mean and spread in half-second windows).
- **Know what each gate can see.** The sample-exact stretch is the proof: in Frustration it catches a coupling 0.5 % off at 0.15 of peak. The behaviour gate past the edge only shows the plugin stays in the same regime. There, coupling 5 % off fell inside the scatter between two correct implementations. So every path that crosses into chaos needs an exact stretch before it, and every term of the model needs a path that exercises it while it is still exact.

## The pieces

- **Parameters** (`ParamSpec` in `machinery/src/ParamSpec.h`): an id (stable forever; a host saves automation by it), a name, a unit, a range, a default, a taper and a smoothing time. `Log` is for anything that spans decades (stretch, cutoff, times) and is smoothed in the log domain. `Linear` is for anything even (Hz of coupling, dB, cents). `Choice` and `Toggle` are passed as their index and are never smoothed. The smoothing is a one-pole filter run every sample, 20 ms by default. Set it to 0 for values the algorithm only reads into coefficients, such as envelope times.
- **Probes**: inner values (a fundamental, a cutoff) the step writes for the verify step to compare. They never reach the audio.
- **Notes**: give the algorithm `noteOn (note, velocity 0..1)` and `noteOff (note)`, and the wrapper delivers MIDI to them on the exact sample. Simple Synth is the worked example (mono, last note priority).
- **Effects**: `--kind effect` and `kInputs = 1` or `2`. The path's `inputs` feed the harness, and the host check plays a quiet sawtooth in.

## What the checks prove

- **verify, engine:** `Algorithm::step` run with exactly the sketch's per-sample values, compared sample for sample. Tolerance 1e-6 of peak; a faithful port lands near 5e-8, which is float32 output rounding.
- **verify, plugin:** the real `processBlock`, with automation landing once every 64-sample block through the host-facing parameters, smoothing on, and the notes as MIDI. It must keep the sketch's loudness in every quarter second (within 0.5 dB), match on behaviour where asked, and stay finite, unclipped and not silent.
- **validate:** first `codesign --verify --deep --strict` on both installed bundles, because a broken seal is the one fault the other checks miss and Live's scanner does not. Then pluginval at strictness 5 on the installed VST3 (state, automation, fuzzed parameters, editor), then `auval` on the installed AU.
- **hostcheck:** loads the installed VST3 and AU through JUCE's hosting code, the way a DAW does. It lists the parameters, then moves the `hostcheck` ones and confirms the sound changed. An instrument hears C3 each second.

## Gotchas met building it

- JUCE 8.0.12 removed `AudioPluginFormatManager::addDefaultFormats()`. A host calls `juce::addDefaultFormatsToManager (manager)` instead.
- `AudioProcessor::BusesProperties` is protected, so the bus layout is built in a static member of the processor.
- A VST3 instrument shows its host about 2,080 extra "MIDI CC" parameters (JUCE's MIDI-CC emulation), and a hosted JUCE plugin reports each parameter id as a hash of its string id. The host check hides the proxies and matches the hash.
- **JUCE can break its own code signature.** It signs each bundle ad hoc, but it may write the VST3's `Contents/Resources/moduleinfo.json` after signing; an AU can come out sealed for resources it doesn't have.
  - **Symptom:** Live's `PluginScanner.txt` (in `~/Library/Preferences/Ableton/Live <version>/`) logs "Failed to load plugin: a sealed resource is missing or invalid / VST3: not a plugin". The plugin never reaches Live's browser, and a Set naming it opens with "The VST3 plug-in could not be found". `codesign --verify --deep --strict` on the bundle says "a sealed resource is missing or invalid", or, for the AU, "code has no resources but signature indicates they must be present".
  - **Why the other checks pass anyway:** pluginval, auval and the host check load the code without checking the seal strictly.
  - **The fix in the machinery:** `build` re-seals each bundle ad hoc after JUCE has written everything into it. `install` and `validate` refuse a bundle that fails the strict check.
  - **After installing, the browser may lag the scanner.** Live keeps two databases in `~/Library/Application Support/Ableton/Live Database/`: the scanner's (`Live-plugins-1.db`, table `plugins`) and the browser's index (`Live-files-<n>.db`, table `devices`). On 2026-10-21 both new plugins were in the first, enabled, but not in the second. So neither showed in the browser, even in a freshly launched second Live 12 after a full rescan, while another Live 12 had been running since before they were installed. The scanner log saying "found" is not the same as the browser listing it. Quitting every Live 12 and relaunching is the likely cure (not yet tried). A Set that names the plugin by its class id loads it without the browser.
  - Found on Frustration by the Ableton session on 2026-10-21.
- **To ask whether an AU is registered, name it:** `auval -v aumu <code> Loud`. On this Mac `auval -a` stops partway through the effects, before any instrument, so its list can't answer the question.
- **Live 11 and Live 12 share one bundle id** (`com.ableton.live`). A tool that picks an app by bundle id reaches whichever is first, which was Live 11 with Loudon's show Set. Drive a particular Live by its process id, or not at all.
- `auval` sees a new or changed AU only once it is installed in `~/Library/Audio/Plug-Ins/Components` and `AudioComponentRegistrar` has restarted; `plugin.sh install` does both.
- JUCE is cloned once to `~/Library/Caches/palace-vst-template/JUCE-8.0.12` (override with `JUCE_DIR`), so a worktree or a new plugin never downloads it again.
