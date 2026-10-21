#!/bin/zsh
# prove-open.sh <set.als> <tag>: open the Set in a second Live 12 instance, one capture, quit. No playback.
set -u
S=/private/tmp/claude-501/-Users-loudonstearns-Documents-The-Palace/872087d1-a80f-4cec-99d6-edf177f0669e/scratchpad
SET="$1"; TAG="$2"
say() { echo "$(date +%H:%M:%S) $*"; }
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
sleep 6
osascript -e "tell application \"System Events\" to set frontmost of (first process whose unix id is $PID) to true" >/dev/null 2>&1
sleep 2
screencapture -x "$S/proof-$TAG-open.png"; say "captured (open)"
"$S/postkey" "$PID" 12 cmd >/dev/null; say "cmd+Q: quit"
for i in $(seq 1 15); do kill -0 "$PID" 2>/dev/null || break; sleep 1; done
if kill -0 "$PID" 2>/dev/null; then screencapture -x "$S/proof-$TAG-quit-dialog.png"; say "instance still running after 15 s"; else say "instance quit after $i s"; fi
case "$BEFORE" in ""|loginwindow|Live) ;; *) osascript -e "tell application \"$BEFORE\" to activate" >/dev/null 2>&1;; esac
sleep 1
say "frontmost after: $(osascript -e 'tell application "System Events" to get name of first process whose frontmost is true' 2>/dev/null)"
sips -Z 1600 "$S/proof-$TAG-open.png" --out "$S/proof-$TAG-open-small.png" >/dev/null 2>&1
say "done"
