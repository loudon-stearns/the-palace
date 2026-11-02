---
title: "Synth Templates — workshop README"
born: 2026-11-01
links:
  - target: "[[Synth Templates]]"
    type: connects-to
    label: workshop-front-door
forward_vector: "I say what in this folder is written by hand and what is generated, so no one edits a generated file and loses the change."
---

`build-catalog.py` is the source of truth; `catalog.json` and `picker.html` (via `build-picker.py`) are generated from it and are overwritten on every build. Loudon's synthesis notes, which seed the concept map, live in the bundle of [[Synthesis Notes (Loudon)]]: `Synthesis Notes (Loudon)/Synthesis Notes (Loudon) — source — notes.pdf` and `— notes-text.txt`.

## Cards and their sheets

A template is a card, `cards/<id>.yaml` (schema `synth-template-card/0.1`: identity, graph, essentials pinned with why, taste ranges default first, listening cue and A/B, render spec, mappings). `card-to-tikz.py` draws the card's signal-flow sheet under the [[Technical Diagram Standard]] with one fixed layout: sources stacked left, then mix, filter 1, filter 2, amp, fx, out; modulators beneath; performance inputs along the bottom; unused slots ghosted; essentials in ink, taste in amber ([[Drafting Table Design System]] provenance colours).

Render recipe, from this folder:

```sh
python3 card-to-tikz.py cards/<id>.yaml          # writes cards/<id>.tex
cd cards && pdflatex -interaction=nonstopmode -halt-on-error <id>.tex
python3 -c 'import fitz,sys; open(sys.argv[1][:-4]+".svg","w").write(fitz.open(sys.argv[1])[0].get_svg_image(text_as_path=True))' <id>.pdf
sips -s format png <id>.pdf --out <id>-preview-1.png   # quick look only
```

The `.tex` and `.svg` are kept, per the standard's filing protocol; the `-preview-1.png` is kept as the quick look; the `.pdf` is ignored (`.gitignore`). The standard's own `render.sh` (`_ops/Technical Diagram Standard/render.sh`) stops at its dvisvgm step on this Mac — dvisvgm rejects the installed Ghostscript 10.07 — so the SVG comes from PyMuPDF instead (reported by the working session, 2026-11-01).

