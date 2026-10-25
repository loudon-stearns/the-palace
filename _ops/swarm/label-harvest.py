#!/usr/bin/env python3
"""
Label Harvest — the connects-to labels propose the next link types (Weave v2.0, Step 3f).

Gathers every `connects-to` label on the newest map, normalises it (lower-case, hyphens to spaces,
a light stem, stop-words dropped) and clusters fuzzily: labels sharing a stem, then labels within a
small edit distance of a cluster's head. Prints the clusters largest first with their members and
the distinct sources that use them. The semantic grouping of the residue — "feeds" beside
"informs" beside "grounds" — is a reader's job; this script hands the reader a sorted corpus, not
a verdict. A new link type is a Schema Ceremony (SCHEMA — Reference §5); nothing here writes.

Usage: python3 _ops/swarm/label-harvest.py [--map PATH] [--type connects-to] [--min N] [--json] [palace-root]
"""
from __future__ import annotations
import sys, os, re, json, collections, difflib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palace_lib import ROOT_DEFAULT, load_map

STOP = {"the", "a", "an", "of", "to", "in", "on", "for", "and", "as", "its", "is", "by", "with", "from", "at", "that", "this", "it", "one", "two"}
def stem(w):
    for suf in ("ings", "ing", "ers", "ed", "es", "s", "ly", "er"):
        if w.endswith(suf) and len(w) - len(suf) >= 4: return w[: -len(suf)]
    return w
def tokens(label):
    ws = re.split(r"[-_\s/]+", label.lower().strip())
    return [stem(w) for w in ws if w and w not in STOP]

def main(argv):
    root = next((a for a in argv if not a.startswith("--") and os.path.isdir(a)), ROOT_DEFAULT)
    mp = argv[argv.index("--map") + 1] if "--map" in argv else None
    typ = argv[argv.index("--type") + 1] if "--type" in argv else "connects-to"
    mn = int(argv[argv.index("--min") + 1]) if "--min" in argv else 3
    m = load_map(root, mp)
    labels = collections.defaultdict(list)
    for e in m["edges"]:
        if e["type"] == typ and e.get("label"): labels[e["label"].strip()].append(e)
    # pass 1: group by any shared token stem (greedy, largest first)
    by_tok = collections.defaultdict(set)
    for l in labels:
        for t in tokens(l): by_tok[t].add(l)
    assigned = {}; clusters = []
    for t, ls in sorted(by_tok.items(), key=lambda kv: -len(kv[1])):
        free = [l for l in ls if l not in assigned]
        if len(free) < 2: continue
        cid = len(clusters); clusters.append({"head": t, "labels": free})
        for l in free: assigned[l] = cid
    # pass 2: edit-distance join for the unassigned
    for l in labels:
        if l in assigned: continue
        best, score = None, 0
        for c in clusters:
            r = max(difflib.SequenceMatcher(None, l.lower(), x.lower()).ratio() for x in c["labels"])
            if r > score: best, score = c, r
        if best and score >= 0.8: best["labels"].append(l); assigned[l] = clusters.index(best)
        else: clusters.append({"head": l.lower(), "labels": [l]}); assigned[l] = len(clusters) - 1
    rows = []
    for c in clusters:
        edges = [e for l in c["labels"] for e in labels[l]]
        rows.append({"head": c["head"], "labels": sorted(c["labels"], key=lambda l: -len(labels[l])), "edges": len(edges),
                     "sources": len({e["source"] for e in edges}), "targets": len({e["target"] for e in edges})})
    rows.sort(key=lambda r: (-r["edges"], -len(r["labels"])))
    if "--json" in argv:
        print(json.dumps({"map": m["_path"], "type": typ, "labels": len(labels), "clusters": rows}, indent=1, ensure_ascii=False)); return 0
    print(f"label-harvest: map {m['_date']} · {sum(len(v) for v in labels.values())} labelled {typ} links · {len(labels)} distinct labels · {len(rows)} clusters")
    print(f"clusters with ≥ {mn} edges (candidates for a reader's semantic grouping, then Loudon's eye):")
    for r in rows:
        if r["edges"] < mn: break
        ex = ", ".join(r["labels"][:8]) + (" …" if len(r["labels"]) > 8 else "")
        print(f"  {r['edges']:3} edges · {len(r['labels']):3} labels · {r['sources']:3} sources   [{r['head']}]  {ex}")
    singles = sum(1 for r in rows if r["edges"] == 1)
    print(f"summary: {len([r for r in rows if r['edges'] >= mn])} clusters at or above {mn} edges · {singles} labels used once")
    return 0

if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
