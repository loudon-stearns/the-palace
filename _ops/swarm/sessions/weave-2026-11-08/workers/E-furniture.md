# Lane E — tab icons and browser furniture, 2026-11-08

Flag `commons-stale-worktree-remainder-4a8a3b-1793750726779`, home [[Loudon Live Design System]] (§ The house style, the Furniture line). Read the page whole, then `_ops/furniture-fanout/report.md` (§ Summary, § For Loudon, § Left alone) and both scripts' source.

## In one breath

The census reads 587 tracked HTML pages; on 2026-11-03 it read 521. **44 failed the check. 40 are furnished now. 4 are held back**: one is an original kept unchanged, and three carry a tab icon that points at a file that isn't there, which the script can't fix. After the run, the check is clean except those four and what § Left alone excuses.

Files: `workers/E-census-before.txt`, `workers/E-furnish-log.txt`, `workers/E-census-after.txt`. Each census file holds the census summary and then the brief's check run over that census (a scratch checker that imports `furnish.LEAVE`).

## Found wanting: 44

What each page lacked is in `E-census-before.txt` § Fail. In short:

- **Rich-face pieces with no furniture block (18):** Dovetail Joint ↔ Counterpoint (remove one voice) · Embeddings as Relational Meaning (directions, regions) · Hyperdimensional Prism (angle or object, one object or four) · Palace Conatus (three pieces) · Pheromone Trail (three) · Agnes Martin (the grid holds still) · Biomechanical Synthesis (negative space, two faces) · Spinoza Conatus (two) · The Dichotomy of Control (the hand on the platter).
- **Whole pages with no furniture, mostly also no icon or theme-color (22):** the seven Dissolutions learning-sequence pages (`proofs/2026-10-25-learning-sequences/`) · BLUELINE `tempo-map/proofs/tempo-map.html` · Cycle 5 Explorer `class/class-run-sheet.html` and `workshop/back-row/back-row-report.html` · Floquet Time-Modulated Loops `Gentle Resonator — play`, `Floquet Kernel — play` · Haptic Handwheel `firmware/box-day.html` · Preset Oracle's five built pages (vetting table, archive reading, encounter journal, encounter sheet, the oracle) and `original/oracle.html` · SMPTE LTC `hostile/report.html` · Slime Mold Delay `plugin/proofs/dish-performance.html` · Synth Templates `house-bass-on-three-synths.html` and `workshop/site/index.html`.
- **Icon missing only (1):** Floquet `comb/Pumped Comb — two pumps.html`.
- **Icon pointing at a file that isn't there (3):** see "Hand edits owed".

## Furnished: 40

`furnish.py --apply` with the 40 exact paths as its prefixes, not `--all` (see the second bug below). That added 40 furniture blocks (all inlined, none linked), 18 avatars as tab icons, 34 theme-colors and 6 `lang="en"`. No rich piece got an icon. The pages under Cycle 5 Explorer and Synth Templates got none either, because those entries have no avatar yet. The diff is 40 `.html` files, +1424 −8 lines. The 8 removed lines are the six `<html>` tags that gained `lang`, one doctype line, and one rule in Pumped Comb that the refresh widened to cover checkboxes.

## Left alone (furnish.py's LEAVE rules): 45

- 22 templates a script fills in: the same 22 as on 2026-11-03.
- 15 STIGMERGY-dressed pages: the 10 from 2026-11-03, plus five new STIGMERGY rich pieces (one line two readers, one pass, say done or show done, the field, the fumble and the scent). I opened `one pass`: it carries no `.bbs-` class, but it wears phosphor on black in VT323 and IBM Plex Mono. The rule catches it by its path, and correctly.
- 6 records of past runs, and 2 pieces of machinery: unchanged.

Also without an icon, by decision:
- 271 rich-face pieces.
- 18 pages whose entry has no avatar yet: Cycle 5 Explorer 7, Rational Hearing 5, Synth Templates 3, Resonance and Damping 2, The Gallery 1.

## Held back: 4

- **`Projects/Preset Oracle/original/oracle.html`**: Loudon's own oracle page. The scroll lists it as "Loudon's original oracle, kept unchanged" (`Projects/Preset Oracle/Preset Oracle — scroll.md:123`, `:151`), and so does `deck/README.md:3`. None of the LEAVE rules knows about it, so `--all` would furnish it. I left it alone. Whether it stays as made is Loudon's call.
- **The three pages with broken icon links.** The script keeps any icon a page already has, so it can't repair these, and applying it would only have rewritten their furniture blocks (below).

## Hand edits owed (3, icon paths only)

- `Projects/Neural Granular Synthesis/plugin/proofs/crowd-tunnel-crt.html:14`: `../../VST%20Template%20%E2%80%94%20icon.png` → `../../Neural%20Granular%20Synthesis%20%E2%80%94%20icon.png`
- `Projects/Wavetable Scanner/plugin/editor-mock.html:14`: same broken href → `../Wavetable%20Scanner%20%E2%80%94%20icon.png`
- `Projects/Wavetable Scanner/synth/page.html:17`: `Wavetable%20Scanner%20%E2%80%94%20icon.png` → `../Wavetable%20Scanner%20%E2%80%94%20icon.png`

**Where the first two come from:** `Projects/VST Template/machinery/ui/editor.html:14` carries `../../VST Template — icon.png`. That path is right for the template itself, but every plugin face copied from it inherits it. The fix belongs to whoever owns the scaffold, which should swap in the new plugin's own avatar. Until then, every new plugin repeats the bug.

## Spot checks (three chosen at random, seed 20261108)

- **`Projects/Biomechanical Synthesis/Biomechanical Synthesis — rich — negative space.html`**
  - `<html lang="en">` on line 8; theme-color `#0a0a0f` on line 13.
  - The `<style data-furniture>` block opens on line 16, ahead of the page's own `<style>` on line 46, inside `@layer furniture`.
  - No icon, which is right for a rich piece.
- **`Projects/Preset Oracle/deck/Preset Oracle — vetting table.html`**
  - `lang="en"` on line 2; theme-color `#0a0a0f` on line 8.
  - `rel="icon"` on line 9 → `../Preset Oracle — icon.png`. `ls` finds it in `Projects/Preset Oracle/`.
  - The furniture block on line 10 comes before the page's `<style>` on line 47.
- **`Palace Conatus/Palace Conatus — rich — whoever arrives next.html`**
  - `lang="en"` on line 10; theme-color on line 17.
  - The furniture block on line 18 comes before the page's `<style>` on line 51.
  - No icon (rich piece).

None of the three links a token sheet, so the inline route applies. The brief's "controls.css after the token sheet" has nothing to test on them. I also read the two one-line pages, SMPTE `hostile/report.html` and BLUELINE `tempo-map.html`. Each got a well-formed `<html lang="en">`, the theme-color and icon, and its block after `<meta charset>`. Both icon files exist.

## Bugs in the census and script

1. **The date is hardcoded.** `furnish.py` sets `TODAY = '2026-11-03'`, so all 40 pages furnished today say "inlined … on 2026-11-03". `census.py` likewise prints "read 2026-11-03" on every run.
2. **`--apply --all` rewrites blocks that are already in place.** Any page with a `data-furniture` block gets it recomputed and rewritten. My dry run, which patched `write_text` in scratch, showed `--all` would change 65 pages: 43 of the 44 that fail, plus **22 that already pass**. That contradicts the script's own docstring: "A page already carrying any of these keeps its own." The worst cases:
   - **Songlines `two-walkers`:** its hand-tuned block, with Amber Lab literals (`#a59880`, `#e8651b`), would be swapped for borrowed tokens.
   - **The two VST-derived plugin faces:** they would be re-dressed from Loudon Live to Drafting Table (see 3).
   - **Older pages whose block has drifted:** Particle Synthesis' 2026-09-23 lesson, three Portamento listening pages, three Wallpaper Groups pieces, three SMPTE LTC pieces and others would change too.
   The 22 passing pages it would rewrite:
   - Frequency Domain ↔ Perspective Shift (one kick, two views)
   - Leverage Points Framework (two pieces)
   - Crystal Synthesizer `proofs-menu.html`
   - Generative Sample Libraries `ai-source-probe/` (compare, compare.prompt-shape, report.mock)
   - Particle Synthesis `2026-09-23-particle-synthesis-lesson.html`
   - Portamento (`single-session-reel`, `loudness-listening`, `mode-locking-listening`)
   - SMPTE LTC (backward, encoder, the teaching room)
   - Semantic Delay `listening-sheet.html`
   - Synth Templates (which knobs are which)
   - Wallpaper Groups (recipe-p3, recipe-p6, recipe-pm)
   - Tone.js (sixty pushes)
   - Songlines (two-walkers)
   - The Lens `woken-glasses.html`

   Deciding whether `--all` should refresh, or only fill what's missing, is a code change for the owner of the fan-out.
3. **The dress test can contradict itself.** A page with both `skin-graphite` and a `data-theme` toggle is classed Drafting Table, because the theme wins. Its ground, though, is read from the skin (`census.py`, `classify`). `crowd-tunnel-crt.html` and `editor-mock.html` are both cases.
4. **The plan counts overstate the work.** `--plan` lists "controls.css (inline)" for every page not on a token sheet (532), including pages that already carry the block.
5. **There is no `--dry-run`.** `--plan` comes closest, and it writes `plan.json`. `census.py` writes `census.json` and `census.md`. All three are tracked and none is `.html`. I put all three back to their committed bytes once I was done, so the coordinator can run `census.py` again if it wants them current. My before and after copies are in the scratchpad.
6. **The census doesn't check that icons resolve.** It checks only that `rel=icon` is present, so it misses the three broken links above. LEAVE also has no rule for an original that is "kept unchanged".

## These pages lose their furniture when rebuilt

Each of these is written whole by a script beside it, so the next run of that script wipes its furniture:

- `firmware/box-day.html` ← `build_box_day.mjs` (its template is left alone by rule)
- `class/class-run-sheet.html` ← `build-run-sheet.mjs`
- `workshop/back-row/back-row-report.html` ← `report.py`
- `hostile/report.html` ← `report.py`
- `tempo-map.html` ← `make_proof.py`
- `dish-performance.html` ← `plugin/ui/preview.py`
- Synth Templates `site/index.html` ← `build-site.py`

These generators aren't `.html`, so they were out of my scope. Preset Oracle's `build-deck.mjs` only replaces its deck block, so those pages keep their furniture.

## For Loudon

- Should `Projects/Preset Oracle/original/oracle.html` stay exactly as you made it, or wear the house furniture like the rest?
- When the fan-out runs again over pages that already have a block, should it refresh them or leave them be? This run left them be.
