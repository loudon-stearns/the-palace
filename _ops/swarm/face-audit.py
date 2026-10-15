#!/usr/bin/env python3
"""
Face Audit - every canon entry wears a face; this lists the ones that don't.

A face is two images in the entry's bundle folder: a hero (`<file name> — hero.png`) and an
icon, the avatar (`<file name> — icon.png`). STIGMERGY shows them in the state view, in search
and beside an entry's name, so they shape how Loudon re-enters the palace.

The policy (Loudon, 2026-10-14: "every canon gets a face and hero"): **every canon entry wears
both.** A canon entry is any `.md` whose frontmatter carries a canon `type:` (SCHEMA §1). Nothing
else decides it - not stage, not type, not links, not use. A spore, a question, a seed and a
composting entry all wear a face and keep it. There is nothing to retire.

So the audit prints one list: every canon entry missing a hero, an icon, or both, saying which.
That list is what the Weave (Step 5c) hands to Shop/Hero and Avatar Maker/make_faces.py, the
gated batch Loudon approves. Detection is mechanical; the render costs money, so this scan
never renders.

The set it walks is the set the map builder makes nodes of: symlinks and the machinery folders
below are skipped. Mechanical, deterministic, no API calls, no git.
Exit 0 always (an audit, never a gate).

Usage: python3 _ops/swarm/face-audit.py [palace-root] [--paths a.md,b/c.md]
       --paths scopes the audit to root-relative files (Closing Well runs it on a session's
       touched files).
"""
from __future__ import annotations
import os, re, sys

SKIP_DIRS = {".git", ".obsidian", ".claude", "node_modules", ".venvs", "_tools",
             "venv", "__pycache__"}
SKIP_PREFIXES = ("_ops/stigmergy/app/", "_ops/stigmergy/orchestrator/",
                 "_ops/stigmergy/trickster-auto/", "_ops/swarm/")

# SCHEMA §1. (`breakthrough` was retired in v1.17; a file still wearing it is not canon.)
CANON_TYPES = {"concept", "hub", "project", "source", "meta", "practice",
               "person", "question", "spore", "specialist", "maker"}

PALACE_DEFAULT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

FIELD_RE = {
    "type": re.compile(r'^type:\s*(.+?)\s*$', re.M),
    "stage": re.compile(r'^stage:\s*(.+?)\s*$', re.M),
}


def _unquote(v):
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        v = v[1:-1]
    return v


def read_frontmatter(path):
    """Return {'type', 'stage'} from the frontmatter block (either may be None).
    None if the file has no frontmatter block."""
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            head = f.read(8192)
    except OSError:
        return None
    if not head.startswith("---"):
        return None
    end = head.find("\n---", 3)
    if end == -1:
        return None
    block = head[3:end]
    fm = {"type": None, "stage": None}
    for k, rx in FIELD_RE.items():
        m = rx.search(block)
        if m:
            fm[k] = _unquote(m.group(1))
    return fm


def has_face(md_path):
    """(has_hero, has_icon): does the entry's bundle folder hold a hero/icon png?
    Bundle = sibling folder named exactly like the entry (SCHEMA §8). Accepts the
    file-named face or any `* — hero.png` / `* — icon.png` (STIGMERGY's rule)."""
    stem = os.path.basename(md_path)[:-3]
    # Faces belong in the filename folder (the tools place them there since 2026-09-26), but a
    # face filed under the frontmatter title is still counted, so an old stray is caught as
    # present rather than given a duplicate — checking only the stem did that to six on 2026-09-24.
    names = [stem]
    try:
        with open(md_path, encoding="utf-8") as fh:
            m = re.search(r'^title:\s*"?(.+?)"?\s*$', fh.read(4000), re.M)
        if m and m.group(1).strip() != stem:
            names.append(m.group(1).strip())
    except OSError:
        pass
    hero = icon = False
    for name in names:
        bundle = os.path.join(os.path.dirname(md_path), name)
        if not os.path.isdir(bundle):
            continue
        try:
            for f in os.listdir(bundle):
                if f.endswith("— hero.png") or f.endswith("- hero.png"):
                    hero = True
                elif f.endswith("— icon.png") or f.endswith("- icon.png"):
                    icon = True
        except OSError:
            pass
    return hero, icon


def is_skipped_prefix(rel):
    r = rel.replace(os.sep, "/")
    return any(r.startswith(p) for p in SKIP_PREFIXES)


def audit(root, only=None):
    """Return (missing, canon_count): the canon entries lacking a hero, an icon or both,
    as display rows, and how many canon entries were in scope."""
    missing, canon = [], 0
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            if not fn.endswith(".md"):
                continue
            ap = os.path.join(dp, fn)
            rel = os.path.relpath(ap, root)
            if only is not None and rel.replace(os.sep, "/") not in only:
                continue
            if is_skipped_prefix(rel) or os.path.islink(ap):
                continue
            fm = read_frontmatter(ap)
            if not fm or fm["type"] not in CANON_TYPES:
                continue
            canon += 1
            hero, icon = has_face(ap)
            if hero and icon:
                continue
            miss = ("no hero, no icon" if not (hero or icon)
                    else "missing icon" if hero else "missing hero")
            missing.append(f'{rel}  ({fm["type"]}, {fm["stage"]}) - {miss}')
    return sorted(missing), canon


def parse_args():
    """[palace-root] positional + optional --paths a,b,c (root-relative files to audit)."""
    root, only = None, None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--paths" and i + 1 < len(args):
            only = {p.strip().lstrip("./") for p in args[i + 1].split(",") if p.strip()}
            i += 2
        elif not args[i].startswith("--"):
            root = args[i]; i += 1
        else:
            i += 1
    return os.path.abspath(root or PALACE_DEFAULT), only


def main():
    root, only = parse_args()
    if not os.path.isdir(root):
        sys.exit(f"not a directory: {root}")

    missing, canon = audit(root, only)
    scope = "in scope" if only is not None else "in the palace"
    print(f"face audit - root: {root}\n")
    print(f"MISSING A FACE ({len(missing)} of {canon} canon entries {scope}) "
          f"- every canon entry wears a hero and an icon -> render batch:")
    for x in missing:
        print("  + " + x)
    print(f"\nsummary: {len(missing)} missing a face, {canon - len(missing)} of {canon} wear both")
    sys.exit(0)


if __name__ == "__main__":
    main()
