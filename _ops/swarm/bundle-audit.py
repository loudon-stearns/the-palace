#!/usr/bin/env python3
"""
Bundle Audit — does each page carry the memory and faces its weight asks for (Weave v2.0, Step 5d/5e).

The face layer is nearly complete (every canon entry wears a hero and an icon); the memory layer
is thin. This scan reads every canon entry on the newest map, classifies its bundle folder by
SCHEMA — Reference §8 kind, and lists the gaps against the Weave's bundle standard:

  context owed   — no `— Context.md` on a page whose shape has something to explain: inbound ≥ 20,
                   or over 20 KB, or mature/fruiting with inbound ≥ 10 or over 10 KB (a small mature
                   page has little shape to explain; Reference and Context companions are exempt)
  scroll owed    — a `project` with no `— scroll.md` (listed with its status; the archived and complete
                   ones are Loudon's question, not a gap)
  tuning owed    — a page that runs (carries `trigger:`, or is a steward's home under
                   _ops/agents/permanent/*/manifest.json) with no `— tuning.md`
  rich candidate — a page ready for Enrichment: mature or fruiting, well pointed-at, a concept /
                   practice / project / hub, wearing a face, with no `— rich.json`; scored, ranked,
                   and handed to judgment (Enrichment.md decides what can only be shown, heard or played)

Detection is mechanical; every gap is a proposal. Flag-only; never gates.
Usage: python3 _ops/swarm/bundle-audit.py [--map PATH] [--json] [--rich N] [palace-root]
"""
from __future__ import annotations
import sys, os, re, json, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palace_lib import ROOT_DEFAULT, load_map, split_frontmatter, classify_bundle, canon_nodes

CONTEXT_INBOUND, CONTEXT_BYTES = 20, 20_000
RICH_TYPES = {"concept", "hub", "practice", "project", "person", "source"}
RICH_HINTS = re.compile(r"\b(hear|listen|sound|play|oscillat|equation|formula|curve|animation|animate|demo|interactive|simulat|waveform|spectrum|rhythm|phase)\w*", re.I)

def steward_homes(root):
    homes = set()
    for mf in glob.glob(os.path.join(root, "_ops", "agents", "permanent", "*", "manifest.json")):
        try:
            j = json.load(open(mf, encoding="utf-8"))
            for k in ("home", "entry", "page", "home_entry"):
                if isinstance(j.get(k), str): homes.add(j[k].strip()); break
        except Exception: pass
    return homes

def main(argv):
    root = next((a for a in argv if not a.startswith("--") and os.path.isdir(a)), ROOT_DEFAULT)
    mp = argv[argv.index("--map") + 1] if "--map" in argv else None
    nrich = int(argv[argv.index("--rich") + 1]) if "--rich" in argv else 15
    m = load_map(root, mp); stewards = steward_homes(root)
    rows = []
    for n in canon_nodes(m):
        p = os.path.join(root, n["path"])
        if not os.path.exists(p): continue
        text = open(p, encoding="utf-8").read(); fm, body = split_frontmatter(text)
        b = classify_bundle(root, n["path"]); size = len(text.encode("utf-8"))
        ib = n.get("inbound_count", 0); stage = n.get("stage") or ""; typ = n.get("type") or ""
        is_companion = n["id"].endswith("— Reference") or n["id"].endswith("— Context")
        trigger = bool((fm or {}).get("trigger")); steward = n["id"] in stewards
        status = str((fm or {}).get("status") or "")
        r = {"entry": n["id"], "path": n["path"], "type": typ, "stage": stage, "status": status, "inbound": ib, "kb": round(size / 1000),
             "bundle": b, "trigger": trigger, "steward": steward,
             "context_owed": (not is_companion and not b["context"] and (ib >= CONTEXT_INBOUND or size > CONTEXT_BYTES
                              or (stage in ("mature", "fruiting") and (ib >= CONTEXT_INBOUND // 2 or size > CONTEXT_BYTES // 2)))),
             "scroll_owed": typ == "project" and not b["scroll"],
             "tuning_owed": (trigger or steward) and not b["tuning"]}
        why = []
        if ib >= CONTEXT_INBOUND: why.append(f"inbound {ib}")
        if size > CONTEXT_BYTES: why.append(f"{r['kb']} KB")
        if stage in ("mature", "fruiting") and (ib >= CONTEXT_INBOUND // 2 or size > CONTEXT_BYTES // 2): why.append(stage)
        r["context_why"] = ", ".join(why)
        score = 0
        if typ in RICH_TYPES and not b["rich"] and b["hero"] and b["icon"]:
            score += {"mature": 2, "fruiting": 3, "growing": 1}.get(stage, 0)
            score += 2 if ib >= 30 else 1 if ib >= 15 else 0
            score += 1 if b["workshop"] >= 3 else 0
            score += min(2, len(set(h.lower() for h in RICH_HINTS.findall(body))) // 4)
        r["rich_score"] = score
        rows.append(r)
    ctx = [r for r in rows if r["context_owed"]]; scr = [r for r in rows if r["scroll_owed"]]; tun = [r for r in rows if r["tuning_owed"]]
    rich = sorted((r for r in rows if r["rich_score"] >= 3), key=lambda r: (-r["rich_score"], -r["inbound"]))[:nrich]
    tot = {k: sum(1 for r in rows if r["bundle"][k]) for k in ("context", "scroll", "tuning", "rich", "hero", "icon", "diary", "baton")}
    if "--json" in argv:
        print(json.dumps({"map": m["_path"], "entries": len(rows), "totals": tot, "context_owed": ctx, "scroll_owed": scr, "tuning_owed": tun, "rich_candidates": rich}, indent=1, ensure_ascii=False)); return 0
    print(f"bundle-audit: map {m['_date']} · {len(rows)} canon entries · with Context {tot['context']} · scroll {tot['scroll']} · tuning {tot['tuning']} · rich face {tot['rich']} · hero {tot['hero']} · icon {tot['icon']}")
    print(f"\nCONTEXT OWED ({len(ctx)}) — inbound ≥ {CONTEXT_INBOUND}, over {CONTEXT_BYTES//1000} KB, or mature/fruiting past half those, and no Context:")
    for r in sorted(ctx, key=lambda r: (-r["inbound"], -r["kb"])): print(f"  in={r['inbound']:3} {r['kb']:3} KB  {r['entry']}  ({r['type']}/{r['stage'] or r['status']}) — {r['context_why']}")
    print(f"\nSCROLL OWED ({len(scr)}) — projects with no scroll:")
    for r in scr: print(f"  {r['entry']}  ({r['stage']}, status {r['status'] or '—'})")
    print(f"\nTUNING OWED ({len(tun)}) — pages that run with no tuning ledger:")
    for r in tun: print(f"  {r['entry']}  ({'trigger' if r['trigger'] else ''}{' steward' if r['steward'] else ''})")
    print(f"\nRICH-FACE CANDIDATES (top {len(rich)}, score ≥ 3; judgment decides):")
    for r in rich: print(f"  {r['rich_score']}  in={r['inbound']:3}  {r['entry']}  ({r['type']}/{r['stage']}, workshop files {r['bundle']['workshop']})")
    print(f"\nsummary: {len(ctx)} Context owed · {len(scr)} scroll owed · {len(tun)} tuning owed · {len(rich)} rich candidates")
    return 0

if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
