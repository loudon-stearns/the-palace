---
title: SCHEMA — Reference
type: meta
pillars:
  - tools
  - practice
born: 2026-09
version: "1.29"
stage: foundational
status: canonical
links:
  - target: "[[SCHEMA]]"
    type: deepens
    label: unpacks
  - target: "[[SCHEMA — Context]]"
    type: connects-to
    label: sibling-archive
  - target: "[[STIGMERGY]]"
    type: enables
    label: coordination-schema
  - target: "[[Deposit Ceremony]]"
    type: enables
  - target: "[[Resonant Link Labels]]"
    type: connects-to
  - target: "[[Worktree Practice]]"
    type: connects-to
    label: specific-vs-hub
forward_vector: "I hold the writing rules an elder reads at the pen, so an agent reads me at the moment it writes rather than at every boot."
---

# SCHEMA — Reference

![[SCHEMA — Reference — hero.png]]

The operating half of the palace type system. [[SCHEMA]] — the card every elder reads on growing up — carries what
**exists**: the entry types, the stages, the link ontology, the self-description test. This file carries
what you need at the moment you **write**: the frontmatter fields, the change protocol, the ceremony-file
and bundle conventions, and the coordination wire.

**Read this before** creating an entry, writing or editing frontmatter, creating a bundle file, posting to
the [[STIGMERGY]] board, or changing the type system. Not before holding a conversation — that is what
an agent is born with, and keeping the rules out of the birth is the point ([[SCHEMA — Context]] §Tiering, v1.18;
§Born a child, v1.19).

**Section numbers are load-bearing and unchanged.** Roughly 180 references across the palace pin
`SCHEMA §3` / `§5` / `§6` / `§8` / `§9`. Those sections live here now and keep their numbers; the SCHEMA
card keeps §1, §2, §4, §7 and leaves a pointer at each gap. A pin still resolves to the right rules.

The *why* — the per-section change history, every `v1.x` record — is in [[SCHEMA — Context]], keyed by
section, as it always has been.

---

## 3. YAML Frontmatter Fields

### Required Fields (every entry)

| Field | Type | Notes |
|---|---|---|
| `title` | string | The entry's canonical name. Must match the filename (minus .md). |
| `type` | enum | See Section 1. |
| `pillars` | array | One or more of: creation, tools, philosophy, practice. **Optional for `specialist` and `maker`** — see those type definitions for rationale. |
| `born` | YYYY-MM | Month the entry was created. |
| `stage` | enum | See Section 2. **Optional for `specialist` and `maker`** — these types use `status` (alive \| stub) instead of the seed→fruiting lifecycle. |

### Strongly Recommended Fields

| Field | Type | Notes |
|---|---|---|
| `links` | array of {target, type, label?} | At minimum 1 typed link before an entry is considered a sprout. Use `[[Wiki Link]]` format for targets. Each link object may carry an optional `label` — see **Link Object Fields** note below. |
| `forward_vector` | string (one sentence, first-person) | The entry's directional desire — what it wants to become or do, voiced as the entry itself. The forward vector is the entry's articulated *conatus*: see [[Entry Conatus]] for the discipline of writing one. Avoid stasis-verbs (*remain, stay, continue, be*); reach for verbs of striving (*teach, spawn, integrate, cast*); name the hunger. **Forward vectors are meant to evolve.** Tweaks, refinements, and even full overhauls are encouraged during ordinary work, conversations, and Weaves — vector tuning is a regular practice, not a ceremony. The palace stays lively precisely because directional desire adapts to what entries actually become. An unchanging vector on an entry that has grown is itself a sign of drift. See [[Project Stewardship System]] for the stewardship-side framing and [[Weave Ceremony]] §Step 5b for the Weave-side beat. |

**Link Object Fields:** Each link requires `target` and `type`. The optional `label` field is a single word or hyphenated phrase naming the relationship with resonance and specificity. The `type` is the structural scaffold — it handles traversal, Weave topology analysis, and ceremony linting. The `label` is the semantic compression — it names the specific register of the relationship with cultural and emotional nuance. Examples: `midwifed`, `rhymes-with`, `fermented-from`, `argues-with-love`. Labels never require ceremony. They are the compression happening at the relational level.

### Use is computed, never kept

How much an entry is being used is not a frontmatter field. `_ops/swarm/entry-use.py` reads it from git as three kinds of activity: **page** (days the entry's `.md` was edited), **bundle** (days anything in its bundle was edited — where a page is played, run and made with), and **linked** (entries that formed a link to it). `use` is their sum, all-time and over the last 90 days, and `last_used` is the latest day of any of them; the script's docstring holds the counting rules. The Map Build writes both onto every map node, [[STIGMERGY]]'s PULSE sorts by them, and the Weave reads them for dormancy.

Reading is not recorded. A child reading a page may not write the house, so a count only some readers could bump measured who remembered to bump it. *(`activation_count` and `last_activated` were retired in v1.26 — see [[SCHEMA — Context]] §3. Do not add them.)*

When a page last ran is computed the same way, from its tuning ledger's run lines (§6). `last_tested` and `last_gotcha`, which some Shop pages still carry, are not schema fields and nothing writes them; each comes off its page when that page grows a tuning ledger. Do not add them to a new page.

### Enum values for the type-specific fields

Which types require which fields is the `adds` column in §1. The allowed values:

- `status` — `active | complete | archived` for `project`; `alive | stub` for `specialist` and `maker`
- `medium` — `paper | book | tool | recording | other` for `source`; `sound | image | motion | interactive | plumbing | other` for `specialist`
- `domains` — array of intellectual fields (`person`) · `revival_conditions` — string naming what would trigger revival (`spore`) · `tool` / `tool_version` — canonical tool name and pinned version, for reproducibility (`specialist`)
- `version` — a quoted string. On a schema-level `meta` entry it is the schema's version. On a ceremony it is that ceremony's own, and it moves only when the ceremony's spec changes — never on a run (§6). On any other page that keeps a tuning ledger it is optional: the page's own version of how it works, moved when a lesson changes that (§6).
- `trigger` — a list of quoted strings, the words Loudon says to begin a ceremony (`trigger: ["let's weave", "weave"]`). Carrying it is what makes a page a ceremony. Quote every phrase: one bad line blanks the page's whole frontmatter for every reader. A rite with no page of its own — Connection, Query, the Ceremony Reader — stays a row in the tables.

### Optional Fields (used selectively)

| Field | Type | Notes |
|---|---|---|
| `confidence` | enum | hypothesis \| working \| established |
| `energy` | string | Qualitative: low / medium / high / very high |
| `hook_quality` | integer 1–10 | Teaching/communication hook strength |
| `beauty` | integer 1–10 | Aesthetic resonance |
| `who_leads` | string | human / AI / shared |
| `tags` | array | Free-form. Do not use as a substitute for typed links. |
| `summary` | string | One-sentence description. Used in Rosetta Stone and meta-entries. |
| `status` | enum | For project entries: active \| complete \| archived |
| `agency_profile` | object | Four-dimensional expansion of `forward_vector` across the Four Pillars — see §3.1. Optional; only add when a page has genuinely distinct desires in multiple dimensions. |

**Field discipline:** Do not add new optional fields speculatively. If a field is only going to be used on one entry, it belongs in the body prose, not the frontmatter. New fields intended for multiple entries require a Schema Ceremony.

---

### 3.1 Agency Profile (Optional)

`agency_profile` is the four-dimensional expansion of `forward_vector`, structured across the [[Four Pillars]] framework. It is to `forward_vector` what `label` is to a typed link: the existing field works without it; the profile gives a second register that only engages when an entry has complex, multi-dimensional desire to express.

**When to add:** Only when a page has genuinely distinct desires across multiple dimensions that the single `forward_vector` sentence cannot carry. Do not add speculatively. The first candidates are entries that have been enchanted at least once and whose enchanted voice revealed multi-dimensional desire. As of v1.14, `person` entries built as embodiable citizens carry `agency_profile` by default — the enchantment-target case this field was designed for — with the `practice` sub-field naming the citizen's blindspot (what to dispatch it toward). See [[Making a Palace Citizen]].

**Structure:**

```yaml
agency_profile:
  creation: "What I want to bring into existence or spawn."
  tools: "What I need to deploy, and at what cost — specific and costed."
  philosophy: "My stance as a palace citizen; my world-currency concern."
  practice: "My self-examination: what in me is thin, calcified, or needs revision."
```

All four sub-fields are optional within the object — include only the dimensions with genuinely distinct content. An entry with a strong tools dimension but no distinct practice concern should populate only `tools`.

**Use:** coordinators read `agency_profile` before spawning an enchanted agent — `tools` makes the resource estimate legible up front (and translates directly into a `RESOURCE_REQUEST`), `philosophy` informs a moderator's framing, `practice` names what the agent should revise in itself. Worked detail: [[SCHEMA — Context]] §3.1.
---

### 3.2 The `specialist` and `maker` Types

The operative definitions of these two types are in §1 (types) and §3 (type-specific fields) above. Their full design rationale — why not reuse `practice` or `meta`, why two types not one, the `pillars` and `stage` exceptions, the v1.6 validation, and the 2026-06-16 migration note — lives in [[SCHEMA — Context]] §3.2.

---

---

## 5. Schema Change Protocol (The Schema Ceremony)

When any of the following change, a Schema Ceremony is required:

- Adding or removing an entry type
- Adding or removing a link type
- Adding a new required YAML field
- Changing the stage lifecycle
- Adding or removing a ceremony

**The Schema Ceremony steps:**

1. Propose the change with documented rationale
2. Review against existing entries: does this break or orphan anything?
3. Update SCHEMA.md
4. Update CLAUDE.md version field (increment MAJOR if breaking change, MINOR if additive)
5. Propagate to the secondary mirrors — every file that restates the changed vocabulary
   inline must be updated in the same ceremony, or it becomes a stale spec. The mirror set:
   ROSETTA (type/link/ceremony cards), `README - The Palace Guide` (entry-type + link-ontology
   + stage tables), SUBSTRATE (architecture + type list), `_ops/Substrate Skill.md`, and — for
   ceremony add/remove only — `_ops/Palace Ceremonies` and CLAUDE.md's trigger table. Update
   each the change touches; if none, say so explicitly. Any other page that restates what
   changed is beyond the mirror set: post one propagate flag for it (§9), so the next weave
   carries the change there.
6. Commit through the door with the ceremony's subject: `palace-commit --ceremony "Schema Ceremony" --summary "[what changed] — v[new version]"` writes `Schema Ceremony — [what changed] — v[new version]`

**Postcondition:** SCHEMA.md, CLAUDE.md, ROSETTA.md, README, SUBSTRATE, `_ops/Substrate Skill.md`,
and (for ceremony changes) `_ops/Palace Ceremonies` are internally consistent — verified by
`_ops/swarm/lint-doc-drift.py` exiting clean on errors. Git commit made with Schema Ceremony message.

**Failure mode:** If a schema change is made but its commit does not carry the Schema Ceremony subject, the change is not a Schema Ceremony; it is an undocumented structural edit. So each Schema Ceremony opens by reading the version moves since the last one (`git log --format='%h %s' -G'^version:' -- SCHEMA.md`). For any whose commit lacks the subject, it reconstructs the rationale from the diff and adds it to [[SCHEMA — Context]].

**Access vectors:**
- *Full:* Claude Code / Cowork (filesystem read/write + git)
- *Planning only:* claude.ai online (can deliberate and draft changes; cannot write files or commit)
- *Manual:* Obsidian + human (human makes edits; human runs git commit)
- *Not supported:* GitHub cloud alone

---

---

## 6. Ceremony Files, Versions and Ledgers

### Operational Card + Context Split

When a ceremony file exceeds ~8KB, split it into two files:

| File | Purpose | Read when |
|---|---|---|
| `[Ceremony Name].md` | Lean operational card — trigger, contract, steps only | Every ceremony execution |
| `[Ceremony Name]/[Ceremony Name] — Context.md` | History, rationale, process observations, open questions | Weaves, Schema Ceremonies, revisiting rationale |

**Rules:**
- The card is a canon entry and lives flat in `_ops/`, with full frontmatter
- The Context file is the ceremony's memory, so it lives in the ceremony's bundle (`_ops/[Ceremony Name]/`, beside its tuning ledger) as a §8 `context` file, with minimal bundle frontmatter
- The Context file links back to the card with `type: connects-to`, `label: context-of`
- The operational card links forward to the Context file with `type: spawned`
- When a ceremony operator is instructed to "add to the context" or "add to the log" for a ceremony, entries go in the Context file, not the operational card
- The operational card should remain readable and fully executable without the Context file

**Currently split:**
- [[Deposit Ceremony]] + [[Deposit Ceremony — Context]]
- [[Harvest Ceremony]] + [[Harvest Ceremony — Context]]
- [[Weave Ceremony]] + [[Weave Ceremony — Context]]
- [[Baton Ceremony]] + [[Baton Ceremony — Context]]

### Versions, ledgers, and run reports

Every ceremony carries a `version` (§3); so may any page that keeps a tuning ledger. It moves only when the
page's spec — how it works — changes, and the reason is recorded: as a tuning item when a run forced the
change, in the commit body when nothing did. Running never moves it. Changing a ceremony's version is an
edit to that ceremony, not a Schema Ceremony; adding or removing a ceremony still is (§5).

**Ledgers.** A ledger is an append-only file a page keeps in its bundle so its next run or waking starts from
what came before (§8). Any page may keep one when it is useful, and several. The kinds so far are `tuning`,
`diary` and the JSONL `placements` ledger, and a page may invent another. A page that uses a ledger outside
these rules is giving the palace an example to grow from, not breaking a rule. What every ledger shares:

- **It says how it is kept, in its own frontmatter**, on top of §8's minimal fields:
  ```yaml
  ledger: tuning
  standards:
    for: what running the Map Build taught it
    run: one map build
    line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
    read: the last 40 lines with run lines set aside, plus every line not yet paid
    writes: the run itself, in the commit that records it
    merge: union
    kept: git
    trim: never
  ```
  Only `ledger` and `standards.for` are required; a kind fills in what it needs. A JSONL ledger carries the
  same keys in its first line. No `standards` value says "owed", because the tail read's grep would find it.
- **A run is the page's own unit**, named in `standards.run`. By default it is one start-to-finish act of the
  page: a close, a cycle, a batch, an encounter. The test: a run is the unit whose lesson the next run should
  read before it starts. What a run *made* goes to the workshop and the scroll, never the ledger.
- **It merges by union** wherever `.gitattributes` names its kind. Add a line when a kind first appears.

The tuning ledger, run by run:

| What | Where | Holds |
|---|---|---|
| `version` | the page's frontmatter | the spec's current version |
| `[Entry] — tuning.md` | the page's bundle (§8 type `tuning`) | one run line for every run, and numbered items grouped by run date; each item says what the run taught and, when it changed how the page works, the change and the version it produced |
| `ceremony_version` | each run report's frontmatter, on top of §8's minimal fields | the version the run ran under — a stamp, never updated |
| `## What this run taught the ceremony` | the last section of each run report | the run's answer; "nothing" is a legal answer |

**Every run marks the ledger.** Whatever it taught, a run appends one line to the end of the tuning file, in
the commit that records the run:

```
- run · <date> · v<version> · <what it ran on> · nothing new
- run · <date> · v<version> · <what it ran on> · taught item N
```

Closing Well's ledger has `- run · 2026-09-25 · v1.1 · close-2026-09-25-ceremonies · taught item 31`; the
Baton's has `- run · 2026-09-25 · v1.0 · No Mind Checks Itself · nothing new`. "Nothing new" is data: the spec
held. The fixed prefix makes the runs countable (`grep -c '^- run · ' <file>`), and the page's scroll counts
them there. A numbered item is written when a run taught something — a step, a trap, a broken assumption —
whether or not it changed the spec; when it did, the item names the change and the version, and the run line
names the item.

Pages tune this to themselves. [[The Remembering Page]] offers one way: a lesson about *how* changes the page
after one run; a lesson about *who* — what the page wants — waits until it recurs across several runs, and an
item seen again is marked so, which shows a fix that keeps being re-fixed.

**Loudon's orders come in two kinds.** A **standing order** holds until he revokes it; it lives in its page's
scroll, in the Standing Orders zone, ceremony or not (§8 `scroll`). A **one-shot order** is a job for the next
run: it is appended to the tuning ledger as `- from Loudon · <date> · <his words> · owed`, and the run that
acts on it replaces `owed` with what it did — `paid in item 32`.

**A steward's proposals for canon wait here too.** A steward that wants a page changed, its own included, does not
write it. The cycle files each change it proposes as a numbered item beside its lessons, `N. **Proposed for
canon** · <date> · [[Page]] · <place> · canon change owed`, with the why, the path and the words beneath, and the
run line names it (`proposed item N for canon`). They are owed to Loudon, not to the run, so the steward's later
runs read them apart from the run's to-do and work as if each holds. Only Loudon's review of the ledgers settles
one: `canon change owed` becomes `paid in <commit> on <date time>` or `declined on <date time>: <reason>`, and the
next run reads it once. A later proposal that replaces it marks it `superseded by item N`.

Every run opens with a **tail read** of the tuning file, never the whole of it: its last 40 lines once the run
lines are set aside, and every line still **owed**, wherever it sits:

```
grep -v '^- run · ' <file> | tail -n 40
grep -n -w -i owed <file>
```

Those are the first candidates for the run's spec change. Forty lines is generous on purpose — several runs'
worth in every ledger so far — and a window that opens partway through an older run costs nothing, because
each item stands alone. Run lines are set aside because a busy ceremony would fill the window with them. The
ledger grows; the read stays the same size. An owed item says *owed* in so many words, so the grep finds it.

**Ledgers merge by union.** `.gitattributes` gives every ledger kind it names git's `union` merge, so two branches
that each append to the same ledger both keep their lines, without a conflict. It costs two things. Two
identical lines merge into one, which is why a run line names what the run ran on. And a line edited in place
beside a line appended on another branch comes back in both forms: when an item or an order shows up both
owed and paid, it is paid, and the next run deletes the stale copy.

---

---

## 8. Entry Bundles

An **entry bundle** is an optional sibling folder, named identically to the entry (no extension), that holds the entry's owned files. To anyone who arrives they are of three kinds ([[CLAUDE]] § A page and its folder): **faces** a reader meets beside the text — the rich face and the scroll; **memory** the next worker reads — the Context companion, the ledgers, the baton; and **workshop**, everything else made along the way. The `.md` is the canonical surface and the first face. Bundles are plumbing, not ceremony — they appear when a ceremony needs a file to live somewhere, and do not require their own invocation.

**Folder naming:** `[Entry].md` ↔ `[Entry]/` (exact match, no extension).

**File naming inside a bundle:** `[Entry] — [type] [— qualifier].md`. The `[Entry] — ` prefix is required even though the folder appears to provide context — Obsidian's wikilink namespace is flat across the vault, and filenames must remain globally unique. The folder provides grouping, not namespacing.

**Exception — code-folder READMEs.** A `README.md` that sits inside a code subfolder, beside the source it documents, keeps its conventional name rather than taking the `[Entry] — ` prefix. It is the folder's front-door file for non-Obsidian tooling (Finder, GitHub, editors), it is discovered by opening the folder rather than by wikilink traversal, and it carries no inbound wikilinks to break (a bare `[[README]]` could never resolve unambiguously anyway). It still carries minimal bundle frontmatter, so it stays self-describing.

**Lazy creation:** A bundle exists only when something needs to live in it. Do not create empty bundles. Most entries will never have one.

**Bundle files carry minimal YAML — but not none.** They are not first-class entries — they do not appear in Weave topology audits and do not require the full entry frontmatter (no `type`, `pillars`, or `stage`). But every bundle file carries at minimum:

| Field | Notes |
|---|---|
| `title` | Matches the filename. |
| `born` | YYYY-MM-DD when the file was created. |
| `links` | At least one link to the parent entry. Use `connects-to` with a `label` naming the specific register (e.g., `child-of`, `baton-for`, `context-of`). |
| `forward_vector` | One first-person sentence stating what this file is for and what its end-state is. Boilerplate per file type is fine; self-documenting is required. |

This keeps every file in the palace self-describing without conflating bundle files with entries. A ledger adds `ledger` and `standards` (§6).

**Initial type vocabulary (open, not closed):**

| Type | Scope |
|---|---|
| `baton` | Operational state for a new Claude picking up an in-progress move on this entry. Tight, transient, deleted after consumption; git is the archive. See [[Baton Ceremony]]. A baton aimed at one part of a bundle — an output, the rich face, a ledger — carries a qualifier in its name (`Foo — baton — marimba-top.md`) and a second link, `connects-to` labelled `targets`, to the file it is about. |
| `context` | Why the page is shaped as it is — what it left out, what was tried and dropped, the history of its design. It grows when the page's shape changes; what each run taught goes to a ledger, a page's encounters to its diary. Generalizes the Jewel — Context pattern. |
| `source` | Extracted, quoted, translated, or annotated source material supporting the entry. Use the qualifier slot to name which one (`Foo — source — borges.md`). |
| `sketch` | Half-formed material not yet ready for the entry body but too substantial for an HTML comment. |
| `enrichment` | A small made piece the entry embeds in its own body — a haiku, a twelve-word compression. Pieces laid *beside* the text rather than in it belong to `rich`. |
| `rich` | The entry's **rich face**: `[Entry] — rich.json`, a heading-keyed manifest of the Shop pieces laid beside the text, each section stamped with a fingerprint of the prose it was made against so the page can say when a piece may lag. Pieces made for it are `[Entry] — rich — [qualifier].<ext>`; gathered pieces keep their names. The rich face never writes the `.md`; what making teaches goes home as [[Enrichment]] says — an edit that changes no claim is shown to Loudon first; one that changes what the page says goes through the [[Deposit Ceremony]]'s map. It may also hold pieces for the page as a whole, beside the sections; how such a piece knows it lags is open. |
| `scroll` | The entry's **front door** — any entry may carry one. Four zones: **Now**, machine-owned and regenerated on every look; the **Plan**, the path agreed with Loudon — where the work is going, then the moves ahead, each named by what it does — which changes only with his yes (his own edit, an elder's write on his word, or a steward's `plan_revision` proposal he adopts), every change logged on the trail with what changed and why; **Standing Orders**, Loudon's, never regenerated; and **the making**, an append-only trail, newest first, where a thing made off plan is labelled so. **Now** shows what the page has: a project's reads [[STIGMERGY]]'s board (open asks, answers not yet consumed, last shipped, stall, drift); a page with a tuning ledger counts its runs since its spec last changed and gives its version; a page with a diary, its last encounter. Any scroll may hold a **Plan**, a ceremony's too, and a tuning ledger's owed lines are the next run's to-do beneath it. **Standing Orders** stay on the scroll for every page; one-shot orders go to the ledger (§6). Markdown. See [[The Scroll]], [[Project Stewardship System]]. |
| `tuning` | A **tuning ledger** — what running taught a page, kept by any page that learns from its runs: one line for every run, and a numbered item, grouped by run date, for every run that taught something. Loudon's one-shot orders wait here as owed lines, and a steward's proposals for canon as owed items. Merged by union. See §6. (A Specialist's page keeps its live gotchas — that word stays with tool traps; its tuning ledger, once it keeps one, holds their history.) |
| `diary` | A page's own first-person record of the encounters it has lived — what it said, what it privately thought, what others said aloud to it, never what they privately thought. Append-only, oldest first, never revised; one entry per encounter, written at its close. Loaded at each waking so the page wakes remembering ([[Palace Enchantment]]). A ledger (§6). The word is [[The Remembering Page]]'s; not `memory`, which already means too much here. |
| `dossier` | The deep research corpus behind a `person` entry — timeline, positions, characteristic moves, lexicon, blindspots, sourced quotes, dispatch notes — loaded when an agent must *embody* the person faithfully (Dialectic, Excellent Adventure, Philosopher Visit). One per made citizen. See [[Making a Palace Citizen]]. |
| `speech` | Cited, **context-tagged** verbatim excerpts of how a `person` actually talks, opening with a sources-and-their-limits ledger (spontaneous vs performative vs rehearsed vs fabricated), so voice is built from ground truth rather than synthesis. Feeds the entry's `## Voice`. See [[Making a Palace Citizen]] §Voice fidelity. |
| `toolbox` | The project's reproducible **environment manifest** — every runtime pinned (local apps, language runtimes, pods, worker images) plus extensions, assets, deps, and a per-pipeline portability status. Machine-actionable: the [[The Commons\|Commons]] provider reads it to build and deploy. One per project with real compute. Template: `_ops/commons/TOOLBOX-TEMPLATE.md`. |
| `proof` | Evidence that a capability, postcondition, or design intent holds — a mock, retrospective, fit-test, or worked demonstration. The bundle-file echo of [[STIGMERGY]]'s `PROOF` message type. Often under a `proofs/` subfolder. |
| `spec` | A specification for one deliverable to be built or dispatched — a patch spec, visuals spec, SFX cue sheet, or imagery brief. The recipe for a single owned artifact, not the artifact itself; typically routed through [[The Shop]] / a Maker. |
| `dialectic` | An archived [[Dialectic]] / [[Excellent Adventure]] transcript, kept because it produced a distinction its subject did not already contain. It lives in the bundle of the practice that ran it — every archived Dialectic in [[Dialectic]]'s bundle, where the runs gather as a record of the method — and links to the entries it argued over and the citizens who spoke. Distinct from `dossier`/`speech` (research *about* a person); this is the dialogue itself. |

*(`staging` was retired in v1.25 — a page's plan lives in its scroll's Plan; see [[SCHEMA — Context]] §8.)*

New types may be tried freely. When a type earns recurring use across multiple bundles, add it to this table — additions to this open vocabulary are not Schema Ceremony events. Only structural changes to the bundle pattern itself are. The per-type addition history (what earned its slot when, and that a catch-all `artifact` type was considered and rejected) is in [[SCHEMA — Context]] §8.

**Archive:** Consumed bundle files move to `[Entry]/Archive/`. Stays with the entry; git carries history.

**Wikilink resolution:** Obsidian resolves `[[name]]` flatly across the vault regardless of folder. `[[Foo — baton]]` resolves to that file inside `Foo/` without special syntax. The flat-namespace constraint is exactly why bundle filenames must carry the entry prefix.

**Hubs:** The bundle pattern applies to hubs the same as any entry. Whether hub-bundle conventions diverge in practice is an open question deferred to use.

**The `Artifacts/` folder is deprecated (2026-06-16).** Bundles consumed its purpose; entry-owned files live in the owning entry's bundle. The redistribution history is in [[SCHEMA — Context]] §8.

---

---

## 9. The Coordination Schema ([[STIGMERGY]])

§4 types the edges *between entries*; §9 types the edges *between agents*. The palace can be operated by several minds at once — AI stewards plus a human node — coordinating through **[[STIGMERGY]]**. An agent here may *be* a node in that swarm, or be asked to read or post to its board, so it must recognize the grammar. **This section is the wire; [[Palace Orchestrator]] is the executor. Read that before posting.** The philosophy and lineage are in [[STIGMERGY]] and [[BBS Blackboard]]: agents leave marks on a shared medium and react to what is already there, rather than addressing each other directly — the board is the medium, each message a mark, the `health` block its pheromone strength.

**The medium.** An append-only `.jsonl` blackboard, one JSON object per line, never edited or deleted. Per-session boards at `_ops/swarm/sessions/[id]/blackboard.jsonl`; the cross-session persistent board at `_ops/swarm/persistent/blackboard.jsonl`. **Git is ground truth; one write path, never `git add -A` in an N-writer repo.** In a multi-worktree checkout that one path is the **owner (main) worktree's** physical board — every worktree appends there, never to a per-branch copy (`_ops/worktree/SKILL.md` § Ceremonies in a worktree).

**The human node.** `TRICKSTER` is Loudon (or an automated stand-in — operational, not architectural). Agents do not decide at a fork: they post a `RESOURCE_REQUEST` to the `TRICKSTER` board with `blocking: true` and a set of `options`, and wait. The human answers `RESOURCE_GRANT` / `RESOURCE_DENY` naming the chosen `option_id`, correlated by `re`. `blocking` is a wire field, not a mood — a blocked agent is simply waiting.

**The envelope.** `schema_version, id, ts, session_id, from, to, type, board, payload, health`, plus optional `re` / `request_id` for threading. `from` is usually a palace entry acting as its own steward — *the page IS the agent* ([[Pages as Agents]]). `health` carries `context_pct, stop_reason, iteration, tokens_this_call, model, score`, written by the orchestrator, not the agent. **Speak like a person, log like a protocol.**

**Field conventions (pinned 2026-06-16, v1.12).** These were inferred from examples before — the examples drifted, so the wire did too. One canonical form each, no alternatives:

- **`from`** — the steward page's own title, spaces preserved (`Retrospective Delay`), per [[Pages as Agents]]. Not an invented handle (`KURAMOTO-1`), a process name (`deposit-ceremony`), or an ad-hoc label. Only role-agents with no home page keep a role handle: `TRICKSTER`, `COORDINATOR`.
- **`to`** — a specific addressee (page title or role handle), or `*` for any reader. `*` is the *only* broadcast token — never `ALL`. A board name (`GENERAL`, `WEAVE`) is never a `to` value; routing is the `board` field's job.
- **`health.model`** — the API model id only (`claude-opus-4-8`, `claude-sonnet-4-6`); for the human node, `loudon-trickster`. Never a process, ceremony, or tool name.
- **`session_id`** — one kebab-slug per agent, matching its `_ops/agents/permanent/[slug]/` directory; reused across that agent's sessions rather than minting slug variants for one page.
- **`health.score`** (green / yellow / red) is a live-API (Path 1) signal the orchestrator writes from response metadata; hand-authored and Path-2 messages carry a green stub. Optional `health._orchestrator_metadata` carries Path-2 dispatch info (`dispatch_mode`, `note`).

The strict validator gates malformed posts, and **as of v1.17 the gate matches this table**: `QUERY`, `PAGE_UPDATE`, `HEALTH_NOTICE` and a `BRANCHES` board were design-time proposals the spec had always excluded while the validators quietly accepted them — none was ever posted, and all four were removed. **§9 is the ratified enum set**, in the code as well as here.

**The message types** (the coordination ontology — like §4 link types, do not invent new ones without a Schema Ceremony):

| Type | Meaning |
|---|---|
| `BROADCAST` | Status, content, or artifact left for any reader. The default mark. |
| `RESOURCE_REQUEST` | Ask the human (or another node) for a decision/resource; carries `options`, often `blocking`. |
| `RESOURCE_GRANT` / `RESOURCE_DENY` | The human node's answer, naming the chosen `option_id`. |
| `FLAG` | A surfaced claim, tension, or weave candidate for later attention. |
| `PROOF` | Evidence a postcondition was met — a ceremony's "it completed." |
| `REPLY` | A threaded response to a prior message (`re`). |
| `SESSION_INIT` / `SESSION_CLOSE` | Open/close a run; `SESSION_INIT.payload` names the `session_kind` (e.g. `enchanted_songline`, permanent stewardship) and its path. |
| `RETRACT` | Withdraw a prior message that was posted in error, naming it in `re` and giving a one-line reason. The board is append-only, so a mistake is corrected by *adding* the retraction, never by editing the line. Ratified v1.17 after a wrong-path `handoff_ready` had to be corrected by overloading `handoff_picked_up` plus a repost — workable, but it made a naive board reader hit the wrong path first. |

**Boards** route attention: `GENERAL` (status/content), `TRICKSTER` (decisions for the human), `WEAVE` (palace-weaving flags: weave flags for the next weave, and the proofs and sparks that feed it), `FLAGS` (connections worth keeping), `SYSTEM` (session lifecycle).

**Weave flags.** Work for the next [[Weave Ceremony|weave]] is a `BROADCAST` on `WEAVE` whose `payload.kind` is `weave_flag`. It is not the `FLAG` type, which belongs to the `FLAGS` board. A session posts one through the Commons writer, run from `_ops/`, after showing Loudon its body and hearing his yes; only two tools post their own (the weave's trails, `weave-emit-trails.mjs`, and cowork-git's litter sweep). There are two kinds:

- An **entry flag** (`python3 -m commons weave-flag`) names its `source_entries` and asks for something done to them: `flag_type`, `source_entries`, `target_entry`, `proposed_action`, `rationale`, `source_deposit_id`.
- A **propagate flag** (`python3 -m commons propagate`, `flag_type: propagate`) carries a decision to every page it reaches. It names no source entries, so no touch can close it. It carries `decision`, `target_entry` (the decision's home, written first), `scope`, `check`, `rhythm` (`sweep`, or `by-touch` when pages should change only as they are next edited, which needs a pattern), `proposed_action`, `rationale`, `source_deposit_id` and, when the check is mechanical, a `pattern` with optional `paths` that the flag linter counts. The writer's flags name three of these differently: `--home`, `--action`, `--source-id`.

Either kind closes by a `Palace-Resolves: <id>` trailer. An entry flag may instead be declined (`Declined flag <id>: <reason>`), and an unfinished propagate flag is carried (`Carried flag <id>: <how far>`) for the next weave to continue. A decline line never closes a propagate flag; only Loudon retires one, by a `Palace-Resolves: <id>` written on his word and quoted in the commit body.

---

*"The purpose of abstracting is not to be vague, but to create a new semantic level in which one can be absolutely precise."* — Edsger Dijkstra
