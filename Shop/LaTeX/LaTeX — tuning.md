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
