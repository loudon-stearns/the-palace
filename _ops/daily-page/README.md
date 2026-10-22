# daily-page — the Daily Page's machinery

The practice itself is a page: **[[The Daily Page]]**, `_ops/The Daily Page.md`. This folder holds what runs it.

**If a scheduled task sent you here to follow this file:** the practice moved. Read `_ops/The Daily Page.md` in the main checkout, do its "Before Loudon arrives" part, and stop at that part's last step: greet Loudon as its last step says, and wait. The trial's `record.md` is gone from this folder; it held nothing still waiting for him.

## Files

- `deal.py` — the dealer. One page a day, by a shuffle made once; its header explains the deck, the lap, a missed day, and what it sets aside.
- `wake.mjs` — prints the prompt that wakes the day's page, built on the deck's own Enchant prompt; with `--out <file>` it writes the prompt there instead.
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
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --sat "<Entry>" --verdict <one> [--into "<Sibling>"] [--made "<what was made>"]
python3 "/Users/loudonstearns/Documents/The Palace/_ops/swarm/palace-map.py" near "<Entry>"   # the page's ring from today's map: who points at it, what it reaches
node "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/wake.mjs" "<Entry>" --out "<file>"   # writes the prompt to <file>; without --out it prints it
```

The verdicts are `keep`, `trim`, `tune`, `fold`, `compost`, `revive` and `open`. A fold needs `--into`, and the dealer refuses one without it. `revive` is for a page that is dormant or composting. If the main checkout is off `main`, a deal or a `--sat` refuses and says why; tell Loudon and stop.

The dealer still accepts `--feel`, and the practice no longer passes it. `visits.jsonl` is tracked, and Loudon's own words stay in the page's diary, which is kept off git.

## The scheduled task

The task's model, permission mode and Worktree setting live only in its Edit form in the app (Code tab → Scheduled → The Daily Page → Edit); `SKILL.md` holds only the prompt. Loudon wants the run on Opus. The permission mode is Auto, set by Loudon on 2026-10-20: every run before it began in Manual mode and waited on a prompt until he arrived ([[The Daily Page — tuning]] items 44–46). The dealer's and the wake tool's commands are also allowed in `~/.claude/settings.json`.

**Worktree** is a checkbox in the same form. With it ticked, each run gets its own worktree under `.claude/worktrees/`, and the practice says how a morning works there ([[The Daily Page]] § Before Loudon arrives). Tick it only after v0.5 of the practice has landed, and watch the first morning that runs in one: whether the app's worktree isolation lets the dealer, the committer and the lander reach the main checkout has not been tried.

## The record

A morning leaves two records. Its commit holds what it changed in the palace. [[The Daily Page — tuning]] holds what it taught the practice, in git; what it showed about Loudon is in the page's diary, which with the scroll is kept off git and lives only in the main checkout (`_ops/The Daily Page/.gitignore` says why). The trial's one hand-kept morning is in the page's bundle, under `Archive/`.
