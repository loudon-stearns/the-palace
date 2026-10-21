X=$(dirname "$0")
# Task B only is kept here; the second task is kept off git.
(cd "$X/now" && claude -p "$(cat $X/task2.txt)" --tools "" --strict-mcp-config --model claude-opus-5-5)
