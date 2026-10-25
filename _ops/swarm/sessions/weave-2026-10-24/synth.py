#!/usr/bin/env python3
"""Weave 2026-10-24 — synthesis of the worker rooms (workers/<lens>/<id>.json) into one decision surface.
Outputs synthesis-data.json with: weak-link verdicts folded to ops (label / retype / remove) and conflicts
(one link judged twice, differently); typed relations deduped against the map and the one-link-per-pair rule;
lighter-prose proposals; entry-health flags; memory needs; merge/compost; coherence findings; nested-canon verdicts.
Everything here is a PROPOSAL until the skeptic passes it and Loudon signs. Usage: python3 synth.py"""
import json, os, glob, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
M = json.load(open(os.path.join(ROOT, "_ops/maps/palace-map-full-2026-10-24.json")))
IDS = {n["id"] for n in M["nodes"]}
PAIR = collections.defaultdict(list)
for e in M["edges"]: PAIR[frozenset((e["source"], e["target"]))].append(e)
SYM = {"connects-to", "mirrors", "contradicts", "couples-with"}
rooms = []
for f in sorted(glob.glob(os.path.join(HERE, "workers", "*", "*.json"))):
    try: j = json.load(open(f)); j["_file"] = os.path.relpath(f, HERE); rooms.append(j)
    except Exception as ex: print("BAD JSON", f, ex)
print(f"rooms read: {len(rooms)}")
verdicts = collections.defaultdict(list)
for r in rooms:
    for w in r.get("weak_links") or []:
        verdicts[(w["source"], w["target"], w.get("current_type") or "connects-to")].append({**w, "_room": r.get("room")})
ops, conflicts, keeps, low = [], [], [], []
for k, vs in verdicts.items():
    kinds = {v["verdict"] for v in vs}
    if len(kinds) > 1: conflicts.append({"link": k, "verdicts": vs}); continue
    v = vs[0]; src, tgt, cur = k
    if v["verdict"] == "cut": ops.append({"op": "remove", "source": src, "target": tgt, "type": cur, "why": v.get("rationale", ""), "_room": v["_room"], "confidence": v.get("confidence")})
    elif v["verdict"] == "label":
        if v.get("proposed_label"): ops.append({"op": "label", "source": src, "target": tgt, "type": cur, "label": v["proposed_label"], "why": v.get("rationale", ""), "_room": v["_room"], "confidence": v.get("confidence"), "evidence": [v.get("evidence_source", ""), v.get("evidence_target", "")]})
        else: low.append({**v, "_why": "label verdict without a label"})
    elif v["verdict"] == "retype":
        if v.get("proposed_type") in SYM | {"enables", "deepens", "spawned", "emerged-from", "exemplifies", "member-of"}:
            ops.append({"op": "retype", "source": src, "target": tgt, "from_type": cur, "type": v["proposed_type"], "label": v.get("proposed_label") or None, "why": v.get("rationale", ""), "_room": v["_room"], "confidence": v.get("confidence"), "evidence": [v.get("evidence_source", ""), v.get("evidence_target", "")]})
        else: low.append({**v, "_why": "retype to an unknown type"})
    elif v["verdict"] == "keep-as-is": keeps.append(v)
    else: low.append({**v, "_why": f"unknown verdict {v['verdict']}"})
# typed relations: dedupe, map check, one link per pair
rel = collections.defaultdict(list)
for r in rooms:
    for t in r.get("typed_relations") or []:
        rel[frozenset((t["source"], t["target"]))].append({**t, "_room": r.get("room")})
new_links, rel_dup, rel_pair_exists, rel_unknown = [], [], [], []
for k, ts in rel.items():
    t = ts[0]
    if t["source"] not in IDS or t["target"] not in IDS: rel_unknown.append(ts); continue
    if k in PAIR and t.get("kind") != "retype": rel_pair_exists.append({"existing": PAIR[k], "proposed": ts}); continue
    (rel_dup if len(ts) > 1 else new_links).append({**t, "_rooms": [x["_room"] for x in ts], "_convergence": len(ts)})
def gather(key):
    out = []
    for r in rooms:
        for x in r.get(key) or []: out.append({**x, "_room": r.get("room")})
    return out
data = {"rooms": [r["_file"] for r in rooms],
        "weak_ops": ops, "weak_conflicts": conflicts, "weak_keeps": keeps, "weak_low": low,
        "new_links_single": new_links, "new_links_convergent": rel_dup, "new_links_pair_exists": rel_pair_exists, "new_links_unknown": rel_unknown,
        "lighter_prose": gather("lighter_prose"), "entry_health": gather("entry_health_flags"), "memory_needs": gather("memory_needs"),
        "merge": gather("merge_candidates"), "compost": gather("compost_candidates"), "coherence": gather("coherence_findings"),
        "open_questions": gather("open_question_resolutions"), "nested_canon": gather("nested_canon"),
        "summaries": {r.get("room"): r.get("summary") for r in rooms}}
json.dump(data, open(os.path.join(HERE, "synthesis-data.json"), "w"), indent=1, ensure_ascii=False)
c = collections.Counter(o["op"] for o in ops)
print(f"weak verdicts: {sum(len(v) for v in verdicts.values())} on {len(verdicts)} links → ops label {c['label']} · retype {c['retype']} · remove {c['remove']} · keep {len(keeps)} · conflicts {len(conflicts)} · low {len(low)}")
print(f"typed relations: new single {len(new_links)} · convergent {len(rel_dup)} · pair already linked {len(rel_pair_exists)} · unknown entry {len(rel_unknown)}")
print(f"lighter prose {len(data['lighter_prose'])} · health flags {len(data['entry_health'])} · memory needs {len(data['memory_needs'])} · merge {len(data['merge'])} · compost {len(data['compost'])} · coherence {len(data['coherence'])} · open questions {len(data['open_questions'])}")
