#!/bin/zsh
# prove.sh <set.als> <tag>: open the Set in a second Live 12 instance, look, play ten seconds, stop, quit, return.
set -u
S=/private/tmp/claude-501/-Users-loudonstearns-Documents-The-Palace/872087d1-a80f-4cec-99d6-edf177f0669e/scratchpad
SET="$1"; TAG="$2"
LOG="$S/prove-$TAG.log"; : > "$LOG"
say() { echo "$(date +%H:%M:%S) $*" | tee -a "$LOG"; }
BEFORE="$(osascript -e 'tell application "System Events" to get name of first process whose frontmost is true' 2>/dev/null)"
say "frontmost before: $BEFORE"
OLD="$(pgrep -f 'Ableton Live 12 Suite.app/Contents/MacOS/Live' | tr '\n' ' ')"
open -n -a "Ableton Live 12 Suite" "$SET"
sleep 4
PID=""
for p in $(pgrep -f 'Ableton Live 12 Suite.app/Contents/MacOS/Live'); do case " $OLD " in *" $p "*) ;; *) PID=$p;; esac; done
say "second instance pid: $PID (others: $OLD)"
[ -z "$PID" ] && { say "no new instance"; exit 1; }
NAME="$(basename "$SET" .als)"
WID=""
for i in $(seq 1 40); do
  WID="$("$S/windows" | grep "pid=$PID " | grep "name=$NAME" | head -1 | sed -E 's/.*id=([0-9]+).*/\1/')"
  [ -n "$WID" ] && break
  sleep 2
done
say "window '$NAME' id: ${WID:-none} after $((i*2)) s"
[ -z "$WID" ] && { say "no window appeared"; "$S/windows" | grep "pid=$PID" | tee -a "$LOG"; }
sleep 3
osascript -e "tell application \"System Events\" to set frontmost of (first process whose unix id is $PID) to true" 2>&1 | tee -a "$LOG"
sleep 2
screencapture -x "$S/proof-$TAG-1-open.png"; say "captured 1 (open)"
"$S/postkey" "$PID" 48 shift >> "$LOG"; say "shift+tab: device view"
sleep 2
screencapture -x "$S/proof-$TAG-1b-devices.png"; say "captured 1b (devices)"
"$S/postkey" "$PID" 49 >> "$LOG"; say "space: play"
sleep 10
screencapture -x "$S/proof-$TAG-2-playing.png"; say "captured 2 (playing); cpu $(ps -o %cpu= -p $PID)"
"$S/postkey" "$PID" 49 >> "$LOG"; say "space: stop"
sleep 1
screencapture -x "$S/proof-$TAG-3-stopped.png"; say "captured 3 (stopped)"
"$S/postkey" "$PID" 12 cmd >> "$LOG"; say "cmd+Q: quit"
for i in $(seq 1 15); do kill -0 "$PID" 2>/dev/null || break; sleep 1; done
if kill -0 "$PID" 2>/dev/null; then screencapture -x "$S/proof-$TAG-4-quit-dialog.png"; say "instance still running after 15 s: captured 4"; else say "instance quit after $i s"; fi
[ -n "$BEFORE" ] && osascript -e "tell application \"$BEFORE\" to activate" 2>&1 | tee -a "$LOG"
sleep 1
say "frontmost after: $(osascript -e 'tell application "System Events" to get name of first process whose frontmost is true' 2>/dev/null)"
for f in "$S"/proof-$TAG-*.png; do sips -Z 1600 "$f" --out "${f%.png}-small.png" >/dev/null 2>&1; done
say "done"
