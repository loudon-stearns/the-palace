#!/usr/bin/env bash
# LaTeX test 2026-11-15: compile the card twice with SOURCE_DATE_EPOCH and twice without; PDF and SVG bytes compared.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
b=kuramoto-card; out=()
for mode in plain plain epoch epoch; do
  t0=$(python3 -c 'import time;print(time.time())')
  if [ "$mode" = epoch ]; then SOURCE_DATE_EPOCH=0 FORCE_SOURCE_DATE=1 lualatex -interaction=nonstopmode -halt-on-error $b.tex >/dev/null
  else lualatex -interaction=nonstopmode -halt-on-error $b.tex >/dev/null; fi
  python3 pdf2svg.py $b.pdf $b.svg
  t1=$(python3 -c 'import time;print(time.time())')
  out+=("$mode $(shasum -a 256 $b.pdf | cut -c1-16) $(shasum -a 256 $b.svg | cut -c1-16) $(python3 -c "print(round($t1-$t0,2))")")
  sleep 1
done
grep -q '<image\|data:image' $b.svg && { echo "raster inside"; exit 1; } || true
grep -E "Overfull|Underfull|Missing character" $b.log || echo "no overfull boxes or missing glyphs"

printf '%s\n' "${out[@]}"
rm -f $b.aux $b.log
