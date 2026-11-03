#!/usr/bin/env python3
"""
verify-triples.py — check every cited edge in a text against the map.

An agent that holds the map in context cites edges as triples:
  [Source | relation | Target]
This finds every such triple in the given text and says which are real
edges in the named build. Grown from the map-agent test's verify.py
([[Palace Map — proof — map-agent-test]]); the rule it enforces: an edge
is cited as a triple and checked, never trusted from a read.

  python3 _ops/swarm/verify-triples.py <file> [<file> …] [--map <build.json>] [--json]
  … | python3 _ops/swarm/verify-triples.py -          # read stdin

Default build: the newest _ops/maps/palace-map-full-*.json. Prints
"<ok>/<total> triples real" and one FAKE line per triple the map lacks,
saying whether its nodes exist. Exit 1 when any triple is fake.
"""
import argparse, glob, json, os, re, sys

PALACE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAPS = os.path.join(PALACE, "_ops", "maps")
TRIPLE = re.compile(r"\[([^\[\]|]+)\|([^\[\]|]+)\|([^\[\]|]+)\]")

def newest_map():
    files = sorted(glob.glob(os.path.join(MAPS, "palace-map-full-*.json")))
    if not files:
        sys.exit("no palace map JSON in _ops/maps/")
    return files[-1]

def load(path):
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    return {(e["source"], e["type"], e["target"]) for e in d["edges"]}, {n["id"] for n in d["nodes"]}, d["meta"].get("generated", "?")

def check(text, edges, ids):
    found = [(a.strip(), r.strip(), b.strip()) for a, r, b in TRIPLE.findall(text)]
    rows = []
    for a, r, b in found:
        real = (a, r, b) in edges
        missing = [x for x in (a, b) if x not in ids]
        rows.append({"source": a, "relation": r, "target": b, "real": real,
                     "missing_nodes": missing})
    return rows

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+", help="text files to check, or - for stdin")
    ap.add_argument("--map", help="a specific build (default: newest in _ops/maps/)")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    path = a.map or newest_map()
    edges, ids, gen = load(path)
    report, any_fake = [], False
    for f in a.files:
        text = sys.stdin.read() if f == "-" else open(f, encoding="utf-8").read()
        rows = check(text, edges, ids)
        ok = sum(r["real"] for r in rows)
        any_fake |= ok < len(rows)
        report.append({"file": f, "real": ok, "total": len(rows), "triples": rows})
    if a.json:
        print(json.dumps({"map": os.path.relpath(path, PALACE), "built": gen, "files": report}, ensure_ascii=False, indent=1))
    else:
        print(f"map: {os.path.relpath(path, PALACE)}  (built {gen})")
        for r in report:
            print(f"{r['file']}: {r['real']}/{r['total']} triples real")
            for t in r["triples"]:
                if not t["real"]:
                    why = "nodes exist" if not t["missing_nodes"] else "missing node: " + ", ".join(t["missing_nodes"])
                    print(f"  FAKE [{t['source']} | {t['relation']} | {t['target']}]  ({why})")
    sys.exit(1 if any_fake else 0)

if __name__ == "__main__":
    main()
