---
title: test-plan
born: 2026-11-14
links:
  - { target: "[[LaTeX]]", type: connects-to, label: test-plan-for }
forward_vector: "I am the LaTeX Specialist's test plan, copied from the Maker's template on 2026-11-14 and filled from what has actually run; I want every claim on its page to have a check that runs in one command, and the probes nobody has run named as unrun."
---

# LaTeX — Test Plan

> Copied from the Maker's template (`Shop/Maker/_TEMPLATE/test-plan.md`) on 2026-11-14 and filled from the 2026-06-09 capability probe and the 2026-11-14 card check. The figure probes run against the worked example in `Shop/LaTeX/proofs/2026-11-14-card-check/`, from that folder.

Last run: **2026-11-14** — the figure recipe on `one-loop-harmonic-series`: SVG byte-identical to the 2026-11-09 one, 1.5 s.

## Smoke
One command, from `Shop/LaTeX/proofs/2026-11-14-card-check/`: `bash render.sh one-loop-harmonic-series.tex`. It passes when it prints `wrote … (true vector)` and exits 0.
- **Automated.** Last run 2026-11-14: pass.

## Capability Probe
Each claim on the entry, and the check that holds it:
- PDF documents through `pdflatex`: the 2026-06-09 probe compiled a minimal `amsmath` document to a 55 KB PDF. Not re-run since.
- `fontspec` with an OpenType house face through `lualatex`: the smoke, which sets JetBrains Mono. Pass, 2026-11-14.
- TikZ and pgfplots with a `.dat` table: the smoke. Pass, 2026-11-14.
- SVG through the DVI route (`latex` → `dvisvgm`, through `Shop/Maker/tex-env.sh`): passed 2026-06-09 with the bridge, failed without it. Not re-run.
- Not yet exercised: `xelatex` to PDF, `latexmk`, `beamer`, `biblatex` with `biber`, `microtype`, `circuitikz`.
- **Automated** where a command is named; the rest is unrun.

## Style Probe
A figure wears the [[Drafting Table Design System]]: paper `#F0EEE5`, ink `#1A1916`, JetBrains Mono. `grep -c 'F0EEE5\|1A1916' *.tex` finds the tokens in the source; there is no shared `palace.sty` yet, so each `.tex` carries its own copy.
- **Manual:** Loudon reads the figure and says whether it sits with its siblings. Only his eye answers that.

## Edge Probe
- `fontspec` under `pdflatex`: stops at once with *"fontspec requires either XeTeX or LuaTeX"*. Loud. Seen 2026-11-14.
- `dvisvgm --pdf` on this Mac: refuses with *"either Ghostscript < 10.01.0 or mutool is required"*. Loud. Seen 2026-11-14.
- `xelatex -no-pdf` → `dvisvgm`: **quiet failure** — a warning that 2,380 PDF specials were ignored, then a wrong SVG written as if all went well (exit code not recorded). Seen 2026-11-14. Never use it for TikZ.
- A raster inside the SVG: `render.sh` refuses it. Not yet triggered.

## Speed Bench
- **Reference host:** mac. **Numbers:** one standalone TikZ and pgfplots figure, `.tex` to SVG, 1.5 s (three runs, 2026-11-14, machine under load). A fresh `TEXMFVAR` gave the same time, so the cold font-cache cost the page's Limits quote (60–90 s) is not measured here.

## Determinism
Same `.tex`, `.dat`, TeX Live and PyMuPDF → byte-identical SVG. Proof: on 2026-11-14 the rebuilt `one-loop-harmonic-series.svg` matched the one committed on 2026-11-09 (`d659e922`) byte for byte, three times. The PDF itself was not compared; it carries a creation date unless `SOURCE_DATE_EPOCH` is set, which is still unchecked.
- **Reproducibility artifact:** the `.tex` and its `.dat` files, and `render.sh` with `pdf2svg.py`.
