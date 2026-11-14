# PDF -> SVG with PyMuPDF, text as paths. Used because dvisvgm --pdf needs Ghostscript < 10.01
# or mutool, and this Mac has Ghostscript 10.07 (2026-11-14).
# Usage: python3 pdf2svg.py in.pdf out.svg
import sys, fitz
src, dst = sys.argv[1], sys.argv[2]
open(dst, "w").write(fitz.open(src)[0].get_svg_image(text_as_path=True))
