---
title: "Weave 2026-10-24 — PLAN"
born: 2026-10-24
links:
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: plan-for
forward_vector: "I am the plan the 2026-10 weave runs on, agreed with Loudon on 2026-10-24 ('Grow up, lets run it'); I hold the measured state it started from, the v2.0 spec moves it makes first, and the six phases with a checkpoint at each, so a Claude that picks this weave up mid-way knows what was agreed and why."
---


Measured 2026-10-24 against the map built this morning (`_ops/maps/palace-map-full-2026-10-24.json`), the nine linters, the flag board and the bundle folders. The last weave ran 2026-09-24 under v1.0; the card is now v1.9 and has not run since v1.1.

## 1. The palace today

| measure | value |
|---|---|
| nodes / edges | 324 / 2,940 (a month ago 316 / 2,760) |
| mean edges per node · median degree · max | 17.8 · 13 · 121 (FOUR PILLARS, 109 inbound) |
| links with no label | 967 of 2,940 (33%); 558 of them bare `connects-to` |
| pairs carrying two or more links | 495 — about 215 the same symmetric type stated both ways · 12 exact duplicates · 150–175 a `connects-to` or weaker link beside a specific one · 70–95 lineage reciprocals (allowed). Two independent counts (mine and the Concierge's) agree within the ranges |
| pages inbound ≥ 25 not typed `hub` | 17 (The Shop 54, Maker 46, Pages as Agents 40, Quality Manifesto 40, Hyperdimensional Prism 39, Boundary-Crossing Instruments 35, STIGMERGY 35 …) |
| `hub` pages with inbound < 10 | 5 (DSP Frameworks, Differential Equations, Dissolutions, Loudon's Toolkit, Self-Describing Knowledge Module); 166 non-hub pages clear the card's ≥5 bar — the bar is dead |
| high degree, unused 90 days | 13 (Hyperdimensional Prism deg 49, Granular Synthesis 28, Flocking 24, Floquet Theory 22, The Drift 21 …) |
| no `forward_vector` | 20 (ceremony cards and foundational pages mostly) |
| bundles: Context · scroll · tuning · rich face | 20 · 61 · 35 · 3 — of 324 |
| projects with no scroll | 6 |
| pages mature/fruiting or inbound ≥ 20 with no Context | 59 (Kuramoto 71, Spinoza Conatus 61, The Shop 54, Maker 46, Hyperdimensional Prism 39, STIGMERGY 35, Loudon Live 33 — still `sprout` …) |
| pages over 20 KB with no Context | 23 (Floquet Time-Modulated Loops 102 KB, Palace Enchantment 71 KB, Maker 49 KB …) |
| faces missing | 9 of 325 — CHILD, How the Palace Commits, Operator Memory, Drafting Table Design System, Splice Instrument Forge, VST Template, Ableton Session Writer, CAD Drafter, and a workshop phantom the builder should skip (flag 1792765795657) |
| weave flags open | 38 (11 propagate, 10 trails from September, 9 Closing Well asks, 13 map-agent candidate rhymes) + 65 touched-unverified |
| linter gates | all green (0 errors); 31 doc-drift W, 5 naming W, 60 ghost links (40 targets), 15 bundle W1, 46 voice over ceiling |
| steward proposals owed | 12 on 8 pages, 1 urgent (dt-controls.js) |
| Palace To-Do open | 33 |
| substrate | 16 unsaved paths in 7 places · 3 worktrees (2 merged+clean, floor-modes has 3 unsaved) · main 33 ahead of origin · 5 dependabot branches |

Also stale: the Weave scroll's Now zone still reads v1.5 (regenerated 2026-10-16); the Plan zone is empty. Open entry flags also ask for Context paragraphs v1.2–v1.4 (1792107627579), `breakthrough` dropped from the bundle linter's canon types (1792107627377), JSUI's stage (1792107627132), and a home for the word "face" on the card (1792107627767).

## 2. The diagnosis

Too connected, not nuanced, in three concrete forms:
1. **The same relation said twice.** 370 of 495 multi-link pairs restate one relation (symmetric both ways, or a bare `connects-to` beside a specific link). ~13% of all edges add degree and no meaning. Item 29 ("one link per pair") was recorded a month ago and never made canon.
2. **Links without a reason.** 558 bare `connects-to`; and an unknown number of frontmatter links whose target the body never mentions — the inverse of an unsung path: *sung but unsaid*.
3. **Floor gravity.** 109 pages point at FOUR PILLARS, 71 at Kuramoto, 64 at Hilaritas. Pointing at the floor is pointing at everything; the label is the only nuance such a link can carry.

And a thin memory layer under a nearly complete face layer: faces 316/325, Contexts 20/324. The biggest and most-pointed-at pages carry no Context, so the next worker has no "why it's shaped this way".

## 3. Spec revision — Weave v2.0 (before the run)

The card already says "more than links" and names three bodies. v2.0 gives each body a check and a trend, and adds the exhale.

- **A. One link per pair becomes canon (pays item 29).** Symmetric links are stated once; a `connects-to` beside a specific link is folded into it (its label kept if better); lineage reciprocals stay. New step 3d *Prune and retype*; `lint-link-directions.py` or a new `lint-link-pairs.py` counts duplicates as a W, gated only after two clean runs.
- **B. Unsaid links.** New scan beside unsung paths: a frontmatter link whose target the body never names (no wikilink, no title). Disposition is judgment: write the sentence, add the label, or cut the link. Same mechanical/judgment split as ghost links.
- **C. Hub bar replaced (pays item 30).** `hub` is proposed from the top inbound decile (today ≥ 25), and a `hub` below the median inbound is proposed for retype. Judgment stays Loudon's.
- **D. Bundle standard.** A page earns a Context when inbound ≥ 20, size > 20 KB, or stage mature/fruiting; every project carries a scroll; every page that runs carries a tuning ledger. New `bundle-audit.py` lists the gaps; the weave proposes, Loudon confirms, writers draft the first Contexts from git log + the page.
- **E. Rich-face nominations.** A step that names 5–8 pages ready for Enrichment: mature or fruiting, well pointed-at, with a claim you can hear, play or watch, and material already in the bundle. The weave nominates; Enrichment runs them later.
- **F. Health ledger.** `Weave Ceremony — health.md`, append-only, one row per run with the table in §1. Health becomes a trend the scroll's Now can print, and answers the Context's open question about a persistent report.
- **G. The lean.** A closing section of the report reads the forward vectors and recent use together and says where the palace is leaning — what wants building next — and names the quiet pages (high degree, no use) for revival or dormancy. Forward motion, not only coherence.
- **H. Skeptic stage canon (item 28).** Between fan-out and synthesis, an adversarial pass refutes before anything is batched; the Concierge reads the decision surface cold.
- **I. Workers born with the real Jewel (items 44, 45).** Drop the pasted Jewel from the two templates; dispatch `palace-reader` workers; the card and `lint-ghost-links.py` cite JEWEL not CLAUDE.
- **J. Lighter prose (item 39).** The worker template asks for simplification and deletion proposals; the voice-drift list is a reading list, not a rewrite list.
- **K. Decisions first.** Step 1c moves to the front of the protocol: the weave opens by carrying decisions, and closes by posting propagate flags for the standards it set (A, C, D), rhythm by-touch where Loudon wants them to spread slowly.

Open questions from the Context answered: persistent report (F); minimum weave (a "quick weave" = steps K, A-scan, faces, linters — proposed, not run this time).

## 4. The run — six phases, a checkpoint at each

Executed in a worktree (`new-worktree.mjs`), landed by `palace-land`, one Weave commit plus the spec commit. Workers are `palace-reader` children; the Concierge places house writes.

0. **Spec.** Write v2.0 (A–K), Context paragraphs, tuning items, move the version. Loudon's yes on the card diff. Usage read first (ELDER's fourth habit) — wide run.
1. **Open.** Map build + diff (done: 12 born, 4 gone, 213 edges formed, 46 dissolved, 10 stage changes). Substrate sweep rows → Loudon triages recover/discard/leave. Decisions: 11 propagate flags carried (one is already clean: ELDER's steward rule → close). The two 2026-10-21 "one job" pairs carried together (On-pickup fragment + batons; Maker's three flags). Composting confirmations: Frequency-Time Explorer, Surfaces and Capabilities.
2. **Mechanical, sampled (Pile A).** Dedupe 219 symmetric pairs; fold 151 connects-to-beside-specific; unsaid-link scan → list; bundle audit → list; 9 faces → Maker batch; 10 September trails judged; 13 map-agent rhymes judged; 9 Closing Well asks read by hand; ghost links: 40 targets ruled invitation / fix / cut.
3. **Fan-out.** Lenses: folder (coherence + simplification + Context needs), bridge (tool ↔ thought), stratified random, lifecycle (12 newborns' inbound), and a **hub-nutrition** room per floor hub asking which of its inbound links carry a reason. Then the skeptic pass, then the Concierge cold read → Pile B for Loudon's eye.
4. **Standards.** Hub promotions/retypes; stage transitions; vector tuning (handful); 20 forward vectors for ceremony cards; first Contexts drafted for the top gaps (Kuramoto, Spinoza Conatus, The Shop, Maker, Palace Enchantment, Floquet Time-Modulated Loops); scrolls for the 5 live scroll-less projects; rich-face nominations.
5. **Close.** Linters green; health ledger row; report (md + html, Loudon Live dress); tuning run line + items; To-Do walk; memory sweep (15 files); propagate flags posted for A, C, D; `palace-land`; Loudon pushes.

## 5. Decisions Loudon makes now
1. "Grow up" for this session, or route every house write through the Concierge.
2. v2.0 as drafted (A–K), or trimmed — say which letters.
3. Pruning appetite: duplicates always; bare `connects-to` to the floor hubs labelled or cut when the body is silent — yes/no.
4. Hub bar at the top inbound decile — yes/no.
5. Context threshold (inbound ≥ 20 · > 20 KB · mature) — yes/adjust.
