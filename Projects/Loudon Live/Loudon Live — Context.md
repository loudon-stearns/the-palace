---
title: "Loudon Live — Context"
born: 2026-11-08
links:
  - target: "[[Loudon Live]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Loudon Live is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Loudon Live — Context

This is for whoever next works on [[Loudon Live]]. More pages point at it than at any other project. That is part of the problem: it has meant three different things in six months, and some of the old meanings are still in the pages that point at it. This file records each of those meanings and what replaced it, what the page keeps somewhere else, and why it reads the way it does now. The page itself says it is a moving target and that it wins when another page disagrees. This file is the record of how it moved.

## Three portraits

**May: a curriculum channel.** The page first shows up in git on 2026-05-02 as a `hub` (`605aefc0`). It called itself "the umbrella for Loudon's online teaching project: a YouTube channel of long-form recorded sessions in which instruments and tools designed in the palace become the curriculum." Its sections followed from that: *The form: a session is the unit* (60 to 90 minutes, one stage of one project), *The curriculum: project-fueled, stage-shaped, pillar-organized* (every project cut into five sessions through [[Progressive Staging]]), *The reputation architecture*, and open questions about cadence, launch threshold and the signature instrument. A week later the cleanup commit changed it to type `project`, stage `sprout` (`a5ca537b`). The commit gives no reason.

**September: the whole public self.** On 2026-09-26 Loudon set the curriculum down. Loudon Live became "the name of his whole public self — a loose online presence building slowly, not a scaffolded teaching method" (`a22b039b`). The rewrite took out the session unit, the five-session curriculum, the reputation architecture and the launch-era open questions. It recorded them under Lost branches, and the page keeps that section on purpose, so the old plans can be found from the page itself. The change reached 37 files in one commit. Progressive Staging lost its Loudon Live mandate. Four project plans dropped their framing of every move as a session. The To-Do lost its September launch.

**October: the teaching and coaching face.** On 2026-10-14 the Daily Page drew Loudon Live, and the verdict was *tune*. It is his professional persona and teaching and coaching face, online and in person. One-on-one coaching already runs, and videos and livestreams for electronic musicians come next (`016ec791`). Loudon approved the map row by row, and the new portrait was carried across about sixteen pages. In the same deposit the "whole public self" reading became a lost branch, and the *A moving target* paragraph was written so that a reader who meets an older portrait elsewhere knows which one is current.

## What was tried and dropped

**The Curriculum Map.** It is in this bundle's `Archive/`, retired 2026-09-26. It was the scaffolding for the May portrait. It listed three entry-point projects with no prerequisites (Shepard Tone in Ableton alone, Crystal Synthesizer and Retrospective Delay in basic Max), two five-stage arcs drawn as dependency trees, thematic arcs that were mostly still "*to be staged*", a table of twenty unstaged projects sorted by how accessible they were, and an *Identified Gaps* list of foundation sessions nobody had made (Gen~ for sound designers, RNBO fundamentals, a first M4L device, JSUI drawing). It handed two finds on before it was archived: the circular buffer at two scales went to [[Compressor Design]], and the Auditory Illusions series seed went to [[Shepard Tone Synthesizer]]. The gaps list was let go (`a22b039b`). The `project-stage-builder` skill that read the map was removed in the same commit. What the map shows about the dropped approach is that it treated projects as prerequisites for each other, and its tables graded each project's hook quality. Both ways of seeing were dropped with it.

**The priority guide of 2026-05-04.** It is archived beside the map. It sorted every project into four attention tiers: *Active focus*, *Maintain momentum*, *Background warm* and *Hibernation*, "consciously held back". It was the palace's first attempt to give each project attention in proportion to its rhythm. The Hibernation tier went with the Hibernation Ceremony on 2026-05-28 (`c82561a1`). Some of that work is now done by each scroll's Now. The guide is a snapshot of May, not a method anyone keeps.

**The asset plan.** It is archived here too, retired 2026-09-25 because "the Loudon Live Design System built all of it" (`adc728ee`). Its idea, a channel grammar that stays locked under a fresh skin for each stream, became the design system's six skins. The "locked" half softened into the floor in July (see [[Loudon Live Design System — Context]]).

**A reputation engine.** The May page called the channel a platform for later income: an original hardware line, and teaching commissioned by manufacturers. It was set down in September, and those hopes were left as Loudon's own in [[Loudon's Toolkit]] (`a22b039b`).

## What the page left out, and where it went

**The parts' detail.** The RTM series was a subsection of the May page. It now has its own page, [[LDN RTM]], which holds the format, the rig and the queue. This page names each part in a line.

**The public face's mechanics.** The two doors were settled on 2026-09-25 (`5eac9572`), the read view went live the same day (`67c820c0`), and widening it was gated on a clean [[Sentry]] sweep (`b63b896b`). On 2026-09-26 Loudon gave his rule for what the read view keeps back, in his words: "those interested can understand who I am through exploring" (`16e8e514`). How the view is built belongs to [[STIGMERGY]] § The read view. This page keeps only the decision and the rule. The URL changed with the GitHub account on 2026-10-05 (`3a36791b`).

**His own assessment of the coaching.** The October deposit made the fact of the coaching public on his yes, and kept his self-assessment off git (`016ec791`, postcondition 6). Don't add it back.

**The look and the channel copy.** These belong to the [[Loudon Live Design System]] and to `Loudon Live — launch kit.md` in the bundle. The launch kit was first committed in May (`a5ca537b`). The October deposit touched it (`016ec791`), but it still opens on getting "Stream #1" on the air, in the channel portrait's terms.

## Why it is shaped as it is

**Parts, not a method.** "The parts, right now" and "Beside it, for now" are lists on purpose, so a new part can join in one line. The page says it: "the name holds the whole, not a format." Lost branches holds all three earlier portraits so that the body never has to explain itself.

**Type and stage.** It is a `project` with no steward and no agreed plan. The scroll's Now has no Plan, and its trail holds a test render of a starting-soon card from the bundle's `toolchain/` and the Daily Page's *The Logo, Heard* (2026-10-14). It went from `sprout` back to `growing` in the October Weave (`6c356eb4`). At its last regeneration the scroll still read `sprout`.

**Links that keep old meanings.** The link to [[2D Torus Wavetable Synthesizer]], `couples-with`, labelled `signature-instrument-candidate`, survives from the May question of whether the Torus ships as the channel's signature device. The September rewrite dropped that question from the page (`a22b039b`). The audience link went to the other side in the one-link-per-pair fold. [[Autodidact Polymaths]] holds it, as `couples-with`, labelled `in-the-background` (`769c93ad`). The page moved from the root into `Projects/` on 2026-10-12, so saved app and read-view links to the old path stopped opening (`9671412f`).

**Old portraits still out there.** The September commit lists what it did not touch: Standing Orders belong to Loudon, so the scrolls whose orders still speak of sessions were left alone (`a22b039b`). Crystal Synthesizer's orders still name "autodidact polymaths" as the audience and give sessions a making-to-framing ratio. This scroll's own Now carries a note to change a Blood Compressor footer from the retired "· Autodidact Polymaths" stamp. Under the page's own rule, these defer to it. Changing them is Loudon's call, or the touching hand's when it is in that file anyway.

For the next hand, worth recording: the first video or livestream that actually airs, which part it belongs to, and Loudon's answer to the page's question of whether a stream wants a typed link here or lives on the project's scroll.
