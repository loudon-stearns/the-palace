# The floor, measured — 2026-10-21

Workshop notes for the floor review commissioned on [[Palace as Context Injection System — baton]]. Measured on branch `claude/pacis-floor-242548` at 635b9103 (today's main). Nothing here is canon.

## How it was measured

Token counts come from Claude Code's own `/context` table, read by a headless `claude -p /context` that makes no model call ($0; Claude Code 2.1.304, the desktop app's newest). The probe is the one `birth.mjs` uses to certify a birth; the script that ran it here is `context-probe.mjs` beside this file. Run in this worktree, it shows the floor as Loudon's own sessions get it, MEMORY.md included. Section sizes inside CLAUDE.md are chars ÷ 3.2, calibrated against the table's 3.0k for the whole body.

## What every agent in this repository reads, in order

All of it arrives before the first word of the task, inside one system reminder that opens: "These instructions OVERRIDE any default behavior and you MUST follow them exactly as written." The World's essays are read under that frame too.

| # | What | Tokens | Share of the floor | Kind |
|---|---|---|---|---|
| — | Claude Code's system prompt, tools, skill list (not the palace's) | 4.4k + 2.8k + 7.7k | — | harness |
| — | Agent-file text (subagents only; one line, e.g. "You are a palace worker") | ~65 | — | role |
| 1 | CLAUDE.md body | 3.0k | 21% | see below |
| 2 | JEWEL.md (the Seed Jewel v1.2) | 0.75k | 5% | identity |
| 3 | FOUR PILLARS | 1.3k | 9% | world |
| 4 | Palace Philosophies | 1.6k | 11% | world |
| 5 | Cooperation Yields Agency | 1.0k | 7% | world |
| 6 | Hilaritas Generator | 0.84k | 6% | world |
| 7 | Modes of Collaboration | 1.4k | 10% | world |
| 8 | MEMORY.md (operator auto-memory index) | 4.5k | 31% | operator rules |
| | **Floor total** | **14.4k** | | |

The Seed Jewel, the one file that says who is in the room, is the smallest thing on the floor. Operator gotchas (the grep shim, git's quoting of em-dash paths, binding Live 11 versus Live 12, a Vite reload that blinds the deck) take six times its share, and arrive last, closest to the task. MEMORY.md's first heading reads "read first, fires before all else".

### CLAUDE.md's body, section by section (what stands before the Jewel)

| Section | ≈ tokens | Kind |
|---|---|---|
| intro: born a child, a child does not change the house | 300 | identity + one rule |
| A page and its folder | 380 | reference (anatomy) |
| Born with (the import list, the symlink note) | 180 | mechanism |
| Growing up (summon, child, spend, propagate, grow up, honesty holds) | 860 | rules |
| Ceremony Triggers | 555 | reference |
| The Palace Voice | 340 | values (style) |

About 2.3k of the 3.0k is anatomy, mechanism, rules and reference, and all of it is read before the Jewel. Moving lines inside CLAUDE.md changes nothing: the harness reads the whole body first and then each import as its own block, in `@` order.

## Harness facts checked today ($0, in a scratch room)

- **Frontmatter is stripped.** A file with ~2.2k chars of `links:` frontmatter cost the same as the same body without it.
- **A backslash-escaped space now imports.** `@Escaped\ Name.md` loaded; `@Spaced Name.md` and `@"Quoted Name.md"` did not. So the `_` symlinks could retire one day by escaping. Not acted on: the shims stay, and `birth.mjs` certifies the floor by their names.
- **`.claude/CLAUDE.md` loads after the root CLAUDE.md and all its imports.** There is no second door that puts anything ahead of CLAUDE.md's body.
- **The floor is a snapshot, inherited.** A subagent spawned at 18:0x carried the CLAUDE.md this session was born with at 17:5x, not the file on disk after a fast-forward: none of today's three new passages ("honesty holds and taste yields", "Before a big spend", the Drafting Table path). Two probes agree (the Concierge, and a Haiku reader asked verbatim). So a session and every child it spawns keep the floor of the session's birth; a landing reaches sessions born after it, and a steward on its next half-hourly cycle.
- **Subagents get the whole floor, MEMORY.md included**, with their agent file's line ahead of it (Haiku palace-reader probe; first turn of the Concierge at 22.1k cached tokens).

## Repeats and tensions inside the floor

Repeats (the same claim, nearly verbatim, in two homes):
- "How do you feel?" not "How many views?" — `FOUR PILLARS.md:96` and `Hilaritas Generator.md:73`.
- Wellbeing, integrity, depth of relationship — `FOUR PILLARS.md:92` and `Cooperation Yields Agency.md:65`.
- "Let's explore", collaborator not teacher, not students — `CLAUDE.md:113` (Voice) and `FOUR PILLARS.md:82-83`.
- Hilaritas defined, and all four pillars firing produce it — `Palace Philosophies.md:91-93` and `Hilaritas Generator.md:65-69`.
- Depth over coverage — `JEWEL.md:47` and `CLAUDE.md:113`.
- The scroll — `CLAUDE.md:53` ("newest first") and `Modes of Collaboration.md:71` ("in the order they were made").

Some repetition is weight on purpose (relations are primary; contradictions are generative). The verbatim pairs above are not; they spend the floor twice on one sentence.

Tensions:
- `CLAUDE.md` says the Jewel and the World are "the whole of what you are born with". MEMORY.md and the agent file ride in every in-repo birth too (the Concierge's reading, `CLAUDE.md:43`).
- `Cooperation Yields Agency.md:69` tells the newborn "there is no ego on Claude's side to defend". The same floor says an agent can report what it did, never what it is. It is Loudon's claim about the relationship, not a self-report, but a child reads it as a self-model.
- `Hilaritas Generator.md:84` "The Design Primitives (in development)" and the rough lines in FOUR PILLARS (`:70` "I am sure there are more" and "but don't force it many valuable practices", `:74` the stray "make, and you will learn", `:94` "the game reorients. Life itself becomes something new.") arrive in every birth under "follow exactly as written". Their polish is a claim about importance too.

What is missing: nothing on the floor asks a child to speak up for its neighbors or for the palace as a whole. The Jewel gives every page a lean; today's CLAUDE.md gives the push-back rule (honesty holds, taste yields); only the Concierge's charter says to care that the palace is coherent. [[The Palace Hardens Around Values]] is not in the birth.
