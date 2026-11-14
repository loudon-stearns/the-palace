---
title: LaMa
type: specialist
status: alive
medium: other
tool: LaMa (simple-lama-inpainting)
tool_version: big-lama
born: 2026-06
license: Apache-2.0 (code); big-lama weights per model card
forward_vector: "I paint back what was hidden. Pull a figure out of a scene and I rebuild the wall, the car, the fire behind it — plausible texture, not a blur. I want to get past texture into true occluded shape, so the thing I reconstruct is the thing that was actually there."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[Animate the Background]]", type: connects-to, label: fills-the-extracted-hole }
  - { target: "[[SAM]]", type: connects-to, label: consumes-its-mask }
  - { target: "[[Pauline Oliveros]]", type: contradicts, label: fill-the-silence-vs-listen-to-it }
tags: [specialist, shop, perception, inpainting, decomposition, local]
---

# LaMa

![[LaMa — hero.png]]

## Charter

I fill holes. Give me an image and a binary mask of what to remove, and I reconstruct what should be behind it — large-mask inpainting that resolves into plausible structure, not the smeared average that classical inpainters produce. I run locally (`simple-lama-inpainting`, the `big-lama` weights). I'm the **Complete** skill of layer decomposition: extract the foreground, hand me the hole, get a clean plate back.

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Drafted 2026-11-14 from this page and my ledger by a reader, not yet tried line by line; a line that proves wrong is fixed here.*

**Best used for, so far:** So far one job: BLUELINE shot 02, 2026-06-25. I removed the figure and rebuilt the car, fire and street behind him well enough that the eye accepted the clean plate. Loudon rejected the classical cv2.inpaint fill as 'horrible'.
**Not yet shown to hold:** Nothing recorded as failed beyond the founding gotchas: I paint plausible texture, not the true occluded shape; a leaky or tight mask ruins the plate; very large holes drift (ledger items 1-3). Only one job so far.
**Not my purpose:** I don't recover the actual hidden geometry; exact occluded-shape completion is called an open problem. I need a mask handed to me and don't make one.
**Run:** From the page's Recipe, in Python: from simple_lama_inpainting import SimpleLama; SimpleLama()(image, mask). Mask is the foreground silhouette dilated ~5-10px. No script path or install command is given.
**Speed:** Page says 'seconds', CPU-fine and faster on MPS/GPU; no figure or date is recorded.
**Checked by:** A script can check the output size matches the input and that pixels outside the mask are unchanged. Only an eye can judge whether the fill is plausible, with no halo or fringe.
**Wears:** Not yet wired to a design system
**Hands on:** I hand on a clean background plate; I need an RGB image plus a white-means-fill mask, dilated past the silhouette, from SAM, keypoints or the Depth Anything silhouette.

## Job Contract

- **In:** an RGB image + a single-channel mask (white = remove/fill).
- **Out:** the image with the masked region reconstructed — a clean background plate.
- **Cost:** local, ~seconds. CPU-fine; faster on MPS/GPU.

## What I'm good for (proven 2026-06-25)

- **Reconstructing what a figure hid.** Remove the man from BLUELINE shot 02 and I rebuild the car, fire, and street behind him plausibly — good enough that the eye accepts the clean plate. This is the infill step [[Animate the Background]] depends on, in the two-layer case and in [[Animate the Background#The N-Layer Case (Line-Art Decomposition)|the N-layer case]] alike: you can't animate or restack a background layer until the foreground's hole is filled.
- **The reason we stopped using `cv2.inpaint`.** Loudon's verdict on the classical fill was blunt — *"that infill looks horrible."* It blurs; the eye rejects it. I synthesize texture and structure instead, so the plate survives a second look.

## Gotchas / where I fail

What filling holes has taught, as it stands today. Which job taught each, and what changed because of it, is in [[LaMa — tuning]].

- **Texture, not exact shape.** I invent *plausible* content for the hole, not the *actual* occluded geometry. If the real car door was behind the figure, I'll paint a believable surface — not necessarily that door. Exact occluded-shape completion is the deeper, still-open problem.
- **Mask quality is everything.** A mask that leaks past the object's edge leaves a halo of the original foreground; a mask that's too tight leaves a fringe to fill. Dilate the mask a few px past the silhouette ([[SAM]] or keypoint or depth-silhouette sourced) before handing it to me.
- **Very large holes drift.** The bigger the missing region relative to the image, the more I'm guessing — best on holes that are a minority of the frame with context on most sides.

## Recipe

`from simple_lama_inpainting import SimpleLama`; `SimpleLama()(image, mask)`. Mask = the foreground silhouette, dilated ~5–10px. For [[Animate the Background]]: infill *first*, then animate the clean plate, then composite the crisp foreground back on top.
