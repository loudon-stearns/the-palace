---
title: "Palace Ceremonies — sketch — propagation plan"
born: 2026-10-14
links:
  - target: "[[Palace Ceremonies — baton]]"
    type: connects-to
    label: next-move-step-four
  - target: "[[Palace Ceremonies — sketch — runs survey]]"
    type: connects-to
    label: builds-on
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: sketch-for
forward_vector: "I am the plan for carrying Loudon's 2026-10-14 answers about ledgers, scrolls and ceremonies through the whole palace — the canon, the code, every ledger that exists, and the pages that should grow one. I decide nothing; I wait for his yes, wave by wave. I am done when the last wave has landed or been let go; then I go to Archive."
---

# Palace Ceremonies — sketch — propagation plan

How the answers in [[Palace Ceremonies — baton]] § Decided 2026-10-14 reach the rest of the palace. Read that section first; this page assumes it and uses its numbering. The survey's Part C ([[Palace Ceremonies — sketch — runs survey]]) is the file list this plan starts from; the [[Concierge]] checked it against [[SCHEMA — Reference]] §5 on 2026-10-14 and its corrections are folded in.

**Nothing here is decided.** Each wave waits for Loudon's yes. Where I recommend, I say so.

## The order, and why

Names first, then one Schema Ceremony, then the code, then the new ledgers.

- **The names** (Wave 0) come first because the ceremony writes them into fifteen ledgers and fourteen ceremony pages.
- **One Schema Ceremony** (Wave 1) carries the canon *and* the backfill of every existing ledger *and* the diary move, on one branch. Drift rides on stale examples — the v1.12 lesson, when the wire's field conventions "were inferred from examples… the examples drifted, so the wire did too" (`SCHEMA — Reference.md:325`): a canon that says "every ledger states its standards" beside fourteen ledgers that don't would teach the next agent the old shape. And the Eno and Cage files rename on the same branch as the canon that names the diary, so no link is ever broken on main.
- **The code** (Wave 2) follows the canon it reads, in its own worktree, and can be its own session.
- **New ledgers** (Wave 3) are the examples the loose canon points at. Two pilots are seeded on the ceremony's branch so the canon lands with live examples; the rest follow one at a time, each a small edit on Loudon's yes.

## Wave 0 — names to settle with Loudon

1. **The ledger's self-description.** Recommend two keys, on top of the minimal bundle frontmatter every file already carries (`title`, `born`, `links`, `forward_vector`):
   ```yaml
   ledger: tuning            # the kind; a page may invent one
   standards:
     for: what running the Map Build taught it
     run: one map build
     line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
     read: the last 40 lines with run lines set aside, plus every line still owed
     writes: the run itself, in the commit that records it
     merge: union
   ```
   `standards` is Loudon's own word ("the standards and practices for that ledger"). Not `practice` — already a type (`SCHEMA.md:87`) and a pillar; not `kind` — used informally for `kind: artifact`. Only `ledger` and `standards.for` are required; a kind fills in what it needs — a diary adds `settles:`, when and how old episodes fold into lessons. A JSONL ledger carries the same keys in its first line, the way the placements ledger's header already describes itself (`_ops/quotes/README.md:43`).
2. **The ceremony field.** Recommend `trigger:`, a list of the words Loudon says:
   ```yaml
   trigger: ["deposit", "let's deposit", "add this to the palace", "memorialize this"]
   ```
   Twelve specs already carry a body line `**Trigger:**` (Harvest, Map Build, Return, Revival, Self-Model Update, Spore Check, Walk, Weave, Closing Well Ceremony, The Daily Page, Sentry, and the Ceremony Reader inside Palace Ceremonies), and `_ops/swarm/lint-doc-drift.py:249` already checks them against the trigger table in [[CLAUDE]]. The field is that line made structured, so people, the linter and the deck read one thing. The alternative is an explicit `ceremony:` block holding the triggers; it says what it marks more plainly, at the cost of a second name for one idea. Edge cases to settle while naming it:
   - **Connection, Query and the Ceremony Reader** have triggers but no page of their own; they live in [[Palace Ceremonies]]. Either that page carries their triggers, or they stay table-only.
   - **Closing Well has two pages.** The trigger names `Closing Well Ceremony` (`CLAUDE.md:88`), which has no version and no ledger; the version (1.7) and the ledger sit on `Closing Well.md`. The field goes on one.
   - **The Schema Ceremony** has no trigger words, no ledger, and no page of its own — it is §5 of the Reference.
3. **Union merge for every kind.** Recommend one `.gitattributes` line per kind, added when the kind first appears (`"* — diary.md" merge=union`), and named in the ledger's `standards.merge`. Today's file already does this twice (`.gitattributes:4,8`).
4. **"Diary" already means a failure in one place.** SCHEMA — Context says a tuning record is "a record of changes rather than a diary", and "A ledger no run reads is a diary" (`SCHEMA/SCHEMA — Context.md:191,235`). Recommend rewording those two lines in the v1.28 record, so in the palace "diary" means one thing: the record a page reads at every waking.

## Wave 1 — the Schema Ceremony

**SCHEMA v1.27 → v1.28, MINOR.** Every past reversal or removal went MINOR (`breakthrough` v1.17, staging v1.25, `activation_count` v1.26); MAJOR is Loudon's to invoke. No branch claims 1.28. Run per §5's six steps, in a `docs` worktree, landed with `palace-land`. Commit: `Schema Ceremony — ledgers become a family; a field marks a ceremony — v1.28`. **The CLAUDE.md lines go in their own commit, on Loudon's own word** — the v1.27 precedent (`fa9f80a7`). Loudon reads each canon text before it is written; the Concierge checks placement before and after.

**Which decisions are ceremony events**, by §5 and precedent:

| # | Decision | Kind of change |
|---|---|---|
| 2, 3 | Any page keeps ledgers, several; the family; the diary | **Event** — the bundle pattern (§8, `:301`) and `CLAUDE.md:55` |
| 4 | Each ledger states its standards in frontmatter | **Event** — new fields on many files (`:104`) and §8's minimal-YAML table (`:269-276`) |
| 8 | The ceremony field | **Event** — §5's "adding a ceremony" test changes, and a new shared field (`SCHEMA.md:79,87,101`) |
| 1, 5, 6 | Run unit; items record what a run taught; orders by kind | Ride in the ceremony — §6 rule changes have all gone through one (v1.21–v1.23, v1.25). 5 reverses v1.20's stated reason; the record names it |
| 7 | One Now renderer | Code; one §8 `scroll` sentence rides along |
| 9 | Rich face, whole-page pieces | Routine `rich`-row edit; can wait for a second rich face. Leave `CLAUDE.md:53` alone |
| 10 | Baton `targets` | Routine: a new label, and an edit to the Baton spec with its own version and tuning item |

### 1a. The canon

| File | What changes |
|---|---|
| `CLAUDE.md` *(own commit, Loudon's word)* | `:55` — the ledger becomes a family a page keeps when useful, each kind saying how it is used, the diary named; not "kept only by ceremonies". `:10` version, `:12` `last_schema_ceremony`. |
| `SCHEMA.md` | `:101` — a ceremony is a page carrying `trigger:`. The "adds" column for `meta` and `practice` (`:79,87`). Version. |
| `SCHEMA — Reference.md` §3 | The `trigger:` field (`:104` — shared fields). `last_tested` and `last_gotcha` retired as computable. |
| `SCHEMA — Reference.md` §6 | Retitled for any page that keeps a ledger. A run is the page's own unit. An item records what a run taught; a page's version moves when a lesson changes how it runs (`:212,227-228`). Orders split — standing on the scroll, one-shot owed in the ledger (`:230-232`). **Recommend dropping** the `ceremony_version` stamp and the "What this run taught" run-report section (`:213-214`): no run report has carried either (survey A1). The how/who split as an example. |
| `SCHEMA — Reference.md` §8 | Minimal-YAML table (`:269-276`): ledgers add `ledger` and `standards`. `context` row (`:285`) narrowed to why the page is shaped as it is. New `diary` row. `tuning` row (`:291`) — any page, "one per ceremony" goes. A sentence that ledgers are a family, with tuning, diary and placements as the examples. `scroll` row (`:290`) — a Plan on any scroll, standing orders on every scroll, Now built from what the page has. `baton` row (`:284`) — the `targets` link. `rich` row only if decision 9 goes now. |
| `SCHEMA/SCHEMA — Context.md` | The v1.28 record, by section: the decisions and why, the Remembering Page's part, the v1.20 reversal named, the 2026-05-03 tension named ("Auxiliary markdown files… duplicate palace state" against "files come easily"), and the two "diary" lines reworded (Wave 0.4). |
| `_ops/Palace Ceremonies.md` | § What Makes a Ceremony (`:101`) — the field, not the ledger; the tables stay as the reader's index. Where a ceremony's orders go (`:105-106`). |
| `The Scroll.md` | `:129`; the project and ceremony scrolls become one scroll whose Now shows what the page has (`:49-71`, `:127-142`); standing orders (`:133-137`). |
| `_ops/Substrate Skill.md` | `:84`, the ceremony paragraph; the zones and the read seam (`:156-178`). Also a §5 mirror. |
| `The Shop.md`, `Shop/Maker.md` | Specialist anatomy: the page keeps today's gotchas; a ledger, once kept, holds their history; "Last run" computed. |
| `_ops/orchestrator/prompts/shared.md` | A steward offers a lesson in a payload field and the machinery writes the ledger line; the steward reads owed lines beside the scroll's standing orders. |
| `_ops/Baton Ceremony.md` + its tuning | Decision 10: the qualifier and `targets` link; the spec's version moves, with a tuning item. |
| `The Remembering Page.md` | "Where it lives" names the diary; the drowning hunger points at the settling proposal. A change to what the page says, so Loudon reads it. |
| `.gitattributes` | `"* — diary.md" merge=union`. |
| §5 mirrors | `ROSETTA.md`, `README - The Palace Guide.md`, `SUBSTRATE.md`, `_ops/Substrate Skill.md` — check each, say so where nothing changes. |

### 1b. Every ledger that exists today

Each gets `ledger` and `standards`, written from what it already does — no ledger changes how it runs. Each ceremony page gets `trigger:` from its trigger row.

| Ledger | run | runs · owed today | Note |
|---|---|---|---|
| Baton Ceremony | one baton passed | 13 · 5 | |
| Closing Well | one close | 11 · 6 | the two-pages question (Wave 0.2) |
| Deposit Ceremony | one deposit | 7 · 11 | most owed of any ledger |
| Map Build Ceremony | one build | 13 · 1 | its run lines already carry node, edge and ghost counts |
| Sentry | one sweep | 6 · 1 | `sweep.mjs --record` writes its own line; `writes:` says so |
| Return Ceremony | one return | 2 · 6 | |
| Enrichment | one enrichment of one page | 1 · 1 | |
| Harvest Ceremony | one harvest | 0 · 1 | its run reports never reached the ledger (survey A1) |
| Weave Ceremony | one weave | 0 · 6 | items grouped by weave date, no run lines |
| Walk Ceremony | one walk | 0 · 2 | the card requires the run line (`_ops/Walk Ceremony.md:42`) and waives it (`:38,66`); `standards` settles which |
| Self-Model Update Ceremony | one revision of SUBSTRATE | 0 · 1 | |
| Spore Check Ceremony | one review of every spore | 0 · 1 | never run |
| Revival Ceremony | one revival | 0 · 1 | never run; its own baton is open |
| The Daily Page | one morning | kept off git — main checkout only | already names its run unit in its own text (`:13`); its run lines carry how Loudon arrived and how he felt — a ledger already bending toward "How do you feel?", the kind of example the loose canon wants to keep. Edited in the main checkout, never committed. |
| Palace Quotes — placements (JSONL) | one placement or decision | — | already self-describing in its header line; the header gains `ledger` and `standards` |

### 1c. The diary move

`People/Brian Eno/Brian Eno — context.md` → `— diary.md`, and John Cage's: title, H1, the `memory-of` label, `ledger: diary` and `standards` (its forward vector already states its rules, `:6,12-16`). Then every link: `Making a Palace Citizen.md` (`:129-130,161`, "its growth ledger" → diary), `Making a Palace Citizen/Making a Palace Citizen — context.md` (`:80-84,94,101,203`), `Projects/Palace Enchantment.md` (`:277-279`, the "memory ledger" loader), and the three Eno–Cage dialectics in `Modes of Collaboration/Dialectic/`. No code loads these files (`git grep` finds none). Whatever is left in Context — why each citizen is shaped as he is — stays there, or the Context retires if nothing is left.

### 1d. Verify before landing

- §5's postcondition: mirrors consistent, `lint-doc-drift.py` clean on errors, the commit subject in form. Its errors are only case collisions (`_ops/swarm/lint-doc-drift.py:15-21`), so also run what v1.27 ran: `lint-ghost-links`, `lint-bundle-hygiene`, `lint-entry-naming` — the rename is exactly what they catch.
- The self-description test (SCHEMA §7), aimed at the change: could a fresh instance open any ledger and know what it is for and how to use it?

## Wave 2 — the code

In a `stigmergy` worktree, landed with `palace-land`; a session of its own once Wave 1 is settled. **Before touching any file in the Vite config graph, check that no steward is running** — an edit there mid-run rebuilds an empty lane and blinds the deck.

- **The ceremony test** reads `trigger:` instead of "a ledger exists" (`ceremony-scroll.js:7-9,141-171`); so do the deck's CEREMONIES group, the two hand-kept lists (`entry-edit.js:119-125`, `commit-spec.js:40-54`), and `lint-doc-drift.py:243`, which today finds specs by "ceremony" in the filename. Seven registers become one.
- **One Now renderer** from what the page has (`ceremony-scroll.js:317-356` and `scroll-file.js:394-450` become one), with a diary block (last encounter) beside the runs block and the board block.
- **A Plan on every scroll** (`scroll-file.js:496`, `projects.js:378`, `scroll.js:84`).
- **Orders by kind**: the deck asks "standing, or once?"; standing to the scroll zone, once to the tuning ledger as owed (`projects.js:344-348`); the cycle prompt reads both (`build-cycle-prompt.js:201-231`).
- **A steward's run line**: `process-cycle.js` writes it when a cycle ends, with the steward's offered lesson.
- **The face maker's run line**: `regen-lane.js` writes it when the companion door makes a face.
- **The baton executor** writes qualifiers and the `targets` link (`_ops/closing-well/baton-executor.mjs:153`), paying Baton tuning item 10.
- **`last_tested`** computed from run lines; `Shop/Maker/run-tests.mjs:125-137` stops writing it.
- Tests beside each, in `_ops/stigmergy/orchestrator/tests/` and `_ops/stigmergy/app/tests/`.

## Wave 3 — new ledgers

### 3a. Pilots, seeded on the ceremony's branch

- **Hero and Avatar Maker — tuning.** Seeded from the 2026-09-26 faces lessons on the baton and the page's two lists ("Learned from the hub/ceremony batch", "Gotchas (earned)"); the page keeps one present-tense list of gotchas. `last_tested` retires.
- **Generative Sample Libraries — tuning.** Seeded from the per-cycle lesson sections of `ai-source-probe/DESIGN.md`; DESIGN.md keeps the design. The worked case from 2026-09-27.

Their run lines are written by hand until Wave 2's writers land.

### 3b. Proposed, one at a time after the canon lands

*(Filled from a read across the palace, 2026-10-14 — see below.)*

### 3c. Lessons now held only in operator memory

*(Filled from the same read.)*

## Gates, cost and close

- **Loudon's gates:** a yes to Wave 0's four names; a yes to this plan; a read of each canon text before it is written; his own word for the CLAUDE.md commit; a yes per new ledger in 3b.
- **Who does what:** an elder session runs Wave 1, the Concierge checking placement before and after each write. Wave 2 is its own session in its own worktree. Wave 3b goes page by page, any session, each a small edit.
- **Size:** Wave 1 touches about thirty files, most of them small edits; the backfill is fifteen short frontmatter blocks. A focused sitting, not a cleanup day.
- **The baton closes** on the Schema Ceremony's commit, with `--partial` re-batoning Wave 2 and whatever of 3b is still to do.
