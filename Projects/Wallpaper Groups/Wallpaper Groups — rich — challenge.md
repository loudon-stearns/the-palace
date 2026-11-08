---
title: "Wallpaper Groups — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Wallpaper Groups]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Wallpaper Groups' first rich face: a verdict and a reason for every piece, each offer recomputed, and what the maker missed, so the next round starts from what was checked rather than what was claimed."
---

# Wallpaper Groups — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, who did not make this face. I judged the page at `Projects/Wallpaper Groups.md`, the manifest, the four pieces and the maker's commit body (5d274414), nothing else.

**Verdicts: 3 keep, 1 remake, 0 retire.**

## The pieces

### which turns fit (The Seventeen Symmetries) — keep

- **Test or decoration?** A test, twice over. Step 4 gives a real proof of the restriction: a shortest step turned both ways sums to 2·cos(360°/n) times itself, and a lattice step along a shortest step is a whole multiple of it. Step 5 counts the seventeen against the section's list, and that count could have come out the other way. It doesn't. The section's numbers are wrong for its labels.
- **Faithful?** Yes. It agrees with the text where the text is right (no five-fold, no seven-fold, seventeen in all) and disagrees, through an offer, where it isn't. The pentagon step says plainly that the gap is the surface and the lattice is the real reason.
- **Walks up?** Yes: one quarter-turn, then any turn, then the fifth-turn, then the proof, then the count.
- Note, not a remake: the verdict line names the section's 4, 5, 3, 5 as highest turn "4, 5, 3, then 3 + 2", which merges the quarter-turn and sixth-turn groups. A second reading fits the same numbers just as well, maybe better: none 4, half 5, square family 3 (p4, p4m, p4g), hexagonal family 5 (p3, p3m1, p31m, p6, p6m). The count alone can't tell the two apart, so the line could name both.

### one tile (The Prism Machine Principle) — keep

- **Test or decoration?** Half and half, and it says so. "Nothing added but operations" is shown by construction, not tested. The kaleidoscope half is a real test, and it partly fails. Turn the tile and, in the 12 groups with a mirror or glide, exactly half the copies turn the other way. Exactly half has to be true: the turning-only operations are an index-2 subgroup.
- **Faithful?** Yes, with one note. "No copy's centre moves" is how the piece is built (each copy turns about its own centre), not something it found. In a real kaleidoscope the fragment orbits the axis too. The finding still holds either way: the reflected images counter-turn, and the mirrors never move. The verdict text already leans on "its lattice, centres and mirrors stay put", which is the honest form.
- **Walks up?** Yes: the tile alone, then slides, turns, reflections, the nine combined, and all seventeen.
- Silent. Its "keep turning" loop runs on animation frames, which stop on a hidden tab.

### rhythm on a strip (Musical Symmetry) — keep

- **Test or decoration?** A test, and a good one. Step 5 puts the rhythmic impossibility sentence to loops of 16, 15 and 20 steps, and it fails in two of the three.
- **Faithful?** Yes, with one overgenerous line. The verdict "In a 16-step bar the section is right" is true only on the 16-step grid. Five evenly spaced quintuplet hits in a 4/4 bar are five-fold, and the loop has no gap. A one-word fix, "grid" for "bar", can come in the next round. It doesn't need a remake.
- **Walks up?** Yes: one cell, then backwards against half-turn on one line, then two voices, then the clock, then five-fold.
- Sound behaves. No AudioContext exists before the click. Play gives `running`, a step change stops it, and hiding the page leaves the context `suspended` (the kit's hush).

### one p4m cell (gathered, Alhambra margin) — remake, caption only

- **Test or decoration?** Decoration, but anchored. Bodner (2013) does photograph a p4m dado in the Mirador de Lindaraja (checked in the paper), so it makes one group's presence there concrete.
- **Faithful?** The caption misdescribes the drawing. It says "eight copies of one comma about a square". The comma (`M 5 30 Q 5 5 30 5 L 30 12 Q 12 12 12 30 Z`) is mirror-symmetric about its own diagonal, so it sits on p4m's diagonal mirror. The eight `<use>` elements pair up exactly, and the render shows four shapes per cell, not eight. The pattern is still p4m. Caption to write: "One p4m cell. The comma is itself symmetric about a diagonal, so it sits on a mirror and shows four times per cell, not the eight a general motif would. Four-fold centres lie on the mirrors. Bodner (2013) photographs a p4m tile dado in the Mirador de Lindaraja. The sheet's own line calls p4m the most symmetric group; p6m is, with twelve copies to p4m's eight." The flag on "most symmetric" is right: p6m's point group has order 12, p4m's has 8.

## Checks run

- `conform.mjs "Wallpaper Groups"` gave 3 pages, introduced 3, **errors 0, warnings 0**, with the browser pass at 760 and 1130 px. The maker's three warnings were untracked files, and the commit cleared them.
- `fingerprint.mjs "Wallpaper Groups"`: all four sections that carry pieces are **in step** (3c5a52e1417d, 579945b65c74, bbb532baeb7f, 4783bd7c2347).
- Ran `rich-server.mjs --detach` on the worktree and loaded the face headless in Chromium, then stopped the server. Three iframes at their anchors (heights 1208, 650, 1205), the SVG in the margin, 4 proposal chips, nothing in "Lost its place", no broken-file boxes, and **the console clean**. I drove each piece to its last step there. which turns fit read "1 · 3 · 4 · 9" against "4 · 5 · 3 · 5". one tile read 5 with you (p1 p2 p4 p3 p6) and exactly half against in 12. rhythm on a strip read gap 1 at 16 steps, then 5-fold yes at 15.
- `workshop/rich-checks.mjs`: all PASS on the pieces' own engines.
- I wrote an independent recount from the standard tables, without the maker's engine, and it agreed on every number below.

## The offers

1. **Count breakdown: confirmed.** By lattice: oblique 2 (p1, p2), rectangular 5 (pm, pg, pmm, pmg, pgg), centred rectangular 2 (cm, cmm), square 3 (p4, p4m, p4g), hexagonal 5 (p3, p3m1, p31m, p6, p6m). By highest turn: none 4 (p1, pm, pg, cm), half 5 (p2, pmm, pmg, pgg, cmm), third 3, quarter 3, sixth 2. By the section's own kinds, counting glides as reflections: 1, 3, 4, 9. The page's 4, 5, 3, 5 is the highest-turn split with two bins merged, either quarter + sixth or third + sixth (the hexagonal family). The first line also contradicts itself: "4 with no symmetry except translation: p1" names one group. The proposed fallback, splitting by turn into five lines (4, 5, 3, 3, 2), avoids having to pick a merge.
2. **Kaleidoscope lockstep: confirmed.** The groups with no reflection or glide are p1, p2, p3, p4 and p6, so **5**. The other 12 each reverse exactly half the copies. The three-mirror kaleidoscopes check out: 60-60-60 gives p3m1, 45-45-90 gives p4m, 30-60-90 gives p6m. The common two-mirror kaleidoscope makes a finite rosette, not a wallpaper group at all, and its reflected images counter-turn too. The proposed sentence stands.
3. **Escher/Coxeter 1985 and all 17: confirmed. The sentence is wrong, not just unsourced.** Escher was a graphic artist and died on 27 March 1972. He visited the Alhambra in 1922 and in May–June 1936, and he met Coxeter at the 1954 ICM in Amsterdam. No 1985 count by either exists. The record, checked in the sources:
   - Grünbaum's Notices piece (vol. 53 no. 6, June/July 2006) gives Müller 1944 as twelve. Grünbaum found her twelve plus one more on his 1983 visit, so 13. He disputes Montesinos's all-17 (book, Springer 1987).
   - Bodner (Bridges 2013, from a 2003 site visit) gives Müller as 11. She gives Grünbaum, Grünbaum and Shephard 1986 as "at most 13", missing p2, pg, pgg and p3m1. She names Pérez-Gómez (Comput. Math. Appl. 14, 1987) with Montesinos as the all-17 claim. Her own count is 14, missing p2, pmg and p3m1. She also says all 17 occur in Islamic ornament worldwide, but not at one site.
   - One small fix to the offer's wording: "a single tile" as a counting criterion is Bodner's (she excludes a single p3m1 tile in the museum), not Grünbaum's. Grünbaum's objections are colour, interlace and inconsistent criteria. The offer's proposed sentence is otherwise accurate.
4. **Rhythmic impossibility: confirmed, with a refinement.** 16 mod 5 = 1, and 15 mod 5 = 20 mod 5 = 0. The causes differ. In the plane, five-fold fails for *every* lattice, because 2·cos 72° = 0.618 is not whole. On a looped grid, a turn of the clock is a slide in time, and k-fold fits whenever k divides the loop's length. Off the grid it always fits (quintuplets in 4/4). Two refinements to the proposed text:
   - "A 16-step bar can't hold it" should read "a 16-step grid".
   - The real shadow of the crystallographic restriction on a strip is stricter and different. A line's only point symmetries are the identity and the half-turn/reversal, and that limit is why there are 7 frieze groups. The piece's steps 2 and 3 already show it, so the offer could say so.
5. **Rhythm is a frieze, not a wallpaper group: confirmed, and the page claims it literally.** It says "is a wallpaper group in time" (line 77) and "The mathematics is identical" (line 85), and line 34 says "This is not a metaphor". Kick-snare-kick-snare (low 0, 8; high 4, 12 of 16) has time mirrors at 0 and 8, glides of 4 and 12 with the voices swapped, and half-turns. That makes it p2mg, given that the voice axis counts as the strip's second direction (a modelling choice the caption states). One caveat for the text: pitch-against-time with a sequence that transposes as it repeats *is* periodic in two directions, so wallpaper groups do reach music there. Only rhythm alone is a frieze.
6. **recipe-p2's n → n+8: confirmed.** recipe-p2.md:16 gives the rule, and :3 calls it a 180° rotation. On the first half {0, 1, 4, 6} the rule makes {0, 1, 4, 6, 8, 9, 12, 14}: period 8, no mirror in time, p1. It is a half-turn of the *clock face*, which on the strip is a slide. The recipe's own words at :16, "mirror each hit's position and invert its placement", describe the true half-turn, so the recipe's prose and its formula disagree with each other.
7. **Ewe bell E(5,12): confirmed.** Positions 1, 3, 5, 6, 8, 10, 12 are **7** onsets, with gaps 2 2 1 2 2 2 1. That is a rotation of Bjorklund E(7,12) = {0, 2, 4, 6, 7, 9, 11}. E(5,12) has 5 onsets. No 3-fold: shifting by 4 doesn't land the bell on itself, and 7 onsets can't split into three equal turns anyway. `no-claim-edit` is the right kind for the label fix.
8. **Shubnikov ≠ double groups: confirmed.** Shubnikov (Heesch–Shubnikov) groups are the antisymmetry groups, also called black-and-white or magnetic groups: an operation may also swap two colours. In the plane there are 80: 17 ordinary, 17 grey and 46 two-colour. Double groups (Bethe, 1929) extend point groups for half-integer spin, which is a different construction. Two more threads for whoever carries this home:
   - In physics the colour swap *is* time reversal (the 1′ of the magnetic groups). The page's next bullet, "Time-reversal symmetry", is the same thing split off and mislabelled as repetition in time.
   - Müller's 1944 thesis also studied "the eighty groups of the two-sided Euclidean plane" (Grünbaum, footnote 3). These are the same 80, so the Alhambra's first counter was already working in Shubnikov's territory.

## What the maker missed

These are for a later round, not the manifest.

- **Polyrhythm is not incommensurate** (line 81). 2 against 3 repeats every 6 subdivisions and 5 against 7 every 35. Both ratios are rational and commensurate, and line 79's own least common multiple says so. The Lissajous comparison holds only for irrational ratios. This is a claim-change.
- **Every crystal and every tiling in nature in the 17/230** (lines 34, 40, 63). Quasicrystals are crystals under the IUCr's 1992 definition. They are ordered but not periodic, have five-fold or icosahedral symmetry, and occur in nature (icosahedrite, Khatyrka meteorite). Lu and Steinhardt (Science, 2007) found quasi-periodic girih tilings at the Darb-i Imam shrine (Isfahan, 1453). The same Islamic craft tradition that found many of the seventeen also stepped past the periodic limit. That is the page's best open door: a piece that puts "Nature enforces this" next to a Penrose tiling would be a test, not decoration.

## The face as a whole

It makes the idea felt. Each made piece is a short walk that ends on something the reader can check against the text, and all three checks bite: the count, the kaleidoscope, the five-fold loop. Nothing is busy for its own sake, and all three pieces share one look and one rail. The face's strongest move is the rhythm piece's step 2, where a single line can't tell a half-turn from a reversal. That moment teaches why time has seven groups and the plane seventeen better than any sentence on the page. The weak spot is the gathered sheet: decoration in an Alhambra section whose real problem is a history the face can only fix by offer. The offers carry that well. Eight offers on one page is a lot, though, and they all point the same way: the text treats a strong analogy as a literal identity. Loudon may want to take them together as one rewrite of the musical and Alhambra sections rather than as eight patches.
