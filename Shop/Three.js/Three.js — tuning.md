---
title: "Three.js — tuning"
born: 2026-11-08
links:
  - target: "[[Three.js]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Three.js page's record of what building scenes has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real build taught."
ledger: tuning
standards:
  for: "what building real-time 3D taught the Three.js page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the tool itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pinned version"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Three.js — tuning

What each job taught the Three.js page. Each item names what the job showed and what changed because of it, if anything did. Newest last. These are the page's dated gotchas, moved here on 2026-11-08 when its Gotchas became present-tense rules. The page's `last_tested` date is kept as the first run line; the two gotchas still anticipated stay on the page until a job meets them.

## From the Wavetable Scanner Sketch — 2026-05-31 — raw r128, single file

The first three were anticipated while the page was a stub; this build confirmed them.

1. **claude.ai artifacts ship Three.js r128; `CapsuleGeometry` (r142+) and many later helpers don't exist there.** The [[Wavetable Scanner]] used raw `BufferGeometry` lines throughout and needed nothing later. Changed: build against r128 on the artifact path; use Cylinder, Sphere or custom geometry.
2. **The cursor line sat frozen at its zeroed default.** Its vertices were mutated in JS, but without `geometry.attributes.position.needsUpdate = true` the GPU never re-uploaded the buffer. The fix is one assignment; the symptom is "everything moves except the thing I just changed." Changed: set `needsUpdate` after every in-place write to a position array.
3. **`three.min.js` and `OrbitControls.js` must come from the same version**, or the first `new THREE.OrbitControls(...)` throws "is not a constructor". Changed: the page pins the working r128 pair (cdnjs `three.js/r128/three.min.js` + jsDelivr `three@0.128.0/examples/js/controls/OrbitControls.js`) and rules out the module path `examples/jsm/controls/OrbitControls.js`, which expects an importmap the single-file Sketch doesn't have.
4. **`LineBasicMaterial.linewidth` draws 1px on most platforms whatever the declared width.** Cosmetic, not silent: the line draws, just thin. Changed: carry contrast with colour at Sketch tier; thickness goes to `LineMaterial` + `LineGeometry` + `Line2` from `examples/jsm/lines/` (needs a bundler, so Study or Piece) or to an extruded ribbon.

- run · 2026-05-31 · Wavetable Scanner, sketch · taught items 1–4
