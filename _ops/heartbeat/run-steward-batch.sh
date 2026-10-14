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
# Fired by: ~/Library/LaunchAgents/com.loudon.palace.steward-batch.plist (daily 06:00).
# Cadence: the 2-day stamp guard below makes the real cadence every-other-morning
#          even though launchd fires daily (launchd can't express "every 2 days").
# Posture: the agent runs SHADOW (writes bundle scroll.md + machinery + board, but
#          never touches canon entry bodies/frontmatter and never runs git). Each
#          cycle's process-cycle.js commits what that cycle shipped; the WRAPPER
#          sweeps up any machinery left after the agent returns.
set -uo pipefail

# ── config ──────────────────────────────────────────────────────────────────
PALACE="/Users/loudonstearns/Documents/The Palace"   # MAIN worktree (where stewards + tools live)
INTERVAL_DAYS=2                                       # every-other-morning; set 1 for daily
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
LOG="$LOG_DIR/steward-batch-$(date +%Y-%m-%dT%H-%M-%S).log"
STAMP="$PALACE/_ops/heartbeat/.last-steward-batch"

{
  echo "=== palace steward batch — $(date) ==="

  # global pause flag — STIGMERGY (or you) can pause the whole heartbeat without
  # touching launchd: while _ops/heartbeat/.paused exists, every run no-ops and
  # leaves the cadence stamp untouched. STIGMERGY only toggles this file (via the
  # STEWARDS deck pause/resume); it never runs launchctl.
  if [ -f "$PALACE/_ops/heartbeat/.paused" ]; then
    echo "skip: paused (flag present: $PALACE/_ops/heartbeat/.paused)"; exit 0
  fi

  # every-other-morning guard
  if [ -f "$STAMP" ]; then
    last="$(cat "$STAMP" 2>/dev/null || echo 0)"; now="$(date +%s)"
    if [ $(( (now - last) / 86400 )) -lt "$INTERVAL_DAYS" ]; then
      echo "skip: last run < ${INTERVAL_DAYS}d ago"; exit 0
    fi
  fi
  date +%s > "$STAMP"

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
