# Animate the Background — tear-at-the-edge (lines remade after challenge)

**Title:** The tear at the figure's edge

**Caption:** Skip the infill, and the moving background still holds a copy of the figure. In BLUELINE shot 02, the project's own ink warp (not SVD) drags a grey copy of his head out past his edge. Watch the ring. The copy shows once in each four-and-a-half-second loop, for about a second and a half. Over LaMa's plate, the same warp leaves no copy of him. The authored figure sits crisp on top in both. What tears is the background behind him.

**What is real and what is a choice**
- **Both sides are the same by construction.**
  - Both loops come from one run of the project's `ink_flames.py`, with the project's settings: amplitude 15, wave number 1.7, 64 frames, and the lean from `smoke_physics.json`. Only the plate under the warp differs. On the left it is the shot itself, so the man is still in the moving layer. On the right it is LaMa's plate.
  - In both, the man is laid on top from the shot through the project's own feathered mask. So the figure is the same in the two, except at its feathered rim, where the background shows through.
  - The script ran from this folder through `ink_flames_here.py`, which changes only file paths, the plate's source and the output format.
  - The warp's amplitude is the project's own; I did not make the effect stronger. The challenger re-warped at five amplitudes, and only 15 matches the project's mp4 and gif.
- **The shot.** The file `new-story/out/02_hero-on-sedan-pointing.png` is gone from disk and git, but the image survives. The left half of the tracked `blender-fire/renders/proof/03_depth_ordering.png` is the shot: `depth_test.py` writes it beside the depth column.
  - The rebuild used here (clean plate outside LaMa's hole, `fire_composite_drawing.png` inside it) equals that half on all 1,011,712 pixels, including all 89,458 inside the hole.
  - So the shot is exact, and taking it from `03_depth_ordering.png` would give the same files.
  - I checked this myself; the challenger found it.
- **LaMa ran through the Shop.** I ran `Shop/LaMa/proofs/2026-11-14-card-check/lama_fill.py` with the project's mask (feather > 100, 11 px dilation). It returned the plate on disk pixel for pixel, and that is the plate used.
- **The motion is not the page's step 3.** Step 3 names SVD and a RAFT morph. This is the warp of § The N-Layer Case: the drawing's own strokes moved along a lean measured from the drawing.
  - What "tears" looks like here is his head's ink dragged by that warp. Most of the tear is his own ink, about 95% at the peak frame and about 84% over the whole loop. The rest comes from the hole's 5 px ring, which tears about 20 px in every quiet frame.
  - Method (`make.py sources` → `sources.json`): shot and plate differ only inside LaMa's hole, which is his pixels (feather > 100) plus the 5 px ring. I warped two hybrid plates, each with one part put back from the shot, and counted each tear the same way. At peak frame 15, his pixels alone tear 693 px and the ring alone 40. Over all 64 frames the counts are 8,930 and 1,727. The two parts don't add exactly to the full tear (745 at the peak, 10,960 over the loop).
  - The challenger, by its own split, found 97% at the peak and 88% over the loop.
  - Under SVD the failure might look different. That is untested.
- **Where it shows.** The plume touches his edge only from y 518 to 599, his head and shoulders. The page's hard case, fire around his legs, is not tested here, and the page's "The edge still untested" stands for that case.
- **"No copy of him" on the right, and what does move there.** The numbers are in `sources.json` § haze. Behind his head (LaMa's hole within x 300–470, y 505–615), LaMa's fill is light: mean grey 227 of 255, with 1.0% of its pixels darker than 70. The shot in the same place is his ink: mean 78, 64.4% darker than 70. So no ink of his can be dragged out on the right.
  - Near frame 8, a faint light-grey haze moves above-left of his hair. That is LaMa's fill, not him.
  - Within 20 px of his edge, the right loop darkens at most 151 px by more than 80 against its unwarped plate, at frame 60. That is the smoke's own strokes moving. The left loop darkens up to 697 px, at frame 15.
- **How much of the loop shows it.** A pixel counts as torn when the two loops differ there by more than 80 of 255, outside his mask and inside the plume.
  - The tear is over 100 px in 21 of 64 frames: 1.5 s at the project's 70 ms a frame. It is over 200 px in 17 frames. It peaks at frame 15 with 745 px and reaches 19 px past his edge in the 832 px frame.
  - The rest of the loop, 43 frames or about 3 s, the two panels look alike. A reader who glances then sees a ring around nothing. The caption says when to look.
  - The counts move with the threshold. The challenger's peaks were 861, 717 and 586 px at thresholds 40, 80 and 120, which puts the visible time between about 1.2 and 1.5 s.
  - Not counted: 525 px near his outline that differ in every frame. Outside the plume the left loop is the shot, and the right shows LaMa's fill in the hole's 5 px ring. That is not motion.
- **The frame.** The crop is 320 × 256 px of the 832 × 1216 frame (x 284, y 440), shown at 1.2×. All 1,040 pixels that tear in any frame lie inside it.
  - The thumbnail is the shot, still, with the crop marked.
  - The dashed ring is mine. It is placed from the worst frame's tear and is the same on both panels.
  - "infill skipped" and "infill done" are my short labels for the page's step 2, "Infill".
- **Size.** The piece reads at 1000 px.
  - At phone width (375 px) the copy is about 8 px across, close to invisible.
  - On a phone, the still of the peak (`tear-at-the-edge-still.png`, frame 15) would show more than the loop does. Whether to offer it there is the placer's call.
- **The format is an animated WebP:** 64 frames, 70 ms each, looping. A face shows a video only with controls, so it plays on a click and does not loop. An image loops by itself, and the public build copies it as it is.
  - It plays through the running app's `/rich/` route as `image/webp`. It animated in Playwright's Chromium 147, Firefox 148 and WebKit 26.4, in my test at 1040 px and in the challenger's at 1040 and 375 px.
  - Not tested: the Safari app, a real phone, the piece placed in a real face, or the public build actually run.
- **Reproduction.** `make.py all` reproduces the files byte for byte; the challenger checked this in a scratch copy. `lama-check.json` no longer records LaMa's timings, so it reproduces too. A third bench run added `sources.json` (where the tear comes from, and the haze). Across all three runs the WebP kept its hash, d24f62dd…, and so did the still, the overlay, `tear.json` and `rebuild-check.json`.
- Only its maker and its challenger have seen it.

**Leaking in**
- [[BLUELINE]], from `Projects/BLUELINE/proofs/blender-fire/ink_flames.py`, which gives the project's own reason for the step: "INFILL it with the surrounding fire, so the moving layer has no head to smear."
- [[LaMa]]'s card: "a clean plate that Animate the Background animates under the foreground."

**Anchor:** "Skip this and a moving background tears at the figure's edge"

**Made with:** the hand (BLUELINE's `ink_flames.py`, run from this folder) → LaMa (the plate, through the Shop) → Drawn SVG (the labels, the box and the ring, rasterised by Chromium) → the hand (`make.py` lays the frames and writes the WebP).

**Not for the bundle:** `project/`, `make.py`, `ink_flames_here.py`, `rasterize.mjs`, `playback-test.mjs`, `playback-test.json`, `overlay.svg`, `tear.json`, `sources.json`, `rebuild-check.json`, `lama-check.json`, `provenance.json`, `jobs.json`, `challenge.md`, and `tear-at-the-edge-still.png` unless the placer chooses it for small screens. Only `tear-at-the-edge.webp` travels, at 1.9 MB.
