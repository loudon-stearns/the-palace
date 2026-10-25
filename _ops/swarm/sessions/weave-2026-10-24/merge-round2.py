#!/usr/bin/env python3
"""Weave 2026-10-24 — round 2: the folder rooms' relation proposals the skeptic passed, the two-label pair rulings,
and the entry-flag ACT dispositions that are links → phase2d-ops.json; sentence edits → act-sentences.json."""
import json, glob, os, re, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "_ops", "swarm"))
from palace_lib import load_map, split_frontmatter, link_targets
M = load_map(ROOT); P = {n["id"]: os.path.join(ROOT, n["path"]) for n in M["nodes"] if n.get("path", "").endswith(".md")}
TYPES = {"connects-to","mirrors","enables","deepens","spawned","emerged-from","contradicts","couples-with","exemplifies","member-of"}
def links_of(e):
    p = P.get(e)
    if not p or not os.path.exists(p): return []
    fm, _ = split_frontmatter(open(p, encoding="utf-8").read()); return link_targets(fm or {})
def pair_linked(a, b):
    return [l for l in links_of(a) if l["target"] == b] + [l for l in links_of(b) if l["target"] == a]
def has(a, b, t): return any(l["target"] == b and l["type"] == t for l in links_of(a))
ops, held, sentences = [], [], []
# 1. round-2 skeptic passes
props = {}
for f in glob.glob(os.path.join(HERE, "skeptic/sets2/set-0*.json")):
    for o in json.load(open(f)): props[(o["source"], o["target"])] = o
for f in sorted(glob.glob(os.path.join(HERE, "skeptic/verdicts2/set-0*.json"))):
    for v in json.load(open(f))["verdicts"]:
        if not str(v["verdict"]).upper().startswith("PASS"): continue
        o = props.get((v["source"], v["target"]))
        if not o: held.append({"why": "no proposal found", **v}); continue
        kind = o.get("kind"); label = (v.get("better") or o.get("proposed_label") or None)
        if label and (" " in str(label) and len(str(label)) > 40): label = o.get("proposed_label") or None
        if kind in ("new", "newcomer", "contradiction"):
            if pair_linked(o["source"], o["target"]): held.append({"why": "pair already linked", **o}); continue
            t = o.get("proposed_type") if o.get("proposed_type") in TYPES else "connects-to"
            ops.append({"op": "add", "source": o["source"], "target": o["target"], "type": t, "label": label, "why": "round-2 skeptic PASS: " + str(o.get("rationale", ""))[:120]})
        elif kind == "retype":
            t = o.get("proposed_type"); cur = o.get("current_type") or "connects-to"
            if t not in TYPES: held.append({"why": "unknown type", **o}); continue
            if has(o["source"], o["target"], cur): ops.append({"op": "retype", "source": o["source"], "target": o["target"], "from_type": cur, "type": t, "label": label, "why": "round-2 PASS"})
            elif has(o["target"], o["source"], cur): ops.append({"op": "retype", "source": o["target"], "target": o["source"], "from_type": cur, "type": t, "label": label, "why": "round-2 PASS (edge sits on the other page)"})
            else: held.append({"why": "no such link now", **o})
        elif kind in ("fold", "cut"):
            cur = o.get("current_type") or "connects-to"
            if has(o["source"], o["target"], cur): ops.append({"op": "remove", "source": o["source"], "target": o["target"], "type": cur, "why": "round-2 PASS " + kind})
            else: held.append({"why": "no such link now", **o})
        elif kind == "label":
            cur = o.get("current_type") or "connects-to"
            cl = next((l for l in links_of(o["source"]) if l["target"] == o["target"] and l["type"] == cur), None)
            if not cl: held.append({"why": "no such link now", **o}); continue
            if cl.get("label"): ops.append({"op": "remove", "source": o["source"], "target": o["target"], "type": cur, "why": "relabel"}); ops.append({"op": "add", "source": o["source"], "target": o["target"], "type": cur, "label": label, "why": "relabel"})
            else: ops.append({"op": "label", "source": o["source"], "target": o["target"], "type": cur, "label": label, "why": "round-2 PASS"})
        else: sentences.append({"kind": kind, **o})
# 2. two-label pairs
tl = json.load(open(os.path.join(HERE, "skeptic/verdicts2/two-label-pairs.json")))["pairs"]
for pr in tl:
    a, b, vd = pr["a"], pr["b"], pr["verdict"]
    def drop(e): 
        if has(e["source"], e["target"], e["type"]): ops.append({"op": "remove", "source": e["source"], "target": e["target"], "type": e["type"], "why": f"two-label pair: {vd} — " + str(pr.get("reason", ""))[:100]})
    if vd == "KEEP-A": drop(b)
    elif vd == "KEEP-B": drop(a)
    elif vd == "MERGE":
        keep = a if pr.get("keep_on") == a["source"] else b if pr.get("keep_on") == b["source"] else a
        other = b if keep is a else a
        drop(other)
        if pr.get("label") and pr["label"] != keep.get("label") and has(keep["source"], keep["target"], keep["type"]):
            ops.append({"op": "remove", "source": keep["source"], "target": keep["target"], "type": keep["type"], "why": "relabel (merge)"})
            ops.append({"op": "add", "source": keep["source"], "target": keep["target"], "type": keep["type"], "label": pr["label"], "why": "relabel (merge)"})
    for x in pr.get("also_drop") or []:
        if isinstance(x, dict) and has(x.get("source"), x.get("target"), x.get("type")): ops.append({"op": "remove", "source": x["source"], "target": x["target"], "type": x["type"], "why": "two-label pair: extra link"})
# 3. ACT dispositions that are links
fd = json.load(open(os.path.join(HERE, "flag-dispositions.json")))
rx = re.compile(r"^(.+?) -([a-z\-]+)-> (.+?), label ([A-Za-z0-9\-']+)")
for d in fd["dispositions"]:
    if d["verdict"] != "ACT": continue
    m = rx.match(str(d.get("what", "")).strip())
    if m and m.group(2) in TYPES and m.group(1).strip() in P and m.group(3).strip() in P:
        s, t, tg, lab = m.group(1).strip(), m.group(2), m.group(3).strip(), m.group(4)
        if pair_linked(s, tg): held.append({"why": "ACT link but pair already linked", "id": d["id"], "what": d["what"]}); continue
        ops.append({"op": "add", "source": s, "target": tg, "type": t, "label": lab, "why": f"flag {d['id']} ACT", "_flag": d["id"]})
    else: sentences.append({"id": d["id"], "flag_type": d.get("flag_type"), "what": d.get("what"), "reason": d.get("reason")})
json.dump(ops, open(os.path.join(HERE, "phase2d-ops.json"), "w"), indent=1, ensure_ascii=False)
json.dump(held, open(os.path.join(HERE, "phase2d-held.json"), "w"), indent=1, ensure_ascii=False)
json.dump(sentences, open(os.path.join(HERE, "act-sentences.json"), "w"), indent=1, ensure_ascii=False)
print("phase2d ops", len(ops), collections.Counter(o["op"] for o in ops), "| held", len(held), collections.Counter(h["why"] for h in held), "| sentence edits for writers", len(sentences))
