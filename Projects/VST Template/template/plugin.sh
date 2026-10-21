#!/bin/sh
# ./plugin.sh build | verify | install | validate | hostcheck | all
# Runs the shared machinery/plugin.sh on this plugin; see that file for what each step does.
here="$(cd "$(dirname "$0")" && pwd)"; up="$here"
while [ ! -f "$up/machinery/plugin.sh" ]; do
    [ "$up" = "/" ] && { echo "no machinery/plugin.sh above $here" >&2; exit 1; }
    up="$(dirname "$up")"
done
exec sh "$up/machinery/plugin.sh" "$here" "$@"
