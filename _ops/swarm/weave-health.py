#!/usr/bin/env python3
"""
Weave Health — one row per weave, so health is a trend and not a snapshot (Weave v2.0, Step 6.6).

Reads the newest map and the four scans (lint-link-pairs, unsaid-links, bundle-audit, face count,
the flag board) and prints the health table the Weave report opens with. With --append it adds
the row to the health ledger `_ops/Weave Ceremony/Weave Ceremony — health.md` (SCHEMA — Reference
§6: a ledger that says how it is kept; kind `health`; merge union; trim never), creating the ledger
on first use. The same numbers, run to run, are what tell a weave whether the palace is getting
more nuanced or only more connected.

Usage: python3 _ops/swarm/weave-health.py [--map PATH] [--append] [--label TEXT] [--json] [palace-root]
"""
from __future__ import annotations
import sys, os, re, json, subprocess, datetime, collections, statistics
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palace_lib import ROOT_DEFAULT, load_map, canon_nodes, classify_bundle

LEDGER_REL = os.path.join("_ops", "Weave Ceremony", "Weave Ceremony — health.md")
COLS = ["date", "map", "nodes", "edges", "labelled %", "bare connects-to", "multi-link pairs (dup/weaker)", "unsaid links (bare)",
        "hubs: untyped ≥ decile / typed < median", "no vector", "quiet (deg≥15, unused 90d)", "Context", "scroll", "tuning", "rich", "faces missing",
        "Context owed", "flags open (propagate)", "label"]

def run(root, script, *args):
    out = subprocess.run([sys.executable, os.path.join(root, "_ops", "swarm", script), *args, root], capture_output=True, text=True)
    return out.stdout

def measure(root, mp=None):
    m = load_map(root, mp); nodes = canon_nodes(m); edges = m["edges"]
    labelled = sum(1 for e in edges if e.get("label")); bare = sum(1 for e in edges if e["type"] == "connects-to" and not e.get("label"))
    pairs = json.loads(run(root, "lint-link-pairs.py", "--json", *(["--map", mp] if mp else [])))["counts"]
    unsaid = json.loads(run(root, "unsaid-links.py", "--json", *(["--map", mp] if mp else [])))
    bund = json.loads(run(root, "bundle-audit.py", "--json", *(["--map", mp] if mp else [])))
    inb = sorted(n.get("inbound_count", 0) for n in nodes); decile = inb[int(0.9 * len(inb))]; median = statistics.median(inb)
    untyped = sum(1 for n in nodes if n["type"] != "hub" and n.get("inbound_count", 0) >= decile)
    weak_hubs = sum(1 for n in nodes if n["type"] == "hub" and n.get("inbound_count", 0) < median)
    novec = sum(1 for n in nodes if not n.get("has_forward_vector"))
    quiet = sum(1 for n in nodes if n.get("inbound_count", 0) + n.get("outbound_count", 0) >= 15 and (n.get("use") or {}).get("recent", {}).get("use", 0) == 0)
    faces_missing = sum(1 for n in nodes if not (classify_bundle(root, n["path"])["hero"] and classify_bundle(root, n["path"])["icon"]))
    flags = subprocess.run([sys.executable, os.path.join(root, "_ops", "swarm", "lint-weave-flags.py")], capture_output=True, text=True).stdout
    fo = re.search(r"summary: (\d+) open", flags); prop = len(re.findall(r"^\s+●\s+\S+\s+\[[^\]]+\]\s+home:", flags, re.M))
    t = bund["totals"]
    return {"date": datetime.date.today().isoformat(), "map": m["_date"], "nodes": len(nodes), "edges": len(edges),
            "labelled %": round(100 * labelled / max(1, len(edges))), "bare connects-to": bare,
            "multi-link pairs (dup/weaker)": f"{sum(pairs.values()) - pairs.get('ok', 0)} ({pairs.get('W0', 0) + pairs.get('W1', 0)}/{pairs.get('W2', 0)})",
            "unsaid links (bare)": f"{unsaid['unsaid']} ({unsaid['bare_unsaid']})",
            "hubs: untyped ≥ decile / typed < median": f"{untyped} / {weak_hubs} (decile {decile}, median {int(median)})",
            "no vector": novec, "quiet (deg≥15, unused 90d)": quiet,
            "Context": t["context"], "scroll": t["scroll"], "tuning": t["tuning"], "rich": t["rich"], "faces missing": faces_missing,
            "Context owed": len(bund["context_owed"]), "flags open (propagate)": f"{fo.group(1) if fo else '?'} ({prop})"}

LEDGER_HEAD = '''---
title: "Weave Ceremony — health"
born: 2026-10-24
links:
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: health-for
forward_vector: "I am the Weave's health ledger: one row per weave, the same numbers every time, so the palace can see whether it is growing more nuanced or only more connected. Appended by weave-health.py at each weave's open and close; never pruned."
ledger: health
standards:
  for: "the palace's health, measured the same way at every weave"
  run: "one weave (a row at the open, a row at the close)"
  line: "| <date> | <map> | ... | <label> |"
  read: "the last four rows, against each other"
  writes: "weave-health.py --append, in the commit that records the weave"
  merge: union
  kept: git
  trim: never
---

# Weave Ceremony — health

One row per weave, the open and the close of each, measured by `_ops/swarm/weave-health.py` from the newest map and the four health scans (`lint-link-pairs.py`, `unsaid-links.py`, `bundle-audit.py`, `face-audit.py`) and the flag board. Read the last four rows against each other: the palace is healthier when the labelled share, the Contexts and the rich faces rise while the multi-link pairs, the unsaid links and the owed Contexts fall — not when the edge count does.

'''

def main(argv):
    root = next((a for a in argv if not a.startswith("--") and os.path.isdir(a)), ROOT_DEFAULT)
    mp = argv[argv.index("--map") + 1] if "--map" in argv else None
    label = argv[argv.index("--label") + 1] if "--label" in argv else ""
    r = measure(root, mp); r["label"] = label
    if "--json" in argv: print(json.dumps(r, ensure_ascii=False, indent=1)); return 0
    row = "| " + " | ".join(str(r[c]) for c in COLS) + " |"
    header = "| " + " | ".join(COLS) + " |\n|" + "---|" * len(COLS)
    if "--append" in argv:
        p = os.path.join(root, LEDGER_REL)
        if not os.path.exists(p):
            open(p, "w", encoding="utf-8").write(LEDGER_HEAD + header + "\n" + row + "\n")
        else:
            with open(p, "a", encoding="utf-8") as f: f.write(row + "\n")
        print(f"appended to {LEDGER_REL}")
    print(header); print(row)
    return 0

if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
