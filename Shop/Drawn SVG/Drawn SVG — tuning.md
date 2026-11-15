---
title: "Drawn SVG — tuning"
born: 2026-11-15
links:
  - target: "[[Drawn SVG]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Drawn SVG page's record of what drawing by hand has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real drawing taught."
ledger: tuning
standards:
  for: "what drawing SVG from a script taught the Drawn SVG page"
  run: "one figure or set of figures made through the Job Contract, or a probe of a route (a renderer, an animation, a plate)"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Drawn SVG — tuning

What each drawing taught the Drawn SVG page. Each item names what the job showed and what changed because of it, if anything did. Newest last. Items 1 to 6 are the house rules the light round of 2026-11 and the hook pilot's makers learned before the page existed, carried in from draft two of [[The Shop — sketch — the hand's pages]], where each is sourced to [[The Shop — sketch — discovery walk 2026-11-14]]. Seeded history carries no run lines.

## Carried in at birth — the light round of 2026-11 and the hook pilot

1. **Text overflowing or overlapping at band width was the commonest layout fault.** Changed: look at a figure at the size it will be shown.
2. **An unescaped `&` in a title shipped invalid SVG once.** Changed: escape `&` and `<` in every title and label.
3. **A naive frontmatter pattern miscounted pages by one.** Changed: parse frontmatter with a YAML reader when a figure counts pages.
4. **Nearly every fault the challengers found was a caption claiming more than the piece shows.** Changed: a caption states the claim and says what is real and what is a choice.
5. **A count without its source could not be checked.** Changed: a count names its source file and its date, in the figure.
6. **The dvisvgm route from PDF is broken on this Mac** (Ghostscript 10.07; [[LaTeX — tuning]] item 2). Changed: `sips` for SVG to PNG.

## From the split-way test and the birth — 2026-11-15

7. **The copied Drafting Table colours still match the system, and the fonts are a stack, not a file.** *Owed a review: written by the shop-tests-image session outside a ledger review.* The seven hex values on `Enrichment/light-round-2026-11/lib.py` line 10 (and the same line in `make-sound-images.py`, `make-figures*.py`, `make-sounds-2.py`) are paper `#f0eee5` = `--ground-000`, `#1a1916` = `--ink`, `#3a3a35` = `--ink-2`, `#6a6862` = `--ink-3`, `#b8b09a` = `--rule`, `#c8261a` = `--accent` and `--source-measure`, `#dcd9ca` = `--ground-200`, all in `_ops/drafting-table/design-system/colors_and_type.css`, whose last change was 2026-10-21. The SVG font stack (`'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace`) follows the system's `--font-mono` but drops `'SF Mono'` and adds `ui-monospace`; `lib.py`'s PIL sheets use Menlo, not JetBrains Mono. Changed: the card's Wears line says the values matched on this date and are copied, not linked.
8. **A diagram drawn over the busiest part of a generated plate reads poorly; over a quiet part, with a thin dark veil, it reads.** *Owed a review, as item 7.* The fireflies split piece first sat the dials over the band of lights and was moved down to the dark water, with a 28% veil (`Shop/FLUX (Hugging Face)/proofs/2026-11-15-split-way/split.py`). Headless Chrome rasterised an SVG with a base64 plate inside it correctly; `sips` was not tried on it. Nobody but its maker has seen it. Changed: a gotcha on the page.
- run · 2026-11-15 · own hero and icon, drawn (`proofs/2026-11-15-own-face/face.py`), sketch · nothing new
- run · 2026-11-15 · split-way fireflies test, the drawn half and the all-drawn piece (`Shop/FLUX (Hugging Face)/proofs/2026-11-15-split-way/`), probe · taught items 7, 8
