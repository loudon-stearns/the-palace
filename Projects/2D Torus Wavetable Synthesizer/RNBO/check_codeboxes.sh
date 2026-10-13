#!/bin/sh
# check_codeboxes.sh — run every codebox in this folder against its
# reference before anyone opens Max. Two mirrors, one command:
#   codebox_mirror.mjs      torus_2d_hopf.codebox vs the browser engine
#   codebox_mirror_all.mjs  lookup, tier-1 warps, kuramoto, bank vs the
#                           Python scripts that made their auditions
# Reports land beside this file as codebox_mirror_report.json and
# codebox_mirror_all_report.json. Needs python3 + numpy and node.
set -e
cd "$(dirname "$0")"
refs="${TMPDIR:-/tmp}/torus_mirror_refs"
python3 reference_renders.py "$refs"
node codebox_mirror.mjs
node codebox_mirror_all.mjs "$refs"
