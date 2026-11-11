#!/usr/bin/env python3
"""Light round 2026-11, remake of Drift and Consolidation's sawtooth: one real steward's drift, as a series.
The scroll's Now zone reports drift as (steward iteration) minus (the cycle named in the entry footer's
"As of last consolidation: cycle N"), see _ops/stigmergy/orchestrator/src/scroll-file.js. This counts the same number
back through one steward's history. The footer has named two cycles; the commits that set them are given below
(found with: git log -G"As of last consolidation" -- "Projects/Generative Wavetable Libraries.md").
Run from this folder: python3 count-drift-gwl.py   → drift-gwl.json"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MARKERS = [{"cycle": 3, "set": "2026-05-27", "commit": "ca47faaa"}, {"cycle": 9, "set": "2026-06-07", "commit": "9dbe8bcb"}]
when = {}
for line in open(os.path.join(ROOT, "_ops/agents/permanent/generative-wavetable-libraries/history.jsonl")):
    r = json.loads(line)
    if "iteration" in r: when[int(r["iteration"])] = r["ts"][:10]
pts = []
for c in sorted(when):
    if c < MARKERS[0]["cycle"]: continue
    m = max(k["cycle"] for k in MARKERS if k["cycle"] <= c and (k["cycle"] < c or k is MARKERS[0]))   # at cycle 9 the entry had not yet been folded
    pts.append({"cycle": c, "date": when[c], "drift": c - m})
    if any(k["cycle"] == c for k in MARKERS[1:]): pts.append({"cycle": c, "date": when[c], "drift": 0, "fold": True})
json.dump({"project": "Generative Wavetable Libraries", "counted": "2026-11-11", "source": "_ops/agents/permanent/generative-wavetable-libraries/history.jsonl and the entry footer's two markers", "markers": MARKERS, "points": pts},
          open(os.path.join(HERE, "drift-gwl.json"), "w"), indent=1)
print(len(pts), "points;", "latest:", pts[-1])
