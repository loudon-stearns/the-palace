# daily-page — the Daily Page's machinery

The practice itself is a page: **[[The Daily Page]]**, `_ops/The Daily Page.md`. This folder holds what runs it.

**If a scheduled task sent you here to follow this file:** the practice moved. Read `_ops/The Daily Page.md` in the main checkout, do its "Before Loudon arrives" part, and stop at that part's last step: greet Loudon as its last step says, and wait. The trial's `record.md` is gone from this folder; it held nothing still waiting for him.

## Files

- `deal.py` — the dealer. One page a day, by a shuffle made once; its header explains the deck, the lap, a missed day, and what it sets aside.
- `check-links.py` — checks the dealer's link lookup against the links it once called forward ghosts, and counts ghosts over the newest map. Reads only.
- `wake.mjs` — prints the prompt that wakes the day's page, built on the deck's own Enchant prompt; with `--out <file>` it writes the prompt there instead. It reads the page from the main checkout; `--root <palace>` reads it from another checkout, so a page made true on a branch wakes from that branch's text.
- `lap.json`, `visits.jsonl` — the dealer's state. Written by `deal.py`, never by hand. Tracked.
- `roughs/` — playable roughs made before and during a sit, one folder per page. Ignored by git (`.gitignore` here). A rough worth keeping is copied into the `proofs/` folder of the page that will receive the work, and that page's baton names it.
- `scheduled-task/SKILL.md` — the tracked copy of the scheduled task's shim. The live one is outside the palace, at `~/.claude/scheduled-tasks/daily-page/SKILL.md`; when this copy changes, the live one takes its text on Loudon's yes, pasted by him or pushed by a session with `update_scheduled_task`.

## Running the tools

The tools read the palace from the main checkout and keep one state there, whichever worktree the session woke in. Run each by the main checkout's path, as one bare command, with no `cd` before it and nothing chained after it:

```sh
python3 "/Users/loudonstearns/Documents/The Palace/_ops/swarm/build-map.py"             # today's map into _ops/maps/, keeping the last three; no ledger line
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py"            # deal today's page and print its brief
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --status   # where the lap stands
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --peek     # what today's would be; records nothing
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --sat "<Entry>" --verdict <one> [--into "<Sibling>"] [--made "<what was made>"]   # dated by the page's deal; --date only for tests
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --closed "<Entry>" --landed <commit>   # after the landing: the board's "closed"; --let-go in place of --landed on Loudon's word
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --undone   # the close's list of undone mornings, a link to each; --all for every line
python3 "/Users/loudonstearns/Documents/The Palace/_ops/swarm/palace-map.py" near "<Entry>"   # the page's ring from today's map: who points at it, what it reaches
node "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/wake.mjs" "<Entry>" --out "<file>"   # writes the prompt to <file>; without --out it prints it
```

The verdicts are `keep`, `trim`, `tune`, `fold`, `compost`, `revive` and `open`. A fold needs `--into`, and the dealer refuses one without it. `revive` is for a page that is dormant or composting. If the main checkout is off `main`, a deal or a `--sat` refuses and says why; tell Loudon and stop.

A deal posts the morning's start to the board's `SYSTEM` board and counts the undone mornings; `--closed` posts the close after the landing and refuses while the morning's branch or folder holds work; `--let-go` marks a morning let go on Loudon's word, and nothing is let go otherwise; `--undone` lists the mornings not yet done, each with a link to its session, read from the app's own session records; a morning never sat and holding nothing leaves the list when its session is archived, and comes back if it is unarchived. With `--state`, the board is used only when `--board FILE` names one.

The dealer still accepts `--feel`, and the practice no longer passes it. `visits.jsonl` is tracked, and Loudon's own words stay in the page's diary, which is kept off git.

## The scheduled task

The task's model, permission mode and Worktree setting live only in its Edit form in the app (Code tab → Scheduled → The Daily Page → Edit); `SKILL.md` holds only the prompt. Loudon wants the run on Opus. The permission mode is Auto, set by Loudon on 2026-10-20: every run before it began in Manual mode and waited on a prompt until he arrived ([[The Daily Page — tuning]] items 44–46). The map builder's, the dealer's, the map tool's and the wake tool's commands are also allowed in `~/.claude/settings.json`; the board's marks and the list ride the dealer's.

**Worktree** is a checkbox in the same form. With it ticked, each run gets its own worktree under `.claude/worktrees/`, and the practice says how a morning works there ([[The Daily Page]] § Before Loudon arrives). It has been ticked since 2026-10-22, and every run since 2026-10-23 has woken in a worktree, its tools reaching the main checkout with nothing refused ([[The Daily Page — tuning]] item 72). The app reuses idle worktree folders, so a folder's name may belong to an older session while its branch is new.

**The Mac must be awake.** A run fires only while the app is open and the Mac awake; one slept through is skipped, and on waking the app starts a single catch-up for the most recent missed time. **Keep computer awake** (Settings → This computer → System) stops idle sleep, but a closed lid still sleeps the Mac. Whether the Mac stays open overnight is Loudon's call.

## The record

A morning leaves two records. Its commit holds what it changed in the palace. [[The Daily Page — tuning]] holds what it taught the practice, in git; what it showed about Loudon is in the page's diary, which with the scroll is kept off git and lives only in the main checkout (`_ops/The Daily Page/.gitignore` says why). The trial's one hand-kept morning is in the page's bundle, under `Archive/`.
