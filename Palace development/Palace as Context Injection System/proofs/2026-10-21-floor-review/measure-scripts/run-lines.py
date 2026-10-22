#!/usr/bin/env python3
"""run-lines.py <batch> [<batch> …] — the suite ledger's run line for every birth of each batch, in the form the
Self-Describing Knowledge Module — tuning ledger's `standards.line` asks for, read from runs/*checks.json and
*grade.json. Prints lines only; the ledger's writer places them."""
import glob, json, os, re, subprocess, sys

root = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True).stdout.strip()
runs = os.path.join(root, "_ops", "self-description-test", "runs")
MODEL = {"claude-opus-5-5": "Opus 5.5", "claude-fable-5-1": "Fable 5.1", "claude-sonnet-5-5": "Sonnet 5.5"}
TAUGHT = os.environ.get("TAUGHT", "nothing new")

def birth_no(f):
    return int(re.search(r"birth-(\d+)", f).group(1))

for batch in sys.argv[1:]:
    for f in sorted(glob.glob(os.path.join(runs, "*checks.json")), key=birth_no):
        d = json.load(open(f))
        r, b = d.get("run", {}), d.get("birth", {})
        if r.get("batch") != batch:
            continue
        cap = "no cap" if r.get("budget_usd") in ("none", None) else f"cap ${r['budget_usd']}"
        head = (f"- run · {os.path.basename(f)[:10]} · birth-{birth_no(f)} · {r['scenario']} on {r['source_commit'][:8]}, "
                f"{MODEL.get(r['model'], r['model'])}, Claude Code {b.get('claude_code')}, effort {r.get('effort')}, "
                f"certified memory-free, {cap}, ${d['result']['cost_usd']:.2f}")
        g = f.replace(" — checks.json", " — grade.json")
        if os.path.exists(g):
            gd = json.load(open(g))
            pts = [p["verdict"] for p in gd["grade"].get("points", [])]
            gr = gd["grader"]
            tail = (f"graded {gd['grade']['verdict']} ({pts.count('held')} of {len(pts)} points held) by grader "
                    f"{gr['version']} ({MODEL.get(gr['model'], gr['model'])}, {gr['effort']}), ${gd['cost_usd']:.2f}")
        else:
            v = d.get("verdict") or {}
            tail = ("held by the check" if v.get("held") else "not held by the check") if v else "not graded"
        print(f"{head}; {tail} · batch {batch}, rep {r.get('rep')} · {TAUGHT}")
