---
title: Observable Plot — Test Plan
born: 2026-05-30
links:
  - { target: "[[Observable Plot]]", type: connects-to, label: test-plan-for }
forward_vector: "I hold the test plan for Observable Plot; I want every check here runnable with an honest last-run date."
---

# Observable Plot — Test Plan

> Phase E rollout. Observable Plot is the analytical lens of the data-viz triad — grammar of graphics, faceting, beautiful defaults. The Specialist has a strong Layer-0 (its own typography + colour scheme baked in); the Maker's house-defaults wrapper at `_ops/loudon-live/design-system/palace-plot-defaults.js` is the bridge, and the Style Probe checks the wrapper pushed the locked grammar through to the generated SVG.

Last run: **2026-11-14** — the card's starter (`Shop/Observable Plot/proofs/2026-11-14-card-check/Observable Plot — proof — starter.html`) passed web-smoke and `conform.mjs --browser`. The Shop harness smoked the canonical artifact on 2026-06-16. Earlier: **2026-05-30** — Smoke pass on `Flocking/flocking-observable-plot-graphite.html`; Style Probe (mono face in generated SVG) verified during the 2026-05-29 Flocking job; Determinism informally verified by the same shared-model cross-check.

## Smoke

```sh
node --experimental-vm-modules Shop/Maker/web-smoke.mjs Flocking/flocking-observable-plot-graphite.html
```

- **Automated:** as above. Pass = no `SyntaxError` raised.
- **Last run (2026-05-30):** `smoke: 1 ok, 0 fail (1 inline script)`.

## Capability Probe

Plot's three Shop roles, all proven by the Flocking shoot-out's analytical lens:

| Role                                  | Last run                                                            |
|----------------------------------------|----------------------------------------------------------------------|
| Quantitative panel chart (R-over-time) | `flocking-observable-plot-graphite.html` — 3 panels rendered         |
| Histogram                              | same artifact — neighbor histogram                                   |
| Faceted sweep (`fx`)                   | same artifact — alignment sweep, 3 facets                            |

- **Last run (2026-05-30):** all three covered by the Flocking analytical artifact.

## Style Probe (load-bearing for Plot)

Plot's Layer-0 typography and colour are aggressive. The Maker pushes the locked Loudon Live grammar via `_ops/loudon-live/design-system/palace-plot-defaults.js`, which wraps `Plot.plot()` to (a) resolve the active skin's tokens, (b) inject the mono face into the generated SVG, (c) swap colour scales to the categorical or accent ramp.

- **Manual:** open `flocking-observable-plot-graphite.html` in a browser, inspect the SVG, confirm `font-family: 'JetBrains Mono'` appears on axis-label `<text>` elements and the colours are from the resolved skin.
- **Automated check (partial):** `grep -E "font-family.*Mono" <generated-svg>` — only works if the SVG is captured to disk.
- **Last run (2026-05-30):** Plot's `<svg>` output carries the locked mono face — verified during the 2026-05-29 Flocking job and not regressed since.

## Edge Probe

- **`Plot` undefined** (UMD load order): Plot externalises `d3` and must be loaded *after* d3 in script-tag order. The Flocking job hit this on first build; the load-order fix is now in the canonical artifact.
- **NaN in series data**: Plot silently skips (matches Matplotlib's behaviour). Not a probe; documented.

- **Last run (2026-05-30):** d3-before-Plot load order verified in canonical artifact; NaN behaviour documented but not probed.

## Speed Bench

Reference host: **mac** (Chrome stable). Plot renders all three Flocking analytical panels in well under a frame — Plot is never the bottleneck.

## Determinism

Like D3, *Plot itself is not the determinism surface* — the shared seeded model is. Plot deterministically renders the same data to the same SVG (modulo browser font hinting).

- **Reproducibility artifact:** seed + model block + data array (or hash).
- **Last run (2026-05-30):** informal 2026-05-29 — Node cross-check confirmed Plot produces identical R-over-time series at seed 7 to D3 and p5.

## Open tests — from the card, 2026-11-15

One line per item on the card's **Not yet shown to hold** line, and per thing the ledger owes. How each would be tested is a suggestion; a maker who can test it better does so and leaves the comparison on the scroll.

- **The 3×N flocking sweep grid.** Run the seed-7 model at every separation × alignment pair, draw R(t) as `fx`/`fy` small multiples on one shared scale, fold each run to one number, and check the page's numbers against the same model run outside it. Needs Loudon's eye for whether the grid reads. **Proof made 2026-11-15:** [proofs/2026-11-15-sweep-grid](../proofs/2026-11-15-sweep-grid/sweep-grid.html) — 3 × 4 at cohesion 1.0 in the page, all three cohesions in Node; check passed. The eye judgement is open.
- **The Vicsek chart.** Chart the order parameter against noise η from the seeded Vicsek model [[Web Audio Worklet]]'s Murmuration already runs (order 0.93 at η = 0 to 0.10 at η = 0.80), beside the flock's R, and see whether the curve has the Kuramoto shape. A script can check the numbers against Murmuration's; the reading of the shape needs Loudon's eye. Open.
- **No Study or published Piece.** A Study-tier job: palette-aware, faceted, a parameter control that re-renders, tested in Chrome, Firefox and Safari. Playwright can run all three engines if they are installed; whether it is good enough to publish is Loudon's call. Open.
- **No animation of its own; it re-renders on a slow tick.** Time `replaceChildren(Plot.plot(...))` at 6, 15 and 30 Hz for a growing number of points in headless Chromium, and find where a frame overruns. Whether the motion feels smooth is an eye judgement. Open.
- **The card's "matched a Node reference to 3 decimals" (2026-05-29).** Rechecked 2026-11-15 in the sweep-grid proof: at exactly step 900 browser and Node now agree on all three (0.579 / 0.953 / 0.995), but in general the two engines start the seed 1 bit apart and chaotic runs diverge. Done as a script check; owed a review on the ledger (item 4).
- **Plot 0.6.17 against 0.6.19 (the zoom-out).** Same three charts, switchable, each using a 0.6.18 addition; a script counts what each version draws. Needs Loudon's eye on whether the shelf should move. **Proof made 2026-11-15:** [proofs/2026-11-15-plot-0619](../proofs/2026-11-15-plot-0619/plot-0617-vs-0619.html); check passed. Open for his eye.
- **Ledger items 4 to 7 (2026-11-15), owed a review.** Read at the next review of the page; nothing to run.
