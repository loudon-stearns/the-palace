# Belief Cloud — the plugin folder, waiting for the template

The Bayesian grain cloud in VST Template's shape, so it can become a VST3/AU the
day the template can build a plugin whose folder lives in a steward's bundle.
Built 2026-10-22 (steward cycle 4) on Loudon's standing order of 2026-10-21:
"lets make them products now."

```
plugin/
  plugin.json            name Belief Cloud, code Blcd, instrument, CRT on ("screen": true)
  reference/sketch.py    the cloud one sample at a time: render(v, sr, inputs, notes)
  reference/paths.py     four paths, every one gated sample for sample
  src/Algorithm.h        the port: 31 parameters, stereo out, 53 probes for the CRT
  check/                 the exact gate, run from here (see below)
  ui/visualizer.js       the belief helix, for the CRT: mount(el), frame(probes, params)
  ui/belief_cloud.js     the engine in JavaScript, for the sketch page only
  ui/belief-helix.template.html, ui/build_helix.js   → ../belief-helix.html
```

## What the plugin is

The notes you hold are evidence. Every grain draws its pitch from what the cloud
believes: a prior, plus a Gaussian bump per note that narrows from `Width at press`
to `Width floor` over `Time to believe`. Grains near a believed note grow long
(up to `Grain longest` cycles), far ones stay short and clicky. `Doubt` is how
much mass the prior keeps against each fully believed note. The prior is the flat
line bent by a register hill and, by `Prior shape`, twelve pitch-class weights
(`Prior C` … `Prior B`), the VST form of the painted prior; `Prior tone` lets its
own peaks lengthen grains, so a painted belief can hum with nothing held.

What changed from bayes_engine.js, on purpose: note slots are a fixed table of 16
(the weakest released note is evicted when it fills); velocity sets how strongly a
note is believed (`Velocity`, 0 = ignore); the prior is twelve knobs, not 630
painted bins; randomness is one seeded 32-bit generator so every implementation
draws the same grains.

## The check

`python3 check/check_engine.py` compiles `check/engine_check.cpp` (Algorithm.h with
no JUCE, same command line as the template's Harness) and runs every path through
the sketch, the C++ engine and `ui/belief_cloud.js`, using the template's own
verify.py helpers. On 2026-10-22 all three matched the sketch to 3–6 × 10⁻⁸ of
peak (float32 output rounding) on all four paths; numbers in out/check-report.json.

`python3 check/render_take.py` renders the 36-second demo performance through the
C++ engine into ../belief-cloud-take.wav.

What this check does not cover: the template's plugin gate (smoothing, block-wise
automation, MIDI through processBlock), pluginval, auval, the host check, and the
editor's fit. Those need the template's build, which can't yet run from here.

## The CRT feed

The visualizer reads only the probe frame (Algorithm.h `kProbes` order) and the
parameter values by id. From those it rebuilds the whole posterior: the prior by the
same painter's rule, each note's width from its conviction. The template's CRT move
(VST Template — baton) needs to stream all 53 probes at about 60 Hz and hand the
page the parameter values; `BeliefHelix.frame(probes, params)` is the whole contract.
`grain_note` and `grain_cycles` are the latest grain only, so at 60 Hz most grains
are never seen; the picture draws its own grains from the same belief and marks the
engine's real ones as rings.

## When the template is ready

1. Copy CMakeLists.txt and plugin.sh from any plugin in VST Template/plugins (or
   let new-plugin.py make them here), then `./plugin.sh all`.
2. Add a `behaviour` or loudness-only gate if the plugin gate's smoothing moves
   `doubt` or `rate` enough to change which grains are drawn: the engine and the
   processBlock run will part, since smoothing changes the per-sample values that
   steer the draws. Expect the exact gate to hold for `engine` and the 0.5 dB
   loudness gate to be the test for `plugin`.
3. `ui.py fit`: 31 controls under two heroes and a CRT. The ui block's minimum
   (1080 × 700) is a guess until fit says otherwise.
