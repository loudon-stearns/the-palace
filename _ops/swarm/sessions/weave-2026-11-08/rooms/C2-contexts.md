# Lane C2 — the Contexts owed (writes the house: new Context files and one `spawned` link each)

Read `PREAMBLE.md` beside this file first. This brief is shared by two writers, **C2a** and **C2b**; your dispatch names which half is yours. Touch only your half's pages and bundles.

## The flag you carry

Propagate flag `commons-the-palace-1792897100361` (Weave v2.0, 2026-10-24, rhythm sweep). Home: [[Weave Ceremony]] (`_ops/Weave Ceremony.md`, Step 5d).

- **Decision:** A page pointed at twenty times or more, over 20 KB, or mature or fruiting past half those marks, carries a Context companion: what it left out, what was tried and dropped, why it is shaped so. Written by the hand that next works the page, never restated from it.
- **Check:** `python3 _ops/swarm/bundle-audit.py` no longer lists the page under CONTEXT OWED.
- **Proposed action:** write `<Entry>/<Entry> — Context.md` with §8 frontmatter answering the three questions; add `spawned` [rationale-archive] from the parent.

## The pages (13 owed at the open)

**C2a:** Loudon Live (`Projects/Loudon Live.md`) · 2D Torus Wavetable Synthesizer (`Projects/…`) · Action Potential Oscillator (`Projects/…`) · Loudon Live Design System (`Palace development/…` — find it) · Crystal Synthesizer (`Projects/…`) · Portamento and Physical Pitch Modeling (`Projects/…`) · Identity Molting (root).

**C2b:** Inharmonic Wavetable Synthesis (`Projects/…`) · Palace Map (root) · Shepard Tone Synthesizer (`Projects/…`) · Floquet Time-Modulated Loops (`Projects/…`) · Creative Coach (root) · Revival Ceremony (`_ops/…`).

## How a Context is written

Read first, in this order: the page whole; its bundle folder (scroll, tuning ledger, proofs, batons — these hold most of what the Context should say); `git log --follow --format='%h %ad %s' --date=short -- "<path>"` for the page and `git log --format='%h %ad %s' --date=short -- "<bundle folder>/"`; the commit bodies of the turning points (`git show --stat <sha>`). Then read two Contexts that do this well, so the register is right: `Jewel — Context.md` (root, the pattern's origin) and `_ops/Weave Ceremony/Weave Ceremony — Context.md`.

A Context answers three questions, and only those: **what the page left out** (and where it went), **what was tried and dropped** (and why), **why it is shaped as it is** (the decisions behind its sections, its vector, its type and stage). It never restates the page. It cites git (`sha`, date) for every claim about the past. "A Context that only restates the page is worse than none" — if, after reading, a page's history is too thin to answer the questions honestly, write a short Context that says so and names what the next hand should record, and tell the coordinator in your report.

Length: 600–1500 words. Plain voice. Headings are the three questions in the page's own words, or sections that answer them. Open with one paragraph saying what this Context is for.

## The frontmatter (SCHEMA — Reference §8)

```yaml
---
title: "<Entry> — Context"
born: 2026-11-08
links:
  - target: "[[<Entry>]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why <Entry> is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---
```

Then the parent: add to the page's frontmatter `links` (preserving the file's existing link style — block or inline — exactly):

```yaml
  - target: "[[<Entry> — Context]]"
    type: spawned
    label: rationale-archive
```

The file goes at `<folder of the page>/<Entry>/<Entry> — Context.md`. Where the bundle folder does not exist, create it. Where a page already has an `Archive/` or a `— context.md` with a lower-case name, say so and stop on that page — the coordinator rules.

## Output

Write the Context files and the parent links. Then write `_ops/swarm/sessions/weave-2026-11-08/workers/C2<a|b>-contexts.md`: one block per page — the file path written, its word count, the three questions and how well the history answered each (well / thinly / not at all), the commits cited, and anything you could not verify. Run `python3 _ops/swarm/bundle-audit.py | grep -A20 'CONTEXT OWED'` at the end and paste the lines that still name your pages (should be none). Do not run git writes.
