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
