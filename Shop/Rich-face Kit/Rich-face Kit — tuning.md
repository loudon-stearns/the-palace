---
title: "Rich-face Kit — tuning"
born: 2026-11-15
links:
  - target: "[[Rich-face Kit]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Rich-face Kit page's record of what starting and checking playable pieces has taught it: a line for every run, and a numbered item when a run taught something, naming what changed because of it. Never prune what a real piece taught."
ledger: tuning
standards:
  for: "what starting and checking playable pieces taught the Rich-face Kit page"
  run: "a piece started from a starter or checked by the checker on a job, a comparison of a maker's own way against the starter's, or a probe of the kit itself"
  line: "- run · <date> · <piece or probe>, <piece | comparison | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a change to a starter or a house rule"
  writes: "by hand, in the run's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Rich-face Kit — tuning

What each run taught the Rich-face Kit page. Each item names what the run showed and what changed because of it, if anything did. Newest last. The kit's lessons from before it was a page live in `Enrichment/Enrichment — tuning.md` (item 11) and `Enrichment/proposal-round-2026-11/ROUND-NOTES.md`; the page's Gotchas carry the ones still true.

## From the test proofs — 2026-11-15 — two probes, at the page's birth

1. **The checker's browser pass frames every piece opaque, whatever its plan.** `second-file.html` declares `piece:files pluck.wav`, so its plan gives it an origin (`sameOrigin: true`); conform still framed it `sandbox="allow-scripts"` and reported the fetch of its own declared file as `sandbox-blocked`, twice. On a piece origin started in-process and framed by the plan, the same piece fetched the wav (200), and an undeclared file beside it answered 404. So conform cannot say whether a declaring piece works; the second-file `check.mjs` can. Changed: the page's Checked by and Gotchas say so. A fix to conform (frame by the plan) is a tool change for whoever holds `_ops/rich-face/`. Owed a review.
2. **A second file reaches its piece, bit for bit.** The wav and the pluck made in the page differ by at most 2.7e-5 (−91.5 dBFS, the wav's 16-bit rounding), in the frame. So a maker may ship a generated wav beside a piece instead of synthesizing everything in the page; the discovery walk's "the kit learns the second file" holds headless. Not yet heard on Loudon's scroll; the proof asks him. Owed a review.
3. **A module worker from a Blob URL fails in an opaque frame and works framed same-origin and alone** (Chromium 147.0.7727.15, headless). Every other feature probed answered the same in all three: WebGPU gave an adapter (headless, with `--enable-unsafe-webgpu`), import maps, OffscreenCanvas WebGL2, WASM SIMD, WebCodecs' AudioEncoder, View Transitions, CSS anchor positioning and Popover all yes; cross-origin isolation no (so no SharedArrayBuffer); `AudioContext({renderSizeHint})` was accepted and ignored (quantum 128, without a flag); `playbackStats` (once `playoutStats`) present. The Web Audio Worklet proof of the same day found the render size honoured behind `--enable-blink-features=WebAudioConfigurableRenderQuantum`, with Chrome 153 named to ship it. Changed: a gotcha on the page. Owed a review.
4. **Zoom out, 2026-11-15.** What changed since the starters (sources: the npm registry, read 2026-11-15, `registry.npmjs.org/<pkg>`): tone 15.1.22 (next line 15.5.72) against the shelf's 15.0.4; p5 2.4.0 against 1.10.0, a major version; d3 7.9.2 against 7.9.0; Plot 0.6.19 against 0.6.17; three 0.187.0 against r128. Each web Specialist's 2026-11-15 zoom-out proof tries its own; their URLs go on the shelf through `pin-cdn.mjs --add`. In the browser, the frame-features proof is the kit's own try. Not tried: Firefox and Safari, a phone. Owed a review.

5. **The two checkers misread an import map, the way two web Specialists now load libraries.** web-smoke parses `<script type="importmap">` as JavaScript and fails it ("Unexpected token ':'"; D3's and Three's zoom-out proofs). conform reads the map's integrity for some loads, but on D3's page it reports two `import` lines as carrying no integrity once their URLs were on the shelf, though the map pins both and Chromium 147 refused a wrong hash in it (D3 ledger, 2026-11-15). Earlier it read a bare `import 'three'` as a missing file beside the piece (Three's report). Changed: nothing; the fixes belong to `Shop/Maker/web-smoke.mjs` and `_ops/rich-face/conform.mjs`. Also on 2026-11-15, fourteen new library files went on the shelf through `pin-cdn.mjs --add`, each hash matching the one the Specialist's session computed: tone 15.1.22 and 15.5.72, p5 2.4.0, Plot 0.6.19, five d3 modules, five three@0.187.0 files. Owed a review.

- run · 2026-11-15 · shelf: fourteen library files added through pin-cdn.mjs --add, and the fourteen 2026-11-15 web proofs run through web-smoke and conform --browser together, probe · taught item 5, owed a review
- run · 2026-11-15 · second-file proof: a declared wav played in a frame on a piece origin, nulled against the page's own pluck, probe · taught items 1 and 2, owed a review
- run · 2026-11-15 · frame-features proof: thirteen newer browser features asked alone, framed opaque and framed same-origin, probe · taught items 3 and 4, owed a review
