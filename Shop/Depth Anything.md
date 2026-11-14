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

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Drafted 2026-11-14 from this page and my ledger by a reader, not yet tried line by line; a line that proves wrong is fixed here.*

**Best used for, so far:** So far one job: BLUELINE shot 02, 2026-06-25. I ordered a pen drawing front to back, gave a clean figure silhouette, and split it into three usable depth bands (person+street, cars+buildings, fire+sky) with no segmentation.
**Not yet shown to hold:** Nothing recorded as failed beyond the three founding gotchas: same-depth objects share a band, no hidden geometry, soft band edges (ledger items 1-3). Only one job so far; photos and renders are claimed, not run.
**Not my purpose:** I don't isolate individual objects at the same depth (send to SAM or keypoints), and I don't rebuild what is hidden behind a foreground (send to LaMa).
**Run:** No command on the page yet. The Recipe names the pipeline only: transformers, depth-anything/Depth-Anything-V2-Small-hf, on MPS. Resize long edge to ~1024, normalize to 0-255, save PNG. No proof script path is given.
**Speed:** Page says 'a few seconds' on MPS; no figure or date is recorded.
**Checked by:** A script can check the output is single-channel, matches input size, and spans 0-255. Only an eye can judge whether the front-to-back order is right and whether band edges shimmer.
**Wears:** Not yet wired to a design system
**Hands on:** I hand on a depth map and optional FRONT/MID/BACK band masks, which need a small dilate or feather; I need one RGB image, and I leave object separation to SAM and hidden texture to LaMa.

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
