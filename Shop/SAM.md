---
title: SAM
type: specialist
status: alive
medium: other
tool: Segment Anything (ultralytics)
tool_version: MobileSAM + ViT-B
born: 2026-06
license: Apache-2.0 (code); weights per checkpoint (SAM ViT-B; MobileSAM)
forward_vector: "I cut a picture into its objects — but only where the picture looks like the photos I learned on. On line art I flail; on photoreal or flat-cel I'm sharp. I want to be the reason we convert first: send me a domain I know, and I hand back clean cels."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[Animate the Background]]", type: connects-to, label: the-Segment-skill-and-its-wall }
  - { target: "[[Depth Anything]]", type: connects-to, label: orders-what-I-isolate }
tags: [specialist, shop, perception, segmentation, decomposition, local]
---

# SAM

![[SAM — hero.png]]

## Charter

I cut an image into its constituent objects — a mask per thing. Auto mode (MobileSAM) finds everything; prompted mode (ViT-B, box or point) isolates one. I'm the **Segment** skill of layer decomposition. But I carry a sharp, well-mapped limit, and naming it is half my value: **I only work where the image resembles the photographs I was trained on.**

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Tried 2026-11-14: Run, Speed, Checked by and Hands on, by cutting a figure out of one of Blender's 2026-06-13 renders, prompted and auto, with a script written that day and handing the mask to LaMa; Best used for, Not yet shown and Not my purpose are read from the page and the ledger.*

**Best used for, so far:** Cutting one object, or every object, out of an image as masks, once the image looks like a photo or flat cel. Evidence: on photoreal and flat-cel versions of three scenes I cut 30/26/22 and 44/47/25 regions (2026-06-25); on 2026-11-14 one point prompt cut a figure in fog cleanly, minus its sword.
**Not yet shown to hold:** Line art: on BLUELINE shot 02 I never isolated the car and broke it into fragments (ledger item 1). Thin or glassy objects and busy auto-mode scenes are said to fail, with no run recorded; a point prompt on a figure left its thin sword out (2026-11-14).
**Not my purpose:** Line art or anything unlike my training photos: convert it to photoreal or flat cel first. Ordering layers front to back: Depth Anything does that.
**Run:** From the palace root: `_tools/ComfyUI/venv/bin/python "Shop/SAM/proofs/2026-11-14-card-check/sam_cut.py" IMAGE OUT_DIR --point 0.5,0.45` (or `--box x0,y0,x1,y1`, or `--auto`).
**Speed:** At 768×1024 on the CPU (2026-11-14): prompted ViT-B, 3.8 s, 7 s for the whole command; auto MobileSAM, 28.5 s, 31.5 s for the whole command (ledger item 3).
**Checked by:** `sam_cut.py` counts the masks and their coverage of the frame, and writes binary masks at the image's size with an overlay. Only an eye judges whether the cuts follow real objects or fragments.
**Wears:** No design system is wired in.
**Hands on:** I hand on one binary mask per object: LaMa fills behind it, and with Depth Anything's order the masks stack into cels. I take an image already in a photographic or flat-cel domain, often ComfyUI's canny conversion, with a point or box prompt or none.

## Job Contract

- **In:** an RGB image; optionally box/point prompts for a specific object.
- **Out:** binary masks (one per object in auto mode; one in prompted mode).
- **Cost:** local, ~seconds (MobileSAM) to tens of seconds (ViT-B auto).

## The wall — and what it taught us (proven 2026-06-25)

- **I fail on line art.** A pen drawing of a car is sparse outline strokes on the same paper as everything else — there's no solid textured region for me to grab, so I snap to the nearest tonal block and over-segment into fragments. On BLUELINE shot 02 I never once isolated the car; the figure came out *better from a keypoint mask* than from me.
- **I work cleanly once the image is converted.** Run me on the *same composition* re-rendered to photoreal or flat-cel (SDXL/FLUX + canny ControlNet) and I segment sharply — 30/26/22 distinct object regions on photoreal, **44/47/25 on flat-cel** across three test scenes. I am the tool that *motivates* the convert-first reframe in [[Animate the Background#The N-Layer Case (Line-Art Decomposition)|the N-layer case]]: my training domain *is* the intermediate domain we should convert to. **Flat cel-shaded is my best input** — solid flat regions, crisp edges, separable even before I run.
- The reframe in one line: don't fix the segmenter, **move the image into the segmenter's world, then stylize back.**

## Gotchas / where I fail

What segmenting has taught, as it stands today, beside § The wall. Which job taught what, and what changed because of it, is in [[SAM — tuning]].

- **Thin, see-through objects** defeat me even in photoreal if they're glassy/wireframe — no solid region to bound.
- **Auto-mode over-segments** busy scenes into fragments; prompted mode (box around the object) is steadier when you know what you want.
- **Pair me with [[Depth Anything]]:** I isolate, depth orders. Neither alone gives a stacked, ordered cel set; together they do.

## Recipe

`ultralytics` SAM (`mobile_sam.pt` for auto, `sam_b.pt` for prompted; both sit in `Projects/BLUELINE/proofs/blender-fire/` in the main checkout, gitignored). As a command, from the palace root: `_tools/ComfyUI/venv/bin/python "Shop/SAM/proofs/2026-11-14-card-check/sam_cut.py" IMAGE OUT_DIR --point 0.5,0.45` (or `--box x0,y0,x1,y1`, or `--auto`), fractions of the frame. The 2026-06-25 scripts it grew from are `photoreal_segment.py` and `photoreal_multi_segment.py` in that folder. The convert step is ComfyUI with canny, as in [[Animate the Background]]'s N-layer case; it is not one command yet. Best results: convert the drawing to **flat cel-shaded** first (canny ControlNet, low strength / posterized), then auto-segment, then [[LaMa]]-infill behind each cel and [[Depth Anything]] to stack them.
