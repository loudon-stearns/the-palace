# Lane B — postconditions

Flag `commons-palace-close-2026-11-07-palace-c-1794060976151`: every ceremony states its postconditions, what must be true when a run ends. Home read whole: `_ops/Palace Ceremonies.md` (the rule is at :62). Scope: the 14 pages from `git grep -l '^trigger:' -- '*.md' | grep -v /sessions/`, each read whole in the worktree.

## Summary
pages read 14 · pass 13 · partial 1 · missing 0

Thirteen pages already carry a named section. One, [[Closing Well]], has its end spread across four places on the page and one in its dispatch file, with no heading over any of them. One edit is proposed below: a short section that gathers what the page already says. It adds no new rule.

## Per page

### Closing Well (`Closing Well.md`) — partial
- version: "1.17" → "1.18"
- where: a new `### Postconditions` under `## Closing Well, Enchanted`, placed straight after `### The flow` (which ends at :215 with the closed-well line) and before `### Scope — the practice runs at two scales` (:217).
- what is already there: § The flow step 6 (:209, "confirms it landed. The commit is the record"); the last line (:211–215, "said only in the turn that finishes the close"); the fumble check (:183, "a mandatory close-map row"); "Deposit: none is a first-class, common outcome" (:167); the Path A/B check (:151); and the done-when in `_ops/closing-well/dispatch.md:256` ("The close is done when the report is relayed and every `prepared` branch has landed on his yes or been set down by him"). Every bullet below traces to one of those, or to the card (`_ops/Closing Well Ceremony.md`, § The one hard rule) and the ledger's run lines.
- draft:

```markdown
### Postconditions

A session close has ended when all of this is true. Each line is said elsewhere on this page or on the card; here they stand in one place.

1. A fresh moderator read the day: the resident [[Concierge]] resumed, or a cold dispatch given `--session <id>`. The working Claude did not grade its own arc, unless one of the card's two named exceptions held and the close says which.
2. Loudon said the reckoning was true, or changed it. Nothing he left unanswered was answered for him.
3. Every assented row went through its own rite and was checked where it landed: a keep through the [[Deposit Ceremony]], a hand-on through the [[Baton Ceremony]], a trace in its bundle. Every `prepared` branch landed on his yes or was set down by him. "Deposit: none" is a complete close.
4. Every baton the session caught is closed on the board, in full or `--partial`.
5. The punchlist named what could not be verified, and the [[Closing Well — tuning|tuning ledger]] has the close's run line. A lesson that changed the spec is a numbered item there.
6. The session's last words are the closed-well line, counted, in the turn that finished the close.

A movement close keeps 2, 5 and the honest punchlist. Its placing belongs to the ceremony that is finishing, and it says no line.

**When it goes sideways:** a resident that has gone silent is summoned again, or the close takes Path B, and says which. An executor cut off mid-report has the tree checked before its last sentence is believed.
```

- tuning item: `Closing Well/Closing Well — tuning.md` · under a new heading `## From the 2026-11-08 Weave` (the ledger groups items by the close or event that brought them, newest last, :412 is the latest), the line:
  `82. **The close had no named end.** Every ceremony states its postconditions ([[Palace Ceremonies]] § What Makes a Ceremony; Loudon, 2026-11-07: "We must have a post-condition to all ceremonies."), and Closing Well's were spread across § The flow, the fumble check, the last line and the dispatch file, so a reader had to collect them. Forced (v1.18): § Postconditions gathers them under § The flow. No rule is new.`
- note: Loudon decides two things. (a) Whether the movement-close line belongs here, or whether § Scope's table (:223–227) is enough. It is accurate to the table, but it is the one sentence a reader might take as new. (b) Whether to keep the "When it goes sideways" line. The home page's mark asks for it (`_ops/Palace Ceremonies.md:62`, "and what to do when it goes sideways"), but the flag's check does not. Both are taken from :151 and from gotcha 22 (`_ops/closing-well/dispatch.md:268`). The card `_ops/Closing Well Ceremony.md` carries no `trigger:` and no version, so it is out of scope and stays as it is.

### Baton Ceremony (`_ops/Baton Ceremony.md`) — pass
- version: "1.6" unchanged
- where: `## Completion Signal (outgoing side)` (:279) and `## Completion Signal (incoming side)` (:289). First line: "The outgoing Baton is complete when:"
- draft: none
- tuning item: none
- note: the clearest two-sided end in the set. Item 5 names the run line.

### Deposit Ceremony (`_ops/Deposit Ceremony.md`) — pass
- version: "2.9" unchanged
- where: `## Completion Signal` (:155). First line: "A deposit completes in one of two ways."
- draft: none
- tuning item: none
- note: the signal does not name the tuning run line. Step 7 does ("the run marks the tuning file with its run line"). This is a small gap against the home page's "It remembers" mark (:64), outside this flag's check. No edit proposed.

### Enrichment (`Enrichment.md`) — pass
- version: "2.9" unchanged
- where: `## Postcondition` (:102). First line: "The manifest's sections all read *in step* under `fingerprint.mjs`; every made piece is in the bundle, named and self-describing; …"
- draft: none
- tuning item: none
- note: like the Deposit, the postcondition leaves out the run line, and step 8 carries it. It has no failure line either. Both are outside this check.

### Harvest Ceremony (`_ops/Harvest Ceremony.md`) — pass
- version: "1.3" unchanged
- where: a bold `**Postconditions:**` block near the top (:45), not a heading. First line: "1. The scope was named before any triage: what was searched, and what was left out." Item 6 names the run line.
- draft: none
- tuning item: none
- note: it is findable, being the page's second paragraph, but it is the only one of the fourteen with no heading over it. If Loudon wants every ceremony's end in the outline, the edit is one line, `## Contract`, above :45, and that would move the version (1.3 → 1.4). I don't count it as a gap.

### Map Build Ceremony (`_ops/Map Build Ceremony.md`) — pass
- version: "2.7" unchanged
- where: `## Contract` (:35), the **Postcondition** row (:40). First line: "A map file exists in `_ops/maps/` with a stamped filename; its `meta` carries the node, edge and ghost counts and names every forward ghost; …"
- draft: none
- tuning item: none

### Return Ceremony (`_ops/Return Ceremony.md`) — pass
- version: "1.7" unchanged
- where: `## Ceremony Contract` (:40), **Postconditions** (:48). First line: "1. The **query block** (below) was run in full, before any interpretation"
- draft: none
- tuning item: none
- note: it also gives the roll call its own subset of postconditions, and the Closing Well draft follows that pattern for the movement close.

### Revival Ceremony (`_ops/Revival Ceremony.md`) — pass
- version: "2.2" unchanged
- where: `## Contract` (:39), the **Postcondition** row (:45). First line: "Loudon met the page through a made thing, or the rite cites where he already did."
- draft: none
- tuning item: none

### Self-Model Update Ceremony (`_ops/Self-Model Update Ceremony.md`) — pass
- version: "2.0" unchanged
- where: `## Ceremony Contract` (:30), **Postconditions** (:40). First line: "1. **The anatomy is whole.**"
- draft: none
- tuning item: none

### Sentry (`Palace development/Sentry.md`) — pass
- version: "1.7" unchanged
- where: `## Postcondition` (:94). First line: "Every raised finding sits in the held report and was put to Loudon; every allow entry carries a reason; the ledger has the run's line; no tracked file names an open finding."
- draft: none
- tuning item: none

### Spore Check Ceremony (`_ops/Spore Check Ceremony.md`) — pass
- version: "1.3" unchanged
- where: `## Contract` (:24), the **Postcondition** row (:29). First line: "Every sleeper was read and given a disposition Loudon agreed: revive, hold, compost or fold."
- draft: none
- tuning item: none

### The Daily Page (`_ops/The Daily Page.md`) — pass
- version: "1.7" unchanged
- where: `## Contract` (:62), **Postconditions** (:70). First line: "1. The dealer shows the page as sat, with its verdict, and a fold names the page it folds into (`deal.py --status`)."
- draft: none
- tuning item: none

### Walk Ceremony (`_ops/Walk Ceremony.md`) — pass
- version: "1.4" unchanged
- where: `## Ceremony Contract` (:19), **Postconditions** (:27). First line: "1. Operator can describe the path taken — starting entry, links followed, entries visited"
- draft: none
- tuning item: none

### Weave Ceremony (`_ops/Weave Ceremony.md`) — pass
- version: "2.2" unchanged
- where: `## Ceremony Contract` (:66), **Postconditions** (:77). First line: "1. A topology report has been produced covering: total entry count, hub nodes (the top inbound decile), …"
- draft: none
- tuning item: none
- note: this is the exemplar the brief named. Its list asks for the report's "What this run taught" (5c) but not the tuning run line, which Step 6.7 carries. That is outside the check.

## For the coordinator

- **The flag's state.** Once the Closing Well edit lands on Loudon's yes, the check is clean on all 14 pages: `Palace-Resolves` the flag. If he declines it or holds it, write `Carried flag commons-palace-close-2026-11-07-palace-c-1794060976151: 13 of 14 pass; Closing Well drafted, waiting on Loudon`.
- **Outside the check, seen in passing.** The home page's mark asks for postconditions *and* "what to do when it goes sideways" (`_ops/Palace Ceremonies.md:62`). The flag's check asks only for the first. Six passing pages have no named failure line: Baton (its incoming side has one, at :299), Deposit (it has "has not completed", :169), Enrichment, Harvest, Map Build and Sentry (whose gate fails closed, :70). Should the second half become its own flag? That is Loudon's call. I have not drafted it.
- **ROSETTA §5's Ceremony Reference Card has no Closing Well row** (`ROSETTA.md:219–234`). It lists the Schema Ceremony, which has no page, and leaves out a ceremony that has one. This is a doc-drift item for whichever lane holds ROSETTA, not this one.
- I ran no linters and no git commands that change anything, and I wrote only this file.
