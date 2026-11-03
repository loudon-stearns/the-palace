---
title: "The Gallery — Context"
born: 2026-11-03
links:
  - target: "[[The Gallery]]"
    type: connects-to
    label: context-of
  - target: "[[The Shop — Context]]"
    type: connects-to
    label: the-shape-it-reads-from
forward_vector: "I hold why The Gallery is shaped as it is — the three palace shapes it borrows, why stewardship was left alone at its birth, what was held back from the Schema Ceremony, what is not biography, and Loudon's decisions of 2026-11-03 in his words — so the next worker can change the page without redoing the thinking."
---

# The Gallery — Context

Why [[The Gallery]] is shaped as it is. Read this before you edit the page or its Plan.

## Where it came from

On 2026-11-03 Loudon asked for a new region of the palace: a complete interactive timeline of his professional and creative life that is also an archive of as many of his creative and educational works as can be found, from school onward, shaped the way [[The Shop]] is shaped. A child session drafted a plan and a media-store spec on the Concierge's gather of the house that morning; the Concierge placed them as this page, its scroll and its bundle on his yes the same day. The drafts' prior art is listed at the end.

## Three shapes it borrows

- **A folder that holds one kind** — `Shop/` holds only Specialists and Makers, `People/` only persons (`_ops/Substrate Skill.md` § Directory Structure). Works need such a folder so they are canon pages that link into the palace, not bundle files. Membership is declared on the member side and the parent's roster is computed, the way `Shop/Maker/build-roster.mjs` computes the Shop's (`The Shop — Context.md` § What it leaves to others).
- **A parent that spawned children** — [[Generative Sample Libraries]] is `type: project` and `spawned` [[Talking Keyboard]] (`phase-1-pilot`), [[Phoneme Choir]], [[Generative Wavetable Libraries]] (`split-off`) and [[Splice Instrument Forge]] (`splice-arm`); each child is a flat project with its own scroll and, where it earned one, its own steward; Talking Keyboard is `status: complete` and `emerged-from` the parent. The stewardship system already says "Stewardship is recursive within projects" (`Projects/Project Stewardship System.md` § What's Decided).
- **A project with a root folder beside it** — `Projects/Loudon Live.md` is the project and `Loudon Live/` at the root holds its toolchain.

The word "wing", which Loudon used, does not occur in the palace; its words are folder-of-one-kind, hub and organ. The page uses them.

## The sub-project question, and why stewardship is untouched

Sub-projects are not a thing stewardship knows. The decision at birth: mint the parent alone and spawn children as flat projects when they earn a Plan. That is growth over design and costs nothing if the family never grows past two. Three read-model gaps would earn one change once a family of three exists; they are named here so they are a known direction, not a rediscovery:

- The PROJECTS deck groups rows by need — needs you, ready, stalled, tended, no steward (`STIGMERGY.md` § The projects deck; `_ops/stigmergy/app/src/components/projects/ProjectsDeck.jsx`) — so a parent and its children scatter. A read of the `emerged-from` link would let it fold children under the parent.
- A parent's Now is computed from its own board traffic (`_ops/stigmergy/orchestrator/src/scroll-file.js`); a roll-up line per child is a materializer change, no new wire type.
- The heartbeat has no family sense: the batch takes the first N due, least recently active first — four stewards, two cycles each, every two days as `_ops/heartbeat/limits.json` stands today (`_ops/heartbeat/README.md`). A family of four could take a whole batch. A child that depends on Loudon (interviews) should run on his click, not the heartbeat; whether `stopping_conditions` already expresses that is unchecked.

All three are read-model and scheduling changes, not schema. They sit on the Plan as one move, taken only when the flat deck hides the whole.

## The name

**The Gallery** / `Gallery/`, Loudon's word on 2026-11-03. It rhymes with The Shop / `Shop/`: a place pieces are hung when they earn it, in the studio register the Shop keeps. The drafts were "The Works", "The Record" and "The Long Line".

## What was held back from the Schema Ceremony

No frontmatter field says when a thing happened; `born` is the month the page was made, and `person` pages carry `born_year` / `died_year` for the human. A field meant for many entries is a Schema Ceremony (`SCHEMA — Reference.md` §3, field discipline). So the dated-event grammar (`when:` as a year, a month, a span or a `~` remembered value, with a `when_note`) lives in each work's catalog YAML until a dozen works have used it, and a `work` type with `when`, `role`, `with`, `where`, `era`, `medium`, `holdings` is proposed from proven use, not before. The first work pages are `type: source` with `author: Loudon Stearns`, the shape [[Synthesis Notes (Loudon)]] already took.

## Not biography

- `Projects/Phoneme Choir/proofs/2026-05-05-wikipedia-stub-2050.md` is an invented 2050 encyclopedia entry on "Loudon Stearns". A made thing; the timeline never reads it as fact.
- "Former Berklee professor, founder of the LMPD program at Berklee NYC" exists only as a claude.ai session's paraphrase in a workshop file (`Projects/Cycle 5 Explorer/import/BRIEF.md`). Loudon confirms it before the timeline states it.

## Two facts of the house that shape everything

1. **No home in git for old audio and video.** `.gitignore` keeps `Projects/**/*.wav|mp4|mov|…` on this Mac (Loudon, 2026-10-18), with one exception, `rich-face/**`, written for a chosen take (Loudon, 2026-10-20). No git LFS. Hence the store on Dropbox, specified in [[The Gallery — spec — media store]] and built for the whole palace.
2. **The public face is narrow by rule but the Gallery is public by his word.** `Projects/Loudon Live.md` § What the palace's public face holds back keeps out highly personal data and anything that risks his finances; [[Sentry]] sweeps before anything widens the surface. Loudon, 2026-11-03: "I am not concerned about privacy, this should all be public facing including interviews." So no `public` flag on works. Sentry still sweeps for secrets and third parties, and a collaborator's consent to publish their recording is theirs to give.

## What Loudon decided on 2026-11-03

- The name: "the gallery".
- The center of gravity: "make the system, then fill it as much as possible, then move to interviews of me and collaborators".
- "I am not concerned about privacy, this should all be public facing including interviews".
- Dropbox as the store; "what we develop here can be used in many other aspects of the palace".
- Open with the parent alone; children spawned as flat projects when they earn a Plan; no change to stewardship now.
- The era-map interview: the next morning, 2026-11-04, around 7 a.m. — read from his line "only 7s tomorrow morning", not quoted as a time.

## Where the drafts were corrected on placement

- The Dropbox plan was an open question in the plan; `~/.dropbox/info.json` reports `subscription_type: "Pro"` (not a team account), read as the Professional tier, so the 1 TB-a-day shared-link line applies and the question is closed.
- `/usr/bin/brctl` was confirmed present on this Mac.
- The plan's "heartbeat at 06:00" became the limits as `limits.json` states them; the clock is launchd's and was not verified.
- The plan's claim that the Talking Keyboard leaving rite ran on 2026-10-21 was not verified and is not repeated; its `status: complete` and `emerged-from` link were.
- The spec's "merged by union like the other ledgers" is not yet true of a `— store.jsonl`: `.gitattributes` names only tuning ledgers and diaries. The spec now says the line is owed.

## Prior art the drafts stood on

The Concierge's gather of 2026-11-03 (in the session, not the house): [[The Shop]] and its Context; [[Identity Molting]] (its vector asks for a catalogue of molt events across Loudon's history as musician, teacher, technologist, collaborator); [[Quality Manifesto]] (a dated practice log); [[Oblique Portrait]] § The Sensory Autobiography and [[Lateral Access]] § Personal Grounding; [[Loudon Live]]; [[Loudon's Toolkit]] and its `— context — assessment.md`, the multi-session interview notebook; [[Meadows and an Artist's Career]] and its two-column Leverage Diagnostic; [[Symbiotic Skills]] (the pre-git prehistory); `_ops/Harvest Ceremony/Harvest Ceremony — Context.md` ("Google Drive? Project archives?"); [[Making a Palace Citizen]] (the cited, context-tagged speech file); [[Synth Templates]]'s `workshop/build-site.py` (catalog plus card page as one self-contained HTML); `_ops/rich-face/` and `build-public.mjs`; the two design systems.
