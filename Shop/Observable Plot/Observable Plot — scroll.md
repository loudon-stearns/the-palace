---
title: "Observable Plot — scroll"
born: 2026-11-15
links:
  - target: "[[Observable Plot]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Observable Plot's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# Observable Plot — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Observable Plot]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:11:42.496Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 4 runs on 3 days, counted from the ledger's run lines
- **Last run:** 2026-11-15 — zoom out: the same three charts in Plot 0.6.17 and 0.6.19, headless (proofs/2026-11-15-plot-0619), probe · taught items 6–7, owed a review
- **Owed in the ledger:** 4 — items 4, 5, 6, 7; the next run's tail read picks them up first
- **Latest lesson:** item 7, from the test proofs — 2026-11-15 — two probes, checked headless — [[Observable Plot — tuning]]

### Runs

- 2026-11-15 — zoom out: the same three charts in Plot 0.6.17 and 0.6.19, headless (proofs/2026-11-15-plot-0619), probe · taught items 6–7, owed a review
- 2026-11-15 — the 3 × 4 flocking sweep grid against Node and the bare model, headless (proofs/2026-11-15-sweep-grid), probe · taught items 4–5, owed a review
- 2026-11-14 — the card's starter, web-smoke and conform --browser on mac · nothing new
- 2026-06-16 — smoke test on mac · nothing new

### Owed

- **4.** The seed-7 flock is deterministic inside one engine, not across engines. Node 25.9 (V8 14.1) and headless Chromium 147 give a different last bit from `Math.sin` / `Math.cos` for…
- **5.** The 3 × N sweep grid works as one `palacePlot()` call, and a phase square needs settled runs. `fx` alignment × `fy` separation, explicit `fx`/`fy`/`y` domains, twelve runs stepp…
- **6.** Two Plot versions in one page: clear `window.Plot` between the tags. The UMD bundle (0.6.17 and 0.6.19 alike) begins `t.Plot = t.Plot || {}`: it fills an existing `window.Plot` …
- **7.** Zoom out: Plot 0.6.18 (2026-11-03) and 0.6.19 (2026-11-05). Sources: https://registry.npmjs.org/@observablehq/plot (read 2026-11-15: latest 0.6.19, next 0.6.18-alpha.3), https:/…

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="run-83b58fb8d9" -->
### 2026-11-15 — zoom out: the same three charts in Plot 0.6.17 and 0.6.19, headless (proofs/2026-11-15-plot-0619), probe

taught items 6–7, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-48cfaf0816" -->
### 2026-11-15 — the 3 × 4 flocking sweep grid against Node and the bare model, headless (proofs/2026-11-15-sweep-grid), probe

taught items 4–5, owed a review
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-test-list" -->
### 2026-11-15 — the open tests, written down

The card's "not yet shown to hold" line, made into a list of tests: the sweep grid (proof made), the Vicsek chart, a Study-tier job in three browsers, how fast a slow re-render can go, the 2026-05-29 Node match (rechecked), and the move to Plot 0.6.19 (proof made). Each line says how it would be tested and whether it needs Loudon's eye.

**Artifacts:**
- [the test plan, § Open tests](Shop/Observable Plot/tests/test-plan.md)

<sub>written 2026-11-15 by a subagent of the shop-tests-web session, from the card and the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-plot-0619" -->
### 2026-11-15 — Plot 0.6.17 against 0.6.19, the same three charts

The shelf pins Plot 0.6.17 from February 2025. Plot 0.6.18 came out on 2026-11-03 and 0.6.19, a packaging fix, on 2026-11-05. This page loads both and draws the same three charts with whichever you pick, each written to use something 0.6.18 added: a ridgeline whose area draws its own line, three lines with hover tips and a plot-level legend, and a line coloured by its own value. The data is the seed-7 flock at three alignment weights.

A script counted what each version drew. Under 0.6.19 the ridgeline gets its lines (6 paths against 3), one tip shows where 0.6.17 stacks three, the legend appears (3 swatches against none), and the self-coloured line is drawn (814 px) where 0.6.17 leaves dots and a console warning. The page's flock equals the Flocking source model sample for sample. Both versions ran on the shelf's d3 7.9.0. Not tried: `light-dark()` colours, P3 rasters, the new ES module build.

**Switch back and forth. Is the 0.6.19 drawing plainly easier to read, enough that the shelf should move to it?**

Nobody has seen this.

**Artifacts:**
- [the comparison, switchable](Shop/Observable Plot/proofs/2026-11-15-plot-0619/plot-0617-vs-0619.html)
- [as 0.6.17 draws it, three tips stacked](Shop/Observable Plot/proofs/2026-11-15-plot-0619/plot-0617.png)
- [as 0.6.19 draws it, one tip](Shop/Observable Plot/proofs/2026-11-15-plot-0619/plot-0619.png)
- [what was measured](Shop/Observable Plot/proofs/2026-11-15-plot-0619/measured.json)
- [the check](Shop/Observable Plot/proofs/2026-11-15-plot-0619/check.mjs)

<sub>test proof, 2026-11-15 · headless Chromium 147 · web-smoke ok; conform --browser ran clean at 760 and 1130 px, with one expected error: the 0.6.19 URL is not on the shelf yet · made by a subagent of the shop-tests-web session · ledger items 6 and 7</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-sweep-grid" -->
### 2026-11-15 — the flocking sweep grid, 3 by 4

The card called the sweep grid a hope. Here it is: the seed-7 flock run twelve times, separation down the rows (0.5, 1.5, 3.0) and alignment across (0, 0.3, 1.0, 2.0), cohesion chosen on the page. Each small panel is how aligned the flock is over 30 seconds, all on one 0 to 1 scale, and a square below folds each run to its mean over the last 5 seconds. It runs when you press the button, about 3 seconds.

What was measured: the model is a byte-for-byte copy of the Flocking page's; the page's numbers equal that model run bare in the same browser; Node runs all three cohesions. Node starts the seed one bit apart (4 of 320 starting numbers), and the flock grows that: seven of twelve cells agree with Node to 3 decimals and the sep 0.5 row is off by up to 0.09. One run, sep 1.5 · align 0.3, was still climbing at 20 s, so the square is where each run had got to, not where it settles.

**Looking at the grid, can you see where the flock tips from scattered to moving together, and does the square say the same thing more plainly, or does it hide something the curves show?**

Nobody has seen this.

**Artifacts:**
- [the sweep grid, playable](Shop/Observable Plot/proofs/2026-11-15-sweep-grid/sweep-grid.html)
- [the grid and the square after a run](Shop/Observable Plot/proofs/2026-11-15-sweep-grid/grid.png)
- [what was measured, with Node's phase table for all three cohesions](Shop/Observable Plot/proofs/2026-11-15-sweep-grid/measured.json)
- [the check](Shop/Observable Plot/proofs/2026-11-15-sweep-grid/check.mjs)

<sub>test proof, 2026-11-15 · headless Chromium 147 and Node 25.9 · web-smoke ok; conform --browser 0 errors, 0 warnings at 760 and 1130 px · made by a subagent of the shop-tests-web session · ledger items 4 and 5</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-5f838e86af" -->
### 2026-11-14 — the card's starter, web-smoke and conform --browser on mac

nothing new
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-a9dbef96ce" -->
### 2026-06-16 — smoke test on mac

nothing new
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
