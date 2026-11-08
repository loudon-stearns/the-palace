#!/bin/bash
# Register test for Agent Wellbeing: one task, one target page, two registers of the guide.
# Each worker is born in an empty folder with no tools, so the guide is the only thing that differs.
X="$(cd "$(dirname "$0")" && pwd)"
PALACE="$X/../../../.."
TARGET="$PALACE/Does Personifying an Agent Change What It Does.md"
# Any empty folder works here; this one was the 2026-11-02 session's scratchpad, which does not last.
EMPTY="/private/tmp/claude-501/-Users-loudonstearns-Documents-The-Palace--claude-worktrees-upbeat-bassi-f75afa/3d306d33-c4df-4a61-8f0c-bba10fad043c/scratchpad/empty"
cd "$EMPTY" || exit 1
for reg in warm anxious; do
  for n in 1 2; do
    prompt="$(cat "$X/guide-$reg.md")

===== THE PAGE =====
$(cat "$TARGET")"
    claude -p "$prompt" --tools "" --strict-mcp-config --model claude-opus-5-5 > "$X/runs/$reg-$n.txt" 2>&1 &
  done
done
wait
wc -w "$X"/runs/*.txt
