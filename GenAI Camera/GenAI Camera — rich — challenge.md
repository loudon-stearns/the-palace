---
title: "GenAI Camera — rich — challenge"
born: 2026-11-03
links:
  - target: "[[GenAI Camera]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of the GenAI Camera's proposed rich face: every piece judged for test, fidelity and walk-up, every number re-run and every offer recomputed by a second route, so Loudon reads a face that has already been argued with, and knows which of its counts measure what they say."
---

# GenAI Camera — rich — challenge

Challenger, proposal round of Enrichment, 2026-11-03, on the maker's commit `ada0aac3` in the worktree `enrich/genai-camera`. Judged from the page (`GenAI Camera.md`), the manifest, the four made pieces, their workshop (`checks.py`, `checks.mjs`, `build.py`), the renders they read, and the scripts that made those renders, with the maker's commit body as its only account. I did not make this face.

**Verdicts: 2 keep, 2 remake, 0 retire.**

## The checks I ran

- `python3 checks.py`: every number in the maker's commit reproduces exactly (dial curves, plates 21,952 vs 34,987 lit px = 1.59×, depth 191–221 and 154–244, shootout 45.6% / 26.1% and 11.0% / 99.4%, seam 2.67 vs 2.62).
- `node checks.mjs`: all four pieces re-measure in headless Chromium, page = baked = checks.py, no page errors.
- `conform.mjs "GenAI Camera"`: 4 pieces, all introduced, 0 errors, 0 warnings, browser pass at 760 and 1130 px.
- `fingerprint.mjs "GenAI Camera"`: the three made sections in step (`f51a66682968`, `de234c539112`, `27fe79f123ae`).
- The face served on a standalone rich-server and loaded headless: see § The face, served.
- Every file the four pieces declare is tracked. No sound in any piece (no AudioContext, audio or media element), so hush and click-to-start don't apply. Nothing licensed.
- Provenance of the one copied file: `rich-face/shootout-inpaint-base.png` is byte-identical (md5 `4a0aa290…`) to the owner's `GenAI Camera/_inp_base.png`, mtime 2026-07-09 13:41, the minute render 013 was written (renders.json n 13). `shootout.py` rewrites that file once per figure, so the last write is the env with the sorceress already painted in: the right base for the barbarian, as the piece says.
- My own probes, in the scratchpad: the seam at several offsets from the region's edge, the inside share at the inpaint node's real grow, the dial count split by where on the cell the ink sits, and the 005/008 silhouettes.

## The pieces

### segment or inpaint · § The multi-camera move — **remake**

1. *Test or decoration?* A test. The segment could have come out contained and didn't: render 012 is one giant barbarian's head and fur filling the frame, the sorceress buried under it. The contrast is the evidence.
2. *Faithful?* Two things are not.
   - **The region is described and drawn 8 px too wide.** The piece says the inpaint node grows the region "16 more" pixels and dilates by 33 px to match. ComfyUI's `VAEEncodeForInpaint` builds a 16-px kernel with padding 8 (`_tools/ComfyUI/nodes.py:411–414`), so `grow_mask_by: 16` grows the mask by about 8 px. At the true grow (MaxFilter 17), inpaint changed 10.9%, 98.6% inside; segment 45.4%, 23.2% inside. The conclusion stands; the numbers and the sentence should change.
   - **The seam number tests nothing.** It is measured 16 px out, where the edit has already died. Mean |render 013 − base| in 4-px rings beyond the 81-px region: 73, 34, 9, 3.5, 2.5 levels. At the measured edge the change is 3.5, the VAE round-trip floor, so the step there (2.67) has to equal the base's (2.62). At the node's real edge it is 5.96 against 3.40 across (p95 27 against 16), 5.42 against 2.55 down. The finding the page wants is real, but it is the fall-off: the edit feathers out over about 12 px, a soft blend, not a cut. That is the number to show.
   - Also worth one clause: 99.4% inside is mostly by construction, since the noise mask lets the sampler denoise nothing outside the region. What the count can't tell apart is a figure scaled to the region and a giant cropped by it. The overlay can: the inpaint figure fills the region head to foot. Say that the overlay, not the share, shows the scale.
3. *Walks up?* Yes. Env lens alone, then the figure plates on the same camera, then the region, then the test.

Does "placement and scale must be imposed at generation" follow? From this pair, at one seed: the region placed and sized the figure, and the cutout faithfully kept a giant. "Must" rests on the page's "learned 3×", not on this piece alone, and the piece doesn't claim more. One side note for the page, not the piece: the segment figure was not pure txt2img. `shootout.py` called `g.generate` with the figure's own beauty plate as the img2img init at 0.97 denoise, and `generate` uploads it (`genai_camera.py:169–173`). At 0.97 the plate's scale didn't survive. That sharpens the page's later recipe, "impose scale via … the img2img init": it holds only at a denoise low enough for the init to count.

**Remake:** set the region to the node's real grow (MaxFilter 17, "about 8 more") in `checks.py`, the engine and `build.py`, and re-bake. Replace the seam paragraph with the ring fall-off (the change dies over about 12 px past the region). Add one clause that the overlay, not the share, shows scale. Step 2's hint should name the plates' source (renders 021 and 022's beauty passes, same camera).

### depth auto-range · § How it runs — **keep**

1. A test: the page says the fix makes the pass "always fill the gradient", and it doesn't.
2. Faithful, and it disagrees with the text on purpose, as an offer. Confirmed independently. Renders 005 and 008 have the same figure on the same camera: silhouette IoU 0.998. The before plate's visible surface spans 30 levels of a 1.2 bu range, so about 0.14 bu deep. The after plate spans 90 levels, 35.3%, so the bracket it sat in was about 0.14 / 0.353 = 0.40 bu. That is the page's "~0.4 bu figure" exactly: the bracket spans the whole mesh while the camera sees only the front third of it. That is the maker's explanation, reached by arithmetic, not by reading the code.
3. Walks up: one pass with a probe, before, both stretched, the test.

Note: `cam_z_range` samples every n//2000th vertex (`blender_panel.py:29–31`), so it can miss the extreme vertex and clamp a sliver. Not seen here (max 244).

### the costume dial · § Gotchas & recipes — **remake**

1. A test of "depth locks the surface", and that part holds. Light ink beyond the body falls at every step for both figures.
2. Not faithful in what it names. The count is "light ink beyond the body's outline", and the piece calls it costume, robes and fur. Two things that aren't garments carry much of it:
   - **The barbarian's sword.** The blade stands just right of the body, in the strip x > 270 of the cell. That strip holds 29% of his count at depth 0, 62% at 0.30 and 69% at 0.45, and empties when the sword goes at 0.60. Set it aside and the fur runs about 100 / 64 / 21 / 12 / 0 / 0%, not 100 / 71 / 40 / 28 / 0 / 0%.
   - **The sorceress's hair and halo.** The rows above 200 hold 3,400–3,700 lit px from depth 0 through 0.60, while the robes below fall away. Below row 200 the robes run about 100 / 72 / 36 / 20 / 14 / 4%. The caption's "a quarter left at 0.60, as hair and drips" is mostly hair.

   These splits are rough, by region, not by mask, but they move the curves well beyond rounding.
   
   The verdict copy also misreads its own numbers. "It falls steadily, not in bands": as counted, both curves drop 28–31 points per step to 0.30, then only 12 points from 0.30 to 0.45, then the fur drops 27 to nothing. That's a shelf where the page puts its sweet spot and a cliff where it puts the nude, which is band-like. But the shelf is held up by the sword and the hair, so the count can't settle the bands either way.
3. Walks up well: two plates, pose alone with the outline, the dial, the test.

Whose bands are wrong, the page's or the count's? The count's is the weaker instrument. The page's bands are an eye's judgment on two axes: does the costume read, and does the body have form. The count measures one proxy for the first. It counts props and hair as cloth and can't see black cloth. By eye on render 022 the black cape is whole at 0.0–0.45 and gone at 0.60, replaced by background splatter. So "fur tolerates a hair more depth" can't be tested by this count. If it means the cape, the eye agrees with it to 0.45. The light fur falls faster than the robes once the sword is set aside (21% against 36% at 0.30). "0.0–0.15 full garment" is the one band the count presses on. 0.15 already loses 28–36% of the light ink, though by eye both garments still read whole there.

**Remake:** exclude the sword (a fixed column mask on the barbarian's cells, or a blade mask in `build.py`) and the hair (count below the shoulders, or mask the head band), or at minimum name both in the caption and the verdict. Re-run both routes. Replace "steadily, not in bands" with what the cleaned curves show. Say once that the count measures light ink beyond the body, one proxy for whether a costume reads, and that the bands are the eye's.

### thin plate, thick plate · § Gotchas & recipes — **keep**

1. A test by overlay, and honest that it is one. It could have shown the thick plate failing too.
2. Faithful, and it narrows the page on purpose, as an offer. My reading by eye agrees. Render 020's two drawings are nearly the same picture, the thin plate's arms a touch lower. In renders 019 vs 022 at pose only, the thin-plate barbarian's hands sit about 50 px lower on the sheet and his feet about 55 px lower than the thick plate's, past the skeleton's ankles. From 0.15 up the two sheets are close to identical. The plates' 1.59× ink is reproduced.
3. Walks up: two plates, the record's check, the sweep.

Caveat for the caption: one seed per plate, and 019 (20:20) and 022 (20:46) were separate runs, so the plate is the difference that shows, not provably the only one.

## The offers

1. **How it runs, claim-change — confirmed.** 0.4 / 1.2 = 33%, a third, not a quarter. Before: 191–221 of 255 = 11.8%. After: 154–244 = 35.3%. `cam_z_range()` (`blender_panel.py:20–35`) takes every sampled vertex of every mesh in the collection with z > 0, then min − 0.03 and max + 0.03: the whole mesh, back included. The implied bracket of 0.40 bu (above) confirms it by a second route. The proposed wording is fair.
2. **Gotchas, the dial — partly disputed.** Confirmed: by 0.30 more than half the light ink is gone (44% / 40% as counted, about 36% / 21% with sword and hair aside), and the fur is gone by 0.60 (0.4%). Confirmed: the cape is invisible to the count. Disputed: "falls steadily rather than in bands". As counted it has a shelf at 0.30–0.45 and a fur cliff at 0.60, and both lean on the sword and the hair. Proposing "cite the two curves beside the bands" should wait until the curves count cloth only.
3. **Gotchas, the thin plate — confirmed.** 020 shows a small drift. 019 vs 022 at depth 0 shows the fault plainly, and depth carries the stance from 0.15. One cross-face note: the ControlNet as Topology face's open offer calls render 020 "the diagnosis (the thin plate let the arms drift; the controlnet_aux plate held them)" (`ControlNet as Topology — rich.json:49`). Two open offers now point Loudon at different renders for the same fault. Whichever lands second should cite 019 vs 022 too.

**Render 011 agrees across faces.** The ControlNet as Topology face shows 011 with the record's caveat: thin plate, the init at high denoise did the work, 021 and 022 are the test that stands (`ControlNet as Topology — rich.json:158–163`; `renders.json` n 11 caveat). This face doesn't show 011. Its segment piece makes the same move for render 013, citing the same caveat (`renders.json` n 13), and its thin-plate piece puts the evidence where 011's caveat says to look. No conflict.

## The tool lesson and its run line

- **The run line is malformed.** The ledger's standard is `- run · <date> · v<version> · <what it ran on> · nothing new | taught item N` (`Enrichment/Enrichment — tuning.md`, frontmatter `standards.line`). The maker's line puts a lesson after "nothing new for the spec;". It should end `· nothing new`.
- **The lesson belongs in the README.** The ledger's own header says "Lessons that changed only the tool live in `_ops/rich-face/README.md`."
- **The README doesn't say it yet.** It says the public read view frames pieces opaque (`_ops/rich-face/README.md:244`) and that a piece needing nothing of an origin runs `allow-scripts` in an opaque origin (`:204`). Nowhere does it say a canvas there can't read pixels.
- **The lesson is right in kind.** In an opaque origin every image is cross-origin, so drawing it taints the canvas and `getImageData` throws. The pieces' `pixels()` catches that and falls back to baked numbers, which is good practice.
- **"Must" is too strong.** Baked numbers are one cure. The other is CORS: `img.crossOrigin = 'anonymous'` with a host that sends `Access-Control-Allow-Origin`.
- **Offer, for an elder:** trim the run line to `· nothing new`, and add one gotcha to the README's § Making pieces: a piece that reads pixels gets a tainted canvas in an opaque frame. Bake the numbers as a fallback, or load with CORS.

## The face, served

Standalone rich-server on the worktree, `?entry=GenAI Camera`, headless Chromium at 1300 px, scrolled through. Four frames; each piece re-measured live from the renders and matched its baked numbers (`__gc.live` true, `same` true for all four); the proposal marking shows; console clean, no page errors. Server stopped after. The first load attempt hung on the third frame because it was evaluated before being scrolled into view; a harness quirk, not the piece's.

## The face as a whole

This is a face that measures, and three of its four pieces find something the page doesn't know about itself. The auto-range fix triples the gradient, not fills it. The thin plate's fault shows where depth is absent, not in the check the page cites. The shootout's giant is counted, not just seen. The maker's discipline is real: two routes for every number, baked fallbacks, honest "by eye" labels. Its weakness is the one that discipline invites. Once a number agrees with itself twice, it's easy to stop asking what it counts. The dial counts a sword and a head of hair as costume, and the seam is measured where nothing changed. Both are fixable in one round, and both are fixed by looking at the mask, not the arithmetic. With them fixed, the face makes the page's central idea felt: one camera, many lenses, the geometry steering and the words dressing. Each piece puts a hand on a dial the page names and shows where it bites.
