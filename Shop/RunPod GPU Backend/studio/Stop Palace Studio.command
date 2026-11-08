#!/bin/bash
# Force-stop Palace Studio and park the GPU endpoint, in case the main window
# was closed without a clean shutdown.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PALACE_STUDIO_PORT:-8765}"
PIDFILE="$DIR/.studio.pid"

echo "Stopping Palace Studio…"
[ -f "$PIDFILE" ] && { kill "$(cat "$PIDFILE")" 2>/dev/null; rm -f "$PIDFILE"; }
# belt and suspenders: kill anything still bound to the port
PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null)
[ -n "$PIDS" ] && kill $PIDS 2>/dev/null

# release Palace Studio's hold on the endpoint
IFS=$'\t' read -r RP_KEY RP_EP <<<"$(python3 - "$DIR" <<'PY'
import json,os,sys
d=sys.argv[1]; cf=os.path.join(d,"config.json")
key=os.environ.get("RUNPOD_API_KEY"); ep=os.environ.get("RUNPOD_ENDPOINT_ID")
if (not key or not ep) and os.path.exists(cf):
    try:
        c=json.load(open(cf)); key=key or c.get("api_key"); ep=ep or c.get("endpoint_id")
    except Exception: pass
print((key or "")+"\t"+(ep or ""))
PY
)"
workers() { # $1 = enter | exit — ref-counted over the board, so quitting never parks the
  # endpoint under another agent's render. Runpod is spoken only by _ops/commons/runpod_api.py
  # ([[RunPod GPU Backend — runbook]]).
  [ -n "$RP_KEY" ] && [ -n "$RP_EP" ] || return 0
  COMMONS_AGENT_SLUG=palace-studio RP_KEY="$RP_KEY" python3 - "$DIR/../../../_ops" "$RP_EP" "$1" <<'PY' \
    || echo "  !! couldn't scale the GPU endpoint — the error is above"
import os, sys
sys.path.insert(0, sys.argv[1])
from commons.endpoint import EndpointWorkers
w = EndpointWorkers(sys.argv[2], os.environ["RP_KEY"], steward="Palace Studio")
w.enter() if sys.argv[3] == "enter" else w.exit()
PY
}
if [ -n "$RP_KEY" ] && [ -n "$RP_EP" ]; then
  echo "Releasing GPU endpoint $RP_EP (it parks to 0 once no one else is rendering)…"; workers exit
fi
echo "Stopped. Safe to close."
