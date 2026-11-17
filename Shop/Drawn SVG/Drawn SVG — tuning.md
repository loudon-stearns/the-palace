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
- run · 2026-11-17 · the second light enrichment round, fifty pieces (1 job: one-drop-a-second; `Enrichment/light-round-2026-11-2/pieces/Stable Audio Open/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: one-rule-two-grounds; `Enrichment/light-round-2026-11-2/pieces/Like Water/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: upstream; `Enrichment/light-round-2026-11-2/pieces/Search Before You Build/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: every-door; `Enrichment/light-round-2026-11-2/pieces/Walk Ceremony/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round, fifty pieces (1 job: one-drop-a-second; `Enrichment/light-round-2026-11-2/pieces/Stable Audio Open/`), sketch · a lesson is noted on the next line, owed a review · by the bench
- from the bench · 2026-11-17 · one-drop-a-second · "The 2026-11-14 drip prompt at seed 1935, re-rendered 2026-11-17 on MPS, gave the same 40 onsets in 26 s by takes.py's detector, and the same single-drop seed (1935) was chosen by third.py's cut rule; the rate is still not held (its first 10 s: onsets 0.2 to 1.3 s apart, in bursts)." · noted by SAO light maker · owed a review
- run · 2026-11-17 · the second light enrichment round, fifty pieces (1 job: one-drop-a-second; `Enrichment/light-round-2026-11-2/pieces/Stable Audio Open/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: one-rule-two-grounds; `Enrichment/light-round-2026-11-2/pieces/Like Water/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: one-rule-two-grounds; `Enrichment/light-round-2026-11-2/pieces/Like Water/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: one-knock-five-rooms; `Enrichment/light-round-2026-11-2/pieces/Mycelial Reverb/`), sketch · a lesson is noted on the next line, owed a review · by the bench
- from the bench · 2026-11-17 · one-knock-five-rooms · "A project's own instrument cannot be named in a chain: the bench refuses anything not on the roster unless it starts with hand, so Mycelial Reverb's engine (Algorithm.h) had to go as a hand link and gets no ledger line of its own" · noted by mycelial maker · owed a review
- run · 2026-11-17 · the second light enrichment round (1 job: one-step; `Enrichment/light-round-2026-11-2/pieces/Walk Ceremony/`), sketch · a lesson is noted on the next line, owed a review · by the bench
- from the bench · 2026-11-17 · one-step · "A page's own icons, embedded as data URIs, make a link diagram read as pages rather than nodes; check every quoted phrase against its source file in the script so a caption cannot drift from the page" · noted by walk-ceremony maker · owed a review
- run · 2026-11-17 · the second light enrichment round, fifty pieces (1 job: one-drop-a-second; `Enrichment/light-round-2026-11-2/pieces/Stable Audio Open/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: same-miss; `Enrichment/light-round-2026-11-2/pieces/Search Before You Build/`), sketch · a lesson is noted on the next line, owed a review · by the bench
- from the bench · 2026-11-17 · same-miss · "A count over the palace's code must search every spelling: the bracket written with spaces (min(dists) * 0.82) was missed in round one, and so was its first file." · noted by sbyb-maker · owed a review
- run · 2026-11-17 · the second light enrichment round (1 job: one-knock-five-rooms-picture; `Enrichment/light-round-2026-11-2/pieces/Mycelial Reverb/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: same-miss; `Enrichment/light-round-2026-11-2/pieces/Search Before You Build/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (1 job: same-miss; `Enrichment/light-round-2026-11-2/pieces/Search Before You Build/`), sketch · nothing new · by the bench
- run · 2026-11-17 · the second light enrichment round (2 jobs: one-knock-five-rooms, one-knock-five-rooms-picture; `Enrichment/light-round-2026-11-2/pieces/Mycelial Reverb/`), sketch · nothing new · by the bench
- correction · 2026-11-17 · the bench line above for one-drop-a-second says onsets "0.2 to 1.3 s apart"; the measurement is gaps of 0.04 to 1.34 s. The same correction is on [[Stable Audio Open — tuning]], where the lesson belongs. · by the Concierge
- note · 2026-11-17 · reading the twenty lines above from the second light round: they are five pieces, not twenty. A job run again leaves a line each time (one-drop-a-second four, one-rule-two-grounds three, same-miss three), and the bench copies a maker's lesson to every Specialist in the chain, so two of the four lessons here are not about drawing: the drip's rate is Stable Audio Open's, and the refused instrument is the bench's. The two that are this page's: a page's own icons as data URIs make a link diagram read as pages; and check every quoted phrase against its source in the script. The jobs every-door and upstream are first versions their challengers sent back; they stay in the workshop and were not placed. · by the Concierge
