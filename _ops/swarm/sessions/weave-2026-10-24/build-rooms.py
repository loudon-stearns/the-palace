#!/usr/bin/env python3
"""Weave 2026-10-24 — build one worker prompt per room, from the partitions and the v2.0 Multi-Lens template.
Lenses this weave: hub-nutrition (the floor hubs' weak inbound links), weak-links (bare connects-to by community),
lifecycle (the newcomers' inbound), folder (coherence, Context needs, lighter prose; Shop · _ops · People · Palace development · Projects ×2 · CDR+Modes).
Writes rooms/<lens>/<id>.md. Workers are palace-writer on Sonnet with one write allowed: their own workers/<lens>/<id>.json."""
import json, os, re, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
M = json.load(open(os.path.join(ROOT, "_ops/maps/palace-map-full-2026-10-24.json")))
P = {n["id"]: n["path"] for n in M["nodes"]}; N = {n["id"]: n for n in M["nodes"]}
OUT = {}
for e in M["edges"]: OUT.setdefault(e["source"], []).append(e)
IN = {}
for e in M["edges"]: IN.setdefault(e["target"], []).append(e)
NEW = open(os.path.join(HERE, "new-entries-block.md")).read().strip() if os.path.exists(os.path.join(HERE, "new-entries-block.md")) else "none"

COMMON = """You are a Palace Weave worker (October 2026 weave, Weave Ceremony v2.0). You were born with the Jewel and the World — keep them; they are how you tell a real resemblance from a forced one. Palace root: {root}. Typed links in YAML frontmatter are the semantic web; body wikilinks are the conversational fabric. Values are the goal; the guidelines are orientation, not law.

THE STANDING ORDER (Loudon, 2026-10-24): "all the 'connect to' links are weak, labels or removal is fine, there will be more weaves so if we remove a connection it could come back later. lets bias toward making the links high quality and lesser." A typed link is a claim with a reason: its type, its label, or a sentence in the body. A pair of entries carries ONE link. A link with no reason anywhere is cut; a real connection returns in a later weave with its reason.

YOU PROPOSE; YOU WRITE NOTHING IN THE PALACE. Your one write is your own output file: {outfile} (JSON only, the schema below). Do not edit any page. Do not run git. Read with Read/Grep/Glob; use `command grep -r` in a shell if you need it (plain grep skips ignored files). Find an entry's file by its path given below; a wikilink target resolves by title anywhere in the vault.

SCHEMA §4 link types (direction matters): connects-to (symmetric, general proximity — with a label it is a named class), mirrors (symmetric: same pattern in different material), enables (A→B: A is precondition/generative force for B), deepens (A→B: A elaborates the more foundational B), spawned (A→B: A directly produced B), emerged-from (A→B: A grew from origin B, diffusely), contradicts (symmetric: productive tension), couples-with (symmetric: always active together), exemplifies (A→B: A is an instance of the general B), member-of (A→B: A belongs to collection B). The source of deepens/emerged-from/exemplifies/member-of points BACK at its ground; only spawned and enables point forward. A label is a single word or hyphenated phrase naming the register (see Palace development/Resonant Link Labels.md for words in use). Never invent a new type.

LIGHTER PROSE (Loudon, 2026-09-24; tuning item 39): where a page explains itself at length, analyses its own method, or carries history its git log already holds, propose the simpler statement or the deletion, quoting the passage. "Lighter" means simpler statements of fact and taste, not less content. Propose only.

NEW ENTRIES THIS CYCLE (priority citizens — only a weave can wire their inbound links; propose an inbound link from a page you read only when it is genuine):
{new}
"""

SCHEMA_WEAK = """OUTPUT — write ONLY this JSON to {outfile}:
{{
 "room": "{rid}", "lens": "{lens}", "pages_read": ["..."],
 "weak_links": [{{"source":"X","target":"Y","current_type":"connects-to","verdict":"label|retype|cut|keep-as-is","proposed_type":"(if retype)","proposed_label":"(if label/retype)","evidence_source":"the sentence on X that carries the relation, quoted, or empty","evidence_target":"the sentence on Y, quoted, or empty","rationale":"one sentence","confidence":"high|medium|low"}}],
 "typed_relations": [{{"source":"X","target":"Y","proposed_type":"...","proposed_label":"...","kind":"new|contradiction|retype|newcomer","rationale":"...","evidence_source":"...","evidence_target":"..."}}],
 "entry_health_flags": [{{"entry":"X","stage_current":"...","stage_proposed":"... or null","vector_issue":"... or null","note":"..."}}],
 "lighter_prose": [{{"entry":"X","where":"section","passage":"quoted","proposal":"simplify|delete","words":"the simpler statement, or empty for a deletion"}}],
 "summary": "one paragraph: what you read, what pattern you saw, what you could not settle"
}}
Rules for weak_links: read BOTH pages before a verdict. "label" only when a sentence on at least one page carries the relation and you can name its register in one or two words. "retype" when the relation is really another type (give the direction right). "cut" when neither page gives a reason — say so plainly; a cut is not a loss. "keep-as-is" is allowed only for a link that already has a label and whose reason you found. Every weak link in your list gets a verdict; do not skip any. Do not propose a link that already exists between a pair (the existing links are listed).
"""

def links_block(members):
    ms = set(members); lines = []
    for a in members:
        for e in OUT.get(a, []):
            if e["target"] in ms: lines.append(f"- {a} —{e['type']}{'['+e['label']+']' if e.get('label') else ''}→ {e['target']}")
    return "\n".join(lines) if lines else "none among these members"

def write(lens, rid, text):
    d = os.path.join(HERE, "rooms", lens); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, rid + ".md"), "w", encoding="utf-8").write(text)

def outfile(lens, rid): return os.path.join(HERE, "workers", lens, rid + ".json")

# --- hub-nutrition rooms ---
H = json.load(open(os.path.join(HERE, "partitions/hub-nutrition.json")))
for r in H["clusters"]:
    hub = r["hub"]; rid = r["id"]
    links = "\n".join(f"- {l['source']} ({P.get(l['source'],'?')}) —{l['type']}{'['+l['label']+']' if l.get('label') else ''}→ {hub}   [{'bare' if l['bare'] else 'labelled'}{', unsaid' if l['unsaid'] else ''}]" for l in r["links"])
    body = COMMON.format(root=ROOT, outfile=outfile("hub", rid), new=NEW) + f"""
## YOUR ROOM — {rid}: the floor hub [[{hub}]] and its weak inbound links ({len(r['links'])})
Read the hub WHOLE first: {ROOT}/{P[hub]}. The hub is pointed at by {N[hub]['inbound_count']} pages; a link to a floor hub says almost nothing unless its label does. For EACH link below, open the source page, find the passage (if any) that speaks of the hub or its idea, and give the verdict. 'bare' means no label; 'unsaid' means the source's body never names the hub. A bare, unsaid link to a floor hub with no passage behind it is the standing order's first target: cut it. A real relation gets the label that names its register — the word the source page itself uses — or a retype (e.g. exemplifies when the page is a worked case of the hub's idea; deepens when it elaborates it; emerged-from when it grew out of it).

### THE LINKS
{links}

### OTHER LINKS THE HUB ALREADY HOLDS (do not propose any of these again)
{chr(10).join(f"- {e['source']} —{e['type']}→ {e['target']}" for e in OUT.get(hub, []))}

""" + SCHEMA_WEAK.format(outfile=outfile("hub", rid), rid=rid, lens="hub-nutrition")
    write("hub", rid, body)

# --- weak-link rooms ---
W = json.load(open(os.path.join(HERE, "partitions/weak-links.json")))
for r in W["clusters"]:
    rid = r["id"]; members = [m["id"] for m in r["members"]]
    links = "\n".join(f"- {l['source']} ({P.get(l['source'],'?')}) —{l['type']}{'['+l['label']+']' if l.get('label') else ''}→ {l['target']} ({l.get('target_path') or P.get(l['target'],'?')})   [{'bare' if l['bare'] else 'labelled'}{', unsaid' if l['unsaid'] else ''}]" for l in r["links"])
    body = COMMON.format(root=ROOT, outfile=outfile("weak", rid), new=NEW) + f"""
## YOUR ROOM — {rid}: {len(members)} pages and their {len(r['links'])} weak outbound links
Members: {chr(10)}{chr(10).join(f"- {m['id']} ({m['path']})" for m in r['members'])}

For EACH link below: read the source page and the target page (the relevant parts: frontmatter, the passages that name the other), then give the verdict. 'bare' = no label; 'unsaid' = the source's body never names the target.

### THE LINKS
{links}

### LINKS ALREADY HELD AMONG THESE MEMBERS (a pair carries one link; never add beside one)
{links_block(members)}

""" + SCHEMA_WEAK.format(outfile=outfile("weak", rid), rid=rid, lens="weak-links")
    write("weak", rid, body)

# --- lifecycle rooms ---
L = json.load(open(os.path.join(HERE, "partitions/lifecycle.json")))
for r in L["clusters"]:
    rid = f"lifecycle-{r['id']}"; members = [m if isinstance(m, str) else m.get("id") for m in r["members"]]
    walk = r.get("walk") or {}
    reach = "\n".join(f"- {t}: hop1 {', '.join(w.get('hop1', []))}; hop2 {', '.join(w.get('hop2', []))}" for t, w in walk.items())
    body = COMMON.format(root=ROOT, outfile=outfile("lifecycle", rid), new=NEW) + f"""
## YOUR ROOM — {rid}: newcomers and their reach
Targets (born since the last weave, under-reached): {chr(10)}{chr(10).join(f"- {m} ({P.get(m,'?')}) — inbound {N.get(m,{}).get('inbound_count','?')}" for m in members)}

Walk outward from each target along its typed links (two hops) and propose INBOUND links from the pages you meet that genuinely should point at the newcomer — a real relation with a sentence on the pointing page that could carry it, never a link manufactured to reach a number. Read both pages. One link per pair: check the pointing page's existing links first (the map says what exists: {ROOT}/_ops/maps/palace-map-full-2026-10-24.json; `python3 _ops/swarm/palace-map.py near "<Entry>"` prints a page's ring). Also give the weak_links list an empty array unless you meet a bare link worth a verdict.
Pages in reach (start here):
{reach}

""" + SCHEMA_WEAK.format(outfile=outfile("lifecycle", rid), rid=rid, lens="lifecycle")
    write("lifecycle", rid, body)

# --- folder rooms (coherence) ---
F = json.load(open(os.path.join(HERE, "partitions/folder.json")))
pool = []
for c in F["clusters"]:
    cid = c["id"]; members = [m if isinstance(m, str) else m.get("id") for m in c["members"]]
    if cid == "(root)": continue
    if cid in ("Cross-Domain Resonances", "Modes of Collaboration"): pool += members; continue
    chunks = [members] if len(members) <= 28 else [members[i::2] for i in range(2)]
    for k, ch in enumerate(chunks):
        rid = f"folder-{re.sub(r'[^a-z0-9]+','-',cid.lower()).strip('-')}" + (f"-{k+1}" if len(chunks) > 1 else "")
        body = COMMON.format(root=ROOT, outfile=outfile("folder", rid), new=NEW) + f"""
## YOUR ROOM — {rid}: the {cid} family ({len(ch)} pages{', half of the folder' if len(chunks)>1 else ''})
Members: {chr(10)}{chr(10).join(f"- {m} ({P.get(m,'?')}; {N.get(m,{}).get('type')}/{N.get(m,{}).get('stage')}; inbound {N.get(m,{}).get('inbound_count')})" for m in ch)}

Read every member's frontmatter and the bodies of the load-bearing ones. This is the COHERENCE pass — what only a reader holding the whole family can see:
1. COHERENCE AUDIT — shared vocabulary drift, roster/recipe gaps, house-standard drift, naming inconsistency; each as a finding with the fix.
2. OPEN-QUESTION CROSS-RESOLUTION — read each member's Open Questions / Forward Vectors tail; per question: answered-elsewhere (which sibling) / progressed / should-act / still-open.
3. MERGE and COMPOST candidates — two members treading common ground (one becomes a subsection of the other), or a thin neighbourless member; propose only; bias toward de-sprawl.
4. MEMORY — which members' SHAPE needs explaining to the next worker (a Context: what the page left out, what was tried and dropped, why it is shaped so) and what the Context should hold in three bullets; which project lacks a scroll it needs; which page that runs lacks a tuning ledger.
5. LIGHTER PROSE — as above, quoting passages.
6. ENTRY-HEALTH — stage that no longer fits; a generic or stasis-verbed forward vector (flag, never rewrite).
7. LINKS — only where a pair of members obviously lacks the one link that matters, or carries a wrong type; genuine only.

### LINKS ALREADY HELD AMONG THESE MEMBERS
{links_block(ch)}

OUTPUT — write ONLY this JSON to {outfile("folder", rid)}:
{{
 "room": "{rid}", "lens": "folder", "pages_read": ["..."],
 "coherence_findings": [{{"kind":"vocab|roster|recipe|house-standard|naming","entries":["..."],"issue":"...","proposed_action":"..."}}],
 "open_question_resolutions": [{{"entry":"X","question":"...","verdict":"answered-elsewhere|progressed|should-act|still-open","by_entry":"... or null","proposed_action":"..."}}],
 "merge_candidates": [{{"absorb":"X","into":"Y","survives_as_subsection":"...","rationale":"..."}}],
 "compost_candidates": [{{"entry":"X","rationale":"...","nutrients_to":["..."]}}],
 "memory_needs": [{{"entry":"X","needs":"context|scroll|tuning","why":"...","context_bullets":["...","...","..."]}}],
 "lighter_prose": [{{"entry":"X","where":"section","passage":"quoted","proposal":"simplify|delete","words":"..."}}],
 "entry_health_flags": [{{"entry":"X","stage_current":"...","stage_proposed":"... or null","vector_issue":"... or null","note":"..."}}],
 "typed_relations": [{{"source":"X","target":"Y","proposed_type":"...","proposed_label":"...","kind":"new|contradiction|retype|newcomer","rationale":"...","evidence_source":"...","evidence_target":"..."}}],
 "summary": "one paragraph"
}}
"""
        write("folder", rid, body)
if pool:
    rid = "folder-resonances-and-modes"
    # reuse the folder body for the pooled room
    ch = pool
    body = COMMON.format(root=ROOT, outfile=outfile("folder", rid), new=NEW) + f"""
## YOUR ROOM — {rid}: the Cross-Domain Resonances and Modes of Collaboration families ({len(ch)} pages, two bundles that hold nested canon)
Members: {chr(10)}{chr(10).join(f"- {m} ({P.get(m,'?')}; {N.get(m,{}).get('type')}/{N.get(m,{}).get('stage')}; inbound {N.get(m,{}).get('inbound_count')})" for m in ch)}

Same coherence pass as the other folder rooms (audit · open questions · merge/compost · memory needs · lighter prose · entry health · links), plus one question the bundle-hygiene linter asks every weave: these pages carry canon frontmatter inside a parent's bundle folder. Are they genuine nested canon (each a real entry that stands alone) or working substrate wearing entry frontmatter? Answer per page with a reason; propose, don't decide.

### LINKS ALREADY HELD AMONG THESE MEMBERS
{links_block(ch)}

OUTPUT — write ONLY this JSON to {outfile("folder", rid)}: the folder schema (coherence_findings, open_question_resolutions, merge_candidates, compost_candidates, memory_needs, lighter_prose, entry_health_flags, typed_relations, summary) plus "nested_canon": [{{"entry":"X","verdict":"canon|substrate","reason":"..."}}].
"""
    write("folder", rid, body)
n = sum(len(fs) for _, _, fs in os.walk(os.path.join(HERE, "rooms")))
print("rooms written:", n)
for lens in ("hub", "weak", "lifecycle", "folder"):
    d = os.path.join(HERE, "rooms", lens); print(" ", lens, sorted(os.listdir(d)) if os.path.isdir(d) else [])
