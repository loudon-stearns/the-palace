---
title: "Remnants in Depth — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Remnants in Depth]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Remnants in Depth's proposed rich face: every piece judged for test, fidelity and walk-up, the white-square finding re-rendered on my own placements, and the June session read for what the material really was, so Loudon reads a face that has already been argued with."
---

# Remnants in Depth — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03, against maker's commit `c7ea7f90` on `enrich/remnants-in-depth`. Four pieces: 3 keep, 1 remake, 0 retire.

The short version. The maker's renders are right, and I reproduced them to the pixel. Their headline conclusion is not. "Neither fix alone is enough" fails to reproduce only because the test has two cards that never overlap. Put a near card's empty corner over a mark that a building hides, and with BLENDED the hidden mark shows through the building, cut off in a straight line at the near card's square edge. With DITHERED it does not. June saw exactly this kind of cut-off. And the guess that June's material lacked the edge guards is wrong: the June session added both guards two hours before it saw the BLENDED rectangle.

## The pieces

### The trick: billboards, not geometry — `Remnants in Depth — rich — flat and in depth.html` — **keep**

- **Test or decoration?** A test. The metaball curve could have stayed high, and it doesn't: agreement with the drawn mark falls to 0.839 at 30° and 0.631 at 90°, and the ink goes from 6 pieces to 1 by 70°. The fixed card is a fair foil, and it drops to 0.000 edge-on. The facing card's 1.000 at every angle is a geometric identity, not a measurement that could have failed. The card sits at the orbit's centre and turns with the camera, so the camera-to-card relation never changes (all ten `card_face_*.png` share one md5, `0ef967de…`). The piece says why ("a card held parallel to the film projects to the same picture"), so this is honest. It is a control, not a test.
- **Faithful?** Yes. It adds one thing the page doesn't say, and labels it as an addition: the glob loses the mark even unlit, in flat ink. One small disclosure is missing. Step 1's "drawn mark" is not synth_001's own pixels. It is the 147-ball metaball seen from the front, rendered and fed back as the card's texture (`render plates.py`, "this image is the card's texture, so at 0 degrees they agree"). Against synth_001 itself, scaled and centred, that reference scores IoU 0.944, with 6 pieces of ink where synth_001 has 7. The subtitle should say "fitted to synth_001". That is a note, not a remake.
- **Walks up?** Yes. Mark, a depth, face the camera, the metaball, then the test. One idea per step, test last.
- **Measure.** "Still the mark" is measured two ways: silhouette IoU (grey < 200) against `card_face_00`, and a count of 4-connected pieces of ink. The checks script re-derives both from the plates with scipy and they match. Truck: near card slides −35.50…−35.60 px per quarter unit against f·Δx/z = −35.56. Far card slides −11.81…−11.86 against −11.85. Ink holds at 3531–3546 px throughout. Within 0.1 px, as claimed.
- Taste note, not a remake: the metaball is one build, with spherical elements on the mark's plane. A glob squashed in depth would hold the mark longer. The piece's note names only the other direction (droplets at other depths scramble faster). One clause would cover both.

### The three steps — gathered `/Hand-Drawn 3D Look/rich-face/blobspace.mp4` — **keep**

- **Test or decoration?** Decoration, and it can't be anything else: a gathered record of the three steps run end to end. The section's one testable claim, that measured circularity drives the raggedness, is carried by offer 2, not by this piece.
- **Faithful?** Yes. The caption's "30 frames at 15 fps" checks out with ffprobe (1120×880, 15/1, 30 frames). The file is tracked.
- **Walks up?** Not applicable to a single gathered clip.

### The clean composite — `Remnants in Depth — rich — the white square.html` — **remake**

- **Test or decoration?** A real test, built on blob_swarm.py's own rig. The walk is good: the lines, the square, DITHERED alone, two layers alone, the test. But the test can't fail the way June failed, because its two billboards never overlap. Billboard B is behind a building, but no nearer card's empty corner lies over it.
- **Faithful?** No, in two places. Step 5 says "Here, one fix is enough: the two view layers". My overlap render contradicts that on Blender 5.1.2 with the material exactly as the script writes it (numbers under Offer 1). The note "the June material, before the clip and the hard alpha, which may be why BLENDED showed an edge then" is wrong on the record (also under Offer 1).
- **Walks up?** Yes.
- **What to remake.** Add an overlap case to step 5, or give it a step 5 of its own before the verdict. Keep billboard B where it is. Add a near card M on the ray to half a card-width left of B:
  `LM = C + 0.4 * (LB + Vector((-0.5 * side(LB), 0, 0)) - C)`, size `side(LM)`, blob_swarm's `blob_material(MARK, …)`. Render two layers with BLENDED and with DITHERED, plus M alone and B alone. The truth is the union of the ink of the two single renders. Measure the ink that isn't in the truth. Show the BLENDED leak in amber, with its straight edge.
  Then rewrite the step 5 verdict, its note and the caption. Two layers are the fix for the lines. DITHERED is still needed in the blob layer, because a BLENDED card's empty square opens the depth gate for marks the buildings should hide. On an isolated card BLENDED leaves no edge: that half of the current finding is true and should stay. Drop the June-material sentence.

### Forward Vectors — gathered `/Projects/BLUELINE/proofs/blender-handdrawn/followups/flowfield-spatter/montage_comparison.png` — **keep**

- **Test or decoration?** A gathered record of a proven claim. The caption does honest work by naming a confound the page doesn't: size goes up with field strength too, so density, size and direction change together.
- **Faithful?** Yes, and every number checks out. Ink share: left half 0.080, right half 0.164 (grey < 128 on the 2240×880 montage). Stretch: `ELONG_K = 2.6` in `flowfield_spatter.py:258`, so elong = 1 + 2.6 = 3.6 at peak. Size: `mag_boost = 0.7 + 1.3 * mag_norm` (`:309`). The file is tracked. It loads lazily: naturalWidth is 0 until scrolled into view, then 2240×880.
- **Walks up?** Not applicable.

## The offers

### Offer 1 — The clean composite, claim-change — **disputed**

What I confirm, re-rendered with my own script against blob_swarm.py's rig in fresh Blender 5.1.2 processes:
- **Two isolated cards (the maker's placements), two layers.** My BLENDED crop matches the maker's `L2_blend.png` to 0 pixels over 4/255. My own measure: 0 of 75,675 line pixels lost frame-wide, BLENDED or DITHERED. The ring 3 px either side of each quad edge (A 3014 px, B 3083 px) has 0 pixels moving more than 4/255, max 0. BLENDED and DITHERED differ at 584 pixels, and 582 of those lie within 2 px of ink: the mark's own antialiasing, not a plane edge.
- **One layer.** BLENDED and DITHERED renders differ at 0 pixels (max 0), and my crop matches the maker's `L1_blend.png` to 0 pixels over 4/255. 8,318 line pixels are lost in both. The maker's plates `L1_blend.png` and `L1_dith.png` are byte-identical (md5 `3e2229fe…`). DITHERED alone does not fix the square. June's field notes say the same (`FIELD-NOTES.md:137`, "DITHERED and BLENDED both fail").
- **Guards undone.** I did not re-render these. `rich checks.mjs` re-derives them from the maker's plates: an edge only with both undone, 8 px at most 8/255.

What I dispute:
- **The claim reproduces once cards overlap.** In the case above (near card M's empty corner over the occluded card B, two layers), BLENDED shows 3,459 ink pixels that the truth doesn't have. Every one sits inside M's square. The leak stops dead at M's right edge: 87, 78, 64, 56, 49, 50, 54, 57 extra pixels in columns 755–762, then 0 from column 763. DITHERED shows 29 (antialiasing). That is a mark the building should hide, showing through it and cut off square. My inference is that the BLENDED card's empty fragments write depth into the blob layer's Z pass and open the `cityDepth > blobDepth` gate across the whole square. I didn't dump the Z pass. The square-bounded leak is the evidence.
- **The full swarm, June's own A/B.** blob_swarm.py's whole scatter, seed 11, frame 10, two layers, BLENDED against DITHERED and nothing else changed. 3,168 pixels differ by more than 4/255, nearly all on mark edges. Three whole specks (209, 33 and 124 px) show under BLENDED and are hidden under DITHERED. I looked at the first: a speck beside a building's lines that DITHERED's tighter depth hides. No faint grey rectangle appeared. June's "faint grey rectangle" is not reproduced here. Its "hard straight cutoffs at the plane boundaries" is.
- **The June material had both guards.** The June session's transcript (`8915d379…`, 2026-06-25) shows the CLIP extension ("kills the square frame") and the 0.45 GREATER_THAN cut written at 20:17:29Z. The material went BLENDED at 21:58Z and the two layers went in at 22:16–22:24Z. Loudon spotted "a faint grey rectangle and hard straight cutoffs at the plane boundaries" at 22:36Z. The only change before the clean render at 22:37Z was BLENDED → DITHERED. The A/B was real and the guards were in place. So the maker's "may have come from a material before those guards" doesn't hold. git can't show this (the scripts landed in one commit, `9fbe5a01`, on 2026-06-26), but the session can.

So this is neither a refutation nor a pure scope correction. The page's claim holds on 5.1.2. Its stated mechanism is off: "the billboard's own square edge faintly shows". What I can reproduce is depth, not an edge: marks behind buildings leak through the empty square. A suggested no-claim-change rewording of the bullet's reason, for Loudon to weigh against the maker's: *"In its own layer it must be a `DITHERED` alpha clip, which discards the transparent fragments entirely, so only ink writes depth. Left `BLENDED`, a card's empty square still counts as near in the depth gate, and marks a building should hide show through it, cut off square. Neither fix alone is enough."* The maker's offer text should be replaced, not kept.

### Offer 2 — The three steps, claim-change — **confirmed**

- `blob_synth.py` reads `CIRC` and `CIRC_LO` at lines 25–26 and uses them only in the closing print at line 95. Raggedness is hand-set at lines 46–47: `spiky = random() < 0.32`, ragged 0.7–1.25 if spiky, else 0.12–0.4. Seeds are fixed at line 19.
- I recomputed the hash on four inputs, each in its own folder via `python3 -I`: circularity mean 0.99/p10 0.95, mean 0.30/p10 0.10, the stored June `blob-character.json`, and no file at all. All four give 30 files with sha256-16 `1eff2897f4f6a4df`, the maker's hash. BLUELINE's actual June library, `blob-library/synth/synth_*.png` (30 files, untracked), hashes the same. The marks BLUELINE ships are identical to what any signature would produce.
- **Above 1.** The stored signature has circularity max 1.397 and solidity max 1.636, with a median diameter of 7.36 px. These come from the cv2 branch of `blob_analyze.py:49–61`. The scipy fallback caps solidity at 1, so solidity 1.64 shows cv2 ran. `area` is the pixel count, which runs to the pixels' outer edges. `perim = cv2.arcLength` and `harea = contourArea(convexHull)` follow the contour through boundary-pixel centres, half a pixel inside. So it is both at once: the perimeter is undercounted and the area is overcounted against that perimeter. On digital discs, with a centre-line contour standing in for cv2's: D = 5 px gives perimeter 13.7 against a true 15.7, circularity 1.41, solidity 1.50. D = 7 gives 19.3 against 22.0, circularity 1.25, solidity 1.32. By D = 20 it's 0.96 and 1.07. Mostly perimeter undercount at the sizes measured. The maker's aside is right, and its words ("pixel-count area over contour perimeter misreads 7-px marks") name the mechanism.
- The maker's suggested wording fits what I found.

### Offer 3 — The trick, no-claim-edit — **confirmed, with one qualifier**

- **COPY_ROTATION's effect in the rig.** `add_blob` (`blob_swarm.py:124`) and the piece's `card()` copy the camera's whole rotation. The plane's +Z normal takes the camera's +Z, which points back toward the camera, so the card stays parallel to the film plane, not aimed at the camera's position. Under a pinhole camera, a plane parallel to the film projects as a similar figure, so the mark keeps its shape anywhere in frame and only its scale changes, by f/z. The rig shows it off-centre too: the truck cards sit 0.22 of the frame from centre and hold their ink to within 0.4 % (3531–3546 px) while sliding. "Anywhere in frame" beyond that is geometry, not measured.
- "The glob loses the mark even unlit" is confirmed by `glob_ink`: 0.839 at 30°, 0.731 at 60°, 0.631 at 90°. The `glob_lit` figures run 0.01–0.03 below `glob_ink` at the same angles. Lighting adds only a little to what the silhouette already loses.
- Qualifier: the facing card's 1.000 is by construction (see the piece's verdict), so the offer should call it a control.

## Checks run

- `node "Remnants in Depth/Remnants in Depth — proof — rich checks.mjs"`: all checks pass (orbit table, truck, the white-square engine against scipy on all 7 plates, knobs).
- `node _ops/rich-face/conform.mjs "Remnants in Depth"`: errors 0, warnings 8, all `sandbox-blocked`: conform's opaque frame fetching `sheets/sheets.json`. **Keep-with-note.** On the rich server (`rich-server.mjs --root <worktree> --detach`, port 8850, `/?entry=Remnants%20in%20Depth`) both pieces loaded `sheets.json` and their plates. I walked each to step 5 in headless Chromium, with no 4xx responses and an empty console. There were 4 proposal chips ("proposal · 2026-11-03"), blobspace.mp4 at readyState 4, and the montage at 2240×880 once scrolled into view. Server stopped after.
- `node _ops/rich-face/fingerprint.mjs "Remnants in Depth"`: all four made sections are in step (ac5cf769573f, 06f0fade72e5, 8d704d104805, 81a68bb6034c).
- Sound: none in either piece (no audio, video or AudioContext), so hush-when-hidden and click-to-start don't arise. Nothing licensed. Every plate the pieces load is tracked under `sheets/`.
- My renders: 15 headless Blender 5.1.2 jobs from my own script, which execs blob_swarm.py up to its build block, with only the ROOT and OUT paths swapped. They were ref, isolated ×2, one-layer ×2, near-over-near overlap ×4 (clean both ways: 4406 of 4406 far-card ink pixels under the near card's empty corner kept), near-over-occluded ×4, and the full swarm ×2. Outputs went to the session scratchpad, which will be cleared. The placement line above is enough to rebuild the case.
- **Tuning ledger.** No run line for this page in `Enrichment/Enrichment — tuning.md` on the branch, and the maker's commit doesn't touch the file. Step 8 asks for `- run · 2026-11-03 · v2.7 with the proposal-round settings · Remnants in Depth · nothing new` (or `taught item N`), the line format in its frontmatter. It's missing. I left it for the maker's remake commit.
- My own measure: my "corner lines kept" counts line pixels under ink as kept (I masked ink as dark-not-line). So for the one-layer case I quote only frame-wide loss, not a corner share. The maker's corner measure, with ink from its own render, is the better one.

## The face as a whole

It makes the idea felt. Both made pieces are what the ceremony asks for: walks that end on a measurement which could have come out the other way, on BLUELINE's own mark and street rather than stand-ins. The trick piece earns the page's central choice. The metaball letting go of its satellites one by one is the clearest picture of "breaks the flat-ink read" I can imagine. The white-square piece is the more valuable of the two, because it got the page into an argument. It just came down on the wrong side, by testing the easy case. Remade with the overlap, it becomes the best thing on the face: a reader sees that two layers bring the lines back, then sees a hidden mark bleed through an empty square, and knows exactly why the second fix exists. The two gathered pieces are honest records with honest captions, and they don't pretend to test anything.
