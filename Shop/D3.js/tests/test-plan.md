---
title: D3.js — Test Plan
born: 2026-05-30
links:
  - { target: "[[D3.js]]", type: connects-to, label: test-plan-for }
forward_vector: "I hold the test plan for D3.js; I want every check here runnable with an honest last-run date."
---

# D3.js — Test Plan

> Phase E rollout. D3.js is the interactive-control lens of the data-viz triad — sliders, draggable agents, live regime read-outs. Smoke is a syntax-parse via the shared `web-smoke.mjs` helper; the load-bearing probe is the Determinism cross-check that the integrator (handwritten, NOT `d3-force` for kinematic sims) produces the same trajectory as the other triad Specialists.

Last run: **2026-11-14** — the card's starter (`Shop/D3.js/proofs/2026-11-14-card-check/D3.js — proof — starter.html`) passed web-smoke and `conform.mjs --browser`. The Shop harness smoked the canonical artifact on 2026-06-16. Earlier: **2026-05-30** — Smoke pass on `Flocking/flocking-d3-interactive-control.html`; Determinism informally verified 2026-05-29 (Node cross-check at seed 7 vs. p5.js + Observable Plot Specimens).

## Smoke

```sh
node --experimental-vm-modules Shop/Maker/web-smoke.mjs Flocking/flocking-d3-interactive-control.html
```

- **Automated:** as above. Pass = no `SyntaxError` raised.
- **Last run (2026-05-30):** `smoke: 1 ok, 0 fail (1 inline script)`.

## Capability Probe

D3.js's two proven roles in Shop work:

| Role                              | Last run                                                |
|------------------------------------|----------------------------------------------------------|
| Custom interactive viz with live controls | `flocking-d3-interactive-control.html` — 80 boids, R 0→0.77, live weight sliders, force-vector overlay, no console errors |
| Cobalt-skin variant (palette swap proof) | `flocking-d3-interactive-cobalt.html` — same model, different skin |

- **Last run (2026-05-30):** both covered by Flocking artifacts.

## Style Probe

D3 paints onto an author-controlled SVG (no Layer-0). The artifact must resolve colours via `palaceTokens()` rather than hex-paste. Manual hex grep:

```sh
grep -E '#[0-9a-fA-F]{3,8}' Flocking/flocking-d3-interactive-control.html | grep -v 'href\|cdn'
```

- **Last run (2026-05-30):** canonical artifact resolves via `palaceTokens()`; cobalt variant swaps the skin class on `<html>` and tokens flow through.

## Edge Probe

- **Use `d3-force` for kinematic Reynolds boids** — known wrong-path; `d3-force` is a *relaxation* solver and the boid integrator must be handwritten. Documented as a gotcha on the entry; the test is *don't*, not a run.
- **Stale `requestAnimationFrame` on hot-reload** — multiple rAF loops accumulate if the artifact is reloaded without cleanup. Mitigated by storing the rAF id and cancelling on re-init.

- **Last run (2026-05-30):** edge probes not formally exercised; documented in entry gotchas.

## Speed Bench

Reference host: **mac** (Chrome stable). 80-boid Flocking at < 4 ms/frame — see entry's Iteration Character.

## Determinism (load-bearing)

D3 is a rendering library; *determinism applies to the simulation, not D3's draw step*. The Flocking discipline (Mulberry32 PRNG, seed 7, byte-identical model block shared across the three triad Specialists) is what makes the three comparisons *legible as the same thing*.

- **Reproducibility artifact:** seed + model block source string. The Specialist's standards JSON (`Flocking/flocking-d3-interactive-control.report.json`) captures the seed, N, and weight defaults.
- **Last run (2026-05-30):** informal 2026-05-29 — Node cross-check confirmed D3, Plot, p5 produce identical first-300-frame trajectories at seed 7. The shared-model discipline holds.

## Open tests — from the card, 2026-11-15

One line per item on the card's **Not yet shown to hold** line, and per thing the ledger owes. How each would be tested is a suggestion; a maker who can test it better does so and leaves the comparison on the scroll.

- **d3-force has only been a tick driver, never a graph relaxation.** Relax a real graph with forceLink, forceManyBody and forceCollide and count what a script can: edge crossings and node overlaps before and after, nodes in frame, the same layout from the timer and from `simulation.tick(n)`. Whether the layout reads needs Loudon's eye. **Proof made 2026-11-15:** [proofs/2026-11-15-shop-graph](../proofs/2026-11-15-shop-graph/shop-graph.html) — crossings 7902 to 1383, no overlaps, timer and tick land on the same positions; check passed. The eye judgement is open.
- **No chart of palace data yet.** Same proof: the Shop's 39 pages and their 266 typed frontmatter links, read by `extract.mjs` into `shop-graph.json`. Script-run; eye open. A second chart (an activation timeline, link density across the whole palace) is open.
- **No Study.** A Study-tier job: palette-aware, a parameter control, checked in Chrome, Firefox and Safari. Playwright can run all three engines if they are installed; only Chromium is installed here today. Open.
- **No Piece with keyboard navigation and screen-reader labels.** The shop-graph proof has both (a roving tabindex, arrow keys to the nearest node, Enter to hear a node's links, `]` and `[` through its neighbours, a letter to jump, every node labelled, the graph as a list), checked headless by key presses and the accessibility tree. It is a proof, not a Piece: no touch handling, no phone, no Firefox or Safari, no recipe, and no screen reader has been run on it. Hearing it with VoiceOver needs Loudon. Partly shown; open.
- **The watch-list gotchas are not yet met.** `dominant-baseline` and `text-anchor` were set on every label in the shop-graph proof and checked; nothing broke without them because they were never left out. `selection.join()` against `.enter()`, locale-bound time axes and Canvas hit-testing: open, each wants a small probe that breaks on purpose. Script-run.
- **Ledger items 6 to 11 (2026-11-15), owed a review.** Read at the next review of the page; nothing to run.
- **Zoom out: the whole d3 script against the per-module ES bundles (d3 7.9.1, 2026-11-03).** Same graph both ways side by side; a script compares bytes, cold load time, positions, and that a wrong hash in the import map is refused. Needs Loudon's eye on whether the two look and feel the same. **Proof made 2026-11-15:** [proofs/2026-11-15-esm-modules](../proofs/2026-11-15-esm-modules/esm-modules.html); check passed. Open for his eye, and the page's open question (one-file script or modules as the house default) is his call.
