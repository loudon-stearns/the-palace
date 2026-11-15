---
title: "Image-to-3D Smith — tuning"
born: 2026-11-14
links:
  - target: "[[Image-to-3D Smith]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Image-to-3D Smith page's record of what lifting images into 3D has taught it: a line for every job or probe, and a numbered item when one taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from."
ledger: tuning
standards:
  for: "what turning images into meshes and splats taught the Image-to-3D Smith page"
  run: "one job through the Job Contract, or a probe of one or more engines"
  line: "- run · <date> · <image and engine>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change of engine"
  writes: "by hand, in the job's commit"
  merge: union
  kept: git
  trim: never
---

# Image-to-3D Smith — tuning

What each job or probe taught the Image-to-3D Smith page. Opened on 2026-11-14 with the first run recorded here. The Shopkeeper's probes of 2026-06-08 and 2026-06-23 came before this ledger; their logs are in `Shop/Shopkeeper/probes/`, and no run lines are written back for them.

## From the card check — 2026-11-14 — the teapot through Hunyuan3D-2, anonymous

1. **gradio_client 2.7 returned the Space's File output as a dict, not a path.** The first call ran on the Space and produced a mesh, then `shutil.copyfile` failed on the dict; a second call was needed. Changed: `i23d_sketch.py` takes the dict's `value`. Proposed for the page's Gotchas at the review. Two anonymous calls were spent, at no cost. Owed a review: written by the card-check session, outside a ledger review.
2. **gradio_client sends the token cached in `~/.cache/huggingface/` unless told not to,** so a call meant to be anonymous runs on Loudon's account and its ZeroGPU quota. Setting `HF_HUB_DISABLE_IMPLICIT_TOKEN=1` before the import stops it: on 2026-11-14 `build_hf_headers` sent no authorization header with the flag, and did without it. `i23d_sketch.py` sets the flag, so its two calls were anonymous. The shop-fix-sound session found the same on the same day for the AuK Space. Changed: nothing on the page; the page's "Anonymous access works today" gotcha should say how at the review. Owed a review: written by the card-check session, outside a ledger review.
- run · 2026-11-14 · card check: the 2026-06-08 teapot through tencent/Hunyuan3D-2, seed 1234, probe · taught items 1, 2

## From the zoom-out — 2026-11-15 — no run

3. **What is new since the 2026-06-23 pins.** *Owed a review: written by the shop-tests-image session outside a ledger review; found by its research agent, not re-checked, nothing tried.* TRELLIS.2 has no new weights (last commit 2026-06-05) and its Space runs. Hunyuan3D has no new open weights since 2.1; the `tencent/Hunyuan3D-2` and `-2.1` Spaces run. Meta's `facebook/sam-3d-objects` is gated by manual approval. New: **Idol** (`speridlabs/idol`, Apache-2.0, 2026-10-28), one image to a 3DGS `.ply` of up to about a million Gaussians, CUDA-only, with a free ZeroGPU Space and a five-step turbo (2026-11-03): a rival for the splat lane (https://huggingface.co/speridlabs/idol). **Pixal3D** (`TencentARC/Pixal3D`, MIT, 2026-05) on a TRELLIS.2 backbone with PBR textures, a free Space, and native ComfyUI nodes since 2026-08-22: the textured mesh this page has never run (https://huggingface.co/TencentARC/Pixal3D). **Hi3D v1.0** (2026-10-23, its own licence) refines a coarse mesh from a reference image; a refiner, not image-to-3D. None runs on the Mac. Changed: nothing on the page; the test list on the scroll proposes the teapot through Pixal3D and Idol, anonymously.
