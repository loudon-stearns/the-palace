# A2 — Shop Gotchas to tuning ledgers

Lane A2 of the 2026-11-08 Weave, carrying flag `commons-the-palace-1794143281804` (and by-touch `commons-the-palace-1792347287670`). I followed FLUX's shape (`4ebbfc08`) for every ledger: §8 frontmatter, `ledger: tuning`, an eight-key `standards` block, `## From <job> — <date>` headings, numbered items that end "Changed: …". All eight ledgers are new. None of my pages had a steward's ledger already. No git writes.

**One place I left FLUX's shape, on purpose.** FLUX dropped its `last_tested` date and wrote no run line ("seeded history carries no run lines"). The brief asks for `last_tested` to become the first run line, so each ledger has one. That keeps the date: the scroll and `run-tests.mjs` now compute "last tested" from run lines (`_ops/stigmergy/orchestrator/src/ledger.js:117`, `Shop/Maker/run-tests.mjs:13-17`), so without a run line the date would be lost. Every run line parses with `parseRuns`. Matplotlib and Observable Plot use the harness's own wording (`smoke test on mac · nothing new`), because their 2026-06-16 date came from `run-tests.mjs --write-back` (`d43c398d`), and their `standards.writes` names the harness. The FLUX ledger is still the one page in the shape without a run line.

## Matplotlib
- Ledger: `Shop/Matplotlib/Matplotlib — tuning.md` (new).
- Moved: 3 dated items (2026-05-10). Run line: `2026-06-16 · smoke test on mac · nothing new`.
- Section now states 4 rules under 2 topics: Motion when Manim can't host; Writing video.
- Removed: `last_tested: 2026-06-16`, `last_gotcha: 2026-05-10`.
- Unplaced: none. The 2026-05-30 Smoke and Determinism pass stays on the Test Suite and has no run line. The ledger's opening says so.

## Mermaid
- Ledger: `Shop/Mermaid/Mermaid — tuning.md` (new).
- Moved: 2 dated items (2026-05-26). Run line: `2026-05-26 · Kuramoto coupling-regime diagram, sketch · taught items 1, 2`.
- Section now states 3 rules under 2 topics: Delivery; Labels.
- Removed: `last_tested: 2026-05-26`, `last_gotcha: 2026-05-26`.
- Unplaced: none. The `npx` finding from 2026-05-30 is on the Test Suite, not in Gotchas, so I left it there.

## OBS
- Ledger: `Shop/OBS/OBS — tuning.md` (new).
- Moved: 5 dated items. The page had all five as 2026-09-02, and its italic lead said "the four below". **Correction from git:** the meter-tap item was found on 2026-09-07 (`fe85bf47`, "the level check was reading the wrong tap"), so the ledger files it under that date. That commit also added a hot-input check (OBS cannot un-clip what arrives clipped). It is in the ledger item only, not added to the page as a rule. Run line: `2026-09-02 · building the LDN RTM recording rig, recorded · taught items 1, 2, 3, 4`. The 09-07 find has no run line.
- Section now states 5 rules under 4 topics: Transforms; Profiles; Capture; Audio meters. The "no streaming scars yet" caveat stays as the section's opening, after the ledger link.
- Removed: `last_tested: 2026-09-02`, `last_gotcha: 2026-09-02`.
- Unplaced: none.

## Observable Plot
- Ledger: `Shop/Observable Plot/Observable Plot — tuning.md` (new).
- Moved: 3 dated items (2026-05-29, the Flocking job). Run line: `2026-06-16 · smoke test on mac · nothing new`.
- Section now states 6 rules under 4 topics: Loading; Motion; Facets and scales; Tooltips and legends.
- Removed: `last_tested: 2026-06-16`, `last_gotcha: 2026-05-29`.
- Already rules: the undated "Earlier watch-list (still valid)", four bullets. They stay on the page as rules. The first one (consistent facet domains) is merged with dated item 3, which confirmed it.

## RNBO codebox~ smith
- Ledger: `Shop/RNBO codebox~ smith/RNBO codebox~ smith — tuning.md` (new, **empty**: frontmatter and an opening line only).
- Moved: 0. There were no runs and no gotchas, and the ledger's opening says so. No run line.
- Section now states 0 rules. It reads "No rules yet: no brief has landed", links the ledger, and points to the rnbo-codebox skill as before.
- Removed: `last_tested:` and `last_gotcha:`. Both were empty.
- Judgment call: by the flag's own decision this page hadn't outgrown its Gotchas. I gave it an empty ledger because the flag's check and scope (`^last_gotcha:`) include it, and because a ledger lets the first job's run line land. If the coordinator would rather a stub not have one, delete the ledger file and the link sentence. Removing the two fields stands either way.

## Remotion
- Ledger: `Shop/Remotion/Remotion — tuning.md` (new).
- Moved: 2 dated items (2026-05-26). Run line: `2026-05-26 · Kuramoto phenomena walk, study · taught items 1, 2`.
- Section now states 2 rules under 2 topics: Project setup; Composition.
- Removed: `last_tested: 2026-05-26`, `last_gotcha: 2026-05-26`.
- Unplaced: none. The page said "hand-write the four files" but named six. The rule lists them without a count.

## SAM
- Ledger: `Shop/SAM/SAM — tuning.md` (new).
- Moved: 0 from Gotchas. **Its Gotchas were already rules**: three undated bullets, which stay as they are. I added only the opening line that links the ledger. The ledger holds two items for the 2026-06-25 layer-decomposition session, taken from § The wall (proven 2026-06-25; deposit `50ef378f`): line art failed on BLUELINE shot 02, and converted images segmented sharply (30/26/22 regions on photoreal, 44/47/25 on flat-cel). Run line: `2026-06-25 · layer-decomposition session, BLUELINE shot 02 and three test scenes, probe · taught items 1, 2`.
- Section states 3 rules (unchanged).
- Removed: `last_tested: 2026-06-25`, `last_gotcha: 2026-06-25`.
- Unplaced: § The wall itself. It is the dated finding but not part of Gotchas, so I left it on the page as written. The ledger says which run the three Gotchas bullets came from but does not claim that run showed each one.

## Stable Audio Open
- Ledger: `Shop/Stable Audio Open/Stable Audio Open — tuning.md` (new).
- Moved: 4 dated items, filed as 6 numbered items. Three from 2026-05-26 (migration and install, the model split, flash_attn). The 2026-09-25 model-card re-check covered three things (inpainting, the Gemma licence layer, lighter routes), so it is split into items 4–6. That re-check came from a Shopkeeper draft that landed in `94ac3e88`. Run line: `2026-05-26 · Kuramoto Round 1 atmospheric beds and synchronization-arriving, small-music + small-sfx, sketch · taught items 1, 2, 3`.
- Section now states 11 rules under 5 topics: Before installing; Install and run (Mac); Choosing a model; Licence; Untested routes.
- Removed: `last_tested: 2026-05-26`, `last_gotcha: 2026-09-25`. `migrated_from` and `migrated_at` are untouched.
- Already a rule: the undated bold line "When a model family is a few days old, check for a newer one before installing." It stays as a rule, and item 1 records where it came from. The two "(§ Gotchas)" pointers in Open Questions still resolve: the selection heuristic and the Gemma layer are both still in the section.

## Checks
- All eight ledgers and all eight pages parse as YAML; each ledger's `title` matches its filename; none of the eight pages still carries either field.
- `lint-bundle-hygiene.py .`: 0 errors (14 warnings, none mine). `lint-ghost-links.py .`: 0 errors, and no warning names my files.

## What remains

```
$ command grep -l '^last_gotcha:' Shop/*.md
Shop/Kokoro.md
Shop/LaTeX.md
Shop/Manim CE.md
```

All three are A1's (perhaps still in progress); none are mine. Outside any lane: `Shop/Figure Rig.md` still carries `last_tested:` with no `last_gotcha:`, so the flag's `^last_gotcha:` pattern misses it. It belongs to the by-touch flag `…1792347287670`.
