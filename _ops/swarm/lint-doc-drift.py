#!/usr/bin/env python3
"""
Doc-Drift Linter - the Weave's checkable postcondition for foundational-doc consistency.

Companion to lint-link-directions.py. Where that linter checks the *graph* (typed-link
directionality), this one checks the *prose*: the recurring ways foundational docs drift
out of sync with each other and with the filesystem. Mechanical, deterministic, no API
calls, reads markdown directly (and runs each generated block's own builder in --check
mode, E4). Exit code 0 = clean (no errors), 1 = errors found.

The six drift mechanisms (see Palace Foundational Doc Drift Assessment, 2026-06-09):
  A  unmanaged mirrors        D  path/case drift (case-insensitive-FS masked)
  B  copied facts             E  stale snapshots
  C  dangling pins            F  trigger gaps

Checks implemented:
  ERRORS (high confidence - fail the build):
  E1  Case-colliding files  - two DISTINCT real files (different inodes) differing only by
                              case. On a case-insensitive volume two spellings of ONE file
                              share an inode and are NOT a collision - those are filtered out.
  E3  Wrong-case reference   - a referenced filename whose case doesn't match the real file
                              (a case-insensitive match exists). The FS resolves it; the
                              reference still misleads agents about the canonical name.
  E4  Stale generated block  - a block a builder computes into an entry (GENERATED_BLOCKS,
                              today The Shop.md's Roster) no longer matches what its builder
                              would write: its sources moved and nobody re-ran it.

  WARNINGS (lower confidence - review, don't necessarily block):
  W0  Broken path reference - a backtick-quoted CONCRETE path (no placeholder / command /
                              glob markers) resolving to neither a file nor a directory.
  W1  Dangling section pin  - a "[[Doc]] section" reference whose target file has no heading
                              matching those words.
  W2  Trigger coverage gap  - a trigger phrase on a ceremony not present in CLAUDE.md's
                              trigger table. A ceremony is a page carrying `trigger:` in its
                              frontmatter (SCHEMA v1.28), wherever it lives and whatever its
                              filename; its field and any **Trigger:** line in its body are
                              both checked. Bracketed slots are stripped before comparison
                              ("revive [entry]" -> "revive").
  W3  Generated-block source - a builder's own warning about a block's sources (a Shop page
                              of type specialist/maker with no `member-of [[The Shop]]` is
                              still listed), or a builder that could not run at all.

Usage: python3 _ops/swarm/lint-doc-drift.py [palace-root]
       (defaults to the palace root two levels above this script)
"""
from __future__ import annotations
import os, re, subprocess, sys
from collections import defaultdict

# Skipped when INDEXING the filesystem (these hold no referenceable palace artifacts).
# Note: Archive/ is intentionally NOT skipped here - docs legitimately reference archived
# files, so they must be in the index. Archive/working docs are excluded from the SCAN set
# instead (see TRANSIENT_MARKERS / foundational_scan_set).
SKIP_DIRS = {".git", ".obsidian", ".claude", "node_modules", ".venvs", "_tools",
             "venv", "__pycache__"}
REF_EXTS = (".md", ".py", ".jsonl", ".json", ".css", ".js", ".jsx", ".html",
            ".svg", ".tex", ".mjs", ".sh", ".yaml", ".yml")
# Markers that mean a backtick token is a template/command/glob, not a concrete path.
PLACEHOLDER_CHARS = set("[]<>{}|*")
PLACEHOLDER_STRS = ("...", "…", "  ")
COMMAND_WORDS = ("grep", "ls ", "cd ", "rm ", "mv ", "cp ", "node ", "python", "git ",
                 "cat ", "echo ", "find ", "ls-", "--", "<date>", "YYYY")
PLACEHOLDER_STEMS = {"foo", "entry", "entryname", "theme", "ceremony name", "slug",
                     "any-entry", "entry name", "x"}

PALACE_DEFAULT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

# Illustrative-example allowlist. Docs that describe the linters (or SCHEMA rules about
# naming) deliberately quote a *wrong* path to show what a broken/miscased reference looks
# like - e.g. Weave Ceremony §2f explains the entry-naming linter's E1 error by showing
# `Modes of collaboration/` beside `Modes of Collaboration.md`. Those strings are
# documentation, not real references, so path/case checks must not flag them. The allowlist
# is keyed on (citing-file, exact-token) so it stays precise: it exempts only the specific
# example in the specific doc, never masking a genuine drift elsewhere in the same file. To
# add an example that trips the linter, add its (relpath, token) pair here - don't edit the
# doc's example string (it's correct as documentation).
EXAMPLE_REF_ALLOWLIST = {
    ("_ops/Weave Ceremony.md", "Modes of collaboration/"),
}


def walk(root):
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            ap = os.path.join(dp, fn)
            yield ap, os.path.relpath(ap, root), False  # file
        yield dp, os.path.relpath(dp, root), True        # dir


def build_index(root):
    files = set(); dirs = set()
    lower_file = defaultdict(list)        # lower(relpath) -> [(relpath, inode), ...]
    basenames_lower = defaultdict(list)   # lower(basename) -> [relpath, ...]
    for ap, rp, is_dir in walk(root):
        if is_dir:
            dirs.add(rp.rstrip("/") + "/")
            continue
        files.add(rp)
        try:
            ino = os.stat(ap).st_ino
        except OSError:
            ino = -1
        lower_file[rp.lower()].append((rp, ino))
        basenames_lower[os.path.basename(rp).lower()].append(rp)
    return files, dirs, lower_file, basenames_lower


def check_case_collisions(lower_file):
    """E1 - distinct inodes that differ only by case (genuine collision, not one file)."""
    out = []
    for lp, entries in sorted(lower_file.items()):
        inodes = {ino for _, ino in entries if ino >= 0}
        names = sorted({rp for rp, _ in entries})
        if len(names) > 1 and len(inodes) > 1:
            out.append("E1  case-colliding distinct files (edit to one diverges from the other): "
                       + "  vs  ".join(names))
    return out


PATH_RE = re.compile(r"`([^`\n]+?)`")


def is_concrete_path(tok):
    t = tok.strip()
    if not t or t.startswith(("http", "[[", "$", "//", "@", ".", "/")):
        return False          # leading "." kills bare-extension fragments (`.md`, `.svg`)
    if "://" in t:
        return False          # protocol URIs (obsidian://, file://, computer:///)
    if any(c in PLACEHOLDER_CHARS for c in t):
        return False
    if any(s in t for s in PLACEHOLDER_STRS):
        return False
    low = t.lower()
    if any(w in low for w in COMMAND_WORDS):
        return False
    stem = os.path.splitext(os.path.basename(t.rstrip("/")))[0].lower()
    if stem in PLACEHOLDER_STEMS:
        return False
    # placeholder example words appearing anywhere in the token (README's `Foo - handoff.md`,
    # SCHEMA's `Foo - source - borges.md`)
    if re.search(r"\b(foo|borges|entryname|nnn|yyyy|slug)\b", low):
        return False
    # must be a dir-ish path or a real-extension file
    return t.endswith("/") or ("/" in t and low.endswith(REF_EXTS)) or low.endswith(REF_EXTS)


def check_path_refs(root, files, dirs, basenames_lower, scan):
    """E3 wrong-case (ERROR) + W0 broken concrete path (WARN). Resolves refs both
    palace-root-relative AND relative to the citing doc's own directory."""
    errs, warns = [], []
    for rp in scan:
        docdir = os.path.dirname(rp)
        try:
            text = open(os.path.join(root, rp), encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        for m in PATH_RE.finditer(text):
            raw = m.group(1)
            if not is_concrete_path(raw):
                continue
            if (rp, raw.strip()) in EXAMPLE_REF_ALLOWLIST:
                continue  # deliberate illustrative example, not a real reference
            ref = raw.strip().lstrip("./")
            # candidate resolutions: as-given (root-relative) and doc-relative
            cands = {ref}
            if docdir:
                cands.add(os.path.normpath(os.path.join(docdir, ref)))
            if ref.endswith("/"):
                norm = {c.rstrip("/") + "/" for c in cands}
                if norm & dirs:
                    continue
                ci = [d for d in dirs if d.lower() in {c.lower() for c in norm}]
                if ci:
                    errs.append(f"E3  wrong-case dir ref in {rp}:  `{raw}`  ->  {ci[0]}")
                else:
                    warns.append(f"W0  broken dir ref in {rp}:  `{raw}`  (no such directory)")
                continue
            if cands & files:
                continue
            base = os.path.basename(ref)
            ci_base = basenames_lower.get(base.lower(), [])
            if ci_base:
                if not any(os.path.basename(r) == base for r in ci_base):
                    errs.append(f"E3  wrong-case ref in {rp}:  `{raw}`  ->  real file is  {ci_base[0]}")
            else:
                rel_ci = [r for r in files if r.lower() in {c.lower() for c in cands}]
                if rel_ci:
                    errs.append(f"E3  wrong-case ref in {rp}:  `{raw}`  ->  real file is  {rel_ci[0]}")
                else:
                    warns.append(f"W0  broken path ref in {rp}:  `{raw}`  (no such file)")
    return errs, warns


HEADING_RE = re.compile(r"^#{1,6}\s+(.*\S)\s*$", re.M)
PIN_RE = re.compile(r"\[\[([^\]]+?)\]\]\s*§\s*([A-Za-z0-9][^.,;:\n)]{2,40})")


def resolve_wikilink(name, basenames_lower):
    name = name.split("|")[0].split("#")[0].strip()
    return basenames_lower.get((name + ".md").lower(), [])


def check_section_pins(root, basenames_lower, scan):
    warns = []
    cache = {}
    for rp in scan:
        try:
            text = open(os.path.join(root, rp), encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        for m in PIN_RE.finditer(text):
            doc, section = m.group(1), m.group(2).strip()
            targets = resolve_wikilink(doc, basenames_lower)
            if not targets:
                continue
            tgt = os.path.join(root, targets[0])
            if tgt not in cache:
                try:
                    ttext = open(tgt, encoding="utf-8", errors="ignore").read()
                except OSError:
                    ttext = ""
                cache[tgt] = [h.lower() for h in HEADING_RE.findall(ttext)]
            words = [w for w in re.findall(r"[A-Za-z]+", section.lower()) if len(w) > 2]
            if not words:
                continue
            if not any(any(w in h for w in words) for h in cache[tgt]):
                warns.append(f"W1  dangling section pin in {rp}:  [[{doc}]] §{section}  "
                             f"(no matching heading in {targets[0]})")
    return warns


def strip_slots(phrase):
    """'revive [entry name]' -> 'revive' ; collapse whitespace."""
    return re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", phrase)).strip()


FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---", re.S)
QUOTED_RE = re.compile(r'"([^"]+)"|\'([^\']+)\'|[“”]([^“”]+)[“”]')


def trigger_field(text):
    """The phrases of a page's `trigger:` frontmatter field, or None when it has none.

    Reads the two shapes pages write - an inline list (`trigger: ["a", "b"]`), or a
    block list (`trigger:` then `  - "a"` lines) - and a bare string, without a YAML
    parser, so the linter keeps no dependencies.
    """
    m = FRONTMATTER_RE.match(text)
    if not m:
        return None
    lines = m.group(1).split("\n")
    for i, line in enumerate(lines):
        t = re.match(r"^trigger:[ \t]*(.*)$", line)
        if not t:
            continue
        value = t.group(1).strip()
        if value.startswith("["):
            return [a or b or c for a, b, c in QUOTED_RE.findall(value)] or None
        if value:
            q = QUOTED_RE.findall(value)
            return [q[0][0] or q[0][1] or q[0][2]] if q else [value]
        out = []
        for nxt in lines[i + 1:]:
            item = re.match(r"^\s+-\s+(.*)$", nxt)
            if not item:
                break
            q = QUOTED_RE.findall(item.group(1))
            out.append(q[0][0] or q[0][1] or q[0][2] if q else item.group(1).strip())
        return out or None
    return None


def check_trigger_coverage(root, basenames_lower):
    warns = []
    claude = basenames_lower.get("claude.md", [])
    if not claude:
        return warns
    ctext = open(os.path.join(root, claude[0]), encoding="utf-8", errors="ignore").read()
    m = re.search(r"Ceremony Triggers(.+?)(?:\n##\s|\Z)", ctext, re.S)
    table = m.group(1) if m else ctext
    claude_triggers = {strip_slots(q.lower()) for q in re.findall(r'"([^"]+)"', table)}
    claude_triggers |= {strip_slots(q.lower()) for q in re.findall(r"[“”]([^“”]+)[“”]", table)}
    claude_triggers.discard("")

    def covered(phrase):
        return any(phrase in ct or ct in phrase for ct in claude_triggers)

    for ap, rp, is_dir in walk(root):
        if is_dir or not rp.lower().endswith(".md") or os.path.islink(ap):
            continue
        if "Archive" in rp.split(os.sep):
            continue
        try:
            text = open(ap, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        field = trigger_field(text)
        if field is None:
            continue
        seen = set()
        for raw in field:
            phrase = strip_slots(raw.lower())
            if phrase and phrase not in seen and not covered(phrase):
                seen.add(phrase)
                warns.append(f"W2  trigger not in CLAUDE.md table:  \"{phrase}\"  (trigger: in {rp})")
        for tm in re.finditer(r"\*\*Trigger:?\*\*\s*(.+)", text):
            for a, b in re.findall(r'"([^"]+)"|[“”]([^“”]+)[“”]', tm.group(1)):
                phrase = strip_slots((a or b).lower())
                if phrase and phrase not in seen and not covered(phrase):
                    seen.add(phrase)
                    warns.append(f"W2  trigger not in CLAUDE.md table:  \"{phrase}\"  (**Trigger:** in {rp})")
    return warns


# Generated blocks - drift mechanism E (stale snapshots) with a builder behind it. Each is
# computed from the palace and committed into an entry, so it goes stale the moment its
# sources change without a re-run. No steward cycle edits a source (a change it wants waits
# in its tuning ledger), and a session that moves or re-statuses one does not re-run the
# builder either, so the check lives here, where the Weave, the Deposit and the Return
# already look. Each builder honours `--check`: exit 0
# when its block is current, exit 1 printing STALE when it is not, and every `warn:` line
# it prints is a finding about its sources. Add a block here when a second builder appears.
GENERATED_BLOCKS = [
    ("The Shop.md § Roster", "Shop/Maker/build-roster.mjs"),
]


def check_generated_blocks(root):
    """E4 stale generated block (ERROR) + W3 builder warning (WARN). Runs the root's own copy
    of each builder, so a worktree or sandbox root is checked as itself; a root without the
    builder has no block to check."""
    errs, warns = [], []
    for block, builder in GENERATED_BLOCKS:
        script = os.path.join(root, builder)
        if not os.path.isfile(script):
            continue
        try:
            r = subprocess.run(["node", script, "--check"], cwd=root,
                               capture_output=True, text=True, timeout=60)
        except (OSError, subprocess.TimeoutExpired) as ex:
            warns.append(f"W3  generated block not checked:  {block}  ({builder} --check could not run: {ex})")
            continue
        if r.returncode == 1 and "STALE" in r.stdout:
            errs.append(f"E4  stale generated block:  {block}  (its sources changed; refresh with: node {builder})")
        elif r.returncode != 0:
            last = (r.stderr.strip().splitlines() or ["no output"])[-1]
            warns.append(f"W3  generated block not checked:  {block}  ({builder} --check exited {r.returncode}: {last})")
        for line in (r.stdout + r.stderr).splitlines():
            m = re.match(r"\s*warn:\s*(.+)", line)
            if m:
                warns.append(f"W3  generated-block source in {block}:  {m.group(1)}")
    return errs, warns


# Transient/working docs are EXPECTED to reference moved/archived/example paths; excluding
# them from path checks keeps the signal on the canonical spec layer. (Case checks still
# run everywhere via E3 since a wrong-case canonical name is wrong wherever it appears.)
TRANSIENT_MARKERS = ("handoff", "audit", "to-do", "graffiti", "archive", "log",
                     "migration", "working doc", "staging", "assessment", "proposal",
                     "deposit archive", "map ")


def is_transient(rp):
    low = os.path.basename(rp).lower()
    return any(mk in low for mk in TRANSIENT_MARKERS)


def foundational_scan_set(files, include_transient=False):
    out = []
    for rp in files:
        if not rp.lower().endswith(".md"):
            continue
        parts = rp.split(os.sep)
        is_floor = len(parts) == 1
        is_ops = parts[0] == "_ops" and (len(parts) == 2 or "design-system" in rp)
        if not (is_floor or is_ops):
            continue
        if not include_transient and is_transient(rp):
            continue
        out.append(rp)
    return out


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else PALACE_DEFAULT)
    if not os.path.isdir(root):
        sys.exit(f"not a directory: {root}")

    files, dirs, lower_file, basenames_lower = build_index(root)
    scan = foundational_scan_set(files)

    errors, warns = [], []
    errors += check_case_collisions(lower_file)
    e, w = check_path_refs(root, files, dirs, basenames_lower, scan)
    errors += e; warns += w
    warns += check_section_pins(root, basenames_lower, scan)
    warns += check_trigger_coverage(root, basenames_lower)
    e, w = check_generated_blocks(root)
    errors += e; warns += w

    errors = sorted(set(errors)); warns = sorted(set(warns))

    print(f"doc-drift lint - root: {root}")
    print(f"  scanned {len(scan)} foundational docs, indexed {len(files)} files, {len(dirs)} dirs\n")
    if errors:
        print(f"ERRORS ({len(errors)}):")
        for x in errors:
            print("  " + x)
        print()
    if warns:
        print(f"WARNINGS ({len(warns)}):")
        for x in warns:
            print("  " + x)
        print()
    if not errors and not warns:
        print("clean - no drift detected.")
    print(f"summary: {len(errors)} errors, {len(warns)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
