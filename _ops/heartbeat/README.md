# Palace Heartbeat — Mac-side routines

The steward batch's launchd job replaces the Cowork **scheduled task** (now disabled)
that used to fire it; the Shopkeeper runs inside the batch as an ordinary steward. The reason for the move:
Cowork's scheduled tasks run in the **Linux sandbox**, which has no GPU/Max/native
tools — so GPU-bound stewards kept posting confusing "I'm in the sandbox, hand me
to the Mac" forks into your Trickster inbox. Running the same headless
`claude -p` cycle **on the Mac** puts the stewards where the Shop's tools actually
live, and the confusion disappears at the source. No Anthropic API key is needed —
this is your local Claude Code CLI on a timer (the same spawn STIGMERGY's actuator
already uses to advance a steward from the board).

## Files

| File | Role |
|---|---|
| `batch.mjs` | **The batch (2026-10-14).** Reads `limits.json`, asks `batch-plan.js` which stewards are due, takes the first N (least recently active first), and fires them through STIGMERGY's own steward lane (`POST /api/stewards/advance-all`, source `heartbeat`) with a per-steward cycle cap, a wall clock and a dollar budget. Same worker, same transcripts (the WATCH pane works), same per-cycle commits as a click on the PROJECTS deck; the deck shows the batch while it runs. Starts the app if it is down. Writes one log line per reap and `last-batch.json` when it ends (the scheduler strip reads it). |
| `limits.json` | The limits, edited by hand: stewards per batch, cycles per steward, minutes, dollars, debounce hours. A batch ends when any one is reached; what was not fired stays due. |
| `run-steward-batch.sh` | Wrapper: gives every *due* steward a **run** (up to its manifest `max_iterations` cycles, stopping on a blocking ask, a session request, or a stall) via the orchestrator skill (batch mode), then makes one scoped, text-only commit (machinery + `[Entry] — scroll.md` + board). See **Posture** below. |
| `launchd/com.loudon.palace.steward-batch.plist` | Timer: every 30 min; the wrapper decides whether a batch is due (see Cadence note). |
| `logs/` | Per-run logs + launchd stdout/stderr. |
| `.last-steward-batch` | Stamp of the last batch; the cadence guard counts calendar days from it. |
| `.last-guard-watch`, `logs/guard-watch.log` | The Sentry's daily guard watch: the day it last ran, and each line it printed. |
| `.last-check` | The wrapper's latest decision (overwritten each tick; a skip writes no log). |

## Why the batch moved onto the lane (2026-10-14)

The first heartbeat after the login was renewed (2026-10-14 06:01) ran one long `claude -p`
orchestrator session: 35 Opus cycles over eleven stewards in three and a half hours, then six
and a half hours silent on a usage limit, then more. Nothing of it showed on the PROJECTS deck
(the deck watches the app's lane) and no transcript reached disk. Loudon: "I need to be able to
see what the heartbeat is doing. The heartbeat needs some additional limits, this was way too
much." So the batch now fires through the lane with hard limits, and the wrapper's `claude -p`
block is replaced by `node _ops/heartbeat/batch.mjs` (the wrapper change lands after the
door — see the Keeper's work on committing).

## Which `claude` fires

The wrapper and STIGMERGY's lanes (`_ops/stigmergy/app/server/claude-bin.js`) resolve the
binary the same way: `$CLAUDE_BIN` if set, else `~/.local/bin/claude` if present, else bare
`claude`. On 2026-09-23 the Homebrew CLI (2.1.236) was too old for `claude-opus-5-5` (needs
≥ 2.1.280) and `brew upgrade claude-code` was blocked on the Xcode license, so for one evening
a shim at `~/.local/bin/claude` exec'd the CLI the Claude desktop app bundles
(`~/Library/Application Support/Claude/claude-code/<version>/…`). Resolved the same night by
switching casks — the plain `claude-code` cask lags; `claude-code@latest` tracks the current
release — and the shim was deleted. If the pin ever bites again, that shim is the stopgap:
a one-line script that execs the newest bundled version, removed once Homebrew catches up.

## Cadence note

**The steward batch (since 2026-10-18)** fires at 06:00 and every 30 minutes, and
decides for itself. A 30-minute tick that falls in sleep is dropped (StartInterval);
the 06:00 fire, missed in sleep, runs once at the next wake (StartCalendarInterval). It runs a batch only when the Mac is fully awake with the lid open (a dark
wake lists no Graphics in `pmset -g systemstate`), at `START_HOUR` (06:00) or later,
and `INTERVAL_DAYS` (2) **calendar** days after the last batch, so a run that started
late does not cost a day; `caffeinate` keeps the Mac from idle-sleeping while it
runs. Why: the old 06:00 timer met a sleeping Mac in a few-second dark wake, and its
guard counted whole 24-hour days, so one late start turned every other morning into
every third. Once a day, when awake, it also runs the Sentry's guard watch
(`_ops/sentry/guard-watch.mjs`), even while the heartbeat is paused, since it only
reads: a notification if GitHub would let a force push rewrite main, and another,
once a day, if the watch has not been able to read GitHub for over two days (for
example, `gh` logged out). Test the decision without firing anything:
`HEARTBEAT_DRY=1 zsh -l _ops/heartbeat/run-steward-batch.sh` (with `HEARTBEAT_NOW`,
`HEARTBEAT_STAMP`, `HEARTBEAT_ASSUME_AWAKE=1|0` to stand in for the clock, stamp and
wake state).

**The other jobs** still fire **daily** with a 2-day **stamp guard** that no-ops on
the off day. Change `INTERVAL_DAYS` at the top of a wrapper (1 = daily), or the plist
`Hour`/`Minute` to move the time. If the Mac is asleep at the scheduled minute,
launchd runs the job at next wake.

## Posture — grown up for its own page, the cycle commits

The batch runs each steward **grown up for its own page and bundle**
(since `10751829`, 2026-10-16; [[Project Stewardship System]] § What's Decided),
and the deterministic steps commit — never the agent:

- **The steward may edit its own page and bundle, and never runs git.** Each
  cycle reads ELDER on top of SCHEMA and may edit its own entry, body and
  frontmatter alike, and anything in its bundle. It lists each edit in its post
  as `page_edits` with a line of why; `process-cycle.js` commits those by name
  once the frontmatter parses, and the scroll's trail shows each one. An edit to
  another page, a new entry, canon, the scroll (its Plan and Standing Orders
  stay Loudon's) and the ledger are refused (`page_edits_refused`, named in the commit body) and
  stay proposals on the board. It does not deposit. Its normal cycle output
  still goes where it always did: the bundle-local `[Entry] — scroll.md`
  read-model, the steward machinery (`state.json` / `history.jsonl`), and
  append-only Trickster-board messages.
- **The wrapper makes one scoped, lock-safe commit** after the agent returns,
  via the palace committer (`_ops/stigmergy/app/scripts/palace-commit.mjs`),
  which stages only the paths the wrapper names — **never `git add -A`**
  (SCHEMA §9, N-writer repo) — and clears stale git locks itself. The
  steward-batch commits steward machinery + the board + every changed
  `[Entry] — scroll.md`.
- **Each cycle commits what it shipped (decided 2026-09-25).** When a cycle
  ends, `process-cycle.js` commits the files that cycle's messages listed in
  `artifacts` — text and images, each at most 10 MB, only inside the
  steward's own bundle, never a file carrying entry frontmatter, never a file
  `.gitignore` ignores (named in the commit body; the rest still commits; audio
  and video stewards make are always ignored, and stay on this Mac) — together
  with its machinery, its scroll and the board, in one commit scoped to exactly
  those paths (`palace-commit.mjs --only`; `cycle-commit.js`). A shipped thing
  is a made thing, not a proposal awaiting review; one left uncommitted is lost
  the day the tree is cleaned. Files over the cap stay on disk and are named in
  the commit body. The wrapper's own commit is the sweep for anything a cycle
  commit missed.

This replaces the old "do NOT commit, leave the tree for Loudon" rule — a
Cowork-era holdover. That constraint existed because the Cowork sandbox could
not delete files, so a raw commit stranded lockfiles; Mac-side, commits are
normal. Leaving 19 stewards' `scroll.md` + machinery churning uncommitted every
other morning would only bury the signal (the actual asks) under a growing
pile of machinery diffs.

### The review digest is separate

The human-readable "Steward Batch Review" digest
(`_ops/stigmergy/trickster-auto/heartbeat-latest.md`) is produced by the
**Automated Trickster** (`trickster-auto`), *not* by the batch. The
steward batch deliberately writes no digest file — the BBS is its record (see
`batch.md` Step 4). If you want the digest regenerated on the same cadence,
that is a third job to add here; today it is run separately.

## Install (run on the Mac, in Terminal)

```sh
cd "/Users/loudonstearns/Documents/The Palace"

# 0) one-time: clear the stale lock left by the Cowork rollback, or git writes on main will fail
rm -f .git/index.lock

# 1) make the wrapper executable
chmod +x _ops/heartbeat/run-steward-batch.sh

# 2) confirm the CLI is found in a LOGIN shell (this is what launchd uses)
zsh -lc 'command -v claude' || echo "claude not on login PATH — see Troubleshooting"

# 3) copy the plists into LaunchAgents and load them
cp _ops/heartbeat/launchd/com.loudon.palace.*.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.loudon.palace.steward-batch.plist
```

(Older macOS: use `launchctl load -w ~/Library/LaunchAgents/com.loudon.palace.steward-batch.plist` instead of `bootstrap`.)

**After a change to a plist lands, reinstall it.** The installed job is a copy, so a landed plist changes nothing until it is reloaded, and `bootstrap` refuses a job that is already loaded:
```sh
launchctl bootout gui/$(id -u)/com.loudon.palace.steward-batch
cp _ops/heartbeat/launchd/com.loudon.palace.steward-batch.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.loudon.palace.steward-batch.plist
launchctl print gui/$(id -u)/com.loudon.palace.steward-batch | grep -E 'run interval|state'
```

### Optional — wake the Mac so it can fire unattended at dawn
```sh
sudo pmset repeat wakeorpoweron MTWRFSU 05:58:00
```

## Test now (don't wait for 06:00)

Run a wrapper by hand and watch the log. (Temporarily set `INTERVAL_DAYS=0`-style
testing by deleting the stamp file first, since you just rolled back today.)
```sh
rm -f _ops/heartbeat/.last-steward-batch
_ops/heartbeat/run-steward-batch.sh &
tail -f _ops/heartbeat/logs/steward-batch-*.log
```
Or kick the launchd job directly:
```sh
launchctl kickstart -k gui/$(id -u)/com.loudon.palace.steward-batch
```

## Pause (soft) vs. uninstall (hard)

Two different levers — reach for the soft one first.

**Soft pause — keep it installed, just skip runs.** Drop a `.paused` flag in this
directory and the wrappers no-op on every fire (and leave the cadence stamp
untouched), until you remove it:
```sh
touch _ops/heartbeat/.paused      # pause the whole heartbeat
rm   _ops/heartbeat/.paused       # resume
```
The flag is gitignored runtime state, per-machine. The **STIGMERGY STEWARDS deck**
exposes the same lever as a *pause heartbeat / resume heartbeat* button (it writes
this exact file — it never calls `launchctl`), alongside a truthful read of the
scheduler's state (installed? · cadence · last run · next fire · the digest with
its age). See [[STIGMERGY v2.0 — Consolidation & Primary Interface]].

**Hard uninstall — unload the launchd jobs entirely:**
```sh
launchctl bootout gui/$(id -u)/com.loudon.palace.steward-batch
# then optionally remove ~/Library/LaunchAgents/com.loudon.palace.*.plist
```

The old Cowork tasks are **disabled**, not deleted. To remove them for good, delete
their folders:
`~/Documents/Claude/Scheduled/palace-heartbeat-steward-batch/` and
`~/Documents/Claude/Scheduled/shopkeeper-discovery-sweep/`.

## Troubleshooting

- **`claude` not found when launchd runs it** — launchd uses a login shell, which
  sources `~/.zprofile`/`~/.zlogin` but **not** `~/.zshrc`. If your PATH (nvm,
  Homebrew, npm-global) is set only in `~/.zshrc`, either move the PATH export to
  `~/.zprofile`, or set `CLAUDE_BIN` to the absolute path at the top of each wrapper
  (find it with `which claude`).
- **Nothing happened at 06:00** — the Mac was asleep and not set to wake (see pmset
  above), or the 2-day guard skipped (check the newest `logs/*.log`).
- **Model string** — the steward batch runs the latest Opus as an exact id, which
  `_ops/models/latest-opus.mjs` decides (the `opus` alias has lagged it); each run's log
  prints it as `model:`. `node _ops/models/latest-opus.mjs --why` shows how it was chosen.
  To hold the batch on one model, set `MODEL=` in the wrapper to an exact id.
