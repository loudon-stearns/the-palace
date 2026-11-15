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

## From the card check — 2026-11-14 — the card's starter, a probe

5. **THREE.Color drops the alpha of an `rgba()` colour string, so a translucent token draws opaque.** `palaceTokens().borderSoft` is `rgba(255,255,255,0.06)` in Graphite; handed to `GridHelper`, the grid drew pure white. Seen in a headless screenshot of the starter (`proofs/2026-11-14-card-check/Three.js — proof — starter.html`); fixed by giving THREE solid tokens (`border`, `fg4`). Changed: the starter and its comment, which are workshop; the page waits for the review. Written by the session that fixed the card, not at a review; the page is unchanged by it until a review. Owed a review.

- run · 2026-11-14 · the card's starter: web-smoke, conform --browser, a WebGL frame screenshotted headless, probe · taught item 5, owed a review

## From the test proofs — 2026-11-15 — two probes, checked headless

6. **r128 forgets its clear colour when a lost WebGL context comes back.** Forced with `WEBGL_lose_context` and restored, r128 brought back the striped `DataTexture`, the line and the `ShaderMaterial` by itself, but drew the background black (`[10,10,15]` before, `[0,0,0]` after): its restore rebuilds the background with the default colour. Setting `renderer.setClearColor(...)` again in a `webglcontextrestored` handler made the restored frame match the one before to the pixel (mean difference 0 of 255). Seen headless in `proofs/2026-11-15-context-loss-and-glsl/`. A forced loss is not a phone backgrounding a tab; that is still unseen. Owed a review.
7. **An r128 GLSL failure is quiet on the screen, not in the console.** A misspelt uniform drew nothing where the plane was, threw nothing, and three wrote `THREE.WebGLProgram: shader error` with the compiler's log to the console. After `renderer.compile(scene, camera)`, `renderer.properties.get(material).currentProgram.diagnostics` holds `runnable` and the log; the compiler's line number minus three's prefix lines (and one more for `#version` on WebGL 2) is the line in the piece's own source. A page that reads it can say so and draw the mesh plainly broken instead of missing. Same proof. The page's gotcha ("a black screen with no thrown error") holds on the screen; the console does speak. Owed a review.
8. **Zoom out: three is at r187, and an r128 recipe's light goes dark there.** npm `three` latest is 0.187.0, published 2026-10-30 (https://registry.npmjs.org/three, read 2026-11-15; release notes https://github.com/mrdoob/three.js/releases/tag/r187). From the migration guide (https://github.com/mrdoob/three.js/wiki/Migration-Guide, read 2026-11-15): `examples/js` went in r148, so the classic `OrbitControls` pair ends at r147; `build/three.min.js` went in r161, so the last classic script is r160 (both checked on jsDelivr: 404 after); colour management is on by default from r152; legacy lights off by default from r155; `PointLight` decay 2 from r147. Tried in `proofs/2026-11-15-r128-against-r187/`: the same scene-building function ran unchanged in r128, r187 `WebGLRenderer` and r187 `WebGPURenderer`; with r128's light numbers the r187 knot was less than half as bright (mean luma 33 against 71); `ColorManagement.enabled = false`, `outputColorSpace = LinearSRGBColorSpace`, intensities times pi and `decay = 0` brought it within 0.4 of 255 of r128. Headless Chromium had `navigator.gpu` and no adapter, so `WebGPURenderer` ran on its WebGL 2 fallback (within 1.3 of 255 of r187 WebGL); nobody has seen it on real WebGPU. An import map's `integrity` list was enforced in Chromium for a file imported in turn (`three.core.js`, a wrong hash stopped the load). Loading r128 and r187 in one page logs "Multiple instances of Three.js being imported", expected. The WebGPU pane counted 2 draw calls to WebGL's 3 for the same scene; not understood. Owed a review.
9. **The checks around a module piece.** `web-smoke.mjs` reads a `<script type="importmap">` as classic JavaScript and fails it. `conform.mjs` reads an import map's URLs and integrity, but reads a bare specifier in an `import` (`'three'`) as a file beside the piece and calls it missing; writing the full URL in each `import`, the same URL the map names, cleared that (same URL, same module). Seen 2026-11-15 on the r187 proof. These are the Maker's and rich-face's tools, not this page's; noted here because a Three.js piece meets them first. Owed a review.

- run · 2026-11-15 · a lost context and a broken shader on r128, headless (proofs/2026-11-15-context-loss-and-glsl), probe · taught items 6–7, owed a review
- run · 2026-11-15 · zoom out: r128 against r187, WebGLRenderer and WebGPURenderer, headless (proofs/2026-11-15-r128-against-r187), probe · taught items 8–9, owed a review
