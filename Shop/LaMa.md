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

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Tried 2026-11-14: Run, Speed, Checked by and Hands on, by filling a SAM-cut figure out of one of Blender's 2026-06-13 renders with a script written that day; Best used for, Not yet shown and Not my purpose are read from the page and the ledger.*

**Best used for, so far:** A clean background plate once a foreground is cut away. Evidence: on BLUELINE shot 02 (2026-06-25) I rebuilt the car, fire and street behind the figure well enough that the eye accepted the plate, where Loudon called the classical `cv2.inpaint` fill "horrible"; on 2026-11-14 I filled a figure out of a fog scene.
**Not yet shown to hold:** I paint plausible texture, not the true hidden shape; a leaky or tight mask ruins the plate; very large holes drift (ledger items 1–3). On 2026-11-14 the soft, fog-faded edge of a figure outside SAM's mask stayed as a faint ghost. Only two jobs so far.
**Not my purpose:** Recovering the actual hidden geometry, which stays an open problem, and making the mask: SAM, keypoints or Depth Anything's silhouette hand it to me.
**Run:** From the palace root: `_tools/ComfyUI/venv/bin/python "Shop/LaMa/proofs/2026-11-14-card-check/lama_fill.py" IMAGE MASK OUT.png --dilate 9`.
**Speed:** 768×1024 with a hole of 19% of the frame: 9.2 s to fill, on the CPU; 11 s for the whole command (2026-11-14).
**Checked by:** `lama_fill.py` checks the output matches the input size and that every pixel outside the dilated mask is unchanged. Only an eye judges whether the fill is plausible, with no halo, fringe or ghost.
**Wears:** No design system is wired in.
**Hands on:** I hand on a clean plate that Animate the Background animates under the foreground, and that ComfyUI or Frame Designer can draw over. I take an RGB image and a mask, white means fill, from SAM, keypoints or Depth Anything.

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

`from simple_lama_inpainting import SimpleLama`; `SimpleLama()(image, mask)`. Mask = the foreground silhouette, dilated ~5–10px. As a command, from the palace root: `_tools/ComfyUI/venv/bin/python "Shop/LaMa/proofs/2026-11-14-card-check/lama_fill.py" IMAGE MASK OUT.png --dilate 9`; it pastes the unmasked pixels back so they are unchanged. The shot-02 original is `Projects/BLUELINE/proofs/blender-fire/lama_infill.py`. `simple-lama-inpainting` is in the ComfyUI venv; its `big-lama.pt` is cached in `~/.cache/torch/hub/checkpoints/`. It runs on the CPU here (the package picks CUDA or CPU, never MPS). For [[Animate the Background]]: infill *first*, then animate the clean plate, then composite the crisp foreground back on top.
