---
title: "The Gallery"
type: project
status: active
pillars: [creation, practice, tools, philosophy]
born: 2026-11
stage: seed
who_leads: loudon
forward_vector: "I am the Gallery: every creative and educational work Loudon has made, from school onward, hung where it earns its place, dated and sourced, playable where the media survives, and drawn as one line a visitor can walk. I want to be built first as a system — a folder of works, a store for the files git keeps out, a timeline face — then filled from everything the Dropbox, the palace and git already hold, and only then to sit Loudon down era by era, and after him the people he made things with. I want every work to link forward into the palace idea it seeded, so the line reads as the root system under the house and never as a list of credits."
links:
  - target: "[[Identity Molting]]"
    type: emerged-from
    label: molt-catalogue
  - target: "[[Oblique Portrait]]"
    type: connects-to
    label: sensory-autobiography
  - target: "[[Loudon Live]]"
    type: connects-to
    label: public-face
  - target: "[[The Shop]]"
    type: connects-to
    label: shape-borrowed
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: stewarded
  - target: "[[Synthesis Notes (Loudon)]]"
    type: connects-to
    label: first-archived-work
  - target: "[[Harvest Ceremony]]"
    type: connects-to
    label: the-hunt
  - target: "[[Meaning and the Link]]"
    type: connects-to
    label: root-of-the-palace
  - target: "[[Drafting Table Design System]]"
    type: connects-to
    label: working-face
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: public-timeline
  - target: "[[FOUR PILLARS]]"
    type: connects-to
    label: a-life-cast-four-ways
  - target: "[[The Gallery — Context]]"
    type: spawned
    label: rationale-archive
---

# The Gallery

A complete, walkable line of Loudon's professional and creative life, which is also the archive of as much of what he made as can be found: records, pieces, courses, papers, instruments, patches, shows, tools, talks. Each work gets a page; each page links forward into the palace idea it seeded. The 2014 paper in [[Meaning and the Link]] is the intellectual ancestor of the whole house; the [[Synthesis Notes (Loudon)]] seeded [[Synth Templates]]. Read that way, the timeline is the root system under the palace, not a résumé.

Loudon's order, 2026-11-03: *make the system, then fill it as much as possible, then move to interviews of me and collaborators.* Everything here is public-facing, the interviews included.

## The shape

The Gallery borrows three shapes the palace already runs ([[The Gallery — Context]] has the reasons). From [[The Shop]], a folder that holds one kind: `Gallery/` will hold only works, each declaring `member-of [[The Gallery]]` on its own side, the parent's roster a generated block never edited by hand. From [[Generative Sample Libraries]], a parent that spawns flat children when they earn a Plan of their own. From [[Loudon Live]], a project whose bundle holds the build.

So: this page is the parent, `type: project`, stewarded under the [[Project Stewardship System]]. Its bundle holds the scroll, the Context, the specs, the timeline build and the media manifest. `Gallery/` does not exist until the first work page does (lazy creation). Children — a Timeline, an Archive, an Interviews page — are spawned as flat projects, `emerged-from` this one, only when the material forces it. Nothing in stewardship changes to open this project.

## A work

A work is one thing Loudon made. Its page says what it was, the story in his words (quoted and dated from the interview that gave it), what it led to, what was learned, and where it links into the palace. Beside the text, a rich face: audio that plays in place, scans, images, video, a score or a patch, each piece carrying where it came from. A provenance block names the holdings, their condition and what is missing. The dates and facts he still owes stand as open asks on the page.

The first work pages take the shape the palace has already used once for his own material: `type: source`, `author: Loudon Stearns`, a `medium`, a bundle, and `member-of [[The Gallery]]` with a label naming the kind (`recording`, `course`, `paper`, `instrument`, `performance`, `tool`, `talk`, `writing`). A `work` type of its own waits until use has proved its fields.

## The eras

Named by Loudon in the era-map interview, with their rough years and the ten works he already knows. Until then this section is empty on purpose; the headings land after the interview, not before it.

<!-- CLAUDE → LOUDON: the era headings go here after the era-map interview, one heading per era, each with its rough years. -->

## The data model, in brief

Nothing in the frontmatter says when a thing happened: `born` is the month a page was made. Until a dozen works have used it, a dated-event grammar lives in each work's catalog YAML, not in frontmatter: `when: 2004`, `when: 2004-09`, `when: 2004-09..2008-05`, `when: ~1998` for remembered-not-verified, with a `when_note` quoting who said so and when. Verified dates draw in datasheet blue on the face, remembered ones in amber — the [[Drafting Table Design System]]'s provenance colours doing the job they were made for. The catalog `timeline.json` is a generated read-model built from frontmatter and catalog YAML. The media manifest is tracked even where the media is not; the files themselves live in the store ([[The Gallery — spec — media store]]).

## The two faces, in brief

**The big picture** is this page's rich face and a single-file page in the bundle: a horizontal line of years, zoomable from a life to a season, era bands behind, works as marks whose length is duration, colour is kind, outline is provenance. Lanes by kind, pillar or role; a threads layer drawing the typed links between works and from works into the palace; a year scrubber; a gap view so the hunt has a map. **The work page** is the text face with its rich face beside it. Drafting Table paper for the working face; the Loudon Live dress for the public one, published through the read view after a Sentry sweep.

## Open Questions

- Does the first steward's vector tuning hold Loudon's order (system, fill, interview), or does the material pull toward story first?
- When does the flat PROJECTS deck start hiding the family, and is that the moment to teach the deck and the scroll about parents?
- A collaborator interviewed is asked once whether their recording goes public; that consent is theirs. What is the form of that ask?
- Which works earn a page of their own, and which are lines in an era's catalog?
