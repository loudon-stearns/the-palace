# Blood Compressor: the plugin folder, waiting for the template

The compressor dressed as the body, in VST Template's shape, so it can become a
VST3/AU the day the template can build a plugin whose folder lives in a steward's
bundle. Built 2026-10-24 (steward cycle 10) on Loudon's standing order of
2026-10-21: "lets make them products now." Laid out the way Belief Cloud
(`Bayesian Granular Synthesizer/plugin/`) did it first.

```
plugin/
  plugin.json            Blood Compressor, code Bldc, effect, stereo, CRT on ("screen": true)
  reference/sketch.py    the compressor one sample at a time: render(v, sr, inputs, notes)
  reference/paths.py     seven paths, each gated sample for sample, each exercising one term
  src/Algorithm.h        the port: 9 parameters, stereo in and out, 4 probes for the CRT
  check/                 the exact gate and the listening take, run from here (below)
  ui/visualizer.js       inside the artery, for the CRT: mount(el), frame(probes, params)
  ui/blood_compressor.js the engine in JavaScript, for the face page only
  ui/build_face.py       the whole face in the template's editor → ../blood-compressor-face.html
```

## What the plugin is

The same compressor as the browser vessel (`../stage2-vessel-prototype-v3.html`) and
the RNBO codebox (`../rnbo/blood-compressor.codebox`, v0.2), line for line:

    sidechain high-pass (detector only) → RMS detector, stereo-linked (the louder side)
    → soft-knee gain computer (cubic Hermite: the vessel wall yielding)
    → nerve-conduction delay (fixed 5 ms: the body always has reaction time)
    → attack / release ballistics in dB (baroreceptor reflex / smooth muscle)
    → one gain on both sides, plus makeup

Two changes for the plugin: times are in seconds (the template's unit; the editor
shows ms), and the sidechain high-pass is a knob from 1 to 500 Hz, default 80, where
the codebox fixed it at 80. That hands the entry's open question (80 Hz, the audio
convention, or 0.1 Hz, the body's) to the player.

The parameters, in the editor's panels: the two heroes are **Threshold** (the
systolic line) and **Ratio** (how stiff the vessel wall is). **Vessel wall**: Knee.
**Reflex**: Attack (5 ms to 500 ms; the floor is the body's), Release.
**Baroreceptors**: Detector (the RMS time), Sidechain HPF. **Output**: Makeup, Bypass.

## The check

`python3 check/check_engine.py` compiles `check/engine_check.cpp` (Algorithm.h with
no JUCE, the same command line as the template's Harness) and runs every path through
the sketch, the C++ engine and `ui/blood_compressor.js`, with the template's own
verify.py helpers. On 2026-10-24 both engines matched the sketch to 3–5 × 10⁻⁸ of
peak (float32 output rounding) on all seven paths, and every probe to 10⁻¹². The
numbers are in `out/check-report.json`.

`python3 check/render_take.py` renders the attack lesson through the C++ engine into
`../blood-compressor-attack-lesson.wav`: a drum loop in bypass, then with attack 5 ms,
then 80 ms, then 80 ms with a 40 ms release, each section matched to the same loudness.

This check doesn't cover the template's plugin gate (smoothing, block-wise
automation through processBlock), pluginval, auval or the host check. Those need the
template's build, which can't run from here yet.

**What the numbers showed: this compressor lets the front of every hit through.**
The 5 ms nerve delay sits on the control path only. By the time the vessel closes,
the first 5 ms of a kick have passed at whatever gain the vessel had before it.
On the drum loop (threshold −36, ratio 10), compression *raised* the crest factor
from 14.7 dB (bypass) to 26.3 dB at a 5 ms attack and 21.4 dB at 80 ms. So the
"lunge" the entry promises at the fastest attack can't happen: the body's reaction
time comes first. As a sound, that makes it a punch compressor, one that keeps
transients. Delaying the audio by the same 5 ms would let the vessel close in time,
but that would be a body that sees the future.

## The CRT feed

The visualizer reads only the probe frame (`kProbes` order: pressure, target, squeeze,
reflex) and the parameter values by id. `BloodVessel.frame(probes, params)` is the
whole contract. The template's CRT move (VST Template — baton) needs to stream the
four probes at about 60 Hz. Pressure is a 10 ms RMS, so sampling it at 60 Hz misses
little. Squeeze and reflex are already smooth or held.

What it draws: you are inside the vessel looking downstream. Each ring of the wall is
one frame, born at the glass and travelling away, so each beat rolls off down the
tube. A ring's radius is the pressure that got through. A pale wire ring shows where
the wall would have been with no reflex. Amber dashes mark the systolic line, and wall
pushed past it flushes hot pink. Smooth-muscle bands darken where the vessel squeezes.
A crown of baroreceptors near the glass flares while the reflex fires and sends nerve
sparks down the wall. Blood cells ride the flow at a speed set by what got through.
An in-to-out curve sits in the corner.

## The face, before the template can build it

`python3 ui/build_face.py --shot --fit` builds the template's own editor page (`ui.py`'s
`page()`, Drafting Table on Phosphor, bench direction) from this plugin.json and the
parameter table that `check/engine_check params` prints. It then puts the artery in
the CRT, fed by the JavaScript engine once a frame, the way the CRT feed will feed it.
A strip on the glass stands in for the host: sound on, a heartbeat or a drum loop.
On 2026-10-24 the nine controls fit at 900×580, 1000×640 and 1800×1100, and the page
ran with no errors inside a `sandbox="allow-scripts"` frame, as the board shows it
(`../verify/framed-check.mjs`).

`--set threshold=-40 --set ratio=12 --src drums --t 6` takes a picture of hard squeezing.

It carries Belief Cloud's patch for Drafting Table's knobs, which draw their first
value from the default instead of the binding (its tuning ledger holds the fix for
the house).

## When the template is ready

1. Copy CMakeLists.txt and plugin.sh from any plugin in VST Template/plugins (or let
   new-plugin.py make them here), then `./plugin.sh all`.
2. The exact gate should hold for `engine`. For `plugin`, the template's smoothing
   moves threshold, ratio, knee, sidechain HPF and makeup over 20 ms, so expect the
   0.5 dB loudness gate to be the test.
3. Rerun `ui.py fit`: nine controls under two heroes and a CRT. The minimum here
   (900 × 580) fits the mock page.
4. No Max work: the RNBO codebox and the two Max for Live devices in `../rnbo/` wait
   as teaching tools (standing order of 2026-10-21).
