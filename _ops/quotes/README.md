# Palace Quotes — machinery

The runnable half of [[Palace Quotes]]. The page says what the agent does and why — it reads a palace page through one of the palace's own philosophical lenses and leaves a quote beside the words it read. This folder is how it does it, and how STIGMERGY shows the result.

## Where things live

- **The ledger** — `_ops/Palace Quotes/Palace Quotes — placements.jsonl`, in the page's own bundle. One JSON line per placement; append-only. A retirement is a second line with the same `id` and `status: "retired"`; readers fold by id, last line wins. This is the agent's record of what it made, and the one thing STIGMERGY reads.
- **The page it lands on is never written.** A quote is laid *beside* a page's words — the way a rich-face piece is laid `near` a paragraph ([[Enrichment]], `_ops/rich-face/README.md`) — so the text face stays what the page says. The placement carries the section's fingerprint at the moment it was placed, computed by the rich face's own `parse.js`, so the two drift signals never disagree.
- **`schema.mjs`** — the shape of a placement and the checks (pure; shared by the CLI, the server and the tests).
- **`lenses.json`** — the roster of lens pages and the question each asks. Guidance for the quoter; the placer validates a lens by whether the page exists, so any palace page may serve.
- **`voices.json`** — who may answer: names, domains and works only, never pre-written quotes. The palace's citizens first (their `speech` files hold cited verbatim excerpts, no web check needed), then makers, musicians, scientists, writers and other traditions, in circles that mirror the Four Pillars. A floor, not a ceiling.
- **`prompts/quoter.md`** — the method, appended to [[The Lens]]'s own mandate when Palace Quotes is woken as a glass: the open reading first (the page and its neighbors, then whoever in any field has stood exactly there), the roster as the floor, the lens named afterwards.
- **`mandate.mjs`** — builds that prompt: the Lens's read with its board reports cut, the quoter's method, then *For this visit*: the subject's typed-link neighborhood with paths, what is already on the page, who has been quoted so far, and the roster.

## Commands

| Run | What it does |
|---|---|
| `node _ops/quotes/place.mjs --file p.json [--dry-run]` | validate and append one placement (or an array). Refuses a `near` phrase that is not on the page, a lens that is not a palace page, a missing `why`, a fidelity or check it does not know, the same words twice on one page. |
| `node _ops/quotes/place.mjs --keep <id> [--why "…"]` | Loudon's yes, written by an elder on his word; on a let-go quote it revives it |
| `node _ops/quotes/place.mjs --retire <id> --why "…"` | take a quote down, with the reason; the line stays in the ledger |
| `node _ops/quotes/place.mjs --list [--target "<Title>"] [--lens "<Title>"] [--awaiting]` | what is placed, and which quotes still await his read |
| `node _ops/quotes/place.mjs --voices` | who has been quoted, how often, how many came from the open reading, which voices are new to the palace |
| `node _ops/quotes/place.mjs --check` | re-anchor every placement against the pages as they stand: **moved** (the phrase is gone) · **drifted** (the section's words changed) · in step |
| `node _ops/quotes/place.mjs --mandate "<Title>"` | print the prompt that wakes Palace Quotes as the glass over that page — [[The Lens]]'s `buildLensMandate` with the quoter's method appended |

## A placement

```json
{
  "quote": "Each thing, as far as it can by its own power, strives to persevere in its being.",
  "attribution": "Spinoza",
  "source": { "kind": "tradition", "work": "Ethics", "locus": "III, P6", "translator": "Curley" },
  "fidelity": "translation",
  "checked": "web",
  "lens": "Spinoza Conatus",
  "target": "Cooperation Yields Agency",
  "near": "cooperation doesn't erase either entity's conatus",
  "why": "…"
}
```

The placer adds `id`, `section` (the heading the phrase sits under), `made_against` (that section's fingerprint), `placed_by`, `placed_at`, `status`. The ledger's first line is its own header — title, born, a link to the page, a forward vector — the minimal self-description every bundle file carries (SCHEMA — Reference §8); it has no `id`, so readers pass over it.

**A quote's standing.** `placed` is laid by the agent and awaiting Loudon's read; `kept` is his yes; `retired` is let go, with the reason, and the line stays. A decision is one more line with the same id (`{ id, status, kept_at | retired_at, decided_by }`); the fold takes the last line, so a keep after a let-go revives the quote. In STIGMERGY the decision is a keystroke — `y` keep, `x` let go — on the QUOTES lens or on the mark itself; it lands as one committed ledger line (`POST /api/quotes/decide`). **Only kept quotes reach the public read view**; what leaves the house is what he said yes to.

**How the voice was found.** `mode: open` is the open reading — the page and its neighbors first, then whoever in any field has stood exactly there; `mode: roster` is the floor. `new_voice: true` marks a voice the palace had never heard; the placer holds it to `checked: web` with `source.url` kept, because an unknown voice is where an invented line is most likely, and that URL is how Loudon meets the person. The placer also warns when one voice already has three quotes placed. Later, `--voices` says whether the open-reading quotes are the ones Loudon keeps.

**The two honesty fields.** `fidelity` says how far the words are from the source: `verbatim` · `translation` (translator named) · `paraphrase` · `adapted`. `checked` says how the wording was verified: `web` · `palace` (the words are in a palace page) · `partial` (passage found, wording unconfirmed) · `recalled` (memory alone). The surface shows them as one glyph: ◉ checked and verbatim · ◐ checked, a translation or paraphrase · ◇ unconfirmed. A made-up line marked verbatim is the one failure this folder exists to prevent; the fields make the question unavoidable.

## How the agent runs

Three doors, one page:

- **Wake it as a glass.** In STIGMERGY, open a page and press `[L] lens`, pick *Palace Quotes* as the glass — or run `place.mjs --mandate "<Title>"` and hand the prompt to a Claude Code session. The page wakes as itself ([[Pages as Agents]]), runs [[The Lens]]'s two-attempt read, and places a quote (or honestly places nothing). Both doors build the prompt with `mandate.mjs`: the Lens's read with its board reports cut, the quoter's method appended. **It posts to no board** — not WEAVE, not TRICKSTER; the placement is the report.
- **Many at once.** For a sweep, dispatch one reader per page with `place.mjs --mandate "<Title>"` as its prompt (the orchestrator's fan-out, or subagents from a session); each places one quote or nothing, and the "awaiting your read" chip gathers them for Loudon. Cost it first: one reader per page.
- **Ask the working session.** "Leave a quote on <page>" — the session reads [[Palace Quotes]] and `prompts/quoter.md`, does the work, runs the placer. It is a child; the placer writes only the page's own ledger, never another page.
- **Harvest intake.** The [[Harvest Ceremony]] flags "a quote for Palace Quotes" as a worthiness marker; a harvested quote is placed on the page it belongs to, not collected.

## The surface

STIGMERGY's STATE deck reads the ledger through `GET /api/quotes` (`server/api/quotes.js` → `src/lib/quotes.js`), which resolves titles to paths, finds the paragraph each `near` phrase lives in today, and marks `anchor.found` and `drift`.

- **On the page** — the reader lays each quote as a mark after the paragraph it is anchored to (`QuoteMark` in `EntryBody`): the quote, who said it, the fidelity glyph, the lens it was read through, the why. A quote whose phrase has left the page is listed at the end as *a quote whose place moved*, with the phrase, so it can be re-anchored or retired.
- **The QUOTES lens** — `?lens=quotes`: one quote at a time, the page it opens onto underneath (title, type, stage, pillars, the anchored excerpt), and where it leads — more quotes on this page, quotes through the same lens, quotes on linked pages. `n` draws another at random; `Enter` steps through into the page at the mark; `y` keeps, `x` lets go; the "awaiting your read" chip narrows the walk to unjudged quotes and moves on after each decision, so a backlog clears at one key per quote. The trail of the walk so far runs along the bottom. The public read view carries the same lens from `data/quotes.json`, kept quotes only.
- **The rich face** — not yet. A kept quote earning a place as a piece on the target's rich face (`[Entry] — rich.json`, laid `near` the same phrase) is the agreed next step, once more pages carry rich faces; the fingerprint every placement already carries is for that day.

## Adding a lens

Add the page to `lenses.json` with its voices, question, families and what a fake application looks like. The page must exist; a tradition without a page (Plato, Leibniz, Zen) quotes through the [[Palace Philosophies]] hub until it has one — which is an invitation.
