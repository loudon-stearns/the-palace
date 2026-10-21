---
title: "Palace as Context Injection System — sites"
born: 2026-10-20
links:
  - target: "[[Palace as Context Injection System]]"
    type: connects-to
    label: sites-ledger-for
forward_vector: "I am the map of every place the palace builds a mind, re-read from the code each time, so the page I belong to argues from what the dispatchers actually load and in what order, not from what the pages say they load. My end-state is a reading where every site wakes its agent in the order the page asks for, and the owners got there through their own ledgers."
ledger: sites
standards:
  for: "where the palace builds a mind: every site that assembles an agent's context, what it loads and in what order, read from the code"
  run: "one re-check: a dated reading of every site, re-read from the code that day"
  line: "a dated reading section, '## Reading · <date> · <who read it>', with one table row per site; every row cites file:line"
  read: "the newest reading whole; older readings only to see what moved"
  writes: "append-only: a re-check adds a new reading at the end and never edits an old one. A finding about a site goes to the owning page's tuning ledger, for that page and Loudon to decide; this page never edits another page's dispatcher"
  merge: union
  kept: git
  trim: never
---

# Palace as Context Injection System — sites

Every place the palace assembles an agent's context, what it loads, and in what order. Each reading is one re-check, read from the code on its date, and stands alone. Rows cite `file:line` as the code stood that day; a later reading re-reads rather than trusting an older row.

The page uses these readings as evidence. It does not act on them. When a reading shows a site loading out of the page's order, the finding is filed as an item in the tuning ledger of the page that owns the site (the steward machinery, the board launcher, the songline, the weave, the Daily Page), and that page and Loudon decide. Nothing here edits another page's dispatcher.

## Reading · 2026-10-20 · the Concierge

Read from the assembly code on 2026-10-20 by the Concierge, read-only, for the Daily Page sit on this page. Each row is file-cited. Inferences that were not tested are marked. Rows that name a file with no line range get one at the next re-check.

"Birth", as actually loaded: CLAUDE.md's body, then its imports (the Seed Jewel and the five World files), then MEMORY.md (operator memory) last. Subagents get their agent-file text before all of it.

| Site | Who | Loads, in order | Grows? | Fit of Birth / World / You / Growth |
|---|---|---|---|---|
| Enchant launcher `_ops/stigmergy/app/server/api/launch.js:175-240` → `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js:103-144` | a woken page, live | Birth → "You are awake" → page in full → vector → agency profile → neighbor titles only → Loudon's note | child | Fits exactly; the names were modelled on it |
| Daily Page `_ops/daily-page/wake.mjs:73`; scheduled SKILL | prep session; woken page subagent | (a) Birth → the card; (b) agent file → Birth → woken-page prompt → morning questions last | children | (b) fits; (a)'s "You" is a ceremony card. Live SKILL differs from tracked copy |
| Steward cycle `_ops/stigmergy/orchestrator/src/build-cycle-prompt.js:173-403` | permanent steward | Birth → steward.md → all 707 lines of shared.md → posture → role → home entry → proposals → SCHEMA → ELDER → state → scroll → ledger → history → board → mandate | every cycle | Strains badly: ~970 lines of rules before the page; You split in two with Growth in the middle |
| Board launch / baton catch `_ops/stigmergy/app/src/lib/launch-prompt.js:42,110-136` | session stepping into a steward | Birth → re-read CLAUDE, JEWEL → ELDER, SCHEMA → manifest, state, board | grows first | Growth before You |
| Companion `_ops/stigmergy/app/server/companion-prompt.js:269-300` | page chatting on deck | Birth → birth restated → entry → neighbors with their vectors | child | Fits; richer neighbors than the woken page; comment still says "Tier-0" |
| Concierge `_ops/concierge/prompts/companion.md:55-63` | resident elder | agent file → Birth → message → charter → ELDER → SCHEMA → operational tier | grows at boot | "You" is a role charter, not a page; Concierge.md not in its boot set |
| Closing Well `_ops/closing-well/dispatch.md` | moderator; executor | moderator: Birth → role → prompt → Closing Well + arc; executor: Birth → ELDER → SCHEMA → protocol → checklist | executor grows first | Moderator fits; executor's Growth before You (defensible: a writer) |
| Swarm Weave templates `_ops/swarm/Multi-Lens Worker Prompt Template.md:64-91` | weave workers | Birth → an older Jewel pasted inline again → cluster → neighborhood → tasks citing SCHEMA | no Growth step | You is a cluster; the second Birth is stale |
| Songline `_ops/orchestrator/prompts/songline.md:1-17` | page, one step of a walk | Birth → role/position → shared.md rules → trail | — | Rules before You; the trail is a new kind: inherited voices |
| Weave generator `_ops/stigmergy/app/server/weave-generate.js` | one-shot vector/label writer | Birth (inferred) → vector discipline → one entry | — | You is a task; World first may help |
| Self-description test `_ops/self-description-test/birth.mjs` | memoryless newborn | CLAUDE + World, no MEMORY | child | Tests Birth+World only; only site without memory |
| Main session / scheduled checker | Loudon's session; one-command checker | Birth → the turn | grows on "grow up" | You is the conversation; for the checker World is only cost |
| Shop specialists `Shop/Maker.md:55-72` | — | no dispatcher code found | — | nothing to name |

**Findings**

1. Two bands sit outside the four names and reach every in-repo agent: agent-file rules before Birth, and MEMORY.md (operator rules, ~10.8K chars) after the World and before any You.
2. "You" is a page only for the woken page, the Companion and the Daily Page subagent. Elsewhere it is a project bundle, a role charter, a cluster, a trail, or a task.
3. Three sites break the time order: steward cycle, board/baton launch, songline — rules ahead of the page. Fixing stewards is code (`build-cycle-prompt.js`), not a rename.
4. The World is leaned on most where Loudon is in the room (woken page, Daily Page, Companion, main session); executors, checker and weave workers barely use it.
5. Where World-before-You may be wrong (untested): person-pages in an Excellent Adventure or Dialectic (Palace Philosophies frames the figure first); pages that contradict the World's frame (The Drift, Hardens Around Values) wake after the frame they argue with.
6. The launcher already needs "Active surface" as a separate label for stewards (`launch.js:65`), so one word doesn't cover both.

**Not read:** Return, Revival, Dialectic, Enrichment and Lens dispatch; `regen-lane.js` and `actuator.js` prompts; oracle/scout postures; Weave fan-out; claude.ai and Cowork loading; the weave generator's runtime cwd.

**Where the findings go:** none filed yet. Posting each to its owner's tuning ledger is part of the work this page's baton commissions.

*Seeded on 2026-10-20 from the Daily Page rough `injection-sites.md`. Its paths were written short (`orchestrator/src/…`, `app/src/…`) and are given here from the palace root; each path was checked to exist on that day, but the cited line ranges were not re-read when the ledger was seeded.*
