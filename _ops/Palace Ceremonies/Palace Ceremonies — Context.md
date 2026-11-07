---
title: "Palace Ceremonies — Context"
born: 2026-11-05
forward_vector: "I hold why Palace Ceremonies is shaped as it is, and the questions it carries about ledgers beyond ceremonies, so the page can stay a doorway and the why is not lost."
links:
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: context-of
---

# Palace Ceremonies — Context

Why [[Palace Ceremonies]] is shaped as it is, and what it holds open. Read when revisiting the page's shape, at a Weave, or before adding or retiring a ceremony — not to run one.

## Two readers

Everything in the palace has both human and agent readers (Loudon, 2026-11-05), and this page serves both at once. A person comes to learn what a rite is, the words that begin it and what it will ask of them; Loudon is the one who says the words, and a visitor to the public repository reads the same page to see how a palace tends itself. An agent comes to learn what a rite is and which page to read before it runs one. So the page opens on what a ceremony is, and only then lists them, and the table carries a **Loudon's part** column, which an agent does not need and a person does. It is named for him, not "your", because a visitor has no part.

## The field, not a ledger

A ceremony is a page that carries `trigger:`. Until Schema v1.28 a tuning ledger marked one; then the ledger became a family any page may keep, and the field took over the marking. The whole decision and its reasons are in [[SCHEMA — Context]] § Ledgers become a family; a field marks a ceremony — v1.28. The page's opening states it for the reader and keeps three things true that v1.28 named this page to mirror: the field marks a ceremony; a ledger does not; Closing Well's card is what the session hears, and its practice page carries the field.

Three of the marks describe; the second is a rule. Loudon, 2026-11-07, at the close: "We must have a post-condition to all ceremonies." The Harvest gained its contract that morning (`553a832e`); Closing Well, the one ceremony then without a postconditions section, is where the propagate flag lands first. If the marks are ever made a standard, that is a decision and wants a propagate flag ([[ELDER]] § The invariants).

The heading "What Makes a Ceremony, and How It Changes" is kept word for word because `_ops/stigmergy/orchestrator/src/ceremony-scroll.js` and [[SCHEMA — Context]] cite it.

## Grouped by what each tends, in the page's own words

The rows were once grouped by a mix of cadence and kind — Recurring, Harvest and Deposit, Revival, Continuity — and Enrichment, the Sentry and the Return sat under "Recurring" though none recurs. They are now grouped by what each rite tends. [[SUBSTRATE]]'s anatomy groups the same rites into organs, but its names are redrawn at every Weave's Self-Model Update, which does not list this page; borrowing them would make a mirror nothing tends. So the groups are this page's own, with one pointer to SUBSTRATE § Anatomy. The Daily Page sits with the Walk, not with the sleepers, because it deals every page, not only dormant ones. Enrichment and the Sentry pair because one makes what the public face shows and the other checks what passes through that door.

## Thin rows

Each row once retold its ceremony in a paragraph, and the retelling drifted: by 2026-11-05 ten of the fourteen specs had changed since the page was last edited, and the Close row still described the close map, which had split into the reckoning and a backstage checklist in July. A row now holds the words copied from the page's own `trigger:` field, when the rite is due, one sentence with a verb and an outcome, and Loudon's part taken from the rite's contract. A Loudon's part left blank means the spec does not say. Durations were left out because none is verified. Nothing parses these tables: the machinery reads the field, and the doc-drift linter checks the field against [[CHILD]]'s trigger table, not this page's.

## Rites with no page

Connection, Query and the Ceremony Reader stay without pages, as settled in the v1.28 deliberations: they keep no ledger or scroll, so the machinery has nothing to find, and one that grows a page gets the field then ([[Palace Ceremonies — sketch — propagation plan]]). Connection and Query are ways of asking, not rites. The Reader has a body `**Trigger:**` line for people; it is never a field, because a field would make it a ceremony and that is a Schema Ceremony.

The Schema Ceremony is called a ceremony everywhere and has a rite's parts — steps, a postcondition, a failure mode, a fixed commit subject — but no page, no `trigger:` field and no line in [[CHILD]]'s table; only [[ROSETTA]] gives it words ("Let's update the schema"). It begins on a condition, a change §5 names. So it is a line on the page, not a row. Giving it a page with `trigger:` would itself be a Schema Ceremony.

## Held open

- How many recurrences earn a change to what a page wants ([[The Remembering Page]]: a clean same-direction drift by the third, one pair, one topic).
- What one run is when three or more pages meet.
- Whether a diary settles between molts, for a page lived often that never changes.
- Whether the Schema Ceremony, which has no page and no `trigger:`, should learn from its runs.
- What an ordinary page's bundle should hold ([[SCHEMA — Context]] names this page as where it is open).
- **Folding** (parked by Loudon, 2026-10-16): how a settled lesson leaves a ledger for its page or design doc. Revisit when a ledger is long enough to bury one. Built once as a steward's fold ask and let-go ask (`73d06fa8`) and held back; once stewards grow up, folding may just be a steward writing its own page. Let-go is gone with the debts, which now stay on the scroll's trail.
