#!/usr/bin/env python3
"""
Unsaid Links — the inverse of the unsung path (Weave v2.0, Step 3e).

An unsung path is prose that names a connection the frontmatter never registered. An unsaid
link is the reverse: a frontmatter link whose target the page's body never names — no
`[[wikilink]]`, no title in the text. The link asserts a relation the page gives no reason for.
Worst when the link is also unlabelled: then neither type, label nor prose says why.

Reads every canon entry on the newest map. Reports per entry the unsaid targets, marking
`bare` when the link has no label. Disposition is judgment (Weave Step 3e): write the
sentence, add the label, or cut the link. Flag-only; never gates.

Usage: python3 _ops/swarm/unsaid-links.py [--map PATH] [--json] [--min N] [palace-root]
  --min N   print only entries with N or more unsaid links (default 1)
"""
from __future__ import annotations
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palace_lib import ROOT_DEFAULT, load_map, split_frontmatter, link_targets, canon_nodes

def mentions(body_lc: str, title: str) -> bool:
    t = title.lower()
    if f"[[{t}" in body_lc or t in body_lc: return True
    short = re.split(r" — | - |\(", t)[0].strip()      # "Meaning and the Link (2014)" → "meaning and the link"
    return len(short) >= 6 and short in body_lc

def main(argv):
    root = next((a for a in argv if not a.startswith("--") and os.path.isdir(a)), ROOT_DEFAULT)
    mp = argv[argv.index("--map") + 1] if "--map" in argv else None
    mn = int(argv[argv.index("--min") + 1]) if "--min" in argv else 1
    m = load_map(root, mp)
    ids = {n["id"] for n in m["nodes"]}
    report = []; total = bare = links = 0
    for n in canon_nodes(m):
        p = os.path.join(root, n["path"])
        if not os.path.exists(p): continue
        fm, body = split_frontmatter(open(p, encoding="utf-8").read())
        if not fm: continue
        body_lc = re.sub(r"!\[\[[^\]]*\]\]", "", body).lower()   # the face line is not a mention
        unsaid = []
        for l in link_targets(fm):
            links += 1
            tgt = l["target"]
            if tgt.endswith("— Context") or tgt.endswith("— scroll") or tgt.endswith("— tuning"): continue
            if not mentions(body_lc, tgt):
                unsaid.append({"target": tgt, "type": l["type"], "label": l["label"], "bare": not l["label"], "in_map": tgt in ids})
        if unsaid:
            total += len(unsaid); bare += sum(1 for u in unsaid if u["bare"])
            report.append({"entry": n["id"], "path": n["path"], "unsaid": unsaid, "n": len(unsaid), "n_bare": sum(1 for u in unsaid if u["bare"])})
    report.sort(key=lambda r: (-r["n_bare"], -r["n"]))
    if "--json" in argv:
        print(json.dumps({"map": m["_path"], "links": links, "unsaid": total, "bare_unsaid": bare, "entries": report}, indent=1, ensure_ascii=False)); return 0
    print(f"unsaid-links: map {m['_date']} · {links} frontmatter links read · {total} unsaid ({bare} of them bare: no label either)")
    for r in report:
        if r["n"] < mn: continue
        print(f"  {r['n']:3} unsaid ({r['n_bare']} bare)  {r['entry']}")
        for u in r["unsaid"]:
            print(f"        {'bare ' if u['bare'] else '     '}-{u['type']}{'['+u['label']+']' if u['label'] else ''}-> {u['target']}")
    print(f"summary: {total} unsaid links in {len(report)} entries; {bare} bare (unlabelled and unsaid)")
    return 0

if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
