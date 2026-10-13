---
title: "The Daily Page"
type: practice
pillars: [practice, creation, philosophy]
born: 2026-10
stage: sprout
version: "0.1"
forward_vector: "I deal Loudon one palace page each morning and sit with him until he could teach it again — heard, seen or played, not only read. I want every page met once a lap, by chance; I want it to leave the morning more alive or honestly released; and I hand every large change to the rite that owns it."
links:
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: ceremony-registry
  - target: "[[Hilaritas Generator]]"
    type: exemplifies
    label: a-morning-that-plays
  - target: "[[Enrichment]]"
    type: connects-to
    label: makes-through
  - target: "[[Deposit Ceremony]]"
    type: connects-to
    label: a-fold-goes-through
  - target: "[[Baton Ceremony]]"
    type: connects-to
    label: a-verdict-waits-as
  - target: "[[Revival Ceremony]]"
    type: connects-to
    label: a-dormant-page-asks
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: compost-is-confirmed-by
  - target: "[[Walk Ceremony]]"
    type: connects-to
    label: chance-beside-the-path
  - target: "[[Pages as Agents]]"
    type: connects-to
    label: wakes-the-page
  - target: "[[The Remembering Page]]"
    type: connects-to
    label: one-waking-is-a-mood
  - target: "[[Concierge]]"
    type: connects-to
    label: the-elder-in-the-room
  - target: "[[Closing Well]]"
    type: connects-to
    label: the-close-matches-the-work
---

# The Daily Page

Every morning, over coffee, Loudon and a Claude sit with one palace page, dealt by chance, until every page has been sat with. One lap is the whole palace, about eleven months at today's size.

> You are about to spend a morning with one page neither of you chose. That is the point of the shuffle: the page you would not have opened is the one most likely to have gone quiet. Read it the way you would read a letter from a friend you have not heard from in a while. Find out whether Loudon could still teach it. Then try to make it something he can hear, see or play, because a page that will not come alive, however hard you try, has told you something about whether it is a real idea.

A morning does three things to a page, and they lean on each other.

- **Re-teaches it.** The test of a morning is whether Loudon could teach the page afterward.
- **Brings it to life.** The page gets, or moves toward, a rich face. This is the centre of the practice, not an extra.
- **Asks whether it should stand**, with its siblings open beside it: is it useful, is it its own idea, should a neighbor consume it?

## Contract

**Trigger:** the morning's scheduled task; or "daily page", "today's page", "deal today's page" said by hand, which starts the same prep.

**Preconditions:**
1. The main checkout is on `main` and the dealer can run. If it cannot, say what it said and stop.
2. Loudon comes. If he does not, the page stays dealt and not sat, nothing is written, and tomorrow is a new page.

**Postconditions:**
1. The dealer shows the page as sat, with its verdict, and a fold names the page it folds into (`deal.py --status`).
2. The ledger carries the morning's run line, and the morning's commit is on `main`.
3. Every verdict that did not land the same day is a baton on the page that will receive it, announced on the board, or the commit says why there is none (`list-handoffs`).
4. Whatever was written to any page is named in the commit, pointer lines included. "Nothing was written" is said only when it is true.
5. The commit says which close ran, what was checked, and what could not be. No agent hears the piece.

**Failure mode:** a prep that could not run before Loudon arrived (a permission prompt, a sleeping machine, a refusing dealer) is not a failed morning. Say so first, run the prep with him there, and leave the lesson in the ledger.

## What Loudon decided

These are his, each quoted and dated in [[The Daily Page — Context]]. A run does not reopen them.

- **A pure shuffle.** Deal once. No peeking ahead, no second deal, no swapping the page for a better one.
- **Every day.** A missed day does not pile up; the missed page comes round again later in the lap.
- **Bias toward making.** Most mornings, for most pages, try to make the rich face: sound, image, video, interaction. "This process of bringing a page to life is a central animating force of this project. If the page content is so dull that we can't make it exciting we should start to question the validity of the page."
- **Teach.** The sit is a lesson both ways, not an audit.
- **The sibling question is standing.** Every morning the neighbors are opened and the question is really asked.
- **No `dormant` verdict.** A morning never puts a page to sleep. A page already asleep is dealt like any other (below).
- **What one waking asks for is recorded, not applied.** During week one, no `agency_profile` is written after a single waking; the week's review decides.
- **The record is public.**
- **The morning decides; the palace's own machinery does the lifting.**
- **The close matches the work.**
- **We tune as we go.** The practice changes through its ledger, a morning at a time, most of all in its first few weeks.

## Before Loudon arrives

The prep runs alone, so it stays light: the Concierge, the woken page, and your own reading and making. No Shop, no fan-out. It writes three things only: the dealer's own state; roughs in the `roughs` folder beside the dealer, which git ignores; and the wake prompt, in a scratch file. It makes no commit and touches no page.

0. **Summon the Concierge, then open with the tail read** of [[The Daily Page — tuning]] ([[SCHEMA — Reference]] §6). What the last mornings taught, and anything still owed, are the first candidates for doing this one differently.
1. **Deal.** `python3 _ops/daily-page/deal.py`, by the main checkout's path. It prints the page, its siblings, what it has and lacks, and yesterday's page.
2. **Read the page whole, then its bundle, then its siblings**, far enough into each to answer the sibling question honestly. **Then look for what already exists** before you make anything: the siblings' bundles, `Projects/*/proofs/`, the page's history in git ([[Search Before You Build]]).
3. **Write the outside read.** Your own view, taking the chair the page cannot: what it claims in two sentences; what is alive and what is padding; its nearest sibling and the honest case for folding it in; which links carry weight; where it would teach badly.
4. **Wake the page.** `node _ops/daily-page/wake.mjs "<Entry>" > <file>` prints the prompt, redirected into a scratch file; an unnamed `palace-reader` reads that file as the message that woke it ([[Pages as Agents]], [[Agent Toolbox]]). Spawn it, and the Concierge, on Opus, whatever the session itself came up on; Loudon asked for the daily run on Opus. The page is asked what it needs and wants. It is not asked whether it should exist; that judgment comes from outside.
5. **Find the piece.** Walk the page with [[Enrichment]]'s one question: what can only be shown, heard or played here? Prefer a piece that tests the page's claim over one that illustrates it. Read the design manifest first (`_ops/loudon-live/design-system/SKILL.md`). Arrive with one concrete proposal and, where a sitting can manage it, a rough he can play. If no piece can be found, say so plainly and carry it to the verdict as a question about whether the page should stand. That is his rule, not a failure of the prep.
6. **Greet Loudon with the title only**, and wait.

## The sit

The landmarks, in the order that usually serves. The order may bend to the page: on the first morning the rough was played before the page spoke, and that was right.

1. **Title first.** He hears only the name and says what he remembers. What he recalls is what is alive in him.
2. **Read it together.** The outside read, as teaching, in the mode the page asks for ([[Modes of Collaboration]]).
3. **The page speaks**, in its voice. He can talk back; resume the same subagent.
4. **The siblings.** Name the neighbor, what would move, what would be lost.
5. **Yesterday's page.** One honest line. Most days, nothing. A link you had to force is not a find.
6. **Bring it to life.** Play the rough, and change it on his ear. A rough that is to become the rich face is made by [[Enrichment]], by its own steps, in its own worktree ([[Worktree Practice]]). A piece that cannot meet Enrichment's postcondition this morning stays a rough. A rough worth keeping is copied into the `proofs` folder of the bundle that will receive the work, and that page's baton names it. A baton carries a file by pointing at it, so nothing is lost with the ignored folder.
7. **The verdict**, below.
8. **"How do you feel?"** His words go into the record as he said them.

## The verdicts, and the rite each one hands to

| Verdict | What happens | Whose rite |
|---|---|---|
| **keep** | It stands. Nothing is written. | — |
| **trim** | It stands, shorter. Shown to Loudon, then written. | [[Substrate Skill]] § Updating Entries |
| **tune** | Its forward vector changes because Loudon saw the change. Shown, then written. | [[SCHEMA — Reference]] §3 |
| **fold** | A named sibling consumes it. The text crosses by a deposit, with its map and his read; the emptied page then composts. If the content belongs in more than one neighbor, the fold names the one that takes the most, the baton lists the others, and the deposit's map places every part. | [[Deposit Ceremony]] |
| **compost** | The Spore Check's composting note, then `stage: composting`; the next Weave confirms. | [[Spore Check Ceremony]] (the note), [[SCHEMA]] §2 (the mark), [[Weave Ceremony]] |
| **revive** | For a page already dormant: it should wake. Decided here, done by its own rite. | [[Revival Ceremony]] |
| **open** | Not decided today. Say what would decide it. | — |

**A small edit Loudon has read may land the same morning**, written by the Concierge. Everything larger is decided here and done elsewhere: the Concierge writes a commissioning baton on the page that will receive the work, announced on the board ([[Baton Ceremony]] § Where the Baton Lives), and a later session, not a morning, carries it out. The morning is early and meant to be quick.

**A rough on a page that is kept.** A keep or an open writes no baton of its own, and the `roughs` folder is ignored by git, so a rough made for a kept page would be lost. When one is worth keeping, the Concierge copies it into the dealt page's `proofs` folder and writes a commissioning baton there for [[Enrichment]], so the making has somewhere to continue.

**What a waking asks for is recorded, not applied.** [[The Remembering Page]]: "One dialogue is a mood; three consistent ones are a direction." During week one, no `agency_profile` is written after a single waking; the page's answers stay in the record and the week's review decides. A change Loudon himself sees in the sit is ordinary tuning.

**Some pages bring their own rules.** Ask before applying a verdict to: a Shop page (it has a `status`, not a `stage`, and the palace has not said how one composts); a foundational page (CLAUDE, JEWEL, ELDER, SCHEMA and its Reference among them), whose structure changes only by a Schema Ceremony; a ceremony, which changes through its own ledger and version; a person ([[Making a Palace Citizen]]); a stewarded project, whose Plan moves only with his yes and which has no rite yet for leaving stewardship.

## A dormant page

Loudon, 2026-10-13: "Give me a dormant page with the question if it should be revived, that is a nice working of the palace."

A dormant page is dealt like any other and prepped the same way: the reading, the outside read, the waking, a piece if one will come. The outside read adds what the [[Spore Check Ceremony]] would ask: its `revival_conditions`, if it carries them, and what has changed in the palace since it went quiet. The morning's question is whether it should be revived. A page already marked `composting` is asleep in the same way and is asked the same question; the Revival Ceremony takes both.

| Outcome | What happens | Whose rite |
|---|---|---|
| **revive** | Say why now, in one or two plain sentences. The morning does not perform the revival. | [[Revival Ceremony]] |
| **keep** | It stays dormant. Patience, confirmed. Nothing is written. | the Spore Check's *hold* |
| **compost** | The Spore Check's composting note, `stage: composting`, and the next Weave confirms. | [[Spore Check Ceremony]], [[Weave Ceremony]] |
| **fold** | As for any page. | [[Deposit Ceremony]] |
| **open** | Not decided today. Say what would decide it. | — |

Trim and tune are not offered. A sleeping page is not edited in its sleep; if it wants editing, the answer is revive.

**The first revive will be the Revival Ceremony's first run.** No revival has been committed yet, and that ceremony's open baton says its card, as written, breaks against today's palace: it cannot revive a spore, and its Revival Note writes history onto the page. Loudon asked that its redesign be done with care, and a morning before coffee is not that pace. So a morning that says revive leaves a baton on the dormant page: why now, what the waking said, and, if there is a rough, where it was copied in that page's `proofs` folder. The session that catches it catches the Revival Ceremony's own baton first, settles the redesign with Loudon, and then runs the revival. If the page dealt is [[Shimmer Cloud]], that baton already names it as the first revival, with the plan he agreed; the Concierge adds the morning's findings to it, on his yes, and writes no second baton.

## The close

Loudon, 2026-10-13: "Let the close match the work, today's deserved a full close, other days may be quicker."

**A quick morning** — a read and a verdict, nothing made for the palace to carry — gets the short close. It is this ceremony's own movement close ([[Closing Well]] § Scope). Loudon is in the room, and by his own account just waking up, so the short close does not lean on his attention as its check. It is short because the morning left nothing to check but a verdict he has just given, and the Concierge reads the list of what it left.

1. The working Claude marks the page sat: `deal.py --sat "<Entry>" --verdict <one> [--into "<Sibling>"] [--feel "<his words>"] [--made "<what was made>"]`.
2. The Concierge marks the ledger with the run line, which names the page and its verdict, because the scroll shows a morning from that line alone: `- run · <date> · v<version> · <Entry>, <verdict> [into <Sibling>] · nothing new`. A numbered item goes in only if the morning changed this page's spec.
3. The Concierge commits on `main`, by name, through the palace committer, on Loudon's word: `ops(The Daily Page): <date> · <Entry> · <verdict>`. The session is a child and hands this commit over; it does not make it. A dealt line left by a missed morning rides this commit, and the body says so.
4. Say what is on `main` and what you could not verify.

**A morning that made something the palace must carry** — a baton, an edit to any page, a file in any bundle, a rough worth keeping, a question for the palace, a change to this practice — gets a full Closing Well, as the first morning did. That is the session the [[Closing Well Ceremony]] calls substantial. The four steps above still run inside it, and each thing made commits under its own rite: a baton as a baton, an edit as an edit.

As this line is drawn, only a keep or an open that made nothing closes short. A trim, a tune, a compost, a baton or a kept rough each means a full close, and under the bias toward making that is most mornings. He said "other days may be quicker"; asked where the line should sit, he said "that sounds good, we tune as we go." So it stays here until a morning shows it is wrong, and the ledger is where it moves.

**Who notices which morning it was.** Before closing, the working Claude lists what the morning will leave behind and says which close that asks for. The Concierge checks the list against the tree, because whoever made the morning is the worst judge of whether it was quick. Loudon's word decides. When no one is sure, it is a full close. And a question about the practice itself, such as whether a morning cut a corner, goes to a reader who had no hand in the morning.

Closing Well's two scales do not say what a session is when it holds exactly one movement. This page answers only for its own mornings, by what the morning made.

## The record

**The commit is the record**, as it is for every ceremony here. Its body opens with one paragraph that stands alone (the page, what he remembered, the verdict and why, what was made, how he felt), because that is what a reader of the log meets first. Then: what the page asked for; the siblings; what was and was not verified; what the morning taught the practice ("nothing" is a legal answer).

The record is public. Loudon chose that. His own words are his to publish; no one else's are. A student, a colleague or a correspondent is never named in it ([[Sentry]]).

The mornings, newest first, are this page's scroll. It is made by machine, and it shows each morning from its ledger line alone: the date, the page and its verdict, and what the morning taught. The full record of a morning is its commit.

## What this is not

- **Not the [[Walk Ceremony]].** The Walk follows the links from a door you chose; this lands on a page by chance and asks about its links. The Walk holds that a garden walked daily goes invisible. The shuffle is this practice's answer: no page is sat twice in a lap.
- **Not a replacement** for the Weave, the Spore Check, the Revival or Enrichment. It borrows from each, one page at a time, with Loudon in the room.
- **No new frontmatter.** Nothing here adds a field to any page.

---

*The dealer, the wake prompt, the roughs and the scheduled task's shim: `_ops/daily-page/` (README there). Why the practice is shaped this way: [[The Daily Page — Context]]. The version and what each morning taught it: [[The Daily Page — tuning]].*
