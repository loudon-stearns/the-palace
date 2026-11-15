---
title: "Mermaid — tuning"
born: 2026-11-08
links:
  - target: "[[Mermaid]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Mermaid page's record of what diagramming has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real diagram taught."
ledger: tuning
standards:
  for: "what drawing diagrams with Mermaid taught the Mermaid page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the renderer itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a diagram that leaves Obsidian"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Mermaid — tuning

What each job taught the Mermaid page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The two 2026-05-26 items are the page's founding gotchas, moved here on 2026-11-08 when the page's Gotchas became present-tense rules; the run line under them is the job the page's `last_tested` recorded. The 2026-05-30 smoke through `npx` is on the page's Test Suite, not here.

## From the Kuramoto coupling-regime diagram — 2026-05-26 — Sketch, Obsidian-inline

1. **The Sketch needed no `mmdc` and no SVG.** A fenced ```mermaid block embedded near the K-regime paragraph of [[Kuramoto Coupling]] rendered inline in Obsidian and satisfied the Enrichment placement protocol without an artifact in the bundle. Changed: Obsidian-inline is the Sketch-tier delivery path; Study and Piece diagrams that travel outside Obsidian (Loudon Live, exports) go through `@mermaid-js/mermaid-cli` to an SVG in the bundle.
2. **Raw `<` and `>` in a node label made the diagram fail silently.** Mermaid's parser reads them as tag delimiters; the regime diagram needed `K &lt; K_c` and `K &gt; K_c`. `<br/>` passed through. Changed: HTML-escape angle brackets in labels; `<br/>` is the one tag that may stay.

- run · 2026-05-26 · Kuramoto coupling-regime diagram, sketch · taught items 1, 2

## From the card check — 2026-11-14 — a brief-to-delivery flowchart in the new house theme

3. **The house theme is a generated `themeVariables` config, and it renders byte-identically.** *Owed a review: written by the shop-fix session outside a ledger review.* The design system's Shop table asks for a theme mapping its skins to Mermaid's `themeVariables`, written at the next invocation; this was it. `palace_mermaid_theme.py` writes `palace-mermaid.json` (the `base` theme, ground and text and borders from `colors_and_type.css`, JetBrains Mono) and `mmdc -c … -b '#0a0a0f'` rendered a nine-node flowchart with it: 43.5 s on the first `npx` run, about twice the 2026-05-30 figure, then 3.1 s, and two warm SVGs hashed identical. Every label took JetBrains Mono, but one rule in the SVG's style block kept Mermaid's default trebuchet face. Changed: the page names the theme under § Recipes (the trebuchet leftover waits here for review), the card's Wears line says what it wears, and the Forward Vector no longer names this flowchart as an unrun first job.
- run · 2026-11-14 · brief-to-delivery flowchart in the house theme, study · taught item 3

## From the sequence-and-state test — 2026-11-15 — paper and Graphite, two routes into the sandbox

5. **With Obsidian retired, the reader is the STIGMERGY app or an html proof, and both routes reach them.** *Owed a review: written by the shop-tests-image session outside a ledger review.* A sequence and a state diagram (`proofs/2026-11-15-sequence-state-paper/`) were rendered by mmdc on Graphite and on a paper config generated from `skin-drafting`. Served from a second origin in a sandboxed frame under the piece CSP from `_ops/rich-face/contract.mjs`: route A, the SVGs pasted into the page, drew nine in 1.4 s with no script; route B, mermaid 12.3.0 from jsdelivr pinned with SRI and drawn from text after JetBrains Mono loads, drew two in 3.4 s, but `conform.mjs --static` refuses it (`cdn-off-shelf`: mermaid is not in `libs.json`). The app itself draws a ```mermaid fence live (`_ops/stigmergy/app/src/components/state/MermaidBlock.jsx`, mermaid ^12.3.0), read from source, not run. The house config failed sequence and state: notes stayed Mermaid's yellow, a note's text ran 91 px out of its box, and state labels read `stateLabelColor` (#333) so came out dark on Graphite; adding note tokens, `wrap: true` and `stateLabelColor` fixed the colours, but mmdc's SVG still overran by 14 px where the client-side draw overran by 0. Every SVG parsed and was byte-identical on rerun; 1.6 to 10.9 s a render on a loaded Mac. Changed: on Loudon's ruling of 2026-11-15 the card's Best used for, Not yet shown and Hands on, and the Delivery gotchas, were restated for the app and an html proof; the theme fix is not yet carried into `palace-mermaid.json` or its generator.
6. **What is new, 2026-11-15.** Mermaid 12.0.0 (npm, 2026-09-10) bundles ELK as the default layout, a new default look (`neo`), and drops `defaultRenderer`; 12.3.0 is from 2026-11-03 (notes via https://newreleases.io/project/github/mermaid-js/mermaid/release/mermaid@12.0.0). Tried: one state diagram under ELK (1773×335) and dagre (1675×396), both rendered. beautiful-mermaid 1.1.3 (https://github.com/lukilabs/beautiful-mermaid) renders in plain Node with no browser, in milliseconds and byte-identical, but its actor overlapped a message, lifelines struck labels, and the state flow came out back to front. Changed: nothing; mmdc stays the route.
- run · 2026-11-15 · sequence and state on paper and Graphite, two routes framed in the sandbox, ELK against dagre, beautiful-mermaid tried, probe · taught items 5, 6
