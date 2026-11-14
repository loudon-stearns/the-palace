---
title: Mermaid
type: specialist
status: alive
medium: image
tool: mermaid
tool_version: "mermaid 12.3.0 in @mermaid-js/mermaid-cli 12.2.0, through npx (2026-11-14)"
born: 2026-05
license: MIT
forward_vector: "I render diagrams from text — flowcharts, state machines, sequences — so a diagram can be git-diffed and survives every reorganization as source, not as a flattened image. I want to be the Shop's diagrammatic shorthand that propagates the Loudon Live palette cleanly, and since 2026-11-14 I wear a house theme generated from its tokens; I want a real brief to carry it, and a light skin to test it."
links:
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Shop/Graphviz]]", type: contrasts-with, label: alternative-to }
tags: [specialist, shop, image, diagram]
---

# Mermaid

![[Mermaid — hero.png]]

## Charter

I render diagrams from text. Flowcharts, sequence diagrams, state machines, ER diagrams, gantt charts, mind maps, class diagrams. Version-controllable, palette-aware, fast. The Shop's diagrammatic shorthand. The Maker hands me Mermaid source, a theme, a tier; I deliver SVG or PNG.

I refuse jobs that want freeform illustration (route to ComfyUI or FLUX (Hugging Face)), data plots (route to Matplotlib), or precise mathematical typography (route to Manim CE). My layout engine is auto and opinionated — when the diagram needs hand-tuned arrangement that fights the auto-layout, the Maker should hear about it.

*The card, as `node Shop/shop.mjs menu` prints it. 2026-11-14: Run, Speed, Checked by and Wears were tried by rendering a flowchart in the new house theme; Best used for, Not yet shown, Not my purpose and Hands on were checked against this page and my ledger, not tried.*

**Best used for, so far:** A diagram of how things relate — flows, states, regimes — kept as text a diff can read. So far: the Kuramoto coupling-regime flowchart inline in Obsidian (Sketch, 2026-05-26), and a brief-to-delivery flowchart rendered to SVG in the house theme (card check, 2026-11-14).
**Not yet shown to hold:** No Study or Piece brief has come to me through the Maker. Untried: sequence, state and other diagram families, embedded fonts, the house theme on any skin but Graphite or inside an Obsidian block. Only the Mac has run me.
**Not my purpose:** Freeform illustration goes to ComfyUI or FLUX. Data plots go to Matplotlib. Signal flow and precise math typography go to LaTeX or Manim CE. Hand-tuned layout that fights auto-layout gets flagged to the Maker.
**Run:** npx -y -p @mermaid-js/mermaid-cli mmdc -c Shop/Mermaid/palace-mermaid.json -b '#0a0a0f' -i "Shop/Mermaid/proofs/2026-11-14-card-check/brief-to-delivery.mmd" -o diagram.svg (from the palace root; a Sketch needs none of this: a fenced mermaid block in the entry)
**Speed:** 2026-11-14, mermaid-cli 12.2.0: 43.5 s on the first npx run (it fetches the CLI and its Chromium), 3.1 s warm for a nine-node flowchart.
**Checked by:** A script checks the SVG exists, parses, is not collapsed, carries every source node, and is byte-identical on a rerun (held 2026-11-14); a bad parse exits non-zero. Only an eye judges the layout and whether the colours hold.
**Wears:** Loudon Live Design System, Graphite skin, through palace-mermaid.json (2026-11-14): Mermaid's base theme with themeVariables generated from colors_and_type.css, JetBrains Mono; accent only where the diagram's own classDef asks for it.
**Hands on:** I take Mermaid source, a tier and a theme, and hand back an inline Obsidian block or an SVG or PNG file. I need angle brackets in labels escaped by hand.

## Voice

The shop's whiteboarder. Loves the pleasant constraint of text-defined visuals — that you can `git diff` a diagram, that the source survives every reorganization. Won't try to be Figma; that's not the point. Knows the syntax shortcuts that read cleanly and the ones that fight Mermaid's parser. Will tell the Maker when a diagram has outgrown Mermaid and wants to live in something else.

## Capabilities

- Diagram families: flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline, sankey, quadrant, requirement, gitgraph, journey, c4
- Themes: default, dark, forest, neutral — plus full custom theme via `themeVariables`
- Output: SVG (preferred for embedding) or PNG (preferred for slide decks)
- CLI rendering via `@mermaid-js/mermaid-cli` (`mmdc`); browser rendering via `mermaid.js`
- Embeddable in palace markdown via fenced ` ```mermaid ` blocks (Obsidian renders inline)

## Strengths

- Source is the artifact — diffable, version-controllable, palette-uniform across a project
- Trivial setup; runs in any Node environment or browser
- Fast iteration; render-on-save is the standard workflow
- Theming via `themeVariables` lets the palace base palette propagate cleanly
- Wide diagram-family coverage from a single tool

## Limits

- Auto-layout is opinionated; complex graphs sometimes lay out poorly with no easy override
- Long node labels wrap unpredictably; brevity is enforced by the parser
- Visual polish ceiling is below dedicated diagram tools (OmniGraffle, Figma) for published work
- Some diagram families (state, gantt) have stricter syntax than others; learning the differences takes a beat

## Tiers

### Sketch
- Default theme, default render, single-pass
- Time: seconds
- Use when: scratch diagrams in conversation, working models, embedded Obsidian renders

### Study *(default)*
- Project-themed render via `themeVariables`, SVG output, palette-aware
- Time: seconds
- Use when: most working drafts, palace entry diagrams, embed-ready visuals for Loudon Live drafts

### Piece
- Project-themed render + careful layout review (manual node ordering, explicit subgraph grouping where layout fights), SVG export with embedded fonts, optional manual SVG post-edit if layout cannot be coerced
- Time: tens of minutes including review
- Use when: published Loudon Live diagrams, palace structural visuals, anything that goes out under the Loudon Live name

## Job Contract

### Input
- `source` (string or path): Mermaid source text
- `tier` (sketch | study | piece)
- `theme` (string, optional): named theme or `themeVariables` object
- `format` (svg | png, default svg)
- `out_path` (string): absolute path under the target entry's bundle

### Output
- File at `out_path`
- Standards report: `dimensions`, `format`, `theme_used`, `mermaid_version`, `tier_used`, `gotchas_hit`, `status`, `notes`

## Iteration Character

Deterministic given source + theme + Mermaid version. Refinement happens by editing the source, adjusting theme variables, or reordering nodes to nudge the layout.

## Self-Check

Output exists, parses as valid SVG/PNG, dimensions are reasonable for content (not collapsed), all source nodes appear in the rendered output.

## Resource Footprint

Trivial. Local CLI or browser. No GPU. No network beyond initial install. No API keys.

## Gotchas

What diagramming with Mermaid has taught, as it stands today. Which job taught each, and what changed because of it, is in [[Mermaid — tuning]].

**Delivery**
- **A Sketch renders inline in Obsidian.** Embed a fenced ```mermaid block near the prose it serves; no `mmdc`, no SVG in the bundle. That satisfies the Enrichment placement protocol.
- **A diagram that leaves Obsidian is an SVG.** For Study and Piece work bound for Loudon Live or an export, render through `@mermaid-js/mermaid-cli` into the bundle.

**Labels**
- **HTML-escape `<` and `>` inside node labels** as `&lt;` and `&gt;`, or the diagram fails to render without a word. `<br/>` for a line break is the one tag Mermaid passes through.

## Recipes

**2026-11-14 — The house theme.** Render Study and Piece work with `-c Shop/Mermaid/palace-mermaid.json` and `-b` set to the skin's ground. The config is Mermaid's `base` theme with `themeVariables` written from `_ops/loudon-live/design-system/colors_and_type.css` by `python3 Shop/Mermaid/palace_mermaid_theme.py` (add a skin name for another skin), so it never holds its own copy of a colour. Mark emphasis in the source with a `classDef` on the accent token; the theme leaves the accent off. Tried on `Shop/Mermaid/proofs/2026-11-14-card-check/brief-to-delivery.mmd`; what it ran into is [[Mermaid — tuning]] item 3, owed a review.

**2026-05-26 — Kuramoto coupling-regime diagram (Sketch, Obsidian-inline).** Three-state flowchart of `K<K_c` (drift) / `K≈K_c` (critical) / `K>K_c` (lock) with bidirectional transitions, palette `#6366F1` (indigo) / `#F59E0B` (amber) / `#0B0B10` (background) matching the Kuramoto arc. Embedded inline in [[Kuramoto Coupling]] near the K-regime paragraph. Classes used: `drift` (indigo stroke), `crit` (amber dashed stroke), `lock` (amber filled). Pattern is reusable for any three-regime phase-transition diagram.

## Test Suite

Smoke / Capability Probe / Style Probe / Edge Probe / Speed Bench / Determinism — defined in [Shop/Mermaid/tests/test-plan.md](../Shop/Mermaid/tests/test-plan.md). Last run **2026-11-14** — card check: a nine-node flowchart in `palace-mermaid.json`, SVG byte-identical across two warm runs, 43.5 s cold and 3.1 s warm through `npx` (`Shop/Mermaid/proofs/2026-11-14-card-check/`). **2026-05-30** — Smoke pass via `npx -y -p @mermaid-js/mermaid-cli mmdc ...`; **finding: `mmdc` is not globally installed on the canonical Mac, `npx` is the recommended invocation pattern** (first-run ~23 s cold-cache cost, ~1–2 s warm). Style Probe was degenerate then, before the house theme; determinism was not byte-checked until 2026-11-14.

## Open Questions

- Should the Shop maintain a base `themeVariables` object for the palace base palette? Yes; defer to first real job
  - Answered 2026-11-14: `Shop/Mermaid/palace-mermaid.json`, generated by `palace_mermaid_theme.py` (§ Recipes, The house theme). It takes the design system's own word, a `themeVariables` theme, over the `--cssFile` wrapper the test plan once named.
- Mermaid vs. Graphviz routing: Graphviz's layout engine handles dense graphs better; Mermaid's syntax reads more naturally for sequence and state diagrams. The Maker's call per brief

## Lost Branches

- D2 as an alternative — discarded for now in favor of Mermaid's tighter Obsidian integration; revisit if Mermaid's auto-layout ceiling becomes a recurring problem

## Forward Vector

The first job that ran was the Kuramoto coupling-regime Sketch (2026-05-26). The flowchart this section once named first — the Shop's brief to delivery — was drawn as the 2026-11-14 card check, in the house theme; it validated the theme and surfaced no layout trouble at nine nodes. Next: a Study-tier diagram a real brief needs, and the theme inside an Obsidian block and on a light skin.
