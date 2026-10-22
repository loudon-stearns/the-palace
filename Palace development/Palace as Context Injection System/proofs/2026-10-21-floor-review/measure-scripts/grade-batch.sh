#!/bin/zsh
# grade-batch.sh <batch> — grade every judged birth of one suite batch that has no grade yet, one at a time,
# with the suite's pinned grader (grade.mjs). Mechanical scenarios (A1) carry their verdict in checks.json already.
PALACE="${PALACE:-$(git rev-parse --show-toplevel)}"
RUNS="$PALACE/_ops/self-description-test/runs"
batch="$1"; [ -n "$batch" ] || { echo "usage: grade-batch.sh <batch>"; exit 1; }
for f in "$RUNS"/*" — checks.json"; do
  python3 -c "import json,sys; d=json.load(open(sys.argv[1])); r=d.get('run',{}); sys.exit(0 if r.get('batch')==sys.argv[2] and r.get('tellBy')=='judgment' else 1)" "$f" "$batch" || continue
  g="${f% — checks.json} — grade.json"
  [ -f "$g" ] && { echo "graded already: ${f:t}"; continue; }
  node "$PALACE/_ops/self-description-test/grade.mjs" "$f" || echo "GRADE FAILED: ${f:t}"
done
