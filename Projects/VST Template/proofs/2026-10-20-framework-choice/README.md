---
title: README
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: proof-for
forward_vector: "I hold the framework comparison VST Template put to Loudon on 2026-10-20, eight routes from a numpy sketch to a plugin with the timing and parity runs behind the choice of JUCE 8 + CMake, so the reasons can be re-run and re-read if the choice is revisited."
---

# Framework choice: how a numpy sketch becomes a plugin

*Workshop, 2026-10-20. The comparison put to Loudon before any template code, with the two measurements behind it. The decision is his; this page holds the reasons.*

## What has to be ported (the frustration model, from `ride.py`)

One tone of N partials (N = 40 in `ride.py`, 64 or 96 in `ride_warm.py`) is pulled by N outside voices tuned to the plain harmonic series. The state is two phases per partial, the tone's `p[n]` and the voice's `ph[n]`, plus last sample's fundamental `Fp`. Each sample: the stiff-string stretch gives each partial its ratio `r[n] = n·√(1 + B·n²)` (divided by `√(1 + B)` when partial 1 is pinned). Each voice tugs its partial by `s[n] = sin 2π(ph[n] − p[n])`, faded out when the two sit more than about 3 kHz apart. The tugs are summed, weighted by `r[n]`, into the fundamental: `dθ = F0 + BACK·K·Σ r·s`, where `BACK = 21/Σn` stands in for the tone's inertia. Then every phase steps forward once: `p += r·dθ·dt`, `ph += (w − K·s)·dt`. The output is the partials summed at amplitude `n^−0.7` (`ride_warm.py` uses a steeper roll-off and random starting phases), each faded above 16 kHz. It is explicit Euler at 44.1 kHz. B and K are the knobs to automate. Inertia, N and pinning are the other three.

That is a loop over partials inside a loop over samples, with 2N + 1 numbers of state. Whatever we pick has to hold that shape easily, because the next sketch will have the same shape.

## What is on this Mac (checked 2026-10-20)

- **Installed:** Xcode 27.1, cmake 4.3.1, Faust 2.88 (with `faust2juce`, `faust2au`, `faust2vst`, `faust2rnbo`, `faust2cmajor`), pluginval (`/Applications/pluginval.app`), `auval`, Max 9.1.3 with RNBO 1.4.0-dev and the gen~ Plugin Export package, HISE, and Live 11 Suite, Live 12 Suite and the Live 12.4 alpha.
- **Missing:** Rust (no `rustc`, `cargo`, `rustup`), ninja, the Steinberg VST3 SDK at `~/SDKs` (gen~ Plugin Export wants it there), iPlug2, Cmajor.
- **Cached:** JUCE 8.0.12 source, fetched by Tract Mirror's build into its `plugin/build/_deps/juce-src`.

## Two measurements (`run.sh` re-runs both; output in `results.txt`)

**Real-time cost.** `kern.cpp` is the same per-sample body in about thirty lines of plain C++: scalar, libm `sin`, nothing optimised. One voice at 44.1 kHz on the M1 Max uses **2.5 % of one core at N = 40, 4.1 % at N = 64 and 6.6 % at N = 96**. The numpy loop in `ref.py` takes **18 µs a sample, about 80 % of one core, at any N**. Python's per-call overhead sets that figure, not the arithmetic. So the baton's guess that the Python loop is "far from real time" is wrong on this machine: it is just under real time, for one voice with no headroom. It still cannot run inside a plugin, as the Python row below explains. Polyphony is the cost to watch. Eight voices at N = 96 would be roughly half a core with this naive kernel. Working out `r[n]` only when B moves, and a cheaper sine, should cut that several times over. That is an estimate, not yet measured.

**Parity with the sketch.** The C++ port and `ref.py` start from the same random constants and run 3 s at N = 40, K = 6 Hz:

| B | Region | Largest difference (fraction of peak) |
|---|---|---|
| 4e-6 | under the edge (alive) | 4.9e-8 (the float32 floor of the comparison) |
| 8e-5 | well past it | 2e-7 to 3.4e-7 |
| 2.5e-5 | just past the edge | unwrapped phases drift past 1e-3 of peak at 2.1 s; wrapped phases stay within 7.6e-4 for 3 s |

Away from the edge the port matches the sketch sample for sample. At the edge the model amplifies last-bit differences until two correct implementations part company after a couple of seconds. Wrapping the phases (a plugin has to, or it loses precision after a few minutes) changes which bits differ, not the fact. So the parity check has two parts. It is sample-exact (about 1e-6 of peak) away from the edge. At the edge it is behavioural: the fundamental's range and wobble over the same parameter path, not the waveform. The palace has met this before: `Projects/Action Potential Oscillator — scroll.md` L204 records a chaotic system whose single-precision Faust build diverged after 9 ms while keeping the same lock-and-release behaviour.

## The candidates, for Loudon's real use

He sketches in numpy (usually with Claude), plays in Ableton Live 12, and knows Max, RNBO and codebox well. What decides "an afternoon, not a week" is the path from the sketch to a plugin he can automate in Live, and how much of that path a Claude session can walk without his hands.

| Route | The port from numpy | Sketch to installed plugin without Loudon's hands? | Can Loudon edit it himself? | Check against the sketch | Proven here |
|---|---|---|---|---|---|
| **JUCE 8 + CMake** (clone Tract Mirror) | Literal: numpy over partials becomes a C++ `for` over a state struct (`kern.cpp`) | Yes: build, render harness, parity check, pluginval, auval, install, all from the terminal | Through Claude; C++ is not his hand language | Console harness drives the real `processBlock` (Tract Mirror's `RenderHarness.cpp`) | **Yes**, end to end: VST3 + AU, pluginval 5 and 8, auval, loaded in Live 12 |
| **RNBO codebox** (cloud export, or rnbo~ inside Max for Live) | Close: rnboscript has `for` loops and fixed-size `@state` arrays | No. VST3/AU export compiles in Cycling '74's cloud from Max's export sidebar, one click per build | **Yes**, in Max, and playable in Live through Max for Live the same day | No route without Max open. The palace checks codebox text in a Node shim (Blood Compressor, Action Potential), which tests the code, not the export | Loudon has exported his own RNBO VST3s (the LDN tag). No Claude-written Max file has been opened yet, and **new Max work is paused since 2026-10-16** until there are patching standards |
| **gen~ codebox + gen~ Plugin Export** | Close, as RNBO | No, and the export package is from the Projucer era (tested on Xcode 12) and needs the VST3 SDK, which is not installed | Yes, in Max | As RNBO | No. It also falls under the Max pause |
| **Faust → `faust2juce` / `faust2au`** | A translation, not a port: 2N + 1 coupled states with one global sum must become a single `~` recursion over a state tuple | Yes once written | Possibly; Faust is terse | Easy, and proven: Crystal and Action Potential match numpy to about 5e-8 | Offline renders yes. A plugin export: never. The one many-state feedback loop compiled only after a rewrite (`neuropulse-mac-compile-handoff.md`) |
| **iPlug2** | Literal (C++), as JUCE | Yes, after setup | Through Claude | We would build the harness again | No. Not installed; Tract Mirror's signing, validation and Live path would be paid for twice |
| **Rust, nih-plug** | Literal (Rust loops) | Yes, after setup | Through Claude | We would build the harness again | No. No Rust toolchain; no AU output; upstream says the framework is in maintenance mode and points to community forks |
| **Cmajor** | Literal: a C-like per-sample `main()` loop | Partly: its loader plugin can hot-reload code inside a DAW, which is the dream for an afternoon | Yes, a simple language | Unknown | No. Not installed; a small vendor; its loader in Live 12 on macOS 26 is unverified. Worth watching |
| **Python inside the plugin** | None, the sketch itself | — | Yes | Trivial | Not viable. The loop needs 80 % of a core for one voice, and an audio thread cannot run Python: the interpreter lock and an allocation on every array operation mean dropouts |

HISE is installed too, but it is a whole instrument platform built around sampling and its own scripting, heavier than this need.

## Recommendation: JUCE 8 + CMake, cloned from Tract Mirror

The reason is specific. It is the only route on this Mac where a Claude session can carry a sketch all the way to an installed, validated plugin with nobody clicking an export dialog: build, render through the real processor, check against the numpy sketch, pluginval, auval, install. Tract Mirror proved every step of that here in June. The port is also the most literal one. Tonight's thirty-line C++ version matches `ride.py` to the float32 floor away from the edge, and costs 2.5 % of a core at N = 40.

The real cost is that the algorithm lives in C++, so Loudon changes it through Claude rather than by hand. RNBO is the honest alternative for the day he wants his own hands in the code. It fits his Max habit and reaches Live through Max for Live the same day. But its plugin export is a cloud click that no session can script, it has no headless check against the sketch, and new Max work is paused until the patching standards exist. When they do, the template's parameter table could feed a codebox back end as a second target. That is a later move, not part of this one.

## The other five decisions, if JUCE is chosen (defaults, open to his steer)

- **Port path.** Claude ports the per-sample body by hand into one `Algorithm.h`: a `State` struct, a `Params` table and a `process()` that knows no JUCE. The numpy sketch stays the reference implementation, and the template exports the sketch's random constants so both start identically.
- **Parameters.** B on a log taper (about 1e-7 to 30, wide enough for `ride-string-bar`'s pinned glide), K linear 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40 / 64 / 96) and pinning are set-and-forget choices, since N changes the size of the state.
- **Real-time cost.** Mono first: 6.6 % of a core at N = 96 is comfortable. Polyphony is measured before it is promised.
- **The check.** Render `ride.py`'s three paths (breathe, coupling, string–bar) through the plugin's console harness. Exact away from the edge; at the edge, compare the fundamental's range and wobble.
- **Where it lives.** `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next algorithm means one file to fill in and one command to run. The first plugin, built from the template, sits beside it.

Tract Mirror's code allocates memory on the audio thread in two places. That is our own observation, not a repo finding, and pluginval passed anyway, so those parts are not copied.

## Sources

- RNBO plugin export compiles in the cloud, binaries for personal use: https://rnbo.cycling74.com/learn/audio-plugin-target-export-overview
- RNBO codebox fixed-size state arrays (`FixedDoubleArray`), seen in Faust-generated codebox: https://faustdoc.grame.fr/tutorials/rnbo/
- nih-plug maintenance mode: https://github.com/robbert-vdh/nih-plug
- Cmajor: https://cmajor.dev/
- Palace: `Projects/Tract Mirror/Tract Mirror — build plan — JUCE VST.md` (the proven chain); `Projects/Project Stewardship System.md` and `_ops/orchestrator/prompts/shared.md` § Max, Gen~ and RNBO (the pause); `Loudon's Toolkit/Loudon's Toolkit — catalog — inside the computer.md` (his RNBO exports); `DSP Frameworks.md` L131 (Faust for a standalone VST3, written before Tract Mirror).
