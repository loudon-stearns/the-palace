#!/usr/bin/env python3
"""palace_lib — the small shared floor under the Weave's health scans (v2.0, 2026-10-24).

Finds the palace root and the newest map, parses an entry's frontmatter, and classifies
a bundle folder's files by SCHEMA — Reference §8 kind. Imported by lint-link-pairs.py,
unsaid-links.py, bundle-audit.py and weave-health.py so the four agree on what an entry,
a link and a bundle are. No API calls; reads markdown and the map JSON directly.
"""
from __future__ import annotations
import os, re, glob, json

ROOT_DEFAULT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
SYMMETRIC = {"connects-to", "mirrors", "contradicts", "couples-with", "contrasts-with"}
FORWARD = {"spawned", "enables"}                       # origin → product, precondition → enabled
BACKWARD = {"emerged-from", "exemplifies", "member-of", "deepens", "made-by"}  # source points back at its ground
FM_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.S)

def newest_map(root: str, explicit: str | None = None) -> str:
    if explicit: return explicit
    maps = sorted(glob.glob(os.path.join(root, "_ops", "maps", "palace-map-full-*.json")))
    if not maps: raise SystemExit("no map in _ops/maps — run _ops/swarm/build-map.py first")
    return maps[-1]

def load_map(root: str, explicit: str | None = None) -> dict:
    p = newest_map(root, explicit)
    m = json.load(open(p, encoding="utf-8"))
    m["_path"] = p
    m["_date"] = re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(p)).group(1)
    return m

def split_frontmatter(text: str):
    """(frontmatter dict or None, body str). Falls back to a line regex when yaml is absent."""
    m = FM_RE.match(text)
    if not m: return None, text
    raw = m.group(1); body = text[m.end():]
    try:
        import yaml  # type: ignore
        fm = yaml.safe_load(raw) or {}
        if not isinstance(fm, dict): fm = {}
    except Exception:
        fm = {}
        for ln in raw.split("\n"):
            k = re.match(r"^([A-Za-z_]+):\s*(.*)$", ln)
            if k: fm[k.group(1)] = k.group(2).strip().strip('"').strip("'")
    return fm, body

def link_targets(fm: dict) -> list[dict]:
    """Each frontmatter link as {target, type, label}. Target is the bare title (no [[ ]], alias, folder)."""
    out = []
    for l in (fm or {}).get("links") or []:
        if not isinstance(l, dict): continue
        t = str(l.get("target", ""))
        t = re.sub(r"^\[\[|\]\]$", "", t.strip()).split("|")[0].split("#")[0].split("/")[-1].strip()
        if not t: continue
        out.append({"target": t, "type": str(l.get("type", "")).strip(), "label": (str(l.get("label")).strip() if l.get("label") else "")})
    return out

KINDS = [
    ("context", re.compile(r" — Context\.md$")),
    ("scroll", re.compile(r" — scroll\.md$")),
    ("tuning", re.compile(r" — tuning\.md$")),
    ("health", re.compile(r" — health\.md$")),
    ("diary", re.compile(r" — diary\.md$")),
    ("baton", re.compile(r" — baton( — .*)?\.md$")),
    ("rich", re.compile(r" — rich\.json$")),
    ("hero", re.compile(r" — hero\.png$")),
    ("icon", re.compile(r" — icon\.png$")),
    ("dossier", re.compile(r" — dossier.*\.md$")),
    ("speech", re.compile(r" — speech.*\.md$")),
    ("sketch", re.compile(r" — sketch.*\.md$")),
    ("spec", re.compile(r" — spec.*\.md$")),
    ("proof", re.compile(r" — proof.*\.md$")),
    ("source", re.compile(r" — source.*\.md$")),
]

def bundle_dir(root: str, node_path: str) -> str:
    return os.path.join(root, node_path[:-3]) if node_path.endswith(".md") else ""

def classify_bundle(root: str, node_path: str) -> dict:
    """Counts by kind for the entry's bundle folder; 'workshop' is everything else (recursive file count)."""
    d = bundle_dir(root, node_path)
    c = {k: 0 for k, _ in KINDS}; c["workshop"] = 0; c["exists"] = os.path.isdir(d)
    if not c["exists"]: return c
    for dirpath, dirs, files in os.walk(d):
        dirs[:] = [x for x in dirs if x not in {"node_modules", ".git", "__pycache__", "Archive"}]
        top = dirpath == d
        for f in files:
            if f.startswith("."): continue
            kind = None
            if top:
                for k, rx in KINDS:
                    if rx.search(f): kind = k; break
            if kind is None and os.path.basename(dirpath) == "proofs": kind = "proof"
            c[kind or "workshop"] += 1
    return c

def canon_nodes(m: dict) -> list[dict]:
    """Map nodes that are canon entries with a readable file (skips builder phantoms)."""
    return [n for n in m["nodes"] if n.get("path", "").endswith(".md")]
