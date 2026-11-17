"""Search Before You Build — light piece, remake: the same flat depth, eight days earlier.

Two steps, one script.
  python3 make2.py gather   reads git (the tree and log just before the fix, 8156fa3d^) into sources-v2.json
  python3 make2.py          reads only sources-v2.json, recomputes every number it draws, and writes
                            same-miss.svg and same-miss.png (Drawn SVG, headless Chrome at 2x)
The bench runs the second; sources-v2.json is the job's input and is hashed. No randomness.
"""
import json, re, subprocess, sys, datetime as dt
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
SRC = HERE / "sources-v2.json"
FIX = "8156fa3d"                        # GenAI Camera: auto-range depth (Track-IV lesson), 2026-07-09 11:48
P = FIX + "^"                           # the palace the moment before the fix
MISS = "2026-07-09"                     # the page: "Building the GenAI Camera on 2026-07-09"
CODE = ["min(dists)*0.82", "min(dists) * 0.82", "def subject_depth_range"]   # the bracket, every spelling found
MSG_RX = r"depth (is|was) flat|flat grey|flat 0\.2"                           # the symptom, said in a commit message
RANGE_RX = r"near/far|maprange|depth range|auto-rang|auto-fit|auto-derived"   # a page line about the range ...
WARN_RX = r"\b(flat|silhouette|grey|gray|compress\w*)\b"                      # ... that also names the symptom
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
MONO = "'JetBrains Mono','IBM Plex Mono','SF Mono',Menlo,monospace"


def git(*a):
    r = subprocess.run(["git", "-C", str(ROOT), "-c", "core.quotepath=off", *a], capture_output=True, text=True)
    if r.returncode not in (0, 1): raise RuntimeError(r.stderr)
    return r.stdout.strip()


def gather():
    code = []
    for pat in CODE:                    # where each spelling sat, and the commit that first wrote it anywhere
        files = sorted({l.split(":", 2)[1] for l in git("grep", "-n", "-F", pat, P, "--", "*.py").splitlines()})
        born = git("log", "--reverse", "--format=%h %aI", "-S" + pat, P).splitlines()[0].split()
        lines = [l.split(":", 1)[1] for l in git("grep", "-n", "-F", pat, P, "--", "*.py").splitlines()]
        code.append({"pattern": pat, "files": files, "first_commit": born[0], "first_when": born[1], "lines": lines})
    # per file, the first commit that holds the spelling (renames: pose_and_emit.py moved out of Artifacts/ on 06-16,
    # so for it the repo-wide birth above is the true date)
    per_file = []
    for c in code:
        for f in c["files"]:
            first = git("log", "--reverse", "--format=%h %aI", "-S" + c["pattern"], P, "--", f).splitlines()[0].split()
            born_paths = git("show", "--name-only", "--format=", c["first_commit"]).splitlines()
            if any(p != f and p.endswith("/" + f) for p in born_paths):     # the file was born elsewhere and moved
                first = [c["first_commit"], c["first_when"]]
            per_file.append({"file": f, "pattern": c["pattern"], "commit": first[0], "when": first[1]})
    msgs = []
    for line in git("log", P, "-i", "-E", "--grep=" + MSG_RX, "--format=%h %aI").splitlines():
        h, when = line.split()
        body = git("log", "-1", "--format=%B", h)
        said = [s.strip() for s in body.splitlines() if re.search(MSG_RX, s, re.I)]
        msgs.append({"commit": h, "when": when, "subject": body.splitlines()[0], "said": said})
    pages_named, pages_warned = [], []
    for l in git("grep", "-n", "-i", "-E", RANGE_RX, P, "--", "*.md").splitlines():
        _, f, n, text = l.split(":", 3)
        rec = {"file": f, "line": int(n), "text": text.strip()}
        (pages_warned if re.search(WARN_RX, text, re.I) else pages_named).append(rec)
    named_first = {}
    for r in pages_named:
        if r["file"] not in named_first:
            first = git("log", "--reverse", "--format=%h %aI", "-S" + r["text"][:40], P).splitlines()
            named_first[r["file"]] = first[0].split() if first else None
    fix_msg = git("log", "-1", "--format=%h%n%aI%n%B", FIX).split("\n")
    fix_page = [l[1:].strip() for l in git("show", FIX, "--format=", "--", "GenAI Camera.md").splitlines()
                if l.startswith("+") and re.search(r"reads \*\*flat", l)]
    depth_files = len(git("grep", "-l", "-i", "depth", P, "--", "Projects/*/proofs/*").splitlines())
    d = {"read_on": dt.date.today().isoformat(), "tree": P, "miss": MISS, "code": code, "per_file": per_file,
         "commit_messages": msgs, "page_lines_naming_the_range": pages_named,
         "page_lines_naming_range_and_symptom": pages_warned,
         "naming_first_commit": named_first,
         "fix": {"commit": fix_msg[0], "when": fix_msg[1], "subject": fix_msg[2]},
         "fix_page_line": fix_page,
         "depth_files_in_proofs_case_insensitive": depth_files,
         "regexes": {"message": MSG_RX, "range": RANGE_RX, "symptom": WARN_RX}}
    SRC.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n")
    print("wrote", SRC.name)


def facts(d):
    day = lambda iso: dt.date.fromisoformat(iso[:10])
    code_days = sorted({r["when"][:10] for r in d["per_file"]})
    bracket_days = sorted({r["when"][:10] for r in d["per_file"] if "0.82" in r["pattern"]})
    func_days = sorted({r["when"][:10] for r in d["per_file"] if "subject_depth_range" in r["pattern"]})
    # the page that names the auto-ranged near/far: its own first commit, not the code's
    auto = [r["file"] for r in d["page_lines_naming_the_range"] if re.search(r"auto-rang|auto-derived|auto-fit", r["text"], re.I)
            and re.search(r"depth|near", r["text"], re.I)]     # about depth, not any auto-derived thing
    page_named_day = min(d["naming_first_commit"][fl][1] for fl in auto)[:10]
    code_files = sorted({r["file"] for r in d["per_file"]})
    bracket_files = sorted({r["file"] for r in d["per_file"] if "0.82" in r["pattern"]})
    msg_days = sorted({m["when"][:10] for m in d["commit_messages"]})
    first_msg = min(d["commit_messages"], key=lambda m: m["when"])
    f = {
        "code_days": code_days,
        "bracket_days": bracket_days,
        "func_days": func_days,
        "page_named_day": page_named_day,
        "page_named_files": sorted(set(auto)),
        "n_code_files": len(code_files),
        "n_bracket_files": len(bracket_files),
        "bracket_born": min(r["when"] for r in d["per_file"] if "0.82" in r["pattern"])[:10],
        "n_messages": len(d["commit_messages"]),
        "message_days": msg_days,
        "first_message": first_msg,
        "quote": "depth is flat",
        "days_message_to_miss": (day(d["miss"]) - day(first_msg["when"])).days,
        "days_bracket_to_miss": (day(d["miss"]) - day(min(r["when"] for r in d["per_file"]))).days,
        "n_page_warnings_before": len(d["page_lines_naming_range_and_symptom"]),
        "page_naming_files": sorted({r["file"] for r in d["page_lines_naming_the_range"]}),
        "fix_time": d["fix"]["when"][11:16],
    }
    # checks: a second route to each number the piece draws
    assert f["quote"] in " ".join(" ".join(m["said"]) for m in d["commit_messages"]).lower(), "quote not in a message"
    assert all(m["when"][:10] < d["miss"] for m in d["commit_messages"])
    assert f["days_message_to_miss"] == (dt.date(2026, 7, 9) - dt.date(2026, 7, 1)).days == 8, f
    assert f["n_page_warnings_before"] == 0, d["page_lines_naming_range_and_symptom"]
    assert d["fix_page_line"], "the fix did not add the flat-depth warning to a page"
    return f


def draw(d, f):
    W, H = 1000, 474
    t0, t1 = dt.date(2026, 6, 11), dt.date(2026, 7, 11)
    X0, X1 = 150, 930
    x = lambda iso: X0 + (dt.date.fromisoformat(iso[:10]) - t0).days * (X1 - X0) / (t1 - t0).days
    g = []
    T = lambda xx, yy, s, size=16, fill=INK2, anchor="start", weight=400, extra="": g.append(
        f'<text x="{xx:.1f}" y="{yy:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>')
    L = lambda x1, y1, x2, y2, c=INK, w=1.5, extra="": g.append(
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}" {extra}/>')
    dot = lambda xx, yy, r=7, fill=INK, stroke=None: g.append(
        f'<circle cx="{xx:.1f}" cy="{yy}" r="{r}" fill="{fill}"' + (f' stroke="{stroke}" stroke-width="2"' if stroke else "") + "/>")

    T(40, 54, f"The same flat depth, {f['days_message_to_miss']} days earlier", 27, INK, weight=600)
    T(40, 86, "fixed, and said in words, in commit messages. Not in a page.", 17, INK2)

    LANES = {"code": 172, "commits": 262, "pages": 366}
    for name, y in LANES.items():
        L(X0 - 10, y, X1, y, RULE, 1)
        T(40, y + 6, name, 18, INK, weight=600)
    xm = x(d["miss"])

    # code: the bracket from 13 Jun, then subject_depth_range() on 1 Jul
    for day in f["bracket_days"]:
        dot(x(day), LANES["code"])
    T(x(f["bracket_days"][0]) - 7, LANES["code"] - 20, "near,far = min(dists)*0.82, max(dists)*1.12", 15, INK2)
    for day in f["func_days"]:                     # a different line doing the same job: a square, its own label
        xx = x(day)
        g.append(f'<rect x="{xx-7:.1f}" y="{LANES["code"]-7}" width="14" height="14" fill="{INK}"/>')
        T(xx - 7, LANES["code"] - 20, "subject_depth_range()", 15, INK2)

    # commits: the messages of 1 Jul
    xc = x(f["message_days"][0])
    dot(xc, LANES["commits"], 8)
    T(xc, LANES["commits"] - 20, "“" + f["quote"] + "”", 22, INK, "middle", 600)
    L(xc, LANES["commits"] + 22, xm, LANES["commits"] + 22, INK, 1.4, 'marker-start="url(#tick)" marker-end="url(#tick)"')
    T((xc + xm) / 2, LANES["commits"] + 46, f"{f['days_message_to_miss']} days", 18, INK, "middle", 600)

    # pages: named the range on 13 Jun (no symptom); first warning the day of the fix
    xp = x(f["page_named_day"])
    dot(xp, LANES["pages"], 7, PAPER, INK)
    T(xp - 7, LANES["pages"] - 16, "names the range, gives no warning", 16, INK3)
    dot(xm, LANES["pages"], 8, RED)

    # the miss
    L(xm, 128, xm, LANES["pages"] - 10, RED, 1.6, 'stroke-dasharray="5 4"')
    T(xm - 12, LANES["pages"] - 16, "“reads flat”", 16, RED, "end", 600)
    T(xm, 120, "9 Jul: the miss", 16, RED, "middle", 600)

    # axis
    AY = 410
    L(X0, AY, X1, AY, INK3, 1)
    day = t0
    while day <= t1:
        if day.weekday() == 0:
            xx = x(day.isoformat()); L(xx, AY - 4, xx, AY + 4, INK3, 1)
            T(xx, AY + 22, f"{day.day} {day.strftime('%b')}", 14, INK3, "middle")
        day += dt.timedelta(1)

    T(40, H - 12, f"From git: the tree and log just before the fix ({d['tree']}), read {d['read_on']}.", 12, INK3)
    defs = (f'<defs><marker id="tick" markerWidth="2" markerHeight="12" refX="1" refY="6" orient="auto">'
            f'<rect width="2" height="12" fill="{INK}"/></marker></defs>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
            f'font-family="{MONO}"><rect width="{W}" height="{H}" fill="{PAPER}"/>{defs}{"".join(g)}</svg>'), (W, H)


def raster(svg_path, png_path, W, H):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    html = HERE / "_raster2.html"
    html.write_text(f'<html><body style="margin:0">{svg_path.read_text()}</body></html>')
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                    f"--window-size={W},{H}", f"--screenshot={png_path}", html.as_uri()], check=True, capture_output=True)
    html.unlink()


if __name__ == "__main__":
    if sys.argv[1:] == ["gather"]:
        gather(); sys.exit()
    d = json.loads(SRC.read_text())
    f = facts(d)
    svg, (W, H) = draw(d, f)
    (HERE / "same-miss.svg").write_text(svg)
    raster(HERE / "same-miss.svg", HERE / "same-miss.png", W, H)
    (HERE / "facts-v2.json").write_text(json.dumps(f, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps({k: f[k] for k in ("n_code_files", "n_bracket_files", "code_days", "n_messages",
                                        "days_message_to_miss", "days_bracket_to_miss", "n_page_warnings_before", "fix_time")}))
