---
title: "Loudon Live Design System — Context"
born: 2026-11-08
links:
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Loudon Live Design System is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Loudon Live Design System — Context

This is for whoever edits [[Loudon Live Design System]] next. The page has been rebuilt twice, and its scope narrowed once, so some of its section names are left over from a system that worked differently. This file covers what changed, what each change left behind, and what the page has never said. The lessons from the look sessions are not here: they are in [[Loudon Live Design System — tuning]], which a look session reads first. Loudon's decisions, in his own words, are in the workshop README.

## Three systems in one file

**May: the palace default, locked.** The system arrived on 2026-05-28 as a Claude Design handoff bundle (`023dd3fd`). The page called itself "the palace's default artifact aesthetic", "governing every artifact the palace makes", and its headings were *What's Cemented*, *Voice (also locked)*, *Hard Rules (Non-Negotiable)* and *The Default-Aesthetic Rule*. The same commit wrote it into CLAUDE.md and the Substrate Skill as the default for every new artifact.

**July: a floor, not a cage.** The deposit that named [[The Multilinear Self]] rebuilt it on 2026-07-02 (`f2567624`). The locked grammar became a small floor (the voice, the Lissajous sigil and the nevers) with a wide field above it. *What's Cemented* became the house style. *Hard Rules* became *The floor (non-negotiable) and the house defaults*. *The floor and the field* was added at the top. The same pass changed the wordmark from `LOUDON / LIVE` to `Loud’n Live` and took "· Autodidact Polymaths" out of the universal footer. Both changes apply going forward only: artifacts already shipped keep their old footer.

That is why the page states the floor twice, once near the top and once near the end. The top statement is the July framing. The end one is the old *Hard Rules* list, reworked into two lists, and its opening line ("Two lists, deliberately separated") dates from the same pass. Merging them would be a shape decision for Loudon. Nothing in the history says the duplication is meant to stay.

**October: one of three.** In the October Weave's decisions-first pass, the page's scope narrowed from palace default to "the palace's dress for **what the public channel shows** … one of three" (`df2e3c14`). [[Drafting Table Design System]] took the work itself, and STIGMERGY kept its terminal look. *The Default-Aesthetic Rule* became *Which dress, and where the rule is written*, now encoded in four places instead of three. The heading *The Status Rule* has been there since May. Its text now says what the dress is for, no longer that it is the default everywhere.

## What was tried and dropped

**"No cyan."** It was a hard rule from the first day ("No cyan. Anywhere. Ever.", `023dd3fd`), and in July it became one of the floor's nevers (`f2567624`). On 2026-10-25 Loudon retired it: "lets retire the "no cyan" rule" (`3c817503`). The same commit removed it from the forward vector, the floor, the Quality Manifesto line, the Maker and the Substrate Skill, and deliberately left the no-cyan comments in `ui_kits/*/styles.css` and in project artifacts, because those describe what they were made under. Drafting Table's own "Never cyan" went later that day, also on his word (`38bbe523`). A worker who finds a no-cyan comment in an old artifact should leave it.

**The audience stamp.** "Autodidact Polymaths" was stamped on every footer until July (`f2567624`). The page explains why it went: it said too much, and the term has an academic lean. The October text catch-up (`863a34d1`) took it further: the audience is electronic musicians to start, and the polymath idea stays in the background, after the 2026-10-14 portrait of Loud'n Live as his teaching and coaching face.

**A rethink by baton.** The visual rethink was commissioned by baton on 2026-10-14 (`258d73cc`). Loudon agreed to it without reading the baton, because it was going to start a session he would lead. The session made three looks in one day (Worn Broadcast `3c817503`, Cyanotype `9a7f3d18`, Night Signal `42dc4091`). Loudon closed it with "that is all the looks we need" (`876d2054`). The baton then carried only what was left over, the text catch-up and Drafting Table's cyan question, and both were settled the same day (`863a34d1`, `38bbe523`). That is why *What Comes Next* says nothing is left open.

**The BBS kit as a sibling.** The page used to name the BBS kit as a third design system. On 2026-11-02 BBS Design System folded into STIGMERGY § The look (`94b53d49`), and the page's links were repointed. The frontmatter forward vector still ends "BBS the swarm terminal". That fold missed the line.

## What the page left out, and where it went

**How a look is made.** The recipe is in `_ops/loudon-live/design-system/SKILL.md` § Making a new look. The lessons (ask for a reference first, rough at several distances, record his words verbatim, build the 1920 standalone from the start, start one notch dirtier than seems right) are tuning items 1 to 19 (`94d9b885`). The page's § Looks keeps only each look's identity and his words, so the method can grow without the page growing.

**Provenance of generated plates.** The page names the GenAI route for Cyanotype and Night Signal in a sentence each. The details are in the workshop: the denoise of 0.55 checked against ComfyUI's run history (`cb63fa8d`), and the decision to keep a link to the Moreux photograph rather than a copy of it, on Loudon's word (`79e88bde`).

**The furniture rule's fan-out.** The *Furniture* bullet (Loudon, 2026-11-03: "scroll bars look ugly and ordinary") states the rule. Applying it across the palace was a five-batch fan-out across hundreds of pages (`74d578ec`, `3a6c437a`, `3b3e7a42` and others), plus the house's own audio player on the nine pages that still used the operating system's (`7463e92d`). None of that belongs on the page. It is in git.

## Why it is shaped as it is

**Per-Specialist wiring stays a table of debts.** It has been on the page since May, with the stated intent that each row gets written when its specialist is next invoked, with real evidence, not as speculative spec. One row has changed: Midjourney's routing went to FLUX (`e451140e`). On 2026-11-08 four of the eight Shop specialist pages mention the system (Manim CE, p5.js, ComfyUI, FLUX) and four do not (Matplotlib, Mermaid, Remotion, Tone.js). I got that count by searching each page for the system's name or its CSS file, without reading them in full. The table does not say which rows have been paid.

**Type `source`, stage `growing`.** It has been a `source` since it arrived (`023dd3fd`). The commit gives no reason. The likely one is that it came in as an outside handoff bundle, and its working truth is the skill folder under `_ops/loudon-live/design-system/`, not the page. The page describes the system. The CSS and SKILL.md are the system. When the two disagree on a token, the CSS is the canonical source of every token, as the page's own tree says.

**A link that reads backwards.** `spawned` [[Loudon Live — asset plan]], labelled `cemented-from`, says this page produced the asset plan. The label and § Origin say the reverse: the system was drawn from the asset plan, which now sits in Loudon Live's `Archive/`. I flag it here and don't change it.

For the next hand, things worth recording: whether the two floor lists merge, the BBS line in the forward vector, and each Per-Specialist row as it is paid, with its date and the failure or success that paid it.
