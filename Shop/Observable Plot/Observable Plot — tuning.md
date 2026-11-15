---
title: "Observable Plot — tuning"
born: 2026-11-08
links:
  - target: "[[Observable Plot]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Observable Plot page's record of what charting has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real chart taught."
ledger: tuning
standards:
  for: "what charting with Observable Plot taught the Observable Plot page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or one smoke through Shop/Maker/run-tests.mjs"
  line: "- run · <date> · <brief, tier | smoke test on host> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal; run-tests.mjs --write-back marks a passing smoke"
  merge: union
  kept: git
  trim: never
---

# Observable Plot — tuning

What each job taught the Observable Plot page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The three 2026-05-29 items are the page's founding gotchas from the [[Flocking]] job, moved here on 2026-11-08 when the page's Gotchas became present-tense rules. That job carries no run line, as seeded history doesn't; the one run line is the 2026-06-16 harness smoke the page's `last_tested` recorded. The page's earlier watch-list, written before the first job and undated, stays on the page as rules.

## From the Flocking analytical view — 2026-05-29 — Sketch, then the Graphite Piece-tier test

1. **The UMD bundle externalises d3, and without it `window.Plot` was silently `{}`.** `dist/plot.umd.min.js` runs `factory(global.Plot = {}, global.d3)`; with `window.d3` absent the factory throws during script execution and leaves an empty object. No error was logged in the harness. The symptom surfaced far downstream as `Plot.frame is not a function`. The sharpest finding of the job. Changed: load `https://cdn.jsdelivr.net/npm/d3@7` before the Plot script tag; the tell is `Object.keys(Plot).length === 0` with `Plot.version === undefined`. The load order in § Working within the Loudon Live design system carries it.
2. **No native animation, as documented; a slow re-render worked.** Stepping the model on a fixed-rate `setInterval` and calling `el.replaceChildren(Plot.plot(...))` at about 6 Hz was right for a slow analytical view, and sturdier than rAF because it dodges the background-tab throttle that freezes 60 fps sketches. Changed: that is the pattern for slow analytical motion; smooth tweened motion goes to D3.
3. **Faceted small multiples lied without a shared y-domain.** The three R(t) sweep panels needed `y: {domain: [0,1]}` to be comparable; without it each facet auto-scaled on its own. Changed: the watch-list item on consistent facet domains went from a caution to a confirmed, load-bearing rule.

- run · 2026-06-16 · smoke test on mac · nothing new

## From the card check — 2026-11-14 — the card's starter, a probe

- run · 2026-11-14 · the card's starter, web-smoke and conform --browser on mac · nothing new

## From the test proofs — 2026-11-15 — two probes, checked headless

4. **The seed-7 flock is deterministic inside one engine, not across engines.** Node 25.9 (V8 14.1) and headless Chromium 147 give a different last bit from `Math.sin` / `Math.cos` for some of the 80 starting headings: 4 of the 320 starting numbers differ, each by 1 ulp. The flock grows that. In the 3 × 4 sweep at cohesion 1.0 over 30 s, seven cells agree with Node to 3 decimals in mean R and the sep 0.5 row differs by up to 0.086. The page's own numbers equal the source model run bare in the same browser (to its 6-decimal rounding), and the copy of the model block is byte-identical to `Flocking/flocking-observable-plot-analytical.html`'s. The 2026-05-29 recipe's browser 0.583 against Node 0.579 at align 0.3 was not this: today, at exactly step 900, both engines give 0.579 / 0.953 / 0.995, so that check most likely read the browser a few steps off. So the card's "matched a Node reference to 3 decimals" held for two of three that day. Seen in `proofs/2026-11-15-sweep-grid/` (`measured.json`). Changed: nothing yet. Owed a review.
5. **The 3 × N sweep grid works as one `palacePlot()` call, and a phase square needs settled runs.** `fx` alignment × `fy` separation, explicit `fx`/`fy`/`y` domains, twelve runs stepped in 20-step chunks on `setTimeout` and re-drawn about 6 times a second while they run: 2.9 s in headless Chromium for 12 runs of 1800 steps. At 20 s, sep 1.5 · align 0.3 was still climbing (0.67 mean R; at 30 s it is 0.85), so a mean over a fixed late window is a snapshot of where a run has got to, not where it settles. At cohesion 1.0 the flock tips between align 0 and 0.3 for sep 0.5 and 1.5, and between 0.3 and 1.0 for sep 3.0 (browser mean R, last 5 of 30 s); sep 0.5 · align 1.0 (0.73) sits below sep 0.5 · align 0.3 (0.86), one of the wandering cells. Nobody has looked at the grid yet. Owed a review.
6. **Two Plot versions in one page: clear `window.Plot` between the tags.** The UMD bundle (0.6.17 and 0.6.19 alike) begins `t.Plot = t.Plot || {}`: it fills an existing `window.Plot` rather than making a new one. Loading 0.6.19 after 0.6.17 without `window.Plot = undefined` in between would mix them into one object. Stashing each (`window.Plot0617`, `window.Plot0619`) gave two objects with 167 exports each. The page's load-order gotcha describes the bundle as `global.Plot = {}`; that is the older reading, the mechanism (d3 must come first) still holds. Seen in `proofs/2026-11-15-plot-0619/`. Owed a review.
7. **Zoom out: Plot 0.6.18 (2026-11-03) and 0.6.19 (2026-11-05).** Sources: https://registry.npmjs.org/@observablehq/plot (read 2026-11-15: latest 0.6.19, next 0.6.18-alpha.3), https://github.com/observablehq/plot/blob/main/CHANGELOG.md § 0.6.18, and the v0.6.19 release notes (exports and type fixes only). Tried, the same three specs under both versions, headless: `areaY` with `line: true` draws one "area-line" mark of 6 paths in 0.6.19 and a solid "area" of 3 in 0.6.17; with three `tip: true` lines bunched, 0.6.19 showed 1 tip where 0.6.17 stacked 3 (the new `pool` option); plot-level `legend: true` drew a 3-swatch legend in 0.6.19 and nothing in 0.6.17; `lineY(…, {y: "R", stroke: "R"})` drew 814 px of line in 0.6.19 and 181 zero-length pieces (dots) plus a z-cardinality console warning in 0.6.17. The 0.6.19 UMD is built against d3 7.9.2 and ran clean on the shelf's d3 7.9.0. Not tried: `light-dark(…)` colours, raster `colorSpace: "display-p3"`, ordinal and threshold opacity scales, `plot.scale("projection")`, the new bundled ES module `dist/plot.js`. Also seen: the legend's swatch labels sit outside the SVG and wear `system-ui, sans-serif`, not the mono face `palacePlot()` gives the SVG; that is the wrapper's gap, not the version's, and likely holds for the starter's `color: {legend: true}` under 0.6.17 too (not checked). Nobody has seen the comparison. Owed a review.

- run · 2026-11-15 · the 3 × 4 flocking sweep grid against Node and the bare model, headless (proofs/2026-11-15-sweep-grid), probe · taught items 4–5, owed a review
- run · 2026-11-15 · zoom out: the same three charts in Plot 0.6.17 and 0.6.19, headless (proofs/2026-11-15-plot-0619), probe · taught items 6–7, owed a review
