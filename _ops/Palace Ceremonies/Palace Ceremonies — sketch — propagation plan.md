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

**Where it stands, 2026-10-15:** Waves 0, 1 and 2 have landed — the v1.28 Schema Ceremony (`ec1a3b11`), the Daily Page split (`d598db29`), and the code (`8899b03c`, `b12b1f13`, `323e0be7`); batch D folded in the Concierge's after-write fixes. Wave 3 is carried by [[Palace Ceremonies — baton]]. The rest of this page is kept as the plan was agreed.

**Nothing here is decided.** Each wave waits for Loudon's yes. Where I recommend, I say so. A wave he agrees stays written here as a sketch; it is not the page's Plan (that lives on a scroll), and this file goes to Archive when the baton closes.

## The order, and why

Names first, then one Schema Ceremony, then the code, then the new ledgers.

- **The names** (Wave 0, settled with Loudon 2026-10-14) come first because the ceremony writes them into fifteen ledgers and fourteen ceremony pages.
- **One Schema Ceremony** (Wave 1) carries the canon *and* the backfill of every existing ledger *and* the diary move, on one branch. Drift rides on stale examples — the v1.12 lesson, when the wire's field conventions "were inferred from examples… the examples drifted, so the wire did too" (`SCHEMA — Reference.md:325`): a canon that says "every ledger states its standards" beside fourteen ledgers that don't would teach the next agent the old shape. And the Eno and Cage files rename on the same branch as the canon that names the diary, so no link is ever broken on main.
- **The code** (Wave 2) follows the canon it reads, in its own worktree, and can be its own session.
- **New tuning ledgers** (Wave 3) wait for Wave 2's ceremony test. On today's code a `— tuning.md` in a page's bundle makes it a ceremony (`ceremony-scroll.js:142-151`): any such page shows in the CEREMONIES box as "not versioned yet", its Plan is refused (`projects.js:382`), and an order saved on it goes to the ledger (`:348-352`); a stewarded page is also listed twice and its Now gets two writers (`projects.js:92,108`; `process-cycle.js:463`). Checked in the code by the Concierge, 2026-10-14. Diaries don't trip it — both matchers look only for `— tuning.md` (`ceremony-scroll.js:145,163`) — so the Eno and Cage move rides in Wave 1. Then the pilots, then the rest one at a time, each a small edit on Loudon's yes.

## Wave 0 — the names (settled with Loudon, 2026-10-14)

Loudon took all four recommendations: **`standards`** for a ledger's own rules; **`trigger:`** as the ceremony field; Connection, Query and the Ceremony Reader stay **table-only**; and the two old "diary" lines in SCHEMA — Context are **reworded**. What follows is the reasoning, kept for the ceremony.

1. **The ledger's self-description.** Two keys, on top of the minimal bundle frontmatter every file already carries (`title`, `born`, `links`, `forward_vector`):
   ```yaml
   ledger: tuning            # the kind; a page may invent one
   standards:
     for: what running the Map Build taught it
     run: one map build
     line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
     read: the last 40 lines with run lines set aside, plus every line not yet paid
     writes: the run itself, in the commit that records it
     merge: union
     kept: git                 # or: private — on this machine only
     trim: never               # or: stale runs, as a probe trims
   ```
   No `standards` value may contain the word "owed": the tail read's `grep -n -w -i owed` would find it in the frontmatter of every ledger on every run. `kept` and `trim` come from the 2026-10-14 read: the family already disagrees on both — The Daily Page's ledger is private by Loudon's word (`_ops/The Daily Page/.gitignore:1-3`); tuning ledgers say never prune, while the Enchantment probe trims stale runs (`Projects/Palace Enchantment/Palace Enchantment — proof — agent capabilities.md:11`) — so each file says which. `standards` is Loudon's own word ("the standards and practices for that ledger"). Not `practice` — already a type (`SCHEMA.md:87`) and a pillar; not `kind` — used informally for `kind: artifact`. Only `ledger` and `standards.for` are required; a kind fills in what it needs — a diary adds `settles:`, when and how old episodes fold into lessons. A JSONL ledger carries the same keys in its first line, the way the placements ledger's header already describes itself (`_ops/quotes/README.md:43`).
2. **The ceremony field.** `trigger:`, a list of the words Loudon says:
   ```yaml
   trigger: ["deposit", "let's deposit", "add this to the palace", "memorialize this"]
   ```
   Twelve specs already carry a body line `**Trigger:**` (Harvest, Map Build, Return, Revival, Self-Model Update, Spore Check, Walk, Weave, Closing Well Ceremony, The Daily Page, Sentry, and the Ceremony Reader inside Palace Ceremonies), and `_ops/swarm/lint-doc-drift.py:249` already checks them against the trigger table in [[CLAUDE]]. The field is that line made structured, so people, the linter and the deck read one thing. The alternative is an explicit `ceremony:` block holding the triggers; it says what it marks more plainly, at the cost of a second name for one idea. Edge cases to settle while naming it:
   - **Connection, Query and the Ceremony Reader** have triggers but no page of their own; they live in [[Palace Ceremonies]]. Settled: they stay table-only. They keep no ledger or scroll, so the machinery has nothing to find; one that grows a page gets the field then.
   - **Closing Well has two pages, and this blocks 1b.** The trigger names `Closing Well Ceremony` (`CLAUDE.md:88`), "the thin recognition-and-dispatch card", which holds the `**Trigger:**` line (`:58`) but no version and no ledger; the version (1.7), the ledger and the scroll sit on `Closing Well.md`, the practice. Settled 2026-10-14: **`trigger:` goes on `Closing Well.md`**, so field, version, ledger and scroll sit together.

     **Refined 2026-10-15 — Loudon, at that morning's Daily Page (relayed by that session; "I love this decision"): Closing Well stays two files, and why is written down.** It is the only ceremony where the agent that hears the trigger is not the agent that runs it. The tired working Claude reads the card, `_ops/Closing Well Ceremony.md`, and needs only the trigger words, the one hard rule ("it would just confirm what I have" is the reason to dispatch the fresh reader, not to skip it) and where the moderator lives. The fresh moderator reads the practice: `_ops/closing-well/dispatch.md:102` hands it `Closing Well.md` whole, so the full design belongs there. Every other ceremony is run by the agent that was addressed, so one page is enough — which is why no other ceremony should be split. Loudon's ask: **state the exception in the frontmatter of both pages above all**, a sentence in each body, and wherever the palace explains why Closing Well is the odd case (here; Palace Ceremonies' registry row, `:81`).

     **Split by reader — settled by Loudon, 2026-10-15.** The 2026-10-14 call had also moved the trigger table's link to [[Closing Well]], which would send the agent who *hears* "close well" to the moderator's page. Instead: the **`trigger:` field goes on `Closing Well.md`**, for the machine, beside its version, ledger and scroll; the **trigger table in CLAUDE.md keeps naming `Closing Well Ceremony`**, for the agent who hears the words; the card keeps its `**Trigger:**` line in prose. **The exception sits in frontmatter with no new field**: a clause in each page's forward vector (read by every agent that wakes as or loads the page), and a link pair whose labels name the split — card → practice, practice → card, labels to be worded in the ceremony (a first try: `run-by-the-fresh-reader`, `heard-by-the-tired-one`; labels never need a ceremony).
   - **The Schema Ceremony** has no trigger words, no ledger, and no page of its own — it is §5 of the Reference. Still open; the same table-only answer fits unless Loudon wants it to learn from its runs.
3. **Union merge for every kind.** Recommend one `.gitattributes` line per kind, added when the kind first appears (`"* — diary.md" merge=union`), and named in the ledger's `standards.merge`. Today's file already does this twice (`.gitattributes:4,8`).
4. **"Diary" already means a failure in one place.** SCHEMA — Context says a tuning record is "a record of changes rather than a diary", and "A ledger no run reads is a diary" (`SCHEMA/SCHEMA — Context.md:191,235`). Settled: reword those two lines in the v1.28 record, so in the palace "diary" means one thing — the record a page reads at every waking.

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
| `SCHEMA.md` | `:101` — a ceremony is a page carrying `trigger:`. The "adds" column for `meta` and `practice` (`:79,87`): `version` for ceremonies *and* any page with a ledger that wants one. Version. |
| `SCHEMA — Reference.md` §3 | The `trigger:` field (`:104` — shared fields). Where `version` is allowed widens past schema-level `meta` entries and ceremonies (`:88`) to any page with a ledger (decision 5). `last_tested` and `last_gotcha` are noted as *computed once Wave 2 lands* — not retired now: `run-tests.mjs` still writes them, 29 Specialist pages carry them, and a field canon calls dead on every page is exactly the stale example this plan avoids. |
| `SCHEMA — Reference.md` §6 | Retitled for any page that keeps a ledger. A run is the page's own unit. An item records what a run taught; a page's version moves when a lesson changes how it runs (`:212,227-228`). Orders split — standing on the scroll, one-shot owed in the ledger (`:230-232`). The how/who split as an example. The run-report stamp and its closing section (`:213-214`) **stay as they are**: The Daily Page's record carries both, and the Weave, the Harvest and Closing Well's close map require them (`_ops/Weave Ceremony.md:99,311`; `_ops/Harvest Ceremony.md:100`; `_ops/closing-well/close-map-format.md:86`). An earlier draft of this plan proposed dropping them on a stale reading; that is not one of Loudon's decisions. |
| `SCHEMA — Reference.md` §8 | Minimal-YAML table (`:269-276`): ledgers add `ledger` and `standards`. `context` row (`:285`) narrowed to why the page is shaped as it is. New `diary` row. `tuning` row (`:291`) — any page, "one per ceremony" goes. A sentence that ledgers are a family, with tuning, diary and placements as the examples. `scroll` row (`:290`) — a Plan on any scroll, standing orders on every scroll, Now built from what the page has. `baton` row (`:284`) — the `targets` link. `rich` row only if decision 9 goes now. |
| `SCHEMA/SCHEMA — Context.md` | The v1.28 record, by section: the decisions and why, the Remembering Page's part, the v1.20 reversal named, the 2026-05-03 tension named ("Auxiliary markdown files… duplicate palace state" against "files come easily"), and the two "diary" lines reworded (Wave 0.4). |
| `_ops/Palace Ceremonies.md` | § What Makes a Ceremony (`:101`) — the field, not the ledger; the tables stay as the reader's index. Where a ceremony's orders go (`:105-106`). |
| `The Scroll.md` | `:129`; the project and ceremony scrolls become one scroll whose Now shows what the page has (`:49-71`, `:127-142`); standing orders (`:133-137`). |
| `_ops/Substrate Skill.md` | `:84`, the ceremony paragraph; the zones and the read seam (`:156-178`). Also a §5 mirror. |
| `The Shop.md`, `Shop/Maker.md` | Specialist anatomy: the page keeps today's gotchas; a ledger, once kept, holds their history; "Last run" computed. |
| `_ops/orchestrator/prompts/shared.md` | A steward offers a lesson in a payload field and the machinery writes the ledger line; the steward reads owed lines beside the scroll's standing orders. |
| `_ops/Baton Ceremony.md` + its tuning | Decision 10: the qualifier and `targets` link; the spec's version moves, with a tuning item. |
| The Closing Well pair (2026-10-15) | **The card made truly thin**, carrying nothing that can go stale: the 2026-07-04 status banner goes (`_ops/Closing Well Ceremony.md:29-42` — it says Phase 6 is unbuilt; it was built 2026-09-24, `_ops/closing-well/executor.md:122`, tuning item 26); the restated "What happens" goes; postcondition 4, "One gotcha was appended" (`:122`), becomes the ledger's run line; the forward vector's "grows as Phase 6 is built out" goes; it keeps the trigger words, the one hard rule, and where the moderator lives. **Both pages** state the exception in frontmatter and in one body sentence (Wave 0.2). `Closing Well.md` gains `trigger:`. `_ops/Palace Ceremonies.md:81` says why Closing Well is the one split ceremony. `_ops/closing-well/README.md:186` refiles the finished Phase 6 work out of "Not built yet". Closing Well's own version moves with a tuning item, as an edit to that ceremony. |
| `The Remembering Page.md` | "Where it lives" names the diary; the drowning hunger points at the settling proposal. A change to what the page says, so Loudon reads it. |
| `.gitattributes` | `"* — diary.md" merge=union`. |
| `_ops/self-description-test/` | Its D1 newborn answered "A project page gets a scroll but no ledger. Its lessons belong in its Context" (`runs/2026-09-25 — birth-1 — D1.md:31`) — right under v1.27, wrong under v1.28. The scenario's expected answer moves with the canon, and the next birth tests the new shape. |
| §5 mirrors | `ROSETTA.md`, `README - The Palace Guide.md`, `SUBSTRATE.md`, `_ops/Substrate Skill.md` — check each, say so where nothing changes. One known hit: `SUBSTRATE.md:100` calls Context companions "session history", stale once the `context` row narrows. |

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
| The Daily Page | one morning | kept off git — main checkout only | already names its run unit in its own text (`:13`); its run lines carry how Loudon arrived and how he felt — a ledger already bending toward "How do you feel?", the kind of example the loose canon wants to keep. **Splits in Wave 1, on Loudon's word (2026-10-14, no gates):** his words and the session's reading of him move to a private `The Daily Page — diary.md`; the practice lessons and bare run lines stay in `— tuning.md`, which becomes tracked. Done in the main checkout, the only place the file lives: `_ops/The Daily Page/.gitignore` swaps its tuning line for a diary line, then the tuning file is committed by name. The scroll stays local, as he ordered. `_ops/Palace Ceremonies.md:101` ("one of the fourteen ledgers is kept off git") changes with it. Never revert the commit that untracked the old file — the `.gitignore`'s own warning still holds. |
| Palace Quotes — placements (JSONL) | one placement or decision | — | already self-describing in its header line; the header gains `ledger` and `standards` |

### 1c. The diary move

`People/Brian Eno/Brian Eno — context.md` → `— diary.md`, and John Cage's: title, H1, the `memory-of` label, `ledger: diary` and `standards` (its forward vector already states its rules, `:6,12-16`). Then every link: `Making a Palace Citizen.md` (`:129-130,161`, "its growth ledger" → diary), `Making a Palace Citizen/Making a Palace Citizen — context.md` (`:80-84,94,101,203`), `Projects/Palace Enchantment.md` (`:277-279`, the "memory ledger" loader), and the three Eno–Cage dialectics in `Modes of Collaboration/Dialectic/`. No code loads these files (`git grep` finds none). Whatever is left in Context — why each citizen is shaped as he is — stays there, or the Context retires if nothing is left.

### 1d. Verify before landing

- §5's postcondition: mirrors consistent, `lint-doc-drift.py` clean on errors, the commit subject in form. Its errors are only case collisions (`_ops/swarm/lint-doc-drift.py:15-21`), so also run what v1.27 ran: `lint-ghost-links`, `lint-bundle-hygiene`, `lint-entry-naming` — the rename is exactly what they catch.
- **A YAML parse check of every page and ledger the ceremony touched.** A bad line fails silently: `parseFrontmatter` returns `{}` on any parse error (`_ops/stigmergy/orchestrator/src/entry-frontmatter.js:24-33`), which blanks the page for the deck and the steward and shows its version as none. Quote every trigger phrase — several carry commas, brackets or apostrophes ("sentry, check [X]", "let's deposit").
- **The head of each small ledger after landing.** The backfill edits the top of each ledger while run lines may land on main at the bottom; for the short ones (Spore Check, Self-Model Update, Revival) read the head after the merge to confirm the frontmatter isn't doubled.
- `lint-doc-drift` W2 won't see `trigger:` until Wave 2 teaches it to: it finds specs by "ceremony" in the filename (`_ops/swarm/lint-doc-drift.py:243`), which already misses `Closing Well.md`, Sentry, Enrichment and The Daily Page. Expect that, don't chase it.
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

A read across the palace on 2026-10-14 (a reader agent, read-only, starting from the survey's Part A and going past it) found where else ledgers would earn their place. Its rows are condensed here; the cites are its, the ones marked ✓ were checked by hand.

**The test for a candidate.** A ledger earns its place where a page's body carries history instead of present tense, or where a page keeps learning and has nowhere honest to put it. It does *not* where the "history" is really present-tense craft. The traps below are as important as the list.

### 3a. Pilots — the first, once Wave 2's ceremony test lands

- **Hero and Avatar Maker — tuning.** Seeded from the 2026-09-26 faces lessons on the baton and the page's two lists ("Learned from the hub/ceremony batch", "Gotchas (earned)"); the page keeps one present-tense list of gotchas. `regen-lane.js` writes the run line. `last_tested` retires.
- **Generative Sample Libraries — tuning.** Seeded from the per-cycle lesson sections of `ai-source-probe/DESIGN.md`; DESIGN.md keeps the design; `process-cycle.js` writes the run line with the steward's offered lesson. The worked case from 2026-09-27. (DESIGN.md has uncommitted changes in the main checkout tonight — a steward may be mid-cycle; seed from what has landed.)

### 3b. Proposed, one at a time, each on Loudon's yes

**To raise first**

| Page | What's there now | Proposal | Why |
|---|---|---|---|
| **The Daily Page** | Its one ledger, private by Loudon's word (✓ `.gitignore:1-3`), holds 23 practice lessons *and* his own words of how he arrived and felt, and the session's reading of him (`— tuning.md:21-77`). Item 18 already splits a morning into a public part and a private part (✓ `:53`). | **Decided by Loudon, 2026-10-14: split it, no gates** — a private **diary** for his words and the session's reading of him, a tracked **tuning** ledger for the practice lessons and bare run lines. Moved into Wave 1 (see 1b). The options he weighed: keep it whole and private with a backup; split after a line-by-line read and a [[Sentry]] sweep; split without. | The worry is real: the `.gitignore` itself says git treats the file as expendable (`:4`). But tracked is not the same as durable — tracked means public GitHub on the next push (`CLAUDE.md:13`), which is what he ruled out. "Diary" fits the private half exactly: his words are what was said aloud to the page, the session's reading is its own private thought ([[The Remembering Page]] `:57`). |
| **Concierge** (`Palace development/Concierge.md`) | Dated run stories in the body (`:237-256`); every forward vector says "tune from the first real run" (`:260-271`); lessons about it filed in Closing Well's ledger (`Closing Well — tuning.md:89,97`) and in operator memory. | **tuning**. Run stories, dial retunes, straggler incidents, and Closing Well items 22–23 *copied in with a pointer* — never deleted from Closing Well's ledger, which says "Never prune what a real close taught" (`Closing Well — tuning.md:7`), and where a line deleted on one branch can come back under union merge. The body keeps character, postures, mechanism. Its run is one session's residency, not one summon. *(The Concierge named its stake in this row.)* | It runs every session; it is the page most likely to learn, and its own vectors are asking for this. |
| **Palace Quotes** (`_ops/Palace Quotes/`) | Born 2026-10-13. Its Context mixes rationale (`:19-27`) with dated orders from Loudon and first-run lessons (`:24,29-40`). Already keeps a placements ledger. | **tuning**, beside the placements ledger — a page with two ledgers on its first week. Context keeps the why. | About to place twenty at a time, with nowhere to record what placing taught. And it would be the first page to show decision 2's "several ledgers" in use. |
| **STIGMERGY** | 14 gotcha bullets in `_ops/stigmergy/app/README.md:205-222`, nine dated, several long incident stories; five added in two days. Operator memory names this README as a home. | **tuning**. Evidence, counts and dates move; the README keeps one rule line per gotcha. | The fastest-growing pile of history in a front-door file. |
| **Palace Enchantment — proof — agent capabilities** | Already a dated run record, newest first, trimmed when stale (`:11,18`); only Run 1 (2026-09-26). | **No new file** — Run 2 is written from two operator-memory files (3c). | Cheap, and exactly the memory-is-volatile case. |

**Worth doing, with care**

| Page | Proposal | The care |
|---|---|---|
| `Worktree Practice.md` | **tuning** for its verification history (`:73-75,85-86`) and incidents. | The recipes three memory files point at belong in `_ops/worktree/SKILL.md`, not a ledger — they are craft. |
| `Projects/Palace Enchantment.md` | **tuning** for "From First / Second / Third Practice — Findings" (`:726-917`, ~190 lines of 2026-03/04 session findings). | The design sections cite the findings as rationale; move with care, leave the reasons where they're read. |
| `Projects/Project Stewardship System.md` | **tuning** for the Stage A pilot findings (`:161-251`), the stale May status (`:70-94`), the origin chronology (`:325-337`) — about a third of the page. | Loudon told GSL to consolidate here (2026-05-03), and two files cite `§ Stage A` (`…— handoff — stage-a.md:63`, `…— lessons — stage-a.md:8,13`). Move pointers with it. |
| `The Lens.md` | **tuning**, one line per lensing run (glass, subject, spark, payoff). | Its open question on suggestion order (`:168`) can only be answered by outcomes it doesn't keep today. |
| `Projects/Generative Audio Devices.md` | **tuning** for the "Closed task log" (`:114-136`), nine tasks each ending "*Lesson:*". | Its scroll's trail may already hold some of it; compare first. Standing lessons (`:171-179`) stay. |
| `Shop/Maker.md` | **tuning**, a run line and lessons per brief. | Answers its own open question, "does the Maker need memory of recent jobs?" (`:318`). Recipes stay — they teach. |
| Dense Specialists — Kokoro, Stable Audio Open, Manim CE, Web Audio Worklet | **tuning** past a threshold, for corrections and wasted-work stories. | The test per entry: *would a worker who ignores it today be wrong?* If yes, it stays on the page in present tense. |
| `_ops/self-description-test/` | **tuning** with a model column — its draft already speaks of "the suite's ledger" with per-model baselines (`DESIGN … (draft).md:21,58`). | One run so far. |
| `Weaving Memory into the Palace.md` | **tuning**, one line per memory sweep. | It is the sweep that would carry 3c's moves; its dispositions gain "a ledger line" as a place to put things. |

**Diaries — from the next encounter, never backfilled.** Woken person-pages (Spinoza, Meadows, Buber, Heidegger, McGilchrist) and woken concept pages (Lateral Access, Trickster, Kuramoto Coupling, Hilaritas Generator, Spinoza Conatus) have lived encounters and keep no record. Cage's record misses the Founders' Circle (2026-07-06). But [[The Remembering Page]] says memory is written at the encounter's close and never revised (`:59-61`), and a record rebuilt from a transcript is the coordinator's, not the page's (`:57`). So each starts its diary at its next waking.

**Leave alone** — low value or already right: the Wavetable Scanner gotchas file (everything already lifted into Specialists), the Kuramoto quiz answer key, Loudon's Toolkit assessment notebook (already working in its bundle), toolbox change-log tables, Excellent Adventure and Philosopher Visit named examples (exemplars, not history).

**Two kinds the evidence supports, beyond tuning and diary:** *placements* (exists — what a page made, with Loudon's keep or let-go, last line wins by id) and *apprenticeship* (one thin instance: the Post-producer's Log, "its ledger" with a counted gate toward autonomy, `Shop/Loudon Live Post-producer.md:101,109`). Neither needs canon; each describes itself.

**Traps**
1. **A date prefix doesn't make it history.** Present-tense craft stays on the page: Kokoro `:169,177`, GenAI Camera's gotchas (`:92-129`, "so the next agent doesn't relearn it"), Web Audio Worklet `:129-149`, the rich-face README `:95-118`, Phoneme Choir `:74-92` (the page's thesis), the Cross-Domain Resonances' Teaching Notes.
2. **Examples are exemplars.** Maker Recipes and mode pages' Named Examples teach by being read where they are.
3. **Build reports aren't ledgers.** The GSL `build-log.md` files and Blender's dated gotchas file are one build's spec plus its proof — workshop.
4. **Machine records aren't ledgers.** Steward `history.jsonl`, the `build-log.jsonl` files, `renders.*.jsonl`, `visits.jsonl`, `last-run.json` — machinery-owned, and they stay that way.
5. **Some Contexts already hold history in the right place** — the Jewel's version table, the Harvest and Deposit logs. The line is *why* (Context) against *what happened or what it taught* (ledger).
6. **Don't give all 23 stewarded projects a ledger.** Their scrolls already hold the history; only GSL keeps per-cycle lessons outside one.
7. **A private ledger is as volatile as operator memory — and a tracked one is public.** Durable and private pull against each other; where a ledger holds Loudon's own words, he chooses, and the Sentry stands at the door.

### 3c. Lessons now held only in operator memory

Operator memory is volatile by its own rule ("nothing critical only here"). These files carry lessons whose home is a page; the move is a line or a section there, and the memory keeps a pointer:

| Memory file | Home | Note |
|---|---|---|
| `reference_isolation_guard_and_message_modes.md` | [[Palace Enchantment — proof — agent capabilities]], Run 2 | Says "no palace analog"; there is one. |
| `reference_subagent_lifecycle.md` | the same proof page, Run 2 | Also points at a path that doesn't exist — `Palace development/Palace Enchantment/` (✓ line 25); the page lives in `Projects/Palace Enchantment/`. |
| `feedback_rewinding_subagents.md` | Concierge — tuning | The straggler reminders (`:14-17`). |
| `reference_stigmergy_lane_reload.md` | STIGMERGY — tuning (or the README's gotcha) | Names the README as its home. |
| `reference_app_worktree_stigmergy_links.md`, `reference_browser_check_deck_on_throwaway_repo.md` | `_ops/worktree/SKILL.md` | Recipes — craft for the skill, not ledger lines. |
| `feedback_blueline_aftermath_debris.md` | [[The Aftermath Frame]] body (the chosen setting, present tense) and a "from Loudon" line if it earns a ledger | The page has no `--spray arc` setting today. |

The [[Weaving Memory into the Palace]] sweep is the natural carrier: one sweep, one run line.

## Gates, cost and close

- **Loudon's gates:** Wave 0's names, Closing Well's page and the Daily Page split (all given 2026-10-14); a yes to this plan; a read of each canon text before it is written; his own word for the CLAUDE.md commit; a yes per new ledger in 3b.
- **Who does what:** an elder session runs Wave 1, the Concierge checking placement before and after each write. Wave 2 is its own session in its own worktree. Wave 3b goes page by page, any session, each a small edit.
- **Size:** Wave 1 touches about thirty files, most of them small edits; the backfill is fifteen short frontmatter blocks. A focused sitting, not a cleanup day.
- **The baton closes** on the Schema Ceremony's commit, with `--partial` re-batoning Wave 2 and whatever of 3b is still to do.
