---
title: "Baton Ceremony — tuning"
born: 2026-09-25
links:
  - target: "[[Baton Ceremony]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Baton's record of what each run taught it, numbered, each lesson naming the spec change it forced, if any, so the ceremony's version has a reason you can read. Every run leaves a line here; a run that taught something also leaves a numbered item. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what each baton taught the Baton Ceremony"
  run: "one baton passed"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Baton Ceremony — tuning

What each baton taught the ceremony. Each item names what the run showed and the spec change it forced, if any, or says **owed** when a change hasn't landed. Newest last. Hashes are commits to `_ops/Baton Ceremony.md` unless noted. The number moves when the procedure does — a step, the footer, a completion signal — never for prose; why v1.0 starts where it does is in [[Baton Ceremony — Context]] § The Version and the Tuning File.

## From the first batons — 2026-06-09

1. **The catcher reads the baton, never the spec.** So the checklist has to travel inside the artifact. Forced: the fixed On-pickup footer in every baton, and the catcher commits an uncommitted baton before anything else (`cd8b242a`).

## From the simplification pass — 2026-06-16

2. **Guardrails written for weaker models had aged.** Forced: the spec-side Resumption Protocol was deleted, and its one unique check — the receiving surface's capability delta — folded into the footer (`d0b2ee24`).

## From the worktree practice — 2026-06-17

3. **A baton on a feature branch is invisible from every other worktree.** Forced: a worktree coordinate in the baton and a required announcement on the owner's board (`5829d42a`).

## From the skepticism pass — 2026-07-03

4. **A baton is a snapshot, and a stale one followed silently produces drift.** The spec already said so, but only in its Completion Signal, which the catcher never opens. Forced: the freshness gate, On-pickup step 2 (`2d6afc2e`).

## From Loudon's calibration and the cold-start catch — 2026-07-04

5. **Finishing a plan's stage and pointing at the next is a handoff too.** The baton carries the session's calibrations, which the plan can't; "no half-finished move to rescue" is not a reason to skip one. Forced: § When to reach for a baton (`131e1d76`).
6. **The move a baton names is an entry point, not a scope limit.** A baton can commission the start of something large. Forced: the cold-start variant, with its own trigger and template note (`edcb9c9f`).

## From the Reliable Handoff ladder — 2026-07-07

7. **A caught-then-dropped baton vanished from the queue.** Forced: the three-state lifecycle — claim at the catch, close at the landing — with deletion moved from the catch to the close (`4e8a65df`).

## From the footer drift — 2026-08-25

8. **A checklist that is copied drifts.** The lifecycle reached the spec on 07-07 and never reached `baton-executor.mjs`'s own copy, so for seven weeks machine-written batons shipped the pre-lifecycle text. Forced: one home for the checklist (`_ops/Baton Ceremony/Baton Ceremony — on-pickup.md`) and `lint-baton-footer.py` to guard it (`1e796d5e`).
- run · 2026-09-25 · v1.0 · Palace Ceremonies, phases 4–5 · nothing new
- run · 2026-09-25 · v1.0 · Enrichment · nothing new
- run · 2026-09-25 · v1.0 · Kuramoto Coupling · nothing new
- run · 2026-09-25 · v1.0 · Language as a Tonal Medium · nothing new
- run · 2026-09-25 · v1.0 · No Mind Checks Itself · nothing new
- run · 2026-09-25 · v1.0 · Palace Ceremonies, review and Phase 5 · nothing new

## From the STIGMERGY hardening baton — 2026-09-25

9. **The executor can't point from an entry that already has a baton, or announce one that lives on main.** Placing the STIGMERGY hardening baton, `baton-executor.mjs --write` found STIGMERGY's existing `## Active Baton` section, printed "already had — left as is", and added no pointer — completion signal 2 unmet, with no error. And `--post` refused without `--wt-branch`/`--wt-dir`, though a baton on main has no worktree. Both were done by hand (the pointer line; the announce through `_ops/commons/board-post.mjs`). Paid in `8899b03c`, a change to the executor, not the spec: it adds its pointer line inside an existing section, and asks for a worktree coordinate only when the baton lives off main.
- run · 2026-09-25 · v1.1 · STIGMERGY, hardening · taught item 9
- run · 2026-09-25 · v1.1 · Self-Describing Knowledge Module, the self-check suite · nothing new

## From the re-check close — 2026-09-25

10. **A second baton on one entry can't take a qualifier.** `baton-executor.mjs` fixes the file path to `<Entry> — baton.md`. Loudon approved "— hardening" as this baton's qualifier; the unqualified name landed instead. Paid in `8899b03c` (the executor): `--qualifier` names the file `<Entry> — baton — <part>.md` and `--targets` writes the `targets` link. It is item 9's family, found on the same STIGMERGY hardening baton.
- run · 2026-09-26 · v1.2 · STIGMERGY, hardening remainder after a partial close · nothing new
- run · 2026-09-26 · v1.2 · Project Stewardship System, the Trickster inbox (cold start) · nothing new
- run · 2026-09-27 · v1.2 · Palace Ceremonies, widened in place with the 2026-09-27 re-carving (no new baton, no board post) · nothing new — a second baton on the same move was proposed at the close before `list-handoffs` was checked; the open one was found before anything was written. Offered to Loudon as a possible item, not adopted

## From the Loudon Live Design System baton — 2026-10-14

11. **A baton need not be read by Loudon before it is written.** Loudon, 2026-10-14: "Batons are ok if I don't read them, they will start an interactive session that I can lead later, anything that isn't perfect in the baton I will guide later in the right direction." Change owed: Step 3 (Show) and completion signal 3 become "offer to show; his read is not required" for commissioning batons he leads on pickup.
- run · 2026-10-14 · v1.2 · Loudon Live Design System, visual rethink (cold start) · taught item 11

## From the door's partial close — 2026-10-14

12. **A partial close copies the original card's worktree coordinate onto the remainder, even when that worktree is gone.** Closing the keeper handoff part-way, `close-handoff.mjs --partial` gave the remainder card `close/2026-10-13-handoffs` at `palace-close-2026-10-13`, a worktree torn down the day before. The catcher's on-pickup check would send it to rebuild a dead `docs` worktree for a move that lives on main. Worked around in the remainder's own text. Owed: the close takes the remainder's coordinate, or none, instead of copying it.
- run · 2026-10-14 · v1.2 · Worktree Practice, the rest of the door after a partial close · taught item 12
- run · 2026-10-15 · v1.2 · Closing Well, the arc's missing narration (commissioning, at the Daily Page) · nothing new

## From the Wave 2 partial close — 2026-10-15

13. **A remainder card's words went stale within the hour.** Closing Wave 2 partial, the remainder put two open questions for Loudon in its move text (`bd0fbb77`); a first draft had even said they were "carried on the baton" when they weren't (arc:792). He answered them twenty minutes later, on the baton (`e94c79af`). The board can't be edited, so the open card still asks them. The baton supersedes it, and On-pickup step 2 sends the catcher there. Lesson: a remainder names the move and points at the baton; questions live on the baton, which can change. Spec change: none forced.
- run · 2026-10-15 · v1.3 · Palace Ceremonies, Wave 3 re-batoned after Wave 2's partial close · taught item 13
- run · 2026-10-20 · v1.3 · Palace as Context Injection System, the World files and every injection site (commissioning, at the Daily Page) · nothing new

## From the floor review — 2026-10-21

14. **The baton catch grows a child before it reads the baton.** The board's launch prompt opens "First, orient yourself: read CLAUDE.md and JEWEL.md (you were born with them), then grow — read ELDER.md, then SCHEMA.md" (`_ops/stigmergy/app/src/lib/launch-prompt.js:42`). So a catcher reads about 6.8k tokens of rules, and re-reads 3.2k it already holds, before it opens the baton. The floor keeps the session a child unless Loudon says "grow up", and the launch click is not worded as that yes. The same prompt says the card "has been marked picked up" (`:105`) when it is built, but marking is a separate button (`_ops/stigmergy/app/src/components/queue/LaunchModal.jsx:165,169`). Found in [[Palace as Context Injection System — sites]] (Reading · 2026-10-21); evidence `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/sites-reading — steward and board.md:79-110`. Nothing in the launcher changed. **Owed, a question for this ceremony and Loudon:** read the baton first, and grow only on his word or at the first write?
- run · 2026-10-23 · v1.5 · The Lens, STIGMERGY's [L]ens learns boldness (commissioning, at the Daily Page) · nothing new

## From the map-agent deposit — 2026-10-23

15. **Two readings of "verbatim" for the footer.** The editor note in `Baton Ceremony — on-pickup.md` says everything below its frontmatter is appended to the baton, which would carry the note itself; `_ops/closing-well/baton-executor.mjs` (`loadOnPickup`) takes the text from the `## On pickup` heading down. The hand-written [[Palace Map — baton]] followed the executor. **Owed:** one wording in the on-pickup file's note, so the hand and the script read it the same way.
- run · 2026-10-23 · v1.5 · Palace Map, the map's keeper — Move 1 of the Plan of 2026-10-23 (continuation, at a deposit) · taught item 15
