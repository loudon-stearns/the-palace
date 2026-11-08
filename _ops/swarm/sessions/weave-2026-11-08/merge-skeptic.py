#!/usr/bin/env python3
"""Weave 2026-11-08 — merge the readers' link proposals with the skeptic's verdicts into the decision surface.
Reads workers/C1a-bare-links.json, workers/C1b-unsaid-links.json, workers/I-induction.json and skeptic/*-verdicts.json.
Writes:
  pile-a-ops.json   — PASSed labels / retypes / cuts / pair-folds / newcomer adds that need no new sentence (apply.py ops; Loudon samples)
  pile-b.json       — FAILed proposals with the skeptic's 'better', 'sentence' verdicts, adds that need a sentence, low-confidence items: Loudon's eye
  unjudged.json     — proposals no skeptic ruled on (re-dispatch or hand-rule)
Prints pass rates per op kind."""
import json, glob, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
W, SK = os.path.join(HERE, "workers"), os.path.join(HERE, "skeptic")

def load(p):
    p = os.path.join(W, p)
    return json.load(open(p)) if os.path.exists(p) else {}

verdicts = {}
for f in glob.glob(os.path.join(SK, "*-verdicts.json")):
    for v in json.load(open(f)).get("verdicts", []):
        verdicts[(v["source"], v["target"])] = v
        verdicts[(v["source"], v["target"], v.get("op", ""))] = v

def rule(src, tgt, op):
    return verdicts.get((src, tgt, op)) or verdicts.get((src, tgt)) or verdicts.get((tgt, src))

rates = collections.defaultdict(lambda: [0, 0])
pile_a, pile_b, unjudged = [], [], []

def weak_to_op(w):
    v = w["verdict"]
    if v == "label":  return {"op": "label", "source": w["source"], "target": w["target"], "type": w["current_type"], "label": w.get("proposed_label")}
    if v == "retype": return {"op": "retype", "source": w["source"], "target": w["target"], "from_type": w["current_type"], "type": w["proposed_type"], "label": w.get("proposed_label") or None}
    if v == "cut":    return {"op": "remove", "source": w["source"], "target": w["target"], "type": w["current_type"]}
    return None

for lane in ("C1a-bare-links.json", "C1b-unsaid-links.json", "I-induction.json"):
    d = load(lane)
    for w in d.get("weak_links", []):
        if w["verdict"] in ("keep-as-is",): continue
        if w["verdict"] == "sentence":
            pile_b.append({"kind": "sentence", "lane": lane, **w}); continue
        op = weak_to_op(w)
        if op is None: continue
        v = rule(w["source"], w["target"], w["verdict"] if w["verdict"] != "cut" else "cut")
        if v is None: unjudged.append({"lane": lane, **w}); continue
        rates[op["op"]][1] += 1
        if str(v.get("verdict", "")).upper().startswith("PASS") and w.get("confidence") != "low":
            rates[op["op"]][0] += 1; pile_a.append({**op, "lane": lane, "rationale": w.get("rationale")})
        else:
            pile_b.append({"kind": "weak-" + w["verdict"], "lane": lane, **w, "skeptic": v.get("verdict"), "skeptic_reason": v.get("reason"), "skeptic_better": v.get("better")})
    for r in d.get("typed_relations", []):
        v = rule(r["source"], r["target"], "add")
        if v is None: unjudged.append({"lane": lane, **r}); continue
        rates["add"][1] += 1
        ok = str(v.get("verdict", "")).upper().startswith("PASS")
        if ok and not r.get("needs_sentence") and r.get("confidence") != "low":
            rates["add"][0] += 1
            pile_a.append({"op": "add", "source": r["source"], "target": r["target"], "type": r["proposed_type"], "label": r.get("proposed_label") or None, "lane": lane, "rationale": r.get("rationale")})
        else:
            if ok: rates["add"][0] += 1
            pile_b.append({"kind": "add", "lane": lane, **r, "skeptic": v.get("verdict"), "skeptic_reason": v.get("reason"), "skeptic_better": v.get("better")})
    for pj in d.get("pair_judgments", []):
        k = pj["keep"]; dr = pj["drop"]
        v = rule(k["source"], k["target"], "pair")
        if v is None: unjudged.append({"lane": lane, "pair": pj}); continue
        rates["pair"][1] += 1
        if str(v.get("verdict", "")).upper().startswith("PASS"):
            rates["pair"][0] += 1
            pile_a.append({"op": "remove", "source": dr["source"], "target": dr["target"], "type": dr["type"], "lane": lane, "rationale": "pair fold: " + pj.get("rationale", "")})
            if k.get("label"):
                pile_a.append({"op": "label", "source": k["source"], "target": k["target"], "type": k["type"], "label": k["label"], "lane": lane, "rationale": "pair fold: label kept/set"})
        else:
            pile_b.append({"kind": "pair", "lane": lane, **pj, "skeptic": v.get("verdict"), "skeptic_reason": v.get("reason"), "skeptic_better": v.get("better")})

json.dump(pile_a, open(os.path.join(HERE, "pile-a-ops.json"), "w"), indent=1, ensure_ascii=False)
json.dump(pile_b, open(os.path.join(HERE, "pile-b.json"), "w"), indent=1, ensure_ascii=False)
json.dump(unjudged, open(os.path.join(HERE, "unjudged.json"), "w"), indent=1, ensure_ascii=False)
print("skeptic verdicts read:", len({k for k in verdicts if len(k) == 2}))
for k, (p, n) in sorted(rates.items()): print(f"  {k:7} PASS {p}/{n} = {100*p/max(1,n):.0f}%")
print(f"pile A ops: {len(pile_a)} · pile B items: {len(pile_b)} · unjudged: {len(unjudged)}")
