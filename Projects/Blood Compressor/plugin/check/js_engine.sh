#!/bin/sh
exec node "$(dirname "$0")/js_engine.cjs" "$@"
