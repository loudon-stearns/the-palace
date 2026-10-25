#!/usr/bin/env python3
"""
Link-Pairs Linter — one link per pair (Weave v2.0, Step 3d; tuning item 29).

A pair of entries carries one typed link. A symmetric link is stated once; a `connects-to`
beside a more specific link is folded into it; only a direct lineage reciprocal keeps two
(`spawned` ↔ `emerged-from` / `exemplifies` / `member-of` / `deepens`, `enables` ↔ the same),
and only where the two point in consistent opposite directions.

Reads the newest map (`_ops/maps/palace-map-full-*.json`). Reports, per pair:
  W0  exact duplicate        — same source, type and target twice
  W1  symmetric stated twice — one symmetric type written on both sides
  W2  weaker beside specific — a `connects-to` beside a more specific link
  W3  two specific types     — judgment: which one is the relation?
  ok  lineage reciprocal     — allowed, not printed unless --all
Detection is mechanical; the fold is proposed, never written here. `--json` emits the
proposals (keep / drop / label) for the Weave's writer. Flag-only: exits 0 until two clean
runs prove the rule mechanical (Weave Ceremony, the note on judgment).

Usage: python3 _ops/swarm/lint-link-pairs.py [--map PATH] [--json] [--all] [palace-root]
"""
from __future__ import annotations
import sys, os, json, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palace_lib import ROOT_DEFAULT, load_map, SYMMETRIC, FORWARD, BACKWARD

def classify(edges):
    """edges: list of edge dicts for one unordered pair."""
    types = [e["type"] for e in edges]
    if len(edges) == 2 and edges[0]["source"] == edges[1]["source"] and types[0] == types[1]:
        return "W0", "exact duplicate"
    if len(edges) == 2 and types[0] == types[1] and types[0] in SYMMETRIC:
        return "W1", "symmetric stated twice"
    specific = [e for e in edges if e["type"] != "connects-to"]
    generic = [e for e in edges if e["type"] == "connects-to"]
    if generic and specific:
        return "W2", "connects-to beside a specific link"
    if len(edges) == 2:
        a, b = edges
        fa, fb = a["type"] in FORWARD, b["type"] in FORWARD
        ba, bb = a["type"] in BACKWARD, b["type"] in BACKWARD
        # consistent lineage: forward A→B and backward B→A (or backward A→B with forward B→A)
        if (fa and bb and a["source"] == b["target"] and a["target"] == b["source"]) or \
           (ba and fb and a["source"] == b["target"] and a["target"] == b["source"]):
            return "ok", "lineage reciprocal"
        if fa and fb and a["source"] != b["source"]:
            return "W3", "both forward, opposite directions"
    return "W3", "two specific types"

def proposal(code, edges):
    """Deterministic fold for W0/W1/W2; W3 returns None (judgment)."""
    def labelled(e): return bool(e.get("label"))
    if code == "W0":
        keep = max(edges, key=lambda e: len(e.get("label") or ""))
        return {"keep": keep, "drop": [e for e in edges if e is not keep]}
    if code == "W1":
        a, b = edges
        if labelled(a) and labelled(b) and a["label"] != b["label"]:
            return {"keep": None, "drop": [], "judgment": f"two labels: {a['label']!r} / {b['label']!r}"}
        keep = a if labelled(a) or not labelled(b) else b
        return {"keep": keep, "drop": [e for e in edges if e is not keep]}
    if code == "W2":
        specific = [e for e in edges if e["type"] != "connects-to"]
        generic = [e for e in edges if e["type"] == "connects-to"]
        if len(specific) > 1:
            return {"keep": None, "drop": generic, "judgment": "two specific links remain"}
        keep = dict(specific[0])
        carry = next((g["label"] for g in generic if g.get("label")), "")
        if not keep.get("label") and carry: keep["carry_label"] = carry
        return {"keep": keep, "drop": generic}
    return None

def main(argv):
    root = next((a for a in argv if not a.startswith("--") and os.path.isdir(a)), ROOT_DEFAULT)
    mp = argv[argv.index("--map") + 1] if "--map" in argv else None
    m = load_map(root, mp)
    pairs = collections.defaultdict(list)
    for e in m["edges"]:
        pairs[frozenset((e["source"], e["target"]))].append(e)
    rows = []
    for k, es in pairs.items():
        if len(es) < 2: continue
        code, why = classify(es)
        rows.append({"code": code, "why": why, "edges": es, "proposal": proposal(code, es)})
    counts = collections.Counter(r["code"] for r in rows)
    if "--json" in argv:
        print(json.dumps({"map": m["_path"], "counts": counts, "pairs": rows}, indent=1, ensure_ascii=False)); return 0
    print(f"link-pairs: map {m['_date']} · {len(m['edges'])} edges · {len(rows)} pairs with more than one link")
    for code in ("W0", "W1", "W2", "W3", "ok"):
        if code == "ok" and "--all" not in argv: continue
        for r in sorted((r for r in rows if r["code"] == code), key=lambda r: r["edges"][0]["source"]):
            es = r["edges"]
            line = " | ".join(f"{e['source']} -{e['type']}{'['+e['label']+']' if e.get('label') else ''}-> {e['target']}" for e in es)
            print(f"  {code}  {r['why']:34} {line}")
    print(f"summary: W0 exact {counts['W0']} · W1 symmetric-twice {counts['W1']} · W2 weaker-beside-specific {counts['W2']} · W3 judgment {counts['W3']} · ok lineage {counts['ok']}")
    return 0

if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
