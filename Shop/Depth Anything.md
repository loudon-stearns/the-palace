---
title: Depth Anything
type: specialist
status: alive
medium: other
tool: Depth Anything V2
tool_version: V2-Small (transformers / hf)
born: 2026-06
license: Apache-2.0 (Small/Base); model card per checkpoint
forward_vector: "I read depth out of a flat image — even a pen drawing — and hand back front-to-back order plus a clean figure silhouette, free. I want to be the Shop's first move on any decomposition: order the scene, split it into coarse depth bands, and let the heavier tools refine only what I leave ambiguous."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[Animate the Background]]", type: connects-to, label: the-surprise-win }
  - target: "[[LaMa]]"
    type: connects-to
    label: fills-what-i-cannot-see
tags: [specialist, shop, perception, depth, decomposition, local]
---

# Depth Anything

![[Depth Anything — hero.png]]

## Charter

I turn one image into a depth map — a grayscale field where `0 = far` and `255 = near`. Hand me a photo, a render, or even a flat ink drawing, and I tell you what's in front of what. I run locally on this Mac (MPS), via `transformers`, in a few seconds. The Maker sends me an image and a tier; I deliver a depth PNG and, if asked, a coarse depth-banded split.

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Tried 2026-11-14: Run, Speed and Checked by, on two of Blender's 2026-06-13 renders with a script written that day; Best used for, Not yet shown, Not my purpose and Hands on are read from the page and the ledger, not tried.*

**Best used for, so far:** Knowing what is in front of what, in one image of any kind. Evidence: on BLUELINE shot 02 (2026-06-25) I ordered a pen drawing front to back, gave a clean figure silhouette, and split it into three usable bands with no segmentation; on 2026-11-14 I read a blocked SDXL fill and a figure in fog.
**Not yet shown to hold:** Same-depth objects share a band, I give no hidden geometry, and band edges are soft (ledger items 1–3). Percentile bands collapse on a flat backdrop (item 4). Photos and long animated sequences are claimed, not run.
**Not my purpose:** Isolating objects at one depth (SAM or keypoints do) and rebuilding what is hidden behind a foreground (LaMa does).
**Run:** From the palace root: `_tools/ComfyUI/venv/bin/python "Shop/Depth Anything/proofs/2026-11-14-card-check/depth_map.py" IMAGE OUT_DIR --bands`.
**Speed:** On this Mac's MPS at 768×1024: model load about 1 s; inference 3.1 s for the first image of a process and 0.25 s for the next; 6.5–11 s for the whole command with Python's start (2026-11-14).
**Checked by:** A script checks the depth PNG is single-channel, matches the input size, spans 0–255, and that each band mask is non-empty. Only an eye judges whether the front-to-back order is right and whether band edges shimmer.
**Wears:** No design system is wired in.
**Hands on:** I hand on a depth map, 0 far and 255 near, and optional FRONT / MID / BACK band masks: ComfyUI takes the depth as a ControlNet channel, LaMa and SAM take the bands and the silhouette as masks, and Animate the Background stacks the cels. I take one RGB image.

## Job Contract

- **In:** one RGB image (any domain — I generalize past photos).
- **Out:** a single-channel depth map at the input resolution, plus optional `FRONT / MID / BACK` band masks from depth thresholds.
- **Cost:** local, ~seconds on MPS. No GPU rental, no network call after the one-time model pull.

## What I'm good for (proven 2026-06-25, BLUELINE shot 02)

- **Ordering, on the drawing itself.** I run on the *line art* and still recover a correct front-to-back order (street/figure closest → cars/buildings → smoke/sky farthest). This retired the whole "Order" skill in [[Animate the Background#The N-Layer Case (Line-Art Decomposition)|the N-layer case]] — no segmentation needed to know the stack.
- **A free figure silhouette.** A clean person-shaped mask falls out of the near band — a second, independent route to the figure when keypoints or [[SAM]] are unreliable.
- **A free coarse decomposition.** Threshold the depth into three bands and each is a usable, correctly-ordered cel (person+street / cars+buildings / fire+sky) with *zero* segmentation. This is how far "free" auto-decomposition reaches before per-element refinement is needed.

## Gotchas / where I fail

What reading depth has taught, as it stands today. Which job taught each, and what changed because of it, is in [[Depth Anything — tuning]].

- **No same-depth separation.** Two objects at the same distance (the car *at* building depth) share a band — I order the scene, I don't isolate every object. Hand that to [[SAM]] (in a converted domain) or keypoints.
- **No occluded shape.** I give a depth surface, not the hidden geometry behind a foreground element — that's [[LaMa]]'s job (texture) and the still-open amodal-shape problem.
- **Soft band edges.** Depth is smooth; band boundaries need a small dilate/feather or they shimmer when animated.

## Recipe

`transformers` pipeline, `depth-anything/Depth-Anything-V2-Small-hf`, MPS. Resize the long edge to ~1024, run, normalize to 0–255, save PNG. Band split = two thresholds on the histogram (e.g. 33rd / 66th percentile), each band dilated a few px before use as a cel mask.

As a command, from the palace root: `_tools/ComfyUI/venv/bin/python "Shop/Depth Anything/proofs/2026-11-14-card-check/depth_map.py" IMAGE OUT_DIR --bands`. Its shot-specific ancestor, which also measures each region's mean depth, is `Projects/BLUELINE/proofs/blender-fire/depth_test.py`; the band split there is `depth_bands.py`.
