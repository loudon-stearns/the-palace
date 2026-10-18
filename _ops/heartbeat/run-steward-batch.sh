#!/bin/bash
# Palace heartbeat — STEWARD BATCH (Mac-side)
# Replaces the disabled Cowork scheduled task "palace-heartbeat-steward-batch".
#
# Why Mac-side: stewards run as a headless `claude -p` session on your machine,
# so they reach the full Shop (ComfyUI, Kokoro, Manim, Max/RNBO, the GPU) and
# stop posting the confusing "I'm in the sandbox / promote me to the Mac" forks.
# This is the same spawn STIGMERGY's actuator already uses to advance a steward
# from the board — just fired by a timer instead of a click. No API key needed.
#
# Fired by: ~/Library/LaunchAgents/com.loudon.palace.steward-batch.plist, at 06:00
#          and every 30 min. launchd never starts a second copy while one runs. A
#          30-min tick that falls in sleep is dropped (StartInterval); the 06:00
#          fire, missed in sleep, runs once at the next wake (StartCalendarInterval).
#          After landing a change to the plist, reinstall it: see the README.
# Decides: a steward batch runs only when all hold (2026-10-18; Loudon's Mac
#          sleeps on battery with the lid closed, and a 06:00 timer only ever met a
#          few-second dark wake there):
#            - the Mac is fully awake, lid open — not a dark wake;
#            - it is START_HOUR or later;
#            - INTERVAL_DAYS calendar days have passed since the last batch (calendar
#              days, so a run that started late does not cost a day).
#          A skipped check writes no log; .last-check records the latest decision.
#          Once a day, when awake (even while paused: it is read-only), it also runs
#          the Sentry's guard watch: is GitHub still refusing a force push to main?
#          If not, a notification; if GitHub has been unreadable for over two days,
#          a notification saying so.
# Test:    HEARTBEAT_DRY=1 prints the decision and stops; HEARTBEAT_NOW (epoch),
#          HEARTBEAT_STAMP, HEARTBEAT_GUARD_STAMP and HEARTBEAT_ASSUME_AWAKE=1|0 stand in
#          for the clock, the stamps and the wake state.
# Posture: the agent runs SHADOW (writes bundle scroll.md + machinery + board, but
#          never touches canon entry bodies/frontmatter and never runs git). Each
#          cycle's process-cycle.js commits what that cycle shipped; the WRAPPER
#          sweeps up any machinery left after the agent returns.
set -uo pipefail

# ── config ──────────────────────────────────────────────────────────────────
PALACE="/Users/loudonstearns/Documents/The Palace"   # MAIN worktree (where stewards + tools live)
INTERVAL_DAYS=2                                       # every other calendar day; set 1 for daily
START_HOUR=6                                          # no batch before this hour (local)
CLAUDE_BIN="${CLAUDE_BIN:-claude}"                    # if launchd can't find it, hardcode: which claude

# ── make `claude`/node resolvable under launchd's minimal environment ────────
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$HOME/.npm-global/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true

# ── the model: the latest Opus, as an exact id ──────────────────────────────
# _ops/models/latest-opus.mjs decides, asking the same `claude` this wrapper
# fires whether it can run a newer Opus. Never the bare `opus` alias, which has
# lagged the latest Opus. To hold the batch on one model, set MODEL to an exact id.
MODEL="$(CLAUDE_BIN="$CLAUDE_BIN" node "$PALACE/_ops/models/latest-opus.mjs" 2>/dev/null)"

LOG_DIR="$PALACE/_ops/heartbeat/logs"
mkdir -p "$LOG_DIR"
STAMP="${HEARTBEAT_STAMP:-$PALACE/_ops/heartbeat/.last-steward-batch}"
GUARD_STAMP="${HEARTBEAT_GUARD_STAMP:-$PALACE/_ops/heartbeat/.last-guard-watch}"
LAST_CHECK="$PALACE/_ops/heartbeat/.last-check"
DRY="${HEARTBEAT_DRY:-}"
NOW="${HEARTBEAT_NOW:-$(date +%s)}"

# Record the decision (overwritten each tick) and stop. Nothing else is written.
decide() {
  [ -n "$DRY" ] && echo "$1"
  [ -z "$DRY" ] && echo "$(date -r "$NOW" '+%Y-%m-%d %H:%M') $1" > "$LAST_CHECK"
  exit 0
}
# Local midnight of the day an epoch falls on, and whole calendar days between two epochs.
day_start() { date -j -f '%Y-%m-%d %H:%M:%S' "$(date -r "$1" +%Y-%m-%d) 00:00:00" +%s; }
days_between() { echo $(( ( $(day_start "$2") - $(day_start "$1") + 43200 ) / 86400 )); }
# Fully awake with the lid open: macOS lists Graphics among the system's capabilities in a full
# wake and not in a dark wake; a closed lid is AppleClamshellState = Yes (no lid: not listed).
# Read each answer whole before matching: under pipefail, grep -q exiting early would
# kill the writer with SIGPIPE and turn a match into a failure.
awake() {
  case "${HEARTBEAT_ASSUME_AWAKE:-}" in 1) return 0 ;; 0) return 1 ;; esac
  local sys lid
  sys="$(pmset -g systemstate 2>/dev/null)"
  case "$sys" in *Graphics*) ;; *) return 1 ;; esac
  lid="$(ioreg -r -k AppleClamshellState -d 4 2>/dev/null)"
  case "$lid" in *'"AppleClamshellState" = Yes'*) return 1 ;; esac
  return 0
}

awake || decide "skip: the Mac is asleep or its lid is closed"

# The Sentry's guard watch, once a calendar day while awake, paused or not (it only reads).
# The day counts as watched only when GitHub was actually read (exit 0 or 3); anything else
# looks again next tick, and after more than two days without a reading it says so, once a day.
today="$(date -r "$NOW" +%Y-%m-%d)"
GUARD_NAG="${GUARD_STAMP}-nag"
if [ "$(cat "$GUARD_STAMP" 2>/dev/null)" != "$today" ]; then
  if [ -n "$DRY" ]; then
    echo "would run: the Sentry's guard watch"
  else
    gw="$(cd "$PALACE" && node _ops/sentry/guard-watch.mjs 2>&1)"; gw_rc=$?
    echo "$(date '+%Y-%m-%d %H:%M') exit $gw_rc · $(printf '%s' "$gw" | tail -1)" >> "$LOG_DIR/guard-watch.log"
    case "$gw_rc" in
      0) echo "$today" > "$GUARD_STAMP" ;;
      3) echo "$today" > "$GUARD_STAMP"
         osascript -e 'display notification "GitHub may let a force push rewrite main. Run: node _ops/sentry/sweep.mjs --only hosting" with title "Palace Sentry"' >/dev/null 2>&1 || true ;;
      *) last_read="$(cat "$GUARD_STAMP" 2>/dev/null)"
         unread_days=99
         [ -n "$last_read" ] && unread_days="$(days_between "$(date -j -f '%Y-%m-%d %H:%M:%S' "$last_read 12:00:00" +%s 2>/dev/null || echo 0)" "$NOW")"
         if [ "$unread_days" -gt 2 ] && [ "$(cat "$GUARD_NAG" 2>/dev/null)" != "$today" ]; then
           osascript -e 'display notification "The guard watch has not been able to read GitHub for over two days. Run: gh auth status" with title "Palace Sentry"' >/dev/null 2>&1 || true
           echo "$today" > "$GUARD_NAG"
         fi ;;
    esac
  fi
fi

# global pause flag — STIGMERGY (or you) can pause the whole heartbeat without
# touching launchd: while _ops/heartbeat/.paused exists, every run no-ops and
# leaves the cadence stamp untouched. STIGMERGY only toggles this file (via the
# STEWARDS deck pause/resume); it never runs launchctl.
[ -f "$PALACE/_ops/heartbeat/.paused" ] && decide "skip: paused (flag present: $PALACE/_ops/heartbeat/.paused)"
[ "$(date -r "$NOW" +%H | sed 's/^0//')" -ge "$START_HOUR" ] || decide "skip: before ${START_HOUR}:00"
if [ -f "$STAMP" ]; then
  last="$(cat "$STAMP" 2>/dev/null || echo 0)"
  since="$(days_between "$last" "$NOW")"
  [ "$since" -lt "$INTERVAL_DAYS" ] && decide "skip: last batch ${since} calendar day(s) ago, due every ${INTERVAL_DAYS}"
fi
[ -n "$DRY" ] && { echo "would fire: the steward batch"; exit 0; }

LOG="$LOG_DIR/steward-batch-$(date +%Y-%m-%dT%H-%M-%S).log"
echo "$(date -r "$NOW" '+%Y-%m-%d %H:%M') fired the steward batch" > "$LAST_CHECK"

{
  echo "=== palace steward batch — $(date) ==="
  date +%s > "$STAMP"
  # Keep the Mac from idle-sleeping while the batch runs (a closed lid still sleeps it).
  caffeinate -i -w $$ >/dev/null 2>&1 &

  cd "$PALACE" || { echo "ERROR: palace not found at $PALACE"; exit 1; }
  command -v node >/dev/null 2>&1 || { echo "ERROR: node not in PATH"; exit 127; }
  echo "model (the lane picks the latest Opus itself): ${MODEL:-unknown}"

  # The batch (2026-10-14): fired through STIGMERGY's steward lane with the limits
  # in limits.json — stewards per batch, cycles each, a clock, a budget — and
  # visible on the PROJECTS deck while it runs. One log line per reap below;
  # last-batch.json when it ends. (Before this: one long `claude -p` session on
  # the orchestrator skill — 35 cycles, then hours silent on a usage limit.)
  node "$PALACE/_ops/heartbeat/batch.mjs"
  agent_rc=$?
  echo "=== heartbeat batch exit $agent_rc — $(date) ==="

  # ── Scoped, lock-safe commit (wrapper-side, NOT the agent) ───────────────────
  # The agent ran SHADOW: it wrote bundle scroll.md + steward machinery + board
  # appends, but it never commits and never edits canon entry bodies/frontmatter.
  # The wrapper makes ONE scoped commit via the palace committer, which stages
  # and commits only the paths we name (NEVER `git add -A` — SCHEMA §9,
  # N-writer repo), inside the door every committer shares. Each cycle already committed what it shipped
  # (process-cycle.js → cycle-commit.js); this is the sweep for machinery and
  # scrolls a failed or skipped cycle commit left behind.
  COMMITTER="$PALACE/_ops/stigmergy/app/scripts/palace-commit.mjs"
  if command -v node >/dev/null 2>&1 && [ -f "$COMMITTER" ]; then
    # Name every path, and let the committer stage and commit exactly those,
    # inside the door (server/door.js) it shares with every other committer.
    # Never raw `git add` here: staging outside the door is how the shared
    # index got raced, and a commit with no named paths used to take whatever
    # anyone had staged. NUL-delimited reads so spaces and em-dashes survive.
    PATHS=(--path "_ops/agents/permanent" --path "_ops/swarm/persistent/blackboard.jsonl")
    while IFS= read -r -d '' f; do PATHS+=(--path "$f"); done < <(
      # Against HEAD, not the index: a scroll a failed commit left staged is
      # still a change, and sweeping it up is what this pass is for.
      git -C "$PALACE" diff HEAD --name-only -z -- '*— scroll.md' 2>/dev/null
      git -C "$PALACE" ls-files --others --exclude-standard -z -- '*— scroll.md' 2>/dev/null
    )
    PALACE_ROOT="$PALACE" node "$COMMITTER" \
      --kind steward --scope heartbeat \
      --summary "machinery + project scrolls" \
      --verify unverified --author claude \
      "${PATHS[@]}" \
      || echo "commit: palace-commit returned non-zero (see message above)"
  else
    echo "commit: node or palace committer unavailable — left uncommitted for Mac-side review"
  fi

  echo "=== steward batch done — $(date) ==="
} >"$LOG" 2>&1
