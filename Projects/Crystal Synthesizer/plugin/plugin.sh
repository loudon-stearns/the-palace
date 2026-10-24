#!/bin/sh
# ./plugin.sh build | verify | install | validate | hostcheck | editor | all
# Runs VST Template's shared machinery/plugin.sh on this plugin; see that file for each step.
# This plugin lives in a steward's bundle, so machinery/ is looked for above this folder
# and beside it in Projects/VST Template.
here="$(cd "$(dirname "$0")" && pwd)"; up="$here"
while :; do
    [ -f "$up/machinery/plugin.sh" ] && { mach="$up/machinery"; break; }
    [ -f "$up/VST Template/machinery/plugin.sh" ] && { mach="$up/VST Template/machinery"; break; }
    [ "$up" = "/" ] && { echo "no machinery/plugin.sh above $here" >&2; exit 1; }
    up="$(dirname "$up")"
done
exec sh "$mach/plugin.sh" "$here" "$@"
