#!/usr/bin/env python3
"""Weave 2026-10-24 — the mechanical write-back. Frontmatter only, edited in place, each file's link
style preserved. Reads a decisions JSON (a list of ops) and applies it; --dry-run prints and writes nothing.
Ops: {"op":"add","source","target","type","label"?} · {"op":"remove","source","target","type"} ·
     {"op":"label","source","target","type","label"} · {"op":"retype","source","target","from_type","type","label"?}
     {"op":"field","entry","field","value"}
Grown from weave-2026-09-24/apply_links.py (tuning 14: check structure, not just parse).
Usage: python3 apply.py <decisions.json> [--dry-run] [--map PATH]"""
import json, re, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from palace_lib import ROOT_DEFAULT, load_map
DRY = "--dry-run" in sys.argv
ROOT = ROOT_DEFAULT
mp = sys.argv[sys.argv.index("--map") + 1] if "--map" in sys.argv else None
M = load_map(ROOT, mp)
PATH = {n["id"]: os.path.join(ROOT, n["path"]) for n in M["nodes"] if n.get("path", "").endswith(".md")}
log, problems = [], []

def split(path):
    if not os.path.exists(path): raise FileNotFoundError(path)
    t = open(path, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n", t, re.S)
    if not m: raise ValueError(f"no frontmatter: {path}")
    return t, m.group(1), m.end()

def link_blocks(fm):
    lines = fm.split("\n"); out = []; inl = False; i = 0
    while i < len(lines):
        ln = lines[i]
        if re.match(r"^links:\s*$", ln): inl = True; i += 1; continue
        if inl and re.match(r"^[A-Za-z_]", ln): break
        if inl and re.match(r"^\s*-\s", ln):
            j = i + 1
            while j < len(lines) and not re.match(r"^\s*-\s", lines[j]) and not re.match(r"^[A-Za-z_]", lines[j]): j += 1
            blk = "\n".join(lines[i:j])
            tg = re.search(r'target:\s*"?\[\[([^\]|#]+)', blk); ty = re.search(r'\btype:\s*"?([a-z\-]+)', blk)
            out.append((i, j, tg.group(1).split("/")[-1].strip() if tg else None, ty.group(1) if ty else None))
            i = j; continue
        i += 1
    return lines, out

def write(path, fm_new, t, end):
    if "\n---\n" not in "---\n" + fm_new + "\n---\n": raise ValueError("frontmatter structure broken")
    if not fm_new.rstrip().split("\n")[-1].strip(): raise ValueError("frontmatter ends on a blank line")
    if not DRY: open(path, "w", encoding="utf-8").write("---\n" + fm_new + "\n---\n" + t[end:])

def add_link(src, tgt, typ, label=None):
    p = PATH.get(src)
    if not p: problems.append(f"unknown entry: {src}"); return
    t, fm, end = split(p); lines, blocks = link_blocks(fm)
    if any(b[2] == tgt and b[3] == typ for b in blocks): log.append(f"= already: {src} —{typ}→ {tgt}"); return
    inline = any(re.match(r"^\s*-\s*\{", lines[b[0]]) for b in blocks)
    lab = f', label: "{label}"' if (inline and label) else ""
    new = [f'  - {{ target: "[[{tgt}]]", type: {typ}{lab} }}'] if inline else \
          [f'  - target: "[[{tgt}]]"', f"    type: {typ}"] + ([f"    label: {label}"] if label else [])
    if blocks: ins = blocks[-1][1]
    else:
        li = next((k for k, l in enumerate(lines) if re.match(r"^links:\s*(\[\])?\s*$", l)), None)
        if li is None: lines.append("links:"); li = len(lines) - 1
        lines[li] = "links:"; ins = li + 1
    lines[ins:ins] = new
    write(p, "\n".join(lines), t, end); log.append(f"+ {src} —{typ}→ {tgt}" + (f" [{label}]" if label else ""))

def remove_link(src, tgt, typ):
    p = PATH.get(src)
    if not p: problems.append(f"unknown entry: {src}"); return False
    t, fm, end = split(p); lines, blocks = link_blocks(fm)
    hit = [b for b in blocks if b[2] == tgt and b[3] == typ]
    if not hit: problems.append(f"no link to remove: {src} —{typ}→ {tgt}"); return False
    s, e = hit[0][0], hit[0][1]; del lines[s:e]
    write(p, "\n".join(lines), t, end); log.append(f"- {src} —{typ}→ {tgt}"); return True

def set_label(src, tgt, typ, label):
    p = PATH.get(src)
    if not p: problems.append(f"unknown entry: {src}"); return
    t, fm, end = split(p); lines, blocks = link_blocks(fm)
    hit = [b for b in blocks if b[2] == tgt and b[3] == typ]
    if not hit: problems.append(f"no link to label: {src} —{typ}→ {tgt}"); return
    s, e = hit[0][0], hit[0][1]; blk = lines[s:e]
    if re.match(r"^\s*-\s*\{", blk[0]):
        if "label:" in blk[0]: problems.append(f"already labelled: {src} → {tgt}"); return
        lines[s] = blk[0].rstrip().rstrip("}").rstrip() + f', label: "{label}" }}'
    else:
        if any("label:" in l for l in blk): problems.append(f"already labelled: {src} → {tgt}"); return
        lines[e:e] = [f"    label: {label}"]
    write(p, "\n".join(lines), t, end); log.append(f"~ label {src} —{typ}→ {tgt} [{label}]")

def retype(src, tgt, from_type, typ, label=None):
    if remove_link(src, tgt, from_type): add_link(src, tgt, typ, label)

def set_field(ent, field, value):
    p = PATH.get(ent)
    if not p: problems.append(f"unknown entry: {ent}"); return
    t, fm, end = split(p)
    if re.search(rf"^{field}:.*$", fm, re.M): fm2 = re.sub(rf"^{field}:.*$", f"{field}: {value}", fm, count=1, flags=re.M)
    else: fm2 = fm + f"\n{field}: {value}"
    if fm2 != fm: write(p, fm2, t, end); log.append(f"* {ent}: {field} → {value}")

ops = json.load(open(next(a for a in sys.argv[1:] if a.endswith(".json"))))
for o in ops:
    k = o["op"]
    try:
      if k == "add": add_link(o["source"], o["target"], o["type"], o.get("label"))
      elif k == "remove": remove_link(o["source"], o["target"], o["type"])
      elif k == "label": set_label(o["source"], o["target"], o["type"], o["label"])
      elif k == "retype": retype(o["source"], o["target"], o["from_type"], o["type"], o.get("label"))
      elif k == "field": set_field(o["entry"], o["field"], o["value"])
      else: problems.append(f"unknown op {k}")
    except FileNotFoundError as e: problems.append(f"page gone (deleted this weave?): {os.path.relpath(str(e), ROOT)} — op {k} {o.get('source') or o.get('entry')} → {o.get('target','')}")
print("\n".join(log)); print(f"\n{sum(1 for l in log if l and l[0] in '+-~*')} changes" + (" (DRY RUN — nothing written)" if DRY else ""))
if problems: print("\nPROBLEMS:\n  " + "\n  ".join(problems))
