---
title: "Spore Check Ceremony"
type: practice
pillars: [practice, philosophy]
born: 2026-03
stage: growing
version: "1.3"
trigger: ["spore check"]
links:
  - target: "[[Substrate Skill]]"
    type: connects-to
    label: dormant-posture
  - target: "[[The Daily Page]]"
    type: connects-to
    label: one-sleeper-at-a-time
---

# Spore Check Ceremony

![[Spore Check Ceremony — hero.png]]

The one time the palace looks at everything asleep, together, and asks whether the world has moved around it. It decides. It does not revive (the [[Revival Ceremony]] does) and it does not delete (the [[Weave Ceremony|Weave]] does).

## Contract

| | |
|---|---|
| **Precondition** | At least one page is asleep (Step 1 says which pages count). |
| **Postcondition** | Every sleeper was read and given a disposition Loudon agreed: revive, hold, compost or fold. Each revive went to the Revival Ceremony, run now or left as a baton on the page; each hold whose conditions could not be checked has conditions that can; each compost carries its composting note, `stage: composting`, and a flag for the Weave. The run's line in [[Spore Check Ceremony — tuning]] names every page and its disposition. |
| **Does not do** | Change a page's type or stage except to `composting`. Edit a sleeping page beyond its conditions or its composting note: a page that wants editing wants reviving. Delete anything. |
| **Who writes** | An elder. A child walks the check with Loudon and hands the writes to the [[Concierge]]. |
| **Failure mode** | A page that cannot be read is named in the report as unread, given no disposition, and carried to the next check. |

---

## What the Spore Check is

Spores are not dead. They are alive at a lower metabolic rate, waiting for conditions that will let them grow. The Spore Check is not a cull; it is a temperature reading. For each sleeper the question is: has anything changed? Is this one ready?

It is also the palace's honest moment about what will never grow here. Holding an idea forever is not respect for its potential; it is clutter, and the palace prefers depth over coverage. Composting is not abandonment. The nutrients go back into the soil, and the composting note says where.

Other rites meet sleepers too. [[The Daily Page]] deals one when the shuffle reaches it, and asks the same question of that one page. The Weave puts pages to sleep when nothing has touched them, and lists the sleepers in its report. Only the Spore Check looks at all of them at once, which is how it sees what a single morning can't: two sleepers that are the same idea, a condition met by a page born last month, a granted revival that never landed.

The cadence is quarterly, because dormant ideas need seasons, not weeks. Nothing calls it on a schedule yet: Loudon calls it.

## Steps

**1. List the sleepers.**

First take the tail read of [[Spore Check Ceremony — tuning]] ([[SCHEMA — Reference]] §6): its run lines say which pages were held last time, and for how many checks.

A sleeper is any of:

- a page at `stage: dormant` (`git grep -l -E '^stage: *"?dormant' -- '*.md'`);
- a spore at any stage (`git grep -l -E '^type: *"?spore' -- '*.md'`): [[SCHEMA]] says a spore is always dormant, so one that isn't is a finding to name;
- a revive request Loudon granted on the TRICKSTER board whose page still says dormant: grep the persistent board (`_ops/swarm/persistent/blackboard.jsonl`; from a worktree, the main checkout's copy) for `REVIVE` grants and check each page.

A page at `stage: composting` is the Weave's to confirm, not a sleeper here.

**2. Read each one.**

For each: the whole page, its `revival_conditions` if it carries them, its steward if it has one (`_ops/agents/permanent/`), and what has changed since it went quiet: git since that date, its typed neighbors, its board. Last use is computed from git (`python3 _ops/swarm/entry-use.py --entry "<title>"`; inside a `.claude/worktrees/` checkout it currently finds no entries, so read the dates from `git log` there until it is fixed). Then ask plainly whether its conditions were met, or have become obsolete, or were never something anyone could check.

**3. Show one table, and decide together.**

```
## Spore Check — [date]

Sleepers read: [N]

Revive:  [[Entry]] — what changed, in a sentence
Hold:    [[Entry]] — why not yet; its conditions, rewritten if they couldn't be checked
Compost: [[Entry]] — why, and what was valuable here
Fold:    [[Entry]] → [[Neighbor]] — the neighbor that already carries it
```

Write nothing until Loudon has read the table and said yes, or adjusted it.

**4. Apply.**

- **Revive.** Each one goes to the [[Revival Ceremony]]: run it now, in this session, or leave a baton on the page saying why now. The Spore Check does not revive inline.
- **Hold.** Nothing is written, unless its conditions could not be checked. Then rewrite them so the next reader can: a thing that exists or doesn't, a page that has been built or hasn't. "When the framework reaches maturity" never woke anything; Shimmer Cloud's three lens models were built while its conditions still said wait.
- **Compost.** Write the composting note (below), set `stage: composting`, and post a flag so the Weave confirms the deletion: from `_ops/`, `python3 -m commons weave-flag --flag-type composting-confirmation --source-entries "<Entry>" --target-entry "<Entry>" --proposed-action "Confirm deletion of <Entry> — composted at the Spore Check of <date>" --rationale "<why>" --source-deposit-id "spore-check-<date>" --sender "Spore Check Ceremony"`. A page with a steward raises the open question of how a project leaves stewardship ([[Project Stewardship System]] § What's Open): name it to Loudon, and don't delete the steward.
- **Fold.** The text crosses into the neighbor by the [[Deposit Ceremony]]; the emptied page then composts.

**5. Land and record.**

Commit through the door: `palace-commit.mjs --ceremony "Spore Check" --summary "<date> — <N> revived, <N> held, <N> composted, <N> folded" --verify <verified|unverified|couldnt>`, one `--path` per file. The body names the version and ends with what this check taught the ceremony ("nothing" is a legal answer). The run marks [[Spore Check Ceremony — tuning]] with its run line, naming each sleeper and its disposition, so "held across three checks" is something the next run can count; a lesson that changes the spec also goes there as a numbered item.

## The composting note

Before a page is marked `stage: composting`, write a short note into its body. It is the page's last act: a plain account of what it held and why it is being let go. [[The Daily Page]] uses the same note.

```markdown
## Composting Note — [YYYY-MM]

This entry is being released. It has been dormant since [date], held across [N] Spore Checks, with no change in what it was waiting for.

What was valuable here: [one or two sentences: the idea's contribution, even if never fully developed].

Its nutrients: [the pages that carry the most of it forward, if any].
```

The note is for whoever later wonders why something is gone. It makes the compost visible and chosen, not silent.

## The season

Do it at the same time each quarter, or tie it to a natural turn in the work, and it feels less like maintenance and more like the season changing. The palace has its own weather.

## Open Questions

- Should a page held across three checks with nothing changed come to the table already marked as a compost candidate, with Loudon making the call?
- Should the Weave's report offer a Spore Check when a quarter has passed since the last run line?
- Should `revival_conditions` be required on every sleeper? (Optional in [[SCHEMA]]; today two growing pages carry it as a "waiting for" note, which is a different use.)

---

*The version and what each spore check taught the ceremony: [[Spore Check Ceremony — tuning]].*
