#!/usr/bin/env python3
"""deal.py — the Daily Page's dealer: one palace page a day, by a shuffle made once.

The practice (README.md beside this file): every morning Loudon and a Claude sit with one
page, until every page has been sat with. This tool answers one question — which page is
today's — and keeps the only record a fresh session needs to answer it tomorrow.

How the deal works

  The deck    Every canon entry, by the same rule the map uses (`_entries` in
              _ops/swarm/entry-use.py — a .md carrying a canon `type:`, symlinks, tool
              folders and proofs folders set aside). A lap's deck is the entries born on or before the day the
              lap began; pages born later wait for the next lap, so a lap has a finish line.
              Set aside: anything under a `tests`, `fixtures` or `experiments` folder. The
              map's rule counts a few such files as entries (two test fixtures and two
              experiment notes, 2026-10-13); they are not pages, and a morning is not spent
              on them. The map itself is left as it is.
  Siblings    The brief's siblings come from the ring: the newest map in _ops/maps/, read by
              palace-map.py's loader, so the dealer and `near` answer from one graph. With no
              map it falls back to scanning frontmatter, and the brief says which it used.
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
  python3 _ops/daily-page/deal.py --sat "Entry" --verdict revive                  # a sleeping page, or a spore
  python3 _ops/daily-page/deal.py --json          # the brief as JSON
  python3 _ops/daily-page/deal.py --closed "Entry" --landed <commit>   # after the landing: the board's close
  python3 _ops/daily-page/deal.py --closed "Entry" --let-go            # on Loudon's word: a morning let go by name
  python3 _ops/daily-page/deal.py --undone [--all]                     # the close's list of undone mornings
Options: --date YYYY-MM-DD (pretend it is another day), --state DIR, --root DIR, --board FILE,
--sessions DIR.

A --sat is dated by its page's deal, not by the clock: a sit that runs past midnight, or a close
made days late, is recorded on the day the page was dealt, beside its dealt line. A page sat
with no open deal is recorded today; --date, when given, wins.

The board (Loudon, 2026-11-03: "a flag we post on stigmergy for daily page started, daily page
closed"). A deal posts the morning's start to the SYSTEM board as a SESSION_INIT from "The Daily
Page", naming the page and the folder and branch the session woke in; a second deal the same day
posts nothing. `--closed` posts the close after the landing, and refuses a landing not on main, or
a morning whose branch or folder still holds work; `--let-go` posts a let-go, on Loudon's word.
Nothing is let go on its own.

The list (Loudon, 2026-11-09: "every day at the close, list the undone daily page work, and give
links"). `--undone` lists every morning of the lap not yet done, newest first, each with where it
stopped and a link that opens its app session. Done is: its page sat, or its close posted, on or
after its deal, with nothing left on its branch or in its folder; or let go by name. A morning's
folder and branch come from its start on the board, else from its session's record; its session
from the app's own records on this Mac (title "Daily Page · <Entry>", which the scheduled task
sets), read and never written. Today's morning is not listed. The brief counts the list.

The board is advisory: a deal never fails because the board cannot be reached, and the brief says
what was not posted. Every git read of another folder runs with GIT_OPTIONAL_LOCKS=0, so it takes
no lock there. With --state, the board is read and written only when --board FILE names one, and
--sessions DIR reads a test's records in place of the app's, so a test touches neither.
"""
import argparse, datetime, hashlib, importlib.util, json, os, re, secrets, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
VERDICTS = ["keep", "trim", "tune", "fold", "compost", "revive", "open"]
# Folders whose files are never pages, whatever frontmatter they carry (see "Set aside" above).
SET_ASIDE_PARTS = {"tests", "fixtures", "experiments"}
# The stages a page may be revived from; a `type: spore` is asleep at any stage (Revival Ceremony v2.1).
ASLEEP = {"dormant", "composting"}


def asleep(stage, typ):
    """A page the Revival may wake: dormant or composting, or a spore whatever its stage."""
    return stage.strip("\"'") in ASLEEP or typ.strip("\"'") == "spore"


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


def entry_use(root: Path):
    """entry-use.py, the map's own module: its node rule, its link rule, its system folders."""
    src = root / "_ops" / "swarm" / "entry-use.py"
    if not src.exists():
        sys.exit(f"deal.py: no palace at {root} (looked for {src}). If this session cannot see "
                 "the main checkout, it cannot deal — tell Loudon.")
    spec = importlib.util.spec_from_file_location("entry_use", src)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load_files(root: Path, mod) -> dict:
    """stem -> relative path for every .md the map would look at, page or not, so a link to a
    bundle file, or one written with its folder (`[[Shop/Lettering]]`), still finds its file
    (tuning items 59, 63). The system folders are pruned as the walk goes, which is what
    `_excluded` would say of every file under them, and costs a fraction of the full walk."""
    out = {}
    for d, dirs, names in os.walk(root):
        dirs[:] = sorted(x for x in dirs if x not in mod.EXCLUDE_PARTS)
        for n in sorted(names):
            p = Path(d) / n
            if n.endswith(".md") and not p.is_symlink():
                out.setdefault(p.stem, str(p.relative_to(root)))
    return out


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
    mod = entry_use(root)
    found = mod._entries(root)   # title -> relative path, by the map's node rule (adopted, not rewritten)
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
            "waiting": sorted(t for t in entries if t not in deck),
            "files": load_files(root, mod), "link_rule": mod._target}


def resolve(s: dict, target: str):
    """Where a link lands, by the map's own link rule (alias and heading cut, `.md` dropped, a
    folder prefix ignored): (path, True) for a page, (path, False) for a file that is not a
    page, (None, False) when nothing of that name exists — a forward ghost (items 59, 63)."""
    t = s["link_rule"](target)
    if t in s["entries"]:
        return s["entries"][t], True
    if t in s["files"]:
        return s["files"][t], False
    return None, False


def sat_date(s: dict, entry: str, today: str) -> str:
    """The day a sit is recorded under: the day its page was dealt, so a sit that crosses midnight
    or closes days late stays beside its deal (tuning item 61). The latest deal of the page that no
    sit has answered counts; a page with no open deal is recorded today."""
    sat_days = [v.get("date", "") for v in s["visits"] if v.get("event") == "sat" and v["entry"] == entry]
    open_deals = [v["date"] for v in s["visits"]
                  if v.get("event") == "dealt" and v["entry"] == entry and v.get("date", "") <= today
                  and not any(d >= v["date"] for d in sat_days)]
    return max(open_deals) if open_deals else today


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


def siblings(root: Path, s: dict, title: str, fm: str):
    """The page's siblings from the ring — the newest map in root/_ops/maps/, read by
    palace-map.py's own loader — so the dealer and `near` answer from one graph (The Daily
    Page § Step 1). Falls back to the frontmatter scan when there is no map, and says so."""
    tool = root / "_ops" / "swarm" / "palace-map.py"
    maps = sorted((root / "_ops" / "maps").glob("palace-map-full-*.json"))
    if tool.exists() and maps:
        spec = importlib.util.spec_from_file_location("palace_map", tool)
        pm = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(pm)
        d = pm.load(str(maps[-1]))
        if title in d["_nodes"]:
            out = [{"target": e["target"], "type": e["type"], "label": e.get("label") or ""}
                   for way, e in d["_adj"].get(title, []) if way == "out"]
            inn = [{"from": e["source"], "type": e["type"], "label": e.get("label") or ""}
                   for way, e in d["_adj"].get(title, []) if way == "in"]
            return out, inn, f"map {d['meta'].get('generated', '?')}"
        why = f"not a node in map {d['meta'].get('generated', '?')} (born since the build?)"
    else:
        why = "no map in _ops/maps/ (run _ops/swarm/build-map.py)"
    inbound = []
    for other, orel in s["entries"].items():
        if other == title:
            continue
        for l in typed_links(frontmatter(root / orel)):
            if s["link_rule"](l["target"]) == title:
                inbound.append({"from": other, "type": l["type"], "label": l["label"]})
    return typed_links(fm), inbound, f"frontmatter — {why}"


def brief(root: Path, s: dict, title: str, today: str) -> dict:
    rel = s["entries"][title]
    path = root / rel
    fm = frontmatter(path)
    text = path.read_text(encoding="utf-8")
    body = re.sub(r"^---\n[\s\S]*?\n---\n?", "", text)
    bundle = path.parent / title
    out_links, inbound, siblings_from = siblings(root, s, title, fm)
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
        "rich_face_waiting": rich_face_waiting(bundle / f"{title} — rich.json"),
        "has_scroll": (bundle / f"{title} — scroll.md").exists(),
        "plan": scroll_zone(bundle / f"{title} — scroll.md", "plan"),
        "standing_orders": scroll_zone(bundle / f"{title} — scroll.md", "orders"),
        "has_context": (path.parent / f"{title} — Context.md").exists()
                       or (bundle / f"{title} — Context.md").exists(),
        "bundle": str(bundle.relative_to(root)) if bundle.is_dir() else None,
        "links_out": [dict(l, **dict(zip(("path", "is_entry"), resolve(s, l["target"]))))
                      for l in out_links],
        "links_in": [dict(l, path=s["entries"].get(l["from"])) for l in inbound],
        "siblings_from": siblings_from,
        "times_dealt_before": 1 if title in s["missed"] else 0,
        "yesterday": yesterday,
        "standing": standing(s),
    }


def scroll_zone(scroll: Path, zone: str):
    """The text of one zone of the page's scroll — `plan` or `orders` (SCHEMA — Reference §8, `scroll`):
    what sits between `<!-- scroll:<zone>:start -->` and its end marker. None when the page has no
    scroll, the zone is missing, or it holds only its italic placeholder line."""
    if not scroll.exists():
        return None
    text = scroll.read_text(encoding="utf-8")
    m = re.search(rf"<!--\s*scroll:{zone}:start\s*-->\n?([\s\S]*?)<!--\s*scroll:{zone}:end\s*-->", text)
    if not m:
        return None
    body = m.group(1).strip()
    lines = [l for l in body.splitlines() if l.strip()]
    if not lines or all(l.strip().startswith("_") and l.strip().endswith("_") for l in lines):
        return None
    return body


def rich_face_waiting(manifest: Path):
    """What the page's rich face still waits on Loudon for: sections at `status: proposal` and
    open offers (Enrichment § Proposal and approval; the fields are in _ops/rich-face/README.md).
    None when the page has no face; a section with no status counts as approved."""
    if not manifest.exists():
        return None
    try:
        m = json.loads(manifest.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {"unreadable": True}
    sections = [x for x in (m.get("sections") or []) if isinstance(x, dict)]
    proposal = [x for x in sections if x.get("status") == "proposal"]
    offers = [o for o in (m.get("offers") or []) if isinstance(o, dict) and (o.get("status") or "open") == "open"]
    return {"sections": len(sections), "proposal_sections": len(proposal),
            "proposal_headings": [x.get("heading") for x in proposal], "open_offers": len(offers)}


def standing(s: dict) -> dict:
    return {"deck": len(s["deck"]), "sat": len([t for t in s["sat"] if t in s["deck"]]),
            "missed": len(s["missed"]), "set_aside": len(s["set_aside"]),
            "waiting_for_next_lap": len(s["waiting"]), "started": s["lap"]["started"]}


# ── The board and the list of undone mornings (see the header) ──────────────────────────
BOARD_FROM = "The Daily Page"       # the page is the agent (SCHEMA — Reference §9, field conventions)
BOARD_SESSION = "the-daily-page"    # one slug for every morning
SESSION_KIND = "daily_page"
TITLE = "Daily Page · "             # the scheduled task names each morning's session so (scheduled-task/SKILL.md)
LIST_CAP = 10                       # the list at the close shows the newest ten and counts the rest
APP_SESSIONS = Path.home() / "Library" / "Application Support" / "Claude" / "claude-code-sessions"


def board_bridge():
    """_ops/commons/board.py: the palace's one Python path to the board, through its validator."""
    sys.path.insert(0, str(HERE.parent))
    from commons import board
    return board


def git_read(cwd, *args):
    """A git read that takes no optional lock, so it never writes in a folder another session uses."""
    try:
        p = subprocess.run(["git", "-C", str(cwd), *args], capture_output=True, text=True, timeout=30,
                           env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"})
    except (OSError, subprocess.TimeoutExpired):
        return None
    return p.stdout.strip() if p.returncode == 0 else None


def woke_in() -> dict:
    """The folder and branch this command was run from: where the morning's session works."""
    top = git_read(Path.cwd(), "rev-parse", "--show-toplevel")
    return {"dir": top, "branch": git_read(top, "branch", "--show-current") if top else None}


def marks(board, board_file) -> tuple:
    """The Daily Page's marks on the board: its starts keyed by (date, entry), and its closes."""
    if board is None:
        return {}, []
    mine = board.read(lambda m: m.get("from") == BOARD_FROM and m.get("board") == "SYSTEM"
                      and (m.get("payload") or {}).get("session_kind") == SESSION_KIND, board_file)
    starts = {}
    for m in mine:
        if m.get("type") == "SESSION_INIT":
            p = m.get("payload") or {}
            starts.setdefault((p.get("date"), p.get("entry")), m)
    return starts, [m for m in mine if m.get("type") == "SESSION_CLOSE"]


def answers(closes: list, entry: str) -> list:
    """(date, outcome) of every close or let-go posted for a page."""
    return [((m.get("payload") or {}).get("date") or "", (m.get("payload") or {}).get("outcome"))
            for m in closes if (m.get("payload") or {}).get("entry") == entry]


def session_records(sessions_dir: Path) -> dict:
    """Each morning's app session, from the app's own records on this Mac, read and never written:
    title -> [{id, created, cwd, branch, archived}]. Only the titles the scheduled task gives a morning
    are kept. The records are the app's, not the palace's: if the app moves them, none are found."""
    out = {}
    for f in sessions_dir.glob("*/*/local_*.json"):
        try:
            r = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        t = r.get("title") or ""
        if not t.startswith(TITLE) or not r.get("sessionId"):
            continue
        made = datetime.datetime.fromtimestamp((r.get("createdAt") or 0) / 1000).date().isoformat()
        out.setdefault(t, []).append({"id": r["sessionId"], "created": made, "cwd": r.get("cwd"),
                                      "branch": r.get("branch"), "archived": bool(r.get("isArchived"))})
    return out


def session_for(records: dict, entry: str, date: str, until) -> dict:
    """A morning's session: titled for its page, made on its day or the day before, and before the
    page's next deal; an open session before an archived one, then the newest."""
    lo = (datetime.date.fromisoformat(date) - datetime.timedelta(days=1)).isoformat()
    found = [r for t, rs in records.items() if t == TITLE + entry or t.startswith(f"{TITLE}{entry} (")
             for r in rs if lo <= r["created"] and (until is None or r["created"] < until)]
    return max(found, key=lambda r: (not r["archived"], r["created"])) if found else None


def held(trunk: Path, folder, branch, unmerged: set) -> dict:
    """What a morning's branch and folder still hold, read and never touched: the commits on its branch
    that main lacks, and the unsaved paths in its folder while the folder is still on that branch. A
    folder the app has handed to another branch is not read: what it holds is no longer this morning's
    to name. The main checkout's own folder is never read here."""
    out = {"commits": 0, "unsaved": 0, "folder": folder, "branch": branch, "folder_state": None}
    if branch and branch in unmerged:
        n = git_read(trunk, "rev-list", "--count", f"main..refs/heads/{branch}")
        out["commits"] = int(n) if n and n.isdigit() else 0
    if folder and Path(folder).resolve() != trunk.resolve():
        if not Path(folder).is_dir():
            out["folder_state"] = "gone"
        elif git_read(folder, "branch", "--show-current") != branch:
            out["folder_state"] = "on another branch"
        else:
            st = git_read(folder, "status", "--porcelain")
            out["unsaved"] = len([l for l in (st or "").splitlines() if l.strip()])
            out["folder_state"] = "on its branch"
    return out


def unmerged_branches(trunk: Path) -> set:
    return set((git_read(trunk, "branch", "--no-merged", "main", "--format=%(refname:short)") or "").split())


def where_held(h: dict) -> str:
    bits = []
    if h["commits"]:
        bits.append(f"{h['commits']} commit(s) on {h['branch']} not on main")
    if h["unsaved"]:
        bits.append(f"{h['unsaved']} unsaved path(s) in {h['folder']}")
    return ", ".join(bits) or "nothing"


def morning_where(trunk: Path, s: dict, date: str, entry: str, starts: dict, records: dict, unmerged: set):
    """A morning's session, and what its branch and folder hold: the folder and branch from its start
    on the board when there is one, else from its session's record."""
    later = [v["date"] for v in s["visits"]
             if v.get("event") == "dealt" and v["entry"] == entry and v.get("date", "") > date]
    sess = session_for(records, entry, date, min(later) if later else None)
    wt = (((starts.get((date, entry)) or {}).get("payload") or {}).get("worktree") or {})
    folder = wt.get("dir") or (sess or {}).get("cwd")
    branch = wt.get("branch") or (sess or {}).get("branch")
    return sess, held(trunk, folder, branch, unmerged)


def undone(trunk: Path, s: dict, today: str, board, board_file, sessions_dir: Path) -> list:
    """Every morning of the lap not yet done, newest first (Loudon, 2026-11-09: "every day at the
    close, list the undone daily page work"). A morning is done when its page was sat, or its close
    posted, on or after its deal, and its branch and folder hold nothing main lacks; or when he let it
    go by name. Nothing is let go here. Today's morning is not listed: it is still today's."""
    starts, closes = marks(board, board_file)
    records = session_records(sessions_dir)
    unmerged = unmerged_branches(trunk)
    out = []
    for d, entry in sorted({(v["date"], v["entry"]) for v in s["visits"] if v.get("event") == "dealt"}):
        if d >= today:
            continue
        after = [o for d2, o in answers(closes, entry) if d2 >= d]
        if "let go" in after:
            continue
        sat = any(v.get("event") == "sat" and v["entry"] == entry and v.get("date", "") >= d
                  for v in s["visits"])
        closed = "closed" in after
        sess, h = morning_where(trunk, s, d, entry, starts, records, unmerged)
        work = h["commits"] or h["unsaved"]
        if not work and (sat or closed):
            continue
        if work:
            stopped = ("closed, then more work" if closed else "close stopped" if sat
                       else "sat, close owed") + ": " + where_held(h)
        else:
            stopped = "greeted only" if sess else "dealt, not sat (no session found)"
        out.append({"date": d, "entry": entry, "stopped": stopped, "held": h,
                    "session": sess["id"] if sess else None,
                    "archived": bool(sess and sess["archived"])})
    return sorted(out, key=lambda r: r["date"], reverse=True)


def undone_lines(rows: list, every: bool) -> list:
    """The list at the close, one line a morning, each with a link that opens its session."""
    if not rows:
        return ["No undone Daily Page mornings."]
    shown = rows if every else rows[:LIST_CAP]
    out = [f"Undone Daily Page mornings: {len(rows)}, newest first."]
    for r in shown:
        link = (f"[{TITLE}{r['entry']}](#{r['session']})" + (" (session archived)" if r["archived"] else "")
                if r["session"] else "no session found")
        out.append(f"- {r['date']} · {r['entry']} — {r['stopped']} — {link}")
    if len(rows) > len(shown):
        out.append(f"- and {len(rows) - len(shown)} more, the oldest from {rows[-1]['date']}: "
                   "`deal.py --undone --all`")
    return out


def board_post(board, board_file, typ: str, payload: dict, suffix: str, re_id=None) -> dict:
    """Post one mark through the validator; never raises (the board is advisory)."""
    try:
        msg = board.make_message(typ, "SYSTEM", payload, from_=BOARD_FROM, to="*",
                                 session_id=BOARD_SESSION, re=re_id)
        msg["id"] = f"{msg['id']}-daily-page-{suffix}"   # two marks made in one run never share an id
        res = board.post(msg, silent=True, board_file=board_file)
    except Exception as e:                                # node missing, git missing: say so, carry on
        return {"ok": False, "reason": f"{type(e).__name__}: {e}"}
    if res.get("ok"):
        return {"ok": True, "id": msg["id"]}
    return {"ok": False, "reason": res.get("reason") or "; ".join(
        f"{x.get('path')}: {x.get('message')}" for x in res.get("errors") or [])}


def start_payload(lap: int, today: str, title: str, path: str, where: dict) -> dict:
    return {"session_kind": SESSION_KIND, "text": f"Daily Page started · {today} · {title}",
            "lap": lap, "date": today, "entry": title, "path": path, "worktree": where}


def close_payload(date: str, entry: str, outcome: str, **extra) -> dict:
    word = "closed" if outcome == "closed" else "let go"
    return {"session_kind": SESSION_KIND, "text": f"Daily Page {word} · {date} · {entry}",
            "date": date, "entry": entry, "outcome": outcome,
            **{k: v for k, v in extra.items() if v is not None}}


def post_start(s: dict, today: str, title: str, path: str, board_file, post: bool) -> dict:
    """At a deal: post today's start, once a day. With post False (--peek) it posts nothing."""
    board = board_bridge()
    starts, _ = marks(board, board_file)
    mine = [m for (d, _e), m in starts.items() if d == today]
    if mine:
        return {"ok": True, "id": mine[0].get("id"), "already": True}
    if not post:
        return None
    return board_post(board, board_file, "SESSION_INIT",
                      start_payload(s["lap"]["lap"], today, title, path, woke_in()), f"start-{today}")


def print_board(start, count):
    if count is not None:
        print(f"  undone mornings: {count} (the list is at the close: deal.py --undone)")
    if isinstance(start, str):
        print(f"  the board: {start}")
    elif start is None:
        print("  the board: today's start would be posted (nothing is posted on --peek)")
    elif start.get("already"):
        print("  the board: today's start is already posted")
    elif start.get("ok"):
        print(f"  the board: today's start posted ({start['id']})")
    else:
        print(f"  the board: today's start was NOT posted ({start.get('reason')}); say so at the hello")


def print_brief(b: dict):
    st = b["standing"]
    print(f"THE DAILY PAGE — {b['date']} — lap {b['lap']}, page {st['sat'] + 1} of {st['deck']}")
    print(f"\n  {b['entry']}")
    print(f"  {b['path']}")
    print(f"  {b['type']} · {b['stage']} · born {b['born'] or '?'} · {b['words']} words")
    if b["times_dealt_before"]:
        print("  dealt on an earlier day and not sat with; this is its second turn")
    print(f"\n  forward vector: {b['forward_vector'] or '(none)'}")
    for name, key in (("plan", "plan"), ("standing orders", "standing_orders")):
        if b.get(key):
            print(f"\n  {name}, from the scroll:")
            for line in b[key].splitlines():
                print(f"    {line}")
        else:
            print(f"  {name}: (none on the scroll)" if b["has_scroll"] else f"  {name}: (no scroll)")
    if asleep(b["stage"], b.get("type", "")):
        print(f"  this page is asleep ({b['stage']}{', a spore' if b.get('type','').strip(chr(34)+chr(39)) == 'spore' else ''}): the morning's question is whether it should be revived")
        print(f"  revival conditions: {b['revival_conditions'] or '(none written)'}")
    have = [n for n, k in (("agency profile", "has_agency_profile"), ("rich face", "has_rich_face"),
                           ("scroll", "has_scroll"), ("Context", "has_context")) if b[k]]
    lack = [n for n, k in (("agency profile", "has_agency_profile"), ("rich face", "has_rich_face"),
                           ("scroll", "has_scroll"), ("Context", "has_context")) if not b[k]]
    print(f"  has: {', '.join(have) or 'nothing beyond its text'}")
    print(f"  lacks: {', '.join(lack) or 'nothing'}")
    w = b.get("rich_face_waiting")
    if w:
        if w.get("unreadable"):
            print("  the rich face's manifest could not be read: open it by hand")
        elif w["proposal_sections"] or w["open_offers"]:
            print(f"  the rich face waits on Loudon: {w['proposal_sections']} of {w['sections']} section(s) at proposal, "
                  f"{w['open_offers']} open offer(s) — tell him at the hello and urge him to look "
                  f"(node _ops/rich-face/proposals.mjs lists them)")
        else:
            print("  the rich face is approved; nothing on it waits")
    print(f"  bundle: {b['bundle'] or '(no folder)'}")
    print(f"\n  siblings, from the {b['siblings_from']}")
    print(f"  siblings it points to ({len(b['links_out'])}):")
    for l in b["links_out"]:
        where = (l["path"] if l["is_entry"] else f"{l['path']} (a file, not a page)" if l["path"]
                 else "(no page or file of that name — a forward ghost)")
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
    ap.add_argument("--verdict", choices=VERDICTS, help="with --sat; revive is for a sleeping page or a spore")
    ap.add_argument("--into", help="with --verdict fold, and required there: the sibling it folds into")
    ap.add_argument("--feel", help="with --sat: Loudon's answer to 'how do you feel?'")
    ap.add_argument("--made", help="with --sat: what was made for the rich face, if anything")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--date", help="YYYY-MM-DD: pretend it is another day (tests). A --sat without "
                                   "it is dated by its page's deal")
    ap.add_argument("--state", type=Path)
    ap.add_argument("--root", type=Path)
    ap.add_argument("--closed", metavar="ENTRY", help="post the morning's close to the board, after the landing")
    ap.add_argument("--landed", metavar="COMMIT", help="with --closed: the landing's commit")
    ap.add_argument("--let-go", action="store_true",
                    help="with --closed, on Loudon's word: post the close as let go, whatever the morning left")
    ap.add_argument("--board", type=Path, help="a board file to use instead of the persistent board (tests)")
    ap.add_argument("--undone", action="store_true",
                    help="the list of undone mornings, with a link to each one's session (the close's last step)")
    ap.add_argument("--all", action="store_true", help=f"with --undone: every line, not the newest {LIST_CAP}")
    ap.add_argument("--sessions", type=Path, help="a folder of app session records to read instead (tests)")
    a = ap.parse_args()

    here_root = find_root(HERE)
    trunk = main_checkout(here_root)
    root = (a.root or trunk).resolve()
    state = a.state or (trunk / HERE.relative_to(here_root))
    today = a.date or datetime.date.today().isoformat()
    read_only = a.peek or a.status or a.undone

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

    # The board: the persistent one, unless --board names a file; under --state, only a named file.
    use_board = a.state is None or a.board is not None
    board_file = a.board

    if a.closed and not use_board:
        sys.exit("deal.py: --closed under --state needs --board FILE, so a test never posts to the "
                 "real board. Nothing was posted.")
    if (a.landed or a.let_go) and not a.closed:
        sys.exit("deal.py: --landed and --let-go go with --closed. Nothing was posted.")

    sessions_dir = a.sessions or APP_SESSIONS
    s = build(root, state, today, write=not read_only)

    if a.undone:
        rows = undone(trunk, s, today, board_bridge() if use_board else None, board_file, sessions_dir)
        print(json.dumps(rows, indent=2, ensure_ascii=False) if a.json
              else "\n".join(undone_lines(rows, a.all)))
        return

    if a.closed:
        board = board_bridge()
        starts, closes = marks(board, board_file)
        done = [d for d, _o in answers(closes, a.closed)]
        mornings = sorted(v["date"] for v in s["visits"] if v.get("event") == "dealt"
                          and v["entry"] == a.closed and v.get("date", "") <= today
                          and not any(d >= v["date"] for d in done))
        if not mornings:
            print(f"deal.py: no open morning for {a.closed!r}: nothing posted.")
            return
        d = mornings[-1]
        if a.landed and git_read(trunk, "merge-base", "--is-ancestor", a.landed, "main") is None:
            sys.exit(f"deal.py: {a.landed} is not a commit on main, and closed means on main. "
                     "Nothing was posted.")
        _sess, h = morning_where(trunk, s, d, a.closed, starts, session_records(sessions_dir),
                                 unmerged_branches(trunk))
        if not a.let_go and (h["commits"] or h["unsaved"]):
            sys.exit(f"deal.py: the morning of {d} still holds work: {where_held(h)}. Land or commit it "
                     "first, or let it go by name with --let-go on Loudon's word. Nothing was posted.")
        outcome = "let go" if a.let_go else "closed"
        start = starts.get((d, a.closed))
        res = board_post(board, board_file, "SESSION_CLOSE",
                         close_payload(d, a.closed, outcome, landed=a.landed,
                                       by="Loudon's word" if a.let_go else None,
                                       left=where_held(h) if a.let_go else None),
                         f"{'let-go' if a.let_go else 'closed'}-{d}", re_id=start.get("id") if start else None)
        if not res.get("ok"):
            sys.exit(f"deal.py: the close was not posted ({res.get('reason')}). The morning's commits "
                     "stand; run this again when the board answers.")
        print(f"posted: Daily Page {outcome} · {d} · {a.closed} ({res['id']})")
        return

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
            fm = frontmatter(root / s["entries"][a.sat])
            stage = field(fm, "stage").strip("\"'")
            if not asleep(stage, field(fm, "type")):
                sys.exit(f"deal.py: {a.sat!r} is {stage or 'unstaged'} and not a spore; only a sleeping "
                         "page is revived. Nothing was recorded.")
        when = today if a.date else sat_date(s, a.sat, today)
        ev = {"date": when, "lap": s["lap"]["lap"], "entry": a.sat, "event": "sat",
              "verdict": a.verdict}
        for k in ("into", "feel", "made"):
            if getattr(a, k):
                ev[k] = getattr(a, k)
        append_visit(state, ev)
        print(f"recorded: sat with {a.sat} on {when} — {a.verdict}"
              + (f" into {a.into}" if a.into else "")
              + (f" (dated by its deal; today is {today})" if when != today else ""))
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
    if use_board:
        try:
            b["board"] = post_start(s, today, title, b["path"], board_file, post=not a.peek)
        except Exception as e:      # advisory: a board that cannot be reached never stops the deal
            b["board"] = f"could not be reached ({type(e).__name__}: {e}); say so at the hello"
    else:
        b["board"] = "not read (--state without --board)"
    try:
        b["undone"] = len(undone(trunk, s, today, board_bridge() if use_board else None, board_file,
                                 sessions_dir))
    except Exception:               # the count is a convenience; the list at the close is the record
        b["undone"] = None
    if a.json:
        print(json.dumps(b, indent=2, ensure_ascii=False))
    else:
        print_brief(b)
        print()
        print_board(b["board"], b["undone"])
        if b.get("already_sat_today"):
            print("\n  (already sat with today)")


if __name__ == "__main__":
    main()
