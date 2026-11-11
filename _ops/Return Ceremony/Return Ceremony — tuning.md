---
title: "Return Ceremony — tuning"
born: 2026-09-25
links:
  - target: "[[Return Ceremony]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Return's record of what each run taught it, numbered, each lesson naming the spec change it forced, if any, so the ceremony's version has a reason you can read. Every run leaves a line here; a run that taught something also leaves a numbered item. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what each return taught the Return Ceremony"
  run: "one return"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Return Ceremony — tuning

What each return taught the ceremony, and the lessons that reached it from elsewhere. Each item names what the run showed and the spec change it forced, if any, or says **owed** when a change hasn't landed. Newest last. Hashes are commits to `_ops/Return Ceremony.md` unless noted.

**v1.0 (2026-09-25)** is the card as it stood that day, plus the opening read in Step 0. It marks where counting starts, not a ranking of what came before. The number moves when the procedure does — a step, a probe in the query block, a postcondition — never for prose. A return leaves no report file, so its record is its `return(YYYY-MM-DD)` commit, whose body names the version and what the run taught.

## From the first return — 2026-08-25

1. **An assessment written before any query was wrong five times.** A dangling-link count off by 4×, a "breakthrough drought" that was a typing artifact, a proposal to build machinery that already existed, a deferred list holding something built six weeks earlier, a floor analysis already on record. One command corrected each, and the handoff board went unread for three exchanges. Forced: "the record answers, you do not" — the query block runs before any interpretation, postconditions 1–2 (`4a402512`).
2. **A gap was read as a verdict.** Seven quiet weeks became a theory that upkeep had outgrown its payoff; the reason was elsewhere, and Loudon corrected it in a sentence. Forced: "a gap is not a finding" — report the length, never the cause; postcondition 5 (`ad86efc0`, reworded in `4a402512`).
3. **Choosing among batons in the main window skews the choice.** Opening every baton burns the window you came back to work in and favours whichever one reads as most urgent. Forced: Step 0, the Return is a companion job, and the Concierge's scout posture drafts the map (`4a402512`; the scout built in `fc0b9800`).
4. **The query block wanted to be one command.** Forced: `_ops/concierge/return-map.mjs` runs the whole block; the card keeps the list as the readable spec and the by-hand fallback (`fc0b9800`).

## From the floor's purpose deposit — 2026-09-03

5. **The companion is summoned at the open, not at the return.** By the time "I'm back" is said it should already exist. Forced: Step 0 resumes the resident and summons only when the surface couldn't at open (`3fd7ee0d`).

## From a read of the tools — 2026-09-22

6. **A Cowork commit handoff is invisible to the block.** Neither the card, `return-map.mjs`, nor `list-handoffs.mjs` knows `cowork-git`, so a return can report "nothing open" while one waits in `node _ops/cowork-git/handoff.mjs show`. Named in Open Questions and held (`ec7595ce`). No spec change.

## From the return of 2026-09-25 — ten hours, the first run under the scout

7. **The Cowork probe had to be run by hand.** Item 6's blind spot is still open: the scout ran `node _ops/cowork-git/handoff.mjs show` beside the script and found nothing waiting. Nothing hid this time; the cost is a manual probe on every return. Spec change, paid in item 16: the probe joins the query block and `return-map.mjs`. Paid by item 16, without that change.
8. **The card and the script have drifted apart.** The query block lists "open phases in the surviving production plans" with no command, and `return-map.mjs` doesn't run it. The scout checked by hand and found Closing Well Phase 6 with no board line. This is the drift the card's Open Questions feared. Paid by retirement in v1.6 (d810736d) on 2026-11-03, in the ledger review: production plans are gone as a form and plans live on scrolls, so the probe line left the card, as items 6 and 7 left with Cowork.
9. **Other agents' live work is invisible to the block.** A second Claude session was working on main, and another session's uncommitted 2D Torus work sat untracked with no board post. The scout found both only by reading the last lines of each session transcript under `~/.claude/projects/` — working directory, branch, last tool calls — not by modification times alone. `git status` shows the files, not whose they are, and the one move must not collide with them. Spec change, paid in item 12: a probe for who else is in the house, in the card and the script — and since it reads other sessions' transcripts, Loudon's okay before it becomes a standing probe.
10. **Postcondition 6's subject isn't a kind the commit spec knows.** No return had ever committed until this one, so nobody had seen it: `return` is missing from `KNOWN_KINDS` (`_ops/stigmergy/app/src/lib/commit-parse.js:23`), and the commit-msg hook marks every return commit out-of-band, putting its annotation after the run's own trailers. Spec change, paid in item 12: `return` joins `KIND_ALIASES` as `ops`, the way `baton` maps to `handoff`, or the card's subject changes.
- run · 2026-09-25 · v1.0 · ten hours · taught items 7–10

## From the return of 2026-09-25 — evening, via the scout

11. **The Return ran through the scout and nobody read the card.** Loudon opened with "we are back in the palace"; the working Claude routed to the scout, which runs the query block but is read-only, so the run left no ledger line and no `return(…)` commit. The scout re-ran owed probes 7–9 by hand: nothing waiting in Cowork; open plan phases in Closing Well, The Palace Speaks and BLUELINE; a live peer found only through transcripts. Paid in v1.6 (d810736d) on 2026-11-03, in the ledger review: Step 2 and the scout prompt say the map ends by naming what the Return owes at its close.
- run · 2026-09-25 · v1.0 · evening, via the scout · taught item 11

## From the door — 2026-10-14

12. **Items 9 and 10 are paid.** The door's work built the probe item 9 asked for: `trunk-state.mjs` names the session that wrote each unsaved file in the main checkout, from the Write and Edit calls in the session transcripts (Loudon allowed the read, 2026-10-14), so the block no longer reads transcript tails by hand. And `return` joined the commit spec's known kinds (`48c923ad`), so a return commit is no longer annotated out of band. Forced (v1.2): the query block runs `trunk-state.mjs`, `return-map.mjs` carries it as a probe, and the map opens with the trunk's state.

## From the roll call — 2026-10-18

13. **Open sessions were invisible to the block.** Item 12 named the writer of each unsaved file, but not the sessions still open with work or a question; on 2026-10-18 about 270 were open, and a scratch census archived 259. `session-roll-call.mjs` reads every open desktop session from the app's records and transcripts without waking one, and `trunk-state.mjs --sessions` prints it beside the trunk (`bcd3bf42`). The read is wider than item 12's: the tail of every open session's transcript, Loudon's last words and Claude's among it, in every project. Loudon allowed it on 2026-10-18: "Yes: the Return may read every open session's transcript tail on each return, in every project." Forced (v1.3): the query block's trunk line runs `--sessions`, and so does `return-map.mjs`'s trunk probe; the map's In flight counts a session waiting on Loudon as blocked on a decision.

## From the arc fix — 2026-10-18

14. **The card and the script read `--since` differently: item 8's drift, seen again.** The trunk probe looked back only trunk-state's own 24 hours while the card gave it the whole gap (`584a51f7`). The arc handed `--since` to git as typed: `72h` read as 1972, `3d` as the 3rd of the month, `"3 days ago"` split in the shell, and a bare date started at this time of day, dropping that morning (`45e7fd0f`). Forced: the map works out one start and gives both blocks that instant, a date read as that day's midnight, and the card's arc line says the same for the reader typing by hand. No version move: the probes, steps and postconditions are the ones v1.3 names. Item 8's own probe, the production plans, still waits.

## From the roll call trigger — 2026-10-19

15. **Loudon was lost among many open sessions with no gap to return from.** Item 13 put every open session in the Return's map, but only a return ran it. A roll call is the Return pointed at now: it reads every open session from files, wakes none, and hands him one page. Loudon said yes to the wording on 2026-10-19. Forced (v1.4): the trigger "roll call" and the § Roll call section, and a row in CLAUDE.md's trigger table. No return run forced this.

## From the Cowork retirement — 2026-10-20

16. **Items 6 and 7 are paid by retirement, not by a probe.** Loudon said yes on 2026-10-18 to retiring the Cowork commit pieces, and the commit hand-off queue went with them (`8c72090c`), so the blind spot items 6 and 7 named has nothing behind it, and the card's open question on it is gone. No version move: the query block and `return-map.mjs` never carried the probe. No return run forced this.

## From the return of 2026-10-24 — 28 hours, via the scout

17. **The trunk names a writer only when a session's transcript wrote the file.** `trunk-state.mjs` found the writer of one of six unsaved places, a steward cycle's `Generative Preset Development/vital/`, from its session's Write calls (item 12). It could not name who wrote the VST Template steward's registration in `_ops/agents/permanent/REGISTRY.json`, the dealer's line in `visits.jsonl`, the morning's map files, or Blood Compressor's build outputs: it found no Write or Edit call for any of them, which is what a file made by a script, a server or a shell looks like to it. The map gave timestamps beside the nearest commits and marked every such writer unproven. No spec change forced. The baton probe worked as written: it caught our own [[Palace Map — baton]], placed on main with no board line.
- run · 2026-10-24 · v1.5 · 28 hours, via the scout · taught item 17

## From the review notes — 2026-11-07

18. **Loudon's open review notes joined the query block.** His notes on a page — a rich face's dock notes and his answers to a rough, sent through the answers server ([[Review Layer]] § How the answers come back) — wait on the board until someone grants or denies them, and nothing that starts work looked. `return-map.mjs` gained the probe in `649693cb`. The card's list did not have it, which is the drift the card's open question names. Loudon, 2026-11-07: "Yes, add it". Forced: **v1.7**, the query block runs `node _ops/loudon-eval/read-answers.mjs --open`, and the In-flight bullet names Loudon's open review notes.
- correction · 2026-11-07 · the dated note under the card's open question on its command list and `return-map.mjs` said "for now the script is the one to trust when they disagree" (`266b7455`), which leaned on a question Loudon has not ruled on. The note now records only that the script led and the card followed; which one to trust stays open.

## From the return of 2026-11-07 — 15 days, one project's session, via the scout

19. **The card doesn't say how to scope the map when the session belongs to one project.** Loudon returned to a session about the Haptic Handwheel, last active 2026-10-23. `return-map.mjs --since 2026-10-23` printed 1,882 lines: 1,286 commits in the arc, nine of them touching the project's folder or page (`git log --since=2026-10-23T00:00:00-04:00 -- "Projects/Haptic Handwheel" "Projects/Haptic Handwheel.md"`), and the script takes no project to cut by. The card's four sections are palace-wide. The map was scoped by hand: the project and the Shop's CAD route in front, the rest of the palace held to what bites (blocked on Loudon, unsent commits, stranded worktrees, unsaved work, open handoffs). That scoping came from the dispatching messages, not from the card, so a scout sent into the next one-project session without them has no rule to follow. One run is one data point. Spec change owed, on Loudon's yes: Step 2 names what a Return into a one-project session puts in front (the project's folder history, its scroll's Now, its tuning ledger, the board lines that name it, and the work beside it) and holds the rest to what bites. Whether `return-map.mjs` should take a project stays open until a second such run shows what it would save.
- run · 2026-11-07 · v1.7 · 15 days, one project's session, via the scout · taught item 19
- correction · 2026-11-08 · item 19 said a scout sent into a one-project session "has no rule to follow", but the scout's prompt already takes a scoped request (`_ops/concierge/prompts/scout.md:19-22`). What is missing is narrower: neither this card nor `return-map.mjs` (flags `--json` and `--since` only) says what a scoped Return puts in front. Loudon, 2026-11-07, hearing the item: "you make a good point about the ceremony narrowing its map". He gave no word on the change, so item 19 stays owed.

## From the return of 2026-11-09 — six days, one project's session, via the scout; signed 2026-11-11

20. **An answer Loudon has given that no one has picked up is invisible to the block.** The Synth Templates steward asked which synth to prove the house bass on first (`_ops/swarm/persistent/blackboard.jsonl:1384`, 2026-11-05); Loudon granted WAVETABLE-FIRST at 2026-11-10 01:54Z (`:1515`), an hour before the block ran. The block's unanswered-requests probe rightly dropped the ask, and nothing else in the block shows an answer waiting to be consumed, while the project's scroll, its Now regenerated 2026-11-05, still read "1 open ask". The grant was found by reading the board by hand for the project's name. Two days later it was still unconsumed. Owed, on Loudon's yes: a probe for answers given and not yet consumed, beside the one for asks unanswered.
21. **The card says nothing about a signature that comes on a later day.** The map was drawn on 2026-11-09 and signed on 2026-11-11. On the working session's word the run re-ran the cheap probes for the project before committing: its section held (no new steward cycle, no new board line, the grant unconsumed), while the trunk moved from 11 to 100 commits ahead of origin and from 75 to 243 unsaved paths. A return commit written from a two-day-old map would have carried the older trunk as the present. Owed, on Loudon's yes: a line on the card that a map signed on a later day has its scoped probes re-run, and the commit says what moved.
- seen again · 2026-11-09 · item 19: with no scoping rule on the card, the working session asked for the project's section first and the palace after, under about 500 words; the map was signed as drawn, no adjustments.
- run · 2026-11-09 · v1.7 · six days, one project's session, via the scout, signed 2026-11-11 · taught items 20 and 21
