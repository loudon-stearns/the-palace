# Challenge — Animate the Background, `tear-at-the-edge.webp`

2026-11-17, one challenger (Opus), brief `challenge-v2.md`. Condensed by the working session from the challenger's report. All its runs were in a scratch copy.

**Verdict: remake the lines only. The WebP stands as made.** The picture is true and it helps: it shows the page's untested claim in step 2, and joins the four steps to the N-Layer warp and LaMa.

**Read as a stranger, all 64 frames pulled out:**
- Peak, frames 12–19: a clear grey copy of his hair is dragged up and left of his head in "infill skipped"; "infill done" is clean.
- Quiet frames, about 26–63 and 0–3: the two panels look the same to the eye.
- **About 42 of 64 frames, roughly 2.9 s of every 4.5 s, the panels look alike.** A stranger who looks then sees two identical moving panels, a ring, and nothing to compare.
- First stumble: the smear reads as a change to the man himself, not to the background behind him. The caption's last sentences fix it, for someone who reads them.

**Recomputed:**
- One command reproduces the files: `make.py all` in a scratch copy gave the WebP, the still, the overlay, `tear.json` and `rebuild-check.json` byte-identical. `lama-check.json` differs only in a timing string, so its hash will never match on a rerun.
- **The rebuild is exact, by a route the maker did not use.** The left half of the tracked `Projects/BLUELINE/proofs/blender-fire/renders/proof/03_depth_ordering.png` is the shot itself (`depth_test.py` writes the shot beside a column). The rebuilt shot equals it on all 1,011,712 pixels, inside LaMa's hole and outside it. `06_physics_analysis.png` agrees on all but its drawn arrow and line. So the rebuild has no seam that could make the fringe: it simply is the shot.
- Where the tear comes from: warping the man's pixels alone gives a peak of 724 px; the LaMa-hole ring alone gives 25. About 97% of the tear is his own ink, so "a copy of the figure" is honest.
- Tear counts by its own measure at thresholds 40, 80, 120: peak 861, 717, 586 px; frames over 100 px 22, 19, 17; reach past his edge 20.6, 18.4, 17.9 px. The maker's 745 px, 21 frames, 18.8 px sit inside that. "About a second and a half" holds at the generous end; about 1.2 s at a strict one.
- The amplitude is the project's: the script keeps `AMP = 15.0`, and re-warping at 10, 13, 15, 17, 20 against the project's own mp4 and gif matches sharply at 15.
- The copied shot file exists nowhere on disk or in git under any spelling (control searches found files, so the empty result means absent).
- All files in `project/` hash-match the tracked files.

**The words:**
1. "BLUELINE's shot 02 … is gone from disk and from git, so I rebuilt it." True of the file, false of the image: the shot's pixels are tracked, whole, in `proof/03_depth_ordering.png`. **This sentence must change**, and the long rebuild section can shrink to a line.
2. "Nothing was made louder" is a sound word for a picture.
3. "Leaves his edge clean to the eye": mostly true; by eye only, around frame 8 a faint grey haze sits above-left of his hair in "infill done". Soften or measure.
4. Missing from the honest line: that the panels look alike for about 2.9 s of the 4.5 s loop; that the shot survives in `03_depth_ordering.png`.

**The ring** is honest help, not leading the witness: placed from the data, the same on both panels, it does not make the effect bigger. Its one cost is pointing at an empty spot for two-thirds of the loop.

**Size:** readable at 1000 px. At phone width (375 px) the image is 143 px tall and the ghost about 8 px, close to invisible.

**Playback, its own test through `/rich/`:** Chromium 147, Firefox 148, WebKit 26.4, with `loading=lazy`, scrolled into view, at 1040 and 375 px wide: 12 of 12 screenshots differed in every engine and size. `rich.js` turns a `.webp` into a lazy `<img>`; `build-public.mjs` copies a "— rich —" WebP as it is. Still untested: the Safari app, a real phone, the piece placed in a real face, the public build actually run.

**Specialist passed over?** No. PIL wrote the WebP where the plan named ffmpeg; fine.

**What must change, lines only:** (1) the lost-shot sentence, verified; (2) "louder" → "stronger"; (3) one line on the 2.9 s, verified; (4) soften or measure "clean to the eye", seen by eye only; (5) optional, take the timing out of `lama-check.json`.

**Page offers:** "(on the `feature/blueline-m3` branch)" is stale in three places; the hero has letter-like scrawls against its own prompt. For BLUELINE: eleven `blender-fire` scripts point at a shot file that is gitignored and missing; the image survives in `03_depth_ordering.png`. Checked and fine: "~55° off the drawn wind".

**To the next maker:** before you rebuild something "lost", look for it inside the project's own proof images. When a piece moves, count how much of the loop shows nothing, and say so.

## Second verdict, on the remade lines — keep

Same challenger, 2026-11-17, against the files.

**The picture is unchanged:** the WebP's hash is the one first measured; the still, overlay, `tear.json` and `rebuild-check.json` byte-identical. `make.py` changed in one line (LaMa's timings stripped from `lama-check.json`). `shop check` passes the three made images; the five "?" files are the copied project inputs.

**The haze, checked its own way over three regions behind his head:** LaMa's fill is light (mean grey 228–229, 0.4–0.9% dark) where the shot is his ink (mean 31–87, 60–85% dark); the maker's figures fall inside those ranges. Darkening within 20 px of his edge matches the maker's to within 3 px (right loop 152 at frame 60; left loop 694 at frame 15). The claim holds: no ink of his can be dragged out on the right.

**What still stands, words only:**
1. **The challenger's own number was wrong, and the lines now carry it.** "About 97% of the tear is his ink" is true at the peak frame (724 of 745 px). Over the whole loop it is about 88% his ink and about 12% the hole's ring, because the ring adds about 20 px in every quiet frame. The line should say both.
2. **The haze numbers have no script that stays.** They are in no script or JSON in the folder. They belong in a measure output.

**Optional:** "as the smoke swells" is the maker's picture of a travelling wave; "reads at the band's 1000 px" need only say 1000 px.

**Checked and fine:** the shot paragraph; the amplitude credit; the 43 quiet frames and the "ring around nothing" line; the phone-width limit; the untested list (Safari app, a real phone, a placed face, the public build run); every "no", "only" and "same".

## The two record fixes, applied by the maker — 2026-11-17

The WebP is unchanged (sha256 begins `d24f62ddb3eded9f`, the same in all three bench runs).

1. The maker derived the tear's source split itself, by warping two in-between plates (his pixels alone put back; the hole's 5 px ring alone put back). Its figures are a little lower than the challenger's: about 95% his own ink at the peak frame (693 and 40 px against a full tear of 745) and about 84% over the whole loop (8,930 and 1,727 against 10,960). The two parts do not add exactly to the full tear, and the lines say so. `lines.md` carries the maker's figures and gives the challenger's (97% and 88%) beside them.
2. The split and the haze figures now come from a new stage, `make.py sources`, written to `sources.json`. `make.py all` runs it. `sources.json` is listed in the job's outputs and among the files that do not travel.

Also taken: the caption says "Watch the ring." without "as the smoke swells".

`shop check`: 3 matching, and the 5 copied project inputs it cannot account for.
