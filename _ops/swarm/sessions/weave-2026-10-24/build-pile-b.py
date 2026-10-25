#!/usr/bin/env python3
"""Weave 2026-10-24 — assemble checkpoint 2 (Pile B) for Loudon from the synthesis, the skeptic, the stage candidates,
the flag dispositions and the folder rooms' memory/merge/compost/nested-canon findings. Writes checkpoint-2-for-loudon.md."""
import json, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
L = lambda f: json.load(open(os.path.join(HERE, f))) if os.path.exists(os.path.join(HERE, f)) else {}
d = L("synthesis-data.json"); pb = L("pile-b-links.json"); st = L("stage-candidates.json"); fd = L("flag-dispositions.json")
ops = L("phase2b-ops.json"); newl = L("phase2b-newlinks.json")
out = ["---", 'title: "Weave 2026-10-24 — checkpoint 2 for Loudon"', "born: 2026-10-24", "links:", '  - target: "[[Weave Ceremony]]"', "    type: connects-to", "    label: decision-surface",
       'forward_vector: "I am the second sitting of the October weave: Pile A sampled (the skeptic-passed labels, retypes and cuts), and Pile B for Loudon\'s eye — what the readers and the skeptic disagreed on, the stages, the Contexts, the merges, the flag dispositions and the rich-face nominations."', "---", "", "# Checkpoint 2 — Pile A sampled, Pile B for your eye", ""]
c = collections.Counter(o["op"] for o in ops) if isinstance(ops, list) else {}
out += ["## Pile A — one yes, sampled", f"{len(ops)} frontmatter changes the skeptic passed or that ride on the labels' standing order: {c.get('label',0)} labels on bare links, {c.get('retype',0)} retypes, {c.get('remove',0)} cuts; plus {len(newl)} new links the skeptic passed. Ten at random:"]
import random; random.seed(20261024)
for o in random.sample(ops, min(10, len(ops))) if isinstance(ops, list) and ops else []:
    out.append(f"- {o['op']}: {o['source']} —{o.get('from_type') or o['type']}→ {o['target']}" + (f" → {o['type']}" if o['op']=='retype' else "") + (f" [{o.get('label')}]" if o.get('label') else "") + f" — {o.get('why','')[:140]}")
out += ["", "## Pile B — needs your eye", ""]
out += ["### 1. Where the skeptic refuted a reader (the link stays as it was unless you say otherwise)"]
for f in pb.get("failed", [])[:60]:
    out.append(f"- {f['op']}: {f['source']} —{f.get('from_type') or f['type']}→ {f['target']}" + (f" [{f.get('label')}]" if f.get('label') else "") + f" — skeptic: {str(f.get('skeptic_reason',''))[:160]}" + (f" · better: {f['skeptic_better']}" if f.get('skeptic_better') else ""))
out += ["", "### 2. Stage transitions proposed", "seed/sprout → growing (over 900 words or ten inbound links):"]
for r in st.get("up", []): out.append(f"- {r[0]} ({r[1]} {r[2]}, {r[3]} words, inbound {r[4]})")
out += ["growing → mature? (inbound ≥ 25, over 900 words; your call):"]
for r in st.get("mature", []): out.append(f"- {r[0]} (inbound {r[4]}, {r[3]} words)")
out += ["", "### 3. Hub promotions (top inbound decile, not typed hub) — see weave-health's cut", "", "### 4. Entry-health flags from the rooms (stage or vector)"]
for h in d.get("entry_health", [])[:80]:
    out.append(f"- {h.get('entry')}: " + (f"stage {h.get('stage_current')} → {h.get('stage_proposed')}; " if h.get('stage_proposed') else "") + (f"vector: {str(h.get('vector_issue'))[:120]}; " if h.get('vector_issue') else "") + str(h.get('note',''))[:140])
out += ["", "### 5. Memory the folder rooms say pages need"]
for m in d.get("memory_needs", []): out.append(f"- {m.get('entry')} needs {m.get('needs')}: {str(m.get('why',''))[:160]}")
out += ["", "### 6. Merge and compost candidates"]
for m in d.get("merge", []): out.append(f"- merge {m.get('absorb')} → into {m.get('into')}: {str(m.get('rationale',''))[:160]}")
for m in d.get("compost", []): out.append(f"- compost {m.get('entry')}: {str(m.get('rationale',''))[:160]}")
out += ["", "### 7. Nested canon or substrate (bundle-hygiene W1)"]
for n in d.get("nested_canon", []): out.append(f"- {n.get('entry')}: {n.get('verdict')} — {str(n.get('reason',''))[:140]}")
out += ["", "### 8. Entry-flag dispositions deferred to you"]
for x in (fd.get("dispositions") or []):
    if x.get("verdict") == "DEFER-TO-LOUDON": out.append(f"- {x['id']}: {str(x.get('what',''))[:160]} — {str(x.get('reason',''))[:120]}")
out += ["", "### 9. Lighter prose (proposals, each quoting the passage) — count only here; the list is in synthesis-data.json", f"{len(d.get('lighter_prose', []))} proposals across the rooms."]
open(os.path.join(HERE, "checkpoint-2-for-loudon.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("checkpoint-2-for-loudon.md written:", len(out), "lines")
