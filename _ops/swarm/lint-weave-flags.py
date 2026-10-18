#!/usr/bin/env python3
"""lint-weave-flags.py — the mechanical check for Weave postcondition 2b.

Reads the persistent blackboard, finds `weave_flag` BROADCASTs on the WEAVE
board, and reports which are still OPEN. Mirrors the git-touch resolution logic
of `_ops/stigmergy/list-handoffs.mjs`.

Why this exists: postcondition 2b ("the weave_flag inbox has been read and every
open flag acted on or explicitly declined") was honour-system — the sibling
postconditions 2d/2e/2f each have a linter that gates the commit, but 2b did not,
so a Weave launched by a side door (e.g. a baton whose move-list omits Step 1c)
could silently skip it. This makes 2b mechanical, so it can no longer be missed
regardless of how the Weave was launched. (The Palace Hardens Around Values: a
rule earns a gate once its check proves mechanical — and this one is.)

Two kinds of flag (Weave Ceremony Step 1c):

  - An ENTRY flag names its `source_entries` and asks for something done to them.
  - A PROPAGATE flag (`flag_type: propagate`) carries a decision to every page it
    reaches. It names no source entries, so no touch can close it. It may carry a
    `pattern`: a regex that a page still needing the change matches. The linter
    counts those pages (`git grep -E` over `paths`; by default every tracked .md
    except session folders, archives, ledgers, diaries and Contexts, which keep the
    old form on purpose), so every weave sees how far the decision has spread. The
    pattern is passed to git grep as an argument, never to a shell.

The QUEUE deck reads the same lines (`queue-model.js` reconcileWeaveFlags): a trailer
greys any flag, a decline greys an entry flag, a carried line shows on a propagate
card, and no touch closes anything. One difference stands: a GRANT/DENY clicked on
the deck hides an entry flag, and this linter, which reads git and not the board's
answers, still counts it open. A propagate flag is never hidden that way. This linter
is the gate; the deck is the reading surface. Resolution here:
  - explicit: a commit carries `Palace-Resolves: <id>`, or a `Declined flag <id>: <reason>`
    line. Only those two forms, and a decline never closes a propagate flag: only
    Loudon retires one, by a trailer written on his word. (Until 2026-10-18 any commit body that named the id
    counted, so the commit that posted a flag and listed it "resolved" it.)
  - touched (entry flags only): a commit AFTER the flag touched a file named exactly
    `<source_entry>.md`. Reported as TOUCHED-UNVERIFIED: entry files are high-traffic,
    so the Weave reads each one by hand and closes it with a trailer. `--strict`
    counts touches as open, the deck's eventual rule.
  - carried (propagate flags only): with `--since DATE`, a commit since that date
    carries a `Carried flag <id>: <how far>` line. The flag stays on the board for the
    next weave, but this weave has done its part. Without `--since`, carried lines are
    ignored and an unfinished propagate flag counts as open.
`--board PATH` reads another board file — from a worktree, pass main's live
`_ops/swarm/persistent/blackboard.jsonl` (the worktree's copy is only what was committed).

A flag withdrawn by a RETRACT (`re: <id>`) is not counted at all.

Older flags carry `target` + `note` instead of `source_entries` + `proposed_action`.
The board can't touch-close those (it watches source_entries only), so neither does
this linter: they close by trailer or decline. They are displayed with their real ask.

Exit 1 if any OPEN flags remain; run it in the Step 6.5 closing-linter block as
`lint-weave-flags.py --since <the date the weave began>`.
Read-only — it never resolves a flag; the Weave does that by acting and recording it.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

PALACE = Path(__file__).resolve().parent.parent.parent
BOARD = PALACE / "_ops" / "swarm" / "persistent" / "blackboard.jsonl"
# History keeps the old form on purpose (ledgers never trim; archives and Contexts record what was),
# so a pattern searches only the pages that state the present.
DEFAULT_PATHS = ["*.md", ":(exclude)_ops/swarm/sessions", ":(exclude)*/Archive/*",
                 ":(exclude)*— tuning.md", ":(exclude)*— diary.md",
                 ":(exclude)*— Context.md", ":(exclude)*— context.md"]


def git(args):
    try:
        return subprocess.check_output(["git", "-C", str(PALACE)] + args,
                                       text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


def basename(t):
    t = str(t).split("|")[0].split("#")[0].strip().strip("[]")
    if t.endswith(".md"):
        t = t[:-3]
    if "/" in t:
        t = t.split("/")[-1]
    return t.strip()


def parse_ts(t):
    from datetime import datetime
    try:
        return datetime.fromisoformat(str(t).replace("Z", "+00:00")).timestamp()
    except Exception:
        return None


def commit_log(since_ts):
    """[(epoch, body, {basenames of touched .md files})] for commits since the oldest flag."""
    out = git(["-c", "core.quotePath=false", "log", f"--since={since_ts}",
               "--format=\x1e%cI\x1f%B\x1f", "--name-only"])
    commits = []
    for chunk in out.split("\x1e"):
        if not chunk.strip():
            continue
        date, _, rest = chunk.partition("\x1f")
        body, _, files = rest.partition("\x1f")
        names = {Path(f.strip()).stem for f in files.splitlines() if f.strip().endswith(".md")}
        commits.append((parse_ts(date.strip()), body, names))
    return commits


def resolution_lines(text):
    """The lines of commit bodies that can close a flag: trailers and decline lines."""
    return [l for l in text.splitlines()
            if re.match(r"\s*Palace-Resolves:", l) or re.search(r"\b[Dd]eclined? flag\b", l)]


def still_matching(p):
    """Pages a propagate flag's pattern still finds, or None when it carries no pattern."""
    pattern = p.get("pattern")
    if not isinstance(pattern, str) or not pattern.strip():
        return None
    paths = p.get("paths") if isinstance(p.get("paths"), list) and p.get("paths") else DEFAULT_PATHS
    out = git(["-c", "core.quotePath=false", "grep", "-l", "-I", "-E", "-e", pattern, "--"] + [str(x) for x in paths])
    return [l for l in out.splitlines() if l.strip()]


def main():
    global BOARD
    strict = "--strict" in sys.argv
    if "--board" in sys.argv:   # a worktree carries its own committed board; point at main's live one
        BOARD = Path(sys.argv[sys.argv.index("--board") + 1])
    since = None
    if "--since" in sys.argv:
        since = parse_ts(sys.argv[sys.argv.index("--since") + 1])
        if since is None:
            print("--since takes a date, e.g. --since 2026-10-21")
            return 2
    if not BOARD.exists():
        print("no persistent board found — nothing to check.")
        return 0

    # Collect weave_flag BROADCASTs (latest object per id wins), and every RETRACT's `re`
    # (SCHEMA — Reference §9: a mistaken post is withdrawn by appending a RETRACT naming it).
    flags, retracted = {}, set()
    for line in BOARD.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or ('"weave_flag"' not in line and '"RETRACT"' not in line):
            continue
        try:
            m = json.loads(line)
        except Exception:
            continue
        if m.get("type") == "RETRACT":
            if m.get("re"):
                retracted.add(m["re"])
            continue
        p = m.get("payload", {})
        if p.get("kind") != "weave_flag":
            continue
        flags[m.get("id", "")] = {"ts": m.get("ts", ""), "from": m.get("from", ""), "p": p}

    stamps = [parse_ts(f["ts"]) for f in flags.values() if parse_ts(f["ts"])]
    oldest = min(stamps) if stamps else 0
    if since is not None:
        oldest = min(oldest, since) if stamps else since
    from datetime import datetime, timezone
    commits = commit_log(datetime.fromtimestamp(oldest, timezone.utc).isoformat()) if (stamps or since) else []
    # explicit ids may predate the oldest flag's clock, so read every commit's closing lines
    closing = "\n".join(resolution_lines(git(["log", "--format=%B"])))
    resolves = "\n".join(l for l in closing.splitlines() if re.match(r"\s*Palace-Resolves:", l))
    carried_lines = []
    if since is not None:
        carried_lines = [l for c in commits if c[0] is not None and c[0] >= since
                         for l in c[1].splitlines() if re.search(r"\bCarried flag\b", l)]

    withdrawn = sorted(fid for fid in flags if fid in retracted)
    for fid in withdrawn:
        del flags[fid]
    open_flags, touched, explicit, carried, spreading = [], [], [], [], []
    for fid, f in flags.items():
        p = f["p"]
        if fid and fid in (resolves if p.get("flag_type") == "propagate" else closing):
            explicit.append((fid, f))
            continue
        if p.get("flag_type") == "propagate":
            f["left"] = still_matching(p)
            if any(fid in l for l in carried_lines):
                carried.append((fid, f))
            else:
                open_flags.append((fid, f))
            spreading.append((fid, f))
            continue
        ft = parse_ts(f["ts"])
        sources = {basename(e) for e in (p.get("source_entries") or []) if basename(e)}
        hit = None
        if ft is not None and sources:
            hit = next((c for c in commits if c[0] is not None and c[0] > ft and sources & c[2]), None)
        if hit and not strict:
            touched.append((fid, f))
        else:
            open_flags.append((fid, f))

    def ask(p):
        act = p.get("proposed_action") or p.get("note") or ""
        return act.replace("\n", " ")

    def where(p):
        src = ", ".join(p.get("source_entries") or [])
        if src:
            return f"source: {src}"
        if p.get("flag_type") == "propagate":
            return f"home: {p.get('target_entry') or '—'}  ·  scope: {p.get('scope') or '—'}  ·  rhythm: {p.get('rhythm') or 'sweep'}"
        if p.get("target") or p.get("note"):
            return f"target: {p.get('target') or p.get('target_entry') or '—'}  (older flag shape — closes by trailer/decline only)"
        return f"target: {p.get('target_entry') or '—'}  (names no source entry — closes by trailer/decline only)"

    def left(f):
        pages = f.get("left")
        if pages is None:
            return "no pattern — the check is a reader's: " + (f["p"].get("check") or "—").replace("\n", " ")[:120]
        if not pages:
            return "pattern finds no page — the check is clean; close it with Palace-Resolves"
        shown = ", ".join(pages[:6]) + (f", … +{len(pages) - 6}" if len(pages) > 6 else "")
        return f"{len(pages)} page(s) still match: {shown}"

    print(f"weave-flags: {len(flags)} live on WEAVE board ({len(withdrawn)} retracted, not counted) | {len(explicit)} resolved explicitly (trailer/decline) | "
          f"{len(touched)} TOUCHED-UNVERIFIED | {len(carried)} carried this weave | {len(open_flags)} OPEN" + ("  [--strict: touches counted open]" if strict else ""))
    carried_ids = {fid for fid, _ in carried}
    if spreading:
        print("\nPROPAGATE — decisions still spreading across the palace:")
        for fid, f in sorted(spreading, key=lambda x: x[1]["ts"]):
            mark = "◑" if fid in carried_ids else "●"
            print(f"  {mark} {fid}  [{f['ts'][:10]} · {f['from']}]  {where(f['p'])}")
            print(f"      decision: {(f['p'].get('decision') or '—').replace(chr(10), ' ')[:140]}")
            print(f"      {left(f)}")
    if touched:
        print("\nTOUCHED-UNVERIFIED — a commit touched a source entry after the flag; read each by hand:")
        for fid, f in sorted(touched, key=lambda x: x[1]["ts"]):
            print(f"  ◐ {fid}  [{f['ts'][:10]} · {f['from']}]  {where(f['p'])}")
            print(f"      → {ask(f['p'])[:140]}")
    if open_flags:
        print("\nOPEN weave_flags — act (and carry Palace-Resolves: <id>), carry a propagate flag "
              "(Carried flag <id>: <how far>), or decline an entry flag in the Weave commit body:")
        for fid, f in sorted(open_flags, key=lambda x: x[1]["ts"]):
            print(f"  ● {fid}  [{f['ts'][:10]} · {f['from']}]  type={f['p'].get('flag_type')}")
            print(f"      {where(f['p'])}")
            print(f"      → {ask(f['p'])[:140]}")
    print(f"\nsummary: {len(open_flags)} open, {len(touched)} touched-unverified, {len(carried)} carried")
    return 1 if open_flags else 0


if __name__ == "__main__":
    sys.exit(main())
