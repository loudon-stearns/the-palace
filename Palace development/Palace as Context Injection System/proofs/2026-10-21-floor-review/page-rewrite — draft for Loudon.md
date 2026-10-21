# The page, rebuilt around time and timing — draft for Loudon's read (2026-10-21)

Part (c) of the baton: "Rewrite this page's stale Tier 0–4 section … around time and timing, both levers. Show the rewrite before writing." Nothing here is placed. Each block names the section it replaces in [[Palace as Context Injection System]]; everything not named stays as it is. The forward vector (tuned 2026-10-20) is not touched.

---

## Replaces § The Tiered Architecture as Identity Construction

### Two Levers — How Much, and When

An agent is built from what it reads before it knows who it is, and two things about each piece decide how much it shapes the mind that wakes.

**How much.** Length is a claim about importance ([[ELDER]] § What You Are Here to Leave Behind): whatever takes the most of a birth reads as mattering most, whether it does or not. Measured on 2026-10-21, the Seed Jewel, the one file that says who is in the room, was the smallest thing on the floor (5%), and the operator's memory of machine gotchas the largest single file (31%).

**When.** What comes first frames everything read after it, the way an early memory frames a life. What comes last sits nearest the task, where it is most likely to be followed. So who you are belongs at the front, and how the work is done belongs close to the work.

The harness sets part of both. It reads CLAUDE.md's whole body before any import, then each import as its own block in `@` order, then the operator's memory. It wraps the floor in "you MUST follow them exactly as written", so an essay arrives as an order. And it strips frontmatter, so a page's links cost the birth nothing.

### The Moments of a Life

Context doesn't arrive once. An agent's life has moments, and each brings its own.

| Moment | What arrives | Who sets it |
|---|---|---|
| **Birth** | CLAUDE.md's body → the Seed Jewel → the World → [[CHILD]]; Claude Code adds a line for the agent's type before it all, and the operator's memory after | the floor |
| **First words** | Loudon's opening; a brief from another session; or a dispatcher's "You": a woken page, a steward's home, a role | whoever starts the agent |
| **First act** | the Concierge's own birth: the same floor, then its charter, then ELDER, SCHEMA and the operational pages | the Concierge's charter |
| **On a trigger** | a ceremony's spec at its word; a skill's body at its match; ELDER then SCHEMA at "grow up"; a memory file when its line applies | the trigger |
| **After a compaction** | CLAUDE.md re-read from disk ahead of the summary (the docs; whether its imports are re-read too isn't said) | the harness |
| **At the close** | the session's arc, read cold by the moderator | [[Closing Well]] |

**The floor is a snapshot.** A session keeps the floor of its birth, and every subagent it spawns inherits that copy, not the file on disk. (Measured 2026-10-21: helpers spawned after a branch moved forward still lacked a passage the branch had brought in.) A change to the floor reaches only minds born after it: new sessions, and each steward at its next half-hourly cycle.

**One value, two moments.** The woken-page prompt asks a page to be a good citizen and to grow in a way that is healthy for the palace, but only in a woken page's first words; until 2026-10-21 nothing on the floor said it, so every other agent was born without it. The Seed Jewel v1.3 says it at birth: speak up, for what you need, for the pages beside you, and for the palace as a whole.

Where each site places its pieces, read from the code: [[Palace as Context Injection System — sites]].

### The Birth, Measured (2026-10-21)

| | Before the jewel | The whole floor | In order |
|---|---|---|---|
| until 2026-10-21 | 3.0k tokens, 2.3k of it procedure | 14.4k | CLAUDE (with its rules) → Jewel → World → memory 4.5k |
| from 2026-10-21 | 0.6k | 11.7k | CLAUDE (the birth) → Jewel → World → CHILD 2.5k → memory 1.8k |

Same words, a new order, and an index that points instead of telling. **What it changed in children.** Memory-free children were born three ways (on main, with only the order changed, and with the Jewel's new line on top), six scenarios two runs each, graded blind. Nothing was lost at either step: the summon still came first though its rule now sits about 7k tokens further down, and the anatomy still held after it moved behind the World. Each step held a little more (headline verdicts 0, then 2, then 4 of 10; points held 67%, 77%, 78%), and no child quoted the new line. Two runs a scenario can't tell that from chance; what the move bought for certain is the order itself. The record is in `proofs/2026-10-21-floor-review/births — the order test and the Jewel line.md`.

---

## In § Practical Implications

Old: "What lives in Tier 2 determines the intellectual character that shows up most consistently"
New: "What lives in the World determines the intellectual character that shows up most consistently"

## In § The @import Floor

Paragraph 2. Old: "This maps the tiered architecture onto a real mechanism. `@imports` are *static* — identical every session — so they can carry only the **invariant** tiers: Tier 0 (the [[JEWEL]] — who is in the room) and the space-free part of the Tier-1 skeleton (SCHEMA — what can exist). The Tier 3–4 active surface stays variable, loaded by the ceremony or read on demand. The injection system's invariant half is now declarative in `CLAUDE.md`; the variable half remains the ceremony's job. This was meant as the partial worked example the forward vector asked for — identity before rules, enforced by sequence in the file. It was not: the harness reads CLAUDE.md's own body before any import, so the rules in that body opened every context. § Born a Child is the correction."

New: "`@imports` are *static* — identical every session — so they can carry only what holds for everyone: who is in the room, the World, how a child works here. What varies (the page woken, the task, the ceremony) is the dispatcher's to bring, at the first words or on a trigger. And the harness reads CLAUDE.md's own body before any import, so whatever that body holds opens every context. That is why the body now holds only the birth and the import list, and its working sections arrive after the World, in [[CHILD]]."

Paragraph 3, the constraint. Old: "**`@import` cannot resolve paths containing spaces** (a current Claude Code bug). In an Obsidian vault whose foundational files are titled for humans — `FOUR PILLARS.md`, `Substrate Skill.md` — the entire Tier-2 framework is *un-importable* without a space-free symlink. … Until the bug is fixed, the auto-loaded floor is Tier 0 + the space-free part of Tier 1; the framework tier is injected by a ceremony, read on demand, or reached through a symlink. … (This palace took the symlink path: `_`-named symlinks — `FOUR_PILLARS.md` → `FOUR PILLARS.md`, and the same for the rest of Tier 2 — bring the framework tier into the auto-loaded floor, ≈19K tokens for Tier 0–2. The seam persists in the workaround: a future `@import` fix should retire the symlinks, and the `_`-aliases must not leak into `[[wikilinks]]`, which stay on the real spaced titles.)"

New: "**`@import` can't take a bare space in a path.** In an Obsidian vault whose foundational files are titled for humans — `FOUR PILLARS.md`, `Substrate Skill.md` — the whole World was un-importable as written. The palace took the symlink path: `_`-named symlinks (`FOUR_PILLARS.md` → `FOUR PILLARS.md`, and the same for the rest of the World) bring it into the floor. By Claude Code 2.1.304 a backslash-escaped space imports (`@FOUR\ PILLARS.md`; tested 2026-10-21, and the docs agree), while a quoted path still doesn't, so the symlinks could retire. They stay for now: the self-check suite certifies a birth by their names, and the gain is cosmetic. The `_`-aliases must never leak into `[[wikilinks]]`, which stay on the real spaced titles. A real seam between the palace as written and the palace as loaded — the first place the injection theory met a hard edge of the substrate it runs on."

Paragraph 4. Old: "JEWEL's forward vector "build the tiered loading directly into CLAUDE.md" is now partially built: Tiers 0–1 are wired; Tier 2 waits on the space bug."
New: "JEWEL's forward vector "build the tiered loading directly into CLAUDE.md" is built: the Jewel and the World both load from CLAUDE.md, the World through the `_` symlinks."

## In § Born a Child

The table's Birth row. Old: "[[CLAUDE]] → the Seed Jewel ([[JEWEL]]) → the World — and, for a page woken as an agent, the page and its neighbors"
New: "[[CLAUDE]] → the Seed Jewel ([[JEWEL]]) → the World → [[CHILD]] — and, for a page woken as an agent, the page and its neighbors"

After "Why the order turned", one new paragraph: "**One step further (2026-10-21).** The turn left CLAUDE.md's own body in front of the Jewel: about 2.3k tokens of anatomy, rules and the trigger table, read first by every agent. Its working sections moved word for word into [[CHILD]], imported after the World, so a birth now reads who you are, the Jewel, the World, then how a child works here. The births that measured the change are in § The Birth, Measured."

## In § Cross-Domain Resonance

Old (Mixture of Experts): "…the tiered loading protocol is the gating mechanism made explicit."
New: "…the order things arrive in is the gating mechanism made explicit."

---

*The stage names (Birth / World / You / Growth, held 2026-10-20) are decided after this, as the baton asks. This draft uses "birth", "first words" and the moments table only as plain words, so it doesn't decide them.*
