---
title: "Palace Ceremonies — baton"
born: 2026-09-26
links:
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: "baton-for"
  - target: "[[The Scroll]]"
    type: connects-to
    label: "shared-machinery"
  - target: "[[Revival Ceremony — baton]]"
    type: connects-to
    label: "sibling-question"
  - target: "[[SCHEMA — Reference]]"
    type: connects-to
    label: "lands-in"
forward_vector: "I carry the in-progress move on [[Palace Ceremonies]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Palace Ceremonies

## Move
Land Loudon's 2026-10-14 answers across the palace: make ledgers a loose family any page can keep, each saying in its frontmatter how it is used; give the first-person kind its own name, the diary; and mark a ceremony with a field instead of a ledger.

*Provenance: posed 2026-09-26 (let any page that runs earn a ledger and a scroll, then decide what "ceremony" means); widened in place 2026-09-27 (§ The 2026-09-27 re-carving, and § Where the two days pull apart); answered by Loudon 2026-10-14 (§ Decided 2026-10-14), with the enchanted [[The Remembering Page]] consulted from another session. The board card's one-liner still carries the 2026-09-26 wording.*

## Why this move matters
The ledgers of 2026-09-25 made the thirteen ceremonies correct themselves: every run leaves a line, each lesson moves a version, and each run reads what's owed first. The same loop fits anything that runs repeatedly. But today a ledger *is* the definition of a ceremony, twice over:
- § What Makes a Ceremony: "the ledger is how the machinery finds one"
- the code: `ceremony-scroll.js` ("a ceremony is any entry with a tuning ledger"), and the PROJECTS deck's CEREMONIES group (`projects.js`)

So a ledger on any other page would be mislabelled a ceremony.

The 2026-09-27 conversation found the ledger question can't be settled alone: opening tuning to any page moves Standing Orders and sharpens the line between the scroll and the rich face. That re-carves the bundle pattern itself — a structural change, so it lands through a Schema Ceremony (SCHEMA — Reference §8, last paragraph of the type table; §5).

## Tried and rejected
- A Shop-only design (2026-09-26): ledgers for specialists and makers, a SHOP group on the deck, and SCHEMA — Reference §6 widened to "a ceremony or a Shop tool". Loudon rejected it as a carve-out: "we must not get myopic around the shop." Its general parts carry over (below).
- The scroll's trail as a bare index — dated lines saying "see the rich face for the thing itself" (2026-09-27, mid-conversation). Superseded in the same conversation: Loudon's worked example puts every output on the scroll, in order.
- The Plan moving into tuning (2026-09-27). Rejected: the Plan is for the reader and belongs at the front door, beside Now.
- Standing orders moving into tuning (2026-09-27). Rejected 2026-10-14: an owed line is paid once, so a standing order there loses its permanence. Only one-shot orders go to the ledger.
- Gating a ledger behind a threshold or a run count (2026-10-14, the survey's Q2 options). Rejected as too tight: a page adds one when it is useful.
- Calling the diary "memory" (2026-10-14). Rejected: the word already carries too many meanings.
- Naming every ledger `[Entry] — ledger — [kind].md` (2026-10-14). Rejected: it renames fourteen ledgers and their links for a pattern-match the code can get another way.
- Keeping "has a ledger" as the mark of a ceremony, or making the tables the mark (2026-10-14). The first makes everything that learns a ceremony; the second lost to a field that people and scripts read alike.

## Current state
Nothing built yet. Next move steps 1–3 are done: the survey is [[Palace Ceremonies — sketch — runs survey]] (2026-10-13, `70db9f52`), and Loudon answered on 2026-10-14 (§ Decided 2026-10-14). What's known from before:
- *The ledger rules* are in SCHEMA — Reference §6 (Versions, tuning, and run reports): version, run lines, numbered items, owed and paid, Loudon's orders, the tail read, union merge. The §8 `tuning` row calls a ledger "a ceremony's", and keeps "gotcha" for a Specialist's tool traps.
- *Where repeated runs already happen*, each recording them its own way:
  - Shop specialists and makers: dated Gotchas on the page, a prose "last run", `last_tested`, and the Maker noting a gotcha at delivery (`Shop/Maker.md:73`)
  - steward cycles (`history.jsonl`, and the project scroll's making trail)
  - map builds (already a ceremony)
  - Dialectic runs (now gathered in its folder)
  - generators such as `Projects/2D Torus Wavetable Synthesizer/Tools/build_catalog.py`
  - probably harvests, radio plays, Loudon Live sessions, the Weave's linters
- *General ideas from the Shop draft*:
  - the page states today's gotchas and the ledger holds their history
  - "how this page works" gets its own version, separate from any upstream tool's version
  - where a script drives a run, the script does the tail read itself
  - automated runs mark the ledger too
  - a fixed gotcha leaves the page when its item is paid
- *A test case waiting*: the faces batches of 2026-09-26 taught lessons a ledger would have caught. One line each:
  - Two figures close in a warm room read as a couple — fixed with ages, a pointing gesture, seen from behind.
  - Naming a shape after an everyday object draws the object.
  - FLUX won't draw a shadow "shaped like" something; it draws the thing.
  - Carry `_renders/` out of a worktree before removing it.
  - FLUX can't draw a bowtie inlay as hero or icon — composite it instead.
  - A print inside a framed panel can't be strip-trimmed — patch the flat margin.
  - FLUX turns an arrow into its up-and-right growth sign, and once into a letter N.
  - A front-view shape sorter reads as a traffic light.
  - FLUX cuts every hole round.
  - The endpoint's GPU list can run dry late at night; the client's 15-minute wait covered it.
  - Tool: the 409 from submitting too soon, and GPU parking not shared between agents — fixed in `43f53bae`.
  - Tool: one-sided place and unrecorded seeds — fixed in `5d3c0d60`.
- *Related*: [[Revival Ceremony — baton]], which also touches what a ceremony is.

## Decided 2026-10-14
Loudon's answers, taken question by question through the survey's Part B. **Agreed, not yet canon**: nothing lands until the Schema Ceremony does. The spirit of every answer is his: *write it loosely so pages can innovate.*

1. **A run is whatever unit each page names in its own text.** The default is one start-to-finish act of the page. The test: a run is the unit whose lesson the next run should read before it starts. Outputs stay in the workshop and on the scroll, never in the ledger. For a remembering page, one encounter is a run. (Survey Q1, option c.)
2. **Files come easily.** A page used to make things gets a scroll. A page that learns how it could have done better gets a ledger. A page that finds another good reason for an append-only file adds one, and a page may keep several. Pages may use ledgers outside the spec; those uses are the examples the spec grows from, not errors. No threshold, no count. (Survey Q2, beyond all three options.)
3. **"Ledger" names a family**: any append-only file a page keeps so its next run or waking starts from what came before. The first two kinds:
   - **tuning** — what running taught (today's ledgers);
   - **diary** — a page's first-person record of the encounters it has lived, the Remembering Page's word ("If the pheromone trail is the worn path, this is the diary").

   "Memory" stays the name of the group in [[CLAUDE]] § A page and its folder; the diary takes its own word because "memory" already means too many things. Each kind keeps its own file name — `[Entry] — tuning.md`, `[Entry] — diary.md`, and whatever a page invents — so the fourteen ledgers (thirteen in git, plus The Daily Page's, kept off git) and their links stay put. Union merge must reach every kind (`.gitattributes` names `* — tuning.md` today). The family already has a member beyond tuning: Palace Quotes' JSONL placements ledger (`_ops/Palace Quotes/Palace Quotes — placements.jsonl`, merged by union), and Making a Palace Citizen already calls a citizen's Context file "its growth ledger" (`Making a Palace Citizen.md:129-130`).
4. **Every ledger states its own standards and practices in its frontmatter** — what it is for and how it is used properly — so anyone who opens it understands it. Loudon added this mid-walk; it is what lets the canon stay loose. It formalizes what ledgers already do in prose: every bundle file's forward vector must be self-documenting (`SCHEMA — Reference.md:276`). A first sketch, for the ceremony to refine — the key is not `practice`, which is already a type and a pillar:
   ```yaml
   ledger: tuning
   standards:
     for: what running the Map Build taught it
     run: one map build
     line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
     read: the last 40 lines with run lines set aside, plus every line not yet paid
     writes: the run itself, in the commit that records it
   ```
5. **A tuning item records what a run taught**, version or not. A page that has a version moves it when a lesson changes how it runs. The Remembering Page's two ideas go in as examples, not rules: a lesson about *how* applies after one run, a lesson about *who* — what the page wants — waits until it recurs; and a "seen again" mark on an item shows a fix that keeps being re-fixed. A Specialist's page keeps today's gotchas; its ledger, once it has one, keeps their history. (Survey Q3, option b; 2026-09-27 open question 5.)
6. **Orders split by kind, not by page.** Standing orders — hold until revoked — stay on the scroll for every page, ceremonies included. One-shot orders go into the tuning ledger as owed lines, which a run pays. Every scroll may have a Plan, a ceremony's too. (Survey Q4, option b; open questions 1 and 6.)
7. **Now is one renderer built from whatever the page has**: a status line; a runs block from a tuning ledger; the last encounter from a diary; a board block if stewarded; the newest trail entry. `last_tested` becomes computable and can retire. (Survey Q5, option c; disagreement 3.)
8. **A ceremony is a named rite the palace runs on itself, marked by a frontmatter field** that people and scripts both read. A ledger, a version or a scroll no longer marks one. The field replaces the ledger test in the code and the hand-kept lists in `entry-edit.js` and `commit-spec.js`. Loudon chose the field over the tables as the marker. (Survey Q6, option c with b's meaning.)
9. **A rich face may hold pieces for the whole page**, beside its heading-keyed sections; Kuramoto's opening sound bed already does. How a showcase knows it lags waits for a second rich face, ideally a project's. (Survey Q7; disagreement 2, open question 3.)
10. **A baton aimed at part of a bundle** carries a qualifier in its name and a second link labelled `targets` to the file it is about, beside its `baton-for`. The baton executor learns to write both, which pays Baton tuning item 10. (Survey Q8; open question 4.)

**The Remembering Page's other findings**, offered 2026-10-14 from its own session and checked:
- **The diary has a collision to clear first.** Brian Eno's and John Cage's encounter records live in their Context files today (`People/Brian Eno/Brian Eno — context.md`, `People/John Cage/John Cage — context.md`, three encounters each, forward vectors calling them "Brian Eno's own memory"). That is legal today: `CLAUDE.md:55` says the Context holds why the page is shaped as it is, but the §8 `context` row still reads "long-running session-history companion" (`SCHEMA — Reference.md:285`). Narrowing that row and adding a `diary` row moves them to `— diary.md`, on the same branch, so no link breaks.
- **The tail read answers the cost of reading, not drowning.** It filters by recency, and the encounter that made a self is usually its oldest. Its proposal keeps the file append-only: a *settling* entry, appended at each molt (when Loudon adopts a change to the forward vector), folds the episodes before it into a few first-person lessons; a waking reads the latest settling, the episodes since, and everything still owed. The owed grep stays. This is [[Drift and Consolidation]] at the scale of one page, and a settling is to a diary what a version is to a tuning ledger.
- **The survey has no row for pages that remember.** Woken person-pages run too.

**Still open after 2026-10-14:**
- how many recurrences earn a change to what a page wants (one pair, one topic, says the third);
- what one run is when three or more pages meet, each keeping its own partial record;
- whether a diary ever settles between molts, for a page lived often that never changes;
- the sub-keys inside a ledger's `standards` (a sketch is in the propagation plan, Wave 0).

**The names, settled the same evening** (the propagation plan's Wave 0): a ledger states its rules under **`standards`** beside `ledger: <kind>`; a ceremony is marked by **`trigger:`**, the list of words Loudon says — the structured form of the `**Trigger:**` line twelve specs already carry; Connection, Query and the Ceremony Reader stay **table-only**; the two lines in SCHEMA — Context that use "diary" for a failure are **reworded**. And two calls the plan raised: **`trigger:` goes on `Closing Well.md`** (where its version, ledger and scroll already sit; the trigger table's link moves there), and **The Daily Page's ledger splits, no gates** — Loudon's words and the session's reading of him into a private `— diary.md`, the practice lessons into a tracked `— tuning.md`.

**Tensions to name in the Schema Ceremony's record, not resolve away** (found by the [[Concierge]], 2026-10-14):
- *"Diary" is the palace's word for a failure.* SCHEMA — Context says a tuning record is "a record of changes rather than a diary", and "A ledger no run reads is a diary" (`SCHEMA/SCHEMA — Context.md:191,235`). A diary in the new sense is read at every waking ([[Palace Enchantment]] loads it, `Projects/Palace Enchantment.md:277-279`) — that is the difference to name.
- *Loudon's own 2026-05-03 principle pulls against "files come easily"*: keep knowledge in the entry "until it becomes clearly unmanageable. Auxiliary markdown files for findings/lessons/decisions duplicate palace state" (`Projects/Generative Sample Libraries/Generative Sample Libraries — lessons — stage-a.md:33`). Both stand; the record says how they live together.
- *Decision 5 reverses v1.20's stated reason* — that an item is written only when a run changes the spec (`SCHEMA/SCHEMA — Context.md:189-191`). The record names the reversal and why.

## The 2026-09-27 re-carving
Nothing built this day either. **A proposal, not agreed canon.** Each file answers a different question:
- **Context — why.** Why the page is shaped as it is, what was tried and dropped. It grows only when the page's shape changes, never per run.
- **Scroll — what happened, complete.** Now (pure live status), the Plan, and the making: every output and run, append-only, newest first. Barely changed from today.
- **Rich face — the best of it, curated.** What the page can do right now. For a project, proofs, diagrams, interactives; for a prose page, its enrichment. Pieces are replaced as the page gets better; a replaced piece still sits on the scroll. The line against the scroll: curated-and-replaced versus complete-and-appended.
- **Tuning — what running taught.** Open to any page that runs: ceremony, specialist, tool, agent-page. Read before each run. One thin line per run; a numbered item only when a run taught something. **Standing Orders move here** — they are aimed at the next run, as the ceremony case already does (`SCHEMA — Reference.md` §8 `scroll` row). **The Plan stays on the scroll** (reader-facing). A page with no ledger keeps both on its scroll, as today.
- **Individuation (Loudon).** The skeleton is defined or strongly recommended; each page sets its own specifics to its needs.
- **Batons may target any part of a bundle** — the entry, one output, the rich face, the ledger, the Context. Loudon: "basically a strong to-do within a bundle."
- **The worked example — a mature Generative Sample Libraries turning out many instruments.** One run writes two lines for two readers: the scroll gets the output ("made a marimba patch, here's the file"); the ledger gets the process ("velocity layers thin; widen the pool"), which the next run reads before it starts. Keeping them apart is the point: the next run shouldn't wade through a hundred "instrument made" lines, and a visitor shouldn't parse tuning notes to find the files.

**Left open by 2026-09-27:**
1. **Standing Orders versus owed lines.** A standing order is permanent; an owed line is paid once and done. Today a ceremony's order becomes an owed line (`SCHEMA — Reference.md` §6, "An order from Loudon") — does that cost it its permanence? And do the Plan and the owed lines replace each other (a ceremony's scroll has no Plan) or coexist at different heights — the Plan the direction a reader sees, the owed lines the next run's to-do?
2. **What one run is for a generator making dozens of things a day — one instrument or one batch?** §6 already gives every run a thin line, and the tail read sets run lines aside (`grep -v '^- run · '`), so reading the ledger won't drown. Still open: the unit, and whether a scroll line plus a run line double-log one event.
3. **How a project's rich face knows it lags.** A rich face is fingerprinted against the prose it was made from (§8 `rich` row). A capability showcase has no prose to lag — anchor it to the newest numbered tuning item? the newest scroll entry?
4. **How a portion-targeted baton names its target.** Don't reuse `context-of`: it already means "this Context file belongs to that entry" (§6, §8). Keep `baton-for` to the parent and add a second link to the targeted file. Several batons on one entry already use the qualifier slot (`STIGMERGY — baton — latest-opus-resolver.md`), but `baton-executor.mjs` can't write qualifiers yet (Baton Ceremony — tuning item 10, owed).
5. **Specialist Gotchas versus a general ledger.** §8 keeps "gotcha" for a Specialist's tool traps; the Shop draft's idea (above) was that the page states today's gotchas and the ledger holds their history.
6. **The machinery Standing Orders touch.** They are edited only on the PROJECTS deck and injected into every steward cycle from the scroll's `scroll:orders` markers (`_ops/Substrate Skill.md` § The scroll's zones and § The read seam; `The Scroll.md` § The project scroll). Moving them changes `scroll-file.js`, the deck, and the steward's read seam.

## Where the 2026-09-26 and 2026-09-27 considerations pull apart
Loudon asked that these stay visible, not smoothed over. All four were settled on 2026-10-14 (§ Decided 2026-10-14: 1 by decision 2, 2 by 9, 3 by 7, 4 by 2); they stay here as posed.

1. **The pair.** 2026-09-26 treats "a tuning ledger and a scroll" as one thing a page earns together. 2026-09-27 gives the two different jobs and splits the old Plan-and-Orders zone between them: Plan to the scroll, Standing Orders to the ledger. Canon today already splits them by whether a ledger exists (`The Scroll.md:63-67` against `133-136`). If that holds, "earn a ledger and a scroll" is two decisions, not one, and the move sentence is the wrong shape.
2. **The rich face.** 2026-09-26 says nothing about it. 2026-09-27 does **not** take outputs off the scroll — the making trail still holds every one, so the faces test case and canon's "a project's proofs and media" on the scroll (`CLAUDE.md:53`; `The Scroll.md:68-71`) survive. What 2026-09-27 adds is a curated showcase on the rich face, and *that* runs against canon's rich face: "laid beside the words, section by section" (`CLAUDE.md:53`), a heading-keyed manifest fingerprinted to prose (§8 `rich` row). A capability showcase isn't keyed to prose headings. One of those texts changes. *(Corrected 2026-09-27 from an earlier widening that read the re-carving as moving outputs off the scroll.)*
3. **What the scroll's Now shows.** 2026-09-26 step 2 asks what Now shows for a page that isn't a ceremony. 2026-09-27 kept Now as pure live status and did not answer it; still open.
4. **Whether a scroll is earned at all.** *(Found in canon by the first widening, not raised in either conversation.)* Any entry may already carry a scroll (`SCHEMA — Reference.md:290`; `The Scroll.md:140`); only the ledger is gated. 2026-09-26 speaks of earning both; 2026-09-27 doesn't say.

## Next move
1. ~~Survey where runs happen across the palace and how each records them now.~~ Done 2026-10-13: [[Palace Ceremonies — sketch — runs survey]].
2. ~~Bring Loudon definitions, with no carve-out for any one area.~~ Done 2026-10-14.
3. ~~Settle them with him.~~ Done 2026-10-14: § Decided 2026-10-14.
4. **Plan how the answers propagate through the palace, with Loudon** (asked 2026-10-14): the canon the Schema Ceremony changes, the code, every existing ledger brought up to decision 4 (its standards stated in its frontmatter), the ceremony field on every ceremony page, and proposals for new ledgers — pages whose bodies carry history a ledger should hold, or whose use a ledger would refine. The plan lives beside this baton as a sketch: [[Palace Ceremonies — sketch — propagation plan]], drafted 2026-10-14 and waiting on Loudon's yes, wave by wave.
5. Land the canon and code through a Schema Ceremony (SCHEMA — Reference §5), on Loudon's yes to the plan. The survey's Part C is the starting list.
6. Pilot on pages that aren't ceremonies: the Hero and Avatar Maker (tuning, seeded from the faces lessons above) and Generative Sample Libraries (tuning, from the lesson sections of its `DESIGN.md`) — **only after the code's ceremony test reads `trigger:`**. On today's code a `— tuning.md` in a bundle makes its page a ceremony (`ceremony-scroll.js:142-151`): it shows in CEREMONIES as "not versioned yet", its Plan is refused and its orders go to the ledger; a stewarded page like GSL is also listed twice and its Now gets two writers. (Checked in the code by the Concierge, 2026-10-14.) Brian Eno's and John Cage's diaries move inside the Schema Ceremony itself; the code never looks at diaries. Then the plan's Wave 3b proposals, one at a time.

## Calibrations from this session
- Loudon: "We must not get myopic around the shop and adding a specific carve out for it."
- Loudon: "Any page can have a tuning ledger and a scroll when it earns it."
- Loudon: "Consider if we need a different way to define ceremony."
- This needs a thoughtful session, not the pace of a cleanup day.
- Loudon (09-27): leave room for individuation — every page can grow these files; the structure is defined or strongly recommended; the entry sets its own specifics.
- Loudon (09-27): batons in a bundle are "basically a strong to-do within a bundle," about the entry or about its outputs.
- Loudon (09-27): "This needs careful discussion to implement and integrate into the palace" — a baton, not a deposit.
- Loudon (10-14), on earning: "If it feels useful to have either, they are added. It is not difficult to obtain either, we should be happy when a page creates outputs." And: "Write it loosely so pages can innovate, don't over-specify and allow pages to even use them outside of spec so that we have examples to grow with."
- Loudon (10-14), on the diary: "I am worried about the term 'memory' being used so many ways, so this specific use will need a new term. And it feels like a ledger to me, maybe not a tuning ledger, but it is another kind of ledger, a journal or diary — perhaps these are just kinds of ledgers?"
- Loudon (10-14): "All ledgers, regardless of what they are used for, should state in the file the standards and practices for that ledger. So one could open it up and understand from the frontmatter what it is used for and how it is used properly."
- Loudon (10-14) chose a frontmatter field over the ceremony tables as the marker of a ceremony.

## Load these files first
0. *Added 2026-10-14, read first:* § Decided 2026-10-14 above; [[Palace Ceremonies — sketch — runs survey]]; `The Remembering Page.md`; `People/Brian Eno/Brian Eno — context.md`; `Making a Palace Citizen.md`; `Projects/Palace Enchantment.md` § Context Construction; [[Palace Ceremonies — sketch — propagation plan]].
1. `_ops/Palace Ceremonies.md` § What Makes a Ceremony, and How It Changes
2. `SCHEMA — Reference.md` §6 (Versions, tuning, and run reports) and §8's `tuning` and `scroll` rows
3. The header comments of `_ops/stigmergy/orchestrator/src/ceremony-scroll.js` and `_ops/stigmergy/app/server/projects.js`
4. `The Scroll.md`
5. One ceremony ledger: `Closing Well/Closing Well — tuning.md` or `_ops/Map Build Ceremony/Map Build Ceremony — tuning.md`
6. `Shop/Hero and Avatar Maker.md` and `Shop/Kokoro.md` § Gotchas
7. `_ops/Revival Ceremony/Revival Ceremony — baton.md`
8. `CLAUDE.md` § A page and its folder, and `SCHEMA — Reference.md` §8's `rich` row (added 2026-09-27)
9. `_ops/Substrate Skill.md` § The scroll's zones and § The read seam (added 2026-09-27)
10. `Projects/Generative Sample Libraries/Generative Sample Libraries — scroll.md` (added 2026-09-27)

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted (authored on a surface that couldn't commit — e.g. Cowork), commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it (the [[Surfaces and Capabilities]] catalog can be stale) — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
