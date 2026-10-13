# The Daily Page — a trial

*Working name. Not yet a ceremony and not yet a canon entry: this file is the whole practice while it is being tried. First morning: 2026-10-13.*

Every morning, over coffee, Loudon and a Claude sit with one palace page, dealt at random, until every page has been sat with. It is a slow crawl through the whole palace, one lap of about eleven months at today's size.

A morning does three things to a page:

- **Re-teaches it.** Every idea in the palace gets discussed again. The test of a morning is whether Loudon could teach the page afterward.
- **Brings it to life.** The page gets a rich face: sound, image, video, interaction that make its idea felt in the body. This is the centre of the practice, not an extra. The palace should be rich in things you can hear, watch and play.
- **Asks whether it should stand.** The palace has been liberal with additions, many of them AI-drafted. Each page is asked, with its siblings open beside it, whether it is useful, whether it is unique, and whether a neighbor should consume it.

The three lean on each other. A page that cannot be made exciting, however hard we try, has told us something about whether it is a real idea.

## What Loudon decided (2026-10-13)

- **A pure shuffle.** No weighting, no theme weeks. Chance is where the cross-domain surprises come from.
- **Every day.**
- **A missed day does not pile up.** The next day is a new page. The missed page comes round again later in the lap.
- **The first week is as much about the process as the pages.** See *Week one* below.
- **Bias toward making.** Try to make the rich face, most mornings, for most pages. Move from text toward the visceral.
- **Teach.** The sit is a lesson both ways, not an audit.
- **The sibling question is standing.** Every morning, look at the page's neighbors and really ask whether this page's content belongs inside one of them.
- **No `dormant` verdict.** A page either stands, is folded, composts, or stays open.
- **The Daily Page decides on the fly; proper palace machinery does the lifting.** The sit is quick and early; a fold, a deposit, a baton it decides on starts its own rite.

## Before Loudon arrives

A scheduled task opens the session early. This part runs alone and should stay light: no fan-out, no Shop. Anything that spends many agents waits for Loudon's yes.

Loudon wants the daily run on Opus (2026-10-13). A scheduled task's model is set only in its Edit form in the app (Code tab → Routines → The Daily Page → Edit); no session can set it for him. If a morning comes up on anything else, say so in the process note and remind him.

1. **Deal.** `python3 _ops/daily-page/deal.py` prints today's page with its siblings, what it has and lacks, and yesterday's page. (`deal.py --status` shows where the lap stands.) Both tools read the palace from the main checkout and keep one record there, whichever worktree the session woke in. If this worktree is older than this folder, run them by the main checkout's path: `python3 "$(git worktree list --porcelain | sed -n '1s/^worktree //p')/_ops/daily-page/deal.py"`. If the deal refuses, it says why; tell Loudon and stop there.
2. **Read the last three mornings' process notes** in `record.md` — the main checkout's copy, which is the current one. They are the first candidates for doing this morning differently.
3. **Read the page whole, then its bundle, then its siblings** — every page it links to and every page that links to it, far enough into each to answer the sibling question honestly.
4. **Write the outside read.** This is the working Claude's own view, and it takes the chair the page cannot:
   - what the page claims, in two sentences
   - what in it is alive, and what reads as padding
   - its nearest sibling, and the honest case for folding it in: what would move, what would be lost
   - which links carry weight and which are decoration
   - where it would teach badly
5. **Wake the page.** `node _ops/daily-page/wake.mjs "<Entry>" > <file>` saves the prompt to a file — the session's scratch folder, or the page's folder under `roughs/`. Spawn a read-only subagent (`palace-reader`, unnamed so its reply comes back whole) and tell it one thing: read that file in full, as the message that woke it. Do not paste the prompt. The page says who it is, what it needs, what it desires to meet that need, what it wants to become, how it would get there, and what a person could hear, see or play in its place. The page is not asked whether it should exist. It is written to want more, so that judgment comes from outside.
6. **Find the piece.** Walk the page section by section with [[Enrichment]]'s question: what can only be shown, heard or played here? Prefer a piece that tests the page's claim over one that illustrates it. Arrive with one concrete proposal, and where one sitting can manage it, a rough you can actually play, made in this folder's `roughs/`, never in the page's bundle. (`roughs/` is ignored by git. A rough lasts the morning; what is worth keeping goes into the page's bundle through Enrichment.) Read the design manifest first (`_ops/loudon-live/design-system/SKILL.md`). If no piece can be found, say so plainly; that is a finding.
7. **Greet Loudon with the title only**, and wait.

## The sit

1. **Title first.** Loudon hears only the page's name and says what he remembers. What he recalls is what is alive in him. What the page says that he does not recall is either padding or something worth learning again.
2. **Read it together.** The outside read, as teaching. Pick the mode the page asks for ([[Modes of Collaboration]]): a thinker across the table, a quiz, something to build.
3. **The page speaks.** Its answers, in its voice. Loudon can talk back to it; resume the same subagent.
4. **The siblings.** Should a neighbor consume this page? Name the neighbor, what would move, and what would be lost. Where the page and the outside read disagree, that disagreement is the conversation.
5. **Yesterday's page.** One honest line: do the two have anything to say to each other? Most days, no. A link you had to force is not a find.
6. **Bring it to life.** Play the rough. Decide what the rich face should be and make it — this is [[Enrichment]] at its Sketch tier, and Enrichment's own steps govern the making, the stamping and the commit. A rich face is one of the page's faces, so an elder writes it. A piece that cannot meet Enrichment's postcondition by the end of the morning is still a rough: leave it in `roughs/` and say so in the record. If it will not come alive, say so and let that weigh on the verdict.
7. **The verdict.** One of:
   - **keep** — it stands as it is; nothing is written
   - **trim** — it stands, shorter. An edit, shown to Loudon before it is written ([[Substrate Skill]] § Updating Entries)
   - **tune** — its forward vector changes. An edit shown first; no ceremony ([[SCHEMA — Reference]] §3)
   - **fold** — a named sibling consumes it. Two steps: a [[Deposit Ceremony]] carries the content into the sibling, with its map and Loudon's read; then the emptied page is composted, as below. A fold that would change SCHEMA is a Schema Ceremony, not a Deposit.
   - **compost** — a composting note goes into the page (the [[Spore Check Ceremony]]'s), it is marked `stage: composting`, and the next [[Weave Ceremony]] confirms ([[SCHEMA]] §2)
   - **open** — not decided today; say what would decide it

   Some pages bring their own rules. Shop pages carry a `status`, not a `stage`, and the palace has not said how one composts — ask. The skeleton (CLAUDE, JEWEL, ELDER, SCHEMA and its Reference) changes its structure only through a Schema Ceremony. A stewarded project has a steward that reads its page every cycle and a Plan that moves only with Loudon's yes.

   [[The Remembering Page]] holds that a change a page asks for in its own forward vector is earned across several wakings: "One dialogue is a mood; three consistent ones are a direction." So what a waking asks for in its own forward vector is recorded in `record.md`, not applied. A change Loudon himself sees in the sit is ordinary tuning and may land.
8. **Close.** Ask "How do you feel?" Then record the morning (below).

**What may land the same day:** one small edit to the page and its rich face. No `agency_profile` is written after a single waking during week one: the page's answers stay in `record.md`, and the week's review decides (Loudon held single-encounter write-backs on 2026-07-02, `Making a Palace Citizen.md:128`). Folds and composts are marked and wait for their own rites. The session is a child: every write to the house goes through the [[Concierge]], unless Loudon says grow up. This folder's `record.md` and `roughs/` are the session's workshop, and it writes them itself; this README and the two tools change through an elder.

## The record

- `deal.py --sat "<Entry>" --verdict <one> --feel "<his words>" --made "<what was made>"` marks the page sat. A page that was dealt and never marked sat will come round again.
- `record.md`, newest first, gets the morning in prose: the page, what Loudon remembered, the verdict and why, what the page asked for, what was made, how he felt, and a **process note**.
- Both are written in the main checkout, wherever the session runs, the way every worktree appends to the trunk's one board ([[Worktree Practice]]). When the morning closes, `record.md`, `visits.jsonl` and `lap.json` are committed there, on `main`, by name and nothing else (`palace-commit.mjs --only`, kind `ops`), on Loudon's word.
- A page edit or a rich face made in a worktree sits on that worktree's branch until it is merged. Say at the close what is on `main` and what is not.
- A verdict that does not land the same day waits in these two files and nowhere else yet.
- The record is public, like everything tracked here ([[Sentry]]). It holds Loudon's own words every morning, and he decided on 2026-10-13 that it stays tracked. That was chosen, not overlooked.

**Git rules for the morning's commits** (from the "Palace handoffs coordination" session, 2026-10-13, which leads the palace's git work; they hold until that session or Loudon says otherwise):

- The main checkout stays on `main`. Work lands by merge commits; no rebase, no history rewrite, no branch switch there.
- Stage with explicit pathspecs only. Never `git add -A` or `git commit -a`: other sessions keep uncommitted work in the tree.
- Never stage `_ops/swarm/persistent/blackboard.jsonl` unless your own script appended the line you are committing.
- Never stash, check out, or otherwise touch another session's uncommitted files. Ask that session or Loudon.
- Check `git branch --show-current` before and after every commit. Before any merge into main, `git merge-tree --write-tree main <branch>` must be clean.
- A commit subject uses a kind the hook knows (`ops`, `edit`, `enrich`, `handoff`, `baton`, `merge`). `sketch` and `close` are not kinds.
- If a commit fails on `index.lock`, another session is mid-commit. Wait ten seconds and retry. Do not remove the lock.
- Nothing under `_ops/stigmergy/app/server/` or `_ops/orchestrator/prompts/` lands while a steward run is live.
- Never POST to the live STIGMERGY on :5173 from a script or a test.

The record lives here, not in the pages' bundles. What an ordinary page's bundle should hold is being rethought ([[Palace Ceremonies]]' open baton), and this trial should not get ahead of it. The rich face is the exception: it goes where Enrichment puts it.

## Week one — the first seven mornings Loudon sits

For the first seven mornings Loudon sits, judge the morning as closely as the page. A missed day is not one of the seven, so a miss does not shorten the week. Every record carries a process note. After the seventh, read the seven together and rewrite this file.

Things to watch:

- How long a sit takes, and whether that length is one Loudon wants every day.
- Whether the prep is too much or too little by the time he sits down.
- Whether the woken page says anything the outside read did not.
- Whether a playable piece in a morning is realistic, and for which kinds of page.
- Whether sending every write through the Concierge slows the making too much.
- What a morning costs in tokens. The first waking tried this way (Hilaritas Generator, 2026-10-13) cost about 48K: more than the 13.6–26.5K measured for a bare `palace-reader`, because the page opened its neighbors.
- Whether title-first is a pleasure or a test.
- Whether a Sketch a day changes a page or only decorates it. Enrichment was rebuilt around depth because small pieces spread over many pages "never transformed one" ([[Enrichment — tuning]] item 1).
- Where a verdict that did not land the same day waits, and who picks it up.

## What this is not, yet

- **Not a ceremony.** Naming one is a Schema Ceremony. If the trial holds, that is the next step: the mornings in `visits.jsonl` become run lines in its tuning ledger, and its scroll is made from those.
- **No new frontmatter.** Nothing here adds a field to any page.
- **Not a replacement** for the Weave, the Spore Check or Enrichment. It borrows from all three: the Weave's vector tuning, the Spore Check's dispositions, Enrichment's making, done one page at a time with Loudon in the room.

## Files

- `deal.py` — the dealer. The shuffle, the lap, a missed day: its header explains each.
- `wake.mjs` — the prompt that wakes the day's page, built on the deck's own Enchant prompt.
- `lap.json`, `visits.jsonl` — the dealer's record; written by `deal.py`, not by hand. Tracked; they appear on the first morning.
- `record.md` — the mornings, in prose.
- `roughs/` — playable roughs made before a sit, one folder per page. Ignored by git (`.gitignore` here); made when the first rough is.
