---
title: "VST Template"
type: project
pillars: [tools, creation, practice]
born: 2026-10
stage: sprout
status: active
links:
  - target: "[[DSP Frameworks]]"
    type: connects-to
    label: framework-choice
  - target: "[[Tract Mirror]]"
    type: connects-to
    label: scaffold-from
  - target: "[[Harmonicity and Inharmonicity]]"
    type: connects-to
    label: first-test-case
forward_vector: "I turn an algorithm proven in a numpy sketch into a plugin Loudon can play in Ableton the same day, so an idea that sounded good in a render can be explored with hands, automation and a DAW around it."
---

# VST Template

A reusable template for turning a per-sample algorithm, written first as a numpy sketch, into a VST3/AU plugin for further exploration. Loudon, 2026-10-17: "a 'VST template' that creates a template so that future algorithms like this can be quickly turned into a VST for further explorations."

The palace already has one native plugin, [[Tract Mirror]] (JUCE 8, VST3 + AU, validated with pluginval and auval). The template generalises that path: state, a per-sample update, named parameters, and a check that the plugin sounds like the sketch it came from. Its first test case is the frustration model from [[Harmonicity and Inharmonicity]].

**Where it stands (2026-10-21).** The template landed at `1f7116b4`: one `Algorithm.h` and a numpy sketch become a JUCE 8 VST3/AU, with a harness, a host check that compares every move against a control render from the same start, and `new-plugin.py`. Two plugins came out of it the same day — Frustration, `ride.py`'s model with B and K automatable, and Simple Synth, one oscillator, one filter, one amplifier with envelopes and vibrato, asked for mid-build — and both pass every gate: pluginval at strictness 5, auval, and the host check. One gotcha arrived from outside: the [[Ableton Session Writer]]'s probe found Frustration's VST3 sealed before JUCE wrote its `moduleinfo.json`, so Live refused it; the VST session re-signed it after the manifest step, and the Set loaded in Live 12.4.6 on 2026-10-21. Sign after the manifest, then let Live rescan.

## Active Baton

[[VST Template — baton]] — drafted 2026-10-21
