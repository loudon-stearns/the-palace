---
title: "README"
born: 2026-11-14
links:
  - target: "[[Blender]]"
    type: connects-to
    label: proof-for
forward_vector: "I say what the 2026-11-14 card check ran for Blender, with what, and how long it took, so the next maker can rerun it from the card's Run line."
---

# Blender — card check, 2026-11-14

The 2026-11-14 card check: the keystone's `pose_and_emit.py` and `draw_passes.py`, copied here so they write into this folder, run headless with Blender 5.1.2 and the ComfyUI venv. Pose and passes: 3.3 s (`blocking/time.txt`); drawn passes: 0.4 s. Every pass was pixel-identical to `tests/passes/` from 2026-06-13, though the PNG files differ in bytes, so only the small drawn ones (`passes/openpose.png`, `passes/canny.png`) and `pose_keypoints.json` are kept here; the rgb, depth, normal, lineart and `.blend` copies were deleted. The ComfyUI fill (`run_comfy.py`) was not rerun.
