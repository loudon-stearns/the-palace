---
title: "PROVENANCE"
born: 2026-10-25
links:
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: provenance-of
forward_vector: "I say exactly how every paper plate in the workshop was made, so anyone who meets the Cyanotype look can trace its ground to a model, a seed, a reference and a checksum."
---

# How the plates were made

Every plate in this folder was generated with GenAI. None is a photograph or a scan. They were all made on 2026-10-25, in the Loud'n Live design session, on Loudon's request: *"Generate 8 blank blueprint paper plates on the local SDXL first, then we'll see if RunPod FLUX is needed."* He also asked that this be written down plainly and kept in the history: *"Just be clear about how the plate was made and keep it all in the history."*

## The machine and the model

- **Model:** Stable Diffusion XL base 1.0, checkpoint `sd_xl_base_1.0.safetensors`. No LoRA, no ControlNet, no IP-Adapter.
- **Where:** ComfyUI 0.22.0 running locally on Loudon's Mac (`_tools/ComfyUI`). No cloud service; nothing was paid for.
- **Sampler:** `dpmpp_2m`, `karras` scheduler, 30 steps, CFG 6.0, 1344 × 768.
- **Recipe files:**
  - `make_plates.py` makes the paper plates.
  - `make_night_plates.py` makes the night plates.
  - `tint_plates.py` turns a plate into a coloured ground.
  - `build_rough6.py` and `build_look_cyanotype.py` put a ground into a page.
- **Seeds:** paper plate *N* is seed 20261025*0N*. Night plate n*0N* is seed 20261025*9N*.

## The reference

> Jean-Charles Moreux (1889–1956), *Front Elevation, Design for a block of flats, Rue Gazan, Paris*, c.1927. Cyanotype on paper. Drawing Matter Collection, DMC 2272.2. Photograph: Drawing Matter, from https://drawingmatter.org/a-blueprint-is-blue/

Loudon shared this photograph in the session as *"close to the feel"*, and said *"if you want to use this as a style reference that is great in the generation."* It was used in two ways, and the difference matters:

1. **As a look to aim for.** It moved the colour of every cyanotype ground: cream ink, no grid, a centre fold, darker than the print itself.
2. **As pixels, for the `r` plates only.** Those plates were grown from the photograph's own paper (details below). That goes beyond a style reference.

## The plates, one family at a time

**`plate-01` … `plate-08`: text to image, no reference.** Generated from a prompt alone, starting from noise. No pixel of the photograph is in them.
- Prompt: `flat scan of a blank sheet of old drafting paper, ` + one wear phrase from `WEAR` in `make_plates.py` + `, top-down, filling the whole frame, even light, fine visible paper fibre, matte, nothing printed on it`
- Negative: the `NEG` string in `make_plates.py` (text, letters, drawing, grid and the like).
- Plate 06 was test-rendered four times while the prompt was tuned. One test said "blueprint" and drew an architectural plan, which is why the prompt avoids that word. Only the batch render is kept.

**`plate-r01` … `plate-r08`: image to image, grown from the photograph's paper.** Each started from an init image made from the reference photograph's pixels, then was redrawn by SDXL at **denoise 0.55**. So about 45% of the start image's structure survives the redraw.

How the init image `reference/cyanotype-paper-init.png` was made:
- Two blank-paper bands were cropped from the 1744 × 1382 photograph: x 70–1670, y 100–262 (above the building) and x 70–1670, y 1172–1330 (below it, with the corner crack). No part of the drawing was used.
- The bands were tiled eight high, some flipped or mirrored.
- Each band's average colour was evened out, and the joins were feathered over 48 px.
- The result was cropped to 1600 × 900 and resized to 1344 × 768.

The prompt and negative for the `r` plates:
- Prompt: `flat scan of a blank sheet of old cyanotype blueprint paper, deep prussian blue, ` + one wear phrase + the same tail as above.
- Negative: `NEG` plus `, building, architecture, windows, facade`.

One more render: a first test of `plate-r06` at denoise 0.6 was overwritten by the batch at 0.55. Only the 0.55 render exists.

**`night-n01` … `night-n04`: text to image, no reference.** Rain on dark glass with neon city bokeh, for rough 8. The prompts are in `make_night_plates.py`, with a negative against text, signs, people and buildings.

## From plate to ground

`tint_plates.py` turns each plate into a `cyan-*.jpg` ground. Only the plate's tone is used:
- The luminance is high-passed. A Gaussian blur of 70 px is taken off, and 30% of it is put back.
- It is then normalised and mapped onto the cyanotype blue `(30, 92, 136)`, with a spread of `(14, 18, 18)` per standard deviation.
- 35% of the plate's own warmth is kept, so a stain reads slightly brown.
- It is saved as JPEG at quality 86.

## What is in canon

**The Cyanotype look** (`_ops/loudon-live/design-system/looks/cyanotype.html`, landed in `9a7f3d18`) embeds **`cyan-r06.jpg`** as its paper. That ground comes from `plate-r06`:
- seed 2026102506
- denoise 0.55
- wear phrase `(folded in quarters with sharp crease lines:1.15), (a small faint coffee cup ring stain:1.15)`

So the canon look's paper was **generated by SDXL image to image, starting from the blank paper of Drawing Matter's photograph of the Moreux cyanotype, at denoise 0.55, then tinted**. Checksums (SHA-256, first 16 hex characters): `cyan-r06.jpg` 1dfcb2dad805dbc0 (the same bytes as the data URI in the look), `plate-r06.png` e5ff1f125f8b2954, `reference/cyanotype-paper-init.png` 6e23152a8d2e9ec4.

## What is kept out of git, for now

The photograph itself, and `reference/cyanotype-paper-init.png`, which is cut from its pixels. Whether they join the record is Loudon's call. Moreux died in 1956, so in France his drawings enter the public domain on 1 January 2027. The photograph of the drawing is Drawing Matter's.
