---
title: "Move the Ink, Don't Redraw It — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Move the Ink, Don't Redraw It]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Move the Ink, Don't Redraw It's proposed rich face: every piece judged for test, fidelity and walk-up, every bench number traced to what it was measured on, and the loops the face plays checked against the fold the face draws, so Loudon reads a face that has already been argued with."
---

# Move the Ink, Don't Redraw It — rich — challenge

Challenger, proposal round of Enrichment, 2026-11-03, on the maker's commit `5a0af040` in the worktree `enrich/move-the-ink-don-t-redraw-it`. Judged from the page, the manifest, the three made pieces and seven gathered ones, and BLUELINE's track-VI bench (report, debrief, experiments page, `lib/`), with the maker's commit body as its only account. I did not make this face.

**Verdicts: 7 keep, 3 remake, 0 retire.**

## What each number was measured on

- **0.15 / 255** is BLUELINE's NPR stylizer (`stylize.py --mode npr`, one static paper tooth) run over a Blender smoke sim: `report.md:85` (Tier C), `report.md:18` ("deterministic NPR stylization"), `gallery.html:47` ("NPR boil"). No warp is involved. The meter is `stylize.flicker` (`lib/stylize.py:85-89`): mean |frame − frame before| × 255 over every pixel, so it counts motion and boil together.
- **1.50 / 255** is per-frame SDXL img2img on the same sim, fixed seed (`report.md:86`). The AI run used `--limit`, which keeps frames spread by `linspace` across the sim (`lib/stylize.py:98, 114-116`), so its pairs are further apart than NPR's. Its frames are under `renders/`, which is gitignored (`track-VI-elemental-motion/.gitignore`), and they are not on this Mac (no `renders/` in the owner's checkout, nothing under that name in Spotlight). So the 1.50 can be read, not re-measured.
- **The warp** was measured on the bench for its loop seam only, 0.0 (`experiments.html:179`).
- **Where the page's bullet came from.** The bench's own board labels the NPR row "deterministic (draw once, move ink)" (`report-assets/flicker_compare.png`). The page took the label, and with it a number that belongs to the NPR.

So the page's first bullet, "deterministic warp / NPR substrate — 0.15 / 255", describes the number wrongly. It is the NPR's number, and the warp's own reading on the same meter is not 0.15 (below). "Measured on the same moving smoke" is right for NPR against the AI: both ran on one sim.

## Why redrawing fails

### move it or redraw it.html — remake

1. **Test or decoration.** Mostly a test. The seam step could fail: a field that did not return would leave a seam. The split meter could fail too: if the meter told motion from boil, splitting it would show nothing new. Two of its readings hold by construction, though, and the piece should say which. The moved loop reads exactly 0 "where nothing moves" because that region is defined as the rows where the field's gain is zero (rows below the anchor, 26.7 % of the frame), and a zero push copies the still pixel for pixel. The redrawn twin's boil holds flat across gaps because each frame's nudge is drawn fresh and independent.
2. **Faithful.** The numbers are faithful to the bench and to the piece's own engine. Rerun: seam 0 with whole turns, 7.9688 at a turn and a half. Twin boil 4.261 / 4.329 / 4.277 at 1 / 4 / 15 frames apart; motion 0.879 / 3.195 / 8.524. Where it parts from the text, it parts openly and backs offers 1 and 2. One sentence overreaches: step 5's verdict, "motion grows with the gap, boil does not", is put as a general fact. It is a fact about this twin. An image model run on a fixed seed redraws from an input that drifts with the motion, so its frames k apart may differ more as k grows. Nothing here measures that.
3. **Walk-up.** Good. It goes one still → one push → the loop closes → redraw it → read the meter, and the bench's clips come last.

**Why a half turn leaves a seam.** Each wave's phase runs as −2π·c·m·t, with c = ±1 and m the turns. At m = 1.5 and t = 1 that is ±3π, the same as π. So every wave ends a half turn out, cos(φ − π) = −cos φ, and the field ends exactly reversed: max |d(1) + d(0)| = 0. The seam is the still pushed one way against the still pushed the other. It equals the whole-turn loop's change from frame 0 to frame 30, 7.9688 both ways. The pop you actually see (frame 59 to frame 0) is 7.937.

**What the twin can and cannot show.** It *can* show that a whole-frame difference cannot tell a mark that moved from a mark that was redrawn. It can show that reading only where nothing moves pulls them apart, and that motion's share grows with the frame gap. It *cannot* show how much any image model boils, how that boil depends on the gap, or how much of the 1.50 is boil. Its boil is whatever the slider says: 0.89, 2.20, 4.33 and 8.45 at a 0.1, 0.25, 0.5 and 1 px nudge. At the default 0.5 px the twin boils at 4.3 where nothing moves, almost three times the AI's whole-frame 1.50. Step 5 sets the twin's meters beside the bench clips' bars, so a reader may compare them. They don't compare.

**Remake, exactly:** (a) step 5's verdict: "…motion grows with the gap; this twin's boil does not, because each of its redraws is fresh. Whether an image model's does is not measured here." (b) In step 4's text or the hint: the twin's boil is set by the nudge slider, and its size says nothing about the AI's 1.50. (c) One clause where "boil, moved" first shows: it reads 0 there because that is where the field is zero. Nothing else changes.

### flicker_compare.png (gathered) — keep

It shows and does not test. It is the only record of the AI frames the palace keeps, and the caption says so honestly. A note for the maker, not a condition: the caption might add that the board's own NPR label, "draw once, move ink", is where the page's warp/NPR merge came from. The board also shows the AI scattering faint marks across empty paper in the right-hand strip, and that is boil on any reading.

## The same rule, the substrate too

### one grain.html — keep

1. **Test.** The boil claim could fail: a static grain that changed where nothing moves would read above 0. Rerun: fresh 0.630, fixed 0.000, carried 0.000. The slide part is close to built in. Slide is measured against the inked still moved by the sway, which is exactly the carried case, so carried ≈ 0 (0.326, interpolation) and fixed > 0 (8.773) follow from the definition. What the number adds is the size, and that rests on the 5 px sway the piece chose.
2. **Faithful.** The port matches the bench: npr_ink to 1.5e-7, the blur to scipy's to 6e-8. One overstatement: step 5's text says "both meters go to zero" with the grain carried. The slide reads 0.33. The step's own verdict line says "almost no slide", and the text should match it. Change "go to zero" to "fall to almost nothing".
3. **Walk-up.** Good. It goes grain alone → ink on it → fresh grain → one grain → the edge.

Silent, no audio, rAF only. Whether the slide reads as a fault to the eye is unverified. On a sim, a grain that stays put while the smoke passes is what one sheet of paper would do.

## How it shows up

The three loops show and do not test. They are the bench's own evidence for the paragraph's three named fields, though, and they play cleanly (Chromium: readyState 4, all three).

### water_v1.mp4 — keep

The caption is true: 1.98 / 255, all motion. Recomputed: 1.981. A note: experiments.html:112 records this loop at **amp 1.3**, not at the default push the face's fold table uses. My fit agrees: the residual against warp.py renders is least at 1.3 (3.53, against 5.79 at 1.0). At 1.3 the water field folds, tightest det J −0.27, on up to 3,605 pixels in 32 of 60 frames.

### flame_v1.mp4 — remake (caption only)

"The one field that crosses the fold on a few hundred pixels" is true of fields.py's flame on `plates/flame.png` with `auto:mid` at default push, which is what the fixtures measured. It is not true of this clip, for two reasons. The water clip beside it crosses as well (above). And this clip was not made that way: experiments.html:127 records "full mask · base anchor", and my fit puts it on `plates/flame2.png` (residual 8.0, against 106 on flame.png). At that setting the field folds on up to 936 pixels in all 60 frames, tightest det J −0.20. **Remake:** "The busiest loop on the bench, 8.72/255 frame to frame. Its field crosses the fold (The honest edge), as the water loop's does at the push it was rendered with." Or drop the fold clause.

### sky_v1.mp4 — keep

"det J never drops below 0.90" is true at default push. At the fitted render push (about 1.3, my fit, not a record) it is 0.87, so the claim holds in substance. Add "at default push" if the remake touches it.

## The honest edge

### where the warp folds.html — remake

1. **Test.** Yes. The sweep could have seen the count change short of the fold, and the billow's (5, 2) is out of reach by count. Rerun in Chromium: 480 frames, counts seen 4 · 1 only. At 1.4 of the fold the count wanders: the checks saw sixteen counts, from 4 to 8 islands and 1 to 4 holes.
2. **Faithful.** The derivation is right. In 1-D, s(x) = x − A sin(2πx/λ) and s′(x) = 1 − (2πA/λ) cos(2πx/λ), whose least value is 1 − 2πA/λ. That stays above zero exactly while A < λ/2π. On the pixel grid the central difference turns k into sin k, so the grid folds at k/sin k = 1.0018 of λ/2π. That is why 0.98 reads +0.0005 and 1.02 reads −0.0375 (the analytic −0.040; the gap is the one-sided difference at the edge). Two faults:
   - **det J > 0 at the end is not enough.** The piece's ripple is separable, so det J = (1 − a cos u)(1 − a cos v). Past the fold both factors can go negative and the product comes back positive, and the red overlay (det J < 0 only) shows those patches as unfolded. The fixtures already know this: dust's tightest det J is +0.05, yet it folds at push × 0.94, "on both axes". The condition is det J > 0 at every push from zero up, or plainly, the map stays one-to-one.
   - **The table describes fields, not the loops the face plays.** Every row is at default push on the plate's json settings. The bench rendered its loops elsewhere: water at amp 1.3 on record, flame on a different plate and mask on record. Next to clips that cross the fold, "water · at the edge" and "the one field that crosses" read wrong. The bench numbers themselves are confirmed: an independent forward-difference pass gives sky 0.898, dust 0.048, water 0.021, smoke 0.012, and flame −0.069 on 306 px in 54 of 60 frames (318 by central differences).
3. **Walk-up.** Good. It goes one arrow → ripple → push → past the fold → billow, with the test last.

**Remake, exactly:** (a) The hint under the table: "at the field's default push; the loops the bench rendered were pushed harder: water at 1.3 (experiments.html) crosses, det J −0.27 on up to 3,605 px." Or add a column "as rendered". (b) The equation note, or step 4: "past the fold a ripple can fold on both axes and read positive again; the honest test is that det J never reaches zero on the way up." (c) Optionally colour the doubly folded patches, where both factors are negative, red too.

### phys_motion_compare.png (gathered) — keep

The caption matches the board (anaglyph, frame-0 red, mid-loop cyan; motion p99 98.4 px procedural, 33.8 px velocity) and report-phys-motion.md (block-matching flow, 16 px blocks).

## Ancestry

### seedlock.gif — keep · warped.gif — keep

The captions match m3-warped-noise/README.md:62-64 (six frames from coil to leap, FLUX with a pose ControlNet, adjacent embedding coherence 0.858 against 0.809). The warped.gif caption is honest that "warp" changes sides here, which is the point of offer 5.

## The offers

1. **0.15 is not a warp's number — confirmed.** Recomputed on the mp4 previews with stylize.flicker's formula: NPR 0.124 inside the 90-frame sim, 0.159 counting the restart (the preview holds 180 frames, and the sim restarts at frame 89, where the jump reads 6.74). Warp loops: smoke 0.857, sky 1.792, water 1.981, dust 4.774, flame 8.722. These are previews at 420 px wide, so they are not the bench's own PNG frames, and the gap from 0.15 to 0.12 is from that. The proposed bullet is right.
2. **"Flatters the AI" runs backwards — confirmed, with one hedge to drop.** debrief.html:189 says the AI figure "is even flattered (it sampled sparse frames with more real motion between them)". Its own reason runs the other way: more motion per pair raises the AI's number. The mechanism is in the code (`--limit`, linspace). NPR read k apart, recomputed: 0.124 · 0.236 · 0.449 · 0.839 · 1.406 at 1 · 2 · 4 · 8 · 15. So at a 15-frame spacing, motion alone reaches the AI's figure. That does not show the AI's boil is small. The meter does not add motion and boil, and the AI draws more ink, so its motion term would differ. The board also shows AI marks on empty paper, which is boil. Keep "part of it is motion" and drop the offer's "perhaps most of it". The proposed text already says only "part".
3. **The grain can slide — confirmed, but the proposed sentence advises the wrong path.** 8.773 fixed against 0.326 carried, fresh boil 0.630. The page's sentence is not wrong as it stands. It names a cost it leaves out, so this is closer to an addition than a claim-change. "Where the motion is a warp, carry the grain with it" gives no advice that does anything. On the warp path the grain is already in the inked still and moves with it, and on the sim path it cannot be carried. Proposed instead: *"It can slide, though: on a sim, the grain stays on the screen while the smoke moves through it. A warp pays no such cost; there the grain is in the still and moves with the ink."*
4. **The warp's own edge — confirmed in its math, disputed in its reading of the bench.** λ/2π is right, and the default-push numbers stand. Two changes. (a) "det J > 0" should be "det J stays above 0 as the push grows" (see the piece). (b) "The bench's water, smoke and dust fields run within a few percent of it, and the flame crosses it" is true of the fields at default push and not of the loops the bench made and kept. Water, rendered at 1.3 on record, folds on up to 3,605 px. By my fits, which are not records, dust (~1.3) folds on 4,839, smoke (~1.15) on 358, and flame (flame2, full mask) on 936. Only sky holds. Those loops read as water, dust, smoke and flame to the people who made them. So crossing the fold on a few thousand pixels is a crease nobody saw, not a failure, and the page's edge, a shape the still never drew, still sits where it was. Proposed: *"The warp has an edge of its own: it rearranges the ink only while it never folds back on itself (det J stays above 0 as the push grows; for a ripple of length λ, a push under λ/2π). The bench's own loops cross it on a few thousand pixels and nobody saw the crease; the edge that matters is still a shape the still never drew."*
5. **"Warp" changes sides in the M3 rhyme — confirmed** (README.md:62-64). The edit is a fair clarification.

## Checks run

- `conform.mjs`: 3 pages, introduced 3, errored 0. **Errors 0, warnings 0.** It found the piece's two declared files.
- `fingerprint.mjs`: all five sections in step (433ff7ad99f5, ec3d46324744, 886654824764, 85e6e3497134, b6126317c426).
- `untracked.mjs`: every file the face names is tracked.
- `workshop/rich-checks.mjs`: all checks pass (numbers above).
- Rich server with headless Chromium at 1130 and 760 px: **console clean**. One `proposal · 2026-11-03` chip; five images and three main-page videos load. Both step-5 clips load from the piece origin, `…:8855/Projects/BLUELINE/…/smoke_sim_npr.mp4` and `smoke_v1.mp4` (readyState 4, playing, mean bars 0.16 and 0.86). The fold sweep returned 4 · 1. The grain fixed-mode slide read 8.53 live. The `ERR_ABORTED` lines on the main page's mp4s are media range requests; all three videos reached readyState 4.
- My own scripts, in the scratchpad: flicker on all seven previews at gaps 1-15; a second-method det J on the five fields; amp fits of the five loops against warp.py renders; the half-turn identity and twin boil against nudge, on the piece's engine.

**The two `../` clips in the public build: they will serve.** `build-public.mjs:394-397` resolves each declared file as `/${dir}${f}`, a palace-absolute path that normalizes to `Projects/BLUELINE/…/previews/…mp4`. `addFile` copies it to `files/Projects/BLUELINE/…`, and the piece ships at `files/Move the Ink, Don't Redraw It/…html`, so the browser's `../Projects/…` lands on the copy. Both are tracked (36 KB and 222 KB, under the 25 MB cap). The README's text-reference rule reaches the same file too: beside the `.md` and from the root, `../` escapes and is refused, and in the bundle it lands. One fragility, not the piece's: the declared-file copy runs inside `conformCheck`, so a report-only build whose checker throws would ship the piece without its clips. Not run: the build itself. It writes its image cache into the app's `node_modules`, which in this worktree links to the owner's.

## The face as a whole

It makes the idea felt, and it earns that by arguing with the page instead of decorating it. The strongest thing on the face is the split meter. Once you have watched "where nothing moves" sit at zero beside a twin that will not hold still, the page's two numbers stop meaning what the bullet says they mean, and the face says so in numbers you can rerun. The pieces walk up properly, all three are silent and clean, and the engines match the bench's code to the sixth decimal. Its weak point is the one it shares with the page: it measures BLUELINE's fields at default push and then plays BLUELINE's loops, which were pushed harder, so the fold story and the clips beside it disagree. The three remakes are short, and once they are done the face does what a rich face is for: it leaves the page's slogan standing and makes its numbers honest.
