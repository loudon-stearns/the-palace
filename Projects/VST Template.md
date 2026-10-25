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

![[VST Template — hero.png]]

A reusable template for turning a per-sample algorithm, written first as a numpy sketch, into a VST3/AU plugin for further exploration. Loudon, 2026-10-17: "a 'VST template' that creates a template so that future algorithms like this can be quickly turned into a VST for further explorations."

The palace already has one native plugin, [[Tract Mirror]] (JUCE 8, VST3 + AU, validated with pluginval and auval). The template generalises that path: state, a per-sample update, named parameters, and a check that the plugin sounds like the sketch it came from. Its first test case is the frustration model from [[Harmonicity and Inharmonicity]].

A plugin's editor wears the [[Drafting Table Design System]] by default, inlined from `_ops/drafting-table/design-system/` at every build, so a change to the system reaches each plugin at its next build.

**Where it stands.** One `Algorithm.h` and a numpy sketch become a JUCE 8 VST3/AU, with a harness, a host check against a control render, and `new-plugin.py`. Two plugins came out of it, Frustration and Simple Synth, and both pass pluginval at strictness 5, auval and the host check. Sign the VST3 after JUCE writes its `moduleinfo.json`, or Live will refuse it; the [[Ableton Session Writer]]'s probe found this.

## Active Baton

[[VST Template — baton]] — drafted 2026-10-21
