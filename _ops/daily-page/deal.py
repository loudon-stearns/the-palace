#!/usr/bin/env python3
"""deal.py — the Daily Page's dealer: one palace page a day, by a shuffle made once.

The practice (README.md beside this file): every morning Loudon and a Claude sit with one
page, until every page has been sat with. This tool answers one question — which page is
today's — and keeps the only record a fresh session needs to answer it tomorrow.

How the deal works

  The deck    Every canon entry, by the same rule the map uses (`_entries` in
              _ops/swarm/entry-use.py — a .md carrying a canon `type:`, symlinks and tool
              folders set aside). A lap's deck is the entries born on or before the day the
              lap began; pages born later wait for the next lap, so a lap has a finish line.
              Set aside: anything under a `tests`, `fixtures` or `experiments` folder. The
              map's rule counts a few such files as entries (two test fixtures and two
              experiment notes, 2026-10-13); they are not pages, and a morning is not spent
              on them. The map itself is left as it is.
  The shuffle A random seed is drawn once, when a lap begins, and kept in lap.json. A page's
              place is the hash of seed + title. Nothing is stored per page, so a rename or
              a new page never needs the deck rebuilt.
  A day       One page per calendar day. Dealing twice on one day returns the same page, so
              two sessions on the same morning agree.
  A miss      A page that was dealt and not sat with does not come back the next day. The
              next day is a new page. Missed pages come round again after every page has
              had its first turn, and the lap closes only when all are sat.

State is two small files: lap.json (lap number, seed, start date) and visits.jsonl (one line
per event: dealt, sat). They are tracked, and they live in this script's folder in the MAIN
checkout — the trunk — even when the script is run from a worktree, the way every worktree
appends to the trunk's one board (Worktree Practice § How the ceremonies live here). They ride
the morning's commit on main, when the morning closes (The Daily Page § The close).

The deck and the pages are read from the trunk as well. Canon is main; and `_entries` sees
nothing at all from a root under .claude/, where app-made worktrees live.

If the main checkout is not on `main`, a deal or a --sat refuses and says why: the record
there is a branch's copy, and writing to it would fork the lap. --peek and --status still
print, with a warning. `--state DIR` overrides the folder (tests); `--root DIR` the tree read.

Usage
  python3 _ops/daily-page/deal.py                 # deal today's page and print its brief
  python3 _ops/daily-page/deal.py --peek          # show what today's would be; record nothing
  python3 _ops/daily-page/deal.py --status        # where the lap stands
  python3 _ops/daily-page/deal.py --sat "Entry" --verdict keep --feel "..." --made "..."
  python3 _ops/daily-page/deal.py --sat "Entry" --verdict fold --into "Sibling"   # a fold names its target
  python3 _ops/daily-page/deal.py --sat "Entry" --verdict revive                  # a dormant page only
  python3 _ops/daily-page/deal.py --json          # the brief as JSON
Options: --date YYYY-MM-DD (pretend it is another day), --state DIR, --root DIR.
"""
import argparse, datetime, hashlib, importlib.util, json, os, re, secrets, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
VERDICTS = ["keep", "trim", "tune", "fold", "compost", "revive", "open"]
# Folders whose files are never pages, whatever frontmatter they carry (see "Set aside" above).
SET_ASIDE_PARTS = {"tests", "fixtures", "experiments"}
# The stages a page may be revived from (Revival Ceremony, precondition 1).
ASLEEP = {"dormant", "composting"}


def find_root(start: Path) -> Path:
    """The checkout this script sits in: the nearest parent holding CLAUDE.md and _ops/."""
    for p in [start, *start.parents]:
        if (p / "CLAUDE.md").exists() and (p / "_ops").is_dir():
            return p
    sys.exit("deal.py: could not find the palace root above " + str(start))


def main_checkout(root: Path) -> Path:
    """The main worktree's path — the first entry `git worktree list` prints."""
    try:
        out = subprocess.run(["git", "-C", str(root), "worktree", "list", "--porcelain"],
                             capture_output=True, text=True, check=True).stdout
        for line in out.splitlines():
            if line.startswith("worktree "):
                return Path(line[len("worktree "):])
    except (OSError, subprocess.CalledProcessError):
        pass
    return root


def current_branch(checkout: Path) -> str:
    """The branch a checkout is on; '' when its HEAD is detached or git cannot say."""
    try:
        return subprocess.run(["git", "-C", str(checkout), "branch", "--show-current"],
                              capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return ""


def load_entries(root: Path) -> dict:
    """title -> relative path, by the map's node rule (adopted from entry-use.py, not rewritten)."""
    src = root / "_ops" / "swarm" / "entry-use.py"
    if not src.exists():
        sys.exit(f"deal.py: no palace at {root} (looked for {src}). If this session cannot see "
                 "the main checkout, it cannot deal — tell Loudon.")
    spec = importlib.util.spec_from_file_location("entry_use", src)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod._entries(root)


def frontmatter(path: Path) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return ""
    m = re.match(r"^---\n([\s\S]*?)\n---", text)
    return m.group(1) if m else ""


def field(fm: str, name: str) -> str:
    m = (re.search(rf'^{name}:\s*"((?:[^"\\]|\\.)*)"\s*$', fm, re.M)
         or re.search(rf"^{name}:\s*'((?:[^'\\]|\\.)*)'\s*$", fm, re.M)
         or re.search(rf"^{name}:\s*(.+)$", fm, re.M))
    return m.group(1).strip() if m else ""


def typed_links(fm: str) -> list:
    """[{target, type, label}] from the frontmatter links list (dashed or inline form)."""
    out = []
    block = re.split(r"\n(?=\s*-\s*\{?\s*target:)", "\n" + fm)
    for chunk in block:
        t = re.search(r'target:\s*"?\[\[([^\]]+)\]\]"?', chunk)
        if not t:
            continue
        ty = re.search(r"\btype:\s*\"?([A-Za-z-]+)", chunk)
        lb = re.search(r"\blabel:\s*\"?([^\n\",}]+)", chunk)
        out.append({"target": t.group(1).split("|")[0].strip(),
                    "type": ty.group(1) if ty else "",
                    "label": lb.group(1).strip() if lb else ""})
    return out


def rank(seed: str, title: str) -> str:
    return hashlib.sha256(f"{seed}\n{title}".encode("utf-8")).hexdigest()


def read_lap(state: Path, today: str, write: bool) -> dict:
    f = state / "lap.json"
    if f.exists():
        return json.loads(f.read_text(encoding="utf-8"))
    lap = {"lap": 1, "seed": secrets.token_hex(16), "started": today}
    if write:
        state.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps(lap, indent=2) + "\n", encoding="utf-8")
    return lap


def read_visits(state: Path) -> list:
    f = state / "visits.jsonl"
    if not f.exists():
        return []
    out = []
    for ln in f.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if ln:
            try:
                out.append(json.loads(ln))
            except json.JSONDecodeError:
                print(f"deal.py: skipped an unreadable line in {f}", file=sys.stderr)
    return out


def append_visit(state: Path, event: dict):
    state.mkdir(parents=True, exist_ok=True)
    line = json.dumps(event, ensure_ascii=False) + "\n"
    fd = os.open(state / "visits.jsonl", os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o644)
    try:
        os.write(fd, line.encode("utf-8"))
    finally:
        os.close(fd)


def build(root: Path, state: Path, today: str, write: bool) -> dict:
    """Everything the deal knows: the lap, its deck, what has been dealt and sat."""
    found = load_entries(root)
    if not found:        # before the lap is read, so a wrong root never draws a seed
        sys.exit(f"deal.py: found no canon entries under {root}. Wrong root?")
    entries = {t: rel for t, rel in found.items()
               if not (SET_ASIDE_PARTS & set(Path(rel).parts))}
    set_aside = sorted(t for t in found if t not in entries)
    lap = read_lap(state, today, write)
    born = {}
    for title, rel in entries.items():
        b = field(frontmatter(root / rel), "born")[:10]
        born[title] = b
    deck = sorted((t for t in entries if not born[t] or born[t] <= lap["started"]),
                  key=lambda t: rank(lap["seed"], t))
    visits = [v for v in read_visits(state) if v.get("lap") == lap["lap"]]
    sat = {v["entry"]: v for v in visits if v.get("event") == "sat"}
    dealt_count = {}
    for v in visits:
        if v.get("event") == "dealt":
            dealt_count[v["entry"]] = dealt_count.get(v["entry"], 0) + 1
    missed = {v["entry"] for v in visits
              if v.get("event") == "dealt" and v.get("date", "") < today and v["entry"] not in sat}
    return {"lap": lap, "entries": entries, "deck": deck, "visits": visits,
            "sat": sat, "dealt_count": dealt_count, "missed": missed, "set_aside": set_aside,
            "waiting": sorted(t for t in entries if t not in deck)}


def pick(s: dict, today: str):
    """Today's page, and whether it was already dealt today."""
    for v in s["visits"]:
        if v.get("event") == "dealt" and v.get("date") == today and v["entry"] in s["entries"]:
            return v["entry"], True
    left = [t for t in s["deck"] if t not in s["sat"]]
    if not left:
        return None, False
    order = {t: i for i, t in enumerate(s["deck"])}
    return min(left, key=lambda t: (s["dealt_count"].get(t, 0), order[t])), False


def brief(root: Path, s: dict, title: str, today: str) -> dict:
    rel = s["entries"][title]
    path = root / rel
    fm = frontmatter(path)
    text = path.read_text(encoding="utf-8")
    body = re.sub(r"^---\n[\s\S]*?\n---\n?", "", text)
    bundle = path.parent / title
    out_links = typed_links(fm)
    inbound = []
    for other, orel in s["entries"].items():
        if other == title:
            continue
        for l in typed_links(frontmatter(root / orel)):
            if l["target"] == title:
                inbound.append({"from": other, "type": l["type"], "label": l["label"]})
    prior = [v for v in s["visits"] if v.get("event") == "sat" and v.get("date", "") < today]
    yesterday = max(prior, key=lambda v: v["date"])["entry"] if prior else None
    return {
        "date": today, "lap": s["lap"]["lap"], "entry": title, "path": rel,
        "type": field(fm, "type"), "stage": field(fm, "stage"), "born": field(fm, "born"),
        "words": len(body.split()),
        "forward_vector": field(fm, "forward_vector"),
        "revival_conditions": field(fm, "revival_conditions"),
        "has_agency_profile": bool(re.search(r"^agency_profile:", fm, re.M)),
        "has_rich_face": (bundle / f"{title} — rich.json").exists(),
        "has_scroll": (bundle / f"{title} — scroll.md").exists(),
        "has_context": (path.parent / f"{title} — Context.md").exists()
                       or (bundle / f"{title} — Context.md").exists(),
        "bundle": str(bundle.relative_to(root)) if bundle.is_dir() else None,
        "links_out": [dict(l, path=s["entries"].get(l["target"])) for l in out_links],
        "links_in": [dict(l, path=s["entries"].get(l["from"])) for l in inbound],
        "times_dealt_before": 1 if title in s["missed"] else 0,
        "yesterday": yesterday,
        "standing": standing(s),
    }


def standing(s: dict) -> dict:
    return {"deck": len(s["deck"]), "sat": len([t for t in s["sat"] if t in s["deck"]]),
            "missed": len(s["missed"]), "set_aside": len(s["set_aside"]),
            "waiting_for_next_lap": len(s["waiting"]), "started": s["lap"]["started"]}


def print_brief(b: dict):
    st = b["standing"]
    print(f"THE DAILY PAGE — {b['date']} — lap {b['lap']}, page {st['sat'] + 1} of {st['deck']}")
    print(f"\n  {b['entry']}")
    print(f"  {b['path']}")
    print(f"  {b['type']} · {b['stage']} · born {b['born'] or '?'} · {b['words']} words")
    if b["times_dealt_before"]:
        print("  dealt on an earlier day and not sat with; this is its second turn")
    print(f"\n  forward vector: {b['forward_vector'] or '(none)'}")
    if b["stage"].strip("\"'") in ASLEEP:
        print(f"  this page is {b['stage']}: the morning's question is whether it should be revived")
        print(f"  revival conditions: {b['revival_conditions'] or '(none written)'}")
    have = [n for n, k in (("agency profile", "has_agency_profile"), ("rich face", "has_rich_face"),
                           ("scroll", "has_scroll"), ("Context", "has_context")) if b[k]]
    lack = [n for n, k in (("agency profile", "has_agency_profile"), ("rich face", "has_rich_face"),
                           ("scroll", "has_scroll"), ("Context", "has_context")) if not b[k]]
    print(f"  has: {', '.join(have) or 'nothing beyond its text'}")
    print(f"  lacks: {', '.join(lack) or 'nothing'}")
    print(f"  bundle: {b['bundle'] or '(no folder)'}")
    print(f"\n  siblings it points to ({len(b['links_out'])}):")
    for l in b["links_out"]:
        where = l["path"] or "(no such entry — a forward ghost)"
        print(f"    {l['type']:<14} [[{l['target']}]]  {l['label']}  — {where}")
    print(f"\n  siblings that point to it ({len(b['links_in'])}):")
    for l in b["links_in"]:
        print(f"    {l['type']:<14} [[{l['from']}]]  {l['label']}  — {l['path']}")
    print(f"\n  yesterday's page: {b['yesterday'] or '(none yet)'}")
    print(f"  the lap: {st['sat']} sat of {st['deck']} · {st['missed']} dealt and missed · "
          f"{st['waiting_for_next_lap']} born since {st['started']}, waiting for the next lap")


def main():
    ap = argparse.ArgumentParser(description="Deal the Daily Page.")
    ap.add_argument("--peek", action="store_true", help="show today's page; record nothing")
    ap.add_argument("--status", action="store_true", help="where the lap stands")
    ap.add_argument("--sat", metavar="ENTRY", help="record that a page was sat with")
    ap.add_argument("--verdict", choices=VERDICTS, help="with --sat; revive is for a dormant page")
    ap.add_argument("--into", help="with --verdict fold, and required there: the sibling it folds into")
    ap.add_argument("--feel", help="with --sat: Loudon's answer to 'how do you feel?'")
    ap.add_argument("--made", help="with --sat: what was made for the rich face, if anything")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--date", help="YYYY-MM-DD, for tests")
    ap.add_argument("--state", type=Path)
    ap.add_argument("--root", type=Path)
    a = ap.parse_args()

    here_root = find_root(HERE)
    trunk = main_checkout(here_root)
    root = (a.root or trunk).resolve()
    state = a.state or (trunk / HERE.relative_to(here_root))
    today = a.date or datetime.date.today().isoformat()
    read_only = a.peek or a.status

    if a.state is None:
        branch = current_branch(trunk)
        if branch != "main":
            where = f"on {branch}" if branch else "on a detached HEAD"
            msg = (f"deal.py: the main checkout ({trunk}) is {where}, not on main. The record in "
                   "it is a branch's copy (Worktree Practice § The primary is the canon trunk).")
            if read_only:
                print(msg + " Showing what is there; do not trust it.", file=sys.stderr)
            else:
                sys.exit(msg + " Nothing was recorded. Tell Loudon before dealing.")

    s = build(root, state, today, write=not read_only)

    if a.status:
        st = standing(s)
        if a.json:
            print(json.dumps(st, indent=2))
        else:
            print(f"lap {s['lap']['lap']}, begun {st['started']}: {st['sat']} sat of {st['deck']} · "
                  f"{st['missed']} dealt and missed · {st['waiting_for_next_lap']} waiting for the next lap"
                  f" · {st['set_aside']} set aside as not pages")
            for v in sorted(s["sat"].values(), key=lambda v: v["date"], reverse=True)[:10]:
                print(f"  {v['date']}  {v['entry']}  — {v.get('verdict', '')}"
                      + (f" into {v['into']}" if v.get("into") else ""))
        return

    if a.sat:
        if a.sat not in s["entries"]:
            sys.exit(f"deal.py: no canon entry titled {a.sat!r}")
        if not a.verdict:
            sys.exit("deal.py: --sat needs --verdict (" + ", ".join(VERDICTS) + ")")
        if a.verdict == "fold":
            if not a.into:
                sys.exit("deal.py: a fold names the page it folds into: add --into \"<Sibling>\". "
                         "Nothing was recorded.")
            if a.into not in s["entries"] or a.into == a.sat:
                sys.exit(f"deal.py: --into {a.into!r} is not another canon entry. Nothing was recorded.")
        elif a.into:
            sys.exit("deal.py: --into goes with --verdict fold. Nothing was recorded.")
        if a.verdict == "revive":
            stage = field(frontmatter(root / s["entries"][a.sat]), "stage").strip("\"'")
            if stage not in ASLEEP:
                sys.exit(f"deal.py: {a.sat!r} is {stage or 'unstaged'}, not dormant; only a sleeping "
                         "page is revived. Nothing was recorded.")
        ev = {"date": today, "lap": s["lap"]["lap"], "entry": a.sat, "event": "sat",
              "verdict": a.verdict}
        for k in ("into", "feel", "made"):
            if getattr(a, k):
                ev[k] = getattr(a, k)
        append_visit(state, ev)
        print(f"recorded: sat with {a.sat} on {today} — {a.verdict}"
              + (f" into {a.into}" if a.into else ""))
        return

    title, already = pick(s, today)
    if title is None:
        print(f"Lap {s['lap']['lap']} is complete: all {len(s['deck'])} pages have been sat with. "
              f"{len(s['waiting'])} pages born since are waiting. A new lap is Loudon's call.")
        return
    if not already and not a.peek:
        append_visit(state, {"date": today, "lap": s["lap"]["lap"], "entry": title, "event": "dealt"})
    b = brief(root, s, title, today)
    if title in s["sat"]:
        b["already_sat_today"] = True
    if a.json:
        print(json.dumps(b, indent=2, ensure_ascii=False))
    else:
        print_brief(b)
        if b.get("already_sat_today"):
            print("\n  (already sat with today)")


if __name__ == "__main__":
    main()
