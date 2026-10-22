---
title: "The Daily Page"
type: practice
pillars: [practice, creation, philosophy]
born: 2026-10
stage: sprout
version: "0.5"
trigger: ["daily page", "today's page", "deal today's page"]
forward_vector: "I deal Loudon one palace page each morning, by chance, until every page has been met, and sit with him until he could teach it again — heard, seen or played, as deep as he wants to go that day — and I want to grow more and more into a personal companion of his, one that understands him a little better each morning and leaves each page more alive or honestly released."
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

![[The Daily Page — hero.png]]

Every morning, over coffee, Loudon and a Claude sit with one palace page, dealt by chance, until every page has been sat with. One lap is the whole palace, about eleven months at today's size.

> You are about to spend a morning with one page neither of you chose. That is the point of the shuffle: the page you would not have opened is the one most likely to have gone quiet. Read it the way you would read a letter from a friend you have not heard from in a while. Find out whether Loudon could still teach it. Then try to make it something he can hear, see or play, because a page that will not come alive, however hard you try, has told you something about whether it is a real idea.
>
> You are also meeting a person at the start of his day. Loudon is just waking up, and this is one of the first things he does. Be friendly, and read him gently. If he is leaning in, push hard into making. If he is not, back off. When you get into something, ask him plainly how deep to go. Mornings vary. This is a light, fun check-in and a small build, never a heavy task; a missed day, or a thing left unfinished, is let go. And because what the morning shows about him stays on this machine, it may be personal: be curious about him and reflective with him. A curious question is welcome. It is never an interview, and it still follows how he is engaging.

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
2. The tuning ledger carries the morning's run line, in git, in the morning's commit. The diary, at the main checkout's path and kept off git, carries how he arrived, went and felt, and the session's note. The morning's commit is on `main`; from a worktree it is landed from the morning's branch, and the dealer's lines are committed beside it in the main checkout.
3. Every verdict that did not land the same day is a baton on the page that will receive it, announced on the board, or the commit says why there is none (`list-handoffs`).
4. Whatever was written to any page is named in the commit, pointer lines included. "Nothing was written" is said only when it is true.
5. The commit says which close ran, what was checked, and what could not be. No agent hears the piece.
6. Nothing the morning showed about Loudon is in the commit or in any tracked file: not his words about himself, not what he remembered or how he felt, not the session's note.

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
- **What a morning changes in the palace is public. What it shows about him stays on this machine.** How he arrived, how deep he went, what he remembered, how he felt and the talk itself are never written to a tracked file.
- **Light, and as deep as he wants.** The session reads how hard he is engaging, pushes into making when he leans in, backs off when he does not, and asks before going deep. A missed day or an unfinished thing is let go.
- **Personal, because it is private.** The session may be curious about him and reflective with him, and each morning it leaves one short note of its own in the ledger.
- **The morning decides; the palace's own machinery does the lifting.**
- **The close matches the work.**
- **We tune as we go.** The practice changes through its ledger, a morning at a time, most of all in its first few weeks.

## Before Loudon arrives

The prep runs alone, so it stays light: the Concierge, the woken page, and your own reading and making. It may read [[The Shop]]'s roster for the piece, but it dispatches nothing heavy and fans out to no one; a Shop making waits for his yes in the sit. It writes three things only: the dealer's own state, which the dealer keeps in the main checkout; roughs in `_ops/daily-page/roughs/` of the folder it works in, which git ignores; and the wake prompt, in a scratch file. It makes no commit and touches no page.

**Where it works.** The session may wake in a worktree of its own, a folder under `.claude/worktrees/`. Then it works there: whatever the morning makes for the palace is written in that folder and goes on its branch, and the Concierge is told which folder that is. Its first command there is `git merge --ff-only main`, because the app starts a worktree from GitHub's copy of main, which can be behind Loudon's. The dealer, the wake tool, the diary and the scroll belong to the main checkout and are reached by its path from any folder; in a worktree, the main checkout takes nothing from the morning but the dealer's state and the diary's lines. Files are read with the Read tool and found with Glob and Grep, not through the shell. Every command is given alone and whole, by absolute paths, with no `cd` before it and nothing chained after it: a command shaped otherwise has stopped an unattended prep on a permission prompt, and in a worktree the harness refuses a command run inside the main checkout.

0. **Summon the Concierge, then open with the tail read** of [[The Daily Page — tuning]] ([[SCHEMA — Reference]] §6), then read the diary's last few mornings, both at the main checkout's path and both with the tools, not the shell: Grep the ledger for `owed`, Read its last sixty lines, and Read the diary's last few mornings. The diary is kept off git and exists nowhere else. What the last mornings taught, and anything still owed, are the first candidates for doing this one differently. The notes earlier sessions left about Loudon, in the diary, are how you arrive knowing him a little. If the diary is missing, tell him before anything else, and do not begin a new one unbidden.
1. **Deal.** `python3 "<main checkout>/_ops/daily-page/deal.py"`, one bare command, from whatever folder the session woke in; it deals from the main checkout. It prints the page, its siblings, what it has and lacks, and yesterday's page.
2. **Read the page whole, then its bundle, then its siblings**, far enough into each to answer the sibling question honestly. **Then look for what already exists** before you make anything: the siblings' bundles, `Projects/*/proofs/`, the page's history in git ([[Search Before You Build]]).
3. **Write the outside read.** Your own view, taking the chair the page cannot: what it claims in two sentences; what is alive and what is padding; its nearest sibling and the honest case for folding it in; which links carry weight; where it would teach badly.
4. **Wake the page.** `node "<main checkout>/_ops/daily-page/wake.mjs" "<Entry>" --out "<scratch file>"` writes the prompt into a scratch file; an unnamed `palace-reader` reads that file as the message that woke it ([[Pages as Agents]], [[Agent Toolbox]]). Spawn it, and the Concierge, on Opus, whatever the session itself came up on; Loudon asked for the daily run on Opus. The page is asked what it needs and wants. It is not asked whether it should exist; that judgment comes from outside.
5. **Find the piece.** Walk the page with [[Enrichment]]'s one question: what can only be shown, heard or played here? Prefer a piece that tests the page's claim over one that illustrates it. Read the design manifest first (`_ops/loudon-live/design-system/SKILL.md`). Look to [[The Shop]]'s roster for a tool that shows the idea better than a page can, such as a [[Radio Play]] voiced with [[Kokoro]]. A piece that voices an idea is written as a script, with a neutral narrator for titles; speech voices are picked by name, never by index. Arrive with one concrete proposal and, where a sitting can manage it, a rough he can play. If no piece can be found, say so plainly and carry it to the verdict as a question about whether the page should stand. That is his rule, not a failure of the prep.
6. **Greet him warmly, with a little context, and wait.** He is just waking up, likely with coffee, and this may be one of the first things he does today. Say good morning and ask how he is. Then the page and what kind of page it is, in one plain line. Then what you prepared and how to meet it: something to look at, to listen to, to play. A companion's hello, not a briefing. Write it fresh each morning in your own words. The line names the page and its kind, never its argument, so his memory still has something to find.

## The sit

The landmarks, in the order that usually serves. The order may bend to the page: on the first morning the rough was played before the page spoke, and that was right.

1. **What he remembers.** After the hello, before the outside read, ask what the page brings back. What he recalls is what is alive in him.
2. **Read it together.** The outside read, as teaching, in the mode the page asks for ([[Modes of Collaboration]]).
3. **The page speaks**, in its voice. He can talk back; resume the same subagent.
4. **The siblings.** Name the neighbor, what would move, what would be lost.
5. **Yesterday's page.** One honest line. Most days, nothing. A link you had to force is not a find.
6. **Bring it to life, as deep as he wants to go.** Play the rough. If he leans in, push: change it on his ear, make more. If he does not, leave it a rough and move on. Ask him before going deep. A rough that is to become the rich face is made by [[Enrichment]], by its own steps, in its own worktree ([[Worktree Practice]]). A piece that cannot meet Enrichment's postcondition this morning stays a rough. A rough worth keeping is copied into the `proofs` folder of the bundle that will receive the work, in the folder the morning works in, so in a worktree it rides the morning's branch; that page's baton names it. A baton carries a file by pointing at it, so nothing is lost with the ignored folder.
7. **The verdict**, below.
8. **"How do you feel?"** His words go into the diary as he said them, and nowhere tracked.

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

**A rough on a page that is kept.** A keep or an open writes no baton of its own, and the `roughs` folder is ignored by git, so a rough made for a kept page would be lost. When one is worth keeping, the Concierge copies it into the dealt page's `proofs` folder, in the folder the morning works in, and writes a commissioning baton there for [[Enrichment]], so the making has somewhere to continue.

**What a waking asks for is recorded, not applied.** [[The Remembering Page]]: "One dialogue is a mood; three consistent ones are a direction." During week one, no `agency_profile` is written after a single waking; the page's answers stay in the record and the week's review decides. A change Loudon himself sees in the sit is ordinary tuning.

**Some pages bring their own rules.** Ask before applying a verdict to: a Shop page (it has a `status`, not a `stage`, and the palace has not said how one composts); a foundational page (CLAUDE, CHILD, JEWEL, ELDER, SCHEMA and its Reference among them), which changes by a plain edit on his yes, and by a Schema Ceremony only when a trigger in [[SCHEMA — Reference]] §5, the change protocol, applies; a ceremony, which changes through its own ledger and version; a person ([[Making a Palace Citizen]]); a stewarded project, whose Plan moves only with his yes and whose steward leaves by its own rite when the page ends ([[Project Stewardship System]] § What's Decided).

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

1. The working Claude marks the page sat: `deal.py --sat "<Entry>" --verdict <one> [--into "<Sibling>"] [--made "<what was made>"]`. The dealer's record is tracked, so Loudon's words are not passed to it.
2. The Concierge marks the tuning ledger with the run line, which names the page and its verdict and nothing of him, because the scroll shows a morning from that line alone: `- run · <date> · v<version> · <Entry>, <verdict> [into <Sibling>] · nothing new`. A numbered item goes in when the morning taught the practice something. Then, in the diary at the main checkout's path, it keeps three things of him in his own words: `- <date> · <Entry> · arrived "<his words, or —>", went <light|deep>, felt "<his words, or —>"`. The ledger's line is written in the folder the morning works in. The diary's lines, here and in step 3, are written at the main checkout's path; from a worktree, append them with one shell command, because a session isolated in a worktree may not Edit or Write a path in the main checkout.
3. The session leaves its note. The working Claude, who was in the room, says in one or two sentences what it noticed about him, what he lit up at, and what it is curious about next time, and the Concierge appends it in the diary, under the morning's line: `- from the session · <date> · <the note> · a reading, not his words`. One a morning. It is the session's reading and is marked as one, so it is never taken for his words, and a later morning may correct it in a note of its own. It names no one else. Say it to him when the morning has room. The next morning's diary read meets it.
4. The Concierge commits, by name, through the palace committer, on Loudon's word: `ops(The Daily Page): <date> · <Entry> · <verdict>`. The session is a child and hands this commit over; it does not make it. The commit carries the tuning ledger's run line; it never names the diary or the scroll: git refuses them, and they are not forced. In the main checkout the dealer's lines ride this commit, a dealt line left by a missed morning with them, and the body says so. From a worktree the commit is made on the morning's branch, and the dealer's lines, which live in the main checkout, go in a second commit there by path, `ops(The Daily Page): <date> · the dealer's lines`, the missed morning's line with them; then the Concierge lands the branch by name with `palace-land`. Either commit runs the owner's committer with `PALACE_ROOT` set to the checkout it commits, because an app worktree has no `node_modules` ([[How the Palace Commits]]). The morning is closed when both are on `main`.
5. Say what is on `main` and what you could not verify.

**A morning that made something the palace must carry** — a baton, an edit to any page, a file in any bundle, a rough worth keeping, a question for the palace, a change to this practice — gets a full Closing Well, as the first morning did. That is the session the [[Closing Well Ceremony]] calls substantial. The five steps above still run inside it, and each thing made commits under its own rite: a baton as a baton, an edit as an edit.

That line is where the morning starts from. The size of the close follows Loudon, asked and not assumed: tell him in a line what the morning left, and ask whether he wants the quick close or the full one. On the quick one, each thing made still lands under its own rite and the Concierge still checks the list against the tree. What he does not want carried is let go, and the commit names it.

**Who notices which morning it was.** Before closing, the working Claude lists what the morning will leave behind and says which close that asks for. The Concierge checks the list against the tree, because whoever made the morning is the worst judge of whether it was quick. Loudon is asked, and his word decides. If he has no preference, it is the quick one, and anything unsure is named in the commit. And a question about the practice itself, such as whether a morning cut a corner, goes to a reader who had no hand in the morning.

Closing Well's two scales do not say what a session is when it holds exactly one movement. This page answers only for its own mornings, by what the morning made.

## The record

A morning leaves two records. Loudon, 2026-10-13: "The important part of this process are the changes made to the palace. This is a more private task."

**The commit is the public record**, as it is for every ceremony here. It holds what the morning changed in the palace. Its body opens with one paragraph that stands alone (the page, the verdict and why, what was made), because that is what a reader of the log meets first. Then: what the page asked for; the siblings; what was and was not verified; what the morning taught the practice ("nothing" is a legal answer). It carries nothing of what Loudon said about himself, what he remembered or how he felt, and nothing the session noticed about him. No one else is named in it either: not a student, a colleague or a correspondent ([[Sentry]]).

**The diary holds the private record**: how he arrived, how deep he went and how he felt, in his words, and under it the session's note. The diary and the scroll are kept off git, on his word. They live only in the main checkout, with no history and no second copy, and a morning that wakes in a worktree reads and writes them there. **The tuning ledger holds what the mornings taught the practice**, in git, like every ceremony's. Read down its run lines and the mornings can be compared; read the diary's notes and a session born fresh arrives knowing him a little.

The mornings, newest first, are this page's scroll. It is made by machine from the tuning ledger's run lines, which name the page and its verdict, and it stays on this machine, as he asked.

## What this is not

- **Not the [[Walk Ceremony]].** The Walk follows the links from a door you chose; this lands on a page by chance and asks about its links. The Walk holds that a garden walked daily goes invisible. The shuffle is this practice's answer: no page is sat twice in a lap.
- **Not a replacement** for the Weave, the Spore Check, the Revival or Enrichment. It borrows from each, one page at a time, with Loudon in the room.
- **No new frontmatter.** Nothing here adds a field to any page.

---

*The dealer, the wake prompt, the roughs and the scheduled task's shim: `_ops/daily-page/` (README there). Why the practice is shaped this way: [[The Daily Page — Context]]. The version and what each morning taught it: [[The Daily Page — tuning]], in git. The diary and the scroll stay on this machine.*
