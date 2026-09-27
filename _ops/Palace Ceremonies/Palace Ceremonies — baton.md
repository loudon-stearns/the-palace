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
Let any page that makes repeated runs earn a tuning ledger and a scroll, so it iterates run by run, collects its gotchas and bugs, and rolls them into its next version. Then decide what "ceremony" means once a ledger no longer marks one.

*Widened in place 2026-09-27, after a second conversation (which did step 2 below in talk, without catching this baton) re-carved what each bundle file is for once any page can hold a ledger. The 2026-09-26 sections are kept as written. What 2026-09-27 added is in § The 2026-09-27 re-carving; where the two days disagree is in § Where the 2026-09-26 and 2026-09-27 considerations pull apart. Read both before you trust the move sentence above: it and the board card's one-liner are the 2026-09-26 wording. The widened move: let any page that runs earn a ledger and a scroll, **settle with Loudon what each bundle file is for once it can**, then decide what "ceremony" means, and land it.*

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

## Current state
Nothing built. What's known:
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
Loudon asked that these stay visible, not smoothed over. Each is a disagreement to settle with him, not one already settled.

1. **The pair.** 2026-09-26 treats "a tuning ledger and a scroll" as one thing a page earns together. 2026-09-27 gives the two different jobs and splits the old Plan-and-Orders zone between them: Plan to the scroll, Standing Orders to the ledger. Canon today already splits them by whether a ledger exists (`The Scroll.md:63-67` against `133-136`). If that holds, "earn a ledger and a scroll" is two decisions, not one, and the move sentence is the wrong shape.
2. **The rich face.** 2026-09-26 says nothing about it. 2026-09-27 does **not** take outputs off the scroll — the making trail still holds every one, so the faces test case and canon's "a project's proofs and media" on the scroll (`CLAUDE.md:53`; `The Scroll.md:68-71`) survive. What 2026-09-27 adds is a curated showcase on the rich face, and *that* runs against canon's rich face: "laid beside the words, section by section" (`CLAUDE.md:53`), a heading-keyed manifest fingerprinted to prose (§8 `rich` row). A capability showcase isn't keyed to prose headings. One of those texts changes. *(Corrected 2026-09-27 from an earlier widening that read the re-carving as moving outputs off the scroll.)*
3. **What the scroll's Now shows.** 2026-09-26 step 2 asks what Now shows for a page that isn't a ceremony. 2026-09-27 kept Now as pure live status and did not answer it; still open.
4. **Whether a scroll is earned at all.** *(Found in canon by the first widening, not raised in either conversation.)* Any entry may already carry a scroll (`SCHEMA — Reference.md:290`; `The Scroll.md:140`); only the ledger is gated. 2026-09-26 speaks of earning both; 2026-09-27 doesn't say.

## Next move
1. Survey where runs happen across the palace and how each records them now.
2. Bring Loudon definitions, with no carve-out for any one area: a **run**; when a page has **earned** a ledger and a scroll; what the scroll's Now shows for a page that isn't a ceremony; and what **ceremony** means next (named in the tables? writes to the house with Loudon? something else?). Added 2026-09-27: the re-carving above and its six open questions; walk it through the Generative Sample Libraries example again, which is what made it concrete. Bring the four disagreements above as disagreements.
3. Settle them with him.
4. Land them through a Schema Ceremony: Palace Ceremonies, SCHEMA — Reference §6 and §8, and the code (the scroll, the deck grouping, the Standing Orders seam). Added 2026-09-27: `CLAUDE.md` § A page and its folder too, which says the ledger is "kept only by ceremonies" and gives the scroll the proofs and media (`CLAUDE.md:53,55`); `The Scroll.md`; `_ops/Substrate Skill.md`.
5. Pilot on one page that isn't a ceremony. The Hero and Avatar Maker is ready-made; Generative Sample Libraries is the worked case.

## Calibrations from this session
- Loudon: "We must not get myopic around the shop and adding a specific carve out for it."
- Loudon: "Any page can have a tuning ledger and a scroll when it earns it."
- Loudon: "Consider if we need a different way to define ceremony."
- This needs a thoughtful session, not the pace of a cleanup day.
- Loudon (09-27): leave room for individuation — every page can grow these files; the structure is defined or strongly recommended; the entry sets its own specifics.
- Loudon (09-27): batons in a bundle are "basically a strong to-do within a bundle," about the entry or about its outputs.
- Loudon (09-27): "This needs careful discussion to implement and integrate into the palace" — a baton, not a deposit.

## Load these files first
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
