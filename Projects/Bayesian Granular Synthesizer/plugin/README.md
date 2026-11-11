# Belief Cloud — the plugin folder

The Bayesian grain cloud as a VST3/AU instrument, made with VST Template. Begun
2026-10-22 (steward cycle 4) on Loudon's standing order of 2026-10-21, "lets make
them products now"; built, checked and installed on this Mac 2026-11-11 (cycle 6).

To play it: in Live, Settings → Plug-Ins → Rescan, then Plug-Ins → Loudon Live →
Belief Cloud. Hold a chord for a few seconds and let the cloud come to believe it.

`./plugin.sh all` builds, verifies, installs, validates and host-checks it (the
template's machinery, found as VST Template/machinery above this folder). On
2026-11-11 every gate passed: the engine matches the sketch to 3–4 × 10⁻⁸ of peak on
all five paths, the real plugin keeps the sketch's loudness within 0.19 dB in every
quarter second, both bundles pass the strict signature check, pluginval at strictness
5, auval, and the host check on VST3 and AU. `./plugin.sh editor` can't photograph
the real window from here ("NO PICTURE"); proofs/ holds the template's mock of the
editor page with the real engine's probes replayed on the CRT.

```
plugin/
  plugin.json            name Belief Cloud, code Blcd, instrument, CRT on ("screen": true)
  CMakeLists.txt, plugin.sh   from new-plugin.py's shape: find the template's machinery
  proofs/                the editor mock and shot, and the far hush before and after
  reference/sketch.py    the cloud one sample at a time: render(v, sr, inputs, notes)
  reference/paths.py     four paths, every one gated sample for sample
  src/Algorithm.h        the port: 32 parameters, stereo out, 53 probes for the CRT
  check/                 the JUCE-free exact gate (check_engine.py, also holds the JS engine),
                         the demo take, render_hush.py and count_far.py (the far hush measured)
  ui/visualizer.js       the belief helix, for the CRT: mount(el), frame(probes, params)
  ui/belief_cloud.js     the engine in JavaScript, for the sketch page only
  ui/belief-helix.template.html, ui/build_helix.js   → ../belief-helix.html
  ui/build_face.py       the whole face in the template's editor → ../belief-cloud-face.html
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

**Far hush** (added 2026-11-11, on Loudon's note of 2026-11-10: "distant slow random
blips far from the beautiful note intended, we need to de-emphasize those"). A grain
that lands far from every believed note is turned down by `Far hush` dB × far, where
far = certainty × (1 − closeness): certainty is the largest weight × conviction of any
note, closeness the largest exp(−d²/2) to any note in units of `Grain near`. Nothing is
hushed until the cloud believes something, so the flat prior's clicks and the painted
prior's hum with nothing held are as they were. The cause it answers: equal-energy
scaling gives a 4-cycle grain about 15 dB more peak than a 128-cycle one, so each stray
was a spike. Counted grain by grain over C E G at full belief (check/count_far.py):
hush off, the 18 strays a second carry 12.5 % of the energy and peak a median 14 dB
above the chord's grains; at the default 18 dB they carry 0.3 % and peak level with
them. It changes no random draw.

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

`./plugin.sh verify` is the template's own gate on top of this: the same exact match
for the engine, plus the real plugin (smoothing, block-wise automation, MIDI through
processBlock) held to the sketch's loudness. Doubt, Velocity, Grain rate and Spread
are not smoothed: they are read only when a grain is born or the belief ticks, so
they can't zipper, and smoothing them made the plugin draw different grains from the
sketch (the sweeps path parted by 3.6 dB). Unsmoothed, it stays within 0.19 dB.

The host check moves Doubt, Prior shape, Grain near, Grain longest and Far hush one
at a time. Prior tone and the twelve Prior notes knobs can't be host-checked alone:
they only sound once Prior shape is up, which the painted-prior path covers.

## The CRT feed

The visualizer reads only the probe frame (Algorithm.h `kProbes` order) and the
parameter values by id. From those it rebuilds the whole posterior: the prior by the
same painter's rule, each note's width from its conviction. The template's CRT move
(VST Template — baton) needs to stream all 53 probes at about 60 Hz and hand the
page the parameter values; `BeliefHelix.frame(probes, params)` is the whole contract.
`grain_note` and `grain_cycles` are the latest grain only, so at 60 Hz most grains
are never seen; the picture draws its own grains from the same belief and marks the
engine's real ones as rings.

## The face, before the template can build it

`python3 ui/build_face.py --shot --fit` builds the template's own editor page
(`ui.py`'s `page()`, Drafting Table on Phosphor, bench direction) from this
plugin.json and the parameter table `check/engine_check params` prints, then puts
the helix in the CRT, fed by the JavaScript engine once a frame, the way the CRT
feed will feed it. It writes ../belief-cloud-face.html and .png and runs ui.py's fit
test. On 2026-10-22 (cycle 5) the 31 controls fit without scrolling at 1080×700,
1180×760 and 1800×1100.

**Painting the prior.** `BeliefHelix.mount(el, hooks)` with the editor's relays
(`{ set(id, v), begin(id), end(id) }`, here `BINDINGS`) makes the floor dial
paintable: drag a spoke in or out and that pitch class's `Prior …` knob moves; sweep
round to draw a scale; double-click flattens it. Painting a flat-shaped prior turns
`Prior shape` up to 1 first. The painted belief is the twelve parameters, never a
second state, so it automates and saves like any knob. A headless test that fires
pointer events at the dial moved `prior_shape` 0 → 1 and five spokes.

Two things the face taught about the template:

- **Drafting Table's knob and fader draw their first value from the default**, not
  the binding, whenever the editor builds them (`dt-controls.js`:
  `o.value == null ? spec.def : (o.binding ? …)`). In a plugin that means every knob
  shows its default when the editor opens or refits, until its value next changes.
  build_face.py patches its own inlined copy (binding first); the fix for the house
  is proposed in the tuning ledger.
- **The editor stretches every child of the glass to fill it** (`.screen .glass > *`).
  A visualizer that adds its own overlay must undo that (`inset:auto; width:auto;
  height:auto`).
