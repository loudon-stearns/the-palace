---
title: "Three.js — scroll"
born: 2026-11-15
links:
  - target: "[[Three.js]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Three.js's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# Three.js — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Three.js]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:11:44.180Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 4 runs on 3 days, counted from the ledger's run lines
- **Last run:** 2026-11-15 — zoom out: r128 against r187, WebGLRenderer and WebGPURenderer, headless (proofs/2026-11-15-r128-against-r187), probe · taught items 8–9, owed a review
- **Owed in the ledger:** 5 — items 5, 6, 7, 8, 9; the next run's tail read picks them up first
- **Latest lesson:** item 9, from the test proofs — 2026-11-15 — two probes, checked headless — [[Three.js — tuning]]

### Runs

- 2026-11-15 — zoom out: r128 against r187, WebGLRenderer and WebGPURenderer, headless (proofs/2026-11-15-r128-against-r187), probe · taught items 8–9, owed a review
- 2026-11-15 — a lost context and a broken shader on r128, headless (proofs/2026-11-15-context-loss-and-glsl), probe · taught items 6–7, owed a review
- 2026-11-14 — the card's starter: web-smoke, conform --browser, a WebGL frame screenshotted headless, probe · taught item 5, owed a review
- 2026-05-31 — Wavetable Scanner, sketch · taught items 1–4

### Owed

- **5.** THREE.Color drops the alpha of an `rgba()` colour string, so a translucent token draws opaque. `palaceTokens().borderSoft` is `rgba(255,255,255,0.06)` in Graphite; handed to `Gr…
- **6.** r128 forgets its clear colour when a lost WebGL context comes back. Forced with `WEBGL_lose_context` and restored, r128 brought back the striped `DataTexture`, the line and the …
- **7.** An r128 GLSL failure is quiet on the screen, not in the console. A misspelt uniform drew nothing where the plane was, threw nothing, and three wrote `THREE.WebGLProgram: shader …
- **8.** Zoom out: three is at r187, and an r128 recipe's light goes dark there. npm `three` latest is 0.187.0, published 2026-10-30 (https://registry.npmjs.org/three, read 2026-11-15; r…
- **9.** The checks around a module piece. `web-smoke.mjs` reads a `<script type="importmap">` as classic JavaScript and fails it. `conform.mjs` reads an import map's URLs and integrity,…

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="run-c7aca5c1aa" -->
### 2026-11-15 — zoom out: r128 against r187, WebGLRenderer and WebGPURenderer, headless (proofs/2026-11-15-r128-against-r187), probe

taught items 8–9, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-23df8873d0" -->
### 2026-11-15 — a lost context and a broken shader on r128, headless (proofs/2026-11-15-context-loss-and-glsl), probe

taught items 6–7, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-test-list" -->
### 2026-11-15 — the open tests, written down

The card's "Not yet shown to hold" line and what the ledger owes, one line each: how it would be tested, whether it needs Loudon's eye or a device only he has, and whether a proof was made today. Two were: a lost context and a GLSL failure, and the zoom out to r187. Still open: R3F, the Study and Piece tiers, any real GPU or phone, the Waveguide interface, and ledger item 5.

**Artifacts:**
- [the test plan](Shop/Three.js/tests/test-plan.md)

<sub>Test list, 2026-11-15 · written by the session giving every Specialist a scroll of test proofs</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-r128-against-r187" -->
### 2026-11-15 — r128 against r187: one scene, three renderers

The zoom out. The shelf's three is r128, from 2021; three is now r187 (published 2026-10-30). One function builds the same scene, a lit knot, the starter's string and a grid, in three panes side by side: r128 as the shelf loads it, r187's WebGLRenderer as an ES module through an import map, and r187's WebGPURenderer, which uses WebGPU where the browser has it and WebGL 2 where it doesn't. Drag any pane and the other two follow. A box makes r187 light the scene as r128 did.

What had to change: the loading only (no classic script since r161; an import map, with an integrity hash on every file). The scene code ran unchanged. What changes on screen: with r128's light numbers, r187's knot is less than half as bright (mean luma 33 against 71 of 255), because since r152 and r155 three manages colour and its lights are physical. Four settings undo it, and then r187 matched r128 within 0.4 of 255 on average. Headless had no WebGPU adapter, so the third pane ran on its WebGL 2 fallback and agreed with r187 WebGL within 1.3. The comparison is coarse (32 by 24 cells), too coarse to see a thin line drawn differently.

**Tick the box. Can you see any difference between the three panes now, in the knot, the white line or the grid?** If not, the Shop's quick scenes can move to r187 without their look changing. On a Mac with WebGPU the third pane runs on WebGPU itself. Nobody has seen this.

**Artifacts:**
- [the proof, three panes](Shop/Three.js/proofs/2026-11-15-r128-against-r187/r128-against-r187.html)
- [r187 lighting it its own way, headless](Shop/Three.js/proofs/2026-11-15-r128-against-r187/page-1-r187-own-light.png)
- [r187 told to light it as r128 did, headless](Shop/Three.js/proofs/2026-11-15-r128-against-r187/page-2-r187-matched-to-r128.png)
- [what was measured](Shop/Three.js/proofs/2026-11-15-r128-against-r187/measured.json)
- [the script that measured it](Shop/Three.js/proofs/2026-11-15-r128-against-r187/check.mjs)

<sub>Test proof, 2026-11-15 · three r128 (cdnjs, the shelf) and r187 (jsDelivr, import map with integrity) · check.mjs in headless Chromium, 7 of 7 rules pass · conform --browser: browser pass clean, 3 errors, all cdn-off-shelf for the r187 URLs until they go on the shelf · web-smoke fails the import map, read as JavaScript · ledger items 8 and 9</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-context-loss-and-glsl" -->
### 2026-11-15 — a lost context and a broken shader, on r128

The card said no job had met a lost WebGL context or a silent GLSL failure. This proof meets both on purpose. A shader-striped plane, the starter's string and a grid, on the shelf's r128. One button loses the WebGL context and brings it back a second later; another misspells a uniform in the plane's shader.

Measured headless: r128 brought back the texture, the string and the shader after a restore by itself, but drew the background black; it forgets the clear colour. Set again in the restore handler, the frame matched the one before to the pixel. With the broken shader nothing was thrown and the plane vanished; three's own diagnostics said the program would not run, so the page shows the compiler's words, names line 9 of its own source, and draws the plane flat red until it is mended.

**Press "break the shader". Does the box that appears tell you plainly enough what went wrong, and where, that you would know where to look?**

Nobody has seen this. A forced loss is not a phone backgrounding a tab; that is still untested.

**Artifacts:**
- [the proof, playable](Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/context-loss-and-glsl.html)
- [the frame before the loss](Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/frame-1-before.png)
- [restored, r128 alone: the background black](Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/frame-2-restored-r128-alone.png)
- [restored, the clear colour set again](Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/frame-3-restored-clear-colour-set-again.png)
- [the page with the shader broken](Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/page-3-shader-broken.png)
- [what was measured](Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/measured.json)
- [the script that measured it](Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/check.mjs)

<sub>Test proof, 2026-11-15 · three r128 from the shelf · check.mjs in headless Chromium (SwiftShader WebGL 2), 13 of 13 rules pass · web-smoke 1 ok · conform --browser 0 errors, 0 warnings · ledger items 6 and 7</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-f514a8b1b8" -->
### 2026-11-14 — the card's starter: web-smoke, conform --browser, a WebGL frame screenshotted headless, probe

taught item 5, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-79f906913b" -->
### 2026-05-31 — Wavetable Scanner, sketch

taught items 1–4
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
