#!/usr/bin/env python3
"""Deposit Ceremony — words wait on a branch.

One real deposit, D-2026-11-04-AUDILLUSIONS, drawn from git: the branch its words were written to, the
fixes made there, the days they waited there unchanged, and the one merge that took them to main.

Anchor (Deposit Ceremony, step 6): "Anything waiting on Loudon's read waits in a worktree of its own, on a
branch, never in a scratch folder; it merges to main after his yes."

Two steps, one script:
  python3 make.py gather   reads the commits from git into deposit-record.json (done once; kept here)
  python3 make.py          checks the record against git again, then draws the SVG and its PNG

Every time and count on the picture comes from deposit-record.json. Pinned: the merge f91572e2 and its
branch (4bee43f9..47a76840), all in the palace's history. The fix counts are counted two ways: from the
numbering in each commit's own body, and from git's numstat (lines changed); the script stops if a body's
numbering is not the run 1..N with no gaps. No randomness: nothing to seed.
"""
import json, os, re, subprocess, sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
RECORD = os.path.join(HERE, "deposit-record.json")
NAME = "Deposit Ceremony — words wait on a branch"

MERGE = "f91572e2"
BRANCH = ["4bee43f9", "c5dc144a", "fab93999", "bd90c3bf", "47a76840"]     # oldest first
BASE = "f9228120"                                                         # the branch's parent on main
# The three other deposits run under v2.9 (the tuning ledger's run lines), for lines.md's "typical or chosen".
OTHERS = {
    "D-2026-11-05-LTCSPEED": {"commits": ["a4cdd3b1"], "landing": "a4cdd3b1"},
    "D-2026-11-09-DSPLOOP": {"commits": ["d659e922"], "landing": "a43b2e2c"},
    "D-2026-11-15-OBSIDIAN-RETIRED": {"commits": ["1ab3271c"], "landing": "4f475baf"},
}

PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""


def git(*a):
    return subprocess.run(["git", "-C", ROOT, *a], capture_output=True, text=True, check=True).stdout


def commit(h):
    body = git("show", "-s", "--format=%B", h)
    when = git("show", "-s", "--format=%aI", h).strip()
    parents = git("show", "-s", "--format=%p", h).split()
    verify = re.findall(r"^Palace-Verify: (\S+)", body, re.M)
    ns = [l.split("\t") for l in git("show", "--numstat", "--format=", h).splitlines() if l.strip()]
    added = sum(int(a) for a, _, _ in ns if a.isdigit()); removed = sum(int(r) for _, r, _ in ns if r.isdigit())
    return {"hash": h, "when": when, "parents": parents, "subject": body.splitlines()[0], "body": body,
            "verify": verify[0] if verify else None, "lines_added": added, "lines_removed": removed, "files": len(ns)}


def fixes(c):
    """How many fixes a commit's own body names, read from its numbering, its bullets or its words."""
    b = c["body"]
    nums = sorted({int(n) for grp in re.findall(r"\((\d+(?:,\s*\d+)*)\)", b) for n in re.split(r",\s*", grp)})
    if nums:
        if nums != list(range(1, len(nums) + 1)): sys.exit(f"{c['hash']}: numbering is not 1..N: {nums}")
        return len(nums), "the body's numbering (1)..(%d)" % len(nums)
    bullets = [l for l in b.splitlines() if l.startswith("- ")]
    if bullets: return len(bullets), "the body's %d bullets" % len(bullets)
    if "The repeat flagged after the second read" in b: return 1, "the body names one repeat cut"
    return 0, "none named"


def gather():
    br = [commit(h) for h in BRANCH]
    on_branch = git("rev-list", f"{MERGE}^1..{BRANCH[-1]}").split()
    if sorted(x[:8] for x in on_branch) != sorted(BRANCH): sys.exit(f"branch is not the five: {on_branch}")
    for a, b in zip(BRANCH, BRANCH[1:]):
        if commit(b)["parents"][0][:8] != a: sys.exit(f"{b} does not follow {a}")
    m = commit(MERGE)
    if BRANCH[-1] not in [p[:8] for p in m["parents"]]: sys.exit("the merge does not take the branch")
    for c in br: c["fixes"], c["fixes_counted_from"] = fixes(c)
    others = {}
    for k, v in OTHERS.items():
        cs = [commit(h) for h in v["commits"]]; land = commit(v["landing"])
        others[k] = {"first": cs[0]["when"], "first_subject": cs[0]["subject"], "landing": land["when"],
                     "landing_subject": land["subject"], "landing_kind": re.findall(r"^Palace-Kind: (\S+)", land["body"], re.M)}
    rec = {"source": f"git, the palace's history: merge {MERGE}, its branch {BRANCH[0]}..{BRANCH[-1]}, base {BASE}",
           "base": commit(BASE), "branch": br, "merge": m, "others_under_v2_9": others}
    json.dump(rec, open(RECORD, "w"), indent=1, ensure_ascii=False)
    print("wrote", RECORD)


def check(rec):
    """The kept record must still match git; the picture is drawn only from the record."""
    for c in rec["branch"] + [rec["merge"], rec["base"]]:
        g = commit(c["hash"])
        for k in ("when", "body", "lines_added", "lines_removed", "verify"):
            if g[k] != c[k]: sys.exit(f"record and git disagree on {c['hash']} {k}")


def t(s): return datetime.fromisoformat(s)


def dur(a, b):
    s = int((t(b) - t(a)).total_seconds()); d, s = divmod(s, 86400); h, s = divmod(s, 3600); m, s = divmod(s, 60)
    return d, h, m, s


def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def draw(rec):
    br, m, base = rec["branch"], rec["merge"], rec["base"]
    W, H = 1000, 500
    yb, ym = 245, 375                                   # branch lane, main lane
    # panel A: 4 Nov 08:47:30 to 09:02:30 · panel B: 8 Nov 07:51:30 to 07:54
    A0, AX0, AX1 = t(br[0]["when"]).replace(hour=8, minute=47, second=30), 130, 470
    A1 = A0.replace(hour=9, minute=2)
    B0, BX0, BX1 = t(m["when"]).replace(minute=51, second=30), 790, 960
    B1 = B0.replace(minute=54, second=0)
    xa = lambda s: AX0 + (t(s) - A0).total_seconds() / (A1 - A0).total_seconds() * (AX1 - AX0)
    xb = lambda s: BX0 + (t(s) - B0).total_seconds() / (B1 - B0).total_seconds() * (BX1 - BX0)
    for c in br[:4]:
        assert AX0 < xa(c["when"]) < AX1, c["hash"]
    assert BX0 < xb(br[4]["when"]) < BX1 and BX0 < xb(m["when"]) < BX1
    GAP0, GAP1 = AX1 + 16, BX0 - 16

    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" {FONT}>',
         f'<rect width="{W}" height="{H}" fill="{PAPER}"/>']
    tx = lambda x, y, s, size=15, fill=INK2, anchor="start", weight="normal", style="normal": o.append(
        f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" font-style="{style}">{esc(s)}</text>')
    ln = lambda x1, y1, x2, y2, c=INK, w=2, dash=None: o.append(
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else "") + '/>')

    tx(40, 44, "ONE DEPOSIT, FROM ITS COMMITS", 15, INK3, weight="bold")
    tx(40, 72, "Words fixed on a branch in minutes, then waiting there to be read whole", 21, INK, weight="bold")

    # lane names
    tx(40, yb + 5, "branch", 15, INK3); tx(40, ym + 5, "main", 15, INK3)

    # main lane, broken at the gap
    x0 = xa(br[0]["when"]); xf = x0 - 45              # the fork: where on main is not drawn to time
    ln(xf - 8, ym, AX1, ym, INK3, 2); ln(BX0, ym, BX1 + 12, ym, INK3, 2)
    # branch lane: from the fork to the merge; dashed through the gap (nothing changes there)
    o.append(f'<path d="M{xf:.1f},{ym} C{xf:.1f},{yb + 40} {x0 - 14:.1f},{yb} {x0:.1f},{yb}" fill="none" stroke="{INK}" stroke-width="2"/>')
    ln(x0, yb, AX1, yb, INK, 2); ln(BX0, yb, xb(br[4]["when"]), yb, INK, 2)
    ln(GAP0, yb, GAP1, yb, INK, 2, "2 7")
    # break marks on both lanes
    for x in (AX1 + 6, BX0 - 6):
        for y in (yb, ym):
            ln(x - 5, y + 9, x + 5, y - 9, INK3, 1.5)

    # branch commits on 4 Nov: one dot each, labels staggered above
    labels = [("written: %d lines" % (br[0]["lines_added"]), 118),
              ("%d factual fixes" % br[1]["fixes"], 143),
              ("cold read: %d fixes" % br[2]["fixes"], 168),
              ("second read: %d fixes" % br[3]["fixes"], 193)]
    for c, (lab, ly) in zip(br[:4], labels):
        x = xa(c["when"])
        ln(x, ly + 8, x, yb - 9, RULE, 1)
        o.append(f'<circle cx="{x:.1f}" cy="{yb}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="2.5"/>')
        tx(x - 8, ly, lab, 15, INK, "start")
        if c is not br[1]: tx(x, yb + 30, t(c["when"]).strftime("%H:%M"), 13, INK3, "middle")   # 08:50 sits on 08:48
    d0 = dur(br[0]["when"], br[3]["when"])
    tx((AX0 + AX1) / 2 + 10, yb + 56, f"4 Nov · {d0[2]} minutes, first to last", 14, INK3, "middle")
    tx((AX0 + AX1) / 2 + 10, yb + 76, "verify state, each: unverified", 14, INK3, "middle")

    # the gap
    g = dur(br[3]["when"], br[4]["when"])
    cx = (GAP0 + GAP1) / 2
    tx(cx, yb + 46, f"{g[0]} days {g[1]} h", 30, INK, "middle", "bold")
    tx(cx, yb + 72, "on the branch, no new commit", 15, INK2, "middle")
    tx(cx, yb + 98, "When the words were put in front", 13, INK3, "middle", style="italic")
    tx(cx, yb + 116, "of their reader is not in the record.", 13, INK3, "middle", style="italic")

    # 8 Nov: one more fix on the branch, then the merge to main
    x4, xm = xb(br[4]["when"]), xb(m["when"])
    o.append(f'<circle cx="{x4:.1f}" cy="{yb}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="2.5"/>')
    ln(x4, 176, x4, yb - 9, RULE, 1)
    tx(x4, 168, "%d fix, flagged on 4 Nov" % br[4]["fixes"], 15, INK, "middle")   # the second read's repeat (47a76840's body)
    tx(x4 - 4, yb + 30, t(br[4]["when"]).strftime("%H:%M"), 13, INK3, "end")
    o.append(f'<path d="M{x4:.1f},{yb} C{x4 + 4:.1f},{yb + 60} {xm:.1f},{ym - 60} {xm:.1f},{ym}" fill="none" stroke="{RED}" stroke-width="2.5"/>')
    o.append(f'<circle cx="{xm:.1f}" cy="{ym}" r="8" fill="{RED}"/>')
    R = W - 30
    tx(R, ym + 28, "merged, 8 Nov " + t(m["when"]).strftime("%H:%M") + ", verify state: verified", 14, INK, "end")
    tx(R, ym + 56, "the merge's message:", 14, RED, "end")
    tx(R, ym + 74, "“read every word … (‘Read it, land it’)”", 14, RED, "end")

    tx(40, H - 18, f"Source: git, merge {m['hash']} and its five branch commits. Times are commit times, not when a read began.", 13, INK3)
    o.append("</svg>")
    return "\n".join(o), W, H


def raster(svg_path, png_path, W, H, scale=2):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    html = os.path.join(HERE, "_raster.html")
    open(html, "w").write(f'<html><body style="margin:0;background:{PAPER}"><img src="{os.path.basename(svg_path)}" '
                          f'style="width:{W}px;height:{H}px;display:block"></body></html>')
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--force-device-scale-factor={scale}",
                    f"--window-size={W},{H}", f"--screenshot={png_path}", "file://" + html], check=True, capture_output=True)
    os.unlink(html)


if __name__ == "__main__":
    if sys.argv[1:] == ["gather"]:
        gather(); sys.exit()
    rec = json.load(open(RECORD)); check(rec)
    svg, W, H = draw(rec)
    sp, pp = os.path.join(HERE, NAME + ".svg"), os.path.join(HERE, NAME + ".png")
    open(sp, "w").write(svg); raster(sp, pp, W, H)
    print(sp); print(pp)
