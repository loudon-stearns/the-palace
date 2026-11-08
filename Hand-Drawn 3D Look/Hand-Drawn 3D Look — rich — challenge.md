---
title: "Hand-Drawn 3D Look — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Hand-Drawn 3D Look]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Hand-Drawn 3D Look's first rich face: every piece judged with a reason, the Blender renders re-rendered and matched, the seam and the boil recomputed from their own sheets, and two pieces sent back for one round of words and one wrong setting, so the face says what the renders show and no more."
---

# Hand-Drawn 3D Look — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, who did not make this face. Judged from the page (`Hand-Drawn 3D Look.md`), the manifest, the pieces and the maker's commit body (1e1fa7ac), and checked against BLUELINE's own scripts and reports.

**7 keep, 2 remake, 0 retire.** All three made pieces are real tests, each walks up, and each engine matches its reference. Two of them say one or two things the renders do not carry.

## What I ran

- **The renders are tracked, small and reproducible.** All 17 line renders and all 38 boil frames are tracked under `sheets/` (5.1 MB in all, the largest file 124 KB). The two clips under `rich-face/` are 1.1 MB and 0.4 MB. Everything is far under the face's 25 MB limit (`_ops/rich-face/README.md:146`). They come from `— rich — render plates.py`, which runs BLUELINE's `cat_stills_lines.py` and `03_motion.py` (both tracked) with switches added.
- **Blender is reachable on this Mac (5.1.2), so I re-rendered.** `c1n1s1p1` (the catalogue's #9) in a fresh Blender: once greyed, it is byte-identical to the tracked `sheets/lines/c1n1s1p1.png`. The boil's `single5` and `on` jobs: my `single5` is byte-identical to the tracked sheet, and frame 5 alone against frame 5 in the run differs on 2.64 % of pixels at full size, as the maker found.
- **Determinism inside one session, my own script.** #9 rendered three times in one Blender, with `read_factory_settings` between renders: 5.63 % then 5.36 % of pixels differ. With Spatial Noise amplitude 0, all three are identical. My fresh #9 against BLUELINE's catalogue `9_confident_min_wobble.png` (owner palace, gitignored): 5.30 %.
- **The maker's proof** (`— proof — rich checks.mjs`): all checks pass.
- **conform:** 0 errors, 12 warnings, all `sandbox-blocked` (4 per piece, the sheets.json fetch from an opaque frame). These are conform's frame, not the pieces: keep, with this note.
- **fingerprint:** 4 sections with pieces, all in step.
- **The face** at `rich-server.mjs --root <worktree>`, scrolled end to end in headless Chromium: 3 frames booted (each removed its loading line), 5 images and 2 videos decoded, the proposal chips showed, and the console was clean. Each piece driven to step 5 on the piece origin: still clean. No piece makes sound. The boil piece stops playback on `visibilitychange`; the other two have no loop.
- **Recomputed, my own scripts on the sheets:** the seam's above-chance lift at r = 2, 4 and 8; the boil against the ink's own area and in [[Move the Ink, Don't Redraw It]]'s meter; the depth gate's 22.6 % from `occlusion_mask.png` (9204 of 40668 blob pixels); the clips' frame counts with ffprobe (clouds 24 at 12 fps, blobspace 30 at 15 fps).

## The pieces

### one config away.html (What Blender draws for free): keep

1. **Test, not decoration.** It measures which knob moves the marks the page names, and could have come out with chaining on top. It didn't: noise did.
2. **Faithful.** Where it disagrees with the text, it says "partly" and leaves the feeling to the reader. The configs match `cat_stills_lines.py`'s VARIANTS exactly: `c0n0s0p0` is #1 and `c1n1s1p1` is #9.
3. **Walks up:** one line, the tentative line, the confident line, the four knobs, then which knob carries it.

Note for a later round, not a remake: the "pen" knob also moves the base thickness (2.6 to 3.2) and the crease angle (130 to 132). A crease angle changes which lines get drawn, not only how they're drawn. The "noise" knob drops the Perlin noise altogether. Step 4 could name both.

### comparison_HOLDOUT_3wide.png (gathered): keep
The caption matches the follow-up's side-by-side verdict (`grease-pencil-lineart`, "Freestyle #9 | GP B confident | GP C heavy"). The page's "GP renders thinner" is what it shows.

### the seam is a redraw.html (The seam is a redraw, not a filter): remake

1. **Test.** Held, new and chance are a real measure, and the chance baseline is the right control, because it lets an inky seed score high only if it lands on the plate's edges.
2. **Faithful, with two slips.** First, the 0.72 rung is recorded as Canny ending at 1.0 (`make sheets.py`, the `d072` settings), but `02_stylize.py:51` ends it at 0.85. Step 3's label reads "canny 0.85" with no end, so a reader takes it as the whole schedule. Second, step 5's test says "every seed keeps the two walls". Looked at, seeds 55555 and 70707 keep the near walls only as faint outlines on white paper. Their grey value is gone, and the far street becomes a different skyline. The sentence is stated as fact without a measure.
3. **Walks up:** the plate, the timid redraw, the ladder, the test, the eight seeds.

**Remake, exactly:** (a) set `end=0.85` for `d072` in `make sheets.py` and regenerate `sheets.json`, so the label reads "to 85 %". (b) In step 3, add one line: the rungs change more than denoise. 0.72 is `02_stylize.py` (cfg 6.5, 24 steps, its own prompt); 0.90 and 0.95 are `02b_stylize_push.py` (cfg 7.5, 26 steps, the ink medium front-loaded in the prompt); and 0.95 is seed 7, where the others are seed 2211. (c) In `#t5`, write "the corridor keeps its outline in every seed; in 55555 and 70707 the near walls survive only as faint edges on paper", or measure it.

### pose_survival_strip.png (gathered): keep
The caption is right: D2 ran at 0.93 (`redraw-posed-figure/report.md:37`, `04_redraw_D_depth_freestyle.py:124`), and A, B and C ran at 0.95 (`report.md:33–35`). It is one seed and one pose (`report.md:86`).

### the boil, measured.html (Motion is atmosphere): remake

1. **Test, the strongest on the face.** It found something the page didn't know, and I reproduced it in Blender.
2. **Faithful in its numbers, misleading in one word.** The caption and step 3 call the boil on twos "small: 0.6 % of pixels". But the plume's dark ink (grey below 128) covers only 2.2 % of the frame. Held still, one seed step changes pixels covering 26–32 % of the ink's area. In Move the Ink's meter (mean |Δ| × 255) that is 0.62–0.73/255, the size of the boil that face measures for a fresh grain each frame (0.63). It is visible on its own (I looked at the diff). In the clip it is masked, not small: the on and off runs share Spatial Noise's draws (the pixels each changes per frame overlap at Jaccard 0.85–0.93), so the twos boil adds about 0.5 % to the 3.1 % boil on ones.
3. **Walks up:** one frame, twelve frames, on twos, on ones, the playhead.

**Remake, exactly:** in the caption, replace "real, exact, and small: 0.6 % of pixels per new seed" with the ink-relative figure (for example, "real and exact: each new seed moves about a quarter of the line, 0.6 % of the frame; in the clip it is swamped"). In step 3's `#p3`, give the ink share beside the pixel share and replace "it is small" with "it is swamped". Step 4's "tried while making this" claim (five renders match with Spatial Noise 0) is now reproduced here, three renders identical; it can stay.

### clouds.mp4, blobspace.mp4, compare_occlusion.png, inked_baked.png (gathered): keep
The captions check out: 24 frames at 12 fps, 30 frames at 15 fps, and the depth gate hides 22.6 % (`step6_zcomposite.py`'s stat, recomputed from its mask). The four panels and the baked plate are as described. With no made piece under "Ink that lives in 3D", the parallax is left to [[The 2.5D Paper Stack]], which is right.

## The offers

1. **Seeds lock the corridor, not the structure: confirmed, robust.** Held 55.2–93.0 %, above chance 0.26–0.83, and three seeds under 0.5 (88: 0.47, 55555: 0.47, 70707: 0.26). The spread holds at other tolerances: 0.20–0.77 at r = 2 and 0.35–0.91 at r = 8. "The corridor holds in every one" is a look, not a measure, and in 55555 and 70707 it holds only as outline.
2. **The low rung: confirmed, then disputed in part.** 0.72 with Canny 0.85 is right (`02_stylize.py:87`). But Canny ended at 0.85 of the schedule, and the prompt, cfg and steps changed between the rungs too. "The turn is between 0.90 and 0.95, late and narrow" doesn't follow: each rung is one seed, and at the 0.95 recipe seed 1337 draws 13.5 % new marks, fewer than the 0.90 rung's 20.4 %. The seed spread at 0.95 (new 13–57 %) swallows the gap between the rungs. Keep "name the tight Canny on the low rung"; drop "late and narrow".
3. **D2 at 0.93: confirmed, but the suggestion overreaches.** The recipe did run at 0.93 on one seed and one pose. But the page's "a figure holds its authored pose all the way to denoise 0.95" is the report's own line (`report.md:78`), and B proved it: Canny plus depth at 0.95, pose held, style lost (`report.md:51`). Better: "the recipe ran at 0.93; depth alone held the pose to 0.95 at the cost of the ink".
4. **Which knob: confirmed.** Noise −15.6 points, chaining −5.7, Bézier +3.0, pen +8.6. SKETCHY 1.75× with heavy noise, 1.27× with a trace. Spears 6.75 % and 8.48 %. #1 carries calligraphy 0.6–4.5 at 45° (`cat_stills_lines.py`, VARIANTS #1). Each corner is one draw of the noise, from a fresh Blender.
5. **"Fully deterministic" holds per fresh Blender: confirmed, reproduced** (5.63 %, 5.30 % against the catalogue, exact with Spatial Noise 0). The state survives `read_factory_settings`, so it lives in the process, not the scene. The page needs the caveat, not a reversal: deterministic from a fresh Blender, or with Spatial Noise off.
6. **The boil on twos: numbers confirmed, framing disputed.** 0.57–0.72 % per seed step against 3.06–3.27 % per render on ones, and 4.17 % against 4.16 % per frame in the clip. But it is not small and not invisible: it moves about a quarter to a third of the ink, the same size as the fresh-grain boil Move the Ink measures. The finding is that the page's boil is redundant in this clip, because Spatial Noise already boils on ones. Suggest: "the waver here comes mostly from Spatial Noise redrawing on every render; the Perlin re-seed on twos is real but swamped."
7. **The playhead: confirmed, reproduced** (2.64 %, exact with Spatial Noise 0). "A pure function of the playhead" is not wrong for what the sentence is for: geometry and value are a function of the frame, so the elements still sync to the song. It is wrong for the line, and it bites when one frame is re-rendered alone. It needs the noise caveat and the one-setting fix, not "false".

## Beside its siblings

There is no contradiction on plates with [[The 2.5D Paper Stack]] or [[Move the Ink, Don't Redraw It]]. Paper Stack's Route B board registers two passes by sharing one depth map and one seed. Offer 1 is the same fact from the other side: change the seed and the structure moves. Move the Ink's rule, fix the thing once and don't remake it each step, is what the boil piece found broken by accident: Freestyle's Spatial Noise is a fresh grain on every render. The two faces measure the boil with different meters (share of pixels over 32, against mean |Δ| × 255). The bridge figures above (twos 0.67/255, ones 3.4–3.7/255, the clip 5.2/255) put them side by side.

## The face as a whole

It makes the page's idea felt, and it earns that by testing it: the seam turning from render to drawing between rungs, the two lines a ten-value block apart, the plume that boils when nobody asked it to. The best moment is the boil piece's last step, where the page's own guarantee fails on a re-render and one setting brings it back. That is a production gotcha that text alone would never have found. It is busy in places: every piece ends on "partly". But each "partly" carries a number I could reproduce, and the two remakes only ask the words to match those numbers.
