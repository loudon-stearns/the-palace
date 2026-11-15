---
title: p5.js — Test Plan
born: 2026-05-30
links:
  - { target: "[[p5.js]]", type: connects-to, label: test-plan-for }
forward_vector: "I hold the test plan for p5.js; I want every check here runnable with an honest last-run date."
---

# p5.js — Test Plan

> Phase E rollout. p5.js is the expressive lens of the data-viz triad. Smoke is a syntax-parse of the artifact's inline JS (Node `vm.Script`, no DOM required). Determinism rests on the shared Mulberry32 seed convention codified in the [[Flocking — Maker's Comparison Recommendation|Flocking shoot-out]].

Last run: **2026-11-14** — the card's starter (`Shop/p5.js/proofs/2026-11-14-card-check/p5.js — proof — starter.html`) passed web-smoke and `conform.mjs --browser`, and drew its trail headless. The Shop harness smoked the canonical artifact on 2026-06-16. Earlier: **2026-05-30** — Smoke pass on the canonical p5.js artifact (`Flocking/flocking-p5-expressive.html`); informal Determinism verified during the 2026-05-29 Flocking job (Node cross-check against the same Mulberry32 seed 7 model block reproduced the same trajectory).

## Smoke

```sh
node --experimental-vm-modules Shop/Maker/web-smoke.mjs Flocking/flocking-p5-expressive.html
```

- **Automated:** the shared `Shop/Maker/web-smoke.mjs` helper extracts inline `<script>` blocks and syntax-checks each via Node's `vm` module. Pass = no `SyntaxError` raised, exit 0.
- **Last run (2026-05-30):** `smoke: 1 ok, 0 fail (1 inline script)`.

## Capability Probe

p5.js's two Shop roles, both proven by the Flocking shoot-out:

| Role                                | Last run                                           |
|--------------------------------------|-----------------------------------------------------|
| Expressive generative motion (trails, color-by-velocity) | `flocking-p5-expressive.html` — 80 boids, R climbs 0→0.77, no console errors |
| Parameter explorer (sliders + canvas) | `Kuramoto Coupling/two-phasors-coupling-explorer.html` (Round 1) |

- **Last run (2026-05-30):** Capability covered by historical artifacts; both verified visually.

## Style Probe

p5.js's canvas is fully author-controlled (no Layer-0 to fight). The house-defaults pattern resolves cleanly: read tokens via `palaceTokens()`, never paste a hex. Check the source for any hardcoded `#xxxxxx`:

```sh
grep -E '#[0-9a-fA-F]{3,8}' Flocking/flocking-p5-expressive.html | grep -v 'href\|cdn'
```

- **Manual:** the canvas's colours match the active skin (Strobe variant uses `#ff2a2a`; Graphite the amber `#e8b84a`).
- **Last run (2026-05-30):** the canonical p5 artifact resolves tokens via `palaceTokens()`; the Strobe-skin variant (`flocking-p5-expressive-strobe.html`) renders red trails on black per Strobe.

## Edge Probe

- **`palaceTokens()` returns null** (canonical CSS not linked): p5 sketch must fail loud, not render with browser default colours. The artifact does this via an `assert(tokens)` at sketch top.
- **Window resize**: sketch must not crash; for fixed-size canvases this is N/A. Manual probe.

- **Last run (2026-05-30):** edge probes not formally exercised this round.

## Speed Bench

Reference host: **mac** (Chrome stable).

| Job                              | Frame budget       |
|-----------------------------------|---------------------|
| Flocking p5 expressive, 80 boids  | < 4 ms/frame (240 fps headroom) |
| Two-phasor coupling explorer      | < 2 ms/frame        |

Browser-side; the Specialist's render is not the bottleneck for any Shop brief sized in the dozens-of-agents range.

## Determinism (load-bearing where applicable)

For seeded sims (Flocking), the discipline is the *shared, byte-identical model block* — the rendering layer is non-deterministic in pixel detail (anti-aliasing varies by browser version) but the *trajectory* is identical across the three triad Specialists when run with the same Mulberry32 seed.

- **Reproducibility artifact:** the seed + the model block source (a string match against the canonical model in `Flocking/flocking-d3-interactive-control.html` is the test).
- **Last run (2026-05-30):** informal 2026-05-29 — Node cross-check against the D3 and Plot Specimens at seed 7 produced identical (x, y, θ) sequences for the first 300 frames. The shared model block discipline holds.

## Open tests — from the card, 2026-11-15

From the card's **Not yet shown to hold** line and the ledger. A test here says what was seen, dated; how it is tested is the maker's to better.

- **WebGL mode.** Tested by a lit field of boxes in `WEBGL`, checked headless: the renderer reports `webgl2`, a forced frame draws, screenshots kept. Script-checkable; the look is Loudon's eye. **Status: proof made 2026-11-15** — [Shop/p5.js/proofs/2026-11-15-webgl-touch/](../proofs/2026-11-15-webgl-touch/). Not yet: a custom shader in a WebGL Sketch (proof `2026-11-15-p5-1-vs-2` runs a filter shader in both versions).
- **Touch and a phone.** Tested in the same proof: a phone viewport with touch emulated, two fingers sent through Chrome's input pipeline, read from p5's `touches`; a finger dragged on the field must not scroll the page, and the same drag on text must (the control; with `touch-action: none` removed, the field drag scrolled 584 px and the rule failed). Needs Loudon's hand on a real phone or tablet for feel; the piece origin is local to the Mac, so a phone may not reach it. **Status: proof made 2026-11-15, emulated only; a real device is open** — [Shop/p5.js/proofs/2026-11-15-webgl-touch/](../proofs/2026-11-15-webgl-touch/).
- **p5.sound.** Test: a Sketch with incidental sound (an oscillator and an envelope on a click, an FFT drawn), rendered through `OfflineAudioContext` where p5.sound allows, numbers for level and spectrum, and Loudon's ear. p5.sound is not on the shelf; in p5 2.x it is a new, incompatible library (the 1.x→2.x compatibility notes). Needs his ear. **Status: open.**
- **A Study or Piece tier.** Test: take one Sketch up a tier under a real brief (palette-aware, whole canvas used, multiple input modes, embed-ready), timed against the card's estimate of 1 to 3 h. Needs a real job and Loudon's eye at the end. **Status: open.**
- **The empty band (ledger item 2).** Test: screenshot a Sketch and measure the share of empty rows below the drawing. The WebGL field showed the same failure on its first screenshot on 2026-11-15 (the boxes' standing height pushed the drawing up) and was shifted down; no rule measures it yet. Script-checkable. **Status: open.**
- **p5 2.x (zoom-out, owed a review on the ledger).** Tested by the same sketch in p5 1.10.0 and 2.4.0 side by side: both load in one page, draw within 0.06% of the same pixels, and the warp shader bites in both. Whether they look and move the same is Loudon's eye. **Status: proof made 2026-11-15** — [Shop/p5.js/proofs/2026-11-15-p5-1-vs-2/](../proofs/2026-11-15-p5-1-vs-2/).
