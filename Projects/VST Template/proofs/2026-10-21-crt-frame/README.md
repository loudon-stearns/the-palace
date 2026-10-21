---
title: README
born: 2026-10-21
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: proof-for
forward_vector: "I hold the drawing of the editor's CRT, the bezel the template draws around each plugin's own visualizer, rendered at three windows with colour bars standing in for a visualizer, so Loudon can judge the casing and the vignette before any plugin fills the glass."
---

# The CRT's casing, around a stand-in

Loudon, 2026-10-21: "the look of the CRT should be a architecturally drawn frame, like a design of the outside of a TV, but then we leave the inside to be anything, but there is a slight vingnette on the edges."

Simple Synth's mock page with the CRT shown (`ui.py shot plugins/SimpleSynth --screen --size <W>x<H>`), at its minimum (920 × 540), its default (960 × 600) and a large window (1400 × 880). The colour bars are a stand-in, drawn only in the mock. They are there to show the glass carrying something that owes nothing to the dress. The casing and the vignette are what the template draws; a plugin's own visualizer will replace the bars.

The first drawing was a whole television: a control strip with two knobs, a speaker grille, feet and drawing centre-marks. Loudon then asked for "just a bezel and no decorative knobs or grills. We will leave it to the later build to add controls to the crt if needed". These renders are the bezel alone.

These are browser renders. The CRT is hidden in both plugins (neither sets `"screen": true`), so it has not yet been seen inside the plugin's WebKit view. The first plugin to show it will need its own editor pictures (`./plugin.sh editor`).
