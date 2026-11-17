#!/usr/bin/env python3
"""Sweep the palace's own projects into the catalog, and draw the threads between works.

    python3 palace-sweep.py catalog-draft-v2.json catalog-draft-v3.json

Run from this folder. Each `Projects/*.md` page that is a made thing becomes a work: its `born`
month is when it starts, its last commit is when it was last touched, and both are held by the
palace or git, so it draws blue. Pages that run the palace itself (stewardship, the board, the
weaves) fold into the one work "The Palace"; concept pages are ideas, not works, and stay out.

Threads are drawn from three honest sources only: a work's own `palace` field (the page it seeded,
named by an earlier sweep); a hand list of seeds below, each with its reason; and the typed links
the palace pages already declare to each other (`emerged-from`, `spawned`, `deepens`, `enables`).
"""
import json, re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
PROJ = ROOT / "Projects"
cat = json.load(open(sys.argv[1]))

# pages that are the palace's own machinery, or ideas rather than made things
MACHINERY = {"Project Stewardship System", "Swarm Weave", "Palace Enchantment",
             "STIGMERGY Philosophical Lenses", "The Gallery"}
ALREADY = {"1 from 2": "one-from-two", "Tract Mirror": "tract-mirror", "Loudon Live": "loudon-live"}
KIND = {  # title → kind; anything unnamed is an instrument
  "BLUELINE": "recording", "LDN RTM": "course", "Rational Hearing": "course",
  "Cycle 5 Explorer": "course", "Meadows and an Artist's Career": "course",
  "Meadows and Music — Leverage Points": "writing", "Compressor Design": "writing",
  "Synth Templates": "course", "Generative Audio Devices": "tool", "Preset Oracle": "tool",
  "VST Template": "tool", "Splice Instrument Forge": "tool", "Semantic Webcam": "tool",
  "Generative Sample Libraries": "tool", "Generative Wavetable Libraries": "tool",
  "Generative Preset Development": "tool", "SMPTE LTC": "tool",
}
# old work → palace page it seeded, with the reason (only where the material says so)
SEEDS = {
  "synth-notes": ("Synth Templates", "the palace page says the Notes seeded the Templates"),
  "synthesis-mooc": ("Synth Templates", "the same synthesis teaching, ten years on"),
  "synthesis-lessons": ("Synth Templates", "the same synthesis teaching, seventeen years on"),
  "meaning-link": ("The Palace", "links before nodes: the founding argument of the house"),
  "thesis-at-emerson": ("Meaning and the Link", "the thesis folder of the same years"),
  "one-from-two": ("The Palace", "seeded Cooperation Yields Agency"),
}

def fm(text):
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    return m.group(1) if m else ""

def field(f, k):
    m = re.search(rf"^{k}:\s*\"?(.*?)\"?\s*$", f, re.M)
    return m.group(1) if m else None

def git(*a):
    return subprocess.run(["git", "-C", str(ROOT), "-c", "core.quotepath=off", *a],
                          capture_output=True, text=True).stdout.strip()

works, links = [], {}
for p in sorted(PROJ.glob("*.md")):
    t = p.stem
    f = fm(p.read_text())
    links[t] = re.findall(r'target:\s*"\[\[(.*?)\]\]"\s*\n\s*type:\s*(emerged-from|spawned|deepens|enables)', f)
    if t in MACHINERY or t in ALREADY or field(f, "type") not in ("project", "source"):
        continue
    born, status = field(f, "born") or "", field(f, "status") or ""
    rel = f"Projects/{t}"
    last = git("log", "-1", "--format=%as", "--", f"{rel}.md", rel)
    n = len(git("log", "--format=%h", "--", f"{rel}.md", rel).splitlines())
    media = sum(1 for x in (PROJ / t).rglob("*") if x.suffix.lower() in (".wav", ".mp3", ".html", ".vst3")) if (PROJ / t).is_dir() else 0
    end = last[:7] if status == "complete" else ""
    lead = field(f, "who_leads")
    note = f"{n} commits; last touched {last}. " + (f"{media} sounds, pages or plugins in its bundle, so it can play in place. " if media else "Nothing playable in its bundle yet. ")
    note += {"loudon": "He leads it.", "human": "He leads it.", "shared": "Led together, with the stewards."}.get(lead, "Who led it is not written on the page.")
    if status == "complete": note += " Finished."
    works.append({"id": re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-"), "title": t, "kind": KIND.get(t, "instrument"),
                  "when": f"{born[:7]}..{end}", "prov": "datasheet",
                  "src": f"palace: {rel}.md (born {born}; git)", "note": note, "palace": t, "era": "palace"})

out = [w for w in cat] + works
by_page = {w["palace"]: w["id"] for w in works}
by_page.update({"The Palace": "palace", "Meaning and the Link": "meaning-link", "1 from 2": "one-from-two",
                "Tract Mirror": "tract-mirror", "Loudon Live": "loudon-live"})
for w in out:
    th = []
    if w["id"] in SEEDS:
        pg, why = SEEDS[w["id"]]
        th.append({"to": by_page[pg], "why": why})
    elif w.get("palace") in by_page and by_page[w["palace"]] != w["id"]:
        th.append({"to": by_page[w["palace"]], "why": f"named by the sweep as the seed of {w['palace']}"})
    for tgt, ty in links.get(w.get("palace") if w.get("era") == "palace" else "", []):
        # an emerged-from or deepens link points back to its ground: draw the thread ground → this
        if tgt in by_page and by_page[tgt] != w["id"]:
            ground, grown = (by_page[tgt], w["id"]) if ty in ("emerged-from", "deepens") else (w["id"], by_page[tgt])
            g = next(x for x in out if x["id"] == ground)
            g.setdefault("threads", []).append({"to": grown, "why": f"{w['title']} {ty} {tgt}, on its own page"})
    if th: w.setdefault("threads", []).extend(th)
for w in out:  # a pair named on both pages (spawned here, emerged-from there) is one thread
    seen, keep = set(), []
    for t in w.get("threads", []):
        if t["to"] not in seen: seen.add(t["to"]); keep.append(t)
    if keep: w["threads"] = keep
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
nt = sum(len(w.get("threads", [])) for w in out)
print(f"{len(cat)} + {len(works)} palace works = {len(out)}; {nt} threads")
