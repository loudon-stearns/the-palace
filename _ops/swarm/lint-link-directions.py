#!/usr/bin/env python3
"""
Link-Direction Linter — the Weave's checkable postcondition for typed-link directionality.

Reads a palace map JSON (produced by build-map-*.py) and flags the directional
errors that the 2026-06-05 Schema Ceremony (SCHEMA v1.9) made canonical. Mechanical,
deterministic, no API calls. Exit code 0 = clean, 1 = errors found, 2 = could not check
(a scoped run whose map can't see the named files, and no fresh build to read instead).

Rules (SCHEMA §4):
  E1  Reciprocal contradiction — an asymmetric type used in BOTH directions between
      a pair (A type B AND B type A). Impossible: A can't be derived-from B and B
      derived-from A at once. Asymmetric types: deepens, emerged-from, exemplifies,
      member-of, enables, spawned, made-by.
  E2  Hub emits member-of — a `type: hub` entry pointing member-of at another entry.
      Collections never declare their own membership; members point in.
  W1  Ground emits lineage link — an entry that is a strong `deepens`/`emerged-from`
      TARGET (a foundational ground, inbound >= threshold) also EMITS that link.
      Likely a backwards arrow (ground should be the target, not the source).
  W2  member-of / exemplifies toward a leaf — the target has fewer inbound links than
      the source. Instances/members usually point at a more-connected class/collection.

The map is a snapshot, so the linter first asks whether it is older than the files in
question. The build records the commit it was made at (meta.use.head); every entry that
differs from that commit in the working tree, or is untracked, is newer than the map. A
map with no usable head falls back to its build date (entries committed on or after it,
plus uncommitted ones), which errs toward calling it stale.

  whole palace   a stale map is named plainly above the findings, which are unchanged.
                 --rebuild lints a fresh build instead.
  --paths        when the map is older than a named entry, a fresh build is made in a
                 temp folder and linted (nothing is written to _ops/maps); --no-rebuild
                 reports it and exits 2 rather than calling unseen files clean.

--paths scopes the findings to the named files (root-relative or absolute, comma-separated,
repeatable): the links they emit, and for E1 a pair either side of which is named. Named
files that are not map nodes (bundle files, machinery) have no typed links to check, and
are counted as such.

Usage: python3 _ops/swarm/lint-link-directions.py [path-to-map.json] [--paths a.md,b/c.md]
           [--root DIR] [--rebuild | --no-rebuild]
       (defaults to the newest _ops/maps/palace-map-full-*.json under the palace root two
        levels above this script)
"""
from __future__ import annotations
import datetime, json, sys, glob, os, re, shutil, subprocess, tempfile
from collections import defaultdict

ASYMMETRIC = {"deepens", "emerged-from", "exemplifies", "member-of", "enables", "spawned", "made-by"}
LINEAGE = {"deepens", "emerged-from"}
GROUND_INBOUND_THRESHOLD = 3   # inbound lineage links that mark an entry as a "ground"

PALACE_DEFAULT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
CANON_TYPES = {"concept", "hub", "project", "source", "meta",
               "practice", "person", "question", "spore", "specialist", "maker"}
SKIP_PARTS = {".git", ".obsidian", ".claude", "node_modules", ".venvs", "_tools",
              "venv", "__pycache__"}
TYPE_RE = re.compile(r'^type:\s*["\']?(.+?)["\']?\s*$', re.M)
SHOW_STALE = 5   # changed entries named in a stale-map warning before "and N more"


def newest_map(root):
    maps = sorted(glob.glob(os.path.join(root, "_ops", "maps", "palace-map-full-*.json")))
    return maps[-1] if maps else None


def canon_type(path):
    """The file's `type:` when it is a SCHEMA §1 canon type (a map node), else None."""
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            head = f.read(4096)
    except OSError:
        return None
    if not head.startswith("---"):
        return None
    end = head.find("\n---", 3)
    m = TYPE_RE.search(head[3:end]) if end != -1 else None
    return m.group(1) if m and m.group(1) in CANON_TYPES else None


def git(root, *args):
    try:
        r = subprocess.run(["git", "-C", root, "-c", "core.quotePath=false", *args],
                           capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return r.stdout if r.returncode == 0 else None


def lines(out):
    return {l for l in (out or "").splitlines() if l}


def changed_since(root, d, map_path):
    """Markdown files newer than the map, and the anchor that decided it.
    Returns (set of root-relative paths, anchor) or (None, reason) when it can't tell."""
    meta = d.get("meta", {})
    head = (meta.get("use") or {}).get("head")
    date = meta.get("generated")
    if not date:
        m = re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(map_path))
        date = m.group(1) if m else None
    if git(root, "rev-parse", "--git-dir") is None:
        if not date:
            return None, "no git and no build date in the map"
        cut = datetime.datetime.fromisoformat(date).timestamp()
        out = set()
        for dp, dns, fns in os.walk(root):
            dns[:] = [x for x in dns if x not in SKIP_PARTS]
            for fn in fns:
                ap = os.path.join(dp, fn)
                if fn.endswith(".md") and os.path.getmtime(ap) >= cut:
                    out.add(os.path.relpath(ap, root).replace(os.sep, "/"))
        return out, f"file times since {date} (no git)"
    untracked = lines(git(root, "ls-files", "--others", "--exclude-standard", "--", "*.md"))
    if head and git(root, "cat-file", "-e", f"{head}^{{commit}}") is not None:
        diff = git(root, "diff", "--name-only", "--no-renames", "--relative", head, "--", "*.md")
        if diff is not None:
            return lines(diff) | untracked, f"built at {head}"
    if not date:
        return None, "the map records neither a commit nor a build date"
    logged = git(root, "log", f"--since={date}T00:00:00", "--name-only", "--relative", "--format=", "--", "*.md")
    dirty = git(root, "diff", "--name-only", "--no-renames", "--relative", "HEAD", "--", "*.md")
    if logged is None or dirty is None:
        return None, "git could not list the changes"
    return lines(logged) | lines(dirty) | untracked, f"built {date} (no usable commit recorded)"


def rebuild(root):
    """A fresh map of `root`, built into a temp folder. Returns (map dict, None) or
    (None, reason). Nothing is written under the palace."""
    builder = os.path.join(root, "_ops", "swarm", "build-map.py")
    if not os.path.isfile(builder):
        return None, f"no {os.path.relpath(builder, root)} under the root"
    tmp = tempfile.mkdtemp(prefix="link-directions-map-")
    try:
        try:
            r = subprocess.run([sys.executable, builder, "--out-dir", tmp, "--keep", "1"],
                               cwd=root, capture_output=True, text=True, timeout=600)
        except (OSError, subprocess.TimeoutExpired) as ex:
            return None, f"build-map.py could not run: {ex}"
        if r.returncode != 0:
            last = ((r.stderr or r.stdout).strip().splitlines() or ["no output"])[-1]
            return None, f"build-map.py exited {r.returncode}: {last}"
        maps = sorted(glob.glob(os.path.join(tmp, "palace-map-full-*.json")))
        if not maps:
            return None, "build-map.py wrote no map"
        d = json.load(open(maps[-1], encoding="utf-8"))
        if not d.get("nodes"):
            return None, "the fresh build has no nodes"
        d["_name"] = os.path.basename(maps[-1])
        return d, None
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def lint(d, scope=None):
    """(errors, warns) for the map `d`; with `scope` (a set of node ids), only the
    findings on links those nodes emit (E1: a pair with either side in scope)."""
    nodes = {n["id"]: n for n in d["nodes"]}
    edges = [(e["source"], e["type"], e["target"], e.get("label")) for e in d["edges"]]
    edgeset = {(s, t, tp) for s, tp, t, _ in edges}
    mine = (lambda s: True) if scope is None else (lambda s: s in scope)

    errors, warns = [], []

    # E1 — reciprocal contradictions
    seen = set()
    for s, tp, t, _ in edges:
        if tp in ASYMMETRIC and (t, s, tp) in edgeset and (mine(s) or mine(t)):
            key = tuple(sorted((s, t))) + (tp,)
            if key not in seen:
                seen.add(key)
                errors.append(f"E1  reciprocal {tp}:  {s}  <->  {t}  (both directions present)")

    # E2 — hub emits member-of
    for s, tp, t, _ in edges:
        if tp == "member-of" and nodes.get(s, {}).get("type") == "hub" and mine(s):
            errors.append(f"E2  hub emits member-of:  {s} (hub) --member-of--> {t}  (members declare membership, not the hub)")

    # W1 — ground emits lineage
    inbound_lineage = defaultdict(int)
    for s, tp, t, _ in edges:
        if tp in LINEAGE:
            inbound_lineage[t] += 1
    grounds = {n for n, c in inbound_lineage.items() if c >= GROUND_INBOUND_THRESHOLD}
    for s, tp, t, _ in edges:
        if tp in LINEAGE and s in grounds and mine(s):
            warns.append(f"W1  ground emits {tp}:  {s} (inbound {tp}={inbound_lineage[s]}) --{tp}--> {t}  (verify arrow: grounds are usually targets)")

    # W2 — member-of / exemplifies toward a leaf
    for s, tp, t, _ in edges:
        if tp in ("member-of", "exemplifies") and mine(s):
            ti, si = nodes.get(t, {}).get("inbound_count"), nodes.get(s, {}).get("inbound_count")
            if ti is not None and si is not None and ti < si:
                warns.append(f"W2  {tp} toward less-central target:  {s} (inbound {si}) --{tp}--> {t} (inbound {ti})")
    return errors, warns


def normalize_paths(raw, root):
    """Root-relative, '/'-separated forms of the --paths values (absolute ones made
    relative to root; a leading './' dropped)."""
    out = set()
    for p in raw:
        p = p.strip()
        if not p:
            continue
        if os.path.isabs(p):
            p = os.path.relpath(p, root)
        p = p.replace(os.sep, "/")
        while p.startswith("./"):
            p = p[2:]
        out.add(p)
    return out


def parse_args():
    """[map.json] positional + --paths a,b,c + --root DIR + --rebuild / --no-rebuild."""
    opts = {"map": None, "root": None, "raw": None, "rebuild": None}
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--paths" and i + 1 < len(args):
            opts["raw"] = (opts["raw"] or []) + args[i + 1].split(","); i += 2
        elif a == "--root" and i + 1 < len(args):
            opts["root"] = args[i + 1]; i += 2
        elif a == "--rebuild":
            opts["rebuild"] = True; i += 1
        elif a == "--no-rebuild":
            opts["rebuild"] = False; i += 1
        elif not a.startswith("--"):
            opts["map"] = a; i += 1
        else:
            i += 1
    root = os.path.abspath(opts["root"] or PALACE_DEFAULT)
    only = normalize_paths(opts["raw"], root) if opts["raw"] is not None else None
    return root, opts["map"], only, opts["rebuild"]


def main():
    root, path, only, want_rebuild = parse_args()
    path = path or newest_map(root)
    # A scoped run rebuilds a map that can't see its files unless told not to; a whole run
    # only does when asked, so its findings stay what they were.
    may_rebuild = want_rebuild if want_rebuild is not None else only is not None

    d, name, notes = None, None, []
    if path:
        d = json.load(open(path, encoding="utf-8"))
        name = os.path.basename(path)
        node_paths = {n.get("path") for n in d["nodes"]}
        changed, anchor = changed_since(root, d, path)
        if changed is None:
            stale = None
            notes.append(f"could not tell whether the map is current ({anchor})")
        else:
            stale = sorted(p for p in changed
                           if p in node_paths or canon_type(os.path.join(root, p)))
            if only is not None:
                stale = [p for p in stale if p in only]
    elif not may_rebuild:
        sys.exit("no map JSON found in _ops/maps/ (run _ops/swarm/build-map.py, or pass --rebuild)")
    else:
        stale, anchor = None, "no map in _ops/maps"

    needs_fresh = path is None or stale is None or (stale and (want_rebuild or only is not None))
    if may_rebuild and needs_fresh:
        fresh, why = rebuild(root)
        if fresh is not None:
            d, name, stale, notes = fresh, f"fresh build ({fresh['_name']}, not written to _ops/maps)", [], []
        else:
            notes.append(f"could not rebuild the map: {why}")
            if d is None:
                print(f"Link-Direction Linter — no map\n  {notes[-1]}")
                sys.exit(2)

    scope = None
    if only is not None:
        by_path = {n.get("path"): n["id"] for n in d["nodes"]}
        scope = {by_path[p] for p in only if p in by_path}
        others = sorted(p for p in only if p not in by_path)

    errors, warns = lint(d, scope)

    print(f"Link-Direction Linter — {name}")
    print(f"  nodes={len(d['nodes'])}  edges={len(d['edges'])}")
    if only is not None:
        print(f"  scoped to {len(only)} named path(s); {len(scope)} are map nodes")
        for p in others:
            why = ("not found under root" if not os.path.exists(os.path.join(root, p))
                   else "a canon entry the map doesn't hold" if canon_type(os.path.join(root, p))
                   else "not a map node (no canon type), so no typed links to check")
            print(f"  note: {p}: {why}")
    for n in notes:
        print(f"  note: {n}")
    # A scoped run is blind when the map is older than a named entry, or when no one can
    # tell; a whole run only reports what it can't see.
    blind = bool(stale) or (only is not None and stale is None)
    if stale:
        shown = "\n".join(f"    {p}" for p in stale[:SHOW_STALE])
        more = f"\n    ... and {len(stale) - SHOW_STALE} more" if len(stale) > SHOW_STALE else ""
        whose = ("named " if only is not None else "") + ("entry" if len(stale) == 1 else "entries")
        print(f"  STALE MAP: {anchor}; {len(stale)} {whose} changed since, and this run can't see those changes:\n"
              f"{shown}{more}\n"
              f"  Rebuild with `python3 _ops/swarm/build-map.py`, or pass --rebuild to lint a fresh build without writing one.")
    print()
    if errors:
        print(f"ERRORS ({len(errors)}):")
        for e in errors: print("  " + e)
    else:
        print("ERRORS: none")
    print()
    if warns:
        print(f"WARNINGS ({len(warns)}) — review, not all are bugs:")
        for w in warns: print("  " + w)
    else:
        print("WARNINGS: none")

    if errors:
        sys.exit(1)
    if blind and only is not None:
        print("\ncould not check: the map " + ("predates the named entries above" if stale
              else "may predate the named entries") + " and no fresh build was read (exit 2).")
        sys.exit(2)
    sys.exit(0)

if __name__ == "__main__":
    main()
