# A1 — Shop Gotchas to tuning ledgers (Blender, ComfyUI, D3.js, Depth Anything, Kokoro, LaMa, LaTeX, Manim CE)

Flag `commons-the-palace-1794143281804` (and by-touch `commons-the-palace-1792347287670`). Shape copied from FLUX (`4ebbfc08`): the ledger's frontmatter has the same keys in the same order (`standards`: for / run / line / read / writes / merge / kept / trim); items are grouped under a dated heading with a numbered item for each finding, each ending "Changed: …"; the Gotchas section opens "What … has taught, as it stands today. Which job taught each … is in [[<Entry> — tuning]]", then bold topic leads with bold-lead rules under each. One departure from FLUX, because the brief asked for it: each ledger has exactly one run line, on the date `last_tested` held. FLUX's seeded history has no run lines. All eight ledgers resolve through `ledger.js` `tuningPathFor`, and `lastRunDate` returns the old `last_tested` date for each. YAML parses. Ghost-links, bundle-hygiene, doc-drift and bundle-audit match the baseline.

## Blender
- Ledger: **new**, `Shop/Blender/Blender — tuning.md`. 10 items: 9 from the 2026-06-13 conditioning keystone, plus 1 MPS-drift/install-layout note that came in from operator memory on 2026-07-03 (`83222581`). Run line 2026-06-13, taught items 1–9.
- **Neither rules nor diary: the page had no Gotchas section.** Its dated findings sat in the 2026-06-13 recipe's "Key findings" line and in `tests/gotchas-2026-06-13.md`. I added a § Gotchas between Self-Check and Recipes, in Anatomy order. It holds **10 rules** under Conditioning passes / Staging / Feeding ComfyUI on this Mac / Elsewhere. The recipe's doubled "Key findings" sentence became a pointer. The "More Blender 5.x gotchas…" pointer paragraph moved out of Recipes into Gotchas § Elsewhere. The report file stays where it is, as workshop.
- Removed `last_tested: 2026-06-13`, `last_gotcha: 2026-06-13`.

## ComfyUI
- Ledger: **new**, `Shop/ComfyUI/ComfyUI — tuning.md`. 2 dated items moved (both 2026-05-26); run line 2026-05-26, taught items 1, 2.
- **One item added, not moved:** item 3 (2026-06-13). The `--highvram --use-split-cross-attention` rule was taught by Blender's job; it is in ComfyUI's own bundle (`ComfyUI — local-install` § Launch) but was missing from the page's Gotchas. The page now carries it as a rule and the ledger records where it came from. Drop item 3 and its rule if the coordinator wants only what moved.
- Gotchas: **9 rules**. Install and launch has 3, Polling 1, and the Watch-list 5 (the undated community bullets, kept on the page because they are rules not yet hit; "Install cost is real" folded into "Budget the disk").
- Removed `last_tested: 2026-05-26`, `last_gotcha: 2026-05-26`.

## D3.js
- Ledger: **new**, `Shop/D3.js/D3.js — tuning.md`. 5 dated items moved (2026-05-29, Flocking). Item 5 notes it was rehomed from Surfaces and Capabilities on 2026-10-22 (`a0c481a4`).
- `last_tested: 2026-06-16` is not a job. It is the `run-tests.mjs --write-back` smoke (`d43c398d`), so its run line is `- run · 2026-06-16 · smoke test through Shop/Maker/run-tests.mjs · nothing new`. The ledger's `writes` names the harness too (`run-tests.mjs:13` writes run lines to ledgers).
- Gotchas: **9 rules**. d3-force has 4, Verifying in a harness 1, and the Watch-list 4 (undated, kept).
- Removed `last_tested: 2026-06-16`, `last_gotcha: 2026-05-29`.

## Depth Anything
- Ledger: **new**, `Shop/Depth Anything/Depth Anything — tuning.md`. **0 dated items moved — the Gotchas were already rules.** The 3 ledger items record those founding gotchas' provenance: deposited 2026-06-26 (`50ef378f`) from the BLUELINE shot 02 session. The ledger says plainly that the page doesn't record which ones the session actually hit. Run line 2026-06-25, taught items 1, 2, 3.
- Gotchas: **3 rules**, unchanged; the section now opens with the ledger link. The heading "Gotchas / where I fail" is kept.
- Removed `last_tested: 2026-06-25`, `last_gotcha: 2026-06-25`.

## Kokoro
- Ledger: **new**, `Shop/Kokoro/Kokoro — tuning.md`. 9 dated items moved: 5 from 2026-05-10 and 4 from 2026-05-26. The page had them out of order; the ledger puts them in date order. Run line 2026-05-26, taught items 6–9.
- Gotchas: **9 rules**. Install has 1, Calling it 4, Pronunciation and prosody 2, Loudness 2. § Install's "see gotcha below" still resolves.
- Removed `last_tested: 2026-05-26`, `last_gotcha: 2026-05-26`.

## LaMa
- Ledger: **new**, `Shop/LaMa/LaMa — tuning.md`. **0 dated items moved — already rules.** Same treatment as Depth Anything: 3 provenance items, run line 2026-06-25, taught items 1, 2, 3.
- Gotchas: **3 rules**, unchanged, plus the opening ledger line.
- Removed `last_tested: 2026-06-25`, `last_gotcha: 2026-06-25`.

## LaTeX
- Ledger: **new**, `Shop/LaTeX/LaTeX — tuning.md`. 1 dated item moved (the 2026-06-09 capability probe). Run line 2026-06-09, probe, taught item 1.
- Gotchas: **7 rules**. The PDF path has 1, The SVG-cutout path 2, and the Watch-list 4 (undated, kept). The pointer under § Limits ("see the 2026-06-09 dvisvgm gotcha") is repointed to the bridge under Gotchas.
- Removed `last_tested: 2026-06-09`, `last_gotcha: 2026-06-09`.

## Manim CE
- Ledger: **new**, `Shop/Manim CE/Manim CE — tuning.md`. **8 dated items moved**: 2026-05-10 ×1, 2026-05-26 ×4, 2026-05-30 ×2, 2026-06-09 ×1.
- **3 more lessons restored from git**, which `Manim CE — Context` said were waiting for this ledger:
  - the 2026-05-10 Python 3.14 gotcha and the 2026-05-30 "basictex alone" gotcha, which the 2026-10-24 Weave removed as doubles (`a75350ec`);
  - the K_c miscalibration (`a94481f0`, fixed in `071ae3b7`);
  - the recipe's doubled frozen-arrow bug story, folded into item 3.
- 11 items in all. Run line 2026-06-09, probe, taught item 11.
- Gotchas: **13 rules**. Install has 1, Animating 1, Text and type 3, Narration 1, Tier budgets and layout 2, and the Watch-list 5 (undated, kept). Two pointers to "the 2026-05-30 tier-cost gotcha", one in Recipes and one in Test Suite, now point at § Gotchas and the ledger.
- `Manim CE — Context` (same bundle): three lines that said "no ledger yet" or "waiting for the ledger" now say where things went.
- Removed `last_tested: 2026-06-09`, `last_gotcha: 2026-06-09`.

## Not placed / seen, left alone (outside the Gotchas sections)
- **Kokoro § Capabilities contradicts the new rules.** It still shows the ARPABET `/HH AH/` override example and claims output at 16 / 24 / 48 kHz. The Gotchas now warn against the example; the page body is not fixed.
- **Test Suite "Last run" dates disagree with `last_tested`.** ComfyUI, Kokoro and Manim say 2026-05-30, later than `last_tested`; D3.js says 2026-05-30, earlier than its 06-16 smoke. I wrote run lines only for the `last_tested` dates, as the brief says. Run lines for the Test Suite runs could be added if wanted.
- **A load-bearing finding outside Gotchas.** Kokoro § Test Suite's determinism finding (not byte-deterministic; the reproducibility artifact is text + voice + version + LUFS target) is a rule-shaped fact. It is not stated in Gotchas.
- **Version mismatch.** ComfyUI `tool_version: 0.3.x` vs `ComfyUI — local-install` pinning 0.22.0. Frontmatter is untouched apart from the two fields, per the brief.
- **Two chances to tidy further.** Blender's `tests/gotchas-2026-06-13.md` now overlaps the ledger; it is kept as the job's full report. Manim's "(see the foreign-updater gotcha above)" in Recipes still resolves to the Animating rule.

## Check
`command grep -l '^last_gotcha:' Shop/*.md` → (no output, exit 1). None of mine remain, and none of A2's or A3's either at the time of the run.
