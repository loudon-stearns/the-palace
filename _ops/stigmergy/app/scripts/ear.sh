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
# and the ear must never be the reason a commit fails. The shim
# (install-hooks.mjs) already drops every state but "committed" and every
# transaction that names no branch before it calls this script.
#
# Not a move, so not written: a line whose old and new values match, and the
# deletion half of `git gc` or `git pack-refs` packing a loose branch (the
# branch still resolves afterwards; only its storage changed).

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

# JSON-escape one value: backslash and double quote escaped, every control
# character (newlines included) removed.
esc() { printf '%s' "$1" | tr -d '\000-\037' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
via="around"
[ "${PALACE_DOOR:-}" = "1" ] && via="door"
# The shim passes git's own pid; git's parent is whoever ran it.
git_pid="${EAR_GIT_PID:-$PPID}"
caller_pid="$(ps -o ppid= -p "$git_pid" 2>/dev/null | tr -d ' ')"
caller=""
[ -n "$caller_pid" ] && caller="$(ps -o comm= -p "$caller_pid" 2>/dev/null | head -1)"
tag_e="$(esc "${PALACE_DOOR_TAG:-}")"
session_e="$(esc "${CLAUDE_CODE_SESSION_ID:-}")"
caller_e="$(esc "$(basename "$caller" 2>/dev/null)")"
cwd_e="$(esc "$(pwd)")"
zero="0000000000000000000000000000000000000000"

while read -r old new ref; do
  case "$ref" in
    refs/heads/*) ;;
    *) continue ;;
  esac
  [ "$old" = "$new" ] && continue
  if [ "$new" = "$zero" ] && git rev-parse -q --verify "$ref" >/dev/null 2>&1; then
    continue # packed, not deleted
  fi
  if [ "$old" = "$zero" ]; then
    # The creation half of packing: git pack-refs (alone, or under gc or
    # maintenance) writes every loose branch into packed-refs. Nothing moved.
    case "$(ps -o args= -p "$git_pid" 2>/dev/null)" in
      *pack-refs*|*" gc"*|*maintenance*) continue ;;
    esac
  fi
  printf '{"ts":"%s","ref":"%s","old":"%s","new":"%s","via":"%s","tag":"%s","session":"%s","caller":"%s","cwd":"%s"}\n' \
    "$ts" "$(esc "$ref")" "$old" "$new" "$via" "$tag_e" "$session_e" "$caller_e" "$cwd_e" \
    >> "$log" 2>/dev/null
done
exit 0
