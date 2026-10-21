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

7. **The Cowork probe had to be run by hand.** Item 6's blind spot is still open: the scout ran `node _ops/cowork-git/handoff.mjs show` beside the script and found nothing waiting. Nothing hid this time; the cost is a manual probe on every return. Spec change owed: the probe joins the query block and `return-map.mjs`. Paid by item 16, without that change.
8. **The card and the script have drifted apart.** The query block lists "open phases in the surviving production plans" with no command, and `return-map.mjs` doesn't run it. The scout checked by hand and found Closing Well Phase 6 with no board line. This is the drift the card's Open Questions feared. Spec change owed: give the probe a command, in the card and the script.
9. **Other agents' live work is invisible to the block.** A second Claude session was working on main, and another session's uncommitted 2D Torus work sat untracked with no board post. The scout found both only by reading the last lines of each session transcript under `~/.claude/projects/` — working directory, branch, last tool calls — not by modification times alone. `git status` shows the files, not whose they are, and the one move must not collide with them. Spec change owed: a probe for who else is in the house, in the card and the script — and since it reads other sessions' transcripts, Loudon's okay before it becomes a standing probe.
10. **Postcondition 6's subject isn't a kind the commit spec knows.** No return had ever committed until this one, so nobody had seen it: `return` is missing from `KNOWN_KINDS` (`_ops/stigmergy/app/src/lib/commit-parse.js:23`), and the commit-msg hook marks every return commit out-of-band, putting its annotation after the run's own trailers. Spec change owed: `return` joins `KIND_ALIASES` as `ops`, the way `baton` maps to `handoff`, or the card's subject changes.
- run · 2026-09-25 · v1.0 · ten hours · taught items 7–10

## From the return of 2026-09-25 — evening, via the scout

11. **The Return ran through the scout and nobody read the card.** Loudon opened with "we are back in the palace"; the working Claude routed to the scout, which runs the query block but is read-only, so the run left no ledger line and no `return(…)` commit. The scout re-ran owed probes 7–9 by hand: nothing waiting in Cowork; open plan phases in Closing Well, The Palace Speaks and BLUELINE; a live peer found only through transcripts. Spec change owed: when the survey is a Return, the scout's map ends by telling the parent what the Return owes at its close.
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
