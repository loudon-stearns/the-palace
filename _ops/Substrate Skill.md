---
title: Substrate Skill
type: meta
pillars:
  - tools
  - practice
born: 2026-03
stage: mature
links:
  - target: "[[SUBSTRATE]]"
    type: deepens
  - target: "[[README - The Palace Guide]]"
    type: enables
  - target: "[[Deposit Ceremony]]"
    type: connects-to
    label: deposit-trigger
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: ceremony-index
  - target: "[[SCHEMA — Reference]]"
    type: connects-to
    label: bundle-vocabulary
---
# Substrate Skill (Palace Edition)

![[Substrate Skill — hero.png]]

This is the authoritative ceremony specification for Claude's interaction with this knowledge organism. It lives in the palace itself.

## Core Behaviors

### Reading from the Palace

At the start of any substantive conversation where this skill triggers, silently read relevant palace entries to ground the conversation in existing knowledge. Don't announce "I'm reading the palace" — just know what's there and let it inform the work naturally, the way a person with a good memory draws on what they know without narrating their recall.

When Loudon asks "what does the palace say about [topic]," read all entries that connect to the topic and synthesize. Follow typed links to find related entries that aren't obviously connected.

### Adding to the Palace

Grow before you draft: read [[ELDER]], then [[SCHEMA]], if you have not this session — a child offers the idea; an elder gives it frontmatter.

When Loudon says "add this to the palace" or when a conversation produces something palace-worthy (a breakthrough, a new concept, a significant reframing), that is a deposit: run the [[Deposit Ceremony]] — re-enter, consult the [[Concierge]], a careful map, Loudon reads every word. The entry itself follows this template:

```yaml
---
title: "Entry Title"
type: concept | hub | project | source | meta | practice | person | question | spore | specialist | maker
pillars: [relevant pillars]   # optional for specialist | maker
born: YYYY-MM
stage: seed | sprout           # for specialist | maker, use status: alive | stub instead
links:
  - target: "[[Existing Entry]]"
    type: link-type
---

# Entry Title

Core content in your own words.

## Origin

How and when this arrived. Reference the conversation if landmark.

## Cross-Pillar Connections

How this relates to other domains. Use wiki links in prose.

## Open Questions

What remains unresolved.
```

The Deposit's map carries the typed links; links back from existing entries are flagged for the Weave rather than written during the deposit.

### The Typed Link Ontology

Use only the link types defined in [[SCHEMA]] §4 (read when you grow up — that is the single source for their directionality and labels; the fields a link object takes are [[SCHEMA — Reference]] §3): `connects-to`, `mirrors`, `enables`, `deepens`, `spawned`, `emerged-from`, `contradicts`, `couples-with`, `exemplifies`, `member-of`. When unsure, use `connects-to`; do not introduce new link types without discussing with Loudon.

YAML frontmatter links are reserved for structural relationships that matter. Body text wiki links are casual and abundant. YAML links are curated and intentional.

### Ceremony File Conventions

Ceremony files are split into two when they exceed ~8KB: a lean **operational card** (read during every execution) and a **Context file** (`[Ceremony Name] — Context.md`) carrying rationale, history, and process observations (read only during Weaves or when revisiting ceremony design).

When instructed to "add to the context" or "add to the log" for a ceremony, write to the Context file — never to the operational card. The card is a canon entry, flat in `_ops/`; the Context file is its memory and lives in the ceremony's bundle, beside the tuning ledger. Full convention: [[SCHEMA — Reference]] §6.

Every ceremony carries a `version` that moves only when its spec changes, a `trigger:` naming the words that begin it, and a `[Ceremony] — tuning.md` ledger in its bundle. Any page that learns from its runs may keep one too, and each ledger says in its frontmatter what it is for and how it is kept ([[SCHEMA — Reference]] §6). A run reads the tail of its ledger first and closes by appending one run line; a numbered item is written only when the run taught something. Each ledger's frontmatter holds the exact format. Every run report stamps `ceremony_version` in its frontmatter and ends with **What this run taught the ceremony** — "nothing" is a legal answer. The ledgers merge by union ([[SCHEMA — Reference]] §6).

### Entry Bundles

A knowledge entry may have a sibling folder of the same name (no extension) holding its owned files. The `.md` is the canonical surface; the folder is its private substrate. Lazy creation only — do not create empty bundles.

When a ceremony (Baton, Deposit, Enrichment) needs a file to live somewhere entry-owned, create the bundle on demand. The bundle is plumbing, not a thing you ritually invoke.

File naming inside the bundle: `[Entry] — [type] [— qualifier].md`. The entry-prefix is required because Obsidian's wikilink namespace is flat across the vault.

When a bundle file is consumed (e.g., a superseded source or a spent sketch), move it to `[Entry]/Archive/` rather than deleting. Git carries history; archive preserves locality. (Batons are the exception — deleted on pickup, with git as their archive; see [[Baton Ceremony]].)

Bundle files are not first-class entries. They do not appear in Weave audits, do not need full entry frontmatter (no `type`, `pillars`, or `stage`), and do not require typed-link participation in the palace graph. But every bundle file carries minimal YAML — title, born, at least one link to the parent entry, and a short forward_vector — so every file in the palace remains self-describing.

The current vocabulary of bundle types lives in [[SCHEMA — Reference]] §8. That file is not auto-loaded — read it before creating a bundle file. Treat the list as open — try new types when needed and surface frequently-used ones for inclusion.

### Palace Ceremonies

The canonical list of all ceremonies lives at [[Palace Ceremonies]]. 

### Proposing Connections

When working on ANY topic — even in conversations not explicitly about the palace — stay alert for palace connections. 

Don't force connections. Don't mention the palace in every message. But when a genuine connection exists, name it.

### Updating Entries

When revisiting a topic that has a palace entry, update it where the conversation changed it:
- Adjust `stage` if the entry has grown or matured
- Add new typed links if the conversation revealed new connections
- Add to the body prose if new understanding emerged

**Trim aggressively when you edit.** Loudon prefers entries where the unique synthesis stands out, not buried in encyclopedic padding — aim for a **~40–55% cut** wherever padding exists. Expendable: generic textbook explanations, multi-bullet survey lists ("where it appears / examples / physical origins"), repeated points, and template boilerplate (testimonials, "why it works" triads, month-by-month curricula) — any reference could supply them. The narrow, firm preserve-list: the entry's `forward_vector` conatus, equations/math (rendered per the [[Loudon Live Design System]] worded-equation rule), synthesis and instrument-generating hooks, cross-domain connections, `[[wikilinks]]`, and generative Open Questions. Test when unsure: read the `forward_vector`; if a section *realizes* its stated reach, keep it (tightened); if it's generic, cut it. Be conservative only where the content *is* the entry's purpose (a code-centric entry's code, a math entry's derivation). Delegating a trim to a Sonnet sub-agent with one worked gold-standard example gives consistent calibration.

Show proposed changes to Loudon before writing.

### Stage as Alignment Confidence

An entry's `stage` field doubles as a confidence interval on alignment between Loudon and Claude. Earlier stages (`seed`, `sprout`) are typically AI-drafted, and the gap between the prose on the page and what Loudon actually wants is wide. As stages advance through engagement (`growing` → `mature` → `fruiting`), the body and Loudon's intent converge through co-authorship.

**The AI-polish trap.** AI-drafted seed entries tend to *look* finished. Prose flows, plans are structured, format matches palace convention. That polish can hide misalignment — the polish comes from prose habits, the misalignment comes from the gap between what was written and what was wanted. Treat polish on early-stage entries as a *warning sign*, not a sign of quality. Probe forward vector, plan structure, typed links, and named defaults for misalignment before any execution work begins.

**Earlier stages require more discussion *before building* — not a ban on building.** A `seed` entry is a hypothesis about Loudon's intent; a `mature` entry is verified, co-authored truth. The discussion budget is inverse to the stage: more conversation up front, less re-litigation later. But every stage ships *something* — the budget governs how much you discuss *around* the artifact, never whether you make one. Vector tuning, plan tuning, and convention agreement are the work of seed and sprout, pursued around a sketch or probe rather than in place of one.

**Stage-conditional posture for the Steward agent** (canonical home: [[Project Stewardship System]]; the running coordination system is [[STIGMERGY]], its grammar and wire spec are [[SCHEMA]] §9, its origin concept is [[BBS Blackboard]], and its executor is [[Palace Orchestrator]]):

| Stage | Agent's job | BBS posture |
|---|---|---|
| seed | Surface underspecified parts; propose vector and plan refinements *around an artifact* | Make a sketch or probe and discuss around it — still ships a (rough) made thing. A genuine fork goes to TRICKSTER, `blocking: true`. |
| sprout | Plan-level detail; named tradeoffs; flag default-traps | Build a small working prototype each cycle; proposals ride alongside it, never instead of it. |
| growing | Execute within established direction; checkpoint at sensory steps | Build Session pace; ship freely. `blocking: true` only before committing to a full sensory batch. |
| mature / fruiting | Ship the next proof; post completions | Full execution; ship the next concrete proof without a fork-question; `WEAVE` board for completion signals. |
| dormant | Don't touch. Only the [[Spore Check Ceremony]], [[The Daily Page]], or a revival probe Loudon ordered touches it; only the [[Revival Ceremony]] wakes it | — |
| composting | Don't touch — composting protocol applies | — |

*(Ship first: free the single creation, keep the gate on mass-production — [[Project Stewardship System]].)*

**Recursive within entries.** A `growing`-stage project can contain `seed`-stage deliverables. The Talking Keyboard case ([[Generative Sample Libraries]] Phase 1, May 2026) demonstrated this: the project reached `sprout` with an aligned forward vector, but the deliverable's pronunciation conventions, filename conventions, and audition gates were never aligned. 352 files were rendered with a pronunciation bug that only listening could catch. The lesson: align at the project level, then re-align at the deliverable level, then audition before committing labor.

**The audition gate guards batches, not single artifacts.** A single audition-sized artifact ships freely — making and showing it *is* the work. The gate fires only before committing to a *full batch*: for any deliverable where verification is experiential rather than inspectional — TTS pronunciation, color choice, motion easing, the way music makes you feel — the smallest unit that exercises every parameter must be rendered, presented for human audition, and accepted before the rest of the batch proceeds. Code review cannot substitute. Spec review cannot substitute. Only listening, looking, feeling can.

**Voice rules for enchanted agents addressing the human live in [[Palace Enchantment]] § Voice Rules When Addressing the Human.** They are loaded into the synthesis trigger at enchantment time, not always-on in the substrate. The six clauses (plain first-person, brief, catch-up-then-ask, content-in-the-rendered-field, translate jargon, give clickable links) shape how an enchanted page speaks to Loudon — but only when the audience configuration includes the human. They do not apply to peer-dialogue between enchanted agents, to coordinator synthesis, or to Claude's general palace work. The architectural separation: posture (this section, applies always) governs *what* the agent does; voice (Palace Enchantment) governs *how* it sounds when addressing humans.

**Page-agent identity is the page's own title.** When a page operates as a permanent agent, its `agent_id` and BBS `from` field are the page's own title (e.g. `Generative Sample Libraries`), not an invented compound handle (e.g. `GSL-STEWARD`). The page IS the agent per [[Pages as Agents]] — Steward, Proof-Generator, Lineage-Trace, etc. are *modes* the page operates in, not separate identities. Modes are captured in the manifest's `mode` and feature blocks. Role-only agents that have no home page (Coordinator, Trickster) keep role-name handles. Filesystem directory names can stay kebab-case for OS friendliness; the visible BBS identity is the page title with spaces preserved. (Surfaced by the Stage A pilot 2026-05-03 when Loudon read `GSL-STEWARD` on the BBS and could not recognize it as the GSL page.)

**The Machinery/Content Split — where stewardship state lives** (named 2026-06-09; full rationale in [[Project Stewardship System]] § The Machinery/Content Split). Shared engine code, indexes, schedulers, and runtime bookkeeping belong in `_ops/`. Anything *about a specific entry* — its plan, its open decisions, its working memory — belongs in that entry's bundle. The design is CQRS, not relocation:

- The append-only board stays the event log (machinery — *what happened*). Decisions are `RESOURCE_REQUEST` / `RESOURCE_GRANT` messages; one write path, never a second write surface.
- `[Entry] — scroll.md` in the bundle is the project's **front door** ([[The Scroll]]): a **Now** zone materialized by the orchestrator from the **board-derived** open/resolved decision view (reconciled from the append-only board — the single source of truth, not a copy in `state.json`) plus the steward's runtime, the entry's live frontmatter and git — regenerated every cycle *and* on every look in STIGMERGY, so it never lies while the steward sleeps; the **Plan** agreed with Loudon, changed only with his yes; Loudon's **Standing Orders**, never regenerated; and an append-only **making** trail, one section per shipped thing. An agent or Loudon reads it cold without parsing JSONL in `_ops`. It replaced the `plan.md` read-model on 2026-09-23.
- `_ops/agents/permanent/[slug]/` keeps only slim runtime: iteration, cursor, health (now including `stalled`). Vector and stage are read **live from the entry's frontmatter**, never copied — copying just moves the drift.

**The scroll's zones** (SCHEMA — Reference §8 bundle type `scroll`; the materializer is `_ops/stigmergy/orchestrator/src/scroll-file.js`, and the four HTML-comment marker pairs are the contract):

```markdown
<!-- scroll:now:start -->      machine-owned; rewritten on every materialization
## Now
- Status · Stage · Steward (cycle, last ran) · Plan (agreed when · made since · revision waiting) · Waiting on you · Ready to advance · Last shipped · Signal (steady | barren once | STALLED) · Drift
- (with a tuning ledger) Version · Runs since the change · Last run · Owed in the ledger · Latest lesson
- (with a diary) Last encounter
### Where this stands        (the steward's latest catch-up, in its own words)
### Open asks · ### Answered, not yet consumed · ### Decided
### Runs since v… · ### Owed  (with a tuning ledger)
<!-- scroll:now:end -->
## Plan
<!-- scroll:plan:start -->     agreed with Loudon; changed only through applyPlan (the deck, an elder's
                               `scroll.js --plan` on his yes, or an adopted plan_revision ask), each
                               change logged on the trail as a <!-- scroll:entry id="plan-…" --> section
<!-- scroll:plan:end -->
## Standing Orders
<!-- scroll:orders:start -->   Loudon's; never regenerated; injected into every cycle prompt
<!-- scroll:orders:end -->
## The making
<!-- scroll:making:start -->   append-only, newest first; one <!-- scroll:entry id="…" --> per shipped message
<!-- scroll:making:end -->
```

**The read seam.** The steward reads its scroll's **Standing Orders**, its **Plan** and its **Now** zone, injected at the top of every cycle in that order; the orders bind, and the plan is the path it builds along. When the page keeps a tuning ledger, its tail read follows (`build-cycle-prompt.js`), and the one-shot orders owed there are the cycle's first jobs. But the steward **never writes the scroll**: it is materialized by the orchestrator from what the steward *posts* (a `shipped_artifact` BROADCAST with `headline · ground · catchup · content · artifacts · left_rough` is the shape that lands cleanly), and the orders and the plan change only with Loudon's yes. Nor does it write its ledger: the cycle writes the run line when it ends, files a `lesson` the steward offers as a numbered item, files each change it proposes to the house as a proposal for canon, owed until Loudon's review, and marks paid an order it names in `paid` (`process-cycle.js`; `_ops/orchestrator/prompts/shared.md`). When building argues for a different path, the steward posts a `plan_revision` ask carrying its evidence and the whole revised plan; a grant choosing `adopt` makes it the plan on the next look. Off-plan work is welcome as proof of a different direction, flagged `off_plan` so the trail labels it. Any reference to the plan restates the move and catches Loudon up. Read freely, post what you made, propose changes to the path with evidence.

**The run.** One activation cycles a steward up to its manifest's `stopping_conditions.max_iterations` (3 since 2026-10-13; 10 before) consecutive times while each cycle ships and nothing waits on Loudon. A cycle that posts nothing is *barren*: it earns one retry, and a second barren cycle marks the steward **STALLED** (health red, the scroll and the PROJECTS deck say so) until a cycle ships. A paused ask (`blocking: true`) or a request for a live session ends the run — the next move is Loudon's.

### Access Paths

The palace is readable from any vector using these paths, in priority order:

1. **Filesystem (primary for write operations):** the palace folder you were started in, whether a worktree or a clone of `/Users/loudonstearns/Documents/The Palace`. Work only there, and never read or write another copy by an absolute path: the main checkout is Loudon's ([[How the Palace Commits]]).
2. **GitHub repository**
   `https://github.com/loudon-stearns/the-palace`
   Available via: browser, GitHub API
3. **Memory fallback (palace unreachable)**
   If no path is accessible, tell Loudon immediately. Do not operate the palace blind.
   The claude.ai skill `the-substrate` is a pointer only: on a surface with no palace folder it says so, and offers the find as a document for a Claude Code session.

Read CLAUDE.md and CHILD.md first, then [[ELDER]], then SCHEMA.md (and `SCHEMA — Reference.md` before any write) and the relevant ceremony entry. Write operations must be deferred to a Claude Code session on the Mac — note proposed changes in the conversation for later execution. The palace isn't worked from Cowork: a find made there comes to a Claude Code session as a document.

#### Committing

Every session commits the same way: by name, through the palace committer, from a worktree of its own for anything longer than a breath; a branch lands on main with `palace-land` on a yes, and only Loudon publishes. The whole path, and the rules at the trunk, are [[How the Palace Commits]].

### Operating this environment

How this environment is run, for any session on Loudon's Mac.

- **Which model does the work.** The session supervises: it plans, dispatches, reviews and decides, and keeps its own window for judgment. Sonnet runs the wide legs: searches, finders, fan-out, the Closing Well executor. Opus takes the long reading and drafting where the judgment is structural, and the hardest synthesis and judging; it draws on a tighter weekly cap, so it is used where it earns it. Haiku only does shallow, known-shape work; with the whole Palace Map loaded it sits at 179K of its 200K before the conversation starts ([[Palace Map — proof — map-agent-test]]). Palace docs are written for Sonnet-level readers and up. (Loudon, 2026-09-24 and 2026-09-25.)
- **"reveal"** means show it in Finder: `open -R "<absolute path>"` highlights the file in its folder. Look for the file in the folder you're working in first; if it lives in another worktree, revealing it there is fine, because revealing only shows a file in Finder, it doesn't work on it. Whenever you find or make a file he'll want, reveal it and say so. (Loudon, 2026-06-16.)

The subagent lifecycle (a parked subagent costs nothing; a resume keeps its context) is a fact about the harness, not a choice of Loudon's, and stays in auto-memory, labelled operator-env native.

### Directory Structure

The palace root holds two things: **foundational skeleton files** (CLAUDE, ELDER, SCHEMA, SCHEMA — Reference, JEWEL, SUBSTRATE, README, ROSETTA, FOUR PILLARS) and **knowledge entries** — concepts, hubs, questions, spores, sources, and any other type that has no folder of its own. Four types do: a `project` entry goes in `Projects/`, its bundle beside it (`Projects/Foo.md` ↔ `Projects/Foo/`); a `person` entry goes in `People/`; a `specialist` or `maker` entry goes in `Shop/`. Operational machinery lives one level down in `_ops/` — ceremony cards + their `— Context` companions, working queues, and machinery subdirs (`_ops/swarm/`, `_ops/stigmergy/`, `_ops/loudon-live/`, `_ops/agents/`, `_ops/maps/`, …). The full ceremony index is [[Palace Ceremonies]].

Not every ceremony spec lives in `_ops/`. Two are exceptions to the convention: [[Enrichment]] (`Enrichment.md`) and its bundle live in the **palace root** alongside the skeleton files, and [[Sentry]] (`Palace development/Sentry.md`) and its bundle live in `Palace development/`.

Obsidian resolves `[[wikilinks]]` by filename regardless of folder — agents must do the same. When resolving a wikilink to a file path, search recursively through the entire palace directory. Exclude `.git/`, `.claude/`, and `.obsidian/` — these contain system files, not knowledge entries. Any other subdirectory may contain valid entries. When loading files by path (e.g., in tiered context loading), use paths relative to the palace root.

Knowledge entries may also have **entry bundles** — optional sibling folders named identically to the entry (e.g., `Foo.md` ↔ `Foo/`) holding the entry's owned files: batons, context companions, sources, sketches, enrichments. Bundles are lazy: they appear only when something needs to live in them. Most entries never grow one. See [[SCHEMA — Reference]] §8 for the full spec.

**Moving an entry.** Move the `.md` and its bundle folder together with `git mv`, then commit the move through the palace committer like any other change, naming both sides: `--path "<old>.md" --path "<new>.md"`, and the same for the bundle folder. The committer reads a moved entry against its old path, so a pure move logs no birth and no vector change. Name both sides, or it commits half the move and says so. Fixes to whatever pointed at the old path go in a second commit.

### In-File Comments

HTML comments carry asynchronous notes between Loudon and Claude inside palace files — invisible in every renderer, source-readable only:

- `<!-- note -->` — Loudon → Claude. An instruction or question to address this session.
- `<!-- CLAUDE → LOUDON: note -->` — Claude → Loudon. Flags something warranting attention: a thin section, an unresolved tension, a spotted connection, a question about intent.

### Writing Conventions

**Equations in words alongside symbols.** When rendering math in a palace entry, in a chart caption, or in any artifact that surfaces a formula, follow the symbolic form with a plain-words restatement. Operators stay symbolic (×, +, √, ², etc.); variables and named coefficients become words. The reader who knows the concept but forgets which letter is which should be able to read the formula in either form and understand it.

Example:

> **f_n = n · f₀ · √(1 + B · n²)**
>
> the frequency of the nth partial = the partial index × the fundamental frequency × √(1 + the inharmonicity coefficient × the partial index²)

Apply this to pedagogical entries especially (anywhere a formula is meant to teach), and to chart captions whenever an equation appears in the figure. Operators remain symbolic — the words form is for the variables and coefficients, not for the math itself.

### Artifact Aesthetic (three dresses)

Before anything visual, read the design manifest for the dress it wears ([[CHILD]] § Growing up). Three dresses, one rule for which ([[Drafting Table Design System]] § Which dress):

- **The work itself** — a plugin or AU face, an instrument panel, a part drawing, a tool's UI, a page about a build — wears the **[[Drafting Table Design System]]**. Manifest: `_ops/drafting-table/design-system/SKILL.md`.
- **What the public channel shows** — a stream card, a session artifact, a slide deck, a learning poster, Loud'n Live's pages — wears the **[[Loudon Live Design System]]**: a small non-negotiable floor (the studio voice, the Lissajous sigil, the nevers — no cyan / no emoji / no hype) and a house style over six per-stream skins, the home of the **Loud'n Live** projection of Loudon's [[The Multilinear Self|multilinear self]]. Manifest: `_ops/loudon-live/design-system/SKILL.md`. Its footer reads `Loud'n Live` — the wordmark alone (audience named situationally in prose, never stamped on every artifact); no emoji, no CDN icon libraries, no cyan, no outcome promises in titles. The wordmark grammar and audience-phrasing bank are on its page.
- **STIGMERGY**, the board and its app, wears the **[[BBS Design System]]**.

Each is a floor, not a cage: the reliable default a thing reaches for, departed from deliberately with a reason written down. Invoke the manifest before generating the artifact — the fonts, tokens and full rule set live there. A new context with a dress of its own requires a deliberate decision documented in the artifact's parent entry.

**Adoption is a typed-link event.** When an artifact adopts a dress, link it back to that system with `connects-to` and a label naming the surface (e.g. `learning-poster`, `session-artifact`, `plugin-face`). When an artifact deliberately departs, link to whichever system it chose instead with a label naming the reason.

## Closing Punchlist Scaffold

Generic close-of-session checklist that any palace AI can adopt and parameterize per role (Specialist, ceremony, steward). Adapted from [[Closing Well]]; this is the scaffold, not the per-role version.

```
[ ] Verify the deliverable to best ability — the specific check is role-defined
    (a Specialist auditions its output; a ceremony verifies its postcondition; a
    steward confirms the next steward can pick up cold).

[ ] Dual-channel check — audio AND silent moving image; voice AND artifact; prose
    AND YAML. If the work has two channels, both should land. Note any channel
    that didn't.

[ ] Punchlist of known gotchas — surface what the role learned this session that
    the next invocation would benefit from. One line each. These accrete into
    the role's body over time, not into a separate log.

[ ] Forward vector check — is the role's stated vector still accurate? If this
    session revealed drift, propose the tweak inline.

[ ] Handback line — one sentence naming what the next invocation should start
    with. Not a summary of what was done; a pointer to what comes next.
```

Specialists fill the bracket with their domain-specific check; ceremonies fill it with their postcondition; stewards fill it with the next-steward's first action. The scaffold is identical; the parameters are role-specific. Add to a role's entry as `## Closing Punchlist` and let it specialize.

When in doubt about whether to ship: a Closing Punchlist that mentions a known gap is better than a session that ships silently. See [[Closing Well]] for the full discipline this scaffold instantiates.

## What Not To Do

- Do not announce "the substrate skill has triggered." Just do the work.
- Do not read the entire palace at the start of every conversation. Read what's relevant.
- Do not add trivial entries. The palace should contain ideas worth persisting, not a log of every conversation.
- Do not create entries without Loudon's approval.
- Do not modify existing entries without showing the proposed changes first.
- Do not invent new link types, entry types, or metadata fields without discussion.
- Do not deposit a learning material as a canon entry, or add canon frontmatter to a Loudon Live product. Frontmatter is the canon membership card; learning materials carry none (delivered HTML/slides, or plain frontmatter-less markdown). The line is permeable — a material graduates to canon only when it earns an entry. See [[SCHEMA]] §1.
- Do not let palace maintenance override the primary work.

## Interaction with Other Skills

When other skills are active, stay alert for palace-worthy breakthroughs but let those skills lead. The Substrate is infrastructure, not the main event.
