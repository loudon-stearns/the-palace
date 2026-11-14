---
title: "README"
born: 2026-11-14
links:
  - target: "[[ComfyUI]]"
    type: connects-to
    label: proof-for
forward_vector: "I say what the 2026-11-14 card check ran for ComfyUI, with what, and how long it took, so the next maker can rerun it from the card's Run line."
---

# ComfyUI — card check, 2026-11-14

The 2026-11-14 card check: a generic driver, `comfy_run.py`, run three times against a server started that day with the MPS launch flags (`--highvram --use-split-cross-attention`), on the fireflies workflow at 768×512, 20 steps.

- `fireflies-small-a.png` — seed 7, the server's first render: 38.6 s.
- `fireflies-small-seed8.report.json` — seed 8, warm: 26.2 s (its PNG was not kept).
- `fireflies-small-c.png` — seed 7 again, warm: 27.3 s. It matches `a` by eye but not by byte: 76% of pixels differ, by at most 63 levels ([[ComfyUI — tuning]] item 4). `rerun-side-by-side.png` shows both at half size.
- A seed-7 rerun sent with nothing changed came back in 0 s with no image, served from ComfyUI's cache (item 5); `comfy_run.py` now says so instead of crashing.

The server was stopped when the session finished. Copies of the renders also sit in `_tools/ComfyUI/output/` in the main checkout.
