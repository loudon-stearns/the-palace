#!/usr/bin/env python3
"""Weave 2026-10-24 — merge the skeptic verdicts into the decision surface.
Reads synthesis-data.json (weak_ops, new links) and skeptic/verdicts/*.json. Writes:
  phase2b-ops.json      — PASSed cuts/retypes, PASSed sampled labels, and the unsampled labels (Pile A, sampled by Loudon)
  pile-b-links.json     — FAILed proposals with the skeptic's 'better', conflicts, keeps, low-confidence items: Loudon's eye
  phase2b-newlinks.json — PASSed new links as add ops
Prints the pass rates per op kind, which decide whether the unsampled labels ride Pile A."""
import json, glob, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HERE, "synthesis-data.json")))
ver = {}
for f in glob.glob(os.path.join(HERE, "skeptic/verdicts/*.json")):
    j = json.load(open(f))
    for v in j.get("verdicts", []):
        ver[(v["source"], v["target"], v.get("op") or "")] = v
def key(o): return (o["source"], o["target"], o["op"])
def key2(o): return (o["source"], o["target"], "add")
rates = collections.defaultdict(lambda: [0, 0])
passed, failed, unjudged = [], [], []
for o in d["weak_ops"]:
    v = ver.get(key(o)) or ver.get((o["source"], o["target"], {"remove": "cut", "retype": "retype", "label": "label"}[o["op"]])) or ver.get((o["source"], o["target"], ""))
    if v is None: unjudged.append(o); continue
    rates[o["op"]][1] += 1
    if str(v.get("verdict", "")).upper().startswith("PASS"): rates[o["op"]][0] += 1; passed.append(o)
    else: failed.append({**o, "skeptic_reason": v.get("reason"), "skeptic_better": v.get("better")})
label_rate = rates["label"][0] / max(1, rates["label"][1])
print("skeptic verdicts read:", len(ver))
for k, (p, n) in rates.items(): print(f"  {k:7} PASS {p}/{n} = {100*p/max(1,n):.0f}%")
print(f"unjudged (not in a skeptic set): {len(unjudged)} — labels {sum(1 for o in unjudged if o['op']=='label')}, other {sum(1 for o in unjudged if o['op']!='label')}")
# Unsampled labels: a label is the least destructive op (a register on a link that stays), and Loudon's order is
# "labels or removal is fine", so medium/high-confidence labels ride Pile A (he samples ten); low-confidence ones wait in Pile B.
unl = [o for o in unjudged if o["op"] == "label"]
ops = passed + [o for o in unl if (o.get("confidence") or "medium") != "low"]
others = [o for o in unjudged if o["op"] != "label"] + [o for o in unl if (o.get("confidence") or "medium") == "low"]
newl, newfail = [], []
for t in d["new_links_single"] + d["new_links_convergent"]:
    v = ver.get(key2(t)) or ver.get((t["source"], t["target"], "new")) or ver.get((t["source"], t["target"], ""))
    if v and str(v.get("verdict", "")).upper().startswith("PASS"):
        newl.append({"op": "add", "source": t["source"], "target": t["target"], "type": t["proposed_type"], "label": t.get("proposed_label") or None, "why": t.get("rationale", ""), "_rooms": t.get("_rooms")})
    else: newfail.append({**t, "skeptic": v})
# Guard (skeptic set-04): two cuts on the two sides of one symmetric pair would erase the pair. Keep the first, hold the second.
seen_pairs = {}; guarded = []
for o in list(ops):
    if o["op"] == "remove":
        k = frozenset((o["source"], o["target"]))
        if k in seen_pairs: ops.remove(o); guarded.append({**o, "held_because": f"the other side of this pair is already being cut ({seen_pairs[k]['source']} → {seen_pairs[k]['target']})"})
        else: seen_pairs[k] = o
others += guarded
print(f"pair guard held {len(guarded)} second-side cuts")
json.dump(ops, open(os.path.join(HERE, "phase2b-ops.json"), "w"), indent=1, ensure_ascii=False)
json.dump(newl, open(os.path.join(HERE, "phase2b-newlinks.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"failed": failed, "unjudged_non_label": others, "conflicts": d["weak_conflicts"], "keeps": d["weak_keeps"], "new_links_failed_or_unjudged": newfail,
           "label_pass_rate": label_rate}, open(os.path.join(HERE, "pile-b-links.json"), "w"), indent=1, ensure_ascii=False)
c = collections.Counter(o["op"] for o in ops)
print(f"phase2b ops: {len(ops)} (label {c['label']}, retype {c['retype']}, remove {c['remove']}); low-confidence labels held: {sum(1 for o in others if o['op']=='label')}")
print(f"new links: {len(newl)} pass, {len(newfail)} failed/unjudged · pile-b-links: {len(failed)} failed, {len(others)} unjudged non-label, {len(d['weak_conflicts'])} conflicts")
