---
title: "Weave Ceremony — sketch — 2026-10-22 flags and their order"
born: 2026-10-22
links:
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: "sketch-for"
forward_vector: "I am a reader's note for whichever day the Weave next runs: the ten flags the fan-out of 2026-10-20/21 left on the board, where each one lands, which of them touch the same pages, and in what order they are kind to each other. I go to Archive when the Weave has carried them."
---

# The ten flags of 2026-10-21, and how they meet

Written at the close of the fan-out (session 51b56b1e), 2026-10-22, for the Weave that is pushed off "for a bit" (Loudon, 2026-10-22), so it is written for whichever day he calls it. All ten sit on the persistent board `_ops/swarm/persistent/blackboard.jsonl` (the `WEAVE` lines, 941 to 978). `python3 _ops/swarm/lint-weave-flags.py` on 2026-10-22 reads 20 open across the whole board; this note covers only these ten. Each flag's full text, check and pattern are on its line; the table says where it lands and what the lint finds today.

## The ten

Ids are `commons-the-palace-<number>`.

| number | board line | posted by | home | what it asks | the lint today |
|---|---|---|---|---|---|
| 1792555522227 | 941 | Surfaces and Capabilities | Surfaces and Capabilities | Cowork is no longer a palace working surface; rewrite or drop each live mention | 52 pages match |
| 1792557681212 | 943 | STIGMERGY | `_ops/rich-face/README.md` § Media a face plays | a rich face plays only what git tracks; migrate faces one at a time with `untracked.mjs` | a reader's check, no pattern |
| 1792586388505 | 953 | TRICKSTER | Drafting Table Design System | three dresses, one rule: restate the single-dress and "only BBS" lines | 3 pages: Loudon Live Design System, Shop/Maker, Substrate Skill |
| 1792590978864 | 962 | Frequency-Time Duality | Frequency-Time Explorer (composting confirmation) | confirm deletion of the Explorer and its bundle; three records keep links that go ghost | a touched-unverified read |
| 1792591300654 | 965 | Project Stewardship System | Baton Ceremony | step 8 of the On-pickup fragment: steward batons are updated in place, never deleted or closed | 12 pages match (the fragment and eleven batons) |
| 1792592355793 | 968 | Revival Ceremony | Revival Ceremony and Spore Check Ceremony | eleven places restate the old rites; point each at the rite | a reader's check, no pattern |
| 1792594046155 | 969 | Review Layer | Review Layer | a UI inside a host keeps its review surface on its browser mock; add the case to each restatement | a reader's check, no pattern |
| 1792599100260 | 971 | The Scroll | The Scroll | nine scrolls lack the Plan zone; run `scroll.js --home "<Entry>"` on each | a reader's check, no pattern |
| 1792620051921 | 975 | CLAUDE | CLAUDE.md § Growing up (now CHILD.md's, see below) | the Concierge summon is every session, a one-line question included | 2 pages: Concierge, Return Ceremony |
| 1792632778488 | 978 | CHILD | CHILD | four sections moved from CLAUDE.md to CHILD.md; fix each citation | 5 pages |

## Where they overlap

**The On-pickup fragment and the live batons: one commit.** The Cowork flag (1792555522227) proposes changing "the On-pickup fragment and every live baton in one commit"; the steward-baton flag (1792591300654) edits the same fragment's step 8 and every baton's copy. `lint-baton-footer.py` rule E2 fails any baton whose footer differs from `_ops/Baton Ceremony/Baton Ceremony — on-pickup.md`, so the two flags cannot be carried in separate commits without a red lint between them. They are one job. The steward-baton flag counted nine live batons on 2026-10-21. Its pattern matches twelve pages on 2026-10-22: the fragment and eleven batons, one of them `Dissolutions/Dissolutions — baton.md`, which this close placed (a362a67c). Recount before the commit; do not trust the nine.

**The Concierge entry and the Return card: the summon rule only.** The summon flag (1792620051921) names three lines, all still as flagged: `Palace development/Concierge.md:54` ("summoned at the top of the session by default"), `:60` ("at the beginning of any palace discussion"), and `_ops/Return Ceremony.md:81` ("at the open of any palace discussion"). The close's checklist said Cowork and the old rites also touch these two pages. I could not confirm that: `git grep -i cowork` finds nothing in the live text of either page (the Return Ceremony's scroll and tuning ledger mention it as history, which the Cowork flag leaves alone), and the old-rites flag's eleven places do not include them. Treat the two pages as the summon flag's work alone unless the Weave's own read finds more.

**The Maker page: three flags.** `Shop/Maker.md` is named by the Drafting Table flag (1792586388505), which matches its two "only BBS" lines at `:163` ("currently only [[BBS Design System]] for STIGMERGY") and `:184` ("Stigmergy is the only currently-recognized override context"), and by the Review Layer flag (1792594046155), whose home passage is `§ Interactive deliverables ship reviewable, first` at `:157`. The Cowork flag also reaches it: a live "sandbox (Cowork Linux arm64, no sudo)" host row at `:232`. The dated log entries at `:296`, `:317` and `:319` mention Cowork too, and those are history, which the flag says to leave. One pass over the page can carry all three.

**Two homes that now read as CHILD.md's.** The CHILD flag (1792632778488) records that CLAUDE.md's four working sections moved to CHILD.md (1326e83e). Two older flags still name the old place: the summon flag's home is "CLAUDE.md § Growing up", and the Drafting Table flag proposes "CLAUDE.md's two-manifest wording". The design-manifest sentence now lives at `CHILD.md:35`, inside § Growing up. Flags are append-only board lines and are not edited; read both homes as CHILD.md's, and cite CHILD.md § Growing up in the carrying commits.

## Order and timing

- **The old-rites pages wait for the Daily Page session.** The old-rites flag (1792592355793) puts The Daily Page and `_ops/daily-page/deal.py` in its eleven places, and the Drafting Table flag names The Daily Page too. The room's account at the close was that a Daily Page session is in flight; I could not see it (no worktree for it shows in `git worktree list` on 2026-10-22). Carry the rest of the old-rites flag first and those two after that session lands, so the Weave does not edit a page someone is rewriting.
- **Steward prompts at a quiet moment, with the fixture.** The same flag reaches `_ops/orchestrator/prompts/steward.md`, `_ops/orchestrator/permanent.md` and its smoke fixture `_ops/stigmergy/orchestrator/tests/fixtures/permanent-smoke` (run by `_ops/stigmergy/orchestrator/scripts/smoke-permanent.js`). A steward reads these every cycle, so edit them while `curl -s localhost:5173/api/stewards` shows `worker.running: false`, and move the fixture with them.
- **Walk That Weaves: ask Loudon first.** The old-rites flag says so in its own proposed action.
- **The Scroll flag's sweep runs when no steward cycle runs**, its own proposed action says, and commits the nine through the committer in one commit.

## Questions that stay separate

- **Six projects with no scroll.** The Scroll flag (1792599100260) says `scroll.js --all` "also lists six projects with no scroll" and tells the Weave to use `--home` on the nine, not `--all`. Whether those six should get scrolls is a different question from the nine's missing Plan zone, and it is Loudon's.
- **The Explorer's deletion** (1792590978864) is a deleting call: three records keep wikilinks to it that go ghost (the 2026-10-13 Daily Page record, The Daily Page — Context, the Palace To-Do archive). The flag leaves that to the Weave and records Loudon's word of 2026-10-21, "let the next Weave confirm the Explorer's deletion."

## What I could not pin down

- **The sender defect.** The close's checklist names "the TRICKSTER-sender defect on two flags". Among these ten I find one posted as `from: TRICKSTER`: 1792586388505 (line 953), a design decision of the Drafting Table page filed under the human node's name. I could not identify a second, nor what the defect is beyond that the Commons writer stamps `health.model: claude-code` on a TRICKSTER line (`_ops/commons/board.py:97`). The older TRICKSTER flags at lines 901 to 907 are of 2026-10-18 and are not in this ten. Read the `from` column of `lint-weave-flags.py` and decide there.
- **Whether the rich-face migration has begun.** I did not run `untracked.mjs` on any face; the rich-face flag's check is Loudon's to read.

## The date the Weave was set for

`Worktree Practice/Worktree Practice — spec — the door.md:58` still ends "set for 2026-10-22, on his word of 2026-10-21". The Weave is pushed off, so that line is stale. It is named here and not changed; one line on a later yes. The owed line that would carry the date, a one-shot order in `Weave Ceremony — tuning.md` (offered after 9b6d22f1, unanswered), is not written either: the ledger's last order is of 2026-10-18, and Loudon has not asked for one.
