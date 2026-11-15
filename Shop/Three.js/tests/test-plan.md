---
title: test-plan
born: 2026-11-15
links:
  - { target: "[[Three.js]]", type: connects-to, label: test-plan-for }
forward_vector: "I hold the test plan for Three.js; I want every check here to be runnable, to record an honest last-run date, and to say plainly which checks only an eye on a real GPU can settle."
---

# Three.js — Test Plan

> Three.js is the Shop's real-time 3D Specialist. A headless Chromium draws WebGL in software (SwiftShader), so a script can load a scene, draw a frame, read its pixels and compare frames. It cannot judge frame rate on a real GPU, whether a scene reads, or how it looks on a phone; those wait on an eye. How each test below is run is one way, not the way: a maker who can test this better another way does so, and leaves the comparison on the scroll.

Last run: **2026-11-15** — two proofs, both checked headless: a lost context and a broken shader on r128 (`proofs/2026-11-15-context-loss-and-glsl/`, 13 of 13 rules pass), and r128 against r187 (`proofs/2026-11-15-r128-against-r187/`, 7 of 7 rules pass). Earlier: **2026-11-14** — the card's starter passed web-smoke and `conform.mjs --browser`.

## Smoke

```sh
node --experimental-vm-modules Shop/Maker/web-smoke.mjs "<piece>.html"
node _ops/rich-face/conform.mjs "<piece>.html" --browser
```

- Pass = no `SyntaxError`, and conform's browser pass reports a height with a clean console.
- web-smoke reads a `<script type="importmap">` as classic JavaScript and fails it ("Unexpected token ':'"), so a piece that loads r187 through an import map fails smoke falsely (2026-11-15).

## Capability Probe

| Role | Last run |
|---|---|
| `BufferGeometry` line rewritten each frame with `needsUpdate` | the starter, 2026-11-14; both proofs, 2026-11-15 |
| `ShaderMaterial` with a sampled `DataTexture` | `proofs/2026-11-15-context-loss-and-glsl/`, 2026-11-15 |
| `MeshStandardMaterial` under ambient and point light | `proofs/2026-11-15-r128-against-r187/`, 2026-11-15 |
| r187 `WebGPURenderer` | same proof; headless found no WebGPU adapter, so it ran on its WebGL 2 fallback |
| `InstancedMesh`, raycasting, `EffectComposer`, R3F | not yet exercised |

## Style Probe

- Automated: tokens come from `palaceTokens()`, no hex in the piece. THREE.Color drops an `rgba()` token's alpha (ledger item 5), so hand three solid tokens.
- Manual: whether the scene reads, and whether its light is right, is the eye's.

## Edge Probe

- Lost context: force it with `WEBGL_lose_context`, restore it, compare the frame with the one before.
- GLSL failure: compile a misspelt shader, read `renderer.properties.get(material).currentProgram.diagnostics` (r128), and check the page says so and still draws something.
- CDN drift: r128 pinned on the shelf with SRI; r187 pinned through the import map's `integrity` list.

## Speed Bench

Reference host: the Mac, headless Chromium in software. First frame for the r128-against-r187 scene (7,680 triangles): r128 34 ms, r187 WebGL 33 ms, r187 WebGPURenderer on WebGL 2 53 ms after a 17 ms init (2026-11-15). Software numbers, not a GPU's.

## Determinism

Not byte-identical: GPU rasterisation varies by device. The reproducibility artifact is the scene-construction code, a fixed camera and a fixed `t`. Headless on one host, the same frame drawn twice compared equal (mean difference 0 of 255, 2026-11-15).

## Open tests — from the card, 2026-11-15

From the card's **Not yet shown to hold** line and what the ledger owes.

- **R3F.** Build the starter as React Three Fiber + drei with Vite, then screenshot it headless and compare it with the raw starter. A script can run this; Loudon's eye is not needed. Open.
- **The Study tier.** One real instrument interface in R3F, checked in Chrome, Firefox and Safari. Needs Loudon's eye on all three. Open.
- **The Piece tier.** Performance on a declared GPU tier, context-loss recovery, a recipe. Needs a real GPU and Loudon's eye on frame rate. Open.
- **Any GPU or phone check.** Load a piece on the Mac's own GPU and on a phone, read the frame rate, background the tab on the phone and come back. Needs Loudon's devices and eye. Open.
- **A lost WebGL context.** Forced with `WEBGL_lose_context`, restored, frame compared with the one before. Script-run; whether the page reads plainly is Loudon's. Proof made: [proofs/2026-11-15-context-loss-and-glsl/](../proofs/2026-11-15-context-loss-and-glsl/). r128 brought back its texture, geometry and shader by itself and forgot its clear colour. A real phone backgrounding a tab is still open.
- **A silent GLSL failure.** A misspelt uniform, caught from three's own diagnostics, the line named in the piece's own source, the mesh drawn red. Script-run; whether the error box tells a person enough is Loudon's question. Proof made: same folder.
- **The Waveguide interface.** A job, not a probe: the string's vertices read from the AudioWorklet's delay line. Needs Loudon's ear and eye. Open.
- **Ledger item 5 (an `rgba()` token draws opaque).** Hand `GridHelper` `borderSoft` and read the pixels headless. Script-run. Open, and owed a review.
- **Zoom out: r187 and WebGPU.** The same scene in r128, r187 WebGL and r187 WebGPURenderer, with a switch to match r128's light. Script-run headless on the WebGL 2 fallback; real WebGPU needs Loudon's Mac and eye. Proof made: [proofs/2026-11-15-r128-against-r187/](../proofs/2026-11-15-r128-against-r187/).
