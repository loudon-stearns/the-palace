# daily-page — the Daily Page's machinery

The practice itself is a page: **[[The Daily Page]]**, `_ops/The Daily Page.md`. This folder holds what runs it.

**If a scheduled task sent you here to follow this file:** the practice moved. Read `_ops/The Daily Page.md` in the main checkout, do its "Before Loudon arrives" part, and stop at that part's last step: greet Loudon as its last step says, and wait. The trial's `record.md` is gone from this folder; it held nothing still waiting for him.

## Files

- `deal.py` — the dealer. One page a day, by a shuffle made once; its header explains the deck, the lap, a missed day, and what it sets aside.
- `wake.mjs` — prints the prompt that wakes the day's page, built on the deck's own Enchant prompt.
- `lap.json`, `visits.jsonl` — the dealer's state. Written by `deal.py`, never by hand. Tracked.
- `roughs/` — playable roughs made before and during a sit, one folder per page. Ignored by git (`.gitignore` here). A rough worth keeping is copied into the `proofs/` folder of the page that will receive the work, and that page's baton names it.
- `scheduled-task/SKILL.md` — the tracked copy of the scheduled task's shim. The live one is outside the palace, at `~/.claude/scheduled-tasks/daily-page/SKILL.md`; when this copy changes, Loudon replaces that one with its text.

## Running the tools

Both tools read the palace from the main checkout and keep one state there, whichever worktree the session woke in. Run them by the main checkout's path:

```sh
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py"            # deal today's page and print its brief
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --status   # where the lap stands
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --peek     # what today's would be; records nothing
python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py" --sat "<Entry>" --verdict <one> [--into "<Sibling>"] [--made "<what was made>"]
node "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/wake.mjs" "<Entry>" > <file>
```

The verdicts are `keep`, `trim`, `tune`, `fold`, `compost`, `revive` and `open`. A fold needs `--into`, and the dealer refuses one without it. `revive` is for a page that is dormant or composting. If the main checkout is off `main`, a deal or a `--sat` refuses and says why; tell Loudon and stop.

The dealer still accepts `--feel`, and the practice no longer passes it. `visits.jsonl` is tracked, and Loudon's own words stay in the page's ledger, which is kept off git.

## The scheduled task

The task's model is set only in its Edit form in the app (Code tab → Routines → The Daily Page → Edit); no session can set it. Loudon wants the run on Opus. Whether the dealer's and the wake prompt's commands are pre-approved for the task is his to set as well; until they are, the prep may wait on a prompt until he arrives.

## The record

A morning leaves two records. Its commit holds what it changed in the palace. [[The Daily Page — tuning]] holds what it showed about Loudon; that ledger and its scroll are kept off git and live only in the main checkout (`_ops/The Daily Page/.gitignore` says why). The trial's one hand-kept morning is in the page's bundle, under `Archive/`.
