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
