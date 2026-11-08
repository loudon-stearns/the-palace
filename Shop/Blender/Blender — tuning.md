---
title: "Blender — tuning"
born: 2026-11-08
links:
  - target: "[[Blender]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Blender page's record of what blocking scenes has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real scene taught."
ledger: tuning
standards:
  for: "what blocking scenes and emitting conditioning passes taught the Blender page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the tool itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pinned version"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Blender — tuning

What each job taught the Blender page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The page never had a Gotchas section of its own: its first job's findings sat in that recipe's "Key findings" line and in the job's full report, [gotchas-2026-06-13.md](tests/gotchas-2026-06-13.md). They were moved here on 2026-11-08, when the page's Gotchas were written as present-tense rules. The 2026-06-13 run line is the date the page's `last_tested` kept.

## From the conditioning keystone — 2026-06-13 — BLUELINE Session 1, Study tier

1. **DWPose on the clay greybox render returned a fully black image** (max luminance 0, zero keypoints). The geometric skeleton, the armature's COCO-18 joints projected with `bpy_extras.world_to_camera_view` and drawn as the canonical skeleton, drove the pose channel correctly, exactly and deterministically, with no model download. Changed: emit OpenPose geometrically; DWPose stays the tool for photoreal renders and real footage. The toyxyz Gumroad rig was not acquired (it needs Loudon's checkout); the bespoke script stands in for it.
2. **Depth and normal emitted from the scene were cleaner than estimation**, because they are true geometry: depth from a material-swap emission shader (`CameraData → MapRange → Emission`, near and far auto-ranged from joint distances), normal from `Geometry.Normal → VectorTransform(world→camera) → Emission`. Changed: depth and normal come from Blender, not an estimator. Normal is emitted as an artifact only; the downloaded set had no SDXL normal ControlNet.
3. **Every pass came from one camera, one script run, one resolution, and they registered with no alignment step.** Changed: nothing; this is the property the pipeline rests on.
4. **xinsir's strong per-channel SDXL ControlNets are pose, depth and canny; there is no strong standalone SDXL lineart ControlNet** (lineart lives in ControlNet-Union, SD1.5 or FLUX). Changed: the SDXL triple is pose + depth + canny, with canny carrying the edge channel. `lineart.png` (an XDoG stand-in) is still emitted but not fed. The per-channel route was the one tested; a ControlNet-Union arm is still owed.
5. **The first proxy body, cone capsules, read as disconnected parts.** Fused metaballs read as one clay mannequin in every pass. Changed: build the proxy from metaballs.
6. **A near-frontal camera collapsed the foreshortened lunge** — the legs fused in projection. A 3/4 worm's-eye separated fore and aft limbs and read the drama. Changed: recorded as a staging rule.
7. **SDXL with three ControlNets on MPS ran at ~50 s/it** (28 steps ≈ 23 min for the fill alone): under `vram state: SHARED` with ComfyUI's default smart memory, weights were offloaded and reloaded between steps. Changed: restart the server with `--highvram --use-split-cross-attention` (50 → 15 s/it), fill at 768×1024 instead of 832×1216, and make the 1.5× refine a plain img2img pass with no ControlNet. The blocked two-pass came to ~555 s.
8. **`comfyui_controlnet_aux` pins `onnxruntime-gpu`, which has no macOS arm64 wheel,** so its install fails as written. Changed: install plain `onnxruntime` (1.26.0 went in).
9. **Blocking beat the prompt.** Two prompt-only seeds (7 and 42) both landed centred, eye-level and frontal; the blocked fill held the worm's-eye over-the-shoulder lunge. Changed: the page went stub → alive; SDXL stays the conditioning default and a FLUX-local ControlNet is deferred; the channel strengths went to [[Shop/Blender/toyxyz-conditioning-recipe]].
- run · 2026-06-13 · the conditioning keystone, study · taught items 1–9

## From operator memory, moved into canon — 2026-07-03

10. **ComfyUI's install layout and MPS session drift** were added to the 2026-06-13 report from operator memory (`83222581`). The checkout is at `_tools/ComfyUI/` directly, not nested; a long-idle server often holds :8188, and a second instance on another port with its own `--database-url "sqlite:////tmp/<name>.db"` dodges the database lock. Over a long session MPS slows: single-ControlNet SDXL drifted from ~3 s/it to 12–37 s/it and blew a 900 s render timeout after a few dozen renders in one server lifetime. Killing and relaunching the process restored ~3 s/it at once. Changed: relaunch between long batch sessions.
