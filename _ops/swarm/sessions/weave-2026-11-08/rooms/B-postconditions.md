# Lane B — every ceremony states its postconditions (proposes; writes nothing in the house)

Read `PREAMBLE.md` beside this file first.

## The flag you carry

Propagate flag `commons-palace-close-2026-11-07-palace-c-1794060976151` (posted 2026-11-07, rhythm sweep). Home: [[Palace Ceremonies]] (`_ops/Palace Ceremonies.md`).

- **Decision:** Every ceremony states its postconditions: what must be true when a run ends.
- **Scope:** every page carrying `trigger:` in its frontmatter.
- **Check:** the page has a Postconditions, Contract or Completion Signal section naming what must be true when a run ends.
- **Proposed action:** draft the page's postconditions, show them to Loudon, write on his yes; a spec change, so the version moves and a tuning item names it.
- **Loudon's words (2026-11-07):** "We must have a post-condition to all ceremonies."

## Method

1. Read the home page whole: `_ops/Palace Ceremonies.md`, especially § What Makes a Ceremony, and How It Changes. Read `ROSETTA.md` § 3.5 and § 5 (the Ceremony Reference Card already lists a postcondition column — a useful cross-check, not canon for the page). Read one ceremony that does this well as the exemplar: `_ops/Weave Ceremony.md` § Ceremony Contract.
2. List every page with `trigger:` in frontmatter: `git grep -l '^trigger:' -- '*.md' | grep -v /sessions/`. Read each one whole.
3. For each page, apply the check honestly. Three outcomes:
   - **Passes** — it already has a section (any of the three names, or an equivalent) that states what must be true at the end of a run. Say which section and quote its first line. No edit.
   - **Partial** — it has something (a "done when", a completion signal buried in prose) but not a named section a reader finds. Propose the smallest edit that makes it findable, usually a heading over what is already there.
   - **Missing** — draft 2–5 postconditions in the page's own voice, checkable, not aspirational ("the ledger has the run's line", "the commit names X", "nothing written before Y"). Read the page's tuning ledger (if it has one) and its Context — the postconditions are usually already implied there. Draft where in the page the section goes.
4. A spec change moves the page's `version` and gets a tuning item. For each page you propose to change: the current `version`, the next (minor bump, e.g. "1.4" → "1.5"), and a one-line tuning item in the ledger's style (`N. **…** Forced (vX): …`), with N = the next number in that page's `— tuning.md` (read it to find N). A page with no ledger: say so; the coordinator decides whether the postconditions earn one.

## Output

Write **only** `_ops/swarm/sessions/weave-2026-11-08/workers/B-postconditions.md`:

```
# Lane B — postconditions

## Summary
<pages read N · pass N · partial N · missing N>

## Per page
### <Page title> (`path`) — pass | partial | missing
- version: <current> → <proposed, or unchanged>
- where: <section to add or rename, with the heading it goes under or after>
- draft:
  <the exact markdown to insert — heading and bullets — in the page's voice>
- tuning item: <ledger path> · <the exact line>, or "no ledger"
- note: <anything Loudon must decide>
```

Loudon reads this whole. Make every draft one he could say yes to without editing. Write nothing in the house.
