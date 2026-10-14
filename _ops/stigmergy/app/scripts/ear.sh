#!/bin/sh
# ear.sh -- the palace's ear: the logic behind the reference-transaction hook.
#
# Git runs the hook for every ref transaction in this repo, from every
# worktree (they share one hooks directory). The ear writes one line for each
# move of a local branch to <git common dir>/palace-ear.jsonl, and nothing
# else. It is the one place that hears every commit, merge, fast-forward and
# reset, whoever made it and however.
#
# Each line says:
#   via      "door" when the move came from a palace committer (server/door.js
#            sets PALACE_DOOR=1 for its git children), else "around": an agent
#            typing raw git, since Loudon never commits by hand.
#   tag      which committer, when it came through the door.
#   session  the Claude Code session, when one made it.
#   caller   the program that ran git, and the folder it ran in.
#
# LISTENING ONLY. It never refuses a move and always exits 0, even if it
# breaks: a non-zero exit in the "prepared" state would abort the transaction,
# and the ear must never be the reason a commit fails. It acts only on the
# "committed" state, and only on refs/heads/*.

state="$1"
if [ "$state" != "committed" ]; then
  cat >/dev/null 2>&1
  exit 0
fi

common="$(git rev-parse --git-common-dir 2>/dev/null)" || { cat >/dev/null 2>&1; exit 0; }
case "$common" in
  /*) ;;
  *) common="$(pwd)/$common" ;;
esac
log="$common/palace-ear.jsonl"

esc() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr -d '\n\r'; }

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
via="around"
[ "${PALACE_DOOR:-}" = "1" ] && via="door"
# The hook's parent is git; git's parent is whoever ran it.
caller_pid="$(ps -o ppid= -p "$PPID" 2>/dev/null | tr -d ' ')"
caller=""
[ -n "$caller_pid" ] && caller="$(ps -o comm= -p "$caller_pid" 2>/dev/null | head -1)"

while read -r old new ref; do
  case "$ref" in
    refs/heads/*) ;;
    *) continue ;;
  esac
  printf '{"ts":"%s","ref":"%s","old":"%s","new":"%s","via":"%s","tag":"%s","session":"%s","caller":"%s","cwd":"%s"}\n' \
    "$ts" "$(esc "$ref")" "$old" "$new" "$via" \
    "$(esc "${PALACE_DOOR_TAG:-}")" "$(esc "${CLAUDE_CODE_SESSION_ID:-}")" \
    "$(esc "$(basename "$caller" 2>/dev/null)")" "$(esc "$(pwd)")" \
    >> "$log" 2>/dev/null
done
exit 0
