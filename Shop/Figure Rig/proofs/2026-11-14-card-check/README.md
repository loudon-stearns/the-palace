---
title: "README"
born: 2026-11-14
links:
  - target: "[[Figure Rig]]"
    type: connects-to
    label: proof-for
forward_vector: "I say what the 2026-11-14 card check ran for Figure Rig, with what, and how long it took, so the next maker can rerun it from the card's Run line."
---

# Figure Rig — card check, 2026-11-14

The 2026-11-14 card check: `pose_rig_mpfb_v3.py` (copied from BLUELINE's rig-openpose folder) run headless, `-- --pose B --gender 1.0 --label B_male`: an MPFB2 body with 19,158 vertices and a 163-bone rig, ink and depth plates and 18 of 18 keypoints in view, in 11.9 s (`time.txt`). BLUELINE's `draw_openpose.py` then drew `openpose.png` in 3.4 s: body only, no hands. The copy here carries the gender comment as corrected after the run ([[Figure Rig — tuning]] item 1); the run itself used the old comment, same code. The D2 redraw was not run.
