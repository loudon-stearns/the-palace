"""Does the palace's trail reinforce itself? Visits per entry from git, two windows.
A visit = a commit that touches the entry's page or bundle and touches at most MAXP entries
(a deliberate visit, not a sweep). Rules fixed before reading the result:
  reinforce if P(top quartile in B | top quartile in A) >= 0.40 (chance 0.25)
  and P(cold in B | cold in A) >= 0.50 where cold = zero visits.
"""
import json, subprocess, sys, collections, random

ROOT = sys.argv[1]
MAP = sys.argv[2]
OUT = sys.argv[3]
MAXP = 5
A = ("2026-09-01", "2026-10-07")
B = ("2026-10-07", "2026-11-07")

m = json.load(open(MAP))
nodes = [n for n in m["nodes"] if not n.get("ops_card") and n["path"].endswith(".md")]
born = {}
paths = {}
for n in nodes:
    p = n["path"][:-3]
    paths[n["id"]] = (n["path"], p + "/")
inb = {n["id"]: n["inbound_count"] for n in nodes}

def entries_for(files):
    hit = set()
    for f in files:
        for eid, (page, bundle) in paths.items():
            if f == page or f.startswith(bundle):
                hit.add(eid)
    return hit

def visits(since, until):
    out = subprocess.run(["git", "-C", ROOT, "-c", "core.quotepath=off", "log", f"--since={since}", f"--until={until}",
                          "--name-only", "--format=@@%h"], capture_output=True, text=True).stdout
    counts = collections.Counter(); sweeps = 0; kept = 0
    for block in out.split("@@")[1:]:
        lines = [l for l in block.splitlines()[1:] if l.strip()]
        e = entries_for(lines)
        if not e: continue
        if len(e) > MAXP: sweeps += 1; continue
        kept += 1
        for x in e: counts[x] += 1
    return counts, kept, sweeps

# entries that existed at the start of A
def existed(eid):
    page = paths[eid][0]
    r = subprocess.run(["git", "-C", ROOT, "log", "--diff-filter=A", "--format=%ad", "--date=short", "--follow", "--", page],
                       capture_output=True, text=True).stdout.split()
    return bool(r) and min(r) < A[0]

ids = [e for e in paths if existed(e)]
ca, ka, sa = visits(*A)
cb, kb, sb = visits(*B)
rows = [{"id": e, "a": ca.get(e, 0), "b": cb.get(e, 0), "inbound": inb[e]} for e in ids]

def quart(key):
    s = sorted(rows, key=lambda r: (r[key], random.random()))
    q = len(s) // 4
    return {r["id"] for r in s[-q:]}
random.seed(1)
topA, topB = quart("a"), quart("b")
topIn = quart("inbound")
coldA = [r for r in rows if r["a"] == 0]
res = {
    "windows": {"A": A, "B": B}, "maxp": MAXP, "n": len(rows),
    "commits": {"A": [ka, sa], "B": [kb, sb]},
    "top_stays_top": len(topA & topB) / len(topA),
    "linked_top_is_hot": len(topIn & topB) / len(topIn),
    "cold_n": len(coldA),
    "cold_stays_cold": (sum(1 for r in coldA if r["b"] == 0) / len(coldA)) if coldA else None,
    "rows": rows,
}
json.dump(res, open(OUT, "w"), indent=1)
print({k: v for k, v in res.items() if k != "rows"})
