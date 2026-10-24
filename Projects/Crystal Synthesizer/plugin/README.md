# Crystal Synthesizer: the plugin folder

The ringing crystal in VST Template's shape, so it can become a VST3/AU the day the
template can build a plugin whose folder lives in a steward's bundle. Built
2026-10-24 (steward cycle 13) on Loudon's standing order of 2026-10-21: "lets make
them products now." Laid out the way Belief Cloud (`Bayesian Granular
Synthesizer/plugin/`) did it first.

```
plugin/
  CMakeLists.txt         finds VST Template's machinery/ beside this bundle
  plugin.sh              build | verify | install | validate | hostcheck | all
  plugin.json            Crystal Synthesizer, code Crys, instrument, stereo, CRT on ("screen": true)
  reference/sketch.py    eight struck crystals, one sample at a time: render(v, sr, inputs, notes)
  reference/paths.py     five paths, each gated sample for sample, each exercising one term
  src/Algorithm.h        the port: 12 parameters, stereo out, 34 probes for the CRT
  check/                 the exact gate and the listening take (below)
  ui/visualizer.js       light through fog, for the CRT: mount(el), frame(probes, params)
  ui/crystal_engine.js   the engine in JavaScript, for the face page only
  ui/build_face.py       the whole face in the template's editor → ../crystal-synthesizer-face.html
```

## What the plugin is

The ringing voice of `../crystal-rings/` (each phonon mode a two-pole resonator,
struck by one raised-cosine pulse, its Q from the mineral's Raman line width), made
eight-voice in one engine, with the two optical properties the summer proofs
rendered as separate files now on knobs:

- **Axis angle** (hero) and **Birefringence**: every mode is two resonators, the
  ordinary and the extraordinary ray. The extraordinary one is tuned up by
  `split = Δn · birefringence · sin²(angle)`, with Δn the mineral's real optical
  birefringence. Along the optic axis the rays agree; across it they part and beat.
  Cubic minerals (diamond, fluorite) have Δn 0: one ray at every angle, exactly mono
  (the take's diamond section has no side signal at all, −240 dB). Ordinary leans
  left, extraordinary right, by **Width**.
- **Fire** (hero): dispersion, the prism in time. Each mode's strike arrives late by
  `fire · (D / 0.044) · log2(ratio)`, D the mineral's optical dispersion. Diamond
  fans widest, fluorite barely.
- **Strike**: Hardness (pulse length), Vel to hardness (a hard hit is a shorter
  pulse, so brighter), Velocity (loudness).
- **Ring**: Lifetime (multiplies every Q; 1 is the physics), Rolloff (strike
  amplitude from mode to mode), Release (the damper after key up).

The numbers: ratios as the proofs (Crystal Sonification Reference), Q from
`../crystal-rings/linewidths.json` (two measured, the rest estimated), Δn and D
standard gemmological values. Topaz and labradorite are biaxial; the angle treats
every crystal as uniaxial, which is a simplification. The two hypothesis slots borrow
zircon's (tetragonal) and orthoclase's (monoclinic) optics.

Voices: eight. A new note takes a silent voice, else the one struck longest ago,
faded over 3 ms first. A note already ringing is struck again in its own voice.
Changing the crystal while a note rings retunes it, as in the rings device.

## The check

`python3 check/check_engine.py` compiles `check/engine_check.cpp` (Algorithm.h with
no JUCE, the template's Harness command line) and runs every path through the
sketch, the C++ engine and `ui/crystal_engine.js`, with the template's verify.py
helpers. On 2026-10-24 both engines matched the sketch to 3–6 × 10⁻⁸ of peak
(float32 output rounding) on all five paths, every probe to 10⁻¹⁵. Numbers in
`out/check-report.json`.

`python3 check/render_take.py` renders `../crystal-synthesizer-take.wav` through the
C++ engine: ruby turning to its axis, diamond with fire, zircon's split widening,
labradorite, an emerald chorus, six seconds each.

The template's own gates (the plugin through processBlock, pluginval, auval, the host
check) run from `./plugin.sh`; see below.

## The CRT feed

`CrystalScope.frame(probes, params)` is the whole contract: the 34 probes in
`kProbes` order (`split`; per voice `hz`, `amp`, `age`; then `m0..m8`, each mode's
energy across all voices) and the parameter values by id. Every probe is a smooth
envelope or a constant per note, so 60 Hz loses nothing a picture needs.

What it draws is the entry's own February note for the interface: the unit cell of
the chosen mineral, to its real axis ratios and angles, turning slowly in fog; a
white beam in from the left; one coloured ray per phonon mode out to the right, lit
by that mode's energy and fanned by the mineral's dispersion times Fire, red the
fundamental, violet the top. With fire, a strike lights the fan red first. Under
birefringence the extraordinary rays leave beside the ordinary ones and a dashed
ghost of the cell stands beside it. The dashed line is the optic axis, tilted by the
Axis angle. Atoms shiver in the sounding modes; a ring of light leaves each strike;
labradorite's faces flash when they turn just so. Below: the formula, the system and
space group, and Q, Δn, dispersion and the cents between the rays.

## The face, before the template can build it

`python3 ui/build_face.py --shot --fit` builds the template's editor page from this
plugin.json and the parameter table, with the crystal in the CRT fed by the
JavaScript engine once a frame. A strip on the glass stands in for the host: sound
on, a demo that walks six minerals, keys A–K (Z and X shift the octave), Web MIDI.
On 2026-10-24 the twelve controls fit at 980×640, 1100×700 and 1800×1100.
`--t SECONDS --out vst-face/face-NAME` photographs the demo at a moment. It carries
Belief Cloud's patch for Drafting Table's knobs.

## Built, installed, gated (2026-10-24, steward cycle 14)

The plugin builds from this folder now. `CMakeLists.txt` and `plugin.sh` here are
the template's three-line shims with one change: they look for `machinery/` above
this folder *and* beside it in `Projects/VST Template/`, so the shared machinery
builds a plugin that lives in a steward's bundle without a copy of anything.

```
./plugin.sh all        build, verify, install, validate, hostcheck
```

On 2026-10-24 every gate passed: the exact gate (engine = sketch to 4–6 × 10⁻⁸ of
peak on all five paths), the plugin gate through the real processor (loudness within
0.21 dB of the sketch at worst, labradorite's sweeps), strict `codesign` on both
bundles, pluginval at strictness 5, `auval -v aumu Crys Loud`, and the host check
(VST3 and AU load, every parameter moves the sound). Log: `out/validate.log`.
Installed as `~/Library/Audio/Plug-Ins/VST3/Crystal Synthesizer.vst3` and
`.../Components/Crystal Synthesizer.component`; in Live it is under Loudon Live.

Still open:

1. **The CRT is dark in the plugin.** `"screen": true` shows the bezel, but the
   editor serves only `index.html` and relays no probes, so `ui/visualizer.js` can't
   get in yet. That is VST Template's baton (the CRT's picture and the feed). Until
   it lands the crystal in fog lives on the face page.
2. **`./plugin.sh editor` took no picture** from a background run ("NO PICTURE");
   probably no window server for a headless host. Unconfirmed.
3. The code-uniqueness check in `new-plugin.py` doesn't see this folder; `Crys` was
   checked by hand against every plugin.json in VST Template and Tract Mirror's `Trkm`.
4. CPU in a host: untimed. 8 voices × 18 resonators.
5. No Max work: the RNBO patches and Max for Live devices in `../crystal-rings/` and
   `../crystal-on-the-road/` wait as teaching tools (standing order of 2026-10-21).
