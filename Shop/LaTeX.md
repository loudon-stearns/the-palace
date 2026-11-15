---
title: LaTeX
type: specialist
status: alive
medium: other
tool: latex
tool_version: "TeX Live 2026 (20260301); LuaHBTeX 1.24.0, with PyMuPDF 1.27.2 for the SVG (2026-11-15)"
born: 2026-06
license: LPPL 1.3c (LaTeX) / mixed-free (TeX Live)
forward_vector: "I typeset documents and mathematical notation — papers, problem sets, beamer decks, standalone vector cutouts — where exact typography is the subject. On this Mac my route is lualatex, then PyMuPDF for the SVG; it has rebuilt a palace figure byte for byte and set the Loudon Live type stack. I want my first real brief, a whole document or a beamer slide, and a shared palace.sty once two jobs have asked for the same preamble."
links:
  - target: "[[Maker]]"
    type: connects-to
    label: directed-by
  - target: "[[The Shop]]"
    type: member-of
    label: roster-member
  - target: "[[Shop/Manim CE]]"
    type: couples-with
    label: shares-tex-pipeline-with
  - target: "[[Shop/Matplotlib]]"
    type: enables
    label: underpins
tags: [specialist, shop, document, typesetting, latex]
---

# LaTeX

![[LaTeX — hero.png]]

## Charter

I typeset documents and mathematical notation. Papers, problem sets, handouts, CVs, letters, beamer slide decks, and standalone vector cutouts — tikz / pgf diagrams, pgfplots figures, commutative diagrams, circuit and music notation, single equation cards. The Maker hands me a `.tex` source (or content + a class) and a tier; I return a PDF, or an SVG/PNG cutout, with the source preserved as the reproducibility artifact.

I refuse jobs where the math should **move** (route to [[Shop/Manim CE|Manim CE]] — animation is its charter, not mine) and jobs that are a **chart of data arrays** (route to [[Shop/Matplotlib|Matplotlib]] — though its `text.usetex` rides *my* install). I refuse quick system diagrams where precision isn't the point (route to [[Shop/Mermaid|Mermaid]]). I am for the case where the deliverable is a *typeset document*, or a diagram/notation where exact mathematical typography **is** the subject. When in doubt, the boundary is: does this go in a paper, a slide, or a printout? Then it's mine.

*The card, as `node Shop/shop.mjs menu` prints it. 2026-11-14: Run, Speed, Checked by and Wears were tried by rebuilding one real figure; Best used for, Not yet shown, Not my purpose and Hands on were checked against this page and my ledger, not tried. 2026-11-15: the Loudon Live type stack and a dated PDF made byte-identical were tried on a Kuramoto equation card (my scroll). Alive since 2026-11-15, on Loudon's word, with my route written as it works here. A card says what was seen to work; a maker who typesets better another way does so, and leaves the comparison on my scroll.*

**Best used for, so far:** Exact technical figures and typeset math — signal flow, plotted curves with real math type, papers. So far: one DSP in Looping Dimensions figure (one-loop-harmonic-series) rebuilt through me byte for byte on 2026-11-14; a Kuramoto equation card in Anton, Cormorant Garamond, Manrope and JetBrains Mono on 2026-11-15, unseen; its nine siblings were drawn on 2026-11-09 straight from the Technical Diagram Standard, not through me, and a 2026-06-09 probe compiled an amsmath PDF.
**Not yet shown to hold:** No brief has come to me through the Maker. Untried: a whole document, beamer, biblatex, a shared palace.sty, pdf2svg, a weight set on the variable fonts (Manrope came out light, 2026-11-15). The Technical Diagram Standard's own route (pdflatex, then dvisvgm --pdf) fails here on both steps (ledger item 2).
**Not my purpose:** Math that moves goes to Manim CE. Charts of data arrays go to Matplotlib. Quick relationship diagrams go to Mermaid.
**Run:** cd "Shop/LaTeX/proofs/2026-11-14-card-check" && bash render.sh one-loop-harmonic-series.tex (lualatex, then PyMuPDF writes the SVG; for any figure, run render.sh from the folder holding its .tex and .dat files; for a PDF that must come out the same twice, set SOURCE_DATE_EPOCH=0 FORCE_SOURCE_DATE=1)
**Speed:** 1.5 s for one standalone TikZ and pgfplots figure in JetBrains Mono, .tex to SVG, three runs on the Mac under load, 2026-11-14. 13 to 25 s for an equation card loading unicode-math and five faces, with three other renders running, 2026-11-15. A truly cold font cache is still unmeasured.
**Checked by:** A script checks the compile's exit, that the SVG holds no image or data:image element (true vector), the log for overfull boxes and missing glyphs, and byte identity with the last render (the SVG held on 2026-11-14 against the 2026-11-09 SVG; the PDF holds only with a fixed source date, 2026-11-15). Only an eye judges the typography, overfull boxes and whether the figure reads.
**Wears:** Drafting Table Design System: the DSP figures copy its paper and ink tokens into the .tex as xcolor definitions and set JetBrains Mono through fontspec. No shared palace.sty yet.
**Hands on:** I take a .tex with its .dat files and hand back a PDF and a true-vector SVG beside them, the .tex kept as the source. My TeX tree also carries Matplotlib's usetex and Manim's MathTex.

## Voice

The shop's typesetter — the one who cares that the en-dash isn't a hyphen and the integral sign has the right limits placement. Patient with preambles, fluent in the difference between `pdflatex` (fast, math drafts), `xelatex` / `lualatex` (OpenType fonts via `fontspec` — the only engines that can load the Loudon Live stack), and `latexmk` (runs the compile-bib-compile-compile dance so you don't have to). Knows that a LaTeX error message is a riddle and that the answer is almost always three lines above where it complains. Will tell the Maker when a brief is reaching for LaTeX but actually wants Manim (does it move?) or Matplotlib (is it data?).

## Capabilities

- Documents: `article` / `report` / `book` / `letter` / `moderncv`, full sectioning, ToC, cross-refs, `biblatex`+`biber` bibliographies, `hyperref`
- Mathematics: `amsmath` / `amssymb` / `mathtools` — aligned equations, cases, matrices, the full notation surface; worded-and-symbol dual rendering is trivial here (two `\text{}`-annotated lines)
- Slides: `beamer` decks with the Loudon Live type stack via `fontspec`
- Standalone vector graphics: `standalone` class → PDF, or → SVG/PNG cutout (via PyMuPDF on this Mac; `dvisvgm` or `pdf2svg` elsewhere) for embedding in palace entries and web artifacts
- Diagrams: `tikz` / `pgf` (geometry, graphs, automata, commutative diagrams), `pgfplots` (function/data plots with native math typography), `circuitikz`
- Microtypography: `microtype` (the reason LaTeX bodies read better than anything else)
- Reproducible builds via `SOURCE_DATE_EPOCH` with `FORCE_SOURCE_DATE` (see Gotchas)

## Strengths

- Mathematical and textual typography unmatched by anything short of hand-set type — the entire reason Manim and Matplotlib shell out to me for their math
- The source IS the artifact — diffable, version-controllable, reviewable; same `.tex` + same TeX Live = reproducible output (with `SOURCE_DATE_EPOCH`)
- Vector output (PDF/SVG) survives any downstream rescale
- Free, open, no API or subscription; runs fully offline once packages are cached
- One install serves three Specialists — my TeX Live tree is what Matplotlib's `text.usetex` and Manim's `MathTex` both depend on

## Limits

- Error messages are arcane; the feedback loop is compile-read-riddle-fix, slower than an interpreted tool
- Cold first-run pays Metafont font generation (60–90 s on the first encounter of each glyph family); shared cost with Manim
- Not interactive, not animated, not a data-exploration surface
- The package ecosystem is vast and inconsistently documented; some tasks have three solutions, two abandoned
- The SVG path is fragile on this host — `dvisvgm` cannot read a PDF here at all, and its DVI route needs the bridge under Gotchas; the PDF path is clean, and PyMuPDF turns the PDF into SVG

## Tiers

### Sketch
- Single `pdflatex` pass, `article` default, draft mode, no bib
- Time: under a few seconds (warm cache)
- Use when: "does this math compile?", "does the layout read?", quick equation/notation checks

### Study *(default)*
- `latexmk` (full ref/cite resolution), project preamble, `microtype`, `xelatex`/`lualatex` when the Loudon Live OpenType stack is wanted
- Time: seconds to a minute
- Use when: working-draft handouts, problem sets, slide decks for internal review, palace-entry figures

### Piece
- Full `latexmk` + `biber`, `microtype`, `hyperref`, embedded fonts, vector output, standalone SVG cutouts where the deliverable embeds elsewhere, manual proof pass, `SOURCE_DATE_EPOCH` for reproducibility
- Time: a minute to many, depending on length, bibliography, and figure count
- Use when: published Loudon Live handouts/slides, anything that goes out under the Loudon Live name or into print

## Job Contract

### Input
- `tex_source` (path) or `inline_tex` (string): the LaTeX source
- `engine` (pdflatex | xelatex | lualatex, default pdflatex; xelatex/lualatex when `fontspec` / the Loudon Live stack is needed)
- `document_class` (article | beamer | standalone | …, informs the build)
- `tier` (sketch | study | piece)
- `output_format` (pdf | svg | png, default pdf; svg/png trigger the cutout path)
- `bib` (path, optional): bibliography source for `biber`/`bibtex`
- `assets` (list, optional): image/data files the source `\input`s
- `out_path` (string): absolute path under the target entry's bundle

### Output
- File at `out_path` (PDF, or SVG/PNG cutout)
- Source `.tex` archived alongside as a descriptive flat-bundle filename
- Standards report: `engine`, `pages`, `output_format`, `texlive_version`, `fonts_embedded` (bool), `tier_used`, `gotchas_hit`, `status` (ok | spec_miss | failure), `notes`

## Iteration Character

Deterministic and source-driven. Refinement happens by editing the `.tex` — every choice is explicit, no hidden state. `latexmk -pvc` gives a watch-and-rebuild loop for tight iteration. The `.tex`-as-artifact is the source of truth; the PDF is downstream of it.

## Self-Check

Compile returns rc 0; output file exists; page count > 0 (or, for a cutout, the SVG/PNG is non-empty and has real bounding-box content); no unresolved `??` cross-references in the log; for Piece, fonts are embedded (`pdffonts` shows all `emb=yes`). Any miss sets `status: spec_miss` and lists the cause in `gotchas_hit`.

## Resource Footprint

- CPU: light–moderate, single-threaded per pass; `latexmk` runs several passes
- RAM: modest (tens to low-hundreds of MB)
- GPU: not used
- Disk: trivial output; the TeX Live install itself is large (~6 GB) and the Metafont/`.aux`/`media` caches accumulate
- Network: only for first-time `tlmgr` package fetch; offline thereafter
- API keys: none

## Gotchas

What typesetting has taught, as it stands today. Which probe taught each, and what changed because of it, is in [[LaTeX — tuning]].

**The PDF path**
- **`pdflatex` / `xelatex` / `latexmk` → PDF needs no special environment.** When no SVG is wanted, ignore the bridge below; `dvisvgm` is never invoked.

**The SVG-cutout path, as it works on this Mac (2026-11-15)**
- **`lualatex`, then PyMuPDF.** `lualatex` writes the PDF; `pdf2svg.py` beside the recipe (PyMuPDF's `get_svg_image(text_as_path=True)`) writes a true-vector SVG with the text as paths, so the SVG needs no font where it is shown. `render.sh` refuses an SVG with a raster inside. This is the route [[LaTeX — tuning]] item 2 found; a maker with a better one uses it and leaves the comparison on my scroll.
- **`dvisvgm --pdf` does not run here.** It needs Ghostscript older than 10.01 or `mutool`; this Mac has Ghostscript 10.07.1. The Technical Diagram Standard's `render.sh` (pdflatex, then `dvisvgm --pdf`) fails on both steps for a palace figure, since `pdflatex` cannot load `fontspec` (item 2).
- **The DVI route still needs the bridge.** If you go `latex` → `.dvi` → `dvisvgm`, run it through `Shop/Maker/tex-env.sh`: Homebrew's standalone `dvisvgm` never searches the TeX Live tree, and bare it fails with *"PostScript header file tex.pro not found"* (item 1). [[Shop/Manim CE|Manim CE]] shares the shim and the cause. `xelatex -no-pdf` through it wrote a wrong sliver without failing on 2026-11-14, so check the size of what it writes.
- **The house faces are in `~/Library/Fonts`, and `fontspec` finds them by name** (`\setmainfont{Cormorant Garamond}`); a `Path=/Library/Fonts/` fails. Manrope and Cormorant Garamond are variable fonts, and with no axis set the default instance is what you get (2026-11-15).
- **A PDF comes out the same twice only with a fixed date:** `SOURCE_DATE_EPOCH=0 FORCE_SOURCE_DATE=1 lualatex …`. Without them two compiles differed; with them they matched. The SVG matched every time, since PyMuPDF writes no date (item 3).

**Watch-list** (community wisdom, not yet confirmed on a palace job; when one is, date it into the ledger)
- The "riddle three lines up" rule: the true error usually precedes the line LaTeX flags — read upward from the first `! ` in the log.
- `xelatex`/`lualatex` are required for `fontspec` (the Loudon Live OpenType faces); `pdflatex` cannot load them, and on a palace figure it stopped at once (2026-11-14, item 2).
- Overfull `\hbox` warnings are layout smells, not errors — but for a Piece they get resolved, not ignored.

## Recipes

**2026-11-14 — A technical figure, .tex to true-vector SVG** (the house figure recipe). `Shop/LaTeX/proofs/2026-11-14-card-check/render.sh figure.tex`, run from the folder holding the figure's `.tex` and `.dat` files: `lualatex` writes the PDF, `pdf2svg.py` (PyMuPDF, text as paths) writes the SVG, and the script refuses an SVG with a raster inside. Why not the Standard's `render.sh`, and what failed on the way, is [[LaTeX — tuning]] item 2, owed a review. Tried on `one-loop-harmonic-series`, one of the nine TikZ and pgfplots figures of [[DSP in Looping Dimensions]] (`DSP in Looping Dimensions/figures/`): 1.5 s, and the SVG came out byte-identical to the one committed on 2026-11-09. Those nine were drawn from [[Technical Diagram Standard]] by the deposit that wrote the page, not dispatched to me, and their `.tex` headers already name this route. This was a card check, not a brief; the page was made alive on 2026-11-15 on Loudon's word, with this route as its route.

## Test Suite

Smoke / Capability Probe / Cutout Probe / Edge Probe / Speed Bench / Determinism — in [LaTeX/tests/test-plan.md](LaTeX/tests/test-plan.md), written 2026-11-14.

Test proofs live on my scroll ([[LaTeX — scroll]]), each with the question it asks.

House type, **2026-11-15**: a Kuramoto equation card set in the Loudon Live faces, compiled four times; the PDF matched itself only with a fixed source date, the SVG every time (`Shop/LaTeX/proofs/2026-11-15-house-type/`).

Card check, **2026-11-14**: the figure recipe above, run three times; byte-identical to the committed SVG each time.

Capability probe, **2026-06-09**: (1) **PDF path PASS** — minimal `amsmath` document → 55 KB PDF, first compile, no environment tweaks. (2) **SVG-cutout path CONDITIONAL PASS** — fails bare, succeeds with the `TEXPSHEADERS` bridge (15 KB SVG); the bare-failure root cause is the shared `dvisvgm` gotcha. (3) Determinism: not run that day; settled on 2026-11-15 (Gotchas). This was a capability probe, not a job.

## Open Questions

- A `palace.sty` shared preamble — the Loudon Live type stack (`fontspec` Anton / Cormorant Garamond / Manrope / JetBrains Mono), the six-skin palette as `xcolor` definitions, microtype defaults — so every document inherits the design system the way charts inherit `palaceTokens()`. Defer to first real job.
- Should `Shop/Maker/tex-env.sh`, the shared `TEXPSHEADERS` shim, move to `_ops` if a non-Shop caller ever needs it?
- `beamer` vs. Remotion vs. an HTML deck for Loudon Live slides — when does typeset-static win over web-motion? The boundary is probably "math density and print fidelity."

## Lost Branches

- Typst as the wrapped tool instead of LaTeX — considered, deferred. Typst is faster and its errors are humane, but LaTeX is what Manim and Matplotlib already depend on, so wrapping LaTeX keeps one TeX install serving three Specialists. Revisit if a document brief genuinely chafes against LaTeX's iteration speed.

## Forward Vector

My route works here: lualatex, then PyMuPDF, and the house faces load by name. What I want next is a real brief: a whole document or a beamer slide for Loudon Live, which would tell whether a shared `palace.sty` (the faces, the paper inks, microtype, the fixed date) is worth building before the second one. The variable faces' weights are the first preamble question it would settle.
