---
title: "README - The Palace Guide — Context"
born: 2026-11-02
links:
  - target: "[[README - The Palace Guide]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why the Palace Guide is shaped as it is — what its first version carried, what Loudon's margin notes asked for, what its mirror duty brought in and what never arrived — so the next worker can change the page without redoing the reasons, and I grow when its shape changes."
---

# README - The Palace Guide — Context

The Guide is the oldest of the skeleton pages. It came in with the initial commit, 2026-03-17 (`abc2592`), and its first half is still close to that day's text. Its second life began on 2026-06-09, when it became a mirror of [[SCHEMA]]. Since then most of its edits have been rows carried in by Schema Ceremonies.

## What the first version carried, and what it lost

At birth the page had four ceremony paragraphs: Walk, Weave, Spore Check and Self-Model Update. It also had a template ending in "Open Questions", and a section called **Caretaker Modes**: the Weaver, the Headmaster, the Scout and the Gardener, "attitudes we adopt during different ceremonies, not persistent entities" (`abc2592`). Caretaker Modes was cut on 2026-03-24. It went inside a commit named for a neuron-oscillator deposit, with no destination named (`4169e6a`). Nothing in the palace now names the Headmaster. The same commit added the line about the git backup and being bold.

The Versioning section came in on the first day (`0524386`) and has not changed since. Its `git add .` is older than every rule the palace now keeps about committing ([[How the Palace Commits]]).

## Loudon's margin notes

That 2026-03-24 commit also left four HTML comments in the page, notes in Loudon's voice committed under his name (`4169e6a`). Two asked that the closing "open questions" become a forward vector, because every page is also the invocation of an agent. One asked for the Deposit to be added "as it is perhaps the most important to the growth of the palace". One asked for the philosophy section to be set up: why grounding in philosophy and metaphor matters. The template heading had already moved once, to "Open Questions & Budding Branches", with the Deposit Ceremony's branch-routing step (`eee3552`). On 2026-05-02 one pass answered all the notes and removed them (`c4f30b5`). The template's section became Forward Vector, Reading an Entry gained its forward-vector paragraph, the Deposit got its paragraph, and Philosophical Foundations got its opening.

## Becoming a mirror

v1.11 put the Guide on the Schema Ceremony's update checklist (`fe610f3`). It backfilled vocabulary the page had missed: practice, person, specialist and maker; `exemplifies` and `member-of`; and the reversed v1.9 wording of `deepens` and `emerged-from`. It also added the "mirror of SCHEMA" comments with their counts. The §1 count was updated at v1.18 (`d63fd05`). The §4 comment still says "10 link types as of v1.9", although v1.30 added the eleventh and twelfth rows (`8ba2e39`).

Ceremony paragraphs since have come by the same route: Return (`ad86efc`, rewritten `4a40251`), Sentry (`a643be8`), The Daily Page (`f12b35b`). Revival came at the October weave, carrying the old rites to the places they hadn't reached (`df2e3c1`). The Walk paragraph is word for word as born. Harvest, Baton, Closing Well, Enrichment and Map Build have never had a paragraph here. The "Spore check" line in the trigger list was dropped on 2026-07-03 inside a working-tree flush that gives no reason (`5a9e347`).

## The bundle paragraph, rewritten often

Entry Bundles arrived with v1.2 on 2026-05-05 (`94f6096`). It had handoff examples, and shared artifacts lived in `Artifacts/[Theme]/`. Handoff became baton on 2026-06-16, which also fixed a sentence that had batons both archived and deleted (`4855ded`). Shared artifacts moved to the most-owning entry's bundle (`e97c039`). Stewarded projects got `plan.md` and `staging.md` (`3154764`). The scroll replaced the first on 2026-09-24 (`d1f47ed`), and the agreed Plan replaced the second the next day (`d4cb3fa`). "Loudon Live session design" became "teaching design" (`016ec79`). The tuning file became one ledger in a family with the diary (`9f9d1cf`). Eleven commits have touched the section since May. The authority is [[SCHEMA — Reference]] §8, and this paragraph follows it.

## Smaller decisions

- **Closing quotes** became template step 6 on 2026-07-02. Loudon kept catching drafts that dropped them when they were built from memory of the format rather than from neighbours just read (`fb5edd6`).
- **Where a new entry goes.** Step 1 sent every entry to the root until 2026-10-06. It was rewritten from practice: by then 32 of 41 project entries already sat in `Projects/` (`feea2f8`).
- **The `breakthrough` type** left the table and step 1 with v1.17 (`de5990e`).
- **The working-queue examples** went from Harvest Queue and Deposit Archive (`46d904f`) to Palace To-Do and Palace Graffiti (`004ff7c`), then to Graffiti alone when the To-Do retired (`00961f3`).

## The 2026-11-09 rewrite: from mirror to door

The Daily Page dealt the Guide on 2026-11-09. Its piece was a game called Still True?: ten sentences from the page, each checked against the page that owns the subject. Seven of the ten had drifted. Playing blind, Loudon agreed with the house on five of the ten. A page that copies rules from other pages goes stale as soon as one of them moves, and no reader can tell which lines have. His rule for the rewrite: a door holds nothing another page owns. The page now welcomes a stranger, human or any AI, and points. Its links are plain Markdown so they work on GitHub too, and the root `README.md` is generated from it (`_ops/readme/build-readme.mjs`).

Where the old sections live now:

- **The ceremony triggers and the ceremony paragraphs**: [[CHILD]] § Ceremony Triggers and [[Palace Ceremonies]].
- **The reading order for another AI**: [[CLAUDE]], then [[ELDER]] § How loading works. The old list contradicted that order.
- **Versioning and committing**: [[How the Palace Commits]].
- **The link table, the entry types and the stages**: [[SCHEMA]] §§1, 2 and 4. The mirror comments are gone with them; the §4 count had been stale since v1.30.
- **Frontmatter and the forward vector**: [[SCHEMA — Reference]] §3 and [[Pages as Agents]].
- **Bundles**: [[SCHEMA — Reference]] §8.
- **The Four Pillars**: [[FOUR PILLARS]]. The old line that a page touching all four is likely a hub contradicted SCHEMA §1, where a hub is earned by inbound links.
- **The visual language**: [[Image Embedding Standard]], [[Mermaid Diagram Standard]] and [[Technical Diagram Standard]].
- **How to add an entry, and its template**: [[Substrate Skill]] and [[Deposit Ceremony]].
- **The philosophical foundations**: [[Palace Philosophies]], [[Meaning and the Link]], [[STIGMERGY]], [[Endosymbiosis]] and [[Spinoza Conatus]]. Luhmann is in [[SUBSTRATE — Context]].

Some lines had no other home. "Plant seeds; tend them later" and "one idea, one page, one link" stay on the page itself. The closing-quotes rule, "composting is not death", and songlines, mycorrhizal networks and Bowlby as named traditions were drafted homes elsewhere, for Loudon to read before they are written. Until then they live only in the old text. The closing-quotes rule was let go on purpose, not rehomed. Loudon, 2026-11-09: "closing quotes rule has been overruled by our palace quotes system we don't need that here." See [[Palace Quotes]].

The old text is whole at the rewrite's parent commit, `ddfe9e3f`: `git show ddfe9e3f:"README - The Palace Guide.md"`. The frontmatter link `emerged-from` [[Symbiotic Skills]] was dropped, because that page was composted on 2026-11-03 (`f55909e3`).
