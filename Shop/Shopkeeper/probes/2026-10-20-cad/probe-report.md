---
title: "CAD probe — Haptic Handwheel parts"
born: 2026-10-20
links:
  - { target: "[[Shopkeeper]]", type: connects-to, label: probe-for }
  - { target: "[[Haptic Handwheel]]", type: connects-to, label: draws-the-parts-of }
forward_vector: "I hold the evidence for a CAD route in the Shop: three drawings of the Haptic Handwheel's parts, made from text, checked against their own source, with every number's origin in its colour. I want to be read beside the Specialist I argue for, and superseded by the first part that comes back from the printer and fits."
---

# CAD probe — Haptic Handwheel parts

**Run:** 2026-10-20, a one-off commission ([[Shopkeeper — baton — CAD]]), on Loudon's Mac.
**Question:** can the palace make accurate, dimensioned drawings of a mechanical part from plain text, on the Handwheel's own parts, without inventing a single number?
**Answer:** yes, with build123d. Three sheets, a printable fit test, and two findings the Handwheel's bench needs before box day.

## What I made

| sheet | what | out/ |
|---|---|---|
| HH-MOT-00 | The GM5208-12 as its shop page gives it: Ø63 ±0.05, 30.7 ±0.2, hollow shaft Ø15 −0.008/−0.012 and Ø12 +0.05/0. An envelope, with five unknowns listed in red. The view from above is 1:1: print it at 100 % and set the motor on it. | `HH-MOT-00 motor reference.svg` · `.png` · `.step` |
| HH-CAP-01 | The light cap (`PARTS.md` row 7): Ø80, 40.2 g in solid PLA, centred on the rotor's outside rather than on a bolt pattern nobody has seen. A section at 2:1, the rim at 5:1, mass and inertia. **HOLD:** no bolt holes and no STL until the rotor-top pattern is measured. | `HH-CAP-01 light cap.svg` · `.png` · `.step` |
| HH-LAD-01 | The fit ladder: three register rings at 0.1, 0.2 and 0.3 mm a side, named by notches. Print them, push each onto the motor, keep the tightest that slides on, write that number into the source, and the cap redraws. | `HH-LAD-01 fit ladder.svg` · `.png` · `.step` · **`.stl`** |

Every number lives once, in `handwheel_dims.py`, tagged with where it came from: **DATASHEET** (the maker's page, read 2026-10-20), **DESIGN** (chosen here; change it and the sheet follows), **ASSUMED** (PLA density; the scale is the truth) or **MEASURE** (`None` until someone holds calipers to the part). The drawings print those in three colours: blue, ink and red.

Run it from this folder. The venv sits at the worktree's root and is not committed; make it once with `uv venv --python 3.12 .venvs/cad` and `uv pip install --python .venvs/cad/bin/python build123d==0.13.0`, then:

    ../../../../.venvs/cad/bin/python build.py

About 20 seconds for all three sheets; `out/check.json` keeps the checks.

## The route, and the one I didn't take

**build123d 0.13.0** (Python, Apache-2.0) on the OpenCASCADE kernel through `cadquery-ocp-novtk` 8.0.1. It ran in a venv inside this worktree (`.venvs/cad`, Python 3.12, 581 MB, gitignored). The part is a Python file and the sheet is an SVG whose words and numbers are real text, so `git diff` shows a changed dimension and `grep Ø63.4` finds it. That passes the test [[Technical Diagram Standard]] sets for figures: the source is plain text.

**FreeCAD 1.1.0**, already on this Mac. I built the same cap with its Part module from the same `handwheel_dims.py` (`freecad_probe.py`). It agreed with build123d to every digit printed, on volume and on inertia, which is expected: they share a kernel. Run headless (`freecadcmd`), TechDraw can make a page and a dimension (it measured the Ø80), but it can only export that page as DXF. SVG and PDF need the GUI ("Cannot load Gui module in console application", `out/freecad_probe.json`). So FreeCAD's place is beside the route, not in it: it opens the STEP files so Loudon can turn a part in his hands.

**Triaged without a probe:** OpenSCAD is not installed, works on meshes rather than exact solids (no STEP), and has no dimensioning. CadQuery runs on the same kernel as build123d with an older API and no drafting module. [[Blender]] is already in the Shop and makes scenes, not dimensioned parts. Fusion and Onshape are GUI and cloud tools, not text.

## How it was checked, and what wasn't

The agent can check that the model, the source and the files agree. It cannot check that a part fits.

- **Model = source.** Before a dimension is labelled, the build measures it off the solid (circle radii, face heights) and compares it with `handwheel_dims.py`. A mismatch stops the build. 20 of 20 agree. On the first run this caught a real fault: fusing the shaft into the motor body erased the Ø15 boundary, and the build refused to label a diameter the model no longer had.
- **Files = model.** Every STEP is read back to the same volume (to 1 part in 10⁹), and the ladder's STL to within 0.5 %. 4 of 4.
- **A second hand.** FreeCAD's cap matches; so does my hand sum of the cap's inertia (30.57 × 10⁶ mm⁵ at unit density).
- **Not verified:** anything physical. Nothing is printed, nothing has met a motor, and the motor isn't bought. The fit ladder exists for exactly that gap: it is the calipers' question, asked of the printer.

## The parts list — what the Handwheel will want drawn

| part | from | known | missing | here |
|---|---|---|---|---|
| Motor, GM5208-12 | `PARTS.md:13` | Ø63 ±0.05, 30.7 ±0.2, shaft Ø15 / Ø12, 209 g, runout ≤ 0.1 (shop page) | rotor-top and base bolt patterns; where the rotor ends; whether the shaft stands proud; the top edge's shape | HH-MOT-00 |
| Light cap | `PARTS.md:19` | Ø80, ~40 g | the bolt pattern to fix it with | HH-CAP-01, held |
| Disc of known mass | `PARTS.md:19`, `BENCH.md:6` | the light cap will do | see finding 1 | the cap's mass table |
| Heavy cap, 150 g with steel pockets | `PARTS.md:19` (later) | 150 g | the steel weights' size | not drawn |
| Mount block | `PARTS.md:20` | hardwood or aluminium, clamped | the base bolt pattern; which material; the clamp | not drawn: the next honest test |
| Lever or bar; keys; sideways mount | `PARTS.md:60`, `Haptic Handwheel.md:124` | second build | everything | not drawn |
| Fit ladder | this probe | the rotor's OD | the printer's shrink | HH-LAD-01, printable |

**For Loudon, with calipers, once the motor arrives:** the rotor-top bolt pattern (count, thread, circle), the base pattern, the height of the turning bell, and whether the hollow shaft stands above the rotor. Each is a `None` in `handwheel_dims.py` waiting for its number.

## Two findings for the Handwheel (offered, not edited)

**1. A cap as the bench's disc reads the rotor's inertia about 15 % low.** The bench analyzer takes the disc's inertia as a uniform flat disc (`firmware/bench/bench_analyze.py:280`):

    J = ½ · m · r²
    (disc's inertia) = ½ × (mass) × (radius)²

and the rotor's inertia comes out in proportion to it (`bench_analyze.py:64`). `BENCH.md:6` says the light cap will do as the disc. A cap with a skirt carries its mass outward: this one's inertia, from the model, is 1.178 times the formula. If the cap stands in for the disc, either print a plain flat disc for that test, or hand the analyzer the radius that makes the formula true:

    r = √(2 · J / m)
    (radius to give the bench) = √(2 × (inertia from the model) ÷ (mass))

For this cap, `--disc-radius 0.0434`, not `0.040`. Both ways want 100 % infill: with sparse infill the walls are solid and the core is not, and no formula of mass alone holds.

**2. Two different motor masses.** `proofs/motor-numbers/motor_numbers.mjs:6` reads the datasheet as 195 g; the shop page on 2026-10-20 and `PARTS.md:13` say 209 ±0.5 g. Only the rotor-inertia guess in that file leans on it ("~80 g of the 195 g is the bell"), and the bench replaces that guess anyway. Worth a line on the next cycle.

## Gotchas met on the way

1. ImageMagick's own SVG renderer drops `<line>` and `<circle>`: the first preview had no outlines at all. Headless Chrome draws what a browser and Obsidian draw.
2. build123d draws text as glyph outlines, and its SVG writer took 35 of 47 seconds on one sheet's words, under a loaded machine. Writing real SVG `<text>` made the sheets 19 to 40 times smaller (the motor's went from 470 KB to 13 KB) and the numbers greppable.
3. Fusing two bodies erases the seam between them. When the seam is a dimension (the shaft's outside), keep them as two bodies.
4. A diameter dimension must pass through the centre. My first ladder sheet put it 12 mm low, where its arrows measured a chord, and I caught it by eye, not by a check. The sheet module's `diameter()` now takes a centre and a radius, so it can only draw through the centre.
5. build123d's built-in dimensions put the label between the arrows whether it fits or not. The sheet module now moves the arrows outside and the label beside them on a narrow span, as a draughtsman would.
6. Headless Chrome can linger after writing its screenshot while other headless browsers load the machine. The build waits for the file, then closes it, with a throwaway profile each time.
7. `Mesher().read` turns every STL triangle into a CAD face and took minutes; a signed-volume sum in numpy takes milliseconds.
8. SVG collapses runs of spaces, and Chrome ignores `xml:space` on a group; runs are written as no-break spaces.
9. The same source gave different bytes: OCCT hands back the hatch lines in a new order each run, and STEP files stamp the time they were written. Sorted hatch lines and a fixed STEP date make two builds byte-identical (SVG, STL, STEP and `check.json`, checked 2026-10-20), so a git diff of a sheet shows only what changed in the part. The PNG previews are Chrome's and are not held to this.

## The honest cost

- **Host:** `mac`, CPU only. No GPU, no network after the install. Chrome for previews (already installed); JetBrains Mono for the house face (installed; falls back to any monospace).
- **Footprint:** a 581 MB venv; about 20 s for three sheets.
- **Licenses:** build123d Apache-2.0; the OCP bindings Apache-2.0; OpenCASCADE itself is LGPL-2.1 with an exception (general knowledge, not read here); ezdxf MIT; FreeCAD LGPL-2+ (its own banner). Nothing blocks a published drawing or a sold part.

## Where it would live

A new Specialist, **CAD Drafter** (tool build123d, status stub), drafted at `Shop/Shopkeeper/drafts/CAD Drafter — draft.md` with its test plan beside it. What an elder does to land it is in `Shop/Shopkeeper/drafts/CAD Drafter — proposal.md`. On 2026-10-20 Loudon agreed the commission's line: this probe names the gap and stays a probe, and the Handwheel's real drawings become the Specialist's first job, sent through the [[Maker]].

## My read

I'd bet a real brief on this, for any part that bolts to a datasheet or a caliper reading. It is not a place for Loudon to sketch freehand; that's FreeCAD, already here, opening the same STEP. What I haven't shown is a part with holes and flats: everything here is turned on an axis. The mount block, once the base pattern is measured, is the honest next test, and it would be the new Specialist's first job.

## Files

- `handwheel_dims.py` (every number and its source) · `handwheel_parts.py` (the solids) · `drawing.py` (the sheet: views, sections, dimensions, the house's drafting skin) · `build.py` (sheets, checks, exports) · `freecad_probe.py` (the second candidate)
- `out/`: three sheets as SVG and PNG; STEP for each part; STL for the ladder only; `check.json`; `freecad_probe.json` and the DXF page FreeCAD made headless
