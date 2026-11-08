# Lane A — Gotchas move to a tuning ledger, every Shop page (writes the house: your pages and their bundles only)

Read `PREAMBLE.md` beside this file first. This brief is shared by three writers, **A1**, **A2**, **A3**; your dispatch names which third is yours. Touch only your pages and their bundle folders.

## The flag you carry

Propagate flag `commons-the-palace-1794143281804` (posted 2026-11-08, rhythm sweep). Home: [[The Shop]] (`Shop/The Shop.md` or root — find it; read § The Specialist Anatomy whole before any page).

- **Decision:** A Specialist's Gotchas section states today's rules for the next job. It has outgrown the page the moment it reads as a diary of dated events rather than as rules; then the dated items move to a tuning ledger in the page's bundle, item by item with what each changed, the section becomes present-tense rules by topic opening with a link to the ledger, and `last_tested` and `last_gotcha` come off the frontmatter.
- **Check:** the page's Gotchas read as present-tense rules by topic and open with a wikilink to `<Entry> — tuning`; its dated items sit in `Shop/<Entry>/<Entry> — tuning.md` with §8 frontmatter and `ledger: tuning`; `last_tested` and `last_gotcha` are gone from its frontmatter.
- **Loudon's words:** 2026-11-03, "When I see gotchas I think, should that be a ledger?" · 2026-11-07, "Sweep them" · 2026-11-08, "sweep them all."
- This also carries the by-touch flag `commons-the-palace-1792347287670` (SCHEMA — Reference §3: `last_tested` and `last_gotcha` come off a page when it grows a tuning ledger).

## The exemplar

FLUX became the second page in the shape on 2026-11-03 (`4ebbfc08`). Read both sides of it before you touch anything: `Shop/FLUX (Hugging Face).md` § Gotchas (rules by topic, opening with the ledger link) and `Shop/FLUX (Hugging Face)/FLUX (Hugging Face) — tuning.md` (the ledger: its frontmatter, its `standards` block, how dated items are written, how "what each changed" is phrased). `git show 4ebbfc08 --stat` and the commit body say why. Match that shape exactly; do not invent a second one.

## Your pages

**A1:** Blender · ComfyUI · D3.js · Depth Anything · Kokoro · LaMa · LaTeX · Manim CE
**A2:** Matplotlib · Mermaid · OBS · Observable Plot · RNBO codebox~ smith · Remotion · SAM · Stable Audio Open
**A3:** Three.js · Tone.js · VCV Patch Generator · Web Audio Worklet · Whisper · ffmpeg · p5.js

All under `Shop/<Entry>.md`; bundles at `Shop/<Entry>/`. Some already have a bundle folder (proofs, a scroll); a few may already have a `— tuning.md` from a steward — if one exists, append the dated gotchas to it as items under a dated heading rather than making a second ledger, and say so.

## Per page

1. Read the page whole. Read its Gotchas section twice: once for the dated events (what happened, when, what it changed), once for the rules those events taught (what the next job must do).
2. **The ledger.** Create `Shop/<Entry>/<Entry> — tuning.md` with §8 frontmatter and the `ledger: tuning` + `standards` block in FLUX's shape (`standards.for`: what running this Specialist taught it; `standards.run`: one job). Move every dated item there, grouped by date, each as a numbered item that says what the run found and what it changed. Keep the dates and the facts; drop nothing that is a fact. `last_tested`'s date, if the page carries one, becomes the ledger's first run line (`- run · <date> · <what it ran on> · <taught item N | nothing new>`); if the page gives no runs, say so in the ledger's opening line rather than inventing one.
3. **The Gotchas section.** Rewrite it as present-tense rules by topic (a few short sub-headings or bold leads, as FLUX does), opening with one line that points at the ledger: the history is in [[<Entry> — tuning]]. A rule is a sentence the next job can obey; a story is not. Where a dated item taught no rule that still holds, it goes to the ledger only.
4. **Frontmatter.** Remove `last_tested` and `last_gotcha`. Touch nothing else in the frontmatter; preserve its style exactly.
5. Re-read the result once as the next Maker would: can it do the job from the rules alone?

## Output

Write the pages and ledgers. Then write `_ops/swarm/sessions/weave-2026-11-08/workers/A<1|2|3>-shop-gotchas.md`: one block per page — the ledger path (new or appended), how many dated items moved, how many rules the section now states, the two fields removed, and anything you could not place (a gotcha that is neither rule nor dated event; a page whose Gotchas were already rules). Finish with `command grep -l '^last_gotcha:' Shop/*.md` and paste what remains (none of yours). Do not run git writes.
