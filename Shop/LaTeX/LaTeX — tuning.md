---
title: "LaTeX — tuning"
born: 2026-11-08
links:
  - target: "[[LaTeX]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the LaTeX page's record of what typesetting has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real compile taught."
ledger: tuning
standards:
  for: "what typesetting with LaTeX taught the LaTeX page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the TeX install itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the TeX install"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# LaTeX — tuning

What each job taught the LaTeX page. Each item names what the job showed and what changed because of it, if anything did. Newest last. No palace brief has run through LaTeX yet; its one dated gotcha came from the capability probe, moved here on 2026-11-08 when the page's Gotchas became present-tense rules. The run line is that probe, the date the page's `last_tested` kept. The undated community watch-list stays on the page until a job hits one.

## From the capability probe — 2026-06-09 — full Homebrew TeX Live 2026 on this Mac

1. **The document path was clean and the SVG-cutout path was not.** On `/opt/homebrew/Cellar/texlive/20260301`, `pdflatex` / `xelatex` / `latexmk` → PDF ran with no special environment (a minimal `amsmath` document compiled to a 55 KB PDF first try). The cutout path (`standalone` → `latex` → `.dvi` → `dvisvgm` → `.svg`) failed out of the box with *"PostScript header file tex.pro not found … undefined in TeXDict"*: the Homebrew standalone `dvisvgm` formula owns `/opt/homebrew/bin/dvisvgm`, and its kpathsea is rooted under its own Cellar, never the TeX Live tree. Same root cause as [[Manim CE — tuning]] item 11; the two Specialists share the TeX pipeline. Exporting `TEXPSHEADERS` from `kpsewhich -var-value=TEXMFDIST` (`dvips/base` and `dvips/config`) fixed it, version-agnostic, with a 15 KB SVG; `TEXMFCNF` alone did not. Changed: the export was centralized in the shared shim `Shop/Maker/tex-env.sh`, which [[Manim CE]] sources too. `pdf2svg` as an alternative cutout route (PDF → SVG, no `.dvi`, no `dvisvgm`) was not probed.
- run · 2026-06-09 · capability probe (PDF path, SVG-cutout path), probe · taught item 1

## From the card check — 2026-11-14 — one DSP in Looping Dimensions figure, rebuilt

2. **The Technical Diagram Standard's route fails on the palace's own figures; `lualatex` and PyMuPDF hold.** *Owed a review: written by the shop-fix session outside a ledger review.* Rebuilding `one-loop-harmonic-series` from `DSP in Looping Dimensions/figures/`: the Standard's `render.sh` (`pdflatex`, then `dvisvgm --pdf`) stopped in 0.2 s, because the figure loads `fontspec` for JetBrains Mono and `pdflatex` cannot; `dvisvgm --pdf` on the `lualatex` PDF refused, needing Ghostscript older than 10.01 or `mutool` (installed: Ghostscript 10.07.1); `xelatex -no-pdf` to `.xdv` and `dvisvgm` through the bridge ignored 2,380 PDF specials and wrote a wrong 48-point sliver without failing. `lualatex` to PDF, then PyMuPDF's `get_svg_image(text_as_path=True)`, gave an SVG byte-identical to the one committed on 2026-11-09, in 1.5 s; the figure's own header had already named that route. Changed: the page's first recipe is that route (`Shop/LaTeX/proofs/2026-11-14-card-check/render.sh`), and the card's Run line uses it. The three failures stay here, off the page's Gotchas, until this item is reviewed. The Standard and its `render.sh` are not mine to change; the words proposed for them go to Loudon with the session's report.
- run · 2026-11-14 · one-loop-harmonic-series figure rebuild, probe · taught item 2
