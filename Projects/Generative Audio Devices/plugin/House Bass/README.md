---
title: "GAD House Bass — plugin README"
born: 2026-11-04
links:
  - target: "[[Generative Audio Devices]]"
    type: connects-to
    label: first-plugin
forward_vector: "I am the first instrument Generative Audio Devices made as a plugin: the house bass PDL, built by VST Template's machinery, playing the same engine as its Mac app."
---

# GAD House Bass

`../../pdl-renderer/house_bass.pdl`, the patch Loudon called alive in Rack on 2026-10-24, as a VST3 and AU. Made by `../../native/emit_plugin.js`; built, verified, validated and installed by [[VST Template]]'s `machinery/`, the same way as Simple Synth.

Everything in `src/` and `reference/` is generated. Don't edit it; edit the PDL (or the native kit) and run:

```sh
cd "Projects/Generative Audio Devices/native"
node emit_plugin.js ../pdl-renderer/house_bass.pdl --into "../plugin/House Bass" --name "GAD House Bass"
cd "../plugin/House Bass" && ./plugin.sh all
```

Every knob of the patch is a host parameter, grouped by module (`OSC · VCO`, `FILT · VCF`, …), in the patch's own units; the filter's FREQ and RES are the two large knobs. Level (dB) is added at the end. Plugin code `Ghbs`.

In Live: Settings → Plug-Ins → Rescan, then Plug-Ins → Loudon Live → GAD House Bass, on a MIDI track.
