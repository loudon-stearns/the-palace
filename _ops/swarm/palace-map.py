#!/usr/bin/env python3
"""
palace-map.py — read the Palace Map from where you stand.

The map is a dated edge list (`_ops/maps/palace-map-full-<date>.json`, built by
the Map Build Ceremony). Whole, it is too large to be born with; this tool hands
an agent the part it stands in. Every answer names the map it read, so a stale
read is never silent. No entry body is ever opened.

Verbs:
  near "<Entry>" [--hops N] [--limit N]   the ring around an entry
  path "<A>" "<B>"                        shortest typed path (undirected)
  hubs [--n N]                            highest inbound degree
  quiet [--n N]                           high degree, low recent use
  ghosts [--persistent]                   forward ghosts; those in the last three maps
  diff <date> <date>                      what changed between two builds
  list                                    every node, type and stage

Flags: --json (machine-readable, same data) · --map <path> (a specific build)

Edges print one per line, never as "X: a, b, c" — no node is the parent of
another ([[Palace Map]] § Format and the Reading Agent).
"""

import argparse, glob, json, os, sys
from collections import deque

PALACE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAPS = os.path.join(PALACE, "_ops", "maps")


# ---------------------------------------------------------------- loading

def map_files():
    return sorted(glob.glob(os.path.join(MAPS, "palace-map-full-*.json")))

def map_for_date(date):
    p = os.path.join(MAPS, f"palace-map-full-{date}.json")
    if not os.path.exists(p):
        sys.exit(f"no map for {date} in _ops/maps/ (have: {', '.join(dates())})")
    return p

def dates():
    return [os.path.basename(f)[len("palace-map-full-"):-len(".json")] for f in map_files()]

def load(path=None):
    if path is None:
        files = map_files()
        if not files:
            sys.exit("no palace map JSON in _ops/maps/ — run the newest _ops/swarm/build-map-*.py")
        path = files[-1]
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    d["_path"] = path
    d["_nodes"] = {n["id"]: n for n in d["nodes"]}
    adj = {}
    for e in d["edges"]:
        adj.setdefault(e["source"], []).append(("out", e))
        adj.setdefault(e["target"], []).append(("in", e))
    d["_adj"] = adj
    return d

def header(d):
    gen = d["meta"].get("generated", "?")
    return f"map: {os.path.relpath(d['_path'], PALACE)}  (built {gen}, {len(d['nodes'])} nodes, {len(d['edges'])} edges)"

def resolve(d, name):
    if name in d["_nodes"]:
        return name
    low = name.lower()
    exact = [k for k in d["_nodes"] if k.lower() == low]
    if exact:
        return exact[0]
    close = [k for k in d["_nodes"] if low in k.lower()]
    msg = f"'{name}' is not a node in this map"
    if close:
        msg += ". Did you mean: " + ", ".join(sorted(close)[:8])
    sys.exit(msg)

def recent_use(n):
    return (n.get("use") or {}).get("recent", {}).get("use", 0)

def degree(n):
    return n.get("inbound_count", 0) + n.get("outbound_count", 0)

GHOST = {"type": "ghost", "stage": None, "inbound_count": 0, "outbound_count": 0}

def node(d, k):
    """A node's record, or a ghost stub for an edge target no node matches
    (a bundle file, or a page not yet written)."""
    return d["_nodes"].get(k, {**GHOST, "id": k})

def node_tag(n):
    return f"{n.get('type','?')}/{n.get('stage','?')} in:{n.get('inbound_count',0)} out:{n.get('outbound_count',0)} use90:{recent_use(n)}"


# ---------------------------------------------------------------- verbs

def ring(d, home, hops):
    """BFS to `hops`; returns {node: distance} and the edges inside the ring."""
    dist = {home: 0}
    q = deque([home])
    while q:
        x = q.popleft()
        if dist[x] >= hops:
            continue
        for _, e in d["_adj"].get(x, []):
            y = e["target"] if e["source"] == x else e["source"]
            if y not in dist:
                dist[y] = dist[x] + 1
                q.append(y)
    inside = set(dist)
    edges = [e for e in d["edges"] if e["source"] in inside and e["target"] in inside]
    return dist, edges

def verb_near(d, a):
    home = resolve(d, a.entry)
    dist, ring_edges = ring(d, home, a.hops)
    # The text face prints the edges that touch the home — the entry's own in and
    # out — and names the farther ring; JSON carries every edge inside the ring.
    incident = sorted((e for e in d["edges"] if home in (e["source"], e["target"])),
                      key=lambda e: (e["source"] != home, e["source"], e["target"]))
    ghosts = [g for g in d["meta"].get("ghost_taxonomy", {}).get("forward_ghosts", []) if home in g.get("sources", [])]
    if a.json:
        return {"map": d["_path"], "home": home, "hops": a.hops,
                "nodes": {k: {**{f: node(d, k).get(f) for f in ("type", "stage", "inbound_count", "outbound_count")},
                              "distance": v, "use90": recent_use(node(d, k))} for k, v in dist.items()},
                "edges": ring_edges, "forward_ghosts": [g["target"] for g in ghosts]}
    hn = d["_nodes"][home]
    out = [header(d), f"home: {home}  [{node_tag(hn)}]",
           f"ring: {a.hops} hop(s), {len(dist)-1} entries, {len(ring_edges)} edges inside it; {len(incident)} touch the home"]
    rows = [f"{e['source']}  {e['type']}  {e['target']}" + (f"  ({e['label']})" if e.get("label") else "")
            + ("  [file]" if e["target"] not in d["_nodes"] and e["source"] == home else "") for e in incident]
    cap = a.limit
    out += rows[:cap]
    if len(rows) > cap:
        out.append(f"… and {len(rows)-cap} more edges touching the home (raise --limit, or --json)")
    for h in range(2, a.hops + 1):
        far = sorted(k for k, v in dist.items() if v == h)
        if far:
            out.append(f"at {h} hops ({len(far)}): " + ", ".join(far[:40]) + (" …" if len(far) > 40 else ""))
    if ghosts:
        out.append("forward ghosts from here: " + ", ".join(g["target"] for g in ghosts))
    return "\n".join(out)

def verb_path(d, a):
    s, t = resolve(d, a.a), resolve(d, a.b)
    prev = {s: None}
    q = deque([s])
    while q and t not in prev:
        x = q.popleft()
        for _, e in d["_adj"].get(x, []):
            y = e["target"] if e["source"] == x else e["source"]
            if y not in prev:
                prev[y] = (x, e)
                q.append(y)
    if t not in prev:
        return json.dumps({"map": d["_path"], "path": None}) if a.json else f"{header(d)}\nno path from {s} to {t} (they sit in different components)"
    hops = []
    x = t
    while prev[x]:
        x, e = prev[x]
        hops.append(e)
    hops.reverse()
    if a.json:
        return {"map": d["_path"], "from": s, "to": t, "hops": hops}
    out = [header(d), f"{s} → {t}: {len(hops)} hop(s)"]
    for e in hops:
        out.append(f"{e['source']}  {e['type']}  {e['target']}" + (f"  ({e['label']})" if e.get("label") else ""))
    return "\n".join(out)

def verb_hubs(d, a):
    ns = sorted(d["nodes"], key=lambda n: (-n.get("inbound_count", 0), n["id"]))[:a.n]
    if a.json:
        return {"map": d["_path"], "hubs": [{"id": n["id"], "type": n.get("type"), "stage": n.get("stage"),
                                             "inbound": n.get("inbound_count", 0), "outbound": n.get("outbound_count", 0)} for n in ns]}
    return "\n".join([header(d)] + [f"{n.get('inbound_count',0):4d} in  {n['id']}  [{n.get('type')}/{n.get('stage')}]" for n in ns])

def verb_quiet(d, a):
    if not any("use" in n for n in d["nodes"]):
        sys.exit("this map carries no `use` (built before 2026-08-26); rebuild it")
    pool = [n for n in d["nodes"] if degree(n) >= a.min_degree]
    if a.pillar:
        sys.exit("--pillar is not in the map yet (pillars are not a node field); open question in the plan")
    # quiet = well connected, little recent use; rank by degree per unit of recent use
    ns = sorted(pool, key=lambda n: (recent_use(n), -degree(n), n["id"]))[:a.n]
    if a.json:
        return {"map": d["_path"], "window_days": d["meta"].get("use", {}).get("window_days"),
                "quiet": [{"id": n["id"], "type": n.get("type"), "stage": n.get("stage"), "degree": degree(n),
                           "use90": recent_use(n), "last_used": n.get("last_used")} for n in ns]}
    out = [header(d), f"quiet: degree ≥ {a.min_degree}, fewest uses in the last {d['meta'].get('use',{}).get('window_days','90')} days"]
    out += [f"use90:{recent_use(n):3d}  deg:{degree(n):3d}  last:{n.get('last_used','?')}  {n['id']}  [{n.get('type')}/{n.get('stage')}]" for n in ns]
    return "\n".join(out)

def verb_ghosts(d, a):
    fg = d["meta"].get("ghost_taxonomy", {}).get("forward_ghosts", [])
    rows = [(g["target"], g.get("sources", [])) for g in fg]
    persistent = None
    if a.persistent:
        files = map_files()[-3:]
        if len(files) < 3:
            sys.exit(f"persistence needs three maps; {len(files)} on disk")
        sets = []
        for f in files:
            with open(f, encoding="utf-8") as fh:
                m = json.load(fh)
            sets.append({g["target"] for g in m["meta"].get("ghost_taxonomy", {}).get("forward_ghosts", [])})
        persistent = sorted(set.intersection(*sets))
        rows = [r for r in rows if r[0] in persistent]
    if a.json:
        return {"map": d["_path"], "forward_ghosts": [{"target": t, "sources": s} for t, s in rows],
                "persistent_across": [os.path.basename(f) for f in map_files()[-3:]] if a.persistent else None}
    out = [header(d)]
    if a.persistent:
        out.append(f"forward ghosts present in the last three maps ({', '.join(dates()[-3:])}): {len(rows)}")
    else:
        out.append(f"forward ghosts: {len(rows)} (a target no file matches — the palace reaching for a page not yet written)")
    for t, s in sorted(rows):
        out.append(f"{t}  ← {', '.join(s)}")
    return "\n".join(out)

def verb_diff(d, a):
    old, new = load(map_for_date(a.old)), load(map_for_date(a.new))
    on, nn = set(old["_nodes"]), set(new["_nodes"])
    born, gone = sorted(nn - on), sorted(on - nn)
    ek = lambda e: (e["source"], e["type"], e["target"])
    oe, ne = {ek(e) for e in old["edges"]}, {ek(e) for e in new["edges"]}
    formed, dissolved = sorted(ne - oe), sorted(oe - ne)
    stage = [(k, old["_nodes"][k].get("stage"), new["_nodes"][k].get("stage")) for k in sorted(on & nn)
             if old["_nodes"][k].get("stage") != new["_nodes"][k].get("stage")]
    deg = []
    for k in on & nn:
        a0, a1 = old["_nodes"][k].get("inbound_count", 0), new["_nodes"][k].get("inbound_count", 0)
        if abs(a1 - a0) >= a.threshold:
            deg.append((k, a0, a1))
    deg.sort(key=lambda r: -abs(r[2] - r[1]))
    og = {g["target"] for g in old["meta"].get("ghost_taxonomy", {}).get("forward_ghosts", [])}
    ng = {g["target"] for g in new["meta"].get("ghost_taxonomy", {}).get("forward_ghosts", [])}
    if a.json:
        return {"old": old["_path"], "new": new["_path"], "nodes_born": born, "nodes_gone": gone,
                "edges_formed": formed, "edges_dissolved": dissolved, "stage_changes": stage,
                "inbound_changes": deg, "ghosts_closed": sorted(og - ng), "ghosts_new": sorted(ng - og)}
    out = [f"diff {a.old} → {a.new}: {len(on)}→{len(nn)} nodes, {len(oe)}→{len(ne)} edges",
           f"nodes born ({len(born)}): " + (", ".join(born) or "none"),
           f"nodes gone ({len(gone)}): " + (", ".join(gone) or "none"),
           f"edges formed ({len(formed)}):"] + [f"  {s}  {t}  {o}" for s, t, o in formed[:a.limit]]
    if len(formed) > a.limit: out.append(f"  … and {len(formed)-a.limit} more")
    out.append(f"edges dissolved ({len(dissolved)}):")
    out += [f"  {s}  {t}  {o}" for s, t, o in dissolved[:a.limit]]
    if len(dissolved) > a.limit: out.append(f"  … and {len(dissolved)-a.limit} more")
    out.append(f"stage changes ({len(stage)}):")
    out += [f"  {k}: {s0} → {s1}" for k, s0, s1 in stage]
    out.append(f"inbound degree moved by ≥{a.threshold} ({len(deg)}):")
    out += [f"  {k}: {a0} → {a1}" for k, a0, a1 in deg[:a.limit]]
    out.append(f"ghosts closed ({len(og-ng)}): " + (", ".join(sorted(og - ng)) or "none"))
    out.append(f"ghosts new ({len(ng-og)}): " + (", ".join(sorted(ng - og)) or "none"))
    return "\n".join(out)

def verb_list(d, a):
    ns = sorted(d["nodes"], key=lambda n: n["id"])
    if a.json:
        return {"map": d["_path"], "nodes": [{"id": n["id"], "type": n.get("type"), "stage": n.get("stage")} for n in ns]}
    return "\n".join([header(d)] + [f"{n['id']}  [{n.get('type')}/{n.get('stage')}]" for n in ns])


# ---------------------------------------------------------------- cli

def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--json", action="store_true", help="machine-readable output")
    p.add_argument("--map", help="a specific map JSON (default: the newest in _ops/maps/)")
    sub = p.add_subparsers(dest="verb", required=True)

    s = sub.add_parser("near", help="the ring around an entry"); s.add_argument("entry")
    s.add_argument("--hops", type=int, default=2); s.add_argument("--limit", type=int, default=60); s.set_defaults(fn=verb_near)
    s = sub.add_parser("path", help="shortest typed path"); s.add_argument("a"); s.add_argument("b"); s.set_defaults(fn=verb_path)
    s = sub.add_parser("hubs", help="highest inbound degree"); s.add_argument("--n", type=int, default=20); s.set_defaults(fn=verb_hubs)
    s = sub.add_parser("quiet", help="high degree, low recent use"); s.add_argument("--n", type=int, default=20)
    s.add_argument("--min-degree", type=int, default=8); s.add_argument("--pillar"); s.set_defaults(fn=verb_quiet)
    s = sub.add_parser("ghosts", help="forward ghosts"); s.add_argument("--persistent", action="store_true"); s.set_defaults(fn=verb_ghosts)
    s = sub.add_parser("diff", help="what changed between two builds"); s.add_argument("old"); s.add_argument("new")
    s.add_argument("--threshold", type=int, default=3); s.add_argument("--limit", type=int, default=40); s.set_defaults(fn=verb_diff)
    s = sub.add_parser("list", help="every node"); s.set_defaults(fn=verb_list)

    a = p.parse_args()
    d = None if a.verb == "diff" else load(a.map)
    r = a.fn(d, a)
    print(json.dumps(r, ensure_ascii=False, indent=1) if a.json else r)

if __name__ == "__main__":
    main()
