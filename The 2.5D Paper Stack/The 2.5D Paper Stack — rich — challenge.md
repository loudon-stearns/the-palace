---
title: "The 2.5D Paper Stack — rich — challenge"
born: 2026-11-03
links:
  - target: "[[The 2.5D Paper Stack]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for The 2.5D Paper Stack's first rich face: every piece judged with a reason, the cut's table recomputed from track VI's plate, and the three made pieces sent back for one round each, narrowly, so the face says only what the page and the plate can carry."
---

# The 2.5D Paper Stack — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, who did not make this face. Judged from the page (`The 2.5D Paper Stack.md`), the manifest, the pieces and the maker's commit body (24331411), nothing else.

**4 keep, 3 remake, 0 retire.** The three made pieces all hold up in their engines; each says one thing the page or the numbers don't carry.

## What I ran

- **The sheets are track VI's.** I re-ran `make sheets.py` in a scratch root with track VI linked in. All four PNGs and `sheets.json` came out identical to the committed ones. `ridge-density.png` is `lib/layers.py` `solid_silhouette` with route_separate.py's settings (dark 0.45, σ 16, threshold 0.5), before its 2 px dilation. The plate and all four gathered assets are tracked.
- **The cut table, recomputed independently.** My own script (scipy `distance_transform_edt`, `scipy.special.erfc`, scipy's dilation and gaussian for track VI's cut) on the plate and sheets. It reproduces the reference on every row: 2299 edge pixels; hard at the edge 0 / 0 / 0.00; 2 px in 0 carried, 1.932 left; 4 px in 3.906 left; feather 6 px 2.463 carried, 2.555 left, 4.745/255, 9.24 % visible; density contour 1.944 left; track VI's own cut 0.796 carried, 1.130 left.
- **The maker's proof** (`— proof — rich checks.mjs`): all checks pass.
- **conform:** 0 errors, 12 warnings, all `sandbox-blocked` (4 per piece). The 15 file-local warnings in the commit body are gone now that the files are tracked.
- **fingerprint:** 5 sections, all in step.
- **The face** at `rich-server.mjs --root <worktree>`, scrolled end to end in headless Chromium. All three frames booted (each piece's loading line was removed), all five images decoded, and the console had 0 lines. On the piece origin, each made piece driven step by step: 0 console lines. No piece has sound. Every animation loop checks `IntersectionObserver` and `document.hidden` before it asks for another frame, so each one stops when hidden.
- **Reveal and break, the turning run:** I clicked "break from a turning stack" six times at different moments. In the frame after the click, the world's rotateY read 3.84, −9.81, −7.96, 13.52, −13.70 and 8.54°.
- **The balloon, cover:** screenshots of step 2, at his depth in front of him against at his depth behind him, cropped at the mouth.

## The pieces

### the cut.html (Why high contrast makes it work): remake

1. **Tests or decorates?** It tests. Eleven cuts on the plate's real edge, where a hard cut could have come out visible, or a feather invisible. It also found what the page leaves out (offer 1).
2. **Faithful?** Its numbers are right, but one sentence misstates one. The step-5 verdict says the 6 px feather "is off the plate on 9.2 % of the edge before anything moves". The 9.2 % is a share of the 40-px edge zone (167,455 px, about 73 zone pixels for each edge pixel), not of the edge. Of the 2299 edge pixels themselves, 75.4 % are visibly off at rest (73.9 % even at σ 2). Put another way, the pale rim averages 6.7 px wide along the whole edge. Step 4 correctly says "of the edge zone"; step 5 and the commit body drop the word, and the number then reads as if 91 % of the edge were clean.
3. **Walks up?** Yes. The edge as drawn, one cut, the slide, a feather, then the test.

**Remake, one sentence:** in `#t5`, say the rim covers three of every four edge pixels and averages about 7 px wide (or "9.2 % of the 40-px zone around the edge"). `#n5` should name the denominator for "visible".

Note, not required: "0 px of line left" for the hard edge cut is 0 by the sheet maker's L < 0.45 line. The one-pixel ring just outside it averages 0.69, against 0.78 four pixels out, and half its pixels are more than 16/255 darker than that. So about 0.2 px of ink-equivalent grey stays on the back sheet and slides. One clause saying so would make the highlighted row honest, and it strengthens the case for a knife a hair outside the line, which is where track VI's cut sits.

### sky_separate.gif (gathered, margin): keep

Track VI's own Route A in motion, beside the paragraph about soft masks. The caption's claim about the earlier band mask is the bench's own (track VI `report.md:115`: "where my band-mask bled cloud drift into the ridge"). It is a record and evidence, not decoration.

### infill_compare.png (gathered, The catalogue): keep

The page's "infill is ground-dependent" in the bench's evidence. The caption matches `report.md:153-155` (the water plate, SDXL inpaint in ink).

### routes_compare.png (gathered, The A/B duals): keep

The duals table in its own evidence. I opened the board, and the caption matches what is on it: mattes, composites, red and cyan anaglyphs, "clouds drift / ridge locked".

### routeB_v2_compare.png (gathered, The A/B duals): keep

"38–39 %… Route A's cut: 38.4 %" is `report.md:178`. The shelved sharpening pass and GPU capacity are `report.md:7`.

### the balloon.html (The stacking order means something): remake

1. **Tests or decorates?** Half and half. The drift column is the parallax formula (x′ = x − c·p), so it can't come out otherwise. It makes depth felt; it doesn't test it. The cover half is where it could test the page ("order decides the cover"), and there it barely shows. Behind him, the walker covers 6.2 % of the tail's last 30 px. At the piece's 380-px canvas that is about two CSS pixels at the tip. I could see it only at 3× zoom.
2. **Faithful?** Mostly. The drift numbers are right (40·|p − 0.55|: 0 at his depth, 10 with the sky, 6 well in front, 22 as a sticker). Two sentences overreach. Step 1 says that on a still frame "it doesn't matter where in the stack it lives". Step 2 shows it does (cover), and the page's "not just who covers whom" counts cover in. In step 5, the sticker "moves like the farthest thing in the frame (not at all)", but the farthest sheet, the sky, moves 12 px. The step-4 breathing is the piece's own sine on the outline, not track VI's warp, and "the same kind of warp" says so honestly.
3. **Walks up?** Yes. One balloon, a depth, the camera, the breathing, then every placement.

**Remake:** place the balloon or route its tail so that, behind him, the walker visibly covers a real part of it (the tail crossing his head or shoulder), or add a zoomed inset at the mouth. Re-measure the cover. Reword step 1 ("on a still frame, only what covers what tells you where it lives") and the sticker clause ("moves like nothing in the frame").

### reveal and break.html (The two contraries): remake

1. **Tests or decorates?** It comes closest to a felt A/B: the same break, out of flat and out of turning. The ratio is not a measurement. It is set by the piece's own 14° sway and 38° break. I derived it from the camera path: the most turn any 1.5 s window of 14·sin(2πt/6.5) shows is 2·14·sin(π·1.5/6.5) = 18.57°, at a zero crossing. The least is 2·14·(1 − cos(π·1.5/6.5)) = 7.04°, centred on a crest. So 38° is 2.05× to 5.40× what came before, and 0° before out of flat. The engine agrees. A 5° sway would give 5.7× to 15× by the same path.
2. **Faithful?** No, in two ways.
   - (a) The turning run is not "the stack of step 2 that has been turning all along". Step 4 opens flat. The click snaps the stack to wherever the sway is (measured: 3.8° to 13.7° of turn in one frame), and at the same instant adds 40 px of air and the paper. The "before" count leaves that snap out.
   - (b) The page does not say a reveal spends the break. Lines 82–87 hold reveal and break as contraries, both true ("You hold both"). Its "flat" is the flat paper world, which a revealed stack, paper edges and air between the planes, still is. The page never says turning is the reveal. "That is the page's contrary held as a number: flatness is what the break breaks" says the page says more than it does.
3. **Walks up?** Yes. Two sheets, the reveal, flat under a moving camera, then the break.

**Remake:** start the turning run from a stack already swaying, or ramp the sway in, and count the turn the eye actually sees from the click. Recast the step-4 verdict and the caption as the piece's own reading, with the 14° and 38° named as its choices, and carry "a reveal that turns spends the break" as an offer if the maker stands by it. Better still, add the page's own case: break out of a stack that shows its paper edges and air without turning.

## The offers

**Offer 1 (claim-change, Why high contrast): confirmed, and I read the page's sentence as wrong, not unstated.** "The right cut is a knife hidden *inside* the ink (black meets black)" (`The 2.5D Paper Stack.md:50`) names a place. That place is right at rest: 2 px in is 0.00/255 off the plate. It is wrong once sheets move, and moving is the page's premise ("each free to move on its own", line 44). By my recompute, a knife 2 px inside the ink leaves 1.932 px of line on the back sheet, and 4 px in leaves 3.906 px. Hard at the outer edge leaves 0 / 0. Track VI's own cutter says the same thing in its comments. `lib/layers.py:33` dilates "so the front fully covers the back under the edge", and `route_separate.py:14` notes "ridge keeps its full black line".

Two refinements:
- The piece assumes the back sheet is the plate outside the cut. A pipeline that fills a hole larger than the cut (as the sheet maker's own fill does, 8 px) would show the fill at rest instead. So a knife inside the ink fails at rest rather than in motion, and the conclusion is the same.
- The commit body says track VI's dilation "already does that". It doesn't quite: it still leaves 1.13 px of line and carries 0.80 px of sky. The manifest's "within about a pixel" is the honest wording, and the anti-aliased ring (above) says the best knife sits a hair outside the L < 0.45 line.

**Offer 2 (no-claim-edit, Stacking order): confirmed as a clarity edit, not a correction.** Depth sets the drift (40·|Δp|, 0.4 px per 0.01) and order sets the cover. That is true in the piece's model, and in any compositor where layer order and parallax are separate settings. The page's sentence isn't wrong, though. A balloon a hair in front (p 0.56) drifts 0.4 px. And the page's own Forward Vectors already put a bubble's depth at the speaker's mouth, read from the depth pass (line 95), so "at its speaker's depth" agrees with the page rather than changing it. Until the balloon remake, the "order decides the cover" half has no visible demonstration behind it.

## Flagged for the round

- **The 12 sandbox-blocked warnings: keep, with a note.** conform frames each piece in an opaque origin, and the rich server sends no CORS, so the `sheets.json` fetch fails there. On the piece origin all three load same-origin with a clean console, as above. For the public build, the pieces load images with `crossOrigin = 'anonymous'` and need the host's `Access-Control-Allow-Origin`. I confirmed that GitHub Pages sends `access-control-allow-origin: *` (curl on pages.github.com). I did not check the palace's own public site or its build. Every face in the round that fetches a declared file will raise the same four warnings per piece. A conform rule that tells this case apart from a real failure would save each challenger the trip.
- **Move the Ink, Don't Redraw It (same bench, BLUELINE track VI): no shared claim about plates conflicts.** Its made piece uses `plates/smoke.png`. It gathers `sky_v1.mp4`, captioned "det J never drops below 0.90" at default push. This face plays `sky_separate.gif`, where Route A warps the same sky field at amp 1.6 (`route_separate.py:20`). I computed the sky field's min det J over 60 frames, whole plate, central differences: 0.910 at default and 0.857 at 1.6×. No fold, and this face states no det J. The one shared idea is the page's "the tail can flex with the same warp" (line 74). The balloon's breathing is its own sine, and its wording ("the same kind of warp") doesn't claim more.

## The face as a whole

The face makes the page's central idea felt. A frame is sheets, and you can watch them come apart on one real drawing. The cut piece is the strongest thing here. It is a real test on a real plate with an independent reference, and it found the one word the page is missing. The gathered boards are track VI's own evidence, laid where the text cites them. The two later pieces are well built and walk up properly, but each says one thing more than its section. The balloon claims a cover you can't see, and the break turns the page's held contradiction into a trade-off the page never states. Neither is busy. Both need one round to say only what they show.
