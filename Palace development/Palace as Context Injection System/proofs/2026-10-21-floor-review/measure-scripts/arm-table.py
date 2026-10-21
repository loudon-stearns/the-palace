#!/usr/bin/env python3
"""arm-table.py <batch> [<batch> …] — one line per birth of each suite batch: scenario, rep, verdict, the grader's
points held/partly/missed, cost, and the first three tool calls. Reads runs/*checks.json and *grade.json."""
import glob, json, os, subprocess, sys

root = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True).stdout.strip()
runs = os.path.join(root, "_ops", "self-description-test", "runs")
order = ["A1", "D1", "E7", "G4", "G5", "S1"]
for batch in sys.argv[1:]:
    rows = []
    for f in glob.glob(os.path.join(runs, "*checks.json")):
        d = json.load(open(f))
        r = d.get("run", {})
        if r.get("batch") != batch:
            continue
        g = f.replace(" — checks.json", " — grade.json")
        if os.path.exists(g):
            gr = json.load(open(g))["grade"]
            pts = [p["verdict"] for p in gr.get("points", [])]
            verdict = gr["verdict"]
            tally = f'{pts.count("held")}h {pts.count("partly")}p {pts.count("missed")}m'
        else:
            v = d.get("verdict") or {}
            verdict = ("held" if v.get("held") else "missed") if v else "ungraded"
            tally = "mechanical"
        calls = ", ".join(c["tool"] for c in d["calls"][:3])
        rows.append((order.index(r["scenario"]) if r["scenario"] in order else 99, r["scenario"], r.get("rep"), verdict,
                     tally, round(d["result"]["cost_usd"], 2), calls, os.path.basename(f)[:28]))
    print(f"## {batch}  ({len(rows)} births, ${sum(x[5] for x in rows):.2f})")
    for _, sc, rep, verdict, tally, cost, calls, name in sorted(rows):
        print(f"  {sc} rep {rep}  {verdict:8s} {tally:12s} ${cost:<5}  [{calls}]  {name}")
