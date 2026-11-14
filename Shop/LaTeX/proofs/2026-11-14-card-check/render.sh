#!/usr/bin/env bash
# The LaTeX Specialist's figure recipe, 2026-11-14: .tex -> lualatex -> .pdf -> PyMuPDF -> .svg
# Why not the Technical Diagram Standard's render.sh (pdflatex + dvisvgm --pdf): palace figures load
# fontspec (JetBrains Mono, the Drafting Table type), which pdflatex cannot run; and dvisvgm --pdf
# needs Ghostscript < 10.01 or mutool, and this Mac has Ghostscript 10.07.1.
# Usage, from the folder holding the .tex and its .dat files:  bash render.sh figure.tex
set -euo pipefail
src="${1:?usage: render.sh figure.tex}"; base="${src%.tex}"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
lualatex -interaction=nonstopmode -halt-on-error "$src" >/dev/null
python3 "$here/pdf2svg.py" "$base.pdf" "$base.svg"
if grep -q '<image\|data:image' "$base.svg"; then echo "raster inside $base.svg: not a true vector" >&2; exit 1; fi
rm -f "$base.aux" "$base.log"
echo "wrote $base.pdf and $base.svg (true vector)"
