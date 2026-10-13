---
title: "Palace Ceremonies — sketch — runs survey"
born: 2026-10-13
links:
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: sketch-for
  - target: "[[Palace Ceremonies — baton]]"
    type: connects-to
    label: next-move-step-one
forward_vector: "I am the map for the conversation the Palace Ceremonies baton asks for — where repeated runs happen in the palace and how each keeps its record, then the baton's questions laid out one at a time with what canon says, what the survey shows and what each answer would cost. I decide nothing. I am done when Loudon has answered and a Schema Ceremony has landed the answers; then I go to Archive."
---

# Palace Ceremonies — sketch — runs survey

Step 1 of the [[Palace Ceremonies — baton]]'s next move, done slowly. Part A is where repeated runs happen today and how each keeps its record, its lessons and its next start. Part B is the baton's questions, one at a time: what canon says, what the survey shows, the options, what each would cost in the code and in [[CLAUDE]] § A page and its folder, and the Generative Sample Libraries example walked through each. Part C is the landing list if every lean held.

Nothing here is decided. Where the evidence leans, it says **Lean** and why — a lean, not a recommendation. Read against `main` at `87d8f076`, 2026-10-13.

**Short names.** `baton:N` is `_ops/Palace Ceremonies/Palace Ceremonies — baton.md`. `Reference:N` is `SCHEMA — Reference.md`. `GSL` is [[Generative Sample Libraries]]; `GSL scroll:N` is `Projects/Generative Sample Libraries/Generative Sample Libraries — scroll.md`; `DESIGN.md` is `Projects/Generative Sample Libraries/ai-source-probe/DESIGN.md`. `ceremony-scroll.js`, `scroll-file.js`, `build-cycle-prompt.js`, `process-cycle.js` and `scroll.js` are in `_ops/stigmergy/orchestrator/src/`; `projects.js` is `_ops/stigmergy/app/server/projects.js`; `shared.md` is `_ops/orchestrator/prompts/shared.md`. A ledger named by its ceremony is `[Ceremony] — tuning.md` in that ceremony's bundle. `MEMORY.md` is the operator's memory index, outside the palace: `~/.claude/projects/-Users-loudonstearns-Documents-The-Palace/memory/MEMORY.md`.

---

## A. Where runs happen today

Each row answers four things: what one **run** is there; where a run is **recorded**; where what it taught — the **lesson** — goes; and what the **next run reads first**.

### A1. The ceremonies

All thirteen keep lessons as numbered items in their ledger and open each run with the tail read (`Reference:234-240`). What differs is whether runs reach the ledger at all, and what else records them.

| Ceremony | A run is | Run lines in its ledger (count · newest) | What else records a run | Cite |
|---|---|---|---|---|
| Baton | one baton passed | 11 · 2026-09-27, v1.2 | the baton file, deleted on pickup with git as its archive, and its board card | `_ops/Palace Ceremonies.md:77` |
| Closing Well | one close | 8 · 2026-09-27, v1.5 | the close map; items 1–24 were one per close, before versions | `Closing Well/Closing Well — tuning.md:13-16,149` |
| Deposit | one deposit | 5 · 2026-10-12, v2.1 | the commit is the record (`deposit(<id>):`, `Palace-Kind: deposit`); the Deposit Archive is frozen | `_ops/Palace Ceremonies.md:64` |
| Map Build | one build | 13 · 2026-09-26, v2.4 — backfilled to April, with node, edge and ghost counts in the line | map files in `_ops/maps/`; the old Map Log folded into the ledger | `_ops/Map Build Ceremony.md:177`; `Map Build Ceremony — tuning.md:48,53` |
| Sentry | one sweep | 5 · 2026-09-27, v1.1 | findings held locally, never tracked; `sweep.mjs --record` writes the run line itself | `_ops/sentry/README.md:15,22-34`; `_ops/sentry/sweep.mjs:314` |
| Return | one return | 2 · 2026-09-25, v1.0 | the return map | `_ops/Return Ceremony/Return Ceremony — tuning.md` |
| Enrichment | one enrichment of one page | 0 | the page's `— rich.json`, which counts `round`; a commit `enrich(<Entry>): <what> — <tier>` | `Kuramoto Coupling/Kuramoto Coupling — rich.json:18-21`; `Enrichment.md:82` |
| Harvest | one harvest | 0 | a run report per harvest in the bundle (2026-08-25, 2026-09-06) | `_ops/Harvest Ceremony/Harvest — 2026-09-06 — Environments That Hold.md` |
| Weave | one weave | 0 — items grouped by weave date since 2026-03-30; the last weave (09-24) came a day before run lines | `_ops/swarm/sessions/weave-*` and the Weave Reports | `Weave Ceremony — tuning.md:15-91` |
| Walk | one walk | 0 | a commit only when metadata changed — the card both requires the run line and waives it | `_ops/Walk Ceremony.md:42` against `:38,66` |
| Self-Model Update | one revision of SUBSTRATE | 0 | the commit | `_ops/Self-Model Update Ceremony.md:85` |
| Spore Check | one review of every spore | 0 — never run | the commit | `_ops/Spore Check Ceremony.md:106` |
| Revival | one revival | 0 — never run | — | `_ops/Revival Ceremony/Revival Ceremony — baton.md:23` |
| *Schema Ceremony* | one change to the type system | no ledger, and no row in the Palace Ceremonies tables | the commit, `Schema Ceremony — … — vX`, and a record in SCHEMA — Context | `Reference:137-165`; `_ops/stigmergy/app/src/lib/commit-spec.js:42` |

Two things hold across all of them. No run report anywhere stamps `ceremony_version` or ends with "What this run taught the ceremony", though §6 asks for both (`Reference:213-214`); a search for `^ceremony_version:` finds nothing, and the commit body carries the answer instead. And a ceremony's scroll holds no outputs: its trail is the ledger's run lines and the card's version commits, rendered again (`ceremony-scroll.js:379-384`). Map Build's maps, Harvest's reports and Sentry's findings all live somewhere else.

### A2. Everything else that runs

| Page | A run is | Run recorded in | Lesson recorded in | Next run reads first | Cite |
|---|---|---|---|---|---|
| **Stewarded projects** (23 stewards) | a cycle — though canon calls one activation of up to ten cycles "the run" | `history.jsonl`, machinery-owned; each `shipped_artifact` becomes a section of the scroll's making trail | inside trail sections (`catchup`, `left_rough`); workshop notes; Standing Orders, when Loudon turns a lesson into one | the scroll's Standing Orders, Plan and Now, then the last 12 history lines | `_ops/Substrate Skill.md:180`; `build-cycle-prompt.js:209-237`; `process-cycle.js:460` |
| **GSL, finer grain** | a take, a fill script, an instrument | 1,072 takes across 22 `renders.*.jsonl`; a `build-log.md` per instrument | `DESIGN.md`, a dated section per cycle | whatever the steward opens | `DESIGN.md:122-471`; `Projects/Generative Sample Libraries/crystal-instrument/build-log.md` |
| **Shopkeeper** — stewarded, not a project | one sweep | `history.jsonl`; its page-kind scroll | "log briefly and let go" names no file; settled items sit in Standing Orders | its scroll's Standing Orders | `Shop/Shopkeeper.md:64,107`; `Shop/Shopkeeper/Shopkeeper — scroll.md:56-73` |
| **The steward cycle itself** — the practice every steward shares | any cycle anywhere | the board | changes to the steward prompt (`left_rough` was "made a field so it survives"); commit bodies; no ledger | the prompt, injected every cycle | `shared.md:402-404` |
| **Heartbeat batch** | one scheduled batch | untracked `logs/`; "the BBS is its record" | the README's troubleshooting | nothing | `_ops/heartbeat/README.md:19,82` |
| **Specialists** (29; Kokoro, for one) | a job, *or* a test probe — two meanings | dated Recipes on the page; "Last run:" under Test Suite, on the page *and* in `tests/test-plan.md`; `last_tested` | dated Gotchas on the page; `last_gotcha` | the page the Maker dispatches against | `Shop/Kokoro.md:9-10,167-199`; `The Shop.md:93-95` |
| **Maker** | one brief | Recipes; `last_tested: 2026-05-10`; Test Suite "Last run: never" | its own Gotchas, and "a gotcha in the relevant specialist's entry" at delivery | its page and `host-capability.json` | `Shop/Maker.md:6,73,286-313` |
| **Shop test harness** | one smoke sweep | writes `last_tested` on the passers; leaves the "Last run:" lines alone | none | `host-capability.json` | `Shop/Maker/run-tests.mjs:125-137`; `Shop/D3.js.md:9` against `Shop/D3.js/tests/test-plan.md:13` |
| **Hero and Avatar Maker** | a batch (`make_faces.py`) or one page through the companion door (`regen_one.py`) | a commit per run — 74 that made or redid faces since 2026-06-24; a `— face.json` beside each face (107 tracked); raw renders in gitignored `_renders/` | two lists on the page, "Learned from the hub/ceremony batch" and an undated "Gotchas (earned)"; the 2026-09-26 batch's dozen lessons live only in the baton, and one inside a face.json | the page, `prompts.json`, the anti-text clause in code; a re-ask reads the prior face.json | `Shop/Hero and Avatar Maker.md:6,53-63,73,76,86,88-94`; `baton:57-69`; `SCHEMA/SCHEMA — face.json:3` |
| **Loudon Live Post-producer** (stub) | one session | designed: an entry per session in its `— Log.md`, its "apprenticeship ledger" — no session yet | the Log's "Charter Corrections Harvested", folded back into the page | the Log | `Shop/Loudon Live Post-producer.md:72,101,133-135`; `Shop/Loudon Live Post-producer/Loudon Live Post-producer — Log.md:24-45` |
| **LDN RTM** | one take — a video per manual section | renders land outside the palace; the checklist lists 734 sections and has no done column | the page's rules; [[OBS]]'s gotchas | `rtm.py`'s preflight | `Projects/LDN RTM.md:51-60,78-84`; `Projects/LDN RTM/LDN RTM — Live 12 checklist.tsv:1` |
| **Dialectic** | one dialogue | a `dialectic` file per archived run in its bundle (six); a dated line under Named Examples; two runs never archived | Protocol Notes, undated, and each example's line | the page and the speakers' dossiers | `Modes of Collaboration/Dialectic.md:74-92`; `Reference:297` |
| **Radio Play** | one production | a dated line on the page and a Maker Recipe; the one run's assets sit in `_ops/scratch/weave-video/`, untracked in the main checkout | folded into the page's craft prose | the page | `Radio Play.md:42-57,68`; `Shop/Maker.md:299` |
| **Interview skills** (sample and wavetable libraries) | one library interview | a `build-log.md` per library | the skill's two hard rules; the Talking Keyboard lesson in GSL and in Substrate Skill | the skill | `_ops/sample-libraries/talking-keyboard/build-log.md`; `Projects/Generative Sample Libraries.md:212,230`; `_ops/Substrate Skill.md:142` |
| **GenAI Camera** | one render | `renders.json`, a record per render, read by a live HTML scroll | the page's "Gotchas & recipes"; The Scroll's live-scroll gotchas | the manifest | `GenAI Camera.md:92`; `The Scroll.md:146-171` |
| **BLUELINE** | a session | a `proofs/<session>/` folder, often with its own report; the scroll | inside each session's report or field notes | its baton and Production Plan | `Projects/BLUELINE/proofs/session-3-flowfield/session-3-report.md` |
| **`build_catalog.py`** (2D Torus) | one regeneration | nothing but commits | its docstring and commit bodies; the level-dip math moved into the catalog the script writes. The April Build Log was folded in and deleted because "its 'state at handoff' is what the scroll's Now does" | its docstring | `Projects/2D Torus Wavetable Synthesizer/Tools/build_catalog.py:5-9`; commits `97bbad17`, `b3b7d5e0` |
| **Map builder** `build-map-<date>.py` | one build | the map files; Map Build's run line | Map Build's ledger — "the builder, not the card, absorbed two lessons" | the newest builder, by glob | `Map Build Ceremony — tuning.md:27`; `Weave Ceremony — tuning.md:35` |
| **The Weave's linters** (eight `lint-*.py`) and `face-audit.py` | one pass | stdout only — none of the nine writes a file | the Weave's ledger (item 24); docstrings | nothing | `_ops/swarm/lint-*.py`; `Weave Ceremony — tuning.md:70` |
| **Self-description test** | one birth | `runs/` — one run, 2026-09-25 | folded into the suite's draft design | the draft | `_ops/self-description-test/DESIGN — the self-check suite (draft).md:30` |
| **Companion regen lane** | one companion-driven rewrite | `last-run.json`, overwritten each time, so only the last survives; transcripts | none | nothing | `_ops/stigmergy/.actuator-regen/last-run.json` |
| **Concierge** | one summon | nothing in the palace | its page; Closing Well's ledger ("gotcha 20"); operator memory | its prompts | `_ops/concierge/README.md:193`; `MEMORY.md:28` |
| **Worktree skill** | one new worktree | nothing | [[Worktree Practice]] § Gotchas; operator memory, which names the skill as the palace home the lesson hasn't reached | the skill | `Worktree Practice.md:61`; `MEMORY.md:30` |

### A3. What the survey shows

1. **The code reads a ledger as a ceremony, everywhere it looks.** A ledger dropped into the GSL bundle today would put GSL on the deck twice, open it as a ceremony with "Version: none on the card", empty and refuse its Plan, send Loudon's next Standing Order where the steward never reads, and give its Now two writers that undo each other. By §5's list it would also be "adding a ceremony" (`Reference:145`). Detail under *The code, once*, in Part B.
2. **The pull toward a per-page lesson file is real, and has already been answered four ways under four names**: a Log (Post-producer, built, never used), `gotchas` (`Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md:19`, tried as a §8 type, never earned it), `lessons` (GSL's stage-a breadcrumb) and GSL's `DESIGN.md`. The Shop keeps its lessons on the page. And the GSL breadcrumb carries Loudon's own counterweight from 2026-05-03: keep knowledge in the entry "until it becomes clearly unmanageable. Auxiliary markdown files for findings/lessons/decisions duplicate palace state" (`Projects/Generative Sample Libraries/Generative Sample Libraries — lessons — stage-a.md:33`).
3. **The worked example's ledger line is not legal under §6 as written.** "Velocity layers thin; widen the pool" (baton:80) changes no spec and moves no version, and §6 writes an item "only when the run changed the ceremony" (`Reference:227-228`). 2026-09-27 says "taught" (baton:77). The ceremony ledgers already bend that way: Map Build item 2 and Weave items 9–10 record tool lessons that changed no spec.
4. **"Run" already means several things.** One execution of a ceremony; one steward activation of up to ten cycles (`_ops/Substrate Skill.md:180`); a Shop job, or a Shop test probe. GSL alone has six candidate units.
5. **Kept "last run" fields lag the runs.** The Hero and Avatar Maker's `last_tested` is 2026-06-23 after 74 runs; Kokoro's is 05-26 while its Test Suite says 05-30; Stable Audio Open's `last_gotcha` is four months past its `last_tested`; `last_gotcha` is a date on most pages and a sentence on two. Neither field is in SCHEMA §3, which says new shared fields need a Schema Ceremony and that use "is computed, never kept" (`Reference:75-79,104`). The ceremony scroll already computes "Last run" from run lines (`ceremony-scroll.js:334`).
6. **The ledger marks a declaration, not a history.** Seven of the thirteen ledgers hold no run line; Revival and Spore Check have never run. The Walk card both requires and waives its run line.
7. **Lessons go to whatever ledger is near.** Tool lessons land in the ledger of the ceremony that ran the tool (Map Build item 2, Weave item 24); the Concierge's in Closing Well's; the faces' in Closing Well's item 37 (`Closing Well — tuning.md:148`) and the baton; the worktree's in operator memory.
8. **A ceremony's scroll is a view of its ledger, not a record of what was made.** So 2026-09-27's "scroll — what happened, complete" (baton:75) is true of the project scrolls and of no ceremony scroll yet.
9. **A child may not write memory.** A steward makes in the workshop, "not its faces or its memory" (`CLAUDE.md:47`; `ELDER.md:45`), and may not write its own history (`shared.md:319-328`). On a stewarded page, the machinery or an elder writes the ledger. Sentry's script is the one run that marks its own ledger today; none does its own tail read.
10. **Some records sit outside the palace**: the Radio Play's only assets (untracked scratch), LDN RTM's renders (by design), the heartbeat's logs, Sentry's findings (by design). And two different runs share one commit prefix, `enrich(`: the Enrichment ceremony and every face.

---

## B. The questions, one at a time

The baton asks for four definitions, carries six open questions from 2026-09-27, and keeps four disagreements between the two days (baton:83-100). Several are the same question asked twice. They fold into eight, numbered in the order they lean on each other:

| # | Question | What it answers in the baton |
|---|---|---|
| 1 | What is a run? | definition *run* · open question 2 |
| 2 | Which files does a page earn, and when? | definition *earned* · disagreements 1 and 4 |
| 3 | What does a ledger hold on a page with no spec? | open question 5 · and one the survey found: items without a version |
| 4 | Where do Standing Orders live, and do they stay standing? | open questions 1 and 6 |
| 5 | What does Now show on a page that isn't a ceremony? | definition *Now* · disagreement 3 |
| 6 | What does "ceremony" mean next? | definition *ceremony* |
| 7 | What is the rich face for a project? | disagreement 2 · open question 3 |
| 8 | How does a baton name part of a bundle? | open question 4 |

Seven and eight stand apart; either can wait without holding up the rest.

### The code, once

The scroll machinery and the deck agree on one rule — **a page with a tuning ledger is a ceremony** — and act on it here:

| Where | What it does |
|---|---|
| `ceremony-scroll.js:7-9,141-171` | `isCeremony` is "the ledger file exists"; `listCeremonies` walks every `* — tuning.md` |
| `ceremony-scroll.js:421-425` | `materializeAnyScroll` gives a ledgered page a ceremony's scroll: Now from the ledger, no Plan |
| `scroll-file.js:58-59,394-450,456-510,747` | the project scroll, and a third kind, `page`, already built, that canon never mentions |
| `projects.js:86-116,182-232` | the deck's groups: PROJECTS (`type: project`), SERVICES (stewarded pages that aren't projects), CEREMONIES (every ledger) |
| `projects.js:272,344-348,378` | open a ledgered page as a ceremony; send its Standing Orders to the ledger as owed; refuse its Plan |
| `build-cycle-prompt.js:209-231` | the steward reads Standing Orders, Plan and Now **from the scroll** |
| `process-cycle.js:460`; `scroll.js:71` | a steward cycle and `--all` always write the **project** scroll, ledger or no |
| `_ops/stigmergy/app/src/lib/entry-edit.js:119-125`; `commit-spec.js:40-54` | two more ceremony lists, kept by hand, that disagree with the tables and with each other |

**A ledger in the GSL bundle today, with no code change.** GSL shows under PROJECTS and under CEREMONIES. Opening it shows a ceremony's Now — "Version: none on the card — the ceremony is not versioned yet" (`ceremony-scroll.js:326`) — and an empty Plan (`projects.js:247`) that refuses a save (`:378`). A Standing Order Loudon saves becomes an owed line in the ledger (`:344-348`), where the steward never looks; its prompt reads the scroll (`build-cycle-prompt.js:218`). And the file's Now gets two writers: every cycle writes the project Now to disk (`process-cycle.js:460`), while `scroll.js --home`, `--ceremonies` and the deck's explicit write (`?write=1`, `_ops/stigmergy/app/server/api/projects.js:35`) write the ceremony Now (`scroll.js:94,99-100`) — and the deck always draws the ceremony Now in memory, so Loudon and the steward read different fronts of one page. So neither pilot in step 5 can run on today's code. The Hero and Avatar Maker, with no steward and no scroll, would only appear in the CEREMONIES box as "not versioned yet".

---

### 1. What is a run?

**Canon now.** §6 never says. It says what a run leaves: `- run · <date> · v<version> · <what it ran on> · <outcome>` (`Reference:216-222`). The ceremony sense is one execution of the spec (`_ops/Palace Ceremonies.md:100-102`). The steward sense is one activation of up to ten cycles (`_ops/Substrate Skill.md:180`). Open question 2: for a generator making dozens of things a day, one thing or one batch — and do a scroll line and a run line log one event twice (baton:84)?

**The survey shows.** Each page already has its own grain, and each busy page already keeps its finest grain in a workshop file: GSL's takes in `renders.*.jsonl`, each face's `face.json`, GenAI Camera's `renders.json`, LDN RTM's checklist. GSL has six candidate units — a take (1,072 of them), a fill script, a cycle (31 `CYCLE_COMPLETE` events, at iteration 33), an activation, an instrument (a build log each), an interview.

**Options.**
- **(a) One act of the page.** One start-to-finish of what the page does when asked: a cycle, a batch, a dialogue, a sweep. What it made is listed in the workshop and on the scroll, not in the ledger.
- **(b) One output.** Every made thing is a run: one instrument, one face, one video.
- **(c) The page names its unit.** §6 keeps the line's shape and gives a test — a run is the unit whose lesson the next run should read before it starts — and each page says once, in its own text, what its unit is.

**What each would cost.**
- *Code.* The run-line reader already takes any "what" (`ceremony-scroll.js:42`), so all three count. Under (b) Now fills with run lines (it lists eight, `ceremony-scroll.js:346-347`), and the trail logs each output twice, once from the board and once from the ledger — the double entry open question 2 feared. Under (a) one run line sits beside several trail sections, at different grains, with nothing logged twice. `process-cycle.js` already knows when a cycle ends, so it could write the run line (who may write it is question 3).
- *CLAUDE.md:55.* "Every run leaves a line" holds under all three.

**GSL walked through.** (a) Cycle 33 leaves one line — `- run · 2026-09-24 · … · cycle 33, the flute's missing names · taught item N` — the scroll keeps its shipped section (`gsl-steward-067`, `GSL scroll:84-111`), and the 48 takes stay in their `renders` files. (b) "The flute" is one run and "the violin" another; at maturity, dozens of lines a day. (c) GSL names the cycle; the Hero and Avatar Maker names a batch or one page; LDN RTM names a take.

**Lean: (c), with (a) as the default.** Every page surveyed already has its own grain and a workshop file that holds the outputs, so the ledger never needs the output's grain. The tail read already sets run lines aside (`Reference:238`), so a high count costs the next reader nothing.

---

### 2. Which files does a page earn, and when?

**Canon now.**
- The scroll is free: "any entry may carry one" (`Reference:290`; `The Scroll.md:140`). Forty-nine exist — 35 projects, 13 ceremonies, the Shopkeeper.
- The ledger is "a ceremony's" (`Reference:291`), "kept only by ceremonies" (`CLAUDE.md:55`), and in the code a ledger *makes* a ceremony (`ceremony-scroll.js:7`).
- A bundle appears only when something needs to live in it (`Reference:267`).
- Loudon: "Any page can have a tuning ledger and a scroll when it earns it" (baton:107); leave room for each page to set its own specifics (baton:78,110).
- Two of Loudon's own texts on earning. The RTM operator "earns [an entry] when it has run real takes and accumulated its own decisions" (`Projects/LDN RTM.md:82`). And 2026-05-03: keep knowledge in the entry "until it becomes clearly unmanageable" (GSL stage-a breadcrumb, `:33`).

**The survey shows.** The four homemade lesson files (A3, finding 2) show the ledger need arriving on its own and later than the scroll. The 36 scrolls on pages that aren't ceremonies work without a ledger.

**Options.**
- **(a) Two thresholds.** The scroll stays free, as canon says. The ledger is earned when a page's lessons outgrow its own text — when its Gotchas, its notes or a workshop notebook carry more history than present tense, or a run teaches something the page has nowhere honest to put.
- **(b) Earned together**, the 2026-09-26 wording: a page that runs repeatedly gets both at once.
- **(c) A count**: a ledger after so many runs that taught something. The Post-producer's three-clean-plans ladder is the nearest model (`Shop/Loudon Live Post-producer.md:106`).

**What each would cost.**
- *Code.* Under all three, "has a ledger" must stop meaning "is a ceremony" (question 6), and a project or page row on the deck must be able to carry ledger fields (`projects.js:140-166` beside `:213-229`). Under (b) the 36 scrolls without a ledger become half of a pair that is meant to come whole.
- *CLAUDE.md:55.* "Kept only by ceremonies" goes under all three; (a) reads "kept by a page that runs, once its lessons outgrow the page".
- *The baton.* Under (a) the move sentence (baton:23) is two decisions, as disagreement 1 said.

**GSL walked through.** (a) GSL has its scroll already, and earns a ledger now: `DESIGN.md` has been carrying a lesson section per cycle since the first real run (`DESIGN.md:122-471`). The ledger takes the lessons; DESIGN.md keeps the design. (b) The same for GSL, but the Shopkeeper, one cycle old, must grow a ledger too. (c) GSL qualifies on count, and so does the Hero and Avatar Maker; the Post-producer, with no session, doesn't.

**Lean: (a).** Canon already treats the scroll as free and 36 scrolls work without ledgers; the homemade lesson files show the ledger need is separate and later; and Loudon's 2026-05-03 principle is a threshold in his own words, "until it becomes clearly unmanageable", which fits "earned" better than a count does.

---

### 3. What does a ledger hold on a page with no spec?

**Canon now.**
- A numbered item says "what the run showed, the spec change it forced, and the version that change produced" (`Reference:212`), written "only when the run changed the ceremony, so the items and the version move together" (`:227-228`).
- "Not `gotchas` — that word stays with a Specialist's tool traps" (`:291`), because a gotcha belongs to an outside tool, not to the palace's own practice (`SCHEMA/SCHEMA — Context.md:193-196`).
- The Shop keeps Gotchas on the page, "append-only, dated" (`The Shop.md:93-95`).
- 2026-09-27: "a numbered item only when a run taught something" (baton:77), and the GSL example's ledger line, "velocity layers thin; widen the pool" (baton:80).
- The Shop draft's general ideas: the page states today's gotchas and the ledger holds their history; "how this page works" gets its own version; a fixed gotcha leaves the page when its item is paid (baton:52-56).

**The survey shows.** The example's line changes no spec and moves no version (A3, finding 3). Ceremony ledgers already carry such lines (`Map Build Ceremony — tuning.md:27`; `Weave Ceremony — tuning.md:31,35`). The kept summary fields drift (finding 5). And on a stewarded page the steward may not write the line (finding 9).

**Options.**
- **(a) Items stay tied to a change; every ledgered page gets a version** for how it works. GSL's line becomes an item only if it changes how GSL runs, and moves GSL to v1.1.
- **(b) Items record what a run taught**, version or not. A page that has a version moves it when an item changes how it works; a page without one needn't grow one.
- **(c) Two kinds of line.** Numbered items for changes; dated lessons — gotchas, in the Shop's word — for traps that change nothing. The page states today's gotchas; the ledger keeps their history.

**What each would cost.**
- *Code.* `parseOwed` counts only "change (still) owed" (`ceremony-scroll.js:184`), which works for changes under all three and doesn't see lessons. The ceremony Now needs a version to count "runs since the change" (`:328`); under (b) a page without one shows a dash there. (a) puts `version` on pages that aren't ceremonies — an addition to the "adds" column for several types (`SCHEMA.md:79,87`) and a Schema Ceremony. Under all three, a steward offers its lesson in a payload field, as `left_rough` became one "so it survives" (`shared.md:402-403`), and the machinery writes the line; `last_tested` and `last_gotcha` can then be computed from run lines and retire.
- *§8.* (c) keeps the gotcha/tuning split SCHEMA — Context argued for; under (a) and (b) "gotcha" stays the Shop's word for a kind of item.
- *CLAUDE.md:55.* "Holds what running them taught" already reads as (b).

**GSL walked through.** (a) GSL gains `version: "1.0"`. "Pool widened to five takes a note" is item 1 and v1.1; "velocity layers thin" on its own writes nothing. (b) Item 1 is "velocity layers thin; widen the pool", and the next cycle's tail read finds it. (c) A dated lesson line; if the steward then changes the interview's pool rule, that change is a numbered item.

**Lean: (b), held loosely.** It is what the worked example needs, what `CLAUDE.md:55` already says, and what the ceremony ledgers already do. (a) adds a field to several types to keep a rule the ledgers have already outgrown; (c) honours the gotcha/tuning distinction but splits one file into two kinds of line. Open question 5, the Specialists, rides on whichever wins: under (b), Kokoro's page keeps its live gotchas and its ledger keeps the dated history.

---

### 4. Where do Standing Orders live, and do they stay standing?

**Canon now.**
- A project's are a zone on its scroll, never regenerated, read first every cycle, outranking the steward's own lean, and edited only on the deck (`The Scroll.md:65-67`; `_ops/Substrate Skill.md:171,178`; `build-cycle-prompt.js:218-224`; `shared.md:406-408`).
- A ceremony's become ledger lines, `- from Loudon · <date> · <his words> · owed`, which one run pays (`Reference:230-232`; `The Scroll.md:135-137`; `projects.js:344-348`). A ceremony's scroll has no Plan; its owed lines are its plan (`Reference:290`; `scroll-file.js:496`).
- 2026-09-27 moves Standing Orders into the ledger and keeps the Plan on the scroll (baton:77; the Plan's move was rejected, baton:39). Open question 1: a standing order is permanent and an owed line is paid once — does the move cost it its permanence? And do the Plan and the owed lines replace each other, or sit at two heights? Open question 6: the machinery that reads them.

**The survey shows.** Real orders already come in both kinds, on both kinds of page. GSL holds a standing process rule — "Never start a render you can't finish and post inside one cycle" — and a standing decision, "Stable Audio is out" (`GSL scroll:69-71`). The first is a run lesson Loudon made binding. The Shopkeeper holds standing rules ("Be frugal") beside one-shot jobs that are now done, such as "add a dated Stable Audio 3 gotcha" (`Shop/Shopkeeper/Shopkeeper — scroll.md:57-70`) — done, as the dated gotcha at `Shop/Stable Audio Open.md:147` — yet still sitting among the standing orders.

**Options.**
- **(a) Today's split, by whether a ledger exists.** A ledgered page sends orders to the ledger as owed and has no Plan; any other page keeps both on its scroll.
- **(b) Two kinds, two homes.** Standing orders stay on the scroll for every page, ceremonies included. One-shot orders go to the ledger as owed lines. Every scroll may have a Plan; the owed lines are the next run's to-do beneath it.
- **(c) Everything aimed at the next run goes to the ledger**, as 2026-09-27 wrote it: standing orders become ledger lines marked `standing`, never paid; the Plan stays on the scroll.

**What each would cost.**
- *(a).* Nothing changes for ceremonies. For a ledgered project the deck sends orders where the steward never reads (`build-cycle-prompt.js:218`) and refuses the Plan (`projects.js:378`; `scroll.js:84`); both would have to ask "is this a ceremony?" instead of "is there a ledger?".
- *(b).* Ceremony scrolls gain a Plan zone (`scroll-file.js:496`) and a live Standing Orders zone, retiring `CEREMONY_ORDERS_PLACEHOLDER` (`:55-56`); a ceremony run reads its scroll's orders beside its tail read; the deck's orders box asks "standing, or once?"; the steward's prompt adds the ledger's owed lines. §6's "An order from Loudon" (`Reference:230-232`) narrows to one-shot orders, and `_ops/Palace Ceremonies.md:103` changes with it.
- *(c).* `readStandingOrders` moves from a scroll zone to reading the ledger; `parseOrders` (`ceremony-scroll.js:99-117`) gains a third status; the cycle prompt and the deck both go to the ledger. Editing a standing order in place is the one move union merge handles badly — an edited line beside an appended one comes back in both forms (`Reference:249-251`).
- *CLAUDE.md.* (a) and (b) leave § A page and its folder alone. (c) moves orders from a face, the scroll (`:53`), into memory (`:55`).

**GSL walked through.** (a) Once GSL earns a ledger, "Stable Audio is out" becomes an owed line that one run pays, after which Now stops showing it — though it must hold for good — and GSL loses its Plan. (b) Both orders stay on the scroll; "re-render the marimba's top octave once" goes to the ledger as owed, and cycle 34 pays it. (c) Both orders move into the ledger as standing lines; the scroll's orders zone empties; the Plan stays.

**Lean: (b).** The orders in the survey are of both kinds on both kinds of page; the owed mechanism really does cost a standing order its permanence; and the steward already reads through the scroll, so (b) changes the ceremony side, which has fewer readers and no steward. It also keeps the Plan where 2026-09-27 wanted it.

---

### 5. What does Now show on a page that isn't a ceremony?

**Canon now.** §8 names two cases: a project's Now reads the board, a ceremony's counts runs since the spec changed (`Reference:290`). "Any other page can carry a scroll the same way" (`The Scroll.md:140`) leaves its Now unsaid. The code already has a third kind, `page`, which draws the project's Now with the word "page" in it (`scroll-file.js:395,403,416,465-468,747`). 2026-09-27 kept Now as pure live status and left this open (baton:75,95).

**The survey shows.** The page Now works for the Shopkeeper, because it is stewarded and posts to the board (`Shop/Shopkeeper/Shopkeeper — scroll.md:16-26`). It goes blind on a page whose runs never touch the board: the Hero and Avatar Maker's 74 runs went through commits and face.json, so its Now would read "Last shipped: nothing on the board yet" (`scroll-file.js:414`). The ceremony Now's "Last run" (`ceremony-scroll.js:334`) is what `last_tested` tries to keep by hand.

**Options.**
- **(a) The board view** for every page that isn't a ceremony — today's code.
- **(b) The ledger view where there is a ledger**, the board view everywhere else — today's routing, widened.
- **(c) Built from what the page has.** One renderer: a status line from frontmatter; a runs block when there's a ledger (last run, runs since the last change, what's owed); a board block when there's a steward (asks, ready to advance, stall, drift); and the newest trail section as "last made".

**What each would cost.**
- *(a).* No code. The Hero and Avatar Maker's scroll understates it, unless the companion door starts posting to the board.
- *(b).* What `projects.js:272` and `materializeAnyScroll` do already — and a stewarded page with a ledger loses its asks and its stall signal from the front door, while `process-cycle.js:460` keeps writing the board view: two writers again.
- *(c).* `renderCeremonyNow` (`ceremony-scroll.js:317-356`) and `renderNow` (`scroll-file.js:394-450`) become one; the cycle, `scroll.js` and the deck call one materializer; the deck's two row shapes merge (`projects.js:140-166` with `:213-229`). `last_tested` becomes computable and can retire.
- *CLAUDE.md:53.* "Where it stands now" holds under all three.

**GSL walked through.** (a) As today. (b) Once GSL has a ledger: "Version: none… Runs since the change: —", and the open asks leave the front door. (c) Status, the Plan line, what's waiting on Loudon and the stall signal as today, plus "Last run: cycle 33 · taught item 1 · owed: 1".

**Lean: (c).** The two renderers already exist and differ only in what they read; the deck already draws a page that isn't a project with the project's code (SERVICES, `projects.js:101-116`); and the pilot with runs off the board, the Hero and Avatar Maker, is exactly where (a) and (b) fail.

---

### 6. What does "ceremony" mean next?

**Canon now** — six registers, and they disagree:

| Register | A ceremony is | Cite |
|---|---|---|
| Palace Ceremonies | named in the tables **and** keeping a ledger: "the tables are how a person finds a ceremony; the ledger is how the machinery finds one" | `_ops/Palace Ceremonies.md:98` |
| SCHEMA | "a page Palace Ceremonies names as a ceremony's full spec" — the tables alone | `SCHEMA.md:101` |
| The scroll machinery and the deck | any entry with a ledger | `ceremony-scroll.js:7-9`; `projects.js:4-7` |
| The commit grammar | thirteen names — with Schema Ceremony, Connection and Query; without Return, Closing Well and Sentry | `_ops/stigmergy/app/src/lib/commit-spec.js:40-54` |
| The deck's canon guard | specs outside `_ops/` named one by one, because "what counts as a ceremony is still an open question (Palace Ceremonies — baton)" | `_ops/stigmergy/app/src/lib/entry-edit.js:119-125` |
| CLAUDE.md's trigger table | the words Loudon says — Connection, Query and "grow up" among them | `CLAUDE.md:84-101` |

Beside them: adding or removing a ceremony is a Schema Ceremony (`Reference:145`); the Ceremony Reader's gardener asks whether it tends something — "a ceremony that does not tend anything is not yet a ceremony — it is a checklist" (`_ops/Palace Ceremonies.md:121`); and The Scroll wants to "stay a reading surface, never a ceremony" (`The Scroll.md:29`). The baton offers: named in the tables? writes to the house with Loudon? something else? (baton:100).

**The survey shows.** The person's marker and the machine's already point at different pages for one rite: the trigger and the table name `Closing Well Ceremony` (`CLAUDE.md:88`; `_ops/Palace Ceremonies.md:78`), which has no version and no ledger, while both sit on `Closing Well` (`Closing Well.md:10`). The Schema Ceremony is called a ceremony everywhere and carries neither marker. Revival and Spore Check carry a ledger and have never run.

**Options.**
- **(a) Named in the tables.** `SCHEMA.md:101` wins; the ledger stops marking anything; the machinery reads the tables.
- **(b) A rite the palace runs on itself, on a word Loudon says.** Its subject is the palace — its canon, its shape, its memory, the way back into it — and it has a trigger. That takes in all thirteen and the Schema Ceremony. Work that makes things for the world (instruments, videos, dialogues) isn't a ceremony however often it runs or whatever files it keeps. The case that tests the wording: the Hero and Avatar Maker, whose runs make the palace's own faces.
- **(c) A frontmatter declaration** — a `trigger:` field, say — read the same way by people and by scripts. A new field, so a Schema Ceremony.
- **(d) Keep "has a ledger"**, and let every page that earns one become a ceremony.

**What each would cost.**
- *Code.* (a) `listCeremonies` reads the tables, or a list made from them. (c) It reads frontmatter, and the hand lists in `entry-edit.js` and `commit-spec.js` can be made from the same field. Under (a)–(c), `isCeremony` stops being "a ledger exists" (`ceremony-scroll.js:142-151`), and `projects.js:272,344,378` and `scroll.js:84` switch to the new test. (d) changes no code: the CEREMONIES box fills with projects and Shop pages, and every new ledger is a Schema Ceremony.
- *CLAUDE.md.* (a)–(c) drop "kept only by ceremonies" from `:55`; (b) is already the register of the trigger table's opening line (`:82`); under (d) `:55` stays true by definition.

**GSL walked through.** Under (a), (b) or (c), GSL with a ledger is still a project: a PROJECTS row, a project's Now, a Plan. Under (d) it becomes a ceremony: the CEREMONIES box, a ceremony's Now, no Plan.

**Lean: (b), carried for the scripts by (c).** The machinery needs a marker it can read, and today it disagrees with itself across five files; the meaning that fits all thirteen from a person's side is (b)'s, and (c) is how a script would see it. (d) answers Loudon's no-carve-out worry from the other side by making everything that learns a ceremony. The weakest lean here, since it rests on questions 2 and 3.

---

### 7. What is the rich face for a project?

**Canon now.** Sound, image and interaction "laid beside the words, section by section, never changing them" (`CLAUDE.md:53`); a manifest keyed by heading, each section stamped with a fingerprint of the prose it was made against (`Reference:289`). 2026-09-27: for a project, the rich face is "the best of it, curated", pieces replaced as the page gets better, while the scroll keeps every output (baton:76). Disagreement 2: a showcase isn't keyed to headings, so one of these texts has to change (baton:94). Open question 3: what a showcase lags against (baton:85).

**The survey shows.** One rich face exists in the whole palace — Kuramoto Coupling's, a concept rather than a project, made 2026-09-24. Its manifest already has a page-level block tied to no heading, an opening sound bed (`Kuramoto Coupling/Kuramoto Coupling — rich.json:21-22`). The one curated project showcase the palace has made is archived: `Projects/Project Stewardship System/Archive/2026-05-04 Proof Showcase.html`, and a `v2`. GSL's scroll already carries every output with a caption (`GSL scroll:96-99`).

**Options.**
- **(a) Keep it keyed by heading.** A project's best pieces sit beside the headings of its text; lag is the prose fingerprint, as now.
- **(b) Widen the manifest.** A page-level showcase list beside the sections, each piece stamped with the trail entry (or ledger item) it was chosen against, and flagged as possibly lagging once a newer trail entry exists.
- **(c) A showcase is something else** — a fifth zone on the scroll, or a face of its own — and the rich face stays as it is.

**What each would cost.**
- *Code.* (a) Nothing. (b) `rich.json` gains a list, and `_ops/rich-face/fingerprint.mjs` a second check that reads the scroll's newest entry id; the scroll already keys every section by id (`scroll-file.js:267`). (c) A new marker pair in every scroll and in the four-zone contract (`_ops/Substrate Skill.md:156-176`).
- *CLAUDE.md:53.* (a) Nothing. (b) "Section by section" gains "and the page's best work beside the whole". (c) A fourth face, or a fifth zone.

**GSL walked through.** (a) The 26-sample flute's audition sits beside the heading of the GSL entry that tells the AI-source story. (b) GSL's showcase lists the flute, violin, crystal and Shepard instruments, each chosen against `gsl-steward-067`; when a later cycle ships a better flute, the showcase says it may lag. (c) The scroll grows a "best of it" zone above The making.

**Lean: (b), lightly — or wait.** The manifest already has a page-level block, and judging lag by the newest trail entry uses ids the scroll already keeps. But the evidence is one rich face; this question loses nothing by waiting for a second, ideally a project's.

---

### 8. How does a baton name part of a bundle?

**Canon now.** A baton carries "an in-progress move on this entry" (`Reference:284`), linked to its parent as `baton-for` (`:275`). `context-of` already means "this Context file belongs to that card" (`:191`), so the baton says not to reuse it (baton:86). Qualifiers are allowed in bundle names (`:263`) and in use: `STIGMERGY/STIGMERGY — baton — latest-opus-resolver.md` and `— bundle-hygiene demote-op.md`. The baton executor can't write one yet — Baton item 10, owed (`Baton Ceremony — tuning.md:58`). Loudon: a baton is "basically a strong to-do within a bundle" (baton:111).

**The survey shows.** Twelve batons, two of them qualified. Batons already carry second links naming what they touch: this one points at SCHEMA — Reference as `lands-in`, the Revival baton at Shimmer Cloud as `first-run`.

**Options.**
- **(a) `baton-for` the parent, plus a second link labelled `targets`** to the file, with a qualifier naming it — 2026-09-27's suggestion.
- **(b) The qualifier alone**, no second link.
- **(c) When the target is a ledger or a run, an owed line instead of a file** — the ledger's owed lines are already the next run's to-do.

**What each would cost.**
- *Code.* (a) and (b) need `_ops/closing-well/baton-executor.mjs` to write qualifiers, which pays Baton item 10; under (a) it also writes the second link beside the `baton-for` it writes now (`:153`). The board scripts — `list-handoffs.mjs`, `pickup-handoff.mjs`, `close-handoff.mjs` — never read a baton's links, so a second one costs them nothing. (c) touches no code but adds a branch to the Baton card.
- *CLAUDE.md:55.* (c) blurs "a move in flight, deleted once caught" with an owed line, which is paid and kept.

**GSL walked through.** "Re-render the marimba's top octave": (a) `Generative Sample Libraries — baton — marimba-top.md`, with a `targets` link to the marimba's instrument folder; (b) the same name with no link; (c) an owed line in GSL's ledger.

**Lean: (a).** The naming rule already allows it, it pays an owed item, and it keeps a baton — a move the next Claude catches — apart from an owed line, which is a run's to-do. It can be settled any day.

---

## C. If every lean held — what a Schema Ceremony would touch

One line each: canon, then the mirrors, then code, then the pilot.

**Canon**
- `CLAUDE.md` — `:55`: the ledger is kept by a page that runs, once it earns one, and holds what running taught; `:53` unchanged unless question 7 goes (b); `version` and `last_schema_ceremony` (`:10,12`).
- `SCHEMA.md` — `:101`, what a ceremony is; the "adds" column if a `trigger:` field lands (`:79,87`); `version`.
- `SCHEMA — Reference.md` — §3: the ceremony field, and `last_tested` and `last_gotcha` either defined or retired (`:90-104`). §6: widened from ceremonies to any page with a ledger (`:177,202-207`); items record what a run taught (`:212,227-228`); Loudon's orders split into standing and once (`:230-232`). §8: the `scroll` row — Now built from what the page has, a Plan on any scroll, standing orders on the scroll (`:290`); the `tuning` row — any page that earned one, and what "gotcha" means beside it (`:291`); the `rich` row if question 7 goes (b) (`:289`); the `baton` row's `targets` link (`:284`). `version`.
- `SCHEMA/SCHEMA — Context.md` — the record of why, under §3, §6 and §8.
- `_ops/Palace Ceremonies.md` — `:96-105`, What Makes a Ceremony, and where a ceremony's orders go (`:103`).
- `The Scroll.md` — the project scroll's zones (`:49-71`); the ceremony scroll (`:127-142`) becoming the scroll of any page with a ledger; the counts in its Forward Vector (`:179-180`).
- `_ops/Substrate Skill.md` — the ceremony paragraph (`:84`); the zones and the read seam (`:156-178`).
- `ELDER.md` — `version`; a line on who writes a stewarded page's ledger, unless `:45-47` already carries it.
- `The Shop.md` — the Specialist anatomy's Gotchas and Test Suite (`:93-95`).
- `Shop/Maker.md` — logging at delivery (`:73`), its Test Suite (`:303-307`), its open question on memory (`:318`).
- `_ops/orchestrator/prompts/shared.md` — a field for offering a lesson (`:380-404`); reading owed lines (`:406-408`).
- The §5 mirrors — `ROSETTA.md` (its ceremony card, `:211-227`), `README - The Palace Guide.md`, `SUBSTRATE.md`: check each, and say so where nothing changes.

**Code**
- `_ops/stigmergy/orchestrator/src/ceremony-scroll.js` — the ceremony test (`:7-9,141-171`), Now (`:317-356`), `materializeAnyScroll` (`:421-425`).
- `_ops/stigmergy/orchestrator/src/scroll-file.js` — its header (`:1-32`), the placeholders (`:52-64`), one `renderNow` (`:394-450`), a Plan for every kind (`:496`), one materializer (`:702-780`).
- `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js` — owed lines beside the scroll's orders (`:201-231`).
- `_ops/stigmergy/orchestrator/src/process-cycle.js` — a run line when a cycle ends; the shared materializer (`:460`).
- `_ops/stigmergy/orchestrator/src/scroll.js` — `--all`, `--plan`, `--home`, `--ceremonies` (`:5-17,71,84,94,99-100`).
- `_ops/stigmergy/app/server/projects.js` — its header (`:1-21`), rows and groups (`:86-232`), reading and writing (`:265-383`).
- `_ops/stigmergy/app/src/components/projects/ProjectsDeck.jsx` (`:30-34,183,333-340`) and `ScrollView.jsx` (`:177`).
- `_ops/stigmergy/app/src/lib/entry-edit.js` (`:119-125`) and `commit-spec.js` (`:40-54`) — made from the ceremony marker instead of kept by hand.
- `_ops/closing-well/baton-executor.mjs` — qualifiers and the `targets` link; pays Baton item 10.
- `Shop/Maker/run-tests.mjs` — stops writing `last_tested` once it is computed (`:125-137`).
- `_ops/rich-face/fingerprint.mjs` — only if question 7 goes (b).
- The tests beside them, in `_ops/stigmergy/orchestrator/tests/` and `_ops/stigmergy/app/tests/`.
- `.gitattributes` — nothing: `"* — tuning.md" merge=union` already covers any page (`:4`).

**Not schema, found on the way**
- `_ops/Walk Ceremony.md` — `:38` and `:66` waive the run line `:42` requires; an edit to the Walk, with a ledger item.

**The pilot (the baton's step 5)**
- `Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md` — new, seeded with the 2026-09-26 batch's lessons (baton:57-69) and the page's two lists.
- `Shop/Hero and Avatar Maker.md` — `last_tested` retires (`:6`); `:53-63` and `:88-94` become one present-tense list of gotchas.
- `_ops/stigmergy/app/server/regen-lane.js` — the companion door writes the run line.
- Then GSL: `Projects/Generative Sample Libraries/Generative Sample Libraries — tuning.md`, seeded from the lesson sections of `DESIGN.md`.

---

**Not verified here.** What `regen-lane.js` would need to write a run line; the contents of `README - The Palace Guide.md` and `SUBSTRATE.md` for the mirror check; any file outside git — the Radio Play's scratch folder was seen only as a listing in the main checkout, the heartbeat logs not at all. The 74 face commits are a count of subjects beginning `enrich(` that name a hero, icon or face since 2026-06-24, not a read of each.
