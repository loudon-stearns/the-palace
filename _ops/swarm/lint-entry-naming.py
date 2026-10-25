#!/usr/bin/env python3
"""
Entry-Naming Linter - the Weave's checkable postcondition for entry↔filesystem naming.

Third mechanical linter alongside lint-link-directions.py (graph directionality) and
lint-doc-drift.py (foundational-prose consistency). This one checks the *names*: the two
ways an entry drifts out of sync with the filesystem, both masked by macOS's
case-insensitive volume so they survive until a case-sensitive consumer (git, Linux CI,
or STIGMERGY's tree code) trips over them.

Mechanical, deterministic, no API calls, reads markdown directly.
Exit code 0 = clean (no errors), 1 = errors found.

  ERROR (high confidence - fails the build):
  E1  Bundle-folder miscase  - an entry X.md has a sibling folder that matches X
                               case-INSENSITIVELY but not exactly (e.g. 'Modes of
                               collaboration/' next to 'Modes of Collaboration.md'). SCHEMA
                               §8 matches bundles by EXACT name; the case-insensitive FS
                               hides the split until a case-sensitive reader (git, the
                               STIGMERGY tree) mis-partitions the bundle. Silently corrupts
                               tooling -> hard error.

  WARNING (review every Weave, correct real drift):
  W1  Title != filename      - a canon entry's `title:` doesn't equal its filename (minus
                               .md). SCHEMA §3: "title must match the filename." The
                               'Oblique Portrait.md' titled "Oblique Portrait Method" bug.
                               A warning, not an error, because (a) Obsidian resolves by
                               filename so the mismatch is usually cosmetic, and (b) a few
                               are deliberate (foundational stylized names like ROSETTA;
                               source entries carrying a year, "Foo (2014)"). The Weave
                               reviews these and fixes the real mistakes; intentional ones
                               are left. Titles that only differ by a filesystem-illegal
                               character (?, /, :, ...) are NOT flagged - that rename is
                               unavoidable.

This linter only DETECTS. Correction happens in the Weave (rename the file/folder or edit
the title to agree), the way the other linters gate their fixes.

Usage: python3 _ops/swarm/lint-entry-naming.py [palace-root] [--paths a.md,b/c.md]
       (defaults to the palace root two levels above this script)

--paths scopes the run to the named files (root-relative or absolute, comma-separated,
repeatable): it reports exactly the findings a whole run would report for those entries,
so the Deposit can check what it just placed against a standing baseline. An entry is in
scope when it is named or when a named file sits in its bundle folder (so a miscased
folder a deposit just filled is caught). With no --paths the whole palace is checked.
"""
from __future__ import annotations
import os, re, sys

# Dirs never walked - system/build/dep, plus heavy tool trees.
SKIP_DIRS = {".git", ".obsidian", ".claude", "node_modules", ".venvs", "_tools",
             "venv", "__pycache__"}
# Palace-relative path prefixes that hold machinery/work-product markdown, not canon
# entries (mirrors entries.js EXCLUDE_PREFIXES). A file under any of these is skipped.
SKIP_PREFIXES = ("_ops/stigmergy/app/", "_ops/stigmergy/orchestrator/",
                 "_ops/stigmergy/trickster-auto/", "_ops/swarm/")

# The SCHEMA §1 entry types. A file is a *canon entry* - and thus bound by §3
# (title == filename) and §8 (exact-case bundle folder) - only when its `type:`
# is one of these. Bundle files and working artifacts carry a `title:` (and
# sometimes a non-canon `type:` like `artifact`) but are NOT entries; they are
# exempt. This is the "frontmatter is the canon membership card" line (SCHEMA §1).
CANON_TYPES = {"concept", "hub", "project", "source", "meta",
               "practice", "person", "question", "spore", "specialist", "maker"}

PALACE_DEFAULT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

# Pull a scalar value out of a YAML frontmatter block. Handles quoted and bare forms.
TITLE_RE = re.compile(r'^title:\s*(.+?)\s*$', re.M)
TYPE_RE = re.compile(r'^type:\s*(.+?)\s*$', re.M)


def is_skipped_prefix(rel):
    r = rel.replace(os.sep, "/")
    return any(r.startswith(p) for p in SKIP_PREFIXES)


def _unquote(val):
    val = val.strip()
    if len(val) >= 2 and val[0] == val[-1] and val[0] in ("'", '"'):
        val = val[1:-1]
    return val


def read_frontmatter(path):
    """Return (title, type) from the leading YAML frontmatter block, each None if
    absent. Only reads the block between the first two '---' fences."""
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            head = f.read(4096)
    except OSError:
        return None, None
    if not head.startswith("---"):
        return None, None
    end = head.find("\n---", 3)
    if end == -1:
        return None, None
    block = head[3:end]
    mt = TITLE_RE.search(block)
    ty = TYPE_RE.search(block)
    title = _unquote(mt.group(1)) if mt else None
    typ = _unquote(ty.group(1)) if ty else None
    return title, typ


# Characters not allowed (or best avoided) in filenames across the filesystems the palace
# targets. A title that reduces to the filename once these are removed is as close as a
# filename can get - not a mismatch worth flagging.
FS_ILLEGAL = str.maketrans("", "", '/\\:*?"<>|')


def filename_safe_equal(title, stem):
    """True when `title` differs from `stem` only by filesystem-illegal characters
    (e.g. title 'Does X?' vs file 'Does X'). Collapses the double spaces a removed
    character can leave behind."""
    reduced = re.sub(r"\s+", " ", title.translate(FS_ILLEGAL)).strip()
    return reduced == stem


def in_scope(rel, only):
    """True when `only` is None (whole palace), or the entry is named, or a named file
    lives in its bundle folder (matched case-insensitively, the way E1 looks for it)."""
    if only is None:
        return True
    r = rel.replace(os.sep, "/")
    if r in only:
        return True
    folder = r[:-3].lower() + "/"
    return any(p.lower().startswith(folder) for p in only)


def check_entries(root, only=None):
    """Walk the palace; for every canon entry (in scope), run both checks. Returns
    (errors, warnings) as string lists."""
    errors = []
    warnings = []
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        # Real on-disk sibling directory names in this folder (case preserved).
        sibling_dirs = set(dns)
        sibling_dirs_lower = {d.lower(): d for d in dns}
        for fn in fns:
            if not fn.endswith(".md"):
                continue
            ap = os.path.join(dp, fn)
            rel = os.path.relpath(ap, root)
            if is_skipped_prefix(rel) or not in_scope(rel, only):
                continue
            # Symlinks (e.g. the `_`-spelled @import aliases FOUR_PILLARS.md ->
            # 'FOUR PILLARS.md') carry a title from their real target on purpose;
            # the real file is checked on its own. Skip the alias.
            if os.path.islink(ap):
                continue
            title, typ = read_frontmatter(ap)
            # Only canon entries (SCHEMA §1 type) are bound by §3/§8. Bundle files
            # and working artifacts carry a title but no canon type - exempt.
            if typ not in CANON_TYPES:
                continue
            stem = fn[:-3]  # filename minus .md

            # E1 (ERROR) - a sibling bundle folder must match the stem EXACTLY, not
            # just case-insensitively (SCHEMA §8). Only fires when a miscased match
            # exists (the case-insensitive FS otherwise hides the split).
            real = sibling_dirs_lower.get(stem.lower())
            if real is not None and real != stem and stem not in sibling_dirs:
                errors.append(
                    f'E1  bundle-folder miscase for {rel}:  folder "{real}/"  should be  "{stem}/"')

            # W1 (WARNING) - title should equal the filename minus .md (SCHEMA §3).
            # Skip when the only difference is a filesystem-illegal character.
            if (title is not None and title != stem
                    and not filename_safe_equal(title, stem)):
                warnings.append(
                    f'W1  title != filename in {rel}:  title "{title}"  vs  file "{stem}.md"')
    return errors, warnings


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
    """[palace-root] positional + optional --paths a,b,c (root-relative files to check)."""
    root, raw = None, None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--paths" and i + 1 < len(args):
            raw = (raw or []) + args[i + 1].split(",")
            i += 2
        elif not args[i].startswith("--"):
            root = args[i]; i += 1
        else:
            i += 1
    root = os.path.abspath(root or PALACE_DEFAULT)
    return root, (normalize_paths(raw, root) if raw is not None else None)


def main():
    root, only = parse_args()
    if not os.path.isdir(root):
        sys.exit(f"not a directory: {root}")

    errors, warnings = check_entries(root, only)
    errors = sorted(set(errors))
    warnings = sorted(set(warnings))

    print(f"entry-naming lint - root: {root}")
    if only is not None:
        missing = sorted(p for p in only if not os.path.exists(os.path.join(root, p)))
        print(f"  scoped to {len(only)} named path(s)")
        for p in missing:
            print(f"  note: named path not found under root: {p}")
    print()
    if errors:
        print(f"ERRORS ({len(errors)}):")
        for x in errors:
            print("  " + x)
        print()
    if warnings:
        print(f"WARNINGS ({len(warnings)}):")
        for x in warnings:
            print("  " + x)
        print()
    if not errors and not warnings:
        print("clean - every bundle folder is exact-case and every title matches its filename.\n")
    print(f"summary: {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
