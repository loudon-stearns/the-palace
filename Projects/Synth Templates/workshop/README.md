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

A template is a card, `cards/<id>.yaml` (schema `synth-template-card/0.1`: identity, graph, essentials pinned with why, taste ranges default first, listening cue and A/B, render spec, mappings). `card-to-tikz.py` draws the card's signal-flow sheet under the [[Technical Diagram Standard]] with one fixed layout: sources stacked left, then mix, filter 1, filter 2, amp, fx, out, each block's output jack at the height of its audio input so the chain is one straight line; the mixer takes one labelled input jack per source with that source's level word and a level bar; modulators beneath, each one column left of its first target so no wire crosses another; every wire orthogonal, horizontal and vertical runs only; performance inputs along the bottom; essentials in ink, taste in amber ([[Drafting Table Design System]] provenance colours). Only the blocks a card uses are drawn; the slot order is fixed, the positions are computed per card (Loudon, 2026-11-01). Schema `synth-template-card/0.2` adds typed fields the glyphs read: an oscillator's `wave`, `pw`, `unison`, `detune`; a filter's `type`, `slope`, `resonance`; an envelope's `shape` (`a`/`d`/`s`/`r` as words) and `category` (from [[Synthesis Notes (Loudon)]]); an LFO's `wave`, `rate`, `sync`; the FX block's `chain`. The generator draws each block's glyph from those fields in its upper right, never by hand (Loudon, 2026-11-01: add the graphics as you make them). Two cards so far: `cards/house-bass.yaml` and `cards/supersaw-pad.yaml`.

Render recipe, from this folder:

```sh
python3 card-to-tikz.py cards/<id>.yaml          # writes cards/<id>.tex
cd cards && pdflatex -interaction=nonstopmode -halt-on-error <id>.tex
python3 -c 'import fitz,sys; open(sys.argv[1][:-4]+".svg","w").write(fitz.open(sys.argv[1])[0].get_svg_image(text_as_path=True))' <id>.pdf
sips -s format png <id>.pdf --out <id>-preview-1.png   # quick look only
```

**Conventions adopted** (2026-11-01, on Loudon's read of the first sheet: "put all inputs on the left side of the blocks, and label all inputs"). Every block carries labelled input jacks on its left edge and its output on the right; flow runs left to right; modulation wires leave on the right, drop to a bus under the audio row, and rise in the gutter left of the target into its jack. Line styles: audio solid, CV dashed, gate dotted. Where these come from, outside the palace: inputs left, outputs right, left-to-right flow is the default IEC 60617-12 reading of a symbol ([IEC graphical symbols database entry](https://library.iec.ch/grasymb/grasymb.nsf/bfd81b91ec98490ec12566af007e4d43/a3c983643675b55ec125718e0047b35b/$FILE/A00269_EN.pdf)); solid audio / dashed CV / dotted gate-and-trigger is the three-line convention of *Electronics & Music Maker*'s "Guide to Electronic Music Techniques" ([muzines, March 1982](https://www.muzines.co.uk/articles/guide-to-electronic-music-techniques/4224)), and the Moog Sub Phatty manual's signal-flow page draws audio solid and control dotted ([manual, p. 12](https://www.manualsdir.com/manuals/279695/moog-music-sub-phatty.html?page=12)). The nearest text notation for a patch is Patchbook ([Spektro Audio, 2017](https://spektroaudio.squarespace.com/blog/2017/8/22/introducing-patchbook-a-markup-language-for-modular-synth-patches)): `->` audio, `p>` pitch, `g>` gate, `t>` trigger, `>>` any connection; the card's `graph.audio` / `graph.modulation` split mirrors that typing. Web sources, not palace canon.

The `.tex` and `.svg` are kept, per the standard's filing protocol; the `-preview-1.png` is kept as the quick look; the `.pdf` is ignored (`.gitignore`). The standard's own `render.sh` (`_ops/Technical Diagram Standard/render.sh`) stops at its dvisvgm step on this Mac — dvisvgm rejects the installed Ghostscript 10.07 — so the SVG comes from PyMuPDF instead (reported by the working session, 2026-11-01).

